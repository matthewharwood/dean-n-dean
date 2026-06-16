import type {
  AlchemistGuildEmergentRecipeRarity,
  AlchemistGuildGatheringStreak,
} from "@dean-stack/schemas";

// ---------------------------------------------------------------------------
// Streak reward math — pure, deterministic, and fully tunable from here.
//
// A "streak" is correct math answers in a row during normal gathering. It never
// clamps (it climbs forever) but the resource payout is provably sub-linear, so
// the quest economy can't run away. The payout is two coupled curves:
//   - breadth:  how many of the 3 reward options get a bonus badge (step fn)
//   - depth:    how big the PRIMARY (most quest-demanded) option's bonus is (log)
// Secondary/tertiary options get a flat +1 once their breadth tier unlocks, so a
// kid can read the badges at a glance.
//
// Calibrated to the first-boss window (level 1 = 25 facts, gate at 95% mastered,
// ~75-150 correct answers): the live pre-mastery range is streak 5-15, which is
// exactly where the anchors sit. 18+/30+ are post-mastery "flex" tiers.
// Anchors (verified in tests): streak 5 -> +1 on one card, 10 -> +2 across two,
// 15 -> +3 (a +2 primary plus a +1 secondary).
// ---------------------------------------------------------------------------

/** Below this streak the meter shows but pays nothing (builds tension). */
export const STREAK_FIRST_BONUS_AT = 5;
/** At/above this streak a second reward option earns a +1 badge. */
export const STREAK_SECOND_CARD_AT = 10;
/** At/above this streak all three reward options earn a badge. */
export const STREAK_THIRD_CARD_AT = 18;
/** Log base for the primary depth curve. Larger = the primary bonus grows slower. */
export const STREAK_DEPTH_BASE = 2.15;
/** Soft shift for the primary depth curve. Larger = the first +2 arrives later. */
export const STREAK_DEPTH_SOFT = 6.5;

export type StreakRewardBonus = {
  /** Bonus on the most quest-demanded reward option (index 0). */
  primary: number;
  /** Bonus on the second reward option (index 1). */
  second: number;
  /** Bonus on the third reward option (index 2). */
  third: number;
};

/** How many of the three reward options earn a bonus badge at this streak. */
export function streakRewardBreadth(streak: number): 0 | 1 | 2 | 3 {
  if (streak < STREAK_FIRST_BONUS_AT) return 0;
  if (streak < STREAK_SECOND_CARD_AT) return 1;
  if (streak < STREAK_THIRD_CARD_AT) return 2;
  return 3;
}

/** Bonus depth on the PRIMARY option — `1 + floor(log_base((s - first)/soft + 1))`. */
export function streakRewardDepthPrimary(streak: number): number {
  if (streak < STREAK_FIRST_BONUS_AT) return 0;
  const ramped = (streak - STREAK_FIRST_BONUS_AT) / STREAK_DEPTH_SOFT + 1;
  return 1 + Math.floor(Math.log(ramped) / Math.log(STREAK_DEPTH_BASE));
}

/** The per-option bonus for a streak, on top of the baseline +1 every reward grants. */
export function streakRewardBonus(streak: number): StreakRewardBonus {
  const breadth = streakRewardBreadth(streak);
  return {
    primary: streakRewardDepthPrimary(streak),
    second: breadth >= 2 ? 1 : 0,
    third: breadth >= 3 ? 1 : 0,
  };
}

/** The bonus for a specific reward option, by its demand-ordered index (0 = most demanded). */
export function streakBonusForOptionIndex(streak: number, optionIndex: number): number {
  const bonus = streakRewardBonus(streak);
  if (optionIndex === 0) return bonus.primary;
  if (optionIndex === 1) return bonus.second;
  if (optionIndex === 2) return bonus.third;
  return 0;
}

// --- Rarity tiers ----------------------------------------------------------
// Six streak bands map 1:1 to the six rarity tiers and the six treasure-chest
// arts. The chest the player opens reflects the streak at the moment the monster
// died — a glanceable trophy for a composed run. Ascending, and the single source
// for both the rarity lookup AND the meter's tier ladder (its pips + the
// "next TIER @N" hint), so the thresholds never drift between systems. NOTE these
// rarity thresholds (5/10/15/20/30) are intentionally distinct from the bonus
// breadth tiers above (5/10/18) — two different ladders.
// The streak ladder reaches ONE tier beyond the six shared rarities: "Celestial",
// grander than Mythical, earned at a 50 streak. It's streak-only (the orbit forge
// never produces it), so we keep it as a local superset of the shared rarity type
// rather than widening the schema enum + every emergent-recipe switch.
export type GatheringStreakRarity = AlchemistGuildEmergentRecipeRarity | "celestial";

