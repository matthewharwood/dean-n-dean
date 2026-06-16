import type { AlchemistGuildGatheringElementType } from "@dean-stack/schemas";

// Gathering combat's elemental rock-paper-scissors. Pure + leaf (no imports from
// the loop/UI) so the loop and the board can both depend on it without a cycle.
//
//   lightning  beats  water     (electrocute)
//   water      beats  nature    (flood)
//   nature     beats  lightning (grounds it)
//
// The matchup is deliberately NOT surfaced on the attack cards — only the enemy
// shows its type. The player discovers the counters by playing.

export type GatheringElementType = AlchemistGuildGatheringElementType;

/** What each element is strong against (the type it deals bonus damage to). */
const GATHERING_ELEMENT_BEATS: Record<GatheringElementType, GatheringElementType> = {
  lightning: "water",
  nature: "lightning",
  water: "nature",
};

type GatheringElementEffectiveness = "super" | "neutral" | "resisted";

/** Damage multipliers for each matchup outcome. */
export const GATHERING_ELEMENT_SUPER_MULTIPLIER = 1.5;
export const GATHERING_ELEMENT_RESIST_MULTIPLIER = 0.5;

/**
 * How an attacking element fares against a defending (enemy) element:
 * `super` when the attack beats the enemy, `resisted` when the enemy beats the
 * attack, `neutral` otherwise (including the mirror match).
 */
export function gatheringElementEffectiveness(
  attack: GatheringElementType,
  enemy: GatheringElementType,
): GatheringElementEffectiveness {
  if (GATHERING_ELEMENT_BEATS[attack] === enemy) return "super";
  if (GATHERING_ELEMENT_BEATS[enemy] === attack) return "resisted";
  return "neutral";
}

/** The damage multiplier for a matchup outcome. */
export function gatheringElementDamageMultiplier(
  effectiveness: GatheringElementEffectiveness,
): number {
  if (effectiveness === "super") return GATHERING_ELEMENT_SUPER_MULTIPLIER;
  if (effectiveness === "resisted") return GATHERING_ELEMENT_RESIST_MULTIPLIER;
  return 1;
}

/**
 * Apply the elemental matchup to a base attack damage. Always deals at least 1
 * (a resisted hit still chips the enemy) and rounds to a whole point so the HP
 * bar and damage floater stay integer-clean.
 */
export function applyGatheringElementalDamage(
  baseDamage: number,
  attack: GatheringElementType,
  enemy: GatheringElementType,
): { damage: number; effectiveness: GatheringElementEffectiveness } {
  const effectiveness = gatheringElementEffectiveness(attack, enemy);
  const scaled = baseDamage * gatheringElementDamageMultiplier(effectiveness);
  return { damage: Math.max(1, Math.round(scaled)), effectiveness };
}

/**
 * Deterministic per-round enemy element. Stable across reloads/laps (the bestiary
 * ladder length is a multiple of 3, so a given enemy keeps the same type every
 * lap — its identity stays learnable). Round 1 → water, matching the themed
 * "Tide Minnow" default monster.
 */
export function gatheringElementForRound(round: number): GatheringElementType {
  const order: readonly GatheringElementType[] = ["water", "lightning", "nature"];
  const index = (2 * round + 1) % order.length;
  // Index is always in range; the fallback satisfies noUncheckedIndexedAccess.
  return order[index] ?? "water";
}
