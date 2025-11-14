DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS player_game_joins CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS venue_sports CASCADE;
DROP TABLE IF EXISTS venues CASCADE;
DROP TABLE IF EXISTS player_preferred_areas CASCADE;
DROP TABLE IF EXISTS player_sports CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'venue_manager')),
  city TEXT,
  gender TEXT,
  bio TEXT,
  avatar_url TEXT,
  motivation TEXT,
  onboarding_status JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE player_sports (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sport TEXT NOT NULL,
  skill_level TEXT NOT NULL CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  playing_style TEXT DEFAULT 'mixed' CHECK (playing_style IN ('social', 'competitive', 'learning', 'mixed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE player_preferred_areas (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  area_name TEXT NOT NULL,
  postal_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE venues (
  id SERIAL PRIMARY KEY,
  manager_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  description TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  photo_url TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE venue_sports (
  id SERIAL PRIMARY KEY,
  venue_id INT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  sport TEXT NOT NULL
);

CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  creator_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  venue_id INT REFERENCES venues(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  sport TEXT NOT NULL,
  description TEXT,
  skill_level TEXT DEFAULT 'mixed' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'mixed')),
  energy INT DEFAULT 60,
  location_name TEXT,
  location_address TEXT,
  area TEXT,
  city TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  max_players INT NOT NULL,
  price NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'AUD',
  requires_approval BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  cancel_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE player_game_joins (
  id SERIAL PRIMARY KEY,
  game_id INT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'joined' CHECK (status IN ('joined', 'cancelled', 'waitlisted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (game_id, player_id)
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  game_id INT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_games_start_time ON games (start_time);
CREATE INDEX IF NOT EXISTS idx_games_sport ON games (sport);
