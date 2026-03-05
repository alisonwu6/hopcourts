-- First-market rollout: restrict selectable cities to Brisbane only.

-- Ensure Brisbane exists.
INSERT INTO public.cities (key, country_key, name_zh, name_en, sort, is_active)
VALUES ('BRISBANE', 'AU', '布里斯本', 'Brisbane', 10, true)
ON CONFLICT (key) DO UPDATE SET
  country_key = EXCLUDED.country_key,
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  sort = EXCLUDED.sort,
  is_active = true;

-- Disable all other cities from selection lists.
UPDATE public.cities
SET is_active = false
WHERE key <> 'BRISBANE';
