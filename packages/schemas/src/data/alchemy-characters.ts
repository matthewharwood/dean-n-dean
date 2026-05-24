import * as z from "zod";

import { type QuestRequester, QuestRequesterSchema } from "./alchemy-recipes";

export const ALCHEMY_CHARACTER_IDS = [
  "professor-atomwick",
  "sir-bubbleton",
  "baker-brindle",
  "mina-pickbright",
  "glassblower-luma",
  "tinker-volt",
  "gardener-nori",
  "archivist-mendelee",
  "ranger-rowan",
  "wizard-quillby",
  "bard-brio",
  "rogue-sable",
  "cleric-maribel",
  "apprentice",
] as const;
export const AlchemyCharacterIdSchema = z.enum(ALCHEMY_CHARACTER_IDS);
export type AlchemyCharacterId = z.infer<typeof AlchemyCharacterIdSchema>;

export const ALCHEMY_CHARACTER_KINDS = ["guide", "npc", "player"] as const;
export const AlchemyCharacterKindSchema = z.enum(ALCHEMY_CHARACTER_KINDS);
export type AlchemyCharacterKind = z.infer<typeof AlchemyCharacterKindSchema>;

export const AlchemyCharacterAvatarPathSchema = z
  .string()
  .regex(/^alchemy-character-avatars\/[a-z0-9-]+\.webp$/);
export type AlchemyCharacterAvatarPath = z.infer<typeof AlchemyCharacterAvatarPathSchema>;

export const AlchemyCharacterAudioPathSchema = z
  .string()
  .regex(/^alchemy-character-voices\/[a-z0-9-]+\.mp3$/);
export type AlchemyCharacterAudioPath = z.infer<typeof AlchemyCharacterAudioPathSchema>;

export const AlchemyCharacterCatchphraseIdSchema = z.string().regex(/^line:[a-z0-9-]+$/);
export type AlchemyCharacterCatchphraseId = z.infer<typeof AlchemyCharacterCatchphraseIdSchema>;

export const AlchemyCharacterCatchphraseSchema = z.object({
  id: AlchemyCharacterCatchphraseIdSchema,
  text: z.string().min(1),
});
export type AlchemyCharacterCatchphrase = z.infer<typeof AlchemyCharacterCatchphraseSchema>;

export const AlchemyCharacterVoiceClipSchema = z.object({
  id: z.string().regex(/^voice:[a-z0-9-]+$/),
  audioPath: AlchemyCharacterAudioPathSchema,
  catchphraseIds: z.array(AlchemyCharacterCatchphraseIdSchema).min(1),
});
export type AlchemyCharacterVoiceClip = z.infer<typeof AlchemyCharacterVoiceClipSchema>;

export const AlchemyCharacterSchema = z.object({
  id: AlchemyCharacterIdSchema,
  kind: AlchemyCharacterKindSchema,
  name: z.string().min(1),
  title: z.string().min(1),
  questRequesterRoles: z.array(QuestRequesterSchema),
  questIds: z.array(z.string().regex(/^quest:[a-z0-9-]+$/)),
  avatarPath: AlchemyCharacterAvatarPathSchema,
  catchphrases: z.array(AlchemyCharacterCatchphraseSchema).min(3),
  voiceClips: z.array(AlchemyCharacterVoiceClipSchema).min(1),
});
export type AlchemyCharacter = z.infer<typeof AlchemyCharacterSchema>;

