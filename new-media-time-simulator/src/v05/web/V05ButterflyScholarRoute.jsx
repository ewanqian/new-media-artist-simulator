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
  butterflyScholarTraining,
  butterflyWorldEffectsByChoice
} from '../butterflyScholarPack.ts';
import './v05-butterfly-scholar.css';

const STATE_KEY = 'nmas-special-butterfly-narrative-v1';
const WORLD_KEY = 'nmas-special-butterfly-world-v1';

const emptyWorld = () => ({
  unlockNodeIds: [], evidenceIds: [], methodIds: [], threadIds: [], archiveEntryIds: [], projectTags: []
});
const unique = (values) => [...new Set(values.filter(Boolean))];
const nodeLabels = new Map(editorNodeDefinitions.map((item) => [item.id, item.label]));

function v05Href(query = '') {
  const params = new URLSearchParams(window.location.search);
  const rootPreview = params.get('core') === 'v05' && !window.location.pathname.includes('/v05/');
  if (!query) return rootPreview ? './?core=v05' : './';
  return rootPreview ? `./?core=v05&${query}` : `./?${query}`;
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function initialNarrative() {
  return readJson(STATE_KEY, createNarrativeState(butterflyScholarNarrativePack));
}

function mergeWorld(current, effect = {}) {
  const next = { ...current };
  for (const key of Object.keys(emptyWorld())) next[key] = unique([...(current[key] || []), ...(effect[key] || [])]);
  return next;
}

export default function V05ButterflyScholarRoute() {
  const [state, setState] = useState(initialNarrative);
  const [world, setWorld] = useState(() => readJson(WORLD_KEY, emptyWorld()));
  const node = narrativeNodeById(butterflyScholarNarrativePack, state.currentNodeId);
  const scene = butterflyScholarNarrativePack.scenes.find((item) => item.id === node?.sceneId);
  const speaker = butterflyScholarNarrativePack.actors.find((item) => item.id === node?.speakerId);
  const knownFacts = useMemo(() => narrativeKnownFacts(state), [state]);
  const contradictions = useMemo(() => narrativeContradictions(state), [state]);
  const visitedCount = new Set(state.visitedNodeIds).size;
  const progress = Math.min(100, Math.round((visitedCount / Math.max(1, butterflyScholarNarrativePack.nodes.length - 1)) * 100));
  const blueprintHref = v05Href('lab=blueprint&preset=butterfly');

  function choose(choice) {
    const nextState = applyNarrativeChoice(butterflyScholarNarrativePack, state, choice.id);
    if (nextState === state) return;
    const nextWorld = mergeWorld(world, butterflyWorldEffectsByChoice[choice.id]);
    localStorage.setItem(STATE_KEY, JSON.stringify(nextState));
    localStorage.setItem(WORLD_KEY, JSON.stringify(nextWorld));
    setState(nextState);
    setWorld(nextWorld);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function reset() {
    const nextState = createNarrativeState(butterflyScholarNarrativePack);
    const nextWorld = emptyWorld();
    localStorage.setItem(STATE_KEY, JSON.stringify(nextState));
    localStorage.setItem(WORLD_KEY, JSON.stringify(nextWorld));
    setState(nextState);
    setWorld(nextWorld);
  }

  if (!node) return <main className="bs-shell"><section className="bs-error"><h1>路线状态损坏</h1><button onClick={reset}>重置路线</button></section></main>;

  return (
    <main className="bs-shell">
      <header className="bs-topbar">
        <div className="bs-brand"><small>SPECIAL ROUTE / NARRATIVE PACK 01</small><strong>哥斯达黎加的蝴蝶学者</strong></div>
        <div className="bs-progress"><span style={{ width: `${progress}%` }} /></div>
        <nav><a href={blueprintHref}>采集工作图</a><a href={v05Href()}>首页</a><button onClick={reset}>重置</button></nav>
      </header>

      <div className="bs-layout">
        <article className="bs-scene">
          <header><small>{scene?.location || 'FIELD'} · {node.channel.toUpperCase()}</small><h1>{scene?.title || butterflyScholarIdentity.title}</h1>{speaker && <div className="bs-speaker"><span>{speaker.name}</span><i>{speaker.publicRole}</i></div>}</header>
          <section className="bs-copy">{node.text.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>
          {node.choices.length > 0 ? <div className="bs-choices">{node.choices.map((choice, index) => <button key={choice.id} onClick={() => choose(choice)}><small>{String(index + 1).padStart(2, '0')} / DECISION</small><strong>{choice.label}</strong>{choice.subtext && <span>{choice.subtext}</span>}</button>)}</div> : <section className="bs-complete"><small>ROUTE COMPLETE</small><strong>这次旅行已经形成一份可继续打开的实践档案。</strong><p>人物记忆、采集方法、重建节点、数据边界和公开版本都保留在本地状态里。</p><div><a href={blueprintHref}>打开最终工作图</a><button onClick={reset}>重新开始</button></div></section>}
        </article>

        <aside className="bs-context">
          <section className="bs-profile"><small>YOU ARE</small><strong>{butterflyScholarIdentity.role}</strong><p>{butterflyScholarIdentity.practice}</p><blockquote>{butterflyScholarIdentity.currentQuestion}</blockquote></section>
          <section><small>BLUEPRINT / UNLOCKED</small><strong>{world.unlockNodeIds.length} 个路线节点</strong><div className="bs-tags">{world.unlockNodeIds.slice(-8).map((id) => <span key={id}>{nodeLabels.get(id) || id}</span>)}</div><a className="bs-inline-link" href={blueprintHref}>打开工作图 →</a></section>
          <section><small>RECORDS</small><strong>{world.evidenceIds.length} Evidence · {world.methodIds.length} Method</strong><p>{world.threadIds.length} 个未决 Thread · {world.archiveEntryIds.length} 个 Archive 条目</p></section>
          <section className={contradictions.length ? 'bs-alert' : ''}><small>NARRATIVE STATE</small><strong>{knownFacts.length} 条已知信息</strong><p>{contradictions.length ? `${contradictions.length} 条说法当前互相冲突。` : '目前没有显式矛盾。'}</p><p>Inés 信任：{state.trust.ines || 0} · 人物记忆：{state.memories.length}</p></section>
          <section className="bs-training"><small>FIELD TRAINING / 7 STEPS</small><strong>采集 → 重建 → 作品</strong><ol>{butterflyScholarTraining.map((step) => <li key={step.id}><b>{step.title}</b><span>{step.plain}</span>{step.operation && <em>{step.operation}</em>}{step.reference && <small>{step.reference}</small>}</li>)}</ol></section>
        </aside>
      </div>
    </main>
  );
}
