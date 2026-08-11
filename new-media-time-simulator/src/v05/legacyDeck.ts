export type DeckCategory = 'studio' | 'project' | 'income';
export type PlaceKind = '工作' | '展示' | '学习' | '交流' | '供应' | '现场';

export type ActionCard = {
  id: string;
  category: DeckCategory;
  title: string;
  cost: number;
  unlockAt: number;
  summary: string;
  detail: string;
  plain: string;
  satire?: string;
  tags: string[];
  effect: { coherence?: number; stability?: number; siteFit?: number; documentation?: number; cash?: number };
  discovers?: string[];
  projectSeed?: { name: string; question: string; methods: string[] };
};

export type PlaceCard = {
  id: string;
  title: string;
  kind: PlaceKind;
  unlockAt: number;
  cost: number;
  summary: string;
  detail: string;
  transparent: string[];
  actions: string[];
  tags: string[];
  discovers?: string[];
};

export type ContactSeed = {
  id: string;
  name: string;
  role: string;
  background: string;
  howMet: string;
  tags: string[];
  openingMessages: { from: 'you' | 'them' | 'system'; text: string }[];
  asks: string[];
};

export type SatiricalEvent = {
  id: string;
  title: string;
  unlockAt: number;
  formal: string;
  plain: string;
  satire: string;
  choices: { label: string; result: string; cash?: number; attention?: number }[];
};

export const unlockSteps = [
  { step: 0, title: '先做一件事', note: '你现在只有工作室和档案。先从一张卡开始。' },
  { step: 1, title: '开始出门', note: '探索开放。地点按“它能让你做什么”分类，不按行政区堆满屏幕。' },
  { step: 2, title: '形成项目', note: '你做过的行动开始聚成一个项目。项目页开放。' },
  { step: 3, title: '有人记住你了', note: '联络不会预装。只有真正遇见的人才会出现。' },
  { step: 4, title: '项目开始要求工具', note: '工作台此时才开放。设备只在需要时出现。' }
] as const;

