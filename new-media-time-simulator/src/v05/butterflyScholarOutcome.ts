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

export const butterflyChoiceOutcomeHints: Record<string, string> = {
  'bs-go-question': '带着一个明确问题出发',
  'bs-go-open': '到现场以后再定作品',
  'bs-arrival-work': '明天少一点误会',
  'bs-arrival-prior': '公开前少一次返工',
  'bs-capture-relation': '方法：双轨采集；解锁观察 / 视频 / 摄影测量相关节点',
  'bs-capture-site': '方法：空间优先；蝴蝶行为留到制作阶段再进入',
  'bs-capture-trace': '方法：非侵入式采集；材料伦理进入项目记录',
  'bs-audit-recapture': '现场：改善覆盖；离场检查会在晚上的求解里直接起作用',
  'bs-audit-leave': '现场：留下真实覆盖缺口；晚上会承担这个决定的后果',
  'bs-align-diagnose': '先知道哪里坏了',
  'bs-align-force': '先得到一个能看的坏版本',
  'bs-failure-repair': '坏版本保留；另修一个能用的版本',
  'bs-failure-use': '断裂会继续留在作品里',
  'bs-represent-pointcloud': '观众会直接看见缺口',
  'bs-represent-gaussian': '观众先进入空间，失败留在记录里',
  'bs-compose-noise': '画面会一直缓慢走样',
  'bs-compose-physics': '风和碰撞继续改变画面',
  'bs-compose-interactive': '观众靠近时，画面会逃开',
  'bs-test-friend': '得到熟悉你作品的人的反应',
  'bs-test-social': '得到滑动信息流里的第一反应',
  'bs-test-private': '把第一次反应留给现场观众',
  'bs-authorship-source': '作者性：来源说明进入档案；讨论回到你的具体方法',
  'bs-authorship-system': '作者性：把“蝴蝶图像”继续退后，行为关系成为主结构',
  'bs-authorship-defend': '作者性：问题保持开放；公开反馈会继续追问“为什么是蝴蝶”',
  'bs-reveal-listen': '机构关系：先写清数据许可与公开范围',
  'bs-reveal-distance': '机构关系：要求协作与评估角色分开',
  'bs-archive-open': '把照片、坏版本和公开说明带回去'
};

const threadNames: Record<string, string> = {
  'thread-ines-prior-work': 'Inés 为什么提前看过你的旧作品',
  'thread-capture-gap-debt': '现场采集仍有覆盖缺口',
  'thread-unreliable-camera-solve': '相机求解仍然脆弱',
  'thread-butterfly-authorship': '“为什么一定是蝴蝶”仍未回答清楚',
  'thread-data-rights': '研究数据的长期使用边界还要继续确认',
  'thread-role-conflict': '协作者同时承担评估角色的机构冲突'
};

const has = (flags: Set<string>, id: string) => flags.has(id);

function unresolvedThreads(flags: Set<string>, world: ButterflyWorldSnapshot) {
  return [...new Set((world.threadIds || []).filter((id) => {
    if (id === 'thread-unreliable-camera-solve' && has(flags, 'solve-repaired')) return false;
    if (id === 'thread-data-rights' && has(flags, 'institutional-boundary-written')) return false;
    if (id === 'thread-role-conflict' && has(flags, 'role-conflict-separated')) return false;
    return true;
  }).map((id) => threadNames[id] || id))];
}

