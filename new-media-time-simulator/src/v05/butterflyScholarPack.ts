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

export type ButterflyWorldEffect = {
  unlockNodeIds?: string[];
  evidenceIds?: string[];
  methodIds?: string[];
  knowledgeIds?: string[];
  threadIds?: string[];
  archiveEntryIds?: string[];
  projectTags?: string[];
};

export const butterflyScholarIdentity = {
  title: '哥斯达黎加的蝴蝶学者',
  role: '艺术家 / 蝴蝶研究者',
  practice: '你长期拍摄蝴蝶与寄主植物，也做空间扫描、点云和程序化动画。你关心的不是“做一只数字蝴蝶”，而是一只蝴蝶为什么在这个时间、这个地点、这株植物附近出现。',
  priorWork: [
    '给城市边缘植物做过带时间戳的扫描记录',
    '把点云带进 Blender 做过缓慢的程序化形变',
    '保存过“没有出现”的观察：空样地、漏拍、失败重建和缺失标签'
  ],
  currentQuestion: '这次到底应该保存蝴蝶本身，还是它和环境发生关系的证据？'
};

export const butterflyScholarTraining: ButterflyTrainingStep[] = [
  {
    id: 'train-observe', title: '先观察，再决定扫什么',
    plain: '飞着的蝴蝶很难用普通摄影测量稳定重建。先记蝴蝶的照片、时间、行为和寄主植物；真正扫描植物和它所在的小片空间。',
    why: '这样数字模型和真实观察之间有关系，而不是单纯收集漂亮素材。',
    operation: '记录：蝴蝶 / 时间 / 地点 / 寄主植物 / 是否出现。',
    nodeIds: ['butterfly-observation', 'plant-specimen'], failureSignals: ['只剩蝴蝶照片', '只剩一个和观察无关的森林模型']
  },
  {
    id: 'train-capture', title: '摄影测量采集',
    plain: '围绕植物或小片空间移动拍照，让相邻照片反复看到同一块表面。',
    why: '软件需要照片之间有共同特征，才能推算拍摄位置。',
    operation: '边走边拍，不要站在原地只转相机。', reference: 'Metashape / COLMAP',
    nodeIds: ['capture-photo-sequence'], failureSignals: ['重叠太低', '视角太单一', '光照变化过大']
  },
  {
    id: 'train-check', title: '离场前检查',
    plain: '先看漏拍、模糊、反光和曝光突变。能现场补的，不要留给后期猜。',
    why: '回到工作室以后再发现漏拍，最便宜的修复机会已经过去了。',
    operation: '检查缩略图和覆盖，沿缺口补一小段。', nodeIds: ['capture-quality-check'], failureSignals: ['关键表面只有一个角度', '照片注册断裂']
  },
  {
    id: 'train-solve', title: '先求相机位置',
    plain: 'Metashape Align Photos / COLMAP SfM 都是在先回答：每张照片从哪里拍的？',
    why: '这一步错了，后面的点云和 Gaussian 会一起错。',
    operation: '看注册率、相机轨迹和稀疏点是不是像一个正常空间。', nodeIds: ['process-metashape-align', 'process-colmap-sfm'], failureSignals: ['大量照片未注册', '相机轨迹突然跳走']
  },
  {
    id: 'train-output', title: '再决定要什么结果',
    plain: '点云适合继续进 Blender 做程序化处理；Gaussian 适合快速连续地浏览空间外观。',
    why: '这是用途选择，不是技术等级。',
    operation: '先想你下一步要做动画、实时系统，还是自由视角预览。', nodeIds: ['process-dense-reconstruction', 'process-gaussian-splat', 'process-blender-procedural'], failureSignals: ['为了“更高级”盲目换技术']
  },
  {
    id: 'train-source', title: '把来源写清楚',
    plain: '蝴蝶是题材，不天然属于某个艺术家；但如果你直接借了具体形式、方法或作品结构，就应该明确写来源。',
    why: '“题材相同”和“具体表达高度相似”是两件事。',
    operation: '写下你真正参考的作品、方法和你改变了什么。', nodeIds: ['method-source-attribution'], failureSignals: ['因为怕被说抄袭而不敢碰题材', '明明直接引用却故意不写']
  }
];

