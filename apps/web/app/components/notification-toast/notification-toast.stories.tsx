import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import {
  type AppNotification,
  type AppNotificationTone,
  raiseNotification,
} from "./notification-channel";
import { NotificationToast } from "./notification-toast";
import { NotificationToastHost } from "./notification-toast-host";

function note(id: string, tone: AppNotificationTone, title: string, body: string): AppNotification {
  return { body, createdAtMs: 0, id, title, tone };
}

const meta = {
  title: "Components/NotificationToast",
  component: NotificationToast,
  parameters: { layout: "centered" },
  args: {
    durationMs: 8000,
    notification: note("demo", "success", "Expedition returned", "Your cargo is ready to claim."),
    onDismiss: () => undefined,
  },
} satisfies Meta<typeof NotificationToast>;

export default meta;
type Story = StoryObj<typeof meta>;

// A single toast in a positioned frame; respawns on dismiss so it's re-demoable.
function SingleStage({
  durationMs,
  notification,
}: {
  durationMs: number;
  notification: AppNotification;
}) {
  const [runKey, setRunKey] = useState(0);
  return (
    <div className="grid min-h-48 w-[26rem] max-w-full place-items-center bg-slate-800 p-6">
      <NotificationToast
        key={runKey}
        durationMs={durationMs}
        notification={notification}
        onDismiss={() => setRunKey((key) => key + 1)}
      />
    </div>
  );
}

export const Single: Story = {
  render: (args) => <SingleStage durationMs={args.durationMs} notification={args.notification} />,
};

// Hides (does not respawn) on dismiss, so an auto-dismiss test sees it go for good.
function OnceStage({
  durationMs,
  notification,
}: {
  durationMs: number;
  notification: AppNotification;
}) {
  const [gone, setGone] = useState(false);
  return (
    <div className="grid min-h-48 w-[26rem] max-w-full place-items-center bg-slate-800 p-6">
      {gone ? (
        <p data-test="toast-gone" className="text-sm font-black text-white/60">
          dismissed
        </p>
      ) : (
        <NotificationToast
          durationMs={durationMs}
          notification={notification}
          onDismiss={() => setGone(true)}
        />
      )}
    </div>
  );
}

export const QuickDismiss: Story = {
  name: "Quick (1.5s auto-dismiss)",
  args: { durationMs: 1500 },
  render: (args) => <OnceStage durationMs={args.durationMs} notification={args.notification} />,
};

const GALLERY: readonly AppNotification[] = [
  note("g-success", "success", "Expeditions unlocked", "Plot a route from the Expedition tab."),
  note("g-celebrate", "celebrate", "First quest complete!", "The guild is taking notice of you."),
  note("g-info", "info", "Heads up", "Something worth a glance happened."),
];

export const Tones: Story = {
  render: () => (
    <div className="grid w-[26rem] max-w-full gap-3 bg-slate-800 p-6">
      {GALLERY.map((notification) => (
        <NotificationToast
          key={notification.id}
          durationMs={60_000}
          notification={notification}
          onDismiss={() => undefined}
        />
      ))}
    </div>
  ),
};

// The host + raise buttons — exercises the full bus → queue → stack → dismiss flow.
function HostPlayground() {
  return (
    <div className="min-h-screen w-screen bg-[radial-gradient(circle_at_50%_30%,#1e293b,#0f172a)] p-8">
      <h1 className="text-xl font-black text-white">Toast host playground</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          data-test="raise-success"
          className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-black text-emerald-950"
          onClick={() =>
            raiseNotification(
              note(`s-${performance.now()}`, "success", "Expedition returned", "Cargo ready."),
            )
          }
        >
          Raise success
        </button>
        <button
          type="button"
          data-test="raise-celebrate"
          className="rounded-md bg-fuchsia-500 px-3 py-2 text-sm font-black text-fuchsia-950"
          onClick={() =>
            raiseNotification(
              note(`c-${performance.now()}`, "celebrate", "Upgrade unlocked!", "Visit Upgrades."),
            )
          }
        >
          Raise celebrate
        </button>
      </div>
      <NotificationToastHost />
    </div>
  );
}

export const Host: Story = {
  parameters: { layout: "fullscreen" },
  render: () => <HostPlayground />,
};
