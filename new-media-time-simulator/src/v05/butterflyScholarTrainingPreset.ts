export const BUTTERFLY_TRAINING_BLUEPRINT_ID = 'bp-butterfly-scholar-training-v2';

export const BUTTERFLY_TRAINING_ALLOWED_NODES = [
  'project-question',
  'butterfly-observation',
  'plant-specimen',
  'capture-photo-sequence',
  'capture-quality-check',
  'process-metashape-align',
  'process-colmap-sfm',
  'process-dense-reconstruction',
  'process-gaussian-splat',
  'process-point-clean',
  'method-preserve-gap',
  'compose-memory-garden',
  'nature-decay-rule',
  'field-note',
  'prod-projector'
] as const;

export const BUTTERFLY_TRAINING_OBJECTIVES = [
  {
    id: 'capture-check',
    title: '把采集先接到现场检查',
    why: '离开现场前先确认覆盖、模糊和光照，不要直接进重建。',
    from: ['capture-photo-sequence'],
    to: ['capture-quality-check']
  },
  {
    id: 'check-solve',
    title: '把检查结果送进相机求解',
    why: 'Metashape / COLMAP 先解决相机位置与匹配关系。',
    from: ['capture-quality-check'],
    to: ['process-metashape-align', 'process-colmap-sfm']
  },
  {
    id: 'choose-representation',
    title: '从求解结果选择一种表示',
    why: '点云和 Gaussian 不是高低级关系。选一种与你的作品目标一致的表示。',
    from: ['process-metashape-align', 'process-colmap-sfm'],
    to: ['process-dense-reconstruction', 'process-gaussian-splat']
  }
] as const;

export function buildButterflyScholarTrainingPreset() {
  return {
    schema: 'nmas-blueprint-v1' as const,
    id: BUTTERFLY_TRAINING_BLUEPRINT_ID,
    title: '哥斯达黎加的蝴蝶学者 / 采集训练',
    revision: 2,
    tutorialId: 'butterfly-capture-01',
    nodes: [
      { id: 'bt1', definitionId: 'project-question', x: 50, y: 140, params: { question: '我是在保存一只蝴蝶、一株植物，还是它们发生关系的时间？' } },
      { id: 'bt2', definitionId: 'butterfly-observation', x: 270, y: 45, params: { species: '目标蝴蝶 / 未确认', hostPlant: '寄主植物 A', presence: '出现' } },
      { id: 'bt3', definitionId: 'plant-specimen', x: 270, y: 235, params: { name: '寄主植物 A', label: '样地 / 日期 / 采集者', incomplete: false } },
      { id: 'bt4', definitionId: 'capture-photo-sequence', x: 520, y: 140, params: { photos: 80, overlap: '高', lighting: '较稳定', viewpoints: '充分' } },
      { id: 'bt5', definitionId: 'capture-quality-check', x: 770, y: 140, params: { blur: false, missing: true, specular: false, lightingShift: true } },
      { id: 'bt6', definitionId: 'process-metashape-align', x: 1020, y: 55, params: { accuracy: '中', aligned: 76 } },
      { id: 'bt7', definitionId: 'process-colmap-sfm', x: 1020, y: 245, params: { matching: '顺序照片', registered: 76 } },
      { id: 'bt8', definitionId: 'process-dense-reconstruction', x: 1280, y: 55, params: { detail: '中', millions: 8 } },
      { id: 'bt9', definitionId: 'process-gaussian-splat', x: 1280, y: 245, params: { iterations: 30, goal: '预览速度' } },
      { id: 'bt10', definitionId: 'process-point-clean', x: 1530, y: 140, params: { cleanup: 40, preserveGaps: true } },
      { id: 'bt11', definitionId: 'compose-memory-garden', x: 1790, y: 140, params: { focus: '关系', publicData: 60 } }
    ],
    edges: [
      { id: 'bte1', from: 'bt1', to: 'bt2', kind: 'concept' as const },
      { id: 'bte2', from: 'bt1', to: 'bt3', kind: 'concept' as const },
      { id: 'bte3', from: 'bt3', to: 'bt4', kind: 'dependency' as const },
      { id: 'bte4', from: 'bt8', to: 'bt10', kind: 'signal' as const },
      { id: 'bte5', from: 'bt9', to: 'bt10', kind: 'signal' as const },
      { id: 'bte6', from: 'bt10', to: 'bt11', kind: 'signal' as const },
      { id: 'bte7', from: 'bt2', to: 'bt11', kind: 'concept' as const }
    ],
    groups: [],
    notes: [
      'TRAINING: 这张图故意断开三段。完成任务条要求的三条连接，理解一次采集从现场检查到相机求解再到表示选择的逻辑。'
    ]
  };
}
