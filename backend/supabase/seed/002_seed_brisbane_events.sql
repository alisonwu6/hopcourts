-- Seed: 100 Brisbane events across all sports, June–July 2026
-- English titles, varied form data (skill, gender, price, capacity)

SET session_replication_role = replica;

DO $$
DECLARE
  alison  UUID := 'b743c889-ed0f-496d-83fc-c3f4f9264a18';
  chialin UUID := 'a66ba486-e722-40a3-b8ba-774d826287e9';
BEGIN

INSERT INTO sessions
  (host_user_id, sport_key, title, starts_at, ends_at,
   place_name, address, lat, lng,
   skill_level, gender, min_people, max_people, status, visibility,
   is_free, price_total, price_per_person, price_mode, price_note, notes)
VALUES

-- ── BASKETBALL (8) ────────────────────────────────────────────────────────────
(alison,  'BASKETBALL', 'New Farm 3-on-3 Pickup',
 '2026-06-10 08:00+10', '2026-06-10 10:00+10',
 'New Farm Park Courts', 'Brunswick St, New Farm QLD 4005', -27.4647, 153.0432,
 'any', 'mixed', 6, 12, 'published', 'public', true, null, null, 'total', null,
 'Casual 3v3 — all welcome, bring water'),

(chialin, 'BASKETBALL', 'Spring Hill Half-Court Grind',
 '2026-06-14 07:30+10', '2026-06-14 09:30+10',
 'Victoria Park Basketball Courts', 'Herston Rd, Spring Hill QLD 4000', -27.4559, 153.0167,
 'intermediate', 'male', 4, 10, 'published', 'public', true, null, null, 'total', null,
 'Competitive runs, must be able to hold your own'),

(alison,  'BASKETBALL', 'West End Weekend Ballers',
 '2026-06-21 09:00+10', '2026-06-21 12:00+10',
 'Musgrave Park', 'Cordelia St, South Brisbane QLD 4101', -27.4861, 153.0125,
 'beginner', 'mixed', 4, 8, 'published', 'public', true, null, null, 'total', null,
 'Beginners encouraged — patient vibe'),

(chialin, 'BASKETBALL', 'Kangaroo Point Sunset Run',
 '2026-06-27 17:30+10', '2026-06-27 19:30+10',
 'Kangaroo Point Park Courts', 'River Tce, Kangaroo Point QLD 4169', -27.4822, 153.0316,
 'advanced', 'mixed', 6, 14, 'published', 'public', true, null, null, 'total', null,
 'Fast pace, no ball-hogging'),

(alison,  'BASKETBALL', 'Chermside Women''s Hoops',
 '2026-07-04 10:00+10', '2026-07-04 12:00+10',
 'Chermside District Sports Club', 'Webster Rd, Chermside QLD 4032', -27.3862, 153.0320,
 'any', 'female', 4, 10, 'published', 'public', true, null, null, 'total', null,
 'Women-only session, all levels welcome'),

(chialin, 'BASKETBALL', 'Indooroopilly Skills Session',
 '2026-07-11 08:00+10', '2026-07-11 10:00+10',
 'Indooroopilly State High School Courts', 'Ward St, Indooroopilly QLD 4068', -27.5122, 152.9761,
 'intermediate', 'mixed', 4, 12, 'published', 'public', false, null, 5.00, 'person', 'Covers court hire',
 'Drills + scrimmage, bring runners'),

(alison,  'BASKETBALL', 'CBD Lunch Break Pickup',
 '2026-07-16 12:00+10', '2026-07-16 13:30+10',
 'Roma Street Parkland Courts', 'Roma St, Brisbane City QLD 4000', -27.4628, 153.0189,
 'any', 'mixed', 4, 10, 'published', 'public', true, null, null, 'total', null,
 'Quick lunchtime run, office gear fine'),

(chialin, 'BASKETBALL', 'St Lucia University 5v5',
 '2026-07-25 14:00+10', '2026-07-25 17:00+10',
 'UQ Sport Courts', 'Union Rd, St Lucia QLD 4067', -27.4972, 152.9993,
 'intermediate', 'mixed', 10, 20, 'published', 'public', false, 60.00, null, 'total', 'Split equally on the day',
 'Full court 5v5 — bring a team or join one'),

-- ── BADMINTON (8) ─────────────────────────────────────────────────────────────
(alison,  'BADMINTON', 'Fortitude Valley Shuttle Club',
 '2026-06-11 19:00+10', '2026-06-11 21:00+10',
 'Brisbane Badminton Centre', 'Chester St, Fortitude Valley QLD 4006', -27.4577, 153.0349,
 'intermediate', 'mixed', 4, 8, 'published', 'public', false, null, 8.00, 'person', 'Court hire fee',
 'Doubles format, bring your own racket'),

(chialin, 'BADMINTON', 'Weekend Doubles Round Robin',
 '2026-06-20 09:00+10', '2026-06-20 12:00+10',
 'Kelvin Grove Badminton Hall', 'Kelvin Grove Rd, Kelvin Grove QLD 4059', -27.4487, 153.0063,
 'any', 'mixed', 8, 16, 'published', 'public', false, null, 10.00, 'person', 'Includes shuttle fee',
 'Round-robin doubles, rotate partners every 3 games'),

