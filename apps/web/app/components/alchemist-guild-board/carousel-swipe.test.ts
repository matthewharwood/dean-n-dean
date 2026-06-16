import { describe, expect, test } from "bun:test";

import {
  getCarouselSwipeCommitDirection,
  getCarouselSwipeIntent,
  getSwipeVelocityX,
  pushSwipeSample,
  type SwipePointerSample,
} from "./carousel-swipe";

describe("carousel swipe intent", () => {
  test("touch waits for a clear axis before classifying", () => {
    expect(getCarouselSwipeIntent(4, 3)).toBe("pending");
    expect(getCarouselSwipeIntent(24, 8)).toBe("horizontal");
    expect(getCarouselSwipeIntent(-24, 8)).toBe("horizontal");
    expect(getCarouselSwipeIntent(10, 26)).toBe("vertical");
    expect(getCarouselSwipeIntent(18, 20)).toBe("pending");
  });

  test("mouse drags never classify vertical — they stay recoverable", () => {
    expect(getCarouselSwipeIntent(10, 26, "mouse")).toBe("pending");
    expect(getCarouselSwipeIntent(4, 60, "mouse")).toBe("pending");
    expect(getCarouselSwipeIntent(24, 20, "mouse")).toBe("horizontal");
    expect(getCarouselSwipeIntent(-24, 24, "mouse")).toBe("horizontal");
    expect(getCarouselSwipeIntent(7, 2, "mouse")).toBe("pending");
  });

  test("omitting pointer type keeps touch semantics", () => {
    expect(getCarouselSwipeIntent(10, 26)).toBe(getCarouselSwipeIntent(10, 26, "touch"));
  });
});

describe("carousel swipe commit", () => {
  test("commits on distance past the threshold regardless of velocity", () => {
    expect(getCarouselSwipeCommitDirection(-38, 0, 38)).toBe(1);
    expect(getCarouselSwipeCommitDirection(38, 0, 38)).toBe(-1);
    expect(getCarouselSwipeCommitDirection(-37, 0, 38)).toBe(0);
  });

  test("commits a short same-direction flick", () => {
    expect(getCarouselSwipeCommitDirection(-20, -0.6, 38)).toBe(1);
    expect(getCarouselSwipeCommitDirection(20, 0.6, 38)).toBe(-1);
    expect(getCarouselSwipeCommitDirection(-12, -0.5, 38)).toBe(1);
  });

  test("rejects flicks that are too short, too slow, or reversing", () => {
    expect(getCarouselSwipeCommitDirection(-11, -2, 38)).toBe(0);
    expect(getCarouselSwipeCommitDirection(-20, -0.4, 38)).toBe(0);
    expect(getCarouselSwipeCommitDirection(-20, 0.6, 38)).toBe(0);
    expect(getCarouselSwipeCommitDirection(20, -0.6, 38)).toBe(0);
  });
});

describe("swipe velocity sampling", () => {
  test("computes px/ms across the sampled window", () => {
    const samples: SwipePointerSample[] = [];
    pushSwipeSample(samples, 100, 1000);
    pushSwipeSample(samples, 70, 1050);
    pushSwipeSample(samples, 40, 1100);
    expect(getSwipeVelocityX(samples)).toBe(-0.6);
  });

  test("returns zero without at least two samples or elapsed time", () => {
    expect(getSwipeVelocityX([])).toBe(0);
    expect(getSwipeVelocityX([{ timeMs: 1000, x: 50 }])).toBe(0);
    expect(
      getSwipeVelocityX([
        { timeMs: 1000, x: 50 },
        { timeMs: 1000, x: 90 },
      ]),
    ).toBe(0);
  });

  test("prunes samples older than the velocity window", () => {
    const samples: SwipePointerSample[] = [];
    pushSwipeSample(samples, 0, 0);
    pushSwipeSample(samples, 10, 300);
    pushSwipeSample(samples, 20, 350);
    expect(samples).toEqual([
      { timeMs: 300, x: 10 },
      { timeMs: 350, x: 20 },
    ]);
  });

  test("caps the sample buffer", () => {
    const samples: SwipePointerSample[] = [];
    for (let index = 0; index < 20; index += 1) {
      pushSwipeSample(samples, index, 1000 + index);
    }
    expect(samples.length).toBeLessThanOrEqual(8);
    expect(samples.at(-1)).toEqual({ timeMs: 1019, x: 19 });
  });
});
