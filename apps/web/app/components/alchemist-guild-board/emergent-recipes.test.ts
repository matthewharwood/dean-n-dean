import { describe, expect, test } from "bun:test";

import { ELEMENT_CARDS } from "@dean-stack/schemas";

import {
  createEmergentTransmutationResult,
  EMERGENT_ELEMENT_WORDS,
  getAlchemyWorkbenchEmergentPreview,
  getEmergentRecipeRarity,
  recordEmergentDiscovery,
} from "./emergent-recipes";

describe("emergent recipes", () => {
  test("assigns every element five unique two-to-five-letter words", () => {
    const allWords = [...EMERGENT_ELEMENT_WORDS.values()].flat();

    expect(EMERGENT_ELEMENT_WORDS.size).toBe(ELEMENT_CARDS.length);
    expect(new Set(allWords).size).toBe(allWords.length);

    for (const card of ELEMENT_CARDS) {
      const words = EMERGENT_ELEMENT_WORDS.get(card.id);

      expect(words).toHaveLength(5);
      for (const word of words ?? []) {
        expect(word).toMatch(/^[a-z]{2,5}$/);
      }
    }
  });

  test("previews emergent recipes only after regular and extended recipes miss", () => {
    expect(
      getAlchemyWorkbenchEmergentPreview(["element:h", "element:h", "element:o", null, null]),
    ).toBeNull();
    expect(getAlchemyWorkbenchEmergentPreview(["element:h", "element:h", null, null, null])).toBe(
      null,
    );
    expect(
      getAlchemyWorkbenchEmergentPreview(["element:h", "element:ne", null, null, null])?.formula,
    ).toBe("H + Ne");
    expect(getAlchemyWorkbenchEmergentPreview(["element:h", null, null, null, null])).toBeNull();
    expect(
      getAlchemyWorkbenchEmergentPreview(["material:water", "element:ne", null, null, null]),
    ).toBeNull();
  });

  test("keeps element order in the generated identity", () => {
    const left = getAlchemyWorkbenchEmergentPreview(["element:h", "element:ne", null, null, null]);
    const right = getAlchemyWorkbenchEmergentPreview(["element:ne", "element:h", null, null, null]);
    if (!left || !right) throw new Error("expected emergent previews");

    const leftResult = createEmergentTransmutationResult(
      left,
      123,
      createRandomSequence([0.1, 0.01, 0.99]),
    );
    const rightResult = createEmergentTransmutationResult(
      right,
      123,
      createRandomSequence([0.1, 0.01, 0.99]),
    );

    expect(leftResult.kind).toBe("success");
    expect(rightResult.kind).toBe("success");
    if (leftResult.kind !== "success" || rightResult.kind !== "success") return;

    expect(leftResult.discovery.ingredientCardIds).toEqual(["element:h", "element:ne"]);
    expect(rightResult.discovery.ingredientCardIds).toEqual(["element:ne", "element:h"]);
    expect(leftResult.discovery.id).not.toBe(rightResult.discovery.id);
  });

  test("uses the fifth word as the low-probability jackpot slot", () => {
    const preview = getAlchemyWorkbenchEmergentPreview([
      "element:h",
      "element:ne",
      "element:li",
      "element:be",
      "element:b",
    ]);
    if (!preview) throw new Error("expected emergent preview");

    const result = createEmergentTransmutationResult(
      preview,
      456,
      createRandomSequence([0.1, 0.99, 0.99, 0.99, 0.99, 0.99]),
    );

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;

    expect(result.discovery.syllableIndexes).toEqual([4, 4, 4, 4, 4]);
    expect(result.discovery.rarity).toBe("mythical");
  });

  test("tracks duplicate emergent pulls by count", () => {
    const preview = getAlchemyWorkbenchEmergentPreview([
      "element:h",
      "element:ne",
      null,
      null,
      null,
    ]);
    if (!preview) throw new Error("expected emergent preview");

    const firstResult = createEmergentTransmutationResult(
      preview,
      100,
      createRandomSequence([0.1, 0.01, 0.01]),
    );
    const secondResult = createEmergentTransmutationResult(
      preview,
      200,
      createRandomSequence([0.1, 0.01, 0.01]),
    );

    expect(firstResult.kind).toBe("success");
    expect(secondResult.kind).toBe("success");
    if (firstResult.kind !== "success" || secondResult.kind !== "success") return;

    const firstLedger = recordEmergentDiscovery([], firstResult.discovery);
    const secondLedger = recordEmergentDiscovery(
      firstLedger.discoveredEmergentRecipes,
      secondResult.discovery,
    );

    expect(firstLedger.isNewDiscovery).toBe(true);
    expect(secondLedger.isNewDiscovery).toBe(false);
    expect(secondLedger.discoveredEmergentRecipes).toHaveLength(1);
    expect(secondLedger.discoveredEmergentRecipes[0]?.count).toBe(2);
    expect(secondLedger.discoveredEmergentRecipes[0]?.lastDiscoveredAtMs).toBe(200);
  });

  test("returns a failure result without a generated discovery", () => {
    const preview = getAlchemyWorkbenchEmergentPreview([
      "element:h",
      "element:ne",
      null,
      null,
      null,
    ]);
    if (!preview) throw new Error("expected emergent preview");

    const result = createEmergentTransmutationResult(preview, 789, createRandomSequence([0.99]));

    expect(result).toEqual({
      attemptedAtMs: 789,
      kind: "failure",
      orderedIngredientCardIds: ["element:h", "element:ne"],
    });
  });

  test("maps rarity from the sampled word-index score", () => {
    expect(getEmergentRecipeRarity([0, 0])).toBe("common");
    expect(getEmergentRecipeRarity([1, 1])).toBe("uncommon");
    expect(getEmergentRecipeRarity([2, 2])).toBe("rare");
    expect(getEmergentRecipeRarity([3, 2])).toBe("epic");
    expect(getEmergentRecipeRarity([3, 4])).toBe("legendary");
    expect(getEmergentRecipeRarity([4, 4, 4, 4, 4])).toBe("mythical");
  });
});

function createRandomSequence(values: readonly number[]): () => number {
  let index = 0;
  return () => {
    const value = values[index] ?? values.at(-1) ?? 0;
    index += 1;
    return value;
  };
}
