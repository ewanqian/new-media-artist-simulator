export const RUN_STATE_SCHEMA_VERSION = 2;
export const V051_RUN_SAVE_KEY = 'nmas-v05.1-run';

export type ResourceState = { cash: number; energy: number; reputation: number };
export type WorkVersion = {
  id: string;
  label: string;
  state: 'broken' | 'rough' | 'testable' | 'shared';
  createdByActionId: string;
};
export type Work = {
  id: string;
  workingTitle: string;
  projectId: string;
  status: 'broken' | 'draft' | 'in-progress' | 'testable' | 'public';
  originEventId: string;
  decisionIds: string[];
  versions?: WorkVersion[];
};
export type WorkUpdate = {
  workId: string;
  status?: Work['status'];
  decisionId?: string;
  addVersion?: WorkVersion;
};
export type FeedbackEntry = {
  id: string;
  source: 'self-test' | 'friend' | 'group' | 'venue';
  workId: string;
  versionId: string;
  text: string;
  createdByActionId: string;
};
export type RunHistoryEntry = { id: string; actionId: string; nodeId: string; summary: string; at: string };
export type RunState = {
  schemaVersion: typeof RUN_STATE_SCHEMA_VERSION; runId: string; identity: { id: string; label: string };
  chapterId: string; currentNodeId: string; objective: string; resources: ResourceState;
  projects: { id: string; title: string }[]; works: Work[]; people: string[]; evidence: string[];
  history: RunHistoryEntry[]; feedback: FeedbackEntry[]; flags: string[]; eventIds: string[]; knownConceptIds: string[];
};
export type StateDelta = {
  resources?: Partial<ResourceState>;
  addFlags?: string[];
  addEventIds?: string[];
  addKnownConceptIds?: string[];
  addWork?: Work;
  updateWork?: WorkUpdate;
  addFeedback?: FeedbackEntry;
};
export type NarrativeNode =
  | { id: string; type: 'observation' | 'transition'; text: string; nextNodeId: string }
  | { id: string; type: 'decision'; text: string; actions: NarrativeAction[] };
export type NarrativeAction = { id: string; label: string; nextNodeId: string; result: { summary: string; delta: StateDelta } };

export function createRunState(input: Pick<RunState, 'runId' | 'identity' | 'chapterId' | 'currentNodeId' | 'objective'>): RunState {
  return { schemaVersion: RUN_STATE_SCHEMA_VERSION, ...input, resources: { cash: 8000, energy: 3, reputation: 0 }, projects: [], works: [], people: [], evidence: [], history: [], feedback: [], flags: [], eventIds: [], knownConceptIds: [] };
}

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === 'string');
const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

function isWorkVersion(value: unknown): value is WorkVersion {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string'
    && typeof value.label === 'string'
    && ['broken', 'rough', 'testable', 'shared'].includes(String(value.state))
    && typeof value.createdByActionId === 'string';
}

function isWork(value: unknown): value is Work {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string'
    && typeof value.workingTitle === 'string'
    && typeof value.projectId === 'string'
    && ['broken', 'draft', 'in-progress', 'testable', 'public'].includes(String(value.status))
    && typeof value.originEventId === 'string'
    && isStringArray(value.decisionIds)
    && (value.versions === undefined || (Array.isArray(value.versions) && value.versions.every(isWorkVersion)));
}

function isHistoryEntry(value: unknown): value is RunHistoryEntry {
  if (!isRecord(value)) return false;
  return ['id', 'actionId', 'nodeId', 'summary', 'at'].every((key) => typeof value[key] === 'string');
}

function isFeedbackEntry(value: unknown): value is FeedbackEntry {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string'
    && ['self-test', 'friend', 'group', 'venue'].includes(String(value.source))
    && ['workId', 'versionId', 'text', 'createdByActionId'].every((key) => typeof value[key] === 'string');
}

