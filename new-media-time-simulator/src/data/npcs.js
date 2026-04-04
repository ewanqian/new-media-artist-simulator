export const npcs = [
  {
    id: 'npc_oldzhang',
    name: '老炮张',
    role: '毒舌前辈',
    locationTags: ['academic', 'studio'],
    lines: [
      'AI 做艺术？那不叫创作，那叫把焦虑外包给显卡。',
      '你这项目看着挺像未来，预算表倒是很像上周的灾难。',
      '别急着证明自己先进，先证明自己没空心。'
    ],
    effects: { insight: 1, anxiety: 1, reputation: 1 }
  },
  {
    id: 'npc_prof_wang',
    name: '王教授',
    role: '学术策展人',
    locationTags: ['academic'],
    lines: [
      'AI 时代最不值钱的是技术，最值钱的是你到底在问什么。',
      '如果一个项目只能解释它用了什么软件，那它还没开始。',
      '你先别自证先锋，先把方法论写清楚。'
    ],
    effects: { archive: 2, reputation: 1 }
  },
  {
    id: 'npc_client_sis',
    name: '甲方姐',
    role: '品牌项目统筹',
    locationTags: ['commercial'],
    lines: [
      '我们很喜欢你的概念，但能不能再“轻一点、亮一点、快一点”？',
      '预算不能加，气质要翻倍，你懂的。',
      '你先别崩，我们真的很重视艺术表达。只是截止时间在明天。'
    ],
    effects: { funds: 2, anxiety: 2, network: 1 }
  },
  {
    id: 'npc_meng',
    name: '孟工',
    role: '现场技术总管',
    locationTags: ['live', 'space'],
    lines: [
      '系统再美，掉帧就是掉帧。',
      '你先把信号链画出来，诗意等通电以后再说。',
      '设备不是你的敌人，想当然才是。'
    ],
    effects: { tech: 2, insight: 1 }
  },
  {
    id: 'npc_open_source_ghost',
    name: '开源幽灵',
    role: '匿名维护者',
    locationTags: ['code', 'studio'],
    lines: [
      '你能 fork 别人的仓库，也要学会继承自己的失败。',
      '真正的工具不是让你更快，而是让你少一点无意义重复。',
      '把技能写成模块，你的人生才不会只有临时方案。'
    ],
    effects: { tech: 1, archive: 1, insight: 1 }
  },
  {
    id: 'npc_residency_admin',
    name: '驻留管理员',
    role: '制度守门人',
    locationTags: ['global', 'academic'],
    lines: [
      '我们欢迎实验，但请提交 PDF、预算表、风险预案和两封推荐信。',
      '你当然可以反体制，只是系统需要一个附件。',
      '你的项目很好，但我们今年更关注“低碳疗愈与共创”。'
    ],
    effects: { reputation: 1, archive: 1, anxiety: 1 }
  }
];
