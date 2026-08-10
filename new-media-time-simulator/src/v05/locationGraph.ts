export type GlobalSystemId = 'world' | 'projects' | 'workbench' | 'relations' | 'archive';

export type GlobalSystem = {
  id: GlobalSystemId;
  label: string;
  shortcut?: string;
};

export type FacilityKind =
  | 'studio'
  | 'social'
  | 'production'
  | 'venue'
  | 'institution'
  | 'application'
  | 'media'
  | 'residency';

export type SpatialFacility = {
  id: string;
  regionId: string;
  name: string;
  kind: FacilityKind;
  x: number;
  y: number;
  adjacentIds: string[];
  description: string;
  functions: string[];
};

export type SpatialRegion = {
  id: string;
  name: string;
  shortName: string;
  x: number;
  y: number;
  depth: number;
  unlockAt: number;
  description: string;
  adjacentIds: string[];
  facilityIds: string[];
  tags: string[];
};

export type SpecialistService = {
  id: string;
  name: string;
  description: string;
  functions: string[];
  relevantPracticeIds: string[];
};

export type ResearchSpaceTemplate = {
  id: string;
  name: string;
  category: 'research-space';
};

export const globalSystems: GlobalSystem[] = [
  { id: 'world', label: '世界', shortcut: 'M' },
  { id: 'projects', label: '项目', shortcut: 'P' },
  { id: 'workbench', label: '工作台', shortcut: 'W' },
  { id: 'relations', label: '关系', shortcut: 'R' },
  { id: 'archive', label: '档案', shortcut: 'A' }
];

export const spatialFacilities: SpatialFacility[] = [
  {
    id: 'shared-studio', regionId: 'region-rongshore', name: '共享工位 B-201', kind: 'studio',
    x: 28, y: 52, adjacentIds: ['river-diner', 'loading-dock'],
    description: '共享桌面、旧设备和同行组成的日常制作环境。',
    functions: ['work', 'peer', 'small-test']
  },
  {
    id: 'river-diner', regionId: 'region-rongshore', name: '江边大排档', kind: 'social',
    x: 70, y: 28, adjacentIds: ['shared-studio'],
    description: '关系、消息、临时邀约和未经验证的行业信息在这里流动。',
    functions: ['conversation', 'message', 'opportunity']
  },
  {
    id: 'loading-dock', regionId: 'region-rongshore', name: '后门装卸区', kind: 'production',
    x: 72, y: 75, adjacentIds: ['shared-studio'],
    description: '设备借用、运输、临时存放和现场后勤。',
    functions: ['logistics', 'borrow', 'transport']
  },
  {
    id: 'pitch-room', regionId: 'region-shenzhen', name: '提案会议室', kind: 'production',
    x: 24, y: 28, adjacentIds: ['production-yard'],
    description: '预算、交付范围、时间表和甲方语言在这里被对齐。',
    functions: ['pitch', 'budget', 'client']
  },
  {
    id: 'black-box', regionId: 'region-shenzhen', name: '黑盒测试场', kind: 'venue',
    x: 74, y: 30, adjacentIds: ['production-yard'],
    description: '投影、声音、灯光、控制信号和观众距离可以被实际测试。',
    functions: ['venue-preview', 'signal-test', 'rehearsal']
  },
  {
    id: 'production-yard', regionId: 'region-shenzhen', name: '制作后场', kind: 'production',
    x: 50, y: 75, adjacentIds: ['pitch-room', 'black-box'],
    description: '供应商、制作团队、线材和临时增加的需求在这里相遇。',
    functions: ['production', 'team', 'supplier']
  },
  {
    id: 'lecture-hall', regionId: 'region-academy', name: '理论讲堂', kind: 'institution',
    x: 28, y: 30, adjacentIds: ['gallery', 'open-call-office'],
    description: '讲座、讨论、同行判断和机构语言。',
    functions: ['lecture', 'research', 'conversation']
  },
  {
    id: 'gallery', regionId: 'region-academy', name: '学院展厅', kind: 'venue',
    x: 72, y: 30, adjacentIds: ['lecture-hall'],
    description: '白盒展示、长期运行、安装细节和制度性观看。',
    functions: ['venue-preview', 'installation', 'critique']
  },
  {
    id: 'open-call-office', regionId: 'region-academy', name: '征集办公室', kind: 'application',
    x: 50, y: 76, adjacentIds: ['lecture-hall'],
    description: '公开征集、申请材料、制作支持与规则判断。',
    functions: ['open-call', 'application', 'opportunity']
  },
  {
    id: 'hangar', regionId: 'region-biennale', name: '旧机库展场', kind: 'venue',
    x: 25, y: 55, adjacentIds: ['media-desk', 'production-office'],
    description: '大尺度空间把运输、结构、预算和作品漏洞一起放大。',
    functions: ['venue-preview', 'large-scale', 'installation']
  },
  {
    id: 'media-desk', regionId: 'region-biennale', name: '媒体接待区', kind: 'media',
    x: 72, y: 28, adjacentIds: ['hangar', 'production-office'],
    description: '采访、项目说明、传播和误读发生的地方。',
    functions: ['press', 'documentation', 'narrative']
  },
  {
    id: 'production-office', regionId: 'region-biennale', name: '制作办公室', kind: 'production',
    x: 72, y: 76, adjacentIds: ['hangar', 'media-desk'],
    description: '真正决定作品能否落地的合同、排期和技术确认。',
    functions: ['production', 'contract', 'schedule']
  },
  {
    id: 'residency-lab', regionId: 'region-residency', name: '驻留实验室', kind: 'residency',
    x: 28, y: 32, adjacentIds: ['border-cafe', 'project-room'],
    description: '在陌生语境中重新测试熟悉的方法。',
    functions: ['research', 'prototype', 'peer']
  },
  {
    id: 'border-cafe', regionId: 'region-residency', name: '边界咖啡馆', kind: 'social',
    x: 72, y: 32, adjacentIds: ['residency-lab'],
    description: '合作、翻译、误会和短暂联盟发生的地方。',
    functions: ['conversation', 'network', 'opportunity']
  },
  {
    id: 'project-room', regionId: 'region-residency', name: '项目房间', kind: 'studio',
    x: 50, y: 76, adjacentIds: ['residency-lab'],
    description: '一间暂时属于项目的房间，用来制作、摆放和反复修改。',
    functions: ['work', 'prototype', 'documentation']
  }
];

