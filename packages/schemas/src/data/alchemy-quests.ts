import * as z from "zod";

import {
  ALCHEMY_GATHERABLE_CARDS,
  ALCHEMY_MAX_TABLE_SLOT_COUNT,
  ALCHEMY_PRIMITIVE_CARD_IDS,
  ALCHEMY_RECIPES,
  ALCHEMY_STARTING_TABLE_SLOT_COUNT,
  getAlchemyRecipeArgumentComplexity,
  getAlchemyRecipeById,
  getAlchemyRecipeVisibleSlotCount,
  type QuestRequester,
  QuestRequesterSchema,
  type StaticAlchemyRecipe,
} from "./alchemy-recipes";
import { ELEMENT_CARDS } from "./element-cards";

export const ALCHEMY_QUEST_KINDS = [
  "tutorial",
  "critical",
  "production",
  "curiosity",
  "mastery",
  "capstone",
] as const;
export const AlchemyQuestKindSchema = z.enum(ALCHEMY_QUEST_KINDS);
export type AlchemyQuestKind = z.infer<typeof AlchemyQuestKindSchema>;

export const ALCHEMY_QUEST_BOARD_SLOTS = [
  "critical",
  "production",
  "curiosity",
  "mastery",
  "long-contract",
] as const;
export const AlchemyQuestBoardSlotSchema = z.enum(ALCHEMY_QUEST_BOARD_SLOTS);
export type AlchemyQuestBoardSlot = z.infer<typeof AlchemyQuestBoardSlotSchema>;

export const ALCHEMY_DISCOVERY_OPTION_KINDS = [
  "element",
  "raw-material",
  "npc",
  "recipe",
  "upgrade",
  "zone",
  "knowledge",
] as const;
export const AlchemyDiscoveryOptionKindSchema = z.enum(ALCHEMY_DISCOVERY_OPTION_KINDS);
export type AlchemyDiscoveryOptionKind = z.infer<typeof AlchemyDiscoveryOptionKindSchema>;

export const ALCHEMY_DISCOVERY_OPTION_ROLES = ["critical", "synergy", "preference"] as const;
export const AlchemyDiscoveryOptionRoleSchema = z.enum(ALCHEMY_DISCOVERY_OPTION_ROLES);
export type AlchemyDiscoveryOptionRole = z.infer<typeof AlchemyDiscoveryOptionRoleSchema>;

export const AlchemyQuestIdSchema = z.string().regex(/^quest:[a-z0-9-]+$/);
export type AlchemyQuestId = z.infer<typeof AlchemyQuestIdSchema>;

export const AlchemyQuestRecipeIdSchema = z.string().regex(/^alchemy:[a-z0-9-]+$/);
export type AlchemyQuestRecipeId = z.infer<typeof AlchemyQuestRecipeIdSchema>;

export const AlchemyQuestCardIdSchema = z
  .string()
  .regex(/^(element|raw|material|component|container|consumable|equipment|quest):[a-z0-9-]+$/);
export type AlchemyQuestCardId = z.infer<typeof AlchemyQuestCardIdSchema>;

export const AlchemyQuestTokenIdSchema = z.string().regex(/^[a-z]+:[a-z0-9-]+$/);

export const AlchemyDiscoveryOptionSchema = z.object({
  role: AlchemyDiscoveryOptionRoleSchema,
  kind: AlchemyDiscoveryOptionKindSchema,
  id: AlchemyQuestTokenIdSchema,
  label: z.string().min(1),
  reason: z.string().min(1),
});
export type AlchemyDiscoveryOption = z.infer<typeof AlchemyDiscoveryOptionSchema>;

export const AlchemyQuestAnyOfGateSchema = z.object({
  questIds: z.array(AlchemyQuestIdSchema).min(1),
  count: z.int().min(1),
});
export type AlchemyQuestAnyOfGate = z.infer<typeof AlchemyQuestAnyOfGateSchema>;

export const AlchemyQuestPrerequisitesSchema = z.object({
  allOf: z.array(AlchemyQuestIdSchema),
  anyOf: z.array(AlchemyQuestAnyOfGateSchema),
});
export type AlchemyQuestPrerequisites = z.infer<typeof AlchemyQuestPrerequisitesSchema>;

export const AlchemyQuestProgressionSchema = z.object({
  act: z.int().min(1).max(10),
  sequence: z.int().min(1),
  branch: z.string().regex(/^[a-z0-9-]+$/),
  boardSlot: AlchemyQuestBoardSlotSchema,
  suggestedMinutes: z.tuple([z.int().min(0), z.int().min(1)]),
});
export type AlchemyQuestProgression = z.infer<typeof AlchemyQuestProgressionSchema>;

export const AlchemyQuestNarrativeSchema = z.object({
  title: z.string().min(1),
  requester: QuestRequesterSchema,
  summary: z.string().min(1),
  need: z.string().min(1),
  hint: z.string().min(1),
  completion: z.string().min(1),
});
export type AlchemyQuestNarrative = z.infer<typeof AlchemyQuestNarrativeSchema>;

export const AlchemyQuestUnlocksSchema = z.object({
  elementCardIds: z.array(AlchemyQuestCardIdSchema),
  rawCardIds: z.array(AlchemyQuestCardIdSchema),
  recipeIds: z.array(AlchemyQuestRecipeIdSchema),
  requesters: z.array(QuestRequesterSchema),
  zones: z.array(AlchemyQuestTokenIdSchema),
  upgrades: z.array(AlchemyQuestTokenIdSchema),
  knowledgeBadges: z.array(AlchemyQuestTokenIdSchema),
});
export type AlchemyQuestUnlocks = z.infer<typeof AlchemyQuestUnlocksSchema>;

export const AlchemyQuestRewardsSchema = z.object({
  gold: z.int().min(0),
  knowledgeXp: z.int().min(0),
  discoveryTokens: z.int().min(0),
  muddlefogCleared: z.int().min(0).max(100),
});
export type AlchemyQuestRewards = z.infer<typeof AlchemyQuestRewardsSchema>;

export const AlchemyTableSlotUpgradeSchema = z.object({
  id: AlchemyQuestTokenIdSchema,
  slotCount: z
    .int()
    .min(ALCHEMY_STARTING_TABLE_SLOT_COUNT + 1)
    .max(ALCHEMY_MAX_TABLE_SLOT_COUNT),
  costGold: z.int().min(0),
  unlockQuestId: AlchemyQuestIdSchema,
  label: z.string().min(1),
  description: z.string().min(1),
});
export type AlchemyTableSlotUpgrade = z.infer<typeof AlchemyTableSlotUpgradeSchema>;

export const AlchemyQuestSchema = z.object({
  id: AlchemyQuestIdSchema,
  kind: AlchemyQuestKindSchema,
  narrative: AlchemyQuestNarrativeSchema,
  progression: AlchemyQuestProgressionSchema,
  prerequisites: AlchemyQuestPrerequisitesSchema,
  recipeIds: z.array(AlchemyQuestRecipeIdSchema).min(1),
  teachingFocus: z.array(z.string().min(1)).min(1),
  unlocks: AlchemyQuestUnlocksSchema,
  rewards: AlchemyQuestRewardsSchema,
  discoveryDraft: z.array(AlchemyDiscoveryOptionSchema).length(3).nullable(),
});
export type AlchemyQuest = z.infer<typeof AlchemyQuestSchema>;

