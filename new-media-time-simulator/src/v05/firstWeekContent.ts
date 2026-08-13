import { createRunState } from './runState.ts';
import type { NarrativeAction, NarrativeNode, RunState, Work } from './runState.ts';
import type { PlayerProblem, SurfaceContract, SurfaceItem } from './controlSystem.ts';

export type FirstWeekChoice = NarrativeAction & { note: string };
export type FirstWeekScene = {
  id: string;
  moment: 'problem' | 'ending';
  time: string;
  title: string;
  lines: string[];
  problemId?: string;
  preview: 'broken' | 'minimal' | 'responsive' | 'fragile' | 'touch' | 'desktop' | 'guided' | 'video';
  choices: FirstWeekChoice[];
};

export const firstWeekProblems: PlayerProblem[] = [
  { id: 'fix-black-screen', objectId: 'work-web-01', goal: '让网页离开当前窗口也能打开' },
  { id: 'test-outside-laptop', objectId: 'work-web-01', goal: '确认作品在别的设备上会发生什么' },
  { id: 'respond-to-feedback', objectId: 'work-web-01', goal: '决定是否根据刚收到的反应修改作品' },
  { id: 'deliver-by-ten', objectId: 'work-web-01', goal: '上午十点前给场地方一个能查看的版本' }
];

const work = (actionId: string, label: string, state: 'rough' | 'testable'): Work => ({
  id: 'work-web-01',
  workingTitle: '还没取名的互动网页',
  projectId: 'project-first-link',
  status: state === 'testable' ? 'testable' : 'draft',
  originEventId: 'screen-went-black',
  decisionIds: [actionId],
  versions: [{ id: 'version-01', label, state, createdByActionId: actionId }]
});

const firstChoices: FirstWeekChoice[] = [
  {
    id: 'cut-last-effect', label: '删掉最后加的效果', note: '先救活。丑一点，明天再说。', nextNodeId: 'test-another-screen',
    result: { summary: '画面回来了。那个效果死了，作品还活着。', delta: {
      addFlags: ['version-minimal'], addEventIds: ['screen-went-black', 'first-version-made'], addWork: work('cut-last-effect', '能打开的简化版', 'testable')
    } }
  },
  {
    id: 'read-first-error', label: '看第一条红色报错', note: '一共 37 条。先赌第一条不是废话。', nextNodeId: 'test-another-screen',
    result: { summary: '第一条真有用：画面尺寸写死了。你改完，窗口怎么缩都能打开。', delta: {
      addFlags: ['version-responsive'], addEventIds: ['screen-went-black', 'first-version-made'], addWork: work('read-first-error', '修过尺寸的版本', 'testable')
    } }
  },
  {
    id: 'restore-window-size', label: '把窗口拉回原来的大小', note: '在你的电脑上，继续假装世界没有小屏幕。', nextNodeId: 'test-another-screen',
    result: { summary: '画面回来了。只要全世界都用你这台电脑，问题就解决了。', delta: {
      addFlags: ['version-fragile'], addEventIds: ['screen-went-black', 'first-version-made'], addWork: work('restore-window-size', '仅在自己电脑能跑的版本', 'rough')
    } }
  }
];

function outsideResult(run: RunState, source: 'phone' | 'friend' | 'social') {
  const minimal = run.flags.includes('version-minimal');
  const responsive = run.flags.includes('version-responsive');
  if (source === 'phone') {
    if (minimal) return '手机能打开。画面很朴素，至少没有变成遗照。';
    if (responsive) return '手机上画面出现了，但鼠标互动到了触屏上开始装死。';
    return '手机也是黑屏。世界没有同意统一使用你那台电脑。';
  }
  if (source === 'friend') {
    if (minimal) return '朋友回：有个点在动。是加载动画吗？';
    if (responsive) return '朋友回：能打开。然后问：“所以我要干嘛？”';
    return '朋友回了一张黑屏截图，没有配文字。信息很完整。';
  }
  if (minimal) return '有人说像故障，有人说像极简。你暂时分不出哪句更危险。';
  if (responsive) return '几个点赞，一个人问链接。其余人继续刷走。';
  return '录屏很好看。有人要链接。问题重新回来了。';
}

