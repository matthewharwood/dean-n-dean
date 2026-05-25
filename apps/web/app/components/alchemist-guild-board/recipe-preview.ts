import {
  ALCHEMY_GATHERABLE_CARDS,
  ALCHEMY_RECIPES,
  ELEMENT_CARDS,
  getAlchemyRecipeArgumentSlots,
  getAlchemyRecipeKidInfoById,
  type StaticAlchemyRecipe,
  type StaticAlchemyRecipeKidInfo,
} from "@dean-stack/schemas";

type AlchemyWorkbenchRecipeIngredient = {
  cardId: string;
  label: string;
  quantity: number;
  role: string;
};

export type AlchemyWorkbenchRecipePreview = {
  formula: string;
  ingredientRows: readonly AlchemyWorkbenchRecipeIngredient[];
  kidInfo: StaticAlchemyRecipeKidInfo | null;
  recipe: StaticAlchemyRecipe;
  slotCardIds: readonly string[];
};

const cardLabelsById = new Map<string, string>();
const elementSymbolsById = new Map<string, string>();
const TOKEN_PREFIX_PATTERN = /^[a-z-]+:/;

for (const card of ELEMENT_CARDS) {
  cardLabelsById.set(card.id, card.name);
  elementSymbolsById.set(card.id, card.symbol);
}

for (const card of ALCHEMY_GATHERABLE_CARDS) {
  cardLabelsById.set(card.cardId, card.name);
}

for (const recipe of ALCHEMY_RECIPES) {
  cardLabelsById.set(recipe.output.cardId, recipe.output.name);
}

export function getAlchemyWorkbenchRecipePreview(
  workbenchCardIds: readonly (string | null)[],
): AlchemyWorkbenchRecipePreview | null {
  for (const recipe of ALCHEMY_RECIPES) {
    if (!doesWorkbenchMatchRecipe(workbenchCardIds, recipe)) continue;

    return {
      formula: formatAlchemyRecipeFormula(recipe),
      ingredientRows: recipe.arguments.map((argument) => ({
        cardId: argument.cardId,
        label: formatAlchemyCardLabel(argument.cardId),
        quantity: argument.quantity,
        role: formatTokenLabel(argument.role),
      })),
      kidInfo: getAlchemyRecipeKidInfoById(recipe.id) ?? null,
      recipe,
      slotCardIds: getAlchemyRecipeSlotCardIds(recipe),
    };
  }

  return null;
}

export function doesWorkbenchMatchRecipe(
  workbenchCardIds: readonly (string | null)[],
  recipe: StaticAlchemyRecipe,
): boolean {
  const recipeCardIds = getAlchemyRecipeSlotCardIds(recipe);

  if (workbenchCardIds.length < recipeCardIds.length) return false;

  return workbenchCardIds.every((cardId, index) => {
    const expectedCardId = recipeCardIds[index] ?? null;
    return cardId === expectedCardId;
  });
}

export function getAlchemyRecipeSlotCardIds(recipe: StaticAlchemyRecipe): string[] {
  return getAlchemyRecipeArgumentSlots(recipe).map((slot) => slot.cardId);
}

export function formatAlchemyRecipeFormula(recipe: StaticAlchemyRecipe): string {
  return recipe.arguments.map(formatAlchemyRecipeArgumentFormula).join(" + ");
}

function formatAlchemyRecipeArgumentFormula(
  argument: StaticAlchemyRecipe["arguments"][number],
): string {
  const elementSymbol = elementSymbolsById.get(argument.cardId);
  const label = elementSymbol ?? formatAlchemyCardLabel(argument.cardId);
  if (argument.quantity === 1) return label;

  return elementSymbol ? `${argument.quantity}${elementSymbol}` : `${argument.quantity} ${label}`;
}

function formatAlchemyCardLabel(cardId: string): string {
  return cardLabelsById.get(cardId) ?? formatTokenLabel(cardId);
}

function formatTokenLabel(token: string): string {
  return token
    .replace(TOKEN_PREFIX_PATTERN, "")
    .split("-")
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}
