import { careerSpecialEvents } from './careerContent.ts';
import { contactById } from './legacyDeck.ts';
import type { CareerScene, CareerSceneChoice } from './careerStageOne.ts';

type CareerState = Record<string, any>;

export type CareerStageFourProgress = {
  quests: { id: string; title: string; done: boolean; active: boolean }[];
  completed: number;
  total: number;
  complete: boolean;
};

export type CareerStageFourCommandResult = {
  save: CareerState;
  notice: { title: string; text: string };
};

const EP10_DONE = 'stage4:ep10:complete';
const EP11_DONE = 'stage4:ep11:complete';
const STAGE4_DONE = 'career:stage-4:complete';

function array(save: CareerState, key: string): any[] { return Array.isArray(save?.[key]) ? save[key] : []; }
function strings(save: CareerState, key: string): string[] { return array(save, key).filter((value) => typeof value === 'string'); }
function has(save: CareerState, id: string) { return strings(save, 'evidenceIds').includes(id); }
function hasPrefix(save: CareerState, prefix: string) { return strings(save, 'evidenceIds').some((id) => id.startsWith(prefix)); }
function unique(values: string[] = [], value: string) { return values.includes(value) ? values : [...values, value]; }
function addEvidence(save: CareerState, id: string) { return { ...save, evidenceIds: unique(strings(save, 'evidenceIds'), id) }; }
function addMethod(save: CareerState, id: string) { return { ...save, methodIds: unique(strings(save, 'methodIds'), id) }; }
function markEvent(save: CareerState, id: string) { return { ...save, seenEventIds: unique(strings(save, 'seenEventIds'), id) }; }
function log(save: CareerState, title: string, text: string, type = '方法') { return { ...save, actionLog: [...array(save, 'actionLog'), { week: save.week || 1, type, title, text }] }; }
function discover(save: CareerState, id: string) {
  const contactThreads = { ...(save.contactThreads || {}) };
  if (!contactThreads[id]) contactThreads[id] = contactById(id)?.openingMessages || [];
  return { ...save, discoveredContactIds: unique(strings(save, 'discoveredContactIds'), id), contactThreads };
}
function message(save: CareerState, id: string, text: string) {
  let next = discover(save, id);
  next = { ...next, contactThreads: { ...next.contactThreads, [id]: [...(next.contactThreads[id] || []), { from: 'them', text }] } };
  return next;
}
function spend(save: CareerState, attention = 0, cash = 0): CareerState | null {
  const currentAttention = Number(save.attention || 0);
  const currentCash = Number(save.cash || 0);
  if ((attention > 0 && currentAttention < attention) || (cash > 0 && currentCash < cash)) return null;
  return { ...save, attention: currentAttention - attention, cash: currentCash - cash };
}
function metric(save: CareerState, key: 'coherence' | 'stability' | 'siteFit' | 'documentation', delta: number) {
  const current = Number(save.projectMetrics?.[key] || 0);
  return { ...save, projectMetrics: { ...(save.projectMetrics || {}), [key]: Math.max(0, Math.min(4, current + delta)) } };
}
function nextWeek(save: CareerState, note: string) {
  const week = Number(save.week || 1) + 1;
  return log({ ...save, week, attention: Number(save.attentionMax || 6), cash: Number(save.cash || 0) - 450 }, `第 ${week} 周`, `${note} 固定支出 -450。`, '时间');
}
function special(id: string) { return careerSpecialEvents.find((event) => event.id === id); }

function sourceLabel(save: CareerState) {
  if (hasPrefix(save, 'stage4:ep10:source:recovery')) return '黑盒故障与恢复历史';
  if (hasPrefix(save, 'stage4:ep10:source:live-branch')) return 'final_final_v7_REAL 的现场版本分支';
  if (hasPrefix(save, 'stage4:ep10:source:public')) return 'Open Call / 传播误读留下的公开版本';
  return '旧项目材料';
}

