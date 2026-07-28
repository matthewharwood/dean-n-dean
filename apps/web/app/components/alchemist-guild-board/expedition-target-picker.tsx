import { type AlchemistGuildCardId, AlchemistGuildCardIdSchema } from "@dean-stack/schemas";
import { Atom, Compass, ScrollText } from "lucide-react";
import * as z from "zod";

import { defineComponent } from "~/lib/define-component";

export const ExpeditionQuestHelpTargetSourceSchema = z.enum(["current-quest", "future-quest"]);
export type ExpeditionQuestHelpTargetSource = z.infer<typeof ExpeditionQuestHelpTargetSourceSchema>;

export const ExpeditionElementTargetSourceSchema = z.enum(["both", "quest", "vault"]);
export type ExpeditionElementTargetSource = z.infer<typeof ExpeditionElementTargetSourceSchema>;

const ExpeditionTargetCardSchema = z.object({
  cardId: AlchemistGuildCardIdSchema,
  imageSrc: z.string().min(1).nullable(),
  name: z.string().min(1),
  symbol: z.string().min(1),
});

export const ExpeditionQuestHelpTargetSchema = z.object({
  ...ExpeditionTargetCardSchema.shape,
  source: ExpeditionQuestHelpTargetSourceSchema,
});
export type ExpeditionQuestHelpTarget = z.infer<typeof ExpeditionQuestHelpTargetSchema>;

export const ExpeditionElementTargetSchema = z.object({
  ...ExpeditionTargetCardSchema.shape,
  source: ExpeditionElementTargetSourceSchema,
});
export type ExpeditionElementTarget = z.infer<typeof ExpeditionElementTargetSchema>;

export const ExpeditionTargetPickerPropsSchema = z.object({
  disabled: z.boolean(),
  elementTargets: z.array(ExpeditionElementTargetSchema),
  onSelectTarget: z.custom<(cardId: AlchemistGuildCardId) => void>(),
  questHelpTargets: z.array(ExpeditionQuestHelpTargetSchema).max(10),
  selectedCardId: AlchemistGuildCardIdSchema.nullable(),
});
export type ExpeditionTargetPickerProps = z.infer<typeof ExpeditionTargetPickerPropsSchema>;

const ExpeditionTargetButtonPropsSchema = z.object({
  cardId: AlchemistGuildCardIdSchema,
  disabled: z.boolean(),
  group: z.enum(["element", "quest-help"]),
  imageSrc: z.string().min(1).nullable(),
  name: z.string().min(1),
  onSelect: z.custom<(cardId: AlchemistGuildCardId) => void>(),
  selected: z.boolean(),
  sourceLabel: z.string().min(1),
  symbol: z.string().min(1),
});

const QUEST_HELP_SOURCE_LABELS = {
  "current-quest": "Current Quest",
  "future-quest": "Needed Soon",
} satisfies Record<ExpeditionQuestHelpTargetSource, string>;

const ELEMENT_SOURCE_LABELS = {
  both: "Vault + Quest",
  quest: "Quest Recipe",
  vault: "Known Element",
} satisfies Record<ExpeditionElementTargetSource, string>;

function getTargetButtonToneClass(selected: boolean, isQuestHelp: boolean): string {
  if (selected) {
    return "border-emerald-600/75 bg-emerald-50 shadow-[0_0_0_3px_rgba(16,185,129,0.16)]";
  }
  if (isQuestHelp) {
    return "border-amber-700/25 bg-amber-50/90 hover:border-amber-600/55 hover:bg-amber-50";
  }
  return "border-sky-900/20 bg-sky-50/80 hover:border-sky-700/45 hover:bg-sky-50";
}

const ExpeditionTargetButton = defineComponent(
  ExpeditionTargetButtonPropsSchema,
  ({ cardId, disabled, group, imageSrc, name, onSelect, selected, sourceLabel, symbol }) => {
    const isQuestHelp = group === "quest-help";

    return (
      <button
        type="button"
        data-board-section="expedition-target"
        data-card-id={cardId}
        data-expedition-target-group={group}
        data-selected={selected ? "true" : undefined}
        aria-label={`Send scout for ${name}. ${sourceLabel}.`}
        aria-pressed={selected}
        disabled={disabled}
        onClick={() => {
          onSelect(cardId);
        }}
        className={`pointer-events-auto grid min-h-20 grid-cols-[3rem_minmax(0,1fr)] items-center gap-2.5 rounded-[7px] border-2 p-2.5 text-left shadow-[0_5px_12px_rgba(15,23,42,0.08)] transition-[background-color,border-color,box-shadow,opacity,transform] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/45 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 ${getTargetButtonToneClass(
          selected,
          isQuestHelp,
        )} disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100`}
      >
        {imageSrc ? (
          <span className="grid size-12 place-items-center overflow-hidden rounded-[6px] border border-sky-950/15 bg-white/85 shadow-sm">
            <img
              src={imageSrc}
              alt=""
              aria-hidden="true"
              className="size-11 object-contain"
              draggable={false}
            />
          </span>
        ) : (
          <span
            aria-hidden="true"
            data-expedition-art-fallback="true"
            className="grid size-12 place-items-center rounded-[6px] border border-amber-800/25 bg-[linear-gradient(145deg,#fffbeb,#fde68a)] px-1 text-center font-mono text-base font-black leading-none text-amber-950 shadow-sm"
          >
            {symbol}
          </span>
        )}

        <span className="min-w-0">
          <span className="block truncate text-sm font-black leading-tight text-sky-950">
            {name}
          </span>
          <span className="mt-1.5 inline-flex max-w-full items-center rounded-full border border-sky-950/15 bg-white/80 px-2 py-1 text-[9px] font-black uppercase leading-none text-sky-950">
            <span className="truncate">{sourceLabel}</span>
          </span>
        </span>
      </button>
    );
  },
);

