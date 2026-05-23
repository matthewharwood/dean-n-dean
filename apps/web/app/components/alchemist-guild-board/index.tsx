import {
  type AlchemistGuildBoardState,
  type AlchemistGuildReagentSlotId,
  AlchemistGuildReagentSlotIdSchema,
  ELEMENT_CARDS,
} from "@dean-stack/schemas";
import {
  type AnimatableObject,
  animate,
  createAnimatable,
  type EasingParam,
  type JSAnimation,
} from "animejs";
import { useAtomValue, useSetAtom } from "jotai";
import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import * as z from "zod";

import { usePixiApp } from "~/canvas/use-pixi-app";
import { defineComponent } from "~/lib/define-component";
import { sfx } from "~/sound/sfx";
import { alchemistGuildBoardAtom } from "~/state/atoms";

import {
  FLOATING_ELEMENT_CARD_HEIGHT,
  FLOATING_ELEMENT_CARD_WIDTH,
  type PeriodicElementCard,
  type PeriodicTableElementGrab,
  setupPeriodicTableScene,
} from "./periodic-table-scene";
import { AlchemistGuildBoardPropsSchema } from "./schema";

const PRM = "(prefers-reduced-motion: reduce)";
const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const DRAG_ROTATION_MULTIPLIER = 22;
const RELEASE_THROW_MS = 120;
const RELEASE_DURATION_MS = 180;
const SWAP_MIN_DURATION_MS = 180;
const SWAP_MAX_DURATION_MS = 300;
const EMPTY_DROP_INTENT: DropIntent = { kind: "none" };

const reagentSlots = [
  { id: "reagent-slot-1", name: "Reagent slot 1" },
  { id: "reagent-slot-2", name: "Reagent slot 2" },
  { id: "reagent-slot-3", name: "Reagent slot 3" },
  { id: "reagent-slot-4", name: "Reagent slot 4" },
  { id: "reagent-slot-5", name: "Reagent slot 5" },
] satisfies readonly { id: AlchemistGuildReagentSlotId; name: string }[];

const elementCardsById = new Map<string, PeriodicElementCard>();
for (const card of ELEMENT_CARDS) {
  elementCardsById.set(card.id, card);
}

type DragSource =
  | { kind: "table" }
  | {
      kind: "slot";
      slotId: AlchemistGuildReagentSlotId;
    };

type DraggedElementCard = {
  card: PeriodicElementCard;
  grabOffsetX: number;
  grabOffsetY: number;
  id: string;
  pointerId: number;
  source: DragSource;
  startClientX: number;
  startClientY: number;
};

type DropIntent =
  | { kind: "none" }
  | { kind: "drop"; slotId: AlchemistGuildReagentSlotId }
  | { kind: "swap"; slotId: AlchemistGuildReagentSlotId }
  | { kind: "blocked"; slotId: AlchemistGuildReagentSlotId };

type DropFeedback = DropIntent["kind"];

type SlotRect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

type SlotHitRect = SlotRect & {
  slotId: AlchemistGuildReagentSlotId;
};

type SwapAnimation = {
  card: PeriodicElementCard;
  durationMs: number;
  fromRect: SlotRect;
  fromSlotId: AlchemistGuildReagentSlotId;
  id: string;
  toRect: SlotRect;
  toSlotId: AlchemistGuildReagentSlotId;
};

type PointerSample = {
  clientX: number;
  clientY: number;
  time: number;
};

const ElementCardFacePropsSchema = z.object({
  card: z.custom<PeriodicElementCard>(),
});

const ElementCardFace = defineComponent(ElementCardFacePropsSchema, ({ card }) => (
  <>
    <div
      className="absolute left-1.5 right-1.5 top-1.5 h-2 rounded-full"
      style={{ backgroundColor: card.visual.familyColor }}
    />
    <span className="absolute left-2 top-4 text-[13px] font-bold leading-none text-neutral-950">
      {card.element.atomicNumber}
    </span>
    <span className="absolute inset-x-0 top-[38px] text-center text-[54px] font-bold leading-none text-neutral-950">
      {card.symbol}
    </span>
    <span className="absolute inset-x-1 bottom-7 truncate text-center text-[12px] leading-none text-neutral-900">
      {card.name}
    </span>
    <span className="absolute inset-x-1 bottom-3 text-center text-[10px] leading-none text-neutral-700">
      {card.element.atomicMass}
    </span>
  </>
));

