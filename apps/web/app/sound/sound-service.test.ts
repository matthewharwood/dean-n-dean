import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

import { SOUND_REGISTRY } from "./registry";
import {
  getAudioContextConstructor,
  getGatheringAttackChargeProfile,
  getGatheringAttackChargeProgress,
  getIntroHumProfile,
  resolveSoundPublicUrl,
} from "./sound-service";

const PUBLIC_DIR = join(import.meta.dir, "../../public");

describe("sound service", () => {
  test("resolves public sound URLs under the Vite base path", () => {
    expect(resolveSoundPublicUrl("/music/crown-in-8-bit.mp3", "/")).toBe(
      "/music/crown-in-8-bit.mp3",
    );
    expect(resolveSoundPublicUrl("/sfx/ui/card-drop.mp3", "/dean-n-dean/")).toBe(
      "/dean-n-dean/sfx/ui/card-drop.mp3",
    );
    expect(resolveSoundPublicUrl("https://example.test/sound.mp3", "/dean-n-dean/")).toBe(
      "https://example.test/sound.mp3",
    );
  });

  test("keeps every registered music and sound-effect asset committed", () => {
    const missingSoundIds = SOUND_REGISTRY.flatMap((definition) => {
      if (/^(blob:|data:|https?:)/.test(definition.url)) return [];

      const relativePath = definition.url.startsWith("/")
        ? definition.url.slice(1)
        : definition.url;
      const exists = existsSync(join(PUBLIC_DIR, relativePath));
      return exists ? [] : [definition.id];
    });

    expect(missingSoundIds).toEqual([]);
  });

  test("falls back to the webkit AudioContext constructor when needed", () => {
    function WebkitAudioContext() {
      return undefined;
    }

    expect(
      Object.is(
        getAudioContextConstructor({ webkitAudioContext: WebkitAudioContext }),
        WebkitAudioContext,
      ),
    ).toBe(true);
  });

  test("clamps procedural gathering attack charge progress at each move cap", () => {
    const leftSpark = getGatheringAttackChargeProfile("left-spark");
    const rightSpark = getGatheringAttackChargeProfile("right-spark");
    const sumStrike = getGatheringAttackChargeProfile("sum-strike");
    const emberBurst = getGatheringAttackChargeProfile("ember-burst");
    const stoneCrash = getGatheringAttackChargeProfile("stone-crash");

    expect(leftSpark.rampCapMs).not.toBe(rightSpark.rampCapMs);
    expect(rightSpark.rampCapMs).not.toBe(sumStrike.rampCapMs);
    expect(emberBurst.rampCapMs).not.toBe(stoneCrash.rampCapMs);
    expect(getGatheringAttackChargeProgress("sum-strike", -120)).toBe(0);
    expect(getGatheringAttackChargeProgress("sum-strike", sumStrike.rampCapMs / 2)).toBe(0.5);
    expect(getGatheringAttackChargeProgress("sum-strike", sumStrike.rampCapMs * 3)).toBe(1);
    expect(getGatheringAttackChargeProgress("stone-crash", stoneCrash.rampCapMs)).toBe(1);
  });

  test("defines the intro ambience as a low sine hum", () => {
    const profile = getIntroHumProfile();

    expect(profile.bodyType).toBe("sine");
    expect(profile.bodyHz).toBeLessThan(50);
    expect(profile.overtoneHz).toBe(profile.bodyHz * 2);
    expect(profile.maxGain).toBeLessThan(0.2);
    expect(profile.attackMs).toBeGreaterThan(profile.releaseMs);
  });
});
