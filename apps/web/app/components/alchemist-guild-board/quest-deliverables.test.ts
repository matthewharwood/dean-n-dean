import { describe, expect, test } from "bun:test";
import {
  AlchemistGuildQuestDeliveriesSchema,
  type AlchemistGuildQuestDelivery,
  AlchemistGuildQuestDeliverySchema,
  getAlchemyQuestById,
} from "@dean-stack/schemas";

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
const WATER = "quest:first-water";

describe("quest deliverables", () => {
  test("a bundle quest delivers its components (one drop zone each)", () => {
    const deliverables = getQuestDeliverables(quest(KITCHEN));
    expect(deliverables.map((entry) => entry.cardId).toSorted()).toEqual([
      "material:ash",
      "material:charcoal",
      "material:salt",
    ]);
    for (const deliverable of deliverables) expect(deliverable.required).toBe(1);
  });

  test("a simple quest delivers its single output", () => {
    const deliverables = getQuestDeliverables(quest(WATER));
    expect(deliverables).toHaveLength(1);
    expect(deliverables[0]?.cardId).toBe("material:water");
  });

  test("completion requires every deliverable", () => {
    const kitchen = quest(KITCHEN);
    expect(isQuestDeliveryComplete(kitchen, {})).toBe(false);

    let delivery: AlchemistGuildQuestDelivery = {};
    for (const deliverable of getQuestDeliverables(kitchen)) {
      delivery = deliverCardToQuest(kitchen, delivery, deliverable.cardId);
    }
    expect(isQuestDeliveryComplete(kitchen, delivery)).toBe(true);
  });

  test("delivering caps at required and ignores non-deliverable cards", () => {
    const kitchen = quest(KITCHEN);
    const once = deliverCardToQuest(kitchen, {}, "material:salt");
    expect(once["material:salt"]).toBe(1);
    expect(deliverCardToQuest(kitchen, once, "material:salt")["material:salt"]).toBe(1);
    expect(deliverCardToQuest(kitchen, {}, "material:water")).toEqual({});

    expect(canDeliverCardToQuest(kitchen, {}, "material:salt")).toBe(true);
    expect(canDeliverCardToQuest(kitchen, once, "material:salt")).toBe(false);
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
