import * as z from "zod";

// Pure presentation logic for the floating "-N" damage number that pops off the
// enemy health bar when it takes a hit (juice — see GatheringDamageFloater in
// index.tsx). Kept in its own module so the magnitude → tier mapping is unit
// testable without a DOM; the anime.js arc + Tailwind styling live at the call
// site. Tiers escalate physical bigness + warmth so a pre-reader feels how hard
// a hit landed: amber → orange → hot-gold. Colors stay in the gold family and
// never red — red is already owned by the existing hit vignette.

export const GatheringDamageFloaterTierSchema = z.enum(["normal", "big", "crit"]);
export type GatheringDamageFloaterTier = z.infer<typeof GatheringDamageFloaterTierSchema>;

// A hit landing >= 30% of the enemy's max HP reads as a chunky "big" hit; >= 50%
// (or any genuinely large absolute hit) reads as a "crit". The absolute floor
// promotes high-damage hits on tanky enemies that would never clear the ratio
// gate — a 12-damage strike on a 60 HP boss is only 0.2 of its bar but still
// lands like a crit.
const GATHERING_DAMAGE_BIG_RATIO = 0.3;
const GATHERING_DAMAGE_CRIT_RATIO = 0.5;
const GATHERING_DAMAGE_CRIT_ABSOLUTE = 12;

// Resolve the visual tier for a hit. `lethal` (the hit drops the enemy to 0 HP)
// always crits — the killing blow is emotionally always a crit and gets the
// loudest, highest-flying, "-N!" treatment as the fight's payoff.
export function resolveGatheringDamageFloaterTier(
  amount: number,
  maxHp: number,
  lethal = false,
): GatheringDamageFloaterTier {
  if (lethal || amount >= GATHERING_DAMAGE_CRIT_ABSOLUTE) return "crit";
  const ratio = maxHp > 0 ? amount / maxHp : 0;
  if (ratio >= GATHERING_DAMAGE_CRIT_RATIO) return "crit";
  if (ratio >= GATHERING_DAMAGE_BIG_RATIO) return "big";
  return "normal";
}

// The on-screen label. Only crits earn the trailing "!" so it stays a rare,
// special, parent-showable badge rather than punctuation on every tap.
export function formatGatheringDamageFloaterLabel(
  amount: number,
  tier: GatheringDamageFloaterTier,
): string {
  return tier === "crit" ? `-${amount}!` : `-${amount}`;
}
