import type { LiteRt } from "@litertjs/core";
import * as z from "zod";

export const LiteRtRuntimeOptionsSchema = z.object({
  wasmPath: z.string().trim().min(1),
});

export type LiteRtRuntimeOptions = z.infer<typeof LiteRtRuntimeOptionsSchema>;

/**
 * Initializes LiteRT's process-wide browser runtime once.
 *
 * Call this from an effect, event handler, or dedicated browser worker.
 * The caller owns model and Tensor cleanup; the shared runtime remains alive
 * for the page session so a component unmount cannot invalidate another model.
 */
export async function initializeLiteRt(options: LiteRtRuntimeOptions): Promise<LiteRt> {
  const { wasmPath } = LiteRtRuntimeOptionsSchema.parse(options);

  const isBrowserRuntime = typeof window !== "undefined" || "importScripts" in globalThis;
  if (!isBrowserRuntime) {
    throw new Error("LiteRT.js can only be initialized in the browser.");
  }

  const { getGlobalLiteRtPromise, loadLiteRt } = await import("@litertjs/core");
  return getGlobalLiteRtPromise() ?? loadLiteRt(wasmPath, { jspi: false, threads: false });
}
