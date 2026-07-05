ALTER TABLE sessions
  DROP CONSTRAINT IF EXISTS sessions_gender_check,
  ADD CONSTRAINT sessions_gender_check CHECK (gender IN ('mixed', 'male', 'female', 'lgbtq'));
