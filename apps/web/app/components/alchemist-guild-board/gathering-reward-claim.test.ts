import { describe, expect, test } from "bun:test";

import { ALCHEMIST_GUILD_BOARD_DEFAULT } from "@dean-stack/schemas";

import { createGatheringRound } from "./gathering-loop";
import { claimGatheringRewardForBoard } from "./gathering-reward-claim";
import { streakBonusForOptionIndex } from "./gathering-streak";
import {
  CELESTIAL_STREAK_UPGRADE_ID,
  HYDROGEN_BOUNTY_MULTIPLIER,
  HYDROGEN_BOUNTY_UPGRADE_ID,
} from "./upgrades";

const STREAK_REWARD_OPTIONS = ["element:h", "element:he", "element:li"];

function rewardBoardStateWithStreak(streakCurrent: number, optionCardIds = STREAK_REWARD_OPTIONS) {
  return {
    ...ALCHEMIST_GUILD_BOARD_DEFAULT,
    // Zero the starter quantities so each grant reads as exactly 1 + bonus
    // (hydrogen etc. ship with a non-zero default that would otherwise offset it).
    elementQuantities: {},
    gathering: {
      ...createGatheringRound(1),
      phase: "reward" as const,
      rewardOptionCardIds: optionCardIds,
      streak: {
        current: streakCurrent,
        lastBrokenAtMs: null,
        lastIncrementAtMs: null,
        longest: streakCurrent,
      },
    },
  };
}

describe("gathering reward claim", () => {
  test("collects an element reward and advances the gathering round", () => {
    const result = claimGatheringRewardForBoard({
      boardState: {
        ...ALCHEMIST_GUILD_BOARD_DEFAULT,
        gathering: {
          ...createGatheringRound(1),
          phase: "reward",
          rewardOptionCardIds: ["element:fe"],
        },
      },
      card: { id: "element:fe", kind: "element" },
      collectedAtMs: 123,
    });

    expect(result.claimed).toBe(true);
    if (!result.claimed) throw new Error("expected element reward claim");
    expect(result.newlyDiscoveredElementId).toBe("element:fe");
    expect(result.nextBoardState.discoveredElementIds).toContain("element:fe");
    expect(result.nextBoardState.elementQuantities["element:fe"]).toBe(1);
    expect(result.nextBoardState.gathering.phase).toBe("solving");
    expect(result.nextBoardState.gathering.round).toBe(2);
  });

  test("keeps board state unchanged when the selected reward is no longer claimable", () => {
    const result = claimGatheringRewardForBoard({
      boardState: ALCHEMIST_GUILD_BOARD_DEFAULT,
      card: { id: "element:fe", kind: "element" },
      collectedAtMs: 123,
    });

    expect(result.claimed).toBe(false);
    expect(result.nextBoardState).toBe(ALCHEMIST_GUILD_BOARD_DEFAULT);
  });

  test("does not consume an inventory reward without a destination slot", () => {
    const boardState = {
      ...ALCHEMIST_GUILD_BOARD_DEFAULT,
      gathering: {
        ...createGatheringRound(1),
        phase: "reward" as const,
        rewardOptionCardIds: ["raw:sand"],
      },
    };
    const result = claimGatheringRewardForBoard({
      boardState,
      card: { id: "raw:sand", kind: "inventory" },
      collectedAtMs: 123,
      cooldownId: "raw:sand:gather:123",
    });

    expect(result.claimed).toBe(false);
    expect(result.nextBoardState).toBe(boardState);
  });
});

