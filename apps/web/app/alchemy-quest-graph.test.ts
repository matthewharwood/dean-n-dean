import { describe, expect, test } from "bun:test";

import {
  ALCHEMY_MAX_TABLE_SLOT_COUNT,
  ALCHEMY_QUESTS,
  ALCHEMY_RECIPE_KID_INFO,
  ALCHEMY_RECIPES,
  ALCHEMY_STARTING_TABLE_SLOT_COUNT,
  ALCHEMY_TABLE_SLOT_UPGRADES,
  getAlchemyQuestBoard,
  getAlchemyQuestById,
  getAlchemyQuestMasteryScore,
  getAlchemyQuestRequiredTableSlotCount,
  getAlchemyRecipeKidInfoById,
  getAlchemyRecipeVisibleSlotCount,
  getAvailableAlchemyTableSlotUpgrades,
  validateAlchemyQuestGraph,
  validateAlchemyRecipeKidInfo,
} from "@dean-stack/schemas";

describe("alchemy quest graph", () => {
  test("validates the full deterministic quest DAG", () => {
    expect(validateAlchemyQuestGraph()).toHaveLength(ALCHEMY_QUESTS.length);
  });

  test("assigns every alchemy recipe to exactly one quest", () => {
    const questRecipeIds = ALCHEMY_QUESTS.flatMap((quest) => quest.recipeIds);
    const uniqueQuestRecipeIds = new Set(questRecipeIds);
    const recipeIds = ALCHEMY_RECIPES.map((recipe) => recipe.id);

    expect(uniqueQuestRecipeIds.size).toBe(ALCHEMY_RECIPES.length);
    expect(questRecipeIds.toSorted()).toEqual(recipeIds.toSorted());
  });

  test("gives every recipe kid-readable info button copy", () => {
    expect(validateAlchemyRecipeKidInfo()).toHaveLength(ALCHEMY_RECIPES.length);
    expect(ALCHEMY_RECIPE_KID_INFO).toHaveLength(ALCHEMY_RECIPES.length);

    for (const recipe of ALCHEMY_RECIPES) {
      const kidInfo = getAlchemyRecipeKidInfoById(recipe.id);

      expect(kidInfo?.title).toBe(recipe.name);
      expect(kidInfo?.sentences.length).toBeGreaterThanOrEqual(3);
      expect(kidInfo?.sentences.length).toBeLessThanOrEqual(4);
      expect(kidInfo?.sourceIds.length).toBeGreaterThan(0);
    }
  });

  test("keeps discovery-token rewards tied to three face-up choices", () => {
    for (const quest of ALCHEMY_QUESTS) {
      if (quest.rewards.discoveryTokens === 0) continue;

      expect(quest.discoveryDraft).toHaveLength(3);
      expect(new Set(quest.discoveryDraft?.map((option) => option.role)).size).toBe(3);
    }
  });

  test("surfaces a small deterministic board from completed quests", () => {
    expect(getAlchemyQuestBoard().map((quest) => quest.id)).toEqual(["quest:first-water"]);

    const afterFirstWater = getAlchemyQuestBoard(["quest:first-water"]);
    expect(afterFirstWater.map((quest) => quest.id)).toEqual([
      "quest:kitchen-salt-and-fuel",
      "quest:metal-samples",
      "quest:field-kit-basics",
    ]);

    const afterKitchenAndMetals = getAlchemyQuestBoard([
      "quest:first-water",
      "quest:kitchen-salt-and-fuel",
      "quest:metal-samples",
    ]);
    expect(afterKitchenAndMetals.map((quest) => quest.id)).toEqual(["quest:field-kit-basics"]);

    const afterStarterBranches = getAlchemyQuestBoard([
      "quest:first-water",
      "quest:kitchen-salt-and-fuel",
      "quest:metal-samples",
      "quest:field-kit-basics",
    ]);
    expect(afterStarterBranches[0]?.id).toBe("quest:glass-minerals");
  });

  test("ramps mastery scoring from tutorial to saga capstone", () => {
    const firstQuest = getAlchemyQuestById("quest:first-water");
    const finalQuest = getAlchemyQuestById("quest:guild-adventure-crate");

    if (!firstQuest || !finalQuest) {
      throw new Error("Expected first and final alchemy quests to exist");
    }

    expect(getAlchemyQuestMasteryScore(finalQuest)).toBeGreaterThan(
      getAlchemyQuestMasteryScore(firstQuest),
    );
  });

  test("starts the Alchemy Workbench at three slots and caps recipes at five", () => {
    expect(ALCHEMY_STARTING_TABLE_SLOT_COUNT).toBe(3);
    expect(ALCHEMY_MAX_TABLE_SLOT_COUNT).toBe(5);

    for (const recipe of ALCHEMY_RECIPES) {
      expect(getAlchemyRecipeVisibleSlotCount(recipe)).toBeLessThanOrEqual(
        ALCHEMY_MAX_TABLE_SLOT_COUNT,
      );
    }
  });

  test("unlocks Alchemy Workbench slot purchases before quests require them", () => {
    expect(ALCHEMY_TABLE_SLOT_UPGRADES.map((upgrade) => upgrade.slotCount)).toEqual([4, 5]);
    expect(
      getAvailableAlchemyTableSlotUpgrades(["quest:first-water"]).map((upgrade) => upgrade.id),
    ).toEqual(["upgrade:table-slot-4"]);
    expect(
      getAvailableAlchemyTableSlotUpgrades(["quest:first-water", "quest:field-kit-basics"]).map(
        (upgrade) => upgrade.id,
      ),
    ).toEqual(["upgrade:table-slot-4", "upgrade:table-slot-5"]);

    const glassQuest = getAlchemyQuestById("quest:glass-minerals");
    if (!glassQuest) throw new Error("Expected glass minerals quest to exist");

    expect(getAlchemyQuestRequiredTableSlotCount(glassQuest)).toBe(5);
    expect(glassQuest.prerequisites.allOf).toContain("quest:field-kit-basics");
  });
});
