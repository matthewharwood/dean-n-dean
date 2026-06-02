import { ALCHEMIST_GUILD_FIRST_WATER_QUEST_ID } from "@dean-stack/schemas";
import { useAtomValue, useSetAtom } from "jotai";
import { BarChart3, Cog, RotateCcw } from "lucide-react";
import { createContext, type ReactNode, Suspense, use, useEffect, useRef, useState } from "react";
import * as z from "zod";
import {
  createActiveGatheringBossTestState,
  createGatheringLevelMasteryReport,
  createGatheringSpacedRepetitionReport,
} from "~/components/alchemist-guild-board/gathering-loop";
import { clearAllStorage } from "~/lib/clear-storage";
import { defineComponent } from "~/lib/define-component";
import { alchemistGuildBoardAtom } from "~/state/atoms";
import { idbHydrationPromise } from "~/state/hydration";

type DevMenuApi = { close: () => void };

const DevMenuContext = createContext<DevMenuApi | null>(null);

// fallow-ignore-next-line unused-export
export function useDevMenu(): DevMenuApi {
  const context = use(DevMenuContext);
  if (!context) throw new Error("useDevMenu: must be used inside <DevMenu>");
  return context;
}

const DevMenuPropsSchema = z.object({
  children: z.custom<ReactNode>().optional(),
});

