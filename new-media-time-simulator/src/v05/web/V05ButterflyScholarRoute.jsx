import { useMemo, useState } from 'react';
import {
  applyNarrativeChoice,
  createNarrativeState,
  narrativeContradictions,
  narrativeKnownFacts,
  narrativeNodeById
} from '../narrativeEngine.ts';
import { editorNodeDefinitions } from '../blueprintEditorCatalog.ts';
import {
  butterflyScholarIdentity,
  butterflyScholarNarrativePack,
  butterflyWorldEffectsByChoice
} from '../butterflyScholarPack.ts';
import V05NarrativeStage from './V05NarrativeStage.jsx';
import { emitGlobalFeedback } from './V05GlobalFeedback.jsx';
import './v05-butterfly-scholar.css';

const STATE_KEY = 'nmas-special-butterfly-narrative-v1';
const WORLD_KEY = 'nmas-special-butterfly-world-v1';
const nodeLabels = new Map(editorNodeDefinitions.map((item) => [item.id, item.label]));

const emptyWorld = () => ({ unlockNodeIds: [], evidenceIds: [], methodIds: [], threadIds: [], archiveEntryIds: [], projectTags: [] });
const unique = (values) => [...new Set(values.filter(Boolean))];
const fullLoadNodes = new Set(['bs-01-invite', 'bs-02-arrival', 'bs-03-field', 'bs-04-process', 'bs-05-public']);
const metaByNode = {
  'bs-01-invite': { kicker: 'SPECIAL 01 / BRIEFING', time: 'DAY -03 · 22:10', objective: '决定是否出发' },
  'bs-02-arrival': { kicker: 'SPECIAL 01 / ARRIVAL', time: 'DAY 01 · 14:20', objective: '判断第一次见面里不对劲的地方' },
  'bs-03-field': { kicker: 'TRAINING 01 / FIELD', time: 'DAY 02 · 09:40', objective: '只选一个可追踪的采集对象' },
  'bs-03b-audit': { kicker: 'TRAINING 02 / CHECK', time: 'DAY 02 · 16:50', objective: '离场前检查覆盖与光照' },
  'bs-04-process': { kicker: 'TRAINING 03 / SOLVE', time: 'DAY 02 · 22:35', objective: '先判断相机求解是否可信' },
  'bs-04a-represent': { kicker: 'TRAINING 04 / REPRESENT', time: 'DAY 03 · 00:10', objective: '选择作品真正需要的空间表示' },
  'bs-04c-browser': { kicker: 'TRAINING 05 / PREVIEW', time: 'DAY 03 · 01:25', objective: '决定网页预览在工作流里的位置' },
  'bs-04d-gap': { kicker: 'TRAINING 06 / CLEAN', time: 'DAY 03 · 02:05', objective: '决定扫描缺口是错误还是材料' },
  'bs-04b-reveal': { kicker: 'NARRATIVE / REVEAL', time: 'DAY 03 · 02:20', objective: '回应 Inés 没有说完整的身份' },
  'bs-05-public': { kicker: 'FIELD TEST / PUBLIC', time: 'DAY 06 · 19:00', objective: '决定哪些东西进入公开版本' }
};

const methodNames = {
  'method-field-metadata': '现场元数据',
  'method-spatial-capture-route': '空间采集路线',
  'method-record-absence': '记录缺席',
  'method-check-before-leave': '离场前检查',
  'method-diagnose-before-reconstruct': '先诊断再重建',
  'method-representation-does-not-fix-capture': '表示方式不能修复采集',
  'method-sampling-as-form': '把采样痕迹当作形式',
  'method-view-dependent-space': '视图依赖空间',
  'method-browser-splat-cleanup': '浏览器 Splat 清理',
  'method-local-export-pipeline': '本地处理 / 网页输出',
  'method-preserve-gap': '保留扫描缺口',
  'method-reconstruct-before-interpret': '先建立可控重建',
  'method-selective-preservation': '选择性保存'
};

