export const BUTTERFLY_TRAINING_BLUEPRINT_ID = 'bp-butterfly-scholar-training-v3';

export const BUTTERFLY_TRAINING_ALLOWED_NODES = [
  'butterfly-observation',
  'plant-specimen',
  'capture-photo-sequence',
  'capture-quality-check',
  'process-metashape-align',
  'process-colmap-sfm',
  'process-dense-reconstruction',
  'process-gaussian-splat',
  'process-blender-procedural',
  'method-source-attribution',
  'output-web-scene',
  'field-note'
] as const;

export const BUTTERFLY_TRAINING_OBJECTIVES = [
  {
    id: 'capture-check',
    title: '1. 采集 → 检查',
    why: '把摄影测量采集的输出接到「离场前检查」。先确认数据能不能用。',
    hint: '点「摄影测量采集」右侧的“照片序列”，再点「离场前检查」左侧的“照片 / 扫描”。',
    from: ['capture-photo-sequence'],
    to: ['capture-quality-check']
  },
  {
    id: 'check-solve',
    title: '2. 检查 → 相机求解',
    why: '检查通过后，送进 Metashape 或 COLMAP。它们先求每张照片的相机位置。',
    hint: '从「离场前检查」的“可继续的数据”接到任意一个「相机求解」。',
    from: ['capture-quality-check'],
    to: ['process-metashape-align', 'process-colmap-sfm']
  },
  {
    id: 'solve-output',
    title: '3. 相机求解 → 你要的结果',
    why: '最后选择用途：点云方便继续进 Blender；Gaussian 适合连续浏览空间外观。',
    hint: '从相机求解接到「点云重建」或「Gaussian Splatting」。两条都成立，不存在标准答案。',
    from: ['process-metashape-align', 'process-colmap-sfm'],
    to: ['process-dense-reconstruction', 'process-gaussian-splat']
  }
] as const;

export function buildButterflyScholarTrainingPreset() {
  return {
    schema: 'nmas-blueprint-v1' as const,
    id: BUTTERFLY_TRAINING_BLUEPRINT_ID,
    title: '哥斯达黎加的蝴蝶学者 / 入门训练',
    revision: 3,
    tutorialId: 'butterfly-capture-01',
    nodes: [
      { id: 'bt1', definitionId: 'plant-specimen', x: 70, y: 80, params: { name: '寄主植物 A', label: '样地 / 日期 / 采集者', incomplete: false } },
      { id: 'bt2', definitionId: 'capture-photo-sequence', x: 310, y: 80, params: { photos: 80, overlap: '高', lighting: '较小', viewpoints: '充分' } },
      { id: 'bt3', definitionId: 'capture-quality-check', x: 570, y: 80, params: { blur: false, missing: true, specular: false, lightingShift: true } },
      { id: 'bt4', definitionId: 'process-metashape-align', x: 830, y: 80, params: { accuracy: '中', aligned: 76 } },
      { id: 'bt5', definitionId: 'process-dense-reconstruction', x: 1090, y: 20, params: { detail: '中', millions: 8 } },
      { id: 'bt6', definitionId: 'process-gaussian-splat', x: 1090, y: 190, params: { iterations: 30, goal: '预览速度' } }
    ],
    edges: [
      { id: 'bte1', from: 'bt1', to: 'bt2', kind: 'dependency' as const }
    ],
    groups: [],
    notes: [
      '这是一张故意没接完的训练图。只完成三条连接：采集 → 检查 → 相机求解 → 结果。',
      '没有唯一正确输出：想继续做 Blender 动画，优先点云；想快速自由查看空间，可以选 Gaussian。'
    ]
  };
}
