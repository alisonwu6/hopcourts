-- Sessions (activities) master table.
create table if not exists public.sessions (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  host_user_id uuid not null,
  sport_key text not null references public.sports(key),

  title text,
  notes text,

  starts_at timestamptz not null,
  ends_at timestamptz,

  place_name text not null,
  address text,
  lat double precision not null,
  lng double precision not null,

  checkin_radius_m integer not null default 100,
  checkin_open_mins_before integer not null default 20,
  checkin_close_mins_after integer not null default 20,

  min_people integer not null default 2,
  max_people integer,

  status text not null default 'published',
  visibility text not null default 'public',

  constraint sessions_status_chk check (status in ('draft','published','cancelled','completed')),
  constraint sessions_visibility_chk check (visibility in ('public','unlisted')),
  constraint sessions_min_people_chk check (min_people >= 1),
  constraint sessions_max_people_chk check (max_people is null or max_people >= min_people),
  constraint sessions_checkin_radius_chk check (checkin_radius_m between 10 and 1000)
);

create index if not exists idx_sessions_starts_at on public.sessions(starts_at);
create index if not exists idx_sessions_sport_key on public.sessions(sport_key);
create index if not exists idx_sessions_status on public.sessions(status);

-- Keep updated_at fresh on write operations.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sessions_updated_at on public.sessions;
create trigger trg_sessions_updated_at
before update on public.sessions
for each row execute function public.set_updated_at();
