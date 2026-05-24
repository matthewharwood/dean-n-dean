import type { Meta, StoryObj } from "@storybook/react-vite";

import { FIRST_PROFILE_CARD_PROPS, ProfileCard } from "./profile-card";

const meta = {
  title: "Components/AlchemistGuildBoard/ProfileCard",
  component: ProfileCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="h-[14rem] w-[20rem] bg-neutral-300 p-3">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProfileCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Apprentice: Story = {
  args: FIRST_PROFILE_CARD_PROPS,
};
