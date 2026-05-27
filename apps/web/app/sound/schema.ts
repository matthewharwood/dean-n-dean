import * as z from "zod";

export const SoundBusSchema = z.enum(["sfx", "ui", "music", "voice", "ambience"]);
export type SoundBus = z.infer<typeof SoundBusSchema>;

export const SoundReplayPolicySchema = z.enum(["overlap", "restart", "ignore", "cancel-bus"]);

export const SoundIdSchema = z.enum([
  "board-mode.crafting",
  "board-mode.expedition",
  "board-mode.gathering",
  "card.pickup",
  "card.dissolve",
  "card.drop",
  "card.massDissolve",
  "card.swap",
  "card.replace",
  "card.slot.pickup",
  "cooldown.ready",
  "crafting.needsGathering",
  "gathering.attack.leftSpark",
  "gathering.attack.rightSpark",
  "gathering.attack.sumStrike",
  "gathering.answerWrong",
  "gathering.monsterDeath",
  "gathering.rewardClaim",
  "music.crownIn8Bit",
  "transmute.complete",
]);
export type SoundId = z.infer<typeof SoundIdSchema>;

export const SoundDuckingSchema = z.object({
  attackMs: z.number().min(0).max(1000),
  bus: SoundBusSchema,
  gain: z.number().min(0).max(1),
  holdMs: z.number().min(0).max(5000),
  releaseMs: z.number().min(0).max(5000),
});
export type SoundDucking = z.infer<typeof SoundDuckingSchema>;

export const SoundDefinitionSchema = z.object({
  bus: SoundBusSchema,
  detuneCents: z.number().min(-2400).max(2400).default(-1200),
  ducking: z.array(SoundDuckingSchema).default([]),
  generatorPrompt: z.string().min(10).max(400).optional(),
  id: SoundIdSchema,
  interruptFadeMs: z.number().min(0).max(1000),
  loop: z.boolean().default(false),
  maxVoices: z.int().min(1).max(64),
  replay: SoundReplayPolicySchema,
  url: z.string().min(1),
  volume: z.number().min(0).max(2),
});
export type SoundDefinition = z.infer<typeof SoundDefinitionSchema>;

export const SoundPlayOptionsSchema = z.object({
  detuneCents: z.number().min(-2400).max(2400).optional(),
  delayMs: z.number().min(0).max(10_000).optional(),
  volume: z.number().min(0).max(2).optional(),
});
export type SoundPlayOptions = z.infer<typeof SoundPlayOptionsSchema>;
