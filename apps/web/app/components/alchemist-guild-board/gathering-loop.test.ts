import { describe, expect, test } from "bun:test";
import {
  ALCHEMIST_GUILD_BOARD_DEFAULT,
  ALCHEMIST_GUILD_GATHERING_ELEMENT_TYPES,
  ALCHEMIST_GUILD_GATHERING_MONSTER_DEFAULT,
  ALCHEMIST_GUILD_GATHERING_SPACED_REPETITION_DEFAULT,
  ALCHEMY_GATHERING_ENEMIES,
  GATHERING_ENEMY_LADDER_LENGTH,
  getGatheringEnemyImagePath,
} from "@dean-stack/schemas";

import type { GatheringElementType } from "./gathering-elements";
import {
  answerGatheringBossChallenge,
  claimGatheringBossReward,
  claimGatheringReward,
  clearGatheringAnswer,
  confirmGatheringAnswer,
  createActiveGatheringBossTestState,
  createGatheringBossReadyState,
  createGatheringEquation,
  createGatheringLevelMasteryReport,
  createGatheringMonsterForRound,
  createGatheringRewardOptions,
  createGatheringRewardPlan,
  createGatheringRound,
  createGatheringSpacedRepetitionReport,
  GATHERING_BOSS_ALLOWED_MISSES,
  GATHERING_BOSS_REQUIRED_STREAK,
  GATHERING_LEVEL_MASTERY_THRESHOLD,
  getGatheringFactRetrievability,
  getGatheringMoves,
  recordGatheringMasteryProgress,
  resetGatheringEquationAfterWrongStreak,
  reviewGatheringSpacedRepetitionFact,
  selectGatheringAnswer,
  selectGatheringMove,
  swapGatheringAnswerWithChoice,
  swapGatheringChoices,
} from "./gathering-loop";
import { NEW_REWARD_SLOT_UPGRADE_ID } from "./upgrades";

