import type { NarrativeState } from './narrativeEngine.ts';

export type CostaRicaWorldSnapshot = {
  unlockNodeIds?: string[];
  evidenceIds?: string[];
  methodIds?: string[];
  researchIds?: string[];
  achievementIds?: string[];
  qualitySignals?: string[];
  projectTags?: string[];
};

export type RouteStage = {
  id: string;
  label: string;
  detail: string;
  state: 'done' | 'current' | 'upcoming';
};

export type RouteAsset = {
  id: string;
  kind: 'brief' | 'field-note' | 'dataset' | 'solve-report' | 'failed-build' | 'spatial-data' | 'behavior-rule' | 'public-record';
  title: string;
  detail: string;
  use: string;
};

export type RouteMemento = {
  id: string;
  kind: 'travel' | 'object' | 'memory' | 'failure' | 'people';
  title: string;
  detail: string;
};

const stageOrder = ['invite', 'travel', 'field', 'workbench', 'public', 'archive'];

function stageIndex(nodeId: string, flags: Set<string>) {
  if (nodeId === 'bs-end') return 5;
  if (nodeId === 'bs-05-public') return 4;
  if (nodeId.startsWith('bs-04')) return 3;
  if (nodeId.startsWith('bs-03')) return 2;
  if (nodeId === 'bs-02-arrival' || flags.has('accepted-field-trip')) return 1;
  return 0;
}

export function deriveCostaRicaRouteStages(state: NarrativeState): RouteStage[] {
  const flags = new Set(state.flags || []);
  const current = stageIndex(state.currentNodeId, flags);
  const templates = [
    ['invite', '邀请', flags.has('accepted-field-trip') ? '已确认接案' : '等待确认是否出发'],
    ['travel', '行程', flags.has('accepted-field-trip') ? '哥斯达黎加驻地行程已建立' : '尚未建立'],
    ['field', '现场', flags.has('field-recapture') ? '完成采集并补拍' : flags.has('capture-gap-debt') ? '采集完成 / 带回已知缺口' : flags.has('capture-relation-route') || flags.has('capture-space-route') || flags.has('capture-ethical-trace') ? '采集进行中' : '等待进入样地'],
    ['workbench', '工作室', flags.has('failure-used-as-form') ? '脆弱版本继续制作' : flags.has('solve-repaired') ? '失败版保留 / 可用版已修' : flags.has('diagnosed-camera-solve') ? '技术诊断完成' : flags.has('forced-reconstruct-bad-solve') ? '失败版本已生成' : '等待处理数据'],
    ['public', '公开', flags.has('institutional-boundary-written') || flags.has('role-conflict-separated') ? '公开边界已确认' : flags.has('authorship-attributed') || flags.has('authorship-system-shift') || flags.has('authorship-unresolved') ? '进入公开前判断' : '尚未公开'],
    ['archive', '归档', flags.has('butterfly-route-complete') ? '章节经历已归档' : '等待归档']
  ] as const;
  return templates.map(([id, label, detail], index) => ({ id, label, detail, state: index < current ? 'done' : index === current ? 'current' : 'upcoming' }));
}

export function deriveCostaRicaAssets(state: NarrativeState, world: CostaRicaWorldSnapshot = {}): RouteAsset[] {
  const flags = new Set(state.flags || []);
  const evidence = new Set(world.evidenceIds || []);
  const assets: RouteAsset[] = [];
  if (flags.has('accepted-field-trip')) assets.push({ id: 'CR-BRIEF-01', kind: 'brief', title: '一周驻地邀请', detail: '机票、住宿、能进哪片样地、哪些资料不能公开。', use: '以后再合作，不用重新猜一次边界。' });
  if (evidence.has('ev-butterfly-two-second')) assets.push({ id: 'CR-FIELD-1.8S', kind: 'field-note', title: '那只停了 1.8 秒的蝴蝶', detail: '它从哪来、停在哪、往哪飞。', use: '以后还能把这段运动放进别的作品。' });
  if (flags.has('capture-relation-route') || flags.has('capture-space-route') || flags.has('capture-ethical-trace')) assets.push({ id: 'CR-PHOTOSET-01', kind: 'dataset', title: '现场照片和观察记录', detail: flags.has('field-recapture') ? '80 张照片；小径转角后来补拍完整了。' : flags.has('capture-gap-debt') ? '80 张照片；叶片背面和小径转角没有拍全。' : '照片、观察记录和当天的现场情况。', use: '下次继续做，不必假装这次什么都没漏。' });
  if (flags.has('diagnosed-camera-solve') || flags.has('forced-reconstruct-bad-solve') || flags.has('solve-repaired')) assets.push({ id: 'CR-SOLVE-01', kind: 'solve-report', title: '哪些照片没对上的记录', detail: flags.has('solve-repaired') ? '坏版本留着；能用的版本已经修好。' : flags.has('diagnosed-camera-solve') ? '问题找到了，可以继续做。' : '照片在小径转角断开了。', use: '下次先检查这里，少熬一个晚上。' });
  if (flags.has('forced-reconstruct-bad-solve')) assets.push({ id: 'FAIL_01', kind: 'failed-build', title: '那个坏版本', detail: '叶片变成两层，转角断了，几张照片飘错了位置。', use: '可以拿来复盘，也可以在说清来由以后继续改。' });
  if (flags.has('representation-pointcloud')) assets.push({ id: 'CR-SPACE-PC01', kind: 'spatial-data', title: '保留断裂的空间版本', detail: '观众会直接看到孔洞和没有拍全的地方。', use: '以后还能清理、修改或放进另一件作品。' });
  if (flags.has('representation-gaussian')) assets.push({ id: 'CR-SPACE-GS01', kind: 'spatial-data', title: '更容易走进去的空间版本', detail: '观看比较连续；漏拍的地方仍然写在记录里。', use: '以后还能继续修改或拿去现场测试。' });
  if (flags.has('motion-interactive-butterfly') || flags.has('motion-physics') || flags.has('motion-procedural')) assets.push({ id: 'CR-RULE-01', kind: 'behavior-rule', title: '画面怎么动的规则', detail: flags.has('motion-interactive-butterfly') ? '观众靠近时，画面会停下、逃开或聚在一起。' : flags.has('motion-physics') ? '风和碰撞继续改变画面。' : '空间会一直轻微走样。', use: '以后可以换材料，继续试这套运动。' });
  if (flags.has('butterfly-route-complete')) assets.push({ id: 'CR-PUBLIC-01', kind: 'public-record', title: '第一次公开测试记录', detail: '谁看了、哪里没看懂、哪些材料能公开。', use: '下次修改时，从真实反应开始。' });
  return assets;
}

