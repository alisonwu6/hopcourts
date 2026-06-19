-- Add configurable venue profile fields for owner portal payloads
ALTER TABLE IF EXISTS public.venue_profiles
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS social_links JSONB,
  ADD COLUMN IF NOT EXISTS opening_hours JSONB,
  ADD COLUMN IF NOT EXISTS images JSONB,
  ADD COLUMN IF NOT EXISTS amenities JSONB,
  ADD COLUMN IF NOT EXISTS spaces JSONB,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
