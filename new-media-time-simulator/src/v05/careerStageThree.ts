import { careerSpecialEvents } from './careerContent.ts';
import { contactById } from './legacyDeck.ts';
import type { CareerScene } from './careerStageOne.ts';

type CareerState = Record<string, any>;

export type CareerStageThreeProgress = {
  quests: { id: string; title: string; done: boolean; active: boolean }[];
  completed: number;
  total: number;
  complete: boolean;
};

export type CareerStageThreeCommandResult = {
  save: CareerState;
  notice: { title: string; text: string };
};

const EP7_DONE = 'stage3:ep7:complete';
const EP8_DONE = 'stage3:ep8:complete';
const STAGE3_DONE = 'career:stage-3:complete';

function list(save: CareerState, key: string): string[] { return Array.isArray(save?.[key]) ? save[key] : []; }
function has(save: CareerState, value: string) { return list(save, 'evidenceIds').includes(value); }
function hasPrefix(save: CareerState, prefix: string) { return list(save, 'evidenceIds').some((id) => id.startsWith(prefix)); }
function addUnique(values: string[] = [], value: string) { return values.includes(value) ? values : [...values, value]; }
function addEvidence(save: CareerState, id: string) { return { ...save, evidenceIds: addUnique(list(save, 'evidenceIds'), id) }; }
function addMethod(save: CareerState, id: string) { return { ...save, methodIds: addUnique(list(save, 'methodIds'), id) }; }
function addIssue(save: CareerState, id: string) { return { ...save, revealedIssueIds: addUnique(list(save, 'revealedIssueIds'), id) }; }
function markEvent(save: CareerState, id: string) { return { ...save, seenEventIds: addUnique(list(save, 'seenEventIds'), id) }; }
function log(save: CareerState, title: string, text: string, type = '网络') {
  return { ...save, actionLog: [...(save.actionLog || []), { week: save.week || 1, type, title, text }] };
}
function discover(save: CareerState, id: string) {
  const contactThreads = { ...(save.contactThreads || {}) };
  if (!contactThreads[id]) contactThreads[id] = contactById(id)?.openingMessages || [];
  return { ...save, discoveredContactIds: addUnique(list(save, 'discoveredContactIds'), id), contactThreads };
}
function message(save: CareerState, id: string, text: string, from: 'them' | 'you' = 'them') {
  let next = discover(save, id);
  next = { ...next, contactThreads: { ...next.contactThreads, [id]: [...(next.contactThreads[id] || []), { from, text }] } };
  return next;
}
function metric(save: CareerState, key: 'coherence' | 'stability' | 'siteFit' | 'documentation', delta: number) {
  const current = Number(save.projectMetrics?.[key] || 0);
  return { ...save, projectMetrics: { ...(save.projectMetrics || {}), [key]: Math.max(0, Math.min(4, current + delta)) } };
}
function spend(save: CareerState, attention = 0, cash = 0): CareerState | null {
  if (Number(save.attention || 0) < attention || Number(save.cash || 0) < cash) return null;
  return { ...save, attention: Number(save.attention || 0) - attention, cash: Number(save.cash || 0) - cash };
}
function nextWeek(save: CareerState, note: string, cashDelta = -450) {
  const week = Number(save.week || 1) + 1;
  return log({ ...save, week, attention: Number(save.attentionMax || 6), cash: Number(save.cash || 0) + cashDelta }, `第 ${week} 周`, note, '时间');
}
function special(id: string) { return careerSpecialEvents.find((event) => event.id === id); }

function entryReason(save: CareerState) {
  const methods = new Set(list(save, 'methodIds'));
  if (methods.has('method-field-history-set')) return '陈把你那份现场历史转给了乔：测试目标、安装、故障和恢复都能重新打开。';
  if (methods.has('method-repro-package')) return '有人把你那份最小复现包转给了乔：另一个人照着文档真的把系统重新跑起来了。';
  if (methods.has('method-live-lineage-archive')) return '乔看到你没有把现场 Hotfix 清洗掉，而是把版本差异完整留成了谱系。';
  if (methods.has('method-scope-boundary')) return '乔听说你在现场把“这次不包含什么”写得很清楚，想问你愿不愿意接一个小项目。';
  return '陈提到你已经做过一次真实公开和完整现场测试。乔想先从一个很小的项目合作看看。';
}

