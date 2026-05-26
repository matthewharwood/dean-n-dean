import {
  ALCHEMIST_GUILD_GATHERING_DEFAULT,
  type AlchemistGuildCardId,
  type AlchemistGuildGatheringEquation,
  AlchemistGuildGatheringEquationSchema,
  type AlchemistGuildGatheringState,
  AlchemistGuildGatheringStateSchema,
  ELEMENT_CARDS,
} from "@dean-stack/schemas";

export const gatheringMoveIds = ["left-spark", "right-spark", "sum-strike"] as const;
export type GatheringMoveId = (typeof gatheringMoveIds)[number];

export type GatheringMove = {
  damage: number;
  detail: string;
  id: GatheringMoveId;
  name: string;
};

const GATHERING_LOG_LIMIT = 24;

const rewardPool = ELEMENT_CARDS.filter((card) => card.unlockLevel <= 12).map(
  (card) => card.id,
) satisfies AlchemistGuildCardId[];

export function createGatheringEquation(
  round: number,
  equationIndex: number,
): AlchemistGuildGatheringEquation {
  const left = 2 + ((round + equationIndex * 2) % 7);
  const right = 1 + ((round * 2 + equationIndex) % 6);
  const answer = left + right;

  return AlchemistGuildGatheringEquationSchema.parse({
    answer,
    choiceValues: buildAnswerChoices(answer, round + equationIndex),
    id: `gathering-equation:${round}:${equationIndex}`,
    left,
    right,
    selectedValue: null,
  });
}

export function createGatheringRound(round: number): AlchemistGuildGatheringState {
  return AlchemistGuildGatheringStateSchema.parse({
    ...ALCHEMIST_GUILD_GATHERING_DEFAULT,
    equation: createGatheringEquation(round, 1),
    equationIndex: 1,
    round,
  });
}

export function getGatheringMoves(equation: AlchemistGuildGatheringEquation): GatheringMove[] {
  return [
    {
      damage: equation.left,
      detail: `${equation.left}`,
      id: "left-spark",
      name: "Left Spark",
    },
    {
      damage: equation.right,
      detail: `${equation.right}`,
      id: "right-spark",
      name: "Right Spark",
    },
    {
      damage: equation.answer,
      detail: `${equation.left} + ${equation.right}`,
      id: "sum-strike",
      name: "Sum Strike",
    },
  ];
}

export function selectGatheringAnswer(
  state: AlchemistGuildGatheringState,
  value: number,
): AlchemistGuildGatheringState {
  if (state.phase !== "solving") return state;

  const correct = value === state.equation.answer;
  return AlchemistGuildGatheringStateSchema.parse({
    ...state,
    equation: {
      ...state.equation,
      selectedValue: value,
    },
    lastAnswerCorrect: correct,
    phase: correct ? "move" : "solving",
  });
}

export function clearGatheringAnswer(
  state: AlchemistGuildGatheringState,
): AlchemistGuildGatheringState {
  if (state.equation.selectedValue === null) return state;

  return AlchemistGuildGatheringStateSchema.parse({
    ...state,
    equation: {
      ...state.equation,
      selectedValue: null,
    },
    lastAnswerCorrect: null,
    phase: "solving",
  });
}

export function selectGatheringMove(
  state: AlchemistGuildGatheringState,
  moveId: GatheringMoveId,
): AlchemistGuildGatheringState {
  if (state.phase !== "move") return state;

  const move = getGatheringMoves(state.equation).find((candidate) => candidate.id === moveId);
  if (!move) return state;

  const nextHp = Math.max(0, state.monster.hp - move.damage);
  if (nextHp <= 0) {
    return AlchemistGuildGatheringStateSchema.parse({
      ...state,
      monster: { ...state.monster, hp: 0 },
      phase: "reward",
      rewardOptionCardIds: createGatheringRewardOptions(state.round),
    });
  }

  const nextEquationIndex = state.equationIndex + 1;
  return AlchemistGuildGatheringStateSchema.parse({
    ...state,
    equation: createGatheringEquation(state.round, nextEquationIndex),
    equationIndex: nextEquationIndex,
    lastAnswerCorrect: null,
    monster: { ...state.monster, hp: nextHp },
    phase: "solving",
  });
}

export function claimGatheringReward(
  state: AlchemistGuildGatheringState,
  cardId: AlchemistGuildCardId,
  collectedAtMs = Date.now(),
): AlchemistGuildGatheringState {
  if (state.phase !== "reward" || !state.rewardOptionCardIds.includes(cardId)) return state;

  const nextRound = createGatheringRound(state.round + 1);
  return AlchemistGuildGatheringStateSchema.parse({
    ...nextRound,
    gatherLog: [
      {
        cardId,
        collectedAtMs,
        id: `gather:${state.round}:${collectedAtMs}:${cardId}`,
        round: state.round,
      },
      ...state.gatherLog,
    ].slice(0, GATHERING_LOG_LIMIT),
  });
}

export function createGatheringRewardOptions(round: number): AlchemistGuildCardId[] {
  return [0, 1, 2].map((offset) => getRewardCardId(round + offset * 3));
}

function buildAnswerChoices(answer: number, seed: number): number[] {
  const ordered = uniqueNumbers([
    answer,
    Math.max(0, answer - 2),
    answer + 2,
    Math.max(0, answer - 1),
    answer + 1,
    answer + 3,
  ]).slice(0, 5);

  const rotation = seed % ordered.length;
  return [...ordered.slice(rotation), ...ordered.slice(0, rotation)];
}

function uniqueNumbers(values: readonly number[]): number[] {
  const seen = new Set<number>();
  const unique: number[] = [];
  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    unique.push(value);
  }
  return unique;
}

function getRewardCardId(index: number): AlchemistGuildCardId {
  const cardId = rewardPool[index % rewardPool.length];
  if (!cardId) throw new Error("gathering reward pool is empty");
  return cardId;
}
