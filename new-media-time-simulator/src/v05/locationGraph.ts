export type GlobalSystemId = 'world' | 'projects' | 'workbench' | 'contacts' | 'archive';

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
  | 'residency'
  | 'tech'
  | 'logistics';

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
  scope: '上海' | '长三角' | '国内';
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
  { id: 'world', label: '地点', shortcut: 'M' },
  { id: 'projects', label: '项目', shortcut: 'P' },
  { id: 'workbench', label: '工作台', shortcut: 'W' },
  { id: 'contacts', label: '联络', shortcut: 'C' },
  { id: 'archive', label: '档案库', shortcut: 'K' }
];

export const spatialFacilities: SpatialFacility[] = [
  {
    id: 'putuo-studio-floor', regionId: 'region-putuo-sucreek', name: '工业楼工作室', kind: 'studio',
    x: 24, y: 55, adjacentIds: ['putuo-project-room', 'putuo-loading-door'],
    description: '可以长期放着半成品、旧设备和线材的日常制作空间。',
    functions: ['work', 'peer', 'small-test', 'archive-material']
  },
  {
    id: 'putuo-project-room', regionId: 'region-putuo-sucreek', name: '沿河项目房', kind: 'studio',
    x: 70, y: 28, adjacentIds: ['putuo-studio-floor'],
    description: '短租项目房，适合把作品从桌面摊到真实尺度。',
    functions: ['prototype', 'conversation', 'documentation']
  },
  {
    id: 'putuo-loading-door', regionId: 'region-putuo-sucreek', name: '后门装卸口', kind: 'logistics',
    x: 72, y: 76, adjacentIds: ['putuo-studio-floor'],
    description: '设备借用、搬运、临时寄存和各种没有写进合同的现实问题。',
    functions: ['logistics', 'borrow', 'transport', 'supplier']
  },
  {
    id: 'westbund-blackbox', regionId: 'region-westbund', name: '多功能黑盒', kind: 'venue',
    x: 26, y: 30, adjacentIds: ['westbund-production-office', 'westbund-riverside'],
    description: '适合真实检查投影、声音、实时系统和观众距离。',
    functions: ['venue-preview', 'signal-test', 'rehearsal', 'installation']
  },
  {
    id: 'westbund-production-office', regionId: 'region-westbund', name: '制作办公室', kind: 'production',
    x: 70, y: 30, adjacentIds: ['westbund-blackbox'],
    description: '排期、结构、供应商、预算、夜间施工和撤场在这里变成一张表。',
    functions: ['production', 'budget', 'schedule', 'contract']
  },
  {
    id: 'westbund-riverside', regionId: 'region-westbund', name: '滨江公共空间', kind: 'venue',
    x: 48, y: 76, adjacentIds: ['westbund-blackbox'],
    description: '开放环境会把亮度、天气、观众动线和公共安全带进作品。',
    functions: ['site-survey', 'public-space', 'documentation']
  },
  {
    id: 'huangpu-museum-backstage', regionId: 'region-huangpu-riverside', name: '美术馆后场', kind: 'institution',
    x: 28, y: 32, adjacentIds: ['huangpu-public-program', 'huangpu-opening-floor'],
    description: '展厅之外的真正接口：注册、布展、灯光、媒体、保险和撤场。',
    functions: ['institution', 'installation', 'technical-rider', 'documentation']
  },
  {
    id: 'huangpu-public-program', regionId: 'region-huangpu-riverside', name: '公共项目空间', kind: 'institution',
    x: 72, y: 32, adjacentIds: ['huangpu-museum-backstage'],
    description: '讲座、工作坊、小型展演和公众项目，允许未完成状态被公开测试。',
    functions: ['open-call', 'workshop', 'conversation', 'opportunity']
  },
  {
    id: 'huangpu-opening-floor', regionId: 'region-huangpu-riverside', name: '开幕现场', kind: 'social',
    x: 50, y: 76, adjacentIds: ['huangpu-museum-backstage'],
    description: '最短时间内遇到最多人，也最容易把一个复杂项目压缩成一句话。',
    functions: ['network', 'conversation', 'press', 'opportunity']
  },
  {
    id: 'yangpu-university-lab', regionId: 'region-yangpu', name: '大学实验室', kind: 'institution',
    x: 26, y: 30, adjacentIds: ['yangpu-warehouse', 'yangpu-peer-cafe'],
    description: '研究问题、学生、设备和学术语境重叠的实验环境。',
    functions: ['research', 'prototype', 'lecture', 'peer']
  },
  {
    id: 'yangpu-warehouse', regionId: 'region-yangpu', name: '滨江旧仓库', kind: 'venue',
    x: 72, y: 30, adjacentIds: ['yangpu-university-lab'],
    description: '空间漂亮但条件不一定友好，适合暴露结构、供电和声音问题。',
    functions: ['venue-preview', 'large-scale', 'site-survey']
  },
  {
    id: 'yangpu-peer-cafe', regionId: 'region-yangpu', name: '大学路咖啡馆', kind: 'social',
    x: 50, y: 76, adjacentIds: ['yangpu-university-lab'],
    description: '学生、创业者、艺术家和项目策划混在一起的弱连接节点。',
    functions: ['conversation', 'network', 'open-call', 'message']
  },
  {
    id: 'pudong-tech-demo', regionId: 'region-pudong-zhangjiang', name: '技术演示厅', kind: 'tech',
    x: 25, y: 30, adjacentIds: ['pudong-compute-service', 'pudong-client-room'],
    description: '大屏、传感器、AI、机器人和实时图形最容易被包装成“方案”的地方。',
    functions: ['tech-demo', 'prototype', 'client', 'mapping']
  },
  {
    id: 'pudong-compute-service', regionId: 'region-pudong-zhangjiang', name: '算力与数据服务', kind: 'tech',
    x: 72, y: 30, adjacentIds: ['pudong-tech-demo'],
    description: '只有项目真的需要重建、批处理或大规模运行时才值得来。',
    functions: ['compute', 'render', 'data', 'recovery']
  },
  {
    id: 'pudong-client-room', regionId: 'region-pudong-zhangjiang', name: '客户会议室', kind: 'production',
    x: 50, y: 76, adjacentIds: ['pudong-tech-demo'],
    description: '作品、演示、KPI 和一句“能不能再科技一点”在这里发生碰撞。',
    functions: ['brief', 'budget', 'client', 'scope']
  },
  {
    id: 'songjiang-suburban-studio', regionId: 'region-songjiang', name: '郊区工作室', kind: 'studio',
    x: 25, y: 30, adjacentIds: ['songjiang-workshop', 'songjiang-residency-house'],
    description: '空间便宜、距离更远，允许大型东西长期占地。',
    functions: ['work', 'large-prototype', 'storage']
  },
  {
    id: 'songjiang-workshop', regionId: 'region-songjiang', name: '制作车间', kind: 'production',
    x: 72, y: 30, adjacentIds: ['songjiang-suburban-studio'],
    description: '木工、金工、结构、喷涂和那些效果图不会自动生成的实体部分。',
    functions: ['fabrication', 'structure', 'supplier', 'transport']
  },
  {
    id: 'songjiang-residency-house', regionId: 'region-songjiang', name: '短期驻留房', kind: 'residency',
    x: 50, y: 76, adjacentIds: ['songjiang-suburban-studio'],
    description: '离城市中心远一点，换来连续几天不被打断的制作时间。',
    functions: ['residency', 'research', 'work', 'peer']
  },
  {
    id: 'hongqiao-logistics', regionId: 'region-hongqiao', name: '物流集散点', kind: 'logistics',
    x: 25, y: 30, adjacentIds: ['hongqiao-temporary-hall', 'hongqiao-departure'],
    description: '航空箱、货运、异地项目和“今天必须发走”集中发生。',
    functions: ['logistics', 'transport', 'equipment']
  },
  {
    id: 'hongqiao-temporary-hall', regionId: 'region-hongqiao', name: '临时活动厅', kind: 'venue',
    x: 72, y: 30, adjacentIds: ['hongqiao-logistics'],
    description: '会展、发布会和临时搭建空间，交付速度通常比作品讨论更快。',
    functions: ['venue-preview', 'commercial', 'production']
  },
  {
    id: 'hongqiao-departure', regionId: 'region-hongqiao', name: '出发口', kind: 'logistics',
    x: 50, y: 76, adjacentIds: ['hongqiao-logistics'],
    description: '通往杭州、深圳和更远项目的交通节点。',
    functions: ['travel', 'opportunity', 'schedule']
  },
  {
    id: 'hangzhou-open-studio', regionId: 'region-hangzhou', name: 'Open Studio', kind: 'institution',
    x: 25, y: 30, adjacentIds: ['hangzhou-platform-lab', 'hangzhou-residency-flat'],
    description: '工作过程直接暴露给同行和公众，适合测试项目解释是否成立。',
    functions: ['open-studio', 'peer', 'critique', 'documentation']
  },
  {
    id: 'hangzhou-platform-lab', regionId: 'region-hangzhou', name: '平台实验室', kind: 'tech',
    x: 72, y: 30, adjacentIds: ['hangzhou-open-studio'],
    description: '数字平台、创意技术和艺术教育交叠的合作空间。',
    functions: ['research', 'tech-demo', 'workshop', 'opportunity']
  },
  {
    id: 'hangzhou-residency-flat', regionId: 'region-hangzhou', name: '驻留公寓', kind: 'residency',
    x: 50, y: 76, adjacentIds: ['hangzhou-open-studio'],
    description: '住宿、临时工作桌和一个陌生城市构成最基础的驻留条件。',
    functions: ['residency', 'research', 'network']
  },
  {
    id: 'shenzhen-hardware-market', regionId: 'region-shenzhen', name: '硬件市场', kind: 'tech',
    x: 25, y: 30, adjacentIds: ['shenzhen-vendor', 'shenzhen-blackbox'],
    description: '传感器、屏幕、控制器、奇怪接口和“今天就能拿到”的现实优势。',
    functions: ['equipment', 'prototype', 'repair', 'supplier']
  },
  {
    id: 'shenzhen-vendor', regionId: 'region-shenzhen', name: '制作供应商', kind: 'production',
    x: 72, y: 30, adjacentIds: ['shenzhen-hardware-market'],
    description: '从 PCB 到结构件，把实验原型变成可复制的制作版本。',
    functions: ['fabrication', 'production', 'budget', 'delivery']
  },
  {
    id: 'shenzhen-blackbox', regionId: 'region-shenzhen', name: '俱乐部黑盒', kind: 'venue',
    x: 50, y: 76, adjacentIds: ['shenzhen-hardware-market'],
    description: '音乐、实时视觉、灯光和高密度观众构成压力测试。',
    functions: ['venue-preview', 'live', 'rehearsal', 'network']
  }
];