const SlottedElementCardPropsSchema = z.object({
  card: z.custom<PeriodicElementCard | null>(),
  feedback: z.custom<DropFeedback>(),
  hidden: z.boolean(),
  onPointerDown: z.custom<(event: ReactPointerEvent<HTMLButtonElement>) => void>(),
  slotName: z.string(),
});

const SlottedElementCard = defineComponent(
  SlottedElementCardPropsSchema,
  ({ card, feedback, hidden, onPointerDown, slotName }) => {
    if (!card || hidden) return null;

    return (
      <button
        type="button"
        data-board-section="slotted-element-card"
        data-board-name={`${card.name} slotted element card`}
        data-card-id={card.id}
        className={getCardShellClass(feedback, "slotted")}
        style={{
          contain: "layout style paint",
          fontFamily: "Arial, sans-serif",
        }}
        aria-label={`Pick up ${card.name} from ${slotName}`}
        onPointerDown={onPointerDown}
      >
        <ElementCardFace card={card} />
      </button>
    );
  },
);

const DropGhostPropsSchema = z.object({
  card: z.custom<PeriodicElementCard>(),
  feedback: z.custom<DropFeedback>(),
});

const DropGhost = defineComponent(DropGhostPropsSchema, ({ card, feedback }) => (
  <div
    data-board-section="drop-preview-card"
    data-board-name={`${card.name} drop preview card`}
    data-card-id={card.id}
    className={getDropGhostClass(feedback)}
    aria-hidden="true"
  >
    <ElementCardFace card={card} />
  </div>
));

const ReagentSlotPropsSchema = z.object({
  draggedCard: z.custom<DraggedElementCard | null>(),
  dropFeedback: z.custom<DropFeedback>(),
  onSlottedCardPointerDown:
    z.custom<
      (
        slotId: AlchemistGuildReagentSlotId,
        card: PeriodicElementCard,
        event: ReactPointerEvent<HTMLButtonElement>,
      ) => void
    >(),
  slotId: AlchemistGuildReagentSlotIdSchema,
  slotName: z.string(),
  slottedCard: z.custom<PeriodicElementCard | null>(),
  sourceSwapGhostCard: z.custom<PeriodicElementCard | null>(),
  swapAnimation: z.custom<SwapAnimation | null>(),
});

const ReagentSlot = defineComponent(
  ReagentSlotPropsSchema,
  ({
    draggedCard,
    dropFeedback,
    onSlottedCardPointerDown,
    sourceSwapGhostCard,
    slotId,
    slotName,
    slottedCard,
    swapAnimation,
  }) => {
    const isSourceSlot =
      draggedCard?.source.kind === "slot" && draggedCard.source.slotId === slotId;
    const isSwapAnimationDestination =
      swapAnimation?.toSlotId === slotId && swapAnimation.card.id === slottedCard?.id;
    const targetGhostCard =
      draggedCard && dropFeedback !== "none" && dropFeedback !== "blocked"
        ? draggedCard.card
        : null;
    const ghostCard = sourceSwapGhostCard ?? targetGhostCard;
    const ghostFeedback: DropFeedback = sourceSwapGhostCard ? "swap" : dropFeedback;

    return (
      <div
        data-reagent-slot-id={slotId}
        data-board-section={slotId}
        data-board-name={slotName}
        data-drop-feedback={dropFeedback}
        className={getSlotShellClass(dropFeedback)}
      >
        <SlottedElementCard
          card={slottedCard}
          feedback={dropFeedback}
          hidden={isSourceSlot || isSwapAnimationDestination}
          onPointerDown={(event) => {
            if (slottedCard) onSlottedCardPointerDown(slotId, slottedCard, event);
          }}
          slotName={slotName}
        />
        {ghostCard ? <DropGhost card={ghostCard} feedback={ghostFeedback} /> : null}
      </div>
    );
  },
);

