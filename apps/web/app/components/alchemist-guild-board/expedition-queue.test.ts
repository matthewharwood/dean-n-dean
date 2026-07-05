import { describe, expect, test } from "bun:test";

import {
  ALCHEMIST_GUILD_EXPEDITION_DEFAULT,
  type AlchemistGuildExpeditionState,
  EXPEDITION_QUEUE_MAX,
} from "@dean-stack/schemas";

import {
  advanceExpeditionQueue,
  canQueueExpedition,
  expeditionInFlightCount,
  removeQueuedExpedition,
  startOrEnqueueExpedition,
} from "./expedition-queue";

const DURATION = 180_000;

function expedition(
  partial: Partial<AlchemistGuildExpeditionState>,
): AlchemistGuildExpeditionState {
  return { ...ALCHEMIST_GUILD_EXPEDITION_DEFAULT, ...partial };
}

describe("expedition queue", () => {
  test("starts a fresh run when the dock is idle", () => {
    const next = startOrEnqueueExpedition(
      ALCHEMIST_GUILD_EXPEDITION_DEFAULT,
      "element:fe",
      true,
      1000,
      DURATION,
    );
    expect(next.targetCardId).toBe("element:fe");
    expect(next.startedAtMs).toBe(1000);
    expect(next.readyAtMs).toBe(1000 + DURATION);
    expect(next.queuedTargetCardIds).toEqual([]);
  });

  test("queues behind the active run when the upgrade is on and there's room", () => {
    const active = expedition({ readyAtMs: DURATION, startedAtMs: 0, targetCardId: "element:fe" });
    const queued = startOrEnqueueExpedition(active, "element:cu", true, 1000, DURATION);
    expect(queued.targetCardId).toBe("element:fe"); // active unchanged
    expect(queued.queuedTargetCardIds).toEqual(["element:cu"]);
  });

  test("refuses to queue without the upgrade or past the cap", () => {
    const active = expedition({ readyAtMs: DURATION, startedAtMs: 0, targetCardId: "element:fe" });
    // No upgrade → unchanged.
    expect(startOrEnqueueExpedition(active, "element:cu", false, 1000, DURATION)).toBe(active);

    // Filled to the cap (active + (MAX-1) queued) → can't queue more.
    const full = expedition({
      queuedTargetCardIds: Array.from({ length: EXPEDITION_QUEUE_MAX - 1 }, () => "element:cu"),
      readyAtMs: DURATION,
      startedAtMs: 0,
      targetCardId: "element:fe",
    });
    expect(expeditionInFlightCount(full)).toBe(EXPEDITION_QUEUE_MAX);
    expect(canQueueExpedition(full, true)).toBe(false);
    expect(startOrEnqueueExpedition(full, "element:au", true, 1000, DURATION)).toBe(full);
  });

  test("advancing auto-starts the next queued run", () => {
    const withQueue = expedition({
      queuedTargetCardIds: ["element:cu", "element:au"],
      readyAtMs: DURATION,
      startedAtMs: 0,
      targetCardId: "element:fe",
    });
    const advanced = advanceExpeditionQueue(withQueue, 5000, DURATION);
    expect(advanced.targetCardId).toBe("element:cu");
    expect(advanced.startedAtMs).toBe(5000);
    expect(advanced.readyAtMs).toBe(5000 + DURATION);
    expect(advanced.queuedTargetCardIds).toEqual(["element:au"]);
  });

  test("advancing clears the dock when the queue is empty", () => {
    const lastRun = expedition({ readyAtMs: DURATION, startedAtMs: 0, targetCardId: "element:fe" });
    const cleared = advanceExpeditionQueue(lastRun, 5000, DURATION);
    expect(cleared.targetCardId).toBeNull();
    expect(cleared.startedAtMs).toBeNull();
    expect(cleared.readyAtMs).toBeNull();
    expect(cleared.queuedTargetCardIds).toEqual([]);
  });

  test("removeQueuedExpedition drops a not-yet-started target", () => {
    const withQueue = expedition({
      queuedTargetCardIds: ["element:cu", "element:au"],
      targetCardId: "element:fe",
    });
    expect(removeQueuedExpedition(withQueue, "element:cu").queuedTargetCardIds).toEqual([
      "element:au",
    ]);
    // A miss leaves it unchanged.
    expect(removeQueuedExpedition(withQueue, "element:zz")).toBe(withQueue);
  });
});