describe("gathering loop", () => {
  test("deals addition equations with the correct answer in the choices", () => {
    const equation = createGatheringEquation(1, 1);

    expect(equation.answer).toBe(equation.left + equation.right);
    expect(equation.answer).toBeLessThanOrEqual(10);
    expect(equation.choiceValues).toHaveLength(5);
    expect(new Set(equation.choiceValues).size).toBe(5);
    expect(equation.choiceValues).toContain(equation.answer);
  });

  test("caps gathering answer values by level", () => {
    for (let round = 1; round <= 30; round += 1) {
      const levelOneEquation = createGatheringEquation(round, round + 1);
      const levelTwoEquation = createGatheringEquation(round, round + 1, undefined, 1_000, 20);

      expect(levelOneEquation.answer).toBeLessThanOrEqual(10);
      expect(levelTwoEquation.answer).toBeLessThanOrEqual(20);
    }

    const levelOneBoss = createActiveGatheringBossTestState(1, 1_000_000);
    const levelTwoBoss = createActiveGatheringBossTestState(2, 1_000_000);

    expect(levelOneBoss.boss.equation.answer).toBeLessThanOrEqual(10);
    expect(levelTwoBoss.boss.equation.answer).toBeLessThanOrEqual(20);
  });

  test("only the correct answer unlocks math-derived moves", () => {
    const round = createGatheringRound(1);
    const wrongAnswer = round.equation.choiceValues.find(
      (value) => value !== round.equation.answer,
    );
    if (wrongAnswer === undefined) throw new Error("expected a distractor answer");

    const missed = selectGatheringAnswer(round, wrongAnswer);
    expect(missed.equation.selectedValue).toBe(wrongAnswer);
    expect(missed.lastAnswerCorrect).toBeNull();
    expect(missed.phase).toBe("solving");

    const confirmedMiss = confirmGatheringAnswer(missed);
    expect(confirmedMiss.phase).toBe("solving");
    expect(confirmedMiss.lastAnswerCorrect).toBe(false);
    expect(confirmedMiss.wrongAnswerStreak).toBe(1);

    const staged = selectGatheringAnswer(confirmedMiss, round.equation.answer);
    expect(staged.phase).toBe("solving");
    expect(staged.lastAnswerCorrect).toBeNull();

    const solved = confirmGatheringAnswer(staged);
    expect(solved.phase).toBe("move");
    expect(solved.lastAnswerCorrect).toBe(true);
    expect(solved.wrongAnswerStreak).toBe(0);

    const sumStrike = getGatheringMoves(solved.equation).find((move) => move.id === "sum-strike");
    expect(sumStrike?.damage).toBe(round.equation.answer);
  });

  test("slotting an answer waits for confirmation before unlocking attacks", () => {
    const round = createGatheringRound(1);

    const staged = selectGatheringAnswer(round, round.equation.answer);
    expect(staged.phase).toBe("solving");
    expect(staged.lastAnswerCorrect).toBeNull();

    const solved = confirmGatheringAnswer(staged);
    expect(solved.phase).toBe("move");
    expect(solved.lastAnswerCorrect).toBe(true);
  });

  test("records addition fact memory after correct and wrong answers", () => {
    const reviewedAtMs = 1_000_000;
    const round = createGatheringRound(1);
    const solved = confirmGatheringAnswer(
      selectGatheringAnswer(round, round.equation.answer),
      reviewedAtMs,
    );
    const fact = solved.spacedRepetition.facts[round.equation.factId];
    if (!fact) throw new Error("expected reviewed fact");

    expect(fact.attempts).toBe(1);
    expect(fact.correctCount).toBe(1);
    expect(fact.currentStreak).toBe(1);
    expect(fact.dueAtMs).toBeGreaterThan(reviewedAtMs);
    expect(fact.difficulty).toBeLessThan(5.3);

    const wrongAnswer = round.equation.choiceValues.find(
      (value) => value !== round.equation.answer,
    );
    if (wrongAnswer === undefined) throw new Error("expected a distractor answer");

    const retry = clearGatheringAnswer(solved);
    const missed = confirmGatheringAnswer(
      selectGatheringAnswer(retry, wrongAnswer),
      reviewedAtMs + 1_000,
    );
    const missedFact = missed.spacedRepetition.facts[round.equation.factId];
    if (!missedFact) throw new Error("expected missed fact");

    expect(missedFact.attempts).toBe(2);
    expect(missedFact.wrongCount).toBe(1);
    expect(missedFact.lapses).toBe(1);
    expect(missedFact.currentStreak).toBe(0);
    expect(missedFact.difficulty).toBeGreaterThan(fact.difficulty);
  });

  test("schedules due facts before introducing more addition facts", () => {
    const nowMs = 4_000_000;
    const oldEquation = createGatheringEquation(1, 1);
    const reviewed = reviewGatheringSpacedRepetitionFact(
      ALCHEMIST_GUILD_GATHERING_SPACED_REPETITION_DEFAULT,
      oldEquation,
      false,
      nowMs - 60_000,
    );

    const nextEquation = createGatheringEquation(2, 3, reviewed, nowMs);

    expect(nextEquation.factId).toBe(oldEquation.factId);
    expect(nextEquation.answer).toBe(oldEquation.answer);
  });

  test("reports spaced repetition progress for the admin panel", () => {
    const nowMs = 8_000_000;
    const equation = createGatheringEquation(1, 1);
    const reviewed = reviewGatheringSpacedRepetitionFact(
      ALCHEMIST_GUILD_GATHERING_SPACED_REPETITION_DEFAULT,
      equation,
      true,
      nowMs - 2_000,
    );
    const report = createGatheringSpacedRepetitionReport(reviewed, nowMs);
    const fact = reviewed.facts[equation.factId];
    if (!fact) throw new Error("expected reviewed fact");

    expect(report.totalFacts).toBe(1);
    expect(report.totalAttempts).toBe(1);
    expect(report.accuracy).toBe(1);
    expect(report.needsAttention[0]?.factId).toBe(equation.factId);
    expect(getGatheringFactRetrievability(fact, nowMs)).toBeGreaterThan(0.9);
  });

  test("persists level mastery progress on the gathering state", () => {
    const ready = createGatheringBossReadyState(1, 1_700_000_000_000);
    const report = createGatheringLevelMasteryReport(ready, 1_700_000_000_000);
    const recorded = recordGatheringMasteryProgress(ready, report);

    expect(recorded.levelProgress.masteryProgressByLevel["1"]).toBe(report.progress);
    expect(createGatheringLevelMasteryReport(recorded, 1_700_000_000_000).progress).toBe(
      report.progress,
    );
  });

  test("Memory track follows spaced repetition: progress grows with each correct rep", () => {
    const nowMs = 1_700_000_000_000;
    const gathering = ALCHEMIST_GUILD_BOARD_DEFAULT.gathering;
    const equation = createGatheringEquation(1, 1);
    const progressAt = (
      spacedRepetition: typeof ALCHEMIST_GUILD_GATHERING_SPACED_REPETITION_DEFAULT,
      atMs: number,
    ) => createGatheringLevelMasteryReport({ ...gathering, spacedRepetition }, atMs).progress;

    // The track starts empty; the regression was that it stayed at 0 during normal
    // play because progress only counted fully-mastered facts. A single correct rep
    // must now move it, and each further rep keeps it growing.
    const initialProgress = progressAt(ALCHEMIST_GUILD_GATHERING_SPACED_REPETITION_DEFAULT, nowMs);
    expect(initialProgress).toBe(0);

    let spacedRepetition = ALCHEMIST_GUILD_GATHERING_SPACED_REPETITION_DEFAULT;
    let previousProgress = initialProgress;
    for (let rep = 0; rep < 3; rep += 1) {
      const reviewedAtMs = nowMs + rep * 1_000;
      spacedRepetition = reviewGatheringSpacedRepetitionFact(
        spacedRepetition,
        equation,
        true,
        reviewedAtMs,
      );
      const progress = progressAt(spacedRepetition, reviewedAtMs);
      expect(progress).toBeGreaterThan(previousProgress);
      previousProgress = progress;
    }

    // The real player answer flow feeds the same growth.
    const round = createGatheringRound(1);
    const answered = confirmGatheringAnswer(
      selectGatheringAnswer(round, round.equation.answer),
      nowMs,
    );
    expect(createGatheringLevelMasteryReport(answered, nowMs).progress).toBeGreaterThan(0);
  });

  test("each attack move declares its own sound effect", () => {
    const round = createGatheringRound(1);
    const soundIds = getGatheringMoves(round.equation).map((move) => move.soundId);

    expect(soundIds).toEqual([
      "gathering.attack.leftSpark",
      "gathering.attack.rightSpark",
      "gathering.attack.sumStrike",
    ]);
    expect(new Set(soundIds).size).toBe(soundIds.length);
  });

  test("moves damage the monster until a reward choice appears", () => {
    const round = createGatheringRound(1);
    const almostDefeated = {
      ...confirmGatheringAnswer(selectGatheringAnswer(round, round.equation.answer)),
      monster: { ...round.monster, hp: 1 },
    };

    const rewarded = selectGatheringMove(almostDefeated, "sum-strike");
    expect(rewarded.phase).toBe("reward");
    expect(rewarded.monster.hp).toBe(0);
    expect(rewarded.rewardOptionCardIds).toHaveLength(3);
  });

  test("the elemental matchup scales the damage a move deals", () => {
    const round = createGatheringRound(1);
    const solved = confirmGatheringAnswer(selectGatheringAnswer(round, round.equation.answer));
    const leftSpark = getGatheringMoves(solved.equation).find((move) => move.id === "left-spark");
    if (!leftSpark) throw new Error("expected left-spark move");

    // left-spark is lightning: super (1.5×) vs water, resisted (0.5×) vs nature.
    const highHp = 200;
    const withEnemyElement = (elementType: GatheringElementType) => ({
      ...solved,
      monster: { ...solved.monster, elementType, hp: highHp, maxHp: highHp },
    });

    const superHit = selectGatheringMove(withEnemyElement("water"), "left-spark");
    const resistHit = selectGatheringMove(withEnemyElement("nature"), "left-spark");
    const neutralHit = selectGatheringMove(withEnemyElement("lightning"), "left-spark");

    expect(highHp - superHit.monster.hp).toBe(Math.max(1, Math.round(leftSpark.damage * 1.5)));
    expect(highHp - resistHit.monster.hp).toBe(Math.max(1, Math.round(leftSpark.damage * 0.5)));
    expect(highHp - neutralHit.monster.hp).toBe(leftSpark.damage);
  });

  test("three wrong gathering answers reset the equation and hand", () => {
    let state = createGatheringRound(1);
    const firstEquationId = state.equation.id;

    for (let missCount = 1; missCount <= 3; missCount += 1) {
      const wrongAnswer = state.equation.choiceValues.find(
        (value) => value !== state.equation.answer,
      );
      if (wrongAnswer === undefined) throw new Error("expected a distractor answer");

      state = confirmGatheringAnswer(selectGatheringAnswer(state, wrongAnswer));
      expect(state.wrongAnswerStreak).toBe(missCount);
    }

    const reset = resetGatheringEquationAfterWrongStreak(state);
    expect(reset.wrongAnswerStreak).toBe(0);
    expect(reset.equationIndex).toBe(2);
    expect(reset.equation.id).not.toBe(firstEquationId);
    expect(reset.equation.selectedValue).toBeNull();
    expect(reset.lastAnswerCorrect).toBeNull();
  });

  test("weights post-water gathering rewards toward the next quest window", () => {
    const options = createGatheringRewardOptions(2, {
      ...ALCHEMIST_GUILD_BOARD_DEFAULT,
      completedQuestIds: ["quest:first-water"],
    });
    const kitchenNeeds = new Set(["element:na", "element:cl", "raw:wood"]);
    const focusedNeedCount = options.filter((cardId) => kitchenNeeds.has(cardId)).length;

    expect(options).toHaveLength(3);
    expect(new Set(options).size).toBe(3);
    expect(focusedNeedCount).toBeGreaterThanOrEqual(2);
  });

  test("the New Reward Slot upgrade can add a 4th reward option after a kill", () => {
    const withUpgrade = {
      ...ALCHEMIST_GUILD_BOARD_DEFAULT,
      unlockedUpgradeIds: [NEW_REWARD_SLOT_UPGRADE_ID],
    };
    const lengths = new Set<number>();
    for (let round = 1; round <= 60; round += 1) {
      lengths.add(createGatheringRewardPlan(round, withUpgrade).cardIds.length);
    }
    // The 50% coin flip yields both 3- and 4-option plans over many rounds.
    expect(lengths.has(3)).toBe(true);
    expect(lengths.has(4)).toBe(true);
  });

  test("without the New Reward Slot upgrade the reward plan stays at 3 options", () => {
    for (let round = 1; round <= 30; round += 1) {
      expect(createGatheringRewardPlan(round, ALCHEMIST_GUILD_BOARD_DEFAULT).cardIds).toHaveLength(
        3,
      );
    }
  });

  test("a New Reward Slot 4th option survives selectGatheringMove's schema parse", () => {
    // Regression guard: the reward-plan unit tests above only build the plan in
    // isolation. The real kill path runs the plan through
    // AlchemistGuildGatheringStateSchema.parse in selectGatheringMove, which capped
    // rewardOptionCardIds at 3 — so a 4-option plan threw on the killing blow.
    const context = {
      ...ALCHEMIST_GUILD_BOARD_DEFAULT,
      unlockedUpgradeIds: [NEW_REWARD_SLOT_UPGRADE_ID],
    };
    const lengths = new Set<number>();
    for (let attempt = 0; attempt < 200; attempt += 1) {
      const round = createGatheringRound(1);
      const almostDefeated = {
        ...confirmGatheringAnswer(selectGatheringAnswer(round, round.equation.answer)),
        monster: { ...round.monster, hp: 1 },
      };
      // Must not throw, and the reward phase must hold the (up to 4) options.
      const rewarded = selectGatheringMove(almostDefeated, "sum-strike", context);
      expect(rewarded.phase).toBe("reward");
      lengths.add(rewarded.rewardOptionCardIds.length);
    }
    // Over 200 kills the 50% flip lands at least one 4-option plan through the parse.
    expect(lengths.has(4)).toBe(true);
  });

  test("raises selected quest target drop chance by five points per defeated enemy", () => {
    const metalQuestContext = {
      ...ALCHEMIST_GUILD_BOARD_DEFAULT,
      completedQuestIds: ["quest:first-water"],
      elementQuantities: {
        ...ALCHEMIST_GUILD_BOARD_DEFAULT.elementQuantities,
        "element:cu": 1,
      },
      selectedQuestId: "quest:metal-samples",
    };

    const firstDefeat = createGatheringRewardPlan(2, metalQuestContext);
    const secondDefeat = createGatheringRewardPlan(
      3,
      metalQuestContext,
      firstDefeat.targetDropChances,
    );
    const thirdDefeat = createGatheringRewardPlan(
      4,
      metalQuestContext,
      secondDefeat.targetDropChances,
    );

    expect(firstDefeat.targetDropChances["element:fe"]).toBe(600);
    expect(firstDefeat.targetDropChances["element:cu"]).toBeUndefined();
    expect(secondDefeat.targetDropChances["element:fe"]).toBe(1100);
    expect(thirdDefeat.targetDropChances["element:fe"]).toBe(1600);
  });

  test("targets Glass Batch primitive dependencies through its component recipes", () => {
    const glassQuestContext = {
      ...ALCHEMIST_GUILD_BOARD_DEFAULT,
      completedQuestIds: [
        "quest:first-water",
        "quest:kitchen-salt-and-fuel",
        "quest:field-kit-basics",
      ],
      selectedQuestId: "quest:glass-minerals",
    };

    const firstDefeat = createGatheringRewardPlan(6, glassQuestContext);

    expect(Object.keys(firstDefeat.targetDropChances).toSorted()).toEqual([
      "element:c",
      "element:ca",
      "element:na",
      "element:o",
      "element:si",
    ]);
    expect(firstDefeat.targetDropChances["element:si"]).toBe(600);
    expect(firstDefeat.targetDropChances["element:ca"]).toBe(600);

    const coveredSilicon = createGatheringRewardPlan(
      7,
      {
        ...glassQuestContext,
        elementQuantities: {
          ...glassQuestContext.elementQuantities,
          "element:si": 1,
        },
      },
      firstDefeat.targetDropChances,
    );

    expect(coveredSilicon.targetDropChances["element:si"]).toBe(600);
    expect(coveredSilicon.targetDropChances["element:ca"]).toBe(1100);
  });

  test("keeps the selected quest target when its persisted drop chance hits the jackpot", () => {
    const metalQuestContext = {
      ...ALCHEMIST_GUILD_BOARD_DEFAULT,
      completedQuestIds: ["quest:first-water"],
      elementQuantities: {
        ...ALCHEMIST_GUILD_BOARD_DEFAULT.elementQuantities,
        "element:cu": 1,
      },
      selectedQuestId: "quest:metal-samples",
    };

    const rewardPlan = createGatheringRewardPlan(5, metalQuestContext, {
      "element:fe": 9500,
    });

    expect(rewardPlan.targetDropChances["element:fe"]).toBe(10_000);
    expect(rewardPlan.cardIds).toContain("element:fe");
  });

  test("dragging the equation answer back out clears the slot", () => {
    const round = createGatheringRound(1);
    const solved = confirmGatheringAnswer(selectGatheringAnswer(round, round.equation.answer));

    const cleared = clearGatheringAnswer(solved);
    expect(cleared.phase).toBe("solving");
    expect(cleared.equation.selectedValue).toBeNull();
    expect(cleared.lastAnswerCorrect).toBeNull();
  });

  test("swapping a slotted answer with a choice moves the old card back to that index", () => {
    const round = createGatheringRound(1);
    const selectedValue = round.equation.choiceValues[0];
    const targetValue = round.equation.choiceValues[1];
    if (selectedValue === undefined || targetValue === undefined) {
      throw new Error("expected answer choices");
    }

    const staged = confirmGatheringAnswer(selectGatheringAnswer(round, selectedValue));
    expect(staged.lastAnswerCorrect).toBe(selectedValue === round.equation.answer);

    const swapped = swapGatheringAnswerWithChoice(staged, 1);
    expect(swapped.phase).toBe("solving");
    expect(swapped.lastAnswerCorrect).toBeNull();
    expect(swapped.equation.selectedValue).toBe(targetValue);
    expect(swapped.equation.choiceValues[0]).toBe(targetValue);
    expect(swapped.equation.choiceValues[1]).toBe(selectedValue);
  });

  test("swapping two panel choices reorders the cards without changing staged answer", () => {
    const round = createGatheringRound(1);
    const selectedValue = round.equation.choiceValues[4];
    if (selectedValue === undefined) throw new Error("expected a fifth answer choice");

    const staged = selectGatheringAnswer(round, selectedValue);
    const swapped = swapGatheringChoices(staged, 0, 2);
    expect(swapped.equation.selectedValue).toBe(selectedValue);
    expect(swapped.equation.choiceValues[0]).toBe(round.equation.choiceValues[2]);
    expect(swapped.equation.choiceValues[2]).toBe(round.equation.choiceValues[0]);
  });

  test("claiming a reward logs the element and starts the next round", () => {
    const round = createGatheringRound(1);
    const rewarded = selectGatheringMove(
      {
        ...confirmGatheringAnswer(selectGatheringAnswer(round, round.equation.answer)),
        monster: { ...round.monster, hp: 1 },
      },
      "sum-strike",
    );
    const cardId = rewarded.rewardOptionCardIds[0];
    if (cardId === undefined) throw new Error("expected a reward card");

    const next = claimGatheringReward(rewarded, cardId, 123);
    expect(next.round).toBe(2);
    expect(next.phase).toBe("solving");
    expect(next.gatherLog[0]).toMatchObject({ cardId, collectedAtMs: 123, round: 1 });
  });

  test("claiming a reward preserves unlocked target drop chances", () => {
    const rewarded = {
      ...createGatheringRound(1),
      phase: "reward" as const,
      rewardOptionCardIds: ["element:fe"],
      targetDropChances: { "element:fe": 1600 },
    };

    const next = claimGatheringReward(rewarded, "element:fe", 123);
    expect(next.round).toBe(2);
    expect(next.targetDropChances["element:fe"]).toBe(1600);
  });

  test("opens the boss gate once the current level reaches the mastery threshold", () => {
    const nowMs = 12_000_000;
    const ready = createGatheringBossReadyState(1, nowMs);
    const masteredFacts = Object.entries(ready.spacedRepetition.facts);
    const aboveThreshold = {
      ...ready,
      spacedRepetition: {
        ...ready.spacedRepetition,
        facts: Object.fromEntries(masteredFacts.slice(0, 24)),
      },
    };
    const belowThreshold = {
      ...ready,
      spacedRepetition: {
        ...ready.spacedRepetition,
        facts: Object.fromEntries(masteredFacts.slice(0, 23)),
      },
    };

    const readyReport = createGatheringLevelMasteryReport(aboveThreshold, nowMs);
    const blockedReport = createGatheringLevelMasteryReport(belowThreshold, nowMs);

    expect(readyReport.totalFactCount).toBe(25);
    expect(readyReport.progress).toBeGreaterThanOrEqual(GATHERING_LEVEL_MASTERY_THRESHOLD);
    expect(readyReport.bossReady).toBe(true);
    expect(blockedReport.progress).toBeLessThan(GATHERING_LEVEL_MASTERY_THRESHOLD);
    expect(blockedReport.bossReady).toBe(false);
  });

  test("boss fight rewards the level after twenty correct answers in a row", () => {
    let state = createActiveGatheringBossTestState(1, 13_000_000);

    for (let answerIndex = 0; answerIndex < GATHERING_BOSS_REQUIRED_STREAK; answerIndex += 1) {
      state = answerGatheringBossChallenge(
        state,
        state.boss.equation.answer,
        13_000_100 + answerIndex * 100,
      );
    }

    expect(state.boss.phase).toBe("reward");
    expect(state.boss.currentStreak).toBe(GATHERING_BOSS_REQUIRED_STREAK);
    expect(state.boss.rewardCardIds).toHaveLength(6);
  });

  test("boss fight resets current level practice after the fourth miss", () => {
    let state = createActiveGatheringBossTestState(1, 14_000_000);

    for (let missIndex = 0; missIndex <= GATHERING_BOSS_ALLOWED_MISSES; missIndex += 1) {
      const wrongAnswer = state.boss.equation.choiceValues.find(
        (value) => value !== state.boss.equation.answer,
      );
      if (wrongAnswer === undefined) throw new Error("expected a boss distractor answer");

      state = answerGatheringBossChallenge(state, wrongAnswer, 14_000_100 + missIndex * 100);
    }

    expect(state.boss.phase).toBe("failed");
    expect(state.boss.misses).toBe(GATHERING_BOSS_ALLOWED_MISSES + 1);
    expect(Object.keys(state.spacedRepetition.facts)).toHaveLength(0);
    expect(state.levelProgress.currentLevel).toBe(1);
  });

  test("claiming the boss reward unlocks the next gathering level", () => {
    let state = createActiveGatheringBossTestState(1, 15_000_000);
    for (let answerIndex = 0; answerIndex < GATHERING_BOSS_REQUIRED_STREAK; answerIndex += 1) {
      state = answerGatheringBossChallenge(
        state,
        state.boss.equation.answer,
        15_000_100 + answerIndex * 100,
      );
    }

    const next = claimGatheringBossReward(state, 15_003_000);

    expect(next.levelProgress.completedBossLevels).toContain(1);
    expect(next.levelProgress.currentLevel).toBe(2);
    expect(next.levelProgress.highestUnlockedLevel).toBe(2);
    expect(next.boss.phase).toBe("idle");
    expect(next.boss.level).toBe(2);
    expect(next.gatherLog).toHaveLength(6);
  });
});

