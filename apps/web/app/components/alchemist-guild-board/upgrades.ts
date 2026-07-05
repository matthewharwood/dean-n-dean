// The upgrade shop catalog + unlock rules. Only ONE upgrade is real for now
// (Expedition Queue); the rest are deliberately redacted teasers so the tab reads
// as "more to come". LATER (intentional, not yet built): flesh each redacted entry
// out with a real id, unlock quest, and effect — they are static placeholders today.

import { CELESTIAL_STREAK_TIER_AT } from "./gathering-streak";

export const EXPEDITION_QUEUE_UPGRADE_ID = "expedition-queue";

/** Emergent-recipe discoveries needed to earn the Expedition Queue upgrade. */
export const EXPEDITION_QUEUE_UNLOCK_EMERGENT_COUNT = 4;

export const MERCHANT_GOLD_UPGRADE_ID = "merchant-gold";

/** Permanent gold multiplier on every sale once the Merchant upgrade is unlocked. */
export const MERCHANT_GOLD_MULTIPLIER = 2;

export const HYDROGEN_BOUNTY_UPGRADE_ID = "hydrogen-bounty";

/** Extended recipes needed to earn the Hydrogen Spring upgrade (your first one). */
export const HYDROGEN_BOUNTY_EXTENDED_GOAL = 1;
/** Multiplier on a gathered hydrogen reward once Hydrogen Spring is unlocked. */
export const HYDROGEN_BOUNTY_MULTIPLIER = 2;
const HYDROGEN_CARD_ID = "element:h";

export const CELESTIAL_STREAK_UPGRADE_ID = "celestial-streak";

/**
 * Longest streak that first earns the Celestial Streak upgrade — the current top
 * (Mythical) band. Reaching it the first time permanently unlocks the Celestial
 * tier at 50, where each catch drops a bonus element.
 */
export const CELESTIAL_STREAK_UNLOCK_STREAK = 30;

export const NEW_REWARD_SLOT_UPGRADE_ID = "new-reward-slot";
/** Finished gathering sessions needed before the New Reward Slot upgrade can be confirmed. */
export const NEW_REWARD_SLOT_UNLOCK_SESSIONS = 5;
/** Chance (0..1) the unlocked New Reward Slot adds a 4th reward option after a kill. */
export const NEW_REWARD_SLOT_FOURTH_CHANCE = 0.5;

export type UpgradeCatalogEntry = {
  id: string;
  title: string;
  description: string;
  /** Short copy describing how it's earned (its "quest"). */
  unlockHint: string;
  /** Redacted entries are static teasers, not yet unlockable. */
  redacted: boolean;
};

export const UPGRADE_CATALOG: readonly UpgradeCatalogEntry[] = [
  {
    description: "Line up to three expeditions to run back-to-back — no idle docks.",
    id: EXPEDITION_QUEUE_UPGRADE_ID,
    redacted: false,
    title: "Expedition Queue",
    unlockHint: "Discover 4 emergent recipes",
  },
  {
    description: `Every sale earns ${MERCHANT_GOLD_MULTIPLIER}× gold, forever.`,
    id: MERCHANT_GOLD_UPGRADE_ID,
    redacted: false,
    title: "Merchant's Eye",
    unlockHint: "Sell your first item",
  },
  {
    description: `Every hydrogen you gather comes back ${HYDROGEN_BOUNTY_MULTIPLIER}×, forever.`,
    id: HYDROGEN_BOUNTY_UPGRADE_ID,
    redacted: false,
    title: "Hydrogen Spring",
    unlockHint: "Discover your first extended recipe",
  },
  {
    description: `Unlocks the Celestial streak tier at ${CELESTIAL_STREAK_TIER_AT}. While Celestial, every catch also drops a bonus element you didn't pick.`,
    id: CELESTIAL_STREAK_UPGRADE_ID,
    redacted: false,
    title: "Celestial Streak",
    unlockHint: `Reach a Mythical streak (${CELESTIAL_STREAK_UNLOCK_STREAK} in a row)`,
  },
  {
    description: `Confirm to add a 4th reward option ${Math.round(NEW_REWARD_SLOT_FOURTH_CHANCE * 100)}% of the time you beat an enemy.`,
    id: NEW_REWARD_SLOT_UPGRADE_ID,
    redacted: false,
    title: "New Reward Slot",
    unlockHint: `Finish ${NEW_REWARD_SLOT_UNLOCK_SESSIONS} gathering sessions`,
  },
  // LATER: real upgrades go here. Kept redacted/static for now (by design).
  {
    description: "A future upgrade.",
    id: "redacted-1",
    redacted: true,
    title: "???",
    unlockHint: "Locked",
  },
  {
    description: "A future upgrade.",
    id: "redacted-2",
    redacted: true,
    title: "???",
    unlockHint: "Locked",
  },
  {
    description: "A future upgrade.",
    id: "redacted-3",
    redacted: true,
    title: "???",
    unlockHint: "Locked",
  },
];

