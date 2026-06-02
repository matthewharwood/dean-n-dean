import * as z from "zod";

// Ocean-trench bestiary for the gathering mini-game. Code-owned (not IDB-persisted),
// parsed once at module load. Order IS the cycle order: the gathering tab walks this
// ladder one enemy per defeated round (tier 1 -> 4, rarity common -> mythic within a
// tier), then loops back to the start. Each loop escalates the enemy's poster variant
// (_L1 -> _L2 -> _L3, capped at the variants that exist for that enemy). HP values
// mirror the source bestiary and give a rough difficulty ramp.
export const GATHERING_ENEMY_RARITIES = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
  "mythic",
] as const;
export const GatheringEnemyRaritySchema = z.enum(GATHERING_ENEMY_RARITIES);
export type GatheringEnemyRarity = z.infer<typeof GatheringEnemyRaritySchema>;

export const GatheringEnemyIdSchema = z.string().regex(/^[a-z0-9-]+$/);

export const GatheringEnemySchema = z.object({
  id: GatheringEnemyIdSchema,
  name: z.string().min(1),
  type: z.string().min(1),
  rarity: GatheringEnemyRaritySchema,
  tier: z.int().min(1).max(4),
  maxHp: z.int().min(1),
  // How many `_L<n>` poster variants exist on disk for this enemy (beyond the base).
  variantCount: z.int().min(0).max(3),
});
export type GatheringEnemy = z.infer<typeof GatheringEnemySchema>;

const enemy = (
  tier: number,
  id: string,
  name: string,
  type: string,
  rarity: GatheringEnemyRarity,
  maxHp: number,
  variantCount: number,
): GatheringEnemy =>
  GatheringEnemySchema.parse({ id, maxHp, name, rarity, tier, type, variantCount });

export const ALCHEMY_GATHERING_ENEMIES: readonly GatheringEnemy[] = [
  // ── Tier 1 ──
  enemy(1, "hadal-tide-minnow-echo", "Tide Minnow Echo", "current", "common", 10, 3),
  enemy(1, "hadal-pressure-puff-echo", "Pressure Puff Echo", "pressure", "uncommon", 28, 3),
  enemy(1, "hadal-glow-polyp-echo", "Glow Polyp Echo", "bioluminescence", "rare", 12, 3),
  enemy(1, "hadal-silt-crawler-echo", "Silt Crawler Echo", "sand", "epic", 28, 3),
  enemy(1, "hadal-ember-snail-echo", "Ember Snail Echo", "magma", "legendary", 44, 3),
  enemy(1, "hadal-pressure-wraith", "Hadal Pressure Wraith", "pressure", "mythic", 42, 3),
  // ── Tier 2 ──
  enemy(2, "hadal-glass-manta-echo", "Glass Manta Echo", "glass", "common", 14, 3),
  enemy(
    2,
    "hadal-brine-needle-urchin-echo",
    "Brine Needle Urchin Echo",
    "brine",
    "uncommon",
    24,
    3,
  ),
  enemy(2, "hadal-basalt-lantern-leech-echo", "Basalt Lantern Leech Echo", "basalt", "rare", 27, 3),
  enemy(2, "hadal-sandglass-stalker-echo", "Sandglass Stalker Echo", "sand", "epic", 36, 3),
  enemy(2, "hadal-kelp-censer-echo", "Kelp Censer Echo", "kelp", "legendary", 60, 3),
  // ── Tier 3 ──
  enemy(3, "hadal-spark-shrimp-drone-echo", "Spark Shrimp Drone Echo", "current", "common", 18, 2),
  enemy(
    3,
    "hadal-crystal-tide-oracle-echo",
    "Crystal Tide Oracle Echo",
    "crystal",
    "uncommon",
    22,
    2,
  ),
  enemy(3, "hadal-brineblade-reaver-echo", "Brineblade Reaver Echo", "brine", "rare", 26, 2),
  enemy(3, "hadal-void-spore-sentinel-echo", "Void Spore Sentinel Echo", "spore", "epic", 30, 2),
  enemy(
    3,
    "hadal-starcurrent-seraph-echo",
    "Starcurrent Seraph Echo",
    "astral current",
    "legendary",
    36,
    2,
  ),
  // ── Tier 4 ──
  enemy(4, "hadal-chitin-scout-echo", "Chitin Scout Echo", "chitin", "common", 12, 2),
  enemy(4, "hadal-warpcoral-prism-echo", "Warpcoral Prism Echo", "coral", "uncommon", 18, 2),
  enemy(4, "hadal-plasma-reef-lancer-echo", "Plasma Reef Lancer Echo", "plasma", "rare", 24, 2),
  enemy(
    4,
    "hadal-orbital-siege-urchin-echo",
    "Orbital Siege Urchin Echo",
    "gravity",
    "epic",
    30,
    2,
  ),
  enemy(4, "hadal-abyssal-fleetmind-echo", "Abyssal Fleetmind Echo", "pressure", "mythic", 36, 2),
];

export const GATHERING_ENEMY_LADDER_LENGTH = ALCHEMY_GATHERING_ENEMIES.length;

export type GatheringEnemyEncounter = {
  enemy: GatheringEnemy;
  loop: number;
};

// Map a 1-based round to its ladder position: which enemy you face and how many full
// loops of the ladder have completed (the loop count drives poster-variant escalation).
export function getGatheringEnemyForRound(round: number): GatheringEnemyEncounter {
  const ladderPosition = Math.max(0, Math.floor(round) - 1);
  const index = ladderPosition % GATHERING_ENEMY_LADDER_LENGTH;
  const loop = Math.floor(ladderPosition / GATHERING_ENEMY_LADDER_LENGTH);
  const selected = ALCHEMY_GATHERING_ENEMIES[index];
  if (!selected) throw new Error("Gathering bestiary is empty");
  return { enemy: selected, loop };
}

// Public asset path for an enemy at a given loop: base art on loop 0, then the
// `_L<variant>` poster variant, clamped to the variants that exist for that enemy.
export function getGatheringEnemyImagePath(enemyEntry: GatheringEnemy, loop: number): string {
  const variant = Math.min(Math.max(loop, 0), enemyEntry.variantCount);
  return variant === 0
    ? `enemies/${enemyEntry.id}.webp`
    : `enemies/${enemyEntry.id}_L${variant}.webp`;
}
