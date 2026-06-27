# Principal Architect — HopCourts Context

> Project-specific guidance for the `/principal-architect` skill.
> Read this at the start of any design session.

## Before designing anything

1. Read `docs/STATUS.md` — verify the feature doesn't already exist (partially or fully)
2. Read `docs/SPEC.md` — check existing API patterns and response shapes for consistency
3. Read the relevant migration files in `backend/supabase/migrations/` — understand current schema

## Output format (design sessions only — no implementation code)

```
### API Contract
- Method + path
- Auth requirement (verifyToken / optionalAuth / public)
- Query params or request body shape
- Response shape (follow { ok: true, data: {...} } pattern)
- Error cases and which Errors.* factory to use

### DB Changes Required
- New tables or columns (with types and constraints)
- Migration filename: YYYYMMDDHHMMSS_description.sql
- Index requirements

### Handoff notes for senior-engineer
- Any non-obvious business rules
- Ordering of operations (e.g. insert venue before creating claim)
```

## Before handing off to `/senior-engineer`

- Update `docs/SPEC.md` with the new contract
- Append to `docs/DECISIONS.md` if any non-obvious choice was made (e.g. why denormalised, why a specific constraint)

## HopCourts patterns to follow

- All routes under `/api/v1` — check `backend/src/routes/v1.js` for where to register
- Venue portal routes mount at `/admin` (not `/venue-portal`)
- Auth: use existing middleware (`verifyToken`, `optionalAuth`, `requireRoles`, `verifyVenueOwner`)
- Never design a new auth pattern without checking what middleware already exists