type DeepReadonly<T> = T extends readonly (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

type UnlockInput = {
  elementCardIds?: readonly string[];
  knowledgeBadges?: readonly string[];
  rawCardIds?: readonly string[];
  recipeIds?: readonly string[];
  requesters?: readonly QuestRequester[];
  upgrades?: readonly string[];
  zones?: readonly string[];
};

const prerequisites = (
  allOf: readonly string[] = [],
  anyOf: readonly DeepReadonly<AlchemyQuestAnyOfGate>[] = [],
) => ({ allOf, anyOf }) as const;

const unlocks = (input: UnlockInput = {}) =>
  ({
    elementCardIds: input.elementCardIds ?? [],
    rawCardIds: input.rawCardIds ?? [],
    recipeIds: input.recipeIds ?? [],
    requesters: input.requesters ?? [],
    zones: input.zones ?? [],
    upgrades: input.upgrades ?? [],
    knowledgeBadges: input.knowledgeBadges ?? [],
  }) as const;

const rewards = (
  gold: number,
  knowledgeXp: number,
  discoveryTokens: number,
  muddlefogCleared: number,
) => ({ gold, knowledgeXp, discoveryTokens, muddlefogCleared }) as const;

const option = (
  role: AlchemyDiscoveryOptionRole,
  kind: AlchemyDiscoveryOptionKind,
  id: string,
  label: string,
  reason: string,
) => ({ role, kind, id, label, reason }) as const;

const draft = (
  critical: DeepReadonly<AlchemyDiscoveryOption>,
  synergy: DeepReadonly<AlchemyDiscoveryOption>,
  preference: DeepReadonly<AlchemyDiscoveryOption>,
) => [critical, synergy, preference] as const;

const quest = <const T extends DeepReadonly<AlchemyQuest>>(value: T) => value;

export const ALCHEMY_TABLE_SLOT_UPGRADES = [
  {
    id: "upgrade:table-slot-4",
    slotCount: 4,
    costGold: 8,
    unlockQuestId: "quest:first-water",
    label: "Workbench Slot IV",
    description: "Adds a fourth visible recipe slot after the Water tutorial.",
  },
  {
    id: "upgrade:table-slot-5",
    slotCount: 5,
    costGold: 24,
    unlockQuestId: "quest:field-kit-basics",
    label: "Workbench Slot V",
    description: "Adds the fifth visible recipe slot for carbonate and capstone recipes.",
  },
] as const satisfies readonly AlchemyTableSlotUpgrade[];

export const ALCHEMY_QUESTS = [
  quest({
    id: "quest:first-water",
    kind: "tutorial",
    narrative: {
      title: "Sir Bubbleton Needs Water",
      requester: "knight",
      summary: "Professor Atomwick parts the fog around two Hydrogen cards and one Oxygen card.",
      need: "My training helmet is steaming. Can you make Water before the plume turns into fire?",
      hint: "Water is H2O: two Hydrogen cards and one Oxygen card fill the starter Alchemy Workbench.",
      completion:
        "H2O cools the helmet for now, but Sir Bubbleton already suspects the next training run will need a whole bucket.",
    },
    progression: {
      act: 1,
      sequence: 1,
      branch: "workshop",
      boardSlot: "critical",
      suggestedMinutes: [0, 5],
    },
    prerequisites: prerequisites(),
    recipeIds: ["alchemy:water"],
    teachingFocus: ["count atoms", "read H2O", "three-slot starter Alchemy Workbench"],
    unlocks: unlocks({
      elementCardIds: ["element:h", "element:o", "element:c"],
      requesters: ["knight"],
      zones: ["zone:quest-board", "zone:periodic-table-vault"],
      upgrades: ["upgrade:table-slot-4"],
      recipeIds: ["alchemy:water"],
      knowledgeBadges: ["badge:first-molecule"],
    }),
    rewards: rewards(10, 12, 1, 3),
    discoveryDraft: draft(
      option("critical", "element", "element:na", "Sodium", "Pairs with Chlorine for salt."),
      option("synergy", "element", "element:fe", "Iron", "Starts the forge path."),
      option("preference", "npc", "npc:baker", "Baker Brindle", "Adds cozy kitchen orders."),
    ),
  }),
  quest({
    id: "quest:kitchen-salt-and-fuel",
    kind: "production",
    narrative: {
      title: "Baker Brindle's Salt Pinch",
      requester: "cleric",
      summary:
        "The town learns that simple element pairs and raw materials become useful supplies.",
      need: "The kitchen and chapel need a crate of Kitchen Stores: clean salt, charcoal, and ash.",
      hint: "Salt uses Sodium and Chlorine, and Wood becomes Charcoal and Ash. Bundle all three into Kitchen Stores to deliver.",
      completion:
        "The pantry labels make sense again, and the Muddlefog thins over the market shelf.",
    },
    progression: {
      act: 1,
      sequence: 2,
      branch: "kitchen",
      boardSlot: "production",
      suggestedMinutes: [5, 12],
    },
    prerequisites: prerequisites(["quest:first-water"]),
    recipeIds: ["alchemy:salt", "alchemy:charcoal", "alchemy:ash", "alchemy:kitchen-stores"],
    teachingFocus: ["binary compounds", "raw material transforms", "same input different output"],
    unlocks: unlocks({
      elementCardIds: ["element:na", "element:cl"],
      rawCardIds: ["raw:wood"],
      requesters: ["cleric", "blacksmith"],
      zones: ["zone:market-shelf"],
      recipeIds: ["alchemy:salt", "alchemy:charcoal", "alchemy:ash", "alchemy:kitchen-stores"],
      knowledgeBadges: ["badge:first-salt"],
    }),
    rewards: rewards(18, 18, 0, 3),
    discoveryDraft: null,
  }),
  quest({
    id: "quest:metal-samples",
    kind: "curiosity",
    narrative: {
      title: "Mina's Metal Samples",
      requester: "blacksmith",
      summary: "The forge asks for recognizable metals before alloys appear.",
      need: "Bring me Iron and Copper ingots so the anvil remembers its job.",
      hint: "Some early metals can be smelted from one element card.",
      completion:
        "The anvil rings. Metal recipes will now point back to the elements that made them.",
    },
    progression: {
      act: 1,
      sequence: 3,
      branch: "forge",
      boardSlot: "curiosity",
      suggestedMinutes: [8, 14],
    },
    prerequisites: prerequisites(["quest:first-water"]),
    recipeIds: ["alchemy:iron-ingot", "alchemy:copper-ingot"],
    teachingFocus: ["metals", "element to material", "periodic table families"],
    unlocks: unlocks({
      elementCardIds: ["element:fe", "element:cu"],
      requesters: ["blacksmith", "artificer"],
      zones: ["zone:mine-and-forge"],
      recipeIds: ["alchemy:iron-ingot", "alchemy:copper-ingot"],
      knowledgeBadges: ["badge:first-metal"],
    }),
    rewards: rewards(16, 14, 0, 2),
    discoveryDraft: null,
  }),
  quest({
    id: "quest:field-kit-basics",
    kind: "production",
    narrative: {
      title: "The First Field Kit",
      requester: "ranger",
      summary: "Water starts chaining into plant, clay, glass, cork, fiber, and healing supplies.",
      need: "The guild scouts need mash, slip, powder, stopper, thread, and a warm tea.",
      hint: "Use Water as a helper material. The starter Alchemy Workbench can still handle these recipes.",
      completion:
        "The Inventory fills with useful components, and the Workbench Slot V purchase prompt can offer the fifth Alchemy Workbench slot.",
    },
    progression: {
      act: 1,
      sequence: 4,
      branch: "field",
      boardSlot: "production",
      suggestedMinutes: [10, 15],
    },
    prerequisites: prerequisites(["quest:first-water"]),
    recipeIds: [
      "alchemy:herbal-mash",
      "alchemy:clay-slip",
      "alchemy:sand-powder",
      "alchemy:cork-stopper",
      "alchemy:linen-thread",
      "alchemy:healing-tea",
    ],
    teachingFocus: ["compound reuse", "inventory planning", "component vocabulary"],
    unlocks: unlocks({
      rawCardIds: [
        "raw:clay",
        "raw:cork-bark",
        "raw:herbs",
        "raw:honey",
        "raw:linen-fiber",
        "raw:sand",
      ],
      requesters: ["ranger", "druid", "bard"],
      upgrades: ["upgrade:table-slot-5"],
      recipeIds: [
        "alchemy:herbal-mash",
        "alchemy:clay-slip",
        "alchemy:sand-powder",
        "alchemy:cork-stopper",
        "alchemy:linen-thread",
        "alchemy:healing-tea",
      ],
      knowledgeBadges: ["badge:first-component"],
    }),
    rewards: rewards(24, 28, 1, 4),
    discoveryDraft: draft(
      option("critical", "element", "element:si", "Silicon", "Opens the glass chain."),
      option("synergy", "raw-material", "raw:beeswax", "Beeswax", "Seals bottles and scrolls."),
      option(
        "preference",
        "upgrade",
        "upgrade:table-slot-5",
        "Workbench Slot V",
        "Fits five-card carbonate recipes.",
      ),
    ),
  }),
  quest({
    id: "quest:glass-minerals",
    kind: "critical",
    narrative: {
      title: "Glassblower Luma's Mineral Riddle",
      requester: "artificer",
      summary: "The player builds the mineral foundation for glass from element recipes.",
      need: "Luma needs one Glass Batch made from Silica, Soda Ash, and Calcium Carbonate.",
      hint: "Buy the fifth Alchemy Workbench slot. Make Silica, Soda Ash, and Calcium Carbonate first, then combine those three materials into Glass Batch.",
      completion: "The glassworks furnace wakes up with a soft blue glow.",
    },
    progression: {
      act: 2,
      sequence: 5,
      branch: "glassworks",
      boardSlot: "critical",
      suggestedMinutes: [15, 24],
    },
    prerequisites: prerequisites([
      "quest:first-water",
      "quest:kitchen-salt-and-fuel",
      "quest:field-kit-basics",
    ]),
    recipeIds: [
      "alchemy:silica",
      "alchemy:soda-ash",
      "alchemy:calcium-carbonate",
      "alchemy:glass-batch",
    ],
    teachingFocus: ["multi-atom formulas", "pre-crafting", "minerals become materials"],
    unlocks: unlocks({
      elementCardIds: ["element:si", "element:ca"],
      rawCardIds: ["raw:limestone"],
      requesters: ["artificer"],
      zones: ["zone:glassworks"],
      recipeIds: [
        "alchemy:silica",
        "alchemy:soda-ash",
        "alchemy:calcium-carbonate",
        "alchemy:glass-batch",
      ],
      knowledgeBadges: ["badge:silicates"],
    }),
    rewards: rewards(34, 34, 1, 5),
    discoveryDraft: draft(
      option(
        "critical",
        "recipe",
        "alchemy:glass",
        "Glass",
        "Turns minerals into a reusable material.",
      ),
      option(
        "synergy",
        "npc",
        "npc:glassblower-luma",
        "Glassblower Luma",
        "Adds lens and flask requests.",
      ),
      option(
        "preference",
        "upgrade",
        "upgrade:recipe-ghosts-1",
        "Recipe Ghosts I",
        "Shows missing cards.",
      ),
    ),
  }),
  quest({
    id: "quest:first-flask",
    kind: "critical",
    narrative: {
      title: "The First Flask",
      requester: "wizard",
      summary: "The glass chain compresses a large material path into practical containers.",
      need: "Make Glass, a Glass Tube, and a Glass Flask for the workshop shelf.",
      hint: "A Flask is one visible card, but it remembers the glass chain inside it.",
      completion: "The table now feels like a workshop, not just a counting mat.",
    },
    progression: {
      act: 2,
      sequence: 6,
      branch: "glassworks",
      boardSlot: "critical",
      suggestedMinutes: [24, 30],
    },
    prerequisites: prerequisites(["quest:glass-minerals", "quest:kitchen-salt-and-fuel"]),
    recipeIds: ["alchemy:glass", "alchemy:glass-tube", "alchemy:glass-flask"],
    teachingFocus: ["material chain", "container idea", "compression"],
    unlocks: unlocks({
      recipeIds: ["alchemy:glass", "alchemy:glass-tube", "alchemy:glass-flask"],
      knowledgeBadges: ["badge:first-container"],
    }),
    rewards: rewards(28, 26, 0, 3),
    discoveryDraft: null,
  }),
  quest({
    id: "quest:water-flask-delivery",
    kind: "capstone",
    narrative: {
      title: "The Knight's Water Flask",
      requester: "knight",
      summary: "The first large quest item proves that earlier chains can merge.",
      need: "Seal a Flask, fill it with Water, and make a field-ready Water Flask.",
      hint: "Use Cork, Wax, Glass, Clay, Honey, and Water as prepared cards.",
      completion: "Sir Bubbleton cheers because the player built an object from many tiny truths.",
    },
    progression: {
      act: 2,
      sequence: 7,
      branch: "water-flask",
      boardSlot: "critical",
      suggestedMinutes: [30, 38],
    },
    prerequisites: prerequisites([
      "quest:first-flask",
      "quest:field-kit-basics",
      "quest:kitchen-salt-and-fuel",
    ]),
    recipeIds: [
      "alchemy:wax-seal",
      "alchemy:sugar-syrup",
      "alchemy:sealed-flask",
      "alchemy:water-flask",
      "alchemy:clay-vial",
    ],
    teachingFocus: ["quest item", "merged chains", "inventory planning"],
    unlocks: unlocks({
      rawCardIds: ["raw:beeswax"],
      recipeIds: [
        "alchemy:wax-seal",
        "alchemy:sugar-syrup",
        "alchemy:sealed-flask",
        "alchemy:water-flask",
        "alchemy:clay-vial",
      ],
      knowledgeBadges: ["badge:first-big-quest"],
    }),
    rewards: rewards(44, 42, 1, 6),
    discoveryDraft: draft(
      option("critical", "element", "element:k", "Potassium", "Opens the garden salt path."),
      option("synergy", "npc", "npc:ranger", "Ranger Rowan", "Adds field supply quests."),
      option(
        "preference",
        "upgrade",
        "upgrade:queue-2",
        "Craft Queue II",
        "Plans two crafts ahead.",
      ),
    ),
  }),
  quest({
    id: "quest:lime-and-ceramics",
    kind: "production",
    narrative: {
      title: "Bowls Against the Fog",
      requester: "cleric",
      summary: "Lime and clay recipes teach bases, ceramics, and sealed containers.",
      need: "The infirmary needs Lime, Slaked Lime, Ceramic Clay, a Bowl, and a Wax-Sealed Vial.",
      hint: "Water can calm Quicklime into Slaked Lime in the game model.",
      completion: "The healing shelf becomes organized enough for longer potion chains.",
    },
    progression: {
      act: 3,
      sequence: 8,
      branch: "ceramics",
      boardSlot: "production",
      suggestedMinutes: [38, 46],
    },
    prerequisites: prerequisites(["quest:water-flask-delivery"]),
    recipeIds: [
      "alchemy:quicklime",
      "alchemy:slaked-lime",
      "alchemy:ceramic-clay",
      "alchemy:ceramic-bowl",
      "alchemy:wax-sealed-vial",
    ],
    teachingFocus: ["bases", "ceramics", "safe simplification notes"],
    unlocks: unlocks({
      recipeIds: [
        "alchemy:quicklime",
        "alchemy:slaked-lime",
        "alchemy:ceramic-clay",
        "alchemy:ceramic-bowl",
        "alchemy:wax-sealed-vial",
      ],
      knowledgeBadges: ["badge:ceramics"],
    }),
    rewards: rewards(36, 34, 0, 3),
    discoveryDraft: null,
  }),
  quest({
    id: "quest:fizzing-gases",
    kind: "curiosity",
    narrative: {
      title: "Bubbles in the Cauldron",
      requester: "bard",
      summary: "Carbon dioxide and carbonic water introduce gases without danger.",
      need: "Make Carbon Dioxide, Carbonic Water, and Distilled Water for a fizzy demonstration.",
      hint: "A gas card is still matter. Distilled Water now asks for two Water cards, showing that crafted cards can be inputs too.",
      completion: "The bard writes a song about bubbles that are made of atoms.",
    },
    progression: {
      act: 3,
      sequence: 9,
      branch: "fizz",
      boardSlot: "curiosity",
      suggestedMinutes: [38, 46],
    },
    prerequisites: prerequisites(["quest:water-flask-delivery"]),
    recipeIds: ["alchemy:carbon-dioxide", "alchemy:carbonic-water", "alchemy:distilled-water"],
    teachingFocus: ["states of matter", "gas as matter", "distillation"],
    unlocks: unlocks({
      recipeIds: ["alchemy:carbon-dioxide", "alchemy:carbonic-water", "alchemy:distilled-water"],
      knowledgeBadges: ["badge:first-gas"],
    }),
    rewards: rewards(30, 32, 0, 3),
    discoveryDraft: null,
  }),
  quest({
    id: "quest:salts-and-conductors",
    kind: "mastery",
    narrative: {
      title: "Salt Roads and Shiny Wires",
      requester: "artificer",
      summary:
        "Salt, potassium, copper, and glass become the bridge to later electricity and charms.",
      need: "Craft Brine, Sea Salt Crystals, Potassium Salt, two-ingot Copper Wire, and a Glass Bead.",
      hint: "Copper Wire now spends two Copper Ingots, so build a small metal buffer before shaping it.",
      completion: "The guild sees that one known card can unlock many future needs.",
    },
    progression: {
      act: 3,
      sequence: 10,
      branch: "conductors",
      boardSlot: "mastery",
      suggestedMinutes: [44, 52],
    },
    prerequisites: prerequisites([
      "quest:first-flask",
      "quest:metal-samples",
      "quest:kitchen-salt-and-fuel",
    ]),
    recipeIds: [
      "alchemy:brine",
      "alchemy:sea-salt-crystals",
      "alchemy:potassium-salt",
      "alchemy:copper-wire",
      "alchemy:glass-bead",
    ],
    teachingFocus: ["salts", "conductors", "reuse web"],
    unlocks: unlocks({
      elementCardIds: ["element:k"],
      recipeIds: [
        "alchemy:brine",
        "alchemy:sea-salt-crystals",
        "alchemy:potassium-salt",
        "alchemy:copper-wire",
        "alchemy:glass-bead",
      ],
      knowledgeBadges: ["badge:salt-chain"],
    }),
    rewards: rewards(42, 44, 1, 5),
    discoveryDraft: draft(
      option("critical", "npc", "npc:wizard", "Wizard Quillby", "Opens scrollcraft."),
      option("synergy", "raw-material", "raw:berries", "Dark Berries", "Adds pigment and ink."),
      option("preference", "upgrade", "upgrade:autosort-1", "Auto Sorter", "Sorts finished cards."),
    ),
  }),
  quest({
    id: "quest:potion-board",
    kind: "production",
    narrative: {
      title: "Three Bottles on the Board",
      requester: "cleric",
      summary: "The potion chain pulls together glass, fizz, healing, and clean water.",
      need: "Make an Empty Potion Bottle, a Simple Healing Potion, and a Fizzy Tonic.",
      hint: "Use the Output Slot. These recipes borrow from different branches.",
      completion: "The town starts asking for finished goods, not just materials.",
    },
    progression: {
      act: 4,
      sequence: 11,
      branch: "potions",
      boardSlot: "production",
      suggestedMinutes: [52, 60],
    },
    prerequisites: prerequisites(["quest:water-flask-delivery", "quest:fizzing-gases"]),
    recipeIds: [
      "alchemy:empty-potion-bottle",
      "alchemy:simple-healing-potion",
      "alchemy:fizzy-tonic",
    ],
    teachingFocus: ["cross-branch recipe", "consumables", "container plus contents"],
    unlocks: unlocks({
      requesters: ["cleric"],
      recipeIds: [
        "alchemy:empty-potion-bottle",
        "alchemy:simple-healing-potion",
        "alchemy:fizzy-tonic",
      ],
      knowledgeBadges: ["badge:potion-chain"],
    }),
    rewards: rewards(42, 42, 0, 4),
    discoveryDraft: null,
  }),
  quest({
    id: "quest:ranger-and-cleric-orders",
    kind: "curiosity",
    narrative: {
      title: "Field Orders Arrive",
      requester: "ranger",
      summary: "Class requests begin, each using a different earlier material idea.",
      need: "Prepare a Ranger Field Flask, Cleansing Salt, Smoke Puff, and a two-ingot Iron Nail.",
      hint: "Class orders are small stories about why a material matters; metal parts may need two ingots.",
      completion: "The Quest Briefing now feels like Vellum Vale is depending on the player.",
    },
    progression: {
      act: 4,
      sequence: 12,
      branch: "adventurers",
      boardSlot: "curiosity",
      suggestedMinutes: [54, 62],
    },
    prerequisites: prerequisites([
      "quest:salts-and-conductors",
      "quest:lime-and-ceramics",
      "quest:fizzing-gases",
      "quest:water-flask-delivery",
      "quest:metal-samples",
    ]),
    recipeIds: [
      "alchemy:ranger-field-flask",
      "alchemy:cleansing-salt",
      "alchemy:smoke-puff",
      "alchemy:iron-nail",
    ],
    teachingFocus: ["class orders", "materials in context", "soft pressure"],
    unlocks: unlocks({
      requesters: ["ranger", "rogue"],
      recipeIds: [
        "alchemy:ranger-field-flask",
        "alchemy:cleansing-salt",
        "alchemy:smoke-puff",
        "alchemy:iron-nail",
      ],
      knowledgeBadges: ["badge:first-class-order"],
    }),
    rewards: rewards(44, 44, 0, 4),
    discoveryDraft: null,
  }),
  quest({
    id: "quest:scribe-and-charm",
    kind: "critical",
    narrative: {
      title: "Wizard Quillby's Sealed Scroll",
      requester: "wizard",
      summary: "Ink, paper, wax, copper, and glass become authored magical tools.",
      need: "Craft Ink Base, Black Ink, Scroll Paper, a Sealed Scroll, and a Copper Charm.",
      hint: "A writing quest uses chemistry for color, surface, seal, and shine.",
      completion: "Archivist Mendelee opens the first Museum drawer.",
    },
    progression: {
      act: 4,
      sequence: 13,
      branch: "scribe",
      boardSlot: "critical",
      suggestedMinutes: [60, 68],
    },
    prerequisites: prerequisites([
      "quest:salts-and-conductors",
      "quest:lime-and-ceramics",
      "quest:fizzing-gases",
      "quest:water-flask-delivery",
      "quest:metal-samples",
      "quest:field-kit-basics",
    ]),
    recipeIds: [
      "alchemy:ink-base",
      "alchemy:black-ink",
      "alchemy:scroll-paper",
      "alchemy:sealed-scroll",
      "alchemy:copper-charm",
    ],
    teachingFocus: ["pigment precursor", "writing materials", "artifact assembly"],
    unlocks: unlocks({
      rawCardIds: ["raw:berries", "raw:resin"],
      requesters: ["wizard", "bard"],
      zones: ["zone:element-museum"],
      recipeIds: [
        "alchemy:ink-base",
        "alchemy:black-ink",
        "alchemy:scroll-paper",
        "alchemy:sealed-scroll",
        "alchemy:copper-charm",
      ],
      knowledgeBadges: ["badge:first-artifact"],
    }),
    rewards: rewards(56, 58, 1, 6),
    discoveryDraft: draft(
      option("critical", "element", "element:sn", "Tin", "Begins bronze alloy recipes."),
      option("synergy", "element", "element:zn", "Zinc", "Pairs with Copper for brass."),
      option(
        "preference",
        "npc",
        "npc:archivist-mendelee",
        "Archivist Mendelee",
        "Adds mastery checks.",
      ),
    ),
  }),
  quest({
    id: "quest:alloy-market",
    kind: "critical",
    narrative: {
      title: "The Alloy Market",
      requester: "blacksmith",
      summary: "The forge turns single metals into alloys with simplified but explicit notes.",
      need: "Make Tin, Zinc, Bronze, Brass, and Steel Ingots.",
      hint: "Alloys are material recipes. The science note can explain what the game simplifies.",
      completion: "The forge board unlocks gear recipes without pretending every alloy is exact.",
    },
    progression: {
      act: 5,
      sequence: 14,
      branch: "alloys",
      boardSlot: "critical",
      suggestedMinutes: [68, 78],
    },
    prerequisites: prerequisites([
      "quest:scribe-and-charm",
      "quest:kitchen-salt-and-fuel",
      "quest:metal-samples",
    ]),
    recipeIds: [
      "alchemy:tin-ingot",
      "alchemy:zinc-ingot",
      "alchemy:bronze-ingot",
      "alchemy:brass-ingot",
      "alchemy:steel-ingot",
    ],
    teachingFocus: ["alloys", "game simplification", "metals combine"],
    unlocks: unlocks({
      elementCardIds: ["element:sn", "element:zn"],
      recipeIds: [
        "alchemy:tin-ingot",
        "alchemy:zinc-ingot",
        "alchemy:bronze-ingot",
        "alchemy:brass-ingot",
        "alchemy:steel-ingot",
      ],
      knowledgeBadges: ["badge:first-alloy"],
    }),
    rewards: rewards(54, 56, 0, 5),
    discoveryDraft: null,
  }),
  quest({
    id: "quest:fasteners-and-parts",
    kind: "production",
    narrative: {
      title: "A Tray of Useful Parts",
      requester: "artificer",
      summary: "Ingot cards become small physical parts for gear.",
      need: "Craft two-ingot Bronze Buckle, two-ingot Steel Needle, two-ingot Copper Rivet, Chain Link, and Wood Shaft parts.",
      hint: "Metal shaping now asks for two ingots, while wood and chain work still tell their own parts story.",
      completion: "The inventory starts to look like a maker bench.",
    },
    progression: {
      act: 5,
      sequence: 15,
      branch: "gear-parts",
      boardSlot: "production",
      suggestedMinutes: [76, 84],
    },
    prerequisites: prerequisites(["quest:alloy-market", "quest:ranger-and-cleric-orders"]),
    recipeIds: [
      "alchemy:bronze-buckle",
      "alchemy:steel-needle",
      "alchemy:copper-rivet",
      "alchemy:iron-chain-link",
      "alchemy:wood-shaft",
    ],
    teachingFocus: ["materials to parts", "fasteners", "tool planning"],
    unlocks: unlocks({
      rawCardIds: ["raw:feather"],
      recipeIds: [
        "alchemy:bronze-buckle",
        "alchemy:steel-needle",
        "alchemy:copper-rivet",
        "alchemy:iron-chain-link",
        "alchemy:wood-shaft",
      ],
      knowledgeBadges: ["badge:gear-parts"],
    }),
    rewards: rewards(48, 48, 0, 4),
    discoveryDraft: null,
  }),
  quest({
    id: "quest:forge-field-gear",
    kind: "capstone",
    narrative: {
      title: "Shield and Arrow Day",
      requester: "knight",
      summary: "The forge and ranger branches converge into recognizable equipment.",
      need: "Make a Shield Boss, a two-ingot Ranger Arrowhead, and a complete Ranger Arrow.",
      hint: "A finished object may hide several materials, parts, and extra ingot choices.",
      completion: "The Knight and Ranger test the gear together, then sign the Museum ledger.",
    },
    progression: {
      act: 5,
      sequence: 16,
      branch: "gear",
      boardSlot: "critical",
      suggestedMinutes: [84, 92],
    },
    prerequisites: prerequisites([
      "quest:fasteners-and-parts",
      "quest:alloy-market",
      "quest:field-kit-basics",
    ]),
    recipeIds: ["alchemy:shield-boss", "alchemy:ranger-arrowhead", "alchemy:ranger-arrow"],
    teachingFocus: ["gear assembly", "cross-NPC payoff", "recognizable objects"],
    unlocks: unlocks({
      recipeIds: ["alchemy:shield-boss", "alchemy:ranger-arrowhead", "alchemy:ranger-arrow"],
      knowledgeBadges: ["badge:first-equipment"],
    }),
    rewards: rewards(64, 62, 1, 6),
    discoveryDraft: draft(
      option("critical", "raw-material", "raw:vinegar", "Vinegar", "Starts acid-base fizz."),
      option("synergy", "npc", "npc:bard", "Bard Brio", "Adds color and stage requests."),
      option(
        "preference",
        "upgrade",
        "upgrade:offline-30",
        "Offline Chest I",
        "Stores finished crafts.",
      ),
    ),
  }),
  quest({
    id: "quest:acid-base-show",
    kind: "curiosity",
    narrative: {
      title: "The Fizz Show",
      requester: "bard",
      summary: "Acid-base play becomes a safe spectacle instead of a punishment.",
      need: "Make Vinegar Solution, Baking Soda, and Fizz Foam.",
      hint: "The foam is a model. The game returns cards and gives hints when guesses fizzle.",
      completion: "The audience laughs at the bubbles and remembers the ingredients.",
    },
    progression: {
      act: 6,
      sequence: 17,
      branch: "fizz",
      boardSlot: "curiosity",
      suggestedMinutes: [92, 100],
    },
    prerequisites: prerequisites(["quest:glass-minerals", "quest:fizzing-gases"]),
    recipeIds: ["alchemy:vinegar-solution", "alchemy:baking-soda", "alchemy:fizz-foam"],
    teachingFocus: ["acid-base model", "safe experiments", "fizzle as hint"],
    unlocks: unlocks({
      rawCardIds: ["raw:vinegar"],
      recipeIds: ["alchemy:vinegar-solution", "alchemy:baking-soda", "alchemy:fizz-foam"],
      knowledgeBadges: ["badge:acid-base"],
    }),
    rewards: rewards(42, 48, 0, 4),
    discoveryDraft: null,
  }),
  quest({
    id: "quest:pigment-lab",
    kind: "production",
    narrative: {
      title: "Pigments from Metals",
      requester: "bard",
      summary: "Copper and iron become color sources for art and glass.",
      need: "Craft Copper Chloride, Copper Patina, Iron Oxide Pigment, Green Pigment, and Red Pigment.",
      hint: "The same metal can show different colors in different recipes.",
      completion: "The Quest Briefing gains color swatches that match the crafted cards.",
    },
    progression: {
      act: 6,
      sequence: 18,
      branch: "pigments",
      boardSlot: "production",
      suggestedMinutes: [98, 106],
    },
    prerequisites: prerequisites([
      "quest:acid-base-show",
      "quest:metal-samples",
      "quest:kitchen-salt-and-fuel",
    ]),
    recipeIds: [
      "alchemy:copper-chloride",
      "alchemy:copper-patina",
      "alchemy:iron-oxide-pigment",
      "alchemy:green-pigment",
      "alchemy:red-pigment",
    ],
    teachingFocus: ["metal compounds", "color as property", "oxidation model"],
    unlocks: unlocks({
      recipeIds: [
        "alchemy:copper-chloride",
        "alchemy:copper-patina",
        "alchemy:iron-oxide-pigment",
        "alchemy:green-pigment",
        "alchemy:red-pigment",
      ],
      knowledgeBadges: ["badge:first-pigment"],
    }),
    rewards: rewards(52, 54, 0, 4),
    discoveryDraft: null,
  }),
  quest({
    id: "quest:stained-glass-lens",
    kind: "mastery",
    narrative: {
      title: "Luma's Stained Lens",
      requester: "wizard",
      summary: "Glass, color, and optics converge into the first lens challenge.",
      need: "Make Blue Glass, Green Glass, Red Glass, and a Wizard Lens.",
      hint: "Glass is the base. Pigments decide what kind of glass it becomes.",
      completion: "A colored beam cuts through the Muddlefog over the observatory hill.",
    },
    progression: {
      act: 6,
      sequence: 19,
      branch: "optics",
      boardSlot: "mastery",
      suggestedMinutes: [106, 114],
    },
    prerequisites: prerequisites(["quest:pigment-lab", "quest:first-flask"]),
    recipeIds: [
      "alchemy:blue-glass",
      "alchemy:green-glass",
      "alchemy:red-glass",
      "alchemy:wizard-lens",
    ],
    teachingFocus: ["glass colorants", "optics setup", "base plus modifier"],
    unlocks: unlocks({
      zones: ["zone:observatory"],
      recipeIds: [
        "alchemy:blue-glass",
        "alchemy:green-glass",
        "alchemy:red-glass",
        "alchemy:wizard-lens",
      ],
      knowledgeBadges: ["badge:colored-glass"],
    }),
    rewards: rewards(62, 64, 1, 6),
    discoveryDraft: draft(
      option("critical", "raw-material", "raw:hide", "Hide", "Starts parchment and leather."),
      option(
        "synergy",
        "raw-material",
        "raw:plant-oil",
        "Plant Oil",
        "Supports salves and polish.",
      ),
      option(
        "preference",
        "upgrade",
        "upgrade:pinned-items",
        "Pinned Items",
        "Protects quest parts.",
      ),
    ),
  }),
  quest({
    id: "quest:leather-and-parchment",
    kind: "critical",
    narrative: {
      title: "Skins, Strips, and Scrolls",
      requester: "wizard",
      summary: "Leather and parchment teach that the same raw input can serve different stories.",
      need: "Make Leather Strip, Parchment, a Quill Pen, and an Inked Quill.",
      hint: "The quill needs a tool part, and the parchment needs the lime chain.",
      completion: "The scribe desk opens with room for longer quest chains.",
    },
    progression: {
      act: 7,
      sequence: 20,
      branch: "scribe",
      boardSlot: "critical",
      suggestedMinutes: [114, 122],
    },
    prerequisites: prerequisites([
      "quest:fasteners-and-parts",
      "quest:scribe-and-charm",
      "quest:lime-and-ceramics",
      "quest:kitchen-salt-and-fuel",
    ]),
    recipeIds: [
      "alchemy:leather-strip",
      "alchemy:parchment",
      "alchemy:quill-pen",
      "alchemy:inked-quill",
    ],
    teachingFocus: ["same raw material, different use", "tool dependency", "scribe desk"],
    unlocks: unlocks({
      rawCardIds: ["raw:hide"],
      recipeIds: [
        "alchemy:leather-strip",
        "alchemy:parchment",
        "alchemy:quill-pen",
        "alchemy:inked-quill",
      ],
      knowledgeBadges: ["badge:scribe-tools"],
    }),
    rewards: rewards(58, 58, 0, 4),
    discoveryDraft: null,
  }),
  quest({
    id: "quest:guild-kits-and-care",
    kind: "production",
    narrative: {
      title: "Labels, Kits, and Care",
      requester: "alchemist-guild",
      summary: "The workshop learns to package helpful tools and healing supplies.",
      need: "Make a Spell Scroll, Alchemist Label, Potion Kit, Antiseptic Wash, and Cleric Salve.",
      hint: "Finished kits are built from containers, labels, washes, and soft materials.",
      completion: "The guild shelf looks prepared instead of cluttered.",
    },
    progression: {
      act: 7,
      sequence: 21,
      branch: "kits",
      boardSlot: "production",
      suggestedMinutes: [122, 132],
    },
    prerequisites: prerequisites([
      "quest:leather-and-parchment",
      "quest:scribe-and-charm",
      "quest:potion-board",
      "quest:fizzing-gases",
      "quest:field-kit-basics",
      "quest:water-flask-delivery",
    ]),
    recipeIds: [
      "alchemy:spell-scroll",
      "alchemy:alchemist-label",
      "alchemy:potion-kit",
      "alchemy:antiseptic-wash",
      "alchemy:cleric-salve",
    ],
    teachingFocus: ["kits", "packaging", "healing context"],
    unlocks: unlocks({
      rawCardIds: ["raw:plant-oil"],
      recipeIds: [
        "alchemy:spell-scroll",
        "alchemy:alchemist-label",
        "alchemy:potion-kit",
        "alchemy:antiseptic-wash",
        "alchemy:cleric-salve",
      ],
      knowledgeBadges: ["badge:first-kit"],
    }),
    rewards: rewards(66, 68, 0, 5),
    discoveryDraft: null,
  }),
  quest({
    id: "quest:stealth-and-polish",
    kind: "curiosity",
    narrative: {
      title: "Quiet Smoke and Shiny Shields",
      requester: "rogue",
      summary: "Rogue and knight needs show that chemistry can hide, clean, and protect.",
      need: "Craft a Rogue Smoke Vial, Shine Polish, and Polished Shield Boss.",
      hint: "This quest reuses smoke, wax, vinegar, linen, and shield parts.",
      completion: "The Rogue bows, the Knight grins, and the board earns its first style flourish.",
    },
    progression: {
      act: 7,
      sequence: 22,
      branch: "utility",
      boardSlot: "curiosity",
      suggestedMinutes: [130, 138],
    },
    prerequisites: prerequisites([
      "quest:ranger-and-cleric-orders",
      "quest:acid-base-show",
      "quest:forge-field-gear",
      "quest:lime-and-ceramics",
      "quest:field-kit-basics",
    ]),
    recipeIds: ["alchemy:rogue-smoke-vial", "alchemy:shine-polish", "alchemy:polished-shield-boss"],
    teachingFocus: ["utility chemistry", "finish materials", "cross-class reuse"],
    unlocks: unlocks({
      requesters: ["rogue"],
      recipeIds: [
        "alchemy:rogue-smoke-vial",
        "alchemy:shine-polish",
        "alchemy:polished-shield-boss",
      ],
      knowledgeBadges: ["badge:utility-chemistry"],
    }),
    rewards: rewards(64, 64, 1, 5),
    discoveryDraft: draft(
      option("critical", "raw-material", "raw:quartz", "Quartz", "Starts crystal optics."),
      option("synergy", "element", "element:ag", "Silver", "Supports fine conductors."),
      option(
        "preference",
        "upgrade",
        "upgrade:batch-craft-1",
        "Batch Craft I",
        "Repeats known recipes.",
      ),
    ),
  }),
  quest({
    id: "quest:crystal-optics",
    kind: "critical",
    narrative: {
      title: "Quartz in the Lens Drawer",
      requester: "wizard",
      summary:
        "Quartz and crystal pieces make optics feel like a new region of the same chemistry map.",
      need: "Make Quartz Dust, a Crystal Lens, and a Focusing Crystal.",
      hint: "Glass is still useful, but crystal makes the lens more precise.",
      completion: "The observatory door shows the shape of the Grand Orrery behind the fog.",
    },
    progression: {
      act: 8,
      sequence: 23,
      branch: "crystals",
      boardSlot: "critical",
      suggestedMinutes: [138, 146],
    },
    prerequisites: prerequisites(["quest:first-flask"]),
    recipeIds: ["alchemy:quartz-dust", "alchemy:crystal-lens", "alchemy:focusing-crystal"],
    teachingFocus: ["crystal material", "precision optics", "material properties"],
    unlocks: unlocks({
      rawCardIds: ["raw:quartz", "raw:crystal-shard"],
      recipeIds: ["alchemy:quartz-dust", "alchemy:crystal-lens", "alchemy:focusing-crystal"],
      knowledgeBadges: ["badge:crystals"],
    }),
    rewards: rewards(62, 66, 0, 5),
    discoveryDraft: null,
  }),
  quest({
    id: "quest:precious-conductors",
    kind: "production",
    narrative: {
      title: "Silver, Gold, and Circuits",
      requester: "artificer",
      summary: "Precious metals and threads prepare the circuit-rune path.",
      need: "Make Silver, Gold, two-ingot Silver Wire, two-ingot Gold Leaf, Conductive Thread, and a Circuit Rune.",
      hint: "Precious metal shapes now take two ingots, so build up the shiny metals before shaping them.",
      completion: "Tinker Volt can finally read the circuit marks under the Muddlefog.",
    },
    progression: {
      act: 8,
      sequence: 24,
      branch: "conductors",
      boardSlot: "production",
      suggestedMinutes: [146, 156],
    },
    prerequisites: prerequisites([
      "quest:crystal-optics",
      "quest:salts-and-conductors",
      "quest:field-kit-basics",
    ]),
    recipeIds: [
      "alchemy:silver-ingot",
      "alchemy:gold-ingot",
      "alchemy:silver-wire",
      "alchemy:gold-leaf",
      "alchemy:conductive-thread",
      "alchemy:circuit-rune",
    ],
    teachingFocus: ["conductivity", "precious metals", "rune as circuit"],
    unlocks: unlocks({
      elementCardIds: ["element:ag", "element:au"],
      requesters: ["artificer"],
      recipeIds: [
        "alchemy:silver-ingot",
        "alchemy:gold-ingot",
        "alchemy:silver-wire",
        "alchemy:gold-leaf",
        "alchemy:conductive-thread",
        "alchemy:circuit-rune",
      ],
      knowledgeBadges: ["badge:conductors"],
    }),
    rewards: rewards(76, 76, 0, 5),
    discoveryDraft: null,
  }),
  quest({
    id: "quest:star-map",
    kind: "capstone",
    narrative: {
      title: "The Star Map Scroll",
      requester: "wizard",
      summary: "Crystal, conductor, ink, and scrollcraft reveal the observatory story arc.",
      need: "Craft a Wizard Focus, Radiant Ink, and the Star Map Scroll.",
      hint: "A capstone often asks for old quest items plus one new high-complexity material.",
      completion: "The Star Map points from atoms to stars and unlocks the garden wing.",
    },
    progression: {
      act: 8,
      sequence: 25,
      branch: "observatory",
      boardSlot: "critical",
      suggestedMinutes: [156, 166],
    },
    prerequisites: prerequisites([
      "quest:precious-conductors",
      "quest:crystal-optics",
      "quest:guild-kits-and-care",
      "quest:scribe-and-charm",
    ]),
    recipeIds: ["alchemy:wizard-focus", "alchemy:radiant-ink", "alchemy:star-map-scroll"],
    teachingFocus: ["capstone merge", "atoms to stars", "precision tool"],
    unlocks: unlocks({
      zones: ["zone:living-garden", "zone:observatory"],
      recipeIds: ["alchemy:wizard-focus", "alchemy:radiant-ink", "alchemy:star-map-scroll"],
      knowledgeBadges: ["badge:star-map"],
    }),
    rewards: rewards(90, 90, 1, 7),
    discoveryDraft: draft(
      option("critical", "element", "element:p", "Phosphorus", "Opens plant nutrition."),
      option("synergy", "raw-material", "raw:seaweed", "Seaweed", "Supports fertilizer."),
      option(
        "preference",
        "npc",
        "npc:druid-nori",
        "Gardener Nori",
        "Adds living chemistry quests.",
      ),
    ),
  }),
  quest({
    id: "quest:garden-minerals",
    kind: "critical",
    narrative: {
      title: "Nori's Soil Recipe",
      requester: "druid",
      summary:
        "The garden path uses minerals, potassium, phosphorus, and water to teach life chemistry.",
      need: "Craft Bone Ash, Phosphate Salt, Fertilizer Mix, Growth Elixir, and Seed Coating.",
      hint: "Plants need matter too. Look for potassium and phosphorus in the recipe chain.",
      completion: "The first garden bed grows through the fog with a bright green edge.",
    },
    progression: {
      act: 9,
      sequence: 26,
      branch: "garden",
      boardSlot: "critical",
      suggestedMinutes: [166, 176],
    },
    prerequisites: prerequisites([
      "quest:salts-and-conductors",
      "quest:fizzing-gases",
      "quest:water-flask-delivery",
      "quest:field-kit-basics",
      "quest:kitchen-salt-and-fuel",
    ]),
    recipeIds: [
      "alchemy:bone-ash",
      "alchemy:phosphate-salt",
      "alchemy:fertilizer-mix",
      "alchemy:growth-elixir",
      "alchemy:seed-coating",
    ],
    teachingFocus: ["plant minerals", "NPK model", "life chemistry"],
    unlocks: unlocks({
      elementCardIds: ["element:p"],
      rawCardIds: ["raw:bone", "raw:seaweed"],
      requesters: ["druid"],
      recipeIds: [
        "alchemy:bone-ash",
        "alchemy:phosphate-salt",
        "alchemy:fertilizer-mix",
        "alchemy:growth-elixir",
        "alchemy:seed-coating",
      ],
      knowledgeBadges: ["badge:garden-minerals"],
    }),
    rewards: rewards(82, 86, 0, 6),
    discoveryDraft: null,
  }),
  quest({
    id: "quest:fermentation-and-preservation",
    kind: "curiosity",
    narrative: {
      title: "Mushrooms and Travel Pickles",
      requester: "ranger",
      summary: "Fermentation and preservation make chemistry feel alive and practical.",
      need: "Make Mushroom Broth, Fermentation Starter, Vinegar Brew, Preservative Brine, and Trail Pickles.",
      hint: "This branch is about change over time, not just instant combination.",
      completion: "The Ranger packs snacks that came from a chain of careful transformations.",
    },
    progression: {
      act: 9,
      sequence: 27,
      branch: "fermentation",
      boardSlot: "curiosity",
      suggestedMinutes: [176, 186],
    },
    prerequisites: prerequisites([
      "quest:salts-and-conductors",
      "quest:acid-base-show",
      "quest:water-flask-delivery",
    ]),
    recipeIds: [
      "alchemy:mushroom-broth",
      "alchemy:fermentation-starter",
      "alchemy:vinegar-brew",
      "alchemy:preservative-brine",
      "alchemy:trail-pickles",
    ],
    teachingFocus: ["fermentation", "preservation", "time as process"],
    unlocks: unlocks({
      rawCardIds: ["raw:mushroom"],
      recipeIds: [
        "alchemy:mushroom-broth",
        "alchemy:fermentation-starter",
        "alchemy:vinegar-brew",
        "alchemy:preservative-brine",
        "alchemy:trail-pickles",
      ],
      knowledgeBadges: ["badge:fermentation"],
    }),
    rewards: rewards(74, 80, 0, 5),
    discoveryDraft: null,
  }),
  quest({
    id: "quest:garden-charm",
    kind: "capstone",
    narrative: {
      title: "The Garden Charm",
      requester: "druid",
      summary: "The garden capstone merges plant science with an older charm recipe.",
      need: "Craft Plant Tonic and combine it with Seed Coating and the Copper Charm.",
      hint: "The tree is branching, but capstones bring old branches back together.",
      completion: "The Garden Charm clears a round window in the Muddlefog.",
    },
    progression: {
      act: 9,
      sequence: 28,
      branch: "garden",
      boardSlot: "critical",
      suggestedMinutes: [186, 196],
    },
    prerequisites: prerequisites([
      "quest:garden-minerals",
      "quest:scribe-and-charm",
      "quest:fizzing-gases",
    ]),
    recipeIds: ["alchemy:plant-tonic", "alchemy:garden-charm"],
    teachingFocus: ["branch convergence", "life chemistry", "capstone reuse"],
    unlocks: unlocks({
      recipeIds: ["alchemy:plant-tonic", "alchemy:garden-charm"],
      knowledgeBadges: ["badge:garden-charm"],
    }),
    rewards: rewards(92, 94, 1, 7),
    discoveryDraft: draft(
      option(
        "critical",
        "zone",
        "zone:grand-orrery",
        "Grand Orrery Door",
        "Starts the final merge.",
      ),
      option(
        "synergy",
        "recipe",
        "alchemy:tempered-steel",
        "Tempered Steel",
        "Strengthens repair kits.",
      ),
      option(
        "preference",
        "upgrade",
        "upgrade:offline-120",
        "Offline Chest II",
        "Supports long contracts.",
      ),
    ),
  }),
  quest({
    id: "quest:advanced-materials",
    kind: "critical",
    narrative: {
      title: "Materials for the Final Door",
      requester: "artificer",
      summary: "Advanced materials ask the player to recognize old chains in new forms.",
      need: "Make Tempered Steel, Enamel Coating, Enamelled Buckle, Mirror Glass, and Periscope Mirror.",
      hint: "Advanced does not mean random. It means old ideas combined with care.",
      completion: "The Grand Orrery door reflects the player's own workshop back at them.",
    },
    progression: {
      act: 10,
      sequence: 29,
      branch: "advanced-materials",
      boardSlot: "critical",
      suggestedMinutes: [196, 208],
    },
    prerequisites: prerequisites([
      "quest:alloy-market",
      "quest:pigment-lab",
      "quest:fasteners-and-parts",
      "quest:precious-conductors",
      "quest:first-flask",
      "quest:glass-minerals",
    ]),
    recipeIds: [
      "alchemy:tempered-steel",
      "alchemy:enamel-coating",
      "alchemy:enamelled-buckle",
      "alchemy:mirror-glass",
      "alchemy:periscope-mirror",
    ],
    teachingFocus: ["advanced composites", "old chains in new contexts", "reflection"],
    unlocks: unlocks({
      recipeIds: [
        "alchemy:tempered-steel",
        "alchemy:enamel-coating",
        "alchemy:enamelled-buckle",
        "alchemy:mirror-glass",
        "alchemy:periscope-mirror",
      ],
      knowledgeBadges: ["badge:advanced-materials"],
    }),
    rewards: rewards(100, 104, 0, 6),
    discoveryDraft: null,
  }),
  quest({
    id: "quest:class-kits",
    kind: "mastery",
    narrative: {
      title: "Every Guild Helper Gets a Kit",
      requester: "alchemist-guild",
      summary:
        "Final class kits prove mastery across forge, flask, optics, mirror, stage, and circuit paths.",
      need: "Build the Knight Repair Kit, Purifying Flask, Observation Kit, Signal Mirror, Stage Sparkle, and Calibration Kit.",
      hint: "Use the recipe book. This is a review of almost every branch.",
      completion: "Every NPC places one finished kit around the Grand Orrery.",
    },
    progression: {
      act: 10,
      sequence: 30,
      branch: "class-kits",
      boardSlot: "mastery",
      suggestedMinutes: [208, 224],
    },
    prerequisites: prerequisites([
      "quest:advanced-materials",
      "quest:precious-conductors",
      "quest:crystal-optics",
      "quest:leather-and-parchment",
      "quest:stained-glass-lens",
      "quest:fasteners-and-parts",
      "quest:salts-and-conductors",
      "quest:water-flask-delivery",
    ]),
    recipeIds: [
      "alchemy:knight-repair-kit",
      "alchemy:purifying-flask",
      "alchemy:observation-kit",
      "alchemy:signal-mirror",
      "alchemy:stage-sparkle",
      "alchemy:calibration-kit",
    ],
    teachingFocus: ["mastery review", "class identity", "large branch merge"],
    unlocks: unlocks({
      recipeIds: [
        "alchemy:knight-repair-kit",
        "alchemy:purifying-flask",
        "alchemy:observation-kit",
        "alchemy:signal-mirror",
        "alchemy:stage-sparkle",
        "alchemy:calibration-kit",
      ],
      knowledgeBadges: ["badge:guild-kits"],
    }),
    rewards: rewards(124, 128, 1, 8),
    discoveryDraft: draft(
      option(
        "critical",
        "recipe",
        "alchemy:guild-adventure-crate",
        "Guild Adventure Crate",
        "Completes the first saga.",
      ),
      option(
        "synergy",
        "knowledge",
        "knowledge:element-families",
        "Element Family Review",
        "Connects recipes back to the table.",
      ),
      option(
        "preference",
        "upgrade",
        "upgrade:museum-orrery",
        "Museum Orrery",
        "Shows the full matter map.",
      ),
    ),
  }),
  quest({
    id: "quest:guild-adventure-crate",
    kind: "capstone",
    narrative: {
      title: "The Guild Adventure Crate",
      requester: "player",
      summary: "The first complete saga ends with a crate made from the major class kits.",
      need: "Pack the Knight, Cleric, Wizard, and Ranger tools into one Guild Adventure Crate.",
      hint: "This is not a new trick. It is proof that every earlier branch can work together.",
      completion:
        "The Muddlefog lifts from the Grand Orrery. The town remembers that matter is connected.",
    },
    progression: {
      act: 10,
      sequence: 31,
      branch: "grand-orrery",
      boardSlot: "critical",
      suggestedMinutes: [224, 240],
    },
    prerequisites: prerequisites(["quest:class-kits"]),
    recipeIds: ["alchemy:guild-adventure-crate"],
    teachingFocus: ["whole-tree synthesis", "matter map", "closure without ending"],
    unlocks: unlocks({
      zones: ["zone:grand-orrery"],
      recipeIds: ["alchemy:guild-adventure-crate"],
      knowledgeBadges: ["badge:first-saga-complete"],
    }),
    rewards: rewards(150, 160, 1, 10),
    discoveryDraft: draft(
      option(
        "critical",
        "knowledge",
        "knowledge:orrery-tour",
        "Grand Orrery Tour",
        "Reviews atoms to objects.",
      ),
      option(
        "synergy",
        "zone",
        "zone:free-craft",
        "Free Craft Table",
        "Lets the player experiment safely.",
      ),
      option(
        "preference",
        "upgrade",
        "upgrade:display-shelf",
        "Display Shelf",
        "Shows favorite creations.",
      ),
    ),
  }),
] as const satisfies readonly DeepReadonly<AlchemyQuest>[];

export type StaticAlchemyQuest = (typeof ALCHEMY_QUESTS)[number];
export type StaticAlchemyQuestId = StaticAlchemyQuest["id"];

export const AlchemyQuestsSchema = z.array(AlchemyQuestSchema).min(1);

export const ALCHEMY_QUEST_BY_ID = Object.freeze(
  Object.fromEntries(ALCHEMY_QUESTS.map((currentQuest) => [currentQuest.id, currentQuest])),
) as Readonly<Record<StaticAlchemyQuestId, StaticAlchemyQuest>>;

export function getAlchemyQuestById(id: string): StaticAlchemyQuest | undefined {
  return ALCHEMY_QUEST_BY_ID[id as StaticAlchemyQuestId];
}

export function getAlchemyQuestsByAct(act: number): StaticAlchemyQuest[] {
  return ALCHEMY_QUESTS.filter((currentQuest) => currentQuest.progression.act === act);
}

export function getAvailableAlchemyQuests(
  completedQuestIds: readonly string[] = [],
): StaticAlchemyQuest[] {
  const completedQuestIdSet = new Set<string>(completedQuestIds);

  return ALCHEMY_QUESTS.filter(
    (currentQuest) =>
      !completedQuestIdSet.has(currentQuest.id) &&
      areAlchemyQuestPrerequisitesMet(currentQuest, completedQuestIdSet),
  );
}

export function getAlchemyQuestBoard(
  completedQuestIds: readonly string[] = [],
  maximumQuestCount = 3,
): StaticAlchemyQuest[] {
  const availableQuests = getAvailableAlchemyQuests(completedQuestIds);
  const selectedQuests: StaticAlchemyQuest[] = [];
  const selectedQuestIds = new Set<string>();
  const requestedQuestCount = Math.max(0, Math.floor(maximumQuestCount));

  for (const boardSlot of ALCHEMY_QUEST_BOARD_SLOTS) {
    if (selectedQuests.length >= requestedQuestCount) break;
    const slotQuest = availableQuests.find(
      (questToCheck) => questToCheck.progression.boardSlot === boardSlot,
    );
    if (!slotQuest) continue;
    selectedQuests.push(slotQuest);
    selectedQuestIds.add(slotQuest.id);
  }

  for (const currentQuest of availableQuests) {
    if (selectedQuests.length >= requestedQuestCount) break;
    if (selectedQuestIds.has(currentQuest.id)) continue;
    selectedQuests.push(currentQuest);
  }

  return selectedQuests;
}

export function getAlchemyQuestMasteryScore(questToScore: {
  readonly kind: AlchemyQuestKind;
  readonly recipeIds: readonly string[];
  readonly rewards: DeepReadonly<AlchemyQuestRewards>;
}): number {
  const complexityTotal = questToScore.recipeIds.reduce((total, recipeId) => {
    const complexity = getAlchemyRecipeArgumentComplexity(recipeId);
    return total + (complexity?.normalizedComplexity ?? 0);
  }, 0);
  const averageComplexity =
    questToScore.recipeIds.length > 0 ? complexityTotal / questToScore.recipeIds.length : 0;
  const kindBonus =
    questToScore.kind === "capstone" ? 28 : questToScore.kind === "mastery" ? 18 : 0;

  return Math.round(
    questToScore.rewards.knowledgeXp +
      questToScore.rewards.gold / 5 +
      questToScore.rewards.discoveryTokens * 25 +
      averageComplexity * 100 +
      questToScore.recipeIds.length * 6 +
      kindBonus,
  );
}

export function getAlchemyQuestRequiredTableSlotCount(questToCheck: {
  readonly recipeIds: readonly string[];
}): number {
  return Math.max(
    ALCHEMY_STARTING_TABLE_SLOT_COUNT,
    ...questToCheck.recipeIds.map((recipeId) =>
      getAlchemyRecipeVisibleSlotCount(requireRecipe(recipeId)),
    ),
  );
}

export function getAvailableAlchemyTableSlotUpgrades(
  completedQuestIds: readonly string[] = [],
): AlchemyTableSlotUpgrade[] {
  const completedQuestIdSet = new Set<string>(completedQuestIds);

  return ALCHEMY_TABLE_SLOT_UPGRADES.filter((upgrade) =>
    completedQuestIdSet.has(upgrade.unlockQuestId),
  );
}

function areAlchemyQuestPrerequisitesMet(
  questToCheck: StaticAlchemyQuest,
  completedQuestIds: ReadonlySet<string>,
): boolean {
  const allRequiredQuestsComplete = questToCheck.prerequisites.allOf.every((questId) =>
    completedQuestIds.has(questId),
  );
  if (!allRequiredQuestsComplete) return false;

  return questToCheck.prerequisites.anyOf.every((gate) => {
    const completedGateQuestCount = gate.questIds.filter((questId) =>
      completedQuestIds.has(questId),
    ).length;
    return completedGateQuestCount >= gate.count;
  });
}

export function validateAlchemyQuestGraph(
  quests: readonly unknown[] = ALCHEMY_QUESTS,
): AlchemyQuest[] {
  const parsedQuests = AlchemyQuestsSchema.parse(quests);
  const questIds = new Set<string>();
  const sequences = new Set<number>();
  const recipesSeen = new Set<string>();
  const questById = new Map<string, AlchemyQuest>();
  const recipeToQuest = new Map<string, AlchemyQuest>();
  const recipeOutputsByQuestId = new Map<string, Set<string>>();
  const knownElementIds = new Set(ELEMENT_CARDS.map((elementCard) => elementCard.id));
  const knownRawIds = new Set(ALCHEMY_GATHERABLE_CARDS.map((gatherable) => gatherable.cardId));
  const knownRecipeIds = new Set<string>(ALCHEMY_RECIPES.map((currentRecipe) => currentRecipe.id));

  for (const currentQuest of parsedQuests) {
    if (questIds.has(currentQuest.id)) {
      throw new Error(`Duplicate alchemy quest id: ${currentQuest.id}`);
    }
    questIds.add(currentQuest.id);
    questById.set(currentQuest.id, currentQuest);

    if (sequences.has(currentQuest.progression.sequence)) {
      throw new Error(`Duplicate alchemy quest sequence: ${currentQuest.progression.sequence}`);
    }
    sequences.add(currentQuest.progression.sequence);

    for (const recipeId of currentQuest.recipeIds) {
      if (!knownRecipeIds.has(recipeId)) {
        throw new Error(`Unknown alchemy quest recipe id: ${recipeId}`);
      }
      if (recipesSeen.has(recipeId)) {
        const previousQuest = recipeToQuest.get(recipeId);
        throw new Error(
          `Alchemy recipe ${recipeId} appears in both ${previousQuest?.id ?? "unknown"} and ${currentQuest.id}`,
        );
      }
      recipesSeen.add(recipeId);
      recipeToQuest.set(recipeId, currentQuest);
    }
  }

  if (recipesSeen.size !== ALCHEMY_RECIPES.length) {
    throw new Error(
      `Alchemy quest graph covers ${recipesSeen.size} recipes, expected ${ALCHEMY_RECIPES.length}`,
    );
  }
  for (const currentRecipe of ALCHEMY_RECIPES) {
    if (!recipesSeen.has(currentRecipe.id)) {
      throw new Error(`Alchemy recipe is not covered by a quest: ${currentRecipe.id}`);
    }
  }

  for (const currentQuest of parsedQuests) {
    const outputs = new Set<string>();
    for (const recipeId of currentQuest.recipeIds) {
      const currentRecipe = requireRecipe(recipeId);
      outputs.add(currentRecipe.output.cardId);
    }
    recipeOutputsByQuestId.set(currentQuest.id, outputs);
  }

  for (const currentQuest of parsedQuests) {
    validatePrerequisites(currentQuest, questById);
    validateDiscoveryDraft(currentQuest, knownElementIds, knownRawIds, knownRecipeIds);
    validateUnlocks(currentQuest, knownElementIds, knownRawIds, knownRecipeIds);
    validateQuestTableSlotRequirement(currentQuest);
    validateRecipeDependencyOrder(currentQuest, questById, recipeOutputsByQuestId);
  }
  validateTableSlotUpgradeUnlocks(questById);

  return parsedQuests;
}

function validatePrerequisites(
  currentQuest: AlchemyQuest,
  questById: ReadonlyMap<string, AlchemyQuest>,
): void {
  const currentSequence = currentQuest.progression.sequence;
  for (const questId of currentQuest.prerequisites.allOf) {
    validatePrerequisiteReference(currentQuest.id, currentSequence, questId, questById);
  }

  for (const gate of currentQuest.prerequisites.anyOf) {
    if (gate.count > gate.questIds.length) {
      throw new Error(`Any-of gate for ${currentQuest.id} requires more quests than it lists`);
    }
    for (const questId of gate.questIds) {
      validatePrerequisiteReference(currentQuest.id, currentSequence, questId, questById);
    }
  }
}

function validatePrerequisiteReference(
  currentQuestId: string,
  currentSequence: number,
  prerequisiteQuestId: string,
  questById: ReadonlyMap<string, AlchemyQuest>,
): void {
  const prerequisiteQuest = questById.get(prerequisiteQuestId);
  if (!prerequisiteQuest) {
    throw new Error(`Unknown prerequisite ${prerequisiteQuestId} for ${currentQuestId}`);
  }
  if (prerequisiteQuest.progression.sequence >= currentSequence) {
    throw new Error(`Prerequisite ${prerequisiteQuestId} must come before ${currentQuestId}`);
  }
}

function validateDiscoveryDraft(
  questToValidate: AlchemyQuest,
  knownElementIds: ReadonlySet<string>,
  knownRawIds: ReadonlySet<string>,
  knownRecipeIds: ReadonlySet<string>,
): void {
  const draftOptions = questToValidate.discoveryDraft;
  if (questToValidate.rewards.discoveryTokens > 0 && !draftOptions) {
    throw new Error(`Quest ${questToValidate.id} grants a discovery token without a draft`);
  }
  if (!draftOptions) return;

  for (const role of ALCHEMY_DISCOVERY_OPTION_ROLES) {
    const count = draftOptions.filter((currentOption) => currentOption.role === role).length;
    if (count !== 1) {
      throw new Error(
        `Quest ${questToValidate.id} discovery draft must include one ${role} option`,
      );
    }
  }
  for (const currentOption of draftOptions) {
    validateDiscoveryOption(
      questToValidate.id,
      currentOption,
      knownElementIds,
      knownRawIds,
      knownRecipeIds,
    );
  }
}

function validateDiscoveryOption(
  questId: string,
  optionToValidate: AlchemyDiscoveryOption,
  knownElementIds: ReadonlySet<string>,
  knownRawIds: ReadonlySet<string>,
  knownRecipeIds: ReadonlySet<string>,
): void {
  if (optionToValidate.kind === "element" && !knownElementIds.has(optionToValidate.id)) {
    throw new Error(`Quest ${questId} discovery references unknown element ${optionToValidate.id}`);
  }
  if (optionToValidate.kind === "raw-material" && !knownRawIds.has(optionToValidate.id)) {
    throw new Error(
      `Quest ${questId} discovery references unknown raw card ${optionToValidate.id}`,
    );
  }
  if (optionToValidate.kind === "recipe" && !knownRecipeIds.has(optionToValidate.id)) {
    throw new Error(`Quest ${questId} discovery references unknown recipe ${optionToValidate.id}`);
  }
}

function validateUnlocks(
  questToValidate: AlchemyQuest,
  knownElementIds: ReadonlySet<string>,
  knownRawIds: ReadonlySet<string>,
  knownRecipeIds: ReadonlySet<string>,
): void {
  for (const elementCardId of questToValidate.unlocks.elementCardIds) {
    if (!knownElementIds.has(elementCardId)) {
      throw new Error(`Quest ${questToValidate.id} unlocks unknown element ${elementCardId}`);
    }
  }
  for (const rawCardId of questToValidate.unlocks.rawCardIds) {
    if (!knownRawIds.has(rawCardId)) {
      throw new Error(`Quest ${questToValidate.id} unlocks unknown raw card ${rawCardId}`);
    }
  }
  for (const recipeId of questToValidate.unlocks.recipeIds) {
    if (!knownRecipeIds.has(recipeId)) {
      throw new Error(`Quest ${questToValidate.id} unlocks unknown recipe ${recipeId}`);
    }
  }
}

function validateQuestTableSlotRequirement(questToValidate: AlchemyQuest): void {
  const requiredSlotCount = getAlchemyQuestRequiredTableSlotCount(questToValidate);
  if (requiredSlotCount > ALCHEMY_MAX_TABLE_SLOT_COUNT) {
    throw new Error(
      `Quest ${questToValidate.id} needs ${requiredSlotCount} Alchemy Workbench slots, but the max is ${ALCHEMY_MAX_TABLE_SLOT_COUNT}`,
    );
  }
}

function validateTableSlotUpgradeUnlocks(questById: ReadonlyMap<string, AlchemyQuest>): void {
  const upgradeIds = new Set<string>();
  for (const upgrade of ALCHEMY_TABLE_SLOT_UPGRADES) {
    if (upgradeIds.has(upgrade.id)) {
      throw new Error(`Duplicate Alchemy Workbench slot upgrade id: ${upgrade.id}`);
    }
    upgradeIds.add(upgrade.id);

    const unlockQuest = questById.get(upgrade.unlockQuestId);
    if (!unlockQuest) {
      throw new Error(
        `Unknown Alchemy Workbench slot upgrade unlock quest: ${upgrade.unlockQuestId}`,
      );
    }
    if (!unlockQuest.unlocks.upgrades.includes(upgrade.id)) {
      throw new Error(
        `Quest ${upgrade.unlockQuestId} must unlock Alchemy Workbench slot upgrade ${upgrade.id}`,
      );
    }
  }
}

function validateRecipeDependencyOrder(
  questToValidate: AlchemyQuest,
  questById: ReadonlyMap<string, AlchemyQuest>,
  recipeOutputsByQuestId: ReadonlyMap<string, ReadonlySet<string>>,
): void {
  const availableCardIds = new Set<string>(ALCHEMY_PRIMITIVE_CARD_IDS);
  for (const prerequisiteQuestId of getAllRequiredPrerequisiteIds(questToValidate, questById)) {
    const outputs = recipeOutputsByQuestId.get(prerequisiteQuestId);
    if (!outputs) continue;
    for (const outputCardId of outputs) {
      availableCardIds.add(outputCardId);
    }
  }

  for (const recipeId of questToValidate.recipeIds) {
    const currentRecipe = requireRecipe(recipeId);
    for (const argument of currentRecipe.arguments) {
      if (!availableCardIds.has(argument.cardId)) {
        throw new Error(
          `Quest ${questToValidate.id} uses ${recipeId} before argument ${argument.cardId} is available`,
        );
      }
    }
    availableCardIds.add(currentRecipe.output.cardId);
  }
}

function getAllRequiredPrerequisiteIds(
  questToCheck: AlchemyQuest,
  questById: ReadonlyMap<string, AlchemyQuest>,
): Set<string> {
  const collected = new Set<string>();
  const visit = (questId: string) => {
    if (collected.has(questId)) return;
    collected.add(questId);
    const questToVisit = questById.get(questId);
    if (!questToVisit) return;
    for (const prerequisiteId of questToVisit.prerequisites.allOf) {
      visit(prerequisiteId);
    }
  };

  for (const prerequisiteId of questToCheck.prerequisites.allOf) {
    visit(prerequisiteId);
  }

  return collected;
}

function requireRecipe(recipeId: string): StaticAlchemyRecipe {
  const recipeToReturn = getAlchemyRecipeById(recipeId);
  if (!recipeToReturn) {
    throw new Error(`Missing alchemy recipe ${recipeId}`);
  }
  return recipeToReturn;
}
