-- C1 Venue Portal Schema Setup

-- 1. Create venue_profiles table to store extended branding info
CREATE TABLE IF NOT EXISTS public.venue_profiles (
    venue_id UUID PRIMARY KEY REFERENCES public.venues(id) ON DELETE CASCADE,
    logo_url TEXT,
    cover_url TEXT,
    description TEXT,
    social_links JSONB DEFAULT '{}',
    images JSONB DEFAULT '[]',
    opening_hours JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add official activity tracking to sessions
ALTER TABLE public.sessions
ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS published_by_venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL;

-- 3. Create index for official sessions for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_official ON public.sessions(is_official);
CREATE INDEX IF NOT EXISTS idx_sessions_venue_source ON public.sessions(published_by_venue_id);