export const spatialRegions: SpatialRegion[] = [
  {
    id: 'region-putuo-sucreek', name: '苏河 / 普陀', shortName: 'SUZHOU CREEK', scope: '上海', x: 25, y: 47, depth: 3, unlockAt: 0,
    description: '工作室、项目房、旧工业空间和同行关系构成的日常制作网络。',
    adjacentIds: ['region-westbund', 'region-huangpu-riverside', 'region-hongqiao'],
    facilityIds: ['putuo-studio-floor', 'putuo-project-room', 'putuo-loading-door'], tags: ['studio', 'peer', 'survival', 'archive']
  },
  {
    id: 'region-westbund', name: '西岸 / 徐汇滨江', shortName: 'WEST BUND', scope: '上海', x: 43, y: 73, depth: 2, unlockAt: 0,
    description: '大型文化设施、公共空间、制作办公室和高规格现场条件密集叠加。',
    adjacentIds: ['region-putuo-sucreek', 'region-huangpu-riverside', 'region-pudong-zhangjiang', 'region-songjiang'],
    facilityIds: ['westbund-blackbox', 'westbund-production-office', 'westbund-riverside'], tags: ['institution', 'venue', 'production', 'public']
  },
  {
    id: 'region-huangpu-riverside', name: '黄浦 / 南外滩', shortName: 'HUANGPU', scope: '上海', x: 52, y: 50, depth: 2, unlockAt: 1,
    description: '机构、开幕、公共项目和城市文化消费在这里交叉。',
    adjacentIds: ['region-putuo-sucreek', 'region-westbund', 'region-yangpu', 'region-pudong-zhangjiang'],
    facilityIds: ['huangpu-museum-backstage', 'huangpu-public-program', 'huangpu-opening-floor'], tags: ['institution', 'social', 'public-program']
  },
  {
    id: 'region-yangpu', name: '杨浦滨江 / 大学路', shortName: 'YANGPU', scope: '上海', x: 68, y: 31, depth: 2, unlockAt: 1,
    description: '大学、研究、旧工业空间、青年文化和创意技术并置的区域。',
    adjacentIds: ['region-huangpu-riverside', 'region-pudong-zhangjiang'],
    facilityIds: ['yangpu-university-lab', 'yangpu-warehouse', 'yangpu-peer-cafe'], tags: ['academic', 'research', 'youth', 'warehouse']
  },
  {
    id: 'region-pudong-zhangjiang', name: '浦东 / 张江', shortName: 'PUDONG TECH', scope: '上海', x: 76, y: 58, depth: 2, unlockAt: 1,
    description: '技术公司、演示空间、算力服务和商业委托形成另一套创意技术生态。',
    adjacentIds: ['region-westbund', 'region-huangpu-riverside', 'region-yangpu', 'region-shenzhen'],
    facilityIds: ['pudong-tech-demo', 'pudong-compute-service', 'pudong-client-room'], tags: ['tech', 'commercial', 'compute', 'client']
  },
  {
    id: 'region-songjiang', name: '松江 / 佘山方向', shortName: 'SONGJIANG', scope: '上海', x: 12, y: 77, depth: 2, unlockAt: 1,
    description: '更大的空间、更低的租金、制作车间与更长通勤交换而来的制作自由。',
    adjacentIds: ['region-westbund', 'region-hongqiao', 'region-hangzhou'],
    facilityIds: ['songjiang-suburban-studio', 'songjiang-workshop', 'songjiang-residency-house'], tags: ['studio', 'fabrication', 'storage', 'residency']
  },
  {
    id: 'region-hongqiao', name: '虹桥 / 交通与会展', shortName: 'HONGQIAO', scope: '上海', x: 18, y: 22, depth: 1, unlockAt: 1,
    description: '物流、会展、临时活动和异地项目的连接口。',
    adjacentIds: ['region-putuo-sucreek', 'region-songjiang', 'region-hangzhou'],
    facilityIds: ['hongqiao-logistics', 'hongqiao-temporary-hall', 'hongqiao-departure'], tags: ['logistics', 'event', 'travel']
  },
  {
    id: 'region-hangzhou', name: '杭州', shortName: 'HANGZHOU', scope: '长三角', x: 84, y: 14, depth: 1, unlockAt: 2,
    description: '艺术教育、数字平台、驻留与 Open Studio 构成的短途外部网络。',
    adjacentIds: ['region-hongqiao', 'region-songjiang', 'region-shenzhen'],
    facilityIds: ['hangzhou-open-studio', 'hangzhou-platform-lab', 'hangzhou-residency-flat'], tags: ['residency', 'academic', 'platform', 'travel']
  },
  {
    id: 'region-shenzhen', name: '深圳', shortName: 'SHENZHEN', scope: '国内', x: 94, y: 42, depth: 0, unlockAt: 3,
    description: '硬件供应链、制作、科技委托和现场演出构成的高速度外部节点。',
    adjacentIds: ['region-pudong-zhangjiang', 'region-hangzhou'],
    facilityIds: ['shenzhen-hardware-market', 'shenzhen-vendor', 'shenzhen-blackbox'], tags: ['hardware', 'production', 'live', 'commercial']
  }
];

