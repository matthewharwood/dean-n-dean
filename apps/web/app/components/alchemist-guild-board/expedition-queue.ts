import { type AlchemistGuildExpeditionState, EXPEDITION_QUEUE_MAX } from "@dean-stack/schemas";

// Pure expedition-queue logic (the Expedition Queue upgrade). The ACTIVE run is
// `targetCardId`; `queuedTargetCardIds` are lined up behind it and auto-start as
// each active run is claimed or cancelled. "In flight" = active + queued, capped
// at EXPEDITION_QUEUE_MAX so a kid can line up at most three at once.

export function expeditionInFlightCount(expedition: AlchemistGuildExpeditionState): number {
  return (expedition.targetCardId ? 1 : 0) + expedition.queuedTargetCardIds.length;
}

/** Whether another target can be queued (upgrade on + under the cap). */
export function canQueueExpedition(
  expedition: AlchemistGuildExpeditionState,
  queueUpgradeUnlocked: boolean,
): boolean {
  return queueUpgradeUnlocked && expeditionInFlightCount(expedition) < EXPEDITION_QUEUE_MAX;
}

function startActive(
  expedition: AlchemistGuildExpeditionState,
  cardId: string,
  nowMs: number,
  durationMs: number,
): AlchemistGuildExpeditionState {
  return {
    ...expedition,
    readyAtMs: nowMs + durationMs,
    readyNotified: false,
    startedAtMs: nowMs,
    targetCardId: cardId,
    unlockSeen: true,
  };
}

/**
 * Start a fresh run if the dock is idle, otherwise queue behind the active one.
 * Returns the expedition unchanged if it's full / can't be queued.
 */
export function startOrEnqueueExpedition(
  expedition: AlchemistGuildExpeditionState,
  cardId: string,
  queueUpgradeUnlocked: boolean,
  nowMs: number,
  durationMs: number,
): AlchemistGuildExpeditionState {
  if (expedition.targetCardId === null) {
    return startActive(expedition, cardId, nowMs, durationMs);
  }
  if (!canQueueExpedition(expedition, queueUpgradeUnlocked)) return expedition;
  return { ...expedition, queuedTargetCardIds: [...expedition.queuedTargetCardIds, cardId] };
}

/**
 * Free the active slot (on claim or cancel) and auto-start the next queued run, or
 * clear the dock if the queue is empty.
 */
export function advanceExpeditionQueue(
  expedition: AlchemistGuildExpeditionState,
  nowMs: number,
  durationMs: number,
): AlchemistGuildExpeditionState {
  const [next, ...rest] = expedition.queuedTargetCardIds;
  if (next === undefined) {
    return {
      ...expedition,
      readyAtMs: null,
      readyNotified: false,
      startedAtMs: null,
      targetCardId: null,
    };
  }
  return { ...startActive(expedition, next, nowMs, durationMs), queuedTargetCardIds: rest };
}

/** Drop a not-yet-started target from the queue (the first matching one). */
export function removeQueuedExpedition(
  expedition: AlchemistGuildExpeditionState,
  cardId: string,
): AlchemistGuildExpeditionState {
  const index = expedition.queuedTargetCardIds.indexOf(cardId);
  if (index < 0) return expedition;
  const queuedTargetCardIds = [...expedition.queuedTargetCardIds];
  queuedTargetCardIds.splice(index, 1);
  return { ...expedition, queuedTargetCardIds };
}
