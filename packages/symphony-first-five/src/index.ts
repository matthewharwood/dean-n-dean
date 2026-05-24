import {
  ALCHEMY_STARTING_TABLE_SLOT_COUNT,
  ALCHEMY_TABLE_SLOT_UPGRADES,
  ELEMENT_CARDS,
  getAlchemyQuestById,
  getAlchemyRecipeById,
} from "@dean-stack/schemas";
import * as z from "zod";

export const FIRST_FIVE_MINUTE_SYMPHONY_SPEC_VERSION = "first-five-minutes-v1";

export const FirstFiveIssueAreaSchema = z.enum([
  "architecture",
  "data",
  "gameplay",
  "ui-ux",
  "state",
  "content",
  "feedback",
  "accessibility",
  "qa",
  "performance",
  "workflow",
]);
export type FirstFiveIssueArea = z.infer<typeof FirstFiveIssueAreaSchema>;

export const FirstFiveIssuePrioritySchema = z.enum(["P0", "P1", "P2"]);
export type FirstFiveIssuePriority = z.infer<typeof FirstFiveIssuePrioritySchema>;

export const FirstFiveIssuePhaseSchema = z.enum([
  "0-1 min",
  "1-2 min",
  "2-3 min",
  "3-4 min",
  "4-5 min",
  "cross-cutting",
]);
export type FirstFiveIssuePhase = z.infer<typeof FirstFiveIssuePhaseSchema>;

export const FirstFiveSurfaceKindSchema = z.enum([
  "schema-data",
  "web-component",
  "web-state",
  "canvas",
  "feedback",
  "styles",
  "storybook",
  "test",
  "docs",
  "asset",
  "workflow",
]);
export type FirstFiveSurfaceKind = z.infer<typeof FirstFiveSurfaceKindSchema>;

export const FirstFiveSurfaceSchema = z.object({
  kind: FirstFiveSurfaceKindSchema,
  path: z.string().min(1),
  reason: z.string().min(1),
});
export type FirstFiveSurface = z.infer<typeof FirstFiveSurfaceSchema>;

export const FirstFiveDataAnchorsSchema = z.object({
  quests: z.array(z.string().regex(/^quest:[a-z0-9-]+$/)),
  recipes: z.array(z.string().regex(/^alchemy:[a-z0-9-]+$/)),
  elements: z.array(z.string().regex(/^element:[a-z0-9-]+$/)),
  upgrades: z.array(z.string().regex(/^upgrade:[a-z0-9-]+$/)),
  existingFiles: z.array(z.string().min(1)),
});
export type FirstFiveDataAnchors = z.infer<typeof FirstFiveDataAnchorsSchema>;

export const FirstFiveSkillAtomSchema = z.object({
  action: z.string().min(1),
  simulation: z.string().min(1),
  feedback: z.string().min(1),
  insight: z.string().min(1),
});
export type FirstFiveSkillAtom = z.infer<typeof FirstFiveSkillAtomSchema>;

export const FirstFiveCalvinNotesSchema = z.object({
  humanGoal: z.string().min(1),
  skillAtoms: z.array(FirstFiveSkillAtomSchema).min(1),
  loopArc: z.string().min(1),
  relatedness: z.string().min(1),
  darkPatternRisk: z.string().min(1),
  schemasImplied: z.array(z.string().min(1)),
  storybookProof: z.string().min(1),
  verification: z.array(z.string().min(1)).min(1),
});
export type FirstFiveCalvinNotes = z.infer<typeof FirstFiveCalvinNotesSchema>;

export const FirstFiveSymphonyMetadataSchema = z.object({
  labels: z.array(z.string().min(1)).min(1),
  estimate: z.enum(["S", "M", "L"]),
  dispatchGroup: z.string().min(1),
});
export type FirstFiveSymphonyMetadata = z.infer<typeof FirstFiveSymphonyMetadataSchema>;

export const FirstFiveMinuteIssueSpecSchema = z.object({
  id: z.string().regex(/^F5M-[0-9]{3}$/),
  title: z.string().min(1),
  priority: FirstFiveIssuePrioritySchema,
  area: FirstFiveIssueAreaSchema,
  phase: FirstFiveIssuePhaseSchema,
  playerOutcome: z.string().min(1),
  currentEvidence: z.array(z.string().min(1)).min(1),
  problem: z.string().min(1),
  scope: z.array(z.string().min(1)).min(1),
  outOfScope: z.array(z.string().min(1)),
  dependencies: z.array(z.string().regex(/^F5M-[0-9]{3}$/)),
  acceptanceCriteria: z.array(z.string().min(1)).min(1),
  implementationNotes: z.array(z.string().min(1)).min(1),
  dataAnchors: FirstFiveDataAnchorsSchema,
  surfaces: z.array(FirstFiveSurfaceSchema).min(1),
  calvin: FirstFiveCalvinNotesSchema,
  symphony: FirstFiveSymphonyMetadataSchema,
});
export type FirstFiveMinuteIssueSpec = z.infer<typeof FirstFiveMinuteIssueSpecSchema>;

