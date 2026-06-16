import * as z from "zod";

import { AlchemyQuestIdSchema } from "./data/alchemy-quests";
import { AlchemyCardIdSchema, AlchemyRecipeIdSchema } from "./data/alchemy-recipes";
import { ExtendedMoleculeRecipeIdSchema } from "./data/extended-molecule-recipes";

export * from "./adding-game";
export * from "./data";

// Pillar 3 contract — every IDB-backed schema declares its zero via `.default()`
// on each defaultable field, and exports a named `<NAME>_DEFAULT` companion when
// the entire shape is defaultable. atomWithIDB consumers import the companion
// instead of inlining a literal — single source of truth for the zero.

export const ScoreSchema = z.object({
  player: z.string().min(1),
  value: z.int().min(0),
});
export type Score = z.infer<typeof ScoreSchema>;

export const SettingsSchema = z.object({
  id: z.literal("settings").default("settings"),
  theme: z.enum(["light", "dark"]).default("light"),
  reducedMotion: z.boolean().default(false),
});
export type Settings = z.infer<typeof SettingsSchema>;
export const SETTINGS_DEFAULT: Settings = SettingsSchema.parse({});

// `id` is caller-supplied (per-level), so there is no fully-defaulted PROGRESS_DEFAULT.
// Callers construct via `ProgressSchema.parse({ id })` — same parse path, same source of truth.
export const ProgressSchema = z.object({
  id: z.string().min(1),
  level: z.int().min(1).default(1),
  completed: z.boolean().default(false),
});
export type Progress = z.infer<typeof ProgressSchema>;

export const ALCHEMIST_GUILD_BOARD_ID = "alchemist-guild-board";
export const ALCHEMIST_GUILD_FIRST_WATER_QUEST_ID = "quest:first-water";
export const ALCHEMIST_GUILD_FIRST_WATER_DELIVERY_CARD_ID = "material:water";

export const AlchemistGuildReagentSlotIdSchema = z.enum([
  "reagent-slot-1",
  "reagent-slot-2",
  "reagent-slot-3",
  "reagent-slot-4",
  "reagent-slot-5",
]);
export type AlchemistGuildReagentSlotId = z.infer<typeof AlchemistGuildReagentSlotIdSchema>;

export const AlchemistGuildCardIdSchema = AlchemyCardIdSchema;
export type AlchemistGuildCardId = z.infer<typeof AlchemistGuildCardIdSchema>;

export const ALCHEMIST_GUILD_EMERGENT_RECIPE_RARITIES = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
  "mythical",
] as const;
export const AlchemistGuildEmergentRecipeRaritySchema = z.enum(
  ALCHEMIST_GUILD_EMERGENT_RECIPE_RARITIES,
);
export type AlchemistGuildEmergentRecipeRarity = z.infer<
  typeof AlchemistGuildEmergentRecipeRaritySchema
>;

export const AlchemistGuildEmergentRecipeSchema = z
  .object({
    count: z.int().min(1).default(1),
    firstDiscoveredAtMs: z.number().min(0),
    formula: z.string().min(1),
    id: z.string().regex(/^emergent:[a-z0-9-]+$/),
    ingredientCardIds: z.array(AlchemistGuildCardIdSchema).min(2).max(5),
    lastDiscoveredAtMs: z.number().min(0),
    name: z.string().min(1).max(48),
    rarity: AlchemistGuildEmergentRecipeRaritySchema,
    syllableIndexes: z.array(z.int().min(0).max(4)).min(2).max(5),
    syllables: z
      .array(z.string().regex(/^[a-z]{2,5}$/))
      .min(2)
      .max(5),
  })
  .superRefine((recipe, ctx) => {
    if (recipe.syllables.length !== recipe.ingredientCardIds.length) {
      ctx.addIssue({
        code: "custom",
        message: "Emergent recipe syllables must line up with ingredient cards.",
        path: ["syllables"],
      });
    }
    if (recipe.syllableIndexes.length !== recipe.ingredientCardIds.length) {
      ctx.addIssue({
        code: "custom",
        message: "Emergent recipe syllable indexes must line up with ingredient cards.",
        path: ["syllableIndexes"],
      });
    }
  });
export type AlchemistGuildEmergentRecipe = z.infer<typeof AlchemistGuildEmergentRecipeSchema>;

export const ALCHEMIST_GUILD_STARTING_ELEMENT_QUANTITIES = {
  "element:h": 2,
  "element:o": 1,
} as const satisfies Readonly<Record<string, number>>;

