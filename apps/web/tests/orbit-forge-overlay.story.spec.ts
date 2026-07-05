// ASK-FIRST decisions (confirmed with the user — "units + stories + synthetic-tap spec"):
//   1. Level: story — OrbitForgeOverlay Default. Under the project's forced
//      reduced-motion this exercises the accessible Pulse Gate path end-to-end
//      (the moving-comet ring is covered by orbit-forge-ring.story.spec.ts).
//   2. Assertion: the overlay opens, runs the countdown → 8 beats → reveal, and
//      hands a ForgeRoundResult back to the host (which renders it). Drives the
//      pulse target whenever it turns green; the round otherwise auto-resolves.
//   3. Selector: data-board-section for the overlay/pulse phase; data-test for
//      the host's result panel.
//   4. IDB: fresh. 5. Network: online. 6. Reduced motion: forced (project default).

import { expect, test } from "./fixtures";

const STORY = "components-alchemistguildboard-orbitforgeoverlay--default";

test("the forge runs the full ritual and returns a result", async ({ page }) => {
  await page.goto(`/iframe.html?id=${STORY}`);

  await expect(page.locator('[data-board-section="orbit-forge-overlay"]')).toBeVisible();

  const result = page.getByTestId("forge-result");

  // Drive the reduced-motion Pulse Gate: tap each beat as it turns green. If the
  // round finishes (or a beat auto-resolves) the ready target stops appearing.
  for (let beat = 0; beat < 8; beat += 1) {
    if (await result.isVisible()) break;
    try {
      await page.locator('[data-pulse-phase="ready"]').click({ timeout: 6000 });
    } catch {
      break;
    }
  }

  await expect(result).toBeVisible({ timeout: 25_000 });
});
