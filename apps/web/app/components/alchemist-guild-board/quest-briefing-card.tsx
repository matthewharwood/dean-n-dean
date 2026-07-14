import {
  ALCHEMIST_GUILD_FIRST_WATER_QUEST_ID,
  ELEMENT_CARDS,
  getAlchemyCharactersByRequester,
  getAlchemyQuestById,
  getAlchemyRecipeById,
  getAlchemyRecipeByOutput,
  getQuestRequesterVoiceClipPath,
  type StaticAlchemyQuest,
  type StaticAlchemyRecipe,
} from "@dean-stack/schemas";
import { animate, type JSAnimation } from "animejs";
import {
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CloudFog,
  Coins,
  LockKeyhole,
  type LucideIcon,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  Fragment,
  type MutableRefObject,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import * as z from "zod";

import { defineComponent } from "~/lib/define-component";

import {
  type CarouselSwipeIntent,
  getCarouselSwipeCommitDirection,
  getCarouselSwipeIntent,
  getSwipeVelocityX,
  pushSwipeSample,
  type SwipePointerSample,
} from "./carousel-swipe";

const PRM = "(prefers-reduced-motion: reduce)";
const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const QUEST_CARD_ID_PATTERN = /^quest:[a-z0-9-]+$/;
const PUBLIC_PATH_PATTERN = /^[a-z0-9-/]+\.webp$/;
const PUBLIC_AUDIO_PATH_PATTERN = /^[a-z0-9-]+\/[a-z0-9-]+\.mp3$/;
const CARD_ID_PREFIX_PATTERN = /^[a-z-]+:/;
const QUEST_CAROUSEL_DOTS = ["training", "recipe", "teaching"] as const;
const QUEST_CAROUSEL_SLIDE_COUNT = QUEST_CAROUSEL_DOTS.length;
const QUEST_CAROUSEL_INITIAL_INDEX = 1;
const QUEST_CAROUSEL_FIRST_SLIDE_INDEX = 0;
const QUEST_CAROUSEL_LAST_SLIDE_INDEX = QUEST_CAROUSEL_SLIDE_COUNT - 1;
const QUEST_CAROUSEL_SWIPE_MIN_PX = 34;
const QUEST_CAROUSEL_EDGE_RESISTANCE = 0.32;
const QUEST_CAROUSEL_SNAP_DURATION_MS = 230;

type QuestCarouselSwipeIntent = CarouselSwipeIntent;

type QuestCarouselSwipe = {
  activeIndex: number;
  animationFrame: number;
  captureElement: HTMLDivElement;
  horizontalActive: boolean;
  interceptDeltaX: number;
  latestDeltaX: number;
  pointerId: number;
  samples: SwipePointerSample[];
  slideWidth: number;
  startClientX: number;
  startClientY: number;
  trackElement: HTMLDivElement;
};

const QUEST_CAROUSEL_POINTER_LISTENER_OPTIONS = {
  capture: true,
  passive: false,
} satisfies AddEventListenerOptions;
const QUEST_CAROUSEL_POINTER_LISTENER_CAPTURE = true;

const QuestBriefingRewardIconSchema = z.enum(["gold", "knowledge", "discovery", "muddlefog"]);
type QuestBriefingRewardIcon = z.infer<typeof QuestBriefingRewardIconSchema>;

const REWARD_ICONS = {
  discovery: Sparkles,
  gold: Coins,
  knowledge: Brain,
  muddlefog: CloudFog,
} satisfies Record<QuestBriefingRewardIcon, LucideIcon>;

const QuestBriefingRewardSchema = z.object({
  icon: QuestBriefingRewardIconSchema,
  label: z.string().min(1),
  value: z.string().min(1),
});

export const QuestBriefingFocusRequestSchema = z.object({
  cardId: z.string().min(1),
  requestId: z.int().min(1),
});
export type QuestBriefingFocusRequest = z.infer<typeof QuestBriefingFocusRequestSchema>;

const QuestBriefingRecipeIngredientSchema = z.object({
  cardId: z.string().min(1),
  name: z.string().min(1),
  quantity: z.int().min(1),
  symbol: z.string().min(1),
});

const QuestBriefingRecipeSchema = z.object({
  formula: z.string().min(1),
  imagePath: z.string().regex(PUBLIC_PATH_PATTERN),
  ingredients: z.array(QuestBriefingRecipeIngredientSchema).min(1),
  name: z.string().min(1),
  outputCardId: z.string().min(1),
});
type QuestBriefingRecipe = z.infer<typeof QuestBriefingRecipeSchema>;

export const QuestBriefingCardPropsSchema = z.object({
  actLabel: z.string().min(1),
  developerNotesVisible: z.boolean(),
  focusRequest: QuestBriefingFocusRequestSchema.nullable().optional(),
  hint: z.string().min(1),
  id: z.string().regex(QUEST_CARD_ID_PATTERN),
  completed: z.boolean().optional(),
  need: z.string().min(1),
  onCarouselEdgeSwipe: z.custom<(direction: -1 | 1) => void>().optional(),
  recipeLabels: z.array(QuestBriefingRecipeSchema).min(1),
  redacted: z.boolean(),
  requesterAvatarPath: z.string().regex(PUBLIC_PATH_PATTERN).nullable(),
  requesterName: z.string().min(1),
  requesterTitle: z.string().min(1),
  requesterVoiceClipPath: z.string().regex(PUBLIC_AUDIO_PATH_PATTERN).nullable(),
  rewards: z.array(QuestBriefingRewardSchema).min(1),
  slotLabel: z.string().min(1),
  statusLabel: z.string().min(1),
  summary: z.string().min(1),
  teachingFocus: z.array(z.string().min(1)).min(1),
  title: z.string().min(1),
});
export type QuestBriefingCardProps = z.infer<typeof QuestBriefingCardPropsSchema>;

// Quest data is static, so the projection is cached per quest id: the outer
// carousel rebuilds three cards per render and the recursive recipe walk +
// Zod parse would otherwise land exactly on the swipe-settle frame.
const questBriefingCardPropsCache = new Map<string, QuestBriefingCardProps>();

export const FIRST_QUEST_BRIEFING_CARD_PROPS = createFirstQuestBriefingCardProps();

export const QuestBriefingCard = defineComponent(
  QuestBriefingCardPropsSchema,
  ({
    actLabel,
    developerNotesVisible,
    focusRequest = null,
    hint,
    id,
    completed = false,
    need,
    onCarouselEdgeSwipe,
    redacted,
    recipeLabels,
    requesterAvatarPath,
    requesterName,
    requesterTitle,
    requesterVoiceClipPath,
    rewards,
    slotLabel,
    statusLabel,
    summary,
    teachingFocus,
    title,
  }) => (
    <article
      data-board-section="quest-briefing-card"
      data-board-name={title}
      data-quest-card-id={id}
      data-quest-completed={completed ? "true" : "false"}
      className={`relative flex h-full min-h-0 flex-col gap-2.5 overflow-hidden rounded-[6px] border p-3 text-neutral-950 backdrop-blur-sm ${
        completed
          ? "border-emerald-700/70 bg-emerald-50/78 shadow-[inset_0_0_0_3px_rgba(16,185,129,0.14),0_2px_0_rgba(72,45,16,0.14)]"
          : "border-amber-500/70 bg-white/60 shadow-[0_2px_0_rgba(72,45,16,0.14)]"
      }`}
      aria-labelledby={`${id}-title`}
    >
      <header className="grid grid-cols-[3rem_1fr] gap-2.5">
        <div className="relative size-12">
          <QuestRequesterAvatar
            redacted={redacted}
            requesterAvatarPath={requesterAvatarPath}
            requesterName={requesterName}
          />
          {!redacted && requesterVoiceClipPath ? (
            <QuestRequesterVoiceButton
              requesterName={requesterName}
              voiceClipPath={requesterVoiceClipPath}
            />
          ) : null}
        </div>
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap gap-1.5">
            <span
              className={`rounded-[3px] px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-normal text-white ${getQuestBriefingStatusClass(
                redacted,
                completed,
              )}`}
            >
              {getQuestBriefingStatusLabel(redacted, completed, statusLabel)}
            </span>
            <span className="rounded-[3px] bg-sky-800 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-normal text-white">
              {slotLabel}
            </span>
          </div>
          <p className="text-[11px] font-semibold uppercase leading-tight tracking-normal text-amber-950/75">
            {actLabel}
          </p>
          <h2 id={`${id}-title`} className="font-serif text-lg leading-tight text-amber-950">
            {redacted ? "Redacted Quest" : title}
          </h2>
        </div>
      </header>

      {completed ? <QuestBriefingCompletedBanner /> : null}

      <div className="min-h-0 flex-1">
        {redacted ? (
          <QuestBriefingRedactedPanel />
        ) : (
          <QuestBriefingCarousel
            developerNotesVisible={developerNotesVisible}
            focusRequest={focusRequest}
            hint={hint}
            initialSlideIndex={getQuestBriefingInitialSlideIndex(id)}
            need={need}
            onEdgeSwipe={onCarouselEdgeSwipe}
            recipes={recipeLabels}
            requesterName={requesterName}
            requesterTitle={requesterTitle}
            summary={summary}
            teachingFocus={teachingFocus}
          />
        )}
      </div>

      <footer className="grid h-9 min-h-0 grid-cols-4 overflow-hidden rounded-[4px] border border-amber-500/40 bg-white/65">
        {rewards.map((reward, index) => {
          const RewardIcon = REWARD_ICONS[reward.icon];
          return (
            <div
              key={reward.label}
              data-reward-kind={reward.icon}
              className={`grid min-w-0 grid-rows-[1fr_auto] place-items-center gap-0.5 px-1 py-1 ${
                index === 0 ? "" : "border-l border-amber-500/40"
              }`}
            >
              <span className="sr-only">
                {reward.value} {reward.label}
              </span>
              <RewardIcon aria-hidden="true" className="size-3.5 stroke-[2.5] text-amber-950" />
              <span aria-hidden="true" className="text-[11px] font-black leading-none">
                {redacted ? "?" : reward.value}
              </span>
            </div>
          );
        })}
      </footer>
    </article>
  ),
);

const QuestBriefingCompletedBanner = defineComponent(z.object({}), () => (
  <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-[5px] border border-emerald-700/35 bg-emerald-100/85 px-2.5 py-2 text-emerald-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
    <span
      className="grid size-7 place-items-center rounded-full bg-emerald-700 text-white"
      aria-hidden="true"
    >
      <CheckCircle2 className="size-4.5" strokeWidth={2.7} />
    </span>
    <span className="min-w-0">
      <span className="block text-xs font-black uppercase leading-none tracking-normal">
        Quest completed
      </span>
      <span className="mt-1 block text-[11px] font-bold leading-tight">
        You can still review the briefing, recipe, and lesson.
      </span>
    </span>
  </div>
));

const QuestRequesterAvatarPropsSchema = z.object({
  redacted: z.boolean(),
  requesterAvatarPath: z.string().regex(PUBLIC_PATH_PATTERN).nullable(),
  requesterName: z.string().min(1),
});

const QuestRequesterAvatar = defineComponent(
  QuestRequesterAvatarPropsSchema,
  ({ redacted, requesterAvatarPath, requesterName }) => {
    let content: ReactNode = (
      <span className="grid size-full place-items-center text-lg font-bold">
        {requesterName.slice(0, 1)}
      </span>
    );

    if (requesterAvatarPath) {
      content = (
        <img
          src={resolvePublicAssetPath(requesterAvatarPath)}
          alt={`${requesterName} avatar`}
          className="size-full object-cover"
          draggable={false}
        />
      );
    }

    if (redacted) {
      content = (
        <span className="grid size-full place-items-center text-amber-950/65">
          <LockKeyhole className="size-5" strokeWidth={2.4} />
        </span>
      );
    }

    return (
      <div className="relative size-12 overflow-hidden rounded-[4px] border border-amber-500/55 bg-white/70">
        {content}
      </div>
    );
  },
);

const QuestRequesterVoiceButtonPropsSchema = z.object({
  requesterName: z.string().min(1),
  voiceClipPath: z.string().regex(PUBLIC_AUDIO_PATH_PATTERN),
});

// Tiny speaker affordance on the requester avatar. Audio is a side channel: the
// HTMLAudioElement is created and driven inside the click handler / cleanup effect,
// never during render (same rule as anime.js and Pixi).
const QuestRequesterVoiceButton = defineComponent(
  QuestRequesterVoiceButtonPropsSchema,
  ({ requesterName, voiceClipPath }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playing, setPlaying] = useState(false);

    useEffect(
      () => () => {
        audioRef.current?.pause();
        audioRef.current = null;
      },
      [],
    );

    const handleClick = () => {
      const existing = audioRef.current;
      if (existing && !existing.paused) {
        existing.pause();
        existing.currentTime = 0;
        setPlaying(false);
        return;
      }

      const audio = existing ?? new Audio(resolvePublicAssetPath(voiceClipPath));
      if (!existing) {
        audio.addEventListener("ended", () => {
          setPlaying(false);
        });
        audioRef.current = audio;
      }
      audio.currentTime = 0;
      setPlaying(true);
      void audio.play().catch(() => {
        setPlaying(false);
      });
    };

    return (
      <button
        type="button"
        data-quest-voice-button=""
        data-playing={playing ? "true" : "false"}
        aria-label={`Play ${requesterName}'s voice`}
        onClick={handleClick}
        className={`absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full border border-amber-500/70 text-amber-950 shadow-[0_1px_2px_rgba(72,45,16,0.3)] transition-transform hover:scale-110 ${
          playing ? "scale-110 bg-amber-200 ring-2 ring-amber-400" : "bg-white"
        }`}
      >
        {playing ? (
          <VolumeX aria-hidden="true" className="size-3" strokeWidth={2.6} />
        ) : (
          <Volume2 aria-hidden="true" className="size-3" strokeWidth={2.6} />
        )}
      </button>
    );
  },
);

