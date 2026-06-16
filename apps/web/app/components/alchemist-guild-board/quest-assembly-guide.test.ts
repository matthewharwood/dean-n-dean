import { describe, expect, test } from "bun:test";

import { ALCHEMIST_GUILD_BOARD_DEFAULT, getAlchemyQuestById } from "@dean-stack/schemas";

import { createQuestAssemblyGuide } from "./quest-assembly-guide";

const READY_NOW_MS = 1_000;

describe("quest assembly guide", () => {
  test("tracks stored Glass Batch components without making them separate quest deliveries", () => {
    const glassQuest = getAlchemyQuestById("quest:glass-minerals");
    if (!glassQuest) throw new Error("Missing glass minerals quest");

    const guide = createQuestAssemblyGuide(
      {
        ...ALCHEMIST_GUILD_BOARD_DEFAULT,
        inventorySlots: {
          ...ALCHEMIST_GUILD_BOARD_DEFAULT.inventorySlots,
          "inventory-slot-1": {
            cardId: "material:silica",
            cooldowns: [{ id: "silica:ready", readyAtMs: 0, startedAtMs: 0 }],
          },
        },
      },
      glassQuest,
      READY_NOW_MS,
    );

    expect(guide?.terminalRecipeName).toBe("Glass Batch");
    expect(guide?.preparedCount).toBe(1);
    expect(guide?.readyToAssemble).toBe(false);
    expect(guide?.ingredients.map((ingredient) => [ingredient.label, ingredient.status])).toEqual([
      ["Silica", "stored"],
      ["Soda Ash", "missing"],
      ["Calcium Carbonate", "missing"],
    ]);
  });

  test("Kitchen Stores bundles Salt, Charcoal, and Ash into the quest-2 deliverable", () => {
    // Regression: quest:kitchen-salt-and-fuel used to complete on a lone Salt card
    // because salt/charcoal/ash were three independent terminals (the engine fell
    // back to recipes[0]=salt). The bundle makes all three genuinely required.
    const kitchenQuest = getAlchemyQuestById("quest:kitchen-salt-and-fuel");
    if (!kitchenQuest) throw new Error("Missing kitchen-salt-and-fuel quest");

    const guide = createQuestAssemblyGuide(
      ALCHEMIST_GUILD_BOARD_DEFAULT,
      kitchenQuest,
      READY_NOW_MS,
    );

    expect(guide?.terminalRecipeName).toBe("Kitchen Stores");
    expect(guide?.terminalOutputCardId).toBe("quest:kitchen-stores");
    expect(guide?.requiredCount).toBe(3);
    expect(guide?.ingredients.map((ingredient) => ingredient.label)).toEqual([
      "Salt",
      "Charcoal",
      "Ash",
    ]);
  });

  test("announces when all Glass Batch components are ready to combine", () => {
    const glassQuest = getAlchemyQuestById("quest:glass-minerals");
    if (!glassQuest) throw new Error("Missing glass minerals quest");

    const guide = createQuestAssemblyGuide(
      {
        ...ALCHEMIST_GUILD_BOARD_DEFAULT,
        inventorySlots: {
          ...ALCHEMIST_GUILD_BOARD_DEFAULT.inventorySlots,
          "inventory-slot-1": {
            cardId: "material:silica",
            cooldowns: [{ id: "silica:ready", readyAtMs: 0, startedAtMs: 0 }],
          },
          "inventory-slot-2": {
            cardId: "material:soda-ash",
            cooldowns: [{ id: "soda-ash:ready", readyAtMs: 0, startedAtMs: 0 }],
          },
          "inventory-slot-3": {
            cardId: "material:calcium-carbonate",
            cooldowns: [{ id: "calcium-carbonate:ready", readyAtMs: 0, startedAtMs: 0 }],
          },
        },
      },
      glassQuest,
      READY_NOW_MS,
    );

    expect(guide?.preparedCount).toBe(3);
    expect(guide?.readyToAssemble).toBe(true);
    expect(guide?.instruction).toBe(
      "Glass Batch is ready. Place Silica, Soda Ash and Calcium Carbonate on the Workbench.",
    );
  });
});
