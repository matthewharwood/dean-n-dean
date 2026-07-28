import { Backpack, LockKeyhole, X } from "lucide-react";
import type { ReactNode } from "react";
import * as z from "zod";

import { defineComponent } from "~/lib/define-component";

export const InventorySurfaceSchema = z.enum(["quick-strip", "field-bag"]);
export type InventorySurface = z.infer<typeof InventorySurfaceSchema>;

export const InventoryBagButtonPropsSchema = z.object({
  controlsId: z.string().min(1),
  expanded: z.boolean(),
  itemCount: z.int().min(0),
  onToggle: z.custom<() => void>(),
  unlocked: z.boolean(),
  unlockHint: z.string().min(1),
});

export const InventoryBagPanelPropsSchema = z.object({
  children: z.custom<ReactNode>(),
  id: z.string().min(1),
  itemCount: z.int().min(0),
  onClose: z.custom<() => void>(),
  reserveCapacity: z.int().min(1),
  surface: InventorySurfaceSchema,
});

export const InventoryBagButton = defineComponent(
  InventoryBagButtonPropsSchema,
  ({ controlsId, expanded, itemCount, onToggle, unlocked, unlockHint }) => {
    const stateLabel = unlocked ? "Unlocked" : "Locked";
    const actionLabel = expanded ? "Close" : "Open";
    const ariaLabel = unlocked
      ? `${actionLabel} Field Bag. ${stateLabel}. ${itemCount} item stacks.`
      : `Field Bag locked. ${unlockHint}.`;

    return (
      <button
        type="button"
        data-board-section="inventory-bag-button"
        data-inventory-bag-unlocked={unlocked ? "true" : "false"}
        aria-controls={controlsId}
        aria-disabled={!unlocked}
        aria-expanded={unlocked ? expanded : false}
        aria-label={ariaLabel}
        onClick={() => {
          if (unlocked) onToggle();
        }}
        title={unlocked ? `${actionLabel} Field Bag` : unlockHint}
        className={`pointer-events-auto relative grid size-10 place-items-center justify-self-start rounded-[10px] border text-sky-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.86),0_5px_12px_rgba(15,23,42,0.1)] backdrop-blur-md transition-[background-color,box-shadow,transform] motion-reduce:transition-none motion-reduce:active:scale-100 ${
          unlocked
            ? "cursor-pointer border-amber-900/20 bg-white/70 hover:bg-white/85 active:scale-[0.96]"
            : "cursor-not-allowed border-neutral-700/20 bg-neutral-100/65 text-neutral-600 opacity-80"
        }`}
      >
        <span className="grid size-8 place-items-center rounded-[8px] border border-sky-950/15 bg-sky-50/90">
          {unlocked ? (
            <Backpack className="size-5 stroke-[2.4]" aria-hidden="true" />
          ) : (
            <LockKeyhole className="size-4 stroke-[2.6]" aria-hidden="true" />
          )}
        </span>
        <span
          aria-hidden="true"
          className={`absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full border px-1 py-0.5 text-[8px] font-black leading-none ${
            unlocked
              ? "border-sky-950/20 bg-sky-950 text-white"
              : "border-neutral-700/20 bg-neutral-200 text-neutral-700"
          }`}
        >
          {unlocked ? itemCount : "!"}
        </span>
      </button>
    );
  },
);

export const InventoryBagPanel = defineComponent(
  InventoryBagPanelPropsSchema,
  ({ children, id, itemCount, onClose, reserveCapacity, surface }) => {
    const pocketsTitleId = `${id}-pockets-title`;

    return (
      <aside
        id={id}
        data-board-section="inventory-bag-panel"
        data-inventory-surface={surface}
        aria-label="Field Bag inventory"
        className="pointer-events-auto grid h-full min-h-0 w-full grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden rounded-[12px] border border-[#6b4a2b]/20 bg-[linear-gradient(145deg,rgba(255,255,255,0.9),rgba(240,249,255,0.82)_52%,rgba(237,233,254,0.72))] text-neutral-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_36px_rgba(15,23,42,0.16)] backdrop-blur-xl"
      >
        <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-sky-950/10 px-3 py-2.5">
          <span className="grid size-10 place-items-center rounded-[10px] border border-sky-900/15 bg-sky-50 text-sky-950 shadow-sm">
            <Backpack className="size-6 stroke-[2.3]" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-serif text-xl font-black leading-none text-sky-950">
              Field Bag
            </span>
            <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-black uppercase leading-none text-neutral-600">
              <span>{itemCount} stacks total</span>
              <span aria-hidden="true">·</span>
              <span>{reserveCapacity} reserve pockets</span>
            </span>
          </span>
          <button
            type="button"
            aria-label="Close Field Bag"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-[10px] border border-sky-950/15 bg-white/75 text-sky-950 shadow-sm transition-[background-color,transform] hover:bg-white active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            <X className="size-6 stroke-[2.5]" aria-hidden="true" />
          </button>
        </header>

        <div className="grid gap-1 border-b border-sky-950/10 bg-white/35 px-4 py-3">
          <p className="text-sm font-black leading-snug text-sky-950">
            Keep anything interesting; sell only when you want gold.
          </p>
          <p className="text-[11px] font-semibold leading-snug text-neutral-700">
            Your quick pockets stay on the board. These {reserveCapacity} reserve pockets give every
            curious find a safe place.
          </p>
        </div>

        <section
          aria-labelledby={pocketsTitleId}
          // biome-ignore lint/a11y/noNoninteractiveTabindex: This named overflow viewport must be keyboard-focusable so arrow keys can scroll it.
          tabIndex={0}
          className="min-h-0 touch-pan-y overflow-y-auto overscroll-contain p-3 outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sky-500/45"
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2
              id={pocketsTitleId}
              className="text-xs font-black uppercase tracking-wide text-sky-950"
            >
              Reserve pockets
            </h2>
            <span className="text-[10px] font-bold text-neutral-600">
              Scroll to browse everything
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2">{children}</div>
        </section>
      </aside>
    );
  },
);
