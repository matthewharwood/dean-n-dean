import type { AlchemistGuildGatheringStreak } from "@dean-stack/schemas";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";

import { GatheringStreakMeter } from "./gathering-streak-meter";

function streakState(current: number, longest = current): AlchemistGuildGatheringStreak {
  return { current, lastBrokenAtMs: null, lastIncrementAtMs: null, longest };
}

function MeterStage({ streak }: { streak: AlchemistGuildGatheringStreak }) {
  return (
    <div className="w-[28rem] max-w-full bg-amber-50/40 p-4">
      <GatheringStreakMeter streak={streak} />
    </div>
  );
}

const meta = {
  title: "Components/AlchemistGuildBoard/GatheringStreakMeter",
  component: GatheringStreakMeter,
  parameters: { layout: "centered" },
  render: (args) => <MeterStage streak={args.streak} />,
} satisfies Meta<typeof GatheringStreakMeter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Cold: Story = {
  name: "Cold (streak 0)",
  args: { streak: streakState(0, 8) },
};

export const BuildingToUncommon: Story = {
  args: { streak: streakState(3, 8) },
};

export const Uncommon: Story = {
  args: { streak: streakState(7, 9) },
};

export const Rare: Story = {
  args: { streak: streakState(12, 12) },
};

export const Epic: Story = {
  args: { streak: streakState(16, 16) },
};

export const Legendary: Story = {
  args: { streak: streakState(22, 22) },
};

export const Mythical: Story = {
  args: { streak: streakState(34, 34) },
};

export const Celestial: Story = {
  name: "Celestial (streak 50+)",
  args: { streak: streakState(54, 54) },
};

const GALLERY_STREAKS = [0, 3, 7, 12, 16, 22, 34, 54];

export const Gallery: Story = {
  name: "All tiers",
  args: { streak: streakState(7) },
  render: () => (
    <div className="grid w-[28rem] max-w-full gap-3 bg-amber-50/40 p-4">
      {GALLERY_STREAKS.map((current) => (
        <GatheringStreakMeter key={current} streak={streakState(current, 54)} />
      ))}
    </div>
  ),
};

// Interactive: drive real increment/break beats so the tick-up pop and the
// shatter (with flung shards) actually fire — they key off the reducer-stamped
// timestamps, which only change on a state transition.
function StreakPlayground() {
  const clockRef = useRef(1);
  const [streak, setStreak] = useState<AlchemistGuildGatheringStreak>(streakState(0, 0));

  const tick = () => {
    clockRef.current += 1;
    setStreak((previous) => ({
      current: previous.current + 1,
      lastBrokenAtMs: previous.lastBrokenAtMs,
      lastIncrementAtMs: clockRef.current,
      longest: Math.max(previous.longest, previous.current + 1),
    }));
  };

  const breakStreak = () => {
    clockRef.current += 1;
    setStreak((previous) => ({
      current: 0,
      lastBrokenAtMs: previous.current > 0 ? clockRef.current : previous.lastBrokenAtMs,
      lastIncrementAtMs: previous.lastIncrementAtMs,
      longest: Math.max(previous.longest, previous.current),
    }));
  };

  return (
    <div className="grid w-[28rem] max-w-full gap-4 bg-amber-50/40 p-4">
      <GatheringStreakMeter streak={streak} />
      <div className="flex gap-2">
        <button
          type="button"
          data-test="streak-correct"
          className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-black text-emerald-950"
          onClick={tick}
        >
          Correct (+1)
        </button>
        <button
          type="button"
          data-test="streak-wrong"
          className="rounded-md bg-rose-500 px-3 py-2 text-sm font-black text-rose-950"
          onClick={breakStreak}
        >
          Wrong (break)
        </button>
      </div>
    </div>
  );
}

export const Playground: Story = {
  args: { streak: streakState(0) },
  render: () => <StreakPlayground />,
};
