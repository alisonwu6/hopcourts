-- 1. 確保 bucket 存在且為 public
insert into storage.buckets (id, name, public)
values ('sessions-photos', 'sessions-photos', true)
on conflict (id) do update set public = true;

-- 2. 清除舊的 policies (避免重複或衝突)
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated users can upload" on storage.objects;
drop policy if exists "sessions-photos read" on storage.objects;
drop policy if exists "sessions-photos insert" on storage.objects;
drop policy if exists "sessions-photos update" on storage.objects;
drop policy if exists "sessions-photos delete" on storage.objects;

-- 3. 建立新的 Policies (參考 Avatars 設定)

-- Policy: 讀取 (Read) - 全公開
create policy "sessions-photos read"
  on storage.objects for select
  using ( bucket_id = 'sessions-photos' );

-- Policy: 上傳 (Insert) - 僅限登入使用者
-- 這裡我們不限制資料夾路徑必須包含 userId，因為這是活動照片，可能由主辦人管理
-- 但必須是 authenticated role
create policy "sessions-photos insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'sessions-photos' 
    and auth.role() = 'authenticated'
  );

-- Policy: 更新 (Update) - 僅限上傳者
create policy "sessions-photos update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'sessions-photos'
    and auth.uid() = owner
  );

-- Policy: 刪除 (Delete) - 僅限上傳者
create policy "sessions-photos delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'sessions-photos'
    and auth.uid() = owner
  );
