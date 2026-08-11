import { useEffect, useMemo, useState } from 'react';
import { editorNodeById } from '../blueprintEditorCatalog.ts';
import { BUTTERFLY_TRAINING_OBJECTIVES } from '../butterflyScholarTrainingPreset.ts';
import { emitGlobalFeedback } from './V05GlobalFeedback.jsx';
import './v05-butterfly-training-hud.css';

const AUTOSAVE_KEY = 'nmas-blueprint-editor-autosave-v2';
const COMPLETE_KEY = 'nmas-butterfly-training-complete-v1';

function readBlueprint() {
  try { return JSON.parse(localStorage.getItem(AUTOSAVE_KEY) || 'null'); } catch { return null; }
}

function objectiveDone(blueprint, objective) {
  if (!blueprint) return false;
  const definitions = new Map((blueprint.nodes || []).map((node) => [node.id, node.definitionId]));
  return (blueprint.edges || []).some((edge) => objective.from.includes(definitions.get(edge.from)) && objective.to.includes(definitions.get(edge.to)));
}

function chapterHref() {
  const params = new URLSearchParams(window.location.search);
  const rootPreview = params.get('core') === 'v05' && !window.location.pathname.includes('/v05/');
  return rootPreview ? './?core=v05&mode=career' : './?mode=career';
}

export default function V05ButterflyTrainingHUD() {
  const [blueprint, setBlueprint] = useState(readBlueprint);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setBlueprint(readBlueprint()), 250);
    return () => window.clearInterval(id);
  }, []);

  const status = useMemo(() => BUTTERFLY_TRAINING_OBJECTIVES.map((objective) => ({ ...objective, done: objectiveDone(blueprint, objective) })), [blueprint]);
  const doneCount = status.filter((item) => item.done).length;
  const current = status.find((item) => !item.done);
  const complete = doneCount === status.length;

  useEffect(() => {
    if (!complete || localStorage.getItem(COMPLETE_KEY) === '1') return;
    localStorage.setItem(COMPLETE_KEY, '1');
    emitGlobalFeedback({ kind: 'achievement', code: 'TRAINING COMPLETE', title: '采集 → 检查 → 求解 → 表示', detail: '你完成了蝴蝶学者的第一组工作图训练。这个方法组可以进入后续项目。' });
  }, [complete]);

  return <aside className={`bt-hud ${collapsed ? 'collapsed' : ''}`} aria-label="蝴蝶学者训练任务">
    <header><div><small>TRAINING / BLUEPRINT 01</small><strong>{complete ? '训练完成' : `任务 ${doneCount + 1} / ${status.length}`}</strong></div><button onClick={() => setCollapsed((value) => !value)}>{collapsed ? '展开' : '收起'}</button></header>
    {!collapsed && <>
      {!complete && current && <section className="bt-current"><small>CURRENT OBJECTIVE</small><h2>{current.title}</h2><p>{current.why}</p></section>}
      <ol>{status.map((item, index) => <li key={item.id} className={item.done ? 'done' : current?.id === item.id ? 'current' : ''}><i>{item.done ? '✓' : index + 1}</i><span>{item.title}</span></li>)}</ol>
      <footer>{complete ? <a href={chapterHref()}>完成 · 返回章节选择 →</a> : <p>操作：点击一个节点的输出端口，再点击目标节点的输入端口。这里只考三条核心关系。</p>}</footer>
    </>}
  </aside>;
}
