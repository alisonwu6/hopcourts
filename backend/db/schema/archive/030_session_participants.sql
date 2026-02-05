-- Tracks who joined which session.
create table if not exists public.session_participants (
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null,
  joined_at timestamptz not null default now(),
  role text not null default 'member',
  primary key (session_id, user_id),
  constraint session_participants_role_chk check (role in ('host','member'))
);

create index if not exists idx_participants_user_id on public.session_participants(user_id);
