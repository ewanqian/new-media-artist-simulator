export type BlueprintNodeCategory =
  | 'material'
  | 'media'
  | 'process'
  | 'behavior'
  | 'interface'
  | 'spatial'
  | 'lineage'
  | 'constraint';

export type BlueprintEdgeKind = 'signal' | 'physical' | 'concept' | 'dependency';
export type MasteryLevel = 0 | 1 | 2 | 3;
export type DiagnosticState = 0 | 1 | 2 | 3;

export type ResourceRequirement = {
  resourceId: string;
  amount: number;
};

export type BlueprintNodeDefinition = {
  id: string;
  label: string;
  category: BlueprintNodeCategory;
  family: string;
  summary: string;
  masteryRequired: MasteryLevel;
  requirements?: ResourceRequirement[];
  tags?: string[];
};

export type BlueprintNodeInstance = {
  id: string;
  definitionId: string;
  x: number;
  y: number;
  params?: Record<string, string | number | boolean>;
};

export type BlueprintEdge = {
  id: string;
  from: string;
  to: string;
  kind: BlueprintEdgeKind;
};

export type Blueprint = {
  schema: 'nmas-blueprint-v1';
  id: string;
  title: string;
  revision: number;
  parentBlueprintId?: string;
  nodes: BlueprintNodeInstance[];
  edges: BlueprintEdge[];
  notes?: string[];
};

export type ResourceAccess = {
  resourceId: string;
  owned: number;
  borrowable: number;
  rentable: number;
  rentCost?: number;
};

export type CreativeProfile = {
  unlockedNodeIds: string[];
  masteryPoints: Record<string, number>;
  resources: Record<string, ResourceAccess>;
};

export type BlueprintDiagnostic = {
  state: DiagnosticState;
  reasons: string[];
};

export type BlueprintValidation = {
  unknownNodeIds: string[];
  lockedNodeIds: string[];
  masteryBlocks: Array<{ nodeId: string; family: string; required: MasteryLevel; current: MasteryLevel }>;
  missingResources: Array<{ resourceId: string; needed: number; available: number; shortfall: number }>;
  danglingEdges: string[];
  complexity: { nodeCount: number; edgeCount: number; tier: 'small' | 'medium' | 'dense' | 'stress' };
  diagnostics: {
    run: BlueprintDiagnostic;
    build: BlueprintDiagnostic;
    read: BlueprintDiagnostic;
  };
};

const N = (
  id: string,
  label: string,
  category: BlueprintNodeCategory,
  family: string,
  summary: string,
  masteryRequired: MasteryLevel,
  requirements?: ResourceRequirement[],
  tags?: string[]
): BlueprintNodeDefinition => ({ id, label, category, family, summary, masteryRequired, requirements, tags });

