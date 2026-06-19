-- Migration: change users.role from TEXT to TEXT[]
--
-- Role model:
--   player  → all regular users (default on signup)
--   venue   → granted automatically when a venue claim is approved
--             a venue operator always has BOTH 'player' AND 'venue'
--   admin   → platform governance, assigned manually only
--
-- Because a user can hold multiple roles (e.g. ['player','venue']),
-- the column must be an array.

-- 1. Drop the old scalar CHECK constraint first
--    We need this first because old values only allowed ('user','admin','moderator').
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Migrate existing values before changing the type
--    'user' / 'moderator' / unknown → 'player'
--    'admin'                        → 'admin'
UPDATE public.users
  SET role = CASE
    WHEN role = 'admin' THEN 'admin'
    ELSE 'player'
  END;

-- 3. Change column type to TEXT[] and convert the current text value
ALTER TABLE public.users
  ALTER COLUMN role DROP DEFAULT;

ALTER TABLE public.users
  ALTER COLUMN role TYPE TEXT[]
  USING ARRAY[role]::text[];

-- 4. New default: every new user starts as a player
ALTER TABLE public.users
  ALTER COLUMN role SET DEFAULT ARRAY['player']::text[];

-- 5. New CHECK: every element in the array must be a known role
ALTER TABLE public.users
  ADD CONSTRAINT users_role_check
  CHECK (role <@ ARRAY['player', 'admin', 'venue']::text[]);
