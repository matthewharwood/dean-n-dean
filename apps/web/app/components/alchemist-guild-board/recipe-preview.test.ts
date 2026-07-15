import { describe, expect, test } from "bun:test";

import {
  ALCHEMY_RECIPES,
  EXTENDED_MOLECULE_RECIPE_COUNT,
  EXTENDED_MOLECULE_RECIPES,
  getAlchemyRecipeById,
} from "@dean-stack/schemas";

import {
  doesWorkbenchMatchRecipe,
  getAlchemyRecipeElementFormulaKey,
  getAlchemyRecipeSlotCardIds,
  getAlchemyWorkbenchExtendedRecipePreview,
  getAlchemyWorkbenchRecipePreview,
} from "./recipe-preview";

describe("alchemy workbench recipe preview", () => {
  const waterRecipe = getAlchemyRecipeById("alchemy:water");
  const distilledWaterRecipe = getAlchemyRecipeById("alchemy:distilled-water");
  const herbalMashRecipe = getAlchemyRecipeById("alchemy:herbal-mash");

  if (!waterRecipe || !distilledWaterRecipe || !herbalMashRecipe) {
    throw new Error("Missing recipe preview test anchors");
  }

  test("expands recipe quantities into ordered workbench slots", () => {
    expect(getAlchemyRecipeSlotCardIds(waterRecipe)).toEqual([
      "element:h",
      "element:h",
      "element:o",
    ]);
  });

  test("matches recipes by card ID counts regardless of slot order", () => {
    expect(
      doesWorkbenchMatchRecipe(["element:h", "element:h", "element:o", null, null], waterRecipe),
    ).toBe(true);
    expect(
      doesWorkbenchMatchRecipe(["element:h", "element:o", "element:h", null, null], waterRecipe),
    ).toBe(true);
    expect(
      doesWorkbenchMatchRecipe(["material:water", "raw:herbs", null, null, null], herbalMashRecipe),
    ).toBe(true);

    expect(
      doesWorkbenchMatchRecipe(["element:h", "element:h", null, null, null], waterRecipe),
    ).toBe(false);
    expect(
      doesWorkbenchMatchRecipe(
        ["element:h", "element:h", "element:o", "element:c", null],
        waterRecipe,
      ),
    ).toBe(false);
    expect(
      doesWorkbenchMatchRecipe(
        ["element:he", "material:water", null, null, null],
        herbalMashRecipe,
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

  test("previews Herbal Mash from Herbs and Water by card IDs in either slot order", () => {
    const preview = getAlchemyWorkbenchRecipePreview([
      "material:water",
      "raw:herbs",
      null,
      null,
      null,
    ]);

    expect(preview?.recipe.id).toBe("alchemy:herbal-mash");
    expect(preview?.formula).toBe("Herbs + Water");
    expect(preview?.ingredientRows.map((row) => [row.cardId, row.label, row.quantity])).toEqual([
      ["raw:herbs", "Herbs", 1],
      ["material:water", "Water", 1],
    ]);
  });

  test("keeps extended molecules out of current game recipe formulas", () => {
    const gameFormulaKeys = new Set(
      ALCHEMY_RECIPES.map(getAlchemyRecipeElementFormulaKey).filter((key) => key !== null),
    );
    const conflictingExtendedRecipes = EXTENDED_MOLECULE_RECIPES.filter((recipe) =>
      gameFormulaKeys.has(recipe.formulaKey),
    );
    const oversizedExtendedRecipes = EXTENDED_MOLECULE_RECIPES.filter(
      (recipe) =>
        recipe.ingredients.reduce((total, ingredient) => total + ingredient.quantity, 0) > 5,
    );
    const transmutedInputExtendedRecipes = EXTENDED_MOLECULE_RECIPES.filter((recipe) =>
      recipe.ingredients.some((ingredient) => !ingredient.cardId.startsWith("element:")),
    );

    expect(EXTENDED_MOLECULE_RECIPES).toHaveLength(EXTENDED_MOLECULE_RECIPE_COUNT);
    expect(conflictingExtendedRecipes).toEqual([]);
    expect(oversizedExtendedRecipes).toEqual([]);
    expect(transmutedInputExtendedRecipes).toEqual([]);
  });

  test("previews extended molecule discoveries by elemental formula", () => {
    const preview = getAlchemyWorkbenchExtendedRecipePreview([
      "element:h",
      "element:h",
      null,
      null,
      null,
    ]);

    expect(preview?.recipe.id).toBe("extended:h2");
    expect(preview?.recipe.output.cardId).toBe("molecule:h2");
    expect(preview?.formula).toBe("2H");
  });

  test("previews extended recipes only from direct element slots", () => {
    const directElementPreview = getAlchemyWorkbenchExtendedRecipePreview([
      "element:h",
      "element:h",
      "element:o",
      "element:o",
      null,
    ]);
    const moleculePreview = getAlchemyWorkbenchExtendedRecipePreview([
      "molecule:h2",
      "molecule:o2",
      null,
      null,
      null,
    ]);
    const materialPreview = getAlchemyWorkbenchExtendedRecipePreview([
      "material:water",
      "element:o",
      null,
      null,
      null,
    ]);

    expect(directElementPreview?.recipe.id).toBe("extended:h2-o2");
    expect(moleculePreview).toBeNull();
    expect(materialPreview).toBeNull();
  });

  test("does not preview extended molecules for formulas owned by normal recipes", () => {
    expect(
      getAlchemyWorkbenchExtendedRecipePreview(["element:h", "element:h", "element:o", null, null]),
    ).toBeNull();
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

  test("distinguishes the Glass Tube and Glass Flask shaping recipes", () => {
    const tubePreview = getAlchemyWorkbenchRecipePreview([
      "material:glass",
      null,
      null,
      null,
      null,
    ]);
    const flaskPreview = getAlchemyWorkbenchRecipePreview([
      "material:glass",
      "material:glass",
      null,
      null,
      null,
    ]);

    expect(tubePreview?.recipe.id).toBe("alchemy:glass-tube");
    expect(tubePreview?.formula).toBe("Glass");
    expect(flaskPreview?.recipe.id).toBe("alchemy:glass-flask");
    expect(flaskPreview?.formula).toBe("2 Glass");
  });

  test("requires two ingots for metal-shaping component recipes", () => {
    const metalShapeRecipeExpectations = [
      ["alchemy:copper-wire", "material:copper-ingot"],
      ["alchemy:iron-nail", "material:iron-ingot"],
      ["alchemy:bronze-buckle", "material:bronze-ingot"],
      ["alchemy:steel-needle", "material:steel-ingot"],
      ["alchemy:copper-rivet", "material:copper-ingot"],
      ["alchemy:ranger-arrowhead", "material:steel-ingot"],
      ["alchemy:silver-wire", "material:silver-ingot"],
      ["alchemy:gold-leaf", "material:gold-ingot"],
    ] as const;

    for (const [recipeId, ingredientCardId] of metalShapeRecipeExpectations) {
      const recipe = getAlchemyRecipeById(recipeId);
      if (!recipe) throw new Error(`Missing ${recipeId} recipe`);

      expect(getAlchemyRecipeSlotCardIds(recipe)).toEqual([ingredientCardId, ingredientCardId]);
    }
  });

  test("previews Gold Leaf from two Gold Ingots", () => {
    const goldLeafRecipe = getAlchemyRecipeById("alchemy:gold-leaf");
    if (!goldLeafRecipe) throw new Error("Missing Gold Leaf recipe");

    expect(getAlchemyRecipeSlotCardIds(goldLeafRecipe)).toEqual([
      "material:gold-ingot",
      "material:gold-ingot",
    ]);

    const preview = getAlchemyWorkbenchRecipePreview([
      "material:gold-ingot",
      "material:gold-ingot",
      null,
      null,
      null,
    ]);

    expect(preview?.recipe.id).toBe("alchemy:gold-leaf");
    expect(preview?.formula).toBe("2 Gold Ingot");
  });
});