function v05Href(query = '') {
  const params = new URLSearchParams(window.location.search);
  const rootPreview = params.get('core') === 'v05' && !window.location.pathname.includes('/v05/');
  if (!query) return rootPreview ? './?core=v05' : './';
  return rootPreview ? `./?core=v05&${query}` : `./?${query}`;
}

function readJson(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}
function initialNarrative() { return readJson(STATE_KEY, createNarrativeState(butterflyScholarNarrativePack)); }
function mergeWorld(current, effect = {}) {
  const next = { ...current };
  for (const key of Object.keys(emptyWorld())) next[key] = unique([...(current[key] || []), ...(effect[key] || [])]);
  return next;
}
function added(next, previous, key) { return (next[key] || []).filter((item) => !(previous[key] || []).includes(item)); }

function TrainingInstrument({ nodeId, state }) {
  if (nodeId === 'bs-03b-audit') return <div className="bs-instrument audit"><header><small>FIELD CHECK</small><strong>80 PHOTOS / BEFORE LEAVING</strong></header><div className="bs-readout"><span><b>OVERLAP</b><i>GAP</i></span><span><b>BLUR</b><i>OK</i></span><span><b>EXPOSURE</b><i>SHIFT</i></span><span><b>VIEWPOINT</b><i>GAP</i></span></div><p>你已经在现场看见问题。现在决定：补拍，还是把技术债带回工作室。</p></div>;
  if (nodeId === 'bs-04-process') return <div className="bs-instrument solve"><header><small>CAMERA SOLVE</small><strong>61 / 80 REGISTERED</strong></header><div className="bs-track"><i/><i/><i className="broken"/><i/><i/></div><p>相机轨迹断成两段。先判断采集 / 匹配 / 相机求解，再谈点云或 Gaussian。</p></div>;
  if (nodeId === 'bs-04a-represent') return <div className="bs-instrument representation"><div><small>POINT CLOUD</small><strong>采样痕迹 / 几何关系</strong></div><div><small>GAUSSIAN</small><strong>连续视图 / 空间外观</strong></div></div>;
  if (nodeId === 'bs-04c-browser') return <div className="bs-instrument browser"><header><small>WEB PREVIEW</small><strong>LOCAL → BROWSER</strong></header><p>浏览器可以是编辑器，也可以只是输出端。不要因为“能在线做”就把整个工作流搬进去。</p></div>;
  if (nodeId === 'bs-04b-reveal') return <div className="bs-instrument identity"><small>IDENTITY MISMATCH</small><strong>{state.flags.includes('held-identity-question') ? '你从第一次见面就记下了这个异常。' : '你在第一次见面就质疑过她。'}</strong></div>;
  return null;
}

