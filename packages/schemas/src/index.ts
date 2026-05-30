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

export const ALCHEMIST_GUILD_BOARD_MODE_TABS = ["crafting", "gathering", "expedition"] as const;
export const AlchemistGuildBoardModeSchema = z.enum(ALCHEMIST_GUILD_BOARD_MODE_TABS);
export type AlchemistGuildBoardMode = z.infer<typeof AlchemistGuildBoardModeSchema>;

export const AlchemistGuildGatheringPhaseSchema = z.enum(["solving", "move", "reward"]);
export type AlchemistGuildGatheringPhase = z.infer<typeof AlchemistGuildGatheringPhaseSchema>;

export const AlchemistGuildGatheringEquationSchema = z.object({
  answer: z.int().min(0).max(40).default(9),
  choiceValues: z.array(z.int().min(0).max(40)).length(5).default([11, 8, 10, 12, 9]),
  id: z.string().min(1).default("gathering-equation:1:1"),
  left: z.int().min(0).max(20).default(5),
  right: z.int().min(0).max(20).default(4),
  selectedValue: z.int().min(0).max(40).nullable().default(null),
});
export type AlchemistGuildGatheringEquation = z.infer<typeof AlchemistGuildGatheringEquationSchema>;
export const ALCHEMIST_GUILD_GATHERING_EQUATION_DEFAULT: AlchemistGuildGatheringEquation =
  AlchemistGuildGatheringEquationSchema.parse({});

export const AlchemistGuildGatheringMonsterSchema = z.object({
  hp: z.int().min(0).default(14),
  id: z.literal("monster:hadal-tide-minnow-echo").default("monster:hadal-tide-minnow-echo"),
  imagePath: z.string().min(1).default("enemies/hadal-tide-minnow-echo.png"),
  maxHp: z.int().min(1).default(14),
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

export const AlchemistGuildGatheringTargetDropChancesSchema = z
  .record(AlchemistGuildCardIdSchema, z.int().min(0).max(10_000))
  .default({});
export type AlchemistGuildGatheringTargetDropChances = z.infer<
  typeof AlchemistGuildGatheringTargetDropChancesSchema
>;

export const AlchemistGuildGatheringStateSchema = z.object({
  equation: AlchemistGuildGatheringEquationSchema.default(
    ALCHEMIST_GUILD_GATHERING_EQUATION_DEFAULT,
  ),
  equationIndex: z.int().min(1).default(1),
  gatherLog: z.array(AlchemistGuildGatheringLogEntrySchema).default([]),
  lastAnswerCorrect: z.boolean().nullable().default(null),
  monster: AlchemistGuildGatheringMonsterSchema.default(ALCHEMIST_GUILD_GATHERING_MONSTER_DEFAULT),
  phase: AlchemistGuildGatheringPhaseSchema.default("solving"),
  rewardOptionCardIds: z.array(AlchemistGuildCardIdSchema).max(3).default([]),
  round: z.int().min(1).default(1),
  targetDropChances: AlchemistGuildGatheringTargetDropChancesSchema,
  wrongAnswerStreak: z.int().min(0).max(3).default(0),
});
export type AlchemistGuildGatheringState = z.infer<typeof AlchemistGuildGatheringStateSchema>;
export const ALCHEMIST_GUILD_GATHERING_DEFAULT: AlchemistGuildGatheringState =
  AlchemistGuildGatheringStateSchema.parse({});

export const AlchemistGuildExpeditionStateSchema = z.object({
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
