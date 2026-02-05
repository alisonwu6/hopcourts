-- 165_add_gender_to_users.sql
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS gender TEXT;
