import * as z from "zod";

import { getAlchemyCharacterForQuest } from "./alchemy-characters";
import { ALCHEMY_QUESTS, type StaticAlchemyQuest } from "./alchemy-quests";

// Per-quest requester voice lines ("catchphrase + need"), played from the speaker
// icon on a quest briefing card. Assets live in apps/<app>/public/alchemy-quest-voices/.
const AlchemyQuestAudioPathSchema = z.string().regex(/^alchemy-quest-voices\/[a-z0-9-]+\.mp3$/);
type AlchemyQuestAudioPath = z.infer<typeof AlchemyQuestAudioPathSchema>;

// Only register recordings whose bytes still match the current one-recipe request.
// The older multi-recipe recordings remain as legacy assets, but split arcs use the
// requester's character clip until new chapter-specific lines are recorded.
const ALCHEMY_QUEST_VOICE_LINE_IDS = ["quest:first-water"] as const;
type AlchemyQuestVoiceLineId = (typeof ALCHEMY_QUEST_VOICE_LINE_IDS)[number];

const QUEST_VOICE_LINE_ID_SET: ReadonlySet<string> = new Set(ALCHEMY_QUEST_VOICE_LINE_IDS);
const QUEST_ID_PREFIX_PATTERN = /^quest:/;

function toQuestVoiceSlug(questId: string): string {
  return questId.replace(QUEST_ID_PREFIX_PATTERN, "");
}

export function getAlchemyQuestVoiceClipPath(questId: string): AlchemyQuestAudioPath | null {
  if (!QUEST_VOICE_LINE_ID_SET.has(questId)) return null;
  return AlchemyQuestAudioPathSchema.parse(`alchemy-quest-voices/${toQuestVoiceSlug(questId)}.mp3`);
}

// Canonical spoken text for a quest's requester voice line: the requester's first
// catchphrase as a flavour intro, then the quest need. The recorded asset may add a
// brief in-character flourish when this falls under the synthesis length minimum.
export function getAlchemyQuestVoiceLineText(quest: StaticAlchemyQuest): string {
  const requester = getAlchemyCharacterForQuest(
    quest.narrative.requester,
    quest.continuation.arcId,
  );
  const intro = requester?.catchphrases[0]?.text;
  return intro ? `${intro} ${quest.narrative.need}` : quest.narrative.need;
}

// Resolve the audio the speaker icon should play for a quest card: the per-quest
// requester line when one exists, otherwise the requester character's catchphrase
// clip. Null when the requester has no committed voice asset.
export function getQuestRequesterVoiceClipPath(quest: StaticAlchemyQuest): string | null {
  const questClipPath =
    quest.continuation.stepCount === 1
      ? getAlchemyQuestVoiceClipPath(quest.continuation.arcId)
      : null;
  if (questClipPath) return questClipPath;
  const requester = getAlchemyCharacterForQuest(
    quest.narrative.requester,
    quest.continuation.arcId,
  );
  return requester?.voiceClips[0]?.audioPath ?? null;
}

type AlchemyQuestVoiceLine = {
  questId: AlchemyQuestVoiceLineId;
  audioPath: AlchemyQuestAudioPath;
  text: string;
};

export const ALCHEMY_QUEST_VOICE_LINES: readonly AlchemyQuestVoiceLine[] =
  ALCHEMY_QUEST_VOICE_LINE_IDS.map((questId) => {
    const quest = ALCHEMY_QUESTS.find(
      (entry) => entry.continuation.arcId === questId && entry.continuation.step === 1,
    );
    if (!quest) throw new Error(`Missing quest for voice line: ${questId}`);
    const audioPath = getAlchemyQuestVoiceClipPath(questId);
    if (!audioPath) throw new Error(`Missing audio path for voice line: ${questId}`);
    return { questId, audioPath, text: getAlchemyQuestVoiceLineText(quest) };
  });
