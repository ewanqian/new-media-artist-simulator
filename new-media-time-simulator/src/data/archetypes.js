export const assessmentQuestions = [
  {
    id: 'q1',
    title: '当你拿到一个模糊的新项目时，你第一反应是？',
    options: [
      { label: '先画空间逻辑和动线，搞清楚身体怎么进入', weights: { spatial: 2, architecture: 2 } },
      { label: '先拆技术链路和实时系统，看看什么能跑通', weights: { code: 2, systems: 2 } },
      { label: '先研究概念和文本，确保问题意识够狠', weights: { critique: 2, academia: 2 } },
      { label: '先想客户、传播和预算，别让项目死在立项前', weights: { commerce: 2, production: 2 } }
    ]
  },
  {
    id: 'q2',
    title: '你最害怕哪一种失败？',
    options: [
      { label: '概念太空，像一堆术语拼装品', weights: { critique: 2, academia: 1 } },
      { label: '技术掉链子，现场一片黑屏', weights: { code: 2, systems: 1 } },
      { label: '空间没感觉，观众只是路过拍照', weights: { spatial: 2, architecture: 1 } },
      { label: '项目赔钱，还被甲方说“再梦幻一点”', weights: { commerce: 2, production: 2 } }
    ]
  },
  {
    id: 'q3',
    title: '你理想中的作品状态更接近？',
    options: [
      { label: '一个会自己生长的系统或协议', weights: { systems: 2, code: 1 } },
      { label: '一个能改变人对空间感知的现场', weights: { spatial: 2, architecture: 1 } },
      { label: '一个切开表皮的黑色寓言', weights: { critique: 2, academia: 1 } },
      { label: '一个能活下来并继续扩展的项目生态', weights: { commerce: 2, production: 1 } }
    ]
  }
];

const ARCHETYPE_SCORE_MAP = {
  'research-writing': ['critique', 'academia'],
  'spatial-practice': ['spatial', 'architecture'],
  'systems-author': ['code', 'systems'],
  'production-producer': ['commerce', 'production'],
  'exhibition-narrative': ['architecture', 'spatial'],
  'media-critique': ['critique', 'academia'],
  'nomadic-applicant': ['production', 'academia'],
  'social-intervention': ['critique', 'social']
};

