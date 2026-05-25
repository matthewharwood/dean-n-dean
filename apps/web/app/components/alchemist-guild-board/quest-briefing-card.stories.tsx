import type { Meta, StoryObj } from "@storybook/react-vite";

import { FIRST_QUEST_BRIEFING_CARD_PROPS, QuestBriefingCard } from "./quest-briefing-card";

const meta = {
  title: "Components/AlchemistGuildBoard/QuestBriefingCard",
  component: QuestBriefingCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[20rem] bg-neutral-300 p-3">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QuestBriefingCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstWaterQuest: Story = {
  args: FIRST_QUEST_BRIEFING_CARD_PROPS,
};

export const FirstWaterQuestWithDeveloperNotes: Story = {
  args: {
    ...FIRST_QUEST_BRIEFING_CARD_PROPS,
    developerNotesVisible: true,
  },
};

export const RedactedQuest: Story = {
  args: {
    ...FIRST_QUEST_BRIEFING_CARD_PROPS,
    redacted: true,
  },
};
