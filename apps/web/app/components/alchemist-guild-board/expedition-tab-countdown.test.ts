import { describe, expect, test } from "bun:test";

import { ALCHEMIST_GUILD_EXPEDITION_DEFAULT } from "@dean-stack/schemas";

import { getExpeditionTabCountdownLabel } from "./expedition-tab-countdown";

function expedition(startedAtMs: number | null, readyAtMs: number | null) {
  return {
    ...ALCHEMIST_GUILD_EXPEDITION_DEFAULT,
    readyAtMs,
    startedAtMs,
    targetCardId: "element:si",
  };
}

describe("getExpeditionTabCountdownLabel", () => {
  test("formats the remaining time as M:SS while a run is in flight", () => {
    // 2m34s left.
    expect(getExpeditionTabCountdownLabel(expedition(0, 154_000), 0)).toBe("2:34");
    // 9s left → zero-padded seconds.
    expect(getExpeditionTabCountdownLabel(expedition(0, 9_000), 0)).toBe("0:09");
    // Rounds up the partial second so it never flickers to the lower value early.
    expect(getExpeditionTabCountdownLabel(expedition(0, 1_500), 0)).toBe("0:02");
  });

  test("is null when no expedition is running", () => {
    expect(getExpeditionTabCountdownLabel(expedition(null, null), 0)).toBeNull();
    expect(getExpeditionTabCountdownLabel(ALCHEMIST_GUILD_EXPEDITION_DEFAULT, 0)).toBeNull();
  });

  test("is null once the run has arrived (never shows 0:00)", () => {
    expect(getExpeditionTabCountdownLabel(expedition(0, 10_000), 10_000)).toBeNull();
    expect(getExpeditionTabCountdownLabel(expedition(0, 10_000), 12_000)).toBeNull();
  });
});
