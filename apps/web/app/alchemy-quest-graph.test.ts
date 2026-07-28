import { describe, expect, test } from "bun:test";

import {
  ALCHEMIST_GUILD_BOARD_DEFAULT,
  ALCHEMIST_GUILD_FIELD_BAG_UPGRADE_ID,
  ALCHEMIST_GUILD_INVENTORY_SLOT_IDS,
  ALCHEMIST_GUILD_QUICK_INVENTORY_SLOT_IDS,
  ALCHEMIST_GUILD_RESERVE_INVENTORY_SLOT_IDS,
  ALCHEMIST_GUILD_STARTING_DISCOVERED_ELEMENT_IDS,
  ALCHEMIST_GUILD_STARTING_ELEMENT_QUANTITIES,
  ALCHEMY_MAX_TABLE_SLOT_COUNT,
  ALCHEMY_QUESTS,
  ALCHEMY_RECIPE_KID_INFO,
  ALCHEMY_RECIPES,
  ALCHEMY_STARTING_TABLE_SLOT_COUNT,
  ALCHEMY_TABLE_SLOT_UPGRADES,
  AlchemistGuildBoardStateSchema,
  EXTENDED_MOLECULE_KID_INFO,
  EXTENDED_MOLECULE_RECIPES,
  expandCompletedAlchemyQuestIds,
  getAccessibleAlchemistGuildInventorySlotIds,
  getAlchemyQuestBoard,
  getAlchemyQuestById,
  getAlchemyQuestMasteryScore,
  getAlchemyQuestRequiredTableSlotCount,
  getAlchemyRecipeKidInfoById,
  getAlchemyRecipeVisibleSlotCount,
  getAvailableAlchemyTableSlotUpgrades,
  validateAlchemyQuestGraph,
  validateAlchemyRecipeGraph,
  validateAlchemyRecipeKidInfo,
  validateExtendedMoleculeKidInfo,
} from "@dean-stack/schemas";

function inventoryItem(cardId: string) {
  return {
    cardId,
    cooldowns: [{ id: `${cardId}:existing`, readyAtMs: 0, startedAtMs: 0 }],
  };
}

