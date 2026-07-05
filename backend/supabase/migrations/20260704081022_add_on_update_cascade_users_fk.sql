-- Add ON UPDATE CASCADE to all FK constraints referencing users.id.
-- This allows programmatic ID reconciliation when a Supabase UUID drifts out of
-- sync with the DB row (e.g. system migration) without the account being deleted.
-- ON DELETE behaviour is preserved exactly as-is.

BEGIN;

-- user_sports
ALTER TABLE public.user_sports DROP CONSTRAINT IF EXISTS user_sports_user_id_fkey;
ALTER TABLE public.user_sports ADD CONSTRAINT user_sports_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- user_preferences
ALTER TABLE public.user_preferences DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;
ALTER TABLE public.user_preferences ADD CONSTRAINT user_preferences_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- follows
ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_follower_id_fkey;
ALTER TABLE public.follows ADD CONSTRAINT follows_follower_id_fkey
  FOREIGN KEY (follower_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_following_id_fkey;
ALTER TABLE public.follows ADD CONSTRAINT follows_following_id_fkey
  FOREIGN KEY (following_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- venues
ALTER TABLE public.venues DROP CONSTRAINT IF EXISTS venues_owner_user_id_fkey;
ALTER TABLE public.venues ADD CONSTRAINT venues_owner_user_id_fkey
  FOREIGN KEY (owner_user_id) REFERENCES public.users(id) ON UPDATE CASCADE;

ALTER TABLE public.venues DROP CONSTRAINT IF EXISTS venues_created_by_fkey;
ALTER TABLE public.venues ADD CONSTRAINT venues_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- sessions
ALTER TABLE public.sessions DROP CONSTRAINT IF EXISTS sessions_host_user_id_fkey;
ALTER TABLE public.sessions ADD CONSTRAINT sessions_host_user_id_fkey
  FOREIGN KEY (host_user_id) REFERENCES public.users(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- session_participants
ALTER TABLE public.session_participants DROP CONSTRAINT IF EXISTS session_participants_user_id_fkey;
ALTER TABLE public.session_participants ADD CONSTRAINT session_participants_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- check_ins
ALTER TABLE public.check_ins DROP CONSTRAINT IF EXISTS check_ins_user_id_fkey;
ALTER TABLE public.check_ins ADD CONSTRAINT check_ins_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;

-- feedback
ALTER TABLE public.feedback DROP CONSTRAINT IF EXISTS feedback_user_id_fkey;
ALTER TABLE public.feedback ADD CONSTRAINT feedback_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;

-- notifications
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_recipient_user_id_fkey;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_recipient_user_id_fkey
  FOREIGN KEY (recipient_user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_actor_user_id_fkey;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_actor_user_id_fkey
  FOREIGN KEY (actor_user_id) REFERENCES public.users(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- push_subscriptions
ALTER TABLE public.push_subscriptions DROP CONSTRAINT IF EXISTS push_subscriptions_user_id_fkey;
ALTER TABLE public.push_subscriptions ADD CONSTRAINT push_subscriptions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- venue_claims
ALTER TABLE public.venue_claims DROP CONSTRAINT IF EXISTS venue_claims_owner_id_fkey;
ALTER TABLE public.venue_claims ADD CONSTRAINT venue_claims_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE public.venue_claims DROP CONSTRAINT IF EXISTS venue_claims_reviewed_by_admin_id_fkey;
ALTER TABLE public.venue_claims ADD CONSTRAINT venue_claims_reviewed_by_admin_id_fkey
  FOREIGN KEY (reviewed_by_admin_id) REFERENCES public.users(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- venue_audit_logs
ALTER TABLE public.venue_audit_logs DROP CONSTRAINT IF EXISTS venue_audit_logs_admin_id_fkey;
ALTER TABLE public.venue_audit_logs ADD CONSTRAINT venue_audit_logs_admin_id_fkey
  FOREIGN KEY (admin_id) REFERENCES public.users(id) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;
