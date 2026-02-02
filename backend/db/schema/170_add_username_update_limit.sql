-- Allow username to be NULL initially (avoiding Supabase ID as default)
ALTER TABLE public.users ALTER COLUMN username DROP NOT NULL;

-- Track how many times username has been changed
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username_updated_count INT DEFAULT 0;

-- Optional: Initialize count for existing users who have a non-default username
-- (Though we just wiped the DB, this is good for migration consistency)
UPDATE public.users SET username_updated_count = 1 WHERE username IS NOT NULL AND username !~ '^[0-9a-f]{8}-';
