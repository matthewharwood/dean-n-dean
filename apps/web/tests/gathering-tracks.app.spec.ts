// ASK-FIRST decisions (confirmed with the user):
//   1. Level: app — the real route ("/") with real IndexedDB hydration.
//   2. Assertion: a gathering-unlocked save with no path selected hydrates to the
//      learning-path map (three tracks); picking subtraction shows the numeric game
//      with the subtraction prompt and removes the map (locked in); picking phonics
//      shows the listen-and-match prompt + five word cards.
//   3. Selector: data-gathering-path-track / data-gathering-phonics-word /
//      data-board-section attrs + visible status text.
//   4. IDB: seeded — the app creates the "web" DB + default board on first load
//      (selectedTrack === null), we mark gathering unlocked + active in place, then
//      reload so the root <Suspense> re-hydrates onto the map. 5. Network: online.
//   6. Reduced motion: project default.

import { expect, test as fixturesTest } from "./fixtures";

// Wipe IndexedDB exactly once per fresh context (gated by a localStorage flag that
// survives the reload) so our seeded record lives through the re-hydration reload.
const test = fixturesTest.extend<{ freshIDB: void }>({
  freshIDB: async ({ page }, runFixture) => {
    await page.addInitScript(() => {
      try {
        if (localStorage.getItem("idb-wiped-once")) return;
        localStorage.setItem("idb-wiped-once", "1");
      } catch {
        return;
      }
      void (async () => {
        const dbs = (await indexedDB.databases?.()) ?? [];
        await Promise.all(dbs.map((d) => d.name && indexedDB.deleteDatabase(d.name)));
      })();
    });
    await runFixture();
  },
});

const FIRST_WATER_QUEST_ID = "quest:first-water";

// Mark gathering unlocked + active with no path chosen, so the reload hydrates onto
// the learning-path map (selectedTrack stays null — the default).
async function seedGatheringMap(page: import("@playwright/test").Page): Promise<void> {
  await expect(page.getByRole("tablist", { name: /board modes/i })).toBeVisible();
  await page.waitForTimeout(500);

  await page.evaluate(async (questId: string) => {
    const request = <T>(req: IDBRequest<T>): Promise<T> =>
      new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

    const open = indexedDB.open("web", 4);
    const db: IDBDatabase = await new Promise((resolve, reject) => {
      open.onsuccess = () => resolve(open.result);
      open.onerror = () => reject(open.error);
    });

    const tx = db.transaction("alchemistGuildBoards", "readwrite");
    const store = tx.objectStore("alchemistGuildBoards");
    const board = (await request(store.get("alchemist-guild-board"))) as Record<string, unknown> & {
      completedQuestIds: string[];
      gathering: Record<string, unknown>;
    };
    board.activeBoardMode = "gathering";
    if (!board.completedQuestIds.includes(questId)) {
      board.completedQuestIds = [...board.completedQuestIds, questId];
    }
    board.gathering.unlockSeen = true;
    board.gathering.selectedTrack = null;
    await request(store.put(board));
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error);
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }, FIRST_WATER_QUEST_ID);

  await page.reload();
}

test("a gathering-unlocked save with no path hydrates to the learning-path map", async ({
  page,
}) => {
  await page.goto("/");
  await seedGatheringMap(page);

  await expect(page.locator("[data-gathering-path-track]")).toHaveCount(3);
  for (const track of ["addition", "subtraction", "phonics"]) {
    await expect(page.locator(`[data-gathering-path-track="${track}"]`)).toBeVisible();
  }
});

test("picking subtraction locks into the numeric game and removes the map", async ({ page }) => {
  await page.goto("/");
  await seedGatheringMap(page);

  await page.locator('[data-gathering-path-track="subtraction"]').click();

  // The numeric game panel appears with the subtraction prompt; the map is gone
  // (locked in — you cannot switch paths until the boss falls).
  await expect(page.locator('[data-board-section="gathering-game-panel"]')).toBeVisible();
  await expect(page.getByText(/subtraction equation/i)).toBeVisible();
  await expect(page.locator("[data-gathering-path-track]")).toHaveCount(0);
});

test("picking phonics shows the listen-and-match prompt and word cards", async ({ page }) => {
  await page.goto("/");
  await seedGatheringMap(page);

  await page.locator('[data-gathering-path-track="phonics"]').click();

  await expect(page.locator('[data-board-section="gathering-phonics-play-prompt"]')).toBeVisible();
  await expect(page.locator("[data-gathering-phonics-word]")).toHaveCount(5);
});
