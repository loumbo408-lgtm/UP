-- =====================================================================
-- UP — Migration 0002 : Row Level Security.
-- Principe : cloisonnement strict des trois roles. Un client ne voit
-- jamais les données d'un autre client, un companion ne voit que ses
-- missions, l'admin arbitre. Les mouvements d'argent ne sont jamais
-- ecrits directement par un utilisateur : ils passent par les fonctions
-- security definer de la migration 0003.
-- =====================================================================

alter table public.profiles            enable row level security;
alter table public.companion_profiles  enable row level security;
alter table public.venues              enable row level security;
alter table public.bookings            enable row level security;
alter table public.escrow_transactions enable row level security;
alter table public.payments            enable row level security;
alter table public.payouts             enable row level security;
alter table public.messages            enable row level security;
alter table public.reviews             enable row level security;
alter table public.admin_actions       enable row level security;

-- ---------------------------------------------------------------------
-- Helpers. security definer + search_path fige : ils lisent profiles
-- sans repasser par RLS, ce qui evite la recursion infinie des policies.
-- ---------------------------------------------------------------------

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

-- Un participant à la mission : le client OU le companion concerne.
create or replace function public.is_booking_party(p_booking_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.bookings b
    where b.id = p_booking_id
      and (b.client_id = auth.uid() or b.companion_id = auth.uid())
  );
$$;

revoke execute on function public.current_app_role() from public;
revoke execute on function public.is_admin() from public;
revoke execute on function public.is_booking_party(uuid) from public;
grant execute on function public.current_app_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_booking_party(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------

create policy "profiles: lecture de soi" on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy "profiles: admin lit tout" on public.profiles
  for select to authenticated
  using (public.is_admin());

-- Un client voit l'identité d'un companion seulement s'ils ont une mission
-- en commun ; en dehors de ca, seule la fiche publique (companion_profiles)
-- est visible.
create policy "profiles: contrepartie d'une mission" on public.profiles
  for select to authenticated
  using (
    exists (
      select 1 from public.bookings b
      where (b.client_id = auth.uid() and b.companion_id = profiles.id)
         or (b.companion_id = auth.uid() and b.client_id = profiles.id)
    )
  );

create policy "profiles: mise à jour de soi" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles: admin met à jour" on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------
-- companion_profiles : vitrine lisible par les clients connectes,
-- uniquement pour les profils vérifiés et actifs.
-- ---------------------------------------------------------------------

create policy "companions: vitrine vérifiée" on public.companion_profiles
  for select to authenticated
  using (verification_status = 'approved');

create policy "companions: lecture de sa fiche" on public.companion_profiles
  for select to authenticated
  using (id = auth.uid());

create policy "companions: admin lit tout" on public.companion_profiles
  for select to authenticated
  using (public.is_admin());

create policy "companions: edite sa fiche" on public.companion_profiles
  for update to authenticated
  using (id = auth.uid() and public.current_app_role() = 'companion')
  with check (id = auth.uid());

create policy "companions: admin edite" on public.companion_profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------
-- venues : catalogue public approuvé. Personne ne créé de lieu depuis
-- l'app cliente ; seul un admin ajoute un établissement au répertoire.
-- ---------------------------------------------------------------------

create policy "venues: catalogue approuvé" on public.venues
  for select to authenticated
  using (is_approved = true and is_public = true);

create policy "venues: admin lit tout" on public.venues
  for select to authenticated
  using (public.is_admin());

create policy "venues: admin ecrit" on public.venues
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin() and is_public = true);

-- ---------------------------------------------------------------------
-- bookings : lecture par les deux parties, ecriture via RPC uniquement.
-- ---------------------------------------------------------------------

create policy "bookings: parties concernees" on public.bookings
  for select to authenticated
  using (client_id = auth.uid() or companion_id = auth.uid());

create policy "bookings: admin lit tout" on public.bookings
  for select to authenticated
  using (public.is_admin());

-- Pas de policy insert/update/delete : les transitions d'état passent
-- exclusivement par les fonctions security definer (migration 0003).

-- ---------------------------------------------------------------------
-- escrow_transactions : lisible par les parties, jamais ecrit par elles.
-- ---------------------------------------------------------------------

create policy "escrow: parties de la mission" on public.escrow_transactions
  for select to authenticated
  using (public.is_booking_party(booking_id));

create policy "escrow: admin lit tout" on public.escrow_transactions
  for select to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- payments : le payeur voit ses paiements. L'ecriture vient du backend
-- (service role, hors RLS) vià la passerelle Mobile Money.
-- ---------------------------------------------------------------------

create policy "payments: le payeur" on public.payments
  for select to authenticated
  using (payer_id = auth.uid());

create policy "payments: admin lit tout" on public.payments
  for select to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- payouts : le companion voit ses reversements.
-- ---------------------------------------------------------------------

create policy "payouts: le beneficiaire" on public.payouts
  for select to authenticated
  using (companion_id = auth.uid());

create policy "payouts: admin lit tout" on public.payouts
  for select to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- messages : conversation cloisonnee à une mission active.
-- ---------------------------------------------------------------------

create policy "messages: parties de la mission" on public.messages
  for select to authenticated
  using (public.is_booking_party(booking_id));

create policy "messages: admin lit tout" on public.messages
  for select to authenticated
  using (public.is_admin());

create policy "messages: envoi par une partie" on public.messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and public.is_booking_party(booking_id)
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and b.status in ('accepted', 'confirmed', 'in_progress', 'completed')
    )
  );

create policy "messages: marquage lu" on public.messages
  for update to authenticated
  using (public.is_booking_party(booking_id) and sender_id <> auth.uid())
  with check (public.is_booking_party(booking_id));

-- ---------------------------------------------------------------------
-- reviews : visibles de tous les connectes (elles alimentent la vitrine),
-- ecrites une seule fois par une partie après la fin de la mission.
-- ---------------------------------------------------------------------

create policy "reviews: lecture" on public.reviews
  for select to authenticated
  using (true);

create policy "reviews: après mission terminée" on public.reviews
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and public.is_booking_party(booking_id)
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and b.status in ('completed', 'released')
        and (b.client_id = auth.uid() or b.companion_id = auth.uid())
        and target_id in (b.client_id, b.companion_id)
    )
  );

-- ---------------------------------------------------------------------
-- admin_actions : journal reserve aux admins.
-- ---------------------------------------------------------------------

create policy "audit: admin seulement" on public.admin_actions
  for select to authenticated
  using (public.is_admin());
