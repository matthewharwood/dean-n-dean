import { describe, expect, test } from "bun:test";

import {
  FIRST_QUEST_BRIEFING_CARD_PROPS,
  QuestBriefingCardPropsSchema,
} from "./quest-briefing-card";

describe("QuestBriefingCard data projection", () => {
  test("projects the first Water quest into a card display model", () => {
    const cardProps = QuestBriefingCardPropsSchema.parse(FIRST_QUEST_BRIEFING_CARD_PROPS);

    expect(cardProps.id).toBe("quest:first-water");
    expect(cardProps.title).toBe("Sir Bubbleton Needs Water");
    expect(cardProps.requesterName).toBe("Sir Bubbleton");
    expect(cardProps.requesterAvatarPath).toBe("alchemy-character-avatars/sir-bubbleton.webp");
    expect(cardProps.developerNotesVisible).toBe(false);
    expect(cardProps.redacted).toBe(false);
    expect(cardProps.recipeLabels).toContainEqual({
      formula: "2H + O",
      imagePath: "alchemy-card-art/material-water.webp",
      ingredients: [
        { cardId: "element:h", name: "Hydrogen", quantity: 2, symbol: "H" },
        { cardId: "element:o", name: "Oxygen", quantity: 1, symbol: "O" },
      ],
      name: "Water",
    });
    expect(cardProps.hint).toContain("Water is H2O");
    expect(cardProps.rewards).toEqual([
      { icon: "gold", label: "Gold", value: "10" },
      { icon: "knowledge", label: "Knowledge XP", value: "12" },
      { icon: "discovery", label: "Discovery Token", value: "1" },
      { icon: "muddlefog", label: "Muddlefog Cleared", value: "3%" },
    ]);
  });
});