function parentLabel(save: CareerState) {
  if (hasPrefix(save, 'stage4:ep11:parent:feedback')) return '最小反馈系统';
  if (hasPrefix(save, 'stage4:ep11:parent:recovery')) return '现场恢复链';
  if (hasPrefix(save, 'stage4:ep11:parent:handoff')) return '一页项目 / 交接接口';
  return '旧项目';
}

function teachChoices(save: CareerState): CareerSceneChoice[] {
  const methods = new Set(strings(save, 'methodIds'));
  const choices: CareerSceneChoice[] = [];
  if (methods.has('method-evidence-led-recovery') || methods.has('method-recovery-rehearsal')) {
    choices.push({ id: 'story:stage4:teach-recovery', title: '教“先留基线，再练一次恢复”', detail: '不是教某个软件按钮，而是让别人故意制造一次可控失败，再用 Evidence 把系统带回来。', cost: '注意力 -1 · 恢复方法', kind: 'build' });
  }
  if (methods.has('method-scope-boundary') || methods.has('method-commission-boundary') || methods.has('method-brief-verification')) {
    choices.push({ id: 'story:stage4:teach-scope', title: '教“把模糊需求翻译成责任接口”', detail: '内容、输出、现场、记录、不包含什么。让另一个人用同样框架拆一份真实 Brief。', cost: '注意力 -1 · Scope 方法', kind: 'commitment' });
  }
  if (methods.has('method-one-page-project')) {
    choices.push({ id: 'story:stage4:teach-one-page', title: '教“一页项目不是缩小字号”', detail: '只留下问题、当前版本、发生方式、条件和证据，让别人删掉自己的泛泛开场。', cost: '注意力 -1 · 一页项目方法', kind: 'build' });
  }
  if (choices.length < 2) {
    choices.push({ id: 'story:stage4:teach-lineage', title: '教“版本差异也值得留下”', detail: '从一个现场分支开始，说明 parent、改了什么、为什么改，以及以后怎么重新打开。', cost: '注意力 -1 · 版本谱系方法', kind: 'build' });
  }
  return choices.slice(0, 3);
}

export function careerStageFourProgress(save: CareerState): CareerStageFourProgress {
  const done = [has(save, EP10_DONE), has(save, EP11_DONE), has(save, STAGE4_DONE)];
  const titles = ['失败文件不是垃圾', 'Remix 自己', '第一次把方法教给别人'];
  let previousDone = true;
  const quests = titles.map((title, index) => {
    const questDone = done[index];
    const active = previousDone && !questDone;
    previousDone = previousDone && questDone;
    return { id: `stage4-${index + 1}`, title, done: questDone, active };
  });
  const completed = done.filter(Boolean).length;
  return { quests, completed, total: 3, complete: completed === 3 };
}

