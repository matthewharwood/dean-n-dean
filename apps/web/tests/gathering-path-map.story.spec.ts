// ASK-FIRST decisions (confirmed with the user):
//   1. Level: story (a sibling app-level flow lives in gathering-tracks.app.spec.ts).
//   2. Assertion: the learning-path map renders all three track cards with their
//      data-gathering-path-track ids; after beating addition L1, addition offers
//      level 2 while the other tracks stay at level 1 (the lock rule, visible).
//   3. Selector: data-gathering-path-track + data-gathering-path-level attrs.
//   4. IDB: fresh (the story seeds props in-memory). 5. Network: online.
//   6. Reduced motion: project default.

import { expect, test } from "./fixtures";

const MAP = "components-alchemistguildboard-gatheringpathmap";

test("the learning-path map shows all three starting paths at level 1", async ({ page }) => {
  await page.goto(`/iframe.html?id=${MAP}--fresh-start`);

  await expect(page.locator("[data-gathering-path-track]")).toHaveCount(3);
  for (const track of ["addition", "subtraction", "phonics"]) {
    const card = page.locator(`[data-gathering-path-track="${track}"]`);
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute("data-gathering-path-level", "1");
  }
});

test("after beating addition level 1, only addition offers level 2", async ({ page }) => {
  await page.goto(`/iframe.html?id=${MAP}--after-addition-level-one`);

  await expect(page.locator('[data-gathering-path-track="addition"]')).toHaveAttribute(
    "data-gathering-path-level",
    "2",
  );
  await expect(page.locator('[data-gathering-path-track="subtraction"]')).toHaveAttribute(
    "data-gathering-path-level",
    "1",
  );
  await expect(page.locator('[data-gathering-path-track="phonics"]')).toHaveAttribute(
    "data-gathering-path-level",
    "1",
  );
});