export function isRunState(value: unknown): value is RunState {
  if (!isRecord(value) || value.schemaVersion !== RUN_STATE_SCHEMA_VERSION) return false;
  if (!['runId', 'chapterId', 'currentNodeId', 'objective'].every((key) => typeof value[key] === 'string')) return false;
  if (!isRecord(value.identity) || typeof value.identity.id !== 'string' || typeof value.identity.label !== 'string') return false;
  if (!isRecord(value.resources)) return false;
  const resources = value.resources;
  if (!['cash', 'energy', 'reputation'].every((key) => isFiniteNumber(resources[key]))) return false;
  if (!Array.isArray(value.projects) || !value.projects.every((project) => isRecord(project) && typeof project.id === 'string' && typeof project.title === 'string')) return false;
  if (!Array.isArray(value.works) || !value.works.every(isWork)) return false;
  if (!Array.isArray(value.history) || !value.history.every(isHistoryEntry)) return false;
  if (!Array.isArray(value.feedback) || !value.feedback.every(isFeedbackEntry)) return false;
  return ['people', 'evidence', 'flags', 'eventIds', 'knownConceptIds'].every((key) => isStringArray(value[key]));
}

function migrateV1(value: unknown): RunState | null {
  if (!isRecord(value) || value.schemaVersion !== 1 || typeof value.runId !== 'string' || !Array.isArray(value.works)) return null;
  const candidate = {
    ...value,
    schemaVersion: RUN_STATE_SCHEMA_VERSION,
    works: value.works.map((work) => isRecord(work) ? { ...work, versions: Array.isArray(work.versions) ? work.versions : [] } : work),
    feedback: [],
    eventIds: [],
    knownConceptIds: []
  };
  return isRunState(candidate) ? candidate : null;
}
/** Unknown saves reset; v1 migrates without touching legacy v05 storage. */
export function loadRunState(raw: string | null, fallback: RunState): RunState {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (isRunState(parsed)) return parsed;
    return migrateV1(parsed) || fallback;
  } catch { return fallback; }
}
export function saveRunState(storage: Pick<Storage, 'setItem'>, state: RunState) { storage.setItem(V051_RUN_SAVE_KEY, JSON.stringify(state)); }
export function applyAction(state: RunState, node: NarrativeNode, actionId: string, now = new Date().toISOString()): RunState {
  if (node.type !== 'decision') return state;
  if (state.history.some((entry) => entry.nodeId === node.id && entry.actionId === actionId)) return state;
  if (node.id !== state.currentNodeId) return state;
  const action = node.actions.find((item) => item.id === actionId);
  if (!action) return state;
  const delta = action.result.delta;
  const resources = { ...state.resources };
  for (const key of ['cash', 'energy', 'reputation'] as const) if (typeof delta.resources?.[key] === 'number') resources[key] += delta.resources[key] as number;
  let works = delta.addWork && !state.works.some((work) => work.id === delta.addWork?.id) ? [...state.works, delta.addWork] : state.works;
  if (delta.updateWork) {
    const update = delta.updateWork;
    works = works.map((work) => work.id !== update.workId ? work : {
      ...work,
      ...(update.status ? { status: update.status } : {}),
      decisionIds: update.decisionId && !work.decisionIds.includes(update.decisionId) ? [...work.decisionIds, update.decisionId] : work.decisionIds,
      versions: update.addVersion && !(work.versions || []).some((version) => version.id === update.addVersion?.id)
        ? [...(work.versions || []), update.addVersion]
        : work.versions
    });
  }
  const feedback = delta.addFeedback && !state.feedback.some((entry) => entry.id === delta.addFeedback?.id) ? [...state.feedback, delta.addFeedback] : state.feedback;
  return {
    ...state,
    currentNodeId: action.nextNodeId,
    resources,
    works,
    feedback,
    flags: [...new Set([...state.flags, ...(delta.addFlags || [])])],
    eventIds: [...new Set([...state.eventIds, ...(delta.addEventIds || [])])],
    knownConceptIds: [...new Set([...state.knownConceptIds, ...(delta.addKnownConceptIds || [])])],
    history: [...state.history, { id: `history-${state.history.length + 1}`, actionId: action.id, nodeId: node.id, summary: action.result.summary, at: now }]
  };
}
