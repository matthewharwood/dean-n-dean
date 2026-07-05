import { useRef } from "react";
import * as z from "zod";

import { useGlbMonsterViewer } from "~/canvas/use-glb-monster-viewer";
import { defineComponent } from "~/lib/define-component";

// Renders an enemy's 3D model in place of its 2D portrait. The canvas is alpha
// (transparent); the moody deep-sea radial backdrop behind it sets the "glow"
// mood while the lit model floats over it. Three.js lives entirely in the
// `useGlbMonsterViewer` side channel (see that hook); render stays pure.

const GlbMonsterViewerPropsSchema = z.object({
  label: z.string().min(1),
  modelUrl: z.string().min(1),
});

export const GlbMonsterViewer = defineComponent(
  GlbMonsterViewerPropsSchema,
  ({ label, modelUrl }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useGlbMonsterViewer(canvasRef, modelUrl);
    return (
      <div
        data-board-section="gathering-monster-model"
        className="relative size-full overflow-hidden bg-[radial-gradient(circle_at_50%_36%,#173a44_0%,#0c1f2c_52%,#050d15_100%)]"
      >
        <canvas ref={canvasRef} aria-label={`${label} 3D model`} className="block size-full" />
      </div>
    );
  },
);
