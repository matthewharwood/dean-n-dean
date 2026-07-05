import { describe, expect, test } from "bun:test";
import { join } from "node:path";

import { ALCHEMIST_GUILD_GATHERING_STREAK_DEFAULT } from "@dean-stack/schemas";

import {
  advanceGatheringStreak,
  CELESTIAL_STREAK_TIER_AT,
  GATHERING_STREAK_RARITY_TIERS,
  gatheringStreakIncrementDetuneCents,
  resolveGatheringStreakSoundEvent,
  streakBonusForOptionIndex,
  streakChestImage,
  streakRarity,
  streakRarityChestImage,
  streakRewardBonus,
  streakRewardBreadth,
} from "./gathering-streak";

const PUBLIC_DIR = join(import.meta.dir, "..", "..", "..", "public");

describe("gathering streak reward math", () => {
  test("hits the design anchors: 5 -> +1 one card, 10 -> +2 two cards, 15 -> +3", () => {
    expect(streakRewardBonus(5)).toEqual({ primary: 1, second: 0, third: 0 });
    expect(streakRewardBonus(10)).toEqual({ primary: 1, second: 1, third: 0 });
    expect(streakRewardBonus(15)).toEqual({ primary: 2, second: 1, third: 0 });
  });

  test("matches the full verified payout table", () => {
    const total = (s: number) => {
      const b = streakRewardBonus(s);
      return b.primary + b.second + b.third;
    };
    expect(total(1)).toBe(0);
    expect(total(3)).toBe(0);
    expect(total(5)).toBe(1);
    expect(total(8)).toBe(1);
    expect(total(10)).toBe(2);
    expect(total(15)).toBe(3);
    expect(total(18)).toBe(4);
    expect(total(20)).toBe(4);
    expect(total(30)).toBe(5);
    expect(total(50)).toBe(5);
    expect(total(100)).toBe(6);
  });

  test("breadth steps from 0 -> 1 -> 2 -> 3 at streak 5 / 10 / 18", () => {
    expect(streakRewardBreadth(4)).toBe(0);
    expect(streakRewardBreadth(5)).toBe(1);
    expect(streakRewardBreadth(9)).toBe(1);
    expect(streakRewardBreadth(10)).toBe(2);
    expect(streakRewardBreadth(17)).toBe(2);
    expect(streakRewardBreadth(18)).toBe(3);
    expect(streakRewardBreadth(999)).toBe(3);
  });

  test("primary depth never clamps but stays sub-linear (T/s strictly decays)", () => {
    const ratio = (s: number) => {
      const b = streakRewardBonus(s);
      return (b.primary + b.second + b.third) / s;
    };
    // The streak value itself has no ceiling: primary keeps growing at huge streaks.
    expect(streakRewardBonus(5000).primary).toBeGreaterThan(streakRewardBonus(100).primary);
    // ...yet the payout-per-streak ratio keeps falling (provably diminishing).
    expect(ratio(50)).toBeLessThan(ratio(10));
    expect(ratio(100)).toBeLessThan(ratio(50));
    expect(ratio(500)).toBeLessThan(ratio(100));
  });

  test("bonus maps onto demand-ordered reward option indices", () => {
    expect(streakBonusForOptionIndex(15, 0)).toBe(2); // primary = most demanded
    expect(streakBonusForOptionIndex(15, 1)).toBe(1); // second
    expect(streakBonusForOptionIndex(15, 2)).toBe(0); // third (not yet unlocked at 15)
    expect(streakBonusForOptionIndex(18, 2)).toBe(1); // third unlocks at 18
    expect(streakBonusForOptionIndex(15, 3)).toBe(0); // no fourth option
  });
});

