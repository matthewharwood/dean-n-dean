import { describe, expect, test } from "bun:test";

import {
  claimGatheringReward,
  clearGatheringAnswer,
  createGatheringEquation,
  createGatheringRound,
  getGatheringMoves,
  selectGatheringAnswer,
  selectGatheringMove,
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
    expect(missed.phase).toBe("solving");
    expect(missed.lastAnswerCorrect).toBe(false);

    const solved = selectGatheringAnswer(missed, round.equation.answer);
    expect(solved.phase).toBe("move");
    expect(solved.lastAnswerCorrect).toBe(true);

    const sumStrike = getGatheringMoves(solved.equation).find((move) => move.id === "sum-strike");
    expect(sumStrike?.damage).toBe(round.equation.answer);
  });

  test("moves damage the monster until a reward choice appears", () => {
    const round = createGatheringRound(1);
    const almostDefeated = {
      ...selectGatheringAnswer(round, round.equation.answer),
      monster: { ...round.monster, hp: 1 },
    };

    const rewarded = selectGatheringMove(almostDefeated, "sum-strike");
    expect(rewarded.phase).toBe("reward");
    expect(rewarded.monster.hp).toBe(0);
    expect(rewarded.rewardOptionCardIds).toHaveLength(3);
  });

  test("dragging the equation answer back out clears the slot", () => {
    const round = createGatheringRound(1);
    const solved = selectGatheringAnswer(round, round.equation.answer);

    const cleared = clearGatheringAnswer(solved);
    expect(cleared.phase).toBe("solving");
    expect(cleared.equation.selectedValue).toBeNull();
    expect(cleared.lastAnswerCorrect).toBeNull();
  });

  test("claiming a reward logs the element and starts the next round", () => {
    const round = createGatheringRound(1);
    const rewarded = selectGatheringMove(
      {
        ...selectGatheringAnswer(round, round.equation.answer),
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
});
