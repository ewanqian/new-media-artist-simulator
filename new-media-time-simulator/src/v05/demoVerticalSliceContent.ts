export type DemoRoute = {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  summary: string;
  resourcePackId: string;
  signalTags: string[];
  knownNpcIds: string[];
  firstProjectPrompt: string;
  startingNotes: string[];
  blueprintSeed: string[];
  memoryMoments: string[];
};

export type DemoBrief = {
  id: string;
  routeIds: string[];
  title: string;
  hook: string;
  decision: string;
  constraints: string[];
  rewards: string[];
  blueprintNodes: string[];
};

export type DemoEvent = {
  id: string;
  title: string;
  hook: string;
  tags: string[];
  choices: { label: string; consequence: string }[];
};

export type DemoArchiveEntry = {
  id: string;
  category: 'PEOPLE' | 'PLACES' | 'PROJECTS' | 'METHODS' | 'MEDIA' | 'ECOLOGY';
  title: string;
  summary: string;
  fragments: string[];
  tags: string[];
};

export const outputDemoRoutes: DemoRoute[] = [
  {
    id: 'demo-route-live-system',
    code: 'LIVE SYSTEM',
    title: '一个还没准备好的现场',
    subtitle: '输入、输出、两小时黑盒与第一次公开',
    summary: '一台电脑、一个旧投影、一些素材和一个没完全跑稳的系统。下周，一个小空间希望你交出一个观众愿意停留五分钟的版本。',
    resourcePackId: 'pack-shared',
    signalTags: ['systems', 'field', 'production'],
    knownNpcIds: ['contact-lin', 'contact-li-tech', 'contact-chen'],
    firstProjectPrompt: '让一个输入真的改变输出，然后把它带进两小时黑盒。',
    startingNotes: ['场地只空两小时', '一台投影', '网络不保证稳定', '没有专职技术值守'],
    blueprintSeed: ['project-question', 'prod-render-pc', 'prod-projector', 'prod-setup-window', 'prod-power'],
    memoryMoments: ['第一根线接上后真的运行', '同一版本进入现场后立刻暴露问题', '删节点后反而更稳定']
  },
  {
    id: 'demo-route-costa-rica-butterfly-scholar',
    code: 'FIELD STUDY',
    title: '哥斯达黎加的蝴蝶学者',
    subtitle: '观察、扫描、植物保存与不断变化的花园',
    summary: '你跟随一位在哥斯达黎加长期观察蝴蝶与寄主植物的学者工作。林下扫描、植物标本、观察表、天气和季节逐渐堆成一个项目。你需要决定：什么值得保存，什么必须允许它继续变化。',
    resourcePackId: 'pack-archive',
    signalTags: ['research', 'media', 'spatial', 'ecology'],
    knownNpcIds: ['contact-m', 'contact-chen'],
    firstProjectPrompt: '从一条蝴蝶与植物之间的关系开始，不要急着把整个森林保存下来。',
    startingNotes: ['一盒标签不完整的植物标本', '两段林下空间扫描', '蝴蝶观察表：时间、天气、海拔、寄主植物', '只能带走记录，不能带走活体'],
    blueprintSeed: ['project-question', 'nature-plant-specimen', 'nature-spatial-scan', 'nature-butterfly-observation', 'nature-decay-rule', 'prod-projector'],
    memoryMoments: ['扫描缺口第一次被当成材料', '一只蝴蝶没有被保存，只留下与植物和季节的关系', '观众靠近时花园不是更清楚，而是开始改变']
  }
];

