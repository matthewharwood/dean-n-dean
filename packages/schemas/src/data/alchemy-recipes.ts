import * as z from "zod";

import { ELEMENT_CARDS } from "./element-cards";

export const ALCHEMY_ITEM_KINDS = [
  "raw-material",
  "material",
  "component",
  "container",
  "consumable",
  "equipment",
  "quest-item",
] as const;
export type AlchemyItemKind = (typeof ALCHEMY_ITEM_KINDS)[number];
export const AlchemyItemKindSchema = z.enum(ALCHEMY_ITEM_KINDS);

export const ALCHEMY_ARGUMENT_ROLES = [
  "reactant",
  "material",
  "container",
  "catalyst",
  "fuel",
  "finish",
  "binder",
] as const;
export type AlchemyArgumentRole = (typeof ALCHEMY_ARGUMENT_ROLES)[number];
export const AlchemyArgumentRoleSchema = z.enum(ALCHEMY_ARGUMENT_ROLES);

export const ALCHEMY_STATIONS = [
  "hands",
  "mortar",
  "cauldron",
  "kiln",
  "forge",
  "glassworks",
  "distillery",
  "scribe-desk",
  "workbench",
  "loom",
  "tannery",
  "garden-bench",
  "enchanter",
] as const;
export type AlchemyStation = (typeof ALCHEMY_STATIONS)[number];
export const AlchemyStationSchema = z.enum(ALCHEMY_STATIONS);

export const ALCHEMY_ACTIONS = [
  "combine",
  "grind",
  "heat",
  "shape",
  "distill",
  "weave",
  "write",
  "assemble",
  "cure",
  "ferment",
  "enchant",
] as const;
export type AlchemyAction = (typeof ALCHEMY_ACTIONS)[number];
export const AlchemyActionSchema = z.enum(ALCHEMY_ACTIONS);

export const QUEST_REQUESTERS = [
  "player",
  "alchemist-guild",
  "knight",
  "wizard",
  "ranger",
  "cleric",
  "rogue",
  "bard",
  "druid",
  "artificer",
  "blacksmith",
] as const;
export type QuestRequester = (typeof QUEST_REQUESTERS)[number];
export const QuestRequesterSchema = z.enum(QUEST_REQUESTERS);

export const ALCHEMY_SAFETY_TIERS = [
  "game-only",
  "kitchen-safe",
  "adult-supervision",
  "hazardous-reference",
] as const;
export type AlchemySafetyTier = (typeof ALCHEMY_SAFETY_TIERS)[number];
export const AlchemySafetyTierSchema = z.enum(ALCHEMY_SAFETY_TIERS);

export const AlchemyCardIdSchema = z.string().regex(/^[a-z]+:[a-z0-9-]+$/);
export type AlchemyCardId = z.infer<typeof AlchemyCardIdSchema>;
export const AlchemyRecipeIdSchema = z.string().regex(/^alchemy:[a-z0-9-]+$/);

export const AlchemyCardImagePathSchema = z
  .string()
  .regex(/^alchemy-card-art\/[a-z]+-[a-z0-9-]+\.webp$/);
export type AlchemyCardImagePath = z.infer<typeof AlchemyCardImagePathSchema>;

export const ALCHEMY_STARTING_TABLE_SLOT_COUNT = 3 as const;
export const ALCHEMY_MAX_TABLE_SLOT_COUNT = 5 as const;

export const AlchemyGatherableCardSchema = z.object({
  cardId: AlchemyCardIdSchema,
  name: z.string().min(1),
  kind: z.literal("raw-material"),
  unlockCohort: z.int().min(1),
  tags: z.array(z.string().min(1)),
});
export type AlchemyGatherableCard = z.infer<typeof AlchemyGatherableCardSchema>;

export const ALCHEMY_GATHERABLE_CARDS = [
  { cardId: "raw:sand", name: "Sand", kind: "raw-material", unlockCohort: 1, tags: ["silicate"] },
  { cardId: "raw:clay", name: "Clay", kind: "raw-material", unlockCohort: 1, tags: ["ceramic"] },
  {
    cardId: "raw:wood",
    name: "Wood",
    kind: "raw-material",
    unlockCohort: 1,
    tags: ["carbon-source"],
  },
  {
    cardId: "raw:cork-bark",
    name: "Cork Bark",
    kind: "raw-material",
    unlockCohort: 1,
    tags: ["plant"],
  },
  { cardId: "raw:herbs", name: "Herbs", kind: "raw-material", unlockCohort: 1, tags: ["plant"] },
  {
    cardId: "raw:linen-fiber",
    name: "Linen Fiber",
    kind: "raw-material",
    unlockCohort: 1,
    tags: ["fiber"],
  },
  {
    cardId: "raw:honey",
    name: "Honey",
    kind: "raw-material",
    unlockCohort: 1,
    tags: ["sweetener"],
  },
  { cardId: "raw:beeswax", name: "Beeswax", kind: "raw-material", unlockCohort: 2, tags: ["wax"] },
  {
    cardId: "raw:limestone",
    name: "Limestone",
    kind: "raw-material",
    unlockCohort: 2,
    tags: ["mineral"],
  },
  {
    cardId: "raw:resin",
    name: "Tree Resin",
    kind: "raw-material",
    unlockCohort: 4,
    tags: ["binder"],
  },
  {
    cardId: "raw:berries",
    name: "Dark Berries",
    kind: "raw-material",
    unlockCohort: 4,
    tags: ["pigment"],
  },
  {
    cardId: "raw:feather",
    name: "Feather",
    kind: "raw-material",
    unlockCohort: 5,
    tags: ["quill"],
  },
  { cardId: "raw:vinegar", name: "Vinegar", kind: "raw-material", unlockCohort: 6, tags: ["acid"] },
  {
    cardId: "raw:plant-oil",
    name: "Plant Oil",
    kind: "raw-material",
    unlockCohort: 7,
    tags: ["oil"],
  },
  { cardId: "raw:hide", name: "Hide", kind: "raw-material", unlockCohort: 7, tags: ["leather"] },
  {
    cardId: "raw:quartz",
    name: "Quartz",
    kind: "raw-material",
    unlockCohort: 8,
    tags: ["crystal"],
  },
  {
    cardId: "raw:crystal-shard",
    name: "Crystal Shard",
    kind: "raw-material",
    unlockCohort: 8,
    tags: ["crystal"],
  },
  { cardId: "raw:bone", name: "Bone", kind: "raw-material", unlockCohort: 9, tags: ["mineral"] },
  {
    cardId: "raw:seaweed",
    name: "Seaweed",
    kind: "raw-material",
    unlockCohort: 9,
    tags: ["plant"],
  },
  {
    cardId: "raw:mushroom",
    name: "Mushroom",
    kind: "raw-material",
    unlockCohort: 9,
    tags: ["fungus"],
  },
] as const satisfies readonly AlchemyGatherableCard[];
export const ALCHEMY_GATHERABLE_ITEMS = ALCHEMY_GATHERABLE_CARDS;

export const AlchemyProgressionCohortSchema = z.object({
  cohort: z.int().min(1),
  name: z.string().min(1),
  startMinute: z.int().min(0),
  endMinute: z.int().min(1),
  complexityRange: z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]),
  focus: z.array(z.string().min(1)),
});
export type AlchemyProgressionCohort = z.infer<typeof AlchemyProgressionCohortSchema>;

export const ALCHEMY_PROGRESSION_COHORTS = [
  {
    cohort: 1,
    name: "First Sparks",
    startMinute: 0,
    endMinute: 15,
    complexityRange: [0, 0.14],
    focus: ["single-step crafting", "elements become materials", "starter quest items"],
  },
  {
    cohort: 2,
    name: "Bottles and Basics",
    startMinute: 15,
    endMinute: 30,
    complexityRange: [0.13, 0.24],
    focus: ["glass chain", "containers", "water flask quest"],
  },
  {
    cohort: 3,
    name: "Useful Reagents",
    startMinute: 30,
    endMinute: 45,
    complexityRange: [0.2, 0.34],
    focus: ["states of matter", "salts", "simple workshop components"],
  },
  {
    cohort: 4,
    name: "Adventurer Orders",
    startMinute: 45,
    endMinute: 60,
    complexityRange: [0.3, 0.44],
    focus: ["class requests", "ink and scrolls", "first composed quest items"],
  },
  {
    cohort: 5,
    name: "Forge Contracts",
    startMinute: 60,
    endMinute: 75,
    complexityRange: [0.4, 0.54],
    focus: ["metals", "alloys", "gear parts"],
  },
  {
    cohort: 6,
    name: "Color and Fizz",
    startMinute: 75,
    endMinute: 90,
    complexityRange: [0.5, 0.64],
    focus: ["acid-base idea", "pigments", "stained glass"],
  },
  {
    cohort: 7,
    name: "Kits and Scrollcraft",
    startMinute: 90,
    endMinute: 105,
    complexityRange: [0.58, 0.72],
    focus: ["textiles", "leather", "multi-item kits"],
  },
  {
    cohort: 8,
    name: "Crystals and Conductors",
    startMinute: 105,
    endMinute: 120,
    complexityRange: [0.66, 0.8],
    focus: ["optics", "conductivity", "precision tools"],
  },
  {
    cohort: 9,
    name: "Living Garden",
    startMinute: 120,
    endMinute: 135,
    complexityRange: [0.74, 0.88],
    focus: ["minerals for plants", "fermentation model", "preservation"],
  },
  {
    cohort: 10,
    name: "Guild Supply Crate",
    startMinute: 135,
    endMinute: 150,
    complexityRange: [0.82, 0.98],
    focus: ["advanced composites", "cross-class chains", "large quest bundles"],
  },
] as const satisfies readonly AlchemyProgressionCohort[];

export const AlchemyRecipeOutputSchema = z.object({
  cardId: AlchemyCardIdSchema,
  imagePath: AlchemyCardImagePathSchema,
  name: z.string().min(1),
  kind: AlchemyItemKindSchema.exclude(["raw-material"]),
  quantity: z.int().positive(),
});
export type AlchemyRecipeOutput = z.infer<typeof AlchemyRecipeOutputSchema>;

export const AlchemyArgumentSchema = z.object({
  cardId: AlchemyCardIdSchema,
  quantity: z.int().positive(),
  role: AlchemyArgumentRoleSchema,
});
export type AlchemyArgument = z.infer<typeof AlchemyArgumentSchema>;
export const AlchemyIngredientSchema = AlchemyArgumentSchema;
export type AlchemyIngredient = AlchemyArgument;

export const AlchemyArgumentSlotSchema = z.object({
  slotId: z.string().regex(/^arg:[0-9]+$/),
  cardId: AlchemyCardIdSchema,
  sourceArgumentIndex: z.int().min(0),
  role: AlchemyArgumentRoleSchema,
});
export type AlchemyArgumentSlot = z.infer<typeof AlchemyArgumentSlotSchema>;

export const AlchemyRecipeProgressionSchema = z.object({
  cohort: z.int().min(1),
  unlockMinute: z.int().min(0),
  graphDepth: z.int().min(1),
  normalizedComplexity: z.number().min(0).max(1),
});
export type AlchemyRecipeProgression = z.infer<typeof AlchemyRecipeProgressionSchema>;

export const AlchemyArgumentComplexitySchema = z.object({
  directArgumentCount: z.int().min(1),
  uniqueArgumentCount: z.int().min(1),
  primitiveArgumentCount: z.number().min(1),
  cumulativeArgumentCount: z.number().min(1),
  graphDepth: z.int().min(0),
  rawComplexity: z.number().min(0),
  normalizedComplexity: z.number().min(0).max(1),
});
export type AlchemyArgumentComplexity = z.infer<typeof AlchemyArgumentComplexitySchema>;

export const AlchemyCraftedCardSchema = z.object({
  cardId: AlchemyCardIdSchema,
  type: z.literal("crafted"),
  name: z.string().min(1),
  kind: AlchemyItemKindSchema.exclude(["raw-material"]),
  sourceRecipeId: AlchemyRecipeIdSchema,
  unlockCohort: z.int().min(1),
  imagePath: AlchemyCardImagePathSchema,
  complexity: AlchemyArgumentComplexitySchema,
  tags: z.array(z.string().min(1)),
});
export type AlchemyCraftedCard = z.infer<typeof AlchemyCraftedCardSchema>;

