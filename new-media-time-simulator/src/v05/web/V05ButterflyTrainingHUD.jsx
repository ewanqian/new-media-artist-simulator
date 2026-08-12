import { useEffect, useMemo, useRef, useState } from 'react';
import { BUTTERFLY_TRAINING_OBJECTIVES } from '../butterflyScholarTrainingPreset.ts';
import { emitGlobalFeedback } from './V05GlobalFeedback.jsx';
import './v05-butterfly-training-hud.css';

const AUTOSAVE_KEY = 'nmas-blueprint-editor-autosave-v2';
const COMPLETE_KEY = 'nmas-costarica-training-complete-v1';
const LEGACY_COMPLETE_KEY = 'nmas-butterfly-training-complete-v4';

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
      if (justCompleted) emitGlobalFeedback({ kind: 'evidence', code: 'DATA LINE', title: `${justCompleted.dataType} / 已接通`, detail: `${justCompleted.fromLabel} → ${justCompleted.toLabel}` });
    }
    previousDone.current = doneCount;
  }, [doneCount, status]);

  useEffect(() => {
    if (!complete || localStorage.getItem(COMPLETE_KEY) === '1' || localStorage.getItem(LEGACY_COMPLETE_KEY) === '1') return;
    localStorage.setItem(COMPLETE_KEY, '1');
    emitGlobalFeedback({ kind: 'achievement', code: 'COSTA RICA / WORK GRAPH', title: '第一条采集数据链', detail: '采集对象 → 照片序列 → 离场检查 → 相机求解已经接通。以后还会用到步骤线、条件线和引用线。' });
  }, [complete]);

  return <aside className={`bt-hud ${collapsed ? 'collapsed' : ''}`} aria-label="哥斯达黎加工作图训练">
    <header><div><small>SPECIAL 01 / COSTA RICA / WORK GRAPH</small><strong>{complete ? '三步完成' : `任务 ${doneCount + 1} / ${status.length}`}</strong></div><button onClick={() => setCollapsed((value) => !value)}>{collapsed ? '展开任务' : '收起'}</button></header>
    {!collapsed && <>
      <div className="bt-legend"><span><b>右侧 ●</b> 输出</span><span><b>左侧 ○</b> 输入</span><span><b>当前：数据线</b></span></div>
      <div className="bt-legend"><span>数据线 = 资料/信号</span><span>步骤线 = 制作顺序</span><span>条件线 = 必要前提</span><span>引用线 = 知识/来源/方法</span></div>
      {!complete && current && <section className="bt-current"><small>现在只处理这一条关系</small><h2>{current.title}</h2><strong className="bt-data-type">数据线传递：{current.dataType}</strong><div className="bt-wire-instruction"><span>①【{current.fromLabel}】右侧 ● <b>{current.fromPort}</b></span><i>→</i><span>②【{current.toLabel}】左侧 ○ <b>{current.toPort}</b></span></div><p>{current.why}</p></section>}
      <ol>{status.map((item, index) => <li key={item.id} className={item.done ? 'done' : current?.id === item.id ? 'current' : ''}><i>{item.done ? '✓' : index + 1}</i><span>{item.title}</span></li>)}</ol>
      <footer>{complete ? <><strong>哥斯达黎加的第一条采集链已经接通。</strong><p>这三条都是数据线。真正做项目时，步骤、条件和引用会和数据一起构成工作图，而不是所有东西都用同一种“连接”。</p><a href={chapterHref()}>完成 · 返回章节选择 →</a></> : <p>先选中【现场调查】，把“采集对象 / 现场条件 / 观察问题”三个准备状态勾清楚；再决定数据怎么进入后面的节点。</p>}</footer>
    </>}
  </aside>;
}
