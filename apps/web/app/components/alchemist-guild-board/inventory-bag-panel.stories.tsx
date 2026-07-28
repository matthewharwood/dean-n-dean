import type { Meta, StoryObj } from "@storybook/react-vite";
import { Clock3, GripVertical, LockKeyhole, ScrollText, Sparkles } from "lucide-react";
import * as z from "zod";

import { defineComponent } from "~/lib/define-component";

import { InventoryBagButton, InventoryBagPanel } from "./inventory-bag-panel";

const DummyInventoryRowStateSchema = z.enum(["cooling", "delivery", "protected", "ready"]);
type DummyInventoryRowState = z.infer<typeof DummyInventoryRowStateSchema>;

const DummyInventoryRowSchema = z.object({
  detail: z.string().min(1),
  name: z.string().min(1),
  quantity: z.int().min(1),
  state: DummyInventoryRowStateSchema,
});
type DummyInventoryRow = z.infer<typeof DummyInventoryRowSchema>;

const DummyInventoryRowPropsSchema = z.object({
  row: DummyInventoryRowSchema,
});

const DUMMY_INVENTORY_ROWS = [
  { detail: "Ready to use", name: "River Salt", quantity: 3, state: "ready" },
  { detail: "18 seconds", name: "Warm Brine", quantity: 2, state: "cooling" },
  { detail: "Needed by Mina", name: "Tempered Rivet", quantity: 1, state: "delivery" },
  { detail: "Saved for the next chapter", name: "Glass Seed", quantity: 1, state: "protected" },
  { detail: "Ready to use", name: "Moss Thread", quantity: 4, state: "ready" },
  { detail: "42 seconds", name: "Moonwater", quantity: 2, state: "cooling" },
  { detail: "Needed by Orla", name: "Garden Charm", quantity: 1, state: "delivery" },
  {
    detail: "Saved for the next chapter",
    name: "Conductive Paste",
    quantity: 2,
    state: "protected",
  },
  { detail: "Ready to use", name: "Polished Silica", quantity: 5, state: "ready" },
  { detail: "1 minute", name: "Ember Ink", quantity: 1, state: "cooling" },
  { detail: "Needed by Tavi", name: "Signal Lens", quantity: 1, state: "delivery" },
  { detail: "Saved for the next chapter", name: "Soft Alloy", quantity: 2, state: "protected" },
  { detail: "Ready to use", name: "Cloud Chalk", quantity: 3, state: "ready" },
  { detail: "27 seconds", name: "Star Glue", quantity: 2, state: "cooling" },
  { detail: "Needed by Calder", name: "Kiln Key", quantity: 1, state: "delivery" },
  { detail: "Saved for the next chapter", name: "Quiet Crystal", quantity: 1, state: "protected" },
] satisfies readonly DummyInventoryRow[];

const DUMMY_ROW_STATE_CLASS = {
  cooling: "border-sky-500/45 bg-sky-50/90",
  delivery: "border-amber-500/65 bg-amber-50/95",
  protected: "border-violet-500/55 bg-violet-50/95",
  ready: "border-emerald-500/45 bg-emerald-50/90",
} satisfies Record<DummyInventoryRowState, string>;

const DUMMY_ROW_STATE_LABEL = {
  cooling: "Cooling",
  delivery: "Quest delivery",
  protected: "Protected",
  ready: "Ready",
} satisfies Record<DummyInventoryRowState, string>;

const DummyInventoryRow = defineComponent(DummyInventoryRowPropsSchema, ({ row }) => {
  let StateIcon = Sparkles;
  if (row.state === "cooling") StateIcon = Clock3;
  if (row.state === "delivery") StateIcon = ScrollText;
  if (row.state === "protected") StateIcon = LockKeyhole;

  return (
    <article
      data-dummy-inventory-state={row.state}
      className={`grid min-h-16 grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-2 rounded-[9px] border-2 p-2 shadow-[0_5px_12px_rgba(15,23,42,0.08)] ${DUMMY_ROW_STATE_CLASS[row.state]}`}
    >
      <button
        type="button"
        aria-label={`Drag ${row.name}`}
        className="grid size-11 touch-none cursor-grab place-items-center rounded-[8px] border border-sky-950/20 bg-white/80 text-sky-950 shadow-[0_2px_0_rgba(15,23,42,0.12)] active:cursor-grabbing active:scale-[0.97] motion-reduce:active:scale-100"
      >
        <GripVertical className="size-6 stroke-[2.5]" aria-hidden="true" />
      </button>
      <span className="min-w-0">
        <span className="block truncate text-sm font-black leading-tight text-sky-950">
          {row.name}
        </span>
        <span className="mt-0.5 flex min-w-0 items-center gap-1 text-[10px] font-bold leading-tight text-neutral-700">
          <StateIcon className="size-3 shrink-0 stroke-[2.5]" aria-hidden="true" />
          <span className="truncate">
            {DUMMY_ROW_STATE_LABEL[row.state]} · {row.detail}
          </span>
        </span>
      </span>
      <span className="grid size-8 place-items-center rounded-full bg-sky-950 text-xs font-black text-white">
        ×{row.quantity}
      </span>
    </article>
  );
});

const meta = {
  title: "Components/AlchemistGuildBoard/InventoryBagPanel",
  component: InventoryBagPanel,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    children: null,
    id: "storybook-field-bag",
    itemCount: 24,
    onClose: () => undefined,
    reserveCapacity: 24,
    surface: "field-bag",
  },
} satisfies Meta<typeof InventoryBagPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ScrollableNearCapacity: Story = {
  render: (args) => (
    <div className="min-h-screen bg-[linear-gradient(145deg,#dce8e4,#f4efe2_55%,#dcecff)] p-4 text-neutral-950">
      <div className="mx-auto grid h-[calc(100vh-2rem)] min-h-[32rem] max-h-[48rem] max-w-[72rem] grid-rows-[auto_minmax(0,1fr)] gap-3">
        <div className="flex min-h-12 flex-wrap items-center gap-3 rounded-[12px] border border-amber-900/15 bg-white/55 p-1.5 shadow-sm backdrop-blur-md">
          <InventoryBagButton
            controlsId={args.id}
            expanded={true}
            itemCount={args.itemCount}
            onToggle={() => undefined}
            unlocked={true}
            unlockHint="Complete First Water"
          />
          <InventoryBagButton
            controlsId="storybook-locked-field-bag"
            expanded={false}
            itemCount={8}
            onToggle={() => undefined}
            unlocked={false}
            unlockHint="Complete First Water"
          />
        </div>
        <div className="min-h-0 w-full justify-self-end lg:max-w-[15rem] xl:max-w-[19.75rem]">
          <InventoryBagPanel {...args}>
            {DUMMY_INVENTORY_ROWS.map((row) => (
              <DummyInventoryRow key={row.name} row={row} />
            ))}
          </InventoryBagPanel>
        </div>
      </div>
    </div>
  ),
};
