import type { ResolvedCallback } from './consequenceLoop.ts';

export type ThreadKind = 'technical' | 'scope' | 'site' | 'material' | 'relationship' | 'cash';

export type PersistentThread = {
  id: string;
  kind: ThreadKind;
  title: string;
  text: string;
  createdWeek: number;
  pressure: number;
  sourceId?: string;
};

export type ThreadFriction = {
  attentionTax: number;
  cashTax: number;
  pressure: number;
  notes: string[];
};

export const starterThreads: PersistentThread[] = [
  {
    id: 'thread-runtime-20min',
    kind: 'technical',
    title: '还没有跑过完整 20 分钟',
    text: '桌面上能启动不等于现场能持续运行。',
    createdWeek: 1,
    pressure: 1
  },
  {
    id: 'thread-047-recording',
    kind: 'material',
    title: '47 分钟录音还没决定去处',
    text: '它既可能是废料，也可能在之后重新变成项目材料。',
    createdWeek: 1,
    pressure: 0
  }
];

const callbackThreadSeeds: Record<string, Omit<PersistentThread, 'id' | 'createdWeek' | 'sourceId'>> = {
  'opp-emergency-live': {
    kind: 'technical',
    title: '输入信号中断原因还没查',
    text: '保底状态救了现场，但真正的故障原因还没有被复现。',
    pressure: 1
  },
  'opp-brand-demo': {
    kind: 'scope',
    title: '追加的播控责任需要复盘',
    text: '这次交付过去了，但新增责任是怎么进入项目的还没有形成规则。',
    pressure: 1
  },
  'opp-open-call-small-space': {
    kind: 'material',
    title: '失败申请材料还可以再拆',
    text: '项目页、预算和安装说明已经存在，但还没判断哪些值得保留。',
    pressure: 0
  },
  'opp-public-screen': {
    kind: 'site',
    title: '公共屏参数没有回写到模板',
    text: '真实亮度和观看距离已经测过，但下一次仍可能重新踩一遍。',
    pressure: 1
  },
  'opp-artist-run-show': {
    kind: 'site',
    title: '第二版安装尺寸还没归档',
    text: '现场最后使用的安装方式与最初效果图不同。',
    pressure: 0
  },
  'opp-workshop': {
    kind: 'material',
    title: '工作坊里卡住的步骤还没整理',
    text: '参与者暴露出的解释缺口可以继续变成方法文档。',
    pressure: 0
  }
};

export function cloneStarterThreads(): PersistentThread[] {
  return starterThreads.map((thread) => ({ ...thread }));
}

export function normalizeThreads(raw: unknown): PersistentThread[] {
  if (!Array.isArray(raw)) return cloneStarterThreads();
  return raw
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      id: String(item.id || ''),
      kind: item.kind as ThreadKind,
      title: String(item.title || ''),
      text: String(item.text || ''),
      createdWeek: Math.max(1, Number(item.createdWeek || 1)),
      pressure: Math.max(0, Math.min(4, Number(item.pressure || 0))),
      sourceId: item.sourceId ? String(item.sourceId) : undefined
    }))
    .filter((item) => item.id && item.title);
}

export function ageThreads(threads: PersistentThread[], week: number): PersistentThread[] {
  return threads.map((thread) => {
    const age = Math.max(0, week - thread.createdWeek);
    const escalation = thread.kind === 'material'
      ? Math.floor(age / 4)
      : Math.floor(age / 2);
    return { ...thread, pressure: Math.max(thread.pressure, Math.min(4, escalation)) };
  });
}

export function frictionFromThreads(threads: PersistentThread[], cash: number): ThreadFriction {
  const pressure = threads.reduce((sum, thread) => sum + thread.pressure, 0);
  const highPressure = threads.filter((thread) => thread.pressure >= 2);
  const attentionTax = Math.min(2, Math.floor(highPressure.length / 2));
  const scopeTax = threads
    .filter((thread) => thread.kind === 'scope' && thread.pressure >= 2)
    .reduce((sum, thread) => sum + 150 * thread.pressure, 0);
  const cashTax = cash < 900 ? Math.max(150, scopeTax) : scopeTax;
  const notes = highPressure
    .sort((a, b) => b.pressure - a.pressure)
    .slice(0, 3)
    .map((thread) => `${thread.title} / 压力 ${thread.pressure}`);
  return { attentionTax, cashTax, pressure, notes };
}

export function resolveThreadsByAction(threads: PersistentThread[], actionId: string): {
  threads: PersistentThread[];
  resolved: PersistentThread[];
} {
  const matches = (thread: PersistentThread) => {
    if (actionId === 'build') return thread.kind === 'technical';
    if (actionId === 'site-test') return thread.kind === 'site';
    if (actionId === 'document') return thread.kind === 'scope' || thread.kind === 'material';
    return false;
  };
  return {
    threads: threads.filter((thread) => !matches(thread)),
    resolved: threads.filter(matches)
  };
}

export function threadsFromResolvedCallbacks(callbacks: ResolvedCallback[], existing: PersistentThread[], week: number): PersistentThread[] {
  const existingKeys = new Set(existing.map((thread) => `${thread.kind}:${thread.sourceId || thread.id}`));
  const additions: PersistentThread[] = [];
  for (const callback of callbacks) {
    const seed = callbackThreadSeeds[callback.sourceId];
    if (!seed) continue;
    const key = `${seed.kind}:${callback.sourceId}`;
    if (existingKeys.has(key)) continue;
    existingKeys.add(key);
    additions.push({
      ...seed,
      id: `thread:${callback.sourceId}:${week}`,
      sourceId: callback.sourceId,
      createdWeek: week
    });
  }
  return additions;
}

export function threadKindLabel(kind: ThreadKind): string {
  const labels: Record<ThreadKind, string> = {
    technical: '技术债',
    scope: '范围债',
    site: '场地问题',
    material: '未整理材料',
    relationship: '关系线',
    cash: '现金压力'
  };
  return labels[kind];
}
