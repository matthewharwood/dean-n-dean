import { AlchemistGuildGatheringStreakSchema } from "@dean-stack/schemas";
import { animate } from "animejs";
import { useEffect, useLayoutEffect, useRef } from "react";
import * as z from "zod";

import { defineComponent } from "~/lib/define-component";
import { useAnime } from "~/motion/use-anime";
import { gatheringStreakMeterProgress, gatheringStreakRarityStyle } from "./gathering-streak-style";

// The persistent streak meter that lives above the equation. It is a thin reader
// of gathering.streak: the big number is the live streak, the bar fills toward the
// next rarity tier, and the rarity tint/glow climb with it. Three motions, all
// PixiJS/anime.js side-channel rules honored (animation only in effects, never in
// render) and all short-circuited under prefers-reduced-motion:
//   - idle: a slow breathing pulse on the whole panel (it's "alive")
//   - tick-up: a scale pop on the number when a correct answer lands
//   - shatter: a shake + desaturate + flung shards when the streak breaks
// The change signals are the reducer-stamped timestamps lastIncrementAtMs /
// lastBrokenAtMs (a break only stamps when there was a streak to lose), so the
// meter reacts to exactly the right beats without diffing the number itself.

const PRM = "(prefers-reduced-motion: reduce)";
const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(PRM).matches;
}

const SHARD_IDS = ["a", "b", "c", "d", "e", "f"] as const;
const SHARD_COUNT = SHARD_IDS.length;

const GatheringStreakMeterPropsSchema = z.object({
  streak: AlchemistGuildGatheringStreakSchema,
});

export const GatheringStreakMeter = defineComponent(
  GatheringStreakMeterPropsSchema,
  ({ streak }) => {
    const { current, lastBrokenAtMs, lastIncrementAtMs, longest } = streak;
    const progress = gatheringStreakMeterProgress(current);
    const style = gatheringStreakRarityStyle(progress.rarity);
    const nextStyle = progress.next ? gatheringStreakRarityStyle(progress.next.rarity) : style;
    const fillPercent = Math.round(progress.fraction * 100);

    const panelRef = useRef<HTMLDivElement | null>(null);
    const numberRef = useRef<HTMLSpanElement | null>(null);
    const shardLayerRef = useRef<HTMLDivElement | null>(null);
    const previousIncrementRef = useRef(lastIncrementAtMs);
    const previousBrokenRef = useRef(lastBrokenAtMs);

    // Idle "alive" breathing on the whole meter. useAnime owns the loop + cleanup
    // and short-circuits under reduced motion, so the static frame is the
    // reduced-motion experience by construction.
    useAnime(
      panelRef,
      { alternate: true, duration: 2800, ease: "inOut(2)", loop: true, scale: [1, 1.02, 1] },
      [],
    );

    // Tick-up pop when a correct answer advances the streak.
    useBrowserLayoutEffect(() => {
      if (lastIncrementAtMs === previousIncrementRef.current) return;
      previousIncrementRef.current = lastIncrementAtMs;
      const numberElement = numberRef.current;
      if (!numberElement || prefersReducedMotion()) return;
      numberElement.style.willChange = "transform";
      const tick = animate(numberElement, {
        duration: 460,
        ease: "out(3)",
        rotate: [0, -5, 4, 0],
        scale: [1, 1.5, 1],
        onComplete: () => numberElement.style.removeProperty("will-change"),
      });
      return () => {
        tick.cancel();
      };
    }, [lastIncrementAtMs]);

    // Shatter when the streak breaks (a wrong answer that cost a real streak).
    useBrowserLayoutEffect(() => {
      if (lastBrokenAtMs === previousBrokenRef.current) return;
      previousBrokenRef.current = lastBrokenAtMs;
      const panelElement = panelRef.current;
      const numberElement = numberRef.current;
      const shardLayer = shardLayerRef.current;
      if (!panelElement || !numberElement || prefersReducedMotion()) return;

      numberElement.style.willChange = "transform, filter";
      // The number survives but takes a violent, desaturating hit then recovers
      // (by which point the streak already reads 0); the shards carry the "broke
      // apart" beat.
      const numberAnimation = animate(numberElement, {
        duration: 640,
        ease: "out(2)",
        filter: [
          "saturate(1) brightness(1)",
          "saturate(0.2) brightness(1.5)",
          "saturate(1) brightness(1)",
        ],
        rotate: [0, -10, 9, -5, 0],
        scale: [1, 1.25, 0.78, 1.05, 1],
        onComplete: () => numberElement.style.removeProperty("will-change"),
      });
      const panelAnimation = animate(panelElement, {
        duration: 420,
        ease: "out(2)",
        x: [0, -7, 6, -4, 0],
      });
      const shards = shardLayer ? Array.from(shardLayer.children) : [];
      const shardAnimations = shards.map((shard, index) => {
        const angle = (index / SHARD_COUNT) * Math.PI * 2;
        const distance = 38 + Math.random() * 34;
        return animate(shard, {
          duration: 600,
          ease: "out(3)",
          opacity: [0, 1, 0],
          rotate: [0, (Math.random() - 0.5) * 240],
          scale: [0.5, 1.1, 0.35],
          x: [0, Math.cos(angle) * distance],
          y: [0, Math.sin(angle) * distance],
        });
      });

      return () => {
        numberAnimation.cancel();
        panelAnimation.cancel();
        for (const shardAnimation of shardAnimations) shardAnimation.cancel();
      };
    }, [lastBrokenAtMs]);

    return (
      <div
        ref={panelRef}
        data-board-section="gathering-streak-meter"
        data-gathering-streak-current={current}
        data-gathering-streak-rarity={progress.rarity}
        className={`relative mx-auto flex w-full max-w-[24rem] items-center gap-3 rounded-[12px] bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-3 ring-2 ${style.ring}`}
      >
        <div className="relative grid shrink-0 place-items-center">
          <span className="text-[10px] font-black uppercase leading-none tracking-wide text-white/55">
            Streak
          </span>
          <span
            ref={numberRef}
            data-board-section="gathering-streak-number"
            className={`mt-0.5 text-5xl font-black leading-none tabular-nums ${style.number} ${style.glow}`}
          >
            {current}
          </span>
          <div
            ref={shardLayerRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 grid place-items-center"
          >
            {SHARD_IDS.map((shardId) => (
              <span
                key={shardId}
                className={`absolute size-2 rounded-[2px] opacity-0 ${style.pip}`}
              />
            ))}
          </div>
        </div>

        <div className="grid flex-1 gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase leading-none ${style.badgeBg} ${style.badgeText}`}
            >
              {style.label}
            </span>
            <span className="text-[10px] font-black uppercase leading-none text-white/45">
              best {longest}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/12">
            <div
              data-board-section="gathering-streak-fill"
              className={`h-full rounded-full transition-[width] duration-300 ${style.pip}`}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
          <span className="text-[10px] font-black uppercase leading-none text-white/55">
            {progress.next ? (
              <>
                <span className="tabular-nums text-white/80">{progress.remaining}</span> to{" "}
                <span className={nextStyle.number}>{nextStyle.label}</span>
              </>
            ) : (
              "Max streak — flawless"
            )}
          </span>
        </div>
      </div>
    );
  },
);
