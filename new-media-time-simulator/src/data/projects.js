export const projects = [
  {
    id: 'proj_led_ritual',
    name: '环幕失真仪式',
    type: 'space',
    category: 'site',
    duration: 3,
    description: '把空间、节奏和错误视觉重组为一场可进入的体验。',
    costs: { funds: 3, archive: 2, tech: 2 },
    rewards: { reputation: 5, insight: 3, items: { patchKit: 1 } }
  },
  {
    id: 'proj_manifesto',
    name: '方法论宣言重写',
    type: 'research',
    category: 'research',
    duration: 3,
    description: '从项目经验中抽出属于自己的引擎语言。',
    costs: { archive: 4, insight: 3, stamina: 1 },
    rewards: { reputation: 4, insight: 4, items: { manifestoCore: 1 } }
  },
  {
    id: 'proj_skill_pack',
    name: '方法模块化整理',
    type: 'code',
    category: 'research',
    duration: 2,
    description: '将实践经验拆成可复用节点，为未来项目减压。',
    costs: { tech: 3, archive: 2 },
    rewards: { tech: 4, archive: 2, items: { nodeChip: 2 } }
  },

  {
    id: 'proj_open_call',
    name: '驻留申请计划',
    type: 'academic',
    category: 'application',
    duration: 2,
    description: '把研究、文本和案例缝成一份更像样的申请。',
    costs: { archive: 3, insight: 2 },
    rewards: { reputation: 4, funds: 2, items: { residencySeal: 1 } }
  },
  {
    id: 'proj_open_call_revision',
    name: '驻留申请修改',
    type: 'academic',
    category: 'application',
    duration: 1,
    description: '根据评审意见调整文本和项目框架，重投。',
    costs: { archive: 1, reputation: 1, stamina: 2 },
    rewards: { reputation: 3, archive: 1, items: { openCallStamp: 1 } }
  },
  {
    id: 'proj_biennial_addendum',
    name: '双年展资料补件',
    type: 'academic',
    category: 'application',
    duration: 1,
    description: '组委会要求补充作品集高清图、作品尺寸和预算明细。',
    costs: { stamina: 1, archive: 1 },
    rewards: { reputation: 2, funds: 0 }
  },
  {
    id: 'proj_residency_translate',
    name: '海外驻留材料翻译',
    type: 'academic',
    category: 'application',
    duration: 1,
    description: '把中文项目说明翻译成让评委能看懂的英文。',
    costs: { insight: 1, stamina: 1 },
    rewards: { reputation: 2, archive: 1 }
  },
  {
    id: 'proj_forum_abstract',
    name: '学术论坛摘要整理',
    type: 'academic',
    category: 'application',
    duration: 1,
    description: '把你做的复杂东西压缩到 500 字以内。',
    costs: { insight: 2, stamina: 1 },
    rewards: { archive: 2, reputation: 1 }
  },

  {
    id: 'proj_video_editing',
    name: '视频文档最终剪辑',
    type: 'documentation',
    category: 'document',
    duration: 2,
    description: '把现场素材剪成符合策展要求的作品文档版。',
    costs: { tech: 2, stamina: 3 },
    rewards: { archive: 3, reputation: 2 }
  },
  {
    id: 'proj_documentation_reshoot',
    name: '作品图像重做',
    type: 'documentation',
    category: 'document',
    duration: 1,
    description: '策展人说图不够好，重新拍一组作品照片。',
    costs: { funds: 1, stamina: 2 },
    rewards: { archive: 2, reputation: 1 }
  },
  {
    id: 'proj_artist_statement_rewrite',
    name: 'artist statement 改写',
    type: 'documentation',
    category: 'document',
    duration: 1,
    description: '“再高级一点，但别太难懂”，重新写一遍。',
    costs: { insight: 2, reputation: 1 },
    rewards: { archive: 2, reputation: 1 }
  },
  {
    id: 'proj_project_archive_organize',
    name: '项目档案整理',
    type: 'documentation',
    category: 'document',
    duration: 2,
    description: '把这几年做过的东西整理成可搜索的在线作品集。',
    costs: { archive: 3, stamina: 2 },
    rewards: { archive: 4, reputation: 1 }
  },
  {
    id: 'proj_website_update',
    name: '个人网站/作品集更新',
    type: 'documentation',
    category: 'document',
    duration: 2,
    description: '把新做完的作品加上去，把旧项目重新排序。',
    costs: { tech: 1, archive: 2 },
    rewards: { archive: 3, reputation: 2 }
  },

  {
    id: 'proj_space_test',
    name: '预展空间测试',
    type: 'site',
    category: 'site',
    duration: 1,
    description: '在现场走一遍动线，看看投影对齐和声音延时。',
    costs: { stamina: 2, tech: 1 },
    rewards: { archive: 2, tech: 1 }
  },
  {
    id: 'proj_pre_show_tuning',
    name: '展开联调',
    type: 'site',
    category: 'site',
    duration: 1,
    description: '开展前最后一天，所有设备同时开机测试稳定性。',
    costs: { stamina: 3, tech: 1 },
    rewards: { tech: 2, reputation: 1 }
  },
  {
    id: 'proj_equipment_borrow',
    name: '设备借还与布线',
    type: 'site',
    category: 'site',
    duration: 1,
    description: '从共享工作室借投影机，抬去现场，布线，测试信号。',
    costs: { stamina: 2, network: 1 },
    rewards: { tech: 1 }
  },
  {
    id: 'proj_post_show_cleanup',
    name: '撤展后整理',
    type: 'site',
    category: 'site',
    duration: 1,
    description: '把设备拆了打包还给别人，带走自己的材料和垃圾。',
    costs: { stamina: 2 },
    rewards: { salvageCore: 1 }
  },
  {
    id: 'proj_small_rehearsal',
    name: '小型预演开放',
    type: 'site',
    category: 'site',
    duration: 1,
    description: '邀请少数朋友来看，收集反馈再调整。',
    costs: { stamina: 2, reputation: 1 },
    rewards: { insight: 2 }
  },

  {
    id: 'proj_brand_scene',
    name: '品牌空间提案',
    type: 'commercial',
    category: 'commercial',
    duration: 2,
    description: '在甲方话语和真实空间体验之间硬做平衡。',
    costs: { funds: 1, network: 2, insight: 1 },
    rewards: { funds: 6, reputation: 2 }
  },
  {
    id: 'proj_brand_feedback_revision',
    name: '甲方反馈再解释',
    type: 'commercial',
    category: 'commercial',
    duration: 1,
    description: '“感觉不够先锋但要更互动”，把反馈翻译回方案语言。',
    costs: { insight: 1, stamina: 1 },
    rewards: { funds: 2, reputation: 1 }
  },
  {
    id: 'proj_brand_moodboard',
    name: '快速版 moodboard',
    type: 'commercial',
    category: 'commercial',
    duration: 1,
    description: '甲方要先看感觉，做一版快速拼贴。',
    costs: { insight: 1, archive: 1 },
    rewards: { funds: 2 }
  },
  {
    id: 'proj_multimedia_narrative',
    name: '多媒体展示逻辑梳理',
    type: 'commercial',
    category: 'commercial',
    duration: 2,
    description: '帮品牌梳理不同媒体在空间中的叙事顺序和观看节奏。',
    costs: { insight: 2, tech: 1 },
    rewards: { funds: 5, archive: 1 }
  },
  {
    id: 'proj_press_visual',
    name: '发布会视觉调整',
    type: 'commercial',
    category: 'commercial',
    duration: 1,
    description: '发布会背景板和新闻中心视觉最后一轮修改。',
    costs: { stamina: 1, insight: 1 },
    rewards: { funds: 3 }
  },

  {
    id: 'proj_methodology_rewrite',
    name: '方法论重写',
    type: 'research',
    category: 'research',
    duration: 3,
    description: '做完一批项目，重新整理你的实践方法论。',
    costs: { insight: 3, archive: 2 },
    rewards: { insight: 4, archive: 3 }
  },
  {
    id: 'proj_case_study',
    name: '参考案例阅读整理',
    type: 'research',
    category: 'research',
    duration: 2,
    description: '找一批相关作品，拆了它们的方法用在自己这里。',
    costs: { insight: 2, archive: 1 },
    rewards: { insight: 3 }
  },
  {
    id: 'proj_old_project_disassemble',
    name: '旧项目拆解',
    type: 'research',
    category: 'research',
    duration: 2,
    description: '把失败旧项目拆开，看看哪些材料能用在新东西里。',
    costs: { archive: 2, stamina: 1 },
    rewards: { salvageCore: 2, insight: 1 }
  },
  {
    id: 'proj_failure_review',
    name: '失败原因复盘',
    type: 'research',
    category: 'research',
    duration: 1,
    description: '项目黄了，写一份只有自己看的复盘。',
    costs: { insight: 1, stamina: 1 },
    rewards: { insight: 2 }
  },
  {
    id: 'proj_direction_review',
    name: '新阶段方向整理',
    type: 'research',
    category: 'research',
    duration: 2,
    description: '做完一轮，停下来想想下一步往哪走。',
    costs: { insight: 2, archive: 1 },
    rewards: { insight: 2, reputation: 1 }
  },

  {
    id: 'proj_part_time_job',
    name: '接兼职补现金流',
    type: 'survival',
    category: 'survival',
    duration: 1,
    description: '帮朋友做一点小活，先把下个月房租填上。',
    costs: { stamina: 2, insight: 1 },
    rewards: { funds: 4 }
  },
  {
    id: 'proj_document_edit_for_friend',
    name: '帮别人改文本',
    type: 'survival',
    category: 'survival',
    duration: 1,
    description: '同辈朋友请你帮改策展文本或 artist statement，收一点辛苦费。',
    costs: { insight: 1, reputation: 1 },
    rewards: { funds: 2, network: 1 }
  },
  {
    id: 'proj_temp_workshop',
    name: '临时教学/分享',
    type: 'survival',
    category: 'survival',
    duration: 1,
    description: '去艺术空间带一次工作坊，赚课时费。',
    costs: { stamina: 2, reputation: 1 },
    rewards: { funds: 3, reputation: 1 }
  },
  {
    id: 'proj_equipment_repair',
    name: '替人修设备',
    type: 'survival',
    category: 'survival',
    duration: 1,
    description: '朋友的投影/电脑/传感器出问题了，你帮修好。',
    costs: { tech: 2, stamina: 1 },
    rewards: { funds: 2, network: 1, favor: 1 }
  },
  {
    id: 'proj_outsource_content',
    name: '外包内容处理',
    type: 'survival',
    category: 'survival',
    duration: 2,
    description: '接一些外包内容生产，不署名，但现金流快。',
    costs: { stamina: 3, insight: 1 },
    rewards: { funds: 5 }
  }
];

export const getProjectsByType = (type) => projects.filter(p => p.type === type);
export const getRandomProject = () => projects[Math.floor(Math.random() * projects.length)];
