-- Deactivate old sports not in the new list to prevent duplicates or unwanted entries
UPDATE public.sports 
SET is_active = false 
WHERE key NOT IN (
  'BASKETBALL', 'BADMINTON', 'TABLE_TENNIS', 'VOLLEYBALL', 'TENNIS', 'PICKLEBALL',
  'RUNNING', 'CYCLING', 'HIKING', 'BOULDERING',
  'GYM', 'YOGA', 'PILATES', 'SKATEBOARDING'
);

-- Seed core sports dictionary.
insert into public.sports (key, label_zh, label_en, category, icon, sort, is_active)
values
  ('BASKETBALL', '籃球', 'Basketball', 'social_competitive', '🏀', 10, true),
  ('BADMINTON', '羽球', 'Badminton', 'social_competitive', '🏸', 20, true),
  ('TABLE_TENNIS', '桌球', 'Table Tennis', 'social_competitive', '🏓', 30, true),
  ('VOLLEYBALL', '排球', 'Volleyball', 'social_competitive', '🏐', 40, true),
  ('TENNIS', '網球', 'Tennis', 'social_competitive', '🎾', 50, true),
  ('PICKLEBALL', '匹克球', 'Pickleball', 'social_competitive', '🥒', 60, true),

  ('RUNNING', '慢跑', 'Running', 'adventure_endurance', '🏃', 100, true),
  ('CYCLING', '自行車', 'Cycling', 'adventure_endurance', '🚴', 110, true),
  ('HIKING', '登山健行', 'Hiking', 'adventure_endurance', '🥾', 120, true),

  ('BOULDERING', '抱石', 'Bouldering', 'adventure_endurance', '🧗', 150, true),

  ('GYM', '重訓', 'Strength Training', 'training_wellness', '🏋️', 200, true),
  ('YOGA', '瑜伽', 'Yoga', 'training_wellness', '🧘', 210, true),
  ('PILATES', '皮拉提斯', 'Pilates', 'training_wellness', '🤸', 220, true),

  ('SKATEBOARDING', '滑板', 'Skateboarding', 'adventure_endurance', '🛹', 250, true)
on conflict (key) do update
set
  label_zh = excluded.label_zh,
  label_en = excluded.label_en,
  category = excluded.category,
  icon = excluded.icon,
  sort = excluded.sort,
  is_active = excluded.is_active,
  updated_at = now();
