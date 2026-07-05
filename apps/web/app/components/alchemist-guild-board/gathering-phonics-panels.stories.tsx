import type { Meta, StoryObj } from "@storybook/react-vite";

import { createActiveGatheringBossTestState, createGatheringRound } from "./gathering-loop";
import {
  GatheringPhonicsBossAnswerPanel,
  GatheringPhonicsBossPanel,
  GatheringPhonicsCardsPanel,
  GatheringPhonicsPromptPanel,
} from "./gathering-phonics-panels";

const NOW = 1_700_000_000_000;
const noop = () => undefined;

const phonicsSolving = createGatheringRound(1, undefined, undefined, "phonics");
const phonicsBoss = createActiveGatheringBossTestState(1, NOW, "phonics");

const meta = {
  title: "Components/AlchemistGuildBoard/GatheringPhonicsPanels",
  component: GatheringPhonicsCardsPanel,
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div className="h-[600px] w-full bg-neutral-50">{Story()}</div>],
  args: { gathering: phonicsSolving, onPickWord: noop },
} satisfies Meta<typeof GatheringPhonicsCardsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WordCards: Story = {
  name: "Answer cards (tap a word)",
};

export const Prompt: Story = {
  name: "Prompt panel (play the sound)",
  render: () => (
    <GatheringPhonicsPromptPanel
      gathering={phonicsSolving}
      status="Play the sound, then tap the word that has it."
    />
  ),
};

export const PromptWithHint: Story = {
  name: "Prompt panel with hint (after 2 wrong)",
  render: () => (
    <GatheringPhonicsPromptPanel
      gathering={{ ...phonicsSolving, wrongAnswerStreak: 2 }}
      status="Not that one. Play the sound again and try another word."
    />
  ),
};

export const BossPrompt: Story = {
  name: "Boss prompt (timed)",
  render: () => <GatheringPhonicsBossPanel boss={phonicsBoss.boss} nowMs={NOW} />,
};

export const BossAnswers: Story = {
  name: "Boss answer cards",
  render: () => <GatheringPhonicsBossAnswerPanel boss={phonicsBoss.boss} onAnswer={noop} />,
};
