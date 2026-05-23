import {
  ALCHEMIST_GUILD_BOARD_DEFAULT,
  ALCHEMIST_GUILD_BOARD_ID,
  type AlchemistGuildBoardState,
  AlchemistGuildBoardStateSchema,
  type Progress,
  ProgressSchema,
  SETTINGS_DEFAULT,
  type Settings,
  SettingsSchema,
} from "@dean-stack/schemas";

import { getDB } from "./db";

export type HydratedState = {
  alchemistGuildBoard: AlchemistGuildBoardState;
  progress: ReadonlyMap<string, Progress>;
  settings: Settings;
};

export type StoreName = keyof HydratedState;

let resolvedSnapshot: HydratedState | null = null;

export function getHydratedSnapshot(): HydratedState | null {
  return resolvedSnapshot;
}

// Started at module-evaluation time. The root <Suspense> boundary calls
// `use(idbHydrationPromise)` once; until it resolves, no atom is read.
// In a prerender / SSR-shell context (no indexedDB), resolves with empty state.
export const idbHydrationPromise: Promise<HydratedState> = (async () => {
  if (typeof indexedDB === "undefined") {
    const empty: HydratedState = {
      alchemistGuildBoard: ALCHEMIST_GUILD_BOARD_DEFAULT,
      progress: new Map(),
      settings: SETTINGS_DEFAULT,
    };
    resolvedSnapshot = empty;
    return empty;
  }
  const db = await getDB();
  const [rawAlchemistGuildBoard, rawProgress, rawSettings] = await Promise.all([
    db.get("alchemistGuildBoards", ALCHEMIST_GUILD_BOARD_ID),
    db.getAll("progress"),
    db.get("settings", "settings"),
  ]);
  const progress = new Map<string, Progress>();
  for (const raw of rawProgress) {
    const parsed = ProgressSchema.safeParse(raw);
    if (parsed.success) progress.set(parsed.data.id, parsed.data);
  }
  const alchemistGuildBoard = AlchemistGuildBoardStateSchema.parse(
    rawAlchemistGuildBoard ?? ALCHEMIST_GUILD_BOARD_DEFAULT,
  );
  const settings = SettingsSchema.parse(rawSettings ?? SETTINGS_DEFAULT);
  const snapshot: HydratedState = { alchemistGuildBoard, progress, settings };
  resolvedSnapshot = snapshot;
  return snapshot;
})();
