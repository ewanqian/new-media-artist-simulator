import { careerSpecialEvents, careerStages } from './careerContent.ts';
import { contactById } from './legacyDeck.ts';
import type { CareerScene } from './careerStageOne.ts';

type CareerState = Record<string, any>;

export type CareerStageFiveProgress = {
  quests: { id: string; title: string; done: boolean; active: boolean }[];
  completed: number;
  total: number;
  complete: boolean;
};

export type CareerStageFiveCommandResult = {
  save: CareerState;
  notice: { title: string; text: string };
};

const EP13_DONE = 'stage5:ep13:complete';
const EP14_DONE = 'stage5:ep14:complete';
const STAGE5_DONE = 'career:stage-5:complete';

function arr(save: CareerState, key: string): any[] { return Array.isArray(save?.[key]) ? save[key] : []; }
function str(save: CareerState, key: string): string[] { return arr(save, key).filter((v) => typeof v === 'string'); }
function has(save: CareerState, id: string) { return str(save, 'evidenceIds').includes(id); }
function hasPrefix(save: CareerState, prefix: string) { return str(save, 'evidenceIds').some((id) => id.startsWith(prefix)); }
function unique(values: string[] = [], value: string) { return values.includes(value) ? values : [...values, value]; }
function addEvidence(save: CareerState, id: string) { return { ...save, evidenceIds: unique(str(save, 'evidenceIds'), id) }; }
function addMethod(save: CareerState, id: string) { return { ...save, methodIds: unique(str(save, 'methodIds'), id) }; }
function markEvent(save: CareerState, id: string) { return { ...save, seenEventIds: unique(str(save, 'seenEventIds'), id) }; }
function log(save: CareerState, title: string, text: string, type = '基础设施') { return { ...save, actionLog: [...arr(save, 'actionLog'), { week: save.week || 1, type, title, text }] }; }
function discover(save: CareerState, id: string) {
  const contactThreads = { ...(save.contactThreads || {}) };
  if (!contactThreads[id]) contactThreads[id] = contactById(id)?.openingMessages || [];
  return { ...save, discoveredContactIds: unique(str(save, 'discoveredContactIds'), id), contactThreads };
}
function message(save: CareerState, id: string, text: string) {
  let next = discover(save, id);
  next = { ...next, contactThreads: { ...next.contactThreads, [id]: [...(next.contactThreads[id] || []), { from: 'them', text }] } };
  return next;
}
function spend(save: CareerState, attention = 0, cash = 0): CareerState | null {
  if (Number(save.attention || 0) < attention || Number(save.cash || 0) < cash) return null;
  return { ...save, attention: Number(save.attention || 0) - attention, cash: Number(save.cash || 0) - cash };
}
function nextWeek(save: CareerState, note: string, fixedCost = 450) {
  const week = Number(save.week || 1) + 1;
  return log({ ...save, week, attention: Number(save.attentionMax || 6), cash: Number(save.cash || 0) - fixedCost }, `第 ${week} 周`, `${note} 固定支出 -${fixedCost}。`, '时间');
}
function special(id: string) { return careerSpecialEvents.find((event) => event.id === id); }

function infrastructure(save: CareerState) {
  return save.careerInfrastructure || { id: 'infra-28sqm', mode: null, purpose: null, monthlyCost: 0, conditions: [], roles: {}, handoff: [], publicRule: null };
}
function patchInfrastructure(save: CareerState, patch: Record<string, any>) {
  return { ...save, careerInfrastructure: { ...infrastructure(save), ...patch } };
}
function modeLabel(save: CareerState) {
  const mode = infrastructure(save).mode;
  if (mode === 'own-minimal') return '自己承担最低运行责任';
  if (mode === 'shared') return '与合作伙伴共担';
  if (mode === 'pop-up') return '不长期接手，只保留临时使用窗口';
  return '尚未决定';
}
function purposeLabel(save: CareerState) {
  const purpose = infrastructure(save).purpose;
  if (purpose === 'test-public') return '测试与小型公开原型';
  if (purpose === 'archive-repair') return '档案、修复与方法工作坊';
  if (purpose === 'program') return '小型公开计划与同行交换';
  return '尚未定义';
}