export const blueprintNodeDefinitions: BlueprintNodeDefinition[] = [
  N('camera-live', '实时摄像头', 'media', 'image-video-capture', '把附近发生的图像变成实时信号。', 1, [{ resourceId: 'camera', amount: 1 }], ['live', 'video']),
  N('phone-camera', '手机摄像', 'media', 'image-video-capture', '低门槛、随身、容易进入公共空间。', 0, [{ resourceId: 'phone', amount: 1 }], ['live', 'portable']),
  N('lidar-scan', 'LiDAR / 空间扫描', 'media', 'scan-spatial-capture', '把空间转成可计算的点和表面。', 2, [{ resourceId: 'scanner', amount: 1 }], ['scan', 'space']),
  N('field-audio', '现场声音', 'media', 'sensor-live-input', '把环境中的声音作为实时输入。', 1, [{ resourceId: 'recorder', amount: 1 }], ['audio', 'live']),
  N('sensor-presence', '存在 / 距离传感', 'media', 'sensor-live-input', '让身体靠近、离开或移动成为输入。', 2, [{ resourceId: 'sensor-kit', amount: 1 }], ['body', 'sensor']),
  N('vhs-source', 'VHS / 旧录像', 'material', 'old-media', '把失真的旧媒介作为具体材料而不是滤镜。', 1, [{ resourceId: 'vhs-deck', amount: 1 }], ['obsolete', 'video']),
  N('crt-display', 'CRT 显示', 'material', 'single-display', '有重量、体积、扫描线和具体历史的显示设备。', 1, [{ resourceId: 'crt', amount: 1 }], ['display', 'obsolete']),
  N('projector', '投影', 'material', 'single-display', '把影像投到具体表面和距离关系中。', 1, [{ resourceId: 'projector', amount: 1 }], ['display', 'light']),
  N('multi-screen', '多屏输出', 'material', 'multi-output-mapping', '多个显示面之间需要同步、映射和空间组织。', 2, [{ resourceId: 'display', amount: 3 }], ['display', 'multi']),
  N('motor-motion', '电机 / 机械运动', 'material', 'automation-integration', '把计算结果变成真实空间中的运动。', 2, [{ resourceId: 'motor-kit', amount: 1 }], ['motion', 'physical']),
  N('water-fog', '水 / 雾', 'material', 'spatial-special-display', '不稳定、会扩散、会反射，也会制造维护问题。', 2, [{ resourceId: 'fog-water-kit', amount: 1 }], ['ephemeral', 'space']),
  N('realtime-render', '实时图形', 'process', 'realtime-graphics', '把输入持续转换成可见的实时画面。', 1, undefined, ['realtime', 'graphics']),
  N('delay', '延迟', 'process', 'realtime-graphics', '把当前和稍早之前的时间叠在一起。', 1, undefined, ['time', 'signal']),
  N('feedback-loop', '反馈循环', 'behavior', 'realtime-graphics', '把输出重新送回输入，形成可控或失控的循环。', 2, undefined, ['feedback', 'system']),
  N('accumulate', '累积', 'behavior', 'automation-integration', '让每次事件在系统里留下痕迹。', 1, undefined, ['memory', 'system']),
  N('decay', '衰减', 'behavior', 'automation-integration', '让痕迹随时间失去强度，而不是永久保留。', 1, undefined, ['time', 'system']),
  N('mutation', '突变', 'behavior', 'reconstruction-generation', '让规则在运行中改变自身参数或结构。', 3, undefined, ['generative', 'mutation']),
  N('gaussian-reconstruct', 'Gaussian Splatting 重建', 'process', 'reconstruction-generation', '从采集数据形成可导航的空间表征。', 2, [{ resourceId: 'gpu-time', amount: 1 }], ['3d', 'reconstruction']),
  N('vision-classify', '机器观看 / 识别', 'process', 'reconstruction-generation', '让机器对图像做判断，并允许错误成为素材。', 2, [{ resourceId: 'model-access', amount: 1 }], ['ai', 'vision']),
  N('network-relay', '网络转发', 'process', 'automation-integration', '把信号送到另一个设备或地点。', 2, [{ resourceId: 'network', amount: 1 }], ['network', 'remote']),
  N('audience-body', '观众身体', 'interface', 'participation', '观众的位置、行为或停留时间进入作品。', 1, undefined, ['body', 'audience']),
  N('touch-choice', '触摸 / 选择', 'interface', 'participation', '观众明确做出输入。', 1, [{ resourceId: 'input-device', amount: 1 }], ['interaction']),
  N('passive-presence', '被动在场', 'interface', 'participation', '观众不需要“操作”，但身体仍改变系统。', 2, undefined, ['body', 'ambient']),
  N('stack', '堆叠', 'spatial', 'spatial-composition', '通过重量和上下关系组织设备。', 0, undefined, ['physical']),
  N('ring-layout', '环形', 'spatial', 'spatial-composition', '把观看者包在多个输出之间。', 1, undefined, ['immersive']),
  N('site-specific', '场域特定', 'spatial', 'site-method', '作品的一部分依赖具体空间，而非可随意搬走。', 2, undefined, ['site']),
  N('remote-pair', '异地成对', 'spatial', 'site-method', '两个地点通过网络或同步关系构成同一件作品。', 2, [{ resourceId: 'network', amount: 1 }], ['remote', 'site']),
  N('ready-made', '现成品', 'lineage', 'art-lineage', '把已有物件重新放入作品关系中。', 1, undefined, ['dada', 'appropriation']),
  N('media-archaeology', '媒体考古', 'lineage', 'art-lineage', '从旧媒介的具体技术历史重新理解当下。', 1, undefined, ['history', 'obsolete']),
  N('closed-circuit-video', '闭路电视', 'lineage', 'art-lineage', '摄像、显示和观看者同时存在于同一回路。', 2, undefined, ['video-art', 'feedback']),
  N('network-art', '网络艺术', 'lineage', 'art-lineage', '把网络关系本身作为作品材料。', 2, undefined, ['net-art']),
  N('system-art', '系统艺术', 'lineage', 'art-lineage', '作品的关键是规则、反馈和关系，而不是单一物件。', 2, undefined, ['system']),
  N('institutional-lens', '制度语境', 'lineage', 'art-lineage', '作品与展示、组织和解释机制发生关系。', 3, undefined, ['institution']),
  N('budget-tight', '预算紧', 'constraint', 'production-constraint', '资源有限会迫使结构收缩或替换。', 0, undefined, ['budget']),
  N('no-drill', '禁止打孔', 'constraint', 'production-constraint', '空间规则改变结构与安装方案。', 0, undefined, ['venue']),
  N('single-socket', '只有一个插座', 'constraint', 'production-constraint', '电力限制迫使系统降低复杂度。', 0, undefined, ['power']),
  N('setup-two-hours', '两小时搭建', 'constraint', 'production-constraint', '安装时间成为真实设计变量。', 0, undefined, ['time']),
  N('transport-one-box', '只能运输一个箱子', 'constraint', 'production-constraint', '体积和重量直接改变作品选择。', 0, undefined, ['transport'])
];

