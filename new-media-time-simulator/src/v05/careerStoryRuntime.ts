import { actionCards, contactById } from './legacyDeck.ts';
import { openingQuestProgress } from './questRuntime.ts';

export const CAREER_STORY_EVENT = 'nmas-career-story-choice';

export type CareerStoryCommandResult = {
  save: Record<string, any>;
  notice: { title: string; text: string };
};

function clamp(value: number) { return Math.max(0, Math.min(4, value)); }

function withLog(save: Record<string, any>, title: string, text: string, type = '生涯') {
  return { ...save, actionLog: [...(save.actionLog || []), { week: save.week || 1, type, title, text }] };
}

function discover(save: Record<string, any>, contactId: string) {
  const discovered = [...(save.discoveredContactIds || [])];
  const threads = { ...(save.contactThreads || {}) };
  if (!discovered.includes(contactId)) discovered.push(contactId);
  if (!threads[contactId]) threads[contactId] = contactById(contactId)?.openingMessages || [];
  return { ...save, discoveredContactIds: discovered, contactThreads: threads };
}

function applyStarterCard(save: Record<string, any>, cardId: string) {
  const card = actionCards.find((item) => item.id === cardId);
  if (!card || Number(save.attention || 0) < card.cost) return save;
  const effect = card.effect || {};
  const seed = !save.primaryProject && card.projectSeed ? card.projectSeed : save.primaryProject;
  let next = {
    ...save,
    attention: save.attention - card.cost,
    completedCardIds: (save.completedCardIds || []).includes(card.id) ? save.completedCardIds : [...(save.completedCardIds || []), card.id],
    primaryProject: seed ? { ...seed, originCardId: card.id } : save.primaryProject,
    projectMetrics: {
      coherence: clamp(Number(save.projectMetrics?.coherence || 0) + Number(effect.coherence || 0)),
      stability: clamp(Number(save.projectMetrics?.stability || 0) + Number(effect.stability || 0)),
      siteFit: clamp(Number(save.projectMetrics?.siteFit || 0) + Number(effect.siteFit || 0)),
      documentation: clamp(Number(save.projectMetrics?.documentation || 0) + Number(effect.documentation || 0))
    }
  };
  for (const id of card.discovers || []) next = discover(next, id);
  return withLog(next, card.title, card.plain, '工作');
}

function contextAction(save: Record<string, any>, options: {
  placeId: string;
  placeTitle: string;
  verb: string;
  evidence: string;
  cost: number;
  discoverContactId?: string;
  revealIssue?: boolean;
  coherence?: number;
  stability?: number;
  siteFit?: number;
  documentation?: number;
}) {
  if (!save.primaryProject || Number(save.attention || 0) < options.cost) return save;
  let next = { ...save };
  if (options.discoverContactId) next = discover(next, options.discoverContactId);
  const visited = [...(next.visitedPlaceIds || [])];
  if (!visited.includes(options.placeId)) visited.push(options.placeId);
  const revealed = [...(next.revealedIssueIds || [])];
  if (options.revealIssue && !revealed.includes('issue-context-friction')) revealed.push('issue-context-friction');
  next = {
    ...next,
    currentPlaceId: options.placeId,
    visitedPlaceIds: visited,
    attention: next.attention - options.cost,
    contextActionIds: [...(next.contextActionIds || []), `${options.placeId}:${options.verb}:${next.week}:story`],
    evidenceIds: [...(next.evidenceIds || []), `${options.evidence}:${next.week}:story`],
    revealedIssueIds: revealed,
    projectMetrics: {
      coherence: clamp(Number(next.projectMetrics?.coherence || 0) + Number(options.coherence || 0)),
      stability: clamp(Number(next.projectMetrics?.stability || 0) + Number(options.stability || 0)),
      siteFit: clamp(Number(next.projectMetrics?.siteFit || 0) + Number(options.siteFit || 0)),
      documentation: clamp(Number(next.projectMetrics?.documentation || 0) + Number(options.documentation || 0))
    }
  };
  return withLog(next, `${options.placeTitle} / ${options.verb}`, `通过叙事路径完成一次真实环境动作：${options.evidence}。`, '场域');
}

