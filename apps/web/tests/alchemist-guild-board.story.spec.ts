// ASK-FIRST decisions:
//   1. Level: story.
//   2. Assertion: the Gathering tab is enabled/clickable and switches the board
//      into the gathering panel layout.
//   3. Selector: role-based selectors for the tablist/tabs, visible panel labels
//      for the post-click layout.
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
  await expect(page.getByText("Game Panel", { exact: true })).toBeVisible();
  await expect(page.getByText("Monster Panel", { exact: true })).toBeVisible();
  await expect(page.getByText("Info Panel", { exact: true })).toBeVisible();
});
