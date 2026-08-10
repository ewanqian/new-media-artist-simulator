export type HubKind = 'cafe' | 'workbench' | 'stage-forge' | 'exchange' | 'archive' | 'region';

export type WorldNode = {
  id: string;
  name: string;
  shortName: string;
  kind: HubKind;
  x: number;
  y: number;
  depth: number;
  description: string;
  icon: string;
  unlockAt: number;
  adjacentIds: string[];
  facilities: string[];
  tags: string[];
};

export type PracticeId =
  | 'systems-generative'
  | 'spatial-installation'
  | 'live-performance'
  | 'image-capture'
  | 'research-critique'
  | 'production-commission';

export type PracticeDefinition = {
  id: PracticeId;
  name: string;
  shortName: string;
  description: string;
  vocabulary: string[];
  starterSkills: string[];
  startingKit: string;
  startingBias: string[];
};

export type SkillDefinition = {
  id: string;
  name: string;
  family: 'make' | 'stage' | 'read' | 'communicate' | 'survive';
  description: string;
  verbs: string[];
  reveals?: string[];
};

export type CapabilityTier = {
  id: string;
  label: string;
  rank: number;
  description: string;
  enables: string[];
};

export type EvaluationLens = {
  id: string;
  name: string;
  values: string[];
  ignores: string[];
};

export type OpportunityTemplate = {
  id: string;
  title: string;
  host: string;
  locationId: string;
  lensId: string;
  publicFacts: string[];
  hiddenSignals: string[];
  skillReveals: Record<string, string>;
  tags: string[];
};

export const worldNodes: WorldNode[] = [
  {
    id: 'hub-cafe', name: '交叉口咖啡馆', shortName: 'CAFÉ', kind: 'cafe',
    x: 49, y: 48, depth: 3, icon: '☕', unlockAt: 0,
    description: '任务书、消息、谈话与世界更新汇聚的地方。',
    adjacentIds: ['hub-workbench', 'region-rongshore', 'region-shenzhen', 'region-academy'],
    facilities: ['menu-book', 'news', 'conversation'], tags: ['narrative', 'social']
  },
  {
    id: 'hub-workbench', name: '工作台', shortName: 'WORKBENCH', kind: 'workbench',
    x: 28, y: 65, depth: 2, icon: '⌁', unlockAt: 0,
    description: '管理当前作品、工作站能力与制作方案。',
    adjacentIds: ['hub-cafe', 'hub-exchange', 'region-rongshore', 'region-renderfarm'],
    facilities: ['project-build', 'compute', 'output', 'storage'], tags: ['studio', 'production']
  },
  {
    id: 'hub-stage-forge', name: '场景铸造', shortName: 'STAGE FORGE', kind: 'stage-forge',
    x: 72, y: 66, depth: 2, icon: '◇', unlockAt: 1,
    description: '将项目带入黑盒、展厅、舞台与公共屏幕进行短场景模拟。',
    adjacentIds: ['hub-cafe', 'region-shenzhen', 'region-biennale'],
    facilities: ['scene-sim', 'signal-test', 'venue-build'], tags: ['live', 'space']
  },
  {
    id: 'hub-exchange', name: '设备交换所', shortName: 'EXCHANGE', kind: 'exchange',
    x: 14, y: 80, depth: 1, icon: '⇄', unlockAt: 1,
    description: '新设备、二手设备、借用和回收渠道。只展示真正改变能力边界的东西。',
    adjacentIds: ['hub-workbench', 'region-rongshore'],
    facilities: ['new-equipment', 'used-equipment', 'borrow'], tags: ['equipment', 'economy']
  },
  {
    id: 'hub-archive', name: '实践档案', shortName: 'ARCHIVE', kind: 'archive',
    x: 86, y: 80, depth: 1, icon: '▤', unlockAt: 0,
    description: '项目、失败、媒体、关系记忆和职业轨迹的长期记录。',
    adjacentIds: ['hub-cafe', 'region-academy', 'region-residency'],
    facilities: ['project-history', 'media', 'relationship-memory'], tags: ['archive', 'meta']
  },
  {
    id: 'region-rongshore', name: '榕树湾工作区', shortName: 'RONGSHORE', kind: 'region',
    x: 23, y: 36, depth: 2, icon: '□', unlockAt: 0,
    description: '共享工位、旧设备、同行和夜间生活组成的起始生态。',
    adjacentIds: ['hub-cafe', 'hub-workbench', 'hub-exchange', 'region-shenzhen'],
    facilities: ['shared-studio', 'river-diner', 'loading-dock'], tags: ['studio', 'peer', 'survival']
  },
  {
    id: 'region-shenzhen', name: '深港加速走廊', shortName: 'ACCELERATOR', kind: 'region',
    x: 70, y: 34, depth: 2, icon: '▱', unlockAt: 1,
    description: '提案、演出、设备、品牌预算与高速交付并存。',
    adjacentIds: ['hub-cafe', 'hub-stage-forge', 'region-rongshore', 'region-renderfarm'],
    facilities: ['pitch-room', 'black-box', 'production-yard'], tags: ['commercial', 'live', 'production']
  },
  {
    id: 'region-academy', name: '南岭学院与展厅群', shortName: 'ACADEMY', kind: 'region',
    x: 48, y: 18, depth: 1, icon: '△', unlockAt: 2,
    description: '讲座、评审、展签、公开征集和制度性认可叠加的场域。',
    adjacentIds: ['hub-cafe', 'hub-archive', 'region-biennale'],
    facilities: ['lecture-hall', 'gallery', 'open-call-office'], tags: ['academic', 'institution']
  },
  {
    id: 'region-renderfarm', name: '离线渲染农场', shortName: 'RENDER FARM', kind: 'region',
    x: 8, y: 52, depth: 1, icon: '▦', unlockAt: 2,
    description: '风扇、缓存、脚本、GPU 管线与故障恢复构成的地下基础设施。',
    adjacentIds: ['hub-workbench', 'region-shenzhen'],
    facilities: ['compute-rack', 'preview-node', 'recovery-bay'], tags: ['compute', 'code', 'maintenance']
  },
  {
    id: 'region-biennale', name: '北方双年展工地', shortName: 'BIENNALE', kind: 'region',
    x: 83, y: 25, depth: 1, icon: '⬡', unlockAt: 3,
    description: '理想、机构、施工、运输和媒体共同消耗预算的大型现场。',
    adjacentIds: ['hub-stage-forge', 'region-academy', 'region-residency'],
    facilities: ['hangar', 'media-desk', 'production-office'], tags: ['institution', 'space', 'global']
  },
  {
    id: 'region-residency', name: '海外驻留港', shortName: 'RESIDENCY PORT', kind: 'region',
    x: 94, y: 9, depth: 0, icon: '○', unlockAt: 4,
    description: '陌生语境、驻留制度、合作与自我重写发生叠加。',
    adjacentIds: ['hub-archive', 'region-biennale'],
    facilities: ['residency-lab', 'border-cafe', 'project-room'], tags: ['global', 'residency', 'research']
  }
];