export const actionCards: ActionCard[] = [
  {
    id: 'studio-media-archaeology', category: 'studio', title: '媒体考古与阅读', cost: 1, unlockAt: 0,
    summary: '把旧设备、旧格式和失败文件当成材料。',
    detail: '桌上有一个打不开的旧硬盘、一张 VCD、三个不知道制式的转接头。你可以先研究它们为什么已经“不合时宜”，以及这种不合时宜能不能成为方法。',
    plain: '研究旧媒介今天还能做什么。',
    satire: '设备最有艺术价值的时刻，往往是售后正式宣布不再支持它之后。',
    tags: ['研究', '旧媒介', '档案'], effect: { coherence: 1, documentation: 1 }, discovers: ['contact-m'],
    projectSeed: { name: '失效格式研究', question: '当一种媒介停止被支持以后，它还剩下什么？', methods: ['媒体考古', '旧格式', '档案'] }
  },
  {
    id: 'studio-minimum-system', category: 'studio', title: '做一个最小系统', cost: 2, unlockAt: 0,
    summary: '只保留输入、规则、反馈。先让它运行。',
    detail: '不做完整包装，不写五百字概念。让鼠标、声音、时间或一个传感器真正改变画面一次。先确认系统成立，再讨论它长什么样。',
    plain: '做一个能运行的原型。',
    satire: '恭喜，你暂时躲过了“先做一份三十页提案再决定作品是什么”的流程。',
    tags: ['系统', '原型', '实时'], effect: { coherence: 1, stability: 1 },
    projectSeed: { name: '最小反馈系统', question: '一个输入改变一个规则以后，观看关系会发生什么？', methods: ['实时图形', '反馈', '规则'] }
  },
  {
    id: 'studio-sort-material', category: 'studio', title: '整理旧材料', cost: 1, unlockAt: 0,
    summary: '把截图、失败录像、安装图和版本文件重新放到能找到的位置。',
    detail: '这不会立刻让作品变好，但会让三周后的你少骂一次两周前的自己。整理过程中，旧项目也可能重新变成材料。',
    plain: '建立最低限度的版本与文档。',
    satire: '“final_final_v7_REAL”不是版本管理系统。',
    tags: ['文档', '版本', '存档'], effect: { documentation: 1 },
    projectSeed: { name: '失败文件档案', question: '如果只保留创作过程里的失败，作品会变成什么？', methods: ['档案', '失败记录', '重组'] }
  },
  {
    id: 'studio-read-theory', category: 'studio', title: '读一篇真正相关的东西', cost: 1, unlockAt: 1,
    summary: '不是为了给作品贴理论标签，只找一个能改变判断的问题。',
    detail: '你可以读媒体理论、系统论、技术史、感知研究，也可以最后发现这篇文章跟你的作品没有关系。后者同样有效。',
    plain: '用阅读改变一个具体判断。',
    satire: '理论的最低使用门槛：至少要比作品说明里的脚注更早出现。',
    tags: ['阅读', '理论', '判断'], effect: { coherence: 1 }
  },
  {
    id: 'project-one-page', category: 'project', title: '做一个一页项目版本', cost: 2, unlockAt: 2,
    summary: '让一个没见过你的人在一分钟内知道作品怎么发生。',
    detail: '一页只放问题、当前版本、发生方式、需要条件和一张有效图。不要从“自古以来，人类一直在……”开始。',
    plain: '把项目压成可传递的版本。',
    satire: '如果第一段就出现“后人类语境下的流动主体性”，对方可能会先打开下一份。',
    tags: ['项目', '文本', '申请'], effect: { coherence: 1, documentation: 1 }
  },
  {
    id: 'project-run-long', category: 'project', title: '让它连续跑两个小时', cost: 2, unlockAt: 2,
    summary: '把“能启动”与“能工作”区分开。',
    detail: '不盯着它。让系统自己跑，记录崩溃、延迟、内存、丢信号和无法恢复的状态。',
    plain: '验证稳定性。',
    satire: '现场最不浪漫的艺术批评通常是：“它怎么黑屏了？”',
    tags: ['测试', '稳定性', '系统'], effect: { stability: 1 }
  },
  {
    id: 'project-document', category: 'project', title: '留下可复用文档', cost: 1, unlockAt: 2,
    summary: '安装图、技术单、失败截图和一句关键判断。',
    detail: '文档不是项目结束后的宣传照片。它是未来的你、制作团队和下一次版本能够重新进入作品的接口。',
    plain: '让项目以后还能被重新搭起来。',
    satire: '如果一个作品只有作者本人知道怎么开机，它可能更接近私人仪式。',
    tags: ['文档', '技术单', '归档'], effect: { documentation: 1 }
  },
  {
    id: 'income-small-commission', category: 'income', title: '接一个小委托', cost: 2, unlockAt: 3,
    summary: '它可能不伟大，但能支付这个月的软件、交通和硬盘。',
    detail: '先问清交付范围。最危险的不是商业，而是“顺便也帮我们把服务器、播控和网络一起搞一下”。',
    plain: '换现金流，同时学习责任边界。',
    satire: '甲方最稳定的生成式能力，是在报价确认后继续生成新需求。',
    tags: ['现金流', '委托', 'Scope'], effect: { cash: 1200, documentation: 1 }, discovers: ['contact-qiao']
  }
];