const QuestBriefingCarouselPropsSchema = z.object({
  developerNotesVisible: z.boolean(),
  focusRequest: QuestBriefingFocusRequestSchema.nullable(),
  hint: z.string().min(1),
  initialSlideIndex: z.int().min(0).max(QUEST_CAROUSEL_LAST_SLIDE_INDEX),
  need: z.string().min(1),
  onEdgeSwipe: z.custom<(direction: -1 | 1) => void>().optional(),
  recipes: z.array(QuestBriefingRecipeSchema).min(1),
  requesterName: z.string().min(1),
  requesterTitle: z.string().min(1),
  summary: z.string().min(1),
  teachingFocus: z.array(z.string().min(1)).min(1),
});

const QuestBriefingRedactedPanel = defineComponent(z.object({}), () => (
  <section
    className="grid h-full min-h-[11rem] content-center gap-3 overflow-hidden rounded-[4px] border border-amber-500/40 bg-white/65 p-3"
    aria-label="Locked quest details"
  >
    <div className="mx-auto grid size-12 place-items-center rounded-full border border-neutral-900/15 bg-white/70 text-neutral-700">
      <LockKeyhole className="size-5" strokeWidth={2.4} />
    </div>
    <div className="grid gap-1.5" aria-hidden="true">
      <span className="h-2.5 rounded-full bg-neutral-900/18" />
      <span className="h-2.5 w-5/6 rounded-full bg-neutral-900/14" />
      <span className="h-2.5 w-2/3 rounded-full bg-neutral-900/12" />
    </div>
    <p className="text-center text-xs font-semibold leading-snug text-neutral-700">
      Complete earlier guild work to reveal this request.
    </p>
    <p className="text-center text-[10px] font-black uppercase leading-none tracking-normal text-neutral-700">
      Quest sealed
    </p>
  </section>
));

