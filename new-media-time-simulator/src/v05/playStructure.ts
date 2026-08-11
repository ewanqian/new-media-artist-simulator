export type PrimaryLayerId = 'field' | 'workbench' | 'records';

export type PrimaryLayer = {
  id: PrimaryLayerId;
  code: string;
  label: string;
  question: string;
  systems: [SystemNode, SystemNode, SystemNode];
};

export type SystemNode = {
  id: string;
  code: string;
  label: string;
  purpose: string;
};

export const primaryLayers: [PrimaryLayer, PrimaryLayer, PrimaryLayer] = [
  {
    id: 'field',
    code: 'FIELD',
    label: '场域',
    question: '现在身处什么条件里？',
    systems: [
      { id: 'places', code: 'PLACE', label: '空间', purpose: '环境、限制、可进入情境与空间实例。' },
      { id: 'people', code: 'PEOPLE', label: '人物', purpose: '关系、协作、信息来源与引荐网络。' },
      { id: 'signals', code: 'SIGNAL', label: '信号', purpose: '机会、压力、事件与需要判断的信息。' }
    ]
  },
  {
    id: 'workbench',
    code: 'WORKBENCH',
    label: '工作台',
    question: '在这些条件下，我实际能做什么？',
    systems: [
      { id: 'projects', code: 'PROJECT', label: '项目', purpose: '当前、支线与已归档实践对象。' },
      { id: 'capabilities', code: 'CAPABILITY', label: '能力', purpose: '工具、媒介、方法与基础设施阈值。' },
      { id: 'actions', code: 'ACTION', label: '工作', purpose: '环境与能力共同决定的具体实践动作。' }
    ]
  },
  {
    id: 'records',
    code: 'RECORDS',
    label: '记录',
    question: '我如何理解、记住并重新选择？',
    systems: [
      { id: 'quests', code: 'QUEST', label: '任务', purpose: '长线任务、支线与可重复目标。' },
      { id: 'archive', code: 'ARCHIVE', label: '档案', purpose: '被发现、整理和关联的知识与证据。' },
      { id: 'triumphs', code: 'TRIUMPH', label: '成就', purpose: '挑战、成就组、称号与完成记录。' }
    ]
  }
];

export type PlaceFamilyGroupId = 'make' | 'present' | 'network';

export type PlaceFamily = {
  id: string;
  groupId: PlaceFamilyGroupId;
  label: string;
  examples: string[];
};

export const placeFamilyGroups: Record<PlaceFamilyGroupId, { label: string; families: [PlaceFamily, PlaceFamily, PlaceFamily] }> = {
  make: {
    label: '制作环境',
    families: [
      { id: 'personal-workspace', groupId: 'make', label: '自有工作位', examples: ['家中工作位', '个人 Studio', '临时桌面'] },
      { id: 'shared-lab', groupId: 'make', label: '合作实验室 / 工作室', examples: ['大学实验室', '共享工作室', '研究空间'] },
      { id: 'fabrication-supplier', groupId: 'make', label: '加工 / 供应', examples: ['制作车间', '硬件供应', '租赁与运输'] }
    ]
  },
  present: {
    label: '展示环境',
    families: [
      { id: 'blackbox-club', groupId: 'present', label: '黑盒 / 俱乐部', examples: ['演出空间', '黑盒', 'Live venue'] },
      { id: 'gallery-institution', groupId: 'present', label: '展厅 / 机构空间', examples: ['美术馆', '项目空间', '展厅'] },
      { id: 'public-screen-online', groupId: 'present', label: '公共 / 屏幕 / 线上', examples: ['公共屏幕', '城市空间', '线上展演'] }
    ]
  },
  network: {
    label: '社会环境',
    families: [
      { id: 'peer-place', groupId: 'network', label: '同行聚点 / 咖啡馆', examples: ['咖啡馆', '酒吧', '共享活动空间'] },
      { id: 'institution-backstage', groupId: 'network', label: '机构后台 / 办公室', examples: ['后台', '策划办公室', '会议室'] },
      { id: 'client-market-residency', groupId: 'network', label: '客户 / 市场 / 驻留', examples: ['客户现场', '艺术博览会', '驻留'] }
    ]
  }
};

export type PeopleGroupId = 'creative' | 'production' | 'organization';

export type PeopleFamily = {
  id: string;
  groupId: PeopleGroupId;
  label: string;
};