export const practices: PracticeDefinition[] = [
  {
    id: 'systems-generative', name: '系统 / 生成实践', shortName: 'SYSTEMS',
    description: '从规则、软件、协议和反馈系统出发组织作品。',
    vocabulary: ['规则', '协议', '反馈', '运行', '版本'],
    starterSkills: ['web-authoring', 'generative-system', 'maintenance'],
    startingKit: 'x86-g60-studio', startingBias: ['systems', 'web', 'code']
  },
  {
    id: 'spatial-installation', name: '空间 / 装置实践', shortName: 'SPATIAL',
    description: '从身体、尺度、空间、影像与声音关系出发。',
    vocabulary: ['尺度', '身体', '动线', '场所', '安装'],
    starterSkills: ['site-survey', 'spatial-pipeline', 'documentation'],
    startingKit: 'field-studio', startingBias: ['space', 'installation', 'site']
  },
  {
    id: 'live-performance', name: '现场 / 演出实践', shortName: 'LIVE',
    description: '把实时视觉、声音、信号和现场节奏作为作品条件。',
    vocabulary: ['cue', 'timing', 'signal', 'rehearsal', 'fallback'],
    starterSkills: ['realtime-graphics', 'signal-routing', 'emergency-patch'],
    startingKit: 'mobile-live-kit', startingBias: ['live', 'realtime', 'performance']
  },
  {
    id: 'image-capture', name: '影像 / 扫描实践', shortName: 'IMAGE',
    description: '通过影像、扫描、重建和计算图像组织数字场景。',
    vocabulary: ['frame', 'capture', 'reconstruction', 'texture', 'archive'],
    starterSkills: ['capture-scan', 'realtime-graphics', 'archive-method'],
    startingKit: 'mobile-capture-kit', startingBias: ['image', 'capture', '3d']
  },
  {
    id: 'research-critique', name: '研究 / 批评实践', shortName: 'RESEARCH',
    description: '从文本、语境、档案和媒介问题切入实践。',
    vocabulary: ['context', 'question', 'evidence', 'framing', 'medium'],
    starterSkills: ['critical-reading', 'project-statement', 'archive-method'],
    startingKit: 'mobile-research-kit', startingBias: ['research', 'critique', 'archive']
  },
  {
    id: 'production-commission', name: '制作 / 委托实践', shortName: 'PRODUCTION',
    description: '把审美、预算、团队、现场条件和截止日期组织成可交付系统。',
    vocabulary: ['brief', 'budget', 'scope', 'delivery', 'responsibility'],
    starterSkills: ['budgeting', 'client-translation', 'team-brief'],
    startingKit: 'x86-g60-production', startingBias: ['production', 'commercial', 'delivery']
  }
];

