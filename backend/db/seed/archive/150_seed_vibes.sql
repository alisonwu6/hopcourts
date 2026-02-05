insert into public.vibes (key, name_zh, name_en, subtitle_zh, subtitle_en, sort, is_active) values
  ('CHILL', '健康與冥想', 'Chill', '穩定節奏、身心對齊', 'Steady pace, mind-body aligned', 10, true),
  ('SOCIAL', '社交與連結', 'Social', '喜歡夥伴、一起流汗', 'Meet people, sweat together', 20, true),
  ('FLOW', '習慣與穩定', 'Flow', '每天一點，養成節奏', 'Small daily moves, steady rhythm', 30, true),
  ('EXPLORER', '自由與探索', 'Explorer', '熱愛冒險、說走就走', 'Up for anything new, go explore', 40, true),
  ('GROWTH', '學習與成長', 'Growth', '技術提升、專業進步', 'Level up skills, keep improving', 50, true),
  ('COMPETITIVE', '競爭與挑戰', 'Competitive', '追求極限、享受對決', 'Chasing limits, love a good match', 60, true),
  ('SUPPORTIVE', '歸屬與關懷', 'Supportive', '陪伴夥伴、不趕時間', 'Supportive pace, no rush', 70, true)
on conflict (key) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  subtitle_zh = excluded.subtitle_zh,
  subtitle_en = excluded.subtitle_en,
  sort = excluded.sort,
  is_active = excluded.is_active;
