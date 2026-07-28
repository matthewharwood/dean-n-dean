import {
  type AlchemistGuildBoardState,
  type AlchemistGuildCardId,
  AlchemistGuildCardIdSchema,
  ELEMENT_CARDS,
  getAlchemyRecipeById,
  getAlchemyRecipeByOutput,
  type StaticAlchemyQuest,
} from "@dean-stack/schemas";
import * as z from "zod";

import { ExpeditionQuestDropSourceSchema, getExpeditionQuestDropTargets } from "./gathering-loop";

const ElementExpeditionTargetSourceSchema = z.enum(["vault", "quest", "both"]);

const QuestHelpExpeditionTargetDefinitionSchema = z.object({
  cardId: AlchemistGuildCardIdSchema,
  group: z.literal("quest-help"),
  source: ExpeditionQuestDropSourceSchema,
});

const ElementExpeditionTargetDefinitionSchema = z.object({
  cardId: AlchemistGuildCardIdSchema,
  group: z.literal("elements"),
  source: ElementExpeditionTargetSourceSchema,
});

export const ExpeditionTargetDefinitionSchema = z.discriminatedUnion("group", [
  QuestHelpExpeditionTargetDefinitionSchema,
  ElementExpeditionTargetDefinitionSchema,
]);
export type ExpeditionTargetDefinition = z.infer<typeof ExpeditionTargetDefinitionSchema>;

const elementCardIds = new Set<string>(ELEMENT_CARDS.map((card) => card.id));

export function getExpeditionTargetDefinitions(
  boardState: AlchemistGuildBoardState,
  quest: StaticAlchemyQuest | null,
): ExpeditionTargetDefinition[] {
  const questHelpTargets = getExpeditionQuestDropTargets(boardState).map((target) => ({
    cardId: target.cardId,
    group: "quest-help" as const,
    source: target.source,
  }));
  const discoveredElementIds = new Set(boardState.discoveredElementIds);
  const questElementIds = quest ? getQuestRequiredElementIds(quest) : new Set<string>();
  const elementTargets = ELEMENT_CARDS.flatMap((elementCard) => {
    const inVault = discoveredElementIds.has(elementCard.id);
    const inQuest = questElementIds.has(elementCard.id);
    if (!inVault && !inQuest) return [];

    let source: "vault" | "quest" | "both" = "vault";
    if (inVault && inQuest) source = "both";
    if (!inVault && inQuest) source = "quest";

    return [
      {
        cardId: elementCard.id,
        group: "elements" as const,
        source,
      },
    ];
  });

  return z.array(ExpeditionTargetDefinitionSchema).parse([...questHelpTargets, ...elementTargets]);
}

export function isElementExpeditionTarget(cardId: string): boolean {
  return elementCardIds.has(cardId);
}

export function getDiscoveredElementIdsAfterExpeditionReward(
  discoveredElementIds: readonly AlchemistGuildCardId[],
  targetCardId: AlchemistGuildCardId,
): AlchemistGuildCardId[] {
  if (!isElementExpeditionTarget(targetCardId) || discoveredElementIds.includes(targetCardId)) {
    return [...discoveredElementIds];
  }
  return [...discoveredElementIds, targetCardId];
}

function getQuestRequiredElementIds(quest: StaticAlchemyQuest): Set<string> {
  const elementIds = new Set<string>();
  const recipe = getAlchemyRecipeById(quest.recipeId);
  if (recipe) collectRequiredElementIds(recipe.output.cardId, elementIds, new Set());
  return elementIds;
}

function collectRequiredElementIds(
  cardId: string,
  elementIds: Set<string>,
  stack: Set<string>,
): void {
  if (isElementExpeditionTarget(cardId)) {
    elementIds.add(cardId);
    return;
  }
  if (stack.has(cardId)) return;

  const recipe = getAlchemyRecipeByOutput(cardId);
  if (!recipe) return;

  stack.add(cardId);
  for (const argument of recipe.arguments) {
    collectRequiredElementIds(argument.cardId, elementIds, stack);
  }
  stack.delete(cardId);
}
