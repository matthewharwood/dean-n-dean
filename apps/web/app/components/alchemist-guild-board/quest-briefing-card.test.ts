import { describe, expect, test } from "bun:test";

import { getAlchemyQuestById } from "@dean-stack/schemas";

import {
  createQuestBriefingCardProps,
  FIRST_QUEST_BRIEFING_CARD_PROPS,
  getQuestBriefingInitialSlideIndex,
  getQuestCarouselEdgeSwipeDirection,
  getQuestCarouselSwipeDirection,
  getQuestCarouselSwipeIntent,
  QuestBriefingCardPropsSchema,
  shouldUseRecipeDeckFractionPagination,
} from "./quest-briefing-card";

describe("QuestBriefingCard data projection", () => {
  test("projects the first Water quest into a card display model", () => {
    const cardProps = QuestBriefingCardPropsSchema.parse(FIRST_QUEST_BRIEFING_CARD_PROPS);

    expect(cardProps.id).toBe("quest:first-water");
    expect(cardProps.title).toBe("Sir Bubbleton Needs Water");
    expect(cardProps.requesterName).toBe("Sir Bubbleton");
    expect(cardProps.requesterAvatarPath).toBe("alchemy-character-avatars/sir-bubbleton.webp");
    expect(cardProps.requesterVoiceClipPath).toBe("alchemy-quest-voices/first-water.mp3");
    expect(cardProps.developerNotesVisible).toBe(false);
    expect(cardProps.completed).toBeUndefined();
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

  test("marks a completed quest briefing without changing its review data", () => {
    const cardProps = QuestBriefingCardPropsSchema.parse({
      ...FIRST_QUEST_BRIEFING_CARD_PROPS,
      completed: true,
    });

    expect(cardProps.completed).toBe(true);
    expect(cardProps.title).toBe("Sir Bubbleton Needs Water");
    expect(cardProps.recipeLabels.map((recipe) => recipe.name)).toContain("Water");
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

  test("projects the Glass Batch capstone before its component recipes", () => {
    const quest = getAlchemyQuestById("quest:glass-minerals");
    if (!quest) throw new Error("Missing glass minerals quest");

    const cardProps = QuestBriefingCardPropsSchema.parse(createQuestBriefingCardProps(quest));

    expect(cardProps.need).toContain("Glass Batch");
    expect(cardProps.recipeLabels.map((recipe) => recipe.name)).toEqual([
      "Glass Batch",
      "Silica",
      "Soda Ash",
      "Calcium Carbonate",
    ]);
    expect(cardProps.recipeLabels.map((recipe) => recipe.formula)).toEqual([
      "Silica + Soda Ash + Calcium Carbonate",
      "Si + 2O",
      "Na + C + 3O",
      "Ca + C + 3O",
    ]);
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

  test("lets vertical recipe-deck gestures scroll instead of hijacking them", () => {
    expect(getQuestCarouselSwipeIntent(3, 4)).toBe("pending");
    expect(getQuestCarouselSwipeIntent(14, 4)).toBe("horizontal");
    expect(getQuestCarouselSwipeIntent(8, 22)).toBe("vertical");
    expect(getQuestCarouselSwipeIntent(18, 20)).toBe("pending");
  });

  test("never abandons a mouse drag as vertical — mice have no native pan", () => {
    expect(getQuestCarouselSwipeIntent(8, 22, "mouse")).toBe("pending");
    expect(getQuestCarouselSwipeIntent(22, 20, "mouse")).toBe("horizontal");
  });

  test("maps committed inner recipe swipes to neighboring quest-detail slides", () => {
    expect(getQuestCarouselSwipeDirection(-33)).toBe(0);
    expect(getQuestCarouselSwipeDirection(-34)).toBe(1);
    expect(getQuestCarouselSwipeDirection(34)).toBe(-1);
  });

  test("commits short fast flicks but not slow or reversing ones", () => {
    expect(getQuestCarouselSwipeDirection(-20, -0.6)).toBe(1);
    expect(getQuestCarouselSwipeDirection(20, 0.6)).toBe(-1);
    expect(getQuestCarouselSwipeDirection(-20, -0.4)).toBe(0);
    expect(getQuestCarouselSwipeDirection(-20, 0.6)).toBe(0);
  });

  test("switches crowded vertical recipe steps from dots to a fraction", () => {
    expect(shouldUseRecipeDeckFractionPagination(3)).toBe(false);
    expect(shouldUseRecipeDeckFractionPagination(4)).toBe(true);
  });
});