export const butterflyScholarNarrativePack: NarrativePack = {
  id: 'narrative-butterfly-scholar-v3',
  title: '哥斯达黎加的蝴蝶学者',
  actors: [
    {
      id: 'player-butterfly-scholar', name: '你', publicRole: '艺术家 / 蝴蝶研究者',
      motives: ['把真实观察变成一件数字作品', '学会一套可复用的扫描流程', '搞清楚引用、数据和公开边界'], remembers: []
    },
    {
      id: 'field-lab', name: 'Bosque Field Lab', publicRole: '合作项目收件箱',
      motives: ['邀请艺术家把研究资料转成可体验内容', '保留样地长期观察的上下文'], remembers: []
    },
    {
      id: 'ines', name: 'Inés', publicRole: '合作艺术组织 / 项目协调',
      motives: ['协调研究站与艺术家合作', '保护研究数据的使用边界', '判断你是否尊重共同采集和署名', '在长期协作中形成私人关系'],
      remembers: ['你第一次如何介绍自己的实践', '你如何处理蝴蝶题材的争议', '你有没有把原始资料直接公开', '工作结束以后你是否仍然保持联系']
    },
    {
      id: 'rojas', name: 'Rojas', publicRole: '研究站技术员 / 野外采集',
      motives: ['保护样地', '让艺术采集不要破坏研究记录', '让你把技术错误和艺术选择分开'],
      remembers: ['你是否离场前检查', '你是否承认一次失败采集真的失败']
    },
    {
      id: 'peer-feed', name: '同行频道', publicRole: '艺术家群聊 / 公开讨论',
      motives: ['快速判断相似作品', '争论题材、风格、借鉴和抄袭的边界'], remembers: []
    }
  ],
  facts: [
    { id: 'fact-invite', subjectId: 'route', label: '研究站希望你把蝴蝶与植物观察资料做成一个可体验的数字版本。', state: 'verified', sourceIds: ['field-lab'] },
    { id: 'fact-butterfly-capture', subjectId: 'project', label: '飞行蝴蝶不适合直接作为普通摄影测量的主要 3D 对象。', state: 'unknown', sourceIds: [] },
    { id: 'fact-authorship', subjectId: 'ecology', label: '蝴蝶题材在艺术圈存在“视觉语言归谁”的争议；题材相同不等于表达相同。', state: 'unknown', sourceIds: [] },
    { id: 'fact-bad-solve', subjectId: 'project', label: '相机求解不可靠时，换点云或 Gaussian 都不会自动修好。', state: 'unknown', sourceIds: [] },
    { id: 'fact-data-rights', subjectId: 'route', label: '研究站允许艺术展示，但不希望原始定位和完整研究资料被无限复制。', state: 'unknown', sourceIds: [] },
    { id: 'fact-ines-network', subjectId: 'ines', label: 'Inés 同时参与合作组织的数据与署名审核。', state: 'unknown', sourceIds: [] }
  ],
  scenes: [
    { id: 'scene-studio', title: '合作邮件', location: '你的工作室', entryNodeId: 'bs-01-invite', actorIds: ['player-butterfly-scholar', 'field-lab'], tags: ['briefing'] },
    { id: 'scene-preflight', title: '出发前', location: '你的工作室', entryNodeId: 'bs-01b-self', actorIds: ['player-butterfly-scholar'], tags: ['identity'] },
    { id: 'scene-arrival', title: '研究站', location: '哥斯达黎加 · 山地研究站', entryNodeId: 'bs-02-arrival', actorIds: ['player-butterfly-scholar', 'ines'], tags: ['arrival', 'relationship'] },
    { id: 'scene-field', title: '样地 07', location: '云雾林样地', entryNodeId: 'bs-03-field', actorIds: ['player-butterfly-scholar', 'ines', 'rojas'], tags: ['capture'] },
    { id: 'scene-feed', title: '下午的消息', location: '研究站休息区', entryNodeId: 'bs-03c-reference', actorIds: ['player-butterfly-scholar', 'peer-feed', 'ines'], tags: ['ecology', 'authorship'] },
    { id: 'scene-check', title: '离场前', location: '样地 07', entryNodeId: 'bs-03b-audit', actorIds: ['player-butterfly-scholar', 'rojas'], tags: ['qte', 'capture'] },
    { id: 'scene-night', title: '第一次重建', location: '研究站临时工作室', entryNodeId: 'bs-04-process', actorIds: ['player-butterfly-scholar', 'rojas', 'ines'], tags: ['processing'] },
    { id: 'scene-making', title: '把扫描变成作品', location: '研究站临时工作室', entryNodeId: 'bs-04a-represent', actorIds: ['player-butterfly-scholar'], tags: ['making'] },
    { id: 'scene-rights', title: '公开之前', location: '研究站门廊', entryNodeId: 'bs-04b-reveal', actorIds: ['player-butterfly-scholar', 'ines'], tags: ['relationship', 'data-rights'] },
    { id: 'scene-public', title: '第一次公开测试', location: '研究站公共空间', entryNodeId: 'bs-05-public', actorIds: ['player-butterfly-scholar', 'ines'], tags: ['public'] },
    { id: 'scene-after', title: '回到工作室', location: '你的工作室', entryNodeId: 'bs-06-after', actorIds: ['player-butterfly-scholar'], tags: ['archive'] }
  ],
  nodes: [
    {
      id: 'bs-01-invite', sceneId: 'scene-studio', speakerId: 'field-lab', channel: 'message',
      text: [
        '你收到一封合作邮件。研究站正在整理一批蝴蝶、寄主植物和样地观察资料，想邀请一位做空间影像的艺术家，把其中一部分做成可以被观看和浏览的数字作品。',
        '他们提供住宿、样地进入权限和一名采集协助。作品形式没有定，但原始研究资料不能默认全部公开。'
      ],
      choices: [
        { id: 'bs-go', label: '接下合作，先要一份资料清单', subtext: '先知道现场有什么，再决定带什么设备。', effects: { setFlags: ['accepted-field-trip', 'asked-material-list'] }, nextNodeId: 'bs-01b-self' },
        { id: 'bs-go-with-question', label: '接下合作，同时确认数据边界', subtext: '问清楚哪些资料可以公开、哪些只能用于制作。', effects: { setFlags: ['accepted-field-trip', 'asked-data-rights'], factUpdates: [{ factId: 'fact-data-rights', state: 'observed', sourceId: 'field-lab' }] }, nextNodeId: 'bs-01b-self' }
      ]
    },
    {
      id: 'bs-01b-self', sceneId: 'scene-preflight', speakerId: 'player-butterfly-scholar', channel: 'record',
      text: [
        '你给项目表填职业：艺术家 / 蝴蝶研究者。听起来像个外号，但你确实长期拍蝴蝶，也一直在做植物、空间扫描和点云动画。',
        '这次你不准备“扫描一只蝴蝶”。你想试的是：把蝴蝶什么时候出现、停在哪株植物、周围空间长什么样，一起保存下来。'
      ],
      choices: [
        { id: 'bs-preflight-camera', label: '带相机 + 轻量三脚架', subtext: '重点做摄影测量和观察记录。', effects: { setFlags: ['kit-camera'] }, nextNodeId: 'bs-02-arrival' },
        { id: 'bs-preflight-depth', label: '再带一台深度设备', subtext: '环境先用 LiDAR 快速取尺度，重点对象再拍照片。', effects: { setFlags: ['kit-camera', 'kit-depth'] }, nextNodeId: 'bs-02-arrival' }
      ]
    },
    {
      id: 'bs-02-arrival', sceneId: 'scene-arrival', speakerId: 'ines', channel: 'dialogue',
      text: [
        '“Inés。合作组织这边我负责现场、翻译和资料交接。”她先做了自我介绍，然后问你：“所以你真的是那个 butterfly scholar？”',
        '你解释了一遍：蝴蝶是观察对象，扫描的通常是植物和空间。她听完以后说：“好，这至少比把蝴蝶做成发光粒子靠谱。”'
      ],
      choices: [
        { id: 'bs-arrival-protocol', label: '先问样地怎么进入', subtext: '哪些地方能走、什么时候适合观察、哪些东西不能碰。', effects: { setFlags: ['asked-field-protocol'], trustDelta: { ines: 1 } }, nextNodeId: 'bs-03-field' },
        { id: 'bs-arrival-work', label: '先给她看以前的点云动画', subtext: '让她知道这次不是来做自然纪录片。', effects: { setFlags: ['showed-prior-work'], trustDelta: { ines: 1 }, memories: [{ actorId: 'ines', about: 'first-meeting', value: '你先用作品解释自己的方法', weight: 2 }] }, nextNodeId: 'bs-03-field' }
      ]
    },
    {
      id: 'bs-03-field', sceneId: 'scene-field', speakerId: 'rojas', channel: 'scene',
      text: [
        '上午真的有蝴蝶出现，但它们不停移动。Rojas 直接说：“别追着它扫。记照片、时间和它停过的植物。要做 3D，就扫植物和这段空间。”',
        '你第一次把这件事拆清楚：蝴蝶是观察记录；寄主植物和样地才是主要的空间采集对象。'
      ],
      choices: [
        { id: 'bs-capture-plant', label: '跟着一只蝴蝶，锁定它停留的寄主植物', subtext: '记录蝴蝶行为，再围绕植物拍一圈。', effects: { setFlags: ['capture-plant-route'], factUpdates: [{ factId: 'fact-butterfly-capture', state: 'verified', sourceId: 'rojas' }] }, nextNodeId: 'bs-03c-reference' },
        { id: 'bs-capture-path', label: '记录一小段飞行路径和周围空间', subtext: '蝴蝶只做观察点，空间用照片 + 深度采集。', effects: { setFlags: ['capture-space-route'], factUpdates: [{ factId: 'fact-butterfly-capture', state: 'verified', sourceId: 'rojas' }] }, nextNodeId: 'bs-03c-reference' },
        { id: 'bs-capture-absence', label: '今天这一小时没出现：照样记录', subtext: '没有出现也是观察结果，之后和季节、天气一起比较。', effects: { setFlags: ['capture-absence-route'], factUpdates: [{ factId: 'fact-butterfly-capture', state: 'verified', sourceId: 'rojas' }] }, nextNodeId: 'bs-03c-reference' }
      ]
    },
    {
      id: 'bs-03c-reference', sceneId: 'scene-feed', speakerId: 'peer-feed', channel: 'message',
      text: [
        '午休时手机恢复信号。群里正在吵一件很熟悉的事：某位艺术家长期做蝴蝶系列，后来只要别人也用了蝴蝶，就有人在评论区说“这不是抄他的吗？”',
        '问题很快从“谁先用了蝴蝶”变成了更具体的比较：构图像不像、技术路线像不像、有没有直接引用某件作品、来源有没有写。'
      ],
      choices: [
        { id: 'bs-source-note', label: '建一条来源记录', subtext: '继续做蝴蝶，但把参考作品、方法和自己的材料来源写清楚。', effects: { setFlags: ['source-note'], factUpdates: [{ factId: 'fact-authorship', state: 'verified', sourceId: 'peer-feed' }] }, nextNodeId: 'bs-03b-audit' },
        { id: 'bs-avoid-symbol', label: '不把“蝴蝶形象”当主视觉', subtext: '作品仍然研究蝴蝶，但重点放在关系、时间和扫描空间。', effects: { setFlags: ['avoid-butterfly-icon'], factUpdates: [{ factId: 'fact-authorship', state: 'observed', sourceId: 'peer-feed' }] }, nextNodeId: 'bs-03b-audit' },
        { id: 'bs-explicit-remix', label: '如果真要引用，就明确写是引用', subtext: '把引用关系直接放进作品说明，不靠观众猜。', effects: { setFlags: ['explicit-attribution'], factUpdates: [{ factId: 'fact-authorship', state: 'verified', sourceId: 'peer-feed' }] }, nextNodeId: 'bs-03b-audit' }
      ]
    },
    {
      id: 'bs-03b-audit', sceneId: 'scene-check', speakerId: 'rojas', channel: 'scene',
      text: [
        '准备离场，你快速翻了一遍照片。叶片背面覆盖明显不足，小径转角只有一个方向，最后十几张还因为云层变化突然变亮。',
        '这不是抽象的“质量下降”。如果现在不补，晚上很可能会有一段照片对不上。'
      ],
      choices: [
        { id: 'bs-audit-recapture', label: '现在补拍 10 分钟', subtext: '沿着缺口重新走一小段，尽量保持相近曝光。', effects: { setFlags: ['field-recapture'], memories: [{ actorId: 'rojas', about: 'capture-discipline', value: '你离场前发现缺口并补拍', weight: 3 }] }, nextNodeId: 'bs-04-process' },
        { id: 'bs-audit-leave', label: '不补，回去看看后期到底会坏成什么样', subtext: '不是“省时间没有代价”；这会变成下一场的真实技术债。', effects: { setFlags: ['capture-gap-debt'], memories: [{ actorId: 'rojas', about: 'capture-discipline', value: '你明知覆盖不足仍然离开现场', weight: 2 }] }, nextNodeId: 'bs-04-process' }
      ]
    },
    {
      id: 'bs-04-process', sceneId: 'scene-night', speakerId: 'rojas', channel: 'scene',
      text: [
        '晚上跑第一次相机求解。80 张照片里只有 61 张注册成功，相机轨迹在叶片背面附近直接断成两段。',
        '先别碰“稠密点云”和“Gaussian”。现在只问一件事：软件到底有没有搞清楚这些照片分别是从哪里拍的？'
      ],
      choices: [
        { id: 'bs-align-diagnose', label: '先看注册失败和相机轨迹', subtext: '检查未注册照片、匹配点和轨迹；能修匹配就修，不能就接受这次采集有缺口。', effects: { setFlags: ['diagnosed-camera-solve'], factUpdates: [{ factId: 'fact-bad-solve', state: 'verified', sourceId: 'rojas' }] }, nextNodeId: 'bs-04a-represent' },
        { id: 'bs-align-force-dense', label: '直接跑点云，看看错在哪里', subtext: '可以当一次实验，但结果会继承错误的相机关系。', effects: { setFlags: ['forced-dense-on-bad-solve'], factUpdates: [{ factId: 'fact-bad-solve', state: 'observed', sourceId: 'reconstruction' }] }, nextNodeId: 'bs-04a-represent' },
        { id: 'bs-align-switch-gaussian', label: '直接换 Gaussian', subtext: '你会很快发现：换表示方式不能替你修相机位置。', effects: { setFlags: ['switched-representation-before-fix'], factUpdates: [{ factId: 'fact-bad-solve', state: 'verified', sourceId: 'failed-splat' }] }, nextNodeId: 'bs-04a-represent' }
      ]
    },
    {
      id: 'bs-04a-represent', sceneId: 'scene-making', speakerId: 'player-butterfly-scholar', channel: 'record',
      text: [
        '修到相机关系基本可信以后，你终于可以问“我要拿它干什么”。',
        '如果想继续做形变、噪声和生成动画，点云进 Blender 很顺手；如果想先让人自由浏览这段空间，Gaussian 更直接。'
      ],
      choices: [
        { id: 'bs-represent-pointcloud', label: '点云 → Blender', subtext: '保留点的结构，再用 Noise / Geometry Nodes 做缓慢形变。', effects: { setFlags: ['representation-pointcloud', 'route-blender'] }, nextNodeId: 'bs-04e-blender' },
        { id: 'bs-represent-gaussian', label: 'Gaussian → 网页预览', subtext: '先把空间外观做成可以自由查看的版本。', effects: { setFlags: ['representation-gaussian', 'route-gaussian'] }, nextNodeId: 'bs-04c-browser' }
      ]
    },
    {
      id: 'bs-04e-blender', sceneId: 'scene-making', speakerId: 'player-butterfly-scholar', channel: 'record',
      text: [
        '点云进 Blender 以后，你没有先做“漂亮动画”，而是给运动找一个理由。',
        'Noise 可以只是噪声，也可以被你解释成风、时间、观察次数，或者一段记忆慢慢失去精确位置。'
      ],
      choices: [
        { id: 'bs-blender-wind', label: '让风决定形变', subtext: '运动像植物被风持续扰动，但比真实风更慢。', effects: { setFlags: ['motion-wind'] }, nextNodeId: 'bs-04d-gap' },
        { id: 'bs-blender-memory', label: '让观察时间决定形变', subtext: '越久以前的记录，位置越不稳定。', effects: { setFlags: ['motion-memory'] }, nextNodeId: 'bs-04d-gap' }
      ]
    },
    {
      id: 'bs-04c-browser', sceneId: 'scene-making', speakerId: 'player-butterfly-scholar', channel: 'record',
      text: [
        'Gaussian 第一版能在浏览器里转起来，但边缘有明显浮点，样地外面也有一圈不需要的背景。',
        '浏览器编辑器在这里很实用：先裁掉无关区域、删明显浮点、定几个相机位置。复杂动画以后再交给别的工具。'
      ],
      choices: [
        { id: 'bs-browser-supersplat', label: '先做一次轻量清理', subtext: '裁剪、删浮点、检查几个关键视角，然后再决定要不要发布。', effects: { setFlags: ['browser-cleanup'] }, nextNodeId: 'bs-04d-gap' },
        { id: 'bs-browser-local', label: '先保留本地版本', subtext: '这次只把浏览器当预览，不急着上传原始场景。', effects: { setFlags: ['local-preview-only'] }, nextNodeId: 'bs-04d-gap' }
      ]
    },
    {
      id: 'bs-04d-gap', sceneId: 'scene-making', speakerId: 'ines', channel: 'dialogue',
      text: [
        '清理到最后还剩一块很明显的缺口：正好是那片一直被风吹动的叶子。',
        'Inés 看了一会儿：“这个洞如果不是故意做的，就先承认它是扫描失败。然后你再决定，失败能不能留在作品里。”'
      ],
      choices: [
        { id: 'bs-preserve-gaps', label: '保留，但写清楚它为什么在', subtext: '不是把技术错误硬说成艺术；先承认失败，再把它变成时间和风的证据。', effects: { setFlags: ['method-preserve-gap'], trustDelta: { ines: 1 } }, nextNodeId: 'bs-04b-reveal' },
        { id: 'bs-repair-gaps', label: '这次先修到稳定', subtext: '作品不需要每个错误都留下。先做一个可靠版本。', effects: { setFlags: ['method-repair-first'] }, nextNodeId: 'bs-04b-reveal' }
      ]
    },
    {
      id: 'bs-04b-reveal', sceneId: 'scene-rights', speakerId: 'ines', channel: 'dialogue',
      text: [
        '公开测试前，Inés 才把另一项工作说清楚：她同时在合作组织里负责数据和署名审核。不是秘密身份，但她前几天一直把这件事留在工作之外。',
        '她给你划了很明确的线：作品可以公开，原始定位、完整研究表和部分植物资料不能直接打包上传。你自己的扫描版本可以发布，但需要写清研究站和协作者。'
      ],
      choices: [
        { id: 'bs-reveal-accept', label: '按这个边界做公开版本', subtext: '作品照常完成，原始研究资料留在研究站。', effects: { setFlags: ['data-boundary-agreed'], factUpdates: [{ factId: 'fact-data-rights', state: 'verified', sourceId: 'ines' }, { factId: 'fact-ines-network', state: 'revealed', sourceId: 'ines' }], trustDelta: { ines: 2 }, memories: [{ actorId: 'ines', about: 'data-rights', value: '你把公开版本和原始研究资料分开', weight: 4 }] }, nextNodeId: 'bs-05-public' },
        { id: 'bs-reveal-talk', label: '先把署名和私人记录逐条对一遍', subtext: '把合作写得更清楚，也顺便把你们之间没说完的话说完。', effects: { setFlags: ['data-boundary-agreed', 'relationship-open'], factUpdates: [{ factId: 'fact-data-rights', state: 'verified', sourceId: 'ines' }, { factId: 'fact-ines-network', state: 'revealed', sourceId: 'ines' }], trustDelta: { ines: 3 }, memories: [{ actorId: 'ines', about: 'late-conversation', value: '公开前你们一起把署名、资料和私人记录逐条确认', weight: 4 }] }, nextNodeId: 'bs-05-public' }
      ]
    },
    {
      id: 'bs-05-public', sceneId: 'scene-public', speakerId: 'player-butterfly-scholar', channel: 'record',
      text: [
        '第一次公开测试终于跑完。观众能看到真实蝴蝶的观察记录、寄主植物的扫描，以及你后来做的空间版本；看不到研究站的完整原始数据。',
        '这时候作品终于不只是“我扫描了哥斯达黎加”。它有蝴蝶、有具体采集方法，也有你为什么选择这些资料、为什么没有公开另外一些资料。'
      ],
      choices: [
        { id: 'bs-public-derived', label: '发布作品版本，不发布完整原始数据', subtext: '附研究站、协作者和参考来源。', effects: { setFlags: ['public-derived-only'] }, nextNodeId: 'bs-06-after' },
        { id: 'bs-public-sample', label: '额外开放一份低精度示例数据', subtext: '让别人能理解流程，但不暴露完整样地资料。', effects: { setFlags: ['public-small-sample'] }, nextNodeId: 'bs-06-after' }
      ]
    },
    {
      id: 'bs-06-after', sceneId: 'scene-after', speakerId: 'player-butterfly-scholar', channel: 'record',
      text: [
        '项目终于做完了。你现在至少搞明白三件事：飞着的蝴蝶不需要硬扫成 3D；相机位置没解好，换技术也救不了；扫描完成以后，点云、Gaussian、Blender 和网页只是不同的下一步。',
        '还有一件以前总说不清的事：用了蝴蝶不等于自动抄谁。真正需要写清楚的是你到底借了什么、材料从哪来、谁和你一起完成了它。'
      ],
      choices: [
        { id: 'bs-after-archive', label: '归档这次项目', subtext: '保存 Blueprint、失败版本、来源说明和人物记录。', effects: { setFlags: ['butterfly-route-complete', 'archive-complete'] }, nextNodeId: 'bs-end' },
        { id: 'bs-after-post', label: '先写一条公开创作记录，再归档', subtext: '不写宣传话术，只写这次到底学会了什么、哪里失败了。', effects: { setFlags: ['butterfly-route-complete', 'wrote-public-note'] }, nextNodeId: 'bs-end' }
      ]
    },
    {
      id: 'bs-end', sceneId: 'scene-after', speakerId: 'player-butterfly-scholar', channel: 'record',
      text: ['SPECIAL CHAPTER COMPLETE / 哥斯达黎加的蝴蝶学者'],
      choices: []
    }
  ]
};