describe("gathering enemy cycle", () => {
  test("round 1 monster matches the persisted default", () => {
    const monster = createGatheringMonsterForRound(1);
    // The element is round-derived (round 1 → tide); the rest of the identity
    // must still match the committed default monster.
    expect(monster).toEqual({
      ...ALCHEMIST_GUILD_GATHERING_MONSTER_DEFAULT,
      elementType: monster.elementType,
    });
    expect(ALCHEMIST_GUILD_GATHERING_ELEMENT_TYPES).toContain(monster.elementType);
    expect(monster.elementType).toBe("water");
  });

  test("walks the bestiary ladder in tier order, one enemy per round", () => {
    for (let index = 0; index < GATHERING_ENEMY_LADDER_LENGTH; index += 1) {
      const enemy = ALCHEMY_GATHERING_ENEMIES[index];
      if (!enemy) throw new Error("missing bestiary enemy");

      const monster = createGatheringMonsterForRound(index + 1);
      expect(monster.id).toBe(`monster:${enemy.id}`);
      expect(monster.name).toBe(enemy.name);
      expect(monster.maxHp).toBe(enemy.maxHp);
      expect(monster.hp).toBe(enemy.maxHp);
      expect(monster.imagePath).toBe(`enemies/${enemy.id}.webp`);
    }
  });

  test("loops back to the first enemy and escalates its poster variant each lap", () => {
    const first = ALCHEMY_GATHERING_ENEMIES[0];
    if (!first) throw new Error("missing bestiary enemy");

    const lap = (loop: number) =>
      createGatheringMonsterForRound(1 + GATHERING_ENEMY_LADDER_LENGTH * loop);
    expect(lap(0).imagePath).toBe(`enemies/${first.id}.webp`);
    expect(lap(1).imagePath).toBe(`enemies/${first.id}_L1.webp`);
    expect(lap(2).imagePath).toBe(`enemies/${first.id}_L2.webp`);
    expect(lap(3).imagePath).toBe(`enemies/${first.id}_L3.webp`);
    // Beyond the variants that exist, the poster stays capped at the top variant.
    expect(lap(4).imagePath).toBe(`enemies/${first.id}_L${first.variantCount}.webp`);
  });

  test("caps the poster variant at the variants that exist for an enemy", () => {
    const twoVariant = ALCHEMY_GATHERING_ENEMIES.find((entry) => entry.variantCount === 2);
    if (!twoVariant) throw new Error("expected a two-variant enemy");

    expect(getGatheringEnemyImagePath(twoVariant, 0)).toBe(`enemies/${twoVariant.id}.webp`);
    expect(getGatheringEnemyImagePath(twoVariant, 5)).toBe(`enemies/${twoVariant.id}_L2.webp`);
  });

  test("claiming a reward advances to the next enemy in the ladder", () => {
    const round = createGatheringRound(1);
    expect(round.monster.id).toBe("monster:hadal-tide-minnow-echo");

    const inMove = confirmGatheringAnswer(selectGatheringAnswer(round, round.equation.answer));
    const atReward = selectGatheringMove(
      { ...inMove, monster: { ...inMove.monster, hp: 1 } },
      "sum-strike",
    );
    expect(atReward.phase).toBe("reward");

    const rewardCard = atReward.rewardOptionCardIds[0];
    if (!rewardCard) throw new Error("expected a reward option");

    const nextRound = claimGatheringReward(atReward, rewardCard);
    const secondEnemy = ALCHEMY_GATHERING_ENEMIES[1];
    if (!secondEnemy) throw new Error("missing second bestiary enemy");

    expect(nextRound.round).toBe(2);
    expect(nextRound.monster.id).toBe(`monster:${secondEnemy.id}`);
    expect(nextRound.monster.name).toBe(secondEnemy.name);
    expect(nextRound.monster.hp).toBe(secondEnemy.maxHp);
  });
});
