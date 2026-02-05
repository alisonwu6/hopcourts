-- 000_run_all_schema.sql
-- Run consolidated schema files in order
-- Usage: psql "$DATABASE_URL" -f 000_run_all_schema.sql

\echo '==> Applying consolidated schema...'
\set ON_ERROR_STOP on

\ir 001_initial_schema.sql
\ir 002_seed_data.sql
\ir 003_storage_and_policies.sql

\echo '==> Schema applied successfully.'
