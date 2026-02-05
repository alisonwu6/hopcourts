create table if not exists public.cities (
  key text primary key,
  country_key text not null references public.countries(key),
  name_zh text not null,
  name_en text not null,
  sort int not null default 0,
  is_active boolean not null default true
);
