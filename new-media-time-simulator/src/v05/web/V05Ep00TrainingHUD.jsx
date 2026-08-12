import { useEffect, useMemo, useRef, useState } from 'react';
import { EP00_BLUEPRINT_COMPLETE_KEY, EP00_STATE_KEY, ep00CaptureById } from '../ep00Onboarding.ts';
import { ep00TrainingTasks } from '../ep00Nodes.ts';
import { emitGlobalFeedback } from './V05GlobalFeedback.jsx';
import './v05-ep00-training-hud.css';

const AUTOSAVE_KEY = 'nmas-blueprint-editor-autosave-v2';

function readBlueprint() {
  try { return JSON.parse(localStorage.getItem(AUTOSAVE_KEY) || 'null'); } catch { return null; }
}

function readCapture() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('capture');
  if (fromQuery) return ep00CaptureById(fromQuery).id;
  try {
    const state = JSON.parse(localStorage.getItem(EP00_STATE_KEY) || 'null');
    return ep00CaptureById(state?.capture).id;
  } catch {
    return 'photo';
  }
}

function taskDone(blueprint, task) {
  return (blueprint?.edges || []).some((edge) => edge.from === task.from && edge.to === task.to);
}

function ep00Href() {
  const params = new URLSearchParams(window.location.search);
  const rootPreview = params.get('core') === 'v05' && !window.location.pathname.includes('/v05/');
  return rootPreview ? './?core=v05&mode=ep00' : './?mode=ep00';
}

export default function V05Ep00TrainingHUD() {
  const captureId = readCapture();
  const capture = ep00CaptureById(captureId);
  const tasks = useMemo(() => ep00TrainingTasks(captureId), [captureId]);
  const [blueprint, setBlueprint] = useState(readBlueprint);
  const [collapsed, setCollapsed] = useState(false);
  const previous = useRef(0);

  useEffect(() => {
    const timer = window.setInterval(() => setBlueprint(readBlueprint()), 200);
    return () => window.clearInterval(timer);
  }, []);

  const status = tasks.map((task) => ({ ...task, done: taskDone(blueprint, task) }));
  const doneCount = status.filter((task) => task.done).length;
  const current = status.find((task) => !task.done);
  const complete = doneCount === status.length;

  useEffect(() => {
    if (doneCount > previous.current && doneCount < tasks.length) {
      emitGlobalFeedback({ kind: 'evidence', code: 'WORK GRAPH', title: '第一条关系接通', detail: status[doneCount - 1]?.text || '' });
    }
    previous.current = doneCount;
  }, [doneCount, status, tasks.length]);

  useEffect(() => {
    if (!complete || localStorage.getItem(EP00_BLUEPRINT_COMPLETE_KEY) === '1') return;
    localStorage.setItem(EP00_BLUEPRINT_COMPLETE_KEY, '1');
    emitGlobalFeedback({ kind: 'achievement', code: 'EP00 / INPUT → PROCESS → OUTPUT', title: '第一张工作图完成', detail: `${capture.verb}得到的材料已经经过处理，变成一个别人可以看到或听到的最小版本。` });
  }, [complete, capture.verb]);

  return <aside className={`ep00-hud ${collapsed ? 'collapsed' : ''}`} aria-label="EP00 工作图训练">
    <header><div><small>EP00 / FIRST WORK GRAPH</small><strong>{complete ? '2 / 2 完成' : `任务 ${doneCount + 1} / ${tasks.length}`}</strong></div><button onClick={() => setCollapsed((value) => !value)}>{collapsed ? '展开' : '收起'}</button></header>
    {!collapsed && <>
      {!complete && current && <section><small>只做这一件事</small><h2>{current.text}</h2><p>先点左边节点右侧的输出 ●，再点右边节点左侧的输入 ○。这条线表示“材料怎样进入下一步”。</p></section>}
      <ol>{status.map((task, index) => <li className={task.done ? 'done' : current?.id === task.id ? 'current' : ''} key={task.id}><i>{task.done ? '✓' : index + 1}</i><span>{task.text}</span></li>)}</ol>
      <footer>{complete ? <><strong>完成。</strong><p>你刚刚学的不是“怎么用编辑器”，而是新媒体项目最基本的一句话：输入经过处理，才会变成输出。</p><a href={ep00Href()}>回到 EP00 归档 →</a></> : <p>这一关只有 3 个节点、2 条线。别加东西，先把最小关系接通。</p>}</footer>
    </>}
  </aside>;
}
