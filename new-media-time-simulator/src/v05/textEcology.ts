import type { ProjectStageId } from './gameLoop.ts';

export type TextKind =
  | 'message'
  | 'overheard'
  | 'field-note'
  | 'rumor'
  | 'listing'
  | 'institution-copy'
  | 'feed'
  | 'review'
  | 'theory'
  | 'memory';

export type SourceLayer = 'direct' | 'public' | 'secondhand' | 'rumor';

export type WorldTextFragment = {
  id: string;
  kind: TextKind;
  source: string;
  layer: SourceLayer;
  text: string;
  regionIds?: string[];
  facilityIds?: string[];
  contactIds?: string[];
  opportunityIds?: string[];
  projectStageIds?: ProjectStageId[];
  relatedKnowledgeIds?: string[];
  tags: string[];
};

export type RelationshipEdge = {
  id: string;
  fromContactId: string;
  toContactId: string;
  kind: 'worked-with' | 'introduced-by' | 'knows-of' | 'owes' | 'disagrees' | 'recommends';
  label: string;
  note: string;
};

export type TextContext = {
  week: number;
  regionId?: string;
  facilityId?: string;
  contactId?: string;
  projectStageId?: ProjectStageId;
  limit?: number;
};

export const sourceLayerLabels: Record<SourceLayer, string> = {
  direct: '亲历',
  public: '公开',
  secondhand: '二手',
  rumor: '传闻'
};

