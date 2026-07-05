import type { AlchemistGuildGatheringTrackKind } from "@dean-stack/schemas";
import * as z from "zod";

import { defineComponent } from "~/lib/define-component";

import type { GatheringPathOption } from "./gathering-loop";
import {
  GATHERING_TRACK_NAMES,
  getGatheringTrackBlurb,
  getGatheringTrackLevelTitle,
} from "./gathering-track-display";

// The learning-path map — the first thing a gathering player sees. Pick a path to
// lock into it; you cannot switch until you beat that path's boss. A track only
// offers level 2 after its own level 1 is complete (the lock rule lives in
// `getGatheringPathMap`; this view just renders it).

const GatheringPathMapPropsSchema = z.object({
  onSelectTrack: z.custom<(track: AlchemistGuildGatheringTrackKind) => void>(),
  options: z.custom<readonly GatheringPathOption[]>(),
});

const TRACK_ACCENT: Record<AlchemistGuildGatheringTrackKind, string> = {
  addition: "border-sky-500/60 bg-sky-50",
  phonics: "border-fuchsia-500/60 bg-fuchsia-50",
  subtraction: "border-emerald-500/60 bg-emerald-50",
};

function getPathBadgeLabel(option: GatheringPathOption): string {
  if (option.isComplete) return "Mastered";
  return option.level === 2 ? "Level 2" : "Start";
}

export const GatheringPathMap = defineComponent(
  GatheringPathMapPropsSchema,
  ({ onSelectTrack, options }) => (
    <div className="pointer-events-auto grid h-full min-h-0 place-items-center p-6">
      <div className="grid w-full max-w-[44rem] gap-5 text-center">
        <header className="grid gap-1">
          <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-950">
            Choose a Learning Path
          </h2>
          <p className="text-sm font-bold text-neutral-700">
            Pick a path to start. You can switch paths once you beat its boss.
          </p>
        </header>
        <ul className="grid gap-3">
          {options.map((option) => {
            const name = GATHERING_TRACK_NAMES[option.track];
            const title = option.isComplete
              ? `${name} — Mastered`
              : getGatheringTrackLevelTitle(option.track, option.level ?? 1);
            return (
              <li key={option.track}>
                <button
                  type="button"
                  data-gathering-path-track={option.track}
                  data-gathering-path-level={option.level ?? ""}
                  disabled={option.isComplete}
                  onClick={() => onSelectTrack(option.track)}
                  className={`grid w-full gap-1 rounded-[10px] border-2 p-4 text-left shadow-[0_8px_18px_rgba(15,23,42,0.10)] transition-[transform,box-shadow] duration-150 ${
                    option.isComplete
                      ? "cursor-default border-neutral-300 bg-neutral-100 opacity-70"
                      : `${TRACK_ACCENT[option.track]} hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(15,23,42,0.16)]`
                  }`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-lg font-black text-neutral-950">{title}</span>
                    <span className="rounded-full border border-neutral-900/15 bg-white/80 px-2 py-1 text-[10px] font-black uppercase text-neutral-700">
                      {getPathBadgeLabel(option)}
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-neutral-700">
                    {getGatheringTrackBlurb(option.track)}
                  </span>
                  {option.completedLevels.length > 0 ? (
                    <span className="text-[11px] font-black uppercase text-neutral-500">
                      Beaten: level {option.completedLevels.toSorted().join(", ")}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  ),
);