describe("gathering reward claim — streak bonus", () => {
  test("at streak 0 the primary option grants exactly the baseline 1", () => {
    const result = claimGatheringRewardForBoard({
      boardState: rewardBoardStateWithStreak(0),
      card: { id: "element:h", kind: "element" },
      collectedAtMs: 1,
    });
    expect(result.claimed).toBe(true);
    if (!result.claimed) throw new Error("expected claim");
    expect(result.nextBoardState.elementQuantities["element:h"]).toBe(1);
  });

  test("grants baseline 1 + the option's streak bonus on the primary option", () => {
    for (const streak of [5, 10, 15, 30]) {
      const result = claimGatheringRewardForBoard({
        boardState: rewardBoardStateWithStreak(streak),
        card: { id: "element:h", kind: "element" },
        collectedAtMs: 1,
      });
      expect(result.claimed).toBe(true);
      if (!result.claimed) throw new Error("expected claim");
      expect(result.nextBoardState.elementQuantities["element:h"]).toBe(
        1 + streakBonusForOptionIndex(streak, 0),
      );
    }
  });

  test("the secondary option only earns its flat bonus once breadth unlocks it", () => {
    const atFive = claimGatheringRewardForBoard({
      boardState: rewardBoardStateWithStreak(5),
      card: { id: "element:he", kind: "element" },
      collectedAtMs: 1,
    });
    const atTen = claimGatheringRewardForBoard({
      boardState: rewardBoardStateWithStreak(10),
      card: { id: "element:he", kind: "element" },
      collectedAtMs: 1,
    });
    expect(atFive.claimed && atFive.nextBoardState.elementQuantities["element:he"]).toBe(
      1 + streakBonusForOptionIndex(5, 1),
    );
    expect(atTen.claimed && atTen.nextBoardState.elementQuantities["element:he"]).toBe(
      1 + streakBonusForOptionIndex(10, 1),
    );
  });

  test("the streak survives the round transition (only a wrong answer breaks it)", () => {
    const result = claimGatheringRewardForBoard({
      boardState: rewardBoardStateWithStreak(12),
      card: { id: "element:h", kind: "element" },
      collectedAtMs: 1,
    });
    expect(result.claimed).toBe(true);
    if (!result.claimed) throw new Error("expected claim");
    expect(result.nextBoardState.gathering.round).toBe(2);
    expect(result.nextBoardState.gathering.streak.current).toBe(12);
  });

  test("Hydrogen Spring doubles a gathered hydrogen, but not other elements", () => {
    const hydrogen = claimGatheringRewardForBoard({
      boardState: {
        ...rewardBoardStateWithStreak(0),
        unlockedUpgradeIds: [HYDROGEN_BOUNTY_UPGRADE_ID],
      },
      card: { id: "element:h", kind: "element" },
      collectedAtMs: 1,
    });
    expect(hydrogen.claimed).toBe(true);
    if (!hydrogen.claimed) throw new Error("expected claim");
    // Baseline 1 grant, doubled by the upgrade.
    expect(hydrogen.nextBoardState.elementQuantities["element:h"]).toBe(HYDROGEN_BOUNTY_MULTIPLIER);

    const helium = claimGatheringRewardForBoard({
      boardState: {
        ...rewardBoardStateWithStreak(0),
        unlockedUpgradeIds: [HYDROGEN_BOUNTY_UPGRADE_ID],
      },
      card: { id: "element:he", kind: "element" },
      collectedAtMs: 1,
    });
    expect(helium.claimed && helium.nextBoardState.elementQuantities["element:he"]).toBe(1);
  });

  test("without the upgrade, hydrogen grants the plain baseline", () => {
    const result = claimGatheringRewardForBoard({
      boardState: rewardBoardStateWithStreak(0),
      card: { id: "element:h", kind: "element" },
      collectedAtMs: 1,
    });
    expect(result.claimed && result.nextBoardState.elementQuantities["element:h"]).toBe(1);
  });

  test("Celestial streak (50+) with the upgrade also grants a random UNPICKED element", () => {
    const result = claimGatheringRewardForBoard({
      boardState: {
        ...rewardBoardStateWithStreak(50, ["element:h", "element:he", "element:li"]),
        unlockedUpgradeIds: [CELESTIAL_STREAK_UPGRADE_ID],
      },
      card: { id: "element:h", kind: "element" },
      collectedAtMs: 1,
    });
    expect(result.claimed).toBe(true);
    if (!result.claimed) throw new Error("expected claim");
    const bonusId = result.bonusElementId;
    if (!bonusId) throw new Error("expected a celestial bonus element");
    // The bonus is one of the two element options the player did NOT pick.
    expect(["element:he", "element:li"]).toContain(bonusId);
    expect(result.nextBoardState.elementQuantities[bonusId]).toBe(1);
    expect(result.nextBoardState.discoveredElementIds).toContain(bonusId);
  });

  test("no Celestial bonus without the upgrade, even at a 50 streak", () => {
    const result = claimGatheringRewardForBoard({
      boardState: rewardBoardStateWithStreak(50, ["element:h", "element:he", "element:li"]),
      card: { id: "element:h", kind: "element" },
      collectedAtMs: 1,
    });
    expect(result.claimed && result.bonusElementId).toBeNull();
  });

  test("each claim increments the lifetime gathering-session count", () => {
    const result = claimGatheringRewardForBoard({
      boardState: rewardBoardStateWithStreak(0),
      card: { id: "element:h", kind: "element" },
      collectedAtMs: 1,
    });
    expect(result.claimed && result.nextBoardState.gatheringSessionsCompleted).toBe(1);
  });

  test("no Celestial bonus below a 50 streak even with the upgrade", () => {
    const result = claimGatheringRewardForBoard({
      boardState: {
        ...rewardBoardStateWithStreak(49, ["element:h", "element:he", "element:li"]),
        unlockedUpgradeIds: [CELESTIAL_STREAK_UPGRADE_ID],
      },
      card: { id: "element:h", kind: "element" },
      collectedAtMs: 1,
    });
    expect(result.claimed && result.bonusElementId).toBeNull();
  });

  test("an inventory reward grants 1 + bonus ready copies into the slot", () => {
    const result = claimGatheringRewardForBoard({
      boardState: rewardBoardStateWithStreak(10, ["raw:sand", "element:he", "element:li"]),
      card: { id: "raw:sand", kind: "inventory" },
      collectedAtMs: 1,
      cooldownId: "cd-test",
      destinationSlotId: "inventory-slot-1",
    });
    expect(result.claimed).toBe(true);
    if (!result.claimed) throw new Error("expected claim");
    const slot = result.nextBoardState.inventorySlots["inventory-slot-1"];
    expect(slot?.cardId).toBe("raw:sand");
    expect(slot?.cooldowns.length).toBe(1 + streakBonusForOptionIndex(10, 0));
  });
});
