import {
  type AlchemistGuildEmergentRecipe,
  type AlchemistGuildEmergentRecipeRarity,
  ELEMENT_CARDS,
} from "@dean-stack/schemas";

import {
  getAlchemyWorkbenchExtendedRecipePreview,
  getAlchemyWorkbenchRecipePreview,
} from "./recipe-preview";

export const EMERGENT_TRANSMUTATION_SUCCESS_RATE = 0.82;
export const EMERGENT_WORD_INDEX_WEIGHTS = [0.52, 0.24, 0.13, 0.06, 0.05] as const;

export type EmergentElementWords = readonly [string, string, string, string, string];

export type AlchemyWorkbenchEmergentPreview = {
  formula: string;
  ingredientRows: readonly AlchemyWorkbenchEmergentIngredient[];
  orderedIngredientCardIds: readonly string[];
};

export type AlchemyWorkbenchEmergentIngredient = {
  cardId: string;
  label: string;
  slotId: string;
  slotNumber: number;
  symbol: string;
};

export type EmergentTransmutationResult =
  | {
      kind: "failure";
      attemptedAtMs: number;
      orderedIngredientCardIds: readonly string[];
    }
  | {
      discovery: AlchemistGuildEmergentRecipe;
      kind: "success";
    };

const elementCardsById: ReadonlyMap<string, (typeof ELEMENT_CARDS)[number]> = new Map(
  ELEMENT_CARDS.map((card) => [card.id, card]),
);
const TOKEN_PREFIX_PATTERN = /^[a-z-]+:/;

export const EMERGENT_ELEMENT_WORDS: ReadonlyMap<string, EmergentElementWords> = new Map(
  ELEMENT_CARDS.map((card) => [card.id, createEmergentWordsForElement(card.symbol)]),
);

export function getAlchemyWorkbenchEmergentPreview(
  workbenchCardIds: readonly (string | null)[],
): AlchemyWorkbenchEmergentPreview | null {
  if (getAlchemyWorkbenchRecipePreview(workbenchCardIds)) return null;
  if (getAlchemyWorkbenchExtendedRecipePreview(workbenchCardIds)) return null;

  const orderedIngredientCardIds = workbenchCardIds.filter((cardId) => cardId !== null);
  if (orderedIngredientCardIds.length < 2) return null;

  const ingredientRows: AlchemyWorkbenchEmergentIngredient[] = [];
  for (const cardId of orderedIngredientCardIds) {
    const elementCard = elementCardsById.get(cardId);
    if (!elementCard || !EMERGENT_ELEMENT_WORDS.has(cardId)) return null;
    ingredientRows.push({
      cardId,
      label: elementCard.name,
      slotId: `emergent-slot-${ingredientRows.length + 1}`,
      slotNumber: ingredientRows.length + 1,
      symbol: elementCard.symbol,
    });
  }

  return {
    formula: ingredientRows.map((ingredient) => ingredient.symbol).join(" + "),
    ingredientRows,
    orderedIngredientCardIds,
  };
}

export function createEmergentTransmutationResult(
  preview: AlchemyWorkbenchEmergentPreview,
  attemptedAtMs: number,
  random = Math.random,
): EmergentTransmutationResult {
  if (random() > EMERGENT_TRANSMUTATION_SUCCESS_RATE) {
    return {
      attemptedAtMs,
      kind: "failure",
      orderedIngredientCardIds: preview.orderedIngredientCardIds,
    };
  }

  const syllableIndexes = preview.orderedIngredientCardIds.map(() => pickEmergentWordIndex(random));
  const syllables = preview.orderedIngredientCardIds.map((cardId, index) => {
    const words = EMERGENT_ELEMENT_WORDS.get(cardId);
    const syllableIndex = syllableIndexes[index];
    const syllable = syllableIndex === undefined ? undefined : words?.[syllableIndex];
    if (!syllable) throw new Error(`Missing emergent syllable for ${cardId}`);
    return syllable;
  });
  const discovery: AlchemistGuildEmergentRecipe = {
    count: 1,
    firstDiscoveredAtMs: attemptedAtMs,
    formula: syllables.join(" + "),
    id: createEmergentRecipeId(preview.orderedIngredientCardIds, syllableIndexes),
    ingredientCardIds: [...preview.orderedIngredientCardIds],
    lastDiscoveredAtMs: attemptedAtMs,
    name: formatEmergentRecipeName(syllables),
    rarity: getEmergentRecipeRarity(syllableIndexes),
    syllableIndexes,
    syllables,
  };

  return { discovery, kind: "success" };
}

