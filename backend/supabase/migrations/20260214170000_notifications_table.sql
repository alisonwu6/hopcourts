-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  recipient_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,

  type text NOT NULL, -- Flexible type, checked by application logic or expand constraint later
  
  entity_type text,         -- 'session' | 'announcement'
  entity_id uuid,           -- session_id etc.
  title text NOT NULL,
  message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,  -- deep_link etc.

  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,

  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created
  ON public.notifications(recipient_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread
  ON public.notifications(recipient_user_id, is_read, created_at DESC);

-- RLS Policy (Enable if RLS is active on table, currently assume managed by backend service role or application logic)
-- ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = recipient_user_id);
