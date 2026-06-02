import { getAlchemyQuestById } from "@dean-stack/schemas";
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  createQuestBriefingCardProps,
  FIRST_QUEST_BRIEFING_CARD_PROPS,
  QuestBriefingCard,
} from "./quest-briefing-card";

const glassMineralsQuest = getAlchemyQuestById("quest:glass-minerals");
if (!glassMineralsQuest) throw new Error("Missing glass minerals quest");

const GLASS_BATCH_QUEST_PROPS = createQuestBriefingCardProps(glassMineralsQuest);

const meta = {
  title: "Components/AlchemistGuildBoard/QuestBriefingCard",
  component: QuestBriefingCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="h-[32rem] w-[20rem] bg-neutral-300 p-3">
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

export const CompletedFirstWaterQuest: Story = {
  args: {
    ...FIRST_QUEST_BRIEFING_CARD_PROPS,
    completed: true,
  },
};

export const GlassBatchQuest: Story = {
  args: GLASS_BATCH_QUEST_PROPS,
};

export const RedactedQuest: Story = {
  args: {
    ...FIRST_QUEST_BRIEFING_CARD_PROPS,
    redacted: true,
  },
};
