-- Core sports dictionary. Used as FK target for sessions.sport_key.
create table if not exists public.sports (
  key text primary key,
  label_zh text not null,
  label_en text,
  category text,
  icon text,
  sort integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_sports_sort on public.sports(sort);
create index if not exists idx_sports_active on public.sports(is_active);
