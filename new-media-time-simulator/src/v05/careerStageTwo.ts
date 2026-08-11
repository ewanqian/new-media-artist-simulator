import { careerSpecialEvents } from './careerContent.ts';
import { contactById } from './legacyDeck.ts';
import type { CareerScene } from './careerStageOne.ts';

type CareerState = Record<string, any>;

export type CareerStageTwoProgress = {
  quests: { id: string; title: string; done: boolean; active: boolean }[];
  completed: number;
  total: number;
  complete: boolean;
};

export type CareerStageCommandResult = {
  save: CareerState;
  notice: { title: string; text: string };
};

const EP4_DONE = 'stage2:ep4:complete';
const EP5_DONE = 'stage2:ep5:complete';
const STAGE2_DONE = 'career:stage-2:complete';

function evidence(save: CareerState) { return new Set<string>(save.evidenceIds || []); }
function hasEvidence(save: CareerState, id: string) { return evidence(save).has(id); }
function hasPrefix(save: CareerState, prefix: string) { return (save.evidenceIds || []).some((id: string) => id.startsWith(prefix)); }

function specialEvent(id: string) {
  return careerSpecialEvents.find((event) => event.id === id);
}

export function stageTwoSetupEventId(save: CareerState) {
  return Number(save.workbench?.output || 1) >= 2 ? 'evt-multiscreen-drift' : 'evt-scope-plus-one';
}

export function careerStageTwoProgress(save: CareerState): CareerStageTwoProgress {
  const done = [hasEvidence(save, EP4_DONE), hasEvidence(save, EP5_DONE), hasEvidence(save, STAGE2_DONE)];
  const titles = ['两小时黑盒', '六小时搭建窗口', '凌晨后的故障恢复'];
  let previousDone = true;
  const quests = titles.map((title, index) => {
    const questDone = done[index];
    const active = previousDone && !questDone;
    previousDone = previousDone && questDone;
    return { id: `stage2-${index + 1}`, title, done: questDone, active };
  });
  const completed = done.filter(Boolean).length;
  return { quests, completed, total: 3, complete: completed === 3 };
}

function openIssues(save: CareerState) {
  const resolved = new Set<string>(save.resolvedIssueIds || []);
  return (save.revealedIssueIds || []).filter((id: string) => !resolved.has(id));
}

