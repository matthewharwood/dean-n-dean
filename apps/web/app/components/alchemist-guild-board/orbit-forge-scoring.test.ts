import { describe, expect, test } from "bun:test";

import {
  aggregateForgeSyllableIndexes,
  applyForgeSafetyRetap,
  classifyForgeTapByDegrees,
  classifyForgeTapByTime,
  FORGE_HITS_TOTAL,
  FORGE_TAP_SPEEDS_DEG_PER_SEC,
  ForgeRoundResultSchema,
  type ForgeTapTier,
  forgeTierSyllableIndex,
  resolveForgeRound,
} from "./orbit-forge-scoring";

const perfect8: ForgeTapTier[] = Array.from({ length: 8 }, () => "perfect");

describe("classifyForgeTapByDegrees", () => {
  test("assigns tiers by angular error from the gate centerline (no assist)", () => {
    expect(classifyForgeTapByDegrees(0, false)).toBe("perfect");
    expect(classifyForgeTapByDegrees(-9, false)).toBe("perfect");
    expect(classifyForgeTapByDegrees(9.1, false)).toBe("great");
    expect(classifyForgeTapByDegrees(14, false)).toBe("great");
    expect(classifyForgeTapByDegrees(14.1, false)).toBe("good");
    expect(classifyForgeTapByDegrees(22, false)).toBe("good");
    expect(classifyForgeTapByDegrees(22.1, false)).toBe("graze");
    expect(classifyForgeTapByDegrees(180, false)).toBe("graze");
  });

  test("assist widens every window ~1.4x and is on by default", () => {
    // 12deg is a graze... no — 12 <= 14 so it's GREAT without assist; pick a value
    // that only lands inside a window WITH assist: 12.5deg > perfect(9) but
    // <= perfect*1.4 (12.6) => perfect under assist.
    expect(classifyForgeTapByDegrees(12.5, false)).toBe("great");
    expect(classifyForgeTapByDegrees(12.5, true)).toBe("perfect");
    expect(classifyForgeTapByDegrees(12.5)).toBe("perfect"); // default = assist on
  });
});

describe("classifyForgeTapByTime (Pulse Gate)", () => {
  test("assigns tiers by time error from the green core", () => {
    expect(classifyForgeTapByTime(0, false)).toBe("perfect");
    expect(classifyForgeTapByTime(70, false)).toBe("perfect");
    expect(classifyForgeTapByTime(150, false)).toBe("great");
    expect(classifyForgeTapByTime(260, false)).toBe("good");
    expect(classifyForgeTapByTime(261, false)).toBe("graze");
  });
});

describe("forgeTierSyllableIndex", () => {
  test("higher tiers are rarer indexes; graze is zero", () => {
    expect(forgeTierSyllableIndex("perfect")).toBe(4);
    expect(forgeTierSyllableIndex("great")).toBe(3);
    expect(forgeTierSyllableIndex("good")).toBe(2);
    expect(forgeTierSyllableIndex("graze")).toBe(0);
  });
});

describe("applyForgeSafetyRetap", () => {
  test("rescues the first graze of a round to a good, once", () => {
    const first = applyForgeSafetyRetap("graze", false);
    expect(first).toEqual({ safetyUsed: true, tier: "good" });
    // A second graze is not rescued.
    expect(applyForgeSafetyRetap("graze", true)).toEqual({ safetyUsed: true, tier: "graze" });
  });

  test("never alters a non-graze tap or spends the safety on one", () => {
    expect(applyForgeSafetyRetap("perfect", false)).toEqual({ safetyUsed: false, tier: "perfect" });
  });
});

describe("aggregateForgeSyllableIndexes", () => {
  test("takes the best N indexes for an N-ingredient craft", () => {
    const tiers: ForgeTapTier[] = [
      "good",
      "perfect",
      "graze",
      "great",
      "good",
      "graze",
      "good",
      "perfect",
    ];
    // indexes: [2,4,0,3,2,0,2,4] -> sorted desc [4,4,3,2,2,2,0,0]
    expect(aggregateForgeSyllableIndexes(tiers, 2)).toEqual([4, 4]);
    expect(aggregateForgeSyllableIndexes(tiers, 3)).toEqual([4, 4, 3]);
    expect(aggregateForgeSyllableIndexes(tiers, 5)).toEqual([4, 4, 3, 2, 2]);
  });
});

describe("resolveForgeRound", () => {
  test("eight perfects forge the top indexes for any ingredient count", () => {
    expect(resolveForgeRound(perfect8, 2)).toEqual({ success: true, syllableIndexes: [4, 4] });
    expect(resolveForgeRound(perfect8, 5)).toEqual({
      success: true,
      syllableIndexes: [4, 4, 4, 4, 4],
    });
  });

  test("a single non-graze tap still crafts (kind success)", () => {
    const oneGood: ForgeTapTier[] = [
      "graze",
      "graze",
      "good",
      "graze",
      "graze",
      "graze",
      "graze",
      "graze",
    ];
    const result = resolveForgeRound(oneGood, 3);
    expect(result.success).toBe(true);
    expect(result.syllableIndexes).toEqual([2, 0, 0]);
  });

  test("only a true no-show (all grazes) fails", () => {
    const allGraze: ForgeTapTier[] = Array.from({ length: 8 }, () => "graze");
    const result = resolveForgeRound(allGraze, 4);
    expect(result.success).toBe(false);
    expect(result.syllableIndexes).toEqual([0, 0, 0, 0]);
  });

  test("the result is a valid ForgeRoundResult", () => {
    expect(() => ForgeRoundResultSchema.parse(resolveForgeRound(perfect8, 4))).not.toThrow();
  });
});

describe("round constants", () => {
  test("there are eight taps and one speed per tap", () => {
    expect(FORGE_HITS_TOTAL).toBe(8);
    expect(FORGE_TAP_SPEEDS_DEG_PER_SEC).toHaveLength(FORGE_HITS_TOTAL);
    // Monotonic non-decreasing ramp.
    for (let i = 1; i < FORGE_TAP_SPEEDS_DEG_PER_SEC.length; i += 1) {
      expect(FORGE_TAP_SPEEDS_DEG_PER_SEC[i]).toBeGreaterThanOrEqual(
        FORGE_TAP_SPEEDS_DEG_PER_SEC[i - 1] ?? 0,
      );
    }
  });
});