function sendWitness(save: Record<string, any>, contactId: string, text: string) {
  if (Number(save.attention || 0) < 1) return save;
  let next = discover(save, contactId);
  const contact = contactById(contactId);
  const thread = next.contactThreads?.[contactId] || contact?.openingMessages || [];
  const replyText = contactId === 'contact-lin'
    ? '可以。别发完整提案，发我一个能跑的版本和你最不确定的地方。'
    : contactId === 'contact-m'
      ? '别只拍最终画面。失败、安装和改动的顺序更重要。'
      : '发一页版本。第一屏让我知道它在哪里发生、观众看到什么、现在缺什么。';
  next = {
    ...next,
    attention: next.attention - 1,
    contactThreads: { ...next.contactThreads, [contactId]: [...thread, { from: 'you', text }] },
    pendingReplies: [...(next.pendingReplies || []), { contactId, dueWeek: Number(next.week || 1) + 1, text: replyText }]
  };
  return withLog(next, `把当前版本发给 ${contact?.name || contactId}`, text, '人物');
}

function advanceWeek(save: Record<string, any>) {
  const nextWeek = Number(save.week || 1) + 1;
  const due = (save.pendingReplies || []).filter((item: any) => item.dueWeek <= nextWeek);
  const waiting = (save.pendingReplies || []).filter((item: any) => item.dueWeek > nextWeek);
  const threads = { ...(save.contactThreads || {}) };
  const evidence = [...(save.evidenceIds || [])];
  for (const item of due) {
    const contact = contactById(item.contactId);
    threads[item.contactId] = [...(threads[item.contactId] || contact?.openingMessages || []), { from: 'them', text: item.text }];
    evidence.push(`feedback:${item.contactId}:${nextWeek}`);
  }
  return withLog({
    ...save,
    week: nextWeek,
    attention: Number(save.attentionMax || 6),
    cash: Number(save.cash || 0) - 450,
    pendingReplies: waiting,
    contactThreads: threads,
    evidenceIds: evidence,
    receivedFeedbackCount: Number(save.receivedFeedbackCount || 0) + due.length
  }, `第 ${nextWeek} 周`, due.length ? `${due.length} 条回复回来。固定支出 -450。` : '没有重要回复。固定支出 -450。', '时间');
}

function diagnose(save: Record<string, any>, methodId: string, evidenceId: string, label: string, scopeAdapted = false) {
  if (Number(save.attention || 0) < 1) return save;
  const revealed = [...(save.revealedIssueIds || [])];
  if (!revealed.length) revealed.push('issue-context-friction');
  const resolved = [...(save.resolvedIssueIds || [])];
  const target = revealed.find((id) => !resolved.includes(id));
  if (target) resolved.push(target);
  const methods = [...(save.methodIds || [])];
  if (!methods.includes(methodId)) methods.push(methodId);
  let next = {
    ...save,
    attention: save.attention - 1,
    revealedIssueIds: revealed,
    resolvedIssueIds: resolved,
    methodIds: methods,
    scopeAdapted: Boolean(save.scopeAdapted || scopeAdapted),
    evidenceIds: [...(save.evidenceIds || []), `${evidenceId}:${save.week}:story`]
  };
  if (methodId === 'method-diagnose-from-evidence') next = { ...next, projectMetrics: { ...next.projectMetrics, stability: clamp(Number(next.projectMetrics?.stability || 0) + 1) } };
  if (methodId === 'method-degrade-output') next = { ...next, projectMetrics: { ...next.projectMetrics, coherence: clamp(Number(next.projectMetrics?.coherence || 0) + 1) } };
  if (methodId === 'method-temporary-bypass') {
    const revealedNext = [...next.revealedIssueIds];
    if (!revealedNext.includes('issue-temporary-bypass-debt')) revealedNext.push('issue-temporary-bypass-debt');
    next = { ...next, revealedIssueIds: revealedNext };
  }
  return withLog(next, label, `问题被转化为方法：${methodId}。`, '工作');
}

