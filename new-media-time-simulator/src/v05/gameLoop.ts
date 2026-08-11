export type ProjectSnapshot = {
  coherence: number;
  stability: number;
  siteFit: number;
  documentation: number;
};

export type ProjectStageId =
  | 'clue'
  | 'prototype'
  | 'testable'
  | 'production'
  | 'public'
  | 'archive';

export type ProjectStage = {
  id: ProjectStageId;
  label: string;
  description: string;
  unlocks: string[];
};

export type ProjectAction = {
  id: 'frame' | 'build' | 'site-test' | 'document';
  label: string;
  cost: number;
  description: string;
  delta: Partial<ProjectSnapshot>;
};

export type OpportunityGate = {
  opportunityId: string;
  requires: Partial<ProjectSnapshot>;
  minWeek?: number;
  minCash?: number;
  reason: string;
};

export type WeeklyPulse = {
  id: string;
  label: string;
  pressure: string;
  worldSignal: string;
};

export const projectStages: ProjectStage[] = [
  {
    id: 'clue',
    label: '线索',
    description: '你知道自己在追什么，但还没有一个可以被别人验证的版本。',
    unlocks: ['工作室行动', '同行反馈', '基础档案']
  },
  {
    id: 'prototype',
    label: '原型',
    description: '核心规则或观看关系已经出现，可以开始暴露问题。',
    unlocks: ['低成本测试', '技术讨论', '小型机会']
  },
  {
    id: 'testable',
    label: '可测试',
    description: '项目可以离开你的电脑，在真实设备或真实空间中运行一次。',
    unlocks: ['黑盒测试', '场地预演', '技术联系人']
  },
  {
    id: 'production',
    label: '可制作',
    description: '范围、技术路径和现场限制基本可被制作团队理解。',
    unlocks: ['正式报价', '机构制作', '商业委托']
  },
  {
    id: 'public',
    label: '可公开',
    description: '作品不仅能跑，还能被安装、说明、记录和重复进入。',
    unlocks: ['公开展览', '媒体记录', '外部城市线路']
  },
  {
    id: 'archive',
    label: '可归档',
    description: '项目拥有足够的技术、文本和过程记录，可以在未来被重新调用。',
    unlocks: ['长期档案', '旧项目回流', '方法迁移']
  }
];

export const projectActions: ProjectAction[] = [
  {
    id: 'frame',
    label: '收缩问题',
    cost: 1,
    description: '删掉一个宏大说法，留下一个可以被材料或现场验证的问题。',
    delta: { coherence: 1 }
  },
  {
    id: 'build',
    label: '跑完整版本',
    cost: 2,
    description: '让系统连续运行，先找崩溃、延迟、丢信号和不可恢复状态。',
    delta: { stability: 1 }
  },
  {
    id: 'site-test',
    label: '带去真实场地',
    cost: 2,
    description: '把观看距离、光线、声音、屏幕和安装限制放进作品。',
    delta: { siteFit: 1 }
  },
  {
    id: 'document',
    label: '整理可复用文档',
    cost: 1,
    description: '留下版本、技术单、失败截图、安装图和一句关键判断。',
    delta: { documentation: 1 }
  }
];

export const opportunityGates: OpportunityGate[] = [
  {
    opportunityId: 'opp-blackbox-two-hours',
    requires: { coherence: 2 },
    reason: '至少先知道这两个小时要测试什么。'
  },
  {
    opportunityId: 'opp-open-call-small-space',
    requires: { coherence: 2, documentation: 1 },
    reason: '需要一个能被陌生人快速读懂的项目版本。'
  },
  {
    opportunityId: 'opp-brand-demo',
    requires: { stability: 2 },
    minCash: 800,
    reason: '高压交付会放大不稳定系统和垫资风险。'
  },
  {
    opportunityId: 'opp-hangzhou-week',
    requires: { coherence: 2, documentation: 1 },
    minWeek: 3,
    reason: '先有一段可带走的项目脉络，再值得离开本地一周。'
  },
  {
    opportunityId: 'opp-emergency-live',
    requires: { stability: 2 },
    reason: '临时替场没有时间给你现场重写整个系统。'
  },
  {
    opportunityId: 'opp-public-screen',
    requires: { stability: 3, siteFit: 2 },
    reason: '公共屏幕首先要求可靠输出和明确的观看尺度。'
  },
  {
    opportunityId: 'opp-artist-run-show',
    requires: { coherence: 2 },
    reason: '空间可以粗糙，但作品本身必须已经有一个明确问题。'
  },
  {
    opportunityId: 'opp-workshop',
    requires: { documentation: 2 },
    reason: '能做出来和能把方法拆给别人是两件事。'
  }
];

