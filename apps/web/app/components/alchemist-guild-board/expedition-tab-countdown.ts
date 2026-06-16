import type { AlchemistGuildExpeditionState } from "@dean-stack/schemas";

// Compact "M:SS" countdown shown on the expedition board-mode tab while a run is
// in flight, so the player can glance at the tab (from any mode) and see how long
// is left. Returns null when no expedition is running OR it has already arrived —
// the tab's reveal/nudge owns the "ready" beat, so the tab only ever shows a
// ticking-down clock, never 0:00. Pure; the live `nowMs` clock is supplied by the
// caller.
export function getExpeditionTabCountdownLabel(
  expedition: AlchemistGuildExpeditionState,
  nowMs: number,
): string | null {
  // `null` is the "no run" sentinel — check it explicitly so a startedAtMs of 0
  // (a valid epoch timestamp) isn't mistaken for "not started".
  if (expedition.startedAtMs === null || expedition.readyAtMs === null) return null;
  const remainingMs = expedition.readyAtMs - nowMs;
  if (remainingMs <= 0) return null;
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
