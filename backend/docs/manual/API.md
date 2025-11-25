# SportsMatch API Manual

This document explains the SportsMatch backend API in a human‑friendly way.
It is written for founders, product people, designers, and engineers to share
a common understanding of how the product behaves over the API.

This is **not** the machine spec (that lives in `openapi.yaml`).
Instead, this is the narrative layer: why the API exists, what each piece means,
and how it connects to the product experience.

---

## A. Overview

### Purpose

SportsMatch is a platform for discovering and hosting small, local sport sessions
(“games”) and, over time, broader “crews” around movement and shared interests.

The API exists to:

- Power the web app (and future native apps)
- Provide a consistent contract between frontend and backend
- Make it easy for future teammates (and tools like AI agents) to understand
  how data flows through the system

### Design Principles

1. **Product‑first, not database‑first**  
   The API is designed around what the UI needs to show and what the user
   is trying to do, not around raw database tables.

2. **DTOs as the shared language**  
   DTOs (Data Transfer Objects) are the shapes of data that travel over the API.
   They are defined in TypeScript under `src/dto/*.ts` and mirrored in
   `openapi.yaml`.

3. **Soft gate instead of hard wall**  
   Where possible, people can browse without an account. When an action requires
   an account (e.g., joining a game), we apply a “soft gate”: we show a gentle
   prompt (bottom sheet) explaining why login is needed.

4. **Simple, explicit responses**  
   All JSON responses are wrapped in a top‑level `data` field. Error responses
   use clear HTTP status codes and, where helpful, custom error codes.

5. **Stable contracts, evolving internals**  
   DTOs and endpoints are treated as contracts. We prefer additive changes
   (adding new fields) over breaking changes. Internally, database schemas and
   services can change as long as DTOs stay stable.

---

## B. DTO Specifications

DTOs (Data Transfer Objects) are the “shapes” of data sent between backend and frontend.
They hide internal database details and expose only what the UI needs.

Below are the main DTOs currently used for games.

### SkillLevel

Represents the recommended skill level for a game.

- `all` – suitable for anyone
- `beginner`
- `intermediate`
- `advanced`

### PriceType

Represents how participants pay for a session.

- `free` – completely free
- `pay_on_site` – pay at the venue (cash/card/AA)
- `fixed` – fixed price defined in `priceAmount` + `currency`

### GameStatus

Represents the lifecycle state of a game.

- `draft` – created but not fully published yet
- `published` – visible and joinable
- `cancelled` – cancelled by the host
- `completed` – session has finished

### HostSummaryDTO

Lightweight information about the host.

Fields:

- `id: string` – host identifier (profile id)
- `displayName: string` – name shown in the UI
- `avatarUrl?: string | null` – profile picture
- `tagline?: string | null` – short line about the host
- `rating?: number | null` – average rating (future use)
- `totalHostedSessions?: number | null` – how many games they’ve hosted

### AttendeeSummaryDTO

Minimal information about each attendee.

Fields:

- `id: string`
- `displayName: string`
- `avatarUrl?: string | null`
- `isHost: boolean` – `true` if this attendee is the host

### GameCardDTO

Used on listing / explore screens. This is the “card” UI users see when scrolling.

Fields:

- `id: string` – game id
- `title: string` – game title
- `sport: string` – sport category (e.g., Bouldering, Basketball)
- `skillLevel: SkillLevel` – recommended level
- `coverPhotoUrl?: string | null` – optional cover image
- `startDateTime: string` – ISO 8601 datetime (UTC)
- `endDateTime: string` – ISO 8601 datetime (UTC)
- `locationName: string` – short label, e.g. “Urban Climb Newstead”
- `area?: string | null` – neighbourhood or area
- `city?: string | null` – city (e.g., Brisbane)
- `countryCode?: string | null` – ISO country code (e.g., AU, TW)
- `priceType: PriceType` – how payment works
- `priceAmount?: number | null` – only used when `priceType = 'fixed'`
- `currency?: string | null` – ISO currency code (e.g., AUD)
- `capacity: number` – max participants
- `joinedCount: number` – number of participants currently joined
- `waitlistCount: number` – people on waitlist
- `host: HostSummaryDTO` – host info
- `spotsRemaining: number` – `capacity - joinedCount`
- `isFull: boolean` – true if no spots remaining
- `isFree: boolean` – convenience flag (based on price)

