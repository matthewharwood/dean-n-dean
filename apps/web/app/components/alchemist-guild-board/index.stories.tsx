import type { Meta, StoryObj } from "@storybook/react-vite";

import { AlchemistGuildBoard } from ".";

const meta = {
  title: "Components/AlchemistGuildBoard",
  component: AlchemistGuildBoard,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AlchemistGuildBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Graybox: Story = {};
