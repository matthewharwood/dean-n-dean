import {
  GATHERING_STREAK_RARITY_TIERS,
  type GatheringStreakRarity,
  streakRarity,
} from "./gathering-streak";

// Shared visual tokens for the streak experience — consumed by both the streak
// meter (bright text/pips on a dark rarity-tinted panel) and the reward-card +N
// badge (a solid pill on a light card). Colors climb the classic rarity ladder
// (slate → emerald → sky → violet → amber → fuchsia) so a pre-reader feels the
// tier rise pre-literately. Tailwind classes only (Pillar 2 stays string-typed);
// arbitrary [text-shadow:…] values carry the per-rarity bloom.

export type GatheringStreakRarityStyle = {
  /** Human-readable tier name shown on the meter. */
  label: string;
  /** Bright number/label color for the meter (sits on the dark meter panel). */
  number: string;
  /** Text-shadow bloom behind the meter number, escalating with rarity. */
  glow: string;
  /** Filled-pip color on the meter's tier ladder. */
  pip: string;
  /** Rarity-tinted ring/border + ambient glow for the meter panel. */
  ring: string;
  /** Solid badge pill background (sits on a light reward card). */
  badgeBg: string;
  /** Badge pill text color. */
  badgeText: string;
  /** Badge pill ring. */
  badgeRing: string;
};

export const GATHERING_STREAK_RARITY_STYLE: Record<
  GatheringStreakRarity,
  GatheringStreakRarityStyle
> = {
  common: {
    label: "Common",
    number: "text-slate-100",
    glow: "[text-shadow:0_1px_0_rgba(15,23,42,0.55)]",
    pip: "bg-slate-300",
    ring: "ring-slate-400/40 shadow-[0_0_18px_rgba(148,163,184,0.25)]",
    badgeBg: "bg-slate-200",
    badgeText: "text-slate-900",
    badgeRing: "ring-slate-400/60",
  },
  uncommon: {
    label: "Uncommon",
    number: "text-emerald-200",
    glow: "[text-shadow:0_1px_0_rgba(6,46,33,0.7),0_0_12px_rgba(52,211,153,0.45)]",
    pip: "bg-emerald-400",
    ring: "ring-emerald-400/55 shadow-[0_0_22px_rgba(52,211,153,0.4)]",
    badgeBg: "bg-emerald-400",
    badgeText: "text-emerald-950",
    badgeRing: "ring-emerald-200",
  },
  rare: {
    label: "Rare",
    number: "text-sky-200",
    glow: "[text-shadow:0_1px_0_rgba(8,37,64,0.7),0_0_14px_rgba(56,189,248,0.5)]",
    pip: "bg-sky-400",
    ring: "ring-sky-400/55 shadow-[0_0_24px_rgba(56,189,248,0.45)]",
    badgeBg: "bg-sky-400",
    badgeText: "text-sky-950",
    badgeRing: "ring-sky-200",
  },
  epic: {
    label: "Epic",
    number: "text-violet-200",
    glow: "[text-shadow:0_1px_0_rgba(46,16,101,0.7),0_0_16px_rgba(167,139,250,0.55)]",
    pip: "bg-violet-400",
    ring: "ring-violet-400/60 shadow-[0_0_26px_rgba(167,139,250,0.5)]",
    badgeBg: "bg-violet-400",
    badgeText: "text-violet-950",
    badgeRing: "ring-violet-200",
  },
  legendary: {
    label: "Legendary",
    number: "text-amber-200",
    glow: "[text-shadow:0_1px_0_rgba(120,53,15,0.75),0_0_18px_rgba(251,191,36,0.6)]",
    pip: "bg-amber-400",
    ring: "ring-amber-400/65 shadow-[0_0_30px_rgba(251,191,36,0.55)]",
    badgeBg: "bg-amber-400",
    badgeText: "text-amber-950",
    badgeRing: "ring-amber-200",
  },
  mythical: {
    label: "Mythical",
    number: "text-fuchsia-200",
    glow: "[text-shadow:0_1px_0_rgba(74,4,78,0.8),0_0_22px_rgba(232,121,249,0.7)]",
    pip: "bg-fuchsia-400",
    ring: "ring-fuchsia-400/70 shadow-[0_0_36px_rgba(232,121,249,0.6)]",
    badgeBg: "bg-fuchsia-500",
    badgeText: "text-fuchsia-50",
    badgeRing: "ring-fuchsia-200",
  },
  // Beyond Mythical: an aurora that shimmers cyan into magenta. The strongest
  // bloom on the ladder, plus gradient pip/badge so the tier reads as "otherworldly".
  celestial: {
    label: "Celestial",
    number: "text-cyan-100",
    glow: "[text-shadow:0_1px_0_rgba(8,47,73,0.85),0_0_24px_rgba(34,211,238,0.8),0_0_34px_rgba(232,121,249,0.6)]",
    pip: "bg-gradient-to-r from-cyan-400 to-fuchsia-400",
    ring: "ring-cyan-300/80 shadow-[0_0_44px_rgba(34,211,238,0.6),0_0_48px_rgba(232,121,249,0.45)]",
    badgeBg: "bg-gradient-to-r from-cyan-400 to-fuchsia-500",
    badgeText: "text-white",
    badgeRing: "ring-cyan-100",
  },
};

/** The full visual token set for a rarity tier. */
export function gatheringStreakRarityStyle(
  rarity: GatheringStreakRarity,
): GatheringStreakRarityStyle {
  return GATHERING_STREAK_RARITY_STYLE[rarity];
}

/** The rarity tiers above Common — the meter's pip ladder (5/10/15/20/30). */
export const GATHERING_STREAK_TIER_PIPS = GATHERING_STREAK_RARITY_TIERS.filter(
  (tier) => tier.min > 0,
);

/** The next rarity tier above the current streak, or null once Celestial is reached. */
export function nextGatheringStreakTier(
  current: number,
): { min: number; rarity: GatheringStreakRarity } | null {
  return GATHERING_STREAK_TIER_PIPS.find((tier) => current < tier.min) ?? null;
}

/** The floor of the rarity band the streak currently sits in (0 for Common). */
function currentGatheringStreakTierMin(current: number): number {
  let min = 0;
  for (const tier of GATHERING_STREAK_RARITY_TIERS) {
    if (current >= tier.min) min = tier.min;
  }
  return min;
}

export type GatheringStreakMeterProgress = {
  rarity: GatheringStreakRarity;
  next: { min: number; rarity: GatheringStreakRarity } | null;
  /** 0..1 fill of the bar toward the next tier (1 once Mythical is reached). */
  fraction: number;
  /** Streaks still needed to reach the next tier (0 at the top band). */
  remaining: number;
};

/**
 * Progress of the meter bar toward the next rarity tier — pure so the visual
 * stays a thin reader of this. The bar fills across the current band
 * (e.g. 7 with bands at 5→10 reads 2/5 = 0.4), and `remaining` powers the
 * "3 to RARE" caption. At the top band the bar is full and there is no next.
 */
export function gatheringStreakMeterProgress(current: number): GatheringStreakMeterProgress {
  const rarity = streakRarity(current);
  const next = nextGatheringStreakTier(current);
  if (!next) return { rarity, next: null, fraction: 1, remaining: 0 };

  const prevMin = currentGatheringStreakTierMin(current);
  const span = next.min - prevMin;
  const fraction = span > 0 ? (current - prevMin) / span : 1;
  return {
    rarity,
    next,
    fraction: Math.min(1, Math.max(0, fraction)),
    remaining: Math.max(0, next.min - current),
  };
}
