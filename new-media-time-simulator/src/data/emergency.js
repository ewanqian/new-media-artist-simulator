export const emergencyActions = [
  {
    id: 'salvage_archive',
    name: '翻旧档案',
    description: '从已完成的旧项目里找能复用的文档、图片、结构',
    effects: {
      archive: +1,
      stamina: +1,
      funds: 0
    },
    flavor: '你打开硬盘深处那个命名混乱的文件夹，总能翻到一些能用的东西。'
  },
  {
    id: 'rewrite_narrative',
    name: '改写说法',
    description: '把同一件事换一个叙述角度，重新包装给对方',
    effects: {
      insight: +1,
      reputation: +1,
      stamina: -1
    },
    flavor: '问题没变，但话说对了位置，结果就会不一样。'
  },
  {
    id: 'borrow_equipment',
    name: '借设备/借场地',
    description: '走关系找朋友借设备或场地救急',
    effects: {
      favor: -1,
      tech: +1,
      stamina: 0
    },
    flavor: '人情是可以存也可以取的存折，关键时候总得取一次。'
  },
  {
    id: 'temp_assembly',
    name: '临时拼装',
    description: '用低成本方式先把原型立起来，先交差再说',
    effects: {
      funds: -1,
      stamina: -2,
      archive: +1
    },
    flavor: '很多时候，有一个不完美的完成比完美的未完成更有用。'
  },
  {
    id: 'scale_down',
    name: '缩小方案',
    description: '不硬撑规模，主动收束范围，保住作品完整性',
    effects: {
      funds: +1,
      stamina: +1,
      reputation: -1
    },
    flavor: '野心太大预算不够时，收缩反而能保住质量。'
  },
  {
    id: 'failure_as_method',
    name: '把失败转成方法',
    description: '让bug、错误、缺失本身成为作品的一部分',
    effects: {
      insight: +2,
      archive: +1,
      stamina: 0
    },
    flavor: '在当代艺术里，失败很少是终点，它常常就是材料。'
  },
  {
    id: 'all_nighter',
    name: '通宵补文档',
    description: '牺牲体力换文档完整度，赶在截止前交出去',
    effects: {
      stamina: -3,
      anxiety: +1,
      archive: +2
    },
    flavor: '每个新媒体艺术家都有过几次为了文档通宵的经历。'
  },
  {
    id: 'ask_extension',
    name: '申请延期',
    description: '损失一点名声，换项目存活下来',
    effects: {
      reputation: -1,
      stamina: +1,
      archive: +1
    },
    flavor: '延期不是失败，承认做不完才能把作品做好。'
  },
  {
    id: 'switch_interface',
    name: '换合作接口',
    description: '从学院转品牌、从机构转独立空间、从公开申请转私人关系',
    effects: {
      network: +1,
      reputation: 0,
      funds: 0
    },
    flavor: '这条路走不通，换一张关系网试试。'
  },
  {
    id: 'repackage_old',
    name: '拿旧项目再包装',
    description: '把半成品重新解释为一个阶段性版本发表',
    effects: {
      archive: +2,
      reputation: +1,
      insight: +1
    },
    flavor: '做不完不是结束，阶段性结果本身就是结果。'
  }
];

export const getEmergencyActionById = (id) => emergencyActions.find(a => a.id === id);
export const getAllEmergencyActions = () => emergencyActions;