export const peopleFamilyGroups: Record<PeopleGroupId, { label: string; families: [PeopleFamily, PeopleFamily, PeopleFamily] }> = {
  creative: {
    label: '创作',
    families: [
      { id: 'peer-artist', groupId: 'creative', label: '同行艺术家' },
      { id: 'performer-collaborator', groupId: 'creative', label: '表演 / 声音 / 影像合作者' },
      { id: 'research-critique', groupId: 'creative', label: '研究 / 写作 / 批评' }
    ]
  },
  production: {
    label: '制作',
    families: [
      { id: 'technical-signal-network', groupId: 'production', label: '技术 / 信号 / 网络' },
      { id: 'fabrication-install', groupId: 'production', label: '制作 / 运输 / 安装' },
      { id: 'documentation-media', groupId: 'production', label: '记录 / 摄影 / 传播' }
    ]
  },
  organization: {
    label: '组织',
    families: [
      { id: 'curator-producer', groupId: 'organization', label: '策划 / 制作人' },
      { id: 'institution-venue-education', groupId: 'organization', label: '机构 / 场地方 / 教育' },
      { id: 'client-brand-commercial', groupId: 'organization', label: '客户 / 品牌 / 商业' }
    ]
  }
};

export type SignalGroupId = 'opportunity' | 'pressure' | 'incident';

export type SignalFamily = {
  id: string;
  groupId: SignalGroupId;
  label: string;
};

export const signalFamilyGroups: Record<SignalGroupId, { label: string; families: [SignalFamily, SignalFamily, SignalFamily] }> = {
  opportunity: {
    label: '机会',
    families: [
      { id: 'invitation', groupId: 'opportunity', label: '邀请' },
      { id: 'open-call-commission', groupId: 'opportunity', label: '征集 / 委托' },
      { id: 'slot-residency-resource', groupId: 'opportunity', label: '档期 / 驻留 / 资源' }
    ]
  },
  pressure: {
    label: '压力',
    families: [
      { id: 'deadline', groupId: 'pressure', label: '截止日期' },
      { id: 'cash-rent', groupId: 'pressure', label: '现金流 / 租金' },
      { id: 'scope-responsibility', groupId: 'pressure', label: '范围 / 制作责任' }
    ]
  },
  incident: {
    label: '事件',
    families: [
      { id: 'technical-failure', groupId: 'incident', label: '技术故障' },
      { id: 'social-misread', groupId: 'incident', label: '沟通 / 误读' },
      { id: 'callback-old-material', groupId: 'incident', label: '旧材料 / 回流' }
    ]
  }
};

export type CapabilityGroupId = 'input' | 'compute' | 'output';

export type CapabilityFamily = {
  id: string;
  groupId: CapabilityGroupId;
  label: string;
};

export const capabilityFamilyGroups: Record<CapabilityGroupId, { label: string; families: [CapabilityFamily, CapabilityFamily, CapabilityFamily] }> = {
  input: {
    label: '输入',
    families: [
      { id: 'image-video-capture', groupId: 'input', label: '影像采集' },
      { id: 'scan-spatial-capture', groupId: 'input', label: '扫描 / 空间采集' },
      { id: 'sensor-live-input', groupId: 'input', label: '传感 / 实时输入' }
    ]
  },
  compute: {
    label: '处理',
    families: [
      { id: 'realtime-graphics', groupId: 'compute', label: '实时图形' },
      { id: 'reconstruction-generation', groupId: 'compute', label: '重建 / 生成' },
      { id: 'automation-integration', groupId: 'compute', label: '自动化 / 系统整合' }
    ]
  },
  output: {
    label: '输出',
    families: [
      { id: 'single-display', groupId: 'output', label: '单屏' },
      { id: 'multi-output-mapping', groupId: 'output', label: '多输出 / Mapping' },
      { id: 'spatial-special-display', groupId: 'output', label: '空间 / 特殊显示' }
    ]
  }
};

export type WorkActionGroupId = 'make' | 'test' | 'prepare';

export type WorkActionVerb = {
  id: string;
  groupId: WorkActionGroupId;
  label: string;
};

export const workActionGroups: Record<WorkActionGroupId, { label: string; verbs: [WorkActionVerb, WorkActionVerb, WorkActionVerb] }> = {
  make: {
    label: '制作',
    verbs: [
      { id: 'build', groupId: 'make', label: '构建' },
      { id: 'compose', groupId: 'make', label: '编排' },
      { id: 'integrate', groupId: 'make', label: '整合' }
    ]
  },
  test: {
    label: '测试',
    verbs: [
      { id: 'run', groupId: 'test', label: '运行' },
      { id: 'preview', groupId: 'test', label: '场地预演' },
      { id: 'diagnose', groupId: 'test', label: '诊断' }
    ]
  },
  prepare: {
    label: '准备',
    verbs: [
      { id: 'package', groupId: 'prepare', label: '打包 / 交付' },
      { id: 'document', groupId: 'prepare', label: '记录 / 文档' },
      { id: 'maintain-upgrade', groupId: 'prepare', label: '维护 / 升级' }
    ]
  }
};