(alison,  'BADMINTON', 'Beginner Rally Session',
 '2026-06-25 10:00+10', '2026-06-25 12:00+10',
 'Toowong Recreation Centre', 'Benson St, Toowong QLD 4066', -27.4843, 152.9949,
 'beginner', 'mixed', 2, 8, 'published', 'public', false, null, 6.00, 'person', 'Court + shuttle hire',
 'We teach technique, first time players welcome'),

(chialin, 'BADMINTON', 'Mixed Doubles Social Night',
 '2026-07-02 18:30+10', '2026-07-02 21:00+10',
 'Brisbane Badminton Centre', 'Chester St, Fortitude Valley QLD 4006', -27.4577, 153.0349,
 'intermediate', 'mixed', 4, 8, 'published', 'public', false, null, 8.00, 'person', 'Court hire split',
 'Rotate mixed-doubles pairs throughout the night'),

(alison,  'BADMINTON', 'Women''s Badminton Morning',
 '2026-07-08 08:00+10', '2026-07-08 10:00+10',
 'Kelvin Grove Badminton Hall', 'Kelvin Grove Rd, Kelvin Grove QLD 4059', -27.4487, 153.0063,
 'any', 'female', 4, 10, 'published', 'public', false, null, 7.00, 'person', 'Court hire included',
 'Women-only, all levels, bring water'),

(chialin, 'BADMINTON', 'Advanced Smash Practice',
 '2026-07-15 19:00+10', '2026-07-15 21:30+10',
 'Brisbane Badminton Centre', 'Chester St, Fortitude Valley QLD 4006', -27.4577, 153.0349,
 'advanced', 'mixed', 4, 8, 'published', 'public', false, null, 10.00, 'person', 'Premium court hire',
 'Focused on smash & net play drills'),

(alison,  'BADMINTON', 'Lunchtime Shuttle Hit',
 '2026-07-22 12:00+10', '2026-07-22 13:30+10',
 'Toowong Recreation Centre', 'Benson St, Toowong QLD 4066', -27.4843, 152.9949,
 'any', 'mixed', 2, 6, 'published', 'public', false, null, 5.00, 'person', 'Court hire',
 'Casual midweek hit, BYO racket'),

(chialin, 'BADMINTON', 'Carindale Family Doubles',
 '2026-07-29 09:00+10', '2026-07-29 11:00+10',
 'Carindale Leisure Centre', 'Creek Rd, Carindale QLD 4152', -27.5024, 153.1122,
 'beginner', 'mixed', 4, 12, 'published', 'public', false, null, 6.00, 'person', 'Court hire split',
 'Family-friendly, kids welcome'),

-- ── TABLE TENNIS (6) ──────────────────────────────────────────────────────────
(alison,  'TABLE_TENNIS', 'New Farm Ping Pong Social',
 '2026-06-12 18:00+10', '2026-06-12 20:00+10',
 'New Farm Neighbourhood Centre', 'Brunswick St, New Farm QLD 4005', -27.4647, 153.0432,
 'any', 'mixed', 2, 10, 'published', 'public', true, null, null, 'total', null,
 'Bring your own paddle or borrow ours'),

(chialin, 'TABLE_TENNIS', 'CBD After-Work Table Tennis',
 '2026-06-19 17:30+10', '2026-06-19 19:30+10',
 'City Botanic Gardens Table', 'Alice St, Brisbane City QLD 4000', -27.4761, 153.0278,
 'any', 'mixed', 2, 8, 'published', 'public', true, null, null, 'total', null,
 'Outdoor tables, casual games only'),

(alison,  'TABLE_TENNIS', 'Competitive Singles Ladder',
 '2026-07-01 19:00+10', '2026-07-01 21:30+10',
 'Indooroopilly Table Tennis Club', 'Station Rd, Indooroopilly QLD 4068', -27.5122, 152.9761,
 'advanced', 'mixed', 4, 12, 'published', 'public', false, null, 10.00, 'person', 'Club membership fee',
 'Ranked round-robin, bring your rated paddle'),

(chialin, 'TABLE_TENNIS', 'Wynnum Foreshore Ping Pong',
 '2026-07-10 16:00+10', '2026-07-10 18:00+10',
 'Wynnum Foreshore Park', 'Tingal Rd, Wynnum QLD 4178', -27.4467, 153.1573,
 'beginner', 'mixed', 2, 8, 'published', 'public', true, null, null, 'total', null,
 'Outdoor tables with ocean breeze'),

(alison,  'TABLE_TENNIS', 'Fortitude Valley Doubles Night',
 '2026-07-18 19:00+10', '2026-07-18 21:00+10',
 'Valley Social Club', 'Brunswick St, Fortitude Valley QLD 4006', -27.4577, 153.0349,
 'intermediate', 'mixed', 4, 8, 'published', 'public', false, null, 8.00, 'person', 'Table hire included',
 'Best of 5 doubles, pairs welcome'),

(chialin, 'TABLE_TENNIS', 'South Bank Weekend Rallies',
 '2026-07-26 10:00+10', '2026-07-26 12:00+10',
 'South Bank Parklands', 'South Bank QLD 4101', -27.4818, 153.0217,
 'any', 'mixed', 2, 12, 'published', 'public', true, null, null, 'total', null,
 'Outdoor tables, bring your paddle'),