describe("alchemy quest graph", () => {
  test("validates the full deterministic quest DAG", () => {
    expect(validateAlchemyQuestGraph()).toHaveLength(ALCHEMY_QUESTS.length);
  });

  test("validates every recipe by ingredients plus effective machinery", () => {
    expect(validateAlchemyRecipeGraph()).toHaveLength(ALCHEMY_RECIPES.length);
  });

  test("rejects recipes that still collide after machinery is considered", () => {
    const collidingRecipes = ALCHEMY_RECIPES.map((recipe) =>
      recipe.id === "alchemy:copper-rivet" ? { ...recipe, machineryId: "wire-drawbench" } : recipe,
    );

    expect(() => validateAlchemyRecipeGraph(collidingRecipes)).toThrow(
      "share inputs and machinery wire-drawbench",
    );
  });

  test("heals legacy board saves to Default machinery selection", () => {
    const { selectedMachineryId, ...legacyBoardState } = ALCHEMIST_GUILD_BOARD_DEFAULT;

    expect(selectedMachineryId).toBeNull();
    expect(AlchemistGuildBoardStateSchema.parse(legacyBoardState).selectedMachineryId).toBeNull();
  });

  test("expands an old eight-slot save into quick slots plus the locked reserve", () => {
    const legacyInventorySlots = Object.fromEntries(
      ALCHEMIST_GUILD_QUICK_INVENTORY_SLOT_IDS.map((slotId) => [slotId, null]),
    );
    const migrated = AlchemistGuildBoardStateSchema.parse({
      inventorySlots: legacyInventorySlots,
      questModelVersion: 2,
    });

    expect(Object.keys(migrated.inventorySlots).toSorted()).toEqual(
      [...ALCHEMIST_GUILD_INVENTORY_SLOT_IDS].toSorted(),
    );
    expect(
      ALCHEMIST_GUILD_RESERVE_INVENTORY_SLOT_IDS.every(
        (slotId) => migrated.inventorySlots[slotId] === null,
      ),
    ).toBe(true);
    expect(getAccessibleAlchemistGuildInventorySlotIds(migrated.unlockedUpgradeIds)).toEqual(
      ALCHEMIST_GUILD_QUICK_INVENTORY_SLOT_IDS,
    );
  });

  test("starts crafting behind fog with only Water recipe elements stocked", () => {
    expect(ALCHEMIST_GUILD_BOARD_DEFAULT.discoveredElementIds).toEqual([
      ...ALCHEMIST_GUILD_STARTING_DISCOVERED_ELEMENT_IDS,
    ]);
    expect(ALCHEMIST_GUILD_BOARD_DEFAULT.elementQuantities).toEqual({
      ...ALCHEMIST_GUILD_STARTING_ELEMENT_QUANTITIES,
    });
  });

  test("assigns every alchemy recipe to exactly one quest", () => {
    const questRecipeIds = ALCHEMY_QUESTS.map((quest) => quest.recipeId);
    const uniqueQuestRecipeIds = new Set(questRecipeIds);
    const recipeIds = ALCHEMY_RECIPES.map((recipe) => recipe.id);

    expect(ALCHEMY_QUESTS).toHaveLength(ALCHEMY_RECIPES.length);
    expect(uniqueQuestRecipeIds.size).toBe(ALCHEMY_RECIPES.length);
    expect(questRecipeIds.toSorted()).toEqual(recipeIds.toSorted());
  });

  test("links each continuation and only carries outputs used later in its story", () => {
    for (const quest of ALCHEMY_QUESTS) {
      const laterArcQuests = ALCHEMY_QUESTS.filter(
        (candidate) =>
          candidate.continuation.arcId === quest.continuation.arcId &&
          candidate.continuation.step > quest.continuation.step,
      );
      const recipe = ALCHEMY_RECIPES.find((candidate) => candidate.id === quest.recipeId);
      if (!recipe) throw new Error(`Missing recipe ${quest.recipeId}`);
      const outputIsUsedLater = laterArcQuests.some((candidate) => {
        const laterRecipe = ALCHEMY_RECIPES.find(
          (recipeToFind) => recipeToFind.id === candidate.recipeId,
        );
        return laterRecipe?.arguments.some((argument) => argument.cardId === recipe.output.cardId);
      });

      expect(quest.continuation.carriesOutputForward).toBe(outputIsUsedLater);
      if (quest.continuation.nextQuestId) {
        expect(getAlchemyQuestById(quest.continuation.nextQuestId)?.progression.sequence).toBe(
          quest.progression.sequence + 1,
        );
      }
    }
  });

  test("caps live continuation inventory at three distinct recipe outputs", () => {
    const carriedOutputsByArc = new Map<string, Map<string, number>>();
    let maximumDistinctCarriedOutputs = 0;

    for (const quest of ALCHEMY_QUESTS) {
      const recipe = ALCHEMY_RECIPES.find((candidate) => candidate.id === quest.recipeId);
      if (!recipe) throw new Error(`Missing recipe ${quest.recipeId}`);
      const carriedOutputs =
        carriedOutputsByArc.get(quest.continuation.arcId) ?? new Map<string, number>();
      carriedOutputsByArc.set(quest.continuation.arcId, carriedOutputs);

      for (const argument of recipe.arguments) {
        const remainingCount = (carriedOutputs.get(argument.cardId) ?? 0) - argument.quantity;
        if (remainingCount > 0) carriedOutputs.set(argument.cardId, remainingCount);
        else carriedOutputs.delete(argument.cardId);
      }
      if (quest.continuation.carriesOutputForward) {
        carriedOutputs.set(
          recipe.output.cardId,
          (carriedOutputs.get(recipe.output.cardId) ?? 0) + 1,
        );
      }
      maximumDistinctCarriedOutputs = Math.max(maximumDistinctCarriedOutputs, carriedOutputs.size);
    }

    expect(maximumDistinctCarriedOutputs).toBe(3);
  });

  test("gives every one-recipe quest its own story payoff", () => {
    const completionLore = ALCHEMY_QUESTS.map((quest) => quest.narrative.completion);

    expect(completionLore).toHaveLength(123);
    expect(new Set(completionLore).size).toBe(123);
    expect(completionLore.every((loreBeat) => loreBeat.length >= 60)).toBe(true);
  });

  test("makes the Field Bag a grateful First Water story reward", () => {
    const firstWater = getAlchemyQuestById("quest:first-water");

    expect(firstWater?.unlocks.upgrades).toContain("upgrade:field-bag");
    expect(firstWater?.narrative.completion).toContain("Field Bag");
  });

  test("heals completed legacy finales into every prerequisite chapter", () => {
    expect(expandCompletedAlchemyQuestIds(["quest:kitchen-salt-and-fuel"])).toEqual([
      "quest:first-water",
      "quest:kitchen-salt-and-fuel-salt",
      "quest:kitchen-salt-and-fuel-charcoal",
      "quest:kitchen-salt-and-fuel-ash",
      "quest:kitchen-salt-and-fuel",
    ]);
  });

  test("migrates an untouched legacy arc to its first one-recipe chapter", () => {
    const migrated = AlchemistGuildBoardStateSchema.parse({
      completedQuestIds: ["quest:first-water"],
      selectedQuestId: "quest:kitchen-salt-and-fuel",
    });

    expect(migrated.questModelVersion).toBe(2);
    expect(migrated.selectedQuestId).toBe("quest:kitchen-salt-and-fuel-salt");
  });

  test("seeds every one-recipe chapter when a legacy Kitchen bundle is ready", () => {
    const migrated = AlchemistGuildBoardStateSchema.parse({
      autoPlayedQuestVoiceIds: ["quest:kitchen-salt-and-fuel-charcoal"],
      completedQuestIds: ["quest:first-water"],
      questDeliveries: {
        "quest:kitchen-salt-and-fuel": {
          "material:salt": 1,
          "material:charcoal": 1,
          "material:ash": 1,
        },
      },
      selectedQuestId: "quest:kitchen-salt-and-fuel",
    });

    expect(migrated.autoPlayedQuestVoiceIds).toEqual(["quest:kitchen-salt-and-fuel"]);
    expect(migrated.questDeliveries["quest:kitchen-salt-and-fuel-salt"]).toEqual({
      "material:salt": 1,
    });
    expect(migrated.questDeliveries["quest:kitchen-salt-and-fuel-charcoal"]).toEqual({
      "material:charcoal": 1,
    });
    expect(migrated.questDeliveries["quest:kitchen-salt-and-fuel-ash"]).toEqual({
      "material:ash": 1,
    });
    expect(migrated.questDeliveries["quest:kitchen-salt-and-fuel"]).toEqual({
      "quest:kitchen-stores": 1,
    });
    expect(migrated.legacyQuestRefunds).toEqual({});
  });

  test("clears a partial Kitchen delivery and refunds existing stacks before empty slots", () => {
    const migrated = AlchemistGuildBoardStateSchema.parse({
      completedQuestIds: ["quest:first-water"],
      inventorySlots: {
        "inventory-slot-1": {
          cardId: "material:salt",
          cooldowns: [{ id: "salt:existing", readyAtMs: 0, startedAtMs: 0 }],
        },
        "inventory-slot-2": {
          cardId: "material:water",
          cooldowns: [{ id: "water:existing", readyAtMs: 0, startedAtMs: 0 }],
        },
      },
      questDeliveries: {
        "quest:kitchen-salt-and-fuel": {
          "material:salt": 1,
          "material:charcoal": 1,
        },
      },
      selectedQuestId: "quest:kitchen-salt-and-fuel",
    });

    expect(migrated.questDeliveries).toEqual({});
    expect(migrated.inventorySlots["inventory-slot-1"]?.cardId).toBe("material:salt");
    expect(migrated.inventorySlots["inventory-slot-1"]?.cooldowns).toHaveLength(2);
    expect(migrated.inventorySlots["inventory-slot-3"]).toMatchObject({
      cardId: "material:charcoal",
      cooldowns: [{ readyAtMs: 0, startedAtMs: 0 }],
    });
    expect(migrated.legacyQuestRefunds).toEqual({});
  });

  test("refunds external Garden Charm inputs from the reconstructed legacy contract", () => {
    const migrated = AlchemistGuildBoardStateSchema.parse({
      completedQuestIds: ["quest:fermentation-and-preservation"],
      questDeliveries: {
        "quest:garden-charm": {
          "material:seed-coating": 1,
          "quest:copper-charm": 1,
        },
      },
      selectedQuestId: "quest:garden-charm",
    });
    const refundedCardIds = Object.values(migrated.inventorySlots)
      .flatMap((item) => (item ? [item.cardId] : []))
      .toSorted();

    expect(migrated.questDeliveries).toEqual({});
    expect(refundedCardIds).toEqual(["material:seed-coating", "quest:copper-charm"]);
  });

  test("recognizes a ready legacy Guild Crate bundle even though it has one recipe", () => {
    const migrated = AlchemistGuildBoardStateSchema.parse({
      completedQuestIds: ["quest:class-kits"],
      questDeliveries: {
        "quest:guild-adventure-crate": {
          "equipment:knight-repair-kit": 1,
          "equipment:observation-kit": 1,
          "equipment:purifying-flask": 1,
          "equipment:signal-mirror": 1,
        },
      },
      selectedQuestId: "quest:guild-adventure-crate",
    });

    expect(migrated.questDeliveries["quest:guild-adventure-crate"]).toEqual({
      "quest:guild-adventure-crate": 1,
    });
    expect(migrated.inventorySlots).toEqual(ALCHEMIST_GUILD_BOARD_DEFAULT.inventorySlots);
  });

  test("keeps refunds pending while the quick Inventory is full and the Field Bag is locked", () => {
    const fullInventory = {
      "inventory-slot-1": inventoryItem("material:water"),
      "inventory-slot-2": inventoryItem("material:charcoal"),
      "inventory-slot-3": inventoryItem("material:ash"),
      "inventory-slot-4": inventoryItem("material:silica"),
      "inventory-slot-5": inventoryItem("material:soda-ash"),
      "inventory-slot-6": inventoryItem("material:calcium-carbonate"),
      "inventory-slot-7": inventoryItem("material:glass"),
      "inventory-slot-8": inventoryItem("component:glass-tube"),
    };
    const locked = AlchemistGuildBoardStateSchema.parse({
      inventorySlots: fullInventory,
      legacyQuestRefunds: { "material:salt": 1 },
      questModelVersion: 2,
    });

    expect(locked.unlockedUpgradeIds).not.toContain(ALCHEMIST_GUILD_FIELD_BAG_UPGRADE_ID);
    expect(locked.legacyQuestRefunds).toEqual({ "material:salt": 1 });
    expect(locked.inventorySlots["inventory-slot-9"]).toBeNull();
    expect(
      Object.values(locked.inventorySlots).some((item) => item?.cardId === "material:salt"),
    ).toBe(false);
  });

  test("unlocks the Field Bag and settles a pending refund into reserve slot nine atomically", () => {
    const occupiedCardIds = [
      "material:water",
      "material:charcoal",
      "material:ash",
      "material:silica",
      "material:soda-ash",
      "material:calcium-carbonate",
      "material:glass",
      "component:glass-tube",
    ] as const;
    const fullQuickInventory = Object.fromEntries(
      ALCHEMIST_GUILD_QUICK_INVENTORY_SLOT_IDS.map((slotId, index) => [
        slotId,
        inventoryItem(occupiedCardIds[index] ?? "material:water"),
      ]),
    );
    const unlocked = AlchemistGuildBoardStateSchema.parse({
      completedQuestIds: ["quest:first-water"],
      inventorySlots: fullQuickInventory,
      legacyQuestRefunds: { "material:salt": 1 },
      questModelVersion: 2,
    });

    expect(unlocked.unlockedUpgradeIds).toContain(ALCHEMIST_GUILD_FIELD_BAG_UPGRADE_ID);
    expect(getAccessibleAlchemistGuildInventorySlotIds(unlocked.unlockedUpgradeIds)).toEqual(
      ALCHEMIST_GUILD_INVENTORY_SLOT_IDS,
    );
    expect(unlocked.legacyQuestRefunds).toEqual({});
    expect(unlocked.inventorySlots["inventory-slot-9"]).toMatchObject({
      cardId: "material:salt",
      cooldowns: [{ readyAtMs: 0, startedAtMs: 0 }],
    });
  });

  test("reconciles the Field Bag onto an existing First Water save", () => {
    const migrated = AlchemistGuildBoardStateSchema.parse({
      completedQuestIds: ["quest:first-water"],
      questModelVersion: 2,
      unlockedUpgradeIds: ["merchant-gold"],
    });

    expect(migrated.unlockedUpgradeIds).toEqual([
      "merchant-gold",
      ALCHEMIST_GUILD_FIELD_BAG_UPGRADE_ID,
    ]);
  });

  test("rejects unknown persisted upgrade ids", () => {
    expect(
      AlchemistGuildBoardStateSchema.safeParse({
        ...ALCHEMIST_GUILD_BOARD_DEFAULT,
        unlockedUpgradeIds: ["imaginary-upgrade"],
      }).success,
    ).toBe(false);
  });

  test("rejects an invalid refund record instead of discarding its legitimate pending refund", () => {
    expect(
      AlchemistGuildBoardStateSchema.safeParse({
        ...ALCHEMIST_GUILD_BOARD_DEFAULT,
        legacyQuestRefunds: { "material:ash": 0, "material:salt": 1 },
      }).success,
    ).toBe(false);
  });

  test("keeps a completed legacy finale selected after expanding its chapters", () => {
    const migrated = AlchemistGuildBoardStateSchema.parse({
      completedQuestIds: ["quest:kitchen-salt-and-fuel"],
      selectedQuestId: "quest:kitchen-salt-and-fuel",
    });

    expect(migrated.selectedQuestId).toBe("quest:kitchen-salt-and-fuel");
    expect(migrated.completedQuestIds).toContain("quest:kitchen-salt-and-fuel-salt");
    expect(migrated.completedQuestIds).toContain("quest:kitchen-salt-and-fuel-charcoal");
    expect(migrated.completedQuestIds).toContain("quest:kitchen-salt-and-fuel-ash");
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

  test("gives every extended molecule kid-readable info and a PubChem image", () => {
    expect(validateExtendedMoleculeKidInfo()).toHaveLength(EXTENDED_MOLECULE_RECIPES.length);
    expect(EXTENDED_MOLECULE_KID_INFO).toHaveLength(EXTENDED_MOLECULE_RECIPES.length);

    for (const kidInfo of EXTENDED_MOLECULE_KID_INFO) {
      expect(kidInfo.sentences.length).toBeGreaterThanOrEqual(3);
      expect(kidInfo.funFacts.length).toBeGreaterThanOrEqual(3);
      expect(kidInfo.imageUrl).toContain("pubchem.ncbi.nlm.nih.gov");
      expect(kidInfo.sourceLinks.length).toBeGreaterThanOrEqual(2);
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
      "quest:kitchen-salt-and-fuel-salt",
      "quest:metal-samples-iron-ingot",
      "quest:field-kit-basics-herbal-mash",
    ]);

    const afterKitchenAndMetals = getAlchemyQuestBoard([
      "quest:first-water",
      "quest:kitchen-salt-and-fuel",
      "quest:metal-samples",
    ]);
    expect(afterKitchenAndMetals.map((quest) => quest.id)).toEqual([
      "quest:field-kit-basics-herbal-mash",
    ]);

    const afterStarterBranches = getAlchemyQuestBoard([
      "quest:first-water",
      "quest:kitchen-salt-and-fuel",
      "quest:metal-samples",
      "quest:field-kit-basics",
    ]);
    expect(afterStarterBranches[0]?.id).toBe("quest:glass-minerals-silica");
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

    const glassQuest = getAlchemyQuestById("quest:glass-minerals-soda-ash");
    const firstGlassQuest = getAlchemyQuestById("quest:glass-minerals-silica");
    if (!glassQuest) throw new Error("Expected soda ash quest chapter to exist");
    if (!firstGlassQuest) throw new Error("Expected first glass minerals quest to exist");

    expect(getAlchemyQuestRequiredTableSlotCount(glassQuest)).toBe(5);
    expect(firstGlassQuest.prerequisites.allOf).toContain("quest:field-kit-basics");
  });
});