export function careerStageTwoScene(save: CareerState): CareerScene {
  const progress = careerStageTwoProgress(save);
  if (progress.complete) {
    return {
      id: 'stage2-complete', kicker: 'STAGE 2 / ARCHIVED', title: '现在你知道“现场经验”不是去过多少场地。',
      body: [
        '它是你已经能提前看到哪些地方会坏、哪些信息必须在进场前拿到、什么时候应该降低复杂度，以及出了问题以后怎样让另一个人也能重复你的恢复过程。',
        '第二份阶段档案已经把测试目标、搭建责任、特殊事件、版本差异和恢复方法串到同一个项目历史里。'
      ],
      note: '下一阶段是 NETWORK：机会、委托、Open Call、关系与 Scope 会开始因为你已经做过的具体事情回来找你。',
      choices: [],
      optionalWorkbench: 'Stage 2 留下的现场 Note、方法、人物与制作债务都会继续进入后续生涯。'
    };
  }

  if (!hasEvidence(save, EP4_DONE)) {
    if (!hasPrefix(save, 'stage2:ep4:goal:')) {
      const event = specialEvent('evt-two-hour-gap');
      return {
        id: 'stage2-two-hour-goal', kicker: 'EPISODE 04 / TWO-HOUR SLOT', title: '两小时只够验证一个问题。你测什么？',
        body: [
          event?.hook || '一个场地今晚突然空两小时。条件一般，但足够验证一个真正重要的问题。',
          '李技术已经把“来不来”变成了更具体的问题：如果两个小时以后只能带走一个结论，你最需要知道哪件事？'
        ],
        choices: [
          { id: 'story:stage2:goal-recovery', title: '验证：系统坏掉以后能不能恢复', detail: '不追求完整效果。故意让一条链路断掉，再看恢复到底依赖记忆、运气还是可重复步骤。', cost: 'TEST GOAL · 恢复路径', kind: 'build' },
          { id: 'story:stage2:goal-space', title: '验证：真实尺寸会不会改变观看', detail: '把桌面画面放大到真实输出，确认距离、亮度、构图和身体路线是不是还成立。', cost: 'TEST GOAL · 场地适配', kind: 'route' },
          { id: 'story:stage2:goal-delivery', title: '验证：最小交付链能不能被别人接手', detail: '让李技术只看技术单和文件，不靠你口头补充，看看另一个人能不能把它跑起来。', cost: 'TEST GOAL · 交接 / 文档', kind: 'commitment' }
        ]
      };
    }
    if (!hasPrefix(save, 'stage2:ep4:kit:')) {
      return {
        id: 'stage2-two-hour-kit', kicker: 'PREPARE / WHAT TO BRING', title: '时间短的时候，“带齐所有东西”也可能是一种失误。',
        body: [
          '你已经选了测试目标。现在决定什么进入现场。每多带一层设备，就多一层连接、运输和故障可能；但少带错一样，也可能让这两小时彻底失效。'
        ],
        choices: [
          { id: 'story:stage2:kit-minimal', title: '只带能验证目标的最小套件', detail: '把所有“也许有用”删掉。明确输入、处理、输出、备份四件事。', cost: '注意力 -1 · 解锁最小测试套件方法', kind: 'build' },
          { id: 'story:stage2:kit-everything', title: '把所有可能有用的东西都带上', detail: '你不想因为少一根线浪费档期，但运输和现场判断都会变得更重。', cost: '注意力 -1 · ¥120 · 新增物流负担 Thread', kind: 'commitment' },
          { id: 'story:stage2:kit-prestage', title: '先让李技术把接口和转接器拍给你', detail: '少带设备，先用信息消除不确定性。你为一套预留转接付一点成本。', cost: '注意力 -1 · ¥100 · 李技术 / 信息可靠度', kind: 'commitment' }
        ]
      };
    }
    return {
      id: 'stage2-two-hour-run', kicker: 'BLACKBOX / TEST', title: '灯亮了。现在别把两小时变成一次小型演出。',
      body: [
        '真正的诱惑是“既然都来了，不如把效果再做完整一点”。但你的测试目标仍然只有一个。',
        '你可以做一次有纪律的基线测试，也可以让系统尽量接近真实公开状态，或者只打最危险的一条链路。三种都会留下不同的现场证据。'
      ],
      choices: [
        { id: 'story:stage2:run-baseline', title: '建立基线，然后故意让一条链路失败', detail: '记录正常状态，再制造一次可控失败。重点是恢复过程，而不是“这次没坏”。', cost: '注意力 -2 · 稳定性 +1 · 恢复演练方法', kind: 'build' },
        { id: 'story:stage2:run-full', title: '尽量接近真实公开状态连续运行', detail: '把环境压力开到更接近真实使用，换取更有效的场地适配证据，也更容易暴露漂移。', cost: '注意力 -2 · 场地适配 +1 · 可能新增运行漂移', kind: 'build' },
        { id: 'story:stage2:run-risk', title: '只打最危险的一条链路', detail: '把两小时全部用在当前最不确定的环节上，其余部分明确不测。', cost: '注意力 -1 · 项目判断 +1', kind: 'commitment' }
      ]
    };
  }

  if (!hasEvidence(save, EP5_DONE)) {
    if (!hasPrefix(save, 'stage2:ep5:plan:')) {
      return {
        id: 'stage2-six-hour-plan', kicker: 'EPISODE 05 / SIX-HOUR BUILD', title: '六小时搭建窗口里，最先堵住的往往不是技术。',
        body: [
          '屏幕、灯光、播控、网络、结构、运输、记录同时发生。你第一次需要决定：谁等谁，什么信息在哪个接口交接，哪些事不能全部经过你一个人。',
          '李技术、戴和 M 都在。你怎么组织这六小时，会直接决定后面的特殊事件有多难处理。'
        ],
        choices: [
          { id: 'story:stage2:plan-interfaces', title: '按接口拆责任：信号 / 结构 / 记录', detail: '每个人负责明确输出，只有接口变化才需要重新同步。你保留最终取舍权。', cost: '注意力 -1 · 交接清晰', kind: 'commitment' },
          { id: 'story:stage2:plan-centralize', title: '所有关键决定都先过你', detail: '短期看起来最可控，但别人会开始等你的回答，现场形成单点瓶颈。', cost: '注意力 -2 · 新增搭建瓶颈 Thread', kind: 'commitment' },
          { id: 'story:stage2:plan-visual-first', title: '先把效果做出来，文档和交接最后补', detail: '开场画面可能更早完整，但过程证据和恢复信息会被压到最危险的时间段。', cost: '注意力 -1 · 新增记录债务', kind: 'build' }
        ]
      };
    }

    if (!hasPrefix(save, 'stage2:ep5:event:')) {
      const eventId = stageTwoSetupEventId(save);
      const event = specialEvent(eventId);
      if (eventId === 'evt-multiscreen-drift') {
        return {
          id: 'stage2-event-sync', kicker: 'SPECIAL EVENT / CONTEXTUAL', title: event?.title || '第三块屏慢了半拍',
          body: [
            event?.hook || '多输出在桌面上完全同步，到了现场却开始漂。',
            '这是条件事件：只有当前输出能力真的进入多输出区间，它才进入事件池。现在你必须在时钟、Scope 和人工维护之间做取舍。'
          ],
          choices: [
            { id: 'story:stage2:event-sync-clock', title: '花钱统一时钟 / 播控', detail: '增加一点现场成本，换掉最难靠肉眼维护的同步不确定性。', cost: '注意力 -1 · ¥300 · 解锁同步时钟方法', kind: 'build' },
            { id: 'story:stage2:event-sync-degrade', title: '把第二输出改成允许异步的内容', detail: '不再追求逐帧同步，把差异转成编排的一部分。', cost: '注意力 -1 · Scope 适配 · 异步输出方法', kind: 'commitment' },
            { id: 'story:stage2:event-sync-manual', title: '继续人工对齐，先把今晚撑过去', detail: '不额外花钱，但你会留下一条以后仍然会回来的同步制作债务。', cost: '注意力 -2 · 新增同步漂移 Thread', kind: 'commitment' }
          ]
        };
      }
      return {
        id: 'stage2-event-scope', kicker: 'SPECIAL EVENT / UNIVERSAL', title: event?.title || '“顺便再加一个”',
        body: [
          event?.hook || '报价确认后，对方突然发现“其实也不复杂”，只想顺便再加一个功能。',
          '这个事件不依赖媒介，很多生涯都会遇到。真正的玩法不是“商业值 ±2”，而是新需求到底挤掉什么、由谁承担、会不会成为以后反复出现的承诺。'
        ],
        choices: [
          { id: 'story:stage2:event-scope-swap', title: '可以加，但必须换掉一个原需求', detail: '总 Scope 不增长。让新增内容以一次明确取舍进入项目。', cost: '注意力 -1 · Scope 适配', kind: 'commitment' },
          { id: 'story:stage2:event-scope-accept', title: '这次先直接加进去', detail: '现场关系最轻松，但项目留下一个没有重新报价和排期的 Scope creep。', cost: '注意力 -1 · 新增 Scope Thread', kind: 'commitment' },
          { id: 'story:stage2:event-scope-boundary', title: '写清楚：这次交付不包含它', detail: '不靠情绪拒绝，把边界写进可交接的信息里。', cost: '注意力 -1 · 解锁 Scope 边界方法', kind: 'commitment' }
        ]
      };
    }

    return {
      id: 'stage2-six-hour-handoff', kicker: 'DOCUMENT / HANDOFF', title: '开场前最后四十分钟，你还要不要记录？',
      body: [
        '画面已经能看了。现在最容易被牺牲的是安装图、尺寸、线序、版本和失败截图。',
        'M 问你要拍什么；戴准备离场；李技术只想确认如果明天不是他值班，另一个人能不能接手。'
      ],
      choices: [
        { id: 'story:stage2:handoff-three', title: '同时留下：安装 / 尺寸 / 信号三份最小记录', detail: '不做完整宣传文档，只留下下一次恢复真正会用到的三种证据。', cost: '注意力 -1 · 文档 +2 · 三人共享证据', kind: 'commitment' },
        { id: 'story:stage2:handoff-later', title: '自己结束后再补成一份文档', detail: '保留核心信息，但失去一部分现场过程和别人视角。', cost: '注意力 -1 · 文档 +1 · 新增过程缺口', kind: 'commitment' },
        { id: 'story:stage2:handoff-final-only', title: '只拍最终效果，先保证开场', detail: '当晚最省注意力，但恢复路径和安装历史会留下永久空洞。', cost: '注意力 0 · 新增档案空洞 Thread', kind: 'commitment' }
      ]
    };
  }

  if (!hasPrefix(save, 'stage2:ep6:version:')) {
    const event = specialEvent('evt-final-final-v7');
    return {
      id: 'stage2-midnight-version', kicker: 'EPISODE 06 / SPECIAL EVENT', title: event?.title || 'final_final_v7_REAL',
      body: [
        event?.hook || '你发现现场真正运行的不是你以为的最终版。',
        '已经过了午夜。最危险的不是文件名可笑，而是现场、你的电脑和档案现在各自相信不同版本才是真的。你必须决定怎么把“版本差异”本身处理掉。'
      ],
      choices: [
        { id: 'story:stage2:version-rollback', title: '对版本信息，回滚到最后一个已知可运行版', detail: '先恢复确定性，再讨论今天新增的改动。', cost: '注意力 -1 · 稳定性 +1 · 版本锁定方法', kind: 'build' },
        { id: 'story:stage2:version-hotfix', title: '直接在现场正在跑的版本上补丁', detail: '最快，但这份现场版会变成一条新的制作债务，之后必须重新并回主线。', cost: '注意力 -1 · 新增 Hotfix Thread', kind: 'commitment' },
        { id: 'story:stage2:version-branch', title: '承认它已经变成分支，先完整记录差异', detail: '不强行宣布谁才是“真最终版”，把现场差异作为 lineage 留下来。', cost: '注意力 -1 · 文档 +1 · Live Branch 方法', kind: 'commitment' }
      ]
    };
  }

  if (!hasPrefix(save, 'stage2:ep6:recovery:')) {
    const issueCount = openIssues(save).length;
    return {
      id: 'stage2-midnight-recovery', kicker: 'RECOVERY / AFTER MIDNIGHT', title: '现在没有“完美修复”，只有你愿意留下哪种后果。',
      body: [
        `当前还有 ${issueCount} 条未解决制作问题。你不需要今晚把所有历史债务清零，但必须留下一个别人以后能理解的恢复路径。`,
        '恢复可以靠 Evidence、靠临时绕过，也可以靠主动降级。三种都能让项目继续，但下一阶段会记得你是怎么处理的。'
      ],
      choices: [
        { id: 'story:stage2:recover-evidence', title: '沿这两周留下的 Evidence 逐段恢复', detail: '用安装、版本和测试记录定位问题，解决一条真实 Thread。', cost: '注意力 -1 · 解决一条 Thread · Evidence 恢复方法', kind: 'build' },
        { id: 'story:stage2:recover-bypass', title: '临时绕过故障点，保证明天还能运行', detail: '解决眼前问题，同时明确新增一条“临时绕过”债务，不把它假装成永久修复。', cost: '注意力 -1 · Scope 适配 · 新增 Bypass Thread', kind: 'commitment' },
        { id: 'story:stage2:recover-degrade', title: '主动降级到更可靠的输出', detail: '减少一个脆弱环节，让核心项目关系继续成立。', cost: '注意力 -1 · Scope 适配 · 降级恢复方法', kind: 'commitment' }
      ]
    };
  }

  return {
    id: 'stage2-field-archive', kicker: 'RECORDS / FIELD ARCHIVE', title: '把“现场经验”变成以后真的会改变选择的东西。',
    body: [
      '如果这几周最后只剩三张漂亮现场照，第二阶段就等于没有发生。',
      '你需要决定这次现场历史以什么形式进入 Records。它会影响后面遇到委托、机构和团队时，系统怎样解释你已经会什么。'
    ],
    choices: [
      { id: 'story:stage2:archive-full', title: '完整保留：测试目标 + 安装 + 故障 + 恢复', detail: '信息最多，也最适合以后复盘和交接。', cost: '注意力 -1 · 文档 +1 · 完整现场方法组', kind: 'commitment' },
      { id: 'story:stage2:archive-repro', title: '只保“怎样重新搭起来”的最小复现包', detail: '减少叙事材料，优先保证另一个人能重新运行。', cost: '注意力 0 · 可复现包方法', kind: 'commitment' },
      { id: 'story:stage2:archive-lineage', title: '把现场差异和 Hotfix 全部作为版本分支保留', detail: '不清理成一个干净故事，让版本谱系本身成为方法。', cost: '注意力 0 · Blueprint / 版本谱系证据', kind: 'commitment' }
    ]
  };
}

