-- Create venue_claims table for venue claim/ownership flow

CREATE TABLE IF NOT EXISTS public.venue_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- The official user assigned by admin
  
  -- Contact info for the claimer
  contact_name TEXT,
  contact_person TEXT,
  contact_title TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  note TEXT,
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by_admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Indexes for queries
CREATE INDEX IF NOT EXISTS idx_venue_claims_venue_id ON public.venue_claims(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_claims_owner_id ON public.venue_claims(owner_id);
CREATE INDEX IF NOT EXISTS idx_venue_claims_status ON public.venue_claims(status);
CREATE INDEX IF NOT EXISTS idx_venue_claims_contact_email ON public.venue_claims(contact_email);

-- Optional: audit table for venue changes (optional but good for governance)
CREATE TABLE IF NOT EXISTS public.venue_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'venue', 'venue_claim'
  target_id UUID NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_audit_logs_admin_id ON public.venue_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_venue_audit_logs_target ON public.venue_audit_logs(target_type, target_id);
