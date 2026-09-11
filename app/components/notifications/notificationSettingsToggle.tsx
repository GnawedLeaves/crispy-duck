"use client";

import { useAuth } from "@/app/context/AuthContext";
import { token } from "@/app/theme";
import { useState } from "react";
import Toggle from "../toggle/toggle";
import { useToast } from "../toast/toastNotification";
import {
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/app/utils/notifications/pushClient";
import {
  markNotificationsPrompted,
  removePushSubscription,
  savePushSubscription,
  setNotificationsEnabled,
} from "@/app/utils/supabase/notificationAction";

const NotificationSettingsToggle = () => {
  const { user, refreshUser } = useAuth();
  const { triggerToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  if (!user?.id || !user.profile) return null;

  const enabled = user.profile.notifications_enabled ?? true;

  const handleToggle = async (next: boolean) => {
    if (!user.id) return;
    setIsSaving(true);
    try {
      if (next) {
        if (isPushSupported() && Notification.permission !== "granted") {
          const subscription = await subscribeToPush();
          if (
            subscription?.endpoint &&
            subscription.keys?.p256dh &&
            subscription.keys?.auth
          ) {
            await savePushSubscription(user.id, {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
              },
            });
          } else {
            triggerToast(
              "Enable notifications in your browser settings first",
              token.light.redColor,
            );
            return;
          }
        }
        await setNotificationsEnabled(user.id, true);
        triggerToast("Notifications turned on", token.light.primaryColor);
      } else {
        const endpoint = await unsubscribeFromPush();
        if (endpoint) await removePushSubscription(endpoint);
        await setNotificationsEnabled(user.id, false);
        triggerToast("Notifications turned off", token.light.tempGrey);
      }
      await markNotificationsPrompted(user.id);
      await refreshUser();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="cardWithShadow flex items-center justify-between gap-4 w-full max-w-sm">
      <div>
        <p className="font-semibold text-sm">New scan notifications</p>
        <p className="text-xs opacity-60">
          Get notified when a friend adds a new scan
        </p>
      </div>
      <Toggle
        checked={enabled}
        onChange={handleToggle}
        disabled={isSaving}
        ariaLabel="Toggle new scan notifications"
      />
    </div>
  );
};

export default NotificationSettingsToggle;
