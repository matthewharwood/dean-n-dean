import { Cog, RotateCcw } from "lucide-react";
import { createContext, type ReactNode, use, useEffect, useRef, useState } from "react";
import * as z from "zod";
import { clearAllStorage } from "~/lib/clear-storage";
import { defineComponent } from "~/lib/define-component";

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
  const [busy, setBusy] = useState(false);
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
    <DevMenuContext.Provider value={{ close: () => setOpen(false) }}>
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
