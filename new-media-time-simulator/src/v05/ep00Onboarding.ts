import { profileFromPreset, resourcePackById, type CareerProfile } from './careerContent.ts';
import { mergeStoredSpecialCarryoversIntoCareer } from './specialCarryover.ts';

export type Ep00Identity = 'system' | 'space' | 'story';
export type Ep00Capture = 'photo' | 'scan' | 'audio';

export const EP00_STATE_KEY = 'nmas-ep00-onboarding-v1';
export const EP00_BLUEPRINT_COMPLETE_KEY = 'nmas-ep00-blueprint-complete-v1';
export const EP00_ARCHIVE_KEY = 'nmas-ep00-archive-v1';

export const ep00IdentityOptions = [
  {
    id: 'system' as const,
    title: '先让东西真的运行',
    note: '你会更快注意输入、处理、输出和系统是否稳定。',
    signals: ['systems']
  },
  {
    id: 'space' as const,
    title: '先看人在空间里怎么感受',
    note: '你会更快注意距离、尺度、路线和现场条件。',
    signals: ['spatial']
  },
  {
    id: 'story' as const,
    title: '先抓住一个值得继续追的问题',
    note: '你会更快注意素材为什么被留下、怎么被重新组织。',
    signals: ['research', 'media']
  }
];

export const ep00WorkbenchObjects = [
  {
    id: 'computer',
    title: '电脑',
    label: '工具',
    text: '它不是“能力值”。以后真正学会的软件、节点和方法，都会回到这里成为可调用工具。'
  },
  {
    id: 'drive',
    title: '移动硬盘',
    label: 'Assets',
    text: '照片、声音、模型、失败版本和现场资料都会成为 Asset。它们可以在以后项目里再次使用。'
  },
  {
    id: 'archive',
    title: '空白档案',
    label: 'Records',
    text: '项目结束后不会只显示“任务完成”。你会留下方法、知识、版本、人物记忆和创作记录。'
  }
];

export const ep00CaptureOptions = [
  {
    id: 'photo' as const,
    code: 'PHOTO_SET_001',
    title: '拍下来',
    verb: '拍摄',
    prompt: '把一个你经过的地方拍成一组可以重新组织的图像。',
    asset: '36 张照片 · 460 MB',
    methodId: 'method-observe-frame',
    method: '观察与取景',
    knowledgeId: 'knowledge-sequence',
    knowledge: '图像序列可以重新组织时间与空间',
    memory: '第一次意识到：记录不是保存全部，而是决定什么值得被留下。',
    signals: ['media'],
    sourceNodeId: 'ep00-photo-source',
    processNodeId: 'ep00-photo-process',
    outputNodeId: 'ep00-photo-output'
  },
  {
    id: 'scan' as const,
    code: 'SCAN_SET_001',
    title: '扫下来',
    verb: '空间采集',
    prompt: '把一个小空间变成可以重新观察和处理的三维资料。',
    asset: '1 个空间采集 · 1.8 GB',
    methodId: 'method-spatial-capture',
    method: '空间采集',
    knowledgeId: 'knowledge-space-as-data',
    knowledge: '现实空间可以被采样成可编辑的数据',
    memory: '第一次意识到：空间不是背景，它也可以成为素材。',
    signals: ['spatial', 'systems'],
    sourceNodeId: 'ep00-scan-source',
    processNodeId: 'ep00-scan-process',
    outputNodeId: 'ep00-scan-output'
  },
  {
    id: 'audio' as const,
    code: 'AUDIO_SET_001',
    title: '听下来',
    verb: '声音采集',
    prompt: '记录同一个地方的几段声音，再决定哪些声音应该留在一起。',
    asset: '4 段声音 · 312 MB',
    methodId: 'method-listen-layer',
    method: '声音分层',
    knowledgeId: 'knowledge-sound-space',
    knowledge: '声音也能描述距离、事件和空间',
    memory: '第一次意识到：看不见的东西也可以成为空间记录。',
    signals: ['media', 'spatial'],
    sourceNodeId: 'ep00-audio-source',
    processNodeId: 'ep00-audio-process',
    outputNodeId: 'ep00-audio-output'
  }
];

