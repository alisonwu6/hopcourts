create table if not exists venue_official_waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  user_id     uuid references users(id) on delete set null,
  created_at  timestamptz not null default now(),
  constraint venue_official_waitlist_email_unique unique (email)
);
