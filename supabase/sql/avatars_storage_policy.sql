-- Avatar storage bucket + policies.
-- Run this in the Supabase SQL editor if avatar uploads are failing with an
-- RLS/permission error (e.g. "new row violates row-level security policy").
-- Safe to re-run.

-- Ensure the bucket exists and is public (avatar URLs are served via
-- getPublicUrl in app/utils/login/authUtils.ts, so the bucket must be public
-- for those URLs to actually load).
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Anyone can view avatars (they're public profile pictures).
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
on storage.objects for select
to public
using (bucket_id = 'avatars');

-- A user may only write to their own folder: avatars/<user_id>/...
-- (matches the filePath = `${userId}/avatar.${ext}` used in uploadAvatar).
drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