export const ALCHEMIST_GUILD_STARTING_DISCOVERED_ELEMENT_IDS = ["element:h", "element:o"] as const;

export const AlchemistGuildElementQuantitiesSchema = z
  .record(AlchemistGuildCardIdSchema, z.int().min(0))
  .default(ALCHEMIST_GUILD_STARTING_ELEMENT_QUANTITIES);
export type AlchemistGuildElementQuantities = z.infer<typeof AlchemistGuildElementQuantitiesSchema>;

export const AlchemistGuildBoardSlotsSchema = z.object({
  "reagent-slot-1": AlchemistGuildCardIdSchema.nullable().default(null),
  "reagent-slot-2": AlchemistGuildCardIdSchema.nullable().default(null),
  "reagent-slot-3": AlchemistGuildCardIdSchema.nullable().default(null),
  "reagent-slot-4": AlchemistGuildCardIdSchema.nullable().default(null),
  "reagent-slot-5": AlchemistGuildCardIdSchema.nullable().default(null),
});
export type AlchemistGuildBoardSlots = z.infer<typeof AlchemistGuildBoardSlotsSchema>;

export const ALCHEMIST_GUILD_BOARD_SLOTS_DEFAULT: AlchemistGuildBoardSlots =
  AlchemistGuildBoardSlotsSchema.parse({});

export const AlchemistGuildInventorySlotIdSchema = z.enum([
  "inventory-slot-1",
  "inventory-slot-2",
  "inventory-slot-3",
  "inventory-slot-4",
  "inventory-slot-5",
  "inventory-slot-6",
  "inventory-slot-7",
  "inventory-slot-8",
]);
export type AlchemistGuildInventorySlotId = z.infer<typeof AlchemistGuildInventorySlotIdSchema>;

export const AlchemistGuildInventoryCooldownSchema = z.object({
  id: z.string().min(1),
  readyAtMs: z.number().min(0),
  startedAtMs: z.number().min(0),
});
export type AlchemistGuildInventoryCooldown = z.infer<typeof AlchemistGuildInventoryCooldownSchema>;

export const AlchemistGuildInventoryItemSchema = z.object({
  cardId: AlchemistGuildCardIdSchema,
  cooldowns: z.array(AlchemistGuildInventoryCooldownSchema).default([]),
});
export type AlchemistGuildInventoryItem = z.infer<typeof AlchemistGuildInventoryItemSchema>;

export const AlchemistGuildInventorySlotsSchema = z.object({
  "inventory-slot-1": AlchemistGuildInventoryItemSchema.nullable().default(null),
  "inventory-slot-2": AlchemistGuildInventoryItemSchema.nullable().default(null),
  "inventory-slot-3": AlchemistGuildInventoryItemSchema.nullable().default(null),
  "inventory-slot-4": AlchemistGuildInventoryItemSchema.nullable().default(null),
  "inventory-slot-5": AlchemistGuildInventoryItemSchema.nullable().default(null),
  "inventory-slot-6": AlchemistGuildInventoryItemSchema.nullable().default(null),
  "inventory-slot-7": AlchemistGuildInventoryItemSchema.nullable().default(null),
  "inventory-slot-8": AlchemistGuildInventoryItemSchema.nullable().default(null),
});
export type AlchemistGuildInventorySlots = z.infer<typeof AlchemistGuildInventorySlotsSchema>;

export const ALCHEMIST_GUILD_INVENTORY_SLOTS_DEFAULT: AlchemistGuildInventorySlots =
  AlchemistGuildInventorySlotsSchema.parse({});

export const AlchemistGuildProfileSchema = z.object({
  discoveryTokens: z.int().min(0).default(0),
  gold: z.int().min(0).default(0),
  knowledgeXp: z.int().min(0).default(0),
  level: z.int().min(1).default(1),
  muddlefogCleared: z.int().min(0).max(100).default(0),
  playerName: z.string().trim().min(1).max(24).default("Apprentice"),
});
export type AlchemistGuildProfile = z.infer<typeof AlchemistGuildProfileSchema>;

export const ALCHEMIST_GUILD_PROFILE_DEFAULT: AlchemistGuildProfile =
  AlchemistGuildProfileSchema.parse({});

