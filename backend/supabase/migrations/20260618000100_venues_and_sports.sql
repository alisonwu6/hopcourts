-- ─── Venue Type ───────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE venue_type AS ENUM ('public', 'official', 'private');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS venue_type venue_type NOT NULL DEFAULT 'public';

ALTER TABLE public.venues
  DROP COLUMN IF EXISTS is_official;

-- ─── Sports: new entries ───────────────────────────────────────────────────────
INSERT INTO sports (key, label_zh, label_en, category, icon, sort, is_active) VALUES
  ('DODGEBALL',        '美式躲避球',   'Dodgeball',        'social_competitive', '🔴', 80,  true),
  ('FUTSAL',           '五人制足球',   'Futsal',           'social_competitive', '⚽', 45,  true),
  ('NETBALL',          '籃網球',       'Netball',          'social_competitive', '',  55,  true),
  ('REFORMER_PILATES', '器械皮拉提斯', 'Reformer Pilates', 'training_wellness',  '🤸', 235, true),
  ('SKIING',           '滑雪',         'Skiing',           'outdoor',            '⛷️', 150, true),
  ('SURFING',          '衝浪',         'Surfing',          'outdoor',            '🏄', 160, true),
  ('DIVING',           '潛水',         'Diving',           'outdoor',            '🤿', 170, true)
ON CONFLICT (key) DO UPDATE SET
  label_zh  = EXCLUDED.label_zh,
  label_en  = EXCLUDED.label_en,
  category  = EXCLUDED.category,
  icon      = EXCLUDED.icon,
  sort      = EXCLUDED.sort,
  is_active = EXCLUDED.is_active;

-- ─── Sports: deactivate old Pilates ───────────────────────────────────────────
UPDATE sports SET is_active = false WHERE key = 'PILATES';

-- ─── Sports: update categories ────────────────────────────────────────────────
UPDATE sports SET category = 'ball_sports'      WHERE key IN ('BASKETBALL', 'VOLLEYBALL', 'FUTSAL', 'NETBALL', 'DODGEBALL');
UPDATE sports SET category = 'racket_sports'    WHERE key IN ('BADMINTON', 'TABLE_TENNIS', 'TENNIS', 'PICKLEBALL');
UPDATE sports SET category = 'outdoor'          WHERE key IN ('RUNNING', 'CYCLING', 'HIKING', 'FRISBEE', 'SKATEBOARDING', 'SKIING', 'SURFING', 'DIVING');
UPDATE sports SET category = 'fitness_wellness' WHERE key IN ('YOGA', 'SWIMMING', 'GYM', 'REFORMER_PILATES');
UPDATE sports SET category = 'extreme'          WHERE key IN ('BOULDERING');
