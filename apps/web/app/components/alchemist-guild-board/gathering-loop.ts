import {
  ALCHEMIST_GUILD_GATHERING_BOSS_DEFAULT,
  ALCHEMIST_GUILD_GATHERING_DEFAULT,
  ALCHEMIST_GUILD_GATHERING_EQUATION_DEFAULT,
  ALCHEMIST_GUILD_GATHERING_SPACED_REPETITION_DEFAULT,
  ALCHEMY_GATHERABLE_CARDS,
  ALCHEMY_PRIMITIVE_CARD_IDS,
  ALCHEMY_QUESTS,
  type AlchemistGuildBoardState,
  type AlchemistGuildCardId,
  AlchemistGuildCardIdSchema,
  type AlchemistGuildGatheringBossState,
  type AlchemistGuildGatheringEquation,
  AlchemistGuildGatheringEquationSchema,
  type AlchemistGuildGatheringLevelProgress,
  type AlchemistGuildGatheringMonster,
  type AlchemistGuildGatheringPhonicsChoice,
  type AlchemistGuildGatheringPhonicsPrompt,
  AlchemistGuildGatheringPhonicsPromptSchema,
  type AlchemistGuildGatheringSpacedRepetition,
  type AlchemistGuildGatheringSpacedRepetitionFact,
  type AlchemistGuildGatheringState,
  AlchemistGuildGatheringStateSchema,
  type AlchemistGuildGatheringTargetDropChances,
  type AlchemistGuildGatheringTrackKind,
  ELEMENT_CARDS,
  GATHERING_TRACK_KINDS,
  getAlchemyQuestById,
  getAlchemyRecipeById,
  getAlchemyRecipeByOutput,
  getGatheringEnemyForRound,
  getGatheringEnemyImagePath,
  getPhonicsVowel,
  getPhonicsWordsForLevel,
  type PhonicsWord,
  type StaticAlchemyQuest,
} from "@dean-stack/schemas";

import type { SoundId } from "~/sound/schema";
import {
  applyGatheringElementalDamage,
  type GatheringElementType,
  gatheringElementForEnemy,
} from "./gathering-elements";
import { advanceGatheringStreak } from "./gathering-streak";
import { isQuestDeliveryComplete } from "./quest-deliverables";
import { hasUpgrade, NEW_REWARD_SLOT_FOURTH_CHANCE, NEW_REWARD_SLOT_UPGRADE_ID } from "./upgrades";

export const gatheringMoveIds = [
  "left-spark",
  "right-spark",
  "sum-strike",
  "ember-burst",
  "stone-crash",
] as const;
export type GatheringMoveId = (typeof gatheringMoveIds)[number];
type GatheringAttackSoundId = Extract<
  SoundId,
  | "gathering.attack.leftSpark"
  | "gathering.attack.rightSpark"
  | "gathering.attack.sumStrike"
  | "gathering.attack.emberBurst"
  | "gathering.attack.stoneCrash"
>;

export type GatheringMove = {
  baseDamage: number;
  damage: number;
  detail: string;
  element: GatheringElementType;
  id: GatheringMoveId;
  level: number;
  name: string;
  soundId: GatheringAttackSoundId;
  unlockStreak: number;
};

export type GatheringMoveDamagePreview = {
  damage: number;
  effectiveness: ReturnType<typeof applyGatheringElementalDamage>["effectiveness"];
  multiplier: number;
};

export type GatheringMoveLadderEntry = GatheringMove & {
  locked: boolean;
};

const GATHERING_LOG_LIMIT = 24;
const GATHERING_REWARD_OPTION_COUNT = 3;
const GATHERING_REWARD_FOCUS_OPTION_COUNT = 2;
const GATHERING_REWARD_QUEST_WINDOW = 5;
const GATHERING_REWARD_QUANTITY_WEIGHT_CAP = 3;
const GATHERING_REWARD_BASE_WEIGHT = 1;
const GATHERING_REWARD_DEMAND_WEIGHT = 18;
const GATHERING_REWARD_WILDCARD_DEMAND_WEIGHT = 4;
const GATHERING_TARGET_DROP_BASE_BPS = 100;
const GATHERING_TARGET_DROP_STEP_BPS = 500;
const GATHERING_TARGET_DROP_MAX_BPS = 10_000;
const GATHERING_WRONG_ANSWER_RESET_COUNT = 3;
const GATHERING_SPACED_REPETITION_DECAY = 0.1542;
const GATHERING_SPACED_REPETITION_TARGET_RETENTION = 0.9;
const GATHERING_SPACED_REPETITION_FACTOR =
  GATHERING_SPACED_REPETITION_TARGET_RETENTION ** (1 / -GATHERING_SPACED_REPETITION_DECAY) - 1;
const GATHERING_DAY_MS = 86_400_000;
const GATHERING_MIN_STABILITY_DAYS = 0.000_35;
const GATHERING_MAX_STABILITY_DAYS = 90;
const GATHERING_NEW_FACT_WEIGHT = 34;
const GATHERING_DUE_FACT_WEIGHT = 100;
const GATHERING_LEVEL_ONE = 1;
const GATHERING_LEVEL_TWO = 2;
const GATHERING_LEVEL_ONE_MAX_ANSWER = 10;
const GATHERING_LEVEL_TWO_MAX_ANSWER = 20;
export const GATHERING_BOSS_PROBLEM_DURATION_MS = 8_000;
export const GATHERING_BOSS_REQUIRED_STREAK = 20;
export const GATHERING_BOSS_ALLOWED_MISSES = 3;
export const GATHERING_LEVEL_MASTERY_THRESHOLD = 0.95;
const GATHERING_FACT_MASTERY_MIN_ATTEMPTS = 3;
const GATHERING_FACT_MASTERY_MIN_ACCURACY = 0.9;
const GATHERING_FACT_MASTERY_MIN_STREAK = 2;
const GATHERING_BOSS_REWARD_CARD_COUNT = 6;
const GATHERING_PHONICS_CHOICE_COUNT = 5;
// Mid difficulty seed for new phonics facts (getInitialGatheringFactDifficulty(5) ≈ 5).
const GATHERING_PHONICS_DIFFICULTY_SEED = 5;
const GATHERING_ATTACK_LEVEL_TWO_DAMAGE_BONUS = 9;

const GATHERING_MOVE_DEFINITIONS = [
  {
    baseDamage: 4,
    detail: "Fast spark",
    element: "lightning",
    id: "left-spark",
    levelTwoAt: 30,
    name: "Left Spark",
    soundId: "gathering.attack.leftSpark",
    unlockStreak: 0,
  },
  {
    baseDamage: 5,
    detail: "Tide hit",
    element: "water",
    id: "right-spark",
    levelTwoAt: 50,
    name: "Right Spark",
    soundId: "gathering.attack.rightSpark",
    unlockStreak: 5,
  },
  {
    baseDamage: 6,
    detail: "Wild growth",
    element: "nature",
    id: "sum-strike",
    levelTwoAt: 100,
    name: "Sum Strike",
    soundId: "gathering.attack.sumStrike",
    unlockStreak: 10,
  },
  {
    baseDamage: 7,
    detail: "Warm blast",
    element: "fire",
    id: "ember-burst",
    levelTwoAt: null,
    name: "Ember Burst",
    soundId: "gathering.attack.emberBurst",
    unlockStreak: 15,
  },
  {
    baseDamage: 8,
    detail: "Ground slam",
    element: "stone",
    id: "stone-crash",
    levelTwoAt: null,
    name: "Stone Crash",
    soundId: "gathering.attack.stoneCrash",
    unlockStreak: 20,
  },
] as const satisfies ReadonlyArray<{
  baseDamage: number;
  detail: string;
  element: GatheringElementType;
  id: GatheringMoveId;
  levelTwoAt: number | null;
  name: string;
  soundId: GatheringAttackSoundId;
  unlockStreak: number;
}>;

// The two numeric tracks share the equation shape; only the operator + factId
// prefix differ. Phonics is handled by its own prompt path.
export type NumericGatheringTrackKind = "addition" | "subtraction";

function isNumericGatheringTrack(track: AlchemistGuildGatheringTrackKind): boolean {
  return track === "addition" || track === "subtraction";
}

// Resolve the active learning path. Pre-track saves (selectedTrack === null while
// mid-game) and any numeric flow without an explicit track fall back to addition,
// preserving the original behavior exactly.
function getActiveGatheringTrack(
  state: AlchemistGuildGatheringState,
): AlchemistGuildGatheringTrackKind {
  return state.selectedTrack ?? "addition";
}

export type GatheringRewardContext = Pick<
  AlchemistGuildBoardState,
  | "completedQuestIds"
  | "elementQuantities"
  | "inventorySlots"
  | "questDeliveries"
  | "selectedQuestId"
  | "unlockedUpgradeIds"
>;

export type GatheringRewardPlan = {
  cardIds: AlchemistGuildCardId[];
  targetDropChances: AlchemistGuildGatheringTargetDropChances;
};

type GatheringFactCandidate = {
  answer: number;
  factId: string;
  left: number;
  right: number;
};

type GatheringFactSchedulePick = GatheringFactCandidate & {
  score: number;
};

export type GatheringLevelMasteryReport = {
  bossReady: boolean;
  currentLevel: number;
  masteredFactCount: number;
  maxAnswer: number;
  progress: number;
  requiredProgress: number;
  totalFactCount: number;
};

