import * as z from "zod";

// Phonics "listen & match" content for the gathering learning path.
//
// A phonics PROMPT plays a target vowel SOUND; the answer cards are WORDS, and
// the kid picks the word that contains that sound. Every card also gets its own
// tap-to-hear readout. Audio rides the same path-based voice-clip side channel as
// quest/character voices (`new Audio(resolvePublicAssetPath(path)).play()`), NOT
// the SoundId SFX enum — so a missing clip fails silently instead of breaking the
// SoundId contract. Real mp3s are fetched in bulk from ElevenLabs later; until
// then `scripts/scaffold-phonics-audio.ts` drops a placeholder at every path in
// `buildPhonicsAudioManifest()`.
//
// Pool sizes deliberately MIRROR the addition path so the three learning paths are
// equivalent in length: level 1 practices the 25 `minLevel === 1` words (addition
// level 1 = 25 facts); level 2 practices all 100 words (addition level 2 = 100
// facts). A "fact" for spaced repetition is a single target word.

export const PHONICS_VOWEL_KEYS = [
  // Level 1 — the five short vs. long vowel contrasts.
  "short-a",
  "long-a",
  "short-e",
  "long-e",
  "short-i",
  "long-i",
  "short-o",
  "long-o",
  "short-u",
  "long-u",
  // Level 2 — r-controlled, diphthongs, and the two `oo` sounds.
  "ar",
  "or",
  "er",
  "oo-long",
  "oo-short",
  "ow",
  "oy",
  "aw",
] as const;
export const PhonicsVowelKeySchema = z.enum(PHONICS_VOWEL_KEYS);
export type PhonicsVowelKey = z.infer<typeof PhonicsVowelKeySchema>;

// Public-asset path conventions (single dir segment + filename), matching the
// quest/character voice clip regex shape so `resolvePublicAssetPath` accepts them.
// Each vowel has TWO clips: the "phonic" (just the isolated sound — the direct
// play button) and the "hint" (a teaching phrase with an example word, only
// offered after a couple of wrong guesses).
export const PhonicsVowelClipPathSchema = z.string().regex(/^phonics-vowels\/[a-z-]+\.mp3$/);
export const PhonicsVowelHintClipPathSchema = z
  .string()
  .regex(/^phonics-vowels-hint\/[a-z-]+\.mp3$/);
export const PhonicsWordClipPathSchema = z.string().regex(/^phonics-words\/[a-z]+\.mp3$/);

export const PhonicsFactIdSchema = z.string().regex(/^phonics:[a-z-]+:[a-z]+$/);

export const PhonicsVowelSchema = z.object({
  exampleWord: z.string().regex(/^[a-z]+$/),
  // Plain-text line for the TTS hint clip (a teaching phrase, e.g. "Short A, like
  // in cat") — IPA is unreliable for TTS, so each vowel carries an explicit script.
  hintSayText: z.string().min(1),
  hintVoiceClipPath: PhonicsVowelHintClipPathSchema,
  ipa: z.string().min(1),
  key: PhonicsVowelKeySchema,
  // Kid-facing label shown on the prompt, e.g. "short a".
  label: z.string().min(1),
  minLevel: z.int().min(1).max(2),
  // Plain-text line for the direct "phonic" clip — just the isolated sound.
  phonicSayText: z.string().min(1),
  promptVoiceClipPath: PhonicsVowelClipPathSchema,
});
export type PhonicsVowel = z.infer<typeof PhonicsVowelSchema>;

export const PhonicsWordSchema = z.object({
  factId: PhonicsFactIdSchema,
  minLevel: z.int().min(1).max(2),
  voiceClipPath: PhonicsWordClipPathSchema,
  vowelKey: PhonicsVowelKeySchema,
  word: z.string().regex(/^[a-z]+$/),
});
export type PhonicsWord = z.infer<typeof PhonicsWordSchema>;

function vowel(
  key: PhonicsVowelKey,
  label: string,
  ipa: string,
  exampleWord: string,
  minLevel: number,
  phonicSayText: string,
  hintSayText: string,
): PhonicsVowel {
  return PhonicsVowelSchema.parse({
    exampleWord,
    hintSayText,
    hintVoiceClipPath: `phonics-vowels-hint/${key}.mp3`,
    ipa,
    key,
    label,
    minLevel,
    phonicSayText,
    promptVoiceClipPath: `phonics-vowels/${key}.mp3`,
  });
}

function word(text: string, vowelKey: PhonicsVowelKey, minLevel: number): PhonicsWord {
  return PhonicsWordSchema.parse({
    factId: `phonics:${vowelKey}:${text}`,
    minLevel,
    voiceClipPath: `phonics-words/${text}.mp3`,
    vowelKey,
    word: text,
  });
}

