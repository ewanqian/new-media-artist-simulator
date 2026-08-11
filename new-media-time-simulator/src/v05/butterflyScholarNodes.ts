import type { EditorNodeDefinition, EditorParam, EditorPortType } from './blueprintEditorCatalog.ts';

const input = (id: string, label: string, type: EditorPortType) => ({ id, label, direction: 'in' as const, type });
const output = (id: string, label: string, type: EditorPortType) => ({ id, label, direction: 'out' as const, type });
const range = (id: string, label: string, defaultValue: number, min: number, max: number, unit = '', step = 1): EditorParam => ({ id, label, kind: 'range', defaultValue, min, max, unit, step });
const select = (id: string, label: string, defaultValue: string, options: string[]): EditorParam => ({ id, label, kind: 'select', defaultValue, options });
const text = (id: string, label: string, defaultValue: string): EditorParam => ({ id, label, kind: 'text', defaultValue });
const toggle = (id: string, label: string, defaultValue = false): EditorParam => ({ id, label, kind: 'toggle', defaultValue });

/**
 * This pack intentionally models decisions, not every software button.
 * New players should understand the capture pipeline after one episode;
 * experienced players can still recognize the real tools and failure points.
 */
export const butterflyScholarNodeDefinitions: EditorNodeDefinition[] = [
  {
    id: 'butterfly-observation', label: '蝴蝶观察', group: '输入',
    summary: '记录蝴蝶是什么、什么时候出现、停在哪里、和哪株植物有关。飞着的蝴蝶不必强行扫描成 3D。',
    ports: [output('record', '观察记录', 'data'), output('relation', '蝴蝶—植物关系', 'concept')],
    params: [text('species', '对象', '目标蝴蝶 / 未确认'), text('hostPlant', '寄主植物', '未知'), select('presence', '今天看到吗', '出现', ['出现', '未出现', '不确定'])],
    tags: ['蝴蝶', '观察', '生态', '时间', '输入']
  },
  {
    id: 'plant-specimen', label: '植物 / 标本记录', group: '输入',
    summary: '保存植物图像、名称和采集信息。标签缺失也要保留，不要假装知道。',
    ports: [output('image', '图像', 'video'), output('metadata', '记录', 'data'), output('subject', '可扫描对象', 'space')],
    params: [text('name', '名称', '寄主植物 A'), text('label', '标签', '样地 / 日期 / 采集者'), toggle('incomplete', '标签不完整', false)],
    tags: ['植物', '标本', '档案', '输入']
  },
  {
    id: 'capture-photo-sequence', label: '摄影测量采集', group: '输入',
    summary: '围绕植物或小片空间移动拍照。相邻照片要反复看到同一块表面。',
    ports: [input('subject', '要扫描的对象', 'space'), output('photos', '照片序列', 'data')],
    params: [range('photos', '照片数量', 80, 12, 600, '张', 1), select('overlap', '重叠', '高', ['低', '中', '高']), select('lighting', '光照变化', '较小', ['很大', '一般', '较小']), select('viewpoints', '视角', '充分', ['不足', '一般', '充分'])],
    tags: ['摄影测量', '采集', 'Metashape', 'COLMAP', '重叠']
  },
  {
    id: 'capture-lidar-pass', label: 'LiDAR 扫描', group: '输入',
    summary: '快速拿到空间尺度和粗几何。适合环境，不适合解决所有薄叶和遮挡。',
    ports: [input('subject', '空间对象', 'space'), output('depth', '深度 / 点', 'data')],
    params: [select('device', '设备', '手机 / 平板 LiDAR', ['手机 / 平板 LiDAR', '手持扫描仪', '地面激光扫描']), range('passes', '扫描遍数', 2, 1, 12, '遍', 1)],
    tags: ['LiDAR', '深度', '点云', '空间采集']
  },
  {
    id: 'capture-quality-check', label: '离场前检查', group: '处理',
    summary: '离开现场前检查漏拍、模糊、反光和曝光突变。发现问题时，现场补拍通常最便宜。',
    ports: [input('capture', '照片 / 扫描', 'data'), output('approved', '可继续的数据', 'data'), output('issues', '问题记录', 'concept')],
    params: [toggle('blur', '明显模糊', false), toggle('missing', '覆盖缺口', true), toggle('specular', '反光 / 水面', false), toggle('lightingShift', '光照变化明显', true)],
    tags: ['检查', '采集', '覆盖', '失败预防']
  },
  {
    id: 'process-metashape-align', label: 'Metashape · 相机求解', group: '处理',
    summary: '先估计每张照片从哪里拍的。注册率和相机轨迹不可靠时，后面的重建也不可靠。',
    ports: [input('photos', '照片', 'data'), output('cameras', '相机位置', 'data'), output('sparse', '稀疏点', 'data')],
    params: [select('accuracy', '精度', '中', ['低', '中', '高']), range('aligned', '成功注册', 76, 0, 100, '%', 1)],
    tags: ['Metashape', 'Align Photos', 'SfM', '相机求解']
  },
  {
    id: 'process-colmap-sfm', label: 'COLMAP · 相机求解', group: '处理',
    summary: '开源路线：找特征、匹配照片、估计相机位置。适合看清摄影测量底层到底在做什么。',
    ports: [input('photos', '照片', 'data'), output('cameras', '相机位置', 'data'), output('sparse', '稀疏点', 'data')],
    params: [select('matching', '匹配方式', '顺序照片', ['自动', '顺序照片', '全局匹配']), range('registered', '成功注册', 76, 0, 100, '%', 1)],
    tags: ['COLMAP', 'SfM', '特征匹配', '开源']
  },
  {
    id: 'process-dense-reconstruction', label: '点云重建', group: '处理',
    summary: '把可靠的相机关系继续变成更多空间采样点。结果可以直接作为视觉材料，也可以继续进 Blender。',
    ports: [input('cameras', '相机 / 稀疏结果', 'data'), output('cloud', '点云', 'data')],
    params: [select('detail', '细节', '中', ['预览', '中', '高']), range('millions', '目标点数', 8, 1, 80, 'M', 1)],
    tags: ['点云', 'MVS', '重建']
  },
  {
    id: 'process-gaussian-splat', label: 'Gaussian Splatting', group: '处理',
    summary: '从照片和相机位置生成可连续浏览的空间外观。适合自由视角预览，不是“更高级的点云”。',
    ports: [input('cameras', '相机位置 + 图像', 'data'), output('splat', 'Gaussian 场景', 'data')],
    params: [range('iterations', '训练强度', 30, 5, 100, '%', 5), select('goal', '优先', '预览速度', ['预览速度', '细节', '稳定性'])],
    tags: ['Gaussian Splatting', '3DGS', 'Splatfacto', '高斯']
  },
  {
    id: 'process-point-clean', label: '清理扫描', group: '处理',
    summary: '删明显浮点、裁掉无关区域、整理尺度。缺口要不要补，是作品判断，不是默认按钮。',
    ports: [input('cloud', '点云 / Gaussian', 'data'), output('clean', '整理后空间', 'data'), output('removed', '被移除部分', 'data')],
    params: [range('cleanup', '清理程度', 40, 0, 100, '%', 5), toggle('preserveGaps', '保留部分缺口', true)],
    tags: ['点云', 'Gaussian', '清理', '裁剪']
  },
  {
    id: 'process-blender-procedural', label: 'Blender · 程序化动画', group: '处理',
    summary: '把点云/网格继续做成动画。用 Noise、Geometry Nodes 或位移让运动和时间、风、记忆等规则发生关系。',
    ports: [input('geometry', '点云 / 几何', 'data'), input('rule', '运动规则', 'concept'), output('animated', '动画场景', 'data'), output('video', '渲染画面', 'video')],
    params: [select('driver', '运动来源', 'Noise', ['Noise', '距离', '时间', '观察次数']), range('strength', '形变强度', 25, 0, 100, '%', 5), range('speed', '速度', 20, 0, 100, '%', 5)],
    tags: ['Blender', 'Geometry Nodes', 'Noise', '程序化动画', '点云动画']
  },
  {
    id: 'method-preserve-gap', label: '方法：保留缺口', group: '方法',
    summary: '不把所有扫描失败都修掉。缺失部分可以说明风、遮挡、反光、时间变化或技术边界。',
    ports: [input('failure', '缺口 / 失败', 'concept'), output('method', '作品方法', 'concept')],
    params: [select('meaning', '缺口代表什么', '技术边界', ['时间变化', '技术边界', '不可采集部分', '观看入口'])],
    tags: ['方法', '缺失', '扫描', '媒介反思']
  },
  {
    id: 'method-source-attribution', label: '方法：来源与引用', group: '方法',
    summary: '记录视觉来源、参考作品和真正借用的具体方法。题材相同不自动等于抄袭，隐藏直接引用也不行。',
    ports: [input('reference', '参考 / 争议', 'concept'), output('statement', '来源说明', 'concept')],
    params: [text('source', '参考来源', '写下具体作品 / 方法 / 文献'), select('relation', '关系', '独立发展', ['独立发展', '受到启发', '明确引用', 'Remix / 改写'])],
    tags: ['引用', '来源', '借鉴', '抄袭', '伦理']
  },
  {
    id: 'compose-memory-garden', label: '作品结构', group: '制作',
    summary: '把蝴蝶观察、植物空间、扫描、时间和人物记忆组织成一件作品，而不是把数据全部摆出来。',
    ports: [input('space', '空间材料', 'data'), input('records', '观察记录', 'data'), input('memory', '关系 / 记忆', 'concept'), output('work', '作品结构', 'concept')],
    params: [select('focus', '核心', '关系', ['空间', '关系', '时间', '缺席']), range('publicData', '公开数据', 50, 0, 100, '%', 5)],
    tags: ['作品化', '记忆', '蝴蝶', '空间']
  },
  {
    id: 'nature-decay-rule', label: '时间变化规则', group: '处理',
    summary: '让作品随时间、季节、观看或观察次数变化，避免永远播放同一份冻结扫描。',
    ports: [input('work', '作品状态', 'data'), input('trigger', '时间 / 观众', 'trigger'), output('changed', '变化后的状态', 'data')],
    params: [select('driver', '变化来源', '时间', ['时间', '观众靠近', '季节记录', '观察次数']), range('rate', '变化速度', 30, 0, 100, '%', 5)],
    tags: ['变化', '时间', '行为', '生成']
  },
  {
    id: 'output-web-scene', label: '网页空间输出', group: '输出',
    summary: '把最终版本放进浏览器，让人通过鼠标/触摸查看空间；网页是输出端，不要求所有制作都在网页里完成。',
    ports: [input('scene', '场景 / 动画', 'data'), input('video', '视频', 'video'), output('public', '网页版本', 'space')],
    params: [select('interaction', '观看方式', '自由查看', ['自由查看', '固定镜头', '滚动叙事']), toggle('mobile', '适配手机', true)],
    tags: ['网页', 'WebGL', '输出', '分享']
  }
];