export const blueprintNodeById = new Map(blueprintNodeDefinitions.map((node) => [node.id, node]));

export function masteryLevelFromPoints(points: number): MasteryLevel {
  if (points >= 70) return 3;
  if (points >= 30) return 2;
  if (points >= 10) return 1;
  return 0;
}

export function availableResourceAmount(access?: ResourceAccess): number {
  if (!access) return 0;
  return Math.max(0, access.owned) + Math.max(0, access.borrowable) + Math.max(0, access.rentable);
}

function complexityTier(nodeCount: number): BlueprintValidation['complexity']['tier'] {
  if (nodeCount >= 24) return 'stress';
  if (nodeCount >= 13) return 'dense';
  if (nodeCount >= 7) return 'medium';
  return 'small';
}

function diagnosticState(good: number, warning: number, bad: number): DiagnosticState {
  if (bad > 0) return 1;
  if (warning > 1) return 2;
  if (good > 0) return 3;
  return 0;
}

export function validateBlueprint(blueprint: Blueprint, profile: CreativeProfile): BlueprintValidation {
  const instances = new Map(blueprint.nodes.map((node) => [node.id, node]));
  const unknownNodeIds: string[] = [];
  const lockedNodeIds: string[] = [];
  const masteryBlocks: BlueprintValidation['masteryBlocks'] = [];
  const resourceNeeds = new Map<string, number>();

  for (const instance of blueprint.nodes) {
    const definition = blueprintNodeById.get(instance.definitionId);
    if (!definition) {
      unknownNodeIds.push(instance.id);
      continue;
    }
    if (!profile.unlockedNodeIds.includes(definition.id)) lockedNodeIds.push(instance.id);
    const current = masteryLevelFromPoints(profile.masteryPoints[definition.family] || 0);
    if (current < definition.masteryRequired) {
      masteryBlocks.push({ nodeId: instance.id, family: definition.family, required: definition.masteryRequired, current });
    }
    for (const requirement of definition.requirements || []) {
      resourceNeeds.set(requirement.resourceId, (resourceNeeds.get(requirement.resourceId) || 0) + requirement.amount);
    }
  }

  const missingResources = [...resourceNeeds.entries()].flatMap(([resourceId, needed]) => {
    const available = availableResourceAmount(profile.resources[resourceId]);
    return available >= needed ? [] : [{ resourceId, needed, available, shortfall: needed - available }];
  });

  const danglingEdges = blueprint.edges.filter((edge) => !instances.has(edge.from) || !instances.has(edge.to)).map((edge) => edge.id);
  const categories = new Set(blueprint.nodes.map((node) => blueprintNodeById.get(node.definitionId)?.category).filter(Boolean));
  const edgeKinds = new Set(blueprint.edges.map((edge) => edge.kind));
  const hasSignalChain = edgeKinds.has('signal');
  const hasOutput = blueprint.nodes.some((node) => ['crt-display', 'projector', 'multi-screen'].includes(node.definitionId));
  const hasLineage = categories.has('lineage');
  const hasSpatial = categories.has('spatial');
  const hasConstraint = categories.has('constraint');

  const runReasons: string[] = [];
  if (!hasSignalChain) runReasons.push('没有明确的信号或行为链。');
  if (!hasOutput) runReasons.push('没有可观察的输出节点。');
  if (masteryBlocks.length) runReasons.push(`${masteryBlocks.length} 个节点超过当前熟练度。`);
  if (danglingEdges.length) runReasons.push(`${danglingEdges.length} 条连接悬空。`);
  if (!runReasons.length) runReasons.push('当前图至少存在一条可执行链。');

  const buildReasons: string[] = [];
  if (missingResources.length) buildReasons.push(`${missingResources.length} 类资源不足。`);
  if (blueprint.nodes.length >= 24) buildReasons.push('节点数量进入压力区，安装与维护成本会显著上升。');
  if (hasConstraint) buildReasons.push('限制条件已经进入图纸，会真实影响制作。');
  if (!buildReasons.length) buildReasons.push('当前资源能够覆盖图纸需求。');

  const readReasons: string[] = [];
  if (!hasLineage) readReasons.push('还没有把作品与任何创作谱系建立关系。');
  if (!hasSpatial) readReasons.push('空间关系还没有进入作品结构。');
  if (hasLineage) readReasons.push('已有艺术谱系节点，可追踪其来源与魔改。');
  if (hasSpatial) readReasons.push('空间关系是作品基因的一部分。');

  return {
    unknownNodeIds,
    lockedNodeIds,
    masteryBlocks,
    missingResources,
    danglingEdges,
    complexity: { nodeCount: blueprint.nodes.length, edgeCount: blueprint.edges.length, tier: complexityTier(blueprint.nodes.length) },
    diagnostics: {
      run: { state: diagnosticState(hasSignalChain && hasOutput ? 1 : 0, masteryBlocks.length, danglingEdges.length), reasons: runReasons },
      build: { state: diagnosticState(missingResources.length ? 0 : 1, blueprint.nodes.length >= 24 ? 2 : hasConstraint ? 1 : 0, missingResources.length), reasons: buildReasons },
      read: { state: diagnosticState(hasLineage && hasSpatial ? 1 : 0, (!hasLineage ? 1 : 0) + (!hasSpatial ? 1 : 0), 0), reasons: readReasons }
    }
  };
}