// Each vowel: phonicSayText (the direct, isolated sound) then hintSayText (the
// teaching phrase shown only after a couple of wrong guesses). Long vowels "say
// their name", so their phonic is just the letter name.
export const PHONICS_VOWELS: readonly PhonicsVowel[] = [
  vowel("short-a", "short a", "/æ/", "cat", 1, "Aaa.", "Short A. Ah, ah, ah. Like in cat."),
  vowel("long-a", "long a", "/eɪ/", "cake", 1, "Ayy.", "Long A says its name. Like in cake."),
  vowel("short-e", "short e", "/ɛ/", "bed", 1, "Ehh.", "Short E. Eh, eh, eh. Like in bed."),
  vowel("long-e", "long e", "/iː/", "bee", 1, "Eee.", "Long E says its name. Like in bee."),
  vowel("short-i", "short i", "/ɪ/", "pig", 1, "Ihh.", "Short I. Ih, ih, ih. Like in pig."),
  vowel("long-i", "long i", "/aɪ/", "kite", 1, "Eye.", "Long I says its name. Like in kite."),
  vowel("short-o", "short o", "/ɒ/", "dog", 1, "Ahh.", "Short O. Ah, ah, ah. Like in dog."),
  vowel("long-o", "long o", "/oʊ/", "boat", 1, "Ohh.", "Long O says its name. Like in boat."),
  vowel("short-u", "short u", "/ʌ/", "sun", 1, "Uhh.", "Short U. Uh, uh, uh. Like in sun."),
  vowel("long-u", "long u", "/juː/", "cube", 1, "Yoo.", "Long U says its name. Like in cube."),
  vowel("ar", "ar", "/ɑːr/", "car", 2, "Arr.", "Ar. Like a pirate, arr. Like in car."),
  vowel("or", "or", "/ɔːr/", "corn", 2, "Or.", "Or. Like in corn."),
  vowel("er", "er", "/ɜːr/", "bird", 2, "Err.", "Er. Like in bird."),
  vowel(
    "oo-long",
    "long oo",
    "/uː/",
    "moon",
    2,
    "Ooo.",
    "Long oo. Like a ghost, oooo. Like in moon.",
  ),
  vowel("oo-short", "short oo", "/ʊ/", "book", 2, "Uu.", "Short oo. Like in book."),
  vowel("ow", "ow", "/aʊ/", "cow", 2, "Ow.", "Ow. Like it hurts, owww. Like in cow."),
  vowel("oy", "oy", "/ɔɪ/", "boy", 2, "Oy.", "Oy. Like in boy."),
  vowel("aw", "aw", "/ɔː/", "saw", 2, "Aw.", "Aw. Like in saw."),
];

export const PHONICS_WORDS: readonly PhonicsWord[] = [
  // ---- Level 1 pool (25 words: the five short/long vowel contrasts) ----
  word("cat", "short-a", 1),
  word("map", "short-a", 1),
  word("bag", "short-a", 1),
  word("cake", "long-a", 1),
  word("rain", "long-a", 1),
  word("gate", "long-a", 1),
  word("bed", "short-e", 1),
  word("net", "short-e", 1),
  word("hen", "short-e", 1),
  word("bee", "long-e", 1),
  word("leaf", "long-e", 1),
  word("tree", "long-e", 1),
  word("pig", "short-i", 1),
  word("ship", "short-i", 1),
  word("fish", "short-i", 1),
  word("kite", "long-i", 1),
  word("bike", "long-i", 1),
  word("dog", "short-o", 1),
  word("pot", "short-o", 1),
  word("boat", "long-o", 1),
  word("rope", "long-o", 1),
  word("sun", "short-u", 1),
  word("cup", "short-u", 1),
  word("cube", "long-u", 1),
  word("mule", "long-u", 1),

  // ---- Level 2 pool (+75 words: more of each L1 vowel, plus new vowels) ----
  // More practice on the level-1 contrasts.
  word("ham", "short-a", 2),
  word("jam", "short-a", 2),
  word("hand", "short-a", 2),
  word("lamp", "short-a", 2),
  word("tail", "long-a", 2),
  word("snail", "long-a", 2),
  word("plane", "long-a", 2),
  word("web", "short-e", 2),
  word("jet", "short-e", 2),
  word("nest", "short-e", 2),
  word("seed", "long-e", 2),
  word("queen", "long-e", 2),
  word("key", "long-e", 2),
  word("bean", "long-e", 2),
  word("lip", "short-i", 2),
  word("milk", "short-i", 2),
  word("hill", "short-i", 2),
  word("night", "long-i", 2),
  word("light", "long-i", 2),
  word("fly", "long-i", 2),
  word("tie", "long-i", 2),
  word("frog", "short-o", 2),
  word("rock", "short-o", 2),
  word("sock", "short-o", 2),
  word("box", "short-o", 2),
  word("top", "short-o", 2),
  word("nose", "long-o", 2),
  word("goat", "long-o", 2),
  word("snow", "long-o", 2),
  word("bug", "short-u", 2),
  word("duck", "short-u", 2),
  word("drum", "short-u", 2),
  word("flute", "long-u", 2),
  word("tube", "long-u", 2),
  word("june", "long-u", 2),
  // New level-2 vowels: r-controlled.
  word("car", "ar", 2),
  word("star", "ar", 2),
  word("jar", "ar", 2),
  word("farm", "ar", 2),
  word("arm", "ar", 2),
  word("corn", "or", 2),
  word("fork", "or", 2),
  word("horn", "or", 2),
  word("storm", "or", 2),
  word("north", "or", 2),
  word("bird", "er", 2),
  word("fern", "er", 2),
  word("turn", "er", 2),
  word("girl", "er", 2),
  word("nurse", "er", 2),
  // The two `oo` sounds.
  word("moon", "oo-long", 2),
  word("spoon", "oo-long", 2),
  word("boot", "oo-long", 2),
  word("zoo", "oo-long", 2),
  word("food", "oo-long", 2),
  word("book", "oo-short", 2),
  word("foot", "oo-short", 2),
  word("hook", "oo-short", 2),
  word("wood", "oo-short", 2),
  word("cook", "oo-short", 2),
  // Diphthongs.
  word("cow", "ow", 2),
  word("owl", "ow", 2),
  word("house", "ow", 2),
  word("mouse", "ow", 2),
  word("cloud", "ow", 2),
  word("boy", "oy", 2),
  word("coin", "oy", 2),
  word("toy", "oy", 2),
  word("oil", "oy", 2),
  word("soil", "oy", 2),
  word("saw", "aw", 2),
  word("paw", "aw", 2),
  word("hawk", "aw", 2),
  word("claw", "aw", 2),
  word("yawn", "aw", 2),
];

