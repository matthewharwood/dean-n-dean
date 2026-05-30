import {
  type AlchemistGuildBoardState,
  type AlchemistGuildInventoryCooldown,
  getAlchemyRecipeById,
  getAlchemyRecipeByOutput,
  type StaticAlchemyQuest,
  type StaticAlchemyRecipe,
} from "@dean-stack/schemas";

export type QuestAssemblyIngredientStatus = "stored" | "cooling" | "ready-to-make" | "missing";

export type QuestAssemblyIngredient = {
  cardId: string;
  label: string;
  readyCount: number;
  recipeId: string;
  requiredCount: number;
  status: QuestAssemblyIngredientStatus;
  totalCount: number;
};

export type QuestAssemblyGuide = {
  instruction: string;
  ingredients: QuestAssemblyIngredient[];
  preparedCount: number;
  readyToAssemble: boolean;
  requiredCount: number;
  terminalOutputCardId: string;
  terminalRecipeId: string;
  terminalRecipeName: string;
};

export function createQuestAssemblyGuide(
  boardState: AlchemistGuildBoardState,
  quest: StaticAlchemyQuest,
  nowMs: number,
): QuestAssemblyGuide | null {
  const terminalRecipe = getQuestTerminalRecipe(quest);
  if (!terminalRecipe) return null;

  const ingredientInputs = terminalRecipe.arguments.flatMap((argument) => {
    const recipe = getAlchemyRecipeByOutput(argument.cardId);
    return recipe
      ? [
          {
            cardId: argument.cardId,
            recipe,
            requiredCount: argument.quantity,
          },
        ]
      : [];
  });
  if (ingredientInputs.length === 0) return null;

  const ingredients = ingredientInputs.map((ingredient) => {
    const heldCounts = getHeldCardCounts(boardState, ingredient.cardId, nowMs);
    return {
      cardId: ingredient.cardId,
      label: ingredient.recipe.output.name,
      readyCount: heldCounts.ready,
      recipeId: ingredient.recipe.id,
      requiredCount: ingredient.requiredCount,
      status: getIngredientStatus(boardState, ingredient.recipe, ingredient.requiredCount, nowMs),
      totalCount: heldCounts.total,
    };
  });
  const preparedCount = ingredients.filter(
    (ingredient) => ingredient.readyCount >= ingredient.requiredCount,
  ).length;
  const readyToAssemble = preparedCount >= ingredients.length;

  return {
    instruction: getQuestAssemblyInstruction(terminalRecipe, ingredients, readyToAssemble),
    ingredients,
    preparedCount,
    readyToAssemble,
    requiredCount: ingredients.length,
    terminalOutputCardId: terminalRecipe.output.cardId,
    terminalRecipeId: terminalRecipe.id,
    terminalRecipeName: terminalRecipe.name,
  };
}

function getQuestTerminalRecipe(quest: StaticAlchemyQuest): StaticAlchemyRecipe | null {
  const recipes = quest.recipeIds.flatMap((recipeId) => {
    const recipe = getAlchemyRecipeById(recipeId);
    return recipe ? [recipe] : [];
  });
  if (recipes.length === 0) return null;

  const consumedCardIds = new Set<string>(
    recipes.flatMap((recipe) => recipe.arguments.map((argument) => argument.cardId)),
  );
  const terminalRecipes = recipes.filter((recipe) => !consumedCardIds.has(recipe.output.cardId));

  const terminalRecipe = terminalRecipes[0];
  if (terminalRecipes.length === 1 && terminalRecipe) return terminalRecipe;

  return recipes[0] ?? null;
}

function getIngredientStatus(
  boardState: AlchemistGuildBoardState,
  recipe: StaticAlchemyRecipe,
  requiredCount: number,
  nowMs: number,
): QuestAssemblyIngredientStatus {
  const heldCounts = getHeldCardCounts(boardState, recipe.output.cardId, nowMs);
  if (heldCounts.ready >= requiredCount) return "stored";
  if (heldCounts.total >= requiredCount) return "cooling";
  if (canMakeRecipeFromHeldResources(boardState, recipe, nowMs)) return "ready-to-make";
  return "missing";
}