export const outputDemoBriefs: DemoBrief[] = [
  { id: 'brief-live-minimum', routeIds: ['demo-route-live-system'], title: '先让一个东西运行', hook: '不要做完整视觉。先证明一条输入 → 处理 → 输出链。', decision: '先牺牲什么，换取一个真正能跑的版本？', constraints: ['30 分钟', '只能用现有设备'], rewards: ['第一个运行证据', '最小 Blueprint'], blueprintNodes: ['project-question', 'prod-render-pc', 'prod-projector'] },
  { id: 'brief-live-blackbox', routeIds: ['demo-route-live-system'], title: '两小时黑盒', hook: '今晚撤场后空两小时。你只能验证一个问题。', decision: '测试观看距离、信号稳定还是输出结构？', constraints: ['120 分钟', '没有备用机', '网络不稳定'], rewards: ['场地 Note', '真实故障 Evidence'], blueprintNodes: ['prod-setup-window', 'prod-power', 'prod-technician'] },
  { id: 'brief-live-scope', routeIds: ['demo-route-live-system'], title: '删掉三分之一', hook: '当前版本节点太多，搭建窗口不允许它完整出现。', decision: '删功能、降输出，还是把实时部分改成缓存？', constraints: ['必须缩减 Scope'], rewards: ['Scope 方法', '稳定版本'], blueprintNodes: ['prod-deadline', 'prod-budget'] },
  { id: 'brief-live-public', routeIds: ['demo-route-live-system'], title: '第一次公开', hook: '观众已经进来了，项目不再只是测试工程。', decision: '保住稳定、保住互动，还是接受一次可见的失败？', constraints: ['不能停机重装'], rewards: ['公开输出', '人物反馈', 'Career Record'], blueprintNodes: ['field-note'] },

  { id: 'brief-butterfly-first-record', routeIds: ['demo-route-costa-rica-butterfly-scholar'], title: '第一条观察记录', hook: '学者没有先给你看最漂亮的蝴蝶，而是一张有时间、天气、海拔和寄主植物的观察表。', decision: '你先追踪物种、植物，还是它们发生关系的时间？', constraints: ['不能删掉不确定字段'], rewards: ['观察 Method', 'Ecology Fragment'], blueprintNodes: ['nature-butterfly-observation', 'nature-field-metadata'] },
  { id: 'brief-butterfly-specimen', routeIds: ['demo-route-costa-rica-butterfly-scholar'], title: '一片叶子应该保存什么', hook: '标本已经干燥、变色、失去气味，但仍携带地点与时间。', decision: '保存形态、保存关系，还是保存变化过程？', constraints: ['不能采集新的活体', '标签不完整'], rewards: ['植物保存 Method', '缺失标签 Thread'], blueprintNodes: ['nature-plant-specimen', 'nature-field-metadata'] },
  { id: 'brief-butterfly-scan', routeIds: ['demo-route-costa-rica-butterfly-scholar'], title: '扫描总会漏掉一些东西', hook: '薄叶、细枝和反光表面在空间扫描里不断破碎。', decision: '修复缺口、保留缺口，还是让缺口随时间扩大？', constraints: ['只有两次现场扫描'], rewards: ['扫描残片 Method', 'Decay Rule'], blueprintNodes: ['nature-spatial-scan', 'nature-decay-rule'] },
  { id: 'brief-butterfly-absence', routeIds: ['demo-route-costa-rica-butterfly-scholar'], title: '今天没有蝴蝶', hook: '你等了一整天，目标物种没有出现。', decision: '拿旧数据补上，还是把缺席本身记录下来？', constraints: ['不能伪造当日观察'], rewards: ['缺席 Fragment', '时间方法'], blueprintNodes: ['nature-season-cycle', 'field-note'] },
  { id: 'brief-butterfly-public', routeIds: ['demo-route-costa-rica-butterfly-scholar'], title: '观众走进花园', hook: '如果靠近只是“触发更多粒子”，这件事很快就会变得无聊。', decision: '靠近时揭示、扰动，还是让部分记录开始消失？', constraints: ['互动必须改变作品逻辑'], rewards: ['观众行为 Method', '第一次公开版本'], blueprintNodes: ['nature-presence-input', 'nature-decay-rule', 'prod-projector'] },

  { id: 'brief-archive-failure', routeIds: ['demo-route-live-system', 'demo-route-costa-rica-butterfly-scholar'], title: '失败文件不是垃圾', hook: '你正准备删掉一个坏版本。', decision: '删除、归档，还是 Fork 成新的作品分支？', constraints: ['只能选一种默认处理规则'], rewards: ['Blueprint Lineage', '失败 Evidence'], blueprintNodes: ['field-note'] },
  { id: 'brief-one-page', routeIds: ['demo-route-live-system', 'demo-route-costa-rica-butterfly-scholar'], title: '一页版本', hook: '一个机构只愿意花一分钟理解你现在在做什么。', decision: '用哪三条 Evidence 证明项目已经存在？', constraints: ['只允许三条证据'], rewards: ['Open Call Package'], blueprintNodes: ['prod-storyboard'] },
  { id: 'brief-resource-gap', routeIds: ['demo-route-live-system', 'demo-route-costa-rica-butterfly-scholar'], title: '缺的东西不在你手里', hook: '图纸成立，但关键设备、数据或人不属于你。', decision: '借、租、替换，还是重写作品结构？', constraints: ['资源可获得性有限'], rewards: ['Availability Note', '人物关系'], blueprintNodes: ['prod-budget'] }
];