const PHONICS_VOWELS_BY_KEY: ReadonlyMap<PhonicsVowelKey, PhonicsVowel> = new Map(
  PHONICS_VOWELS.map((entry) => [entry.key, entry]),
);
const PHONICS_WORDS_BY_FACT_ID: ReadonlyMap<string, PhonicsWord> = new Map(
  PHONICS_WORDS.map((entry) => [entry.factId, entry]),
);

export function getPhonicsVowel(key: PhonicsVowelKey): PhonicsVowel {
  const found = PHONICS_VOWELS_BY_KEY.get(key);
  if (!found) throw new Error(`phonics: no vowel for key "${key}"`);
  return found;
}

export function getPhonicsWordByFactId(factId: string): PhonicsWord | undefined {
  return PHONICS_WORDS_BY_FACT_ID.get(factId);
}

/** Words practiced at a given level: level 1 = the 25 L1 words; level 2 = all 100. */
export function getPhonicsWordsForLevel(level: number): PhonicsWord[] {
  return PHONICS_WORDS.filter((entry) => entry.minLevel <= level);
}

export const PHONICS_LEVEL_ONE_WORD_COUNT = getPhonicsWordsForLevel(1).length;
export const PHONICS_LEVEL_TWO_WORD_COUNT = getPhonicsWordsForLevel(2).length;

export const PhonicsAudioManifestEntrySchema = z.object({
  kind: z.enum(["vowel", "vowel-hint", "word"]),
  label: z.string().min(1),
  path: z.string().regex(/^phonics-(?:vowels|vowels-hint|words)\/[a-z-]+\.mp3$/),
  text: z.string().min(1),
});
export type PhonicsAudioManifestEntry = z.infer<typeof PhonicsAudioManifestEntrySchema>;

// Every audio clip the phonics path needs, with the exact text to synthesize and
// the public path to write it to. Drives both the placeholder scaffolder and the
// ElevenLabs fetch pass. Each vowel has two clips (the direct phonic + the hint);
// word clips are deduped by path (a word appears once).
export function buildPhonicsAudioManifest(): PhonicsAudioManifestEntry[] {
  const entries: PhonicsAudioManifestEntry[] = PHONICS_VOWELS.flatMap((entry) => [
    PhonicsAudioManifestEntrySchema.parse({
      kind: "vowel",
      label: `${entry.label} ${entry.ipa}`,
      path: entry.promptVoiceClipPath,
      text: entry.phonicSayText,
    }),
    PhonicsAudioManifestEntrySchema.parse({
      kind: "vowel-hint",
      label: `${entry.label} hint`,
      path: entry.hintVoiceClipPath,
      text: entry.hintSayText,
    }),
  ]);

  const seenWordPaths = new Set<string>();
  for (const entry of PHONICS_WORDS) {
    if (seenWordPaths.has(entry.voiceClipPath)) continue;
    seenWordPaths.add(entry.voiceClipPath);
    entries.push(
      PhonicsAudioManifestEntrySchema.parse({
        kind: "word",
        label: entry.word,
        path: entry.voiceClipPath,
        // A single clearly-spoken word for a young child.
        text: `${entry.word.charAt(0).toUpperCase()}${entry.word.slice(1)}.`,
      }),
    );
  }

  return entries;
}
