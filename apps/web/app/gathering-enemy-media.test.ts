import { describe, expect, test } from "bun:test";
import { join } from "node:path";

import { ALCHEMY_GATHERING_ENEMIES, getGatheringEnemyImagePath } from "@dean-stack/schemas";

const PUBLIC_DIR = join(import.meta.dir, "..", "public");

describe("gathering enemy media", () => {
  test("every bestiary enemy ships its base and poster-variant WebP art", async () => {
    expect(ALCHEMY_GATHERING_ENEMIES.length).toBeGreaterThan(0);

    for (const enemy of ALCHEMY_GATHERING_ENEMIES) {
      for (let loop = 0; loop <= enemy.variantCount; loop += 1) {
        const imagePath = getGatheringEnemyImagePath(enemy, loop);
        expect(await Bun.file(join(PUBLIC_DIR, imagePath)).exists()).toBe(true);
      }
    }
  });
});
