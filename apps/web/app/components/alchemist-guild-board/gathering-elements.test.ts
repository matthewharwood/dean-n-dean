import { describe, expect, test } from "bun:test";

import {
  ALCHEMIST_GUILD_GATHERING_ELEMENT_TYPES,
  GATHERING_ENEMY_LADDER_LENGTH,
} from "@dean-stack/schemas";

import {
  applyGatheringElementalDamage,
  GATHERING_ELEMENT_COUNTER_MULTIPLIER,
  type GatheringElementType,
  gatheringCounterElementFor,
  gatheringElementDamageMultiplier,
  gatheringElementEffectiveness,
  gatheringElementForRound,
} from "./gathering-elements";

// The intended counter wheel: each element beats the next.
const RPS_CYCLE: readonly [GatheringElementType, GatheringElementType][] = [
  ["lightning", "water"],
  ["water", "fire"],
  ["fire", "nature"],
  ["nature", "stone"],
  ["stone", "lightning"],
];

describe("gathering element effectiveness", () => {
  test("each element counters exactly the one it beats", () => {
    for (const [attack, loser] of RPS_CYCLE) {
      expect(gatheringElementEffectiveness(attack, loser)).toBe("counter");
      expect(gatheringCounterElementFor(loser)).toBe(attack);
    }
  });

  test("a mirror matchup is neutral", () => {
    for (const element of ALCHEMIST_GUILD_GATHERING_ELEMENT_TYPES) {
      expect(gatheringElementEffectiveness(element, element)).toBe("neutral");
    }
  });
});

describe("gathering element damage multiplier", () => {
  test("maps outcomes to the configured multipliers", () => {
    expect(gatheringElementDamageMultiplier("counter")).toBe(GATHERING_ELEMENT_COUNTER_MULTIPLIER);
    expect(gatheringElementDamageMultiplier("neutral")).toBe(1);
  });
});

describe("applyGatheringElementalDamage", () => {
  test("scales counter hits up and leaves other hits neutral", () => {
    // lightning beats water -> counter (1.5x).
    expect(applyGatheringElementalDamage(4, "lightning", "water")).toEqual({
      damage: 6,
      effectiveness: "counter",
    });
    // Non-counter -> neutral, untouched.
    expect(applyGatheringElementalDamage(5, "lightning", "nature")).toEqual({
      damage: 5,
      effectiveness: "neutral",
    });
    // Mirror -> neutral, untouched.
    expect(applyGatheringElementalDamage(7, "water", "water")).toEqual({
      damage: 7,
      effectiveness: "neutral",
    });
  });

  test("tiny counter hits still deal at least 1 damage", () => {
    expect(applyGatheringElementalDamage(1, "stone", "lightning").damage).toBe(2);
  });
});

describe("gatheringElementForRound", () => {
  test("is deterministic and always a valid element", () => {
    for (let round = 1; round <= 30; round += 1) {
      const element = gatheringElementForRound(round);
      expect(ALCHEMIST_GUILD_GATHERING_ELEMENT_TYPES).toContain(element);
      // Stable across calls.
      expect(gatheringElementForRound(round)).toBe(element);
    }
  });

  test("round 1 is water, matching the themed default monster", () => {
    expect(gatheringElementForRound(1)).toBe("water");
  });

  test("a given enemy keeps its element each lap", () => {
    for (let round = 1; round <= GATHERING_ENEMY_LADDER_LENGTH; round += 1) {
      expect(gatheringElementForRound(round)).toBe(
        gatheringElementForRound(round + GATHERING_ENEMY_LADDER_LENGTH),
      );
    }
  });
});