export function careerStageFourScene(save: CareerState): CareerScene {
  const progress = careerStageFourProgress(save);
  if (progress.complete) {
    const set = save.careerMethodSet;
    return {
      id: 'stage4-complete', kicker: 'STAGE 4 / METHOD SET', title: '你第一次拥有的不是“更高等级”，而是一套能被复用、修改、教给别人的方法。',
      body: [
        set?.title ? `这一阶段留下的方法组叫《${set.title}》：${(set.methods || []).join('；')}。` : '失败、现场分支、交接和教学已经被连成一组可复用方法。',
        '真正的变化是：下一次遇到类似环境，系统不再只问“你会不会”，而会把已有方法作为可调用、可修改、也可能失效的历史。'
      ],
      note: '下一阶段是 INFRA：当这些方法开始被空间、团队、设备和公开计划长期维护，你的角色会从“做项目的人”扩展成“维护一套世界的人”。',
      choices: [],
      optionalWorkbench: 'Blueprint 谱系已经进入 Career Archive；它记录 parent / mutation / test，不是背包里的物品。'
    };
  }

  if (!has(save, EP10_DONE)) {
    if (!hasPrefix(save, 'stage4:ep10:source:')) {
      const salvage = special('evt-project-salvage');
      return {
        id: 'stage4-salvage-source', kicker: 'EPISODE 10 / SIGNATURE EVENT', title: salvage?.title || '失败项目可以拆',
        body: [
          salvage?.hook || '预算已经救不回来了，但项目留下的材料、节点和文档仍然可以有第二次生命。',
          'M 让你别先整理“最好看的东西”。先挑一个最像废料的部分：它必须已经发生过，而且当时确实让你不舒服。'
        ],
        choices: [
          { id: 'story:stage4:source-recovery', title: '拆黑盒里的故障与恢复', detail: '保留基线、故障点、绕过、恢复顺序。看它能不能脱离原项目，变成一种创作规则。', cost: '注意力 -1 · 现场失败', kind: 'build' },
          { id: 'story:stage4:source-live-branch', title: '拆 final_final_v7_REAL 的现场分支', detail: '不把错误版本删掉。保留它为什么出现、现场改了什么，以及它和主版本的差异。', cost: '注意力 -1 · 版本分支', kind: 'build' },
          { id: 'story:stage4:source-public', title: '拆 Open Call 与传播误读留下的一页版本', detail: '看看项目在“被别人理解”时发生的压缩、遗漏和意外解释能不能成为材料。', cost: '注意力 -1 · 公开文本 / 误读', kind: 'build' }
        ]
      };
    }

    return {
      id: 'stage4-salvage-output', kicker: 'SALVAGE / WHAT SURVIVES', title: `从「${sourceLabel(save)}」里，你到底要留下什么？`,
      body: [
        '“回收失败”不等于给失败加一个浪漫标题。你必须决定它以后以什么形式真正参与新的工作。',
        '可以留下一个方法、一个可调用的素材 / 模板，也可以承认它只值得被完整归档，不强迫它继续生产。'
      ],
      choices: [
        { id: 'story:stage4:salvage-method', title: '提取一条方法：以后遇到类似条件可以直接调用', detail: '把具体事件抽成前提、动作、证据、后果，不依赖当时那台设备。', cost: '注意力 -1 · Method', kind: 'build' },
        { id: 'story:stage4:salvage-asset', title: '提取一个可重新组合的片段 / 模板', detail: '它仍然保留来源，但可以作为下一张工作图或新项目的 parent material。', cost: '注意力 -1 · Reusable fragment', kind: 'build' },
        { id: 'story:stage4:salvage-archive', title: '不复用。完整归档这次失败', detail: '不是所有东西都必须提高生产力。保留空洞、上下文和为什么当时没有解决。', cost: '注意力 0 · Archive', kind: 'commitment' }
      ]
    };
  }

  if (!has(save, EP11_DONE)) {
    if (!hasPrefix(save, 'stage4:ep11:parent:')) {
      return {
        id: 'stage4-remix-parent', kicker: 'EPISODE 11 / PARENT', title: 'Remix 自己之前，先承认哪些东西已经是你的旧项目。',
        body: [
          '旧项目第一次不再只是作品列表，而像一个可以被 fork 的仓库。',
          '你要选一个 parent。它不会被覆盖；后面所有变化都必须说清楚“保留了什么、改了什么”。'
        ],
        choices: [
          { id: 'story:stage4:parent-feedback', title: 'Parent：最小反馈系统', detail: '保留“输入改变规则，规则改变反馈”的核心关系。', cost: '注意力 -1 · System rule', kind: 'build' },
          { id: 'story:stage4:parent-recovery', title: 'Parent：现场恢复链', detail: '保留“基线 → 故障 → 证据 → 恢复”的时间结构。', cost: '注意力 -1 · Field method', kind: 'build' },
          { id: 'story:stage4:parent-handoff', title: 'Parent：一页项目 / 交接接口', detail: '保留“让另一个人理解和接手”的传递结构。', cost: '注意力 -1 · Handoff', kind: 'build' }
        ]
      };
    }

    if (!hasPrefix(save, 'stage4:ep11:mutation:')) {
      return {
        id: 'stage4-remix-mutation', kicker: 'REMIX / MUTATION', title: `Parent 是「${parentLabel(save)}」。现在只允许改一个核心变量。`,
        body: [
          '如果输入、输出、规则、空间和叙事全部一起换掉，你只是在做另一个项目。',
          '这次 Remix 要故意保持一部分不动，这样 lineage 才有意义。'
        ],
        choices: [
          { id: 'story:stage4:mutate-input', title: '保留规则，只换输入', detail: '例如把鼠标 / 音频换成空间扫描、传感器或旧媒介信号。看同一规则如何被新输入扭曲。', cost: '注意力 -1 · INPUT mutation', kind: 'build' },
          { id: 'story:stage4:mutate-context', title: '保留核心系统，只换输出与观看环境', detail: '从单屏换到现场 / 多输出 / 在线，让环境重新决定可用动作。', cost: '注意力 -1 · CONTEXT mutation', kind: 'route' },
          { id: 'story:stage4:mutate-failure', title: '把原来的“故障条件”反过来当成触发规则', detail: '不修掉失败，而是让掉帧、丢信号、版本差异成为系统进入下一状态的条件。', cost: '注意力 -1 · FAILURE mutation', kind: 'build' }
        ],
        optionalWorkbench: 'Hybrid / Blueprint 路径在这里可以直接打开工作图生成 Remix 分支；纯叙事路径用同样的 parent / mutation 数据继续。'
      };
    }

    return {
      id: 'stage4-remix-test', kicker: 'TEST / BRANCH', title: '新分支不能只存在在“想法上”。把它放进一个不同条件里。',
      body: [
        '林问得很简单：这个分支和 parent 相比，除了“更新了”，到底哪里真的不一样？',
        '测试必须留下差异证据。成功、失败都可以，但不能只写“感觉更完整”。'
      ],
      choices: [
        { id: 'story:stage4:remix-test-peer', title: '先给林看 parent 与 branch 的并排版本', detail: '让同行只指出“哪条关系真的变了”，不做整体评价。', cost: '注意力 -1 · Peer diff', kind: 'route' },
        { id: 'story:stage4:remix-test-field', title: '把 branch 放回一次真实现场测试', detail: '环境会再次过滤动作，看新分支是否真的继承了旧方法。', cost: '注意力 -2 · Field diff', kind: 'route' },
        { id: 'story:stage4:remix-test-archive', title: '用旧 Evidence 回放 parent，再对照 branch', detail: '不去新场地，用已有记录检查“这次改变会不会只是忘了上次发生过什么”。', cost: '注意力 -1 · Evidence diff', kind: 'build' }
      ]
    };
  }

  if (!hasPrefix(save, 'stage4:ep12:teach:')) {
    return {
      id: 'stage4-teach-pick', kicker: 'EPISODE 12 / TEACH', title: '第一次教方法时，你会发现自己其实省略了很多步骤。',
      body: [
        '乔问你愿不愿意做一个很小的公开工作坊；M 可以帮你记录。不要讲“新媒体艺术是什么”，只教一件你真的做过、而且别人能在现场复现的事。',
        '系统只给你前三阶段已经留下的方法，不允许凭空解锁一门课。'
      ],
      choices: teachChoices(save)
    };
  }

  return {
    id: 'stage4-teach-assumption', kicker: 'HUMAN / HIDDEN ASSUMPTION', title: '对方照着你的步骤做，还是失败了。问题出在你没写出来的那一层。',
    body: [
      '你第一次清楚看见：所谓“我平常就是这么做的”，里面藏着环境前提、熟练动作、命名习惯和默认工具。',
      '教学不是证明你会，而是决定如何处理这条隐性前提。'
    ],
    choices: [
      { id: 'story:stage4:teach-prereq', title: '把环境前提写进方法：什么条件下它才成立', detail: '不再把特定空间、接口或时间窗口假装成普遍条件。', cost: '注意力 -1 · Prerequisite document', kind: 'commitment' },
      { id: 'story:stage4:teach-simplify', title: '删掉一层依赖，让方法更容易被复现', detail: '牺牲一部分复杂度，换取别人可以独立完成。', cost: '注意力 -1 · Simplified method', kind: 'build' },
      { id: 'story:stage4:teach-fork', title: '允许对方改写方法，保留 parent 和 fork', detail: '不要求复制你的最终结果，只要求改动和原因被记录。', cost: '注意力 -1 · Method fork', kind: 'route' }
    ]
  };
}