type DeepReadonly<T> = T extends readonly (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

type CharacterInput = Omit<AlchemyCharacter, "avatarPath" | "voiceClips">;

const character = <const T extends DeepReadonly<CharacterInput>>(value: T) =>
  ({
    ...value,
    avatarPath: `alchemy-character-avatars/${value.id}.webp`,
    voiceClips: [
      {
        id: "voice:catchphrases",
        audioPath: `alchemy-character-voices/${value.id}.mp3`,
        catchphraseIds: value.catchphrases.map((catchphraseEntry) => catchphraseEntry.id),
      },
    ],
  }) as const;

const catchphrase = (id: string, text: string) => ({ id, text }) as const;

export const ALCHEMY_CHARACTERS = [
  character({
    id: "professor-atomwick",
    kind: "guide",
    name: "Professor Atomwick",
    title: "Vault Mentor",
    questRequesterRoles: ["alchemist-guild"],
    questIds: ["quest:first-water"],
    catchphrases: [
      catchphrase("line:atom-stories", "Atoms tell little stories."),
      catchphrase("line:count-the-cards", "Count the cards, then trust the recipe."),
      catchphrase("line:vault-remembers", "The vault remembers every discovery."),
    ],
  }),
  character({
    id: "sir-bubbleton",
    kind: "npc",
    name: "Sir Bubbleton",
    title: "Training Knight",
    questRequesterRoles: ["knight"],
    questIds: [
      "quest:first-water",
      "quest:water-flask-delivery",
      "quest:forge-field-gear",
      "quest:stealth-and-polish",
    ],
    catchphrases: [
      catchphrase("line:two-hydrogens", "Two Hydrogens and one Oxygen, splendid."),
      catchphrase("line:flask-ready", "My flask is ready for adventure."),
      catchphrase("line:shield-shines", "The shield shines brighter already."),
    ],
  }),
  character({
    id: "baker-brindle",
    kind: "npc",
    name: "Baker Brindle",
    title: "Kitchen Chemist",
    questRequesterRoles: ["cleric"],
    questIds: ["quest:kitchen-salt-and-fuel"],
    catchphrases: [
      catchphrase("line:kitchen-sings", "Salt makes the kitchen sing."),
      catchphrase("line:careful-measuring", "A warm loaf starts with careful measuring."),
      catchphrase("line:supper-brave", "Bring me water, and I will make supper brave."),
    ],
  }),
  character({
    id: "mina-pickbright",
    kind: "npc",
    name: "Mina Pickbright",
    title: "Miner Blacksmith",
    questRequesterRoles: ["blacksmith"],
    questIds: ["quest:metal-samples", "quest:alloy-market", "quest:fasteners-and-parts"],
    catchphrases: [
      catchphrase("line:forge-listens", "Metals wake up when the forge listens."),
      catchphrase("line:alloys-next", "Iron first, alloys next."),
      catchphrase("line:nail-story", "Every nail has a story from the table."),
    ],
  }),
  character({
    id: "glassblower-luma",
    kind: "npc",
    name: "Glassblower Luma",
    title: "Lens Artisan",
    questRequesterRoles: ["artificer", "wizard"],
    questIds: ["quest:glass-minerals", "quest:first-flask", "quest:stained-glass-lens"],
    catchphrases: [
      catchphrase("line:silica-furnace", "Silica loves a hot furnace."),
      catchphrase("line:clear-thinking", "Clear glass makes clear thinking."),
      catchphrase("line:lens-path", "A good lens turns fog into a path."),
    ],
  }),
  character({
    id: "tinker-volt",
    kind: "npc",
    name: "Tinker Volt",
    title: "Circuit Artificer",
    questRequesterRoles: ["artificer"],
    questIds: ["quest:precious-conductors", "quest:advanced-materials", "quest:class-kits"],
    catchphrases: [
      catchphrase("line:copper-spark", "Copper carries a clever spark."),
      catchphrase("line:wires-roads", "Wires are tiny roads for wonder."),
      catchphrase("line:label-it-twice", "If it glows, label it twice."),
    ],
  }),
  character({
    id: "gardener-nori",
    kind: "npc",
    name: "Gardener Nori",
    title: "Living Garden Druid",
    questRequesterRoles: ["druid"],
    questIds: ["quest:garden-minerals", "quest:garden-charm"],
    catchphrases: [
      catchphrase("line:plants-matter", "Plants need matter, too."),
      catchphrase("line:garden-patience", "Potassium, phosphorus, water, and patience."),
      catchphrase("line:recipe-kind", "The garden grows when the recipe is kind."),
    ],
  }),
  character({
    id: "archivist-mendelee",
    kind: "npc",
    name: "Archivist Mendelee",
    title: "Element Museum Keeper",
    questRequesterRoles: ["alchemist-guild"],
    questIds: ["quest:scribe-and-charm"],
    catchphrases: [
      catchphrase("line:museum-remembers", "The museum remembers what the fog forgot."),
      catchphrase("line:badge-promise", "A badge is a promise to notice patterns."),
      catchphrase("line:family-cousins", "Every family on the table has cousins."),
    ],
  }),
  character({
    id: "ranger-rowan",
    kind: "npc",
    name: "Ranger Rowan",
    title: "Field Scout",
    questRequesterRoles: ["ranger"],
    questIds: [
      "quest:field-kit-basics",
      "quest:ranger-and-cleric-orders",
      "quest:forge-field-gear",
      "quest:fermentation-and-preservation",
    ],
    catchphrases: [
      catchphrase("line:pack-light", "Pack light, craft smart."),
      catchphrase("line:sealed-flask", "A sealed flask beats a soggy map."),
      catchphrase("line:trail-pickles", "Trail pickles are chemistry you can crunch."),
    ],
  }),
  character({
    id: "wizard-quillby",
    kind: "npc",
    name: "Wizard Quillby",
    title: "Scrollcraft Wizard",
    questRequesterRoles: ["wizard"],
    questIds: [
      "quest:first-flask",
      "quest:scribe-and-charm",
      "quest:leather-and-parchment",
      "quest:crystal-optics",
      "quest:star-map",
    ],
    catchphrases: [
      catchphrase("line:ink-spell", "Ink is a spell with good handwriting."),
      catchphrase("line:scroll-needs", "Scrolls need surface, seal, and shine."),
      catchphrase("line:stars-answer", "The stars answer careful questions."),
    ],
  }),
  character({
    id: "bard-brio",
    kind: "npc",
    name: "Bard Brio",
    title: "Fizzing Color Bard",
    questRequesterRoles: ["bard"],
    questIds: ["quest:fizzing-gases", "quest:acid-base-show", "quest:pigment-lab"],
    catchphrases: [
      catchphrase("line:bubble-chorus", "Bubbles deserve a chorus."),
      catchphrase("line:pigment-applause", "Red pigment, green pigment, grand applause."),
      catchphrase("line:fizz-verse", "If it fizzes, it gets a verse."),
    ],
  }),
  character({
    id: "rogue-sable",
    kind: "npc",
    name: "Rogue Sable",
    title: "Utility Trickster",
    questRequesterRoles: ["rogue"],
    questIds: ["quest:ranger-and-cleric-orders", "quest:stealth-and-polish"],
    catchphrases: [
      catchphrase("line:quiet-smoke", "Quiet smoke, clean getaway."),
      catchphrase("line:polish-shield", "Polish the shield, hide the fingerprints."),
      catchphrase("line:shadows-matter", "Even shadows are made of matter."),
    ],
  }),
  character({
    id: "cleric-maribel",
    kind: "npc",
    name: "Cleric Maribel",
    title: "Infirmary Healer",
    questRequesterRoles: ["cleric"],
    questIds: [
      "quest:lime-and-ceramics",
      "quest:potion-board",
      "quest:ranger-and-cleric-orders",
      "quest:guild-kits-and-care",
    ],
    catchphrases: [
      catchphrase("line:clean-salt", "Clean salt, calm hands, kind work."),
      catchphrase("line:salve-notes", "A good salve starts with good notes."),
      catchphrase("line:gentle-purpose", "Healing is chemistry with a gentle purpose."),
    ],
  }),
  character({
    id: "apprentice",
    kind: "player",
    name: "The Apprentice",
    title: "Guild Crafter",
    questRequesterRoles: ["player"],
    questIds: ["quest:guild-adventure-crate"],
    catchphrases: [
      catchphrase("line:new-pattern", "I found a new pattern."),
      catchphrase("line:five-slots", "Five slots can hold a whole idea."),
      catchphrase("line:one-more-wonder", "Let us craft one more wonder."),
    ],
  }),
] as const satisfies readonly DeepReadonly<AlchemyCharacter>[];

export type StaticAlchemyCharacter = (typeof ALCHEMY_CHARACTERS)[number];

export const AlchemyCharactersSchema = z.array(AlchemyCharacterSchema).min(1);

export const ALCHEMY_CHARACTER_BY_ID = Object.freeze(
  Object.fromEntries(
    ALCHEMY_CHARACTERS.map((currentCharacter) => [currentCharacter.id, currentCharacter]),
  ),
) as Readonly<Record<AlchemyCharacterId, StaticAlchemyCharacter>>;

export function getAlchemyCharacterById(id: string): StaticAlchemyCharacter | undefined {
  return ALCHEMY_CHARACTER_BY_ID[id as AlchemyCharacterId];
}

export function getAlchemyCharactersByRequester(
  requester: QuestRequester,
): StaticAlchemyCharacter[] {
  return ALCHEMY_CHARACTERS.filter((currentCharacter) =>
    currentCharacter.questRequesterRoles.some((currentRequester) => currentRequester === requester),
  );
}

export function validateAlchemyCharacterMedia(
  characters: readonly unknown[] = ALCHEMY_CHARACTERS,
): AlchemyCharacter[] {
  const parsedCharacters = AlchemyCharactersSchema.parse(characters);
  const characterIds = new Set<string>();

  for (const currentCharacter of parsedCharacters) {
    if (characterIds.has(currentCharacter.id)) {
      throw new Error(`Duplicate alchemy character id: ${currentCharacter.id}`);
    }
    characterIds.add(currentCharacter.id);

    const catchphraseIds = new Set(
      currentCharacter.catchphrases.map((catchphraseEntry) => catchphraseEntry.id),
    );
    if (catchphraseIds.size !== currentCharacter.catchphrases.length) {
      throw new Error(`Duplicate catchphrase id for ${currentCharacter.id}`);
    }

    for (const voiceClip of currentCharacter.voiceClips) {
      for (const catchphraseId of voiceClip.catchphraseIds) {
        if (!catchphraseIds.has(catchphraseId)) {
          throw new Error(
            `Voice clip ${voiceClip.id} for ${currentCharacter.id} references unknown catchphrase ${catchphraseId}`,
          );
        }
      }
    }
  }

  return parsedCharacters;
}
