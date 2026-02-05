-- 002_seed_data.sql
-- Seed Data (Matching Reverted Schema)

-- 1. Countries
INSERT INTO countries (key, name_zh, name_en, sort, is_active) VALUES
('TW', '台灣', 'Taiwan', 1, true)
ON CONFLICT (key) DO NOTHING;

-- 2. Cities
INSERT INTO cities (key, country_key, name_zh, name_en, sort, is_active) VALUES
('keelung', 'TW', '基隆市', 'Keelung', 10, true),
('taipei', 'TW', '台北市', 'Taipei', 20, true),
('new_taipei', 'TW', '新北市', 'New Taipei', 30, true),
('taoyuan', 'TW', '桃園市', 'Taoyuan', 40, true),
('hsinchu', 'TW', '新竹市', 'Hsinchu City', 50, true),
('hsinchu_county', 'TW', '新竹縣', 'Hsinchu County', 60, true),
('miaoli', 'TW', '苗栗縣', 'Miaoli County', 70, true),
('taichung', 'TW', '台中市', 'Taichung', 80, true),
('changhua', 'TW', '彰化縣', 'Changhua County', 90, true),
('nantou', 'TW', '南投縣', 'Nantou County', 100, true),
('yunlin', 'TW', '雲林縣', 'Yunlin County', 110, true),
('chiayi', 'TW', '嘉義市', 'Chiayi City', 120, true),
('chiayi_county', 'TW', '嘉義縣', 'Chiayi County', 130, true),
('tainan', 'TW', '台南市', 'Tainan', 140, true),
('kaohsiung', 'TW', '高雄市', 'Kaohsiung', 150, true),
('pingtung', 'TW', '屏東縣', 'Pingtung County', 160, true),
('yilan', 'TW', '宜蘭縣', 'Yilan County', 170, true),
('hualien', 'TW', '花蓮縣', 'Hualien County', 180, true),
('taitung', 'TW', '台東縣', 'Taitung County', 190, true)
ON CONFLICT (key) DO NOTHING;

-- 3. Vibes
INSERT INTO vibes (key, name_zh, name_en, subtitle_zh, subtitle_en, sort, is_active) VALUES
  ('CHILL', '健康與冥想', 'Chill', '穩定節奏、身心對齊', 'Steady pace, mind-body aligned', 10, true),
  ('SOCIAL', '社交與連結', 'Social', '喜歡夥伴、一起流汗', 'Meet people, sweat together', 20, true),
  ('FLOW', '習慣與穩定', 'Flow', '每天一點，養成節奏', 'Small daily moves, steady rhythm', 30, true),
  ('EXPLORER', '自由與探索', 'Explorer', '熱愛冒險、說走就走', 'Up for anything new, go explore', 40, true),
  ('GROWTH', '學習與成長', 'Growth', '技術提升、專業進步', 'Level up skills, keep improving', 50, true),
  ('COMPETITIVE', '競爭與挑戰', 'Competitive', '追求極限、享受對決', 'Chasing limits, love a good match', 60, true),
  ('SUPPORTIVE', '歸屬與關懷', 'Supportive', '陪伴夥伴、不趕時間', 'Supportive pace, no rush', 70, true)
ON CONFLICT (key) DO UPDATE SET
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  subtitle_zh = excluded.subtitle_zh,
  subtitle_en = excluded.subtitle_en,
  sort = excluded.sort,
  is_active = excluded.is_active;

-- 4. Age Ranges
-- Note: schema has label_zh, label_en. Model logic typically selects one.
INSERT INTO age_ranges (key, label_zh, label_en, sort, is_active) VALUES
('18-24', '18 - 24 歲', '18 - 24', 10, true),
('25-34', '25 - 34 歲', '25 - 34', 20, true),
('35-44', '35 - 44 歲', '35 - 44', 30, true),
('45-54', '45 - 54 歲', '45 - 54', 40, true),
('55+', '55 歲以上', '55+', 50, true)
ON CONFLICT (key) DO NOTHING;

-- 5. Sports
INSERT INTO sports (key, label_zh, label_en, category, icon, sort, is_active) VALUES
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
ON CONFLICT (key) DO UPDATE SET
  label_zh = EXCLUDED.label_zh,
  label_en = EXCLUDED.label_en,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon,
  sort = EXCLUDED.sort,
  is_active = EXCLUDED.is_active;