export const archetypes = [
  {
    id: 'research-writing',
    name: '研究写作者',
    background: '媒介批评 / 理论写作',
    description: '擅长把现实困境转成问题意识，靠清晰的思想换取合法性，但容易陷入过度自反而难以出手。',
    tags: ['批评理论', '文本工作', '学术场域'],
    specialtySlot: 'special',
    passive: '第一次与学术类关系人物相遇时，额外获得 1 点名声。',
    startingStats: { insight: 11, funds: 7, reputation: 8, stamina: 9, anxiety: 6, archive: 10, network: 7, tech: 5 },
    starterSkills: ['skill_curatorial_black_speech', 'skill_archive_salvage', 'skill_risk_humor'],
    practice: {
      definition: '以问题意识、文本工作和理论梳理为核心的实践路径',
      commonProjects: ['论文写作', '方法论重写', '批评文本生产', '展览策展', '概念梳理'],
      commonResources: ['insight', 'archive', 'reputation'],
      commonPeople: ['王教授', '文本同辈', '杂志编辑'],
      commonFailure: '观念很清楚，但技术跟不上，项目永远在"下一步"',
      commonRecovery: '把写作本身当成作品发表，接受"纸上谈兵"也是一种实践'
    }
  },
  {
    id: 'spatial-practice',
    name: '空间实践者',
    background: '沉浸现场 / 空间叙事',
    description: '把影像、灯光、声音和身体路线揉成一个整体经验，适合做大型空间体验，但很消耗体力和预算。',
    tags: ['沉浸', '空间计算', '现场'],
    specialtySlot: 'special',
    passive: '在空间类场域中行动时，额外获得 1 点洞察。',
    startingStats: { insight: 10, funds: 8, reputation: 7, stamina: 11, anxiety: 5, archive: 6, network: 8, tech: 8 },
    starterSkills: ['skill_spatial_sensing', 'skill_signal_direction', 'skill_soft_armor'],
    practice: {
      definition: '关注空间、动线、观众身体、场所气氛，做沉浸式现场',
      commonProjects: ['空间装置', '展览现场', '沉浸式作品', '建筑介入'],
      commonResources: ['stamina', 'insight', 'reputation'],
      commonPeople: ['空间建筑师', '设备师', '策展人'],
      commonFailure: '预算花完了，气氛还是不对',
      commonRecovery: '撤展后回收材料，把失败片段做成文献作品'
    }
  },
  {
    id: 'systems-author',
    name: '系统作者',
    background: '代码原生 / 开放系统',
    description: '以工具、协议和自动化思维推动创作，容易在凌晨三点和 bug 形成长期共存关系。',
    tags: ['代码原生', '工具开发', '开源'],
    specialtySlot: 'special',
    passive: '在制项目完成时，额外获得 1 点技术值。',
    startingStats: { insight: 9, funds: 8, reputation: 6, stamina: 9, anxiety: 7, archive: 7, network: 6, tech: 11 },
    starterSkills: ['skill_pipeline_bricolage', 'skill_node_forging', 'skill_cache_diving'],
    practice: {
      definition: '从系统和代码出发思考创作，关注生成规则、开放性和自动化',
      commonProjects: ['互动系统', '生成作品', '工具开发', '软件艺术'],
      commonResources: ['tech', 'archive', 'funds'],
      commonPeople: ['开源黑客', '软件工程师', '新媒体同伴'],
      commonFailure: '系统跑通了，但作品没灵魂',
      commonRecovery: '把系统本身当成作品展出'
    }
  },
  {
    id: 'production-producer',
    name: '项目型生产者',
    background: '品牌项目 / 视觉执行',
    description: '把预算、审美和截止日期炼成可交付成果，现实感强，但有时会怀疑自己是不是在给 KPI 献祭创造力。',
    tags: ['商业项目', '执行', '品牌'],
    specialtySlot: 'special',
    passive: '每完成一个商业类项目，额外获得 3 资金。',
    startingStats: { insight: 8, funds: 11, reputation: 7, stamina: 10, anxiety: 6, archive: 5, network: 9, tech: 7 },
    starterSkills: ['skill_budget_necromancy', 'skill_client_mask', 'skill_soft_armor'],
    practice: {
      definition: '以交付、提案、协作为核心，持续生产各种尺度的作品',
      commonProjects: ['品牌空间', '委托项目', '快速落地', '客户提案'],
      commonResources: ['funds', 'network', 'reputation'],
      commonPeople: ['甲方联系人', '制作人', '场地协调员'],
      commonFailure: '交付完成了，你再也不想看这个作品一眼',
      commonRecovery: '抽成足够，下次就能做一件自己的'
    }
  },
  {
    id: 'exhibition-narrative',
    name: '展示叙事实践者',
    background: '建筑背景 / 多媒体展示',
    description: '擅长将空间结构、叙事和展示逻辑结合，能从建筑尺度推回观众感受。',
    tags: ['建筑', '展示设计', '空间感知'],
    specialtySlot: 'special',
    passive: '在需要动线或展示结构的项目中，工作单位 -1。',
    startingStats: { insight: 10, funds: 8, reputation: 7, stamina: 10, anxiety: 5, archive: 8, network: 7, tech: 8 },
    starterSkills: ['skill_wayfinding_frame', 'skill_material_memory', 'skill_field_notebook'],
    practice: {
      definition: '整合建筑尺度、多媒体语言和叙事逻辑做展示',
      commonProjects: ['展览空间设计', '媒体建筑', '展厅叙事', '双年展空间'],
      commonResources: ['archive', 'insight', 'tech'],
      commonPeople: ['建筑师', '展陈设计师', '策展人'],
      commonFailure: '空间很帅，作品没地方放了',
      commonRecovery: '作品变成空间的一部分，这本来就是你的追求'
    }
  },
  {
    id: 'media-critique',
    name: '媒介反思者',
    background: '媒介批评 / 技术反思',
    description: '追问媒介本身的权力结构，让观众重新看见观看方式，作品常常就是一篇能行走的论文。',
    tags: ['媒介理论', '批评', '文本'],
    specialtySlot: 'special',
    passive: '完成研究类项目后，额外获得 1 点档案。',
    startingStats: { insight: 12, funds: 6, reputation: 8, stamina: 8, anxiety: 7, archive: 11, network: 6, tech: 4 },
    starterSkills: ['skill_critique_method', 'skill_archive_salvage', 'skill_risk_humor'],
    practice: {
      definition: '对媒介本身进行反思，作品就是批评',
      commonProjects: ['理论写作', '媒介批评', '展览文本', '档案整理'],
      commonResources: ['archive', 'insight', 'reputation'],
      commonPeople: ['期刊编辑', '理论同行', '策展人'],
      commonFailure: '批评很准，自己不做作品',
      commonRecovery: '批评本身就是你的作品'
    }
  },
  {
    id: 'nomadic-applicant',
    name: '游牧申请者',
    background: '跨地域游牧 / 项目驱动',
    description: '穿梭于驻留、开放-call、不同机构之间，把空间差变成机会，但稳定性不容易维持。',
    tags: ['驻留', '跨地域', '流动'],
    specialtySlot: 'special',
    passive: '每解锁一个新场域，额外获得 1 关系值。',
    startingStats: { insight: 9, funds: 8, reputation: 8, stamina: 8, anxiety: 6, archive: 6, network: 11, tech: 6 },
    starterSkills: ['skill_portable_reputation', 'skill_open_call_hack', 'skill_risk_humor'],
    practice: {
      definition: '一直在路上，在不同场域之间移动收集机会',
      commonProjects: ['驻留申请', '公开征集', '移动创作', '工作坊'],
      commonResources: ['network', 'archive', 'reputation'],
      commonPeople: ['驻留管理员', '同场艺术家', '当地组织者'],
      commonFailure: '一直在申请，没停下来做自己的东西',
      commonRecovery: '把申请过程本身变成创作记录'
    }
  },
  {
    id: 'social-intervention',
    name: '社会介入者',
    background: '公共议题 / 社群协作',
    description: '把创作锚定在具体社会议题上，和非艺术群体协作完成，作品就是过程本身。',
    tags: ['公共', '协作', '社会议题'],
    specialtySlot: 'special',
    passive: '和社群相关项目完成后，额外获得 2 关系。',
    startingStats: { insight: 10, funds: 6, reputation: 9, stamina: 9, anxiety: 6, archive: 7, network: 12, tech: 4 },
    starterSkills: ['skill_collective_action', 'skill_context_listening', 'skill_emergency_meetup'],
    practice: {
      definition: '锚定具体社会议题，和社群协作完成作品',
      commonProjects: ['社区项目', '公共介入', '协作创作', '议题工作坊'],
      commonResources: ['network', 'reputation', 'insight'],
      commonPeople: ['社群伙伴', '当地组织者', 'NGO 合作者'],
      commonFailure: '热情耗光，议题没推动你先 burnout',
      commonRecovery: '过程已经改变关系，这就是作品'
    }
  }
];

export const getRecommendedArchetype = (answers) => {
  const totals = {};
  answers.forEach(({ weights }) => {
    Object.entries(weights).forEach(([key, value]) => {
      totals[key] = (totals[key] || 0) + value;
    });
  });

  let winner = archetypes[0].id;
  let highScore = -Infinity;

  archetypes.forEach((archetype) => {
    const keys = ARCHETYPE_SCORE_MAP[archetype.id] || [];
    const score = keys.reduce((sum, key) => sum + (totals[key] || 0), 0);
    if (score > highScore) {
      highScore = score;
      winner = archetype.id;
    }
  });

  return winner;
};
