create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  type text not null, -- 'issue', 'feature', 'account', 'other'
  message text not null,
  page text, -- Context (which page they were on)
  contact_email text, -- Optional email if different from user email or if guest
  allow_reply boolean default false,
  status text default 'new', -- 'new', 'triaged', 'done'
  meta jsonb default '{}', -- Extra data (browser info, etc)
  created_at timestamptz default now()
);

-- RLS Policies
alter table public.feedback enable row level security;

-- Users can insert their own feedback
create policy "Users can insert own feedback"
  on public.feedback for insert
  with check (auth.uid() = user_id);

-- Admins can view all feedback (assuming service_role or admin user)
-- For now, we might not have a dedicated admin interface in the app, but RLS is good practice.
-- Allow insert for authenticated users:
create policy "Authenticated users can insert feedback"
  on public.feedback for insert
  to authenticated
  with check (true);

-- Allow admins/service role to select/update
create policy "Service role can maximize feedback access"
  on public.feedback
  using (true)
  with check (true);
