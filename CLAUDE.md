# HopCourts — Claude Onboarding

> Sports session discovery and booking platform. Users find, join, and host sports sessions; venues manage courts and schedules.

---

## AI Directives

These override default Claude behaviour for this project.

**Plan First.** Before writing any code for a new feature or significant refactor, output a numbered implementation plan and wait for explicit approval. Never start coding speculatively.

**No hallucination.** If a task requires an API endpoint, DB column, or behaviour that is not defined in `docs/SPEC.md`, stop and ask — do not invent structure. The spec is the contract.

**SPEC.md is a write target.** After any route, query param, or response shape change, update `docs/SPEC.md` in the same commit. It must stay in sync with the code.

**DECISIONS.md for architecture choices.** When a non-obvious decision is made (e.g., why a field is denormalised, why a particular auth middleware is used), append a one-liner to `docs/DECISIONS.md` so the reasoning survives context resets.

**STATUS.md is working memory.** Read `docs/STATUS.md` at the start of any session involving feature work. Update it whenever you: complete a feature, discover something is mocked, or wire a previously-mock flow to a real endpoint. This prevents re-building things that already exist and keeps gaps visible.

**Pre-code self-check.** Before outputting any implementation, verify it does not violate the Non-Negotiables at the bottom of this file. Specifically: no ORM, no `any`, no business logic in controllers, no `res.json()` error responses.

