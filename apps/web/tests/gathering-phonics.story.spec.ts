// ASK-FIRST decisions (confirmed with the user):
//   1. Level: story (a sibling app-level flow lives in gathering-tracks.app.spec.ts).
//   2. Assertion: the phonics answer cards render five word options; the prompt
//      panel exposes a "play the sound" button; the boss answer panel also renders
//      five word options.
//   3. Selector: data-gathering-phonics-word + data-board-section attrs.
//   4. IDB: fresh (the story seeds props in-memory). 5. Network: online.
//   6. Reduced motion: project default.

import { expect, test } from "./fixtures";

const PHONICS = "components-alchemistguildboard-gatheringphonicspanels";

test("the phonics answer cards render five word options", async ({ page }) => {
  await page.goto(`/iframe.html?id=${PHONICS}--word-cards`);
  await expect(page.locator("[data-gathering-phonics-word]")).toHaveCount(5);
});

test("the phonics prompt panel offers a play-the-sound button", async ({ page }) => {
  await page.goto(`/iframe.html?id=${PHONICS}--prompt`);
  await expect(page.locator('[data-board-section="gathering-phonics-play-prompt"]')).toBeVisible();
});

test("the phonics boss answer panel renders five word options", async ({ page }) => {
  await page.goto(`/iframe.html?id=${PHONICS}--boss-answers`);
  await expect(page.locator("[data-gathering-phonics-word]")).toHaveCount(5);
});
