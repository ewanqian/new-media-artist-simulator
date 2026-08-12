export const BUTTERFLY_TRAINING_BLUEPRINT_ID = 'bp-butterfly-scholar-training-v4';

export const BUTTERFLY_TRAINING_ALLOWED_NODES = [
  'field-capture-session',
  'capture-photo-sequence',
  'capture-quality-check',
  'process-metashape-align',
  'process-dense-reconstruction',
  'process-gaussian-splat'
] as const;

export const BUTTERFLY_TRAINING_OBJECTIVES = [
  {
    id: 'field-to-capture',
    title: '把现场调查交给摄影测量',
    dataType: '采集对象：寄主植物 + 周围小片空间',
    why: '这是一条数据线：把已经确认的采集对象送给摄影测量节点，不代表“自动进入下一步”。',
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
    dataType: '照片序列：有重叠的现场照片',
    why: '这里传的是刚拍完的照片。先检查漏拍、模糊和曝光变化；现场能补的问题，不要留到工作室。',
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
    dataType: '可用照片：已排除明显缺口后的采集结果',
    why: 'Metashape 先算每张照片从哪里拍的。相机关系可靠以后，才轮到点云或 Gaussian。',
    from: ['capture-quality-check'],
    to: ['process-metashape-align'],
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
    title: '哥斯达黎加 / 三步采集工作图',
    revision: 5,
    tutorialId: 'costa-rica-capture-01',
    nodes: [
      { id: 'bt0', definitionId: 'field-capture-session', x: 60, y: 160, params: { location: '云雾林样地 A', question: '先扫描寄主植物和它周围的小片空间', weather: '风小 / 散射光', subjectReady: false, conditionsReady: false, questionReady: false } },
      { id: 'bt1', definitionId: 'capture-photo-sequence', x: 330, y: 160, params: { photos: 80, overlap: '高', lighting: '较小', viewpoints: '充分' } },
      { id: 'bt2', definitionId: 'capture-quality-check', x: 600, y: 160, params: { blur: false, missing: true, specular: false, lightingShift: true } },
      { id: 'bt3', definitionId: 'process-metashape-align', x: 870, y: 160, params: { accuracy: '中', aligned: 76 } },
      { id: 'bt4', definitionId: 'process-dense-reconstruction', x: 1140, y: 70, params: { detail: '中', millions: 8 } },
      { id: 'bt5', definitionId: 'process-gaussian-splat', x: 1140, y: 290, params: { iterations: 30, goal: '预览速度' } }
    ],
    edges: [],
    groups: [],
    notes: ['先把现场调查中的对象、条件、问题确认，再完成三条数据线：采集对象 → 照片序列 → 可用照片 → 相机位置。步骤线、条件线、引用线在后续项目中继续使用。']
  };
}