function normalizedBranches(save: CareerState) {
  return arr(save, 'careerRemixBranches').map((branch) => ({
    ...branch,
    test: typeof branch?.test === 'string' ? branch.test.replace(/^remix-test-/, '') : branch?.test
  }));
}

function peopleArchive(save: CareerState) {
  return str(save, 'discoveredContactIds').map((id) => {
    const contact = contactById(id);
    const messages = save.contactThreads?.[id] || [];
    return {
      id,
      name: contact?.name || id,
      role: contact?.role || '关系',
      sharedHistoryCount: messages.length,
      evidence: str(save, 'evidenceIds').filter((item) => item.includes(id.replace('contact-', '')) || item.includes(id)).slice(0, 8)
    };
  });
}

function buildCareerArchive(save: CareerState, continuation: string) {
  const infra = infrastructure(save);
  const methods = str(save, 'methodIds');
  const evidence = str(save, 'evidenceIds');
  const stageCompletions = careerStages.map((stage) => ({
    id: stage.id,
    title: stage.title,
    complete: evidence.includes(`career:${stage.id}:complete`) || evidence.includes(`career:stage-${stage.index}:complete`)
  }));
  return {
    schema: 'nmas-career-archive-v1',
    generatedWeek: save.week || 1,
    continuation,
    summary: {
      project: save.primaryProject?.name || '未命名实践',
      knownFor: Array.isArray(save.careerKnownFor) ? save.careerKnownFor : [],
      methodSet: save.careerMethodSet || null,
      stages: stageCompletions
    },
    categories: {
      people: peopleArchive(save),
      places: str(save, 'visitedPlaceIds').map((id) => ({ id })),
      projects: [{
        id: 'primary-practice-line',
        name: save.primaryProject?.name || '未命名实践',
        question: save.primaryProject?.question || '',
        metrics: save.projectMetrics || {},
        lineage: normalizedBranches(save),
        salvaged: arr(save, 'salvagedAssets')
      }],
      methods: methods.map((id) => ({ id })),
      media: evidence.filter((id) => /run|public|version|media|output|signal|document|archive|feedback/.test(id)).map((id) => ({ evidenceId: id })),
      ecology: {
        commitments: evidence.filter((id) => /commitment|relationship|invite|result/.test(id)),
        specialEvents: str(save, 'seenEventIds'),
        infrastructure: infra
      }
    },
    openThreads: str(save, 'revealedIssueIds').filter((id) => !str(save, 'resolvedIssueIds').includes(id)),
    evidenceCount: evidence.length
  };
}

export function careerStageFiveProgress(save: CareerState): CareerStageFiveProgress {
  const done = [has(save, EP13_DONE), has(save, EP14_DONE), has(save, STAGE5_DONE)];
  const titles = ['28㎡ 临时基础设施', '从一个人到一套协作系统', '留下一份能重新打开的档案'];
  let previousDone = true;
  const quests = titles.map((title, index) => {
    const questDone = done[index];
    const active = previousDone && !questDone;
    previousDone = previousDone && questDone;
    return { id: `stage5-${index + 1}`, title, done: questDone, active };
  });
  const completed = done.filter(Boolean).length;
  return { quests, completed, total: 3, complete: completed === 3 };
}