function salvageKind(save: CareerState) {
  if (hasPrefix(save, 'stage4:ep10:source:recovery')) return 'recovery';
  if (hasPrefix(save, 'stage4:ep10:source:live-branch')) return 'live-branch';
  return 'public-reading';
}

function parentKind(save: CareerState) {
  if (hasPrefix(save, 'stage4:ep11:parent:feedback')) return 'feedback-system';
  if (hasPrefix(save, 'stage4:ep11:parent:recovery')) return 'field-recovery';
  return 'handoff-interface';
}

function mutationKind(save: CareerState) {
  if (hasPrefix(save, 'stage4:ep11:mutation:input')) return 'input';
  if (hasPrefix(save, 'stage4:ep11:mutation:context')) return 'context';
  return 'failure-as-trigger';
}

function chosenTeaching(save: CareerState) {
  if (hasPrefix(save, 'stage4:ep12:teach:recovery')) return 'recovery-rehearsal';
  if (hasPrefix(save, 'stage4:ep12:teach:scope')) return 'scope-translation';
  if (hasPrefix(save, 'stage4:ep12:teach:one-page')) return 'one-page-project';
  return 'version-lineage';
}

function methodSet(save: CareerState) {
  const methods = strings(save, 'methodIds');
  const selected = [
    methods.find((id) => /recovery|diagnose/.test(id)),
    methods.find((id) => /scope|brief|commission/.test(id)),
    methods.find((id) => /one-page|lineage|handoff/.test(id)),
    methods.find((id) => /teach|prereq|fork|simplified/.test(id))
  ].filter(Boolean);
  return {
    id: `method-set-${save.week || 1}`,
    title: '从现场回来以后',
    methods: [...new Set(selected)],
    sourceStages: ['stage-1', 'stage-2', 'stage-3', 'stage-4']
  };
}

