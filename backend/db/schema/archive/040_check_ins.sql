-- Check-in records tied to sessions.
create table if not exists public.check_ins (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null,
  checked_in_at timestamptz not null default now(),
  lat double precision not null,
  lng double precision not null,
  distance_m integer,
  status text not null default 'ok',
  constraint checkins_status_chk check (status in ('ok','late','outside_radius','rejected')),
  constraint checkins_unique_user_per_session unique (session_id, user_id)
);

create index if not exists idx_checkins_session_id on public.check_ins(session_id);
create index if not exists idx_checkins_user_id on public.check_ins(user_id);