type DeepReadonly<T> = T extends readonly (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

const issue = <const T extends DeepReadonly<FirstFiveMinuteIssueSpec>>(value: T) => value;

const firstWaterAnchors = {
  quests: ["quest:first-water"],
  recipes: ["alchemy:water"],
  elements: ["element:h", "element:o", "element:c"],
  upgrades: ["upgrade:table-slot-4"],
  existingFiles: [
    "packages/schemas/src/data/alchemy-quests.ts",
    "packages/schemas/src/data/alchemy-recipes.ts",
    "packages/schemas/src/data/element-cards.ts",
    "apps/web/app/components/alchemist-guild-board/index.tsx",
  ],
} satisfies DeepReadonly<FirstFiveDataAnchors>;

const baseLabels = ["first-five-minutes", "elemental-guild"];

export const FIRST_FIVE_MINUTE_ISSUES = [
  issue({
    id: "F5M-001",
    title: "Define the first-five-minute gameplay state contract",
    priority: "P0",
    area: "architecture",
    phase: "cross-cutting",
    playerOutcome:
      "Progress survives reloads while the child moves through the Water tutorial and first unlock.",
    currentEvidence: [
      "The board atom currently stores only slotted element IDs.",
      "The design bible requires unlocked elements, active quests, timers, queue, upgrades, inventory, and last opened time to persist.",
    ],
    problem:
      "The first playable loop needs a single persisted state model before UI can safely consume tutorial progress, inventory, timers, and rewards.",
    scope: [
      "Create Zod schemas for first-session progress, inventory, active craft, completed quests, owned upgrades, currencies, and selected Discovery Draft choices.",
      "Add defaults that seed the game with Hydrogen, Oxygen, Carbon, quest:first-water, three visible table slots, empty inventory, and no active craft.",
      "Expose pure selectors for visible table slot count, first active quest, and whether the Water tutorial is complete.",
    ],
    outOfScope: [
      "Full long-term economy balancing.",
      "All later quest branches beyond the first post-tutorial board state.",
    ],
    dependencies: [],
    acceptanceCriteria: [
      "A new persisted state schema can parse an empty object into the exact tutorial starting state.",
      "The starting state uses three visible table slots from the schema constant.",
      "Hydrogen, Oxygen, Carbon, quest:first-water, and alchemy:water are all represented through existing data IDs.",
      "State migration or defaulting is covered by Bun unit tests.",
    ],
    implementationNotes: [
      "Keep the state in packages/schemas if it is shared, then consume it through apps/web IDB atoms.",
      "Do not let Pixi DisplayObjects own gameplay state.",
      "Avoid adding hand-written TypeScript types outside Zod inference.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "schema-data",
        path: "packages/schemas/src/index.ts",
        reason: "Existing IDB-backed board schemas live here.",
      },
      {
        kind: "web-state",
        path: "apps/web/app/state/atoms.ts",
        reason: "The app persists gameplay state through Jotai atoms.",
      },
    ],
    calvin: {
      humanGoal: "Make the first session feel continuous and safe even during live reload.",
      skillAtoms: [
        {
          action: "The player starts or reloads the board.",
          simulation: "The game hydrates the same tutorial state from IDB.",
          feedback: "The same quest, slots, cards, and timer appear.",
          insight: "The workshop remembers my progress.",
        },
      ],
      loopArc: "This is the substrate for the micro craft loop and the five-minute tutorial arc.",
      relatedness:
        "A parent can refresh during development without erasing the child's accomplishment.",
      darkPatternRisk:
        "Avoid streak language or fear of loss; persistence is comfort, not pressure.",
      schemasImplied: [
        "ElementalGuildProgressSchema",
        "ElementalGuildInventorySchema",
        "ElementalGuildCraftQueueSchema",
      ],
      storybookProof: "A HydratedTutorialBoard story receives a parsed default state.",
      verification: ["Bun schema tests", "Manual reload after starting a craft"],
    },
    symphony: {
      labels: [...baseLabels, "architecture", "idb"],
      estimate: "L",
      dispatchGroup: "foundation",
    },
  }),
  issue({
    id: "F5M-002",
    title: "Build the tutorial state reducer and selectors",
    priority: "P0",
    area: "state",
    phase: "cross-cutting",
    playerOutcome:
      "Every tutorial action has one predictable result and can be unit tested without the browser.",
    currentEvidence: [
      "Alchemy quest and recipe data already define the Water tutorial.",
      "The current UI has drag state, but no gameplay reducer for craft validation, rewards, or quest completion.",
    ],
    problem:
      "Without a reducer, UI event handlers will encode rules ad hoc and the first E2E loop will be brittle.",
    scope: [
      "Implement pure reducer actions for placing cards, removing cards, starting a craft, finishing a craft, collecting output, delivering Water, claiming rewards, buying slot IV, and choosing a Discovery Draft option.",
      "Implement selectors for current quest, missing ingredients, craftability, pending reward, visible slots, and next available quests.",
      "Return friendly error codes for invalid craft attempts instead of throwing during normal play.",
    ],
    outOfScope: ["Animation timing", "Pointer gesture implementation", "Playwright tests"],
    dependencies: ["F5M-001"],
    acceptanceCriteria: [
      "Reducer tests can execute the full first-five-minute sequence from default state to post-discovery state.",
      "Invalid card combinations produce a hintable fizzle state and do not lose cards.",
      "The reducer never references DOM, Pixi, timers, or browser APIs.",
    ],
    implementationNotes: [
      "Use existing recipe IDs and quest IDs as reducer inputs.",
      "Separate wall-clock timer reconciliation from immediate reducer actions.",
      "Keep reward application idempotent so refreshes cannot double-grant rewards.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "schema-data",
        path: "packages/schemas/src/data/alchemy-quests.ts",
        reason: "Quest rewards and first Discovery Draft are defined here.",
      },
      {
        kind: "test",
        path: "apps/web/app/alchemy-quest-graph.test.ts",
        reason: "Existing graph tests show the local Bun test pattern.",
      },
    ],
    calvin: {
      humanGoal: "Turn chemistry learning into a chain of reliable actions.",
      skillAtoms: [
        {
          action: "The player drops H, H, and O into slots.",
          simulation: "Selectors recognize the Water recipe.",
          feedback: "The Craft button becomes ready.",
          insight: "Counting atoms changes what the table can make.",
        },
      ],
      loopArc: "The reducer owns the complete micro loop: arrange, test, craft, collect, deliver.",
      relatedness:
        "Professor Atomwick can react consistently because state transitions are explicit.",
      darkPatternRisk:
        "Do not hide rules to force trial-and-error grinding; expose helpful recipe hints.",
      schemasImplied: ["ElementalGuildActionSchema", "ElementalGuildCraftResultSchema"],
      storybookProof: "A ReducerHarness story can jump between tutorial states.",
      verification: ["Bun reducer tests for the full sequence", "Fizzle tests"],
    },
    symphony: {
      labels: [...baseLabels, "state", "gameplay"],
      estimate: "L",
      dispatchGroup: "foundation",
    },
  }),
  issue({
    id: "F5M-003",
    title: "Replace placeholder panels with the first-session board layout",
    priority: "P0",
    area: "ui-ux",
    phase: "0-1 min",
    playerOutcome:
      "The opening screen reads like a playable iPad board: quest, vault, table, inventory, and actions are visible.",
    currentEvidence: [
      "The current AlchemistGuildBoard has placeholder left and right panels.",
      "The design bible calls for one board screen with Quest Board, Crafting Table, Periodic Table Vault, Inventory Tray, and Upgrade Shop.",
    ],
    problem:
      "The player cannot understand the first loop while core board zones are empty placeholders.",
    scope: [
      "Design the first-session responsive board layout around the existing Pixi table dock and workbench.",
      "Add named zones for Quest Board, Periodic Table Vault, Crafting Table, Inventory Tray, Upgrade Shop, and Discovery Draft entry.",
      "Keep all hit targets large enough for iPad touch.",
    ],
    outOfScope: ["Final art pass", "All later board zones", "Quest branching beyond first session"],
    dependencies: ["F5M-001"],
    acceptanceCriteria: [
      "The board has no empty grey placeholder panels in the first-session story.",
      "The Water quest, three starter elements, three visible table slots, inventory/output area, and reward area are discoverable without scrolling on iPad landscape.",
      "Mobile portrait falls back to a readable stacked layout without text overlap.",
    ],
    implementationNotes: [
      "Follow existing component and schema patterns.",
      "Do not nest UI cards inside other cards.",
      "Use quiet operational styling rather than a marketing layout.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "web-component",
        path: "apps/web/app/components/alchemist-guild-board/index.tsx",
        reason: "Current board component owns the main layout.",
      },
      {
        kind: "styles",
        path: "apps/web/app/styles",
        reason: "Board layout and responsive constraints must remain lint-clean.",
      },
    ],
    calvin: {
      humanGoal: "Let the child see the whole toy before being asked to act.",
      skillAtoms: [
        {
          action: "The player scans the board.",
          simulation: "Zones are spatially grouped by purpose.",
          feedback: "The first quest and glowing starter elements draw attention.",
          insight: "I know where to get cards and where to put them.",
        },
      ],
      loopArc: "This frames the five-minute arc as a board-game turn instead of a menu maze.",
      relatedness: "A shared iPad board gives parent and child common pointing language.",
      darkPatternRisk:
        "Avoid noisy notification badges; guide attention with layout and gentle glow.",
      schemasImplied: ["AlchemistGuildBoardPropsSchema"],
      storybookProof: "FirstSessionBoard story at iPad landscape and mobile portrait sizes.",
      verification: ["Storybook visual check", "Biome and Stylelint"],
    },
    symphony: {
      labels: [...baseLabels, "ui-ux", "board"],
      estimate: "L",
      dispatchGroup: "ui-foundation",
    },
  }),
  issue({
    id: "F5M-004",
    title: "Create the Water quest card and tutorial briefing",
    priority: "P0",
    area: "content",
    phase: "0-1 min",
    playerOutcome:
      "Professor Atomwick and Sir Bubbleton clearly ask for Water and explain H2O in child-readable terms.",
    currentEvidence: [
      "quest:first-water already contains need, hint, completion, and requester data.",
      "No quest card UI currently renders that narrative on the board.",
    ],
    problem:
      "The first action has no authored context unless the quest data is surfaced in the UI.",
    scope: [
      "Render a quest card for quest:first-water with requester, title, need, hint, and reward preview.",
      "Add a short tutorial briefing that points to H, H, and O without requiring a manual.",
      "Support collapsed and expanded states so the card does not dominate the board after the player starts acting.",
    ],
    outOfScope: ["Full NPC dialogue tree", "Voiceover", "All quest board sorting"],
    dependencies: ["F5M-003"],
    acceptanceCriteria: [
      "The quest card shows Sir Bubbleton Needs Water from quest data.",
      "The hint teaches Water is H2O: two Hydrogen and one Oxygen.",
      "Reward preview includes Gold, Knowledge XP, Discovery Token, and slot IV shop unlock.",
    ],
    implementationNotes: [
      "Use data from alchemy-quests rather than duplicating strings in the component.",
      "Keep copy short enough for a fourth grader and iPad card bounds.",
      "Make the info affordance separate from the primary Craft action.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "web-component",
        path: "apps/web/app/components",
        reason: "Quest card should be a Storybook-first component.",
      },
      {
        kind: "schema-data",
        path: "packages/schemas/src/data/alchemy-quests.ts",
        reason: "Water quest narrative and rewards are defined here.",
      },
    ],
    calvin: {
      humanGoal: "Transform 'make water' from a worksheet into helping a funny knight.",
      skillAtoms: [
        {
          action: "The player reads or hears the quest need.",
          simulation: "The game highlights the recipe clue.",
          feedback: "The Water goal appears as a concrete request.",
          insight: "The formula is a mission plan, not homework.",
        },
      ],
      loopArc: "Quest need starts the first five-minute arc; completion closes it with gratitude.",
      relatedness: "Sir Bubbleton gives the child a character to help instead of an abstract task.",
      darkPatternRisk: "Do not use shame if the child ignores the quest; keep it inviting.",
      schemasImplied: ["AlchemyQuestCardPropsSchema"],
      storybookProof: "WaterQuestCard/Default and WaterQuestCard/HintOpen stories.",
      verification: ["Storybook visual check", "Unit test for quest-data projection"],
    },
    symphony: {
      labels: [...baseLabels, "content", "quest"],
      estimate: "M",
      dispatchGroup: "tutorial",
    },
  }),
  issue({
    id: "F5M-005",
    title: "Expose the starter Periodic Table Vault with Hydrogen, Oxygen, and Carbon",
    priority: "P0",
    area: "ui-ux",
    phase: "0-1 min",
    playerOutcome:
      "The child sees exactly the three starter elements and understands which two are needed for Water.",
    currentEvidence: [
      "element-cards.ts contains all periodic element cards and art paths.",
      "The current Pixi periodic table scene renders element cards but is not tied to first-session unlock state.",
    ],
    problem:
      "Showing too many elements in minute one overwhelms the player and weakens the H2O memory.",
    scope: [
      "Filter the vault to unlocked starter elements for the tutorial state.",
      "Show locked or fogged cells only if they strengthen the sense of future discovery without adding clutter.",
      "Provide tap/long-press inspection for starter elements with symbol, name, and why they matter for Water.",
    ],
    outOfScope: ["Full periodic table overlays", "Element family education beyond H/O/C"],
    dependencies: ["F5M-003"],
    acceptanceCriteria: [
      "Hydrogen, Oxygen, and Carbon are available at start.",
      "Hydrogen and Oxygen are visually linked to the Water quest.",
      "Carbon remains visible as a curiosity but does not distract from the Water recipe.",
    ],
    implementationNotes: [
      "Use ELEMENT_CARDS and persisted unlocked element IDs.",
      "Avoid hard-coding element metadata in the component.",
      "Preserve Pixi side-channel discipline.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "canvas",
        path: "apps/web/app/components/alchemist-guild-board/periodic-table-scene.ts",
        reason: "Existing Pixi scene renders the table cards.",
      },
      {
        kind: "schema-data",
        path: "packages/schemas/src/data/element-cards.ts",
        reason: "Element metadata and art paths live here.",
      },
    ],
    calvin: {
      humanGoal: "Make the periodic table feel like a tiny glowing map, not a wall of facts.",
      skillAtoms: [
        {
          action: "The player looks for Hydrogen and Oxygen.",
          simulation: "Only starter cards are active.",
          feedback: "Needed cards glow or pulse near the quest.",
          insight: "Some elements are unlocked now, more will come later.",
        },
      ],
      loopArc:
        "The vault creates the promise of macro collection while serving the micro Water craft.",
      relatedness: "Parent and child can point at symbols and say the names together.",
      darkPatternRisk: "Do not tease locked elements with paid or time-pressure language.",
      schemasImplied: ["UnlockedElementVaultSchema", "ElementVaultPropsSchema"],
      storybookProof: "StarterPeriodicTableVault story with H/O/C unlocked.",
      verification: ["Storybook canvas check", "Reduced-motion check"],
    },
    symphony: {
      labels: [...baseLabels, "ui-ux", "pixi", "elements"],
      estimate: "L",
      dispatchGroup: "tutorial",
    },
  }),
  issue({
    id: "F5M-006",
    title: "Add starter element inspection and info affordances",
    priority: "P1",
    area: "content",
    phase: "0-1 min",
    playerOutcome:
      "The child can tap Hydrogen or Oxygen and get a tiny useful explanation without leaving the loop.",
    currentEvidence: [
      "Element cards already include metadata, visuals, and art.",
      "The board does not yet provide a readable inspection surface for element details.",
    ],
    problem:
      "The first five minutes should teach just enough science, but modal-heavy explanations can derail crafting.",
    scope: [
      "Add an info button or long-press panel for starter elements.",
      "Show symbol, name, one fourth-grade fact, and current recipe use.",
      "Keep the panel dismissible and non-blocking.",
    ],
    outOfScope: ["Full element encyclopedia", "All kid-info recipe copy wiring"],
    dependencies: ["F5M-005"],
    acceptanceCriteria: [
      "Hydrogen and Oxygen inspection mentions their role in Water.",
      "The panel is readable on iPad and mobile.",
      "Opening inspection does not mutate game progress.",
    ],
    implementationNotes: [
      "Prefer existing element metadata and image paths.",
      "Use icons and accessible labels for info affordances.",
      "Persist no state except optional last-inspected card if later needed.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "web-component",
        path: "apps/web/app/components",
        reason: "Inspection should be componentized and story-backed.",
      },
      {
        kind: "schema-data",
        path: "packages/schemas/src/data/element-cards.ts",
        reason: "Element metadata should be the source of truth.",
      },
    ],
    calvin: {
      humanGoal: "Give curiosity a small door without pulling the child out of play.",
      skillAtoms: [
        {
          action: "The player taps an info icon.",
          simulation: "The game reads element metadata.",
          feedback: "A small fact panel appears.",
          insight: "The card is both a toy and a real element.",
        },
      ],
      loopArc: "Inspection is optional flavor inside the micro loop, not a required step.",
      relatedness: "A parent can read one fact aloud and return to crafting quickly.",
      darkPatternRisk:
        "Avoid trivia overload as a gate; facts should reward curiosity, not block progress.",
      schemasImplied: ["ElementInspectionPanelPropsSchema"],
      storybookProof: "ElementInspectionPanel/Hydrogen and /Oxygen stories.",
      verification: ["Storybook interaction check", "A11y label check"],
    },
    symphony: {
      labels: [...baseLabels, "content", "ui-ux"],
      estimate: "M",
      dispatchGroup: "tutorial",
    },
  }),
  issue({
    id: "F5M-007",
    title: "Connect vault card dragging to persisted workbench slots",
    priority: "P0",
    area: "gameplay",
    phase: "1-2 min",
    playerOutcome:
      "The child can physically place Hydrogen, Hydrogen, and Oxygen into the starter table.",
    currentEvidence: [
      "The current board has draggable element cards and five reagent slot IDs.",
      "Gameplay placement is not yet constrained by unlocked elements or current visible slot count.",
    ],
    problem:
      "The H2O learning moment only works if dragging cards into slots is tactile, stable, and persisted.",
    scope: [
      "Wire vault drag/drop events to the first-session reducer.",
      "Allow duplicate Hydrogen placement from the vault if the recipe needs two Hydrogen cards.",
      "Prevent use of hidden locked slots before the slot IV upgrade is purchased.",
    ],
    outOfScope: ["Inventory drag source", "Quest delivery drag target"],
    dependencies: ["F5M-002", "F5M-005"],
    acceptanceCriteria: [
      "H, H, O can be placed into the three visible starter slots.",
      "Dropping onto an occupied slot swaps or returns predictably.",
      "Reloading after placement restores the slotted cards.",
      "Slot IV and V are unavailable before their upgrades.",
    ],
    implementationNotes: [
      "Separate pointer animation state from persisted slot contents.",
      "Use reducer actions for the gameplay effect.",
      "Keep touch events compatible with iPad Safari.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "web-component",
        path: "apps/web/app/components/alchemist-guild-board/index.tsx",
        reason: "Existing drag logic lives in the board component.",
      },
      {
        kind: "web-state",
        path: "apps/web/app/state/atoms.ts",
        reason: "Slotted card state must persist through IDB-backed atoms.",
      },
    ],
    calvin: {
      humanGoal: "Make H2O a body memory: two drags for H, one drag for O.",
      skillAtoms: [
        {
          action: "The player drags a card to a slot.",
          simulation: "The reducer records the placement.",
          feedback: "The card snaps into a stable table position.",
          insight: "The recipe is built by counting visible cards.",
        },
      ],
      loopArc: "This is the core second-to-second interaction.",
      relatedness: "Parent can coach by saying 'one more Hydrogen' while watching the board.",
      darkPatternRisk: "Do not punish imprecise drops; return cards gently with a hint.",
      schemasImplied: ["WorkbenchPlacementActionSchema"],
      storybookProof: "WorkbenchSlots/StarterDragState story.",
      verification: ["Bun reducer tests", "Manual touch drag check"],
    },
    symphony: {
      labels: [...baseLabels, "gameplay", "drag-drop"],
      estimate: "L",
      dispatchGroup: "crafting",
    },
  }),
  issue({
    id: "F5M-008",
    title: "Render locked and unlocked workbench slots clearly",
    priority: "P0",
    area: "ui-ux",
    phase: "1-2 min",
    playerOutcome:
      "The child understands why only three slots are available at the start and sees that more can be earned.",
    currentEvidence: [
      "The current workbench renders all five reagent slots.",
      "The updated design requires three starting slots and purchased upgrades to four and five.",
    ],
    problem:
      "Rendering all five slots as usable undermines the Water tutorial and slot-upgrade progression.",
    scope: [
      "Show three active slots at start and two locked upgrade silhouettes.",
      "Label locked slot IV as a shop unlock after Water.",
      "Keep the layout stable when slot IV becomes active.",
    ],
    outOfScope: ["Slot V purchase flow", "Mid-game five-slot recipe tutorial"],
    dependencies: ["F5M-003", "F5M-007"],
    acceptanceCriteria: [
      "The starter state exposes exactly three droppable slots.",
      "Locked slots cannot receive cards.",
      "Slot IV activation does not resize the whole workbench unexpectedly.",
    ],
    implementationNotes: [
      `Use ALCHEMY_STARTING_TABLE_SLOT_COUNT (${ALCHEMY_STARTING_TABLE_SLOT_COUNT}) as the source of truth.`,
      "Use iconography or lock state rather than long explanatory text.",
      "Avoid layout shift during hover, drag, and unlock states.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "web-component",
        path: "apps/web/app/components/alchemist-guild-board/index.tsx",
        reason: "The workbench slot rendering exists in this component.",
      },
      {
        kind: "schema-data",
        path: "packages/schemas/src/data/alchemy-recipes.ts",
        reason: "Starting and max slot constants live with recipes.",
      },
    ],
    calvin: {
      humanGoal: "Turn limitation into a visible promise of growth.",
      skillAtoms: [
        {
          action: "The player tries to read the table capacity.",
          simulation: "The UI compares owned slots to total slots.",
          feedback: "Three slots glow; two are locked but visible.",
          insight: "I can craft Water now and earn a bigger table later.",
        },
      ],
      loopArc: "Slot limitation is the mechanical tension of the whole tutorial.",
      relatedness: "Sir Bubbleton's reward can feel generous because it changes the board.",
      darkPatternRisk: "Do not frame locked slots as paid scarcity.",
      schemasImplied: ["WorkbenchSlotViewStateSchema"],
      storybookProof: "WorkbenchSlots/ThreeUnlockedTwoLocked and /FourUnlocked stories.",
      verification: ["Storybook viewport checks", "Reducer slot-cap tests"],
    },
    symphony: {
      labels: [...baseLabels, "ui-ux", "workbench"],
      estimate: "M",
      dispatchGroup: "crafting",
    },
  }),
  issue({
    id: "F5M-009",
    title: "Implement Water recipe matching and recipe ghost hints",
    priority: "P0",
    area: "gameplay",
    phase: "1-2 min",
    playerOutcome:
      "The table recognizes H + H + O as Water and softly guides the child when one atom is missing.",
    currentEvidence: [
      "alchemy:water exists in the recipe graph.",
      "The design bible says recipe ghosts should eventually show translucent required cards.",
    ],
    problem: "A child needs immediate feedback that their arrangement is becoming a real recipe.",
    scope: [
      "Match visible workbench contents against alchemy:water.",
      "Show recipe ghost placeholders for missing Water inputs while quest:first-water is active.",
      "Make duplicate Hydrogen requirements visually understandable.",
    ],
    outOfScope: ["Complete recipe book", "Unknown recipe discovery search across all recipes"],
    dependencies: ["F5M-002", "F5M-008"],
    acceptanceCriteria: [
      "H + H + O enables crafting Water regardless of slot order.",
      "H + O shows one missing Hydrogen hint.",
      "H + H + C does not craft Water and can produce a helpful fizzle hint.",
    ],
    implementationNotes: [
      "Use recipe argument data instead of hard-coded formula matching.",
      "Keep hints deterministic and short.",
      "Show formula text only after the visual card-count hint is present.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "schema-data",
        path: "packages/schemas/src/data/alchemy-recipes.ts",
        reason: "Recipe inputs and output card are defined here.",
      },
      {
        kind: "web-component",
        path: "apps/web/app/components",
        reason: "Recipe ghost UI should be componentized.",
      },
    ],
    calvin: {
      humanGoal: "Make formula reading feel like solving a tiny picture puzzle.",
      skillAtoms: [
        {
          action: "The player changes a slot.",
          simulation: "The recipe matcher compares card counts.",
          feedback: "Ghosts update and the craft state changes.",
          insight: "Water needs exactly two Hydrogen and one Oxygen.",
        },
      ],
      loopArc: "This is the aha beat before the first craft timer starts.",
      relatedness: "The hint lets a parent ask 'what is missing?' instead of giving the answer.",
      darkPatternRisk:
        "Do not obscure the solution to stretch time; the tutorial should teach quickly.",
      schemasImplied: ["RecipeMatchStateSchema", "RecipeGhostPropsSchema"],
      storybookProof: "RecipeGhosts/WaterMissingHydrogen and /WaterReady stories.",
      verification: ["Bun recipe matcher tests", "Storybook visual check"],
    },
    symphony: {
      labels: [...baseLabels, "gameplay", "recipe"],
      estimate: "L",
      dispatchGroup: "crafting",
    },
  }),
  issue({
    id: "F5M-010",
    title: "Add Craft and Fizzle outcomes for the starter table",
    priority: "P0",
    area: "feedback",
    phase: "1-2 min",
    playerOutcome:
      "The child can confidently tap Craft when ready and gets a kind hint when the recipe is wrong.",
    currentEvidence: [
      "The current workbench has a Swipe to transmute pad but no recipe result behavior.",
      "The design bible says wrong recipes create hints, not failure screens.",
    ],
    problem: "The first craft action needs a clear success path and a non-punitive invalid path.",
    scope: [
      "Replace or adapt the transmutation pad into a clear Craft action for the first session.",
      "Start a Water craft when recipe matching succeeds.",
      "Show a fizzle hint and return cards when the recipe is invalid.",
    ],
    outOfScope: ["Complex station-specific actions", "Batch crafting"],
    dependencies: ["F5M-009"],
    acceptanceCriteria: [
      "Craft is disabled or visibly not-ready until a valid Water recipe is present.",
      "Tapping Craft with H + H + O starts the craft timer.",
      "Invalid craft attempts preserve or return cards and show one helpful hint.",
    ],
    implementationNotes: [
      "Do not make the first tutorial require a swipe gesture unless usability testing proves it.",
      "Use button state and concise copy for clarity.",
      "Fizzle feedback should respect reduced motion.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "web-component",
        path: "apps/web/app/components/alchemist-guild-board/index.tsx",
        reason: "The current transmutation pad lives in the workbench.",
      },
      {
        kind: "feedback",
        path: "apps/web/app/sound",
        reason: "Success and fizzle sounds should reuse the existing sound layer.",
      },
    ],
    calvin: {
      humanGoal: "Make trying safe and succeeding satisfying.",
      skillAtoms: [
        {
          action: "The player taps Craft.",
          simulation: "The game resolves recipe state.",
          feedback: "Water begins crafting or a soft fizzle explains the miss.",
          insight: "The table tests my molecule plan.",
        },
      ],
      loopArc: "Craft is the commitment beat between planning and waiting.",
      relatedness: "Sir Bubbleton can react to wrong attempts gently through tutorial copy.",
      darkPatternRisk: "No harsh failure, no card loss, no timer penalty for tutorial mistakes.",
      schemasImplied: ["CraftButtonPropsSchema", "FizzleHintSchema"],
      storybookProof: "CraftPad/ReadyWater and /FizzleHint stories.",
      verification: ["Bun reducer tests", "Reduced-motion Storybook check"],
    },
    symphony: {
      labels: [...baseLabels, "feedback", "crafting"],
      estimate: "M",
      dispatchGroup: "crafting",
    },
  }),
  issue({
    id: "F5M-011",
    title: "Implement the first craft timer and one-slot queue",
    priority: "P0",
    area: "gameplay",
    phase: "2-3 min",
    playerOutcome:
      "Water takes a short, visible amount of time to craft, introducing the idle promise without boredom.",
    currentEvidence: [
      "The design bible calls for a 20-second tutorial Water timer.",
      "No active craft timer or queue state exists in the current board.",
    ],
    problem: "The idle layer cannot be proven until a real craft runs across time and reloads.",
    scope: [
      "Start a single active Water craft with start and finish timestamps.",
      "Display a readable timer/progress bar.",
      "Reconcile completed crafts on hydration using wall-clock time.",
    ],
    outOfScope: ["Multi-slot queue upgrades", "Long offline production"],
    dependencies: ["F5M-010"],
    acceptanceCriteria: [
      "Water craft duration is short enough for the first five minutes.",
      "Reloading mid-craft shows the correct remaining or completed state.",
      "The craft cannot be started twice from the same cards.",
    ],
    implementationNotes: [
      "Store timestamps in IDB-backed state, not component-local state.",
      "Use a display ticker only for visual countdown.",
      "Prefer deterministic test clocks for unit tests.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "web-state",
        path: "apps/web/app/state",
        reason: "Timer state must survive hot reload.",
      },
      {
        kind: "web-component",
        path: "apps/web/app/components",
        reason: "Timer display should be reusable for later queue work.",
      },
    ],
    calvin: {
      humanGoal: "Teach waiting as anticipation, not obstruction.",
      skillAtoms: [
        {
          action: "The player starts crafting Water.",
          simulation: "A timestamped timer counts down.",
          feedback: "Progress moves and Water appears when time finishes.",
          insight: "The workshop can keep working after I start a craft.",
        },
      ],
      loopArc: "This introduces the meso loop while keeping the first arc under five minutes.",
      relatedness: "The timer gives parent and child a moment to inspect inventory together.",
      darkPatternRisk: "Do not add accelerators, ads, or pressure prompts.",
      schemasImplied: ["ActiveCraftSchema", "CraftQueueSchema"],
      storybookProof: "CraftTimer/RunningWater and /CompletedWater stories.",
      verification: ["Bun timer reconciliation tests", "Manual reload mid-timer"],
    },
    symphony: {
      labels: [...baseLabels, "gameplay", "timer", "idb"],
      estimate: "L",
      dispatchGroup: "crafting",
    },
  }),
  issue({
    id: "F5M-012",
    title: "Create the output tray and collect Water flow",
    priority: "P0",
    area: "ui-ux",
    phase: "2-3 min",
    playerOutcome: "When the timer finishes, Water becomes a real card the child can collect.",
    currentEvidence: [
      "The design bible specifies an Output Tray where completed crafts land first.",
      "The current output slot is an empty placeholder.",
    ],
    problem:
      "Craft completion needs a visible object transition before inventory and delivery make sense.",
    scope: [
      "Render a completed Water output card with image, name, and formula.",
      "Allow tapping or dragging the output into inventory.",
      "Show a clear empty state while crafting is still running.",
    ],
    outOfScope: ["Auto-sort assistant", "Multiple output slots"],
    dependencies: ["F5M-011"],
    acceptanceCriteria: [
      "Finished Water appears in the output tray.",
      "Collecting Water moves one Water card into inventory.",
      "Collected output cannot be collected twice after reload.",
    ],
    implementationNotes: [
      "Use alchemy crafted card image paths from recipe data.",
      "Keep output tray dimensions stable across empty, running, and complete states.",
      "Make collection input work by tap and drag if practical.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "web-component",
        path: "apps/web/app/components/alchemist-guild-board/index.tsx",
        reason: "The current output slot is in the workbench grid.",
      },
      {
        kind: "asset",
        path: "apps/web/public/alchemy-card-art",
        reason: "Crafted card art should appear on the output card.",
      },
    ],
    calvin: {
      humanGoal: "Turn completion into a tactile reward, not just a number change.",
      skillAtoms: [
        {
          action: "The player collects the finished card.",
          simulation: "The output moves into inventory state.",
          feedback: "Water card slides or stamps into the tray.",
          insight: "Crafting creates a usable object.",
        },
      ],
      loopArc: "Output closes the timer wait and reopens player agency.",
      relatedness: "Sir Bubbleton's need is now physically visible as a card.",
      darkPatternRisk: "Do not hide completed output behind a notification queue.",
      schemasImplied: ["OutputTrayStateSchema", "CraftedCardViewSchema"],
      storybookProof: "OutputTray/Empty, /Running, and /WaterReady stories.",
      verification: ["Bun collect-output tests", "Storybook visual check"],
    },
    symphony: {
      labels: [...baseLabels, "ui-ux", "inventory"],
      estimate: "M",
      dispatchGroup: "inventory",
    },
  }),
  issue({
    id: "F5M-013",
    title: "Implement first-session inventory with soft capacity",
    priority: "P0",
    area: "state",
    phase: "2-3 min",
    playerOutcome: "The child has a clear place where Water lives before being delivered.",
    currentEvidence: [
      "The design bible starts inventory at five slots and uses an Output Tray for finished crafts.",
      "No inventory surface exists in the current board.",
    ],
    problem:
      "Delivery, selling, and future planning need inventory, but the first tutorial must not be blocked by capacity friction.",
    scope: [
      "Add persisted inventory slots or stacks for first-session items.",
      "Collect Water into inventory.",
      "Display at least five inventory spaces and a gentle full-state message.",
    ],
    outOfScope: ["Sell bin", "Categories", "Bulk inventory upgrades"],
    dependencies: ["F5M-012"],
    acceptanceCriteria: [
      "Inventory starts empty and can hold tutorial Water.",
      "Water remains in inventory after reload.",
      "Inventory full state never destroys completed tutorial output.",
    ],
    implementationNotes: [
      "Use stable item IDs and quantities rather than duplicating recipe objects.",
      "Do not add heavy drag complexity if tap-to-collect and drag-to-deliver is enough for MVP.",
      "Leave room for later pinned quest items.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "web-state",
        path: "apps/web/app/state",
        reason: "Inventory is progress and must persist.",
      },
      {
        kind: "web-component",
        path: "apps/web/app/components",
        reason: "Inventory tray needs a story and reusable item cells.",
      },
    ],
    calvin: {
      humanGoal: "Make crafted progress feel owned before it is spent.",
      skillAtoms: [
        {
          action: "The player collects Water.",
          simulation: "Inventory receives one Water item.",
          feedback: "A Water card appears in the tray.",
          insight: "Crafted things can be stored and used later.",
        },
      ],
      loopArc: "Inventory bridges craft completion to quest delivery.",
      relatedness: "The child can show the Water card to the parent before giving it away.",
      darkPatternRisk: "Capacity should create planning later, not early anxiety.",
      schemasImplied: ["ElementalGuildInventorySchema", "InventoryTrayPropsSchema"],
      storybookProof: "InventoryTray/Empty and /OneWater stories.",
      verification: ["Bun inventory reducer tests", "Storybook visual check"],
    },
    symphony: {
      labels: [...baseLabels, "state", "inventory"],
      estimate: "L",
      dispatchGroup: "inventory",
    },
  }),
  issue({
    id: "F5M-014",
    title: "Implement Water delivery to Sir Bubbleton",
    priority: "P0",
    area: "gameplay",
    phase: "3-4 min",
    playerOutcome: "The child gives Water to the quest-giver and sees that the town responds.",
    currentEvidence: [
      "quest:first-water contains completion copy and rewards.",
      "No quest delivery action exists in the current board.",
    ],
    problem:
      "The first loop is incomplete until crafted Water satisfies the quest and changes progress.",
    scope: [
      "Add delivery interaction from inventory Water to the Water quest card.",
      "Mark quest:first-water complete exactly once.",
      "Remove or consume one Water from inventory when delivered.",
    ],
    outOfScope: ["Partial deliveries for bulk quests", "Multiple active quest delivery targets"],
    dependencies: ["F5M-004", "F5M-013"],
    acceptanceCriteria: [
      "Delivering Water completes quest:first-water.",
      "Completion copy appears from quest data.",
      "Quest completion persists after reload.",
      "The same Water cannot be delivered twice.",
    ],
    implementationNotes: [
      "Use reducer action for delivery so UI does not directly manipulate rewards.",
      "Support tap-to-deliver as a fallback to drag delivery.",
      "Make completion visually satisfying but short.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "web-component",
        path: "apps/web/app/components",
        reason: "Quest card and inventory need delivery affordances.",
      },
      {
        kind: "schema-data",
        path: "packages/schemas/src/data/alchemy-quests.ts",
        reason: "Quest completion and reward data live here.",
      },
    ],
    calvin: {
      humanGoal: "Let the child help a character and close the first story beat.",
      skillAtoms: [
        {
          action: "The player delivers Water.",
          simulation: "Quest requirements are checked and completed.",
          feedback: "Sir Bubbleton celebrates and the quest stamp appears.",
          insight: "Crafting solves town problems.",
        },
      ],
      loopArc: "This is the tutorial arc closure before rewards open the next loop.",
      relatedness: "The NPC thanks the child directly.",
      darkPatternRisk: "No countdown pressure on the first delivery.",
      schemasImplied: ["QuestDeliveryActionSchema", "CompletedQuestLogSchema"],
      storybookProof: "WaterQuestCard/ReadyToDeliver and /Completed stories.",
      verification: ["Bun delivery reducer tests", "Storybook interaction check"],
    },
    symphony: {
      labels: [...baseLabels, "gameplay", "quest"],
      estimate: "L",
      dispatchGroup: "quest-completion",
    },
  }),
  issue({
    id: "F5M-015",
    title: "Create the first reward reveal and claim flow",
    priority: "P0",
    area: "feedback",
    phase: "3-4 min",
    playerOutcome:
      "The child sees Gold, Knowledge XP, a Discovery Token, and the Workbench Slot IV shop unlock as earned rewards.",
    currentEvidence: [
      "quest:first-water rewards are defined as gold, knowledge XP, discovery token, and upgrade unlock.",
      "No reward UI currently exists.",
    ],
    problem:
      "Rewards need to explain what changed without overwhelming the player after the first quest.",
    scope: [
      "Render a reward reveal after Water delivery.",
      "Apply rewards idempotently on claim.",
      "Show the slot IV shop unlock as the next recommended action.",
    ],
    outOfScope: ["Reward history ledger", "Animated currency showers"],
    dependencies: ["F5M-014"],
    acceptanceCriteria: [
      "Reward values match quest:first-water data.",
      "Claiming rewards updates currencies and unlocks slot IV purchase availability.",
      "Reloading during the reward screen does not duplicate or lose rewards.",
    ],
    implementationNotes: [
      "Prefer a compact panel over a blocking full-screen modal unless testing shows otherwise.",
      "Make Discovery Token visible but defer the draft until after slot IV is explained.",
      "Use one clear call to action.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "web-component",
        path: "apps/web/app/components",
        reason: "Reward reveal should be Storybook-backed.",
      },
      {
        kind: "web-state",
        path: "apps/web/app/state",
        reason: "Currencies and reward claim state persist.",
      },
    ],
    calvin: {
      humanGoal: "Make the first success feel earned and understandable.",
      skillAtoms: [
        {
          action: "The player claims rewards.",
          simulation: "Currencies and unlock flags update once.",
          feedback: "Gold, token, and slot unlock appear.",
          insight: "Quests make the workshop grow.",
        },
      ],
      loopArc: "Rewards convert tutorial closure into the next objective.",
      relatedness: "Sir Bubbleton's celebration connects reward to helping.",
      darkPatternRisk: "Avoid casino-style reward bursts; use clear earned progress.",
      schemasImplied: ["PendingRewardSchema", "CurrencyWalletSchema"],
      storybookProof: "RewardReveal/FirstWater story.",
      verification: ["Bun reward idempotency tests", "Storybook visual check"],
    },
    symphony: {
      labels: [...baseLabels, "feedback", "reward"],
      estimate: "M",
      dispatchGroup: "quest-completion",
    },
  }),
  issue({
    id: "F5M-016",
    title: "Add Workbench Slot IV shop purchase",
    priority: "P0",
    area: "gameplay",
    phase: "4-5 min",
    playerOutcome:
      "The child spends earned Gold on a visible board improvement instead of receiving all five slots for free.",
    currentEvidence: [
      "ALCHEMY_TABLE_SLOT_UPGRADES defines upgrade:table-slot-4 unlocked by quest:first-water.",
      "The app does not currently render an upgrade shop.",
    ],
    problem: "The slot upgrade requirement is data-backed but not playable.",
    scope: [
      "Render a small Upgrade Shop panel after Water rewards are claimable.",
      "Allow buying Workbench Slot IV for its configured cost once unlocked and affordable.",
      "Activate the fourth slot immediately after purchase.",
    ],
    outOfScope: ["Slot V purchase", "All upgrade categories"],
    dependencies: ["F5M-015"],
    acceptanceCriteria: [
      "Slot IV is not purchasable before Water completion.",
      "After Water reward, Slot IV appears with cost and benefit.",
      "Purchasing Slot IV deducts Gold once and makes four slots active.",
    ],
    implementationNotes: [
      "Use ALCHEMY_TABLE_SLOT_UPGRADES as the source of truth.",
      "Keep the shop panel small and contextual.",
      "Show locked Slot V as later, if shown at all.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "schema-data",
        path: "packages/schemas/src/data/alchemy-quests.ts",
        reason: "Table slot upgrades are defined here.",
      },
      {
        kind: "web-component",
        path: "apps/web/app/components",
        reason: "Upgrade Shop should be a component with story coverage.",
      },
    ],
    calvin: {
      humanGoal: "Make growth visible by letting the child buy a bigger table.",
      skillAtoms: [
        {
          action: "The player buys Slot IV.",
          simulation: "Gold decreases and owned slot count increases.",
          feedback: "A fourth slot lights up.",
          insight: "Rewards can change what recipes fit.",
        },
      ],
      loopArc: "This is the first mechanical upgrade beat in the five-minute arc.",
      relatedness: "The shopkeeper can frame it as trust earned by helping the knight.",
      darkPatternRisk: "No premium currency language; Gold is earned only through play.",
      schemasImplied: ["UpgradeShopStateSchema", "WorkbenchUpgradePurchaseActionSchema"],
      storybookProof: "UpgradeShop/SlotIvAvailable and /SlotIvPurchased stories.",
      verification: ["Bun purchase reducer tests", "Storybook visual check"],
    },
    symphony: {
      labels: [...baseLabels, "gameplay", "upgrades"],
      estimate: "L",
      dispatchGroup: "upgrade",
    },
  }),
  issue({
    id: "F5M-017",
    title: "Build the first Discovery Draft choice panel",
    priority: "P0",
    area: "ui-ux",
    phase: "4-5 min",
    playerOutcome:
      "The child chooses Sodium, Iron, or Baker Brindle and feels agency without risking a dead end.",
    currentEvidence: [
      "quest:first-water defines a three-option discoveryDraft.",
      "The design bible requires deterministic three-choice discovery, not paid randomness.",
    ],
    problem:
      "The first five minutes need a choice payoff that opens the next session without turning into gacha.",
    scope: [
      "Render the three face-up choices from quest:first-water discoveryDraft.",
      "Show role labels: critical, synergy, preference.",
      "Persist the chosen unlock and close the draft.",
    ],
    outOfScope: ["Procedural draft generation", "Paid randomization", "All later discovery drafts"],
    dependencies: ["F5M-015"],
    acceptanceCriteria: [
      "Discovery Draft shows Sodium, Iron, and Baker Brindle from data.",
      "At least one option is marked recommended for critical path clarity.",
      "Choosing an option applies exactly one unlock and persists after reload.",
    ],
    implementationNotes: [
      "Read options directly from quest data.",
      "Use kid-readable explanations and avoid gambling visual language.",
      "Let the player inspect choices before choosing.",
    ],
    dataAnchors: {
      ...firstWaterAnchors,
      elements: ["element:h", "element:o", "element:c", "element:na", "element:fe"],
    },
    surfaces: [
      {
        kind: "web-component",
        path: "apps/web/app/components",
        reason: "Discovery Draft needs isolated Storybook coverage.",
      },
      {
        kind: "schema-data",
        path: "packages/schemas/src/data/alchemy-quests.ts",
        reason: "Discovery options are defined in quest data.",
      },
    ],
    calvin: {
      humanGoal: "Give the child a real choice that still protects the learning path.",
      skillAtoms: [
        {
          action: "The player chooses one discovery.",
          simulation: "The unlock graph adds the selected node.",
          feedback: "The selected card lights up and the board updates.",
          insight: "My choice changes what the guild can do next.",
        },
      ],
      loopArc: "Discovery Draft is the cliffhanger and agency beat at minute five.",
      relatedness: "Baker Brindle as an NPC option makes the town feel alive.",
      darkPatternRisk:
        "This must never look like paid gacha; all choices are visible and deterministic.",
      schemasImplied: ["DiscoveryDraftStateSchema", "DiscoveryChoiceActionSchema"],
      storybookProof: "DiscoveryDraft/FirstWaterChoices story.",
      verification: ["Bun draft-choice tests", "Storybook interaction check"],
    },
    symphony: {
      labels: [...baseLabels, "ui-ux", "discovery"],
      estimate: "L",
      dispatchGroup: "discovery",
    },
  }),
  issue({
    id: "F5M-018",
    title: "Apply first Discovery Draft unlocks to the board state",
    priority: "P0",
    area: "state",
    phase: "4-5 min",
    playerOutcome:
      "After the choice, the board visibly changes and the player can see what opened next.",
    currentEvidence: [
      "The quest graph can make kitchen, metal, and field-kit quests available after quest:first-water.",
      "No runtime unlock application exists yet.",
    ],
    problem:
      "A selected Discovery Draft option must affect unlocked elements, NPCs, quests, and board suggestions.",
    scope: [
      "Implement unlock application for element, NPC, raw material, recipe, and upgrade draft kinds used in the first session.",
      "Update available quest board selectors after the Water quest and selected discovery.",
      "Expose a short 'newly unlocked' summary.",
    ],
    outOfScope: ["Complete all late-game unlock types", "Procedural quest generation"],
    dependencies: ["F5M-017"],
    acceptanceCriteria: [
      "Choosing Sodium unlocks element:na.",
      "Choosing Iron unlocks element:fe.",
      "Choosing Baker Brindle unlocks the baker requester or next kitchen context.",
      "Available next quests are derived from the existing quest graph.",
    ],
    implementationNotes: [
      "Represent selected draft IDs in persisted state.",
      "Do not duplicate quest prerequisites in UI.",
      "Handle already-owned unlocks idempotently.",
    ],
    dataAnchors: {
      quests: ["quest:first-water", "quest:kitchen-salt-and-fuel", "quest:metal-samples"],
      recipes: ["alchemy:water", "alchemy:salt", "alchemy:iron-ingot"],
      elements: ["element:h", "element:o", "element:c", "element:na", "element:fe"],
      upgrades: ["upgrade:table-slot-4"],
      existingFiles: firstWaterAnchors.existingFiles,
    },
    surfaces: [
      {
        kind: "schema-data",
        path: "packages/schemas/src/data/alchemy-quests.ts",
        reason: "Quest graph and Discovery Draft options live here.",
      },
      {
        kind: "web-state",
        path: "apps/web/app/state",
        reason: "Unlocks must persist and drive visible board state.",
      },
    ],
    calvin: {
      humanGoal: "Make agency visible immediately after the child chooses.",
      skillAtoms: [
        {
          action: "The player confirms a discovery.",
          simulation: "Unlock sets and quest selectors recompute.",
          feedback: "New element, NPC, or quest preview appears.",
          insight: "Discovery opens a path through the graph.",
        },
      ],
      loopArc: "This bridges the first five-minute arc into session two.",
      relatedness: "New NPC or material gives the child something to tell the parent.",
      darkPatternRisk: "Avoid false choice; every option must open a useful next path.",
      schemasImplied: ["UnlockedContentSchema", "DiscoveryUnlockSummarySchema"],
      storybookProof: "PostDiscoveryBoard/Sodium, /Iron, and /Baker stories.",
      verification: ["Bun unlock reducer tests", "Quest selector tests"],
    },
    symphony: {
      labels: [...baseLabels, "state", "unlock-graph"],
      estimate: "L",
      dispatchGroup: "discovery",
    },
  }),
  issue({
    id: "F5M-019",
    title: "Show the post-tutorial quest board with next playable options",
    priority: "P0",
    area: "gameplay",
    phase: "4-5 min",
    playerOutcome:
      "At the end of minute five, the child sees what they can do next instead of hitting a dead screen.",
    currentEvidence: [
      "getAlchemyQuestBoard can surface available quests after completed quest IDs.",
      "The design bible says the quest board should never show more than three quests early.",
    ],
    problem: "The first E2E loop needs a playable handoff after Water, slot IV, and discovery.",
    scope: [
      "Render the next available critical, production, and curiosity quests after Water completion.",
      "Respect the three-quest early board limit.",
      "Show locked hints only when they explain a next step, like needing Chlorine for Salt later.",
    ],
    outOfScope: ["Completing the next quests", "All act-one board balancing"],
    dependencies: ["F5M-018"],
    acceptanceCriteria: [
      "After Water, the board never shows more than three quests.",
      "At least one next quest is actionable or clearly explains its missing unlock.",
      "Quest ordering comes from quest graph helpers rather than hard-coded UI order.",
    ],
    implementationNotes: [
      "Use completedQuestIds and unlock state to call graph selectors.",
      "Keep disabled/locked quests visually quieter than active quests.",
      "Avoid overwhelming the child with all act-one branches at once.",
    ],
    dataAnchors: {
      quests: [
        "quest:first-water",
        "quest:kitchen-salt-and-fuel",
        "quest:metal-samples",
        "quest:field-kit-basics",
      ],
      recipes: ["alchemy:water", "alchemy:salt", "alchemy:iron-ingot", "alchemy:herbal-mash"],
      elements: ["element:h", "element:o", "element:c", "element:na", "element:fe"],
      upgrades: ["upgrade:table-slot-4", "upgrade:table-slot-5"],
      existingFiles: firstWaterAnchors.existingFiles,
    },
    surfaces: [
      {
        kind: "web-component",
        path: "apps/web/app/components",
        reason: "Quest board list should be componentized.",
      },
      {
        kind: "schema-data",
        path: "packages/schemas/src/data/alchemy-quests.ts",
        reason: "Quest board ordering and prerequisites are defined here.",
      },
    ],
    calvin: {
      humanGoal: "End the first five minutes with curiosity, not confusion.",
      skillAtoms: [
        {
          action: "The player looks at the refreshed board.",
          simulation: "Available quests are selected from completed progress.",
          feedback: "Two or three clear next cards appear.",
          insight: "The town has more needs now that I know Water.",
        },
      ],
      loopArc: "This is the first session cliffhanger and meso-loop restart.",
      relatedness: "New quest-givers make the town feel grateful and alive.",
      darkPatternRisk:
        "Do not flood the board to trigger fear of missing out; use curated choices.",
      schemasImplied: ["QuestBoardViewStateSchema"],
      storybookProof: "QuestBoard/AfterFirstWater story.",
      verification: ["Bun quest-board selector tests", "Storybook visual check"],
    },
    symphony: {
      labels: [...baseLabels, "gameplay", "quest-board"],
      estimate: "M",
      dispatchGroup: "discovery",
    },
  }),
  issue({
    id: "F5M-020",
    title: "Write and wire concise first-session tutorial copy",
    priority: "P1",
    area: "content",
    phase: "cross-cutting",
    playerOutcome:
      "The child always knows the next action, but the game does not talk over their discovery.",
    currentEvidence: [
      "Quest data includes short need, hint, and completion lines.",
      "The design bible requires NPC dialogue to be short and functional.",
    ],
    problem:
      "Unstructured tutorial text can either overwhelm the child or fail to teach the critical H2O action.",
    scope: [
      "Add microcopy for first load, first drag, valid Water, invalid recipe, craft started, output ready, delivery, rewards, slot IV, and Discovery Draft.",
      "Use Professor Atomwick as guide and Sir Bubbleton as recipient.",
      "Ensure each line fits compact panels on iPad and mobile.",
    ],
    outOfScope: ["Voice acting", "Long lore", "All NPC banter"],
    dependencies: ["F5M-004", "F5M-010", "F5M-015", "F5M-017"],
    acceptanceCriteria: [
      "Every first-session state has one next-action hint available.",
      "No tutorial line exceeds the UI container in target viewports.",
      "The player can hide or advance tutorial text without breaking progression.",
    ],
    implementationNotes: [
      "Keep tutorial copy data-driven where practical.",
      "Avoid in-app text explaining implementation details or controls that are already obvious.",
      "Use Calvin's positive human goal: helpful, curious, safe.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "web-component",
        path: "apps/web/app/components",
        reason: "Tutorial copy appears across quest, table, and reward components.",
      },
      {
        kind: "docs",
        path: "_docs/Game_Design_Bible.md",
        reason: "The first-five-minute snapshot defines the intended beats.",
      },
    ],
    calvin: {
      humanGoal: "Guide the child just enough that they still feel clever.",
      skillAtoms: [
        {
          action: "The player pauses or makes an error.",
          simulation: "The game selects the relevant micro-hint.",
          feedback: "A short character line points to the next action.",
          insight: "I can recover by observing the formula.",
        },
      ],
      loopArc: "Copy stitches every micro step into a coherent tutorial arc.",
      relatedness: "NPC lines make the learning loop social.",
      darkPatternRisk: "Avoid nag loops; hints should be helpful and dismissible.",
      schemasImplied: ["TutorialBeatSchema", "TutorialMessagePropsSchema"],
      storybookProof: "TutorialMessage/AllFirstSessionBeats story.",
      verification: ["Storybook text-fit check", "Unit test for beat lookup"],
    },
    symphony: {
      labels: [...baseLabels, "content", "tutorial"],
      estimate: "M",
      dispatchGroup: "polish",
    },
  }),
  issue({
    id: "F5M-021",
    title: "Make hot reload and offline return safe during the first craft",
    priority: "P0",
    area: "state",
    phase: "cross-cutting",
    playerOutcome: "Closing or refreshing during the first Water craft never loses progress.",
    currentEvidence: [
      "The project architecture requires IDB-first state because iPad live reload is central.",
      "The first-five-minute design explicitly promises the workshop keeps crafting while away.",
    ],
    problem:
      "The first E2E loop must prove persistence under the exact development workflow this repo exists for.",
    scope: [
      "Persist active craft timestamps, inventory, completed quests, rewards, owned upgrades, and discovery choices.",
      "Reconcile elapsed time on hydration.",
      "Show a friendly return summary if Water finished while away.",
    ],
    outOfScope: ["Push notifications", "Long offline balance", "Service worker cache changes"],
    dependencies: ["F5M-011", "F5M-013", "F5M-018"],
    acceptanceCriteria: [
      "Refreshing mid-Water craft resumes or completes the same craft.",
      "Refreshing after Water delivery keeps quest:first-water complete.",
      "Refreshing after Discovery Draft choice keeps exactly one chosen unlock.",
    ],
    implementationNotes: [
      "Follow the existing root hydration pattern.",
      "Use deterministic wall-clock reconciliation in unit tests.",
      "Do not store progress in component local state.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "web-state",
        path: "apps/web/app/state",
        reason: "Persistence and hydration live here.",
      },
      {
        kind: "test",
        path: "apps/web/app/state",
        reason: "Bun tests should cover migrations and reconciliation.",
      },
    ],
    calvin: {
      humanGoal: "The child trusts the workshop because it remembers.",
      skillAtoms: [
        {
          action: "The player returns after reload.",
          simulation: "Hydration reconciles elapsed time.",
          feedback: "Progress is unchanged or Water is ready.",
          insight: "Leaving and coming back is part of the game.",
        },
      ],
      loopArc: "Offline return is the first proof of the idle meso loop.",
      relatedness: "Parent can reload during development without apologizing for lost progress.",
      darkPatternRisk: "Avoid comeback pressure; use a warm return summary only.",
      schemasImplied: ["OfflineReturnSummarySchema"],
      storybookProof: "ReturnSummary/WaterFinished story.",
      verification: ["Bun reconciliation tests", "Manual refresh mid-craft"],
    },
    symphony: {
      labels: [...baseLabels, "state", "offline"],
      estimate: "L",
      dispatchGroup: "foundation",
    },
  }),
  issue({
    id: "F5M-022",
    title: "Add purposeful animation, sound, and reduced-motion fallbacks",
    priority: "P1",
    area: "feedback",
    phase: "cross-cutting",
    playerOutcome: "Every major beat feels responsive without becoming noisy or inaccessible.",
    currentEvidence: [
      "The board already uses anime.js for drag/release motion and has a sound layer.",
      "The design bible calls for gentle craft, reward, and discovery feedback.",
    ],
    problem:
      "The first loop needs sensory confirmation for learning beats, but excessive motion will distract from the formula.",
    scope: [
      "Add small feedback for card snap, Water craft start, timer completion, delivery, reward claim, slot unlock, and discovery choice.",
      "Respect reduced motion for all nonessential animation.",
      "Route sounds through existing sound settings.",
    ],
    outOfScope: ["Original music composition", "Complex particle systems", "Voiceover"],
    dependencies: ["F5M-007", "F5M-011", "F5M-014", "F5M-017"],
    acceptanceCriteria: [
      "Each first-session beat has clear visual or audio feedback.",
      "Reduced motion mode removes or simplifies movement without hiding state changes.",
      "Muted sound setting prevents first-session SFX.",
    ],
    implementationNotes: [
      "Use anime.js v4 through the existing patterns.",
      "Keep Pixi animation in effects, not render.",
      "Prefer semantic feedback over decoration.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "web-component",
        path: "apps/web/app/components/alchemist-guild-board/index.tsx",
        reason: "Current drag feedback exists here.",
      },
      {
        kind: "asset",
        path: "apps/web/app/sound",
        reason: "Sound playback settings and SFX calls live here.",
      },
    ],
    calvin: {
      humanGoal: "Make the board feel alive while keeping learning in the foreground.",
      skillAtoms: [
        {
          action: "The player completes a beat.",
          simulation: "The UI maps state change to sensory feedback.",
          feedback: "A small motion or sound confirms success.",
          insight: "The game noticed what I did.",
        },
      ],
      loopArc: "Feedback punctuates every step of the micro loop.",
      relatedness: "Celebration sounds make completed Water easy to share with a parent.",
      darkPatternRisk: "Avoid variable reward spectacle; feedback confirms known progress.",
      schemasImplied: ["AlchemyFeedbackEventSchema"],
      storybookProof: "FeedbackRail/FirstSessionBeats story with reduced motion variant.",
      verification: ["Manual reduced-motion check", "Sound muted check"],
    },
    symphony: {
      labels: [...baseLabels, "feedback", "motion", "sound"],
      estimate: "M",
      dispatchGroup: "polish",
    },
  }),
  issue({
    id: "F5M-023",
    title: "Audit touch ergonomics, accessibility, and readable text for the first loop",
    priority: "P0",
    area: "accessibility",
    phase: "cross-cutting",
    playerOutcome:
      "The first five minutes are playable on an iPad by touch and understandable with assistive labels.",
    currentEvidence: [
      "The current board uses pointer interactions and aria labels in some areas.",
      "The design bible targets iPad-first parent-child play.",
    ],
    problem:
      "A working game loop can still fail if touch targets are too small, labels are missing, or text overlaps.",
    scope: [
      "Audit first-session controls for target size, focusability, labels, and text fit.",
      "Add keyboard/tap alternatives where drag is not enough.",
      "Verify reduced-motion and sound settings are discoverable.",
    ],
    outOfScope: [
      "Full WCAG audit for late-game screens",
      "Screen reader optimization for Pixi internals",
    ],
    dependencies: ["F5M-003", "F5M-007", "F5M-017"],
    acceptanceCriteria: [
      "Critical actions can be completed with tap alternatives, not only precise drag.",
      "Buttons and interactive regions have accessible names.",
      "No first-session text overlaps or escapes containers at mobile and iPad sizes.",
    ],
    implementationNotes: [
      "Use role-based controls for HTML UI.",
      "Keep canvas accessibility backed by surrounding controls and labels.",
      "Avoid viewport-width font scaling.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "web-component",
        path: "apps/web/app/components",
        reason: "Accessibility fixes apply across first-session components.",
      },
      {
        kind: "storybook",
        path: "apps/web/app/components",
        reason: "Stories should expose viewport and reduced-motion states.",
      },
    ],
    calvin: {
      humanGoal:
        "Make the toy easy to handle so the child thinks about chemistry, not UI precision.",
      skillAtoms: [
        {
          action: "The player taps, drags, or focuses a control.",
          simulation: "The UI resolves the same gameplay action.",
          feedback: "The target responds clearly.",
          insight: "The board is made for my hands.",
        },
      ],
      loopArc: "Ergonomics protects every loop from frustration.",
      relatedness: "Parent and child can share the iPad without fighting tiny controls.",
      darkPatternRisk: "Do not hide key actions behind precision gestures.",
      schemasImplied: ["AccessibleActionPropsSchema"],
      storybookProof: "FirstSessionBoard/AccessibilityAudit story.",
      verification: ["Storybook a11y check", "Manual iPad-size viewport check"],
    },
    symphony: {
      labels: [...baseLabels, "accessibility", "iPad"],
      estimate: "M",
      dispatchGroup: "qa",
    },
  }),
  issue({
    id: "F5M-024",
    title: "Wire recipe info buttons to kid-readable recipe research copy",
    priority: "P1",
    area: "content",
    phase: "cross-cutting",
    playerOutcome:
      "The child can ask 'what is this?' about Water and read a short friendly explanation.",
    currentEvidence: [
      "Alchemy recipe kid info exists for every recipe.",
      "The current board has no recipe card info button surface.",
    ],
    problem:
      "The research copy is ready, but the first craftable product needs a UI route to show it.",
    scope: [
      "Add info button support to crafted recipe cards such as Water.",
      "Read copy with getAlchemyRecipeKidInfoById.",
      "Show source-backed text in a compact panel without blocking the main loop.",
    ],
    outOfScope: ["Full encyclopedia browsing", "External links in the child-facing first session"],
    dependencies: ["F5M-012", "F5M-013"],
    acceptanceCriteria: [
      "Water output or inventory card can open its recipe info.",
      "The panel displays the Water title and 3-4 kid-readable sentences.",
      "Closing the panel returns to the exact previous tutorial state.",
    ],
    implementationNotes: [
      "Do not render source URLs in the kid panel unless a parent/developer mode asks for them.",
      "Keep the info affordance visually secondary to delivery.",
      "Use existing alchemy-recipe-kid-info data.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "schema-data",
        path: "packages/schemas/src/data/alchemy-recipe-kid-info.ts",
        reason: "Recipe explanations and sources live here.",
      },
      {
        kind: "web-component",
        path: "apps/web/app/components",
        reason: "Info panel should be a reusable component.",
      },
    ],
    calvin: {
      humanGoal: "Reward curiosity after the child makes the thing.",
      skillAtoms: [
        {
          action: "The player opens Water info.",
          simulation: "The game loads recipe kid-info copy.",
          feedback: "A short explanation appears.",
          insight: "Water is H2O and matters everywhere.",
        },
      ],
      loopArc: "Info is optional depth between craft completion and delivery.",
      relatedness: "The parent can read the Water explanation aloud.",
      darkPatternRisk: "Do not interrupt the quest with mandatory reading.",
      schemasImplied: ["RecipeInfoPanelPropsSchema"],
      storybookProof: "RecipeInfoPanel/Water story.",
      verification: ["Bun lookup test", "Storybook text-fit check"],
    },
    symphony: {
      labels: [...baseLabels, "content", "recipe-info"],
      estimate: "M",
      dispatchGroup: "polish",
    },
  }),
  issue({
    id: "F5M-025",
    title: "Add friendly error and empty states for first-session data failures",
    priority: "P1",
    area: "qa",
    phase: "cross-cutting",
    playerOutcome:
      "If data is missing during development, the app fails loudly for engineers and gently for the child.",
    currentEvidence: [
      "The repo has root error boundaries and Zod-first validation requirements.",
      "The first-session UI will depend on several cross-file data IDs.",
    ],
    problem:
      "A missing recipe, element, image, or quest can otherwise become a blank board or confusing child-facing failure.",
    scope: [
      "Validate first-session data anchors at startup or module load in development.",
      "Show developer-clear errors for missing Water quest, recipe, elements, or slot upgrade.",
      "Show a small child-safe fallback message if a card image fails.",
    ],
    outOfScope: ["Recovery for corrupted production saves beyond existing clear-state tools"],
    dependencies: ["F5M-001", "F5M-003"],
    acceptanceCriteria: [
      "Missing first-session data throws a useful dev error.",
      "Missing art does not collapse card layout.",
      "The app boundary still catches unexpected first-session render errors.",
    ],
    implementationNotes: [
      "Use Zod and explicit invariant helpers.",
      "Do not swallow Zod runtime errors in development.",
      "Avoid duplicating validation already covered by schema tests.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "schema-data",
        path: "packages/schemas/src/data",
        reason: "First-session anchors are distributed across data modules.",
      },
      {
        kind: "web-component",
        path: "apps/web/app/components",
        reason: "UI fallback states need stable dimensions.",
      },
    ],
    calvin: {
      humanGoal: "Protect the child-facing play session from blank or broken states.",
      skillAtoms: [
        {
          action: "The app loads first-session data.",
          simulation: "Validation checks required anchors.",
          feedback: "Valid data renders; invalid data reports clearly.",
          insight: "The board is reliable.",
        },
      ],
      loopArc: "Data reliability protects the entire tutorial arc.",
      relatedness: "A parent developer can fix data quickly without derailing the child.",
      darkPatternRisk: "No retry loops or scare copy; development errors are for adults.",
      schemasImplied: ["FirstSessionDataContractSchema"],
      storybookProof: "FirstSessionBoard/MissingImageFallback story.",
      verification: ["Bun invariant tests", "Storybook fallback check"],
    },
    symphony: {
      labels: [...baseLabels, "qa", "data"],
      estimate: "M",
      dispatchGroup: "qa",
    },
  }),
  issue({
    id: "F5M-026",
    title: "Create Storybook coverage for every first-session component",
    priority: "P0",
    area: "qa",
    phase: "cross-cutting",
    playerOutcome:
      "The first five minutes can be developed and reviewed in isolated slices before route wiring.",
    currentEvidence: [
      "The project requires Storybook-first components.",
      "Current alchemy board work will need multiple new child components.",
    ],
    problem:
      "A route-only implementation will make the first E2E loop hard to debug and violate the repo contract.",
    scope: [
      "Add stories for quest card, starter vault state, workbench slots, recipe ghosts, craft timer, output tray, inventory tray, reward reveal, upgrade shop, and Discovery Draft.",
      "Include key state variants: empty, ready, running, complete, error, reduced motion where relevant.",
      "Keep story args typed through Zod-backed component schemas.",
    ],
    outOfScope: ["Writing Playwright story tests without user direction"],
    dependencies: [
      "F5M-004",
      "F5M-005",
      "F5M-008",
      "F5M-009",
      "F5M-011",
      "F5M-012",
      "F5M-013",
      "F5M-015",
      "F5M-016",
      "F5M-017",
    ],
    acceptanceCriteria: [
      "Every new first-session component has a sibling story.",
      "Stories render the main happy path and at least one edge state.",
      "Storybook can be used to visually inspect the full first-session board state.",
    ],
    implementationNotes: [
      "Ask before adding or modifying Playwright tests.",
      "Use stories as the component contract.",
      "Prefer small components over one route-scale story only.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "storybook",
        path: "apps/web/app/components",
        reason: "Stories must be co-located with components.",
      },
      {
        kind: "workflow",
        path: "AGENTS.md",
        reason: "Storybook-first is load-bearing.",
      },
    ],
    calvin: {
      humanGoal: "Let the parent iterate quickly on every toy piece.",
      skillAtoms: [
        {
          action: "The developer opens a story.",
          simulation: "The component receives a controlled first-session state.",
          feedback: "The exact beat is visible without playing from the start.",
          insight: "Each part of the loop can be tuned independently.",
        },
      ],
      loopArc: "Storybook protects the production loop by validating micro beats.",
      relatedness: "Fast iteration makes parent-child live testing practical.",
      darkPatternRisk: "None for gameplay; this is tooling discipline.",
      schemasImplied: ["FirstSessionStoryStateSchema"],
      storybookProof: "FirstSessionBoard/CompleteFiveMinuteLoop story.",
      verification: ["Storybook renders locally", "Biome"],
    },
    symphony: {
      labels: [...baseLabels, "storybook", "qa"],
      estimate: "L",
      dispatchGroup: "qa",
    },
  }),
  issue({
    id: "F5M-027",
    title: "Add Bun unit coverage for first-session reducers and selectors",
    priority: "P0",
    area: "qa",
    phase: "cross-cutting",
    playerOutcome:
      "The first E2E loop rests on fast deterministic tests instead of only browser clicks.",
    currentEvidence: [
      "apps/web/app/alchemy-quest-graph.test.ts already validates quest and recipe graph contracts.",
      "First-session runtime logic will be pure enough for Bun unit tests.",
    ],
    problem:
      "The E2E loop will be slow to debug unless core state transitions are tested below the browser layer.",
    scope: [
      "Test default state, placement, recipe matching, fizzle, craft start, timer completion, collect, deliver, reward claim, slot IV purchase, discovery choice, and post-tutorial board selectors.",
      "Use deterministic clocks for timer tests.",
      "Add regression tests for duplicate reward and duplicate collect prevention.",
    ],
    outOfScope: ["Playwright tests", "Visual screenshot assertions"],
    dependencies: ["F5M-002", "F5M-011", "F5M-014", "F5M-016", "F5M-018"],
    acceptanceCriteria: [
      "Bun tests can execute the whole first-five-minute state sequence.",
      "Edge tests cover invalid craft and reload/idempotency cases.",
      "Tests run as part of the relevant package or app unit task.",
    ],
    implementationNotes: [
      "Keep browser APIs out of reducer modules.",
      "Name tests by player behavior, not implementation detail.",
      "Use the existing alchemy graph test style as precedent.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "test",
        path: "apps/web/app",
        reason: "Existing Bun app tests live here.",
      },
      {
        kind: "schema-data",
        path: "packages/schemas/src/data",
        reason: "Tests should validate against real data IDs.",
      },
    ],
    calvin: {
      humanGoal: "Make the tutorial dependable enough to iterate quickly.",
      skillAtoms: [
        {
          action: "A developer changes gameplay logic.",
          simulation: "Unit tests replay the first loop.",
          feedback: "Breaks are caught immediately.",
          insight: "The player's learning path is protected.",
        },
      ],
      loopArc: "Testing preserves the loop across refactors.",
      relatedness: "Reliability protects live parent-child playtests.",
      darkPatternRisk: "None; tests enforce child-safe behavior like no harsh loss.",
      schemasImplied: ["FirstSessionTestFixtureSchema"],
      storybookProof: "Stories use the same fixture states covered by tests.",
      verification: ["bun test focused package/app files"],
    },
    symphony: {
      labels: [...baseLabels, "test", "unit"],
      estimate: "M",
      dispatchGroup: "qa",
    },
  }),
  issue({
    id: "F5M-028",
    title: "Prepare the first-five-minute E2E test plan without writing Playwright yet",
    priority: "P0",
    area: "workflow",
    phase: "cross-cutting",
    playerOutcome:
      "The team knows exactly what the future E2E proof must cover before Playwright calcifies the spec.",
    currentEvidence: [
      "AGENTS.md requires asking before writing or modifying any Playwright test.",
      "The user wants to execute an E2E game loop after the issues are implemented.",
    ],
    problem:
      "The E2E path should be planned now, but actual Playwright test structure needs explicit user input later.",
    scope: [
      "Document the intended E2E steps from fresh state to post-discovery board.",
      "List selector strategy options and required fixtures.",
      "Identify where Storybook tests versus app-level tests would provide the best proof.",
    ],
    outOfScope: [
      "Creating or editing Playwright specs",
      "Choosing selectors without user approval",
    ],
    dependencies: ["F5M-019", "F5M-021", "F5M-026", "F5M-027"],
    acceptanceCriteria: [
      "A written E2E plan exists with steps, state setup, assertions, and open decisions.",
      "The plan explicitly notes that Playwright implementation requires user approval.",
      "The plan covers fresh IDB, drag/tap interactions, timer completion, reload, reward, slot IV, and Discovery Draft.",
    ],
    implementationNotes: [
      "Keep this as docs or package data, not a Playwright spec.",
      "Surface choices: role selectors vs test IDs, seeded IDB vs UI-only path, real timer vs controlled clock.",
      "Use this package's issue graph as the scope boundary.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "docs",
        path: "packages/symphony-first-five",
        reason: "The E2E plan belongs with the issue specs.",
      },
      {
        kind: "workflow",
        path: "AGENTS.md",
        reason: "Ask-first Playwright rule is load-bearing.",
      },
    ],
    calvin: {
      humanGoal:
        "Prove the child can complete the full loop, without prematurely freezing test design.",
      skillAtoms: [
        {
          action: "A developer reads the E2E plan.",
          simulation: "The loop is broken into assertable beats.",
          feedback: "Open decisions are visible before coding tests.",
          insight: "The playable promise can be verified end to end.",
        },
      ],
      loopArc: "E2E proof validates the full five-minute arc.",
      relatedness: "The plan keeps the user's intent in the testing conversation.",
      darkPatternRisk: "None; this prevents accidental spec lock-in.",
      schemasImplied: ["FirstFiveE2EPlanSchema"],
      storybookProof: "Story-level coverage choices are named but not implemented here.",
      verification: ["Review the plan against AGENTS.md", "No Playwright files changed"],
    },
    symphony: {
      labels: [...baseLabels, "e2e", "workflow"],
      estimate: "M",
      dispatchGroup: "qa",
    },
  }),
  issue({
    id: "F5M-029",
    title: "Add developer reset and seed controls for first-session playtesting",
    priority: "P1",
    area: "workflow",
    phase: "cross-cutting",
    playerOutcome:
      "The parent developer can quickly replay the first five minutes during live iteration.",
    currentEvidence: [
      "The app already has clear-state recovery patterns in the architecture notes.",
      "First-session testing will require repeated fresh starts and mid-loop states.",
    ],
    problem:
      "Without fast reset and seed states, tuning the first five minutes will be slow and error-prone.",
    scope: [
      "Add dev-only controls or fixtures for fresh tutorial, mid-craft, output-ready, reward-ready, slot-IV-ready, and post-discovery states.",
      "Make reset close existing IDB connections safely through current storage utilities.",
      "Keep dev controls out of production-facing child UI.",
    ],
    outOfScope: ["Cheat menu for all late-game content", "Production analytics"],
    dependencies: ["F5M-001", "F5M-021", "F5M-026"],
    acceptanceCriteria: [
      "A developer can reset to fresh first-session state.",
      "A developer can seed at least three mid-loop states for story/manual testing.",
      "Seed controls are gated to development or Storybook fixtures.",
    ],
    implementationNotes: [
      "Reuse existing clear storage behavior rather than duplicating IndexedDB deletion.",
      "Prefer Storybook fixtures first, then app dev menu controls if needed.",
      "Do not let child-facing UI expose debug state jumps.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "web-state",
        path: "apps/web/app/lib/clear-storage.ts",
        reason: "Existing clear-state utility should stay authoritative.",
      },
      {
        kind: "storybook",
        path: "apps/web/app/components",
        reason: "Seed states should feed stories.",
      },
    ],
    calvin: {
      humanGoal: "Make iteration fast enough that the parent can tune with the child nearby.",
      skillAtoms: [
        {
          action: "The developer chooses a seed state.",
          simulation: "The app writes a known progress snapshot.",
          feedback: "The board opens at the chosen beat.",
          insight: "Every tutorial moment can be replayed quickly.",
        },
      ],
      loopArc: "Tooling accelerates improvement of the first-play arc.",
      relatedness: "Fast iteration keeps the live parent-child workflow viable.",
      darkPatternRisk: "Debug controls must not become child-facing shortcuts.",
      schemasImplied: ["FirstSessionFixtureSchema"],
      storybookProof: "FirstSessionBoard stories use exported fixtures.",
      verification: ["Manual dev reset check", "Bun fixture parse tests"],
    },
    symphony: {
      labels: [...baseLabels, "workflow", "fixtures"],
      estimate: "M",
      dispatchGroup: "qa",
    },
  }),
  issue({
    id: "F5M-030",
    title: "Add local first-session transcript for debugging and parent review",
    priority: "P2",
    area: "workflow",
    phase: "cross-cutting",
    playerOutcome:
      "The parent can see what happened in the first five minutes without sending data anywhere.",
    currentEvidence: [
      "The project has no backend and all state is local.",
      "The first playable loop will need debugging across craft, reward, and unlock events.",
    ],
    problem:
      "When the child gets stuck, a local event transcript helps tune the loop without adding analytics.",
    scope: [
      "Record local-only first-session events such as quest shown, card placed, craft started, output collected, quest delivered, reward claimed, and draft chosen.",
      "Expose a dev/parent readable transcript in Storybook or dev controls.",
      "Keep transcript storage bounded and resettable.",
    ],
    outOfScope: ["Remote telemetry", "User tracking", "Analytics dashboards"],
    dependencies: ["F5M-002", "F5M-021", "F5M-029"],
    acceptanceCriteria: [
      "Transcript records key first-loop events with timestamps or sequence numbers.",
      "Transcript stays local and does not require network.",
      "Transcript can be cleared with dev reset.",
    ],
    implementationNotes: [
      "Store only gameplay event names and IDs, not personal data.",
      "Gate any visible transcript behind parent/developer affordance.",
      "Use this to debug pacing, not to manipulate retention.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "web-state",
        path: "apps/web/app/state",
        reason: "Transcript is local gameplay progress/debug state.",
      },
      {
        kind: "web-component",
        path: "apps/web/app/components",
        reason: "Parent/dev transcript viewer needs UI only if implemented.",
      },
    ],
    calvin: {
      humanGoal: "Help the parent understand friction without surveilling the child.",
      skillAtoms: [
        {
          action: "The parent opens the transcript.",
          simulation: "Local events are listed in order.",
          feedback: "The stuck or successful beat is visible.",
          insight: "We can tune the loop from real play.",
        },
      ],
      loopArc: "Transcript supports iteration on the whole arc.",
      relatedness: "Parent can discuss the session with the child using concrete moments.",
      darkPatternRisk:
        "Remote analytics would be the wrong tool here; keep this local and transparent.",
      schemasImplied: ["FirstSessionTranscriptEventSchema"],
      storybookProof: "FirstSessionTranscript/WaterLoop story.",
      verification: ["Bun transcript reducer tests", "No network dependency"],
    },
    symphony: {
      labels: [...baseLabels, "workflow", "debug"],
      estimate: "S",
      dispatchGroup: "polish",
    },
  }),
  issue({
    id: "F5M-031",
    title: "Set first-session iPad performance and asset budgets",
    priority: "P1",
    area: "performance",
    phase: "cross-cutting",
    playerOutcome:
      "The game feels immediate on the live iPad and does not jank during the first craft.",
    currentEvidence: [
      "The current app uses Pixi, generated WebP card art, and a growing schema data bundle.",
      "The first loop will add more UI, state, and assets.",
    ],
    problem:
      "The first playable can become sluggish if every element, recipe, and image is eagerly rendered or loaded.",
    scope: [
      "Define budgets for first-session JS, visible card count, image loading, and animation work.",
      "Ensure only starter element art and first-session crafted art are eagerly needed.",
      "Document acceptable first-load and interaction responsiveness targets for iPad LAN testing.",
    ],
    outOfScope: ["Full production performance lab", "All late-game asset streaming"],
    dependencies: ["F5M-003", "F5M-005", "F5M-012", "F5M-022"],
    acceptanceCriteria: [
      "First session does not preload unnecessary late-game card art.",
      "Pixi scene remains nonblank and responsive after the new UI is added.",
      "Performance notes are captured for the future E2E loop.",
    ],
    implementationNotes: [
      "Prefer lazy image loading for nonvisible recipe cards.",
      "Keep card components dimensionally stable while images load.",
      "Avoid per-frame React state updates for Pixi motion.",
    ],
    dataAnchors: firstWaterAnchors,
    surfaces: [
      {
        kind: "asset",
        path: "apps/web/public/alchemy-card-art",
        reason: "Generated card art can affect load behavior.",
      },
      {
        kind: "canvas",
        path: "apps/web/app/components/alchemist-guild-board/periodic-table-scene.ts",
        reason: "Pixi rendering performance must remain stable.",
      },
    ],
    calvin: {
      humanGoal: "Keep the child in flow by making every touch feel instant.",
      skillAtoms: [
        {
          action: "The player drags and crafts.",
          simulation: "Rendering and assets stay within budget.",
          feedback: "Cards respond without stutter.",
          insight: "The board feels like a physical toy.",
        },
      ],
      loopArc: "Performance quality protects every second of the five-minute loop.",
      relatedness: "Smooth co-play keeps attention on conversation and discovery.",
      darkPatternRisk: "No artificial waits beyond craft timers.",
      schemasImplied: ["FirstSessionPerformanceBudgetSchema"],
      storybookProof: "FirstSessionBoard/AssetLoading story.",
      verification: ["Build size review", "Manual iPad/LAN smoke check"],
    },
    symphony: {
      labels: [...baseLabels, "performance", "assets"],
      estimate: "M",
      dispatchGroup: "qa",
    },
  }),
  issue({
    id: "F5M-032",
    title: "Run the first-five-minute acceptance pass and issue triage",
    priority: "P0",
    area: "qa",
    phase: "cross-cutting",
    playerOutcome:
      "The first five minutes are judged as one coherent play session, not a pile of completed tasks.",
    currentEvidence: [
      "The design bible defines MVP acceptance criteria for completing Water in under two minutes and naturally starting parent-child conversation.",
      "This package defines the implementation backlog needed before the E2E loop can be exercised.",
    ],
    problem:
      "Even if every individual issue passes, the combined loop may still feel confusing, too slow, or too small.",
    scope: [
      "Play through the fresh-state sequence manually and record friction.",
      "Verify the loop reaches post-discovery board state inside five minutes.",
      "Triage follow-up defects into UI/UX, gameplay, content, performance, accessibility, and test categories.",
    ],
    outOfScope: ["Shipping all follow-up defects", "Writing Playwright without user approval"],
    dependencies: [
      "F5M-019",
      "F5M-020",
      "F5M-021",
      "F5M-022",
      "F5M-023",
      "F5M-024",
      "F5M-025",
      "F5M-026",
      "F5M-027",
      "F5M-028",
      "F5M-029",
      "F5M-031",
    ],
    acceptanceCriteria: [
      "A fresh player can complete Water without reading external instructions.",
      "The player reaches Water delivered, rewards claimed, slot IV available or purchased, and Discovery Draft resolved or ready.",
      "Any remaining blockers are captured as follow-up issues with severity.",
      "The user is asked before converting the E2E plan into Playwright specs.",
    ],
    implementationNotes: [
      "Use the design bible acceptance criteria as the pass/fail rubric.",
      "Record exact timestamps for first action, craft start, craft finish, delivery, reward, and discovery.",
      "Separate must-fix blockers from polish issues.",
    ],
    dataAnchors: {
      quests: [
        "quest:first-water",
        "quest:kitchen-salt-and-fuel",
        "quest:metal-samples",
        "quest:field-kit-basics",
      ],
      recipes: ["alchemy:water", "alchemy:salt", "alchemy:iron-ingot", "alchemy:herbal-mash"],
      elements: ["element:h", "element:o", "element:c", "element:na", "element:fe"],
      upgrades: ["upgrade:table-slot-4", "upgrade:table-slot-5"],
      existingFiles: [
        "_docs/Game_Design_Bible.md",
        "packages/symphony-first-five/src/index.ts",
        ...firstWaterAnchors.existingFiles,
      ],
    },
    surfaces: [
      {
        kind: "docs",
        path: "_docs/Game_Design_Bible.md",
        reason: "Acceptance criteria and first-five-minute snapshot live here.",
      },
      {
        kind: "workflow",
        path: "packages/symphony-first-five",
        reason: "This package defines the backlog to close and triage.",
      },
    ],
    calvin: {
      humanGoal:
        "Judge whether the child actually experiences wonder, competence, and a next step.",
      skillAtoms: [
        {
          action: "The tester plays the whole first session.",
          simulation: "Every implemented system composes into one loop.",
          feedback: "The pass records timing, confusion, delight, and blockers.",
          insight: "The game is or is not ready for an E2E proof.",
        },
      ],
      loopArc: "This validates the complete five-minute arc and its next-session hook.",
      relatedness: "The rubric includes whether parent-child conversation naturally happened.",
      darkPatternRisk: "Flag any pressure, overwhelm, or fake choice that slipped in.",
      schemasImplied: ["FirstFiveAcceptanceReportSchema"],
      storybookProof: "FirstSessionBoard/CompleteFiveMinuteLoop story is reviewed before app pass.",
      verification: ["Manual playthrough", "bun run check:fast", "User-approved E2E plan review"],
    },
    symphony: {
      labels: [...baseLabels, "qa", "acceptance"],
      estimate: "M",
      dispatchGroup: "acceptance",
    },
  }),
] as const satisfies readonly DeepReadonly<FirstFiveMinuteIssueSpec>[];