-- ── VOLLEYBALL (7) ────────────────────────────────────────────────────────────
(alison,  'VOLLEYBALL', 'Southbank Beach Volleyball Sundays',
 '2026-06-14 09:00+10', '2026-06-14 12:00+10',
 'Streets Beach, South Bank', 'South Bank Pkwy, South Brisbane QLD 4101', -27.4818, 153.0195,
 'any', 'mixed', 6, 18, 'published', 'public', true, null, null, 'total', null,
 'Free beach courts, suncream essential'),

(chialin, 'VOLLEYBALL', 'Sandgate Beach 4v4 Saturday',
 '2026-06-20 07:30+10', '2026-06-20 10:00+10',
 'Sandgate Beach Courts', 'Flinders Pde, Sandgate QLD 4017', -27.3228, 153.0677,
 'intermediate', 'mixed', 8, 16, 'published', 'public', true, null, null, 'total', null,
 'Sand courts, 4v4 rotation format'),

(alison,  'VOLLEYBALL', 'Manly Esplanade Women''s Vball',
 '2026-06-28 08:00+10', '2026-06-28 10:30+10',
 'Manly Esplanade Park', 'Cambridge Pde, Manly QLD 4179', -27.4567, 153.1756,
 'any', 'female', 6, 12, 'published', 'public', true, null, null, 'total', null,
 'Women-only beach volleyball, all levels'),

(chialin, 'VOLLEYBALL', 'City Indoor 6v6 Friday Night',
 '2026-07-03 19:00+10', '2026-07-03 21:00+10',
 'Brisbane Indoor Sports Centre', 'Bowen Bridge Rd, Herston QLD 4006', -27.4492, 153.0281,
 'intermediate', 'mixed', 12, 24, 'published', 'public', false, null, 10.00, 'person', 'Court hire included',
 '6v6 full court, competitive but friendly'),

(alison,  'VOLLEYBALL', 'South Bank Sunday Sunset Vball',
 '2026-07-12 16:30+10', '2026-07-12 19:00+10',
 'Streets Beach, South Bank', 'South Bank Pkwy, South Brisbane QLD 4101', -27.4818, 153.0195,
 'any', 'mixed', 6, 20, 'published', 'public', true, null, null, 'total', null,
 'Sunset session — golden hour guaranteed'),

(chialin, 'VOLLEYBALL', 'Carindale Rec Volleyball',
 '2026-07-19 10:00+10', '2026-07-19 12:00+10',
 'Carindale Leisure Centre', 'Creek Rd, Carindale QLD 4152', -27.5024, 153.1122,
 'beginner', 'mixed', 6, 14, 'published', 'public', false, null, 8.00, 'person', 'Court hire fee',
 'Newcomers welcome, basic rules explained'),

(alison,  'VOLLEYBALL', 'New Farm Mixed Doubles Vball',
 '2026-07-28 17:00+10', '2026-07-28 19:30+10',
 'New Farm Park', 'Brunswick St, New Farm QLD 4005', -27.4647, 153.0432,
 'intermediate', 'mixed', 8, 16, 'published', 'public', true, null, null, 'total', null,
 'Grass volleyball, mixed doubles format'),

-- ── TENNIS (7) ────────────────────────────────────────────────────────────────
(chialin, 'TENNIS', 'Milton Tennis Hit-Up',
 '2026-06-10 07:00+10', '2026-06-10 09:00+10',
 'Milton Tennis Club', 'Judge St, Milton QLD 4064', -27.4647, 153.0091,
 'any', 'mixed', 2, 4, 'published', 'public', false, null, 8.00, 'person', 'Court hire',
 'BYO racket, balls provided'),

(alison,  'TENNIS', 'Toowong Ladies Morning Tennis',
 '2026-06-17 08:00+10', '2026-06-17 10:00+10',
 'Toowong Tennis Club', 'Sherwood Rd, Toowong QLD 4066', -27.4843, 152.9949,
 'intermediate', 'female', 4, 8, 'published', 'public', false, null, 10.00, 'person', 'Court hire + balls',
 'Women-only, doubles format'),

(chialin, 'TENNIS', 'New Farm Park Advanced Singles',
 '2026-06-24 06:30+10', '2026-06-24 08:30+10',
 'New Farm Park Tennis Courts', 'Brunswick St, New Farm QLD 4005', -27.4647, 153.0432,
 'advanced', 'mixed', 2, 4, 'published', 'public', false, null, 12.00, 'person', 'Court hire',
 'Competitive singles, rating 5+ preferred'),

(alison,  'TENNIS', 'Kangaroo Point Doubles Social',
 '2026-07-05 07:30+10', '2026-07-05 09:30+10',
 'Kangaroo Point Tennis Courts', 'River Tce, Kangaroo Point QLD 4169', -27.4822, 153.0316,
 'intermediate', 'mixed', 4, 8, 'published', 'public', false, null, 8.00, 'person', 'Court hire',
 'Doubles only, partners rotated'),

(chialin, 'TENNIS', 'Wynnum Foreshore Tennis Morning',
 '2026-07-12 07:00+10', '2026-07-12 09:00+10',
 'Wynnum Tennis Club', 'Bay Tce, Wynnum QLD 4178', -27.4467, 153.1573,
 'any', 'mixed', 2, 6, 'published', 'public', false, null, 8.00, 'person', 'Court hire included',
 'Bayside courts, beautiful morning spot'),

