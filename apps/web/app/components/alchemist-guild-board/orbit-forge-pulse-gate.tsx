import { useEffect, useRef, useState } from "react";
import * as z from "zod";

import { defineComponent } from "~/lib/define-component";
import {
  classifyForgeTapByTime,
  type ForgeTapTier,
  ForgeTapTierSchema,
} from "./orbit-forge-scoring";

// The reduced-motion fallback for Orbit Forge — a REAL, fair timing game, not a
// stub. The target charges through discrete COLOR STATES on setTimeout swaps
// (grey → amber → green "GO"); the kid taps during green. Judged by TIME error
// from the green-core center (PERFECT ≤70ms…), so it has the same 8-beat payoff
// and rarity math as the moving-comet game. No requestAnimationFrame, no orbit —
// nothing depends on per-frame motion, which is the whole point under
// prefers-reduced-motion.

type PulsePhase = "rest" | "charge" | "ready" | "spent";

const PULSE_PHASE_CLASS: Record<PulsePhase, string> = {
  rest: "bg-slate-700 ring-slate-500/50",
  charge: "bg-amber-500 ring-amber-300/70",
  ready: "bg-emerald-400 ring-emerald-200",
  spent: "bg-slate-800 ring-slate-600/40",
};

const PULSE_PHASE_LABEL: Record<PulsePhase, string> = {
  rest: "",
  charge: "Get ready",
  ready: "Tap!",
  spent: "",
};

const PULSE_GEM_CLASS: Record<ForgeTapTier, string> = {
  perfect: "bg-amber-200",
  great: "bg-violet-400",
  good: "bg-sky-400",
  graze: "bg-stone-500",
};

function pulseGemClass(tier: ForgeTapTier | undefined): string {
  return tier ? PULSE_GEM_CLASS[tier] : "border-2 border-white/30";
}

// `key={beatId}` from the overlay remounts this per beat (the project pattern for
// a trigger-only restart), so the effect just runs on mount — no opaque trigger
// dep to suppress.
const OrbitForgePulseGatePropsSchema = z.object({
  active: z.boolean(),
  assist: z.boolean(),
  gemTiers: z.array(ForgeTapTierSchema),
  onTap: z.custom<(detail: { tier: ForgeTapTier; deltaMs: number }) => void>(),
  pulseDurationMs: z.number().positive(),
  socketCount: z.int().min(2).max(5),
});

export const OrbitForgePulseGate = defineComponent(
  OrbitForgePulseGatePropsSchema,
  ({ active, assist, gemTiers, onTap, pulseDurationMs, socketCount }) => {
    const [phase, setPhase] = useState<PulsePhase>("rest");
    const greenCenterRef = useRef(0);
    const tappedRef = useRef(false);
    const onTapRef = useRef(onTap);

    useEffect(() => {
      onTapRef.current = onTap;
    });

    useEffect(() => {
      if (!active) {
        setPhase("rest");
        return;
      }
      tappedRef.current = false;
      setPhase("rest");

      const chargeAt = pulseDurationMs * 0.4;
      const readyAt = pulseDurationMs * 0.72;
      const readyWindowMs = pulseDurationMs * 0.18;
      // Use the same monotonic clock the tap reads, so the time error is honest.
      greenCenterRef.current = performance.now() + readyAt + readyWindowMs / 2;

      const charge = setTimeout(() => setPhase("charge"), chargeAt);
      const ready = setTimeout(() => setPhase("ready"), readyAt);
      const close = setTimeout(
        () => {
          setPhase("spent");
          if (!tappedRef.current) {
            tappedRef.current = true;
            onTapRef.current({ deltaMs: Number.POSITIVE_INFINITY, tier: "graze" });
          }
        },
        readyAt + readyWindowMs + 140,
      );

      return () => {
        clearTimeout(charge);
        clearTimeout(ready);
        clearTimeout(close);
      };
    }, [active, pulseDurationMs]);

    const handleTap = () => {
      if (!active || tappedRef.current || phase === "rest") return;
      tappedRef.current = true;
      const deltaMs = performance.now() - greenCenterRef.current;
      const tier = classifyForgeTapByTime(deltaMs, assist);
      onTapRef.current({ deltaMs, tier });
    };

    return (
      <div
        data-board-section="orbit-forge-pulse-gate"
        className="grid w-[26rem] max-w-full place-items-center gap-4 p-4"
      >
        <button
          type="button"
          data-board-section="orbit-forge-pulse-target"
          data-pulse-phase={phase}
          aria-label="Tap when the core turns green"
          className={`grid size-56 place-items-center rounded-full text-center text-sm font-black uppercase leading-tight text-white/90 ring-8 transition-colors duration-100 ${PULSE_PHASE_CLASS[phase]}`}
          onPointerDown={handleTap}
        >
          {PULSE_PHASE_LABEL[phase]}
        </button>
        <div className="flex gap-2">
          {Array.from({ length: socketCount }, (_, index) => `pulse-socket-${index}`).map(
            (socketId, index) => {
              const tier = gemTiers[index];
              return (
                <span
                  key={socketId}
                  data-pulse-gem={tier ?? "empty"}
                  className={`size-4 rounded-full ${pulseGemClass(tier)}`}
                />
              );
            },
          )}
        </div>
      </div>
    );
  },
);
