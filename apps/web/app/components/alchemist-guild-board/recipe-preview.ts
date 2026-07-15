import {
  ALCHEMY_GATHERABLE_CARDS,
  ALCHEMY_RECIPES,
  type AlchemyMachineryId,
  ELEMENT_CARDS,
  ELEMENT_SYMBOLS,
  EXTENDED_MOLECULE_RECIPES,
  getAlchemyRecipeArgumentSlots,
  getAlchemyRecipeKidInfoById,
  getAlchemyRecipeMachineryId,
  getExtendedMoleculeRecipeByFormulaKey,
  type StaticAlchemyRecipe,
  type StaticAlchemyRecipeKidInfo,
  type StaticExtendedMoleculeRecipe,
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

export type AlchemyWorkbenchExtendedRecipePreview = {
  formula: string;
  ingredientRows: readonly AlchemyWorkbenchRecipeIngredient[];
  recipe: StaticExtendedMoleculeRecipe;
  slotCardIds: readonly string[];
};

type ElementCounts = Map<string, number>;

const cardLabelsById = new Map<string, string>();
const elementSymbolsById = new Map<string, string>();
const elementOrderBySymbol: ReadonlyMap<string, number> = new Map(
  ELEMENT_SYMBOLS.map((symbol, index) => [symbol, index]),
);
const recipeByOutputCardId: ReadonlyMap<string, StaticAlchemyRecipe> = new Map(
  ALCHEMY_RECIPES.map((recipe) => [recipe.output.cardId, recipe]),
);
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

for (const recipe of EXTENDED_MOLECULE_RECIPES) {
  cardLabelsById.set(recipe.output.cardId, recipe.output.name);
}

export function getAlchemyWorkbenchRecipePreview(
  workbenchCardIds: readonly (string | null)[],
  machineryId: AlchemyMachineryId | null = null,
): AlchemyWorkbenchRecipePreview | null {
  for (const recipe of ALCHEMY_RECIPES) {
    if (!doesWorkbenchMatchRecipe(workbenchCardIds, recipe, machineryId)) continue;

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

export function getAlchemyWorkbenchExtendedRecipePreview(
  workbenchCardIds: readonly (string | null)[],
): AlchemyWorkbenchExtendedRecipePreview | null {
  const slotCardIds = workbenchCardIds.filter((cardId) => cardId !== null);
  if (slotCardIds.length === 0) return null;

  const formulaKey = getElementFormulaKeyForCardIds(slotCardIds);
  if (!formulaKey) return null;

  const recipe = getExtendedMoleculeRecipeByFormulaKey(formulaKey);
  if (!recipe) return null;

  return {
    formula: formatExtendedMoleculeFormula(recipe),
    ingredientRows: recipe.ingredients.map((ingredient) => ({
      cardId: ingredient.cardId,
      label: formatAlchemyCardLabel(ingredient.cardId),
      quantity: ingredient.quantity,
      role: "Element",
    })),
    recipe,
    slotCardIds,
  };
}

export function doesWorkbenchMatchRecipe(
  workbenchCardIds: readonly (string | null)[],
  recipe: StaticAlchemyRecipe,
  machineryId: AlchemyMachineryId | null = null,
): boolean {
  const recipeCardIds = getAlchemyRecipeSlotCardIds(recipe);
  const actualCardIds = workbenchCardIds.filter((cardId) => cardId !== null);

  if (actualCardIds.length !== recipeCardIds.length) return false;
  if (machineryId !== null && getAlchemyRecipeMachineryId(recipe) !== machineryId) return false;

  return haveSameCardIdCounts(actualCardIds, recipeCardIds);
}

export function getAlchemyWorkbenchMachineryOptions(
  workbenchCardIds: readonly (string | null)[],
): AlchemyMachineryId[] {
  const machineryIds: AlchemyMachineryId[] = [];
  for (const recipe of ALCHEMY_RECIPES) {
    if (!doesWorkbenchMatchRecipe(workbenchCardIds, recipe)) continue;

    const machineryId = getAlchemyRecipeMachineryId(recipe);
    if (!machineryIds.includes(machineryId)) machineryIds.push(machineryId);
  }
  return machineryIds;
}

export function resolveAlchemyWorkbenchMachinery(
  machineryIds: readonly AlchemyMachineryId[],
  selectedMachineryId: AlchemyMachineryId | null,
): AlchemyMachineryId | null {
  if (machineryIds.length === 1) return machineryIds[0] ?? null;
  if (selectedMachineryId && machineryIds.includes(selectedMachineryId)) {
    return selectedMachineryId;
  }
  return null;
}

export function getNextAlchemyWorkbenchMachinery(
  machineryIds: readonly AlchemyMachineryId[],
  currentMachineryId: AlchemyMachineryId | null,
): AlchemyMachineryId | null {
  if (machineryIds.length === 0) return null;

  const currentIndex = currentMachineryId ? machineryIds.indexOf(currentMachineryId) : -1;
  const nextIndex = (currentIndex + 1) % machineryIds.length;
  return machineryIds[nextIndex] ?? null;
}

export function getAlchemyRecipeSlotCardIds(recipe: StaticAlchemyRecipe): string[] {
  return getAlchemyRecipeArgumentSlots(recipe).map((slot) => slot.cardId);
}

export function formatAlchemyRecipeFormula(recipe: StaticAlchemyRecipe): string {
  return recipe.arguments.map(formatAlchemyRecipeArgumentFormula).join(" + ");
}

export function getAlchemyRecipeElementFormulaKey(recipe: StaticAlchemyRecipe): string | null {
  let counts = createEmptyElementCounts();

  for (const argument of recipe.arguments) {
    const argumentCounts = getCardElementCounts(argument.cardId);
    if (!argumentCounts) return null;
    counts = addElementCounts(counts, argumentCounts, argument.quantity);
  }

  return formatElementFormulaKey(counts);
}

function getElementFormulaKeyForCardIds(cardIds: readonly string[]): string | null {
  let counts = createEmptyElementCounts();

  for (const cardId of cardIds) {
    const elementSymbol = elementSymbolsById.get(cardId);
    if (!elementSymbol) return null;
    counts = addElementCounts(counts, new Map([[elementSymbol, 1]]));
  }

  return formatElementFormulaKey(counts);
}

function getCardElementCounts(
  cardId: string,
  seenCardIds = new Set<string>(),
): ElementCounts | null {
  const elementSymbol = elementSymbolsById.get(cardId);
  if (elementSymbol) return new Map([[elementSymbol, 1]]);

  const recipe = recipeByOutputCardId.get(cardId);
  if (!recipe || seenCardIds.has(cardId)) return null;

  seenCardIds.add(cardId);
  let counts = createEmptyElementCounts();
  for (const argument of recipe.arguments) {
    const argumentCounts = getCardElementCounts(argument.cardId, seenCardIds);
    if (!argumentCounts) return null;
    counts = addElementCounts(counts, argumentCounts, argument.quantity);
  }
  seenCardIds.delete(cardId);

  return counts;
}

function createEmptyElementCounts(): ElementCounts {
  return new Map();
}

function addElementCounts(
  left: ElementCounts,
  right: ReadonlyMap<string, number>,
  multiplier = 1,
): ElementCounts {
  const next = new Map(left);
  for (const [symbol, quantity] of right) {
    next.set(symbol, (next.get(symbol) ?? 0) + quantity * multiplier);
  }

  return next;
}

function haveSameCardIdCounts(left: readonly string[], right: readonly string[]): boolean {
  const counts = new Map<string, number>();
  for (const cardId of left) {
    counts.set(cardId, (counts.get(cardId) ?? 0) + 1);
  }

  for (const cardId of right) {
    const nextCount = (counts.get(cardId) ?? 0) - 1;
    if (nextCount < 0) return false;
    if (nextCount === 0) counts.delete(cardId);
    else counts.set(cardId, nextCount);
  }

  return counts.size === 0;
}

function formatElementFormulaKey(counts: ReadonlyMap<string, number>): string {
  return [...counts]
    .toSorted(([left], [right]) => getElementOrder(left) - getElementOrder(right))
    .map(([symbol, quantity]) => `${symbol}:${quantity}`)
    .join("|");
}

function getElementOrder(symbol: string): number {
  return elementOrderBySymbol.get(symbol) ?? Number.MAX_SAFE_INTEGER;
}

function formatExtendedMoleculeFormula(recipe: StaticExtendedMoleculeRecipe): string {
  return recipe.ingredients.map(formatExtendedMoleculeIngredientFormula).join(" + ");
}

function formatExtendedMoleculeIngredientFormula(
  ingredient: StaticExtendedMoleculeRecipe["ingredients"][number],
): string {
  const label = ingredient.elementSymbol;
  return ingredient.quantity === 1 ? label : `${ingredient.quantity}${label}`;
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
