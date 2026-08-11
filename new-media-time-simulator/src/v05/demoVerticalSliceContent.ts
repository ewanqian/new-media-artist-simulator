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
    code: 'BUTTERFLY SCHOLAR',
    title: '哥斯达黎加的蝴蝶学者',
    subtitle: '一次关于采集、记忆、身份与情感空间数字化的旅程',
    summary: '你本人是一位以蝴蝶、寄主植物、空间扫描和长期观察为材料的艺术家。工作室收到一份哥斯达黎加研究站的短期邀请，你决定离开熟悉的工作室，去验证“数字化到底应该保存什么”。旅程中，你会采集、重建、做作品，也会遇到一个你以前听说过、却没有完全说清自己身份的人。',
    resourcePackId: 'pack-archive',
    signalTags: ['research', 'media', 'spatial', 'ecology', 'narrative'],
    knownNpcIds: ['contact-m'],
    firstProjectPrompt: '先选一个关系去采集：蝴蝶、寄主植物、空间路径，或者一次没有发生的观察。',
    startingNotes: ['工作室艺术顾问发来的研究站邀请', '一台相机与可做深度扫描的设备', '旧植物扫描项目的工作文件', '一个尚未回答的问题：保存是不是等于冻结'],
    blueprintSeed: ['project-question', 'butterfly-observation', 'plant-specimen', 'capture-photo-sequence', 'capture-quality-check', 'process-metashape-align', 'process-gaussian-splat', 'compose-memory-garden'],
    memoryMoments: ['第一次发现采集对象比扫描软件更重要', '扫描缺口被保留下来而不是自动修掉', 'Inés 的身份说法出现矛盾', '一次私人关系选择改变了公开作品的数据边界']
  }
];

export const outputDemoBriefs: DemoBrief[] = [
  { id: 'brief-live-minimum', routeIds: ['demo-route-live-system'], title: '先让一个东西运行', hook: '不要做完整视觉。先证明一条输入 → 处理 → 输出链。', decision: '先牺牲什么，换取一个真正能跑的版本？', constraints: ['30 分钟', '只能用现有设备'], rewards: ['第一个运行证据', '最小 Blueprint'], blueprintNodes: ['project-question', 'prod-render-pc', 'prod-projector'] },
  { id: 'brief-live-blackbox', routeIds: ['demo-route-live-system'], title: '两小时黑盒', hook: '今晚撤场后空两小时。你只能验证一个问题。', decision: '测试观看距离、信号稳定还是输出结构？', constraints: ['120 分钟', '没有备用机', '网络不稳定'], rewards: ['场地 Note', '真实故障 Evidence'], blueprintNodes: ['prod-setup-window', 'prod-power', 'prod-technician'] },
  { id: 'brief-live-scope', routeIds: ['demo-route-live-system'], title: '删掉三分之一', hook: '当前版本节点太多，搭建窗口不允许它完整出现。', decision: '删功能、降输出，还是把实时部分改成缓存？', constraints: ['必须缩减 Scope'], rewards: ['Scope 方法', '稳定版本'], blueprintNodes: ['prod-deadline', 'prod-budget'] },
  { id: 'brief-live-public', routeIds: ['demo-route-live-system'], title: '第一次公开', hook: '观众已经进来了，项目不再只是测试工程。', decision: '保住稳定、保住互动，还是接受一次可见的失败？', constraints: ['不能停机重装'], rewards: ['公开输出', '人物反馈', 'Career Record'], blueprintNodes: ['field-note'] },

  { id: 'brief-butterfly-departure', routeIds: ['demo-route-costa-rica-butterfly-scholar'], title: '出发以前先留一句话', hook: '你的艺术顾问不要求完整提案，只让你决定：这趟旅程真正要验证什么？', decision: '带着明确问题出发，还是允许现场先改变你？', constraints: ['不能把“扫描整个森林”当目标'], rewards: ['Project Question', '第一条人物记忆'], blueprintNodes: ['project-question'] },
  { id: 'brief-butterfly-first-record', routeIds: ['demo-route-costa-rica-butterfly-scholar'], title: '先选一个关系', hook: '第一次进入样地。你不需要采完整个环境，只需要让一条关系开始变得可追踪。', decision: '从寄主植物、空间路径，还是“今天没有出现”的观察开始？', constraints: ['对象必须可追踪', '不伪造缺失信息'], rewards: ['Field Method', 'Ecology Fragment'], blueprintNodes: ['butterfly-observation', 'plant-specimen', 'capture-photo-sequence'] },
  { id: 'brief-butterfly-capture', routeIds: ['demo-route-costa-rica-butterfly-scholar'], title: '先采对，再谈重建', hook: '薄叶、风、反光和变化的光照开始破坏漂亮的扫描。', decision: '补拍、换采集方法，还是承认部分表面不会被完整捕捉？', constraints: ['现场时间有限'], rewards: ['Capture Check', 'Scan Gap Evidence'], blueprintNodes: ['capture-photo-sequence', 'capture-lidar-pass', 'capture-quality-check'] },
  { id: 'brief-butterfly-reconstruct', routeIds: ['demo-route-costa-rica-butterfly-scholar'], title: '照片并不会自动变成空间', hook: '回到临时工作台，你必须先判断相机有没有被正确求解，再选点云、网格或高斯。', decision: 'Metashape / COLMAP 先求稳，还是直接走快速高斯预览？', constraints: ['错误的相机位姿不能被“艺术化”掩盖'], rewards: ['Reconstruction Method', 'Blueprint Branch'], blueprintNodes: ['process-metashape-align', 'process-colmap-sfm', 'process-dense-reconstruction', 'process-gaussian-splat'] },
  { id: 'brief-butterfly-gap', routeIds: ['demo-route-costa-rica-butterfly-scholar'], title: '缺口是不是错误', hook: '薄叶边缘和一小块空间始终重建不出来。', decision: '修补、删除，还是把缺口变成作品方法？', constraints: ['必须说明为什么'], rewards: ['Preserve Gap Method', 'Archive Evidence'], blueprintNodes: ['process-point-clean', 'method-preserve-gap'] },
  { id: 'brief-butterfly-ines', routeIds: ['demo-route-costa-rica-butterfly-scholar'], title: '她没有完全说谎', hook: 'Inés 的组织身份与第一次介绍对不上。与此同时，你们的合作已经开始变得私人。', decision: '现在追问、继续观察，还是在知道真相后只保留专业关系？', constraints: ['人物会记住你怎么处理这次矛盾'], rewards: ['Narrative Memory', 'Data Rights Thread'], blueprintNodes: ['field-note'] },
  { id: 'brief-butterfly-compose', routeIds: ['demo-route-costa-rica-butterfly-scholar'], title: '从数据回到作品', hook: '如果最后只是展示一段漂亮高斯扫描，这趟旅程没有真正改变你的实践。', decision: '让作品围绕空间、关系、时间还是缺席组织？', constraints: ['互动必须改变作品逻辑'], rewards: ['Memory Garden', 'Public Version'], blueprintNodes: ['compose-memory-garden', 'nature-decay-rule', 'prod-projector'] },
  { id: 'brief-butterfly-archive', routeIds: ['demo-route-costa-rica-butterfly-scholar'], title: '有些东西不应该全部公开', hook: '研究站、Inés 和你自己的工作记录里都有不适合无限复制的部分。', decision: '公开什么、保留什么、只留下关系还是留下原始数据？', constraints: ['不能默认所有数据都属于作品'], rewards: ['Career Archive', 'Selective Preservation Method'], blueprintNodes: ['compose-memory-garden', 'field-note'] }
];

