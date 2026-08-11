export type NarrativeFactState = 'unknown' | 'claimed' | 'observed' | 'verified' | 'contradicted' | 'revealed';

export type NarrativeFact = {
  id: string;
  subjectId: string;
  label: string;
  state: NarrativeFactState;
  sourceIds: string[];
  contradicts?: string[];
  revealText?: string;
};

export type NarrativeMemory = {
  id: string;
  actorId: string;
  about: string;
  value: string;
  weight: number;
};

export type NarrativeActor = {
  id: string;
  name: string;
  publicRole: string;
  coverStory?: string;
  hiddenRole?: string;
  motives: string[];
  remembers: string[];
};

export type NarrativeChoiceEffect = {
  setFlags?: string[];
  clearFlags?: string[];
  factUpdates?: { factId: string; state: NarrativeFactState; sourceId?: string }[];
  memories?: Omit<NarrativeMemory, 'id'>[];
  trustDelta?: Record<string, number>;
};

export type NarrativeChoice = {
  id: string;
  label: string;
  subtext?: string;
  effects: NarrativeChoiceEffect;
  nextNodeId: string;
};

export type NarrativeNode = {
  id: string;
  sceneId: string;
  speakerId?: string;
  channel: 'scene' | 'dialogue' | 'message' | 'codec' | 'record';
  text: string[];
  requiresFlags?: string[];
  excludesFlags?: string[];
  choices: NarrativeChoice[];
};

export type NarrativeScene = {
  id: string;
  title: string;
  location: string;
  entryNodeId: string;
  actorIds: string[];
  tags: string[];
};

export type NarrativePack = {
  id: string;
  title: string;
  actors: NarrativeActor[];
  scenes: NarrativeScene[];
  nodes: NarrativeNode[];
  facts: NarrativeFact[];
};

export type NarrativeState = {
  packId: string;
  currentNodeId: string;
  visitedNodeIds: string[];
  flags: string[];
  facts: NarrativeFact[];
  memories: NarrativeMemory[];
  trust: Record<string, number>;
  history: { nodeId: string; choiceId?: string }[];
};

const unique = (values: string[]) => [...new Set(values)];

export function createNarrativeState(pack: NarrativePack): NarrativeState {
  const firstScene = pack.scenes[0];
  return {
    packId: pack.id,
    currentNodeId: firstScene.entryNodeId,
    visitedNodeIds: [],
    flags: [],
    facts: pack.facts.map((fact) => ({ ...fact, sourceIds: [...fact.sourceIds] })),
    memories: [],
    trust: Object.fromEntries(pack.actors.map((actor) => [actor.id, 0])),
    history: []
  };
}

export function narrativeNodeById(pack: NarrativePack, id: string) {
  return pack.nodes.find((node) => node.id === id);
}

export function narrativeNodeAvailable(node: NarrativeNode, state: NarrativeState) {
  const flags = new Set(state.flags);
  return (node.requiresFlags || []).every((flag) => flags.has(flag))
    && !(node.excludesFlags || []).some((flag) => flags.has(flag));
}

function applyEffects(state: NarrativeState, effects: NarrativeChoiceEffect): NarrativeState {
  const flags = new Set(state.flags);
  for (const flag of effects.setFlags || []) flags.add(flag);
  for (const flag of effects.clearFlags || []) flags.delete(flag);

  const facts = state.facts.map((fact) => {
    const update = (effects.factUpdates || []).find((item) => item.factId === fact.id);
    if (!update) return fact;
    return {
      ...fact,
      state: update.state,
      sourceIds: unique([...fact.sourceIds, ...(update.sourceId ? [update.sourceId] : [])])
    };
  });

  const memories = [...state.memories];
  for (const memory of effects.memories || []) {
    memories.push({ ...memory, id: `mem-${memories.length + 1}` });
  }

  const trust = { ...state.trust };
  for (const [actorId, delta] of Object.entries(effects.trustDelta || {})) {
    trust[actorId] = Number(trust[actorId] || 0) + delta;
  }

  return { ...state, flags: [...flags], facts, memories, trust };
}

export function applyNarrativeChoice(pack: NarrativePack, state: NarrativeState, choiceId: string): NarrativeState {
  const node = narrativeNodeById(pack, state.currentNodeId);
  if (!node || !narrativeNodeAvailable(node, state)) return state;
  const choice = node.choices.find((item) => item.id === choiceId);
  if (!choice) return state;
  const nextNode = narrativeNodeById(pack, choice.nextNodeId);
  if (!nextNode) return state;

  const effected = applyEffects(state, choice.effects);
  return {
    ...effected,
    currentNodeId: nextNode.id,
    visitedNodeIds: unique([...state.visitedNodeIds, node.id]),
    history: [...state.history, { nodeId: node.id, choiceId }]
  };
}

export function narrativeContradictions(state: NarrativeState) {
  const byId = new Map(state.facts.map((fact) => [fact.id, fact]));
  return state.facts.filter((fact) =>
    fact.state !== 'unknown'
    && (fact.contradicts || []).some((id) => {
      const other = byId.get(id);
      return other && other.state !== 'unknown';
    })
  );
}

export function narrativeKnownFacts(state: NarrativeState) {
  return state.facts.filter((fact) => fact.state !== 'unknown');
}