export const spatialRegions: SpatialRegion[] = [
  {
    id: 'region-rongshore', name: '榕树湾工作区', shortName: 'RONGSHORE', x: 24, y: 63, depth: 2, unlockAt: 0,
    description: '共享工作、同行关系和低成本日常构成的起始区域。',
    adjacentIds: ['region-shenzhen', 'region-academy'],
    facilityIds: ['shared-studio', 'river-diner', 'loading-dock'], tags: ['studio', 'peer', 'survival']
  },
  {
    id: 'region-shenzhen', name: '深港加速走廊', shortName: 'ACCELERATOR', x: 66, y: 62, depth: 2, unlockAt: 1,
    description: '商业制作、演出、设备和高速交付密集发生的区域。',
    adjacentIds: ['region-rongshore', 'region-academy', 'region-biennale'],
    facilityIds: ['pitch-room', 'black-box', 'production-yard'], tags: ['commercial', 'live', 'production']
  },
  {
    id: 'region-academy', name: '南岭学院与展厅群', shortName: 'ACADEMY', x: 43, y: 31, depth: 1, unlockAt: 2,
    description: '讲座、展览、公开征集和制度性评价构成的机构区域。',
    adjacentIds: ['region-rongshore', 'region-shenzhen', 'region-biennale'],
    facilityIds: ['lecture-hall', 'gallery', 'open-call-office'], tags: ['academic', 'institution']
  },
  {
    id: 'region-biennale', name: '北方双年展工地', shortName: 'BIENNALE', x: 76, y: 25, depth: 1, unlockAt: 3,
    description: '大型机构、施工、媒体和复杂生产条件叠加的临时区域。',
    adjacentIds: ['region-shenzhen', 'region-academy', 'region-residency'],
    facilityIds: ['hangar', 'media-desk', 'production-office'], tags: ['institution', 'space', 'global']
  },
  {
    id: 'region-residency', name: '海外驻留港', shortName: 'RESIDENCY', x: 91, y: 10, depth: 0, unlockAt: 4,
    description: '陌生语境、驻留制度、合作关系和自我重写叠加的区域。',
    adjacentIds: ['region-biennale'],
    facilityIds: ['residency-lab', 'border-cafe', 'project-room'], tags: ['global', 'residency', 'research']
  }
];

export const specialistServices: SpecialistService[] = [
  {
    id: 'compute-rack', name: '远程算力节点', description: '需要重型实时图形、重建或大规模输出时才出现。',
    functions: ['compute', 'render'], relevantPracticeIds: ['systems-generative', 'spatial-installation', 'live-performance', 'image-capture']
  },
  {
    id: 'preview-node', name: '离线预演节点', description: '把高成本运行先转换成低成本代理测试。',
    functions: ['preview', 'proxy'], relevantPracticeIds: ['systems-generative', 'spatial-installation', 'live-performance', 'image-capture']
  },
  {
    id: 'recovery-bay', name: '数据恢复服务', description: '项目确实出现损坏或丢失状态后才进入可用列表。',
    functions: ['recovery', 'archive'], relevantPracticeIds: ['systems-generative', 'spatial-installation', 'live-performance', 'image-capture', 'production-commission']
  }
];

// 来自早期巴别瓶版本的 13 个“研究场域”。它们不再默认占据世界地图，
// 而作为未来可被机构、事件、驻留或内容包实例化的空间模板。
export const legacyResearchSpaceTemplates: ResearchSpaceTemplate[] = [
  { id: 'phenomenology-lab', name: '现象学实验空间', category: 'research-space' },
  { id: 'media-archaeology-lab', name: '媒体考古实验室', category: 'research-space' },
  { id: 'cognitive-art-space', name: '认知科学艺术空间', category: 'research-space' },
  { id: 'quantum-art-lab', name: '量子艺术实验室', category: 'research-space' },
  { id: 'anthropocene-lab', name: '人类世研究空间', category: 'research-space' },
  { id: 'post-internet-lab', name: '后互联网研究所', category: 'research-space' },
  { id: 'system-aesthetics-lab', name: '系统美学实验室', category: 'research-space' },
  { id: 'time-based-media-center', name: '时基媒体研究中心', category: 'research-space' },
  { id: 'critical-code-space', name: '批判性编程空间', category: 'research-space' },
  { id: 'posthuman-studio', name: '后人类艺术工作室', category: 'research-space' },
  { id: 'media-archaeology-site', name: '媒体考古发掘场', category: 'research-space' },
  { id: 'embodied-cognition-lab', name: '具身认知实验室', category: 'research-space' },
  { id: 'basic-studio-template', name: '基础工作室', category: 'research-space' }
];

export const facilityById = new Map(spatialFacilities.map((facility) => [facility.id, facility]));

export function relevantSpecialistServices(practiceId: string | null | undefined) {
  if (!practiceId) return [];
  return specialistServices.filter((service) => service.relevantPracticeIds.includes(practiceId));
}
