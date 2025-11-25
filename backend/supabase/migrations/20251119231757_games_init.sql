drop table if exists public.game_members cascade;
drop table if exists public.games cascade;

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),

  host_user_id uuid not null,
  -- later: references auth.users (or profiles) once that model is final

  title text not null,
  sport text not null,
  skill_level text not null, -- 'all' | 'beginner' | 'intermediate' | 'advanced'

  start_datetime timestamptz not null,
  end_datetime timestamptz not null,

  location_name text not null,
  address_line text,
  area text,
  city text,
  country_code text, -- ISO 3166-1 alpha-2, e.g. 'AU', 'TW'
  latitude double precision,
  longitude double precision,

  price_type text not null, -- 'free' | 'pay_on_site' | 'fixed'
  price_amount numeric(10,2),
  currency text, -- ISO 4217, e.g. 'AUD', 'TWD'

  capacity integer not null,
  status text not null, -- 'draft' | 'published' | 'cancelled' | 'completed'

  description text not null,
  notes_for_attendees text,
  cover_photo_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for games
create index if not exists idx_games_sport_start_datetime
  on public.games (sport, start_datetime);

create index if not exists idx_games_city_area_start_datetime
  on public.games (city, area, start_datetime);

create index if not exists idx_games_status_start_datetime
  on public.games (status, start_datetime);


-- Game members join table
create table if not exists public.game_members (
  id uuid primary key default gen_random_uuid(),

  game_id uuid not null references public.games(id) on delete cascade,
  user_id uuid not null,
  -- later: references auth.users(id) or profiles(id) when that model is final

  is_host boolean not null default false,

  status text not null, -- 'joined' | 'waitlisted' | 'cancelled'
  joined_at timestamptz not null default now()
);

-- Constraints & indexes for game_members
alter table public.game_members
  add constraint uq_game_members_game_user unique (game_id, user_id);

create index if not exists idx_game_members_user_status
  on public.game_members (user_id, status);

create index if not exists idx_game_members_game_status
  on public.game_members (game_id, status);