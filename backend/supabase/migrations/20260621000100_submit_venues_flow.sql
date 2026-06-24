-- Support authenticated venue submissions.
-- Public submissions create an active public listing with submitter attribution.
-- Official submissions create an active official listing, an auto-approved claim,
-- and a 14-day trial while preserving the admin claim list as an audit surface.

ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS trial_starts_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT;

ALTER TABLE public.venues
  DROP CONSTRAINT IF EXISTS venues_subscription_status_check;

ALTER TABLE public.venues
  ADD CONSTRAINT venues_subscription_status_check
  CHECK (subscription_status IS NULL OR subscription_status IN ('trialing', 'active', 'past_due', 'canceled'));

CREATE INDEX IF NOT EXISTS idx_venues_created_by ON public.venues(created_by);
CREATE INDEX IF NOT EXISTS idx_venues_trial_ends_at ON public.venues(trial_ends_at);

CREATE TABLE IF NOT EXISTS public.venue_sports (
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  sport_key TEXT NOT NULL REFERENCES public.sports(key),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (venue_id, sport_key)
);

CREATE INDEX IF NOT EXISTS idx_venue_sports_sport_key ON public.venue_sports(sport_key);

ALTER TABLE public.venue_claims
  ADD COLUMN IF NOT EXISTS ownership_role TEXT,
  ADD COLUMN IF NOT EXISTS auto_approved BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.venue_claims
  DROP CONSTRAINT IF EXISTS venue_claims_ownership_role_check;

ALTER TABLE public.venue_claims
  ADD CONSTRAINT venue_claims_ownership_role_check
  CHECK (
    ownership_role IS NULL
    OR ownership_role IN ('owner', 'manager', 'official_representative', 'community_organizer')
  );

CREATE INDEX IF NOT EXISTS idx_venue_claims_auto_approved ON public.venue_claims(auto_approved);
