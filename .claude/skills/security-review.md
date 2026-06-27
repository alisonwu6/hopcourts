# Security Review — HopCourts Context

> Project-specific checklist for the `/security-review` skill.
> Role: pre-release security scan. Run before any deploy to production or staging.

## Authentication & authorisation

- [ ] Every protected endpoint has `verifyToken` applied in its route file
- [ ] Venue owner actions use `verifyVenueOwner` middleware — not just a userId check in the service
- [ ] Role-restricted endpoints use `requireRoles` middleware
- [ ] `optionalAuth` is only used where public access is intentional (e.g. `GET /sessions?type=upcoming`)
- [ ] Admin routes under `/api/v1/admin` are not accessible without auth

## Data exposure

- [ ] API responses do not leak password hashes, tokens, or Supabase internal IDs
- [ ] User profile endpoints only return fields explicitly selected in the SQL — no `SELECT *` on users table
- [ ] Venue claim and ownership data not exposed to non-owners

## SQL injection

- [ ] All SQL queries use parameterised form: `pool.query('SELECT ...', [param1, param2])`
- [ ] No string interpolation in SQL — reject any `\`SELECT ... WHERE id = ${id}\`` pattern
- [ ] User-supplied values (query params, request body) never concatenated into SQL strings

## Rate limiting & abuse

- [ ] Join/leave session routes are covered by `authLimiter` (15 min window, 30 req in prod)
- [ ] New write endpoints that could be abused are added to the rate limiter in `backend/src/app.js`

## Environment & secrets

- [ ] No API keys, tokens, or secrets hardcoded in source — confirm all sensitive values come from `process.env`
- [ ] `CORS_ORIGIN` is not `'*'` in production (enforced in `app.js` — verify the check still holds)

## Output format

List each finding with severity: **HIGH** / **MEDIUM** / **LOW**, file path, and a one-line description. Mark overall status as **CLEAR** or **BLOCKED**.
