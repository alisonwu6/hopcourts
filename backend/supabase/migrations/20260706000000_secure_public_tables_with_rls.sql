-- Secure every application table in the exposed public schema that previously
-- relied only on application-layer authorization.

-- Public read-only catalog tables.
ALTER TABLE public.age_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vibes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_sports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read AgeRanges" ON public.age_ranges;
CREATE POLICY "Public Read AgeRanges"
  ON public.age_ranges FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public Read Cities" ON public.cities;
CREATE POLICY "Public Read Cities"
  ON public.cities FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public Read Countries" ON public.countries;
CREATE POLICY "Public Read Countries"
  ON public.countries FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public Read Sports" ON public.sports;
CREATE POLICY "Public Read Sports"
  ON public.sports FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public Read Vibes" ON public.vibes;
CREATE POLICY "Public Read Vibes"
  ON public.vibes FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public Read Venue Profiles" ON public.venue_profiles;
CREATE POLICY "Public Read Venue Profiles"
  ON public.venue_profiles FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public Read Venue Sports" ON public.venue_sports;
CREATE POLICY "Public Read Venue Sports"
  ON public.venue_sports FOR SELECT TO anon, authenticated
  USING (true);

REVOKE ALL ON TABLE
  public.age_ranges,
  public.cities,
  public.countries,
  public.sports,
  public.vibes,
  public.venue_profiles,
  public.venue_sports
FROM anon, authenticated;

GRANT SELECT ON TABLE
  public.age_ranges,
  public.cities,
  public.countries,
  public.sports,
  public.vibes,
  public.venue_profiles,
  public.venue_sports
TO anon, authenticated;

-- User-owned tables.
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = recipient_user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = recipient_user_id)
  WITH CHECK ((SELECT auth.uid()) = recipient_user_id);

DROP POLICY IF EXISTS "Users can view their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can view their own push subscriptions"
  ON public.push_subscriptions FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can create their own push subscriptions"
  ON public.push_subscriptions FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can update their own push subscriptions"
  ON public.push_subscriptions FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can delete their own push subscriptions"
  ON public.push_subscriptions FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own session bookmarks" ON public.session_bookmarks;
CREATE POLICY "Users can view their own session bookmarks"
  ON public.session_bookmarks FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create their own session bookmarks" ON public.session_bookmarks;
CREATE POLICY "Users can create their own session bookmarks"
  ON public.session_bookmarks FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own session bookmarks" ON public.session_bookmarks;
CREATE POLICY "Users can delete their own session bookmarks"
  ON public.session_bookmarks FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

REVOKE ALL ON TABLE
  public.notifications,
  public.push_subscriptions,
  public.session_bookmarks
FROM anon, authenticated;

GRANT SELECT ON TABLE public.notifications TO authenticated;
GRANT UPDATE (is_read, read_at) ON TABLE public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.push_subscriptions TO authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.session_bookmarks TO authenticated;

-- Internal tables contain contact details or administrative audit data. They
-- intentionally have no anon/authenticated policies; the backend service role
-- bypasses RLS.
ALTER TABLE public.venue_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_official_waitlist ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE
  public.venue_audit_logs,
  public.venue_claims,
  public.venue_official_waitlist
FROM anon, authenticated;
