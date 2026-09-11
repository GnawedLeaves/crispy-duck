"use server";

import { PushSubscriptionPayload } from "@/app/types/commonTypes";
import { cookies } from "next/headers";
import webpush from "web-push";
import { createClient } from "./server";

if (process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );
}

export async function setNotificationsEnabled(userId: string, enabled: boolean) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase
    .from("profiles")
    .update({ notifications_enabled: enabled })
    .eq("id", userId);
  return { error };
}

export async function markNotificationsPrompted(userId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase
    .from("profiles")
    .update({ notifications_prompted: true })
    .eq("id", userId);
  return { error };
}

export async function savePushSubscription(
  userId: string,
  subscription: PushSubscriptionPayload,
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: "endpoint" },
  );
  return { error };
}

export async function removePushSubscription(endpoint: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint);
  return { error };
}

// Notifies every accepted friend of `actorId` (the currently authenticated
// user, expected to match auth.uid() so RLS lets us read their friend list)
// that they've added a new scan. Best-effort: failures for individual
// subscriptions are swallowed so one bad endpoint doesn't block the rest.
export async function notifyFriendsOfNewScan(actorId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: actorProfile } = await supabase
    .from("profiles")
    .select("display_name, username")
    .eq("id", actorId)
    .single();
  const actorName =
    actorProfile?.display_name || actorProfile?.username || "A friend";

  const { data: friendRows, error: friendError } = await supabase.rpc(
    "get_friend_panel",
    {
      p_filter: "friends",
      p_search: null,
      p_limit: 500,
      p_offset: 0,
    },
  );
  if (friendError || !friendRows?.length) return;

  const friendIds: string[] = friendRows.map((row: { id: string }) => row.id);

  const { data: recipients } = await supabase
    .from("profiles")
    .select("id")
    .in("id", friendIds)
    .eq("notifications_enabled", true);
  if (!recipients?.length) return;

  const recipientIds = recipients.map((recipient) => recipient.id);

  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .in("user_id", recipientIds);
  if (!subscriptions?.length) return;

  const payload = JSON.stringify({
    title: "New scan added",
    body: `${actorName} just added a new scan.`,
    url: `/profile/view/${actorId}`,
  });

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          payload,
        );
      } catch (err) {
        // 404/410 means the subscription is stale (user uninstalled, cleared
        // site data, etc.) — clean it up so we stop trying it.
        const statusCode =
          err instanceof webpush.WebPushError ? err.statusCode : undefined;
        if (statusCode === 404 || statusCode === 410) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", subscription.endpoint);
        } else {
          console.error("Failed to send push notification:", err);
        }
      }
    }),
  );
}
