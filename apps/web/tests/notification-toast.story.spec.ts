// ASK-FIRST decisions (confirmed with the user — "story-spec: dismiss + auto-dismiss"):
//   1. Level: story. The Host playground (raise → stack) for button dismiss, and
//      a Quick (1.5s) story for the auto-dismiss timer. Pure queue/event logic is
//      bun-unit-tested; the cross-tab path is out of scope per the user's choice.
//   2. Assertion: a raised toast appears with its copy; the × button removes it;
//      a short-lived toast auto-dismisses on its own.
//   3. Selector: data-test for the raise buttons; data-board-section for the
//      toast + its close control.
//   4. IDB: fresh. 5. Network: online. 6. Reduced motion: forced (project default
//      — dismiss/auto-dismiss still resolve; motion just snaps).

import { expect, test } from "./fixtures";

const HOST = "components-notificationtoast--host";
const QUICK = "components-notificationtoast--quick-dismiss";

test("a raised toast appears and the × button dismisses it", async ({ page }) => {
  await page.goto(`/iframe.html?id=${HOST}`);

  await page.getByTestId("raise-success").click();

  const toast = page.locator('[data-board-section="notification-toast"]');
  await expect(toast).toBeVisible();
  await expect(toast).toContainText("Expedition returned");

  await toast.locator('[data-board-section="notification-toast-close"]').click();
  await expect(toast).toHaveCount(0);
});

test("a short-lived toast auto-dismisses when its timer runs out", async ({ page }) => {
  await page.goto(`/iframe.html?id=${QUICK}`);

  const toast = page.locator('[data-board-section="notification-toast"]');
  await expect(toast).toBeVisible();

  // 1.5s lifetime + exit; it should be gone (and replaced by the "dismissed" note).
  await expect(toast).toHaveCount(0, { timeout: 5000 });
  await expect(page.getByTestId("toast-gone")).toBeVisible();
});
