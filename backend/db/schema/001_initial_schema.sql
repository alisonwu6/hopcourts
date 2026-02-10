-- 001_initial_schema.sql
-- Consolidated Schema (Matching Existing Backend Code Constraints)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Base Dictionaries (Enums & Lookups)
-- ==========================================

-- Countries
CREATE TABLE countries (
  key TEXT PRIMARY KEY, -- 'TW'
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  sort INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cities
CREATE TABLE cities (
  key TEXT PRIMARY KEY,
  country_key TEXT REFERENCES countries(key),
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  sort INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vibes
CREATE TABLE vibes (
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
CREATE TABLE age_ranges (
  key TEXT PRIMARY KEY,
  label_zh TEXT NOT NULL, -- Matched model expectation
  label_en TEXT NOT NULL,
  min_age INTEGER,
  max_age INTEGER,
  sort INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sports Catalog
CREATE TABLE sports (
  key TEXT PRIMARY KEY,
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

CREATE TABLE users (
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

CREATE TABLE user_sports (
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

CREATE INDEX idx_user_sports_user_id ON user_sports(user_id);
CREATE INDEX idx_user_sports_sport_key ON user_sports(sport_key);

CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  preferred_days TEXT[],
  preferred_time_slots TEXT[],
  sessions_per_week_goal INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE follows (
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- 3. Venues
-- ==========================================

CREATE TABLE venues (
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
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Additional Venue Tables mentioned in drop logs (optional but good to have placeholders)
CREATE TABLE venue_profiles (
  venue_id UUID PRIMARY KEY REFERENCES venues(id) ON DELETE CASCADE,
  logo_url TEXT,
  cover_url TEXT
);

-- 4. Sessions (Activities) - Restored Old Columns
-- ==========================================

CREATE TABLE sessions (
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
  price NUMERIC(10, 2),
  currency TEXT DEFAULT 'TWD',
  
  is_official BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Participation
-- ==========================================

CREATE TABLE session_participants (
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

CREATE INDEX idx_session_participants_user_status
  ON session_participants(user_id, status);

CREATE INDEX idx_session_participants_session_status
  ON session_participants(session_id, status);

-- 6. Check-ins
-- ==========================================

CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id),
  user_id UUID REFERENCES users(id),
  venue_id UUID REFERENCES venues(id),
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  is_verified BOOLEAN DEFAULT false
);

-- 7. Feedback
-- ==========================================

CREATE TABLE feedback (
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
CREATE INDEX idx_sessions_starts_at ON sessions(starts_at);
CREATE INDEX idx_sessions_sport_key ON sessions(sport_key);
CREATE INDEX idx_sessions_venue_id ON sessions(venue_id);