function outsideChoices(run: RunState): FirstWeekChoice[] {
  return [
    {
      id: 'open-on-phone', label: '用自己手机打开', note: '先换一块屏幕。', nextNodeId: 'respond-to-feedback',
      result: { summary: outsideResult(run, 'phone'), delta: {
        addFlags: ['checked-on-phone'], addEventIds: ['outside-check-complete'],
        updateWork: { workId: 'work-web-01', decisionId: 'open-on-phone' },
        addFeedback: { id: 'feedback-phone', source: 'self-test', workId: 'work-web-01', versionId: 'version-01', text: outsideResult(run, 'phone'), createdByActionId: 'open-on-phone', status: 'new' }
      } }
    },
    {
      id: 'send-to-awake-friend', label: '发给一个还没睡的朋友', note: '请对方直接点链接。别先解释作品。', nextNodeId: 'respond-to-feedback',
      result: { summary: outsideResult(run, 'friend'), delta: {
        addFlags: ['checked-by-friend'], addEventIds: ['outside-check-complete'],
        updateWork: { workId: 'work-web-01', decisionId: 'send-to-awake-friend' },
        addFeedback: { id: 'feedback-friend', source: 'friend', workId: 'work-web-01', versionId: 'version-01', text: outsideResult(run, 'friend'), createdByActionId: 'send-to-awake-friend', status: 'new' }
      } }
    },
    {
      id: 'post-ten-second-clip', label: '发十秒录屏到社交平台', note: '看谁真的停下来，不只看点赞。', nextNodeId: 'respond-to-feedback',
      result: { summary: outsideResult(run, 'social'), delta: {
        addFlags: ['checked-by-social'], addEventIds: ['outside-check-complete'],
        updateWork: { workId: 'work-web-01', decisionId: 'post-ten-second-clip' },
        addFeedback: { id: 'feedback-social', source: 'social', workId: 'work-web-01', versionId: 'version-01', text: outsideResult(run, 'social'), createdByActionId: 'post-ten-second-clip', status: 'new' }
      } }
    }
  ];
}

function respondTo(feedbackId: string, actionId: string, status: 'used' | 'ignored') {
  return { feedbackId, responseActionId: actionId, status };
}

function responseChoices(run: RunState): FirstWeekChoice[] {
  const feedback = run.feedback.at(-1);
  const feedbackId = feedback?.id || 'feedback-phone';
  const ignore: FirstWeekChoice = {
    id: 'ignore-feedback', label: '先不管这条反馈', note: '作品不改。风险也不改。', nextNodeId: 'deliver-link',
    result: { summary: '你把这条反馈留在聊天框里。它没有消失，只是安静了。', delta: {
      addFlags: ['response-ignored'], updateWork: { workId: 'work-web-01', decisionId: 'ignore-feedback' }, updateFeedback: respondTo(feedbackId, 'ignore-feedback', 'ignored')
    } }
  };

  if (feedback?.source === 'friend') return [
    {
      id: 'add-one-line-instruction', label: '加一句“拖动这些圆”', note: '不写概念。只告诉对方怎么动手。', nextNodeId: 'deliver-link',
      result: { summary: '页面多了一句话。它不像艺术宣言，胜在真的有用。', delta: {
        addFlags: ['response-guided'], updateFeedback: respondTo(feedbackId, 'add-one-line-instruction', 'used'),
        updateWork: { workId: 'work-web-01', decisionId: 'add-one-line-instruction', addVersion: { id: 'version-02-guided', label: '写清怎么操作的版本', state: 'testable', createdByActionId: 'add-one-line-instruction' } }
      } }
    },
    {
      id: 'ask-friend-retry', label: '让朋友别问，随便点', note: '再测一次。不解释。', nextNodeId: 'deliver-link',
      result: { summary: '朋友乱点一通，终于拖动了圆。然后回：“哦，原来能动。”', delta: {
        addFlags: ['response-retested'], updateFeedback: respondTo(feedbackId, 'ask-friend-retry', 'used'),
        updateWork: { workId: 'work-web-01', decisionId: 'ask-friend-retry' },
        addFeedback: { id: 'feedback-friend-retry', source: 'friend', workId: 'work-web-01', versionId: 'version-01', text: '哦，原来能动。', createdByActionId: 'ask-friend-retry', status: 'new' }
      } }
    },
    ignore
  ];

  if (feedback?.source === 'social' || feedback?.source === 'group') return [
    {
      id: 'send-real-link', label: '把真实链接发给问的人', note: '录屏能骗人。链接比较诚实。', nextNodeId: 'deliver-link',
      result: { summary: '对方点开了。回：“电脑能看，手机不好点。”比一个赞有用。', delta: {
        addFlags: ['response-real-link'], updateFeedback: respondTo(feedbackId, 'send-real-link', 'used'),
        updateWork: { workId: 'work-web-01', decisionId: 'send-real-link' },
        addFeedback: { id: 'feedback-social-link', source: 'social', workId: 'work-web-01', versionId: 'version-01', text: '电脑能看，手机不好点。', createdByActionId: 'send-real-link', status: 'new' }
      } }
    },
    {
      id: 'recut-opening', label: '把录屏开头剪短', note: '先让画面动。别让人等你铺垫。', nextNodeId: 'deliver-link',
      result: { summary: '你剪掉前六秒黑场。作品没变，别人终于来得及看见它。', delta: {
        addFlags: ['response-recut'], updateFeedback: respondTo(feedbackId, 'recut-opening', 'used'),
        updateWork: { workId: 'work-web-01', decisionId: 'recut-opening', addVersion: { id: 'version-02-clip', label: '开头直接动起来的录屏', state: 'testable', createdByActionId: 'recut-opening' } }
      } }
    },
    ignore
  ];

  return [
    {
      id: 'make-touch-version', label: '把鼠标操作换成触摸', note: '让手指也能拖动。', nextNodeId: 'deliver-link',
      result: { summary: '手机上终于能拖。你用一根手指修了一个只在鼠标里存在的世界。', delta: {
        addFlags: ['response-touch'], updateFeedback: respondTo(feedbackId, 'make-touch-version', 'used'),
        updateWork: { workId: 'work-web-01', decisionId: 'make-touch-version', addVersion: { id: 'version-02-touch', label: '手机也能拖动的版本', state: 'testable', createdByActionId: 'make-touch-version' } }
      } }
    },
    {
      id: 'declare-desktop-only', label: '只做电脑版，写清楚', note: '不假装全平台。', nextNodeId: 'deliver-link',
      result: { summary: '你写明“请用电脑打开”。范围变小，坑也变小。', delta: {
        addFlags: ['response-desktop'], updateFeedback: respondTo(feedbackId, 'declare-desktop-only', 'used'),
        updateWork: { workId: 'work-web-01', decisionId: 'declare-desktop-only', addVersion: { id: 'version-02-desktop', label: '写清设备要求的版本', state: 'testable', createdByActionId: 'declare-desktop-only' } }
      } }
    },
    ignore
  ];
}

