import { useEffect, useState } from "react";
import * as z from "zod";

import { defineComponent } from "~/lib/define-component";
import {
  type AppNotification,
  addNotification,
  NOTIFICATION_TOAST_DURATION_MS,
  removeNotification,
  subscribeNotifications,
} from "./notification-channel";
import { NotificationToast } from "./notification-toast";

// Mounts once near the app root. Subscribes to the unified notification bus (both
// in-tab raises and cross-tab broadcasts) and renders the live toast stack in the
// bottom-right. Each toast owns its own lifetime; the host just adds/removes from
// the capped, de-duplicated queue.
export const NotificationToastHost = defineComponent(z.object({}), () => {
  const [queue, setQueue] = useState<AppNotification[]>([]);

  useEffect(() => {
    return subscribeNotifications((notification) => {
      setQueue((current) => addNotification(current, notification));
    });
  }, []);

  const handleDismiss = (id: string) => {
    setQueue((current) => removeNotification(current, id));
  };

  return (
    <div
      data-board-section="notification-toast-host"
      className="pointer-events-none fixed inset-x-0 bottom-3 z-[140] grid justify-items-center gap-2 px-3 sm:right-3 sm:left-auto sm:justify-items-end"
    >
      {queue.map((notification) => (
        <NotificationToast
          key={notification.id}
          durationMs={NOTIFICATION_TOAST_DURATION_MS}
          notification={notification}
          onDismiss={handleDismiss}
        />
      ))}
    </div>
  );
});
