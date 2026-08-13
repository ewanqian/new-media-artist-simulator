export const RUN_STATE_SCHEMA_VERSION = 1;
export const V051_RUN_SAVE_KEY = 'nmas-v05.1-run';

export type ResourceState = { cash: number; energy: number; reputation: number };
export type Work = { id: string; workingTitle: string; projectId: string; status: 'draft' | 'in-progress' | 'public'; originEventId: string; decisionIds: string[] };
export type RunHistoryEntry = { id: string; actionId: string; nodeId: string; summary: string; at: string };
export type RunState = {
  schemaVersion: typeof RUN_STATE_SCHEMA_VERSION; runId: string; identity: { id: string; label: string };
  chapterId: string; currentNodeId: string; objective: string; resources: ResourceState;
  projects: { id: string; title: string }[]; works: Work[]; people: string[]; evidence: string[];
  history: RunHistoryEntry[]; flags: string[];
};
export type StateDelta = { resources?: Partial<ResourceState>; addFlags?: string[]; addWork?: Work };
export type NarrativeNode =
  | { id: string; type: 'observation' | 'transition'; text: string; nextNodeId: string }
  | { id: string; type: 'decision'; text: string; actions: NarrativeAction[] };
export type NarrativeAction = { id: string; label: string; nextNodeId: string; result: { summary: string; delta: StateDelta } };

export function createRunState(input: Pick<RunState, 'runId' | 'identity' | 'chapterId' | 'currentNodeId' | 'objective'>): RunState {
  return { schemaVersion: RUN_STATE_SCHEMA_VERSION, ...input, resources: { cash: 8000, energy: 3, reputation: 0 }, projects: [], works: [], people: [], evidence: [], history: [], flags: [] };
}
export function isRunState(value: unknown): value is RunState {
  const state = value as Partial<RunState> | null;
  return Boolean(state && state.schemaVersion === RUN_STATE_SCHEMA_VERSION && typeof state.runId === 'string' && typeof state.currentNodeId === 'string' && state.resources && Number.isFinite(state.resources.cash) && Array.isArray(state.works) && Array.isArray(state.history));
}
/** Unknown or legacy v05.1 saves reset safely; existing v05 content saves remain untouched. */
export function loadRunState(raw: string | null, fallback: RunState): RunState {
  if (!raw) return fallback;
  try { const parsed = JSON.parse(raw); return isRunState(parsed) ? parsed : fallback; } catch { return fallback; }
}
export function saveRunState(storage: Pick<Storage, 'setItem'>, state: RunState) { storage.setItem(V051_RUN_SAVE_KEY, JSON.stringify(state)); }
export function applyAction(state: RunState, node: NarrativeNode, actionId: string, now = new Date().toISOString()): RunState {
  if (node.type !== 'decision') return state;
  const action = node.actions.find((item) => item.id === actionId);
  if (!action) return state;
  const delta = action.result.delta;
  const resources = { ...state.resources };
  for (const key of ['cash', 'energy', 'reputation'] as const) if (typeof delta.resources?.[key] === 'number') resources[key] += delta.resources[key] as number;
  const works = delta.addWork && !state.works.some((work) => work.id === delta.addWork?.id) ? [...state.works, delta.addWork] : state.works;
  return { ...state, currentNodeId: action.nextNodeId, resources, works, flags: [...new Set([...state.flags, ...(delta.addFlags || [])])], history: [...state.history, { id: `history-${state.history.length + 1}`, actionId: action.id, nodeId: node.id, summary: action.result.summary, at: now }] };
}