export const DevMenu = defineComponent(DevMenuPropsSchema, ({ children }) => {
  const [open, setOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [api] = useState<DevMenuApi>(() => ({ close: () => setOpen(false) }));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current) return;
      if (event.target instanceof Node && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleClearState = async () => {
    if (busy) return;
    const confirmed = window.confirm(
      "Clear ALL local game state and reload?\n\nThis wipes saved progress, settings, cached assets, and browser storage for this app.",
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      await clearAllStorage();
    } finally {
      window.location.reload();
    }
  };

  return (
    <DevMenuContext.Provider value={api}>
      <div ref={containerRef} className="fixed right-3 top-3 z-[100]">
        <button
          type="button"
          aria-label="Open settings menu"
          aria-expanded={open}
          aria-haspopup="menu"
          data-test="dev-menu-button"
          className="grid size-10 place-items-center rounded-full border border-sky-950/20 bg-white/80 text-sky-950 shadow-[0_8px_24px_rgba(15,23,42,0.18)] backdrop-blur-md transition-[background-color,color,transform] hover:bg-white active:scale-95"
          onClick={() => {
            setOpen((currentOpen) => !currentOpen);
          }}
        >
          <Cog className="size-5" strokeWidth={2.25} aria-hidden="true" />
        </button>

        {open ? (
          <div
            role="menu"
            aria-label="Settings menu"
            data-test="dev-menu-panel"
            className="absolute right-0 top-full mt-2 min-w-56 overflow-hidden rounded-[8px] border border-white/55 bg-white/90 text-neutral-950 shadow-[0_18px_36px_rgba(15,23,42,0.22)] backdrop-blur-md"
          >
            <button
              type="button"
              role="menuitem"
              disabled={busy}
              data-test="dev-menu-clear-state"
              className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm font-black text-red-700 transition-colors hover:bg-red-50 active:bg-red-100 disabled:cursor-wait disabled:opacity-60"
              onClick={handleClearState}
            >
              <span>{busy ? "Clearing..." : "Clear state"}</span>
              <RotateCcw className="size-4" strokeWidth={2.25} aria-hidden="true" />
            </button>
            <button
              type="button"
              role="menuitem"
              aria-expanded={adminOpen}
              className="flex w-full items-center justify-between gap-3 border-t border-neutral-950/10 px-3 py-2.5 text-left text-sm font-black text-sky-950 transition-colors hover:bg-sky-50 active:bg-sky-100"
              onClick={() => {
                setAdminOpen((current) => !current);
              }}
            >
              <span>Admin panel</span>
              <BarChart3 className="size-4" strokeWidth={2.25} aria-hidden="true" />
            </button>
            {adminOpen ? (
              <Suspense fallback={<GatheringSpacedRepetitionAdminPanelLoading />}>
                <GatheringSpacedRepetitionAdminPanel />
              </Suspense>
            ) : null}
            {children ? (
              <div className="border-t border-neutral-950/10" data-test="dev-menu-extra">
                {children}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </DevMenuContext.Provider>
  );
});

const GatheringSpacedRepetitionAdminPanelLoading = defineComponent(z.object({}), () => (
  <section
    className="grid w-80 max-w-[calc(100vw-1.5rem)] gap-2 border-t border-neutral-950/10 p-3 text-[11px] font-bold text-neutral-700"
    aria-label="Loading gathering spaced repetition admin report"
  >
    Loading gathering memory…
  </section>
));

const GatheringSpacedRepetitionAdminPanelPropsSchema = z.object({});

const GatheringSpacedRepetitionAdminPanel = defineComponent(
  GatheringSpacedRepetitionAdminPanelPropsSchema,
  function GatheringSpacedRepetitionAdminPanelView() {
    use(idbHydrationPromise);
    const boardState = useAtomValue(alchemistGuildBoardAtom);
    const setBoardState = useSetAtom(alchemistGuildBoardAtom);
    const report = createGatheringSpacedRepetitionReport(boardState.gathering.spacedRepetition);
    const mastery = createGatheringLevelMasteryReport(boardState.gathering);
    const attentionFacts =
      report.needsAttention.length > 0 ? report.needsAttention : report.facts.slice(0, 3);
    const handleJumpToBossFight = () => {
      const nowMs = Date.now();
      setBoardState((previous) => ({
        ...previous,
        activeBoardMode: "gathering",
        completedQuestIds: previous.completedQuestIds.includes(ALCHEMIST_GUILD_FIRST_WATER_QUEST_ID)
          ? previous.completedQuestIds
          : [...previous.completedQuestIds, ALCHEMIST_GUILD_FIRST_WATER_QUEST_ID],
        gathering: {
          ...createActiveGatheringBossTestState(
            previous.gathering.levelProgress.currentLevel,
            nowMs,
          ),
          unlockSeen: true,
        },
      }));
    };

    return (
      <section
        data-test="dev-menu-admin-panel"
        className="grid w-80 max-w-[calc(100vw-1.5rem)] gap-3 border-t border-neutral-950/10 p-3"
        aria-label="Gathering spaced repetition admin report"
      >
        <div className="grid gap-1">
          <h2 className="text-xs font-black uppercase leading-none text-neutral-950">
            Gathering memory
          </h2>
          <p className="text-[11px] font-bold leading-snug text-neutral-700">
            Addition facts are scheduled by difficulty, stability, retrievability, and due time.
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-1 text-[11px] leading-tight">
          <AdminMetric label="Accuracy" value={formatAdminPercent(report.accuracy)} />
          <AdminMetric label="Recall" value={formatAdminPercent(report.averageRetrievability)} />
          <AdminMetric label="Due now" value={String(report.dueCount)} />
          <AdminMetric label="Learning" value={String(report.learningCount)} />
          <AdminMetric label="Facts" value={String(report.totalFacts)} />
          <AdminMetric label="Attempts" value={String(report.totalAttempts)} />
          <AdminMetric label="Difficulty" value={report.averageDifficulty.toFixed(1)} />
          <AdminMetric label="Stability" value={formatAdminDays(report.averageStabilityDays)} />
        </dl>
        <div className="grid gap-1 rounded-[6px] border border-fuchsia-900/15 bg-fuchsia-50/70 p-2">
          <div className="grid grid-cols-[1fr_auto] items-center gap-2">
            <span className="text-[10px] font-black uppercase leading-none text-fuchsia-950">
              Boss gate
            </span>
            <span className="font-mono text-[11px] font-black leading-none text-fuchsia-950">
              L{mastery.currentLevel} {formatAdminPercent(mastery.progress)}
            </span>
          </div>
          <button
            type="button"
            className="min-h-9 rounded-[5px] border border-fuchsia-950/20 bg-fuchsia-600 px-3 text-[11px] font-black uppercase leading-none text-white shadow-[0_6px_12px_rgba(112,26,117,0.18)] transition-[background-color,transform] hover:bg-fuchsia-700 active:translate-y-px"
            onClick={handleJumpToBossFight}
          >
            Jump to boss fight
          </button>
        </div>
        <div className="grid gap-1">
          <h3 className="text-[10px] font-black uppercase leading-none text-neutral-600">
            Needs attention
          </h3>
          {attentionFacts.length > 0 ? (
            <div className="grid gap-1">
              {attentionFacts.map((fact) => (
                <div
                  key={fact.factId}
                  className="grid grid-cols-[1fr_auto] gap-2 rounded-[5px] border border-neutral-950/10 bg-white/70 px-2 py-1.5 text-[11px] leading-tight"
                >
                  <span className="font-black text-neutral-950">{fact.label}</span>
                  <span className="font-mono font-black uppercase text-neutral-600">
                    {fact.status}
                  </span>
                  <span className="text-neutral-700">
                    {formatAdminPercent(fact.accuracy)} correct, {fact.wrongCount} misses
                  </span>
                  <span className="font-mono text-neutral-700">
                    R {formatAdminPercent(fact.retrievability)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-[5px] border border-neutral-950/10 bg-white/70 p-2 text-[11px] font-bold leading-snug text-neutral-700">
              No gathering answers have been reviewed yet.
            </p>
          )}
        </div>
      </section>
    );
  },
);

const AdminMetricPropsSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

const AdminMetric = defineComponent(AdminMetricPropsSchema, ({ label, value }) => (
  <div className="rounded-[5px] border border-neutral-950/10 bg-white/70 px-2 py-1.5">
    <dt className="font-black uppercase text-neutral-500">{label}</dt>
    <dd className="mt-0.5 font-mono text-sm font-black text-neutral-950">{value}</dd>
  </div>
));

function formatAdminPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatAdminDays(value: number): string {
  if (value < 1) return `${Math.round(value * 24 * 60)}m`;
  return `${value.toFixed(1)}d`;
}
