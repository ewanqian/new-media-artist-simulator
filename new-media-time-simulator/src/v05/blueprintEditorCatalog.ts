import { blueprintNodeDefinitions } from './blueprintSystem.ts';
import { butterflyScholarNodeDefinitions, buildButterflyScholarPreset } from './butterflyScholarNodes.ts';

export type EditorPortType = 'video' | 'audio' | 'data' | 'trigger' | 'control' | 'resource' | 'space' | 'concept' | 'power';
export type EditorParamKind = 'number' | 'range' | 'text' | 'select' | 'toggle';

export type EditorPort = {
  id: string;
  label: string;
  direction: 'in' | 'out';
  type: EditorPortType;
};

export type EditorParam = {
  id: string;
  label: string;
  kind: EditorParamKind;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: string[];
  defaultValue: string | number | boolean;
};

export type EditorNodeDefinition = {
  id: string;
  label: string;
  group: '输入' | '处理' | '输出' | '制作' | '资源' | '场域' | '方法' | '注释';
  summary: string;
  ports: EditorPort[];
  params: EditorParam[];
  tags: string[];
};

const input = (id: string, label: string, type: EditorPortType): EditorPort => ({ id, label, direction: 'in', type });
const output = (id: string, label: string, type: EditorPortType): EditorPort => ({ id, label, direction: 'out', type });
const num = (id: string, label: string, defaultValue: number, min: number, max: number, unit = '', step = 1): EditorParam => ({ id, label, kind: 'range', defaultValue, min, max, unit, step });
const text = (id: string, label: string, defaultValue = ''): EditorParam => ({ id, label, kind: 'text', defaultValue });

function inferLegacyGroup(category: string): EditorNodeDefinition['group'] {
  if (category === 'media' || category === 'interface') return '输入';
  if (category === 'process' || category === 'behavior') return '处理';
  if (category === 'material' || category === 'spatial') return '输出';
  if (category === 'lineage') return '方法';
  if (category === 'constraint') return '场域';
  return '制作';
}

function inferPorts(category: string): EditorPort[] {
  if (category === 'media' || category === 'interface') return [output('out', '输出', category === 'media' ? 'video' : 'trigger')];
  if (category === 'process' || category === 'behavior') return [input('in', '输入', 'data'), output('out', '输出', 'data')];
  if (category === 'material') return [input('in', '信号', 'video'), input('power', '供电', 'power')];
  if (category === 'spatial') return [input('object', '对象', 'space'), output('space', '空间关系', 'space')];
  if (category === 'lineage') return [output('concept', '方法', 'concept')];
  if (category === 'constraint') return [output('constraint', '约束', 'resource')];
  return [];
}

const legacyDefinitions: EditorNodeDefinition[] = blueprintNodeDefinitions.map((item) => ({
  id: item.id,
  label: item.label,
  group: inferLegacyGroup(item.category),
  summary: item.summary,
  ports: inferPorts(item.category),
  params: [],
  tags: [item.category, item.family, ...(item.tags || [])]
}));

