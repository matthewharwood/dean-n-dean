import { describe, expect, test } from "bun:test";

import {
  ALCHEMIST_GUILD_BOARD_DEFAULT,
  ALCHEMIST_GUILD_BOARD_ID,
  AlchemistGuildBoardStateSchema,
} from "@dean-stack/schemas";

import { FIRST_PROFILE_CARD_PROPS, ProfileCardPropsSchema } from "./profile-card";

describe("ProfileCard data projection", () => {
  test("projects the apprentice profile with first quest rewards", () => {
    const props = ProfileCardPropsSchema.parse(FIRST_PROFILE_CARD_PROPS);

    expect(props.playerName).toBe("Apprentice");
    expect(props.avatarPath).toBe("alchemy-character-avatars/apprentice.webp");
    expect(props.stats.map((stat) => [stat.kind, stat.value])).toEqual([
      ["level", "1"],
      ["gold", "10"],
      ["knowledge", "12"],
      ["discovery", "1"],
      ["muddlefog", "3%"],
    ]);
  });

  test("defaults profile fields on existing board rows", () => {
    const parsed = AlchemistGuildBoardStateSchema.parse({
      id: ALCHEMIST_GUILD_BOARD_ID,
      reagentSlots: ALCHEMIST_GUILD_BOARD_DEFAULT.reagentSlots,
    });

    expect(parsed.profile).toEqual({ level: 1, playerName: "Apprentice" });
  });
});