export const worldTextFragments: WorldTextFragment[] = [
  {
    id: 'text-putuo-studio-neighbor', kind: 'overheard', source: '隔壁工作室', layer: 'secondhand',
    text: '“别急着换电脑。你现在最贵的问题不是算不动，是每次出错都不知道从哪一步开始重搭。”',
    regionIds: ['region-putuo-sucreek'], facilityIds: ['putuo-studio-floor'], projectStageIds: ['clue', 'prototype', 'testable'],
    relatedKnowledgeIds: ['documentation'], tags: ['工作室', '技术债', '同行']
  },
  {
    id: 'text-putuo-rent-post', kind: 'listing', source: '临时项目房群公告', layer: 'public',
    text: '本周空出三晚，可做小型测试。禁止打墙；22:00 后不得外放声音；撤场时请恢复白墙。押金另算。',
    regionIds: ['region-putuo-sucreek'], facilityIds: ['putuo-project-room'], opportunityIds: ['opp-artist-run-show'],
    tags: ['项目房', '限制', '场地']
  },
  {
    id: 'text-putuo-loading-note', kind: 'field-note', source: '你在装卸口记下', layer: 'direct',
    text: '门宽比结构件短 11 厘米。效果图里这 11 厘米不存在，但今天它决定了作品能不能进去。',
    regionIds: ['region-putuo-sucreek'], facilityIds: ['putuo-loading-door'], relatedKnowledgeIds: ['site-survey'],
    tags: ['物流', '尺寸', '现场']
  },
  {
    id: 'text-lin-message', kind: 'message', source: '林', layer: 'direct',
    text: '“你先把现在这个版本带过来。别发十分钟录屏，我只想看它连续跑的时候哪里开始变无聊。”',
    regionIds: ['region-putuo-sucreek'], contactIds: ['contact-lin'], projectStageIds: ['prototype', 'testable'],
    tags: ['同行反馈', '版本', '节奏']
  },
  {
    id: 'text-m-process', kind: 'message', source: 'M', layer: 'direct',
    text: '“上次你只拍了成片，所以现在没人知道它是怎么搭起来的。下次先拍失败的那二十分钟。”',
    regionIds: ['region-putuo-sucreek'], contactIds: ['contact-m'], relatedKnowledgeIds: ['documentation'],
    tags: ['文档', '影像', '失败']
  },
  {
    id: 'text-westbund-public-copy', kind: 'institution-copy', source: '场地方公开说明', layer: 'public',
    text: '空间可支持多媒体展演、公共项目及跨媒介活动。技术需求需提前确认，最终以现场条件与安全规范为准。',
    regionIds: ['region-westbund'], facilityIds: ['westbund-blackbox', 'westbund-riverside'],
    relatedKnowledgeIds: ['institutional-language', 'technical-rider'], tags: ['机构语言', '场地']
  },
  {
    id: 'text-westbund-tech-message', kind: 'message', source: '李工', layer: 'direct',
    text: '“‘支持 4K’没有意义。你到底几路、多少帧、什么接口、有没有备机？这四个先回我。”',
    regionIds: ['region-westbund'], facilityIds: ['westbund-blackbox'], contactIds: ['contact-li-tech'],
    opportunityIds: ['opp-blackbox-two-hours', 'opp-public-screen'], relatedKnowledgeIds: ['technical-rider'],
    tags: ['技术单', '信号', '现场']
  },
  {
    id: 'text-westbund-opening-rumor', kind: 'rumor', source: '开幕现场转述', layer: 'rumor',
    text: '有人说下个月会临时空出一段屏幕档期；另一个人说那只是招商方案，还没有真正排期。',
    regionIds: ['region-westbund'], opportunityIds: ['opp-public-screen'], tags: ['排期', '公共屏', '不确定']
  },
  {
    id: 'text-westbund-field', kind: 'field-note', source: '滨江勘场记录', layer: 'direct',
    text: '下午五点以后玻璃反射突然变重；站在规划图里的“最佳观看点”时，实际有人不断从画面前穿过。',
    regionIds: ['region-westbund'], facilityIds: ['westbund-riverside'], relatedKnowledgeIds: ['site-survey'],
    tags: ['公共空间', '光线', '动线']
  },
  {
    id: 'text-huangpu-opening', kind: 'overheard', source: '开幕酒会', layer: 'secondhand',
    text: '“他那个作品我还没看懂，不过安装团队说做了三天。”——这句话在十分钟后被另一个人转述成“制作规模很大”。',
    regionIds: ['region-huangpu-riverside'], facilityIds: ['huangpu-opening-floor'], tags: ['开幕', '传播', '误读']
  },
  {
    id: 'text-huangpu-open-call', kind: 'listing', source: '项目公开征集', layer: 'public',
    text: '征集强调“跨学科、未来性与公众参与”，但制作支持一栏只写了“根据项目实际情况协商”。',
    regionIds: ['region-huangpu-riverside'], facilityIds: ['huangpu-public-program'], opportunityIds: ['opp-open-call-small-space'],
    relatedKnowledgeIds: ['open-call', 'institutional-language'], tags: ['征集', '预算', '机构语言']
  },
  {
    id: 'text-qiao-scope', kind: 'message', source: '乔', layer: 'direct',
    text: '“你别先问总预算。先问视觉、服务器、播控、现场值守是不是同一个 Scope。不是的话就拆开。”',
    regionIds: ['region-huangpu-riverside'], contactIds: ['contact-qiao'], opportunityIds: ['opp-brand-demo'],
    relatedKnowledgeIds: ['production-scope'], tags: ['预算', 'Scope', '制作']
  },
  {
    id: 'text-yangpu-lab-board', kind: 'listing', source: '实验室白板', layer: 'direct',
    text: '本周遗留：摄像头延迟 180ms；网页端重连失败；一个学生写了“先别修，也许这就是作品”。下面有人画了一个问号。',
    regionIds: ['region-yangpu'], facilityIds: ['yangpu-university-lab'], projectStageIds: ['prototype', 'testable'],
    tags: ['实验', '错误', '方法']
  },
  {
    id: 'text-yangpu-cafe-feed', kind: 'feed', source: '附近群聊截图', layer: 'secondhand',
    text: '有人问“最近哪里有新媒体征集”，三个人发了同一个链接，第四个人只回了一句：“先看有没有制作费。”',
    regionIds: ['region-yangpu'], facilityIds: ['yangpu-peer-cafe'], opportunityIds: ['opp-open-call-small-space'],
    tags: ['群聊', '征集', '同行']
  },
  {
    id: 'text-chen-project-page', kind: 'message', source: '陈', layer: 'direct',
    text: '“项目页别先写艺术史。第一屏让我知道：它在哪里发生、观众看到什么、你现在缺什么。”',
    regionIds: ['region-yangpu'], contactIds: ['contact-chen'], relatedKnowledgeIds: ['documentation'],
    tags: ['机构', '项目页', '文档']
  },
  {
    id: 'text-pudong-deck', kind: 'institution-copy', source: '演示厅方案页', layer: 'public',
    text: '“AI 驱动的沉浸式实时交互体验”占了标题两行，后面的技术页只写了“一台高性能工作站”。',
    regionIds: ['region-pudong-zhangjiang'], facilityIds: ['pudong-tech-demo'], tags: ['技术包装', '方案', 'AI']
  },
  {
    id: 'text-pudong-client', kind: 'overheard', source: '客户会议室', layer: 'direct',
    text: '“视觉这块确定了。网络和播控你们应该也能顺便处理吧？”会议进行到这里，项目范围第一次发生了变化。',
    regionIds: ['region-pudong-zhangjiang'], facilityIds: ['pudong-client-room'], opportunityIds: ['opp-brand-demo'],
    relatedKnowledgeIds: ['production-scope'], tags: ['客户', 'Scope', '委托']
  },
  {
    id: 'text-compute-service', kind: 'review', source: '同行的使用备注', layer: 'secondhand',
    text: '远程算力确实省了十几个小时，但上传、版本和恢复路径没整理好时，也能把一个半小时的问题变成两天。',
    regionIds: ['region-pudong-zhangjiang'], facilityIds: ['pudong-compute-service'], projectStageIds: ['testable', 'production'],
    relatedKnowledgeIds: ['documentation'], tags: ['算力', '版本', '恢复']
  },
  {
    id: 'text-songjiang-dai', kind: 'message', source: '戴师傅', layer: 'direct',
    text: '“尺寸和重量先发。你说‘大概一个人能搬’没用，搬的人是谁也得写清楚。”',
    regionIds: ['region-songjiang'], facilityIds: ['songjiang-workshop'], contactIds: ['contact-dai'],
    relatedKnowledgeIds: ['site-survey'], tags: ['制作', '物流', '结构']
  },
  {
    id: 'text-songjiang-night', kind: 'field-note', source: '郊区工作室 / 01:13', layer: 'direct',
    text: '城市里的消息安静下来以后，你第一次听见设备风扇本身有多响。这个声音在白天的工作室里从来没被当成问题。',
    regionIds: ['region-songjiang'], facilityIds: ['songjiang-suburban-studio'], tags: ['夜间', '声音', '观察']
  },
  {
    id: 'text-hongqiao-case', kind: 'field-note', source: '出发前检查', layer: 'direct',
    text: '航空箱已经合上，最后发现唯一一根特殊转接头还插在工作室测试机上。项目此刻离它 27 公里。',
    regionIds: ['region-hongqiao'], facilityIds: ['hongqiao-departure', 'hongqiao-logistics'], tags: ['异地', '备份', '物流']
  },
  {
    id: 'text-hangzhou-open-studio', kind: 'overheard', source: 'Open Studio 观众', layer: 'secondhand',
    text: '“我更喜欢你桌上那个没做完的版本。”你花了两周整理的正式展示在旁边继续播放。',
    regionIds: ['region-hangzhou'], facilityIds: ['hangzhou-open-studio'], opportunityIds: ['opp-hangzhou-week'],
    projectStageIds: ['prototype', 'testable', 'production', 'public'], tags: ['公开测试', '观众', '未完成']
  },
  {
    id: 'text-hangzhou-residency', kind: 'memory', source: '驻留第三天', layer: 'direct',
    text: '真正被改变的不是作品尺寸，而是你终于连续三天只处理同一个问题，没有被新的工作消息切走。',
    regionIds: ['region-hangzhou'], facilityIds: ['hangzhou-residency-flat'], tags: ['驻留', '时间', '注意力']
  },
  {
    id: 'text-shenzhen-market', kind: 'overheard', source: '硬件市场柜台', layer: 'direct',
    text: '“这个协议理论上不支持，但你要今天拿走，我给你试一个别的板子。”——技术路线在十分钟里换了一次。',
    regionIds: ['region-shenzhen'], facilityIds: ['shenzhen-hardware-market'], tags: ['硬件', '供应链', '原型']
  },
  {
    id: 'text-shenzhen-live', kind: 'review', source: '演出后后台消息', layer: 'secondhand',
    text: '观众没人知道你临时切到了保底状态。只有灯光师回头看了你一眼，然后继续下一首。',
    regionIds: ['region-shenzhen'], facilityIds: ['shenzhen-blackbox'], opportunityIds: ['opp-emergency-live'],
    tags: ['现场', '容错', '协作']
  },
  {
    id: 'text-general-feed', kind: 'feed', source: '艺术圈信息流', layer: 'public',
    text: '今天同时出现了四条消息：一个征集延长截止、一个活动取消、一台二手投影机转让、还有人问谁认识靠谱的现场网络。',
    tags: ['信息流', '机会', '日常']
  },
  {
    id: 'text-general-rumor', kind: 'rumor', source: '同行转述', layer: 'rumor',
    text: '“听说那个项目预算还可以。”没有人说得出“还可以”是多少钱，也没人确定这句话最初是谁说的。',
    projectStageIds: ['clue', 'prototype', 'testable', 'production'], tags: ['预算', '传闻', '信息距离']
  },
  {
    id: 'text-general-theory', kind: 'theory', source: '旧文本摘记', layer: 'public',
    text: '技术、机构、市场和艺术判断不是四条独立进度条。它们只是同一个项目在不同场域里被重新解释的方式。',
    projectStageIds: ['prototype', 'testable', 'production', 'public'], relatedKnowledgeIds: ['shanghai-media-ecology'],
    tags: ['场域', '方法', '项目']
  }
];

