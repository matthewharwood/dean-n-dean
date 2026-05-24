import * as z from "zod";

import { type SoundDefinition, SoundDefinitionSchema } from "./schema";

export const SOUND_REGISTRY: SoundDefinition[] = z.array(SoundDefinitionSchema).parse([
  {
    bus: "sfx",
    ducking: [
      { attackMs: 12, bus: "music", gain: 0.82, holdMs: 40, releaseMs: 120 },
      { attackMs: 10, bus: "ambience", gain: 0.9, holdMs: 30, releaseMs: 110 },
    ],
    generatorPrompt:
      "Single playing card lifted from a table, crisp paper snap with soft fingertip friction, dry close-miked mobile game UI, fast one-shot, tactile and clean.",
    id: "card.pickup",
    interruptFadeMs: 18,
    maxVoices: 18,
    replay: "overlap",
    url: "/sfx/ui/card-pickup.mp3",
    volume: 0.72,
  },
  {
    bus: "sfx",
    ducking: [
      { attackMs: 18, bus: "music", gain: 0.76, holdMs: 120, releaseMs: 180 },
      { attackMs: 14, bus: "ambience", gain: 0.86, holdMs: 100, releaseMs: 160 },
    ],
    generatorPrompt:
      "Small paper card dissolving into fine sparkling dust, soft fizz and airy shimmer, dry magical UI one-shot, quick 180 millisecond fade tail, delicate and satisfying.",
    id: "card.dissolve",
    interruptFadeMs: 24,
    maxVoices: 14,
    replay: "overlap",
    url: "/sfx/ui/card-dissolve.mp3",
    volume: 0.78,
  },
  {
    bus: "sfx",
    ducking: [
      { attackMs: 12, bus: "music", gain: 0.82, holdMs: 60, releaseMs: 130 },
      { attackMs: 10, bus: "ambience", gain: 0.9, holdMs: 50, releaseMs: 120 },
    ],
    generatorPrompt:
      "Thin elemental playing card dropped into a shallow wooden card slot, soft paper slap with small polished brass click, dry close-miked mobile game UI, short one-shot, settled and clean.",
    id: "card.drop",
    interruptFadeMs: 18,
    maxVoices: 18,
    replay: "overlap",
    url: "/sfx/ui/card-drop.mp3",
    volume: 0.74,
  },
  {
    bus: "sfx",
    ducking: [
      { attackMs: 12, bus: "music", gain: 0.8, holdMs: 70, releaseMs: 150 },
      { attackMs: 10, bus: "ambience", gain: 0.88, holdMs: 60, releaseMs: 130 },
    ],
    generatorPrompt:
      "Two thin cards exchanged between wooden slots, quick double paper flick with small brass latch ticks, dry close-miked mobile game UI, compact one-shot, clever and clean.",
    id: "card.swap",
    interruptFadeMs: 18,
    maxVoices: 16,
    replay: "overlap",
    url: "/sfx/ui/card-swap.mp3",
    volume: 0.76,
  },
  {
    bus: "sfx",
    ducking: [
      { attackMs: 14, bus: "music", gain: 0.78, holdMs: 90, releaseMs: 160 },
      { attackMs: 12, bus: "ambience", gain: 0.86, holdMs: 80, releaseMs: 150 },
    ],
    generatorPrompt:
      "Thin elemental card replacing another in a wooden slot, crisp paper slap and polished brass tick, old card side-chain dissolves into airy sparkling dust underneath, dry close-miked mobile game UI, compact one-shot, clever and clean.",
    id: "card.replace",
    interruptFadeMs: 20,
    maxVoices: 16,
    replay: "overlap",
    url: "/sfx/ui/card-replace-dissolve.mp3",
    volume: 0.78,
  },
  {
    bus: "sfx",
    ducking: [
      { attackMs: 10, bus: "music", gain: 0.84, holdMs: 40, releaseMs: 110 },
      { attackMs: 8, bus: "ambience", gain: 0.92, holdMs: 35, releaseMs: 100 },
    ],
    generatorPrompt:
      "Thin card lifted from a shallow wooden slot, light suction release with paper scrape and tiny brass tick, dry close-miked mobile game UI, quick one-shot, tactile and clean.",
    id: "card.slot.pickup",
    interruptFadeMs: 16,
    maxVoices: 18,
    replay: "overlap",
    url: "/sfx/ui/card-slot-pickup.mp3",
    volume: 0.72,
  },
]);