export const AlchemistGuildBoard = defineComponent(AlchemistGuildBoardPropsSchema, () => {
  const boardState = useAtomValue(alchemistGuildBoardAtom);
  const setBoardState = useSetAtom(alchemistGuildBoardAtom);
  const periodicTableCanvasRef = useRef<HTMLCanvasElement>(null);
  const draggedCardElementRef = useRef<HTMLDivElement>(null);
  const swapAnimationElementRef = useRef<HTMLDivElement>(null);
  const boardStateRef = useRef(boardState);
  const dropIntentRef = useRef<DropIntent>(EMPTY_DROP_INTENT);
  const dragSequenceRef = useRef(0);
  const swapAnimationSequenceRef = useRef(0);
  const [draggedCard, setDraggedCard] = useState<DraggedElementCard | null>(null);
  const [dropIntent, setDropIntent] = useState<DropIntent>(EMPTY_DROP_INTENT);
  const [swapAnimation, setSwapAnimation] = useState<SwapAnimation | null>(null);
  boardStateRef.current = boardState;

  const beginElementDrag = (grab: PeriodicTableElementGrab) => {
    dragSequenceRef.current += 1;
    const nextDraggedCard: DraggedElementCard = {
      card: grab.card,
      grabOffsetX: grab.grabOffsetX,
      grabOffsetY: grab.grabOffsetY,
      id: `${grab.card.id}:${dragSequenceRef.current}`,
      pointerId: grab.pointerId,
      source: { kind: "table" },
      startClientX: grab.clientX,
      startClientY: grab.clientY,
    };

    dropIntentRef.current = EMPTY_DROP_INTENT;
    setDropIntent(EMPTY_DROP_INTENT);
    setDraggedCard(nextDraggedCard);
    void sfx.play("card.pickup");
  };

  const beginSlottedCardDrag = (
    slotId: AlchemistGuildReagentSlotId,
    card: PeriodicElementCard,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    dragSequenceRef.current += 1;
    const nextDraggedCard: DraggedElementCard = {
      card,
      grabOffsetX: event.clientX - rect.left,
      grabOffsetY: event.clientY - rect.top,
      id: `${card.id}:${dragSequenceRef.current}`,
      pointerId: event.pointerId,
      source: { kind: "slot", slotId },
      startClientX: event.clientX,
      startClientY: event.clientY,
    };

    dropIntentRef.current = EMPTY_DROP_INTENT;
    setDropIntent(EMPTY_DROP_INTENT);
    setDraggedCard(nextDraggedCard);
    void sfx.play("card.slot.pickup");
  };

  usePixiApp(
    periodicTableCanvasRef,
    (app) => setupPeriodicTableScene(app, { onElementGrab: beginElementDrag }),
    [],
    { autoStart: false, preference: "canvas" },
  );

  useBrowserLayoutEffect(() => {
    const activeSwapAnimation = swapAnimation;
    if (!activeSwapAnimation) return;

    const cardElement = swapAnimationElementRef.current;
    if (!cardElement) return;

    const reducedMotion = typeof window !== "undefined" && window.matchMedia(PRM).matches;
    if (reducedMotion) {
      setSwapAnimation(null);
      return;
    }

    const moveX = activeSwapAnimation.toRect.left - activeSwapAnimation.fromRect.left;
    const moveY = activeSwapAnimation.toRect.top - activeSwapAnimation.fromRect.top;
    const animation = animate(cardElement, {
      duration: activeSwapAnimation.durationMs,
      ease: "out(3)",
      opacity: [0.78, 1],
      scale: [0.92, 1],
      x: moveX,
      y: moveY,
      onComplete: () => {
        setSwapAnimation((current) => (current?.id === activeSwapAnimation.id ? null : current));
      },
    });

    return () => {
      animation.cancel();
    };
  }, [swapAnimation]);

  useBrowserLayoutEffect(() => {
    const activeDraggedCard = draggedCard;
    if (!activeDraggedCard) return;

    const cardElement = draggedCardElementRef.current;
    if (!cardElement) return;

    const reducedMotion = typeof window !== "undefined" && window.matchMedia(PRM).matches;
    const motion = createAnimatable(cardElement, {
      rotate: { duration: 110, ease: "out(3)", unit: "deg" },
      scale: { duration: 120, ease: "out(3)" },
      x: { duration: 0, unit: "px" },
      y: { duration: 0, unit: "px" },
    });
    let latestSample: PointerSample = {
      clientX: activeDraggedCard.startClientX,
      clientY: activeDraggedCard.startClientY,
      time: performance.now(),
    };
    const grabOffsetX = activeDraggedCard.grabOffsetX;
    const grabOffsetY = activeDraggedCard.grabOffsetY;
    const pointerId = activeDraggedCard.pointerId;
    let lastSample = latestSample;
    let velocityX = 0;
    let velocityY = 0;
    let currentLeft = activeDraggedCard.startClientX - grabOffsetX;
    let currentTop = activeDraggedCard.startClientY - grabOffsetY;
    const slotHitRects = getSlotHitRects();
    let animationFrame = 0;
    let released = false;
    let releaseComplete = false;
    let releaseAnimation: JSAnimation | null = null;

    const clearDragState = () => {
      dropIntentRef.current = EMPTY_DROP_INTENT;
      setDropIntent(EMPTY_DROP_INTENT);
      setDraggedCard(null);
    };

    const syncDropIntent = () => {
      const nextDropIntent = resolveDropIntent(
        activeDraggedCard,
        getDropSlotIdAtCardCenter(currentLeft, currentTop, slotHitRects),
        boardStateRef.current,
      );

      if (isSameDropIntent(dropIntentRef.current, nextDropIntent)) return;
      dropIntentRef.current = nextDropIntent;
      setDropIntent(nextDropIntent);
    };

    const commitRelease = (dropSlotId: AlchemistGuildReagentSlotId | null) => {
      const source = activeDraggedCard.source;
      const currentBoardState = boardStateRef.current;

      if (!dropSlotId) {
        if (source.kind === "slot") {
          setBoardState((previous) => ({
            ...previous,
            reagentSlots: { ...previous.reagentSlots, [source.slotId]: null },
          }));
        }
        void sfx.play("card.dissolve");
        return;
      }

      if (source.kind === "slot" && source.slotId === dropSlotId) {
        void sfx.play("card.drop");
        return;
      }

      const targetCardId = currentBoardState.reagentSlots[dropSlotId];

      if (source.kind === "table" && targetCardId) {
        void sfx.play("card.dissolve");
        return;
      }

      if (source.kind === "slot" && targetCardId) {
        const swapAnimationCard = getElementCard(targetCardId);
        const nextSwapAnimation = swapAnimationCard
          ? createSwapAnimation({
              card: swapAnimationCard,
              fromSlotId: dropSlotId,
              id: `swap:${swapAnimationSequenceRef.current}`,
              toSlotId: source.slotId,
            })
          : null;
        swapAnimationSequenceRef.current += 1;
        setSwapAnimation(nextSwapAnimation);
      }

      setBoardState((previous) => {
        const previousTargetCardId = previous.reagentSlots[dropSlotId];
        const nextReagentSlots = {
          ...previous.reagentSlots,
          [dropSlotId]: activeDraggedCard.card.id,
        };

        if (source.kind === "slot") {
          nextReagentSlots[source.slotId] = previousTargetCardId;
        }

        return { ...previous, reagentSlots: nextReagentSlots };
      });

      void sfx.play(source.kind === "slot" && targetCardId ? "card.swap" : "card.drop");
    };

    const paintDrag = () => {
      animationFrame = 0;
      const deltaMs = Math.max(latestSample.time - lastSample.time, 16);

      velocityX = (latestSample.clientX - lastSample.clientX) / deltaMs;
      velocityY = (latestSample.clientY - lastSample.clientY) / deltaMs;
      currentLeft = latestSample.clientX - grabOffsetX;
      currentTop = latestSample.clientY - grabOffsetY;

      setMotionProperty(motion, "x", currentLeft);
      setMotionProperty(motion, "y", currentTop);
      setMotionProperty(
        motion,
        "rotate",
        clamp(velocityX * DRAG_ROTATION_MULTIPLIER, -10, 10),
        110,
        "out(3)",
      );
      setMotionProperty(motion, "scale", 1, 120, "out(3)");
      lastSample = latestSample;
      syncDropIntent();
    };

    const queuePaint = () => {
      if (animationFrame !== 0) return;
      animationFrame = requestAnimationFrame(paintDrag);
    };

    const removeDragListeners = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerRelease);
      window.removeEventListener("pointercancel", handlePointerRelease);
    };

    const finishDrag = () => {
      if (released) return;
      released = true;
      removeDragListeners();
      if (animationFrame !== 0) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        paintDrag();
      }
      commitRelease(getDropSlotIdAtCardCenter(currentLeft, currentTop, slotHitRects));

      if (reducedMotion) {
        clearDragState();
        return;
      }

      const throwLeft = currentLeft + clamp(velocityX * RELEASE_THROW_MS, -48, 48);
      const throwTop = currentTop + clamp(velocityY * RELEASE_THROW_MS + 10, -32, 64);
      const throwRotation = clamp(velocityX * 36, -18, 18);

      releaseAnimation = animate(cardElement, {
        duration: RELEASE_DURATION_MS,
        ease: "out(2)",
        opacity: 0,
        rotate: `${throwRotation}deg`,
        scale: 0.86,
        x: throwLeft,
        y: throwTop,
        onComplete: () => {
          releaseComplete = true;
          clearDragState();
        },
      });
    };

    function handlePointerMove(event: PointerEvent) {
      if (event.pointerId !== pointerId || released) return;
      event.preventDefault();
      latestSample = {
        clientX: event.clientX,
        clientY: event.clientY,
        time: performance.now(),
      };
      queuePaint();
    }

    function handlePointerRelease(event: PointerEvent) {
      if (event.pointerId !== pointerId) return;
      event.preventDefault();
      latestSample = {
        clientX: event.clientX,
        clientY: event.clientY,
        time: performance.now(),
      };
      finishDrag();
    }

    setMotionProperty(motion, "x", currentLeft);
    setMotionProperty(motion, "y", currentTop);
    setMotionProperty(motion, "rotate", 0);
    setMotionProperty(motion, "scale", 1);
    syncDropIntent();

    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerRelease, { passive: false });
    window.addEventListener("pointercancel", handlePointerRelease, { passive: false });

    return () => {
      removeDragListeners();
      if (animationFrame !== 0) cancelAnimationFrame(animationFrame);
      if (!releaseComplete) releaseAnimation?.cancel();
      if (!released) motion.revert();
    };
  }, [draggedCard]);

  return (
    <main
      data-test="alchemist-guild-board"
      data-board-section="alchemy-board"
      data-board-name="Alchemy board"
      className="h-dvh overflow-hidden bg-neutral-100 p-3 font-display text-neutral-950 lg:p-4"
      aria-label="Alchemist Guild board"
    >
      <div className="mx-auto grid h-full min-h-0 max-w-[1332px] grid-rows-[5rem_0.75rem_minmax(0,1fr)] gap-2.5 lg:grid-rows-[5.5rem_0.75rem_minmax(0,1fr)]">
        <header
          data-board-section="guild-banner"
          data-board-name="Guild banner"
          className="grid min-h-0 place-items-center bg-neutral-300"
        >
          <h1 className="font-serif text-4xl leading-none lg:text-5xl">Alchemist Guild</h1>
        </header>

        <progress
          data-board-section="progress-track"
          data-board-name="Progress track"
          className="h-3 w-full appearance-none overflow-hidden bg-indigo-200 accent-indigo-600 [&::-moz-progress-bar]:bg-indigo-600 [&::-webkit-progress-bar]:bg-indigo-200 [&::-webkit-progress-value]:bg-indigo-600"
          aria-label="Alchemy progress"
          max={100}
          value={41}
        >
          41%
        </progress>

        <section className="grid min-h-0 gap-2.5 lg:grid-cols-[minmax(14rem,316px)_minmax(30rem,1fr)_minmax(14rem,316px)]">
          <aside className="hidden min-h-0 gap-2.5 lg:grid lg:grid-rows-[minmax(0,225px)_minmax(0,1fr)]">
            <div
              data-board-section="left-briefing-panel"
              data-board-name="Left briefing panel"
              className="min-h-0 bg-neutral-300"
            />
            <div
              data-board-section="left-ledger-panel"
              data-board-name="Left ledger panel"
              className="min-h-0 bg-neutral-300"
            />
          </aside>

          <section className="grid min-h-0 gap-2.5 lg:grid-rows-[minmax(0,1fr)_minmax(0,20rem)] xl:grid-rows-[minmax(0,1fr)_minmax(0,22rem)]">
            <div
              data-board-section="periodic-table-dock"
              data-board-name="Periodic table dock"
              className="min-h-0 overflow-hidden rounded-[2px] bg-neutral-300"
            >
              <canvas
                ref={periodicTableCanvasRef}
                data-board-section="periodic-table-canvas"
                data-board-name="Periodic table Pixi canvas"
                className="block size-full touch-none bg-neutral-100"
                aria-label="Periodic table Pixi canvas"
              >
                Periodic table Pixi canvas
              </canvas>
            </div>

            <div
              data-board-section="alchemy-workbench"
              data-board-name="Alchemy workbench"
              className="grid min-h-0 grid-cols-2 grid-rows-[repeat(4,minmax(0,1fr))] gap-3 bg-neutral-300 p-3 sm:grid-cols-5 sm:grid-rows-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-5 xl:gap-8"
            >
              {reagentSlots.map((slot) => (
                <ReagentSlot
                  key={slot.id}
                  draggedCard={draggedCard}
                  dropFeedback={getSlotDropFeedback(dropIntent, slot.id)}
                  onSlottedCardPointerDown={beginSlottedCardDrag}
                  sourceSwapGhostCard={getSourceSwapGhostCard(
                    dropIntent,
                    draggedCard,
                    boardState,
                    slot.id,
                  )}
                  slotId={slot.id}
                  slotName={slot.name}
                  slottedCard={getElementCard(boardState.reagentSlots[slot.id])}
                  swapAnimation={swapAnimation}
                />
              ))}

              <div
                data-board-section="transmutation-pad"
                data-board-name="Transmutation pad"
                className="col-span-full grid min-h-0 grid-cols-[6rem_1fr] items-center border border-neutral-600 bg-neutral-300 p-3 sm:col-span-4 lg:grid-cols-[7rem_1fr]"
              >
                <div
                  data-board-section="swipe-rune-handle"
                  data-board-name="Swipe rune handle"
                  className="grid size-22 place-items-center bg-neutral-800 lg:h-32 lg:w-26"
                >
                  <div className="flex h-14 items-center gap-3 lg:h-18 lg:gap-4" aria-hidden="true">
                    <span className="h-full w-0.5 bg-neutral-300" />
                    <span className="h-full w-0.5 bg-neutral-300" />
                    <span className="h-full w-0.5 bg-neutral-300" />
                  </div>
                </div>
                <p className="text-center font-serif text-2xl italic lg:text-3xl">
                  Swipe to transmute
                </p>
              </div>

              <div
                data-board-section="transmutation-output-slot"
                data-board-name="Transmutation output slot"
                className="col-span-full min-h-0 border border-neutral-600 bg-neutral-300 sm:col-span-1 sm:col-start-5"
              />
            </div>
          </section>

          <aside className="hidden min-h-0 gap-2.5 lg:grid lg:grid-rows-[minmax(0,1fr)_minmax(0,136px)]">
            <div
              data-board-section="right-inventory-panel"
              data-board-name="Right inventory panel"
              className="min-h-0 bg-neutral-300"
            />
            <div
              data-board-section="right-actions-panel"
              data-board-name="Right actions panel"
              className="min-h-0 bg-neutral-300"
            />
          </aside>
        </section>
      </div>
      {draggedCard ? (
        <div
          data-board-section="floating-element-card-layer"
          data-board-name="Floating element card layer"
          className="pointer-events-none fixed inset-0 z-50"
        >
          <div
            ref={draggedCardElementRef}
            data-board-section="floating-element-card"
            data-board-name="Floating element card"
            className={getCardShellClass(getFloatingCardFeedback(dropIntent), "floating")}
            style={{
              contain: "layout style paint",
              fontFamily: "Arial, sans-serif",
              height: `${FLOATING_ELEMENT_CARD_HEIGHT}px`,
              touchAction: "none",
              width: `${FLOATING_ELEMENT_CARD_WIDTH}px`,
            }}
          >
            <ElementCardFace card={draggedCard.card} />
          </div>
        </div>
      ) : null}
      {swapAnimation ? (
        <div
          ref={swapAnimationElementRef}
          data-board-section="swap-animation-card"
          data-board-name={`${swapAnimation.card.name} swap animation card`}
          data-card-id={swapAnimation.card.id}
          data-swap-duration-ms={swapAnimation.durationMs}
          data-swap-from-slot={swapAnimation.fromSlotId}
          data-swap-to-slot={swapAnimation.toSlotId}
          className={getSwapAnimationCardClass()}
          style={{
            contain: "layout style paint",
            fontFamily: "Arial, sans-serif",
            height: `${swapAnimation.fromRect.height}px`,
            left: `${swapAnimation.fromRect.left}px`,
            top: `${swapAnimation.fromRect.top}px`,
            width: `${swapAnimation.fromRect.width}px`,
          }}
        >
          <ElementCardFace card={swapAnimation.card} />
        </div>
      ) : null}
    </main>
  );
});

