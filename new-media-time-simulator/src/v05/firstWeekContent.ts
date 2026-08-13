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
  preview: 'broken' | 'minimal' | 'responsive' | 'fragile' | 'touch' | 'desktop' | 'video';
  choices: FirstWeekChoice[];
};

export const firstWeekProblems: PlayerProblem[] = [
  { id: 'fix-black-screen', objectId: 'work-web-01', goal: '让网页离开当前窗口也能打开' },
  { id: 'test-outside-laptop', objectId: 'work-web-01', goal: '确认作品在别的设备上会发生什么' },
  { id: 'choose-delivery', objectId: 'work-web-01', goal: '根据测试结果决定明早交哪个版本' }
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

function outsideResult(run: RunState, source: 'phone' | 'friend' | 'group') {
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
  if (responsive) return '三个人点赞，一个人问链接，十九个人没说话。';
  return '录屏很好看。有人要链接。问题重新回来了。';
}

function outsideChoices(run: RunState): FirstWeekChoice[] {
  return [
    {
      id: 'open-on-phone', label: '用自己手机打开', note: '先换一块屏幕。', nextNodeId: 'choose-delivery',
      result: { summary: outsideResult(run, 'phone'), delta: {
        addFlags: ['checked-on-phone'], addEventIds: ['outside-check-complete'],
        updateWork: { workId: 'work-web-01', decisionId: 'open-on-phone' },
        addFeedback: { id: 'feedback-phone', source: 'self-test', workId: 'work-web-01', versionId: 'version-01', text: outsideResult(run, 'phone'), createdByActionId: 'open-on-phone' }
      } }
    },
    {
      id: 'send-to-awake-friend', label: '发给一个还没睡的朋友', note: '请对方直接点链接。别先解释作品。', nextNodeId: 'choose-delivery',
      result: { summary: outsideResult(run, 'friend'), delta: {
        addFlags: ['checked-by-friend'], addEventIds: ['outside-check-complete'],
        updateWork: { workId: 'work-web-01', decisionId: 'send-to-awake-friend' },
        addFeedback: { id: 'feedback-friend', source: 'friend', workId: 'work-web-01', versionId: 'version-01', text: outsideResult(run, 'friend'), createdByActionId: 'send-to-awake-friend' }
      } }
    },
    {
      id: 'post-ten-second-clip', label: '发十秒录屏到 23 人群', note: '看谁停下来。也看谁只点赞。', nextNodeId: 'choose-delivery',
      result: { summary: outsideResult(run, 'group'), delta: {
        addFlags: ['checked-by-group'], addEventIds: ['outside-check-complete'],
        updateWork: { workId: 'work-web-01', decisionId: 'post-ten-second-clip' },
        addFeedback: { id: 'feedback-group', source: 'group', workId: 'work-web-01', versionId: 'version-01', text: outsideResult(run, 'group'), createdByActionId: 'post-ten-second-clip' }
      } }
    }
  ];
}

const deliveryChoices: FirstWeekChoice[] = [
  {
    id: 'make-touch-version', label: '修到手机也能用', note: '把鼠标操作换成点击和触摸。', nextNodeId: 'morning-touch',
    result: { summary: '上午 9:41。手机和电脑都能打开。你没睡，但链接活着。', delta: {
      addFlags: ['delivered-touch'], addEventIds: ['first-link-delivered'],
      updateWork: { workId: 'work-web-01', status: 'testable', decisionId: 'make-touch-version', addVersion: { id: 'version-02-touch', label: '手机和电脑都能打开', state: 'shared', createdByActionId: 'make-touch-version' } }
    } }
  },
  {
    id: 'declare-desktop-only', label: '只做电脑版，写清楚', note: '别假装全平台。把观看条件放在链接前。', nextNodeId: 'morning-desktop',
    result: { summary: '上午 9:18。你写明“请用电脑打开”。范围变小，坑也变小。', delta: {
      addFlags: ['delivered-desktop'], addEventIds: ['first-link-delivered'],
      updateWork: { workId: 'work-web-01', status: 'testable', decisionId: 'declare-desktop-only', addVersion: { id: 'version-02-desktop', label: '写清设备要求的版本', state: 'shared', createdByActionId: 'declare-desktop-only' } }
    } }
  },
  {
    id: 'send-video-first', label: '先发录屏，链接下午补', note: '换几个小时。债也会活到下午。', nextNodeId: 'morning-video',
    result: { summary: '上午 9:57。视频发出去了。“链接稍后”是今天最危险的四个字。', delta: {
      addFlags: ['delivered-video'], addEventIds: ['first-video-delivered'],
      updateWork: { workId: 'work-web-01', status: 'draft', decisionId: 'send-video-first', addVersion: { id: 'version-02-video', label: '先交录屏的版本', state: 'shared', createdByActionId: 'send-video-first' } }
    } }
  }
];

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
  if (run.currentNodeId === 'choose-delivery') return {
    id: 'choose-delivery', moment: 'problem', time: '凌晨 2:39', title: '问题找到了。',
    lines: [run.feedback.at(-1)?.text || '另一个设备给出了答案。', '明早交哪个版本？'],
    problemId: 'choose-delivery', preview: previewAfterFirst(run), choices: deliveryChoices
  };
  if (run.currentNodeId === 'morning-video') return {
    id: 'morning-video', moment: 'ending', time: '上午 9:57', title: '视频发出去了。链接没有。',
    lines: ['场地方回：“收到。链接呢？”'], preview: 'video', choices: []
  };
  if (run.currentNodeId === 'morning-desktop') return {
    id: 'morning-desktop', moment: 'ending', time: '上午 9:18', title: '链接发出去了。',
    lines: ['场地方回：“收到。现场会准备电脑。”'], preview: 'desktop', choices: []
  };
  return {
    id: 'morning-touch', moment: 'ending', time: '上午 9:41', title: '链接发出去了。',
    lines: ['场地方回：“收到，手机也能打开。”'], preview: 'touch', choices: []
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
