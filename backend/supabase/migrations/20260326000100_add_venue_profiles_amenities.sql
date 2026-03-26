-- Add amenities JSONB column to venue_profiles for structured amenity groups
-- Stores: { facilities: {...}, playing: {...}, services: {...}, supply: {...} }
ALTER TABLE public.venue_profiles
  ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '{}';