export const specialistServices: SpecialistService[] = [
  {
    id: 'compute-rack', name: '远程算力', description: '重建、批处理或重型图形任务需要时调用，不作为世界地图地点。',
    functions: ['compute', 'render'], relevantPracticeIds: ['systems-generative', 'spatial-installation', 'live-performance', 'image-capture']
  },
  {
    id: 'preview-node', name: '离线预演', description: '把高成本输出转成代理版本，先测试比例、节奏和接缝。',
    functions: ['preview', 'proxy'], relevantPracticeIds: ['systems-generative', 'spatial-installation', 'live-performance', 'image-capture', 'production-commission']
  },
  {
    id: 'recovery-bay', name: '数据恢复', description: '只有项目出现损坏、丢失或归档问题后才真正有价值。',
    functions: ['recovery', 'archive'], relevantPracticeIds: ['systems-generative', 'spatial-installation', 'live-performance', 'image-capture', 'production-commission']
  },
  {
    id: 'mapping-support', name: '现场 Mapping 支持', description: '多输出、特殊屏体或复杂投影关系需要时调用。',
    functions: ['mapping', 'signal', 'onsite'], relevantPracticeIds: ['spatial-installation', 'live-performance', 'production-commission']
  }
];

// 来自早期巴别瓶版本的 13 个“研究场域”。不丢弃，但作为未来机构、事件、驻留或内容包可实例化的空间模板。
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
export const regionById = new Map(spatialRegions.map((region) => [region.id, region]));

export function relevantSpecialistServices(practiceId: string | null | undefined) {
  if (!practiceId) return [];
  return specialistServices.filter((service) => service.relevantPracticeIds.includes(practiceId));
}
