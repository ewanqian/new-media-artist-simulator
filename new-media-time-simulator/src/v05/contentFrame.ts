export type StarterProject = {
  name: string;
  question: string;
  methods: string[];
  note: string;
};

export type ContactSeed = {
  id: string;
  name: string;
  role: string;
  regionId: string;
  state: string;
  lastMessage: string;
  openThread: string;
  canAsk: string[];
  tags: string[];
};

export type OpportunitySeed = {
  id: string;
  title: string;
  source: string;
  place: string;
  status: '可判断' | '待回复' | '暂不适合';
  deadline: string;
  value: string;
  risk: string;
};

export const starterProjectsByPractice: Record<string, StarterProject> = {
  'systems-generative': {
    name: '系统原型 01',
    question: '先证明这套规则在没有解释文字时也能产生不同状态。',
    methods: ['web', 'rules', 'feedback'],
    note: '从最小可运行规则开始，不先做完整视觉包装。'
  },
  'spatial-installation': {
    name: '空间原型 01',
    question: '先在一个真实尺度里确认观众、影像、声音和设备应该怎样相处。',
    methods: ['site', 'image', 'sound'],
    note: '先做 4×6 米范围内能成立的版本。'
  },
  'live-performance': {
    name: '现场系统 01',
    question: '做一套可以连续运行二十分钟、能切换状态、出错也不会立刻崩掉的现场系统。',
    methods: ['realtime', 'signal', 'cue'],
    note: '先做主状态、过渡状态和保底状态。'
  },
  'image-capture': {
    name: '扫描场景 01',
    question: '让扫描留下的缺口、漂浮和错误成为场景结构，而不是先被修干净。',
    methods: ['capture', '3d', 'archive'],
    note: '先保留失败材料，再决定哪些需要修复。'
  },
  'research-critique': {
    name: '研究线索 01',
    question: '找一个足够具体的问题，让材料、文本和现场观察都能对它产生证据。',
    methods: ['reading', 'archive', 'field-note'],
    note: '先收缩问题，不先写宏大陈述。'
  },
  'production-commission': {
    name: '委托测试 01',
    question: '在不牺牲核心判断的情况下，把一个模糊需求变成能报价、能分工、能交付的范围。',
    methods: ['brief', 'budget', 'delivery'],
    note: '先把责任边界写出来。'
  }
};

export const contactSeeds: ContactSeed[] = [
  {
    id: 'contact-lin',
    name: '林',
    role: '同行艺术家 / 偶尔一起测试',
    regionId: 'region-putuo-sucreek',
    state: '熟悉',
    lastMessage: '“我周三会去工作室，你要测就把东西带来。”',
    openThread: '上次借走的一根 SDI 线还没还。',
    canAsk: ['看一眼当前版本', '借小设备', '交换场地消息'],
    tags: ['同行', '反馈', '低成本测试']
  },
  {
    id: 'contact-li-tech',
    name: '李工',
    role: '场地技术 / 视频与信号',
    regionId: 'region-westbund',
    state: '工作关系',
    lastMessage: '“屏幕规格我发你了，别到现场才问输出口。”',
    openThread: '等你补一版技术单。',
    canAsk: ['确认信号链', '确认场地空档', '看技术单'],
    tags: ['技术', '场地', '现场']
  },
  {
    id: 'contact-qiao',
    name: '乔',
    role: '独立制作人',
    regionId: 'region-huangpu-riverside',
    state: '可联络',
    lastMessage: '“预算不大，但制作团队是完整的。你先说你到底要什么。”',
    openThread: '一个公共项目还在等甲方确认。',
    canAsk: ['问预算结构', '问制作团队', '把项目介绍发过去'],
    tags: ['制作', '预算', '机会']
  },
  {
    id: 'contact-chen',
    name: '陈',
    role: '机构项目策划',
    regionId: 'region-yangpu',
    state: '弱连接',
    lastMessage: '“你这个版本如果有清楚的现场记录，我可以转给同事看看。”',
    openThread: '缺一份能被机构快速读懂的项目页。',
    canAsk: ['确认征集方向', '问公开项目', '发项目页'],
    tags: ['机构', '征集', '文本']
  },
  {
    id: 'contact-dai',
    name: '戴师傅',
    role: '制作 / 运输 / 临时结构',
    regionId: 'region-songjiang',
    state: '熟人介绍',
    lastMessage: '“你先把尺寸和重量给我，别只发效果图。”',
    openThread: '还没拿到准确尺寸。',
    canAsk: ['估运输', '问结构做法', '找临时仓储'],
    tags: ['制作', '物流', '结构']
  },
  {
    id: 'contact-m',
    name: 'M',
    role: '影像记录 / 摄影',
    regionId: 'region-putuo-sucreek',
    state: '合作过一次',
    lastMessage: '“下次别只留最终画面，安装过程也拍。”',
    openThread: '等下一次可拍摄的测试。',
    canAsk: ['约记录', '看旧素材', '讨论传播版本'],
    tags: ['文档', '影像', '传播']
  }
];

export const opportunitySeeds: OpportunitySeed[] = [
  {
    id: 'opp-blackbox-two-hours',
    title: '两小时黑盒空档',
    source: '李工转来的场地消息',
    place: '西岸 / 多功能黑盒',
    status: '可判断',
    deadline: '3 天后',
    value: '能真实检查输出、观看距离和声音。',
    risk: '没有制作费；技术单必须提前给。'
  },
  {
    id: 'opp-open-call-small-space',
    title: '小型媒体艺术项目征集',
    source: '陈转来的公开链接',
    place: '杨浦 / 项目空间',
    status: '可判断',
    deadline: '5 天后',
    value: '有两周安装期和基础技术支持。',
    risk: '制作预算写得很模糊。'
  },
  {
    id: 'opp-brand-demo',
    title: '品牌发布会实时视觉',
    source: '乔',
    place: '浦东 / 演示厅',
    status: '待回复',
    deadline: '下周',
    value: '现金流高，能接触完整制作链。',
    risk: '范围容易从“视觉”扩成整套播控。'
  },
  {
    id: 'opp-hangzhou-week',
    title: '杭州一周工作坊 + Open Studio',
    source: '同行群消息',
    place: '杭州',
    status: '暂不适合',
    deadline: '两周后',
    value: '提供住宿和工作空间。',
    risk: '交通自理，公开展示要求不清楚。'
  }
];
