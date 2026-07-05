import * as z from "zod";

// Pure scoring for Orbit Forge — the tap-timing crafting mini-game. Everything
// here is deterministic and unit-tested; the Pixi ring + overlay are thin
// presentation layers that feed taps in and read a ForgeRoundResult out.
//
// A tap is judged by its ABSOLUTE ANGULAR ERROR from the gate centerline (the
// reduced-motion Pulse Gate judges by TIME error instead — same tier ladder).
// Degrees, not milliseconds, keep judging framerate-independent on a 120Hz iPad.
// Each tap's tier maps to a "syllable index" 0-4 (higher = rarer) — the exact
// array the emergent craft already consumes. The best N of the 8 taps feed the
// recipe's N ingredients, so a flawless run forges the top tier.

export const ForgeTapTierSchema = z.enum(["perfect", "great", "good", "graze"]);
export type ForgeTapTier = z.infer<typeof ForgeTapTierSchema>;

/** Always eight taps — the round is fixed-length; extra taps are best-of insurance. */
export const FORGE_HITS_TOTAL = 8;

/** Per-tap orbit speed (deg/sec). Taps 1-2 are a gentle tutorial; the rest ramp. */
export const FORGE_TAP_SPEEDS_DEG_PER_SEC = [90, 90, 110, 130, 150, 165, 185, 200] as const;

// Degree bands from the gate centerline (the moving-comet game).
const FORGE_DEG_BANDS = { perfect: 9, great: 14, good: 22 } as const;
// Time bands in ms from the green-core center (the reduced-motion Pulse Gate).
const FORGE_MS_BANDS = { perfect: 70, great: 150, good: 260 } as const;
// Assist (on by default for young kids) widens every window.
export const FORGE_ASSIST_MULTIPLIER = 1.4;

const FORGE_TIER_SYLLABLE_INDEX: Record<ForgeTapTier, number> = {
  perfect: 4,
  great: 3,
  good: 2,
  graze: 0,
};

function classify(
  error: number,
  bands: { perfect: number; great: number; good: number },
  assist: boolean,
): ForgeTapTier {
  const scale = assist ? FORGE_ASSIST_MULTIPLIER : 1;
  const magnitude = Math.abs(error);
  if (magnitude <= bands.perfect * scale) return "perfect";
  if (magnitude <= bands.great * scale) return "great";
  if (magnitude <= bands.good * scale) return "good";
  return "graze";
}

/** Tier for a tap, by angular error (deg) from the gate centerline. */
export function classifyForgeTapByDegrees(deltaDeg: number, assist = true): ForgeTapTier {
  return classify(deltaDeg, FORGE_DEG_BANDS, assist);
}

/** Tier for a tap, by time error (ms) from the green-core center (Pulse Gate). */
export function classifyForgeTapByTime(deltaMs: number, assist = true): ForgeTapTier {
  return classify(deltaMs, FORGE_MS_BANDS, assist);
}

/** The syllable index (0-4, higher = rarer) a tier contributes to the craft. */
export function forgeTierSyllableIndex(tier: ForgeTapTier): number {
  return FORGE_TIER_SYLLABLE_INDEX[tier];
}

/**
 * Kid-fairness: the FIRST graze of a round is auto-rescued to a GOOD so a single
 * twitch never tanks an otherwise great run. Returns the effective tier and
 * whether the one-per-round safety was spent.
 */
export function applyForgeSafetyRetap(
  tier: ForgeTapTier,
  safetyAlreadyUsed: boolean,
): { tier: ForgeTapTier; safetyUsed: boolean } {
  if (tier === "graze" && !safetyAlreadyUsed) return { safetyUsed: true, tier: "good" };
  return { safetyUsed: safetyAlreadyUsed, tier };
}

/**
 * Map the round's tap tiers onto a recipe's N ingredients by taking the best N
 * syllable indexes — skill is rewarded and the spare taps on a small craft are
 * insurance. Returns exactly `ingredientCount` indexes, descending.
 */
export function aggregateForgeSyllableIndexes(
  tiers: readonly ForgeTapTier[],
  ingredientCount: number,
): number[] {
  return tiers
    .map(forgeTierSyllableIndex)
    .sort((a, b) => b - a)
    .slice(0, ingredientCount);
}

export const ForgeRoundResultSchema = z.object({
  success: z.boolean(),
  syllableIndexes: z.array(z.int().min(0).max(4)).min(2).max(5),
});
export type ForgeRoundResult = z.infer<typeof ForgeRoundResultSchema>;

/**
 * Resolve a finished round into the craft outcome. SUCCESS is kind: a single
 * non-graze tap (index >= 2) crafts something — only a true no-show (every tap a
 * graze) fails, and on failure the caller returns the ingredients. The rarity is
 * carried entirely by the best-N syllable indexes.
 */
export function resolveForgeRound(
  tiers: readonly ForgeTapTier[],
  ingredientCount: number,
): ForgeRoundResult {
  const syllableIndexes = aggregateForgeSyllableIndexes(tiers, ingredientCount);
  const success = syllableIndexes.some((index) => index >= 2);
  return { success, syllableIndexes };
}
