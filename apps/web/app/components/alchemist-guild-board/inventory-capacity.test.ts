import { describe, expect, test } from "bun:test";
import {
  ALCHEMIST_GUILD_BOARD_DEFAULT,
  ALCHEMIST_GUILD_FIELD_BAG_UPGRADE_ID,
  ALCHEMIST_GUILD_QUICK_INVENTORY_SLOT_IDS,
  ALCHEMIST_GUILD_RESERVE_INVENTORY_SLOT_IDS,
  type AlchemistGuildBoardState,
  type AlchemistGuildInventorySlotId,
  type AlchemistGuildUpgradeId,
  getAccessibleAlchemistGuildInventorySlotIds,
} from "@dean-stack/schemas";

import {
  getInventoryDestinationSlotId,
  getInventoryStackSummary,
  InventoryStackSummarySchema,
} from "./inventory-capacity";

const READY_COPY = {
  cooldowns: [{ id: "ready", readyAtMs: 1, startedAtMs: 1 }],
};

function boardWithOccupiedSlots(
  occupiedSlotIds: readonly AlchemistGuildInventorySlotId[],
  unlockedUpgradeIds: readonly AlchemistGuildUpgradeId[] = [],
  cardId = "material:water",
): AlchemistGuildBoardState {
  const inventorySlots = { ...ALCHEMIST_GUILD_BOARD_DEFAULT.inventorySlots };
  for (const slotId of occupiedSlotIds) {
    inventorySlots[slotId] = { ...READY_COPY, cardId };
  }

  return {
    ...ALCHEMIST_GUILD_BOARD_DEFAULT,
    inventorySlots,
    unlockedUpgradeIds: [...unlockedUpgradeIds],
  };
}

describe("Field Bag inventory capacity", () => {
  test("keeps quick and reserve slot tuples unique and ordered", () => {
    const allSlotIds = [
      ...ALCHEMIST_GUILD_QUICK_INVENTORY_SLOT_IDS,
      ...ALCHEMIST_GUILD_RESERVE_INVENTORY_SLOT_IDS,
    ];

    expect(ALCHEMIST_GUILD_QUICK_INVENTORY_SLOT_IDS).toHaveLength(8);
    expect(allSlotIds).toHaveLength(32);
    expect(new Set(allSlotIds).size).toBe(allSlotIds.length);
    expect(getAccessibleAlchemistGuildInventorySlotIds([])).toEqual(
      ALCHEMIST_GUILD_QUICK_INVENTORY_SLOT_IDS,
    );
    expect(
      getAccessibleAlchemistGuildInventorySlotIds([ALCHEMIST_GUILD_FIELD_BAG_UPGRADE_ID]),
    ).toEqual(allSlotIds);
  });

  test("returns null when the quick shelf is full and the Field Bag is locked", () => {
    const boardState = boardWithOccupiedSlots(ALCHEMIST_GUILD_QUICK_INVENTORY_SLOT_IDS);

    expect(getInventoryDestinationSlotId(boardState, "material:salt")).toBeNull();
  });

  test("reuses an existing accessible stack before an empty slot", () => {
    const [firstQuickSlotId] = ALCHEMIST_GUILD_QUICK_INVENTORY_SLOT_IDS;
    const boardState = boardWithOccupiedSlots([firstQuickSlotId]);

    expect(getInventoryDestinationSlotId(boardState, "material:water")).toBe(firstQuickSlotId);
  });

  test("uses the first reserve slot after the Field Bag unlocks", () => {
    const boardState = boardWithOccupiedSlots(ALCHEMIST_GUILD_QUICK_INVENTORY_SLOT_IDS, [
      ALCHEMIST_GUILD_FIELD_BAG_UPGRADE_ID,
    ]);

    expect(getInventoryDestinationSlotId(boardState, "material:salt")).toBe(
      ALCHEMIST_GUILD_RESERVE_INVENTORY_SLOT_IDS[0],
    );
  });

  test("returns null when all 32 Field Bag stacks are occupied", () => {
    const boardState = boardWithOccupiedSlots(
      [...ALCHEMIST_GUILD_QUICK_INVENTORY_SLOT_IDS, ...ALCHEMIST_GUILD_RESERVE_INVENTORY_SLOT_IDS],
      [ALCHEMIST_GUILD_FIELD_BAG_UPGRADE_ID],
    );

    expect(getInventoryDestinationSlotId(boardState, "material:salt")).toBeNull();
  });

  test("summarizes only currently accessible occupied stacks", () => {
    const [firstQuickSlotId, secondQuickSlotId] = ALCHEMIST_GUILD_QUICK_INVENTORY_SLOT_IDS;
    const [firstReserveSlotId] = ALCHEMIST_GUILD_RESERVE_INVENTORY_SLOT_IDS;
    const occupiedSlotIds = [firstQuickSlotId, secondQuickSlotId, firstReserveSlotId];
    const locked = boardWithOccupiedSlots(occupiedSlotIds);
    const unlocked: AlchemistGuildBoardState = {
      ...locked,
      unlockedUpgradeIds: [ALCHEMIST_GUILD_FIELD_BAG_UPGRADE_ID],
    };

    expect(getInventoryStackSummary(locked)).toEqual({
      capacity: 8,
      occupiedStackCount: 2,
    });
    expect(getInventoryStackSummary(unlocked)).toEqual({
      capacity: 32,
      occupiedStackCount: 3,
    });
  });

  test("rejects impossible summaries at the schema boundary", () => {
    expect(
      InventoryStackSummarySchema.safeParse({
        capacity: 8,
        occupiedStackCount: 9,
      }).success,
    ).toBe(false);
  });
});