export type GatheringSpacedRepetitionReportFact = {
  accuracy: number;
  attempts: number;
  difficulty: number;
  dueAtMs: number;
  factId: string;
  label: string;
  retrievability: number;
  stabilityDays: number;
  status: "due" | "learning" | "new" | "review";
  wrongCount: number;
};

export type GatheringSpacedRepetitionReport = {
  accuracy: number;
  averageDifficulty: number;
  averageRetrievability: number;
  averageStabilityDays: number;
  dueCount: number;
  facts: GatheringSpacedRepetitionReportFact[];
  learningCount: number;
  masteredCount: number;
  needsAttention: GatheringSpacedRepetitionReportFact[];
  totalAttempts: number;
  totalCorrect: number;
  totalFacts: number;
};

const rewardPool = [
  ...ELEMENT_CARDS.filter((card) => card.unlockLevel <= 12).map((card) => card.id),
  ...ALCHEMY_GATHERABLE_CARDS.filter((card) => card.unlockCohort <= 3).map((card) => card.cardId),
] satisfies AlchemistGuildCardId[];
const primitiveRewardCardIds = new Set<string>(ALCHEMY_PRIMITIVE_CARD_IDS);

export function createGatheringEquation(
  round: number,
  equationIndex: number,
  spacedRepetition?: AlchemistGuildGatheringSpacedRepetition,
  nowMs = Date.now(),
  maxAnswer = GATHERING_LEVEL_ONE_MAX_ANSWER,
  track: NumericGatheringTrackKind = "addition",
): AlchemistGuildGatheringEquation {
  const candidate = spacedRepetition
    ? pickGatheringNumericFact(spacedRepetition, track, round, equationIndex, nowMs, maxAnswer)
    : createDeterministicGatheringNumericFact(track, round, equationIndex, maxAnswer);
  // Addition is commutative, so the operands can flip for variety; subtraction is
  // order-sensitive and must keep `minuend - subtrahend`.
  const oriented =
    track === "addition" ? orientGatheringFact(candidate, round + equationIndex) : candidate;

  return AlchemistGuildGatheringEquationSchema.parse({
    answer: oriented.answer,
    choiceValues: buildAnswerChoices(oriented.answer, round + equationIndex),
    factId: oriented.factId,
    id: `gathering-equation:${round}:${equationIndex}:${oriented.factId}`,
    left: oriented.left,
    operator: track === "subtraction" ? "-" : "+",
    right: oriented.right,
    selectedValue: null,
  });
}

// Build a phonics "listen & match" question: pick a target word (spaced-repetition
// scheduled), then four distractor words with DIFFERENT vowel sounds so exactly one
// card matches the prompt's vowel. The prompt plays the target's vowel sound.
export function createGatheringPhonicsPrompt(
  level: number,
  round: number,
  promptIndex: number,
  spacedRepetition?: AlchemistGuildGatheringSpacedRepetition,
  nowMs = Date.now(),
): AlchemistGuildGatheringPhonicsPrompt {
  const target = spacedRepetition
    ? pickGatheringPhonicsWord(spacedRepetition, level, round, promptIndex, nowMs)
    : createDeterministicPhonicsWord(level, round, promptIndex);
  const vowel = getPhonicsVowel(target.vowelKey);
  const seed = round + promptIndex;
  const choices = shufflePhonicsWords(
    [target, ...pickPhonicsDistractors(level, target, seed)],
    seed,
  ).map(toGatheringPhonicsChoice);

  return AlchemistGuildGatheringPhonicsPromptSchema.parse({
    choices,
    correctFactId: target.factId,
    hintVoiceClipPath: vowel.hintVoiceClipPath,
    id: `gathering-phonics:${round}:${promptIndex}:${target.factId}`,
    promptVoiceClipPath: vowel.promptVoiceClipPath,
    selectedFactId: null,
    targetLabel: vowel.label,
    targetVowelKey: target.vowelKey,
  });
}

function toGatheringPhonicsChoice(wordEntry: PhonicsWord): AlchemistGuildGatheringPhonicsChoice {
  return {
    factId: wordEntry.factId,
    vowelKey: wordEntry.vowelKey,
    voiceClipPath: wordEntry.voiceClipPath,
    word: wordEntry.word,
  };
}

// Four distractors, each a different vowel sound from the target (and from each
// other where possible) so the contrast is unambiguous. Deterministic by seed.
function pickPhonicsDistractors(level: number, target: PhonicsWord, seed: number): PhonicsWord[] {
  const wordsByVowel = new Map<string, PhonicsWord[]>();
  for (const entry of getPhonicsWordsForLevel(level)) {
    if (entry.vowelKey === target.vowelKey) continue;
    const list = wordsByVowel.get(entry.vowelKey) ?? [];
    list.push(entry);
    wordsByVowel.set(entry.vowelKey, list);
  }

  const orderedVowelKeys = rotateBySeed([...wordsByVowel.keys()].toSorted(), seed);
  const distractors: PhonicsWord[] = [];
  for (const vowelKey of orderedVowelKeys) {
    if (distractors.length >= GATHERING_PHONICS_CHOICE_COUNT - 1) break;
    const words = wordsByVowel.get(vowelKey) ?? [];
    const choice = words[Math.abs(seed + distractors.length) % Math.max(1, words.length)];
    if (choice) distractors.push(choice);
  }
  return distractors;
}

