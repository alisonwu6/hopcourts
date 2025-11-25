# Games DB Schema (Draft)

## Table: games
Description: Core game/session entity backing GameCardDTO, GameDetailDTO, SaveGamePayload.

Columns:
- id: uuid, primary key, default gen_random_uuid()
- host_user_id: uuid, not null
  - FK → auth.users.id (or profiles.id), the host of this game

- title: text, not null
- sport: text, not null
- skill_level: text, not null
  - enum-like: 'all' | 'beginner' | 'intermediate' | 'advanced'

- start_datetime: timestamptz, not null
- end_datetime: timestamptz, not null

- location_name: text, not null
- address_line: text, nullable
- area: text, nullable
- city: text, nullable
- country_code: text, nullable   -- ISO 3166-1 alpha-2, e.g. 'AU', 'TW'
- latitude: double precision, nullable
- longitude: double precision, nullable

- price_type: text, not null
  - enum-like: 'free' | 'pay_on_site' | 'fixed'
- price_amount: numeric(10,2), nullable
- currency: text, nullable       -- ISO 4217, e.g. 'AUD', 'TWD'

- capacity: integer, not null
- status: text, not null
  - enum-like: 'draft' | 'published' | 'cancelled' | 'completed'

- description: text, not null
- notes_for_attendees: text, nullable
- cover_photo_url: text, nullable

- created_at: timestamptz, not null, default now()
- updated_at: timestamptz, not null, default now()

Indexes / constraints:
- index on (sport, start_datetime)
- index on (city, area, start_datetime)
- optional: index on (status, start_datetime)


## Table: game_members
Description: Join table tracking who is in which game, and whether they are host/joined/waitlisted.

Columns:
- id: uuid, primary key, default gen_random_uuid()
- game_id: uuid, not null
  - FK → games.id
- user_id: uuid, not null
  - FK → auth.users.id (or profiles.id)

- is_host: boolean, not null, default false

- status: text, not null
  - enum-like: 'joined' | 'waitlisted' | 'cancelled'
- joined_at: timestamptz, not null, default now()

Indexes / constraints:
- unique (game_id, user_id)      -- one row per user per game
- index on (user_id, status)
- index on (game_id, status)