export function remixBlueprint(source: Blueprint, id: string, title: string): Blueprint {
  return {
    ...source,
    id,
    title,
    revision: 1,
    parentBlueprintId: source.id,
    nodes: source.nodes.map((node) => ({ ...node, params: node.params ? { ...node.params } : undefined })),
    edges: source.edges.map((edge) => ({ ...edge })),
    notes: [...(source.notes || []), `Remix of ${source.title}`]
  };
}

function stableBlueprintPayload(blueprint: Blueprint): Blueprint {
  return {
    schema: 'nmas-blueprint-v1',
    id: blueprint.id,
    title: blueprint.title,
    revision: blueprint.revision,
    ...(blueprint.parentBlueprintId ? { parentBlueprintId: blueprint.parentBlueprintId } : {}),
    nodes: [...blueprint.nodes].sort((a, b) => a.id.localeCompare(b.id)).map((node) => ({ ...node })),
    edges: [...blueprint.edges].sort((a, b) => a.id.localeCompare(b.id)).map((edge) => ({ ...edge })),
    ...(blueprint.notes?.length ? { notes: [...blueprint.notes] } : {})
  };
}

const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function bytesToBase64(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i] ?? 0;
    const b = bytes[i + 1] ?? 0;
    const c = bytes[i + 2] ?? 0;
    const triple = (a << 16) | (b << 8) | c;
    out += BASE64[(triple >> 18) & 63];
    out += BASE64[(triple >> 12) & 63];
    out += i + 1 < bytes.length ? BASE64[(triple >> 6) & 63] : '=';
    out += i + 2 < bytes.length ? BASE64[triple & 63] : '=';
  }
  return out;
}

