import { Graphics } from "pixi.js";
import { useEffect, useRef } from "react";
import * as z from "zod";

import { usePixiApp } from "~/canvas/use-pixi-app";
import { defineComponent } from "~/lib/define-component";
import {
  classifyForgeTapByDegrees,
  type ForgeTapTier,
  ForgeTapTierSchema,
} from "./orbit-forge-scoring";

// Orbit Forge — the Pixi canvas. A comet orbits a bullseye; tapping when it
// crosses the GATE at 12 o'clock is judged by ABSOLUTE ANGULAR ERROR (so judging
// is framerate-independent on a 120Hz iPad). A leading wind-up GLOW over the last
// 30deg telegraphs "NOW" a beat early, turning reflex-luck into learnable rhythm.
// PixiJS is a side channel (Pillar): all motion lives in the ticker; the React
// component stays pure and feeds props in via refs so the app inits once.

const DEG2RAD = Math.PI / 180;
const GATE_HALF_DEG = 22; // the visible amber gate arc half-width
const WIND_UP_DEG = 30; // comet brightens/scales over the final 30deg of approach

const TIER_COLOR: Record<ForgeTapTier, number> = {
  perfect: 0xfff4d6,
  great: 0xb78bf5,
  good: 0x6db3ff,
  graze: 0x8a7a66,
};

export type ForgeTapDetail = { tier: ForgeTapTier; deltaDeg: number };

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: number;
};

const OrbitForgeRingPropsSchema = z.object({
  assist: z.boolean(),
  // Test/story affordance: when non-null, the comet is frozen at this angle so a
  // tap scores deterministically (a moving-comet timing game is otherwise
  // impossible to assert band→tier on). null = normal orbit.
  debugFreezeAngleDeg: z.number().nullable(),
  gemTiers: z.array(ForgeTapTierSchema),
  onTap: z.custom<(detail: ForgeTapDetail) => void>(),
  paused: z.boolean(),
  socketCount: z.int().min(2).max(5),
  speedDegPerSec: z.number().positive(),
});