export const butterflyWorldEffectsByChoice: Record<string, ButterflyWorldEffect> = {
  'bs-go': { evidenceIds: ['ev-collaboration-brief'], projectTags: ['field-trip', 'butterfly-study'] },
  'bs-go-with-question': { evidenceIds: ['ev-collaboration-brief', 'ev-data-question'], projectTags: ['field-trip', 'butterfly-study'] },
  'bs-preflight-camera': { unlockNodeIds: ['capture-photo-sequence'], knowledgeIds: ['know-butterfly-capture'] },
  'bs-preflight-depth': { unlockNodeIds: ['capture-photo-sequence', 'capture-lidar-pass'], knowledgeIds: ['know-butterfly-capture'] },
  'bs-arrival-protocol': { evidenceIds: ['ev-field-protocol'] },
  'bs-arrival-work': { evidenceIds: ['ev-prior-pointcloud-work'] },
  'bs-capture-plant': { unlockNodeIds: ['butterfly-observation', 'plant-specimen', 'capture-photo-sequence'], methodIds: ['method-field-metadata'], evidenceIds: ['ev-butterfly-host-plant'] },
  'bs-capture-path': { unlockNodeIds: ['butterfly-observation', 'capture-photo-sequence', 'capture-lidar-pass'], methodIds: ['method-spatial-capture-route'], evidenceIds: ['ev-butterfly-path'] },
  'bs-capture-absence': { unlockNodeIds: ['butterfly-observation'], methodIds: ['method-record-absence'], evidenceIds: ['ev-no-butterfly-hour'] },
  'bs-source-note': { unlockNodeIds: ['method-source-attribution'], methodIds: ['method-source-attribution'], knowledgeIds: ['know-butterfly-authorship'] },
  'bs-avoid-symbol': { knowledgeIds: ['know-butterfly-authorship'], projectTags: ['relation-not-icon'] },
  'bs-explicit-remix': { unlockNodeIds: ['method-source-attribution'], methodIds: ['method-source-attribution'], knowledgeIds: ['know-butterfly-authorship'], projectTags: ['explicit-reference'] },
  'bs-audit-recapture': { unlockNodeIds: ['capture-quality-check'], methodIds: ['method-check-before-leave'], evidenceIds: ['ev-field-recapture'], knowledgeIds: ['know-overlap'] },
  'bs-audit-leave': { threadIds: ['thread-capture-gap-debt'], evidenceIds: ['ev-known-coverage-gap'], knowledgeIds: ['know-overlap'] },
  'bs-align-diagnose': { unlockNodeIds: ['process-metashape-align', 'process-colmap-sfm'], methodIds: ['method-diagnose-before-reconstruct'], evidenceIds: ['ev-camera-registration-check'], knowledgeIds: ['know-camera-solve'] },
  'bs-align-force-dense': { unlockNodeIds: ['process-dense-reconstruction'], threadIds: ['thread-unreliable-camera-solve'], evidenceIds: ['ev-dense-on-bad-solve'], knowledgeIds: ['know-camera-solve'] },
  'bs-align-switch-gaussian': { unlockNodeIds: ['process-gaussian-splat'], threadIds: ['thread-camera-solve-unresolved'], knowledgeIds: ['know-camera-solve'] },
  'bs-represent-pointcloud': { unlockNodeIds: ['process-dense-reconstruction', 'process-blender-procedural'], methodIds: ['method-procedural-motion'], knowledgeIds: ['know-pointcloud-gaussian', 'know-blender-motion'], projectTags: ['point-cloud', 'blender'] },
  'bs-represent-gaussian': { unlockNodeIds: ['process-gaussian-splat', 'process-point-clean'], knowledgeIds: ['know-pointcloud-gaussian', 'know-supersplat'], projectTags: ['gaussian-splatting', 'web-preview'] },
  'bs-blender-wind': { methodIds: ['method-procedural-motion'], evidenceIds: ['ev-blender-wind-test'] },
  'bs-blender-memory': { methodIds: ['method-procedural-motion'], evidenceIds: ['ev-blender-memory-test'] },
  'bs-browser-supersplat': { unlockNodeIds: ['process-point-clean'], methodIds: ['method-browser-splat-cleanup'], evidenceIds: ['ev-web-preview'] },
  'bs-browser-local': { methodIds: ['method-local-export-pipeline'], evidenceIds: ['ev-local-preview'] },
  'bs-preserve-gaps': { unlockNodeIds: ['method-preserve-gap'], methodIds: ['method-preserve-gap'], evidenceIds: ['ev-scan-gap'] },
  'bs-repair-gaps': { methodIds: ['method-reconstruct-before-interpret'] },
  'bs-reveal-accept': { threadIds: ['thread-data-rights'], archiveEntryIds: ['archive-data-boundary'], projectTags: ['data-rights'] },
  'bs-reveal-talk': { threadIds: ['thread-data-rights', 'thread-ines-relationship'], archiveEntryIds: ['archive-data-boundary'], projectTags: ['data-rights'] },
  'bs-public-derived': { unlockNodeIds: ['output-web-scene'], evidenceIds: ['ev-public-version'], archiveEntryIds: ['archive-public-boundary'] },
  'bs-public-sample': { unlockNodeIds: ['output-web-scene'], evidenceIds: ['ev-public-version', 'ev-low-res-sample'], archiveEntryIds: ['archive-public-boundary'] },
  'bs-after-archive': { archiveEntryIds: ['archive-butterfly-route'], methodIds: ['method-selective-preservation'], evidenceIds: ['ev-final-reflection'] },
  'bs-after-post': { archiveEntryIds: ['archive-butterfly-route', 'archive-public-note'], methodIds: ['method-selective-preservation'], evidenceIds: ['ev-final-reflection', 'ev-public-process-note'] }
};