export type Ep00State = {
  schema: 'nmas-ep00-v1';
  phase: 'intro' | 'workbench' | 'capture' | 'asset' | 'blueprint' | 'archive';
  identity: Ep00Identity | null;
  inspectedWorkbenchIds: string[];
  capture: Ep00Capture | null;
};

export function createEp00State(): Ep00State {
  return {
    schema: 'nmas-ep00-v1',
    phase: 'intro',
    identity: null,
    inspectedWorkbenchIds: [],
    capture: null
  };
}

export function ep00CaptureById(id?: string | null) {
  return ep00CaptureOptions.find((item) => item.id === id) || ep00CaptureOptions[0];
}

export function buildEp00Archive(state: Ep00State) {
  const capture = ep00CaptureById(state.capture);
  return {
    schema: 'nmas-ep00-archive-v1',
    id: 'record-001-first-capture',
    title: '创作记录 001 · 第一次记录',
    asset: { id: capture.code, title: capture.asset, type: capture.id },
    method: { id: capture.methodId, title: capture.method },
    knowledge: { id: capture.knowledgeId, title: capture.knowledge },
    memory: capture.memory,
    identity: state.identity,
    completedAt: new Date().toISOString()
  };
}

export function buildEp00CareerProfile(state: Ep00State): CareerProfile {
  const capture = ep00CaptureById(state.capture);
  const base = profileFromPreset('preset-desk', 'hybrid');
  const identitySignals = ep00IdentityOptions.find((item) => item.id === state.identity)?.signals || [];
  const signalTags = [...new Set([...base.signalTags, ...identitySignals, ...capture.signals])];
  return {
    ...base,
    id: `career-ep00-${state.identity || 'open'}-${capture.id}`,
    title: '从第一次记录开始',
    description: `你没有先选择职业。你从一次${capture.verb}开始，已经留下第一份 Asset、方法和知识。`,
    signalTags,
    firstProjectPrompt: `把 ${capture.code} 重新组织成一个别人能真正看到或感受到的版本。`,
    source: 'preset'
  };
}

export function buildEp00CareerSave(profile: CareerProfile, state: Ep00State) {
  const pack = resourcePackById(profile.resourcePackId);
  const capture = ep00CaptureById(state.capture);
  const archive = buildEp00Archive(state);
  const save = {
    schema: 'triad-field-workbench-records-20260811',
    screen: 'play',
    week: 1,
    attention: 6,
    attentionMax: 6,
    cash: pack.cash,
    primaryLayer: 'workbench',
    fieldTab: 'places',
    workbenchTab: 'actions',
    recordsTab: 'quests',
    currentPlaceId: null,
    completedCardIds: [],
    visitedPlaceIds: [],
    discoveredContactIds: profile.knownNpcIds,
    contactThreads: {},
    pendingReplies: [],
    receivedFeedbackCount: 0,
    evidenceIds: [archive.id],
    contextActionIds: [],
    revealedIssueIds: [],
    resolvedIssueIds: [],
    methodIds: [capture.methodId],
    readKnowledgeEntryIds: [capture.knowledgeId],
    primaryProject: null,
    projectMetrics: { coherence: 1, stability: 1, siteFit: 0, documentation: 1 },
    workbench: pack.workbench,
    scopeAdapted: false,
    publicOutputCount: 0,
    seenEventIds: [],
    activeEventId: null,
    actionLog: [
      { week: 0, type: 'EP00', title: '第一次记录', text: `${capture.code} 已进入 Asset Library。` },
      { week: 1, type: '生涯', title: '档案建立', text: profile.firstProjectPrompt }
    ],
    careerStageId: 'stage-1',
    careerEpisodeId: 'ep-01-runnable',
    careerProfileId: profile.id,
    ep00Archive: archive
  };
  return mergeStoredSpecialCarryoversIntoCareer(save);
}
