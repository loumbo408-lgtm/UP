-- =============================================================================
--  UP — Conciergerie privée & accompagnement social (Gabon)
--  Couche de données Supabase / PostgreSQL
-- -----------------------------------------------------------------------------
--  Appliquer :
--    • copier ce fichier dans supabase/migrations/<timestamp>_init.sql
--      puis `supabase db reset`  (schema + seed.sql)
--    • ou en direct : psql "$DATABASE_URL" -f supabase/schema.sql
--  Script idempotent : les DROP ... IF EXISTS en tête permettent de le rejouer.
-- =============================================================================

set client_encoding = 'UTF8';

-- =============================================================================
--  0. NETTOYAGE (rejouabilité)
-- =============================================================================
drop trigger if exists on_auth_user_created on auth.users;

drop table if exists public.escrow_transactions cascade;
drop table if exists public.missions            cascade;
drop table if exists public.companion_details   cascade;
drop table if exists public.profiles            cascade;

drop function if exists public.handle_new_user()                     cascade;
drop function if exists public.handle_updated_at()                   cascade;
drop function if exists public.current_app_role()                    cascade;
drop function if exists public.is_admin()                            cascade;
drop function if exists public.is_verified_companion(uuid)           cascade;
drop function if exists public.is_mission_party(uuid)                cascade;
drop function if exists public.guard_profile_privileged_columns()    cascade;
drop function if exists public.guard_mission_financials()            cascade;
drop function if exists public.ensure_companion_role()               cascade;

drop type if exists public.escrow_status     cascade;
drop type if exists public.payment_operator  cascade;
drop type if exists public.mission_type      cascade;
drop type if exists public.mission_status    cascade;
drop type if exists public.kyc_status        cascade;
drop type if exists public.user_role         cascade;

-- =============================================================================
--  1. TYPES ÉNUMÉRÉS
-- =============================================================================
create type public.user_role        as enum ('client', 'companion', 'admin');
create type public.kyc_status        as enum ('pending', 'verified', 'rejected');

create type public.mission_status    as enum (
  'requested', 'accepted', 'escrow_funded', 'in_progress',
  'completed', 'cancelled', 'disputed'
);

-- mission_type : ajuster librement à mesure que le catalogue de prestations grandit.
create type public.mission_type      as enum (
  'event_hostess', 'vip_welcome', 'dinner_companion', 'city_tour',
  'business_assistant', 'translation', 'other'
);

create type public.payment_operator  as enum ('airtel_money', 'moov_money');
create type public.escrow_status     as enum (
  'held', 'released_to_companion', 'refunded_to_client'
);

-- =============================================================================
--  2. TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
--  profiles — 1:1 avec auth.users
-- -----------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        public.user_role not null default 'client',
  phone       text unique,
  full_name   text,
  avatar_url  text,
  id_card_url text,
  kyc_status  public.kyc_status not null default 'pending',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint profiles_phone_format
    check (phone is null or phone ~ '^\+?[0-9][0-9 ]{5,19}$')
);

create index profiles_role_kyc_idx on public.profiles (role, kyc_status);

comment on table  public.profiles is
  'Profil applicatif lié 1:1 à auth.users (client, prestataire ou admin).';
comment on column public.profiles.kyc_status is
  'Vérification d''identité. Un prestataire n''est visible des clients qu''une fois "verified".';
comment on column public.profiles.id_card_url is
  'Chemin de la pièce d''identité dans un bucket Storage privé (KYC).';

