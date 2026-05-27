import {
  ALCHEMIST_GUILD_GATHERING_DEFAULT,
  ALCHEMY_GATHERABLE_CARDS,
  ALCHEMY_PRIMITIVE_CARD_IDS,
  ALCHEMY_QUESTS,
  type AlchemistGuildBoardState,
  type AlchemistGuildCardId,
  type AlchemistGuildGatheringEquation,
  AlchemistGuildGatheringEquationSchema,
  type AlchemistGuildGatheringState,
  AlchemistGuildGatheringStateSchema,
  ELEMENT_CARDS,
  getAlchemyRecipeById,
  getAlchemyRecipeByOutput,
  type StaticAlchemyQuest,
} from "@dean-stack/schemas";

import type { SoundId } from "~/sound/schema";

export const gatheringMoveIds = ["left-spark", "right-spark", "sum-strike"] as const;
export type GatheringMoveId = (typeof gatheringMoveIds)[number];
type GatheringAttackSoundId = Extract<
  SoundId,
  "gathering.attack.leftSpark" | "gathering.attack.rightSpark" | "gathering.attack.sumStrike"
>;

export type GatheringMove = {
  damage: number;
  detail: string;
  id: GatheringMoveId;
  name: string;
  soundId: GatheringAttackSoundId;
};

const GATHERING_LOG_LIMIT = 24;
const GATHERING_REWARD_OPTION_COUNT = 3;
const GATHERING_REWARD_FOCUS_OPTION_COUNT = 2;
const GATHERING_REWARD_QUEST_WINDOW = 5;
const GATHERING_REWARD_QUANTITY_WEIGHT_CAP = 3;
const GATHERING_REWARD_BASE_WEIGHT = 1;
const GATHERING_REWARD_DEMAND_WEIGHT = 18;
const GATHERING_REWARD_WILDCARD_DEMAND_WEIGHT = 4;

export type GatheringRewardContext = Pick<
  AlchemistGuildBoardState,
  "completedQuestIds" | "elementQuantities" | "inventorySlots" | "questDeliveries"
>;

const rewardPool = [
  ...ELEMENT_CARDS.filter((card) => card.unlockLevel <= 12).map((card) => card.id),
  ...ALCHEMY_GATHERABLE_CARDS.filter((card) => card.unlockCohort <= 3).map((card) => card.cardId),
] satisfies AlchemistGuildCardId[];
const primitiveRewardCardIds = new Set<string>(ALCHEMY_PRIMITIVE_CARD_IDS);

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
      soundId: "gathering.attack.leftSpark",
    },
    {
      damage: equation.right,
      detail: `${equation.right}`,
      id: "right-spark",
      name: "Right Spark",
      soundId: "gathering.attack.rightSpark",
    },
    {
      damage: equation.answer,
      detail: `${equation.left} + ${equation.right}`,
      id: "sum-strike",
      name: "Sum Strike",
      soundId: "gathering.attack.sumStrike",
    },
  ];
}

export function selectGatheringAnswer(
  state: AlchemistGuildGatheringState,
  value: number,
): AlchemistGuildGatheringState {
  if (state.phase !== "solving") return state;

  return AlchemistGuildGatheringStateSchema.parse({
    ...state,
    equation: {
      ...state.equation,
      selectedValue: value,
    },
    lastAnswerCorrect: null,
    phase: "solving",
  });
}

