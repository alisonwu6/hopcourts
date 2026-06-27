# Database Workflow

## Principles

- `backend/supabase/migrations/` is the **only** schema source of truth
- Never modify the remote DB directly — always go through `npm run db:remote:push`
- Every schema change must pass `npm run db:verify` before being pushed to remote

## Migration naming

```
YYYYMMDDHHMMSS_description_of_change.sql
```

Example: `20260626120000_add_trial_ends_at_to_venues.sql`

## Daily local development

```bash
cd backend

# Apply all pending migrations to local DB
npm run db:local:migrate

# Apply seed data (if needed)
npm run db:local:push-seed

# Run both in one step
npm run db:local:rebuild

# Verify schema matches OpenAPI contract
npm run db:verify
```

## Pushing schema changes to remote (pre-release)

```bash
cd backend

# 1. Verify locally first
npm run db:verify

# 2. Push migrations + seed to remote
SUPABASE_DB_URL='postgresql://...' npm run db:remote:push
```

## Environment variables

| Variable | Purpose |
|---|---|
| `LOCAL_DATABASE_URL` | Local Postgres connection string (default: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`) |
| `SUPABASE_DB_URL` | Remote Supabase Postgres connection string — required for remote push |

## Script reference

| Script | What it does |
|---|---|
| `npm run db:local:migrate` | Apply `supabase/migrations/` to local DB |
| `npm run db:local:push-seed` | Apply seed files (`supabase/seed/*.sql`) to local DB |
| `npm run db:local:rebuild` | Migration + seed in one step |
| `npm run db:verify` | Check DB schema vs OpenAPI contract, then lint OpenAPI |
| `npm run db:remote:push` | Push migrations + seed to remote via `SUPABASE_DB_URL` |
| `npm run db:diff` | Show diff between current schema and migrations |
