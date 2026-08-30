#!/usr/bin/env bash
#
# Rejoue les migrations sur une base PostgreSQL neuve, puis deroule les
# scenarios de bout en bout (inscription -> sequestre -> litige) en verifiant
# aussi le cloisonnement RLS des trois roles.
#
# Prerequis : un PostgreSQL 14+ local. Les tests recreent la base `up` a
# chaque execution ; ne les pointez jamais vers une base de production.
#
#   PGHOST=/tmp PGPORT=5432 ./supabase/tests/run.sh
#
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"

PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-postgres}"
PGDATABASE_TEST="${PGDATABASE_TEST:-up}"

PSQL=(psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -v ON_ERROR_STOP=1)

echo "→ Recreation de la base $PGDATABASE_TEST"
"${PSQL[@]}" -d postgres -q \
  -c "drop database if exists $PGDATABASE_TEST with (force);" \
  -c "create database $PGDATABASE_TEST;"

echo "→ Environnement Supabase simule (auth.users, auth.uid, roles)"
"${PSQL[@]}" -d "$PGDATABASE_TEST" -q -f "$HERE/00_supabase_stub.sql"

echo "→ Migrations"
for f in "$ROOT"/supabase/migrations/*.sql "$ROOT"/supabase/seed.sql; do
  echo "   $(basename "$f")"
  "${PSQL[@]}" -d "$PGDATABASE_TEST" -q -f "$f"
done

"${PSQL[@]}" -d "$PGDATABASE_TEST" -q -f "$HERE/01_grants.sql"

echo "→ Scenarios"
status=0
for f in "$HERE"/[1-9]0_*.sql; do
  if ! "${PSQL[@]}" -d "$PGDATABASE_TEST" -f "$f" > /tmp/up-test-out.log 2>&1; then
    status=1
  fi
  grep -E "NOTICE|ERROR|ECHEC" /tmp/up-test-out.log | sed 's/^psql.*NOTICE:  //' || true
done

echo
if [ "$status" -eq 0 ]; then
  echo "✔ Tous les scenarios passent"
else
  echo "✘ Au moins un scenario a echoue"
  exit 1
fi
