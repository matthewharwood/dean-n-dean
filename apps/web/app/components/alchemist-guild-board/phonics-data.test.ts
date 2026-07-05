import { describe, expect, test } from "bun:test";

import {
  buildPhonicsAudioManifest,
  getPhonicsVowel,
  getPhonicsWordByFactId,
  getPhonicsWordsForLevel,
  PHONICS_LEVEL_ONE_WORD_COUNT,
  PHONICS_LEVEL_TWO_WORD_COUNT,
  PHONICS_VOWEL_KEYS,
  PHONICS_VOWELS,
  PHONICS_WORDS,
  PhonicsVowelKeySchema,
} from "@dean-stack/schemas";

// The phonics path is sized to MIRROR the addition path so the learning paths are
// equivalent in length: addition level 1 = 25 facts, level 2 = 100 facts.
const ADDITION_LEVEL_ONE_FACT_COUNT = 25;
const ADDITION_LEVEL_TWO_FACT_COUNT = 100;

describe("phonics dataset", () => {
  test("pool sizes mirror the addition path (25 / 100)", () => {
    expect(PHONICS_LEVEL_ONE_WORD_COUNT).toBe(ADDITION_LEVEL_ONE_FACT_COUNT);
    expect(PHONICS_LEVEL_TWO_WORD_COUNT).toBe(ADDITION_LEVEL_TWO_FACT_COUNT);
    expect(getPhonicsWordsForLevel(1)).toHaveLength(ADDITION_LEVEL_ONE_FACT_COUNT);
    expect(getPhonicsWordsForLevel(2)).toHaveLength(ADDITION_LEVEL_TWO_FACT_COUNT);
  });

  test("level 2 pool is a superset of level 1 (every L1 word also drills at L2)", () => {
    const levelTwoWords = new Set(getPhonicsWordsForLevel(2).map((entry) => entry.word));
    for (const entry of getPhonicsWordsForLevel(1)) {
      expect(levelTwoWords.has(entry.word)).toBe(true);
    }
  });

  test("words are unique and factIds round-trip", () => {
    const words = new Set<string>();
    const factIds = new Set<string>();
    for (const entry of PHONICS_WORDS) {
      expect(words.has(entry.word)).toBe(false);
      words.add(entry.word);
      expect(factIds.has(entry.factId)).toBe(false);
      factIds.add(entry.factId);

      expect(entry.factId).toBe(`phonics:${entry.vowelKey}:${entry.word}`);
      expect(entry.voiceClipPath).toBe(`phonics-words/${entry.word}.mp3`);
      expect(getPhonicsWordByFactId(entry.factId)).toEqual(entry);
    }
  });

  test("every word maps to a known vowel and every vowel is exercised", () => {
    const usedVowelKeys = new Set<string>();
    for (const entry of PHONICS_WORDS) {
      expect(() => PhonicsVowelKeySchema.parse(entry.vowelKey)).not.toThrow();
      // A word may not have a higher minLevel than its vowel is introduced at.
      expect(entry.minLevel).toBeGreaterThanOrEqual(getPhonicsVowel(entry.vowelKey).minLevel);
      usedVowelKeys.add(entry.vowelKey);
    }
    for (const key of PHONICS_VOWEL_KEYS) {
      expect(usedVowelKeys.has(key)).toBe(true);
    }
  });

  test("each level-1 vowel has at least two words so distractors exist", () => {
    const levelOneWords = getPhonicsWordsForLevel(1);
    for (const vowel of PHONICS_VOWELS.filter((entry) => entry.minLevel === 1)) {
      const count = levelOneWords.filter((entry) => entry.vowelKey === vowel.key).length;
      expect(count).toBeGreaterThanOrEqual(2);
    }
  });

  test("level-1 words only use vowels introduced at level 1", () => {
    for (const entry of getPhonicsWordsForLevel(1)) {
      expect(getPhonicsVowel(entry.vowelKey).minLevel).toBe(1);
    }
  });

  test("a 5-card phonics question can always be built (>= 4 distinct other vowels)", () => {
    for (const level of [1, 2]) {
      const pool = getPhonicsWordsForLevel(level);
      const vowelKeys = new Set(pool.map((entry) => entry.vowelKey));
      // The target's vowel plus four distractor vowels => at least 5 vowels in play.
      expect(vowelKeys.size).toBeGreaterThanOrEqual(5);
    }
  });
});

describe("phonics audio manifest", () => {
  test("covers every vowel (phonic + hint) and every unique word, with unique paths", () => {
    const manifest = buildPhonicsAudioManifest();
    const phonicEntries = manifest.filter((entry) => entry.kind === "vowel");
    const hintEntries = manifest.filter((entry) => entry.kind === "vowel-hint");
    const wordEntries = manifest.filter((entry) => entry.kind === "word");
    const uniqueWords = new Set(PHONICS_WORDS.map((entry) => entry.word));

    // Each vowel contributes two clips: the direct phonic and the teaching hint.
    expect(phonicEntries).toHaveLength(PHONICS_VOWELS.length);
    expect(hintEntries).toHaveLength(PHONICS_VOWELS.length);
    expect(wordEntries).toHaveLength(uniqueWords.size);

    const paths = manifest.map((entry) => entry.path);
    expect(new Set(paths).size).toBe(paths.length);

    const phonicPaths = new Set(PHONICS_VOWELS.map((entry) => entry.promptVoiceClipPath));
    for (const entry of phonicEntries) expect(phonicPaths.has(entry.path)).toBe(true);
    const hintPaths = new Set(PHONICS_VOWELS.map((entry) => entry.hintVoiceClipPath));
    for (const entry of hintEntries) expect(hintPaths.has(entry.path)).toBe(true);
  });
});
