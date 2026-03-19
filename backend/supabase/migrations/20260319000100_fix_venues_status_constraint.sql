-- Fix venues.status CHECK constraint to use 'unclaimed'|'claimed' instead of 'active'|'pending'|'suspended'
ALTER TABLE public.venues DROP CONSTRAINT IF EXISTS venues_status_check;
ALTER TABLE public.venues ALTER COLUMN status SET DEFAULT 'unclaimed';
ALTER TABLE public.venues ADD CONSTRAINT venues_status_check CHECK (status IN ('unclaimed', 'claimed'));
