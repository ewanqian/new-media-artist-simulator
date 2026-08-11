import type { KnowledgeEntry } from './knowledgeBase.ts';

export const archiveExpansion: KnowledgeEntry[] = [
  {
    id: 'legacy-basic-studio', title: '基础工作室', category: '生态',
    summary: '旧版最基础的研究场域：没有传奇设备，价值在于允许反复试错。',
    body: ['工作室首先是一段可以被你支配的时间和空间。电脑、桌子、小屏幕、旧线材已经足够开始很多新媒体实践。', '一个空间是否“专业”，不只看设备。能不能长期放着半成品、能不能随时重做、有没有人愿意看一个失败版本，往往更重要。'],
    tags: ['旧版', '工作室', '起点'], relatedIds: ['documentation', 'realtime-system']
  },
  {
    id: 'legacy-phenomenology', title: '现象学实验空间', category: '方法',
    summary: '从技术退一步，先研究身体如何感知时间、距离、声音和反馈。',
    body: ['现象学路径不要求作品先解释“用了什么技术”，而是先问观众实际上经历了什么。', '延迟半秒、视线被迫转向、声音从身后出现、一个反馈需要身体靠近才能发生，这些都可以成为作品结构。'],
    tags: ['旧版研究空间', '感知', '身体'], relatedIds: ['site-survey', 'venue-preview']
  },
  {
    id: 'legacy-media-archaeology', title: '媒体考古实验室', category: '方法',
    summary: '重新使用过时媒介，研究技术标准如何塑造文化记忆。',
    body: ['媒体考古不是复古滤镜。它关心被淘汰的接口、格式、设备、失败标准和使用习惯。', 'VCD、DV、CRT、旧网页、损坏硬盘和过时软件都可能重新变成材料，因为它们保存了今天的软件已经抹平的限制。'],
    tags: ['旧版研究空间', '旧媒介', '技术史'], relatedIds: ['media-archaeology', 'documentation']
  },
  {
    id: 'legacy-cognitive-space', title: '认知科学艺术空间', category: '方法',
    summary: '把注意力、记忆、判断和错觉当成可被测试的艺术材料。',
    body: ['这里的重点不是把脑科学名词贴到作品上，而是用可验证的方式观察人如何分配注意力和形成判断。', '交互延迟、重复刺激、信息过载、预测失败，都能成为作品的规则。'],
    tags: ['旧版研究空间', '认知', '注意力'], relatedIds: ['realtime-system']
  },
  {
    id: 'legacy-embodied', title: '具身认知实验室', category: '方法',
    summary: '把移动、姿态、触觉和方向感放回计算系统。',
    body: ['当系统只在屏幕里运行时，身体很容易退化成鼠标的搬运工。具身方法会重新问：身体位置、动作和空间方向能不能直接改变系统状态？', '可穿戴设备、震动反馈、位置感知和空间音频都可以属于这一条方法链。'],
    tags: ['旧版研究空间', '身体', '交互'], relatedIds: ['site-survey', 'realtime-system']
  },
  {
    id: 'legacy-anthropocene', title: '人类世研究空间', category: '方法',
    summary: '把环境系统、基础设施和非人尺度带进作品。',
    body: ['环境主题不等于绿色视觉。更重要的是作品能否真的处理尺度、资源、数据来源、基础设施和人类之外的行动者。', '传感数据、气候档案、城市基础设施和生态过程都可能成为系统的一部分。'],
    tags: ['旧版研究空间', '生态', '基础设施'], relatedIds: ['documentation']
  },
  {
    id: 'legacy-postinternet', title: '后互联网研究所', category: '方法',
    summary: '互联网不再是“线上空间”，而是现实生活默认存在的基础设施。',
    body: ['后互联网实践关心的不是作品有没有网页，而是平台、推荐、截图、传播和网络语法怎样改变现实行为。', '作品可以发生在线下，但仍然被平台截图、短视频比例、推荐逻辑和搜索结构重新塑形。'],
    tags: ['旧版研究空间', '网络', '平台'], relatedIds: ['institutional-language']
  },
  {
    id: 'legacy-critical-code', title: '批判性编程空间', category: '方法',
    summary: '代码不是中性工具；规则、默认值和接口本身都可以被阅读。',
    body: ['批判性编程不要求故意把程序写坏，而是让代码中的判断重新变得可见。', '谁被分类、什么被忽略、系统在什么条件下自动决定，这些都可以成为作品内容。'],
    tags: ['旧版研究空间', '代码', '算法'], relatedIds: ['realtime-system']
  },
  {
    id: 'legacy-system-aesthetics', title: '系统美学实验室', category: '方法',
    summary: '作品不是一个固定物件，而是一组持续发生的规则和关系。',
    body: ['系统美学适合解释为什么一些作品的核心不在最终画面，而在输入、反馈、状态变化和参与者之间的关系。', '对于实时视觉、生成系统、网络作品和互动装置，这比单独讨论“画面风格”更接近作品本体。'],
    tags: ['旧版研究空间', '系统', '反馈'], relatedIds: ['realtime-system', 'live-visual']
  },
  {
    id: 'legacy-posthuman', title: '后人类工作室', category: '方法',
    summary: '把“作者”从唯一中心位置上挪开一点。',
    body: ['后人类方法可以讨论机器、动物、基础设施、自动化代理和环境如何共同参与作品。', '真正困难的不是把“后人类”写进标题，而是设计一个人无法完全控制的系统，同时仍然对它负责。'],
    tags: ['旧版研究空间', '主体性', '机器'], relatedIds: ['institutional-language']
  },
  {
    id: 'project-ai-collaboration', title: 'AI 协作艺术', category: '方法',
    summary: '旧项目库中的一条主线：AI 到底是生成器、编辑器、代理还是合作者？',
    body: ['如果 AI 只是替你快速生成最终图像，作品很容易只剩效率问题。更有意思的是明确人与模型分别能决定什么。', '提示词、选择、拒绝、训练数据、自动代理和人工干预都可以成为作品可见的结构。'],
    tags: ['旧项目库', 'AI', '协作'], relatedIds: ['critical-code']
  },
  {
    id: 'project-algorithmic-curation', title: '算法策展', category: '方法',
    summary: '让选择机制本身成为策展对象。',
    body: ['算法策展并不等于随机播放作品。它需要明确系统根据什么数据进行选择，以及这种选择如何改变观看秩序。', '当推荐逻辑被展示出来时，策展也会暴露它自己的偏见、便利和荒谬。'],
    tags: ['旧项目库', '算法', '策展'], relatedIds: ['institutional-language']
  },
  {
    id: 'project-biometric', title: '生物识别装置', category: '方法',
    summary: '心率、面部、姿态和身体数据进入艺术系统时，伦理与误差同样重要。',
    body: ['身体数据不是天然真实。传感器会误读、丢失、分类和简化。', '一个成熟的生物识别项目需要同时处理体验、数据权限、误差和观众是否知道系统正在读取什么。'],
    tags: ['旧项目库', '生物识别', '传感'], relatedIds: ['site-survey']
  },
  {
    id: 'project-data-visualization', title: '数据可视化艺术', category: '方法',
    summary: '可视化不是把数字变漂亮，而是决定什么值得被看见。',
    body: ['数据采集、缺失值、尺度和分类方式都会改变最后的图像。', '当作品故意展示数据的缺口和不确定性时，可视化也可以从“解释工具”转向批判性媒介。'],
    tags: ['旧项目库', '数据', '可视化'], relatedIds: ['documentation']
  },
  {
    id: 'project-memory-archive', title: '记忆档案项目', category: '方法',
    summary: '把档案当成不断被重写的系统，而不是存储仓库。',
    body: ['档案选择什么、如何命名、允许谁进入，本身已经在制造历史。', '个人硬盘、聊天记录、扫描材料、旧网页和现场记录都可以成为作品，但需要明确它们怎样被重新组织。'],
    tags: ['旧项目库', '记忆', '档案'], relatedIds: ['media-archaeology', 'documentation']
  },
  {
    id: 'project-climate-data', title: '气候数据艺术', category: '方法',
    summary: '把不可直接感知的长期变化转成可经验的时间尺度。',
    body: ['气候数据作品最容易陷入“把折线图做得更漂亮”。更有力的做法是让尺度、时间和数据的不完整性成为体验本身。', '环境数据也需要追问来源、采样方式与基础设施。'],
    tags: ['旧项目库', '环境', '数据'], relatedIds: ['documentation']
  },
  {
    id: 'project-social-mirror', title: '社交媒体镜像', category: '方法',
    summary: '把平台行为反馈给使用者，看见自己如何被界面塑造。',
    body: ['关注、转发、停留时间、截图和推荐都可以成为作品输入。', '重要的是不要把“社交媒体很糟糕”当成结论，而是设计一种让平台规则在体验中自己暴露的方法。'],
    tags: ['旧项目库', '平台', '社交媒体'], relatedIds: ['institutional-language']
  },
  {
    id: 'black-humor-method', title: '黑色幽默不是吐槽按钮', category: '方法',
    summary: '让同一件事同时拥有正式解释、普通话和荒诞后果。',
    body: ['旧版最有辨识度的结构之一，是同一事件同时存在正式话语、通俗翻译与讽刺评论。笑点来自三种话语之间的落差。', '黑色幽默最好针对制度、流程和语言，不依赖把某个人写成蠢货。这样它才会在几年后仍然成立。'],
    tags: ['文本系统', '黑色幽默', '旧版'], relatedIds: ['institutional-language']
  },
  {
    id: 'action-card-system', title: '行动卡：旧版的核心交互', category: '生态',
    summary: '研究场域、专业准备、项目研究、筹措经费曾经都以卡牌行动存在。',
    body: ['卡牌让信息密度天然受控：标题告诉你行为，描述告诉你内容，成本告诉你现实约束，结果才推动数值和事件。', '它比一张过早展开的城市地图更适合开局，因为玩家先理解“艺术家平时到底做什么”，然后再理解这些行为发生在哪里。'],
    tags: ['系统史', '卡牌', '旧版'], relatedIds: ['legacy-basic-studio']
  }
];
