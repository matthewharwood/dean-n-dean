import type { AlchemistGuildGatheringTrackKind } from "@dean-stack/schemas";

// Display strings for the three learning paths. A leaf module so the path-map and
// the numeric/phonics panels share one source of truth without an import cycle.

export const GATHERING_TRACK_NAMES: Record<AlchemistGuildGatheringTrackKind, string> = {
  addition: "Addition",
  phonics: "Phonics",
  subtraction: "Subtraction",
};

export function getGatheringTrackLevelTitle(
  track: AlchemistGuildGatheringTrackKind,
  level: number,
): string {
  if (track === "phonics") {
    return level >= 2 ? "Phonics: More Vowel Sounds" : "Phonics: Vowel Sounds";
  }
  const range = level >= 2 ? "0–20" : "0–10";
  return `${GATHERING_TRACK_NAMES[track]} ${range}`;
}

const GATHERING_TRACK_BLURBS: Record<AlchemistGuildGatheringTrackKind, string> = {
  addition: "Add the two numbers, then grab the card that matches.",
  phonics: "Listen to the sound, then pick the word that has it.",
  subtraction: "Take the second number away, then grab the answer card.",
};

export function getGatheringTrackBlurb(track: AlchemistGuildGatheringTrackKind): string {
  return GATHERING_TRACK_BLURBS[track];
}

// Accessible labels for the two numeric operands, named for the operation.
export function getGatheringOperandLabels(operator: "+" | "-"): { left: string; right: string } {
  return operator === "-"
    ? { left: "Minuend", right: "Subtrahend" }
    : { left: "Left addend", right: "Right addend" };
}
