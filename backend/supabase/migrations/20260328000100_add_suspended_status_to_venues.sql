-- Allow admin governance to suspend and unsuspend venues.

ALTER TABLE public.venues
  DROP CONSTRAINT IF EXISTS venues_status_check;

ALTER TABLE public.venues
  ADD CONSTRAINT venues_status_check
  CHECK (status IN ('unclaimed', 'claimed', 'suspended'));
