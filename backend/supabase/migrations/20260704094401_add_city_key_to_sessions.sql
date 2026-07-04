ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS city_key TEXT REFERENCES public.cities(key);

UPDATE public.sessions s
SET city_key = v.city_key
FROM public.venues v
WHERE s.venue_id = v.id
  AND v.city_key IS NOT NULL
  AND s.city_key IS NULL;

CREATE INDEX IF NOT EXISTS idx_sessions_city_key ON public.sessions(city_key);
