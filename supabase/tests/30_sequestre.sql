\set ON_ERROR_STOP on
\pset pager off
\set CLIENT '''11111111-1111-1111-1111-111111111111'''
\set COMPANION '''22222222-2222-2222-2222-222222222222'''
\set ADMIN '''33333333-3333-3333-3333-333333333333'''

create temp table b as select id from public.bookings limit 1;
grant select on b to authenticated;

-- 6. Séquestre obligatoire : pas de démarrage sans fonds bloqués -------
set role authenticated;
select act_as(:COMPANION);
select test_denied(
  format('select start_mission(%L)', (select id from b)),
  'impossible de démarrer avant acceptation');

select respond_to_booking((select id from b), true);
select test_assert(
  (select status from public.bookings where id = (select id from b)) = 'accepted',
  'le companion accepte la mission');

select test_denied(
  format('select start_mission(%L)', (select id from b)),
  'impossible de démarrer sans séquestre finance');

-- capture_escrow est reserve au backend : un utilisateur ne peut pas
-- se declarer paye lui-meme.
select act_as(:CLIENT);
select test_denied(
  format('select capture_escrow(%L)', gen_random_uuid()),
  'capture_escrow est hors de portee des utilisateurs');

-- 7. Encaissement Mobile Money (role service, hors RLS) ----------------
reset role;
insert into public.payments (booking_id, payer_id, provider, msisdn, amount_xaf, status, idempotency_key)
select id, :CLIENT, 'airtel_money', '+24177000001', total_xaf, 'succeeded',
       id::text || ':' || total_xaf
from public.bookings where id = (select id from b);

select capture_escrow((select id from public.payments limit 1));

select test_assert(
  (select status from public.bookings where id = (select id from b)) = 'confirmed',
  'le paiement confirme met la mission en confirmed');

select test_assert(
  (select status from public.escrow_transactions where booking_id = (select id from b)) = 'held',
  'les fonds sont sous séquestre');

select test_assert(
  (select amount_xaf = platform_fee_xaf + companion_payout_xaf
   from public.escrow_transactions where booking_id = (select id from b)),
  'la répartition du séquestre est cohérente');

-- Rejeu du webhook : pas de second séquestre.
select capture_escrow((select id from public.payments limit 1));
select test_assert(
  (select count(*) from public.escrow_transactions where booking_id = (select id from b)) = 1,
  'un rappel du webhook ne créé pas de second séquestre');

-- 8. Deroulement de la mission -----------------------------------------
update public.bookings set starts_at = now() - interval '5 minutes' where id = (select id from b);

set role authenticated;
select act_as(:CLIENT);
select test_denied(
  format('select start_mission(%L)', (select id from b)),
  'le client ne peut pas démarrer la mission');

select act_as(:COMPANION);
select start_mission((select id from b));
select test_assert(
  (select status from public.bookings where id = (select id from b)) = 'in_progress',
  'le companion démarré la mission');

-- Le companion ne peut pas se payer lui-meme.
select complete_mission((select id from b));
select test_denied(
  format('select release_escrow(%L)', (select id from b)),
  'le companion ne peut pas libérer les fonds');

-- 9. Libération par le client ------------------------------------------
select act_as(:CLIENT);
select release_escrow((select id from b));

select test_assert(
  (select status from public.escrow_transactions where booking_id = (select id from b)) = 'released',
  'le client libéré le séquestre');

select test_assert(
  (select status from public.bookings where id = (select id from b)) = 'released',
  'la mission passe en released');

-- Le reversement appartient au companion : le client ne doit pas le voir.
select test_assert(
  (select count(*) from public.payouts) = 0,
  'le client ne voit pas le reversement du companion');

select act_as(:COMPANION);
select test_assert(
  (select count(*) from public.payouts) = 1,
  'le companion voit son ordre de reversement');

select test_assert(
  (select amount_xaf from public.payouts limit 1) = 75000,
  'le reversement porte sur la part companion (hors frais UP)');

select act_as(:CLIENT);

select test_assert(
  (select missions_completed from public.companion_profiles where id = :COMPANION) = 1,
  'le compteur de missions du companion est incremente');

-- Idempotence de la libération.
select release_escrow((select id from b));
reset role;
select test_assert(
  (select count(*) from public.payouts) = 1,
  'une seconde libération ne créé pas de doublon');
set role authenticated;

-- Plus de remboursement possible après versement.
select act_as(:ADMIN);
select test_denied(
  format('select refund_escrow(%L, ''test'')', (select id from b)),
  'pas de remboursement après versement au companion');