(alison,  'TENNIS', 'St Lucia Mixed Doubles Night',
 '2026-07-20 18:00+10', '2026-07-20 20:00+10',
 'UQ Tennis Courts', 'Union Rd, St Lucia QLD 4067', -27.4972, 152.9993,
 'intermediate', 'mixed', 4, 8, 'published', 'public', false, null, 10.00, 'person', 'Court hire',
 'Lit courts, bring your A-game'),

(chialin, 'TENNIS', 'Manly Bayside Beginner Tennis',
 '2026-07-27 08:00+10', '2026-07-27 10:00+10',
 'Manly Tennis Club', 'Cambridge Pde, Manly QLD 4179', -27.4567, 153.1756,
 'beginner', 'mixed', 2, 8, 'published', 'public', false, null, 6.00, 'person', 'Court + ball hire',
 'Learn the basics, patient instructor vibe'),

-- ── PICKLEBALL (7) ────────────────────────────────────────────────────────────
(alison,  'PICKLEBALL', 'South Bank Pickleball Pop-Up',
 '2026-06-13 08:00+10', '2026-06-13 10:30+10',
 'South Bank Parklands Courts', 'South Bank Pkwy, South Brisbane QLD 4101', -27.4818, 153.0217,
 'beginner', 'mixed', 4, 12, 'published', 'public', true, null, null, 'total', null,
 'Equipment provided, perfect first-timer session'),

(chialin, 'PICKLEBALL', 'Fortitude Valley Dink & Drive',
 '2026-06-21 09:00+10', '2026-06-21 11:30+10',
 'Valley Recreation Centre', 'Wickham St, Fortitude Valley QLD 4006', -27.4577, 153.0349,
 'intermediate', 'mixed', 4, 8, 'published', 'public', false, null, 8.00, 'person', 'Court hire',
 'Strategy-focused session, dinking drills'),

(alison,  'PICKLEBALL', 'New Farm Pickleball Sundays',
 '2026-06-28 09:00+10', '2026-06-28 11:30+10',
 'New Farm Park Courts', 'Brunswick St, New Farm QLD 4005', -27.4647, 153.0432,
 'any', 'mixed', 4, 12, 'published', 'public', true, null, null, 'total', null,
 'Relaxed Sunday vibes, BYO snacks'),

(chialin, 'PICKLEBALL', 'Chermside Advanced Pickleball',
 '2026-07-05 08:30+10', '2026-07-05 11:00+10',
 'Chermside District Sports Club', 'Webster Rd, Chermside QLD 4032', -27.3862, 153.0320,
 'advanced', 'mixed', 4, 8, 'published', 'public', false, null, 10.00, 'person', 'Court hire',
 'Fast-paced play, bring your own paddle'),

(alison,  'PICKLEBALL', 'Women''s Pickleball Wednesday',
 '2026-07-09 09:00+10', '2026-07-09 11:00+10',
 'Toowong Recreation Centre', 'Benson St, Toowong QLD 4066', -27.4843, 152.9949,
 'any', 'female', 4, 10, 'published', 'public', false, null, 8.00, 'person', 'Court hire',
 'Women-only, encouragement vibe'),

(chialin, 'PICKLEBALL', 'Wynnum Waterside Pickleball',
 '2026-07-18 08:00+10', '2026-07-18 10:30+10',
 'Wynnum Foreshore Park', 'Tingal Rd, Wynnum QLD 4178', -27.4467, 153.1573,
 'intermediate', 'mixed', 4, 8, 'published', 'public', true, null, null, 'total', null,
 'Pop-up portable nets, bring your paddle'),

(alison,  'PICKLEBALL', 'West End Mixed Pickleball',
 '2026-07-26 09:30+10', '2026-07-26 12:00+10',
 'Musgrave Park', 'Cordelia St, South Brisbane QLD 4101', -27.4861, 153.0125,
 'any', 'mixed', 4, 12, 'published', 'public', true, null, null, 'total', null,
 'Open to all, equipment available'),

-- ── RUNNING (7) ───────────────────────────────────────────────────────────────
(chialin, 'RUNNING', 'Riverrun: Kangaroo Point to South Bank',
 '2026-06-10 06:00+10', '2026-06-10 07:30+10',
 'Kangaroo Point Cliffs', 'River Tce, Kangaroo Point QLD 4169', -27.4822, 153.0316,
 'any', 'mixed', 2, 30, 'published', 'public', true, null, null, 'total', null,
 '5km riverside route, pace yourself'),

(alison,  'RUNNING', 'New Farm Park Dawn Runners',
 '2026-06-18 05:45+10', '2026-06-18 07:15+10',
 'New Farm Park Rotunda', 'Brunswick St, New Farm QLD 4005', -27.4647, 153.0432,
 'beginner', 'mixed', 2, 25, 'published', 'public', true, null, null, 'total', null,
 '3km easy loop — run/walk welcome'),

(chialin, 'RUNNING', 'Mt Coot-tha Trails Run',
 '2026-06-27 06:30+10', '2026-06-27 09:00+10',
 'Mt Coot-tha Summit Lookout', 'Sir Samuel Griffith Dr, Toowong QLD 4066', -27.4768, 152.9380,
 'intermediate', 'mixed', 2, 15, 'published', 'public', true, null, null, 'total', null,
 '8km trail loop, trail shoes recommended'),

(alison,  'RUNNING', 'Botanic Gardens Easy 5k',
 '2026-07-04 07:00+10', '2026-07-04 08:30+10',
 'City Botanic Gardens', 'Alice St, Brisbane City QLD 4000', -27.4761, 153.0278,
 'any', 'mixed', 2, 30, 'published', 'public', true, null, null, 'total', null,
 'Flat path, coffee run after optional'),

