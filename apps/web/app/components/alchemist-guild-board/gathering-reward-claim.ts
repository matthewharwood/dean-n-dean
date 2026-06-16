import type {
  AlchemistGuildBoardState,
  AlchemistGuildCardId,
  AlchemistGuildElementQuantities,
  AlchemistGuildInventoryCooldown,
  AlchemistGuildInventorySlotId,
  AlchemistGuildInventorySlots,
} from "@dean-stack/schemas";

import { claimGatheringReward } from "./gathering-loop";
import { CELESTIAL_STREAK_TIER_AT, streakBonusForOptionIndex } from "./gathering-streak";
import {
  applyHydrogenBounty,
  CELESTIAL_STREAK_UPGRADE_ID,
  HYDROGEN_BOUNTY_UPGRADE_ID,
  hasUpgrade,
} from "./upgrades";

type GatheringRewardClaimCard = {
  id: AlchemistGuildCardId;
  kind: "element" | "inventory";
};

type GatheringRewardClaimInput = {
  boardState: AlchemistGuildBoardState;
  card: GatheringRewardClaimCard;
  collectedAtMs: number;
  cooldownId?: string | null;
  destinationSlotId?: AlchemistGuildInventorySlotId | null;
};

type GatheringRewardClaimResult =
  | {
      claimed: false;
      nextBoardState: AlchemistGuildBoardState;
    }
  | {
      claimed: true;
      // The random unpicked element granted by the Celestial double reward (or
      // null). The UI flies this element into the loot via the celestial shader.
      bonusElementId: string | null;
      cooldownId: string | null;
      newlyDiscoveredElementId: string | null;
      nextBoardState: AlchemistGuildBoardState;
    };

export function claimGatheringRewardForBoard({
  boardState,
  card,
  collectedAtMs,
  cooldownId = null,
  destinationSlotId = null,
}: GatheringRewardClaimInput): GatheringRewardClaimResult {
  const nextGathering = claimGatheringReward(boardState.gathering, card.id, collectedAtMs);
  if (nextGathering === boardState.gathering) {
    return { claimed: false, nextBoardState: boardState };
  }

  // The streak earns a bigger payout on the demand-ordered reward options: the
  // primary (most quest-demanded) option gets the steepest bonus, secondary and
  // tertiary a flat +1 once their breadth tier unlocks. Read the streak BEFORE
  // the claim (nextGathering has already advanced the round) so the grant matches
  // the +N badge the card showed. Total granted = baseline 1 + streak bonus.
  const optionIndex = boardState.gathering.rewardOptionCardIds.indexOf(card.id);
  const grantCount =
    1 +
    (optionIndex >= 0
      ? streakBonusForOptionIndex(boardState.gathering.streak.current, optionIndex)
      : 0);

  // Celestial Streak double reward: while on a 50+ streak with the upgrade, each
  // catch ALSO yields a random element the player did NOT pick — the bonus that
  // flies into the loot. Applies whether they pick an element or an inventory card.
  const bonusElementId = resolveCelestialBonusElementId(boardState, card.id);

  if (card.kind === "inventory") {
    if (!destinationSlotId || !cooldownId) {
      return { claimed: false, nextBoardState: boardState };
    }

    const bonus = withCelestialBonus(
      boardState.elementQuantities,
      boardState.discoveredElementIds,
      bonusElementId,
    );
    return {
      claimed: true,
      bonusElementId,
      cooldownId,
      newlyDiscoveredElementId: null,
      nextBoardState: {
        ...boardState,
        discoveredElementIds: bonus.discoveredElementIds,
        elementQuantities: bonus.elementQuantities,
        gatheringSessionsCompleted: boardState.gatheringSessionsCompleted + 1,
        gathering: {
          ...nextGathering,
          unlockSeen: true,
        },
        inventorySlots: addReadyInventoryCopy(
          boardState.inventorySlots,
          destinationSlotId,
          card.id,
          collectedAtMs,
          cooldownId,
          grantCount,
        ),
      },
    };
  }

  const newlyDiscoveredElementId = boardState.discoveredElementIds.includes(card.id)
    ? null
    : card.id;

  // Hydrogen Spring upgrade: a gathered hydrogen comes back doubled.
  const elementGrantCount = applyHydrogenBounty(
    grantCount,
    card.id,
    hasUpgrade(boardState.unlockedUpgradeIds, HYDROGEN_BOUNTY_UPGRADE_ID),
  );

  const bonus = withCelestialBonus(
    addElementQuantity(boardState.elementQuantities, card.id, elementGrantCount),
    appendUniqueId(boardState.discoveredElementIds, card.id),
    bonusElementId,
  );

  return {
    claimed: true,
    bonusElementId,
    cooldownId: null,
    newlyDiscoveredElementId,
    nextBoardState: {
      ...boardState,
      discoveredElementIds: bonus.discoveredElementIds,
      elementQuantities: bonus.elementQuantities,
      gatheringSessionsCompleted: boardState.gatheringSessionsCompleted + 1,
      gathering: {
        ...nextGathering,
        unlockSeen: true,
      },
    },
  };
}

