create table if not exists public.users (
  id uuid primary key,
  username text not null unique,
  display_name text not null,
  legal_name text,
  country_key text references public.countries(key),
  city_key text references public.cities(key),
  age_range_key text references public.age_ranges(key),
  vibe_key text references public.vibes(key),
  bio text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at_users()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row execute function public.set_updated_at_users();
