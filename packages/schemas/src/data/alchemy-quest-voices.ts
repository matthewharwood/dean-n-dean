import * as z from "zod";

import { getAlchemyCharactersByRequester } from "./alchemy-characters";
import { ALCHEMY_QUESTS, type StaticAlchemyQuest } from "./alchemy-quests";

// Per-quest requester voice lines ("catchphrase + need"), played from the speaker
// icon on a quest briefing card. Assets live in apps/<app>/public/alchemy-quest-voices/.
const AlchemyQuestAudioPathSchema = z.string().regex(/^alchemy-quest-voices\/[a-z0-9-]+\.mp3$/);
type AlchemyQuestAudioPath = z.infer<typeof AlchemyQuestAudioPathSchema>;

// Quests that ship a recorded requester voice line. Currently the tutorial arc
// through the first glassworks quest ("up until glass"). Extend by adding a quest
// id here and committing the matching alchemy-quest-voices/<slug>.mp3 asset.
const ALCHEMY_QUEST_VOICE_LINE_IDS = [
  "quest:first-water",
  "quest:kitchen-salt-and-fuel",
  "quest:metal-samples",
  "quest:field-kit-basics",
  "quest:glass-minerals",
] as const;
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
  const requester = getAlchemyCharactersByRequester(quest.narrative.requester)[0];
  const intro = requester?.catchphrases[0]?.text;
  return intro ? `${intro} ${quest.narrative.need}` : quest.narrative.need;
}

// Resolve the audio the speaker icon should play for a quest card: the per-quest
// requester line when one exists, otherwise the requester character's catchphrase
// clip. Null when the requester has no committed voice asset.
export function getQuestRequesterVoiceClipPath(quest: StaticAlchemyQuest): string | null {
  const questClipPath = getAlchemyQuestVoiceClipPath(quest.id);
  if (questClipPath) return questClipPath;
  const requester = getAlchemyCharactersByRequester(quest.narrative.requester)[0];
  return requester?.voiceClips[0]?.audioPath ?? null;
}

type AlchemyQuestVoiceLine = {
  questId: AlchemyQuestVoiceLineId;
  audioPath: AlchemyQuestAudioPath;
  text: string;
};

export const ALCHEMY_QUEST_VOICE_LINES: readonly AlchemyQuestVoiceLine[] =
  ALCHEMY_QUEST_VOICE_LINE_IDS.map((questId) => {
    const quest = ALCHEMY_QUESTS.find((entry) => entry.id === questId);
    if (!quest) throw new Error(`Missing quest for voice line: ${questId}`);
    const audioPath = getAlchemyQuestVoiceClipPath(questId);
    if (!audioPath) throw new Error(`Missing audio path for voice line: ${questId}`);
    return { questId, audioPath, text: getAlchemyQuestVoiceLineText(quest) };
  });
