import {
  ALCHEMIST_GUILD_BOARD_MODE_TABS,
  ALCHEMIST_GUILD_FIRST_WATER_QUEST_ID,
  type AlchemistGuildBoardMode,
} from "@dean-stack/schemas";

export function isGatheringAvailable(completedQuestIds: readonly string[]): boolean {
  return completedQuestIds.includes(ALCHEMIST_GUILD_FIRST_WATER_QUEST_ID);
}

export function getVisibleBoardModeTabs({
  expeditionAvailable,
  gatheringAvailable,
}: {
  expeditionAvailable: boolean;
  gatheringAvailable: boolean;
}): AlchemistGuildBoardMode[] {
  return ALCHEMIST_GUILD_BOARD_MODE_TABS.filter((tab) => {
    if (tab === "gathering") return gatheringAvailable;
    if (tab === "expedition") return expeditionAvailable;
    return true;
  });
}

export function resolveVisibleBoardMode({
  activeBoardMode,
  expeditionAvailable,
  gatheringAvailable,
}: {
  activeBoardMode: AlchemistGuildBoardMode;
  expeditionAvailable: boolean;
  gatheringAvailable: boolean;
}): AlchemistGuildBoardMode {
  const visibleTabs = getVisibleBoardModeTabs({ expeditionAvailable, gatheringAvailable });
  return visibleTabs.includes(activeBoardMode) ? activeBoardMode : "crafting";
}

export function shouldShowGatheringNudge({
  activeBoardMode,
  dismissedKey,
  gatheringNudgeKey,
  gatheringUnlockSeen,
}: {
  activeBoardMode: AlchemistGuildBoardMode;
  dismissedKey: string | null;
  gatheringNudgeKey: string | null;
  gatheringUnlockSeen: boolean;
}): boolean {
  return (
    activeBoardMode === "crafting" &&
    !gatheringUnlockSeen &&
    gatheringNudgeKey !== null &&
    dismissedKey !== gatheringNudgeKey
  );
}
