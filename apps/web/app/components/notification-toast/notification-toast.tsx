import { animate } from "animejs";
import { Compass, PartyPopper, Sparkles } from "lucide-react";
import { useEffect, useLayoutEffect, useRef } from "react";
import * as z from "zod";

import { defineComponent } from "~/lib/define-component";
import { sfx } from "~/sound/sfx";
import {
  type AppNotification,
  type AppNotificationTone,
  NOTIFICATION_TOAST_DURATION_MS,
} from "./notification-channel";

// A single toast: slides in, plays a "show" chime, depletes an 8-second progress
// bar, and auto-dismisses (or the kid swipes/taps it away early), sliding out with
// a "hide" sound. anime.js is a side channel — all motion in effects/handlers,
// short-circuited under prefers-reduced-motion (the toast still appears + the bar
// still depletes, since the bar is information, not decoration).

const PRM = "(prefers-reduced-motion: reduce)";
const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(PRM).matches;
}

const SWIPE_DISMISS_PX = 90;

const TONE_ICON: Record<AppNotificationTone, typeof Sparkles> = {
  celebrate: PartyPopper,
  info: Compass,
  success: Sparkles,
};

// Accent is a hex CSS var (not theme()/opacity-on-var, which are fragile in
// arbitrary values) consumed by the icon, progress bar, and border tint.
const TONE_ACCENT: Record<AppNotificationTone, string> = {
  celebrate: "border-fuchsia-300/50 [--toast-accent:#e879f9]",
  info: "border-sky-300/50 [--toast-accent:#38bdf8]",
  success: "border-emerald-300/50 [--toast-accent:#34d399]",
};

const NotificationToastPropsSchema = z.object({
  durationMs: z.number().positive().default(NOTIFICATION_TOAST_DURATION_MS),
  notification: z.custom<AppNotification>(),
  onDismiss: z.custom<(id: string) => void>(),
});

export const NotificationToast = defineComponent(
  NotificationToastPropsSchema,
  ({ durationMs, notification, onDismiss }) => {
    const toastRef = useRef<HTMLDivElement | null>(null);
    const progressRef = useRef<HTMLDivElement | null>(null);
    const dismissedRef = useRef(false);
    const dragXRef = useRef(0);
    const onDismissRef = useRef(onDismiss);

    useEffect(() => {
      onDismissRef.current = onDismiss;
    });

    const dismiss = () => {
      if (dismissedRef.current) return;
      dismissedRef.current = true;
      void sfx.play("notification.hide");
      const toastElement = toastRef.current;
      if (!toastElement || prefersReducedMotion()) {
        onDismissRef.current(notification.id);
        return;
      }
      const exitX = dragXRef.current >= 0 ? 380 : -380;
      animate(toastElement, {
        duration: 240,
        ease: "in(2)",
        opacity: [toastElement.style.opacity === "" ? 1 : Number(toastElement.style.opacity), 0],
        x: [dragXRef.current, exitX],
        onComplete: () => onDismissRef.current(notification.id),
      });
    };

    // Enter + "show" sound + the 8-second life timer.
    useBrowserLayoutEffect(() => {
      void sfx.play("notification.show");
      const toastElement = toastRef.current;
      const progressElement = progressRef.current;

      if (progressElement) {
        // The progress bar is informational, so it runs even under reduced motion
        // (a CSS width transition, not a vestibular animation).
        progressElement.style.transition = "none";
        progressElement.style.width = "100%";
        void progressElement.offsetWidth; // reflow so the next change transitions
        progressElement.style.transition = `width ${durationMs}ms linear`;
        progressElement.style.width = "0%";
      }

      let enter: ReturnType<typeof animate> | null = null;
      if (toastElement && !prefersReducedMotion()) {
        enter = animate(toastElement, {
          duration: 340,
          ease: "out(3)",
          opacity: [0, 1],
          scale: [0.94, 1],
          x: [44, 0],
        });
      }

      const life = setTimeout(dismiss, durationMs);
      return () => {
        clearTimeout(life);
        enter?.cancel();
      };
      // dismiss is stable for this toast instance; durationMs is fixed per mount.
    }, [durationMs]);

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      if (dismissedRef.current) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      dragXRef.current = 0;
      const startX = event.clientX;
      const toastElement = toastRef.current;

      const move = (moveEvent: PointerEvent) => {
        dragXRef.current = moveEvent.clientX - startX;
        if (toastElement) {
          toastElement.style.transform = `translateX(${dragXRef.current}px)`;
          toastElement.style.opacity = `${Math.max(0.2, 1 - Math.abs(dragXRef.current) / 260)}`;
        }
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        if (Math.abs(dragXRef.current) >= SWIPE_DISMISS_PX) {
          dismiss();
        } else if (toastElement && !prefersReducedMotion()) {
          animate(toastElement, {
            duration: 220,
            ease: "out(3)",
            opacity: 1,
            x: [dragXRef.current, 0],
          });
          dragXRef.current = 0;
        } else if (toastElement) {
          toastElement.style.transform = "";
          toastElement.style.opacity = "";
          dragXRef.current = 0;
        }
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    };

    const ToneIcon = TONE_ICON[notification.tone];

    return (
      <div
        ref={toastRef}
        role="status"
        aria-live="polite"
        data-board-section="notification-toast"
        data-notification-id={notification.id}
        data-notification-tone={notification.tone}
        className={`pointer-events-auto relative grid w-[min(22rem,calc(100vw-1.5rem))] cursor-grab touch-pan-y grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 overflow-hidden rounded-[12px] border bg-slate-900/92 p-3 pr-2 shadow-[0_18px_44px_rgba(15,23,42,0.4)] active:cursor-grabbing ${TONE_ACCENT[notification.tone]}`}
        onPointerDown={handlePointerDown}
      >
        <span className="grid size-9 place-items-center rounded-full bg-white/10 text-[var(--toast-accent)]">
          <ToneIcon className="size-5" strokeWidth={2.4} aria-hidden="true" />
        </span>
        <span className="grid gap-0.5 pt-0.5">
          <span className="text-sm font-black leading-tight text-white">{notification.title}</span>
          {notification.body ? (
            <span className="text-xs font-medium leading-snug text-white/65">
              {notification.body}
            </span>
          ) : null}
        </span>
        <button
          type="button"
          data-board-section="notification-toast-close"
          aria-label="Dismiss notification"
          className="grid size-7 place-items-center rounded-full text-white/55 transition-colors hover:bg-white/10 hover:text-white"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={dismiss}
        >
          <span aria-hidden="true" className="text-lg leading-none">
            ×
          </span>
        </button>
        <span className="pointer-events-none absolute inset-x-0 bottom-0 col-span-full h-1 bg-white/10">
          <span ref={progressRef} className="block h-full w-full bg-[var(--toast-accent)]" />
        </span>
      </div>
    );
  },
);