### GameDetailDTO

Full detail used on the Game Detail page.

Fields:

- `id: string`
- `title: string`
- `sport: string`
- `skillLevel: SkillLevel`
- `status: GameStatus`
- `coverPhotoUrl?: string | null`
- `host: HostSummaryDTO`
- `startDateTime: string`
- `endDateTime: string`
- `locationName: string`
- `addressLine?: string | null` – full address line
- `area?: string | null`
- `city?: string | null`
- `countryCode?: string | null`
- `latitude?: number | null`
- `longitude?: number | null`
- `priceType: PriceType`
- `priceAmount?: number | null`
- `currency?: string | null`
- `capacity: number`
- `joinedCount: number`
- `waitlistCount: number`
- `spotsRemaining: number`
- `isFull: boolean`
- `description: string` – main description text
- `notesForAttendees?: string | null` – extra notes / reminders
- `attendees: AttendeeSummaryDTO[]` – list of attendees
- `isUserHost: boolean` – current user is host
- `isUserJoined: boolean` – current user has joined
- `isUserWaitlisted: boolean` – current user is on the waitlist

### SaveGamePayload

Used when creating or editing a game.

Fields:

- `id?: string` – present only when updating an existing game
- `title: string`
- `sport: string`
- `skillLevel: SkillLevel`
- `startDateTime: string`
- `endDateTime: string`
- `locationName: string`
- `addressLine?: string | null`
- `area?: string | null`
- `city?: string | null`
- `countryCode?: string | null`
- `latitude?: number | null`
- `longitude?: number | null`
- `capacity: number`
- `priceType: PriceType`
- `priceAmount?: number | null`
- `currency?: string | null`
- `description: string`
- `notesForAttendees?: string | null`
- `coverPhotoUrl?: string | null`
- `status: GameStatus`

---

## C. Endpoints Summary Table

This table gives a high‑level overview of the main game‑related endpoints.

| Method | Path             | Description                          | Auth        | Response DTO     |
|--------|------------------|--------------------------------------|------------|------------------|
| GET    | `/games`         | List games for explore feed          | Optional    | `GameCardDTO[]`  |
| GET    | `/games/{id}`    | Get full game detail                 | Optional    | `GameDetailDTO`  |
| POST   | `/games`         | Create or update a game              | Required    | `GameDetailDTO`  |

Notes:

- “Optional” auth means the endpoint can be called without login, but behaviour
  may be richer when the user is authenticated (e.g., `isUserJoined` flags).
- All responses are wrapped in `{ "data": ... }`.

---

## D. Endpoints Detail

### 1. GET `/games`

**Purpose**  
Returns a list of games for the Explore view. This is the main entry point
for discovering sessions.

**Auth**  
- Optional
- Logged‑out users can still see the explore feed (soft gate model).

**Request**  
- No body.
- In the future, query parameters (e.g. `?sport=`, `?date=`, `?city=`) may be added.

**Response**

```jsonc
{
  "data": [
    {
      "id": "game_123",
      "title": "Bouldering Session",
      "sport": "Bouldering",
      "skillLevel": "intermediate",
      "startDateTime": "2025-11-17T05:00:00Z",
      "endDateTime": "2025-11-17T06:30:00Z",
      "locationName": "Urban Climb Newstead",
      "area": "Newstead",
      "city": "Brisbane",
      "countryCode": "AU",
      "priceType": "pay_on_site",
      "capacity": 8,
      "joinedCount": 1,
      "waitlistCount": 0,
      "spotsRemaining": 7,
      "isFull": false,
      "isFree": false,
      "host": {
        "id": "user_123",
        "displayName": "Alison Wu"
      }
    }
  ]
}
```

---

### 2. GET `/games/{id}`

**Purpose**  
Returns full details for a single game, used on the Game Detail page.

**Auth**  
- Optional
- When the user is logged in:
  - `isUserHost`, `isUserJoined`, `isUserWaitlisted` reflect their relationship
    to the game.
- When logged out:
  - These flags default to `false`.

**Path Parameters**

- `id: string` – Game id

**Response**

