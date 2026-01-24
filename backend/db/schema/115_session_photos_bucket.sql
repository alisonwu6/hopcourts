-- Create storage bucket for session photos
insert into storage.buckets (id, name, public)
values ('sessions-photos', 'sessions-photos', true)
on conflict (id) do nothing;

-- Policy: Anyone can view photos
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'sessions-photos' );

-- Policy: Authenticated users can upload photos
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check (
    bucket_id = 'sessions-photos' 
    and auth.role() = 'authenticated'
  );
