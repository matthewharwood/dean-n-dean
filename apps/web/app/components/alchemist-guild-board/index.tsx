import {
  ALCHEMIST_GUILD_BOARD_MODE_TABS,
  ALCHEMY_CRAFTED_CARDS,
  ALCHEMY_QUESTS,
  ALCHEMY_RECIPES,
  type AlchemistGuildBoardMode,
  AlchemistGuildBoardModeSchema,
  type AlchemistGuildBoardSlots,
  type AlchemistGuildBoardState,
  type AlchemistGuildGatheringLogEntry,
  type AlchemistGuildGatheringState,
  type AlchemistGuildInventoryCooldown,
  type AlchemistGuildInventorySlotId,
  AlchemistGuildInventorySlotIdSchema,
  type AlchemistGuildInventorySlots,
  type AlchemistGuildProfile,
  type AlchemistGuildQuestDeliveries,
  type AlchemistGuildQuestDelivery,
  type AlchemistGuildReagentSlotId,
  AlchemistGuildReagentSlotIdSchema,
  type AlchemyQuestRewards,
  ELEMENT_CARDS,
  EXTENDED_MOLECULE_RECIPES,
  getAlchemyCharactersByRequester,
  getAlchemyQuestBoard,
  getAlchemyQuestById,
  getAlchemyRecipeById,
  getAvailableAlchemyQuests,
  type StaticAlchemyQuest,
  type StaticExtendedMoleculeRecipe,
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
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CloudFog,
  Coins,
  LockKeyhole,
  type LucideIcon,
  PackageOpen,
  ScrollText,
  Sparkles,
} from "lucide-react";
import {
  type CSSProperties,
  type MutableRefObject,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  type UIEvent as ReactUIEvent,
  type RefObject,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import * as z from "zod";

import { usePixiApp } from "~/canvas/use-pixi-app";
import { defineComponent } from "~/lib/define-component";
import { sfx } from "~/sound/sfx";
import { alchemistGuildBoardAtom } from "~/state/atoms";
import { setupExpeditionCanvasScene } from "./expedition-canvas-scene";
import {
  claimGatheringReward,
  clearGatheringAnswer,
  type GatheringMove,
  getGatheringMoves,
  selectGatheringAnswer,
  selectGatheringMove,
} from "./gathering-loop";
import {
  FLOATING_ELEMENT_CARD_HEIGHT,
  FLOATING_ELEMENT_CARD_WIDTH,
  type PeriodicTableElementGrab,
  setupPeriodicTableScene,
} from "./periodic-table-scene";
import { FIRST_PROFILE_CARD_PROPS, ProfileCard } from "./profile-card";
import { createQuestBriefingCardProps, QuestBriefingCard } from "./quest-briefing-card";
import {
  type AlchemyWorkbenchExtendedRecipePreview,
  type AlchemyWorkbenchRecipePreview,
  formatAlchemyRecipeFormula,
  getAlchemyWorkbenchExtendedRecipePreview,
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
const QUEST_CLAIM_SWIPE_THRESHOLD = 0.72;
const QUEST_CLAIM_COMMIT_HOLD_MS = 120;
const QUEST_CLAIM_KNOB_WIDTH_PX = 72;
const QUEST_CLAIM_TRACK_PADDING_PX = 6;
const QUEST_REWARD_FLY_DURATION_MS = 560;
const QUEST_REWARD_FLY_STAGGER_MS = 72;
const OUTPUT_CARD_COOLDOWN_MS = 1000;
const OUTPUT_COOLDOWN_PREFIXES = new Map<string, number>([["material:", OUTPUT_CARD_COOLDOWN_MS]]);
const MAX_VISIBLE_COOLDOWN_BARS = 4;
const INVENTORY_CLOCK_INTERVAL_MS = 250;
const RECIPE_REVEAL_STAGGER_MS = 70;
const RECIPE_REVEAL_INTERSECTION_THRESHOLD = 0.36;
const RECIPE_REVEAL_ID_SEPARATOR = "|";
const QUEST_DELIVERY_COMPLETE_LABEL = "Ready to claim";
const QUEST_CURRENT_SWIPE_MIN_PX = 38;
const QUEST_CURRENT_SNAP_DURATION_MS = 240;
const QUEST_CURRENT_SLIDE_OFFSETS = [-1, 0, 1] as const;
const QUEST_CURRENT_CENTER_SLIDE_INDEX = 1;
const QUEST_LOG_ROW_HEIGHT_PX = 64;
const QUEST_LOG_ROW_GAP_PX = 8;
const QUEST_LOG_ROW_PITCH_PX = QUEST_LOG_ROW_HEIGHT_PX + QUEST_LOG_ROW_GAP_PX;
const QUEST_LOG_OVERSCAN_ROWS = 4;
const EMPTY_DROP_INTENT: DropIntent = { kind: "none" };
const EMPTY_QUEST_CLAIM_SWIPE_STATE = {
  dragging: false,
  progress: 0,
} satisfies QuestClaimSwipeState;
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
const GATHERING_PANEL_LABEL_CLASS =
  "pointer-events-none absolute left-3 top-3 z-20 text-xs font-black uppercase leading-none tracking-[-0.02em] text-neutral-950";
const GATHERING_PANEL_TRANSITION_CLASS =
  "transition-[grid-template-rows,opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";
const BOARD_DESCRIPTIONS = {
  alchemyWorkbench:
    "The five-slot Alchemy Workbench where elemental cards combine into compounds, materials, and quest items.",
  alchemyWorkbenchInfo:
    "Explains the recipe or output currently previewed by the Alchemy Workbench output slot.",
  inventory: "Stores crafted cards, gathered materials, and quest outputs in the top board strip.",
  boardModeTabs: "Switches between board modes: crafting, gathering, and expedition.",
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

const gatheringGameCardSlots = [
  "gathering-card-slot-1",
  "gathering-card-slot-2",
  "gathering-card-slot-3",
  "gathering-card-slot-4",
  "gathering-card-slot-5",
] as const;

const infoPanelTabs = ["element", "recipe", "extended"] as const;
const InfoPanelTabSchema = z.enum(infoPanelTabs);
type InfoPanelTab = z.infer<typeof InfoPanelTabSchema>;

const questPanelTabs = ["current", "log"] as const;
const QuestPanelTabSchema = z.enum(questPanelTabs);
type QuestPanelTab = z.infer<typeof QuestPanelTabSchema>;

const boardModeTabs = ALCHEMIST_GUILD_BOARD_MODE_TABS;
const BoardModeTabSchema = AlchemistGuildBoardModeSchema;
type BoardModeTab = AlchemistGuildBoardMode;

type RewardKind = "discovery" | "gold" | "knowledge" | "muddlefog";

type QuestClaimSwipeState = {
  dragging: boolean;
  progress: number;
};

type QuestClaimSwipeStateByQuestId = Record<string, QuestClaimSwipeState>;

const REWARD_ICONS = {
  discovery: Sparkles,
  gold: Coins,
  knowledge: Brain,
  muddlefog: CloudFog,
} satisfies Record<RewardKind, LucideIcon>;

const REWARD_PROFILE_STAT_KIND = {
  discovery: "discovery",
  gold: "gold",
  knowledge: "knowledge",
  muddlefog: "muddlefog",
} satisfies Record<RewardKind, string>;

type AlchemyBoardCard = {
  detailLabel: string;
  familyColor: string;
  id: string;
  imagePath?: string;
  kind: "crafted" | "element" | "extended";
  kindLabel: string;
  name: string;
  symbol: string;
  atomicNumber?: number;
};

type AlchemyWorkbenchAnyRecipePreview =
  | AlchemyWorkbenchRecipePreview
  | AlchemyWorkbenchExtendedRecipePreview;

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
for (const recipe of EXTENDED_MOLECULE_RECIPES) {
  alchemyCardsById.set(recipe.output.cardId, {
    detailLabel: `CID ${recipe.source.pubChemCid}`,
    familyColor: "#34d399",
    id: recipe.output.cardId,
    kind: "extended",
    kindLabel: "Molecule",
    name: recipe.output.name,
    symbol: recipe.output.formula,
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
  | { accepted: boolean; kind: "quest" }
  | { kind: "swap"; slotId: AlchemistGuildReagentSlotId }
  | { kind: "replace"; slotId: AlchemistGuildReagentSlotId }
  | { kind: "blocked"; slotId: AlchemistGuildReagentSlotId };

type DropFeedback = DropIntent["kind"];

type SlottedCardPointerDownHandler = (
  slotId: AlchemistGuildReagentSlotId,
  card: AlchemyBoardCard,
  event: ReactPointerEvent<HTMLButtonElement>,
) => void;

type ButtonPointerDownHandler = (event: ReactPointerEvent<HTMLButtonElement>) => void;
type GatheringAnswerPointerDownHandler = (
  value: number,
  source: GatheringAnswerDragSource,
  event: ReactPointerEvent<HTMLButtonElement>,
) => void;
type GatheringMovePointerDownHandler = (
  move: GatheringMove,
  event: ReactPointerEvent<HTMLButtonElement>,
) => void;
type GatheringRewardPointerDownHandler = (
  cardId: string,
  event: ReactPointerEvent<HTMLButtonElement>,
) => void;

type GatheringAnswerDragSource = { kind: "cards" } | { kind: "answer-slot" };
type GatheringCardDragSource =
  | GatheringAnswerDragSource
  | { kind: "move-cards" }
  | { kind: "reward-cards" };

type DraggedGatheringCardBase = {
  grabOffsetX: number;
  grabOffsetY: number;
  id: string;
  pointerId: number;
  source: GatheringCardDragSource;
  startClientX: number;
  startClientY: number;
};

type DraggedGatheringCard =
  | (DraggedGatheringCardBase & {
      kind: "answer";
      value: number;
    })
  | (DraggedGatheringCardBase & {
      kind: "move";
      move: GatheringMove;
    })
  | (DraggedGatheringCardBase & {
      card: AlchemyBoardCard;
      kind: "reward";
    });

type GatheringDropTarget =
  | "none"
  | "answer-slot"
  | "cards-panel"
  | "action-zone"
  | "monster-panel"
  | "log-panel";

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
  toInventorySlotId?: AlchemistGuildInventorySlotId;
};

type QuestRewardFlyItem = {
  fromRect: SlotRect;
  id: string;
  kind: RewardKind;
  label: string;
  toRect: SlotRect;
  value: string;
};

type QuestRewardFlyAnimation = {
  id: string;
  items: QuestRewardFlyItem[];
};

type PointerSample = {
  clientX: number;
  clientY: number;
  time: number;
};

type HorizontalSwipeMoveState = {
  pointerId: number;
  released: boolean;
  syncProgress: (clientX: number) => void;
};

type QuestCurrentSwipe = {
  animationFrame: number;
  captureElement: HTMLDivElement;
  latestDeltaX: number;
  motion: AnimatableObject;
  pointerId: number;
  slideWidth: number;
  startClientX: number;
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
    <span
      className={`absolute inset-x-0 top-[19px] z-10 truncate px-1 text-center font-bold leading-none text-neutral-950 ${
        card.kind === "extended" ? "text-[18px]" : "text-[31px]"
      }`}
    >
      {card.symbol}
    </span>
    {card.imagePath ? (
      <img
        src={getAlchemyCardArtSrc(card)}
        alt=""
        aria-hidden="true"
        className="absolute left-1/2 top-[51px] size-[62px] -translate-x-1/2 object-contain"
        draggable={false}
      />
    ) : (
      <span
        className="absolute left-1/2 top-[54px] grid size-[58px] -translate-x-1/2 place-items-center rounded-full border border-emerald-900/20 bg-emerald-100/70 px-1 text-center font-mono text-[12px] font-black leading-tight text-emerald-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
        aria-hidden="true"
      >
        {card.symbol}
      </span>
    )}
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

const GatheringGamePanelPropsSchema = z.object({
  draggedGatheringCard: z.custom<DraggedGatheringCard | null>(),
  gatheringDropTarget: z.custom<GatheringDropTarget>(),
  gathering: z.custom<AlchemistGuildGatheringState>(),
  onAnswerPointerDown: z.custom<GatheringAnswerPointerDownHandler>(),
});

const GatheringGamePanel = defineComponent(
  GatheringGamePanelPropsSchema,
  ({ draggedGatheringCard, gathering, gatheringDropTarget, onAnswerPointerDown }) => {
    const displayedAnswer = gathering.equation.selectedValue;
    const answerStateClass = getGatheringAnswerStateClass(gathering.lastAnswerCorrect);
    const answerDropActive = gatheringDropTarget === "answer-slot";
    const actionDropActive = gatheringDropTarget === "action-zone";
    const isDraggingAnswerFromSlot =
      draggedGatheringCard?.kind === "answer" && draggedGatheringCard.source.kind === "answer-slot";

    return (
      <div
        data-gathering-drop-target={gathering.phase === "move" ? "action-zone" : undefined}
        data-gathering-drop-active={actionDropActive ? "true" : undefined}
        className={`pointer-events-auto grid h-full min-h-0 place-items-center p-6 pt-12 transition-[box-shadow] duration-150 ${
          actionDropActive ? "shadow-[inset_0_0_0_4px_rgba(14,165,233,0.22)]" : ""
        }`}
      >
        <span className={GATHERING_PANEL_LABEL_CLASS}>Game Panel</span>
        <div className="grid w-full max-w-[42rem] gap-5 text-center">
          <div className="flex items-center justify-center gap-3 text-neutral-950">
            <GatheringEquationValue value={gathering.equation.left} label="Left addend" />
            <span className="text-4xl font-black leading-none">+</span>
            <GatheringEquationValue value={gathering.equation.right} label="Right addend" />
            <span className="text-4xl font-black leading-none">=</span>
            <div
              data-gathering-drop-target="answer-slot"
              data-gathering-drop-active={answerDropActive ? "true" : undefined}
              className={`relative grid size-24 place-items-center rounded-[8px] border-2 text-5xl font-black leading-none shadow-[0_8px_18px_rgba(15,23,42,0.12)] transition-[background-color,border-color,box-shadow] duration-150 ${answerStateClass} ${
                answerDropActive
                  ? "border-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.22),0_8px_18px_rgba(15,23,42,0.12)]"
                  : ""
              }`}
            >
              {displayedAnswer !== null && !isDraggingAnswerFromSlot ? (
                <GatheringAnswerSlotCard
                  onPointerDown={onAnswerPointerDown}
                  value={displayedAnswer}
                />
              ) : (
                <>
                  <span className="sr-only">Selected answer: </span>?
                </>
              )}
            </div>
          </div>
          <div className="mx-auto grid w-full max-w-[24rem] gap-2">
            <div className="flex items-center justify-between gap-3 rounded-[6px] border border-neutral-900/10 bg-white/65 px-3 py-2 text-xs font-black uppercase leading-none text-neutral-800">
              <span>Round {gathering.round}</span>
              <span>Equation {gathering.equationIndex}</span>
            </div>
            <p className="rounded-[6px] border border-neutral-900/10 bg-white/65 px-3 py-2 text-sm font-bold leading-snug text-neutral-900">
              {getGatheringGamePanelStatus(gathering)}
            </p>
          </div>
        </div>
      </div>
    );
  },
);

const GatheringEquationValuePropsSchema = z.object({
  label: z.string().min(1),
  value: z.int().min(0),
});

const GatheringEquationValue = defineComponent(
  GatheringEquationValuePropsSchema,
  ({ label, value }) => (
    <span className="grid size-24 place-items-center rounded-[8px] border-2 border-neutral-800/55 bg-white/75 text-5xl font-black leading-none text-neutral-950 shadow-[0_8px_18px_rgba(15,23,42,0.12)]">
      <span className="sr-only">{label}: </span>
      {value}
    </span>
  ),
);

const GatheringGameCardsPanelPropsSchema = z.object({
  gatheringDropTarget: z.custom<GatheringDropTarget>(),
  gathering: z.custom<AlchemistGuildGatheringState>(),
  onAnswerPointerDown: z.custom<GatheringAnswerPointerDownHandler>(),
  onMovePointerDown: z.custom<GatheringMovePointerDownHandler>(),
  onRewardPointerDown: z.custom<GatheringRewardPointerDownHandler>(),
});

const GatheringGameCardsPanel = defineComponent(
  GatheringGameCardsPanelPropsSchema,
  ({
    gathering,
    gatheringDropTarget,
    onAnswerPointerDown,
    onMovePointerDown,
    onRewardPointerDown,
  }) => {
    let occupiedCards: ReactNode[];
    if (gathering.phase === "solving") {
      occupiedCards = gathering.equation.choiceValues.map((value) => (
        <GatheringAnswerCard
          key={value}
          gathering={gathering}
          onPointerDown={onAnswerPointerDown}
          value={value}
        />
      ));
    } else if (gathering.phase === "move") {
      const moveCards = getGatheringMoves(gathering.equation).map((move) => (
        <GatheringMoveCard key={move.id} move={move} onPointerDown={onMovePointerDown} />
      ));
      occupiedCards = [null, ...moveCards, null];
    } else {
      occupiedCards = gathering.rewardOptionCardIds.map((cardId) => (
        <GatheringRewardCard key={cardId} cardId={cardId} onPointerDown={onRewardPointerDown} />
      ));
    }

    return (
      <>
        <span className={GATHERING_PANEL_LABEL_CLASS}>Game Cards Panel</span>
        <div
          data-gathering-drop-target="cards-panel"
          data-gathering-drop-active={gatheringDropTarget === "cards-panel" ? "true" : undefined}
          className="contents"
        >
          {gatheringGameCardSlots.map((slotId, index) => (
            <div
              key={slotId}
              data-board-section="gathering-game-card-slot"
              data-board-name="Gathering game card slot"
              data-gathering-drop-target="cards-panel"
              className={`${getSlotShellClass("none")} ${
                gatheringDropTarget === "cards-panel"
                  ? "shadow-[0_0_0_4px_rgba(16,185,129,0.18),inset_0_1px_0_rgba(255,255,255,0.55)]"
                  : ""
              }`}
            >
              {occupiedCards[index] ?? null}
            </div>
          ))}
        </div>
      </>
    );
  },
);

const GatheringAnswerCardPropsSchema = z.object({
  gathering: z.custom<AlchemistGuildGatheringState>(),
  onPointerDown: z.custom<GatheringAnswerPointerDownHandler>(),
  value: z.int().min(0),
});

const GatheringAnswerCard = defineComponent(
  GatheringAnswerCardPropsSchema,
  ({ gathering, onPointerDown, value }) => {
    const selected = gathering.equation.selectedValue === value;
    const selectedWrong = selected && gathering.lastAnswerCorrect === false;

    return (
      <button
        type="button"
        data-board-section="gathering-answer-card"
        data-board-name={`Answer ${value}`}
        className={`absolute inset-0 z-10 grid cursor-grab touch-none select-none place-items-center rounded-[3px] border-2 bg-white text-neutral-950 shadow-[0_8px_18px_rgba(0,0,0,0.18)] transition-[border-color,box-shadow,transform] duration-150 active:cursor-grabbing active:scale-[0.98] ${
          selectedWrong
            ? "border-rose-500 shadow-[inset_0_0_0_3px_rgba(244,63,94,0.2),0_8px_18px_rgba(0,0,0,0.18)]"
            : "border-[#888888] hover:border-emerald-500 hover:shadow-[inset_0_0_0_3px_rgba(16,185,129,0.18),0_8px_18px_rgba(0,0,0,0.18)]"
        }`}
        aria-label={`Drag answer ${value}`}
        onPointerDown={(event) => onPointerDown(value, { kind: "cards" }, event)}
      >
        <span className="text-5xl font-black leading-none">{value}</span>
        <span className="absolute bottom-3 left-2 right-2 truncate text-center text-[10px] font-black uppercase leading-none text-neutral-600">
          Answer
        </span>
      </button>
    );
  },
);

const GatheringAnswerSlotCardPropsSchema = z.object({
  onPointerDown: z.custom<GatheringAnswerPointerDownHandler>(),
  value: z.int().min(0),
});

const GatheringAnswerSlotCard = defineComponent(
  GatheringAnswerSlotCardPropsSchema,
  ({ onPointerDown, value }) => (
    <button
      type="button"
      data-board-section="gathering-answer-slot-card"
      data-board-name={`Slotted answer ${value}`}
      className="absolute inset-1 z-10 grid cursor-grab touch-none select-none place-items-center rounded-[6px] border-2 border-neutral-800/55 bg-white text-neutral-950 shadow-[0_8px_18px_rgba(15,23,42,0.12)] transition-[border-color,box-shadow,transform] duration-150 hover:border-sky-500 active:cursor-grabbing active:scale-[0.98]"
      aria-label={`Drag slotted answer ${value}`}
      onPointerDown={(event) => onPointerDown(value, { kind: "answer-slot" }, event)}
    >
      <span className="text-5xl font-black leading-none">{value}</span>
    </button>
  ),
);

const GatheringMoveCardPropsSchema = z.object({
  move: z.custom<GatheringMove>(),
  onPointerDown: z.custom<GatheringMovePointerDownHandler>(),
});

const GatheringMoveCard = defineComponent(
  GatheringMoveCardPropsSchema,
  ({ move, onPointerDown }) => (
    <button
      type="button"
      data-board-section="gathering-move-card"
      data-board-name={move.name}
      className="absolute inset-0 z-10 grid cursor-grab touch-none select-none content-between rounded-[3px] border-2 border-[#888888] bg-[#eeeeee] p-2 text-left text-neutral-950 shadow-[0_8px_18px_rgba(0,0,0,0.18)] transition-[border-color,box-shadow,transform] duration-150 hover:border-sky-500 hover:shadow-[inset_0_0_0_3px_rgba(14,165,233,0.18),0_8px_18px_rgba(0,0,0,0.18)] active:cursor-grabbing active:scale-[0.98]"
      aria-label={`Drag ${move.name} for ${move.damage} damage`}
      onPointerDown={(event) => onPointerDown(move, event)}
    >
      <span className="rounded-[5px] border border-sky-900/15 bg-sky-50/80 px-1.5 py-1 text-[10px] font-black uppercase leading-none text-sky-950">
        Move
      </span>
      <span className="grid gap-1 text-center">
        <span className="text-2xl font-black leading-none">{move.name}</span>
        <span className="font-mono text-[11px] font-black leading-none text-neutral-600">
          {move.detail}
        </span>
      </span>
      <span className="rounded-[5px] border border-neutral-900/15 bg-white/80 px-2 py-1 text-center text-sm font-black leading-none">
        {move.damage} damage
      </span>
    </button>
  ),
);

const GatheringRewardCardPropsSchema = z.object({
  cardId: z.string().min(1),
  onPointerDown: z.custom<GatheringRewardPointerDownHandler>(),
});

const GatheringRewardCard = defineComponent(
  GatheringRewardCardPropsSchema,
  ({ cardId, onPointerDown }) => {
    const card = getAlchemyCard(cardId);
    if (!card) return null;

    return (
      <button
        type="button"
        data-board-section="gathering-reward-card"
        data-board-name={`${card.name} gathering reward`}
        data-card-id={card.id}
        className={getCardShellClass("none", "slotted")}
        aria-label={`Drag ${card.name} to the gather log`}
        onPointerDown={(event) => onPointerDown(card.id, event)}
      >
        <AlchemyCardFace card={card} />
      </button>
    );
  },
);

const FloatingGatheringCardPropsSchema = z.object({
  card: z.custom<DraggedGatheringCard>(),
});

const FloatingGatheringCard = defineComponent(FloatingGatheringCardPropsSchema, ({ card }) => {
  if (card.kind === "answer") {
    return (
      <div className="absolute inset-0 grid place-items-center rounded-[3px] border-2 border-[#888888] bg-white text-neutral-950 shadow-[0_8px_18px_rgba(0,0,0,0.18)]">
        <span className="text-5xl font-black leading-none">{card.value}</span>
        <span className="absolute bottom-3 left-2 right-2 truncate text-center text-[10px] font-black uppercase leading-none text-neutral-600">
          Answer
        </span>
      </div>
    );
  }

  if (card.kind === "move") {
    return (
      <div className="absolute inset-0 grid content-between rounded-[3px] border-2 border-[#888888] bg-[#eeeeee] p-2 text-left text-neutral-950 shadow-[0_8px_18px_rgba(0,0,0,0.18)]">
        <span className="rounded-[5px] border border-sky-900/15 bg-sky-50/80 px-1.5 py-1 text-[10px] font-black uppercase leading-none text-sky-950">
          Move
        </span>
        <span className="grid gap-1 text-center">
          <span className="text-2xl font-black leading-none">{card.move.name}</span>
          <span className="font-mono text-[11px] font-black leading-none text-neutral-600">
            {card.move.detail}
          </span>
        </span>
        <span className="rounded-[5px] border border-neutral-900/15 bg-white/80 px-2 py-1 text-center text-sm font-black leading-none">
          {card.move.damage} damage
        </span>
      </div>
    );
  }

  return <AlchemyCardFace card={card.card} />;
});

const GatheringLogPanelPropsSchema = z.object({
  entries: z.array(z.custom<AlchemistGuildGatheringLogEntry>()),
  gatheringDropTarget: z.custom<GatheringDropTarget>(),
});

const GatheringLogPanel = defineComponent(
  GatheringLogPanelPropsSchema,
  ({ entries, gatheringDropTarget }) => (
    <div
      data-gathering-drop-target="log-panel"
      data-gathering-drop-active={gatheringDropTarget === "log-panel" ? "true" : undefined}
      data-board-section="gathering-log-panel"
      data-board-name="Gather Log"
      className={`${GLASS_PANEL_CLASS} overflow-hidden p-3 transition-[box-shadow] duration-150 ${
        gatheringDropTarget === "log-panel"
          ? "shadow-[0_0_0_4px_rgba(16,185,129,0.2),inset_0_1px_0_rgba(255,255,255,0.72),0_16px_32px_rgba(15,23,42,0.14)]"
          : ""
      }`}
    >
      <span className={GATHERING_PANEL_LABEL_CLASS}>Gather Log Panel</span>
      <div className="grid h-full min-h-0 content-start gap-2 overflow-hidden pt-8">
        {entries.length === 0 ? (
          <p className="rounded-[6px] border border-neutral-900/10 bg-white/55 px-3 py-2 text-sm font-bold leading-snug text-neutral-700">
            New elements will land here after each reward pick.
          </p>
        ) : (
          entries.slice(0, 8).map((entry) => <GatheringLogRow key={entry.id} entry={entry} />)
        )}
      </div>
    </div>
  ),
);

const GatheringLogRowPropsSchema = z.object({
  entry: z.custom<AlchemistGuildGatheringLogEntry>(),
});

const GatheringLogRow = defineComponent(GatheringLogRowPropsSchema, ({ entry }) => {
  const card = getAlchemyCard(entry.cardId);
  if (!card) return null;

  return (
    <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-2 rounded-[6px] border border-neutral-900/10 bg-white/70 p-1.5 shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
      <span
        className="grid size-10 place-items-center rounded-[5px] border border-neutral-900/15 text-lg font-black leading-none text-neutral-950"
        style={{ backgroundColor: card.familyColor }}
      >
        {card.symbol}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-black leading-tight text-neutral-950">
          {card.name}
        </span>
        <span className="block text-[10px] font-black uppercase leading-tight text-neutral-600">
          Round {entry.round}
        </span>
      </span>
      <span className="rounded-full border border-emerald-900/20 bg-emerald-50/85 px-1.5 py-0.5 text-[9px] font-black uppercase leading-none text-emerald-950">
        +1
      </span>
    </div>
  );
});

const GatheringMonsterPanelPropsSchema = z.object({
  gatheringDropTarget: z.custom<GatheringDropTarget>(),
  gathering: z.custom<AlchemistGuildGatheringState>(),
});

const GatheringMonsterPanel = defineComponent(
  GatheringMonsterPanelPropsSchema,
  ({ gathering, gatheringDropTarget }) => {
    const hpPercent = Math.round((gathering.monster.hp / gathering.monster.maxHp) * 100);
    const monsterDropActive = gatheringDropTarget === "monster-panel";

    return (
      <>
        <span className={GATHERING_PANEL_LABEL_CLASS}>Monster Panel</span>
        <div className="grid h-full min-h-0 place-items-center pt-10">
          <article
            data-gathering-drop-target="monster-panel"
            data-gathering-drop-active={monsterDropActive ? "true" : undefined}
            data-board-section="gathering-monster-card"
            data-board-name={gathering.monster.name}
            className={`grid w-[13rem] gap-2 rounded-[7px] border-2 border-neutral-800/60 bg-white/80 p-2 shadow-[0_14px_28px_rgba(15,23,42,0.18)] transition-[border-color,box-shadow] duration-150 ${
              monsterDropActive
                ? "border-sky-500 shadow-[0_0_0_4px_rgba(14,165,233,0.22),0_14px_28px_rgba(15,23,42,0.18)]"
                : ""
            }`}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[5px] border border-neutral-900/15 bg-neutral-100">
              <img
                src={resolvePublicAssetPath(gathering.monster.imagePath)}
                alt=""
                aria-hidden="true"
                className="size-full object-cover"
                draggable={false}
              />
            </div>
            <div className="grid gap-1">
              <h3 className="truncate text-center text-sm font-black leading-tight text-neutral-950">
                {gathering.monster.name}
              </h3>
              <div className="h-3 overflow-hidden rounded-full border border-neutral-900/20 bg-neutral-200">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-[width] duration-200"
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
              <p className="text-center text-[11px] font-black uppercase leading-none text-neutral-700">
                {gathering.monster.hp} / {gathering.monster.maxHp} HP
              </p>
            </div>
          </article>
        </div>
      </>
    );
  },
);

const GatheringInfoPanelPropsSchema = z.object({
  gathering: z.custom<AlchemistGuildGatheringState>(),
});

const GatheringInfoPanel = defineComponent(GatheringInfoPanelPropsSchema, ({ gathering }) => (
  <>
    <span className={GATHERING_PANEL_LABEL_CLASS}>Info Panel</span>
    <div className="grid h-full content-start gap-2 pt-8">
      <div className="rounded-[6px] border border-neutral-900/10 bg-white/65 p-3">
        <h3 className="text-sm font-black leading-tight text-neutral-950">
          {getGatheringInfoTitle(gathering)}
        </h3>
        <p className="mt-1 text-xs font-bold leading-snug text-neutral-700">
          {getGatheringInfoText(gathering)}
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-1 rounded-[6px] border border-neutral-900/10 bg-white/55 p-2 text-[11px] leading-tight">
        <InfoFact label="Mode" value="Addition" />
        <InfoFact label="Round" value={String(gathering.round)} />
        <InfoFact label="Answer" value={String(gathering.equation.answer)} />
        <InfoFact label="Monster HP" value={`${gathering.monster.hp}/${gathering.monster.maxHp}`} />
      </dl>
    </div>
  </>
));

const QuestBriefingAtmosphere = defineComponent(z.object({}), () => (
  <div
    className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[8px]"
    aria-hidden="true"
  >
    <div className="absolute inset-x-3 top-10 h-[34rem] rounded-[18px] bg-[radial-gradient(circle_at_50%_62%,rgba(251,146,60,0.34),transparent_44%),radial-gradient(circle_at_18%_30%,rgba(253,186,116,0.5),transparent_30%),radial-gradient(circle_at_82%_42%,rgba(249,115,22,0.32),transparent_36%)] blur-xl" />
    <div className="absolute bottom-8 left-8 right-8 h-32 rounded-[50%] bg-[radial-gradient(circle,rgba(251,191,36,0.36),transparent_62%)] blur-2xl" />
    <span className="absolute left-8 top-3 h-28 w-6 rotate-[-14deg] rounded-full bg-white/35 blur-lg motion-safe:animate-pulse" />
    <span className="absolute left-20 top-6 h-24 w-5 rotate-[10deg] rounded-full bg-white/30 blur-lg motion-safe:animate-pulse" />
    <span className="absolute right-10 top-4 h-32 w-7 rotate-[16deg] rounded-full bg-white/30 blur-lg motion-safe:animate-pulse" />
  </div>
));

const QuestDeliverySlotPropsSchema = z.object({
  canClaim: z.boolean(),
  card: z.custom<AlchemyBoardCard>(),
  claimed: z.boolean(),
  claimProgress: z.number().min(0).max(1),
  delivered: z.int().min(0),
  dropFeedback: z.custom<DropFeedback>(),
  isClaimDragging: z.boolean(),
  onClaimPointerDown: z.custom<(event: ReactPointerEvent<HTMLButtonElement>) => void>(),
  questId: z.string().min(1),
  required: z.int().min(1),
  requesterName: z.string().min(1),
});

const QuestDeliverySlot = defineComponent(
  QuestDeliverySlotPropsSchema,
  ({
    canClaim,
    card,
    claimed,
    claimProgress,
    delivered,
    dropFeedback,
    isClaimDragging,
    onClaimPointerDown,
    questId,
    required,
    requesterName,
  }) => {
    const shellRef = useRef<HTMLElement>(null);
    const claimRevealRef = useRef<HTMLDivElement>(null);
    const wasCompleteRef = useRef(false);
    const deliveredCount = Math.min(delivered, required);
    const isComplete = deliveredCount >= required;
    const statusText = getQuestDeliveryStatusText(isComplete, claimed, card.name);
    const claimLabel = claimed ? "Claimed" : "Swipe to claim";
    const visibleClaimProgress = claimed ? 1 : claimProgress;
    const claimKnobLeft = `calc(${QUEST_CLAIM_TRACK_PADDING_PX}px + ${
      visibleClaimProgress * 100
    }% - ${
      visibleClaimProgress * (QUEST_CLAIM_KNOB_WIDTH_PX + QUEST_CLAIM_TRACK_PADDING_PX * 2)
    }px)`;

    useBrowserLayoutEffect(() => {
      const shellElement = shellRef.current;
      const claimElement = claimRevealRef.current;
      clearQuestDeliveryMotionStyles(shellElement, claimElement);

      const becameComplete = isComplete && !wasCompleteRef.current;
      wasCompleteRef.current = isComplete;
      if (!becameComplete) return;

      const reducedMotion = typeof window !== "undefined" && window.matchMedia(PRM).matches;
      if (reducedMotion) return;

      const animations: JSAnimation[] = [];
      if (shellElement) {
        animations.push(
          animate(shellElement, {
            duration: 280,
            ease: "out(3)",
            scale: [0.985, 1],
            y: [6, 0],
          }),
        );
      }

      if (claimElement) {
        animations.push(
          animate(claimElement, {
            delay: 60,
            duration: 260,
            ease: "out(3)",
            opacity: [0, 1],
            y: [10, 0],
          }),
        );
      }

      return () => {
        for (const animation of animations) animation.cancel();
        clearQuestDeliveryMotionStyles(shellElement, claimElement);
      };
    }, [isComplete, questId]);

    return (
      <section
        ref={shellRef}
        data-board-section="quest-delivery-drop-zone"
        data-board-name={`${card.name} quest delivery`}
        data-card-id={card.id}
        data-quest-id={questId}
        data-claim-complete={claimed ? "true" : "false"}
        data-claim-ready={canClaim ? "true" : "false"}
        data-delivery-complete={isComplete ? "true" : "false"}
        data-drop-feedback={dropFeedback}
        className={getQuestDeliverySlotClass(dropFeedback, isComplete, claimed)}
        aria-label={`Deliver ${required} ${card.name} card${required === 1 ? "" : "s"} to ${requesterName}`}
      >
        <div className="grid min-w-0 grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-3">
          <div
            className={`grid size-18 place-items-center rounded-[6px] border-2 border-dashed bg-white/65 ${
              isComplete ? "border-emerald-600" : "border-sky-950/35"
            }`}
            aria-hidden="true"
          >
            <img
              src={getAlchemyCardArtSrc(card)}
              alt=""
              className={`size-14 object-contain ${isComplete ? "" : "opacity-35 grayscale"}`}
              draggable={false}
            />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase leading-none tracking-normal text-amber-950/65">
              {requesterName} needs
            </p>
            <p className="truncate font-serif text-2xl leading-none text-amber-950">{card.name}</p>
            <p className="mt-1 text-xs font-bold leading-tight text-neutral-800">{statusText}</p>
          </div>
          <span className="rounded-full border border-amber-900/25 bg-white/70 px-2 py-1 font-mono text-sm font-black leading-none text-amber-950">
            {deliveredCount}/{required}
          </span>
        </div>
        <div
          ref={claimRevealRef}
          data-board-section="quest-claim-swipe"
          data-claim-complete={claimed ? "true" : "false"}
          data-claim-locked={isComplete ? "false" : "true"}
          className={`relative mt-3 h-11 overflow-hidden rounded-full border shadow-[inset_0_2px_8px_rgba(72,45,16,0.16)] ${
            isComplete
              ? "border-emerald-900/20 bg-white/70"
              : "border-dashed border-neutral-900/25 bg-white/45"
          }`}
        >
          {isComplete ? (
            <>
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-emerald-300/45"
                style={{ width: `${Math.round(visibleClaimProgress * 100)}%` }}
                aria-hidden="true"
              />
              <p className="pointer-events-none absolute inset-0 grid place-items-center px-20 text-center font-serif text-xl leading-none text-emerald-950">
                {claimLabel}
              </p>
              <button
                type="button"
                data-quest-claim-knob=""
                tabIndex={canClaim && !claimed ? 0 : -1}
                aria-label={claimLabel}
                className={`absolute top-1/2 grid h-8 -translate-y-1/2 touch-none select-none place-items-center rounded-full border shadow-[0_5px_14px_rgba(72,45,16,0.22)] transition-[background-color,border-color,opacity] ${
                  canClaim && !claimed
                    ? "cursor-grab border-emerald-950/30 bg-emerald-600 text-white active:cursor-grabbing"
                    : "cursor-not-allowed border-neutral-950/15 bg-white text-emerald-800"
                } ${isClaimDragging ? "opacity-95" : ""}`}
                style={{
                  left: claimKnobLeft,
                  transition: isClaimDragging
                    ? "none"
                    : "left 220ms cubic-bezier(0.34,1.56,0.64,1), background-color 160ms ease, border-color 160ms ease",
                  width: `${QUEST_CLAIM_KNOB_WIDTH_PX}px`,
                }}
                onPointerDown={canClaim && !claimed ? onClaimPointerDown : undefined}
              >
                {claimed ? (
                  <CheckCircle2 className="size-5" strokeWidth={2.5} />
                ) : (
                  <ChevronUp className="size-5 rotate-90" strokeWidth={2.75} />
                )}
              </button>
            </>
          ) : (
            <p className="pointer-events-none absolute inset-0 grid place-items-center px-4 text-center text-xs font-black uppercase leading-none tracking-normal text-neutral-700/70">
              Drop {card.name} to unlock claim
            </p>
          )}
        </div>
      </section>
    );
  },
);

const QuestPanelPropsSchema = z.object({
  activeQuestIds: z.array(z.string().min(1)),
  activeTab: QuestPanelTabSchema,
  canClaim: z.boolean(),
  claimedQuestIds: z.array(z.string().min(1)),
  claimProgress: z.number().min(0).max(1),
  deliveryCard: z.custom<AlchemyBoardCard | null>(),
  deliveryDropFeedback: z.custom<DropFeedback>(),
  deliveryProgress: z.object({
    delivered: z.int().min(0),
    required: z.int().min(1),
  }),
  developerNotesVisible: z.boolean(),
  hasQuestNotifications: z.boolean(),
  isClaimDragging: z.boolean(),
  onClaimPointerDown: z.custom<(event: ReactPointerEvent<HTMLButtonElement>) => void>(),
  onQuestLogScrollTopChange: z.custom<(scrollTop: number) => void>(),
  onQuestOpenFromLog: z.custom<(questId: string) => void>(),
  onQuestSelect: z.custom<(questId: string) => void>(),
  onTabChange: z.custom<(tab: QuestPanelTab) => void>(),
  questLogScrollTop: z.number().min(0),
  selectedQuestId: z.string().min(1),
  unlockedQuestIds: z.array(z.string().min(1)),
});

const QuestPanel = defineComponent(
  QuestPanelPropsSchema,
  ({
    activeQuestIds,
    activeTab,
    canClaim,
    claimedQuestIds,
    claimProgress,
    deliveryCard,
    deliveryDropFeedback,
    deliveryProgress,
    developerNotesVisible,
    hasQuestNotifications,
    isClaimDragging,
    onClaimPointerDown,
    onQuestLogScrollTopChange,
    onQuestOpenFromLog,
    onQuestSelect,
    onTabChange,
    questLogScrollTop,
    selectedQuestId,
    unlockedQuestIds,
  }) => (
    <section className="relative z-10 grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)]">
      <QuestPanelTabs
        activeTab={activeTab}
        hasQuestNotifications={hasQuestNotifications}
        onTabChange={onTabChange}
      />
      <div className="min-h-0 pt-2">
        {activeTab === "current" ? (
          <div data-board-section="quest-current" className="grid min-h-0 content-start gap-2">
            <QuestCurrentCarousel
              developerNotesVisible={developerNotesVisible}
              selectedQuestId={selectedQuestId}
              unlockedQuestIds={unlockedQuestIds}
              onQuestSelect={onQuestSelect}
            />
            {deliveryCard ? (
              <QuestDeliverySlot
                key={selectedQuestId}
                canClaim={canClaim}
                card={deliveryCard}
                claimed={claimedQuestIds.includes(selectedQuestId)}
                claimProgress={claimProgress}
                delivered={deliveryProgress.delivered}
                dropFeedback={deliveryDropFeedback}
                isClaimDragging={isClaimDragging}
                onClaimPointerDown={onClaimPointerDown}
                questId={selectedQuestId}
                required={deliveryProgress.required}
                requesterName={getQuestRequesterName(selectedQuestId)}
              />
            ) : null}
          </div>
        ) : (
          <QuestLog
            activeQuestIds={activeQuestIds}
            claimedQuestIds={claimedQuestIds}
            questLogScrollTop={questLogScrollTop}
            selectedQuestId={selectedQuestId}
            unlockedQuestIds={unlockedQuestIds}
            onQuestLogScrollTopChange={onQuestLogScrollTopChange}
            onQuestOpenFromLog={onQuestOpenFromLog}
            onQuestSelect={onQuestSelect}
          />
        )}
      </div>
    </section>
  ),
);

const QuestPanelTabsPropsSchema = z.object({
  activeTab: QuestPanelTabSchema,
  hasQuestNotifications: z.boolean(),
  onTabChange: z.custom<(tab: QuestPanelTab) => void>(),
});

const questPanelTabLabels = {
  current: "Current Quest",
  log: "Quest Log",
} satisfies Record<QuestPanelTab, string>;

const QuestPanelTabs = defineComponent(
  QuestPanelTabsPropsSchema,
  ({ activeTab, hasQuestNotifications, onTabChange }) => (
    <div
      data-board-section="quest-briefing-tabs"
      className="flex items-center gap-1 border-b border-white/45 pb-1.5"
      role="tablist"
      aria-label="Quest Briefing views"
    >
      {questPanelTabs.map((tab) => {
        const selected = activeTab === tab;
        const showBadge = tab === "log" && hasQuestNotifications;

        return (
          <button
            key={tab}
            type="button"
            data-info-panel-tab={tab}
            role="tab"
            aria-selected={selected}
            className={`relative rounded-[5px] border px-3 py-1.5 text-xs font-black leading-none transition-[background-color,border-color,color] ${
              selected
                ? "border-amber-900/45 bg-amber-950 text-white"
                : "border-amber-900/20 bg-white/55 text-amber-950 hover:bg-white/80"
            }`}
            onClick={() => {
              onTabChange(tab);
            }}
          >
            {questPanelTabLabels[tab]}
            {showBadge ? (
              <span
                data-quest-tab-notification=""
                className="absolute -right-1 -top-1 size-3 rounded-full border border-white bg-amber-400 shadow-[0_1px_4px_rgba(15,23,42,0.28)]"
                aria-hidden="true"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  ),
);

const boardModeTabLabels = {
  crafting: "Crafting",
  expedition: "Expedition",
  gathering: "Gathering",
} satisfies Record<BoardModeTab, string>;

const boardModeTabSoundIds = {
  crafting: "board-mode.crafting",
  expedition: "board-mode.expedition",
  gathering: "board-mode.gathering",
} as const satisfies Record<BoardModeTab, string>;

const BoardModeTabsPropsSchema = z.object({
  activeTab: BoardModeTabSchema,
  onTabChange: z.custom<(tab: BoardModeTab) => void>(),
});

const BoardModeTabs = defineComponent(BoardModeTabsPropsSchema, ({ activeTab, onTabChange }) => (
  <div
    data-board-section="board-mode-tabs"
    data-board-name="Board Mode Tabs"
    data-board-description={BOARD_DESCRIPTIONS.boardModeTabs}
    className="pointer-events-auto flex min-h-10 items-center gap-1 overflow-x-auto rounded-[8px] border border-white/50 bg-white/70 px-2 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]"
    role="tablist"
    aria-label="Board modes"
  >
    {boardModeTabs.map((tab) => {
      const selected = activeTab === tab;

      return (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={selected}
          className={getBoardModeTabClass(selected)}
          onClick={() => {
            onTabChange(tab);
          }}
        >
          {boardModeTabLabels[tab]}
        </button>
      );
    })}
  </div>
));

function getBoardModeTabClass(selected: boolean): string {
  const baseClass =
    "shrink-0 rounded-[5px] border px-3 py-1.5 text-xs font-black leading-none transition-[background-color,border-color,color]";

  if (selected) return `${baseClass} border-amber-900/45 bg-amber-950 text-white`;

  return `${baseClass} border-amber-900/20 bg-white/60 text-amber-950/70 hover:bg-white/85`;
}

const QuestCurrentCarouselPropsSchema = z.object({
  developerNotesVisible: z.boolean(),
  onQuestSelect: z.custom<(questId: string) => void>(),
  selectedQuestId: z.string().min(1),
  unlockedQuestIds: z.array(z.string().min(1)),
});

const QuestCurrentCarousel = defineComponent(
  QuestCurrentCarouselPropsSchema,
  ({ developerNotesVisible, onQuestSelect, selectedQuestId, unlockedQuestIds }) => {
    const viewportRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const swipeRef = useRef<QuestCurrentSwipe | null>(null);
    const animationRef = useRef<JSAnimation | null>(null);
    const removePointerListenersRef = useRef<(() => void) | null>(null);
    const selectedQuestIndex = getQuestIndexById(selectedQuestId);
    const unlockedQuestIdSet = new Set(unlockedQuestIds);
    const selectedQuestNumber = selectedQuestIndex + 1;

    const centerTrack = () => {
      const slideWidth = viewportRef.current?.getBoundingClientRect().width ?? 0;
      const trackElement = trackRef.current;
      if (!trackElement || slideWidth <= 0) return;
      trackElement.style.transform = `translateX(${getQuestCurrentCenterX(slideWidth)}px)`;
    };

    const animateToQuestDirection = (direction: -1 | 0 | 1) => {
      const trackElement = trackRef.current;
      const slideWidth = viewportRef.current?.getBoundingClientRect().width ?? 0;
      if (!trackElement || slideWidth <= 0) return;

      animationRef.current?.cancel();
      animationRef.current = null;

      if (direction === 0) {
        snapQuestCurrentTrack(trackElement, getQuestCurrentCenterX(slideWidth), animationRef);
        return;
      }

      const nextQuest = getQuestAtWrappedIndex(selectedQuestIndex + direction);
      const targetX = getQuestCurrentTargetX(direction, slideWidth);
      if (prefersReducedMotion()) {
        onQuestSelect(nextQuest.id);
        return;
      }

      animationRef.current = animate(trackElement, {
        duration: QUEST_CURRENT_SNAP_DURATION_MS,
        ease: "out(3)",
        x: targetX,
        onComplete: () => {
          animationRef.current = null;
          onQuestSelect(nextQuest.id);
        },
      });
    };

    const handlePrevious = () => {
      animateToQuestDirection(-1);
    };

    const handleNext = () => {
      animateToQuestDirection(1);
    };

    const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      if (isInsideQuestBriefingCarousel(event.target)) return;
      const trackElement = trackRef.current;
      if (!trackElement) return;

      const slideWidth = event.currentTarget.getBoundingClientRect().width;
      if (slideWidth <= 0) return;

      event.preventDefault();
      removePointerListenersRef.current?.();
      animationRef.current?.cancel();
      animationRef.current = null;

      const motion = createAnimatable(trackElement, { x: { duration: 0, unit: "px" } });
      setMotionProperty(motion, "x", getQuestCurrentCenterX(slideWidth));
      swipeRef.current = {
        animationFrame: 0,
        captureElement: event.currentTarget,
        latestDeltaX: 0,
        motion,
        pointerId: event.pointerId,
        slideWidth,
        startClientX: event.clientX,
      };
      capturePointer(event.currentTarget, event.pointerId);
      removePointerListenersRef.current = addQuestCurrentPointerListeners(
        handlePointerMove,
        handlePointerUp,
        handlePointerCancel,
      );
    };

    const paintDrag = () => {
      const swipe = swipeRef.current;
      if (!swipe) return;

      swipe.animationFrame = 0;
      setMotionProperty(
        swipe.motion,
        "x",
        getQuestCurrentCenterX(swipe.slideWidth) + swipe.latestDeltaX,
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

      const direction = getQuestCurrentSwipeDirection(swipe.latestDeltaX);
      swipeRef.current = null;
      if (swipe.captureElement.hasPointerCapture(event.pointerId)) {
        swipe.captureElement.releasePointerCapture(event.pointerId);
      }
      animateToQuestDirection(direction);
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
      snapQuestCurrentTrack(
        trackRef.current,
        getQuestCurrentCenterX(swipe.slideWidth),
        animationRef,
      );
    };

    useBrowserLayoutEffect(() => {
      centerTrack();
    }, [selectedQuestId]);

    useBrowserLayoutEffect(() => {
      const viewportElement = viewportRef.current;
      if (!viewportElement) return;

      const resizeObserver = new ResizeObserver(centerTrack);
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
        animationRef.current?.cancel();
      },
      [],
    );

    return (
      <section className="grid min-h-0 gap-2" aria-label="Selected quest">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
          <button
            type="button"
            className="inline-grid grid-cols-[auto_auto] items-center gap-1 rounded-[5px] border border-amber-900/25 bg-white/65 px-2 py-1 text-[10px] font-black uppercase leading-none text-amber-950 transition-[background-color,transform] hover:bg-white/85 active:scale-[0.98]"
            onClick={handlePrevious}
          >
            <ChevronLeft className="size-3.5" strokeWidth={2.6} aria-hidden="true" />
            Previous
          </button>
          <p
            className="min-w-0 text-center font-mono text-xs font-black leading-none text-amber-950"
            aria-live="polite"
          >
            Quest {selectedQuestNumber}/{ALCHEMY_QUESTS.length}
          </p>
          <button
            type="button"
            className="inline-grid grid-cols-[auto_auto] items-center gap-1 rounded-[5px] border border-amber-900/25 bg-white/65 px-2 py-1 text-[10px] font-black uppercase leading-none text-amber-950 transition-[background-color,transform] hover:bg-white/85 active:scale-[0.98]"
            onClick={handleNext}
          >
            Next
            <ChevronRight className="size-3.5" strokeWidth={2.6} aria-hidden="true" />
          </button>
        </div>

        <div
          ref={viewportRef}
          data-board-section="quest-current-carousel"
          className="min-h-0 touch-pan-y select-none overflow-hidden"
          onPointerDown={handlePointerDown}
        >
          <div
            ref={trackRef}
            className="grid grid-flow-col auto-cols-[100%]"
            style={{ transform: "translateX(-33.333333%)" }}
          >
            {QUEST_CURRENT_SLIDE_OFFSETS.map((offset) => {
              const quest = getQuestAtWrappedIndex(selectedQuestIndex + offset);
              const cardProps = createQuestBriefingCardProps(quest);
              const isUnlocked = unlockedQuestIdSet.has(quest.id);

              return (
                <div
                  key={`${quest.id}:${offset}`}
                  data-quest-current-slide={offset}
                  className="min-w-0 px-0"
                  aria-hidden={offset === 0 ? undefined : true}
                  inert={offset === 0 ? undefined : true}
                >
                  <QuestBriefingCard
                    {...cardProps}
                    developerNotesVisible={developerNotesVisible}
                    {...(offset === 0 ? { onCarouselEdgeSwipe: animateToQuestDirection } : {})}
                    redacted={!isUnlocked}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  },
);

const QuestLogPropsSchema = z.object({
  activeQuestIds: z.array(z.string().min(1)),
  claimedQuestIds: z.array(z.string().min(1)),
  onQuestLogScrollTopChange: z.custom<(scrollTop: number) => void>(),
  onQuestOpenFromLog: z.custom<(questId: string) => void>(),
  onQuestSelect: z.custom<(questId: string) => void>(),
  questLogScrollTop: z.number().min(0),
  selectedQuestId: z.string().min(1),
  unlockedQuestIds: z.array(z.string().min(1)),
});

const QuestLog = defineComponent(
  QuestLogPropsSchema,
  ({
    activeQuestIds,
    claimedQuestIds,
    onQuestLogScrollTopChange,
    onQuestOpenFromLog,
    onQuestSelect,
    questLogScrollTop,
    selectedQuestId,
    unlockedQuestIds,
  }) => {
    const viewportRef = useRef<HTMLDivElement>(null);
    const scrollFrameRef = useRef(0);
    const [viewportHeight, setViewportHeight] = useState(0);
    const [visibleScrollTop, setVisibleScrollTop] = useState(0);
    const claimedQuestIdSet = new Set(claimedQuestIds);
    const activeQuestIdSet = new Set(activeQuestIds);
    const unlockedQuestIdSet = new Set(unlockedQuestIds);
    const startIndex = getQuestLogStartIndex(visibleScrollTop);
    const endIndex = getQuestLogEndIndex(startIndex, viewportHeight);
    const visibleQuests = ALCHEMY_QUESTS.slice(startIndex, endIndex);
    const totalHeight = ALCHEMY_QUESTS.length * QUEST_LOG_ROW_PITCH_PX - QUEST_LOG_ROW_GAP_PX;
    const selectedQuestIndex = getQuestIndexById(selectedQuestId);

    const syncScrollTop = (nextScrollTop: number) => {
      setVisibleScrollTop(nextScrollTop);
      onQuestLogScrollTopChange(nextScrollTop);
    };

    const handleScroll = (event: ReactUIEvent<HTMLDivElement>) => {
      const nextScrollTop = event.currentTarget.scrollTop;
      if (scrollFrameRef.current !== 0) cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = requestAnimationFrame(() => {
        scrollFrameRef.current = 0;
        syncScrollTop(nextScrollTop);
      });
    };

    useBrowserLayoutEffect(() => {
      const viewportElement = viewportRef.current;
      if (!viewportElement) return;

      viewportElement.scrollTop = questLogScrollTop;
      setVisibleScrollTop(questLogScrollTop);

      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        setViewportHeight(entry.contentRect.height);
      });
      resizeObserver.observe(viewportElement);

      return () => {
        resizeObserver.disconnect();
      };
    }, []);

    useBrowserLayoutEffect(() => {
      const viewportElement = viewportRef.current;
      if (!viewportElement) return;

      const nextScrollTop = getQuestLogScrollTopForSelectedQuest(
        selectedQuestIndex,
        viewportElement.scrollTop,
        viewportElement.clientHeight,
      );
      if (nextScrollTop === viewportElement.scrollTop) return;

      viewportElement.scrollTop = nextScrollTop;
      syncScrollTop(nextScrollTop);
    }, [selectedQuestId]);

    useEffect(
      () => () => {
        if (scrollFrameRef.current !== 0) cancelAnimationFrame(scrollFrameRef.current);
      },
      [],
    );

    return (
      <section
        ref={viewportRef}
        data-board-section="quest-log"
        className="h-full min-h-0 overflow-y-auto pr-1"
        aria-label="Quest Log"
        onScroll={handleScroll}
      >
        <div className="relative" style={{ height: `${totalHeight}px` }}>
          <div
            className="absolute inset-x-0 grid gap-2"
            style={{ transform: `translateY(${startIndex * QUEST_LOG_ROW_PITCH_PX}px)` }}
          >
            {visibleQuests.map((quest) => {
              const isClaimed = claimedQuestIdSet.has(quest.id);
              const isActive = activeQuestIdSet.has(quest.id);
              const isSelected = quest.id === selectedQuestId;
              const isUnlocked = unlockedQuestIdSet.has(quest.id);

              return (
                <QuestLogRow
                  key={quest.id}
                  isActive={isActive}
                  isClaimed={isClaimed}
                  isSelected={isSelected}
                  isUnlocked={isUnlocked}
                  quest={quest}
                  onQuestOpenFromLog={onQuestOpenFromLog}
                  onQuestSelect={onQuestSelect}
                />
              );
            })}
          </div>
        </div>
      </section>
    );
  },
);

const QuestLogRowPropsSchema = z.object({
  isActive: z.boolean(),
  isClaimed: z.boolean(),
  isSelected: z.boolean(),
  isUnlocked: z.boolean(),
  onQuestOpenFromLog: z.custom<(questId: string) => void>(),
  onQuestSelect: z.custom<(questId: string) => void>(),
  quest: z.custom<StaticAlchemyQuest>(),
});

const QuestLogRow = defineComponent(
  QuestLogRowPropsSchema,
  ({ isActive, isClaimed, isSelected, isUnlocked, onQuestOpenFromLog, onQuestSelect, quest }) => {
    const revealed = isUnlocked;
    let Icon = LockKeyhole;
    if (isActive) Icon = BookOpen;
    if (isClaimed) Icon = ScrollText;

    let rowClass = "border-neutral-900/15 bg-white/35";
    if (isUnlocked) rowClass = "border-amber-500/45 bg-amber-50/60";
    if (isClaimed) rowClass = "border-emerald-600/45 bg-white/70";
    if (isSelected) {
      rowClass = `${rowClass} border-sky-600 outline outline-[3px] outline-offset-[-4px] outline-sky-600/80`;
    }

    const title = getQuestLogRowTitle(quest, revealed, isActive);
    const badgeLabel = getQuestLogRowBadgeLabel(isClaimed, isActive, isUnlocked);

    return (
      <button
        type="button"
        data-board-section="quest-log-row"
        data-quest-id={quest.id}
        data-quest-redacted={revealed ? "false" : "true"}
        data-quest-selected={isSelected ? "true" : "false"}
        className={`grid h-16 w-full grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-2 rounded-[6px] border p-2 text-left text-neutral-950 shadow-[0_1px_0_rgba(72,45,16,0.1)] transition-[background-color,border-color,box-shadow,transform] hover:-translate-y-0.5 ${rowClass}`}
        onClick={() => {
          onQuestSelect(quest.id);
        }}
        onDoubleClick={() => {
          onQuestOpenFromLog(quest.id);
        }}
      >
        <span
          className={`grid size-9 place-items-center rounded-[5px] border ${
            revealed
              ? "border-emerald-700/35 bg-emerald-50 text-emerald-800"
              : "border-neutral-900/15 bg-white/55 text-neutral-600"
          }`}
          aria-hidden="true"
        >
          <Icon className="size-4" strokeWidth={2.4} />
        </span>
        <span className="min-w-0">
          <span
            className={`block truncate text-xs font-black leading-tight ${
              revealed ? "text-amber-950" : "text-neutral-700"
            }`}
          >
            {title}
          </span>
          <span className="mt-1 block truncate text-[10px] font-bold uppercase leading-none tracking-normal text-neutral-700/70">
            {revealed
              ? `Act ${quest.progression.act} • ${formatTokenLabel(quest.progression.boardSlot)}`
              : "Complete earlier guild work to reveal"}
          </span>
        </span>
        <span
          className={`rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase leading-none ${
            revealed ? "bg-emerald-700 text-white" : "bg-neutral-900/15 text-neutral-700"
          }`}
        >
          {badgeLabel}
        </span>
      </button>
    );
  },
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
  isFlyDestination: z.boolean(),
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
  ({ card, cooldowns, draggedCard, isFlyDestination, nowMs, onPointerDown, slotId, slotName }) => {
    const stackCount = cooldowns.length;
    const readyCount = getReadyCooldownCount(cooldowns, nowMs);
    const isDraggingSource =
      draggedCard?.source.kind === "inventory" && draggedCard.source.slotId === slotId;

    return (
      <div
        data-inventory-slot-id={slotId}
        data-board-section={slotId}
        data-board-name={slotName}
        data-card-flight-hidden={isFlyDestination ? "true" : undefined}
        className="relative h-14 min-w-[7.35rem] rounded-[6px] border border-dashed border-neutral-700/50 bg-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
      >
        {card && !isFlyDestination ? (
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
  alreadyMade: z.boolean(),
  preview: z.custom<AlchemyWorkbenchAnyRecipePreview | null>(),
});

const OutputSlotPreview = defineComponent(
  OutputSlotPreviewPropsSchema,
  ({ alreadyMade, preview }) => {
    let content = (
      <span
        data-output-slot-empty=""
        className="grid size-full place-items-center px-2 text-center text-[11px] font-bold uppercase leading-snug tracking-normal text-neutral-700/70"
      >
        No output
      </span>
    );

    if (preview) {
      content = (
        <OutputRecipeCard key={preview.recipe.id} alreadyMade={alreadyMade} preview={preview} />
      );
    }
    if (alreadyMade && !preview) {
      content = (
        <span
          data-output-slot-already-made=""
          className="grid size-full place-items-center px-2 text-center text-[11px] font-black uppercase leading-snug tracking-normal text-emerald-900"
        >
          Already made
        </span>
      );
    }

    return (
      <div className="absolute inset-0 min-h-0" aria-live="polite">
        {content}
      </div>
    );
  },
);

const OutputRecipeCardPropsSchema = z.object({
  alreadyMade: z.boolean(),
  preview: z.custom<AlchemyWorkbenchAnyRecipePreview>(),
});

const OutputRecipeCard = defineComponent(
  OutputRecipeCardPropsSchema,
  ({ alreadyMade, preview }) => {
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
        data-output-already-made={alreadyMade ? "true" : undefined}
        data-recipe-id={preview.recipe.id}
        className={`absolute -inset-px grid select-none grid-rows-[auto_1fr_auto] overflow-hidden rounded-[6px] border-2 border-sky-800/55 bg-sky-50/95 p-1.5 text-center shadow-[0_10px_22px_rgba(15,23,42,0.22)] transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        aria-label={`${getRecipePreviewOutputName(preview)} output preview`}
      >
        <span className="justify-self-end rounded-[3px] bg-sky-950 px-1.5 py-0.5 font-mono text-[10px] font-black leading-none text-white">
          {preview.formula}
        </span>
        {isExtendedRecipePreview(preview) ? (
          <span className="mx-auto grid size-16 place-items-center self-center rounded-full border border-emerald-900/20 bg-emerald-100/80 px-1 font-mono text-[13px] font-black leading-tight text-emerald-950">
            {preview.recipe.output.formula}
          </span>
        ) : (
          <img
            src={resolvePublicAssetPath(preview.recipe.output.imagePath)}
            alt=""
            aria-hidden="true"
            className="mx-auto size-16 self-center object-contain"
            draggable={false}
          />
        )}
        <span className="grid gap-0.5">
          <span className="truncate font-serif text-lg font-bold leading-none text-sky-950">
            {getRecipePreviewOutputName(preview)}
          </span>
          <span className="truncate text-[9px] font-bold uppercase leading-none tracking-normal text-sky-950/65">
            {getRecipePreviewKindLabel(preview)}
          </span>
        </span>
        {alreadyMade ? <AlreadyMadeStamp /> : null}
      </article>
    );
  },
);

const AlreadyMadeStamp = defineComponent(z.object({}), () => {
  const stampPathId = `already-made-stamp-${useId().replaceAll(":", "")}`;

  return (
    <span
      data-output-slot-already-made=""
      className="pointer-events-none absolute inset-0 z-20 grid place-items-center"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 120 120"
        aria-hidden="true"
        className="size-[92px] -rotate-12 text-emerald-800/85 drop-shadow-[0_2px_0_rgba(255,255,255,0.55)]"
      >
        <defs>
          <path id={stampPathId} d="M 22 63 A 38 38 0 0 1 98 63" />
        </defs>
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="rgba(236,253,245,0.68)"
          stroke="currentColor"
          strokeWidth="4"
        />
        <circle
          cx="60"
          cy="60"
          r="35"
          fill="none"
          stroke="currentColor"
          strokeDasharray="3 4"
          strokeWidth="2.5"
        />
        <text
          className="font-mono text-[10px] font-black uppercase tracking-[0.16em]"
          fill="currentColor"
        >
          <textPath href={`#${stampPathId}`} startOffset="50%" textAnchor="middle">
            ALREADY MADE
          </textPath>
        </text>
        <path
          d="M 40 63 L 54 77 L 82 45"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="8"
        />
        <text
          x="60"
          y="94"
          className="font-mono text-[9px] font-black uppercase tracking-[0.18em]"
          fill="currentColor"
          textAnchor="middle"
        >
          APPROVED
        </text>
      </svg>
    </span>
  );
});

const AlchemyWorkbenchInfoPanelPropsSchema = z.object({
  activeTab: InfoPanelTabSchema,
  discoveredExtendedRecipeIds: z.array(z.string().min(1)),
  discoveredRecipeIds: z.array(z.string().min(1)),
  hasExtendedRecipeNotifications: z.boolean(),
  hasRecipeNotifications: z.boolean(),
  onExtendedRecipeRevealSeen: z.custom<(recipeId: string) => void>(),
  onRecipeRevealSeen: z.custom<(recipeId: string) => void>(),
  onTabChange: z.custom<(tab: InfoPanelTab) => void>(),
  preview: z.custom<AlchemyWorkbenchAnyRecipePreview | null>(),
  revealExtendedRecipeIds: z.array(z.string().min(1)),
  revealRecipeIds: z.array(z.string().min(1)),
});

const AlchemyWorkbenchInfoPanel = defineComponent(
  AlchemyWorkbenchInfoPanelPropsSchema,
  ({
    activeTab,
    discoveredExtendedRecipeIds,
    discoveredRecipeIds,
    hasExtendedRecipeNotifications,
    hasRecipeNotifications,
    onExtendedRecipeRevealSeen,
    onRecipeRevealSeen,
    onTabChange,
    preview,
    revealExtendedRecipeIds,
    revealRecipeIds,
  }) => {
    let content = (
      <ExtendedRecipeLedger
        discoveredRecipeIds={discoveredExtendedRecipeIds}
        onRevealSeen={onExtendedRecipeRevealSeen}
        revealRecipeIds={revealExtendedRecipeIds}
      />
    );

    if (activeTab === "element") {
      content = <AlchemyWorkbenchElementPanel preview={preview} />;
    }
    if (activeTab === "recipe") {
      content = (
        <RecipeLedger
          discoveredRecipeIds={discoveredRecipeIds}
          onRevealSeen={onRecipeRevealSeen}
          revealRecipeIds={revealRecipeIds}
        />
      );
    }

    return (
      <section className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] text-neutral-950">
        <InfoPanelTabs
          activeTab={activeTab}
          hasExtendedRecipeNotifications={hasExtendedRecipeNotifications}
          hasRecipeNotifications={hasRecipeNotifications}
          onTabChange={onTabChange}
        />
        <div className="min-h-0">{content}</div>
      </section>
    );
  },
);

const InfoPanelTabsPropsSchema = z.object({
  activeTab: InfoPanelTabSchema,
  hasExtendedRecipeNotifications: z.boolean(),
  hasRecipeNotifications: z.boolean(),
  onTabChange: z.custom<(tab: InfoPanelTab) => void>(),
});

const infoPanelTabLabels = {
  element: "Element",
  extended: "Extended",
  recipe: "Recipe",
} satisfies Record<InfoPanelTab, string>;

const InfoPanelTabs = defineComponent(
  InfoPanelTabsPropsSchema,
  ({ activeTab, hasExtendedRecipeNotifications, hasRecipeNotifications, onTabChange }) => (
    <div
      data-board-section="alchemy-workbench-info-tabs"
      className="flex items-center gap-1 border-b border-white/45 p-2 pb-1.5"
      role="tablist"
      aria-label="Alchemy Workbench Info views"
    >
      {infoPanelTabs.map((tab) => {
        const selected = activeTab === tab;
        const showBadge =
          (tab === "recipe" && hasRecipeNotifications) ||
          (tab === "extended" && hasExtendedRecipeNotifications);

        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`relative rounded-[5px] border px-3 py-1.5 text-xs font-black leading-none transition-[background-color,border-color,color] ${
              selected
                ? "border-sky-900/45 bg-sky-950 text-white"
                : "border-sky-900/20 bg-white/55 text-sky-950 hover:bg-white/80"
            }`}
            onClick={() => {
              onTabChange(tab);
            }}
          >
            {infoPanelTabLabels[tab]}
            {showBadge ? (
              <span
                data-recipe-tab-notification=""
                className="absolute -right-1 -top-1 size-3 rounded-full border border-white bg-amber-400 shadow-[0_1px_4px_rgba(15,23,42,0.28)]"
                aria-hidden="true"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  ),
);

const AlchemyWorkbenchElementPanelPropsSchema = z.object({
  preview: z.custom<AlchemyWorkbenchAnyRecipePreview | null>(),
});

const AlchemyWorkbenchElementPanel = defineComponent(
  AlchemyWorkbenchElementPanelPropsSchema,
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

    if (isExtendedRecipePreview(preview)) {
      return (
        <article
          data-workbench-info-recipe=""
          data-recipe-id={preview.recipe.id}
          className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3 p-3 text-neutral-950"
        >
          <header className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3">
            <div className="grid size-14 place-items-center rounded-[5px] border border-emerald-900/25 bg-emerald-100/70 px-1 text-center font-mono text-sm font-black leading-tight text-emerald-950">
              {preview.recipe.output.formula}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase leading-none tracking-normal text-emerald-950/65">
                {preview.recipe.id}
              </p>
              <h2 className="truncate font-serif text-2xl leading-none text-emerald-950">
                {preview.recipe.output.name}
              </h2>
              <div className="mt-1 flex flex-wrap gap-1">
                <InfoBadge label="Extended" />
                <InfoBadge label="Discovery" />
                <InfoBadge label={`CID ${preview.recipe.source.pubChemCid}`} />
              </div>
            </div>
          </header>

          <div className="min-h-0 overflow-y-auto pr-1">
            <section className="grid gap-1.5 rounded-[5px] border border-sky-900/20 bg-white/55 p-2">
              <h3 className="text-[11px] font-semibold uppercase leading-none tracking-normal text-sky-950/65">
                Formula
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
                    <dd className="font-semibold text-neutral-700">x{ingredient.quantity}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="mt-2 grid gap-1.5 rounded-[5px] border border-sky-900/20 bg-white/55 p-2">
              <h3 className="text-[11px] font-semibold uppercase leading-none tracking-normal text-sky-950/65">
                Discovery note
              </h3>
              <p className="text-xs font-semibold leading-snug text-neutral-800">
                Extended molecules are optional discoveries. They do not unlock quests, but their
                molecule cards can be reused with elements or other molecules to discover more
                formulas.
              </p>
            </section>

            <section className="mt-2 grid gap-1.5 rounded-[5px] border border-sky-900/20 bg-white/55 p-2">
              <h3 className="text-[11px] font-semibold uppercase leading-none tracking-normal text-sky-950/65">
                Source
              </h3>
              <p className="break-all text-xs font-semibold leading-snug text-neutral-800">
                {preview.recipe.source.url}
              </p>
            </section>
          </div>
        </article>
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

const RecipeLedgerPropsSchema = z.object({
  discoveredRecipeIds: z.array(z.string().min(1)),
  onRevealSeen: z.custom<(recipeId: string) => void>(),
  revealRecipeIds: z.array(z.string().min(1)),
});

const RecipeLedger = defineComponent(
  RecipeLedgerPropsSchema,
  ({ discoveredRecipeIds, onRevealSeen, revealRecipeIds }) => {
    const recipeListRef = useRef<HTMLUListElement>(null);
    const onRevealSeenRef = useRef(onRevealSeen);
    const revealRecipeIdsKey = revealRecipeIds.join(RECIPE_REVEAL_ID_SEPARATOR);
    const discoveredRecipeIdsSet = new Set(discoveredRecipeIds);
    const discoveredCount = ALCHEMY_RECIPES.reduce(
      (total, recipe) => total + (discoveredRecipeIdsSet.has(recipe.id) ? 1 : 0),
      0,
    );

    useEffect(() => {
      onRevealSeenRef.current = onRevealSeen;
    }, [onRevealSeen]);

    useBrowserLayoutEffect(() => {
      const recipeList = recipeListRef.current;
      if (!recipeList || revealRecipeIdsKey.length === 0) return;

      const cleanups = revealRecipeIdsKey
        .split(RECIPE_REVEAL_ID_SEPARATOR)
        .flatMap((recipeId, index) => {
          const element = recipeList.querySelector(
            `[data-recipe-id="${recipeId}"][data-recipe-discovered="true"]`,
          );
          if (!isHTMLElement(element)) return [];

          return [
            observeRecipeReveal({
              delayMs: index * RECIPE_REVEAL_STAGGER_MS,
              element,
              onSeen: () => {
                onRevealSeenRef.current(recipeId);
              },
              scrollRoot: recipeList,
            }),
          ];
        });

      if (cleanups.length === 0) return;

      return () => {
        for (const cleanup of cleanups) cleanup();
      };
    }, [revealRecipeIdsKey]);

    return (
      <section
        data-board-section="recipe-ledger"
        className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2 p-3"
      >
        <header className="grid grid-cols-[1fr_auto] items-end gap-2">
          <div>
            <h2 className="font-serif text-xl leading-none text-sky-950">Recipe Ledger</h2>
            <p className="mt-1 text-[11px] font-semibold leading-tight text-neutral-700">
              Transmute outputs to reveal their formulas.
            </p>
          </div>
          <span className="rounded-full border border-sky-900/20 bg-white/65 px-2 py-1 font-mono text-[10px] font-black leading-none text-sky-950">
            {discoveredCount}/{ALCHEMY_RECIPES.length}
          </span>
        </header>
        <ul
          ref={recipeListRef}
          data-board-section="recipe-ledger-list"
          className="grid min-h-0 content-start gap-1.5 overflow-y-auto pr-1"
          aria-label="All alchemy recipes"
          aria-live="polite"
        >
          {ALCHEMY_RECIPES.map((recipe, recipeIndex) => (
            <RecipeLedgerItem
              key={recipe.id}
              isDiscovered={discoveredRecipeIdsSet.has(recipe.id)}
              isReveal={revealRecipeIds.includes(recipe.id)}
              recipe={recipe}
              recipeIndex={recipeIndex}
            />
          ))}
        </ul>
      </section>
    );
  },
);

type RecipeLedgerRecipe = (typeof ALCHEMY_RECIPES)[number];

const RecipeLedgerItemPropsSchema = z.object({
  isDiscovered: z.boolean(),
  isReveal: z.boolean(),
  recipe: z.custom<RecipeLedgerRecipe>(),
  recipeIndex: z.number().min(0),
});

const RecipeLedgerItem = defineComponent(
  RecipeLedgerItemPropsSchema,
  ({ isDiscovered, isReveal, recipe, recipeIndex }) =>
    isDiscovered ? (
      <li
        data-recipe-id={recipe.id}
        data-recipe-discovered="true"
        data-recipe-reveal={isReveal ? "true" : undefined}
        className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-2 rounded-[6px] border border-sky-900/20 bg-white/70 p-1.5 shadow-[0_4px_12px_rgba(15,23,42,0.08)]"
      >
        <span className="grid size-11 place-items-center rounded-[5px] border border-sky-900/25 bg-sky-50/75">
          <img
            src={resolvePublicAssetPath(recipe.output.imagePath)}
            alt=""
            aria-hidden="true"
            className="size-9 object-contain"
            draggable={false}
          />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-black leading-tight text-sky-950">
            {recipe.output.name}
          </span>
          <span className="block truncate font-mono text-[10px] font-black leading-tight text-neutral-700">
            {formatAlchemyRecipeFormula(recipe)}
          </span>
        </span>
        <span className="rounded-full border border-sky-900/20 bg-sky-50/85 px-1.5 py-0.5 text-[9px] font-black uppercase leading-none text-sky-950">
          {formatTokenLabel(recipe.output.kind)}
        </span>
      </li>
    ) : (
      <li
        data-recipe-id={recipe.id}
        data-recipe-discovered="false"
        className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-2 rounded-[6px] border border-neutral-900/10 bg-white/35 p-1.5"
        aria-label={`Redacted recipe ${recipeIndex + 1}`}
      >
        <span className="grid size-11 place-items-center rounded-[5px] border border-neutral-900/15 bg-neutral-950/5">
          <span className="size-7 rounded-full bg-neutral-950/15 blur-[1px]" aria-hidden="true" />
        </span>
        <span className="grid min-w-0 gap-1.5" aria-hidden="true">
          <span className="h-3 w-[min(9rem,70%)] rounded-full bg-neutral-950/20" />
          <span className="h-2 w-[min(6rem,50%)] rounded-full bg-neutral-950/10" />
        </span>
        <span className="rounded-full border border-neutral-900/15 bg-white/45 px-1.5 py-0.5 font-mono text-[9px] font-black leading-none text-neutral-600">
          REDACTED
        </span>
      </li>
    ),
);

const ExtendedRecipeLedgerPropsSchema = z.object({
  discoveredRecipeIds: z.array(z.string().min(1)),
  onRevealSeen: z.custom<(recipeId: string) => void>(),
  revealRecipeIds: z.array(z.string().min(1)),
});

const ExtendedRecipeLedger = defineComponent(
  ExtendedRecipeLedgerPropsSchema,
  ({ discoveredRecipeIds, onRevealSeen, revealRecipeIds }) => {
    const recipeListRef = useRef<HTMLUListElement>(null);
    const onRevealSeenRef = useRef(onRevealSeen);
    const revealRecipeIdsKey = revealRecipeIds.join(RECIPE_REVEAL_ID_SEPARATOR);
    const discoveredRecipeIdsSet = new Set(discoveredRecipeIds);
    const discoveredCount = EXTENDED_MOLECULE_RECIPES.reduce(
      (total, recipe) => total + (discoveredRecipeIdsSet.has(recipe.id) ? 1 : 0),
      0,
    );

    useEffect(() => {
      onRevealSeenRef.current = onRevealSeen;
    }, [onRevealSeen]);

    useBrowserLayoutEffect(() => {
      const recipeList = recipeListRef.current;
      if (!recipeList || revealRecipeIdsKey.length === 0) return;

      const cleanups = revealRecipeIdsKey
        .split(RECIPE_REVEAL_ID_SEPARATOR)
        .flatMap((recipeId, index) => {
          const element = recipeList.querySelector(
            `[data-recipe-id="${recipeId}"][data-recipe-discovered="true"]`,
          );
          if (!isHTMLElement(element)) return [];

          return [
            observeRecipeReveal({
              delayMs: index * RECIPE_REVEAL_STAGGER_MS,
              element,
              onSeen: () => {
                onRevealSeenRef.current(recipeId);
              },
              scrollRoot: recipeList,
            }),
          ];
        });

      if (cleanups.length === 0) return;

      return () => {
        for (const cleanup of cleanups) cleanup();
      };
    }, [revealRecipeIdsKey]);

    return (
      <section
        data-board-section="extended-recipe-ledger"
        className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2 p-3"
      >
        <header className="grid grid-cols-[1fr_auto] items-end gap-2">
          <div>
            <h2 className="font-serif text-xl leading-none text-emerald-950">Extended Ledger</h2>
            <p className="mt-1 text-[11px] font-semibold leading-tight text-neutral-700">
              Optional PubChem-backed molecule discoveries.
            </p>
          </div>
          <span className="rounded-full border border-emerald-900/20 bg-white/65 px-2 py-1 font-mono text-[10px] font-black leading-none text-emerald-950">
            {discoveredCount}/{EXTENDED_MOLECULE_RECIPES.length}
          </span>
        </header>
        <ul
          ref={recipeListRef}
          data-board-section="extended-recipe-ledger-list"
          className="grid min-h-0 content-start gap-1.5 overflow-y-auto pr-1"
          aria-label="All extended molecule recipes"
          aria-live="polite"
        >
          {EXTENDED_MOLECULE_RECIPES.map((recipe, recipeIndex) => (
            <ExtendedRecipeLedgerItem
              key={recipe.id}
              isDiscovered={discoveredRecipeIdsSet.has(recipe.id)}
              isReveal={revealRecipeIds.includes(recipe.id)}
              recipe={recipe}
              recipeIndex={recipeIndex}
            />
          ))}
        </ul>
      </section>
    );
  },
);

type ExtendedRecipeLedgerRecipe = (typeof EXTENDED_MOLECULE_RECIPES)[number];

const ExtendedRecipeLedgerItemPropsSchema = z.object({
  isDiscovered: z.boolean(),
  isReveal: z.boolean(),
  recipe: z.custom<ExtendedRecipeLedgerRecipe>(),
  recipeIndex: z.number().min(0),
});

const ExtendedRecipeLedgerItem = defineComponent(
  ExtendedRecipeLedgerItemPropsSchema,
  ({ isDiscovered, isReveal, recipe, recipeIndex }) =>
    isDiscovered ? (
      <li
        data-recipe-id={recipe.id}
        data-recipe-discovered="true"
        data-recipe-reveal={isReveal ? "true" : undefined}
        className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-2 rounded-[6px] border border-emerald-900/20 bg-white/70 p-1.5 shadow-[0_4px_12px_rgba(15,23,42,0.08)]"
      >
        <span className="grid size-11 place-items-center rounded-[5px] border border-emerald-900/25 bg-emerald-50/80 px-1 text-center font-mono text-[10px] font-black leading-tight text-emerald-950">
          {recipe.output.formula}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-black leading-tight text-emerald-950">
            {recipe.output.name}
          </span>
          <span className="block truncate font-mono text-[10px] font-black leading-tight text-neutral-700">
            {formatExtendedRecipeLedgerFormula(recipe)}
          </span>
        </span>
        <span className="rounded-full border border-emerald-900/20 bg-emerald-50/85 px-1.5 py-0.5 text-[9px] font-black uppercase leading-none text-emerald-950">
          Molecule
        </span>
      </li>
    ) : (
      <li
        data-recipe-id={recipe.id}
        data-recipe-discovered="false"
        className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-2 rounded-[6px] border border-neutral-900/10 bg-white/35 p-1.5"
        aria-label={`Redacted extended recipe ${recipeIndex + 1}`}
      >
        <span className="grid size-11 place-items-center rounded-[5px] border border-neutral-900/15 bg-neutral-950/5">
          <span className="size-7 rounded-full bg-neutral-950/15 blur-[1px]" aria-hidden="true" />
        </span>
        <span className="grid min-w-0 gap-1.5" aria-hidden="true">
          <span className="h-3 w-[min(9rem,70%)] rounded-full bg-neutral-950/20" />
          <span className="h-2 w-[min(6rem,50%)] rounded-full bg-neutral-950/10" />
        </span>
        <span className="rounded-full border border-neutral-900/15 bg-white/45 px-1.5 py-0.5 font-mono text-[9px] font-black leading-none text-neutral-600">
          REDACTED
        </span>
      </li>
    ),
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

const LeftModePanelPropsSchema = z.object({
  activeQuestIds: z.array(z.string().min(1)),
  activeTab: QuestPanelTabSchema,
  canClaim: z.boolean(),
  claimedQuestIds: z.array(z.string().min(1)),
  claimProgress: z.number().min(0).max(1),
  deliveryCard: z.custom<AlchemyBoardCard | null>(),
  deliveryDropFeedback: z.custom<DropFeedback>(),
  deliveryProgress: z.object({
    delivered: z.int().min(0),
    required: z.int().min(1),
  }),
  developerNotesVisible: z.boolean(),
  gathering: z.custom<AlchemistGuildGatheringState>(),
  gatheringDropTarget: z.custom<GatheringDropTarget>(),
  hasQuestNotifications: z.boolean(),
  isClaimDragging: z.boolean(),
  isGatheringMode: z.boolean(),
  onClaimPointerDown: z.custom<ButtonPointerDownHandler>(),
  onQuestLogScrollTopChange: z.custom<(scrollTop: number) => void>(),
  onQuestOpenFromLog: z.custom<(questId: string) => void>(),
  onQuestSelect: z.custom<(questId: string) => void>(),
  onTabChange: z.custom<(tab: QuestPanelTab) => void>(),
  questLogScrollTop: z.number().min(0),
  questPanelAccepted: z.boolean(),
  selectedQuestId: z.string().min(1),
  unlockedQuestIds: z.array(z.string().min(1)),
});

const LeftModePanel = defineComponent(
  LeftModePanelPropsSchema,
  ({
    activeQuestIds,
    activeTab,
    canClaim,
    claimedQuestIds,
    claimProgress,
    deliveryCard,
    deliveryDropFeedback,
    deliveryProgress,
    developerNotesVisible,
    gathering,
    gatheringDropTarget,
    hasQuestNotifications,
    isClaimDragging,
    isGatheringMode,
    onClaimPointerDown,
    onQuestLogScrollTopChange,
    onQuestOpenFromLog,
    onQuestSelect,
    onTabChange,
    questLogScrollTop,
    questPanelAccepted,
    selectedQuestId,
    unlockedQuestIds,
  }) => {
    if (isGatheringMode) {
      return (
        <GatheringLogPanel
          entries={gathering.gatherLog}
          gatheringDropTarget={gatheringDropTarget}
        />
      );
    }

    return (
      <div
        data-board-section="left-briefing-panel"
        data-board-name="Quest Briefing"
        data-board-description={BOARD_DESCRIPTIONS.questBriefing}
        data-quest-drop-accepted={questPanelAccepted ? "true" : "false"}
        className={`${GLASS_PANEL_CLASS} ${
          questPanelAccepted ? "quest-panel-accepted" : ""
        } grid h-full min-h-0 content-start gap-2 overflow-hidden p-3 transition-[box-shadow,transform] duration-150`}
      >
        <QuestBriefingAtmosphere />
        <BoardDebugBadge
          description={BOARD_DESCRIPTIONS.questBriefing}
          label="Quest Briefing"
          visible={developerNotesVisible}
        />
        <QuestPanel
          activeQuestIds={activeQuestIds}
          activeTab={activeTab}
          canClaim={canClaim}
          claimedQuestIds={claimedQuestIds}
          claimProgress={claimProgress}
          deliveryCard={deliveryCard}
          deliveryDropFeedback={deliveryDropFeedback}
          deliveryProgress={deliveryProgress}
          developerNotesVisible={developerNotesVisible}
          hasQuestNotifications={hasQuestNotifications}
          isClaimDragging={isClaimDragging}
          onClaimPointerDown={onClaimPointerDown}
          onQuestLogScrollTopChange={onQuestLogScrollTopChange}
          onQuestOpenFromLog={onQuestOpenFromLog}
          onQuestSelect={onQuestSelect}
          onTabChange={onTabChange}
          questLogScrollTop={questLogScrollTop}
          selectedQuestId={selectedQuestId}
          unlockedQuestIds={unlockedQuestIds}
        />
      </div>
    );
  },
);

const CenterBoardPanelsPropsSchema = z.object({
  boardState: z.custom<AlchemistGuildBoardState>(),
  canTransmutePreview: z.boolean(),
  draggedCard: z.custom<DraggedAlchemyCard | null>(),
  draggedGatheringCard: z.custom<DraggedGatheringCard | null>(),
  dropIntent: z.custom<DropIntent>(),
  gatheringDropTarget: z.custom<GatheringDropTarget>(),
  isOutputAlreadyMade: z.boolean(),
  isGatheringMode: z.boolean(),
  isTransmuteDragging: z.boolean(),
  onGatheringAnswerPointerDown: z.custom<GatheringAnswerPointerDownHandler>(),
  onGatheringMovePointerDown: z.custom<GatheringMovePointerDownHandler>(),
  onGatheringRewardPointerDown: z.custom<GatheringRewardPointerDownHandler>(),
  onSlottedCardPointerDown: z.custom<SlottedCardPointerDownHandler>(),
  onTransmutationSwipePointerDown: z.custom<ButtonPointerDownHandler>(),
  periodicTableViewportRef: z.custom<RefObject<HTMLDivElement | null>>(),
  recipePreview: z.custom<AlchemyWorkbenchAnyRecipePreview | null>(),
  showBoardDebugBadges: z.boolean(),
  swapAnimation: z.custom<SwapAnimation | null>(),
  transmuteKnobTravelPx: z.number().min(0),
  transmutePadTrackRef: z.custom<RefObject<HTMLDivElement | null>>(),
  transmuteSwipeProgress: z.number().min(0).max(1),
});

const CenterBoardPanels = defineComponent(
  CenterBoardPanelsPropsSchema,
  ({
    boardState,
    canTransmutePreview,
    draggedCard,
    draggedGatheringCard,
    dropIntent,
    gatheringDropTarget,
    isOutputAlreadyMade,
    isGatheringMode,
    isTransmuteDragging,
    onGatheringAnswerPointerDown,
    onGatheringMovePointerDown,
    onGatheringRewardPointerDown,
    onSlottedCardPointerDown,
    onTransmutationSwipePointerDown,
    periodicTableViewportRef,
    recipePreview,
    showBoardDebugBadges,
    swapAnimation,
    transmuteKnobTravelPx,
    transmutePadTrackRef,
    transmuteSwipeProgress,
  }) => (
    <section className={getCenterBoardPanelsClass(isGatheringMode)}>
      <div
        ref={periodicTableViewportRef}
        data-board-section={isGatheringMode ? "gathering-game-panel" : "periodic-table-dock"}
        data-board-name={isGatheringMode ? "Game Panel" : "Periodic Table Vault"}
        data-board-description={
          isGatheringMode ? "Primary gathering playfield." : BOARD_DESCRIPTIONS.periodicTableVault
        }
        className={`${CLEAR_TABLE_WINDOW_CLASS} ${GATHERING_PANEL_TRANSITION_CLASS}`}
      >
        {isGatheringMode ? (
          <GatheringGamePanel
            draggedGatheringCard={draggedGatheringCard}
            gathering={boardState.gathering}
            gatheringDropTarget={gatheringDropTarget}
            onAnswerPointerDown={onGatheringAnswerPointerDown}
          />
        ) : (
          <BoardDebugBadge
            description={BOARD_DESCRIPTIONS.periodicTableVault}
            label="Periodic Table Vault"
            visible={showBoardDebugBadges}
          />
        )}
      </div>

      <div
        data-board-section={isGatheringMode ? "gathering-game-cards-panel" : "alchemy-workbench"}
        data-board-name={isGatheringMode ? "Game Cards" : "Alchemy Workbench"}
        data-board-description={
          isGatheringMode
            ? "Cards available for the gathering encounter."
            : BOARD_DESCRIPTIONS.alchemyWorkbench
        }
        className={getWorkbenchPanelClass(isGatheringMode)}
      >
        {isGatheringMode ? (
          <GatheringGameCardsPanel
            gathering={boardState.gathering}
            gatheringDropTarget={gatheringDropTarget}
            onAnswerPointerDown={onGatheringAnswerPointerDown}
            onMovePointerDown={onGatheringMovePointerDown}
            onRewardPointerDown={onGatheringRewardPointerDown}
          />
        ) : (
          <>
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
                onSlottedCardPointerDown={onSlottedCardPointerDown}
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
              data-transmutation-ready={canTransmutePreview ? "true" : "false"}
              data-swipe-progress={transmuteSwipeProgress.toFixed(2)}
              className={`relative col-span-full min-h-0 overflow-hidden rounded-[6px] border p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-sm sm:col-span-4 ${
                canTransmutePreview
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
                  canTransmutePreview ? "text-sky-950" : "text-neutral-700"
                }`}
              >
                {getTransmutationPadPrompt(recipePreview, isOutputAlreadyMade)}
              </p>
              <button
                type="button"
                data-board-section="swipe-rune-handle"
                data-board-name="Swipe rune handle"
                disabled={!canTransmutePreview}
                tabIndex={canTransmutePreview ? 0 : -1}
                aria-label={getTransmutationPadAriaLabel(recipePreview, isOutputAlreadyMade)}
                className={`absolute bottom-3 top-3 z-20 grid touch-none place-items-center rounded-[5px] text-white shadow-[0_8px_18px_rgba(15,23,42,0.22)] transition-[background-color,opacity] duration-200 active:cursor-grabbing ${
                  canTransmutePreview
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
                onPointerDown={onTransmutationSwipePointerDown}
              >
                <div className="flex h-14 items-center gap-3 lg:h-18 lg:gap-4" aria-hidden="true">
                  <span className="h-full w-0.5 bg-neutral-300" />
                  <span className="h-full w-0.5 bg-neutral-300" />
                  <span className="h-full w-0.5 bg-neutral-300" />
                </div>
              </button>
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
              <OutputSlotPreview alreadyMade={isOutputAlreadyMade} preview={recipePreview} />
            </div>
          </>
        )}
      </div>
    </section>
  ),
);

const ExpeditionCanvasPanelPropsSchema = z.object({
  periodicTableViewportRef: z.custom<RefObject<HTMLDivElement | null>>(),
  showBoardDebugBadges: z.boolean(),
});

const ExpeditionCanvasPanel = defineComponent(
  ExpeditionCanvasPanelPropsSchema,
  ({ periodicTableViewportRef, showBoardDebugBadges }) => (
    <section className="grid min-h-0">
      <div
        ref={periodicTableViewportRef}
        data-board-section="expedition-canvas-panel"
        data-board-name="Expedition Canvas"
        data-board-description="An empty dotted expedition canvas that can be panned and zoomed."
        className={`${CLEAR_TABLE_WINDOW_CLASS} ${GATHERING_PANEL_TRANSITION_CLASS}`}
      >
        <BoardDebugBadge
          description="An empty dotted expedition canvas that can be panned and zoomed."
          label="Expedition Canvas"
          visible={showBoardDebugBadges}
        />
        <span className={GATHERING_PANEL_LABEL_CLASS}>Expedition Canvas</span>
      </div>
    </section>
  ),
);

const RightModePanelsPropsSchema = z.object({
  activeTab: InfoPanelTabSchema,
  discoveredExtendedRecipeIds: z.array(z.string().min(1)),
  discoveredRecipeIds: z.array(z.string().min(1)),
  gathering: z.custom<AlchemistGuildGatheringState>(),
  gatheringDropTarget: z.custom<GatheringDropTarget>(),
  gatheringInfoPanelRef: z.custom<RefObject<HTMLDivElement | null>>(),
  hasExtendedRecipeNotifications: z.boolean(),
  hasRecipeNotifications: z.boolean(),
  isGatheringMode: z.boolean(),
  onExtendedRecipeRevealSeen: z.custom<(recipeId: string) => void>(),
  onRecipeRevealSeen: z.custom<(recipeId: string) => void>(),
  onTabChange: z.custom<(tab: InfoPanelTab) => void>(),
  preview: z.custom<AlchemyWorkbenchAnyRecipePreview | null>(),
  revealExtendedRecipeIds: z.array(z.string().min(1)),
  revealRecipeIds: z.array(z.string().min(1)),
  rightPrimaryPanelRef: z.custom<RefObject<HTMLDivElement | null>>(),
  showBoardDebugBadges: z.boolean(),
});

const RightModePanels = defineComponent(
  RightModePanelsPropsSchema,
  ({
    activeTab,
    discoveredExtendedRecipeIds,
    discoveredRecipeIds,
    gathering,
    gatheringDropTarget,
    gatheringInfoPanelRef,
    hasExtendedRecipeNotifications,
    hasRecipeNotifications,
    isGatheringMode,
    onExtendedRecipeRevealSeen,
    onRecipeRevealSeen,
    onTabChange,
    preview,
    revealExtendedRecipeIds,
    revealRecipeIds,
    rightPrimaryPanelRef,
    showBoardDebugBadges,
  }) => (
    <aside className={getRightModePanelsClass(isGatheringMode)}>
      <div
        ref={rightPrimaryPanelRef}
        data-board-section={
          isGatheringMode ? "gathering-monster-panel" : "alchemy-workbench-info-panel"
        }
        data-board-name={isGatheringMode ? "Monster Panel" : "Alchemy Workbench Info"}
        data-board-description={
          isGatheringMode
            ? "Gathering encounter monster slots."
            : BOARD_DESCRIPTIONS.alchemyWorkbenchInfo
        }
        className={`${GLASS_PANEL_CLASS} overflow-hidden ${isGatheringMode ? "p-3" : ""}`}
      >
        {isGatheringMode ? (
          <GatheringMonsterPanel gathering={gathering} gatheringDropTarget={gatheringDropTarget} />
        ) : (
          <>
            <BoardDebugBadge
              description={BOARD_DESCRIPTIONS.alchemyWorkbenchInfo}
              label="Alchemy Workbench Info"
              visible={showBoardDebugBadges}
            />
            <AlchemyWorkbenchInfoPanel
              activeTab={activeTab}
              discoveredExtendedRecipeIds={discoveredExtendedRecipeIds}
              discoveredRecipeIds={discoveredRecipeIds}
              hasExtendedRecipeNotifications={hasExtendedRecipeNotifications}
              hasRecipeNotifications={hasRecipeNotifications}
              onExtendedRecipeRevealSeen={onExtendedRecipeRevealSeen}
              onRecipeRevealSeen={onRecipeRevealSeen}
              onTabChange={onTabChange}
              preview={preview}
              revealExtendedRecipeIds={revealExtendedRecipeIds}
              revealRecipeIds={revealRecipeIds}
            />
          </>
        )}
      </div>
      <div
        ref={gatheringInfoPanelRef}
        data-board-section="gathering-info-panel"
        data-board-name="Info Panel"
        aria-hidden={isGatheringMode ? undefined : true}
        className={`${GLASS_PANEL_CLASS} overflow-hidden p-3 ${GATHERING_PANEL_TRANSITION_CLASS} ${
          isGatheringMode
            ? "opacity-100 translate-y-0 scale-100"
            : "pointer-events-none opacity-0 translate-y-3 scale-[0.98]"
        }`}
      >
        {isGatheringMode ? <GatheringInfoPanel gathering={gathering} /> : null}
      </div>
    </aside>
  ),
);

function getCenterBoardPanelsClass(isGatheringMode: boolean): string {
  const baseClass = `grid min-h-0 gap-2.5 ${GATHERING_PANEL_TRANSITION_CLASS}`;
  if (isGatheringMode) {
    return `${baseClass} lg:grid-rows-[minmax(0,1fr)_minmax(0,13rem)] xl:grid-rows-[minmax(0,1fr)_minmax(0,13rem)]`;
  }

  return `${baseClass} lg:grid-rows-[minmax(0,1fr)_minmax(0,20rem)] xl:grid-rows-[minmax(0,1fr)_minmax(0,22rem)]`;
}

function getBoardChromeClass(isExpeditionMode: boolean): string {
  const baseClass = "pointer-events-none relative z-10 mx-auto grid h-full min-h-0 max-w-[1332px]";
  if (isExpeditionMode) return `${baseClass} grid-rows-[auto_minmax(0,1fr)] gap-2.5`;

  return `${baseClass} grid-rows-[5rem_auto_minmax(0,1fr)] gap-2.5 lg:grid-rows-[5.5rem_auto_minmax(0,1fr)]`;
}

function getBoardCanvasName(isExpeditionMode: boolean): string {
  return isExpeditionMode ? "Expedition Pixi canvas" : "Periodic table Pixi canvas";
}

function getBoardCanvasAriaLabel(isGatheringMode: boolean, isExpeditionMode: boolean): string {
  if (isGatheringMode) return "Board canvas hidden while gathering";
  if (isExpeditionMode) return "Expedition pan and zoom Pixi canvas";

  return "Periodic table Pixi canvas";
}

function getWorkbenchPanelClass(isGatheringMode: boolean): string {
  if (isGatheringMode) {
    return `${GLASS_PANEL_CLASS} grid grid-cols-5 grid-rows-[minmax(0,1fr)] gap-4 overflow-hidden p-4 pt-10`;
  }

  return `${GLASS_PANEL_CLASS} grid grid-cols-2 grid-rows-[repeat(4,minmax(0,1fr))] gap-3 p-3 sm:grid-cols-5 sm:grid-rows-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-5 xl:gap-8`;
}

function getRightModePanelsClass(isGatheringMode: boolean): string {
  const baseClass = `hidden min-h-0 overflow-hidden lg:grid ${GATHERING_PANEL_TRANSITION_CLASS}`;
  if (isGatheringMode) {
    return `${baseClass} gap-2.5 lg:grid-rows-[minmax(0,1fr)_minmax(0,13rem)] xl:grid-rows-[minmax(0,1fr)_minmax(0,13rem)]`;
  }

  return `${baseClass} gap-0 lg:grid-rows-[minmax(0,1fr)_minmax(0,0px)]`;
}

export const AlchemistGuildBoard = defineComponent(AlchemistGuildBoardPropsSchema, () => {
  const boardState = useAtomValue(alchemistGuildBoardAtom);
  const setBoardState = useSetAtom(alchemistGuildBoardAtom);
  const periodicTableCanvasRef = useRef<HTMLCanvasElement>(null);
  const periodicTableViewportRef = useRef<HTMLDivElement>(null);
  const rightPrimaryPanelRef = useRef<HTMLDivElement>(null);
  const gatheringInfoPanelRef = useRef<HTMLDivElement>(null);
  const draggedCardElementRef = useRef<HTMLDivElement>(null);
  const draggedGatheringCardElementRef = useRef<HTMLDivElement>(null);
  const swapAnimationElementRef = useRef<HTMLDivElement>(null);
  const transmuteFlyAnimationElementRef = useRef<HTMLDivElement>(null);
  const transmutePadTrackRef = useRef<HTMLDivElement>(null);
  const boardStateRef = useRef(boardState);
  const dropIntentRef = useRef<DropIntent>(EMPTY_DROP_INTENT);
  const gatheringDropTargetRef = useRef<GatheringDropTarget>("none");
  const notifiedCooldownIdsRef = useRef<Set<string> | null>(null);
  const dragSequenceRef = useRef(0);
  const gatheringDragSequenceRef = useRef(0);
  const swapAnimationSequenceRef = useRef(0);
  const transmuteFlyAnimationSequenceRef = useRef(0);
  const questRewardFlyAnimationSequenceRef = useRef(0);
  const [draggedCard, setDraggedCard] = useState<DraggedAlchemyCard | null>(null);
  const [draggedGatheringCard, setDraggedGatheringCard] = useState<DraggedGatheringCard | null>(
    null,
  );
  const [dropIntent, setDropIntent] = useState<DropIntent>(EMPTY_DROP_INTENT);
  const [gatheringDropTarget, setGatheringDropTarget] = useState<GatheringDropTarget>("none");
  const [swapAnimation, setSwapAnimation] = useState<SwapAnimation | null>(null);
  const [transmuteFlyAnimation, setTransmuteFlyAnimation] = useState<TransmuteFlyAnimation | null>(
    null,
  );
  const [questRewardFlyAnimation, setQuestRewardFlyAnimation] =
    useState<QuestRewardFlyAnimation | null>(null);
  const [transmuteSwipeProgress, setTransmuteSwipeProgress] = useState(0);
  const [isTransmuteDragging, setIsTransmuteDragging] = useState(false);
  const [transmuteTrackWidth, setTransmuteTrackWidth] = useState(0);
  const [questClaimSwipeStateByQuestId, setQuestClaimSwipeStateByQuestId] =
    useState<QuestClaimSwipeStateByQuestId>({});
  const [infoPanelTab, setInfoPanelTab] = useState<InfoPanelTab>("element");
  const [questPanelTab, setQuestPanelTab] = useState<QuestPanelTab>("current");
  const [pendingRecipeNotificationIds, setPendingRecipeNotificationIds] = useState<string[]>([]);
  const [pendingExtendedRecipeNotificationIds, setPendingExtendedRecipeNotificationIds] = useState<
    string[]
  >([]);
  const [pendingQuestNotificationIds, setPendingQuestNotificationIds] = useState<string[]>([]);
  const [recipeRevealIds, setRecipeRevealIds] = useState<string[]>([]);
  const [extendedRecipeRevealIds, setExtendedRecipeRevealIds] = useState<string[]>([]);
  const showBoardDebugBadges = useLocalhostMetaKeyDebugBadges();
  const nowMs = useInventoryClock();
  const workbenchCardIds = getWorkbenchCardIds(boardState);
  const recipePreview = getAlchemyWorkbenchRecipePreview(workbenchCardIds);
  const extendedRecipePreview = recipePreview
    ? null
    : getAlchemyWorkbenchExtendedRecipePreview(workbenchCardIds);
  const transmutationPreview = recipePreview ?? extendedRecipePreview;
  const isOutputAlreadyMade = isExtendedPreviewAlreadyDiscovered(
    transmutationPreview,
    boardState.discoveredExtendedRecipeIds,
  );
  const canTransmutePreview = Boolean(transmutationPreview) && !isOutputAlreadyMade;
  const activeQuestIds = getAlchemyQuestBoard(boardState.completedQuestIds).map(
    (quest) => quest.id,
  );
  const availableQuestIds = getAvailableAlchemyQuests(boardState.completedQuestIds).map(
    (quest) => quest.id,
  );
  const unlockedQuestIds = [...new Set([...boardState.completedQuestIds, ...availableQuestIds])];
  const selectedQuestId = getQuestAtWrappedIndex(getQuestIndexById(boardState.selectedQuestId)).id;
  const selectedQuest = getRequiredAlchemyQuest(selectedQuestId);
  const selectedQuestDelivery = getQuestDelivery(boardState.questDeliveries, selectedQuest);
  const selectedQuestDeliveryCard = getAlchemyCard(selectedQuestDelivery.cardId);
  const claimedSelectedQuest = boardState.completedQuestIds.includes(selectedQuestId);
  const selectedQuestClaimSwipeState = getQuestClaimSwipeState(
    questClaimSwipeStateByQuestId,
    selectedQuestId,
  );
  const selectedQuestUnlocked = unlockedQuestIds.includes(selectedQuestId);
  const canClaimSelectedQuest =
    selectedQuestUnlocked &&
    !claimedSelectedQuest &&
    selectedQuestDelivery.delivered >= selectedQuestDelivery.required;
  const questPanelAccepted = isQuestPanelAcceptedDrop(dropIntent);
  const activeBoardMode = boardState.activeBoardMode;
  const isGatheringMode = activeBoardMode === "gathering";
  const isExpeditionMode = activeBoardMode === "expedition";
  const transmuteKnobTravelPx = getTransmuteKnobTravelPx(transmuteTrackWidth);
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

  const handleInfoPanelTabChange = (nextTab: InfoPanelTab) => {
    setInfoPanelTab(nextTab);
    if (nextTab === "recipe") {
      setRecipeRevealIds(pendingRecipeNotificationIds);
      setPendingRecipeNotificationIds([]);
      return;
    }

    if (nextTab === "extended") {
      setExtendedRecipeRevealIds(pendingExtendedRecipeNotificationIds);
      setPendingExtendedRecipeNotificationIds([]);
    }
  };

  const handleQuestPanelTabChange = (nextTab: QuestPanelTab) => {
    setQuestPanelTab(nextTab);
    if (nextTab === "log") setPendingQuestNotificationIds([]);
  };

  const handleQuestSelect = (questId: string) => {
    const quest = getAlchemyQuestById(questId);
    if (!quest) return;

    setBoardState((previous) =>
      previous.selectedQuestId === quest.id ? previous : { ...previous, selectedQuestId: quest.id },
    );
  };

  const handleQuestLogScrollTopChange = (scrollTop: number) => {
    const nextScrollTop = Math.max(0, Math.round(scrollTop));
    setBoardState((previous) =>
      previous.questLogScrollTop === nextScrollTop
        ? previous
        : { ...previous, questLogScrollTop: nextScrollTop },
    );
  };

  const handleBoardModeTabChange = (nextTab: BoardModeTab) => {
    if (nextTab === activeBoardMode) return;

    setBoardState((previous) => ({ ...previous, activeBoardMode: nextTab }));
    void sfx.play(boardModeTabSoundIds[nextTab]);
  };

  const beginGatheringAnswerDrag = (
    value: number,
    source: GatheringAnswerDragSource,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (event.button !== 0) return;
    event.preventDefault();
    capturePointer(event.currentTarget, event.pointerId);
    const rect = event.currentTarget.getBoundingClientRect();
    const grabOffset = getScaledPointerOffset(event, rect);
    gatheringDragSequenceRef.current += 1;
    gatheringDropTargetRef.current = "none";
    setGatheringDropTarget("none");
    setDraggedGatheringCard({
      grabOffsetX: grabOffset.x,
      grabOffsetY: grabOffset.y,
      id: `gathering-answer:${value}:${gatheringDragSequenceRef.current}`,
      kind: "answer",
      pointerId: event.pointerId,
      source,
      startClientX: event.clientX,
      startClientY: event.clientY,
      value,
    });
    void sfx.play("card.slot.pickup");
  };

  const beginGatheringMoveDrag = (
    move: GatheringMove,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (event.button !== 0) return;
    event.preventDefault();
    capturePointer(event.currentTarget, event.pointerId);
    const rect = event.currentTarget.getBoundingClientRect();
    const grabOffset = getScaledPointerOffset(event, rect);
    gatheringDragSequenceRef.current += 1;
    gatheringDropTargetRef.current = "none";
    setGatheringDropTarget("none");
    setDraggedGatheringCard({
      grabOffsetX: grabOffset.x,
      grabOffsetY: grabOffset.y,
      id: `gathering-move:${move.id}:${gatheringDragSequenceRef.current}`,
      kind: "move",
      move,
      pointerId: event.pointerId,
      source: { kind: "move-cards" },
      startClientX: event.clientX,
      startClientY: event.clientY,
    });
    void sfx.play("card.slot.pickup");
  };

  const beginGatheringRewardDrag = (
    cardId: string,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (event.button !== 0) return;
    const card = getAlchemyCard(cardId);
    if (!card) return;
    event.preventDefault();
    capturePointer(event.currentTarget, event.pointerId);
    const rect = event.currentTarget.getBoundingClientRect();
    const grabOffset = getScaledPointerOffset(event, rect);
    gatheringDragSequenceRef.current += 1;
    gatheringDropTargetRef.current = "none";
    setGatheringDropTarget("none");
    setDraggedGatheringCard({
      card,
      grabOffsetX: grabOffset.x,
      grabOffsetY: grabOffset.y,
      id: `gathering-reward:${card.id}:${gatheringDragSequenceRef.current}`,
      kind: "reward",
      pointerId: event.pointerId,
      source: { kind: "reward-cards" },
      startClientX: event.clientX,
      startClientY: event.clientY,
    });
    void sfx.play("card.slot.pickup");
  };

  const handleQuestOpenFromLog = (questId: string) => {
    handleQuestSelect(questId);
    setQuestPanelTab("current");
  };

  const setQuestClaimSwipeState = (questId: string, nextState: QuestClaimSwipeState) => {
    setQuestClaimSwipeStateByQuestId((previous) =>
      updateQuestClaimSwipeStateByQuestId(previous, questId, nextState),
    );
  };

  const announceRecipeDiscovery = (recipeId: string) => {
    if (infoPanelTab === "recipe") {
      setRecipeRevealIds([recipeId]);
      return;
    }

    setPendingRecipeNotificationIds((previous) => appendUniqueId(previous, recipeId));
  };

  const announceExtendedRecipeDiscovery = (recipeId: string) => {
    setInfoPanelTab("extended");
    setExtendedRecipeRevealIds([recipeId]);
    setPendingExtendedRecipeNotificationIds((previous) => removeId(previous, recipeId));
  };

  const handleRecipeRevealSeen = (recipeId: string) => {
    setRecipeRevealIds((previous) => removeId(previous, recipeId));
  };

  const handleExtendedRecipeRevealSeen = (recipeId: string) => {
    setExtendedRecipeRevealIds((previous) => removeId(previous, recipeId));
  };

  const announceQuestAvailability = (completedQuestIds: string[]) => {
    const nextAvailableQuestIds = getAlchemyQuestBoard(completedQuestIds).map((quest) => quest.id);
    if (nextAvailableQuestIds.length === 0 || questPanelTab === "log") return;

    setPendingQuestNotificationIds((previous) =>
      nextAvailableQuestIds.reduce(appendUniqueId, previous),
    );
  };

  const commitQuestClaim = (questId: string) => {
    const currentBoardState = boardStateRef.current;
    const quest = getRequiredAlchemyQuest(questId);
    const currentDelivery = getQuestDelivery(currentBoardState.questDeliveries, quest);
    if (
      currentBoardState.completedQuestIds.includes(quest.id) ||
      currentDelivery.delivered < currentDelivery.required
    ) {
      return;
    }

    questRewardFlyAnimationSequenceRef.current += 1;
    const flyAnimation = createQuestRewardFlyAnimation(
      quest.rewards,
      `quest-reward:${questRewardFlyAnimationSequenceRef.current}`,
    );
    if (flyAnimation.items.length > 0) setQuestRewardFlyAnimation(flyAnimation);

    const nextCompletedQuestIds = appendUniqueId(currentBoardState.completedQuestIds, quest.id);
    setBoardState((previous) => {
      if (previous.completedQuestIds.includes(quest.id)) {
        return previous;
      }

      return {
        ...previous,
        completedQuestIds: appendUniqueId(previous.completedQuestIds, quest.id),
        profile: applyQuestRewards(previous.profile, quest.rewards),
        questDeliveries: ensureQuestDelivery(previous.questDeliveries, quest),
      };
    });
    announceQuestAvailability(nextCompletedQuestIds);
  };

  const commitExtendedRecipeAward = (
    preview: AlchemyWorkbenchExtendedRecipePreview,
    currentBoardState: AlchemistGuildBoardState,
  ) => {
    const recipeId = preview.recipe.id;
    if (currentBoardState.discoveredExtendedRecipeIds.includes(recipeId)) return;

    const outputCard = getExtendedRecipeOutputBoardCard(preview.recipe);
    const fromRect = getCenteredCardRect(
      getElementRect("[data-output-recipe-card]") ??
        getElementRect('[data-board-section="transmutation-output-slot"]'),
      FLOATING_ELEMENT_CARD_WIDTH,
      FLOATING_ELEMENT_CARD_HEIGHT,
    );
    const toRect = getCenteredCardRect(
      getElementRect('[data-info-panel-tab="extended"]'),
      FLOATING_ELEMENT_CARD_WIDTH,
      FLOATING_ELEMENT_CARD_HEIGHT,
    );

    if (fromRect && toRect) {
      transmuteFlyAnimationSequenceRef.current += 1;
      setTransmuteFlyAnimation({
        card: outputCard,
        fromRect,
        id: `extended-award:${transmuteFlyAnimationSequenceRef.current}`,
        toRect,
      });
    }

    setBoardState((previous) => {
      if (previous.discoveredExtendedRecipeIds.includes(recipeId)) return previous;

      return {
        ...previous,
        discoveredExtendedRecipeIds: appendUniqueId(previous.discoveredExtendedRecipeIds, recipeId),
        reagentSlots: clearReagentSlots(),
      };
    });
    announceExtendedRecipeDiscovery(recipeId);
    void sfx.play("card.massDissolve");
  };

  const handleQuestClaimSwipePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || !canClaimSelectedQuest) return;
    event.preventDefault();

    const claimQuestId = selectedQuestId;
    const pointerId = event.pointerId;
    const trackElement = event.currentTarget.parentElement;
    if (!(trackElement instanceof HTMLElement)) return;

    const knobRect = event.currentTarget.getBoundingClientRect();
    const trackRect = trackElement.getBoundingClientRect();
    const grabOffsetX = event.clientX - knobRect.left;
    const travelDistance = Math.max(
      trackRect.width - QUEST_CLAIM_KNOB_WIDTH_PX - QUEST_CLAIM_TRACK_PADDING_PX * 2,
      1,
    );
    let latestProgress = 0;
    setQuestClaimSwipeState(claimQuestId, {
      dragging: true,
      progress: 0,
    });

    const syncProgress = (clientX: number) => {
      const knobLeft = clientX - grabOffsetX;
      latestProgress = clamp(
        (knobLeft - trackRect.left - QUEST_CLAIM_TRACK_PADDING_PX) / travelDistance,
        0,
        1,
      );
      setQuestClaimSwipeState(claimQuestId, {
        dragging: true,
        progress: latestProgress,
      });
    };
    const swipeMoveState: HorizontalSwipeMoveState = {
      pointerId,
      released: false,
      syncProgress,
    };
    const handlePointerMove = handleHorizontalSwipeMove.bind(null, swipeMoveState);

    function handlePointerRelease(pointerEvent: PointerEvent) {
      if (pointerEvent.pointerId !== pointerId || swipeMoveState.released) return;
      swipeMoveState.released = true;
      pointerEvent.preventDefault();
      syncProgress(pointerEvent.clientX);
      removePointerWindowListeners(handlePointerMove, handlePointerRelease);

      const committed = latestProgress >= QUEST_CLAIM_SWIPE_THRESHOLD;
      if (committed) {
        setQuestClaimSwipeState(claimQuestId, {
          dragging: false,
          progress: 1,
        });
        void sfx.play("transmute.complete");
        window.setTimeout(() => {
          commitQuestClaim(claimQuestId);
          setQuestClaimSwipeState(claimQuestId, EMPTY_QUEST_CLAIM_SWIPE_STATE);
        }, QUEST_CLAIM_COMMIT_HOLD_MS);
        return;
      }

      setQuestClaimSwipeState(claimQuestId, EMPTY_QUEST_CLAIM_SWIPE_STATE);
    }

    syncProgress(event.clientX);
    addPointerWindowListeners(handlePointerMove, handlePointerRelease);
  };

  const commitTransmutation = () => {
    if (!transmutationPreview) return;

    const currentBoardState = boardStateRef.current;
    const recipeId = transmutationPreview.recipe.id;
    const isExtendedRecipe = isExtendedRecipePreview(transmutationPreview);
    if (
      isExtendedRecipe &&
      currentBoardState.discoveredExtendedRecipeIds.includes(transmutationPreview.recipe.id)
    ) {
      return;
    }

    if (isExtendedRecipe) {
      commitExtendedRecipeAward(transmutationPreview, currentBoardState);
      return;
    }

    const outputCard = getRecipePreviewOutputBoardCard(transmutationPreview);
    const isNewRecipeDiscovery = !currentBoardState.discoveredRecipeIds.includes(recipeId);
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
        toInventorySlotId: destinationSlotId,
      });
    }

    const startedAtMs = Date.now();
    setBoardState((previous) => {
      const targetSlotId = getInventoryDestinationSlotId(previous, outputCard.id);
      if (!targetSlotId) return previous;

      return {
        ...previous,
        discoveredRecipeIds: appendUniqueId(previous.discoveredRecipeIds, recipeId),
        inventorySlots: addInventoryCooldown(
          previous.inventorySlots,
          targetSlotId,
          outputCard.id,
          startedAtMs,
        ),
        reagentSlots: clearReagentSlots(),
      };
    });
    if (isNewRecipeDiscovery) {
      if (isExtendedRecipe) announceExtendedRecipeDiscovery(recipeId);
      else announceRecipeDiscovery(recipeId);
    }
    void sfx.play("card.massDissolve");
  };

  const handleTransmutationSwipePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || !canTransmutePreview) return;
    event.preventDefault();

    const pointerId = event.pointerId;
    const trackElement = transmutePadTrackRef.current;
    const trackRect = trackElement?.getBoundingClientRect();
    if (!trackElement || !trackRect) return;

    const knobRect = event.currentTarget.getBoundingClientRect();
    const grabOffsetX = event.clientX - knobRect.left;
    const travelDistance = Math.max(getTransmuteKnobTravelPx(trackElement.clientWidth), 1);
    let latestProgress = 0;
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
    const swipeMoveState: HorizontalSwipeMoveState = {
      pointerId,
      released: false,
      syncProgress,
    };
    const handlePointerMove = handleHorizontalSwipeMove.bind(null, swipeMoveState);

    function handlePointerRelease(pointerEvent: PointerEvent) {
      if (pointerEvent.pointerId !== pointerId || swipeMoveState.released) return;
      swipeMoveState.released = true;
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
    (app) => {
      if (activeBoardMode === "expedition") {
        return setupExpeditionCanvasScene(app, {
          getInteractionRect: () =>
            periodicTableViewportRef.current?.getBoundingClientRect() ?? null,
        });
      }

      return setupPeriodicTableScene(app, {
        getInteractionRect: () => periodicTableViewportRef.current?.getBoundingClientRect() ?? null,
        onElementGrab: beginElementDrag,
      });
    },
    [activeBoardMode],
    { autoStart: false, backgroundAlpha: 0, preference: "canvas" },
  );

  useEffect(() => {
    if (isGatheringMode || isExpeditionMode) return;

    const trackElement = transmutePadTrackRef.current;
    if (!trackElement) return;

    const syncTrackWidth = () => {
      setTransmuteTrackWidth(trackElement.clientWidth);
    };
    syncTrackWidth();
    const resizeObserver = new ResizeObserver(syncTrackWidth);
    resizeObserver.observe(trackElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isExpeditionMode, isGatheringMode]);

  useBrowserLayoutEffect(() => {
    if (!isGatheringMode || prefersReducedMotion()) return;

    const animations: JSAnimation[] = [];
    const gamePanelElement = periodicTableViewportRef.current;
    const monsterPanelElement = rightPrimaryPanelRef.current;
    const infoPanelElement = gatheringInfoPanelRef.current;

    if (gamePanelElement) {
      gamePanelElement.style.transformOrigin = "top center";
      animations.push(
        animate(gamePanelElement, {
          duration: 460,
          ease: "out(3)",
          opacity: [0.82, 1],
          scaleY: [0.92, 1],
        }),
      );
    }

    if (monsterPanelElement) {
      animations.push(
        animate(monsterPanelElement, {
          duration: 380,
          ease: "out(3)",
          opacity: [0.88, 1],
          scale: [1.04, 1],
        }),
      );
    }

    if (infoPanelElement) {
      animations.push(
        animate(infoPanelElement, {
          delay: 130,
          duration: 340,
          ease: "out(3)",
          opacity: [0, 1],
          scale: [0.96, 1],
          y: [18, 0],
        }),
      );
    }

    return () => {
      for (const animation of animations) animation.cancel();
    };
  }, [isGatheringMode]);

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
    const activeRewardAnimation = questRewardFlyAnimation;
    if (!activeRewardAnimation) return;

    const reducedMotion = typeof window !== "undefined" && window.matchMedia(PRM).matches;
    if (reducedMotion) {
      setQuestRewardFlyAnimation(null);
      return;
    }

    const animations: JSAnimation[] = [];
    let completedCount = 0;
    for (const [index, item] of activeRewardAnimation.items.entries()) {
      const itemElement = document.querySelector(`[data-quest-reward-fly-item="${item.id}"]`);
      if (!(itemElement instanceof HTMLElement)) {
        completedCount += 1;
        continue;
      }

      const moveX =
        item.toRect.left + item.toRect.width / 2 - (item.fromRect.left + item.fromRect.width / 2);
      const moveY =
        item.toRect.top + item.toRect.height / 2 - (item.fromRect.top + item.fromRect.height / 2);
      const animation = animate(itemElement, {
        delay: index * QUEST_REWARD_FLY_STAGGER_MS,
        duration: QUEST_REWARD_FLY_DURATION_MS,
        ease: "inOut(3)",
        opacity: [1, 0.22],
        scale: [1, 0.52],
        x: moveX,
        y: moveY,
        onComplete: () => {
          completedCount += 1;
          pulseProfileRewardStat(item.kind, animations);
          if (completedCount >= activeRewardAnimation.items.length) {
            setQuestRewardFlyAnimation((current) =>
              current?.id === activeRewardAnimation.id ? null : current,
            );
          }
        },
      });
      animations.push(animation);
    }

    if (completedCount >= activeRewardAnimation.items.length) {
      setQuestRewardFlyAnimation(null);
    }

    return () => {
      for (const animation of animations) animation.cancel();
    };
  }, [questRewardFlyAnimation]);

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
        isCardCenterInsideQuestPanel(currentLeft, currentTop),
        boardStateRef.current,
      );

      if (isSameDropIntent(dropIntentRef.current, nextDropIntent)) return;
      dropIntentRef.current = nextDropIntent;
      setDropIntent(nextDropIntent);
    };

    const commitRelease = (dropSlotId: AlchemistGuildReagentSlotId | null) => {
      const source = activeDraggedCard.source;
      const currentBoardState = boardStateRef.current;
      const questDeliveryHit = isCardCenterInsideQuestPanel(currentLeft, currentTop);
      const queueInventoryReturnAnimation = (
        destinationSlotId: AlchemistGuildInventorySlotId,
        stackCount?: number,
      ) => {
        const toRect = getCenteredCardRect(
          getInventorySlotRect(destinationSlotId),
          FLOATING_ELEMENT_CARD_WIDTH,
          FLOATING_ELEMENT_CARD_HEIGHT,
        );
        if (!toRect) return;

        transmuteFlyAnimationSequenceRef.current += 1;
        const nextFlyAnimation: TransmuteFlyAnimation = {
          card: activeDraggedCard.card,
          fromRect: {
            height: FLOATING_ELEMENT_CARD_HEIGHT,
            left: currentLeft,
            top: currentTop,
            width: FLOATING_ELEMENT_CARD_WIDTH,
          },
          id: `inventory-return:${transmuteFlyAnimationSequenceRef.current}`,
          toRect,
          toInventorySlotId: destinationSlotId,
        };
        if (stackCount !== undefined) nextFlyAnimation.stackCount = stackCount;
        setTransmuteFlyAnimation(nextFlyAnimation);
      };
      const queueInventoryRemainderReturn = (consumedCount: number) => {
        if (source.kind !== "inventory") return;

        const returningCount = source.stackCount - consumedCount;
        if (returningCount < 1) return;

        queueInventoryReturnAnimation(source.slotId, returningCount);
      };

      if (!dropSlotId) {
        if (
          questDeliveryHit &&
          isQuestDeliveryAccepted(activeDraggedCard.card, currentBoardState)
        ) {
          const deliveredAtMs = Date.now();
          if (source.kind === "inventory") {
            queueInventoryRemainderReturn(1);
            setBoardState((previous) => ({
              ...previous,
              inventorySlots: consumeReadyInventoryCopies(
                previous.inventorySlots,
                source.slotId,
                1,
                deliveredAtMs,
              ),
              questDeliveries: addSelectedQuestDelivery(
                previous.questDeliveries,
                currentBoardState.selectedQuestId,
              ),
            }));
            void sfx.play("card.drop");
            return;
          }

          if (source.kind === "slot") {
            setBoardState((previous) => ({
              ...previous,
              questDeliveries: addSelectedQuestDelivery(
                previous.questDeliveries,
                currentBoardState.selectedQuestId,
              ),
              reagentSlots: { ...previous.reagentSlots, [source.slotId]: null },
            }));
            void sfx.play("card.drop");
            return;
          }
        }

        if (source.kind === "slot") {
          if (shouldReturnToInventory(activeDraggedCard.card)) {
            const destinationSlotId = getInventoryDestinationSlotId(
              currentBoardState,
              activeDraggedCard.card.id,
            );
            if (!destinationSlotId) {
              void sfx.play("card.drop");
              return;
            }

            const returnedAtMs = Date.now();
            const cooldownId = createInventoryCooldownId(
              activeDraggedCard.card.id,
              returnedAtMs,
              "return",
            );
            notifiedCooldownIdsRef.current?.add(cooldownId);
            queueInventoryReturnAnimation(destinationSlotId);
            setBoardState((previous) => ({
              ...previous,
              inventorySlots: addReadyInventoryCopy(
                previous.inventorySlots,
                destinationSlotId,
                activeDraggedCard.card.id,
                returnedAtMs,
                cooldownId,
              ),
              reagentSlots: { ...previous.reagentSlots, [source.slotId]: null },
            }));
            void sfx.play("card.drop");
            return;
          }

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
      if (!isActiveDragPointerEvent(event, pointerId, released)) return;
      event.preventDefault();
      latestSample = getPointerSample(event);
      queuePaint();
    }

    function handlePointerRelease(event: PointerEvent) {
      if (!isMatchingDragPointerEvent(event, pointerId)) return;
      event.preventDefault();
      latestSample = getPointerSample(event);
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

  useBrowserLayoutEffect(() => {
    const activeDraggedCard = draggedGatheringCard;
    if (!activeDraggedCard) return;

    const cardElement = draggedGatheringCardElementRef.current;
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
    let animationFrame = 0;
    let released = false;
    let releaseComplete = false;
    let releaseAnimation: JSAnimation | null = null;

    const clearDragState = () => {
      gatheringDropTargetRef.current = "none";
      setGatheringDropTarget("none");
      setDraggedGatheringCard(null);
    };

    const syncDropTarget = () => {
      const nextDropTarget = resolveGatheringDropTarget(
        activeDraggedCard,
        getGatheringDropTargetAtCardCenter(currentLeft, currentTop),
        boardStateRef.current.gathering,
      );

      if (gatheringDropTargetRef.current === nextDropTarget) return;
      gatheringDropTargetRef.current = nextDropTarget;
      setGatheringDropTarget(nextDropTarget);
    };

    const commitRelease = (target: GatheringDropTarget) => {
      if (activeDraggedCard.kind === "answer") {
        if (target === "answer-slot") {
          const currentValue = boardStateRef.current.gathering.equation.selectedValue;
          setBoardState((previous) => ({
            ...previous,
            gathering: selectGatheringAnswer(previous.gathering, activeDraggedCard.value),
          }));
          void sfx.play(
            currentValue !== null && currentValue !== activeDraggedCard.value
              ? "card.swap"
              : "card.drop",
          );
          return;
        }

        if (activeDraggedCard.source.kind === "answer-slot" && target === "cards-panel") {
          setBoardState((previous) => ({
            ...previous,
            gathering: clearGatheringAnswer(previous.gathering),
          }));
          void sfx.play("card.drop");
          return;
        }

        void sfx.play("card.drop");
        return;
      }

      if (activeDraggedCard.kind === "move") {
        if (target === "action-zone" || target === "monster-panel") {
          setBoardState((previous) => ({
            ...previous,
            gathering: selectGatheringMove(previous.gathering, activeDraggedCard.move.id),
          }));
          void sfx.play("card.drop");
          return;
        }

        void sfx.play("card.drop");
        return;
      }

      if (target === "log-panel") {
        setBoardState((previous) => ({
          ...previous,
          gathering: claimGatheringReward(previous.gathering, activeDraggedCard.card.id),
        }));
        void sfx.play("card.drop");
        return;
      }

      void sfx.play("card.drop");
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
      syncDropTarget();
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
      commitRelease(
        resolveGatheringDropTarget(
          activeDraggedCard,
          getGatheringDropTargetAtCardCenter(currentLeft, currentTop),
          boardStateRef.current.gathering,
        ),
      );

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
    syncDropTarget();

    addPointerWindowListeners(handlePointerMove, handlePointerRelease);

    return () => {
      removeDragListeners();
      if (animationFrame !== 0) cancelAnimationFrame(animationFrame);
      if (!releaseComplete) releaseAnimation?.cancel();
      if (!released) motion.revert();
    };
  }, [draggedGatheringCard]);

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
        data-board-name={getBoardCanvasName(isExpeditionMode)}
        className={`absolute inset-0 z-0 block size-full touch-none transition-opacity duration-300 motion-reduce:transition-none ${
          isGatheringMode ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        aria-label={getBoardCanvasAriaLabel(isGatheringMode, isExpeditionMode)}
      >
        Alchemist Guild Pixi canvas
      </canvas>
      <div className={getBoardChromeClass(isExpeditionMode)}>
        {isExpeditionMode ? null : (
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
                    isFlyDestination={
                      transmuteFlyAnimation?.toInventorySlotId === slot.id &&
                      transmuteFlyAnimation.card.id === item?.cardId
                    }
                    nowMs={nowMs}
                    onPointerDown={beginInventoryCardDrag}
                    slotId={slot.id}
                    slotName={slot.name}
                  />
                );
              })}
            </div>
          </section>
        )}

        <BoardModeTabs activeTab={activeBoardMode} onTabChange={handleBoardModeTabChange} />

        {isExpeditionMode ? (
          <ExpeditionCanvasPanel
            periodicTableViewportRef={periodicTableViewportRef}
            showBoardDebugBadges={showBoardDebugBadges}
          />
        ) : (
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
                  stats={createProfileStats(boardState.profile)}
                  onPlayerNameChange={(nextPlayerName) => {
                    setBoardState((previous) => ({
                      ...previous,
                      profile: { ...previous.profile, playerName: nextPlayerName },
                    }));
                  }}
                />
              </div>
              <LeftModePanel
                activeQuestIds={activeQuestIds}
                activeTab={questPanelTab}
                canClaim={canClaimSelectedQuest}
                claimedQuestIds={boardState.completedQuestIds}
                claimProgress={selectedQuestClaimSwipeState.progress}
                deliveryCard={selectedQuestUnlocked ? selectedQuestDeliveryCard : null}
                deliveryDropFeedback={getQuestDeliveryDropFeedback(dropIntent)}
                deliveryProgress={{
                  delivered: selectedQuestDelivery.delivered,
                  required: selectedQuestDelivery.required,
                }}
                developerNotesVisible={showBoardDebugBadges}
                gathering={boardState.gathering}
                gatheringDropTarget={gatheringDropTarget}
                hasQuestNotifications={pendingQuestNotificationIds.length > 0}
                isClaimDragging={selectedQuestClaimSwipeState.dragging}
                isGatheringMode={isGatheringMode}
                questLogScrollTop={boardState.questLogScrollTop}
                questPanelAccepted={questPanelAccepted}
                selectedQuestId={selectedQuestId}
                unlockedQuestIds={unlockedQuestIds}
                onClaimPointerDown={handleQuestClaimSwipePointerDown}
                onQuestLogScrollTopChange={handleQuestLogScrollTopChange}
                onQuestOpenFromLog={handleQuestOpenFromLog}
                onQuestSelect={handleQuestSelect}
                onTabChange={handleQuestPanelTabChange}
              />
            </aside>

            <CenterBoardPanels
              boardState={boardState}
              canTransmutePreview={canTransmutePreview}
              draggedCard={draggedCard}
              draggedGatheringCard={draggedGatheringCard}
              dropIntent={dropIntent}
              gatheringDropTarget={gatheringDropTarget}
              isOutputAlreadyMade={isOutputAlreadyMade}
              isGatheringMode={isGatheringMode}
              isTransmuteDragging={isTransmuteDragging}
              onGatheringAnswerPointerDown={beginGatheringAnswerDrag}
              onGatheringMovePointerDown={beginGatheringMoveDrag}
              onGatheringRewardPointerDown={beginGatheringRewardDrag}
              periodicTableViewportRef={periodicTableViewportRef}
              recipePreview={transmutationPreview}
              showBoardDebugBadges={showBoardDebugBadges}
              swapAnimation={swapAnimation}
              transmuteKnobTravelPx={transmuteKnobTravelPx}
              transmutePadTrackRef={transmutePadTrackRef}
              transmuteSwipeProgress={transmuteSwipeProgress}
              onSlottedCardPointerDown={beginSlottedCardDrag}
              onTransmutationSwipePointerDown={handleTransmutationSwipePointerDown}
            />

            <RightModePanels
              activeTab={infoPanelTab}
              discoveredExtendedRecipeIds={boardState.discoveredExtendedRecipeIds}
              discoveredRecipeIds={boardState.discoveredRecipeIds}
              gathering={boardState.gathering}
              gatheringDropTarget={gatheringDropTarget}
              gatheringInfoPanelRef={gatheringInfoPanelRef}
              hasExtendedRecipeNotifications={pendingExtendedRecipeNotificationIds.length > 0}
              hasRecipeNotifications={pendingRecipeNotificationIds.length > 0}
              isGatheringMode={isGatheringMode}
              preview={transmutationPreview}
              revealExtendedRecipeIds={extendedRecipeRevealIds}
              revealRecipeIds={recipeRevealIds}
              rightPrimaryPanelRef={rightPrimaryPanelRef}
              showBoardDebugBadges={showBoardDebugBadges}
              onExtendedRecipeRevealSeen={handleExtendedRecipeRevealSeen}
              onRecipeRevealSeen={handleRecipeRevealSeen}
              onTabChange={handleInfoPanelTabChange}
            />
          </section>
        )}
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
      {draggedGatheringCard ? (
        <div
          data-board-section="floating-gathering-card-layer"
          data-board-name="Floating gathering card layer"
          className="pointer-events-none fixed inset-0 z-50"
        >
          <div
            ref={draggedGatheringCardElementRef}
            data-board-section="floating-gathering-card"
            data-board-name="Floating gathering card"
            className={getGatheringFloatingCardClass(draggedGatheringCard.kind)}
            style={{
              contain: "layout style paint",
              fontFamily: "var(--font-sans)",
              height: `${FLOATING_ELEMENT_CARD_HEIGHT}px`,
              touchAction: "none",
              width: `${FLOATING_ELEMENT_CARD_WIDTH}px`,
            }}
          >
            <FloatingGatheringCard card={draggedGatheringCard} />
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
      {questRewardFlyAnimation ? (
        <div
          data-board-section="quest-reward-flight-layer"
          data-reward-flight-id={questRewardFlyAnimation.id}
          className="pointer-events-none fixed inset-0 z-[75]"
          aria-hidden="true"
        >
          {questRewardFlyAnimation.items.map((item) => {
            const RewardIcon = REWARD_ICONS[item.kind];
            return (
              <div
                key={item.id}
                data-quest-reward-fly-item={item.id}
                data-reward-kind={item.kind}
                className="absolute grid min-w-14 place-items-center gap-1 rounded-full border border-amber-700/35 bg-white/90 px-2 py-1 text-amber-950 shadow-[0_12px_24px_rgba(72,45,16,0.22)]"
                style={{
                  left: `${item.fromRect.left}px`,
                  top: `${item.fromRect.top}px`,
                }}
              >
                <RewardIcon className="size-4 stroke-[2.5]" aria-hidden="true" />
                <span className="text-xs font-black leading-none">{item.value}</span>
              </div>
            );
          })}
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

function getPointerSample(event: PointerEvent): PointerSample {
  return {
    clientX: event.clientX,
    clientY: event.clientY,
    time: performance.now(),
  };
}

function isActiveDragPointerEvent(
  event: PointerEvent,
  pointerId: number,
  released: boolean,
): boolean {
  return event.pointerId === pointerId && !released;
}

function isMatchingDragPointerEvent(event: PointerEvent, pointerId: number): boolean {
  return event.pointerId === pointerId;
}

function handleHorizontalSwipeMove(
  state: HorizontalSwipeMoveState,
  pointerEvent: PointerEvent,
): void {
  if (pointerEvent.pointerId !== state.pointerId || state.released) return;
  pointerEvent.preventDefault();
  state.syncProgress(pointerEvent.clientX);
}

function removePointerWindowListeners(
  onMove: (event: PointerEvent) => void,
  onRelease: (event: PointerEvent) => void,
): void {
  window.removeEventListener("pointermove", onMove, WINDOW_POINTER_LISTENER_CAPTURE);
  window.removeEventListener("pointerup", onRelease, WINDOW_POINTER_LISTENER_CAPTURE);
  window.removeEventListener("pointercancel", onRelease, WINDOW_POINTER_LISTENER_CAPTURE);
}

function createProfileStats(
  profile: AlchemistGuildProfile,
): (typeof FIRST_PROFILE_CARD_PROPS)["stats"] {
  return [
    { kind: "level", label: "Level", value: String(profile.level) },
    { kind: "gold", label: "Gold", value: String(profile.gold) },
    { kind: "knowledge", label: "Knowledge XP", value: String(profile.knowledgeXp) },
    {
      kind: "discovery",
      label: "Discovery Tokens",
      value: String(profile.discoveryTokens),
    },
    {
      kind: "muddlefog",
      label: "Muddlefog Cleared",
      value: `${profile.muddlefogCleared}%`,
    },
  ];
}

function applyQuestRewards(
  profile: AlchemistGuildProfile,
  rewards: AlchemyQuestRewards,
): AlchemistGuildProfile {
  return {
    ...profile,
    discoveryTokens: profile.discoveryTokens + rewards.discoveryTokens,
    gold: profile.gold + rewards.gold,
    knowledgeXp: profile.knowledgeXp + rewards.knowledgeXp,
    muddlefogCleared: Math.min(100, profile.muddlefogCleared + rewards.muddlefogCleared),
  };
}

function createQuestRewardFlyAnimation(
  rewards: AlchemyQuestRewards,
  id: string,
): QuestRewardFlyAnimation {
  const sourceRect = getElementRect('[data-board-section="quest-claim-swipe"]');
  if (!sourceRect) return { id, items: [] };

  const entries = [
    { kind: "gold", label: "Gold", value: String(rewards.gold) },
    { kind: "knowledge", label: "Knowledge XP", value: String(rewards.knowledgeXp) },
    { kind: "discovery", label: "Discovery Tokens", value: String(rewards.discoveryTokens) },
    { kind: "muddlefog", label: "Muddlefog Cleared", value: `${rewards.muddlefogCleared}%` },
  ] satisfies { kind: RewardKind; label: string; value: string }[];

  const items: QuestRewardFlyItem[] = [];
  for (const [index, entry] of entries.entries()) {
    const toRect = getElementRect(`[data-profile-stat="${REWARD_PROFILE_STAT_KIND[entry.kind]}"]`);
    if (!toRect) continue;
    const offsetX = (index - 1.5) * 12;
    const fromRect = {
      height: 44,
      left: sourceRect.left + sourceRect.width / 2 - 28 + offsetX,
      top: sourceRect.top + sourceRect.height / 2 - 22,
      width: 56,
    };
    items.push({
      fromRect,
      id: `${id}:${entry.kind}`,
      kind: entry.kind,
      label: entry.label,
      toRect,
      value: entry.value,
    });
  }

  return { id, items };
}

function pulseProfileRewardStat(kind: RewardKind, animations: JSAnimation[]): void {
  const statElement = document.querySelector(
    `[data-profile-stat="${REWARD_PROFILE_STAT_KIND[kind]}"]`,
  );
  if (!(statElement instanceof HTMLElement)) return;

  animations.push(
    animate(statElement, {
      duration: 260,
      ease: "out(2)",
      scale: [1, 1.08, 1],
    }),
  );
}

function getRequiredAlchemyQuest(questId: string): StaticAlchemyQuest {
  const quest = getAlchemyQuestById(questId);
  if (!quest) throw new Error(`Missing alchemy quest: ${questId}`);

  return quest;
}

function getQuestIndexById(questId: string): number {
  const questIndex = ALCHEMY_QUESTS.findIndex((quest) => quest.id === questId);
  return questIndex >= 0 ? questIndex : 0;
}

function getWrappedQuestIndex(index: number): number {
  return ((index % ALCHEMY_QUESTS.length) + ALCHEMY_QUESTS.length) % ALCHEMY_QUESTS.length;
}

function getQuestAtWrappedIndex(index: number): StaticAlchemyQuest {
  const quest = ALCHEMY_QUESTS[getWrappedQuestIndex(index)];
  if (!quest) throw new Error("Alchemy quest list cannot be empty");

  return quest;
}

function getQuestRequesterName(questId: string): string {
  const quest = getRequiredAlchemyQuest(questId);
  const requesterCharacter = getAlchemyCharactersByRequester(quest.narrative.requester)[0];
  return requesterCharacter?.name ?? formatTokenLabel(quest.narrative.requester);
}

function getQuestCurrentCenterX(slideWidth: number): number {
  return -QUEST_CURRENT_CENTER_SLIDE_INDEX * slideWidth;
}

function getQuestCurrentTargetX(direction: -1 | 1, slideWidth: number): number {
  return -(QUEST_CURRENT_CENTER_SLIDE_INDEX + direction) * slideWidth;
}

function getQuestCurrentSwipeDirection(deltaX: number): -1 | 0 | 1 {
  if (Math.abs(deltaX) < QUEST_CURRENT_SWIPE_MIN_PX) return 0;
  if (deltaX < 0) return 1;
  return -1;
}

function addQuestCurrentPointerListeners(
  onMove: (event: PointerEvent) => void,
  onRelease: (event: PointerEvent) => void,
  onCancel: (event: PointerEvent) => void,
): () => void {
  window.addEventListener("pointermove", onMove, WINDOW_POINTER_LISTENER_OPTIONS);
  window.addEventListener("pointerup", onRelease, WINDOW_POINTER_LISTENER_OPTIONS);
  window.addEventListener("pointercancel", onCancel, WINDOW_POINTER_LISTENER_OPTIONS);

  return () => {
    window.removeEventListener("pointermove", onMove, WINDOW_POINTER_LISTENER_CAPTURE);
    window.removeEventListener("pointerup", onRelease, WINDOW_POINTER_LISTENER_CAPTURE);
    window.removeEventListener("pointercancel", onCancel, WINDOW_POINTER_LISTENER_CAPTURE);
  };
}

function isInsideQuestBriefingCarousel(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest("[data-quest-briefing-carousel]") instanceof HTMLElement
  );
}

function snapQuestCurrentTrack(
  trackElement: HTMLElement | null,
  targetX: number,
  animationRef: MutableRefObject<JSAnimation | null> | null,
): void {
  if (!trackElement) return;

  animationRef?.current?.cancel();
  if (animationRef) animationRef.current = null;

  if (prefersReducedMotion()) {
    trackElement.style.transform = `translateX(${targetX}px)`;
    return;
  }

  const animation = animate(trackElement, {
    duration: QUEST_CURRENT_SNAP_DURATION_MS,
    ease: "out(3)",
    x: targetX,
    onComplete: () => {
      if (animationRef) animationRef.current = null;
    },
  });
  if (animationRef) animationRef.current = animation;
}

function getQuestLogStartIndex(scrollTop: number): number {
  return Math.max(0, Math.floor(scrollTop / QUEST_LOG_ROW_PITCH_PX) - QUEST_LOG_OVERSCAN_ROWS);
}

function getQuestLogEndIndex(startIndex: number, viewportHeight: number): number {
  const visibleCount =
    Math.ceil(viewportHeight / QUEST_LOG_ROW_PITCH_PX) + QUEST_LOG_OVERSCAN_ROWS * 2;
  return Math.min(
    ALCHEMY_QUESTS.length,
    startIndex + Math.max(visibleCount, QUEST_LOG_OVERSCAN_ROWS),
  );
}

function getQuestLogScrollTopForSelectedQuest(
  selectedQuestIndex: number,
  scrollTop: number,
  viewportHeight: number,
): number {
  const selectedTop = selectedQuestIndex * QUEST_LOG_ROW_PITCH_PX;
  const selectedBottom = selectedTop + QUEST_LOG_ROW_HEIGHT_PX;
  if (selectedTop >= scrollTop && selectedBottom <= scrollTop + viewportHeight) return scrollTop;

  return Math.max(0, selectedTop - QUEST_LOG_ROW_PITCH_PX);
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(PRM).matches;
}

function getQuestLogRowTitle(
  quest: StaticAlchemyQuest,
  revealed: boolean,
  isAvailable: boolean,
): string {
  if (revealed) return quest.narrative.title;
  if (isAvailable) return "New Quest";

  return "Redacted Quest";
}

function getQuestLogRowBadgeLabel(
  isClaimed: boolean,
  isActive: boolean,
  isUnlocked: boolean,
): string {
  if (isClaimed) return "Done";
  if (isActive) return "New";
  if (isUnlocked) return "Open";

  return "?";
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

function isHTMLElement(element: Element | null): element is HTMLElement {
  return element instanceof HTMLElement;
}

function observeRecipeReveal({
  delayMs,
  element,
  onSeen,
  scrollRoot,
}: {
  delayMs: number;
  element: HTMLElement;
  onSeen: () => void;
  scrollRoot: HTMLElement;
}): () => void {
  element.style.opacity = "0";
  element.style.transform = "translateX(-10px) scale(0.96)";

  const finish = () => {
    element.style.opacity = "";
    element.style.transform = "";
    onSeen();
  };

  if (
    typeof window === "undefined" ||
    window.matchMedia(PRM).matches ||
    !("IntersectionObserver" in window)
  ) {
    finish();
    return noop;
  }

  let animation: JSAnimation | null = null;
  let finished = false;
  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry?.isIntersecting || finished) return;

      observer.disconnect();
      animation = animate(element, {
        delay: delayMs,
        duration: 420,
        ease: "out(3)",
        opacity: [0, 1],
        scale: [0.96, 1],
        x: [-10, 0],
        onComplete: () => {
          finished = true;
          finish();
        },
      });
    },
    {
      root: scrollRoot,
      threshold: RECIPE_REVEAL_INTERSECTION_THRESHOLD,
    },
  );

  observer.observe(element);

  return () => {
    observer.disconnect();
    if (!finished) {
      animation?.cancel();
      element.style.opacity = "";
      element.style.transform = "";
    }
  };
}

const noop = (): void => undefined;
const inventoryClockSubscribers = new Set<() => void>();
let inventoryClockIntervalId: number | null = null;
let inventoryClockNowMs = Date.now();

function getScaledPointerOffset(
  event: ReactPointerEvent<HTMLElement>,
  rect: DOMRect,
): { x: number; y: number } {
  return {
    x: ((event.clientX - rect.left) / Math.max(rect.width, 1)) * FLOATING_ELEMENT_CARD_WIDTH,
    y: ((event.clientY - rect.top) / Math.max(rect.height, 1)) * FLOATING_ELEMENT_CARD_HEIGHT,
  };
}

function useInventoryClock(): number {
  return useSyncExternalStore(
    subscribeInventoryClock,
    getInventoryClockSnapshot,
    getInventoryClockSnapshot,
  );
}

function subscribeInventoryClock(onStoreChange: () => void): () => void {
  inventoryClockSubscribers.add(onStoreChange);
  if (inventoryClockIntervalId === null) {
    inventoryClockIntervalId = window.setInterval(() => {
      inventoryClockNowMs = Date.now();
      for (const subscriber of inventoryClockSubscribers) subscriber();
    }, INVENTORY_CLOCK_INTERVAL_MS);
  }

  return () => {
    inventoryClockSubscribers.delete(onStoreChange);
    if (inventoryClockSubscribers.size > 0 || inventoryClockIntervalId === null) return;

    window.clearInterval(inventoryClockIntervalId);
    inventoryClockIntervalId = null;
  };
}

function getInventoryClockSnapshot(): number {
  return inventoryClockNowMs;
}

function getAlchemyCardArtSrc(card: AlchemyBoardCard): string {
  if (!card.imagePath) return "";
  return resolvePublicAssetPath(card.imagePath);
}

function getAlchemyCard(cardId: string | null): AlchemyBoardCard | null {
  if (!cardId) return null;
  return alchemyCardsById.get(cardId) ?? null;
}

function isExtendedRecipePreview(
  preview: AlchemyWorkbenchAnyRecipePreview,
): preview is AlchemyWorkbenchExtendedRecipePreview {
  return "source" in preview.recipe;
}

function getRecipePreviewOutputName(preview: AlchemyWorkbenchAnyRecipePreview): string {
  return preview.recipe.output.name;
}

function getRecipePreviewKindLabel(preview: AlchemyWorkbenchAnyRecipePreview): string {
  return isExtendedRecipePreview(preview)
    ? "Molecule"
    : formatTokenLabel(preview.recipe.output.kind);
}

function getTransmutationPadPrompt(
  preview: AlchemyWorkbenchAnyRecipePreview | null,
  alreadyMade: boolean,
): string {
  if (alreadyMade) return "Already made";
  return preview ? "Swipe to transmute" : "Match a recipe first";
}

function getTransmutationPadAriaLabel(
  preview: AlchemyWorkbenchAnyRecipePreview | null,
  alreadyMade: boolean,
): string {
  if (alreadyMade) return "Extended recipe already made";
  return preview ? "Swipe to transmute output" : "Match a recipe before transmuting";
}

function isExtendedPreviewAlreadyDiscovered(
  preview: AlchemyWorkbenchAnyRecipePreview | null,
  discoveredExtendedRecipeIds: readonly string[],
): boolean {
  return (
    preview !== null &&
    isExtendedRecipePreview(preview) &&
    discoveredExtendedRecipeIds.includes(preview.recipe.id)
  );
}

function getRecipePreviewOutputBoardCard(
  preview: AlchemyWorkbenchAnyRecipePreview,
): AlchemyBoardCard {
  return isExtendedRecipePreview(preview)
    ? getExtendedRecipeOutputBoardCard(preview.recipe)
    : getRecipeOutputBoardCard(preview);
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

function getExtendedRecipeOutputBoardCard(recipe: StaticExtendedMoleculeRecipe): AlchemyBoardCard {
  const existingCard = getAlchemyCard(recipe.output.cardId);
  if (existingCard) return existingCard;

  return {
    detailLabel: `CID ${recipe.source.pubChemCid}`,
    familyColor: "#34d399",
    id: recipe.output.cardId,
    kind: "extended",
    kindLabel: "Molecule",
    name: recipe.output.name,
    symbol: recipe.output.formula,
  };
}

function formatExtendedRecipeLedgerFormula(recipe: StaticExtendedMoleculeRecipe): string {
  return recipe.ingredients
    .map((ingredient) =>
      ingredient.quantity === 1
        ? ingredient.elementSymbol
        : `${ingredient.quantity}${ingredient.elementSymbol}`,
    )
    .join(" + ");
}

function getGatheringGamePanelStatus(gathering: AlchemistGuildGatheringState): string {
  if (gathering.phase === "reward") return "Monster cleared. Pick one element card.";
  if (gathering.phase === "move") return "Answer locked. Pick a move card to spend the math.";
  if (gathering.lastAnswerCorrect === false) return "That card missed. Try another sum.";
  return "Choose the card that matches the addition equation.";
}

function getGatheringAnswerStateClass(lastAnswerCorrect: boolean | null): string {
  if (lastAnswerCorrect === false) return "border-rose-500 bg-rose-50 text-rose-950";
  if (lastAnswerCorrect === true) return "border-emerald-500 bg-emerald-50 text-emerald-950";
  return "border-neutral-800/55 bg-white/70 text-neutral-950";
}

function getGatheringInfoTitle(gathering: AlchemistGuildGatheringState): string {
  switch (gathering.phase) {
    case "move":
      return "Move Ready";
    case "reward":
      return "Reward Pull";
    default:
      return "Addition Check";
  }
}

function getGatheringInfoText(gathering: AlchemistGuildGatheringState): string {
  switch (gathering.phase) {
    case "move":
      return "The three move cards are the left addend, right addend, and full sum.";
    case "reward":
      return "Choose one of the three element cards. The pick is added to the gather log.";
    default:
      return `${gathering.equation.left} plus ${gathering.equation.right} sets up this turn.`;
  }
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

function getGatheringDropTargetAtCardCenter(
  cardLeft: number,
  cardTop: number,
): GatheringDropTarget {
  const clientX = cardLeft + FLOATING_ELEMENT_CARD_WIDTH / 2;
  const clientY = cardTop + FLOATING_ELEMENT_CARD_HEIGHT / 2;
  const elements = document.elementsFromPoint(clientX, clientY);

  for (const element of elements) {
    const targetElement = element.closest("[data-gathering-drop-target]");
    if (!(targetElement instanceof HTMLElement)) continue;
    const target = targetElement.dataset.gatheringDropTarget;
    if (isGatheringDropTarget(target)) return target;
  }

  return "none";
}

function resolveGatheringDropTarget(
  draggedCard: DraggedGatheringCard,
  target: GatheringDropTarget,
  gathering: AlchemistGuildGatheringState,
): GatheringDropTarget {
  if (draggedCard.kind === "answer") {
    if (target === "answer-slot" && gathering.phase === "solving") return target;
    if (draggedCard.source.kind === "answer-slot" && target === "cards-panel") return target;
    return "none";
  }

  if (draggedCard.kind === "move") {
    if (gathering.phase !== "move") return "none";
    return target === "action-zone" || target === "monster-panel" ? target : "none";
  }

  return gathering.phase === "reward" && target === "log-panel" ? target : "none";
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

function isCardCenterInsideQuestPanel(cardLeft: number, cardTop: number): boolean {
  const rect = getQuestDropTargetRect();
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

function getQuestDropTargetRect(): SlotRect | null {
  return (
    getElementRect('[data-board-section="left-briefing-panel"]') ??
    getElementRect('[data-board-section="quest-delivery-drop-zone"]')
  );
}

function isQuestDeliveryAccepted(
  card: AlchemyBoardCard,
  boardState: AlchemistGuildBoardState,
): boolean {
  const quest = getRequiredAlchemyQuest(boardState.selectedQuestId);
  if (!isQuestUnlocked(quest.id, boardState.completedQuestIds)) return false;
  if (boardState.completedQuestIds.includes(quest.id)) return false;

  const delivery = getQuestDelivery(boardState.questDeliveries, quest);

  return delivery.delivered < delivery.required && card.id === delivery.cardId;
}

function addSelectedQuestDelivery(
  questDeliveries: AlchemistGuildQuestDeliveries,
  questId: string,
): AlchemistGuildQuestDeliveries {
  const quest = getRequiredAlchemyQuest(questId);
  const delivery = getQuestDelivery(questDeliveries, quest);

  return {
    ...questDeliveries,
    [quest.id]: {
      ...delivery,
      delivered: Math.min(delivery.required, delivery.delivered + 1),
    },
  };
}

function ensureQuestDelivery(
  questDeliveries: AlchemistGuildQuestDeliveries,
  quest: StaticAlchemyQuest,
): AlchemistGuildQuestDeliveries {
  if (questDeliveries[quest.id]) return questDeliveries;

  return { ...questDeliveries, [quest.id]: createQuestDelivery(quest) };
}

function getQuestDelivery(
  questDeliveries: AlchemistGuildQuestDeliveries,
  quest: StaticAlchemyQuest,
): AlchemistGuildQuestDelivery {
  return questDeliveries[quest.id] ?? createQuestDelivery(quest);
}

function createQuestDelivery(quest: StaticAlchemyQuest): AlchemistGuildQuestDelivery {
  return {
    cardId: getQuestDeliveryCardId(quest),
    delivered: 0,
    required: 1,
  };
}

function getQuestDeliveryCardId(quest: StaticAlchemyQuest): string {
  const recipeId = quest.recipeIds[0];
  if (!recipeId) throw new Error(`Quest ${quest.id} does not define a delivery recipe`);

  const recipe = getAlchemyRecipeById(recipeId);
  if (!recipe) throw new Error(`Missing alchemy recipe: ${recipeId}`);

  return recipe.output.cardId;
}

function getQuestClaimSwipeState(
  stateByQuestId: QuestClaimSwipeStateByQuestId,
  questId: string,
): QuestClaimSwipeState {
  return stateByQuestId[questId] ?? EMPTY_QUEST_CLAIM_SWIPE_STATE;
}

function updateQuestClaimSwipeStateByQuestId(
  stateByQuestId: QuestClaimSwipeStateByQuestId,
  questId: string,
  nextState: QuestClaimSwipeState,
): QuestClaimSwipeStateByQuestId {
  const previousState = getQuestClaimSwipeState(stateByQuestId, questId);
  if (
    previousState.dragging === nextState.dragging &&
    previousState.progress === nextState.progress
  ) {
    return stateByQuestId;
  }

  if (!nextState.dragging && nextState.progress === 0) {
    const nextStateByQuestId = { ...stateByQuestId };
    delete nextStateByQuestId[questId];
    return nextStateByQuestId;
  }

  return { ...stateByQuestId, [questId]: nextState };
}

function isQuestUnlocked(questId: string, completedQuestIds: readonly string[]): boolean {
  if (completedQuestIds.includes(questId)) return true;
  return getAvailableAlchemyQuests(completedQuestIds).some((quest) => quest.id === questId);
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

function addReadyInventoryCopy(
  inventory: AlchemistGuildInventorySlots,
  slotId: AlchemistGuildInventorySlotId,
  cardId: string,
  readyAtMs: number,
  cooldownId: string,
): AlchemistGuildInventorySlots {
  const existingItem = inventory[slotId];
  const readyCopy: AlchemistGuildInventoryCooldown = {
    id: cooldownId,
    readyAtMs,
    startedAtMs: readyAtMs,
  };

  return {
    ...inventory,
    [slotId]: {
      cardId,
      cooldowns: [...(existingItem?.cooldowns ?? []), readyCopy],
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

function getTransmuteKnobTravelPx(trackWidthPx: number): number {
  return Math.max(0, trackWidthPx - TRANSMUTE_KNOB_WIDTH_PX - TRANSMUTE_TRACK_PADDING_PX * 2);
}

function getOutputCooldownMs(cardId: string): number {
  for (const [prefix, cooldownMs] of OUTPUT_COOLDOWN_PREFIXES) {
    if (cardId.startsWith(prefix)) return cooldownMs;
  }

  return 0;
}

function createInventoryCooldownId(cardId: string, timestampMs: number, source: string): string {
  return `${cardId}:${source}:${timestampMs}`;
}

function shouldReturnToInventory(card: AlchemyBoardCard): boolean {
  return card.kind === "crafted";
}

function appendUniqueId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids : [...ids, id];
}

function removeId(ids: string[], id: string): string[] {
  if (!ids.includes(id)) return ids;

  return ids.filter((existingId) => existingId !== id);
}

function isGatheringDropTarget(value: string | undefined): value is GatheringDropTarget {
  return (
    value === "none" ||
    value === "answer-slot" ||
    value === "cards-panel" ||
    value === "action-zone" ||
    value === "monster-panel" ||
    value === "log-panel"
  );
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
  isQuestDeliveryHit: boolean,
  boardState: AlchemistGuildBoardState,
): DropIntent {
  if (draggedCard.source.kind === "inventory") {
    if (!slotId) {
      return isQuestDeliveryHit
        ? { accepted: isQuestDeliveryAccepted(draggedCard.card, boardState), kind: "quest" }
        : EMPTY_DROP_INTENT;
    }

    return boardState.reagentSlots[slotId] ? { kind: "blocked", slotId } : { kind: "drop", slotId };
  }

  if (!slotId && isQuestDeliveryHit) {
    return { accepted: isQuestDeliveryAccepted(draggedCard.card, boardState), kind: "quest" };
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
  if (left.kind === "quest" && right.kind === "quest") return left.accepted === right.accepted;

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
  if (intent.kind !== "quest") return intent.kind;

  return getQuestDropFeedback(intent);
}

function getQuestDeliveryDropFeedback(intent: DropIntent): DropFeedback {
  if (intent.kind !== "quest") return "none";

  return getQuestDropFeedback(intent);
}

function isQuestPanelAcceptedDrop(intent: DropIntent): boolean {
  return intent.kind === "quest" && intent.accepted;
}

function getQuestDropFeedback(intent: Extract<DropIntent, { kind: "quest" }>): DropFeedback {
  return intent.accepted ? "drop" : "blocked";
}

function clearQuestDeliveryMotionStyles(
  shellElement: HTMLElement | null,
  claimElement: HTMLElement | null,
): void {
  shellElement?.style.removeProperty("rotate");
  shellElement?.style.removeProperty("scale");
  shellElement?.style.removeProperty("transform");
  shellElement?.style.removeProperty("translate");
  claimElement?.style.removeProperty("opacity");
  claimElement?.style.removeProperty("rotate");
  claimElement?.style.removeProperty("scale");
  claimElement?.style.removeProperty("transform");
  claimElement?.style.removeProperty("translate");
}

function getQuestDeliveryStatusText(
  isComplete: boolean,
  claimed: boolean,
  cardName: string,
): string {
  if (claimed) return "Claimed";
  if (isComplete) return QUEST_DELIVERY_COMPLETE_LABEL;
  return `Deliver ${cardName} when it is ready.`;
}

function getQuestDeliverySlotClass(
  feedback: DropFeedback,
  isComplete: boolean,
  claimed: boolean,
): string {
  const base =
    "relative rounded-[6px] border-2 border-dashed p-3 shadow-[0_2px_0_rgba(72,45,16,0.12)] backdrop-blur-sm transition-[background-color,border-color,box-shadow] duration-100";

  if (claimed) {
    return `${base} border-emerald-700/70 bg-emerald-50/90 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]`;
  }

  if (isComplete) {
    return `${base} border-emerald-600/70 bg-emerald-50/85 shadow-[0_0_0_4px_rgba(16,185,129,0.16)]`;
  }

  switch (feedback) {
    case "drop":
      return `${base} border-emerald-500 bg-emerald-50/85 shadow-[0_0_0_4px_rgba(16,185,129,0.22)]`;
    case "blocked":
      return `${base} border-rose-500 bg-rose-50/85 shadow-[0_0_0_4px_rgba(244,63,94,0.18)]`;
    default:
      return `${base} border-amber-700/45 bg-white/65`;
  }
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

function getGatheringFloatingCardClass(kind: DraggedGatheringCard["kind"]): string {
  const base =
    "absolute left-0 top-0 select-none overflow-hidden rounded-[3px] border-2 shadow-[0_14px_28px_rgba(0,0,0,0.26)] transition-[border-color,box-shadow] duration-100";

  if (kind === "answer") return `${base} border-[#888888] bg-white`;
  if (kind === "move") return `${base} border-[#888888] bg-[#eeeeee]`;
  return `${base} border-[#888888] bg-[#eeeeee]`;
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