function previewAfterResponse(run: RunState): FirstWeekScene['preview'] {
  if (run.flags.includes('response-touch')) return 'touch';
  if (run.flags.includes('response-desktop')) return 'desktop';
  if (run.flags.includes('response-guided')) return 'guided';
  if (run.flags.includes('response-recut')) return 'video';
  return previewAfterFirst(run);
}

function linkReply(run: RunState) {
  if (run.flags.includes('response-touch')) return '场地方回：“收到，手机也能打开。”';
  if (run.flags.includes('response-desktop')) return '场地方回：“收到。现场会准备电脑。”';
  if (run.flags.includes('response-guided')) return '场地方回：“收到。拖动提示看见了。”';
  if (run.flags.includes('response-retested')) return '场地方回：“收到。现场试了一遍，能动。”';
  if (run.flags.includes('response-real-link')) return '场地方回：“收到。刚才已经有人帮你点过了。”';
  if (run.flags.includes('response-recut')) return '场地方回：“录屏很清楚。链接也能打开。”';
  if (run.flags.includes('version-fragile')) return '场地方回：“这里是黑的。你发错链接了吗？”';
  if (run.flags.includes('version-minimal')) return '场地方回：“收到。这个点是在加载吗？”';
  return '场地方回：“收到。所以现场要怎么操作？”';
}

function deliveryChoices(): FirstWeekChoice[] {
  return [
    {
      id: 'send-link-now', label: '现在发链接', note: '关电脑。赌现场和刚才一样。', nextNodeId: 'morning-link',
      result: { summary: '上午 9:54。链接发出去了。', delta: {
        addFlags: ['delivered-link'], addEventIds: ['first-link-delivered'],
        updateWork: { workId: 'work-web-01', status: 'testable', decisionId: 'send-link-now', addVersion: { id: 'version-03-link', label: '交给场地方的链接', state: 'shared', createdByActionId: 'send-link-now' } }
      } }
    },
    {
      id: 'send-video-first', label: '先发录屏，链接下午补', note: '换几个小时。债也会活到下午。', nextNodeId: 'morning-video',
      result: { summary: '上午 9:57。视频发出去了。“链接稍后”是今天最危险的四个字。', delta: {
        addFlags: ['delivered-video'], addEventIds: ['first-video-delivered'],
        updateWork: { workId: 'work-web-01', status: 'draft', decisionId: 'send-video-first', addVersion: { id: 'version-03-video', label: '先交录屏的版本', state: 'shared', createdByActionId: 'send-video-first' } }
      } }
    },
    {
      id: 'ask-one-more-hour', label: '跟场地方说晚一小时', note: '多一小时。先欠一句“抱歉”。', nextNodeId: 'morning-late',
      result: { summary: '上午 9:38。你承认还没好。对方给到十一点。', delta: {
        addFlags: ['delivery-delayed'], addEventIds: ['first-deadline-moved'], updateWork: { workId: 'work-web-01', decisionId: 'ask-one-more-hour' }
      } }
    }
  ];
}