-- -----------------------------------------------------------------------------
--  companion_details — fiche prestataire (1:1 avec un profile de rôle companion)
-- -----------------------------------------------------------------------------
create table public.companion_details (
  companion_id     uuid primary key references public.profiles (id) on delete cascade,
  bio              text,
  education_level  text,
  languages        text[] not null default '{}',
  services_offered text[] not null default '{}',
  hourly_rate_xaf  integer not null default 0 check (hourly_rate_xaf  >= 0),
  evening_rate_xaf integer not null default 0 check (evening_rate_xaf >= 0),
  zone_preference  text,
  is_online        boolean not null default false,
  rating_avg       numeric(3, 2) not null default 0 check (rating_avg between 0 and 5),
  rating_count     integer not null default 0 check (rating_count >= 0),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index companion_details_is_online_idx on public.companion_details (is_online);
create index companion_details_zone_idx      on public.companion_details (zone_preference);
create index companion_details_services_gin  on public.companion_details using gin (services_offered);
create index companion_details_languages_gin on public.companion_details using gin (languages);

comment on column public.companion_details.zone_preference is
  'Zone d''intervention principale à Libreville (Akanda, Louis, Sablière, Glass, Batterie IV, Oloumi, ...).';
comment on column public.companion_details.hourly_rate_xaf is 'Tarif horaire en FCFA (XAF).';

-- -----------------------------------------------------------------------------
--  missions — demande de prestation entre un client et un prestataire
-- -----------------------------------------------------------------------------
create table public.missions (
  id                  uuid primary key default gen_random_uuid(),
  client_id           uuid not null references public.profiles (id) on delete cascade,
  companion_id        uuid not null references public.profiles (id) on delete cascade,
  scheduled_at        timestamptz not null,
  duration_hours      numeric(4, 1) not null check (duration_hours > 0),
  location_name       text,
  location_address    text,
  mission_type        public.mission_type not null default 'other',
  escrow_amount_xaf   integer not null default 0 check (escrow_amount_xaf >= 0),
  platform_fee_xaf    integer not null default 0 check (platform_fee_xaf  >= 0),
  status              public.mission_status not null default 'requested',
  accepted_at         timestamptz,
  completed_at        timestamptz,
  cancellation_reason text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint missions_distinct_parties check (client_id <> companion_id)
);

create index missions_client_idx       on public.missions (client_id);
create index missions_companion_idx    on public.missions (companion_id);
create index missions_status_idx       on public.missions (status);
create index missions_scheduled_at_idx on public.missions (scheduled_at);

comment on column public.missions.escrow_amount_xaf is
  'Montant séquestré (FCFA). Détail financier : lisible uniquement par les parties et les admins (RLS).';
comment on column public.missions.platform_fee_xaf is
  'Commission plateforme (FCFA). Modifiable uniquement par un admin / le backend paiement.';

-- -----------------------------------------------------------------------------
--  escrow_transactions — mouvements de séquestre Mobile Money
-- -----------------------------------------------------------------------------
create table public.escrow_transactions (
  id               uuid primary key default gen_random_uuid(),
  mission_id       uuid not null references public.missions (id) on delete cascade,
  payment_operator public.payment_operator not null,
  transaction_ref  text not null unique,
  amount_xaf       integer not null default 0 check (amount_xaf >= 0),
  status           public.escrow_status not null default 'held',
  held_at          timestamptz not null default now(),
  settled_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index escrow_transactions_mission_idx on public.escrow_transactions (mission_id);
create index escrow_transactions_status_idx  on public.escrow_transactions (status);

comment on table public.escrow_transactions is
  'Séquestre Airtel Money / Moov Money. Lecture réservée aux parties de la mission et aux admins.';

-- =============================================================================
--  3. FONCTIONS
--     security definer + search_path='' : contexte de confiance, refs qualifiées.
-- =============================================================================

-- Horodatage updated_at
create function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Rôle applicatif de l'utilisateur courant
create function public.current_app_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- L'utilisateur courant est-il admin ?
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Le profil ciblé est-il un prestataire vérifié (donc visible des clients) ?
create function public.is_verified_companion(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = p_profile_id
      and role = 'companion'
      and kyc_status = 'verified'
  );
$$;

-- L'utilisateur courant est-il partie prenante de cette mission ?
create function public.is_mission_party(p_mission_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.missions
    where id = p_mission_id
      and (client_id = auth.uid() or companion_id = auth.uid())
  );
$$;

-- Verrou : seul un admin (ou un contexte serveur de confiance) peut changer role / kyc_status
create function public.guard_profile_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Pas de JWT (service_role, migration, seed) OU admin authentifié : autorisé
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'Seul un administrateur peut modifier profiles.role';
  end if;
  if new.kyc_status is distinct from old.kyc_status then
    raise exception 'Seul un administrateur peut modifier profiles.kyc_status';
  end if;

  return new;
end;
$$;

-- Verrou : montants financiers d'une mission non modifiables par le client / prestataire
create function public.guard_mission_financials()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if new.escrow_amount_xaf is distinct from old.escrow_amount_xaf
     or new.platform_fee_xaf is distinct from old.platform_fee_xaf then
    raise exception
      'Les montants (escrow_amount_xaf / platform_fee_xaf) ne sont modifiables que par un admin ou le backend paiement';
  end if;

  return new;
end;
$$;

-- Intégrité : companion_details ne peut cibler qu'un profil de rôle "companion"
create function public.ensure_companion_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.profiles
    where id = new.companion_id and role = 'companion'
  ) then
    raise exception
      'companion_details.companion_id (%) doit référencer un profil de rôle "companion"', new.companion_id;
  end if;
  return new;
end;
$$;

-- Création automatique du profil à l'inscription (lit raw_user_meta_data)
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role, full_name, phone, avatar_url)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'client'),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- =============================================================================
--  4. TRIGGERS
-- =============================================================================
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger profiles_guard_privileged
  before update on public.profiles
  for each row execute function public.guard_profile_privileged_columns();

create trigger companion_details_set_updated_at
  before update on public.companion_details
  for each row execute function public.handle_updated_at();

