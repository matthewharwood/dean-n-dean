import {
  ELEMENT_CARDS,
  getAlchemyCharactersByRequester,
  getAlchemyQuestById,
  getAlchemyRecipeById,
  type StaticAlchemyQuest,
  type StaticAlchemyRecipe,
} from "@dean-stack/schemas";
import { Brain, CloudFog, Coins, type LucideIcon, Sparkles } from "lucide-react";
import * as z from "zod";

import { defineComponent } from "~/lib/define-component";

const QUEST_CARD_ID_PATTERN = /^quest:[a-z0-9-]+$/;
const PUBLIC_PATH_PATTERN = /^[a-z0-9-/]+\.webp$/;
const CARD_ID_PREFIX_PATTERN = /^[a-z-]+:/;

const QuestBriefingRewardIconSchema = z.enum(["gold", "knowledge", "discovery", "muddlefog"]);
type QuestBriefingRewardIcon = z.infer<typeof QuestBriefingRewardIconSchema>;

const REWARD_ICONS = {
  discovery: Sparkles,
  gold: Coins,
  knowledge: Brain,
  muddlefog: CloudFog,
} satisfies Record<QuestBriefingRewardIcon, LucideIcon>;

const QuestBriefingRewardSchema = z.object({
  icon: QuestBriefingRewardIconSchema,
  label: z.string().min(1),
  value: z.string().min(1),
});

const QuestBriefingRecipeIngredientSchema = z.object({
  cardId: z.string().min(1),
  name: z.string().min(1),
  quantity: z.int().min(1),
  symbol: z.string().min(1),
});

const QuestBriefingRecipeSchema = z.object({
  formula: z.string().min(1),
  imagePath: z.string().regex(PUBLIC_PATH_PATTERN),
  ingredients: z.array(QuestBriefingRecipeIngredientSchema).min(1),
  name: z.string().min(1),
});

export const QuestBriefingCardPropsSchema = z.object({
  actLabel: z.string().min(1),
  developerNotesVisible: z.boolean(),
  hint: z.string().min(1),
  id: z.string().regex(QUEST_CARD_ID_PATTERN),
  need: z.string().min(1),
  recipeLabels: z.array(QuestBriefingRecipeSchema).min(1),
  requesterAvatarPath: z.string().regex(PUBLIC_PATH_PATTERN).nullable(),
  requesterName: z.string().min(1),
  requesterTitle: z.string().min(1),
  rewards: z.array(QuestBriefingRewardSchema).min(1),
  slotLabel: z.string().min(1),
  statusLabel: z.string().min(1),
  summary: z.string().min(1),
  teachingFocus: z.array(z.string().min(1)).min(1),
  title: z.string().min(1),
});
export type QuestBriefingCardProps = z.infer<typeof QuestBriefingCardPropsSchema>;

export const FIRST_QUEST_BRIEFING_CARD_PROPS = createFirstQuestBriefingCardProps();

