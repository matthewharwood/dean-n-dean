import { describe, expect, test } from "bun:test";
import { ALCHEMIST_GUILD_FIRST_WATER_QUEST_ID } from "@dean-stack/schemas";

import {
  getVisibleBoardModeTabs,
  isGatheringAvailable,
  resolveVisibleBoardMode,
  shouldShowGatheringNudge,
} from "./board-mode-tabs";

describe("board mode tutorial tabs", () => {
  test("hides gathering before the first Water quest is claimed", () => {
    expect(isGatheringAvailable([])).toBe(false);
    expect(
      getVisibleBoardModeTabs({
        expeditionAvailable: false,
        gatheringAvailable: false,
        upgradesAvailable: false,
      }),
    ).toEqual(["crafting"]);
  });

  test("reveals gathering after the first Water quest is claimed", () => {
    expect(isGatheringAvailable([ALCHEMIST_GUILD_FIRST_WATER_QUEST_ID])).toBe(true);
    expect(
      getVisibleBoardModeTabs({
        expeditionAvailable: false,
        gatheringAvailable: true,
        upgradesAvailable: false,
      }),
    ).toEqual(["crafting", "gathering"]);
  });

  test("reveals the upgrades tab only once an upgrade is unlocked", () => {
    expect(
      getVisibleBoardModeTabs({
        expeditionAvailable: true,
        gatheringAvailable: true,
        upgradesAvailable: true,
      }),
    ).toEqual(["crafting", "gathering", "expedition", "upgrades"]);
  });

  test("falls back to crafting if persisted state points at a hidden tab", () => {
    expect(
      resolveVisibleBoardMode({
        activeBoardMode: "upgrades",
        expeditionAvailable: false,
        gatheringAvailable: false,
        upgradesAvailable: false,
      }),
    ).toBe("crafting");
  });

  test("stops the gathering nudge once the persisted unlock has been seen", () => {
    expect(
      shouldShowGatheringNudge({
        activeBoardMode: "crafting",
        dismissedKey: null,
        gatheringNudgeKey: "needs:gathering",
        gatheringUnlockSeen: false,
      }),
    ).toBe(true);
    expect(
      shouldShowGatheringNudge({
        activeBoardMode: "crafting",
        dismissedKey: null,
        gatheringNudgeKey: "needs:gathering",
        gatheringUnlockSeen: true,
      }),
    ).toBe(false);
  });
});