create trigger companion_details_ensure_role
  before insert or update on public.companion_details
  for each row execute function public.ensure_companion_role();

create trigger missions_set_updated_at
  before update on public.missions
  for each row execute function public.handle_updated_at();

create trigger missions_guard_financials
  before update on public.missions
  for each row execute function public.guard_mission_financials();

create trigger escrow_set_updated_at
  before update on public.escrow_transactions
  for each row execute function public.handle_updated_at();

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
--  5. PRIVILÈGES
--     RLS activée + policies ci-dessous. service_role (backend) contourne la RLS.
-- =============================================================================
grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on
  public.profiles,
  public.companion_details,
  public.missions,
  public.escrow_transactions
to authenticated;

grant all privileges on
  public.profiles,
  public.companion_details,
  public.missions,
  public.escrow_transactions
to service_role;

revoke execute on all functions in schema public from public;
grant execute on function
  public.current_app_role(),
  public.is_admin(),
  public.is_verified_companion(uuid),
  public.is_mission_party(uuid)
to anon, authenticated, service_role;

-- anon : aucun accès aux tables (l'application exige l'authentification).

-- =============================================================================
--  6. ROW LEVEL SECURITY
-- =============================================================================

-- -----------------------------------------------------------------------------
--  profiles
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles_select_self"
  on public.profiles for select to authenticated
  using (id = auth.uid());

-- >>> Exigence : un prestataire n'est visible des clients que si kyc_status = 'verified'
create policy "profiles_select_verified_companion"
  on public.profiles for select to authenticated
  using (role = 'companion' and kyc_status = 'verified');

create policy "profiles_select_admin"
  on public.profiles for select to authenticated
  using (public.is_admin());

create policy "profiles_insert_self"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

-- Mise à jour de sa propre ligne (role / kyc_status verrouillés par trigger)
create policy "profiles_update_self"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_update_admin"
  on public.profiles for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "profiles_delete_admin"
  on public.profiles for delete to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
--  companion_details  (visibilité alignée sur la vérification KYC du prestataire)
-- -----------------------------------------------------------------------------
alter table public.companion_details enable row level security;

create policy "companion_details_select_verified"
  on public.companion_details for select to authenticated
  using (public.is_verified_companion(companion_id));

create policy "companion_details_select_self"
  on public.companion_details for select to authenticated
  using (companion_id = auth.uid());

create policy "companion_details_select_admin"
  on public.companion_details for select to authenticated
  using (public.is_admin());

create policy "companion_details_insert_self"
  on public.companion_details for insert to authenticated
  with check (companion_id = auth.uid());

create policy "companion_details_update_self"
  on public.companion_details for update to authenticated
  using (companion_id = auth.uid())
  with check (companion_id = auth.uid());

create policy "companion_details_update_admin"
  on public.companion_details for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "companion_details_delete_admin"
  on public.companion_details for delete to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
--  missions
--  >>> Exigence : seuls les admins et les parties concernées lisent une mission
--      (et donc ses détails financiers escrow_amount_xaf / platform_fee_xaf).
-- -----------------------------------------------------------------------------
alter table public.missions enable row level security;

create policy "missions_select_party"
  on public.missions for select to authenticated
  using (
    client_id = auth.uid()
    or companion_id = auth.uid()
    or public.is_admin()
  );

-- Un client crée une mission pour lui-même
create policy "missions_insert_client"
  on public.missions for insert to authenticated
  with check (
    client_id = auth.uid()
    and public.current_app_role() = 'client'
  );

-- Parties concernées + admin (transitions & argent contrôlés par trigger)
create policy "missions_update_party"
  on public.missions for update to authenticated
  using (
    client_id = auth.uid()
    or companion_id = auth.uid()
    or public.is_admin()
  )
  with check (
    client_id = auth.uid()
    or companion_id = auth.uid()
    or public.is_admin()
  );

create policy "missions_delete_admin"
  on public.missions for delete to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
--  escrow_transactions
--  >>> Exigence : détails financiers réservés aux admins et aux parties.
-- -----------------------------------------------------------------------------
alter table public.escrow_transactions enable row level security;

create policy "escrow_select_party_or_admin"
  on public.escrow_transactions for select to authenticated
  using (
    public.is_admin()
    or public.is_mission_party(mission_id)
  );

-- Écriture réservée aux admins ; le backend paiement utilise la clé service_role.
create policy "escrow_insert_admin"
  on public.escrow_transactions for insert to authenticated
  with check (public.is_admin());

create policy "escrow_update_admin"
  on public.escrow_transactions for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "escrow_delete_admin"
  on public.escrow_transactions for delete to authenticated
  using (public.is_admin());

-- =============================================================================
--  Fin du schéma.
-- =============================================================================
