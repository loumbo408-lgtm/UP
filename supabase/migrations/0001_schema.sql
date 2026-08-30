-- =====================================================================
-- UP — Conciergerie privee (Gabon)
-- Migration 0001 : types, tables, contraintes, index, triggers.
-- Devise unique : FCFA (XAF), stockee en entiers (pas de centimes en XAF).
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------

-- Trois roles hermétiques. Un compte a exactement un role, fixe à la création.
create type public.app_role as enum ('client', 'companion', 'admin');

create type public.verification_status as enum ('pending', 'approved', 'rejected');

-- Cycle de vie d'une réservation. Le passage a 'confirmed' exige un séquestre finance.
create type public.booking_status as enum (
  'pending',      -- demande envoyée, en attente de réponse du companion
  'accepted',     -- acceptée par le companion, en attente de paiement
  'confirmed',    -- payee, fonds bloqués en séquestre
  'in_progress',  -- mission démarrée (check-in sur le lieu)
  'completed',    -- mission terminée, en attente de libération des fonds
  'released',     -- fonds libérés au companion : état terminal nominal
  'cancelled',    -- annulée avant paiement
  'refunded',     -- annulée après paiement, fonds rendus au client
  'disputed'      -- litige, arbitrage admin requis
);

-- Le séquestre est obligatoire : aucun transfert direct client -> companion.
create type public.escrow_status as enum ('held', 'released', 'refunded', 'disputed');

create type public.payment_provider as enum ('airtel_money', 'moov_money');

create type public.payment_status as enum ('pending', 'processing', 'succeeded', 'failed', 'cancelled');

create type public.payout_status as enum ('pending', 'processing', 'paid', 'failed');

-- Uniquement des espaces publics répertoriés.
create type public.venue_category as enum ('restaurant', 'salon', 'événement', 'hotel_lounge', 'cafe', 'culture');

-- ---------------------------------------------------------------------
-- profiles : 1-1 avec auth.users, porte le role
-- ---------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  role         public.app_role not null default 'client',
  full_name    text not null check (char_length(full_name) between 2 and 80),
  phone        text unique check (phone ~ '^\+241[0-9]{7,9}$'),
  avatar_url   text,
  city         text not null default 'Libreville',
  is_active    boolean not null default true,
  is_suspended boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on column public.profiles.phone is 'Numéro Gabon au format E.164 (+241...), sert aussi au Mobile Money.';

