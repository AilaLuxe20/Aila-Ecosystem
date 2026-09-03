/**
 * Notification capability probe for Aila.
 *
 * Supported today (browser APIs only — no fake push):
 * - Service Worker (install / offline shell)
 * - Notification permission API when present (local notifications only if we ever show them)
 *
 * Not implemented (requires VAPID keys + push subscription backend — do not fake):
 * - Web Push
 * - Background sync push campaigns
 */

export type AilaNotificationSupport = {
  serviceWorker: boolean;
  notificationApi: boolean;
  pushManager: boolean;
  permission: NotificationPermission | "unsupported";
};

export function getAilaNotificationSupport(): AilaNotificationSupport {
  if (typeof window === "undefined") {
    return {
      serviceWorker: false,
      notificationApi: false,
      pushManager: false,
      permission: "unsupported",
    };
  }

  const notificationApi = "Notification" in window;
  return {
    serviceWorker: "serviceWorker" in navigator,
    notificationApi,
    pushManager: "PushManager" in window,
    permission: notificationApi ? Notification.permission : "unsupported",
  };
}

/** Request permission for local Notification API only — does not subscribe to push. */
export async function requestLocalNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Notification.permission;
  }
  return Notification.requestPermission();
}
