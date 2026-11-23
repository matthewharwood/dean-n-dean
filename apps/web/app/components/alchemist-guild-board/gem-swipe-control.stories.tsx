import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";

import { GemSwipeControl } from "./gem-swipe-control";

const meta = {
  title: "Components/AlchemistGuildBoard/GemSwipeControl",
  component: GemSwipeControl,
  tags: ["autodocs"],
  args: {
    ariaLabel: "Swipe to confirm",
    children: null,
    completed: false,
    disabled: false,
    isDragging: false,
    progress: 0,
    purpose: "transmute",
    size: "large",
  },
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[min(46rem,92vw)] rounded-[18px] bg-[#f2ead8] p-8 shadow-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GemSwipeControl>;

export default meta;
type Story = StoryObj<typeof meta>;

function InteractiveGemSwipeShowcase() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  return (
    <div className="grid gap-8 text-[#24170b]">
      <GemSwipeControl
        ariaLabel="Swipe to transmute a crystal flask"
        completed={false}
        disabled={false}
        isDragging={false}
        onKeyboardCommit={() => {
          setProgress(1);
        }}
        onPointerDown={() => {
          setProgress((current) => (current >= 1 ? 0 : Math.min(1, current + 0.18)));
        }}
        progress={progress}
        purpose="transmute"
        size="large"
        trackRef={trackRef}
      >
        <p className="gem-swipe-control-label gem-swipe-control-label-clearance pointer-events-none absolute inset-0 z-10 grid place-items-center text-center font-serif text-2xl italic text-emerald-50">
          Swipe to transmute
        </p>
      </GemSwipeControl>

      <GemSwipeControl
        ariaLabel="Swipe to confirm answer"
        completed={false}
        disabled={false}
        isDragging
        progress={0.68}
        purpose="answer"
        size="standard"
        status="ready"
      >
        <p className="gem-swipe-control-label gem-swipe-control-label-clearance pointer-events-none absolute inset-0 z-10 grid place-items-center whitespace-nowrap text-center text-[13px] font-black uppercase leading-none text-emerald-50">
          Swipe to confirm answer
        </p>
      </GemSwipeControl>

      <GemSwipeControl
        ariaLabel="Finish request with Professor Fizzlebop"
        completed={true}
        disabled={false}
        isDragging={false}
        progress={1}
        purpose="quest-reward"
        size="compact"
      >
        <span className="gem-swipe-control-label pointer-events-none absolute inset-0 z-10 grid place-items-center pl-[5.25rem] pr-3 text-sm font-black text-emerald-50">
          Finish request
        </span>
      </GemSwipeControl>
    </div>
  );
}

export const ThreeGameSizes: Story = {
  render: () => <InteractiveGemSwipeShowcase />,
};

export const Disabled: Story = {
  args: {
    ariaLabel: "Match a recipe before transmuting",
    children: (
      <p className="gem-swipe-control-label gem-swipe-control-label-clearance pointer-events-none absolute inset-0 z-10 grid place-items-center text-center font-serif text-xl italic text-stone-300">
        Match a recipe first
      </p>
    ),
    completed: false,
    disabled: true,
    isDragging: false,
    progress: 0,
    purpose: "transmute",
    size: "standard",
  },
};