function publicOutput(save: Record<string, any>, options: {
  placeId: string;
  placeTitle: string;
  cashDelta: number;
  attentionCost: number;
  adapt?: boolean;
  outputLevel?: number;
  contactId: string;
  evidence: string;
  note: string;
}) {
  if (Number(save.attention || 0) < options.attentionCost || Number(save.cash || 0) + options.cashDelta < 0) return save;
  let next = discover(save, options.contactId);
  const visited = [...(next.visitedPlaceIds || [])];
  if (!visited.includes(options.placeId)) visited.push(options.placeId);
  const contextActions = [...(next.contextActionIds || []), `${options.placeId}:run:${next.week}:public-story`];
  const workbench = { ...(next.workbench || {}) };
  if (options.outputLevel) workbench.output = Math.max(Number(workbench.output || 1), options.outputLevel);
  next = {
    ...next,
    currentPlaceId: options.placeId,
    visitedPlaceIds: visited,
    attention: next.attention - options.attentionCost,
    cash: next.cash + options.cashDelta,
    scopeAdapted: Boolean(next.scopeAdapted || options.adapt),
    workbench,
    contextActionIds: contextActions,
    publicOutputCount: Number(next.publicOutputCount || 0) + 1,
    evidenceIds: [...(next.evidenceIds || []), `${options.evidence}:${next.week}:story`],
    projectMetrics: {
      ...next.projectMetrics,
      siteFit: clamp(Number(next.projectMetrics?.siteFit || 0) + 1),
      documentation: clamp(Number(next.projectMetrics?.documentation || 0) + 1)
    }
  };
  next = withLog(next, `第一次公开 / ${options.placeTitle}`, options.note, '项目');
  const progress = openingQuestProgress(next as any);
  if (progress.complete && !(next.evidenceIds || []).includes('career:stage-1:complete')) {
    next = {
      ...next,
      evidenceIds: [...next.evidenceIds, 'career:stage-1:complete'],
      actionLog: [...next.actionLog, { week: next.week, type: '记录', title: 'Stage 1 归档', text: '第一个能被别人看见的版本已经留下完整轨迹：原型、环境、反馈、故障、方法和第一次公开。' }]
    };
  }
  return next;
}

