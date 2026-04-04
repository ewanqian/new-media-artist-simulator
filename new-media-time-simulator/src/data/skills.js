export const slotLabels = {
  methodology: '方法论槽',
  tool: '工具槽',
  network: '接口槽',
  survival: '生存槽',
  special: '特勤槽'
};

export const skills = [
  {
    id: 'skill_spatial_sensing',
    name: '空间感知协议',
    slot: 'methodology',
    rarity: '稀有',
    description: '用身体路线和视角变化来拆解空间。',
    modifiers: { insight: 2 },
    mapTags: ['space', 'architecture']
  },
  {
    id: 'skill_signal_direction',
    name: '信号导演',
    slot: 'tool',
    rarity: '稀有',
    description: '把灯光、视频、OSC、现场响应捏成一个节奏系统。',
    modifiers: { tech: 2, reputation: 1 },
    mapTags: ['live', 'space']
  },
  {
    id: 'skill_soft_armor',
    name: '软甲：项目不死层',
    slot: 'survival',
    rarity: '普通',
    description: '面对荒谬需求时，维持体力与底线的临时护甲。',
    modifiers: { stamina: 2, anxiety: -1 }
  },
  {
    id: 'skill_curatorial_black_speech',
    name: '策展黑话编译器',
    slot: 'methodology',
    rarity: '普通',
    description: '能把模糊直觉翻译成机构可读文本，也能顺手制造一点讽刺。',
    modifiers: { archive: 2, reputation: 1 },
    mapTags: ['academic']
  },
  {
    id: 'skill_archive_salvage',
    name: '档案打捞术',
    slot: 'tool',
    rarity: '普通',
    description: '把旧项目、碎片记录和失败提案重新炼成可用材料。',
    modifiers: { archive: 2, insight: 1 }
  },
  {
    id: 'skill_risk_humor',
    name: '风险幽默',
    slot: 'survival',
    rarity: '普通',
    description: '把焦虑变成笑话，笑话变成护身符。',
    modifiers: { anxiety: -2 }
  },
  {
    id: 'skill_pipeline_bricolage',
    name: '管线拼装学',
    slot: 'tool',
    rarity: '稀有',
    description: '擅长用最低成本把工作流缝起来。',
    modifiers: { tech: 2, funds: 1 }
  },
  {
    id: 'skill_node_forging',
    name: '节点锻造',
    slot: 'methodology',
    rarity: '稀有',
    description: '将方法论拆成可组合的技能节点。',
    modifiers: { tech: 1, insight: 2 }
  },
  {
    id: 'skill_cache_diving',
    name: '缓存潜水',
    slot: 'special',
    rarity: '传奇',
    description: '在旧文件、临时版本和崩溃边缘里捞回真正有价值的东西。',
    modifiers: { archive: 3, tech: 1, funds: 1 }
  },
  {
    id: 'skill_budget_necromancy',
    name: '预算招魂',
    slot: 'network',
    rarity: '稀有',
    description: '让已经死去的预算短暂复活。',
    modifiers: { funds: 2, network: 1 },
    mapTags: ['commercial']
  },
  {
    id: 'skill_client_mask',
    name: '甲方面具',
    slot: 'network',
    rarity: '普通',
    description: '在不失真自我的前提下，短暂模拟“靠谱乙方人格”。',
    modifiers: { network: 2, reputation: 1 }
  },
  {
    id: 'skill_wayfinding_frame',
    name: '路径构图',
    slot: 'methodology',
    rarity: '普通',
    description: '以动线和界面结构组织展示。',
    modifiers: { insight: 1, tech: 1, reputation: 1 },
    mapTags: ['architecture', 'space']
  },
  {
    id: 'skill_material_memory',
    name: '材料记忆',
    slot: 'tool',
    rarity: '普通',
    description: '能从材质、介质和老设备残留中读出现场语气。',
    modifiers: { archive: 1, insight: 1 }
  },
  {
    id: 'skill_field_notebook',
    name: '场域笔记',
    slot: 'network',
    rarity: '普通',
    description: '不浪费每一次勘场、聊天和失败。',
    modifiers: { archive: 1, network: 1 }
  },
  {
    id: 'skill_portable_reputation',
    name: '便携式口碑',
    slot: 'network',
    rarity: '稀有',
    description: '让上一个城市的好名声，不至于在下一个城市彻底失效。',
    modifiers: { reputation: 2, network: 1 }
  },
  {
    id: 'skill_open_call_hack',
    name: '公开征集黑客',
    slot: 'special',
    rarity: '稀有',
    description: '你比大多数人更会读征集文本的缝隙。',
    modifiers: { archive: 1, reputation: 1, funds: 1 },
    mapTags: ['academic', 'global']
  },
  {
    id: 'skill_render_farming',
    name: '渲染农业',
    slot: 'tool',
    rarity: '稀有',
    description: '把等待时间也纳入生产。',
    modifiers: { tech: 2, stamina: -1 }
  },
  {
    id: 'skill_research_ritual',
    name: '研究仪式',
    slot: 'special',
    rarity: '稀有',
    description: '当别人都在赶稿时，你还保留一点真正研究的能力。',
    modifiers: { insight: 2, archive: 1 },
    mapTags: ['academic']
  }
];
