export type QuestBookKind = 'tutorial' | 'main' | 'challenge';
export type QuestBookStageKind = 'encounter' | 'acquire' | 'assemble' | 'test' | 'deploy' | 'archive';

export type QuestBookObjective = {
  id: string;
  text: string;
  signal: string;
  optional?: boolean;
};

export type QuestBookStage = {
  id: string;
  kind: QuestBookStageKind;
  title: string;
  objectives: QuestBookObjective[];
};

export type QuestBook = {
  id: string;
  kind: QuestBookKind;
  title: string;
  subtitle: string;
  summary: string;
  repeatable: boolean;
  recommendedNodes: string[];
  rewardNodeIds: string[];
  rewardMasteryFamilies: string[];
  lenses: Array<'run' | 'build' | 'read'>;
  stages: QuestBookStage[];
};

const stage = (book: string, kind: QuestBookStageKind, title: string, objectives: QuestBookObjective[]): QuestBookStage => ({
  id: `${book}:${kind}`,
  kind,
  title,
  objectives
});

const objective = (id: string, text: string, signal: string, optional = false): QuestBookObjective => ({ id, text, signal, ...(optional ? { optional } : {}) });

export const questBooks: QuestBook[] = [
  {
    id: 'tutorial-first-circuit',
    kind: 'tutorial',
    title: '教程 / 第一条回路',
    subtitle: '先不要做作品，先让一个关系成立。',
    summary: '用极少节点完成第一次图纸、第一次运行、第一次环境变化和第一次归档。',
    repeatable: false,
    recommendedNodes: ['camera-live', 'delay', 'crt-display', 'audience-body'],
    rewardNodeIds: ['feedback-loop', 'ring-layout', 'closed-circuit-video'],
    rewardMasteryFamilies: ['realtime-graphics', 'single-display'],
    lenses: ['run', 'build'],
    stages: [
      stage('tutorial-first-circuit', 'encounter', '桌面上先出现一个问题', [objective('t1', '遇到一个“为什么一定要实时”的疑问。', 'dialogue:why-live')]),
      stage('tutorial-first-circuit', 'acquire', '先找到四块够用的积木', [objective('t2', '获得摄像、延迟、显示和观众身体节点。', 'unlock:starter-four')]),
      stage('tutorial-first-circuit', 'assemble', '接出第一条线', [objective('t3', '用 4–6 个节点形成一条从输入到输出的图。', 'blueprint:minimal-chain')]),
      stage('tutorial-first-circuit', 'test', '它真的跑了一次', [objective('t4', '在自己的工作位运行并留下一条证据。', 'test:desk-run')]),
      stage('tutorial-first-circuit', 'deploy', '换一个环境再跑', [objective('t5', '进入一个展示环境，观察图纸哪些部分失效。', 'deploy:first-context')]),
      stage('tutorial-first-circuit', 'archive', '记住不是保存截图', [objective('t6', '保存 Blueprint v1 并记录一个失败点。', 'archive:first-blueprint')])
    ]
  },
  {
    id: 'book-visible-version',
    kind: 'main',
    title: '任务书 01 / 一个能被别人看见的版本',
    subtitle: '从“我自己能跑”到“别人真的看到”。',
    summary: '遇到同行与技术人员，补齐资源，把图纸变成可部署版本，再进入真实展示环境。',
    repeatable: true,
    recommendedNodes: ['camera-live', 'realtime-render', 'projector', 'site-specific', 'setup-two-hours'],
    rewardNodeIds: ['multi-screen', 'system-art'],
    rewardMasteryFamilies: ['realtime-graphics', 'multi-output-mapping', 'site-method'],
    lenses: ['run', 'build', 'read'],
    stages: [
      stage('book-visible-version', 'encounter', '别人先看到问题', [objective('v1', '让一个同行或技术人员看当前版本。', 'contact:review-current')]),
      stage('book-visible-version', 'acquire', '资源不是背包', [objective('v2', '确认至少一个关键节点的拥有 / 借用 / 租赁来源。', 'resource:resolve-one')]),
      stage('book-visible-version', 'assemble', '图纸开始有现场版本', [objective('v3', '增加一个空间节点和一个限制节点。', 'blueprint:add-site-constraint')]),
      stage('book-visible-version', 'test', '先把最丢脸的失败暴露出来', [objective('v4', '完成一次运行并诊断至少一个问题。', 'test:diagnose')]),
      stage('book-visible-version', 'deploy', '第一次公开', [objective('v5', '在黑盒、项目空间或机构场地完成部署。', 'deploy:presentation')]),
      stage('book-visible-version', 'archive', '这个版本以后还搭得回来吗', [objective('v6', '保存部署版本、资源来源和一条复现说明。', 'archive:deployment')])
    ]
  },
  {
    id: 'book-wrong-room',
    kind: 'main',
    title: '任务书 02 / 房间不对，作品会变',
    subtitle: '同一张图纸，进入不同环境以后会长成不同东西。',
    summary: '强迫玩家把同一个 Blueprint 放进两个不相容的环境，通过替换基因而不是硬撑完成适配。',
    repeatable: true,
    recommendedNodes: ['site-specific', 'ring-layout', 'no-drill', 'single-socket', 'transport-one-box'],
    rewardNodeIds: ['remote-pair', 'network-relay'],
    rewardMasteryFamilies: ['site-method', 'spatial-composition', 'automation-integration'],
    lenses: ['build', 'read'],
    stages: [
      stage('book-wrong-room', 'encounter', '一个不合适的邀请', [objective('w1', '接受一个和现有作品条件冲突的场地。', 'signal:bad-fit-invite')]),
      stage('book-wrong-room', 'acquire', '先理解场地，不要先买设备', [objective('w2', '从场地方或技术人员获得三个限制条件。', 'resource:venue-constraints')]),
      stage('book-wrong-room', 'assemble', 'Fork，而不是毁掉原版', [objective('w3', '从原 Blueprint 创建一个 Remix / Deployment 分支。', 'blueprint:fork')]),
      stage('book-wrong-room', 'test', '比较两个表型', [objective('w4', '让原版与现场版各运行一次，比较 RUN / BUILD / READ。', 'test:compare-deployments')]),
      stage('book-wrong-room', 'deploy', '让限制进入作品', [objective('w5', '在至少保留一个限制节点的情况下完成部署。', 'deploy:constraint-visible')]),
      stage('book-wrong-room', 'archive', '记录为什么它变了', [objective('w6', '在谱系中保留 Parent → Remix 关系。', 'archive:genealogy')])
    ]
  },
  {
    id: 'book-dead-media',
    kind: 'main',
    title: '任务书 03 / 死媒介还活着',
    subtitle: '不要给旧东西套滤镜，要重新让它工作。',
    summary: '从旧媒介、现成品和媒体考古出发，把历史节点与当代计算节点重新组合。',
    repeatable: true,
    recommendedNodes: ['vhs-source', 'crt-display', 'ready-made', 'media-archaeology', 'vision-classify'],
    rewardNodeIds: ['mutation', 'institutional-lens'],
    rewardMasteryFamilies: ['art-lineage', 'reconstruction-generation'],
    lenses: ['read', 'build'],
    stages: [
      stage('book-dead-media', 'encounter', '一台没有理由被留下的机器', [objective('d1', '在仓库、工作室或档案场域发现一种旧媒介。', 'field:obsolete-medium')]),
      stage('book-dead-media', 'acquire', '先把它弄明白', [objective('d2', '解锁对应媒介节点和一个艺术谱系节点。', 'unlock:medium-lineage-pair')]),
      stage('book-dead-media', 'assemble', '新旧之间要有真实连接', [objective('d3', '把旧媒介与一个实时 / AI / 网络节点接进同一张图。', 'blueprint:old-new-link')]),
      stage('book-dead-media', 'test', '错误不是装饰', [objective('d4', '让旧设备的限制或错误真实影响运行结果。', 'test:material-friction')]),
      stage('book-dead-media', 'deploy', '让观众看见这种关系', [objective('d5', '部署时保留至少一个可感知的旧媒介特性。', 'deploy:material-visible')]),
      stage('book-dead-media', 'archive', '把“参考”变成谱系', [objective('d6', '记录作品使用了什么历史方法，以及你改坏了什么。', 'archive:lineage-remix')])
    ]
  },
  {
    id: 'challenge-node-storm',
    kind: 'challenge',
    title: '挑战任务书 / 节点风暴',
    subtitle: '能加节点，不代表应该加。',
    summary: '以高节点数、低预算、短搭建时间为压力条件，测试玩家是否会删减、替换和复用，而不是堆满图。',
    repeatable: true,
    recommendedNodes: ['budget-tight', 'setup-two-hours', 'single-socket', 'transport-one-box'],
    rewardNodeIds: ['mutation', 'institutional-lens'],
    rewardMasteryFamilies: ['automation-integration', 'production-constraint'],
    lenses: ['run', 'build', 'read'],
    stages: [
      stage('challenge-node-storm', 'encounter', '一个看起来资源很多的项目', [objective('s1', '接受一个节点上限很高但真实资源很紧的挑战。', 'signal:complex-commission')]),
      stage('challenge-node-storm', 'acquire', '资源永远比图纸少', [objective('s2', '面对至少三类资源缺口，不允许全部购买解决。', 'resource:shortage-three')]),
      stage('challenge-node-storm', 'assemble', '先堆到失控', [objective('s3', '构建 24+ 节点压力图。', 'blueprint:stress-24')]),
      stage('challenge-node-storm', 'test', '找出真正脆弱的三处', [objective('s4', '从压力图里识别三个依赖点并删掉至少四个节点。', 'test:reduce-complexity')]),
      stage('challenge-node-storm', 'deploy', '在限制里活下来', [objective('s5', '以 20 节点以内版本完成部署。', 'deploy:under-20')]),
      stage('challenge-node-storm', 'archive', '保存失败的大图', [objective('s6', '同时保留“灾难版”和“部署版”的谱系。', 'archive:failure-branch')])
    ]
  }
];

