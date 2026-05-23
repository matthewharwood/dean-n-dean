// oxlint-disable react-doctor/exhaustive-deps -- API-design escape: `deps` is
// a public DependencyList parameter the caller owns. Biome's exhaustive-deps
// check honors `biome-ignore` (see inline comment below); react-doctor runs
// oxlint with the same rule under the `react-doctor/` namespace, which the
// inline Biome suppressions can't address. The disable lives at file scope so hook callers
// don't have to re-read the rationale at every call site. See use-anime.ts
// for the original (animejs) instance of the same pattern.
import { Application } from "pixi.js";
import { type DependencyList, type RefObject, useEffect } from "react";

const PRM = "(prefers-reduced-motion: reduce)";
const DEFAULT_MAX_RESOLUTION = 2;

type SetupCleanup = (() => void) | void;
type SetupContext = { reducedMotion: boolean };
type Setup = (app: Application, ctx: SetupContext) => SetupCleanup;
type PixiRendererPreference = "webgl" | "canvas";
type PixiAppOptions = {
  autoStart?: boolean;
  maxResolution?: number;
  preference?: PixiRendererPreference;
};

// Pillar — PixiJS is a side channel exactly like anime.js. The scene graph
// mutates the canvas outside React's reconciler; render must stay pure. This
// hook owns the lifecycle: async `app.init({ canvas, ... })`, the `setup`
// callback (where the caller adds children, registers Ticker callbacks, etc.),
// and `app.destroy(false, { children: true, texture: true })` on unmount.
// `prefers-reduced-motion: reduce` is detected once and passed to setup so the
// caller can skip Ticker-driven animations the same way `useAnime` short-circuits.
// Static scenes can pass `autoStart: false` and call `app.render()` from their
// own resize/input handlers instead of paying for a continuous render loop.
export function usePixiApp(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  setup: Setup,
  deps: DependencyList = [],
  options: PixiAppOptions = {},
): void {
  useEffect(
    () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const reducedMotion = typeof window !== "undefined" && window.matchMedia(PRM).matches;

      let app: Application | null = null;
      let userCleanup: SetupCleanup;
      let cancelled = false;

      void (async () => {
        const next = new Application();
        const resolution = getDeviceResolution(options.maxResolution ?? DEFAULT_MAX_RESOLUTION);

        await next.init({
          canvas,
          resizeTo: canvas.parentElement ?? canvas,
          antialias: true,
          autoDensity: true,
          resolution,
          roundPixels: true,
          // WebGL is the most reliable backend in headless Chromium (Playwright);
          // pixi will fall back to canvas if WebGL is unavailable.
          preference: options.preference ?? "webgl",
          autoStart: options.autoStart ?? !reducedMotion,
        });
        if (cancelled) {
          next.destroy(false, { children: true, texture: true });
          return;
        }
        app = next;
        userCleanup = setup(next, { reducedMotion });
      })();

      return () => {
        cancelled = true;
        if (typeof userCleanup === "function") userCleanup();
        if (app) app.destroy(false, { children: true, texture: true });
      };
    },
    // KEEP — same API-design escape as `useAnime`. `deps` is the
    // public parameter the caller owns, opaque to biome's static dep
    // verifier. See use-anime.ts for the full reasoning.
    // biome-ignore lint/correctness/useExhaustiveDependencies: API design — `deps` is a public parameter the caller owns.
    deps,
  );
}

function getDeviceResolution(maxResolution: number): number {
  if (typeof window === "undefined") return 1;

  const deviceResolution = window.devicePixelRatio > 0 ? window.devicePixelRatio : 1;

  return Math.max(1, Math.min(deviceResolution, maxResolution));
}
