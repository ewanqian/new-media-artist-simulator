export const regions = [
  {
    id: 'region_rongshore',
    name: '榕树湾工作区',
    tags: ['studio', 'academic'],
    unlockPhase: 1,
    description: '共享工位、旧投影机和深夜外卖一起构成的入门生态。',
    submaps: [
      {
        id: 'sub_cowork',
        name: '共享工位 B-201',
        description: '空气里有热风、旧电源和 pitch deck 的味道。',
        actions: ['action_rewire_files', 'action_field_notes', 'action_small_talk']
      },
      {
        id: 'sub_river_diner',
        name: '江边大排档',
        description: '真理论和假豪言都在这里发酵。',
        actions: ['action_npc_hunt', 'action_black_humor', 'action_cheap_meal']
      }
    ]
  },
  {
    id: 'region_shenzhen',
    name: '深港加速走廊',
    tags: ['commercial', 'space', 'live'],
    unlockPhase: 1,
    description: '品牌、设备、速度、光污染与机会并存。',
    submaps: [
      {
        id: 'sub_pitchroom',
        name: '提案会议室',
        description: '每一页 Keynote 都可能是一场预算仪式。',
        actions: ['action_pitch', 'action_budget_ritual', 'action_client_sync']
      },
      {
        id: 'sub_blackbox',
        name: '黑盒测试场',
        description: '灯光、投影、传感器和人的耐心一起被烤。',
        actions: ['action_signal_test', 'action_install_space', 'action_emergency_patch']
      }
    ]
  },
  {
    id: 'region_academy',
    name: '南岭学院与展厅群',
    tags: ['academic'],
    unlockPhase: 2,
    description: '讲座、评审、展签和制度性认可叠加的场域。',
    submaps: [
      {
        id: 'sub_lecture',
        name: '理论讲堂',
        description: '观点很多，真正有用的只占其中一小段。',
        actions: ['action_attend_lecture', 'action_write_statement', 'action_open_call']
      },
      {
        id: 'sub_gallery',
        name: '学院展厅',
        description: '看似安静，实则暗流密布。',
        actions: ['action_install_show', 'action_curator_chat', 'action_critique_walk']
      }
    ]
  },
  {
    id: 'region_renderfarm',
    name: '离线渲染农场',
    tags: ['code', 'studio'],
    unlockPhase: 2,
    description: '风扇、缓存、脚本和崩溃恢复组成的地下基础设施。',
    submaps: [
      {
        id: 'sub_server',
        name: '算力机架',
        description: '每一块显卡都像一个需要安抚的神明。',
        actions: ['action_optimize_pipeline', 'action_train_skill', 'action_cache_mining']
      },
      {
        id: 'sub_proxy',
        name: '预演代理站',
        description: '提前失败，胜过现场失败。',
        actions: ['action_previsualize', 'action_tool_refactor', 'action_recover_data']
      }
    ]
  },
  {
    id: 'region_biennale',
    name: '北方双年展工地',
    tags: ['space', 'academic', 'global'],
    unlockPhase: 3,
    description: '理想与施工条件互相消耗的宏大现场。',
    submaps: [
      {
        id: 'sub_hangar',
        name: '旧机库展场',
        description: '你终于拿到了大空间，也终于发现每一米都在烧钱。',
        actions: ['action_scale_up', 'action_team_brief', 'action_salvage_material']
      },
      {
        id: 'sub_press',
        name: '媒体接待区',
        description: '一句话没说好，半年都在被误读。',
        actions: ['action_press_talk', 'action_network_dinner', 'action_damage_control']
      }
    ]
  },
  {
    id: 'region_residency',
    name: '海外驻留港',
    tags: ['global', 'academic', 'space'],
    unlockPhase: 4,
    description: '机会、制度、陌生语境和自我重写发生叠加。',
    submaps: [
      {
        id: 'sub_residency_lab',
        name: '驻留实验室',
        description: '看起来安静，其实每个人都在无声竞争。',
        actions: ['action_cross_pollinate', 'action_prototype', 'action_document_process']
      },
      {
        id: 'sub_border_cafe',
        name: '边界咖啡馆',
        description: '这地方盛产合作、误会和短暂联盟。',
        actions: ['action_trade_gossip', 'action_seek_patron', 'action_rewrite_manifesto']
      }
    ]
  }
];

