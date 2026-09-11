-- Notifications feature schema
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).
-- Assumes the existing `profiles` and `friendships` tables (requester_id,
-- addressee_id, status) already exist, as used elsewhere in the app.

-- 1. Per-user notification preference + "have we asked them yet" flag.
-- Existing users default to notifications_enabled = true and
-- notifications_prompted = false, so they'll be prompted once on next visit.
alter table profiles
  add column if not exists notifications_enabled boolean not null default true,
  add column if not exists notifications_prompted boolean not null default false;

-- 2. Web push subscriptions (one row per browser/device a user has enabled
-- notifications on).
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

-- Users can read their own subscription rows, and friends can read each
-- other's rows so that when a scan is added, the scan-adder's session can
-- look up their friends' push endpoints to deliver the notification.
drop policy if exists "push_subscriptions_select_own_or_friend" on push_subscriptions;
create policy "push_subscriptions_select_own_or_friend"
on push_subscriptions for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from friendships f
    where f.status = 'accepted'
      and (
        (f.requester_id = auth.uid() and f.addressee_id = user_id)
        or (f.addressee_id = auth.uid() and f.requester_id = user_id)
      )
  )
);

drop policy if exists "push_subscriptions_insert_own" on push_subscriptions;
create policy "push_subscriptions_insert_own"
on push_subscriptions for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "push_subscriptions_update_own" on push_subscriptions;
create policy "push_subscriptions_update_own"
on push_subscriptions for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "push_subscriptions_delete_own" on push_subscriptions;
create policy "push_subscriptions_delete_own"
on push_subscriptions for delete
to authenticated
using (user_id = auth.uid());