export const outputDemoEvents: DemoEvent[] = [
  { id: 'demo-evt-black-frame', title: '黑屏 12 秒', hook: '开场最不该黑的时候黑了。', tags: ['failure', 'public'], choices: [{ label: '立刻切备用', consequence: '稳定性提高，但失去当前互动状态。' }, { label: '让黑屏继续', consequence: '保留现场连续性，但机构会追问是否可控。' }] },
  { id: 'demo-evt-scope-plus', title: '“顺便再加一个”', hook: '对方说这个功能应该不复杂。', tags: ['scope'], choices: [{ label: '明确拒绝', consequence: 'Scope 保持，关系短期变硬。' }, { label: '接受，但删掉另一项', consequence: '项目结构改变并留下承诺记录。' }] },
  { id: 'demo-evt-network-drop', title: '网络掉了', hook: '实时数据源消失。', tags: ['network', 'failure'], choices: [{ label: '切缓存数据', consequence: '作品继续运行，但实时性被改变。' }, { label: '保留无数据状态', consequence: '失联成为作品状态。' }] },
  { id: 'demo-evt-final-v7', title: 'final_final_v7_REAL', hook: '现场跑的不是你以为的最终版。', tags: ['version', 'archive'], choices: [{ label: '回滚', consequence: '恢复旧状态。' }, { label: '承认当前版本', consequence: '版本谱系变复杂。' }] },
  { id: 'demo-evt-scan-hole', title: '叶片边缘消失了', hook: '薄叶始终无法稳定重建。', tags: ['scan', 'failure'], choices: [{ label: '重新采集', consequence: '增加现场时间，换取更可靠输入。' }, { label: '保留破损', consequence: '缺口进入作品方法。' }] },
  { id: 'demo-evt-light-shift', title: '云层突然散开', hook: '同一对象前后照片的光照差异明显增大。', tags: ['capture', 'light'], choices: [{ label: '等待光线稳定', consequence: '采集时间增加。' }, { label: '继续记录变化', consequence: '重建风险增加，但时间变化进入档案。' }] },
  { id: 'demo-evt-no-butterfly', title: '今天没有蝴蝶', hook: '目标物种没有出现。', tags: ['ecology', 'time'], choices: [{ label: '记录缺席', consequence: 'Archive 得到一条“没有发生”的记录。' }, { label: '延长观察', consequence: '时间成本增加，但可能得到新的关系。' }] },
  { id: 'demo-evt-identity-mark', title: '文件上的组织标记不一样', hook: 'Inés 的现场文件与邀请函不是同一个组织。', tags: ['narrative', 'identity'], choices: [{ label: '直接问', consequence: '更快获得信息，也可能降低信任。' }, { label: '先记下来', consequence: '矛盾进入 Narrative State，等待后续验证。' }] },
  { id: 'demo-evt-data-rights', title: '扫描数据到底属于谁', hook: '研究站并没有默认同意原始数据无限公开。', tags: ['archive', 'rights'], choices: [{ label: '只公开处理后的作品', consequence: '原始数据保持受限。' }, { label: '重新谈授权', consequence: '项目推进变慢，但数据边界更清楚。' }] },
  { id: 'demo-evt-alignment-fail', title: '有一组照片没有对齐', hook: '相机位姿出现断裂。', tags: ['Metashape', 'COLMAP', 'failure'], choices: [{ label: '检查重叠与模糊', consequence: '回到采集质量判断。' }, { label: '换另一条重建路径', consequence: '产生 Blueprint 分支。' }] },
  { id: 'demo-evt-pretty-splat', title: '高斯已经很好看了', hook: '预览顺滑、空间漂亮，但你突然不知道作品还缺什么。', tags: ['Gaussian', 'art'], choices: [{ label: '停下来重写问题', consequence: '减少技术堆叠，强化作品逻辑。' }, { label: '继续增加技术', consequence: '制作复杂度继续上升。' }] },
  { id: 'demo-evt-private-record', title: '一段私人记录不适合公开', hook: '它对你很重要，但并不因此自动属于作品。', tags: ['relationship', 'archive'], choices: [{ label: '只记录它存在', consequence: '保留关系，不公开内容。' }, { label: '征得同意后使用', consequence: '形成新的共同决定与人物记忆。' }] }
];

