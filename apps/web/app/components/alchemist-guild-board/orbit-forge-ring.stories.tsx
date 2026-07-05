import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { type ForgeTapDetail, OrbitForgeRing } from "./orbit-forge-ring";
import type { ForgeTapTier } from "./orbit-forge-scoring";

const meta = {
  title: "Components/AlchemistGuildBoard/OrbitForgeRing",
  component: OrbitForgeRing,
  parameters: { layout: "centered" },
  args: {
    assist: true,
    debugFreezeAngleDeg: null,
    gemTiers: [],
    onTap: () => undefined,
    paused: false,
    socketCount: 5,
    speedDegPerSec: 90,
  },
} satisfies Meta<typeof OrbitForgeRing>;

export default meta;
type Story = StoryObj<typeof meta>;

// Live orbit — tap when the comet reaches the top gate; gems fill the sockets.
function LivePlayground() {
  const socketCount = 5;
  const [gemTiers, setGemTiers] = useState<ForgeTapTier[]>([]);
  const onTap = (detail: ForgeTapDetail) => {
    setGemTiers((previous) =>
      previous.length >= socketCount ? [detail.tier] : [...previous, detail.tier],
    );
  };
  return (
    <div className="grid w-[26rem] max-w-full gap-2 rounded-2xl bg-slate-900 p-6">
      <OrbitForgeRing
        assist
        debugFreezeAngleDeg={null}
        gemTiers={gemTiers}
        onTap={onTap}
        paused={false}
        socketCount={socketCount}
        speedDegPerSec={120}
      />
      <p className="text-center text-xs font-bold text-white/70">
        Tap when the comet reaches the top gate.
      </p>
    </div>
  );
}

export const Live: Story = {
  render: () => <LivePlayground />,
};

// Deterministic band tester: freeze the comet at a known angle, then tap — the
// readout proves the angular error → tier mapping end-to-end. assist OFF so the
// base degree bands apply (perfect ≤9, great ≤14, good ≤22, else graze).
const FREEZE_ANGLES: ReadonlyArray<{ angle: number; label: string }> = [
  { angle: 0, label: "Perfect 0°" },
  { angle: 12, label: "Great 12°" },
  { angle: 18, label: "Good 18°" },
  { angle: 40, label: "Graze 40°" },
];

function BandTester() {
  const [angle, setAngle] = useState(0);
  const [last, setLast] = useState<ForgeTapDetail | null>(null);
  return (
    <div className="grid w-[26rem] max-w-full gap-3 rounded-2xl bg-slate-900 p-6">
      <OrbitForgeRing
        assist={false}
        debugFreezeAngleDeg={angle}
        gemTiers={[]}
        onTap={setLast}
        paused={false}
        socketCount={3}
        speedDegPerSec={90}
      />
      <div className="flex flex-wrap justify-center gap-2">
        {FREEZE_ANGLES.map((freeze) => (
          <button
            key={freeze.angle}
            type="button"
            data-test={`freeze-${freeze.angle}`}
            className="rounded-md bg-amber-400 px-2 py-1 text-xs font-black text-amber-950"
            onClick={() => setAngle(freeze.angle)}
          >
            {freeze.label}
          </button>
        ))}
      </div>
      <p data-test="ring-last-tap" className="text-center text-sm font-black text-white">
        {last ? `${last.tier} @ ${last.deltaDeg.toFixed(1)}°` : "no tap yet"}
      </p>
    </div>
  );
}

export const BandTester_: Story = {
  name: "Band tester",
  render: () => <BandTester />,
};
