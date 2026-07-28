import { describe, expect, test } from "bun:test";
import {
  ALCHEMIST_GUILD_BOARD_DEFAULT,
  type AlchemistGuildBoardState,
  AlchemistGuildQuestDeliveriesSchema,
  type AlchemistGuildQuestDelivery,
  AlchemistGuildQuestDeliverySchema,
  getAlchemyQuestById,
} from "@dean-stack/schemas";

import {
  canSpendQuestCarryoverInventoryCopy,
  canTransmuteWithQuestCarryovers,
  getQuestCarryoverReservations,
} from "./index";
import {
  canDeliverCardToQuest,
  deliverCardToQuest,
  getQuestDeliverables,
  isQuestDeliveryComplete,
} from "./quest-deliverables";

function quest(id: string) {
  const found = getAlchemyQuestById(id);
  if (!found) throw new Error(`missing quest ${id}`);
  return found;
}

const KITCHEN = "quest:kitchen-salt-and-fuel";
const KITCHEN_ASH = "quest:kitchen-salt-and-fuel-ash";
const KITCHEN_CHARCOAL = "quest:kitchen-salt-and-fuel-charcoal";
const KITCHEN_SALT = "quest:kitchen-salt-and-fuel-salt";
const WATER = "quest:first-water";
const NOW_MS = 10_000;

function kitchenSaltCarryoverState(
  overrides: Partial<AlchemistGuildBoardState> = {},
): AlchemistGuildBoardState {
  return {
    ...ALCHEMIST_GUILD_BOARD_DEFAULT,
    inventorySlots: {
      ...ALCHEMIST_GUILD_BOARD_DEFAULT.inventorySlots,
      "inventory-slot-1": {
        cardId: "material:salt",
        cooldowns: [{ id: "salt-ready", readyAtMs: NOW_MS, startedAtMs: NOW_MS }],
      },
    },
    questDeliveries: {
      ...ALCHEMIST_GUILD_BOARD_DEFAULT.questDeliveries,
      [KITCHEN_SALT]: { "material:salt": 1 },
    },
    selectedQuestId: WATER,
    ...overrides,
  };
}

describe("quest deliverables", () => {
  test("a bundle recipe quest delivers only its crafted output", () => {
    const deliverables = getQuestDeliverables(quest(KITCHEN));
    expect(deliverables).toEqual([{ cardId: "quest:kitchen-stores", required: 1 }]);
  });

  test("a simple quest delivers its single output", () => {
    const deliverables = getQuestDeliverables(quest(WATER));
    expect(deliverables).toHaveLength(1);
    expect(deliverables[0]?.cardId).toBe("material:water");
  });

  test("completion requires the one recipe output", () => {
    const kitchen = quest(KITCHEN);
    expect(isQuestDeliveryComplete(kitchen, {})).toBe(false);

    const delivery: AlchemistGuildQuestDelivery = deliverCardToQuest(
      kitchen,
      {},
      "quest:kitchen-stores",
    );
    expect(isQuestDeliveryComplete(kitchen, delivery)).toBe(true);
  });

  test("delivering caps at required and ignores non-deliverable cards", () => {
    const kitchen = quest(KITCHEN);
    const once = deliverCardToQuest(kitchen, {}, "quest:kitchen-stores");
    expect(once["quest:kitchen-stores"]).toBe(1);
    expect(deliverCardToQuest(kitchen, once, "quest:kitchen-stores")["quest:kitchen-stores"]).toBe(
      1,
    );
    expect(deliverCardToQuest(kitchen, {}, "material:water")).toEqual({});

    expect(canDeliverCardToQuest(kitchen, {}, "quest:kitchen-stores")).toBe(true);
    expect(canDeliverCardToQuest(kitchen, once, "quest:kitchen-stores")).toBe(false);
    expect(canDeliverCardToQuest(kitchen, {}, "material:water")).toBe(false);
  });
});

describe("quest delivery hydration heal (Pillar 3)", () => {
  test("heals the legacy single-card delivery shape into a per-card map", () => {
    expect(
      AlchemistGuildQuestDeliverySchema.parse({
        cardId: "material:water",
        delivered: 2,
        required: 1,
      }),
    ).toEqual({ "material:water": 2 });
  });

  test("passes the new per-card map through unchanged", () => {
    expect(AlchemistGuildQuestDeliverySchema.parse({ "material:salt": 1 })).toEqual({
      "material:salt": 1,
    });
  });

  test("the deliveries record heals legacy entries on re-parse", () => {
    const parsed = AlchemistGuildQuestDeliveriesSchema.parse({
      "quest:first-water": { cardId: "material:water", delivered: 0, required: 1 },
    });
    expect(parsed["quest:first-water"]).toEqual({ "material:water": 0 });
  });
});