export function deriveButterflyOutcome(state: NarrativeState, world: ButterflyWorldSnapshot = {}): ButterflyOutcome {
  const flags = new Set(state.flags || []);

  const capture = has(flags, 'capture-relation-route')
    ? '你把活体行为和静态空间拆成两套材料，再在作品里重新组合。'
    : has(flags, 'capture-ethical-trace')
      ? '你没有追着捕捉活体，而是从寄主、出现时间、自然痕迹和缺席记录开始。'
      : '你先把样地做成空间底图，再让蝴蝶行为作为之后进入作品的一层。';

  const field = has(flags, 'field-recapture')
    ? '离场前发现缺口并补拍；晚上关键区域的相机轨迹因此接上了。'
    : '你明知现场有覆盖缺口仍然离开；晚上这个缺口直接出现在相机轨迹里。';

  const solve = has(flags, 'diagnosed-camera-solve')
    ? '你先检查相机求解，再进入重建。'
    : has(flags, 'failure-kept') && has(flags, 'solve-repaired')
      ? '你先生成了失败版本，把它保存为 Evidence，然后回头修相机求解。'
      : has(flags, 'failure-used-as-form')
        ? '你没有把错误修干净，而是明确承认断裂来自采集缺口，并把它带进作品。'
        : '你先把错误继续算了下去；失败版本成为后续判断的一部分。';

  const representation = has(flags, 'representation-pointcloud')
    ? '最后选择点云：孔洞、密度和采样痕迹都直接暴露。'
    : '最后选择 Gaussian：观众更容易在连续视角里浏览照片形成的空间外观。';

  const motion = has(flags, 'motion-interactive-butterfly')
    ? '蝴蝶没有被画成一个图标，而被改写成靠近、逃离、停留和聚集的实时行为。'
    : has(flags, 'motion-physics')
      ? '运动来自风、碰撞和物理条件，扫描材料被交给环境继续变化。'
      : '你用 Noise / Geometry Nodes 做程序化形变，让扫描空间按人为规则持续变化。';

  const authorship = has(flags, 'authorship-system-shift')
    ? '面对“为什么是蝴蝶”的质疑，你继续弱化蝴蝶图像，让行为和寄主关系成为主结构。'
    : has(flags, 'authorship-attributed')
      ? '你没有回避参考，而是把真正借过什么、数据来自哪里、自己又改了什么写清楚。'
      : '你没有提前解决作者性问题，把“为什么一定是蝴蝶”留给公开测试继续追问。';

  const institution = has(flags, 'role-conflict-separated')
    ? '你要求研究站把“协作”和“评估”两个角色拆开；项目继续，但治理关系被重新安排。'
    : '你先把材料来源、许可和公开范围逐条写清楚，再继续合作。';

  const fragile = has(flags, 'solve-still-fragile');
  const repairedFailure = has(flags, 'failure-kept') && has(flags, 'solve-repaired');
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
      speaker: 'Rojas',
      text: disciplinedRoute
        ? '“白天那十分钟补拍值了。照片现在能连起来，后面的版本没有偷偷猜那一段。”'
        : repairedFailure
          ? '“这个失败版本值得留。你没有把它包装成艺术决定，而是先承认失败，再修出可用版本。”'
          : fragile
            ? '“可以把断裂当形式，但档案里必须写明：它首先来自采集缺口，不是软件替你做出的美学选择。”'
            : '“数据不是完美的，但你至少知道问题发生在哪一步。”'
    },
    {
      speaker: '一个同行',
      text: authorshipOpen
        ? '“空间和技术都成立了，但我还是会问：为什么一定是蝴蝶？这个问题现在比软件问题更大。”'
        : has(flags, 'authorship-system-shift')
          ? '“现在比较有意思的是行为和寄主关系，不再是又一个‘蝴蝶视觉’。”'
          : '“来源写清楚以后，讨论终于可以回到你的采集方法和作品结构，而不是只剩一句‘像不像别人’。”'
    },
    {
      speaker: 'Inés',
      text: has(flags, 'role-conflict-separated')
        ? '“后续评估会换人。我继续负责现场协作，这样至少不会让我一边帮你、一边给你打分。”'
        : '“公开版没有把未授权资料顺手塞进去。许可边界已经写进记录，之后可以继续谈合作。”'
    }
  ];

  const archiveLines: ButterflyArchiveLine[] = [
    { label: '现场方法', value: capture, state: 'learned' },
    { label: '现场决定', value: field, state: has(flags, 'field-recapture') ? 'learned' : 'open' },
    { label: '失败处理', value: solve, state: fragile ? 'open' : repairedFailure || has(flags, 'diagnosed-camera-solve') ? 'learned' : 'kept' },
    { label: '空间表示', value: representation, state: 'kept' },
    { label: '运动规则', value: motion, state: 'learned' },
    { label: '作者性', value: authorship, state: authorshipOpen ? 'open' : 'learned' },
    { label: '机构边界', value: institution, state: 'learned' }
  ];

  const unresolved = unresolvedThreads(flags, world);
  const learned = [capture, solve, motion, authorship, institution].filter(Boolean);
  const headline = fragile
    ? '你没修那个断口。也没假装它是故意的。'
    : repairedFailure
      ? '坏版本留着。能用的也修好了。'
      : authorshipOpen
        ? '作品开门了。“为什么非得是蝴蝶”还在门口。'
        : has(flags, 'motion-interactive-butterfly')
          ? '你没把蝴蝶画回来，只留下了它逃开的方式。'
          : '你没带回一片森林。带回了下次怎么做。';

  const summary = `${capture} ${representation} ${motion}`;
  const journal = `这一周在 Bosque Field Lab，我先处理现场：${capture}${field} 回到工作台以后，${solve}${representation} 真正开始做作品以后，${motion} ${authorship} ${institution}`;
  const socialDraft = fragile
    ? `这周把一个蝴蝶研究项目做到第一版，也留下了一个没被修干净的空间断裂。它确实进入了最终形式，但我不想倒过来说它“本来就是设计”：缺口来自现场采集，相机关系也因此脆弱。我把这个失败来源和后续处理一起留进了档案。${authorshipOpen ? ' 另外，“为什么一定是蝴蝶”仍然没有结束。' : ''}`
    : repairedFailure
      ? `这周最有用的一次操作不是“生成成功”，而是先生成失败、把失败版本保存下来，再回去修相机求解。这样最后的作品和失败 Evidence 同时存在：一个告诉观众作品现在是什么，一个告诉我它差点在哪里坏掉。`
      : `这周把一个蝴蝶研究项目做到了第一版。最有用的不是“学会了哪个软件”，而是把现场拆成可以判断的步骤：怎么记录活体、怎么扫空间、离场前检查什么、什么时候先看相机求解，以及重建以后怎样把运动重新写回作品。${authorshipOpen ? ' 现在还有一个问题没解决：为什么一定是蝴蝶。' : ' 来源、数据许可和公开边界也一起写进了档案。'}`;

  return { headline, summary, publicNotes, archiveLines, unresolved, learned, journal, socialDraft };
}
