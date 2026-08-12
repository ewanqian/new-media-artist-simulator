import { CAREER_SAVE_KEY } from './careerContent.ts';
import type { NarrativeState } from './narrativeEngine.ts';
import {
  deriveCostaRicaAssets,
  deriveCostaRicaMementos,
  type CostaRicaWorldSnapshot
} from './costaRicaRouteState.ts';

export const SPECIAL_CARRYOVER_KEY = 'nmas-special-carryovers-v1';

export type SpecialCarryover = {
  sourceId: string;
  title: string;
  completed: boolean;
  assetIds: string[];
  assets: ReturnType<typeof deriveCostaRicaAssets>;
  mementoIds: string[];
  mementos: ReturnType<typeof deriveCostaRicaMementos>;
  methodIds: string[];
  knowledgeIds: string[];
  nodeIds: string[];
  evidenceIds: string[];
};

const unique = (values: string[] = []) => [...new Set(values.filter(Boolean))];

export function buildCostaRicaCarryover(state: NarrativeState, world: CostaRicaWorldSnapshot = {}): SpecialCarryover {
  const assets = deriveCostaRicaAssets(state, world);
  const mementos = deriveCostaRicaMementos(state, world);
  return {
    sourceId: 'special-01-costa-rica',
    title: '哥斯达黎加',
    completed: (state.flags || []).includes('butterfly-route-complete'),
    assetIds: assets.map((item) => item.id),
    assets,
    mementoIds: mementos.map((item) => item.id),
    mementos,
    methodIds: unique(world.methodIds || []),
    knowledgeIds: unique(world.researchIds || []),
    nodeIds: unique(world.unlockNodeIds || []),
    evidenceIds: unique(world.evidenceIds || [])
  };
}

export function mergeSpecialCarryoverIntoCareer(save: Record<string, any>, carryover: SpecialCarryover) {
  const previous = Array.isArray(save.specialCarryovers) ? save.specialCarryovers : [];
  const specialCarryovers = [...previous.filter((item: SpecialCarryover) => item.sourceId !== carryover.sourceId), carryover];
  return {
    ...save,
    methodIds: unique([...(save.methodIds || []), ...carryover.methodIds]),
    evidenceIds: unique([...(save.evidenceIds || []), ...carryover.evidenceIds]),
    unlockedNodeIds: unique([...(save.unlockedNodeIds || []), ...carryover.nodeIds]),
    specialKnowledgeIds: unique([...(save.specialKnowledgeIds || []), ...carryover.knowledgeIds]),
    specialAssetIds: unique([...(save.specialAssetIds || []), ...carryover.assetIds]),
    mementoIds: unique([...(save.mementoIds || []), ...carryover.mementoIds]),
    specialCarryovers
  };
}

export function mergeStoredSpecialCarryoversIntoCareer(save: Record<string, any>) {
  if (typeof localStorage === 'undefined') return save;
  try {
    const stored = JSON.parse(localStorage.getItem(SPECIAL_CARRYOVER_KEY) || '[]');
    if (!Array.isArray(stored)) return save;
    return stored.reduce((current, carryover) => mergeSpecialCarryoverIntoCareer(current, carryover), save);
  } catch {
    return save;
  }
}

export function persistSpecialCarryover(carryover: SpecialCarryover) {
  if (typeof localStorage === 'undefined') return;
  try {
    const current = JSON.parse(localStorage.getItem(SPECIAL_CARRYOVER_KEY) || '[]');
    const list = Array.isArray(current) ? current : [];
    const next = [...list.filter((item: SpecialCarryover) => item.sourceId !== carryover.sourceId), carryover];
    localStorage.setItem(SPECIAL_CARRYOVER_KEY, JSON.stringify(next));

    const careerSave = JSON.parse(localStorage.getItem(CAREER_SAVE_KEY) || 'null');
    if (careerSave) localStorage.setItem(CAREER_SAVE_KEY, JSON.stringify(mergeSpecialCarryoverIntoCareer(careerSave, carryover)));
  } catch {
    // A broken optional carryover should never block the chapter ending.
  }
}
