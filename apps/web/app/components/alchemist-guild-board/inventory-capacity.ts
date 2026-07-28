import {
  type AlchemistGuildBoardState,
  type AlchemistGuildInventorySlotId,
  getAccessibleAlchemistGuildInventorySlotIds,
} from "@dean-stack/schemas";
import * as z from "zod";

export const InventoryStackSummarySchema = z
  .object({
    capacity: z.int().min(1),
    occupiedStackCount: z.int().min(0),
  })
  .refine((summary) => summary.occupiedStackCount <= summary.capacity, {
    error: "occupiedStackCount cannot exceed capacity",
    path: ["occupiedStackCount"],
  });
export type InventoryStackSummary = z.infer<typeof InventoryStackSummarySchema>;

/**
 * Finds the stable destination for another inventory copy. Existing accessible
 * stacks win before an empty slot so crafting never fragments one card across
 * the quick shelf and Field Bag reserve.
 */
export function getInventoryDestinationSlotId(
  boardState: AlchemistGuildBoardState,
  cardId: string,
): AlchemistGuildInventorySlotId | null {
  const accessibleSlotIds = getAccessibleAlchemistGuildInventorySlotIds(
    boardState.unlockedUpgradeIds,
  );

  for (const slotId of accessibleSlotIds) {
    if (boardState.inventorySlots[slotId]?.cardId === cardId) return slotId;
  }

  for (const slotId of accessibleSlotIds) {
    if (!boardState.inventorySlots[slotId]) return slotId;
  }

  return null;
}

/** Counts only stacks the player can currently see and use. */
export function getInventoryStackSummary(
  boardState: AlchemistGuildBoardState,
): InventoryStackSummary {
  const accessibleSlotIds = getAccessibleAlchemistGuildInventorySlotIds(
    boardState.unlockedUpgradeIds,
  );
  let occupiedStackCount = 0;
  for (const slotId of accessibleSlotIds) {
    if (boardState.inventorySlots[slotId]) occupiedStackCount += 1;
  }

  return {
    capacity: accessibleSlotIds.length,
    occupiedStackCount,
  };
}
