import {
  type AlchemistGuildQuestDelivery,
  getAlchemyRecipeById,
  type StaticAlchemyQuest,
} from "@dean-stack/schemas";

// Every quest owns one recipe and asks the player to present exactly that recipe's
// output. Only outputs reused later in the same continuation remain in Inventory;
// delivery state records that the requester inspected the output.

export type QuestDeliverable = { cardId: string; required: number };

export function getQuestDeliverables(quest: StaticAlchemyQuest): QuestDeliverable[] {
  const recipe = getAlchemyRecipeById(quest.recipeId);
  return recipe ? [{ cardId: recipe.output.cardId, required: 1 }] : [];
}

export function getQuestDeliveredCount(
  delivery: AlchemistGuildQuestDelivery | undefined,
  cardId: string,
): number {
  return delivery?.[cardId] ?? 0;
}

export function isQuestDeliverableComplete(
  delivery: AlchemistGuildQuestDelivery | undefined,
  deliverable: QuestDeliverable,
): boolean {
  return getQuestDeliveredCount(delivery, deliverable.cardId) >= deliverable.required;
}

export function isQuestDeliveryComplete(
  quest: StaticAlchemyQuest,
  delivery: AlchemistGuildQuestDelivery | undefined,
): boolean {
  return getQuestDeliverables(quest).every((deliverable) =>
    isQuestDeliverableComplete(delivery, deliverable),
  );
}

// Deliver one of `cardId` to the quest (capped at the deliverable's required count).
// Returns the same reference when nothing changes so callers can skip a write.
export function deliverCardToQuest(
  quest: StaticAlchemyQuest,
  delivery: AlchemistGuildQuestDelivery | undefined,
  cardId: string,
): AlchemistGuildQuestDelivery {
  const deliverable = getQuestDeliverables(quest).find((entry) => entry.cardId === cardId);
  const current = delivery ?? {};
  if (!deliverable) return current;
  const delivered = getQuestDeliveredCount(current, cardId);
  if (delivered >= deliverable.required) return current;
  return { ...current, [cardId]: delivered + 1 };
}

// True if `cardId` is a deliverable for this quest that still needs more delivered.
export function canDeliverCardToQuest(
  quest: StaticAlchemyQuest,
  delivery: AlchemistGuildQuestDelivery | undefined,
  cardId: string,
): boolean {
  const deliverable = getQuestDeliverables(quest).find((entry) => entry.cardId === cardId);
  return deliverable !== undefined && !isQuestDeliverableComplete(delivery, deliverable);
}