export const outputDemoEvents: DemoEvent[] = [
  { id: 'demo-evt-black-frame', title: '黑屏 12 秒', hook: '开场最不该黑的时候黑了。', tags: ['failure', 'public'], choices: [{ label: '立刻切备用', consequence: '稳定性提高，但失去当前互动状态。' }, { label: '让黑屏继续', consequence: '保留现场连续性，但机构会追问是否可控。' }] },
  { id: 'demo-evt-scope-plus', title: '“顺便再加一个”', hook: '对方说这个功能应该不复杂。', tags: ['scope'], choices: [{ label: '明确拒绝', consequence: 'Scope 保持，关系短期变硬。' }, { label: '接受，但删掉另一项', consequence: '项目结构改变并留下承诺记录。' }] },
  { id: 'demo-evt-network-drop', title: '网络掉了', hook: '实时数据源消失。', tags: ['network', 'failure'], choices: [{ label: '切缓存数据', consequence: '作品继续运行，但实时性被改变。' }, { label: '保留无数据状态', consequence: '风险更高，失联成为作品状态。' }] },
  { id: 'demo-evt-projector-shadow', title: '投影能打到，人也站在那里', hook: '技术位置与观看位置重叠。', tags: ['projection', 'site'], choices: [{ label: '缩小画面', consequence: '尺寸缩水但结构稳定。' }, { label: '改变观看路线', consequence: '空间关系改变，搭建成本增加。' }] },
  { id: 'demo-evt-final-v7', title: 'final_final_v7_REAL', hook: '现场跑的不是你以为的最终版。', tags: ['version', 'archive'], choices: [{ label: '回滚', consequence: '恢复旧状态。' }, { label: '承认当前版本', consequence: '版本谱系变复杂。' }] },
  { id: 'demo-evt-label-missing', title: '标本标签缺了一半', hook: '一株植物只剩名字，没有采集日期。', tags: ['ecology', 'archive'], choices: [{ label: '标记未知', consequence: '数据不完整但诚实。' }, { label: '根据邻近记录推断', consequence: '结构更完整，同时新增不确定性。' }] },
  { id: 'demo-evt-scan-hole', title: '叶片边缘消失了', hook: '扫描无法稳定捕捉薄叶。', tags: ['scan', 'failure'], choices: [{ label: '算法补洞', consequence: '空间更完整，但生成部分不再来自现场。' }, { label: '保留破损', consequence: '缺口进入作品语言。' }] },
  { id: 'demo-evt-butterfly-absence', title: '今天没有蝴蝶', hook: '观察点没有出现目标物种。', tags: ['ecology', 'time'], choices: [{ label: '使用旧观察数据', consequence: '内容增加，但跨时间混合。' }, { label: '记录缺席', consequence: 'Archive 获得一条“没有发生”的记录。' }] },
  { id: 'demo-evt-season-shift', title: '季节比计划早了', hook: '植物状态和历史记录对不上。', tags: ['season', 'ecology'], choices: [{ label: '沿历史时间线', consequence: '可比性更高。' }, { label: '让当前季节覆盖', consequence: '作品更接近当下生态状态。' }] },
  { id: 'demo-evt-audience-too-close', title: '观众贴得太近', hook: '传感系统持续触发。', tags: ['audience', 'sensor'], choices: [{ label: '增加冷却', consequence: '互动更稳定。' }, { label: '让过度靠近触发衰减', consequence: '身体距离变成作品规则。' }] },
  { id: 'demo-evt-media-misread', title: '帖子给你贴了一个方便传播的标签', hook: '一句话比作品更快抵达下一个机构。', tags: ['identity', 'media'], choices: [{ label: '公开纠正', consequence: '解释更清楚但传播下降。' }, { label: '不回应', consequence: '误读继续影响机会。' }] },
  { id: 'demo-evt-old-adapter', title: '旧转接头救了现场', hook: '你几次想扔掉的线材成为唯一接口。', tags: ['asset', 'recovery'], choices: [{ label: '继续用', consequence: '现场得救，同时留下脆弱性。' }, { label: '找正式替代', consequence: '增加成本，获得可靠路径。' }] }
];