function commissionFee(save: CareerState) {
  if (has(save, 'stage3:ep7:commit:full')) return 2400;
  if (has(save, 'stage3:ep7:commit:split')) return 1700;
  if (has(save, 'stage3:ep7:commit:package')) return 1400;
  return 0;
}

function deriveKnownFor(save: CareerState) {
  const methods = new Set(list(save, 'methodIds'));
  const result: string[] = [];
  if (methods.has('method-evidence-led-recovery') || methods.has('method-recovery-rehearsal')) result.push('现场出了问题以后，能把系统带回来');
  if (methods.has('method-scope-boundary') || methods.has('method-commission-boundary')) result.push('会把责任、Scope 和“不包含什么”说清楚');
  if (methods.has('method-one-page-project')) result.push('能把复杂项目压成一页可传递版本');
  if (methods.has('method-interface-handoff') || methods.has('method-repro-package')) result.push('能让另一个人接手安装和运行');
  if (methods.has('method-source-evidence-response')) result.push('面对传播误读时会拿原始证据说话');
  if (!result.length) result.push('已经把一个项目从桌面带进真实现场');
  return result.slice(0, 3);
}

export function careerStageThreeProgress(save: CareerState): CareerStageThreeProgress {
  const done = [has(save, EP7_DONE), has(save, EP8_DONE), has(save, STAGE3_DONE)];
  const titles = ['第一个小委托', '一份 Open Call 和一页版本', '别人怎么描述你'];
  let previousDone = true;
  const quests = titles.map((title, index) => {
    const questDone = done[index];
    const active = previousDone && !questDone;
    previousDone = previousDone && questDone;
    return { id: `stage3-${index + 1}`, title, done: questDone, active };
  });
  const completed = done.filter(Boolean).length;
  return { quests, completed, total: 3, complete: completed === 3 };
}

