import * as z from "zod";

import { ElementAlchemyCardSchema } from "./data/element-cards";

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

export const AlchemistGuildReagentSlotIdSchema = z.enum([
  "reagent-slot-1",
  "reagent-slot-2",
  "reagent-slot-3",
  "reagent-slot-4",
  "reagent-slot-5",
]);
export type AlchemistGuildReagentSlotId = z.infer<typeof AlchemistGuildReagentSlotIdSchema>;

export const AlchemistGuildCardIdSchema = ElementAlchemyCardSchema.shape.id;
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

export const AlchemistGuildProfileSchema = z.object({
  level: z.int().min(1).default(1),
  playerName: z.string().trim().min(1).max(24).default("Apprentice"),
});
export type AlchemistGuildProfile = z.infer<typeof AlchemistGuildProfileSchema>;

export const ALCHEMIST_GUILD_PROFILE_DEFAULT: AlchemistGuildProfile =
  AlchemistGuildProfileSchema.parse({});

export const AlchemistGuildBoardStateSchema = z.object({
  id: z.literal(ALCHEMIST_GUILD_BOARD_ID).default(ALCHEMIST_GUILD_BOARD_ID),
  profile: AlchemistGuildProfileSchema.default(ALCHEMIST_GUILD_PROFILE_DEFAULT),
  reagentSlots: AlchemistGuildBoardSlotsSchema.default(ALCHEMIST_GUILD_BOARD_SLOTS_DEFAULT),
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
