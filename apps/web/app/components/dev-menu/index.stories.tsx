import type { Meta, StoryObj } from "@storybook/react-vite";

import { DevMenu } from ".";

const meta = {
  title: "Components/DevMenu",
  component: DevMenu,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="min-h-dvh bg-neutral-100">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DevMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
