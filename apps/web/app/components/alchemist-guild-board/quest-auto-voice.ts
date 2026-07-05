import type { AlchemistGuildBoardState } from "@dean-stack/schemas";

export const QUEST_AUTO_VOICE_DEBOUNCE_MS = 500;

type QuestAutoVoiceCandidate = {
  autoPlayedQuestVoiceIds: readonly string[];
  questId: string;
  unlocked: boolean;
  voiceClipPath: string | null;
};

export function getQuestAutoVoiceClipPath(candidate: QuestAutoVoiceCandidate): string | null {
  if (!candidate.unlocked) return null;
  if (!candidate.voiceClipPath) return null;
  if (candidate.autoPlayedQuestVoiceIds.includes(candidate.questId)) return null;

  return candidate.voiceClipPath;
}

export function markQuestVoiceAutoPlayed(
  boardState: AlchemistGuildBoardState,
  questId: string,
): AlchemistGuildBoardState {
  if (boardState.autoPlayedQuestVoiceIds.includes(questId)) return boardState;

  return {
    ...boardState,
    autoPlayedQuestVoiceIds: [...boardState.autoPlayedQuestVoiceIds, questId],
  };
}