const QuestBriefingCarousel = defineComponent(
  QuestBriefingCarouselPropsSchema,
  ({
    developerNotesVisible,
    focusRequest,
    hint,
    initialSlideIndex,
    need,
    onEdgeSwipe,
    recipes,
    requesterName,
    requesterTitle,
    summary,
    teachingFocus,
  }) => {
    const viewportRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const activeSlideIndexRef = useRef(initialSlideIndex);
    const swipeRef = useRef<QuestCarouselSwipe | null>(null);
    const snapAnimationRef = useRef<JSAnimation | null>(null);
    const removePointerListenersRef = useRef<(() => void) | null>(null);
    const [activeSlideIndex, setActiveSlideIndex] = useState(initialSlideIndex);

    const settleSlide = (index: number, animated: boolean) => {
      const nextIndex = clampCarouselIndex(index);
      activeSlideIndexRef.current = nextIndex;
      setActiveSlideIndex(nextIndex);
      snapQuestCarouselTrack({
        animated,
        animationRef: snapAnimationRef,
        index: nextIndex,
        slideWidth: viewportRef.current?.getBoundingClientRect().width ?? 0,
        trackElement: trackRef.current,
      });
    };

    const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || !event.isPrimary || swipeRef.current) return;
      const trackElement = trackRef.current;
      if (!trackElement) return;

      const slideWidth = event.currentTarget.getBoundingClientRect().width;
      if (slideWidth <= 0) return;

      removePointerListenersRef.current?.();
      snapAnimationRef.current?.cancel();
      snapAnimationRef.current = null;
      setQuestCarouselTrackX(
        trackElement,
        getQuestCarouselSnapX(activeSlideIndexRef.current, slideWidth),
      );

      swipeRef.current = {
        activeIndex: activeSlideIndexRef.current,
        animationFrame: 0,
        captureElement: event.currentTarget,
        horizontalActive: false,
        interceptDeltaX: 0,
        latestDeltaX: 0,
        pointerId: event.pointerId,
        samples: [{ timeMs: event.timeStamp, x: event.clientX }],
        slideWidth,
        startClientX: event.clientX,
        startClientY: event.clientY,
        trackElement,
      };
      removePointerListenersRef.current = addQuestCarouselPointerListeners(
        handlePointerMove,
        handlePointerUp,
        handlePointerCancel,
        handleNativeTouchMove,
      );
    };

    const paintDrag = () => {
      const swipe = swipeRef.current;
      if (!swipe) return;

      swipe.animationFrame = 0;
      const resistedDeltaX = getResistedCarouselDeltaX(swipe);
      setQuestCarouselTrackX(
        swipe.trackElement,
        getQuestCarouselSnapX(swipe.activeIndex, swipe.slideWidth) + resistedDeltaX,
      );
    };

    const queueDragPaint = () => {
      const swipe = swipeRef.current;
      if (!swipe || swipe.animationFrame !== 0) return;
      swipe.animationFrame = requestAnimationFrame(paintDrag);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const swipe = swipeRef.current;
      if (!swipe || event.pointerId !== swipe.pointerId) return;
      if (event.buttons === 0) {
        handlePointerCancel(event);
        return;
      }

      const latestDeltaX = event.clientX - swipe.startClientX;
      const latestDeltaY = event.clientY - swipe.startClientY;
      let justLockedHorizontal = false;
      if (!swipe.horizontalActive) {
        const intent = getQuestCarouselSwipeIntent(latestDeltaX, latestDeltaY, event.pointerType);
        if (intent === "pending") return;
        if (intent === "vertical") {
          removePointerListenersRef.current?.();
          removePointerListenersRef.current = null;
          if (swipe.animationFrame !== 0) cancelAnimationFrame(swipe.animationFrame);
          swipeRef.current = null;
          if (swipe.captureElement.hasPointerCapture(event.pointerId)) {
            swipe.captureElement.releasePointerCapture(event.pointerId);
          }
          settleSlide(swipe.activeIndex, false);
          return;
        }

        swipe.horizontalActive = true;
        swipe.interceptDeltaX = latestDeltaX;
        justLockedHorizontal = true;
        if (!swipe.captureElement.hasPointerCapture(event.pointerId)) {
          swipe.captureElement.setPointerCapture(event.pointerId);
        }
      }

      event.preventDefault();
      swipe.latestDeltaX = latestDeltaX;
      pushSwipeSample(swipe.samples, event.clientX, event.timeStamp);
      if (justLockedHorizontal) {
        paintDrag();
        return;
      }
      queueDragPaint();
    };

    const handlePointerUp = (event: PointerEvent) => {
      const swipe = swipeRef.current;
      if (!swipe || event.pointerId !== swipe.pointerId) return;

      if (swipe.horizontalActive) event.preventDefault();
      removePointerListenersRef.current?.();
      removePointerListenersRef.current = null;
      swipe.latestDeltaX = event.clientX - swipe.startClientX;
      pushSwipeSample(swipe.samples, event.clientX, event.timeStamp);
      if (swipe.animationFrame !== 0) {
        cancelAnimationFrame(swipe.animationFrame);
        swipe.animationFrame = 0;
        paintDrag();
      }

      const releaseIntent = getQuestCarouselSwipeIntent(
        swipe.latestDeltaX,
        event.clientY - swipe.startClientY,
        event.pointerType,
      );
      const direction =
        swipe.horizontalActive || releaseIntent === "horizontal"
          ? getQuestCarouselSwipeDirection(swipe.latestDeltaX, getSwipeVelocityX(swipe.samples))
          : 0;
      const edgeSwipeDirection = getQuestCarouselEdgeSwipeDirection(swipe.activeIndex, direction);
      const nextIndex = edgeSwipeDirection
        ? swipe.activeIndex
        : clampCarouselIndex(swipe.activeIndex + direction);
      swipeRef.current = null;
      if (swipe.captureElement.hasPointerCapture(event.pointerId)) {
        swipe.captureElement.releasePointerCapture(event.pointerId);
      }
      if (edgeSwipeDirection && onEdgeSwipe) {
        settleSlide(swipe.activeIndex, false);
        onEdgeSwipe(edgeSwipeDirection);
        return;
      }
      settleSlide(nextIndex, true);
    };

    const handlePointerCancel = (event: PointerEvent) => {
      const swipe = swipeRef.current;
      if (!swipe || event.pointerId !== swipe.pointerId) return;

      removePointerListenersRef.current?.();
      removePointerListenersRef.current = null;
      if (swipe.animationFrame !== 0) cancelAnimationFrame(swipe.animationFrame);
      swipeRef.current = null;
      if (swipe.captureElement.hasPointerCapture(event.pointerId)) {
        swipe.captureElement.releasePointerCapture(event.pointerId);
      }

      // The browser stole the gesture (native scroll). If the drag already
      // travelled past the commit distance, honor the kid's intent instead of
      // rubber-banding back. Velocity is unreliable on cancel — distance only.
      const direction = swipe.horizontalActive
        ? getQuestCarouselSwipeDirection(swipe.latestDeltaX)
        : 0;
      const edgeSwipeDirection = getQuestCarouselEdgeSwipeDirection(swipe.activeIndex, direction);
      if (edgeSwipeDirection && onEdgeSwipe) {
        settleSlide(swipe.activeIndex, false);
        onEdgeSwipe(edgeSwipeDirection);
        return;
      }
      settleSlide(clampCarouselIndex(swipe.activeIndex + direction), true);
    };

    const handleNativeTouchMove = (event: TouchEvent) => {
      if (swipeRef.current?.horizontalActive && event.cancelable) event.preventDefault();
    };

    useBrowserLayoutEffect(() => {
      const viewportElement = viewportRef.current;
      if (!viewportElement) return;

      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry || swipeRef.current) return;
        snapQuestCarouselTrack({
          animated: false,
          animationRef: snapAnimationRef,
          index: activeSlideIndexRef.current,
          slideWidth: entry.contentRect.width,
          trackElement: trackRef.current,
        });
      });
      resizeObserver.observe(viewportElement);

      return () => {
        resizeObserver.disconnect();
      };
    }, []);

    useEffect(
      () => () => {
        const swipe = swipeRef.current;
        if (swipe?.animationFrame) cancelAnimationFrame(swipe.animationFrame);
        removePointerListenersRef.current?.();
        snapAnimationRef.current?.cancel();
      },
      [],
    );

    useBrowserLayoutEffect(() => {
      if (!focusRequest) return;
      settleSlide(QUEST_CAROUSEL_INITIAL_INDEX, !prefersReducedMotion());
    }, [focusRequest?.requestId]);

    return (
      <section
        data-quest-briefing-carousel=""
        className="grid h-full min-h-[11rem] grid-rows-[minmax(0,1fr)_1.25rem] overflow-hidden rounded-[4px] border border-amber-500/40 bg-white/65"
        aria-label="Quest details"
      >
        <div
          ref={viewportRef}
          className="h-full min-h-0 cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing"
          onPointerDown={handlePointerDown}
        >
          <div
            ref={trackRef}
            className="grid h-full grid-flow-col auto-cols-[100%] grid-rows-[100%]"
            style={{
              transform: `translateX(-${(initialSlideIndex * 100) / QUEST_CAROUSEL_SLIDE_COUNT}%)`,
            }}
          >
            <QuestBriefingInfoSlide
              eyebrow={`${requesterName} • ${requesterTitle}`}
              title="Training Knight"
            >
              <p className="text-xs font-semibold leading-snug text-neutral-800">{summary}</p>
              <p className="text-sm font-semibold leading-snug text-neutral-950">{need}</p>
            </QuestBriefingInfoSlide>

            <QuestBriefingRecipeDeck focusRequest={focusRequest} recipes={recipes} />

            <QuestBriefingInfoSlide eyebrow="What it teaches" title="Guild Lesson">
              <p className="text-xs font-bold leading-snug text-neutral-900">
                {formatTeachingFocus(teachingFocus)}
              </p>
              {developerNotesVisible ? (
                <p
                  data-quest-card-developer-note=""
                  className="mt-1 rounded-[3px] bg-neutral-950/85 px-2 py-1 text-[10px] font-bold leading-snug text-white"
                >
                  {hint}
                </p>
              ) : null}
            </QuestBriefingInfoSlide>
          </div>
        </div>

        <div className="grid h-5 grid-cols-3 border-t border-amber-500/30 bg-white/45">
          {QUEST_CAROUSEL_DOTS.map((dot, index) => (
            <button
              key={dot}
              type="button"
              className="group grid place-items-center p-0 transition-colors hover:bg-amber-950/5"
              aria-label={`Show quest detail ${index + 1}`}
              aria-current={activeSlideIndex === index}
              onClick={() => {
                settleSlide(index, true);
              }}
            >
              <span
                aria-hidden="true"
                className={`block size-1.5 rounded-full transition-[background-color,transform] ${
                  activeSlideIndex === index
                    ? "scale-125 bg-amber-950"
                    : "bg-amber-950/30 group-hover:bg-amber-950/55"
                }`}
              />
            </button>
          ))}
        </div>
      </section>
    );
  },
);