export function careerStageFiveScene(save: CareerState): CareerScene {
  const progress = careerStageFiveProgress(save);
  if (progress.complete) {
    const archive = save.careerArchive;
    return {
      id: 'career-complete', kicker: 'CAREER ARCHIVE / REOPENABLE', title: '这不是“通关存档”。它是一份以后还能重新打开的实践历史。',
      body: [
        `现在这份档案里有 ${archive?.categories?.people?.length || 0} 个真实进入过生涯的人、${archive?.categories?.places?.length || 0} 类去过的环境、${archive?.categories?.methods?.length || 0} 条方法和 ${archive?.evidenceCount || 0} 条 Evidence。`,
        `你选择下一阶段以「${archive?.continuation || '未定义结构'}」继续。它不是职业 Class，也不封死后面的项目；它只描述当前什么结构最适合继续维护这套实践。`,
        '你可以继续玩现有世界，也可以从内容管理导出这份本地档案。没有 YOU WIN，只有一套已经能被重新进入的历史。'
      ],
      note: '五阶段主线已经闭合。后续扩写可以从任何阶段插入新的 Episode、人物回流和条件事件，而不需要再增加顶层系统。',
      choices: [],
      optionalWorkbench: '自由创作 / Blueprint 仍然可以继续生成新的分支；Career Archive 会把新的项目历史继续接在现有谱系后面。'
    };
  }

  if (!has(save, EP13_DONE)) {
    if (!hasPrefix(save, 'stage5:ep13:mode:')) {
      const offer = special('evt-28sqm-offer');
      return {
        id: 'stage5-space-offer', kicker: 'EPISODE 13 / SIGNATURE EVENT', title: '28㎡ 可以接手。问题不是“有没有空间”，而是谁维护它。',
        body: [
          offer?.hook || '不是理想空间，但它第一次让“维护基础设施”成为真实选择。',
          '陈说租金很低，条件也很普通：一间 28㎡ 的房间、基础电、网络可以自己拉、门禁需要协调。你第一次面对的不是展览机会，是持续责任。'
        ],
        choices: [
          { id: 'story:stage5:mode-own', title: '接下来，但只承担最低运行责任', detail: '每周自己维护一次；不承诺长期开放，也不把它包装成“机构”。', cost: '注意力 -1 · 押金 ¥300 · 每阶段维护成本', kind: 'commitment' },
          { id: 'story:stage5:mode-shared', title: '和现有合作者共担这个空间', detail: '先把钥匙、费用、值守和决定权拆开，避免“大家一起”变成没人负责。', cost: '注意力 -1 · 押金 ¥150 · 共享责任', kind: 'commitment' },
          { id: 'story:stage5:mode-popup', title: '不长期接手，只保留临时使用窗口', detail: '拒绝持续租金，把空间作为按次测试 / 公开的场域关系保留下来。', cost: '注意力 0 · 无固定空间成本', kind: 'route' }
        ]
      };
    }

    if (!hasPrefix(save, 'stage5:ep13:purpose:')) {
      return {
        id: 'stage5-space-purpose', kicker: 'INFRA / PURPOSE', title: `${modeLabel(save)}。现在先规定：这个空间不是什么。`,
        body: [
          '28㎡ 不可能同时是画廊、工作室、仓库、俱乐部、学校和办公室。越早决定它服务哪种动作，后面越不需要用“空间愿景”掩盖资源不足。',
          '目的会改变谁被邀请进来、什么设备值得留下、什么 Evidence 会进入下一次项目。'
        ],
        choices: [
          { id: 'story:stage5:purpose-test', title: '测试与小型公开原型', detail: '优先让半成品进入真实尺寸。公开只是测试的一部分，不追求完整展览。', cost: '注意力 -1 · Field / Test', kind: 'route' },
          { id: 'story:stage5:purpose-archive', title: '档案、修复与方法工作坊', detail: '让旧硬盘、失败版本、设备修复和方法教学有一个能持续发生的地方。', cost: '注意力 -1 · Records / Method', kind: 'route' },
          { id: 'story:stage5:purpose-program', title: '小型公开计划与同行交换', detail: '不做大展览，保持低成本、短周期、可以测试和讨论的公开节奏。', cost: '注意力 -1 · People / Signal', kind: 'route' }
        ]
      };
    }

    return {
      id: 'stage5-space-minimum', kicker: 'OPERATE / MINIMUM CONDITIONS', title: `它的用途是「${purposeLabel(save)}」。要让它活过一个月，最低条件是什么？`,
      body: [
        '真正的基础设施不是买更多设备，而是明确哪些东西坏掉、欠费、没人值守以后，空间就停止成立。',
        '你只能先维护一组最低条件，其余都按项目临时进入。'
      ],
      choices: [
        { id: 'story:stage5:minimum-access', title: '门禁 / 电力 / 网络 / 恢复说明', detail: '先保证任何一次使用都能进门、通电、联网，并知道最基本的故障恢复。', cost: '注意力 -1 · ¥100 · 运行基线', kind: 'build' },
        { id: 'story:stage5:minimum-booking', title: '预约 / 费用 / 责任人 / 撤场规则', detail: '先让人和时间不互相踩。设备全部按项目临时进入。', cost: '注意力 -1 · 协作基线', kind: 'commitment' },
        { id: 'story:stage5:minimum-archive', title: '版本 / 设备状态 / 使用记录 / 备份', detail: '先让每次使用都留下可回看的状态，不把空间变成新的 final_final 文件夹。', cost: '注意力 -1 · Records 基线', kind: 'build' }
      ]
    };
  }

  if (!has(save, EP14_DONE)) {
    if (!hasPrefix(save, 'stage5:ep14:roles:')) {
      return {
        id: 'stage5-team-roles', kicker: 'EPISODE 14 / HANDOFF', title: '你不可能继续做所有人的接口。先决定什么必须离开你的脑子。',
        body: [
          '李技术知道信号和恢复；戴知道尺寸、进场与安装；乔知道 Scope、费用和排期；M 知道版本、记录和传播。',
          '这不是组建 RPG 队伍。你要定义的是接口：什么信息由谁维护，出问题时谁先判断，什么决定仍然需要回到你。'
        ],
        choices: [
          { id: 'story:stage5:roles-four', title: '按四个接口拆：技术 / 安装 / 制作 / 档案', detail: '每个人只维护自己能可靠交接的状态；项目方向仍由当前项目决定。', cost: '注意力 -1 · 清晰接口', kind: 'commitment' },
          { id: 'story:stage5:roles-pairs', title: '两两备份：每个关键接口至少两个人能接', detail: '成本是更多交接时间，收益是任何一个人缺席时系统不立刻失效。', cost: '注意力 -2 · 冗余协作', kind: 'commitment' },
          { id: 'story:stage5:roles-you', title: '核心密码和决定还是由你保管', detail: '短期最快，但整个空间继续依赖一个单点。系统会把它明确记录为风险。', cost: '注意力 0 · 新增单点风险', kind: 'commitment' }
        ]
      };
    }

    if (!hasPrefix(save, 'stage5:ep14:absence:')) {
      return {
        id: 'stage5-team-absence', kicker: 'INCIDENT / KEY PERSON ABSENT', title: '第一次真正检验协作系统：明天李技术来不了。',
        body: [
          '明天有一次两小时公开测试。以前你会直接问李技术“怎么办”，但现在这个空间声称自己已经有一套可交接基础设施。',
          '如果系统只有人在场时才成立，那还不是基础设施。'
        ],
        choices: [
          { id: 'story:stage5:absence-runbook', title: '按现有运行说明让其他人接手', detail: '不临时增加新功能，只按信号、输出、恢复三段 Runbook 执行。', cost: '注意力 -1 · Runbook 验证', kind: 'build' },
          { id: 'story:stage5:absence-degrade', title: '降级成单输出测试，减少现场依赖', detail: '用 Scope 适配换掉关键人缺席造成的不确定性。', cost: '注意力 -1 · Degrade / 可靠', kind: 'commitment' },
          { id: 'story:stage5:absence-cancel', title: '取消这次测试，并把“关键人不可替代”列为阻塞', detail: '不把取消视为失败；先修协作接口，再承诺下一次。', cost: '注意力 0 · 延迟公开 · 暴露结构问题', kind: 'commitment' }
        ]
      };
    }

    return {
      id: 'stage5-team-handoff', kicker: 'SYSTEM / SHARED MEMORY', title: '最后一件事：交接不能只是一份群公告。',
      body: [
        '空间已经经历一次关键人缺席。现在要把散落在聊天、脑子、旧文档和设备贴纸里的东西收成一份任何协作者都能重新进入的状态。',
        '你不需要写完整 SOP，只需要让下一次问题不必从“谁知道这个怎么开”开始。'
      ],
      choices: [
        { id: 'story:stage5:handoff-state', title: '一页状态：现在有什么 / 谁负责 / 哪些已知问题 / 下次动作', detail: '信息最短，但每次使用后必须更新。', cost: '注意力 -1 · Shared state', kind: 'build' },
        { id: 'story:stage5:handoff-runbook', title: '运行包：开机 / 测试 / 恢复 / 撤场', detail: '优先保证现场能被另一个人独立操作。', cost: '注意力 -1 · Reproducible operations', kind: 'build' },
        { id: 'story:stage5:handoff-log', title: '只维护变更日志，旧文档原样保留', detail: '不重写历史，用 changelog 记录每次条件、版本和责任变化。', cost: '注意力 -1 · Changelog lineage', kind: 'build' }
      ]
    };
  }

  if (!hasPrefix(save, 'stage5:ep15:lens:')) {
    return {
      id: 'stage5-archive-lens', kicker: 'EPISODE 15 / CAREER ARCHIVE', title: '最后整理的不是“最好作品”，而是别人怎样重新进入这段实践。',
      body: [
        '五个阶段已经留下人物、场域、项目、方法、媒介和生态。你不需要再做一份按年份堆满缩略图的作品集。',
        '先决定这份 Career Archive 的入口。它只影响阅读顺序，不删除其他历史。'
      ],
      choices: [
        { id: 'story:stage5:lens-project', title: '从项目谱系进入', detail: '从第一个可运行版本一路看到现场、委托、Remix、方法和基础设施怎样从同一条实践线长出来。', cost: '注意力 -1 · Project lineage', kind: 'route' },
        { id: 'story:stage5:lens-people', title: '从人物与共同经历进入', detail: '先看谁在什么时候进入、看过什么、一起做过什么，以及承诺与可靠信息怎样形成。', cost: '注意力 -1 · People history', kind: 'route' },
        { id: 'story:stage5:lens-method', title: '从方法与失败进入', detail: '先看故障、Scope、版本、交接与教学怎样变成可复用的方法组。', cost: '注意力 -1 · Method history', kind: 'route' }
      ]
    };
  }

  return {
    id: 'stage5-continuation', kicker: 'CONTINUE / STRUCTURE', title: '档案已经能重新打开。下一阶段，你想用什么结构继续？',
    body: [
      '这不是结局职业选择。它不会把你锁成“艺术家 / 团队 / 机构”。只是决定下一段时间由什么结构承担空间、项目、协作和现金压力。',
      '无论选哪一个，前面的 Project、People、Methods 和 Archive 都保持同一条历史。'
    ],
    choices: [
      { id: 'story:stage5:continue-individual', title: '个人实践 + 稳定协作网络', detail: '不承担长期机构身份。空间按项目使用，关键协作者通过清晰接口进入。', cost: 'STRUCTURE · individual-network', kind: 'route' },
      { id: 'story:stage5:continue-collective', title: '小型协作体 + 共享基础设施', detail: '把空间、方法和部分现金责任变成共同维护，但不追求扩张成正式机构。', cost: 'STRUCTURE · collective-infra', kind: 'route' },
      { id: 'story:stage5:continue-nomadic', title: '游牧 / 场域型混合实践', detail: '保留最小基础设施和档案，把项目继续放进不同现场；固定空间只是一个节点。', cost: 'STRUCTURE · nomadic-hybrid', kind: 'route' }
    ]
  };
}

