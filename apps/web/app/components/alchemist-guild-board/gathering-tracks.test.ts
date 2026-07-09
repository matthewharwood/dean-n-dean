import { describe, expect, test } from "bun:test";
import {
  ALCHEMIST_GUILD_BOARD_DEFAULT,
  ALCHEMIST_GUILD_GATHERING_DEFAULT,
  AlchemistGuildBoardStateSchema,
  AlchemistGuildGatheringPhonicsPromptSchema,
  getPhonicsVowel,
  getPhonicsWordByFactId,
} from "@dean-stack/schemas";

import {
  answerGatheringBossChallenge,
  answerGatheringBossPhonics,
  claimGatheringBossReward,
  confirmGatheringPhonicsAnswer,
  createActiveGatheringBossTestState,
  createGatheringBossReadyState,
  createGatheringEquation,
  createGatheringLevelMasteryReport,
  createGatheringPhonicsPrompt,
  createGatheringRound,
  GATHERING_BOSS_REQUIRED_STREAK,
  getGatheringPathMap,
  selectGatheringPhonicsChoice,
  selectGatheringTrack,
} from "./gathering-loop";

const NOW = 1_700_000_000_000;

describe("subtraction track mirrors addition", () => {
  test("equations subtract, never go negative, and carry the minus operator", () => {
    for (let round = 1; round <= 40; round += 1) {
      const equation = createGatheringEquation(round, round + 1, undefined, NOW, 10, "subtraction");
      expect(equation.operator).toBe("-");
      expect(equation.factId.startsWith("subtraction:")).toBe(true);
      expect(equation.answer).toBe(equation.left - equation.right);
      expect(equation.answer).toBeGreaterThanOrEqual(0);
      expect(equation.left).toBeLessThanOrEqual(10);
      expect(equation.choiceValues).toContain(equation.answer);
      expect(new Set(equation.choiceValues).size).toBe(5);
    }
  });

  test("the fact pool is the same size as addition (25 at level 1, 100 at level 2)", () => {
    const levelOne = createGatheringBossReadyState(1, NOW, "subtraction");
    const levelTwo = createGatheringBossReadyState(2, NOW, "subtraction");
    expect(createGatheringLevelMasteryReport(levelOne, NOW).totalFactCount).toBe(25);
    expect(createGatheringLevelMasteryReport(levelTwo, NOW).totalFactCount).toBe(100);
  });
});

describe("phonics track", () => {
  test("a prompt has exactly one card matching the target vowel sound", () => {
    for (let round = 1; round <= 40; round += 1) {
      const prompt = createGatheringPhonicsPrompt(2, round, round + 1);
      expect(prompt.choices).toHaveLength(5);
      expect(new Set(prompt.choices.map((choice) => choice.factId)).size).toBe(5);

      const matches = prompt.choices.filter((c) => c.vowelKey === prompt.targetVowelKey);
      expect(matches).toHaveLength(1);
      expect(matches[0]?.factId).toBe(prompt.correctFactId);

      // The prompt plays the target vowel's sound; the target word exists.
      expect(prompt.promptVoiceClipPath).toBe(
        getPhonicsVowel(prompt.targetVowelKey).promptVoiceClipPath,
      );
      expect(getPhonicsWordByFactId(prompt.correctFactId)).toBeDefined();
    }
  });

  test("the level-1 pool equals addition's (25 facts), level 2 is 100", () => {
    expect(
      createGatheringLevelMasteryReport(createGatheringBossReadyState(1, NOW, "phonics"), NOW)
        .totalFactCount,
    ).toBe(25);
    expect(
      createGatheringLevelMasteryReport(createGatheringBossReadyState(2, NOW, "phonics"), NOW)
        .totalFactCount,
    ).toBe(100);
  });

  test("only the matching word unlocks the attack and records the fact", () => {
    const round = createGatheringRound(1, undefined, undefined, "phonics");
    const prompt = round.phonicsPrompt;
    if (!prompt) throw new Error("expected a phonics prompt");

    const wrong = prompt.choices.find((c) => c.factId !== prompt.correctFactId);
    if (!wrong) throw new Error("expected a distractor");

    const missed = confirmGatheringPhonicsAnswer(
      selectGatheringPhonicsChoice(round, wrong.factId),
      NOW,
    );
    expect(missed.phase).toBe("solving");
    expect(missed.lastAnswerCorrect).toBe(false);

    const solved = confirmGatheringPhonicsAnswer(
      selectGatheringPhonicsChoice(round, prompt.correctFactId),
      NOW + 1_000,
    );
    expect(solved.phase).toBe("move");
    expect(solved.lastAnswerCorrect).toBe(true);
    const fact = solved.spacedRepetition.facts[prompt.correctFactId];
    expect(fact?.correctCount).toBe(1);
  });

  test("the phonics boss runs on audio prompts and rewards after 20 in a row", () => {
    let state = createActiveGatheringBossTestState(1, NOW, "phonics");
    expect(state.boss.phonicsPrompt).not.toBeNull();

    for (let index = 0; index < GATHERING_BOSS_REQUIRED_STREAK; index += 1) {
      const correctFactId = state.boss.phonicsPrompt?.correctFactId ?? null;
      state = answerGatheringBossPhonics(state, correctFactId, NOW + 100 + index * 100);
    }
    expect(state.boss.phase).toBe("reward");
    expect(state.boss.rewardCardIds).toHaveLength(6);
  });
});