export const FirstFiveMinuteIssueSpecsSchema = z.array(FirstFiveMinuteIssueSpecSchema).min(1);

export type StaticFirstFiveMinuteIssueSpec = (typeof FIRST_FIVE_MINUTE_ISSUES)[number];
export type StaticFirstFiveMinuteIssueId = StaticFirstFiveMinuteIssueSpec["id"];

export const FIRST_FIVE_MINUTE_ISSUE_BY_ID: ReadonlyMap<string, StaticFirstFiveMinuteIssueSpec> =
  new Map(FIRST_FIVE_MINUTE_ISSUES.map((currentIssue) => [currentIssue.id, currentIssue]));

export function getFirstFiveMinuteIssueById(
  id: string,
): StaticFirstFiveMinuteIssueSpec | undefined {
  return FIRST_FIVE_MINUTE_ISSUE_BY_ID.get(id);
}

export function renderFirstFiveMinuteIssueMarkdown(issueToRender: {
  readonly id: string;
  readonly title: string;
  readonly priority: FirstFiveIssuePriority;
  readonly area: FirstFiveIssueArea;
  readonly phase: FirstFiveIssuePhase;
  readonly playerOutcome: string;
  readonly problem: string;
  readonly currentEvidence: readonly string[];
  readonly scope: readonly string[];
  readonly outOfScope: readonly string[];
  readonly dependencies: readonly string[];
  readonly acceptanceCriteria: readonly string[];
  readonly implementationNotes: readonly string[];
  readonly dataAnchors: DeepReadonly<FirstFiveDataAnchors>;
  readonly calvin: DeepReadonly<FirstFiveCalvinNotes>;
}): string {
  return [
    `# ${issueToRender.id}: ${issueToRender.title}`,
    `Priority: ${issueToRender.priority}`,
    `Area: ${issueToRender.area}`,
    `Phase: ${issueToRender.phase}`,
    `Player outcome: ${issueToRender.playerOutcome}`,
    `Problem: ${issueToRender.problem}`,
    section("Current Evidence", issueToRender.currentEvidence),
    section("Scope", issueToRender.scope),
    section("Out Of Scope", issueToRender.outOfScope),
    section(
      "Dependencies",
      issueToRender.dependencies.length > 0 ? issueToRender.dependencies : ["None"],
    ),
    section("Acceptance Criteria", issueToRender.acceptanceCriteria),
    section("Implementation Notes", issueToRender.implementationNotes),
    [
      "## Data Anchors",
      `Quests: ${inlineList(issueToRender.dataAnchors.quests)}`,
      `Recipes: ${inlineList(issueToRender.dataAnchors.recipes)}`,
      `Elements: ${inlineList(issueToRender.dataAnchors.elements)}`,
      `Upgrades: ${inlineList(issueToRender.dataAnchors.upgrades)}`,
      `Files: ${inlineList(issueToRender.dataAnchors.existingFiles)}`,
    ].join("\n"),
    [
      "## Calvin Notes",
      `Human goal: ${issueToRender.calvin.humanGoal}`,
      `Loop/arc: ${issueToRender.calvin.loopArc}`,
      `Relatedness: ${issueToRender.calvin.relatedness}`,
      `Dark-pattern risk: ${issueToRender.calvin.darkPatternRisk}`,
      `Storybook proof: ${issueToRender.calvin.storybookProof}`,
      `Schemas implied: ${inlineList(issueToRender.calvin.schemasImplied)}`,
      `Verification: ${inlineList(issueToRender.calvin.verification)}`,
    ].join("\n"),
  ].join("\n\n");
}

