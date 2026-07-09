import {
  ALCHEMY_CRAFTED_CARDS,
  ALCHEMY_GATHERABLE_CARDS,
  ALCHEMY_QUESTS,
  ALCHEMY_RECIPES,
  type AlchemistGuildBoardMode,
  AlchemistGuildBoardModeSchema,
  type AlchemistGuildBoardSlots,
  type AlchemistGuildBoardState,
  type AlchemistGuildElementQuantities,
  type AlchemistGuildEmergentRecipe,
  type AlchemistGuildEmergentRecipeRarity,
  type AlchemistGuildExpeditionState,
  type AlchemistGuildGatheringBossState,
  type AlchemistGuildGatheringLogEntry,
  type AlchemistGuildGatheringState,
  type AlchemistGuildGatheringStreak,
  type AlchemistGuildGatheringTrackKind,
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
  getAlchemyRecipeByOutput,
  getAlchemyRecipeKidInfoById,
  getAlchemyRecipeKidInfoSourceById,
  getAvailableAlchemyQuests,
  getExtendedMoleculeKidInfoById,
  getQuestRequesterVoiceClipPath,
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CloudFog,
  Coins,
  Compass,
  FlaskConical,
  Gem,
  LockKeyhole,
  type LucideIcon,
  PackageOpen,
  Pickaxe,
  ScrollText,
  Sparkles,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { type Application, Graphics } from "pixi.js";
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
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import * as z from "zod";

import { usePixiApp } from "~/canvas/use-pixi-app";
import { notifyGameEvent } from "~/components/notification-toast/game-events";
import { NotificationToastHost } from "~/components/notification-toast/notification-toast-host";
import { defineComponent } from "~/lib/define-component";
import { useAnime } from "~/motion/use-anime";
import { sfx } from "~/sound/sfx";
import { getGatheringAttackChargeProfile } from "~/sound/sound-service";
import { alchemistGuildBoardAtom } from "~/state/atoms";
import {
  getVisibleBoardModeTabs,
  isGatheringAvailable,
  resolveVisibleBoardMode,
  shouldShowGatheringNudge,
} from "./board-mode-tabs";
import { getSwipeVelocityX, pushSwipeSample, type SwipePointerSample } from "./carousel-swipe";
import {
  type AlchemyWorkbenchEmergentPreview,
  createEmergentTransmutationResult,
  type EmergentTransmutationResult,
  formatEmergentRecipeIngredients,
  getAlchemyWorkbenchEmergentPreview,
  recordEmergentDiscovery,
} from "./emergent-recipes";
import { setupExpeditionCanvasScene } from "./expedition-canvas-scene";
import {
  advanceExpeditionQueue,
  canQueueExpedition,
  removeQueuedExpedition,
  startOrEnqueueExpedition,
} from "./expedition-queue";
import { getExpeditionTabCountdownLabel } from "./expedition-tab-countdown";
import {
  formatGatheringDamageFloaterLabel,
  type GatheringDamageFloaterTier,
  GatheringDamageFloaterTierSchema,
  resolveGatheringDamageFloaterTier,
} from "./gathering-damage-floater";
import { type GatheringElementType, gatheringCounterElementFor } from "./gathering-elements";
import { getGatheringEnemyModelPath } from "./gathering-enemy-models";
import {
  answerGatheringBossChallenge,
  answerGatheringBossPhonics,
  claimGatheringBossReward,
  clearGatheringAnswer,
  confirmGatheringAnswer,
  confirmGatheringPhonicsAnswer,
  createGatheringLevelMasteryReport,
  dismissGatheringBossFailure,
  GATHERING_BOSS_ALLOWED_MISSES,
  GATHERING_BOSS_PROBLEM_DURATION_MS,
  GATHERING_BOSS_REQUIRED_STREAK,
  type GatheringLevelMasteryReport,
  type GatheringMove,
  type GatheringMoveId,
  getGatheringBossRewardQuantity,
  getGatheringMoveLadder,
  getGatheringNextMoveUnlock,
  getGatheringPathMap,
  getGatheringPhonicsMoves,
  isGatheringBossReady,
  recordGatheringMasteryProgress,
  resetGatheringEquationAfterWrongStreak,
  resolveGatheringMoveDamage,
  selectGatheringAnswer,
  selectGatheringMove,
  selectGatheringPhonicsChoice,
  selectGatheringTrack,
  startGatheringBossFight,
  swapGatheringAnswerWithChoice,
  swapGatheringChoices,
} from "./gathering-loop";

import { GatheringPathMap } from "./gathering-path-map";
import {
  GatheringPhonicsBossAnswerPanel,
  GatheringPhonicsBossPanel,
  GatheringPhonicsCardsPanel,
  GatheringPhonicsPromptPanel,
} from "./gathering-phonics-panels";
import { claimGatheringRewardForBoard } from "./gathering-reward-claim";
import {
  gatheringStreakIncrementDetuneCents,
  isGatheringStreakRecord,
  resolveGatheringStreakSoundEvent,
  streakBonusForOptionIndex,
  streakChestImage,
  streakRarity,
} from "./gathering-streak";
import { GatheringStreakMeter } from "./gathering-streak-meter";
import { getGatheringOperandLabels } from "./gathering-track-display";
import { GlbMonsterViewer } from "./glb-monster-viewer";
import {
  ALCHEMIST_GUILD_INTRO_FOCUS_ELEMENT_ID,
  ALCHEMIST_GUILD_INTRO_FOCUS_SCALE,
  type AlchemistGuildIntroPhase,
  isAlchemyIntroZeroState,
} from "./intro-choreography";
import { OrbitForgeOverlay } from "./orbit-forge-overlay";
import type { ForgeRoundResult } from "./orbit-forge-scoring";
import {
  FLOATING_ELEMENT_CARD_HEIGHT,
  FLOATING_ELEMENT_CARD_WIDTH,
  type PeriodicTableElementGrab,
  setupPeriodicTableScene,
} from "./periodic-table-scene";
import { FIRST_PROFILE_CARD_PROPS } from "./profile-card";
import {
  createQuestAssemblyGuide,
  formatQuestAssemblyIngredientStatus,
  type QuestAssemblyGuide,
  type QuestAssemblyIngredient,
} from "./quest-assembly-guide";
import {
  getQuestAutoVoiceClipPath,
  markQuestVoiceAutoPlayed,
  QUEST_AUTO_VOICE_DEBOUNCE_MS,
} from "./quest-auto-voice";
import { createQuestBriefingCardProps, QuestBriefingCard } from "./quest-briefing-card";
import {
  getQuestCurrentSwipeDirection,
  getQuestCurrentSwipeIntent,
} from "./quest-current-carousel-gesture";
import {
  canDeliverCardToQuest,
  deliverCardToQuest,
  getQuestDeliverables,
  getQuestDeliveredCount,
  isQuestDeliveryComplete,
} from "./quest-deliverables";
import {
  type AlchemyWorkbenchExtendedRecipePreview,
  type AlchemyWorkbenchRecipePreview,
  formatAlchemyRecipeFormula,
  getAlchemyWorkbenchExtendedRecipePreview,
  getAlchemyWorkbenchRecipePreview,
} from "./recipe-preview";
import { AlchemistGuildBoardPropsSchema } from "./schema";
import {
  applyMerchantGoldBonus,
  EXPEDITION_QUEUE_UPGRADE_ID,
  getUpgradeProgress,
  hasUpgrade,
  isNewRewardSlotConfirmable,
  isUpgradesTabAvailable,
  MERCHANT_GOLD_UPGRADE_ID,
  NEW_REWARD_SLOT_UPGRADE_ID,
  UPGRADE_CATALOG,
  type UpgradeCatalogEntry,
} from "./upgrades";
import { useUpgradeUnlocks } from "./use-upgrade-unlocks";

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
const GATHERING_CONFIRM_SWIPE_THRESHOLD = TRANSMUTE_SWIPE_THRESHOLD;
const GATHERING_CONFIRM_COMMIT_HOLD_MS = TRANSMUTE_COMMIT_HOLD_MS;
const GATHERING_MONSTER_DEATH_DURATION_MS = 1080;
const GATHERING_MONSTER_DEATH_PARTICLE_COUNT = 84;
const GATHERING_REWARD_CARD_FLY_DURATION_MS = 560;
const GATHERING_REWARD_CARD_FLY_STAGGER_MS = 110;
const GATHERING_SESSION_DEPOSIT_DURATION_MS = 620;
const GATHERING_SESSION_DEPOSIT_STAGGER_MS = 58;
const GATHERING_WRONG_RESET_DURATION_MS = 680;
const GATHERING_WRONG_RESET_STAGGER_MS = 46;
const EXPEDITION_UNLOCK_RECIPE_ID = "alchemy:glass";
const EXPEDITION_DURATION_MS = 3 * 60 * 1000;
const EXTENDED_LEDGER_FILTER_SLOT_COUNT = 5;
const INVENTORY_SELL_COIN_FLY_DURATION_MS = 620;
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
const QUEST_CURRENT_SNAP_DURATION_MS = 240;
const QUEST_CURRENT_SLIDE_OFFSETS = [-1, 0, 1] as const;
const QUEST_CURRENT_CENTER_SLIDE_INDEX = 1;
const QUEST_LOG_ROW_HEIGHT_PX = 80;
const QUEST_LOG_ROW_GAP_PX = 10;
const QUEST_LOG_ROW_PITCH_PX = QUEST_LOG_ROW_HEIGHT_PX + QUEST_LOG_ROW_GAP_PX;
const QUEST_LOG_OVERSCAN_ROWS = 4;
const EMPTY_DROP_INTENT: DropIntent = { kind: "none" };
const EMPTY_QUEST_CLAIM_SWIPE_STATE = {
  dragging: false,
  progress: 0,
} satisfies QuestClaimSwipeState;
const EMPTY_GATHERING_MONSTER_DEATH_UI_STATE = {
  animation: null,
  completedRound: null,
} satisfies GatheringMonsterDeathUiState;
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
  backgroundColor: "#f4f6f4",
  backgroundImage:
    "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(235,241,239,0.58) 54%, rgba(224,242,254,0.38)), radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.18) 1px, transparent 0)",
  backgroundSize: "100% 100%, 12px 12px",
} satisfies CSSProperties;
const GLASS_PANEL_CLASS =
  "pointer-events-auto relative min-h-0 min-w-0 rounded-[12px] border border-[#6b4a2b]/18 bg-[linear-gradient(135deg,rgba(255,255,255,0.74),rgba(255,255,255,0.46)_48%,rgba(224,242,254,0.22))] shadow-[inset_0_1px_0_rgba(255,255,255,0.86),inset_0_0_0_1px_rgba(255,255,255,0.38),0_1px_0_rgba(107,74,43,0.14),0_18px_36px_rgba(15,23,42,0.14)] backdrop-blur-xl backdrop-saturate-150";
const GLASS_CONTROL_CLASS =
  "pointer-events-auto rounded-[10px] border border-[#6b4a2b]/18 bg-white/68 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_8px_18px_rgba(15,23,42,0.1)] backdrop-blur-md backdrop-saturate-150";
const HIDDEN_SCROLL_CLASS =
  "overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const CLEAR_TABLE_WINDOW_CLASS =
  "pointer-events-none relative min-h-0 min-w-0 overflow-hidden rounded-[12px] border border-[#6b4a2b]/16 bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0.08)_50%,rgba(14,165,233,0.06))] shadow-[inset_0_1px_0_rgba(255,255,255,0.56),inset_0_0_0_1px_rgba(255,255,255,0.22),0_12px_28px_rgba(15,23,42,0.1)] backdrop-blur-sm backdrop-saturate-150";
const PERIODIC_TABLE_WINDOW_CLASS =
  "pointer-events-none relative min-h-0 min-w-0 overflow-hidden rounded-[12px] border border-[#6b4a2b]/16 bg-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.48),inset_0_0_0_1px_rgba(255,255,255,0.18),0_12px_28px_rgba(15,23,42,0.08)]";
const GATHERING_PANEL_LABEL_CLASS =
  "pointer-events-none absolute left-3 top-3 z-20 rounded-full border border-[#6b4a2b]/18 bg-white/62 px-2 py-1 text-[10px] font-black uppercase leading-none tracking-normal text-[#3c2819] shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_5px_12px_rgba(15,23,42,0.08)] backdrop-blur-md";
const GATHERING_PANEL_TRANSITION_CLASS =
  "transition-[grid-template-rows,opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";
const BOARD_MAIN_GRID_TRANSITION_CLASS =
  "transition-[grid-template-columns] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";
const GATHERING_EQUATION_CARD_CLASS =
  "relative grid h-[148px] w-[105px] place-items-center rounded-[6px] border-2 bg-white/75 text-neutral-950 shadow-[0_8px_18px_rgba(15,23,42,0.12)]";
const BOARD_DESCRIPTIONS = {
  alchemyWorkbench:
    "The five-slot Alchemy Workbench where elemental cards combine into compounds, materials, and quest items.",
  alchemyWorkbenchInfo:
    "Explains the recipe or output currently previewed by the Alchemy Workbench output slot.",
  inventory: "Stores crafted cards, gathered materials, and quest outputs in the top board strip.",
  boardModeTabs: "Switches between the currently unlocked board modes.",
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

type GatheringMoveVisual = {
  arcColor: number;
  arcGlowAlpha: number;
  auraClass: string;
  cardClass: string;
  detailClass: string;
  frameFill: string;
  frameStroke: string;
  gemFill: string;
  gemStroke: string;
  iconPath: string;
  nameClass: string;
};

type GatheringAttackArcOverlayOptions = {
  cardRef: RefObject<HTMLDivElement | null>;
  moveRef: MutableRefObject<GatheringMove | null>;
  reducedMotion: boolean;
  targetRef: RefObject<HTMLDivElement | null>;
};

type GatheringMonsterDeathAnimation = {
  id: string;
  round: number;
};

type GatheringMonsterDeathUiState = {
  animation: GatheringMonsterDeathAnimation | null;
  completedRound: number | null;
};

type GatheringMonsterDeathParticle = {
  color: number;
  delay: number;
  driftX: number;
  driftY: number;
  originX: number;
  originY: number;
  size: number;
  spin: number;
};

type GatheringMonsterDeathCanvasOptions = {
  accentColor: number;
  animationId: string;
  particles: readonly GatheringMonsterDeathParticle[];
  reducedMotion: boolean;
};

type GatheringMonsterDeathCompleteHandler = (animationId: string, round: number) => void;
type FloatingGatheringCardStyle = CSSProperties & {
  "--gathering-charge-duration-ms"?: string;
};
type GatheringMasteryFrameStyle = CSSProperties & {
  "--gathering-mastery-angle"?: string;
  "--gathering-mastery-previous-angle"?: string;
};
type GatheringMasteryFeedback = "ready" | "regressing" | "steady";

const gatheringMoveVisuals = {
  "left-spark": {
    arcColor: 0xf59e0b,
    arcGlowAlpha: 0.42,
    auraClass: "bg-[radial-gradient(circle_at_28%_18%,rgba(251,191,36,0.22),transparent_48%)]",
    cardClass:
      "border-amber-500 bg-amber-50 hover:border-amber-500 hover:shadow-[inset_0_0_0_3px_rgba(245,158,11,0.2),0_8px_18px_rgba(0,0,0,0.18)]",
    detailClass: "bg-amber-50/90 text-amber-950",
    frameFill: "#f6d28a",
    frameStroke: "#92400e",
    gemFill: "#f59e0b",
    gemStroke: "#78350f",
    iconPath: "gathering-attack-icons/left-spark.png",
    nameClass: "text-amber-950",
  },
  "right-spark": {
    arcColor: 0x06b6d4,
    arcGlowAlpha: 0.42,
    auraClass: "bg-[radial-gradient(circle_at_72%_18%,rgba(103,232,249,0.22),transparent_48%)]",
    cardClass:
      "border-cyan-500 bg-cyan-50 hover:border-cyan-500 hover:shadow-[inset_0_0_0_3px_rgba(6,182,212,0.2),0_8px_18px_rgba(0,0,0,0.18)]",
    detailClass: "bg-cyan-50/90 text-cyan-950",
    frameFill: "#a5f3fc",
    frameStroke: "#155e75",
    gemFill: "#06b6d4",
    gemStroke: "#164e63",
    iconPath: "gathering-attack-icons/right-spark.png",
    nameClass: "text-cyan-950",
  },
  "sum-strike": {
    arcColor: 0xa855f7,
    arcGlowAlpha: 0.44,
    auraClass: "bg-[radial-gradient(circle_at_50%_16%,rgba(216,180,254,0.25),transparent_50%)]",
    cardClass:
      "border-fuchsia-500 bg-fuchsia-50 hover:border-fuchsia-500 hover:shadow-[inset_0_0_0_3px_rgba(168,85,247,0.2),0_8px_18px_rgba(0,0,0,0.18)]",
    detailClass: "bg-fuchsia-50/90 text-fuchsia-950",
    frameFill: "#e9d5ff",
    frameStroke: "#6b21a8",
    gemFill: "#a855f7",
    gemStroke: "#581c87",
    iconPath: "gathering-attack-icons/sum-strike.png",
    nameClass: "text-fuchsia-950",
  },
  "ember-burst": {
    arcColor: 0xf97316,
    arcGlowAlpha: 0.46,
    auraClass: "bg-[radial-gradient(circle_at_50%_18%,rgba(251,146,60,0.26),transparent_52%)]",
    cardClass:
      "border-orange-500 bg-orange-50 hover:border-orange-500 hover:shadow-[inset_0_0_0_3px_rgba(249,115,22,0.2),0_8px_18px_rgba(0,0,0,0.18)]",
    detailClass: "border-orange-200 bg-orange-50/90 text-orange-950",
    frameFill: "#fed7aa",
    frameStroke: "#9a3412",
    gemFill: "#f97316",
    gemStroke: "#7c2d12",
    iconPath: "gathering-attack-icons/ember-burst.png",
    nameClass: "text-orange-950",
  },
  "stone-crash": {
    arcColor: 0x78716c,
    arcGlowAlpha: 0.4,
    auraClass: "bg-[radial-gradient(circle_at_50%_18%,rgba(168,162,158,0.3),transparent_54%)]",
    cardClass:
      "border-stone-500 bg-stone-50 hover:border-stone-500 hover:shadow-[inset_0_0_0_3px_rgba(120,113,108,0.22),0_8px_18px_rgba(0,0,0,0.18)]",
    detailClass: "border-stone-200 bg-stone-50/90 text-stone-950",
    frameFill: "#d6d3d1",
    frameStroke: "#57534e",
    gemFill: "#78716c",
    gemStroke: "#44403c",
    iconPath: "gathering-attack-icons/stone-crash.png",
    nameClass: "text-stone-950",
  },
} satisfies Record<GatheringMoveId, GatheringMoveVisual>;

// Per-element presentation shared by enemy badges and attack cards.
type GatheringElementUi = {
  frameFill: string;
  frameStroke: string;
  gemFill: string;
  gemStroke: string;
  auraClass: string;
  glyph: string;
  label: string;
};
const gatheringElementUi = {
  lightning: {
    frameFill: "#f7d794",
    frameStroke: "#92400e",
    gemFill: "#f59e0b",
    gemStroke: "#78350f",
    auraClass: "from-amber-300/40 via-orange-300/16 to-neutral-950",
    glyph: "⚡",
    label: "Lightning",
  },
  water: {
    frameFill: "#a7f3d0",
    frameStroke: "#155e75",
    gemFill: "#0891b2",
    gemStroke: "#164e63",
    auraClass: "from-cyan-300/36 via-sky-300/16 to-neutral-950",
    glyph: "🌊",
    label: "Water",
  },
  fire: {
    frameFill: "#fed7aa",
    frameStroke: "#9a3412",
    gemFill: "#ea580c",
    gemStroke: "#7c2d12",
    auraClass: "from-orange-400/38 via-rose-400/16 to-neutral-950",
    glyph: "🔥",
    label: "Fire",
  },
  nature: {
    frameFill: "#bbf7d0",
    frameStroke: "#166534",
    gemFill: "#16a34a",
    gemStroke: "#14532d",
    auraClass: "from-emerald-300/36 via-lime-300/16 to-neutral-950",
    glyph: "🌿",
    label: "Nature",
  },
  stone: {
    frameFill: "#d6d3d1",
    frameStroke: "#57534e",
    gemFill: "#78716c",
    gemStroke: "#292524",
    auraClass: "from-stone-300/34 via-zinc-300/14 to-neutral-950",
    glyph: "◆",
    label: "Stone",
  },
} satisfies Record<GatheringElementType, GatheringElementUi>;

const infoPanelTabs = ["element", "recipe", "extended", "emergent"] as const;
const InfoPanelTabSchema = z.enum(infoPanelTabs);
type InfoPanelTab = z.infer<typeof InfoPanelTabSchema>;

const questPanelTabs = ["current", "log"] as const;
const QuestPanelTabSchema = z.enum(questPanelTabs);
type QuestPanelTab = z.infer<typeof QuestPanelTabSchema>;

const QuestProfileStatKindSchema = z.enum(["level", "gold", "knowledge", "discovery", "muddlefog"]);
type QuestProfileStatKind = z.infer<typeof QuestProfileStatKindSchema>;
const QuestProfileStatSchema = z.object({
  kind: QuestProfileStatKindSchema,
  label: z.string().min(1),
  value: z.string().min(1),
});

const BoardModeTabSchema = AlchemistGuildBoardModeSchema;
type BoardModeTab = AlchemistGuildBoardMode;

type RewardKind = "discovery" | "gold" | "knowledge" | "muddlefog";
type WorkbenchDiscoveryDetailKind = "emergent" | "extended" | "recipe";
type WorkbenchDiscoverySourceLink = {
  label: string;
  url: string;
};
type WorkbenchDiscoveryDetail = {
  formula: string;
  funFacts: readonly string[];
  id: string;
  imageAlt: string;
  imageUrl: string;
  kind: WorkbenchDiscoveryDetailKind;
  sentences: readonly string[];
  sourceLinks: readonly WorkbenchDiscoverySourceLink[];
  subtitle: string;
  tags: readonly string[];
  title: string;
};

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
  kind: "crafted" | "element" | "emergent" | "extended" | "raw";
  kindLabel: string;
  name: string;
  symbol: string;
  atomicNumber?: number;
};

type AlchemyWorkbenchStaticRecipePreview =
  | AlchemyWorkbenchRecipePreview
  | AlchemyWorkbenchExtendedRecipePreview;

type AlchemyWorkbenchAnyRecipePreview =
  | AlchemyWorkbenchStaticRecipePreview
  | AlchemyWorkbenchEmergentPreview;

type QuestInventoryMarker = {
  label: string;
  tone: "delivery" | "prep";
};

type ExpeditionTargetOption = {
  card: AlchemyBoardCard;
  source: "quest" | "vault" | "both";
};

type EmergentTransmutationNotice = {
  id: string;
  message: string;
  status: "failure" | "success";
  name?: string;
  rarity?: AlchemistGuildEmergentRecipeRarity;
};

type GatheringSessionReviewState = {
  depositing: boolean;
  entries: readonly AlchemistGuildGatheringLogEntry[];
  id: string;
  targetTab: BoardModeTab;
};

type GatheringSessionRewardSummary = {
  card: AlchemyBoardCard;
  cardId: string;
  count: number;
  latestRound: number;
};

type PeriodicCraftingIngredient = {
  readonly cardId: string;
  readonly quantity: number;
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
for (const card of ALCHEMY_GATHERABLE_CARDS) {
  alchemyCardsById.set(card.cardId, {
    detailLabel: formatTokenLabel(card.kind),
    familyColor: "#f59e0b",
    id: card.cardId,
    kind: "raw",
    kindLabel: "Raw",
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
  | { accepted: boolean; kind: "extended-filter" }
  | { accepted: boolean; kind: "quest" }
  | { accepted: boolean; kind: "sell"; price: number }
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
  sourceChoiceIndex: number,
  event: ReactPointerEvent<HTMLButtonElement>,
) => void;
type GatheringRewardSelectHandler = (cardId: string) => void;
type GatheringBossAnswerHandler = (value: number) => void;
type GatheringBossCommandHandler = () => void;

type GatheringConfirmPointerDownHandler = (event: ReactPointerEvent<HTMLButtonElement>) => void;

type GatheringAnswerDragSource = { kind: "cards" } | { kind: "answer-slot" };
type GatheringCardDragSource = GatheringAnswerDragSource | { kind: "move-cards" };

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
      enemyElement: GatheringElementType;
      kind: "move";
      move: GatheringMove;
      sourceChoiceIndex: number;
    });

// The id of the move being held/charged, or null. Module-scoped so the board
// orchestrator stays a thin pass-through (keeps its cognitive complexity down).
function getGatheringChargeMoveId(card: DraggedGatheringCard | null): GatheringMoveId | null {
  return card?.kind === "move" ? card.move.id : null;
}

type GatheringDropTarget =
  | "none"
  | "answer-slot"
  | "cards-panel"
  | "action-zone"
  | "monster-panel"
  | "log-panel";

type GatheringDropFeedback = "none" | "drop" | "blocked";

type SlotRect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

type GatheringAnswerSlotGhost = {
  feedback: DropFeedback;
  value: number;
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

type QuestCurrentPendingTransition = {
  direction: -1 | 1;
  residualDeltaX: number;
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

const GatheringAnswerDropGhostPropsSchema = z.object({
  feedback: z.custom<DropFeedback>(),
  value: z.int().min(0),
});

const GatheringAnswerDropGhost = defineComponent(
  GatheringAnswerDropGhostPropsSchema,
  ({ feedback, value }) => (
    <div
      data-board-section="gathering-answer-drop-preview-card"
      data-board-name={`Answer ${value} drop preview card`}
      className={`${getDropGhostClass(feedback)} grid place-items-center text-neutral-950`}
      aria-hidden="true"
    >
      <span className="text-5xl font-black leading-none">{value}</span>
      <span className="absolute bottom-3 left-2 right-2 truncate text-center text-[10px] font-black uppercase leading-none text-neutral-700">
        Answer
      </span>
    </div>
  ),
);

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
  confirmPadTrackRef: z.custom<RefObject<HTMLDivElement | null>>(),
  confirmSwipeProgress: z.number().min(0).max(1),
  draggedGatheringCard: z.custom<DraggedGatheringCard | null>(),
  gatheringDropTarget: z.custom<GatheringDropTarget>(),
  gathering: z.custom<AlchemistGuildGatheringState>(),
  isConfirmDragging: z.boolean(),
  onAnswerPointerDown: z.custom<GatheringAnswerPointerDownHandler>(),
  onConfirmPointerDown: z.custom<GatheringConfirmPointerDownHandler>(),
});

const GatheringGamePanel = defineComponent(
  GatheringGamePanelPropsSchema,
  ({
    confirmPadTrackRef,
    confirmSwipeProgress,
    draggedGatheringCard,
    gathering,
    gatheringDropTarget,
    isConfirmDragging,
    onAnswerPointerDown,
    onConfirmPointerDown,
  }) => {
    const displayedAnswer = gathering.equation.selectedValue;
    const answerDropActive = gatheringDropTarget === "answer-slot";
    const actionDropActive = gatheringDropTarget === "action-zone";
    const confirmReady = gathering.phase === "solving" && displayedAnswer !== null;
    const confirmSucceeded = gathering.phase !== "solving" && gathering.lastAnswerCorrect === true;
    const equationCardsLocked = confirmSucceeded;
    const isDraggingAnswerFromSlot =
      draggedGatheringCard?.kind === "answer" && draggedGatheringCard.source.kind === "answer-slot";

    return (
      <div
        data-gathering-drop-target={gathering.phase === "move" ? "action-zone" : undefined}
        data-gathering-drop-active={actionDropActive ? "true" : undefined}
        className={`pointer-events-auto grid h-full min-h-0 place-items-center p-6 transition-[box-shadow] duration-150 ${
          actionDropActive ? "shadow-[inset_0_0_0_4px_rgba(14,165,233,0.22)]" : ""
        }`}
      >
        <div className="grid w-full max-w-[46rem] gap-5 text-center">
          <GatheringStreakMeter streak={gathering.streak} />
          <div className="flex items-center justify-center gap-3 text-neutral-950">
            <GatheringEquationValue
              disabled={equationCardsLocked}
              value={gathering.equation.left}
              label={getGatheringOperandLabels(gathering.equation.operator).left}
            />
            <span className="text-4xl font-black leading-none" aria-hidden="true">
              {gathering.equation.operator}
            </span>
            <GatheringEquationValue
              disabled={equationCardsLocked}
              value={gathering.equation.right}
              label={getGatheringOperandLabels(gathering.equation.operator).right}
            />
            <span className="text-4xl font-black leading-none" aria-hidden="true">
              =
            </span>
            <div
              data-gathering-drop-target="answer-slot"
              data-gathering-drop-active={answerDropActive ? "true" : undefined}
              data-gathering-answer-locked={equationCardsLocked ? "true" : undefined}
              className={getGatheringAnswerSlotClass(
                answerDropActive,
                equationCardsLocked,
                gathering.lastAnswerCorrect,
              )}
            >
              {displayedAnswer !== null && !isDraggingAnswerFromSlot ? (
                <GatheringAnswerSlotCard
                  disabled={equationCardsLocked}
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
          <GatheringAnswerConfirmPad
            active={confirmReady}
            confirmed={confirmSucceeded}
            isDragging={isConfirmDragging}
            onPointerDown={onConfirmPointerDown}
            progress={confirmSucceeded ? 1 : confirmSwipeProgress}
            trackRef={confirmPadTrackRef}
          />
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
  disabled: z.boolean(),
  label: z.string().min(1),
  value: z.int().min(0),
});

const GatheringEquationValue = defineComponent(
  GatheringEquationValuePropsSchema,
  ({ disabled, label, value }) => (
    <span
      className={`${GATHERING_EQUATION_CARD_CLASS} text-5xl font-black leading-none transition-[background-color,border-color,opacity,filter] duration-150 ${
        disabled
          ? "border-neutral-500/45 bg-neutral-100/70 text-neutral-500 opacity-65 grayscale"
          : "border-neutral-800/55 text-neutral-950"
      }`}
    >
      <span className="sr-only">{label}: </span>
      {value}
    </span>
  ),
);

const GatheringRewardStagePanelPropsSchema = z.object({
  gathering: z.custom<AlchemistGuildGatheringState>(),
});

const GatheringRewardStagePanel = defineComponent(
  GatheringRewardStagePanelPropsSchema,
  ({ gathering }) => (
    <div className="pointer-events-auto grid h-full min-h-0 place-items-center p-6">
      <article
        data-board-section="gathering-reward-chest"
        data-board-name={`${gathering.monster.name} treasure chest`}
        className="grid w-[min(17rem,72vw)] gap-2 rounded-[7px] border-2 border-emerald-700/55 bg-white/80 p-2 shadow-[0_18px_36px_rgba(15,23,42,0.2),0_0_0_4px_rgba(16,185,129,0.12)]"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-[5px] border border-neutral-900/15 bg-neutral-100">
          <img
            src={resolvePublicAssetPath(getGatheringRewardTreasurePath(gathering))}
            alt=""
            aria-hidden="true"
            className="size-full object-cover"
            draggable={false}
          />
          <span
            className="pointer-events-none absolute inset-0 rounded-[5px] bg-[radial-gradient(circle_at_50%_45%,rgba(16,185,129,0.2),transparent_48%),linear-gradient(to_bottom,rgba(255,255,255,0.1),transparent_42%,rgba(15,23,42,0.18))]"
            aria-hidden="true"
          />
        </div>
        <div className="grid gap-1 text-center">
          <h3 className="truncate text-sm font-black leading-tight text-neutral-950">
            Treasure Unlocked
          </h3>
          <p className="text-[11px] font-black uppercase leading-none text-emerald-900">
            Pick one reward
          </p>
        </div>
      </article>
    </div>
  ),
);

const GatheringBossFightPanelPropsSchema = z.object({
  boss: z.custom<AlchemistGuildGatheringBossState>(),
  nowMs: z.number().min(0),
});

const GatheringBossFightPanel = defineComponent(
  GatheringBossFightPanelPropsSchema,
  ({ boss, nowMs }) => {
    const remainingMs = getGatheringBossRemainingMs(boss, nowMs);
    const timerPercent = Math.round((remainingMs / GATHERING_BOSS_PROBLEM_DURATION_MS) * 100);

    return (
      <div className="gathering-boss-arena gathering-boss-enter pointer-events-auto grid h-full min-h-0 place-items-center p-6 pt-12">
        <span className={GATHERING_PANEL_LABEL_CLASS}>Boss Fight</span>
        <article
          data-board-section="gathering-boss-fight"
          className="grid w-full max-w-[44rem] gap-5 rounded-[8px] border-2 border-neutral-950/25 bg-white/80 p-5 text-center shadow-[0_20px_44px_rgba(15,23,42,0.22)] backdrop-blur-md"
          aria-live="polite"
        >
          <div className="grid grid-cols-3 gap-2 text-[11px] font-black uppercase leading-none text-neutral-700">
            <span className="rounded-[6px] border border-neutral-900/10 bg-white/65 p-2">
              Streak {boss.currentStreak}/{GATHERING_BOSS_REQUIRED_STREAK}
            </span>
            <span className="rounded-[6px] border border-neutral-900/10 bg-white/65 p-2">
              Problem {boss.problemIndex}
            </span>
            <span className="rounded-[6px] border border-neutral-900/10 bg-white/65 p-2">
              Misses {boss.misses}/{GATHERING_BOSS_ALLOWED_MISSES}
            </span>
          </div>
          <div className="grid gap-4">
            <p className="text-xs font-black uppercase leading-none text-fuchsia-900">
              Level {boss.level} {boss.equation.operator === "-" ? "subtraction" : "addition"}
            </p>
            <div className="flex items-center justify-center gap-4 text-neutral-950">
              <span className="grid size-28 place-items-center rounded-[8px] border-2 border-neutral-900/40 bg-white/85 font-mono text-6xl font-black leading-none shadow-[0_10px_20px_rgba(15,23,42,0.14)]">
                {boss.equation.left}
              </span>
              <span className="font-mono text-5xl font-black leading-none">
                {boss.equation.operator}
              </span>
              <span className="grid size-28 place-items-center rounded-[8px] border-2 border-neutral-900/40 bg-white/85 font-mono text-6xl font-black leading-none shadow-[0_10px_20px_rgba(15,23,42,0.14)]">
                {boss.equation.right}
              </span>
            </div>
          </div>
          <div className="grid gap-2">
            <div className="h-5 overflow-hidden rounded-full border border-neutral-950/20 bg-neutral-200">
              <span
                className="gathering-boss-timer-fill block h-full rounded-full bg-emerald-500"
                style={{ width: `${timerPercent}%` }}
              />
            </div>
            <p className="font-mono text-lg font-black leading-none text-neutral-950">
              {(remainingMs / 1000).toFixed(1)}s
            </p>
          </div>
        </article>
      </div>
    );
  },
);

const GatheringBossAnswerPanelPropsSchema = z.object({
  boss: z.custom<AlchemistGuildGatheringBossState>(),
  onAnswer: z.custom<GatheringBossAnswerHandler>(),
});

const GatheringBossAnswerPanel = defineComponent(
  GatheringBossAnswerPanelPropsSchema,
  ({ boss, onAnswer }) => (
    <>
      <span className={GATHERING_PANEL_LABEL_CLASS}>Boss Answers</span>
      {boss.equation.choiceValues.map((value) => (
        <button
          key={value}
          type="button"
          data-board-section="gathering-boss-answer-card"
          data-board-name={`Boss answer ${value}`}
          className="relative z-10 grid min-h-0 place-items-center rounded-[6px] border-2 border-neutral-800/50 bg-white text-neutral-950 shadow-[0_8px_18px_rgba(0,0,0,0.16)] transition-[border-color,box-shadow,transform] hover:border-fuchsia-500 hover:shadow-[inset_0_0_0_3px_rgba(217,70,239,0.18),0_8px_18px_rgba(0,0,0,0.18)] active:scale-[0.98]"
          onClick={() => {
            onAnswer(value);
          }}
        >
          <span className="font-mono text-5xl font-black leading-none">{value}</span>
        </button>
      ))}
    </>
  ),
);

const GatheringBossRewardPanelPropsSchema = z.object({
  boss: z.custom<AlchemistGuildGatheringBossState>(),
  onClaim: z.custom<GatheringBossCommandHandler>(),
});

const GatheringBossRewardPanel = defineComponent(
  GatheringBossRewardPanelPropsSchema,
  ({ boss, onClaim }) => {
    const quantity = getGatheringBossRewardQuantity(boss.level);
    const rewardCards = boss.rewardCardIds.flatMap((cardId) => {
      const card = getAlchemyCard(cardId);
      return card ? [card] : [];
    });

    return (
      <div className="gathering-boss-reward pointer-events-auto grid h-full min-h-0 place-items-center p-5 pt-12">
        <span className={GATHERING_PANEL_LABEL_CLASS}>Boss Reward</span>
        <article
          data-board-section="gathering-boss-reward"
          className="grid w-full max-w-[46rem] gap-4 rounded-[8px] border-2 border-emerald-700/60 bg-white/82 p-5 text-center shadow-[0_20px_44px_rgba(15,23,42,0.2),0_0_0_5px_rgba(16,185,129,0.14)] backdrop-blur-md"
        >
          <div>
            <p className="text-xs font-black uppercase leading-none text-emerald-900">
              Level {boss.level} cleared
            </p>
            <h3 className="mt-1 font-serif text-4xl leading-none text-neutral-950">New elements</h3>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {rewardCards.map((card, index) => (
              <div
                key={card.id}
                data-board-section="gathering-boss-reward-card"
                data-card-id={card.id}
                className="gathering-boss-reward-card relative aspect-[5/7] overflow-hidden rounded-[6px] border-2 border-emerald-800/45 bg-[#eeeeee] text-left shadow-[0_10px_18px_rgba(15,23,42,0.16)]"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <AlchemyCardFace card={card} />
                <span className="absolute right-1 top-1 z-20 rounded-full border border-emerald-950/20 bg-emerald-400 px-1.5 py-0.5 font-mono text-[10px] font-black leading-none text-emerald-950">
                  x{quantity}
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mx-auto inline-grid min-h-12 min-w-44 place-items-center rounded-[7px] border border-emerald-950/20 bg-emerald-600 px-5 text-sm font-black uppercase leading-none text-white shadow-[0_10px_20px_rgba(6,95,70,0.22)] transition-[transform,background-color] hover:bg-emerald-700 active:translate-y-px"
            onClick={onClaim}
          >
            Claim Elements
          </button>
        </article>
      </div>
    );
  },
);

const GatheringBossFailurePanelPropsSchema = z.object({
  boss: z.custom<AlchemistGuildGatheringBossState>(),
  onDismiss: z.custom<GatheringBossCommandHandler>(),
});

const GatheringBossFailurePanel = defineComponent(
  GatheringBossFailurePanelPropsSchema,
  ({ boss, onDismiss }) => (
    <div className="gathering-boss-failure pointer-events-auto grid h-full min-h-0 place-items-center p-6 pt-12">
      <span className={GATHERING_PANEL_LABEL_CLASS}>Boss Failed</span>
      <article className="grid w-full max-w-[34rem] gap-4 rounded-[8px] border-2 border-rose-800/55 bg-white/82 p-5 text-center shadow-[0_18px_42px_rgba(15,23,42,0.2)] backdrop-blur-md">
        <span className="mx-auto grid size-14 place-items-center rounded-[7px] border border-rose-900/25 bg-rose-50 text-rose-950">
          <X className="size-7" strokeWidth={2.8} aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-black uppercase leading-none text-rose-900">
            Level {boss.level} reset
          </p>
          <h3 className="mt-1 font-serif text-4xl leading-none text-neutral-950">Streak broken</h3>
        </div>
        <p className="text-sm font-bold leading-snug text-neutral-700">
          The level memory track has restarted.
        </p>
        <button
          type="button"
          className="mx-auto inline-grid min-h-12 min-w-44 place-items-center rounded-[7px] border border-rose-950/20 bg-rose-600 px-5 text-sm font-black uppercase leading-none text-white shadow-[0_10px_20px_rgba(136,19,55,0.2)] transition-[transform,background-color] hover:bg-rose-700 active:translate-y-px"
          onClick={onDismiss}
        >
          Return
        </button>
      </article>
    </div>
  ),
);

const GatheringBossStatusPanelPropsSchema = z.object({
  boss: z.custom<AlchemistGuildGatheringBossState>(),
  mastery: z.custom<GatheringLevelMasteryReport>(),
});

const GatheringBossStatusPanel = defineComponent(
  GatheringBossStatusPanelPropsSchema,
  ({ boss, mastery }) => (
    <>
      <span className={GATHERING_PANEL_LABEL_CLASS}>Boss Status</span>
      <div className="col-span-5 grid h-full min-h-0 place-items-center rounded-[6px] border border-neutral-900/10 bg-white/55 p-4 text-center">
        <div className="grid max-w-[30rem] gap-2">
          <p className="text-xs font-black uppercase leading-none text-neutral-700">
            Level {mastery.currentLevel} boss
          </p>
          <p className="font-serif text-2xl leading-none text-neutral-950">
            {getGatheringBossStatusText(boss, mastery)}
          </p>
        </div>
      </div>
    </>
  ),
);

const GatheringAnswerConfirmPadPropsSchema = z.object({
  active: z.boolean(),
  confirmed: z.boolean(),
  isDragging: z.boolean(),
  onPointerDown: z.custom<GatheringConfirmPointerDownHandler>(),
  progress: z.number().min(0).max(1),
  trackRef: z.custom<RefObject<HTMLDivElement | null>>(),
});

const GatheringAnswerConfirmPad = defineComponent(
  GatheringAnswerConfirmPadPropsSchema,
  ({ active, confirmed, isDragging, onPointerDown, progress, trackRef }) => (
    <div
      ref={trackRef}
      data-board-section="gathering-answer-confirm-pad"
      data-board-name="Gathering answer confirm pad"
      data-confirm-ready={active ? "true" : "false"}
      data-confirm-status={getGatheringConfirmPadStatus(active, confirmed)}
      data-swipe-progress={progress.toFixed(2)}
      className={`relative mx-auto min-h-20 w-full max-w-[24rem] overflow-hidden rounded-[6px] border p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-sm ${getGatheringConfirmPadStateClass(
        active,
        confirmed,
      )}`}
    >
      <span
        className="pointer-events-none absolute inset-y-3 left-3 right-3 rounded-[5px] bg-white/25"
        aria-hidden="true"
      >
        <span
          className="block h-full rounded-[5px] bg-emerald-400/30 transition-[width] duration-75"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </span>
      <p
        className={`pointer-events-none absolute inset-0 z-10 grid place-items-center px-[7.5rem] text-center font-serif text-xl italic ${
          active || confirmed ? "text-emerald-950" : "text-neutral-700"
        }`}
      >
        {getGatheringConfirmPadPrompt(active, confirmed)}
      </p>
      <button
        type="button"
        data-board-section="gathering-answer-confirm-handle"
        data-board-name="Gathering answer confirm handle"
        disabled={!active}
        tabIndex={active ? 0 : -1}
        aria-label={getGatheringConfirmPadAriaLabel(active, confirmed)}
        className={`absolute bottom-3 top-3 z-20 grid touch-none place-items-center rounded-[5px] text-white shadow-[0_8px_18px_rgba(15,23,42,0.22)] transition-[background-color,opacity] duration-200 active:cursor-grabbing ${getGatheringConfirmHandleStateClass(
          active,
          confirmed,
        )}`}
        style={{
          left: `calc(${TRANSMUTE_TRACK_PADDING_PX}px + ${progress * 100}% - ${
            progress * (TRANSMUTE_KNOB_WIDTH_PX + TRANSMUTE_TRACK_PADDING_PX * 2)
          }px)`,
          transition: isDragging ? "none" : "left 220ms cubic-bezier(0.34,1.56,0.64,1)",
          width: `${TRANSMUTE_KNOB_WIDTH_PX}px`,
        }}
        onPointerDown={onPointerDown}
      >
        <div className="flex h-10 items-center gap-3" aria-hidden="true">
          <span className="h-full w-0.5 bg-neutral-300" />
          <span className="h-full w-0.5 bg-neutral-300" />
          <span className="h-full w-0.5 bg-neutral-300" />
        </div>
      </button>
    </div>
  ),
);

const GatheringGameCardsPanelPropsSchema = z.object({
  draggedGatheringCard: z.custom<DraggedGatheringCard | null>(),
  gatheringDropChoiceIndex: z.int().min(0).nullable(),
  gatheringDropTarget: z.custom<GatheringDropTarget>(),
  gathering: z.custom<AlchemistGuildGatheringState>(),
  onAnswerPointerDown: z.custom<GatheringAnswerPointerDownHandler>(),
  onMovePointerDown: z.custom<GatheringMovePointerDownHandler>(),
  onRewardSelect: z.custom<GatheringRewardSelectHandler>(),
  selectedRewardCardId: z.string().nullable(),
});

const GatheringGameCardsPanel = defineComponent(
  GatheringGameCardsPanelPropsSchema,
  ({
    draggedGatheringCard,
    gathering,
    gatheringDropChoiceIndex,
    gatheringDropTarget,
    onAnswerPointerDown,
    onMovePointerDown,
    onRewardSelect,
    selectedRewardCardId,
  }) => {
    let occupiedCards: ReactNode[];
    if (gathering.phase === "solving") {
      occupiedCards = gathering.equation.choiceValues.map((value) =>
        isGatheringAnswerChoiceHidden(gathering, draggedGatheringCard, value) ? null : (
          <GatheringAnswerCard
            key={value}
            gathering={gathering}
            onPointerDown={onAnswerPointerDown}
            value={value}
          />
        ),
      );
    } else if (gathering.phase === "move") {
      occupiedCards = getGatheringMoveLadder(gathering.streak.current).map((move, index) =>
        move.locked ? (
          <GatheringLockedMoveCard
            key={move.id}
            enemyElement={gathering.monster.elementType}
            move={move}
          />
        ) : (
          <GatheringMoveCard
            key={move.id}
            enemyElement={gathering.monster.elementType}
            move={move}
            sourceChoiceIndex={index}
            onPointerDown={onMovePointerDown}
          />
        ),
      );
    } else {
      occupiedCards = gathering.rewardOptionCardIds.map((cardId, optionIndex) => (
        <GatheringRewardCard
          key={cardId}
          cardId={cardId}
          optionIndex={optionIndex}
          selected={selectedRewardCardId === cardId}
          streak={gathering.streak}
          onSelect={onRewardSelect}
        />
      ));
    }
    const panelSlotIds =
      gathering.phase === "reward"
        ? gatheringGameCardSlots.slice(0, gathering.rewardOptionCardIds.length)
        : gatheringGameCardSlots;

    return (
      <div
        data-gathering-drop-target="cards-panel"
        data-gathering-drop-active={gatheringDropTarget === "cards-panel" ? "true" : undefined}
        className="contents"
      >
        {panelSlotIds.map((slotId, index) => (
          <GatheringGameCardSlot
            key={slotId}
            card={occupiedCards[index] ?? null}
            draggedGatheringCard={draggedGatheringCard}
            gathering={gathering}
            gatheringDropChoiceIndex={gatheringDropChoiceIndex}
            gatheringDropTarget={gatheringDropTarget}
            index={index}
          />
        ))}
      </div>
    );
  },
);

const GatheringGameCardSlotPropsSchema = z.object({
  card: z.custom<ReactNode>(),
  draggedGatheringCard: z.custom<DraggedGatheringCard | null>(),
  gatheringDropChoiceIndex: z.int().min(0).nullable(),
  gatheringDropTarget: z.custom<GatheringDropTarget>(),
  gathering: z.custom<AlchemistGuildGatheringState>(),
  index: z.int().min(0),
});

const GatheringGameCardSlot = defineComponent(
  GatheringGameCardSlotPropsSchema,
  ({
    card,
    draggedGatheringCard,
    gathering,
    gatheringDropChoiceIndex,
    gatheringDropTarget,
    index,
  }) => {
    const ghost = getGatheringAnswerSlotGhost(
      gathering,
      draggedGatheringCard,
      gatheringDropTarget,
      gatheringDropChoiceIndex,
      index,
    );
    const slotFeedback =
      ghost?.feedback ??
      getGatheringGameCardSlotFeedback(gatheringDropTarget, gatheringDropChoiceIndex, index);

    return (
      <div
        data-board-section="gathering-game-card-slot"
        data-board-name="Gathering game card slot"
        data-drop-feedback={slotFeedback}
        data-gathering-card-slot-index={index}
        data-gathering-card-slot-value={
          gathering.phase === "solving" ? gathering.equation.choiceValues[index] : undefined
        }
        data-gathering-drop-active={slotFeedback !== "none" ? "true" : undefined}
        data-gathering-drop-target="cards-panel"
        className={getSlotShellClass(slotFeedback)}
      >
        {card}
        {ghost ? <GatheringAnswerDropGhost feedback={ghost.feedback} value={ghost.value} /> : null}
      </div>
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
  disabled: z.boolean(),
  onPointerDown: z.custom<GatheringAnswerPointerDownHandler>(),
  value: z.int().min(0),
});

const GatheringAnswerSlotCard = defineComponent(
  GatheringAnswerSlotCardPropsSchema,
  ({ disabled, onPointerDown, value }) => (
    <button
      type="button"
      data-board-section="gathering-answer-slot-card"
      data-board-name={`Slotted answer ${value}`}
      disabled={disabled}
      className={`absolute inset-1 z-10 grid touch-none select-none place-items-center rounded-[6px] border-2 transition-[border-color,box-shadow,transform,opacity,filter] duration-150 ${
        disabled
          ? "cursor-default border-neutral-500/45 bg-neutral-100 text-neutral-500 opacity-70 grayscale shadow-none"
          : "cursor-grab border-neutral-800/55 bg-white text-neutral-950 shadow-[0_8px_18px_rgba(15,23,42,0.12)] hover:border-sky-500 active:cursor-grabbing active:scale-[0.98]"
      }`}
      aria-label={disabled ? `Confirmed answer ${value}` : `Drag slotted answer ${value}`}
      onPointerDown={
        disabled ? undefined : (event) => onPointerDown(value, { kind: "answer-slot" }, event)
      }
    >
      <span className="text-5xl font-black leading-none">{value}</span>
    </button>
  ),
);

const GatheringMoveCardPropsSchema = z.object({
  enemyElement: z.custom<GatheringElementType>(),
  move: z.custom<GatheringMove>(),
  onPointerDown: z.custom<GatheringMovePointerDownHandler>(),
  sourceChoiceIndex: z.int().min(0),
});

const GatheringMoveCard = defineComponent(
  GatheringMoveCardPropsSchema,
  ({ enemyElement, move, onPointerDown, sourceChoiceIndex }) => {
    const visual = getGatheringMoveVisual(move.id);
    const preview = resolveGatheringMoveDamage(move, enemyElement);
    const counterPhrase =
      preview.effectiveness === "counter"
        ? "counters this enemy for plus fifty percent"
        : "neutral hit";

    return (
      <button
        type="button"
        data-board-section="gathering-move-card"
        data-board-name={move.name}
        className={`absolute inset-0 z-10 cursor-grab touch-none select-none overflow-visible rounded-[8px] border-2 text-left text-neutral-950 shadow-[0_8px_18px_rgba(0,0,0,0.18)] transition-[border-color,box-shadow,transform] duration-150 active:cursor-grabbing active:scale-[0.98] ${visual.cardClass}`}
        aria-label={`Drag ${move.name} attack, level ${move.level}, ${preview.damage} damage, ${counterPhrase}`}
        onPointerDown={(event) => onPointerDown(move, sourceChoiceIndex, event)}
      >
        <GatheringMoveCardFace enemyElement={enemyElement} move={move} />
      </button>
    );
  },
);

const GatheringLockedMoveCardPropsSchema = z.object({
  enemyElement: z.custom<GatheringElementType>(),
  move: z.custom<GatheringMove>(),
});

const GatheringLockedMoveCard = defineComponent(
  GatheringLockedMoveCardPropsSchema,
  ({ enemyElement, move }) => (
    <div
      data-board-section="gathering-locked-move-card"
      data-board-name={`${move.name} locked until streak ${move.unlockStreak}`}
      className="absolute inset-0 overflow-visible rounded-[8px] border-2 border-neutral-900/25 bg-neutral-950 shadow-[0_8px_18px_rgba(0,0,0,0.18)]"
    >
      <span className="sr-only">
        {move.name} unlocks at streak {move.unlockStreak}
      </span>
      <span className="absolute inset-0 overflow-visible grayscale">
        <GatheringMoveCardFace enemyElement={enemyElement} move={move} />
      </span>
      <span className="absolute -inset-1 grid place-items-center rounded-[8px] bg-neutral-950/54 px-2 text-center">
        <span className="rounded-[5px] border border-white/50 bg-white/90 px-2 py-1.5 text-[11px] font-black uppercase leading-tight text-neutral-950 shadow-[0_8px_18px_rgba(0,0,0,0.2)]">
          Streak {move.unlockStreak}
        </span>
      </span>
    </div>
  ),
);

const GatheringMoveCardStatBadgeVariantSchema = z.enum(["attack", "counter", "level"]);
type GatheringMoveCardStatBadgeVariant = z.infer<typeof GatheringMoveCardStatBadgeVariantSchema>;

const GatheringMoveCardStatBadgePropsSchema = z.object({
  className: z.string(),
  dataBoardSection: z.string().optional(),
  dataGatheringEffectiveness: z.string().optional(),
  dataGatheringStreakBonus: z.int().optional(),
  dataGatheringStreakRarity: z.string().optional(),
  fill: z.string(),
  label: z.string(),
  stroke: z.string(),
  value: z.string(),
  variant: GatheringMoveCardStatBadgeVariantSchema,
});

const GatheringMoveCardStatBadge = defineComponent(
  GatheringMoveCardStatBadgePropsSchema,
  ({
    className,
    dataBoardSection,
    dataGatheringEffectiveness,
    dataGatheringStreakBonus,
    dataGatheringStreakRarity,
    fill,
    label,
    stroke,
    value,
    variant,
  }) => {
    const shapePath = getGatheringMoveCardStatBadgePath(variant);
    const highlightPath = getGatheringMoveCardStatBadgeHighlightPath(variant);
    const labelClass = "text-[7px] leading-none";
    const valueClass =
      variant === "counter" ? "text-[9px] leading-none" : "font-mono text-[18px] leading-none";

    return (
      <span
        aria-hidden="true"
        data-board-section={dataBoardSection}
        data-gathering-effectiveness={dataGatheringEffectiveness}
        data-gathering-streak-bonus={dataGatheringStreakBonus}
        data-gathering-streak-rarity={dataGatheringStreakRarity}
        className={`grid place-items-center ${className}`}
      >
        <svg
          aria-hidden="true"
          className="absolute inset-0 size-full drop-shadow-[0_3px_3px_rgba(15,23,42,0.45)]"
          viewBox="0 0 48 48"
        >
          <path d={shapePath} fill="#251b14" />
          <path d={shapePath} fill={fill} stroke={stroke} strokeWidth="2.8" />
          <path d={highlightPath} fill="rgba(255,255,255,0.42)" />
          <path d={shapePath} fill="none" stroke="rgba(255,255,255,0.44)" strokeWidth="1" />
        </svg>
        <span className="gathering-move-card-stat-text relative z-10 grid place-items-center text-center font-black uppercase text-white">
          <span className={labelClass}>{label}</span>
          <span className={valueClass}>{value}</span>
        </span>
      </span>
    );
  },
);

const GatheringMoveCardFacePropsSchema = z.object({
  enemyElement: z.custom<GatheringElementType>(),
  move: z.custom<GatheringMove>(),
});

const GatheringMoveCardFace = defineComponent(
  GatheringMoveCardFacePropsSchema,
  ({ enemyElement, move }) => {
    const visual = getGatheringMoveVisual(move.id);
    const elementUi = gatheringElementUi[move.element];
    const preview = resolveGatheringMoveDamage(move, enemyElement);
    const counterActive = preview.effectiveness === "counter";
    const counterFill = counterActive ? "#10b981" : "#a8a29e";
    const counterStroke = counterActive ? "#065f46" : "#44403c";
    const counterLabel = counterActive ? "Counter" : "Neutral";
    const counterValue = counterActive ? "+50%" : "Hit";

    return (
      <span className="absolute inset-0 block overflow-visible rounded-[8px] bg-transparent">
        <svg
          aria-hidden="true"
          className="absolute inset-0 size-full"
          preserveAspectRatio="none"
          viewBox="0 0 105 148"
        >
          <path
            d="M15 2 H90 C99 2 103 9 103 19 V129 C103 140 97 146 86 146 H19 C8 146 2 140 2 129 V19 C2 9 7 2 15 2Z"
            fill="#2f241d"
          />
          <path
            d="M17 6 H88 C95 6 99 12 99 20 V126 C99 136 94 142 84 142 H21 C11 142 6 136 6 126 V20 C6 12 10 6 17 6Z"
            fill={visual.frameFill}
            stroke={visual.frameStroke}
            strokeWidth="2"
          />
          <path
            d="M14 92 C25 101 80 101 91 92 V127 C91 134 87 138 80 138 H25 C18 138 14 134 14 127Z"
            fill="#d9c49f"
            stroke="#6b4a2b"
            strokeWidth="1.5"
          />
          <path
            d="M18 10 H87 C92 10 95 14 95 20 V36 C76 26 29 26 10 36 V20 C10 14 13 10 18 10Z"
            fill="rgba(255,255,255,0.3)"
          />
        </svg>
        <span
          className={`pointer-events-none absolute inset-1.5 rounded-[7px] ${visual.auraClass}`}
        />
        <span className="absolute left-[13px] right-[13px] top-[13px] h-[68px] overflow-hidden rounded-t-full rounded-b-[13px] border-[3px] border-neutral-700 bg-neutral-950 shadow-[inset_0_2px_0_rgba(255,255,255,0.26),0_3px_7px_rgba(15,23,42,0.38)]">
          <img
            data-board-section="gathering-move-card-icon"
            src={resolvePublicAssetPath(visual.iconPath)}
            alt=""
            draggable={false}
            className="size-full object-cover"
          />
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.2),transparent_38%),linear-gradient(to_bottom,transparent_58%,rgba(0,0,0,0.36))]" />
        </span>
        <svg
          aria-hidden="true"
          className="absolute left-1.5 right-1.5 top-[77px] h-[28px] drop-shadow-[0_3px_3px_rgba(15,23,42,0.28)]"
          preserveAspectRatio="none"
          viewBox="0 0 93 28"
        >
          <path
            d="M5 7 C18 2 75 2 88 7 L82 22 C64 26 29 26 11 22Z"
            fill="#c9a36d"
            stroke="#5a371d"
            strokeWidth="2"
          />
          <path
            d="M10 8 C28 5 66 5 84 8 L80 13 C60 10 33 10 13 13Z"
            fill="rgba(255,255,255,0.34)"
          />
        </svg>
        <span
          data-board-section="gathering-move-card-name"
          className="gathering-move-card-title-text absolute left-3 right-3 top-[84px] z-20 truncate text-center text-[10px] font-black uppercase leading-none text-neutral-950"
        >
          {move.name}
        </span>
        <span
          data-board-section="gathering-move-card-base-damage"
          className={`absolute left-[30px] right-[30px] top-[103px] z-20 grid place-items-center text-center text-[8px] font-black uppercase leading-none ${visual.nameClass}`}
        >
          <span>{elementUi.label}</span>
          <span>{move.damage} base</span>
        </span>
        <GatheringMoveCardStatBadge
          className="absolute -left-1 -top-1 z-30 size-9"
          dataBoardSection="gathering-move-card-level"
          fill={visual.gemFill}
          label="Lv"
          stroke={visual.gemStroke}
          value={String(move.level)}
          variant="level"
        />
        <GatheringMoveCardStatBadge
          className="absolute -bottom-2 -left-2 z-30 size-11"
          dataBoardSection="gathering-move-card-damage"
          fill={visual.gemFill}
          label="Dmg"
          stroke={visual.gemStroke}
          value={String(preview.damage)}
          variant="attack"
        />
        <GatheringMoveCardStatBadge
          className="absolute -bottom-1.5 -right-2 z-30 h-10 w-12"
          dataBoardSection="gathering-move-card-counter"
          dataGatheringEffectiveness={preview.effectiveness}
          fill={counterFill}
          label={counterLabel}
          stroke={counterStroke}
          value={counterValue}
          variant="counter"
        />
      </span>
    );
  },
);

// Phonics attack step: the same streak-unlocked move cards as the numeric tracks,
// but tapped instead of dragged.
const GatheringPhonicsMovePanelPropsSchema = z.object({
  gathering: z.custom<AlchemistGuildGatheringState>(),
  onPickMove: z.custom<(moveId: GatheringMoveId) => void>(),
});

const GatheringPhonicsMovePanel = defineComponent(
  GatheringPhonicsMovePanelPropsSchema,
  ({ gathering, onPickMove }) => {
    const prompt = gathering.phonicsPrompt;
    if (!prompt) return null;
    const moves = getGatheringPhonicsMoves(prompt, gathering.streak.current);
    const nextUnlock = getGatheringNextMoveUnlock(gathering.streak.current);
    return (
      <div className="pointer-events-auto col-span-full grid h-full content-center gap-2 p-3">
        <p className="text-center text-xs font-black uppercase leading-none text-neutral-700">
          {nextUnlock
            ? `Great match! Next attack at streak ${nextUnlock.unlockStreak}`
            : "Great match! All attacks ready"}
        </p>
        <div
          className="mx-auto grid w-full max-w-[30rem] gap-2.5"
          style={{ gridTemplateColumns: `repeat(${moves.length}, minmax(0, 1fr))` }}
        >
          {moves.map((move) => (
            <button
              key={move.id}
              type="button"
              data-board-section="gathering-move-card"
              data-board-name={move.name}
              data-gathering-phonics-move={move.id}
              onClick={() => onPickMove(move.id)}
              className={`relative aspect-[5/7] overflow-visible rounded-[8px] border-2 text-neutral-950 shadow-[0_8px_18px_rgba(0,0,0,0.18)] transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 active:scale-[0.98] ${getGatheringMoveVisual(move.id).cardClass}`}
            >
              <GatheringMoveCardFace enemyElement={gathering.monster.elementType} move={move} />
            </button>
          ))}
        </div>
      </div>
    );
  },
);

const GatheringAttackArcCanvasPropsSchema = z.object({
  cardRef: z.custom<RefObject<HTMLDivElement | null>>(),
  move: z.custom<GatheringMove>(),
  targetRef: z.custom<RefObject<HTMLDivElement | null>>(),
});

const GatheringAttackArcCanvas = defineComponent(
  GatheringAttackArcCanvasPropsSchema,
  ({ cardRef, move, targetRef }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const moveRef = useRef<GatheringMove | null>(move);

    useEffect(() => {
      moveRef.current = move;
    }, [move]);

    usePixiApp(
      canvasRef,
      (app, { reducedMotion }) =>
        setupGatheringAttackArcOverlay(app, {
          cardRef,
          moveRef,
          reducedMotion,
          targetRef,
        }),
      [],
      { backgroundAlpha: 0, preference: "canvas" },
    );

    return (
      <canvas
        ref={canvasRef}
        data-board-section="gathering-attack-arc-canvas"
        data-board-name={`${move.name} attack arc Pixi canvas`}
        className="pointer-events-none fixed inset-0 z-[49] block size-full touch-none"
      />
    );
  },
);

const GatheringMonsterDeathCanvasPropsSchema = z.object({
  accentColor: z.number().min(0),
  animationId: z.string().min(1),
});

const GatheringMonsterDeathCanvas = defineComponent(
  GatheringMonsterDeathCanvasPropsSchema,
  ({ accentColor, animationId }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<GatheringMonsterDeathParticle[] | null>(null);
    if (particlesRef.current === null) {
      particlesRef.current = createGatheringMonsterDeathParticles(animationId);
    }
    const getParticles = () => {
      if (particlesRef.current === null) {
        particlesRef.current = createGatheringMonsterDeathParticles(animationId);
      }
      return particlesRef.current;
    };

    useEffect(() => {
      particlesRef.current = createGatheringMonsterDeathParticles(animationId);
    }, [animationId]);

    usePixiApp(
      canvasRef,
      (app, { reducedMotion }) =>
        setupGatheringMonsterDeathCanvas(app, {
          accentColor,
          animationId,
          particles: getParticles(),
          reducedMotion,
        }),
      [animationId, accentColor],
      { backgroundAlpha: 0, preference: "canvas" },
    );

    return (
      <canvas
        ref={canvasRef}
        data-board-section="gathering-monster-death-canvas"
        data-board-name="Gathering monster death Pixi canvas"
        className="pointer-events-none absolute inset-0 z-30 block size-full touch-none"
      />
    );
  },
);

const GatheringRewardCardFacePropsSchema = z.object({
  card: z.custom<AlchemyBoardCard>(),
  optionIndex: z.int().min(0),
  selected: z.boolean(),
  streakBonus: z.int().min(0),
  streakRarityLabel: z.string(),
});

const GatheringRewardCardFace = defineComponent(
  GatheringRewardCardFacePropsSchema,
  ({ card, optionIndex, selected, streakBonus, streakRarityLabel }) => {
    const totalQuantity = streakBonus + 1;
    const typeBadgeLabel = card.atomicNumber ? "No" : "Kind";
    const typeBadgeValue = card.atomicNumber
      ? String(card.atomicNumber)
      : card.kindLabel.slice(0, 3);
    let bonusFill = "#a8a29e";
    if (streakBonus > 1) {
      bonusFill = "#10b981";
    } else if (streakBonus > 0) {
      bonusFill = "#22c55e";
    }
    const bonusStroke = streakBonus > 0 ? "#065f46" : "#44403c";
    const bonusLabel = streakBonus > 0 ? "Bonus" : "Base";
    const bonusValue = streakBonus > 0 ? `+${streakBonus}` : "x1";

    return (
      <span className="absolute inset-0 block overflow-visible rounded-[8px] bg-transparent">
        <svg
          aria-hidden="true"
          className="absolute inset-0 size-full"
          preserveAspectRatio="none"
          viewBox="0 0 105 148"
        >
          <path
            d="M15 2 H90 C99 2 103 9 103 19 V129 C103 140 97 146 86 146 H19 C8 146 2 140 2 129 V19 C2 9 7 2 15 2Z"
            fill="#2f241d"
          />
          <path
            d="M17 6 H88 C95 6 99 12 99 20 V126 C99 136 94 142 84 142 H21 C11 142 6 136 6 126 V20 C6 12 10 6 17 6Z"
            fill={card.familyColor}
            fillOpacity="0.88"
            stroke="#5f3b1f"
            strokeWidth="2"
          />
          <path
            d="M14 94 C25 102 80 102 91 94 V127 C91 134 87 138 80 138 H25 C18 138 14 134 14 127Z"
            fill="#e3ceb0"
            stroke="#6b4a2b"
            strokeWidth="1.5"
          />
          <path
            d="M18 10 H87 C92 10 95 14 95 20 V35 C75 25 30 25 10 35 V20 C10 14 13 10 18 10Z"
            fill="rgba(255,255,255,0.34)"
          />
          <path
            d="M24 85 H81 L90 94 L81 103 H24 L15 94Z"
            fill="#7a5130"
            stroke="#3f2818"
            strokeWidth="1.4"
          />
        </svg>
        <span
          aria-hidden="true"
          className="absolute left-3 top-3 h-[70px] w-[81px] rounded-t-[42px] rounded-b-[8px] border-2 border-[#3f2818] bg-neutral-950/92 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.13)]"
        >
          <span
            className="absolute inset-0 rounded-t-[40px] rounded-b-[6px] opacity-25"
            style={{ backgroundColor: card.familyColor }}
          />
          {card.imagePath ? (
            <img
              src={getAlchemyCardArtSrc(card)}
              alt=""
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 size-[60px] -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_4px_5px_rgba(0,0,0,0.42)]"
              draggable={false}
            />
          ) : (
            <span className="absolute inset-x-2 top-1/2 -translate-y-1/2 truncate text-center font-mono text-[30px] font-black leading-none text-white drop-shadow-[0_3px_4px_rgba(0,0,0,0.42)]">
              {card.symbol}
            </span>
          )}
        </span>
        <span className="absolute inset-x-[18px] top-[87px] z-10 truncate text-center text-[10px] font-black uppercase leading-none text-white drop-shadow-[0_2px_1px_rgba(0,0,0,0.6)]">
          {card.name}
        </span>
        <span className="absolute inset-x-[15px] bottom-[22px] z-10 grid gap-0.5 text-center text-[9px] font-black uppercase leading-tight text-[#3c2819]">
          <span className="truncate">{card.kindLabel}</span>
          <span className="truncate">{card.detailLabel}</span>
        </span>
        <GatheringMoveCardStatBadge
          className="absolute -left-1 -top-1 z-30 size-10"
          fill="#d97706"
          label="Qty"
          stroke="#78350f"
          value={`+${totalQuantity}`}
          variant="attack"
        />
        {selected ? (
          <span className="pointer-events-none absolute -right-1 -top-1 z-30 grid size-10 place-items-center rounded-full border-2 border-emerald-900 bg-emerald-400 text-emerald-950 shadow-[0_5px_8px_rgba(15,23,42,0.42)]">
            <CheckCircle2 className="size-5" strokeWidth={3} aria-hidden="true" />
          </span>
        ) : (
          <GatheringMoveCardStatBadge
            className="absolute -right-1 -top-1 z-30 size-9"
            fill="#334155"
            label="Pick"
            stroke="#0f172a"
            value={`#${optionIndex + 1}`}
            variant="level"
          />
        )}
        <GatheringMoveCardStatBadge
          className="absolute -bottom-1.5 -left-1.5 z-30 size-10"
          fill="#475569"
          label={typeBadgeLabel}
          stroke="#1e293b"
          value={typeBadgeValue}
          variant="level"
        />
        <GatheringMoveCardStatBadge
          className="absolute -bottom-1.5 -right-2 z-30 h-11 w-[3.35rem]"
          dataBoardSection={streakBonus > 0 ? "gathering-streak-badge" : undefined}
          dataGatheringStreakBonus={streakBonus > 0 ? streakBonus : undefined}
          dataGatheringStreakRarity={streakBonus > 0 ? streakRarityLabel : undefined}
          fill={bonusFill}
          label={bonusLabel}
          stroke={bonusStroke}
          value={bonusValue}
          variant="counter"
        />
      </span>
    );
  },
);

const GatheringRewardCardPropsSchema = z.object({
  cardId: z.string().min(1),
  onSelect: z.custom<GatheringRewardSelectHandler>(),
  // The demand-ordered slot (0 = primary / most quest-demanded) and the live
  // streak together resolve this option's +N bonus + rarity tint for the badge.
  optionIndex: z.int().min(0),
  selected: z.boolean(),
  streak: z.custom<AlchemistGuildGatheringStreak>(),
});

const GatheringRewardCard = defineComponent(
  GatheringRewardCardPropsSchema,
  ({ cardId, onSelect, optionIndex, selected, streak }) => {
    const card = getAlchemyCard(cardId);
    if (!card) return null;

    const streakBonus = streakBonusForOptionIndex(streak.current, optionIndex);
    const streakRarityLabel = streakRarity(streak.current);
    const totalQuantity = streakBonus + 1;

    return (
      <button
        type="button"
        data-board-section="gathering-reward-card"
        data-board-name={`${card.name} gathering reward`}
        data-card-id={card.id}
        data-gathering-reward-selected={selected ? "true" : "false"}
        className={`absolute inset-0 z-10 select-none overflow-visible rounded-[8px] border-0 bg-transparent p-0 text-left shadow-[0_8px_18px_rgba(0,0,0,0.18)] transition-[filter,opacity,transform] duration-150 ${
          selected
            ? "cursor-pointer ring-4 ring-emerald-400/70 ring-offset-2 ring-offset-white/40"
            : "cursor-pointer hover:-translate-y-0.5 hover:brightness-105 active:scale-[0.985]"
        }`}
        aria-label={
          selected
            ? `Confirm ${card.name}, ${totalQuantity} total reward cards`
            : `Select ${card.name}, ${totalQuantity} total reward cards`
        }
        aria-pressed={selected}
        onClick={() => onSelect(card.id)}
      >
        <GatheringRewardCardFace
          card={card}
          optionIndex={optionIndex}
          selected={selected}
          streakBonus={streakBonus}
          streakRarityLabel={streakRarityLabel}
        />
        {selected ? (
          <span className="pointer-events-none absolute inset-x-3 bottom-2 z-40 grid min-h-7 place-items-center rounded-[5px] border border-emerald-950/30 bg-emerald-400 px-2 text-center text-[10px] font-black uppercase leading-none text-emerald-950 shadow-[0_8px_18px_rgba(15,23,42,0.22)]">
            Confirm
          </span>
        ) : null}
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
      <div className="absolute inset-0 grid place-items-center rounded-[3px] text-neutral-950">
        <span className="text-5xl font-black leading-none">{card.value}</span>
        <span className="absolute bottom-3 left-2 right-2 truncate text-center text-[10px] font-black uppercase leading-none text-neutral-600">
          Answer
        </span>
      </div>
    );
  }

  if (card.kind === "move") {
    return (
      <span className="absolute inset-0 overflow-visible rounded-[8px]">
        <GatheringMoveCardFace enemyElement={card.enemyElement} move={card.move} />
      </span>
    );
  }

  return null;
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
      <div className="grid h-full min-h-0 content-start gap-2 overflow-hidden">
        {entries.length === 0 ? (
          <p className="rounded-[6px] border border-neutral-900/10 bg-white/55 px-3 py-2 text-sm font-bold leading-snug text-neutral-700">
            New drops will land here after each reward pick.
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
    <div
      data-board-section="gathering-log-row"
      data-board-name={`${card.name} gathering log row`}
      className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-2 rounded-[6px] border border-neutral-900/10 bg-white/70 p-1.5 shadow-[0_4px_12px_rgba(15,23,42,0.08)]"
    >
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

const GatheringSessionReviewModalPropsSchema = z.object({
  depositing: z.boolean(),
  entries: z.array(z.custom<AlchemistGuildGatheringLogEntry>()),
  onConfirm: z.custom<() => void>(),
  onStay: z.custom<() => void>(),
});

const GatheringSessionReviewModal = defineComponent(
  GatheringSessionReviewModalPropsSchema,
  ({ depositing, entries, onConfirm, onStay }) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const rewardSummaries = createGatheringSessionRewardSummaries(entries);
    const totalCount = rewardSummaries.reduce((total, summary) => total + summary.count, 0);
    const totalCountLabel = `${totalCount} reward${totalCount === 1 ? "" : "s"} will be logged into your workshop.`;
    const footerCopy = depositing ? "Sending rewards to the workshop..." : totalCountLabel;

    useBrowserLayoutEffect(() => {
      const dialogElement = dialogRef.current;
      if (!dialogElement) return;
      if (!dialogElement.open) dialogElement.showModal();

      return () => {
        if (dialogElement.open) dialogElement.close();
      };
    }, []);

    useBrowserLayoutEffect(() => {
      const dialogElement = dialogRef.current;
      if (!dialogElement || depositing || prefersReducedMotion()) return;

      const animation = animate(dialogElement, {
        duration: 260,
        ease: "out(3)",
        opacity: [0, 1],
        scale: [0.96, 1],
        y: [18, 0],
      });

      return () => {
        animation.cancel();
      };
    }, [depositing]);

    return (
      <dialog
        ref={dialogRef}
        aria-labelledby="gathering-session-review-title"
        data-board-section="gathering-session-review-modal"
        data-gathering-session-depositing={depositing ? "true" : "false"}
        className="m-auto max-h-[min(42rem,calc(100vh_-_2rem))] w-[min(36rem,calc(100vw_-_2rem))] overflow-hidden rounded-[8px] border border-emerald-900/25 bg-[#f7f7f7] p-0 text-neutral-950 shadow-[0_24px_60px_rgba(15,23,42,0.36)] backdrop:bg-neutral-950/42 backdrop:backdrop-blur-sm"
        onCancel={(event) => {
          event.preventDefault();
          if (!depositing) onStay();
        }}
      >
        <div className="grid max-h-[min(42rem,calc(100vh_-_2rem))] grid-rows-[auto_minmax(0,1fr)_auto] gap-4 p-4">
          <div className="grid gap-1">
            <p className="text-xs font-black uppercase leading-none text-emerald-900">
              Gathering Session
            </p>
            <h2
              id="gathering-session-review-title"
              className="font-serif text-2xl font-black leading-tight"
            >
              Rewards Ready
            </h2>
            <p className="text-sm font-semibold leading-snug text-neutral-700">
              Here are your rewards for this gathering session.
            </p>
          </div>

          <div className="min-h-0 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {rewardSummaries.map((summary) => (
                <div
                  key={summary.cardId}
                  data-gathering-session-reward-card={summary.cardId}
                  className="relative grid min-h-[9.25rem] grid-rows-[1fr_auto] overflow-hidden rounded-[6px] border-2 border-emerald-700/40 bg-white shadow-[0_10px_22px_rgba(15,23,42,0.12)]"
                >
                  <span
                    className="grid min-h-20 place-items-center border-b border-neutral-900/10 px-2 text-center text-3xl font-black leading-none text-neutral-950"
                    style={{ backgroundColor: summary.card.familyColor }}
                  >
                    {summary.card.symbol}
                  </span>
                  <span className="grid gap-1 p-2 text-center">
                    <span className="truncate text-sm font-black leading-tight">
                      {summary.card.name}
                    </span>
                    <span className="text-[10px] font-black uppercase leading-none text-neutral-600">
                      Round {summary.latestRound}
                    </span>
                  </span>
                  <span className="absolute right-2 top-2 rounded-full border border-emerald-900/25 bg-emerald-50 px-2 py-1 text-xs font-black leading-none text-emerald-950 shadow-[0_4px_10px_rgba(15,23,42,0.16)]">
                    x{summary.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 border-t border-neutral-900/10 pt-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
            <p className="text-sm font-bold leading-snug text-neutral-700">{footerCopy}</p>
            <button
              type="button"
              disabled={depositing}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] border border-neutral-900/15 bg-white px-4 py-2 text-sm font-black text-neutral-800 shadow-[0_2px_0_rgba(15,23,42,0.14)] transition-[background-color,opacity,transform] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45"
              onClick={onStay}
            >
              <Pickaxe className="size-4" strokeWidth={2.5} aria-hidden="true" />
              Stay Gathering
            </button>
            <button
              type="button"
              disabled={depositing}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] border border-emerald-950/20 bg-emerald-500 px-4 py-2 text-sm font-black text-emerald-950 shadow-[0_2px_0_rgba(15,23,42,0.2)] transition-[background-color,opacity,transform] hover:bg-emerald-400 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45"
              onClick={onConfirm}
            >
              <CheckCircle2 className="size-4" strokeWidth={2.8} aria-hidden="true" />
              Confirm to Crafting
            </button>
          </div>
        </div>
      </dialog>
    );
  },
);

// Floating "-N" damage number that pops off the enemy health bar on each hit —
// surprise-and-delight feedback layered on top of the existing vignette + shake.
// The magnitude → tier mapping is pure/tested in ./gathering-damage-floater; the
// anime.js arc and Tailwind styling live here. prefers-reduced-motion suppresses
// spawning entirely (see the spawn effect in GatheringMonsterPanel), so this
// component only ever mounts with motion enabled.
const GATHERING_DAMAGE_FLOATER_DURATION_MS = 920;
const GATHERING_DAMAGE_FLOATER_DRIFT_MIN_PX = -34;
const GATHERING_DAMAGE_FLOATER_DRIFT_MAX_PX = 34;
const GATHERING_DAMAGE_FLOATER_TILT_MIN_DEG = -12;
const GATHERING_DAMAGE_FLOATER_TILT_MAX_DEG = 12;

// Tiers escalate physical bigness + warmth so a pre-reader feels how hard the hit
// landed. Colors stay in the gold/orange family — never red — because red is
// already owned by the hit vignette; the number reads as agentive reward ("MY
// hit"), not environmental hurt. The fat white text-stroke keeps it legible over
// busy monster art.
const GATHERING_DAMAGE_FLOATER_TIER_CLASS: Record<GatheringDamageFloaterTier, string> = {
  big: "text-4xl font-extrabold text-orange-300 [text-shadow:0_2px_0_rgba(124,45,18,0.6),0_0_14px_rgba(251,146,60,0.6)] [-webkit-text-stroke:2.5px_white]",
  crit: "text-5xl font-black text-yellow-200 [text-shadow:0_3px_0_rgba(180,83,9,0.7),0_0_20px_rgba(253,224,71,0.9)] [-webkit-text-stroke:3px_white]",
  normal:
    "text-3xl font-extrabold text-amber-200 [text-shadow:0_2px_0_rgba(180,83,9,0.55)] [-webkit-text-stroke:2px_white]",
};

type GatheringDamageFloaterInstance = {
  amount: number;
  driftX: number;
  id: string;
  tier: GatheringDamageFloaterTier;
  tilt: number;
};

const GatheringDamageFloaterPropsSchema = z.object({
  amount: z.int().positive(),
  driftX: z.number(),
  onDone: z.custom<() => void>(),
  tier: GatheringDamageFloaterTierSchema,
  tilt: z.number(),
});

const GatheringDamageFloater = defineComponent(
  GatheringDamageFloaterPropsSchema,
  ({ amount, driftX, onDone, tier, tilt }) => {
    const floaterRef = useRef<HTMLSpanElement | null>(null);
    const onDoneRef = useRef(onDone);

    useEffect(() => {
      onDoneRef.current = onDone;
    }, [onDone]);

    useBrowserLayoutEffect(() => {
      const floaterElement = floaterRef.current;
      if (!floaterElement) return;
      // Spawning is already gated on motion in the parent, but a floater that
      // somehow mounts under reduced motion must still self-remove from state.
      if (prefersReducedMotion()) {
        onDoneRef.current();
        return;
      }
      floaterElement.style.willChange = "opacity, transform";
      // Springy pop (overshoot baked into the scale keyframes) then a gentle arc
      // up over the art with randomized horizontal drift + a micro-tilt so
      // repeated hits never feel stamped. y peaks at -72px — within the art
      // region above the bar, so it never clips on the 208px card.
      const animation = animate(floaterElement, {
        duration: GATHERING_DAMAGE_FLOATER_DURATION_MS,
        ease: "out(3)",
        opacity: [0, 1, 1, 1, 0],
        rotate: [0, 0, tilt],
        scale: [0.5, 1.35, 1, 0.96],
        x: [0, driftX * 0.65, driftX, driftX],
        y: [8, -46, -72, -64],
        onComplete: () => {
          onDoneRef.current();
        },
      });
      return () => {
        animation.cancel();
      };
    }, [driftX, tilt]);

    return (
      <span
        ref={floaterRef}
        aria-hidden="true"
        data-board-section="gathering-damage-floater"
        data-gathering-damage-tier={tier}
        className={`pointer-events-none absolute inset-x-0 bottom-9 z-30 select-none text-center leading-none tabular-nums ${GATHERING_DAMAGE_FLOATER_TIER_CLASS[tier]}`}
      >
        {formatGatheringDamageFloaterLabel(amount, tier)}
      </span>
    );
  },
);

// The Celestial double-reward shader. When a 50+ streak drops a bonus element,
// an aurora chip (the element's symbol) pops near the loot and flies up into the
// supplies. Mounted keyed by id so each bonus replays from scratch; it's pure
// decoration over the real grant, so reduced motion shows it briefly then clears.
type CelestialBonusFly = {
  id: string;
  name: string;
  symbol: string;
};

const GatheringCelestialBonusFlyPropsSchema = z.object({
  bonus: z.custom<CelestialBonusFly>(),
  onDone: z.custom<() => void>(),
});

const GatheringCelestialBonusFly = defineComponent(
  GatheringCelestialBonusFlyPropsSchema,
  ({ bonus, onDone }) => {
    const chipRef = useRef<HTMLDivElement | null>(null);
    const onDoneRef = useRef(onDone);
    useEffect(() => {
      onDoneRef.current = onDone;
    }, [onDone]);

    useBrowserLayoutEffect(() => {
      const chip = chipRef.current;
      if (!chip || prefersReducedMotion()) {
        const timer = window.setTimeout(() => onDoneRef.current(), 700);
        return () => window.clearTimeout(timer);
      }
      chip.style.willChange = "opacity, transform";
      // A springy pop near the loot, then a long rise as it "joins" the supplies.
      const animation = animate(chip, {
        duration: 1150,
        ease: "out(3)",
        opacity: [0, 1, 1, 0],
        rotate: [0, -7, 5, 0],
        scale: [0.4, 1.3, 1, 0.66],
        y: [48, -8, -132, -224],
        onComplete: () => onDoneRef.current(),
      });
      return () => animation.cancel();
    }, []);

    return (
      <div
        aria-hidden="true"
        data-board-section="gathering-celestial-bonus-fly"
        className="pointer-events-none fixed inset-x-0 bottom-1/3 z-[130] grid place-items-center"
      >
        <div
          ref={chipRef}
          className="gathering-celestial-bonus-chip grid place-items-center rounded-2xl border-2 border-white/75 px-4 py-3 text-center shadow-[0_10px_34px_rgba(34,211,238,0.55),0_0_24px_rgba(232,121,249,0.5)]"
        >
          <span className="text-3xl font-black leading-none text-white [text-shadow:0_2px_10px_rgba(217,70,239,0.85)]">
            {bonus.symbol}
          </span>
          <span className="mt-1 text-[10px] font-black uppercase tracking-wide text-cyan-50">
            +1 {bonus.name}
          </span>
        </div>
      </div>
    );
  },
);

const GatheringMonsterPanelPropsSchema = z.object({
  // The move card currently being held/charged (null when nothing is charging).
  // Drives the inset charge-glow on the layer the enemy card sits in.
  chargingMoveId: z.custom<GatheringMoveId | null>(),
  deathAnimation: z.custom<GatheringMonsterDeathAnimation | null>(),
  deathCompletedRound: z.number().nullable(),
  gatheringDropTarget: z.custom<GatheringDropTarget>(),
  gathering: z.custom<AlchemistGuildGatheringState>(),
  onDeathAnimationComplete: z.custom<GatheringMonsterDeathCompleteHandler>(),
});

const GatheringMonsterPanel = defineComponent(
  GatheringMonsterPanelPropsSchema,
  ({
    chargingMoveId,
    deathAnimation,
    deathCompletedRound,
    gathering,
    gatheringDropTarget,
    onDeathAnimationComplete,
  }) => {
    const hpPercent = Math.round((gathering.monster.hp / gathering.monster.maxHp) * 100);
    // Enemies with a generated 3D model show it in place of the 2D portrait. Resolve
    // off imagePath so the poster variant (_L1/_L2/_L3) selects its matching model.
    const monsterModelPath = getGatheringEnemyModelPath(gathering.monster.imagePath);
    const monsterDropActive = gatheringDropTarget === "monster-panel";
    const monsterElementUi = gatheringElementUi[gathering.monster.elementType];
    const weaknessElement = gatheringCounterElementFor(gathering.monster.elementType);
    const weaknessElementUi = gatheringElementUi[weaknessElement];
    const chargeGlowStyle: FloatingGatheringCardStyle | undefined = chargingMoveId
      ? {
          "--gathering-charge-duration-ms": `${getGatheringAttackChargeProfile(chargingMoveId).rampCapMs}ms`,
        }
      : undefined;
    const monsterCardRef = useRef<HTMLElement | null>(null);
    const monsterDamageVignetteRef = useRef<HTMLSpanElement | null>(null);
    const onDeathAnimationCompleteRef = useRef(onDeathAnimationComplete);
    const previousMonsterHitRef = useRef({
      hp: gathering.monster.hp,
      round: gathering.round,
    });
    const previousFloaterHitRef = useRef({
      hp: gathering.monster.hp,
      round: gathering.round,
    });
    const damageFloaterIdRef = useRef(0);
    const [damageFloaters, setDamageFloaters] = useState<GatheringDamageFloaterInstance[]>([]);
    const monsterDefeated =
      gathering.phase === "reward" &&
      gathering.monster.hp <= 0 &&
      deathCompletedRound === gathering.round &&
      !deathAnimation;

    useEffect(() => {
      onDeathAnimationCompleteRef.current = onDeathAnimationComplete;
    }, [onDeathAnimationComplete]);

    useBrowserLayoutEffect(() => {
      if (!deathAnimation) return;

      const monsterCardElement = monsterCardRef.current;
      if (!monsterCardElement || prefersReducedMotion()) {
        onDeathAnimationCompleteRef.current(deathAnimation.id, deathAnimation.round);
        return;
      }

      monsterCardElement.style.transformOrigin = "50% 62%";
      monsterCardElement.style.willChange = "filter, opacity, transform";
      const animation = animate(monsterCardElement, {
        duration: GATHERING_MONSTER_DEATH_DURATION_MS,
        ease: "inOut(3)",
        filter: [
          "brightness(1) saturate(1)",
          "brightness(1.28) saturate(1.3)",
          "brightness(0.76) saturate(0.48)",
        ],
        opacity: [1, 0.18],
        rotate: ["0deg", "-4deg", "13deg"],
        scale: [1, 1.04, 0.86],
        y: [0, -8, 18],
        onComplete: () => {
          onDeathAnimationCompleteRef.current(deathAnimation.id, deathAnimation.round);
        },
      });

      return () => {
        animation.cancel();
        monsterCardElement.style.removeProperty("filter");
        monsterCardElement.style.removeProperty("opacity");
        monsterCardElement.style.removeProperty("transform");
        monsterCardElement.style.removeProperty("transform-origin");
        monsterCardElement.style.removeProperty("will-change");
      };
    }, [deathAnimation]);

    useBrowserLayoutEffect(() => {
      const previousHit = previousMonsterHitRef.current;
      previousMonsterHitRef.current = {
        hp: gathering.monster.hp,
        round: gathering.round,
      };

      const tookDamage =
        previousHit.round === gathering.round &&
        gathering.monster.hp < previousHit.hp &&
        gathering.monster.hp > 0;
      if (!tookDamage || deathAnimation || prefersReducedMotion()) return;

      const monsterCardElement = monsterCardRef.current;
      const damageVignetteElement = monsterDamageVignetteRef.current;
      if (!monsterCardElement || !damageVignetteElement) return;

      monsterCardElement.style.transformOrigin = "50% 54%";
      monsterCardElement.style.willChange = "filter, transform";
      damageVignetteElement.style.willChange = "opacity, transform";

      const cleanupHitStyles = () => {
        monsterCardElement.style.removeProperty("filter");
        monsterCardElement.style.removeProperty("transform");
        monsterCardElement.style.removeProperty("transform-origin");
        monsterCardElement.style.removeProperty("will-change");
        damageVignetteElement.style.removeProperty("opacity");
        damageVignetteElement.style.removeProperty("transform");
        damageVignetteElement.style.removeProperty("will-change");
      };
      const cardAnimation = animate(monsterCardElement, {
        duration: 310,
        ease: "out(3)",
        filter: [
          "brightness(1) saturate(1)",
          "brightness(1.18) saturate(1.34)",
          "brightness(1) saturate(1)",
        ],
        rotate: ["0deg", "-1.6deg", "1.25deg", "-0.75deg", "0deg"],
        x: [0, -7, 6, -4, 0],
      });
      const vignetteAnimation = animate(damageVignetteElement, {
        duration: 340,
        ease: "out(2)",
        opacity: [0, 0.82, 0],
        scale: [0.96, 1.04, 1],
        onComplete: cleanupHitStyles,
      });

      return () => {
        cardAnimation.cancel();
        vignetteAnimation.cancel();
        cleanupHitStyles();
      };
    }, [deathAnimation, gathering.monster.hp, gathering.round]);

    useBrowserLayoutEffect(() => {
      const previousFloaterHit = previousFloaterHitRef.current;
      previousFloaterHitRef.current = {
        hp: gathering.monster.hp,
        round: gathering.round,
      };

      // A same-round HP drop means a hit landed. Unlike the vignette/shake above,
      // the floater DOES fire on the killing blow (hp -> 0): the final "-N!" is
      // the fight's payoff and flies off over the death animation.
      const damageDealt =
        previousFloaterHit.round === gathering.round &&
        gathering.monster.hp < previousFloaterHit.hp;
      if (!damageDealt || prefersReducedMotion()) return;

      const amount = previousFloaterHit.hp - gathering.monster.hp;
      const tier = resolveGatheringDamageFloaterTier(
        amount,
        gathering.monster.maxHp,
        gathering.monster.hp <= 0,
      );
      damageFloaterIdRef.current += 1;
      const driftRange =
        GATHERING_DAMAGE_FLOATER_DRIFT_MAX_PX - GATHERING_DAMAGE_FLOATER_DRIFT_MIN_PX;
      const tiltRange =
        GATHERING_DAMAGE_FLOATER_TILT_MAX_DEG - GATHERING_DAMAGE_FLOATER_TILT_MIN_DEG;
      const floater: GatheringDamageFloaterInstance = {
        amount,
        driftX: GATHERING_DAMAGE_FLOATER_DRIFT_MIN_PX + Math.random() * driftRange,
        id: `gathering-damage-${damageFloaterIdRef.current}`,
        tier,
        tilt: GATHERING_DAMAGE_FLOATER_TILT_MIN_DEG + Math.random() * tiltRange,
      };
      setDamageFloaters((current) => [...current, floater]);
    }, [gathering.monster.hp, gathering.monster.maxHp, gathering.round]);

    const handleDamageFloaterDone = (id: string) => {
      setDamageFloaters((current) => current.filter((entry) => entry.id !== id));
    };

    return (
      <div className="relative grid h-full min-h-0 place-items-center [isolation:isolate]">
        {chargingMoveId ? (
          <span
            key={chargingMoveId}
            aria-hidden="true"
            data-board-section="gathering-enemy-charge-glow"
            data-gathering-charge-move={chargingMoveId}
            className="gathering-enemy-charge-glow pointer-events-none absolute inset-2 -z-10 rounded-[14px]"
            style={chargeGlowStyle}
          />
        ) : null}
        {monsterDefeated ? (
          <div
            data-board-section="gathering-monster-cleared-slot"
            data-board-name={`${gathering.monster.name} cleared`}
            className="grid h-[20.625rem] w-[13rem] place-items-center rounded-[7px] border-2 border-dashed border-emerald-600/45 bg-emerald-50/45 p-2 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
          >
            <span className="grid gap-2">
              <span className="text-sm font-black uppercase leading-none text-emerald-950">
                Cleared
              </span>
              <span className="text-xs font-bold leading-snug text-emerald-900/75">
                Pick a reward card.
              </span>
            </span>
          </div>
        ) : (
          <article
            ref={monsterCardRef}
            data-gathering-drop-target="monster-panel"
            data-gathering-drop-active={monsterDropActive ? "true" : undefined}
            data-gathering-monster-death-active={deathAnimation ? "true" : "false"}
            data-board-section="gathering-monster-card"
            data-board-name={gathering.monster.name}
            className={`relative h-[19rem] w-[13rem] overflow-visible rounded-[10px] p-0 text-neutral-950 shadow-[0_14px_28px_rgba(15,23,42,0.2)] transition-[filter,box-shadow,transform] duration-150 ${
              monsterDropActive
                ? "scale-[1.02] ring-4 ring-sky-400/45 drop-shadow-[0_0_16px_rgba(14,165,233,0.38)]"
                : ""
            }`}
          >
            <svg
              aria-hidden="true"
              className="absolute inset-0 size-full"
              preserveAspectRatio="none"
              viewBox="0 0 208 330"
            >
              <path
                d="M28 4 H180 C197 4 204 17 204 34 V300 C204 318 194 326 176 326 H32 C14 326 4 318 4 300 V34 C4 17 11 4 28 4Z"
                fill="#2f241d"
              />
              <path
                d="M31 11 H177 C191 11 197 22 197 36 V296 C197 311 189 319 173 319 H35 C19 319 11 311 11 296 V36 C11 22 17 11 31 11Z"
                fill={monsterElementUi.frameFill}
                stroke={monsterElementUi.frameStroke}
                strokeWidth="4"
              />
              <path
                d="M22 240 C48 258 160 258 186 240 V294 C186 307 179 313 165 313 H43 C29 313 22 307 22 294Z"
                fill="#e3ceb0"
                stroke="#6b4a2b"
                strokeWidth="2.4"
              />
              <path
                d="M36 19 H172 C184 19 190 29 190 40 V78 C150 54 58 54 18 78 V40 C18 29 24 19 36 19Z"
                fill="rgba(255,255,255,0.28)"
              />
              <path
                d="M42 234 H166 L187 252 L166 270 H42 L21 252Z"
                fill="#7a5130"
                stroke="#3f2818"
                strokeWidth="2"
              />
            </svg>
            <div className="relative z-10 grid h-full grid-rows-[minmax(0,1fr)_auto] gap-1.5 p-2.5">
              <div
                className={`relative min-h-0 overflow-hidden rounded-t-[92px] rounded-b-[12px] border-[3px] border-[#3f2818] bg-gradient-to-b shadow-[inset_0_0_0_2px_rgba(255,255,255,0.12),0_7px_14px_rgba(15,23,42,0.28)] ${monsterElementUi.auraClass}`}
              >
                {monsterModelPath ? (
                  <GlbMonsterViewer
                    label={gathering.monster.name}
                    modelUrl={resolvePublicAssetPath(monsterModelPath)}
                  />
                ) : (
                  <img
                    src={resolvePublicAssetPath(gathering.monster.imagePath)}
                    alt=""
                    aria-hidden="true"
                    className="size-full object-cover"
                    draggable={false}
                  />
                )}
                <span
                  ref={monsterDamageVignetteRef}
                  className="pointer-events-none absolute inset-0 z-20 rounded-t-[89px] rounded-b-[9px] bg-[radial-gradient(circle_at_50%_45%,transparent_40%,rgba(239,68,68,0.44)_72%,rgba(127,29,29,0.72)_100%)] opacity-0 mix-blend-multiply"
                  aria-hidden="true"
                />
                {deathAnimation ? (
                  <GatheringMonsterDeathCanvas
                    accentColor={0x14b8a6}
                    animationId={deathAnimation.id}
                  />
                ) : null}
              </div>
              <div className="relative grid gap-1 rounded-[6px] border border-[#6b4a2b] bg-[#e3ceb0] px-2 pb-1.5 pt-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]">
                <span className="pointer-events-none absolute inset-x-3 -top-2.5 z-10 rounded-[5px] border border-[#3f2818] bg-[#7a5130] px-2 py-1 text-center text-[11px] font-black uppercase leading-none text-white shadow-[0_3px_5px_rgba(15,23,42,0.28)]">
                  {gathering.monster.name}
                </span>
                <p
                  data-board-section="gathering-monster-weakness"
                  className="text-center text-[10px] font-black uppercase leading-tight text-[#3c2819]"
                >
                  {monsterElementUi.label} enemy · weak to {weaknessElementUi.label}
                </p>
                <div className="h-3 overflow-hidden rounded-full border border-[#3c2819]/35 bg-[#bca17b]">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-[width] duration-200"
                    style={{ width: `${hpPercent}%` }}
                  />
                </div>
                <p className="text-center text-[10px] font-black uppercase leading-none text-[#3c2819]/80">
                  {gathering.monster.hp} / {gathering.monster.maxHp} HP
                </p>
              </div>
            </div>
            <GatheringMoveCardStatBadge
              className="absolute left-1 top-1 z-30 size-11"
              fill={monsterElementUi.gemFill}
              label="Enemy"
              stroke={monsterElementUi.gemStroke}
              value={monsterElementUi.glyph}
              variant="level"
            />
            <GatheringMoveCardStatBadge
              className="absolute bottom-1 left-1 z-30 size-11"
              fill="#dc2626"
              label="HP"
              stroke="#7f1d1d"
              value={String(gathering.monster.hp)}
              variant="attack"
            />
            <GatheringMoveCardStatBadge
              className="absolute bottom-1 right-1 z-30 h-11 w-[3.35rem]"
              fill={weaknessElementUi.gemFill}
              label="Weak"
              stroke={weaknessElementUi.gemStroke}
              value={weaknessElementUi.glyph}
              variant="counter"
            />
            {damageFloaters.map((floater) => (
              <GatheringDamageFloater
                key={floater.id}
                amount={floater.amount}
                driftX={floater.driftX}
                onDone={() => handleDamageFloaterDone(floater.id)}
                tier={floater.tier}
                tilt={floater.tilt}
              />
            ))}
          </article>
        )}
      </div>
    );
  },
);

const GatheringInfoPanelPropsSchema = z.object({
  gathering: z.custom<AlchemistGuildGatheringState>(),
});

const GatheringInfoPanel = defineComponent(GatheringInfoPanelPropsSchema, ({ gathering }) => (
  <>
    <div className="grid h-full content-start gap-2">
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

const QuestDeliveryItemSchema = z.object({
  card: z.custom<AlchemyBoardCard>(),
  delivered: z.int().min(0),
  required: z.int().min(1),
});
const QuestDeliveryPagerPropsSchema = z.object({
  canClaim: z.boolean(),
  claimProgress: z.number().min(0).max(1),
  complete: z.boolean(),
  dropFeedback: z.custom<DropFeedback>(),
  isClaimDragging: z.boolean(),
  items: z.array(QuestDeliveryItemSchema).min(1),
  onClaimPointerDown: z.custom<(event: ReactPointerEvent<HTMLButtonElement>) => void>(),
  questId: z.string().min(1),
  requesterName: z.string().min(1),
});

// One drop-zone page per deliverable. Dots (one per item) show which parts are in;
// when every part is delivered, the swipe-to-deliver claim slider appears. The drop
// itself auto-routes (any matching card delivers to its part), so the active page is
// purely a view — see `isQuestDeliveryAccepted`.
const QuestDeliveryPager = defineComponent(
  QuestDeliveryPagerPropsSchema,
  ({
    canClaim,
    claimProgress,
    complete,
    dropFeedback,
    isClaimDragging,
    items,
    onClaimPointerDown,
    questId,
    requesterName,
  }) => {
    const [activePage, setActivePage] = useState(0);
    const pageCount = items.length;
    const safePage = activePage < pageCount ? activePage : pageCount - 1;
    const activeItem = items[safePage] ?? items[0];
    if (!activeItem) return null;

    const activeDelivered = Math.min(activeItem.delivered, activeItem.required);
    const activeItemComplete = activeDelivered >= activeItem.required;
    const claimKnobLeft = `calc(${QUEST_CLAIM_TRACK_PADDING_PX}px + ${
      claimProgress * 100
    }% - ${claimProgress * (QUEST_CLAIM_KNOB_WIDTH_PX + QUEST_CLAIM_TRACK_PADDING_PX * 2)}px)`;

    return (
      <div className="grid gap-2" data-board-section="quest-delivery-pager" data-quest-id={questId}>
        <section
          key={activeItem.card.id}
          data-board-section="quest-delivery-drop-zone"
          data-board-name={`${activeItem.card.name} quest delivery`}
          data-card-id={activeItem.card.id}
          data-quest-id={questId}
          data-delivery-complete={activeItemComplete ? "true" : "false"}
          data-drop-feedback={dropFeedback}
          className={getQuestDeliverySlotClass(dropFeedback, activeItemComplete, false)}
          aria-label={`Deliver ${activeItem.required} ${activeItem.card.name} card${activeItem.required === 1 ? "" : "s"} to ${requesterName}`}
        >
          <div className={getQuestDeliveryClaimTrackClass(activeItemComplete)}>
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-emerald-300/40 transition-[width] duration-150"
              style={{ width: activeItemComplete ? "100%" : "0%" }}
              aria-hidden="true"
            />
            <span className="pointer-events-none absolute inset-y-0 left-3 right-3 z-10 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <span className="min-w-0">
                <span className="block truncate text-[9px] font-black uppercase leading-none tracking-normal text-amber-950/65">
                  {activeItemComplete ? "Delivered" : "Drop here"}
                </span>
                <span className="mt-0.5 block truncate text-sm font-black leading-tight text-amber-950">
                  {activeItem.card.name}
                </span>
              </span>
              <span className="rounded-full border border-amber-900/25 bg-white/78 px-2 py-1 font-mono text-xs font-black leading-none text-amber-950 shadow-[0_1px_0_rgba(72,45,16,0.1)]">
                {activeDelivered}/{activeItem.required}
              </span>
            </span>
          </div>
        </section>

        {pageCount > 1 ? (
          <div
            role="tablist"
            aria-label="Quest delivery parts"
            className="flex items-center justify-center gap-1.5"
          >
            {items.map((item, index) => {
              const itemComplete = item.delivered >= item.required;
              return (
                <button
                  key={item.card.id}
                  type="button"
                  role="tab"
                  aria-selected={index === safePage}
                  aria-label={`${item.card.name}${itemComplete ? " — delivered" : ""}`}
                  data-quest-delivery-dot=""
                  data-delivered={itemComplete ? "true" : "false"}
                  data-active={index === safePage ? "true" : "false"}
                  className={`size-3 rounded-full border transition-colors ${
                    itemComplete
                      ? "border-emerald-700 bg-emerald-500"
                      : "border-amber-800/45 bg-white/80"
                  } ${index === safePage ? "ring-2 ring-amber-500/55 ring-offset-1" : ""}`}
                  onClick={() => {
                    setActivePage(index);
                  }}
                />
              );
            })}
          </div>
        ) : null}

        {complete ? (
          <div
            data-board-section="quest-claim-swipe"
            data-claim-locked="false"
            className={getQuestDeliveryClaimTrackClass(true)}
          >
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-emerald-300/45 transition-[width] duration-75"
              style={{ width: `${Math.round(claimProgress * 100)}%` }}
              aria-hidden="true"
            />
            <span className="pointer-events-none absolute inset-y-0 left-3 right-3 z-10 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <span className="min-w-0 pl-[4.85rem]">
                <span className="block truncate text-[9px] font-black uppercase leading-none tracking-normal text-amber-950/65">
                  All parts ready
                </span>
                <span className="mt-0.5 block truncate text-sm font-black leading-tight text-amber-950">
                  Swipe to deliver to {requesterName}
                </span>
              </span>
            </span>
            <button
              type="button"
              data-quest-claim-knob=""
              tabIndex={canClaim ? 0 : -1}
              aria-label={`Swipe to deliver to ${requesterName}`}
              className={`absolute top-1/2 z-20 grid h-8 -translate-y-1/2 touch-none select-none place-items-center rounded-full border shadow-[0_5px_14px_rgba(72,45,16,0.22)] transition-[background-color,border-color,opacity] ${
                canClaim
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
              onPointerDown={canClaim ? onClaimPointerDown : undefined}
            >
              <ChevronUp className="size-5 rotate-90" strokeWidth={2.75} />
            </button>
          </div>
        ) : null}
      </div>
    );
  },
);

const QuestPanelPropsSchema = z.object({
  activeQuestIds: z.array(z.string().min(1)),
  activeTab: QuestPanelTabSchema,
  avatarPath: z.string().min(1),
  canClaim: z.boolean(),
  claimedQuestIds: z.array(z.string().min(1)),
  claimProgress: z.number().min(0).max(1),
  deliveryComplete: z.boolean(),
  deliveryDropFeedback: z.custom<DropFeedback>(),
  deliveryItems: z.array(QuestDeliveryItemSchema),
  developerNotesVisible: z.boolean(),
  hasQuestNotifications: z.boolean(),
  isClaimDragging: z.boolean(),
  onClaimPointerDown: z.custom<(event: ReactPointerEvent<HTMLButtonElement>) => void>(),
  onPlayerNameChange: z.custom<(nextPlayerName: string) => void>(),
  onQuestLogScrollTopChange: z.custom<(scrollTop: number) => void>(),
  onQuestOpenFromLog: z.custom<(questId: string) => void>(),
  onQuestSelect: z.custom<(questId: string) => void>(),
  onTabChange: z.custom<(tab: QuestPanelTab) => void>(),
  playerName: z.string().min(1),
  profileStats: z.array(QuestProfileStatSchema).min(1),
  questAssemblyGuide: z.custom<QuestAssemblyGuide | null>(),
  questLogScrollTop: z.number().min(0),
  selectedQuestId: z.string().min(1),
  title: z.string().min(1),
  unlockedQuestIds: z.array(z.string().min(1)),
});

const QuestPanel = defineComponent(
  QuestPanelPropsSchema,
  ({
    activeQuestIds,
    activeTab,
    avatarPath,
    canClaim,
    claimedQuestIds,
    claimProgress,
    deliveryComplete,
    deliveryDropFeedback,
    deliveryItems,
    developerNotesVisible,
    hasQuestNotifications,
    isClaimDragging,
    onClaimPointerDown,
    onPlayerNameChange,
    onQuestLogScrollTopChange,
    onQuestOpenFromLog,
    onQuestSelect,
    onTabChange,
    playerName,
    profileStats,
    questAssemblyGuide,
    questLogScrollTop,
    selectedQuestId,
    title,
    unlockedQuestIds,
  }) => {
    const currentQuestViewportRef = useRef<HTMLDivElement>(null);
    const selectedQuestClaimed = claimedQuestIds.includes(selectedQuestId);

    useBrowserLayoutEffect(() => {
      if (activeTab !== "current") return;
      currentQuestViewportRef.current?.scrollTo({ top: 0 });
    }, [activeTab, selectedQuestId]);

    const deliverySlot =
      !selectedQuestClaimed && deliveryItems.length > 0 ? (
        <QuestDeliveryPager
          key={selectedQuestId}
          canClaim={canClaim}
          claimProgress={claimProgress}
          complete={deliveryComplete}
          dropFeedback={deliveryDropFeedback}
          isClaimDragging={isClaimDragging}
          items={deliveryItems}
          onClaimPointerDown={onClaimPointerDown}
          questId={selectedQuestId}
          requesterName={getQuestRequesterName(selectedQuestId)}
        />
      ) : null;

    return (
      <section className="relative z-10 grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
        <QuestPanelHeader
          activeTab={activeTab}
          avatarPath={avatarPath}
          hasQuestNotifications={hasQuestNotifications}
          onPlayerNameChange={onPlayerNameChange}
          onTabChange={onTabChange}
          playerName={playerName}
          stats={profileStats}
          title={title}
        />
        <div className="h-full min-h-0 overflow-hidden pt-2">
          {activeTab === "current" ? (
            <div
              className={`grid h-full min-h-0 gap-2.5 ${
                deliverySlot ? "grid-rows-[minmax(0,1fr)_auto]" : "grid-rows-[minmax(0,1fr)]"
              }`}
            >
              <div
                ref={currentQuestViewportRef}
                data-board-section="quest-current"
                className={`grid h-full min-h-0 touch-pan-y grid-rows-[minmax(26rem,1fr)_auto] gap-2.5 overflow-y-auto scroll-py-2 pr-1 ${HIDDEN_SCROLL_CLASS}`}
              >
                <QuestCurrentCarousel
                  claimedQuestIds={claimedQuestIds}
                  developerNotesVisible={developerNotesVisible}
                  selectedQuestId={selectedQuestId}
                  unlockedQuestIds={unlockedQuestIds}
                  onQuestSelect={onQuestSelect}
                />
                {questAssemblyGuide ? (
                  <QuestAssemblyGuidePanel
                    key={questAssemblyGuide.readyToAssemble ? "ready" : "pending"}
                    guide={questAssemblyGuide}
                  />
                ) : null}
              </div>
              {deliverySlot}
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
    );
  },
);

const QUEST_PROFILE_NAME_MAX_LENGTH = 24;

const QuestPanelHeaderPropsSchema = z.object({
  activeTab: QuestPanelTabSchema,
  avatarPath: z.string().min(1),
  hasQuestNotifications: z.boolean(),
  onPlayerNameChange: z.custom<(nextPlayerName: string) => void>(),
  onTabChange: z.custom<(tab: QuestPanelTab) => void>(),
  playerName: z.string().min(1).max(QUEST_PROFILE_NAME_MAX_LENGTH),
  stats: z.array(QuestProfileStatSchema).min(1),
  title: z.string().min(1),
});

const QuestPanelHeader = defineComponent(
  QuestPanelHeaderPropsSchema,
  ({
    activeTab,
    avatarPath,
    hasQuestNotifications,
    onPlayerNameChange,
    onTabChange,
    playerName,
    stats,
    title,
  }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [draftName, setDraftName] = useState("");

    const beginEditing = () => {
      setDraftName(playerName);
      setIsEditing(true);
      window.requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    };

    const commitName = () => {
      const nextName = draftName.trim();
      setIsEditing(false);
      if (nextName && nextName !== playerName) {
        onPlayerNameChange(nextName);
        return;
      }
      setDraftName(playerName);
    };

    const cancelName = () => {
      setDraftName(playerName);
      setIsEditing(false);
    };

    return (
      <header
        data-board-section="quest-profile-header"
        className="relative z-10 border-b border-white/45 pb-1.5"
      >
        <div className="grid min-w-0 grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-1.5">
          <div className="size-8 overflow-hidden rounded-[5px] border border-amber-500/55 bg-white/70 shadow-[0_2px_0_rgba(72,45,16,0.12)]">
            <img
              src={resolvePublicAssetPath(avatarPath)}
              alt=""
              aria-hidden="true"
              className="aspect-square size-full object-cover"
              draggable={false}
            />
          </div>
          <div className="min-w-0">
            <p className="sr-only">{title}</p>
            {isEditing ? (
              <input
                ref={inputRef}
                data-profile-name-input=""
                className="h-7 w-full border-0 border-b border-dashed border-amber-900 bg-transparent p-0 font-serif text-base leading-none text-amber-950 outline-none focus:border-solid"
                maxLength={QUEST_PROFILE_NAME_MAX_LENGTH}
                value={draftName}
                aria-label="Player name"
                onBlur={commitName}
                onChange={(event) => {
                  setDraftName(event.currentTarget.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") commitName();
                  if (event.key === "Escape") cancelName();
                }}
              />
            ) : (
              <button
                type="button"
                data-profile-name-display=""
                className="max-w-full border-b border-dashed border-amber-900/60 px-0 pb-0.5 text-left font-serif text-base leading-none text-amber-950"
                aria-label="Edit player name"
                onDoubleClick={beginEditing}
                onKeyDown={(event) => {
                  if (event.key === "Enter") beginEditing();
                }}
              >
                <span className="block truncate">{playerName}</span>
              </button>
            )}
          </div>
          <QuestPanelTabs
            activeTab={activeTab}
            hasQuestNotifications={hasQuestNotifications}
            onTabChange={onTabChange}
          />
        </div>
        <dl className="sr-only">
          {stats.map((stat, index) => (
            <QuestProfileStatCell key={stat.kind} index={index} stat={stat} />
          ))}
        </dl>
      </header>
    );
  },
);

const QuestProfileStatCellPropsSchema = z.object({
  index: z.int().min(0),
  stat: QuestProfileStatSchema,
});

const QuestProfileStatCell = defineComponent(QuestProfileStatCellPropsSchema, ({ index, stat }) => {
  const StatIcon = questProfileStatIcons[stat.kind];

  return (
    <div
      data-profile-stat={stat.kind}
      className={`grid min-w-0 place-items-center gap-0.5 px-0.5 py-1 ${
        index === 0 ? "" : "border-l border-amber-500/35"
      }`}
    >
      <dt className="sr-only">{stat.label}</dt>
      <dd className="grid place-items-center gap-0.5">
        <StatIcon aria-hidden="true" className="size-3.5 stroke-[2.6] text-amber-950" />
        <span
          data-profile-stat-value={stat.kind}
          className="text-[10px] font-black leading-none text-amber-950"
        >
          {stat.value}
        </span>
      </dd>
    </div>
  );
});

const QuestPanelTabsPropsSchema = z.object({
  activeTab: QuestPanelTabSchema,
  hasQuestNotifications: z.boolean(),
  onTabChange: z.custom<(tab: QuestPanelTab) => void>(),
});

const QuestAssemblyGuidePanelPropsSchema = z.object({
  guide: z.custom<QuestAssemblyGuide>(),
});

// Collapsed by default so the briefing card keeps its vertical budget; opens
// automatically (via the readyToAssemble call-site key) the moment every
// part is prepared — the one time the detail earns its pixels.
const QuestAssemblyGuidePanel = defineComponent(QuestAssemblyGuidePanelPropsSchema, ({ guide }) => {
  const [expanded, toggleExpanded] = useReducer(
    (currentlyExpanded: boolean) => !currentlyExpanded,
    guide.readyToAssemble,
  );

  return (
    <section
      data-board-section="quest-assembly-guide"
      data-quest-terminal-recipe-id={guide.terminalRecipeId}
      className={`grid gap-2 rounded-[6px] border p-2 shadow-[0_2px_0_rgba(72,45,16,0.1)] ${
        guide.readyToAssemble
          ? "border-emerald-600/70 bg-emerald-50/85"
          : "border-sky-800/25 bg-white/70"
      }`}
      aria-label={`${guide.terminalRecipeName} prepared parts`}
    >
      <button
        type="button"
        className="grid w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 p-0 text-left"
        aria-expanded={expanded}
        onClick={toggleExpanded}
      >
        <span className="min-w-0">
          <span className="block text-[10px] font-black uppercase leading-none tracking-normal text-amber-950/65">
            Prepared parts
          </span>
          {expanded ? (
            <span className="mt-0.5 block text-xs font-bold leading-snug text-neutral-900">
              {guide.instruction}
            </span>
          ) : null}
        </span>
        <span
          className={`rounded-full border px-2 py-1 font-mono text-[10px] font-black leading-none ${
            guide.readyToAssemble
              ? "border-emerald-700/30 bg-white/80 text-emerald-900"
              : "border-sky-900/20 bg-sky-50/80 text-sky-950"
          }`}
        >
          {guide.preparedCount}/{guide.requiredCount}
        </span>
        {expanded ? (
          <ChevronUp aria-hidden="true" className="size-4 text-neutral-700" strokeWidth={2.6} />
        ) : (
          <ChevronDown aria-hidden="true" className="size-4 text-neutral-700" strokeWidth={2.6} />
        )}
      </button>

      {expanded ? (
        <div className="grid gap-1 xl:grid-cols-2">
          {guide.ingredients.map((ingredient) => (
            <QuestAssemblyIngredientRow key={ingredient.cardId} ingredient={ingredient} />
          ))}
        </div>
      ) : null}
    </section>
  );
});

const QuestAssemblyIngredientRowPropsSchema = z.object({
  ingredient: z.custom<QuestAssemblyIngredient>(),
});

const QuestAssemblyIngredientRow = defineComponent(
  QuestAssemblyIngredientRowPropsSchema,
  ({ ingredient }) => {
    const isStored = ingredient.status === "stored";
    return (
      <div
        data-board-section="quest-assembly-ingredient"
        data-card-id={ingredient.cardId}
        data-status={ingredient.status}
        className={`grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5 rounded-[4px] border px-1.5 py-1 ${
          isStored ? "border-emerald-700/25 bg-white/80" : "border-sky-900/15 bg-white/55"
        }`}
      >
        <span
          className={`grid size-5 place-items-center rounded-full ${
            isStored ? "bg-emerald-600 text-white" : "bg-sky-950/10 text-sky-950"
          }`}
          aria-hidden="true"
        >
          {isStored ? (
            <CheckCircle2 className="size-3.5" strokeWidth={2.6} />
          ) : (
            <FlaskConical className="size-3.5" strokeWidth={2.5} />
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[11px] font-black leading-tight text-sky-950">
            {ingredient.label}
          </span>
          <span className="block truncate text-[9px] font-bold uppercase leading-tight text-neutral-700">
            {formatQuestAssemblyIngredientStatus(ingredient.status)}
          </span>
        </span>
        <span className="rounded-full border border-sky-950/15 bg-white/75 px-1.5 py-0.5 font-mono text-[9px] font-black leading-none text-sky-950">
          {ingredient.readyCount}/{ingredient.requiredCount}
        </span>
      </div>
    );
  },
);

const questPanelTabLabels = {
  current: "Quest",
  log: "Log",
} satisfies Record<QuestPanelTab, string>;

const questPanelTabAriaLabels = {
  current: "Current Quest",
  log: "Quest Log",
} satisfies Record<QuestPanelTab, string>;

const questProfileStatIcons = {
  discovery: Sparkles,
  gold: Coins,
  knowledge: Brain,
  level: Trophy,
  muddlefog: CloudFog,
} satisfies Record<QuestProfileStatKind, LucideIcon>;

const QuestPanelTabs = defineComponent(
  QuestPanelTabsPropsSchema,
  ({ activeTab, hasQuestNotifications, onTabChange }) => (
    <div
      data-board-section="quest-briefing-tabs"
      className="grid w-[5.6rem] min-w-0 shrink-0 grid-cols-2 items-center gap-1"
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
            aria-label={questPanelTabAriaLabels[tab]}
            className={`relative min-w-0 rounded-[5px] border px-1.5 py-1 text-[10px] font-black leading-none transition-[background-color,border-color,color] ${
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
  upgrades: "Upgrades",
} satisfies Record<BoardModeTab, string>;

const boardModeTabIcons = {
  crafting: FlaskConical,
  expedition: Compass,
  gathering: Pickaxe,
  upgrades: Gem,
} satisfies Record<BoardModeTab, LucideIcon>;

const boardModeTabSoundIds = {
  crafting: "board-mode.crafting",
  expedition: "board-mode.expedition",
  gathering: "board-mode.gathering",
  upgrades: "expedition.unlocked",
} as const satisfies Record<BoardModeTab, string>;

const BoardModeTabsPropsSchema = z.object({
  activeTab: BoardModeTabSchema,
  expeditionAvailable: z.boolean(),
  // Compact "M:SS" countdown shown on the expedition tab while a run is in flight
  // (null when idle/ready). Lets the player watch the timer from any board mode.
  expeditionCountdownLabel: z.string().nullable(),
  expeditionNudgeActive: z.boolean(),
  expeditionRevealActive: z.boolean(),
  expeditionRevealKey: z.number().int().min(0),
  gatheringAvailable: z.boolean(),
  gatheringNudgeActive: z.boolean(),
  gatheringRevealActive: z.boolean(),
  gatheringRevealKey: z.number().int().min(0),
  onTabChange: z.custom<(tab: BoardModeTab) => void>(),
  upgradesAvailable: z.boolean(),
});

const BoardModeTabs = defineComponent(
  BoardModeTabsPropsSchema,
  ({
    activeTab,
    expeditionAvailable,
    expeditionCountdownLabel,
    expeditionNudgeActive,
    expeditionRevealActive,
    expeditionRevealKey,
    gatheringAvailable,
    gatheringNudgeActive,
    gatheringRevealActive,
    gatheringRevealKey,
    onTabChange,
    upgradesAvailable,
  }) => {
    const visibleTabs = getVisibleBoardModeTabs({
      expeditionAvailable,
      gatheringAvailable,
      upgradesAvailable,
    });

    return (
      <div
        data-board-section="board-mode-tabs"
        data-board-name="Board Mode Tabs"
        data-board-description={BOARD_DESCRIPTIONS.boardModeTabs}
        className={`${GLASS_CONTROL_CLASS} inline-flex min-h-10 w-fit max-w-full items-center gap-1 justify-self-center px-2 py-1.5`}
        role="tablist"
        aria-label="Board modes"
      >
        {visibleTabs.map((tab) => {
          const selected = activeTab === tab;
          const nudgeActive =
            (tab === "gathering" && gatheringNudgeActive) ||
            (tab === "expedition" && expeditionNudgeActive);
          const revealActive =
            (tab === "gathering" && gatheringRevealActive) ||
            (tab === "expedition" && expeditionRevealActive);
          const revealKey = getBoardModeRevealKey(tab, gatheringRevealKey, expeditionRevealKey);

          return (
            <BoardModeTabButton
              key={tab}
              countdownLabel={tab === "expedition" ? expeditionCountdownLabel : null}
              nudgeActive={nudgeActive}
              revealActive={revealActive}
              revealKey={revealKey}
              selected={selected}
              tab={tab}
              onTabChange={onTabChange}
            />
          );
        })}
      </div>
    );
  },
);

const BoardControlRowPropsSchema = BoardModeTabsPropsSchema.extend({
  infoPanelCollapsed: z.boolean(),
  onInfoPanelToggle: z.custom<() => void>(),
  onQuestPanelToggle: z.custom<() => void>(),
  questPanelCollapsed: z.boolean(),
});

const BoardControlRow = defineComponent(
  BoardControlRowPropsSchema,
  ({
    activeTab,
    expeditionAvailable,
    expeditionCountdownLabel,
    expeditionNudgeActive,
    expeditionRevealActive,
    expeditionRevealKey,
    gatheringAvailable,
    gatheringNudgeActive,
    gatheringRevealActive,
    gatheringRevealKey,
    infoPanelCollapsed,
    onInfoPanelToggle,
    onQuestPanelToggle,
    onTabChange,
    questPanelCollapsed,
    upgradesAvailable,
  }) => {
    const showInfoPanelToggle = activeTab === "crafting";

    return (
      <div data-board-section="board-control-row" className={getBoardControlRowClass(activeTab)}>
        <div className="flex min-w-0 items-center gap-1 justify-self-start lg:col-span-2">
          <QuestPanelCollapseButton collapsed={questPanelCollapsed} onClick={onQuestPanelToggle} />
          <BoardModeTabs
            activeTab={activeTab}
            expeditionAvailable={expeditionAvailable}
            expeditionCountdownLabel={expeditionCountdownLabel}
            expeditionNudgeActive={expeditionNudgeActive}
            expeditionRevealActive={expeditionRevealActive}
            expeditionRevealKey={expeditionRevealKey}
            gatheringAvailable={gatheringAvailable}
            gatheringNudgeActive={gatheringNudgeActive}
            gatheringRevealActive={gatheringRevealActive}
            gatheringRevealKey={gatheringRevealKey}
            onTabChange={onTabChange}
            upgradesAvailable={upgradesAvailable}
          />
        </div>
        {showInfoPanelToggle ? (
          <div className="hidden min-w-0 items-center justify-self-end lg:flex">
            <AlchemyWorkbenchInfoCollapseButton
              collapsed={infoPanelCollapsed}
              onClick={onInfoPanelToggle}
            />
          </div>
        ) : null}
      </div>
    );
  },
);

const QuestPanelCollapseButtonPropsSchema = z.object({
  collapsed: z.boolean(),
  onClick: z.custom<() => void>(),
});

const QuestPanelCollapseButton = defineComponent(
  QuestPanelCollapseButtonPropsSchema,
  ({ collapsed, onClick }) => (
    <button
      type="button"
      data-board-section="quest-panel-collapse-button"
      data-board-name={collapsed ? "Open quest briefing" : "Collapse quest briefing"}
      className={`${GLASS_CONTROL_CLASS} grid size-10 shrink-0 place-items-center text-amber-950 transition-[background-color,transform] hover:bg-white/85 active:translate-y-px`}
      aria-label={collapsed ? "Open quest briefing panel" : "Collapse quest briefing panel"}
      aria-expanded={!collapsed}
      onClick={onClick}
    >
      {collapsed ? (
        <ChevronRight className="size-4.5" strokeWidth={2.6} aria-hidden="true" />
      ) : (
        <ScrollText className="size-4.5" strokeWidth={2.6} aria-hidden="true" />
      )}
    </button>
  ),
);

const AlchemyWorkbenchInfoCollapseButtonPropsSchema = z.object({
  collapsed: z.boolean(),
  onClick: z.custom<() => void>(),
});

const AlchemyWorkbenchInfoCollapseButton = defineComponent(
  AlchemyWorkbenchInfoCollapseButtonPropsSchema,
  ({ collapsed, onClick }) => (
    <button
      type="button"
      data-board-section="alchemy-workbench-info-collapse-button"
      data-board-name={
        collapsed ? "Open alchemy workbench info" : "Collapse alchemy workbench info"
      }
      className={`${GLASS_CONTROL_CLASS} grid size-10 shrink-0 place-items-center text-sky-950 transition-[background-color,transform] hover:bg-white/85 active:translate-y-px`}
      aria-label={
        collapsed ? "Open alchemy workbench info panel" : "Collapse alchemy workbench info panel"
      }
      aria-expanded={!collapsed}
      onClick={onClick}
    >
      {collapsed ? (
        <ChevronLeft className="size-4.5" strokeWidth={2.6} aria-hidden="true" />
      ) : (
        <ChevronRight className="size-4.5" strokeWidth={2.6} aria-hidden="true" />
      )}
    </button>
  ),
);

const BoardModeTabButtonPropsSchema = z.object({
  // Live "M:SS" countdown for the expedition tab (null for other tabs / when idle).
  countdownLabel: z.string().nullable(),
  nudgeActive: z.boolean(),
  onTabChange: z.custom<(tab: BoardModeTab) => void>(),
  revealActive: z.boolean(),
  revealKey: z.number().int().min(0),
  selected: z.boolean(),
  tab: BoardModeTabSchema,
});

const BoardModeTabButton = defineComponent(
  BoardModeTabButtonPropsSchema,
  ({ countdownLabel, nudgeActive, onTabChange, revealActive, revealKey, selected, tab }) => {
    const tabRef = useRef<HTMLButtonElement>(null);
    const TabIcon = boardModeTabIcons[tab];

    useAnime(
      tabRef,
      revealKey > 0
        ? {
            duration: 1280,
            ease: "out(4)",
            opacity: [0, 1],
            rotate: ["-8deg", "2deg", "0deg"],
            scale: [0.62, 1.22, 1],
            y: [18, -5, 0],
          }
        : {
            duration: 1,
            opacity: [1, 1],
          },
      [revealKey],
    );

    return (
      <button
        ref={tabRef}
        type="button"
        role="tab"
        aria-selected={selected}
        data-board-mode-reveal-active={revealActive ? "true" : undefined}
        data-board-mode-nudge-active={nudgeActive ? "true" : undefined}
        className={getBoardModeTabClass(selected, nudgeActive, revealActive)}
        onClick={() => {
          onTabChange(tab);
        }}
      >
        {revealActive ? (
          <span
            className="pointer-events-none absolute -inset-1 -z-10 rounded-[7px] border border-emerald-300/70 bg-emerald-300/20 shadow-[0_0_24px_rgba(16,185,129,0.65)]"
            aria-hidden="true"
          />
        ) : null}
        {revealActive ? (
          <span
            className="pointer-events-none absolute -right-4 -top-5 inline-flex items-center gap-1 rounded-full border border-emerald-700/25 bg-white px-2 py-1 text-[9px] font-black uppercase leading-none text-emerald-900 shadow-[0_8px_18px_rgba(15,23,42,0.2)]"
            aria-hidden="true"
          >
            <Sparkles className="size-3" strokeWidth={2.8} aria-hidden="true" />
            Unlocked
          </span>
        ) : null}
        <TabIcon className="size-3.5 stroke-[2.5]" aria-hidden="true" />
        <span>{boardModeTabLabels[tab]}</span>
        {countdownLabel ? (
          <span
            data-board-section="expedition-tab-countdown"
            className={`ml-0.5 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-black leading-none tabular-nums ${
              selected ? "bg-white/20 text-white" : "bg-amber-950/10 text-amber-950"
            }`}
          >
            {countdownLabel}
          </span>
        ) : null}
      </button>
    );
  },
);

function getBoardModeTabClass(
  selected: boolean,
  nudgeActive: boolean,
  revealActive: boolean,
): string {
  const baseClass =
    "relative isolate flex shrink-0 items-center justify-center gap-1.5 overflow-visible whitespace-nowrap rounded-[5px] border px-3 py-1.5 text-xs font-black leading-none transition-[background-color,border-color,color,box-shadow]";

  if (revealActive) {
    return `${baseClass} gathering-nudge-emission border-emerald-700/50 bg-emerald-50 text-emerald-950 shadow-[0_0_0_2px_rgba(16,185,129,0.22)]`;
  }

  if (nudgeActive) {
    return `${baseClass} gathering-nudge-emission bg-emerald-50 text-emerald-950`;
  }

  if (selected) return `${baseClass} border-amber-900/45 bg-amber-950 text-white`;

  return `${baseClass} border-[#6b4a2b]/18 bg-white/52 text-[#3c2819]/72 hover:bg-white/82`;
}

function getBoardModeRevealKey(
  tab: BoardModeTab,
  gatheringRevealKey: number,
  expeditionRevealKey: number,
): number {
  if (tab === "gathering") return gatheringRevealKey;
  if (tab === "expedition") return expeditionRevealKey;
  return 0;
}

function isExpeditionAvailable(boardState: AlchemistGuildBoardState): boolean {
  return boardState.discoveredRecipeIds.includes(EXPEDITION_UNLOCK_RECIPE_ID);
}

function isExpeditionRewardReady(
  expedition: AlchemistGuildExpeditionState,
  nowMs: number,
): boolean {
  return Boolean(expedition.targetCardId && expedition.readyAtMs && nowMs >= expedition.readyAtMs);
}

function getExpeditionRewardModalCard({
  card,
  gatheringSessionReview,
  gatheringWrongResetKey,
  rewardReady,
}: {
  card: AlchemyBoardCard | null;
  gatheringSessionReview: GatheringSessionReviewState | null;
  gatheringWrongResetKey: string | null;
  rewardReady: boolean;
}): AlchemyBoardCard | null {
  if (!rewardReady || gatheringSessionReview !== null || gatheringWrongResetKey !== null) {
    return null;
  }

  return card;
}

function getExpeditionProgress(expedition: AlchemistGuildExpeditionState, nowMs: number): number {
  if (!expedition.startedAtMs || !expedition.readyAtMs) return 0;
  const durationMs = expedition.readyAtMs - expedition.startedAtMs;
  if (durationMs <= 0) return 1;

  return clamp((nowMs - expedition.startedAtMs) / durationMs, 0, 1);
}

function getExpeditionRemainingLabel(
  expedition: AlchemistGuildExpeditionState,
  nowMs: number,
): string {
  if (!expedition.readyAtMs) return "No route plotted.";
  const remainingMs = Math.max(0, expedition.readyAtMs - nowMs);
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")} until delivery.`;
}

function getExpeditionTargetOptions(
  boardState: AlchemistGuildBoardState,
  quest: StaticAlchemyQuest | null,
): ExpeditionTargetOption[] {
  const discoveredElementIds = new Set(boardState.discoveredElementIds);
  const questElementIds = quest ? getQuestRequiredElementIds(quest) : new Set<string>();

  return ELEMENT_CARDS.flatMap((elementCard) => {
    const inVault = discoveredElementIds.has(elementCard.id);
    const inQuest = questElementIds.has(elementCard.id);
    if (!inVault && !inQuest) return [];

    const card = getAlchemyCard(elementCard.id);
    if (!card) return [];

    let source: ExpeditionTargetOption["source"] = "vault";
    if (inVault && inQuest) source = "both";
    if (!inVault && inQuest) source = "quest";

    return [{ card, source }];
  });
}

function getQuestRequiredElementIds(quest: StaticAlchemyQuest): Set<string> {
  const elementIds = new Set<string>();
  for (const recipeId of quest.recipeIds) {
    const recipe = getAlchemyRecipeById(recipeId);
    if (!recipe) continue;
    collectRequiredElementIds(recipe.output.cardId, elementIds, new Set());
  }
  return elementIds;
}

function collectRequiredElementIds(
  cardId: string,
  elementIds: Set<string>,
  stack: Set<string>,
): void {
  if (isElementCardId(cardId)) {
    elementIds.add(cardId);
    return;
  }
  if (stack.has(cardId)) return;

  const recipe = getAlchemyRecipeByOutput(cardId);
  if (!recipe) return;

  stack.add(cardId);
  for (const argument of recipe.arguments) {
    collectRequiredElementIds(argument.cardId, elementIds, stack);
  }
  stack.delete(cardId);
}

function isElementCardId(cardId: string): boolean {
  return ELEMENT_CARDS.some((card) => card.id === cardId);
}

function formatExpeditionTargetSource(source: ExpeditionTargetOption["source"]): string {
  switch (source) {
    case "both":
      return "Vault + Quest";
    case "quest":
      return "Quest";
    case "vault":
      return "Vault";
    default:
      return "Vault";
  }
}

const QuestCurrentCarouselPropsSchema = z.object({
  claimedQuestIds: z.array(z.string().min(1)),
  developerNotesVisible: z.boolean(),
  onQuestSelect: z.custom<(questId: string) => void>(),
  selectedQuestId: z.string().min(1),
  unlockedQuestIds: z.array(z.string().min(1)),
});

const QuestCurrentCarousel = defineComponent(
  QuestCurrentCarouselPropsSchema,
  ({
    claimedQuestIds,
    developerNotesVisible,
    onQuestSelect,
    selectedQuestId,
    unlockedQuestIds,
  }) => {
    const viewportRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const swipeRef = useRef<QuestCurrentSwipe | null>(null);
    const animationRef = useRef<JSAnimation | null>(null);
    const removePointerListenersRef = useRef<(() => void) | null>(null);
    const pendingTransitionRef = useRef<QuestCurrentPendingTransition | null>(null);
    const selectedQuestIndex = getQuestIndexById(selectedQuestId);
    const claimedQuestIdSet = new Set(claimedQuestIds);
    const unlockedQuestIdSet = new Set(unlockedQuestIds);
    const selectedQuestNumber = selectedQuestIndex + 1;

    const centerTrack = () => {
      const slideWidth = viewportRef.current?.getBoundingClientRect().width ?? 0;
      const trackElement = trackRef.current;
      if (!trackElement || slideWidth <= 0) return;
      trackElement.style.transform = `translateX(${getQuestCurrentCenterX(slideWidth)}px)`;
    };

    // Commit the quest change immediately; the [selectedQuestId] layout
    // effect replays the remaining motion after the re-render. Deferring the
    // commit to an animation onComplete let the next pointerdown cancel it,
    // silently undoing committed swipes during rapid paging.
    const commitQuestDirection = (direction: -1 | 1, residualDeltaX: number) => {
      animationRef.current?.cancel();
      animationRef.current = null;
      const nextQuest = getQuestAtWrappedIndex(selectedQuestIndex + direction);
      pendingTransitionRef.current = { direction, residualDeltaX };
      onQuestSelect(nextQuest.id);
    };

    const animateToQuestDirection = (direction: -1 | 0 | 1) => {
      if (direction === 0) {
        const trackElement = trackRef.current;
        const slideWidth = viewportRef.current?.getBoundingClientRect().width ?? 0;
        if (!trackElement || slideWidth <= 0) return;
        snapQuestCurrentTrack(trackElement, getQuestCurrentCenterX(slideWidth), animationRef);
        return;
      }

      commitQuestDirection(direction, 0);
    };

    const handlePrevious = () => {
      animateToQuestDirection(-1);
    };

    const handleNext = () => {
      animateToQuestDirection(1);
    };

    const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || !event.isPrimary || swipeRef.current) return;
      if (isInsideQuestBriefingCarousel(event.target)) return;
      const trackElement = trackRef.current;
      if (!trackElement) return;

      const slideWidth = event.currentTarget.getBoundingClientRect().width;
      if (slideWidth <= 0) return;

      removePointerListenersRef.current?.();
      animationRef.current?.cancel();
      animationRef.current = null;

      setQuestCurrentTrackX(trackElement, getQuestCurrentCenterX(slideWidth));
      swipeRef.current = {
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
      removePointerListenersRef.current = addQuestCurrentPointerListeners(
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
      setQuestCurrentTrackX(
        swipe.trackElement,
        getQuestCurrentCenterX(swipe.slideWidth) + swipe.latestDeltaX - swipe.interceptDeltaX,
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
        const intent = getQuestCurrentSwipeIntent(latestDeltaX, latestDeltaY, event.pointerType);
        if (intent === "pending") return;
        if (intent === "vertical") {
          removePointerListenersRef.current?.();
          removePointerListenersRef.current = null;
          if (swipe.animationFrame !== 0) cancelAnimationFrame(swipe.animationFrame);
          swipeRef.current = null;
          if (swipe.captureElement.hasPointerCapture(event.pointerId)) {
            swipe.captureElement.releasePointerCapture(event.pointerId);
          }
          setQuestCurrentTrackX(swipe.trackElement, getQuestCurrentCenterX(swipe.slideWidth));
          return;
        }

        swipe.horizontalActive = true;
        swipe.interceptDeltaX = latestDeltaX;
        justLockedHorizontal = true;
        if (!swipe.captureElement.hasPointerCapture(event.pointerId)) {
          capturePointer(swipe.captureElement, event.pointerId);
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

      const releaseIntent = getQuestCurrentSwipeIntent(
        swipe.latestDeltaX,
        event.clientY - swipe.startClientY,
        event.pointerType,
      );
      const direction =
        swipe.horizontalActive || releaseIntent === "horizontal"
          ? getQuestCurrentSwipeDirection(swipe.latestDeltaX, getSwipeVelocityX(swipe.samples))
          : 0;
      swipeRef.current = null;
      if (swipe.captureElement.hasPointerCapture(event.pointerId)) {
        swipe.captureElement.releasePointerCapture(event.pointerId);
      }
      if (direction === 0) {
        animateToQuestDirection(0);
        return;
      }
      commitQuestDirection(direction, swipe.latestDeltaX - swipe.interceptDeltaX);
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

      // Browser-stolen gesture: keep the kid's intent when the drag already
      // crossed the commit distance (velocity is unreliable on cancel).
      const direction = swipe.horizontalActive
        ? getQuestCurrentSwipeDirection(swipe.latestDeltaX)
        : 0;
      if (direction !== 0) {
        commitQuestDirection(direction, swipe.latestDeltaX - swipe.interceptDeltaX);
        return;
      }
      snapQuestCurrentTrack(
        trackRef.current,
        getQuestCurrentCenterX(swipe.slideWidth),
        animationRef,
      );
    };

    const handleNativeTouchMove = (event: TouchEvent) => {
      if (swipeRef.current?.horizontalActive && event.cancelable) event.preventDefault();
    };

    useBrowserLayoutEffect(() => {
      const pending = pendingTransitionRef.current;
      pendingTransitionRef.current = null;
      if (!pending) {
        centerTrack();
        return;
      }

      const trackElement = trackRef.current;
      const slideWidth = viewportRef.current?.getBoundingClientRect().width ?? 0;
      if (!trackElement || slideWidth <= 0) return;

      const centerX = getQuestCurrentCenterX(slideWidth);
      if (prefersReducedMotion()) {
        setQuestCurrentTrackX(trackElement, centerX);
        return;
      }

      // Resume the motion from where the finger left off: the re-keyed track
      // shows the committed quest, positioned as the old drag left it.
      setQuestCurrentTrackX(
        trackElement,
        centerX + pending.direction * slideWidth + pending.residualDeltaX,
      );
      snapQuestCurrentTrack(trackElement, centerX, animationRef);
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
      <section
        className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-1.5"
        aria-label="Selected quest"
      >
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5">
          <button
            type="button"
            className="inline-grid grid-cols-[auto_auto] items-center gap-1 rounded-[5px] border border-amber-900/25 bg-white/65 px-1.5 py-1 text-[11px] font-black uppercase leading-none text-amber-950 transition-[background-color,transform] hover:bg-white/85 active:scale-[0.98]"
            aria-label="Previous quest"
            onClick={handlePrevious}
          >
            <ChevronLeft className="size-3.5" strokeWidth={2.6} aria-hidden="true" />
            Prev
          </button>
          <p
            className="min-w-0 text-center font-mono text-[11px] font-black leading-none text-amber-950"
            aria-live="polite"
          >
            Quest {selectedQuestNumber}/{ALCHEMY_QUESTS.length}
          </p>
          <button
            type="button"
            className="inline-grid grid-cols-[auto_auto] items-center gap-1 rounded-[5px] border border-amber-900/25 bg-white/65 px-1.5 py-1 text-[11px] font-black uppercase leading-none text-amber-950 transition-[background-color,transform] hover:bg-white/85 active:scale-[0.98]"
            aria-label="Next quest"
            onClick={handleNext}
          >
            Next
            <ChevronRight className="size-3.5" strokeWidth={2.6} aria-hidden="true" />
          </button>
        </div>

        <div
          ref={viewportRef}
          data-board-section="quest-current-carousel"
          className="h-full min-h-0 cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing"
          onPointerDown={handlePointerDown}
        >
          <div
            ref={trackRef}
            className="grid h-full grid-flow-col auto-cols-[100%] grid-rows-[100%]"
            style={{ transform: "translateX(-33.333333%)" }}
          >
            {QUEST_CURRENT_SLIDE_OFFSETS.map((offset) => {
              const quest = getQuestAtWrappedIndex(selectedQuestIndex + offset);
              const cardProps = createQuestBriefingCardProps(quest);
              const isUnlocked = unlockedQuestIdSet.has(quest.id);

              return (
                <div
                  key={quest.id}
                  data-quest-current-slide={offset}
                  className="h-full min-w-0 px-0"
                  aria-hidden={offset === 0 ? undefined : true}
                  inert={offset === 0 ? undefined : true}
                >
                  <QuestBriefingCard
                    {...cardProps}
                    completed={claimedQuestIdSet.has(quest.id)}
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
        className={`h-full min-h-0 overflow-y-auto pr-1 ${HIDDEN_SCROLL_CLASS}`}
        aria-label="Quest Log"
        onScroll={handleScroll}
      >
        <div className="relative" style={{ height: `${totalHeight}px` }}>
          <div
            className="absolute inset-x-0 grid gap-2.5"
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
        className={`grid h-20 w-full grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-2.5 rounded-[6px] border p-2.5 text-left text-neutral-950 shadow-[0_1px_0_rgba(72,45,16,0.1)] transition-[background-color,border-color,box-shadow,transform] hover:-translate-y-0.5 ${rowClass}`}
        onClick={() => {
          onQuestSelect(quest.id);
        }}
        onDoubleClick={() => {
          onQuestOpenFromLog(quest.id);
        }}
      >
        <span
          className={`grid size-10 place-items-center rounded-[5px] border ${
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
            className={`block text-xs font-black leading-snug ${
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
  marker: z.custom<QuestInventoryMarker | null>(),
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
  sellPrice: z.number().min(0),
  slotId: AlchemistGuildInventorySlotIdSchema,
  slotName: z.string(),
});

const InventorySlot = defineComponent(
  InventorySlotPropsSchema,
  ({
    card,
    cooldowns,
    draggedCard,
    isFlyDestination,
    marker,
    nowMs,
    onPointerDown,
    sellPrice,
    slotId,
    slotName,
  }) => {
    const stackCount = cooldowns.length;
    const readyCount = getReadyCooldownCount(cooldowns, nowMs);
    const isDraggingSource =
      draggedCard?.source.kind === "inventory" && draggedCard.source.slotId === slotId;
    const stateClass = getInventoryCardStateClass(marker, readyCount);

    return (
      <div
        data-inventory-slot-id={slotId}
        data-board-section={slotId}
        data-board-name={slotName}
        data-card-flight-hidden={isFlyDestination ? "true" : undefined}
        className="relative h-14 min-w-0 rounded-[6px] border border-dashed border-neutral-700/50 bg-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
      >
        {card && !isFlyDestination ? (
          <button
            type="button"
            data-board-section="inventory-card"
            data-board-name={`${card.name} inventory card`}
            data-card-id={card.id}
            data-ready-count={readyCount}
            data-stack-count={stackCount}
            className={`absolute inset-1 grid touch-none select-none grid-cols-[2rem_minmax(0,1fr)] items-center gap-1 rounded-[5px] border bg-white/70 px-1 text-left transition-[border-color,opacity,box-shadow] sm:grid-cols-[2.3rem_minmax(0,1fr)] sm:gap-1.5 sm:px-1.5 [-webkit-user-drag:none] active:cursor-grabbing ${stateClass} ${
              isDraggingSource ? "opacity-45" : ""
            }`}
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
            {card.imagePath ? (
              <img
                src={getAlchemyCardArtSrc(card)}
                alt=""
                aria-hidden="true"
                className="size-8 object-contain sm:size-9"
                draggable={false}
              />
            ) : (
              <span
                aria-hidden="true"
                className="grid size-8 place-items-center rounded-[4px] border border-amber-800/35 bg-amber-100 text-[10px] font-black uppercase leading-none text-amber-950 sm:size-9"
              >
                {card.symbol}
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate text-[12px] font-black leading-tight text-sky-950">
                {card.name}
              </span>
              <span className="flex min-w-0 items-center gap-1 truncate text-[9px] font-bold uppercase leading-tight text-neutral-700">
                <span className="truncate">
                  {readyCount}/{stackCount} ready
                </span>
                <span
                  className="inline-flex shrink-0 items-center gap-0.5 text-amber-800"
                  title={`Sell price ${sellPrice} gold`}
                >
                  <Coins className="size-2.5 stroke-[3]" aria-hidden="true" />
                  {sellPrice}
                </span>
              </span>
            </span>
            <span className="absolute -right-1.5 -top-1.5 rounded-full bg-sky-950 px-1.5 py-0.5 text-[10px] font-black leading-none text-white">
              x{stackCount}
            </span>
            {marker ? (
              <span
                className={`absolute -bottom-1.5 left-1 rounded-[3px] px-1.5 py-0.5 text-[8px] font-black uppercase leading-none tracking-normal text-white ${
                  marker.tone === "delivery" ? "bg-amber-700" : "bg-emerald-700"
                }`}
              >
                {marker.label}
              </span>
            ) : null}
            <CooldownStack cooldowns={cooldowns} nowMs={nowMs} />
          </button>
        ) : null}
      </div>
    );
  },
);

const InventorySellZonePropsSchema = z.object({
  draggedCard: z.custom<DraggedAlchemyCard | null>(),
  dropIntent: z.custom<DropIntent>(),
});

function getInventoryCardStateClass(
  marker: QuestInventoryMarker | null,
  readyCount: number,
): string {
  if (marker?.tone === "delivery") {
    return "border-amber-500/80 shadow-[0_0_0_2px_rgba(245,158,11,0.24),0_5px_14px_rgba(15,23,42,0.14)]";
  }
  if (marker?.tone === "prep") {
    return "border-emerald-600/70 shadow-[0_0_0_2px_rgba(16,185,129,0.2),0_5px_14px_rgba(15,23,42,0.14)]";
  }
  if (readyCount > 0) {
    return "cursor-grab border-emerald-600/50 shadow-[0_5px_14px_rgba(15,23,42,0.14)]";
  }

  return "cursor-not-allowed border-amber-500/60 opacity-80 shadow-[0_5px_14px_rgba(15,23,42,0.14)]";
}

const InventorySellZone = defineComponent(
  InventorySellZonePropsSchema,
  ({ draggedCard, dropIntent }) => {
    const feedback = getInventorySellDropFeedback(dropIntent);
    let sellPrice = 0;
    if (dropIntent.kind === "sell" && dropIntent.accepted) {
      sellPrice = dropIntent.price;
    } else if (draggedCard?.source.kind === "inventory") {
      sellPrice = getAlchemyCardSellPrice(draggedCard.card);
    }
    const showTooltip = dropIntent.kind === "sell" && dropIntent.accepted && sellPrice > 0;

    return (
      <div
        data-board-section="inventory-sell-zone"
        data-board-name="Inventory sell zone"
        data-drop-feedback={feedback}
        data-sell-price={sellPrice}
        className={getInventorySellZoneClass(feedback)}
      >
        <span className="sr-only">Sell ready inventory card</span>
        <Trash2 className="size-4 stroke-[2.5]" aria-hidden="true" />
        <Coins className="absolute right-1 top-1 size-2.5 stroke-[3]" aria-hidden="true" />
        {showTooltip ? (
          <span
            data-board-section="inventory-sell-tooltip"
            className="pointer-events-none absolute right-0 top-full z-30 mt-1 whitespace-nowrap rounded-[5px] border border-amber-800/25 bg-white/95 px-2 py-1 text-[11px] font-black leading-none text-amber-950 shadow-[0_10px_20px_rgba(72,45,16,0.2)]"
          >
            +{sellPrice} gold
          </span>
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
      content = isEmergentRecipePreview(preview) ? (
        <OutputEmergentCard key={preview.formula} preview={preview} />
      ) : (
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
  preview: z.custom<AlchemyWorkbenchStaticRecipePreview>(),
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

const OutputEmergentCardPropsSchema = z.object({
  preview: z.custom<AlchemyWorkbenchEmergentPreview>(),
});

const OutputEmergentCard = defineComponent(OutputEmergentCardPropsSchema, ({ preview }) => {
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
      data-output-emergent-card=""
      data-output-formula={preview.formula}
      className={`absolute -inset-px grid select-none grid-rows-[auto_1fr_auto] overflow-hidden rounded-[6px] border-2 border-amber-800/55 bg-amber-50/95 p-1.5 text-center shadow-[0_10px_22px_rgba(15,23,42,0.22)] transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      aria-label="Emergent mystery output preview"
    >
      <span className="justify-self-end rounded-[3px] bg-amber-950 px-1.5 py-0.5 font-mono text-[10px] font-black leading-none text-white">
        {preview.formula}
      </span>
      <span className="mx-auto grid size-16 place-items-center self-center rounded-full border border-amber-900/25 bg-amber-100/80 font-serif text-5xl font-black leading-none text-amber-950 shadow-[inset_0_1px_8px_rgba(255,255,255,0.72)]">
        ?
      </span>
      <span className="grid gap-0.5">
        <span className="truncate font-serif text-lg font-bold leading-none text-amber-950">
          Unknown
        </span>
        <span className="truncate text-[9px] font-bold uppercase leading-none tracking-normal text-amber-950/65">
          Emergent
        </span>
      </span>
    </article>
  );
});

const QuestTransmutationHintPropsSchema = z.object({
  guide: z.custom<QuestAssemblyGuide | null>(),
  preview: z.custom<AlchemyWorkbenchAnyRecipePreview | null>(),
});

const QuestTransmutationHint = defineComponent(
  QuestTransmutationHintPropsSchema,
  ({ guide, preview }) => {
    if (!guide) return null;

    const previewRecipeId =
      preview && !isEmergentRecipePreview(preview) && !isExtendedRecipePreview(preview)
        ? preview.recipe.id
        : null;
    const makingAssemblyTarget = previewRecipeId === guide.terminalRecipeId;
    if (!guide.readyToAssemble && !makingAssemblyTarget) return null;

    const label = makingAssemblyTarget
      ? `${guide.terminalRecipeName} matched`
      : `${guide.terminalRecipeName} ready`;
    const detail = makingAssemblyTarget
      ? "Swipe to finish the quest item."
      : "Put the prepared parts on the Workbench.";

    return (
      <div
        data-board-section="quest-transmutation-hint"
        className="pointer-events-none absolute left-3 top-3 z-20 grid max-w-[15rem] gap-0.5 rounded-[5px] border border-emerald-700/30 bg-white/90 px-2 py-1.5 text-left text-emerald-950 shadow-[0_8px_20px_rgba(15,23,42,0.16)]"
      >
        <span className="text-[9px] font-black uppercase leading-none tracking-normal">
          {label}
        </span>
        <span className="text-[11px] font-bold leading-tight">{detail}</span>
      </div>
    );
  },
);

const EmergentTransmutationToastPropsSchema = z.object({
  notice: z.custom<EmergentTransmutationNotice>(),
});

const EmergentTransmutationToast = defineComponent(
  EmergentTransmutationToastPropsSchema,
  ({ notice }) => {
    const toastRef = useRef<HTMLOutputElement>(null);
    const success = notice.status === "success";
    const Icon = success ? Sparkles : X;
    const rarityText = notice.rarity ? formatEmergentRecipeRarity(notice.rarity) : "Emergent";
    const detailText = notice.name ? `${notice.name} · ${rarityText}` : "Unstable reaction";

    useBrowserLayoutEffect(() => {
      const toastElement = toastRef.current;
      if (!toastElement || prefersReducedMotion()) return;

      const animation = animate(toastElement, {
        duration: success ? 380 : 280,
        ease: success ? "out(3)" : "inOut(2)",
        opacity: [0, 1],
        scale: success ? [0.92, 1.04, 1] : [0.98, 1],
        x: success ? [0, 0] : [-8, 8, -4, 4, 0],
        y: [10, 0],
      });

      return () => {
        animation.cancel();
      };
    }, [notice.id, success]);

    return (
      <output
        ref={toastRef}
        aria-live="polite"
        data-board-section="emergent-transmutation-toast"
        data-emergent-status={notice.status}
        className={`pointer-events-none fixed left-1/2 top-20 z-[90] grid min-w-56 -translate-x-1/2 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-[7px] border px-3 py-2 shadow-[0_18px_36px_rgba(15,23,42,0.24)] ${
          success
            ? "border-amber-800/30 bg-amber-50/95 text-amber-950"
            : "border-rose-800/25 bg-rose-50/95 text-rose-950"
        }`}
      >
        <span className="grid size-8 place-items-center rounded-full border border-current/25 bg-white/65">
          <Icon className="size-4 stroke-[2.8]" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-black leading-tight">{notice.message}</span>
          <span className="block truncate text-[10px] font-bold uppercase leading-tight tracking-normal opacity-75">
            {detailText}
          </span>
        </span>
      </output>
    );
  },
);

// The in-flight Orbit Forge round (the emergent-craft mini-game); null when idle.
type ForgeRoundContext = {
  attemptedAtMs: number;
  preview: AlchemyWorkbenchEmergentPreview;
};

// Mounts the forge overlay when a round is active. Kept as its own component so
// the conditional render lives here, not in the (complexity-capped) board.
const EmergentForgeMountPropsSchema = z.object({
  forgeRound: z.custom<ForgeRoundContext | null>(),
  onForgeComplete: z.custom<(round: ForgeRoundContext, result: ForgeRoundResult) => void>(),
});

const EmergentForgeMount = defineComponent(
  EmergentForgeMountPropsSchema,
  ({ forgeRound, onForgeComplete }) => {
    if (!forgeRound) return null;
    return (
      <OrbitForgeOverlay
        assist
        ingredientCardIds={[...forgeRound.preview.orderedIngredientCardIds]}
        onComplete={(result) => onForgeComplete(forgeRound, result)}
      />
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
  discoveredEmergentRecipes: z.array(z.custom<AlchemistGuildEmergentRecipe>()),
  discoveredExtendedRecipeIds: z.array(z.string().min(1)),
  discoveredRecipeIds: z.array(z.string().min(1)),
  extendedLedgerFilterCardIds: z.array(z.string().min(1)),
  extendedLedgerFilterDropFeedback: z.custom<DropFeedback>(),
  hasEmergentRecipeNotifications: z.boolean(),
  hasExtendedRecipeNotifications: z.boolean(),
  hasRecipeNotifications: z.boolean(),
  onEmergentRecipeRevealSeen: z.custom<(recipeId: string) => void>(),
  onExtendedLedgerFilterRemove: z.custom<(cardId: string) => void>(),
  onExtendedRecipeRevealSeen: z.custom<(recipeId: string) => void>(),
  onRecipeRevealSeen: z.custom<(recipeId: string) => void>(),
  onTabChange: z.custom<(tab: InfoPanelTab) => void>(),
  preview: z.custom<AlchemyWorkbenchAnyRecipePreview | null>(),
  revealEmergentRecipeIds: z.array(z.string().min(1)),
  revealExtendedRecipeIds: z.array(z.string().min(1)),
  revealRecipeIds: z.array(z.string().min(1)),
});

const AlchemyWorkbenchInfoPanel = defineComponent(
  AlchemyWorkbenchInfoPanelPropsSchema,
  ({
    activeTab,
    discoveredEmergentRecipes,
    discoveredExtendedRecipeIds,
    discoveredRecipeIds,
    extendedLedgerFilterCardIds,
    extendedLedgerFilterDropFeedback,
    hasEmergentRecipeNotifications,
    hasExtendedRecipeNotifications,
    hasRecipeNotifications,
    onEmergentRecipeRevealSeen,
    onExtendedLedgerFilterRemove,
    onExtendedRecipeRevealSeen,
    onRecipeRevealSeen,
    onTabChange,
    preview,
    revealEmergentRecipeIds,
    revealExtendedRecipeIds,
    revealRecipeIds,
  }) => {
    const flipSurfaceRef = useRef<HTMLDivElement>(null);
    const [selectedDiscoveryDetail, setSelectedDiscoveryDetail] =
      useState<WorkbenchDiscoveryDetail | null>(null);
    const flipSurfaceKey = `${activeTab}:${selectedDiscoveryDetail?.id ?? "ledger"}`;

    const handleTabChange = (nextTab: InfoPanelTab) => {
      setSelectedDiscoveryDetail(null);
      onTabChange(nextTab);
    };

    const handleBackToLedger = () => {
      setSelectedDiscoveryDetail(null);
    };

    const handleRecipeInspect = (recipe: RecipeLedgerRecipe) => {
      setSelectedDiscoveryDetail(createAlchemyRecipeDiscoveryDetail(recipe));
    };

    const handleExtendedRecipeInspect = (recipe: ExtendedRecipeLedgerRecipe) => {
      setSelectedDiscoveryDetail(createExtendedMoleculeDiscoveryDetail(recipe));
    };

    const handleEmergentRecipeInspect = (recipe: AlchemistGuildEmergentRecipe) => {
      setSelectedDiscoveryDetail(createEmergentRecipeDiscoveryDetail(recipe));
    };

    useBrowserLayoutEffect(() => {
      const flipSurfaceElement = flipSurfaceRef.current;
      if (!flipSurfaceElement || prefersReducedMotion()) return;

      const animation = animate(flipSurfaceElement, {
        duration: 320,
        ease: "out(3)",
        opacity: [0.65, 1],
        rotateY: ["-72deg", "0deg"],
        scale: [0.985, 1],
      });

      return () => {
        animation.cancel();
      };
    }, [flipSurfaceKey]);

    let content = (
      <ExtendedRecipeLedger
        discoveredRecipeIds={discoveredExtendedRecipeIds}
        filterCardIds={extendedLedgerFilterCardIds}
        filterDropFeedback={extendedLedgerFilterDropFeedback}
        onFilterRemove={onExtendedLedgerFilterRemove}
        onRecipeInspect={handleExtendedRecipeInspect}
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
          onRecipeInspect={handleRecipeInspect}
          onRevealSeen={onRecipeRevealSeen}
          revealRecipeIds={revealRecipeIds}
        />
      );
    }
    if (activeTab === "emergent") {
      content = (
        <EmergentRecipeLedger
          recipes={discoveredEmergentRecipes}
          onRecipeInspect={handleEmergentRecipeInspect}
          onRevealSeen={onEmergentRecipeRevealSeen}
          revealRecipeIds={revealEmergentRecipeIds}
        />
      );
    }

    if (selectedDiscoveryDetail?.kind === activeTab) {
      content = <DiscoveryInfoPanel detail={selectedDiscoveryDetail} onBack={handleBackToLedger} />;
    }

    return (
      <section className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] text-neutral-950 [perspective:900px]">
        <InfoPanelTabs
          activeTab={activeTab}
          hasEmergentRecipeNotifications={hasEmergentRecipeNotifications}
          hasExtendedRecipeNotifications={hasExtendedRecipeNotifications}
          hasRecipeNotifications={hasRecipeNotifications}
          onTabChange={handleTabChange}
        />
        <div ref={flipSurfaceRef} className="min-h-0 origin-center [transform-style:preserve-3d]">
          {content}
        </div>
      </section>
    );
  },
);

const InfoPanelTabsPropsSchema = z.object({
  activeTab: InfoPanelTabSchema,
  hasEmergentRecipeNotifications: z.boolean(),
  hasExtendedRecipeNotifications: z.boolean(),
  hasRecipeNotifications: z.boolean(),
  onTabChange: z.custom<(tab: InfoPanelTab) => void>(),
});

const infoPanelTabLabels = {
  element: "Element",
  emergent: "Emergent",
  extended: "Extended",
  recipe: "Recipe",
} satisfies Record<InfoPanelTab, string>;

const InfoPanelTabs = defineComponent(
  InfoPanelTabsPropsSchema,
  ({
    activeTab,
    hasEmergentRecipeNotifications,
    hasExtendedRecipeNotifications,
    hasRecipeNotifications,
    onTabChange,
  }) => (
    <div
      data-board-section="alchemy-workbench-info-tabs"
      className="grid min-w-0 grid-cols-2 items-center gap-1 border-b border-white/45 p-2 pb-1.5 xl:grid-cols-4"
      role="tablist"
      aria-label="Alchemy Workbench Info views"
    >
      {infoPanelTabs.map((tab) => {
        const selected = activeTab === tab;
        const showBadge =
          (tab === "recipe" && hasRecipeNotifications) ||
          (tab === "extended" && hasExtendedRecipeNotifications) ||
          (tab === "emergent" && hasEmergentRecipeNotifications);

        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`relative min-w-0 rounded-[5px] border px-1.5 py-1.5 text-xs font-black leading-none transition-[background-color,border-color,color] ${
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

const DiscoveryInfoPanelPropsSchema = z.object({
  detail: z.custom<WorkbenchDiscoveryDetail>(),
  onBack: z.custom<() => void>(),
});

const DiscoveryInfoPanel = defineComponent(DiscoveryInfoPanelPropsSchema, ({ detail, onBack }) => (
  <article
    data-board-section="discovery-info-panel"
    data-discovery-id={detail.id}
    data-discovery-kind={detail.kind}
    className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3 p-3 text-neutral-950"
  >
    <header className="grid gap-2">
      <button
        type="button"
        className="inline-grid w-fit grid-cols-[auto_auto] items-center gap-1 rounded-[5px] border border-sky-900/20 bg-white/65 px-2 py-1 text-[10px] font-black uppercase leading-none text-sky-950 transition-[background-color,transform] hover:bg-white/85 active:scale-[0.98]"
        onClick={onBack}
      >
        <ChevronLeft className="size-3.5" strokeWidth={2.6} aria-hidden="true" />
        Ledger
      </button>
      <div className="grid grid-cols-[4rem_minmax(0,1fr)] gap-3">
        <div className="grid size-16 place-items-center overflow-hidden rounded-[6px] border border-sky-900/25 bg-white/80">
          {detail.kind === "emergent" ? (
            <>
              <span
                className="grid size-14 place-items-center rounded-full border border-amber-900/25 bg-amber-100/80 font-serif text-4xl font-black leading-none text-amber-950"
                aria-hidden="true"
              >
                ?
              </span>
              <span className="sr-only">{detail.imageAlt}</span>
            </>
          ) : (
            <img
              src={detail.imageUrl}
              alt={detail.imageAlt}
              className="size-14 object-contain"
              draggable={false}
            />
          )}
        </div>
        <div className="min-w-0 self-center">
          <p className="truncate text-[10px] font-bold uppercase leading-none tracking-normal text-sky-950/65">
            {detail.subtitle}
          </p>
          <h2 className="mt-1 truncate font-serif text-2xl leading-none text-sky-950">
            {detail.title}
          </h2>
          <div className="mt-1 flex flex-wrap gap-1">
            {detail.tags.map((tag) => (
              <InfoBadge key={tag} label={tag} />
            ))}
          </div>
        </div>
      </div>
    </header>

    <div className="min-h-0 overflow-y-auto pr-1">
      <section className="grid gap-1.5 rounded-[5px] border border-sky-900/20 bg-white/55 p-2">
        <h3 className="text-[11px] font-semibold uppercase leading-none tracking-normal text-sky-950/65">
          Formula
        </h3>
        <p className="font-mono text-sm font-black leading-none text-sky-950">{detail.formula}</p>
      </section>

      <section className="mt-2 grid gap-1.5 rounded-[5px] border border-sky-900/20 bg-white/55 p-2">
        <h3 className="text-[11px] font-semibold uppercase leading-none tracking-normal text-sky-950/65">
          What it means
        </h3>
        {detail.sentences.map((sentence) => (
          <p key={sentence} className="text-xs font-semibold leading-snug text-neutral-800">
            {sentence}
          </p>
        ))}
      </section>

      <section className="mt-2 grid gap-1.5 rounded-[5px] border border-sky-900/20 bg-white/55 p-2">
        <h3 className="text-[11px] font-semibold uppercase leading-none tracking-normal text-sky-950/65">
          Fun facts
        </h3>
        <ul className="grid gap-1">
          {detail.funFacts.map((fact) => (
            <li
              key={fact}
              className="grid grid-cols-[auto_minmax(0,1fr)] gap-1.5 text-xs font-semibold leading-snug text-neutral-800"
            >
              <Sparkles className="mt-0.5 size-3 shrink-0 text-sky-950" aria-hidden="true" />
              <span>{fact}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-2 grid gap-1.5 rounded-[5px] border border-sky-900/20 bg-white/55 p-2">
        <h3 className="text-[11px] font-semibold uppercase leading-none tracking-normal text-sky-950/65">
          Sources
        </h3>
        <div className="flex flex-wrap gap-1">
          {detail.sourceLinks.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-sky-900/20 bg-sky-50/80 px-1.5 py-0.5 text-[10px] font-bold leading-none text-sky-950 transition-[background-color] hover:bg-sky-100"
            >
              {source.label}
            </a>
          ))}
        </div>
      </section>
    </div>
  </article>
));

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

    if (isEmergentRecipePreview(preview)) {
      return (
        <article
          data-workbench-info-emergent=""
          className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3 p-3 text-neutral-950"
        >
          <header className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3">
            <div className="grid size-14 place-items-center rounded-[5px] border border-amber-900/30 bg-amber-100/75 font-serif text-4xl font-black leading-none text-amber-950">
              ?
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase leading-none tracking-normal text-amber-950/65">
                emergent:pending
              </p>
              <h2 className="truncate font-serif text-2xl leading-none text-amber-950">
                Unknown reaction
              </h2>
              <div className="mt-1 flex flex-wrap gap-1">
                <InfoBadge label="Emergent" />
                <InfoBadge label="Chance" />
                <InfoBadge label={`${preview.orderedIngredientCardIds.length} slots`} />
              </div>
            </div>
          </header>

          <div className="min-h-0 overflow-y-auto pr-1">
            <section className="grid gap-1.5 rounded-[5px] border border-amber-900/20 bg-white/55 p-2">
              <h3 className="text-[11px] font-semibold uppercase leading-none tracking-normal text-amber-950/65">
                Ingredients
              </h3>
              <p className="font-mono text-sm font-black leading-none text-amber-950">
                {preview.formula}
              </p>
              <dl className="grid gap-1">
                {preview.ingredientRows.map((ingredient) => (
                  <div
                    key={ingredient.slotId}
                    className="grid grid-cols-[1fr_auto] gap-2 text-xs leading-tight"
                  >
                    <dt className="min-w-0 truncate font-bold text-neutral-900">
                      {ingredient.label}
                    </dt>
                    <dd className="font-semibold text-neutral-700">Slot {ingredient.slotNumber}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="mt-2 grid gap-1.5 rounded-[5px] border border-amber-900/20 bg-white/55 p-2">
              <h3 className="text-[11px] font-semibold uppercase leading-none tracking-normal text-amber-950/65">
                Mystery pull
              </h3>
              <p className="text-xs font-semibold leading-snug text-neutral-800">
                This combination missed the known recipe ledgers. Swipe the pad to see whether it
                stabilizes into a named emergent card.
              </p>
            </section>
          </div>
        </article>
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
  onRecipeInspect: z.custom<(recipe: RecipeLedgerRecipe) => void>(),
  onRevealSeen: z.custom<(recipeId: string) => void>(),
  revealRecipeIds: z.array(z.string().min(1)),
});

const RecipeLedger = defineComponent(
  RecipeLedgerPropsSchema,
  ({ discoveredRecipeIds, onRecipeInspect, onRevealSeen, revealRecipeIds }) => {
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
              onInspect={onRecipeInspect}
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
  onInspect: z.custom<(recipe: RecipeLedgerRecipe) => void>(),
  recipe: z.custom<RecipeLedgerRecipe>(),
  recipeIndex: z.number().min(0),
});

const RecipeLedgerItem = defineComponent(
  RecipeLedgerItemPropsSchema,
  ({ isDiscovered, isReveal, onInspect, recipe, recipeIndex }) =>
    isDiscovered ? (
      <li
        data-recipe-id={recipe.id}
        data-recipe-discovered="true"
        data-recipe-reveal={isReveal ? "true" : undefined}
        className="rounded-[6px] border border-sky-900/20 bg-white/70 p-1.5 shadow-[0_4px_12px_rgba(15,23,42,0.08)]"
      >
        <button
          type="button"
          className="grid w-full grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-2 rounded-[5px] text-left transition-[background-color,transform] hover:bg-sky-50/75 active:scale-[0.99]"
          onClick={() => {
            onInspect(recipe);
          }}
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
        </button>
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
  filterCardIds: z.array(z.string().min(1)),
  filterDropFeedback: z.custom<DropFeedback>(),
  onFilterRemove: z.custom<(cardId: string) => void>(),
  onRecipeInspect: z.custom<(recipe: ExtendedRecipeLedgerRecipe) => void>(),
  onRevealSeen: z.custom<(recipeId: string) => void>(),
  revealRecipeIds: z.array(z.string().min(1)),
});

const ExtendedRecipeLedger = defineComponent(
  ExtendedRecipeLedgerPropsSchema,
  ({
    discoveredRecipeIds,
    filterCardIds,
    filterDropFeedback,
    onFilterRemove,
    onRecipeInspect,
    onRevealSeen,
    revealRecipeIds,
  }) => {
    const recipeListRef = useRef<HTMLUListElement>(null);
    const onRevealSeenRef = useRef(onRevealSeen);
    const revealRecipeIdsKey = revealRecipeIds.join(RECIPE_REVEAL_ID_SEPARATOR);
    const discoveredRecipeIdsSet = new Set(discoveredRecipeIds);
    const filteredRecipes = getFilteredExtendedMoleculeRecipes(filterCardIds);
    const discoveredCount = filteredRecipes.reduce(
      (total, recipe) => total + (discoveredRecipeIdsSet.has(recipe.id) ? 1 : 0),
      0,
    );
    const filterCards = filterCardIds.flatMap((cardId) => {
      const card = getAlchemyCard(cardId);
      return card ? [card] : [];
    });

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
        data-filter-count={filterCardIds.length}
        className="grid h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] gap-2 p-3"
      >
        <header className="grid grid-cols-[1fr_auto] items-end gap-2">
          <div>
            <h2 className="font-serif text-xl leading-none text-emerald-950">Extended Ledger</h2>
            <p className="mt-1 text-[11px] font-semibold leading-tight text-neutral-700">
              Optional PubChem-backed molecule discoveries.
            </p>
          </div>
          <span className="rounded-full border border-emerald-900/20 bg-white/65 px-2 py-1 font-mono text-[10px] font-black leading-none text-emerald-950">
            {discoveredCount}/{filteredRecipes.length}
          </span>
        </header>
        <ExtendedLedgerSearch
          filterCards={filterCards}
          filterDropFeedback={filterDropFeedback}
          onFilterRemove={onFilterRemove}
        />
        <ul
          ref={recipeListRef}
          data-board-section="extended-recipe-ledger-list"
          className="grid min-h-0 content-start gap-1.5 overflow-y-auto pr-1"
          aria-label="All extended molecule recipes"
          aria-live="polite"
        >
          {filteredRecipes.map((recipe, recipeIndex) => (
            <ExtendedRecipeLedgerItem
              key={recipe.id}
              isDiscovered={discoveredRecipeIdsSet.has(recipe.id)}
              isReveal={revealRecipeIds.includes(recipe.id)}
              onInspect={onRecipeInspect}
              recipe={recipe}
              recipeIndex={recipeIndex}
            />
          ))}
          {filteredRecipes.length === 0 ? (
            <li className="grid min-h-20 place-items-center rounded-[6px] border border-neutral-900/10 bg-white/35 p-3 text-center text-xs font-bold leading-snug text-neutral-700">
              No extended formulas match those elements.
            </li>
          ) : null}
        </ul>
      </section>
    );
  },
);

const ExtendedLedgerSearchPropsSchema = z.object({
  filterCards: z.array(z.custom<AlchemyBoardCard>()),
  filterDropFeedback: z.custom<DropFeedback>(),
  onFilterRemove: z.custom<(cardId: string) => void>(),
});

const ExtendedLedgerSearch = defineComponent(
  ExtendedLedgerSearchPropsSchema,
  ({ filterCards, filterDropFeedback, onFilterRemove }) => {
    const slotIndexes = Array.from(
      { length: EXTENDED_LEDGER_FILTER_SLOT_COUNT },
      (_, index) => index,
    );

    return (
      <div
        data-board-section="extended-ledger-search"
        className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-[6px] border border-emerald-900/15 bg-white/45 p-1.5"
      >
        <span className="text-[10px] font-black uppercase leading-none text-emerald-950/70">
          Search
        </span>
        <div
          data-board-section="extended-ledger-filter-drop-zone"
          data-drop-feedback={filterDropFeedback}
          className="flex min-w-0 items-center gap-1"
        >
          {slotIndexes.map((slotIndex) => {
            const card = filterCards[slotIndex];
            return card ? (
              <button
                key={card.id}
                type="button"
                data-board-section="extended-ledger-filter-card"
                data-card-id={card.id}
                className="group relative grid size-7 shrink-0 place-items-center overflow-hidden rounded-[4px] border border-emerald-700/50 bg-emerald-50 text-emerald-950 shadow-[0_3px_8px_rgba(15,23,42,0.12)] transition-[transform,border-color] hover:border-rose-500 hover:scale-105"
                aria-label={`Remove ${card.name} from extended ledger search`}
                onClick={() => {
                  onFilterRemove(card.id);
                }}
              >
                <span className="scale-[0.72] font-mono text-[13px] font-black leading-none">
                  {card.symbol}
                </span>
                <span className="pointer-events-none absolute inset-0 hidden place-items-center bg-rose-50/92 text-rose-900 group-hover:grid">
                  <X className="size-3.5 stroke-[3]" aria-hidden="true" />
                </span>
              </button>
            ) : (
              <span
                key={`empty-${slotIndex}`}
                data-board-section="extended-ledger-filter-empty-slot"
                data-drop-feedback={filterDropFeedback}
                className={getExtendedLedgerFilterSlotClass(filterDropFeedback)}
                aria-hidden="true"
              />
            );
          })}
        </div>
      </div>
    );
  },
);

type ExtendedRecipeLedgerRecipe = (typeof EXTENDED_MOLECULE_RECIPES)[number];

const ExtendedRecipeLedgerItemPropsSchema = z.object({
  isDiscovered: z.boolean(),
  isReveal: z.boolean(),
  onInspect: z.custom<(recipe: ExtendedRecipeLedgerRecipe) => void>(),
  recipe: z.custom<ExtendedRecipeLedgerRecipe>(),
  recipeIndex: z.number().min(0),
});

const ExtendedRecipeLedgerItem = defineComponent(
  ExtendedRecipeLedgerItemPropsSchema,
  ({ isDiscovered, isReveal, onInspect, recipe, recipeIndex }) =>
    isDiscovered ? (
      <li
        data-recipe-id={recipe.id}
        data-recipe-discovered="true"
        data-recipe-reveal={isReveal ? "true" : undefined}
        className="rounded-[6px] border border-emerald-900/20 bg-white/70 p-1.5 shadow-[0_4px_12px_rgba(15,23,42,0.08)]"
      >
        <button
          type="button"
          className="grid w-full grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-2 rounded-[5px] text-left transition-[background-color,transform] hover:bg-emerald-50/75 active:scale-[0.99]"
          onClick={() => {
            onInspect(recipe);
          }}
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
        </button>
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

const EmergentRecipeLedgerPropsSchema = z.object({
  onRecipeInspect: z.custom<(recipe: AlchemistGuildEmergentRecipe) => void>(),
  onRevealSeen: z.custom<(recipeId: string) => void>(),
  recipes: z.array(z.custom<AlchemistGuildEmergentRecipe>()),
  revealRecipeIds: z.array(z.string().min(1)),
});

const EmergentRecipeLedger = defineComponent(
  EmergentRecipeLedgerPropsSchema,
  ({ onRecipeInspect, onRevealSeen, recipes, revealRecipeIds }) => {
    const recipeListRef = useRef<HTMLUListElement>(null);
    const onRevealSeenRef = useRef(onRevealSeen);
    const revealRecipeIdsKey = revealRecipeIds.join(RECIPE_REVEAL_ID_SEPARATOR);

    useEffect(() => {
      onRevealSeenRef.current = onRevealSeen;
    }, [onRevealSeen]);

    useBrowserLayoutEffect(() => {
      const recipeList = recipeListRef.current;
      if (!recipeList || revealRecipeIdsKey.length === 0) return;

      const cleanups = revealRecipeIdsKey
        .split(RECIPE_REVEAL_ID_SEPARATOR)
        .flatMap((recipeId, index) => {
          const element = recipeList.querySelector(`[data-recipe-id="${recipeId}"]`);
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
        data-board-section="emergent-recipe-ledger"
        className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2 p-3"
      >
        <header className="grid grid-cols-[1fr_auto] items-end gap-2">
          <div>
            <h2 className="font-serif text-xl leading-none text-amber-950">Emergent Ledger</h2>
            <p className="mt-1 text-[11px] font-semibold leading-tight text-neutral-700">
              Stabilized mystery cards append here.
            </p>
          </div>
          <span className="rounded-full border border-amber-900/20 bg-white/65 px-2 py-1 font-mono text-[10px] font-black leading-none text-amber-950">
            {recipes.length}
          </span>
        </header>
        <ul
          ref={recipeListRef}
          data-board-section="emergent-recipe-ledger-list"
          className="grid min-h-0 content-start gap-1.5 overflow-y-auto pr-1"
          aria-label="All emergent discoveries"
          aria-live="polite"
        >
          {recipes.map((recipe) => (
            <EmergentRecipeLedgerItem
              key={recipe.id}
              isReveal={revealRecipeIds.includes(recipe.id)}
              onInspect={onRecipeInspect}
              recipe={recipe}
            />
          ))}
          {recipes.length === 0 ? (
            <li className="grid min-h-20 place-items-center rounded-[6px] border border-neutral-900/10 bg-white/35 p-3 text-center text-xs font-bold leading-snug text-neutral-700">
              No emergent cards yet.
            </li>
          ) : null}
        </ul>
      </section>
    );
  },
);

const EmergentRecipeLedgerItemPropsSchema = z.object({
  isReveal: z.boolean(),
  onInspect: z.custom<(recipe: AlchemistGuildEmergentRecipe) => void>(),
  recipe: z.custom<AlchemistGuildEmergentRecipe>(),
});

const EmergentRecipeLedgerItem = defineComponent(
  EmergentRecipeLedgerItemPropsSchema,
  ({ isReveal, onInspect, recipe }) => (
    <li
      data-recipe-id={recipe.id}
      data-emergent-rarity={recipe.rarity}
      data-recipe-reveal={isReveal ? "true" : undefined}
      className={`rounded-[6px] border p-1.5 shadow-[0_4px_12px_rgba(15,23,42,0.08)] ${getEmergentRecipeShellClass(
        recipe.rarity,
      )}`}
    >
      <button
        type="button"
        className="grid w-full grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-2 rounded-[5px] text-left transition-[background-color,transform] hover:bg-white/35 active:scale-[0.99]"
        onClick={() => {
          onInspect(recipe);
        }}
      >
        <span className="grid size-11 place-items-center rounded-[5px] border border-current/25 bg-white/70 px-1 text-center font-serif text-[22px] font-black leading-none">
          {recipe.syllables[0]?.slice(0, 2).toUpperCase() ?? "?"}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-black leading-tight">{recipe.name}</span>
          <span className="block truncate font-mono text-[10px] font-black leading-tight opacity-75">
            {recipe.formula}
          </span>
        </span>
        <span className="grid justify-items-end gap-1">
          <span className={getEmergentRecipeBadgeClass(recipe.rarity)}>
            {formatEmergentRecipeRarity(recipe.rarity)}
          </span>
          {recipe.count > 1 ? (
            <span className="rounded-full border border-current/20 bg-white/65 px-1.5 py-0.5 font-mono text-[9px] font-black leading-none">
              x{recipe.count}
            </span>
          ) : null}
        </span>
      </button>
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
  avatarPath: z.string().min(1),
  canClaim: z.boolean(),
  claimedQuestIds: z.array(z.string().min(1)),
  claimProgress: z.number().min(0).max(1),
  deliveryComplete: z.boolean(),
  deliveryDropFeedback: z.custom<DropFeedback>(),
  deliveryItems: z.array(QuestDeliveryItemSchema),
  developerNotesVisible: z.boolean(),
  gathering: z.custom<AlchemistGuildGatheringState>(),
  gatheringDropTarget: z.custom<GatheringDropTarget>(),
  hasQuestNotifications: z.boolean(),
  isClaimDragging: z.boolean(),
  isGatheringMode: z.boolean(),
  onClaimPointerDown: z.custom<ButtonPointerDownHandler>(),
  onPlayerNameChange: z.custom<(nextPlayerName: string) => void>(),
  onQuestLogScrollTopChange: z.custom<(scrollTop: number) => void>(),
  onQuestOpenFromLog: z.custom<(questId: string) => void>(),
  onQuestSelect: z.custom<(questId: string) => void>(),
  onTabChange: z.custom<(tab: QuestPanelTab) => void>(),
  playerName: z.string().min(1),
  profileStats: z.array(QuestProfileStatSchema).min(1),
  questAssemblyGuide: z.custom<QuestAssemblyGuide | null>(),
  questLogScrollTop: z.number().min(0),
  questPanelAccepted: z.boolean(),
  selectedQuestId: z.string().min(1),
  title: z.string().min(1),
  unlockedQuestIds: z.array(z.string().min(1)),
});

const LeftModePanel = defineComponent(
  LeftModePanelPropsSchema,
  ({
    activeQuestIds,
    activeTab,
    avatarPath,
    canClaim,
    claimedQuestIds,
    claimProgress,
    deliveryComplete,
    deliveryDropFeedback,
    deliveryItems,
    developerNotesVisible,
    gathering,
    gatheringDropTarget,
    hasQuestNotifications,
    isClaimDragging,
    isGatheringMode,
    onClaimPointerDown,
    onPlayerNameChange,
    onQuestLogScrollTopChange,
    onQuestOpenFromLog,
    onQuestSelect,
    onTabChange,
    playerName,
    profileStats,
    questAssemblyGuide,
    questLogScrollTop,
    questPanelAccepted,
    selectedQuestId,
    title,
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
        } grid h-full min-h-0 grid-rows-[minmax(0,1fr)] overflow-hidden p-2.5 transition-[box-shadow,transform] duration-150`}
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
          avatarPath={avatarPath}
          canClaim={canClaim}
          claimedQuestIds={claimedQuestIds}
          claimProgress={claimProgress}
          deliveryComplete={deliveryComplete}
          deliveryDropFeedback={deliveryDropFeedback}
          deliveryItems={deliveryItems}
          developerNotesVisible={developerNotesVisible}
          hasQuestNotifications={hasQuestNotifications}
          isClaimDragging={isClaimDragging}
          onClaimPointerDown={onClaimPointerDown}
          onPlayerNameChange={onPlayerNameChange}
          onQuestLogScrollTopChange={onQuestLogScrollTopChange}
          onQuestOpenFromLog={onQuestOpenFromLog}
          onQuestSelect={onQuestSelect}
          onTabChange={onTabChange}
          playerName={playerName}
          profileStats={profileStats}
          questAssemblyGuide={questAssemblyGuide}
          questLogScrollTop={questLogScrollTop}
          selectedQuestId={selectedQuestId}
          title={title}
          unlockedQuestIds={unlockedQuestIds}
        />
      </div>
    );
  },
);

const CenterBoardPanelsPropsSchema = z.object({
  boardState: z.custom<AlchemistGuildBoardState>(),
  canTransmutePreview: z.boolean(),
  gatheringConfirmPadTrackRef: z.custom<RefObject<HTMLDivElement | null>>(),
  gatheringConfirmSwipeProgress: z.number().min(0).max(1),
  draggedCard: z.custom<DraggedAlchemyCard | null>(),
  draggedGatheringCard: z.custom<DraggedGatheringCard | null>(),
  dropIntent: z.custom<DropIntent>(),
  gatheringDropChoiceIndex: z.int().min(0).nullable(),
  gatheringDropTarget: z.custom<GatheringDropTarget>(),
  gatheringLevelMastery: z.custom<GatheringLevelMasteryReport>(),
  isGatheringConfirmDragging: z.boolean(),
  isOutputAlreadyMade: z.boolean(),
  isGatheringMode: z.boolean(),
  isTransmuteDragging: z.boolean(),
  nowMs: z.number().min(0),
  onGatheringAnswerPointerDown: z.custom<GatheringAnswerPointerDownHandler>(),
  onGatheringBossAnswer: z.custom<GatheringBossAnswerHandler>(),
  onGatheringBossFailureDismiss: z.custom<GatheringBossCommandHandler>(),
  onGatheringBossRewardClaim: z.custom<GatheringBossCommandHandler>(),
  onGatheringConfirmPointerDown: z.custom<GatheringConfirmPointerDownHandler>(),
  onGatheringMovePointerDown: z.custom<GatheringMovePointerDownHandler>(),
  onGatheringRewardSelect: z.custom<GatheringRewardSelectHandler>(),
  onPhonicsBossAnswer: z.custom<(factId: string) => void>(),
  onPhonicsMovePick: z.custom<(moveId: GatheringMoveId) => void>(),
  onPhonicsWordPick: z.custom<(factId: string) => void>(),
  onSelectGatheringTrack: z.custom<(track: AlchemistGuildGatheringTrackKind) => void>(),
  onSlottedCardPointerDown: z.custom<SlottedCardPointerDownHandler>(),
  onTransmutationSwipePointerDown: z.custom<ButtonPointerDownHandler>(),
  periodicTableViewportRef: z.custom<RefObject<HTMLDivElement | null>>(),
  recipePreview: z.custom<AlchemyWorkbenchAnyRecipePreview | null>(),
  questAssemblyGuide: z.custom<QuestAssemblyGuide | null>(),
  selectedGatheringRewardCardId: z.string().nullable(),
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
    gatheringConfirmPadTrackRef,
    gatheringConfirmSwipeProgress,
    draggedCard,
    draggedGatheringCard,
    dropIntent,
    gatheringDropChoiceIndex,
    gatheringDropTarget,
    gatheringLevelMastery,
    isGatheringConfirmDragging,
    isOutputAlreadyMade,
    isGatheringMode,
    isTransmuteDragging,
    nowMs,
    onGatheringAnswerPointerDown,
    onGatheringBossAnswer,
    onGatheringBossFailureDismiss,
    onGatheringBossRewardClaim,
    onGatheringConfirmPointerDown,
    onGatheringMovePointerDown,
    onGatheringRewardSelect,
    onPhonicsBossAnswer,
    onPhonicsMovePick,
    onPhonicsWordPick,
    onSelectGatheringTrack,
    onSlottedCardPointerDown,
    onTransmutationSwipePointerDown,
    periodicTableViewportRef,
    recipePreview,
    questAssemblyGuide,
    selectedGatheringRewardCardId,
    showBoardDebugBadges,
    swapAnimation,
    transmuteKnobTravelPx,
    transmutePadTrackRef,
    transmuteSwipeProgress,
  }) => {
    const gatheringBossPhase = boardState.gathering.boss.phase;
    const isGatheringBossRewardMode = isGatheringMode && gatheringBossPhase === "reward";
    const isGatheringRewardMode =
      isGatheringMode && boardState.gathering.phase === "reward" && !isGatheringBossRewardMode;
    // No path selected → show the learning-path map (the first thing a player sees).
    const isGatheringPathMapMode = isGatheringMode && boardState.gathering.selectedTrack === null;
    const isGatheringPhonicsMode =
      isGatheringMode && boardState.gathering.selectedTrack === "phonics";
    let primaryPanelContent: ReactNode;
    if (isGatheringPathMapMode) {
      primaryPanelContent = (
        <GatheringPathMap
          onSelectTrack={onSelectGatheringTrack}
          options={getGatheringPathMap(boardState.gathering)}
        />
      );
    } else if (isGatheringBossRewardMode) {
      primaryPanelContent = (
        <GatheringBossRewardPanel
          boss={boardState.gathering.boss}
          onClaim={onGatheringBossRewardClaim}
        />
      );
    } else if (isGatheringMode && gatheringBossPhase === "failed") {
      primaryPanelContent = (
        <GatheringBossFailurePanel
          boss={boardState.gathering.boss}
          onDismiss={onGatheringBossFailureDismiss}
        />
      );
    } else if (isGatheringMode && gatheringBossPhase === "active") {
      primaryPanelContent = isGatheringPhonicsMode ? (
        <GatheringPhonicsBossPanel boss={boardState.gathering.boss} nowMs={nowMs} />
      ) : (
        <GatheringBossFightPanel boss={boardState.gathering.boss} nowMs={nowMs} />
      );
    } else if (isGatheringRewardMode) {
      primaryPanelContent = <GatheringRewardStagePanel gathering={boardState.gathering} />;
    } else if (isGatheringPhonicsMode) {
      primaryPanelContent = (
        <GatheringPhonicsPromptPanel
          gathering={boardState.gathering}
          status={getGatheringPhonicsPanelStatus(boardState.gathering)}
        />
      );
    } else if (isGatheringMode) {
      primaryPanelContent = (
        <GatheringGamePanel
          confirmPadTrackRef={gatheringConfirmPadTrackRef}
          confirmSwipeProgress={gatheringConfirmSwipeProgress}
          draggedGatheringCard={draggedGatheringCard}
          gathering={boardState.gathering}
          gatheringDropTarget={gatheringDropTarget}
          isConfirmDragging={isGatheringConfirmDragging}
          onAnswerPointerDown={onGatheringAnswerPointerDown}
          onConfirmPointerDown={onGatheringConfirmPointerDown}
        />
      );
    } else {
      primaryPanelContent = (
        <BoardDebugBadge
          description={BOARD_DESCRIPTIONS.periodicTableVault}
          label="Periodic Table Vault"
          visible={showBoardDebugBadges}
        />
      );
    }

    let gatheringSecondaryContent: ReactNode;
    if (isGatheringPathMapMode) {
      gatheringSecondaryContent = (
        <div className="grid h-full place-items-center p-6 text-center">
          <p className="max-w-[20rem] text-sm font-bold leading-snug text-neutral-700">
            Each path teaches a different skill. Beat a path&apos;s boss to unlock its next level —
            then come back here to choose what to learn next.
          </p>
        </div>
      );
    } else if (gatheringBossPhase === "active") {
      gatheringSecondaryContent = isGatheringPhonicsMode ? (
        <GatheringPhonicsBossAnswerPanel
          boss={boardState.gathering.boss}
          onAnswer={onPhonicsBossAnswer}
        />
      ) : (
        <GatheringBossAnswerPanel
          boss={boardState.gathering.boss}
          onAnswer={onGatheringBossAnswer}
        />
      );
    } else if (gatheringBossPhase !== "idle") {
      gatheringSecondaryContent = (
        <GatheringBossStatusPanel
          boss={boardState.gathering.boss}
          mastery={gatheringLevelMastery}
        />
      );
    } else if (isGatheringPhonicsMode && boardState.gathering.phase === "move") {
      gatheringSecondaryContent = (
        <GatheringPhonicsMovePanel
          gathering={boardState.gathering}
          onPickMove={onPhonicsMovePick}
        />
      );
    } else if (isGatheringPhonicsMode && boardState.gathering.phase === "solving") {
      gatheringSecondaryContent = (
        <GatheringPhonicsCardsPanel
          gathering={boardState.gathering}
          onPickWord={onPhonicsWordPick}
        />
      );
    } else {
      gatheringSecondaryContent = (
        <GatheringGameCardsPanel
          draggedGatheringCard={draggedGatheringCard}
          gathering={boardState.gathering}
          gatheringDropChoiceIndex={gatheringDropChoiceIndex}
          gatheringDropTarget={gatheringDropTarget}
          onAnswerPointerDown={onGatheringAnswerPointerDown}
          onMovePointerDown={onGatheringMovePointerDown}
          onRewardSelect={onGatheringRewardSelect}
          selectedRewardCardId={selectedGatheringRewardCardId}
        />
      );
    }

    return (
      <section className={getCenterBoardPanelsClass(isGatheringMode)}>
        <div
          ref={periodicTableViewportRef}
          data-board-section={isGatheringMode ? "gathering-game-panel" : "periodic-table-dock"}
          data-board-name={isGatheringMode ? "Game Panel" : "Periodic Table Vault"}
          data-board-description={
            isGatheringMode ? "Primary gathering playfield." : BOARD_DESCRIPTIONS.periodicTableVault
          }
          className={`${
            isGatheringMode ? CLEAR_TABLE_WINDOW_CLASS : PERIODIC_TABLE_WINDOW_CLASS
          } ${GATHERING_PANEL_TRANSITION_CLASS}`}
        >
          {primaryPanelContent}
        </div>

        <div
          data-board-section={isGatheringMode ? "gathering-game-cards-panel" : "alchemy-workbench"}
          data-board-name={isGatheringMode ? "Game Cards" : "Alchemy Workbench"}
          data-board-description={
            isGatheringMode
              ? "Cards available for the gathering encounter."
              : BOARD_DESCRIPTIONS.alchemyWorkbench
          }
          className={getWorkbenchPanelClass(
            isGatheringMode,
            isGatheringMode ? boardState.gathering.phase : null,
          )}
        >
          {isGatheringMode ? (
            gatheringSecondaryContent
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
                className={`relative col-span-full min-h-0 overflow-hidden rounded-[6px] border p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-sm sm:col-span-2 xl:col-span-4 ${
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
                  {getTransmutationPadPrompt(
                    recipePreview,
                    isOutputAlreadyMade,
                    questAssemblyGuide,
                  )}
                </p>
                <QuestTransmutationHint guide={questAssemblyGuide} preview={recipePreview} />
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
                className="relative col-span-full min-h-0 rounded-[6px] border border-neutral-600/80 bg-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-sm sm:col-span-1 sm:col-start-3 xl:col-start-5"
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
    );
  },
);

type ExpeditionQueuedItem = { cardId: string; key: string; name: string };

const ExpeditionQueueListPropsSchema = z.object({
  onRemove: z.custom<(cardId: string) => void>(),
  queued: z.array(z.custom<ExpeditionQueuedItem>()),
});

// The "Up Next" queue under the active expedition (Expedition Queue upgrade). Its
// own component so the panel's aside stays free of nested ternaries.
const ExpeditionQueueList = defineComponent(
  ExpeditionQueueListPropsSchema,
  ({ onRemove, queued }) => (
    <div data-board-section="expedition-queue" className="grid gap-2">
      <p className="text-[10px] font-black uppercase leading-none text-amber-800">
        Up Next {queued.length}/2
      </p>
      {queued.length === 0 ? (
        <p className="rounded-[6px] border border-dashed border-amber-900/20 bg-amber-50/50 p-2 text-[11px] font-bold leading-snug text-amber-900/70">
          Queue up to two more — they launch automatically as each run returns.
        </p>
      ) : (
        queued.map((item) => (
          <div
            key={item.key}
            data-board-section="expedition-queue-item"
            data-card-id={item.cardId}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-[6px] border border-amber-900/15 bg-white/70 px-2 py-1.5"
          >
            <span className="truncate text-xs font-black leading-tight text-sky-950">
              {item.name}
            </span>
            <button
              type="button"
              data-board-section="expedition-queue-remove"
              aria-label={`Remove ${item.name} from the queue`}
              className="grid size-6 place-items-center rounded-full text-rose-700 transition-colors hover:bg-rose-100"
              onClick={() => onRemove(item.cardId)}
            >
              <X className="size-3.5" strokeWidth={2.8} aria-hidden="true" />
            </button>
          </div>
        ))
      )}
    </div>
  ),
);

const ExpeditionCanvasPanelPropsSchema = z.object({
  available: z.boolean(),
  expedition: z.custom<AlchemistGuildExpeditionState>(),
  nowMs: z.number(),
  onCancel: z.custom<() => void>(),
  onRemoveQueued: z.custom<(cardId: string) => void>(),
  onStart: z.custom<(cardId: string) => void>(),
  periodicTableViewportRef: z.custom<RefObject<HTMLDivElement | null>>(),
  queueUpgradeUnlocked: z.boolean(),
  showBoardDebugBadges: z.boolean(),
  targetOptions: z.array(z.custom<ExpeditionTargetOption>()),
});

const ExpeditionCanvasPanel = defineComponent(
  ExpeditionCanvasPanelPropsSchema,
  ({
    available,
    expedition,
    nowMs,
    onCancel,
    onRemoveQueued,
    onStart,
    periodicTableViewportRef,
    queueUpgradeUnlocked,
    showBoardDebugBadges,
    targetOptions,
  }) => {
    const targetCard = getAlchemyCard(expedition.targetCardId);
    const expeditionRunning = Boolean(expedition.targetCardId && expedition.readyAtMs);
    const canQueueMore = canQueueExpedition(expedition, queueUpgradeUnlocked);
    const queuedCards = expedition.queuedTargetCardIds.map((cardId, slot) => ({
      cardId,
      key: `${cardId}-${slot}`,
      name: getAlchemyCard(cardId)?.name ?? cardId,
    }));
    const rewardReady = isExpeditionRewardReady(expedition, nowMs);
    const progress = getExpeditionProgress(expedition, nowMs);
    const remainingLabel = getExpeditionRemainingLabel(expedition, nowMs);

    return (
      <section className="pointer-events-auto grid min-h-0">
        <div
          ref={periodicTableViewportRef}
          data-board-section="expedition-canvas-panel"
          data-board-name="Expedition Canvas"
          data-board-description="Select a known or quest-needed element and send one fixed expedition."
          className={`${CLEAR_TABLE_WINDOW_CLASS} ${GATHERING_PANEL_TRANSITION_CLASS} pointer-events-auto relative overflow-hidden p-4`}
        >
          <BoardDebugBadge
            description="Select a known or quest-needed element and send one fixed expedition."
            label="Expedition Canvas"
            visible={showBoardDebugBadges}
          />
          <span className={GATHERING_PANEL_LABEL_CLASS}>Expedition Canvas</span>

          <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3 pt-8">
            <header className="grid gap-1 rounded-[7px] border border-sky-950/15 bg-white/70 p-3">
              <p className="text-[10px] font-black uppercase leading-none tracking-normal text-sky-950/65">
                Expedition contract
              </p>
              <h2 className="font-serif text-2xl leading-none text-sky-950">
                {available ? "Send a focused scout" : "Glass unlock required"}
              </h2>
              <p className="max-w-3xl text-sm font-semibold leading-snug text-neutral-800">
                {available
                  ? "Pick one element. The scout locks onto it for three minutes, then brings back one card."
                  : "Craft Glass first. Once the guild has glass lenses, expeditions can search for known or quest-needed elements."}
              </p>
            </header>

            <div className="grid min-h-0 gap-3 lg:grid-cols-[minmax(0,1fr)_18rem]">
              <section className="min-h-0 overflow-hidden rounded-[7px] border border-sky-950/15 bg-white/60 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="font-serif text-lg leading-none text-sky-950">Element Targets</h3>
                  <span className="rounded-full border border-sky-900/20 bg-sky-50/80 px-2 py-1 font-mono text-[10px] font-black leading-none text-sky-950">
                    {targetOptions.length}
                  </span>
                </div>
                <div className="grid max-h-full grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-2 overflow-y-auto pr-1">
                  {targetOptions.map((option) => (
                    <ExpeditionTargetButton
                      key={option.card.id}
                      disabled={!available || (expeditionRunning && !canQueueMore)}
                      option={option}
                      selected={option.card.id === expedition.targetCardId}
                      onStart={onStart}
                    />
                  ))}
                </div>
              </section>

              <aside className="grid content-start gap-3 rounded-[7px] border border-amber-900/15 bg-white/65 p-3">
                <h3 className="font-serif text-lg leading-none text-amber-950">Current Run</h3>
                {targetCard ? (
                  <div className="grid gap-3">
                    <div className="grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-3 rounded-[6px] border border-amber-900/15 bg-white/75 p-2">
                      <img
                        src={getAlchemyCardArtSrc(targetCard)}
                        alt=""
                        aria-hidden="true"
                        className="size-12 object-contain"
                        draggable={false}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black leading-tight text-sky-950">
                          {targetCard.name}
                        </span>
                        <span className="block text-[10px] font-bold uppercase leading-tight text-neutral-700">
                          Locked target
                        </span>
                      </span>
                    </div>
                    <progress
                      className="h-3 w-full overflow-hidden rounded-full"
                      max={1}
                      value={progress}
                    >
                      {Math.round(progress * 100)}%
                    </progress>
                    <p className="text-xs font-bold leading-snug text-neutral-800">
                      {rewardReady ? "Delivery is ready." : remainingLabel}
                    </p>
                    <button
                      type="button"
                      className="pointer-events-auto rounded-[5px] border border-rose-900/20 bg-rose-50 px-3 py-2 text-xs font-black uppercase leading-none text-rose-950 transition-colors hover:bg-rose-100"
                      onClick={onCancel}
                    >
                      Cancel Expedition
                    </button>
                  </div>
                ) : (
                  <p className="rounded-[6px] border border-dashed border-neutral-900/20 bg-white/55 p-3 text-sm font-bold leading-snug text-neutral-700">
                    No expedition is running. Choose one target from the list.
                  </p>
                )}
                {queueUpgradeUnlocked ? (
                  <ExpeditionQueueList onRemove={onRemoveQueued} queued={queuedCards} />
                ) : null}
              </aside>
            </div>
          </div>
        </div>
      </section>
    );
  },
);

const ExpeditionTargetButtonPropsSchema = z.object({
  disabled: z.boolean(),
  onStart: z.custom<(cardId: string) => void>(),
  option: z.custom<ExpeditionTargetOption>(),
  selected: z.boolean(),
});

const ExpeditionTargetButton = defineComponent(
  ExpeditionTargetButtonPropsSchema,
  ({ disabled, onStart, option, selected }) => (
    <button
      type="button"
      data-board-section="expedition-target"
      data-card-id={option.card.id}
      data-selected={selected ? "true" : undefined}
      disabled={disabled}
      className={`pointer-events-auto grid min-h-24 grid-rows-[1fr_auto] gap-1 rounded-[6px] border p-2 text-left transition-[background-color,border-color,box-shadow,opacity] ${
        selected
          ? "border-emerald-600/70 bg-emerald-50 shadow-[0_0_0_2px_rgba(16,185,129,0.18)]"
          : "border-sky-950/15 bg-white/70 hover:bg-white/90"
      } disabled:cursor-not-allowed disabled:opacity-55`}
      onClick={() => {
        onStart(option.card.id);
      }}
    >
      <span className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-2">
        <img
          src={getAlchemyCardArtSrc(option.card)}
          alt=""
          aria-hidden="true"
          className="size-9 object-contain"
          draggable={false}
        />
        <span className="min-w-0">
          <span className="block truncate text-sm font-black leading-tight text-sky-950">
            {option.card.name}
          </span>
          <span className="block truncate font-mono text-[11px] font-black leading-none text-sky-950/70">
            {option.card.symbol}
          </span>
        </span>
      </span>
      <span className="justify-self-start rounded-full border border-sky-900/15 bg-sky-50/90 px-1.5 py-0.5 text-[9px] font-black uppercase leading-none text-sky-950">
        {formatExpeditionTargetSource(option.source)}
      </span>
    </button>
  ),
);

const ExpeditionRewardModalPropsSchema = z.object({
  canClaim: z.boolean(),
  card: z.custom<AlchemyBoardCard>(),
  onClaim: z.custom<() => void>(),
  onReset: z.custom<() => void>(),
});

const ExpeditionRewardModal = defineComponent(
  ExpeditionRewardModalPropsSchema,
  ({ canClaim, card, onClaim, onReset }) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useBrowserLayoutEffect(() => {
      const dialogElement = dialogRef.current;
      if (!dialogElement) return;
      if (!dialogElement.open) dialogElement.showModal();

      return () => {
        if (dialogElement.open) dialogElement.close();
      };
    }, []);

    useBrowserLayoutEffect(() => {
      const dialogElement = dialogRef.current;
      if (!dialogElement || prefersReducedMotion()) return;

      const animation = animate(dialogElement, {
        duration: 240,
        ease: "out(3)",
        opacity: [0, 1],
        scale: [0.95, 1],
        y: [16, 0],
      });

      return () => {
        animation.cancel();
      };
    }, []);

    return (
      <dialog
        ref={dialogRef}
        data-board-section="expedition-reward-modal"
        className="m-auto w-[min(24rem,calc(100vw_-_2rem))] rounded-[8px] border border-emerald-700/30 bg-white/95 p-0 text-center text-sky-950 shadow-[0_24px_48px_rgba(15,23,42,0.28)] backdrop:bg-sky-950/25 backdrop:backdrop-blur-[2px]"
        aria-labelledby="expedition-reward-title"
        onCancel={(event) => {
          event.preventDefault();
        }}
      >
        <section className="grid gap-3 p-4">
          <p className="text-[10px] font-black uppercase leading-none tracking-normal text-emerald-800">
            Expedition delivered
          </p>
          <div
            data-board-section="expedition-reward-card"
            className="expedition-reward-card-shader mx-auto grid size-28 place-items-center rounded-[7px] border-2 border-emerald-600/55 bg-emerald-50"
          >
            <img
              src={getAlchemyCardArtSrc(card)}
              alt=""
              aria-hidden="true"
              className="size-20 object-contain"
              draggable={false}
            />
          </div>
          <div>
            <h2
              id="expedition-reward-title"
              className="font-serif text-2xl leading-none text-sky-950"
            >
              {card.name}
            </h2>
            <p className="mt-1 text-sm font-semibold leading-snug text-neutral-800">
              The scout brought back one ready card for Inventory.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[auto_1fr]">
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] border border-rose-900/20 bg-white px-4 py-2 text-xs font-black uppercase leading-none text-rose-950 shadow-[0_2px_0_rgba(15,23,42,0.12)] transition-[background-color,transform] hover:bg-rose-50 active:translate-y-px"
              onClick={onReset}
            >
              <X className="size-4" strokeWidth={2.8} aria-hidden="true" />
              Cancel
            </button>
            <button
              type="button"
              disabled={!canClaim}
              className="rounded-[6px] border border-emerald-700/30 bg-emerald-600 px-4 py-3 text-sm font-black uppercase leading-none text-white shadow-[0_8px_18px_rgba(15,23,42,0.18)] transition-[background-color,opacity] hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-55"
              onClick={onClaim}
            >
              {canClaim ? "Accept Prize" : "Inventory Full"}
            </button>
          </div>
        </section>
      </dialog>
    );
  },
);

const RightModePanelsPropsSchema = z.object({
  activeTab: InfoPanelTabSchema,
  deathAnimation: z.custom<GatheringMonsterDeathAnimation | null>(),
  deathCompletedRound: z.number().nullable(),
  discoveredEmergentRecipes: z.array(z.custom<AlchemistGuildEmergentRecipe>()),
  discoveredExtendedRecipeIds: z.array(z.string().min(1)),
  discoveredRecipeIds: z.array(z.string().min(1)),
  extendedLedgerFilterCardIds: z.array(z.string().min(1)),
  extendedLedgerFilterDropFeedback: z.custom<DropFeedback>(),
  gathering: z.custom<AlchemistGuildGatheringState>(),
  gatheringChargeMoveId: z.custom<GatheringMoveId | null>(),
  gatheringDropTarget: z.custom<GatheringDropTarget>(),
  gatheringInfoPanelRef: z.custom<RefObject<HTMLDivElement | null>>(),
  gatheringLevelMastery: z.custom<GatheringLevelMasteryReport>(),
  gatheringMasteryPulseKey: z.number().int().min(0),
  hasEmergentRecipeNotifications: z.boolean(),
  hasExtendedRecipeNotifications: z.boolean(),
  hasRecipeNotifications: z.boolean(),
  infoPanelCollapsed: z.boolean(),
  isGatheringMode: z.boolean(),
  isGatheringRewardMode: z.boolean(),
  onDeathAnimationComplete: z.custom<GatheringMonsterDeathCompleteHandler>(),
  onEmergentRecipeRevealSeen: z.custom<(recipeId: string) => void>(),
  onExtendedLedgerFilterRemove: z.custom<(cardId: string) => void>(),
  onExtendedRecipeRevealSeen: z.custom<(recipeId: string) => void>(),
  onRecipeRevealSeen: z.custom<(recipeId: string) => void>(),
  onTabChange: z.custom<(tab: InfoPanelTab) => void>(),
  preview: z.custom<AlchemyWorkbenchAnyRecipePreview | null>(),
  revealEmergentRecipeIds: z.array(z.string().min(1)),
  revealExtendedRecipeIds: z.array(z.string().min(1)),
  revealRecipeIds: z.array(z.string().min(1)),
  rightPrimaryPanelRef: z.custom<RefObject<HTMLDivElement | null>>(),
  showBoardDebugBadges: z.boolean(),
});

const RightModePanels = defineComponent(
  RightModePanelsPropsSchema,
  ({
    activeTab,
    deathAnimation,
    deathCompletedRound,
    discoveredEmergentRecipes,
    discoveredExtendedRecipeIds,
    discoveredRecipeIds,
    extendedLedgerFilterCardIds,
    extendedLedgerFilterDropFeedback,
    gathering,
    gatheringChargeMoveId,
    gatheringDropTarget,
    gatheringInfoPanelRef,
    gatheringLevelMastery,
    gatheringMasteryPulseKey,
    hasEmergentRecipeNotifications,
    hasExtendedRecipeNotifications,
    hasRecipeNotifications,
    infoPanelCollapsed,
    isGatheringMode,
    isGatheringRewardMode,
    onDeathAnimationComplete,
    onEmergentRecipeRevealSeen,
    onExtendedLedgerFilterRemove,
    onExtendedRecipeRevealSeen,
    onRecipeRevealSeen,
    onTabChange,
    preview,
    revealEmergentRecipeIds,
    revealExtendedRecipeIds,
    revealRecipeIds,
    rightPrimaryPanelRef,
    showBoardDebugBadges,
  }) => {
    const masteryProgress = clamp(gatheringLevelMastery.progress, 0, 1);
    const storedMasteryProgress = getStoredGatheringMasteryProgress(
      gathering,
      gatheringLevelMastery.currentLevel,
    );
    const masteryFrameStyle = getGatheringMasteryFrameStyle(masteryProgress, storedMasteryProgress);
    const masteryFeedback = getGatheringMasteryFeedback(
      gathering,
      gatheringLevelMastery,
      storedMasteryProgress,
    );
    let primaryPanelContent: ReactNode;
    if (isGatheringMode) {
      primaryPanelContent = (
        <GatheringMonsterPanel
          chargingMoveId={gatheringChargeMoveId}
          deathAnimation={deathAnimation}
          deathCompletedRound={deathCompletedRound}
          gathering={gathering}
          gatheringDropTarget={gatheringDropTarget}
          onDeathAnimationComplete={onDeathAnimationComplete}
        />
      );
    } else if (infoPanelCollapsed) {
      primaryPanelContent = null;
    } else {
      primaryPanelContent = (
        <div className="h-full min-h-0 min-w-0">
          <BoardDebugBadge
            description={BOARD_DESCRIPTIONS.alchemyWorkbenchInfo}
            label="Alchemy Workbench Info"
            visible={showBoardDebugBadges}
          />
          <AlchemyWorkbenchInfoPanel
            activeTab={activeTab}
            discoveredEmergentRecipes={discoveredEmergentRecipes}
            discoveredExtendedRecipeIds={discoveredExtendedRecipeIds}
            discoveredRecipeIds={discoveredRecipeIds}
            extendedLedgerFilterCardIds={extendedLedgerFilterCardIds}
            extendedLedgerFilterDropFeedback={extendedLedgerFilterDropFeedback}
            hasEmergentRecipeNotifications={hasEmergentRecipeNotifications}
            hasExtendedRecipeNotifications={hasExtendedRecipeNotifications}
            hasRecipeNotifications={hasRecipeNotifications}
            onEmergentRecipeRevealSeen={onEmergentRecipeRevealSeen}
            onExtendedLedgerFilterRemove={onExtendedLedgerFilterRemove}
            onExtendedRecipeRevealSeen={onExtendedRecipeRevealSeen}
            onRecipeRevealSeen={onRecipeRevealSeen}
            onTabChange={onTabChange}
            preview={preview}
            revealEmergentRecipeIds={revealEmergentRecipeIds}
            revealExtendedRecipeIds={revealExtendedRecipeIds}
            revealRecipeIds={revealRecipeIds}
          />
        </div>
      );
    }

    return (
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
          data-gathering-mastery-ready={
            isGatheringMode && gatheringLevelMastery.bossReady ? "true" : undefined
          }
          data-gathering-mastery-feedback={isGatheringMode ? masteryFeedback : undefined}
          aria-hidden={isGatheringRewardMode ? true : undefined}
          className={`${getRightPrimaryPanelClass(isGatheringMode, infoPanelCollapsed)} ${
            isGatheringMode ? "gathering-mastery-frame" : ""
          } ${
            isGatheringRewardMode
              ? "pointer-events-none opacity-0 scale-[0.98]"
              : "opacity-100 scale-100"
          }`}
          style={isGatheringMode ? masteryFrameStyle : undefined}
        >
          {isGatheringMode && gatheringMasteryPulseKey > 0 ? (
            <span
              key={gatheringMasteryPulseKey}
              aria-hidden="true"
              className="gathering-mastery-emission"
            />
          ) : null}
          {primaryPanelContent}
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
    );
  },
);

function getCenterBoardPanelsClass(isGatheringMode: boolean): string {
  const baseClass = `grid min-h-0 min-w-0 gap-3 ${GATHERING_PANEL_TRANSITION_CLASS}`;
  if (isGatheringMode) {
    return `${baseClass} lg:grid-rows-[minmax(0,1fr)_minmax(0,13rem)] xl:grid-rows-[minmax(0,1fr)_minmax(0,13rem)]`;
  }

  return `${baseClass} lg:grid-rows-[minmax(0,1fr)_minmax(0,20rem)] xl:grid-rows-[minmax(0,1fr)_minmax(0,22rem)]`;
}

function getBoardChromeClass(): string {
  const baseClass =
    "pointer-events-none relative z-10 mx-auto grid h-full min-h-0 min-w-0 max-w-[1332px]";
  return `${baseClass} grid-rows-[5rem_auto_minmax(0,1fr)] gap-3 lg:grid-rows-[5.5rem_auto_minmax(0,1fr)]`;
}

function getBoardControlRowClass(activeTab: BoardModeTab): string {
  const baseClass = "grid min-h-10 min-w-0 gap-3";
  if (activeTab === "gathering") {
    return `${baseClass} lg:grid-cols-[11rem_minmax(0,1fr)_13.25rem] xl:grid-cols-[14rem_minmax(36rem,1fr)_15rem]`;
  }

  return `${baseClass} lg:grid-cols-[minmax(12rem,240px)_minmax(0,1fr)_minmax(12rem,240px)] xl:grid-cols-[minmax(14rem,316px)_minmax(30rem,1fr)_minmax(14rem,316px)]`;
}

function getBoardCanvasName(isExpeditionMode: boolean): string {
  return isExpeditionMode ? "Expedition Pixi canvas" : "Periodic table Pixi canvas";
}

// One card in the upgrade shop. Redacted entries are dim "???" teasers; the real
// one shows its quest + progress until unlocked, then a glowing "active" state.
type UpgradeProgress = { current: number; max: number } | null;

// The locked-state body of an upgrade card: the unlock hint plus a progress bar
// for numeric unlocks (none for binary ones like "sell once"). Its own component
// so the card avoids a nested ternary.
const UpgradeLockProgressPropsSchema = z.object({
  hint: z.string(),
  progress: z.custom<UpgradeProgress>(),
});

const UpgradeLockProgress = defineComponent(
  UpgradeLockProgressPropsSchema,
  ({ hint, progress }) => (
    <div className="mt-1 grid gap-1">
      <p className="text-[11px] font-bold leading-none text-neutral-600">{hint}</p>
      {progress ? (
        <>
          <div className="h-1.5 overflow-hidden rounded-full bg-neutral-900/15">
            <div
              className="h-full rounded-full bg-amber-500 transition-[width] duration-300"
              style={{ width: `${(progress.current / progress.max) * 100}%` }}
            />
          </div>
          <p className="text-[10px] font-black tabular-nums text-neutral-500">
            {progress.current} / {progress.max}
          </p>
        </>
      ) : null}
    </div>
  ),
);

const UpgradeShopCardPropsSchema = z.object({
  // True when the upgrade's threshold is met but it awaits the player's confirm
  // (the New Reward Slot opt-in); shows an Activate button instead of progress.
  confirmable: z.boolean().default(false),
  entry: z.custom<UpgradeCatalogEntry>(),
  onConfirm: z.custom<() => void>(),
  progress: z.custom<UpgradeProgress>(),
  unlocked: z.boolean(),
});

const UpgradeShopCard = defineComponent(
  UpgradeShopCardPropsSchema,
  ({ confirmable, entry, onConfirm, progress, unlocked }) => {
    if (entry.redacted) {
      return (
        <article
          data-board-section="upgrade-card"
          data-upgrade-redacted="true"
          className="grid min-h-32 content-center justify-items-center gap-2 rounded-[10px] border-2 border-dashed border-neutral-900/20 bg-white/40 p-4 text-center"
        >
          <LockKeyhole className="size-6 text-neutral-500" strokeWidth={2.4} aria-hidden="true" />
          <span className="text-lg font-black tracking-widest text-neutral-500">???</span>
          <span className="text-[11px] font-bold text-neutral-500">A future upgrade.</span>
        </article>
      );
    }

    // Footer reads one of three states without a nested JSX ternary.
    let footer: ReactNode;
    if (unlocked) {
      footer = (
        <p className="mt-1 text-[11px] font-black uppercase leading-none text-amber-800">Active</p>
      );
    } else if (confirmable) {
      footer = (
        <button
          type="button"
          data-board-section="upgrade-confirm"
          onClick={onConfirm}
          className="mt-1 justify-self-start rounded-full border-2 border-amber-700/40 bg-amber-500 px-3 py-1.5 text-xs font-black uppercase leading-none text-amber-950 shadow-[0_2px_0_rgba(120,53,16,0.28)] transition-[transform,background-color] hover:bg-amber-400 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
        >
          Activate
        </button>
      );
    } else {
      footer = <UpgradeLockProgress hint={entry.unlockHint} progress={progress} />;
    }

    return (
      <article
        data-board-section="upgrade-card"
        data-upgrade-id={entry.id}
        data-upgrade-confirmable={confirmable ? "true" : "false"}
        data-upgrade-unlocked={unlocked ? "true" : "false"}
        className={`grid min-h-32 content-start gap-2 rounded-[10px] border-2 p-4 ${
          unlocked
            ? "border-amber-500/70 bg-amber-50/80 shadow-[0_0_0_3px_rgba(245,158,11,0.18)]"
            : "border-neutral-900/25 bg-white/70"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-black leading-tight text-neutral-950">{entry.title}</h3>
          {unlocked ? (
            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black uppercase leading-none text-amber-950">
              Unlocked
            </span>
          ) : null}
        </div>
        <p className="text-xs font-bold leading-snug text-neutral-700">{entry.description}</p>
        {footer}
      </article>
    );
  },
);

const UpgradesPanelPropsSchema = z.object({
  discoveredEmergentCount: z.int().min(0),
  gatheringSessionsCompleted: z.int().min(0),
  onConfirmUpgrade: z.custom<(upgradeId: string) => void>(),
  unlockedUpgradeIds: z.array(z.string()),
});

const UpgradesPanel = defineComponent(
  UpgradesPanelPropsSchema,
  ({
    discoveredEmergentCount,
    gatheringSessionsCompleted,
    onConfirmUpgrade,
    unlockedUpgradeIds,
  }) => (
    <div
      data-board-section="upgrades-panel"
      className={`${GLASS_PANEL_CLASS} grid h-full content-start gap-4 overflow-y-auto p-6`}
    >
      <header className="grid gap-1 text-center">
        <h2 className="text-lg font-black leading-tight text-amber-950">Upgrade Workshop</h2>
        <p className="text-sm font-bold leading-snug text-amber-900/70">
          Earn upgrades to bend the guild's rules in your favor. More to come.
        </p>
      </header>
      <div className="mx-auto grid w-full max-w-[52rem] gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {UPGRADE_CATALOG.map((entry) => (
          <UpgradeShopCard
            key={entry.id}
            confirmable={
              entry.id === NEW_REWARD_SLOT_UPGRADE_ID &&
              isNewRewardSlotConfirmable(gatheringSessionsCompleted, unlockedUpgradeIds)
            }
            entry={entry}
            onConfirm={() => onConfirmUpgrade(entry.id)}
            progress={getUpgradeProgress(
              entry.id,
              discoveredEmergentCount,
              gatheringSessionsCompleted,
            )}
            unlocked={unlockedUpgradeIds.includes(entry.id)}
          />
        ))}
      </div>
    </div>
  ),
);

function getBoardCanvasClass(isGatheringMode: boolean, isExpeditionMode: boolean): string {
  const baseClass =
    "absolute inset-0 z-0 block size-full touch-none transition-opacity duration-300 motion-reduce:transition-none";
  if (isGatheringMode) return `${baseClass} pointer-events-none opacity-0`;
  if (isExpeditionMode) return `${baseClass} pointer-events-none opacity-100`;

  return `${baseClass} opacity-100`;
}

function getBoardCanvasAriaLabel(isGatheringMode: boolean, isExpeditionMode: boolean): string {
  if (isGatheringMode) return "Board canvas hidden while gathering";
  if (isExpeditionMode) return "Expedition visual backdrop canvas";

  return "Periodic table Pixi canvas";
}

function getWorkbenchPanelClass(
  isGatheringMode: boolean,
  gatheringPhase: AlchemistGuildGatheringState["phase"] | null,
): string {
  if (isGatheringMode) {
    if (gatheringPhase === "reward") {
      return `${GLASS_PANEL_CLASS} grid grid-cols-[repeat(auto-fit,minmax(105px,105px))] grid-rows-[minmax(0,1fr)] justify-center gap-5 overflow-visible p-4 pt-10`;
    }

    return `${GLASS_PANEL_CLASS} grid grid-cols-[repeat(5,105px)] grid-rows-[minmax(0,1fr)] justify-center gap-2 overflow-hidden p-4 pt-10 xl:gap-3`;
  }

  return `${GLASS_PANEL_CLASS} grid grid-cols-2 grid-rows-[repeat(4,minmax(0,1fr))] gap-3 p-3 sm:grid-cols-3 sm:grid-rows-none lg:gap-5 xl:grid-cols-5 xl:grid-rows-[minmax(0,1fr)_minmax(0,1fr)] xl:gap-8`;
}

function getRightModePanelsClass(isGatheringMode: boolean): string {
  const baseClass = `hidden min-h-0 min-w-0 overflow-hidden lg:grid ${GATHERING_PANEL_TRANSITION_CLASS}`;
  if (isGatheringMode) {
    return `${baseClass} gap-3 lg:grid-rows-[minmax(0,1fr)_minmax(0,13rem)] xl:grid-rows-[minmax(0,1fr)_minmax(0,13rem)]`;
  }

  return `${baseClass} gap-0 lg:grid-rows-[minmax(0,1fr)_minmax(0,0px)]`;
}

function getRightPrimaryPanelClass(isGatheringMode: boolean, infoPanelCollapsed: boolean): string {
  const baseClass = `${GLASS_PANEL_CLASS} overflow-hidden ${GATHERING_PANEL_TRANSITION_CLASS}`;
  if (isGatheringMode) return `${baseClass} p-3`;
  if (infoPanelCollapsed)
    return `${baseClass} pointer-events-none size-0 self-center justify-self-center border-transparent bg-transparent opacity-0 shadow-none`;

  return baseClass;
}

function getMainBoardGridClass(questPanelCollapsed: boolean, isGatheringMode: boolean): string {
  const baseClass = `grid min-h-0 min-w-0 gap-3 ${BOARD_MAIN_GRID_TRANSITION_CLASS}`;
  if (isGatheringMode) {
    return questPanelCollapsed
      ? `${baseClass} lg:grid-cols-[3.75rem_minmax(0,1fr)_13.25rem] xl:grid-cols-[3.75rem_minmax(36rem,1fr)_15rem]`
      : `${baseClass} lg:grid-cols-[11rem_minmax(0,1fr)_13.25rem] xl:grid-cols-[14rem_minmax(36rem,1fr)_15rem]`;
  }

  return questPanelCollapsed
    ? `${baseClass} lg:grid-cols-[3.75rem_minmax(0,1fr)_minmax(12rem,240px)] xl:grid-cols-[3.75rem_minmax(30rem,1fr)_minmax(14rem,316px)]`
    : `${baseClass} lg:grid-cols-[minmax(12rem,240px)_minmax(0,1fr)_minmax(12rem,240px)] xl:grid-cols-[minmax(14rem,316px)_minmax(30rem,1fr)_minmax(14rem,316px)]`;
}

export const AlchemistGuildBoard = defineComponent(AlchemistGuildBoardPropsSchema, () => {
  const boardState = useAtomValue(alchemistGuildBoardAtom);
  const setBoardState = useSetAtom(alchemistGuildBoardAtom);
  const initialIntroZeroState = isAlchemyIntroZeroState(boardState);
  const periodicTableCanvasRef = useRef<HTMLCanvasElement>(null);
  const periodicTableViewportRef = useRef<HTMLDivElement>(null);
  const rightPrimaryPanelRef = useRef<HTMLDivElement>(null);
  const gatheringInfoPanelRef = useRef<HTMLDivElement>(null);
  const draggedCardElementRef = useRef<HTMLDivElement>(null);
  const draggedGatheringCardElementRef = useRef<HTMLDivElement>(null);
  const swapAnimationElementRef = useRef<HTMLDivElement>(null);
  const transmuteFlyAnimationElementRef = useRef<HTMLDivElement>(null);
  const transmutePadTrackRef = useRef<HTMLDivElement>(null);
  const gatheringConfirmPadTrackRef = useRef<HTMLDivElement>(null);
  const boardStateRef = useRef(boardState);
  const autoQuestVoiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const autoQuestVoiceSelectionRef = useRef<string | null>(null);
  const autoQuestVoiceTimeoutRef = useRef<number | null>(null);
  const extendedLedgerFilterCardIdsRef = useRef<string[]>([]);
  const dropIntentRef = useRef<DropIntent>(EMPTY_DROP_INTENT);
  const gatheringDropTargetRef = useRef<GatheringDropTarget>("none");
  const gatheringDropChoiceIndexRef = useRef<number | null>(null);
  const gatheringDropFeedbackRef = useRef<GatheringDropFeedback>("none");
  const introZeroActiveRef = useRef(initialIntroZeroState);
  const animatedGatheringRewardKeyRef = useRef<string | null>(null);
  const gatheringNudgePlayedKeyRef = useRef<string | null>(null);
  const notifiedCooldownIdsRef = useRef<Set<string> | null>(null);
  const dragSequenceRef = useRef(0);
  const gatheringDragSequenceRef = useRef(0);
  const swapAnimationSequenceRef = useRef(0);
  const transmuteFlyAnimationSequenceRef = useRef(0);
  const questRewardFlyAnimationSequenceRef = useRef(0);
  const gatheringMonsterDeathAnimationSequenceRef = useRef(0);
  const gatheringSessionReviewSequenceRef = useRef(0);
  const depositedGatheringSessionReviewIdRef = useRef<string | null>(null);
  const pendingGatheringElementRevealIdsRef = useRef<string[]>([]);
  const gatheringWrongResetKeyRef = useRef<string | null>(null);
  const previousGatheringStateRef = useRef<AlchemistGuildGatheringState | null>(null);
  const [draggedCard, setDraggedCard] = useState<DraggedAlchemyCard | null>(null);
  const [draggedGatheringCard, setDraggedGatheringCard] = useState<DraggedGatheringCard | null>(
    null,
  );
  const [dropIntent, setDropIntent] = useState<DropIntent>(EMPTY_DROP_INTENT);
  const [gatheringDropTarget, setGatheringDropTarget] = useState<GatheringDropTarget>("none");
  const [gatheringDropChoiceIndex, setGatheringDropChoiceIndex] = useState<number | null>(null);
  const [gatheringDropFeedback, setGatheringDropFeedback] = useState<GatheringDropFeedback>("none");
  const [swapAnimation, setSwapAnimation] = useState<SwapAnimation | null>(null);
  const [transmuteFlyAnimation, setTransmuteFlyAnimation] = useState<TransmuteFlyAnimation | null>(
    null,
  );
  // The in-flight Orbit Forge round (the emergent-craft mini-game), or null. The
  // preview's ingredients stay on the bench until the round resolves; this is
  // ephemeral modal state, not persisted (the discovery it yields is what lands
  // in IDB).
  const [forgeRound, setForgeRound] = useState<ForgeRoundContext | null>(null);
  const [questRewardFlyAnimation, setQuestRewardFlyAnimation] =
    useState<QuestRewardFlyAnimation | null>(null);
  const [transmuteSwipeProgress, setTransmuteSwipeProgress] = useState(0);
  const [isTransmuteDragging, setIsTransmuteDragging] = useState(false);
  const [transmuteTrackWidth, setTransmuteTrackWidth] = useState(0);
  const [gatheringConfirmSwipeProgress, setGatheringConfirmSwipeProgress] = useState(0);
  const [isGatheringConfirmDragging, setIsGatheringConfirmDragging] = useState(false);
  const [selectedGatheringRewardCardId, setSelectedGatheringRewardCardId] = useState<string | null>(
    null,
  );
  const [celestialBonusFly, setCelestialBonusFly] = useState<CelestialBonusFly | null>(null);
  const celestialBonusFlySeqRef = useRef(0);
  const [gatheringSessionReview, setGatheringSessionReview] =
    useState<GatheringSessionReviewState | null>(null);
  const [gatheringWrongResetKey, setGatheringWrongResetKey] = useState<string | null>(null);
  const [extendedLedgerFilterCardIds, setExtendedLedgerFilterCardIds] = useState<string[]>([]);
  const [gatheringMonsterDeathUiState, setGatheringMonsterDeathUiState] =
    useState<GatheringMonsterDeathUiState>(EMPTY_GATHERING_MONSTER_DEATH_UI_STATE);
  const [questClaimSwipeStateByQuestId, setQuestClaimSwipeStateByQuestId] =
    useState<QuestClaimSwipeStateByQuestId>({});
  const [introPhase, setIntroPhase] = useState<AlchemistGuildIntroPhase>(
    initialIntroZeroState ? "zero" : "complete",
  );
  const [infoPanelTab, setInfoPanelTab] = useState<InfoPanelTab>("element");
  const [infoPanelCollapsed, setInfoPanelCollapsed] = useState(initialIntroZeroState);
  const [questPanelCollapsed, setQuestPanelCollapsed] = useState(initialIntroZeroState);
  const [questPanelTab, setQuestPanelTab] = useState<QuestPanelTab>("current");
  const [periodicTableRevealElementIds, setPeriodicTableRevealElementIds] = useState<string[]>([]);
  const [pendingRecipeNotificationIds, setPendingRecipeNotificationIds] = useState<string[]>([]);
  const [pendingExtendedRecipeNotificationIds, setPendingExtendedRecipeNotificationIds] = useState<
    string[]
  >([]);
  const [pendingEmergentRecipeNotificationIds, setPendingEmergentRecipeNotificationIds] = useState<
    string[]
  >([]);
  const [pendingQuestNotificationIds, setPendingQuestNotificationIds] = useState<string[]>([]);
  const [gatheringNudgeDismissedKey, setGatheringNudgeDismissedKey] = useState<string | null>(null);
  const [gatheringMasteryPulseKey, setGatheringMasteryPulseKey] = useState(0);
  const [expeditionReveal, setExpeditionReveal] = useState({
    active: false,
    key: 0,
  });
  const [recipeRevealIds, setRecipeRevealIds] = useState<string[]>([]);
  const [extendedRecipeRevealIds, setExtendedRecipeRevealIds] = useState<string[]>([]);
  const [emergentRecipeRevealIds, setEmergentRecipeRevealIds] = useState<string[]>([]);
  const [emergentTransmutationNotice, setEmergentTransmutationNotice] =
    useState<EmergentTransmutationNotice | null>(null);
  const showBoardDebugBadges = useLocalhostMetaKeyDebugBadges();
  const nowMs = useInventoryClock();
  const workbenchCardIds = getWorkbenchCardIds(boardState);
  const hasWorkbenchCards = workbenchCardIds.some((cardId) => cardId !== null);
  const recipePreview = getAlchemyWorkbenchRecipePreview(workbenchCardIds);
  const extendedRecipePreview = recipePreview
    ? null
    : getAlchemyWorkbenchExtendedRecipePreview(workbenchCardIds);
  const emergentRecipePreview =
    recipePreview || extendedRecipePreview
      ? null
      : getAlchemyWorkbenchEmergentPreview(workbenchCardIds);
  const transmutationPreview = recipePreview ?? extendedRecipePreview ?? emergentRecipePreview;
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
  const selectedQuestDelivery = getQuestDelivery(boardState.questDeliveries, selectedQuestId);
  // One page per deliverable: a bundle quest yields its components (Salt/Charcoal/Ash);
  // a simple quest a single item. The delivery state holds the per-card delivered count.
  const selectedQuestDeliveryItems = getQuestDeliverables(selectedQuest).flatMap((deliverable) => {
    const card = getAlchemyCard(deliverable.cardId);
    return card
      ? [
          {
            card,
            delivered: getQuestDeliveredCount(selectedQuestDelivery, deliverable.cardId),
            required: deliverable.required,
          },
        ]
      : [];
  });
  const selectedQuestDeliveryComplete = isQuestDeliveryComplete(
    selectedQuest,
    selectedQuestDelivery,
  );
  const claimedSelectedQuest = boardState.completedQuestIds.includes(selectedQuestId);
  const selectedQuestClaimSwipeState = getQuestClaimSwipeState(
    questClaimSwipeStateByQuestId,
    selectedQuestId,
  );
  const selectedQuestUnlocked = unlockedQuestIds.includes(selectedQuestId);
  const canClaimSelectedQuest =
    selectedQuestUnlocked && !claimedSelectedQuest && selectedQuestDeliveryComplete;
  const selectedQuestAssemblyGuide =
    selectedQuestUnlocked && !claimedSelectedQuest
      ? createQuestAssemblyGuide(boardState, selectedQuest, nowMs)
      : null;
  const questPanelAccepted = isQuestPanelAcceptedDrop(dropIntent);
  const expeditionAvailable = isExpeditionAvailable(boardState);
  const gatheringAvailable = isGatheringAvailable(boardState.completedQuestIds);
  // The tab shows once any upgrade is unlocked OR the New Reward Slot is waiting
  // to be confirmed — otherwise a player who hit 5 sessions first couldn't reach it.
  const upgradesAvailable =
    isUpgradesTabAvailable(boardState.unlockedUpgradeIds) ||
    isNewRewardSlotConfirmable(
      boardState.gatheringSessionsCompleted,
      boardState.unlockedUpgradeIds,
    );
  const expeditionQueueUnlocked = hasUpgrade(
    boardState.unlockedUpgradeIds,
    EXPEDITION_QUEUE_UPGRADE_ID,
  );
  const activeBoardMode = resolveVisibleBoardMode({
    activeBoardMode: boardState.activeBoardMode,
    expeditionAvailable,
    gatheringAvailable,
    upgradesAvailable,
  });
  const isGatheringMode = activeBoardMode === "gathering";
  const isExpeditionMode = activeBoardMode === "expedition";
  const isUpgradesMode = activeBoardMode === "upgrades";
  const introEligible = isAlchemyIntroZeroState(boardState);
  const introZeroActive = introEligible && introPhase === "zero";
  const introCameraTransitionActive = introPhase === "zooming";
  const gatheringRevealActive = gatheringAvailable && !boardState.gathering.unlockSeen;
  const gatheringRevealKey = gatheringRevealActive ? boardState.completedQuestIds.length : 0;
  const expeditionNudgeActive = expeditionAvailable && !boardState.expedition.unlockSeen;
  const expeditionTargetOptions = getExpeditionTargetOptions(
    boardState,
    selectedQuestUnlocked && !claimedSelectedQuest ? selectedQuest : null,
  );
  const expeditionRewardReady = isExpeditionRewardReady(boardState.expedition, nowMs);
  const expeditionRewardCard = getAlchemyCard(boardState.expedition.targetCardId);
  const expeditionRewardModalCard = getExpeditionRewardModalCard({
    card: expeditionRewardCard,
    gatheringSessionReview,
    gatheringWrongResetKey,
    rewardReady: expeditionRewardReady,
  });
  const canClaimExpeditionReward =
    expeditionRewardReady &&
    getInventoryDestinationSlotId(boardState, boardState.expedition.targetCardId ?? "") !== null;
  const noAvailablePeriodicElements = !hasAvailablePeriodicElement(boardState);
  const craftingNeedsGathering =
    gatheringAvailable &&
    !draggedCard &&
    ((!hasWorkbenchCards && noAvailablePeriodicElements) ||
      (!canTransmutePreview && !canCompleteAnyPeriodicRecipe(boardState)));
  const gatheringNudgeKey = craftingNeedsGathering ? createGatheringNudgeKey(boardState) : null;
  const gatheringNudgeActive = shouldShowGatheringNudge({
    activeBoardMode,
    dismissedKey: gatheringNudgeDismissedKey,
    gatheringNudgeKey,
    gatheringUnlockSeen: boardState.gathering.unlockSeen,
  });
  const transmuteKnobTravelPx = getTransmuteKnobTravelPx(transmuteTrackWidth);
  const canConfirmGatheringAnswer =
    isGatheringMode &&
    boardState.gathering.phase === "solving" &&
    boardState.gathering.equation.selectedValue !== null &&
    boardState.gathering.boss.phase === "idle" &&
    boardState.gathering.wrongAnswerStreak < 3 &&
    gatheringSessionReview === null &&
    gatheringWrongResetKey === null;
  const gatheringLevelMastery = createGatheringLevelMasteryReport(boardState.gathering, nowMs);
  const storedGatheringMasteryProgress = getStoredGatheringMasteryProgress(
    boardState.gathering,
    gatheringLevelMastery.currentLevel,
  );
  const gatheringBossPhase = boardState.gathering.boss.phase;
  const gatheringBossProblemEndsAtMs = boardState.gathering.boss.problemEndsAtMs;
  const gatheringBossReady =
    isGatheringMode &&
    boardState.gathering.phase !== "reward" &&
    boardState.gathering.boss.phase === "idle" &&
    isGatheringBossReady(boardState.gathering, nowMs);
  const isGatheringRewardMode =
    isGatheringMode &&
    (boardState.gathering.phase === "reward" || boardState.gathering.boss.phase === "reward");
  const gatheringRewardAnimationKey = isGatheringRewardMode
    ? `${boardState.gathering.round}:${boardState.gathering.rewardOptionCardIds.join("|")}`
    : null;
  const periodicTableDiscoveredKey = boardState.discoveredElementIds.join("|");
  const periodicTableQuantityKey = ELEMENT_CARDS.map(
    (card) => `${card.id}:${boardState.elementQuantities[card.id] ?? 0}`,
  ).join("|");
  const periodicTableRevealKey = periodicTableRevealElementIds.join("|");
  let periodicTableCameraModeKey = "fit";
  if (introZeroActive) {
    periodicTableCameraModeKey = "intro-hydrogen";
  } else if (introCameraTransitionActive) {
    periodicTableCameraModeKey = "intro-zoom-out";
  }
  boardStateRef.current = boardState;
  extendedLedgerFilterCardIdsRef.current = extendedLedgerFilterCardIds;
  introZeroActiveRef.current = introZeroActive;

  useEffect(() => {
    const stopAutoQuestVoice = () => {
      if (autoQuestVoiceTimeoutRef.current !== null) {
        window.clearTimeout(autoQuestVoiceTimeoutRef.current);
        autoQuestVoiceTimeoutRef.current = null;
      }

      const audio = autoQuestVoiceAudioRef.current;
      if (!audio) return;
      audio.onended = null;
      audio.pause();
      audio.currentTime = 0;
      autoQuestVoiceAudioRef.current = null;
    };

    stopAutoQuestVoice();

    const previousQuestId = autoQuestVoiceSelectionRef.current;
    autoQuestVoiceSelectionRef.current = selectedQuestId;
    if (previousQuestId === null || previousQuestId === selectedQuestId) return stopAutoQuestVoice;
    if (questPanelTab !== "current") return stopAutoQuestVoice;

    const quest = getAlchemyQuestById(selectedQuestId);
    const voiceClipPath = quest
      ? getQuestAutoVoiceClipPath({
          autoPlayedQuestVoiceIds: boardStateRef.current.autoPlayedQuestVoiceIds,
          questId: selectedQuestId,
          unlocked: selectedQuestUnlocked,
          voiceClipPath: getQuestRequesterVoiceClipPath(quest),
        })
      : null;
    if (!voiceClipPath) return stopAutoQuestVoice;

    setBoardState((previous) => markQuestVoiceAutoPlayed(previous, selectedQuestId));
    autoQuestVoiceTimeoutRef.current = window.setTimeout(() => {
      autoQuestVoiceTimeoutRef.current = null;
      const audio = new Audio(resolvePublicAssetPath(voiceClipPath));
      const releaseAudio = () => {
        audio.onended = null;
        if (autoQuestVoiceAudioRef.current === audio) autoQuestVoiceAudioRef.current = null;
      };

      audio.onended = releaseAudio;
      autoQuestVoiceAudioRef.current = audio;
      audio.currentTime = 0;
      void audio.play().catch(() => {
        releaseAudio();
      });
    }, QUEST_AUTO_VOICE_DEBOUNCE_MS);

    return stopAutoQuestVoice;
  }, [questPanelTab, selectedQuestId, selectedQuestUnlocked, setBoardState]);

  useEffect(() => {
    const currentProgress = clamp(gatheringLevelMastery.progress, 0, 1);
    if (Math.abs(storedGatheringMasteryProgress - currentProgress) < 0.000_1) return;

    const delayMs = currentProgress < storedGatheringMasteryProgress ? 780 : 0;
    const timeoutId = window.setTimeout(() => {
      setBoardState((previous) => {
        const nextGathering = recordGatheringMasteryProgress(
          previous.gathering,
          createGatheringLevelMasteryReport(previous.gathering, Date.now()),
        );
        return nextGathering === previous.gathering
          ? previous
          : {
              ...previous,
              gathering: nextGathering,
            };
      });
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [gatheringLevelMastery.progress, setBoardState, storedGatheringMasteryProgress]);

  useEffect(() => {
    if (activeBoardMode === boardState.activeBoardMode) return;

    setBoardState((previous) => {
      const nextActiveBoardMode = resolveVisibleBoardMode({
        activeBoardMode: previous.activeBoardMode,
        expeditionAvailable,
        gatheringAvailable,
        upgradesAvailable,
      });
      return nextActiveBoardMode === previous.activeBoardMode
        ? previous
        : {
            ...previous,
            activeBoardMode: nextActiveBoardMode,
          };
    });
  }, [
    activeBoardMode,
    boardState.activeBoardMode,
    expeditionAvailable,
    gatheringAvailable,
    setBoardState,
    upgradesAvailable,
  ]);

  useEffect(() => {
    if (!expeditionAvailable || boardState.expedition.unlockAnnounced) return;

    setExpeditionReveal((previous) => ({
      active: true,
      key: previous.key + 1,
    }));
    setBoardState((previous) =>
      previous.expedition.unlockAnnounced
        ? previous
        : {
            ...previous,
            expedition: {
              ...previous.expedition,
              unlockAnnounced: true,
            },
          },
    );
    void sfx.play("expedition.unlocked");
  }, [boardState.expedition.unlockAnnounced, expeditionAvailable, setBoardState]);

  useEffect(() => {
    if (!expeditionReveal.active) return;

    const timeoutId = window.setTimeout(() => {
      setExpeditionReveal((previous) =>
        previous.active
          ? {
              ...previous,
              active: false,
            }
          : previous,
      );
    }, 2200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [expeditionReveal.active]);

  useEffect(() => {
    if (!expeditionRewardReady || boardState.expedition.readyNotified) return;

    setBoardState((previous) =>
      previous.expedition.readyNotified
        ? previous
        : {
            ...previous,
            expedition: {
              ...previous.expedition,
              readyNotified: true,
            },
          },
    );
    void sfx.play("cooldown.ready");
    // Unified event model: raise the "expedition returned" toast here + across
    // tabs. readyNotified (persisted) gates this to once per expedition, and
    // other tabs receive the broadcast rather than re-firing their own effect.
    notifyGameEvent("expedition-ready");
  }, [boardState.expedition.readyNotified, expeditionRewardReady, setBoardState]);

  // First quest complete — fire once on the live 0→1 transition (not on reload,
  // where the ref initializes to the already-completed count).
  const previousQuestCountRef = useRef(boardState.completedQuestIds.length);
  useEffect(() => {
    const previousCount = previousQuestCountRef.current;
    const currentCount = boardState.completedQuestIds.length;
    previousQuestCountRef.current = currentCount;
    if (previousCount === 0 && currentCount >= 1) notifyGameEvent("quest-first-complete");
  }, [boardState.completedQuestIds.length]);

  // Expeditions just unlocked — fire once on the false→true transition.
  const previousExpeditionAvailableRef = useRef(expeditionAvailable);
  useEffect(() => {
    const wasAvailable = previousExpeditionAvailableRef.current;
    previousExpeditionAvailableRef.current = expeditionAvailable;
    if (!wasAvailable && expeditionAvailable) notifyGameEvent("expedition-unlocked");
  }, [expeditionAvailable]);

  // First upgrade earned (4 emergent discoveries → Expedition Queue) — reveals the
  // Upgrades tab + raises the toast. In a hook to keep the board thin.
  useUpgradeUnlocks(
    boardState.discoveredEmergentRecipes.length,
    boardState.discoveredExtendedRecipeIds.length,
    boardState.gathering.streak.longest,
    boardState.unlockedUpgradeIds,
    setBoardState,
  );

  const handleGatheringMonsterDeathAnimationComplete = (animationId: string, round: number) => {
    setGatheringMonsterDeathUiState((current) =>
      current.animation?.id === animationId ? { animation: null, completedRound: round } : current,
    );
  };

  const handleExpeditionStart = (cardId: string) => {
    const currentBoardState = boardStateRef.current;
    if (!isExpeditionAvailable(currentBoardState)) return;

    const targetOptions = getExpeditionTargetOptions(
      currentBoardState,
      isQuestUnlocked(currentBoardState.selectedQuestId, currentBoardState.completedQuestIds)
        ? getRequiredAlchemyQuest(currentBoardState.selectedQuestId)
        : null,
    );
    if (!targetOptions.some((option) => option.card.id === cardId)) return;

    // With the Expedition Queue upgrade an already-active dock queues the target
    // instead of being blocked; otherwise this starts it (or no-ops if busy).
    const queueUpgradeUnlocked = hasUpgrade(
      currentBoardState.unlockedUpgradeIds,
      EXPEDITION_QUEUE_UPGRADE_ID,
    );
    const startedAtMs = Date.now();
    setBoardState((previous) => ({
      ...previous,
      expedition: startOrEnqueueExpedition(
        previous.expedition,
        cardId,
        queueUpgradeUnlocked,
        startedAtMs,
        EXPEDITION_DURATION_MS,
      ),
    }));
    void sfx.play("board-mode.expedition");
  };

  // Cancel the active run; the next queued target auto-starts (succession).
  const handleExpeditionCancel = () => {
    setBoardState((previous) => ({
      ...previous,
      expedition: advanceExpeditionQueue(previous.expedition, Date.now(), EXPEDITION_DURATION_MS),
    }));
    void sfx.play("card.dissolve");
  };

  // Drop a not-yet-started target from the queue.
  const handleExpeditionRemoveQueued = (cardId: string) => {
    setBoardState((previous) => ({
      ...previous,
      expedition: removeQueuedExpedition(previous.expedition, cardId),
    }));
    void sfx.play("card.drop");
  };

  const handleExpeditionRewardClaim = () => {
    const currentBoardState = boardStateRef.current;
    const targetCardId = currentBoardState.expedition.targetCardId;
    if (!targetCardId || !isExpeditionRewardReady(currentBoardState.expedition, Date.now())) return;

    const rewardCard = getAlchemyCard(targetCardId);
    if (!rewardCard) return;

    const destinationSlotId = getInventoryDestinationSlotId(currentBoardState, targetCardId);
    if (!destinationSlotId) {
      void sfx.play("transmute.failed");
      return;
    }

    const claimedAtMs = Date.now();
    const cooldownId = createInventoryCooldownId(targetCardId, claimedAtMs, "expedition");
    notifiedCooldownIdsRef.current?.add(cooldownId);
    const fromRect = getCenteredCardRect(
      getElementRect("[data-board-section='expedition-reward-card']"),
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
        card: rewardCard,
        fromRect,
        id: `expedition-reward:${transmuteFlyAnimationSequenceRef.current}`,
        toInventorySlotId: destinationSlotId,
        toRect,
      });
    }

    setBoardState((previous) => ({
      ...previous,
      discoveredElementIds: appendUniqueId(previous.discoveredElementIds, targetCardId),
      // Free the dock and auto-start the next queued run (Expedition Queue upgrade).
      expedition: advanceExpeditionQueue(previous.expedition, claimedAtMs, EXPEDITION_DURATION_MS),
      inventorySlots: addReadyInventoryCopy(
        previous.inventorySlots,
        destinationSlotId,
        targetCardId,
        claimedAtMs,
        cooldownId,
      ),
    }));
    void sfx.play("gathering.rewardClaim");
  };

  const completeIntroChoreography = () => {
    if (!introZeroActiveRef.current) return;

    setQuestPanelCollapsed(false);
    setInfoPanelCollapsed(false);
    setIntroPhase("zooming");
  };

  const beginElementDrag = (grab: PeriodicTableElementGrab) => {
    const card = getAlchemyCard(grab.card.id);
    if (!card) return;
    if (!isElementAvailableForCrafting(boardStateRef.current, card.id)) return;

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
      return;
    }

    if (nextTab === "emergent") {
      setEmergentRecipeRevealIds(pendingEmergentRecipeNotificationIds);
      setPendingEmergentRecipeNotificationIds([]);
    }
  };

  const handleQuestPanelTabChange = (nextTab: QuestPanelTab) => {
    setQuestPanelTab(nextTab);
    if (nextTab === "log") setPendingQuestNotificationIds([]);
  };

  const handleInfoPanelToggle = () => {
    setInfoPanelCollapsed((collapsed) => !collapsed);
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
    if (gatheringSessionReview?.depositing === true || gatheringWrongResetKey !== null) return;
    if (nextTab === "gathering" && !gatheringAvailable) return;
    if (nextTab === "expedition" && !expeditionAvailable) return;
    if (nextTab === "upgrades" && !upgradesAvailable) return;
    if (nextTab === "gathering" && gatheringNudgeKey) {
      setGatheringNudgeDismissedKey(gatheringNudgeKey);
    }
    if (nextTab === activeBoardMode) {
      if (nextTab === "gathering" && !boardStateRef.current.gathering.unlockSeen) {
        setBoardState((previous) => ({
          ...previous,
          gathering: {
            ...previous.gathering,
            unlockSeen: true,
          },
        }));
      }
      return;
    }

    if (
      activeBoardMode === "gathering" &&
      nextTab === "crafting" &&
      boardStateRef.current.gathering.gatherLog.length > 0
    ) {
      gatheringSessionReviewSequenceRef.current += 1;
      setGatheringSessionReview({
        depositing: false,
        entries: boardStateRef.current.gathering.gatherLog.map((entry) => ({ ...entry })),
        id: `gathering-session:${Date.now()}:${gatheringSessionReviewSequenceRef.current}`,
        targetTab: nextTab,
      });
      setDraggedGatheringCard(null);
      setGatheringConfirmSwipeProgress(0);
      void sfx.play("cooldown.ready");
      return;
    }

    setBoardState((previous) => ({
      ...previous,
      activeBoardMode: nextTab,
      gathering:
        nextTab === "gathering"
          ? {
              ...previous.gathering,
              unlockSeen: true,
            }
          : previous.gathering,
      expedition:
        nextTab === "expedition" && expeditionAvailable
          ? {
              ...previous.expedition,
              unlockSeen: true,
            }
          : previous.expedition,
    }));
    void sfx.play(boardModeTabSoundIds[nextTab]);
  };

  const handleGatheringSessionStay = () => {
    if (gatheringSessionReview?.depositing === true) return;
    setGatheringSessionReview(null);
    void sfx.play("card.drop");
  };

  const handleGatheringSessionConfirm = () => {
    if (!gatheringSessionReview || gatheringSessionReview.depositing) return;

    const gatheredCardIds = new Set(gatheringSessionReview.entries.map((entry) => entry.cardId));
    const revealElementIds = pendingGatheringElementRevealIdsRef.current.filter((cardId) =>
      gatheredCardIds.has(cardId),
    );
    pendingGatheringElementRevealIdsRef.current = [];
    setPeriodicTableRevealElementIds(revealElementIds);
    setGatheringSessionReview((current) => (current ? { ...current, depositing: true } : current));
    setBoardState((previous) => ({
      ...previous,
      activeBoardMode: gatheringSessionReview.targetTab,
      gathering: {
        ...previous.gathering,
        unlockSeen: true,
      },
    }));
    void sfx.play("board-mode.crafting");
    void sfx.play("transmute.complete", { delayMs: 70 });
  };

  const handleExtendedLedgerFilterRemove = (cardId: string) => {
    setExtendedLedgerFilterCardIds((current) => current.filter((id) => id !== cardId));
    void sfx.play("card.drop");
  };

  const beginGatheringAnswerDrag = (
    value: number,
    source: GatheringAnswerDragSource,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (gatheringSessionReview !== null || gatheringWrongResetKey !== null) return;
    if (event.button !== 0) return;
    if (source.kind === "answer-slot" && boardStateRef.current.gathering.phase !== "solving")
      return;
    event.preventDefault();
    capturePointer(event.currentTarget, event.pointerId);
    const rect = event.currentTarget.getBoundingClientRect();
    const grabOffset = getScaledPointerOffset(event, rect);
    gatheringDragSequenceRef.current += 1;
    gatheringDropTargetRef.current = "none";
    gatheringDropChoiceIndexRef.current = null;
    gatheringDropFeedbackRef.current = "none";
    setGatheringDropTarget("none");
    setGatheringDropChoiceIndex(null);
    setGatheringDropFeedback("none");
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
    sourceChoiceIndex: number,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (gatheringSessionReview !== null || gatheringWrongResetKey !== null) return;
    if (event.button !== 0) return;
    event.preventDefault();
    capturePointer(event.currentTarget, event.pointerId);
    const rect = event.currentTarget.getBoundingClientRect();
    const grabOffset = getScaledPointerOffset(event, rect);
    gatheringDragSequenceRef.current += 1;
    gatheringDropTargetRef.current = "none";
    gatheringDropChoiceIndexRef.current = null;
    gatheringDropFeedbackRef.current = "none";
    setGatheringDropTarget("none");
    setGatheringDropChoiceIndex(null);
    setGatheringDropFeedback("none");
    setDraggedGatheringCard({
      enemyElement: boardStateRef.current.gathering.monster.elementType,
      grabOffsetX: grabOffset.x,
      grabOffsetY: grabOffset.y,
      id: `gathering-move:${move.id}:${gatheringDragSequenceRef.current}`,
      kind: "move",
      move,
      pointerId: event.pointerId,
      source: { kind: "move-cards" },
      sourceChoiceIndex,
      startClientX: event.clientX,
      startClientY: event.clientY,
    });
    sfx.startGatheringAttackCharge(move.id);
    void sfx.play("card.slot.pickup");
  };

  const handleConfirmUpgrade = (upgradeId: string) => {
    setBoardState((previous) =>
      previous.unlockedUpgradeIds.includes(upgradeId)
        ? previous
        : {
            ...previous,
            unlockedUpgradeIds: appendUniqueId(previous.unlockedUpgradeIds, upgradeId),
          },
    );
    void sfx.play("card.drop");
  };

  const triggerCelestialBonusFly = (bonusElementId: string | null) => {
    if (!bonusElementId) return;
    const bonusCard = getAlchemyCard(bonusElementId);
    if (!bonusCard) return;
    celestialBonusFlySeqRef.current += 1;
    setCelestialBonusFly({
      id: `celestial-bonus:${celestialBonusFlySeqRef.current}`,
      name: bonusCard.name,
      symbol: bonusCard.symbol ?? "✦",
    });
  };

  const handleGatheringRewardSelect = (cardId: string) => {
    if (gatheringSessionReview !== null || gatheringWrongResetKey !== null) return;

    if (selectedGatheringRewardCardId === cardId) {
      const collectedAtMs = Date.now();
      const rewardCard = getAlchemyCard(cardId);
      if (!rewardCard) {
        void sfx.play("transmute.failed");
        return;
      }

      const destinationSlotId =
        rewardCard.kind !== "element"
          ? getInventoryDestinationSlotId(boardStateRef.current, cardId)
          : null;
      if (rewardCard.kind !== "element" && !destinationSlotId) {
        void sfx.play("card.drop");
        return;
      }

      const cooldownId =
        rewardCard.kind !== "element"
          ? createInventoryCooldownId(cardId, collectedAtMs, "gather")
          : null;
      let claimSucceeded = false;
      let claimedCooldownId: string | null = null;
      let newlyDiscoveredElementId: string | null = null;
      let bonusElementId: string | null = null;
      setBoardState((previous) => {
        const result = claimGatheringRewardForBoard({
          boardState: previous,
          card: {
            id: cardId,
            kind: rewardCard.kind === "element" ? "element" : "inventory",
          },
          collectedAtMs,
          cooldownId,
          destinationSlotId,
        });
        if (!result.claimed) return previous;

        claimSucceeded = true;
        claimedCooldownId = result.cooldownId;
        newlyDiscoveredElementId = result.newlyDiscoveredElementId;
        bonusElementId = result.bonusElementId;
        return result.nextBoardState;
      });
      if (!claimSucceeded) {
        void sfx.play("transmute.failed");
        return;
      }

      setSelectedGatheringRewardCardId(null);
      if (claimedCooldownId) notifiedCooldownIdsRef.current?.add(claimedCooldownId);
      if (newlyDiscoveredElementId) {
        pendingGatheringElementRevealIdsRef.current = appendUniqueId(
          pendingGatheringElementRevealIdsRef.current,
          newlyDiscoveredElementId,
        );
      }
      triggerCelestialBonusFly(bonusElementId);
      void sfx.play("gathering.rewardClaim");
      return;
    }

    setSelectedGatheringRewardCardId(cardId);
    void sfx.play("card.drop");
  };

  const handleGatheringBossAnswer = (value: number) => {
    const currentBoss = boardStateRef.current.gathering.boss;
    if (currentBoss.phase !== "active") return;

    const answeredAtMs = Date.now();
    const timedOut =
      currentBoss.problemEndsAtMs !== null && answeredAtMs >= currentBoss.problemEndsAtMs;
    const correct = !timedOut && value === currentBoss.equation.answer;
    const rewardReady = correct && currentBoss.currentStreak + 1 >= GATHERING_BOSS_REQUIRED_STREAK;
    const failed = !correct && currentBoss.misses + 1 > GATHERING_BOSS_ALLOWED_MISSES;

    setBoardState((previous) => ({
      ...previous,
      gathering: answerGatheringBossChallenge(previous.gathering, value, answeredAtMs),
    }));

    if (rewardReady) {
      void sfx.play("transmute.complete");
      void sfx.play("gathering.rewardClaim", { delayMs: 120 });
      return;
    }
    if (failed) {
      void sfx.play("card.massDissolve");
      return;
    }
    void sfx.play(correct ? "transmute.complete" : "gathering.answerWrong");
  };

  const handleGatheringBossFailureDismiss = () => {
    setBoardState((previous) => ({
      ...previous,
      gathering: dismissGatheringBossFailure(previous.gathering),
    }));
    void sfx.play("card.drop");
  };

  const handleSelectGatheringTrack = (track: AlchemistGuildGatheringTrackKind) => {
    setBoardState((previous) => ({
      ...previous,
      gathering: selectGatheringTrack(previous.gathering, track),
    }));
    void sfx.play("board-mode.gathering");
  };

  // Phonics is tap-driven (select + confirm in one tap): the matching word advances
  // to the attack, a wrong word stays for another try.
  const handlePhonicsWordPick = (factId: string) => {
    const current = boardStateRef.current.gathering;
    if (
      current.selectedTrack !== "phonics" ||
      current.phase !== "solving" ||
      !current.phonicsPrompt
    ) {
      return;
    }
    const confirmed = confirmGatheringPhonicsAnswer(
      selectGatheringPhonicsChoice(current, factId),
      Date.now(),
    );
    setBoardState((previous) => ({ ...previous, gathering: confirmed }));
    void sfx.play(confirmed.lastAnswerCorrect ? "card.drop" : "gathering.answerWrong");
  };

  const handlePhonicsMovePick = (moveId: GatheringMoveId) => {
    const current = boardStateRef.current.gathering;
    if (current.selectedTrack !== "phonics" || current.phase !== "move") return;
    setBoardState((previous) => ({
      ...previous,
      gathering: selectGatheringMove(previous.gathering, moveId, previous),
    }));
    void sfx.play("card.drop");
  };

  const handlePhonicsBossAnswer = (factId: string) => {
    const current = boardStateRef.current.gathering;
    if (current.boss.phase !== "active") return;
    const answeredAtMs = Date.now();
    const next = answerGatheringBossPhonics(current, factId, answeredAtMs);
    setBoardState((previous) => ({
      ...previous,
      gathering: answerGatheringBossPhonics(previous.gathering, factId, answeredAtMs),
    }));
    void sfx.play(next.lastAnswerCorrect ? "card.drop" : "gathering.answerWrong");
  };

  const handleGatheringBossRewardClaim = () => {
    const claimedAtMs = Date.now();
    const currentBoss = boardStateRef.current.gathering.boss;
    if (currentBoss.phase !== "reward") return;

    const quantity = getGatheringBossRewardQuantity(currentBoss.level);
    setPeriodicTableRevealElementIds(currentBoss.rewardCardIds);
    setBoardState((previous) => {
      if (previous.gathering.boss.phase !== "reward") return previous;

      let elementQuantities = previous.elementQuantities;
      let discoveredElementIds = previous.discoveredElementIds;
      for (const cardId of previous.gathering.boss.rewardCardIds) {
        elementQuantities = addElementQuantity(elementQuantities, cardId, quantity);
        discoveredElementIds = appendUniqueId(discoveredElementIds, cardId);
      }

      return {
        ...previous,
        discoveredElementIds,
        elementQuantities,
        gathering: {
          ...claimGatheringBossReward(previous.gathering, claimedAtMs),
          unlockSeen: true,
        },
      };
    });
    void sfx.play("gathering.rewardClaim");
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

  const announceEmergentRecipeDiscovery = (recipeId: string) => {
    setInfoPanelTab("emergent");
    setEmergentRecipeRevealIds([recipeId]);
    setPendingEmergentRecipeNotificationIds((previous) => removeId(previous, recipeId));
  };

  const handleRecipeRevealSeen = (recipeId: string) => {
    setRecipeRevealIds((previous) => removeId(previous, recipeId));
  };

  const handleExtendedRecipeRevealSeen = (recipeId: string) => {
    setExtendedRecipeRevealIds((previous) => removeId(previous, recipeId));
  };

  const handleEmergentRecipeRevealSeen = (recipeId: string) => {
    setEmergentRecipeRevealIds((previous) => removeId(previous, recipeId));
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
    const currentDelivery = getQuestDelivery(currentBoardState.questDeliveries, quest.id);
    if (
      currentBoardState.completedQuestIds.includes(quest.id) ||
      !isQuestDeliveryComplete(quest, currentDelivery)
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

  // Open Orbit Forge — the tap-timing mini-game decides this craft's success +
  // rarity (replacing the RNG). The reagents stay on the bench until the round
  // resolves, so a mid-forge reload simply drops back to the workbench.
  const commitEmergentTransmutation = (preview: AlchemyWorkbenchEmergentPreview) => {
    setForgeRound({ attemptedAtMs: Date.now(), preview });
  };

  const finalizeEmergentTransmutation = (
    result: EmergentTransmutationResult,
    attemptedAtMs: number,
  ) => {
    if (result.kind === "failure") {
      // A no-show round: the ingredients are RETURNED (reagent slots left intact)
      // so the kid can just try again — kinder than the old roll that ate them.
      setEmergentTransmutationNotice({
        id: `emergent-failure:${attemptedAtMs}`,
        message: "The runes scattered — try again",
        status: "failure",
      });
      void sfx.play("transmute.failed");
      return;
    }

    const outputCard = getEmergentRecipeOutputBoardCard(result.discovery);
    const fromRect = getCenteredCardRect(
      getElementRect("[data-output-emergent-card]") ??
        getElementRect('[data-board-section="transmutation-output-slot"]'),
      FLOATING_ELEMENT_CARD_WIDTH,
      FLOATING_ELEMENT_CARD_HEIGHT,
    );
    const toRect = getCenteredCardRect(
      getElementRect('[data-info-panel-tab="emergent"]'),
      FLOATING_ELEMENT_CARD_WIDTH,
      FLOATING_ELEMENT_CARD_HEIGHT,
    );

    if (fromRect && toRect) {
      transmuteFlyAnimationSequenceRef.current += 1;
      setTransmuteFlyAnimation({
        card: outputCard,
        fromRect,
        id: `emergent-award:${transmuteFlyAnimationSequenceRef.current}`,
        toRect,
      });
    }

    const { isNewDiscovery } = recordEmergentDiscovery(
      boardStateRef.current.discoveredEmergentRecipes,
      result.discovery,
    );
    setBoardState((previous) => {
      const next = recordEmergentDiscovery(previous.discoveredEmergentRecipes, result.discovery);

      return {
        ...previous,
        discoveredEmergentRecipes: next.discoveredEmergentRecipes,
        reagentSlots: clearReagentSlots(),
      };
    });
    setEmergentTransmutationNotice({
      id: `emergent-success:${result.discovery.id}:${attemptedAtMs}`,
      message: isNewDiscovery ? "New emergent card" : "Emergent count increased",
      name: result.discovery.name,
      rarity: result.discovery.rarity,
      status: "success",
    });
    if (isNewDiscovery) {
      announceEmergentRecipeDiscovery(result.discovery.id);
      setPendingEmergentRecipeNotificationIds((previous) =>
        removeId(previous, result.discovery.id),
      );
    } else {
      setInfoPanelTab("emergent");
      setEmergentRecipeRevealIds([result.discovery.id]);
    }
    void sfx.play("transmute.complete");
    void sfx.play("card.massDissolve");
  };

  // `round` is the (non-null) in-flight forge, passed from the render site where
  // `forgeRound` is already narrowed — no in-handler null guard needed.
  const handleOrbitForgeComplete = (
    round: { attemptedAtMs: number; preview: AlchemyWorkbenchEmergentPreview },
    forgeResult: ForgeRoundResult,
  ) => {
    const result = createEmergentTransmutationResult(
      round.preview,
      round.attemptedAtMs,
      undefined,
      forgeResult,
    );
    finalizeEmergentTransmutation(result, round.attemptedAtMs);
    setForgeRound(null);
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
    if (isEmergentRecipePreview(transmutationPreview)) {
      commitEmergentTransmutation(transmutationPreview);
      return;
    }

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
        if (transmutationPreview && !isEmergentRecipePreview(transmutationPreview)) {
          void sfx.play("transmute.complete");
        }
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

  const commitGatheringAnswerConfirmation = () => {
    if (gatheringSessionReview !== null || gatheringWrongResetKey !== null) return;

    const currentGathering = boardStateRef.current.gathering;
    const answerCorrect =
      currentGathering.equation.selectedValue === currentGathering.equation.answer;
    if (answerCorrect) setGatheringMasteryPulseKey((key) => key + 1);

    // Streak audio, keyed off the transition this answer causes: a climbing tick
    // (pitched up with the streak), the ignite swell at the first bonus tier, a
    // triumphant milestone on a rarity-band jump, or the shatter when a real
    // streak breaks.
    const streakSoundEvent = resolveGatheringStreakSoundEvent(
      currentGathering.streak.current,
      answerCorrect,
    );
    // A record tick (the streak overtaking its own all-time best) gets the celebratory
    // high-score chime, pitched up with the streak like the ordinary tick — but a
    // rarity-band beat (ignite/milestone) outranks it, and a break always wins.
    const streakRecord = isGatheringStreakRecord(currentGathering.streak, answerCorrect);
    if (streakSoundEvent === "break") {
      void sfx.play("gathering.streak.break");
    } else if (streakSoundEvent === "ignite") {
      void sfx.play("gathering.streak.ignite");
    } else if (streakSoundEvent === "milestone") {
      void sfx.play("gathering.streak.milestone");
    } else if (streakRecord) {
      void sfx.play("gathering.streak.record", {
        detuneCents: gatheringStreakIncrementDetuneCents(currentGathering.streak.current + 1),
      });
    } else if (streakSoundEvent === "increment") {
      void sfx.play("gathering.streak.increment", {
        detuneCents: gatheringStreakIncrementDetuneCents(currentGathering.streak.current + 1),
      });
    }

    setBoardState((previous) => ({
      ...previous,
      gathering: confirmGatheringAnswer(previous.gathering),
    }));
    setGatheringConfirmSwipeProgress(0);
  };

  const handleGatheringConfirmSwipePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || !canConfirmGatheringAnswer) return;
    event.preventDefault();

    const pointerId = event.pointerId;
    const trackElement = gatheringConfirmPadTrackRef.current;
    const trackRect = trackElement?.getBoundingClientRect();
    if (!trackElement || !trackRect) return;

    const knobRect = event.currentTarget.getBoundingClientRect();
    const grabOffsetX = event.clientX - knobRect.left;
    const travelDistance = Math.max(getTransmuteKnobTravelPx(trackElement.clientWidth), 1);
    let latestProgress = 0;
    setIsGatheringConfirmDragging(true);

    const syncProgress = (clientX: number) => {
      latestProgress = clamp(
        (clientX - trackRect.left - TRANSMUTE_TRACK_PADDING_PX - grabOffsetX) / travelDistance,
        0,
        1,
      );
      setGatheringConfirmSwipeProgress(latestProgress);
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

      const committed = latestProgress >= GATHERING_CONFIRM_SWIPE_THRESHOLD;
      sfx.stopTransmuteRamp(committed ? 30 : 80);
      setIsGatheringConfirmDragging(false);

      if (committed) {
        const currentGathering = boardStateRef.current.gathering;
        const answerCorrect =
          currentGathering.equation.selectedValue === currentGathering.equation.answer;
        setGatheringConfirmSwipeProgress(1);
        void sfx.play(answerCorrect ? "transmute.complete" : "gathering.answerWrong");
        window.setTimeout(commitGatheringAnswerConfirmation, GATHERING_CONFIRM_COMMIT_HOLD_MS);
        return;
      }

      setGatheringConfirmSwipeProgress(0);
    }

    sfx.startTransmuteRamp();
    syncProgress(event.clientX);
    addPointerWindowListeners(handlePointerMove, handlePointerRelease);
  };

  usePixiApp(
    periodicTableCanvasRef,
    (app, { reducedMotion }) => {
      if (activeBoardMode === "expedition") {
        return setupExpeditionCanvasScene(app, {
          getFitRect: () => periodicTableViewportRef.current?.getBoundingClientRect() ?? null,
        });
      }

      return setupPeriodicTableScene(app, {
        cameraMode:
          introZeroActive || introCameraTransitionActive
            ? {
                elementId: ALCHEMIST_GUILD_INTRO_FOCUS_ELEMENT_ID,
                kind: "element",
                scale: ALCHEMIST_GUILD_INTRO_FOCUS_SCALE,
              }
            : { kind: "fit" },
        cameraTransition: introCameraTransitionActive ? "intro-zoom-out" : "none",
        discoveredElementIds: boardStateRef.current.discoveredElementIds,
        elementQuantities: boardStateRef.current.elementQuantities,
        getFitRect: () => periodicTableViewportRef.current?.getBoundingClientRect() ?? null,
        onElementGrab: beginElementDrag,
        reducedMotion,
        revealElementIds: periodicTableRevealElementIds,
      });
    },
    [
      activeBoardMode,
      periodicTableCameraModeKey,
      periodicTableDiscoveredKey,
      periodicTableQuantityKey,
      periodicTableRevealKey,
    ],
    {
      autoStart: false,
      backgroundAlpha: 0,
      preference: "canvas",
    },
  );

  useEffect(() => {
    if (introZeroActive) {
      sfx.stopBackgroundMusic(240);
      sfx.startIntroHum();
      return () => {
        sfx.stopIntroHum(260);
      };
    }

    sfx.stopIntroHum(520);
    void sfx.startBackgroundMusic();
  }, [introZeroActive]);

  useEffect(() => {
    if (!introCameraTransitionActive) return;

    const timeoutId = window.setTimeout(() => {
      setIntroPhase((current) => (current === "zooming" ? "complete" : current));
    }, 1200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [introCameraTransitionActive]);

  useEffect(() => {
    if (!periodicTableRevealKey) return;

    const timeoutId = window.setTimeout(() => {
      setPeriodicTableRevealElementIds([]);
    }, 1800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [periodicTableRevealKey]);

  useEffect(() => {
    if (!gatheringNudgeActive || !gatheringNudgeKey) return;
    if (gatheringNudgePlayedKeyRef.current === gatheringNudgeKey) return;

    gatheringNudgePlayedKeyRef.current = gatheringNudgeKey;
    void sfx.play("crafting.needsGathering");
  }, [gatheringNudgeActive, gatheringNudgeKey]);

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

  useEffect(() => {
    if (boardState.gathering.phase !== "reward") setSelectedGatheringRewardCardId(null);
  }, [boardState.gathering.phase]);

  useEffect(() => {
    if (!gatheringBossReady) return;

    const timeoutId = window.setTimeout(() => {
      const startedAtMs = Date.now();
      const currentGathering = boardStateRef.current.gathering;
      if (currentGathering.phase === "reward") return;
      if (currentGathering.boss.phase !== "idle") return;
      if (!isGatheringBossReady(currentGathering, startedAtMs)) return;

      setBoardState((previous) => ({
        ...previous,
        gathering: {
          ...startGatheringBossFight(previous.gathering, startedAtMs),
          unlockSeen: true,
        },
      }));
      void sfx.play("board-mode.gathering");
      void sfx.play("transmute.complete", { delayMs: 90 });
    }, 620);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [gatheringBossReady, setBoardState]);

  useEffect(() => {
    if (
      !isGatheringMode ||
      gatheringBossPhase !== "active" ||
      gatheringBossProblemEndsAtMs === null
    ) {
      return;
    }

    const delayMs = Math.max(0, gatheringBossProblemEndsAtMs - Date.now() + 20);
    const timeoutId = window.setTimeout(() => {
      const currentBoss = boardStateRef.current.gathering.boss;
      if (currentBoss.phase !== "active") return;
      if (currentBoss.problemEndsAtMs !== gatheringBossProblemEndsAtMs) return;

      const answeredAtMs = Date.now();
      const failed = currentBoss.misses + 1 > GATHERING_BOSS_ALLOWED_MISSES;
      setBoardState((previous) => ({
        ...previous,
        gathering: answerGatheringBossChallenge(previous.gathering, null, answeredAtMs),
      }));
      void sfx.play(failed ? "card.massDissolve" : "gathering.answerWrong");
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [gatheringBossPhase, gatheringBossProblemEndsAtMs, isGatheringMode, setBoardState]);

  useBrowserLayoutEffect(() => {
    if (!gatheringRewardAnimationKey) {
      animatedGatheringRewardKeyRef.current = null;
      return;
    }
    if (animatedGatheringRewardKeyRef.current === gatheringRewardAnimationKey) return;

    const chestElement = document.querySelector('[data-board-section="gathering-reward-chest"]');
    const rewardCardElements = Array.from(
      document.querySelectorAll('[data-board-section="gathering-reward-card"]'),
    ).filter((element): element is HTMLElement => element instanceof HTMLElement);
    if (!(chestElement instanceof HTMLElement) || rewardCardElements.length === 0) return;

    animatedGatheringRewardKeyRef.current = gatheringRewardAnimationKey;
    if (prefersReducedMotion()) return;

    const chestRect = chestElement.getBoundingClientRect();
    const chestCenterX = chestRect.left + chestRect.width / 2;
    const chestCenterY = chestRect.top + chestRect.height * 0.46;
    const animations: JSAnimation[] = [];

    for (const [index, rewardCardElement] of rewardCardElements.entries()) {
      const cardRect = rewardCardElement.getBoundingClientRect();
      const cardCenterX = cardRect.left + cardRect.width / 2;
      const cardCenterY = cardRect.top + cardRect.height / 2;
      const cleanupCardMotion = () => {
        rewardCardElement.style.removeProperty("opacity");
        rewardCardElement.style.removeProperty("transform");
        rewardCardElement.style.removeProperty("transform-origin");
        rewardCardElement.style.removeProperty("will-change");
        rewardCardElement.style.removeProperty("z-index");
      };

      rewardCardElement.style.cssText += `; transform-origin: center center; will-change: opacity, transform; z-index: ${
        24 + index
      };`;
      animations.push(
        animate(rewardCardElement, {
          delay: index * GATHERING_REWARD_CARD_FLY_STAGGER_MS,
          duration: GATHERING_REWARD_CARD_FLY_DURATION_MS,
          ease: "out(3)",
          opacity: [0, 1],
          rotate: [`${(index - 1) * 5}deg`, "0deg"],
          scale: [0.34, 1],
          x: [chestCenterX - cardCenterX, 0],
          y: [chestCenterY - cardCenterY, 0],
          onComplete: cleanupCardMotion,
        }),
      );
    }

    return () => {
      for (const animation of animations) animation.cancel();
      for (const rewardCardElement of rewardCardElements) {
        rewardCardElement.style.removeProperty("opacity");
        rewardCardElement.style.removeProperty("transform");
        rewardCardElement.style.removeProperty("transform-origin");
        rewardCardElement.style.removeProperty("will-change");
        rewardCardElement.style.removeProperty("z-index");
      }
    };
  }, [gatheringRewardAnimationKey]);

  useBrowserLayoutEffect(() => {
    if (!gatheringSessionReview?.depositing) return;
    if (depositedGatheringSessionReviewIdRef.current === gatheringSessionReview.id) return;

    depositedGatheringSessionReviewIdRef.current = gatheringSessionReview.id;
    const sessionId = gatheringSessionReview.id;
    const rewardElements = Array.from(
      document.querySelectorAll("[data-gathering-session-reward-card]"),
    ).filter((element): element is HTMLElement => element instanceof HTMLElement);
    const targetElement =
      document.querySelector('[data-board-section="periodic-table-dock"]') ??
      periodicTableViewportRef.current;

    const finishDeposit = () => {
      setBoardState((previous) => ({
        ...previous,
        gathering: {
          ...previous.gathering,
          gatherLog: [],
        },
      }));
      setGatheringSessionReview((current) => (current?.id === sessionId ? null : current));
      depositedGatheringSessionReviewIdRef.current = null;
    };

    if (prefersReducedMotion() || !(targetElement instanceof HTMLElement)) {
      finishDeposit();
      return;
    }

    const targetRect = targetElement.getBoundingClientRect();
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height * 0.5;
    const animations: JSAnimation[] = [];
    let completedAnimations = 0;
    const completeOne = () => {
      completedAnimations += 1;
      if (completedAnimations >= rewardElements.length) finishDeposit();
    };

    if (rewardElements.length === 0) {
      finishDeposit();
      return;
    }

    window.setTimeout(() => {
      void sfx.play("card.massDissolve");
    }, 120);

    for (const [index, rewardElement] of rewardElements.entries()) {
      const rect = rewardElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      rewardElement.style.cssText +=
        "; transform-origin: center center; will-change: opacity, transform;";
      animations.push(
        animate(rewardElement, {
          delay: index * GATHERING_SESSION_DEPOSIT_STAGGER_MS,
          duration: GATHERING_SESSION_DEPOSIT_DURATION_MS,
          ease: "inOut(3)",
          opacity: [1, 0],
          rotate: ["0deg", `${(index % 2 === 0 ? -1 : 1) * 12}deg`],
          scale: [1, 0.28],
          x: [0, targetCenterX - centerX],
          y: [0, targetCenterY - centerY],
          onComplete: completeOne,
        }),
      );
    }

    return () => {
      for (const animation of animations) animation.cancel();
      for (const rewardElement of rewardElements) {
        rewardElement.style.removeProperty("opacity");
        rewardElement.style.removeProperty("transform");
        rewardElement.style.removeProperty("transform-origin");
        rewardElement.style.removeProperty("will-change");
      }
    };
  }, [gatheringSessionReview]);

  useBrowserLayoutEffect(() => {
    const gathering = boardState.gathering;
    if (!isGatheringMode || gathering.phase !== "solving" || gathering.wrongAnswerStreak < 3) {
      return;
    }

    const resetKey = `${gathering.round}:${gathering.equationIndex}:${gathering.equation.id}`;
    if (gatheringWrongResetKeyRef.current === resetKey) return;

    gatheringWrongResetKeyRef.current = resetKey;
    setGatheringWrongResetKey(resetKey);
    setDraggedGatheringCard(null);
    setGatheringConfirmSwipeProgress(0);

    const finishReset = () => {
      setBoardState((previous) => ({
        ...previous,
        gathering: resetGatheringEquationAfterWrongStreak(previous.gathering),
      }));
      setGatheringWrongResetKey((current) => (current === resetKey ? null : current));
      gatheringWrongResetKeyRef.current = null;
    };

    const cardElements = Array.from(
      document.querySelectorAll(
        '[data-board-section="gathering-answer-card"], [data-board-section="gathering-answer-slot-card"]',
      ),
    ).filter((element): element is HTMLElement => element instanceof HTMLElement);

    if (prefersReducedMotion() || cardElements.length === 0) {
      window.setTimeout(finishReset, 0);
      return;
    }

    window.setTimeout(() => {
      void sfx.play("card.massDissolve");
    }, 90);

    const animations: JSAnimation[] = [];
    const fallbackTimeout = window.setTimeout(finishReset, GATHERING_WRONG_RESET_DURATION_MS + 220);
    let completedAnimations = 0;
    const completeOne = () => {
      completedAnimations += 1;
      if (completedAnimations >= cardElements.length) {
        window.clearTimeout(fallbackTimeout);
        finishReset();
      }
    };

    for (const [index, cardElement] of cardElements.entries()) {
      cardElement.style.cssText +=
        "; transform-origin: center center; will-change: opacity, transform;";
      animations.push(
        animate(cardElement, {
          delay: index * GATHERING_WRONG_RESET_STAGGER_MS,
          duration: GATHERING_WRONG_RESET_DURATION_MS,
          ease: "in(3)",
          opacity: [1, 0],
          rotate: ["0deg", `${(index - 2) * 10}deg`],
          scale: [1, 0.82],
          x: [0, (index - 2) * 34],
          y: [0, 220 + index * 18],
          onComplete: completeOne,
        }),
      );
    }

    return () => {
      window.clearTimeout(fallbackTimeout);
      for (const animation of animations) animation.cancel();
      for (const cardElement of cardElements) {
        cardElement.style.removeProperty("opacity");
        cardElement.style.removeProperty("transform");
        cardElement.style.removeProperty("transform-origin");
        cardElement.style.removeProperty("will-change");
      }
    };
  }, [boardState.gathering, isGatheringMode]);

  useEffect(() => {
    const previousGathering = previousGatheringStateRef.current;
    const currentGathering = boardState.gathering;
    previousGatheringStateRef.current = currentGathering;

    if (currentGathering.phase !== "reward") {
      setGatheringMonsterDeathUiState(EMPTY_GATHERING_MONSTER_DEATH_UI_STATE);
      return;
    }

    const shouldStartDeathAnimation =
      isGatheringMode &&
      currentGathering.monster.hp <= 0 &&
      (previousGathering === null ||
        previousGathering.phase !== "reward" ||
        previousGathering.round !== currentGathering.round);

    if (!shouldStartDeathAnimation) return;

    gatheringMonsterDeathAnimationSequenceRef.current += 1;
    const animationId = `gathering-monster-death:${currentGathering.round}:${gatheringMonsterDeathAnimationSequenceRef.current}`;
    setGatheringMonsterDeathUiState({
      animation: {
        id: animationId,
        round: currentGathering.round,
      },
      completedRound: null,
    });
    void sfx.play("gathering.monsterDeath");
  }, [boardState.gathering, isGatheringMode]);

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
        duration: item.id.startsWith("inventory-sale:")
          ? INVENTORY_SELL_COIN_FLY_DURATION_MS
          : QUEST_REWARD_FLY_DURATION_MS,
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

    const getCurrentDropIntent = () =>
      resolveDropIntent(
        activeDraggedCard,
        getDropSlotIdAtCardCenter(currentLeft, currentTop, slotHitRects),
        isCardCenterInsideQuestPanel(currentLeft, currentTop),
        isCardCenterInsideInventorySellZone(currentLeft, currentTop),
        isCardCenterInsideExtendedLedgerFilterDropZone(currentLeft, currentTop),
        boardStateRef.current,
        extendedLedgerFilterCardIdsRef.current,
      );

    const syncDropIntent = () => {
      const nextDropIntent = getCurrentDropIntent();

      if (isSameDropIntent(dropIntentRef.current, nextDropIntent)) return;
      dropIntentRef.current = nextDropIntent;
      setDropIntent(nextDropIntent);
    };

    const commitRelease = (releaseDropIntent: DropIntent) => {
      const source = activeDraggedCard.source;
      const currentBoardState = boardStateRef.current;
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

      if (releaseDropIntent.kind === "sell") {
        if (
          releaseDropIntent.accepted &&
          source.kind === "inventory" &&
          releaseDropIntent.price > 0
        ) {
          const soldAtMs = Date.now();
          // Merchant's Eye: doubles the sale once unlocked. The FIRST sale unlocks
          // it (at the base price) + raises the toast; the bonus applies from the
          // next sale on.
          const merchantUnlocked =
            boardStateRef.current.unlockedUpgradeIds.includes(MERCHANT_GOLD_UPGRADE_ID);
          const goldGained = applyMerchantGoldBonus(releaseDropIntent.price, merchantUnlocked);
          queueInventoryRemainderReturn(1);
          questRewardFlyAnimationSequenceRef.current += 1;
          setQuestRewardFlyAnimation(
            createInventorySaleRewardFlyAnimation(
              goldGained,
              `inventory-sale:${questRewardFlyAnimationSequenceRef.current}`,
            ),
          );
          setBoardState((previous) => ({
            ...previous,
            inventorySlots: consumeReadyInventoryCopies(
              previous.inventorySlots,
              source.slotId,
              1,
              soldAtMs,
            ),
            profile: {
              ...previous.profile,
              gold: previous.profile.gold + goldGained,
            },
            unlockedUpgradeIds: appendUniqueId(
              previous.unlockedUpgradeIds,
              MERCHANT_GOLD_UPGRADE_ID,
            ),
          }));
          void sfx.play("gathering.rewardClaim");
          return;
        }

        queueInventoryRemainderReturn(0);
        void sfx.play("card.drop");
        return;
      }

      if (releaseDropIntent.kind === "extended-filter") {
        if (releaseDropIntent.accepted) {
          setExtendedLedgerFilterCardIds((current) =>
            current.includes(activeDraggedCard.card.id) ||
            current.length >= EXTENDED_LEDGER_FILTER_SLOT_COUNT
              ? current
              : [...current, activeDraggedCard.card.id],
          );
          queueInventoryRemainderReturn(0);
          void sfx.play("card.drop");
          return;
        }

        queueInventoryRemainderReturn(0);
        void sfx.play("card.drop");
        return;
      }

      if (releaseDropIntent.kind === "blocked") {
        queueInventoryRemainderReturn(0);
        void sfx.play("card.drop");
        return;
      }

      const dropSlotId = getDropIntentSlotId(releaseDropIntent);
      if (!dropSlotId) {
        if (
          releaseDropIntent.kind === "quest" &&
          releaseDropIntent.accepted &&
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
                activeDraggedCard.card.id,
              ),
            }));
            void sfx.play("card.drop");
            return;
          }

          if (source.kind === "table") {
            setBoardState((previous) => {
              const nextElementQuantities = consumeElementQuantity(
                previous.elementQuantities,
                activeDraggedCard.card.id,
              );
              if (!nextElementQuantities) return previous;

              return {
                ...previous,
                elementQuantities: nextElementQuantities,
                questDeliveries: addSelectedQuestDelivery(
                  previous.questDeliveries,
                  currentBoardState.selectedQuestId,
                  activeDraggedCard.card.id,
                ),
              };
            });
            void sfx.play("card.drop");
            return;
          }

          if (source.kind === "slot") {
            setBoardState((previous) => ({
              ...previous,
              questDeliveries: addSelectedQuestDelivery(
                previous.questDeliveries,
                currentBoardState.selectedQuestId,
                activeDraggedCard.card.id,
              ),
              reagentSlots: { ...previous.reagentSlots, [source.slotId]: null },
            }));
            void sfx.play("card.drop");
            return;
          }
        }

        if (source.kind === "slot") {
          if (activeDraggedCard.card.kind === "element") {
            setBoardState((previous) => ({
              ...previous,
              elementQuantities: addElementQuantity(
                previous.elementQuantities,
                activeDraggedCard.card.id,
                1,
              ),
              reagentSlots: { ...previous.reagentSlots, [source.slotId]: null },
            }));
            void sfx.play("card.drop");
            return;
          }

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

      if (source.kind === "table") {
        setBoardState((previous) => {
          if (previous.reagentSlots[dropSlotId]) return previous;
          const nextElementQuantities = consumeElementQuantity(
            previous.elementQuantities,
            activeDraggedCard.card.id,
          );
          if (!nextElementQuantities) return previous;

          return {
            ...previous,
            elementQuantities: nextElementQuantities,
            reagentSlots: {
              ...previous.reagentSlots,
              [dropSlotId]: activeDraggedCard.card.id,
            },
          };
        });
        if (activeDraggedCard.card.id === ALCHEMIST_GUILD_INTRO_FOCUS_ELEMENT_ID) {
          completeIntroChoreography();
        }
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

    const getReleaseTargetRect = (releaseDropIntent: DropIntent): SlotRect | null => {
      if (releaseDropIntent.kind === "sell" && releaseDropIntent.accepted) {
        return getCenteredCardRect(
          getInventorySellZoneRect(),
          FLOATING_ELEMENT_CARD_WIDTH,
          FLOATING_ELEMENT_CARD_HEIGHT,
        );
      }

      if (releaseDropIntent.kind === "extended-filter" && releaseDropIntent.accepted) {
        return getCenteredCardRect(
          getExtendedLedgerFilterDropZoneRect(),
          FLOATING_ELEMENT_CARD_WIDTH,
          FLOATING_ELEMENT_CARD_HEIGHT,
        );
      }

      return null;
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
      const releaseDropIntent = getCurrentDropIntent();
      commitRelease(releaseDropIntent);

      if (reducedMotion) {
        clearDragState();
        return;
      }

      const releaseTargetRect = getReleaseTargetRect(releaseDropIntent);
      const throwLeft = currentLeft + clamp(velocityX * RELEASE_THROW_MS, -48, 48);
      const throwTop = currentTop + clamp(velocityY * RELEASE_THROW_MS + 10, -32, 64);
      const throwRotation = clamp(velocityX * 36, -18, 18);
      const releaseLeft = releaseTargetRect?.left ?? throwLeft;
      const releaseTop = releaseTargetRect?.top ?? throwTop;

      releaseAnimation = animate(cardElement, {
        duration: releaseTargetRect ? SWAP_MIN_DURATION_MS : RELEASE_DURATION_MS,
        ease: "out(2)",
        opacity: 0,
        rotate: releaseTargetRect ? "0deg" : `${throwRotation}deg`,
        scale: releaseTargetRect ? 0.2 : 0.86,
        x: releaseLeft,
        y: releaseTop,
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
      gatheringDropChoiceIndexRef.current = null;
      gatheringDropFeedbackRef.current = "none";
      setGatheringDropTarget("none");
      setGatheringDropChoiceIndex(null);
      setGatheringDropFeedback("none");
      setDraggedGatheringCard(null);
    };

    const syncDropTarget = () => {
      const rawDropTarget = getGatheringDropTargetAtCardCenter(currentLeft, currentTop);
      const nextDropChoiceIndex =
        rawDropTarget === "cards-panel"
          ? getGatheringChoiceIndexAtCardCenter(currentLeft, currentTop)
          : null;
      const nextDropTarget = resolveGatheringDropTarget(
        activeDraggedCard,
        rawDropTarget,
        nextDropChoiceIndex,
        boardStateRef.current.gathering,
      );
      const nextDropFeedback = getGatheringDropFeedback(rawDropTarget, nextDropTarget);

      if (gatheringDropTargetRef.current !== nextDropTarget) {
        gatheringDropTargetRef.current = nextDropTarget;
        setGatheringDropTarget(nextDropTarget);
      }
      if (gatheringDropChoiceIndexRef.current !== nextDropChoiceIndex) {
        gatheringDropChoiceIndexRef.current = nextDropChoiceIndex;
        setGatheringDropChoiceIndex(nextDropChoiceIndex);
      }
      if (gatheringDropFeedbackRef.current !== nextDropFeedback) {
        gatheringDropFeedbackRef.current = nextDropFeedback;
        setGatheringDropFeedback(nextDropFeedback);
      }
    };

    const getReleaseTargetRect = (
      target: GatheringDropTarget,
      targetChoiceIndex: number | null,
    ): SlotRect | null => {
      if (activeDraggedCard.kind !== "answer") return null;

      if (target === "answer-slot") {
        return getCenteredCardRect(
          getGatheringAnswerSlotRect(),
          FLOATING_ELEMENT_CARD_WIDTH,
          FLOATING_ELEMENT_CARD_HEIGHT,
        );
      }

      const gathering = boardStateRef.current.gathering;
      if (activeDraggedCard.source.kind === "answer-slot") {
        const returnChoiceIndex =
          target === "cards-panel" && targetChoiceIndex !== null
            ? targetChoiceIndex
            : getGatheringChoiceIndexByValue(gathering, activeDraggedCard.value);

        return returnChoiceIndex === null
          ? null
          : getCenteredCardRect(
              getGatheringGameCardSlotRect(returnChoiceIndex),
              FLOATING_ELEMENT_CARD_WIDTH,
              FLOATING_ELEMENT_CARD_HEIGHT,
            );
      }

      const sourceChoiceIndex = getGatheringChoiceIndexByValue(gathering, activeDraggedCard.value);
      const returnChoiceIndex =
        target === "cards-panel" && targetChoiceIndex !== null
          ? targetChoiceIndex
          : sourceChoiceIndex;
      return returnChoiceIndex === null
        ? null
        : getCenteredCardRect(
            getGatheringGameCardSlotRect(returnChoiceIndex),
            FLOATING_ELEMENT_CARD_WIDTH,
            FLOATING_ELEMENT_CARD_HEIGHT,
          );
    };

    const commitRelease = (target: GatheringDropTarget, targetChoiceIndex: number | null) => {
      if (activeDraggedCard.kind === "answer") {
        if (target === "answer-slot") {
          const currentValue = boardStateRef.current.gathering.equation.selectedValue;
          setBoardState((previous) => ({
            ...previous,
            gathering: selectGatheringAnswer(previous.gathering, activeDraggedCard.value),
          }));
          setGatheringConfirmSwipeProgress(0);
          void sfx.play(
            currentValue !== null && currentValue !== activeDraggedCard.value
              ? "card.swap"
              : "card.drop",
          );
          return;
        }

        if (activeDraggedCard.source.kind === "answer-slot" && target === "cards-panel") {
          const selectedChoiceIndex = getGatheringChoiceIndexByValue(
            boardStateRef.current.gathering,
            activeDraggedCard.value,
          );
          const shouldSwapChoices =
            targetChoiceIndex !== null && targetChoiceIndex !== selectedChoiceIndex;
          setBoardState((previous) => ({
            ...previous,
            gathering:
              shouldSwapChoices && targetChoiceIndex !== null
                ? swapGatheringAnswerWithChoice(previous.gathering, targetChoiceIndex)
                : clearGatheringAnswer(previous.gathering),
          }));
          setGatheringConfirmSwipeProgress(0);
          void sfx.play(shouldSwapChoices ? "card.swap" : "card.drop");
          return;
        }

        if (activeDraggedCard.source.kind === "answer-slot") {
          setBoardState((previous) => ({
            ...previous,
            gathering: clearGatheringAnswer(previous.gathering),
          }));
          setGatheringConfirmSwipeProgress(0);
          void sfx.play("card.drop");
          return;
        }

        if (activeDraggedCard.source.kind === "cards" && target === "cards-panel") {
          const sourceChoiceIndex = getGatheringChoiceIndexByValue(
            boardStateRef.current.gathering,
            activeDraggedCard.value,
          );
          const shouldSwapChoices =
            sourceChoiceIndex !== null &&
            targetChoiceIndex !== null &&
            sourceChoiceIndex !== targetChoiceIndex;
          if (shouldSwapChoices && sourceChoiceIndex !== null && targetChoiceIndex !== null) {
            setBoardState((previous) => ({
              ...previous,
              gathering: swapGatheringChoices(
                previous.gathering,
                sourceChoiceIndex,
                targetChoiceIndex,
              ),
            }));
          }
          void sfx.play(shouldSwapChoices ? "card.swap" : "card.drop");
          return;
        }

        void sfx.play("card.drop");
        return;
      }

      if (activeDraggedCard.kind === "move") {
        if (target === "action-zone" || target === "monster-panel") {
          setBoardState((previous) => ({
            ...previous,
            gathering: selectGatheringMove(previous.gathering, activeDraggedCard.move.id, previous),
          }));
          void sfx.play(activeDraggedCard.move.soundId);
          return;
        }

        void sfx.play("card.drop");
      }
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
      if (activeDraggedCard.kind === "move") sfx.stopGatheringAttackCharge(70);
      if (animationFrame !== 0) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        paintDrag();
      }
      const rawDropTarget = getGatheringDropTargetAtCardCenter(currentLeft, currentTop);
      const rawTargetChoiceIndex =
        rawDropTarget === "cards-panel"
          ? getGatheringChoiceIndexAtCardCenter(currentLeft, currentTop)
          : null;
      const resolvedDropTarget = resolveGatheringDropTarget(
        activeDraggedCard,
        rawDropTarget,
        rawTargetChoiceIndex,
        boardStateRef.current.gathering,
      );
      const targetChoiceIndex = resolvedDropTarget === "cards-panel" ? rawTargetChoiceIndex : null;
      const releaseTargetRect = getReleaseTargetRect(resolvedDropTarget, targetChoiceIndex);
      commitRelease(resolvedDropTarget, targetChoiceIndex);

      if (reducedMotion) {
        clearDragState();
        return;
      }

      const throwLeft = currentLeft + clamp(velocityX * RELEASE_THROW_MS, -48, 48);
      const throwTop = currentTop + clamp(velocityY * RELEASE_THROW_MS + 10, -32, 64);
      const throwRotation = clamp(velocityX * 36, -18, 18);
      const releaseLeft = releaseTargetRect?.left ?? throwLeft;
      const releaseTop = releaseTargetRect?.top ?? throwTop;

      releaseAnimation = animate(cardElement, {
        duration: releaseTargetRect ? SWAP_MIN_DURATION_MS : RELEASE_DURATION_MS,
        ease: "out(2)",
        opacity: 0,
        rotate: releaseTargetRect ? "0deg" : `${throwRotation}deg`,
        scale: releaseTargetRect ? 0.96 : 0.86,
        x: releaseLeft,
        y: releaseTop,
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
      if (activeDraggedCard.kind === "move" && !released) sfx.stopGatheringAttackCharge(70);
      if (animationFrame !== 0) cancelAnimationFrame(animationFrame);
      if (!releaseComplete) releaseAnimation?.cancel();
      if (!released) motion.revert();
    };
  }, [draggedGatheringCard]);

  useEffect(() => {
    const notice = emergentTransmutationNotice;
    if (!notice) return;

    const timeoutId = window.setTimeout(() => {
      setEmergentTransmutationNotice((current) => (current?.id === notice.id ? null : current));
    }, 2200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [emergentTransmutationNotice]);

  const draggedGatheringMove =
    draggedGatheringCard?.kind === "move" ? draggedGatheringCard.move : null;

  // The center board panel by mode (upgrades shop / expedition canvas / the
  // default crafting+gathering section). Computed here so the JSX stays a flat
  // `?? section` rather than a sonar-flagged nested ternary.
  let modeBoardPanel: ReactNode = null;
  if (isUpgradesMode) {
    modeBoardPanel = (
      <UpgradesPanel
        discoveredEmergentCount={boardState.discoveredEmergentRecipes.length}
        gatheringSessionsCompleted={boardState.gatheringSessionsCompleted}
        onConfirmUpgrade={handleConfirmUpgrade}
        unlockedUpgradeIds={boardState.unlockedUpgradeIds}
      />
    );
  } else if (isExpeditionMode) {
    modeBoardPanel = (
      <ExpeditionCanvasPanel
        available={expeditionAvailable}
        expedition={boardState.expedition}
        nowMs={nowMs}
        targetOptions={expeditionTargetOptions}
        periodicTableViewportRef={periodicTableViewportRef}
        queueUpgradeUnlocked={expeditionQueueUnlocked}
        showBoardDebugBadges={showBoardDebugBadges}
        onCancel={handleExpeditionCancel}
        onRemoveQueued={handleExpeditionRemoveQueued}
        onStart={handleExpeditionStart}
      />
    );
  }

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
        className={getBoardCanvasClass(isGatheringMode, isExpeditionMode)}
        aria-label={getBoardCanvasAriaLabel(isGatheringMode, isExpeditionMode)}
      >
        Alchemist Guild Pixi canvas
      </canvas>
      {draggedGatheringMove ? (
        <GatheringAttackArcCanvas
          cardRef={draggedGatheringCardElementRef}
          move={draggedGatheringMove}
          targetRef={rightPrimaryPanelRef}
        />
      ) : null}
      <div className={getBoardChromeClass()}>
        <section
          data-board-section="top-inventory-panel"
          data-board-name="Inventory"
          data-board-description={BOARD_DESCRIPTIONS.inventory}
          className={`${GLASS_PANEL_CLASS} grid grid-cols-[3.25rem_1px_minmax(0,1fr)_2.5rem] items-center gap-3 px-3 py-2`}
          aria-label="Inventory"
        >
          <BoardDebugBadge
            description={BOARD_DESCRIPTIONS.inventory}
            label="Inventory"
            visible={showBoardDebugBadges}
          />
          <div
            className={`${GLASS_CONTROL_CLASS} grid size-10 place-items-center justify-self-start text-sky-950`}
            aria-hidden="true"
          >
            <PackageOpen className="size-5" strokeWidth={2.25} aria-hidden="true" />
          </div>
          <span className="h-10 w-px bg-[#6b4a2b]/22" aria-hidden="true" />
          <div
            data-board-section="inventory-shelf"
            data-board-name="Inventory shelf"
            className="grid min-h-14 min-w-0 grid-cols-[repeat(8,minmax(0,1fr))] items-center gap-1.5 rounded-[8px] border border-[#6b4a2b]/12 bg-white/22 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.52)] sm:gap-2"
          >
            {inventorySlots.map((slot) => {
              const item = boardState.inventorySlots[slot.id];
              const card = getAlchemyCard(item?.cardId ?? null);

              return (
                <InventorySlot
                  key={slot.id}
                  card={card}
                  cooldowns={item?.cooldowns ?? []}
                  draggedCard={draggedCard}
                  isFlyDestination={
                    transmuteFlyAnimation?.toInventorySlotId === slot.id &&
                    transmuteFlyAnimation.card.id === item?.cardId
                  }
                  marker={getQuestInventoryMarker(
                    card,
                    selectedQuestAssemblyGuide,
                    selectedQuest,
                    selectedQuestDelivery,
                  )}
                  nowMs={nowMs}
                  onPointerDown={beginInventoryCardDrag}
                  sellPrice={card ? getAlchemyCardSellPrice(card) : 0}
                  slotId={slot.id}
                  slotName={slot.name}
                />
              );
            })}
          </div>
          <InventorySellZone draggedCard={draggedCard} dropIntent={dropIntent} />
        </section>

        <BoardControlRow
          activeTab={activeBoardMode}
          expeditionAvailable={expeditionAvailable}
          expeditionCountdownLabel={getExpeditionTabCountdownLabel(boardState.expedition, nowMs)}
          expeditionNudgeActive={expeditionNudgeActive}
          expeditionRevealActive={expeditionReveal.active}
          expeditionRevealKey={expeditionReveal.key}
          gatheringAvailable={gatheringAvailable}
          gatheringNudgeActive={gatheringNudgeActive}
          gatheringRevealActive={gatheringRevealActive}
          gatheringRevealKey={gatheringRevealKey}
          infoPanelCollapsed={infoPanelCollapsed}
          questPanelCollapsed={questPanelCollapsed}
          onInfoPanelToggle={handleInfoPanelToggle}
          onQuestPanelToggle={() => {
            setQuestPanelCollapsed((collapsed) => !collapsed);
          }}
          onTabChange={handleBoardModeTabChange}
          upgradesAvailable={upgradesAvailable}
        />

        {modeBoardPanel ?? (
          <section className={getMainBoardGridClass(questPanelCollapsed, isGatheringMode)}>
            <aside className="hidden min-h-0 min-w-0 lg:grid">
              {questPanelCollapsed ? null : (
                <LeftModePanel
                  activeQuestIds={activeQuestIds}
                  activeTab={questPanelTab}
                  avatarPath={FIRST_PROFILE_CARD_PROPS.avatarPath}
                  canClaim={canClaimSelectedQuest}
                  claimedQuestIds={boardState.completedQuestIds}
                  claimProgress={selectedQuestClaimSwipeState.progress}
                  deliveryComplete={selectedQuestDeliveryComplete}
                  deliveryDropFeedback={getQuestDeliveryDropFeedback(dropIntent)}
                  deliveryItems={selectedQuestUnlocked ? selectedQuestDeliveryItems : []}
                  developerNotesVisible={showBoardDebugBadges}
                  gathering={boardState.gathering}
                  gatheringDropTarget={gatheringDropTarget}
                  hasQuestNotifications={pendingQuestNotificationIds.length > 0}
                  isClaimDragging={selectedQuestClaimSwipeState.dragging}
                  isGatheringMode={isGatheringMode}
                  playerName={boardState.profile.playerName}
                  profileStats={createProfileStats(boardState.profile)}
                  questAssemblyGuide={selectedQuestAssemblyGuide}
                  questLogScrollTop={boardState.questLogScrollTop}
                  questPanelAccepted={questPanelAccepted}
                  selectedQuestId={selectedQuestId}
                  title={FIRST_PROFILE_CARD_PROPS.title}
                  unlockedQuestIds={unlockedQuestIds}
                  onClaimPointerDown={handleQuestClaimSwipePointerDown}
                  onPlayerNameChange={(nextPlayerName) => {
                    setBoardState((previous) => ({
                      ...previous,
                      profile: { ...previous.profile, playerName: nextPlayerName },
                    }));
                  }}
                  onQuestLogScrollTopChange={handleQuestLogScrollTopChange}
                  onQuestOpenFromLog={handleQuestOpenFromLog}
                  onQuestSelect={handleQuestSelect}
                  onTabChange={handleQuestPanelTabChange}
                />
              )}
            </aside>

            <CenterBoardPanels
              boardState={boardState}
              canTransmutePreview={canTransmutePreview}
              gatheringConfirmPadTrackRef={gatheringConfirmPadTrackRef}
              gatheringConfirmSwipeProgress={gatheringConfirmSwipeProgress}
              draggedCard={draggedCard}
              draggedGatheringCard={draggedGatheringCard}
              dropIntent={dropIntent}
              gatheringDropChoiceIndex={gatheringDropChoiceIndex}
              gatheringDropTarget={gatheringDropTarget}
              gatheringLevelMastery={gatheringLevelMastery}
              isGatheringConfirmDragging={isGatheringConfirmDragging}
              isOutputAlreadyMade={isOutputAlreadyMade}
              isGatheringMode={isGatheringMode}
              isTransmuteDragging={isTransmuteDragging}
              nowMs={nowMs}
              onGatheringAnswerPointerDown={beginGatheringAnswerDrag}
              onGatheringBossAnswer={handleGatheringBossAnswer}
              onGatheringBossFailureDismiss={handleGatheringBossFailureDismiss}
              onGatheringBossRewardClaim={handleGatheringBossRewardClaim}
              onGatheringConfirmPointerDown={handleGatheringConfirmSwipePointerDown}
              onGatheringMovePointerDown={beginGatheringMoveDrag}
              onGatheringRewardSelect={handleGatheringRewardSelect}
              onPhonicsBossAnswer={handlePhonicsBossAnswer}
              onPhonicsMovePick={handlePhonicsMovePick}
              onPhonicsWordPick={handlePhonicsWordPick}
              onSelectGatheringTrack={handleSelectGatheringTrack}
              periodicTableViewportRef={periodicTableViewportRef}
              questAssemblyGuide={selectedQuestAssemblyGuide}
              recipePreview={transmutationPreview}
              selectedGatheringRewardCardId={selectedGatheringRewardCardId}
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
              deathAnimation={gatheringMonsterDeathUiState.animation}
              deathCompletedRound={gatheringMonsterDeathUiState.completedRound}
              discoveredEmergentRecipes={boardState.discoveredEmergentRecipes}
              discoveredExtendedRecipeIds={boardState.discoveredExtendedRecipeIds}
              discoveredRecipeIds={boardState.discoveredRecipeIds}
              extendedLedgerFilterCardIds={extendedLedgerFilterCardIds}
              extendedLedgerFilterDropFeedback={getExtendedLedgerFilterDropFeedback(dropIntent)}
              gathering={boardState.gathering}
              gatheringChargeMoveId={getGatheringChargeMoveId(draggedGatheringCard)}
              gatheringDropTarget={gatheringDropTarget}
              gatheringInfoPanelRef={gatheringInfoPanelRef}
              gatheringLevelMastery={gatheringLevelMastery}
              gatheringMasteryPulseKey={gatheringMasteryPulseKey}
              hasEmergentRecipeNotifications={pendingEmergentRecipeNotificationIds.length > 0}
              hasExtendedRecipeNotifications={pendingExtendedRecipeNotificationIds.length > 0}
              hasRecipeNotifications={pendingRecipeNotificationIds.length > 0}
              infoPanelCollapsed={infoPanelCollapsed}
              isGatheringMode={isGatheringMode}
              isGatheringRewardMode={isGatheringRewardMode}
              preview={transmutationPreview}
              revealEmergentRecipeIds={emergentRecipeRevealIds}
              revealExtendedRecipeIds={extendedRecipeRevealIds}
              revealRecipeIds={recipeRevealIds}
              rightPrimaryPanelRef={rightPrimaryPanelRef}
              showBoardDebugBadges={showBoardDebugBadges}
              onDeathAnimationComplete={handleGatheringMonsterDeathAnimationComplete}
              onEmergentRecipeRevealSeen={handleEmergentRecipeRevealSeen}
              onExtendedLedgerFilterRemove={handleExtendedLedgerFilterRemove}
              onExtendedRecipeRevealSeen={handleExtendedRecipeRevealSeen}
              onRecipeRevealSeen={handleRecipeRevealSeen}
              onTabChange={handleInfoPanelTabChange}
            />
          </section>
        )}
      </div>
      {emergentTransmutationNotice ? (
        <EmergentTransmutationToast notice={emergentTransmutationNotice} />
      ) : null}
      <EmergentForgeMount forgeRound={forgeRound} onForgeComplete={handleOrbitForgeComplete} />
      {celestialBonusFly ? (
        <GatheringCelestialBonusFly
          key={celestialBonusFly.id}
          bonus={celestialBonusFly}
          onDone={() => setCelestialBonusFly(null)}
        />
      ) : null}
      <NotificationToastHost />

      {gatheringSessionReview ? (
        <GatheringSessionReviewModal
          depositing={gatheringSessionReview.depositing}
          entries={[...gatheringSessionReview.entries]}
          onConfirm={handleGatheringSessionConfirm}
          onStay={handleGatheringSessionStay}
        />
      ) : null}
      {expeditionRewardModalCard ? (
        <ExpeditionRewardModal
          canClaim={canClaimExpeditionReward}
          card={expeditionRewardModalCard}
          onClaim={handleExpeditionRewardClaim}
          onReset={handleExpeditionCancel}
        />
      ) : null}
      {gatheringWrongResetKey !== null ? (
        <div
          data-board-section="gathering-wrong-reset-blocker"
          className="fixed inset-0 z-[90] cursor-wait"
          aria-hidden="true"
        />
      ) : null}
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
            data-gathering-charge-move={
              draggedGatheringCard.kind === "move" ? draggedGatheringCard.move.id : undefined
            }
            className={getGatheringFloatingCardClass(
              draggedGatheringCard.kind,
              gatheringDropFeedback,
            )}
            style={getFloatingGatheringCardStyle(draggedGatheringCard)}
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

function createGatheringSessionRewardSummaries(
  entries: readonly AlchemistGuildGatheringLogEntry[],
): GatheringSessionRewardSummary[] {
  const summariesByCardId = new Map<string, GatheringSessionRewardSummary>();
  for (const entry of entries) {
    const card = getAlchemyCard(entry.cardId);
    if (!card) continue;

    const existing = summariesByCardId.get(entry.cardId);
    if (existing) {
      existing.count += 1;
      existing.latestRound = Math.max(existing.latestRound, entry.round);
      continue;
    }

    summariesByCardId.set(entry.cardId, {
      card,
      cardId: entry.cardId,
      count: 1,
      latestRound: entry.round,
    });
  }

  return [...summariesByCardId.values()].toSorted(
    (left, right) =>
      right.latestRound - left.latestRound || left.card.name.localeCompare(right.card.name),
  );
}

function createAlchemyRecipeDiscoveryDetail(recipe: RecipeLedgerRecipe): WorkbenchDiscoveryDetail {
  const kidInfo = getAlchemyRecipeKidInfoById(recipe.id);
  const sourceLinks = (kidInfo?.sourceIds ?? []).flatMap((sourceId) => {
    const source = getAlchemyRecipeKidInfoSourceById(sourceId);
    return source ? [{ label: source.label, url: source.url }] : [];
  });
  const ingredientCount = recipe.arguments.reduce(
    (total, ingredient) => total + ingredient.quantity,
    0,
  );
  const uniqueIngredientCount = new Set(recipe.arguments.map((ingredient) => ingredient.cardId))
    .size;
  const conceptLabel = recipe.education.concepts.slice(0, 2).join(" + ");

  return {
    formula: formatAlchemyRecipeFormula(recipe),
    funFacts: [
      `${recipe.output.name} belongs on the ${formatTokenLabel(recipe.output.kind)} shelf.`,
      `It uses ${ingredientCount} total ingredient card${ingredientCount === 1 ? "" : "s"} and ${uniqueIngredientCount} kind${uniqueIngredientCount === 1 ? "" : "s"} of ingredient.`,
      `The guild station is ${formatTokenLabel(recipe.station)}, with a ${formatTokenLabel(recipe.action)} action.`,
      `Science idea: ${conceptLabel}.`,
    ],
    id: recipe.id,
    imageAlt: recipe.output.name,
    imageUrl: resolvePublicAssetPath(recipe.output.imagePath),
    kind: "recipe",
    sentences: kidInfo?.sentences ?? [recipe.education.note],
    sourceLinks,
    subtitle: `${formatTokenLabel(recipe.action)} · ${formatTokenLabel(recipe.output.kind)}`,
    tags: [
      formatTokenLabel(recipe.output.kind),
      formatTokenLabel(recipe.station),
      formatTokenLabel(recipe.education.safetyTier),
    ],
    title: recipe.output.name,
  };
}

function createExtendedMoleculeDiscoveryDetail(
  recipe: ExtendedRecipeLedgerRecipe,
): WorkbenchDiscoveryDetail {
  const kidInfo = getExtendedMoleculeKidInfoById(recipe.id);

  return {
    formula: formatExtendedRecipeLedgerFormula(recipe),
    funFacts: kidInfo?.funFacts ?? [],
    id: recipe.id,
    imageAlt: kidInfo?.imageAlt ?? `${recipe.output.name} structure from PubChem`,
    imageUrl: kidInfo?.imageUrl ?? recipe.source.url,
    kind: "extended",
    sentences: kidInfo?.sentences ?? [],
    sourceLinks: kidInfo?.sourceLinks ?? [{ label: "PubChem compound", url: recipe.source.url }],
    subtitle: `${recipe.output.formula} · CID ${recipe.source.pubChemCid}`,
    tags: ["Extended", "Molecule", `CID ${recipe.source.pubChemCid}`],
    title: recipe.output.name,
  };
}

function createEmergentRecipeDiscoveryDetail(
  recipe: AlchemistGuildEmergentRecipe,
): WorkbenchDiscoveryDetail {
  const rarityLabel = formatEmergentRecipeRarity(recipe.rarity);

  return {
    formula: recipe.formula,
    funFacts: [
      `Ingredient order: ${formatEmergentRecipeIngredients(recipe)}.`,
      `This pull has been stabilized ${recipe.count} time${recipe.count === 1 ? "" : "s"}.`,
      `Rarity came from word slots ${recipe.syllableIndexes.map((index) => index + 1).join(", ")}.`,
    ],
    id: recipe.id,
    imageAlt: `${recipe.name} mystery card`,
    imageUrl: "",
    kind: "emergent",
    sentences: [
      `${recipe.name} is an emergent card generated from an element order that missed the regular and extended ledgers.`,
      `Its syllables were ${recipe.syllables.join(" + ")}.`,
      `Duplicate pulls increase the count instead of creating a second row.`,
    ],
    sourceLinks: [],
    subtitle: `${rarityLabel} · ${recipe.ingredientCardIds.length} slots`,
    tags: ["Emergent", rarityLabel, `x${recipe.count}`],
    title: recipe.name,
  };
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

function createInventorySaleRewardFlyAnimation(gold: number, id: string): QuestRewardFlyAnimation {
  const sourceRect = getInventorySellZoneRect();
  const toRect = getElementRect('[data-profile-stat="gold"]');
  if (!sourceRect || !toRect) return { id, items: [] };

  return {
    id,
    items: [
      {
        fromRect: {
          height: 40,
          left: sourceRect.left + sourceRect.width / 2 - 20,
          top: sourceRect.top + sourceRect.height / 2 - 20,
          width: 40,
        },
        id: `${id}:gold`,
        kind: "gold",
        label: "Gold",
        toRect,
        value: `+${gold}`,
      },
    ],
  };
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

function addQuestCurrentPointerListeners(
  onMove: (event: PointerEvent) => void,
  onRelease: (event: PointerEvent) => void,
  onCancel: (event: PointerEvent) => void,
  onNativeTouchMove: (event: TouchEvent) => void,
): () => void {
  window.addEventListener("pointermove", onMove, WINDOW_POINTER_LISTENER_OPTIONS);
  window.addEventListener("pointerup", onRelease, WINDOW_POINTER_LISTENER_OPTIONS);
  window.addEventListener("pointercancel", onCancel, WINDOW_POINTER_LISTENER_OPTIONS);
  // touch-action: pan-y cannot be revoked mid-gesture and preventDefault on
  // pointermove never blocks native panning — only a cancelable touchmove
  // preventDefault keeps WebKit from stealing a locked horizontal drag.
  window.addEventListener("touchmove", onNativeTouchMove, WINDOW_POINTER_LISTENER_OPTIONS);

  return () => {
    window.removeEventListener("pointermove", onMove, WINDOW_POINTER_LISTENER_CAPTURE);
    window.removeEventListener("pointerup", onRelease, WINDOW_POINTER_LISTENER_CAPTURE);
    window.removeEventListener("pointercancel", onCancel, WINDOW_POINTER_LISTENER_CAPTURE);
    window.removeEventListener("touchmove", onNativeTouchMove, WINDOW_POINTER_LISTENER_CAPTURE);
  };
}

function setQuestCurrentTrackX(trackElement: HTMLElement, x: number): void {
  trackElement.style.transform = `translateX(${x}px)`;
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

function getAlchemyCardSellPrice(card: AlchemyBoardCard): number {
  if (card.kind === "element") return 2 + Math.ceil((card.atomicNumber ?? 1) / 12);
  if (card.kind === "emergent") return 24 + Math.min(36, card.name.length * 2);
  if (card.kind === "extended") return 18 + Math.min(24, card.symbol.length * 2);
  if (card.kind === "raw") return 6 + Math.min(10, card.name.length);
  return 10 + Math.min(18, card.name.length);
}

function getQuestInventoryMarker(
  card: AlchemyBoardCard | null,
  guide: QuestAssemblyGuide | null,
  quest: StaticAlchemyQuest,
  delivery: AlchemistGuildQuestDelivery,
): QuestInventoryMarker | null {
  if (!card) return null;
  if (canDeliverCardToQuest(quest, delivery, card.id))
    return { label: "Turn in", tone: "delivery" };

  const ingredient = guide?.ingredients.find((candidate) => candidate.cardId === card.id);
  if (!ingredient) return null;

  return {
    label: ingredient.readyCount >= ingredient.requiredCount ? "Quest part" : "Prep part",
    tone: "prep",
  };
}

function formatEmergentRecipeRarity(rarity: AlchemistGuildEmergentRecipeRarity): string {
  return rarity === "mythical" ? "Mythical" : formatTokenLabel(rarity);
}

function getEmergentRecipeAccentColor(rarity: AlchemistGuildEmergentRecipeRarity): string {
  switch (rarity) {
    case "common":
      return "#64748b";
    case "uncommon":
      return "#16a34a";
    case "rare":
      return "#0284c7";
    case "epic":
      return "#a855f7";
    case "legendary":
      return "#f59e0b";
    case "mythical":
      return "#e11d48";
    default:
      return "#64748b";
  }
}

function getEmergentRecipeShellClass(rarity: AlchemistGuildEmergentRecipeRarity): string {
  switch (rarity) {
    case "common":
      return "border-slate-700/20 bg-slate-50/78 text-slate-950";
    case "uncommon":
      return "border-emerald-800/22 bg-emerald-50/78 text-emerald-950";
    case "rare":
      return "border-sky-800/24 bg-sky-50/78 text-sky-950";
    case "epic":
      return "border-fuchsia-800/24 bg-fuchsia-50/78 text-fuchsia-950";
    case "legendary":
      return "border-amber-800/28 bg-amber-50/82 text-amber-950";
    case "mythical":
      return "border-rose-800/30 bg-rose-50/84 text-rose-950 shadow-[0_8px_24px_rgba(190,18,60,0.16)]";
    default:
      return "border-slate-700/20 bg-slate-50/78 text-slate-950";
  }
}

function getEmergentRecipeBadgeClass(rarity: AlchemistGuildEmergentRecipeRarity): string {
  return `rounded-full border border-current/20 bg-white/65 px-1.5 py-0.5 text-[9px] font-black uppercase leading-none ${getEmergentRecipeBadgeTextClass(
    rarity,
  )}`;
}

function getEmergentRecipeBadgeTextClass(rarity: AlchemistGuildEmergentRecipeRarity): string {
  switch (rarity) {
    case "common":
      return "text-slate-800";
    case "uncommon":
      return "text-emerald-800";
    case "rare":
      return "text-sky-800";
    case "epic":
      return "text-fuchsia-800";
    case "legendary":
      return "text-amber-800";
    case "mythical":
      return "text-rose-800";
    default:
      return "text-slate-800";
  }
}

function getFilteredExtendedMoleculeRecipes(
  filterCardIds: readonly string[],
): StaticExtendedMoleculeRecipe[] {
  if (filterCardIds.length === 0) return [...EXTENDED_MOLECULE_RECIPES];

  return EXTENDED_MOLECULE_RECIPES.filter((recipe) =>
    filterCardIds.every((cardId) =>
      recipe.ingredients.some((ingredient) => ingredient.cardId === cardId),
    ),
  );
}

function isEmergentRecipePreview(
  preview: AlchemyWorkbenchAnyRecipePreview,
): preview is AlchemyWorkbenchEmergentPreview {
  return "orderedIngredientCardIds" in preview;
}

function isExtendedRecipePreview(
  preview: AlchemyWorkbenchStaticRecipePreview,
): preview is AlchemyWorkbenchExtendedRecipePreview {
  return "source" in preview.recipe;
}

function getRecipePreviewOutputName(preview: AlchemyWorkbenchAnyRecipePreview): string {
  if (isEmergentRecipePreview(preview)) return "Unknown";
  return preview.recipe.output.name;
}

function getRecipePreviewKindLabel(preview: AlchemyWorkbenchAnyRecipePreview): string {
  if (isEmergentRecipePreview(preview)) return "Emergent";
  return isExtendedRecipePreview(preview)
    ? "Molecule"
    : formatTokenLabel(preview.recipe.output.kind);
}

function getTransmutationPadPrompt(
  preview: AlchemyWorkbenchAnyRecipePreview | null,
  alreadyMade: boolean,
  guide: QuestAssemblyGuide | null,
): string {
  if (alreadyMade) return "Already made";
  if (preview && isEmergentRecipePreview(preview)) return "Swipe to stabilize";
  if (
    preview &&
    guide &&
    !isEmergentRecipePreview(preview) &&
    !isExtendedRecipePreview(preview) &&
    preview.recipe.id === guide.terminalRecipeId
  ) {
    return `Swipe to make ${guide.terminalRecipeName}`;
  }
  if (!preview && guide?.readyToAssemble) return `${guide.terminalRecipeName} is ready`;
  return preview ? "Swipe to transmute" : "Match a recipe first";
}

function getTransmutationPadAriaLabel(
  preview: AlchemyWorkbenchAnyRecipePreview | null,
  alreadyMade: boolean,
): string {
  if (alreadyMade) return "Extended recipe already made";
  if (preview && isEmergentRecipePreview(preview)) return "Swipe to stabilize emergent output";
  return preview ? "Swipe to transmute output" : "Match a recipe before transmuting";
}

function isExtendedPreviewAlreadyDiscovered(
  preview: AlchemyWorkbenchAnyRecipePreview | null,
  discoveredExtendedRecipeIds: readonly string[],
): boolean {
  return (
    preview !== null &&
    !isEmergentRecipePreview(preview) &&
    isExtendedRecipePreview(preview) &&
    discoveredExtendedRecipeIds.includes(preview.recipe.id)
  );
}

function getRecipePreviewOutputBoardCard(
  preview: AlchemyWorkbenchStaticRecipePreview,
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

function getEmergentRecipeOutputBoardCard(recipe: AlchemistGuildEmergentRecipe): AlchemyBoardCard {
  const accentColor = getEmergentRecipeAccentColor(recipe.rarity);

  return {
    detailLabel: formatEmergentRecipeRarity(recipe.rarity),
    familyColor: accentColor,
    id: recipe.id,
    kind: "emergent",
    kindLabel: "Emergent",
    name: recipe.name,
    symbol: recipe.syllables[0]?.slice(0, 2).toUpperCase() ?? "?",
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
  if (gathering.boss.phase === "active")
    return "Boss round active. Pick the answer before time runs out.";
  if (gathering.boss.phase === "reward") return "Boss cleared. Claim the new element reward.";
  if (gathering.boss.phase === "failed")
    return "Boss streak broke. The level memory track restarted.";
  if (gathering.phase === "reward") return "Monster cleared. Pick one reward card.";
  if (gathering.phase === "move") return "Answer locked. Pick a move card to spend the math.";
  if (gathering.lastAnswerCorrect === false)
    return "That card missed. Drag it back or swap another sum.";
  if (gathering.equation.selectedValue !== null) return "Answer staged. Swipe to confirm it.";
  return gathering.equation.operator === "-"
    ? "Choose the card that matches the subtraction equation."
    : "Choose the card that matches the addition equation.";
}

function getGatheringPhonicsPanelStatus(gathering: AlchemistGuildGatheringState): string {
  if (gathering.boss.phase === "active")
    return "Boss round active. Tap the matching word before time runs out.";
  if (gathering.boss.phase === "reward") return "Boss cleared. Claim the new element reward.";
  if (gathering.boss.phase === "failed")
    return "Boss streak broke. The level memory track restarted.";
  if (gathering.phase === "reward") return "Monster cleared. Pick one reward card.";
  if (gathering.phase === "move") return "Great match! Pick an attack to spend it.";
  if (gathering.lastAnswerCorrect === false)
    return "Not that one. Play the sound again and try another word.";
  return "Play the sound, then tap the word that has it.";
}

function getGatheringBossRemainingMs(
  boss: AlchemistGuildGatheringBossState,
  nowMs: number,
): number {
  if (boss.phase !== "active" || boss.problemEndsAtMs === null) return 0;
  return Math.max(0, boss.problemEndsAtMs - nowMs);
}

function getGatheringBossStatusText(
  boss: AlchemistGuildGatheringBossState,
  mastery: GatheringLevelMasteryReport,
): string {
  if (boss.phase === "reward") return "Reward ready.";
  if (boss.phase === "failed") return "Practice track restarted.";
  if (mastery.bossReady) return "Ready to enter.";
  return `${Math.round(mastery.progress * 100)}% mastered.`;
}

function getStoredGatheringMasteryProgress(
  gathering: AlchemistGuildGatheringState,
  level: number,
): number {
  return clamp(gathering.levelProgress.masteryProgressByLevel[String(level)] ?? 0, 0, 1);
}

function getGatheringMasteryFrameStyle(
  masteryProgress: number,
  storedMasteryProgress: number,
): GatheringMasteryFrameStyle {
  const currentProgress = clamp(masteryProgress, 0, 1);
  const previousProgress = Math.max(currentProgress, clamp(storedMasteryProgress, 0, 1));

  return {
    "--gathering-mastery-angle": `${Math.round(currentProgress * 360)}deg`,
    "--gathering-mastery-previous-angle": `${Math.round(previousProgress * 360)}deg`,
  };
}

function getGatheringMasteryFeedback(
  gathering: AlchemistGuildGatheringState,
  mastery: GatheringLevelMasteryReport,
  storedMasteryProgress: number,
): GatheringMasteryFeedback {
  if (gathering.lastAnswerCorrect === false) return "regressing";
  if (storedMasteryProgress > mastery.progress + 0.000_1) return "regressing";
  if (mastery.bossReady) return "ready";

  return "steady";
}

function getGatheringConfirmPadStateClass(active: boolean, confirmed: boolean): string {
  if (confirmed) return "border-emerald-700/70 bg-emerald-50/65";
  if (active) return "cursor-ew-resize border-emerald-800/70 bg-emerald-50/45";

  return "border-neutral-600/50 bg-white/20";
}

function getGatheringConfirmHandleStateClass(active: boolean, confirmed: boolean): string {
  if (confirmed) return "cursor-default bg-emerald-700";
  if (active) return "cursor-grab bg-neutral-800";

  return "cursor-not-allowed bg-neutral-700/55 opacity-70";
}

function getGatheringConfirmPadStatus(active: boolean, confirmed: boolean): string {
  if (confirmed) return "confirmed";
  if (active) return "ready";

  return "idle";
}

function getGatheringConfirmPadPrompt(active: boolean, confirmed: boolean): string {
  if (confirmed) return "Answer confirmed";
  if (active) return "Swipe to confirm answer";

  return "Drop an answer card first";
}

function getGatheringConfirmPadAriaLabel(active: boolean, confirmed: boolean): string {
  if (confirmed) return "Answer confirmed";
  if (active) return "Swipe to confirm answer";

  return "Drop an answer card before confirming";
}

// Single source of truth for the equation answer-slot shell. Each state returns
// exactly one border-color and one box-shadow so the drop-active green glow can
// never be silently overridden by a competing arbitrary `shadow-[...]`/`border-*`
// utility (the failure mode when the base shadow and the active shadow were both
// applied to the same element). Mirrors getSlotShellClass.
function getGatheringAnswerSlotClass(
  dropActive: boolean,
  locked: boolean,
  lastAnswerCorrect: boolean | null,
): string {
  const base =
    "relative grid h-[148px] w-[105px] place-items-center rounded-[6px] border-2 text-5xl font-black leading-none transition-[background-color,border-color,box-shadow] duration-150";
  const restShadow = "shadow-[0_8px_18px_rgba(15,23,42,0.12)]";

  if (dropActive) {
    return `${base} border-emerald-500 bg-emerald-100/70 text-emerald-950 shadow-[0_0_0_4px_rgba(16,185,129,0.24),0_8px_18px_rgba(15,23,42,0.12)] backdrop-blur-sm`;
  }
  if (locked) {
    return `${base} ${restShadow} border-neutral-500/45 bg-neutral-100/70 text-neutral-500 opacity-65 grayscale`;
  }
  if (lastAnswerCorrect === false) {
    return `${base} ${restShadow} border-rose-500 bg-rose-50 text-rose-950`;
  }
  if (lastAnswerCorrect === true) {
    return `${base} ${restShadow} border-emerald-500 bg-emerald-50 text-emerald-950`;
  }
  return `${base} ${restShadow} border-neutral-800/55 bg-white/75 text-neutral-950`;
}

function getGatheringInfoTitle(gathering: AlchemistGuildGatheringState): string {
  switch (gathering.boss.phase) {
    case "active":
      return "Boss Streak";
    case "reward":
      return "Level Cleared";
    case "failed":
      return "Memory Reset";
    default:
      break;
  }

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
  switch (gathering.boss.phase) {
    case "active":
      return `Solve ${GATHERING_BOSS_REQUIRED_STREAK} in a row. More than ${GATHERING_BOSS_ALLOWED_MISSES} misses restarts this level.`;
    case "reward":
      return "The next gathering level unlocks after the element reward is claimed.";
    case "failed":
      return "Practice this level again until the mastery report reaches the boss threshold.";
    default:
      break;
  }

  switch (gathering.phase) {
    case "move":
      return "The three move cards are the left addend, right addend, and full sum.";
    case "reward":
      return "Choose one of the three reward cards. The pick is logged and added to your supplies.";
    default:
      if (gathering.equation.selectedValue !== null) {
        return "The answer card is staged. Swipe the confirm pad to check it.";
      }
      return `${gathering.equation.left} plus ${gathering.equation.right} sets up this turn.`;
  }
}

function getWorkbenchCardIds(boardState: AlchemistGuildBoardState): (string | null)[] {
  return reagentSlots.map((slot) => boardState.reagentSlots[slot.id]);
}

function hasAvailablePeriodicElement(boardState: AlchemistGuildBoardState): boolean {
  return ELEMENT_CARDS.some(
    (card) =>
      boardState.discoveredElementIds.includes(card.id) &&
      getElementQuantity(boardState.elementQuantities, card.id) > 0,
  );
}

function canCompleteAnyPeriodicRecipe(boardState: AlchemistGuildBoardState): boolean {
  const stagedElementCounts = getStagedElementCounts(boardState);
  if (!stagedElementCounts) return false;

  return (
    ALCHEMY_RECIPES.some((recipe) =>
      canCompletePeriodicIngredients(
        recipe.arguments,
        stagedElementCounts,
        boardState.elementQuantities,
      ),
    ) ||
    EXTENDED_MOLECULE_RECIPES.some((recipe) =>
      canCompletePeriodicIngredients(
        recipe.ingredients,
        stagedElementCounts,
        boardState.elementQuantities,
      ),
    )
  );
}

function getStagedElementCounts(
  boardState: AlchemistGuildBoardState,
): ReadonlyMap<string, number> | null {
  const stagedElementCounts = new Map<string, number>();

  for (const cardId of getWorkbenchCardIds(boardState)) {
    if (!cardId) continue;
    const card = getAlchemyCard(cardId);
    if (card?.kind !== "element") return null;
    stagedElementCounts.set(cardId, (stagedElementCounts.get(cardId) ?? 0) + 1);
  }

  return stagedElementCounts;
}

function canCompletePeriodicIngredients(
  ingredients: readonly PeriodicCraftingIngredient[],
  stagedElementCounts: ReadonlyMap<string, number>,
  elementQuantities: Readonly<AlchemistGuildElementQuantities>,
): boolean {
  const requiredElementCounts = new Map<string, number>();

  for (const ingredient of ingredients) {
    if (!ingredient.cardId.startsWith("element:")) return false;
    requiredElementCounts.set(
      ingredient.cardId,
      (requiredElementCounts.get(ingredient.cardId) ?? 0) + ingredient.quantity,
    );
  }

  for (const [cardId, count] of stagedElementCounts) {
    if (count > (requiredElementCounts.get(cardId) ?? 0)) return false;
  }

  for (const [cardId, requiredCount] of requiredElementCounts) {
    const stagedCount = stagedElementCounts.get(cardId) ?? 0;
    if (requiredCount - stagedCount > getElementQuantity(elementQuantities, cardId)) return false;
  }

  return true;
}

function createGatheringNudgeKey(boardState: AlchemistGuildBoardState): string {
  const progressKey = [
    boardState.gathering.round,
    boardState.gathering.gatherLog.length,
    boardState.completedQuestIds.length,
  ].join(":");
  const quantityKey = ELEMENT_CARDS.map(
    (card) => `${card.id}:${getElementQuantity(boardState.elementQuantities, card.id)}`,
  ).join(",");
  const slotKey = reagentSlots.map((slot) => boardState.reagentSlots[slot.id] ?? "empty").join(",");

  return `${progressKey}|${quantityKey}|${slotKey}`;
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

function getGatheringChoiceIndexAtCardCenter(cardLeft: number, cardTop: number): number | null {
  const clientX = cardLeft + FLOATING_ELEMENT_CARD_WIDTH / 2;
  const clientY = cardTop + FLOATING_ELEMENT_CARD_HEIGHT / 2;
  const elements = document.elementsFromPoint(clientX, clientY);

  for (const element of elements) {
    const slotElement = element.closest('[data-board-section="gathering-game-card-slot"]');
    if (!(slotElement instanceof HTMLElement)) continue;
    const slotIndex = Number.parseInt(slotElement.dataset.gatheringCardSlotIndex ?? "", 10);
    if (
      Number.isInteger(slotIndex) &&
      slotIndex >= 0 &&
      slotIndex < gatheringGameCardSlots.length
    ) {
      return slotIndex;
    }
  }

  return null;
}

function getGatheringChoiceIndexByValue(
  gathering: AlchemistGuildGatheringState,
  value: number,
): number | null {
  const choiceIndex = gathering.equation.choiceValues.indexOf(value);
  return choiceIndex === -1 ? null : choiceIndex;
}

function getGatheringGameCardSlotRect(choiceIndex: number): SlotRect | null {
  return getElementRect(`[data-gathering-card-slot-index="${choiceIndex}"]`);
}

function getGatheringAnswerSlotRect(): SlotRect | null {
  return getElementRect('[data-gathering-drop-target="answer-slot"]');
}

function resolveGatheringDropTarget(
  draggedCard: DraggedGatheringCard,
  target: GatheringDropTarget,
  targetChoiceIndex: number | null,
  gathering: AlchemistGuildGatheringState,
): GatheringDropTarget {
  if (draggedCard.kind === "answer") {
    if (target === "answer-slot" && gathering.phase === "solving") return target;
    if (target === "cards-panel" && gathering.phase === "solving") return target;
    return "none";
  }

  if (draggedCard.kind === "move") {
    if (gathering.phase !== "move") return "none";
    if (target === "cards-panel") {
      return targetChoiceIndex === draggedCard.sourceChoiceIndex ? "cards-panel" : "action-zone";
    }
    return "action-zone";
  }

  return "none";
}

function getGatheringDropFeedback(
  rawTarget: GatheringDropTarget,
  resolvedTarget: GatheringDropTarget,
): GatheringDropFeedback {
  if (rawTarget === "none") return resolvedTarget === "none" ? "none" : "drop";
  return resolvedTarget === "none" ? "blocked" : "drop";
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

function getInventorySellZoneRect(): SlotRect | null {
  return getElementRect('[data-board-section="inventory-sell-zone"]');
}

function getExtendedLedgerFilterDropZoneRect(): SlotRect | null {
  return getElementRect('[data-board-section="extended-ledger-filter-drop-zone"]');
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
  return isCardCenterInsideRect(cardLeft, cardTop, getQuestDropTargetRect());
}

function isCardCenterInsideInventorySellZone(cardLeft: number, cardTop: number): boolean {
  return isCardCenterInsideRect(cardLeft, cardTop, getInventorySellZoneRect());
}

function isCardCenterInsideExtendedLedgerFilterDropZone(
  cardLeft: number,
  cardTop: number,
): boolean {
  return isCardCenterInsideRect(cardLeft, cardTop, getExtendedLedgerFilterDropZoneRect());
}

function isCardCenterInsideRect(cardLeft: number, cardTop: number, rect: SlotRect | null): boolean {
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

  // Auto-route: any of the quest's still-needed deliverables is accepted, whichever
  // delivery page happens to be showing.
  return canDeliverCardToQuest(
    quest,
    getQuestDelivery(boardState.questDeliveries, quest.id),
    card.id,
  );
}

function addSelectedQuestDelivery(
  questDeliveries: AlchemistGuildQuestDeliveries,
  questId: string,
  cardId: string,
): AlchemistGuildQuestDeliveries {
  const quest = getRequiredAlchemyQuest(questId);
  return {
    ...questDeliveries,
    [quest.id]: deliverCardToQuest(quest, questDeliveries[quest.id], cardId),
  };
}

function getQuestDelivery(
  questDeliveries: AlchemistGuildQuestDeliveries,
  questId: string,
): AlchemistGuildQuestDelivery {
  return questDeliveries[questId] ?? {};
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
  return card.kind === "crafted" || card.kind === "raw";
}

function isElementAvailableForCrafting(
  boardState: AlchemistGuildBoardState,
  cardId: string,
): boolean {
  return (
    boardState.discoveredElementIds.includes(cardId) &&
    getElementQuantity(boardState.elementQuantities, cardId) > 0
  );
}

function getElementQuantity(quantities: Readonly<AlchemistGuildElementQuantities>, cardId: string) {
  return Math.max(0, quantities[cardId] ?? 0);
}

function addElementQuantity(
  quantities: AlchemistGuildElementQuantities,
  cardId: string,
  amount: number,
): AlchemistGuildElementQuantities {
  return {
    ...quantities,
    [cardId]: getElementQuantity(quantities, cardId) + amount,
  };
}

function consumeElementQuantity(
  quantities: AlchemistGuildElementQuantities,
  cardId: string,
  amount = 1,
): AlchemistGuildElementQuantities | null {
  const currentQuantity = getElementQuantity(quantities, cardId);
  if (currentQuantity < amount) return null;

  return {
    ...quantities,
    [cardId]: currentQuantity - amount,
  };
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
  isInventorySellHit: boolean,
  isExtendedLedgerFilterHit: boolean,
  boardState: AlchemistGuildBoardState,
  extendedLedgerFilterCardIds: readonly string[],
): DropIntent {
  if (isInventorySellHit) {
    const sellPrice = getAlchemyCardSellPrice(draggedCard.card);
    return {
      accepted: draggedCard.source.kind === "inventory" && sellPrice > 0,
      kind: "sell",
      price: sellPrice,
    };
  }

  if (isExtendedLedgerFilterHit) {
    return {
      accepted:
        draggedCard.card.kind === "element" &&
        extendedLedgerFilterCardIds.length < EXTENDED_LEDGER_FILTER_SLOT_COUNT &&
        !extendedLedgerFilterCardIds.includes(draggedCard.card.id),
      kind: "extended-filter",
    };
  }

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
  return { kind: "blocked", slotId };
}

function isSameDropIntent(left: DropIntent, right: DropIntent): boolean {
  if (left.kind === "quest" && right.kind === "quest") return left.accepted === right.accepted;
  if (left.kind === "sell" && right.kind === "sell") {
    return left.accepted === right.accepted && left.price === right.price;
  }
  if (left.kind === "extended-filter" && right.kind === "extended-filter") {
    return left.accepted === right.accepted;
  }

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
  if (intent.kind === "extended-filter" || intent.kind === "sell") {
    return intent.accepted ? "drop" : "blocked";
  }
  if (intent.kind !== "quest") return intent.kind;

  return getQuestDropFeedback(intent);
}

function getQuestDeliveryDropFeedback(intent: DropIntent): DropFeedback {
  if (intent.kind !== "quest") return "none";

  return getQuestDropFeedback(intent);
}

function getInventorySellDropFeedback(intent: DropIntent): DropFeedback {
  if (intent.kind !== "sell") return "none";

  return intent.accepted ? "drop" : "blocked";
}

function getExtendedLedgerFilterDropFeedback(intent: DropIntent): DropFeedback {
  if (intent.kind !== "extended-filter") return "none";

  return intent.accepted ? "drop" : "blocked";
}

function isQuestPanelAcceptedDrop(intent: DropIntent): boolean {
  return intent.kind === "quest" && intent.accepted;
}

function getQuestDropFeedback(intent: Extract<DropIntent, { kind: "quest" }>): DropFeedback {
  return intent.accepted ? "drop" : "blocked";
}

function getQuestDeliveryClaimTrackClass(isComplete: boolean): string {
  const base =
    "relative h-12 overflow-hidden rounded-full border shadow-[inset_0_2px_8px_rgba(72,45,16,0.16)]";

  if (isComplete) return `${base} border-emerald-900/20 bg-white/70`;
  return `${base} border-dashed border-neutral-900/25 bg-white/45`;
}

function getQuestDeliverySlotClass(
  feedback: DropFeedback,
  isComplete: boolean,
  claimed: boolean,
): string {
  const base =
    "relative rounded-[6px] border p-1.5 shadow-[0_2px_0_rgba(72,45,16,0.12)] backdrop-blur-sm transition-[background-color,border-color,box-shadow] duration-100";

  if (claimed) {
    return `${base} border-emerald-700/70 bg-emerald-50/90 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]`;
  }

  if (isComplete) {
    return `${base} border-emerald-600/70 bg-emerald-50/78 shadow-[0_0_0_4px_rgba(16,185,129,0.16)]`;
  }

  switch (feedback) {
    case "drop":
      return `${base} border-dashed border-emerald-500 bg-emerald-50/85 shadow-[0_0_0_4px_rgba(16,185,129,0.22)]`;
    case "blocked":
      return `${base} border-dashed border-rose-500 bg-rose-50/85 shadow-[0_0_0_4px_rgba(244,63,94,0.18)]`;
    default:
      return `${base} quest-delivery-dropzone-pattern border-dashed border-amber-700/45 bg-white/65`;
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

function getInventorySellZoneClass(feedback: DropFeedback): string {
  const base =
    "relative grid size-10 shrink-0 place-items-center justify-self-end rounded-[6px] border-2 border-dashed text-amber-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.62)] transition-[background-color,border-color,box-shadow,transform] duration-100";

  switch (feedback) {
    case "drop":
      return `${base} scale-105 border-amber-500 bg-amber-100/85 shadow-[0_0_0_4px_rgba(245,158,11,0.22),inset_0_1px_0_rgba(255,255,255,0.62)]`;
    case "blocked":
      return `${base} border-rose-500 bg-rose-50/85 shadow-[0_0_0_4px_rgba(244,63,94,0.18),inset_0_1px_0_rgba(255,255,255,0.62)]`;
    default:
      return `${base} border-amber-800/35 bg-white/45 hover:bg-white/70`;
  }
}

function getExtendedLedgerFilterSlotClass(feedback: DropFeedback): string {
  const base =
    "grid size-7 shrink-0 place-items-center rounded-[4px] border border-dashed transition-[background-color,border-color,box-shadow,transform] duration-100";

  switch (feedback) {
    case "drop":
      return `${base} scale-105 border-emerald-500 bg-emerald-100/80 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]`;
    case "blocked":
      return `${base} border-rose-500 bg-rose-50/80 shadow-[0_0_0_3px_rgba(244,63,94,0.16)]`;
    default:
      return `${base} border-emerald-900/25 bg-white/45`;
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

function getGatheringFloatingCardClass(
  kind: DraggedGatheringCard["kind"],
  feedback: GatheringDropFeedback,
): string {
  const base =
    "absolute left-0 top-0 select-none rounded-[3px] border-2 shadow-[0_14px_28px_rgba(0,0,0,0.26)] transition-[border-color,box-shadow] duration-100";
  const overflowClass = kind === "move" ? "overflow-visible" : "overflow-hidden";
  const chargeClass = kind === "move" ? "gathering-attack-charge-card" : "";

  if (feedback === "drop") {
    return `${base} ${overflowClass} ${chargeClass} border-emerald-500 bg-emerald-50 shadow-[inset_0_0_0_3px_rgba(16,185,129,0.24),0_14px_28px_rgba(0,0,0,0.26)]`;
  }
  if (feedback === "blocked") {
    return `${base} ${overflowClass} ${chargeClass} border-rose-500 bg-rose-50 shadow-[inset_0_0_0_3px_rgba(244,63,94,0.24),0_14px_28px_rgba(0,0,0,0.26)]`;
  }
  if (kind === "answer") return `${base} ${overflowClass} border-[#888888] bg-white`;
  if (kind === "move")
    return `${base} ${overflowClass} ${chargeClass} border-[#888888] bg-[#eeeeee]`;
  return `${base} ${overflowClass} border-[#888888] bg-[#eeeeee]`;
}

function getFloatingGatheringCardStyle(card: DraggedGatheringCard): FloatingGatheringCardStyle {
  const base = {
    contain: "layout style paint",
    fontFamily: "var(--font-sans)",
    height: `${FLOATING_ELEMENT_CARD_HEIGHT}px`,
    touchAction: "none",
    width: `${FLOATING_ELEMENT_CARD_WIDTH}px`,
  } satisfies FloatingGatheringCardStyle;

  if (card.kind !== "move") return base;

  return {
    ...base,
    "--gathering-charge-duration-ms": `${getGatheringAttackChargeProfile(card.move.id).rampCapMs}ms`,
    contain: "layout style",
  };
}

function getGatheringMoveCardStatBadgePath(variant: GatheringMoveCardStatBadgeVariant): string {
  switch (variant) {
    case "level":
      return "M24 2 L38 8 L46 22 L40 40 L24 46 L8 40 L2 22 L10 8 Z";
    case "counter":
      return "M5 10 C14 4 34 4 43 10 L45 26 C39 38 32 44 24 46 C16 44 9 38 3 26 Z";
    case "attack":
      return "M24 2 C35 7 43 17 43 28 C43 39 35 46 24 46 C13 46 5 39 5 28 C5 17 13 7 24 2Z";
    default:
      return "M24 2 C35 7 43 17 43 28 C43 39 35 46 24 46 C13 46 5 39 5 28 C5 17 13 7 24 2Z";
  }
}

function getGatheringMoveCardStatBadgeHighlightPath(
  variant: GatheringMoveCardStatBadgeVariant,
): string {
  switch (variant) {
    case "level":
      return "M13 10 L24 6 L35 10 L31 16 C25 13 19 13 13 16Z";
    case "counter":
      return "M9 12 C18 8 30 8 39 12 L37 17 C28 14 20 14 11 17Z";
    case "attack":
      return "M13 13 C19 7 30 7 36 13 C29 11 20 11 13 13Z";
    default:
      return "M13 13 C19 7 30 7 36 13 C29 11 20 11 13 13Z";
  }
}

function getGatheringMoveVisual(moveId: GatheringMoveId): GatheringMoveVisual {
  return gatheringMoveVisuals[moveId];
}

function isGatheringAnswerChoiceHidden(
  gathering: AlchemistGuildGatheringState,
  draggedCard: DraggedGatheringCard | null,
  value: number,
): boolean {
  if (gathering.equation.selectedValue === value) return true;
  return (
    draggedCard?.kind === "answer" &&
    draggedCard.source.kind === "cards" &&
    draggedCard.value === value
  );
}

function getGatheringGameCardSlotFeedback(
  gatheringDropTarget: GatheringDropTarget,
  gatheringDropChoiceIndex: number | null,
  slotIndex: number,
): DropFeedback {
  return gatheringDropTarget === "cards-panel" && gatheringDropChoiceIndex === slotIndex
    ? "drop"
    : "none";
}

function getGatheringAnswerSlotGhost(
  gathering: AlchemistGuildGatheringState,
  draggedCard: DraggedGatheringCard | null,
  gatheringDropTarget: GatheringDropTarget,
  gatheringDropChoiceIndex: number | null,
  slotIndex: number,
): GatheringAnswerSlotGhost | null {
  if (gathering.phase !== "solving" || draggedCard?.kind !== "answer") return null;
  if (gatheringDropTarget !== "cards-panel" || gatheringDropChoiceIndex === null) return null;

  const sourceChoiceIndex = getGatheringChoiceIndexByValue(gathering, draggedCard.value);
  if (sourceChoiceIndex === null || sourceChoiceIndex === gatheringDropChoiceIndex) return null;

  const targetChoiceValue = gathering.equation.choiceValues[gatheringDropChoiceIndex];
  const targetChoiceIsStagedAnswer =
    targetChoiceValue !== undefined && targetChoiceValue === gathering.equation.selectedValue;
  if (slotIndex === gatheringDropChoiceIndex) {
    return {
      feedback: targetChoiceValue === undefined || targetChoiceIsStagedAnswer ? "drop" : "swap",
      value: draggedCard.value,
    };
  }

  if (
    slotIndex === sourceChoiceIndex &&
    targetChoiceValue !== undefined &&
    !targetChoiceIsStagedAnswer
  ) {
    return { feedback: "swap", value: targetChoiceValue };
  }

  return null;
}

function getGatheringRewardTreasurePath(gathering: AlchemistGuildGatheringState): string {
  // The chest art is the run's trophy: its rarity tier is the answer streak at
  // the moment of the kill (six bands → six chest arts), not a random hash, so a
  // composed streak earns a visibly grander chest.
  return streakChestImage(gathering.streak.current);
}

function createGatheringMonsterDeathParticles(
  animationId: string,
): GatheringMonsterDeathParticle[] {
  const seed = hashStringToUnit(animationId) * 10_000;
  return Array.from({ length: GATHERING_MONSTER_DEATH_PARTICLE_COUNT }, (_, index) => {
    const horizontal = seededUnit(seed, index, 1) - 0.5;
    const vertical = seededUnit(seed, index, 2) - 0.5;
    const outward = Math.sign(horizontal || 1);

    return {
      color: getGatheringMonsterDeathParticleColor(index, seed),
      delay: seededUnit(seed, index, 3) * 0.38,
      driftX: (26 + seededUnit(seed, index, 4) * 82) * outward,
      driftY: -42 - seededUnit(seed, index, 5) * 118,
      originX: horizontal * 0.86,
      originY: vertical * 0.9,
      size: 1.6 + seededUnit(seed, index, 6) * 4.2,
      spin: (seededUnit(seed, index, 7) - 0.5) * 2.4,
    };
  });
}

function setupGatheringMonsterDeathCanvas(
  app: Application,
  options: GatheringMonsterDeathCanvasOptions,
): () => void {
  const cardLayer = new Graphics();
  const dustLayer = new Graphics();
  const startedAtMs = performance.now();
  let finished = false;

  app.stage.addChild(cardLayer, dustLayer);

  const draw = () => {
    const progress = options.reducedMotion
      ? 1
      : clamp((performance.now() - startedAtMs) / GATHERING_MONSTER_DEATH_DURATION_MS, 0, 1);
    drawGatheringMonsterDeathFrame(app, cardLayer, dustLayer, options, progress);
    if (progress < 1 || finished) return;

    finished = true;
    app.ticker.remove(draw);
    app.stop();
  };
  const drawAndRender = () => {
    draw();
    app.render();
  };

  if (options.reducedMotion) {
    app.stop();
    drawAndRender();
  } else {
    app.ticker.add(draw);
    drawAndRender();
  }

  window.addEventListener("resize", drawAndRender);

  return () => {
    app.ticker.remove(draw);
    window.removeEventListener("resize", drawAndRender);
    cardLayer.destroy();
    dustLayer.destroy();
  };
}

function drawGatheringMonsterDeathFrame(
  app: Application,
  cardLayer: Graphics,
  dustLayer: Graphics,
  options: GatheringMonsterDeathCanvasOptions,
  progress: number,
): void {
  const width = Math.max(app.screen.width * 0.82, 1);
  const height = Math.max(app.screen.height * 0.84, 1);
  const rotation = -0.08 + progress * 0.34 + Math.sin(progress * Math.PI * 2) * 0.025;
  const scale = 1.02 - progress * 0.14;

  cardLayer.position.set(app.screen.width / 2, app.screen.height / 2);
  cardLayer.rotation = rotation;
  cardLayer.scale.set(scale);
  dustLayer.position.set(cardLayer.position.x, cardLayer.position.y);
  dustLayer.rotation = rotation + progress * 0.08;
  dustLayer.scale.set(scale);

  drawGatheringMonsterDeathCard(cardLayer, width, height, options.accentColor, progress);
  drawGatheringMonsterDeathDust(dustLayer, width, height, options.particles, progress);
}

function drawGatheringMonsterDeathCard(
  cardLayer: Graphics,
  width: number,
  height: number,
  accentColor: number,
  progress: number,
): void {
  const left = -width / 2;
  const top = -height / 2;
  const stripCount = 18;
  const stripHeight = height / stripCount;
  const shellAlpha = Math.max(0, 0.34 - progress * 0.3);

  cardLayer
    .clear()
    .roundRect(left, top, width, height, 14)
    .fill({ alpha: shellAlpha, color: 0xfffbeb })
    .roundRect(left + 3, top + 3, width - 6, height - 6, 12)
    .stroke({ alpha: Math.max(0, 0.5 - progress * 0.42), color: accentColor, width: 4 });

  for (let index = 0; index < stripCount; index += 1) {
    const stripProgress = clamp((progress - index * 0.024) / 0.7, 0, 1);
    if (stripProgress >= 1) continue;

    const stripWidth = width * (1 - stripProgress ** 1.45 * 0.92);
    const stripLeft = left + Math.sin(index * 1.8 + progress * 6) * progress * 10;
    const stripTop = top + index * stripHeight;
    const alpha = (1 - stripProgress) * (0.58 - progress * 0.18);
    const stripColor = index % 3 === 0 ? accentColor : 0xfff7ed;

    cardLayer.rect(stripLeft, stripTop, stripWidth, stripHeight * 0.74).fill({
      alpha,
      color: stripColor,
    });
  }
}

function drawGatheringMonsterDeathDust(
  dustLayer: Graphics,
  width: number,
  height: number,
  particles: readonly GatheringMonsterDeathParticle[],
  progress: number,
): void {
  dustLayer.clear();

  for (const particle of particles) {
    const particleProgress = clamp((progress - particle.delay) / (1 - particle.delay), 0, 1);
    if (particleProgress <= 0) continue;

    const fade = (1 - particleProgress) ** 1.35;
    const swirl = Math.sin(particleProgress * Math.PI * 2 + particle.spin) * 14;
    const x = particle.originX * width + particle.driftX * particleProgress + swirl;
    const y = particle.originY * height + particle.driftY * particleProgress;
    const size = particle.size * (1 - particleProgress * 0.46);

    dustLayer.rect(x, y, size, size).fill({
      alpha: fade * 0.78,
      color: particle.color,
    });
  }
}

function getGatheringMonsterDeathParticleColor(index: number, seed: number): number {
  const colors = [0xfef3c7, 0x5eead4, 0x38bdf8, 0xf0abfc] as const;
  const colorIndex = Math.floor(seededUnit(seed, index, 8) * colors.length);
  return colors[colorIndex] ?? colors[0];
}

function hashStringToUnit(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash / 0xffffffff;
}

function seededUnit(seed: number, index: number, salt: number): number {
  const value = Math.sin((index + 1) * 12.9898 + seed * 78.233 + salt * 37.719) * 43_758.5453;
  return value - Math.floor(value);
}

function setupGatheringAttackArcOverlay(
  app: Application,
  options: GatheringAttackArcOverlayOptions,
): () => void {
  const arc = new Graphics();
  const sparks = new Graphics();
  app.stage.addChild(arc, sparks);

  const draw = () => {
    drawGatheringAttackArc(app, arc, sparks, options);
  };
  const drawAndRender = () => {
    draw();
    app.render();
  };

  if (options.reducedMotion) {
    app.stop();
  } else {
    app.ticker.add(draw);
  }

  window.addEventListener("pointermove", drawAndRender, { passive: true });
  window.addEventListener("resize", drawAndRender);
  window.addEventListener("scroll", drawAndRender, true);
  drawAndRender();

  return () => {
    if (!options.reducedMotion) app.ticker.remove(draw);
    window.removeEventListener("pointermove", drawAndRender);
    window.removeEventListener("resize", drawAndRender);
    window.removeEventListener("scroll", drawAndRender, true);
    arc.destroy();
    sparks.destroy();
  };
}

function drawGatheringAttackArc(
  app: Application,
  arc: Graphics,
  sparks: Graphics,
  options: GatheringAttackArcOverlayOptions,
): void {
  const move = options.moveRef.current;
  const cardElement = options.cardRef.current;
  const targetElement = getGatheringAttackTargetElement(options.targetRef.current);

  if (!move || !cardElement || !targetElement) {
    clearGatheringAttackArcGraphics(arc, sparks);
    return;
  }

  const canvasRect = app.canvas.getBoundingClientRect();
  const cardRect = cardElement.getBoundingClientRect();
  const targetRect = targetElement.getBoundingClientRect();
  if (canvasRect.width <= 0 || canvasRect.height <= 0) {
    clearGatheringAttackArcGraphics(arc, sparks);
    return;
  }

  const scaleX = app.screen.width / canvasRect.width;
  const scaleY = app.screen.height / canvasRect.height;
  const start = toPixiOverlayPoint(
    cardRect.left + cardRect.width * 0.82,
    cardRect.top + cardRect.height * 0.5,
    canvasRect,
    scaleX,
    scaleY,
  );
  const end = toPixiOverlayPoint(
    targetRect.left + targetRect.width * 0.42,
    targetRect.top + targetRect.height * 0.48,
    canvasRect,
    scaleX,
    scaleY,
  );
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  if (Math.hypot(deltaX, deltaY) < 12) {
    clearGatheringAttackArcGraphics(arc, sparks);
    return;
  }

  const visual = getGatheringMoveVisual(move.id);
  const lift = clamp(Math.abs(deltaX) * 0.18 + Math.abs(deltaY) * 0.08, 32, 140);
  const controlOne = {
    x: start.x + deltaX * 0.34,
    y: start.y - lift,
  };
  const controlTwo = {
    x: start.x + deltaX * 0.72,
    y: end.y - lift * 0.38,
  };
  const pulse = 0.86 + Math.sin(performance.now() / 90) * 0.1;

  arc
    .clear()
    .moveTo(start.x, start.y)
    .bezierCurveTo(controlOne.x, controlOne.y, controlTwo.x, controlTwo.y, end.x, end.y)
    .stroke({
      alpha: visual.arcGlowAlpha * pulse,
      cap: "round",
      color: visual.arcColor,
      width: 24,
    })
    .moveTo(start.x, start.y)
    .bezierCurveTo(controlOne.x, controlOne.y, controlTwo.x, controlTwo.y, end.x, end.y)
    .stroke({
      alpha: 0.9,
      cap: "round",
      color: visual.arcColor,
      width: 7,
    });

  drawGatheringAttackArrowhead(arc, controlTwo, end, visual.arcColor);
  drawGatheringAttackSparks(sparks, start, controlOne, controlTwo, end, visual.arcColor, pulse);
}

function clearGatheringAttackArcGraphics(arc: Graphics, sparks: Graphics): void {
  arc.clear();
  sparks.clear();
}

function getGatheringAttackTargetElement(panelElement: HTMLElement | null): HTMLElement | null {
  const monsterCard =
    panelElement?.querySelector('[data-board-section="gathering-monster-card"]') ?? null;
  if (isHTMLElement(monsterCard)) return monsterCard;
  return panelElement;
}

function toPixiOverlayPoint(
  clientX: number,
  clientY: number,
  canvasRect: DOMRect,
  scaleX: number,
  scaleY: number,
): { x: number; y: number } {
  return {
    x: (clientX - canvasRect.left) * scaleX,
    y: (clientY - canvasRect.top) * scaleY,
  };
}

function drawGatheringAttackArrowhead(
  arc: Graphics,
  controlPoint: { x: number; y: number },
  end: { x: number; y: number },
  color: number,
): void {
  const directionX = end.x - controlPoint.x;
  const directionY = end.y - controlPoint.y;
  const length = Math.max(Math.hypot(directionX, directionY), 1);
  const unitX = directionX / length;
  const unitY = directionY / length;
  const perpendicularX = -unitY;
  const perpendicularY = unitX;
  const baseX = end.x - unitX * 26;
  const baseY = end.y - unitY * 26;

  arc
    .moveTo(baseX + perpendicularX * 10, baseY + perpendicularY * 10)
    .lineTo(end.x, end.y)
    .lineTo(baseX - perpendicularX * 10, baseY - perpendicularY * 10)
    .stroke({
      alpha: 0.92,
      cap: "round",
      color,
      join: "round",
      width: 7,
    });
}

function drawGatheringAttackSparks(
  sparks: Graphics,
  start: { x: number; y: number },
  controlOne: { x: number; y: number },
  controlTwo: { x: number; y: number },
  end: { x: number; y: number },
  color: number,
  pulse: number,
): void {
  sparks.clear();
  const sparkPoints = [
    { point: getCubicBezierPoint(start, controlOne, controlTwo, end, 0.22), radius: 3.5 },
    { point: getCubicBezierPoint(start, controlOne, controlTwo, end, 0.48), radius: 2.6 },
    { point: getCubicBezierPoint(start, controlOne, controlTwo, end, 0.72), radius: 3.1 },
  ];

  for (const spark of sparkPoints) {
    sparks.circle(spark.point.x, spark.point.y, spark.radius * pulse).fill({
      alpha: 0.72,
      color,
    });
  }
}

function getCubicBezierPoint(
  start: { x: number; y: number },
  controlOne: { x: number; y: number },
  controlTwo: { x: number; y: number },
  end: { x: number; y: number },
  time: number,
): { x: number; y: number } {
  const inverse = 1 - time;
  const inverseSquared = inverse * inverse;
  const timeSquared = time * time;

  return {
    x:
      inverseSquared * inverse * start.x +
      3 * inverseSquared * time * controlOne.x +
      3 * inverse * timeSquared * controlTwo.x +
      timeSquared * time * end.x,
    y:
      inverseSquared * inverse * start.y +
      3 * inverseSquared * time * controlOne.y +
      3 * inverse * timeSquared * controlTwo.y +
      timeSquared * time * end.y,
  };
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
