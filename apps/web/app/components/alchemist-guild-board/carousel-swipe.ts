// Shared pure gesture math for the quest panel's two horizontal carousels
// (QuestCurrentCarousel in index.tsx and QuestBriefingCarousel in
// quest-briefing-card.tsx). Leaf module: imports nothing local so both
// consumers can depend on it without cycles.

export type CarouselSwipeIntent = "horizontal" | "pending" | "vertical";

export type SwipePointerSample = { timeMs: number; x: number };

const SWIPE_INTENT_MIN_PX = 8;
const SWIPE_VERTICAL_INTENT_MIN_PX = 10;
const SWIPE_VERTICAL_INTENT_RATIO = 1.15;
const SWIPE_VELOCITY_WINDOW_MS = 100;
const SWIPE_SAMPLE_CAP = 8;
export const SWIPE_FLICK_VELOCITY_PX_PER_MS = 0.5;
export const SWIPE_FLICK_MIN_DISTANCE_PX = 12;

// Touch defers to the browser's vertical pan; mouse has no native pan to
// defer to, so a mouse drag never classifies "vertical" — it stays "pending"
// (recoverable) until it straightens out horizontally.
export function getCarouselSwipeIntent(
  deltaX: number,
  deltaY: number,
  pointerType = "touch",
): CarouselSwipeIntent {
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (pointerType === "mouse") {
    return absX >= SWIPE_INTENT_MIN_PX && absX >= absY ? "horizontal" : "pending";
  }

  if (absX < SWIPE_INTENT_MIN_PX && absY < SWIPE_INTENT_MIN_PX) return "pending";

  if (absY >= SWIPE_VERTICAL_INTENT_MIN_PX && absY > absX * SWIPE_VERTICAL_INTENT_RATIO) {
    return "vertical";
  }

  if (absX >= SWIPE_INTENT_MIN_PX && absX > absY) return "horizontal";

  return "pending";
}

// Commits on distance OR on a same-direction flick: a quick short swipe
// should page instead of rubber-banding back.
export function getCarouselSwipeCommitDirection(
  deltaX: number,
  velocityX: number,
  commitDistancePx: number,
): -1 | 0 | 1 {
  const absX = Math.abs(deltaX);
  const direction = deltaX < 0 ? 1 : -1;

  if (absX >= commitDistancePx) return direction;

  if (
    absX >= SWIPE_FLICK_MIN_DISTANCE_PX &&
    Math.abs(velocityX) >= SWIPE_FLICK_VELOCITY_PX_PER_MS &&
    Math.sign(velocityX) === Math.sign(deltaX)
  ) {
    return direction;
  }

  return 0;
}

export function pushSwipeSample(samples: SwipePointerSample[], x: number, timeMs: number): void {
  samples.push({ timeMs, x });
  while (samples.length > SWIPE_SAMPLE_CAP) samples.shift();

  let oldest = samples[0];
  while (samples.length > 1 && oldest && timeMs - oldest.timeMs > SWIPE_VELOCITY_WINDOW_MS) {
    samples.shift();
    oldest = samples[0];
  }
}

export function getSwipeVelocityX(samples: readonly SwipePointerSample[]): number {
  const oldest = samples[0];
  const newest = samples[samples.length - 1];
  if (!oldest || !newest || oldest === newest) return 0;

  const elapsedMs = newest.timeMs - oldest.timeMs;
  if (elapsedMs <= 0) return 0;

  return (newest.x - oldest.x) / elapsedMs;
}