export function deriveCostaRicaMementos(state: NarrativeState, world: CostaRicaWorldSnapshot = {}): RouteMemento[] {
  const flags = new Set(state.flags || []);
  const evidence = new Set(world.evidenceIds || []);
  const achievements = new Set(world.achievementIds || []);
  const items: RouteMemento[] = [];
  if (flags.has('accepted-field-trip')) items.push({ id: 'M-CR-TICKET', kind: 'travel', title: '哥斯达黎加往返电子行程单', detail: '第一次把一个半开玩笑的“蝴蝶学者”身份真的写进行程。' });
  if (state.currentNodeId !== 'bs-01-invite') items.push({ id: 'M-CR-BADGE', kind: 'object', title: 'Bosque Field Lab 门禁卡', detail: '卡背面有样地编号和一个已经蹭花的日期。' });
  if (evidence.has('ev-butterfly-two-second')) items.push({ id: 'M-CR-18S', kind: 'memory', title: '1.8 秒', detail: '一只蝴蝶停得不够久，反而让你第一次把“运动”和“空间”拆开。' });
  if (flags.has('forced-reconstruct-bad-solve')) items.push({ id: 'M-CR-FAIL01', kind: 'failure', title: '坏版本截图', detail: '一张不漂亮但以后很可能比“成功版”更有用的错误图。' });
  if (flags.has('role-conflict-separated') || flags.has('institutional-boundary-written')) items.push({ id: 'M-CR-INSTITUTION', kind: 'people', title: '被划过两次的数据许可表', detail: '一次合作里，谁提供材料、谁评估你、谁决定公开，并不是同一件事。' });
  if (achievements.has('ach-special-butterfly-complete') || flags.has('butterfly-route-complete')) items.push({ id: 'M-CR-STICKER', kind: 'object', title: '临时展厅撤场贴纸', detail: '作品已经拆掉，贴纸还留着。章节结束，材料没有消失。' });
  return items;
}

export const costaRicaChoiceProgressNotice: Record<string, { title: string; detail: string; serious?: boolean }> = {
  'bs-go-question': { title: '驻地 / 已确认', detail: '邀请已接受。Brief 与往返行程进入记录。' },
  'bs-go-open': { title: '驻地 / 已确认', detail: '邀请已接受。媒介保持开放，往返行程进入记录。' },
  'bs-arrival-work': { title: '现场权限 / 已确认', detail: '样地、采集范围与数据边界进入当前任务状态。' },
  'bs-arrival-prior': { title: '人物线索 / 未解决', detail: 'Inés 为什么知道旧作品，将继续影响后续信息判断。', serious: true },
  'bs-capture-relation': { title: '采集方案 / 已建立', detail: '行为数据与空间数据分轨生产。' },
  'bs-capture-site': { title: '采集方案 / 已建立', detail: '空间数据优先，行为层暂时延后。' },
  'bs-capture-trace': { title: '采集方案 / 已建立', detail: '不捕捉活体；痕迹、时间与关系成为主要材料。', serious: true },
  'bs-audit-recapture': { title: '数据集 / 已更新', detail: '补拍加入 CR-PHOTOSET-01；后续求解可靠性提高。' },
  'bs-audit-leave': { title: '数据集 / 带风险离场', detail: '覆盖缺口进入 CR-PHOTOSET-01；技术债将在工作室显形。', serious: true },
  'bs-align-force': { title: '工作室 / 高风险操作', detail: '你选择让错误继续生成；失败版本会成为真实 Asset。', serious: true },
  'bs-authorship-source': { title: '作者性 / 来源已写清', detail: '引用、方法与差异进入公开档案。', serious: true },
  'bs-authorship-system': { title: '作者性 / 作品结构改变', detail: '蝴蝶从图像母题退到行为系统。', serious: true },
  'bs-authorship-defend': { title: '作者性 / 保持开放', detail: '争议不会自动消失，公开测试将继续追问。', serious: true },
  'bs-reveal-listen': { title: '机构边界 / 已确认', detail: '数据许可、公开范围与合作责任写入记录。', serious: true },
  'bs-reveal-distance': { title: '机构角色 / 已拆分', detail: '协作人与评估人不再由同一角色承担。', serious: true },
  'bs-archive-open': { title: '哥斯达黎加 / 已归档', detail: '知识、节点、Assets、纪念品和未解决问题都将继续留在长期记录。' }
};

export function emphasizeChoiceHint(choiceId: string, hint = '') {
  return costaRicaChoiceProgressNotice[choiceId]?.serious ? `重要选择 · ${hint}` : hint;
}

export { stageOrder };