export const OrbitForgeRing = defineComponent(OrbitForgeRingPropsSchema, (props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  });

  usePixiApp(
    canvasRef,
    (app, { reducedMotion }) => {
      const gfx = new Graphics();
      app.stage.addChild(gfx);
      app.stage.eventMode = "static";
      app.stage.hitArea = app.screen;

      let angleDeg = 200; // start away from the gate so the first lap reads
      let comboPerfect = 0;
      let coreFlash = 0;
      let shakeAmp = 0;
      let gemPop = 0; // 0..1 pop progress for the most-recent gem
      let lastGemCount = propsRef.current.gemTiers.length;
      const particles: Particle[] = [];

      const geometry = () => {
        const w = app.screen.width;
        const h = app.screen.height;
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(w, h) * 0.4;
        return { cx, cy, radius };
      };

      const spawnBurst = (cx: number, cy: number, count: number, color: number) => {
        for (let i = 0; i < count; i += 1) {
          const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
          const speed = 0.12 + Math.random() * 0.22;
          particles.push({
            color,
            life: 1,
            maxLife: 380 + Math.random() * 280,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            x: cx,
            y: cy,
          });
        }
        if (particles.length > 90) particles.splice(0, particles.length - 90);
      };

      const handlePointerDown = () => {
        const live = propsRef.current;
        if (live.paused) return;
        const effectiveAngle =
          live.debugFreezeAngleDeg !== null
            ? ((live.debugFreezeAngleDeg % 360) + 360) % 360
            : angleDeg;
        const deltaDeg = effectiveAngle > 180 ? effectiveAngle - 360 : effectiveAngle;
        const tier = classifyForgeTapByDegrees(deltaDeg, live.assist);
        const { cx, cy } = geometry();

        if (tier === "perfect") {
          comboPerfect += 1;
          coreFlash = 1;
          shakeAmp = 2 + comboPerfect * 0.8;
          spawnBurst(cx, cy, Math.min(60, 8 + comboPerfect * 4), TIER_COLOR.perfect);
          if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
            navigator.vibrate(comboPerfect < 4 ? 15 : 30);
          }
        } else {
          comboPerfect = 0;
          if (tier === "great") {
            coreFlash = 0.7;
            shakeAmp = 2;
            spawnBurst(cx, cy, 8, TIER_COLOR.great);
          } else if (tier === "good") {
            coreFlash = 0.4;
            spawnBurst(cx, cy, 5, TIER_COLOR.good);
          } else {
            coreFlash = 0.18;
          }
        }
        gemPop = 0;
        live.onTap({ deltaDeg, tier });
      };
      app.stage.on("pointerdown", handlePointerDown);

      const draw = (deltaMS: number) => {
        const live = propsRef.current;
        // The comet ALWAYS orbits (so the countdown's demo lap reads); `paused`
        // only gates whether a tap SCORES — see handlePointerDown.
        if (live.debugFreezeAngleDeg !== null) {
          angleDeg = ((live.debugFreezeAngleDeg % 360) + 360) % 360;
        } else {
          angleDeg = (angleDeg + live.speedDegPerSec * (deltaMS / 1000)) % 360;
        }
        coreFlash = Math.max(0, coreFlash - deltaMS / 180);
        gemPop = Math.min(1, gemPop + deltaMS / 220);
        shakeAmp *= 0.86;
        if (shakeAmp < 0.05) shakeAmp = 0;

        if (live.gemTiers.length !== lastGemCount) {
          lastGemCount = live.gemTiers.length;
          gemPop = 0;
        }

        const { cx, cy, radius } = geometry();
        gfx.clear();

        // Track ring (the comet's orbit path).
        gfx.circle(cx, cy, radius).stroke({ color: 0x3a4a5e, width: 6, alpha: 0.85 });

        // Gate: amber arc on the track + a bright white centerline up to 12 o'clock.
        gfx
          .arc(cx, cy, radius, (-GATE_HALF_DEG - 90) * DEG2RAD, (GATE_HALF_DEG - 90) * DEG2RAD)
          .stroke({ color: 0xf2b24c, width: 14, alpha: 0.5 });
        gfx
          .moveTo(cx, cy)
          .lineTo(cx, cy - radius)
          .stroke({ color: 0xfff4d6, width: 2, alpha: 0.9 });

        // Bullseye: good band + the perfect core (flashes white on a perfect hit).
        gfx.circle(cx, cy, radius * 0.34).fill({ color: 0x223043, alpha: 0.92 });
        gfx.circle(cx, cy, radius * 0.34).stroke({ color: 0x3a4a5e, width: 3 });
        const coreColor = coreFlash > 0.05 ? 0xffffff : 0xfff4d6;
        gfx
          .circle(cx, cy, radius * 0.12)
          .fill({ alpha: 0.85 + coreFlash * 0.15, color: coreColor });

        // Gem sockets around the core — fill with a tier-colored gem on each tap.
        const sockets = live.socketCount;
        for (let i = 0; i < sockets; i += 1) {
          const a = (-90 + (i / sockets) * 360) * DEG2RAD;
          const gx = cx + Math.cos(a) * radius * 0.62;
          const gy = cy + Math.sin(a) * radius * 0.62;
          const tier = live.gemTiers[i];
          const isNewest = i === live.gemTiers.length - 1;
          const pop = isNewest ? 1 + (1 - Math.abs(gemPop - 0.5) * 2) * 0.6 : 1;
          if (tier) {
            gfx.circle(gx, gy, radius * 0.05 * pop).fill({ color: TIER_COLOR[tier] });
            gfx
              .circle(gx, gy, radius * 0.05 * pop)
              .stroke({ color: 0xffffff, width: 1.5, alpha: 0.7 });
          } else {
            gfx.circle(gx, gy, radius * 0.045).stroke({ alpha: 0.5, color: 0x55657a, width: 2 });
          }
        }

        // Comet on the track, with the leading wind-up glow over the last 30deg.
        const approach =
          angleDeg > 360 - WIND_UP_DEG ? (angleDeg - (360 - WIND_UP_DEG)) / WIND_UP_DEG : 0;
        const cometScale = 1 + approach * 0.4;
        const rad = (angleDeg - 90) * DEG2RAD;
        const hx = cx + Math.cos(rad) * radius;
        const hy = cy + Math.sin(rad) * radius;
        // tail
        for (let t = 1; t <= 3; t += 1) {
          const tr = (angleDeg - 90 - t * 7) * DEG2RAD;
          gfx
            .circle(cx + Math.cos(tr) * radius, cy + Math.sin(tr) * radius, 10 - t * 2.4)
            .fill({ alpha: 0.28 - t * 0.06, color: 0xffe9a8 });
        }
        gfx.circle(hx, hy, 18 * cometScale).fill({ alpha: 0.22 + approach * 0.4, color: 0xffe9a8 });
        gfx.circle(hx, hy, 9 * cometScale).fill({ color: 0xffffff });

        // Core flash overlay.
        if (coreFlash > 0.05) {
          gfx
            .circle(cx, cy, radius * (0.14 + coreFlash * 0.1))
            .fill({ alpha: coreFlash * 0.7, color: 0xffffff });
        }

        // Particles.
        for (let i = particles.length - 1; i >= 0; i -= 1) {
          const p = particles[i];
          if (!p) continue;
          p.x += p.vx * deltaMS;
          p.y += p.vy * deltaMS;
          p.vy += deltaMS * 0.0004; // gentle gravity
          p.life -= deltaMS / p.maxLife;
          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }
          gfx.circle(p.x, p.y, 3.5 * p.life + 0.5).fill({ alpha: p.life, color: p.color });
        }

        // Screen shake.
        app.stage.position.set(
          shakeAmp > 0 ? (Math.random() - 0.5) * shakeAmp * 2 : 0,
          shakeAmp > 0 ? (Math.random() - 0.5) * shakeAmp * 2 : 0,
        );
      };

      if (reducedMotion) {
        // Defensive: the overlay uses the Pulse Gate under reduced motion, but if
        // the ring is ever mounted, paint one static frame and register no ticker.
        draw(0);
      } else {
        const onTick = () => draw(app.ticker.deltaMS);
        app.ticker.add(onTick);
        return () => {
          app.ticker.remove(onTick);
          app.stage.off("pointerdown", handlePointerDown);
        };
      }

      return () => {
        app.stage.off("pointerdown", handlePointerDown);
      };
    },
    [],
  );

  return (
    <div
      data-board-section="orbit-forge-ring"
      className="relative aspect-square w-full max-w-[26rem] touch-none select-none"
    >
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
});