export const skills: SkillDefinition[] = [
  { id: 'web-authoring', name: 'Web Authoring', family: 'make', description: '制作可独立发布和长期访问的网页作品。', verbs: ['MAKE', 'SHOW'] },
  { id: 'generative-system', name: 'Generative System', family: 'make', description: '用规则和状态而不是固定素材组织作品。', verbs: ['MAKE', 'TEST'] },
  { id: 'realtime-graphics', name: 'Realtime Graphics', family: 'make', description: '在实时图形管线内搭建和优化视觉。', verbs: ['MAKE', 'TEST'] },
  { id: 'spatial-pipeline', name: 'Spatial Pipeline', family: 'make', description: '把影像、声音、几何和空间安装组织起来。', verbs: ['MAKE', 'SHOW'] },
  { id: 'capture-scan', name: 'Capture / Scan', family: 'make', description: '从现实环境获得影像、深度与三维材料。', verbs: ['MAKE', 'ARCHIVE'] },
  { id: 'site-survey', name: 'Site Survey', family: 'stage', description: '提前识别空间、供电、距离、光线和安装限制。', verbs: ['READ', 'TEST'], reveals: ['technicalSupport', 'scopeRisk'] },
  { id: 'signal-routing', name: 'Signal Routing', family: 'stage', description: '理解视频、声音、网络和控制信号链。', verbs: ['TEST', 'SHOW'] },
  { id: 'emergency-patch', name: 'Emergency Patch', family: 'stage', description: '在现场故障时快速切换可接受的备用方案。', verbs: ['TEST', 'SHOW'] },
  { id: 'critical-reading', name: 'Critical Reading', family: 'read', description: '把主题、制度语言和宣传文本拆回具体问题。', verbs: ['READ', 'TALK'], reveals: ['curatorialDepth'] },
  { id: 'archive-method', name: 'Archive Method', family: 'read', description: '让旧材料、失败和文档持续参与新项目。', verbs: ['READ', 'ARCHIVE'] },
  { id: 'opportunity-reading', name: 'Opportunity Reading', family: 'read', description: '从公开信息中辨认一个机会真正提供了什么。', verbs: ['READ'], reveals: ['prestigeReality', 'technicalSupport'] },
  { id: 'project-statement', name: 'Project Statement', family: 'communicate', description: '把作品问题转换成机构和观众可以进入的文本。', verbs: ['TALK', 'SHOW'] },
  { id: 'client-translation', name: 'Client Translation', family: 'communicate', description: '在不改掉项目核心的情况下和委托方对齐要求。', verbs: ['TALK'], reveals: ['scopeRisk'] },
  { id: 'team-brief', name: 'Team Brief', family: 'communicate', description: '把脑内方案变成团队可执行的信息。', verbs: ['TALK', 'SHOW'] },
  { id: 'budgeting', name: 'Budgeting', family: 'survive', description: '识别制作、运输、垫资和延期付款风险。', verbs: ['READ', 'TALK'], reveals: ['paymentRisk'] },
  { id: 'maintenance', name: 'Maintenance', family: 'survive', description: '把持续运行、版本和故障恢复当成作品条件。', verbs: ['TEST', 'ARCHIVE'] },
  { id: 'documentation', name: 'Documentation', family: 'survive', description: '为作品留下足够的安装、运行和传播材料。', verbs: ['SHOW', 'ARCHIVE'] }
];

