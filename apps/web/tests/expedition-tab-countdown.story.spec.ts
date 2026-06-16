// ASK-FIRST decisions (confirmed with the user):
//   1. Level: story — ExpeditionInProgress (a run in flight while on the Crafting tab).
//   2. Assertion: the Expedition tab shows a live M:SS countdown chip. Asserted via
//      regex (robust to the exact ticking value), and that the chip rides the
//      Expedition tab.
//   3. Selector: data-board-section for the chip; role for the tab.
//   4. IDB: fresh. 5. Network: online. 6. Reduced motion: project default.

import { expect, test } from "./fixtures";

const STORY = "components-alchemistguildboard--expedition-in-progress";

test("the expedition tab shows a live countdown while a run is in flight", async ({ page }) => {
  await page.goto(`/iframe.html?id=${STORY}`);

  const countdown = page.locator('[data-board-section="expedition-tab-countdown"]');
  await expect(countdown).toBeVisible();
  await expect(countdown).toHaveText(/^\d+:\d{2}$/);

  // The countdown rides the Expedition tab itself (visible from the Crafting view).
  const expeditionTab = page.getByRole("tab", { name: /expedition/i });
  await expect(expeditionTab).toBeVisible();
  await expect(
    expeditionTab.locator('[data-board-section="expedition-tab-countdown"]'),
  ).toBeVisible();
});
