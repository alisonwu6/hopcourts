DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS player_game_joins;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS venue_sports;
DROP TABLE IF EXISTS venues;
DROP TABLE IF EXISTS player_preferred_areas;
DROP TABLE IF EXISTS player_sports;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  username VARCHAR(100) UNIQUE,
  role ENUM('player', 'venue_manager') NOT NULL DEFAULT 'player',
  city VARCHAR(120),
  gender VARCHAR(32),
  bio TEXT,
  avatar_url VARCHAR(255),
  motivation TEXT,
  onboarding_status JSON,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE player_sports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  sport VARCHAR(100) NOT NULL,
  skill_level ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
  playing_style ENUM('social', 'competitive', 'learning', 'mixed') DEFAULT 'mixed',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE player_preferred_areas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  area_name VARCHAR(120) NOT NULL,
  postal_code VARCHAR(20),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE venues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  manager_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  address VARCHAR(255),
  city VARCHAR(120),
  state VARCHAR(120),
  postal_code VARCHAR(20),
  description TEXT,
  phone VARCHAR(50),
  email VARCHAR(120),
  website VARCHAR(200),
  photo_url VARCHAR(255),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE venue_sports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venue_id INT NOT NULL,
  sport VARCHAR(100) NOT NULL,
  FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
);

CREATE TABLE games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  creator_id INT NOT NULL,
  venue_id INT,
  title VARCHAR(200) NOT NULL,
  sport VARCHAR(100) NOT NULL,
  description TEXT,
  skill_level ENUM('beginner', 'intermediate', 'advanced', 'mixed') DEFAULT 'mixed',
  energy INT DEFAULT 60,
  location_name VARCHAR(200),
  location_address VARCHAR(255),
  area VARCHAR(120),
  city VARCHAR(120),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  max_players INT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(8) DEFAULT 'AUD',
  requires_approval BOOLEAN DEFAULT FALSE,
  status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE SET NULL
);

CREATE TABLE player_game_joins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  game_id INT NOT NULL,
  player_id INT NOT NULL,
  status ENUM('joined', 'cancelled', 'waitlisted') DEFAULT 'joined',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_join (game_id, player_id),
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  game_id INT NOT NULL,
  sender_id INT NOT NULL,
  body TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);
