import {
  ALCHEMY_CRAFTED_CARDS,
  type AlchemistGuildBoardSlots,
  type AlchemistGuildBoardState,
  type AlchemistGuildInventoryCooldown,
  type AlchemistGuildInventorySlotId,
  AlchemistGuildInventorySlotIdSchema,
  type AlchemistGuildInventorySlots,
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
import { PackageOpen } from "lucide-react";
import {
  type CSSProperties,
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
  type PeriodicTableElementGrab,
  setupPeriodicTableScene,
} from "./periodic-table-scene";
import { FIRST_PROFILE_CARD_PROPS, ProfileCard } from "./profile-card";
import { FIRST_QUEST_BRIEFING_CARD_PROPS, QuestBriefingCard } from "./quest-briefing-card";
import {
  type AlchemyWorkbenchRecipePreview,
  getAlchemyWorkbenchRecipePreview,
} from "./recipe-preview";
import { AlchemistGuildBoardPropsSchema } from "./schema";

const PRM = "(prefers-reduced-motion: reduce)";
const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const DRAG_ROTATION_MULTIPLIER = 22;
const RELEASE_THROW_MS = 120;
const RELEASE_DURATION_MS = 180;
const SWAP_MIN_DURATION_MS = 180;
const SWAP_MAX_DURATION_MS = 300;
const TRANSMUTE_FLY_DURATION_MS = 420;
const TRANSMUTE_SWIPE_THRESHOLD = 0.72;
const TRANSMUTE_KNOB_WIDTH_PX = 96;
const TRANSMUTE_TRACK_PADDING_PX = 12;
const TRANSMUTE_COMMIT_HOLD_MS = 160;
const OUTPUT_CARD_COOLDOWN_MS = 1000;
const OUTPUT_COOLDOWN_PREFIXES = new Map<string, number>([["material:", OUTPUT_CARD_COOLDOWN_MS]]);
const MAX_VISIBLE_COOLDOWN_BARS = 4;
const EMPTY_DROP_INTENT: DropIntent = { kind: "none" };
const LOCALHOST_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);
const TOKEN_PREFIX_PATTERN = /^[a-z-]+:/;
const CARD_SYMBOL_CLEANUP_PATTERN = /[^A-Za-z0-9 ]/g;
const CARD_SYMBOL_WORD_PATTERN = /\s+/;
const WINDOW_POINTER_LISTENER_OPTIONS = {
  capture: true,
  passive: false,
} satisfies AddEventListenerOptions;
const WINDOW_POINTER_LISTENER_CAPTURE = true;
const BOARD_DOT_GRID_STYLE = {
  backgroundColor: "#f7f7f7",
  backgroundImage: "radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.22) 1px, transparent 0)",
  backgroundSize: "12px 12px",
} satisfies CSSProperties;
const GLASS_PANEL_CLASS =
  "pointer-events-auto relative min-h-0 rounded-[8px] border border-white/50 bg-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_16px_32px_rgba(15,23,42,0.14)] backdrop-blur-md backdrop-saturate-150";
const CLEAR_TABLE_WINDOW_CLASS =
  "pointer-events-none relative min-h-0 overflow-hidden rounded-[8px] border border-white/40 bg-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]";
const BOARD_DESCRIPTIONS = {
  alchemyWorkbench:
    "The five-slot Alchemy Workbench where elemental cards combine into compounds, materials, and quest items.",
  alchemyWorkbenchInfo:
    "Explains the recipe or output currently previewed by the Alchemy Workbench output slot.",
  inventory: "Stores crafted cards, gathered materials, and quest outputs in the top board strip.",
  inventoryScrollbar:
    "Provides horizontal scroll position for the Inventory strip when carried cards overflow.",
  outputSlot: "Previews what the current Alchemy Workbench card arrangement is about to make.",
  periodicTableVault: "Holds the unlocked elemental cards that can be picked up for crafting.",
  profile: "Shows the player profile, guild rank, and long-term progression summary.",
  questBriefing: "Shows the active quest request, hint, and completion context.",
  transmutationPad: "Confirms the current workbench recipe and starts the crafting transformation.",
} as const;

const reagentSlots = [
  { id: "reagent-slot-1", name: "Reagent slot 1" },
  { id: "reagent-slot-2", name: "Reagent slot 2" },
  { id: "reagent-slot-3", name: "Reagent slot 3" },
  { id: "reagent-slot-4", name: "Reagent slot 4" },
  { id: "reagent-slot-5", name: "Reagent slot 5" },
] satisfies readonly { id: AlchemistGuildReagentSlotId; name: string }[];

const inventorySlots = [
  { id: "inventory-slot-1", name: "Inventory slot 1" },
  { id: "inventory-slot-2", name: "Inventory slot 2" },
  { id: "inventory-slot-3", name: "Inventory slot 3" },
  { id: "inventory-slot-4", name: "Inventory slot 4" },
  { id: "inventory-slot-5", name: "Inventory slot 5" },
  { id: "inventory-slot-6", name: "Inventory slot 6" },
  { id: "inventory-slot-7", name: "Inventory slot 7" },
  { id: "inventory-slot-8", name: "Inventory slot 8" },
] satisfies readonly { id: AlchemistGuildInventorySlotId; name: string }[];

type AlchemyBoardCard = {
  detailLabel: string;
  familyColor: string;
  id: string;
  imagePath: string;
  kind: "crafted" | "element";
  kindLabel: string;
  name: string;
  symbol: string;
  atomicNumber?: number;
};

const alchemyCardsById = new Map<string, AlchemyBoardCard>();
for (const card of ELEMENT_CARDS) {
  alchemyCardsById.set(card.id, {
    atomicNumber: card.element.atomicNumber,
    detailLabel: card.element.atomicMass,
    familyColor: card.visual.familyColor,
    id: card.id,
    imagePath: card.visual.imagePath,
    kind: "element",
    kindLabel: "Element",
    name: card.name,
    symbol: card.symbol,
  });
}
for (const card of ALCHEMY_CRAFTED_CARDS) {
  alchemyCardsById.set(card.cardId, {
    detailLabel: formatTokenLabel(card.kind),
    familyColor: "#7dd3fc",
    id: card.cardId,
    imagePath: card.imagePath,
    kind: "crafted",
    kindLabel: formatTokenLabel(card.kind),
    name: card.name,
    symbol: createCardSymbol(card.name),
  });
}

type DragSource =
  | { kind: "table" }
  | {
      kind: "inventory";
      slotId: AlchemistGuildInventorySlotId;
      stackCount: number;
    }
  | {
      kind: "slot";
      slotId: AlchemistGuildReagentSlotId;
    };

type DraggedAlchemyCard = {
  card: AlchemyBoardCard;
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
  | { kind: "quest" }
  | { kind: "swap"; slotId: AlchemistGuildReagentSlotId }
  | { kind: "replace"; slotId: AlchemistGuildReagentSlotId }
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
  card: AlchemyBoardCard;
  durationMs: number;
  fromRect: SlotRect;
  fromSlotId: AlchemistGuildReagentSlotId;
  id: string;
  toRect: SlotRect;
  toSlotId: AlchemistGuildReagentSlotId;
};

type TransmuteFlyAnimation = {
  card: AlchemyBoardCard;
  fromRect: SlotRect;
  id: string;
  stackCount?: number;
  toRect: SlotRect;
};

type PointerSample = {
  clientX: number;
  clientY: number;
  time: number;
};

const AlchemyCardFacePropsSchema = z.object({
  card: z.custom<AlchemyBoardCard>(),
});

const AlchemyCardFace = defineComponent(AlchemyCardFacePropsSchema, ({ card }) => (
  <>
    <div
      className="absolute left-1.5 right-1.5 top-1.5 h-2 rounded-full"
      style={{ backgroundColor: card.familyColor }}
    />
    {card.atomicNumber ? (
      <span className="absolute left-2 top-4 text-[13px] font-bold leading-none text-neutral-950">
        {card.atomicNumber}
      </span>
    ) : (
      <span className="absolute left-2 top-4 text-[9px] font-black uppercase leading-none text-sky-950/70">
        {card.kindLabel}
      </span>
    )}
    <span className="absolute inset-x-0 top-[19px] z-10 text-center text-[31px] font-bold leading-none text-neutral-950">
      {card.symbol}
    </span>
    <img
      src={getAlchemyCardArtSrc(card)}
      alt=""
      aria-hidden="true"
      className="absolute left-1/2 top-[51px] size-[62px] -translate-x-1/2 object-contain"
      draggable={false}
    />
    <span className="absolute inset-x-1 bottom-7 truncate text-center text-[12px] leading-none text-neutral-900">
      {card.name}
    </span>
    <span className="absolute inset-x-1 bottom-3 text-center text-[10px] leading-none text-neutral-700">
      {card.detailLabel}
    </span>
  </>
));

