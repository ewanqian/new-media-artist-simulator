import type { EditorNodeDefinition, EditorParam, EditorPortType } from './blueprintEditorCatalog.ts';

const input = (id: string, label: string, type: EditorPortType) => ({ id, label, direction: 'in' as const, type });
const output = (id: string, label: string, type: EditorPortType) => ({ id, label, direction: 'out' as const, type });
const range = (id: string, label: string, defaultValue: number, min: number, max: number, unit = '', step = 1): EditorParam => ({ id, label, kind: 'range', defaultValue, min, max, unit, step });
const select = (id: string, label: string, defaultValue: string, options: string[]): EditorParam => ({ id, label, kind: 'select', defaultValue, options });
const text = (id: string, label: string, defaultValue: string): EditorParam => ({ id, label, kind: 'text', defaultValue });
const toggle = (id: string, label: string, defaultValue = false): EditorParam => ({ id, label, kind: 'toggle', defaultValue });

/**
 * The Butterfly Scholar pack deliberately exposes workflow decisions rather than
 * mirroring every button in Metashape/COLMAP/nerfstudio. A beginner should be
 * able to understand the pipeline after one playthrough; advanced players can
 * still read the real technical consequences from ports and parameters.
 */
export const butterflyScholarNodeDefinitions: EditorNodeDefinition[] = [
  {
    id: 'butterfly-observation', label: '蝴蝶观察记录', group: '输入',
    summary: '把“看见 / 没看见”与时间、天气、地点、寄主植物一起记录。没有出现也可以是数据。',
    ports: [output('record', '观察记录', 'data'), output('relation', '生态关系', 'concept')],
    params: [text('species', '对象', '目标蝴蝶 / 未确认'), text('hostPlant', '寄主植物', '未知'), select('presence', '是否出现', '出现', ['出现', '未出现', '不确定'])],
    tags: ['蝴蝶', '观察', '生态', '时间']
  },
  {
    id: 'plant-specimen', label: '植物标本 / 叶片记录', group: '输入',
    summary: '保存植物的形态、标签与采集上下文；缺失标签必须显式保留为未知。',
    ports: [output('image', '图像 / 扫描', 'video'), output('metadata', '标本信息', 'data')],
    params: [text('name', '名称', '未确认植物'), text('label', '标签', '地点 / 日期 / 采集者'), toggle('incomplete', '标签不完整', false)],
    tags: ['植物', '标本', '档案']
  },
  {
    id: 'capture-photo-sequence', label: '摄影测量采集', group: '输入',
    summary: '围绕对象移动拍摄，让同一表面在多张照片中反复出现；重点是重叠、视角变化与稳定光照。',
    ports: [input('subject', '采集对象', 'space'), output('photos', '照片序列', 'data')],
    params: [range('photos', '照片数量', 80, 12, 600, '张', 1), select('overlap', '重叠程度', '高', ['低', '中', '高']), select('lighting', '光照一致性', '较稳定', ['变化很大', '一般', '较稳定']), select('viewpoints', '视角变化', '充分', ['不足', '一般', '充分'])],
    tags: ['摄影测量', '采集', 'Metashape', 'COLMAP', '重叠']
  },
  {
    id: 'capture-lidar-pass', label: 'LiDAR / 深度扫描', group: '输入',
    summary: '快速取得空间尺度和粗几何，可与照片互补；薄叶、远距离和遮挡仍会产生缺口。',
    ports: [input('subject', '空间对象', 'space'), output('depth', '深度 / 点', 'data')],
    params: [select('device', '设备', '手机 / 平板 LiDAR', ['手机 / 平板 LiDAR', '手持扫描仪', '地面激光扫描']), range('passes', '扫描遍数', 2, 1, 12, '遍', 1)],
    tags: ['LiDAR', '深度', '点云', '空间采集']
  },
  {
    id: 'capture-quality-check', label: '现场采集检查', group: '处理',
    summary: '离开现场前检查模糊、漏拍、反光、曝光突变和覆盖缺口。',
    ports: [input('capture', '采集数据', 'data'), output('approved', '可处理数据', 'data'), output('issues', '缺口 Note', 'concept')],
    params: [toggle('blur', '发现明显模糊', false), toggle('missing', '发现覆盖缺口', false), toggle('specular', '强反光 / 水面', false), toggle('lightingShift', '光照变化明显', false)],
    tags: ['检查', '采集', '覆盖', '失败预防']
  },
  {
    id: 'process-metashape-align', label: 'Metashape · 照片对齐', group: '处理',
    summary: '先估计相机位置与稀疏结构。对齐失败意味着后续重建基础不可靠。',
    ports: [input('photos', '照片序列', 'data'), output('cameras', '相机位姿', 'data'), output('sparse', '稀疏点', 'data')],
    params: [select('accuracy', '对齐精度', '中', ['低', '中', '高']), range('aligned', '成功对齐', 90, 0, 100, '%', 1)],
    tags: ['Metashape', 'Align Photos', 'SfM', '相机位姿']
  },
  {
    id: 'process-colmap-sfm', label: 'COLMAP · SfM', group: '处理',
    summary: '特征提取 → 匹配验证 → 结构与相机重建。用来理解照片为什么能形成三维结构。',
    ports: [input('photos', '照片序列', 'data'), output('cameras', '相机位姿', 'data'), output('sparse', '稀疏重建', 'data')],
    params: [select('matching', '匹配策略', '自动', ['自动', '顺序照片', '全局匹配']), range('registered', '注册照片', 90, 0, 100, '%', 1)],
    tags: ['COLMAP', 'SfM', '特征匹配', '开源']
  },
  {
    id: 'process-dense-reconstruction', label: '稠密重建 / 点云', group: '处理',
    summary: '从已求解的相机与照片生成更密的空间采样；适合继续做点云、网格或测量。',
    ports: [input('cameras', '相机 / 稀疏重建', 'data'), output('cloud', '稠密点云', 'data')],
    params: [select('detail', '细节', '中', ['预览', '中', '高']), range('millions', '目标点数', 8, 1, 80, 'M', 1)],
    tags: ['点云', 'MVS', 'Dense Reconstruction']
  },
  {
    id: 'process-gaussian-splat', label: 'Gaussian Splatting', group: '处理',
    summary: '用大量三维高斯表示空间外观，适合快速连续渲染；它不是“更高级的点云”，而是另一种表示。',
    ports: [input('cameras', '相机位姿 + 图像', 'data'), output('splat', 'Gaussian 场景', 'data')],
    params: [range('iterations', '训练强度', 30, 5, 100, '%', 5), select('goal', '优先目标', '预览速度', ['预览速度', '细节', '稳定性'])],
    tags: ['Gaussian Splatting', '3DGS', 'Splatfacto', '高斯']
  },
  {
    id: 'process-point-clean', label: '点云清理', group: '处理',
    summary: '裁掉无关区域、删浮点、统一尺度；是否修补缺口必须由作品决定。',
    ports: [input('cloud', '点云 / 高斯', 'data'), output('clean', '整理后空间', 'data'), output('removed', '被移除部分', 'data')],
    params: [range('cleanup', '清理程度', 40, 0, 100, '%', 5), toggle('preserveGaps', '保留有意义的缺口', true)],
    tags: ['点云', '清理', '裁剪', '缺口']
  },
  {
    id: 'method-preserve-gap', label: '方法：保留扫描缺口', group: '方法',
    summary: '不自动修复所有破损；把扫描无法捕捉的部分当成采集过程和现实条件的证据。',
    ports: [input('failure', '失败 / 缺口', 'concept'), output('method', '作品方法', 'concept')],
    params: [select('meaning', '缺口扮演什么', '时间痕迹', ['时间痕迹', '技术边界', '不可占有部分', '观看入口'])],
    tags: ['方法', '缺失', '扫描', '媒介反思']
  },
  {
    id: 'compose-memory-garden', label: '情感空间数字化', group: '制作',
    summary: '把空间重建、观察记录、植物档案、缺席与人物记忆组织成一个可被进入的作品规则。',
    ports: [input('space', '扫描空间', 'data'), input('records', '观察 / 档案', 'data'), input('memory', '人物 / 情感记忆', 'concept'), output('work', '作品结构', 'concept')],
    params: [select('focus', '作品核心', '关系', ['空间', '关系', '时间', '缺席']), range('publicData', '公开数据比例', 60, 0, 100, '%', 5)],
    tags: ['情感空间数字化', '作品化', '记忆', '花园']
  },
  {
    id: 'nature-decay-rule', label: '花园变化规则', group: '处理',
    summary: '让作品随观看、季节、时间或访问次数发生变化，而不是永远展示一次冻结扫描。',
    ports: [input('work', '作品状态', 'data'), input('trigger', '时间 / 观众', 'trigger'), output('changed', '变化后的状态', 'data')],
    params: [select('driver', '变化来源', '时间', ['时间', '观众靠近', '季节记录', '随机']), range('rate', '变化速度', 30, 0, 100, '%', 5)],
    tags: ['变化', '时间', '花园', '行为']
  }
];