/**
 * The random unpicked element granted by the Celestial double reward, or null when
 * it doesn't apply (streak below 50, the upgrade isn't unlocked, or there's no
 * unpicked element option). Math.random picks among the unpicked element options.
 */
function resolveCelestialBonusElementId(
  boardState: AlchemistGuildBoardState,
  pickedCardId: AlchemistGuildCardId,
): AlchemistGuildCardId | null {
  if (boardState.gathering.streak.current < CELESTIAL_STREAK_TIER_AT) return null;
  if (!hasUpgrade(boardState.unlockedUpgradeIds, CELESTIAL_STREAK_UPGRADE_ID)) return null;

  const unpicked = boardState.gathering.rewardOptionCardIds.filter(
    (id) => id !== pickedCardId && id.startsWith("element:"),
  );
  if (unpicked.length === 0) return null;
  return unpicked[Math.floor(Math.random() * unpicked.length)] ?? null;
}

/** Fold a Celestial bonus element (if any) into the running quantities + discovery set. */
function withCelestialBonus(
  quantities: AlchemistGuildElementQuantities,
  discovered: string[],
  bonusElementId: AlchemistGuildCardId | null,
): { discoveredElementIds: string[]; elementQuantities: AlchemistGuildElementQuantities } {
  if (!bonusElementId) {
    return { discoveredElementIds: discovered, elementQuantities: quantities };
  }
  return {
    discoveredElementIds: appendUniqueId(discovered, bonusElementId),
    elementQuantities: addElementQuantity(quantities, bonusElementId, 1),
  };
}

function addReadyInventoryCopy(
  inventory: AlchemistGuildInventorySlots,
  slotId: AlchemistGuildInventorySlotId,
  cardId: AlchemistGuildCardId,
  readyAtMs: number,
  cooldownId: string,
  count = 1,
): AlchemistGuildInventorySlots {
  const existingItem = inventory[slotId];
  // A streak bonus can grant more than one ready copy at once; the primary copy
  // keeps the caller's cooldownId (the one it tracks for "ready" toasts) and each
  // extra copy gets a deterministic suffixed id so they stay unique in the slot.
  const readyCopies: AlchemistGuildInventoryCooldown[] = Array.from(
    { length: Math.max(1, count) },
    (_, index) => ({
      id: index === 0 ? cooldownId : `${cooldownId}#${index + 1}`,
      readyAtMs,
      startedAtMs: readyAtMs,
    }),
  );

  return {
    ...inventory,
    [slotId]: {
      cardId,
      cooldowns: [...(existingItem?.cooldowns ?? []), ...readyCopies],
    },
  };
}

function addElementQuantity(
  quantities: AlchemistGuildElementQuantities,
  cardId: AlchemistGuildCardId,
  amount: number,
): AlchemistGuildElementQuantities {
  return {
    ...quantities,
    [cardId]: Math.max(0, quantities[cardId] ?? 0) + amount,
  };
}

function appendUniqueId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids : [...ids, id];
}
