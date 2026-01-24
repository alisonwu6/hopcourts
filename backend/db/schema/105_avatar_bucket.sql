-- Create storage bucket for user avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Policy: Anyone can view avatars
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Policy: Authenticated users can upload their own avatar
-- Note: This is a simplified policy. 
-- In a real app, you might want to restrict path to folder matching user ID like: (name like (auth.uid()::text || '/%'))
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' 
    and auth.role() = 'authenticated'
  );

-- Policy: Users can update their own avatar
create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