export function applyCareerStageFourCommand(save: CareerState, commandId: string): CareerStageFourCommandResult {
  let next: CareerState | null = save;
  let notice = { title: '没有发生', text: '当前资源或注意力不足。' };

  if (commandId === 'story:stage4:enter') {
    next = nextWeek(save, '别人已经开始因为具体方法找你；现在你第一次回头整理这些方法从哪里来。');
    next = { ...next, careerStageId: 'stage-4', careerEpisodeId: 'ep-10-failure-is-material' };
    next = addEvidence(next, 'stage4:entered');
    next = discover(next, 'contact-m');
    next = message(next, 'contact-m', '别先整理代表作。把这几年最像废料的失败、错误版本和没被选上的材料列出来。方法通常藏在那里。');
    next = log(next, '进入 Stage 4：方法', '旧项目、失败与版本第一次作为可复用 parent material 被重新打开。');
    return { save: next, notice: { title: '方法阶段开始', text: '先选一件最不像“成果”的旧材料。' } };
  }

  switch (commandId) {
    case 'story:stage4:source-recovery':
      next = spend(save, 1, 0); if (next) next = addEvidence(next, 'stage4:ep10:source:recovery');
      notice = { title: '故障历史被选为材料', text: '恢复过程将被拆开，而不是只保留“最后修好了”。' }; break;
    case 'story:stage4:source-live-branch':
      next = spend(save, 1, 0); if (next) next = addEvidence(next, 'stage4:ep10:source:live-branch');
      notice = { title: '错误版本没有被删除', text: '现场分支开始成为可追溯的 parent material。' }; break;
    case 'story:stage4:source-public':
      next = spend(save, 1, 0); if (next) next = addEvidence(next, 'stage4:ep10:source:public-reading');
      notice = { title: '公开版本与误读被选为材料', text: '被别人理解时发生的压缩也进入创作历史。' }; break;

    case 'story:stage4:salvage-method':
      next = spend(save, 1, 0);
      if (next) {
        next = addMethod(next, `method-salvaged-${salvageKind(next)}`);
        next = { ...next, salvagedAssets: [...array(next, 'salvagedAssets'), { id: `salvage-${next.week}-method`, source: salvageKind(next), kind: 'method', lineage: true }] };
        next = markEvent(next, 'evt-project-salvage'); next = addEvidence(next, 'stage4:ep10:salvage:method'); next = addEvidence(next, EP10_DONE);
        next = { ...next, careerEpisodeId: 'ep-11-remix-yourself' }; next = nextWeek(next, '失败被提取成一条以后能直接调用的方法。');
      }
      notice = { title: '失败被转成方法', text: '来源仍然保留，抽象出来的规则开始可以跨项目使用。' }; break;
    case 'story:stage4:salvage-asset':
      next = spend(save, 1, 0);
      if (next) {
        next = { ...next, salvagedAssets: [...array(next, 'salvagedAssets'), { id: `salvage-${next.week}-fragment`, source: salvageKind(next), kind: 'fragment', lineage: true }] };
        next = markEvent(next, 'evt-project-salvage'); next = addEvidence(next, 'stage4:ep10:salvage:asset'); next = addEvidence(next, EP10_DONE);
        next = { ...next, careerEpisodeId: 'ep-11-remix-yourself' }; next = nextWeek(next, '一个失败片段被保留为可重新组合的 parent material。');
      }
      notice = { title: '失败片段进入资源谱系', text: '它不是库存道具，而是带来源的可复用片段。' }; break;
    case 'story:stage4:salvage-archive':
      next = markEvent(save, 'evt-project-salvage'); next = addEvidence(next, 'stage4:ep10:salvage:archive'); next = addEvidence(next, EP10_DONE);
      next = { ...next, careerEpisodeId: 'ep-11-remix-yourself' }; next = nextWeek(next, '这次失败被完整归档，没有被强迫继续生产。');
      notice = { title: '不是所有失败都需要“变废为宝”', text: '空洞和上下文被完整留下。' }; break;

    case 'story:stage4:parent-feedback':
      next = spend(save, 1, 0); if (next) next = addEvidence(next, 'stage4:ep11:parent:feedback');
      notice = { title: 'Parent 锁定：最小反馈系统', text: '输入—规则—反馈的关系会被保留。' }; break;
    case 'story:stage4:parent-recovery':
      next = spend(save, 1, 0); if (next) next = addEvidence(next, 'stage4:ep11:parent:recovery');
      notice = { title: 'Parent 锁定：现场恢复链', text: '基线—故障—证据—恢复的时间关系会被保留。' }; break;
    case 'story:stage4:parent-handoff':
      next = spend(save, 1, 0); if (next) next = addEvidence(next, 'stage4:ep11:parent:handoff');
      notice = { title: 'Parent 锁定：交接接口', text: '让另一个人理解和接手的结构会被保留。' }; break;

    case 'story:stage4:mutate-input':
      next = spend(save, 1, 0); if (next) next = addEvidence(next, 'stage4:ep11:mutation:input');
      notice = { title: '只换输入', text: '规则保持不动，新的输入开始检验旧系统。' }; break;
    case 'story:stage4:mutate-context':
      next = spend(save, 1, 0); if (next) next = addEvidence(next, 'stage4:ep11:mutation:context');
      notice = { title: '只换环境与输出', text: '同一系统被迫重新面对环境条件。' }; break;
    case 'story:stage4:mutate-failure':
      next = spend(save, 1, 0); if (next) { next = addEvidence(next, 'stage4:ep11:mutation:failure'); next = addMethod(next, 'method-failure-as-trigger'); }
      notice = { title: '故障从异常变成规则', text: '原本需要被修掉的状态成为新分支的触发条件。' }; break;

    case 'story:stage4:remix-test-peer':
    case 'story:stage4:remix-test-field':
    case 'story:stage4:remix-test-archive': {
      const cost = commandId.endsWith('field') ? 2 : 1;
      next = spend(save, cost, 0);
      if (next) {
        const test = commandId.split(':').at(-1);
        const branch = { id: `career-branch-${next.week}-${array(next, 'careerRemixBranches').length + 1}`, parent: parentKind(next), mutation: mutationKind(next), test, createdWeek: next.week };
        next = { ...next, careerRemixBranches: [...array(next, 'careerRemixBranches'), branch] };
        next = addEvidence(next, `stage4:ep11:test:${test}`); next = addEvidence(next, EP11_DONE); next = addMethod(next, 'method-explicit-project-lineage');
        next = discover(next, 'contact-lin'); next = message(next, 'contact-lin', `这个 branch 我能看出来和 parent 的差异了。你保留的是 ${branch.parent}，真正改的是 ${branch.mutation}。`);
        next = { ...next, careerEpisodeId: 'ep-12-teach-a-method' }; next = nextWeek(next, '第一个带 parent / mutation / test 的职业分支被完整记录。');
      }
      notice = { title: 'Remix 不再只是“新版本”', text: 'parent、改动和测试条件都进入谱系。' }; break;
    }

    case 'story:stage4:teach-recovery':
      next = spend(save, 1, 0); if (next) next = addEvidence(next, 'stage4:ep12:teach:recovery');
      notice = { title: '选择教学：恢复演练', text: '别人将尝试故意制造失败并独立恢复。' }; break;
    case 'story:stage4:teach-scope':
      next = spend(save, 1, 0); if (next) next = addEvidence(next, 'stage4:ep12:teach:scope');
      notice = { title: '选择教学：Scope 翻译', text: '别人将用你的框架拆一份真实 Brief。' }; break;
    case 'story:stage4:teach-one-page':
      next = spend(save, 1, 0); if (next) next = addEvidence(next, 'stage4:ep12:teach:one-page');
      notice = { title: '选择教学：一页项目', text: '别人必须真正删除内容，而不是缩小字号。' }; break;
    case 'story:stage4:teach-lineage':
      next = spend(save, 1, 0); if (next) next = addEvidence(next, 'stage4:ep12:teach:lineage');
      notice = { title: '选择教学：版本谱系', text: '别人会从 parent 建一个能说明改动原因的 fork。' }; break;

    case 'story:stage4:teach-prereq':
      next = spend(save, 1, 0);
      if (next) { next = addMethod(next, 'method-document-prerequisites'); next = addEvidence(next, 'stage4:ep12:assumption:prerequisite'); next = addEvidence(next, STAGE4_DONE); }
      notice = { title: '隐性前提被写出来', text: '方法第一次明确说明“在什么条件下才成立”。' }; break;
    case 'story:stage4:teach-simplify':
      next = spend(save, 1, 0);
      if (next) { next = addMethod(next, 'method-simplify-for-reproduction'); next = addEvidence(next, 'stage4:ep12:assumption:simplified'); next = addEvidence(next, STAGE4_DONE); }
      notice = { title: '方法被删掉一层依赖', text: '别人能够独立完成，复杂度不再是熟练度的保护壳。' }; break;
    case 'story:stage4:teach-fork':
      next = spend(save, 1, 0);
      if (next) { next = addMethod(next, 'method-teachable-fork'); next = addEvidence(next, 'stage4:ep12:assumption:fork'); next = addEvidence(next, STAGE4_DONE); }
      notice = { title: '方法允许被别人改写', text: '复现不再要求复制结果，只要求 parent、改动与原因可追溯。' }; break;
    default:
      return { save, notice };
  }

  if (!next) return { save, notice };
  if (has(next, STAGE4_DONE)) {
    next = discover(next, 'contact-m');
    next = message(next, 'contact-m', `你教的其实不是 ${chosenTeaching(next)} 本身，是怎么把隐性前提暴露出来。这个值得单独归档。`);
    next = { ...next, careerMethodSet: methodSet(next) };
    next = log(next, 'Stage 4 归档', `方法组《${next.careerMethodSet.title}》生成：${next.careerMethodSet.methods.join('；')}。`, '记录');
  } else {
    next = log(next, notice.title, notice.text);
  }
  return { save: next, notice };
}
