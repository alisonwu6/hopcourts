-- 000_run_all_schema.sql
-- Run all schema files in deterministic order
-- Usage:
--   psql "$DATABASE_URL" -f backend/db/schema/000_run_all_schema.sql
--   or: PGPASSWORD=... psql -h ... -p ... -U ... -d ... -f backend/db/schema/000_run_all_schema.sql

\echo '==> Applying schema...'
\set ON_ERROR_STOP on

-- Run relative to this file's directory. If you call:
--   psql ... -f backend/db/schema/000_run_all_schema.sql
-- psql will resolve \ir paths relative to backend/db/schema.

\ir 001_extensions.sql
\ir 010_sports.sql
\ir 020_sessions.sql
\ir 030_session_participants.sql
\ir 040_check_ins.sql
\ir 050_countries.sql
\ir 060_cities.sql
\ir 070_vibes.sql
\ir 080_age_ranges.sql
\ir 090_users.sql
\ir 100_user_sports.sql
\ir 110_user_preferences.sql
\ir 115_session_photos_bucket.sql
\ir 116_fix_storage_policies.sql
\ir 120_add_session_fields.sql
\ir 121_add_session_price.sql

\echo '==> Schema applied.'