const SlottedAlchemyCardPropsSchema = z.object({
  card: z.custom<AlchemyBoardCard | null>(),
  feedback: z.custom<DropFeedback>(),
  hidden: z.boolean(),
  onPointerDown: z.custom<(event: ReactPointerEvent<HTMLButtonElement>) => void>(),
  slotName: z.string(),
});

const SlottedAlchemyCard = defineComponent(
  SlottedAlchemyCardPropsSchema,
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
          fontFamily: "var(--font-sans)",
        }}
        aria-label={`Pick up ${card.name} from ${slotName}`}
        onPointerDown={onPointerDown}
      >
        <AlchemyCardFace card={card} />
      </button>
    );
  },
);

const DropGhostPropsSchema = z.object({
  card: z.custom<AlchemyBoardCard>(),
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
    <AlchemyCardFace card={card} />
  </div>
));

const BoardDebugBadgePropsSchema = z.object({
  description: z.string().min(1),
  label: z.string().min(1),
  visible: z.boolean(),
});

const BoardDebugBadge = defineComponent(
  BoardDebugBadgePropsSchema,
  ({ description, label, visible }) =>
    visible ? (
      <span className="pointer-events-none absolute left-1 top-1 z-[80] max-w-[min(22rem,calc(100%-0.5rem))]">
        <span
          data-board-debug-badge=""
          className="inline-block rounded-[2px] bg-red-600 px-2 py-1 text-[11px] font-bold uppercase leading-none tracking-normal text-white shadow-[0_1px_0_rgba(0,0,0,0.5)]"
        >
          {label}
        </span>
        <span className="mt-1 block rounded-[2px] bg-neutral-950/85 px-2 py-1.5 text-[11px] font-semibold leading-snug tracking-normal text-white shadow-[0_1px_0_rgba(0,0,0,0.5)]">
          {description}
        </span>
      </span>
    ) : null,
);

