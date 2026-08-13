import { createRunState } from './runState.ts';
import type { NarrativeAction, NarrativeNode, RunState, Work } from './runState.ts';
import type { PlayerProblem, SurfaceContract, SurfaceItem } from './controlSystem.ts';

export type FirstWeekChoice = NarrativeAction & { note: string };
export type FirstWeekScene = {
  id: string;
  moment: 'problem' | 'result' | 'ending';
  time: string;
  title: string;
  lines: string[];
  problemId?: string;
  preview: 'broken' | 'minimal' | 'responsive' | 'fragile' | 'touch' | 'desktop' | 'guided' | 'video' | 'venue-wide' | 'venue-test' | 'venue-idle';
  choices: FirstWeekChoice[];
  advance?: { id: string; label: string; nextNodeId: string };
};

export const firstWeekProblems: PlayerProblem[] = [
  { id: 'fix-black-screen', objectId: 'work-web-01', goal: '让网页离开当前窗口也能打开' },
  { id: 'test-outside-laptop', objectId: 'work-web-01', goal: '确认作品在别的设备上会发生什么' },
  { id: 'respond-to-feedback', objectId: 'work-web-01', goal: '决定是否根据刚收到的反应修改作品' },
  { id: 'deliver-by-ten', objectId: 'work-web-01', goal: '上午十点前给场地方一个能查看的版本' },
  { id: 'adapt-to-venue', objectId: 'work-web-01', goal: '让同一个网页在现场投影和普通鼠标上能工作' }
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

function latestVersionId(run: RunState) {
  return run.works[0]?.versions?.at(-1)?.id || 'version-01';
}

function venueSetupChoices(): FirstWeekChoice[] {
  return [
    {
      id: 'fit-wide-projector', label: '按现场照片重排画面', note: '先适配那面宽墙。别等墙自己长成你的浏览器。', nextNodeId: 'venue-last-check',
      result: { summary: '场地方刷新。圆终于铺开了，鼠标还孤零零躺在角落。', delta: {
        addFlags: ['venue-layout-fixed'],
        updateWork: { workId: 'work-web-01', decisionId: 'fit-wide-projector', addVersion: { id: 'version-04-layout', label: '按现场投影重排的版本', state: 'testable', createdByActionId: 'fit-wide-projector' } }
      } }
    },
    {
      id: 'send-minimum-venue-test', label: '先发一个只有圆和鼠标的测试页', note: '先测投影能开、鼠标能动。作品晚点再塞回去。', nextNodeId: 'venue-last-check',
      result: { summary: '测试页能开，鼠标也能动。场地方回：“不看你消息的人，不知道要动它。”', delta: {
        addFlags: ['venue-minimum-tested'],
        updateWork: { workId: 'work-web-01', decisionId: 'send-minimum-venue-test', addVersion: { id: 'version-04-test', label: '现场最小测试页', state: 'testable', createdByActionId: 'send-minimum-venue-test' } },
        addFeedback: { id: 'feedback-venue-test', source: 'venue', workId: 'work-web-01', versionId: 'version-04-test', text: '测试页能开，鼠标能动。但没人知道要动它。', createdByActionId: 'send-minimum-venue-test', status: 'new' }
      } }
    },
    {
      id: 'venue-loop-video', label: '直接让录屏循环播放', note: '最稳。互动当场死亡。', nextNodeId: 'venue-last-check',
      result: { summary: '录屏铺满了墙，每十秒准时重来。它再也不会黑屏，也不再需要观众。', delta: {
        addFlags: ['venue-video-loop'],
        updateWork: { workId: 'work-web-01', decisionId: 'venue-loop-video', addVersion: { id: 'version-04-loop', label: '现场循环录屏', state: 'shared', createdByActionId: 'venue-loop-video' } }
      } }
    }
  ];
}

function finalVenueChoices(run: RunState): FirstWeekChoice[] {
  const reactedVersionId = latestVersionId(run);
  return [
    {
      id: 'make-controls-obvious', label: '把能拖的东西做大，再写“动一下”', note: '不写宣言。先救那只角落里的鼠标。', nextNodeId: 'venue-opened',
      result: { summary: '第一个观众看见了那句话，找到鼠标，拖了一下。画面真的躲开了。', delta: {
        addFlags: ['venue-guided-control'], addEventIds: ['first-public-run'],
        updateWork: { workId: 'work-web-01', status: 'public', decisionId: 'make-controls-obvious', addVersion: { id: 'version-05-guided', label: '现场能看懂怎么操作的版本', state: 'shared', createdByActionId: 'make-controls-obvious' } },
        addFeedback: { id: 'feedback-venue-guided', source: 'venue', workId: 'work-web-01', versionId: reactedVersionId, text: '有人找到鼠标，画面第一次被现场观众改变。', createdByActionId: 'make-controls-obvious', status: 'new' }
      } }
    },
    {
      id: 'add-idle-motion', label: '没人碰时，也让画面自己慢慢动', note: '互动还在。冷场时，作品先自救。', nextNodeId: 'venue-opened',
      result: { summary: '没人碰鼠标。画面还是慢慢散开，又自己聚回来。至少没有装死。', delta: {
        addFlags: ['venue-idle-motion'], addEventIds: ['first-public-run'],
        updateWork: { workId: 'work-web-01', status: 'public', decisionId: 'add-idle-motion', addVersion: { id: 'version-05-idle', label: '没人操作也会继续的版本', state: 'shared', createdByActionId: 'add-idle-motion' } },
        addFeedback: { id: 'feedback-venue-idle', source: 'venue', workId: 'work-web-01', versionId: reactedVersionId, text: '没人碰鼠标，但画面没有停。', createdByActionId: 'add-idle-motion', status: 'new' }
      } }
    },
    {
      id: 'keep-video-final', label: '认了：今晚就播录屏', note: '删掉互动。换一个不会现场死掉的版本。', nextNodeId: 'venue-opened',
      result: { summary: '录屏每十秒准时重来。没有人弄坏它，因为没有人能碰它。非常稳。', delta: {
        addFlags: ['venue-video-final'], addEventIds: ['first-public-run'],
        updateWork: { workId: 'work-web-01', status: 'public', decisionId: 'keep-video-final', addVersion: { id: 'version-05-video', label: '第一次现场播放的录屏版', state: 'shared', createdByActionId: 'keep-video-final' } },
        addFeedback: { id: 'feedback-venue-video', source: 'venue', workId: 'work-web-01', versionId: reactedVersionId, text: '播放很稳定。互动没有进入现场。', createdByActionId: 'keep-video-final', status: 'new' }
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
    id: 'morning-video', moment: 'result', time: '上午 9:57', title: '视频发出去了。链接没有。',
    lines: ['场地方回：“收到。链接呢？”'], problemId: 'deliver-by-ten', preview: 'video', choices: [],
    advance: { id: 'continue-after-video', label: '看下午发来的现场照片', nextNodeId: 'venue-photo' }
  };
  if (run.currentNodeId === 'morning-late') return {
    id: 'morning-late', moment: 'result', time: '上午 9:38', title: '你开口要了一个小时。',
    lines: ['场地方回：“可以。十一点前给我。”'], problemId: 'deliver-by-ten', preview: previewAfterResponse(run), choices: [],
    advance: { id: 'continue-after-delay', label: '补上链接，再看现场照片', nextNodeId: 'venue-photo' }
  };
  if (run.currentNodeId === 'morning-link') return {
    id: 'morning-link', moment: 'result', time: '上午 9:54', title: '链接发出去了。',
    lines: [linkReply(run)], problemId: 'deliver-by-ten', preview: previewAfterResponse(run), choices: [],
    advance: { id: 'continue-after-link', label: '看下午发来的现场照片', nextNodeId: 'venue-photo' }
  };
  if (run.currentNodeId === 'venue-photo') {
    const line = run.flags.includes('delivered-video')
      ? '下午两点，场地方发来一张投影照片。录屏铺满了墙。消息里还跟着一句：“链接呢？”'
      : run.flags.includes('delivery-delayed')
        ? '十一点零六分，你补上链接。下午两点，现场照片到了：宽投影把画面挤在了左边。'
        : '下午两点，场地方发来一张投影照片：墙比你的屏幕宽得多，三个圆全挤在左边，鼠标放在角落。';
    return { id: 'venue-photo', moment: 'problem', time: '第二天 · 下午 2:18', title: '现场和你的电脑不是一回事。', lines: [line], problemId: 'adapt-to-venue', preview: 'venue-wide', choices: venueSetupChoices() };
  }
  if (run.currentNodeId === 'venue-last-check') {
    const title = run.flags.includes('venue-video-loop') ? '录屏很稳。也完全不用观众。' : run.flags.includes('venue-minimum-tested') ? '测试页能开。人不一定会动它。' : '画面铺满了。鼠标还躺在角落。';
    return { id: 'venue-last-check', moment: 'problem', time: '第二天 · 下午 4:42', title, lines: [run.history.at(-1)?.summary || '现场回消息了。', '晚上七点开门。最后改一次。'], problemId: 'adapt-to-venue', preview: run.flags.includes('venue-video-loop') ? 'video' : 'venue-test', choices: finalVenueChoices(run) };
  }
  if (run.currentNodeId === 'venue-opened') {
    if (run.flags.includes('venue-guided-control')) return { id: 'venue-opened', moment: 'ending', time: '第二天 · 晚上 7:08', title: '第一个观众找到鼠标了。', lines: ['他拖了一下。画面躲开了。然后又拖了一下。'], preview: 'guided', choices: [] };
    if (run.flags.includes('venue-idle-motion')) return { id: 'venue-opened', moment: 'ending', time: '第二天 · 晚上 7:08', title: '没人碰鼠标。画面还是活着。', lines: ['它慢慢散开，又自己聚回来。现场没有掌声，也没有黑屏。'], preview: 'venue-idle', choices: [] };
    return { id: 'venue-opened', moment: 'ending', time: '第二天 · 晚上 7:08', title: '它每十秒准时重来。', lines: ['没有人弄坏它，因为没有人能碰它。非常稳。'], preview: 'video', choices: [] };
  }
  return {
    id: 'unknown-first-week-state', moment: 'ending', time: '时间不详', title: '这段记录断了。',
    lines: ['重新开始，或者保留这份坏存档。'], preview: 'broken', choices: []
  };
}

const budget = { maxPrimaryItems: 1, maxActions: 3, maxNewConcepts: 1, maxCharacters: 240 };

export function firstWeekSurface(scene: FirstWeekScene): SurfaceContract {
  const items: SurfaceItem[] = [
    { id: `${scene.id}-title`, role: scene.moment === 'problem' ? 'problem' : 'result', text: scene.title, priority: 'primary', problemId: scene.problemId, effectRefs: scene.moment === 'problem' ? undefined : ['work.versions'], factId: `${scene.id}-headline` },
    ...scene.lines.filter(Boolean).map((line, index) => ({ id: `${scene.id}-line-${index}`, role: scene.moment === 'ending' ? 'result' as const : 'context' as const, text: line, priority: 'secondary' as const, problemId: scene.problemId, effectRefs: scene.moment === 'ending' ? ['work.status'] : undefined, factId: `${scene.id}-line-${index}` })),
    ...scene.choices.map((choice) => ({ id: `${scene.id}-${choice.id}`, role: 'action' as const, text: `${choice.label}${choice.note}`, priority: 'secondary' as const, problemId: scene.problemId, enablesActionIds: [choice.id], effectRefs: Object.keys(choice.result.delta), factId: `${scene.id}-action-${choice.id}` })),
    ...(scene.advance ? [{ id: `${scene.id}-${scene.advance.id}`, role: 'action' as const, text: scene.advance.label, priority: 'secondary' as const, problemId: scene.problemId, enablesActionIds: [scene.advance.id], effectRefs: ['currentNodeId'], factId: `${scene.id}-advance` }] : [])
  ];
  return { id: scene.id, moment: scene.moment, currentProblemId: scene.problemId, items, budget };
}

export function sceneAsNarrativeNode(scene: FirstWeekScene): NarrativeNode {
  if (scene.advance) return { id: scene.id, type: 'transition', text: scene.lines.join(' '), nextNodeId: scene.advance.nextNodeId };
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
