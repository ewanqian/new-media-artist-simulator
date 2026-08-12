export type LearningEpisodeLayer = 'knowledge' | 'tool' | 'interface' | 'survival' | 'special';
export type LearningEpisodeStatus = 'playable' | 'prototype' | 'planned';

export type LearningEpisode = {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  status: LearningEpisodeStatus;
  format: 'onboarding' | 'residency' | 'workshop' | 'historical-simulation' | 'field-trip';
  layers: LearningEpisodeLayer[];
  setup: string;
  playerProblem: string;
  playableLoop: string[];
  unlocks: {
    knowledgeIds: string[];
    methodIds: string[];
    nodeIds: string[];
    assetKinds: string[];
    mementoKinds: string[];
  };
  careerReuse: string[];
  researchBasis: string[];
};

/**
 * Learning Episodes do not create a second progression system.
 * They are content packs that feed the existing Knowledge / Node / Asset /
 * Memento / Method / SpecialCarryover pipeline.
 *
 * Historical figures are research sources, not quest-giver NPCs. Episodes
 * fictionalize the immediate characters and place the player inside a
 * comparable technical/social problem so the knowledge is learned by doing.
 */
export const learningEpisodes: LearningEpisode[] = [
  {
    id: 'ep00-first-workbench',
    code: 'EP00',
    title: '建立你的工作台',
    subtitle: '第一次把现实变成可以继续加工的东西',
    status: 'prototype',
    format: 'onboarding',
    layers: ['knowledge', 'tool'],
    setup: '你没有职业等级，也没有完整作品。桌面上只有电脑、硬盘和一次记录现实的机会。',
    playerProblem: '从照片、空间采集或声音中选一个入口，完成第一次 INPUT → PROCESS → OUTPUT。',
    playableLoop: ['选择观察方式', '生成第一个 Asset', '连接最小三节点工作图', '形成第一条方法', '写入创作记录 001'],
    unlocks: {
      knowledgeIds: ['knowledge-sequence', 'knowledge-space-as-data', 'knowledge-sound-space'],
      methodIds: ['method-observe-frame', 'method-spatial-capture', 'method-listen-layer'],
      nodeIds: ['ep00-photo-source', 'ep00-scan-source', 'ep00-audio-source'],
      assetKinds: ['photo-set', 'spatial-capture', 'audio-set'],
      mementoKinds: ['first-note']
    },
    careerReuse: ['后续所有项目第一次引用 Asset Library', '工作图不再从空白概念开始', '第一次 Archive 记录成为长期生涯起点'],
    researchBasis: ['继承旧版 skills.js 的知识层 / 技术层结构', '继承旧版工作坊系统，但移除技能点与名望奖励']
  },
  {
    id: 'special-01-costa-rica',
    code: 'SPECIAL 01',
    title: '哥斯达黎加',
    subtitle: '驻地、扫描、数据伦理与作者性',
    status: 'playable',
    format: 'residency',
    layers: ['knowledge', 'tool', 'interface'],
    setup: '你接受一次海外驻地合作，从行程、样地调查和扫描开始，最后把采集数据转成作品。',
    playerProblem: '什么应该被采集、怎样确认数据可信、扫描之后怎样继续创作，以及素材和方法到底属于谁。',
    playableLoop: ['确认合作与行程', '现场调查', '摄影测量 / 扫描', '离场前检查', '重建与失败处理', '作品化', '公开与归档'],
    unlocks: {
      knowledgeIds: ['photogrammetry-overlap', 'camera-solve', 'pointcloud-vs-gaussian', 'authorship-borrowing'],
      methodIds: ['method-leave-site-check', 'method-spatial-capture'],
      nodeIds: ['field-capture-session', 'photogrammetry-capture', 'metashape-camera-solve', 'gaussian-splatting'],
      assetKinds: ['photo-set', 'camera-solve-report', 'point-cloud', 'gaussian-scene', 'failed-reconstruction'],
      mementoKinds: ['flight-ticket', 'residency-pass', 'field-note', 'failure-screenshot']
    },
    careerReuse: ['现场测试时复用离场前检查', '空间项目直接调用扫描方法', '作者性与数据许可在机构项目重新出现'],
    researchBasis: ['摄影测量 / Gaussian 工作流研究', '匿名化的新媒体艺术作者性与借鉴争议']
  },
  {
    id: 'learning-01-two-machines-talk',
    code: 'LEARNING 01',
    title: '两台机器第一次说同一种语言',
    subtitle: '协议不是设备，它是一种合作方式',
    status: 'planned',
    format: 'historical-simulation',
    layers: ['knowledge', 'tool', 'interface'],
    setup: '两个互相竞争的电子乐器团队把设备带到同一张桌子上。你的任务不是做新乐器，而是让它们第一次真正互相理解。',
    playerProblem: '不同设备怎样用同一套消息描述“按下、松开、力度、时间和控制”？',
    playableLoop: ['识别设备私有接口', '定义最小消息', '连接两台设备', '处理错误通道', '加入 Clock / Control', '保存一份可复用协议图'],
    unlocks: {
      knowledgeIds: ['knowledge-midi-message', 'knowledge-protocol-thinking', 'knowledge-clock-sync'],
      methodIds: ['method-protocol-first', 'skill-signal-direction'],
      nodeIds: ['midi-note', 'midi-cc', 'midi-clock', 'controller-input', 'synth-output'],
      assetKinds: ['protocol-map', 'midi-capture'],
      mementoKinds: ['five-pin-cable', 'annotated-spec-page']
    },
    careerReuse: ['VJ / 演出项目可直接调用 MIDI 控制', '多设备项目增加协议优先的解决方式', '解锁 OSC / MIDI / 控制器的共同接口逻辑'],
    researchBasis: ['MIDI Association: MIDI 1981–1983 history', 'Ikutaro Kakehashi / Dave Smith collaboration as historical source']
  },
  {
    id: 'learning-02-fuzzy-object',
    code: 'LEARNING 02',
    title: '一团火不是一张表面',
    subtitle: '粒子、寿命、随机与运动规则',
    status: 'planned',
    format: 'historical-simulation',
    layers: ['knowledge', 'tool'],
    setup: '一个图形实验室需要做出火、烟、云这种不断变化的东西。传统“画一个表面”的方法开始失效。',
    playerProblem: '如果对象没有稳定边界，应该怎样用大量短命的小元素描述它？',
    playableLoop: ['生成粒子', '设置初速度', '加入随机', '设置生命周期', '施加力', '观察群体形态', '把参数保存成方法'],
    unlocks: {
      knowledgeIds: ['knowledge-particle-system', 'knowledge-stochastic-motion'],
      methodIds: ['method-particle-rule', 'skill-node-forging'],
      nodeIds: ['particle-emitter', 'particle-velocity', 'particle-lifetime', 'force-field', 'particle-render'],
      assetKinds: ['particle-preset', 'motion-study'],
      mementoKinds: ['render-test-frame']
    },
    careerReuse: ['生成视觉项目直接获得粒子工作图', '扫描数据可转换为粒子源', '音画项目可把音频映射到粒子参数'],
    researchBasis: ['William T. Reeves, Particle Systems—A Technique for Modeling a Class of Fuzzy Objects, 1983']
  },
  {
    id: 'learning-03-language-for-images',
    code: 'LEARNING 03',
    title: '给图像写一套规则',
    subtitle: '创意编程不是“会代码”，而是能把视觉规则写出来',
    status: 'planned',
    format: 'workshop',
    layers: ['knowledge', 'tool'],
    setup: '一间学校的晚间工作室正在测试一种让艺术家更容易写图形程序的环境。你只有几个小时做出第一张会变化的图。',
    playerProblem: '怎样把坐标、循环、随机、鼠标输入和时间变成视觉行为？',
    playableLoop: ['画一个形状', '让参数变化', '加入循环', '加入随机', '加入输入', '保存为可复用生成规则'],
    unlocks: {
      knowledgeIds: ['knowledge-creative-coding-loop', 'knowledge-generative-rule'],
      methodIds: ['method-code-as-sketch'],
      nodeIds: ['draw-loop', 'random-source', 'mouse-input', 'time-input', 'generative-output'],
      assetKinds: ['code-sketch', 'generative-preset'],
      mementoKinds: ['first-sketch-print']
    },
    careerReuse: ['生成视觉任务可调用规则节点', '网页作品解锁实时参数', '后续粒子 / 数据可视化不再要求从语法开始学'],
    researchBasis: ['Processing started in 2001 by Ben Fry and Casey Reas', 'Design By Numbers / Aesthetics and Computation lineage']
  },
  {
    id: 'learning-04-body-is-not-a-button',
    code: 'LEARNING 04',
    title: '身体不是按钮',
    subtitle: '肌电、传感器与音画反馈',
    status: 'planned',
    format: 'workshop',
    layers: ['knowledge', 'tool', 'interface'],
    setup: '一次小型表演实验里，普通控制器被拿走。你只能从身体本身获得信号。',
    playerProblem: '肌肉、电信号、动作或呼吸怎样变成稳定又有表现力的控制数据？',
    playableLoop: ['读取生理信号', '校准基线', '过滤噪声', '归一化', '映射到声音 / 图像', '让输出反过来影响表演者'],
    unlocks: {
      knowledgeIds: ['knowledge-biosignal', 'knowledge-mapping', 'knowledge-feedback-body-machine'],
      methodIds: ['method-signal-normalize', 'skill-signal-direction'],
      nodeIds: ['emg-input', 'signal-filter', 'normalize', 'mapping', 'synth-output', 'visual-output'],
      assetKinds: ['biosignal-recording', 'mapping-preset'],
      mementoKinds: ['sensor-tape', 'calibration-note']
    },
    careerReuse: ['互动装置解锁身体输入', '音画同源任务可复用 Mapping', '传感器项目增加校准 / 过滤故障'],
    researchBasis: ['Daito Manabe early body-machine feedback research as contemporary lineage', 'physical computing / audiovisual workshop patterns']
  },
  {
    id: 'learning-05-feedback-room',
    code: 'LEARNING 05',
    title: '让系统自己回答',
    subtitle: '控制论、反馈与随机系统',
    status: 'planned',
    format: 'historical-simulation',
    layers: ['knowledge', 'tool'],
    setup: '一个艺术与技术展览的准备现场里，工程师、艺术家、诗人和作曲家都在讨论“系统能不能自己变化”。',
    playerProblem: '输入影响输出以后，怎样让输出再次进入系统，并且不马上失控？',
    playableLoop: ['建立输入', '写规则', '产生输出', '把结果反馈回来', '设置阈值 / 延迟', '观察稳定、振荡与失控'],
    unlocks: {
      knowledgeIds: ['knowledge-feedback', 'knowledge-cybernetic-system', 'knowledge-random-system'],
      methodIds: ['method-feedback-loop'],
      nodeIds: ['feedback-loop', 'delay', 'threshold', 'random-source', 'sensor-input', 'actuator-output'],
      assetKinds: ['feedback-diagram', 'system-behavior-log'],
      mementoKinds: ['exhibition-program-fragment']
    },
    careerReuse: ['互动装置获得反馈结构', '实时视觉可制造延迟 / 累积 / 自激', '系统失控可以成为设计问题而非单纯 bug'],
    researchBasis: ['ICA Cybernetic Serendipity, 1968']
  },
  {
    id: 'learning-06-browser-is-a-place',
    code: 'LEARNING 06',
    title: '浏览器也是一个场地',
    subtitle: '网络艺术、链接、延迟和保存环境',
    status: 'planned',
    format: 'field-trip',
    layers: ['knowledge', 'tool', 'interface', 'survival'],
    setup: '你进入一个早期网络艺术社区。作品没有箱子、没有固定展墙，甚至不一定有一个可以长期保存的“文件”。',
    playerProblem: '当作品依赖服务器、浏览器、链接和在线行为时，到底什么才是作品本体？',
    playableLoop: ['发布一个网页行为', '链接另一台机器', '体验延迟 / 断链', '决定 clone 还是 link', '保存运行环境', '写入档案关系'],
    unlocks: {
      knowledgeIds: ['knowledge-net-art', 'knowledge-software-environment', 'knowledge-linked-archive'],
      methodIds: ['method-network-as-site', 'skill-archive-salvage'],
      nodeIds: ['http-request', 'websocket', 'browser-output', 'remote-source', 'archive-snapshot'],
      assetKinds: ['web-project', 'environment-snapshot'],
      mementoKinds: ['dead-link', 'mailing-list-printout']
    },
    careerReuse: ['线上作品进入主线项目池', '网络故障成为真实现场变量', 'Archive 能保存运行环境而不只保存截图'],
    researchBasis: ['Rhizome ArtBase / Net Art Anthology preservation model']
  },
  {
    id: 'learning-07-white-wall-system',
    code: 'FIELD STUDY 01',
    title: '白墙后面到底有什么',
    subtitle: '画廊不是一个房间，而是一套角色、合同和流通关系',
    status: 'planned',
    format: 'field-trip',
    layers: ['knowledge', 'interface', 'survival'],
    setup: '你带着一个还不成熟的作品进入画廊筹备现场。第一次发现作品之外还有展签、版数、安装、保险、销售、借展和谁来承担风险。',
    playerProblem: '同一件作品进入机构以后，创作决定怎样变成生产、展示、合同和流通问题？',
    playableLoop: ['看场地', '拆角色', '确认作品状态', '处理版数 / 署名', '做安装清单', '面对一次销售或借展选择', '留下机构档案'],
    unlocks: {
      knowledgeIds: ['knowledge-gallery-roles', 'knowledge-edition', 'knowledge-consignment', 'knowledge-installation-record'],
      methodIds: ['method-one-page-project', 'skill-field-notebook'],
      nodeIds: ['edition-note', 'installation-checklist', 'insurance-condition', 'consignment-record'],
      assetKinds: ['installation-sheet', 'edition-record', 'consignment-document'],
      mementoKinds: ['exhibition-label', 'opening-invite']
    },
    careerReuse: ['机构项目减少“画廊=场地”的误读', '后续展览自动出现安装 / 版数 / 借展条件', 'Archive 能记录作品如何被机构化'],
    researchBasis: ['继承旧版 Gallery Simulator / Field Simulator / Workshop 内容，不再使用抽象资本加点']
  },
  {
    id: 'learning-08-vj-first-night',
    code: 'WORKSHOP 01',
    title: '今晚你来放画面',
    subtitle: '控制器、MIDI、Mapping、实时音画与现场备份',
    status: 'planned',
    format: 'workshop',
    layers: ['tool', 'interface', 'survival'],
    setup: '一个小型演出临时缺 VJ。你有一台电脑、一个控制器、几组素材和不到两小时准备时间。',
    playerProblem: '怎样把素材、控制器、MIDI Mapping、输出规格和现场备份变成一个能连续工作的表演系统？',
    playableLoop: ['导入素材', '建立 Clip / Layer', '映射 MIDI', '测试节奏响应', '确认输出', '做备份状态', '现场演出'],
    unlocks: {
      knowledgeIds: ['knowledge-vj-layer', 'knowledge-midi-mapping', 'knowledge-live-backup'],
      methodIds: ['skill-signal-direction', 'skill-pipeline-bricolage'],
      nodeIds: ['media-deck', 'midi-controller', 'mapping', 'layer-mixer', 'video-output', 'fallback-scene'],
      assetKinds: ['vj-set', 'mapping-profile', 'show-log'],
      mementoKinds: ['wristband', 'setlist', 'failed-hdmi-adapter']
    },
    careerReuse: ['演出项目可直接调用 Mapping Profile', 'MIDI Episode 的协议知识降低学习成本', '现场故障与备份经验进入 Stage 2'],
    researchBasis: ['继承旧 skill_signal_direction / skill_pipeline_bricolage', '当代 VJ / live performance workshop practice']
  }
];

export const learningEpisodeById = new Map(learningEpisodes.map((episode) => [episode.id, episode]));

export const learningEpisodeLegacyMigration = {
  oldWorkshopSystem: 'PROLOGUE/EVENTS/workshops.md → Episode / Workshop content packs',
  oldSkillSlots: 'skills.js 五层 → Knowledge / Method / Node / Career reuse tags',
  oldFieldSimulator: '场域数值 → Episode 里的机构条件与真实决策',
  oldTrajectory: '轨迹记录 → Archive / Asset / Memory / Memento / Carryover',
  oldSimulatorDlc: '教育DLC / 国际DLC / 科技DLC → 可独立游玩的 Learning Episodes，不新增顶层模拟器'
} as const;
