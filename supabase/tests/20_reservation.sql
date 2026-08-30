\set ON_ERROR_STOP on
\pset pager off
\set CLIENT '''11111111-1111-1111-1111-111111111111'''
\set COMPANION '''22222222-2222-2222-2222-222222222222'''
\set ADMIN '''33333333-3333-3333-3333-333333333333'''
\set OTHER '''44444444-4444-4444-4444-444444444444'''

-- 2. Verification du companion (admin) --------------------------------
set role authenticated;
select act_as(:ADMIN);
select review_companion(:COMPANION, true, 'Dossier conforme');
select test_assert(
  (select verification_status from public.companion_profiles where id = :COMPANION) = 'approved',
  'l admin approuvé la fiche companion');

-- Un client ne peut pas vérifier un companion.
select act_as(:CLIENT);
select test_denied(
  format('select review_companion(%L, true)', :COMPANION),
  'un client ne peut pas approuver un companion');

-- 3. Le lieu doit être un espace public approuvé -----------------------
reset role;
insert into public.venues (name, category, address, city, is_approved)
values ('Villa privee', 'restaurant', 'Adresse test', 'Libreville', false);

set role authenticated;
select act_as(:CLIENT);
select test_denied(
  format('select request_booking(%L, %L, now() + interval ''3 hours'', 3)',
         :COMPANION, (select id from public.venues where name = 'Villa privee')),
  'un lieu non approuvé est refuse');

-- 4. Demande de mission ------------------------------------------------
select test_denied(
  format('select request_booking(%L, %L, now() + interval ''30 minutes'', 3)',
         :COMPANION, (select id from public.venues where name = 'Le Cristal')),
  'un créneau a moins de 2 heures est refuse');

create temp table t_booking as
select * from request_booking(
  :COMPANION,
  (select id from public.venues where name = 'Le Cristal'),
  now() + interval '3 hours',
  3
);

-- Tarif par defaut 25 000 FCFA/h x 3 h = 75 000 ; frais 15 % = 11 250.
select test_assert((select subtotal_xaf from t_booking) = 75000, 'sous-total = tarif x durée');
select test_assert((select service_fee_xaf from t_booking) = 11250, 'frais de service = 15 %');
select test_assert((select total_xaf from t_booking) = 86250, 'total = sous-total + frais');
select test_assert((select status from t_booking) = 'pending', 'la mission démarré en attente');

-- Chevauchement de créneau sur le même companion.
select test_denied(
  format('select request_booking(%L, %L, now() + interval ''4 hours'', 2)',
         :COMPANION, (select id from public.venues where name = 'Le Cristal')),
  'un créneau qui chevauche est refuse');

-- 5. Cloisonnement : un autre client ne voit rien ----------------------
select act_as(:OTHER);
select test_assert(
  (select count(*) from public.bookings) = 0,
  'un autre client ne voit aucune mission');

select act_as(:COMPANION);
select test_assert(
  (select count(*) from public.bookings) = 1,
  'le companion concerne voit la mission');
