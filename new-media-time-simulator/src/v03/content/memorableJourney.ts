import type { ContentPack } from '../core/contentPack.ts';

export const memorableJourneyPack: ContentPack = {
  manifest: {
    id: 'core.memorable-journey',
    version: '0.3.0',
    engine: '^0.3.0',
    kind: 'data'
  },
  assets: [
    {
      id: 'asset.ancestral-hdmi',
      name: '祖传 HDMI 转接头',
      kind: 'tool',
      persistence: 'profile',
      initialDurability: 37,
      tags: ['signal', 'reliable-under-pressure', 'questionable-heritage'],
      slots: ['tool', 'wildcard']
    },
    {
      id: 'asset.failure-method',
      name: '失败作为方法',
      kind: 'method',
      persistence: 'profile',
      tags: ['failure-as-method', 'critical', 'salvage'],
      slots: ['methodology']
    },
    {
      id: 'asset.budget-necromancy',
      name: '预算招魂术',
      kind: 'method',
      persistence: 'profile',
      tags: ['budget-necromancy', 'survival', 'commercial'],
      slots: ['survival']
    },
    {
      id: 'asset.borrowed-cargo-bike',
      name: '借来的折叠货运车',
      kind: 'vehicle',
      persistence: 'run',
      initialDurability: 61,
      tags: ['cargo', 'borrowed', 'portable-infrastructure'],
      slots: ['vehicle']
    },
    {
      id: 'asset.salvaged-frame',
      name: '被拆下来的铝型材骨架',
      kind: 'oddity',
      persistence: 'run',
      tags: ['salvage', 'structure', 'previous-failure']
    },
    {
      id: 'asset.recovered-ssd',
      name: '抢救回来的旧 SSD',
      kind: 'document',
      persistence: 'profile',
      initialDurability: 42,
      tags: ['scarred', 'recovered', 'archive-anchor']
    },
    {
      id: 'asset.logistics-mech-mk1',
      name: '展演后勤机甲 Mk.I',
      kind: 'vehicle',
      persistence: 'profile',
      initialDurability: 80,
      tags: ['vehicle', 'portable-infrastructure', 'modular', 'absurdly-practical'],
      slots: ['vehicle']
    },
    {
      id: 'asset.mech-power-module',
      name: '机甲电源模块',
      kind: 'module',
      persistence: 'profile',
      tags: ['power', 'module', 'field-ready']
    },
    {
      id: 'asset.mech-projector-module',
      name: '机甲投影模块',
      kind: 'module',
      persistence: 'profile',
      tags: ['projection', 'module', 'field-ready']
    }
  ],
  media: [
    {
      id: 'media.frame-drop-triptych',
      kind: 'mock-post',
      alt: '同一次掉帧事故的官方、吹捧与黑色幽默三种说明',
      aspectRatio: '4:5',
      sharePreset: 'social-card',
      tags: ['three-lenses', 'glitch']
    },
    {
      id: 'media.xhs-28sqm',
      kind: 'mock-post',
      alt: '28 平方米艺术空间的社交媒体爆款截图',
      aspectRatio: '3:4',
      sharePreset: 'xiaohongshu-like',
      tags: ['viral', 'institution']
    },
    {
      id: 'media.run-archive-card',
      kind: 'document',
      alt: '本轮艺术家生涯阶段档案卡',
      aspectRatio: '3:4',
      sharePreset: 'run-summary',
      tags: ['archive', 'ending']
    }
  ],
  events: [
    {
      id: 'event.01-inheritance',
      title: '遗产不是钱，是一根转接头',
      category: 'opening',
      rarity: 'common',
      lenses: {
        neutral: '整理旧工作室时，你收到一根被使用多年的 HDMI 转接头。',
        hype: '你继承了一件见证多个现场系统存活的媒介遗物。',
        satire: '没有基金，没有房产。前辈给你留下了一根转接头。'
      },
      choices: [
        {
          id: 'keep-it',
          label: '收进工具箱，别问为什么还能用',
          consumesTurn: false,
          effects: [
            { type: 'asset.spawn', templateId: 'asset.ancestral-hdmi', instanceId: 'asset-instance.hdmi-001', persistence: 'profile' },
            { type: 'player.tag.add', tag: 'inherits-infrastructure' }
          ]
        }
      ]
    },
    {
      id: 'event.02-frame-drop',
      title: '掉帧十二秒',
      category: 'live',
      rarity: 'common',
      lenses: {
        neutral: '开幕现场的实时画面出现约 12 秒明显掉帧，随后恢复。',
        hype: '系统主动拒绝稳定帧率，暴露了实时媒介对基础设施的依赖。',
        satire: '显卡替你完成了媒介批判，而且没有收艺术家费。'
      },
      mediaTemplateIds: ['media.frame-drop-triptych'],
      choices: [
        {
          id: 'keep-all-versions',
          label: '三个说法全部归档，不宣布哪个是真的',
          consumesTurn: true,
          effects: [
            { type: 'stat.delta', key: 'archive', value: 2 },
            { type: 'stat.delta', key: 'anxiety', value: 1 },
            { type: 'world.flag.add', flag: 'public-frame-drop' }
          ]
        }
      ]
    },
    {
      id: 'event.03-faction-invite',
      title: '委员会终于注意到了你',
      category: 'faction',
      rarity: 'uncommon',
      lenses: {
        neutral: '学院新媒介委员会邀请你作为外围合作成员参加年度计划。',
        hype: '你的批判立场终于进入了制度内部，形成建设性张力。',
        satire: '他们愿意邀请你，主要因为还没决定要不要防着你。'
      },
      choices: [
        {
          id: 'affiliate-with-friction',
          label: '加入，但保留公开吐槽权',
          consumesTurn: false,
          effects: [
            { type: 'faction.membership', factionId: 'faction.academic-new-media', membership: 'affiliate' },
            { type: 'faction.reputation', factionId: 'faction.academic-new-media', fame: 8, infamy: 6 },
            { type: 'credential.issue', credentialId: 'credential.committee-affiliate' }
          ]
        }
      ]
    },
    {
      id: 'event.04-budget-collapse',
      title: '预算表开始自行解体',
      category: 'project-crisis',
      rarity: 'common',
      lenses: {
        neutral: '空间装置的制作预算低于最新报价，原计划无法完整落地。',
        hype: '资源约束迫使项目暴露真正不可替代的结构。',
        satire: '预算砍掉 40%，甲方建议“效果保持不变”。'
      },
      choices: [
        {
          id: 'salvage-the-failure',
          label: '承认它卡住了，拆材料、收方法、继续活',
          consumesTurn: true,
          effects: [
            { type: 'project.spawn', projectId: 'project.blackbox-001', templateId: 'project.blackbox-installation', state: 'blocked', tags: ['space', 'live'] },
            { type: 'asset.spawn', templateId: 'asset.salvaged-frame', instanceId: 'asset-instance.frame-001' },
            { type: 'asset.spawn', templateId: 'asset.failure-method', instanceId: 'asset-instance.failure-method-001', persistence: 'profile' },
            { type: 'asset.spawn', templateId: 'asset.budget-necromancy', instanceId: 'asset-instance.budget-001', persistence: 'profile' },
            { type: 'asset.spawn', templateId: 'asset.borrowed-cargo-bike', instanceId: 'asset-instance.cargo-001' },
            { type: 'stat.delta', key: 'insight', value: 2 }
          ]
        }
      ]
    },
    {
      id: 'event.05-combination',
      title: '灾难突然出现了隐藏按钮',
      category: 'systemic-combo',
      rarity: 'rare',
      lenses: {
        neutral: '临时黑盒展演需要在极低预算下重新组织设备、运输与现场逻辑。',
        hype: '你的方法、工具、生存策略与移动基础设施形成了完整的临时生产系统。',
        satire: '当别人还在找供应商，你已经把破车、旧线和失败理论拼成了 production pipeline。'
      },
      choices: [
        {
          id: 'make-disaster-drivable',
          label: '把灾难做成一个能开的版本',
          requires: [
            { type: 'asset.tag.equipped', tag: 'failure-as-method' },
            { type: 'asset.tag.equipped', tag: 'reliable-under-pressure' },
            { type: 'asset.tag.equipped', tag: 'budget-necromancy' },
            { type: 'asset.tag.equipped', tag: 'portable-infrastructure' }
          ],
          consumesTurn: true,
          effects: [
            { type: 'project.transition', projectId: 'project.blackbox-001', to: 'patched' },
            { type: 'project.tag.add', projectId: 'project.blackbox-001', tag: 'emergent-combo' },
            { type: 'stat.delta', key: 'reputation', value: 4 },
            { type: 'meta.unlock', unlockId: 'choice.make-disaster-drivable' }
          ]
        }
      ]
    },
    {
      id: 'event.06-institution',
      title: '你为什么开始管厕所和路由器',
      category: 'institution',
      rarity: 'uncommon',
      lenses: {
        neutral: '一个 28㎡ 空间可以低成本接手，但需要自行承担运营与维护。',
        hype: '你开始建立属于自己的微型艺术基础设施。',
        satire: '艺术家职业发展最终阶段：知道哪个路由器重启以后 Wi‑Fi 会回来。'
      },
      choices: [
        {
          id: 'found-office',
          label: '成立「临时艺术基础设施办公室」',
          consumesTurn: true,
          effects: [
            { type: 'institution.spawn', institutionId: 'institution.temp-office-001', templateId: 'institution.micro-space', name: '临时艺术基础设施办公室', tags: ['micro-space', 'artist-run'], metrics: { cashflow: 3, stability: 4, visibility: 1 } },
            { type: 'institution.asset.attach', institutionId: 'institution.temp-office-001', instanceId: 'asset-instance.frame-001' },
            { type: 'player.tag.add', tag: 'institution-operator' }
          ]
        }
      ]
    },
    {
      id: 'event.07-viral-post',
      title: 'Wi‑Fi 比作品更互动',
      category: 'media',
      rarity: 'rare',
      lenses: {
        neutral: '一条关于 28㎡ 空间的短内容意外获得大量传播。',
        hype: '微型基础设施以意料之外的方式突破了传统艺术传播边界。',
        satire: '你认真做了半年作品，最后爆的是路由器。'
      },
      mediaTemplateIds: ['media.xhs-28sqm'],
      choices: [
        {
          id: 'do-not-explain',
          label: '不解释，让互联网自己完成策展',
          requires: [{ type: 'institution.exists', institutionId: 'institution.temp-office-001' }],
          consumesTurn: false,
          effects: [
            { type: 'stat.delta', key: 'reputation', value: 5 },
            { type: 'faction.reputation', factionId: 'faction.academic-new-media', fame: 2, infamy: 4 },
            { type: 'world.condition.add', condition: 'viral-micro-space' },
            { type: 'institution.metric', institutionId: 'institution.temp-office-001', key: 'visibility', delta: 6 }
          ]
        }
      ]
    },
    {
      id: 'event.08-ssd-rescue',
      title: '硬盘活了下来',
      category: 'archive',
      rarity: 'uncommon',
      lenses: {
        neutral: '一块旧 SSD 在数据恢复后重新可读，但部分目录结构永久损坏。',
        hype: '损坏痕迹成为档案自身历史的一部分。',
        satire: '你终于开始尊重备份，因为恐惧比任何数字资产管理课程都有效。'
      },
      choices: [
        {
          id: 'keep-the-scar',
          label: '保留损坏痕迹，不格式化它的人生',
          consumesTurn: true,
          effects: [
            { type: 'asset.spawn', templateId: 'asset.recovered-ssd', instanceId: 'asset-instance.ssd-001', persistence: 'profile' },
            { type: 'stat.delta', key: 'archive', value: 4 },
            { type: 'player.tag.add', tag: 'backup-believer' }
          ]
        }
      ]
    },
    {
      id: 'event.09-mech',
      title: '移动基础设施终于长出了腿',
      category: 'vehicle',
      rarity: 'legendary',
      lenses: {
        neutral: '你把运输、电源、投影和现场维护模块整合进一台可移动搭建平台。',
        hype: '艺术生产从固定工作室转向可部署的移动基础设施。',
        satire: '恭喜，你没有买跑车。你造了一台专门搬投影机的机甲。'
      },
      choices: [
        {
          id: 'build-mk1',
          label: '命名为「展演后勤机甲 Mk.I」并坚持这是作品',
          requires: [{ type: 'player.tag', tag: 'institution-operator' }],
          consumesTurn: true,
          effects: [
            { type: 'asset.spawn', templateId: 'asset.logistics-mech-mk1', instanceId: 'asset-instance.mech-001', persistence: 'profile' },
            { type: 'asset.spawn', templateId: 'asset.mech-power-module', instanceId: 'asset-instance.power-001', persistence: 'profile' },
            { type: 'asset.spawn', templateId: 'asset.mech-projector-module', instanceId: 'asset-instance.projector-001', persistence: 'profile' },
            { type: 'project.transition', projectId: 'project.blackbox-001', to: 'shown' },
            { type: 'meta.unlock', unlockId: 'asset.logistics-mech-mk1' }
          ]
        }
      ]
    },
    {
      id: 'event.10-archive',
      title: '没有通关，只有归档',
      category: 'ending',
      rarity: 'legendary',
      lenses: {
        neutral: '本轮结束。系统根据你的资产、关系、项目与机构记录生成阶段档案。',
        hype: '你已经形成一套具有持续性的实践结构。',
        satire: '你没有成功成为艺术家，但成功成为了一套需要维护的系统。'
      },
      mediaTemplateIds: ['media.run-archive-card'],
      choices: [
        {
          id: 'archive-with-contradiction',
          label: '保存这份互相矛盾的履历',
          consumesTurn: false,
          effects: [
            { type: 'project.transition', projectId: 'project.blackbox-001', to: 'archived' },
            { type: 'meta.title.unlock', title: '制度欢迎的麻烦制造者' },
            { type: 'meta.unlock', unlockId: 'run.first-memorable-archive' }
          ]
        }
      ]
    }
  ]
};
