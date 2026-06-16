import { describe, expect, test } from "bun:test";

import { buildGameEventNotification } from "./game-events";
import {
  type AppNotification,
  AppNotificationSchema,
  addNotification,
  NOTIFICATION_TOAST_MAX,
  removeNotification,
} from "./notification-channel";

function toast(id: string, title = "Hi"): AppNotification {
  return { body: "", createdAtMs: 0, id, title, tone: "info" };
}

describe("notification queue", () => {
  test("adds notifications and de-duplicates by id", () => {
    const a = addNotification([], toast("a"));
    expect(a.map((entry) => entry.id)).toEqual(["a"]);
    const again = addNotification(a, toast("a", "different title"));
    expect(again.map((entry) => entry.id)).toEqual(["a"]); // de-duped
  });

  test("caps the live stack, dropping the oldest", () => {
    let queue: AppNotification[] = [];
    for (const id of ["a", "b", "c", "d", "e"]) queue = addNotification(queue, toast(id));
    expect(queue).toHaveLength(NOTIFICATION_TOAST_MAX);
    expect(queue.map((entry) => entry.id)).toEqual(["c", "d", "e"]);
  });

  test("removes a notification by id", () => {
    const queue = [toast("a"), toast("b"), toast("c")];
    expect(removeNotification(queue, "b").map((entry) => entry.id)).toEqual(["a", "c"]);
  });
});

describe("buildGameEventNotification", () => {
  test("maps each event kind to valid, parseable toast copy", () => {
    for (const kind of [
      "quest-first-complete",
      "expedition-unlocked",
      "expedition-ready",
      "upgrade-unlocked",
    ] as const) {
      const notification = buildGameEventNotification(kind, 1234);
      expect(() => AppNotificationSchema.parse(notification)).not.toThrow();
      expect(notification.title.length).toBeGreaterThan(0);
      expect(notification.id).toBe(`${kind}:1234`);
    }
  });

  test("honors a custom detail body", () => {
    const notification = buildGameEventNotification("expedition-ready", 1, "Iron ore secured.");
    expect(notification.body).toBe("Iron ore secured.");
  });
});
