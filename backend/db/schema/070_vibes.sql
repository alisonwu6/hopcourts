create table if not exists public.vibes (
  key text primary key,
  name_zh text not null,
  name_en text not null,
  subtitle_zh text,
  subtitle_en text,
  sort int not null default 0,
  is_active boolean not null default true
);

-- Ensure subtitle columns exist when table already present
alter table public.vibes
  add column if not exists subtitle_zh text;

alter table public.vibes
  add column if not exists subtitle_en text;
