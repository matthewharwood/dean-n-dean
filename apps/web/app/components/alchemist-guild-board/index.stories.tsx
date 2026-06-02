import {
  ALCHEMIST_GUILD_BOARD_DEFAULT,
  ALCHEMIST_GUILD_FIRST_WATER_QUEST_ID,
  type AlchemistGuildBoardState,
} from "@dean-stack/schemas";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useHydrateAtoms } from "jotai/utils";
import { alchemistGuildBoardAtom } from "~/state/atoms";
import { AlchemistGuildBoard } from ".";
import {
  answerGatheringBossChallenge,
  createActiveGatheringBossTestState,
  createGatheringBossReadyState,
  GATHERING_BOSS_REQUIRED_STREAK,
} from "./gathering-loop";

const meta = {
  title: "Components/AlchemistGuildBoard",
  component: AlchemistGuildBoard,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AlchemistGuildBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

const GLASSBLOWER_READY_COMPLETED_QUEST_IDS = [
  ALCHEMIST_GUILD_FIRST_WATER_QUEST_ID,
  "quest:kitchen-salt-and-fuel",
  "quest:field-kit-basics",
];

const GATHERING_READY_BOARD_STATE: AlchemistGuildBoardState = {
  ...ALCHEMIST_GUILD_BOARD_DEFAULT,
  completedQuestIds: [ALCHEMIST_GUILD_FIRST_WATER_QUEST_ID],
  gathering: {
    ...ALCHEMIST_GUILD_BOARD_DEFAULT.gathering,
    unlockSeen: true,
  },
};

const GATHERING_CONFIRM_READY_BOARD_STATE: AlchemistGuildBoardState = {
  ...GATHERING_READY_BOARD_STATE,
  activeBoardMode: "gathering",
  gathering: {
    ...GATHERING_READY_BOARD_STATE.gathering,
    equation: {
      ...GATHERING_READY_BOARD_STATE.gathering.equation,
      selectedValue: GATHERING_READY_BOARD_STATE.gathering.equation.answer,
    },
  },
};

const GLASSBLOWER_QUEST_BOARD_STATE: AlchemistGuildBoardState = {
  ...ALCHEMIST_GUILD_BOARD_DEFAULT,
  completedQuestIds: GLASSBLOWER_READY_COMPLETED_QUEST_IDS,
  gathering: {
    ...ALCHEMIST_GUILD_BOARD_DEFAULT.gathering,
    unlockSeen: true,
  },
  selectedQuestId: "quest:glass-minerals",
};

const EXPEDITION_READY_BOARD_STATE: AlchemistGuildBoardState = {
  ...GLASSBLOWER_QUEST_BOARD_STATE,
  activeBoardMode: "expedition",
  discoveredRecipeIds: ["alchemy:glass"],
  expedition: {
    ...ALCHEMIST_GUILD_BOARD_DEFAULT.expedition,
    unlockAnnounced: true,
    unlockSeen: true,
  },
};

const EXPEDITION_REWARD_READY_BOARD_STATE: AlchemistGuildBoardState = {
  ...EXPEDITION_READY_BOARD_STATE,
  activeBoardMode: "crafting",
  expedition: {
    ...EXPEDITION_READY_BOARD_STATE.expedition,
    readyAtMs: 1,
    readyNotified: true,
    startedAtMs: 1,
    targetCardId: "element:si",
  },
};

const GATHERING_BOSS_READY_BOARD_STATE: AlchemistGuildBoardState = {
  ...GATHERING_READY_BOARD_STATE,
  activeBoardMode: "gathering",
  gathering: {
    ...createGatheringBossReadyState(1, Date.now()),
    unlockSeen: true,
  },
};

const GATHERING_BOSS_ACTIVE_BOARD_STATE: AlchemistGuildBoardState = {
  ...GATHERING_READY_BOARD_STATE,
  activeBoardMode: "gathering",
  gathering: {
    ...createActiveGatheringBossTestState(1, Date.now()),
    unlockSeen: true,
  },
};

let bossRewardGathering = createActiveGatheringBossTestState(1, 1_700_000_000_000);
for (let answerIndex = 0; answerIndex < GATHERING_BOSS_REQUIRED_STREAK; answerIndex += 1) {
  bossRewardGathering = answerGatheringBossChallenge(
    bossRewardGathering,
    bossRewardGathering.boss.equation.answer,
    1_700_000_000_100 + answerIndex * 100,
  );
}

const GATHERING_BOSS_REWARD_BOARD_STATE: AlchemistGuildBoardState = {
  ...GATHERING_READY_BOARD_STATE,
  activeBoardMode: "gathering",
  gathering: {
    ...bossRewardGathering,
    unlockSeen: true,
  },
};

type SeededBoardStoryProps = {
  boardState: AlchemistGuildBoardState;
};

function SeededBoardStory({ boardState }: SeededBoardStoryProps) {
  useHydrateAtoms([[alchemistGuildBoardAtom, boardState]]);
  return <AlchemistGuildBoard />;
}

export const Graybox: Story = {
  render: () => <SeededBoardStory boardState={GATHERING_READY_BOARD_STATE} />,
};

export const GatheringConfirmReady: Story = {
  render: () => <SeededBoardStory boardState={GATHERING_CONFIRM_READY_BOARD_STATE} />,
};

export const GatheringBossReady: Story = {
  render: () => <SeededBoardStory boardState={GATHERING_BOSS_READY_BOARD_STATE} />,
};

export const GatheringBossActive: Story = {
  render: () => <SeededBoardStory boardState={GATHERING_BOSS_ACTIVE_BOARD_STATE} />,
};

export const GatheringBossReward: Story = {
  render: () => <SeededBoardStory boardState={GATHERING_BOSS_REWARD_BOARD_STATE} />,
};

export const GlassblowerQuestIpad: Story = {
  render: () => <SeededBoardStory boardState={GLASSBLOWER_QUEST_BOARD_STATE} />,
};

export const ExpeditionReady: Story = {
  render: () => <SeededBoardStory boardState={EXPEDITION_READY_BOARD_STATE} />,
};

export const ExpeditionRewardReady: Story = {
  render: () => <SeededBoardStory boardState={EXPEDITION_REWARD_READY_BOARD_STATE} />,
};
