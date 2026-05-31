import {
  ALCHEMIST_GUILD_FIRST_WATER_QUEST_ID,
  ALCHEMIST_GUILD_STARTING_DISCOVERED_ELEMENT_IDS,
  ALCHEMIST_GUILD_STARTING_ELEMENT_QUANTITIES,
  type AlchemistGuildBoardState,
} from "@dean-stack/schemas";

export const ALCHEMIST_GUILD_INTRO_FOCUS_ELEMENT_ID = "element:h";
export const ALCHEMIST_GUILD_INTRO_FOCUS_SCALE = 2.85;
const STARTING_ELEMENT_QUANTITIES: Readonly<Record<string, number>> =
  ALCHEMIST_GUILD_STARTING_ELEMENT_QUANTITIES;

export type AlchemistGuildIntroPhase = "complete" | "zero" | "zooming";

export function isAlchemyIntroZeroState(boardState: AlchemistGuildBoardState): boolean {
  return (
    boardState.activeBoardMode === "crafting" &&
    boardState.selectedQuestId === ALCHEMIST_GUILD_FIRST_WATER_QUEST_ID &&
    boardState.completedQuestIds.length === 0 &&
    boardState.discoveredRecipeIds.length === 0 &&
    boardState.discoveredExtendedRecipeIds.length === 0 &&
    boardState.discoveredEmergentRecipes.length === 0 &&
    hasOnlyStartingDiscoveredElements(boardState.discoveredElementIds) &&
    hasOnlyStartingElementQuantities(boardState.elementQuantities) &&
    hasEmptySlots(boardState.reagentSlots) &&
    hasEmptySlots(boardState.inventorySlots) &&
    hasNoQuestDeliveries(boardState.questDeliveries) &&
    boardState.gathering.gatherLog.length === 0 &&
    boardState.expedition.targetCardId === null
  );
}

function hasOnlyStartingDiscoveredElements(discoveredElementIds: readonly string[]): boolean {
  if (discoveredElementIds.length !== ALCHEMIST_GUILD_STARTING_DISCOVERED_ELEMENT_IDS.length) {
    return false;
  }

  return ALCHEMIST_GUILD_STARTING_DISCOVERED_ELEMENT_IDS.every((cardId) =>
    discoveredElementIds.includes(cardId),
  );
}

function hasOnlyStartingElementQuantities(quantities: Readonly<Record<string, number>>): boolean {
  for (const [cardId, quantity] of Object.entries(quantities)) {
    if (quantity <= 0) continue;
    if (STARTING_ELEMENT_QUANTITIES[cardId] !== quantity) return false;
  }

  return Object.entries(STARTING_ELEMENT_QUANTITIES).every(
    ([cardId, quantity]) => quantities[cardId] === quantity,
  );
}

function hasEmptySlots(slots: Readonly<Record<string, unknown>>): boolean {
  return Object.values(slots).every((slot) => slot === null);
}

function hasNoQuestDeliveries(
  questDeliveries: AlchemistGuildBoardState["questDeliveries"],
): boolean {
  return Object.values(questDeliveries).every((delivery) => delivery.delivered === 0);
}
