---
name: litertjs
description: "Integrate LiteRT.js 2.5.x into dean-stack for browser-side .tflite inference. Use for @litertjs/core, loadLiteRt, loadAndCompile, Tensor lifecycle, WebGPU/Wasm accelerator selection, model and Wasm asset hosting, inference workers, model preprocessing/post-processing, or on-device ML performance and PWA caching."
---

# LiteRT.js in dean-stack

Use `@litertjs/core` for bounded, task-specific inference that benefits from local privacy, low latency, or eventual offline execution. Keep deterministic game rules, scoring, authored content, and ordinary lookup logic in TypeScript.

Ground truth:

- Package: `@litertjs/core@^2.5.2` (2.5.x).
- Runtime boundary: `apps/<name>/app/ml/litert-runtime.ts`.
- Upstream guide: <https://ai.google.dev/edge/litert/web/get_started>.
- Upstream API/package source: <https://github.com/google-ai-edge/LiteRT/tree/main/litert/js/packages/core>.

## Integration workflow

1. Prove the model first. Convert it to `.tflite`, inspect fixed input/output shapes and types, and run Google's LiteRT.js Model Tester with fake inputs before building UI. LiteRT.js input/output support and accelerator operator coverage are narrower than desktop ML frameworks.
2. Keep assets base-aware. A prototype may pass a version-pinned CDN Wasm directory to `initializeLiteRt`. Before shipping, automate copying the required loader `.js` and matching `.wasm` pair from `node_modules/@litertjs/core/wasm/` into `public/litert-wasm/`; reference it and models through `import.meta.env.BASE_URL`. Do not commit generated npm binaries.
3. Initialize outside render:

   ```ts
   import { initializeLiteRt } from "~/ml/litert-runtime";

   const runtime = await initializeLiteRt({
     wasmPath: `${import.meta.env.BASE_URL}litert-wasm/`,
   });
   ```

   Call from an effect, event handler, or dedicated browser worker. The wrapper dynamically imports the package, rejects prerender/Node, and reuses the global runtime promise. Do not call `unloadLiteRt()` during component cleanup.
4. Select WebGPU only after `isWebGPUSupported()`. If WebGPU compilation fails, discard that attempt and compile the whole model with `accelerator: "wasm"`. Partial delegation is unsupported. Keep WebNN/JSPI and threaded Wasm off by default: WebNN is experimental, and GitHub Pages cannot provide the cross-origin-isolation headers required by threads.
5. Load lazily after the player enters or opts into the feature. Keep the initial route free of the Wasm payload and model. Provide a deterministic loading/error fallback so inference failure does not break the game shell.
6. Treat every LiteRT object as a manually managed native resource. Delete input tensors, all output tensors, and compiled models in `finally`. Keep the page-wide runtime alive. Never store a `Tensor`, `CompiledModel`, `GPUBuffer`, or runtime instance in React state, Jotai, or IDB.
7. Convert output to small serializable values, Zod-parse the result contract, then write only player-visible progress/settings through `atomWithIDB`. Keep transient prediction UI ephemeral.
8. Unit-test pure preprocessing, post-processing, shape checks, and Zod failures with `bun test`. Ask the user before adding or modifying any Playwright test for real browser inference, accelerator fallback, workers, model fetches, or offline caching.

## Resource-safe inference shape

```ts
const { Tensor, isWebGPUSupported } = await import("@litertjs/core");
const accelerator = isWebGPUSupported() ? "webgpu" : "wasm";
const model = await runtime.loadAndCompile(modelUrl, { accelerator });
const input = new Tensor(new Float32Array(inputValues), inputShape);

try {
  const outputs = await model.run(input);
  try {
    // Move/copy the required output to Wasm, extract serializable data,
    // and validate that data with a Zod schema.
  } finally {
    for (const output of outputs) output.delete();
  }
} finally {
  input.delete();
  model.delete();
}
```

If repeated or CPU inference causes frame drops, move preprocessing and inference into a dedicated browser worker. Keep the same cleanup and Zod result boundary; send serializable data or transferable buffers across the worker boundary, never LiteRT wrapper objects.

## Asset and PWA policy

- Do not add models or Wasm to the app-shell precache.
- When the service worker is enabled, runtime-cache versioned `.tflite`, `.wasm`, and associated loader `.js` assets with `CacheFirst`.
- Change the asset URL/version when model bytes or tensor contracts change.
- Do not fetch secrets or model credentials. Everything in a GitHub Pages client is public.
- Quantize weights when size requires it, while keeping model I/O compatible with LiteRT.js's supported tensor types.

## Anti-patterns

- Initializing LiteRT at module scope or during React render/prerender.
- Adding TensorFlow.js or `@litertjs/tfjs-interop` before a model proves that direct typed-array preprocessing is inadequate.
- Assuming WebGPU availability means every model operator compiles on WebGPU.
- Enabling threaded Wasm on GitHub Pages without cross-origin isolation.
- Preloading every model at app startup or precaching it with the shell.
- Omitting `delete()` because a component unmounted or JavaScript references went out of scope.
- Putting predictions into IDB before validating and reducing them to a stable serializable schema.