export const questBookById = new Map(questBooks.map((book) => [book.id, book]));

export function validateQuestBookShape(book: QuestBook): string[] {
  const errors: string[] = [];
  const expected: QuestBookStageKind[] = ['encounter', 'acquire', 'assemble', 'test', 'deploy', 'archive'];
  if (book.stages.length !== expected.length) errors.push('Quest book must have exactly six lifecycle stages.');
  expected.forEach((kind, index) => {
    if (book.stages[index]?.kind !== kind) errors.push(`Stage ${index + 1} must be ${kind}.`);
    if (!book.stages[index]?.objectives.length) errors.push(`Stage ${kind} needs at least one objective.`);
  });
  if (!book.recommendedNodes.length) errors.push('Quest book needs recommended blueprint nodes.');
  if (!book.lenses.length) errors.push('Quest book needs at least one evaluation lens.');
  return errors;
}

export const memorableMoments = [
  { id: 'first-wire', title: '第一根线接上以后，屏幕真的有了反馈。', system: 'blueprint' },
  { id: 'missing-node', title: '导入朋友的图纸，发现自己只会其中一半。', system: 'sharing' },
  { id: 'venue-breaks-work', title: '同一件作品换个房间，突然完全不成立。', system: 'field' },
  { id: 'old-machine-answer', title: '一台旧机器的故障，反而回答了作品为什么存在。', system: 'lineage' },
  { id: 'too-many-nodes', title: '28 个节点的怪物最后被删成 14 个，反而更完整。', system: 'pressure' },
  { id: 'genealogy', title: '几年后打开档案，发现一件作品已经长出了整棵谱系。', system: 'records' },
  { id: 'resource-person', title: '缺的不是设备，是一个认识那台设备的人。', system: 'people' },
  { id: 'failure-preserved', title: '失败版本没有被覆盖，而是成为下一次 Remix 的父节点。', system: 'archive' }
] as const;
