// ASK-FIRST decisions (confirmed with the user):
//   1. Level: story — the GatheringStreakMeter Playground, which drives the real
//      increment/break transitions via buttons.
//   2. Assertion: clicking Correct advances the streak number + rarity data-attrs
//      through the tiers; clicking Wrong shatters it back to 0. The reactive
//      contract, not animation timing.
//   3. Selector: role for the drive buttons; data-board-section + data-attrs for
//      the meter and its number.
//   4. IDB: fresh (none needed). 5. Network: online. 6. Reduced motion: project default.

import { expect, test } from "./fixtures";

const PLAYGROUND = "components-alchemistguildboard-gatheringstreakmeter--playground";
const NEW_RECORD = "components-alchemistguildboard-gatheringstreakmeter--new-record";

test("the streak meter climbs through rarity tiers and shatters back to zero", async ({ page }) => {
  await page.goto(`/iframe.html?id=${PLAYGROUND}`);

  const meter = page.locator('[data-board-section="gathering-streak-meter"]');
  const number = page.locator('[data-board-section="gathering-streak-number"]');
  const correct = page.getByRole("button", { name: "Correct (+1)" });
  const wrong = page.getByRole("button", { name: "Wrong (break)" });

  await expect(meter).toHaveAttribute("data-gathering-streak-current", "0");
  await expect(meter).toHaveAttribute("data-gathering-streak-rarity", "common");

  // Climb to the first bonus tier (5 → uncommon, the "ignite" beat).
  for (let i = 0; i < 5; i += 1) await correct.click();
  await expect(meter).toHaveAttribute("data-gathering-streak-current", "5");
  await expect(meter).toHaveAttribute("data-gathering-streak-rarity", "uncommon");
  await expect(number).toHaveText("5");

  // Climb into rare (10, a "milestone" beat).
  for (let i = 0; i < 5; i += 1) await correct.click();
  await expect(meter).toHaveAttribute("data-gathering-streak-current", "10");
  await expect(meter).toHaveAttribute("data-gathering-streak-rarity", "rare");

  // A wrong answer shatters the streak back to zero.
  await wrong.click();
  await expect(meter).toHaveAttribute("data-gathering-streak-current", "0");
  await expect(meter).toHaveAttribute("data-gathering-streak-rarity", "common");
  await expect(number).toHaveText("0");
});

// ASK-FIRST decisions (confirmed with the user):
//   1. Level: story — the NewRecord meter, seeded one tick below a fresh record.
//   2. Assertion: the [data-...record] flash is dormant at rest, then becomes
//      visible once a Correct click overtakes the high score, and the HIGH SCORE
//      readout climbs live to equal the current streak. The reactive contract.
//   3. Selector: data-board-section for the meter parts; role for the drive button.
//   4. IDB: fresh (none). 5. Network: online. 6. Reduced motion: project default
//      (the banner reveals via display, not opacity, so it's motion-agnostic).
test("overtaking the previous best lights NEW HIGH SCORE and climbs the high score live", async ({
  page,
}) => {
  await page.goto(`/iframe.html?id=${NEW_RECORD}`);

  const number = page.locator('[data-board-section="gathering-streak-number"]');
  const best = page.locator('[data-board-section="gathering-streak-best"]');
  const record = page.locator('[data-board-section="gathering-streak-record"]');
  const correct = page.getByRole("button", { name: "Correct (+1)" });

  // Seeded on the verge: streak 12, high score 12, banner dormant.
  await expect(number).toHaveText("12");
  await expect(best).toHaveAttribute("data-gathering-streak-best", "12");
  await expect(record).toBeHidden();

  // One correct answer overtakes the record: the banner lights and the high score
  // climbs live to 13 (== the current streak).
  await correct.click();
  await expect(number).toHaveText("13");
  await expect(record).toBeVisible();
  await expect(best).toHaveAttribute("data-gathering-streak-best", "13");
});
