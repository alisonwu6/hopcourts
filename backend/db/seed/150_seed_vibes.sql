insert into public.vibes (key, name_zh, name_en, sort, is_active) values
  ('CHILL', '健康與冥想', 'Chill', 10, true),
  ('SOCIAL', '社交與連結', 'Social', 20, true),
  ('FLOW', '習慣與穩定', 'Flow', 30, true),
  ('EXPLORER', '自由與探索', 'Explorer', 40, true),
  ('GROWTH', '學習與成長', 'Growth', 50, true),
  ('COMPETITIVE', '競爭與挑戰', 'Competitive', 60, true),
  ('SUPPORTIVE', '歸屬與關懷', 'Supportive', 70, true)
on conflict (key) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  sort = excluded.sort,
  is_active = excluded.is_active;
