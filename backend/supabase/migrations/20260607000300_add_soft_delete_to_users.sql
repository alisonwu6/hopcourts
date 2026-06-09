-- Add soft delete support to users table.
-- Deleted users retain their row so event history remains intact for participants.
-- Supabase Auth entry is removed separately (they can't log in), but the DB row stays.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON public.users(deleted_at)
  WHERE deleted_at IS NOT NULL;
