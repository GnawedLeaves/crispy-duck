"use client";

import { useAuth } from "@/app/context/AuthContext";
import { token } from "@/app/theme";
import { useEffect, useState } from "react";
import CustomModal from "../modal/customModal";
import { useToast } from "../toast/toastNotification";
import {
  isPushSupported,
  subscribeToPush,
} from "@/app/utils/notifications/pushClient";
import {
  markNotificationsPrompted,
  savePushSubscription,
  setNotificationsEnabled,
} from "@/app/utils/supabase/notificationAction";

// Shown at most once per user: asks them to turn on push notifications for
// friends' new scans. Whatever they choose, we mark them as "prompted" so
// this doesn't show again on future visits.
const NotificationPermissionPrompt = () => {
  const { user, refreshUser } = useAuth();
  const { triggerToast } = useToast();
  const [dismissed, setDismissed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pushSupported = isPushSupported();
  const permissionDenied = pushSupported && Notification.permission === "denied";
  const isOpen =
    !!user?.id &&
    !!user.profile &&
    !user.profile.notifications_prompted &&
    !dismissed &&
    pushSupported &&
    !permissionDenied;

  useEffect(() => {
    // Already blocked at the browser level — record that we asked (in
    // spirit) so we don't keep showing our own prompt every visit.
    if (user?.id && user.profile && !user.profile.notifications_prompted && permissionDenied) {
      markNotificationsPrompted(user.id);
    }
  }, [user?.id, user?.profile, permissionDenied]);

  if (!user?.id) return null;

  const handleEnable = async () => {
    setIsSubmitting(true);
    try {
      const subscription = await subscribeToPush();
      if (subscription?.endpoint && subscription.keys?.p256dh && subscription.keys?.auth) {
        await savePushSubscription(user.id, {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
          },
        });
        await setNotificationsEnabled(user.id, true);
        triggerToast("Notifications enabled!", token.light.primaryColor);
      } else {
        triggerToast(
          "Couldn't enable notifications on this device",
          token.light.redColor,
        );
      }
    } finally {
      await markNotificationsPrompted(user.id);
      await refreshUser();
      setIsSubmitting(false);
      setDismissed(true);
    }
  };

  const handleDismiss = async () => {
    setDismissed(true);
    await markNotificationsPrompted(user.id);
    await refreshUser();
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleDismiss}
      title="Stay in the loop"
      modalType="action"
      actionButtonText={isSubmitting ? "Enabling..." : "Turn on notifications"}
      closeButtonText="Not now"
      onActionClick={handleEnable}
    >
      <p className="text-sm opacity-70">
        Get notified when a friend adds a new scan. You can change this
        anytime from your profile.
      </p>
    </CustomModal>
  );
};

export default NotificationPermissionPrompt;
