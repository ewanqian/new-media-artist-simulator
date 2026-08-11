import type { NarrativePack } from './narrativeEngine.ts';

export const BUTTERFLY_SCHOLAR_ROUTE_ID = 'demo-route-costa-rica-butterfly-scholar';

export type ButterflyTrainingStep = {
  id: string;
  title: string;
  plain: string;
  why: string;
  operation?: string;
  reference?: string;
  nodeIds: string[];
  failureSignals: string[];
};

export type ButterflyResearchCard = {
  id: string;
  title: string;
  short: string;
  plain: string;
  why: string;
  unlockNodeIds?: string[];
  methodId?: string;
};

export type ButterflyWorldEffect = {
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

export const butterflyScholarIdentity = {
  title: '哥斯达黎加的蝴蝶学者',
  role: '新媒体艺术家 / 蝴蝶研究者',
  practice: '你长期记录蝴蝶、寄主植物和它们出现的时间，也做空间扫描、点云和实时影像。你真正感兴趣的不是“把自然做成 3D”，而是一个地点被数字化以后，还剩下多少现场经验。',
  priorWork: [
    '把城市边缘植物做成带时间戳的扫描档案',
    '用植物标本、现场录音和点云做过一件小型空间作品',
    '收集失败扫描、缺失标签和“今天没有出现”的观察记录'
  ],
  currentQuestion: '蝴蝶一直在动，植物会枯，现场也会变化。我要保存的到底是什么？'
};

export const butterflyResearchCards: ButterflyResearchCard[] = [
  { id: 'research-live-butterfly', title: '活蝴蝶怎么采集？', short: '活体运动不适合硬做成静态摄影测量对象。', plain: '会飞的蝴蝶一直在变位置。你更适合记录它的运动、停留点和寄主植物；植物、石头、小径和空间才适合做摄影测量或 LiDAR。', why: '先把“运动记录”和“空间重建”拆开，后面再在作品里重新组合。', unlockNodeIds: ['capture-motion-video', 'field-capture-session'], methodId: 'method-split-motion-and-space' },
  { id: 'research-overlap', title: '摄影测量为什么需要重叠？', short: '软件需要在不同照片里认出同一块表面。', plain: '围着植物或空间移动拍摄，让相邻照片重复看到同一块区域。只站在原地转相机，或一面只拍一张，后面容易断。', why: '现场补拍最便宜。回到工作室才发现缺口，常常已经晚了。', unlockNodeIds: ['capture-quality-check'], methodId: 'method-check-before-leave' },
  { id: 'research-camera-solve', title: '什么是相机求解？', short: '先算出每张照片是从哪里拍的。', plain: 'Metashape / COLMAP 会先找照片之间的共同特征，再估计相机位置。大量照片没注册、相机轨迹突然跳开，就说明底层关系不可靠。', why: '相机关系错了，点云、高斯或网格只会把错误继续放大。', unlockNodeIds: ['process-metashape-align', 'process-colmap-sfm'], methodId: 'method-diagnose-before-reconstruct' },
  { id: 'research-representation', title: '点云和 Gaussian 有什么区别？', short: '不是“低级 / 高级”，而是两种不同的空间表示。', plain: '点云会直接让你看到一个个采样点和缺口；Gaussian 更适合从不同视角连续浏览照片里的空间外观。', why: '先问作品需要什么观看方式，再选技术。不要把技术名字当质量等级。', unlockNodeIds: ['process-dense-reconstruction', 'process-gaussian-splat'], methodId: 'method-choose-representation-by-work' },
  { id: 'research-blender-motion', title: '扫描完以后还能怎么动？', short: '重建只是原料，作品可以继续在 Blender 或实时系统里变化。', plain: '你可以用 Noise / Geometry Nodes 做非写实形变，也可以用风、碰撞、粒子等物理规则，或者让观众位置实时驱动蝴蝶与空间。', why: '动画不是“让点云飘起来”。运动规则本身应该回答作品的问题。', unlockNodeIds: ['process-blender-procedural', 'process-physics-motion', 'process-butterfly-behavior'], methodId: 'method-motion-as-rule' },
  { id: 'research-butterfly-authorship', title: '“做蝴蝶”算抄袭吗？', short: '题材不属于某一个人，但具体形式、方法和直接引用需要说清楚。', plain: '很多艺术家都使用蝴蝶。真正要判断的是：你是否复制了具体视觉、结构或方法；有没有明确引用；你的作品有没有把蝴蝶转化成自己的规则和问题。', why: '最弱的回应是“蝴蝶又不是谁发明的”。更有用的是把来源、差异和你真正做出的系统写清楚。', unlockNodeIds: ['method-source-attribution'], methodId: 'method-source-attribution' },
  { id: 'research-specimen-ethics', title: '标本、数据和公开边界', short: '能采集、能复制，不等于都应该公开。', plain: '活体不因为作品需要就应该被捕捉；自然脱落材料、已有标本、研究站数据也可能有来源和使用边界。作品需要记住谁提供了材料、哪些数据不能公开。', why: '数字复制让“带走”变得太容易，所以来源和许可反而更重要。', methodId: 'method-selective-preservation' }
];

export const butterflyResearchByNode: Record<string, string[]> = {
  'bs-03-field': ['research-live-butterfly'],
  'bs-03b-audit': ['research-overlap'],
  'bs-04-process': ['research-camera-solve'],
  'bs-04a-represent': ['research-representation'],
  'bs-04e-compose': ['research-blender-motion'],
  'bs-04f-authorship': ['research-butterfly-authorship'],
  'bs-04b-reveal': ['research-specimen-ethics']
};

export const butterflyScholarTraining: ButterflyTrainingStep[] = [
  { id: 'train-subject', title: '先拆开“活体运动”和“静态空间”', plain: '蝴蝶用观察/视频记录运动；寄主植物和现场用摄影测量或 LiDAR。', why: '不同对象需要不同采集方式。', operation: '先写现场调查，再决定每一类材料怎么采。', nodeIds: ['field-capture-session', 'butterfly-observation', 'capture-motion-video', 'capture-photo-sequence'], failureSignals: ['把所有东西都当成同一种扫描对象'] },
  { id: 'train-check', title: '离场前检查', plain: '看漏拍、模糊、反光和光照变化。', why: '现场补拍比回去救数据可靠。', operation: '照片序列 → 离场前检查。', nodeIds: ['capture-photo-sequence', 'capture-quality-check'], failureSignals: ['关键区域只有单一视角'] },
  { id: 'train-solve', title: '先求解相机，再重建', plain: '确认照片之间的相机关系可信。', why: '底层相机关系错了，换 Gaussian 也救不了。', operation: '离场前检查 → Metashape / COLMAP 相机求解。', nodeIds: ['capture-quality-check', 'process-metashape-align', 'process-colmap-sfm'], failureSignals: ['大量照片未注册', '相机轨迹断裂'] },
  { id: 'train-create', title: '把重建当原料', plain: '点云 / Gaussian 之后继续进入 Blender 或实时系统。', why: '真正的作品从这里开始，而不是“扫描成功”就结束。', operation: '重建 → 清理 → 动画/行为 → 作品结构。', nodeIds: ['process-dense-reconstruction', 'process-gaussian-splat', 'process-blender-procedural', 'process-butterfly-behavior'], failureSignals: ['只剩一个技术 Demo'] }
];

export const butterflyScholarNarrativePack: NarrativePack = {
  id: 'narrative-butterfly-scholar-v3',
  title: '哥斯达黎加的蝴蝶学者',
  actors: [
    { id: 'player-butterfly-scholar', name: '你', publicRole: '新媒体艺术家 / 蝴蝶研究者', motives: ['完成一件真正来自现场的新作品', '把扫描变成可复用的方法', '弄清蝴蝶题材如何变成自己的系统'], remembers: [] },
    { id: 'advisor-rui', name: '睿', publicRole: '工作室艺术顾问', motives: ['让你离开旧素材', '让项目从真实现场开始'], remembers: ['你出发前把任务理解成什么'] },
    { id: 'ines', name: 'Inés', publicRole: '驻地项目现场协调', coverStory: '负责研究站、驻地艺术家和植物档案之间的协调。', hiddenRole: '她也参与另一个研究网络的数据合作评估，但最初没有主动说明。', motives: ['保护研究站的数据边界', '判断你会不会把现场只当视觉素材库', '完成合作评估', '在合作中逐渐形成私人感情'], remembers: ['你第一次怎么跟她说话', '你如何处理来源和公开边界', '你面对蝴蝶题材争议时怎么回应', '身份揭示后你是否愿意继续听她说'] },
    { id: 'rojas', name: 'Rojas', publicRole: '研究站技术员', motives: ['保护长期样地', '让采集方法可复现'], remembers: ['你有没有离场前检查', '你是否诚实记录失败数据'] }
  ],
  facts: [
    { id: 'fact-invite', subjectId: 'route', label: '研究站希望把蝴蝶观察、寄主植物档案和部分空间记录转成一件可进入的数字作品。', state: 'verified', sourceIds: ['advisor-rui'] },
    { id: 'fact-live-not-static', subjectId: 'project', label: '活蝴蝶的运动和静态植物/空间需要不同采集方式。', state: 'unknown', sourceIds: [] },
    { id: 'fact-ines-role-public', subjectId: 'ines', label: 'Inés 负责驻地和研究站之间的现场协调。', state: 'claimed', sourceIds: ['ines'], contradicts: ['fact-ines-network'] },
    { id: 'fact-ines-network', subjectId: 'ines', label: 'Inés 同时参与另一个艺术研究网络的数据合作评估。', state: 'unknown', sourceIds: [], contradicts: ['fact-ines-role-public'] },
    { id: 'fact-data-rights', subjectId: 'route', label: '部分研究数据和个人记录不能默认进入公开作品。', state: 'unknown', sourceIds: [] },
    { id: 'fact-bad-solve', subjectId: 'project', label: '相机求解不可靠时，换成点云或 Gaussian 都不会自动修好底层问题。', state: 'unknown', sourceIds: [] },
    { id: 'fact-butterfly-authorship', subjectId: 'project', label: '蝴蝶题材本身不属于某个艺术家；具体形式、方法与直接引用仍需要说明来源。', state: 'unknown', sourceIds: [] }
  ],
  scenes: [
    { id: 'scene-studio', title: '一条合作语音', location: '你的工作室', entryNodeId: 'bs-01-invite', actorIds: ['player-butterfly-scholar', 'advisor-rui'], tags: ['briefing'] },
    { id: 'scene-arrival', title: '到达研究站', location: '哥斯达黎加 · 山地研究站', entryNodeId: 'bs-02-arrival', actorIds: ['player-butterfly-scholar', 'ines'], tags: ['arrival', 'relationship'] },
    { id: 'scene-field', title: '第一次现场采集', location: '云雾林样地', entryNodeId: 'bs-03-field', actorIds: ['player-butterfly-scholar', 'ines', 'rojas'], tags: ['capture', 'training'] },
    { id: 'scene-night', title: '晚上的临时工作台', location: '研究站临时工作室', entryNodeId: 'bs-04-process', actorIds: ['player-butterfly-scholar', 'ines', 'rojas'], tags: ['processing', 'creation'] },
    { id: 'scene-public', title: '第一次公开版本', location: '研究站临时展厅', entryNodeId: 'bs-05-public', actorIds: ['player-butterfly-scholar', 'ines'], tags: ['public', 'archive'] }
  ],
  nodes: [
    { id: 'bs-01-invite', sceneId: 'scene-studio', speakerId: 'advisor-rui', channel: 'message', text: ['睿发来一段 23 秒的语音。', '“有个研究站想找艺术家合作。他们长期记录蝴蝶和寄主植物，也留了一些空间资料。不是让你拍宣传片，他们想试着把这些东西做成一个观众能进入的数字作品。”', '“你先去一周。别急着定最后长什么样，先看看真实现场到底给你什么。”'], choices: [
      { id: 'bs-go-question', label: '去。先写下我真正想弄明白的问题', subtext: '蝴蝶一直在动，现场一直在变——数字化到底保存什么？', effects: { setFlags: ['accepted-field-trip', 'question-before-trip'], memories: [{ actorId: 'advisor-rui', about: 'departure', value: '带着保存什么的问题出发', weight: 3 }] }, nextNodeId: 'bs-02-arrival' },
      { id: 'bs-go-open', label: '去。先看现场，不提前规定作品形式', subtext: '把最终媒介留到采集之后再决定。', effects: { setFlags: ['accepted-field-trip', 'open-medium'], memories: [{ actorId: 'advisor-rui', about: 'departure', value: '没有先把作品锁成某一种媒介', weight: 2 }] }, nextNodeId: 'bs-02-arrival' }
    ] },
    { id: 'bs-02-arrival', sceneId: 'scene-arrival', speakerId: 'ines', channel: 'dialogue', text: ['Inés 在研究站门口接你。', '“我是 Inés，负责这次驻地和研究站之间的协调。交通、样地、植物档案，还有哪些数据能公开，都可以先找我。”', '她又补了一句：“我看过你两年前那件城市边缘植物扫描。那件东西最后没有把缺口修干净，我挺喜欢。”'], choices: [
      { id: 'bs-arrival-work', label: '先聊工作：明天先看样地和档案', subtext: '把关系从一次正常合作开始。', effects: { setFlags: ['ines-first-work'], trustDelta: { ines: 1 }, memories: [{ actorId: 'ines', about: 'first-meeting', value: '玩家先把注意力放在共同工作上', weight: 2 }] }, nextNodeId: 'bs-03-field' },
      { id: 'bs-arrival-prior', label: '问她怎么会看到那件很少公开的旧作品', subtext: '不是审问，只是自然地追问来源。', effects: { setFlags: ['ines-knows-prior-work'], trustDelta: { ines: 0 }, memories: [{ actorId: 'ines', about: 'first-meeting', value: '玩家注意到她对自己的旧项目异常熟悉', weight: 2 }] }, nextNodeId: 'bs-03-field' }
    ] },
    { id: 'bs-03-field', sceneId: 'scene-field', speakerId: 'rojas', channel: 'scene', text: ['第二天早上，一只蓝色蝴蝶停在寄主植物上不到两秒，又飞走了。风一直在动叶片。', 'Rojas 说：“别把会飞的东西当成石膏像。蝴蝶先记运动和停留；植物和这块空间，再去做扫描。”', '你第一次把任务拆成两条：活体行为是一条时间记录，静态环境是另一条空间记录。'], choices: [
      { id: 'bs-capture-relation', label: '记录蝴蝶运动，同时扫描寄主植物', subtext: '视频 / 观察记录 + 植物摄影测量，最后再在作品里合起来。', effects: { setFlags: ['capture-relation-route'], factUpdates: [{ factId: 'fact-live-not-static', state: 'verified', sourceId: 'rojas' }], memories: [{ actorId: 'rojas', about: 'capture-plan', value: '把活体运动和静态空间拆成两套采集', weight: 3 }] }, nextNodeId: 'bs-03b-audit' },
      { id: 'bs-capture-site', label: '先做一块完整样地的空间采集', subtext: '把蝴蝶作为之后回到空间里的行为层。', effects: { setFlags: ['capture-space-route'], factUpdates: [{ factId: 'fact-live-not-static', state: 'observed', sourceId: 'field' }] }, nextNodeId: 'bs-03b-audit' },
      { id: 'bs-capture-trace', label: '不碰活体，只收集自然留下的痕迹', subtext: '落翅、植物、时间、缺席记录；把“不带走活体”写进方法。', effects: { setFlags: ['capture-ethical-trace'], factUpdates: [{ factId: 'fact-live-not-static', state: 'verified', sourceId: 'field' }, { factId: 'fact-data-rights', state: 'observed', sourceId: 'field' }] }, nextNodeId: 'bs-03b-audit' }
    ] },
    { id: 'bs-03b-audit', sceneId: 'scene-field', speakerId: 'rojas', channel: 'scene', text: ['准备离场时，你翻了一遍照片：叶片背面几乎没拍到，小径转角只有一个角度，最后十几张明显更暗。', '这不是抽象的“技术债”。如果现在走，后面相机求解很可能就在这里断。'], choices: [
      { id: 'bs-audit-recapture', label: '现在补拍', subtext: '沿缺口再走一小段，保持相近曝光，把关键表面从多个角度补齐。', effects: { setFlags: ['field-recapture'], trustDelta: { rojas: 1 }, memories: [{ actorId: 'rojas', about: 'capture-discipline', value: '离场前发现缺口并补拍', weight: 3 }] }, nextNodeId: 'bs-04-process' },
      { id: 'bs-audit-leave', label: '先回去，接受后面可能失败', subtext: '不是禁用选项；你会把这个决定真正带进重建阶段。', effects: { setFlags: ['capture-gap-debt'], trustDelta: { rojas: -1 }, memories: [{ actorId: 'rojas', about: 'capture-discipline', value: '明知覆盖不足仍然离开现场', weight: 2 }] }, nextNodeId: 'bs-04-process' }
    ] },
    { id: 'bs-04-process', sceneId: 'scene-night', speakerId: 'rojas', channel: 'scene', text: ['晚上开始处理。80 张照片里只有 61 张成功定位，相机轨迹在叶片背面附近断开。', '先别管最终做点云还是 Gaussian。现在只回答一个问题：软件有没有正确算出这些照片分别从哪里拍的？'], choices: [
      { id: 'bs-align-diagnose', label: '先查相机求解', subtext: '看未注册照片和断开的轨迹；这一步弄明白以后再重建。', effects: { setFlags: ['diagnosed-camera-solve'], factUpdates: [{ factId: 'fact-bad-solve', state: 'verified', sourceId: 'rojas' }] }, nextNodeId: 'bs-04a-represent' },
      { id: 'bs-align-force', label: '先继续重建，看看错误长什么样', subtext: '你会得到一个更明显的失败版本，并把它保留下来。', effects: { setFlags: ['forced-reconstruct-bad-solve'], factUpdates: [{ factId: 'fact-bad-solve', state: 'observed', sourceId: 'failed-reconstruction' }] }, nextNodeId: 'bs-04a-represent' }
    ] },
    { id: 'bs-04a-represent', sceneId: 'scene-night', speakerId: 'player-butterfly-scholar', channel: 'record', text: ['相机关系终于能用了。现在才轮到选择空间怎么呈现。', '点云会让采样点、孔洞和扫描过程直接露出来；Gaussian 更适合让观众在一个连续的照片空间里移动。'], choices: [
      { id: 'bs-represent-pointcloud', label: '做点云版本', subtext: '保留点、密度和缺口，让采集过程继续可见。', effects: { setFlags: ['representation-pointcloud'] }, nextNodeId: 'bs-04e-compose' },
      { id: 'bs-represent-gaussian', label: '做 Gaussian 版本', subtext: '优先连续视角和空间外观，后面再决定怎么变形和互动。', effects: { setFlags: ['representation-gaussian'] }, nextNodeId: 'bs-04e-compose' }
    ] },
    { id: 'bs-04e-compose', sceneId: 'scene-night', speakerId: 'player-butterfly-scholar', channel: 'record', text: ['重建完成以后，你才真正开始做作品。', '你把空间导进 Blender / 实时系统。真实蝴蝶的飞行记录现在可以回来：它不一定变成一只写实蝴蝶，也可以变成形变、风、密度或观众靠近时才出现的行为。'], choices: [
      { id: 'bs-compose-noise', label: '用 Noise / 程序化形变做动画', subtext: '让扫描空间像记忆一样持续变形，不假装是真实物理。', effects: { setFlags: ['motion-procedural'] }, nextNodeId: 'bs-04f-authorship' },
      { id: 'bs-compose-physics', label: '让风和碰撞成为运动规则', subtext: '用物理模拟把叶片、粒子或扫描碎片交给环境条件。', effects: { setFlags: ['motion-physics'] }, nextNodeId: 'bs-04f-authorship' },
      { id: 'bs-compose-interactive', label: '让观众位置驱动“蝴蝶行为”', subtext: '不复制蝴蝶外形，而是把停留、逃离、聚集变成实时规则。', effects: { setFlags: ['motion-interactive-butterfly'] }, nextNodeId: 'bs-04f-authorship' }
    ] },
    { id: 'bs-04f-authorship', sceneId: 'scene-night', speakerId: 'player-butterfly-scholar', channel: 'message', text: ['你把一个测试片段发进同行群。有人回：“又是蝴蝶？现在是不是谁做蝴蝶，都得先解释自己不是在抄某个著名系列？”', '这句话很烦，但问题是真的：题材可以共享，具体视觉、方法和引用不能装作没有来源。'], choices: [
      { id: 'bs-authorship-source', label: '把来源和差异写清楚', subtext: '列出真正参考过的作品/方法，并说明你的核心是采集、行为和现场关系。', effects: { setFlags: ['authorship-attributed'], factUpdates: [{ factId: 'fact-butterfly-authorship', state: 'verified', sourceId: 'peer-group' }] }, nextNodeId: 'bs-04b-reveal' },
      { id: 'bs-authorship-system', label: '把“蝴蝶”进一步改成行为系统', subtext: '弱化蝴蝶图标，把停留、逃离、迁移和寄主关系变成作品规则。', effects: { setFlags: ['authorship-system-shift'], factUpdates: [{ factId: 'fact-butterfly-authorship', state: 'verified', sourceId: 'project-revision' }] }, nextNodeId: 'bs-04b-reveal' },
      { id: 'bs-authorship-defend', label: '先不改，保留这个争议进入公开测试', subtext: '你不会被禁止继续，但策展反馈会更集中在“为什么一定是蝴蝶”。', effects: { setFlags: ['authorship-unresolved'], factUpdates: [{ factId: 'fact-butterfly-authorship', state: 'observed', sourceId: 'peer-group' }] }, nextNodeId: 'bs-04b-reveal' }
    ] },
    { id: 'bs-04b-reveal', sceneId: 'scene-night', speakerId: 'ines', channel: 'dialogue', text: ['准备公开版本时，Inés 把数据许可表和另一张工作证一起放到桌上。', '“有件事我应该早点说。我除了负责驻地，也在帮另一个研究网络评估这些档案能不能进入长期合作。我第一次没讲完整。”', '她没有否认你们这几天的合作，也没有要求你立刻原谅。她只是把完整信息交给你。'], choices: [
      { id: 'bs-reveal-listen', label: '先听她把数据边界讲完', subtext: '把合作和私人判断分开，先弄清哪些东西能公开。', effects: { setFlags: ['ines-revealed', 'relationship-open'], factUpdates: [{ factId: 'fact-ines-network', state: 'revealed', sourceId: 'ines' }, { factId: 'fact-data-rights', state: 'verified', sourceId: 'ines' }], trustDelta: { ines: 2 }, memories: [{ actorId: 'ines', about: 'reveal', value: '玩家先听完整信息再做判断', weight: 4 }] }, nextNodeId: 'bs-05-public' },
      { id: 'bs-reveal-distance', label: '项目继续，但先把私人关系停一下', subtext: '你仍然尊重数据边界，但不假装这次隐瞒没有影响。', effects: { setFlags: ['ines-revealed', 'relationship-professional'], factUpdates: [{ factId: 'fact-ines-network', state: 'revealed', sourceId: 'ines' }, { factId: 'fact-data-rights', state: 'verified', sourceId: 'ines' }], trustDelta: { ines: -1 }, memories: [{ actorId: 'ines', about: 'reveal', value: '玩家继续合作但拉开私人距离', weight: 4 }] }, nextNodeId: 'bs-05-public' }
    ] },
    { id: 'bs-05-public', sceneId: 'scene-public', speakerId: 'player-butterfly-scholar', channel: 'record', text: ['临时版本终于开放。观众看到的不是一座“被完整复制的森林”。', '真实蝴蝶留下运动和停留，植物与空间留下扫描，缺口留下采集过程；你又用动画和交互把它们重新组织。', '你突然能很具体地说出这次学会了什么：怎么采、什么时候补拍、先看相机求解、怎么选表示，以及蝴蝶题材怎样从图像变成自己的行为规则。'], choices: [
      { id: 'bs-archive-open', label: '归档这个版本', subtext: '保存 Blueprint、失败版本、方法、人物关系和公开边界。', effects: { setFlags: ['butterfly-route-complete'] }, nextNodeId: 'bs-end' }
    ] },
    { id: 'bs-end', sceneId: 'scene-public', speakerId: 'player-butterfly-scholar', channel: 'record', text: ['终于做完了。', '这次不是“学会了一个软件”。你留下了一套以后还能拿去别的现场继续用的方法。'], choices: [] }
  ]
};

export const butterflyWorldEffectsByChoice: Record<string, ButterflyWorldEffect> = {
  'bs-go-question': { evidenceIds: ['ev-invitation'], projectTags: ['field-trip', 'preservation-question'] },
  'bs-go-open': { evidenceIds: ['ev-invitation'], projectTags: ['field-trip', 'open-medium'] },
  'bs-arrival-work': { evidenceIds: ['ev-ines-introduction'], projectTags: ['relationship-start'] },
  'bs-arrival-prior': { threadIds: ['thread-ines-prior-work'], evidenceIds: ['ev-ines-knows-old-work'] },
  'bs-capture-relation': { unlockNodeIds: ['field-capture-session', 'butterfly-observation', 'capture-motion-video', 'plant-specimen', 'capture-photo-sequence'], methodIds: ['method-split-motion-and-space'], qualitySignals: ['capture-plan-clear'], projectTags: ['butterfly-behavior', 'host-plant'] },
  'bs-capture-site': { unlockNodeIds: ['field-capture-session', 'capture-photo-sequence', 'capture-lidar-pass'], methodIds: ['method-spatial-capture-route'], projectTags: ['site-scan'] },
  'bs-capture-trace': { unlockNodeIds: ['butterfly-observation', 'plant-specimen', 'field-note'], methodIds: ['method-selective-preservation'], qualitySignals: ['non-invasive-capture'], projectTags: ['trace', 'ethics'] },
  'bs-audit-recapture': { unlockNodeIds: ['capture-quality-check'], methodIds: ['method-check-before-leave'], evidenceIds: ['ev-field-recapture'], qualitySignals: ['coverage-improved'], achievementIds: ['ach-field-check'] },
  'bs-audit-leave': { threadIds: ['thread-capture-gap-debt'], evidenceIds: ['ev-known-coverage-gap'], qualitySignals: ['coverage-risk'] },
  'bs-align-diagnose': { unlockNodeIds: ['process-metashape-align', 'process-colmap-sfm'], methodIds: ['method-diagnose-before-reconstruct'], evidenceIds: ['ev-camera-registration-check'], qualitySignals: ['solve-understood'] },
  'bs-align-force': { unlockNodeIds: ['process-dense-reconstruction'], threadIds: ['thread-unreliable-camera-solve'], evidenceIds: ['ev-failed-reconstruction'], qualitySignals: ['failure-version-kept'] },
  'bs-represent-pointcloud': { unlockNodeIds: ['process-dense-reconstruction', 'process-point-clean'], methodIds: ['method-sampling-as-form'], projectTags: ['point-cloud'] },
  'bs-represent-gaussian': { unlockNodeIds: ['process-gaussian-splat', 'process-point-clean'], methodIds: ['method-view-dependent-space'], projectTags: ['gaussian-splatting'] },
  'bs-compose-noise': { unlockNodeIds: ['process-blender-procedural'], methodIds: ['method-motion-as-rule'], projectTags: ['procedural-motion'] },
  'bs-compose-physics': { unlockNodeIds: ['process-physics-motion'], methodIds: ['method-motion-as-rule'], projectTags: ['physics-motion'] },
  'bs-compose-interactive': { unlockNodeIds: ['process-butterfly-behavior'], methodIds: ['method-motion-as-rule'], projectTags: ['interactive-behavior'], achievementIds: ['ach-butterfly-as-system'] },
  'bs-authorship-source': { unlockNodeIds: ['method-source-attribution'], methodIds: ['method-source-attribution'], archiveEntryIds: ['archive-source-note'], qualitySignals: ['source-clear'], achievementIds: ['ach-credit-without-panic'] },
  'bs-authorship-system': { unlockNodeIds: ['method-source-attribution', 'process-butterfly-behavior'], methodIds: ['method-source-attribution'], qualitySignals: ['motif-transformed-into-system'], achievementIds: ['ach-butterfly-as-system'] },
  'bs-authorship-defend': { threadIds: ['thread-butterfly-authorship'], evidenceIds: ['ev-peer-copy-question'], qualitySignals: ['authorship-question-open'] },
  'bs-reveal-listen': { threadIds: ['thread-data-rights'], archiveEntryIds: ['archive-ines-reveal'], projectTags: ['data-rights'], qualitySignals: ['public-boundary-clear'] },
  'bs-reveal-distance': { threadIds: ['thread-data-rights'], archiveEntryIds: ['archive-ines-reveal'], projectTags: ['data-rights'], qualitySignals: ['public-boundary-clear'] },
  'bs-archive-open': { archiveEntryIds: ['archive-butterfly-route', 'archive-ines-reveal'], methodIds: ['method-selective-preservation'], evidenceIds: ['ev-public-version'], achievementIds: ['ach-special-butterfly-complete'] }
};
