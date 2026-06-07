-- Allow email to be NULL to support GDPR-compliant soft delete.
-- When a user deletes their account, email (PII) is cleared while the row is retained for event history.

ALTER TABLE public.users
  ALTER COLUMN email DROP NOT NULL;
