-- 166_add_age_range_to_users.sql
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS age_range_key TEXT REFERENCES public.age_ranges(key);
