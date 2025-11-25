TRUNCATE TABLE public.game_members CASCADE;
TRUNCATE TABLE public.games CASCADE;

-- Sample host/player ids
-- These UUIDs are arbitrary; replace with real auth/profile ids when available.
WITH games_base AS (
  INSERT INTO public.games (
    id,
    host_user_id,
    title,
    sport,
    skill_level,
    start_datetime,
    end_datetime,
    location_name,
    address_line,
    area,
    city,
    country_code,
    latitude,
    longitude,
    price_type,
    price_amount,
    currency,
    capacity,
    status,
    description,
    notes_for_attendees,
    cover_photo_url
  )
  VALUES
    (
      '00000000-0000-4000-8000-000000000111',
      'a42b5e08-ca75-4c0b-9869-4cade6734581',
      'Sunrise Pick-up Hoops',
      'basketball',
      'intermediate',
      '2025-11-20T07:00:00+10:00',
      '2025-11-20T09:00:00+10:00',
      'Southbank Outdoor Courts',
      '123 River Terrace',
      'South Brisbane',
      'Brisbane',
      'AU',
      -27.4819,
      153.0281,
      'free',
      NULL,
      'AUD',
      12,
      'published',
      'Fast-paced pick-up hoops to start your day right.',
      'Bring your own ball and plenty of water.',
      'https://images.example.com/games/hoops.jpg'
    ),
    (
      '00000000-0000-4000-8000-000000000222',
      'a42b5e08-ca75-4c0b-9869-4cade6734581',
      'Twilight River Run',
      'running',
      'all',
      '2025-11-21T17:30:00+10:00',
      '2025-11-21T18:30:00+10:00',
      'Kangaroo Point Cliffs',
      '29 River Terrace',
      'Kangaroo Point',
      'Brisbane',
      'AU',
      -27.4694,
      153.0364,
      'free',
      NULL,
      'AUD',
      25,
      'published',
      'Easy paced social run finishing with sunset stretching.',
      'Reflective gear recommended; headlamps available to borrow.',
      'https://images.example.com/games/run.jpg'
    ),
    (
      '00000000-0000-4000-8000-000000000333',
      'cccccccc-cccc-4ccc-8ccc-ccccccccccc3',
      'Saturday Social Tennis',
      'tennis',
      'mixed',
      '2025-11-22T10:00:00+10:00',
      '2025-11-22T12:00:00+10:00',
      'New Farm Tennis Club',
      '88 Brunswick St',
      'New Farm',
      'Brisbane',
      'AU',
      -27.4689,
      153.0534,
      'fixed',
      10.00,
      'AUD',
      8,
      'published',
      'Doubles round-robin followed by coffee nearby.',
      'Balls provided. Court hire fee collected on arrival.',
      'https://images.example.com/games/tennis.jpg'
    )
  RETURNING id, host_user_id
)
INSERT INTO public.game_members (game_id, user_id, is_host, status)
SELECT
  g.id,
  g.host_user_id,
  TRUE,
  'joined'
FROM games_base g;

-- Add a couple of sample attendees for variety
INSERT INTO public.game_members (game_id, user_id, is_host, status)
VALUES
  ('00000000-0000-4000-8000-000000000111', 'dddddddd-dddd-4ddd-8ddd-ddddddddddd4', FALSE, 'joined'),
  ('00000000-0000-4000-8000-000000000111', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee5', FALSE, 'joined'),
  ('00000000-0000-4000-8000-000000000222', 'ffffffff-ffff-4fff-8fff-fffffffffff6', FALSE, 'joined');