export const AlchemistGuildQuestDeliverySchema = z.object({
  cardId: AlchemistGuildCardIdSchema,
  delivered: z.int().min(0).default(0),
  required: z.int().min(1),
});
export type AlchemistGuildQuestDelivery = z.infer<typeof AlchemistGuildQuestDeliverySchema>;

export const ALCHEMIST_GUILD_FIRST_WATER_DELIVERY_DEFAULT = {
  cardId: ALCHEMIST_GUILD_FIRST_WATER_DELIVERY_CARD_ID,
  delivered: 0,
  required: 1,
} satisfies AlchemistGuildQuestDelivery;

export const AlchemistGuildQuestDeliveriesSchema = z
  .record(AlchemyQuestIdSchema, AlchemistGuildQuestDeliverySchema)
  .default({
    [ALCHEMIST_GUILD_FIRST_WATER_QUEST_ID]: ALCHEMIST_GUILD_FIRST_WATER_DELIVERY_DEFAULT,
  });
export type AlchemistGuildQuestDeliveries = z.infer<typeof AlchemistGuildQuestDeliveriesSchema>;

export const ALCHEMIST_GUILD_QUEST_DELIVERIES_DEFAULT: AlchemistGuildQuestDeliveries =
  AlchemistGuildQuestDeliveriesSchema.parse({});

export const ALCHEMIST_GUILD_BOARD_MODE_TABS = [
  "crafting",
  "gathering",
  "expedition",
  "upgrades",
] as const;
export const AlchemistGuildBoardModeSchema = z.enum(ALCHEMIST_GUILD_BOARD_MODE_TABS);
export type AlchemistGuildBoardMode = z.infer<typeof AlchemistGuildBoardModeSchema>;

export const AlchemistGuildGatheringPhaseSchema = z.enum(["solving", "move", "reward"]);
export type AlchemistGuildGatheringPhase = z.infer<typeof AlchemistGuildGatheringPhaseSchema>;

export const AlchemistGuildGatheringEquationSchema = z.object({
  answer: z.int().min(0).max(40).default(9),
  choiceValues: z.array(z.int().min(0).max(40)).length(5).default([11, 8, 10, 12, 9]),
  factId: z
    .string()
    .regex(/^addition:\d+\+\d+$/)
    .default("addition:4+5"),
  id: z.string().min(1).default("gathering-equation:1:1"),
  left: z.int().min(0).max(20).default(5),
  right: z.int().min(0).max(20).default(4),
  selectedValue: z.int().min(0).max(40).nullable().default(null),
});
export type AlchemistGuildGatheringEquation = z.infer<typeof AlchemistGuildGatheringEquationSchema>;
export const ALCHEMIST_GUILD_GATHERING_EQUATION_DEFAULT: AlchemistGuildGatheringEquation =
  AlchemistGuildGatheringEquationSchema.parse({});

// Gathering combat is a 3-way elemental rock-paper-scissors. Each enemy carries
// one type (shown on its card); the player's three attacks are typed too, but the
// counter is left for the player to discover by playing. lightning/water/nature.
export const ALCHEMIST_GUILD_GATHERING_ELEMENT_TYPES = ["lightning", "water", "nature"] as const;
export const AlchemistGuildGatheringElementTypeSchema = z.enum(
  ALCHEMIST_GUILD_GATHERING_ELEMENT_TYPES,
);
export type AlchemistGuildGatheringElementType = z.infer<
  typeof AlchemistGuildGatheringElementTypeSchema
>;

export const AlchemistGuildGatheringMonsterSchema = z.object({
  // The enemy's elemental type, defaulting to the themed round-1 "Tide Minnow"
  // (water). Pre-element saves heal to this default on hydration's re-parse and
  // get a real per-round type the next time the loop advances a round.
  elementType: AlchemistGuildGatheringElementTypeSchema.default("water"),
  hp: z.int().min(0).default(10),
  id: z
    .string()
    .regex(/^monster:[a-z0-9-]+$/)
    .default("monster:hadal-tide-minnow-echo"),
  // Enemies cycle through a code-owned bestiary; the gathering loop derives the
  // monster from the round. PNG-era saves heal to the committed WebP art (same
  // basename) on hydration's re-parse.
  imagePath: z
    .string()
    .regex(/^enemies\/[a-z0-9-]+\.(?:webp|png)$/)
    .transform((path) => (path.endsWith(".png") ? path.replace(".png", ".webp") : path))
    .default("enemies/hadal-tide-minnow-echo.webp"),
  maxHp: z.int().min(1).default(10),
  name: z.string().min(1).default("Tide Minnow Echo"),
});
export type AlchemistGuildGatheringMonster = z.infer<typeof AlchemistGuildGatheringMonsterSchema>;
export const ALCHEMIST_GUILD_GATHERING_MONSTER_DEFAULT: AlchemistGuildGatheringMonster =
  AlchemistGuildGatheringMonsterSchema.parse({});