export function buildButterflyScholarPreset() {
  return {
    schema: 'nmas-blueprint-v1' as const,
    id: 'bp-butterfly-scholar-field-capture',
    title: '哥斯达黎加的蝴蝶学者 / 第一次采集',
    revision: 1,
    nodes: [
      { id: 'bsn1', definitionId: 'project-question', x: 60, y: 90, params: { question: '数字化到底应该保存一只蝴蝶、一株植物，还是它们发生关系的时间？' } },
      { id: 'bsn2', definitionId: 'butterfly-observation', x: 280, y: 40, params: { species: '目标蝴蝶 / 未确认', hostPlant: '寄主植物 A', presence: '出现' } },
      { id: 'bsn3', definitionId: 'plant-specimen', x: 280, y: 220, params: { name: '寄主植物 A', label: '样地 / 日期 / 采集者', incomplete: false } },
      { id: 'bsn4', definitionId: 'capture-photo-sequence', x: 520, y: 100, params: { photos: 80, overlap: '高', lighting: '较稳定', viewpoints: '充分' } },
      { id: 'bsn5', definitionId: 'capture-quality-check', x: 740, y: 100, params: { blur: false, missing: false, specular: false, lightingShift: false } },
      { id: 'bsn6', definitionId: 'process-metashape-align', x: 960, y: 40, params: { accuracy: '中', aligned: 90 } },
      { id: 'bsn7', definitionId: 'process-colmap-sfm', x: 960, y: 220, params: { matching: '自动', registered: 90 } },
      { id: 'bsn8', definitionId: 'process-dense-reconstruction', x: 1180, y: 40, params: { detail: '中', millions: 8 } },
      { id: 'bsn9', definitionId: 'process-gaussian-splat', x: 1180, y: 220, params: { iterations: 30, goal: '预览速度' } },
      { id: 'bsn10', definitionId: 'process-point-clean', x: 1400, y: 120, params: { cleanup: 40, preserveGaps: true } },
      { id: 'bsn11', definitionId: 'method-preserve-gap', x: 1600, y: 40, params: { meaning: '时间痕迹' } },
      { id: 'bsn12', definitionId: 'compose-memory-garden', x: 1600, y: 220, params: { focus: '关系', publicData: 60 } },
      { id: 'bsn13', definitionId: 'nature-decay-rule', x: 1820, y: 220, params: { driver: '时间', rate: 30 } }
    ],
    edges: [
      { id: 'bse1', from: 'bsn1', to: 'bsn2', kind: 'concept' as const },
      { id: 'bse2', from: 'bsn1', to: 'bsn3', kind: 'concept' as const },
      { id: 'bse3', from: 'bsn3', to: 'bsn4', kind: 'dependency' as const },
      { id: 'bse4', from: 'bsn4', to: 'bsn5', kind: 'signal' as const },
      { id: 'bse5', from: 'bsn5', to: 'bsn6', kind: 'signal' as const },
      { id: 'bse6', from: 'bsn5', to: 'bsn7', kind: 'signal' as const },
      { id: 'bse7', from: 'bsn6', to: 'bsn8', kind: 'signal' as const },
      { id: 'bse8', from: 'bsn7', to: 'bsn9', kind: 'signal' as const },
      { id: 'bse9', from: 'bsn8', to: 'bsn10', kind: 'signal' as const },
      { id: 'bse10', from: 'bsn9', to: 'bsn10', kind: 'signal' as const },
      { id: 'bse11', from: 'bsn10', to: 'bsn11', kind: 'concept' as const },
      { id: 'bse12', from: 'bsn2', to: 'bsn12', kind: 'concept' as const },
      { id: 'bse13', from: 'bsn10', to: 'bsn12', kind: 'signal' as const },
      { id: 'bse14', from: 'bsn11', to: 'bsn12', kind: 'concept' as const },
      { id: 'bse15', from: 'bsn12', to: 'bsn13', kind: 'signal' as const }
    ],
    notes: ['这张图不是软件教程。它把一次野外采集从“拍素材”变成“决定什么值得被保存、如何被重建、为什么要公开”的作品流程。']
  };
}
