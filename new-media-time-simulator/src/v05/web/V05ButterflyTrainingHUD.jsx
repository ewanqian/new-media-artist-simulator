import { useEffect, useMemo, useState } from 'react';
import { BUTTERFLY_TRAINING_OBJECTIVES } from '../butterflyScholarTrainingPreset.ts';
import { emitGlobalFeedback } from './V05GlobalFeedback.jsx';
import './v05-butterfly-training-hud.css';

const AUTOSAVE_KEY = 'nmas-blueprint-editor-autosave-v2';
const COMPLETE_KEY = 'nmas-butterfly-training-complete-v3';

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
    const id = window.setInterval(() => setBlueprint(readBlueprint()), 220);
    return () => window.clearInterval(id);
  }, []);

  const status = useMemo(() => BUTTERFLY_TRAINING_OBJECTIVES.map((objective) => ({ ...objective, done: objectiveDone(blueprint, objective) })), [blueprint]);
  const doneCount = status.filter((item) => item.done).length;
  const current = status.find((item) => !item.done);
  const complete = doneCount === status.length;

  useEffect(() => {
    if (!complete || localStorage.getItem(COMPLETE_KEY) === '1') return;
    localStorage.setItem(COMPLETE_KEY, '1');
    emitGlobalFeedback({ kind: 'achievement', code: 'TRAINING COMPLETE', title: '第一条采集链', detail: '你已经接通：现场调查 → 摄影测量 → 离场检查 → 相机求解。点云 / Gaussian / Blender 现在可以自由继续。' });
  }, [complete]);

  return <aside className={`bt-hud ${collapsed ? 'collapsed' : ''}`} aria-label="蝴蝶学者训练任务">
    <header><div><small>SPECIAL 01 / BLUEPRINT LESSON</small><strong>{complete ? '三步完成' : `任务 ${doneCount + 1} / ${status.length}`}</strong></div><button onClick={() => setCollapsed((value) => !value)}>{collapsed ? '展开任务' : '收起'}</button></header>
    {!collapsed && <>
      <div className="bt-legend"><span><b>右侧 ●</b> 输出</span><span><b>左侧 ○</b> 输入</span><span>先点输出，再点输入</span></div>
      {!complete && current && <section className="bt-current"><small>现在只做这一条线</small><h2>{current.title}</h2><div className="bt-wire-instruction"><span>①【{current.fromLabel}】右侧 ● <b>{current.fromPort}</b></span><i>→</i><span>②【{current.toLabel}】左侧 ○ <b>{current.toPort}</b></span></div><p>{current.why}</p></section>}
      <ol>{status.map((item, index) => <li key={item.id} className={item.done ? 'done' : current?.id === item.id ? 'current' : ''}><i>{item.done ? '✓' : index + 1}</i><span>{item.title}</span></li>)}</ol>
      <footer>{complete ? <><strong>第一条采集链已经接通。</strong><p>现在可以继续试：点云 / Gaussian / Blender；这些不再是教程必选答案。</p><a href={chapterHref()}>完成 · 返回章节选择 →</a></> : <p>不需要把所有端口都接满。这里只学三件事：先定义现场对象、离场前检查、先求解相机。</p>}</footer>
    </>}
  </aside>;
}