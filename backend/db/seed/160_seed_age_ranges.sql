insert into public.age_ranges (key, label_zh, label_en, sort, is_active) values
  ('AGE_18_24', '18-24', '18-24', 10, true),
  ('AGE_25_34', '25-34', '25-34', 20, true),
  ('AGE_35_44', '35-44', '35-44', 30, true),
  ('AGE_45_54', '45-54', '45-54', 40, true),
  ('AGE_55_PLUS', '55+', '55+', 50, true)
on conflict (key) do update set
  label_zh = excluded.label_zh,
  label_en = excluded.label_en,
  sort = excluded.sort,
  is_active = excluded.is_active;
