import { describe, expect, test } from "bun:test";
import {
  ALCHEMIST_GUILD_BOARD_DEFAULT,
  ALCHEMIST_GUILD_INVENTORY_SLOTS_DEFAULT,
  ALCHEMY_GATHERABLE_CARDS,
  ALCHEMY_QUESTS,
  getAlchemyQuestById,
} from "@dean-stack/schemas";
import {
  getDiscoveredElementIdsAfterExpeditionReward,
  getExpeditionTargetDefinitions,
} from "./expedition-targets";
import {
  EXPEDITION_QUEST_DROP_TARGET_LIMIT,
  getExpeditionQuestDropTargets,
} from "./gathering-loop";

const LEATHER_STRIP_QUEST_ID = "quest:leather-and-parchment-leather-strip";

describe("expedition quest-help targets", () => {
  test("puts Hide first for the current Leather Strip quest", () => {
    const quest = getRequiredQuest(LEATHER_STRIP_QUEST_ID);
    const boardState = {
      ...ALCHEMIST_GUILD_BOARD_DEFAULT,
      completedQuestIds: [...quest.prerequisites.allOf],
      selectedQuestId: quest.id,
    };

    const definitions = getExpeditionTargetDefinitions(boardState, quest);
    const questHelpTargets = definitions.filter((target) => target.group === "quest-help");

    expect(questHelpTargets[0]).toEqual({
      cardId: "raw:hide",
      group: "quest-help",
      source: "current-quest",
    });
    expect(definitions).toContainEqual({
      cardId: "element:na",
      group: "elements",
      source: "quest",
    });
    expect(definitions).toContainEqual({
      cardId: "element:cl",
      group: "elements",
      source: "quest",
    });
  });

  test("only offers canonical raw gatherables and never crafted ingredients", () => {
    const quest = getRequiredQuest(LEATHER_STRIP_QUEST_ID);
    const boardState = {
      ...ALCHEMIST_GUILD_BOARD_DEFAULT,
      completedQuestIds: [...quest.prerequisites.allOf],
      selectedQuestId: quest.id,
    };
    const canonicalGatherableIds = new Set<string>(
      ALCHEMY_GATHERABLE_CARDS.map((card) => card.cardId),
    );

    const targets = getExpeditionQuestDropTargets(boardState);

    expect(targets.length).toBeGreaterThan(0);
    expect(targets.every((target) => canonicalGatherableIds.has(target.cardId))).toBe(true);
    expect(targets.map((target) => target.cardId)).not.toContain("material:salt");
    expect(targets.map((target) => target.cardId)).not.toContain("component:leather-strip");
  });

  test("removes a raw blocker once enough copies already cover nearby quests", () => {
    const quest = getRequiredQuest(LEATHER_STRIP_QUEST_ID);
    const boardState = {
      ...ALCHEMIST_GUILD_BOARD_DEFAULT,
      completedQuestIds: [...quest.prerequisites.allOf],
      inventorySlots: {
        ...ALCHEMIST_GUILD_INVENTORY_SLOTS_DEFAULT,
        "inventory-slot-1": {
          cardId: "raw:hide",
          cooldowns: [
            { id: "hide-1", readyAtMs: 0, startedAtMs: 0 },
            { id: "hide-2", readyAtMs: 0, startedAtMs: 0 },
          ],
        },
      },
      selectedQuestId: quest.id,
    };

    const targets = getExpeditionQuestDropTargets(boardState);

    expect(targets.find((target) => target.cardId === "raw:hide")).toBeUndefined();
  });

  test("does not descend into ingredients beneath an owned quest output", () => {
    const quest = getRequiredQuest(LEATHER_STRIP_QUEST_ID);
    const boardState = {
      ...ALCHEMIST_GUILD_BOARD_DEFAULT,
      completedQuestIds: [...quest.prerequisites.allOf],
      inventorySlots: {
        ...ALCHEMIST_GUILD_INVENTORY_SLOTS_DEFAULT,
        "inventory-slot-1": {
          cardId: "component:leather-strip",
          cooldowns: [{ id: "leather-strip-1", readyAtMs: 0, startedAtMs: 0 }],
        },
      },
      selectedQuestId: quest.id,
    };

    const targets = getExpeditionQuestDropTargets(boardState);

    expect(
      targets.find((target) => target.cardId === "raw:hide" && target.source === "current-quest"),
    ).toBeUndefined();
  });

  test("is deterministic, deduplicated, and caps only Quest Help at ten", () => {
    let observedMaximum = 0;

    for (let completedCount = 0; completedCount < ALCHEMY_QUESTS.length; completedCount += 1) {
      const completedQuestIds = ALCHEMY_QUESTS.slice(0, completedCount).map((quest) => quest.id);
      const selectedQuest = ALCHEMY_QUESTS[completedCount];
      if (!selectedQuest) break;
      const boardState = {
        ...ALCHEMIST_GUILD_BOARD_DEFAULT,
        completedQuestIds,
        selectedQuestId: selectedQuest.id,
      };

      const first = getExpeditionQuestDropTargets(boardState);
      const second = getExpeditionQuestDropTargets(boardState);
      const cardIds = first.map((target) => target.cardId);

      expect(second).toEqual(first);
      expect(new Set(cardIds).size).toBe(cardIds.length);
      expect(first.length).toBeLessThanOrEqual(EXPEDITION_QUEST_DROP_TARGET_LIMIT);
      observedMaximum = Math.max(observedMaximum, first.length);
    }

    expect(observedMaximum).toBe(EXPEDITION_QUEST_DROP_TARGET_LIMIT);
  });
});

describe("expedition reward discovery", () => {
  test("stores a raw reward without treating it as a discovered element", () => {
    expect(getDiscoveredElementIdsAfterExpeditionReward(["element:h"], "raw:hide")).toEqual([
      "element:h",
    ]);
  });

  test("still records a newly returned element exactly once", () => {
    expect(getDiscoveredElementIdsAfterExpeditionReward(["element:h"], "element:o")).toEqual([
      "element:h",
      "element:o",
    ]);
    expect(
      getDiscoveredElementIdsAfterExpeditionReward(["element:h", "element:o"], "element:o"),
    ).toEqual(["element:h", "element:o"]);
  });
});

function getRequiredQuest(questId: string) {
  const quest = getAlchemyQuestById(questId);
  if (!quest) throw new Error(`Missing quest fixture: ${questId}`);
  return quest;
}
