import type { ProjectStageId } from './gameLoop.ts';
import {
  contextualFragments,
  fragmentsForKnowledge,
  type WorldTextFragment
} from './textEcology.ts';

const placeContext: Record<string, { regionId?: string; facilityId?: string }> = {
  'place-basic-studio': { regionId: 'region-putuo-sucreek', facilityId: 'putuo-studio-floor' },
  'place-archive-reading': { regionId: 'region-putuo-sucreek' },
  'place-project-space': { regionId: 'region-putuo-sucreek', facilityId: 'putuo-project-room' },
  'place-peer-meet': { regionId: 'region-yangpu', facilityId: 'yangpu-peer-cafe' },
  'place-blackbox': { regionId: 'region-westbund', facilityId: 'westbund-blackbox' },
  'place-fabrication': { regionId: 'region-songjiang', facilityId: 'songjiang-workshop' },
  'place-institution': { regionId: 'region-huangpu-riverside', facilityId: 'huangpu-museum-backstage' },
  'place-fair': { regionId: 'region-huangpu-riverside', facilityId: 'huangpu-opening-floor' }
};

const actionKnowledge: Record<string, string[]> = {
  'studio-media-archaeology': ['media-archaeology', 'documentation'],
  'studio-minimum-system': ['realtime-system'],
  'studio-sort-material': ['documentation'],
  'studio-read-theory': ['shanghai-media-ecology'],
  'project-one-page': ['documentation', 'institutional-language'],
  'project-run-long': ['realtime-system'],
  'project-document': ['documentation', 'technical-rider'],
  'income-small-commission': ['production-scope']
};

function dedupe(fragments: WorldTextFragment[]): WorldTextFragment[] {
  const ids = new Set<string>();
  return fragments.filter((fragment) => {
    if (ids.has(fragment.id)) return false;
    ids.add(fragment.id);
    return true;
  });
}

export function fragmentsForPlaceCard(placeId: string, week: number, limit = 3): WorldTextFragment[] {
  const context = placeContext[placeId] || {};
  return contextualFragments({ week, ...context, limit });
}

export function fragmentsForActionCard(actionCardId: string, week: number, limit = 2): WorldTextFragment[] {
  const knowledgeIds = actionKnowledge[actionCardId] || [];
  const candidates = knowledgeIds.flatMap((knowledgeId) => fragmentsForKnowledge(knowledgeId, week, limit + 1));
  if (candidates.length) return dedupe(candidates).slice(0, limit);
  return contextualFragments({ week, limit });
}

export function experienceStream(
  week: number,
  completedCardIds: string[],
  visitedPlaceIds: string[],
  stageId?: ProjectStageId,
  limit = 4
): WorldTextFragment[] {
  const candidates: WorldTextFragment[] = [];
  const lastAction = completedCardIds.at(-1);
  const lastPlace = visitedPlaceIds.at(-1);
  if (lastAction) candidates.push(...fragmentsForActionCard(lastAction, week, 3));
  if (lastPlace) candidates.push(...fragmentsForPlaceCard(lastPlace, week, 3));
  candidates.push(...contextualFragments({ week, projectStageId: stageId, limit: 5 }));
  return dedupe(candidates).slice(0, limit);
}

export function placeCardHasEcology(placeId: string): boolean {
  return Boolean(placeContext[placeId]);
}
