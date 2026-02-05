-- VENUE INFRASTRUCTURE V1.0 (FINAL)
-- Purpose: Establish immutable core venue tables and relations.

-- 1. Create venues table (Core Immutable)
CREATE TABLE IF NOT EXISTS public.venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lat numeric(9,6) NOT NULL,
  lng numeric(9,6) NOT NULL,

  name_display varchar(255),
  address_display varchar(255),
  logo_url text,

  -- Status: Core State
  status text NOT NULL DEFAULT 'unclaimed' CHECK (status IN ('unclaimed', 'claimed')),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Create venue_claims table (Claim Logic)
CREATE TABLE IF NOT EXISTS public.venue_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues(id),
  owner_id uuid NOT NULL REFERENCES public.users(id),

  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),

  claimed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Create venue_aliases table (Strict Deduplication Support)
CREATE TABLE IF NOT EXISTS public.venue_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues(id),
  alias_name varchar(255) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Create venue_metrics table (Future Data)
CREATE TABLE IF NOT EXISTS public.venue_metrics (
  venue_id uuid PRIMARY KEY REFERENCES public.venues(id),

  total_sessions int NOT NULL DEFAULT 0,
  total_participants int NOT NULL DEFAULT 0,

  last_activity_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Enable RLS and Explicitly Deny Direct Client Writes
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_metrics ENABLE ROW LEVEL SECURITY;

-- Venues: Public Read, No Direct Write (Service Role Only)
CREATE POLICY "Venues public read" ON public.venues FOR SELECT USING (true);
-- Note: Service role (backend) bypasses RLS, so these deny policies effectively block client SDK writes.
CREATE POLICY "Venues no direct insert" ON public.venues FOR INSERT WITH CHECK (false);
CREATE POLICY "Venues no direct update" ON public.venues FOR UPDATE USING (false);
CREATE POLICY "Venues no direct delete" ON public.venues FOR DELETE USING (false);

-- Aliases: Public Read, No Direct Write
CREATE POLICY "Aliases public read" ON public.venue_aliases FOR SELECT USING (true);
CREATE POLICY "Aliases no direct write" ON public.venue_aliases FOR ALL USING (false);

-- Metrics: Public Read, No Direct Write
-- IMPORTANT: venue_metrics MUST be updated only via backend service layer. No direct client-side writes allowed.
CREATE POLICY "Metrics public read" ON public.venue_metrics FOR SELECT USING (true);
CREATE POLICY "Metrics no direct write" ON public.venue_metrics FOR ALL USING (false);

-- 7. Update Sessions Table (Connection)
-- Support for location_source history tracking at session level
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS venue_id uuid REFERENCES public.venues(id);

ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS location_source text; -- 'map_select', 'place_search', 'manual'



-- 8. Create Indexes and Constraints (Performance & Logic Integrity)

-- Optimize for Spatial Queries (Bounding Box)
-- Note: Ideally usage of PostGIS GEOMETRY column with GIST index is preferred.
-- For standard Postgres, individual indexes help compound queries slightly better than one multi-column in some planners for range queries.
CREATE INDEX IF NOT EXISTS idx_venues_lat ON public.venues(lat);
CREATE INDEX IF NOT EXISTS idx_venues_lng ON public.venues(lng);
-- Kept composite for covers
CREATE INDEX IF NOT EXISTS idx_venues_lat_lng ON public.venues(lat, lng);

-- Venues Claims: Enforce SINGLE approved claim per venue
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_venue_claim 
ON public.venue_claims(venue_id) 
WHERE status = 'approved';

-- Venues Aliases: Prevent duplicate alias strings for the same venue
CREATE UNIQUE INDEX IF NOT EXISTS uniq_venue_alias 
ON public.venue_aliases(venue_id, alias_name);

CREATE INDEX IF NOT EXISTS idx_venue_claims_venue_id ON public.venue_claims(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_aliases_venue_id ON public.venue_aliases(venue_id);
