alter table public.session_participants
  add column if not exists on_the_way_at timestamptz;
