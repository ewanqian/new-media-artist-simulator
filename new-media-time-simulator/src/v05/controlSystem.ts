export type SurfaceMoment = 'entry' | 'problem' | 'result' | 'optional-help' | 'ending';
export type SurfaceRole = 'context' | 'problem' | 'action' | 'result' | 'status' | 'navigation' | 'help';

export type PlayerProblem = {
  id: string;
  objectId: string;
  goal: string;
};

export type ConceptContract = {
  id: string;
  introducedByEventId: string;
  relevantProblemIds: string[];
  enablesActionIds: string[];
};

export type SurfaceItem = {
  id: string;
  role: SurfaceRole;
  text: string;
  priority: 'primary' | 'secondary' | 'optional';
  problemId?: string;
  conceptIds?: string[];
  enablesActionIds?: string[];
  effectRefs?: string[];
  factId?: string;
};

export type AttentionBudget = {
  maxPrimaryItems: number;
  maxActions: number;
  maxNewConcepts: number;
  maxCharacters: number;
};

export type SurfaceContract = {
  id: string;
  moment: SurfaceMoment;
  currentProblemId?: string;
  items: SurfaceItem[];
  budget: AttentionBudget;
};

export type AttentionContext = {
  reachedEventIds: string[];
  knownConceptIds: string[];
  availableActionIds: string[];
};

export type ControlIssue = {
  surfaceId: string;
  itemId?: string;
  kind: 'attention' | 'redundancy' | 'traceability';
  message: string;
};

const unique = <T>(values: T[]) => [...new Set(values)];

/**
 * Generic gate. No keyword blacklist.
 * A concept appears only after introduction, for current problem, enabling a live action.
 */
export function evaluateSurface(
  surface: SurfaceContract,
  problems: PlayerProblem[],
  concepts: ConceptContract[],
  context: AttentionContext
): ControlIssue[] {
  const issues: ControlIssue[] = [];
  const problemIds = new Set(problems.map((problem) => problem.id));
  const conceptById = new Map(concepts.map((concept) => [concept.id, concept]));
  const known = new Set(context.knownConceptIds);
  const reached = new Set(context.reachedEventIds);
  const available = new Set(context.availableActionIds);
  const primary = surface.items.filter((item) => item.priority === 'primary');
  const actions = surface.items.filter((item) => item.role === 'action');
  const characters = surface.items.reduce((total, item) => total + item.text.length, 0);

  if (primary.length > surface.budget.maxPrimaryItems) {
    issues.push({ surfaceId: surface.id, kind: 'attention', message: 'Too many primary attention targets.' });
  }
  if (actions.length > surface.budget.maxActions) {
    issues.push({ surfaceId: surface.id, kind: 'attention', message: 'Too many simultaneous actions.' });
  }
  if (characters > surface.budget.maxCharacters) {
    issues.push({ surfaceId: surface.id, kind: 'attention', message: 'Visible copy exceeds surface budget.' });
  }
  if (surface.currentProblemId && !problemIds.has(surface.currentProblemId)) {
    issues.push({ surfaceId: surface.id, kind: 'traceability', message: 'Current problem has no definition.' });
  }
  if (surface.moment === 'problem' && !surface.items.some((item) => item.role === 'problem')) {
    issues.push({ surfaceId: surface.id, kind: 'traceability', message: 'Problem surface has no visible problem.' });
  }
  if (surface.moment === 'problem' && (actions.length < 2 || actions.length > 3)) {
    issues.push({ surfaceId: surface.id, kind: 'attention', message: 'Decision surface needs 2–3 actions.' });
  }

  const newConceptIds: string[] = [];
  for (const item of surface.items) {
    const affects = unique([...(item.enablesActionIds || []), ...(item.effectRefs || [])]);
    if (!['context', 'problem', 'help'].includes(item.role) && affects.length === 0) {
      issues.push({ surfaceId: surface.id, itemId: item.id, kind: 'redundancy', message: 'Visible item changes nothing.' });
    }
    if (item.problemId && item.problemId !== surface.currentProblemId) {
      issues.push({ surfaceId: surface.id, itemId: item.id, kind: 'attention', message: 'Item serves a different problem.' });
    }
    if (item.role === 'action') {
      for (const actionId of item.enablesActionIds || []) {
        if (!available.has(actionId)) {
          issues.push({ surfaceId: surface.id, itemId: item.id, kind: 'traceability', message: 'Visible action is not available in state.' });
        }
      }
      if (!(item.effectRefs || []).length) {
        issues.push({ surfaceId: surface.id, itemId: item.id, kind: 'traceability', message: 'Action has no state effect.' });
      }
    }

    for (const conceptId of item.conceptIds || []) {
      const concept = conceptById.get(conceptId);
      if (!concept) {
        issues.push({ surfaceId: surface.id, itemId: item.id, kind: 'traceability', message: `Concept has no contract: ${conceptId}` });
        continue;
      }
      if (!known.has(conceptId)) newConceptIds.push(conceptId);
      if (!known.has(conceptId) && !reached.has(concept.introducedByEventId)) {
        issues.push({ surfaceId: surface.id, itemId: item.id, kind: 'attention', message: `Concept appears before introduction: ${conceptId}` });
      }
      if (surface.currentProblemId && !concept.relevantProblemIds.includes(surface.currentProblemId)) {
        issues.push({ surfaceId: surface.id, itemId: item.id, kind: 'attention', message: `Concept is irrelevant now: ${conceptId}` });
      }
      if (!concept.enablesActionIds.some((actionId) => available.has(actionId))) {
        issues.push({ surfaceId: surface.id, itemId: item.id, kind: 'redundancy', message: `Concept enables no current action: ${conceptId}` });
      }
    }
  }

  if (unique(newConceptIds).length > surface.budget.maxNewConcepts) {
    issues.push({ surfaceId: surface.id, kind: 'attention', message: 'Too many new concepts introduced at once.' });
  }

  const facts = surface.items.map((item) => item.factId).filter(Boolean) as string[];
  for (const factId of unique(facts)) {
    if (facts.filter((value) => value === factId).length > 1) {
      issues.push({ surfaceId: surface.id, kind: 'redundancy', message: `Same fact shown more than once: ${factId}` });
    }
  }
  return issues;
}

export type ChangeRecord = {
  id: string;
  playerProblem: string;
  changedFiles: string[];
  stateEffect: string;
  automatedChecks: string[];
  humanReview: 'pending' | 'passed' | 'failed';
  rollbackCommit: string;
};

export function validateChangeRecord(record: ChangeRecord): string[] {
  const missing: string[] = [];
  if (!record.playerProblem.trim()) missing.push('playerProblem');
  if (!record.changedFiles.length) missing.push('changedFiles');
  if (!record.stateEffect.trim()) missing.push('stateEffect');
  if (!record.automatedChecks.length) missing.push('automatedChecks');
  if (!record.rollbackCommit.trim()) missing.push('rollbackCommit');
  return missing;
}