export const FIRST_FIVE_MINUTE_LINEAR_DRAFTS = FIRST_FIVE_MINUTE_ISSUES.map((currentIssue) => ({
  identifier: currentIssue.id,
  title: currentIssue.title,
  description: renderFirstFiveMinuteIssueMarkdown(currentIssue),
  labels: currentIssue.symphony.labels,
  priority: currentIssue.priority,
  estimate: currentIssue.symphony.estimate,
  dispatchGroup: currentIssue.symphony.dispatchGroup,
}));

export function validateFirstFiveMinuteIssueSpecs(
  issueSpecs: readonly unknown[] = FIRST_FIVE_MINUTE_ISSUES,
): FirstFiveMinuteIssueSpec[] {
  const parsedIssues = FirstFiveMinuteIssueSpecsSchema.parse(issueSpecs);
  const knownIssueIds = new Set<string>();
  const seenIssueIds = new Set<string>();

  for (const currentIssue of parsedIssues) {
    if (knownIssueIds.has(currentIssue.id)) {
      throw new Error(`Duplicate first-five-minute issue id: ${currentIssue.id}`);
    }
    knownIssueIds.add(currentIssue.id);
  }

  for (const currentIssue of parsedIssues) {
    for (const dependencyId of currentIssue.dependencies) {
      if (!knownIssueIds.has(dependencyId)) {
        throw new Error(`${currentIssue.id} depends on unknown issue ${dependencyId}`);
      }
      if (!seenIssueIds.has(dependencyId)) {
        throw new Error(`${currentIssue.id} depends on ${dependencyId} before it is defined`);
      }
    }
    seenIssueIds.add(currentIssue.id);
    validateDataAnchors(currentIssue);
  }

  validateFirstLoopCoverage(parsedIssues);

  return parsedIssues;
}