function base64ToBytes(text: string): Uint8Array {
  const clean = text.replace(/[^A-Za-z0-9+/=]/g, '');
  const bytes: number[] = [];
  for (let i = 0; i < clean.length; i += 4) {
    const a = BASE64.indexOf(clean[i]);
    const b = BASE64.indexOf(clean[i + 1]);
    const c = clean[i + 2] === '=' ? 0 : BASE64.indexOf(clean[i + 2]);
    const d = clean[i + 3] === '=' ? 0 : BASE64.indexOf(clean[i + 3]);
    const triple = (a << 18) | (b << 12) | (c << 6) | d;
    bytes.push((triple >> 16) & 255);
    if (clean[i + 2] !== '=') bytes.push((triple >> 8) & 255);
    if (clean[i + 3] !== '=') bytes.push(triple & 255);
  }
  return new Uint8Array(bytes);
}

export function encodeBlueprintShareCode(blueprint: Blueprint): string {
  const json = JSON.stringify(stableBlueprintPayload(blueprint));
  const bytes = new TextEncoder().encode(json);
  const compact = bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  return `NMAS-BP1-${compact}`;
}

export function decodeBlueprintShareCode(code: string): Blueprint {
  if (!code.startsWith('NMAS-BP1-')) throw new Error('Unsupported blueprint share code.');
  let payload = code.slice('NMAS-BP1-'.length).replace(/-/g, '+').replace(/_/g, '/');
  while (payload.length % 4) payload += '=';
  const json = new TextDecoder().decode(base64ToBytes(payload));
  const parsed = JSON.parse(json) as Blueprint;
  if (parsed.schema !== 'nmas-blueprint-v1' || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) throw new Error('Invalid blueprint payload.');
  return parsed;
}

export function createStarterCreativeProfile(): CreativeProfile {
  const unlockedNodeIds = [
    'camera-live', 'phone-camera', 'field-audio', 'crt-display', 'projector', 'realtime-render', 'delay',
    'accumulate', 'audience-body', 'stack', 'ring-layout', 'ready-made', 'media-archaeology', 'budget-tight',
    'no-drill', 'single-socket', 'setup-two-hours', 'transport-one-box'
  ];
  return {
    unlockedNodeIds,
    masteryPoints: {
      'image-video-capture': 18,
      'sensor-live-input': 12,
      'single-display': 18,
      'realtime-graphics': 18,
      'automation-integration': 8,
      participation: 12,
      'spatial-composition': 12,
      'art-lineage': 12,
      'production-constraint': 10
    },
    resources: {
      camera: { resourceId: 'camera', owned: 1, borrowable: 0, rentable: 1, rentCost: 80 },
      phone: { resourceId: 'phone', owned: 1, borrowable: 0, rentable: 0 },
      recorder: { resourceId: 'recorder', owned: 1, borrowable: 0, rentable: 1, rentCost: 60 },
      crt: { resourceId: 'crt', owned: 0, borrowable: 2, rentable: 4, rentCost: 120 },
      projector: { resourceId: 'projector', owned: 0, borrowable: 1, rentable: 2, rentCost: 300 },
      display: { resourceId: 'display', owned: 1, borrowable: 1, rentable: 4, rentCost: 160 },
      network: { resourceId: 'network', owned: 1, borrowable: 0, rentable: 1, rentCost: 100 }
    }
  };
}

function node(id: string, definitionId: string, x: number, y: number, params?: BlueprintNodeInstance['params']): BlueprintNodeInstance {
  return { id, definitionId, x, y, ...(params ? { params } : {}) };
}

function edge(id: string, from: string, to: string, kind: BlueprintEdgeKind): BlueprintEdge {
  return { id, from, to, kind };
}

