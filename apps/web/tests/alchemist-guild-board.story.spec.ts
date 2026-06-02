// ASK-FIRST decisions:
//   1. Level: story.
//   2. Assertion: clicking the Gathering tab flips the board layout — the gathering
//      panels become visible AND the crafting-mode sections are gone, proving a real
//      layout switch rather than additive panels.
//   3. Selector: role-based for the tablist/tabs; data-board-section attributes for
//      the panels (decoupled from display label text, which now lives in attributes).
//   4. IDB: fresh.
//   5. Network: online.
//   6. Reduced motion: project default.

import { expect, test } from "./fixtures";

const STORY_ID = "components-alchemistguildboard--graybox";

test("AlchemistGuildBoard switches to gathering mode from the tab under inventory", async ({
  page,
}) => {
  await page.goto(`/iframe.html?id=${STORY_ID}`);

  const modeTabs = page.getByRole("tablist", { name: /board modes/i });
  const gatheringTab = modeTabs.getByRole("tab", { name: /gathering/i });

  await expect(gatheringTab).toBeEnabled();
  await gatheringTab.click();

  await expect(gatheringTab).toHaveAttribute("aria-selected", "true");

  // Gathering layout is present.
  await expect(page.locator('[data-board-section="gathering-game-panel"]')).toBeVisible();
  await expect(page.locator('[data-board-section="gathering-monster-panel"]')).toBeVisible();
  await expect(page.locator('[data-board-section="gathering-info-panel"]')).toBeVisible();

  // Crafting layout is gone (the same containers swap their data-board-section).
  await expect(page.locator('[data-board-section="periodic-table-dock"]')).toHaveCount(0);
  await expect(page.locator('[data-board-section="alchemy-workbench"]')).toHaveCount(0);
});
