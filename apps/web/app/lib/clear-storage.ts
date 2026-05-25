import { closeDB } from "~/state/db";
import { cancelPendingWrites } from "~/state/persist";

const DELETE_TIMEOUT_MS = 3000;
const FALLBACK_DB_NAMES = ["web"] as const;

export async function clearAllStorage(): Promise<void> {
  if (typeof window === "undefined") return;

  cancelPendingWrites();
  await closeDB();

  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  }

  if ("caches" in window) {
    const cacheKeys = await caches.keys();
    await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));
  }

  await deleteIndexedDatabases();

  try {
    window.localStorage.clear();
  } catch {
    // Storage can throw in private browsing or restricted security contexts.
  }

  try {
    window.sessionStorage.clear();
  } catch {
    // Storage can throw in private browsing or restricted security contexts.
  }

  clearCookies();
}

async function deleteIndexedDatabases(): Promise<void> {
  if (typeof indexedDB === "undefined") return;

  const databaseNames = await getIndexedDatabaseNames();
  await Promise.all(databaseNames.map(deleteIndexedDatabase));
}

async function getIndexedDatabaseNames(): Promise<string[]> {
  if ("databases" in indexedDB) {
    const databases = await indexedDB.databases();
    return databases.flatMap((database) => (database.name ? [database.name] : []));
  }

  return [...FALLBACK_DB_NAMES];
}

function deleteIndexedDatabase(name: string): Promise<void> {
  return new Promise((resolve) => {
    const request = indexedDB.deleteDatabase(name);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };

    request.onsuccess = finish;
    request.onerror = finish;
    request.onblocked = () => {
      console.warn(`idb: delete blocked for "${name}" - another connection is still open`);
    };

    window.setTimeout(() => {
      if (!done) console.warn(`idb: delete timed out for "${name}"; reloading anyway`);
      finish();
    }, DELETE_TIMEOUT_MS);
  });
}

function clearCookies(): void {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [namePart = ""] = cookie.split("=", 1);
    const name = namePart.trim();
    if (!name) continue;

    // biome-ignore lint/suspicious/noDocumentCookie: Defensive cross-browser cookie clearing.
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    // biome-ignore lint/suspicious/noDocumentCookie: Defensive cross-browser cookie clearing.
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${window.location.pathname}`;
  }
}
