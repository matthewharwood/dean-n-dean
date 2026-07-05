import {
  type AlchemistGuildGatheringElementType,
  type GatheringEnemy,
  getGatheringEnemyForRound,
} from "@dean-stack/schemas";

// Gathering combat's elemental counter wheel. Pure + leaf (no imports from the
// loop/UI) so the loop and the board can both depend on it without a cycle.
//
//   lightning  beats  water     (electrocute)
//   water      beats  fire      (douse)
//   fire       beats  nature    (scorch)
//   nature     beats  stone     (root-crack)
//   stone      beats  lightning (ground)
//
// The matchup is surfaced on the enemy and attack cards so the kid sees the
// weakness and exact damage before spending the attack.

export type GatheringElementType = AlchemistGuildGatheringElementType;

/** What each element is strong against (the type it deals bonus damage to). */
const GATHERING_ELEMENT_BEATS: Record<GatheringElementType, GatheringElementType> = {
  lightning: "water",
  fire: "nature",
  nature: "stone",
  stone: "lightning",
  water: "fire",
};

type GatheringElementEffectiveness = "counter" | "neutral";

/** Damage multipliers for each matchup outcome. */
export const GATHERING_ELEMENT_COUNTER_MULTIPLIER = 1.5;

/**
 * How an attacking element fares against a defending (enemy) element:
 * `counter` when the attack beats the enemy, `neutral` otherwise. There is no
 * hidden resistance penalty; misses are learning friction enough.
 */
export function gatheringElementEffectiveness(
  attack: GatheringElementType,
  enemy: GatheringElementType,
): GatheringElementEffectiveness {
  return GATHERING_ELEMENT_BEATS[attack] === enemy ? "counter" : "neutral";
}

/** The damage multiplier for a matchup outcome. */
export function gatheringElementDamageMultiplier(
  effectiveness: GatheringElementEffectiveness,
): number {
  return effectiveness === "counter" ? GATHERING_ELEMENT_COUNTER_MULTIPLIER : 1;
}

/**
 * Apply the elemental matchup to a base attack damage. Rounds to a whole point so
 * the HP bar and damage floater stay integer-clean.
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
 * The element that counters a given enemy type.
 */
export function gatheringCounterElementFor(enemy: GatheringElementType): GatheringElementType {
  const counter = Object.entries(GATHERING_ELEMENT_BEATS).find(([, loser]) => loser === enemy)?.[0];
  return (counter ?? "lightning") as GatheringElementType;
}

const GATHERING_ENEMY_TYPE_ELEMENTS: Readonly<Partial<Record<string, GatheringElementType>>> = {
  "astral current": "lightning",
  basalt: "stone",
  bioluminescence: "lightning",
  brine: "water",
  chitin: "nature",
  coral: "nature",
  crystal: "stone",
  current: "water",
  glass: "stone",
  gravity: "stone",
  kelp: "nature",
  magma: "fire",
  plasma: "fire",
  pressure: "water",
  sand: "stone",
  spore: "nature",
};

export function gatheringElementForEnemyType(enemyType: string): GatheringElementType {
  return GATHERING_ENEMY_TYPE_ELEMENTS[enemyType] ?? "water";
}

export function gatheringElementForEnemy(
  enemy: Pick<GatheringEnemy, "type">,
): GatheringElementType {
  return gatheringElementForEnemyType(enemy.type);
}

/**
 * Deterministic per-round enemy element. It derives from the code-owned bestiary
 * type, so a given enemy keeps the same element every lap.
 */
export function gatheringElementForRound(round: number): GatheringElementType {
  return gatheringElementForEnemy(getGatheringEnemyForRound(round).enemy);
}