**Two memory layers — use the right one:**
- Behavioral feedback (coding style corrections, workflow preferences, things Alison told you not to do again) → write to the private memory system (`~/.claude/projects/…/memory/`)
- Project facts (feature status, architecture decisions, API contracts) → write to `docs/STATUS.md`, `docs/DECISIONS.md`, or `docs/SPEC.md`
- Never put project facts in private memory (they become stale and invisible to others); never put behavioral rules in project docs (they don't belong in the repo)

---

## Stack

| Layer | Technology |
|---|---|
| Backend | Express 5, Node ≥20, CommonJS (`require`/`module.exports`) |
| Database | PostgreSQL via Supabase, raw SQL through `pg` pool — **no ORM** |
| Frontend | React 19 + TypeScript, Vite, React Router v7, Zustand, Tailwind CSS v4 |
| Auth | Supabase Auth + JWT — `backend/src/middleware/verifyToken.js` |
| Maps | Mapbox GL (`react-map-gl`) |
| API base | `/api/v1` |
| Deployment | Fly.io (backend), frontend deployed separately |

---

## File Map

### Backend — 4-layer pattern

```
routes/v1/*.routes.js           → URL + middleware wiring (sessions, sports, profile, …)
modules/*/*.routes.js           → some modules own their own route file (venues, checkins, bookmarks, …)
modules/*/  *.controller.js     → request parsing, param extraction
            *.service.js        → business logic
models/*.model.js               → raw SQL against pg pool
```

Route registration is in `backend/src/routes/v1.js` — check there to see which pattern a module uses.
Venue portal is mounted at `/api/v1/admin` (not `/api/v1/venue-portal`).

| Path | Purpose |
|---|---|
| `backend/src/app.js` | Express app factory — rate limits, CORS, Swagger |
| `backend/src/lib/errors.js` | `Errors.*` factory + `AppError` class |
| `backend/src/lib/respond.js` | Response helpers |
| `backend/src/middleware/verifyToken.js` | JWT auth + user sync |
| `backend/src/middleware/errorHandler.js` | Global error handler |
| `backend/supabase/migrations/` | Schema source of truth |
| `backend/docs/openapi.yaml` | OpenAPI spec (auto-built) |

### Frontend — feature-first structure

```
frontend/src/features/<name>/
  pages/       → route-level components
  views/       → sub-page sections
  components/  → feature-local components
  hooks/       → feature-local hooks
  services/    → API call functions
```

| Path | Purpose |
|---|---|
| `frontend/src/components/form/` | Shared form primitives — reuse these |
| `frontend/src/components/ui/` | Shared UI primitives |
| `frontend/src/stores/` | Zustand stores |
| `frontend/src/api/` | Shared API client config |

### Living documents — all in `docs/`

See `docs/README.md` for the full navigation index.

| File | Purpose |
|---|---|
| `docs/SPEC.md` | API contracts, query params, response shapes — read before touching routes |
| `docs/DATABASE_WORKFLOW.md` | Migration workflow — read before any schema change |
| `docs/DECISIONS.md` | Architectural decisions log — append when a non-obvious choice is made |
| `docs/STATUS.md` | Feature implementation state (done / partial / mock / not started) — read at session start, update when status changes |

---

## Backend Rules

**Errors — always use `Errors.*` factories:**
```js
throw Errors.notFound('Session not found')
throw Errors.forbidden('Only the host can update this session')
throw Errors.validation('Invalid sport key', { field: 'sport_key' })
```
Never `res.status(400).json(...)` directly from a controller. Let `errorHandler` handle it.

**Response shape — two patterns only:**
```js
// success
res.json({ ok: true, data: { ... } })
res.json({ ok: true, data: { items: [...], page: { limit, offset, has_more } } })

// error (handled by errorHandler automatically)
throw Errors.notFound(...)
```

**SQL — raw SQL via pg pool, no query builders:**
```js
const { pool } = require('../../lib/db')
const { rows } = await pool.query('SELECT ...', [param1, param2])
```

**Auth patterns:**
- Protected route: `verifyToken` middleware
- Optional auth: `optionalAuth` middleware (passes through if no header)
- Role checks: `requireRoles`, `verifyVenueOwner` middleware

**Module layering — strict:**
- Controllers never query the DB directly — delegate to service
- Services never touch `req`/`res` — pure business logic
- Models are pure SQL — no business logic

---

## Frontend Rules

**Forms — always reuse shared primitives:**
- `FieldSection` — wraps a group of fields with a label
- `FloatingField` — floating-label input wrapper
- `InputField` — base input component
- All in `frontend/src/components/form/`

**State:**
- Server state → React Query (`@tanstack/react-query`)
- Client/UI state → Zustand stores in `frontend/src/stores/`
- No `useState` for data that comes from the API

**TypeScript:**
- No `any` — use proper types or generate from OpenAPI (`npm run types:api`)
- Strict mode is on

**Styling:**
- Tailwind CSS v4 utility classes only
- No inline `style={}` unless absolutely necessary (e.g., dynamic map dimensions)

**Prettier:**
- `singleQuote: true`
- Use `"double quotes"` only when the string contains an apostrophe
- Never use backticks as a workaround for quote conflicts

---

## Database Rules

Read `docs/DATABASE_WORKFLOW.md` before any schema change. Full script reference is in that file.

- `backend/supabase/migrations/` is the **only** schema source of truth
- Never modify the remote DB directly — always via `npm run db:remote:push`
- Local dev flow: `npm run db:local:migrate` → `npm run db:verify` → push

**Migration naming:**
```
YYYYMMDDHHMMSS_description_of_change.sql
```

**Before pushing to remote:**
```bash
cd backend && npm run db:verify  # schema vs OpenAPI contract check
cd backend && npm run db:remote:push
```

---

## AI Team — When to Use Which Skill

| Task | Skill | Project context |
|---|---|---|
| New feature design, DB schema, API contract | `/principal-architect` | `.claude/skills/principal-architect.md` |
| Implementation (FE + BE + infra) | `/senior-engineer` | `.claude/skills/senior-engineer.md` |
| Writing or reviewing tests | `/qa-engineer` | `.claude/skills/qa-engineer.md` |
| Pre-ship audit | `/tech-lead` | `.claude/skills/tech-lead.md` |
| Code review on a PR or diff | `/code-review` | `.claude/skills/code-review.md` |
| Product/roadmap decisions | `/product-manager` | — |
| Security review | `/security-review` | `.claude/skills/security-review.md` |

Each skills file in `.claude/skills/` contains HopCourts-specific checklists, file locations, and patterns for that role. Read the relevant file at the start of a skill session.

**Default workflow for a new feature:**
1. `/product-manager` — define scope and acceptance criteria
2. `/principal-architect` — design API contract + DB schema, update `docs/SPEC.md`
3. `/senior-engineer` — implement vertical slice (BE + FE together); self-audit before handoff
4. `/qa-engineer` — write tests
5. `/code-review` — independent audit against Non-Negotiables checklist
   - **PASS** → proceed to step 6
   - **REJECTED** → return rejection list to step 3; `/senior-engineer` fixes and resubmits; repeat until PASS
6. `/tech-lead` — pre-ship architectural audit; update `docs/STATUS.md` and `docs/DECISIONS.md`
7. `/security-review` — final pre-release scan for auth gaps, SQL injection, and data exposure
8. **Human approval** — review the final output and merge to `main`

---

## Non-Negotiables

**Code:**
- **No ORM** — raw SQL only via `pg` pool
- **No `any` in TypeScript** — generate types from OpenAPI if needed
- **No direct DB manipulation** — always via migrations
- **No business logic in controllers** — delegate to services
- **No `res.json()` errors** — throw `Errors.*`, let `errorHandler` catch it
- **Schema changes must pass `npm run db:verify`** before remote push
- **`docs/SPEC.md` is authoritative** for API contracts — update it when routes change

**Documentation (task is not done until these are updated):**
- **Update `docs/STATUS.md`** before closing any feature task — if a feature moved from 🟡 to ✅, or a new gap was discovered, the row must reflect it
- **Append to `docs/DECISIONS.md`** whenever a non-obvious architectural choice is made during the session — one line, append-only, never delete
