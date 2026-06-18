-- Add venue_type enum to replace venues.is_official
-- sessions.is_official is unrelated and untouched

CREATE TYPE venue_type AS ENUM ('public', 'official', 'private');

ALTER TABLE public.venues
  ADD COLUMN venue_type venue_type NOT NULL DEFAULT 'public';

-- Migrate any existing official venues
UPDATE public.venues
  SET venue_type = 'official'
  WHERE is_official = true;

ALTER TABLE public.venues
  DROP COLUMN is_official;
