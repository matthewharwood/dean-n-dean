import {
  type AlchemistGuildQuestDelivery,
  getAlchemyRecipeById,
  getAlchemyRecipeByOutput,
  type StaticAlchemyQuest,
  type StaticAlchemyRecipe,
} from "@dean-stack/schemas";

// The set of cards a quest asks you to deliver, in page order. Multi-part bundle
// quests (Kitchen Stores = Salt + Charcoal + Ash) deliver their COMPONENTS, one
// drop-zone page each; simple quests deliver the single output (Water); quests with
// several independent terminals deliver each (iron + copper ingots). The required
// counts + the list are derived here, never stored — the delivery state only holds
// the per-card delivered counts.

export type QuestDeliverable = { cardId: string; required: number };

const MIN_BUNDLE_COMPONENTS = 2;

function getQuestRecipes(quest: StaticAlchemyQuest): StaticAlchemyRecipe[] {
  return quest.recipeIds.flatMap((recipeId) => {
    const recipe = getAlchemyRecipeById(recipeId);
    return recipe ? [recipe] : [];
  });
}

// Terminal recipes = outputs not consumed by another of the quest's recipes.
function getQuestTerminalRecipes(quest: StaticAlchemyQuest): StaticAlchemyRecipe[] {
  const recipes = getQuestRecipes(quest);
  const consumed = new Set<string>(
    recipes.flatMap((recipe) => recipe.arguments.map((argument) => argument.cardId)),
  );
  const terminals = recipes.filter((recipe) => !consumed.has(recipe.output.cardId));
  return terminals.length > 0 ? terminals : recipes.slice(0, 1);
}

export function getQuestDeliverables(quest: StaticAlchemyQuest): QuestDeliverable[] {
  const terminals = getQuestTerminalRecipes(quest);
  const bundle = terminals.length === 1 ? terminals[0] : undefined;
  if (bundle) {
    // Components that are themselves craftable goods (not raw elements).
    const components = bundle.arguments.flatMap((argument) =>
      getAlchemyRecipeByOutput(argument.cardId)
        ? [{ cardId: argument.cardId, required: argument.quantity }]
        : [],
    );
    if (components.length >= MIN_BUNDLE_COMPONENTS) return components;
  }
  return terminals.map((recipe) => ({ cardId: recipe.output.cardId, required: 1 }));
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
