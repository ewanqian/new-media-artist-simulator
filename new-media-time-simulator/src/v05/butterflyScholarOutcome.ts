import type { NarrativeState } from './narrativeEngine.ts';

export type ButterflyWorldSnapshot = {
  unlockNodeIds?: string[];
  evidenceIds?: string[];
  methodIds?: string[];
  researchIds?: string[];
  threadIds?: string[];
  archiveEntryIds?: string[];
  achievementIds?: string[];
  qualitySignals?: string[];
  projectTags?: string[];
};

export type ButterflyOutcomeNote = {
  speaker: string;
  text: string;
};

export type ButterflyArchiveLine = {
  label: string;
  value: string;
  state: 'learned' | 'kept' | 'open';
};

export type ButterflyOutcome = {
  headline: string;
  summary: string;
  publicNotes: ButterflyOutcomeNote[];
  archiveLines: ButterflyArchiveLine[];
  unresolved: string[];
  learned: string[];
  journal: string;
  socialDraft: string;
};

const threadNames: Record<string, string> = {
  'thread-ines-prior-work': 'Inés 为什么提前看过你的旧作品',
  'thread-capture-gap-debt': '现场采集仍有覆盖缺口',
  'thread-unreliable-camera-solve': '相机求解没有完全修好',
  'thread-butterfly-authorship': '“为什么一定是蝴蝶”仍未回答清楚',
  'thread-data-rights': '研究数据的长期使用边界还要继续确认'
};

const has = (flags: Set<string>, id: string) => flags.has(id);