export const QuestBriefingCard = defineComponent(
  QuestBriefingCardPropsSchema,
  ({
    actLabel,
    developerNotesVisible,
    id,
    need,
    recipeLabels,
    requesterAvatarPath,
    requesterName,
    requesterTitle,
    rewards,
    slotLabel,
    statusLabel,
    summary,
    teachingFocus,
    title,
  }) => (
    <article
      data-board-section="quest-briefing-card"
      data-board-name={title}
      data-quest-card-id={id}
      className="relative grid min-h-[24rem] content-start gap-2.5 overflow-hidden rounded-[6px] border border-amber-500/70 bg-white/60 p-3 text-neutral-950 shadow-[0_2px_0_rgba(72,45,16,0.14)] backdrop-blur-sm"
      aria-labelledby={`${id}-title`}
    >
      <header className="grid grid-cols-[3.25rem_1fr] gap-3">
        <div className="relative size-13 overflow-hidden rounded-[4px] border border-amber-500/55 bg-white/70">
          {requesterAvatarPath ? (
            <img
              src={resolvePublicAssetPath(requesterAvatarPath)}
              alt={`${requesterName} avatar`}
              className="size-full object-cover"
              draggable={false}
            />
          ) : (
            <span className="grid size-full place-items-center text-lg font-bold">
              {requesterName.slice(0, 1)}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap gap-1.5">
            <span className="rounded-[3px] bg-emerald-700 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-normal text-white">
              {statusLabel}
            </span>
            <span className="rounded-[3px] bg-sky-800 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-normal text-white">
              {slotLabel}
            </span>
          </div>
          <p className="truncate text-[11px] font-semibold uppercase leading-tight tracking-normal text-amber-950/75">
            {actLabel}
          </p>
          <h2 id={`${id}-title`} className="font-serif text-xl leading-none text-amber-950">
            {title}
          </h2>
        </div>
      </header>

      <div className="grid gap-2">
        <p className="text-sm font-semibold leading-snug text-neutral-900">{summary}</p>
        <div className="rounded-[4px] border border-amber-500/40 bg-white/65 p-2">
          <p className="text-[11px] font-bold uppercase leading-none tracking-normal text-amber-950/70">
            {requesterName} • {requesterTitle}
          </p>
          <p className="mt-1 text-sm leading-snug text-neutral-950">{need}</p>
        </div>
      </div>

      <div className="grid gap-2.5">
        {recipeLabels.map((recipe) => (
          <section
            key={recipe.name}
            data-quest-recipe-target={recipe.name}
            className="grid gap-1 rounded-[4px] border border-sky-900/25 bg-sky-50/90 p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)]"
            aria-label={`${recipe.name}: ${formatIngredientList(recipe.ingredients)}`}
          >
            <div className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-1.5">
              <img
                src={resolvePublicAssetPath(recipe.imagePath)}
                alt=""
                aria-hidden="true"
                className="size-8 rounded-[3px] border border-sky-900/30 bg-white object-contain p-0.5"
                draggable={false}
              />
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase leading-none tracking-normal text-sky-950/65">
                  Make
                </p>
                <p className="truncate font-serif text-xl leading-none text-sky-950">
                  {recipe.name}
                </p>
              </div>
              <span className="rounded-[3px] bg-sky-950 px-1.5 py-0.5 font-mono text-[11px] font-black leading-none text-white">
                {recipe.formula}
              </span>
            </div>

            <div className="grid gap-1">
              {recipe.ingredients.map((ingredient, index) => (
                <span
                  key={ingredient.cardId}
                  className="relative grid min-h-7 min-w-0 grid-cols-[1.375rem_1fr_auto] items-center gap-1 rounded-[4px] border border-sky-950/25 bg-white px-1 py-0.5"
                >
                  {index > 0 ? (
                    <span
                      data-quest-recipe-operator="plus"
                      className="absolute left-1/2 top-0 z-20 flex size-5 -translate-x-1/2 -translate-y-[calc(50%+0.125rem)] items-center justify-center rounded-full border border-neutral-400 bg-white text-sm font-black leading-[1] text-neutral-700 shadow-[0_1px_0_rgba(15,23,42,0.18)]"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  ) : null}
                  <span className="grid size-5 place-items-center rounded-[3px] border border-sky-900/30 bg-sky-100 font-serif text-xs font-bold leading-none text-sky-950">
                    {ingredient.symbol}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[8px] font-semibold uppercase leading-none tracking-normal text-sky-950/60">
                      {ingredient.quantity === 1 ? "1 card" : `${ingredient.quantity} cards`}
                    </span>
                    <span className="block truncate text-[11px] font-bold leading-tight text-sky-950">
                      {ingredient.name}
                    </span>
                  </span>
                  <span className="rounded-full bg-emerald-700 px-1.5 py-0.5 text-[9px] font-black leading-none text-white">
                    x{ingredient.quantity}
                  </span>
                </span>
              ))}
            </div>
          </section>
        ))}
      </div>

      {developerNotesVisible ? (
        <p
          data-quest-card-developer-note=""
          className="rounded-[3px] bg-neutral-950/85 px-2 py-1.5 text-[11px] font-bold leading-snug text-white"
        >
          Teaches {teachingFocus.join(", ")}.
        </p>
      ) : null}

      <footer className="grid h-12 min-h-0 grid-cols-4 overflow-hidden rounded-[4px] border border-amber-500/40 bg-white/65">
        {rewards.map((reward, index) => {
          const RewardIcon = REWARD_ICONS[reward.icon];
          return (
            <div
              key={reward.label}
              data-reward-kind={reward.icon}
              className={`grid min-w-0 grid-rows-[1fr_auto] place-items-center gap-0.5 px-1.5 py-1.5 ${
                index === 0 ? "" : "border-l border-amber-500/40"
              }`}
            >
              <span className="sr-only">
                {reward.value} {reward.label}
              </span>
              <RewardIcon aria-hidden="true" className="size-4 stroke-[2.5] text-amber-950" />
              <span aria-hidden="true" className="text-xs font-black leading-none">
                {reward.value}
              </span>
            </div>
          );
        })}
      </footer>
    </article>
  ),
);

function createFirstQuestBriefingCardProps(): QuestBriefingCardProps {
  return createQuestBriefingCardProps(getRequiredQuest("quest:first-water"));
}

function createQuestBriefingCardProps(quest: StaticAlchemyQuest): QuestBriefingCardProps {
  const requesterCharacter = getAlchemyCharactersByRequester(quest.narrative.requester)[0];
  const recipeLabels = quest.recipeIds.map((recipeId) => {
    const recipe = getRequiredRecipe(recipeId);
    return {
      formula: formatRecipeFormula(recipe),
      imagePath: recipe.output.imagePath,
      ingredients: recipe.arguments.map(formatRecipeIngredient),
      name: recipe.name,
    };
  });

  return QuestBriefingCardPropsSchema.parse({
    actLabel: `Act ${quest.progression.act} • ${formatMinuteRange(quest.progression.suggestedMinutes)}`,
    developerNotesVisible: false,
    hint: quest.narrative.hint,
    id: quest.id,
    need: quest.narrative.need,
    recipeLabels,
    requesterAvatarPath: requesterCharacter?.avatarPath ?? null,
    requesterName: requesterCharacter?.name ?? formatTokenLabel(quest.narrative.requester),
    requesterTitle: requesterCharacter?.title ?? "Guild Requester",
    rewards: [
      { icon: "gold", label: "Gold", value: String(quest.rewards.gold) },
      { icon: "knowledge", label: "Knowledge XP", value: String(quest.rewards.knowledgeXp) },
      {
        icon: "discovery",
        label: "Discovery Token",
        value: String(quest.rewards.discoveryTokens),
      },
      {
        icon: "muddlefog",
        label: "Muddlefog Cleared",
        value: `${quest.rewards.muddlefogCleared}%`,
      },
    ],
    slotLabel: `${formatTokenLabel(quest.progression.boardSlot)} path`,
    statusLabel: "Ready",
    summary: quest.narrative.summary,
    teachingFocus: quest.teachingFocus,
    title: quest.narrative.title,
  });
}

function getRequiredQuest(questId: string): StaticAlchemyQuest {
  const quest = getAlchemyQuestById(questId);
  if (!quest) throw new Error(`Missing alchemy quest: ${questId}`);
  return quest;
}

function getRequiredRecipe(recipeId: string): StaticAlchemyRecipe {
  const recipe = getAlchemyRecipeById(recipeId);
  if (!recipe) throw new Error(`Missing alchemy recipe: ${recipeId}`);
  return recipe;
}

function formatRecipeFormula(recipe: StaticAlchemyRecipe): string {
  return recipe.arguments.map(formatRecipeArgument).join(" + ");
}

function formatRecipeArgument(argument: StaticAlchemyRecipe["arguments"][number]): string {
  const elementCard = ELEMENT_CARDS.find((card) => card.id === argument.cardId);
  const cardLabel = elementCard?.symbol ?? formatTokenLabel(argument.cardId);
  return argument.quantity === 1 ? cardLabel : `${argument.quantity}${cardLabel}`;
}

function formatRecipeIngredient(
  argument: StaticAlchemyRecipe["arguments"][number],
): z.infer<typeof QuestBriefingRecipeIngredientSchema> {
  const elementCard = ELEMENT_CARDS.find((card) => card.id === argument.cardId);

  return {
    cardId: argument.cardId,
    name: elementCard?.name ?? formatTokenLabel(argument.cardId),
    quantity: argument.quantity,
    symbol: elementCard?.symbol ?? formatTokenLabel(argument.cardId).slice(0, 2),
  };
}

function formatIngredientList(
  ingredients: readonly z.infer<typeof QuestBriefingRecipeIngredientSchema>[],
): string {
  return ingredients
    .map((ingredient) =>
      ingredient.quantity === 1
        ? `1 ${ingredient.name} card`
        : `${ingredient.quantity} ${ingredient.name} cards`,
    )
    .join(" plus ");
}

function formatMinuteRange(minutes: readonly [number, number]): string {
  const [startMinute, endMinute] = minutes;
  return `${startMinute}-${endMinute} min`;
}

function formatTokenLabel(token: string): string {
  return token
    .replace(CARD_ID_PREFIX_PATTERN, "")
    .split("-")
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function resolvePublicAssetPath(path: string): string {
  const baseUrl = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${baseUrl}${path}`;
}