function setMotionProperty(
  motion: AnimatableObject,
  property: string,
  value: number,
  duration = 0,
  ease?: EasingParam,
): void {
  const setter = motion[property];
  if (!setter) return;
  if (ease) {
    setter(value, duration, ease);
    return;
  }
  setter(value, duration);
}

function getElementCard(cardId: string | null): PeriodicElementCard | null {
  if (!cardId) return null;
  return elementCardsById.get(cardId) ?? null;
}

function getSourceSwapGhostCard(
  intent: DropIntent,
  draggedCard: DraggedElementCard | null,
  boardState: AlchemistGuildBoardState,
  slotId: AlchemistGuildReagentSlotId,
): PeriodicElementCard | null {
  if (intent.kind !== "swap" || draggedCard?.source.kind !== "slot") return null;
  if (draggedCard.source.slotId !== slotId) return null;
  return getElementCard(boardState.reagentSlots[intent.slotId]);
}

function getDropSlotIdAtCardCenter(
  cardLeft: number,
  cardTop: number,
  slotHitRects: readonly SlotHitRect[],
): AlchemistGuildReagentSlotId | null {
  const clientX = cardLeft + FLOATING_ELEMENT_CARD_WIDTH / 2;
  const clientY = cardTop + FLOATING_ELEMENT_CARD_HEIGHT / 2;

  for (const rect of slotHitRects) {
    const isInside =
      clientX >= rect.left &&
      clientX <= rect.left + rect.width &&
      clientY >= rect.top &&
      clientY <= rect.top + rect.height;
    if (isInside) return rect.slotId;
  }

  return null;
}

