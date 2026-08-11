import { useEffect, useMemo, useState } from 'react';
import { BUTTERFLY_TRAINING_OBJECTIVES } from '../butterflyScholarTrainingPreset.ts';
import { emitGlobalFeedback } from './V05GlobalFeedback.jsx';
import './v05-butterfly-training-hud.css';

const AUTOSAVE_KEY = 'nmas-blueprint-editor-autosave-v2';
const COMPLETE_KEY = 'nmas-butterfly-training-complete-v2';

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
    emitGlobalFeedback({ kind: 'achievement', code: 'TRAINING COMPLETE', title: '第一次扫描工作流', detail: '你已经知道：先采集，再检查，再求相机位置，最后才选点云或 Gaussian。' });
  }, [complete]);

  return <aside className={`bt-hud ${collapsed ? 'collapsed' : ''}`} aria-label="蝴蝶学者训练任务">
    <header><div><small>SPECIAL 01 / TRAINING</small><strong>{complete ? '完成' : `${doneCount} / ${status.length}`}</strong></div><button onClick={() => setCollapsed((value) => !value)}>{collapsed ? '展开任务' : '收起'}</button></header>
    {!collapsed && <>
      {!complete && current && <section className="bt-current"><small>现在只做这一件事</small><h2>{current.title}</h2><p>{current.why}</p><em>{current.hint}</em></section>}
      <ol>{status.map((item, index) => <li key={item.id} className={item.done ? 'done' : current?.id === item.id ? 'current' : ''}><i>{item.done ? '✓' : index + 1}</i><span>{item.title}</span></li>)}</ol>
      <footer>{complete ? <><strong>你已经把工作流接通。</strong><p>下一次项目里，这三个节点组不会再强制提示。</p><a href={chapterHref()}>返回章节选择 →</a></> : <p>连线方法：点上游节点右侧输出端口，再点下游节点左侧输入端口。只需要完成任务条，不需要把所有端口都接满。</p>}</footer>
    </>}
  </aside>;
}