export function applyCareerStageFiveCommand(save: CareerState, commandId: string): CareerStageFiveCommandResult {
  let next: CareerState | null = save;
  let notice = { title: '没有发生', text: '当前资源或注意力不足。' };

  if (commandId === 'story:stage5:enter') {
    next = nextWeek(save, '方法已经可以被复用和教给别人；现在问题变成谁长期维护这些条件。');
    next = { ...next, careerStageId: 'stage-5', careerEpisodeId: 'ep-13-28sqm' };
    next = addEvidence(next, 'stage5:entered');
    next = markEvent(next, 'evt-28sqm-offer');
    next = discover(discover(next, 'contact-chen'), 'contact-qiao');
    next = message(next, 'contact-chen', '有个 28㎡ 的房间可以低成本接一段时间。先别叫空间品牌，你先想清楚谁开门、谁付钱、坏了谁管。');
    next = log(next, '进入 Stage 5：基础设施', '第一次面对的不是更大的项目，而是持续维护责任。');
    return { save: next, notice: { title: '基础设施阶段开始', text: '28㎡ 空间进入 Signal，但是否接手仍然是选择。' } };
  }

  switch (commandId) {
    case 'story:stage5:mode-own':
      next = spend(save, 1, 300);
      if (next) { next = patchInfrastructure(next, { mode: 'own-minimal', monthlyCost: 300 }); next = addEvidence(next, 'stage5:ep13:mode:own-minimal'); }
      notice = { title: '空间被接下，但没有被神话', text: '你只承诺最低运行责任。' }; break;
    case 'story:stage5:mode-shared':
      next = spend(save, 1, 150);
      if (next) { next = patchInfrastructure(next, { mode: 'shared', monthlyCost: 180 }); next = addEvidence(next, 'stage5:ep13:mode:shared'); }
      notice = { title: '空间变成共享责任', text: '钥匙、费用和决定权必须继续被拆清楚。' }; break;
    case 'story:stage5:mode-popup':
      next = patchInfrastructure(save, { mode: 'pop-up', monthlyCost: 0 }); next = addEvidence(next, 'stage5:ep13:mode:pop-up');
      notice = { title: '你拒绝了持续租金', text: '空间关系仍然存在，只在需要时进入项目。' }; break;

    case 'story:stage5:purpose-test':
      next = spend(save, 1, 0); if (next) { next = patchInfrastructure(next, { purpose: 'test-public' }); next = addEvidence(next, 'stage5:ep13:purpose:test-public'); }
      notice = { title: '用途收缩：测试与小型公开', text: '半成品和真实尺寸优先于完整展览。' }; break;
    case 'story:stage5:purpose-archive':
      next = spend(save, 1, 0); if (next) { next = patchInfrastructure(next, { purpose: 'archive-repair' }); next = addEvidence(next, 'stage5:ep13:purpose:archive-repair'); }
      notice = { title: '用途收缩：档案、修复与方法', text: '旧材料和教学获得一个持续发生的环境。' }; break;
    case 'story:stage5:purpose-program':
      next = spend(save, 1, 0); if (next) { next = patchInfrastructure(next, { purpose: 'program' }); next = addEvidence(next, 'stage5:ep13:purpose:program'); }
      notice = { title: '用途收缩：小型公开计划', text: '保持低成本、短周期和可讨论的公开节奏。' }; break;

    case 'story:stage5:minimum-access':
      next = spend(save, 1, 100);
      if (next) { next = patchInfrastructure(next, { conditions: ['access', 'power', 'network', 'recovery-note'] }); next = addMethod(next, 'method-minimum-infrastructure-baseline'); next = addEvidence(next, 'stage5:ep13:minimum:access-power-network'); }
      notice = { title: '最低运行基线建立', text: '进门、通电、联网和恢复说明先于更多设备。' }; break;
    case 'story:stage5:minimum-booking':
      next = spend(save, 1, 0);
      if (next) { next = patchInfrastructure(next, { conditions: ['booking', 'cost', 'owner', 'reset-rule'] }); next = addMethod(next, 'method-shared-space-commitment'); next = addEvidence(next, 'stage5:ep13:minimum:booking-responsibility'); }
      notice = { title: '人和时间先被组织', text: '设备继续按项目进入，责任不靠默认理解。' }; break;
    case 'story:stage5:minimum-archive':
      next = spend(save, 1, 0);
      if (next) { next = patchInfrastructure(next, { conditions: ['version', 'equipment-state', 'usage-log', 'backup'] }); next = addMethod(next, 'method-space-state-log'); next = addEvidence(next, 'stage5:ep13:minimum:archive-state'); }
      notice = { title: '空间开始留下状态历史', text: '每次使用都能回看版本、设备和已知问题。' }; break;

    case 'story:stage5:roles-four':
      next = spend(save, 1, 0);
      if (next) { next = patchInfrastructure(next, { roles: { technical: 'contact-li-tech', install: 'contact-dai', production: 'contact-qiao', archive: 'contact-m' } }); next = addEvidence(next, 'stage5:ep14:roles:four-interfaces'); next = addMethod(next, 'method-four-interface-collaboration'); }
      notice = { title: '协作被拆成四个接口', text: '不是所有问题都再回到你一个人。' }; break;
    case 'story:stage5:roles-pairs':
      next = spend(save, 2, 0);
      if (next) { next = patchInfrastructure(next, { roles: { technical: ['contact-li-tech', 'you'], install: ['contact-dai', 'contact-li-tech'], production: ['contact-qiao', 'you'], archive: ['contact-m', 'you'] } }); next = addEvidence(next, 'stage5:ep14:roles:paired-backup'); next = addMethod(next, 'method-role-redundancy'); }
      notice = { title: '关键接口有了冗余', text: '交接成本更高，但单人缺席不再让系统归零。' }; break;
    case 'story:stage5:roles-you':
      next = patchInfrastructure(save, { roles: { owner: 'you', others: 'ad-hoc' } }); next = addEvidence(next, 'stage5:ep14:roles:single-point'); next = { ...next, revealedIssueIds: unique(str(next, 'revealedIssueIds'), 'issue-infrastructure-single-point') };
      notice = { title: '空间仍然依赖你这个单点', text: '系统不会道德批评，但把风险明确留下。' }; break;

    case 'story:stage5:absence-runbook':
      next = spend(save, 1, 0);
      if (next) { next = addEvidence(next, 'stage5:ep14:absence:runbook'); next = addMethod(next, 'method-absence-tested-runbook'); next = patchInfrastructure(next, { publicRule: 'runbook-first-no-new-features' }); }
      notice = { title: '关键人缺席但系统仍然运行', text: 'Runbook 第一次从文档变成被验证的协作接口。' }; break;
    case 'story:stage5:absence-degrade':
      next = spend(save, 1, 0);
      if (next) { next = addEvidence(next, 'stage5:ep14:absence:degrade'); next = addMethod(next, 'method-infrastructure-degrade'); next = { ...next, scopeAdapted: true }; }
      notice = { title: '系统通过降级保持可靠', text: '少一层输出比临时找人填洞更可控。' }; break;
    case 'story:stage5:absence-cancel':
      next = addEvidence(save, 'stage5:ep14:absence:cancelled'); next = { ...next, revealedIssueIds: unique(str(next, 'revealedIssueIds'), 'issue-key-person-not-replaceable') };
      notice = { title: '测试被取消，结构问题被暴露', text: '取消没有被写成失败分数；它明确指出协作系统还缺什么。' }; break;

    case 'story:stage5:handoff-state':
      next = spend(save, 1, 0);
      if (next) { next = patchInfrastructure(next, { handoff: ['current-state', 'owner', 'known-issues', 'next-action'] }); next = addMethod(next, 'method-shared-current-state'); next = addEvidence(next, 'stage5:ep14:handoff:state-page'); next = addEvidence(next, EP14_DONE); next = { ...next, careerEpisodeId: 'ep-15-career-archive' }; next = nextWeek(next, '协作系统第一次有一份任何人都能重新进入的当前状态。', Math.max(300, 450 + Number(infrastructure(next).monthlyCost || 0))); }
      notice = { title: '共享状态成为协作接口', text: '下一次不再从翻聊天记录开始。' }; break;
    case 'story:stage5:handoff-runbook':
      next = spend(save, 1, 0);
      if (next) { next = patchInfrastructure(next, { handoff: ['power-on', 'test', 'recover', 'reset'] }); next = addMethod(next, 'method-infrastructure-runbook'); next = addEvidence(next, 'stage5:ep14:handoff:runbook'); next = addEvidence(next, EP14_DONE); next = { ...next, careerEpisodeId: 'ep-15-career-archive' }; next = nextWeek(next, '运行、测试、恢复和撤场被收进同一份可复现操作包。', Math.max(300, 450 + Number(infrastructure(next).monthlyCost || 0))); }
      notice = { title: '运行包可以被另一个人接手', text: '空间开始具有真正的 shared memory。' }; break;
    case 'story:stage5:handoff-log':
      next = spend(save, 1, 0);
      if (next) { next = patchInfrastructure(next, { handoff: ['change-log'] }); next = addMethod(next, 'method-infrastructure-changelog'); next = addEvidence(next, 'stage5:ep14:handoff:changelog'); next = addEvidence(next, EP14_DONE); next = { ...next, careerEpisodeId: 'ep-15-career-archive' }; next = nextWeek(next, '旧文档保留，新的条件与责任变化只通过 changelog 继续生长。', Math.max(300, 450 + Number(infrastructure(next).monthlyCost || 0))); }
      notice = { title: '历史没有被重写', text: '变更日志成为维护长期基础设施的最小接口。' }; break;

    case 'story:stage5:lens-project':
      next = spend(save, 1, 0); if (next) next = addEvidence(next, 'stage5:ep15:lens:project-lineage');
      notice = { title: 'Career Archive 从项目谱系进入', text: '其他五类档案仍然保留，只改变第一阅读入口。' }; break;
    case 'story:stage5:lens-people':
      next = spend(save, 1, 0); if (next) next = addEvidence(next, 'stage5:ep15:lens:people-history');
      notice = { title: 'Career Archive 从人物历史进入', text: '共同经历、承诺和信息可靠度成为第一阅读入口。' }; break;
    case 'story:stage5:lens-method':
      next = spend(save, 1, 0); if (next) next = addEvidence(next, 'stage5:ep15:lens:method-history');
      notice = { title: 'Career Archive 从方法与失败进入', text: '故障、版本、Scope、交接和教学成为第一阅读入口。' }; break;

    case 'story:stage5:continue-individual':
    case 'story:stage5:continue-collective':
    case 'story:stage5:continue-nomadic': {
      const continuation = commandId.endsWith('individual') ? '个人实践 + 稳定协作网络' : commandId.endsWith('collective') ? '小型协作体 + 共享基础设施' : '游牧 / 场域型混合实践';
      next = { ...save, continuationStructure: continuation };
      next = addEvidence(next, `stage5:ep15:continuation:${commandId.split(':').at(-1)}`);
      next = addEvidence(next, STAGE5_DONE);
      next = { ...next, careerArchive: buildCareerArchive(next, continuation) };
      next = log(next, '五阶段 Career Archive 生成', `继续结构：${continuation}。档案保持可重新打开，不锁定职业。`, '记录');
      notice = { title: 'Career Archive 已生成', text: '五阶段闭合，但这份实践仍然可以继续生长。' };
      break;
    }
    default:
      return { save, notice };
  }

  if (!next) return { save, notice };
  if (hasPrefix(next, 'stage5:ep13:minimum:') && !has(next, EP13_DONE)) {
    next = addEvidence(next, EP13_DONE);
    next = { ...next, careerEpisodeId: 'ep-14-collaboration-system' };
    next = nextWeek(next, '28㎡ 空间的最低运行条件被明确，基础设施不再等于一堆设备。', Math.max(300, 450 + Number(infrastructure(next).monthlyCost || 0)));
  }
  if (!has(next, STAGE5_DONE)) next = log(next, notice.title, notice.text);
  return { save: next, notice };
}
