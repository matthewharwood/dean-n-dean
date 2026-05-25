import * as z from "zod";

import { AlchemyQuestIdSchema } from "./data/alchemy-quests";
import { AlchemyCardIdSchema, AlchemyRecipeIdSchema } from "./data/alchemy-recipes";

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

export const AlchemistGuildBoardStateSchema = z.object({
  completedQuestIds: z.array(AlchemyQuestIdSchema).default([]),
  id: z.literal(ALCHEMIST_GUILD_BOARD_ID).default(ALCHEMIST_GUILD_BOARD_ID),
  discoveredRecipeIds: z.array(AlchemyRecipeIdSchema).default([]),
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
