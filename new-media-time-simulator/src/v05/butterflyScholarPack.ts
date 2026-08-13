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
  practice: '你长期记录蝴蝶、寄主植物和它们出现的时间，也做空间扫描、点云和实时影像。你真正感兴趣的不是“把自然做成 3D”，而是运动、空间和缺失进入数字系统以后，会被怎样重新组织。',
  priorWork: [
    '把城市边缘植物做成带时间戳的扫描档案',
    '用植物标本、现场录音和点云做过一件小型空间作品',
    '收集失败扫描、缺失标签和“今天没有出现”的观察记录'
  ],
  currentQuestion: '蝴蝶一直在动，植物会枯，现场也会变化。我要保存的是外形、运动，还是它们之间的关系？'
};

export const butterflyResearchCards: ButterflyResearchCard[] = [
  { id: 'research-live-butterfly', title: '活蝴蝶怎么采集？', short: '活体运动不适合硬做成静态摄影测量对象。', plain: '会飞的蝴蝶一直在变位置。更适合记录它的运动、停留点和出现时间；植物、石头、小径和空间才适合做摄影测量或 LiDAR。', why: '先把“时间里的行为”和“空间里的形状”拆开，后面再在作品里重新组合。', unlockNodeIds: ['capture-motion-video', 'field-capture-session'], methodId: 'method-split-motion-and-space' },
  { id: 'research-overlap', title: '摄影测量为什么需要重叠？', short: '软件需要在不同照片里认出同一块表面。', plain: '围着植物或空间移动拍摄，让相邻照片重复看到同一块区域。只站在原地转相机，或一面只拍一张，后面容易断。', why: '现场补拍最便宜。回到工作室才发现缺口，往往只能重来或接受失败。', unlockNodeIds: ['capture-quality-check'], methodId: 'method-check-before-leave' },
  { id: 'research-camera-solve', title: '什么是相机求解？', short: '先算出每张照片是从哪里拍的。', plain: 'Metashape / COLMAP 会先找照片之间的共同特征，再估计每张照片的相机位置。大量照片没注册、相机轨迹突然断掉，就说明底层关系不可靠。', why: '相机关系错了，点云、Gaussian 或网格只会把错误继续放大。', unlockNodeIds: ['process-metashape-align', 'process-colmap-sfm'], methodId: 'method-diagnose-before-reconstruct' },
  { id: 'research-representation', title: '点云和 Gaussian 有什么区别？', short: '不是“低级 / 高级”，而是两种不同的空间表示。', plain: '点云会直接让你看到一个个采样点、密度和孔洞；Gaussian 更适合从不同视角连续浏览照片里的空间外观。', why: '先问作品想让观众看到什么，再选技术。技术名字不是质量等级。', unlockNodeIds: ['process-dense-reconstruction', 'process-gaussian-splat'], methodId: 'method-choose-representation-by-work' },
  { id: 'research-blender-motion', title: '扫描完以后还能怎么动？', short: '重建只是原料，作品可以继续在 Blender 或实时系统里变化。', plain: '可以用 Noise / Geometry Nodes 做程序化形变，也可以用风、碰撞、粒子等物理规则，或者让观众位置实时驱动空间中的“停留、逃离、聚集”。', why: '动画不是“让点云随便飘起来”。运动规则本身应该回答作品的问题。', unlockNodeIds: ['process-blender-procedural', 'process-physics-motion', 'process-butterfly-behavior'], methodId: 'method-motion-as-rule' },
  { id: 'research-butterfly-authorship', title: '“做蝴蝶”算抄袭吗？', short: '题材不属于某一个人，但具体形式、方法和直接引用需要说清楚。', plain: '很多艺术家都使用蝴蝶。真正要判断的是：有没有复制具体视觉或结构；有没有直接借用别人的方法；你的作品有没有把蝴蝶转成自己的问题和规则。', why: '“蝴蝶又不是谁发明的”解决不了问题。更有用的是把来源、差异和你真正做出的东西写清楚。', unlockNodeIds: ['method-source-attribution'], methodId: 'method-source-attribution' },
  { id: 'research-specimen-ethics', title: '标本、数据和公开边界', short: '能采集、能复制，不等于都应该公开。', plain: '活体不因为作品需要就应该被捕捉；自然脱落材料、已有标本、研究站数据和个人观察记录也可能有不同的使用许可。', why: '数字复制让“带走”变得太容易，所以来源、许可和谁有权决定公开范围反而更重要。', methodId: 'method-selective-preservation' }
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
  id: 'narrative-butterfly-scholar-v4',
  title: '哥斯达黎加的蝴蝶学者',
  actors: [
    { id: 'field-lab', name: 'Bosque Field Lab', publicRole: '驻地合作项目', motives: ['邀请艺术家把长期观察资料转成可体验作品', '保留研究资料的上下文和使用边界'], remembers: [] },
    { id: 'player-butterfly-scholar', name: '你', publicRole: '新媒体艺术家 / 蝴蝶研究者', motives: ['完成一件真正来自现场的新作品', '把扫描变成可复用的方法', '弄清蝴蝶题材如何变成自己的系统'], remembers: [] },
    { id: 'ines', name: 'Inés', publicRole: '驻地协调 / 数据许可联络', coverStory: '负责研究站、驻地艺术家和植物档案之间的协调。', hiddenRole: '她同时参与一个研究网络的长期合作评估；这个评估角色最初没有被明确写进艺术家的 Brief。', motives: ['保护研究站的数据边界', '让驻地作品满足授权要求', '完成研究网络的合作评估'], remembers: ['你第一次怎么跟她沟通工作', '你如何处理来源和公开边界', '你面对蝴蝶题材争议时怎么回应', '角色冲突被说明以后你要求怎样继续合作'] },
    { id: 'rojas', name: 'Rojas', publicRole: '研究站技术员', motives: ['保护长期样地', '让采集方法可复现'], remembers: ['你有没有离场前检查', '你是否诚实记录失败数据'] }
  ],
  facts: [
    { id: 'fact-invite', subjectId: 'route', label: '研究站希望把蝴蝶观察、寄主植物档案和部分空间记录转成一件可进入的数字作品。', state: 'verified', sourceIds: ['field-lab'] },
    { id: 'fact-live-not-static', subjectId: 'project', label: '活蝴蝶的运动和静态植物/空间需要不同采集方式。', state: 'unknown', sourceIds: [] },
    { id: 'fact-ines-role-public', subjectId: 'ines', label: '最初的 Brief 只说明 Inés 是驻地协调和数据许可联络。', state: 'claimed', sourceIds: ['field-lab'], contradicts: ['fact-ines-network'] },
    { id: 'fact-ines-network', subjectId: 'ines', label: 'Inés 同时参与另一个研究网络的长期合作评估。', state: 'unknown', sourceIds: [], contradicts: ['fact-ines-role-public'] },
    { id: 'fact-data-rights', subjectId: 'route', label: '部分研究数据和个人记录不能默认进入公开作品。', state: 'unknown', sourceIds: [] },
    { id: 'fact-bad-solve', subjectId: 'project', label: '相机求解不可靠时，换成点云或 Gaussian 都不会自动修好底层问题。', state: 'unknown', sourceIds: [] },
    { id: 'fact-butterfly-authorship', subjectId: 'project', label: '蝴蝶题材本身不属于某个艺术家；具体形式、方法、引用和数据来源仍需要说明。', state: 'unknown', sourceIds: [] }
  ],
  scenes: [
    { id: 'scene-studio', title: '合作邀请', location: '你的工作室', entryNodeId: 'bs-01-invite', actorIds: ['player-butterfly-scholar', 'field-lab'], tags: ['briefing'] },
    { id: 'scene-arrival', title: '到达研究站', location: '哥斯达黎加 · 山地研究站', entryNodeId: 'bs-02-arrival', actorIds: ['player-butterfly-scholar', 'ines'], tags: ['arrival', 'relationship'] },
    { id: 'scene-field', title: '第一次现场采集', location: '云雾林样地', entryNodeId: 'bs-03-field', actorIds: ['player-butterfly-scholar', 'ines', 'rojas'], tags: ['capture', 'training'] },
    { id: 'scene-night', title: '晚上的临时工作台', location: '研究站临时工作室', entryNodeId: 'bs-04-process', actorIds: ['player-butterfly-scholar', 'ines', 'rojas'], tags: ['processing', 'creation'] },
    { id: 'scene-public', title: '第一次公开版本', location: '研究站临时展厅', entryNodeId: 'bs-05-public', actorIds: ['player-butterfly-scholar', 'ines'], tags: ['public', 'archive'] }
  ],
  nodes: [
    { id: 'bs-01-invite', sceneId: 'scene-studio', speakerId: 'field-lab', channel: 'message', text: ['晚上十点多，你收到 Bosque Field Lab 发来的一条 23 秒语音。', '“我们这里有几年蝴蝶观察、寄主植物记录和一些空间影像。想请你来一周，不是做宣传片，也没有规定必须做 VR。先看现场，再看这些材料能不能变成一件作品。”', '附件只有一页：住宿和样地权限由研究站提供；研究数据和个人观察记录，公开前要重新确认许可。'], choices: [
      { id: 'bs-go-question', label: '接。先写下一个问题再出发', subtext: '蝴蝶一直在动——我要保存的是外形、运动，还是它和环境的关系？', effects: { setFlags: ['accepted-field-trip', 'question-before-trip'] }, nextNodeId: 'bs-02-arrival' },
      { id: 'bs-go-open', label: '接。先去看现场，不提前定媒介', subtext: '不先决定做点云、Gaussian、VR 或屏幕。', effects: { setFlags: ['accepted-field-trip', 'open-medium'] }, nextNodeId: 'bs-02-arrival' }
    ] },
    { id: 'bs-02-arrival', sceneId: 'scene-arrival', speakerId: 'ines', channel: 'dialogue', text: ['Inés 在研究站门口接你，把门禁卡和一张样地地图递过来。', '“我是 Inés。这周交通、样地、植物档案和数据许可都找我。明天 Rojas 会带你走第一块样地。”', '她看了一眼你的项目简介：“你写自己是 butterfly scholar？”你说：“一半开玩笑。我会记录蝴蝶，但我通常扫描的是它周围的空间。”'], choices: [
      { id: 'bs-arrival-work', label: '先把明天的工作说清楚', subtext: '确认样地、能拍什么、能带走什么数据。', effects: { setFlags: ['ines-first-work'], trustDelta: { ines: 1 }, memories: [{ actorId: 'ines', about: 'first-meeting', value: '玩家先确认现场工作和数据边界', weight: 2 }] }, nextNodeId: 'bs-03-field' },
      { id: 'bs-arrival-prior', label: '顺便问：你怎么知道我那件没怎么公开的旧作品？', subtext: '正常追问信息来源，不把第一次见面变成审问。', effects: { setFlags: ['ines-knows-prior-work'], trustDelta: { ines: 0 }, memories: [{ actorId: 'ines', about: 'first-meeting', value: '玩家注意到她对旧项目的信息来源不明', weight: 2 }] }, nextNodeId: 'bs-03-field' }
    ] },
    { id: 'bs-03-field', sceneId: 'scene-field', speakerId: 'rojas', channel: 'scene', text: ['第二天早上，一只蓝色蝴蝶在寄主植物上停了不到两秒。你刚抬起相机，它已经飞到画面外。风一直在动叶片。', 'Rojas 看了一眼：“别把会飞的东西当成石膏像。蝴蝶记它怎么来、停在哪里、什么时候走；植物和这块空间，再做扫描。”', '这次采集第一次被拆成两种数据：一条发生在时间里，一条发生在空间里。'], choices: [
      { id: 'bs-capture-relation', label: '运动和空间分开采，最后再组合', subtext: '记录蝴蝶的停留/飞行 + 扫描寄主植物和周围空间。', effects: { setFlags: ['capture-relation-route'], factUpdates: [{ factId: 'fact-live-not-static', state: 'verified', sourceId: 'rojas' }], memories: [{ actorId: 'rojas', about: 'capture-plan', value: '把活体运动和静态空间拆成两套采集', weight: 3 }] }, nextNodeId: 'bs-03b-audit' },
      { id: 'bs-capture-site', label: '先把样地空间完整做下来', subtext: '先得到植物和路径的空间记录，蝴蝶行为以后再叠回去。', effects: { setFlags: ['capture-space-route'], factUpdates: [{ factId: 'fact-live-not-static', state: 'observed', sourceId: 'field' }] }, nextNodeId: 'bs-03b-audit' },
      { id: 'bs-capture-trace', label: '不追活体，只记录它留下的关系', subtext: '寄主植物、自然脱落材料、出现时间和“今天没出现”的记录。', effects: { setFlags: ['capture-ethical-trace'], factUpdates: [{ factId: 'fact-live-not-static', state: 'verified', sourceId: 'field' }, { factId: 'fact-data-rights', state: 'observed', sourceId: 'field' }] }, nextNodeId: 'bs-03b-audit' }
    ] },
    { id: 'bs-03b-audit', sceneId: 'scene-field', speakerId: 'rojas', channel: 'scene', text: ['准备离场时，你翻了一遍照片：叶片背面几乎没拍到，小径转角只有一个角度，最后十几张也明显更暗。', '现在补拍只要十分钟。带回去以后，这些缺口可能会直接变成相机求解断裂。'], choices: [
      { id: 'bs-audit-recapture', label: '现在补拍', subtext: '沿缺口再走一小段，保持相近曝光，把关键表面补到多个角度。', effects: { setFlags: ['field-recapture'], trustDelta: { rojas: 1 }, memories: [{ actorId: 'rojas', about: 'capture-discipline', value: '离场前发现缺口并补拍', weight: 3 }] }, nextNodeId: 'bs-04-process' },
      { id: 'bs-audit-leave', label: '先回去，接受这个风险', subtext: '可以这么做；晚上你会真的看到这个决定造成什么。', effects: { setFlags: ['capture-gap-debt'], trustDelta: { rojas: -1 }, memories: [{ actorId: 'rojas', about: 'capture-discipline', value: '明知覆盖不足仍然离开现场', weight: 2 }] }, nextNodeId: 'bs-04-process' }
    ] },
    { id: 'bs-04-process', sceneId: 'scene-night', speakerId: 'rojas', channel: 'scene', text: ['晚上开始处理。先看相机求解，不急着点“生成”。', '这一步只回答一个问题：软件有没有正确算出这些照片分别从哪里拍的？'], choices: [
      { id: 'bs-align-diagnose', label: '先查相机求解', subtext: '看未注册照片、断开的轨迹和缺口到底在哪里。', effects: { setFlags: ['diagnosed-camera-solve'], factUpdates: [{ factId: 'fact-bad-solve', state: 'verified', sourceId: 'rojas' }] }, nextNodeId: 'bs-04a-represent' },
      { id: 'bs-align-force', label: '先继续重建，看错误会变成什么', subtext: '不是“错误答案”。你会得到一个失败版本，再决定是修还是把失败留下。', effects: { setFlags: ['forced-reconstruct-bad-solve'], factUpdates: [{ factId: 'fact-bad-solve', state: 'observed', sourceId: 'failed-reconstruction' }] }, nextNodeId: 'bs-04x-failure' }
    ] },
    { id: 'bs-04x-failure', sceneId: 'scene-night', speakerId: 'player-butterfly-scholar', channel: 'record', text: ['错误重建真的出来了：同一片叶子被拉成两层，转角像被切开，几张照片悬在错误的位置。', '它很难说是“好看”，但非常诚实地显示了白天缺了什么。现在你可以把失败留下，同时决定要不要修出一个可用版本。'], choices: [
      { id: 'bs-failure-repair', label: '保留失败版本，然后回去修相机求解', subtext: '把失败当 Evidence，不把失败当成必须隐藏的废料。', effects: { setFlags: ['failure-kept', 'solve-repaired'], factUpdates: [{ factId: 'fact-bad-solve', state: 'verified', sourceId: 'failed-reconstruction' }] }, nextNodeId: 'bs-04a-represent' },
      { id: 'bs-failure-use', label: '不修干净，把断裂本身带进作品', subtext: '接受技术问题成为形式，但必须承认它来自采集缺口。', effects: { setFlags: ['failure-used-as-form', 'solve-still-fragile'] }, nextNodeId: 'bs-04a-represent' }
    ] },
    { id: 'bs-04a-represent', sceneId: 'scene-night', speakerId: 'player-butterfly-scholar', channel: 'record', text: ['你终于把昨晚那堆坏数据弄成了一个能看的版本。问题来了：要不要把它最狼狈的地方给观众看？', '如果保留孔洞和断裂，观众会看到这次采集的不完整；如果把画面尽量做顺，观众更容易走进去，但未必知道你经历过什么。'], choices: [
      { id: 'bs-represent-pointcloud', label: '把缺口也给观众看', subtext: '让不完整成为作品的一部分：别把现场装成从没出过错。', effects: { setFlags: ['representation-pointcloud'] }, nextNodeId: 'bs-04e-compose' },
      { id: 'bs-represent-gaussian', label: '先让观众能舒服地走进去', subtext: '先把观看做顺；采集的麻烦留在作品记录里。', effects: { setFlags: ['representation-gaussian'] }, nextNodeId: 'bs-04e-compose' }
    ] },
    { id: 'bs-04e-compose', sceneId: 'scene-night', speakerId: 'player-butterfly-scholar', channel: 'record', text: ['重建完成以后，你才真正开始做作品。', '空间进 Blender / 实时系统。白天记录的蝴蝶运动现在可以回来：不一定变成一只写实蝴蝶，也可以变成形变、风、密度，或者观众靠近时才发生的行为。'], choices: [
      { id: 'bs-compose-noise', label: '用 Noise / 程序化形变做动画', subtext: '让空间持续发生规则化形变，不假装是真实物理。', effects: { setFlags: ['motion-procedural'] }, nextNodeId: 'bs-04f-authorship' },
      { id: 'bs-compose-physics', label: '让风和碰撞成为运动规则', subtext: '把叶片、粒子或扫描碎片交给物理条件。', effects: { setFlags: ['motion-physics'] }, nextNodeId: 'bs-04f-authorship' },
      { id: 'bs-compose-interactive', label: '把蝴蝶的“停留 / 逃离 / 聚集”写成互动规则', subtext: '观众靠近时系统改变行为，不复制一只蝴蝶贴图。', effects: { setFlags: ['motion-interactive-butterfly'] }, nextNodeId: 'bs-04f-authorship' }
    ] },
    { id: 'bs-04f-authorship', sceneId: 'scene-night', speakerId: 'player-butterfly-scholar', channel: 'message', text: ['你把 20 秒测试发进同行群。很快来了三种回复。', '策展朋友：“蝴蝶很抓眼，但为什么非得是蝴蝶？” 技术同行：“别人也做过蝴蝶，你到底借了什么？” 研究站的人只问：“你用了哪一批观察数据？”', '三句话看起来都在问“蝴蝶”，其实分别在问视觉母题、方法来源和数据来源。'], choices: [
      { id: 'bs-authorship-source', label: '把来源和差异写清楚', subtext: '真正参考过什么就写什么；同时说明你的核心是采集、行为和现场关系。', effects: { setFlags: ['authorship-attributed'], factUpdates: [{ factId: 'fact-butterfly-authorship', state: 'verified', sourceId: 'peer-group' }] }, nextNodeId: 'bs-04b-reveal' },
      { id: 'bs-authorship-system', label: '继续改：把“蝴蝶图像”退到后面', subtext: '让停留、逃离、迁移、寄主关系成为作品主结构。', effects: { setFlags: ['authorship-system-shift'], factUpdates: [{ factId: 'fact-butterfly-authorship', state: 'verified', sourceId: 'project-revision' }] }, nextNodeId: 'bs-04b-reveal' },
      { id: 'bs-authorship-defend', label: '先不改，把“为什么是蝴蝶”留给公开测试', subtext: '不假装争议已经解决；让观众和策展反馈继续追问。', effects: { setFlags: ['authorship-unresolved'], factUpdates: [{ factId: 'fact-butterfly-authorship', state: 'observed', sourceId: 'peer-group' }] }, nextNodeId: 'bs-04b-reveal' }
    ] },
    { id: 'bs-04b-reveal', sceneId: 'scene-night', speakerId: 'ines', channel: 'dialogue', text: ['准备公开版本时，Inés 把数据许可表和一份合作评估附件放到桌上。', '“这件事应该更早写进 Brief：我不只是帮驻地协调，我也在替另一个研究网络做长期合作评估。也就是说，这几天我既在帮你拿资料，也在判断这套合作以后要不要继续。”', '问题不是她“真实身份是谁”，而是协作者同时也是评估者——这个角色冲突本来就应该提前说明。'], choices: [
      { id: 'bs-reveal-listen', label: '先把哪些数据能公开逐条列清楚', subtext: '项目继续；先把材料来源、许可和最终公开范围写进记录。', effects: { setFlags: ['ines-revealed', 'institutional-boundary-written'], factUpdates: [{ factId: 'fact-ines-network', state: 'revealed', sourceId: 'ines' }, { factId: 'fact-data-rights', state: 'verified', sourceId: 'ines' }], trustDelta: { ines: 1 }, memories: [{ actorId: 'ines', about: 'reveal', value: '玩家先把授权边界写清楚再继续', weight: 4 }] }, nextNodeId: 'bs-05-public' },
      { id: 'bs-reveal-distance', label: '要求把“协作”和“评估”两个角色拆开', subtext: '项目可以继续，但后续评估必须由另一个人负责。', effects: { setFlags: ['ines-revealed', 'role-conflict-separated'], factUpdates: [{ factId: 'fact-ines-network', state: 'revealed', sourceId: 'ines' }, { factId: 'fact-data-rights', state: 'verified', sourceId: 'ines' }], trustDelta: { ines: 0 }, memories: [{ actorId: 'ines', about: 'reveal', value: '玩家要求机构把协作与评估角色分开', weight: 4 }] }, nextNodeId: 'bs-05-public' }
    ] },
    { id: 'bs-05-public', sceneId: 'scene-public', speakerId: 'player-butterfly-scholar', channel: 'record', text: ['临时版本终于开放。它没有把森林包装成一个“完整数字复制品”。', '真实蝴蝶留下时间和行为，植物与空间留下扫描，失败版本留下采集过程；你再用动画或互动把这些材料重新组织。', '现在你能说清这件作品是怎么做出来的，也能说清哪些东西没有被放进去，以及为什么。'], choices: [
      { id: 'bs-archive-open', label: '收工。把这次版本归档', subtext: '保存 Blueprint、失败版本、方法、人物/机构关系、来源说明和公开边界。', effects: { setFlags: ['butterfly-route-complete'] }, nextNodeId: 'bs-end' }
    ] },
    { id: 'bs-end', sceneId: 'scene-public', speakerId: 'player-butterfly-scholar', channel: 'record', text: ['终于做完了。', '这次不是“学会了一个软件”。真正留下来的是一套下次还能用的现场判断和制作方法。'], choices: [] }
  ]
};