const ReagentSlotPropsSchema = z.object({
  draggedCard: z.custom<DraggedAlchemyCard | null>(),
  dropFeedback: z.custom<DropFeedback>(),
  onSlottedCardPointerDown:
    z.custom<
      (
        slotId: AlchemistGuildReagentSlotId,
        card: AlchemyBoardCard,
        event: ReactPointerEvent<HTMLButtonElement>,
      ) => void
    >(),
  slotId: AlchemistGuildReagentSlotIdSchema,
  slotName: z.string(),
  slottedCard: z.custom<AlchemyBoardCard | null>(),
  sourceSwapGhostCard: z.custom<AlchemyBoardCard | null>(),
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
        <SlottedAlchemyCard
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

const InventorySlotPropsSchema = z.object({
  card: z.custom<AlchemyBoardCard | null>(),
  cooldowns: z.array(z.custom<AlchemistGuildInventoryCooldown>()),
  draggedCard: z.custom<DraggedAlchemyCard | null>(),
  nowMs: z.number(),
  onPointerDown:
    z.custom<
      (
        slotId: AlchemistGuildInventorySlotId,
        card: AlchemyBoardCard,
        readyCount: number,
        event: ReactPointerEvent<HTMLButtonElement>,
      ) => void
    >(),
  slotId: AlchemistGuildInventorySlotIdSchema,
  slotName: z.string(),
});

const InventorySlot = defineComponent(
  InventorySlotPropsSchema,
  ({ card, cooldowns, draggedCard, nowMs, onPointerDown, slotId, slotName }) => {
    const stackCount = cooldowns.length;
    const readyCount = getReadyCooldownCount(cooldowns, nowMs);
    const isDraggingSource =
      draggedCard?.source.kind === "inventory" && draggedCard.source.slotId === slotId;

    return (
      <div
        data-inventory-slot-id={slotId}
        data-board-section={slotId}
        data-board-name={slotName}
        className="relative h-14 min-w-[7.35rem] rounded-[6px] border border-dashed border-neutral-700/50 bg-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
      >
        {card ? (
          <button
            type="button"
            data-board-section="inventory-card"
            data-board-name={`${card.name} inventory card`}
            data-card-id={card.id}
            data-ready-count={readyCount}
            data-stack-count={stackCount}
            className={`absolute inset-1 grid touch-none select-none grid-cols-[2.3rem_minmax(0,1fr)] items-center gap-1.5 rounded-[5px] border bg-white/70 px-1.5 text-left shadow-[0_5px_14px_rgba(15,23,42,0.14)] transition-[border-color,opacity,box-shadow] [-webkit-user-drag:none] active:cursor-grabbing ${
              readyCount > 0
                ? "cursor-grab border-emerald-600/50"
                : "cursor-not-allowed border-amber-500/60 opacity-80"
            } ${isDraggingSource ? "opacity-45" : ""}`}
            aria-label={
              readyCount > 0
                ? `Pick up ${readyCount} ready ${card.name} from ${slotName}`
                : `${card.name} cooling down in ${slotName}`
            }
            onPointerDown={(event) => {
              if (readyCount > 0) onPointerDown(slotId, card, readyCount, event);
            }}
            onDragStart={(event) => {
              event.preventDefault();
            }}
          >
            <img
              src={getAlchemyCardArtSrc(card)}
              alt=""
              aria-hidden="true"
              className="size-9 object-contain"
              draggable={false}
            />
            <span className="min-w-0">
              <span className="block truncate text-[12px] font-black leading-tight text-sky-950">
                {card.name}
              </span>
              <span className="block truncate text-[9px] font-bold uppercase leading-tight text-neutral-700">
                {readyCount}/{stackCount} ready
              </span>
            </span>
            <span className="absolute -right-1.5 -top-1.5 rounded-full bg-sky-950 px-1.5 py-0.5 text-[10px] font-black leading-none text-white">
              x{stackCount}
            </span>
            <CooldownStack cooldowns={cooldowns} nowMs={nowMs} />
          </button>
        ) : null}
      </div>
    );
  },
);

const CooldownStackPropsSchema = z.object({
  cooldowns: z.array(z.custom<AlchemistGuildInventoryCooldown>()),
  nowMs: z.number(),
});

const CooldownStack = defineComponent(CooldownStackPropsSchema, ({ cooldowns, nowMs }) => {
  const pendingCooldowns = getPendingCooldowns(cooldowns, nowMs);
  if (pendingCooldowns.length === 0) return null;

  const visibleCooldowns = pendingCooldowns.slice(0, MAX_VISIBLE_COOLDOWN_BARS);
  const hiddenCooldownCount = pendingCooldowns.length - visibleCooldowns.length;

  return (
    <span
      data-board-section="inventory-cooldown-stack"
      data-pending-count={pendingCooldowns.length}
      data-visible-count={visibleCooldowns.length}
      className="pointer-events-none absolute inset-x-1 bottom-1 flex h-1.5 gap-0.5"
      aria-hidden="true"
    >
      {visibleCooldowns.map((cooldown) => (
        <span key={cooldown.id} className="min-w-0 flex-1 overflow-hidden rounded-full bg-black/15">
          <span
            className="block h-full rounded-full bg-amber-400"
            style={{ width: `${Math.round(getCooldownProgress(cooldown, nowMs) * 100)}%` }}
          />
        </span>
      ))}
      {hiddenCooldownCount > 0 ? (
        <span
          data-board-section="inventory-cooldown-overflow"
          className="grid h-3 min-w-4 -translate-y-0.5 place-items-center rounded-full bg-amber-500 px-1 text-[8px] font-black leading-none text-white shadow-[0_1px_2px_rgba(15,23,42,0.24)]"
        >
          +{hiddenCooldownCount}
        </span>
      ) : null}
    </span>
  );
});

const OutputSlotPreviewPropsSchema = z.object({
  preview: z.custom<AlchemyWorkbenchRecipePreview | null>(),
});

const OutputSlotPreview = defineComponent(OutputSlotPreviewPropsSchema, ({ preview }) => (
  <div className="absolute inset-0 min-h-0" aria-live="polite">
    {preview ? (
      <OutputRecipeCard key={preview.recipe.id} preview={preview} />
    ) : (
      <span
        data-output-slot-empty=""
        className="grid size-full place-items-center px-2 text-center text-[11px] font-bold uppercase leading-snug tracking-normal text-neutral-700/70"
      >
        No output
      </span>
    )}
  </div>
));

const OutputRecipeCardPropsSchema = z.object({
  preview: z.custom<AlchemyWorkbenchRecipePreview>(),
});

const OutputRecipeCard = defineComponent(OutputRecipeCardPropsSchema, ({ preview }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setVisible(true);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <article
      data-output-recipe-card=""
      data-recipe-id={preview.recipe.id}
      className={`absolute -inset-px grid select-none grid-rows-[auto_1fr_auto] overflow-hidden rounded-[6px] border-2 border-sky-800/55 bg-sky-50/95 p-1.5 text-center shadow-[0_10px_22px_rgba(15,23,42,0.22)] transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      aria-label={`${preview.recipe.output.name} output preview`}
    >
      <span className="justify-self-end rounded-[3px] bg-sky-950 px-1.5 py-0.5 font-mono text-[10px] font-black leading-none text-white">
        {preview.formula}
      </span>
      <img
        src={resolvePublicAssetPath(preview.recipe.output.imagePath)}
        alt=""
        aria-hidden="true"
        className="mx-auto size-16 self-center object-contain"
        draggable={false}
      />
      <span className="grid gap-0.5">
        <span className="truncate font-serif text-lg font-bold leading-none text-sky-950">
          {preview.recipe.output.name}
        </span>
        <span className="truncate text-[9px] font-bold uppercase leading-none tracking-normal text-sky-950/65">
          {formatTokenLabel(preview.recipe.output.kind)}
        </span>
      </span>
    </article>
  );
});

const AlchemyWorkbenchInfoPanelPropsSchema = z.object({
  preview: z.custom<AlchemyWorkbenchRecipePreview | null>(),
});

const AlchemyWorkbenchInfoPanel = defineComponent(
  AlchemyWorkbenchInfoPanelPropsSchema,
  ({ preview }) => {
    if (!preview) {
      return (
        <div
          data-workbench-info-empty=""
          className="grid h-full min-h-0 place-items-center p-4 text-center"
        >
          <p className="max-w-52 text-sm font-semibold leading-snug text-neutral-800/70">
            Match a recipe exactly in the Alchemy Workbench to preview its output here.
          </p>
        </div>
      );
    }

    return (
      <article
        data-workbench-info-recipe=""
        data-recipe-id={preview.recipe.id}
        className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3 p-3 text-neutral-950"
      >
        <header className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3">
          <div className="grid size-14 place-items-center rounded-[5px] border border-sky-900/30 bg-white/75">
            <img
              src={resolvePublicAssetPath(preview.recipe.output.imagePath)}
              alt=""
              aria-hidden="true"
              className="size-12 object-contain"
              draggable={false}
            />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase leading-none tracking-normal text-sky-950/65">
              {preview.recipe.id}
            </p>
            <h2 className="truncate font-serif text-2xl leading-none text-sky-950">
              {preview.recipe.output.name}
            </h2>
            <div className="mt-1 flex flex-wrap gap-1">
              <InfoBadge label={formatTokenLabel(preview.recipe.action)} />
              <InfoBadge label={formatTokenLabel(preview.recipe.station)} />
              <InfoBadge label={formatTokenLabel(preview.recipe.output.kind)} />
            </div>
          </div>
        </header>

        <div className="min-h-0 overflow-y-auto pr-1">
          <section className="grid gap-1.5 rounded-[5px] border border-sky-900/20 bg-white/55 p-2">
            <h3 className="text-[11px] font-semibold uppercase leading-none tracking-normal text-sky-950/65">
              Recipe
            </h3>
            <p className="font-mono text-sm font-black leading-none text-sky-950">
              {preview.formula}
            </p>
            <dl className="grid gap-1">
              {preview.ingredientRows.map((ingredient) => (
                <div
                  key={`${ingredient.cardId}:${ingredient.role}`}
                  className="grid grid-cols-[1fr_auto] gap-2 text-xs leading-tight"
                >
                  <dt className="min-w-0 truncate font-bold text-neutral-900">
                    {ingredient.label}
                  </dt>
                  <dd className="font-semibold text-neutral-700">
                    x{ingredient.quantity} · {ingredient.role}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-2 grid gap-1.5 rounded-[5px] border border-sky-900/20 bg-white/55 p-2">
            <h3 className="text-[11px] font-semibold uppercase leading-none tracking-normal text-sky-950/65">
              What it means
            </h3>
            {(preview.kidInfo?.sentences ?? [preview.recipe.education.note]).map((sentence) => (
              <p key={sentence} className="text-xs font-semibold leading-snug text-neutral-800">
                {sentence}
              </p>
            ))}
          </section>

          <section className="mt-2 grid gap-1.5 rounded-[5px] border border-sky-900/20 bg-white/55 p-2">
            <h3 className="text-[11px] font-semibold uppercase leading-none tracking-normal text-sky-950/65">
              Guild notes
            </h3>
            <p className="text-xs font-semibold leading-snug text-neutral-800">
              {preview.recipe.education.note}
            </p>
            <div className="flex flex-wrap gap-1">
              {preview.recipe.education.concepts.map((concept) => (
                <InfoBadge key={concept} label={concept} />
              ))}
              <InfoBadge label={formatTokenLabel(preview.recipe.education.safetyTier)} />
            </div>
          </section>

          <section className="mt-2 grid gap-1.5 rounded-[5px] border border-sky-900/20 bg-white/55 p-2">
            <h3 className="text-[11px] font-semibold uppercase leading-none tracking-normal text-sky-950/65">
              Progression
            </h3>
            <dl className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs leading-tight">
              <InfoFact label="Cohort" value={String(preview.recipe.progression.cohort)} />
              <InfoFact label="Unlock" value={`${preview.recipe.progression.unlockMinute} min`} />
              <InfoFact label="Depth" value={String(preview.recipe.progression.graphDepth)} />
              <InfoFact
                label="Complexity"
                value={`${Math.round(preview.recipe.progression.normalizedComplexity * 100)}%`}
              />
            </dl>
          </section>

          {preview.kidInfo ? (
            <section className="mt-2 grid gap-1.5 rounded-[5px] border border-sky-900/20 bg-white/55 p-2">
              <h3 className="text-[11px] font-semibold uppercase leading-none tracking-normal text-sky-950/65">
                Sources
              </h3>
              <div className="flex flex-wrap gap-1">
                {preview.kidInfo.sourceIds.map((sourceId) => (
                  <InfoBadge key={sourceId} label={formatTokenLabel(sourceId)} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </article>
    );
  },
);

const InfoBadgePropsSchema = z.object({
  label: z.string().min(1),
});

const InfoBadge = defineComponent(InfoBadgePropsSchema, ({ label }) => (
  <span className="rounded-full border border-sky-900/20 bg-sky-50/80 px-1.5 py-0.5 text-[10px] font-bold leading-none text-sky-950">
    {label}
  </span>
));

const InfoFactPropsSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

const InfoFact = defineComponent(InfoFactPropsSchema, ({ label, value }) => (
  <>
    <dt className="font-bold text-neutral-700">{label}</dt>
    <dd className="font-black text-neutral-950">{value}</dd>
  </>
));

export const AlchemistGuildBoard = defineComponent(AlchemistGuildBoardPropsSchema, () => {
  const boardState = useAtomValue(alchemistGuildBoardAtom);
  const setBoardState = useSetAtom(alchemistGuildBoardAtom);
  const periodicTableCanvasRef = useRef<HTMLCanvasElement>(null);
  const periodicTableViewportRef = useRef<HTMLDivElement>(null);
  const draggedCardElementRef = useRef<HTMLDivElement>(null);
  const swapAnimationElementRef = useRef<HTMLDivElement>(null);
  const transmuteFlyAnimationElementRef = useRef<HTMLDivElement>(null);
  const transmutePadTrackRef = useRef<HTMLDivElement>(null);
  const boardStateRef = useRef(boardState);
  const dropIntentRef = useRef<DropIntent>(EMPTY_DROP_INTENT);
  const notifiedCooldownIdsRef = useRef<Set<string> | null>(null);
  const dragSequenceRef = useRef(0);
  const swapAnimationSequenceRef = useRef(0);
  const transmuteFlyAnimationSequenceRef = useRef(0);
  const [draggedCard, setDraggedCard] = useState<DraggedAlchemyCard | null>(null);
  const [dropIntent, setDropIntent] = useState<DropIntent>(EMPTY_DROP_INTENT);
  const [swapAnimation, setSwapAnimation] = useState<SwapAnimation | null>(null);
  const [transmuteFlyAnimation, setTransmuteFlyAnimation] = useState<TransmuteFlyAnimation | null>(
    null,
  );
  const [transmuteSwipeProgress, setTransmuteSwipeProgress] = useState(0);
  const [isTransmuteDragging, setIsTransmuteDragging] = useState(false);
  const [transmuteTrackWidth, setTransmuteTrackWidth] = useState(0);
  const showBoardDebugBadges = useLocalhostMetaKeyDebugBadges();
  const nowMs = useInventoryClock(boardState.inventorySlots);
  const recipePreview = getAlchemyWorkbenchRecipePreview(getWorkbenchCardIds(boardState));
  const transmuteKnobTravelPx = Math.max(
    0,
    transmuteTrackWidth - TRANSMUTE_KNOB_WIDTH_PX - TRANSMUTE_TRACK_PADDING_PX * 2,
  );
  boardStateRef.current = boardState;

  const beginElementDrag = (grab: PeriodicTableElementGrab) => {
    const card = getAlchemyCard(grab.card.id);
    if (!card) return;

    dragSequenceRef.current += 1;
    const nextDraggedCard: DraggedAlchemyCard = {
      card,
      grabOffsetX: grab.grabOffsetX,
      grabOffsetY: grab.grabOffsetY,
      id: `${card.id}:${dragSequenceRef.current}`,
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
    card: AlchemyBoardCard,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (event.button !== 0) return;
    event.preventDefault();
    capturePointer(event.currentTarget, event.pointerId);
    const rect = event.currentTarget.getBoundingClientRect();
    dragSequenceRef.current += 1;
    const nextDraggedCard: DraggedAlchemyCard = {
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

  const beginInventoryCardDrag = (
    slotId: AlchemistGuildInventorySlotId,
    card: AlchemyBoardCard,
    readyCount: number,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (event.button !== 0 || readyCount < 1) return;
    event.preventDefault();
    capturePointer(event.currentTarget, event.pointerId);
    const rect = event.currentTarget.getBoundingClientRect();
    const grabOffset = getScaledPointerOffset(event, rect);
    dragSequenceRef.current += 1;
    const nextDraggedCard: DraggedAlchemyCard = {
      card,
      grabOffsetX: grabOffset.x,
      grabOffsetY: grabOffset.y,
      id: `${card.id}:${dragSequenceRef.current}`,
      pointerId: event.pointerId,
      source: { kind: "inventory", slotId, stackCount: readyCount },
      startClientX: event.clientX,
      startClientY: event.clientY,
    };

    dropIntentRef.current = EMPTY_DROP_INTENT;
    setDropIntent(EMPTY_DROP_INTENT);
    setDraggedCard(nextDraggedCard);
    void sfx.play("card.slot.pickup");
  };

  const commitTransmutation = () => {
    if (!recipePreview) return;

    const outputCard = getRecipeOutputBoardCard(recipePreview);
    const currentBoardState = boardStateRef.current;
    const destinationSlotId = getInventoryDestinationSlotId(currentBoardState, outputCard.id);
    if (!destinationSlotId) {
      void sfx.play("card.dissolve");
      return;
    }

    const fromRect = getCenteredCardRect(
      getElementRect("[data-output-recipe-card]") ??
        getElementRect('[data-board-section="transmutation-output-slot"]'),
      FLOATING_ELEMENT_CARD_WIDTH,
      FLOATING_ELEMENT_CARD_HEIGHT,
    );
    const toRect = getCenteredCardRect(
      getInventorySlotRect(destinationSlotId),
      FLOATING_ELEMENT_CARD_WIDTH,
      FLOATING_ELEMENT_CARD_HEIGHT,
    );

    if (fromRect && toRect) {
      transmuteFlyAnimationSequenceRef.current += 1;
      setTransmuteFlyAnimation({
        card: outputCard,
        fromRect,
        id: `transmute:${transmuteFlyAnimationSequenceRef.current}`,
        toRect,
      });
    }

    const startedAtMs = Date.now();
    setBoardState((previous) => {
      const targetSlotId = getInventoryDestinationSlotId(previous, outputCard.id);
      if (!targetSlotId) return previous;

      return {
        ...previous,
        inventorySlots: addInventoryCooldown(
          previous.inventorySlots,
          targetSlotId,
          outputCard.id,
          startedAtMs,
        ),
        reagentSlots: clearReagentSlots(),
      };
    });
    void sfx.play("card.massDissolve");
  };

  const handleTransmutationSwipePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !recipePreview) return;
    event.preventDefault();

    const pointerId = event.pointerId;
    const trackRect = transmutePadTrackRef.current?.getBoundingClientRect();
    if (!trackRect) return;

    const knobRect = event.currentTarget.getBoundingClientRect();
    const grabOffsetX = event.clientX - knobRect.left;
    const travelDistance = Math.max(
      trackRect.width - TRANSMUTE_KNOB_WIDTH_PX - TRANSMUTE_TRACK_PADDING_PX * 2,
      1,
    );
    let latestProgress = 0;
    let released = false;
    setIsTransmuteDragging(true);

    const syncProgress = (clientX: number) => {
      latestProgress = clamp(
        (clientX - trackRect.left - TRANSMUTE_TRACK_PADDING_PX - grabOffsetX) / travelDistance,
        0,
        1,
      );
      setTransmuteSwipeProgress(latestProgress);
      sfx.updateTransmuteRamp(latestProgress);
    };

    function handlePointerMove(pointerEvent: PointerEvent) {
      if (pointerEvent.pointerId !== pointerId || released) return;
      pointerEvent.preventDefault();
      syncProgress(pointerEvent.clientX);
    }

    function handlePointerRelease(pointerEvent: PointerEvent) {
      if (pointerEvent.pointerId !== pointerId || released) return;
      released = true;
      pointerEvent.preventDefault();
      syncProgress(pointerEvent.clientX);
      removePointerWindowListeners(handlePointerMove, handlePointerRelease);

      const committed = latestProgress >= TRANSMUTE_SWIPE_THRESHOLD;
      sfx.stopTransmuteRamp(committed ? 30 : 80);
      setIsTransmuteDragging(false);

      if (committed) {
        setTransmuteSwipeProgress(1);
        void sfx.play("transmute.complete");
        window.setTimeout(() => {
          commitTransmutation();
          setTransmuteSwipeProgress(0);
        }, TRANSMUTE_COMMIT_HOLD_MS);
        return;
      }

      setTransmuteSwipeProgress(0);
    }

    sfx.startTransmuteRamp();
    syncProgress(event.clientX);
    addPointerWindowListeners(handlePointerMove, handlePointerRelease);
  };

  usePixiApp(
    periodicTableCanvasRef,
    (app) =>
      setupPeriodicTableScene(app, {
        getInteractionRect: () => periodicTableViewportRef.current?.getBoundingClientRect() ?? null,
        onElementGrab: beginElementDrag,
      }),
    [],
    { autoStart: false, backgroundAlpha: 0, preference: "canvas" },
  );

  useEffect(() => {
    const trackElement = transmutePadTrackRef.current;
    if (!trackElement) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setTransmuteTrackWidth(entry.contentRect.width);
    });
    resizeObserver.observe(trackElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const notifiedCooldownIds = notifiedCooldownIdsRef.current;
    const presentCooldownIds = new Set<string>();
    const readyCooldownIds: string[] = [];

    for (const slot of inventorySlots) {
      const item = boardState.inventorySlots[slot.id];
      if (!item) continue;

      for (const cooldown of item.cooldowns) {
        presentCooldownIds.add(cooldown.id);
        if (cooldown.readyAtMs <= nowMs) readyCooldownIds.push(cooldown.id);
      }
    }

    if (!notifiedCooldownIds) {
      notifiedCooldownIdsRef.current = new Set(readyCooldownIds);
      return;
    }

    for (const cooldownId of notifiedCooldownIds) {
      if (!presentCooldownIds.has(cooldownId)) notifiedCooldownIds.delete(cooldownId);
    }

    let hasNewReadyCooldown = false;
    for (const cooldownId of readyCooldownIds) {
      if (notifiedCooldownIds.has(cooldownId)) continue;
      notifiedCooldownIds.add(cooldownId);
      hasNewReadyCooldown = true;
    }

    if (hasNewReadyCooldown) void sfx.play("cooldown.ready");
  }, [boardState.inventorySlots, nowMs]);

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
    const activeFlyAnimation = transmuteFlyAnimation;
    if (!activeFlyAnimation) return;

    const cardElement = transmuteFlyAnimationElementRef.current;
    if (!cardElement) return;

    const reducedMotion = typeof window !== "undefined" && window.matchMedia(PRM).matches;
    if (reducedMotion) {
      setTransmuteFlyAnimation(null);
      return;
    }

    const moveX = activeFlyAnimation.toRect.left - activeFlyAnimation.fromRect.left;
    const moveY = activeFlyAnimation.toRect.top - activeFlyAnimation.fromRect.top;
    const animation = animate(cardElement, {
      duration: TRANSMUTE_FLY_DURATION_MS,
      ease: "inOut(3)",
      opacity: [1, 0.86],
      rotate: ["0deg", "5deg"],
      scale: [0.9, 0.42],
      x: moveX,
      y: moveY,
      onComplete: () => {
        setTransmuteFlyAnimation((current) =>
          current?.id === activeFlyAnimation.id ? null : current,
        );
      },
    });

    return () => {
      animation.cancel();
    };
  }, [transmuteFlyAnimation]);

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
        isCardCenterInsideQuestBriefing(currentLeft, currentTop),
        boardStateRef.current,
      );

      if (isSameDropIntent(dropIntentRef.current, nextDropIntent)) return;
      dropIntentRef.current = nextDropIntent;
      setDropIntent(nextDropIntent);
    };

    const commitRelease = (dropSlotId: AlchemistGuildReagentSlotId | null) => {
      const source = activeDraggedCard.source;
      const currentBoardState = boardStateRef.current;
      const questDrop = isCardCenterInsideQuestBriefing(currentLeft, currentTop);
      const queueInventoryRemainderReturn = (consumedCount: number) => {
        if (source.kind !== "inventory") return;

        const returningCount = source.stackCount - consumedCount;
        if (returningCount < 1) return;

        const toRect = getCenteredCardRect(
          getInventorySlotRect(source.slotId),
          FLOATING_ELEMENT_CARD_WIDTH,
          FLOATING_ELEMENT_CARD_HEIGHT,
        );
        if (!toRect) return;

        transmuteFlyAnimationSequenceRef.current += 1;
        setTransmuteFlyAnimation({
          card: activeDraggedCard.card,
          fromRect: {
            height: FLOATING_ELEMENT_CARD_HEIGHT,
            left: currentLeft,
            top: currentTop,
            width: FLOATING_ELEMENT_CARD_WIDTH,
          },
          id: `inventory-return:${transmuteFlyAnimationSequenceRef.current}`,
          stackCount: returningCount,
          toRect,
        });
      };

      if (!dropSlotId) {
        if (source.kind === "inventory" && questDrop) {
          queueInventoryRemainderReturn(1);
          const releasedAtMs = Date.now();
          setBoardState((previous) => ({
            ...previous,
            inventorySlots: consumeReadyInventoryCopies(
              previous.inventorySlots,
              source.slotId,
              1,
              releasedAtMs,
            ),
          }));
          void sfx.play("card.drop");
          return;
        }

        if (source.kind === "slot") {
          setBoardState((previous) => ({
            ...previous,
            reagentSlots: { ...previous.reagentSlots, [source.slotId]: null },
          }));
          void sfx.play("card.dissolve");
          return;
        }

        queueInventoryRemainderReturn(0);
        void sfx.play(source.kind === "inventory" ? "card.drop" : "card.dissolve");
        return;
      }

      if (source.kind === "inventory") {
        const targetCardId = currentBoardState.reagentSlots[dropSlotId];
        if (targetCardId) {
          void sfx.play("card.drop");
          return;
        }

        queueInventoryRemainderReturn(1);
        const releasedAtMs = Date.now();
        setBoardState((previous) => ({
          ...previous,
          inventorySlots: consumeReadyInventoryCopies(
            previous.inventorySlots,
            source.slotId,
            1,
            releasedAtMs,
          ),
          reagentSlots: {
            ...previous.reagentSlots,
            [dropSlotId]: activeDraggedCard.card.id,
          },
        }));
        void sfx.play("card.drop");
        return;
      }

      if (source.kind === "slot" && source.slotId === dropSlotId) {
        void sfx.play("card.drop");
        return;
      }

      const targetCardId = currentBoardState.reagentSlots[dropSlotId];

      if (source.kind === "slot" && targetCardId) {
        const swapAnimationCard = getAlchemyCard(targetCardId);
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

      if (source.kind === "slot" && targetCardId) {
        void sfx.play("card.swap");
        return;
      }

      void sfx.play(targetCardId ? "card.replace" : "card.drop");
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
      removePointerWindowListeners(handlePointerMove, handlePointerRelease);
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

    addPointerWindowListeners(handlePointerMove, handlePointerRelease);

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
      className="relative isolate h-dvh overflow-hidden p-3 font-sans text-neutral-950 lg:p-4"
      style={BOARD_DOT_GRID_STYLE}
      aria-label="Alchemist Guild board"
    >
      <canvas
        ref={periodicTableCanvasRef}
        data-board-section="periodic-table-canvas"
        data-board-name="Periodic table Pixi canvas"
        className="absolute inset-0 z-0 block size-full touch-none"
        aria-label="Periodic table Pixi canvas"
      >
        Periodic table Pixi canvas
      </canvas>
      <div className="pointer-events-none relative z-10 mx-auto grid h-full min-h-0 max-w-[1332px] grid-rows-[5rem_0.75rem_minmax(0,1fr)] gap-2.5 lg:grid-rows-[5.5rem_0.75rem_minmax(0,1fr)]">
        <section
          data-board-section="top-inventory-panel"
          data-board-name="Inventory"
          data-board-description={BOARD_DESCRIPTIONS.inventory}
          className={`${GLASS_PANEL_CLASS} grid grid-cols-[3.25rem_1px_minmax(0,1fr)] items-center gap-3 px-3 py-2`}
          aria-label="Inventory"
        >
          <BoardDebugBadge
            description={BOARD_DESCRIPTIONS.inventory}
            label="Inventory"
            visible={showBoardDebugBadges}
          />
          <div
            className="grid size-10 place-items-center justify-self-start rounded-[6px] border border-sky-950/20 bg-white/40 text-sky-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.62)]"
            aria-hidden="true"
          >
            <PackageOpen className="size-5" strokeWidth={2.25} aria-hidden="true" />
          </div>
          <span className="h-10 w-px bg-neutral-950/25" aria-hidden="true" />
          <div
            data-board-section="inventory-shelf"
            data-board-name="Inventory shelf"
            className="flex min-h-14 min-w-0 items-center gap-2 overflow-x-auto pr-1"
          >
            {inventorySlots.map((slot) => {
              const item = boardState.inventorySlots[slot.id];

              return (
                <InventorySlot
                  key={slot.id}
                  card={getAlchemyCard(item?.cardId ?? null)}
                  cooldowns={item?.cooldowns ?? []}
                  draggedCard={draggedCard}
                  nowMs={nowMs}
                  onPointerDown={beginInventoryCardDrag}
                  slotId={slot.id}
                  slotName={slot.name}
                />
              );
            })}
          </div>
        </section>

        <div className={`${GLASS_PANEL_CLASS} p-0`}>
          <BoardDebugBadge
            description={BOARD_DESCRIPTIONS.inventoryScrollbar}
            label="Inventory Scrollbar"
            visible={showBoardDebugBadges}
          />
          <div
            data-board-section="inventory-scrollbar"
            data-board-name="Inventory Scrollbar"
            data-board-description={BOARD_DESCRIPTIONS.inventoryScrollbar}
            className="h-3 overflow-hidden rounded-[8px] bg-neutral-950/10"
            aria-hidden="true"
          >
            <span className="block h-full w-24 rounded-[8px] bg-sky-950/35" />
          </div>
        </div>

        <section className="grid min-h-0 gap-2.5 lg:grid-cols-[minmax(14rem,316px)_minmax(30rem,1fr)_minmax(14rem,316px)]">
          <aside className="hidden min-h-0 gap-2.5 lg:grid lg:grid-rows-[minmax(0,225px)_minmax(0,1fr)]">
            <div
              data-board-section="left-profile-panel"
              data-board-name="Profile"
              data-board-description={BOARD_DESCRIPTIONS.profile}
              className={`${GLASS_PANEL_CLASS} p-3`}
            >
              <BoardDebugBadge
                description={BOARD_DESCRIPTIONS.profile}
                label="Profile"
                visible={showBoardDebugBadges}
              />
              <ProfileCard
                {...FIRST_PROFILE_CARD_PROPS}
                playerName={boardState.profile.playerName}
                onPlayerNameChange={(nextPlayerName) => {
                  setBoardState((previous) => ({
                    ...previous,
                    profile: { ...previous.profile, playerName: nextPlayerName },
                  }));
                }}
              />
            </div>
            <div
              data-board-section="left-briefing-panel"
              data-board-name="Quest Briefing"
              data-board-description={BOARD_DESCRIPTIONS.questBriefing}
              className={`${GLASS_PANEL_CLASS} grid content-start gap-2 overflow-y-auto p-3`}
            >
              <BoardDebugBadge
                description={BOARD_DESCRIPTIONS.questBriefing}
                label="Quest Briefing"
                visible={showBoardDebugBadges}
              />
              <QuestBriefingCard
                {...FIRST_QUEST_BRIEFING_CARD_PROPS}
                developerNotesVisible={showBoardDebugBadges}
              />
            </div>
          </aside>

          <section className="grid min-h-0 gap-2.5 lg:grid-rows-[minmax(0,1fr)_minmax(0,20rem)] xl:grid-rows-[minmax(0,1fr)_minmax(0,22rem)]">
            <div
              ref={periodicTableViewportRef}
              data-board-section="periodic-table-dock"
              data-board-name="Periodic Table Vault"
              data-board-description={BOARD_DESCRIPTIONS.periodicTableVault}
              className={CLEAR_TABLE_WINDOW_CLASS}
            >
              <BoardDebugBadge
                description={BOARD_DESCRIPTIONS.periodicTableVault}
                label="Periodic Table Vault"
                visible={showBoardDebugBadges}
              />
            </div>

            <div
              data-board-section="alchemy-workbench"
              data-board-name="Alchemy Workbench"
              data-board-description={BOARD_DESCRIPTIONS.alchemyWorkbench}
              className={`${GLASS_PANEL_CLASS} grid grid-cols-2 grid-rows-[repeat(4,minmax(0,1fr))] gap-3 p-3 sm:grid-cols-5 sm:grid-rows-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-5 xl:gap-8`}
            >
              <BoardDebugBadge
                description={BOARD_DESCRIPTIONS.alchemyWorkbench}
                label="Alchemy Workbench"
                visible={showBoardDebugBadges}
              />
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
                  slottedCard={getAlchemyCard(boardState.reagentSlots[slot.id])}
                  swapAnimation={swapAnimation}
                />
              ))}

              <div
                ref={transmutePadTrackRef}
                data-board-section="transmutation-pad"
                data-board-name="Transmutation Pad"
                data-board-description={BOARD_DESCRIPTIONS.transmutationPad}
                data-transmutation-ready={recipePreview ? "true" : "false"}
                data-swipe-progress={transmuteSwipeProgress.toFixed(2)}
                className={`relative col-span-full min-h-0 overflow-hidden rounded-[6px] border p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-sm sm:col-span-4 ${
                  recipePreview
                    ? "cursor-ew-resize border-sky-800/70 bg-sky-50/35"
                    : "border-neutral-600/80 bg-white/25"
                }`}
              >
                <BoardDebugBadge
                  description={BOARD_DESCRIPTIONS.transmutationPad}
                  label="Transmutation Pad"
                  visible={showBoardDebugBadges}
                />
                <span
                  className="pointer-events-none absolute inset-y-3 left-3 right-3 rounded-[5px] bg-white/25"
                  aria-hidden="true"
                >
                  <span
                    className="block h-full rounded-[5px] bg-emerald-400/28 transition-[width] duration-75"
                    style={{ width: `${Math.round(transmuteSwipeProgress * 100)}%` }}
                  />
                </span>
                <p
                  className={`pointer-events-none absolute inset-0 z-10 grid place-items-center px-[7.5rem] text-center font-serif text-2xl italic lg:text-3xl ${
                    recipePreview ? "text-sky-950" : "text-neutral-700"
                  }`}
                >
                  {recipePreview ? "Swipe to transmute" : "Match a recipe first"}
                </p>
                <div
                  data-board-section="swipe-rune-handle"
                  data-board-name="Swipe rune handle"
                  role="slider"
                  tabIndex={recipePreview ? 0 : -1}
                  aria-label={
                    recipePreview
                      ? "Swipe to transmute output"
                      : "Match a recipe before transmuting"
                  }
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(transmuteSwipeProgress * 100)}
                  className={`absolute bottom-3 top-3 z-20 grid touch-none place-items-center rounded-[5px] text-white shadow-[0_8px_18px_rgba(15,23,42,0.22)] transition-[background-color,opacity] duration-200 active:cursor-grabbing ${
                    recipePreview
                      ? "cursor-grab bg-neutral-800"
                      : "cursor-not-allowed bg-neutral-700/55 opacity-70"
                  }`}
                  style={{
                    left: `${TRANSMUTE_TRACK_PADDING_PX}px`,
                    transform: `translateX(${transmuteSwipeProgress * transmuteKnobTravelPx}px)`,
                    transition: isTransmuteDragging
                      ? "none"
                      : "transform 220ms cubic-bezier(0.34,1.56,0.64,1)",
                    width: `${TRANSMUTE_KNOB_WIDTH_PX}px`,
                  }}
                  onPointerDown={handleTransmutationSwipePointerDown}
                >
                  <div className="flex h-14 items-center gap-3 lg:h-18 lg:gap-4" aria-hidden="true">
                    <span className="h-full w-0.5 bg-neutral-300" />
                    <span className="h-full w-0.5 bg-neutral-300" />
                    <span className="h-full w-0.5 bg-neutral-300" />
                  </div>
                </div>
              </div>

              <div
                data-board-section="transmutation-output-slot"
                data-board-name="Output Slot"
                data-board-description={BOARD_DESCRIPTIONS.outputSlot}
                className="relative col-span-full min-h-0 rounded-[6px] border border-neutral-600/80 bg-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-sm sm:col-span-1 sm:col-start-5"
              >
                <BoardDebugBadge
                  description={BOARD_DESCRIPTIONS.outputSlot}
                  label="Output Slot"
                  visible={showBoardDebugBadges}
                />
                <OutputSlotPreview preview={recipePreview} />
              </div>
            </div>
          </section>

          <aside className="hidden min-h-0 lg:grid">
            <div
              data-board-section="alchemy-workbench-info-panel"
              data-board-name="Alchemy Workbench Info"
              data-board-description={BOARD_DESCRIPTIONS.alchemyWorkbenchInfo}
              className={GLASS_PANEL_CLASS}
            >
              <BoardDebugBadge
                description={BOARD_DESCRIPTIONS.alchemyWorkbenchInfo}
                label="Alchemy Workbench Info"
                visible={showBoardDebugBadges}
              />
              <AlchemyWorkbenchInfoPanel preview={recipePreview} />
            </div>
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
            data-stack-count={
              draggedCard.source.kind === "inventory" ? draggedCard.source.stackCount : undefined
            }
            className={getCardShellClass(getFloatingCardFeedback(dropIntent), "floating")}
            style={{
              contain: "layout style paint",
              fontFamily: "var(--font-sans)",
              height: `${FLOATING_ELEMENT_CARD_HEIGHT}px`,
              touchAction: "none",
              width: `${FLOATING_ELEMENT_CARD_WIDTH}px`,
            }}
          >
            <AlchemyCardFace card={draggedCard.card} />
            {draggedCard.source.kind === "inventory" && draggedCard.source.stackCount > 1 ? (
              <span className="absolute right-1 top-1 rounded-full bg-sky-950 px-2 py-1 text-xs font-black leading-none text-white shadow-[0_4px_10px_rgba(15,23,42,0.24)]">
                x{draggedCard.source.stackCount}
              </span>
            ) : null}
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
            fontFamily: "var(--font-sans)",
            height: `${swapAnimation.fromRect.height}px`,
            left: `${swapAnimation.fromRect.left}px`,
            top: `${swapAnimation.fromRect.top}px`,
            width: `${swapAnimation.fromRect.width}px`,
          }}
        >
          <AlchemyCardFace card={swapAnimation.card} />
        </div>
      ) : null}
      {transmuteFlyAnimation ? (
        <div
          ref={transmuteFlyAnimationElementRef}
          data-board-section="card-flight-card"
          data-board-name={`${transmuteFlyAnimation.card.name} flight card`}
          data-card-id={transmuteFlyAnimation.card.id}
          data-stack-count={transmuteFlyAnimation.stackCount}
          className="pointer-events-none fixed z-[70] overflow-hidden rounded-[3px] border-2 border-emerald-500 bg-emerald-50 shadow-[0_18px_32px_rgba(0,0,0,0.28)]"
          style={{
            contain: "layout style paint",
            fontFamily: "var(--font-sans)",
            height: `${transmuteFlyAnimation.fromRect.height}px`,
            left: `${transmuteFlyAnimation.fromRect.left}px`,
            top: `${transmuteFlyAnimation.fromRect.top}px`,
            width: `${transmuteFlyAnimation.fromRect.width}px`,
          }}
        >
          <AlchemyCardFace card={transmuteFlyAnimation.card} />
          {transmuteFlyAnimation.stackCount && transmuteFlyAnimation.stackCount > 1 ? (
            <span className="absolute right-1 top-1 rounded-full bg-sky-950 px-2 py-1 text-xs font-black leading-none text-white shadow-[0_4px_10px_rgba(15,23,42,0.24)]">
              x{transmuteFlyAnimation.stackCount}
            </span>
          ) : null}
        </div>
      ) : null}
    </main>
  );
});

function addPointerWindowListeners(
  onMove: (event: PointerEvent) => void,
  onRelease: (event: PointerEvent) => void,
): void {
  window.addEventListener("pointermove", onMove, WINDOW_POINTER_LISTENER_OPTIONS);
  window.addEventListener("pointerup", onRelease, WINDOW_POINTER_LISTENER_OPTIONS);
  window.addEventListener("pointercancel", onRelease, WINDOW_POINTER_LISTENER_OPTIONS);
}

function removePointerWindowListeners(
  onMove: (event: PointerEvent) => void,
  onRelease: (event: PointerEvent) => void,
): void {
  window.removeEventListener("pointermove", onMove, WINDOW_POINTER_LISTENER_CAPTURE);
  window.removeEventListener("pointerup", onRelease, WINDOW_POINTER_LISTENER_CAPTURE);
  window.removeEventListener("pointercancel", onRelease, WINDOW_POINTER_LISTENER_CAPTURE);
}

function useLocalhostMetaKeyDebugBadges(): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isLocalhostDebugHost()) return;

    const show = () => {
      setVisible(true);
    };
    const hide = () => {
      setVisible(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.key === "Meta") show();
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (!event.metaKey || event.key === "Meta") hide();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") hide();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", hide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", hide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return visible;
}

function isLocalhostDebugHost(): boolean {
  if (typeof window === "undefined") return false;
  return LOCALHOST_HOSTNAMES.has(window.location.hostname);
}

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

function capturePointer(element: HTMLElement, pointerId: number): void {
  if (!element.isConnected) return;
  element.setPointerCapture(pointerId);
}

function getScaledPointerOffset(
  event: ReactPointerEvent<HTMLElement>,
  rect: DOMRect,
): { x: number; y: number } {
  return {
    x: ((event.clientX - rect.left) / Math.max(rect.width, 1)) * FLOATING_ELEMENT_CARD_WIDTH,
    y: ((event.clientY - rect.top) / Math.max(rect.height, 1)) * FLOATING_ELEMENT_CARD_HEIGHT,
  };
}

function useInventoryClock(inventory: AlchemistGuildInventorySlots): number {
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const currentNowMs = Date.now();
    setNowMs(currentNowMs);
    if (!hasActiveCooldown(inventory, currentNowMs)) return;

    const interval = window.setInterval(() => {
      const nextNowMs = Date.now();
      setNowMs(nextNowMs);
      if (!hasActiveCooldown(inventory, nextNowMs)) window.clearInterval(interval);
    }, 250);

    return () => {
      window.clearInterval(interval);
    };
  }, [inventory]);

  return nowMs;
}

function getAlchemyCardArtSrc(card: AlchemyBoardCard): string {
  return resolvePublicAssetPath(card.imagePath);
}

function getAlchemyCard(cardId: string | null): AlchemyBoardCard | null {
  if (!cardId) return null;
  return alchemyCardsById.get(cardId) ?? null;
}

function getRecipeOutputBoardCard(preview: AlchemyWorkbenchRecipePreview): AlchemyBoardCard {
  const existingCard = getAlchemyCard(preview.recipe.output.cardId);
  if (existingCard) return existingCard;

  return {
    detailLabel: formatTokenLabel(preview.recipe.output.kind),
    familyColor: "#7dd3fc",
    id: preview.recipe.output.cardId,
    imagePath: preview.recipe.output.imagePath,
    kind: "crafted",
    kindLabel: formatTokenLabel(preview.recipe.output.kind),
    name: preview.recipe.output.name,
    symbol: createCardSymbol(preview.recipe.output.name),
  };
}

function getWorkbenchCardIds(boardState: AlchemistGuildBoardState): (string | null)[] {
  return reagentSlots.map((slot) => boardState.reagentSlots[slot.id]);
}

function getSourceSwapGhostCard(
  intent: DropIntent,
  draggedCard: DraggedAlchemyCard | null,
  boardState: AlchemistGuildBoardState,
  slotId: AlchemistGuildReagentSlotId,
): AlchemyBoardCard | null {
  if (intent.kind !== "swap" || draggedCard?.source.kind !== "slot") return null;
  if (draggedCard.source.slotId !== slotId) return null;
  return getAlchemyCard(boardState.reagentSlots[intent.slotId]);
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
  card: AlchemyBoardCard;
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

function getInventorySlotRect(slotId: AlchemistGuildInventorySlotId): SlotRect | null {
  return getElementRect(`[data-inventory-slot-id="${slotId}"]`);
}

function getElementRect(selector: string): SlotRect | null {
  const element = document.querySelector(selector);
  if (!(element instanceof HTMLElement)) return null;

  const rect = element.getBoundingClientRect();
  return {
    height: rect.height,
    left: rect.left,
    top: rect.top,
    width: rect.width,
  };
}

function getCenteredCardRect(
  containerRect: SlotRect | null,
  cardWidth: number,
  cardHeight: number,
): SlotRect | null {
  if (!containerRect) return null;

  return {
    height: cardHeight,
    left: containerRect.left + (containerRect.width - cardWidth) / 2,
    top: containerRect.top + (containerRect.height - cardHeight) / 2,
    width: cardWidth,
  };
}

function isCardCenterInsideQuestBriefing(cardLeft: number, cardTop: number): boolean {
  const rect = getElementRect('[data-board-section="left-briefing-panel"]');
  if (!rect) return false;

  const clientX = cardLeft + FLOATING_ELEMENT_CARD_WIDTH / 2;
  const clientY = cardTop + FLOATING_ELEMENT_CARD_HEIGHT / 2;

  return (
    clientX >= rect.left &&
    clientX <= rect.left + rect.width &&
    clientY >= rect.top &&
    clientY <= rect.top + rect.height
  );
}

function getInventoryDestinationSlotId(
  boardState: AlchemistGuildBoardState,
  cardId: string,
): AlchemistGuildInventorySlotId | null {
  for (const slot of inventorySlots) {
    if (boardState.inventorySlots[slot.id]?.cardId === cardId) return slot.id;
  }

  for (const slot of inventorySlots) {
    if (!boardState.inventorySlots[slot.id]) return slot.id;
  }

  return null;
}

function addInventoryCooldown(
  inventory: AlchemistGuildInventorySlots,
  slotId: AlchemistGuildInventorySlotId,
  cardId: string,
  startedAtMs: number,
): AlchemistGuildInventorySlots {
  const existingItem = inventory[slotId];
  const nextCooldown: AlchemistGuildInventoryCooldown = {
    id: `${cardId}:${startedAtMs}:${(existingItem?.cooldowns.length ?? 0) + 1}`,
    readyAtMs: startedAtMs + getOutputCooldownMs(cardId),
    startedAtMs,
  };

  return {
    ...inventory,
    [slotId]: {
      cardId,
      cooldowns: [...(existingItem?.cooldowns ?? []), nextCooldown],
    },
  };
}

function consumeReadyInventoryCopies(
  inventory: AlchemistGuildInventorySlots,
  slotId: AlchemistGuildInventorySlotId,
  count: number,
  nowMs: number,
): AlchemistGuildInventorySlots {
  const item = inventory[slotId];
  if (!item) return inventory;

  let remainingToConsume = count;
  const nextCooldowns: AlchemistGuildInventoryCooldown[] = [];
  for (const cooldown of item.cooldowns) {
    if (remainingToConsume > 0 && cooldown.readyAtMs <= nowMs) {
      remainingToConsume -= 1;
      continue;
    }

    nextCooldowns.push(cooldown);
  }

  if (nextCooldowns.length === item.cooldowns.length) return inventory;

  return {
    ...inventory,
    [slotId]: nextCooldowns.length > 0 ? { ...item, cooldowns: nextCooldowns } : null,
  };
}

function clearReagentSlots(): AlchemistGuildBoardSlots {
  return {
    "reagent-slot-1": null,
    "reagent-slot-2": null,
    "reagent-slot-3": null,
    "reagent-slot-4": null,
    "reagent-slot-5": null,
  };
}

function getReadyCooldownCount(
  cooldowns: readonly AlchemistGuildInventoryCooldown[],
  nowMs: number,
): number {
  let readyCount = 0;
  for (const cooldown of cooldowns) {
    if (cooldown.readyAtMs <= nowMs) readyCount += 1;
  }

  return readyCount;
}

function getPendingCooldowns(
  cooldowns: readonly AlchemistGuildInventoryCooldown[],
  nowMs: number,
): AlchemistGuildInventoryCooldown[] {
  return cooldowns.filter((cooldown) => cooldown.readyAtMs > nowMs);
}

function getCooldownProgress(cooldown: AlchemistGuildInventoryCooldown, nowMs: number): number {
  const durationMs = cooldown.readyAtMs - cooldown.startedAtMs;
  if (durationMs <= 0) return 1;

  return clamp((nowMs - cooldown.startedAtMs) / durationMs, 0, 1);
}

function hasActiveCooldown(inventory: AlchemistGuildInventorySlots, nowMs: number): boolean {
  for (const slot of inventorySlots) {
    const item = inventory[slot.id];
    if (item?.cooldowns.some((cooldown) => cooldown.readyAtMs > nowMs)) return true;
  }

  return false;
}

function getOutputCooldownMs(cardId: string): number {
  for (const [prefix, cooldownMs] of OUTPUT_COOLDOWN_PREFIXES) {
    if (cardId.startsWith(prefix)) return cooldownMs;
  }

  return 0;
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
  draggedCard: DraggedAlchemyCard,
  slotId: AlchemistGuildReagentSlotId | null,
  isQuestBriefingHit: boolean,
  boardState: AlchemistGuildBoardState,
): DropIntent {
  if (draggedCard.source.kind === "inventory") {
    if (!slotId) return isQuestBriefingHit ? { kind: "quest" } : EMPTY_DROP_INTENT;

    return boardState.reagentSlots[slotId] ? { kind: "blocked", slotId } : { kind: "drop", slotId };
  }

  if (!slotId) return EMPTY_DROP_INTENT;

  const source = draggedCard.source;
  if (source.kind === "slot" && source.slotId === slotId) {
    return { kind: "drop", slotId };
  }

  const targetCardId = boardState.reagentSlots[slotId];
  if (!targetCardId) return { kind: "drop", slotId };
  if (source.kind === "slot") return { kind: "swap", slotId };
  return { kind: "replace", slotId };
}

function isSameDropIntent(left: DropIntent, right: DropIntent): boolean {
  return left.kind === right.kind && getDropIntentSlotId(left) === getDropIntentSlotId(right);
}

function getDropIntentSlotId(intent: DropIntent): AlchemistGuildReagentSlotId | null {
  switch (intent.kind) {
    case "blocked":
    case "drop":
    case "replace":
    case "swap":
      return intent.slotId;
    default:
      return null;
  }
}

function getSlotDropFeedback(
  intent: DropIntent,
  slotId: AlchemistGuildReagentSlotId,
): DropFeedback {
  const intentSlotId = getDropIntentSlotId(intent);
  return intentSlotId === slotId ? intent.kind : "none";
}

function getFloatingCardFeedback(intent: DropIntent): DropFeedback {
  return intent.kind === "quest" ? "drop" : intent.kind;
}

function getSlotShellClass(feedback: DropFeedback): string {
  const base =
    "relative h-[148px] w-[105px] justify-self-center border-2 border-dashed transition-[background-color,border-color,box-shadow] duration-100";

  switch (feedback) {
    case "drop":
      return `${base} border-emerald-500 bg-emerald-100/70 shadow-[0_0_0_4px_rgba(16,185,129,0.24)] backdrop-blur-sm`;
    case "swap":
      return `${base} border-amber-500 bg-amber-100/70 shadow-[0_0_0_4px_rgba(245,158,11,0.28)] backdrop-blur-sm`;
    case "replace":
      return `${base} border-cyan-500 bg-cyan-100/70 shadow-[0_0_0_4px_rgba(6,182,212,0.28)] backdrop-blur-sm`;
    case "blocked":
      return `${base} border-rose-500 bg-rose-100/70 shadow-[0_0_0_4px_rgba(244,63,94,0.24)] backdrop-blur-sm`;
    default:
      return `${base} border-neutral-700/70 bg-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-sm`;
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
    case "replace":
      return `${base} border-cyan-500 bg-cyan-50 shadow-[inset_0_0_0_3px_rgba(6,182,212,0.3),0_8px_18px_rgba(0,0,0,0.18)]`;
    case "blocked":
      return `${base} border-rose-500 bg-rose-50 shadow-[inset_0_0_0_3px_rgba(244,63,94,0.24),0_8px_18px_rgba(0,0,0,0.18)]`;
    default:
      return `${base} border-[#888888] bg-[#eeeeee] shadow-[0_8px_18px_rgba(0,0,0,0.18)]`;
  }
}

function getDropGhostClass(feedback: DropFeedback): string {
  const base =
    "pointer-events-none absolute inset-1 z-20 overflow-hidden rounded-[3px] border-2 border-dashed bg-[#eeeeee] opacity-35 shadow-[0_10px_24px_rgba(0,0,0,0.18)]";

  switch (feedback) {
    case "swap":
      return `${base} border-amber-600 rotate-2 scale-[0.9]`;
    case "replace":
      return `${base} border-cyan-600 -rotate-2 scale-[0.9]`;
    default:
      return `${base} border-emerald-600 scale-[0.92]`;
  }
}

function getSwapAnimationCardClass(): string {
  return "pointer-events-none fixed z-[60] overflow-hidden rounded-[3px] border-2 border-amber-500 bg-amber-50 shadow-[0_18px_32px_rgba(0,0,0,0.28)]";
}

function createCardSymbol(name: string): string {
  const words = name
    .replace(CARD_SYMBOL_CLEANUP_PATTERN, " ")
    .trim()
    .split(CARD_SYMBOL_WORD_PATTERN)
    .filter((word) => word.length > 0);
  if (words.length === 0) return "?";
  const firstWord = words[0] ?? "?";
  if (words.length === 1) return firstWord.slice(0, 2).toUpperCase();

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function formatTokenLabel(token: string): string {
  return token
    .replace(TOKEN_PREFIX_PATTERN, "")
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
