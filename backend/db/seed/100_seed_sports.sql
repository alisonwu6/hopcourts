-- Seed core sports dictionary.
insert into public.sports (key, label_zh, label_en, category, icon, sort, is_active)
values
  ('basketball', '籃球', 'Basketball', 'social_competitive', '🏀', 10, true),
  ('badminton', '羽球', 'Badminton', 'social_competitive', '🏸', 20, true),
  ('table-tennis', '桌球', 'Table Tennis', 'social_competitive', '🏓', 30, true),
  ('volleyball', '排球', 'Volleyball', 'social_competitive', '🏐', 40, true),
  ('tennis', '網球', 'Tennis', 'social_competitive', '🎾', 50, true),
  ('pickleball', '匹克球', 'Pickleball', 'social_competitive', '🏓', 60, true),
  ('football', '足球', 'Football', 'social_competitive', '⚽', 70, true),
  ('baseball-softball', '棒壘球', 'Baseball / Softball', 'social_competitive', '⚾', 80, true),
  ('running', '慢跑', 'Running', 'adventure_endurance', '🏃', 90, true),
  ('cycling', '自行車', 'Cycling', 'adventure_endurance', '🚴', 100, true),
  ('hiking', '登山健行', 'Hiking', 'adventure_endurance', '🥾', 110, true),
  ('bouldering', '抱石', 'Bouldering', 'adventure_endurance', '🧗', 120, true),
  ('climbing', '戶外攀岩', 'Climbing', 'adventure_endurance', '🧗', 130, true),
  ('surfing', '衝浪', 'Surfing', 'adventure_endurance', '🏄', 140, true),
  ('diving', '潛水', 'Diving', '🤿', 150, true),
  ('gym', '重訓', 'Strength Training', '🏋️', 160, true),
  ('yoga', '瑜珈', 'Yoga', '🧘', 170, true),
  ('pilates', '皮拉提斯', 'Pilates', '🤸', 180, true),
  ('hiit', 'HIIT', 'HIIT', '🔥', 190, true),
  ('boxing', '拳擊', 'Boxing', '🥊', 200, true),
  ('martial-arts', '格鬥', 'Martial Arts', '🥋', 210, true),
  ('pop-dance', '流行舞', 'Pop Dance', '💃', 220, true),
  ('street-dance', '街舞', 'Street Dance', '🕺', 230, true),
  ('skateboard', '滑板', 'Skateboarding', '🛹', 240, true)
on conflict (key) do update
set
  label_zh = excluded.label_zh,
  label_en = excluded.label_en,
  category = excluded.category,
  icon = excluded.icon,
  sort = excluded.sort,
  is_active = excluded.is_active,
  updated_at = now();