function createSwapAnimation({
  card,
  fromSlotId,
  id,
  toSlotId,
}: {
  card: PeriodicElementCard;
  fromSlotId: AlchemistGuildReagentSlotId;
  id: string;
  toSlotId: AlchemistGuildReagentSlotId;
}): SwapAnimation | null {
  const fromRect = getSlotRect(fromSlotId);
  const toRect = getSlotRect(toSlotId);
  if (!fromRect || !toRect) return null;

  return {
    card,
    durationMs: getSwapDurationMs(fromSlotId, toSlotId),
    fromRect,
    fromSlotId,
    id,
    toRect,
    toSlotId,
  };
}

function getSlotRect(slotId: AlchemistGuildReagentSlotId): SlotRect | null {
  const slotElement = document.querySelector(`[data-reagent-slot-id="${slotId}"]`);
  if (!(slotElement instanceof HTMLElement)) return null;

  const rect = slotElement.getBoundingClientRect();
  return {
    height: rect.height,
    left: rect.left,
    top: rect.top,
    width: rect.width,
  };
}

function getSlotHitRects(): SlotHitRect[] {
  const slotHitRects: SlotHitRect[] = [];

  for (const slot of reagentSlots) {
    const rect = getSlotRect(slot.id);
    if (rect) slotHitRects.push({ ...rect, slotId: slot.id });
  }

  return slotHitRects;
}