export const outputDemoArchive: DemoArchiveEntry[] = [
  { id: 'archive-ecology-host-plant', category: 'ECOLOGY', title: '寄主植物不是背景', summary: '蝴蝶与植物之间不是装饰关系，而是一套生命史条件。', fragments: ['出现时间', '寄主关系', '海拔与天气', '观察缺席'], tags: ['butterfly', 'plant', 'relation'] },
  { id: 'archive-ecology-absence', category: 'ECOLOGY', title: '缺席也是记录', summary: '长期观察并不保证每天都有事件。没有出现本身会改变你对季节和分布的理解。', fragments: ['零记录', '季节', '天气', '等待'], tags: ['absence', 'time'] },
  { id: 'archive-method-scan-gap', category: 'METHODS', title: '扫描缺口', summary: '重建失败的位置可以修补，也可以被承认为媒介边界。', fragments: ['薄叶', '反光', '运动', '算法补洞'], tags: ['scan', 'failure'] },
  { id: 'archive-method-preservation', category: 'METHODS', title: '保存不是冻结', summary: '植物标本、图像、坐标和扫描都只是不同保存制度，每一种都会主动丢掉东西。', fragments: ['压制标本', '颜色变化', '标签', '数字副本'], tags: ['preservation', 'plant'] },
  { id: 'archive-media-scan', category: 'MEDIA', title: '空间扫描', summary: '扫描不是无损复制；遮挡、材质、运动和精度决定数字空间会留下什么。', fragments: ['点云', '高斯', '缺口', '坐标'], tags: ['scan', 'spatial'] },
  { id: 'archive-project-first-run', category: 'PROJECTS', title: '第一个能跑的版本', summary: '第一次真正运行的版本通常很小，但它为后续所有判断提供了共同对象。', fragments: ['输入', '处理', '输出', '第一次失败'], tags: ['prototype', 'run'] },
  { id: 'archive-people-scholar', category: 'PEOPLE', title: '哥斯达黎加的蝴蝶学者', summary: '他关心的不是把蝴蝶做成图像，而是观察记录里那些物种、植物、时间和地点之间的关系。', fragments: ['观察表', '寄主植物', '季节', '未知字段'], tags: ['ecology', 'research'] },
  { id: 'archive-place-blackbox', category: 'PLACES', title: '两小时黑盒', summary: '一个时间很短、条件明确的测试现场。它的价值不是“像展览”，而是能快速暴露桌面上看不到的问题。', fragments: ['120 分钟', '投影', '网络', '恢复'], tags: ['blackbox', 'test'] }
];

export function demoRouteById(id?: string | null) {
  return outputDemoRoutes.find((item) => item.id === id) || outputDemoRoutes[0];
}

export function demoBriefsForRoute(routeId: string) {
  return outputDemoBriefs.filter((item) => item.routeIds.includes(routeId));
}
