-- =====================================================================
-- UP — Migration 0003 : machine a états de la mission et du séquestre.
--
-- Aucune table monetaire n'est ecrite directement par un utilisateur.
-- Toutes les transitions passent par ces fonctions security definer, qui
-- verifient le role de l'appelant et l'état de depart. Les transitions
-- interdites levent une exception plutot que de ne rien faire, pour que
-- l'API ne puisse pas confondre "refuse" et "déjà fait".
-- =====================================================================

-- Commission de la plateforme, en pourcentage du sous-total.
create or replace function public.up_service_fee(p_subtotal_xaf integer)
returns integer
language sql
immutable
as $$
  select greatest(500, round(p_subtotal_xaf * 0.15))::integer;
$$;

-- ---------------------------------------------------------------------
-- 1. Demande de réservation (client)
-- ---------------------------------------------------------------------
create or replace function public.request_booking(
  p_companion_id   uuid,
  p_venue_id       uuid,
  p_starts_at      timestamptz,
  p_duration_hours integer,
  p_client_note    text default null
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_companion public.companion_profiles;
  v_venue     public.venues;
  v_subtotal  integer;
  v_fee       integer;
  v_booking   public.bookings;
begin
  if public.current_app_role() <> 'client' then
    raise exception 'Seul un client peut demander une mission' using errcode = '42501';
  end if;

  if p_starts_at < now() + interval '2 hours' then
    raise exception 'Une mission doit être demandee au moins 2 heures a l''avance' using errcode = '22023';
  end if;

  select * into v_companion from public.companion_profiles where id = p_companion_id;
  if not found or v_companion.verification_status <> 'approved' or not v_companion.is_available then
    raise exception 'Ce companion n''est pas disponible' using errcode = '22023';
  end if;

  -- Verrou métier central : le lieu doit être un espace public répertorié
  -- et approuvé. Aucun rendez-vous en dehors du catalogue.
  select * into v_venue from public.venues where id = p_venue_id;
  if not found or not v_venue.is_approved or not v_venue.is_public then
    raise exception 'Le lieu doit être un espace public répertorié et approuvé' using errcode = '22023';
  end if;

  -- Pas de double réservation du même companion sur un créneau chevauchant.
  if exists (
    select 1 from public.bookings b
    where b.companion_id = p_companion_id
      and b.status in ('pending', 'accepted', 'confirmed', 'in_progress')
      and tstzrange(b.starts_at, b.starts_at + make_interval(hours => b.duration_hours))
          && tstzrange(p_starts_at, p_starts_at + make_interval(hours => p_duration_hours))
  ) then
    raise exception 'Ce créneau est déjà reserve' using errcode = '23505';
  end if;

  v_subtotal := v_companion.hourly_rate_xaf * p_duration_hours;
  v_fee := public.up_service_fee(v_subtotal);

  insert into public.bookings (
    client_id, companion_id, venue_id, starts_at, duration_hours,
    hourly_rate_xaf, subtotal_xaf, service_fee_xaf, total_xaf, client_note
  )
  values (
    auth.uid(), p_companion_id, p_venue_id, p_starts_at, p_duration_hours,
    v_companion.hourly_rate_xaf, v_subtotal, v_fee, v_subtotal + v_fee, p_client_note
  )
  returning * into v_booking;

  return v_booking;
end;
$$;

-- ---------------------------------------------------------------------
-- 2. Reponse du companion
-- ---------------------------------------------------------------------
create or replace function public.respond_to_booking(
  p_booking_id uuid,
  p_accept     boolean,
  p_reason     text default null
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings;
begin
  select * into v_booking from public.bookings where id = p_booking_id for update;
  if not found then
    raise exception 'Mission introuvable' using errcode = 'P0002';
  end if;
  if v_booking.companion_id <> auth.uid() then
    raise exception 'Seul le companion concerne peut repondre' using errcode = '42501';
  end if;
  if v_booking.status <> 'pending' then
    raise exception 'Cette mission n''est plus en attente de réponse' using errcode = '22023';
  end if;

  update public.bookings
  set status = (case when p_accept then 'accepted' else 'cancelled' end)::public.booking_status,
      cancel_reason = case when p_accept then null else p_reason end
  where id = p_booking_id
  returning * into v_booking;

  return v_booking;
end;
$$;

-- ---------------------------------------------------------------------
-- 3. Mise sous séquestre. Appelee par le backend (service role) après
--    confirmation du paiement Mobile Money, jamais par le client.
-- ---------------------------------------------------------------------
create or replace function public.capture_escrow(p_payment_id uuid)
returns public.escrow_transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.payments;
  v_booking public.bookings;
  v_escrow  public.escrow_transactions;
begin
  select * into v_payment from public.payments where id = p_payment_id for update;
  if not found then
    raise exception 'Paiement introuvable' using errcode = 'P0002';
  end if;
  if v_payment.status <> 'succeeded' then
    raise exception 'Le paiement n''est pas confirme' using errcode = '22023';
  end if;

  select * into v_booking from public.bookings where id = v_payment.booking_id for update;

  -- Idempotence d'abord : les opérateurs Mobile Money rejouent volontiers
  -- leurs callbacks. Un rappel doit retomber sur le séquestre existant, pas
  -- se heurter au contrôle d'état ci-dessous (la mission est déjà confirmee).
  select * into v_escrow from public.escrow_transactions where booking_id = v_booking.id;
  if found then
    return v_escrow;
  end if;

  if v_booking.status not in ('accepted', 'pending') then
    raise exception 'Cette mission n''attend pas de paiement' using errcode = '22023';
  end if;
  if v_payment.amount_xaf <> v_booking.total_xaf then
    raise exception 'Montant paye different du montant de la mission' using errcode = '22023';
  end if;

  insert into public.escrow_transactions (
    booking_id, amount_xaf, platform_fee_xaf, companion_payout_xaf, status
  )
  values (
    v_booking.id, v_booking.total_xaf, v_booking.service_fee_xaf, v_booking.subtotal_xaf, 'held'
  )
  returning * into v_escrow;

  update public.bookings set status = 'confirmed' where id = v_booking.id;

  return v_escrow;
end;
$$;

-- ---------------------------------------------------------------------
-- 4. Démarrage de la mission (companion, sur le lieu)
-- ---------------------------------------------------------------------
create or replace function public.start_mission(p_booking_id uuid)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings;
begin
  select * into v_booking from public.bookings where id = p_booking_id for update;
  if not found or v_booking.companion_id <> auth.uid() then
    raise exception 'Mission introuvable' using errcode = '42501';
  end if;
  if v_booking.status <> 'confirmed' then
    raise exception 'Les fonds doivent être sous séquestre avant de démarrer' using errcode = '22023';
  end if;
  if now() < v_booking.starts_at - interval '30 minutes' then
    raise exception 'Trop tôt pour démarrer cette mission' using errcode = '22023';
  end if;

  update public.bookings
  set status = 'in_progress', started_at = now()
  where id = p_booking_id
  returning * into v_booking;

  return v_booking;
end;
$$;

-- ---------------------------------------------------------------------
-- 5. Fin de mission (companion). Les fonds restent bloqués : c'est le
--    client (ou l'admin) qui declenche la libération.
-- ---------------------------------------------------------------------
create or replace function public.complete_mission(p_booking_id uuid)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings;
begin
  select * into v_booking from public.bookings where id = p_booking_id for update;
  if not found or v_booking.companion_id <> auth.uid() then
    raise exception 'Mission introuvable' using errcode = '42501';
  end if;
  if v_booking.status <> 'in_progress' then
    raise exception 'Cette mission n''est pas en cours' using errcode = '22023';
  end if;

  update public.bookings
  set status = 'completed', completed_at = now()
  where id = p_booking_id
  returning * into v_booking;

  return v_booking;
end;
$$;

-- ---------------------------------------------------------------------
-- 6. Libération du séquestre : le client valide la prestation, ou un
--    admin arbitre. Cree l'ordre de reversement vers le companion.
-- ---------------------------------------------------------------------
create or replace function public.release_escrow(p_booking_id uuid)
returns public.escrow_transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking   public.bookings;
  v_escrow    public.escrow_transactions;
  v_payment   public.payments;
  v_msisdn    text;
begin
  select * into v_booking from public.bookings where id = p_booking_id for update;
  if not found then
    raise exception 'Mission introuvable' using errcode = 'P0002';
  end if;
  if v_booking.client_id <> auth.uid() and not public.is_admin() then
    raise exception 'Seul le client ou un admin peut libérer les fonds' using errcode = '42501';
  end if;

  select * into v_escrow from public.escrow_transactions
  where booking_id = p_booking_id for update;
  if not found then
    raise exception 'Aucun séquestre pour cette mission' using errcode = 'P0002';
  end if;

  -- Idempotence avant tout contrôle d'état : après une première libération la
  -- mission est passee en 'released', donc un second appel (double clic,
  -- rejeu) echouerait sur le contrôle ci-dessous au lieu de ne rien faire.
  if v_escrow.status = 'released' then
    return v_escrow;
  end if;
  if v_escrow.status = 'refunded' then
    raise exception 'Fonds déjà remboursés au client' using errcode = '22023';
  end if;

  -- Le client ne libéré que sur une mission terminée. L'admin peut en plus
  -- trancher un litige en faveur du companion : sans cela, un litige n'aurait
  -- que le remboursement pour issue.
  if v_booking.status = 'disputed' then
    if not public.is_admin() then
      raise exception 'Litige en cours : seul un admin peut libérer les fonds' using errcode = '42501';
    end if;
  elsif v_booking.status <> 'completed' then
    raise exception 'La mission doit être terminée avant libération' using errcode = '22023';
  end if;

  if v_escrow.status <> 'held' and v_escrow.status <> 'disputed' then
    raise exception 'Les fonds ne sont plus sous séquestre' using errcode = '22023';
  end if;

  update public.escrow_transactions
  set status = 'released', released_at = now(), released_by = auth.uid()
  where id = v_escrow.id
  returning * into v_escrow;

  update public.bookings set status = 'released' where id = p_booking_id;

  update public.companion_profiles
  set missions_completed = missions_completed + 1
  where id = v_booking.companion_id;

  -- Reversement sur le numéro Mobile Money du companion ; à défaut, sur
  -- celui utilise pour l'encaissement (même opérateur).
  select * into v_payment from public.payments
  where booking_id = p_booking_id and status = 'succeeded'
  order by created_at desc limit 1;

  select phone into v_msisdn from public.profiles where id = v_booking.companion_id;
  v_msisdn := coalesce(v_msisdn, v_payment.msisdn);

  if v_msisdn is null then
    raise exception 'Aucun numéro Mobile Money connu pour ce companion' using errcode = '22023';
  end if;

  insert into public.payouts (escrow_id, companion_id, provider, msisdn, amount_xaf)
  values (
    v_escrow.id,
    v_booking.companion_id,
    coalesce(v_payment.provider, 'airtel_money'),
    v_msisdn,
    v_escrow.companion_payout_xaf
  );

  return v_escrow;
end;
$$;

-- ---------------------------------------------------------------------
-- 7. Litige : ouvert par une partie, gelé les fonds jusqu'a arbitrage.
-- ---------------------------------------------------------------------
create or replace function public.open_dispute(p_booking_id uuid, p_reason text)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings;
begin
  if not public.is_booking_party(p_booking_id) then
    raise exception 'Mission introuvable' using errcode = '42501';
  end if;

  select * into v_booking from public.bookings where id = p_booking_id for update;
  if v_booking.status not in ('confirmed', 'in_progress', 'completed') then
    raise exception 'Aucun litige possible à ce stade' using errcode = '22023';
  end if;

  update public.bookings
  set status = 'disputed', cancel_reason = p_reason
  where id = p_booking_id
  returning * into v_booking;

  update public.escrow_transactions
  set status = 'disputed'
  where booking_id = p_booking_id and status = 'held';

  return v_booking;
end;
$$;

-- ---------------------------------------------------------------------
-- 8. Remboursement (admin uniquement)
-- ---------------------------------------------------------------------
create or replace function public.refund_escrow(p_booking_id uuid, p_notes text default null)
returns public.escrow_transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_escrow public.escrow_transactions;
begin
  if not public.is_admin() then
    raise exception 'Réservé aux administrateurs' using errcode = '42501';
  end if;

  select * into v_escrow from public.escrow_transactions
  where booking_id = p_booking_id for update;
  if not found then
    raise exception 'Aucun séquestre pour cette mission' using errcode = 'P0002';
  end if;
  if v_escrow.status = 'refunded' then
    return v_escrow;
  end if;
  if v_escrow.status = 'released' then
    raise exception 'Fonds déjà versés au companion' using errcode = '22023';
  end if;

  update public.escrow_transactions
  set status = 'refunded', refunded_at = now(), released_by = auth.uid(), notes = p_notes
  where id = v_escrow.id
  returning * into v_escrow;

  update public.bookings set status = 'refunded' where id = p_booking_id;

  insert into public.admin_actions (admin_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'refund_escrow', 'booking', p_booking_id, jsonb_build_object('notes', p_notes));

  return v_escrow;
end;
$$;

-- ---------------------------------------------------------------------
-- 9. Annulation avant paiement (client ou companion)
-- ---------------------------------------------------------------------
create or replace function public.cancel_booking(p_booking_id uuid, p_reason text)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings;
begin
  if not public.is_booking_party(p_booking_id) then
    raise exception 'Mission introuvable' using errcode = '42501';
  end if;

  select * into v_booking from public.bookings where id = p_booking_id for update;
  if v_booking.status not in ('pending', 'accepted') then
    raise exception 'Une mission payee ne peut être annulée que par un remboursement' using errcode = '22023';
  end if;

  update public.bookings
  set status = 'cancelled', cancel_reason = p_reason
  where id = p_booking_id
  returning * into v_booking;

  return v_booking;
end;
$$;

-- ---------------------------------------------------------------------
-- 10. Verification d'un companion (admin)
-- ---------------------------------------------------------------------
create or replace function public.review_companion(
  p_companion_id uuid,
  p_approve      boolean,
  p_notes        text default null
)
returns public.companion_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_companion public.companion_profiles;
begin
  if not public.is_admin() then
    raise exception 'Réservé aux administrateurs' using errcode = '42501';
  end if;

  update public.companion_profiles
  set verification_status =
        (case when p_approve then 'approved' else 'rejected' end)::public.verification_status,
      verified_at = case when p_approve then now() else null end
  where id = p_companion_id
  returning * into v_companion;

  if not found then
    raise exception 'Companion introuvable' using errcode = 'P0002';
  end if;

  insert into public.admin_actions (admin_id, action, target_type, target_id, metadata)
  values (
    auth.uid(),
    case when p_approve then 'approve_companion' else 'reject_companion' end,
    'companion', p_companion_id, jsonb_build_object('notes', p_notes)
  );

  return v_companion;
end;
$$;

-- ---------------------------------------------------------------------
-- Droits d'exécution. capture_escrow reste hors de portee des clients :
-- seul le backend (service role) l'appelle depuis le webhook opérateur.
-- ---------------------------------------------------------------------
revoke execute on function public.capture_escrow(uuid) from public, authenticated, anon;

grant execute on function public.request_booking(uuid, uuid, timestamptz, integer, text) to authenticated;
grant execute on function public.respond_to_booking(uuid, boolean, text) to authenticated;
grant execute on function public.start_mission(uuid) to authenticated;
grant execute on function public.complete_mission(uuid) to authenticated;
grant execute on function public.release_escrow(uuid) to authenticated;
grant execute on function public.open_dispute(uuid, text) to authenticated;
grant execute on function public.refund_escrow(uuid, text) to authenticated;
grant execute on function public.cancel_booking(uuid, text) to authenticated;
grant execute on function public.review_companion(uuid, boolean, text) to authenticated;