-- ---------------------------------------------------------------------
-- companion_profiles : données métier du role companion uniquement
-- ---------------------------------------------------------------------
create table public.companion_profiles (
  id                  uuid primary key references public.profiles (id) on delete cascade,
  display_name        text not null check (char_length(display_name) between 2 and 40),
  headline            text check (char_length(headline) <= 120),
  bio                 text check (char_length(bio) <= 1200),
  languages           text[] not null default '{français}',
  interests           text[] not null default '{}',
  hourly_rate_xaf     integer not null check (hourly_rate_xaf between 5000 and 500000),
  photos              text[] not null default '{}',
  verification_status public.verification_status not null default 'pending',
  verified_at         timestamptz,
  id_document_path    text, -- Storage prive, lisible par les admins uniquement
  rating_avg          numeric(3, 2) not null default 0 check (rating_avg between 0 and 5),
  rating_count        integer not null default 0 check (rating_count >= 0),
  missions_completed  integer not null default 0 check (missions_completed >= 0),
  is_available        boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- venues : lieux publics répertoriés. Une réservation ne peut pointer
-- que vers un lieu approuvé : pas de rendez-vous en domicile prive.
-- ---------------------------------------------------------------------
create table public.venues (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    public.venue_category not null,
  address     text not null,
  district    text,
  city        text not null default 'Libreville',
  latitude    numeric(9, 6),
  longitude   numeric(9, 6),
  photo_url   text,
  -- Verrou métier : la colonne existe pour rendre la regle explicite et
  -- interdite à la violation (contrainte ci-dessous), pas pour être modulee.
  is_public   boolean not null default true,
  is_approved boolean not null default false,
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  constraint venues_public_only check (is_public = true)
);

create unique index venues_unique_name_city on public.venues (lower(name), lower(city));

-- ---------------------------------------------------------------------
-- bookings : la mission
-- ---------------------------------------------------------------------
create table public.bookings (
  id               uuid primary key default gen_random_uuid(),
  reference        text not null unique default 'UP-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 8)),
  client_id        uuid not null references public.profiles (id) on delete restrict,
  companion_id     uuid not null references public.companion_profiles (id) on delete restrict,
  venue_id         uuid not null references public.venues (id) on delete restrict,
  status           public.booking_status not null default 'pending',
  starts_at        timestamptz not null,
  duration_hours   integer not null check (duration_hours between 1 and 12),
  hourly_rate_xaf  integer not null check (hourly_rate_xaf > 0), -- fige le tarif au moment de la demande
  subtotal_xaf     integer not null check (subtotal_xaf > 0),
  service_fee_xaf  integer not null check (service_fee_xaf >= 0),
  total_xaf        integer not null check (total_xaf > 0),
  client_note      text check (char_length(client_note) <= 500),
  cancel_reason    text,
  started_at       timestamptz,
  completed_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint bookings_client_not_companion check (client_id <> companion_id),
  constraint bookings_totals_coherent check (
    subtotal_xaf = hourly_rate_xaf * duration_hours
    and total_xaf = subtotal_xaf + service_fee_xaf
  )
);

create index bookings_client_idx on public.bookings (client_id, created_at desc);
create index bookings_companion_idx on public.bookings (companion_id, created_at desc);
create index bookings_status_idx on public.bookings (status);

-- ---------------------------------------------------------------------
-- escrow_transactions : séquestre obligatoire, 1 par réservation
-- ---------------------------------------------------------------------
create table public.escrow_transactions (
  id                  uuid primary key default gen_random_uuid(),
  booking_id          uuid not null unique references public.bookings (id) on delete restrict,
  amount_xaf          integer not null check (amount_xaf > 0),
  platform_fee_xaf    integer not null check (platform_fee_xaf >= 0),
  companion_payout_xaf integer not null check (companion_payout_xaf > 0),
  status              public.escrow_status not null default 'held',
  held_at             timestamptz not null default now(),
  released_at         timestamptz,
  refunded_at         timestamptz,
  released_by         uuid references public.profiles (id) on delete set null,
  notes               text,
  constraint escrow_split_coherent check (amount_xaf = platform_fee_xaf + companion_payout_xaf),
  constraint escrow_released_has_date check (status <> 'released' or released_at is not null),
  constraint escrow_refunded_has_date check (status <> 'refunded' or refunded_at is not null)
);

-- ---------------------------------------------------------------------
-- payments : encaissement Mobile Money (entrant)
-- ---------------------------------------------------------------------
create table public.payments (
  id                 uuid primary key default gen_random_uuid(),
  booking_id         uuid not null references public.bookings (id) on delete restrict,
  payer_id           uuid not null references public.profiles (id) on delete restrict,
  provider           public.payment_provider not null,
  msisdn             text not null check (msisdn ~ '^\+241[0-9]{7,9}$'),
  amount_xaf         integer not null check (amount_xaf > 0),
  status             public.payment_status not null default 'pending',
  provider_reference text,
  idempotency_key    text not null unique,
  failure_reason     text,
  raw_callback       jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index payments_booking_idx on public.payments (booking_id);
create unique index payments_provider_reference_idx
  on public.payments (provider, provider_reference)
  where provider_reference is not null;

-- ---------------------------------------------------------------------
-- payouts : reversement au companion après libération du séquestre (sortant)
-- ---------------------------------------------------------------------
create table public.payouts (
  id                 uuid primary key default gen_random_uuid(),
  escrow_id          uuid not null unique references public.escrow_transactions (id) on delete restrict,
  companion_id       uuid not null references public.companion_profiles (id) on delete restrict,
  provider           public.payment_provider not null,
  msisdn             text not null check (msisdn ~ '^\+241[0-9]{7,9}$'),
  amount_xaf         integer not null check (amount_xaf > 0),
  status             public.payout_status not null default 'pending',
  provider_reference text,
  failure_reason     text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- messages : messagerie liee à une mission (pas de messagerie libre)
-- ---------------------------------------------------------------------
create table public.messages (
  id         uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  sender_id  uuid not null references public.profiles (id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 2000),
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create index messages_booking_idx on public.messages (booking_id, created_at);

-- ---------------------------------------------------------------------
-- reviews : une seule note par mission et par auteur
-- ---------------------------------------------------------------------
create table public.reviews (
  id         uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  author_id  uuid not null references public.profiles (id) on delete cascade,
  target_id  uuid not null references public.profiles (id) on delete cascade,
  rating     smallint not null check (rating between 1 and 5),
  comment    text check (char_length(comment) <= 600),
  created_at timestamptz not null default now(),
  unique (booking_id, author_id),
  constraint reviews_no_self check (author_id <> target_id)
);

-- ---------------------------------------------------------------------
-- admin_actions : journal d'audit des decisions admin
-- ---------------------------------------------------------------------
create table public.admin_actions (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid not null references public.profiles (id) on delete restrict,
  action      text not null,
  target_type text not null,
  target_id   uuid,
  metadata    jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create index admin_actions_created_idx on public.admin_actions (created_at desc);

-- ---------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger companion_profiles_touch before update on public.companion_profiles
  for each row execute function public.touch_updated_at();
create trigger bookings_touch before update on public.bookings
  for each row execute function public.touch_updated_at();
create trigger payments_touch before update on public.payments
  for each row execute function public.touch_updated_at();
create trigger payouts_touch before update on public.payouts
  for each row execute function public.touch_updated_at();

-- Création automatique du profil a l'inscription.
-- Le role vient des metadonnees d'inscription mais 'admin' n'est jamais
-- auto-attribuable : il se pose uniquement en base par un admin existant.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.app_role;
begin
  requested_role := coalesce(
    nullif(new.raw_user_meta_data ->> 'role', '')::public.app_role,
    'client'
  );

  if requested_role = 'admin' then
    requested_role := 'client';
  end if;

  if exists (
    select 1 from public.profiles
    where phone = nullif(new.raw_user_meta_data ->> 'phone', '')
  ) then
    raise exception 'Ce numéro de téléphone est déjà associé à un compte UP'
      using errcode = '23505';
  end if;

  insert into public.profiles (id, role, full_name, phone, city)
  values (
    new.id,
    requested_role,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'Membre UP'),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'city', ''), 'Libreville')
  );

  if requested_role = 'companion' then
    insert into public.companion_profiles (id, display_name, hourly_rate_xaf)
    values (
      new.id,
      coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'Companion UP'),
      25000
    );
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Le role d'un profil est immuable côté utilisateur : seule une fonction
-- security definer (ou un admin en SQL) peut le changer.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
as $$
begin
  if new.role <> old.role and auth.uid() = new.id then
    raise exception 'Le rôle ne peut pas être modifié par son propriétaire';
  end if;
  return new;
end;
$$;

create trigger profiles_role_lock before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- Recalcule la note moyenne du companion après chaque avis.
create or replace function public.refresh_companion_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.companion_profiles c
  set rating_avg = sub.avg_rating,
      rating_count = sub.total
  from (
    select target_id, round(avg(rating)::numeric, 2) as avg_rating, count(*)::int as total
    from public.reviews
    where target_id = new.target_id
    group by target_id
  ) sub
  where c.id = sub.target_id;
  return new;
end;
$$;

create trigger reviews_refresh_rating after insert on public.reviews
  for each row execute function public.refresh_companion_rating();