function validateDataAnchors(issueToValidate: FirstFiveMinuteIssueSpec): void {
  const elementIds = new Set<string>(ELEMENT_CARDS.map((currentElement) => currentElement.id));
  const upgradeIds = new Set<string>(
    ALCHEMY_TABLE_SLOT_UPGRADES.map((currentUpgrade) => currentUpgrade.id),
  );

  for (const questId of issueToValidate.dataAnchors.quests) {
    if (!getAlchemyQuestById(questId)) {
      throw new Error(`${issueToValidate.id} references unknown quest ${questId}`);
    }
  }

  for (const recipeId of issueToValidate.dataAnchors.recipes) {
    if (!getAlchemyRecipeById(recipeId)) {
      throw new Error(`${issueToValidate.id} references unknown recipe ${recipeId}`);
    }
  }

  for (const elementId of issueToValidate.dataAnchors.elements) {
    if (!elementIds.has(elementId)) {
      throw new Error(`${issueToValidate.id} references unknown element ${elementId}`);
    }
  }

  for (const upgradeId of issueToValidate.dataAnchors.upgrades) {
    if (!upgradeIds.has(upgradeId)) {
      throw new Error(`${issueToValidate.id} references unknown upgrade ${upgradeId}`);
    }
  }
}

function validateFirstLoopCoverage(issueSpecs: readonly FirstFiveMinuteIssueSpec[]): void {
  const allQuestIds = new Set(
    issueSpecs.flatMap((currentIssue) => currentIssue.dataAnchors.quests),
  );
  const allRecipeIds = new Set(
    issueSpecs.flatMap((currentIssue) => currentIssue.dataAnchors.recipes),
  );
  const allElementIds = new Set(
    issueSpecs.flatMap((currentIssue) => currentIssue.dataAnchors.elements),
  );
  const allUpgradeIds = new Set(
    issueSpecs.flatMap((currentIssue) => currentIssue.dataAnchors.upgrades),
  );

  for (const requiredQuestId of ["quest:first-water"]) {
    if (!allQuestIds.has(requiredQuestId)) {
      throw new Error(`First-five-minute issues are missing quest anchor ${requiredQuestId}`);
    }
  }

  for (const requiredRecipeId of ["alchemy:water"]) {
    if (!allRecipeIds.has(requiredRecipeId)) {
      throw new Error(`First-five-minute issues are missing recipe anchor ${requiredRecipeId}`);
    }
  }

  for (const requiredElementId of ["element:h", "element:o", "element:c"]) {
    if (!allElementIds.has(requiredElementId)) {
      throw new Error(`First-five-minute issues are missing element anchor ${requiredElementId}`);
    }
  }

  for (const requiredUpgradeId of ["upgrade:table-slot-4"]) {
    if (!allUpgradeIds.has(requiredUpgradeId)) {
      throw new Error(`First-five-minute issues are missing upgrade anchor ${requiredUpgradeId}`);
    }
  }
}

function section(title: string, items: readonly string[]): string {
  return [`## ${title}`, ...items.map((item) => `- ${item}`)].join("\n");
}

function inlineList(items: readonly string[]): string {
  return items.length > 0 ? items.join(", ") : "None";
}
