import { describe, expect, test } from "bun:test";
import {
  ALCHEMIST_GUILD_BOARD_DEFAULT,
  ALCHEMIST_GUILD_FIRST_WATER_QUEST_ID,
} from "@dean-stack/schemas";

import { isAlchemyIntroZeroState } from "./intro-choreography";

describe("alchemy intro choreography", () => {
  test("treats the untouched board as the intro zero state", () => {
    expect(isAlchemyIntroZeroState(ALCHEMIST_GUILD_BOARD_DEFAULT)).toBe(true);
  });

  test("ends the zero state after a periodic element enters the workbench", () => {
    expect(
      isAlchemyIntroZeroState({
        ...ALCHEMIST_GUILD_BOARD_DEFAULT,
        elementQuantities: {
          ...ALCHEMIST_GUILD_BOARD_DEFAULT.elementQuantities,
          "element:h": 1,
        },
        reagentSlots: {
          ...ALCHEMIST_GUILD_BOARD_DEFAULT.reagentSlots,
          "reagent-slot-1": "element:h",
        },
      }),
    ).toBe(false);
  });

  test("does not re-enter after the Water tutorial quest is complete", () => {
    expect(
      isAlchemyIntroZeroState({
        ...ALCHEMIST_GUILD_BOARD_DEFAULT,
        completedQuestIds: [ALCHEMIST_GUILD_FIRST_WATER_QUEST_ID],
      }),
    ).toBe(false);
  });
});
