import {
  ALCHEMIST_GUILD_FIRST_WATER_QUEST_ID,
  ELEMENT_CARDS,
  getAlchemyCharactersByRequester,
  getAlchemyQuestById,
  getAlchemyRecipeById,
  type StaticAlchemyQuest,
  type StaticAlchemyRecipe,
} from "@dean-stack/schemas";
import { type AnimatableObject, animate, createAnimatable, type JSAnimation } from "animejs";
import { Brain, CloudFog, Coins, LockKeyhole, type LucideIcon, Sparkles } from "lucide-react";
import {
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

const PRM = "(prefers-reduced-motion: reduce)";
const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const QUEST_CARD_ID_PATTERN = /^quest:[a-z0-9-]+$/;
const PUBLIC_PATH_PATTERN = /^[a-z0-9-/]+\.webp$/;
const CARD_ID_PREFIX_PATTERN = /^[a-z-]+:/;
const QUEST_CAROUSEL_DOTS = ["training", "recipe", "teaching"] as const;
const QUEST_CAROUSEL_SLIDE_COUNT = QUEST_CAROUSEL_DOTS.length;
const QUEST_CAROUSEL_INITIAL_INDEX = 1;
const QUEST_CAROUSEL_FIRST_SLIDE_INDEX = 0;
const QUEST_CAROUSEL_LAST_SLIDE_INDEX = QUEST_CAROUSEL_SLIDE_COUNT - 1;
const QUEST_CAROUSEL_SWIPE_MIN_PX = 34;
const QUEST_CAROUSEL_EDGE_RESISTANCE = 0.32;
const QUEST_CAROUSEL_SNAP_DURATION_MS = 230;

type QuestCarouselSwipe = {
  activeIndex: number;
  animationFrame: number;
  captureElement: HTMLDivElement;
  latestDeltaX: number;
  motion: AnimatableObject;
  pointerId: number;
  slideWidth: number;
  startClientX: number;
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
});

export const QuestBriefingCardPropsSchema = z.object({
  actLabel: z.string().min(1),
  developerNotesVisible: z.boolean(),
  hint: z.string().min(1),
  id: z.string().regex(QUEST_CARD_ID_PATTERN),
  need: z.string().min(1),
  onCarouselEdgeSwipe: z.custom<(direction: -1 | 1) => void>().optional(),
  recipeLabels: z.array(QuestBriefingRecipeSchema).min(1),
  redacted: z.boolean(),
  requesterAvatarPath: z.string().regex(PUBLIC_PATH_PATTERN).nullable(),
  requesterName: z.string().min(1),
  requesterTitle: z.string().min(1),
  rewards: z.array(QuestBriefingRewardSchema).min(1),
  slotLabel: z.string().min(1),
  statusLabel: z.string().min(1),
  summary: z.string().min(1),
  teachingFocus: z.array(z.string().min(1)).min(1),
  title: z.string().min(1),
});
export type QuestBriefingCardProps = z.infer<typeof QuestBriefingCardPropsSchema>;

export const FIRST_QUEST_BRIEFING_CARD_PROPS = createFirstQuestBriefingCardProps();

export const QuestBriefingCard = defineComponent(
  QuestBriefingCardPropsSchema,
  ({
    actLabel,
    developerNotesVisible,
    hint,
    id,
    need,
    onCarouselEdgeSwipe,
    redacted,
    recipeLabels,
    requesterAvatarPath,
    requesterName,
    requesterTitle,
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
      className="relative grid min-h-0 content-start gap-1.5 overflow-hidden rounded-[6px] border border-amber-500/70 bg-white/60 p-2.5 text-neutral-950 shadow-[0_2px_0_rgba(72,45,16,0.14)] backdrop-blur-sm"
      aria-labelledby={`${id}-title`}
    >
      <header className="grid grid-cols-[2.5rem_1fr] gap-2">
        <QuestRequesterAvatar
          redacted={redacted}
          requesterAvatarPath={requesterAvatarPath}
          requesterName={requesterName}
        />
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap gap-1.5">
            <span
              className={`rounded-[3px] px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-normal text-white ${
                redacted ? "bg-neutral-700" : "bg-emerald-700"
              }`}
            >
              {redacted ? "Locked" : statusLabel}
            </span>
            <span className="rounded-[3px] bg-sky-800 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-normal text-white">
              {slotLabel}
            </span>
          </div>
          <p className="truncate text-[11px] font-semibold uppercase leading-tight tracking-normal text-amber-950/75">
            {actLabel}
          </p>
          <h2 id={`${id}-title`} className="font-serif text-base leading-none text-amber-950">
            {redacted ? "Redacted Quest" : title}
          </h2>
        </div>
      </header>

      <p className="text-[11px] font-semibold leading-snug text-neutral-900">
        {redacted ? "Complete earlier guild work to reveal this request." : summary}
      </p>

      {redacted ? (
        <QuestBriefingRedactedPanel />
      ) : (
        <QuestBriefingCarousel
          developerNotesVisible={developerNotesVisible}
          hint={hint}
          initialSlideIndex={getQuestBriefingInitialSlideIndex(id)}
          need={need}
          onEdgeSwipe={onCarouselEdgeSwipe}
          primaryRecipe={getPrimaryRecipe(recipeLabels)}
          requesterName={requesterName}
          requesterTitle={requesterTitle}
          teachingFocus={teachingFocus}
        />
      )}

      <footer className="grid h-8 min-h-0 grid-cols-4 overflow-hidden rounded-[4px] border border-amber-500/40 bg-white/65">
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
              <RewardIcon aria-hidden="true" className="size-3 stroke-[2.5] text-amber-950" />
              <span aria-hidden="true" className="text-[10px] font-black leading-none">
                {redacted ? "?" : reward.value}
              </span>
            </div>
          );
        })}
      </footer>
    </article>
  ),
);

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
      <div className="relative size-10 overflow-hidden rounded-[4px] border border-amber-500/55 bg-white/70">
        {content}
      </div>
    );
  },
);

