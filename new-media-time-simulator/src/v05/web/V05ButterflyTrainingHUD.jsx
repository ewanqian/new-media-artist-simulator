import { useEffect, useMemo, useRef, useState } from 'react';
import { BUTTERFLY_TRAINING_OBJECTIVES } from '../butterflyScholarTrainingPreset.ts';
import { emitGlobalFeedback } from './V05GlobalFeedback.jsx';
import './v05-butterfly-training-hud.css';

const AUTOSAVE_KEY = 'nmas-blueprint-editor-autosave-v2';
const COMPLETE_KEY = 'nmas-butterfly-training-complete-v4';

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
  const previousDone = useRef(null);

  useEffect(() => {
    const id = window.setInterval(() => setBlueprint(readBlueprint()), 220);
    return () => window.clearInterval(id);
  }, []);

  const status = useMemo(() => BUTTERFLY_TRAINING_OBJECTIVES.map((objective) => ({ ...objective, done: objectiveDone(blueprint, objective) })), [blueprint]);
  const doneCount = status.filter((item) => item.done).length;
  const current = status.find((item) => !item.done);
  const complete = doneCount === status.length;

  useEffect(() => {
    if (previousDone.current === null) {
      previousDone.current = doneCount;
      return;
    }
    if (doneCount > previousDone.current && doneCount < status.length) {
      const justCompleted = status[doneCount - 1];
      if (justCompleted) emitGlobalFeedback({ kind: 'evidence', code: 'DATA FLOW', title: `${justCompleted.dataType} / 已接通`, detail: `${justCompleted.fromLabel} → ${justCompleted.toLabel}` });
    }
    previousDone.current = doneCount;
  }, [doneCount, status]);

  useEffect(() => {
    if (!complete || localStorage.getItem(COMPLETE_KEY) === '1') return;
    localStorage.setItem(COMPLETE_KEY, '1');
    emitGlobalFeedback({ kind: 'achievement', code: 'TRAINING COMPLETE', title: '第一条采集链', detail: '你已经接通：采集对象 → 照片序列 → 离场检查 → 相机求解。点云 / Gaussian / Blender 现在可以继续探索。' });
  }, [complete]);

  return <aside className={`bt-hud ${collapsed ? 'collapsed' : ''}`} aria-label="蝴蝶学者训练任务">
    <header><div><small>SPECIAL 01 / BLUEPRINT LESSON</small><strong>{complete ? '三步完成' : `任务 ${doneCount + 1} / ${status.length}`}</strong></div><button onClick={() => setCollapsed((value) => !value)}>{collapsed ? '展开任务' : '收起'}</button></header>
    {!collapsed && <>
      <div className="bt-legend"><span><b>右侧 ●</b> 输出</span><span><b>左侧 ○</b> 输入</span><span>先点输出，再点输入</span></div>
      {!complete && current && <section className="bt-current"><small>现在只做这一条线</small><h2>{current.title}</h2><strong className="bt-data-type">这条线传递：{current.dataType}</strong><div className="bt-wire-instruction"><span>①【{current.fromLabel}】右侧 ● <b>{current.fromPort}</b></span><i>→</i><span>②【{current.toLabel}】左侧 ○ <b>{current.toPort}</b></span></div><p>{current.why}</p></section>}
      <ol>{status.map((item, index) => <li key={item.id} className={item.done ? 'done' : current?.id === item.id ? 'current' : ''}><i>{item.done ? '✓' : index + 1}</i><span>{item.title}</span></li>)}</ol>
      <footer>{complete ? <><strong>第一条采集链已经接通。</strong><p>你刚才连的不是三个“任务按钮”，而是三段数据流。现在可以继续试点云 / Gaussian；Blender 等创作节点会在后续内容里出现。</p><a href={chapterHref()}>完成 · 返回章节选择 →</a></> : <p>只看当前这一条。先弄清楚“这根线传的是什么”，再去点端口。</p>}</footer>
    </>}
  </aside>;
}