export const outputDemoArchive: DemoArchiveEntry[] = [
  { id: 'archive-signal-chain', category: 'METHODS', title: '最小信号链', summary: '先证明输入真的改变输出，再谈完整现场。', fragments: ['输入', '处理', '输出', '备用路径'], tags: ['live', 'system'] },
  { id: 'archive-scope', category: 'METHODS', title: '删掉三分之一', summary: 'Scope 缩减不是失败，而是一种制作判断。', fragments: ['时间', '预算', '搭建窗口'], tags: ['scope', 'production'] },
  { id: 'archive-field-capture', category: 'METHODS', title: '采集先于重建', summary: '重叠、视角、光照和对象选择决定后续软件能不能工作。', fragments: ['摄影测量', '现场检查', '重叠'], tags: ['capture', 'photogrammetry'] },
  { id: 'archive-reconstruction', category: 'MEDIA', title: '点云 / 网格 / 高斯不是等级关系', summary: '它们是不同的空间表示方式，需要根据作品选择。', fragments: ['COLMAP', 'Metashape', 'Gaussian Splatting'], tags: ['3d', 'scan'] },
  { id: 'archive-preserve-gap', category: 'METHODS', title: '保留扫描缺口', summary: '不是所有失败都应该被修复。', fragments: ['薄叶', '遮挡', '反光', '不可捕捉'], tags: ['failure', 'method'] },
  { id: 'archive-ines', category: 'PEOPLE', title: 'Inés', summary: '第一次见面时，她没有把自己的组织关系说完整。', fragments: ['身份矛盾', '数据权利', '合作', '私人关系'], tags: ['narrative', 'memory'] },
  { id: 'archive-no-butterfly', category: 'ECOLOGY', title: '今天没有蝴蝶', summary: '没有发生也可以进入长期观察。', fragments: ['时间', '季节', '缺席'], tags: ['ecology', 'absence'] },
  { id: 'archive-memory-garden', category: 'PROJECTS', title: '情感空间数字化', summary: '空间重建、生态观察和人物记忆共同形成作品，而不是只展示扫描结果。', fragments: ['空间', '关系', '时间', '选择性公开'], tags: ['project', 'memory', 'garden'] }
];