function addUnique(list: string[] = [], value: string) {
  return list.includes(value) ? list : [...list, value];
}

function addEvidence(save: CareerState, id: string): CareerState {
  return { ...save, evidenceIds: addUnique(save.evidenceIds || [], id) };
}

function addMethod(save: CareerState, id: string): CareerState {
  return { ...save, methodIds: addUnique(save.methodIds || [], id) };
}

function addIssue(save: CareerState, id: string): CareerState {
  return { ...save, revealedIssueIds: addUnique(save.revealedIssueIds || [], id) };
}

function resolveFirstIssue(save: CareerState): CareerState {
  const current = openIssues(save)[0];
  if (!current) return save;
  return { ...save, resolvedIssueIds: addUnique(save.resolvedIssueIds || [], current) };
}

function discover(save: CareerState, id: string): CareerState {
  const discovered = addUnique(save.discoveredContactIds || [], id);
  const threads = { ...(save.contactThreads || {}) };
  if (!threads[id]) threads[id] = contactById(id)?.openingMessages || [];
  return { ...save, discoveredContactIds: discovered, contactThreads: threads };
}

function addMessage(save: CareerState, id: string, text: string): CareerState {
  let next = discover(save, id);
  next = { ...next, contactThreads: { ...next.contactThreads, [id]: [...(next.contactThreads[id] || []), { from: 'them', text }] } };
  return next;
}

