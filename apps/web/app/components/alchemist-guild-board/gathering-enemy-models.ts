// Which gathering enemies have a generated 3D model, and where it lives.
//
// Models are produced by `bun run scripts/tripo-enemy-model.ts <enemy-id>` (the
// Tripo3D P-Series pipeline) and saved to `apps/web/public/enemy-models/<id>.glb`.
// The monster card renders the GLB in place of the 2D portrait when the current
// enemy has a model; otherwise it falls back to the `enemies/<id>.webp` image.
//
// Poster VARIANTS: the bestiary escalates an enemy's art each time the ladder loops
// (`<id>_L1`, `_L2`, `_L3`), carried in the monster's `imagePath`. Models mirror
// that — drop `<id>_L<n>.glb` next to the base and add its basename below; the
// resolver prefers the exact variant and falls back to the base model.

// Available model basenames (base ids AND `_L<n>` variants). Add a basename here
// after importing/generating its `enemy-models/<basename>.glb`. Every bestiary enemy
// except `hadal-plasma-reef-lancer-echo` has a model; that one falls back to its 2D
// portrait until a `.glb` is added here.
const ENEMY_MODEL_BASENAMES = new Set<string>([
  "hadal-abyssal-fleetmind-echo",
  "hadal-basalt-lantern-leech-echo",
  "hadal-brine-needle-urchin-echo",
  "hadal-brineblade-reaver-echo",
  "hadal-chitin-scout-echo",
  "hadal-crystal-tide-oracle-echo",
  "hadal-ember-snail-echo",
  "hadal-glass-manta-echo",
  "hadal-glow-polyp-echo",
  "hadal-glow-polyp-echo_L1",
  "hadal-kelp-censer-echo",
  "hadal-orbital-siege-urchin-echo",
  "hadal-pressure-puff-echo",
  "hadal-pressure-wraith",
  "hadal-sandglass-stalker-echo",
  "hadal-silt-crawler-echo",
  "hadal-spark-shrimp-drone-echo",
  "hadal-starcurrent-seraph-echo",
  "hadal-tide-minnow-echo",
  "hadal-void-spore-sentinel-echo",
  "hadal-warpcoral-prism-echo",
]);

const ENEMY_IMAGE_PATH = /^enemies\/(.+)\.(?:webp|png)$/;
const POSTER_VARIANT_SUFFIX = /_L[1-3]$/;

// Resolve a monster's 3D model from its `imagePath` (which carries the variant
// suffix). Prefers the exact variant model, then the base enemy model, else null.
export function getGatheringEnemyModelPath(monsterImagePath: string): string | null {
  const basename = ENEMY_IMAGE_PATH.exec(monsterImagePath)?.[1];
  if (!basename) return null;
  if (ENEMY_MODEL_BASENAMES.has(basename)) return `enemy-models/${basename}.glb`;
  const baseId = basename.replace(POSTER_VARIANT_SUFFIX, "");
  if (ENEMY_MODEL_BASENAMES.has(baseId)) return `enemy-models/${baseId}.glb`;
  return null;
}