export const AlchemistGuildGatheringLogEntrySchema = z.object({
  cardId: AlchemistGuildCardIdSchema,
  collectedAtMs: z.number().min(0),
  id: z.string().min(1),
  round: z.int().min(1),
});
export type AlchemistGuildGatheringLogEntry = z.infer<typeof AlchemistGuildGatheringLogEntrySchema>;

export const AlchemistGuildGatheringReviewResultSchema = z.enum(["correct", "wrong"]);
export type AlchemistGuildGatheringReviewResult = z.infer<
  typeof AlchemistGuildGatheringReviewResultSchema
>;

export const AlchemistGuildGatheringSpacedRepetitionFactSchema = z.object({
  attempts: z.int().min(0).default(0),
  correctCount: z.int().min(0).default(0),
  currentStreak: z.int().min(0).default(0),
  difficulty: z.number().min(1).max(10).default(5),
  dueAtMs: z.number().min(0).default(0),
  id: z.string().regex(/^addition:\d+\+\d+$/),
  lapses: z.int().min(0).default(0),
  lastResult: AlchemistGuildGatheringReviewResultSchema.nullable().default(null),
  lastReviewedAtMs: z.number().min(0).nullable().default(null),
  lastRetrievability: z.number().min(0).max(1).default(1),
  left: z.int().min(0).max(20),
  longestStreak: z.int().min(0).default(0),
  right: z.int().min(0).max(20),
  stabilityDays: z.number().min(0).max(365).default(0),
  wrongCount: z.int().min(0).default(0),
});
export type AlchemistGuildGatheringSpacedRepetitionFact = z.infer<
  typeof AlchemistGuildGatheringSpacedRepetitionFactSchema
>;

export const AlchemistGuildGatheringSpacedRepetitionSchema = z.object({
  facts: z
    .record(
      z.string().regex(/^addition:\d+\+\d+$/),
      AlchemistGuildGatheringSpacedRepetitionFactSchema,
    )
    .default({}),
  lastUpdatedAtMs: z.number().min(0).nullable().default(null),
});
export type AlchemistGuildGatheringSpacedRepetition = z.infer<
  typeof AlchemistGuildGatheringSpacedRepetitionSchema
>;
export const ALCHEMIST_GUILD_GATHERING_SPACED_REPETITION_DEFAULT: AlchemistGuildGatheringSpacedRepetition =
  AlchemistGuildGatheringSpacedRepetitionSchema.parse({});

export const AlchemistGuildGatheringLevelProgressSchema = z.object({
  completedBossLevels: z.array(z.int().min(1).max(2)).default([]),
  currentLevel: z.int().min(1).max(2).default(1),
  highestUnlockedLevel: z.int().min(1).max(2).default(1),
  masteryProgressByLevel: z
    .record(z.string().regex(/^[1-2]$/), z.number().min(0).max(1))
    .default({}),
});
export type AlchemistGuildGatheringLevelProgress = z.infer<
  typeof AlchemistGuildGatheringLevelProgressSchema
>;
export const ALCHEMIST_GUILD_GATHERING_LEVEL_PROGRESS_DEFAULT: AlchemistGuildGatheringLevelProgress =
  AlchemistGuildGatheringLevelProgressSchema.parse({});

export const AlchemistGuildGatheringBossPhaseSchema = z.enum([
  "idle",
  "active",
  "reward",
  "failed",
]);
export type AlchemistGuildGatheringBossPhase = z.infer<
  typeof AlchemistGuildGatheringBossPhaseSchema
>;

