import { describe, expect, test } from "bun:test";
import { join } from "node:path";

import {
  ALCHEMY_QUEST_VOICE_LINES,
  getAlchemyQuestById,
  getAlchemyQuestVoiceClipPath,
  getAlchemyQuestVoiceLineText,
  getQuestRequesterVoiceClipPath,
} from "@dean-stack/schemas";

const PUBLIC_DIR = join(import.meta.dir, "..", "public");

describe("alchemy quest voice lines", () => {
  test("registers only recordings that still match a one-recipe request", () => {
    expect(getAlchemyQuestVoiceClipPath("quest:first-water")).toBe(
      "alchemy-quest-voices/first-water.mp3",
    );
    expect(getAlchemyQuestVoiceClipPath("quest:glass-minerals")).toBeNull();
    expect(getAlchemyQuestVoiceClipPath("quest:water-flask-delivery")).toBeNull();
  });

  test("composes a requester voice line from catchphrase plus need", () => {
    const quest = getAlchemyQuestById("quest:glass-minerals-silica");
    if (!quest) throw new Error("Missing first glass minerals quest chapter");

    expect(getAlchemyQuestVoiceLineText(quest)).toBe(
      "Silica loves a hot furnace. Make one Silica to begin “Glassblower Luma's Mineral Riddle.” It will stay in Inventory for a later part.",
    );
  });

  test("uses a recorded line for a one-part quest and character audio for split arcs", () => {
    const voiced = getAlchemyQuestById("quest:first-water");
    if (!voiced) throw new Error("Missing first Water quest");
    expect(getQuestRequesterVoiceClipPath(voiced)).toBe("alchemy-quest-voices/first-water.mp3");

    const splitArcChapter = getAlchemyQuestById("quest:glass-minerals-silica");
    if (!splitArcChapter) throw new Error("Missing first glass minerals quest chapter");
    expect(getQuestRequesterVoiceClipPath(splitArcChapter)).toBe(
      "alchemy-character-voices/glassblower-luma.mp3",
    );
  });

  test("references committed quest voice assets", async () => {
    expect(ALCHEMY_QUEST_VOICE_LINES).toHaveLength(1);

    for (const voiceLine of ALCHEMY_QUEST_VOICE_LINES) {
      expect(voiceLine.text.length).toBeGreaterThan(0);
      expect(await Bun.file(join(PUBLIC_DIR, voiceLine.audioPath)).exists()).toBe(true);
    }
  });
});
