-- Allow anyone (including anonymous users) to upload and read feedback images.
-- The contact form is public, so image uploads must work without authentication.
DROP POLICY IF EXISTS "Feedback Images Public Read" ON storage.objects;
CREATE POLICY "Feedback Images Public Read" ON storage.objects
  FOR SELECT USING (bucket_id = 'feedback-images');

DROP POLICY IF EXISTS "Feedback Images Public Upload" ON storage.objects;
CREATE POLICY "Feedback Images Public Upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'feedback-images');