export const relationshipEdges: RelationshipEdge[] = [
  {
    id: 'rel-lin-li', fromContactId: 'contact-lin', toContactId: 'contact-li-tech', kind: 'recommends',
    label: '林以前找李工测过一次输出', note: '林说他讲话很短，但你把规格写清楚以后会认真回。'
  },
  {
    id: 'rel-li-dai', fromContactId: 'contact-li-tech', toContactId: 'contact-dai', kind: 'worked-with',
    label: '在一次临时搭建里合作过', note: '一个盯信号，一个盯结构；两个人都讨厌“差不多”。'
  },
  {
    id: 'rel-qiao-chen', fromContactId: 'contact-qiao', toContactId: 'contact-chen', kind: 'knows-of',
    label: '知道彼此，但工作语境不同', note: '乔更关心谁负责制作，陈更关心项目能否被机构内部说明。'
  },
  {
    id: 'rel-chen-m', fromContactId: 'contact-chen', toContactId: 'contact-m', kind: 'recommends',
    label: '陈见过 M 的一次现场记录', note: '他说那组过程照片比最终效果图更容易让同事理解项目怎么发生。'
  },
  {
    id: 'rel-m-lin', fromContactId: 'contact-m', toContactId: 'contact-lin', kind: 'worked-with',
    label: '一起做过一次很小的记录', note: '两个人对“作品什么时候算完成”一直意见不同。'
  },
  {
    id: 'rel-dai-qiao', fromContactId: 'contact-dai', toContactId: 'contact-qiao', kind: 'introduced-by',
    label: '通过一个制作项目认识', note: '乔找得到项目，戴师傅会先问尺寸；他们互相需要，也互相嫌对方信息给得晚。'
  }
];