describe("quest carryover protection", () => {
  test("reserves an inspected output for the next incomplete recipe that needs it", () => {
    expect(getQuestCarryoverReservations(ALCHEMIST_GUILD_BOARD_DEFAULT)).toEqual([]);

    const presented = kitchenSaltCarryoverState();
    expect(getQuestCarryoverReservations(presented)).toContainEqual({
      arcId: KITCHEN,
      cardId: "material:salt",
      sourceQuestId: KITCHEN_SALT,
      targetQuestId: KITCHEN,
    });

    expect(
      getQuestCarryoverReservations({
        ...presented,
        completedQuestIds: [KITCHEN],
      }),
    ).not.toContainEqual(expect.objectContaining({ cardId: "material:salt" }));

    expect(
      getQuestCarryoverReservations({
        ...presented,
        questDeliveries: {
          ...presented.questDeliveries,
          [KITCHEN]: { "quest:kitchen-stores": 1 },
        },
      }),
    ).not.toContainEqual(expect.objectContaining({ cardId: "material:salt" }));
  });

  test("protects the last ready copy while allowing the selected continuation to use it", () => {
    const unrelated = kitchenSaltCarryoverState();
    expect(canSpendQuestCarryoverInventoryCopy(unrelated, "material:salt", NOW_MS, "sell")).toBe(
      false,
    );
    expect(
      canSpendQuestCarryoverInventoryCopy(unrelated, "material:salt", NOW_MS, "workbench"),
    ).toBe(false);

    const lockedContinuation = { ...unrelated, selectedQuestId: KITCHEN };
    expect(
      canSpendQuestCarryoverInventoryCopy(lockedContinuation, "material:salt", NOW_MS, "workbench"),
    ).toBe(false);

    const selectedContinuation = {
      ...lockedContinuation,
      completedQuestIds: [WATER, KITCHEN_SALT, KITCHEN_CHARCOAL, KITCHEN_ASH],
    };
    expect(
      canSpendQuestCarryoverInventoryCopy(
        selectedContinuation,
        "material:salt",
        NOW_MS,
        "workbench",
      ),
    ).toBe(true);
    expect(
      canSpendQuestCarryoverInventoryCopy(selectedContinuation, "material:salt", NOW_MS, "sell"),
    ).toBe(false);
  });

  test("keeps exactly one copy reserved and leaves duplicate copies spendable", () => {
    const state = kitchenSaltCarryoverState({
      inventorySlots: {
        ...ALCHEMIST_GUILD_BOARD_DEFAULT.inventorySlots,
        "inventory-slot-1": {
          cardId: "material:salt",
          cooldowns: [
            { id: "salt-ready-1", readyAtMs: NOW_MS, startedAtMs: NOW_MS },
            { id: "salt-ready-2", readyAtMs: NOW_MS, startedAtMs: NOW_MS },
          ],
        },
      },
    });

    expect(canSpendQuestCarryoverInventoryCopy(state, "material:salt", NOW_MS, "sell")).toBe(true);
    expect(canSpendQuestCarryoverInventoryCopy(state, "material:salt", NOW_MS, "workbench")).toBe(
      true,
    );
  });

  test("blocks unrelated transmutation of a slotted last copy", () => {
    const slotted = kitchenSaltCarryoverState({
      inventorySlots: ALCHEMIST_GUILD_BOARD_DEFAULT.inventorySlots,
      reagentSlots: {
        ...ALCHEMIST_GUILD_BOARD_DEFAULT.reagentSlots,
        "reagent-slot-1": "material:salt",
      },
    });

    expect(canTransmuteWithQuestCarryovers(slotted, "alchemy:water", NOW_MS)).toBe(false);
    expect(
      canTransmuteWithQuestCarryovers(
        {
          ...slotted,
          completedQuestIds: [WATER, KITCHEN_SALT, KITCHEN_CHARCOAL, KITCHEN_ASH],
          selectedQuestId: KITCHEN,
        },
        "alchemy:kitchen-stores",
        NOW_MS,
      ),
    ).toBe(true);
  });
});
