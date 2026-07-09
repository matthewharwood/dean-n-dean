import type { Meta, StoryObj } from "@storybook/react-vite";
import type { GatheringPathOption } from "./gathering-loop";
import { GatheringPathMap } from "./gathering-path-map";

const FRESH: GatheringPathOption[] = [
  { completedLevels: [], isComplete: false, level: 1, track: "addition" },
  { completedLevels: [], isComplete: false, level: 1, track: "subtraction" },
  { completedLevels: [], isComplete: false, level: 1, track: "phonics" },
];

// After beating addition level 1: addition offers level 2; the other tracks are
// still only level 1 (no jumping to another track's level 2).
const AFTER_ADDITION_L1: GatheringPathOption[] = [
  { completedLevels: [1], isComplete: false, level: 2, track: "addition" },
  { completedLevels: [], isComplete: false, level: 1, track: "subtraction" },
  { completedLevels: [], isComplete: false, level: 1, track: "phonics" },
];

const ALL_MASTERED: GatheringPathOption[] = [
  { completedLevels: [1, 2], isComplete: true, level: null, track: "addition" },
  { completedLevels: [1, 2], isComplete: true, level: null, track: "subtraction" },
  { completedLevels: [1, 2], isComplete: true, level: null, track: "phonics" },
];

const meta = {
  title: "Components/AlchemistGuildBoard/GatheringPathMap",
  component: GatheringPathMap,
  parameters: { layout: "fullscreen" },
  args: { onSelectTrack: () => undefined },
} satisfies Meta<typeof GatheringPathMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FreshStart: Story = {
  name: "Fresh start (all three at level 1)",
  args: { options: FRESH },
};

export const AfterAdditionLevelOne: Story = {
  name: "After beating addition level 1",
  args: { options: AFTER_ADDITION_L1 },
};

export const AllMastered: Story = {
  args: { options: ALL_MASTERED },
};