function addQuestCarouselPointerListeners(
  onMove: (event: PointerEvent) => void,
  onRelease: (event: PointerEvent) => void,
  onCancel: (event: PointerEvent) => void,
  onNativeTouchMove: (event: TouchEvent) => void,
): () => void {
  window.addEventListener("pointermove", onMove, QUEST_CAROUSEL_POINTER_LISTENER_OPTIONS);
  window.addEventListener("pointerup", onRelease, QUEST_CAROUSEL_POINTER_LISTENER_OPTIONS);
  window.addEventListener("pointercancel", onCancel, QUEST_CAROUSEL_POINTER_LISTENER_OPTIONS);
  // touch-action: pan-y cannot be revoked mid-gesture and preventDefault on
  // pointermove never blocks native panning — only a cancelable touchmove
  // preventDefault keeps WebKit from stealing a locked horizontal drag.
  window.addEventListener("touchmove", onNativeTouchMove, QUEST_CAROUSEL_POINTER_LISTENER_OPTIONS);

  return () => {
    window.removeEventListener("pointermove", onMove, QUEST_CAROUSEL_POINTER_LISTENER_CAPTURE);
    window.removeEventListener("pointerup", onRelease, QUEST_CAROUSEL_POINTER_LISTENER_CAPTURE);
    window.removeEventListener("pointercancel", onCancel, QUEST_CAROUSEL_POINTER_LISTENER_CAPTURE);
    window.removeEventListener(
      "touchmove",
      onNativeTouchMove,
      QUEST_CAROUSEL_POINTER_LISTENER_CAPTURE,
    );
  };
}

