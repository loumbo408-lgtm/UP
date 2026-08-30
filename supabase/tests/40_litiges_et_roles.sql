\set ON_ERROR_STOP on
\pset pager off
\set CLIENT '''11111111-1111-1111-1111-111111111111'''
\set COMPANION '''22222222-2222-2222-2222-222222222222'''
\set ADMIN '''33333333-3333-3333-3333-333333333333'''
\set OTHER '''44444444-4444-4444-4444-444444444444'''

-- 10. Litige et arbitrage ----------------------------------------------
set role authenticated;
select act_as(:CLIENT);

create temp table b2 as
select * from request_booking(
  :COMPANION,
  (select id from public.venues where name = 'La Dolce Vita'),
  now() + interval '2 days',
  2
);
grant select on b2 to authenticated;

select act_as(:COMPANION);
select respond_to_booking((select id from b2), true);

reset role;
insert into public.payments (booking_id, payer_id, provider, msisdn, amount_xaf, status, idempotency_key)
select id, :CLIENT, 'moov_money', '+24162000001', total_xaf, 'succeeded', id::text || ':bis'
from public.bookings where id = (select id from b2);

select capture_escrow(
  (select id from public.payments where booking_id = (select id from b2)));

set role authenticated;
select act_as(:CLIENT);
select open_dispute((select id from b2), 'Le companion ne s est pas présenté');

select test_assert(
  (select status from public.bookings where id = (select id from b2)) = 'disputed',
  'le client ouvre un litige');

select test_assert(
  (select status from public.escrow_transactions where booking_id = (select id from b2)) = 'disputed',
  'les fonds sont gelés pendant le litige');

-- Un tiers ne peut pas ouvrir de litige sur la mission d'autrui.
select act_as(:OTHER);
select test_denied(
  format('select open_dispute(%L, ''test'')', (select id from b2)),
  'un tiers ne peut pas ouvrir de litige');

-- Le client ne peut pas se rembourser lui-meme.
select act_as(:CLIENT);
select test_denied(
  format('select refund_escrow(%L, ''test'')', (select id from b2)),
  'un client ne peut pas declencher son propre remboursement');

-- L'admin arbitre en faveur du client.
select act_as(:ADMIN);
select refund_escrow((select id from b2), 'Companion absent, remboursement integral');

select test_assert(
  (select status from public.escrow_transactions where booking_id = (select id from b2)) = 'refunded',
  'l admin rembourse le client');

select test_assert(
  (select status from public.bookings where id = (select id from b2)) = 'refunded',
  'la mission passe en refunded');

select test_assert(
  (select count(*) from public.admin_actions where action = 'refund_escrow') = 1,
  'le remboursement est journalisé');

-- 11. Cloisonnement des roles ------------------------------------------
select act_as(:CLIENT);
select test_denied(
  format('update public.profiles set role = ''admin'' where id = %L', :CLIENT),
  'un utilisateur ne peut pas s auto-promouvoir admin');

-- Les tables monetaires ne s'ecrivent pas directement.
-- Sans policy UPDATE, la RLS ne leve pas d'erreur : elle rend simplement la
-- ligne invisible a l'ecriture. On vérifié donc que rien n'a bouge.
update public.bookings set status = 'released' where id = (select id from b2);
select test_assert(
  (select status from public.bookings where id = (select id from b2)) = 'refunded',
  'ecriture directe sur bookings sans effet (aucune policy UPDATE)');

select test_denied(
  format($$insert into public.escrow_transactions (booking_id, amount_xaf, platform_fee_xaf, companion_payout_xaf)
           values (%L, 1000, 100, 900)$$, (select id from b2)),
  'ecriture directe sur le séquestre refusée');

-- Un client ne voit pas la fiche d'un companion non vérifié.
reset role;
insert into auth.users (id, email, raw_user_meta_data) values
  ('55555555-5555-5555-5555-555555555555', 'attente@up.ga',
   '{"full_name":"En Attente","phone":"+24177000005","role":"companion"}');

set role authenticated;
select act_as(:CLIENT);
select test_assert(
  (select count(*) from public.companion_profiles
   where id = '55555555-5555-5555-5555-555555555555') = 0,
  'une fiche non vérifiée reste invisible du catalogue');

-- Un lieu non approuvé n'apparait pas au catalogue client.
reset role;
insert into public.venues (name, category, address, city, is_approved)
values ('Lieu suspendu', 'cafe', 'Test', 'Libreville', false);
set role authenticated;
select act_as(:CLIENT);
select test_assert(
  (select count(*) from public.venues where name = 'Lieu suspendu') = 0,
  'un lieu non approuvé est invisible du catalogue client');

select act_as(:ADMIN);
select test_assert(
  (select count(*) from public.venues where name = 'Lieu suspendu') = 1,
  'l admin voit les lieux non approuvés');
