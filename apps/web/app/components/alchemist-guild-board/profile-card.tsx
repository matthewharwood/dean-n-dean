import { ALCHEMIST_GUILD_PROFILE_DEFAULT, getAlchemyCharacterById } from "@dean-stack/schemas";
import { animate, cubicBezier, type JSAnimation } from "animejs";
import { Brain, CloudFog, Coins, type LucideIcon, Sparkles, Trophy } from "lucide-react";
import { useEffect, useReducer, useRef, useState } from "react";
import * as z from "zod";

import { defineComponent } from "~/lib/define-component";

const PRM = "(prefers-reduced-motion: reduce)";
const PUBLIC_PATH_PATTERN = /^[a-z0-9-/]+\.webp$/;
const PROFILE_NAME_MAX_LENGTH = 24;
const PROFILE_REWARD_COUNT_BASE_DELAY_MS = 520;
const PROFILE_REWARD_COUNT_STAGGER_MS = 180;
const PROFILE_REWARD_COUNT_DURATION_MS = 1450;
const PROFILE_STAT_VALUE_PATTERN = /^(\d+)(%)?$/;
const PROFILE_REWARD_COUNT_EASE = cubicBezier(0.3, 0, 0.16, 1);
const noop = (): void => undefined;

const ProfileStatKindSchema = z.enum(["level", "gold", "knowledge", "discovery", "muddlefog"]);
type ProfileStatKind = z.infer<typeof ProfileStatKindSchema>;

const PROFILE_STAT_ICONS = {
  discovery: Sparkles,
  gold: Coins,
  knowledge: Brain,
  level: Trophy,
  muddlefog: CloudFog,
} satisfies Record<ProfileStatKind, LucideIcon>;

const ProfileStatSchema = z.object({
  kind: ProfileStatKindSchema,
  label: z.string().min(1),
  value: z.string().min(1),
});
type ProfileStat = z.infer<typeof ProfileStatSchema>;

type ParsedProfileStatValue = {
  amount: number;
  suffix: string;
};

type ProfileStatCountState = {
  displayedValue: string;
};

type ProfileStatCountAction = {
  type: "set-value";
  value: string;
};

export const ProfileCardPropsSchema = z.object({
  avatarPath: z.string().regex(PUBLIC_PATH_PATTERN),
  biography: z.string().min(1),
  onPlayerNameChange: z.custom<(nextName: string) => void>(),
  playerName: z.string().trim().min(1).max(PROFILE_NAME_MAX_LENGTH),
  stats: z.array(ProfileStatSchema).min(1),
  title: z.string().min(1),
});
export type ProfileCardProps = z.infer<typeof ProfileCardPropsSchema>;

export const FIRST_PROFILE_CARD_PROPS = createFirstProfileCardProps();