export const blueprintPresets: Blueprint[] = [
  {
    schema: 'nmas-blueprint-v1', id: 'bp-first-loop', title: '第一次闭环', revision: 1,
    nodes: [
      node('n1', 'camera-live', 80, 130), node('n2', 'delay', 280, 130, { seconds: 8 }), node('n3', 'feedback-loop', 480, 130),
      node('n4', 'crt-display', 680, 130), node('n5', 'audience-body', 80, 310), node('n6', 'ring-layout', 680, 310),
      node('n7', 'closed-circuit-video', 430, 360), node('n8', 'media-archaeology', 600, 410)
    ],
    edges: [
      edge('e1', 'n1', 'n2', 'signal'), edge('e2', 'n2', 'n3', 'signal'), edge('e3', 'n3', 'n4', 'signal'),
      edge('e4', 'n5', 'n1', 'dependency'), edge('e5', 'n4', 'n6', 'physical'), edge('e6', 'n7', 'n3', 'concept'), edge('e7', 'n8', 'n4', 'concept')
    ],
    notes: ['用最少节点说明：作品不是卡片，而是一张可演化的图。']
  },
  {
    schema: 'nmas-blueprint-v1', id: 'bp-remote-body', title: '异地身体回路', revision: 1,
    nodes: [
      node('a1', 'camera-live', 80, 90), node('a2', 'network-relay', 260, 90), node('a3', 'delay', 440, 90), node('a4', 'projector', 640, 90),
      node('a5', 'sensor-presence', 80, 270), node('a6', 'accumulate', 280, 270), node('a7', 'remote-pair', 500, 270), node('a8', 'audience-body', 700, 270),
      node('a9', 'network-art', 330, 410), node('a10', 'system-art', 540, 410), node('a11', 'setup-two-hours', 720, 410)
    ],
    edges: [
      edge('r1', 'a1', 'a2', 'signal'), edge('r2', 'a2', 'a3', 'signal'), edge('r3', 'a3', 'a4', 'signal'), edge('r4', 'a5', 'a6', 'signal'),
      edge('r5', 'a6', 'a2', 'signal'), edge('r6', 'a7', 'a2', 'physical'), edge('r7', 'a8', 'a5', 'dependency'), edge('r8', 'a9', 'a2', 'concept'),
      edge('r9', 'a10', 'a6', 'concept'), edge('r10', 'a11', 'a7', 'dependency')
    ]
  },
  {
    schema: 'nmas-blueprint-v1', id: 'bp-dead-media', title: '死媒介复活器', revision: 1,
    nodes: [
      node('d1', 'vhs-source', 70, 100), node('d2', 'vision-classify', 260, 100), node('d3', 'mutation', 450, 100), node('d4', 'crt-display', 660, 100),
      node('d5', 'ready-made', 100, 300), node('d6', 'media-archaeology', 300, 300), node('d7', 'system-art', 500, 300), node('d8', 'stack', 700, 300),
      node('d9', 'budget-tight', 180, 430), node('d10', 'transport-one-box', 430, 430), node('d11', 'audience-body', 680, 430)
    ],
    edges: [
      edge('d-e1', 'd1', 'd2', 'signal'), edge('d-e2', 'd2', 'd3', 'signal'), edge('d-e3', 'd3', 'd4', 'signal'), edge('d-e4', 'd5', 'd1', 'concept'),
      edge('d-e5', 'd6', 'd1', 'concept'), edge('d-e6', 'd7', 'd3', 'concept'), edge('d-e7', 'd4', 'd8', 'physical'), edge('d-e8', 'd9', 'd4', 'dependency'),
      edge('d-e9', 'd10', 'd8', 'dependency'), edge('d-e10', 'd11', 'd4', 'dependency')
    ]
  }
];

export function createStressBlueprint(nodeCount = 28): Blueprint {
  const definitions = blueprintNodeDefinitions;
  const nodes: BlueprintNodeInstance[] = [];
  const edges: BlueprintEdge[] = [];
  for (let index = 0; index < nodeCount; index += 1) {
    const definition = definitions[index % definitions.length];
    nodes.push(node(`stress-${index + 1}`, definition.id, 70 + (index % 7) * 140, 70 + Math.floor(index / 7) * 120));
    if (index > 0) edges.push(edge(`stress-edge-${index}`, `stress-${index}`, `stress-${index + 1}`, index % 5 === 0 ? 'concept' : index % 3 === 0 ? 'physical' : 'signal'));
  }
  return {
    schema: 'nmas-blueprint-v1',
    id: `bp-stress-${nodeCount}`,
    title: `压力测试 / ${nodeCount} 节点`,
    revision: 1,
    nodes,
    edges,
    notes: ['用于测试节点数量、资源缺口、熟练度与图结构在压力状态下是否仍然可解释。']
  };
}