```jsonc
{
  "data": {
    "id": "game_123",
    "title": "Bouldering Session",
    "sport": "Bouldering",
    "skillLevel": "intermediate",
    "status": "published",
    "coverPhotoUrl": null,
    "host": {
      "id": "user_123",
      "displayName": "Alison Wu",
      "avatarUrl": null
    },
    "startDateTime": "2025-11-17T05:00:00Z",
    "endDateTime": "2025-11-17T06:30:00Z",
    "locationName": "Urban Climb Newstead",
    "addressLine": "5 Longland St, Newstead QLD",
    "area": "Newstead",
    "city": "Brisbane",
    "countryCode": "AU",
    "latitude": -27.452,
    "longitude": 153.043,
    "priceType": "pay_on_site",
    "priceAmount": null,
    "currency": null,
    "capacity": 8,
    "joinedCount": 1,
    "waitlistCount": 0,
    "spotsRemaining": 7,
    "isFull": false,
    "description": "Come hang, climb and chill with a friendly crew.",
    "notesForAttendees": "Please bring your own climbing shoes.",
    "attendees": [
      {
        "id": "user_123",
        "displayName": "Alison Wu",
        "avatarUrl": null,
        "isHost": true
      }
    ],
    "isUserHost": false,
    "isUserJoined": false,
    "isUserWaitlisted": false
  }
}
```

---

### 3. POST `/games`

**Purpose**  
Create a new game or update an existing one.

**Auth**  
- Required.  
  Only authenticated users can host or edit games.

**Behaviour**

- If `id` is **not** provided in the payload → create a new game.
- If `id` **is** provided → update the existing game (authorization rules apply).

**Request Body**

Example (create draft):

```jsonc
{
  "title": "Bouldering Session",
  "sport": "Bouldering",
  "skillLevel": "intermediate",
  "startDateTime": "2025-11-17T05:00:00Z",
  "endDateTime": "2025-11-17T06:30:00Z",
  "locationName": "Urban Climb Newstead",
  "capacity": 8,
  "priceType": "pay_on_site",
  "description": "Come hang, climb and chill with a friendly crew.",
  "status": "draft"
}
```

**Success Response**

```jsonc
{
  "data": {
    // Full GameDetailDTO
  }
}
```

---

## E. Auth & Soft Gate Behaviour

SportsMatch uses a “soft gate” pattern:

- Browsing is mostly open.
- Certain actions require an account and will trigger a friendly prompt.

### General Rules

1. **Browse games (GET `/games`, GET `/games/{id}`)**  
   - Allowed without login.
   - If logged in, user‑specific flags are populated (isUserJoined, etc.).

2. **Create or edit games (POST `/games`)**  
   - Login required.  
   - If not authenticated, the API returns `401 Unauthorized`.  
   - The frontend should catch this and show a bottom sheet explaining
     why an account is needed (not a hard redirect).

3. **Join / leave / waitlist actions (future endpoints)**  
   - Will also require login and follow the same soft gate pattern.

---

## F. Error Codes

The API uses standard HTTP status codes, plus optional custom error codes
in the JSON body to help the frontend show more specific messages.

### HTTP Status Codes

- **200 OK** – Request succeeded.
- **400 Bad Request** – Validation failed (missing or invalid fields).
- **401 Unauthorized** – User is not authenticated.
- **403 Forbidden** – User is authenticated but not allowed to perform the action.
- **404 Not Found** – The resource does not exist (e.g. game id is invalid).
- **409 Conflict** – The request conflicts with current state (e.g. game full).
- **500 Internal Server Error** – Unexpected server error.

### Example Error Body

```jsonc
{
  "error": {
    "code": "GAME_FULL",
    "message": "This game is already full."
  }
}
```

Potential application‑level error codes (examples, not final):

- `GAME_FULL`
- `ALREADY_JOINED`
- `GAME_NOT_FOUND`
- `NOT_GAME_HOST`
- `UNAUTHENTICATED`

---

## G. Versioning & Deprecation

Over time, the API will evolve. To keep changes manageable:

1. **Additive changes first**  
   - Prefer adding new fields over changing or removing existing ones.
   - Clients should ignore unknown fields.

2. **Breaking changes need a plan**  
   - If a breaking change is truly required, consider introducing a new version
     (`/v2/games`) or new DTO names, and marking the old one as deprecated.

3. **Deprecation communication**  
   - Deprecated endpoints or fields should be documented in this file.
   - Frontend should have a migration plan before old behaviour is removed.

---

This document describes the human‑level behaviour and intentions of the Games API.
For the precise machine‑readable contract used by Swagger UI and tooling,
refer to `docs/manual/openapi.yaml`.