export const AlchemistGuildGatheringBossStateSchema = z.object({
  completedAtMs: z.number().min(0).nullable().default(null),
  currentStreak: z.int().min(0).max(20).default(0),
  equation: AlchemistGuildGatheringEquationSchema.default(
    ALCHEMIST_GUILD_GATHERING_EQUATION_DEFAULT,
  ),
  failedAtMs: z.number().min(0).nullable().default(null),
  lastAnswerCorrect: z.boolean().nullable().default(null),
  level: z.int().min(1).max(2).default(1),
  misses: z.int().min(0).max(4).default(0),
  phase: AlchemistGuildGatheringBossPhaseSchema.default("idle"),
  problemEndsAtMs: z.number().min(0).nullable().default(null),
  problemIndex: z.int().min(1).default(1),
  problemStartedAtMs: z.number().min(0).nullable().default(null),
  rewardCardIds: z.array(AlchemistGuildCardIdSchema).max(8).default([]),
  startedAtMs: z.number().min(0).nullable().default(null),
});
export type AlchemistGuildGatheringBossState = z.infer<
  typeof AlchemistGuildGatheringBossStateSchema
>;
export const ALCHEMIST_GUILD_GATHERING_BOSS_DEFAULT: AlchemistGuildGatheringBossState =
  AlchemistGuildGatheringBossStateSchema.parse({});

export const AlchemistGuildGatheringTargetDropChancesSchema = z
  .record(AlchemistGuildCardIdSchema, z.int().min(0).max(10_000))
  .default({});
export type AlchemistGuildGatheringTargetDropChances = z.infer<
  typeof AlchemistGuildGatheringTargetDropChancesSchema
>;

// Visible "answers in a row" streak for normal gathering (distinct from the boss
// streak). `current` ticks up on a correct answer and resets to 0 on the first
// wrong one. Every field defaults, so adding this to a persisted record needs no
// IDB migration — hydration re-parses through this schema and fills the defaults.
export const AlchemistGuildGatheringStreakSchema = z.object({
  current: z.int().min(0).default(0),
  lastBrokenAtMs: z.number().min(0).nullable().default(null),
  lastIncrementAtMs: z.number().min(0).nullable().default(null),
  longest: z.int().min(0).default(0),
});
export type AlchemistGuildGatheringStreak = z.infer<typeof AlchemistGuildGatheringStreakSchema>;
export const ALCHEMIST_GUILD_GATHERING_STREAK_DEFAULT: AlchemistGuildGatheringStreak =
  AlchemistGuildGatheringStreakSchema.parse({});

export const AlchemistGuildGatheringStateSchema = z.object({
  equation: AlchemistGuildGatheringEquationSchema.default(
    ALCHEMIST_GUILD_GATHERING_EQUATION_DEFAULT,
  ),
  equationIndex: z.int().min(1).default(1),
  gatherLog: z.array(AlchemistGuildGatheringLogEntrySchema).default([]),
  lastAnswerCorrect: z.boolean().nullable().default(null),
  levelProgress: AlchemistGuildGatheringLevelProgressSchema.default(
    ALCHEMIST_GUILD_GATHERING_LEVEL_PROGRESS_DEFAULT,
  ),
  boss: AlchemistGuildGatheringBossStateSchema.default(ALCHEMIST_GUILD_GATHERING_BOSS_DEFAULT),
  monster: AlchemistGuildGatheringMonsterSchema.default(ALCHEMIST_GUILD_GATHERING_MONSTER_DEFAULT),
  phase: AlchemistGuildGatheringPhaseSchema.default("solving"),
  // Up to 4: the baseline is 3 options, and the New Reward Slot upgrade can add a
  // 4th. Keep this cap in sync with the app's GATHERING_REWARD_OPTION_COUNT (3) + 1.
  rewardOptionCardIds: z.array(AlchemistGuildCardIdSchema).max(4).default([]),
  round: z.int().min(1).default(1),
  spacedRepetition: AlchemistGuildGatheringSpacedRepetitionSchema.default(
    ALCHEMIST_GUILD_GATHERING_SPACED_REPETITION_DEFAULT,
  ),
  streak: AlchemistGuildGatheringStreakSchema.default(ALCHEMIST_GUILD_GATHERING_STREAK_DEFAULT),
  targetDropChances: AlchemistGuildGatheringTargetDropChancesSchema,
  unlockSeen: z.boolean().default(false),
  wrongAnswerStreak: z.int().min(0).max(3).default(0),
});
export type AlchemistGuildGatheringState = z.infer<typeof AlchemistGuildGatheringStateSchema>;
export const ALCHEMIST_GUILD_GATHERING_DEFAULT: AlchemistGuildGatheringState =
  AlchemistGuildGatheringStateSchema.parse({});

/** Total expeditions in flight at once (active + queued) with the Queue upgrade. */
export const EXPEDITION_QUEUE_MAX = 3;

