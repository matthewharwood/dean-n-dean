import { describe, expect, test } from "bun:test";

import { initializeLiteRt, LiteRtRuntimeOptionsSchema } from "./litert-runtime";

describe("LiteRtRuntimeOptionsSchema", () => {
  test("accepts a self-hosted Wasm directory", () => {
    expect(LiteRtRuntimeOptionsSchema.parse({ wasmPath: "/dean-stack/litert-wasm/" })).toEqual({
      wasmPath: "/dean-stack/litert-wasm/",
    });
  });

  test("rejects an empty Wasm path", () => {
    expect(LiteRtRuntimeOptionsSchema.safeParse({ wasmPath: " " }).success).toBe(false);
  });
});

test("initializeLiteRt rejects prerender and other server runtimes", async () => {
  await expect(initializeLiteRt({ wasmPath: "/litert-wasm/" })).rejects.toThrow(
    "LiteRT.js can only be initialized in the browser.",
  );
});