export const AlchemyRecipeEducationSchema = z.object({
  concepts: z.array(z.string().min(1)),
  note: z.string().min(1),
  safetyTier: AlchemySafetyTierSchema,
});
export type AlchemyRecipeEducation = z.infer<typeof AlchemyRecipeEducationSchema>;

export const AlchemyRecipeFantasySchema = z.object({
  requesters: z.array(QuestRequesterSchema).min(1),
  questTags: z.array(z.string().min(1)),
});
export type AlchemyRecipeFantasy = z.infer<typeof AlchemyRecipeFantasySchema>;

export const AlchemyRecipeSchema = z.object({
  id: AlchemyRecipeIdSchema,
  name: z.string().min(1),
  output: AlchemyRecipeOutputSchema,
  arguments: z.array(AlchemyArgumentSchema).min(1),
  station: AlchemyStationSchema,
  action: AlchemyActionSchema,
  progression: AlchemyRecipeProgressionSchema,
  education: AlchemyRecipeEducationSchema,
  fantasy: AlchemyRecipeFantasySchema,
});
export type AlchemyRecipe = z.infer<typeof AlchemyRecipeSchema>;

type DeepReadonly<T> = T extends readonly (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

const item = <
  const Kind extends Exclude<AlchemyItemKind, "raw-material">,
  const CardId extends string,
>(
  kind: Kind,
  cardId: CardId,
  name: string,
  quantity = 1,
) => ({ cardId, imagePath: getAlchemyCardImagePath(cardId), name, kind, quantity }) as const;

export function getAlchemyCardImagePath(cardId: string): AlchemyCardImagePath {
  return AlchemyCardImagePathSchema.parse(`alchemy-card-art/${cardId.replace(":", "-")}.webp`);
}

const arg = <const CardId extends string>(
  cardId: CardId,
  quantity: number,
  role: AlchemyArgumentRole = "material",
) => ({ cardId, quantity, role }) as const;

const progress = (
  cohort: number,
  minuteOffset: number,
  graphDepth: number,
  normalizedComplexity: number,
) =>
  ({
    cohort,
    unlockMinute: (cohort - 1) * 15 + minuteOffset,
    graphDepth,
    normalizedComplexity,
  }) as const;

const lesson = <const Concepts extends readonly string[]>(
  concepts: Concepts,
  note: string,
  safetyTier: AlchemySafetyTier = "game-only",
) => ({ concepts, note, safetyTier }) as const;

const request = <
  const Requesters extends readonly QuestRequester[],
  const Tags extends readonly string[],
>(
  requesters: Requesters,
  questTags: Tags,
) => ({ requesters, questTags }) as const;

const recipe = <const T extends DeepReadonly<AlchemyRecipe>>(value: T) => value;

export const EXPECTED_MINIMUM_ALCHEMY_RECIPES = 100 as const;

export const ALCHEMY_RECIPES = [
  recipe({
    id: "alchemy:water",
    name: "Water",
    output: item("material", "material:water", "Water"),
    arguments: [arg("element:h", 2, "reactant"), arg("element:o", 1, "reactant")],
    station: "cauldron",
    action: "combine",
    progression: progress(1, 0, 1, 0.03),
    education: lesson(
      ["molecular ratio", "compound"],
      "Models H2O as two hydrogen cards plus one oxygen card.",
    ),
    fantasy: request(["player", "knight"], ["starter", "water-flask-chain"]),
  }),
  recipe({
    id: "alchemy:salt",
    name: "Salt",
    output: item("material", "material:salt", "Salt"),
    arguments: [arg("element:na", 1, "reactant"), arg("element:cl", 1, "reactant")],
    station: "cauldron",
    action: "combine",
    progression: progress(1, 1, 1, 0.04),
    education: lesson(
      ["ionic compound", "table salt"],
      "Connects sodium and chlorine to sodium chloride.",
    ),
    fantasy: request(["player", "cleric"], ["starter", "cleansing"]),
  }),
  recipe({
    id: "alchemy:charcoal",
    name: "Charcoal",
    output: item("material", "material:charcoal", "Charcoal"),
    arguments: [arg("raw:wood", 1, "material")],
    station: "kiln",
    action: "heat",
    progression: progress(1, 2, 1, 0.05),
    education: lesson(
      ["carbon source", "heating"],
      "Wood heated with little air leaves carbon-rich charcoal.",
      "adult-supervision",
    ),
    fantasy: request(["blacksmith", "alchemist-guild"], ["starter", "fuel"]),
  }),
  recipe({
    id: "alchemy:ash",
    name: "Ash",
    output: item("material", "material:ash", "Ash"),
    arguments: [arg("raw:wood", 1, "material")],
    station: "kiln",
    action: "heat",
    progression: progress(1, 3, 1, 0.05),
    education: lesson(
      ["combustion product", "minerals"],
      "Ash represents mineral leftovers after plant material burns.",
      "adult-supervision",
    ),
    fantasy: request(["wizard", "druid"], ["starter", "powder"]),
  }),
  recipe({
    id: "alchemy:iron-ingot",
    name: "Iron Ingot",
    output: item("material", "material:iron-ingot", "Iron Ingot"),
    arguments: [arg("element:fe", 1, "reactant")],
    station: "forge",
    action: "heat",
    progression: progress(1, 4, 1, 0.07),
    education: lesson(
      ["metal", "element symbol"],
      "Introduces Fe as the symbol for iron.",
      "adult-supervision",
    ),
    fantasy: request(["knight", "blacksmith"], ["starter", "metal"]),
  }),
  recipe({
    id: "alchemy:copper-ingot",
    name: "Copper Ingot",
    output: item("material", "material:copper-ingot", "Copper Ingot"),
    arguments: [arg("element:cu", 1, "reactant")],
    station: "forge",
    action: "heat",
    progression: progress(1, 5, 1, 0.07),
    education: lesson(
      ["metal", "conductivity"],
      "Introduces Cu as the symbol for copper.",
      "adult-supervision",
    ),
    fantasy: request(["artificer", "wizard"], ["starter", "metal"]),
  }),
  recipe({
    id: "alchemy:herbal-mash",
    name: "Herbal Mash",
    output: item("material", "material:herbal-mash", "Herbal Mash"),
    arguments: [arg("raw:herbs", 1), arg("material:water", 1)],
    station: "mortar",
    action: "grind",
    progression: progress(1, 6, 2, 0.09),
    education: lesson(
      ["mixture", "solvent"],
      "Water helps turn ground herbs into a usable mixture.",
    ),
    fantasy: request(["cleric", "druid"], ["starter", "healing"]),
  }),
  recipe({
    id: "alchemy:clay-slip",
    name: "Clay Slip",
    output: item("material", "material:clay-slip", "Clay Slip"),
    arguments: [arg("raw:clay", 1), arg("material:water", 1)],
    station: "cauldron",
    action: "combine",
    progression: progress(1, 7, 2, 0.09),
    education: lesson(
      ["mixture", "suspension"],
      "Clay and water make a thick suspension used for shaping containers.",
    ),
    fantasy: request(["alchemist-guild", "artificer"], ["starter", "container-chain"]),
  }),
  recipe({
    id: "alchemy:sand-powder",
    name: "Sand Powder",
    output: item("material", "material:sand-powder", "Sand Powder"),
    arguments: [arg("raw:sand", 1)],
    station: "mortar",
    action: "grind",
    progression: progress(1, 8, 1, 0.08),
    education: lesson(
      ["particle size", "raw material"],
      "Grinding changes particle size without changing the substance.",
    ),
    fantasy: request(["artificer", "wizard"], ["starter", "glass-chain"]),
  }),
  recipe({
    id: "alchemy:cork-stopper",
    name: "Cork Stopper",
    output: item("component", "component:cork-stopper", "Cork Stopper"),
    arguments: [arg("raw:cork-bark", 1)],
    station: "hands",
    action: "shape",
    progression: progress(1, 9, 1, 0.08),
    education: lesson(
      ["plant material", "container closure"],
      "Cork is light and springy, which makes it useful for sealing bottles.",
    ),
    fantasy: request(["ranger", "alchemist-guild"], ["starter", "water-flask-chain"]),
  }),
  recipe({
    id: "alchemy:linen-thread",
    name: "Linen Thread",
    output: item("component", "component:linen-thread", "Linen Thread"),
    arguments: [arg("raw:linen-fiber", 1)],
    station: "loom",
    action: "weave",
    progression: progress(1, 10, 1, 0.1),
    education: lesson(
      ["fiber", "twisting"],
      "Plant fibers become stronger when twisted into thread.",
    ),
    fantasy: request(["ranger", "bard"], ["starter", "fiber"]),
  }),
  recipe({
    id: "alchemy:healing-tea",
    name: "Healing Tea",
    output: item("consumable", "consumable:healing-tea", "Healing Tea"),
    arguments: [arg("material:herbal-mash", 1), arg("material:water", 1), arg("raw:honey", 1)],
    station: "cauldron",
    action: "combine",
    progression: progress(1, 11, 3, 0.13),
    education: lesson(
      ["mixture", "solubility"],
      "A beginner potion made from a water-based herbal mixture.",
    ),
    fantasy: request(["cleric", "player"], ["starter", "healing"]),
  }),
  recipe({
    id: "alchemy:wax-seal",
    name: "Wax Seal",
    output: item("component", "component:wax-seal", "Wax Seal"),
    arguments: [arg("raw:beeswax", 1)],
    station: "hands",
    action: "shape",
    progression: progress(2, 0, 1, 0.14),
    education: lesson(
      ["phase change", "seal"],
      "Wax softens with warmth and hardens again as it cools.",
    ),
    fantasy: request(["wizard", "alchemist-guild"], ["seal", "container-chain"]),
  }),
  recipe({
    id: "alchemy:sugar-syrup",
    name: "Sugar Syrup",
    output: item("material", "material:sugar-syrup", "Sugar Syrup"),
    arguments: [arg("raw:honey", 1), arg("material:water", 1)],
    station: "cauldron",
    action: "combine",
    progression: progress(2, 1, 2, 0.15),
    education: lesson(
      ["solution", "dissolving"],
      "Sweet material disperses through water to make a syrup.",
    ),
    fantasy: request(["bard", "cleric"], ["potion-base"]),
  }),
  recipe({
    id: "alchemy:silica",
    name: "Silica",
    output: item("material", "material:silica", "Silica"),
    arguments: [arg("element:si", 1, "reactant"), arg("element:o", 2, "reactant")],
    station: "cauldron",
    action: "combine",
    progression: progress(2, 2, 1, 0.16),
    education: lesson(
      ["oxide", "glass chemistry"],
      "Silica models silicon dioxide, the main network former in common glass.",
    ),
    fantasy: request(["artificer", "wizard"], ["glass-chain"]),
  }),
  recipe({
    id: "alchemy:soda-ash",
    name: "Soda Ash",
    output: item("material", "material:soda-ash", "Soda Ash"),
    arguments: [
      arg("element:na", 1, "reactant"),
      arg("element:c", 1, "reactant"),
      arg("element:o", 3, "reactant"),
    ],
    station: "cauldron",
    action: "combine",
    progression: progress(2, 3, 1, 0.17),
    education: lesson(
      ["carbonate", "formula compression"],
      "Uses a five-slot game model for sodium carbonate; the card note names the real Na2CO3 formula.",
    ),
    fantasy: request(["artificer", "alchemist-guild"], ["glass-chain"]),
  }),
  recipe({
    id: "alchemy:calcium-carbonate",
    name: "Calcium Carbonate",
    output: item("material", "material:calcium-carbonate", "Calcium Carbonate"),
    arguments: [
      arg("element:ca", 1, "reactant"),
      arg("element:c", 1, "reactant"),
      arg("element:o", 3, "reactant"),
    ],
    station: "mortar",
    action: "grind",
    progression: progress(2, 4, 1, 0.17),
    education: lesson(
      ["carbonate", "minerals"],
      "Calcium carbonate appears in limestone, chalk, and shells.",
    ),
    fantasy: request(["cleric", "artificer"], ["glass-chain", "mineral"]),
  }),
  recipe({
    id: "alchemy:glass-batch",
    name: "Glass Batch",
    output: item("material", "material:glass-batch", "Glass Batch"),
    arguments: [
      arg("material:silica", 1),
      arg("material:soda-ash", 1),
      arg("material:calcium-carbonate", 1),
    ],
    station: "mortar",
    action: "combine",
    progression: progress(2, 5, 2, 0.19),
    education: lesson(
      ["composite mixture", "materials science"],
      "Soda-lime glass starts from silica plus flux and stabilizer ingredients.",
    ),
    fantasy: request(["artificer", "alchemist-guild"], ["glass-chain"]),
  }),
  recipe({
    id: "alchemy:glass",
    name: "Glass",
    output: item("material", "material:glass", "Glass"),
    arguments: [arg("material:glass-batch", 1), arg("material:charcoal", 1, "fuel")],
    station: "glassworks",
    action: "heat",
    progression: progress(2, 6, 3, 0.21),
    education: lesson(
      ["melting", "amorphous solid"],
      "Heating a glass batch makes a material that cools without forming large crystals.",
      "adult-supervision",
    ),
    fantasy: request(["wizard", "artificer"], ["glass-chain"]),
  }),
  recipe({
    id: "alchemy:glass-tube",
    name: "Glass Tube",
    output: item("component", "component:glass-tube", "Glass Tube"),
    arguments: [arg("material:glass", 1)],
    station: "glassworks",
    action: "shape",
    progression: progress(2, 7, 4, 0.22),
    education: lesson(
      ["shaping", "container geometry"],
      "The same material can be shaped into different useful forms.",
      "adult-supervision",
    ),
    fantasy: request(["wizard", "artificer"], ["glass-chain", "tool-part"]),
  }),
  recipe({
    id: "alchemy:glass-flask",
    name: "Glass Flask",
    output: item("container", "container:glass-flask", "Glass Flask"),
    arguments: [arg("material:glass", 1)],
    station: "glassworks",
    action: "shape",
    progression: progress(2, 8, 4, 0.22),
    education: lesson(
      ["container", "material properties"],
      "Glass is useful for flasks because it is hard and does not soak up water.",
      "adult-supervision",
    ),
    fantasy: request(["knight", "wizard", "alchemist-guild"], ["glass-chain", "water-flask-chain"]),
  }),
  recipe({
    id: "alchemy:sealed-flask",
    name: "Sealed Flask",
    output: item("container", "container:sealed-flask", "Sealed Flask"),
    arguments: [
      arg("container:glass-flask", 1, "container"),
      arg("component:cork-stopper", 1, "finish"),
    ],
    station: "hands",
    action: "assemble",
    progression: progress(2, 9, 5, 0.23),
    education: lesson(
      ["assembly", "seal"],
      "A container plus a stopper becomes a sealed container.",
    ),
    fantasy: request(["ranger", "knight"], ["water-flask-chain"]),
  }),
  recipe({
    id: "alchemy:water-flask",
    name: "Water Flask",
    output: item("quest-item", "quest:water-flask", "Water Flask"),
    arguments: [arg("container:sealed-flask", 1, "container"), arg("material:water", 1)],
    station: "hands",
    action: "assemble",
    progression: progress(2, 10, 6, 0.24),
    education: lesson(
      ["composition chain", "useful product"],
      "This is the first larger item built from multiple earlier recipes.",
    ),
    fantasy: request(["knight", "ranger", "player"], ["water-flask-chain", "first-big-quest"]),
  }),
  recipe({
    id: "alchemy:clay-vial",
    name: "Clay Vial",
    output: item("container", "container:clay-vial", "Clay Vial"),
    arguments: [arg("material:clay-slip", 1), arg("material:ash", 1)],
    station: "kiln",
    action: "heat",
    progression: progress(2, 11, 3, 0.22),
    education: lesson(
      ["ceramic", "heating"],
      "Clay can harden into a simple ceramic container.",
      "adult-supervision",
    ),
    fantasy: request(["cleric", "wizard"], ["container-chain"]),
  }),
  recipe({
    id: "alchemy:quicklime",
    name: "Quicklime",
    output: item("material", "material:quicklime", "Quicklime"),
    arguments: [arg("element:ca", 1, "reactant"), arg("element:o", 1, "reactant")],
    station: "kiln",
    action: "heat",
    progression: progress(3, 0, 1, 0.21),
    education: lesson(
      ["oxide", "base"],
      "Models calcium oxide as calcium plus oxygen.",
      "adult-supervision",
    ),
    fantasy: request(["cleric", "artificer"], ["mineral", "base"]),
  }),
  recipe({
    id: "alchemy:slaked-lime",
    name: "Slaked Lime",
    output: item("material", "material:slaked-lime", "Slaked Lime"),
    arguments: [arg("material:quicklime", 1), arg("material:water", 1)],
    station: "cauldron",
    action: "combine",
    progression: progress(3, 1, 2, 0.23),
    education: lesson(
      ["hydration", "base"],
      "Water changes quicklime into calcium hydroxide in the game model.",
      "adult-supervision",
    ),
    fantasy: request(["cleric", "artificer"], ["mineral", "base"]),
  }),
  recipe({
    id: "alchemy:carbon-dioxide",
    name: "Carbon Dioxide",
    output: item("material", "material:carbon-dioxide", "Carbon Dioxide"),
    arguments: [arg("element:c", 1, "reactant"), arg("element:o", 2, "reactant")],
    station: "cauldron",
    action: "combine",
    progression: progress(3, 2, 1, 0.22),
    education: lesson(
      ["gas", "molecular ratio"],
      "Models carbon dioxide as one carbon and two oxygen cards.",
    ),
    fantasy: request(["wizard", "druid"], ["gas", "fizz-chain"]),
  }),
  recipe({
    id: "alchemy:carbonic-water",
    name: "Carbonic Water",
    output: item("material", "material:carbonic-water", "Carbonic Water"),
    arguments: [arg("material:carbon-dioxide", 1), arg("material:water", 1)],
    station: "cauldron",
    action: "combine",
    progression: progress(3, 3, 2, 0.25),
    education: lesson(
      ["gas dissolved in liquid", "weak acid"],
      "Carbon dioxide dissolved in water makes a simple carbonated-water model.",
    ),
    fantasy: request(["bard", "wizard"], ["fizz-chain"]),
  }),
  recipe({
    id: "alchemy:distilled-water",
    name: "Distilled Water",
    output: item("material", "material:distilled-water", "Distilled Water"),
    arguments: [arg("material:water", 2)],
    station: "distillery",
    action: "distill",
    progression: progress(3, 4, 2, 0.24),
    education: lesson(
      ["phase change", "purification"],
      "Distillation combines two Water cards into a cleaner water card by modeling evaporation and condensation.",
      "adult-supervision",
    ),
    fantasy: request(["cleric", "wizard"], ["potion-base"]),
  }),
  recipe({
    id: "alchemy:brine",
    name: "Brine",
    output: item("material", "material:brine", "Brine"),
    arguments: [arg("material:salt", 1), arg("material:water", 1)],
    station: "cauldron",
    action: "combine",
    progression: progress(3, 5, 2, 0.24),
    education: lesson(["solution", "dissolving"], "Salt dissolved in water makes brine."),
    fantasy: request(["ranger", "cleric"], ["salt-chain", "preservation"]),
  }),
  recipe({
    id: "alchemy:sea-salt-crystals",
    name: "Sea Salt Crystals",
    output: item("material", "material:sea-salt-crystals", "Sea Salt Crystals"),
    arguments: [arg("material:brine", 1)],
    station: "kiln",
    action: "heat",
    progression: progress(3, 6, 3, 0.27),
    education: lesson(
      ["evaporation", "crystallization"],
      "Evaporating water leaves salt crystals behind.",
      "adult-supervision",
    ),
    fantasy: request(["cleric", "ranger"], ["salt-chain", "cleansing"]),
  }),
  recipe({
    id: "alchemy:potassium-salt",
    name: "Potassium Salt",
    output: item("material", "material:potassium-salt", "Potassium Salt"),
    arguments: [arg("element:k", 1, "reactant"), arg("element:cl", 1, "reactant")],
    station: "cauldron",
    action: "combine",
    progression: progress(3, 7, 1, 0.26),
    education: lesson(
      ["ionic compound", "plant nutrient"],
      "Models potassium chloride as a useful plant-nutrient salt.",
    ),
    fantasy: request(["druid", "alchemist-guild"], ["salt-chain", "garden"]),
  }),
  recipe({
    id: "alchemy:ceramic-clay",
    name: "Ceramic Clay",
    output: item("material", "material:ceramic-clay", "Ceramic Clay"),
    arguments: [
      arg("material:clay-slip", 1),
      arg("material:slaked-lime", 1),
      arg("material:ash", 1),
    ],
    station: "mortar",
    action: "combine",
    progression: progress(3, 8, 3, 0.29),
    education: lesson(
      ["ceramic mixture", "additives"],
      "Ceramic bodies can include clay plus mineral additives.",
    ),
    fantasy: request(["artificer", "alchemist-guild"], ["container-chain"]),
  }),
  recipe({
    id: "alchemy:ceramic-bowl",
    name: "Ceramic Bowl",
    output: item("container", "container:ceramic-bowl", "Ceramic Bowl"),
    arguments: [arg("material:ceramic-clay", 1)],
    station: "kiln",
    action: "heat",
    progression: progress(3, 9, 4, 0.31),
    education: lesson(
      ["ceramic firing", "container"],
      "Fired ceramic becomes harder and holds its shape.",
      "adult-supervision",
    ),
    fantasy: request(["druid", "cleric"], ["container-chain"]),
  }),
  recipe({
    id: "alchemy:wax-sealed-vial",
    name: "Wax-Sealed Vial",
    output: item("container", "container:wax-sealed-vial", "Wax-Sealed Vial"),
    arguments: [arg("container:clay-vial", 1, "container"), arg("component:wax-seal", 1, "finish")],
    station: "hands",
    action: "assemble",
    progression: progress(3, 10, 4, 0.3),
    education: lesson(
      ["seal", "container"],
      "A wax seal helps a vial keep powders or smoke inside.",
    ),
    fantasy: request(["rogue", "wizard"], ["container-chain"]),
  }),
  recipe({
    id: "alchemy:copper-wire",
    name: "Copper Wire",
    output: item("component", "component:copper-wire", "Copper Wire"),
    arguments: [arg("material:copper-ingot", 1)],
    station: "forge",
    action: "shape",
    progression: progress(3, 11, 2, 0.29),
    education: lesson(
      ["ductility", "conductivity"],
      "Copper can be drawn into wire and carries electricity well.",
      "adult-supervision",
    ),
    fantasy: request(["artificer", "wizard"], ["metal", "conductor"]),
  }),
  recipe({
    id: "alchemy:glass-bead",
    name: "Glass Bead",
    output: item("component", "component:glass-bead", "Glass Bead"),
    arguments: [arg("material:glass", 1)],
    station: "glassworks",
    action: "shape",
    progression: progress(3, 12, 4, 0.32),
    education: lesson(
      ["shaping", "small component"],
      "Glass can be shaped into small repeatable components.",
      "adult-supervision",
    ),
    fantasy: request(["bard", "wizard"], ["glass-chain", "charm"]),
  }),
  recipe({
    id: "alchemy:empty-potion-bottle",
    name: "Empty Potion Bottle",
    output: item("container", "container:empty-potion-bottle", "Empty Potion Bottle"),
    arguments: [
      arg("container:glass-flask", 1, "container"),
      arg("component:wax-seal", 1, "finish"),
    ],
    station: "hands",
    action: "assemble",
    progression: progress(4, 0, 5, 0.31),
    education: lesson(
      ["container design", "seal"],
      "A potion bottle needs both a shaped container and a closure.",
    ),
    fantasy: request(["cleric", "wizard"], ["potion-chain"]),
  }),
  recipe({
    id: "alchemy:simple-healing-potion",
    name: "Simple Healing Potion",
    output: item("consumable", "consumable:simple-healing-potion", "Simple Healing Potion"),
    arguments: [
      arg("consumable:healing-tea", 1),
      arg("material:distilled-water", 1),
      arg("container:empty-potion-bottle", 1, "container"),
    ],
    station: "cauldron",
    action: "combine",
    progression: progress(4, 1, 6, 0.34),
    education: lesson(
      ["purity", "formulation"],
      "Upgrades a beginner mixture with a cleaner water base and a bottle.",
    ),
    fantasy: request(["cleric", "knight", "player"], ["potion-chain", "healing"]),
  }),
  recipe({
    id: "alchemy:fizzy-tonic",
    name: "Fizzy Tonic",
    output: item("consumable", "consumable:fizzy-tonic", "Fizzy Tonic"),
    arguments: [
      arg("material:carbonic-water", 1),
      arg("material:sugar-syrup", 1),
      arg("container:glass-flask", 1, "container"),
    ],
    station: "cauldron",
    action: "combine",
    progression: progress(4, 2, 5, 0.35),
    education: lesson(
      ["dissolved gas", "mixture"],
      "Uses carbonated water as a playful gas-in-liquid lesson.",
    ),
    fantasy: request(["bard", "wizard"], ["fizz-chain"]),
  }),
  recipe({
    id: "alchemy:ranger-field-flask",
    name: "Ranger Field Flask",
    output: item("equipment", "equipment:ranger-field-flask", "Ranger Field Flask"),
    arguments: [
      arg("quest:water-flask", 1),
      arg("component:linen-thread", 1),
      arg("component:wax-seal", 1),
    ],
    station: "workbench",
    action: "assemble",
    progression: progress(4, 3, 7, 0.36),
    education: lesson(
      ["reinforcement", "composite item"],
      "Adds fiber and wax to improve a basic flask for travel.",
    ),
    fantasy: request(["ranger"], ["class-order", "water-flask-chain"]),
  }),
  recipe({
    id: "alchemy:cleansing-salt",
    name: "Cleansing Salt",
    output: item("material", "material:cleansing-salt", "Cleansing Salt"),
    arguments: [arg("material:sea-salt-crystals", 1), arg("material:slaked-lime", 1)],
    station: "mortar",
    action: "combine",
    progression: progress(4, 4, 4, 0.34),
    education: lesson(
      ["mixture", "basic material"],
      "Combines two mineral materials into a fantasy cleansing reagent.",
    ),
    fantasy: request(["cleric"], ["class-order", "cleansing"]),
  }),
  recipe({
    id: "alchemy:ink-base",
    name: "Ink Base",
    output: item("material", "material:ink-base", "Ink Base"),
    arguments: [
      arg("material:charcoal", 1),
      arg("material:distilled-water", 1),
      arg("raw:resin", 1, "binder"),
    ],
    station: "mortar",
    action: "combine",
    progression: progress(4, 5, 4, 0.35),
    education: lesson(
      ["pigment", "binder"],
      "Ink needs dark particles, liquid, and something sticky enough to bind it.",
    ),
    fantasy: request(["wizard", "bard"], ["scribe-chain"]),
  }),
  recipe({
    id: "alchemy:black-ink",
    name: "Black Ink",
    output: item("material", "material:black-ink", "Black Ink"),
    arguments: [arg("material:ink-base", 1), arg("material:iron-ingot", 1), arg("raw:berries", 1)],
    station: "mortar",
    action: "combine",
    progression: progress(4, 6, 5, 0.38),
    education: lesson(
      ["pigment", "metal salt idea"],
      "A kid-safe game model inspired by dark inks made from carbon and iron-containing materials.",
    ),
    fantasy: request(["wizard", "bard"], ["scribe-chain"]),
  }),
  recipe({
    id: "alchemy:scroll-paper",
    name: "Scroll Paper",
    output: item("component", "component:scroll-paper", "Scroll Paper"),
    arguments: [
      arg("component:linen-thread", 1),
      arg("material:water", 1),
      arg("material:slaked-lime", 1),
    ],
    station: "scribe-desk",
    action: "assemble",
    progression: progress(4, 7, 4, 0.37),
    education: lesson(["fibers", "sheet making"], "Plant fibers can be spread into a thin sheet."),
    fantasy: request(["wizard", "bard"], ["scribe-chain"]),
  }),
  recipe({
    id: "alchemy:sealed-scroll",
    name: "Sealed Scroll",
    output: item("quest-item", "quest:sealed-scroll", "Sealed Scroll"),
    arguments: [
      arg("component:scroll-paper", 1),
      arg("material:black-ink", 1),
      arg("component:wax-seal", 1),
    ],
    station: "scribe-desk",
    action: "write",
    progression: progress(4, 8, 6, 0.41),
    education: lesson(
      ["information carrier", "composite item"],
      "A scroll combines a writing surface, ink, and a seal.",
    ),
    fantasy: request(["wizard"], ["class-order", "scribe-chain"]),
  }),
  recipe({
    id: "alchemy:smoke-puff",
    name: "Smoke Puff",
    output: item("consumable", "consumable:smoke-puff", "Smoke Puff"),
    arguments: [
      arg("material:ash", 1),
      arg("material:carbon-dioxide", 1),
      arg("container:wax-sealed-vial", 1, "container"),
    ],
    station: "cauldron",
    action: "combine",
    progression: progress(4, 9, 5, 0.4),
    education: lesson(
      ["gas", "container"],
      "A fantasy-safe model for storing a visible gas effect in a vial.",
    ),
    fantasy: request(["rogue", "wizard"], ["class-order", "gas"]),
  }),
  recipe({
    id: "alchemy:iron-nail",
    name: "Iron Nail",
    output: item("component", "component:iron-nail", "Iron Nail"),
    arguments: [arg("material:iron-ingot", 1)],
    station: "forge",
    action: "shape",
    progression: progress(4, 10, 2, 0.36),
    education: lesson(
      ["metal shaping", "fastener"],
      "Iron can be shaped into small fasteners.",
      "adult-supervision",
    ),
    fantasy: request(["knight", "blacksmith"], ["metal", "fastener"]),
  }),
  recipe({
    id: "alchemy:copper-charm",
    name: "Copper Charm",
    output: item("quest-item", "quest:copper-charm", "Copper Charm"),
    arguments: [arg("component:copper-wire", 1), arg("component:glass-bead", 1)],
    station: "workbench",
    action: "assemble",
    progression: progress(4, 11, 5, 0.39),
    education: lesson(
      ["conductive metal", "assembly"],
      "Combines a metal conductor and glass decoration.",
    ),
    fantasy: request(["wizard", "bard"], ["class-order", "charm"]),
  }),
  recipe({
    id: "alchemy:tin-ingot",
    name: "Tin Ingot",
    output: item("material", "material:tin-ingot", "Tin Ingot"),
    arguments: [arg("element:sn", 1, "reactant")],
    station: "forge",
    action: "heat",
    progression: progress(5, 0, 1, 0.4),
    education: lesson(
      ["metal", "element symbol"],
      "Introduces Sn as the symbol for tin.",
      "adult-supervision",
    ),
    fantasy: request(["blacksmith", "artificer"], ["metal", "alloy-chain"]),
  }),
  recipe({
    id: "alchemy:zinc-ingot",
    name: "Zinc Ingot",
    output: item("material", "material:zinc-ingot", "Zinc Ingot"),
    arguments: [arg("element:zn", 1, "reactant")],
    station: "forge",
    action: "heat",
    progression: progress(5, 1, 1, 0.4),
    education: lesson(
      ["metal", "element symbol"],
      "Introduces Zn as the symbol for zinc.",
      "adult-supervision",
    ),
    fantasy: request(["blacksmith", "artificer"], ["metal", "alloy-chain"]),
  }),
  recipe({
    id: "alchemy:bronze-ingot",
    name: "Bronze Ingot",
    output: item("material", "material:bronze-ingot", "Bronze Ingot"),
    arguments: [arg("material:copper-ingot", 1), arg("material:tin-ingot", 1)],
    station: "forge",
    action: "heat",
    progression: progress(5, 2, 2, 0.43),
    education: lesson(
      ["alloy", "materials science"],
      "Bronze is an alloy of copper and tin.",
      "adult-supervision",
    ),
    fantasy: request(["knight", "blacksmith"], ["metal", "alloy-chain"]),
  }),
  recipe({
    id: "alchemy:brass-ingot",
    name: "Brass Ingot",
    output: item("material", "material:brass-ingot", "Brass Ingot"),
    arguments: [arg("material:copper-ingot", 1), arg("material:zinc-ingot", 1)],
    station: "forge",
    action: "heat",
    progression: progress(5, 3, 2, 0.43),
    education: lesson(
      ["alloy", "materials science"],
      "Brass is an alloy of copper and zinc.",
      "adult-supervision",
    ),
    fantasy: request(["bard", "artificer"], ["metal", "alloy-chain"]),
  }),
  recipe({
    id: "alchemy:steel-ingot",
    name: "Steel Ingot",
    output: item("material", "material:steel-ingot", "Steel Ingot"),
    arguments: [
      arg("material:iron-ingot", 1),
      arg("material:charcoal", 1),
      arg("element:c", 1, "reactant"),
    ],
    station: "forge",
    action: "heat",
    progression: progress(5, 4, 2, 0.45),
    education: lesson(
      ["alloy", "carbon"],
      "Steel is iron improved with a small amount of carbon.",
      "adult-supervision",
    ),
    fantasy: request(["knight", "blacksmith"], ["metal", "alloy-chain"]),
  }),
  recipe({
    id: "alchemy:bronze-buckle",
    name: "Bronze Buckle",
    output: item("component", "component:bronze-buckle", "Bronze Buckle"),
    arguments: [arg("material:bronze-ingot", 1)],
    station: "forge",
    action: "shape",
    progression: progress(5, 5, 3, 0.46),
    education: lesson(
      ["alloy use", "hardware"],
      "Alloys become useful hardware parts when shaped.",
      "adult-supervision",
    ),
    fantasy: request(["ranger", "knight"], ["gear-part"]),
  }),
  recipe({
    id: "alchemy:steel-needle",
    name: "Steel Needle",
    output: item("component", "component:steel-needle", "Steel Needle"),
    arguments: [arg("material:steel-ingot", 1)],
    station: "forge",
    action: "shape",
    progression: progress(5, 6, 3, 0.47),
    education: lesson(
      ["hardness", "precision"],
      "Steel can hold a sharper point than soft iron.",
      "adult-supervision",
    ),
    fantasy: request(["cleric", "rogue"], ["gear-part", "tool-part"]),
  }),
  recipe({
    id: "alchemy:copper-rivet",
    name: "Copper Rivet",
    output: item("component", "component:copper-rivet", "Copper Rivet"),
    arguments: [arg("material:copper-ingot", 1)],
    station: "forge",
    action: "shape",
    progression: progress(5, 7, 2, 0.44),
    education: lesson(
      ["fastener", "ductility"],
      "Softer metals can be shaped into rivets that hold parts together.",
      "adult-supervision",
    ),
    fantasy: request(["artificer", "blacksmith"], ["gear-part", "fastener"]),
  }),
  recipe({
    id: "alchemy:iron-chain-link",
    name: "Iron Chain Link",
    output: item("component", "component:iron-chain-link", "Iron Chain Link"),
    arguments: [arg("material:iron-ingot", 1), arg("component:iron-nail", 1)],
    station: "forge",
    action: "shape",
    progression: progress(5, 8, 3, 0.48),
    education: lesson(
      ["repeatable part", "metal shaping"],
      "Small metal parts can compose into flexible structures like chain.",
    ),
    fantasy: request(["knight", "blacksmith"], ["gear-part"]),
  }),
  recipe({
    id: "alchemy:shield-boss",
    name: "Shield Boss",
    output: item("equipment", "equipment:shield-boss", "Shield Boss"),
    arguments: [
      arg("material:steel-ingot", 1),
      arg("material:brass-ingot", 1),
      arg("component:copper-rivet", 1),
    ],
    station: "forge",
    action: "assemble",
    progression: progress(5, 9, 4, 0.51),
    education: lesson(
      ["composite gear", "material choice"],
      "Different metals can be selected for strength, color, and fastening.",
    ),
    fantasy: request(["knight"], ["class-order", "gear"]),
  }),
  recipe({
    id: "alchemy:wood-shaft",
    name: "Wood Shaft",
    output: item("component", "component:wood-shaft", "Wood Shaft"),
    arguments: [arg("raw:wood", 1)],
    station: "workbench",
    action: "shape",
    progression: progress(5, 10, 1, 0.42),
    education: lesson(["grain", "shape"], "Wood can be shaped into long straight parts."),
    fantasy: request(["ranger", "blacksmith"], ["gear-part"]),
  }),
  recipe({
    id: "alchemy:ranger-arrowhead",
    name: "Ranger Arrowhead",
    output: item("component", "component:ranger-arrowhead", "Ranger Arrowhead"),
    arguments: [arg("material:steel-ingot", 1)],
    station: "forge",
    action: "shape",
    progression: progress(5, 11, 3, 0.49),
    education: lesson(
      ["wedge", "hardness"],
      "A hard wedge shape concentrates force at a point.",
      "adult-supervision",
    ),
    fantasy: request(["ranger"], ["class-order", "gear-part"]),
  }),
  recipe({
    id: "alchemy:ranger-arrow",
    name: "Ranger Arrow",
    output: item("equipment", "equipment:ranger-arrow", "Ranger Arrow"),
    arguments: [
      arg("component:wood-shaft", 1),
      arg("component:ranger-arrowhead", 1),
      arg("raw:feather", 1),
      arg("component:linen-thread", 1),
    ],
    station: "workbench",
    action: "assemble",
    progression: progress(5, 12, 4, 0.52),
    education: lesson(
      ["assembly", "stability"],
      "Arrow parts show how shape and materials work together.",
    ),
    fantasy: request(["ranger"], ["class-order", "gear"]),
  }),
  recipe({
    id: "alchemy:vinegar-solution",
    name: "Vinegar Solution",
    output: item("material", "material:vinegar-solution", "Vinegar Solution"),
    arguments: [arg("raw:vinegar", 1), arg("material:water", 1)],
    station: "cauldron",
    action: "combine",
    progression: progress(6, 0, 2, 0.5),
    education: lesson(
      ["dilution", "weak acid"],
      "A gentle way to introduce acid strength without real lab work.",
    ),
    fantasy: request(["druid", "cleric"], ["acid-base", "potion-base"]),
  }),
  recipe({
    id: "alchemy:baking-soda",
    name: "Baking Soda",
    output: item("material", "material:baking-soda", "Baking Soda"),
    arguments: [
      arg("material:soda-ash", 1, "reactant"),
      arg("material:carbon-dioxide", 1, "reactant"),
      arg("material:water", 1, "reactant"),
    ],
    station: "cauldron",
    action: "combine",
    progression: progress(6, 1, 2, 0.51),
    education: lesson(
      ["bicarbonate", "compound reuse"],
      "Uses soda ash, carbon dioxide, and water as a compressed game route toward sodium bicarbonate.",
    ),
    fantasy: request(["bard", "wizard"], ["acid-base", "fizz-chain"]),
  }),
  recipe({
    id: "alchemy:fizz-foam",
    name: "Fizz Foam",
    output: item("material", "material:fizz-foam", "Fizz Foam"),
    arguments: [arg("material:vinegar-solution", 1), arg("material:baking-soda", 1)],
    station: "cauldron",
    action: "combine",
    progression: progress(6, 2, 3, 0.54),
    education: lesson(
      ["acid-base reaction", "gas production"],
      "A vinegar and baking soda model creates carbon dioxide bubbles.",
    ),
    fantasy: request(["bard", "wizard"], ["acid-base", "fizz-chain"]),
  }),
  recipe({
    id: "alchemy:copper-chloride",
    name: "Copper Chloride",
    output: item("material", "material:copper-chloride", "Copper Chloride"),
    arguments: [arg("material:copper-ingot", 1), arg("element:cl", 2, "reactant")],
    station: "cauldron",
    action: "combine",
    progression: progress(6, 3, 2, 0.53),
    education: lesson(
      ["salt", "transition metal"],
      "A simplified game model of a copper salt used for color.",
    ),
    fantasy: request(["wizard", "artificer"], ["pigment", "glass-color"]),
  }),
  recipe({
    id: "alchemy:copper-patina",
    name: "Copper Patina",
    output: item("material", "material:copper-patina", "Copper Patina"),
    arguments: [
      arg("material:copper-ingot", 1),
      arg("material:vinegar-solution", 1),
      arg("material:salt", 1),
    ],
    station: "cauldron",
    action: "combine",
    progression: progress(6, 4, 3, 0.55),
    education: lesson(
      ["surface change", "corrosion"],
      "Copper can form green-blue surface compounds over time.",
    ),
    fantasy: request(["wizard", "bard"], ["pigment", "glass-color"]),
  }),
  recipe({
    id: "alchemy:iron-oxide-pigment",
    name: "Iron Oxide Pigment",
    output: item("material", "material:iron-oxide-pigment", "Iron Oxide Pigment"),
    arguments: [
      arg("material:iron-ingot", 1),
      arg("element:o", 1, "reactant"),
      arg("material:water", 1),
    ],
    station: "mortar",
    action: "combine",
    progression: progress(6, 5, 3, 0.54),
    education: lesson(["oxide", "pigment"], "Iron oxides make red and brown earth pigments."),
    fantasy: request(["bard", "artificer"], ["pigment", "glass-color"]),
  }),
  recipe({
    id: "alchemy:green-pigment",
    name: "Green Pigment",
    output: item("material", "material:green-pigment", "Green Pigment"),
    arguments: [arg("material:copper-patina", 1)],
    station: "mortar",
    action: "grind",
    progression: progress(6, 6, 4, 0.56),
    education: lesson(
      ["pigment processing", "particle size"],
      "Grinding a colored material turns it into usable pigment.",
    ),
    fantasy: request(["bard", "wizard"], ["pigment"]),
  }),
  recipe({
    id: "alchemy:red-pigment",
    name: "Red Pigment",
    output: item("material", "material:red-pigment", "Red Pigment"),
    arguments: [arg("material:iron-oxide-pigment", 1)],
    station: "mortar",
    action: "grind",
    progression: progress(6, 7, 4, 0.56),
    education: lesson(
      ["pigment processing", "particle size"],
      "A mineral pigment becomes more useful when powdered evenly.",
    ),
    fantasy: request(["bard", "artificer"], ["pigment"]),
  }),
  recipe({
    id: "alchemy:blue-glass",
    name: "Blue Glass",
    output: item("material", "material:blue-glass", "Blue Glass"),
    arguments: [arg("material:glass", 1), arg("material:copper-chloride", 1)],
    station: "glassworks",
    action: "heat",
    progression: progress(6, 8, 5, 0.59),
    education: lesson(
      ["colorant", "glass chemistry"],
      "Metal compounds can change the color of glass.",
      "adult-supervision",
    ),
    fantasy: request(["wizard", "artificer"], ["glass-color"]),
  }),
  recipe({
    id: "alchemy:green-glass",
    name: "Green Glass",
    output: item("material", "material:green-glass", "Green Glass"),
    arguments: [arg("material:glass", 1), arg("material:copper-patina", 1)],
    station: "glassworks",
    action: "heat",
    progression: progress(6, 9, 5, 0.59),
    education: lesson(
      ["colorant", "materials science"],
      "Different copper compounds can tint glass green-blue.",
      "adult-supervision",
    ),
    fantasy: request(["wizard", "druid"], ["glass-color"]),
  }),
  recipe({
    id: "alchemy:red-glass",
    name: "Red Glass",
    output: item("material", "material:red-glass", "Red Glass"),
    arguments: [arg("material:glass", 1), arg("material:iron-oxide-pigment", 1)],
    station: "glassworks",
    action: "heat",
    progression: progress(6, 10, 5, 0.6),
    education: lesson(
      ["colorant", "oxide"],
      "Iron oxide can contribute warm colors to glass and glazes.",
      "adult-supervision",
    ),
    fantasy: request(["bard", "artificer"], ["glass-color"]),
  }),
  recipe({
    id: "alchemy:wizard-lens",
    name: "Wizard Lens",
    output: item("component", "component:wizard-lens", "Wizard Lens"),
    arguments: [arg("material:blue-glass", 1), arg("component:glass-tube", 1)],
    station: "glassworks",
    action: "shape",
    progression: progress(6, 11, 6, 0.63),
    education: lesson(
      ["optics", "shaping"],
      "Curved transparent material can focus or bend light.",
      "adult-supervision",
    ),
    fantasy: request(["wizard"], ["class-order", "optics"]),
  }),
  recipe({
    id: "alchemy:leather-strip",
    name: "Leather Strip",
    output: item("component", "component:leather-strip", "Leather Strip"),
    arguments: [arg("raw:hide", 1), arg("material:salt", 1)],
    station: "tannery",
    action: "cure",
    progression: progress(7, 0, 2, 0.58),
    education: lesson(
      ["preservation", "material processing"],
      "Salt is used in the game as a simple curing preservative.",
    ),
    fantasy: request(["ranger", "rogue"], ["leather", "gear-part"]),
  }),
  recipe({
    id: "alchemy:parchment",
    name: "Parchment",
    output: item("component", "component:parchment", "Parchment"),
    arguments: [arg("raw:hide", 1), arg("material:slaked-lime", 1), arg("material:water", 1)],
    station: "tannery",
    action: "cure",
    progression: progress(7, 1, 3, 0.6),
    education: lesson(
      ["material processing", "writing surface"],
      "Parchment is a processed animal-skin writing material in the game model.",
    ),
    fantasy: request(["wizard", "bard"], ["scribe-chain"]),
  }),
  recipe({
    id: "alchemy:quill-pen",
    name: "Quill Pen",
    output: item("component", "component:quill-pen", "Quill Pen"),
    arguments: [arg("raw:feather", 1), arg("component:steel-needle", 1)],
    station: "scribe-desk",
    action: "shape",
    progression: progress(7, 2, 4, 0.6),
    education: lesson(
      ["tool making", "point geometry"],
      "A shaped feather becomes a writing tool.",
    ),
    fantasy: request(["wizard", "bard"], ["scribe-chain", "tool-part"]),
  }),
  recipe({
    id: "alchemy:inked-quill",
    name: "Inked Quill",
    output: item("component", "component:inked-quill", "Inked Quill"),
    arguments: [arg("component:quill-pen", 1), arg("material:black-ink", 1)],
    station: "scribe-desk",
    action: "assemble",
    progression: progress(7, 3, 6, 0.62),
    education: lesson(
      ["capillary action", "tool use"],
      "Ink moves from the writing tool to the page as marks.",
    ),
    fantasy: request(["wizard", "bard"], ["scribe-chain"]),
  }),
  recipe({
    id: "alchemy:spell-scroll",
    name: "Spell Scroll",
    output: item("quest-item", "quest:spell-scroll", "Spell Scroll"),
    arguments: [
      arg("component:parchment", 1),
      arg("material:black-ink", 1),
      arg("component:wax-seal", 1),
    ],
    station: "scribe-desk",
    action: "write",
    progression: progress(7, 4, 7, 0.65),
    education: lesson(
      ["information storage", "composition"],
      "A scroll chain combines processed material, writing medium, and a seal.",
    ),
    fantasy: request(["wizard"], ["class-order", "scribe-chain"]),
  }),
  recipe({
    id: "alchemy:alchemist-label",
    name: "Alchemist Label",
    output: item("component", "component:alchemist-label", "Alchemist Label"),
    arguments: [arg("component:scroll-paper", 1), arg("material:black-ink", 1)],
    station: "scribe-desk",
    action: "write",
    progression: progress(7, 5, 6, 0.62),
    education: lesson(
      ["classification", "labeling"],
      "Labels make inventory searchable and safer in the game world.",
    ),
    fantasy: request(["alchemist-guild", "artificer"], ["kit-chain"]),
  }),
  recipe({
    id: "alchemy:potion-kit",
    name: "Potion Kit",
    output: item("equipment", "equipment:potion-kit", "Potion Kit"),
    arguments: [
      arg("container:empty-potion-bottle", 1),
      arg("component:alchemist-label", 1),
      arg("component:cork-stopper", 1),
    ],
    station: "workbench",
    action: "assemble",
    progression: progress(7, 6, 7, 0.66),
    education: lesson(
      ["kit composition", "inventory system"],
      "A kit is a bundle of reusable subcomponents.",
    ),
    fantasy: request(["player", "alchemist-guild"], ["kit-chain"]),
  }),
  recipe({
    id: "alchemy:antiseptic-wash",
    name: "Antiseptic Wash",
    output: item("consumable", "consumable:antiseptic-wash", "Antiseptic Wash"),
    arguments: [
      arg("material:distilled-water", 1),
      arg("material:salt", 1),
      arg("consumable:healing-tea", 1),
    ],
    station: "cauldron",
    action: "combine",
    progression: progress(7, 7, 6, 0.66),
    education: lesson(
      ["solution", "cleanliness"],
      "A fantasy wash that reinforces dissolved salt and clean-water ideas.",
    ),
    fantasy: request(["cleric", "ranger"], ["class-order", "healing"]),
  }),
  recipe({
    id: "alchemy:cleric-salve",
    name: "Cleric Salve",
    output: item("consumable", "consumable:cleric-salve", "Cleric Salve"),
    arguments: [arg("raw:beeswax", 1), arg("material:herbal-mash", 1), arg("raw:plant-oil", 1)],
    station: "cauldron",
    action: "combine",
    progression: progress(7, 8, 4, 0.64),
    education: lesson(
      ["emulsion idea", "carrier material"],
      "Oil and wax make a thicker carrier for herbs in the fantasy model.",
    ),
    fantasy: request(["cleric", "druid"], ["class-order", "healing"]),
  }),
  recipe({
    id: "alchemy:rogue-smoke-vial",
    name: "Rogue Smoke Vial",
    output: item("equipment", "equipment:rogue-smoke-vial", "Rogue Smoke Vial"),
    arguments: [arg("consumable:smoke-puff", 1), arg("container:wax-sealed-vial", 1, "container")],
    station: "workbench",
    action: "assemble",
    progression: progress(7, 9, 6, 0.67),
    education: lesson(
      ["stored effect", "container reuse"],
      "Puts a gas-effect consumable into a sturdier adventuring container.",
    ),
    fantasy: request(["rogue"], ["class-order", "gas"]),
  }),
  recipe({
    id: "alchemy:shine-polish",
    name: "Shine Polish",
    output: item("material", "material:shine-polish", "Shine Polish"),
    arguments: [
      arg("raw:beeswax", 1),
      arg("material:vinegar-solution", 1),
      arg("component:linen-thread", 1),
    ],
    station: "workbench",
    action: "combine",
    progression: progress(7, 10, 4, 0.65),
    education: lesson(
      ["surface treatment", "cleaning"],
      "A surface treatment changes how a material looks without changing its core.",
    ),
    fantasy: request(["bard", "knight"], ["finish", "gear"]),
  }),
  recipe({
    id: "alchemy:polished-shield-boss",
    name: "Polished Shield Boss",
    output: item("equipment", "equipment:polished-shield-boss", "Polished Shield Boss"),
    arguments: [arg("equipment:shield-boss", 1), arg("material:shine-polish", 1, "finish")],
    station: "workbench",
    action: "assemble",
    progression: progress(7, 11, 5, 0.69),
    education: lesson(
      ["surface finish", "gear upgrade"],
      "Finishing an existing item creates an upgraded version.",
    ),
    fantasy: request(["knight", "bard"], ["class-order", "gear"]),
  }),
  recipe({
    id: "alchemy:quartz-dust",
    name: "Quartz Dust",
    output: item("material", "material:quartz-dust", "Quartz Dust"),
    arguments: [arg("raw:quartz", 1)],
    station: "mortar",
    action: "grind",
    progression: progress(8, 0, 1, 0.66),
    education: lesson(["mineral", "particle size"], "Quartz is a crystalline form of silica."),
    fantasy: request(["wizard", "artificer"], ["crystal", "optics"]),
  }),
  recipe({
    id: "alchemy:crystal-lens",
    name: "Crystal Lens",
    output: item("component", "component:crystal-lens", "Crystal Lens"),
    arguments: [arg("material:quartz-dust", 1), arg("material:glass", 1)],
    station: "glassworks",
    action: "shape",
    progression: progress(8, 1, 5, 0.69),
    education: lesson(
      ["optics", "transparent material"],
      "Clear materials can be shaped to bend light.",
      "adult-supervision",
    ),
    fantasy: request(["wizard", "artificer"], ["crystal", "optics"]),
  }),
  recipe({
    id: "alchemy:silver-ingot",
    name: "Silver Ingot",
    output: item("material", "material:silver-ingot", "Silver Ingot"),
    arguments: [arg("element:ag", 1, "reactant")],
    station: "forge",
    action: "heat",
    progression: progress(8, 2, 1, 0.68),
    education: lesson(
      ["metal", "element symbol"],
      "Introduces Ag as the symbol for silver.",
      "adult-supervision",
    ),
    fantasy: request(["cleric", "artificer"], ["metal", "conductor"]),
  }),
  recipe({
    id: "alchemy:gold-ingot",
    name: "Gold Ingot",
    output: item("material", "material:gold-ingot", "Gold Ingot"),
    arguments: [arg("element:au", 1, "reactant")],
    station: "forge",
    action: "heat",
    progression: progress(8, 3, 1, 0.69),
    education: lesson(
      ["metal", "element symbol"],
      "Introduces Au as the symbol for gold.",
      "adult-supervision",
    ),
    fantasy: request(["bard", "artificer"], ["metal", "decorative"]),
  }),
  recipe({
    id: "alchemy:silver-wire",
    name: "Silver Wire",
    output: item("component", "component:silver-wire", "Silver Wire"),
    arguments: [arg("material:silver-ingot", 1)],
    station: "forge",
    action: "shape",
    progression: progress(8, 4, 2, 0.7),
    education: lesson(["ductility", "conductivity"], "Silver is a highly conductive metal."),
    fantasy: request(["cleric", "wizard"], ["conductor", "gear-part"]),
  }),
  recipe({
    id: "alchemy:gold-leaf",
    name: "Gold Leaf",
    output: item("component", "component:gold-leaf", "Gold Leaf"),
    arguments: [arg("material:gold-ingot", 1)],
    station: "forge",
    action: "shape",
    progression: progress(8, 5, 2, 0.71),
    education: lesson(["malleability", "thin sheet"], "Gold can be beaten into very thin sheets."),
    fantasy: request(["bard", "wizard"], ["decorative", "scribe-chain"]),
  }),
  recipe({
    id: "alchemy:conductive-thread",
    name: "Conductive Thread",
    output: item("component", "component:conductive-thread", "Conductive Thread"),
    arguments: [arg("component:copper-wire", 1), arg("component:linen-thread", 1)],
    station: "loom",
    action: "weave",
    progression: progress(8, 6, 4, 0.72),
    education: lesson(
      ["composite", "conductivity"],
      "Combines flexible fiber with conductive metal.",
    ),
    fantasy: request(["artificer", "wizard"], ["conductor", "gear-part"]),
  }),
  recipe({
    id: "alchemy:circuit-rune",
    name: "Circuit Rune",
    output: item("component", "component:circuit-rune", "Circuit Rune"),
    arguments: [
      arg("component:copper-wire", 1),
      arg("material:quartz-dust", 1),
      arg("component:glass-bead", 1),
    ],
    station: "enchanter",
    action: "assemble",
    progression: progress(8, 7, 5, 0.74),
    education: lesson(
      ["circuit model", "insulator and conductor"],
      "A fantasy rune compares conductive copper with glassy insulating material.",
    ),
    fantasy: request(["artificer"], ["conductor", "rune"]),
  }),
  recipe({
    id: "alchemy:focusing-crystal",
    name: "Focusing Crystal",
    output: item("component", "component:focusing-crystal", "Focusing Crystal"),
    arguments: [arg("raw:crystal-shard", 1), arg("component:crystal-lens", 1)],
    station: "enchanter",
    action: "enchant",
    progression: progress(8, 8, 6, 0.75),
    education: lesson(
      ["optics", "alignment"],
      "A fantasy crystal item extends the lens chain into magical tools.",
    ),
    fantasy: request(["wizard", "artificer"], ["crystal", "optics"]),
  }),
  recipe({
    id: "alchemy:wizard-focus",
    name: "Wizard Focus",
    output: item("equipment", "equipment:wizard-focus", "Wizard Focus"),
    arguments: [
      arg("component:focusing-crystal", 1),
      arg("component:silver-wire", 1),
      arg("component:conductive-thread", 1),
    ],
    station: "enchanter",
    action: "assemble",
    progression: progress(8, 9, 7, 0.78),
    education: lesson(
      ["systems thinking", "material roles"],
      "A focus combines optics, conductors, and flexible structure.",
    ),
    fantasy: request(["wizard"], ["class-order", "crystal"]),
  }),
  recipe({
    id: "alchemy:radiant-ink",
    name: "Radiant Ink",
    output: item("material", "material:radiant-ink", "Radiant Ink"),
    arguments: [
      arg("material:black-ink", 1),
      arg("component:gold-leaf", 1),
      arg("material:quartz-dust", 1),
    ],
    station: "scribe-desk",
    action: "combine",
    progression: progress(8, 10, 7, 0.77),
    education: lesson(
      ["suspension", "decorative additive"],
      "Adds reflective and mineral particles to an existing ink.",
    ),
    fantasy: request(["wizard", "bard"], ["scribe-chain", "crystal"]),
  }),
  recipe({
    id: "alchemy:star-map-scroll",
    name: "Star Map Scroll",
    output: item("quest-item", "quest:star-map-scroll", "Star Map Scroll"),
    arguments: [arg("quest:spell-scroll", 1), arg("material:radiant-ink", 1)],
    station: "scribe-desk",
    action: "write",
    progression: progress(8, 11, 8, 0.79),
    education: lesson(
      ["data overlay", "composition"],
      "Upgrades a scroll by layering new information and special ink.",
    ),
    fantasy: request(["wizard", "bard"], ["class-order", "scribe-chain"]),
  }),
  recipe({
    id: "alchemy:bone-ash",
    name: "Bone Ash",
    output: item("material", "material:bone-ash", "Bone Ash"),
    arguments: [arg("raw:bone", 1)],
    station: "kiln",
    action: "heat",
    progression: progress(9, 0, 1, 0.74),
    education: lesson(
      ["mineral residue", "calcium source"],
      "Bone ash is modeled as a mineral-rich residue.",
      "adult-supervision",
    ),
    fantasy: request(["druid", "cleric"], ["garden", "mineral"]),
  }),
  recipe({
    id: "alchemy:phosphate-salt",
    name: "Phosphate Salt",
    output: item("material", "material:phosphate-salt", "Phosphate Salt"),
    arguments: [
      arg("material:bone-ash", 1, "material"),
      arg("element:p", 1, "reactant"),
      arg("element:o", 2, "reactant"),
    ],
    station: "cauldron",
    action: "combine",
    progression: progress(9, 1, 2, 0.76),
    education: lesson(
      ["formula compression", "plant nutrients"],
      "Uses bone ash as a compressed calcium source so the visible recipe stays playable while naming the larger phosphate idea.",
    ),
    fantasy: request(["druid", "alchemist-guild"], ["garden", "mineral"]),
  }),
  recipe({
    id: "alchemy:fertilizer-mix",
    name: "Fertilizer Mix",
    output: item("material", "material:fertilizer-mix", "Fertilizer Mix"),
    arguments: [
      arg("material:phosphate-salt", 1),
      arg("material:potassium-salt", 1),
      arg("raw:seaweed", 1),
    ],
    station: "garden-bench",
    action: "combine",
    progression: progress(9, 2, 3, 0.79),
    education: lesson(
      ["plant nutrients", "mixture"],
      "Combines phosphorus and potassium ideas with organic matter.",
    ),
    fantasy: request(["druid"], ["class-order", "garden"]),
  }),
  recipe({
    id: "alchemy:growth-elixir",
    name: "Growth Elixir",
    output: item("consumable", "consumable:growth-elixir", "Growth Elixir"),
    arguments: [
      arg("material:fertilizer-mix", 1),
      arg("material:distilled-water", 1),
      arg("material:sugar-syrup", 1),
    ],
    station: "garden-bench",
    action: "combine",
    progression: progress(9, 3, 6, 0.81),
    education: lesson(
      ["solution", "nutrient delivery"],
      "Turns solid nutrients into a fantasy plant-care liquid.",
    ),
    fantasy: request(["druid", "ranger"], ["garden"]),
  }),
  recipe({
    id: "alchemy:seed-coating",
    name: "Seed Coating",
    output: item("material", "material:seed-coating", "Seed Coating"),
    arguments: [
      arg("material:clay-slip", 1),
      arg("consumable:growth-elixir", 1),
      arg("material:ash", 1),
    ],
    station: "garden-bench",
    action: "combine",
    progression: progress(9, 4, 7, 0.82),
    education: lesson(
      ["coating", "slow release"],
      "A coating can hold materials around a seed in the game model.",
    ),
    fantasy: request(["druid"], ["class-order", "garden"]),
  }),
  recipe({
    id: "alchemy:mushroom-broth",
    name: "Mushroom Broth",
    output: item("material", "material:mushroom-broth", "Mushroom Broth"),
    arguments: [arg("raw:mushroom", 1), arg("material:water", 1)],
    station: "cauldron",
    action: "combine",
    progression: progress(9, 5, 2, 0.77),
    education: lesson(
      ["extraction", "mixture"],
      "Water can carry color and flavor from plant or fungal material.",
    ),
    fantasy: request(["druid", "wizard"], ["fermentation"]),
  }),
  recipe({
    id: "alchemy:fermentation-starter",
    name: "Fermentation Starter",
    output: item("material", "material:fermentation-starter", "Fermentation Starter"),
    arguments: [arg("material:mushroom-broth", 1), arg("material:sugar-syrup", 1)],
    station: "garden-bench",
    action: "ferment",
    progression: progress(9, 6, 4, 0.8),
    education: lesson(
      ["microbe model", "sugar as food"],
      "A kid-safe fantasy model for microbes using sugars over time.",
    ),
    fantasy: request(["druid", "bard"], ["fermentation"]),
  }),
  recipe({
    id: "alchemy:vinegar-brew",
    name: "Vinegar Brew",
    output: item("material", "material:vinegar-brew", "Vinegar Brew"),
    arguments: [arg("material:fermentation-starter", 1), arg("element:o", 1, "reactant")],
    station: "garden-bench",
    action: "ferment",
    progression: progress(9, 7, 5, 0.82),
    education: lesson(
      ["oxidation model", "fermentation"],
      "A fantasy model for turning a fermented starter into a sharper liquid.",
    ),
    fantasy: request(["druid", "rogue"], ["fermentation", "acid-base"]),
  }),
  recipe({
    id: "alchemy:preservative-brine",
    name: "Preservative Brine",
    output: item("material", "material:preservative-brine", "Preservative Brine"),
    arguments: [arg("material:brine", 1), arg("material:vinegar-solution", 1)],
    station: "cauldron",
    action: "combine",
    progression: progress(9, 8, 4, 0.8),
    education: lesson(
      ["preservation", "solution"],
      "Salt and vinegar are modeled as preservation helpers.",
    ),
    fantasy: request(["ranger", "druid"], ["preservation"]),
  }),
  recipe({
    id: "alchemy:trail-pickles",
    name: "Trail Pickles",
    output: item("consumable", "consumable:trail-pickles", "Trail Pickles"),
    arguments: [arg("material:preservative-brine", 1), arg("raw:herbs", 1)],
    station: "cauldron",
    action: "combine",
    progression: progress(9, 9, 5, 0.81),
    education: lesson(
      ["preservation", "flavoring"],
      "A simple food-preservation quest item for travel.",
    ),
    fantasy: request(["ranger", "bard"], ["class-order", "preservation"]),
  }),
  recipe({
    id: "alchemy:plant-tonic",
    name: "Plant Tonic",
    output: item("consumable", "consumable:plant-tonic", "Plant Tonic"),
    arguments: [arg("consumable:growth-elixir", 1), arg("material:carbonic-water", 1)],
    station: "garden-bench",
    action: "combine",
    progression: progress(9, 10, 7, 0.83),
    education: lesson(
      ["gas in liquid", "plant care"],
      "Composes the carbonated-water chain with the plant-nutrient chain.",
    ),
    fantasy: request(["druid"], ["class-order", "garden"]),
  }),
  recipe({
    id: "alchemy:garden-charm",
    name: "Garden Charm",
    output: item("quest-item", "quest:garden-charm", "Garden Charm"),
    arguments: [
      arg("material:seed-coating", 1),
      arg("quest:copper-charm", 1),
      arg("consumable:plant-tonic", 1),
    ],
    station: "enchanter",
    action: "enchant",
    progression: progress(9, 11, 8, 0.85),
    education: lesson(
      ["cross-chain composition", "systems thinking"],
      "Joins plant chemistry, charm crafting, and tonic crafting.",
    ),
    fantasy: request(["druid", "wizard"], ["class-order", "garden", "charm"]),
  }),
  recipe({
    id: "alchemy:tempered-steel",
    name: "Tempered Steel",
    output: item("material", "material:tempered-steel", "Tempered Steel"),
    arguments: [
      arg("material:steel-ingot", 1),
      arg("material:water", 1),
      arg("material:charcoal", 1, "fuel"),
    ],
    station: "forge",
    action: "heat",
    progression: progress(10, 0, 4, 0.84),
    education: lesson(
      ["heat treatment", "material properties"],
      "Heat treatment can change how a metal behaves.",
      "adult-supervision",
    ),
    fantasy: request(["knight", "blacksmith"], ["advanced", "metal"]),
  }),
  recipe({
    id: "alchemy:enamel-coating",
    name: "Enamel Coating",
    output: item("material", "material:enamel-coating", "Enamel Coating"),
    arguments: [
      arg("material:silica", 1),
      arg("material:soda-ash", 1),
      arg("material:red-pigment", 1),
    ],
    station: "glassworks",
    action: "heat",
    progression: progress(10, 1, 6, 0.85),
    education: lesson(
      ["glassy coating", "pigment"],
      "Enamel is modeled as a glass-like coating with colorant.",
      "adult-supervision",
    ),
    fantasy: request(["bard", "artificer"], ["advanced", "finish"]),
  }),
  recipe({
    id: "alchemy:enamelled-buckle",
    name: "Enamelled Buckle",
    output: item("component", "component:enamelled-buckle", "Enamelled Buckle"),
    arguments: [arg("component:bronze-buckle", 1), arg("material:enamel-coating", 1, "finish")],
    station: "workbench",
    action: "assemble",
    progression: progress(10, 2, 7, 0.87),
    education: lesson(
      ["surface coating", "upgrade"],
      "A finished component keeps its base structure but gains a new surface.",
    ),
    fantasy: request(["bard", "ranger"], ["advanced", "gear-part"]),
  }),
  recipe({
    id: "alchemy:mirror-glass",
    name: "Mirror Glass",
    output: item("component", "component:mirror-glass", "Mirror Glass"),
    arguments: [arg("material:glass", 1), arg("material:silver-ingot", 1)],
    station: "glassworks",
    action: "assemble",
    progression: progress(10, 3, 5, 0.86),
    education: lesson(
      ["reflection", "coating"],
      "A shiny metal backing turns glass into a mirror in the game model.",
    ),
    fantasy: request(["rogue", "wizard"], ["advanced", "optics"]),
  }),
  recipe({
    id: "alchemy:periscope-mirror",
    name: "Periscope Mirror",
    output: item("component", "component:periscope-mirror", "Periscope Mirror"),
    arguments: [arg("component:mirror-glass", 1), arg("component:glass-tube", 1)],
    station: "workbench",
    action: "assemble",
    progression: progress(10, 4, 7, 0.88),
    education: lesson(
      ["reflection", "geometry"],
      "Mirrors and tubes can redirect a line of sight.",
    ),
    fantasy: request(["rogue", "artificer"], ["advanced", "optics"]),
  }),
  recipe({
    id: "alchemy:knight-repair-kit",
    name: "Knight Repair Kit",
    output: item("equipment", "equipment:knight-repair-kit", "Knight Repair Kit"),
    arguments: [
      arg("component:iron-chain-link", 1),
      arg("component:steel-needle", 1),
      arg("component:wax-seal", 1),
    ],
    station: "workbench",
    action: "assemble",
    progression: progress(10, 5, 5, 0.88),
    education: lesson(
      ["kit composition", "repair parts"],
      "A repair kit bundles fasteners, tools, and sealing material.",
    ),
    fantasy: request(["knight"], ["advanced", "class-order"]),
  }),
  recipe({
    id: "alchemy:purifying-flask",
    name: "Purifying Flask",
    output: item("equipment", "equipment:purifying-flask", "Purifying Flask"),
    arguments: [
      arg("quest:water-flask", 1),
      arg("component:silver-wire", 1),
      arg("material:sea-salt-crystals", 1),
    ],
    station: "enchanter",
    action: "enchant",
    progression: progress(10, 6, 8, 0.9),
    education: lesson(
      ["cross-chain composition", "materials roles"],
      "Combines the flask, salt, and silver chains into one cleric item.",
    ),
    fantasy: request(["cleric"], ["advanced", "class-order", "water-flask-chain"]),
  }),
  recipe({
    id: "alchemy:observation-kit",
    name: "Observation Kit",
    output: item("equipment", "equipment:observation-kit", "Observation Kit"),
    arguments: [
      arg("component:crystal-lens", 1),
      arg("component:periscope-mirror", 1),
      arg("component:inked-quill", 1),
    ],
    station: "workbench",
    action: "assemble",
    progression: progress(10, 7, 9, 0.91),
    education: lesson(
      ["optics", "record keeping"],
      "A kit can combine seeing tools and writing tools.",
    ),
    fantasy: request(["wizard", "artificer"], ["advanced", "class-order", "optics"]),
  }),
  recipe({
    id: "alchemy:signal-mirror",
    name: "Signal Mirror",
    output: item("equipment", "equipment:signal-mirror", "Signal Mirror"),
    arguments: [arg("component:mirror-glass", 1), arg("component:leather-strip", 1)],
    station: "workbench",
    action: "assemble",
    progression: progress(10, 8, 6, 0.88),
    education: lesson(
      ["reflection", "field tool"],
      "A reflective tool can redirect light as a signal.",
    ),
    fantasy: request(["rogue", "ranger"], ["advanced", "class-order", "optics"]),
  }),
  recipe({
    id: "alchemy:stage-sparkle",
    name: "Stage Sparkle",
    output: item("quest-item", "quest:stage-sparkle", "Stage Sparkle"),
    arguments: [
      arg("component:gold-leaf", 1),
      arg("material:blue-glass", 1),
      arg("component:wax-seal", 1),
    ],
    station: "workbench",
    action: "assemble",
    progression: progress(10, 9, 7, 0.89),
    education: lesson(
      ["reflection", "color"],
      "A bard item built from reflective metal and colored glass.",
    ),
    fantasy: request(["bard"], ["advanced", "class-order", "decorative"]),
  }),
  recipe({
    id: "alchemy:calibration-kit",
    name: "Calibration Kit",
    output: item("equipment", "equipment:calibration-kit", "Calibration Kit"),
    arguments: [
      arg("component:circuit-rune", 1),
      arg("component:copper-rivet", 1),
      arg("component:steel-needle", 1),
    ],
    station: "workbench",
    action: "assemble",
    progression: progress(10, 10, 7, 0.92),
    education: lesson(
      ["precision", "tool system"],
      "Artificer tools combine alignment, fastening, and fine points.",
    ),
    fantasy: request(["artificer"], ["advanced", "class-order", "rune"]),
  }),
  recipe({
    id: "alchemy:guild-adventure-crate",
    name: "Guild Adventure Crate",
    output: item("quest-item", "quest:guild-adventure-crate", "Guild Adventure Crate"),
    arguments: [
      arg("equipment:knight-repair-kit", 1),
      arg("equipment:purifying-flask", 1),
      arg("equipment:observation-kit", 1),
      arg("equipment:signal-mirror", 1),
    ],
    station: "workbench",
    action: "assemble",
    progression: progress(10, 11, 10, 0.96),
    education: lesson(
      ["network graph", "systems composition"],
      "A late quest bundle proves that earlier chains can merge into large goals.",
    ),
    fantasy: request(["alchemist-guild", "player"], ["advanced", "capstone", "class-order"]),
  }),
] as const satisfies readonly DeepReadonly<AlchemyRecipe>[];

export type StaticAlchemyRecipe = (typeof ALCHEMY_RECIPES)[number];
export type AlchemyRecipeId = StaticAlchemyRecipe["id"];
export type CraftedAlchemyCardId = StaticAlchemyRecipe["output"]["cardId"];
export type PrimitiveAlchemyCardId =
  | (typeof ELEMENT_CARDS)[number]["id"]
  | (typeof ALCHEMY_GATHERABLE_CARDS)[number]["cardId"];

export const AlchemyRecipesSchema = z
  .array(AlchemyRecipeSchema)
  .min(EXPECTED_MINIMUM_ALCHEMY_RECIPES);

export const ALCHEMY_RECIPE_BY_ID = Object.freeze(
  Object.fromEntries(ALCHEMY_RECIPES.map((currentRecipe) => [currentRecipe.id, currentRecipe])),
) as Readonly<Record<AlchemyRecipeId, StaticAlchemyRecipe>>;

export const ALCHEMY_RECIPE_BY_OUTPUT = Object.freeze(
  Object.fromEntries(
    ALCHEMY_RECIPES.map((currentRecipe) => [currentRecipe.output.cardId, currentRecipe]),
  ),
) as Readonly<Record<CraftedAlchemyCardId, StaticAlchemyRecipe>>;

export const ALCHEMY_PRIMITIVE_CARD_IDS = [
  ...ELEMENT_CARDS.map((elementCard) => elementCard.id),
  ...ALCHEMY_GATHERABLE_CARDS.map((gatherable) => gatherable.cardId),
] as const;

type InternalCardComplexity = {
  primitiveArgumentCount: number;
  cumulativeArgumentCount: number;
  graphDepth: number;
};

function rounded(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function normalize(raw: number, min: number, max: number): number {
  if (max === min) return 0;
  return rounded((raw - min) / (max - min));
}

export function getAlchemyRecipeArgumentSlots(recipe: {
  readonly arguments: readonly AlchemyArgument[];
}): AlchemyArgumentSlot[] {
  const slots: AlchemyArgumentSlot[] = [];

  for (const [sourceArgumentIndex, argument] of recipe.arguments.entries()) {
    for (let quantityIndex = 0; quantityIndex < argument.quantity; quantityIndex += 1) {
      slots.push({
        slotId: `arg:${slots.length}`,
        cardId: argument.cardId,
        sourceArgumentIndex,
        role: argument.role,
      });
    }
  }

  return slots;
}

export function getAlchemyRecipeVisibleSlotCount(recipe: {
  readonly arguments: readonly AlchemyArgument[];
}): number {
  return getAlchemyRecipeArgumentSlots(recipe).length;
}

function buildAlchemyArgumentComplexities(
  recipes: readonly StaticAlchemyRecipe[],
): Readonly<Record<AlchemyRecipeId, AlchemyArgumentComplexity>> {
  const primitiveComplexities = new Map<string, InternalCardComplexity>(
    ALCHEMY_PRIMITIVE_CARD_IDS.map((cardId) => [
      cardId,
      { primitiveArgumentCount: 1, cumulativeArgumentCount: 1, graphDepth: 0 },
    ]),
  );
  const recipeComplexities = new Map<
    AlchemyRecipeId,
    Omit<AlchemyArgumentComplexity, "normalizedComplexity">
  >();

  for (const currentRecipe of recipes) {
    const directArgumentCount = currentRecipe.arguments.reduce(
      (total, argument) => total + argument.quantity,
      0,
    );
    const uniqueArgumentCount = new Set(currentRecipe.arguments.map((argument) => argument.cardId))
      .size;
    let primitiveArgumentCount = 0;
    let cumulativeArgumentCount = 0;
    let maxArgumentDepth = 0;

    for (const argument of currentRecipe.arguments) {
      const argumentComplexity = primitiveComplexities.get(argument.cardId);
      if (!argumentComplexity) {
        throw new Error(`Cannot compute complexity for unknown argument card ${argument.cardId}`);
      }
      primitiveArgumentCount += argumentComplexity.primitiveArgumentCount * argument.quantity;
      cumulativeArgumentCount += argumentComplexity.cumulativeArgumentCount * argument.quantity;
      maxArgumentDepth = Math.max(maxArgumentDepth, argumentComplexity.graphDepth);
    }

    const graphDepth = maxArgumentDepth + 1;
    const rawComplexity = rounded(
      directArgumentCount * 1.4 +
        uniqueArgumentCount * 0.8 +
        primitiveArgumentCount +
        graphDepth * 2,
    );
    const complexity = {
      directArgumentCount,
      uniqueArgumentCount,
      primitiveArgumentCount,
      cumulativeArgumentCount,
      graphDepth,
      rawComplexity,
    };

    recipeComplexities.set(currentRecipe.id, complexity);
    primitiveComplexities.set(currentRecipe.output.cardId, {
      primitiveArgumentCount,
      cumulativeArgumentCount,
      graphDepth,
    });
  }

  const rawValues = Array.from(
    recipeComplexities.values(),
    (complexity) => complexity.rawComplexity,
  );
  const minRaw = Math.min(...rawValues);
  const maxRaw = Math.max(...rawValues);

  return Object.freeze(
    Object.fromEntries(
      Array.from(recipeComplexities.entries(), ([recipeId, complexity]) => [
        recipeId,
        {
          ...complexity,
          normalizedComplexity: normalize(complexity.rawComplexity, minRaw, maxRaw),
        },
      ]),
    ),
  ) as Readonly<Record<AlchemyRecipeId, AlchemyArgumentComplexity>>;
}

export const ALCHEMY_RECIPE_ARGUMENT_COMPLEXITY_BY_ID =
  buildAlchemyArgumentComplexities(ALCHEMY_RECIPES);

export const ALCHEMY_PRIMITIVE_ARGUMENT_COMPLEXITY = {
  directArgumentCount: 1,
  uniqueArgumentCount: 1,
  primitiveArgumentCount: 1,
  cumulativeArgumentCount: 1,
  graphDepth: 0,
  rawComplexity: 1,
  normalizedComplexity: 0,
} as const satisfies AlchemyArgumentComplexity;

function requireAlchemyRecipeArgumentComplexity(
  recipeId: AlchemyRecipeId,
): AlchemyArgumentComplexity {
  const complexity = ALCHEMY_RECIPE_ARGUMENT_COMPLEXITY_BY_ID[recipeId];
  if (!complexity) {
    throw new Error(`Missing alchemy argument complexity for ${recipeId}`);
  }
  return complexity;
}

export function getAlchemyRecipeArgumentComplexity(
  id: string,
): AlchemyArgumentComplexity | undefined {
  return ALCHEMY_RECIPE_ARGUMENT_COMPLEXITY_BY_ID[id as AlchemyRecipeId];
}

export const ALCHEMY_CARD_ARGUMENT_COMPLEXITY_BY_ID = Object.freeze(
  Object.fromEntries([
    ...ALCHEMY_PRIMITIVE_CARD_IDS.map(
      (cardId) => [cardId, ALCHEMY_PRIMITIVE_ARGUMENT_COMPLEXITY] as const,
    ),
    ...ALCHEMY_RECIPES.map(
      (currentRecipe) =>
        [
          currentRecipe.output.cardId,
          requireAlchemyRecipeArgumentComplexity(currentRecipe.id),
        ] as const,
    ),
  ]),
) as Readonly<Record<string, AlchemyArgumentComplexity>>;

export function getAlchemyCardComplexity(cardId: string): AlchemyArgumentComplexity | undefined {
  return ALCHEMY_CARD_ARGUMENT_COMPLEXITY_BY_ID[cardId];
}

export const ALCHEMY_CRAFTED_CARDS = ALCHEMY_RECIPES.map((currentRecipe) => ({
  cardId: currentRecipe.output.cardId,
  type: "crafted" as const,
  name: currentRecipe.output.name,
  kind: currentRecipe.output.kind,
  sourceRecipeId: currentRecipe.id,
  unlockCohort: currentRecipe.progression.cohort,
  imagePath: currentRecipe.output.imagePath,
  complexity: requireAlchemyRecipeArgumentComplexity(currentRecipe.id),
  tags: [...currentRecipe.fantasy.questTags],
})) satisfies readonly AlchemyCraftedCard[];

export const AlchemyCraftedCardsSchema = z
  .array(AlchemyCraftedCardSchema)
  .min(EXPECTED_MINIMUM_ALCHEMY_RECIPES);

export function getAlchemyRecipeById(id: string): StaticAlchemyRecipe | undefined {
  return ALCHEMY_RECIPE_BY_ID[id as AlchemyRecipeId];
}

export function getAlchemyRecipeByOutput(cardId: string): StaticAlchemyRecipe | undefined {
  return ALCHEMY_RECIPE_BY_OUTPUT[cardId as CraftedAlchemyCardId];
}

export function getAlchemyRecipesByArgument(cardId: string): StaticAlchemyRecipe[] {
  return ALCHEMY_RECIPES.filter((currentRecipe) =>
    currentRecipe.arguments.some((argument) => argument.cardId === cardId),
  );
}

export const getAlchemyRecipesByInput = getAlchemyRecipesByArgument;

export function getAlchemyRecipesByCohort(cohort: number): StaticAlchemyRecipe[] {
  return ALCHEMY_RECIPES.filter((currentRecipe) => currentRecipe.progression.cohort === cohort);
}

export function getAlchemyRecipesByRequester(requester: QuestRequester): StaticAlchemyRecipe[] {
  return ALCHEMY_RECIPES.filter((currentRecipe) =>
    (currentRecipe.fantasy.requesters as readonly QuestRequester[]).includes(requester),
  );
}

export function validateAlchemyRecipeGraph(
  recipes: readonly unknown[] = ALCHEMY_RECIPES,
): AlchemyRecipe[] {
  const parsedRecipes = AlchemyRecipesSchema.parse(recipes);
  const recipeIds = new Set<string>();
  const outputCardIds = new Set<string>();
  const knownCardIds = new Set<string>([
    ...ELEMENT_CARDS.map((elementCard) => elementCard.id),
    ...ALCHEMY_GATHERABLE_CARDS.map((gatherable) => gatherable.cardId),
  ]);
  const cohorts = new Map<number, AlchemyProgressionCohort>(
    ALCHEMY_PROGRESSION_COHORTS.map((cohort) => [cohort.cohort, cohort]),
  );

  for (const currentRecipe of parsedRecipes) {
    if (recipeIds.has(currentRecipe.id)) {
      throw new Error(`Duplicate alchemy recipe id: ${currentRecipe.id}`);
    }
    recipeIds.add(currentRecipe.id);

    if (outputCardIds.has(currentRecipe.output.cardId)) {
      throw new Error(`Duplicate alchemy output card id: ${currentRecipe.output.cardId}`);
    }
    outputCardIds.add(currentRecipe.output.cardId);

    const cohort = cohorts.get(currentRecipe.progression.cohort);
    if (!cohort) {
      throw new Error(
        `Unknown alchemy cohort ${currentRecipe.progression.cohort} for ${currentRecipe.id}`,
      );
    }
    if (
      currentRecipe.progression.unlockMinute < cohort.startMinute ||
      currentRecipe.progression.unlockMinute >= cohort.endMinute
    ) {
      throw new Error(`Unlock minute for ${currentRecipe.id} is outside cohort ${cohort.cohort}`);
    }
    const [minComplexity, maxComplexity] = cohort.complexityRange;
    if (
      currentRecipe.progression.normalizedComplexity < minComplexity ||
      currentRecipe.progression.normalizedComplexity > maxComplexity
    ) {
      throw new Error(
        `Progression complexity for ${currentRecipe.id} is outside cohort ${cohort.cohort}`,
      );
    }
    const visibleSlotCount = getAlchemyRecipeVisibleSlotCount(currentRecipe);
    if (visibleSlotCount > ALCHEMY_MAX_TABLE_SLOT_COUNT) {
      throw new Error(
        `Recipe ${currentRecipe.id} needs ${visibleSlotCount} Alchemy Workbench slots, but the max is ${ALCHEMY_MAX_TABLE_SLOT_COUNT}`,
      );
    }

    for (const argument of currentRecipe.arguments) {
      if (!knownCardIds.has(argument.cardId)) {
        throw new Error(`Unknown alchemy argument ${argument.cardId} for ${currentRecipe.id}`);
      }
    }

    knownCardIds.add(currentRecipe.output.cardId);
  }

  return parsedRecipes;
}
