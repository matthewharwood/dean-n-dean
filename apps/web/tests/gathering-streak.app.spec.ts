// ASK-FIRST decisions (confirmed with the user):
//   1. Level: app — the real route ("/") with real IndexedDB hydration.
//   2. Assertion: a streak seeded into IDB hydrates into the live gathering meter
//      (number + rarity); a seeded reward-phase streak shows the rarity chest art
//      + a +N bonus badge.
//   3. Selector: role for the mode tabs; data-board-section + data-attrs; img src
//      regex for the chest.
//   4. IDB: seeded — the app creates the "web" DB + default board on first load,
//      then we patch that one record in place and reload so the root <Suspense>
//      re-hydrates the seeded state. 5. Network: online. 6. Reduced motion: default.

import { expect, test as fixturesTest } from "./fixtures";

// The default `freshIDB` fixture wipes IndexedDB on EVERY navigation — which
// would delete our seeded record on the reload that is supposed to re-hydrate it.
// Override it to wipe exactly once per (fresh) context, gated by a localStorage
// flag that survives the reload, so the seed lives through it. Still fully
// isolated: Playwright hands each test a brand-new context (empty IDB +
// localStorage).
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

type GatheringStreakSeed = {
  phase: "solving" | "reward";
  current: number;
  longest: number;
  rewardOptionCardIds?: string[];
  monsterHp?: number;
};

async function seedGatheringStreak(
  page: import("@playwright/test").Page,
  seed: GatheringStreakSeed,
): Promise<void> {
  // Wait for the app to have created the "web" DB + default board (hydration
  // done), then let its mount-time debounced persist (~150ms) flush before we
  // patch the record. We must be the LAST writer before the reload re-hydrates.
  await expect(page.getByRole("tablist", { name: /board modes/i })).toBeVisible();
  await page.waitForTimeout(500);

  await page.evaluate(
    async (input: GatheringStreakSeed & { questId: string }) => {
      const request = <T>(req: IDBRequest<T>): Promise<T> =>
        new Promise((resolve, reject) => {
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });

      const open = indexedDB.open("web", 3);
      const db: IDBDatabase = await new Promise((resolve, reject) => {
        open.onsuccess = () => resolve(open.result);
        open.onerror = () => reject(open.error);
      });

      const tx = db.transaction("alchemistGuildBoards", "readwrite");
      const store = tx.objectStore("alchemistGuildBoards");
      const board = (await request(store.get("alchemist-guild-board"))) as Record<
        string,
        unknown
      > & {
        completedQuestIds: string[];
        gathering: Record<string, unknown> & {
          streak: Record<string, unknown>;
          monster: Record<string, unknown>;
        };
      };
      board.activeBoardMode = "gathering";
      if (!board.completedQuestIds.includes(input.questId)) {
        board.completedQuestIds = [...board.completedQuestIds, input.questId];
      }
      board.gathering.unlockSeen = true;
      board.gathering.phase = input.phase;
      board.gathering.streak = {
        current: input.current,
        lastBrokenAtMs: null,
        lastIncrementAtMs: null,
        longest: input.longest,
      };
      if (input.rewardOptionCardIds) {
        board.gathering.rewardOptionCardIds = input.rewardOptionCardIds;
      }
      if (input.monsterHp !== undefined) board.gathering.monster.hp = input.monsterHp;
      await request(store.put(board));
      // Wait for the transaction to COMMIT (not just the put request to resolve)
      // before navigating, or the reload aborts it and the write is lost.
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onabort = () => reject(tx.error);
        tx.onerror = () => reject(tx.error);
      });
      db.close();
    },
    { ...seed, questId: FIRST_WATER_QUEST_ID },
  );

  await page.reload();
}

test("a seeded streak hydrates into the live gathering meter", async ({ page }) => {
  await page.goto("/");
  await seedGatheringStreak(page, { phase: "solving", current: 12, longest: 14 });

  const meter = page.locator('[data-board-section="gathering-streak-meter"]');
  await expect(meter).toBeVisible();
  await expect(meter).toHaveAttribute("data-gathering-streak-current", "12");
  await expect(meter).toHaveAttribute("data-gathering-streak-rarity", "rare");
});

test("a seeded reward streak hydrates the rarity chest art and a +N badge", async ({ page }) => {
  await page.goto("/");
  await seedGatheringStreak(page, {
    phase: "reward",
    current: 16,
    longest: 18,
    rewardOptionCardIds: ["element:h", "element:he", "element:li"],
    monsterHp: 0,
  });

  const chest = page.locator('[data-board-section="gathering-reward-chest"] img');
  await expect(chest).toHaveAttribute("src", /geode-vault/);
  await expect(page.locator('[data-gathering-streak-bonus="2"]')).toHaveCount(1);
});