export const butterflyWorldEffectsByChoice: Record<string, ButterflyWorldEffect> = {
  'bs-go-question': { evidenceIds: ['ev-invitation'], projectTags: ['field-trip', 'preservation-question'] },
  'bs-go-open': { evidenceIds: ['ev-invitation'], projectTags: ['field-trip', 'open-medium'] },
  'bs-arrival-work': { evidenceIds: ['ev-ines-introduction'], projectTags: ['working-boundary-first'] },
  'bs-arrival-prior': { threadIds: ['thread-ines-prior-work'], evidenceIds: ['ev-ines-knows-old-work'] },
  'bs-capture-relation': { unlockNodeIds: ['field-capture-session', 'butterfly-observation', 'capture-motion-video', 'plant-specimen', 'capture-photo-sequence'], methodIds: ['method-split-motion-and-space'], qualitySignals: ['capture-plan-clear'], projectTags: ['butterfly-behavior', 'host-plant'] },
  'bs-capture-site': { unlockNodeIds: ['field-capture-session', 'capture-photo-sequence', 'capture-lidar-pass'], methodIds: ['method-spatial-capture-route'], projectTags: ['site-scan'] },
  'bs-capture-trace': { unlockNodeIds: ['butterfly-observation', 'plant-specimen', 'field-note'], methodIds: ['method-selective-preservation'], qualitySignals: ['non-invasive-capture'], projectTags: ['trace', 'ethics'] },
  'bs-audit-recapture': { unlockNodeIds: ['capture-quality-check'], methodIds: ['method-check-before-leave'], evidenceIds: ['ev-field-recapture'], qualitySignals: ['coverage-improved'], achievementIds: ['ach-field-check'] },
  'bs-audit-leave': { threadIds: ['thread-capture-gap-debt'], evidenceIds: ['ev-known-coverage-gap'], qualitySignals: ['coverage-risk'] },
  'bs-align-diagnose': { unlockNodeIds: ['process-metashape-align', 'process-colmap-sfm'], methodIds: ['method-diagnose-before-reconstruct'], evidenceIds: ['ev-camera-registration-check'], qualitySignals: ['solve-understood'] },
  'bs-align-force': { unlockNodeIds: ['process-dense-reconstruction'], threadIds: ['thread-unreliable-camera-solve'], evidenceIds: ['ev-failed-reconstruction'], qualitySignals: ['failure-visible'] },
  'bs-failure-repair': { unlockNodeIds: ['process-metashape-align', 'process-point-clean'], methodIds: ['method-diagnose-before-reconstruct'], evidenceIds: ['ev-failed-reconstruction-kept'], qualitySignals: ['solve-repaired', 'failure-version-kept'], achievementIds: ['ach-keep-the-failure'] },
  'bs-failure-use': { evidenceIds: ['ev-fragile-reconstruction-used'], qualitySignals: ['failure-used-as-form'], projectTags: ['broken-reconstruction'] },
  'bs-represent-pointcloud': { unlockNodeIds: ['process-dense-reconstruction', 'process-point-clean'], methodIds: ['method-sampling-as-form'], projectTags: ['point-cloud'] },
  'bs-represent-gaussian': { unlockNodeIds: ['process-gaussian-splat', 'process-point-clean'], methodIds: ['method-view-dependent-space'], projectTags: ['gaussian-splatting'] },
  'bs-compose-noise': { unlockNodeIds: ['process-blender-procedural'], methodIds: ['method-motion-as-rule'], projectTags: ['procedural-motion'] },
  'bs-compose-physics': { unlockNodeIds: ['process-physics-motion'], methodIds: ['method-motion-as-rule'], projectTags: ['physics-motion'] },
  'bs-compose-interactive': { unlockNodeIds: ['process-butterfly-behavior'], methodIds: ['method-motion-as-rule'], projectTags: ['interactive-behavior'], achievementIds: ['ach-butterfly-as-system'] },
  'bs-authorship-source': { unlockNodeIds: ['method-source-attribution'], methodIds: ['method-source-attribution'], archiveEntryIds: ['archive-source-note'], qualitySignals: ['source-clear'], achievementIds: ['ach-credit-without-panic'] },
  'bs-authorship-system': { unlockNodeIds: ['method-source-attribution', 'process-butterfly-behavior'], methodIds: ['method-source-attribution'], qualitySignals: ['motif-transformed-into-system'], achievementIds: ['ach-butterfly-as-system'] },
  'bs-authorship-defend': { threadIds: ['thread-butterfly-authorship'], evidenceIds: ['ev-peer-copy-question'], qualitySignals: ['authorship-question-open'] },
  'bs-reveal-listen': { threadIds: ['thread-data-rights'], archiveEntryIds: ['archive-ines-role-conflict'], projectTags: ['data-rights'], qualitySignals: ['public-boundary-clear'] },
  'bs-reveal-distance': { threadIds: ['thread-role-conflict'], archiveEntryIds: ['archive-ines-role-conflict'], projectTags: ['governance'], qualitySignals: ['roles-separated'] },
  'bs-archive-open': { archiveEntryIds: ['archive-butterfly-route', 'archive-ines-role-conflict'], methodIds: ['method-selective-preservation'], evidenceIds: ['ev-public-version'], achievementIds: ['ach-special-butterfly-complete'] }
};

