import * as z from "zod";

import { type SoundDefinition, SoundDefinitionSchema } from "./schema";

export const SOUND_REGISTRY: SoundDefinition[] = z.array(SoundDefinitionSchema).parse([
  {
    bus: "music",
    detuneCents: 0,
    ducking: [],
    id: "music.crownIn8Bit",
    interruptFadeMs: 300,
    loop: true,
    maxVoices: 1,
    replay: "ignore",
    url: "/music/crown-in-8-bit.mp3",
    volume: 0.46,
  },
  {
    bus: "ui",
    ducking: [
      { attackMs: 8, bus: "music", gain: 0.9, holdMs: 40, releaseMs: 110 },
      { attackMs: 8, bus: "ambience", gain: 0.94, holdMs: 35, releaseMs: 100 },
    ],
    generatorPrompt:
      "Polished brass alchemy tab switch, tiny gear latch clicks into place with warm glass sparkle, dry close-miked mobile UI, 0.5s one-shot, precise and focused.",
    id: "board-mode.crafting",
    interruptFadeMs: 8,
    maxVoices: 4,
    replay: "restart",
    url: "/sfx/ui/board-mode-crafting.mp3",
    volume: 0.58,
  },
  {
    bus: "ui",
    ducking: [
      { attackMs: 8, bus: "music", gain: 0.9, holdMs: 40, releaseMs: 110 },
      { attackMs: 8, bus: "ambience", gain: 0.94, holdMs: 35, releaseMs: 100 },
    ],
    generatorPrompt:
      "Soft leather field-map tab flip, leaf rustle with small wooden bead tick, dry centered mobile UI, 0.5s one-shot, curious and outdoorsy.",
    id: "board-mode.gathering",
    interruptFadeMs: 8,
    maxVoices: 4,
    replay: "restart",
    url: "/sfx/ui/board-mode-gathering.mp3",
    volume: 0.58,
  },
  {
    bus: "ui",
    ducking: [
      { attackMs: 8, bus: "music", gain: 0.9, holdMs: 40, releaseMs: 110 },
      { attackMs: 8, bus: "ambience", gain: 0.94, holdMs: 35, releaseMs: 100 },
    ],
    generatorPrompt:
      "Compass bezel tab selection, bright brass click with airy map whoosh, dry close-miked adventure UI, 0.5s one-shot, adventurous and open.",
    id: "board-mode.expedition",
    interruptFadeMs: 8,
    maxVoices: 4,
    replay: "restart",
    url: "/sfx/ui/board-mode-expedition.mp3",
    volume: 0.6,
  },
  {
    bus: "ui",
    ducking: [
      { attackMs: 8, bus: "music", gain: 0.86, holdMs: 90, releaseMs: 180 },
      { attackMs: 8, bus: "ambience", gain: 0.92, holdMs: 70, releaseMs: 150 },
    ],
    generatorPrompt:
      "Small brass compass charm opens and catches a magical signal, polished brass click with glass shimmer and soft bell overtone, dry close-miked mobile UI, bright one-shot, wondrous and clean.",
    id: "expedition.unlocked",
    interruptFadeMs: 12,
    maxVoices: 2,
    replay: "ignore",
    url: "/sfx/ui/expedition-unlocked.mp3",
    volume: 0.72,
  },
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
      { attackMs: 18, bus: "music", gain: 0.76, holdMs: 120, releaseMs: 180 },
      { attackMs: 14, bus: "ambience", gain: 0.86, holdMs: 100, releaseMs: 160 },
    ],
    generatorPrompt:
      "Five thin alchemy cards dissolving together into sparkling paper dust, soft layered fizz with tiny glass motes, dry close-miked mobile game UI, fast one-shot with airy fade, magical and clean.",
    id: "card.massDissolve",
    interruptFadeMs: 24,
    maxVoices: 8,
    replay: "overlap",
    url: "/sfx/ui/card-mass-dissolve.mp3",
    volume: 0.82,
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
  {
    bus: "ui",
    ducking: [
      { attackMs: 8, bus: "music", gain: 0.86, holdMs: 45, releaseMs: 120 },
      { attackMs: 8, bus: "ambience", gain: 0.92, holdMs: 40, releaseMs: 110 },
    ],
    generatorPrompt:
      "Bright alchemy completion ding, single polished bell tone with tiny crystal sparkle, dry centered mobile game UI, instant attack and short clean decay, rewarding and clear.",
    id: "transmute.complete",
    interruptFadeMs: 8,
    maxVoices: 6,
    replay: "overlap",
    url: "/sfx/ui/transmute-complete-ding.mp3",
    volume: 0.72,
  },
  {
    bus: "ui",
    ducking: [
      { attackMs: 8, bus: "music", gain: 0.9, holdMs: 60, releaseMs: 140 },
      { attackMs: 8, bus: "ambience", gain: 0.94, holdMs: 50, releaseMs: 130 },
    ],
    generatorPrompt:
      "Small tuning fork struck softly, pure warm resonant tone with gentle shimmer, dry centered mobile game UI, clean one-shot with smooth fading tail, ready and calm.",
    id: "cooldown.ready",
    interruptFadeMs: 8,
    maxVoices: 10,
    replay: "overlap",
    url: "/sfx/ui/cooldown-ready.mp3",
    volume: 0.64,
  },
  {
    bus: "ui",
    ducking: [
      { attackMs: 8, bus: "music", gain: 0.86, holdMs: 80, releaseMs: 180 },
      { attackMs: 8, bus: "ambience", gain: 0.9, holdMs: 70, releaseMs: 160 },
    ],
    generatorPrompt:
      "Small polished steel tuning fork struck once, pure resonant A-note shimmer with soft crystal overtone, dry centered mobile game UI, quick one-shot with warm fading tail, guiding and calm.",
    id: "crafting.needsGathering",
    interruptFadeMs: 8,
    maxVoices: 3,
    replay: "restart",
    url: "/sfx/ui/cooldown-ready.mp3",
    volume: 0.7,
  },
  {
    bus: "ui",
    ducking: [
      { attackMs: 8, bus: "music", gain: 0.88, holdMs: 60, releaseMs: 130 },
      { attackMs: 8, bus: "ambience", gain: 0.94, holdMs: 50, releaseMs: 120 },
    ],
    generatorPrompt:
      "Soft wrong-answer UI thunk, tiny detuned wooden block tap with muted rubber mallet, dry close-miked mobile game UI, half-second one-shot with quick falling tail, gentle and clear.",
    id: "gathering.answerWrong",
    interruptFadeMs: 8,
    maxVoices: 4,
    replay: "restart",
    url: "/sfx/ui/gathering-answer-wrong.mp3",
    volume: 0.68,
  },
  {
    bus: "ui",
    ducking: [
      { attackMs: 8, bus: "music", gain: 0.88, holdMs: 60, releaseMs: 130 },
      { attackMs: 8, bus: "ambience", gain: 0.94, holdMs: 50, releaseMs: 120 },
    ],
    generatorPrompt:
      "Soft failed alchemy transmute thunk, tiny detuned wooden block tap with muted magic fizz, dry close-miked mobile game UI, half-second one-shot with quick falling tail, gentle and clear.",
    id: "transmute.failed",
    interruptFadeMs: 8,
    maxVoices: 4,
    replay: "restart",
    url: "/sfx/ui/gathering-answer-wrong.mp3",
    volume: 0.68,
  },
  {
    bus: "sfx",
    ducking: [
      { attackMs: 10, bus: "music", gain: 0.78, holdMs: 90, releaseMs: 160 },
      { attackMs: 8, bus: "ambience", gain: 0.88, holdMs: 70, releaseMs: 140 },
    ],
    generatorPrompt:
      "Left Spark attack, small amber electrical spark leaping from a card, crisp static snap with warm ember crackle and polished brass ping, dry centered mobile game combat UI, 0.7 second one-shot with tiny fizz tail, bright and focused.",
    id: "gathering.attack.leftSpark",
    interruptFadeMs: 10,
    maxVoices: 8,
    replay: "overlap",
    url: "/sfx/combat/gathering-left-spark.mp3",
    volume: 0.76,
  },
  {
    bus: "sfx",
    ducking: [
      { attackMs: 10, bus: "music", gain: 0.78, holdMs: 90, releaseMs: 160 },
      { attackMs: 8, bus: "ambience", gain: 0.88, holdMs: 70, releaseMs: 140 },
    ],
    generatorPrompt:
      "Right Spark attack, cool cyan electrical arc snapping sideways, glassy static zap with watery shimmer and thin crystal tick, dry centered mobile game combat UI, 0.7 second one-shot with quick fading tail, clean and agile.",
    id: "gathering.attack.rightSpark",
    interruptFadeMs: 10,
    maxVoices: 8,
    replay: "overlap",
    url: "/sfx/combat/gathering-right-spark.mp3",
    volume: 0.76,
  },
  {
    bus: "sfx",
    ducking: [
      { attackMs: 12, bus: "music", gain: 0.72, holdMs: 130, releaseMs: 220 },
      { attackMs: 10, bus: "ambience", gain: 0.84, holdMs: 110, releaseMs: 190 },
    ],
    generatorPrompt:
      "Sum Strike attack, amber and cyan magic arcs converge into one bright impact, soft card whoosh with electric crackle and warm bell hit, dry centered mobile game combat UI, 0.9 second one-shot with shimmering tail, triumphant.",
    id: "gathering.attack.sumStrike",
    interruptFadeMs: 12,
    maxVoices: 6,
    replay: "overlap",
    url: "/sfx/combat/gathering-sum-strike.mp3",
    volume: 0.82,
  },
  {
    bus: "ui",
    ducking: [
      { attackMs: 8, bus: "music", gain: 0.84, holdMs: 70, releaseMs: 150 },
      { attackMs: 8, bus: "ambience", gain: 0.92, holdMs: 60, releaseMs: 140 },
    ],
    generatorPrompt:
      "Bright reward-claim chime, polished brass coin sparkle blended with a warm tuning fork tone, tiny ascending crystal glint, dry centered mobile game UI, 0.8 second one-shot with smooth fading tail, happy and rewarding.",
    id: "gathering.rewardClaim",
    interruptFadeMs: 8,
    maxVoices: 5,
    replay: "overlap",
    url: "/sfx/ui/gathering-reward-claim.mp3",
    volume: 0.7,
  },
  {
    bus: "sfx",
    ducking: [
      { attackMs: 18, bus: "music", gain: 0.72, holdMs: 160, releaseMs: 260 },
      { attackMs: 14, bus: "ambience", gain: 0.82, holdMs: 140, releaseMs: 220 },
    ],
    generatorPrompt:
      "Fragile paper monster card collapsing into sparkling dust, soft low thump with airy magic fizz, dry close-miked mobile game event, one-shot with one-second falling tail, defeated and clean.",
    id: "gathering.monsterDeath",
    interruptFadeMs: 24,
    maxVoices: 4,
    replay: "restart",
    url: "/sfx/combat/gathering-monster-death.mp3",
    volume: 0.84,
  },
]);
