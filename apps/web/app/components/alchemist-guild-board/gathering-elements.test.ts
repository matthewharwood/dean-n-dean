import { describe, expect, test } from "bun:test";

import {
  ALCHEMIST_GUILD_GATHERING_ELEMENT_TYPES,
  GATHERING_ENEMY_LADDER_LENGTH,
} from "@dean-stack/schemas";

import {
  applyGatheringElementalDamage,
  GATHERING_ELEMENT_RESIST_MULTIPLIER,
  GATHERING_ELEMENT_SUPER_MULTIPLIER,
  type GatheringElementType,
  gatheringElementDamageMultiplier,
  gatheringElementEffectiveness,
  gatheringElementForRound,
} from "./gathering-elements";

// The intended rock-paper-scissors cycle: each element beats the next.
const RPS_CYCLE: readonly [GatheringElementType, GatheringElementType][] = [
  ["lightning", "water"],
  ["water", "nature"],
  ["nature", "lightning"],
];

describe("gathering element effectiveness", () => {
  test("each element is super-effective against exactly the one it beats", () => {
    for (const [attack, loser] of RPS_CYCLE) {
      expect(gatheringElementEffectiveness(attack, loser)).toBe("super");
      // The reverse matchup is resisted.
      expect(gatheringElementEffectiveness(loser, attack)).toBe("resisted");
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
    expect(gatheringElementDamageMultiplier("super")).toBe(GATHERING_ELEMENT_SUPER_MULTIPLIER);
    expect(gatheringElementDamageMultiplier("resisted")).toBe(GATHERING_ELEMENT_RESIST_MULTIPLIER);
    expect(gatheringElementDamageMultiplier("neutral")).toBe(1);
  });
});

describe("applyGatheringElementalDamage", () => {
  test("scales super-effective hits up and resisted hits down, rounding", () => {
    // lightning beats water → super (1.5x).
    expect(applyGatheringElementalDamage(4, "lightning", "water")).toEqual({
      damage: 6,
      effectiveness: "super",
    });
    // nature beats lightning → lightning resisted by nature (0.5x), rounded.
    expect(applyGatheringElementalDamage(5, "lightning", "nature")).toEqual({
      damage: 3,
      effectiveness: "resisted",
    });
    // mirror → neutral, untouched.
    expect(applyGatheringElementalDamage(7, "water", "water")).toEqual({
      damage: 7,
      effectiveness: "neutral",
    });
  });

  test("a resisted hit still deals at least 1 damage", () => {
    expect(applyGatheringElementalDamage(1, "lightning", "nature").damage).toBe(1);
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

  test("a given enemy keeps its element each lap (ladder length is a multiple of 3)", () => {
    // The element function has period 3 and the enemy ladder loops every
    // GATHERING_ENEMY_LADDER_LENGTH rounds, so for an enemy to keep its element on
    // every lap the ladder length MUST be a multiple of 3. Guard the real invariant
    // (not a hardcoded period-multiple) so adding/removing an enemy can't silently
    // make enemy types un-learnable.
    expect(GATHERING_ENEMY_LADDER_LENGTH % 3).toBe(0);
    for (let round = 1; round <= GATHERING_ENEMY_LADDER_LENGTH; round += 1) {
      expect(gatheringElementForRound(round)).toBe(
        gatheringElementForRound(round + GATHERING_ENEMY_LADDER_LENGTH),
      );
    }
  });
});