function getSwapDurationMs(
  fromSlotId: AlchemistGuildReagentSlotId,
  toSlotId: AlchemistGuildReagentSlotId,
): number {
  const fromIndex = getSlotIndex(fromSlotId);
  const toIndex = getSlotIndex(toSlotId);
  const distance = Math.abs(fromIndex - toIndex);
  const normalized = clamp((distance - 1) / Math.max(reagentSlots.length - 2, 1), 0, 1);

  return Math.round(
    SWAP_MIN_DURATION_MS + (SWAP_MAX_DURATION_MS - SWAP_MIN_DURATION_MS) * normalized,
  );
}

function getSlotIndex(slotId: AlchemistGuildReagentSlotId): number {
  return reagentSlots.findIndex((slot) => slot.id === slotId);
}

function resolveDropIntent(
  draggedCard: DraggedElementCard,
  slotId: AlchemistGuildReagentSlotId | null,
  boardState: AlchemistGuildBoardState,
): DropIntent {
  if (!slotId) return EMPTY_DROP_INTENT;

  const source = draggedCard.source;
  if (source.kind === "slot" && source.slotId === slotId) {
    return { kind: "drop", slotId };
  }

  const targetCardId = boardState.reagentSlots[slotId];
  if (!targetCardId) return { kind: "drop", slotId };
  if (source.kind === "slot") return { kind: "swap", slotId };
  return { kind: "blocked", slotId };
}

