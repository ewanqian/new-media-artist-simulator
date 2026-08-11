import type { ProjectSnapshot } from './gameLoop.ts';

export type CallbackEffect = {
  cash?: number;
  attentionMax?: number;
  project?: Partial<ProjectSnapshot>;
};

export type ScheduledCallback = {
  id: string;
  sourceType: 'contact' | 'opportunity' | 'project';
  sourceId: string;
  createdWeek: number;
  dueWeek: number;
  title: string;
  waitingText: string;
  resultText: string;
  archiveTitle?: string;
  archiveText?: string;
  effect: CallbackEffect;
};

export type ResolvedCallback = ScheduledCallback & {
  resolvedWeek: number;
};

export type GeneratedArchiveEntry = {
  id: string;
  week: number;
  title: string;
  text: string;
  sourceType: ScheduledCallback['sourceType'];
  sourceId: string;
};

export type ConsequenceState = {
  scheduledCallbacks: ScheduledCallback[];
  resolvedCallbacks: ResolvedCallback[];
  generatedArchive: GeneratedArchiveEntry[];
};

const contactOutcomeSeeds: Record<string, Omit<ScheduledCallback, 'id' | 'sourceType' | 'sourceId' | 'createdWeek' | 'dueWeek'>> = {
  'contact-lin': {
    title: '林看完了当前版本',
    waitingText: '他说先别讲概念，把能跑的版本带来。',
    resultText: '林只指出一个问题：你现在同时在解释三件事。删掉其中两件以后，项目问题更清楚了。',
    archiveTitle: '同行反馈 / 只留一个问题',
    archiveText: '一次低成本同行测试：当作品需要先解释三个前提时，先删掉两个。',
    effect: { project: { coherence: 1 } }
  },
  'contact-li-tech': {
    title: '李工回了信号链',
    waitingText: '他让你把输出口、分辨率、刷新率和备份机写成一页。',
    resultText: '信号链被确认。你发现一个原本会在现场才暴露的转换问题，提前换掉了。',
    archiveTitle: '技术记录 / 信号链 v1',
    archiveText: '输出口、分辨率、刷新率、转换链和备份路径第一次被写成可复用记录。',
    effect: { project: { stability: 1, documentation: 1 } }
  },
  'contact-qiao': {
    title: '乔把预算结构发来了',
    waitingText: '制作人没有替你报价，只把哪些钱必须单列告诉了你。',
    resultText: '你第一次把“视觉制作”和“播控 / 服务器 / 现场支持”拆成不同责任项。',
    archiveTitle: '报价记录 / Scope 拆分',
    archiveText: '范围改变时，报价必须跟着改变。视觉、播控、网络和现场支持不再混成一句“都包了”。',
    effect: { cash: 300 }
  },
  'contact-chen': {
    title: '陈转来了机构反馈',
    waitingText: '项目页已经被转给同事，暂时没有承诺。',
    resultText: '对方没有问你的艺术家简介，先问“这个版本在现场具体怎么发生”。你补了一段安装说明。',
    archiveTitle: '机构反馈 / 先说明怎么发生',
    archiveText: '当陌生人第一次读项目时，作品如何发生通常比宏大背景更先决定他是否继续看。',
    effect: { project: { documentation: 1 } }
  },
  'contact-dai': {
    title: '戴师傅回了尺寸方案',
    waitingText: '他在等你给出准确尺寸和重量。',
    resultText: '结构被拆成两段以后，普通货梯可以进入；运输路径第一次反过来改变了作品结构。',
    archiveTitle: '制作记录 / 先过货梯',
    archiveText: '运输尺寸不是作品完成后的后勤问题，它会直接改变结构设计。',
    effect: { project: { siteFit: 1 } }
  },
  'contact-m': {
    title: 'M 发来了安装过程素材',
    waitingText: '这次约的是过程记录，不只拍最终画面。',
    resultText: '素材里最有用的不是完成图，而是一段安装失败后重新接线的过程。它进入了项目档案。',
    archiveTitle: '现场记录 / 安装失败片段',
    archiveText: '记录不是宣传素材的同义词。失败、返工和搭建过程也属于作品历史。',
    effect: { project: { documentation: 1 } }
  }
};