const QuestBriefingCarouselPropsSchema = z.object({
  developerNotesVisible: z.boolean(),
  hint: z.string().min(1),
  initialSlideIndex: z.int().min(0).max(QUEST_CAROUSEL_LAST_SLIDE_INDEX),
  need: z.string().min(1),
  onEdgeSwipe: z.custom<(direction: -1 | 1) => void>().optional(),
  primaryRecipe: QuestBriefingRecipeSchema,
  requesterName: z.string().min(1),
  requesterTitle: z.string().min(1),
  teachingFocus: z.array(z.string().min(1)).min(1),
});

const QuestBriefingRedactedPanel = defineComponent(z.object({}), () => (
  <section
    className="grid h-36 content-center gap-3 overflow-hidden rounded-[4px] border border-amber-500/40 bg-white/65 p-3"
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
    <p className="text-center text-[10px] font-black uppercase leading-none tracking-normal text-neutral-700">
      Quest sealed
    </p>
  </section>
));

const QuestBriefingCarousel = defineComponent(
  QuestBriefingCarouselPropsSchema,
  ({
    developerNotesVisible,
    hint,
    initialSlideIndex,
    need,
    onEdgeSwipe,
    primaryRecipe,
    requesterName,
    requesterTitle,
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
      if (event.button !== 0) return;
      const trackElement = trackRef.current;
      if (!trackElement) return;

      const slideWidth = event.currentTarget.getBoundingClientRect().width;
      if (slideWidth <= 0) return;

      event.preventDefault();
      removePointerListenersRef.current?.();
      snapAnimationRef.current?.cancel();
      snapAnimationRef.current = null;
      const motion = createAnimatable(trackElement, {
        x: { duration: 0, unit: "px" },
      });
      setCarouselMotionX(motion, getQuestCarouselSnapX(activeSlideIndexRef.current, slideWidth));

      swipeRef.current = {
        activeIndex: activeSlideIndexRef.current,
        animationFrame: 0,
        captureElement: event.currentTarget,
        latestDeltaX: 0,
        motion,
        pointerId: event.pointerId,
        slideWidth,
        startClientX: event.clientX,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
      removePointerListenersRef.current = addQuestCarouselPointerListeners(
        handlePointerMove,
        handlePointerUp,
        handlePointerCancel,
      );
    };

    const paintDrag = () => {
      const swipe = swipeRef.current;
      if (!swipe) return;

      swipe.animationFrame = 0;
      const resistedDeltaX = getResistedCarouselDeltaX(swipe);
      setCarouselMotionX(
        swipe.motion,
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

      event.preventDefault();
      swipe.latestDeltaX = event.clientX - swipe.startClientX;
      queueDragPaint();
    };

    const handlePointerUp = (event: PointerEvent) => {
      const swipe = swipeRef.current;
      if (!swipe || event.pointerId !== swipe.pointerId) return;

      event.preventDefault();
      removePointerListenersRef.current?.();
      removePointerListenersRef.current = null;
      swipe.latestDeltaX = event.clientX - swipe.startClientX;
      if (swipe.animationFrame !== 0) {
        cancelAnimationFrame(swipe.animationFrame);
        swipe.animationFrame = 0;
        paintDrag();
      }

      const direction = getQuestCarouselSwipeDirection(swipe.latestDeltaX);
      const edgeSwipeDirection = getQuestCarouselEdgeSwipeDirection(swipe.activeIndex, direction);
      const nextIndex = edgeSwipeDirection
        ? swipe.activeIndex
        : clampCarouselIndex(swipe.activeIndex + direction);
      swipeRef.current = null;
      if (swipe.captureElement.hasPointerCapture(event.pointerId)) {
        swipe.captureElement.releasePointerCapture(event.pointerId);
      }
      if (edgeSwipeDirection && onEdgeSwipe) {
        settleSlide(swipe.activeIndex, true);
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
      swipe.motion.revert();
      if (swipe.captureElement.hasPointerCapture(event.pointerId)) {
        swipe.captureElement.releasePointerCapture(event.pointerId);
      }
      settleSlide(swipe.activeIndex, true);
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
        swipe?.motion.revert();
        removePointerListenersRef.current?.();
        snapAnimationRef.current?.cancel();
      },
      [],
    );

    return (
      <section
        data-quest-briefing-carousel=""
        className="grid grid-rows-[6.75rem_1rem] overflow-hidden rounded-[4px] border border-amber-500/40 bg-white/65"
        aria-label="Quest details"
      >
        <div
          ref={viewportRef}
          className="min-h-0 touch-pan-y select-none overflow-hidden"
          onPointerDown={handlePointerDown}
        >
          <div
            ref={trackRef}
            className="grid grid-flow-col auto-cols-[100%]"
            style={{
              transform: `translateX(-${(initialSlideIndex * 100) / QUEST_CAROUSEL_SLIDE_COUNT}%)`,
            }}
          >
            <QuestBriefingInfoSlide
              eyebrow={`${requesterName} • ${requesterTitle}`}
              title="Training Knight"
            >
              <p className="text-sm font-semibold leading-snug text-neutral-950">{need}</p>
            </QuestBriefingInfoSlide>

            <QuestBriefingRecipeSlide recipe={primaryRecipe} />

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

        <div className="grid h-4 place-items-center border-t border-amber-500/30 bg-white/45">
          <div className="flex items-center justify-center gap-1.5">
            {QUEST_CAROUSEL_DOTS.map((dot, index) => (
              <button
                key={dot}
                type="button"
                className={`block size-1.5 shrink-0 rounded-full p-0 leading-none transition-[background-color,transform] ${
                  activeSlideIndex === index
                    ? "scale-125 bg-amber-950"
                    : "bg-amber-950/30 hover:bg-amber-950/55"
                }`}
                aria-label={`Show quest detail ${index + 1}`}
                aria-current={activeSlideIndex === index}
                onClick={() => {
                  settleSlide(index, true);
                }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  },
);

function addQuestCarouselPointerListeners(
  onMove: (event: PointerEvent) => void,
  onRelease: (event: PointerEvent) => void,
  onCancel: (event: PointerEvent) => void,
): () => void {
  window.addEventListener("pointermove", onMove, QUEST_CAROUSEL_POINTER_LISTENER_OPTIONS);
  window.addEventListener("pointerup", onRelease, QUEST_CAROUSEL_POINTER_LISTENER_OPTIONS);
  window.addEventListener("pointercancel", onCancel, QUEST_CAROUSEL_POINTER_LISTENER_OPTIONS);

  return () => {
    window.removeEventListener("pointermove", onMove, QUEST_CAROUSEL_POINTER_LISTENER_CAPTURE);
    window.removeEventListener("pointerup", onRelease, QUEST_CAROUSEL_POINTER_LISTENER_CAPTURE);
    window.removeEventListener("pointercancel", onCancel, QUEST_CAROUSEL_POINTER_LISTENER_CAPTURE);
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
  if (
    (swipe.activeIndex === QUEST_CAROUSEL_FIRST_SLIDE_INDEX && swipe.latestDeltaX > 0) ||
    (swipe.activeIndex === QUEST_CAROUSEL_LAST_SLIDE_INDEX && swipe.latestDeltaX < 0)
  ) {
    return swipe.latestDeltaX * QUEST_CAROUSEL_EDGE_RESISTANCE;
  }

  return swipe.latestDeltaX;
}

function getQuestCarouselSwipeDirection(deltaX: number): -1 | 0 | 1 {
  if (Math.abs(deltaX) < QUEST_CAROUSEL_SWIPE_MIN_PX) return 0;
  if (deltaX < 0) return 1;
  return -1;
}

export function getQuestBriefingInitialSlideIndex(questId: string): number {
  return questId === ALCHEMIST_GUILD_FIRST_WATER_QUEST_ID
    ? QUEST_CAROUSEL_INITIAL_INDEX
    : QUEST_CAROUSEL_FIRST_SLIDE_INDEX;
}

export function getQuestCarouselEdgeSwipeDirection(
  activeIndex: number,
  direction: -1 | 0 | 1,
): -1 | 1 | null {
  if (activeIndex === QUEST_CAROUSEL_FIRST_SLIDE_INDEX && direction === -1) return -1;
  if (activeIndex === QUEST_CAROUSEL_LAST_SLIDE_INDEX && direction === 1) return 1;

  return null;
}

function setCarouselMotionX(motion: AnimatableObject, x: number): void {
  const setter = motion.x;
  if (!setter) return;
  setter(x, 0);
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
    <article className="grid h-27 content-start gap-1 p-2">
      <p className="text-[10px] font-black uppercase leading-none tracking-normal text-amber-950/65">
        {eyebrow}
      </p>
      <h3 className="font-serif text-base leading-none text-amber-950">{title}</h3>
      {children}
    </article>
  ),
);

const QuestBriefingRecipeSlidePropsSchema = z.object({
  recipe: QuestBriefingRecipeSchema,
});

const QuestBriefingRecipeSlide = defineComponent(
  QuestBriefingRecipeSlidePropsSchema,
  ({ recipe }) => (
    <article
      data-quest-recipe-target={recipe.name}
      className="grid h-27 grid-rows-[auto_minmax(0,1fr)] gap-1.5 p-2"
      aria-label={`${recipe.name}: ${formatIngredientList(recipe.ingredients)}`}
    >
      <div className="grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-2">
        <img
          src={resolvePublicAssetPath(recipe.imagePath)}
          alt=""
          aria-hidden="true"
          className="size-8 rounded-[3px] border border-sky-900/30 bg-white object-contain p-0.5"
          draggable={false}
        />
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase leading-none tracking-normal text-sky-950/65">
            Make
          </p>
          <p className="truncate font-serif text-base leading-none text-sky-950">{recipe.name}</p>
        </div>
      </div>

      <div className="grid min-h-0 place-items-center overflow-hidden rounded-[4px] border border-sky-950/20 bg-sky-50/90 px-1.5">
        <span className="sr-only">{recipe.formula}</span>
        <QuestBriefingFormula ingredients={recipe.ingredients} />
      </div>
    </article>
  ),
);

const QuestBriefingFormulaPropsSchema = z.object({
  ingredients: z.array(QuestBriefingRecipeIngredientSchema).min(1),
});

const QuestBriefingFormula = defineComponent(QuestBriefingFormulaPropsSchema, ({ ingredients }) => {
  const hasWordLabels = ingredients.some((ingredient) => ingredient.symbol.length > 2);

  return (
    <span
      className={`flex max-w-full items-baseline justify-center overflow-hidden whitespace-nowrap font-serif font-bold leading-none tracking-normal text-sky-950 ${
        hasWordLabels ? "text-xl" : "text-4xl"
      }`}
      aria-hidden="true"
    >
      {ingredients.map((ingredient, index) => (
        <span
          key={`${ingredient.cardId}:${ingredient.quantity}`}
          className="flex items-baseline leading-none"
        >
          {ingredient.quantity > 1 ? (
            <span className="mr-0.5 text-[0.56em] leading-none">{ingredient.quantity}</span>
          ) : null}
          <span>{ingredient.symbol}</span>
          {index < ingredients.length - 1 ? (
            <span className="mx-1.5 text-[0.68em] font-normal leading-none">+</span>
          ) : null}
        </span>
      ))}
    </span>
  );
});

function getPrimaryRecipe(
  recipeLabels: readonly z.infer<typeof QuestBriefingRecipeSchema>[],
): z.infer<typeof QuestBriefingRecipeSchema> {
  const primaryRecipe = recipeLabels[0];
  if (!primaryRecipe) throw new Error("Quest briefing requires at least one recipe");

  return primaryRecipe;
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
  const requesterCharacter = getAlchemyCharactersByRequester(quest.narrative.requester)[0];
  const recipeLabels = quest.recipeIds.map((recipeId) => {
    const recipe = getRequiredRecipe(recipeId);
    return {
      formula: formatRecipeFormula(recipe),
      imagePath: recipe.output.imagePath,
      ingredients: recipe.arguments.map(formatRecipeIngredient),
      name: recipe.name,
    };
  });

  return QuestBriefingCardPropsSchema.parse({
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
    teachingFocus: quest.teachingFocus,
    title: quest.narrative.title,
  });
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