describe("hydration safety (Pillar 3 — persisted records re-parse)", () => {
  // A phonics prompt written before `hintVoiceClipPath` existed must re-parse on
  // hydration instead of throwing a ZodError. Build a current prompt, drop the
  // newer field (the old on-disk shape), and re-parse.
  test("a phonics prompt missing hintVoiceClipPath heals on re-parse", () => {
    const round = createGatheringRound(1, undefined, undefined, "phonics");
    const prompt = round.phonicsPrompt;
    if (!prompt) throw new Error("expected a phonics prompt");

    const legacyPrompt = {
      choices: prompt.choices,
      correctFactId: prompt.correctFactId,
      id: prompt.id,
      promptVoiceClipPath: prompt.promptVoiceClipPath,
      selectedFactId: prompt.selectedFactId,
      targetLabel: prompt.targetLabel,
      targetVowelKey: prompt.targetVowelKey,
    };

    const reparsed = AlchemistGuildGatheringPhonicsPromptSchema.parse(legacyPrompt);
    expect(reparsed.hintVoiceClipPath).toBe(`phonics-vowels-hint/${prompt.targetVowelKey}.mp3`);
  });

  test("the whole board state re-parses a legacy phonics prompt without throwing", () => {
    const round = createGatheringRound(1, undefined, undefined, "phonics");
    const prompt = round.phonicsPrompt;
    if (!prompt) throw new Error("expected a phonics prompt");

    const legacyBoard = {
      ...ALCHEMIST_GUILD_BOARD_DEFAULT,
      gathering: {
        ...round,
        phonicsPrompt: {
          choices: prompt.choices,
          correctFactId: prompt.correctFactId,
          id: prompt.id,
          promptVoiceClipPath: prompt.promptVoiceClipPath,
          selectedFactId: prompt.selectedFactId,
          targetLabel: prompt.targetLabel,
          targetVowelKey: prompt.targetVowelKey,
        },
        selectedTrack: "phonics" as const,
      },
    };

    expect(() => AlchemistGuildBoardStateSchema.parse(legacyBoard)).not.toThrow();
  });
});

describe("learning-path map + lock rules", () => {
  test("a fresh player sees all three tracks at level 1 with no path selected", () => {
    const gathering = ALCHEMIST_GUILD_GATHERING_DEFAULT;
    expect(gathering.selectedTrack).toBeNull();

    const map = getGatheringPathMap(gathering);
    expect(map.map((option) => option.track).toSorted()).toEqual([
      "addition",
      "phonics",
      "subtraction",
    ]);
    for (const option of map) {
      expect(option.level).toBe(1);
      expect(option.isComplete).toBe(false);
    }
  });

  test("selecting a path locks it; you cannot switch until the boss falls", () => {
    const onMap = ALCHEMIST_GUILD_GATHERING_DEFAULT;
    const playing = selectGatheringTrack(onMap, "subtraction");
    expect(playing.selectedTrack).toBe("subtraction");
    expect(playing.equation.operator).toBe("-");

    // Locked: trying to switch to another path is refused while one is in progress.
    const stillSubtraction = selectGatheringTrack(playing, "phonics");
    expect(stillSubtraction.selectedTrack).toBe("subtraction");
  });

  test("beating a track's level 1 unlocks ONLY that track's level 2", () => {
    // Beat addition level 1.
    let state = createActiveGatheringBossTestState(1, NOW, "addition");
    for (let index = 0; index < GATHERING_BOSS_REQUIRED_STREAK; index += 1) {
      state = answerGatheringBossChallenge(
        state,
        state.boss.equation.answer,
        NOW + 100 + index * 100,
      );
    }
    const onMap = claimGatheringBossReward(state, NOW + 5_000);
    expect(onMap.selectedTrack).toBeNull();

    const map = getGatheringPathMap(onMap);
    const byTrack = new Map(map.map((option) => [option.track, option]));
    // Addition advanced to level 2; the other tracks are still only level 1 — there
    // is no path to subtraction/phonics level 2 without beating their own level 1.
    expect(byTrack.get("addition")?.level).toBe(2);
    expect(byTrack.get("addition")?.completedLevels).toContain(1);
    expect(byTrack.get("subtraction")?.level).toBe(1);
    expect(byTrack.get("phonics")?.level).toBe(1);

    // Re-selecting addition resumes it at level 2; selecting another track is level 1.
    expect(selectGatheringTrack(onMap, "addition").levelProgress.currentLevel).toBe(2);
    expect(selectGatheringTrack(onMap, "phonics").levelProgress.currentLevel).toBe(1);
  });
});
