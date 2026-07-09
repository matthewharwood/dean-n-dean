// ASK-FIRST decisions (confirmed with the user):
//   1. Level: app — the multi-item delivery pager is internal to the board (no story).
//   2. Assertion: a multi-part quest (Kitchen Stores = Salt/Charcoal/Ash) shows one dot
//      per part; a partial delivery keeps the claim slider hidden; delivering every part
//      reveals it. Structural only — no drag simulation.
//   3. Selectors: data-quest-delivery-dot, data-board-section="quest-claim-swipe".
//   4. IDB: seeded (selected quest + per-card delivered counts), wipe-once so the seed
//      survives the re-hydration reload. 5. Network: online. 6. Reduced motion: default.

import { expect, test as fixturesTest } from "./fixtures";

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

const KITCHEN_QUEST = "quest:kitchen-salt-and-fuel";

async function seedKitchenQuest(
  page: import("@playwright/test").Page,
  delivered: Record<string, number>,
): Promise<void> {
  await page.evaluate(
    async ({ questId, counts }) => {
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
      const board = (await request(store.get("alchemist-guild-board"))) as Record<
        string,
        unknown
      > & { completedQuestIds: string[]; questDeliveries: Record<string, unknown> };
      board.activeBoardMode = "crafting";
      board.completedQuestIds = [...new Set([...board.completedQuestIds, "quest:first-water"])];
      board.selectedQuestId = questId;
      board.questDeliveries = { ...board.questDeliveries, [questId]: counts };
      await request(store.put(board));
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onabort = () => reject(tx.error);
      });
      db.close();
    },
    { counts: delivered, questId: KITCHEN_QUEST },
  );
  await page.reload();
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1320, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("tablist", { name: /board modes/i })).toBeVisible();
});

test("a multi-part quest shows one delivery dot per part and gates the claim slider", async ({
  page,
}) => {
  await seedKitchenQuest(page, { "material:salt": 1 });

  const pager = page.locator('[data-board-section="quest-delivery-pager"]');
  await expect(pager).toBeVisible();

  // One dot per part (Salt, Charcoal, Ash), exactly one delivered so far.
  const dots = page.locator("[data-quest-delivery-dot]");
  await expect(dots).toHaveCount(3);
  await expect(page.locator('[data-quest-delivery-dot][data-delivered="true"]')).toHaveCount(1);

  // Not every part is in, so the swipe-to-deliver slider stays hidden.
  await expect(page.locator('[data-board-section="quest-claim-swipe"]')).toHaveCount(0);
});

test("delivering every part reveals the claim slider", async ({ page }) => {
  await seedKitchenQuest(page, {
    "material:ash": 1,
    "material:charcoal": 1,
    "material:salt": 1,
  });

  await expect(page.locator('[data-board-section="quest-delivery-pager"]')).toBeVisible();
  await expect(page.locator('[data-quest-delivery-dot][data-delivered="true"]')).toHaveCount(3);
  await expect(page.locator('[data-board-section="quest-claim-swipe"]')).toBeVisible();
});
