// oxlint-disable react-doctor/exhaustive-deps -- `canvasRef` is a stable ref; reading
// `.current` inside the effect is the canonical ref-in-effect pattern and must NOT be a
// dependency (it would retrigger the whole Three lifecycle). The effect keys on
// `modelUrl` only. react-doctor runs oxlint with the same rule under the `react-doctor/`
// namespace, which the inline Biome suppression below can't reach — same split as
// `use-pixi-app.ts`.
import { type RefObject, useEffect } from "react";
import type * as ThreeTypes from "three";

// Three.js is a SIDE CHANNEL exactly like PixiJS/anime.js: it mutates the canvas
// outside React's reconciler, so every line lives in this `useEffect`, render stays
// pure, and the StrictMode double-mount is handled by the `cancelled` flag. Three is
// dynamically imported so it lands in its own chunk — the ~600 KB engine loads only
// when a 3D enemy actually mounts, never for the math/phonics paths.
//
// Renderer: WebGL, the backend the dean-stack favours for headless Playwright
// reliability (same reason `usePixiApp` defaults to `preference: "webgl"`).
//
// Lighting is lights-only (no IBL/PMREM) so it is identical on both backends and
// stays simple: a cool hemisphere base, a warm key, a cyan bioluminescent rim, a
// soft fill, and a teal accent point light for the deep-sea "glow" mood.

const PRM = "(prefers-reduced-motion: reduce)";
const MAX_DPR = 2;
const TARGET_RADIUS = 1; // model bounding-sphere radius after normalization (scene units)

type MonsterRenderer = {
  domElement: HTMLCanvasElement;
  toneMapping: number;
  toneMappingExposure: number;
  dispose(): void;
  render(scene: ThreeTypes.Scene, camera: ThreeTypes.Camera): unknown;
  setAnimationLoop(callback: (() => void) | null): void;
  setPixelRatio(value: number): void;
  setSize(width: number, height: number, updateStyle?: boolean): void;
};

function createRenderer(three: typeof ThreeTypes, canvas: HTMLCanvasElement): MonsterRenderer {
  return new three.WebGLRenderer({ alpha: true, antialias: true, canvas }) as MonsterRenderer;
}

function disposeSceneResources(scene: ThreeTypes.Scene): void {
  scene.traverse((object) => {
    const mesh = object as ThreeTypes.Mesh;
    mesh.geometry?.dispose();
    const material = mesh.material;
    if (Array.isArray(material)) {
      for (const entry of material) entry.dispose();
    } else {
      material?.dispose();
    }
  });
}

export function useGlbMonsterViewer(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  modelUrl: string,
): void {
  // biome-ignore lint/correctness/useExhaustiveDependencies: `canvasRef` is a stable ref — reading `.current` must not retrigger the Three lifecycle; the effect keys on `modelUrl` only.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = typeof window !== "undefined" && window.matchMedia(PRM).matches;
    let cancelled = false;
    let dispose: (() => void) | undefined;

    void (async () => {
      const three = await import("three");
      const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
      if (cancelled) return;

      const renderer = createRenderer(three, canvas);
      if (cancelled) {
        renderer.dispose();
        return;
      }

      const host = canvas.parentElement ?? canvas;
      const measure = () => ({
        height: host.clientHeight || 300,
        width: host.clientWidth || 240,
      });
      const initial = measure();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
      renderer.setSize(initial.width, initial.height, false);
      renderer.toneMapping = three.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      const scene = new three.Scene();
      const camera = new three.PerspectiveCamera(34, initial.width / initial.height, 0.1, 100);

      // ---- Mood lighting (deep-sea bioluminescence) ----
      scene.add(new three.HemisphereLight(0xbfe6ff, 0x09131f, 0.55));
      const key = new three.DirectionalLight(0xfff2e0, 2.5);
      key.position.set(2.2, 3, 2.6);
      scene.add(key);
      const rim = new three.DirectionalLight(0x6fe9ff, 2.4);
      rim.position.set(-2.6, 1.6, -2.2);
      scene.add(rim);
      const fill = new three.DirectionalLight(0x9ab8ff, 0.7);
      fill.position.set(-1.6, -0.6, 2.2);
      scene.add(fill);
      const accent = new three.PointLight(0x3fffd0, 7, 9, 2);
      accent.position.set(0, 0.3, 1.6);
      scene.add(accent);

      // ---- Load + frame the model ----
      const gltf = await new GLTFLoader().loadAsync(modelUrl);
      if (cancelled) {
        renderer.dispose();
        return;
      }
      const model = gltf.scene;
      // Frame by the bounding SPHERE, not max-dimension: a sphere fills the view the
      // same regardless of which axis faces the camera, so long/flat or tall creatures
      // all sit at a consistent on-screen size.
      const box = new three.Box3().setFromObject(model);
      const sphere = box.getBoundingSphere(new three.Sphere());
      const radius = sphere.radius || 1;
      model.position.sub(sphere.center);
      const pivot = new three.Group();
      pivot.scale.setScalar(TARGET_RADIUS / radius);
      pivot.add(model);
      scene.add(pivot);

      const verticalFov = (camera.fov * Math.PI) / 180;
      // 0.92 lets the model fill the portrait (a touch of overflow is fine and reads
      // as dramatic); the slight camera lift gives a hero angle rather than a flat
      // straight-on shot.
      const distance = (TARGET_RADIUS / Math.sin(verticalFov / 2)) * 0.92;
      camera.position.set(0, TARGET_RADIUS * 0.12, distance);
      camera.lookAt(0, 0, 0);

      const startedAtMs = performance.now();
      const renderFrame = () => renderer.render(scene, camera);
      if (reducedMotion) {
        // A 3/4 resting angle is more flattering than dead-on for the static frame.
        pivot.rotation.y = 0.6;
        renderFrame();
      } else {
        renderer.setAnimationLoop(() => {
          if (cancelled) return;
          const t = (performance.now() - startedAtMs) / 1000;
          pivot.rotation.y = t * 0.5;
          pivot.position.y = Math.sin(t * 1.2) * 0.05;
          renderFrame();
        });
      }

      const resize = new ResizeObserver(() => {
        const next = measure();
        renderer.setSize(next.width, next.height, false);
        camera.aspect = next.width / next.height;
        camera.updateProjectionMatrix();
        if (reducedMotion) renderFrame();
      });
      resize.observe(host);

      dispose = () => {
        renderer.setAnimationLoop(null);
        resize.disconnect();
        disposeSceneResources(scene);
        renderer.dispose();
      };
    })();

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [modelUrl]);
}
