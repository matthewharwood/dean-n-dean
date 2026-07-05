import * as z from "zod";

// Cross-tab notification bus. When an important event happens in one tab (e.g. an
// expedition finishes), it broadcasts here; OTHER same-origin tabs receive it and
// raise a toast. BroadcastChannel does NOT echo to the sender, which is exactly
// the "something happened on another tab" semantics we want — the originating tab
// already has its own in-place UI for the event.

export const AppNotificationToneSchema = z.enum(["info", "success", "celebrate"]);
export type AppNotificationTone = z.infer<typeof AppNotificationToneSchema>;

export const AppNotificationSchema = z.object({
  body: z.string().default(""),
  createdAtMs: z.number(),
  id: z.string().min(1),
  title: z.string().min(1),
  tone: AppNotificationToneSchema.default("info"),
});
export type AppNotification = z.infer<typeof AppNotificationSchema>;

/** How long a toast lives before auto-dismissing, and the progress-bar duration. */
export const NOTIFICATION_TOAST_DURATION_MS = 8000;
/** At most this many toasts stack at once; older ones drop off. */
export const NOTIFICATION_TOAST_MAX = 3;

const CHANNEL_NAME = "web:notifications";

const channel =
  typeof window !== "undefined" && "BroadcastChannel" in window
    ? new BroadcastChannel(CHANNEL_NAME)
    : null;

// In-tab listeners, so the tab where the event happened ALSO raises the toast
// (achievement-style events like "first quest complete" should show right here,
// not only on other tabs). BroadcastChannel handles the cross-tab half.
const localListeners = new Set<(notification: AppNotification) => void>();

/**
 * Raise a notification everywhere: synchronously in THIS tab (local listeners)
 * and, via BroadcastChannel, in every other same-origin tab. This is the single
 * entry point the unified game-event model calls.
 */
export function raiseNotification(notification: AppNotification): void {
  for (const listener of localListeners) listener(notification);
  channel?.postMessage(notification);
}

/** Cross-tab only — used where a tab should notify OTHERS but not itself. */
export function broadcastNotification(notification: AppNotification): void {
  channel?.postMessage(notification);
}

export function subscribeNotifications(
  onNotification: (notification: AppNotification) => void,
): () => void {
  localListeners.add(onNotification);
  const handler = (event: MessageEvent) => {
    const parsed = AppNotificationSchema.safeParse(event.data);
    if (parsed.success) onNotification(parsed.data);
  };
  channel?.addEventListener("message", handler);
  return () => {
    localListeners.delete(onNotification);
    channel?.removeEventListener("message", handler);
  };
}

// --- Pure queue helpers (unit-tested) --------------------------------------

/** Add a notification, de-duplicating by id and capping the live stack. */
export function addNotification(
  queue: readonly AppNotification[],
  notification: AppNotification,
  max = NOTIFICATION_TOAST_MAX,
): AppNotification[] {
  if (queue.some((entry) => entry.id === notification.id)) return [...queue];
  return [...queue, notification].slice(-max);
}

/** Remove a notification by id (on dismiss / auto-expire). */
export function removeNotification(
  queue: readonly AppNotification[],
  id: string,
): AppNotification[] {
  return queue.filter((entry) => entry.id !== id);
}