export function deriveButterflyWorldEffect(flags: string[], choiceId: string): ButterflyWorldEffect {
  const has = new Set(flags);
  if (choiceId === 'bs-align-diagnose' && has.has('field-recapture')) {
    return { achievementIds: ['ach-clean-solve'], qualitySignals: ['solve-reliable'], evidenceIds: ['ev-recapture-paid-off'] };
  }
  if (choiceId === 'bs-compose-interactive' && has.has('capture-relation-route')) {
    return { achievementIds: ['ach-observation-to-system'], qualitySignals: ['field-observation-returned-as-rule'] };
  }
  if (choiceId === 'bs-authorship-system' && has.has('motion-interactive-butterfly')) {
    return { achievementIds: ['ach-butterfly-without-icon'], qualitySignals: ['butterfly-logic-not-butterfly-icon'] };
  }
  return {};
}

export function resolveButterflyNodeText(nodeId: string, flags: string[], fallback: string[]) {
  const has = new Set(flags);
  if (nodeId === 'bs-04-process' && has.has('field-recapture')) {
    return ['补拍起作用了。80 张照片里 76 张成功定位，关键转角的相机轨迹已经接上。', '还有 4 张没注册，但不在关键区域。现在的问题不再是“能不能生成”，而是这组相机关系够不够可信。'];
  }
  if (nodeId === 'bs-04-process' && has.has('capture-gap-debt')) {
    return ['白天没补的缺口晚上回来了。80 张照片里只有 61 张成功定位，叶片背面附近的相机轨迹直接断掉。', '现在你能看到那个决定的实际代价：不是扣一个抽象分数，而是这部分空间没有可靠的相机关系。'];
  }
  if (nodeId === 'bs-04a-represent' && has.has('failure-kept')) {
    return ['失败版本已经单独保存。现在不是选一个听起来厉害的技术，而是决定要不要让观众看见这个失败。', '你可以让孔洞和断裂留在画面里；也可以先做一个更容易进入的版本，再把失败留在记录中。'];
  }
  if (nodeId === 'bs-04a-represent' && has.has('failure-used-as-form')) {
    return ['你决定不把断裂伪装成“修好了”。接下来只需要决定：观众第一眼是看见断裂，还是先走进这个空间。', '两种做法都会留下这次失败；区别只在于你把它放在画面里，还是放在作品记录里。'];
  }
  if (nodeId === 'bs-05-public') {
    const capture = has.has('capture-relation-route') ? '蝴蝶的运动和空间被分开采集再重新组合' : has.has('capture-ethical-trace') ? '作品没有捕捉活体，而是留下寄主、出现时间和痕迹' : '样地空间成为作品的主要底层';
    const motion = has.has('motion-interactive-butterfly') ? '观众靠近时，“停留 / 逃离 / 聚集”会改变系统行为' : has.has('motion-physics') ? '扫描材料继续受风和碰撞影响' : '扫描空间通过程序化形变持续变化';
    const authorship = has.has('authorship-unresolved') ? '“为什么一定是蝴蝶”仍然被故意留在公开反馈里' : '来源、方法和数据边界被写进了作品记录';
    return ['临时版本终于开放。它没有把森林包装成一个“完整数字复制品”。', `${capture}；${motion}。`, `${authorship}。你现在能说清楚这件作品怎么做出来，也能说清哪些东西没有被放进去。`];
  }
  return fallback;
}
