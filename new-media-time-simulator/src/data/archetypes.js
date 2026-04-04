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
      { label: '一个切开时代表皮的黑色寓言', weights: { critique: 2, academia: 1 } },
      { label: '一个能活下来并继续扩展的项目生态', weights: { commerce: 2, production: 1 } }
    ]
  }
];

export const archetypes = [
  {
    id: 'field-critic',
    name: '场域批评师',
    shell: '当代艺术 / 文本驱动',
    description: '擅长把现实困境转成概念武器，靠问题意识换取合法性，但容易陷入过度自反。',
    tags: ['当代艺术', '批评写作', '学术场域'],
    specialtySlot: 'special',
    passive: '第一次与学术类 NPC 相遇时，额外获得 1 点声望。',
    startingStats: { insight: 11, funds: 7, reputation: 8, stamina: 9, anxiety: 6, archive: 10, network: 7, tech: 5 },
    starterSkills: ['skill_curatorial_black_speech', 'skill_archive_salvage', 'skill_risk_humor']
  },
  {
    id: 'spatial-engineer',
    name: '空间叙事工程师',
    shell: '沉浸空间 / 现场导演',
    description: '把影像、灯光、声音和身体路线揉成一个整体，适合做大型空间体验，但很烧体力和预算。',
    tags: ['沉浸式', '空间计算', '大空间'],
    specialtySlot: 'special',
    passive: '在空间类地图中行动时，额外获得 1 点洞察。',
    startingStats: { insight: 10, funds: 8, reputation: 7, stamina: 11, anxiety: 5, archive: 6, network: 8, tech: 8 },
    starterSkills: ['skill_spatial_sensing', 'skill_signal_direction', 'skill_soft_armor']
  },
  {
    id: 'code-nomad',
    name: '代码游民',
    shell: '创意编程 / 开源系统',
    description: '以工具、协议和自动化思维推动创作，容易在凌晨三点和 bug 形成长期婚姻关系。',
    tags: ['代码原生', '工具链', '开源'],
    specialtySlot: 'special',
    passive: '研发队列完成时，额外获得 1 点技术值。',
    startingStats: { insight: 9, funds: 8, reputation: 6, stamina: 9, anxiety: 7, archive: 7, network: 6, tech: 11 },
    starterSkills: ['skill_pipeline_bricolage', 'skill_node_forging', 'skill_cache_diving']
  },
  {
    id: 'commercial-alchemist',
    name: '商业影像炼金师',
    shell: '品牌项目 / 视觉执行',
    description: '把预算、审美和截止日期炼成可交付成果，现实感强，但有时会怀疑自己是不是在给 KPI 做祭祀。',
    tags: ['商业项目', '执行', '品牌'],
    specialtySlot: 'special',
    passive: '每完成一个商业类项目，额外获得 3 资金。',
    startingStats: { insight: 8, funds: 11, reputation: 7, stamina: 10, anxiety: 6, archive: 5, network: 9, tech: 7 },
    starterSkills: ['skill_budget_necromancy', 'skill_client_mask', 'skill_soft_armor']
  },
  {
    id: 'architecture-medium',
    name: '建筑感知师',
    shell: '建筑背景 / 多媒体展示',
    description: '擅长将空间结构、叙事和展示逻辑结合，能从建筑尺度推回观众感受。',
    tags: ['建筑', '展示设计', '空间感知'],
    specialtySlot: 'special',
    passive: '在需要动线或展示结构的项目中，研发时间 -1。',
    startingStats: { insight: 10, funds: 8, reputation: 7, stamina: 10, anxiety: 5, archive: 8, network: 7, tech: 8 },
    starterSkills: ['skill_wayfinding_frame', 'skill_material_memory', 'skill_field_notebook']
  },
  {
    id: 'residency-smuggler',
    name: '驻留走私客',
    shell: '跨地域协作 / 资源迁移',
    description: '穿梭于项目、机构和临时关系之间，把信息差变成机会，但稳定性不高。',
    tags: ['驻留', '跨地域', '流动'],
    specialtySlot: 'special',
    passive: '每解锁一个新区域，额外获得 1 关系值。',
    startingStats: { insight: 9, funds: 8, reputation: 8, stamina: 8, anxiety: 6, archive: 6, network: 11, tech: 6 },
    starterSkills: ['skill_portable_reputation', 'skill_open_call_hack', 'skill_risk_humor']
  }
];
