import { useEffect, useReducer, useRef, useState } from "react";
import * as z from "zod";

import { defineComponent } from "~/lib/define-component";
import { sfx } from "~/sound/sfx";
import { getEmergentRecipeRarity } from "./emergent-recipes";
import { OrbitForgePulseGate } from "./orbit-forge-pulse-gate";
import { OrbitForgeRing } from "./orbit-forge-ring";
import {
  applyForgeSafetyRetap,
  FORGE_HITS_TOTAL,
  FORGE_TAP_SPEEDS_DEG_PER_SEC,
  type ForgeRoundResult,
  type ForgeTapTier,
  resolveForgeRound,
} from "./orbit-forge-scoring";

// Orbit Forge — the full-screen ceremony. Blur takeover → 2s countdown (the comet
// does a demo lap so the rhythm is pre-taught) → 8 taps → a brief reveal that
// hands the ForgeRoundResult back to the craft. Picks the moving-comet ring or
// the reduced-motion Pulse Gate; both report the same {tier} so the round logic
// is identical. Round state is ephemeral (a transient modal) — the workbench
// ingredients stay in IDB untouched until the craft commits, so a reload simply
// drops the kid back to the workbench with nothing lost.

const PRM = "(prefers-reduced-motion: reduce)";
function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(PRM).matches;
}

const PULSE_MAX_MS = 2000;
const PULSE_MIN_MS = 900;

type ForgePhase = "countdown" | "playing" | "revealed";

type ForgeRoundState = {
  beat: number;
  beatId: number;
  comboPerfect: number;
  phase: ForgePhase;
  safetyUsed: boolean;
  tiers: ForgeTapTier[];
};

type ForgeAction = { type: "start" } | { tier: ForgeTapTier; type: "tap" };

const INITIAL_STATE: ForgeRoundState = {
  beat: 0,
  beatId: 0,
  comboPerfect: 0,
  phase: "countdown",
  safetyUsed: false,
  tiers: [],
};

function forgeReducer(state: ForgeRoundState, action: ForgeAction): ForgeRoundState {
  if (action.type === "start") {
    return { ...state, beat: 0, phase: "playing" };
  }
  if (state.phase !== "playing" || state.tiers.length >= FORGE_HITS_TOTAL) return state;
  const { safetyUsed, tier } = applyForgeSafetyRetap(action.tier, state.safetyUsed);
  const tiers = [...state.tiers, tier];
  const done = tiers.length >= FORGE_HITS_TOTAL;
  return {
    beat: tiers.length,
    beatId: state.beatId + 1,
    comboPerfect: tier === "perfect" ? state.comboPerfect + 1 : 0,
    phase: done ? "revealed" : "playing",
    safetyUsed,
    tiers,
  };
}

function headerCopy(phase: ForgePhase, taps: number): string {
  if (phase === "countdown") return "Forge the runes, apprentice.";
  if (phase === "playing") return `Tap ${taps}/${FORGE_HITS_TOTAL}`;
  return "Forged.";
}

function rarityLine(result: ForgeRoundResult): { label: string; line: string } {
  if (!result.success) return { label: "Unstable", line: "The runes scattered — try again." };
  const rarity = getEmergentRecipeRarity(result.syllableIndexes);
  const lines: Record<string, string> = {
    common: "A humble brew, but yours.",
    uncommon: "A tidy little working.",
    rare: "The runes held true.",
    epic: "Beautifully struck!",
    legendary: "The forge roared — LEGENDARY!",
    mythical: "The runes SANG — MYTHICAL!",
  };
  return { label: rarity.toUpperCase(), line: lines[rarity] ?? "Forged." };
}

const OrbitForgeOverlayPropsSchema = z.object({
  assist: z.boolean(),
  ingredientCardIds: z.array(z.string().min(1)).min(2).max(5),
  onComplete: z.custom<(result: ForgeRoundResult) => void>(),
});

