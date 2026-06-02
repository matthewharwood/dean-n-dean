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
  test("maps the through-glass quests to quest voice clip paths and nothing later", () => {
    expect(getAlchemyQuestVoiceClipPath("quest:first-water")).toBe(
      "alchemy-quest-voices/first-water.mp3",
    );
    expect(getAlchemyQuestVoiceClipPath("quest:glass-minerals")).toBe(
      "alchemy-quest-voices/glass-minerals.mp3",
    );
    expect(getAlchemyQuestVoiceClipPath("quest:water-flask-delivery")).toBeNull();
  });

  test("composes a requester voice line from catchphrase plus need", () => {
    const quest = getAlchemyQuestById("quest:glass-minerals");
    if (!quest) throw new Error("Missing glass minerals quest");

    expect(getAlchemyQuestVoiceLineText(quest)).toBe(
      "Silica loves a hot furnace. Luma needs one Glass Batch made from Silica, Soda Ash, and Calcium Carbonate.",
    );
  });

  test("resolves the speaker clip: quest line first, else the requester character clip", () => {
    const voiced = getAlchemyQuestById("quest:glass-minerals");
    if (!voiced) throw new Error("Missing glass minerals quest");
    expect(getQuestRequesterVoiceClipPath(voiced)).toBe("alchemy-quest-voices/glass-minerals.mp3");

    const fallback = getAlchemyQuestById("quest:water-flask-delivery");
    if (!fallback) throw new Error("Missing water flask delivery quest");
    expect(getQuestRequesterVoiceClipPath(fallback)).toBe(
      "alchemy-character-voices/sir-bubbleton.mp3",
    );
  });

  test("references committed quest voice assets", async () => {
    expect(ALCHEMY_QUEST_VOICE_LINES).toHaveLength(5);

    for (const voiceLine of ALCHEMY_QUEST_VOICE_LINES) {
      expect(voiceLine.text.length).toBeGreaterThan(0);
      expect(await Bun.file(join(PUBLIC_DIR, voiceLine.audioPath)).exists()).toBe(true);
    }
  });
});
