-- 000_run_all_seeds.sql
-- Run all seeds in a deterministic order (safe to re-run)
-- Usage:
--   psql "$DATABASE_URL" -f backend/db/seed/000_run_all_seeds.sql
-- or inside psql:
--   \i backend/db/seed/000_run_all_seeds.sql

\set ON_ERROR_STOP on
\echo '==> Running seeds...'

\echo '==> seed: sports'
\i backend/db/seed/100_seed_sports.sql

\echo '==> seed: sessions'
\i backend/db/seed/110_seed_sessions.sql

\echo '==> seed: participants'
\i backend/db/seed/120_seed_participants.sql

\echo '==> seed: countries'
\i backend/db/seed/130_seed_countries.sql

\echo '==> seed: cities'
\i backend/db/seed/140_seed_cities.sql

\echo '==> seed: vibes'
\i backend/db/seed/150_seed_vibes.sql

\echo '==> seed: age_ranges'
\i backend/db/seed/160_seed_age_ranges.sql

\echo '==> Done.'