function markEvent(save: CareerState, id: string): CareerState {
  return { ...save, seenEventIds: addUnique(save.seenEventIds || [], id) };
}

function log(save: CareerState, title: string, text: string, type = '生涯'): CareerState {
  return { ...save, actionLog: [...(save.actionLog || []), { week: save.week || 1, type, title, text }] };
}

function advanceWeek(save: CareerState, text: string): CareerState {
  const week = Number(save.week || 1) + 1;
  return log({
    ...save,
    week,
    attention: Number(save.attentionMax || 6),
    cash: Number(save.cash || 0) - 450
  }, `第 ${week} 周`, `${text} 固定支出 -450。`, '时间');
}

function spend(save: CareerState, attention = 0, cash = 0): CareerState | null {
  if (Number(save.attention || 0) < attention) return null;
  if (Number(save.cash || 0) < cash) return null;
  return { ...save, attention: Number(save.attention || 0) - attention, cash: Number(save.cash || 0) - cash };
}

function metric(save: CareerState, key: 'coherence' | 'stability' | 'siteFit' | 'documentation', delta: number): CareerState {
  const current = Number(save.projectMetrics?.[key] || 0);
  return { ...save, projectMetrics: { ...(save.projectMetrics || {}), [key]: Math.max(0, Math.min(4, current + delta)) } };
}

