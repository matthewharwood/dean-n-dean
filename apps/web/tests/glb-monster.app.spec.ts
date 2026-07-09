// ASK-FIRST decisions (confirmed with the user):
//   1. Level: app — the real route ("/") with real IndexedDB hydration.
//   2. Assertion: when the current enemy has a generated 3D model, the monster card
//      renders the 3D viewer (data-board-section="gathering-monster-model") in place
//      of the 2D portrait <img> (no `enemies/...webp` image remains).
//   3. Selector: data-board-section + an img[src*=...] absence check.
//   4. IDB: seeded — set the live monster to the modelled enemy, wipe-once so the
//      seed survives the re-hydration reload. 5. Network: online.
//   6. Reduced motion: project default (the viewer renders a single static frame).

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

const MODELLED_ENEMY_ID = "hadal-glow-polyp-echo";

async function seedModelledMonster(page: import("@playwright/test").Page): Promise<void> {
  await expect(page.getByRole("tablist", { name: /board modes/i })).toBeVisible();
  await page.waitForTimeout(500);
  await page.evaluate(async (enemyId: string) => {
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
      gathering: Record<string, unknown> & { monster: Record<string, unknown> };
    };
    board.activeBoardMode = "gathering";
    board.completedQuestIds = [...board.completedQuestIds, "quest:first-water"];
    board.gathering.unlockSeen = true;
    board.gathering.selectedTrack = "addition";
    board.gathering.monster = {
      elementType: "water",
      hp: 12,
      id: `monster:${enemyId}`,
      imagePath: `enemies/${enemyId}.webp`,
      maxHp: 12,
      name: "Glow Polyp Echo",
    };
    await request(store.put(board));
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error);
    });
    db.close();
  }, MODELLED_ENEMY_ID);
  await page.reload();
}

test("an enemy with a 3D model shows the viewer instead of the portrait image", async ({
  page,
}) => {
  await page.goto("/");
  await seedModelledMonster(page);

  const card = page.locator('[data-board-section="gathering-monster-card"]').first();
  await expect(card.locator('[data-board-section="gathering-monster-model"]')).toBeVisible();
  await expect(card.locator('[data-board-section="gathering-monster-model"] canvas')).toBeVisible();
  // The 2D portrait is gone — no enemies/<id>.webp image is rendered for this enemy.
  await expect(card.locator(`img[src*="enemies/${MODELLED_ENEMY_ID}"]`)).toHaveCount(0);
});
