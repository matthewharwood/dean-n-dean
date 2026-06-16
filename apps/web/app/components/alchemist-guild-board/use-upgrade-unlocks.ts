import type { AlchemistGuildBoardState } from "@dean-stack/schemas";
import { useEffect, useRef } from "react";

import { notifyGameEvent } from "~/components/notification-toast/game-events";
import {
  CELESTIAL_STREAK_UPGRADE_ID,
  EXPEDITION_QUEUE_UPGRADE_ID,
  HYDROGEN_BOUNTY_UPGRADE_ID,
  isCelestialStreakUnlockEarned,
  isExpeditionQueueUnlockEarned,
  isHydrogenBountyUnlockEarned,
} from "./upgrades";

// Owns upgrade unlocking + the "upgrade unlocked" toast, so the (complexity-capped)
// board stays a thin orchestrator. Two effects:
//   1. Grant every count-gated upgrade whose threshold is met (4 emergent recipes →
//      Expedition Queue; first extended recipe → Hydrogen Spring). Event-gated
//      upgrades (Merchant's Eye, unlocked by the first sale) are added at their own
//      call sites.
//   2. Raise ONE toast whenever the unlocked set grows — for ANY upgrade — so no
//      call site has to fire the notification itself.
export function useUpgradeUnlocks(
  discoveredEmergentCount: number,
  discoveredExtendedCount: number,
  longestStreak: number,
  unlockedUpgradeIds: readonly string[],
  setBoardState: (
    updater: (previous: AlchemistGuildBoardState) => AlchemistGuildBoardState,
  ) => void,
): void {
  useEffect(() => {
    const earned: string[] = [];
    if (isExpeditionQueueUnlockEarned(discoveredEmergentCount)) {
      earned.push(EXPEDITION_QUEUE_UPGRADE_ID);
    }
    if (isHydrogenBountyUnlockEarned(discoveredExtendedCount)) {
      earned.push(HYDROGEN_BOUNTY_UPGRADE_ID);
    }
    if (isCelestialStreakUnlockEarned(longestStreak)) {
      earned.push(CELESTIAL_STREAK_UPGRADE_ID);
    }
    const missing = earned.filter((id) => !unlockedUpgradeIds.includes(id));
    if (missing.length === 0) return;

    setBoardState((previous) => {
      const stillMissing = missing.filter((id) => !previous.unlockedUpgradeIds.includes(id));
      return stillMissing.length === 0
        ? previous
        : { ...previous, unlockedUpgradeIds: [...previous.unlockedUpgradeIds, ...stillMissing] };
    });
  }, [
    discoveredEmergentCount,
    discoveredExtendedCount,
    longestStreak,
    unlockedUpgradeIds,
    setBoardState,
  ]);

  const previousUnlockCountRef = useRef(unlockedUpgradeIds.length);
  useEffect(() => {
    if (unlockedUpgradeIds.length > previousUnlockCountRef.current) {
      notifyGameEvent("upgrade-unlocked");
    }
    previousUnlockCountRef.current = unlockedUpgradeIds.length;
  }, [unlockedUpgradeIds.length]);
}
