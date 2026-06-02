const QUEST_CURRENT_SWIPE_MIN_PX = 38;
const QUEST_CURRENT_INTENT_MIN_PX = 8;
const QUEST_CURRENT_VERTICAL_INTENT_MIN_PX = 10;
const QUEST_CURRENT_VERTICAL_INTENT_RATIO = 1.15;

export type QuestCurrentSwipeIntent = "horizontal" | "pending" | "vertical";

export function getQuestCurrentSwipeDirection(deltaX: number): -1 | 0 | 1 {
  if (Math.abs(deltaX) < QUEST_CURRENT_SWIPE_MIN_PX) return 0;
  if (deltaX < 0) return 1;
  return -1;
}

export function getQuestCurrentSwipeIntent(
  deltaX: number,
  deltaY: number,
): QuestCurrentSwipeIntent {
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (absX < QUEST_CURRENT_INTENT_MIN_PX && absY < QUEST_CURRENT_INTENT_MIN_PX) {
    return "pending";
  }

  if (
    absY >= QUEST_CURRENT_VERTICAL_INTENT_MIN_PX &&
    absY > absX * QUEST_CURRENT_VERTICAL_INTENT_RATIO
  ) {
    return "vertical";
  }

  if (absX >= QUEST_CURRENT_INTENT_MIN_PX && absX > absY) return "horizontal";

  return "pending";
}