const productionDefinitions: EditorNodeDefinition[] = [
  {
    id: 'prod-led-wall', label: 'LED 屏', group: '输出', summary: '把真实 LED 规格作为作品和制作约束的一部分。',
    ports: [input('video', '视频', 'video'), input('control', '控制', 'control'), input('power', '供电', 'power'), output('surface', '显示面', 'space')],
    params: [num('widthM', '宽度', 6, 1, 30, 'm', 0.5), num('heightM', '高度', 3, 1, 15, 'm', 0.5), num('pixelPitch', '点间距', 2.6, 0.9, 10, 'mm', 0.1), num('brightness', '亮度', 1200, 300, 6000, 'nit', 100)],
    tags: ['LED', '屏幕', '显示', '规格']
  },
  {
    id: 'prod-projector', label: '投影机', group: '输出', summary: '投影亮度、距离和画面尺寸直接决定现场可行性。',
    ports: [input('video', '视频', 'video'), input('power', '供电', 'power'), output('image', '投影画面', 'space')],
    params: [num('lumens', '亮度', 10000, 3000, 40000, 'lm', 500), num('throwM', '投射距离', 8, 1, 30, 'm', 0.5), num('widthM', '画面宽', 6, 1, 20, 'm', 0.5)],
    tags: ['投影', '显示', '场地']
  },
  {
    id: 'prod-render-pc', label: '渲染电脑', group: '处理', summary: '把渲染能力、输出口和备份机作为明确生产节点。',
    ports: [input('data', '工程 / 数据', 'data'), output('video', '视频输出', 'video'), output('control', '控制', 'control')],
    params: [num('vramGB', '显存', 16, 4, 64, 'GB', 1), num('outputs', '视频输出口', 2, 1, 8, '路', 1), num('backup', '备份机', 0, 0, 2, '台', 1)],
    tags: ['电脑', 'GPU', '渲染', '播放']
  },
  {
    id: 'prod-mmwave-radar', label: '毫米波雷达', group: '输入', summary: '把距离、方向或存在状态转成实时数据。',
    ports: [output('data', '目标数据', 'data'), output('trigger', '事件', 'trigger')],
    params: [num('rangeM', '探测距离', 8, 1, 30, 'm', 1), num('hz', '刷新率', 20, 1, 60, 'Hz', 1), num('zones', '区域数', 4, 1, 16, '区', 1)],
    tags: ['雷达', '传感', '空间输入']
  },
  {
    id: 'prod-lighting', label: '灯光系统', group: '输出', summary: '灯具、控制协议和灯位进入同一制作图。',
    ports: [input('control', '控制', 'control'), input('power', '供电', 'power'), output('light', '光环境', 'space')],
    params: [num('fixtures', '灯具数量', 8, 1, 80, '台', 1), num('universes', 'DMX Universe', 1, 1, 8, '组', 1)],
    tags: ['灯光', 'DMX', '现场']
  },
  {
    id: 'prod-storyboard', label: '分镜 / 脚本', group: '制作', summary: '把内容准备量和制作周期明确出来，而不是只写一句“做视频”。',
    ports: [input('brief', '需求', 'concept'), output('shots', '镜头 / 段落', 'data')],
    params: [num('shots', '镜头 / 段落', 12, 1, 120, '个', 1), num('days', '制作周期', 3, 0.5, 30, '天', 0.5)],
    tags: ['分镜', '脚本', '内容']
  },
  {
    id: 'prod-designer', label: '视觉设计师', group: '资源', summary: '人力不是一个抽象数字，而是有工时和成本的生产资源。',
    ports: [input('task', '任务', 'data'), output('result', '设计输出', 'data')],
    params: [num('days', '人天', 3, 0.5, 30, '天', 0.5), num('dayRate', '日成本', 1500, 0, 10000, '元', 100)],
    tags: ['设计师', '人力', '成本']
  },
  {
    id: 'prod-technician', label: '现场技术', group: '资源', summary: '安装、信号检查、值守与撤场都消耗具体人力。',
    ports: [input('task', '现场任务', 'data'), output('ready', '就绪', 'trigger')],
    params: [num('people', '人数', 2, 1, 20, '人', 1), num('days', '工作天数', 2, 0.5, 20, '天', 0.5), num('dayRate', '人日成本', 1000, 0, 8000, '元', 100)],
    tags: ['技术', '安装', '值守']
  },
  {
    id: 'prod-budget', label: '预算池', group: '资源', summary: '项目能消耗的现金上限。',
    ports: [output('budget', '预算', 'resource')],
    params: [num('amount', '预算', 20000, 0, 500000, '元', 1000)],
    tags: ['预算', '现金', '资源']
  },
  {
    id: 'prod-setup-window', label: '搭建窗口', group: '场域', summary: '场地方真正给你的安装时间。',
    ports: [output('time', '时间限制', 'resource')],
    params: [num('hours', '可搭建时间', 6, 1, 72, '小时', 1)],
    tags: ['时间', '搭建', '场地限制']
  },
  {
    id: 'prod-power', label: '现场供电', group: '场域', summary: '把插座、电路和功率余量作为显式节点。',
    ports: [output('power', '供电', 'power')],
    params: [num('circuits', '独立回路', 2, 1, 16, '路', 1), num('kw', '总功率', 5, 1, 80, 'kW', 1)],
    tags: ['电力', '插座', '场地']
  },
  {
    id: 'prod-deadline', label: '截止日期', group: '场域', summary: '截止时间会改变内容范围、人员和风险。',
    ports: [output('deadline', '截止压力', 'resource')],
    params: [num('daysLeft', '剩余时间', 14, 1, 120, '天', 1)],
    tags: ['截止', '周期', '压力']
  },
  {
    id: 'field-note', label: '场域 Note', group: '注释', summary: '从 FIELD 带回来的观察、限制、技术信息或一句话。',
    ports: [output('concept', '可引用', 'concept')],
    params: [text('note', 'Note', '这里发生了什么？为什么值得带回工作台？')],
    tags: ['note', '笔记', '场域', '档案']
  },
  {
    id: 'project-question', label: '要解决的问题', group: '注释', summary: '项目图最上游的一句话：我们现在到底要解决什么。',
    ports: [output('question', '问题', 'concept')],
    params: [text('question', '问题', '这个项目现在真正要解决什么？')],
    tags: ['问题', '目标', 'brief']
  }
];