(chialin, 'RUNNING', 'Sandgate Beach Sunrise Run',
 '2026-07-11 06:00+10', '2026-07-11 07:30+10',
 'Sandgate Beach', 'Flinders Pde, Sandgate QLD 4017', -27.3228, 153.0677,
 'any', 'mixed', 2, 25, 'published', 'public', true, null, null, 'total', null,
 'Flat esplanade, stunning sunrise views'),

(alison,  'RUNNING', 'Paddington Hilly Intervals',
 '2026-07-19 07:00+10', '2026-07-19 08:30+10',
 'Paddington Memorial Park', 'Latrobe Tce, Paddington QLD 4064', -27.4622, 152.9998,
 'advanced', 'mixed', 2, 15, 'published', 'public', true, null, null, 'total', null,
 'Hill reps on Latrobe Tce — legs will burn'),

(chialin, 'RUNNING', 'Southbank Sunset Jog',
 '2026-07-28 17:00+10', '2026-07-28 18:30+10',
 'South Bank Parklands', 'South Bank Pkwy, South Brisbane QLD 4101', -27.4818, 153.0217,
 'any', 'mixed', 2, 40, 'published', 'public', true, null, null, 'total', null,
 'Relaxed 4km, watch the river glow'),

-- ── CYCLING (7) ───────────────────────────────────────────────────────────────
(alison,  'CYCLING', 'Brisbane Bikeways Morning Spin',
 '2026-06-13 06:30+10', '2026-06-13 09:30+10',
 'Story Bridge Bikeway Start', 'Boundary St, Fortitude Valley QLD 4006', -27.4651, 153.0388,
 'any', 'mixed', 2, 20, 'published', 'public', true, null, null, 'total', null,
 '25km loop via South Bank and West End'),

(chialin, 'CYCLING', 'Manly to Cleveland Coastal Ride',
 '2026-06-20 06:00+10', '2026-06-20 10:00+10',
 'Manly Boat Harbour', 'Cambridge Pde, Manly QLD 4179', -27.4567, 153.1756,
 'intermediate', 'mixed', 2, 15, 'published', 'public', true, null, null, 'total', null,
 '40km bayside return, flat & scenic'),

(alison,  'CYCLING', 'Mt Coot-tha Hill Climb Challenge',
 '2026-06-28 06:00+10', '2026-06-28 09:00+10',
 'Mt Coot-tha Base Car Park', 'Sir Samuel Griffith Dr, Toowong QLD 4066', -27.4768, 152.9380,
 'advanced', 'mixed', 2, 12, 'published', 'public', true, null, null, 'total', null,
 'Summit 3x — road bike required'),

(chialin, 'CYCLING', 'Sandgate Esplanade Easy Pedal',
 '2026-07-05 07:00+10', '2026-07-05 09:30+10',
 'Sandgate Foreshore', 'Flinders Pde, Sandgate QLD 4017', -27.3228, 153.0677,
 'beginner', 'mixed', 2, 20, 'published', 'public', true, null, null, 'total', null,
 'Flat seaside path, all bikes welcome'),

(alison,  'CYCLING', 'New Farm Veloway Group Ride',
 '2026-07-12 07:00+10', '2026-07-12 10:00+10',
 'New Farm Veloway Entry', 'Merthyr Rd, New Farm QLD 4005', -27.4647, 153.0432,
 'intermediate', 'mixed', 4, 20, 'published', 'public', true, null, null, 'total', null,
 '30km group pace, no-drop ride'),

(chialin, 'CYCLING', 'UQ to Indooroopilly River Loop',
 '2026-07-19 06:30+10', '2026-07-19 09:30+10',
 'UQ Lakes Campus', 'University Dr, St Lucia QLD 4067', -27.4972, 152.9993,
 'any', 'mixed', 2, 15, 'published', 'public', true, null, null, 'total', null,
 '20km along riverside bikeway'),

(alison,  'CYCLING', 'Twilight Bikeway Blitz',
 '2026-07-25 16:30+10', '2026-07-25 19:00+10',
 'South Bank Bikeway Start', 'Grey St, South Brisbane QLD 4101', -27.4818, 153.0217,
 'intermediate', 'mixed', 4, 20, 'published', 'public', true, null, null, 'total', null,
 '35km evening ride, lights required'),

-- ── HIKING (7) ────────────────────────────────────────────────────────────────
(chialin, 'HIKING', 'Mt Coot-tha Summit Walk',
 '2026-06-14 07:00+10', '2026-06-14 11:00+10',
 'Mt Coot-tha Lookout', 'Sir Samuel Griffith Dr, Toowong QLD 4066', -27.4768, 152.9380,
 'any', 'mixed', 2, 20, 'published', 'public', true, null, null, 'total', null,
 '7km loop with city views at the top'),

(alison,  'HIKING', 'Kangaroo Point Cliffs Walk',
 '2026-06-21 07:30+10', '2026-06-21 10:00+10',
 'Kangaroo Point Cliffs Park', 'River Tce, Kangaroo Point QLD 4169', -27.4822, 153.0316,
 'beginner', 'mixed', 2, 25, 'published', 'public', true, null, null, 'total', null,
 '4km easy riverside walk, coffee stop after'),

