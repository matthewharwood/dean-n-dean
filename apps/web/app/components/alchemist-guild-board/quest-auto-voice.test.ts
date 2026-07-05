import { describe, expect, test } from "bun:test";

import {
  ALCHEMIST_GUILD_BOARD_DEFAULT,
  ALCHEMIST_GUILD_BOARD_ID,
  AlchemistGuildBoardStateSchema,
} from "@dean-stack/schemas";

import {
  getQuestAutoVoiceClipPath,
  markQuestVoiceAutoPlayed,
  QUEST_AUTO_VOICE_DEBOUNCE_MS,
} from "./quest-auto-voice";

describe("quest auto voice", () => {
  test("uses a 500ms debounce before auto-reading a newly seen quest", () => {
    expect(QUEST_AUTO_VOICE_DEBOUNCE_MS).toBe(500);
  });

  test("only resolves a clip for unlocked quests whose auto voice has not played", () => {
    const voiceClipPath = "alchemy-quest-voices/first-water.mp3";

    expect(
      getQuestAutoVoiceClipPath({
        autoPlayedQuestVoiceIds: [],
        questId: "quest:first-water",
        unlocked: true,
        voiceClipPath,
      }),
    ).toBe(voiceClipPath);
    expect(
      getQuestAutoVoiceClipPath({
        autoPlayedQuestVoiceIds: [],
        questId: "quest:first-water",
        unlocked: false,
        voiceClipPath,
      }),
    ).toBeNull();
    expect(
      getQuestAutoVoiceClipPath({
        autoPlayedQuestVoiceIds: ["quest:first-water"],
        questId: "quest:first-water",
        unlocked: true,
        voiceClipPath,
      }),
    ).toBeNull();
    expect(
      getQuestAutoVoiceClipPath({
        autoPlayedQuestVoiceIds: [],
        questId: "quest:first-water",
        unlocked: true,
        voiceClipPath: null,
      }),
    ).toBeNull();
  });

  test("marks a quest voice as auto-played once", () => {
    const next = markQuestVoiceAutoPlayed(ALCHEMIST_GUILD_BOARD_DEFAULT, "quest:first-water");

    expect(next.autoPlayedQuestVoiceIds).toEqual(["quest:first-water"]);
    expect(markQuestVoiceAutoPlayed(next, "quest:first-water")).toBe(next);
  });

  test("defaults the auto-played quest voice list on existing board rows", () => {
    const parsed = AlchemistGuildBoardStateSchema.parse({
      id: ALCHEMIST_GUILD_BOARD_ID,
      reagentSlots: ALCHEMIST_GUILD_BOARD_DEFAULT.reagentSlots,
    });

    expect(parsed.autoPlayedQuestVoiceIds).toEqual([]);
  });
});
