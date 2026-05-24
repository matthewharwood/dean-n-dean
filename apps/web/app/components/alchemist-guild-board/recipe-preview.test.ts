import { describe, expect, test } from "bun:test";

import { getAlchemyRecipeById } from "@dean-stack/schemas";

import {
  doesWorkbenchMatchRecipe,
  getAlchemyRecipeSlotCardIds,
  getAlchemyWorkbenchRecipePreview,
} from "./recipe-preview";

describe("alchemy workbench recipe preview", () => {
  const waterRecipe = getAlchemyRecipeById("alchemy:water");
  const distilledWaterRecipe = getAlchemyRecipeById("alchemy:distilled-water");

  if (!waterRecipe || !distilledWaterRecipe) {
    throw new Error("Missing recipe preview test anchors");
  }

  test("expands recipe quantities into ordered workbench slots", () => {
    expect(getAlchemyRecipeSlotCardIds(waterRecipe)).toEqual([
      "element:h",
      "element:h",
      "element:o",
    ]);
  });

  test("matches water only when the exact ordered slot sequence is present", () => {
    expect(
      doesWorkbenchMatchRecipe(["element:h", "element:h", "element:o", null, null], waterRecipe),
    ).toBe(true);

    expect(
      doesWorkbenchMatchRecipe(["element:h", "element:o", "element:h", null, null], waterRecipe),
    ).toBe(false);
    expect(
      doesWorkbenchMatchRecipe(["element:h", "element:h", null, null, null], waterRecipe),
    ).toBe(false);
    expect(
      doesWorkbenchMatchRecipe(
        ["element:h", "element:h", "element:o", "element:c", null],
        waterRecipe,
      ),
    ).toBe(false);
  });

  test("returns the recipe and kid info for an exact workbench match", () => {
    const preview = getAlchemyWorkbenchRecipePreview([
      "element:h",
      "element:h",
      "element:o",
      null,
      null,
    ]);

    expect(preview?.recipe.id).toBe("alchemy:water");
    expect(preview?.formula).toBe("2H + O");
    expect(preview?.kidInfo?.title).toBe("Water");
    expect(preview?.ingredientRows.map((row) => [row.label, row.quantity])).toEqual([
      ["Hydrogen", 2],
      ["Oxygen", 1],
    ]);
  });

  test("formats repeated crafted-card ingredients with readable spacing", () => {
    expect(getAlchemyRecipeSlotCardIds(distilledWaterRecipe)).toEqual([
      "material:water",
      "material:water",
    ]);

    const preview = getAlchemyWorkbenchRecipePreview([
      "material:water",
      "material:water",
      null,
      null,
      null,
    ]);

    expect(preview?.recipe.id).toBe("alchemy:distilled-water");
    expect(preview?.formula).toBe("2 Water");
    expect(preview?.ingredientRows.map((row) => [row.label, row.quantity])).toEqual([["Water", 2]]);
  });
});
