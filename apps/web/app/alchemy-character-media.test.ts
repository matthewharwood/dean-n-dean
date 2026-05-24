import { describe, expect, test } from "bun:test";
import { join } from "node:path";

import { ALCHEMY_CHARACTERS, validateAlchemyCharacterMedia } from "@dean-stack/schemas";

const PUBLIC_DIR = join(import.meta.dir, "..", "public");

describe("alchemy character media", () => {
  test("validates character media registry", () => {
    expect(validateAlchemyCharacterMedia()).toHaveLength(ALCHEMY_CHARACTERS.length);
  });

  test("references committed avatar and voice assets", async () => {
    for (const character of ALCHEMY_CHARACTERS) {
      expect(await Bun.file(join(PUBLIC_DIR, character.avatarPath)).exists()).toBe(true);

      for (const voiceClip of character.voiceClips) {
        expect(await Bun.file(join(PUBLIC_DIR, voiceClip.audioPath)).exists()).toBe(true);
      }
    }
  });
});
