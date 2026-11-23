import type { PointerEventHandler, ReactNode, RefObject } from "react";
import { useId } from "react";
import * as z from "zod";

import { defineComponent } from "~/lib/define-component";

import "./gem-swipe-control.css";

const GemSwipePurposeSchema = z.enum(["answer", "quest-reward", "transmute"]);
const GemSwipeSizeSchema = z.enum(["compact", "large", "standard"]);

const GemSwipeControlPropsSchema = z.object({
  ariaLabel: z.string().min(1),
  boardDescription: z.string().min(1).optional(),
  children: z.custom<ReactNode>(),
  completed: z.boolean(),
  disabled: z.boolean(),
  isDragging: z.boolean(),
  onKeyboardCommit: z.custom<() => void>().optional(),
  onPointerDown: z.custom<PointerEventHandler<HTMLButtonElement>>().optional(),
  progress: z.number().min(0).max(1),
  purpose: GemSwipePurposeSchema,
  size: GemSwipeSizeSchema,
  status: z.string().min(1).optional(),
  trackRef: z.custom<RefObject<HTMLDivElement | null>>().optional(),
});

const GEM_SWIPE_METRICS = {
  compact: { paddingPx: 6, thumbWidthPx: 72 },
  large: { paddingPx: 12, thumbWidthPx: 76 },
  standard: { paddingPx: 12, thumbWidthPx: 72 },
} as const;

const GEM_SWIPE_NAMES = {
  answer: {
    knob: "Gathering answer confirm handle",
    knobSection: "gathering-answer-confirm-handle",
    track: "Gathering answer confirm pad",
    trackSection: "gathering-answer-confirm-pad",
  },
  "quest-reward": {
    knob: "Quest reward claim gem",
    knobSection: "quest-claim-handle",
    track: "Quest reward claim channel",
    trackSection: "quest-claim-swipe",
  },
  transmute: {
    knob: "Swipe rune handle",
    knobSection: "swipe-rune-handle",
    track: "Transmutation Pad",
    trackSection: "transmutation-pad",
  },
} as const;

export function getGemSwipeMetrics(size: z.infer<typeof GemSwipeSizeSchema>): {
  paddingPx: number;
  thumbWidthPx: number;
} {
  return GEM_SWIPE_METRICS[size];
}

export function getGemSwipeTravelPx(
  trackWidthPx: number,
  size: z.infer<typeof GemSwipeSizeSchema>,
): number {
  const { paddingPx, thumbWidthPx } = getGemSwipeMetrics(size);
  return Math.max(0, trackWidthPx - thumbWidthPx - paddingPx * 2);
}

export const GemSwipeControl = defineComponent(
  GemSwipeControlPropsSchema,
  ({
    ariaLabel,
    boardDescription,
    children,
    completed,
    disabled,
    isDragging,
    onKeyboardCommit,
    onPointerDown,
    progress,
    purpose,
    size,
    status,
    trackRef,
  }) => {
    const instructionId = useId();
    const metrics = getGemSwipeMetrics(size);
    const names = GEM_SWIPE_NAMES[purpose];
    const thumbLeft = `calc(${metrics.paddingPx}px + ${progress * 100}% - ${
      progress * (metrics.thumbWidthPx + metrics.paddingPx * 2)
    }px)`;

    return (
      <div
        ref={trackRef}
        data-board-description={boardDescription}
        data-board-name={names.track}
        data-board-section={names.trackSection}
        data-claim-locked={purpose === "quest-reward" ? String(disabled) : undefined}
        data-completed={completed ? "true" : "false"}
        data-confirm-ready={purpose === "answer" ? String(!disabled) : undefined}
        data-confirm-status={purpose === "answer" ? status : undefined}
        data-disabled={disabled ? "true" : "false"}
        data-dragging={isDragging ? "true" : "false"}
        data-purpose={purpose}
        data-size={size}
        data-swipe-progress={progress.toFixed(2)}
        data-transmutation-ready={purpose === "transmute" ? String(!disabled) : undefined}
        className={`gem-swipe-control gem-swipe-control-${size}`}
      >
        <span className="gem-swipe-control-well" aria-hidden="true">
          <span
            className="gem-swipe-control-charge"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </span>
        {children}
        <button
          type="button"
          aria-describedby={instructionId}
          aria-keyshortcuts="Enter Space End ArrowRight"
          aria-label={ariaLabel}
          data-board-name={names.knob}
          data-board-section={names.knobSection}
          data-quest-claim-knob={purpose === "quest-reward" ? "" : undefined}
          disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          className="gem-swipe-control-thumb"
          style={{
            left: thumbLeft,
            transition: isDragging ? "none" : "left 220ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            width: `${metrics.thumbWidthPx}px`,
          }}
          onKeyDown={(event) => {
            if (disabled || event.repeat || !onKeyboardCommit) return;
            if (
              event.key !== "Enter" &&
              event.key !== " " &&
              event.key !== "End" &&
              event.key !== "ArrowRight"
            ) {
              return;
            }
            event.preventDefault();
            onKeyboardCommit();
          }}
          onPointerDown={disabled ? undefined : onPointerDown}
        >
          <span className="gem-swipe-control-setting" aria-hidden="true">
            <img
              alt=""
              className="gem-swipe-control-gem"
              draggable={false}
              src={`${import.meta.env.BASE_URL}gem-ui/emerald-slider-thumb.png`}
            />
          </span>
        </button>
        <span id={instructionId} className="sr-only">
          Drag the emerald to the right, or press Enter, Space, End, or Right Arrow to confirm.
        </span>
      </div>
    );
  },
);