export const actions = {
  action_rewire_files: {
    name: '整理旧工程',
    kind: 'studio',
    description: '把旧版本、废稿、缓存和失败提案拆成可再利用素材。',
    effects: { archive: 3, tech: 1, stamina: -1 },
    rewards: { items: { cacheShard: 1 } },
    encounterTags: ['studio', 'code']
  },
  action_field_notes: {
    name: '补写场域笔记',
    kind: 'research',
    description: '把见闻重新组织成方法论线索。',
    effects: { insight: 2, archive: 2, anxiety: -1 },
    encounterTags: ['academic']
  },
  action_small_talk: {
    name: '共享工位闲聊',
    kind: 'social',
    description: '可能遇到合作，也可能只收获更多八卦。',
    effects: { network: 2, reputation: 1 },
    rewards: { items: { favor: 1 } },
    encounterTags: ['studio']
  },
  action_npc_hunt: {
    name: '夜间偶遇',
    kind: 'social',
    description: '在随机对话里捞信息。',
    effects: { insight: 1, network: 1, anxiety: 1 },
    encounterTags: ['academic', 'studio']
  },
  action_black_humor: {
    name: '黑色幽默防御',
    kind: 'survival',
    description: '用笑话防止自己原地崩坏。',
    effects: { anxiety: -3, reputation: 1 },
    encounterTags: ['studio']
  },
  action_cheap_meal: {
    name: '低成本补给',
    kind: 'survival',
    description: '用一顿普通夜宵换回一点体力。',
    effects: { stamina: 3, funds: -1 }
  },
  action_pitch: {
    name: '提案作战',
    kind: 'commercial',
    description: '在语言与预算之间搏斗。',
    effects: { funds: 3, reputation: 1, anxiety: 2 },
    encounterTags: ['commercial'],
    rewards: { items: { budgetVoucher: 1 } }
  },
  action_budget_ritual: {
    name: '预算招魂仪式',
    kind: 'commercial',
    description: '把不可能的数字表看起来像能成立。',
    effects: { funds: 2, tech: 1, stamina: -1 },
    encounterTags: ['commercial']
  },
  action_client_sync: {
    name: '与甲方同步世界观',
    kind: 'commercial',
    description: '你解释概念，对方解释截止时间。',
    effects: { network: 2, reputation: 1, anxiety: 1 },
    encounterTags: ['commercial']
  },
  action_signal_test: {
    name: '信号链测试',
    kind: 'live',
    description: '提前暴露问题，拯救未来的自己。',
    effects: { tech: 3, insight: 1, stamina: -2 },
    encounterTags: ['live', 'space']
  },
  action_install_space: {
    name: '空间装调',
    kind: 'space',
    description: '真正的空间感来自身体、尺度和现场条件。',
    effects: { insight: 3, reputation: 2, stamina: -2 },
    encounterTags: ['space', 'live']
  },
  action_emergency_patch: {
    name: '紧急补丁',
    kind: 'live',
    description: '用临时方案保护整体演出不死。',
    effects: { tech: 2, anxiety: 1, reputation: 1 },
    rewards: { items: { patchKit: 1 } },
    encounterTags: ['live']
  },
  action_attend_lecture: {
    name: '旁听讲座',
    kind: 'academic',
    description: '不一定全有用，但有时一句话能救你一周。',
    effects: { archive: 2, insight: 2 },
    encounterTags: ['academic']
  },
  action_write_statement: {
    name: '重写作品陈述',
    kind: 'academic',
    description: '删掉一点空话，留下真正的问题。',
    effects: { archive: 2, reputation: 1, anxiety: 1 },
    encounterTags: ['academic']
  },
  action_open_call: {
    name: '投递公开征集',
    kind: 'global',
    description: '制度虽然冷漠，但偶尔也会开门。',
    effects: { archive: 1, funds: -1, reputation: 2 },
    rewards: { items: { openCallStamp: 1 } },
    encounterTags: ['academic', 'global']
  },
  action_install_show: {
    name: '安装展览',
    kind: 'academic',
    description: '让文本、设备和空间终于同处一个句子。',
    effects: { reputation: 3, tech: 1, stamina: -1 },
    encounterTags: ['academic', 'space']
  },
  action_curator_chat: {
    name: '策展人对话',
    kind: 'academic',
    description: '说对一句，半个月都值。',
    effects: { reputation: 2, network: 1, archive: 1 },
    encounterTags: ['academic']
  },
  action_critique_walk: {
    name: '评图漫游',
    kind: 'academic',
    description: '收获建议、误解与一点点自我怀疑。',
    effects: { insight: 2, anxiety: 1 },
    encounterTags: ['academic']
  },
  action_optimize_pipeline: {
    name: '优化工作流',
    kind: 'code',
    description: '减少重复劳作，留出一点真正创作的时间。',
    effects: { tech: 3, stamina: 1 },
    encounterTags: ['code']
  },
  action_train_skill: {
    name: '训练技能节点',
    kind: 'code',
    description: '把经验显性化，变成可继承模块。',
    effects: { tech: 2, archive: 1, insight: 1 },
    rewards: { items: { nodeChip: 1 } },
    encounterTags: ['code']
  },
  action_cache_mining: {
    name: '缓存采矿',
    kind: 'code',
    description: '垃圾堆里也埋着未来版本。',
    effects: { archive: 2, funds: 1, anxiety: 1 },
    rewards: { items: { cacheShard: 2 } },
    encounterTags: ['code', 'studio']
  },
  action_previsualize: {
    name: '预演模拟',
    kind: 'space',
    description: '在低成本环境里先把灾难演习一遍。',
    effects: { insight: 2, tech: 2 },
    encounterTags: ['space', 'code']
  },
  action_tool_refactor: {
    name: '重构工具',
    kind: 'code',
    description: '今天的烦躁，也许是明天的系统。',
    effects: { tech: 2, archive: 1, stamina: -1 },
    rewards: { items: { patchKit: 1 } },
    encounterTags: ['code']
  },
  action_recover_data: {
    name: '抢救损坏数据',
    kind: 'code',
    description: '你以为它没了，其实只是藏得比较深。',
    effects: { archive: 3, anxiety: -1 },
    rewards: { items: { recoveryTape: 1 } },
    encounterTags: ['code']
  },
  action_scale_up: {
    name: '放大作品规模',
    kind: 'space',
    description: '大空间会放大你的优点，也会放大你的漏洞。',
    effects: { reputation: 3, insight: 2, funds: -2, stamina: -2 },
    encounterTags: ['space', 'global']
  },
  action_team_brief: {
    name: '团队部署',
    kind: 'production',
    description: '把脑内宇宙翻译成人人可执行的语言。',
    effects: { network: 2, reputation: 2, tech: 1 },
    encounterTags: ['space', 'commercial']
  },
  action_salvage_material: {
    name: '回收现场材料',
    kind: 'space',
    description: '临时结构、废弃设备和旧文本都可能复活。',
    effects: { archive: 2, funds: 1 },
    rewards: { items: { salvageCore: 1 } },
    encounterTags: ['space']
  },
  action_press_talk: {
    name: '媒体发言',
    kind: 'global',
    description: '用有限句子保住作品的复杂性。',
    effects: { reputation: 3, anxiety: 1 },
    encounterTags: ['global']
  },
  action_network_dinner: {
    name: '关系晚餐',
    kind: 'global',
    description: '可能结盟，也可能只是消耗。',
    effects: { network: 3, funds: -1 },
    encounterTags: ['global', 'commercial']
  },
  action_damage_control: {
    name: '误读止损',
    kind: 'global',
    description: '世界不会完全理解你，但你可以减少损耗。',
    effects: { reputation: 1, anxiety: -2, archive: 1 },
    encounterTags: ['global']
  },
  action_cross_pollinate: {
    name: '跨学科串联',
    kind: 'global',
    description: '真正有意思的东西常常长在边界处。',
    effects: { insight: 3, network: 2 },
    encounterTags: ['global', 'academic']
  },
  action_prototype: {
    name: '原型迭代',
    kind: 'code',
    description: '把模糊世界观压缩成可交互雏形。',
    effects: { tech: 2, insight: 2, stamina: -1 },
    encounterTags: ['global', 'code']
  },
  action_document_process: {
    name: '记录过程',
    kind: 'research',
    description: '让生产不仅留下结果，也留下方法。',
    effects: { archive: 3, reputation: 1 },
    encounterTags: ['global', 'academic']
  },
  action_trade_gossip: {
    name: '交换情报',
    kind: 'social',
    description: '艺术世界并不透明，你只能自己挖。',
    effects: { network: 2, insight: 1 },
    rewards: { items: { rumorPacket: 1 } },
    encounterTags: ['global']
  },
  action_seek_patron: {
    name: '寻找赞助人',
    kind: 'commercial',
    description: '现实从来不优雅，但资金确实有用。',
    effects: { funds: 4, reputation: 1, anxiety: 1 },
    encounterTags: ['global', 'commercial']
  },
  action_rewrite_manifesto: {
    name: '重写宣言',
    kind: 'research',
    description: '不是为了看起来更大，而是为了更准确地活下去。',
    effects: { insight: 3, archive: 2, anxiety: -1 },
    encounterTags: ['global', 'academic']
  }
};
