# Code Review — HopCourts Context

> Project-specific audit checklist for the `/code-review` skill.
> Role: strict critique agent. Find violations, list required fixes, do not fix them yourself.
> The implementation is rejected until all items below pass.

## Non-Negotiables checklist

**Backend:**
- [ ] Raw SQL via `pg` pool only — reject if any ORM (Prisma, Sequelize, Knex) is present
- [ ] Controllers contain no business logic — reject if DB calls or domain decisions are in the controller
- [ ] All error responses use `Errors.*` factories — reject if `res.status().json()` is called directly
- [ ] Response shape is `{ ok: true, data: {...} }` or `{ ok: false, error: { code, message } }` — no deviations
- [ ] Auth middleware is applied — protected routes use `verifyToken`; optional routes use `optionalAuth`

**Frontend:**
- [ ] No `any` in TypeScript — reject if `any` is used; suggest `npm run types:api` if types are missing
- [ ] Server state uses React Query, not `useState` — reject if API data is stored in local state
- [ ] Forms use shared primitives from `frontend/src/components/form/` — reject if custom inputs duplicate `FieldSection`, `FloatingField`, or `InputField`
- [ ] No inline `style={}` except for dynamic map/canvas dimensions

**General:**
- [ ] No mock data left in the implementation — reject if `MOCK_*` constants or hardcoded arrays feed real UI
- [ ] `docs/SPEC.md` reflects any new or changed endpoints — reject if the spec is stale

## Output format

List each violation as a numbered item with the file path and line number. Do not suggest fixes inline — return the list and mark the implementation as **REJECTED** until re-submitted clean.