export const placeCards: PlaceCard[] = [
  {
    id: 'place-basic-studio', title: '基础工作室', kind: '工作', unlockAt: 0, cost: 1,
    summary: '可以长期放半成品的普通工作空间。',
    detail: '继承旧版“基础工作室”：电脑、桌面、小屏幕、旧线材，以及允许你反复把东西拆掉重来的时间。',
    transparent: ['费用低', '适合长期试错', '容易遇到同行', '没有大型设备'],
    actions: ['做原型', '整理材料', '请同行看一眼'], tags: ['工作室', '低成本'], discovers: ['contact-lin']
  },
  {
    id: 'place-archive-reading', title: '媒体考古与阅读', kind: '学习', unlockAt: 0, cost: 1,
    summary: '旧媒介、文本、档案和失败技术组成的学习空间。',
    detail: '重点不是怀旧，而是理解每种媒介曾经允许什么、禁止什么，以及这些限制今天还能不能成为创作规则。',
    transparent: ['知识密度高', '制作成本低', '会打开档案词条'],
    actions: ['阅读', '拆旧设备', '整理旧格式'], tags: ['媒体考古', '阅读'], discovers: ['contact-m']
  },
  {
    id: 'place-project-space', title: '独立项目空间', kind: '展示', unlockAt: 1, cost: 1,
    summary: '小型展览、测试展、Open Studio 常发生在这里。',
    detail: '可以直接看到作品如何被安装、说明和临时修正。它不是缩小版美术馆，而是另一种组织方式。',
    transparent: ['预算有限', '沟通直接', '安装自由度高', '传播能力不稳定'],
    actions: ['看展', '问制作', '申请一次测试'], tags: ['展示', '自组织'], discovers: ['contact-chen']
  },
  {
    id: 'place-peer-meet', title: '同行碰面', kind: '交流', unlockAt: 1, cost: 1,
    summary: '咖啡馆只是碰面地点，不承担神秘的“申请整理功能”。',
    detail: '这里发生的是交换消息、看一个版本、吐槽一次项目，然后各自回去继续做。信息可能有用，也可能只是“听说有个项目”。',
    transparent: ['成本低', '消息快', '信息可靠度不固定'],
    actions: ['聊项目', '交换消息', '请人看一眼'], tags: ['交流', '同行'], discovers: ['contact-lin']
  },
  {
    id: 'place-blackbox', title: '黑盒 / 演出空间', kind: '现场', unlockAt: 2, cost: 2,
    summary: '实时影像、声音、灯光、屏幕和观众同时发生。',
    detail: '适合测试长时间运行、信号切换、同步、故障恢复，以及桌面上不存在的观看距离。',
    transparent: ['现场反馈快', '技术问题会被放大', '适合实时系统'],
    actions: ['看现场', '跑一次输出', '问技术人员'], tags: ['现场', '演出', '实时'], discovers: ['contact-li-tech']
  },
  {
    id: 'place-fabrication', title: '制作与加工', kind: '供应', unlockAt: 3, cost: 1,
    summary: '结构、喷绘、木工、金属、运输和临时加工。',
    detail: '只有当项目真的需要做出来时才重要。这里不负责让概念变高级，只负责让尺寸、重量和进场路径别错。',
    transparent: ['按项目付费', '尺寸优先', '会暴露运输与安装问题'],
    actions: ['估价', '问结构', '确认运输'], tags: ['供应商', '制作', '物流'], discovers: ['contact-dai']
  },
  {
    id: 'place-institution', title: '美术馆 / 机构展厅', kind: '展示', unlockAt: 4, cost: 2,
    summary: '更复杂的制作、管理、传播和责任体系。',
    detail: '它不应该在开局就成为你的日常办公室。进入这里意味着项目已经能被陌生团队理解、审核和执行。',
    transparent: ['制作链长', '技术要求高', '传播强', '流程影响自由度'],
    actions: ['看展', '勘场', '提交技术资料'], tags: ['机构', '大型空间']
  },
  {
    id: 'place-fair', title: '艺博会 / 会展', kind: '交流', unlockAt: 4, cost: 2,
    summary: '作品、销售、社交、媒体和安保密度都很高。',
    detail: '适合观察艺术市场如何把观看变成排期、展位、VIP、报价和一杯很难喝但免费的气泡水。',
    transparent: ['信息密度高', '商业导向强', '荒诞事件概率高'],
    actions: ['逛展', '看展位', '观察谁在和谁说话'], tags: ['艺博会', '市场', '讽刺']
  }
];