function isSameDropIntent(left: DropIntent, right: DropIntent): boolean {
  return left.kind === right.kind && getDropIntentSlotId(left) === getDropIntentSlotId(right);
}

function getDropIntentSlotId(intent: DropIntent): AlchemistGuildReagentSlotId | null {
  return intent.kind === "none" ? null : intent.slotId;
}

function getSlotDropFeedback(
  intent: DropIntent,
  slotId: AlchemistGuildReagentSlotId,
): DropFeedback {
  return intent.kind !== "none" && intent.slotId === slotId ? intent.kind : "none";
}

function getFloatingCardFeedback(intent: DropIntent): DropFeedback {
  return intent.kind;
}

function getSlotShellClass(feedback: DropFeedback): string {
  const base =
    "relative h-[148px] w-[105px] justify-self-center border-2 border-dashed transition-[background-color,border-color,box-shadow] duration-100";

  switch (feedback) {
    case "drop":
      return `${base} border-emerald-500 bg-emerald-100 shadow-[0_0_0_4px_rgba(16,185,129,0.24)]`;
    case "swap":
      return `${base} border-amber-500 bg-amber-100 shadow-[0_0_0_4px_rgba(245,158,11,0.28)]`;
    case "blocked":
      return `${base} border-rose-500 bg-rose-100 shadow-[0_0_0_4px_rgba(244,63,94,0.24)]`;
    default:
      return `${base} border-neutral-600 bg-neutral-300`;
  }
}

