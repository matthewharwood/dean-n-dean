import { describe, expect, test } from "bun:test";

import {
  getQuestCurrentSwipeDirection,
  getQuestCurrentSwipeIntent,
} from "./quest-current-carousel-gesture";

describe("quest current carousel gesture", () => {
  test("waits for a clear horizontal gesture before paginating quests", () => {
    expect(getQuestCurrentSwipeIntent(4, 3)).toBe("pending");
    expect(getQuestCurrentSwipeIntent(24, 8)).toBe("horizontal");
    expect(getQuestCurrentSwipeIntent(-24, 8)).toBe("horizontal");
    expect(getQuestCurrentSwipeIntent(10, 26)).toBe("vertical");
    expect(getQuestCurrentSwipeIntent(18, 20)).toBe("pending");
  });

  test("never abandons a mouse drag as vertical — mice have no native pan", () => {
    expect(getQuestCurrentSwipeIntent(10, 26, "mouse")).toBe("pending");
    expect(getQuestCurrentSwipeIntent(24, 20, "mouse")).toBe("horizontal");
  });

  test("maps committed horizontal swipes to the previous and next quest", () => {
    expect(getQuestCurrentSwipeDirection(-37)).toBe(0);
    expect(getQuestCurrentSwipeDirection(-38)).toBe(1);
    expect(getQuestCurrentSwipeDirection(38)).toBe(-1);
  });

  test("commits short fast flicks but not slow or reversing ones", () => {
    expect(getQuestCurrentSwipeDirection(-20, -0.6)).toBe(1);
    expect(getQuestCurrentSwipeDirection(20, 0.6)).toBe(-1);
    expect(getQuestCurrentSwipeDirection(-20, -0.4)).toBe(0);
    expect(getQuestCurrentSwipeDirection(-20, 0.6)).toBe(0);
    expect(getQuestCurrentSwipeDirection(-11, -2)).toBe(0);
  });
});