function snapQuestCarouselTrack({
  animated,
  animationRef,
  index,
  slideWidth,
  trackElement,
}: {
  animated: boolean;
  animationRef: MutableRefObject<JSAnimation | null>;
  index: number;
  slideWidth: number;
  trackElement: HTMLDivElement | null;
}): void {
  if (!trackElement || slideWidth <= 0) return;

  const targetX = getQuestCarouselSnapX(index, slideWidth);
  animationRef.current?.cancel();
  animationRef.current = null;

  if (!animated || prefersReducedMotion()) {
    trackElement.style.transform = `translateX(${targetX}px)`;
    return;
  }

  animationRef.current = animate(trackElement, {
    duration: QUEST_CAROUSEL_SNAP_DURATION_MS,
    ease: "out(3)",
    x: targetX,
    onComplete: () => {
      animationRef.current = null;
    },
  });
}

function getQuestCarouselSnapX(index: number, slideWidth: number): number {
  return -index * slideWidth;
}

function getResistedCarouselDeltaX(swipe: QuestCarouselSwipe): number {
  // Paint from the rebased origin (where horizontal locked) so the track
  // doesn't jump the 8px intent slop on the first painted frame; commit math
  // elsewhere keeps using the raw latestDeltaX.
  const visualDeltaX = swipe.latestDeltaX - swipe.interceptDeltaX;
  if (
    (swipe.activeIndex === QUEST_CAROUSEL_FIRST_SLIDE_INDEX && visualDeltaX > 0) ||
    (swipe.activeIndex === QUEST_CAROUSEL_LAST_SLIDE_INDEX && visualDeltaX < 0)
  ) {
    return visualDeltaX * QUEST_CAROUSEL_EDGE_RESISTANCE;
  }

  return visualDeltaX;
}

export function getQuestCarouselSwipeDirection(deltaX: number, velocityX = 0): -1 | 0 | 1 {
  return getCarouselSwipeCommitDirection(deltaX, velocityX, QUEST_CAROUSEL_SWIPE_MIN_PX);
}

export function getQuestCarouselSwipeIntent(
  deltaX: number,
  deltaY: number,
  pointerType?: string,
): QuestCarouselSwipeIntent {
  return getCarouselSwipeIntent(deltaX, deltaY, pointerType);
}

export function getQuestBriefingInitialSlideIndex(questId: string): number {
  return questId === ALCHEMIST_GUILD_FIRST_WATER_QUEST_ID
    ? QUEST_CAROUSEL_INITIAL_INDEX
    : QUEST_CAROUSEL_FIRST_SLIDE_INDEX;
}

function getQuestBriefingStatusLabel(
  redacted: boolean,
  completed: boolean,
  statusLabel: string,
): string {
  if (redacted) return "Locked";
  if (completed) return "Completed";
  return statusLabel;
}

