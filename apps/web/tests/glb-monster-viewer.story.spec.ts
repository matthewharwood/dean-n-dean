// ASK-FIRST decisions (confirmed with the user):
//   1. Level: story (a sibling app-level swap spec lives in glb-monster.app.spec.ts).
//   2. Assertion: the viewer mounts its monster-model backdrop and a sized canvas
//      (renderer.setSize ran → the canvas `width` attribute is non-zero). A 3D
//      canvas's pixels are not DOM-queryable, so structure/size is the contract —
//      same approach as pixi-canvas-demo.
//   3. Selector: data-board-section for the backdrop, locator for the canvas child.
//   4. IDB: fresh. 5. Network: online. 6. Reduced motion: project default
//      (the viewer renders a single static frame, so this is timing-independent).

import { expect, test } from "./fixtures";

const VIEWER = "components-alchemistguildboard-glbmonsterviewer";

test("the monster 3D viewer mounts a sized canvas", async ({ page }) => {
  await page.goto(`/iframe.html?id=${VIEWER}--default`);

  const backdrop = page.locator('[data-board-section="gathering-monster-model"]');
  await expect(backdrop).toBeVisible();

  const canvas = backdrop.locator("canvas");
  await expect(canvas).toBeVisible();
  // `setSize` runs after the dynamic `three` import + renderer init, so poll the
  // drawing-buffer width until it is wired (non-zero).
  await expect
    .poll(async () => Number(await canvas.getAttribute("width")) || 0, { timeout: 15_000 })
    .toBeGreaterThan(0);
});