export const OrbitForgeOverlay = defineComponent(
  OrbitForgeOverlayPropsSchema,
  ({ assist, ingredientCardIds, onComplete }) => {
    const socketCount = ingredientCardIds.length;
    // Lazy-init: read the media query once, not on every render.
    const reducedMotionRef = useRef<boolean | null>(null);
    if (reducedMotionRef.current === null) reducedMotionRef.current = prefersReducedMotion();
    const reducedMotion = reducedMotionRef.current;
    const [state, dispatch] = useReducer(forgeReducer, INITIAL_STATE);
    const [count, setCount] = useState(3);
    const onCompleteRef = useRef(onComplete);

    useEffect(() => {
      onCompleteRef.current = onComplete;
    });

    // 2-second countdown ritual → begin.
    useEffect(() => {
      const toTwo = setTimeout(() => setCount(2), 650);
      const toOne = setTimeout(() => setCount(1), 1300);
      const begin = setTimeout(() => dispatch({ type: "start" }), 1950);
      return () => {
        clearTimeout(toTwo);
        clearTimeout(toOne);
        clearTimeout(begin);
      };
    }, []);

    // Reveal → hand the result back to the craft.
    useEffect(() => {
      if (state.phase !== "revealed") return;
      const result = resolveForgeRound(state.tiers, socketCount);
      void sfx.play(result.success ? "transmute.complete" : "transmute.failed");
      const handoff = setTimeout(() => onCompleteRef.current(result), reducedMotion ? 750 : 1500);
      return () => clearTimeout(handoff);
    }, [state.phase, state.tiers, socketCount, reducedMotion]);

    const handleTap = (tier: ForgeTapTier) => {
      if (state.phase !== "playing") return;
      if (tier === "graze") {
        void sfx.play("card.drop");
      } else {
        const nextCombo = tier === "perfect" ? state.comboPerfect + 1 : 0;
        void sfx.play("gathering.streak.increment", {
          detuneCents: Math.min(1200, nextCombo * 130),
        });
      }
      dispatch({ tier, type: "tap" });
    };

    const beatIndex = Math.min(state.beat, FORGE_HITS_TOTAL - 1);
    const pulseDurationMs =
      PULSE_MAX_MS - ((PULSE_MAX_MS - PULSE_MIN_MS) * beatIndex) / (FORGE_HITS_TOTAL - 1);
    const reveal =
      state.phase === "revealed" ? rarityLine(resolveForgeRound(state.tiers, socketCount)) : null;

    return (
      <div
        data-board-section="orbit-forge-overlay"
        className={`fixed inset-0 z-[120] grid place-items-center bg-slate-950/70 p-4 backdrop-blur-md ${
          reducedMotion ? "" : "motion-safe:animate-[orbit-forge-takeover_280ms_ease-out]"
        }`}
      >
        <div className="grid w-full max-w-[30rem] justify-items-center gap-3 rounded-[16px] border border-amber-300/30 bg-slate-900/85 p-5 text-center shadow-[0_28px_70px_rgba(0,0,0,0.5)]">
          <header className="grid gap-0.5">
            <h2 className="text-sm font-black uppercase tracking-wide text-amber-200">
              Orbit Forge
            </h2>
            <p className="text-[11px] font-bold text-white/55">
              {headerCopy(state.phase, state.tiers.length)}
            </p>
          </header>

          <div className="relative grid place-items-center">
            {reducedMotion ? (
              <OrbitForgePulseGate
                key={state.beatId}
                active={state.phase === "playing"}
                assist={assist}
                gemTiers={state.tiers}
                onTap={(detail) => handleTap(detail.tier)}
                pulseDurationMs={pulseDurationMs}
                socketCount={socketCount}
              />
            ) : (
              <OrbitForgeRing
                assist={assist}
                debugFreezeAngleDeg={null}
                gemTiers={state.tiers}
                onTap={(detail) => handleTap(detail.tier)}
                paused={state.phase !== "playing"}
                socketCount={socketCount}
                speedDegPerSec={FORGE_TAP_SPEEDS_DEG_PER_SEC[beatIndex] ?? 120}
              />
            )}

            {state.phase === "countdown" ? (
              <div
                key={count}
                data-board-section="orbit-forge-countdown"
                className="pointer-events-none absolute grid size-24 place-items-center rounded-full bg-slate-950/70 text-5xl font-black text-amber-200"
              >
                {count}
              </div>
            ) : null}

            {reveal ? (
              <div
                data-board-section="orbit-forge-reveal"
                data-forge-rarity={reveal.label}
                className="pointer-events-none absolute grid place-items-center gap-1 rounded-[14px] bg-slate-950/80 px-6 py-4"
              >
                <span className="text-2xl font-black uppercase text-amber-200">{reveal.label}</span>
                <span className="max-w-[16rem] text-xs font-bold text-white/75">{reveal.line}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  },
);