function getQuestBriefingStatusClass(redacted: boolean, completed: boolean): string {
  if (redacted) return "bg-neutral-700";
  if (completed) return "bg-emerald-800";
  return "bg-emerald-700";
}

export function getQuestCarouselEdgeSwipeDirection(
  activeIndex: number,
  direction: -1 | 0 | 1,
): -1 | 1 | null {
  if (activeIndex === QUEST_CAROUSEL_FIRST_SLIDE_INDEX && direction === -1) return -1;
  if (activeIndex === QUEST_CAROUSEL_LAST_SLIDE_INDEX && direction === 1) return 1;

  return null;
}

function setQuestCarouselTrackX(trackElement: HTMLElement, x: number): void {
  trackElement.style.transform = `translateX(${x}px)`;
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(PRM).matches;
}

const QuestBriefingInfoSlidePropsSchema = z.object({
  children: z.custom<ReactNode>(),
  eyebrow: z.string().min(1),
  title: z.string().min(1),
});

const QuestBriefingInfoSlide = defineComponent(
  QuestBriefingInfoSlidePropsSchema,
  ({ children, eyebrow, title }) => (
    <article className="grid h-full min-h-0 touch-pan-y content-start gap-2 overflow-y-auto p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <p className="text-[10px] font-black uppercase leading-none tracking-normal text-amber-950/65">
        {eyebrow}
      </p>
      <h3 className="font-serif text-base leading-none text-amber-950">{title}</h3>
      {children}
    </article>
  ),
);

const QuestBriefingRecipeDeckPropsSchema = z.object({
  focusRequest: QuestBriefingFocusRequestSchema.nullable(),
  recipes: z.array(QuestBriefingRecipeSchema).min(1),
});

const QuestBriefingRecipeDeck = defineComponent(
  QuestBriefingRecipeDeckPropsSchema,
  ({ focusRequest, recipes }) => {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const [activeRecipeIndex, setActiveRecipeIndex] = useState(0);
    const activeRecipe = getRecipeAtIndex(recipes, activeRecipeIndex);
    const showRecipeRail = recipes.length > 1;

    const setRecipeIndexFromScroll = () => {
      const scroller = scrollerRef.current;
      if (!scroller || scroller.clientHeight <= 0) return;

      const nextIndex = clampRecipeDeckIndex(
        Math.round(scroller.scrollTop / scroller.clientHeight),
        recipes.length,
      );
      setActiveRecipeIndex((currentIndex) =>
        currentIndex === nextIndex ? currentIndex : nextIndex,
      );
    };

    const scrollToRecipe = (index: number) => {
      const nextIndex = clampRecipeDeckIndex(index, recipes.length);
      const scroller = scrollerRef.current;
      setActiveRecipeIndex(nextIndex);
      if (!scroller) return;

      scroller.scrollTo({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        top: scroller.clientHeight * nextIndex,
      });
    };

    useBrowserLayoutEffect(() => {
      if (!focusRequest) return;
      const focusIndex = getQuestRecipeLabelFocusIndex(recipes, focusRequest.cardId);
      if (focusIndex < 0) return;
      scrollToRecipe(focusIndex);
    }, [focusRequest?.requestId]);

    return (
      <article
        data-quest-recipe-deck=""
        data-quest-recipe-target={activeRecipe.name}
        className={`grid h-full min-h-0 overflow-hidden ${
          showRecipeRail ? "grid-cols-[minmax(0,1fr)_1.75rem]" : "grid-cols-1"
        }`}
        aria-label={`${activeRecipe.name}: ${formatIngredientList(activeRecipe.ingredients)}`}
      >
        <div
          ref={scrollerRef}
          className="h-full min-h-0 touch-pan-y snap-y snap-mandatory overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={setRecipeIndexFromScroll}
        >
          {recipes.map((recipe, index) => (
            <QuestBriefingRecipeCard
              key={recipe.name}
              positionLabel={`${index + 1}/${recipes.length}`}
              recipe={recipe}
            />
          ))}
        </div>

        {showRecipeRail ? (
          <QuestBriefingRecipeDeckRail
            activeIndex={activeRecipeIndex}
            onSelect={scrollToRecipe}
            recipes={recipes}
          />
        ) : null}
      </article>
    );
  },
);

const QuestBriefingRecipeCardPropsSchema = z.object({
  positionLabel: z.string().min(1),
  recipe: QuestBriefingRecipeSchema,
});

const QuestBriefingRecipeCard = defineComponent(
  QuestBriefingRecipeCardPropsSchema,
  ({ positionLabel, recipe }) => (
    <section
      data-quest-recipe-card={recipe.name}
      data-output-card-id={recipe.outputCardId}
      className="grid h-full min-h-0 snap-start grid-rows-[auto_minmax(0,1fr)] gap-2 p-3"
      aria-label={`${recipe.name}: ${formatIngredientList(recipe.ingredients)}`}
    >
      <div className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2">
        <img
          src={resolvePublicAssetPath(recipe.imagePath)}
          alt=""
          aria-hidden="true"
          className="size-8 rounded-[3px] border border-sky-900/30 bg-white object-contain p-0.5"
          draggable={false}
        />
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase leading-none tracking-normal text-sky-950/65">
            Make
          </p>
          <p className="font-serif text-lg leading-tight text-sky-950">{recipe.name}</p>
        </div>
        <span className="rounded-[3px] border border-sky-950/20 bg-white/75 px-1 py-0.5 font-mono text-[9px] font-black leading-none text-sky-950">
          {positionLabel}
        </span>
      </div>

      <div className="grid min-h-0 content-start overflow-y-auto rounded-[4px] border border-sky-950/20 bg-sky-50/90 p-2">
        <span className="sr-only">{recipe.formula}</span>
        <QuestBriefingFormula ingredients={recipe.ingredients} recipeName={recipe.name} />
      </div>
    </section>
  ),
);

const QuestBriefingRecipeDeckRailPropsSchema = z.object({
  activeIndex: z.int().min(0),
  onSelect: z.custom<(index: number) => void>(),
  recipes: z.array(QuestBriefingRecipeSchema).min(1),
});