const opportunityOutcomeSeeds: Record<string, Omit<ScheduledCallback, 'id' | 'sourceType' | 'sourceId' | 'createdWeek' | 'dueWeek'>> & { delay?: number }> = {
  'opp-blackbox-two-hours': {
    title: '黑盒测试结果回来',
    waitingText: '两小时场地已经排进日程。',
    resultText: '真实输出把一个桌面上看不见的问题暴露了出来。你重新安排了观看距离和备用路径。',
    archiveTitle: '场地记录 / 黑盒两小时',
    archiveText: '一次没有正式观众的场地测试，留下了输出规格、观看距离和故障记录。',
    effect: { project: { siteFit: 1, stability: 1 } },
    delay: 1
  },
  'opp-open-call-small-space': {
    title: '征集结果邮件',
    waitingText: '材料已提交。接下来这件事暂时不由你控制。',
    resultText: '没有入选。评语很短，但你已经得到一套可以再次修改的申请材料。',
    archiveTitle: '失败申请 / 可复用版本',
    archiveText: '一次未入选申请被保留下来，项目页、预算和安装说明之后仍然可以继续使用。',
    effect: { project: { documentation: 1 } },
    delay: 2
  },
  'opp-brand-demo': {
    title: '品牌项目结算',
    waitingText: '项目进入高压制作周。',
    resultText: '项目交付了。范围中途膨胀过一次，但你把新增播控支持单独确认了。尾款到账。',
    archiveTitle: '委托记录 / 范围膨胀',
    archiveText: '一次商业项目把 Scope 变化、技术责任和结算记录完整留下。',
    effect: { cash: 2600, project: { stability: 1 } },
    delay: 1
  },
  'opp-hangzhou-week': {
    title: '杭州 Open Studio 结束',
    waitingText: '你带着一个不完整版本离开上海一周。',
    resultText: '陌生观众提出的问题和本地同行不同。项目没有“完成”，但它多了一条新的观看路径。',
    archiveTitle: '外地记录 / Open Studio',
    archiveText: '同一个项目换城市以后，空间、观众和解释习惯都会重新排列。',
    effect: { project: { coherence: 1, documentation: 1 } },
    delay: 2
  },
  'opp-emergency-live': {
    title: '临时替场结束',
    waitingText: '没有彩排，只有一份不太完整的设备表。',
    resultText: '现场有一次输入信号中断，但保底状态接住了。你拿到现金，也留下了一段真正的故障记录。',
    archiveTitle: '现场记录 / 保底状态救场',
    archiveText: '没有彩排的演出让“备用状态”从习惯变成了项目方法。',
    effect: { cash: 2600, project: { stability: 1, documentation: 1 } },
    delay: 1
  },
  'opp-public-screen': {
    title: '公共屏幕试运行结束',
    waitingText: '审核、亮度、分辨率和播控窗口都开始成为作品条件。',
    resultText: '作品在真实公共尺度跑完一轮。你删掉了桌面上成立、远距离完全看不见的一层细节。',
    archiveTitle: '公共屏记录 / 远距离观看',
    archiveText: '公共屏幕让观看距离和亮度成为构图规则，而不只是输出规格。',
    effect: { cash: 1200, project: { siteFit: 1, documentation: 1 } },
    delay: 2
  },
  'opp-artist-run-show': {
    title: '三人展拆展',
    waitingText: '没有完整制作团队，很多问题会在现场自己解决。',
    resultText: '展览结束。你改了两次安装方式，最后那一版比最初效果图简单得多。',
    archiveTitle: '自组织展览 / 两次改装',
    archiveText: '低预算现场没有把项目变小，反而逼出了一版更清楚的安装结构。',
    effect: { project: { siteFit: 1, coherence: 1, documentation: 1 } },
    delay: 2
  },
  'opp-workshop': {
    title: '方法工作坊结束',
    waitingText: '你正在把自己的工作方法拆成别人可以执行的步骤。',
    resultText: '参与者卡住的地方暴露了你自己一直跳过的解释步骤。工作坊反过来修正了项目文档。',
    archiveTitle: '教学记录 / 方法被拆开',
    archiveText: '把方法教给别人，是检查方法是否真的存在的一种方式。',
    effect: { cash: 800, project: { documentation: 1, coherence: 1 } },
    delay: 1
  }
};