export const computeTiers: CapabilityTier[] = [
  { id: 'g50', label: 'G50', rank: 50, description: '基础实时图形。复杂场景开始出现性能压力。', enables: ['web', 'basic-realtime'] },
  { id: 'g60', label: 'G60', rank: 60, description: '标准制作线。取消大多数基础性能限制。', enables: ['realtime', 'basic-3d', 'single-output'] },
  { id: 'g70', label: 'G70', rank: 70, description: '稳定处理较复杂实时媒体和多层场景。', enables: ['complex-realtime', 'multi-output', 'medium-3d'] },
  { id: 'g80', label: 'G80', rank: 80, description: '面向大型场景、高分辨率、多输出和重型预演。', enables: ['large-scene', 'high-resolution', 'heavy-preview'] },
  { id: 'g90', label: 'G90', rank: 90, description: '极端工作负载和专业生产线。', enables: ['extreme-compute', 'large-local-model', 'large-spatial'] }
];

export const evaluationLenses: EvaluationLens[] = [
  { id: 'artist-run', name: '独立空间', values: ['coherence', 'experiment', 'reciprocity'], ignores: ['polish'] },
  { id: 'institution', name: '机构 / 美术馆', values: ['coherence', 'documentation', 'siteFit', 'legibility'], ignores: ['speed'] },
  { id: 'live', name: '现场演出', values: ['stability', 'responsiveness', 'delivery'], ignores: ['statementLength'] },
  { id: 'commercial', name: '商业委托', values: ['delivery', 'stability', 'budget', 'visualImpact'], ignores: ['institutionalPrestige'] },
  { id: 'residency', name: '驻留', values: ['process', 'adaptability', 'articulation'], ignores: ['finishedObject'] }
];

export const sampleOpportunities: OpportunityTemplate[] = [
  {
    id: 'opp-blackbox-night', title: '黑盒夜场：实时系统测试', host: '南岸临时剧场',
    locationId: 'region-shenzhen', lensId: 'live',
    publicFacts: ['一晚现场', '提供主投影与基础声音', '制作费 ¥1800', '三天后确认技术单'],
    hiddenSignals: ['technicalSupport:medium', 'paymentRisk:low', 'scopeRisk:medium', 'prestigeReality:low', 'curatorialDepth:medium'],
    skillReveals: {
      'site-survey': '场地只有一条主视频链，没有硬件切换备份。',
      'budgeting': '制作费不高，但不要求垫付设备。',
      'opportunity-reading': '它不是重要展览，但是真正允许你测试系统。'
    },
    tags: ['live', 'field-test', 'small-fee']
  },
  {
    id: 'opp-cloud-biennale', title: '“云之后”国际数字艺术联展', host: '未来媒介委员会',
    locationId: 'region-academy', lensId: 'institution',
    publicFacts: ['国际联展', '开放征集', '要求新作', '入选后自行承担运输与基础制作'],
    hiddenSignals: ['technicalSupport:low', 'paymentRisk:none', 'scopeRisk:high', 'prestigeReality:medium', 'curatorialDepth:low'],
    skillReveals: {
      'critical-reading': '主题文本用了很多大词，但没有说明真正的策展问题。',
      'budgeting': '如果做实体安装，制作和运输都需要自行垫付。',
      'opportunity-reading': '履历价值可能存在，但现场支持信息非常模糊。'
    },
    tags: ['open-call', 'institution', 'ambiguous']
  },
  {
    id: 'opp-brand-screen', title: '城市发布会实时视觉系统', host: '大型活动制作组',
    locationId: 'region-shenzhen', lensId: 'commercial',
    publicFacts: ['三块大屏', '两周制作周期', '预算明确', '需要现场联排'],
    hiddenSignals: ['technicalSupport:high', 'paymentRisk:medium', 'scopeRisk:high', 'prestigeReality:low', 'curatorialDepth:none'],
    skillReveals: {
      'client-translation': '对方真正要的是可控、能改、不会在联排时黑屏。',
      'budgeting': '报价足够，但尾款在活动后 45 天。',
      'site-survey': '现场输出条件很好，风险主要来自不断改需求。'
    },
    tags: ['commercial', 'live', 'cash']
  }
];
