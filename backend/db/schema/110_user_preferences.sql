create table if not exists public.user_preferences (
  user_id uuid primary key references public.users(id) on delete cascade,
  preferred_time text,
  sessions_per_week int,
  day_slots jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at_user_preferences()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_user_preferences_updated_at on public.user_preferences;
create trigger trg_user_preferences_updated_at
before update on public.user_preferences
for each row execute function public.set_updated_at_user_preferences();