export const ProfileCard = defineComponent(
  ProfileCardPropsSchema,
  ({ avatarPath, biography, onPlayerNameChange, playerName, stats, title }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [draftName, setDraftName] = useState("");

    const beginEditing = () => {
      setDraftName(playerName);
      setIsEditing(true);
      window.requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    };

    const commitName = () => {
      const nextName = draftName.trim();
      setIsEditing(false);
      if (nextName && nextName !== playerName) {
        onPlayerNameChange(nextName);
        return;
      }
      setDraftName(playerName);
    };

    const cancelName = () => {
      setDraftName(playerName);
      setIsEditing(false);
    };

    return (
      <article
        data-board-section="profile-card"
        data-board-name="Profile card"
        className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-3 overflow-hidden rounded-[6px] border border-amber-500/70 bg-white/60 p-3 text-neutral-950 shadow-[0_2px_0_rgba(72,45,16,0.14)] backdrop-blur-sm"
      >
        <header className="grid grid-cols-[4.25rem_1fr] gap-3">
          <div className="overflow-hidden rounded-[5px] border border-amber-500/55 bg-white/70">
            <img
              src={resolvePublicAssetPath(avatarPath)}
              alt=""
              aria-hidden="true"
              className="aspect-square size-full object-cover"
              draggable={false}
            />
          </div>

          <div className="min-w-0 self-center">
            <p className="text-[10px] font-bold uppercase leading-none tracking-normal text-amber-950/65">
              {title}
            </p>
            {isEditing ? (
              <input
                ref={inputRef}
                data-profile-name-input=""
                className="mt-1 w-full border-0 border-b border-dashed border-amber-900 bg-transparent px-0 py-0.5 font-serif text-2xl leading-none text-amber-950 outline-none focus:border-solid"
                maxLength={PROFILE_NAME_MAX_LENGTH}
                value={draftName}
                aria-label="Player name"
                onBlur={commitName}
                onChange={(event) => {
                  setDraftName(event.currentTarget.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") commitName();
                  if (event.key === "Escape") cancelName();
                }}
              />
            ) : (
              <button
                type="button"
                data-profile-name-display=""
                className="mt-1 max-w-full border-b border-dashed border-amber-900/70 px-0 pb-0.5 text-left font-serif text-2xl leading-none text-amber-950"
                aria-label="Edit player name"
                onDoubleClick={beginEditing}
                onKeyDown={(event) => {
                  if (event.key === "Enter") beginEditing();
                }}
              >
                <span className="block truncate">{playerName}</span>
              </button>
            )}
          </div>
        </header>

        <p className="min-h-0 overflow-hidden text-sm font-semibold leading-snug text-neutral-800">
          {biography}
        </p>

        <dl className="grid grid-cols-5 overflow-hidden rounded-[4px] border border-amber-500/40 bg-white/65">
          {stats.map((stat, index) => (
            <ProfileStatCell key={stat.kind} index={index} stat={stat} />
          ))}
        </dl>
      </article>
    );
  },
);

const ProfileStatCellPropsSchema = z.object({
  index: z.int().min(0),
  stat: ProfileStatSchema,
});

const ProfileStatCell = defineComponent(ProfileStatCellPropsSchema, ({ index, stat }) => {
  const StatIcon = PROFILE_STAT_ICONS[stat.kind];
  const initialParsedValue = parseProfileStatValue(stat.value);
  const animationRef = useRef<JSAnimation | null>(null);
  const mountedRef = useRef(false);
  const parsedValueRef = useRef<ParsedProfileStatValue | null>(initialParsedValue);
  const renderedAmountRef = useRef(initialParsedValue?.amount ?? 0);
  const [countState, dispatchCountState] = useReducer(
    profileStatCountReducer,
    stat.value,
    createProfileStatCountState,
  );
  const countDelayIndex = getProfileStatCountDelayIndex(stat.kind, index);

  useEffect(() => {
    const nextParsedValue = parseProfileStatValue(stat.value);
    animationRef.current?.cancel();
    animationRef.current = null;

    if (!mountedRef.current) {
      mountedRef.current = true;
      parsedValueRef.current = nextParsedValue;
      renderedAmountRef.current = nextParsedValue?.amount ?? 0;
      dispatchCountState({ type: "set-value", value: stat.value });
      return;
    }

    const previousParsedValue = parsedValueRef.current;
    parsedValueRef.current = nextParsedValue;

    if (
      !nextParsedValue ||
      !previousParsedValue ||
      nextParsedValue.suffix !== previousParsedValue.suffix
    ) {
      renderedAmountRef.current = nextParsedValue?.amount ?? 0;
      dispatchCountState({ type: "set-value", value: stat.value });
      return;
    }

    const fromAmount = renderedAmountRef.current;
    const toAmount = nextParsedValue.amount;
    if (fromAmount === toAmount) {
      dispatchCountState({
        type: "set-value",
        value: formatProfileStatValue(toAmount, nextParsedValue.suffix),
      });
      return;
    }

    if (typeof window !== "undefined" && window.matchMedia(PRM).matches) {
      renderedAmountRef.current = toAmount;
      dispatchCountState({
        type: "set-value",
        value: formatProfileStatValue(toAmount, nextParsedValue.suffix),
      });
      return;
    }

    const counter = { amount: fromAmount };
    dispatchCountState({
      type: "set-value",
      value: formatProfileStatValue(fromAmount, nextParsedValue.suffix),
    });
    const animation = animate(counter, {
      amount: toAmount,
      delay: PROFILE_REWARD_COUNT_BASE_DELAY_MS + countDelayIndex * PROFILE_REWARD_COUNT_STAGGER_MS,
      duration: PROFILE_REWARD_COUNT_DURATION_MS,
      ease: PROFILE_REWARD_COUNT_EASE,
      onUpdate: () => {
        const nextAmount = Math.round(counter.amount);
        renderedAmountRef.current = nextAmount;
        dispatchCountState({
          type: "set-value",
          value: formatProfileStatValue(nextAmount, nextParsedValue.suffix),
        });
      },
      onComplete: () => {
        renderedAmountRef.current = toAmount;
        dispatchCountState({
          type: "set-value",
          value: formatProfileStatValue(toAmount, nextParsedValue.suffix),
        });
        animationRef.current = null;
      },
    });
    animationRef.current = animation;

    return () => {
      animation.cancel();
    };
  }, [countDelayIndex, stat.value]);

  return (
    <div
      data-profile-stat={stat.kind}
      className={`grid min-w-0 place-items-center gap-1 px-1 py-1.5 ${
        index === 0 ? "" : "border-l border-amber-500/40"
      }`}
    >
      <dt className="sr-only">{stat.label}</dt>
      <dd className="grid place-items-center gap-0.5">
        <StatIcon aria-hidden="true" className="size-4 stroke-[2.5] text-amber-950" />
        <span
          data-profile-stat-value={stat.kind}
          className="text-xs font-black leading-none text-amber-950"
        >
          {countState.displayedValue}
        </span>
      </dd>
    </div>
  );
});

function createFirstProfileCardProps(): ProfileCardProps {
  const apprentice = getAlchemyCharacterById("apprentice");

  if (!apprentice) {
    throw new Error("Missing first profile card data anchors");
  }

  return ProfileCardPropsSchema.parse({
    avatarPath: apprentice.avatarPath,
    biography: "A Junior Alchemist reopening the Periodic Table Vault one useful recipe at a time.",
    onPlayerNameChange: noop,
    playerName: ALCHEMIST_GUILD_PROFILE_DEFAULT.playerName,
    stats: [
      { kind: "level", label: "Level", value: String(ALCHEMIST_GUILD_PROFILE_DEFAULT.level) },
      { kind: "gold", label: "Gold", value: String(ALCHEMIST_GUILD_PROFILE_DEFAULT.gold) },
      {
        kind: "knowledge",
        label: "Knowledge XP",
        value: String(ALCHEMIST_GUILD_PROFILE_DEFAULT.knowledgeXp),
      },
      {
        kind: "discovery",
        label: "Discovery Tokens",
        value: String(ALCHEMIST_GUILD_PROFILE_DEFAULT.discoveryTokens),
      },
      {
        kind: "muddlefog",
        label: "Muddlefog Cleared",
        value: `${ALCHEMIST_GUILD_PROFILE_DEFAULT.muddlefogCleared}%`,
      },
    ],
    title: "Junior Alchemist",
  });
}

function parseProfileStatValue(value: string): ParsedProfileStatValue | null {
  const match = PROFILE_STAT_VALUE_PATTERN.exec(value);
  const amountText = match?.[1];
  if (!amountText) return null;

  return {
    amount: Number.parseInt(amountText, 10),
    suffix: match[2] ?? "",
  };
}

function formatProfileStatValue(amount: number, suffix: string): string {
  return `${Math.round(amount)}${suffix}`;
}

function createProfileStatCountState(value: string): ProfileStatCountState {
  return { displayedValue: value };
}

function profileStatCountReducer(
  _state: ProfileStatCountState,
  action: ProfileStatCountAction,
): ProfileStatCountState {
  return { displayedValue: action.value };
}

function getProfileStatCountDelayIndex(kind: ProfileStat["kind"], index: number): number {
  if (kind === "level") return 0;
  return Math.max(0, index - 1);
}

function resolvePublicAssetPath(path: string): string {
  const baseUrl = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${baseUrl}${path}`;
}
