\set ON_ERROR_STOP on
\pset pager off

-- Helpers de test -----------------------------------------------------
create or replace function test_assert(cond boolean, label text)
returns void language plpgsql as $$
begin
  if not cond then
    raise exception 'ECHEC: %', label;
  end if;
  raise notice 'ok  %', label;
end;
$$;

-- Vérifié qu'un appel échoué bien (regle de sécurité ou d'état).
create or replace function test_denied(sql text, label text)
returns void language plpgsql as $$
begin
  begin
    execute sql;
  exception when others then
    raise notice 'ok  % (refuse: %)', label, left(sqlerrm, 60);
    return;
  end;
  raise exception 'ECHEC: % aurait du être refuse', label;
end;
$$;

create or replace function act_as(p_id uuid)
returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', coalesce(p_id::text, ''), false);
end;
$$;

-- 1. Inscriptions ------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'client@up.ga',
   '{"full_name":"Awa Client","phone":"+24177000001","role":"client"}'),
  ('22222222-2222-2222-2222-222222222222', 'companion@up.ga',
   '{"full_name":"Nadia Companion","phone":"+24177000002","role":"companion"}'),
  ('33333333-3333-3333-3333-333333333333', 'admin@up.ga',
   '{"full_name":"Equipe UP","phone":"+24177000003","role":"admin"}'),
  ('44444444-4444-4444-4444-444444444444', 'autre@up.ga',
   '{"full_name":"Autre Client","phone":"+24177000004","role":"client"}');

select test_assert(
  (select count(*) from public.profiles) = 4,
  'le trigger créé un profil par utilisateur');

select test_assert(
  (select role from public.profiles where id = '22222222-2222-2222-2222-222222222222') = 'companion',
  'le role companion est repris des metadonnees');

select test_assert(
  (select count(*) from public.companion_profiles) = 1,
  'une fiche companion est créée automatiquement');

-- Regle de sécurité : on ne devient pas admin en s'inscrivant.
select test_assert(
  (select role from public.profiles where id = '33333333-3333-3333-3333-333333333333') = 'client',
  'le role admin n est pas auto-attribuable a l inscription');

-- Promotion admin faite en base, comme en production.
update public.profiles set role = 'admin' where id = '33333333-3333-3333-3333-333333333333';

-- Numéro déjà pris : message explicite plutot qu'erreur opaque.
select test_denied(
  $$insert into auth.users (email, raw_user_meta_data)
    values ('doublon@up.ga', '{"full_name":"Doublon","phone":"+24177000001","role":"client"}')$$,
  'un numéro déjà utilise est refuse');