const QuestBriefingRecipeDeckRail = defineComponent(
  QuestBriefingRecipeDeckRailPropsSchema,
  ({ activeIndex, onSelect, recipes }) => {
    const showFractionPagination = shouldUseRecipeDeckFractionPagination(recipes.length);

    return (
      <div className="grid h-full min-h-0 grid-rows-[2rem_minmax(0,1fr)_2rem] place-items-stretch border-l border-amber-500/30 bg-white/45">
        <button
          type="button"
          className="grid place-items-center rounded-[3px] text-sky-950 transition-colors hover:bg-sky-950/10 disabled:opacity-30"
          aria-label="Show previous quest recipe"
          disabled={activeIndex <= 0}
          onClick={() => {
            onSelect(activeIndex - 1);
          }}
        >
          <ChevronUp aria-hidden="true" className="size-4" strokeWidth={2.6} />
        </button>

        {showFractionPagination ? (
          <span
            className="grid place-items-center font-mono text-[10px] font-black leading-none text-sky-950"
            aria-live="polite"
          >
            <span className="sr-only">Quest recipe </span>
            <span className="grid min-h-8 min-w-6 place-items-center rounded-[4px] border border-sky-950/15 bg-white/70 px-1">
              {activeIndex + 1}/{recipes.length}
            </span>
          </span>
        ) : (
          <div className="grid content-center justify-items-stretch">
            {recipes.map((recipe, index) => (
              <button
                key={recipe.name}
                type="button"
                className="group grid h-6 place-items-center p-0 transition-colors hover:bg-sky-950/5"
                aria-label={`Show ${recipe.name} recipe`}
                aria-current={activeIndex === index}
                onClick={() => {
                  onSelect(index);
                }}
              >
                <span
                  aria-hidden="true"
                  className={`block size-1.5 rounded-full transition-[background-color,transform] ${
                    activeIndex === index
                      ? "scale-125 bg-sky-950"
                      : "bg-sky-950/28 group-hover:bg-sky-950/50"
                  }`}
                />
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          className="grid place-items-center rounded-[3px] text-sky-950 transition-colors hover:bg-sky-950/10 disabled:opacity-30"
          aria-label="Show next quest recipe"
          disabled={activeIndex >= recipes.length - 1}
          onClick={() => {
            onSelect(activeIndex + 1);
          }}
        >
          <ChevronDown aria-hidden="true" className="size-4" strokeWidth={2.6} />
        </button>
      </div>
    );
  },
);

const QuestBriefingFormulaPropsSchema = z.object({
  ingredients: z.array(QuestBriefingRecipeIngredientSchema).min(1),
  recipeName: z.string().min(1),
});

// One ingredient per row at a single readable scale: element rows pair the
// big symbol with its full name; word ingredients (symbol === name) get one
// full-width cell. No more 36px-vs-13px cliff between quests, and content
// flows top-down instead of floating centered in leftover space.
const QuestBriefingFormula = defineComponent(
  QuestBriefingFormulaPropsSchema,
  ({ ingredients, recipeName }) => (
    <span
      className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-2 gap-y-1 text-sky-950"
      aria-hidden="true"
    >
      {ingredients.map((ingredient) =>
        ingredient.symbol === ingredient.name ? (
          <span
            key={`${ingredient.cardId}:${ingredient.quantity}`}
            data-quest-recipe-ingredient={ingredient.cardId}
            className="col-span-2 text-base font-bold leading-tight"
          >
            {ingredient.quantity > 1 ? `${ingredient.quantity} ` : ""}
            {ingredient.name}
          </span>
        ) : (
          <Fragment key={`${ingredient.cardId}:${ingredient.quantity}`}>
            <span
              data-quest-recipe-ingredient={ingredient.cardId}
              className="whitespace-nowrap font-serif text-2xl font-bold leading-none"
            >
              {ingredient.quantity > 1 ? (
                <span className="text-[0.7em]">{ingredient.quantity}</span>
              ) : null}
              {ingredient.symbol}
            </span>
            <span
              data-quest-recipe-ingredient={ingredient.cardId}
              className="text-sm font-semibold leading-tight"
            >
              {ingredient.name}
            </span>
          </Fragment>
        ),
      )}
      <span className="col-span-2 mt-0.5 border-t border-sky-950/15 pt-1 text-sm font-bold leading-tight">
        = {recipeName}
      </span>
    </span>
  ),
);

function getRecipeAtIndex(
  recipeLabels: readonly z.infer<typeof QuestBriefingRecipeSchema>[],
  index: number,
): z.infer<typeof QuestBriefingRecipeSchema> {
  const recipe = recipeLabels[clampRecipeDeckIndex(index, recipeLabels.length)] ?? recipeLabels[0];
  if (!recipe) throw new Error("Quest briefing requires at least one recipe");

  return recipe;
}

function clampRecipeDeckIndex(index: number, recipeCount: number): number {
  return Math.min(Math.max(index, 0), Math.max(0, recipeCount - 1));
}

export function shouldUseRecipeDeckFractionPagination(recipeCount: number): boolean {
  return recipeCount > 3;
}

function clampCarouselIndex(index: number): number {
  return Math.min(Math.max(index, 0), QUEST_CAROUSEL_SLIDE_COUNT - 1);
}

function formatTeachingFocus(teachingFocus: readonly string[]): string {
  return `Teaches ${teachingFocus.join(", ")}.`;
}

function createFirstQuestBriefingCardProps(): QuestBriefingCardProps {
  return createQuestBriefingCardProps(getRequiredQuest("quest:first-water"));
}

export function createQuestBriefingCardProps(quest: StaticAlchemyQuest): QuestBriefingCardProps {
  const cachedCardProps = questBriefingCardPropsCache.get(quest.id);
  if (cachedCardProps) return cachedCardProps;

  const cardProps = buildQuestBriefingCardProps(quest);
  const parsedCardProps = import.meta.env.DEV
    ? QuestBriefingCardPropsSchema.parse(cardProps)
    : cardProps;
  questBriefingCardPropsCache.set(quest.id, parsedCardProps);
  return parsedCardProps;
}

function buildQuestBriefingCardProps(quest: StaticAlchemyQuest): QuestBriefingCardProps {
  const requesterCharacter = getAlchemyCharactersByRequester(quest.narrative.requester)[0];
  const recipeLabels = getQuestBriefingRecipes(quest).map((recipe) => {
    return {
      formula: formatRecipeFormula(recipe),
      imagePath: recipe.output.imagePath,
      ingredients: recipe.arguments.map(formatRecipeIngredient),
      name: recipe.name,
      outputCardId: recipe.output.cardId,
    };
  });

  return {
    actLabel: `Act ${quest.progression.act} • ${formatMinuteRange(quest.progression.suggestedMinutes)}`,
    developerNotesVisible: false,
    hint: quest.narrative.hint,
    id: quest.id,
    need: quest.narrative.need,
    redacted: false,
    recipeLabels,
    requesterAvatarPath: requesterCharacter?.avatarPath ?? null,
    requesterName: requesterCharacter?.name ?? formatTokenLabel(quest.narrative.requester),
    requesterTitle: requesterCharacter?.title ?? "Guild Requester",
    requesterVoiceClipPath: getQuestRequesterVoiceClipPath(quest),
    rewards: [
      { icon: "gold", label: "Gold", value: String(quest.rewards.gold) },
      { icon: "knowledge", label: "Knowledge XP", value: String(quest.rewards.knowledgeXp) },
      {
        icon: "discovery",
        label: "Discovery Token",
        value: String(quest.rewards.discoveryTokens),
      },
      {
        icon: "muddlefog",
        label: "Muddlefog Cleared",
        value: `${quest.rewards.muddlefogCleared}%`,
      },
    ],
    slotLabel: `${formatTokenLabel(quest.progression.boardSlot)} path`,
    statusLabel: "Ready",
    summary: quest.narrative.summary,
    teachingFocus: [...quest.teachingFocus],
    title: quest.narrative.title,
  };
}

export function getQuestBriefingRecipeFocusIndex(
  quest: StaticAlchemyQuest,
  cardId: string,
): number | null {
  const focusIndex = getQuestBriefingRecipes(quest).findIndex((recipe) =>
    doesRecipeReferenceCard(recipe, cardId),
  );

  return focusIndex >= 0 ? focusIndex : null;
}

function getQuestBriefingRecipes(quest: StaticAlchemyQuest): StaticAlchemyRecipe[] {
  const recipes = quest.recipeIds.map(getRequiredRecipe);
  const roots = getQuestBriefingRecipeRoots(recipes);
  const orderedRecipes: StaticAlchemyRecipe[] = [];
  const seenRecipeIds = new Set<string>();

  for (const recipe of roots) {
    appendRecipeWithDependencies(recipe, orderedRecipes, seenRecipeIds);
  }

  return orderedRecipes;
}

function getQuestRecipeLabelFocusIndex(
  recipes: readonly QuestBriefingRecipe[],
  cardId: string,
): number {
  return recipes.findIndex(
    (recipe) =>
      recipe.outputCardId === cardId ||
      recipe.ingredients.some((ingredient) => ingredient.cardId === cardId),
  );
}

function doesRecipeReferenceCard(recipe: StaticAlchemyRecipe, cardId: string): boolean {
  return (
    recipe.output.cardId === cardId ||
    recipe.arguments.some((argument) => argument.cardId === cardId)
  );
}

function getQuestBriefingRecipeRoots(
  recipes: readonly StaticAlchemyRecipe[],
): StaticAlchemyRecipe[] {
  const consumedCardIds = new Set<string>(
    recipes.flatMap((recipe) => recipe.arguments.map((argument) => argument.cardId)),
  );
  const terminalRecipes = recipes.filter((recipe) => !consumedCardIds.has(recipe.output.cardId));
  const terminalRecipe = terminalRecipes.length === 1 ? terminalRecipes[0] : null;
  if (!terminalRecipe || recipes.length <= 1) return [...recipes];

  return [terminalRecipe];
}

function appendRecipeWithDependencies(
  recipe: StaticAlchemyRecipe,
  orderedRecipes: StaticAlchemyRecipe[],
  seenRecipeIds: Set<string>,
): void {
  if (seenRecipeIds.has(recipe.id)) return;

  seenRecipeIds.add(recipe.id);
  orderedRecipes.push(recipe);

  for (const argument of recipe.arguments) {
    const dependencyRecipe = getAlchemyRecipeByOutput(argument.cardId);
    if (dependencyRecipe)
      appendRecipeWithDependencies(dependencyRecipe, orderedRecipes, seenRecipeIds);
  }
}

function getRequiredQuest(questId: string): StaticAlchemyQuest {
  const quest = getAlchemyQuestById(questId);
  if (!quest) throw new Error(`Missing alchemy quest: ${questId}`);
  return quest;
}

function getRequiredRecipe(recipeId: string): StaticAlchemyRecipe {
  const recipe = getAlchemyRecipeById(recipeId);
  if (!recipe) throw new Error(`Missing alchemy recipe: ${recipeId}`);
  return recipe;
}

function formatRecipeFormula(recipe: StaticAlchemyRecipe): string {
  return recipe.arguments.map(formatRecipeArgument).join(" + ");
}

function formatRecipeArgument(argument: StaticAlchemyRecipe["arguments"][number]): string {
  const elementCard = ELEMENT_CARDS.find((card) => card.id === argument.cardId);
  const cardLabel = elementCard?.symbol ?? formatTokenLabel(argument.cardId);
  return argument.quantity === 1 ? cardLabel : `${argument.quantity}${cardLabel}`;
}

function formatRecipeIngredient(
  argument: StaticAlchemyRecipe["arguments"][number],
): z.infer<typeof QuestBriefingRecipeIngredientSchema> {
  const elementCard = ELEMENT_CARDS.find((card) => card.id === argument.cardId);
  const cardLabel = elementCard?.name ?? formatTokenLabel(argument.cardId);

  return {
    cardId: argument.cardId,
    name: cardLabel,
    quantity: argument.quantity,
    symbol: elementCard?.symbol ?? cardLabel,
  };
}

function formatIngredientList(
  ingredients: readonly z.infer<typeof QuestBriefingRecipeIngredientSchema>[],
): string {
  return ingredients
    .map((ingredient) =>
      ingredient.quantity === 1
        ? `1 ${ingredient.name} card`
        : `${ingredient.quantity} ${ingredient.name} cards`,
    )
    .join(" plus ");
}

function formatMinuteRange(minutes: readonly [number, number]): string {
  const [startMinute, endMinute] = minutes;
  return `${startMinute}-${endMinute} min`;
}

function formatTokenLabel(token: string): string {
  return token
    .replace(CARD_ID_PREFIX_PATTERN, "")
    .split("-")
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function resolvePublicAssetPath(path: string): string {
  const baseUrl = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${baseUrl}${path}`;
}
