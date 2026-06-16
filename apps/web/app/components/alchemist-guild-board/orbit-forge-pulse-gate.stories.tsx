import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { OrbitForgePulseGate } from "./orbit-forge-pulse-gate";
import type { ForgeTapTier } from "./orbit-forge-scoring";

const meta = {
  title: "Components/AlchemistGuildBoard/OrbitForgePulseGate",
  component: OrbitForgePulseGate,
  parameters: { layout: "centered" },
  args: {
    active: true,
    assist: true,
    gemTiers: [],
    onTap: () => undefined,
    pulseDurationMs: 1600,
    socketCount: 5,
  },
} satisfies Meta<typeof OrbitForgePulseGate>;

export default meta;
type Story = StoryObj<typeof meta>;

// The reduced-motion timing target — tap when the core turns green. Each tap
// restarts the next beat, so it cycles continuously in isolation.
function PulseGateStage() {
  const socketCount = 5;
  const [beatId, setBeatId] = useState(0);
  const [gemTiers, setGemTiers] = useState<ForgeTapTier[]>([]);
  return (
    <div className="grid place-items-center rounded-2xl bg-slate-900 p-8">
      <OrbitForgePulseGate
        key={beatId}
        active
        assist
        gemTiers={gemTiers}
        onTap={(detail) => {
          setGemTiers((previous) =>
            previous.length >= socketCount ? [detail.tier] : [...previous, detail.tier],
          );
          setBeatId((id) => id + 1);
        }}
        pulseDurationMs={1600}
        socketCount={socketCount}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <PulseGateStage />,
};