export function careerStageThreeScene(save: CareerState): CareerScene {
  const progress = careerStageThreeProgress(save);
  if (progress.complete) {
    const knownFor = Array.isArray(save.careerKnownFor) ? save.careerKnownFor : deriveKnownFor(save);
    return {
      id: 'stage3-complete', kicker: 'STAGE 3 / ARCHIVED', title: '你没有得到一个“声望等级”，但世界已经开始用几句话记住你。',
      body: [
        `现在真正存在的是：${knownFor.join('；')}。这些描述都能追溯到某次项目、某个现场、某条文档或某个处理过的承诺。`,
        '它们以后会改变谁来找你、带着什么预期来找你，也可能变成新的误读。'
      ],
      note: '下一阶段是 METHOD：旧项目、失败、Blueprint 分支和这些被别人记住的做事方式，会第一次被系统性复用。',
      choices: [],
      optionalWorkbench: '“别人因为什么找你”不是永久身份。后面的项目可以继续改写这些描述。'
    };
  }

  if (!has(save, EP7_DONE)) {
    if (!hasPrefix(save, 'stage3:ep7:verify:')) {
      return {
        id: 'stage3-commission-verify', kicker: 'EPISODE 07 / INBOUND SIGNAL', title: '第一个小委托来了。先别把“有人找你”误认为“事情已经说清楚”。',
        body: [
          entryReason(save),
          '乔发来一个很短的需求：三小时活动，一块主屏，需要一套视觉、开场前测试、现场有人能处理基础问题。预算“应该两千多”。现在最重要的动作不是报价，是 Verify。'
        ],
        choices: [
          { id: 'story:stage3:verify-matrix', title: '把需求拆成：内容 / 输出 / 现场 / 记录 / 不包含', detail: '先把责任接口写出来，再让乔确认。你不替模糊词自动补全。', cost: '注意力 -1 · 解锁 Brief 验证方法', kind: 'commitment' },
          { id: 'story:stage3:verify-visual-only', title: '先确认自己只负责视觉内容与播放文件', detail: '现场播控、网络、硬件由对方明确指定负责人。', cost: '注意力 -1 · 责任边界', kind: 'commitment' },
          { id: 'story:stage3:verify-verbal', title: '“大概懂了，跟上次差不多”', detail: '最快进入报价，但所有没说清楚的部分都可能在后面重新生成。', cost: '注意力 0 · 新增 Scope 模糊 Thread', kind: 'commitment' }
        ]
      };
    }

    if (!hasPrefix(save, 'stage3:ep7:commit:')) {
      return {
        id: 'stage3-commission-commit', kicker: 'COMMIT / RESPONSIBILITY', title: '现在决定你真正承诺哪一部分。',
        body: [
          '三种方案都不是“艺术 / 商业”的道德选择。区别在于现金、现场责任、协作关系和你答应以后必须做到的事。',
          '乔会记住的不是你选了哪一档，而是你最后交付的内容是否和承诺一致。'
        ],
        choices: [
          { id: 'story:stage3:commit-full', title: '¥2400：视觉 + 测试 + 现场值守', detail: '现金最多，也把现场恢复责任一起接到自己身上。', cost: '注意力 -2 · 承诺：完整现场', kind: 'commitment' },
          { id: 'story:stage3:commit-split', title: '¥2200：你做视觉，李技术负责现场链路', detail: '给李技术 ¥500，把技术值守明确拆出去。你仍然参加测试和交接。', cost: '注意力 -1 · 合作成本 ¥500 · 实收 ¥1700', kind: 'commitment' },
          { id: 'story:stage3:commit-package', title: '¥1400：只交可测试的视觉包与技术说明', detail: '不去现场。文件必须让别人能接手，你用收入换回注意力。', cost: '注意力 -1 · 承诺：可交付包', kind: 'commitment' }
        ]
      };
    }

    const alreadyLearnedBoundary = list(save, 'methodIds').some((id) => ['method-scope-boundary', 'method-scope-swap'].includes(id));
    return {
      id: 'stage3-commission-callback', kicker: 'CALLBACK / OLD PROBLEM', title: alreadyLearnedBoundary ? '同一句“顺便再加一个”又回来了，但这次你认识它。' : '交付前一天，对方突然想“顺便再加一个”。',
      body: [
        alreadyLearnedBoundary
          ? '这次系统不会把它伪装成新事件。你在 Stage 2 已经留下过 Scope 方法，所以现在可以直接调用旧经验，也可以故意换一种处理。'
          : (special('evt-scope-plus-one')?.hook || '报价确认后，对方突然发现“其实也不复杂”，只想顺便再加一个功能。'),
        '问题仍然是承诺：新增东西由谁承担、挤掉什么、有没有重新进入报价和排期。'
      ],
      choices: [
        { id: 'story:stage3:deliver-reuse-boundary', title: alreadyLearnedBoundary ? '直接复用旧的 Scope 边界方法' : '现在补一份“不包含什么”', detail: '把新增需求移出本次交付，留到下一次报价。', cost: '注意力 -1 · 承诺保持一致', kind: 'commitment' },
        { id: 'story:stage3:deliver-renegotiate', title: '可以加：加 ¥300，并明确换掉一项原内容', detail: '新增需求进入项目，但同时进入新的价格和取舍。', cost: '注意力 -1 · 追加收入 ¥300 · Scope swap', kind: 'commitment' },
        { id: 'story:stage3:deliver-absorb', title: '这次算了，直接做掉', detail: '当下最快，但乔会看到一次“承诺边界被无声扩大”的事实。', cost: '注意力 -2 · 新增未计价工作 Thread', kind: 'commitment' }
      ]
    };
  }

  if (!has(save, EP8_DONE)) {
    if (!hasPrefix(save, 'stage3:ep8:lead:')) {
      return {
        id: 'stage3-open-call-lead', kicker: 'EPISODE 08 / OPEN CALL', title: '陈发来一份 Open Call。第一页只能先证明一件事。',
        body: [
          '空间不大，征集写得也不神秘：项目需要一个已经存在的当前版本、清楚的发生方式，以及为什么这个空间真的需要它。',
          '你不是从零写申请。前两阶段已经留下原型、现场、故障、恢复、人物和文档。现在决定哪条证据先说话。'
        ],
        choices: [
          { id: 'story:stage3:open-lead-field', title: '先放真实现场：它已经在哪里运行过', detail: '用公开输出、黑盒测试和恢复记录证明项目不是效果图。', cost: '注意力 -1 · Evidence 导向', kind: 'build' },
          { id: 'story:stage3:open-lead-question', title: '先放项目问题：为什么还值得继续做', detail: '不堆履历，先把当前版本正在追的具体问题说清楚。', cost: '注意力 -1 · coherence +1', kind: 'build' },
          { id: 'story:stage3:open-lead-method', title: '先放方法：系统怎样被搭、测试和恢复', detail: '用方法谱系说明这个项目为什么能继续进入不同场地。', cost: '注意力 -1 · Methods 导向', kind: 'build' }
        ]
      };
    }

    if (!hasPrefix(save, 'stage3:ep8:page:')) {
      return {
        id: 'stage3-open-call-page', kicker: 'ONE PAGE / EDIT', title: '一页版本不是把十页缩成小字。你必须真的删东西。',
        body: [
          '陈只要求五件事：问题、当前版本、怎么发生、需要什么条件、一张有效证据。',
          '删掉什么，会决定这份申请看起来是在描述一个真实项目，还是在描述一个理想中的未来项目。'
        ],
        choices: [
          { id: 'story:stage3:page-concrete', title: '删掉泛泛开场，只留五个具体块', detail: '不从“当代社会中……”开始。让一分钟内第一次看到你的人知道项目怎么发生。', cost: '注意力 -1 · 解锁一页项目方法', kind: 'build' },
          { id: 'story:stage3:page-image-first', title: '把最好看的现场图放大，文字压到最少', detail: '传播效率高，但技术条件和当前问题会被弱化。', cost: '注意力 -1 · 图像导向', kind: 'build' },
          { id: 'story:stage3:page-failure-first', title: '用一次故障与恢复作为第一页', detail: '不隐藏失败，直接说明项目如何在真实条件里被改变。', cost: '注意力 -1 · 失败证据导向', kind: 'build' }
        ]
      };
    }

    return {
      id: 'stage3-open-call-submit', kicker: 'ROUTE / SUBMIT OR NOT', title: '现在这页已经能发。提交不是默认正确答案。',
      body: [
        '截止时间还有几个小时。你可以直接提交，可以先让陈回答一个真正影响现场的问题，也可以决定这次不投，把一页版本留下来给后面的项目继续用。',
        '无论结果如何，这个 Episode 记录的是你如何判断机会，而不是“有没有中奖”。'
      ],
      choices: [
        { id: 'story:stage3:open-submit', title: '按当前版本提交', detail: '结果由已经存在的 Evidence、文档与一页结构决定，不掷骰子。', cost: '时间 +1 周 · 等待结果', kind: 'commitment' },
        { id: 'story:stage3:open-ask-submit', title: '先问陈：这个空间真正不能改的条件是什么？', detail: '得到一个具体场地约束后再提交，让“机构沟通”改变版本而不是只增加关系值。', cost: '注意力 -1 · 时间 +1 周', kind: 'commitment' },
        { id: 'story:stage3:open-skip', title: '这次不提交，把一页版本留下', detail: '机会结束，但项目得到一个以后可复用的对外接口。', cost: '不获得结果 · 保留一页项目方法', kind: 'route' }
      ]
    };
  }

  if (!hasPrefix(save, 'stage3:ep9:misread:')) {
    const event = special('evt-social-misread');
    return {
      id: 'stage3-social-misread', kicker: 'EPISODE 09 / SPECIAL EVENT', title: event?.title || '帖子把事情解释歪了',
      body: [
        event?.hook || '别人把你的项目总结成一句非常适合传播、但几乎不是你原意的话。',
        '这条帖子传播得比你的项目说明快。你第一次直观看见：别人怎么描述你，会反过来改变下一批机会带着什么预期出现。'
      ],
      choices: [
        { id: 'story:stage3:misread-ignore', title: '不回应，让它作为一条外部读法存在', detail: '省注意力，但这句描述会继续作为别人认识你的一个来源。', cost: '注意力 0 · 保留误读证据', kind: 'route' },
        { id: 'story:stage3:misread-evidence', title: '只发原始现场证据和项目一页版本', detail: '不和帖子争辩，用可追溯材料把项目重新打开。', cost: '注意力 -1 · 解锁 Source Evidence Response', kind: 'commitment' },
        { id: 'story:stage3:misread-short', title: '自己写一句更短但不失真的描述', detail: '承认传播需要压缩，但主动决定哪些东西不能在压缩里消失。', cost: '注意力 -1 · 生成自己的公开描述', kind: 'build' }
      ]
    };
  }

  const cautious = special('evt-institution-cautious-invite');
  return {
    id: 'stage3-cautious-invite', kicker: 'SIGNATURE EVENT / INSTITUTION', title: cautious?.title || '愿意邀请，但不完全放心',
    body: [
      cautious?.hook || '机构愿意让你进入项目，但你之前的公开表达让他们在邀请和戒备之间保持奇怪平衡。',
      hasPrefix(save, 'stage3:ep8:result:shortlist')
        ? '陈说 Open Call 进入了测试名单，但对方同时看到了那条传播很广的帖子。他们愿意给一个测试档期，却想先知道现场风险怎么被控制。'
        : '这不是 Open Call 的“补偿奖”。机构是因为你已经存在的现场历史与传播痕迹主动找来，同时也带着它自己的限制。'
    ],
    choices: [
      { id: 'story:stage3:invite-test-slot', title: '接受测试档期，但把它定义成测试，不承诺公开结果', detail: '先让机构看到系统怎样运行和恢复，再决定是否进入正式计划。', cost: '注意力 -1 · 关系：可验证', kind: 'commitment' },
      { id: 'story:stage3:invite-constraints', title: '先让对方把限制写清楚：空间 / 时间 / 传播 / 技术', detail: '你不急着答应，用机构自己的条件决定下一步是否成立。', cost: '注意力 -1 · 解锁机构条件验证', kind: 'commitment' },
      { id: 'story:stage3:invite-decline', title: '这次不接，但留下当前版本和未来条件', detail: '不把“被邀请”自动等同于“应该接受”。关系不会因此归零。', cost: '注意力 0 · 保留机构关系', kind: 'route' }
    ]
  };
}