function stableNoise(key: string): number {
  let hash = 2166136261;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function matchScore(fragment: WorldTextFragment, context: TextContext): number {
  let score = 0;
  if (!fragment.regionIds?.length && !fragment.facilityIds?.length && !fragment.contactIds?.length) score += 0.6;
  if (context.regionId && fragment.regionIds?.includes(context.regionId)) score += 4;
  if (context.facilityId && fragment.facilityIds?.includes(context.facilityId)) score += 6;
  if (context.contactId && fragment.contactIds?.includes(context.contactId)) score += 7;
  if (context.projectStageId && fragment.projectStageIds?.includes(context.projectStageId)) score += 2;
  return score;
}

export function contextualFragments(context: TextContext): WorldTextFragment[] {
  const limit = Math.max(1, context.limit || 3);
  return worldTextFragments
    .map((fragment, index) => ({
      fragment,
      index,
      score: matchScore(fragment, context),
      noise: stableNoise(`${context.week}:${context.regionId || ''}:${context.facilityId || ''}:${context.contactId || ''}:${fragment.id}`)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.noise - a.noise || a.index - b.index)
    .slice(0, limit)
    .map((item) => item.fragment);
}

export function relationshipEdgesFor(contactId: string): RelationshipEdge[] {
  return relationshipEdges.filter((edge) => edge.fromContactId === contactId || edge.toContactId === contactId);
}

export function fragmentsForKnowledge(knowledgeId: string, week = 1, limit = 4): WorldTextFragment[] {
  return worldTextFragments
    .filter((fragment) => fragment.relatedKnowledgeIds?.includes(knowledgeId))
    .map((fragment, index) => ({ fragment, index, noise: stableNoise(`${week}:${knowledgeId}:${fragment.id}`) }))
    .sort((a, b) => b.noise - a.noise || a.index - b.index)
    .slice(0, limit)
    .map((item) => item.fragment);
}

export function textKindLabel(kind: TextKind): string {
  const labels: Record<TextKind, string> = {
    message: '消息',
    overheard: '听到',
    'field-note': '现场',
    rumor: '传闻',
    listing: '公告',
    'institution-copy': '公开话术',
    feed: '信息流',
    review: '反馈',
    theory: '摘记',
    memory: '记忆'
  };
  return labels[kind];
}