export const contactSeeds: ContactSeed[] = [
  {
    id: 'contact-lin', name: '林', role: '同行艺术家',
    background: '做实时影像和小型装置。设备不多，但愿意直接说你的版本哪里无聊。',
    howMet: '在基础工作室测试时认识。', tags: ['同行', '反馈'],
    openingMessages: [
      { from: 'system', text: '你们在工作室认识。' },
      { from: 'them', text: '要测就把能跑的版本带来，先别做 PPT。' }
    ], asks: ['看一个当前版本', '问最近有什么小场地']
  },
  {
    id: 'contact-li-tech', name: '李工', role: '场地技术',
    background: '长期做视频、信号和现场系统。对艺术概念没有意见，对没写输出规格很有意见。',
    howMet: '第一次去黑盒看现场时认识。', tags: ['技术', '现场'],
    openingMessages: [
      { from: 'system', text: '你在黑盒现场问了一个输出问题。' },
      { from: 'them', text: '分辨率、刷新率、接口、备份机，先写四行给我。' }
    ], asks: ['确认一次信号链', '问场地最近有没有空档']
  },
  {
    id: 'contact-m', name: 'M', role: '影像记录',
    background: '做摄影和现场记录。比起精修成片，更关心安装过程和失败材料有没有留下。',
    howMet: '整理旧材料时翻到他之前给朋友做的记录。后来在线下碰面。', tags: ['记录', '影像'],
    openingMessages: [
      { from: 'system', text: '你因为一份旧记录认识了 M。' },
      { from: 'them', text: '别等做完再拍。搭坏的时候也拍。' }
    ], asks: ['请他看你的文档结构', '问一次现场记录报价']
  },
  {
    id: 'contact-qiao', name: '乔', role: '制作人',
    background: '做商业和展演制作。擅长把一句“都一起做吧”拆成责任、时间和钱。',
    howMet: '第一次接小委托时由朋友介绍。', tags: ['制作', '报价'],
    openingMessages: [
      { from: 'system', text: '朋友把乔的联系方式推给了你。' },
      { from: 'them', text: '先别报总价。把你负责什么、不负责什么写出来。' }
    ], asks: ['看一眼 Scope', '问供应商报价结构']
  },
  {
    id: 'contact-chen', name: '陈', role: '项目空间组织者',
    background: '运营一个小型项目空间。没有庞大的制作团队，但会认真讨论作品怎么在现场发生。',
    howMet: '在独立项目空间看展时认识。', tags: ['机构', '小空间'],
    openingMessages: [
      { from: 'system', text: '你在撤展前问了几个安装问题。' },
      { from: 'them', text: '你下次如果只是想测两天，也可以提前问。' }
    ], asks: ['问一次测试档期', '发一个一页项目版本']
  },
  {
    id: 'contact-dai', name: '戴师傅', role: '制作 / 加工',
    background: '做结构加工和现场安装。会先问尺寸、重量、材质和货梯，而不是艺术史。',
    howMet: '项目第一次需要真实结构时认识。', tags: ['加工', '结构'],
    openingMessages: [
      { from: 'system', text: '你带着一张不太像施工图的图去问加工。' },
      { from: 'them', text: '先告诉我多大、多重、怎么进门。' }
    ], asks: ['问结构可不可拆', '估一次加工和运输']
  }
];

export const satiricalEvents: SatiricalEvent[] = [
  {
    id: 'event-ai-without-ai', title: '全员 AI', unlockAt: 1,
    formal: '一次行业讨论再次把“AI 与艺术家的主体性”放在核心位置。发言者普遍强调自己保持谨慎距离。',
    plain: '大家都在用 AI，但台上都说自己主要是在批判 AI。',
    satire: '策展人用 AI 改提案，艺术家用 AI 改图，评论家用 AI 改评论。最后所有人一致认为：AI 最大的问题是别人用得太多。',
    choices: [
      { label: '公开说自己用了', result: '没人震惊。两个人私聊问你用的什么。' },
      { label: '保持沉默', result: '你顺利融入了讨论。' },
      { label: '回工作室继续做', result: '至少项目往前走了一点。', attention: 1 }
    ]
  },
  {
    id: 'event-theory-bloat', title: '理论膨胀', unlockAt: 2,
    formal: '某项目文本使用了大量跨学科概念，以建立复杂而开放的理论语境。',
    plain: '两百字能说完的事写了两千字。',
    satire: '“我在喝水”被改成了“身体对生命维持物质进行临时性的内部再分配”。评审表示理论框架非常完整。',
    choices: [
      { label: '把自己的文本删一半', result: '突然能看懂了。' },
      { label: '再加三个术语', result: '文本更像文本了。' }
    ]
  },
  {
    id: 'event-scope-growth', title: '范围自然生长', unlockAt: 3,
    formal: '项目进入跨部门协作阶段，相关技术需求需进一步协同确认。',
    plain: '报价没变，工作多了四项。',
    satire: '新需求没有负责人，因为每个人都以为“这个应该很简单”。简单到最后通常由最后一个没有及时退出群聊的人负责。',
    choices: [
      { label: '把新增内容列成 Scope', result: '会议第一次出现了具体名词。' },
      { label: '先答应再说', result: '你获得了一份未来的自己会讨厌的工作。', attention: -1 }
    ]
  },
  {
    id: 'event-fair-security', title: '艺博会安保', unlockAt: 4,
    formal: '大型会展通过高密度安保与精细化动线提升作品与观众的安全保障。',
    plain: '安保比艺术家显眼。',
    satire: '作品没人看，安保一直有人看。你开始认真思考：如果给自己的装置配两个一米八五的保安，它会不会显得更重要。',
    choices: [
      { label: '继续看作品', result: '你成功在艺博会完成了一项非主流行为。' },
      { label: '观察展位怎么卖东西', result: '市场也是一种现场。' }
    ]
  }
];

export const placeKinds: ('全部' | PlaceKind)[] = ['全部', '工作', '展示', '学习', '交流', '供应', '现场'];

export function contactById(id: string) {
  return contactSeeds.find((item) => item.id === id);
}
