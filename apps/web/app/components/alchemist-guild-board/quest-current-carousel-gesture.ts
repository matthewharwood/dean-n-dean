import {
  type CarouselSwipeIntent,
  getCarouselSwipeCommitDirection,
  getCarouselSwipeIntent,
} from "./carousel-swipe";

const QUEST_CURRENT_SWIPE_MIN_PX = 38;

export type QuestCurrentSwipeIntent = CarouselSwipeIntent;

export function getQuestCurrentSwipeDirection(deltaX: number, velocityX = 0): -1 | 0 | 1 {
  return getCarouselSwipeCommitDirection(deltaX, velocityX, QUEST_CURRENT_SWIPE_MIN_PX);
}

export function getQuestCurrentSwipeIntent(
  deltaX: number,
  deltaY: number,
  pointerType?: string,
): QuestCurrentSwipeIntent {
  return getCarouselSwipeIntent(deltaX, deltaY, pointerType);
}