describe("gathering streak rarity tiers", () => {
  test("maps streak bands to the rarity tiers, up to Celestial at 50", () => {
    expect(streakRarity(0)).toBe("common");
    expect(streakRarity(4)).toBe("common");
    expect(streakRarity(5)).toBe("uncommon");
    expect(streakRarity(9)).toBe("uncommon");
    expect(streakRarity(10)).toBe("rare");
    expect(streakRarity(14)).toBe("rare");
    expect(streakRarity(15)).toBe("epic");
    expect(streakRarity(19)).toBe("epic");
    expect(streakRarity(20)).toBe("legendary");
    expect(streakRarity(29)).toBe("legendary");
    expect(streakRarity(30)).toBe("mythical");
    expect(streakRarity(CELESTIAL_STREAK_TIER_AT - 1)).toBe("mythical");
    expect(streakRarity(CELESTIAL_STREAK_TIER_AT)).toBe("celestial");
    expect(streakRarity(9999)).toBe("celestial");
  });

  test("every rarity tier ships a committed treasure-chest WebP, all distinct", async () => {
    const rarities = GATHERING_STREAK_RARITY_TIERS.map((tier) => tier.rarity);
    const images = new Set<string>();
    for (const rarity of rarities) {
      const imagePath = streakRarityChestImage(rarity);
      images.add(imagePath);
      expect(await Bun.file(join(PUBLIC_DIR, imagePath)).exists()).toBe(true);
    }
    // 1:1 mapping — every tier (including Celestial) has its own distinct chest.
    expect(images.size).toBe(rarities.length);
  });

  test("streakChestImage resolves through the rarity tier", () => {
    expect(streakChestImage(0)).toBe(streakRarityChestImage("common"));
    expect(streakChestImage(30)).toBe(streakRarityChestImage("mythical"));
    expect(streakChestImage(CELESTIAL_STREAK_TIER_AT)).toBe(streakRarityChestImage("celestial"));
  });
});

describe("advanceGatheringStreak", () => {
  test("a correct answer increments, stamps the tick time, and tracks longest", () => {
    const next = advanceGatheringStreak(ALCHEMIST_GUILD_GATHERING_STREAK_DEFAULT, true, 1_000);
    expect(next.current).toBe(1);
    expect(next.longest).toBe(1);
    expect(next.lastIncrementAtMs).toBe(1_000);
    expect(next.lastBrokenAtMs).toBeNull();
  });

  test("longest is preserved across a reset, not overwritten by a smaller streak", () => {
    let streak = ALCHEMIST_GUILD_GATHERING_STREAK_DEFAULT;
    for (let i = 0; i < 7; i += 1) streak = advanceGatheringStreak(streak, true, i);
    expect(streak.current).toBe(7);
    expect(streak.longest).toBe(7);

    const broken = advanceGatheringStreak(streak, false, 100);
    expect(broken.current).toBe(0);
    expect(broken.longest).toBe(7);
    expect(broken.lastBrokenAtMs).toBe(100);

    const rebuilt = advanceGatheringStreak(broken, true, 200);
    expect(rebuilt.current).toBe(1);
    expect(rebuilt.longest).toBe(7); // unchanged — 1 < 7
  });

  test("a wrong answer at streak 0 does not re-stamp the break time (no shatter spam)", () => {
    const next = advanceGatheringStreak(ALCHEMIST_GUILD_GATHERING_STREAK_DEFAULT, false, 500);
    expect(next.current).toBe(0);
    expect(next.lastBrokenAtMs).toBeNull();
  });
});

describe("resolveGatheringStreakSoundEvent", () => {
  test("ignites exactly when the streak reaches the first bonus tier (5)", () => {
    expect(resolveGatheringStreakSoundEvent(4, true)).toBe("ignite");
    expect(resolveGatheringStreakSoundEvent(3, true)).toBe("increment");
  });

  test("fires a milestone when crossing a higher rarity band (10/15/20/30)", () => {
    expect(resolveGatheringStreakSoundEvent(9, true)).toBe("milestone"); // -> 10 rare
    expect(resolveGatheringStreakSoundEvent(14, true)).toBe("milestone"); // -> 15 epic
    expect(resolveGatheringStreakSoundEvent(19, true)).toBe("milestone"); // -> 20 legendary
    expect(resolveGatheringStreakSoundEvent(29, true)).toBe("milestone"); // -> 30 mythical
  });

  test("ordinary climbs are increments", () => {
    for (const before of [0, 5, 10, 16, 25, 40]) {
      expect(resolveGatheringStreakSoundEvent(before, true)).toBe("increment");
    }
  });

  test("a wrong answer breaks only when there was a streak to lose", () => {
    expect(resolveGatheringStreakSoundEvent(3, false)).toBe("break");
    expect(resolveGatheringStreakSoundEvent(0, false)).toBeNull();
  });
});

describe("gatheringStreakIncrementDetuneCents", () => {
  test("climbs with the streak and caps so a marathon never shrieks", () => {
    expect(gatheringStreakIncrementDetuneCents(1)).toBe(-140);
    expect(gatheringStreakIncrementDetuneCents(10)).toBe(400);
    expect(gatheringStreakIncrementDetuneCents(17)).toBe(800);
    expect(gatheringStreakIncrementDetuneCents(99)).toBe(800);
    // Strictly non-decreasing across the live range.
    for (let s = 1; s < 40; s += 1) {
      expect(gatheringStreakIncrementDetuneCents(s + 1)).toBeGreaterThanOrEqual(
        gatheringStreakIncrementDetuneCents(s),
      );
    }
  });
});
