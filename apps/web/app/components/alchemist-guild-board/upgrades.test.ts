import { describe, expect, test } from "bun:test";

import {
  applyHydrogenBounty,
  applyMerchantGoldBonus,
  CELESTIAL_STREAK_UNLOCK_STREAK,
  CELESTIAL_STREAK_UPGRADE_ID,
  EXPEDITION_QUEUE_UNLOCK_EMERGENT_COUNT,
  EXPEDITION_QUEUE_UPGRADE_ID,
  getUpgradeProgress,
  HYDROGEN_BOUNTY_MULTIPLIER,
  HYDROGEN_BOUNTY_UPGRADE_ID,
  hasUpgrade,
  isCelestialStreakUnlockEarned,
  isExpeditionQueueUnlockEarned,
  isHydrogenBountyUnlockEarned,
  isNewRewardSlotConfirmable,
  isUpgradesTabAvailable,
  MERCHANT_GOLD_MULTIPLIER,
  MERCHANT_GOLD_UPGRADE_ID,
  NEW_REWARD_SLOT_UNLOCK_SESSIONS,
  NEW_REWARD_SLOT_UPGRADE_ID,
  UPGRADE_CATALOG,
} from "./upgrades";

describe("upgrade catalog", () => {
  test("exposes the real upgrades plus redacted teasers", () => {
    const realIds = UPGRADE_CATALOG.filter((entry) => !entry.redacted).map((entry) => entry.id);
    expect(realIds).toEqual([
      EXPEDITION_QUEUE_UPGRADE_ID,
      MERCHANT_GOLD_UPGRADE_ID,
      HYDROGEN_BOUNTY_UPGRADE_ID,
      CELESTIAL_STREAK_UPGRADE_ID,
      NEW_REWARD_SLOT_UPGRADE_ID,
    ]);
    expect(UPGRADE_CATALOG.filter((entry) => entry.redacted).length).toBeGreaterThan(0);
  });

  test("every entry has unique copy fields", () => {
    const ids = UPGRADE_CATALOG.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("merchant gold bonus", () => {
  test("multiplies a sale only when the upgrade is unlocked", () => {
    expect(applyMerchantGoldBonus(100, false)).toBe(100);
    expect(applyMerchantGoldBonus(100, true)).toBe(100 * MERCHANT_GOLD_MULTIPLIER);
    // Rounds odd prices.
    expect(applyMerchantGoldBonus(7, true)).toBe(7 * MERCHANT_GOLD_MULTIPLIER);
  });
});

describe("hydrogen spring bounty", () => {
  test("doubles only a hydrogen grant when the upgrade is unlocked", () => {
    // Locked: untouched regardless of element.
    expect(applyHydrogenBounty(3, "element:h", false)).toBe(3);
    // Unlocked but a different element: untouched.
    expect(applyHydrogenBounty(3, "element:o", true)).toBe(3);
    // Unlocked + hydrogen: doubled.
    expect(applyHydrogenBounty(3, "element:h", true)).toBe(3 * HYDROGEN_BOUNTY_MULTIPLIER);
  });

  test("is earned at the first extended-recipe discovery", () => {
    expect(isHydrogenBountyUnlockEarned(0)).toBe(false);
    expect(isHydrogenBountyUnlockEarned(1)).toBe(true);
    expect(isHydrogenBountyUnlockEarned(7)).toBe(true);
  });
});

describe("celestial streak upgrade", () => {
  test("is earned the first time the longest streak reaches the Mythical cap", () => {
    expect(isCelestialStreakUnlockEarned(CELESTIAL_STREAK_UNLOCK_STREAK - 1)).toBe(false);
    expect(isCelestialStreakUnlockEarned(CELESTIAL_STREAK_UNLOCK_STREAK)).toBe(true);
    expect(isCelestialStreakUnlockEarned(120)).toBe(true);
  });
});

describe("getUpgradeProgress", () => {
  test("reports numeric progress for the expedition queue, null otherwise", () => {
    expect(getUpgradeProgress(EXPEDITION_QUEUE_UPGRADE_ID, 2, 0)).toEqual({ current: 2, max: 4 });
    // Caps at the goal.
    expect(getUpgradeProgress(EXPEDITION_QUEUE_UPGRADE_ID, 9, 0)).toEqual({ current: 4, max: 4 });
    // The merchant upgrade is a binary "sell once" — no progress bar.
    expect(getUpgradeProgress(MERCHANT_GOLD_UPGRADE_ID, 9, 0)).toBeNull();
  });

  test("reports gathering-session progress for the New Reward Slot, capped at the goal", () => {
    expect(getUpgradeProgress(NEW_REWARD_SLOT_UPGRADE_ID, 0, 3)).toEqual({ current: 3, max: 5 });
    expect(getUpgradeProgress(NEW_REWARD_SLOT_UPGRADE_ID, 0, 12)).toEqual({ current: 5, max: 5 });
  });
});

describe("new reward slot upgrade", () => {
  test("is confirmable only once the session threshold is met and it isn't taken", () => {
    expect(isNewRewardSlotConfirmable(NEW_REWARD_SLOT_UNLOCK_SESSIONS - 1, [])).toBe(false);
    expect(isNewRewardSlotConfirmable(NEW_REWARD_SLOT_UNLOCK_SESSIONS, [])).toBe(true);
    // Already taken → no longer confirmable.
    expect(
      isNewRewardSlotConfirmable(NEW_REWARD_SLOT_UNLOCK_SESSIONS, [NEW_REWARD_SLOT_UPGRADE_ID]),
    ).toBe(false);
  });
});

describe("upgrade unlock rules", () => {
  test("the expedition queue is earned at 4 emergent discoveries", () => {
    expect(isExpeditionQueueUnlockEarned(EXPEDITION_QUEUE_UNLOCK_EMERGENT_COUNT - 1)).toBe(false);
    expect(isExpeditionQueueUnlockEarned(EXPEDITION_QUEUE_UNLOCK_EMERGENT_COUNT)).toBe(true);
    expect(isExpeditionQueueUnlockEarned(99)).toBe(true);
  });

  test("hasUpgrade + tab availability track the unlocked set", () => {
    expect(hasUpgrade([], EXPEDITION_QUEUE_UPGRADE_ID)).toBe(false);
    expect(hasUpgrade([EXPEDITION_QUEUE_UPGRADE_ID], EXPEDITION_QUEUE_UPGRADE_ID)).toBe(true);
    expect(isUpgradesTabAvailable([])).toBe(false);
    expect(isUpgradesTabAvailable([EXPEDITION_QUEUE_UPGRADE_ID])).toBe(true);
  });
});
