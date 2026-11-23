import { describe, expect, test } from "bun:test";

import { getGemSwipeMetrics, getGemSwipeTravelPx } from "./gem-swipe-control";

describe("gem swipe control geometry", () => {
  test("matches pointer travel to each visible gem setting", () => {
    expect(getGemSwipeMetrics("compact")).toEqual({ paddingPx: 6, thumbWidthPx: 72 });
    expect(getGemSwipeMetrics("standard")).toEqual({ paddingPx: 12, thumbWidthPx: 72 });
    expect(getGemSwipeMetrics("large")).toEqual({ paddingPx: 12, thumbWidthPx: 76 });
  });

  test("never exposes negative travel in a narrow track", () => {
    expect(getGemSwipeTravelPx(320, "compact")).toBe(236);
    expect(getGemSwipeTravelPx(320, "standard")).toBe(224);
    expect(getGemSwipeTravelPx(320, "large")).toBe(220);
    expect(getGemSwipeTravelPx(40, "large")).toBe(0);
  });
});
