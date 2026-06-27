# Senior Engineer — HopCourts Context

> Project-specific guidance for the `/senior-engineer` skill.
> Read this at the start of any implementation session.

## Before writing any code

1. Read `docs/STATUS.md` — know what's already built vs mocked
2. Read `docs/SPEC.md` for the feature being implemented — the contract is the source of truth
3. Read `docs/DATABASE_WORKFLOW.md` if the task involves schema changes

## Implementation checklist

**Backend (in order):**
- [ ] Migration file if schema changes — run `npm run db:local:migrate` to apply locally
- [ ] Model function in `backend/models/<name>.model.js` — raw SQL only
- [ ] Service function in `backend/src/modules/<name>/<name>.service.js` — business logic
- [ ] Controller in `backend/src/modules/<name>/<name>.controller.js` — param extraction only
- [ ] Route in the appropriate route file — register in `backend/src/routes/v1.js` if it's a new module
- [ ] Verify with `npm run db:verify` if schema changed

**Frontend (same PR — vertical slice):**
- [ ] Service function in `frontend/src/features/<name>/services/<name>Service.ts`
- [ ] React Query hook or Zustand store update
- [ ] UI component — reuse `FieldSection`, `FloatingField`, `InputField` for any form
- [ ] Connect to real endpoint — no mock data left behind

## HopCourts-specific rules (non-negotiable)

- Error responses: `throw Errors.notFound(...)` — never `res.status().json()` directly
- SQL: `pool.query('SELECT ...', [params])` — no ORM, no query builders
- Response shape: `res.json({ ok: true, data: { ... } })` for success
- TypeScript: no `any` — run `npm run types:api` if you need generated types

## Self-audit before handoff

Run through `.claude/skills/code-review.md` checklist yourself before passing to `/code-review`. Catch your own violations first — it reduces loop iterations.

- [ ] Raw SQL only — no ORM?
- [ ] Controller thin — no business logic?
- [ ] All errors via `Errors.*` — no direct `res.status().json()`?
- [ ] No `any` in TypeScript?
- [ ] No mock data left behind?
- [ ] `docs/SPEC.md` updated if a route changed?

Fix any failure before declaring the implementation complete.

## After completing

- Update `docs/STATUS.md` — change the feature row from 🟡 to ✅ (or document new gaps found)
- If you made a non-obvious implementation decision, append to `docs/DECISIONS.md`
- Hand off to `/code-review` for independent audit