export const AlchemistGuildExpeditionStateSchema = z.object({
  // Target cards lined up to auto-run after the active one returns (Expedition
  // Queue upgrade). Capped in app logic to EXPEDITION_QUEUE_MAX total in flight.
  queuedTargetCardIds: z.array(AlchemistGuildCardIdSchema).default([]),
  readyAtMs: z.number().min(0).nullable().default(null),
  readyNotified: z.boolean().default(false),
  startedAtMs: z.number().min(0).nullable().default(null),
  targetCardId: AlchemistGuildCardIdSchema.nullable().default(null),
  unlockAnnounced: z.boolean().default(false),
  unlockSeen: z.boolean().default(false),
});
export type AlchemistGuildExpeditionState = z.infer<typeof AlchemistGuildExpeditionStateSchema>;
export const ALCHEMIST_GUILD_EXPEDITION_DEFAULT: AlchemistGuildExpeditionState =
  AlchemistGuildExpeditionStateSchema.parse({});

export const AlchemistGuildBoardStateSchema = z.object({
  activeBoardMode: AlchemistGuildBoardModeSchema.default("crafting"),
  autoPlayedQuestVoiceIds: z.array(AlchemyQuestIdSchema).default([]),
  completedQuestIds: z.array(AlchemyQuestIdSchema).default([]),
  discoveredElementIds: z
    .array(AlchemistGuildCardIdSchema)
    .default([...ALCHEMIST_GUILD_STARTING_DISCOVERED_ELEMENT_IDS]),
  id: z.literal(ALCHEMIST_GUILD_BOARD_ID).default(ALCHEMIST_GUILD_BOARD_ID),
  discoveredEmergentRecipes: z.array(AlchemistGuildEmergentRecipeSchema).default([]),
  discoveredExtendedRecipeIds: z.array(ExtendedMoleculeRecipeIdSchema).default([]),
  discoveredRecipeIds: z.array(AlchemyRecipeIdSchema).default([]),
  elementQuantities: AlchemistGuildElementQuantitiesSchema,
  gathering: AlchemistGuildGatheringStateSchema.default(ALCHEMIST_GUILD_GATHERING_DEFAULT),
  expedition: AlchemistGuildExpeditionStateSchema.default(ALCHEMIST_GUILD_EXPEDITION_DEFAULT),
  profile: AlchemistGuildProfileSchema.default(ALCHEMIST_GUILD_PROFILE_DEFAULT),
  inventorySlots: AlchemistGuildInventorySlotsSchema.default(
    ALCHEMIST_GUILD_INVENTORY_SLOTS_DEFAULT,
  ),
  questDeliveries: AlchemistGuildQuestDeliveriesSchema.default(
    ALCHEMIST_GUILD_QUEST_DELIVERIES_DEFAULT,
  ),
  questLogScrollTop: z.number().min(0).default(0),
  reagentSlots: AlchemistGuildBoardSlotsSchema.default(ALCHEMIST_GUILD_BOARD_SLOTS_DEFAULT),
  selectedQuestId: AlchemyQuestIdSchema.default(ALCHEMIST_GUILD_FIRST_WATER_QUEST_ID),
  // Lifetime count of finished gathering sessions (a reward claimed after an enemy
  // is beaten). Drives the New Reward Slot upgrade's confirm threshold.
  gatheringSessionsCompleted: z.int().min(0).default(0),
  // Upgrade-shop ids the player has unlocked (see the upgrade catalog in the app
  // layer). The Upgrades tab only appears once this is non-empty. `upgradesTabSeen`
  // suppresses the "new tab" nudge after the first visit.
  unlockedUpgradeIds: z.array(z.string()).default([]),
  upgradesTabSeen: z.boolean().default(false),
});
export type AlchemistGuildBoardState = z.infer<typeof AlchemistGuildBoardStateSchema>;
export const ALCHEMIST_GUILD_BOARD_DEFAULT: AlchemistGuildBoardState =
  AlchemistGuildBoardStateSchema.parse({});

// Sound playback settings — global mute + master volume. Persists across reloads
// so a parent muting for naptime doesn't have to re-mute every page load.
export const SoundSettingsSchema = z.object({
  id: z.literal("sound-settings").default("sound-settings"),
  enabled: z.boolean().default(true),
  masterVolume: z.number().min(0).max(1).default(1),
});
export type SoundSettings = z.infer<typeof SoundSettingsSchema>;
export const SOUND_SETTINGS_DEFAULT: SoundSettings = SoundSettingsSchema.parse({});
