-- Grants equivalents a ceux que Supabase applique par defaut.
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage on schema auth to authenticated, service_role;
grant select on auth.users to authenticated, service_role;
