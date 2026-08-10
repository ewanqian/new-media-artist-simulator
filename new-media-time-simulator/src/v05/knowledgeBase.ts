export type KnowledgeCategory = '生态' | '方法' | '制作' | '术语' | '机构';

export type KnowledgeEntry = {
  id: string;
  title: string;
  category: KnowledgeCategory;
  summary: string;
  body: string[];
  tags: string[];
  relatedIds: string[];
};

export const knowledgeEntries: KnowledgeEntry[] = [
  {
    id: 'shanghai-media-ecology',
    title: '上海：不是一张艺术地图',
    category: '生态',
    summary: '同一座城市里，美术馆、独立空间、商业制作、学校、俱乐部、供应链和技术公司并不属于同一个圈。',
    body: [
      '对新媒体艺术家来说，上海更像多套重叠网络：展览系统提供观看与背书，制作系统提供设备与人，演出系统提供高频现场，院校系统提供研究语境，商业系统提供现金流。',
      '真正影响项目的通常不是“你在哪个区”，而是你能不能从一个网络跨到另一个网络：谁能借设备、谁知道场地空档、谁能把技术问题翻译成预算、谁愿意替你承担现场风险。',
      '因此本游戏的地图不是景点导览，而是关系、资源、机会和限制的空间索引。'
    ],
    tags: ['上海', '生态', '网络', '场地'],
    relatedIds: ['suzhou-creek-ecology', 'westbund-ecology', 'artist-run-space', 'institutional-language']
  },
  {
    id: 'suzhou-creek-ecology',
    title: '苏河一线：工作室、仓库与低成本试错',
    category: '生态',
    summary: '这里在游戏里代表日常制作、共享空间、临时项目房和同行消息，而不是一个单一机构。',
    body: [
      '低成本空间的价值不是“看起来像艺术区”，而是允许作品长期放着、反复拆装、半夜修改和短时间测试。',
      '这类地点会产生最普通也最重要的资源：旧线材、闲置设备、临时帮手、同行反馈、搬运渠道和没有写进公开信息里的机会。'
    ],
    tags: ['上海', '工作室', '同行', '低成本'],
    relatedIds: ['shanghai-media-ecology', 'documentation', 'production-scope']
  },
  {
    id: 'westbund-ecology',
    title: '西岸：作品一旦进入大型空间',
    category: '生态',
    summary: '大尺度展厅、滨江公共空间与文化产业聚集，会把作品从“能运行”推到“能被完整交付”。',
    body: [
      '当作品进入大型文化设施或公共空间，技术问题会迅速变成组织问题：结构、运输、消防、排期、夜间施工、撤场、保险、媒体和观众动线都会开始影响作品。',
      '大型空间并不自动带来更好的作品，它只是把每一个没有解决的问题放大。'
    ],
    tags: ['上海', '大型空间', '机构', '制作'],
    relatedIds: ['venue-preview', 'technical-rider', 'production-scope', 'institutional-language']
  },
  {
    id: 'open-call',
    title: '公开征集 / Open Call',
    category: '机构',
    summary: '一份公开征集真正提供的东西，往往藏在主题文案之外。',
    body: [
      '阅读公开征集时至少拆成四件事：谁在组织、给什么支持、要求什么交付、谁承担制作风险。',
      '“入选”不是统一价值。一个小空间给你两周现场测试，可能比一个只有 Logo 和证书的大项目更有用；反过来，一个大型机构的制作团队也可能解决你自己无法承担的工程问题。',
      '游戏中的征集不会只检查一个“学术值”，而会检查项目阶段、材料完整度、场地适配、关系线索和时间。'
    ],
    tags: ['申请', '机构', '机会', '预算'],
    relatedIds: ['institutional-language', 'production-scope', 'documentation']
  },
  {
    id: 'technical-rider',
    title: '技术单 / Technical Rider',
    category: '制作',
    summary: '不是“设备愿望清单”，而是别人怎样把你的作品正确搭起来。',
    body: [
      '一份有效技术单需要让陌生团队知道输入、输出、信号、供电、网络、屏幕或投影规格、声音、控制方式、空间尺寸、安装时间和备用方案。',
      '技术单越晚出现，现场越容易用昂贵的方式发现本来可以在桌面上解决的问题。',
      '在游戏中，技术单会影响场地预演、制作方信任、临时加价和故障恢复。'
    ],
    tags: ['技术', '交付', '现场', '文档'],
    relatedIds: ['site-survey', 'venue-preview', 'production-scope', 'documentation']
  },
  {
    id: 'site-survey',
    title: '勘场 / Site Survey',
    category: '制作',
    summary: '作品进入空间之前，先让空间进入你的项目。',
    body: [
      '勘场不是拍几张照片。要确认观看距离、亮度、噪声、吊点、承重、供电、网络、进出货路径、控制位、安装窗口和撤场限制。',
      '好的勘场会直接改变作品，而不是只改变施工方案。'
    ],
    tags: ['场地', '空间', '技术', '制作'],
    relatedIds: ['technical-rider', 'venue-preview', 'documentation']
  },
  {
    id: 'venue-preview',
    title: '场地预演不是缩略图',
    category: '方法',
    summary: '预演的目标是尽早暴露比例、信号、节奏和观看关系的问题。',
    body: [
      '平面屏、超宽屏、环形屏、球幕和投影空间不是同一个输出尺寸的变体，它们改变观众如何分配注意力。',
      '低保真阶段可以只验证构图、时长和接缝；进入制作阶段后再增加亮度、延迟、同步、视角和硬件容错。'
    ],
    tags: ['预演', 'mapping', '空间', '输出'],
    relatedIds: ['technical-rider', 'site-survey', 'realtime-system']
  },
  {
    id: 'production-scope',
    title: 'Scope：到底谁负责到哪一步',
    category: '制作',
    summary: '很多项目不是预算不够，而是责任边界从来没有被写清楚。',
    body: [
      '“做视觉”可能只包含内容，也可能被默认为包含服务器、播控、现场值守、线材、备机、联调和撤场。',
      '范围模糊会制造一种常见黑色幽默：每个人都以为另一个人会处理最后那根线。',
      '游戏会把 Scope 作为项目状态，而不是单纯的金钱惩罚。'
    ],
    tags: ['制作', '预算', '责任', '委托'],
    relatedIds: ['technical-rider', 'documentation', 'institutional-language']
  },
  {
    id: 'realtime-system',
    title: '实时系统 / Realtime System',
    category: '方法',
    summary: '“实时”不是软件名字，而是作品在运行中持续接收状态并作出反馈。',
    body: [
      '真正的实时系统要回答：什么在变化、谁能改变它、延迟能不能被感知、失败后如何恢复、运行多久以后状态还成立。',
      '一个会动的画面不一定是实时系统；一个没有复杂视觉、但会根据观众、声音或网络状态改变规则的作品反而可能更接近系统实践。'
    ],
    tags: ['实时', '系统', '反馈', '软件'],
    relatedIds: ['venue-preview', 'live-visual', 'gaussian-splatting']
  },
  {
    id: 'live-visual',
    title: '现场视觉 / Live Visual',
    category: '方法',
    summary: '现场视觉的作品条件包括音乐、灯光、屏幕、艺人、观众和临场决策。',
    body: [
      '现场系统的核心不是准备最多素材，而是准备可以切换的状态：主状态、过渡状态、故障状态、留白状态。',
      '它天然适合训练“系统而不是片段”的思维，因为你无法提前知道每一个时刻会发生什么。'
    ],
    tags: ['现场', 'VJ', '实时', '演出'],
    relatedIds: ['realtime-system', 'technical-rider', 'venue-preview']
  },
  {
    id: 'media-archaeology',
    title: '媒体考古',
    category: '方法',
    summary: '旧媒介不是怀旧滤镜，而是重新检查技术曾经允许什么、禁止什么。',
    body: [
      '媒体考古把过时设备、格式、接口、失败标准和使用习惯重新带回现在。',
      '在游戏里，它可以让“废物资产”获得第二次用途：旧摄像机、VCD、过时显卡、损坏硬盘和转换头都可能成为方法，而不是垃圾。'
    ],
    tags: ['档案', '旧媒介', '设备', '方法'],
    relatedIds: ['documentation', 'realtime-system', 'gaussian-splatting']
  },
  {
    id: 'documentation',
    title: '文档不是项目结束后的照片',
    category: '制作',
    summary: '文档同时是记忆、证据、交接、传播和下一次重做的基础设施。',
    body: [
      '安装图、技术单、版本记录、失败截图、现场视频、预算变化和一句关键反馈，都可能比最终精修照片更能解释作品如何存在。',
      '游戏里的文档会被档案库、申请、联系人和下一轮项目重新调用。'
    ],
    tags: ['文档', '档案', '版本', '传播'],
    relatedIds: ['technical-rider', 'site-survey', 'media-archaeology', 'open-call']
  },
  {
    id: 'gaussian-splatting',
    title: '3D Gaussian Splatting',
    category: '术语',
    summary: '一种用大量带属性的高斯表示场景并进行新视角渲染的方法，正在改变扫描材料进入实时空间的方式。',
    body: [
      '对艺术实践更重要的问题不是“它是不是最新技术”，而是这种表示如何保留缺口、漂浮、噪声、视角依赖和扫描失败。',
      '在游戏里它属于影像/扫描方法链，可以与实时图形、档案和空间预演组合，而不是独立成为一棵科技树。'
    ],
    tags: ['扫描', '3DGS', '重建', '实时'],
    relatedIds: ['realtime-system', 'media-archaeology', 'venue-preview']
  },
  {
    id: 'institutional-language',
    title: '机构语言',
    category: '术语',
    summary: '同一件作品在艺术家、策展、制作、品牌和媒体口中会变成五种文本。',
    body: [
      '机构语言不是天然虚伪，它首先是一套协调资源的接口；问题发生在接口开始替代作品本身的时候。',
      '游戏中的文本会尽量保留三个镜头：事实发生了什么、机构怎样描述、玩家后来怎样回看。'
    ],
    tags: ['文本', '机构', '传播', '黑色幽默'],
    relatedIds: ['open-call', 'production-scope', 'shanghai-media-ecology']
  },
  {
    id: 'artist-run-space',
    title: 'Artist-run Space / 艺术家自组织空间',
    category: '机构',
    summary: '不是“小号美术馆”，而是一种把场地、策划、劳动和关系重新组合的组织方式。',
    body: [
      '自组织空间的优势通常是决策链短、可以冒险、可以容纳未完成状态；弱点则是资金、时间和劳动极度依赖具体的人。',
      '它在游戏里既可以是地点，也可以被玩家自己建立成机构。'
    ],
    tags: ['机构', '自组织', '空间', '同行'],
    relatedIds: ['shanghai-media-ecology', 'suzhou-creek-ecology', 'residency']
  },
  {
    id: 'residency',
    title: '驻留 / Residency',
    category: '机构',
    summary: '驻留不是“去国外待一阵”，而是时间、空间、资源和陌生语境共同构成的一种项目条件。',
    body: [
      '值得区分的不是国内/海外，而是驻留提供什么：工作室、住宿、制作费、技术支持、研究网络、公开呈现，还是只有一个地址。',
      '驻留最有价值的时候，往往是它迫使一个熟悉方法在陌生条件下失效一次。'
    ],
    tags: ['驻留', '机构', '研究', '旅行'],
    relatedIds: ['artist-run-space', 'open-call', 'documentation']
  }
];

export const knowledgeById = new Map(knowledgeEntries.map((entry) => [entry.id, entry]));
export const knowledgeCategories = ['全部', '生态', '方法', '制作', '术语', '机构'] as const;