/** The streak that reaches the Celestial tier (one beyond Mythical's 30). */
export const CELESTIAL_STREAK_TIER_AT = 50;

export const GATHERING_STREAK_RARITY_TIERS: ReadonlyArray<{
  min: number;
  rarity: GatheringStreakRarity;
}> = [
  { min: 0, rarity: "common" },
  { min: STREAK_FIRST_BONUS_AT, rarity: "uncommon" },
  { min: STREAK_SECOND_CARD_AT, rarity: "rare" },
  { min: 15, rarity: "epic" },
  { min: 20, rarity: "legendary" },
  { min: 30, rarity: "mythical" },
  { min: CELESTIAL_STREAK_TIER_AT, rarity: "celestial" },
];

/** The rarity tier earned at this streak (common 0-4 … mythical 30-49, celestial 50+). */
export function streakRarity(streak: number): GatheringStreakRarity {
  let rarity: GatheringStreakRarity = "common";
  for (const tier of GATHERING_STREAK_RARITY_TIERS) {
    if (streak >= tier.min) rarity = tier.rarity;
  }
  return rarity;
}

/** Treasure-chest art per rarity, sorted humble -> arcane. Paths are public-relative. */
const STREAK_RARITY_CHEST_IMAGE: Record<GatheringStreakRarity, string> = {
  common: "gathering-art/reward-treasure-chest.webp",
  uncommon: "gathering-art/reward-treasure-seashell-coffer.webp",
  rare: "gathering-art/reward-treasure-terrarium-cache.webp",
  epic: "gathering-art/reward-treasure-geode-vault.webp",
  legendary: "gathering-art/reward-treasure-ice-strongbox.webp",
  mythical: "gathering-art/reward-treasure-wizard-satchel.webp",
  celestial: "gathering-art/reward-treasure-celestial-aurora.webp",
};

/** The treasure-chest art for a rarity tier. */
export function streakRarityChestImage(rarity: GatheringStreakRarity): string {
  return STREAK_RARITY_CHEST_IMAGE[rarity];
}

/** The treasure-chest art earned at this streak. */
export function streakChestImage(streak: number): string {
  return streakRarityChestImage(streakRarity(streak));
}

// --- State transition ------------------------------------------------------

/**
 * Advance the streak for one answer. A correct answer increments and records the
 * tick time; the first wrong answer resets `current` to 0, banks `longest`, and
 * stamps `lastBrokenAtMs` (only when there was a streak to lose, so a miss at 0
 * doesn't re-trigger the shatter). Pure — the caller persists the result.
 */
export function advanceGatheringStreak(
  streak: AlchemistGuildGatheringStreak,
  correct: boolean,
  reviewedAtMs: number,
): AlchemistGuildGatheringStreak {
  if (correct) {
    const current = streak.current + 1;
    return {
      current,
      lastBrokenAtMs: streak.lastBrokenAtMs,
      lastIncrementAtMs: reviewedAtMs,
      longest: Math.max(streak.longest, current),
    };
  }

  return {
    current: 0,
    lastBrokenAtMs: streak.current > 0 ? reviewedAtMs : streak.lastBrokenAtMs,
    lastIncrementAtMs: streak.lastIncrementAtMs,
    longest: Math.max(streak.longest, streak.current),
  };
}

// --- Audio cues ------------------------------------------------------------
// Which streak sound a single answer should fire (the caller maps these to the
// real SoundIds + plays them). Sound-agnostic on purpose so this module never
// depends on the audio layer:
//   - ignite:    the streak just went "hot" at the first bonus tier (5)
//   - milestone: the streak crossed a higher rarity band (10/15/20/30)
//   - increment: an ordinary climbing tick (pitched up via the helper below)
//   - break:     a wrong answer that cost a real streak
export type GatheringStreakSoundEvent = "ignite" | "milestone" | "increment" | "break";

export function resolveGatheringStreakSoundEvent(
  beforeCurrent: number,
  correct: boolean,
): GatheringStreakSoundEvent | null {
  if (!correct) return beforeCurrent > 0 ? "break" : null;
  const next = beforeCurrent + 1;
  if (next === STREAK_FIRST_BONUS_AT) return "ignite";
  if (
    GATHERING_STREAK_RARITY_TIERS.some(
      (tier) => tier.min > STREAK_FIRST_BONUS_AT && tier.min === next,
    )
  ) {
    return "milestone";
  }
  return "increment";
}

// Absolute detune (cents) for the increment tick so its pitch climbs with the
// streak — a rising "answer, answer, answer" ladder. Capped so a marathon run
// never shrieks. 100 cents = one semitone.
export function gatheringStreakIncrementDetuneCents(current: number): number {
  return Math.min(800, -200 + Math.max(0, current) * 60);
}
