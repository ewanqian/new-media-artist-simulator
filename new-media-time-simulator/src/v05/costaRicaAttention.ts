import { butterflyScholarNarrativePack } from './butterflyScholarPack.ts';
import type { ConceptContract, PlayerProblem, SurfaceContract, SurfaceItem } from './controlSystem.ts';

const problemGoals: Record<string, string> = {
  'bs-01-invite': '决定是否接受一周驻地邀请',
  'bs-02-arrival': '弄清现场工作和公开边界',
  'bs-03-field': '决定今天从会飞的蝴蝶和现场留下什么',
  'bs-03b-audit': '决定补拍还是带着已知缺口离场',
  'bs-04-process': '处理无法对上的照片',
  'bs-04x-failure': '决定如何处理已经生成的坏版本',
  'bs-04a-represent': '决定观众是否先看见采集断裂',
  'bs-04e-compose': '决定画面为什么会动',
  'bs-04d-feedback': '选择是否测试第一版以及找谁测试',
  'bs-04f-authorship': '回应具体反馈或保留问题',
  'bs-04b-reveal': '处理协作者同时参与评估的角色冲突',
  'bs-05-public': '结束第一次公开测试'
};

export const costaRicaProblems: PlayerProblem[] = Object.entries(problemGoals).map(([id, goal]) => ({ id, objectId: 'work-costa-rica', goal }));

export const costaRicaConcepts: ConceptContract[] = [
  {
    id: 'person-ines',
    introducedByEventId: 'bs-02-arrival',
    relevantProblemIds: ['bs-02-arrival', 'bs-04b-reveal'],
    enablesActionIds: ['bs-arrival-work', 'bs-arrival-prior', 'bs-reveal-listen', 'bs-reveal-distance']
  },
  {
    id: 'person-rojas',
    introducedByEventId: 'bs-03-field',
    relevantProblemIds: ['bs-03-field', 'bs-03b-audit', 'bs-04-process'],
    enablesActionIds: ['bs-capture-relation', 'bs-capture-site', 'bs-capture-trace', 'bs-audit-recapture', 'bs-audit-leave', 'bs-align-diagnose', 'bs-align-force']
  }
];

const personConceptByActor: Record<string, string | undefined> = { ines: 'person-ines', rojas: 'person-rojas' };

export function costaRicaSurface(nodeId: string): SurfaceContract {
  const node = butterflyScholarNarrativePack.nodes.find((candidate) => candidate.id === nodeId);
  if (!node) throw new Error(`Unknown Costa Rica node: ${nodeId}`);
  const actorConcept = node.speakerId ? personConceptByActor[node.speakerId] : undefined;
  const items: SurfaceItem[] = [
    { id: `${node.id}-problem`, role: 'problem', text: problemGoals[node.id] || node.text[0] || '', priority: 'primary', problemId: node.id, factId: `${node.id}-problem` },
    ...(actorConcept ? [{ id: `${node.id}-speaker`, role: 'context' as const, text: actorConcept, priority: 'secondary' as const, problemId: node.id, conceptIds: [actorConcept], factId: `${node.id}-speaker` }] : []),
    ...node.text.map((text, index) => ({ id: `${node.id}-line-${index}`, role: 'context' as const, text, priority: 'secondary' as const, problemId: node.id, factId: `${node.id}-line-${index}` })),
    ...node.choices.map((choice) => ({
      id: `${node.id}-${choice.id}`,
      role: 'action' as const,
      text: `${choice.label}${choice.subtext || ''}`,
      priority: 'secondary' as const,
      problemId: node.id,
      enablesActionIds: [choice.id],
      effectRefs: [...Object.keys(choice.effects || {}), 'nextNodeId'],
      factId: `${node.id}-action-${choice.id}`
    }))
  ];
  return {
    id: node.id,
    moment: node.id === 'bs-05-public' ? 'result' : 'problem',
    currentProblemId: node.id,
    items,
    budget: { maxPrimaryItems: 1, maxActions: 3, maxNewConcepts: 1, maxCharacters: 430 }
  };
}
