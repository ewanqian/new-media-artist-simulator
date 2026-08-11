import { openingEpisodeRuntime, openingQuestLine, type Quest, type QuestObjective } from './playStructure.ts';

export type TriadQuestState = {
  completedCardIds: string[];
  visitedPlaceIds: string[];
  primaryProject: unknown | null;
  contactThreads: Record<string, { from: string; text: string }[]>;
  receivedFeedbackCount?: number;
  evidenceIds?: string[];
  contextActionIds?: string[];
  revealedIssueIds?: string[];
  resolvedIssueIds?: string[];
  methodIds?: string[];
  workbench: { output?: number; compute?: number; capture?: number; storage?: number };
  scopeAdapted?: boolean;
  publicOutputCount?: number;
};

export type ObjectiveProgress = QuestObjective & { done: boolean };
export type QuestProgress = Omit<Quest, 'objectives'> & { objectives: ObjectiveProgress[]; done: boolean; active: boolean };

function sentAnyMessage(state: TriadQuestState): boolean {
  return Object.values(state.contactThreads || {}).some((thread) => thread.some((message) => message.from === 'you'));
}

function objectiveDone(objectiveId: string, state: TriadQuestState): boolean {
  const contextActions = state.contextActionIds || [];
  const evidence = state.evidenceIds || [];
  const revealed = state.revealedIssueIds || [];
  const resolved = state.resolvedIssueIds || [];
  const methods = state.methodIds || [];
  const visited = state.visitedPlaceIds || [];

  switch (objectiveId) {
    case 'make-prototype': return state.completedCardIds.length > 0;
    case 'project-appears': return Boolean(state.primaryProject);
    case 'enter-context': return visited.length > 0;
    case 'context-action': return contextActions.length > 0;
    case 'show-relevant-person': return sentAnyMessage(state);
    case 'receive-feedback': return (state.receivedFeedbackCount || 0) > 0;
    case 'archive-feedback': return evidence.some((id) => id.startsWith('feedback:'));
    case 'reveal-thread': return revealed.length > 0;
    case 'diagnose-thread': return resolved.length > 0;
    case 'method-unlock': return methods.length > 0;
    case 'choose-presentation-context': return visited.some((id) => ['place-blackbox', 'place-institution', 'place-project-space'].includes(id));
    case 'meet-or-adapt': return (state.workbench.output || 1) >= 2 || Boolean(state.scopeAdapted);
    case 'public-output': return (state.publicOutputCount || 0) > 0;
    default: return false;
  }
}

export function openingQuestProgress(state: TriadQuestState) {
  let previousDone = true;
  const quests: QuestProgress[] = openingQuestLine.quests.map((quest) => {
    const objectives = quest.objectives.map((objective) => ({ ...objective, done: objectiveDone(objective.id, state) }));
    const done = objectives.every((objective) => objective.done);
    const active = previousDone && !done;
    previousDone = previousDone && done;
    return { ...quest, objectives, done, active };
  });
  const completed = quests.filter((quest) => quest.done).length;
  const active = quests.find((quest) => quest.active) || quests.at(-1)!;
  return {
    runtime: openingEpisodeRuntime,
    line: openingQuestLine,
    quests,
    active,
    completed,
    total: quests.length,
    complete: completed === quests.length,
    ratio: completed / quests.length
  };
}

export function activeQuestHint(state: TriadQuestState): string {
  const progress = openingQuestProgress(state);
  const next = progress.active.objectives.find((objective) => !objective.done);
  return next?.text || (progress.complete ? '第一条主线已经完成。' : progress.active.title);
}
