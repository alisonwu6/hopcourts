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

