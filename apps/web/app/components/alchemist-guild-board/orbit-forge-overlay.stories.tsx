import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { OrbitForgeOverlay } from "./orbit-forge-overlay";
import type { ForgeRoundResult } from "./orbit-forge-scoring";

const meta = {
  title: "Components/AlchemistGuildBoard/OrbitForgeOverlay",
  component: OrbitForgeOverlay,
  parameters: { layout: "fullscreen" },
  args: {
    assist: true,
    ingredientCardIds: ["element:h", "element:o", "element:c"],
    onComplete: () => undefined,
  },
} satisfies Meta<typeof OrbitForgeOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

function OverlayStage({
  ingredientCardIds,
  assist,
}: {
  ingredientCardIds: string[];
  assist: boolean;
}) {
  const [result, setResult] = useState<ForgeRoundResult | null>(null);
  const [runKey, setRunKey] = useState(0);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_50%_30%,#fde7c4,#f6c98a)] p-10">
      <h1 className="text-2xl font-black text-amber-950">The Alchemist's Workbench</h1>
      <p className="mt-2 max-w-md text-sm font-bold text-amber-900/70">
        A faux board behind the blur — when the forge opens it should take over and blur this.
      </p>

      {result ? (
        <div data-test="forge-result" className="mt-6 grid gap-2 rounded-lg bg-white/80 p-4">
          <p className="text-sm font-black text-neutral-900">
            {result.success ? "Forged" : "Unstable"} · indexes [{result.syllableIndexes.join(", ")}]
          </p>
          <button
            type="button"
            data-test="forge-again"
            className="w-fit rounded bg-amber-500 px-3 py-1.5 text-sm font-black text-amber-950"
            onClick={() => {
              setResult(null);
              setRunKey((key) => key + 1);
            }}
          >
            Forge again
          </button>
        </div>
      ) : (
        <OrbitForgeOverlay
          key={runKey}
          assist={assist}
          ingredientCardIds={ingredientCardIds}
          onComplete={setResult}
        />
      )}
    </div>
  );
}

export const Default: Story = {
  render: (args) => (
    <OverlayStage assist={args.assist} ingredientCardIds={args.ingredientCardIds} />
  ),
};

export const TwoIngredient: Story = {
  args: { ingredientCardIds: ["element:h", "element:o"] },
  render: (args) => (
    <OverlayStage assist={args.assist} ingredientCardIds={args.ingredientCardIds} />
  ),
};
