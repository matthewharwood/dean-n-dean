// ASK-FIRST decisions (confirmed with the user):
//   1. Level: story.
//   2. Assertion: (a) the +N badge story renders the pill with the right bonus +
//      rarity data-attrs and renders nothing at zero bonus; (b) the seeded
//      reward-phase streak board story shows the Epic rarity chest art and the
//      demand-ordered options wear their +N bonus badges.
//   3. Selector: data-board-section + data-attrs; img src regex for chest art.
//   4. IDB: fresh (stories seed the atom in-memory). 5. Network: online.
//   6. Reduced motion: project default.

import { expect, test } from "./fixtures";

const BADGE = "components-alchemistguildboard-gatheringstreakbadge";
const REWARD_STREAK = "components-alchemistguildboard--gathering-reward-streak";

test("the +N badge renders its bonus value and rarity", async ({ page }) => {
  await page.goto(`/iframe.html?id=${BADGE}--epic-plus-two`);

  const badge = page.locator('[data-board-section="gathering-streak-badge"]');
  await expect(badge).toBeVisible();
  await expect(badge).toHaveText("+2");
  await expect(badge).toHaveAttribute("data-gathering-streak-bonus", "2");
  await expect(badge).toHaveAttribute("data-gathering-streak-rarity", "epic");
});

test("the badge renders nothing when the bonus is zero", async ({ page }) => {
  await page.goto(`/iframe.html?id=${BADGE}--no-bonus`);
  await expect(page.locator('[data-board-section="gathering-streak-badge"]')).toHaveCount(0);
});

test("a hot-streak reward shows the Epic chest art and +N bonus badges", async ({ page }) => {
  await page.goto(`/iframe.html?id=${REWARD_STREAK}`);

  // Streak 16 → Epic → the geode-vault chest art (not the random/common chest).
  const chest = page.locator('[data-board-section="gathering-reward-chest"] img');
  await expect(chest).toHaveAttribute("src", /geode-vault/);

  // Demand-ordered options at streak 16: primary +2, secondary +1, tertiary none.
  await expect(page.locator('[data-gathering-streak-bonus="2"]')).toHaveCount(1);
  await expect(page.locator('[data-gathering-streak-bonus="1"]')).toHaveCount(1);
});
