import type {
  AlchemistGuildGatheringBossState,
  AlchemistGuildGatheringPhonicsChoice,
  AlchemistGuildGatheringState,
} from "@dean-stack/schemas";
import * as z from "zod";

import { defineComponent } from "~/lib/define-component";

import {
  GATHERING_BOSS_ALLOWED_MISSES,
  GATHERING_BOSS_PROBLEM_DURATION_MS,
} from "./gathering-loop";
import { GatheringStreakMeter } from "./gathering-streak-meter";

// Phonics "listen & match" UI. Audio is a side channel played from event handlers
// (never render), matching the quest/character voice pattern. A missing clip fails
// silently, so placeholder audio never breaks the surface.

function resolvePublicAssetPath(path: string): string {
  const baseUrl = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${baseUrl}${path}`;
}

function playPhonicsClip(path: string): void {
  const audio = new Audio(resolvePublicAssetPath(path));
  void audio.play().catch(() => undefined);
}

// ---- Primary panel: the vowel-sound prompt + play/hint buttons ----

const GatheringPhonicsPromptPanelPropsSchema = z.object({
  gathering: z.custom<AlchemistGuildGatheringState>(),
  status: z.string(),
});

export const GatheringPhonicsPromptPanel = defineComponent(
  GatheringPhonicsPromptPanelPropsSchema,
  ({ gathering, status }) => {
    const prompt = gathering.phonicsPrompt;
    // The hint (a teaching phrase with an example word) only appears once the kid
    // has missed the question a couple of times, so it stays a genuine help.
    const showHint = gathering.wrongAnswerStreak >= 2;
    return (
      <div className="pointer-events-auto grid h-full min-h-0 place-items-center p-6">
        <div className="grid w-full max-w-[40rem] gap-5 text-center">
          <GatheringStreakMeter streak={gathering.streak} />
          {prompt ? (
            <div className="grid gap-4">
              <h2 className="font-black uppercase leading-[0.95] tracking-tight text-fuchsia-900">
                <span className="block text-lg sm:text-xl">Listen for the</span>
                <span className="block py-1 font-serif text-5xl leading-none text-teal-600 sm:text-6xl">
                  {prompt.targetLabel}
                </span>
                <span className="block text-lg sm:text-xl">sound</span>
              </h2>
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  data-board-section="gathering-phonics-play-prompt"
                  aria-label={`Play the ${prompt.targetLabel} sound`}
                  onClick={() => playPhonicsClip(prompt.promptVoiceClipPath)}
                  className="grid size-16 place-items-center rounded-full border-2 border-fuchsia-500/70 bg-fuchsia-50 text-3xl shadow-[0_8px_18px_rgba(112,26,117,0.20)] transition-transform duration-150 hover:-translate-y-0.5 active:scale-95"
                >
                  <span aria-hidden="true">🔊</span>
                </button>
                {showHint ? (
                  <button
                    type="button"
                    data-board-section="gathering-phonics-hint"
                    aria-label="Hear a hint"
                    onClick={() => playPhonicsClip(prompt.hintVoiceClipPath)}
                    className="grid size-16 place-items-center rounded-full border-2 border-amber-500/70 bg-amber-50 text-3xl shadow-[0_8px_18px_rgba(180,120,0,0.20)] transition-transform duration-150 hover:-translate-y-0.5 active:scale-95"
                  >
                    <span aria-hidden="true">💡</span>
                  </button>
                ) : null}
              </div>
              <p className="text-[11px] font-black uppercase leading-none text-neutral-500">
                Tap 🔊 to hear the sound{showHint ? " — or 💡 for a hint" : ""}
              </p>
            </div>
          ) : null}
          <div className="mx-auto grid w-full max-w-[24rem] gap-2">
            <div className="flex items-center justify-between gap-3 rounded-[6px] border border-neutral-900/10 bg-white/65 px-3 py-2 text-xs font-black uppercase leading-none text-neutral-800">
              <span>Round {gathering.round}</span>
              <span>Word {gathering.equationIndex}</span>
            </div>
            <p className="rounded-[6px] border border-neutral-900/10 bg-white/65 px-3 py-2 text-sm font-bold leading-snug text-neutral-900">
              {status}
            </p>
          </div>
        </div>
      </div>
    );
  },
);

// ---- A single word card: tap the word to answer, tap the speaker to hear it ----

const GatheringPhonicsWordCardPropsSchema = z.object({
  choice: z.custom<AlchemistGuildGatheringPhonicsChoice>(),
  onPick: z.custom<(factId: string) => void>(),
  tone: z.enum(["idle", "wrong"]),
});

const GatheringPhonicsWordCard = defineComponent(
  GatheringPhonicsWordCardPropsSchema,
  ({ choice, onPick, tone }) => (
    <div className="relative h-full min-h-0">
      <button
        type="button"
        data-gathering-phonics-word={choice.word}
        onClick={() => onPick(choice.factId)}
        className={`grid size-full min-h-[72px] place-items-center break-words rounded-[8px] border-2 bg-white px-1 pt-5 text-center text-xl font-black lowercase leading-tight shadow-[0_6px_14px_rgba(15,23,42,0.10)] transition-transform duration-150 hover:-translate-y-0.5 sm:text-2xl ${
          tone === "wrong"
            ? "border-rose-500 text-rose-700 ring-2 ring-rose-300"
            : "border-neutral-800/55 text-neutral-950"
        }`}
      >
        {choice.word}
      </button>
      <button
        type="button"
        aria-label={`Hear ${choice.word}`}
        data-gathering-phonics-word-play={choice.word}
        onClick={() => playPhonicsClip(choice.voiceClipPath)}
        className="absolute right-1 top-1 grid size-7 place-items-center rounded-full border border-neutral-900/15 bg-white/90 text-xs shadow-sm"
      >
        <span aria-hidden="true">🔊</span>
      </button>
    </div>
  ),
);

// ---- Secondary panel: the five word answer cards ----

const GatheringPhonicsCardsPanelPropsSchema = z.object({
  gathering: z.custom<AlchemistGuildGatheringState>(),
  onPickWord: z.custom<(factId: string) => void>(),
});

export const GatheringPhonicsCardsPanel = defineComponent(
  GatheringPhonicsCardsPanelPropsSchema,
  ({ gathering, onPickWord }) => {
    const prompt = gathering.phonicsPrompt;
    if (!prompt) return null;

    return (
      <div className="pointer-events-auto col-span-full grid h-full content-center overflow-hidden p-3">
        <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-3">
          {prompt.choices.map((choice) => (
            <GatheringPhonicsWordCard
              key={choice.factId}
              choice={choice}
              onPick={onPickWord}
              tone={
                gathering.lastAnswerCorrect === false && prompt.selectedFactId === choice.factId
                  ? "wrong"
                  : "idle"
              }
            />
          ))}
        </div>
      </div>
    );
  },
);

// ---- Boss phonics: the timed prompt + word answers ----

function getBossRemainingMs(boss: AlchemistGuildGatheringBossState, nowMs: number): number {
  if (boss.problemEndsAtMs === null) return 0;
  return Math.max(0, boss.problemEndsAtMs - nowMs);
}

const GatheringPhonicsBossPanelPropsSchema = z.object({
  boss: z.custom<AlchemistGuildGatheringBossState>(),
  nowMs: z.number().min(0),
});

export const GatheringPhonicsBossPanel = defineComponent(
  GatheringPhonicsBossPanelPropsSchema,
  ({ boss, nowMs }) => {
    const prompt = boss.phonicsPrompt;
    const remainingMs = getBossRemainingMs(boss, nowMs);
    const timerPercent = Math.round((remainingMs / GATHERING_BOSS_PROBLEM_DURATION_MS) * 100);
    return (
      <div className="pointer-events-auto grid h-full min-h-0 place-items-center p-6">
        <article className="grid w-full max-w-[34rem] gap-5 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-black uppercase leading-none text-neutral-800">
            <span className="rounded-[6px] border border-neutral-900/10 bg-white/65 p-2">
              Problem {boss.problemIndex}
            </span>
            <span className="rounded-[6px] border border-neutral-900/10 bg-white/65 p-2">
              Misses {boss.misses}/{GATHERING_BOSS_ALLOWED_MISSES}
            </span>
          </div>
          {prompt ? (
            <div className="grid gap-3">
              <p className="text-xs font-black uppercase leading-none text-fuchsia-900">
                Level {boss.level} phonics — find the {prompt.targetLabel} word
              </p>
              <button
                type="button"
                data-board-section="gathering-phonics-boss-play"
                onClick={() => playPhonicsClip(prompt.promptVoiceClipPath)}
                className="mx-auto grid place-items-center gap-1 rounded-[12px] border-2 border-fuchsia-500/60 bg-fuchsia-50 px-8 py-5 shadow-[0_10px_22px_rgba(112,26,117,0.18)]"
              >
                <span aria-hidden="true" className="text-4xl leading-none">
                  🔊
                </span>
                <span className="text-sm font-black uppercase text-fuchsia-900">Play sound</span>
              </button>
            </div>
          ) : null}
          <div className="grid gap-2">
            <div className="h-5 overflow-hidden rounded-full border border-neutral-950/20 bg-neutral-200">
              <span
                className="gathering-boss-timer-fill block h-full rounded-full bg-emerald-500"
                style={{ width: `${timerPercent}%` }}
              />
            </div>
            <p className="font-mono text-lg font-black leading-none text-neutral-950">
              {(remainingMs / 1000).toFixed(1)}s
            </p>
          </div>
        </article>
      </div>
    );
  },
);

const GatheringPhonicsBossAnswerPanelPropsSchema = z.object({
  boss: z.custom<AlchemistGuildGatheringBossState>(),
  onAnswer: z.custom<(factId: string) => void>(),
});

export const GatheringPhonicsBossAnswerPanel = defineComponent(
  GatheringPhonicsBossAnswerPanelPropsSchema,
  ({ boss, onAnswer }) => {
    const prompt = boss.phonicsPrompt;
    if (!prompt) return null;
    return (
      <div className="pointer-events-auto col-span-full grid h-full content-center gap-2 overflow-hidden p-3">
        <p className="text-center text-xs font-black uppercase leading-none text-neutral-700">
          Tap the matching word
        </p>
        <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-3">
          {prompt.choices.map((choice) => (
            <GatheringPhonicsWordCard
              key={choice.factId}
              choice={choice}
              onPick={onAnswer}
              tone="idle"
            />
          ))}
        </div>
      </div>
    );
  },
);
