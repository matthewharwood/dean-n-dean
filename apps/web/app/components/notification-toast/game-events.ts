import {
  type AppNotification,
  type AppNotificationTone,
  raiseNotification,
} from "./notification-channel";

// The unified game-event model. Game code calls notifyGameEvent(kind) at the
// moment something noteworthy happens; this maps the event to toast copy and
// raises it both in-tab and across tabs. Adding a new notifiable event is a
// single entry here plus one call site — no bespoke toast wiring per event.

export type GameEventKind =
  | "quest-first-complete"
  | "expedition-unlocked"
  | "expedition-ready"
  | "upgrade-unlocked";

const GAME_EVENT_COPY: Record<
  GameEventKind,
  { body: string; title: string; tone: AppNotificationTone }
> = {
  "quest-first-complete": {
    body: "The guild is taking notice of you.",
    title: "First quest complete!",
    tone: "celebrate",
  },
  "expedition-unlocked": {
    body: "Plot a route from the Expedition tab.",
    title: "Expeditions unlocked",
    tone: "success",
  },
  "expedition-ready": {
    body: "Your expedition has returned — claim the cargo.",
    title: "Expedition returned",
    tone: "success",
  },
  "upgrade-unlocked": {
    body: "A new upgrade is waiting in the Upgrades tab.",
    title: "Upgrade unlocked!",
    tone: "celebrate",
  },
};

/** Build (but don't raise) the notification for an event — pure, unit-tested. */
export function buildGameEventNotification(
  kind: GameEventKind,
  nowMs: number,
  detail?: string,
): AppNotification {
  const copy = GAME_EVENT_COPY[kind];
  return {
    body: detail ?? copy.body,
    createdAtMs: nowMs,
    // Same id in every tab (deterministic from kind+time) so cross-tab delivery
    // de-dupes against the local raise instead of showing twice.
    id: `${kind}:${nowMs}`,
    title: copy.title,
    tone: copy.tone,
  };
}

/** Raise the notification for a game event, locally + across tabs. */
export function notifyGameEvent(kind: GameEventKind, nowMs = Date.now(), detail?: string): void {
  raiseNotification(buildGameEventNotification(kind, nowMs, detail));
}