function getCardShellClass(feedback: DropFeedback, placement: "floating" | "slotted"): string {
  const base =
    placement === "floating"
      ? "absolute left-0 top-0 select-none overflow-hidden rounded-[3px] border-2 bg-[#eeeeee] shadow-[0_14px_28px_rgba(0,0,0,0.26)] transition-[border-color,box-shadow] duration-100"
      : "absolute inset-0 z-10 cursor-grab touch-none select-none overflow-hidden rounded-[3px] border-2 p-0 text-left transition-[background-color,border-color,box-shadow,opacity] duration-100 active:cursor-grabbing";

  switch (feedback) {
    case "drop":
      return `${base} border-emerald-500 bg-emerald-50 shadow-[inset_0_0_0_3px_rgba(16,185,129,0.24),0_8px_18px_rgba(0,0,0,0.18)]`;
    case "swap":
      return `${base} border-amber-500 bg-amber-50 shadow-[inset_0_0_0_3px_rgba(245,158,11,0.3),0_8px_18px_rgba(0,0,0,0.18)]`;
    case "blocked":
      return `${base} border-rose-500 bg-rose-50 shadow-[inset_0_0_0_3px_rgba(244,63,94,0.24),0_8px_18px_rgba(0,0,0,0.18)]`;
    default:
      return `${base} border-[#888888] bg-[#eeeeee] shadow-[0_8px_18px_rgba(0,0,0,0.18)]`;
  }
}

function getDropGhostClass(feedback: DropFeedback): string {
  const base =
    "pointer-events-none absolute inset-1 z-20 overflow-hidden rounded-[3px] border-2 border-dashed bg-[#eeeeee] opacity-35 shadow-[0_10px_24px_rgba(0,0,0,0.18)]";

  return feedback === "swap"
    ? `${base} border-amber-600 rotate-2 scale-[0.9]`
    : `${base} border-emerald-600 scale-[0.92]`;
}

function getSwapAnimationCardClass(): string {
  return "pointer-events-none fixed z-[60] overflow-hidden rounded-[3px] border-2 border-amber-500 bg-amber-50 shadow-[0_18px_32px_rgba(0,0,0,0.28)]";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
