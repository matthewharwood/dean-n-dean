import { describe, expect, test } from "bun:test";

import {
  ALCHEMIST_GUILD_BOARD_DEFAULT,
  ALCHEMIST_GUILD_BOARD_ID,
  ALCHEMIST_GUILD_QUEST_DELIVERIES_DEFAULT,
  AlchemistGuildBoardStateSchema,
} from "@dean-stack/schemas";

import { FIRST_PROFILE_CARD_PROPS, ProfileCardPropsSchema } from "./profile-card";

describe("ProfileCard data projection", () => {
  test("projects the apprentice profile zero state", () => {
    const props = ProfileCardPropsSchema.parse(FIRST_PROFILE_CARD_PROPS);

    expect(props.playerName).toBe("Apprentice");
    expect(props.avatarPath).toBe("alchemy-character-avatars/apprentice.webp");
    expect(props.stats.map((stat) => [stat.kind, stat.value])).toEqual([
      ["level", "1"],
      ["gold", "0"],
      ["knowledge", "0"],
      ["discovery", "0"],
      ["muddlefog", "0%"],
    ]);
  });

  test("defaults profile and discovery fields on existing board rows", () => {
    const parsed = AlchemistGuildBoardStateSchema.parse({
      id: ALCHEMIST_GUILD_BOARD_ID,
      reagentSlots: ALCHEMIST_GUILD_BOARD_DEFAULT.reagentSlots,
    });

    expect(parsed.profile).toEqual({
      discoveryTokens: 0,
      gold: 0,
      knowledgeXp: 0,
      level: 1,
      muddlefogCleared: 0,
      playerName: "Apprentice",
    });
    expect(parsed.completedQuestIds).toEqual([]);
    expect(parsed.discoveredRecipeIds).toEqual([]);
    expect(parsed.questDeliveries).toEqual(ALCHEMIST_GUILD_QUEST_DELIVERIES_DEFAULT);
  });
});