export function applyCareerStoryCommand(save: Record<string, any>, commandId: string): CareerStoryCommandResult {
  let next = save;
  let notice = { title: '没有发生', text: '当前条件不允许这个选择。' };

  switch (commandId) {
    case 'story:prototype:minimal':
      next = applyStarterCard(save, 'studio-minimum-system');
      notice = { title: '第一个版本开始运行', text: '你先保留了输入、规则和反馈。' };
      break;
    case 'story:prototype:archive':
      next = applyStarterCard(save, 'studio-media-archaeology');
      notice = { title: '旧媒介重新进入现在', text: '一个失效格式开始变成项目问题。' };
      break;
    case 'story:prototype:materials':
      next = applyStarterCard(save, 'studio-sort-material');
      notice = { title: '旧材料被重新组织', text: '失败录像和版本文件形成了第一个项目种子。' };
      break;
    case 'story:context:studio':
      next = contextAction(save, { placeId: 'place-basic-studio', placeTitle: '基础工作室', verb: '运行', evidence: 'run-log', cost: 2, discoverContactId: 'contact-lin', revealIssue: true, stability: 1 });
      notice = { title: '它离开了自己的桌面', text: '另一个环境立刻暴露了新的摩擦。' };
      break;
    case 'story:context:archive':
      next = contextAction(save, { placeId: 'place-archive-reading', placeTitle: '媒体考古与阅读', verb: '记录', evidence: 'field-note', cost: 1, discoverContactId: 'contact-m', documentation: 1 });
      notice = { title: '环境变成了一条 Note', text: '你先把外部条件带回项目，而不是急着扩大制作。' };
      break;
    case 'story:context:peer':
      next = contextAction(save, { placeId: 'place-peer-meet', placeTitle: '同行聚点', verb: '记录', evidence: 'peer-context-note', cost: 1, discoverContactId: 'contact-lin', coherence: 1 });
      notice = { title: '项目第一次进入别人说话的环境', text: '你开始听见自己没写进说明里的部分。' };
      break;
    case 'story:witness:lin':
      next = sendWitness(save, 'contact-lin', '这是现在能跑的版本。我最不确定的是：它离开我自己的电脑以后，规则还成立吗？');
      notice = { title: '版本发出去了', text: '回复不会立刻回来。' };
      break;
    case 'story:witness:m':
      next = sendWitness(save, 'contact-m', '我不想只留最终效果。你能先看一下，现在最值得记录的失败和改动是什么吗？');
      notice = { title: '过程被交给另一个人看', text: '记录开始成为项目的一部分。' };
      break;
    case 'story:witness:chen':
      next = sendWitness(save, 'contact-chen', '我先不给完整提案，只发一页：它在哪里发生、观众看到什么、现在缺什么。');
      notice = { title: '一页版本发出去了', text: '机构语言第一次进入项目。' };
      break;
    case 'story:time:wait':
      next = advanceWeek(save);
      notice = { title: '时间向前了一周', text: '固定支出发生，延迟回复也可能回来。' };
      break;
    case 'story:test:blackbox':
      next = contextAction(save, { placeId: 'place-blackbox', placeTitle: '黑盒 / 俱乐部', verb: '运行', evidence: 'blackbox-test', cost: 2, discoverContactId: 'contact-li-tech', revealIssue: true, siteFit: 1 });
      notice = { title: '真实环境开始反击', text: '一个桌面上看不到的问题被暴露。' };
      break;
    case 'story:diagnose:trace':
      next = diagnose(save, 'method-diagnose-from-evidence', 'diagnostic-trace', '沿信号链逐段排查');
      notice = { title: '故障被解释了', text: '你得到的是一条可重复的方法，不只是“这次修好了”。' };
      break;
    case 'story:diagnose:bypass':
      next = diagnose(save, 'method-temporary-bypass', 'diagnostic-bypass', '临时绕过故障点', true);
      notice = { title: '现场先活下来', text: '绕过方案有效，但留下一笔以后必须偿还的制作债务。' };
      break;
    case 'story:diagnose:degrade':
      next = diagnose(save, 'method-degrade-output', 'diagnostic-degrade', '主动降级输出范围', true);
      notice = { title: '范围被主动收缩', text: '少做一点，让核心关系可靠成立。' };
      break;
    case 'story:public:blackbox-minimal':
      next = publicOutput(save, { placeId: 'place-blackbox', placeTitle: '两小时黑盒', cashDelta: -150, attentionCost: 2, adapt: true, contactId: 'contact-li-tech', evidence: 'public-blackbox-minimal', note: '你把第一次公开收缩成当前能力可以可靠完成的版本。' });
      notice = { title: '第一次公开完成', text: '不是最大版本，但它真的在现场成立过。' };
      break;
    case 'story:public:project-space':
      next = publicOutput(save, { placeId: 'place-project-space', placeTitle: '独立项目空间', cashDelta: -300, attentionCost: 2, adapt: true, contactId: 'contact-chen', evidence: 'public-project-space', note: '你用更清楚的观看路径和更少的输出换取了可解释的第一次公开。' });
      notice = { title: '一个小空间记住了这个版本', text: '现场、文档和机构关系第一次连在一起。' };
      break;
    case 'story:public:borrow-output':
      next = publicOutput(save, { placeId: 'place-institution', placeTitle: '机构测试现场', cashDelta: -800, attentionCost: 2, outputLevel: 2, contactId: 'contact-chen', evidence: 'public-borrow-output', note: '你花钱借到一套更可靠的输出，把范围保住，但现金压力会进入下一周。' });
      notice = { title: '能力不是只靠升级条获得', text: '你用现金和关系换来一次临时可用的输出能力。' };
      break;
    default:
      break;
  }

  if (next === save) return { save, notice };
  return { save: next, notice };
}