(chialin, 'HIKING', 'D''Aguilar Range Track Day',
 '2026-06-28 06:00+10', '2026-06-28 13:00+10',
 'Walkabout Creek Discovery Centre', 'Enoggera Creek Rd, Mitchelton QLD 4053', -27.4217, 152.9780,
 'intermediate', 'mixed', 4, 12, 'published', 'public', true, null, null, 'total', null,
 '14km through the D''Aguilar Range, bring lunch'),

(alison,  'HIKING', 'Moreton Bay Foreshore Walk',
 '2026-07-05 07:00+10', '2026-07-05 10:30+10',
 'Wynnum Foreshore Park', 'Tingal Rd, Wynnum QLD 4178', -27.4467, 153.1573,
 'any', 'mixed', 2, 20, 'published', 'public', true, null, null, 'total', null,
 '10km along the bay, flat & breezy'),

(chialin, 'HIKING', 'Toohey Forest Trail Run Walk',
 '2026-07-12 07:00+10', '2026-07-12 10:30+10',
 'Toohey Forest Park Entry', 'Tarragindi Rd, Tarragindi QLD 4121', -27.5378, 153.0353,
 'intermediate', 'mixed', 2, 15, 'published', 'public', true, null, null, 'total', null,
 '12km through native bushland, red soil trails'),

(alison,  'HIKING', 'Samford Valley Scenic Hike',
 '2026-07-19 06:00+10', '2026-07-19 14:00+10',
 'Samford Village Car Park', 'Main St, Samford QLD 4520', -27.3686, 152.8836,
 'advanced', 'mixed', 4, 10, 'published', 'public', true, null, null, 'total', null,
 '20km challenging terrain, creek crossings, waterfall'),

(chialin, 'HIKING', 'New Farm Riverfront Stroll',
 '2026-07-26 08:00+10', '2026-07-26 10:30+10',
 'New Farm Park', 'Brunswick St, New Farm QLD 4005', -27.4647, 153.0432,
 'beginner', 'mixed', 2, 30, 'published', 'public', true, null, null, 'total', null,
 '5km easy walk, end at the Powerhouse café'),

-- ── BOULDERING (6) ────────────────────────────────────────────────────────────
(alison,  'BOULDERING', 'Urban Climb West End — Intro',
 '2026-06-11 10:00+10', '2026-06-11 12:30+10',
 'Urban Climb West End', 'Montague Rd, West End QLD 4101', -27.4903, 153.0102,
 'beginner', 'mixed', 2, 8, 'published', 'public', false, null, 22.00, 'person', 'Day pass included',
 'First-time climbers, technique session'),

(chialin, 'BOULDERING', 'Rockzion Acacia Ridge Saturday',
 '2026-06-21 11:00+10', '2026-06-21 14:00+10',
 'Rockzion Climbing', 'Beaudesert Rd, Acacia Ridge QLD 4110', -27.5908, 153.0307,
 'intermediate', 'mixed', 2, 10, 'published', 'public', false, null, 18.00, 'person', 'Entry included',
 'Project-send session on Vs–V8 walls'),

(alison,  'BOULDERING', 'Urban Climb Women''s Night',
 '2026-07-02 18:00+10', '2026-07-02 21:00+10',
 'Urban Climb West End', 'Montague Rd, West End QLD 4101', -27.4903, 153.0102,
 'any', 'female', 2, 10, 'published', 'public', false, null, 22.00, 'person', 'Day pass included',
 'Women-only supportive session'),

(chialin, 'BOULDERING', 'Advanced Dynos & Crimps',
 '2026-07-10 11:00+10', '2026-07-10 14:00+10',
 'Rockzion Climbing', 'Beaudesert Rd, Acacia Ridge QLD 4110', -27.5908, 153.0307,
 'advanced', 'mixed', 2, 8, 'published', 'public', false, null, 18.00, 'person', 'Entry included',
 'V8+ problem focus, bring tape & chalk'),

(alison,  'BOULDERING', 'Urban Climb Beginner Beta',
 '2026-07-19 10:00+10', '2026-07-19 13:00+10',
 'Urban Climb West End', 'Montague Rd, West End QLD 4101', -27.4903, 153.0102,
 'beginner', 'mixed', 2, 8, 'published', 'public', false, null, 22.00, 'person', 'Day pass included',
 'We show you the beta on every problem'),

(chialin, 'BOULDERING', 'Saturday Send Session',
 '2026-07-25 11:00+10', '2026-07-25 15:00+10',
 'Rockzion Climbing', 'Beaudesert Rd, Acacia Ridge QLD 4110', -27.5908, 153.0307,
 'intermediate', 'mixed', 4, 12, 'published', 'public', false, null, 18.00, 'person', 'Entry included',
 'V3–V6 circuit reset last week — fresh problems!'),

-- ── GYM (6) ───────────────────────────────────────────────────────────────────
(alison,  'GYM', 'New Farm Early Bird Lifts',
 '2026-06-12 05:30+10', '2026-06-12 07:30+10',
 'Fitness First New Farm', 'Merthyr Rd, New Farm QLD 4005', -27.4647, 153.0432,
 'any', 'mixed', 2, 6, 'published', 'public', true, null, null, 'total', null,
 'Bring your program, spot each other'),

