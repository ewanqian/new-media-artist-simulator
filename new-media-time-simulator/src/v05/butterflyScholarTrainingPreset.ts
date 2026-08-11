export const BUTTERFLY_TRAINING_BLUEPRINT_ID = 'bp-butterfly-scholar-training-v3';

export const BUTTERFLY_TRAINING_ALLOWED_NODES = [
  'field-capture-session',
  'capture-photo-sequence',
  'capture-quality-check',
  'process-metashape-align',
  'process-colmap-sfm',
  'process-dense-reconstruction',
  'process-gaussian-splat',
  'process-point-clean',
  'process-blender-procedural',
  'process-physics-motion',
  'process-butterfly-behavior',
  'output-web-scene'
] as const;

export const BUTTERFLY_TRAINING_OBJECTIVES = [
  {
    id: 'field-to-capture',
    title: '把现场调查交给摄影测量',
    why: '先告诉采集节点“你到底要扫什么”。没有明确对象，后面只会得到一堆互不相关的素材。',
    from: ['field-capture-session'],
    to: ['capture-photo-sequence'],
    fromLabel: '现场调查',
    fromPort: '采集对象',
    toLabel: '摄影测量采集',
    toPort: '要扫描的对象'
  },
  {
    id: 'capture-to-check',
    title: '让照片先经过离场检查',
    why: '检查漏拍、模糊和曝光变化。现场能补的问题，不要留到工作室。',
    from: ['capture-photo-sequence'],
    to: ['capture-quality-check'],
    fromLabel: '摄影测量采集',
    fromPort: '照片序列',
    toLabel: '离场前检查',
    toPort: '照片 / 扫描'
  },
  {
    id: 'check-to-solve',
    title: '把可用照片送进相机求解',
    why: 'Metashape 先算出每张照片从哪里拍的。相机关系可靠以后，才轮到点云或 Gaussian。',
    from: ['capture-quality-check'],
    to: ['process-metashape-align', 'process-colmap-sfm'],
    fromLabel: '离场前检查',
    fromPort: '可继续的数据',
    toLabel: 'Metashape · 相机求解',
    toPort: '照片'
  }
] as const;

export function buildButterflyScholarTrainingPreset() {
  return {
    schema: 'nmas-blueprint-v1' as const,
    id: BUTTERFLY_TRAINING_BLUEPRINT_ID,
    title: '哥斯达黎加的蝴蝶学者 / 三步采集训练',
    revision: 3,
    tutorialId: 'butterfly-capture-01',
    nodes: [
      { id: 'bt0', definitionId: 'field-capture-session', x: 60, y: 160, params: { location: '云雾林样地 A', question: '先扫描寄主植物和它周围的小片空间', weather: '风小 / 散射光' } },
      { id: 'bt1', definitionId: 'capture-photo-sequence', x: 330, y: 160, params: { photos: 80, overlap: '高', lighting: '较小', viewpoints: '充分' } },
      { id: 'bt2', definitionId: 'capture-quality-check', x: 600, y: 160, params: { blur: false, missing: true, specular: false, lightingShift: true } },
      { id: 'bt3', definitionId: 'process-metashape-align', x: 870, y: 90, params: { accuracy: '中', aligned: 76 } },
      { id: 'bt4', definitionId: 'process-colmap-sfm', x: 870, y: 300, params: { matching: '顺序照片', registered: 76 } },
      { id: 'bt5', definitionId: 'process-dense-reconstruction', x: 1140, y: 70, params: { detail: '中', millions: 8 } },
      { id: 'bt6', definitionId: 'process-gaussian-splat', x: 1140, y: 300, params: { iterations: 30, goal: '预览速度' } },
      { id: 'bt7', definitionId: 'process-blender-procedural', x: 1410, y: 180, params: { driver: 'Noise', strength: 25, speed: 20 } }
    ],
    edges: [],
    groups: [],
    notes: ['只完成三条线：现场调查 → 摄影测量采集 → 离场前检查 → 相机求解。完成以后，点云 / Gaussian / Blender 作为下一组自由节点开放。']
  };
}
