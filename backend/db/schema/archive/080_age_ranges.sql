create table if not exists public.age_ranges (
  key text primary key,
  label_zh text not null,
  label_en text not null,
  sort int not null default 0,
  is_active boolean not null default true
);