function canMakeRecipeFromHeldResources(
  boardState: AlchemistGuildBoardState,
  recipe: StaticAlchemyRecipe,
  nowMs: number,
): boolean {
  const resourceCounts = createHeldResourceCounts(boardState, nowMs);
  for (const argument of recipe.arguments) {
    if ((resourceCounts.get(argument.cardId) ?? 0) < argument.quantity) return false;
  }

  return true;
}

function createHeldResourceCounts(
  boardState: AlchemistGuildBoardState,
  nowMs: number,
): Map<string, number> {
  const counts = new Map<string, number>();

  for (const [cardId, quantity] of Object.entries(boardState.elementQuantities)) {
    incrementCount(counts, cardId, quantity);
  }

  for (const item of Object.values(boardState.inventorySlots)) {
    if (!item) continue;
    incrementCount(counts, item.cardId, getReadyCooldownCount(item.cooldowns, nowMs));
  }

  for (const cardId of Object.values(boardState.reagentSlots)) {
    if (!cardId) continue;
    incrementCount(counts, cardId, 1);
  }

  return counts;
}

function getHeldCardCounts(
  boardState: AlchemistGuildBoardState,
  cardId: string,
  nowMs: number,
): { ready: number; total: number } {
  let ready = 0;
  let total = 0;

  for (const item of Object.values(boardState.inventorySlots)) {
    if (item?.cardId !== cardId) continue;
    total += item.cooldowns.length;
    ready += getReadyCooldownCount(item.cooldowns, nowMs);
  }

  for (const slottedCardId of Object.values(boardState.reagentSlots)) {
    if (slottedCardId !== cardId) continue;
    ready += 1;
    total += 1;
  }

  return { ready, total };
}

function getReadyCooldownCount(
  cooldowns: readonly AlchemistGuildInventoryCooldown[],
  nowMs: number,
): number {
  let readyCount = 0;
  for (const cooldown of cooldowns) {
    if (cooldown.readyAtMs <= nowMs) readyCount += 1;
  }

  return readyCount;
}

function getQuestAssemblyInstruction(
  terminalRecipe: StaticAlchemyRecipe,
  ingredients: readonly QuestAssemblyIngredient[],
  readyToAssemble: boolean,
): string {
  if (readyToAssemble) {
    return `${terminalRecipe.name} is ready. Place ${formatIngredientNames(
      ingredients,
    )} on the Workbench.`;
  }

  const nextIngredient = ingredients.find((ingredient) => ingredient.status !== "stored");
  if (!nextIngredient) {
    return `Keep the prepared parts in Inventory, then combine them into ${terminalRecipe.name}.`;
  }

  if (nextIngredient.status === "ready-to-make") {
    return `Make ${nextIngredient.label}, keep it in Inventory, then prepare the next part.`;
  }

  return `Prepare ${nextIngredient.label}, keep it in Inventory, then combine the parts into ${terminalRecipe.name}.`;
}

function formatIngredientNames(ingredients: readonly QuestAssemblyIngredient[]): string {
  const names = ingredients.map((ingredient) => ingredient.label);
  if (names.length <= 1) return names[0] ?? "the prepared parts";
  const finalName = names.at(-1);
  return `${names.slice(0, -1).join(", ")} and ${finalName}`;
}

function incrementCount(counts: Map<string, number>, cardId: string, amount: number): void {
  if (amount <= 0) return;
  counts.set(cardId, (counts.get(cardId) ?? 0) + amount);
}

export function formatQuestAssemblyIngredientStatus(status: QuestAssemblyIngredientStatus): string {
  switch (status) {
    case "stored":
      return "Stored";
    case "cooling":
      return "Cooling";
    case "ready-to-make":
      return "Make next";
    case "missing":
      return "Needs pieces";
    default:
      return "Needs pieces";
  }
}