export function deriveButterflyOutcome(state: NarrativeState, world: ButterflyWorldSnapshot = {}): ButterflyOutcome {
  const flags = new Set(state.flags || []);
  const threads = world.threadIds || [];

  const capture = has(flags, 'capture-relation-route')
    ? '你把活体行为和静态空间拆成两套材料，再在作品里重新组合。'
    : has(flags, 'capture-ethical-trace')
      ? '你没有把活体当素材带走，而是从痕迹、植物、时间和缺席记录开始。'
      : '你先把样地做成空间底图，再让蝴蝶行为作为之后进入作品的一层。';

  const field = has(flags, 'field-recapture')
    ? '离场前发现缺口并补拍，后面的重建因此多了一层可靠性。'
    : '你明知现场有缺口仍然离开，这个决定一直留在后面的数据里。';

  const solve = has(flags, 'diagnosed-camera-solve')
    ? '你先检查相机求解，再决定怎样重建。'
    : '你先把错误继续算下去，并保留了一个明显失败的重建版本。';

  const representation = has(flags, 'representation-pointcloud')
    ? '最后保留点云：孔洞、密度和采样痕迹都没有被藏起来。'
    : '最后使用 Gaussian：观众更容易在连续视角里浏览现场外观。';

  const motion = has(flags, 'motion-interactive-butterfly')
    ? '蝴蝶没有被画成一个图标，而被改写成靠近、逃离、停留和聚集的实时行为。'
    : has(flags, 'motion-physics')
      ? '运动来自风、碰撞和物理条件，扫描材料被交给环境继续变化。'
      : '你用 Noise / Geometry Nodes 做程序化形变，让扫描空间按人为规则持续变化。';

  const authorship = has(flags, 'authorship-system-shift')
    ? '面对“蝴蝶题材”的质疑，你进一步把蝴蝶从图像改成了行为规则。'
    : has(flags, 'authorship-attributed')
      ? '你没有回避参考来源，而是把真正借过什么、自己又改了什么写进档案。'
      : '你暂时没有解决作者性争议，把“为什么一定是蝴蝶”留给公开测试继续追问。';

  const relationship = has(flags, 'relationship-open')
    ? '你和 Inés 把合作、数据边界和私人判断分开谈完，关系仍然保持开放。'
    : '你和 Inés 继续完成项目，但私人关系暂时停在专业合作。';

  const riskyTechnicalRoute = has(flags, 'capture-gap-debt') && has(flags, 'forced-reconstruct-bad-solve');
  const disciplinedRoute = has(flags, 'field-recapture') && has(flags, 'diagnosed-camera-solve');
  const authorshipOpen = has(flags, 'authorship-unresolved');

  const publicNotes: ButterflyOutcomeNote[] = [
    {
      speaker: '观众',
      text: has(flags, 'motion-interactive-butterfly')
        ? '“我一靠近，空间里的东西就散开了。没有看到一只写实蝴蝶，但我知道它在躲我。”'
        : has(flags, 'motion-physics')
          ? '“它不像一个扫完就停住的模型，风一变，整个空间的状态也跟着变。”'
          : '“我能看出这是扫描来的，但它一直在变，不像普通的 3D 展示。”'
    },
    {
      speaker: 'Rojas / 技术',
      text: disciplinedRoute
        ? '“这版最重要的是你知道哪些地方可靠，也把补拍和求解过程留了下来。”'
        : riskyTechnicalRoute
          ? '“断裂确实有形式感，但别倒过来说这是设计好的。它首先是一次采集和求解失败。”'
          : has(flags, 'capture-gap-debt')
            ? '“有些缺口现在已经变成作品的一部分，但档案里要明确写它们从哪里来的。”'
            : '“数据不是完美的，但你至少知道问题发生在哪一步。”'
    },
    {
      speaker: '同行 / 策展',
      text: authorshipOpen
        ? '“空间和技术都成立了，但我还是会问：为什么一定是蝴蝶？这个问题现在比软件问题更大。”'
        : has(flags, 'authorship-system-shift')
          ? '“现在比较有意思的是行为逻辑，不再是又一个‘蝴蝶视觉’。”'
          : '“把来源写清楚之后，讨论终于可以回到你的采集方法和作品结构，而不是只剩抄袭指控。”'
    },
    {
      speaker: 'Inés',
      text: has(flags, 'relationship-open')
        ? '“公开版没有把不能公开的资料顺手塞进去。之后我们可以继续谈长期合作。”'
        : '“项目边界现在是清楚的。私人部分先不急，工作可以继续。”'
    }
  ];

  const archiveLines: ButterflyArchiveLine[] = [
    { label: '现场方法', value: capture, state: 'learned' },
    { label: '现场决定', value: field, state: has(flags, 'field-recapture') ? 'learned' : 'open' },
    { label: '技术判断', value: solve, state: has(flags, 'diagnosed-camera-solve') ? 'learned' : 'kept' },
    { label: '空间表示', value: representation, state: 'kept' },
    { label: '运动规则', value: motion, state: 'learned' },
    { label: '作者性', value: authorship, state: authorshipOpen ? 'open' : 'learned' },
    { label: '合作关系', value: relationship, state: 'kept' }
  ];

  const unresolved = [...new Set(threads.map((id) => threadNames[id] || id))];
  const learned = [capture, solve, motion, authorship].filter(Boolean);
  const headline = riskyTechnicalRoute
    ? '作品完成了，但失败没有被洗掉。'
    : authorshipOpen
      ? '作品可以公开，作者性问题还没有结束。'
      : has(flags, 'motion-interactive-butterfly')
        ? '蝴蝶终于从图像变成了系统。'
        : '你完成的不是一次扫描，而是一套方法。';

  const summary = `${capture} ${representation} ${motion}`;
  const journal = `这一周在 Bosque Field Lab，我先处理了现场：${capture}${field} 回到工作台以后，${solve}${representation} 后来我才真正开始做作品：${motion} ${authorship} ${relationship}`;
  const socialDraft = `这周把一个蝴蝶研究项目做到了第一版。最有用的不是“学会了哪个软件”，而是把现场拆成了可以判断的步骤：怎么记录活体、怎么扫空间、离场前检查什么、什么时候先看相机求解，以及重建完成以后怎样把运动重新写回作品。${authorshipOpen ? ' 现在还有一个问题没解决：为什么一定是蝴蝶。' : ' 最后也把参考来源和数据边界一起写进了档案。'}`;

  return { headline, summary, publicNotes, archiveLines, unresolved, learned, journal, socialDraft };
}