export function buildButterflyScholarPreset() {
  return {
    schema: 'nmas-blueprint-v1' as const,
    id: 'bp-butterfly-scholar-field-capture',
    title: '哥斯达黎加的蝴蝶学者 / 完整工作流',
    revision: 3,
    nodes: [
      { id: 'bsn1', definitionId: 'project-question', x: 40, y: 100, params: { question: '真实蝴蝶、寄主植物和一次旅行，最后怎样变成一件数字作品？' } },
      { id: 'bsn2', definitionId: 'butterfly-observation', x: 250, y: 20, params: { species: '目标蝴蝶 / 未确认', hostPlant: '寄主植物 A', presence: '出现' } },
      { id: 'bsn3', definitionId: 'plant-specimen', x: 250, y: 190, params: { name: '寄主植物 A', label: '样地 / 日期 / 采集者', incomplete: false } },
      { id: 'bsn4', definitionId: 'capture-photo-sequence', x: 470, y: 190, params: { photos: 80, overlap: '高', lighting: '较小', viewpoints: '充分' } },
      { id: 'bsn5', definitionId: 'capture-quality-check', x: 690, y: 190, params: { blur: false, missing: false, specular: false, lightingShift: false } },
      { id: 'bsn6', definitionId: 'process-metashape-align', x: 910, y: 190, params: { accuracy: '中', aligned: 92 } },
      { id: 'bsn7', definitionId: 'process-dense-reconstruction', x: 1130, y: 80, params: { detail: '中', millions: 8 } },
      { id: 'bsn8', definitionId: 'process-gaussian-splat', x: 1130, y: 270, params: { iterations: 30, goal: '预览速度' } },
      { id: 'bsn9', definitionId: 'process-point-clean', x: 1350, y: 80, params: { cleanup: 40, preserveGaps: true } },
      { id: 'bsn10', definitionId: 'process-blender-procedural', x: 1570, y: 80, params: { driver: 'Noise', strength: 25, speed: 20 } },
      { id: 'bsn11', definitionId: 'method-source-attribution', x: 1130, y: 460, params: { source: '蝴蝶题材 / 数字艺术参考', relation: '独立发展' } },
      { id: 'bsn12', definitionId: 'compose-memory-garden', x: 1790, y: 190, params: { focus: '关系', publicData: 50 } },
      { id: 'bsn13', definitionId: 'nature-decay-rule', x: 2010, y: 190, params: { driver: '时间', rate: 30 } },
      { id: 'bsn14', definitionId: 'output-web-scene', x: 2230, y: 190, params: { interaction: '自由查看', mobile: true } }
    ],
    edges: [
      { id: 'bse1', from: 'bsn1', to: 'bsn2', kind: 'concept' as const },
      { id: 'bse2', from: 'bsn1', to: 'bsn3', kind: 'concept' as const },
      { id: 'bse3', from: 'bsn3', to: 'bsn4', kind: 'dependency' as const },
      { id: 'bse4', from: 'bsn4', to: 'bsn5', kind: 'signal' as const },
      { id: 'bse5', from: 'bsn5', to: 'bsn6', kind: 'signal' as const },
      { id: 'bse6', from: 'bsn6', to: 'bsn7', kind: 'signal' as const },
      { id: 'bse7', from: 'bsn7', to: 'bsn9', kind: 'signal' as const },
      { id: 'bse8', from: 'bsn9', to: 'bsn10', kind: 'signal' as const },
      { id: 'bse9', from: 'bsn10', to: 'bsn12', kind: 'signal' as const },
      { id: 'bse10', from: 'bsn2', to: 'bsn12', kind: 'concept' as const },
      { id: 'bse11', from: 'bsn11', to: 'bsn12', kind: 'concept' as const },
      { id: 'bse12', from: 'bsn12', to: 'bsn13', kind: 'signal' as const },
      { id: 'bse13', from: 'bsn13', to: 'bsn14', kind: 'signal' as const }
    ],
    notes: ['完整工作流：观察真实蝴蝶与植物关系 → 扫描植物/空间 → 检查 → 相机求解 → 重建 → Blender 动画或 Gaussian → 作品结构 → 网页/现场输出。']
  };
}