(chialin, 'GYM', 'West End Powerlifting Club',
 '2026-06-22 18:00+10', '2026-06-22 20:00+10',
 'West End Barbell Club', 'Boundary St, West End QLD 4101', -27.4874, 153.0094,
 'intermediate', 'mixed', 2, 6, 'published', 'public', false, null, 15.00, 'person', 'Drop-in session fee',
 'Squat, bench, deadlift — bring your belt'),

(alison,  'GYM', 'Kelvin Grove Functional Fitness',
 '2026-07-01 06:00+10', '2026-07-01 07:30+10',
 'QUT Kelvin Grove Sport & Fitness', 'Victoria Park Rd, Kelvin Grove QLD 4059', -27.4487, 153.0063,
 'beginner', 'mixed', 2, 8, 'published', 'public', false, null, 12.00, 'person', 'Day pass',
 'Kettlebells, sleds & mobility'),

(chialin, 'GYM', 'CBD Lunchtime Strength Session',
 '2026-07-09 12:00+10', '2026-07-09 13:30+10',
 'City Gym Brisbane', 'Ann St, Brisbane City QLD 4000', -27.4698, 153.0251,
 'intermediate', 'mixed', 2, 4, 'published', 'public', false, null, 15.00, 'person', 'Casual entry fee',
 'Efficient 90-min compound movements only'),

(alison,  'GYM', 'Women''s Strength & Conditioning',
 '2026-07-17 18:00+10', '2026-07-17 19:30+10',
 'Fitness First Toowong', 'Sherwood Rd, Toowong QLD 4066', -27.4843, 152.9949,
 'any', 'female', 2, 8, 'published', 'public', false, null, 12.00, 'person', 'Drop-in rate',
 'Women-only, empowering environment'),

(chialin, 'GYM', 'Advanced Hypertrophy Block',
 '2026-07-24 07:00+10', '2026-07-24 09:00+10',
 'West End Barbell Club', 'Boundary St, West End QLD 4101', -27.4874, 153.0094,
 'advanced', 'mixed', 2, 6, 'published', 'public', false, null, 15.00, 'person', 'Drop-in fee',
 'Volume-focused push/pull session'),

-- ── YOGA (7) ──────────────────────────────────────────────────────────────────
(alison,  'YOGA', 'South Bank Sunrise Flow',
 '2026-06-14 06:00+10', '2026-06-14 07:30+10',
 'South Bank Parklands Lawn', 'South Bank Pkwy, South Brisbane QLD 4101', -27.4818, 153.0217,
 'any', 'mixed', 2, 30, 'published', 'public', true, null, null, 'total', null,
 'Outdoor Vinyasa, BYO mat, sunrise guarantee'),

(chialin, 'YOGA', 'Kangaroo Point Cliff Yin',
 '2026-06-22 17:30+10', '2026-06-22 19:00+10',
 'Kangaroo Point Cliffs Park', 'River Tce, Kangaroo Point QLD 4169', -27.4822, 153.0316,
 'beginner', 'mixed', 2, 20, 'published', 'public', true, null, null, 'total', null,
 'Yin style, restorative — mats provided'),

(alison,  'YOGA', 'West End Women''s Power Yoga',
 '2026-06-29 09:00+10', '2026-06-29 10:30+10',
 'West End Community Hall', 'Boundary St, West End QLD 4101', -27.4874, 153.0094,
 'intermediate', 'female', 4, 15, 'published', 'public', false, null, 15.00, 'person', 'Instructor donation',
 'Dynamic flow, women-only space'),

(chialin, 'YOGA', 'New Farm Park Meditation Yoga',
 '2026-07-05 07:30+10', '2026-07-05 09:00+10',
 'New Farm Park', 'Brunswick St, New Farm QLD 4005', -27.4647, 153.0432,
 'any', 'mixed', 2, 25, 'published', 'public', true, null, null, 'total', null,
 'Breathwork + slow flow, bring a mat'),

(alison,  'YOGA', 'Botanic Gardens Lunchtime Restore',
 '2026-07-13 12:00+10', '2026-07-13 13:00+10',
 'City Botanic Gardens', 'Alice St, Brisbane City QLD 4000', -27.4761, 153.0278,
 'any', 'mixed', 2, 20, 'published', 'public', true, null, null, 'total', null,
 '60-min restorative under the fig trees'),

(chialin, 'YOGA', 'Paddington Ashtanga Morning',
 '2026-07-20 06:30+10', '2026-07-20 08:30+10',
 'Paddington Community Hall', 'Latrobe Tce, Paddington QLD 4064', -27.4622, 152.9998,
 'advanced', 'mixed', 4, 12, 'published', 'public', false, null, 18.00, 'person', 'Instructor fee',
 'Traditional Ashtanga primary series'),

(alison,  'YOGA', 'Sandgate Beach Dusk Yoga',
 '2026-07-27 17:00+10', '2026-07-27 18:30+10',
 'Sandgate Beach Park', 'Flinders Pde, Sandgate QLD 4017', -27.3228, 153.0677,
 'any', 'mixed', 2, 25, 'published', 'public', true, null, null, 'total', null,
 'Beachside flow at golden hour — mats provided'),

-- ── PILATES (6) ───────────────────────────────────────────────────────────────
(chialin, 'PILATES', 'West End Mat Pilates Intro',
 '2026-06-13 09:00+10', '2026-06-13 10:30+10',
 'West End Community Hall', 'Boundary St, West End QLD 4101', -27.4874, 153.0094,
 'beginner', 'mixed', 2, 10, 'published', 'public', false, null, 18.00, 'person', 'Instructor fee',
 'Classic mat work, no equipment needed'),