export function applyCareerStageThreeCommand(save: CareerState, commandId: string): CareerStageThreeCommandResult {
  let next: CareerState | null = save;
  let notice = { title: '没有发生', text: '当前资源或注意力不足。' };

  if (commandId === 'story:stage3:enter') {
    next = nextWeek(save, '第二阶段的现场档案开始在关系网络里被别人转述。');
    next = { ...next, careerStageId: 'stage-3', careerEpisodeId: 'ep-07-first-commission' };
    next = addEvidence(next, 'stage3:entered');
    next = discover(next, 'contact-qiao');
    next = message(next, 'contact-qiao', `${entryReason(save)} 有个很小的活动项目，预算不大。你愿意的话先别报价，先把你理解的 Scope 发我。`);
    next = log(next, '进入 Stage 3：网络', '机会开始因为具体项目历史、方法和他人的转述回流。');
    return { save: next, notice: { title: '网络阶段开始', text: '第一个委托不是任务卡，是一条需要先验证的 Signal。' } };
  }

  switch (commandId) {
    case 'story:stage3:verify-matrix':
      next = spend(save, 1, 0);
      if (next) { next = addEvidence(next, 'stage3:ep7:verify:matrix'); next = addMethod(next, 'method-brief-verification'); next = metric(next, 'documentation', 1); }
      notice = { title: '需求被拆成可确认的接口', text: '模糊词没有自动变成你的责任。' };
      break;
    case 'story:stage3:verify-visual-only':
      next = spend(save, 1, 0);
      if (next) { next = addEvidence(next, 'stage3:ep7:verify:visual-only'); next = addMethod(next, 'method-commission-boundary'); }
      notice = { title: '责任边界先于报价', text: '视觉内容和现场技术第一次被明确拆开。' };
      break;
    case 'story:stage3:verify-verbal':
      next = addEvidence(save, 'stage3:ep7:verify:verbal');
      next = addIssue(next, 'issue-commission-scope-ambiguity');
      notice = { title: '你很快进入了报价', text: '代价是没说清的部分已经成为真实 Thread。' };
      break;

    case 'story:stage3:commit-full':
      next = spend(save, 2, 0);
      if (next) { next = addEvidence(next, 'stage3:ep7:commit:full'); next = addEvidence(next, 'commitment:qiao:visual-test-onsite'); }
      notice = { title: '完整现场责任被接下', text: '¥2400 会在交付后进入现金流。' };
      break;
    case 'story:stage3:commit-split':
      next = spend(save, 1, 500);
      if (next) { next = addEvidence(next, 'stage3:ep7:commit:split'); next = addEvidence(next, 'commitment:qiao:visual-with-tech-partner'); next = discover(next, 'contact-li-tech'); next = message(next, 'contact-li-tech', '乔把现场链路单独拆给我了。你把文件、输出规格和最晚可改时间发我，现场我接。'); }
      notice = { title: '责任被拆成合作', text: '你支付技术合作成本，换掉单人现场责任。' };
      break;
    case 'story:stage3:commit-package':
      next = spend(save, 1, 0);
      if (next) { next = addEvidence(next, 'stage3:ep7:commit:package'); next = addEvidence(next, 'commitment:qiao:deliverable-package-only'); next = addMethod(next, 'method-handoff-package'); }
      notice = { title: '委托被收缩成可交付包', text: '这次收入更少，但没有把现场值守一起吞进来。' };
      break;

    case 'story:stage3:deliver-reuse-boundary': {
      next = spend(save, 1, 0);
      if (next) {
        next = addEvidence(next, 'stage3:ep7:callback:boundary');
        next = addMethod(next, 'method-commission-boundary');
        next = { ...next, cash: Number(next.cash || 0) + commissionFee(next) };
        next = addEvidence(next, EP7_DONE);
        next = addEvidence(next, 'relationship:qiao:commitment-matched-delivery');
        next = message(next, 'contact-qiao', '行，这次就按我们确认的范围交。你把“不包含什么”提前写出来，后面反而好做。');
        next = { ...next, careerEpisodeId: 'ep-08-open-call-one-page' };
        next = nextWeek(next, '第一个小委托完成，现金与承诺记录一起进入生涯。');
      }
      notice = { title: '旧方法改变了新事件', text: 'Scope 问题没有消失，但你不需要从零学习怎么处理。' };
      break;
    }
    case 'story:stage3:deliver-renegotiate': {
      next = spend(save, 1, 0);
      if (next) {
        next = addEvidence(next, 'stage3:ep7:callback:renegotiate');
        next = addMethod(next, 'method-scope-swap');
        next = { ...next, cash: Number(next.cash || 0) + commissionFee(next) + 300, scopeAdapted: true };
        next = addEvidence(next, EP7_DONE);
        next = addEvidence(next, 'relationship:qiao:renegotiated-scope');
        next = { ...next, careerEpisodeId: 'ep-08-open-call-one-page' };
        next = nextWeek(next, '新增需求重新进入价格和 Scope，委托按新承诺完成。');
      }
      notice = { title: '新增需求没有免费穿过项目', text: '它以价格和明确取舍进入交付。' };
      break;
    }
    case 'story:stage3:deliver-absorb': {
      next = spend(save, 2, 0);
      if (next) {
        next = addIssue(next, 'issue-unpriced-extra-work');
        next = addEvidence(next, 'stage3:ep7:callback:absorbed');
        next = { ...next, cash: Number(next.cash || 0) + commissionFee(next) };
        next = addEvidence(next, EP7_DONE);
        next = addEvidence(next, 'relationship:qiao:scope-expanded-silently');
        next = { ...next, careerEpisodeId: 'ep-08-open-call-one-page' };
        next = nextWeek(next, '委托完成，但未计价额外工作成为下一次报价前必须记住的事实。');
      }
      notice = { title: '交付完成，边界没有完成', text: '现金进来了，一条未计价工作 Thread 也留下来了。' };
      break;
    }

    case 'story:stage3:open-lead-field':
      next = spend(save, 1, 0);
      if (next) { next = addEvidence(next, 'stage3:ep8:lead:field'); next = metric(next, 'documentation', 1); }
      notice = { title: '真实现场成为第一页证据', text: '申请从“设想”切回了已经发生过的版本。' };
      break;
    case 'story:stage3:open-lead-question':
      next = spend(save, 1, 0);
      if (next) { next = addEvidence(next, 'stage3:ep8:lead:question'); next = metric(next, 'coherence', 1); }
      notice = { title: '项目问题先说话', text: '履历没有替项目回答为什么还值得继续。' };
      break;
    case 'story:stage3:open-lead-method':
      next = spend(save, 1, 0);
      if (next) { next = addEvidence(next, 'stage3:ep8:lead:method'); next = addMethod(next, 'method-evidence-led-application'); }
      notice = { title: '方法谱系进入申请', text: '场地看到的是项目怎样被搭、测、坏掉和恢复。' };
      break;

    case 'story:stage3:page-concrete':
      next = spend(save, 1, 0);
      if (next) { next = addEvidence(next, 'stage3:ep8:page:concrete'); next = addMethod(next, 'method-one-page-project'); next = metric(next, 'documentation', 1); }
      notice = { title: '十页真的被删成了一页', text: '这不是缩小字号，而是只留下能传递项目的五个块。' };
      break;
    case 'story:stage3:page-image-first':
      next = spend(save, 1, 0);
      if (next) { next = addEvidence(next, 'stage3:ep8:page:image-first'); next = addIssue(next, 'issue-application-context-thin'); }
      notice = { title: '第一页很好看', text: '代价是当前问题和技术条件被压薄了。' };
      break;
    case 'story:stage3:page-failure-first':
      next = spend(save, 1, 0);
      if (next) { next = addEvidence(next, 'stage3:ep8:page:failure-first'); next = addMethod(next, 'method-failure-as-public-evidence'); }
      notice = { title: '失败没有被藏到附录', text: '恢复过程直接成为项目为什么仍然活着的证据。' };
      break;

    case 'story:stage3:open-submit': {
      next = save;
      const strong = hasPrefix(next, 'stage3:ep8:page:concrete') && (hasPrefix(next, 'stage3:ep8:lead:field') || hasPrefix(next, 'stage3:ep8:lead:method'));
      next = addEvidence(next, strong ? 'stage3:ep8:result:shortlist' : 'stage3:ep8:result:not-selected');
      next = addEvidence(next, EP8_DONE);
      next = discover(next, 'contact-chen');
      next = message(next, 'contact-chen', strong ? '进测试名单了。不是正式邀请，他们想先看一次真实场地里怎么跑。' : '这次没进。那一页别扔，至少现在别人一分钟能知道你的项目怎么发生。');
      next = { ...next, careerEpisodeId: 'ep-09-how-they-describe-you' };
      next = nextWeek(next, strong ? 'Open Call 回来一个测试名单结果。' : 'Open Call 没有入选，但一页版本继续留在项目里。');
      notice = { title: strong ? '进入测试名单' : '这次没有入选', text: strong ? '结果来自已有 Evidence 与项目表达，不是随机抽奖。' : '机会结束，但项目获得了一个真正可传递的版本。' };
      break;
    }
    case 'story:stage3:open-ask-submit': {
      next = spend(save, 1, 0);
      if (next) {
        next = discover(next, 'contact-chen');
        next = message(next, 'contact-chen', '不能改的是吊点和闭馆时间，屏幕可以换位置。你别把项目绑死在那张效果图上。');
        next = addEvidence(next, 'stage3:ep8:venue-constraint:rigging-close-time');
        next = addEvidence(next, 'stage3:ep8:result:shortlist');
        next = addEvidence(next, EP8_DONE);
        next = addEvidence(next, 'relationship:chen:asks-before-promising');
        next = { ...next, careerEpisodeId: 'ep-09-how-they-describe-you' };
        next = nextWeek(next, '一个具体场地约束改变了提交版本；项目进入测试名单。');
      }
      notice = { title: '问对一个问题比多写一页更有用', text: '机构条件真正改动了项目，而不是只增加关系值。' };
      break;
    }
    case 'story:stage3:open-skip':
      next = addEvidence(save, 'stage3:ep8:result:skipped');
      next = addEvidence(next, EP8_DONE);
      next = addMethod(next, 'method-one-page-project');
      next = { ...next, careerEpisodeId: 'ep-09-how-they-describe-you' };
      next = nextWeek(next, '你主动放弃这次 Open Call，但保留了一页项目接口。');
      notice = { title: '机会结束，方法留下', text: '“没有提交”也成为一次明确判断，而不是漏掉任务。' };
      break;

    case 'story:stage3:misread-ignore':
      next = addEvidence(save, 'stage3:ep9:misread:ignored');
      next = addEvidence(next, 'public-reading:external-misread');
      next = markEvent(next, 'evt-social-misread');
      notice = { title: '你没有追着帖子跑', text: '误读继续存在，也正式成为别人认识项目的一个来源。' };
      break;
    case 'story:stage3:misread-evidence':
      next = spend(save, 1, 0);
      if (next) { next = addEvidence(next, 'stage3:ep9:misread:evidence-response'); next = addMethod(next, 'method-source-evidence-response'); next = markEvent(next, 'evt-social-misread'); }
      notice = { title: '项目被重新打开，而不是被重新辩论', text: '你用原始现场与一页项目作为可追溯来源。' };
      break;
    case 'story:stage3:misread-short':
      next = spend(save, 1, 0);
      if (next) { next = addEvidence(next, 'stage3:ep9:misread:self-description'); next = { ...next, publicDescription: '把实时系统带进真实空间，并把失败、恢复与交接留成可再次使用的方法。' }; next = markEvent(next, 'evt-social-misread'); }
      notice = { title: '你主动承担了一次压缩', text: '短句仍然不完整，但至少没有把项目变成另一个东西。' };
      break;

    case 'story:stage3:invite-test-slot':
      next = spend(save, 1, 0);
      if (next) { next = addEvidence(next, 'stage3:ep9:invite:test-slot'); next = addEvidence(next, 'relationship:chen:institution-test-first'); next = markEvent(next, 'evt-institution-cautious-invite'); next = addEvidence(next, STAGE3_DONE); }
      notice = { title: '邀请被改写成一次可验证的测试', text: '你没有提前承诺一个还不存在的公开结果。' };
      break;
    case 'story:stage3:invite-constraints':
      next = spend(save, 1, 0);
      if (next) { next = addEvidence(next, 'stage3:ep9:invite:constraints-first'); next = addMethod(next, 'method-institution-constraint-verification'); next = markEvent(next, 'evt-institution-cautious-invite'); next = addEvidence(next, STAGE3_DONE); }
      notice = { title: '机构限制先进入项目', text: '空间、时间、传播和技术条件不再藏在邀请之后。' };
      break;
    case 'story:stage3:invite-decline':
      next = addEvidence(save, 'stage3:ep9:invite:declined-with-future-condition');
      next = addEvidence(next, 'relationship:chen:decline-kept-context');
      next = markEvent(next, 'evt-institution-cautious-invite');
      next = addEvidence(next, STAGE3_DONE);
      notice = { title: '这次没有接', text: '关系没有归零；下一次满足条件时，这段历史仍然存在。' };
      break;
    default:
      return { save, notice };
  }

  if (!next) return { save, notice };
  if (has(next, STAGE3_DONE)) {
    next = { ...next, careerKnownFor: deriveKnownFor(next) };
    next = log(next, 'Stage 3 归档', `别人开始因为这些具体事情找你：${next.careerKnownFor.join('；')}。`, '记录');
  } else {
    next = log(next, notice.title, notice.text);
  }
  return { save: next, notice };
}
