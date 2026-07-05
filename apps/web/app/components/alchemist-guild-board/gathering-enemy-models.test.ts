import { describe, expect, test } from "bun:test";

import { getGatheringEnemyModelPath } from "./gathering-enemy-models";

describe("gathering enemy model resolution", () => {
  test("base imagePath resolves to the base model", () => {
    expect(getGatheringEnemyModelPath("enemies/hadal-glow-polyp-echo.webp")).toBe(
      "enemy-models/hadal-glow-polyp-echo.glb",
    );
  });

  test("a poster variant with its own model resolves to that variant model", () => {
    expect(getGatheringEnemyModelPath("enemies/hadal-glow-polyp-echo_L1.webp")).toBe(
      "enemy-models/hadal-glow-polyp-echo_L1.glb",
    );
  });

  test("a variant without its own model falls back to the base model", () => {
    expect(getGatheringEnemyModelPath("enemies/hadal-glow-polyp-echo_L2.webp")).toBe(
      "enemy-models/hadal-glow-polyp-echo.glb",
    );
  });

  test("a base-only enemy model resolves with no variant", () => {
    expect(getGatheringEnemyModelPath("enemies/hadal-tide-minnow-echo.webp")).toBe(
      "enemy-models/hadal-tide-minnow-echo.glb",
    );
  });

  test("an enemy with no model returns null", () => {
    // hadal-plasma-reef-lancer-echo is the only bestiary enemy without a .glb.
    expect(getGatheringEnemyModelPath("enemies/hadal-plasma-reef-lancer-echo.webp")).toBeNull();
    expect(getGatheringEnemyModelPath("enemies/hadal-plasma-reef-lancer-echo_L1.webp")).toBeNull();
  });

  test("a malformed path returns null", () => {
    expect(getGatheringEnemyModelPath("not-an-enemy-path")).toBeNull();
  });
});