function bounded(value: number): number {
  return Math.max(0, Math.min(4, value));
}

export function scheduleContactCallback(contactId: string, week: number): ScheduledCallback | null {
  const seed = contactOutcomeSeeds[contactId];
  if (!seed) return null;
  return {
    ...seed,
    id: `contact:${contactId}:${week}`,
    sourceType: 'contact',
    sourceId: contactId,
    createdWeek: week,
    dueWeek: week + 1
  };
}

export function scheduleOpportunityCallback(opportunityId: string, week: number): ScheduledCallback | null {
  const seed = opportunityOutcomeSeeds[opportunityId];
  if (!seed) return null;
  const { delay = 1, ...rest } = seed;
  return {
    ...rest,
    id: `opportunity:${opportunityId}:${week}`,
    sourceType: 'opportunity',
    sourceId: opportunityId,
    createdWeek: week,
    dueWeek: week + delay
  };
}

export function hasOpenSourceCallback(state: ConsequenceState, sourceType: ScheduledCallback['sourceType'], sourceId: string): boolean {
  return state.scheduledCallbacks.some((callback) => callback.sourceType === sourceType && callback.sourceId === sourceId);
}

export function resolveDueCallbacks(state: ConsequenceState, week: number): {
  state: ConsequenceState;
  resolvedNow: ResolvedCallback[];
  cashDelta: number;
  attentionMaxDelta: number;
  projectDelta: Partial<ProjectSnapshot>;
} {
  const due = state.scheduledCallbacks.filter((callback) => callback.dueWeek <= week);
  const pending = state.scheduledCallbacks.filter((callback) => callback.dueWeek > week);
  const resolvedNow = due.map((callback) => ({ ...callback, resolvedWeek: week }));
  const archiveAdds: GeneratedArchiveEntry[] = due
    .filter((callback) => callback.archiveTitle && callback.archiveText)
    .map((callback) => ({
      id: `archive:${callback.id}`,
      week,
      title: callback.archiveTitle as string,
      text: callback.archiveText as string,
      sourceType: callback.sourceType,
      sourceId: callback.sourceId
    }));

  const projectDelta: Partial<ProjectSnapshot> = {};
  let cashDelta = 0;
  let attentionMaxDelta = 0;

  for (const callback of due) {
    cashDelta += callback.effect.cash || 0;
    attentionMaxDelta += callback.effect.attentionMax || 0;
    for (const [key, value] of Object.entries(callback.effect.project || {})) {
      const field = key as keyof ProjectSnapshot;
      projectDelta[field] = (projectDelta[field] || 0) + Number(value || 0);
    }
  }

  return {
    state: {
      scheduledCallbacks: pending,
      resolvedCallbacks: [...state.resolvedCallbacks, ...resolvedNow],
      generatedArchive: [...state.generatedArchive, ...archiveAdds]
    },
    resolvedNow,
    cashDelta,
    attentionMaxDelta,
    projectDelta
  };
}

export function applyResolvedProjectDelta(project: ProjectSnapshot, delta: Partial<ProjectSnapshot>): ProjectSnapshot {
  return {
    coherence: bounded(project.coherence + (delta.coherence || 0)),
    stability: bounded(project.stability + (delta.stability || 0)),
    siteFit: bounded(project.siteFit + (delta.siteFit || 0)),
    documentation: bounded(project.documentation + (delta.documentation || 0))
  };
}