(alison,  'PILATES', 'Toowong Reformer Collective',
 '2026-06-25 18:00+10', '2026-06-25 19:30+10',
 'Toowong Pilates Studio', 'Sherwood Rd, Toowong QLD 4066', -27.4843, 152.9949,
 'intermediate', 'mixed', 2, 6, 'published', 'public', false, null, 35.00, 'person', 'Reformer hire included',
 'Small group reformer session'),

(chialin, 'PILATES', 'New Farm Core & Posture',
 '2026-07-04 10:00+10', '2026-07-04 11:30+10',
 'New Farm Neighbourhood Centre', 'Brunswick St, New Farm QLD 4005', -27.4647, 153.0432,
 'any', 'female', 4, 10, 'published', 'public', false, null, 15.00, 'person', 'Instructor fee',
 'Posture correction focus, props provided'),

(alison,  'PILATES', 'CBD Express Pilates 45min',
 '2026-07-14 12:00+10', '2026-07-14 12:45+10',
 'City Yoga & Pilates Studio', 'Edward St, Brisbane City QLD 4000', -27.4698, 153.0251,
 'any', 'mixed', 2, 8, 'published', 'public', false, null, 20.00, 'person', 'Drop-in studio fee',
 'Lunch break express session, mat provided'),

(chialin, 'PILATES', 'Kelvin Grove Advanced Pilates',
 '2026-07-22 07:00+10', '2026-07-22 08:30+10',
 'QUT Kelvin Grove Sport & Fitness', 'Victoria Park Rd, Kelvin Grove QLD 4059', -27.4487, 153.0063,
 'advanced', 'mixed', 2, 8, 'published', 'public', false, null, 22.00, 'person', 'Studio hire',
 'Advanced spring resistance work, prior experience needed'),

(alison,  'PILATES', 'Kangaroo Point Sunset Pilates',
 '2026-07-29 17:30+10', '2026-07-29 19:00+10',
 'Kangaroo Point Cliffs Park', 'River Tce, Kangaroo Point QLD 4169', -27.4822, 153.0316,
 'any', 'mixed', 4, 15, 'published', 'public', false, null, 12.00, 'person', 'Instructor donation',
 'Outdoor mat Pilates with river views'),

-- ── SKATEBOARDING (6) ─────────────────────────────────────────────────────────
(chialin, 'SKATEBOARDING', 'South Bank Skate Plaza Session',
 '2026-06-13 15:00+10', '2026-06-13 18:00+10',
 'South Bank Skate Plaza', 'Little Stanley St, South Brisbane QLD 4101', -27.4818, 153.0217,
 'beginner', 'mixed', 2, 10, 'published', 'public', true, null, null, 'total', null,
 'Learn kick-flips and ollies, helmets on site'),

(alison,  'SKATEBOARDING', 'Fortitude Valley Street Session',
 '2026-06-21 16:00+10', '2026-06-21 19:00+10',
 'Fortitude Valley Skate Spot', 'Ann St, Fortitude Valley QLD 4006', -27.4577, 153.0349,
 'intermediate', 'mixed', 2, 10, 'published', 'public', true, null, null, 'total', null,
 'Street-style tricks, ledges & stairs'),

(chialin, 'SKATEBOARDING', 'New Farm Bowls Night Ride',
 '2026-07-03 17:30+10', '2026-07-03 20:30+10',
 'New Farm Skate Bowl', 'Brunswick St, New Farm QLD 4005', -27.4647, 153.0432,
 'any', 'mixed', 2, 15, 'published', 'public', true, null, null, 'total', null,
 'Lit bowl session, all bowl styles welcome'),

(alison,  'SKATEBOARDING', 'Chermside Park Advanced Skate',
 '2026-07-11 15:00+10', '2026-07-11 18:00+10',
 'Chermside Skate Park', 'Gympie Rd, Chermside QLD 4032', -27.3862, 153.0320,
 'advanced', 'mixed', 2, 8, 'published', 'public', true, null, null, 'total', null,
 'Vert & street advanced tricks only'),

(chialin, 'SKATEBOARDING', 'Women''s Skate Saturday',
 '2026-07-18 14:00+10', '2026-07-18 17:00+10',
 'South Bank Skate Plaza', 'Little Stanley St, South Brisbane QLD 4101', -27.4818, 153.0217,
 'any', 'female', 2, 12, 'published', 'public', true, null, null, 'total', null,
 'Women-only, supportive crowd, all levels'),

(alison,  'SKATEBOARDING', 'Carindale Skate Park Sunday Flow',
 '2026-07-26 15:00+10', '2026-07-26 18:00+10',
 'Carindale Skate Park', 'Creek Rd, Carindale QLD 4152', -27.5024, 153.1122,
 'intermediate', 'mixed', 2, 10, 'published', 'public', true, null, null, 'total', null,
 'Flow & transition tricks, chill vibe');

END $$;

RESET session_replication_role;

SELECT
  sport_key,
  COUNT(*) FILTER (WHERE address ILIKE '%QLD%') AS brisbane_count
FROM sessions
WHERE address ILIKE '%QLD%'
GROUP BY sport_key
ORDER BY sport_key;

SELECT COUNT(*) AS total_brisbane FROM sessions WHERE address ILIKE '%QLD%';