export type QuestKind = 'main' | 'side' | 'repeatable';
export type QuestObjectiveKind = 'action' | 'state' | 'dialogue' | 'evidence' | 'time' | 'choice';

export type QuestObjective = {
  id: string;
  kind: QuestObjectiveKind;
  text: string;
  hidden?: boolean;
};

export type Quest = {
  id: string;
  title: string;
  objectives: QuestObjective[];
};

export type QuestLine = {
  id: string;
  kind: QuestKind;
  title: string;
  summary: string;
  quests: Quest[];
};

export type EpisodeRuntime = {
  id: string;
  code: string;
  playerFacing: false;
  checkpointId: string;
  questLineIds: string[];
  entryFlags: string[];
  completionFlags: string[];
  replayPolicy: 'none' | 'checkpoint' | 'full';
};

export const hiddenMechanisms = ['episode'] as const;

export const openingQuestLine: QuestLine = {
  id: 'main-first-visible-version',
  kind: 'main',
  title: '第一个能被别人看见的版本',
  summary: '让一个刚开始运行的东西离开桌面，经过别人、故障和现场，第一次真正被公开。',
  quests: [
    {
      id: 'main-01-running',
      title: '一个东西开始运行',
      objectives: [
        { id: 'make-prototype', kind: 'action', text: '完成一个具体的原型动作。' },
        { id: 'project-appears', kind: 'state', text: '形成第一个可继续推进的项目。' }
      ]
    },
    {
      id: 'main-02-leave-desk',
      title: '它离开你的桌面',
      objectives: [
        { id: 'enter-context', kind: 'state', text: '进入一个会改变可用动作的外部环境。' },
        { id: 'context-action', kind: 'action', text: '完成一次由环境决定的工作动作。' }
      ]
    },
    {
      id: 'main-03-other-eyes',
      title: '别人怎么理解它',
      objectives: [
        { id: 'show-relevant-person', kind: 'dialogue', text: '让一个真正相关的人看到当前版本。' },
        { id: 'receive-feedback', kind: 'time', text: '等待并收到一条延迟反馈。' },
        { id: 'archive-feedback', kind: 'evidence', text: '留下至少一条可复用的反馈记录。' }
      ]
    },
    {
      id: 'main-04-why-breaks',
      title: '它为什么会坏',
      objectives: [
        { id: 'reveal-thread', kind: 'state', text: '暴露一个真实的未解决问题。' },
        { id: 'diagnose-thread', kind: 'action', text: '诊断或解决这个问题。' },
        { id: 'method-unlock', kind: 'evidence', text: '从这次问题里获得一条方法记录。' }
      ]
    },
    {
      id: 'main-05-first-public',
      title: '第一次真正公开',
      objectives: [
        { id: 'choose-presentation-context', kind: 'choice', text: '选择一个真实展示环境。' },
        { id: 'meet-or-adapt', kind: 'state', text: '满足现场能力要求，或主动收缩项目范围。' },
        { id: 'public-output', kind: 'action', text: '完成第一次公开 / 现场输出。' }
      ]
    }
  ]
};

export const openingEpisodeRuntime: EpisodeRuntime = {
  id: 'episode-01-runtime',
  code: 'EP.01',
  playerFacing: false,
  checkpointId: 'checkpoint-opening-entry',
  questLineIds: [openingQuestLine.id],
  entryFlags: ['new-game'],
  completionFlags: ['main-first-visible-version-complete'],
  replayPolicy: 'checkpoint'
};

export type ArchiveCategoryId = 'people' | 'places' | 'projects' | 'methods' | 'media' | 'ecology';

export const archiveCategories: { id: ArchiveCategoryId; code: string; label: string }[] = [
  { id: 'people', code: 'PEOPLE', label: '人物' },
  { id: 'places', code: 'PLACES', label: '场域' },
  { id: 'projects', code: 'PROJECTS', label: '项目' },
  { id: 'methods', code: 'METHODS', label: '方法' },
  { id: 'media', code: 'MEDIA', label: '媒介' },
  { id: 'ecology', code: 'ECOLOGY', label: '生态' }
];

export const triumphGroups = [
  { id: 'challenges', label: '挑战' },
  { id: 'sets', label: '成就组' },
  { id: 'titles', label: '称号' }
] as const;

export function flattenThreeByThree<T>(groups: Record<string, { families?: readonly T[]; verbs?: readonly T[] }>): T[] {
  return Object.values(groups).flatMap((group) => group.families || group.verbs || []);
}

export function isPlayerFacingPrimarySystem(id: string): boolean {
  return primaryLayers.some((layer) => layer.id === id || layer.systems.some((system) => system.id === id));
}