function previewAfterFirst(run: RunState): FirstWeekScene['preview'] {
  if (run.flags.includes('version-responsive')) return 'responsive';
  if (run.flags.includes('version-fragile')) return 'fragile';
  return 'minimal';
}

export function firstWeekScene(run: RunState): FirstWeekScene {
  if (run.currentNodeId === 'desk-black-screen') return {
    id: 'desk-black-screen', moment: 'problem', time: '凌晨 1:47', title: '你做的网页黑屏了。',
    lines: ['你把窗口缩小，画面没跟着缩，只剩黑色。明天上午十点，场地方要这个链接。'],
    problemId: 'fix-black-screen', preview: 'broken', choices: firstChoices
  };
  if (run.currentNodeId === 'test-another-screen') return {
    id: 'test-another-screen', moment: 'problem', time: '凌晨 2:26', title: run.flags.includes('version-fragile') ? '它在你电脑上好好的。' : '画面回来了。先别急着感动。',
    lines: [run.history.at(-1)?.summary || '', '场地方明早会用什么打开，你不知道。现在可以换一块屏幕试试。'],
    problemId: 'test-outside-laptop', preview: previewAfterFirst(run), choices: outsideChoices(run)
  };
  if (run.currentNodeId === 'respond-to-feedback') return {
    id: 'respond-to-feedback', moment: 'problem', time: '凌晨 2:39',
    title: run.feedback.at(-1)?.source === 'friend' ? '朋友回消息了。' : run.feedback.at(-1)?.source === 'social' ? '有人停下来看了。' : '手机给你看了答案。',
    lines: [run.feedback.at(-1)?.text || '另一个设备给出了答案。', '这条反馈，改不改？'],
    problemId: 'respond-to-feedback', preview: previewAfterFirst(run), choices: responseChoices(run)
  };
  if (run.currentNodeId === 'deliver-link') return {
    id: 'deliver-link', moment: 'problem', time: '凌晨 3:14', title: '上午十点要链接。',
    lines: [run.history.at(-1)?.summary || '', '现在怎么交？'],
    problemId: 'deliver-by-ten', preview: previewAfterResponse(run), choices: deliveryChoices()
  };
  if (run.currentNodeId === 'morning-video') return {
    id: 'morning-video', moment: 'ending', time: '上午 9:57', title: '视频发出去了。链接没有。',
    lines: ['场地方回：“收到。链接呢？”'], preview: 'video', choices: []
  };
  if (run.currentNodeId === 'morning-late') return {
    id: 'morning-late', moment: 'ending', time: '上午 9:38', title: '你开口要了一个小时。',
    lines: ['场地方回：“可以。十一点前给我。”'], preview: previewAfterResponse(run), choices: []
  };
  return {
    id: 'morning-link', moment: 'ending', time: '上午 9:54', title: '链接发出去了。',
    lines: [linkReply(run)], preview: previewAfterResponse(run), choices: []
  };
}

const budget = { maxPrimaryItems: 1, maxActions: 3, maxNewConcepts: 1, maxCharacters: 240 };

export function firstWeekSurface(scene: FirstWeekScene): SurfaceContract {
  const items: SurfaceItem[] = [
    { id: `${scene.id}-title`, role: scene.moment === 'ending' ? 'result' : 'problem', text: scene.title, priority: 'primary', problemId: scene.problemId, effectRefs: scene.moment === 'ending' ? ['work.versions'] : undefined, factId: `${scene.id}-headline` },
    ...scene.lines.filter(Boolean).map((line, index) => ({ id: `${scene.id}-line-${index}`, role: scene.moment === 'ending' ? 'result' as const : 'context' as const, text: line, priority: 'secondary' as const, problemId: scene.problemId, effectRefs: scene.moment === 'ending' ? ['work.status'] : undefined, factId: `${scene.id}-line-${index}` })),
    ...scene.choices.map((choice) => ({ id: `${scene.id}-${choice.id}`, role: 'action' as const, text: `${choice.label}${choice.note}`, priority: 'secondary' as const, problemId: scene.problemId, enablesActionIds: [choice.id], effectRefs: Object.keys(choice.result.delta), factId: `${scene.id}-action-${choice.id}` }))
  ];
  return { id: scene.id, moment: scene.moment, currentProblemId: scene.problemId, items, budget };
}

export function sceneAsNarrativeNode(scene: FirstWeekScene): NarrativeNode {
  return { id: scene.id, type: 'decision', text: scene.lines.join(' '), actions: scene.choices };
}

export function freshFirstWeekRun(runId: string): RunState {
  const run = createRunState({
    runId,
    identity: { id: 'artist', label: '你' },
    chapterId: 'first-week',
    currentNodeId: 'desk-black-screen',
    objective: '上午十点前，把链接发给场地方'
  });
  return { ...run, eventIds: ['screen-went-black'] };
}