export function recordEmergentDiscovery(
  discoveries: readonly AlchemistGuildEmergentRecipe[],
  discovery: AlchemistGuildEmergentRecipe,
): {
  discoveredEmergentRecipes: AlchemistGuildEmergentRecipe[];
  isNewDiscovery: boolean;
} {
  const existingIndex = discoveries.findIndex((candidate) => candidate.id === discovery.id);
  if (existingIndex < 0) {
    return {
      discoveredEmergentRecipes: [...discoveries, discovery],
      isNewDiscovery: true,
    };
  }

  return {
    discoveredEmergentRecipes: discoveries.map((candidate, index) =>
      index === existingIndex
        ? {
            ...candidate,
            count: candidate.count + 1,
            lastDiscoveredAtMs: discovery.lastDiscoveredAtMs,
          }
        : candidate,
    ),
    isNewDiscovery: false,
  };
}

export function getEmergentRecipeRarity(
  syllableIndexes: readonly number[],
): AlchemistGuildEmergentRecipeRarity {
  if (syllableIndexes.length === 5 && syllableIndexes.every((index) => index === 4)) {
    return "mythical";
  }

  const maximumScore = Math.max(1, syllableIndexes.length * 4);
  const score = syllableIndexes.reduce((total, index) => total + index, 0);
  const ratio = score / maximumScore;

  if (ratio >= 0.82) return "legendary";
  if (ratio >= 0.62) return "epic";
  if (ratio >= 0.42) return "rare";
  if (ratio >= 0.22) return "uncommon";
  return "common";
}

export function formatEmergentRecipeIngredients(recipe: AlchemistGuildEmergentRecipe): string {
  return recipe.ingredientCardIds.map(formatElementCardId).join(" + ");
}

function createEmergentWordsForElement(symbol: string): EmergentElementWords {
  const base = symbol.toLowerCase();
  return [`${base}a`, `${base}e`, `${base}i`, `${base}o`, `${base}u`];
}

function pickEmergentWordIndex(random: () => number): number {
  const roll = random();
  let cumulativeWeight = 0;

  for (const [index, weight] of EMERGENT_WORD_INDEX_WEIGHTS.entries()) {
    cumulativeWeight += weight;
    if (roll < cumulativeWeight) return index;
  }

  return EMERGENT_WORD_INDEX_WEIGHTS.length - 1;
}

function createEmergentRecipeId(
  orderedIngredientCardIds: readonly string[],
  syllableIndexes: readonly number[],
): string {
  const ingredientSlug = orderedIngredientCardIds
    .map((cardId) => cardId.replace(TOKEN_PREFIX_PATTERN, ""))
    .join("-");
  const indexSlug = syllableIndexes.join("-");
  return `emergent:${ingredientSlug}-${indexSlug}`;
}

function formatEmergentRecipeName(syllables: readonly string[]): string {
  return syllables
    .map((syllable) => `${syllable[0]?.toUpperCase() ?? ""}${syllable.slice(1)}`)
    .join("");
}

function formatElementCardId(cardId: string): string {
  const elementCard = elementCardsById.get(cardId);
  return elementCard?.symbol ?? cardId.replace(TOKEN_PREFIX_PATTERN, "");
}
