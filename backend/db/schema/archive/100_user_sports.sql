create table if not exists public.user_sports (
  user_id uuid not null references public.users(id) on delete cascade,
  sport_key text not null references public.sports(key),
  kind text not null check (kind in ('FAVORITE', 'TRYING')),
  created_at timestamptz not null default now(),
  primary key (user_id, sport_key, kind)
);
