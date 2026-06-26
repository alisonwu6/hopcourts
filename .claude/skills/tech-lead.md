# Tech Lead — HopCourts Context

> Project-specific guidance for the `/tech-lead` skill.
> Role: pre-ship architectural audit + living document maintenance.
> Run after `/code-review` passes, before merging to `main`.

## Pre-ship audit checklist

**Architecture integrity:**
- [ ] 4-layer pattern holds — no controller touching the DB, no model containing business logic
- [ ] No new direct DB connections outside `backend/src/lib/db.js`
- [ ] Venue portal routes still mount at `/api/v1/admin` — no accidental path drift
- [ ] All new routes registered in `backend/src/routes/v1.js`

**Schema & API drift:**
- [ ] `docs/SPEC.md` matches the implemented endpoints — read the route file and compare
- [ ] `backend/docs/openapi.yaml` updated for any new or changed routes — run `npm run openapi:lint` to validate
- [ ] If schema changed: `npm run db:verify` passed locally before this audit

**Technical debt flag:**
- If any shortcut was taken (e.g. business logic left in controller temporarily, SQL hardcoded instead of parameterised), flag it explicitly with file + line and add to Known Gaps in `docs/STATUS.md`

## Mandatory document updates (do not exit until done)

- **`docs/STATUS.md`** — update every feature row touched in this cycle (🟡 → ✅ or new gap discovered)
- **`docs/DECISIONS.md`** — append any non-obvious architectural choice made during this cycle

## Output format

```
### Pre-ship Audit Report
**Status:** PASS / FAIL

**Architecture:** [findings or "clean"]
**API drift:** [findings or "clean"]
**Tech debt flagged:** [list or "none"]
**Documents updated:** STATUS.md ✅ / DECISIONS.md ✅
```
