insert into public.countries (key, name_zh, name_en, sort, is_active) values
  ('TW', '台灣', 'Taiwan', 10, true)
on conflict (key) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  sort = excluded.sort,
  is_active = excluded.is_active;