function rotateBySeed<T>(items: readonly T[], seed: number): T[] {
  if (items.length === 0) return [];
  const offset = Math.abs(seed) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

function shufflePhonicsWords(entries: readonly PhonicsWord[], seed: number): PhonicsWord[] {
  const ordered = [...entries];
  for (let index = ordered.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(getDeterministicUnit(seed + index, index) * (index + 1));
    const current = ordered[index];
    const target = ordered[swapIndex];
    if (current && target) {
      ordered[index] = target;
      ordered[swapIndex] = current;
    }
  }
  return ordered;
}

// Derive the gathering monster for a 1-based round from the bestiary ladder. Identity
// (id/name/image) cycles through ALCHEMY_GATHERING_ENEMIES in tier order; the poster
// variant escalates each time the ladder loops. HP starts full at the enemy's maxHp.
export function createGatheringMonsterForRound(round: number): AlchemistGuildGatheringMonster {
  const { enemy, loop } = getGatheringEnemyForRound(round);
  return {
    elementType: gatheringElementForEnemy(enemy),
    hp: enemy.maxHp,
    id: `monster:${enemy.id}`,
    imagePath: getGatheringEnemyImagePath(enemy, loop),
    maxHp: enemy.maxHp,
    name: enemy.name,
  };
}

export function createGatheringRound(
  round: number,
  spacedRepetition?: AlchemistGuildGatheringSpacedRepetition,
  levelProgress?: AlchemistGuildGatheringLevelProgress,
  track: AlchemistGuildGatheringTrackKind = "addition",
): AlchemistGuildGatheringState {
  const resolvedLevelProgress = levelProgress ?? ALCHEMIST_GUILD_GATHERING_DEFAULT.levelProgress;
  const level = resolvedLevelProgress.currentLevel;
  const phonicsPrompt =
    track === "phonics" ? createGatheringPhonicsPrompt(level, round, 1, spacedRepetition) : null;
  const equation =
    track === "phonics"
      ? ALCHEMIST_GUILD_GATHERING_EQUATION_DEFAULT
      : createGatheringEquation(
          round,
          1,
          spacedRepetition,
          Date.now(),
          getGatheringLevelMaxAnswer(level),
          track,
        );

  return AlchemistGuildGatheringStateSchema.parse({
    ...ALCHEMIST_GUILD_GATHERING_DEFAULT,
    monster: createGatheringMonsterForRound(round),
    equation,
    equationIndex: 1,
    levelProgress: resolvedLevelProgress,
    phonicsPrompt,
    round,
    selectedTrack: track,
    spacedRepetition: spacedRepetition ?? ALCHEMIST_GUILD_GATHERING_SPACED_REPETITION_DEFAULT,
  });
}

// The active track's next live question (numeric equation or phonics prompt),
// used by the post-attack advance and the wrong-streak reset.
function buildNextGatheringPrompt(
  state: AlchemistGuildGatheringState,
  nextIndex: number,
): Pick<AlchemistGuildGatheringState, "equation" | "equationIndex" | "phonicsPrompt"> {
  const track = getActiveGatheringTrack(state);
  if (track === "phonics") {
    return {
      equation: state.equation,
      equationIndex: nextIndex,
      phonicsPrompt: createGatheringPhonicsPrompt(
        state.levelProgress.currentLevel,
        state.round,
        nextIndex,
        state.spacedRepetition,
      ),
    };
  }
  return {
    equation: createGatheringEquation(
      state.round,
      nextIndex,
      state.spacedRepetition,
      Date.now(),
      getGatheringLevelMaxAnswer(state.levelProgress.currentLevel),
      track,
    ),
    equationIndex: nextIndex,
    phonicsPrompt: null,
  };
}

function getGatheringMoveLevel(
  move: (typeof GATHERING_MOVE_DEFINITIONS)[number],
  streak: number,
): number {
  return move.levelTwoAt !== null && streak >= move.levelTwoAt ? GATHERING_LEVEL_TWO : 1;
}

function createGatheringMove(
  move: (typeof GATHERING_MOVE_DEFINITIONS)[number],
  streak: number,
): GatheringMove {
  const level = getGatheringMoveLevel(move, streak);
  const damage = move.baseDamage + (level - 1) * GATHERING_ATTACK_LEVEL_TWO_DAMAGE_BONUS;
  return {
    baseDamage: move.baseDamage,
    damage,
    detail: move.detail,
    element: move.element,
    id: move.id,
    level,
    name: move.name,
    soundId: move.soundId,
    unlockStreak: move.unlockStreak,
  };
}

export function getGatheringMoveUnlockCount(streak: number): number {
  return GATHERING_MOVE_DEFINITIONS.filter((move) => streak >= move.unlockStreak).length;
}

export function getGatheringMoveLadder(streak: number): GatheringMoveLadderEntry[] {
  return GATHERING_MOVE_DEFINITIONS.map((move) => ({
    ...createGatheringMove(move, streak),
    locked: streak < move.unlockStreak,
  }));
}

export function getGatheringNextMoveUnlock(streak: number): {
  moveId: GatheringMoveId;
  name: string;
  unlockStreak: number;
} | null {
  const next = GATHERING_MOVE_DEFINITIONS.find((move) => streak < move.unlockStreak);
  return next ? { moveId: next.id, name: next.name, unlockStreak: next.unlockStreak } : null;
}

export function resolveGatheringMoveDamage(
  move: GatheringMove,
  enemyElement: GatheringElementType,
): GatheringMoveDamagePreview {
  const { damage, effectiveness } = applyGatheringElementalDamage(
    move.damage,
    move.element,
    enemyElement,
  );
  return {
    damage,
    effectiveness,
    multiplier: damage / move.damage,
  };
}

function getAvailableGatheringMoves(streak: number): GatheringMove[] {
  return GATHERING_MOVE_DEFINITIONS.filter((move) => streak >= move.unlockStreak).map((move) =>
    createGatheringMove(move, streak),
  );
}

// Phonics combat uses the same streak-unlocked attack card ladder as the numeric
// tracks. The prompt earns the attack opportunity; the card itself owns damage.
export function getGatheringPhonicsMoves(
  _prompt: AlchemistGuildGatheringPhonicsPrompt,
  streak = 0,
): GatheringMove[] {
  return getGatheringMoves(ALCHEMIST_GUILD_GATHERING_EQUATION_DEFAULT, streak);
}

export function getGatheringMoves(
  _equation: AlchemistGuildGatheringEquation,
  streak = 0,
): GatheringMove[] {
  return getAvailableGatheringMoves(streak);
}

export function reviewGatheringSpacedRepetitionFact(
  spacedRepetition: AlchemistGuildGatheringSpacedRepetition,
  equation: AlchemistGuildGatheringEquation,
  correct: boolean,
  reviewedAtMs: number,
): AlchemistGuildGatheringSpacedRepetition {
  return reviewGatheringFactById(
    spacedRepetition,
    equation.factId,
    equation.left,
    equation.right,
    equation.answer,
    correct,
    reviewedAtMs,
  );
}

// Phonics has no numeric operands; left/right are 0 and the difficulty seed is a
// fixed mid value. The SM-2 engine below is otherwise identical across all tracks.
function reviewGatheringPhonicsFact(
  spacedRepetition: AlchemistGuildGatheringSpacedRepetition,
  prompt: AlchemistGuildGatheringPhonicsPrompt,
  correct: boolean,
  reviewedAtMs: number,
): AlchemistGuildGatheringSpacedRepetition {
  return reviewGatheringFactById(
    spacedRepetition,
    prompt.correctFactId,
    0,
    0,
    GATHERING_PHONICS_DIFFICULTY_SEED,
    correct,
    reviewedAtMs,
  );
}

function reviewGatheringFactById(
  spacedRepetition: AlchemistGuildGatheringSpacedRepetition,
  factId: string,
  left: number,
  right: number,
  difficultySeed: number,
  correct: boolean,
  reviewedAtMs: number,
): AlchemistGuildGatheringSpacedRepetition {
  const fact = getOrCreateGatheringFact(spacedRepetition, factId, left, right, difficultySeed);
  const retrievability = getGatheringFactRetrievability(fact, reviewedAtMs);
  const attempts = fact.attempts + 1;
  const correctCount = fact.correctCount + (correct ? 1 : 0);
  const wrongCount = fact.wrongCount + (correct ? 0 : 1);
  const currentStreak = correct ? fact.currentStreak + 1 : 0;
  const difficulty = getNextGatheringFactDifficulty(fact, correct, retrievability);
  const stabilityDays = getNextGatheringFactStabilityDays(
    fact,
    correct,
    retrievability,
    difficulty,
    currentStreak,
  );

  const nextFact: AlchemistGuildGatheringSpacedRepetitionFact = {
    ...fact,
    attempts,
    correctCount,
    currentStreak,
    difficulty,
    dueAtMs: reviewedAtMs + getGatheringReviewIntervalMs(stabilityDays, correct),
    lapses: fact.lapses + (correct ? 0 : 1),
    lastResult: correct ? "correct" : "wrong",
    lastReviewedAtMs: reviewedAtMs,
    lastRetrievability: retrievability,
    longestStreak: Math.max(fact.longestStreak, currentStreak),
    stabilityDays,
    wrongCount,
  };

  return {
    facts: {
      ...spacedRepetition.facts,
      [nextFact.id]: nextFact,
    },
    lastUpdatedAtMs: reviewedAtMs,
  };
}

export function getGatheringFactRetrievability(
  fact: AlchemistGuildGatheringSpacedRepetitionFact,
  nowMs: number,
): number {
  if (fact.lastReviewedAtMs === null || fact.stabilityDays <= 0) return 0;

  const elapsedDays = Math.max(0, (nowMs - fact.lastReviewedAtMs) / GATHERING_DAY_MS);
  return clamp(
    (1 + (GATHERING_SPACED_REPETITION_FACTOR * elapsedDays) / fact.stabilityDays) **
      -GATHERING_SPACED_REPETITION_DECAY,
    0,
    1,
  );
}

export function createGatheringSpacedRepetitionReport(
  spacedRepetition: AlchemistGuildGatheringSpacedRepetition,
  nowMs = Date.now(),
): GatheringSpacedRepetitionReport {
  const facts = Object.values(spacedRepetition.facts).map((fact) =>
    createGatheringReportFact(fact, nowMs),
  );
  const totalAttempts = facts.reduce((total, fact) => total + fact.attempts, 0);
  const totalCorrect = Object.values(spacedRepetition.facts).reduce(
    (total, fact) => total + fact.correctCount,
    0,
  );
  const reviewedFacts = facts.filter((fact) => fact.attempts > 0);
  const divisor = Math.max(1, reviewedFacts.length);

  return {
    accuracy: totalAttempts > 0 ? totalCorrect / totalAttempts : 0,
    averageDifficulty: reviewedFacts.reduce((total, fact) => total + fact.difficulty, 0) / divisor,
    averageRetrievability:
      reviewedFacts.reduce((total, fact) => total + fact.retrievability, 0) / divisor,
    averageStabilityDays:
      reviewedFacts.reduce((total, fact) => total + fact.stabilityDays, 0) / divisor,
    dueCount: facts.filter((fact) => fact.status === "due").length,
    facts: facts.toSorted(compareGatheringReportFacts),
    learningCount: facts.filter((fact) => fact.status === "learning").length,
    masteredCount: facts.filter((fact) => fact.status === "review" && fact.difficulty <= 4).length,
    needsAttention: facts
      .filter((fact) => fact.attempts > 0)
      .toSorted(compareGatheringAttentionFacts)
      .slice(0, 5),
    totalAttempts,
    totalCorrect,
    totalFacts: facts.length,
  };
}

export function createGatheringLevelMasteryReport(
  gathering: AlchemistGuildGatheringState,
  nowMs = Date.now(),
): GatheringLevelMasteryReport {
  const track = getActiveGatheringTrack(gathering);
  const currentLevel = gathering.levelProgress.currentLevel;
  const maxAnswer = isNumericGatheringTrack(track) ? getGatheringLevelMaxAnswer(currentLevel) : 0;
  const factIds = getGatheringTrackFactIds(track, currentLevel);
  let masteredFactCount = 0;
  let strengthSum = 0;
  for (const factId of factIds) {
    const fact = gathering.spacedRepetition.facts[factId];
    if (!fact) continue;
    strengthSum += getGatheringLevelFactStrength(fact, nowMs);
    if (isGatheringLevelFactMastered(fact, nowMs)) masteredFactCount += 1;
  }
  const totalFactCount = factIds.length;
  // `progress` is the graded spaced-repetition strength averaged over the pool, so
  // the Memory track grows with every correct rep (a fully-mastered fact scores 1,
  // so once the counted facts are all mastered this equals the mastered fraction).
  // The boss gate stays strict — it opens on the mastered fraction, not the graded
  // bar — so partial practice can't prematurely charge the gate.
  const progress = totalFactCount > 0 ? strengthSum / totalFactCount : 0;
  const masteredFraction = totalFactCount > 0 ? masteredFactCount / totalFactCount : 0;

  return {
    bossReady:
      masteredFraction >= GATHERING_LEVEL_MASTERY_THRESHOLD &&
      !gathering.levelProgress.completedBossLevels.includes(currentLevel),
    currentLevel,
    masteredFactCount,
    maxAnswer,
    progress,
    requiredProgress: GATHERING_LEVEL_MASTERY_THRESHOLD,
    totalFactCount,
  };
}

export function recordGatheringMasteryProgress(
  gathering: AlchemistGuildGatheringState,
  report: GatheringLevelMasteryReport,
): AlchemistGuildGatheringState {
  const levelKey = String(report.currentLevel);
  const progress = normalizeGatheringMasteryProgress(report.progress);
  if (gathering.levelProgress.masteryProgressByLevel[levelKey] === progress) return gathering;

  return AlchemistGuildGatheringStateSchema.parse({
    ...gathering,
    levelProgress: {
      ...gathering.levelProgress,
      masteryProgressByLevel: {
        ...gathering.levelProgress.masteryProgressByLevel,
        [levelKey]: progress,
      },
    },
  });
}

export function isGatheringBossReady(
  gathering: AlchemistGuildGatheringState,
  nowMs = Date.now(),
): boolean {
  if (gathering.boss.phase !== "idle" && gathering.boss.phase !== "failed") return false;
  return createGatheringLevelMasteryReport(gathering, nowMs).bossReady;
}

export function startGatheringBossFight(
  state: AlchemistGuildGatheringState,
  startedAtMs = Date.now(),
  force = false,
): AlchemistGuildGatheringState {
  if (state.boss.phase === "active" || (!force && !isGatheringBossReady(state, startedAtMs))) {
    return state;
  }

  const level = state.levelProgress.currentLevel;
  return AlchemistGuildGatheringStateSchema.parse({
    ...state,
    boss: createGatheringBossState(
      {
        level,
        phase: "active",
        problemIndex: 1,
        startedAtMs,
      },
      getActiveGatheringTrack(state),
    ),
    lastAnswerCorrect: null,
    phase: "solving",
    wrongAnswerStreak: 0,
  });
}

export function answerGatheringBossChallenge(
  state: AlchemistGuildGatheringState,
  selectedValue: number | null,
  answeredAtMs = Date.now(),
): AlchemistGuildGatheringState {
  if (state.boss.phase !== "active") return state;

  const timedOut =
    state.boss.problemEndsAtMs !== null && answeredAtMs >= state.boss.problemEndsAtMs;
  const correct = !timedOut && selectedValue === state.boss.equation.answer;
  if (correct) return advanceCorrectGatheringBossAnswer(state, answeredAtMs);

  return advanceMissedGatheringBossAnswer(state, answeredAtMs);
}

// Phonics boss answer: the chosen word's factId must match the prompt's target.
export function answerGatheringBossPhonics(
  state: AlchemistGuildGatheringState,
  selectedFactId: string | null,
  answeredAtMs = Date.now(),
): AlchemistGuildGatheringState {
  if (state.boss.phase !== "active" || !state.boss.phonicsPrompt) return state;

  const timedOut =
    state.boss.problemEndsAtMs !== null && answeredAtMs >= state.boss.problemEndsAtMs;
  const correct = !timedOut && selectedFactId === state.boss.phonicsPrompt.correctFactId;
  if (correct) return advanceCorrectGatheringBossAnswer(state, answeredAtMs);

  return advanceMissedGatheringBossAnswer(state, answeredAtMs);
}

export function dismissGatheringBossFailure(
  state: AlchemistGuildGatheringState,
): AlchemistGuildGatheringState {
  if (state.boss.phase !== "failed") return state;

  return AlchemistGuildGatheringStateSchema.parse({
    ...state,
    boss: {
      ...ALCHEMIST_GUILD_GATHERING_BOSS_DEFAULT,
      level: state.levelProgress.currentLevel,
    },
  });
}

export function claimGatheringBossReward(
  state: AlchemistGuildGatheringState,
  claimedAtMs = Date.now(),
): AlchemistGuildGatheringState {
  if (state.boss.phase !== "reward") return state;

  const track = getActiveGatheringTrack(state);
  const completedLevel = state.boss.level;
  // Beating the boss advances ONLY this track (its level 2 unlocks), parks its
  // learning state, and returns the player to the learning-path map to choose
  // their next path — they may pick this track's level 2 OR another track's
  // level 1, but never another track's level 2 (that needs its own level-1 boss).
  const nextLevelProgress = createNextGatheringLevelProgress(state.levelProgress, completedLevel);
  const trackArchive = {
    ...state.trackArchive,
    [track]: {
      levelProgress: nextLevelProgress,
      parkedRound: state.round + 1,
      spacedRepetition: state.spacedRepetition,
    },
  };

  return AlchemistGuildGatheringStateSchema.parse({
    ...ALCHEMIST_GUILD_GATHERING_DEFAULT,
    gatherLog: [
      ...state.boss.rewardCardIds.map((cardId, index) => ({
        cardId,
        collectedAtMs: claimedAtMs,
        id: `boss:${completedLevel}:${claimedAtMs}:${index}:${cardId}`,
        round: state.round,
      })),
      ...state.gatherLog,
    ].slice(0, GATHERING_LOG_LIMIT),
    // selectedTrack === null shows the learning-path map (default), no path locked in.
    selectedTrack: null,
    // A flawless run carries its streak through the boss into the next path.
    streak: state.streak,
    targetDropChances: state.targetDropChances,
    trackArchive,
    unlockSeen: true,
  });
}

// One option on the learning-path map. `level` is the next selectable level (null
// once both levels are complete). `isComplete` flags a fully-beaten track.
export type GatheringPathOption = {
  completedLevels: number[];
  isComplete: boolean;
  level: number | null;
  track: AlchemistGuildGatheringTrackKind;
};

// The offered level for a track: level 1 until its level-1 boss falls, then level
// 2 until that boss falls, then null (complete). This is the whole lock rule —
// level 2 is only reachable by beating the same track's level 1.
function getGatheringTrackOfferedLevel(
  levelProgress: AlchemistGuildGatheringLevelProgress,
): number | null {
  if (!levelProgress.completedBossLevels.includes(GATHERING_LEVEL_ONE)) return GATHERING_LEVEL_ONE;
  if (!levelProgress.completedBossLevels.includes(GATHERING_LEVEL_TWO)) return GATHERING_LEVEL_TWO;
  return null;
}

export function getGatheringPathMap(state: AlchemistGuildGatheringState): GatheringPathOption[] {
  return GATHERING_TRACK_KINDS.map((track) => {
    const archive = state.trackArchive[track];
    const offeredLevel = getGatheringTrackOfferedLevel(archive.levelProgress);
    return {
      completedLevels: [...archive.levelProgress.completedBossLevels],
      isComplete: offeredLevel === null,
      level: offeredLevel,
      track,
    };
  });
}

// Pick a path from the map and lock into it. Refused while a path is already in
// progress (selectedTrack !== null) or if the chosen track is already complete.
export function selectGatheringTrack(
  state: AlchemistGuildGatheringState,
  track: AlchemistGuildGatheringTrackKind,
): AlchemistGuildGatheringState {
  if (state.selectedTrack !== null) return state;

  const archive = state.trackArchive[track];
  const offeredLevel = getGatheringTrackOfferedLevel(archive.levelProgress);
  if (offeredLevel === null) return state;

  const levelProgress: AlchemistGuildGatheringLevelProgress = {
    ...archive.levelProgress,
    currentLevel: offeredLevel,
  };
  const round = createGatheringRound(
    archive.parkedRound,
    archive.spacedRepetition,
    levelProgress,
    track,
  );

  return AlchemistGuildGatheringStateSchema.parse({
    ...round,
    gatherLog: state.gatherLog,
    selectedTrack: track,
    streak: state.streak,
    targetDropChances: state.targetDropChances,
    trackArchive: state.trackArchive,
    unlockSeen: true,
  });
}

export function createGatheringBossReadyState(
  level = GATHERING_LEVEL_ONE,
  nowMs = Date.now(),
  track: AlchemistGuildGatheringTrackKind = "addition",
): AlchemistGuildGatheringState {
  const currentLevel = clampGatheringLevel(level);
  const levelProgress = createGatheringLevelProgressForLevel(currentLevel);
  const spacedRepetition = createGatheringLevelMasteredSpacedRepetition(track, currentLevel, nowMs);

  return AlchemistGuildGatheringStateSchema.parse({
    ...createGatheringRound(1, spacedRepetition, levelProgress, track),
    boss: {
      ...ALCHEMIST_GUILD_GATHERING_BOSS_DEFAULT,
      level: currentLevel,
    },
    levelProgress,
    selectedTrack: track,
    spacedRepetition,
  });
}

export function createActiveGatheringBossTestState(
  level = GATHERING_LEVEL_ONE,
  nowMs = Date.now(),
  track: AlchemistGuildGatheringTrackKind = "addition",
): AlchemistGuildGatheringState {
  return startGatheringBossFight(createGatheringBossReadyState(level, nowMs, track), nowMs, true);
}

export function getGatheringBossRewardQuantity(level: number): number {
  return clampGatheringLevel(level) + 2;
}

function getGatheringLevelMaxAnswer(level: number): number {
  return clampGatheringLevel(level) === GATHERING_LEVEL_TWO
    ? GATHERING_LEVEL_TWO_MAX_ANSWER
    : GATHERING_LEVEL_ONE_MAX_ANSWER;
}

function isGatheringLevelFactMastered(
  fact: AlchemistGuildGatheringSpacedRepetitionFact,
  nowMs: number,
): boolean {
  const accuracy = fact.attempts > 0 ? fact.correctCount / fact.attempts : 0;
  return (
    fact.attempts >= GATHERING_FACT_MASTERY_MIN_ATTEMPTS &&
    accuracy >= GATHERING_FACT_MASTERY_MIN_ACCURACY &&
    fact.currentStreak >= GATHERING_FACT_MASTERY_MIN_STREAK &&
    getGatheringFactRetrievability(fact, nowMs) >= GATHERING_LEVEL_MASTERY_THRESHOLD
  );
}

// Graded per-fact memory strength in [0,1] from the live spaced-repetition state.
// Each mastery criterion contributes equally and is capped at its threshold, so a
// fully-mastered fact scores exactly 1.0 while a partially-practiced fact earns
// partial credit. Averaged over the fact pool this is what makes the Memory track
// grow with each correct rep instead of only when a fact crosses the mastery line.
function getGatheringLevelFactStrength(
  fact: AlchemistGuildGatheringSpacedRepetitionFact,
  nowMs: number,
): number {
  if (fact.attempts <= 0) return 0;
  const accuracy = fact.correctCount / fact.attempts;
  const attemptsScore = Math.min(fact.attempts / GATHERING_FACT_MASTERY_MIN_ATTEMPTS, 1);
  const accuracyScore = Math.min(accuracy / GATHERING_FACT_MASTERY_MIN_ACCURACY, 1);
  const streakScore = Math.min(fact.currentStreak / GATHERING_FACT_MASTERY_MIN_STREAK, 1);
  const retrievabilityScore = Math.min(
    getGatheringFactRetrievability(fact, nowMs) / GATHERING_LEVEL_MASTERY_THRESHOLD,
    1,
  );
  return (attemptsScore + accuracyScore + streakScore + retrievabilityScore) / 4;
}

function createGatheringBossState(
  input: Pick<AlchemistGuildGatheringBossState, "level" | "phase" | "problemIndex"> &
    Partial<AlchemistGuildGatheringBossState>,
  track: AlchemistGuildGatheringTrackKind = "addition",
): AlchemistGuildGatheringBossState {
  const startedAtMs = input.startedAtMs ?? Date.now();
  const problemStartedAtMs = input.problemStartedAtMs ?? startedAtMs;
  const active = input.phase === "active";
  const phonicsActive = active && track === "phonics";
  const numericTrack: NumericGatheringTrackKind =
    track === "subtraction" ? "subtraction" : "addition";

  const equation =
    active && !phonicsActive
      ? createGatheringBossEquation(
          numericTrack,
          input.level,
          input.problemIndex,
          problemStartedAtMs,
        )
      : (input.equation ?? ALCHEMIST_GUILD_GATHERING_EQUATION_DEFAULT);

  let phonicsPrompt: AlchemistGuildGatheringPhonicsPrompt | null;
  if (phonicsActive) {
    phonicsPrompt = createGatheringBossPhonicsPrompt(
      input.level,
      input.problemIndex,
      problemStartedAtMs,
    );
  } else if (active) {
    phonicsPrompt = null;
  } else {
    phonicsPrompt = input.phonicsPrompt ?? null;
  }

  return {
    ...ALCHEMIST_GUILD_GATHERING_BOSS_DEFAULT,
    ...input,
    equation,
    phonicsPrompt,
    problemEndsAtMs: active ? problemStartedAtMs + GATHERING_BOSS_PROBLEM_DURATION_MS : null,
    problemStartedAtMs: active ? problemStartedAtMs : null,
    startedAtMs,
  };
}

// Review the boss problem against the active track's spaced-repetition store —
// phonics problems review the phonics fact, numeric problems the equation fact.
function reviewGatheringBossFact(
  state: AlchemistGuildGatheringState,
  correct: boolean,
  answeredAtMs: number,
): AlchemistGuildGatheringSpacedRepetition {
  if (getActiveGatheringTrack(state) === "phonics" && state.boss.phonicsPrompt) {
    return reviewGatheringPhonicsFact(
      state.spacedRepetition,
      state.boss.phonicsPrompt,
      correct,
      answeredAtMs,
    );
  }
  return reviewGatheringSpacedRepetitionFact(
    state.spacedRepetition,
    state.boss.equation,
    correct,
    answeredAtMs,
  );
}

function advanceCorrectGatheringBossAnswer(
  state: AlchemistGuildGatheringState,
  answeredAtMs: number,
): AlchemistGuildGatheringState {
  const track = getActiveGatheringTrack(state);
  const spacedRepetition = reviewGatheringBossFact(state, true, answeredAtMs);
  const currentStreak = state.boss.currentStreak + 1;

  if (currentStreak >= GATHERING_BOSS_REQUIRED_STREAK) {
    return AlchemistGuildGatheringStateSchema.parse({
      ...state,
      boss: createGatheringBossState(
        {
          ...state.boss,
          completedAtMs: answeredAtMs,
          currentStreak,
          lastAnswerCorrect: true,
          phase: "reward",
          problemEndsAtMs: null,
          problemStartedAtMs: null,
          rewardCardIds: createGatheringBossRewardCardIds(state.boss.level),
        },
        track,
      ),
      lastAnswerCorrect: true,
      spacedRepetition,
    });
  }

  return AlchemistGuildGatheringStateSchema.parse({
    ...state,
    boss: createGatheringBossState(
      {
        ...state.boss,
        currentStreak,
        lastAnswerCorrect: true,
        phase: "active",
        problemIndex: state.boss.problemIndex + 1,
        problemStartedAtMs: answeredAtMs,
      },
      track,
    ),
    lastAnswerCorrect: true,
    spacedRepetition,
  });
}

function advanceMissedGatheringBossAnswer(
  state: AlchemistGuildGatheringState,
  answeredAtMs: number,
): AlchemistGuildGatheringState {
  const track = getActiveGatheringTrack(state);
  const misses = Math.min(GATHERING_BOSS_ALLOWED_MISSES + 1, state.boss.misses + 1);
  const spacedRepetition = reviewGatheringBossFact(state, false, answeredAtMs);

  if (misses > GATHERING_BOSS_ALLOWED_MISSES) {
    return AlchemistGuildGatheringStateSchema.parse({
      ...state,
      boss: createGatheringBossState(
        {
          ...state.boss,
          currentStreak: 0,
          failedAtMs: answeredAtMs,
          lastAnswerCorrect: false,
          misses,
          phase: "failed",
          problemEndsAtMs: null,
          problemStartedAtMs: null,
        },
        track,
      ),
      lastAnswerCorrect: false,
      phase: "solving",
      spacedRepetition: resetGatheringLevelSpacedRepetition(
        spacedRepetition,
        track,
        state.boss.level,
        answeredAtMs,
      ),
      wrongAnswerStreak: 0,
    });
  }

  return AlchemistGuildGatheringStateSchema.parse({
    ...state,
    boss: createGatheringBossState(
      {
        ...state.boss,
        currentStreak: 0,
        lastAnswerCorrect: false,
        misses,
        phase: "active",
        problemIndex: state.boss.problemIndex + 1,
        problemStartedAtMs: answeredAtMs,
      },
      track,
    ),
    lastAnswerCorrect: false,
    spacedRepetition,
  });
}

function createGatheringBossEquation(
  track: NumericGatheringTrackKind,
  level: number,
  problemIndex: number,
  seedMs: number,
): AlchemistGuildGatheringEquation {
  const maxAnswer = getGatheringLevelMaxAnswer(level);
  const candidates = createGatheringNumericFactPool(track, maxAnswer);
  const seed = problemIndex * 17 + clampGatheringLevel(level) * 31 + Math.floor(seedMs / 1000);
  const candidate = candidates[Math.abs(seed) % candidates.length];
  if (!candidate)
    return createGatheringEquation(1, problemIndex, undefined, seedMs, maxAnswer, track);

  const oriented = track === "addition" ? orientGatheringFact(candidate, seed) : candidate;
  return AlchemistGuildGatheringEquationSchema.parse({
    answer: oriented.answer,
    choiceValues: buildAnswerChoices(oriented.answer, seed),
    factId: oriented.factId,
    id: `gathering-boss:${clampGatheringLevel(level)}:${problemIndex}:${oriented.factId}`,
    left: oriented.left,
    operator: track === "subtraction" ? "-" : "+",
    right: oriented.right,
    selectedValue: null,
  });
}

function createGatheringBossPhonicsPrompt(
  level: number,
  problemIndex: number,
  seedMs: number,
): AlchemistGuildGatheringPhonicsPrompt {
  const seed = problemIndex * 17 + clampGatheringLevel(level) * 31 + Math.floor(seedMs / 1000);
  // Reuse the live prompt builder with a boss-derived seed; the unique id keeps
  // each boss problem distinct from the live round's prompts.
  const prompt = createGatheringPhonicsPrompt(level, seed, problemIndex);
  return AlchemistGuildGatheringPhonicsPromptSchema.parse({
    ...prompt,
    id: `gathering-boss-phonics:${clampGatheringLevel(level)}:${problemIndex}:${prompt.correctFactId}`,
  });
}

function createGatheringBossRewardCardIds(level: number): AlchemistGuildCardId[] {
  const startAtomicNumber = clampGatheringLevel(level) === GATHERING_LEVEL_TWO ? 21 : 11;
  return ELEMENT_CARDS.filter(
    (card) =>
      card.element.atomicNumber >= startAtomicNumber &&
      card.element.atomicNumber < startAtomicNumber + GATHERING_BOSS_REWARD_CARD_COUNT,
  ).map((card) => card.id);
}

function getNextGatheringLevel(level: number): number {
  return Math.min(GATHERING_LEVEL_TWO, clampGatheringLevel(level) + 1);
}

function createNextGatheringLevelProgress(
  progress: AlchemistGuildGatheringLevelProgress,
  completedLevel: number,
): AlchemistGuildGatheringLevelProgress {
  const completedBossLevels = appendNumberUnique(
    progress.completedBossLevels,
    clampGatheringLevel(completedLevel),
  );
  const nextLevel = getNextGatheringLevel(completedLevel);
  return {
    completedBossLevels,
    currentLevel: nextLevel,
    highestUnlockedLevel: Math.max(progress.highestUnlockedLevel, nextLevel),
    masteryProgressByLevel: {
      ...progress.masteryProgressByLevel,
      [String(clampGatheringLevel(completedLevel))]: 1,
      [String(nextLevel)]: progress.masteryProgressByLevel[String(nextLevel)] ?? 0,
    },
  };
}

function resetGatheringLevelSpacedRepetition(
  spacedRepetition: AlchemistGuildGatheringSpacedRepetition,
  track: AlchemistGuildGatheringTrackKind,
  level: number,
  resetAtMs: number,
): AlchemistGuildGatheringSpacedRepetition {
  const resetFactIds = new Set(getGatheringTrackFactIds(track, level));
  const facts: AlchemistGuildGatheringSpacedRepetition["facts"] = {};

  for (const [factId, fact] of Object.entries(spacedRepetition.facts)) {
    if (!resetFactIds.has(factId)) facts[factId] = fact;
  }

  return {
    facts,
    lastUpdatedAtMs: resetAtMs,
  };
}

function clampGatheringLevel(level: number): number {
  return level >= GATHERING_LEVEL_TWO ? GATHERING_LEVEL_TWO : GATHERING_LEVEL_ONE;
}

function createGatheringLevelProgressForLevel(level: number): AlchemistGuildGatheringLevelProgress {
  const currentLevel = clampGatheringLevel(level);
  return {
    completedBossLevels: currentLevel === GATHERING_LEVEL_TWO ? [GATHERING_LEVEL_ONE] : [],
    currentLevel,
    highestUnlockedLevel: currentLevel,
    masteryProgressByLevel: {},
  };
}

function normalizeGatheringMasteryProgress(progress: number): number {
  return Math.round(Math.min(1, Math.max(0, progress)) * 10_000) / 10_000;
}

function createGatheringLevelMasteredSpacedRepetition(
  track: AlchemistGuildGatheringTrackKind,
  level: number,
  masteredAtMs: number,
): AlchemistGuildGatheringSpacedRepetition {
  const facts: AlchemistGuildGatheringSpacedRepetition["facts"] = {};
  for (const candidate of getGatheringTrackFactSeeds(track, level)) {
    facts[candidate.factId] = {
      attempts: 3,
      correctCount: 3,
      currentStreak: 3,
      difficulty: 3.1,
      dueAtMs: masteredAtMs + 14 * GATHERING_DAY_MS,
      id: candidate.factId,
      lapses: 0,
      lastResult: "correct",
      lastReviewedAtMs: masteredAtMs,
      lastRetrievability: 1,
      left: candidate.left,
      longestStreak: 3,
      right: candidate.right,
      stabilityDays: 14,
      wrongCount: 0,
    };
  }

  return {
    facts,
    lastUpdatedAtMs: masteredAtMs,
  };
}

function appendNumberUnique(values: readonly number[], value: number): number[] {
  return values.includes(value)
    ? [...values]
    : [...values, value].toSorted((left, right) => left - right);
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
  reviewedAtMs = Date.now(),
): AlchemistGuildGatheringState {
  if (state.phase !== "solving" || state.equation.selectedValue === null) return state;

  const correct = state.equation.selectedValue === state.equation.answer;
  const wrongAnswerStreak = correct
    ? 0
    : Math.min(GATHERING_WRONG_ANSWER_RESET_COUNT, state.wrongAnswerStreak + 1);
  const spacedRepetition = reviewGatheringSpacedRepetitionFact(
    state.spacedRepetition,
    state.equation,
    correct,
    reviewedAtMs,
  );
  const streak = advanceGatheringStreak(state.streak, correct, reviewedAtMs);

  return AlchemistGuildGatheringStateSchema.parse({
    ...state,
    lastAnswerCorrect: correct,
    phase: correct ? "move" : "solving",
    spacedRepetition,
    streak,
    wrongAnswerStreak,
  });
}

export function resetGatheringEquationAfterWrongStreak(
  state: AlchemistGuildGatheringState,
): AlchemistGuildGatheringState {
  if (state.phase !== "solving" || state.wrongAnswerStreak < GATHERING_WRONG_ANSWER_RESET_COUNT) {
    return state;
  }

  return AlchemistGuildGatheringStateSchema.parse({
    ...state,
    ...buildNextGatheringPrompt(state, state.equationIndex + 1),
    lastAnswerCorrect: null,
    phase: "solving",
    wrongAnswerStreak: 0,
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

// ---- Phonics live-play handlers (the audio-match analogue of the numeric ones) ----

export function selectGatheringPhonicsChoice(
  state: AlchemistGuildGatheringState,
  factId: string,
): AlchemistGuildGatheringState {
  if (state.phase !== "solving" || !state.phonicsPrompt) return state;
  if (!state.phonicsPrompt.choices.some((choice) => choice.factId === factId)) return state;

  return AlchemistGuildGatheringStateSchema.parse({
    ...state,
    lastAnswerCorrect: null,
    phase: "solving",
    phonicsPrompt: { ...state.phonicsPrompt, selectedFactId: factId },
  });
}

export function confirmGatheringPhonicsAnswer(
  state: AlchemistGuildGatheringState,
  reviewedAtMs = Date.now(),
): AlchemistGuildGatheringState {
  if (state.phase !== "solving" || !state.phonicsPrompt) return state;
  const selectedFactId = state.phonicsPrompt.selectedFactId;
  if (selectedFactId === null) return state;

  const correct = selectedFactId === state.phonicsPrompt.correctFactId;
  const wrongAnswerStreak = correct
    ? 0
    : Math.min(GATHERING_WRONG_ANSWER_RESET_COUNT, state.wrongAnswerStreak + 1);
  const spacedRepetition = reviewGatheringPhonicsFact(
    state.spacedRepetition,
    state.phonicsPrompt,
    correct,
    reviewedAtMs,
  );
  const streak = advanceGatheringStreak(state.streak, correct, reviewedAtMs);

  return AlchemistGuildGatheringStateSchema.parse({
    ...state,
    lastAnswerCorrect: correct,
    phase: correct ? "move" : "solving",
    spacedRepetition,
    streak,
    wrongAnswerStreak,
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

  const moves =
    getActiveGatheringTrack(state) === "phonics" && state.phonicsPrompt
      ? getGatheringPhonicsMoves(state.phonicsPrompt, state.streak.current)
      : getGatheringMoves(state.equation, state.streak.current);
  const move = moves.find((candidate) => candidate.id === moveId);
  if (!move) return state;

  const { damage } = resolveGatheringMoveDamage(move, state.monster.elementType);
  const nextHp = Math.max(0, state.monster.hp - damage);
  if (nextHp <= 0) {
    const rewardPlan = createGatheringRewardPlan(
      state.round,
      rewardContext,
      state.targetDropChances,
    );
    return AlchemistGuildGatheringStateSchema.parse({
      ...state,
      monster: { ...state.monster, hp: 0 },
      phase: "reward",
      rewardOptionCardIds: rewardPlan.cardIds,
      targetDropChances: rewardPlan.targetDropChances,
    });
  }

  return AlchemistGuildGatheringStateSchema.parse({
    ...state,
    ...buildNextGatheringPrompt(state, state.equationIndex + 1),
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

  const nextRound = createGatheringRound(
    state.round + 1,
    state.spacedRepetition,
    state.levelProgress,
    getActiveGatheringTrack(state),
  );
  return AlchemistGuildGatheringStateSchema.parse({
    ...nextRound,
    boss: state.boss,
    gatherLog: [
      {
        cardId,
        collectedAtMs,
        id: `gather:${state.round}:${collectedAtMs}:${cardId}`,
        round: state.round,
      },
      ...state.gatherLog,
    ].slice(0, GATHERING_LOG_LIMIT),
    // Stay on the active path and keep the other tracks' parked progress.
    selectedTrack: state.selectedTrack,
    // Carry the answer streak across the round transition — `createGatheringRound`
    // resets it to the default, but a streak only breaks on a WRONG answer
    // (advanceGatheringStreak), never on winning a fight. Without this the streak
    // resets every kill and could never reach the 10/15/30 reward tiers.
    streak: state.streak,
    targetDropChances: state.targetDropChances,
    trackArchive: state.trackArchive,
  });
}

export function createGatheringRewardOptions(
  round: number,
  context?: GatheringRewardContext,
  targetDropChances: Readonly<AlchemistGuildGatheringTargetDropChances> = {},
): AlchemistGuildCardId[] {
  return createGatheringRewardPlan(round, context, targetDropChances).cardIds;
}

export function createGatheringRewardPlan(
  round: number,
  context?: GatheringRewardContext,
  targetDropChances: Readonly<AlchemistGuildGatheringTargetDropChances> = {},
): GatheringRewardPlan {
  const selectedQuestDemandScores = createSelectedQuestPrimitiveDemandScores(context);
  const selectedTargetCardIds = getOrderedDemandCardIds(selectedQuestDemandScores);
  const nextTargetDropChances = advanceTargetDropChances(targetDropChances, selectedTargetCardIds);
  const targetHitCardIds = selectTargetDropHits(
    round,
    selectedTargetCardIds,
    nextTargetDropChances,
  );
  const demandScores = createPrimitiveDemandScores(context);
  const firstQuestDemandScores = createPrimitiveDemandScores(context, 1);
  const firstQuestDemandCardIds = new Set(firstQuestDemandScores.keys());
  const selectedTargetCardIdSet = new Set(selectedTargetCardIds);
  const targetHitCardIdSet = new Set(targetHitCardIds);
  let focusedDemandCardIds: ReadonlySet<string>;
  if (selectedTargetCardIdSet.size > 0) {
    focusedDemandCardIds = selectedTargetCardIdSet;
  } else if (firstQuestDemandCardIds.size > 0) {
    focusedDemandCardIds = firstQuestDemandCardIds;
  } else {
    focusedDemandCardIds = new Set(demandScores.keys());
  }
  const focusedSlotCount = Math.min(GATHERING_REWARD_FOCUS_OPTION_COUNT, focusedDemandCardIds.size);
  const selectedCardIds: AlchemistGuildCardId[] = targetHitCardIds.slice(
    0,
    GATHERING_REWARD_OPTION_COUNT,
  );
  const excludedCardIds = new Set(
    selectedTargetCardIds.filter((cardId) => !targetHitCardIdSet.has(cardId)),
  );

  for (
    let slotIndex = selectedCardIds.length;
    slotIndex < GATHERING_REWARD_OPTION_COUNT;
    slotIndex += 1
  ) {
    selectedCardIds.push(
      pickWeightedRewardCard({
        demandScores,
        excludedCardIds,
        focusedCardIds: focusedDemandCardIds,
        focused: slotIndex < focusedSlotCount,
        round,
        selectedCardIds,
        slotIndex,
      }),
    );
  }

  // New Reward Slot upgrade: once confirmed, a coin flip per kill adds a 4th
  // reward option to pick from. (Confirm-gated, so it never fires unlocked.)
  if (
    hasUpgrade(context?.unlockedUpgradeIds ?? [], NEW_REWARD_SLOT_UPGRADE_ID) &&
    Math.random() < NEW_REWARD_SLOT_FOURTH_CHANCE
  ) {
    selectedCardIds.push(
      pickWeightedRewardCard({
        demandScores,
        excludedCardIds,
        focusedCardIds: focusedDemandCardIds,
        focused: false,
        round,
        selectedCardIds,
        slotIndex: GATHERING_REWARD_OPTION_COUNT,
      }),
    );
  }

  return {
    cardIds: selectedCardIds,
    targetDropChances: nextTargetDropChances,
  };
}

function pickGatheringNumericFact(
  spacedRepetition: AlchemistGuildGatheringSpacedRepetition,
  track: NumericGatheringTrackKind,
  round: number,
  equationIndex: number,
  nowMs: number,
  maxAnswer: number,
): GatheringFactCandidate {
  const candidates = createGatheringNumericFactPool(track, maxAnswer);
  const reviewedPicks: GatheringFactSchedulePick[] = [];
  const newPicks: GatheringFactSchedulePick[] = [];

  for (const candidate of candidates) {
    const fact = spacedRepetition.facts[candidate.factId];
    if (!fact) {
      newPicks.push({
        ...candidate,
        score:
          getDeterministicUnit(round + equationIndex, candidate.answer) * GATHERING_NEW_FACT_WEIGHT,
      });
      continue;
    }

    reviewedPicks.push({
      ...candidate,
      score: getGatheringFactScheduleScore(fact, nowMs),
    });
  }

  const duePicks = reviewedPicks.filter((pick) => {
    const fact = spacedRepetition.facts[pick.factId];
    return fact !== undefined && fact.dueAtMs <= nowMs;
  });
  if (duePicks.length > 0) return getHighestScoredGatheringFact(duePicks);
  if (newPicks.length > 0) return getHighestScoredGatheringFact(newPicks);
  if (reviewedPicks.length > 0) return getHighestScoredGatheringFact(reviewedPicks);

  return createDeterministicGatheringNumericFact(track, round, equationIndex, maxAnswer);
}

// Phonics scheduling mirrors the numeric scheduler: due facts first, then unseen
// words, then weakest reviewed — all keyed off the same spaced-repetition stats.
function pickGatheringPhonicsWord(
  spacedRepetition: AlchemistGuildGatheringSpacedRepetition,
  level: number,
  round: number,
  promptIndex: number,
  nowMs: number,
): PhonicsWord {
  const words = getPhonicsWordsForLevel(level);
  const reviewed: Array<{ score: number; word: PhonicsWord }> = [];
  const fresh: Array<{ score: number; word: PhonicsWord }> = [];

  for (const [wordIndex, word] of words.entries()) {
    const fact = spacedRepetition.facts[word.factId];
    if (!fact) {
      fresh.push({
        score: getDeterministicUnit(round + promptIndex, wordIndex) * GATHERING_NEW_FACT_WEIGHT,
        word,
      });
      continue;
    }
    reviewed.push({ score: getGatheringFactScheduleScore(fact, nowMs), word });
  }

  const due = reviewed.filter((pick) => {
    const fact = spacedRepetition.facts[pick.word.factId];
    return fact !== undefined && fact.dueAtMs <= nowMs;
  });
  if (due.length > 0) return getHighestScoredPhonicsWord(due);
  if (fresh.length > 0) return getHighestScoredPhonicsWord(fresh);
  if (reviewed.length > 0) return getHighestScoredPhonicsWord(reviewed);

  return createDeterministicPhonicsWord(level, round, promptIndex);
}

function getHighestScoredPhonicsWord(
  picks: ReadonlyArray<{ score: number; word: PhonicsWord }>,
): PhonicsWord {
  const pick = picks.toSorted(
    (left, right) => right.score - left.score || left.word.factId.localeCompare(right.word.factId),
  )[0];
  if (!pick) throw new Error("gathering phonics schedule unexpectedly empty");
  return pick.word;
}

function createDeterministicPhonicsWord(
  level: number,
  round: number,
  promptIndex: number,
): PhonicsWord {
  const words = getPhonicsWordsForLevel(level);
  const word = words[(round * 7 + promptIndex * 11) % words.length];
  if (!word) throw new Error("gathering phonics pool unexpectedly empty");
  return word;
}

// Every factId for a (track, level) — the spaced-repetition universe used by the
// mastery report, the level reset, and the mastered-seed builder. Track-agnostic.
function getGatheringTrackFactIds(
  track: AlchemistGuildGatheringTrackKind,
  level: number,
): string[] {
  if (track === "phonics") return getPhonicsWordsForLevel(level).map((word) => word.factId);
  return createGatheringNumericFactPool(track, getGatheringLevelMaxAnswer(level)).map(
    (candidate) => candidate.factId,
  );
}

// Per-fact left/right seeds (phonics has none → 0) for building a fully-mastered
// spaced-repetition snapshot of a track+level.
function getGatheringTrackFactSeeds(
  track: AlchemistGuildGatheringTrackKind,
  level: number,
): GatheringFactCandidate[] {
  if (track === "phonics") {
    return getPhonicsWordsForLevel(level).map((word) => ({
      answer: 0,
      factId: word.factId,
      left: 0,
      right: 0,
    }));
  }
  return createGatheringNumericFactPool(track, getGatheringLevelMaxAnswer(level));
}

function createGatheringNumericFactPool(
  track: NumericGatheringTrackKind,
  maxAnswer: number,
): GatheringFactCandidate[] {
  const candidates: GatheringFactCandidate[] = [];

  for (let left = 1; left <= maxAnswer; left += 1) {
    for (let right = left; left + right <= maxAnswer; right += 1) {
      candidates.push(createGatheringNumericFactCandidate(track, left, right));
    }
  }

  return candidates;
}

function createDeterministicGatheringNumericFact(
  track: NumericGatheringTrackKind,
  round: number,
  equationIndex: number,
  maxAnswer = GATHERING_LEVEL_ONE_MAX_ANSWER,
): GatheringFactCandidate {
  const candidates = createGatheringNumericFactPool(track, maxAnswer);
  const candidate = candidates[(round * 7 + equationIndex * 11) % candidates.length];
  if (!candidate) return createGatheringNumericFactCandidate(track, 1, 1);
  return candidate;
}

// One numeric fact from a pair of addends. Addition uses them directly; subtraction
// mirrors each addition fact as `(a+b) - b = a`, so the two numeric pools are the
// same size (level 1 = 25 facts, level 2 = 100) and stay equivalent in length.
function createGatheringNumericFactCandidate(
  track: NumericGatheringTrackKind,
  addendA: number,
  addendB: number,
): GatheringFactCandidate {
  const canonical = getCanonicalGatheringFact(addendA, addendB);
  if (track === "subtraction") {
    const minuend = canonical.left + canonical.right;
    return {
      answer: canonical.left,
      factId: `subtraction:${minuend}-${canonical.right}`,
      left: minuend,
      right: canonical.right,
    };
  }
  return {
    answer: canonical.left + canonical.right,
    factId: createGatheringFactId(canonical.left, canonical.right),
    left: canonical.left,
    right: canonical.right,
  };
}

function orientGatheringFact(
  candidate: GatheringFactCandidate,
  seed: number,
): GatheringFactCandidate {
  if (candidate.left === candidate.right || seed % 2 === 0) return candidate;

  return {
    ...candidate,
    left: candidate.right,
    right: candidate.left,
  };
}

function getCanonicalGatheringFact(left: number, right: number): { left: number; right: number } {
  return left <= right ? { left, right } : { left: right, right: left };
}

function createGatheringFactId(left: number, right: number): string {
  return `addition:${left}+${right}`;
}

function getHighestScoredGatheringFact(
  picks: readonly GatheringFactSchedulePick[],
): GatheringFactCandidate {
  const pick = picks.toSorted(
    (left, right) => right.score - left.score || left.factId.localeCompare(right.factId),
  )[0];
  if (!pick) throw new Error("gathering spaced-repetition schedule unexpectedly empty");
  return pick;
}

function getGatheringFactScheduleScore(
  fact: AlchemistGuildGatheringSpacedRepetitionFact,
  nowMs: number,
): number {
  const retrievability = getGatheringFactRetrievability(fact, nowMs);
  const dueBoost = fact.dueAtMs <= nowMs ? GATHERING_DUE_FACT_WEIGHT : 0;
  const lapsePressure = fact.lapses * 8 + fact.wrongCount * 2.5;
  const difficultyPressure = fact.difficulty * 3;
  const memoryPressure = (1 - retrievability) * 42;

  return dueBoost + lapsePressure + difficultyPressure + memoryPressure;
}

function getOrCreateGatheringFact(
  spacedRepetition: AlchemistGuildGatheringSpacedRepetition,
  factId: string,
  left: number,
  right: number,
  difficultySeed: number,
): AlchemistGuildGatheringSpacedRepetitionFact {
  return (
    spacedRepetition.facts[factId] ?? {
      attempts: 0,
      correctCount: 0,
      currentStreak: 0,
      difficulty: getInitialGatheringFactDifficulty(difficultySeed),
      dueAtMs: 0,
      id: factId,
      lapses: 0,
      lastResult: null,
      lastReviewedAtMs: null,
      lastRetrievability: 0,
      left,
      longestStreak: 0,
      right,
      stabilityDays: 0,
      wrongCount: 0,
    }
  );
}

function getInitialGatheringFactDifficulty(answer: number): number {
  return clamp(4.7 + answer * 0.06, 1, 10);
}

function getNextGatheringFactDifficulty(
  fact: AlchemistGuildGatheringSpacedRepetitionFact,
  correct: boolean,
  retrievability: number,
): number {
  if (!correct) return clamp(fact.difficulty + 0.85 + (1 - retrievability) * 0.35, 1, 10);

  return clamp(
    fact.difficulty - 0.32 - fact.currentStreak * 0.04 - (1 - retrievability) * 0.12,
    1,
    10,
  );
}

function getNextGatheringFactStabilityDays(
  fact: AlchemistGuildGatheringSpacedRepetitionFact,
  correct: boolean,
  retrievability: number,
  difficulty: number,
  currentStreak: number,
): number {
  const currentStability = Math.max(fact.stabilityDays, GATHERING_MIN_STABILITY_DAYS);
  if (!correct) return clamp(currentStability * 0.42, GATHERING_MIN_STABILITY_DAYS, 7);

  const recallBonus = 1 + (1 - retrievability) * 0.85;
  const streakBonus = 1 + Math.min(currentStreak, 8) * 0.18;
  const difficultyBonus = 1 + (10 - difficulty) * 0.035;
  return clamp(
    currentStability * recallBonus * streakBonus * difficultyBonus + GATHERING_MIN_STABILITY_DAYS,
    GATHERING_MIN_STABILITY_DAYS,
    GATHERING_MAX_STABILITY_DAYS,
  );
}

function getGatheringReviewIntervalMs(stabilityDays: number, correct: boolean): number {
  if (!correct) return Math.round(GATHERING_MIN_STABILITY_DAYS * GATHERING_DAY_MS);
  return Math.round(stabilityDays * GATHERING_DAY_MS);
}

function createGatheringReportFact(
  fact: AlchemistGuildGatheringSpacedRepetitionFact,
  nowMs: number,
): GatheringSpacedRepetitionReportFact {
  const retrievability = getGatheringFactRetrievability(fact, nowMs);
  const status = getGatheringReportFactStatus(fact, retrievability, nowMs);

  return {
    accuracy: fact.attempts > 0 ? fact.correctCount / fact.attempts : 0,
    attempts: fact.attempts,
    difficulty: fact.difficulty,
    dueAtMs: fact.dueAtMs,
    factId: fact.id,
    label: `${fact.left} + ${fact.right}`,
    retrievability,
    stabilityDays: fact.stabilityDays,
    status,
    wrongCount: fact.wrongCount,
  };
}

function getGatheringReportFactStatus(
  fact: AlchemistGuildGatheringSpacedRepetitionFact,
  retrievability: number,
  nowMs: number,
): GatheringSpacedRepetitionReportFact["status"] {
  if (fact.attempts === 0) return "new";
  if (fact.dueAtMs <= nowMs) return "due";
  if (fact.attempts < 3 || retrievability < 0.75 || fact.wrongCount > fact.correctCount) {
    return "learning";
  }
  return "review";
}

function compareGatheringReportFacts(
  left: GatheringSpacedRepetitionReportFact,
  right: GatheringSpacedRepetitionReportFact,
): number {
  return (
    getGatheringReportStatusRank(right.status) - getGatheringReportStatusRank(left.status) ||
    right.difficulty - left.difficulty ||
    left.factId.localeCompare(right.factId)
  );
}

function compareGatheringAttentionFacts(
  left: GatheringSpacedRepetitionReportFact,
  right: GatheringSpacedRepetitionReportFact,
): number {
  return (
    right.wrongCount - left.wrongCount ||
    right.difficulty - left.difficulty ||
    left.retrievability - right.retrievability ||
    left.factId.localeCompare(right.factId)
  );
}

function getGatheringReportStatusRank(
  status: GatheringSpacedRepetitionReportFact["status"],
): number {
  switch (status) {
    case "due":
      return 3;
    case "learning":
      return 2;
    case "review":
      return 1;
    default:
      return 0;
  }
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
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
  excludedCardIds: ReadonlySet<string>;
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
    if (input.excludedCardIds.has(cardId)) continue;

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

function createSelectedQuestPrimitiveDemandScores(
  context?: GatheringRewardContext,
): Map<string, number> {
  if (!context) return new Map();

  const quest = getAlchemyQuestById(context.selectedQuestId);
  if (!quest) return new Map();

  const completedQuestIds = getEffectivelyCompletedQuestIds(context);
  if (completedQuestIds.has(quest.id)) return new Map();
  if (!areQuestPrerequisitesMet(quest, completedQuestIds)) return new Map();

  const demandScores = new Map<string, number>();
  const resourceCounts = createBoardResourceCounts(context);
  for (const outputCardId of getQuestPrimitiveDemandRootCardIds(quest)) {
    addPrimitiveDemandForCard({
      cardId: outputCardId,
      demandScores,
      quantity: 1,
      resourceCounts,
      stack: new Set(),
      weight: 1,
    });
  }

  return demandScores;
}

function getOrderedDemandCardIds(
  demandScores: ReadonlyMap<string, number>,
): AlchemistGuildCardId[] {
  return [...demandScores.entries()]
    .toSorted((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([cardId]) => AlchemistGuildCardIdSchema.parse(cardId));
}

function advanceTargetDropChances(
  previous: Readonly<AlchemistGuildGatheringTargetDropChances>,
  targetCardIds: readonly AlchemistGuildCardId[],
): AlchemistGuildGatheringTargetDropChances {
  if (targetCardIds.length === 0) return { ...previous };

  const next: AlchemistGuildGatheringTargetDropChances = { ...previous };
  for (const cardId of targetCardIds) {
    const currentChance = previous[cardId] ?? GATHERING_TARGET_DROP_BASE_BPS;
    next[cardId] = Math.min(
      GATHERING_TARGET_DROP_MAX_BPS,
      currentChance + GATHERING_TARGET_DROP_STEP_BPS,
    );
  }
  return next;
}

function selectTargetDropHits(
  round: number,
  targetCardIds: readonly AlchemistGuildCardId[],
  targetDropChances: Readonly<AlchemistGuildGatheringTargetDropChances>,
): AlchemistGuildCardId[] {
  const hits: AlchemistGuildCardId[] = [];
  for (const [targetIndex, cardId] of targetCardIds.entries()) {
    if (hits.length >= GATHERING_REWARD_OPTION_COUNT) break;

    const chanceBps = targetDropChances[cardId] ?? GATHERING_TARGET_DROP_BASE_BPS;
    if (getDeterministicCardUnit(round, targetIndex, cardId) * 10_000 < chanceBps) {
      hits.push(cardId);
    }
  }
  return hits;
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
    for (const outputCardId of getQuestPrimitiveDemandRootCardIds(quest)) {
      addPrimitiveDemandForCard({
        cardId: outputCardId,
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

function getQuestPrimitiveDemandRootCardIds(quest: StaticAlchemyQuest): string[] {
  const recipes = quest.recipeIds.flatMap((recipeId) => {
    const recipe = getAlchemyRecipeById(recipeId);
    return recipe ? [recipe] : [];
  });
  if (recipes.length === 0) return [];

  const consumedCardIds = new Set<string>(
    recipes.flatMap((recipe) => recipe.arguments.map((argument) => argument.cardId)),
  );
  const terminalRecipes = recipes.filter((recipe) => !consumedCardIds.has(recipe.output.cardId));
  const roots = terminalRecipes.length === 1 ? terminalRecipes : recipes;

  return roots.map((recipe) => recipe.output.cardId);
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
    const quest = getAlchemyQuestById(questId);
    if (quest && isQuestDeliveryComplete(quest, delivery)) completedQuestIds.add(questId);
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

function getDeterministicCardUnit(round: number, targetIndex: number, cardId: string): number {
  let hash = 2_166_136_261;
  for (const character of cardId) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16_777_619);
  }

  const value =
    Math.sin(round * 12.9898 + targetIndex * 78.233 + (hash >>> 0) * 0.000_001 + 91.317) *
    43_758.5453;
  return value - Math.floor(value);
}
