# HopCourts — Living Spec

> Last updated: 2026-03-10

---

## Architecture Overview

- **Backend:** Express 5 + Node ≥20, PostgreSQL via Supabase, raw SQL through `pg` pool
- **Frontend:** React 19 + TypeScript, Vite, React Router v7, Zustand, Tailwind CSS v4
- **Auth:** Supabase Auth + JWT middleware (`verifyToken.js`)
- **API base path:** `/api/v1`

---

## Sessions Feature

### `GET /api/v1/sessions`

Public discovery endpoint for listing sessions. Supports optional authentication.

**Query params:**

| Param      | Type   | Description |
|------------|--------|-------------|
| `type`     | string | Feed type: `upcoming` (default), `interests`, `relations` |
| `limit`    | number | Max results (1–50, default 20) |
| `offset`   | number | Pagination offset (default 0) |
| `from`     | ISO date | Filter start date |
| `to`       | ISO date | Filter end date |
| `sport_key`| string | Filter by sport |
| `city`     | string | Filter by city (ILIKE match on address) |

**Feed types:**

- `upcoming` — all upcoming public published sessions, no auth required
- `interests` — sessions whose `sport_key` matches any of the authenticated user's `user_sports` entries; **requires auth** (401 if not authenticated)
- `relations` — sessions joined by co-attendees (people who shared an event with the viewer in the last 3 months) that match the viewer's sports and exclude already-joined sessions; **requires auth** (401 if not authenticated)

**Auth behaviour:**
- `optionalAuth` middleware: passes through if no `Authorization` header; runs full `verifyToken` if a Bearer token is present (returns 401 on invalid token)
- Controller rejects `interests`/`relations` with 401 if `userId` is not resolved

**Response:**
```json
{
  "data": {
    "items": [ /* session objects */ ],
    "page": { "limit": 20, "offset": 0, "has_more": false }
  }
}
```

### `GET /api/v1/sessions/my`

Returns the authenticated user's sessions. Requires auth.

**Query params:** `type` (upcoming/hosted/joined/history), `role`, `time`, `limit`, `offset`

### `POST /api/v1/sessions`

Create a session. Requires auth. Auto-joins creator as organizer.

### `GET /api/v1/sessions/:id`

Get session detail including host info, participants, and viewer meta (is_joined, has_checked_in, spots_left). Optional auth (viewer meta requires userId).

### `PUT /api/v1/sessions/:id`

Update session. Requires auth. Only host can update. Notifies participants on change.

### `DELETE /api/v1/sessions/:id`

Delete session. Requires auth. Only host can delete. Notifies participants.

### `POST /api/v1/sessions/:id/join`

Join a session. Requires auth. Notifies host.

### `POST /api/v1/sessions/:id/leave` / `DELETE /api/v1/sessions/:id/join`

Leave a session. Requires auth. Notifies host.

---

## Key Files

| File | Purpose |
|------|---------|
| `backend/src/routes/v1/sessions.routes.js` | Route definitions + `optionalAuth` middleware |
| `backend/src/modules/sessions/sessions.controller.js` | Request handling, param extraction |
| `backend/src/modules/sessions/sessions.service.js` | Business logic, delegates to models |
| `backend/models/sessions.model.js` | Raw SQL queries against pg pool |
| `backend/src/middleware/verifyToken.js` | Supabase JWT verification + user sync |

---

## Test Coverage

- `backend/src/modules/sessions/__tests__/sessions.routes.test.js`
  - `GET /sessions?type=interests` without auth → 401
  - `GET /sessions?type=relations` without auth → 401
  - `GET /sessions?type=upcoming` without auth → 200
  - Service delegation: `upcoming` → `listUpcomingSessions`
  - Service delegation: `interests` → `listSessionsByUserInterests`
  - Service delegation: `relations` → `listSessionsByRelations`
  - `has_more` pagination flag behaviour

---

## Changelog

### 2026-03-10
- Added `type=interests` and `type=relations` feed types to `GET /api/v1/sessions`
- Added `optionalAuth` middleware to sessions routes
- Added `listSessionsByUserInterests` and `listSessionsByRelations` SQL model functions
- Installed Jest + Supertest for unit/integration testing
