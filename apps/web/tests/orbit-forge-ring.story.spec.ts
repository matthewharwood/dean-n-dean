// ASK-FIRST decisions (confirmed with the user — "units + stories + synthetic-tap spec"):
//   1. Level: story — OrbitForgeRing Band Tester, which freezes the comet at a
//      known angle so a synthetic tap scores deterministically.
//   2. Assertion: tapping the canvas with the comet frozen at a given angle
//      produces the expected tier (proves the angular-error → band mapping runs
//      through the real Pixi component + scoring, not just the unit).
//   3. Selector: data-test (the configured testIdAttribute) for the freeze
//      buttons + readout; the canvas element for the tap.
//   4. IDB: fresh. 5. Network: online. 6. Reduced motion: project default.

import { expect, test } from "./fixtures";

const STORY = "components-alchemistguildboard-orbitforgering--band-tester";

const CASES = [
  { freeze: "freeze-0", tier: "perfect" },
  { freeze: "freeze-12", tier: "great" },
  { freeze: "freeze-18", tier: "good" },
  { freeze: "freeze-40", tier: "graze" },
] as const;

test("a tap at a frozen angle scores the expected band", async ({ page }) => {
  await page.goto(`/iframe.html?id=${STORY}`);

  // Scope to the ring's own canvas — Storybook dev injects a full-viewport
  // react-scan overlay canvas, so a bare locator("canvas") is ambiguous.
  const canvas = page.locator('[data-board-section="orbit-forge-ring"] canvas');
  await expect(canvas).toBeVisible();
  const readout = page.getByTestId("ring-last-tap");

  for (const testCase of CASES) {
    await page.getByTestId(testCase.freeze).click();
    await canvas.click();
    await expect(readout).toContainText(testCase.tier);
  }
});