export const weeklyPulses: WeeklyPulse[] = [
  {
    id: 'quiet',
    label: '安静的一周',
    pressure: '没有新机会。你只能面对项目本身。',
    worldSignal: '适合处理技术债、文档和被拖延的问题。'
  },
  {
    id: 'messages',
    label: '消息突然变多',
    pressure: '三个群同时有人问“最近在做什么”。',
    worldSignal: '联络网络更活跃，但每个回复都会消耗注意力。'
  },
  {
    id: 'cash',
    label: '现金流周',
    pressure: '房租、软件续费和一笔迟迟没到的尾款同时出现。',
    worldSignal: '商业机会的吸引力上升，艺术项目不会因此暂停计时。'
  },
  {
    id: 'deadline',
    label: '截止日期挤在一起',
    pressure: '两个申请和一个交付落在同一周。',
    worldSignal: '文档完整度开始直接决定你能不能参与。'
  },
  {
    id: 'site',
    label: '现场周',
    pressure: '桌面版本已经无法继续回答空间问题。',
    worldSignal: '场地、物流和技术联系人权重上升。'
  },
  {
    id: 'callback',
    label: '旧东西回来',
    pressure: '几周前搁置的材料突然和一个新机会对上了。',
    worldSignal: '档案和旧项目可以重新进入当前项目。'
  }
];

export function deriveProjectStage(project: ProjectSnapshot): ProjectStage {
  if (
    project.coherence >= 3 &&
    project.stability >= 3 &&
    project.siteFit >= 3 &&
    project.documentation >= 3
  ) return projectStages[5];

  if (
    project.coherence >= 3 &&
    project.stability >= 3 &&
    project.siteFit >= 3 &&
    project.documentation >= 2
  ) return projectStages[4];

  if (project.stability >= 3 && project.siteFit >= 2 && project.coherence >= 2) return projectStages[3];
  if (project.coherence >= 2 && project.stability >= 2) return projectStages[2];
  if (project.coherence >= 2) return projectStages[1];
  return projectStages[0];
}

export function applyProjectAction(project: ProjectSnapshot, actionId: ProjectAction['id']): ProjectSnapshot {
  const action = projectActions.find((item) => item.id === actionId);
  if (!action) return project;
  const next = { ...project };
  for (const [key, value] of Object.entries(action.delta)) {
    const field = key as keyof ProjectSnapshot;
    next[field] = Math.max(0, Math.min(4, next[field] + Number(value || 0)));
  }
  return next;
}

export function opportunityReadiness(
  opportunityId: string,
  project: ProjectSnapshot,
  week: number,
  cash: number
): { ready: boolean; reason: string } {
  const gate = opportunityGates.find((item) => item.opportunityId === opportunityId);
  if (!gate) return { ready: true, reason: '没有硬性门槛，价值取决于当前路线。' };
  for (const [key, required] of Object.entries(gate.requires)) {
    if (project[key as keyof ProjectSnapshot] < Number(required)) return { ready: false, reason: gate.reason };
  }
  if (gate.minWeek && week < gate.minWeek) return { ready: false, reason: gate.reason };
  if (gate.minCash && cash < gate.minCash) return { ready: false, reason: gate.reason };
  return { ready: true, reason: gate.reason };
}

export function weeklyPulseFor(week: number): WeeklyPulse {
  const index = Math.max(0, week - 1) % weeklyPulses.length;
  return weeklyPulses[index];
}

export function cashPressure(cash: number): '安全' | '紧张' | '危险' {
  if (cash < 900) return '危险';
  if (cash < 2200) return '紧张';
  return '安全';
}