export default function V05ButterflyScholarRoute() {
  const [state, setState] = useState(initialNarrative);
  const [world, setWorld] = useState(() => readJson(WORLD_KEY, emptyWorld()));
  const node = narrativeNodeById(butterflyScholarNarrativePack, state.currentNodeId);
  const scene = butterflyScholarNarrativePack.scenes.find((item) => item.id === node?.sceneId);
  const speaker = butterflyScholarNarrativePack.actors.find((item) => item.id === node?.speakerId);
  const knownFacts = useMemo(() => narrativeKnownFacts(state), [state]);
  const contradictions = useMemo(() => narrativeContradictions(state), [state]);
  const blueprintHref = v05Href('lab=blueprint&preset=butterfly');
  const chaptersHref = v05Href('mode=career');

  function notifyWorldChanges(previous, next, choiceId) {
    const nodes = added(next, previous, 'unlockNodeIds');
    const methods = added(next, previous, 'methodIds');
    const evidence = added(next, previous, 'evidenceIds');
    if (nodes.length) emitGlobalFeedback({ kind: 'node', title: nodes.length === 1 ? (nodeLabels.get(nodes[0]) || nodes[0]) : `解锁 ${nodes.length} 个节点`, detail: nodes.map((id) => nodeLabels.get(id) || id).join(' · ') });
    if (methods.length) emitGlobalFeedback({ kind: 'method', title: methodNames[methods[0]] || methods[0], detail: methods.length > 1 ? `同时获得 ${methods.length - 1} 个相关方法` : '方法已进入你的记录。' });
    if (evidence.length && !nodes.length && !methods.length) emitGlobalFeedback({ kind: 'evidence', title: '记录已保存', detail: `${evidence.length} 条 Evidence 写入当前章节。` });
    if (choiceId === 'bs-reveal-accept') emitGlobalFeedback({ kind: 'relationship', title: 'Inés / 关系继续', detail: '身份隐瞒不会消失，但这次回应进入人物记忆。' });
    if (choiceId === 'bs-reveal-distance') emitGlobalFeedback({ kind: 'relationship', title: 'Inés / 保持距离', detail: '合作继续，私人关系停在这里。' });
    if (choiceId === 'bs-archive-open') emitGlobalFeedback({ kind: 'achievement', code: 'SPECIAL CHAPTER COMPLETE', title: '哥斯达黎加的蝴蝶学者', detail: '采集、重建、作品方法与人物记忆已经形成一份章节档案。' });
  }

  function choose(choice) {
    const nextState = applyNarrativeChoice(butterflyScholarNarrativePack, state, choice.id);
    if (nextState === state) return;
    const nextWorld = mergeWorld(world, butterflyWorldEffectsByChoice[choice.id]);
    localStorage.setItem(STATE_KEY, JSON.stringify(nextState));
    localStorage.setItem(WORLD_KEY, JSON.stringify(nextWorld));
    notifyWorldChanges(world, nextWorld, choice.id);
    setState(nextState); setWorld(nextWorld);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function reset() {
    const nextState = createNarrativeState(butterflyScholarNarrativePack); const nextWorld = emptyWorld();
    localStorage.setItem(STATE_KEY, JSON.stringify(nextState)); localStorage.setItem(WORLD_KEY, JSON.stringify(nextWorld));
    setState(nextState); setWorld(nextWorld);
  }

  if (!node) return <main className="bs-shell"><section className="bs-error"><h1>路线状态损坏</h1><button onClick={reset}>重置路线</button></section></main>;

  if (!node.choices.length) return <main className="bs-shell"><header className="bs-topbar"><div><small>SPECIAL 01</small><strong>哥斯达黎加的蝴蝶学者</strong></div><nav><a href={chaptersHref}>章节选择</a></nav></header><section className="bs-ending"><small>CHAPTER COMPLETE</small><h1>采集方法已经变成作品方法。</h1><p>你留下了 {world.unlockNodeIds.length} 个可用节点、{world.methodIds.length} 个方法、{world.evidenceIds.length} 条 Evidence，以及关于 Inés 的 {state.memories.filter((item) => item.actorId === 'ines').length} 条人物记忆。</p><div><a className="primary" href={blueprintHref}>进入训练工作图</a><a href={chaptersHref}>返回章节选择</a><button onClick={reset}>重新游玩</button></div></section></main>;

  return (
    <main className="bs-shell">
      <header className="bs-topbar">
        <div><small>SPECIAL 01</small><strong>哥斯达黎加的蝴蝶学者</strong></div>
        <nav><a href={blueprintHref}>工作图</a><a href={chaptersHref}>章节选择</a><button onClick={reset}>重置</button></nav>
      </header>
      <section className="bs-play">
        <V05NarrativeStage contentKey={node.id} scene={scene} speaker={speaker} node={node} meta={metaByNode[node.id]} showLoad={fullLoadNodes.has(node.id)} instrument={<TrainingInstrument nodeId={node.id} state={state}/>} onChoose={choose}/>
        <footer className="bs-statusbar">
          <span><small>SKILLS</small><b>{world.methodIds.length}</b></span>
          <span><small>NODES</small><b>{world.unlockNodeIds.length}</b></span>
          <span><small>RECORDS</small><b>{world.evidenceIds.length + world.archiveEntryIds.length}</b></span>
          <span><small>KNOWN FACTS</small><b>{knownFacts.length}</b></span>
          {contradictions.length > 0 && <span className="alert"><small>CONTRADICTION</small><b>{contradictions.length}</b></span>}
        </footer>
      </section>
    </main>
  );
}
