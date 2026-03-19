-- 001_initial_schema.sql
-- Consolidated Schema (Matching Existing Backend Code Constraints)

SET search_path = public, extensions;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Base Dictionaries (Enums & Lookups)
-- ==========================================

-- Countries
CREATE TABLE IF NOT EXISTS countries (
  key TEXT PRIMARY KEY CHECK (key = UPPER(key)), -- 'TW'
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  sort INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cities
CREATE TABLE IF NOT EXISTS cities (
  key TEXT PRIMARY KEY CHECK (key = UPPER(key)),
  country_key TEXT REFERENCES countries(key),
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  sort INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vibes
CREATE TABLE IF NOT EXISTS vibes (
  key TEXT PRIMARY KEY CHECK (key IN ('CHILL', 'SOCIAL', 'FLOW', 'EXPLORER', 'GROWTH', 'COMPETITIVE', 'SUPPORTIVE')),
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  subtitle_zh TEXT,
  subtitle_en TEXT,
  sort INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Age Ranges
CREATE TABLE IF NOT EXISTS age_ranges (
  key TEXT PRIMARY KEY CHECK (key = UPPER(key)),
  label_zh TEXT NOT NULL, -- Matched model expectation
  label_en TEXT NOT NULL,
  min_age INTEGER,
  max_age INTEGER,
  sort INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sports Catalog
CREATE TABLE IF NOT EXISTS sports (
  key TEXT PRIMARY KEY CHECK (key = UPPER(key)),
  label_zh TEXT NOT NULL,
  label_en TEXT NOT NULL,
  category TEXT, -- 'social_competitive', etc.
  icon TEXT,
  cover_image TEXT,
  sort INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 2. Users & Core
-- ==========================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  username_updated_at TIMESTAMPTZ,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  
  city_key TEXT REFERENCES cities(key),
  -- country_key removed: derived from city_key -> cities.country_key
  
  gender TEXT,
  birth_date DATE,
  age_range_key TEXT REFERENCES age_ranges(key),
  vibe_key TEXT REFERENCES vibes(key), -- Primary vibe preference
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  onboarding_completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS user_sports (
  user_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  sport_key TEXT REFERENCES sports(key) ON DELETE CASCADE,

  -- 只能二選一
  status TEXT NOT NULL CHECK (status IN ('favorite', 'trying')),
  level TEXT, 

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 關鍵：同一個運動只能在一個區
  PRIMARY KEY (user_id, sport_key)
);

CREATE INDEX IF NOT EXISTS idx_user_sports_user_id ON user_sports(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sports_sport_key ON user_sports(sport_key);

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  preferred_days TEXT[],
  preferred_time_slots TEXT[],
  sessions_per_week_goal INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS follows (
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- 3. Venues
-- ==========================================

CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_display TEXT, -- Often used in models
  logo_url TEXT,     -- Using logo_url instead of cover_image in some models?
  address TEXT,
  city_key TEXT REFERENCES cities(key),
  -- country_key removed: derived from city_key -> cities.country_key
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  
  description TEXT,
  cover_image TEXT,
  images TEXT[],
  amenities TEXT[],
  website_url TEXT,
  phone TEXT,
  
  is_official BOOLEAN DEFAULT false,
  owner_user_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'unclaimed' CHECK (status IN ('unclaimed', 'claimed')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Additional Venue Tables mentioned in drop logs (optional but good to have placeholders)
CREATE TABLE IF NOT EXISTS venue_profiles (
  venue_id UUID PRIMARY KEY REFERENCES venues(id) ON DELETE CASCADE,
  logo_url TEXT,
  cover_url TEXT
);

-- 4. Sessions (Activities) - Restored Old Columns
-- ==========================================

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  host_user_id UUID REFERENCES users(id),
  sport_key TEXT REFERENCES sports(key),
  venue_id UUID REFERENCES venues(id),
  
  title TEXT,
  notes TEXT,           -- Restored
  starts_at TIMESTAMPTZ NOT NULL, -- Restored
  ends_at TIMESTAMPTZ,  -- Restored
  
  place_name TEXT,      -- Restored
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  location_source TEXT,
  
  checkin_radius_m INTEGER DEFAULT 100,
  checkin_open_mins_before INTEGER DEFAULT 15,
  checkin_close_mins_after INTEGER DEFAULT 10,
  
  min_people INTEGER DEFAULT 2,
  max_people INTEGER DEFAULT 10,
  
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'link')),
  
  skill_level TEXT,
  gender TEXT DEFAULT 'mixed' CHECK (gender IN ('mixed', 'male', 'female')),
  photos TEXT[],
  
  is_free BOOLEAN DEFAULT true,
  price_total NUMERIC(10, 2),
  price_per_person NUMERIC(10, 2),
  price_mode TEXT DEFAULT 'total' CHECK (price_mode IN ('total', 'person')),
  price_note TEXT,
  currency TEXT DEFAULT 'TWD',
  
  is_official BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Participation
-- ==========================================

CREATE TABLE IF NOT EXISTS session_participants (
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  status TEXT NOT NULL DEFAULT 'joined'
    CHECK (status IN ('joined', 'left', 'kicked', 'waitlist')),

  role TEXT NOT NULL DEFAULT 'player'
    CHECK (role IN ('player', 'organizer')),

  joined_at TIMESTAMPTZ DEFAULT NOW(),
  status_updated_at TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (session_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_session_participants_user_status
  ON session_participants(user_id, status);

CREATE INDEX IF NOT EXISTS idx_session_participants_session_status
  ON session_participants(session_id, status);

-- 6. Check-ins
-- ==========================================

CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  venue_id UUID REFERENCES venues(id),
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  is_verified BOOLEAN DEFAULT false
);

-- 7. Feedback
-- ==========================================

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  images TEXT[],
  allow_reply BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived', 'replied')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_starts_at ON sessions(starts_at);
CREATE INDEX IF NOT EXISTS idx_sessions_sport_key ON sessions(sport_key);
CREATE INDEX IF NOT EXISTS idx_sessions_venue_id ON sessions(venue_id);
-- 002_seed_data.sql
-- Seed Data (Matching Reverted Schema)

-- 1. Countries
INSERT INTO countries (key, name_zh, name_en, sort, is_active) VALUES
('TW', '台灣', 'Taiwan', 1, true)
ON CONFLICT (key) DO NOTHING;

-- 2. Cities
INSERT INTO cities (key, country_key, name_zh, name_en, sort, is_active) VALUES
('KEELUNG', 'TW', '基隆市', 'Keelung', 10, true),
('TAIPEI', 'TW', '台北市', 'Taipei', 20, true),
('NEW_TAIPEI', 'TW', '新北市', 'New Taipei', 30, true),
('TAOYUAN', 'TW', '桃園市', 'Taoyuan', 40, true),
('HSINCHU', 'TW', '新竹市', 'Hsinchu City', 50, true),
('HSINCHU_COUNTY', 'TW', '新竹縣', 'Hsinchu County', 60, true),
('MIAOLI', 'TW', '苗栗縣', 'Miaoli County', 70, true),
('TAICHUNG', 'TW', '台中市', 'Taichung', 80, true),
('CHANGHUA', 'TW', '彰化縣', 'Changhua County', 90, true),
('NANTOU', 'TW', '南投縣', 'Nantou County', 100, true),
('YUNLIN', 'TW', '雲林縣', 'Yunlin County', 110, true),
('CHIAYI', 'TW', '嘉義市', 'Chiayi City', 120, true),
('CHIAYI_COUNTY', 'TW', '嘉義縣', 'Chiayi County', 130, true),
('TAINAN', 'TW', '台南市', 'Tainan', 140, true),
('KAOHSIUNG', 'TW', '高雄市', 'Kaohsiung', 150, true),
('PINGTUNG', 'TW', '屏東縣', 'Pingtung County', 160, true),
('YILAN', 'TW', '宜蘭縣', 'Yilan County', 170, true),
('HUALIEN', 'TW', '花蓮縣', 'Hualien County', 180, true),
('TAITUNG', 'TW', '台東縣', 'Taitung County', 190, true)
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
-- 003_storage_and_policies.sql
-- Storage Buckets & RLS (Row Level Security)

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 1. Storage Buckets Setup (Supabase Storage)
-- =============================================

-- Ensure buckets exist (Idempotent approach usually requires extension or API, doing via SQL insert)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('sessions-photos', 'sessions-photos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('venue-images', 'venue-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('feedback-images', 'feedback-images', true) ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies (Allow public read, auth write)
-- ====================================================

-- Avatars
DROP POLICY IF EXISTS "Avatar Public Read" ON storage.objects;
CREATE POLICY "Avatar Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
DROP POLICY IF EXISTS "Avatar Auth Upload" ON storage.objects;
CREATE POLICY "Avatar Auth Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Avatar Owner Update" ON storage.objects;
CREATE POLICY "Avatar Owner Update" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Session Photos
DROP POLICY IF EXISTS "Session Photos Public Read" ON storage.objects;
CREATE POLICY "Session Photos Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'sessions-photos');
DROP POLICY IF EXISTS "Session Photos Auth Upload" ON storage.objects;
CREATE POLICY "Session Photos Auth Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'sessions-photos' AND auth.role() = 'authenticated');

-- 3. Table Policies
-- =========================================================

-- public tables (read-only)
DROP POLICY IF EXISTS "Public Read Cities" ON cities;
CREATE POLICY "Public Read Cities" ON cities FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Read Countries" ON countries;
CREATE POLICY "Public Read Countries" ON countries FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Read Vibes" ON vibes;
CREATE POLICY "Public Read Vibes" ON vibes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Read Sports" ON sports;
CREATE POLICY "Public Read Sports" ON sports FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Read AgeRanges" ON age_ranges;
CREATE POLICY "Public Read AgeRanges" ON age_ranges FOR SELECT USING (true);

-- users
DROP POLICY IF EXISTS "Public Read Users" ON users;
CREATE POLICY "Public Read Users" ON users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Self Update Users" ON users;
CREATE POLICY "Self Update Users" ON users FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Self Insert Users" ON users;
CREATE POLICY "Self Insert Users" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- sessions
DROP POLICY IF EXISTS "Public Read Sessions" ON sessions;
CREATE POLICY "Public Read Sessions" ON sessions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth Create Sessions" ON sessions;
CREATE POLICY "Auth Create Sessions" ON sessions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Host Update Sessions" ON sessions;
CREATE POLICY "Host Update Sessions" ON sessions FOR UPDATE USING (auth.uid() = host_user_id);

-- feedback
DROP POLICY IF EXISTS "User Create Feedback" ON feedback;
CREATE POLICY "User Create Feedback" ON feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
-- (Admin policies omitted for brevity, usually check role)

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  recipient_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,

  type text NOT NULL, -- Flexible type, checked by application logic or expand constraint later
  
  entity_type text,         -- 'session' | 'announcement'
  entity_id uuid,           -- session_id etc.
  title text NOT NULL,
  message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,  -- deep_link etc.

  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,

  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created
  ON public.notifications(recipient_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread
  ON public.notifications(recipient_user_id, is_read, created_at DESC);

-- RLS Policy (Enable if RLS is active on table, currently assume managed by backend service role or application logic)
-- ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = recipient_user_id);
