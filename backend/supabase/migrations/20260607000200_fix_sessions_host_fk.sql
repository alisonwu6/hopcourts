-- Fix sessions.host_user_id FK to SET NULL on user deletion.
-- Previously had no ON DELETE rule (defaults to RESTRICT), which blocked account deletion.

ALTER TABLE public.sessions
  DROP CONSTRAINT IF EXISTS sessions_host_user_id_fkey,
  ADD CONSTRAINT sessions_host_user_id_fkey
    FOREIGN KEY (host_user_id)
    REFERENCES public.users(id)
    ON DELETE SET NULL;