/** Whether the Expedition Queue upgrade is earned at the given emergent count. */
export function isExpeditionQueueUnlockEarned(discoveredEmergentCount: number): boolean {
  return discoveredEmergentCount >= EXPEDITION_QUEUE_UNLOCK_EMERGENT_COUNT;
}

/** Whether the Hydrogen Spring upgrade is earned at the given extended-recipe count. */
export function isHydrogenBountyUnlockEarned(discoveredExtendedCount: number): boolean {
  return discoveredExtendedCount >= HYDROGEN_BOUNTY_EXTENDED_GOAL;
}

/** Whether the Celestial Streak upgrade is earned (player first hit a Mythical streak). */
export function isCelestialStreakUnlockEarned(longestStreak: number): boolean {
  return longestStreak >= CELESTIAL_STREAK_UNLOCK_STREAK;
}

/**
 * Whether the New Reward Slot upgrade can be CONFIRMED — the session threshold is
 * met and the player hasn't taken it yet. Unlike the others it never auto-unlocks;
 * the player opts in from the Upgrades tab.
 */
export function isNewRewardSlotConfirmable(
  gatheringSessionsCompleted: number,
  unlockedUpgradeIds: readonly string[],
): boolean {
  return (
    gatheringSessionsCompleted >= NEW_REWARD_SLOT_UNLOCK_SESSIONS &&
    !hasUpgrade(unlockedUpgradeIds, NEW_REWARD_SLOT_UPGRADE_ID)
  );
}

/**
 * Multiply a gathered element grant when it's hydrogen and the Hydrogen Spring
 * upgrade is unlocked; otherwise leave it untouched.
 */
export function applyHydrogenBounty(
  grantCount: number,
  cardId: string,
  hydrogenBountyUnlocked: boolean,
): number {
  return cardId === HYDROGEN_CARD_ID && hydrogenBountyUnlocked
    ? grantCount * HYDROGEN_BOUNTY_MULTIPLIER
    : grantCount;
}

/**
 * Gold earned from a sale. The Merchant's Eye upgrade multiplies it forever once
 * unlocked; the unlocking (first) sale itself stays at the base price.
 */
export function applyMerchantGoldBonus(price: number, merchantUnlocked: boolean): number {
  return merchantUnlocked ? Math.round(price * MERCHANT_GOLD_MULTIPLIER) : price;
}

/** Numeric unlock progress to show on a locked card, or null for binary unlocks. */
export function getUpgradeProgress(
  entryId: string,
  discoveredEmergentCount: number,
  gatheringSessionsCompleted: number,
): { current: number; max: number } | null {
  if (entryId === EXPEDITION_QUEUE_UPGRADE_ID) {
    return {
      current: Math.min(discoveredEmergentCount, EXPEDITION_QUEUE_UNLOCK_EMERGENT_COUNT),
      max: EXPEDITION_QUEUE_UNLOCK_EMERGENT_COUNT,
    };
  }
  if (entryId === NEW_REWARD_SLOT_UPGRADE_ID) {
    return {
      current: Math.min(gatheringSessionsCompleted, NEW_REWARD_SLOT_UNLOCK_SESSIONS),
      max: NEW_REWARD_SLOT_UNLOCK_SESSIONS,
    };
  }
  return null;
}

/** Whether an upgrade id is in the player's unlocked set. */
export function hasUpgrade(unlockedUpgradeIds: readonly string[], id: string): boolean {
  return unlockedUpgradeIds.includes(id);
}

/** Whether the Upgrades tab should be visible (any upgrade unlocked). */
export function isUpgradesTabAvailable(unlockedUpgradeIds: readonly string[]): boolean {
  return unlockedUpgradeIds.length > 0;
}