export const ExpeditionTargetPicker = defineComponent(
  ExpeditionTargetPickerPropsSchema,
  ({ disabled, elementTargets, onSelectTarget, questHelpTargets, selectedCardId }) => {
    const questHelpHeadingId = "expedition-quest-help-targets";
    const elementHeadingId = "expedition-element-targets";

    return (
      <section
        data-board-section="expedition-target-picker"
        aria-labelledby="expedition-target-picker-title"
        className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-[8px] border border-sky-950/15 bg-white/65 text-neutral-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]"
      >
        <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-b border-sky-950/10 bg-white/55 px-3 py-3">
          <span className="grid size-11 place-items-center rounded-[7px] border border-emerald-900/15 bg-emerald-50 text-emerald-800 shadow-sm">
            <Compass className="size-6 stroke-[2.4]" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <h2
              id="expedition-target-picker-title"
              className="font-serif text-xl font-black leading-none text-sky-950"
            >
              Choose what to find
            </h2>
            <p className="mt-1 text-xs font-semibold leading-snug text-neutral-700">
              Scouts bring back one card. Quest Help can rescue a hard-to-find drop.
            </p>
          </span>
        </header>

        <section
          // biome-ignore lint/a11y/noNoninteractiveTabindex: This named overflow viewport must be keyboard-focusable so arrow keys can scroll every target.
          tabIndex={0}
          aria-label="Expedition target choices"
          className="min-h-0 touch-pan-y space-y-4 overflow-y-auto overscroll-contain p-3 outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sky-500/45"
        >
          {questHelpTargets.length > 0 ? (
            <section aria-labelledby={questHelpHeadingId}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <ScrollText
                    className="size-4 shrink-0 stroke-[2.5] text-amber-800"
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <h3
                      id={questHelpHeadingId}
                      className="text-xs font-black uppercase leading-none tracking-wide text-amber-950"
                    >
                      Quest Help
                    </h3>
                    <span className="mt-1 block text-[10px] font-bold leading-tight text-neutral-600">
                      Raw supplies blocking this adventure
                    </span>
                  </span>
                </span>
                <span className="shrink-0 rounded-full border border-amber-800/20 bg-amber-100 px-2 py-1 font-mono text-[10px] font-black leading-none text-amber-950">
                  {questHelpTargets.length}/10
                </span>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(9rem,100%),1fr))] gap-2">
                {questHelpTargets.map((target) => (
                  <ExpeditionTargetButton
                    key={target.cardId}
                    cardId={target.cardId}
                    disabled={disabled}
                    group="quest-help"
                    imageSrc={target.imageSrc}
                    name={target.name}
                    onSelect={onSelectTarget}
                    selected={selectedCardId === target.cardId}
                    sourceLabel={QUEST_HELP_SOURCE_LABELS[target.source]}
                    symbol={target.symbol}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section aria-labelledby={elementHeadingId}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2">
                <Atom className="size-4 shrink-0 stroke-[2.5] text-sky-800" aria-hidden="true" />
                <span className="min-w-0">
                  <h3
                    id={elementHeadingId}
                    className="text-xs font-black uppercase leading-none tracking-wide text-sky-950"
                  >
                    Elements
                  </h3>
                  <span className="mt-1 block text-[10px] font-bold leading-tight text-neutral-600">
                    Known elements and quest recipe needs
                  </span>
                </span>
              </span>
              <span className="shrink-0 rounded-full border border-sky-900/20 bg-sky-100 px-2 py-1 font-mono text-[10px] font-black leading-none text-sky-950">
                {elementTargets.length}
              </span>
            </div>
            {elementTargets.length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(9rem,100%),1fr))] gap-2">
                {elementTargets.map((target) => (
                  <ExpeditionTargetButton
                    key={target.cardId}
                    cardId={target.cardId}
                    disabled={disabled}
                    group="element"
                    imageSrc={target.imageSrc}
                    name={target.name}
                    onSelect={onSelectTarget}
                    selected={selectedCardId === target.cardId}
                    sourceLabel={ELEMENT_SOURCE_LABELS[target.source]}
                    symbol={target.symbol}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-[7px] border border-dashed border-sky-900/20 bg-sky-50/65 p-3 text-sm font-bold leading-snug text-neutral-700">
                Keep discovering elements to give the scouts more choices.
              </p>
            )}
          </section>
        </section>
      </section>
    );
  },
);
