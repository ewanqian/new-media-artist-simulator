import { ep00CaptureById, type Ep00Capture } from './ep00Onboarding.ts';

export const ep00NodeDefinitions = [
  {
    id: 'ep00-photo-source', label: '照片素材', group: '输入', summary: '一组刚拍下来的照片。先把它当作素材，而不是作品。',
    ports: [{ id: 'out', label: '照片', direction: 'out', type: 'video' }],
    params: [], tags: ['EP00', '照片', '素材', '输入']
  },
  {
    id: 'ep00-photo-process', label: '重新组织图像', group: '处理', summary: '排序、裁切、重复或并置，让图像之间开始产生关系。',
    ports: [{ id: 'in', label: '照片', direction: 'in', type: 'video' }, { id: 'out', label: '图像序列', direction: 'out', type: 'video' }],
    params: [{ id: 'rule', label: '组织方式', kind: 'select', options: ['顺序', '重复', '并置'], defaultValue: '顺序' }], tags: ['EP00', '图像', '处理']
  },
  {
    id: 'ep00-photo-output', label: '循环画面', group: '输出', summary: '把处理后的图像变成一个别人可以真正看到的最小版本。',
    ports: [{ id: 'in', label: '图像序列', direction: 'in', type: 'video' }],
    params: [], tags: ['EP00', '输出', '画面']
  },
  {
    id: 'ep00-scan-source', label: '空间采集', group: '输入', summary: '把一个真实空间采成照片或扫描数据。',
    ports: [{ id: 'out', label: '空间数据', direction: 'out', type: 'data' }],
    params: [], tags: ['EP00', '扫描', '空间', '输入']
  },
  {
    id: 'ep00-scan-process', label: '空间重建', group: '处理', summary: '把采集到的数据整理成可以再次观察和编辑的三维空间。',
    ports: [{ id: 'in', label: '空间数据', direction: 'in', type: 'data' }, { id: 'out', label: '三维数据', direction: 'out', type: 'data' }],
    params: [{ id: 'detail', label: '细节', kind: 'select', options: ['低', '中', '高'], defaultValue: '中' }], tags: ['EP00', '重建', '三维', '处理']
  },
  {
    id: 'ep00-scan-output', label: '三维场景', group: '输出', summary: '一个可以旋转、移动、继续处理的空间版本。',
    ports: [{ id: 'in', label: '三维数据', direction: 'in', type: 'data' }],
    params: [], tags: ['EP00', '输出', '三维场景']
  },
  {
    id: 'ep00-audio-source', label: '声音素材', group: '输入', summary: '同一个地方留下的几段声音。',
    ports: [{ id: 'out', label: '声音', direction: 'out', type: 'audio' }],
    params: [], tags: ['EP00', '声音', '素材', '输入']
  },
  {
    id: 'ep00-audio-process', label: '整理声音层次', group: '处理', summary: '调整顺序、音量和叠加，让声音开始描述一个空间或事件。',
    ports: [{ id: 'in', label: '声音', direction: 'in', type: 'audio' }, { id: 'out', label: '声音层', direction: 'out', type: 'audio' }],
    params: [{ id: 'rule', label: '组织方式', kind: 'select', options: ['顺序', '叠加', '留白'], defaultValue: '顺序' }], tags: ['EP00', '声音', '处理']
  },
  {
    id: 'ep00-audio-output', label: '声音片段', group: '输出', summary: '一个可以被别人实际听到的最小声音版本。',
    ports: [{ id: 'in', label: '声音层', direction: 'in', type: 'audio' }],
    params: [], tags: ['EP00', '输出', '声音']
  }
] as const;

export const EP00_ALLOWED_NODES_BY_CAPTURE: Record<Ep00Capture, string[]> = {
  photo: ['ep00-photo-source', 'ep00-photo-process', 'ep00-photo-output'],
  scan: ['ep00-scan-source', 'ep00-scan-process', 'ep00-scan-output'],
  audio: ['ep00-audio-source', 'ep00-audio-process', 'ep00-audio-output']
};

export const EP00_BLUEPRINT_ID = 'bp-ep00-first-work-graph';

export function buildEp00TrainingPreset(captureId: Ep00Capture) {
  const capture = ep00CaptureById(captureId);
  const ids = EP00_ALLOWED_NODES_BY_CAPTURE[capture.id];
  return {
    schema: 'nmas-blueprint-v1' as const,
    id: EP00_BLUEPRINT_ID,
    title: `EP00 / 第一次工作图 · ${capture.verb}`,
    revision: 1,
    nodes: [
      { id: 'ep00-n1', definitionId: ids[0], x: 180, y: 260, params: {}, groupId: null },
      { id: 'ep00-n2', definitionId: ids[1], x: 470, y: 260, params: {}, groupId: null },
      { id: 'ep00-n3', definitionId: ids[2], x: 760, y: 260, params: {}, groupId: null }
    ],
    edges: [], notes: [], groups: []
  };
}

export function ep00TrainingTasks(captureId: Ep00Capture) {
  const capture = ep00CaptureById(captureId);
  const [source, process, output] = EP00_ALLOWED_NODES_BY_CAPTURE[capture.id];
  return [
    { id: 'source-process', from: 'ep00-n1', to: 'ep00-n2', text: `${capture.title}得到的素材 → 处理` },
    { id: 'process-output', from: 'ep00-n2', to: 'ep00-n3', text: '处理后的结果 → 可被别人看到 / 听到的版本' }
  ];
}
