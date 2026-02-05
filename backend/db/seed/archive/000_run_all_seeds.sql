-- 000_run_all_seeds.sql
-- Run all seeds in a deterministic order (safe to re-run)
-- Usage:
--   psql "$DATABASE_URL" -f backend/db/seed/000_run_all_seeds.sql
-- or inside psql:
--   \i backend/db/seed/000_run_all_seeds.sql

\set ON_ERROR_STOP on

\echo '==> Running seeds...'

-- Run relative to this file's directory. If you call:
--   psql ... -f backend/db/seed/000_run_all_seeds.sql
-- psql will resolve \ir paths relative to backend/db/seed.

\echo '==> seed: sports'
\ir 100_seed_sports.sql

\echo '==> seed: sessions'
\ir 110_seed_sessions.sql

\echo '==> seed: participants'
\ir 120_seed_participants.sql

\echo '==> seed: countries'
\ir 130_seed_countries.sql

\echo '==> seed: cities'
\ir 140_seed_cities.sql

\echo '==> seed: vibes'
\ir 150_seed_vibes.sql

\echo '==> seed: age_ranges'
\ir 160_seed_age_ranges.sql

\echo '==> Done.'
