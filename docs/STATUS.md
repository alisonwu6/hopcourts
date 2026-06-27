# Feature Status

> Working memory for implementation state. Update this when you complete, partially implement, or discover a gap in a feature.
> Format: ✅ done | 🟡 partial / mock | ❌ not started

Last updated: 2026-06-26 (verified against codebase)

---

## Core Features

| Feature | Backend | Frontend | Notes |
|---|---|---|---|
| Sessions (CRUD) | ✅ | ✅ | Fully implemented; `interests` + `relations` feed types done; tests in `sessions.routes.test.js` |
| Sessions join/leave | ✅ | ✅ | Auth-gated; host notifications wired |
| Venue submit | ✅ | ✅ | `POST /api/v1/venues/submit`; discriminated by `venue_type` (`public`/`official`); official auto-creates claim + 14-day trial |
| Auth (Supabase JWT) | ✅ | ✅ | `verifyToken.js`; ID mismatch migration handling is a TODO (line 39) |
| Push notifications | ✅ | ✅ | `PushNotificationBanner.tsx`; VAPID key endpoint live |
| Notifications | ✅ | ✅ | Module in `backend/src/modules/notifications/` |
| Profile | ✅ | ✅ | Module + feature folder both present |
| Bookmarks | ✅ | 🟡 | Backend module exists; no standalone FE feature folder — `BookmarkButton.tsx` is embedded in `events/components/` |
| Checkins | ✅ | — | Backend module exists; no frontend feature folder found |
| Sports / Dictionaries | ✅ | ✅ | Reference data endpoints; frontend `dictionaries` feature present |

## Venue Portal

| Feature | Backend | Frontend | Notes |
|---|---|---|---|
| Venue portal layout | ✅ | ✅ | `VenuePortalLayout`, owner auth via `verifyVenueOwner` |
| Venue schedule view | ✅ | 🟡 | `MOCK_PARTICIPANTS` in `VenueSchedulePage.tsx:26` — participant list not wired to real data |
| Venue profile view | ✅ | ✅ | `VenueProfileView` + `venuePortalService` |
| Session create (portal) | ✅ | 🟡 | `VenueSessionCreateView` exists; verify if it calls real endpoint or mock |

## Events

| Feature | Backend | Frontend | Notes |
|---|---|---|---|
| Events (discover, detail, create) | ✅ | ✅ | Full pages/hooks/services present; two minor TODOs (vibeIcon mapping, city extraction) — functionally complete |

## Profile & Mates

| Feature | Backend | Frontend | Notes |
|---|---|---|---|
| My profile | ✅ | ✅ | `profile/` feature with pages, hooks, components |
| Mate profile view | ✅ | ✅ | `MateProfilePage.tsx` and `useMateProfileQuery` in `profile/` feature |
| My mates list | ✅ | ✅ | `MyMatesPage.tsx` in `profile/` feature |
| MateCard component | — | 🟡 | `mates/components/MateCard.tsx` exists as a shared component; not a standalone feature |

## Admin

| Feature | Backend | Frontend | Notes |
|---|---|---|---|
| Admin venue management | ✅ | 🟡 | Backend via `adminRouter`; `AdminVenueManagementPage.tsx` exists — data wiring unverified |

---

## Known Gaps (verified from code)

1. **Venue schedule participants** — `VenueSchedulePage.tsx:26` uses `MOCK_PARTICIPANTS`. Needs a real endpoint to fetch session participants for a venue's scheduled session.
2. **Events vibeIcon** — `eventsService.ts:177` hardcodes `'🎯'`. Needs a sport-key → icon mapping.
3. **Events city extraction** — `eventsService.ts:187` sets `city: ''`. Needs logic to extract city from address string.
4. **Auth ID mismatch** — `verifyToken.js:39` has a TODO for handling Supabase ID vs DB ID divergence during migration.
