-- Seed core sports dictionary.
insert into public.sports (key, label_zh, label_en, category, icon, sort, is_active)
values
  ('BASKETBALL', '籃球', 'Basketball', 'social_competitive', '🏀', 10, true),
  ('BADMINTON', '羽球', 'Badminton', 'social_competitive', '🏸', 20, true),
  ('TABLE-TENNIS', '桌球', 'Table Tennis', 'social_competitive', '🏓', 30, true),
  ('VOLLEYBALL', '排球', 'Volleyball', 'social_competitive', '🏐', 40, true),
  ('TENNIS', '網球', 'Tennis', 'social_competitive', '🎾', 50, true),
  ('PICKLEBALL', '匹克球', 'Pickleball', 'social_competitive', '🏓', 60, true),
  ('FOOTBALL', '足球', 'Football', 'social_competitive', '⚽', 70, true),
  ('BASEBALL-SOFTBALL', '棒壘球', 'Baseball / Softball', 'social_competitive', '⚾', 80, true),
  ('RUNNING', '慢跑', 'Running', 'adventure_endurance', '🏃', 90, true),
  ('CYCLING', '自行車', 'Cycling', 'adventure_endurance', '🚴', 100, true),
  ('HIKING', '登山健行', 'Hiking', 'adventure_endurance', '🥾', 110, true),
  ('BOULDERING', '抱石', 'Bouldering', 'adventure_endurance', '🧗', 120, true),
  ('CLIMBING', '戶外攀岩', 'Climbing', 'adventure_endurance', '🧗', 130, true),
  ('SURFING', '衝浪', 'Surfing', 'adventure_endurance', '🏄', 140, true),
  ('DIVING', '潛水', 'Diving', 'adventure_endurance', '🤿', 150, true),
  ('GYM', '重訓', 'Strength Training', 'training_wellness', '🏋️', 160, true),
  ('YOGA', '瑜珈', 'Yoga', 'training_wellness', '🧘', 170, true),
  ('PILATES', '皮拉提斯', 'Pilates', 'training_wellness', '🤸', 180, true),
  ('HIIT', 'HIIT', 'HIIT', 'training_wellness', '🔥', 190, true),
  ('BOXING', '拳擊', 'Boxing', 'combat', '🥊', 200, true),
  ('MARTIAL-ARTS', '格鬥', 'Martial Arts', 'combat', '🥋', 210, true),
  ('POP-DANCE', '流行舞', 'Pop Dance', 'dance', '💃', 220, true),
  ('STREET-DANCE', '街舞', 'Street Dance', 'dance', '🕺', 230, true),
  ('SKATEBOARD', '滑板', 'Skateboarding', 'adventure_endurance', '🛹', 240, true)
on conflict (key) do update
set
  label_zh = excluded.label_zh,
  label_en = excluded.label_en,
  category = excluded.category,
  icon = excluded.icon,
  sort = excluded.sort,
  is_active = excluded.is_active,
  updated_at = now();
