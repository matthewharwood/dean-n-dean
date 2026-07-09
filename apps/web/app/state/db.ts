import {
  ALCHEMIST_GUILD_BOARD_DEFAULT,
  type AlchemistGuildBoardState,
  type Progress,
  SETTINGS_DEFAULT,
  type Settings,
} from "@dean-stack/schemas";
import { type DBSchema, type IDBPDatabase, openDB } from "idb";

export interface AppDB extends DBSchema {
  alchemistGuildBoards: { key: string; value: AlchemistGuildBoardState };
  progress: { key: string; value: Progress };
  settings: { key: string; value: Settings };
}

const DB_NAME = "web";
const DB_VERSION = 4;

// A pre-track save carries its addition progress in the live gathering fields with
// no `selectedTrack`. Hydration would default `selectedTrack` to null and bounce
// the player to the learning-path map — and selecting "addition" there loads the
// (empty) track archive, wiping their live progress. So v4 marks any save with real
// addition progress as already-on the addition path; brand-new saves stay on the map.
function hasExistingAdditionProgress(gathering: AlchemistGuildBoardState["gathering"]): boolean {
  if (gathering.selectedTrack != null) return false;
  return (
    Object.keys(gathering.spacedRepetition.facts).length > 0 ||
    gathering.round > 1 ||
    gathering.gatherLog.length > 0 ||
    gathering.boss.phase !== "idle" ||
    gathering.levelProgress.completedBossLevels.length > 0
  );
}

let dbPromise: Promise<IDBPDatabase<AppDB>> | undefined;
let closed = false;

export function getDB(): Promise<IDBPDatabase<AppDB>> {
  if (closed) {
    return Promise.reject(new Error("idb: closed; reload pending"));
  }
  if (dbPromise) return dbPromise;
  dbPromise = openDB<AppDB>(DB_NAME, DB_VERSION, {
    async upgrade(db, oldVersion, _newVersion, tx) {
      // Cumulative migrations — every hop must run for users on older versions.
      // Equivalent to `switch(oldVersion)` with fall-through; the `<` form is
      // biome-clean and just as canonical.
      if (oldVersion < 1) {
        db.createObjectStore("progress", { keyPath: "id" });
      }
      if (oldVersion < 2) {
        const settings = db.createObjectStore("settings", { keyPath: "id" });
        void settings.put(SETTINGS_DEFAULT);
      }
      if (oldVersion < 3) {
        const alchemistGuildBoards = db.createObjectStore("alchemistGuildBoards", {
          keyPath: "id",
        });
        void alchemistGuildBoards.put(ALCHEMIST_GUILD_BOARD_DEFAULT);
      }
      if (oldVersion < 4) {
        // Multi-track gathering: keep existing addition players on the addition path
        // so the new learning-path map never strands their in-flight progress.
        const store = tx.objectStore("alchemistGuildBoards");
        for (let cursor = await store.openCursor(); cursor; cursor = await cursor.continue()) {
          const record = cursor.value;
          if (!hasExistingAdditionProgress(record.gathering)) continue;
          await cursor.update({
            ...record,
            gathering: { ...record.gathering, selectedTrack: "addition" },
          });
        }
      }
    },
    blocked() {
      console.warn("idb: blocked by an older connection");
    },
    blocking() {
      void getDB().then((db) => db.close());
      dbPromise = undefined;
    },
    terminated() {
      dbPromise = undefined;
    },
  });
  return dbPromise.catch((err) => {
    dbPromise = undefined;
    throw err;
  });
}

// Close the open connection and refuse further `getDB()` calls so
// `clearAllStorage` can `deleteDatabase` without our own handle blocking
// it AND without a pending debounced persist call sneaking a fresh
// connection in mid-clear. Terminal — the page is expected to reload
// immediately after.
export async function closeDB(): Promise<void> {
  closed = true;
  if (!dbPromise) return;
  const promise = dbPromise;
  dbPromise = undefined;
  try {
    const db = await promise;
    db.close();
  } catch {
    // Open never resolved (e.g. VersionError mid-bump). Nothing to close.
  }
}
