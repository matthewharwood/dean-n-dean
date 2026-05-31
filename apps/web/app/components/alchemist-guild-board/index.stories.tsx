import { ALCHEMIST_GUILD_FIRST_WATER_QUEST_ID } from "@dean-stack/schemas";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { alchemistGuildBoardAtom } from "~/state/atoms";
import { AlchemistGuildBoard } from ".";

const meta = {
  title: "Components/AlchemistGuildBoard",
  component: AlchemistGuildBoard,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AlchemistGuildBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

function GatheringReadyBoardStory() {
  const setBoardState = useSetAtom(alchemistGuildBoardAtom);

  useEffect(() => {
    setBoardState((previous) => {
      const completedFirstWater = previous.completedQuestIds.includes(
        ALCHEMIST_GUILD_FIRST_WATER_QUEST_ID,
      );
      if (completedFirstWater && previous.gathering.unlockSeen) return previous;

      return {
        ...previous,
        completedQuestIds: completedFirstWater
          ? previous.completedQuestIds
          : [...previous.completedQuestIds, ALCHEMIST_GUILD_FIRST_WATER_QUEST_ID],
        gathering: {
          ...previous.gathering,
          unlockSeen: true,
        },
      };
    });
  }, [setBoardState]);

  return <AlchemistGuildBoard />;
}

export const Graybox: Story = {
  render: () => <GatheringReadyBoardStory />,
};