export const editorNodeDefinitions: EditorNodeDefinition[] = [...legacyDefinitions, ...productionDefinitions, ...butterflyScholarNodeDefinitions];
export const editorNodeById = new Map(editorNodeDefinitions.map((item) => [item.id, item]));

export const editorGroups: EditorNodeDefinition['group'][] = ['输入', '处理', '输出', '制作', '资源', '场域', '方法', '注释'];

export function defaultParamsForNode(definitionId: string): Record<string, string | number | boolean> {
  const definition = editorNodeById.get(definitionId);
  return Object.fromEntries((definition?.params || []).map((param) => [param.id, param.defaultValue]));
}

export function buildProductionPreset() {
  return {
    schema: 'nmas-blueprint-v1' as const,
    id: 'bp-production-chain',
    title: '演出 / 展览制作链',
    revision: 1,
    nodes: [
      { id: 'p1', definitionId: 'project-question', x: 80, y: 90, params: { question: '在两周内完成一套可稳定运行的现场视觉系统。' } },
      { id: 'p2', definitionId: 'prod-storyboard', x: 280, y: 90, params: { shots: 16, days: 4 } },
      { id: 'p3', definitionId: 'prod-designer', x: 480, y: 90, params: { days: 5, dayRate: 1500 } },
      { id: 'p4', definitionId: 'prod-render-pc', x: 680, y: 90, params: { vramGB: 16, outputs: 3, backup: 1 } },
      { id: 'p5', definitionId: 'prod-led-wall', x: 900, y: 90, params: { widthM: 8, heightM: 4.5, pixelPitch: 2.6, brightness: 1500 } },
      { id: 'p6', definitionId: 'prod-lighting', x: 900, y: 300, params: { fixtures: 12, universes: 2 } },
      { id: 'p7', definitionId: 'prod-technician', x: 680, y: 300, params: { people: 3, days: 2, dayRate: 1000 } },
      { id: 'p8', definitionId: 'prod-setup-window', x: 460, y: 300, params: { hours: 6 } },
      { id: 'p9', definitionId: 'prod-budget', x: 240, y: 300, params: { amount: 30000 } },
      { id: 'p10', definitionId: 'prod-deadline', x: 80, y: 300, params: { daysLeft: 14 } },
      { id: 'p11', definitionId: 'field-note', x: 480, y: 500, params: { note: '场地方：不能打孔；撤场后 1 小时必须清空。' } }
    ],
    edges: [
      { id: 'pe1', from: 'p1', to: 'p2', kind: 'concept' as const },
      { id: 'pe2', from: 'p2', to: 'p3', kind: 'dependency' as const },
      { id: 'pe3', from: 'p3', to: 'p4', kind: 'dependency' as const },
      { id: 'pe4', from: 'p4', to: 'p5', kind: 'signal' as const },
      { id: 'pe5', from: 'p7', to: 'p5', kind: 'dependency' as const },
      { id: 'pe6', from: 'p8', to: 'p7', kind: 'dependency' as const },
      { id: 'pe7', from: 'p9', to: 'p3', kind: 'dependency' as const },
      { id: 'pe8', from: 'p9', to: 'p7', kind: 'dependency' as const },
      { id: 'pe9', from: 'p10', to: 'p2', kind: 'dependency' as const },
      { id: 'pe10', from: 'p11', to: 'p8', kind: 'concept' as const }
    ],
    notes: ['这张图不是报价单替代品，而是用来读懂上下游和风险触点。']
  };
}

export { buildButterflyScholarPreset };
