create table if not exists public.session_bookmarks (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.users(id) on delete cascade,
  session_id  uuid        not null references public.sessions(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, session_id)
);

create index if not exists session_bookmarks_user_id_idx on public.session_bookmarks (user_id);
