import { describe, expect, test } from "bun:test";

import { getAlchemyQuestById } from "@dean-stack/schemas";

import {
  createQuestBriefingCardProps,
  FIRST_QUEST_BRIEFING_CARD_PROPS,
  getQuestBriefingInitialSlideIndex,
  getQuestCarouselEdgeSwipeDirection,
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

  test("labels raw and crafted ingredients by full names instead of pseudo element symbols", () => {
    const quest = getAlchemyQuestById("quest:field-kit-basics");
    if (!quest) throw new Error("Missing field kit quest");

    const cardProps = QuestBriefingCardPropsSchema.parse(createQuestBriefingCardProps(quest));
    const herbalMash = cardProps.recipeLabels[0];
    if (!herbalMash) throw new Error("Missing Herbal Mash briefing recipe");

    expect(herbalMash).toMatchObject({
      formula: "Herbs + Water",
      ingredients: [
        { cardId: "raw:herbs", name: "Herbs", quantity: 1, symbol: "Herbs" },
        { cardId: "material:water", name: "Water", quantity: 1, symbol: "Water" },
      ],
      name: "Herbal Mash",
    });
  });
});

describe("QuestBriefingCard carousel behavior", () => {
  test("starts the first quest on the recipe slide and later quests on the first slide", () => {
    expect(getQuestBriefingInitialSlideIndex("quest:first-water")).toBe(1);
    expect(getQuestBriefingInitialSlideIndex("quest:kitchen-salt-and-fuel")).toBe(0);
  });

  test("only hands off swipes that push past the inner carousel edges", () => {
    expect(getQuestCarouselEdgeSwipeDirection(0, -1)).toBe(-1);
    expect(getQuestCarouselEdgeSwipeDirection(0, 1)).toBeNull();
    expect(getQuestCarouselEdgeSwipeDirection(1, -1)).toBeNull();
    expect(getQuestCarouselEdgeSwipeDirection(1, 1)).toBeNull();
    expect(getQuestCarouselEdgeSwipeDirection(2, -1)).toBeNull();
    expect(getQuestCarouselEdgeSwipeDirection(2, 1)).toBe(1);
  });
});
