import { describe, expect, test } from "bun:test";

import { streakRarity } from "./gathering-streak";
import {
  GATHERING_STREAK_RARITY_STYLE,
  GATHERING_STREAK_TIER_PIPS,
  gatheringStreakMeterProgress,
  gatheringStreakRarityStyle,
  nextGatheringStreakTier,
} from "./gathering-streak-style";

const RARITIES = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
  "mythical",
  "celestial",
  "divine",
] as const;

describe("gathering streak style", () => {
  test("every rarity has a complete style token set", () => {
    for (const rarity of RARITIES) {
      const style = gatheringStreakRarityStyle(rarity);
      expect(style).toBe(GATHERING_STREAK_RARITY_STYLE[rarity]);
      for (const token of [
        style.label,
        style.number,
        style.glow,
        style.pip,
        style.ring,
        style.badgeBg,
        style.badgeText,
        style.badgeRing,
      ]) {
        expect(token.length).toBeGreaterThan(0);
      }
    }
  });

  test("the pip ladder is exactly the seven tiers above common, ascending", () => {
    expect(GATHERING_STREAK_TIER_PIPS.map((tier) => tier.min)).toEqual([
      5, 10, 15, 20, 30, 50, 100,
    ]);
    expect(GATHERING_STREAK_TIER_PIPS.map((tier) => tier.rarity)).toEqual([
      "uncommon",
      "rare",
      "epic",
      "legendary",
      "mythical",
      "celestial",
      "divine",
    ]);
  });

  test("nextGatheringStreakTier points at the upcoming band, null once Divine", () => {
    expect(nextGatheringStreakTier(0)).toEqual({ min: 5, rarity: "uncommon" });
    expect(nextGatheringStreakTier(7)).toEqual({ min: 10, rarity: "rare" });
    expect(nextGatheringStreakTier(15)).toEqual({ min: 20, rarity: "legendary" });
    expect(nextGatheringStreakTier(29)).toEqual({ min: 30, rarity: "mythical" });
    expect(nextGatheringStreakTier(30)).toEqual({ min: 50, rarity: "celestial" });
    expect(nextGatheringStreakTier(50)).toEqual({ min: 100, rarity: "divine" });
    expect(nextGatheringStreakTier(100)).toBeNull();
    expect(nextGatheringStreakTier(999)).toBeNull();
  });

  test("the next tier's rarity is always strictly above the current rarity", () => {
    for (const current of [0, 4, 5, 9, 10, 14, 19, 25, 30, 49, 50, 99]) {
      const next = nextGatheringStreakTier(current);
      if (next) expect(next.rarity).not.toBe(streakRarity(current));
    }
  });
});

describe("gatheringStreakMeterProgress", () => {
  test("fills the bar across the current band toward the next tier", () => {
    const atZero = gatheringStreakMeterProgress(0);
    expect(atZero.fraction).toBe(0);
    expect(atZero.remaining).toBe(5);
    expect(atZero.next).toEqual({ min: 5, rarity: "uncommon" });

    const atSeven = gatheringStreakMeterProgress(7);
    expect(atSeven.rarity).toBe("uncommon");
    expect(atSeven.fraction).toBeCloseTo(0.4); // (7-5)/(10-5)
    expect(atSeven.remaining).toBe(3);
    expect(atSeven.next).toEqual({ min: 10, rarity: "rare" });
  });

  test("a tier boundary reads as an empty bar for the new band", () => {
    const atTen = gatheringStreakMeterProgress(10);
    expect(atTen.rarity).toBe("rare");
    expect(atTen.fraction).toBe(0); // just entered the 10→15 band
    expect(atTen.remaining).toBe(5);
  });

  test("the Mythical band fills toward the Celestial tier at 50", () => {
    const mythical = gatheringStreakMeterProgress(42);
    expect(mythical.rarity).toBe("mythical");
    expect(mythical.next).toEqual({ min: 50, rarity: "celestial" });
    expect(mythical.fraction).toBeCloseTo(0.6); // (42-30)/(50-30)
    expect(mythical.remaining).toBe(8);
  });

  test("the Celestial band fills toward the Divine tier at 100", () => {
    const celestial = gatheringStreakMeterProgress(60);
    expect(celestial.rarity).toBe("celestial");
    expect(celestial.next).toEqual({ min: 100, rarity: "divine" });
    expect(celestial.fraction).toBeCloseTo(0.2); // (60-50)/(100-50)
    expect(celestial.remaining).toBe(40);
  });

  test("at the top Divine band the bar is full and there is no next tier", () => {
    const maxed = gatheringStreakMeterProgress(120);
    expect(maxed.rarity).toBe("divine");
    expect(maxed.next).toBeNull();
    expect(maxed.fraction).toBe(1);
    expect(maxed.remaining).toBe(0);
  });
});
