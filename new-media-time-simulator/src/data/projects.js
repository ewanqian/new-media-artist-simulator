export const projects = [
  {
    id: 'proj_led_ritual',
    name: '环幕失真仪式',
    type: 'space',
    duration: 3,
    description: '把空间、节奏和错误视觉重组为一场可进入的体验。',
    costs: { funds: 3, archive: 2, tech: 2 },
    rewards: { reputation: 5, insight: 3, items: { patchKit: 1 } }
  },
  {
    id: 'proj_open_call',
    name: '驻留申请计划',
    type: 'academic',
    duration: 2,
    description: '把研究、文本和案例缝成一份更像样的申请。',
    costs: { archive: 3, insight: 2 },
    rewards: { reputation: 4, funds: 2, items: { residencySeal: 1 } }
  },
  {
    id: 'proj_skill_pack',
    name: '技能模块化整理',
    type: 'code',
    duration: 2,
    description: '将经验拆成 reusable skills，为未来项目减压。',
    costs: { tech: 3, archive: 2 },
    rewards: { tech: 4, archive: 2, items: { nodeChip: 2 } }
  },
  {
    id: 'proj_brand_scene',
    name: '品牌空间提案',
    type: 'commercial',
    duration: 2,
    description: '在甲方话语和真实空间体验之间硬做平衡。',
    costs: { funds: 2, network: 2, insight: 1 },
    rewards: { funds: 6, reputation: 2 }
  },
  {
    id: 'proj_manifesto',
    name: '方法论宣言重写',
    type: 'research',
    duration: 3,
    description: '从项目经验中抽出属于自己的引擎语言。',
    costs: { archive: 4, insight: 3, stamina: 1 },
    rewards: { reputation: 4, insight: 4, items: { manifestoCore: 1 } }
  }
];