export function applyCareerStageTwoCommand(save: CareerState, commandId: string): CareerStageCommandResult {
  let next: CareerState | null = save;
  let notice = { title: '没有发生', text: '当前资源或注意力不足。' };

  if (commandId === 'story:stage2:enter') {
    next = advanceWeek(save, '第一次公开之后，现场测试开始进入你的日常。');
    next = { ...next, careerStageId: 'stage-2', careerEpisodeId: 'ep-04-two-hours' };
    next = markEvent(next, 'evt-two-hour-gap');
    next = addEvidence(next, 'stage2:entered');
    next = addMessage(next, 'contact-li-tech', '今晚撤场后空两小时。你要来的话别带完整展览，先告诉我这两个小时到底想确认什么。');
    next = log(next, '进入 Stage 2：现场', '世界开始用真实尺寸、接口、时间窗口和恢复责任反过来约束项目。');
    return { save: next, notice: { title: '现场阶段开始', text: '两小时空档已经出现。先选一个测试目标。' } };
  }

  switch (commandId) {
    case 'story:stage2:goal-recovery':
      next = addEvidence(save, 'stage2:ep4:goal:recovery');
      notice = { title: '测试目标锁定', text: '两个小时只回答：坏掉以后能不能可靠恢复。' };
      break;
    case 'story:stage2:goal-space':
      next = addEvidence(save, 'stage2:ep4:goal:space');
      notice = { title: '测试目标锁定', text: '两个小时只回答：真实尺寸是否改变观看关系。' };
      break;
    case 'story:stage2:goal-delivery':
      next = addEvidence(save, 'stage2:ep4:goal:delivery');
      notice = { title: '测试目标锁定', text: '两个小时只回答：另一个人能否接手运行。' };
      break;

    case 'story:stage2:kit-minimal':
      next = spend(save, 1, 0);
      if (next) { next = addEvidence(next, 'stage2:ep4:kit:minimal'); next = addMethod(next, 'method-minimal-test-kit'); }
      notice = { title: '设备被删到最少', text: '每一件带去现场的东西都必须回答测试目标。' };
      break;
    case 'story:stage2:kit-everything':
      next = spend(save, 1, 120);
      if (next) { next = addEvidence(next, 'stage2:ep4:kit:everything'); next = addIssue(next, 'issue-logistics-overload'); }
      notice = { title: '你把保险感也一起带进了现场', text: '东西更齐，但物流和判断负担形成一条新 Thread。' };
      break;
    case 'story:stage2:kit-prestage':
      next = spend(save, 1, 100);
      if (next) { next = addEvidence(next, 'stage2:ep4:kit:prestage'); next = addEvidence(next, 'relationship:li-tech:reliable-info'); next = discover(next, 'contact-li-tech'); }
      notice = { title: '先买信息，再带设备', text: '接口不确定性在进场前被消掉了一部分。' };
      break;

    case 'story:stage2:run-baseline':
      next = spend(save, 2, 0);
      if (next) {
        next = metric(next, 'stability', 1);
        next = addMethod(next, 'method-recovery-rehearsal');
        next = addIssue(next, 'issue-stage2-recovery-gap');
        next = addEvidence(next, 'stage2:ep4:result:baseline');
        next = addEvidence(next, EP4_DONE);
        next = { ...next, careerEpisodeId: 'ep-05-six-hours' };
        next = advanceWeek(next, '两小时黑盒只留下一个结论和一份测试记录。');
      }
      notice = { title: '第一次测试档期完成', text: '你带走了可重复的基线和一次真实失败。' };
      break;
    case 'story:stage2:run-full':
      next = spend(save, 2, 0);
      if (next) {
        next = metric(next, 'siteFit', 1);
        next = addIssue(next, 'issue-runtime-drift');
        next = addEvidence(next, 'stage2:ep4:result:full-run');
        next = addEvidence(next, EP4_DONE);
        next = { ...next, careerEpisodeId: 'ep-05-six-hours' };
        next = advanceWeek(next, '更接近真实公开的连续运行暴露了新的现场漂移。');
      }
      notice = { title: '真实条件比桌面更诚实', text: '场地适配提高，同时一个运行漂移进入 Thread。' };
      break;
    case 'story:stage2:run-risk':
      next = spend(save, 1, 0);
      if (next) {
        next = metric(next, 'coherence', 1);
        next = addEvidence(next, 'stage2:ep4:result:risk-only');
        next = addEvidence(next, EP4_DONE);
        next = { ...next, careerEpisodeId: 'ep-05-six-hours' };
        next = advanceWeek(next, '你没有把测试变成小型演出，只验证了最危险的环节。');
      }
      notice = { title: '测试问题没有被效果吞掉', text: '你知道了下一次最值得投入的位置。' };
      break;

    case 'story:stage2:plan-interfaces':
      next = spend(save, 1, 0);
      if (next) {
        next = addEvidence(next, 'stage2:ep5:plan:interfaces');
        next = addMethod(next, 'method-interface-handoff');
        next = discover(discover(discover(next, 'contact-li-tech'), 'contact-dai'), 'contact-m');
      }
      notice = { title: '六小时被拆成几个可交接接口', text: '不是所有问题都需要回到你一个人身上。' };
      break;
    case 'story:stage2:plan-centralize':
      next = spend(save, 2, 0);
      if (next) { next = addEvidence(next, 'stage2:ep5:plan:centralize'); next = addIssue(next, 'issue-setup-bottleneck'); }
      notice = { title: '你成了现场单点', text: '控制感更强，但等待你回答的人开始排队。' };
      break;
    case 'story:stage2:plan-visual-first':
      next = spend(save, 1, 0);
      if (next) { next = addEvidence(next, 'stage2:ep5:plan:visual-first'); next = addIssue(next, 'issue-documentation-debt'); }
      notice = { title: '效果优先进入完成态', text: '记录与交接被推到了最危险的最后时段。' };
      break;

    case 'story:stage2:event-sync-clock':
      next = spend(save, 1, 300);
      if (next) { next = addEvidence(next, 'stage2:ep5:event:sync-clock'); next = addMethod(next, 'method-sync-clock'); next = markEvent(next, 'evt-multiscreen-drift'); }
      notice = { title: '同步问题被转成系统条件', text: '你用现金换掉持续人工维护。' };
      break;
    case 'story:stage2:event-sync-degrade':
      next = spend(save, 1, 0);
      if (next) { next = addEvidence(next, 'stage2:ep5:event:sync-degrade'); next = addMethod(next, 'method-asynchronous-secondary-output'); next = { ...next, scopeAdapted: true }; next = markEvent(next, 'evt-multiscreen-drift'); }
      notice = { title: '不同步不再等于失败', text: '你改写内容规则，让第二输出允许异步。' };
      break;
    case 'story:stage2:event-sync-manual':
      next = spend(save, 2, 0);
      if (next) { next = addEvidence(next, 'stage2:ep5:event:sync-manual'); next = addIssue(next, 'issue-sync-drift-debt'); next = markEvent(next, 'evt-multiscreen-drift'); }
      notice = { title: '今晚被人工对齐撑住了', text: '同步债务没有消失，它会在以后继续回来。' };
      break;
    case 'story:stage2:event-scope-swap':
      next = spend(save, 1, 0);
      if (next) { next = addEvidence(next, 'stage2:ep5:event:scope-swap'); next = addMethod(next, 'method-scope-swap'); next = { ...next, scopeAdapted: true }; next = markEvent(next, 'evt-scope-plus-one'); }
      notice = { title: '需求增加，但总 Scope 没有增长', text: '新增内容必须换掉原有内容。' };
      break;
    case 'story:stage2:event-scope-accept':
      next = spend(save, 1, 0);
      if (next) { next = addEvidence(next, 'stage2:ep5:event:scope-accept'); next = addIssue(next, 'issue-scope-creep'); next = markEvent(next, 'evt-scope-plus-one'); }
      notice = { title: '“顺便”正式进入项目', text: '这次关系很顺，但 Scope creep 被记录成真实债务。' };
      break;
    case 'story:stage2:event-scope-boundary':
      next = spend(save, 1, 0);
      if (next) { next = addEvidence(next, 'stage2:ep5:event:scope-boundary'); next = addMethod(next, 'method-scope-boundary'); next = markEvent(next, 'evt-scope-plus-one'); }
      notice = { title: '边界变成了可交接信息', text: '这次不包含什么，被写进项目而不是留在情绪里。' };
      break;

    case 'story:stage2:handoff-three':
      next = spend(save, 1, 0);
      if (next) {
        next = metric(next, 'documentation', 2);
        next = addEvidence(next, 'stage2:ep5:handoff:three-records');
        next = addEvidence(next, EP5_DONE);
        next = { ...next, careerEpisodeId: 'ep-06-after-midnight' };
        next = addMessage(addMessage(next, 'contact-dai', '尺寸、重量和进场路径我都留在同一份记录里了。下次别等到货梯口再量。'), 'contact-m', '我拍了安装和改动，不只拍最终效果。');
        next = advanceWeek(next, '六小时搭建完成，三份最小记录进入同一条现场历史。');
      }
      notice = { title: '搭建窗口被记录下来', text: '下一次恢复不再只依赖“当时在场的人还记得”。' };
      break;
    case 'story:stage2:handoff-later':
      next = spend(save, 1, 0);
      if (next) {
        next = metric(next, 'documentation', 1);
        next = addIssue(next, 'issue-process-evidence-gap');
        next = addEvidence(next, 'stage2:ep5:handoff:later');
        next = addEvidence(next, EP5_DONE);
        next = { ...next, careerEpisodeId: 'ep-06-after-midnight' };
        next = advanceWeek(next, '你补出了一份文档，但部分现场过程已经只能靠记忆重建。');
      }
      notice = { title: '文档留下了，过程缺了一块', text: '这会在后面的恢复里成为真实信息缺口。' };
      break;
    case 'story:stage2:handoff-final-only':
      next = addIssue(save, 'issue-archive-gap');
      next = addEvidence(next, 'stage2:ep5:handoff:final-only');
      next = addEvidence(next, EP5_DONE);
      next = { ...next, careerEpisodeId: 'ep-06-after-midnight' };
      next = advanceWeek(next, '最终效果被拍得很完整，但安装和恢复历史留下空洞。');
      notice = { title: '漂亮结果留下来了', text: '代价是以后有人问“它到底怎么搭起来的”时，你没有完整答案。' };
      break;

    case 'story:stage2:version-rollback':
      next = spend(save, 1, 0);
      if (next) { next = metric(next, 'stability', 1); next = addMethod(next, 'method-version-lock'); next = addEvidence(next, 'stage2:ep6:version:rollback'); next = markEvent(next, 'evt-final-final-v7'); }
      notice = { title: '版本重新有了确定锚点', text: '先回到已知可运行版，再处理新增改动。' };
      break;
    case 'story:stage2:version-hotfix':
      next = spend(save, 1, 0);
      if (next) { next = addIssue(next, 'issue-live-hotfix-debt'); next = addEvidence(next, 'stage2:ep6:version:hotfix'); next = markEvent(next, 'evt-final-final-v7'); }
      notice = { title: '现场先恢复了', text: '这份 Hotfix 以后必须重新并回主版本。' };
      break;
    case 'story:stage2:version-branch':
      next = spend(save, 1, 0);
      if (next) { next = metric(next, 'documentation', 1); next = addMethod(next, 'method-live-version-branch'); next = addEvidence(next, 'stage2:ep6:version:branch'); next = markEvent(next, 'evt-final-final-v7'); }
      notice = { title: '“错误版本”变成了有历史的分支', text: '差异没有被抹掉，它进入版本谱系。' };
      break;

    case 'story:stage2:recover-evidence':
      next = spend(save, 1, 0);
      if (next) { next = resolveFirstIssue(next); next = addMethod(next, 'method-evidence-led-recovery'); next = addEvidence(next, 'stage2:ep6:recovery:evidence'); }
      notice = { title: '证据真的参与了恢复', text: '至少一条旧 Thread 被现场记录重新解释并解决。' };
      break;
    case 'story:stage2:recover-bypass':
      next = spend(save, 1, 0);
      if (next) { next = resolveFirstIssue(next); next = addIssue(next, 'issue-stage2-bypass-debt'); next = addMethod(next, 'method-explicit-temporary-bypass'); next = addEvidence(next, 'stage2:ep6:recovery:bypass'); next = { ...next, scopeAdapted: true }; }
      notice = { title: '明天能继续运行', text: '临时绕过被明确标成债务，没有被假装成永久修复。' };
      break;
    case 'story:stage2:recover-degrade':
      next = spend(save, 1, 0);
      if (next) { next = resolveFirstIssue(next); next = addMethod(next, 'method-field-degrade-output'); next = addEvidence(next, 'stage2:ep6:recovery:degrade'); next = { ...next, scopeAdapted: true }; }
      notice = { title: '可靠性赢过了复杂度', text: '你主动少做一个脆弱环节，让核心系统成立。' };
      break;

    case 'story:stage2:archive-full':
      next = spend(save, 1, 0);
      if (next) { next = metric(next, 'documentation', 1); next = addMethod(next, 'method-field-history-set'); next = addEvidence(next, 'stage2:archive:full'); next = addEvidence(next, STAGE2_DONE); }
      notice = { title: '第二份阶段档案完成', text: '测试、安装、故障和恢复都能被重新进入。' };
      break;
    case 'story:stage2:archive-repro':
      next = addMethod(save, 'method-repro-package');
      next = addEvidence(next, 'stage2:archive:repro');
      next = addEvidence(next, STAGE2_DONE);
      notice = { title: '第二份阶段档案完成', text: '你留下的是一份别人能重新搭起来的最小复现包。' };
      break;
    case 'story:stage2:archive-lineage':
      next = addMethod(save, 'method-live-lineage-archive');
      next = addEvidence(next, 'stage2:archive:lineage');
      next = addEvidence(next, STAGE2_DONE);
      notice = { title: '第二份阶段档案完成', text: '现场差异和 Hotfix 没有被清洗掉，它们成为谱系。' };
      break;
    default:
      return { save, notice };
  }

  if (!next) return { save, notice };
  next = log(next, notice.title, notice.text, commandId.includes(':event-') ? '事件' : '现场');
  return { save: next, notice };
}
