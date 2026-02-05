create table if not exists public.user_follows (
  follower_id uuid references public.users(id) on delete cascade not null,
  following_id uuid references public.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

create index if not exists idx_follows_follower on public.user_follows(follower_id);
create index if not exists idx_follows_following on public.user_follows(following_id);

-- Optional: Add RLS policies if needed, but for now server-side access bypasses RLS if using service role, 
-- or adheres to it if using authenticated client. 
-- Since api logic is node.js, it might use a privileged client?
-- The `db/client.js` uses `pg` pool which bypasses RLS (it's direct connection).
