import { describe, expect, test } from "bun:test";
import { ALCHEMIST_GUILD_BOARD_DEFAULT } from "@dean-stack/schemas";

import {
  claimGatheringReward,
  clearGatheringAnswer,
  confirmGatheringAnswer,
  createGatheringEquation,
  createGatheringRewardOptions,
  createGatheringRewardPlan,
  createGatheringRound,
  getGatheringMoves,
  resetGatheringEquationAfterWrongStreak,
  selectGatheringAnswer,
  selectGatheringMove,
  swapGatheringAnswerWithChoice,
  swapGatheringChoices,
} from "./gathering-loop";

describe("gathering loop", () => {
  test("deals addition equations with the correct answer in the choices", () => {
    const equation = createGatheringEquation(1, 1);

    expect(equation.answer).toBe(equation.left + equation.right);
    expect(equation.choiceValues).toHaveLength(5);
    expect(new Set(equation.choiceValues).size).toBe(5);
    expect(equation.choiceValues).toContain(equation.answer);
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
});
