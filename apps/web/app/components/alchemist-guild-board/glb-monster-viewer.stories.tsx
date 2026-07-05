import type { Meta, StoryObj } from "@storybook/react-vite";

import { GlbMonsterViewer } from "./glb-monster-viewer";

// Sized to the monster card's portrait area. The placeholder GLB at
// public/enemy-models/hadal-glow-polyp-echo.glb is served at the Storybook root.
const meta = {
  title: "Components/AlchemistGuildBoard/GlbMonsterViewer",
  component: GlbMonsterViewer,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="h-[260px] w-[208px] overflow-hidden rounded-[8px] border-2 border-neutral-300 shadow-lg">
        {Story()}
      </div>
    ),
  ],
  args: {
    label: "Glow Polyp Echo",
    modelUrl: "/enemy-models/hadal-glow-polyp-echo.glb",
  },
} satisfies Meta<typeof GlbMonsterViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Monster 3D model (placeholder GLB)",
};