export function confirmGatheringAnswer(
  state: AlchemistGuildGatheringState,
): AlchemistGuildGatheringState {
  if (state.phase !== "solving" || state.equation.selectedValue === null) return state;

  const correct = state.equation.selectedValue === state.equation.answer;
  return AlchemistGuildGatheringStateSchema.parse({
    ...state,
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

export function swapGatheringAnswerWithChoice(
  state: AlchemistGuildGatheringState,
  targetChoiceIndex: number,
): AlchemistGuildGatheringState {
  if (state.phase !== "solving" || state.equation.selectedValue === null) return state;

  const selectedChoiceIndex = state.equation.choiceValues.indexOf(state.equation.selectedValue);
  const targetChoiceValue = state.equation.choiceValues[targetChoiceIndex];
  if (selectedChoiceIndex === -1 || targetChoiceValue === undefined)
    return clearGatheringAnswer(state);
  if (selectedChoiceIndex === targetChoiceIndex) return clearGatheringAnswer(state);

  const nextChoiceValues = [...state.equation.choiceValues];
  nextChoiceValues[selectedChoiceIndex] = targetChoiceValue;
  nextChoiceValues[targetChoiceIndex] = state.equation.selectedValue;

  return AlchemistGuildGatheringStateSchema.parse({
    ...state,
    equation: {
      ...state.equation,
      choiceValues: nextChoiceValues,
      selectedValue: targetChoiceValue,
    },
    lastAnswerCorrect: null,
    phase: "solving",
  });
}

export function swapGatheringChoices(
  state: AlchemistGuildGatheringState,
  sourceChoiceIndex: number,
  targetChoiceIndex: number,
): AlchemistGuildGatheringState {
  if (state.phase !== "solving") return state;
  if (sourceChoiceIndex === targetChoiceIndex) return state;

  const sourceChoiceValue = state.equation.choiceValues[sourceChoiceIndex];
  const targetChoiceValue = state.equation.choiceValues[targetChoiceIndex];
  if (sourceChoiceValue === undefined || targetChoiceValue === undefined) return state;

  const nextChoiceValues = [...state.equation.choiceValues];
  nextChoiceValues[sourceChoiceIndex] = targetChoiceValue;
  nextChoiceValues[targetChoiceIndex] = sourceChoiceValue;

  return AlchemistGuildGatheringStateSchema.parse({
    ...state,
    equation: {
      ...state.equation,
      choiceValues: nextChoiceValues,
    },
    phase: "solving",
  });
}

export function selectGatheringMove(
  state: AlchemistGuildGatheringState,
  moveId: GatheringMoveId,
  rewardContext?: GatheringRewardContext,
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
      rewardOptionCardIds: createGatheringRewardOptions(state.round, rewardContext),
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

export function createGatheringRewardOptions(
  round: number,
  context?: GatheringRewardContext,
): AlchemistGuildCardId[] {
  const demandScores = createPrimitiveDemandScores(context);
  const firstQuestDemandScores = createPrimitiveDemandScores(context, 1);
  const firstQuestDemandCardIds = new Set(firstQuestDemandScores.keys());
  const focusedDemandCardIds =
    firstQuestDemandCardIds.size > 0 ? firstQuestDemandCardIds : new Set(demandScores.keys());
  const focusedSlotCount = Math.min(GATHERING_REWARD_FOCUS_OPTION_COUNT, focusedDemandCardIds.size);
  const selectedCardIds: AlchemistGuildCardId[] = [];

  for (let slotIndex = 0; slotIndex < GATHERING_REWARD_OPTION_COUNT; slotIndex += 1) {
    selectedCardIds.push(
      pickWeightedRewardCard({
        demandScores,
        focusedCardIds: focusedDemandCardIds,
        focused: slotIndex < focusedSlotCount,
        round,
        selectedCardIds,
        slotIndex,
      }),
    );
  }

  return selectedCardIds;
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

type WeightedRewardPickInput = {
  demandScores: ReadonlyMap<string, number>;
  focused: boolean;
  focusedCardIds: ReadonlySet<string>;
  round: number;
  selectedCardIds: readonly AlchemistGuildCardId[];
  slotIndex: number;
};

type WeightedRewardCandidate = {
  cardId: AlchemistGuildCardId;
  weight: number;
};

function pickWeightedRewardCard(input: WeightedRewardPickInput): AlchemistGuildCardId {
  const selectedCardIdSet = new Set<string>(input.selectedCardIds);
  const candidates = createWeightedRewardCandidates(input, selectedCardIdSet);
  if (candidates.length === 0) return getRewardCardId(input.round + input.slotIndex * 3);

  const totalWeight = candidates.reduce((total, candidate) => total + candidate.weight, 0);
  let threshold = getDeterministicUnit(input.round, input.slotIndex) * totalWeight;
  for (const candidate of candidates) {
    threshold -= candidate.weight;
    if (threshold <= 0) return candidate.cardId;
  }

  const fallbackCandidate = candidates.at(-1);
  if (!fallbackCandidate) throw new Error("gathering reward candidates unexpectedly empty");
  return fallbackCandidate.cardId;
}

function createWeightedRewardCandidates(
  input: WeightedRewardPickInput,
  selectedCardIdSet: ReadonlySet<string>,
): WeightedRewardCandidate[] {
  const candidates: WeightedRewardCandidate[] = [];
  for (const cardId of rewardPool) {
    if (selectedCardIdSet.has(cardId)) continue;

    const demandScore = input.demandScores.get(cardId) ?? 0;
    if (input.focused && demandScore <= 0) continue;
    if (input.focused && !input.focusedCardIds.has(cardId)) continue;

    candidates.push({
      cardId,
      weight:
        GATHERING_REWARD_BASE_WEIGHT +
        demandScore *
          (input.focused
            ? GATHERING_REWARD_DEMAND_WEIGHT
            : GATHERING_REWARD_WILDCARD_DEMAND_WEIGHT),
    });
  }

  if (candidates.length > 0 || !input.focused) return candidates;

  return createWeightedRewardCandidates({ ...input, focused: false }, selectedCardIdSet);
}

function createPrimitiveDemandScores(
  context?: GatheringRewardContext,
  questWindow = GATHERING_REWARD_QUEST_WINDOW,
): Map<string, number> {
  if (!context) return new Map();

  const demandScores = new Map<string, number>();
  const resourceCounts = createBoardResourceCounts(context);
  const upcomingQuests = getUpcomingGatheringQuests(context, questWindow);

  for (const [questIndex, quest] of upcomingQuests.entries()) {
    const questPriority = (GATHERING_REWARD_QUEST_WINDOW - questIndex) ** 2;
    for (const recipeId of quest.recipeIds) {
      const recipe = getAlchemyRecipeById(recipeId);
      if (!recipe) continue;
      addPrimitiveDemandForCard({
        cardId: recipe.output.cardId,
        demandScores,
        quantity: 1,
        resourceCounts,
        stack: new Set(),
        weight: questPriority,
      });
    }
  }

  return demandScores;
}

type PrimitiveDemandInput = {
  cardId: string;
  demandScores: Map<string, number>;
  quantity: number;
  resourceCounts: Map<string, number>;
  stack: Set<string>;
  weight: number;
};

function addPrimitiveDemandForCard(input: PrimitiveDemandInput): void {
  const availableCount = input.resourceCounts.get(input.cardId) ?? 0;
  const coveredCount = Math.min(input.quantity, availableCount);
  const uncoveredQuantity = input.quantity - coveredCount;
  if (coveredCount > 0) input.resourceCounts.set(input.cardId, availableCount - coveredCount);
  if (uncoveredQuantity <= 0) return;

  if (primitiveRewardCardIds.has(input.cardId)) {
    const demandScore =
      Math.min(uncoveredQuantity, GATHERING_REWARD_QUANTITY_WEIGHT_CAP) * input.weight;
    input.demandScores.set(input.cardId, (input.demandScores.get(input.cardId) ?? 0) + demandScore);
    return;
  }

  if (input.stack.has(input.cardId)) return;

  const recipe = getAlchemyRecipeByOutput(input.cardId);
  if (!recipe) return;

  input.stack.add(input.cardId);
  for (const argument of recipe.arguments) {
    addPrimitiveDemandForCard({
      cardId: argument.cardId,
      demandScores: input.demandScores,
      quantity: argument.quantity * uncoveredQuantity,
      resourceCounts: input.resourceCounts,
      stack: input.stack,
      weight: input.weight,
    });
  }
  input.stack.delete(input.cardId);
}

function createBoardResourceCounts(context: GatheringRewardContext): Map<string, number> {
  const counts = new Map<string, number>();

  for (const [cardId, quantity] of Object.entries(context.elementQuantities)) {
    incrementResourceCount(counts, cardId, quantity);
  }

  for (const item of Object.values(context.inventorySlots)) {
    if (!item) continue;
    incrementResourceCount(counts, item.cardId, item.cooldowns.length);
  }

  return counts;
}

function incrementResourceCount(counts: Map<string, number>, cardId: string, amount: number): void {
  if (amount <= 0) return;
  counts.set(cardId, (counts.get(cardId) ?? 0) + amount);
}

function getUpcomingGatheringQuests(
  context: GatheringRewardContext,
  questWindow = GATHERING_REWARD_QUEST_WINDOW,
): StaticAlchemyQuest[] {
  const completedQuestIds = getEffectivelyCompletedQuestIds(context);
  const virtuallyCompletedQuestIds = new Set<string>(completedQuestIds);
  const upcomingQuests: StaticAlchemyQuest[] = [];

  for (const quest of ALCHEMY_QUESTS) {
    if (upcomingQuests.length >= questWindow) break;
    if (virtuallyCompletedQuestIds.has(quest.id)) continue;
    if (!areQuestPrerequisitesMet(quest, virtuallyCompletedQuestIds)) continue;

    upcomingQuests.push(quest);
    virtuallyCompletedQuestIds.add(quest.id);
  }

  return upcomingQuests;
}

function getEffectivelyCompletedQuestIds(context: GatheringRewardContext): Set<string> {
  const completedQuestIds = new Set<string>(context.completedQuestIds);

  for (const [questId, delivery] of Object.entries(context.questDeliveries)) {
    if (delivery.delivered >= delivery.required) completedQuestIds.add(questId);
  }

  return completedQuestIds;
}

function areQuestPrerequisitesMet(
  quest: StaticAlchemyQuest,
  completedQuestIds: ReadonlySet<string>,
): boolean {
  const allRequiredQuestsComplete = quest.prerequisites.allOf.every((questId) =>
    completedQuestIds.has(questId),
  );
  if (!allRequiredQuestsComplete) return false;

  return quest.prerequisites.anyOf.every((gate) => {
    const completedGateQuestCount = gate.questIds.filter((questId) =>
      completedQuestIds.has(questId),
    ).length;
    return completedGateQuestCount >= gate.count;
  });
}

function getRewardCardId(index: number): AlchemistGuildCardId {
  const cardId = rewardPool[index % rewardPool.length];
  if (!cardId) throw new Error("gathering reward pool is empty");
  return cardId;
}

function getDeterministicUnit(round: number, slotIndex: number): number {
  const value = Math.sin(round * 12.9898 + slotIndex * 78.233 + 37.719) * 43_758.5453;
  return value - Math.floor(value);
}
