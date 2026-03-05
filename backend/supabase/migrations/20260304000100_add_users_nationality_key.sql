ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS nationality_key TEXT REFERENCES public.countries(key);

CREATE INDEX IF NOT EXISTS idx_users_nationality_key ON public.users(nationality_key);
