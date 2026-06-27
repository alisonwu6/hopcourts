# QA Engineer — HopCourts Context

> Project-specific guidance for the `/qa-engineer` skill.
> Read this at the start of any testing session.

## Before writing tests

1. Read `docs/SPEC.md` for the feature — tests must match the documented contract
2. Check `docs/STATUS.md` — only write tests for features marked ✅ (not mocked)
3. Look at existing tests for patterns: `backend/src/modules/sessions/__tests__/sessions.routes.test.js`

## Test locations

| What | Where |
|---|---|
| Backend route/integration tests | `backend/src/modules/<name>/__tests__/<name>.routes.test.js` |
| Backend service unit tests | `backend/src/modules/<name>/__tests__/<name>.service.test.js` |
| Frontend component tests | `frontend/src/features/<name>/__tests__/` (if needed) |

## Backend test priorities (in order)

1. **Auth boundaries** — protected routes return 401 without a valid token
2. **Happy path** — correct input returns correct response shape
3. **Pagination** — `has_more` flag behaves correctly at boundaries
4. **Error cases** — 404, 403, 409 as appropriate; verify `ok: false, error.code` shape
5. **Feed type delegation** — if multiple `type=` variants exist, verify each delegates to the right service function

## Run tests

```bash
cd backend && npm test
cd backend && npx jest <module-name> --watch
```

## After writing tests

- If tests reveal a gap between spec and implementation, update `docs/SPEC.md`
- Update `docs/STATUS.md` if a feature was thought to be complete but tests found it wasn't
