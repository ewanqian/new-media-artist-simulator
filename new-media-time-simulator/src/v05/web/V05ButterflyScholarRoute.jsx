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
  butterflyResearchByNode,
  butterflyResearchCards,
  butterflyScholarIdentity,
  butterflyScholarNarrativePack,
  butterflyWorldEffectsByChoice
} from '../butterflyScholarPack.ts';
import { butterflyChoiceOutcomeHints, deriveButterflyOutcome } from '../butterflyScholarOutcome.ts';
import V05NarrativeStage from './V05NarrativeStage.jsx';
import { emitGlobalFeedback } from './V05GlobalFeedback.jsx';
import './v05-butterfly-scholar.css';

const STATE_KEY = 'nmas-special-butterfly-narrative-v1';
const WORLD_KEY = 'nmas-special-butterfly-world-v1';
const nodeLabels = new Map(editorNodeDefinitions.map((item) => [item.id, item.label]));
const researchById = new Map(butterflyResearchCards.map((item) => [item.id, item]));

const emptyWorld = () => ({ unlockNodeIds: [], evidenceIds: [], methodIds: [], researchIds: [], threadIds: [], archiveEntryIds: [], achievementIds: [], qualitySignals: [], projectTags: [] });
const unique = (values) => [...new Set(values.filter(Boolean))];
const fullLoadNodes = new Set(['bs-01-invite', 'bs-02-arrival', 'bs-03-field', 'bs-05-public']);

const metaByNode = {
  'bs-01-invite': { kicker: 'SPECIAL 01 / VOICE MESSAGE', time: 'DAY -03 · 22:10', objective: '先听清楚这次合作要你做什么', pacing: [180, 'hold', 'hold'], holdChoices: true },
  'bs-02-arrival': { kicker: 'SPECIAL 01 / ARRIVAL', time: 'DAY 01 · 14:20', objective: '先认识合作的人', pacing: [160, 'hold', 'hold'], holdChoices: true },
  'bs-03-field': { kicker: 'FIELD / CAPTURE', time: 'DAY 02 · 09:40', objective: '把活体运动和静态空间拆开采集', pacing: [200, 'hold', 'hold'], holdChoices: true },
  'bs-03b-audit': { kicker: 'FIELD / CHECK', time: 'DAY 02 · 16:50', objective: '离场前决定要不要补拍', pacing: [180, 'hold'], holdChoices: true },
  'bs-04-process': { kicker: 'WORKBENCH / CAMERA SOLVE', time: 'DAY 02 · 22:35', objective: '先确认照片之间的相机关系', pacing: [180, 'hold'], holdChoices: true },
  'bs-04a-represent': { kicker: 'WORKBENCH / REPRESENTATION', time: 'DAY 03 · 00:10', objective: '选一种适合作品的空间表示', pacing: [160, 'hold'], holdChoices: true },
  'bs-04e-compose': { kicker: 'WORKBENCH / MAKE THE WORK', time: 'DAY 03 · 01:20', objective: '扫描结束以后，决定它怎么动', pacing: [160, 'hold'], holdChoices: true },
  'bs-04f-authorship': { kicker: 'NETWORK / PEER MESSAGE', time: 'DAY 03 · 01:55', objective: '回应“蝴蝶题材”带来的作者性问题', pacing: [180, 'hold'], holdChoices: true },
  'bs-04b-reveal': { kicker: 'NARRATIVE / DISCLOSURE', time: 'DAY 03 · 02:30', objective: '听完，再决定关系怎么继续', pacing: [180, 'hold', 'hold'], holdChoices: true },
  'bs-05-public': { kicker: 'PUBLIC TEST / ARCHIVE', time: 'DAY 06 · 19:00', objective: '把这次方法和关系真正留下来', pacing: [180, 'hold', 'hold'], holdChoices: true }
};

const methodNames = {
  'method-split-motion-and-space': '活体运动 / 静态空间分开采集',
  'method-check-before-leave': '离场前检查',
  'method-diagnose-before-reconstruct': '先诊断再重建',
  'method-choose-representation-by-work': '按作品选择空间表示',
  'method-motion-as-rule': '把运动写成规则',
  'method-source-attribution': '来源与引用',
  'method-selective-preservation': '选择性保存',
  'method-spatial-capture-route': '空间采集路线',
  'method-sampling-as-form': '采样痕迹作为形式',
  'method-view-dependent-space': '视图连续空间'
};

const achievementNames = {
  'ach-field-check': '离开之前，再看一眼',
  'ach-butterfly-as-system': '蝴蝶不是贴图',
  'ach-credit-without-panic': '把来源说清楚',
  'ach-special-butterfly-complete': 'SPECIAL 01 COMPLETE'
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
function initialNarrative() {
  const stored = readJson(STATE_KEY, null);
  return stored?.packId === butterflyScholarNarrativePack.id ? stored : createNarrativeState(butterflyScholarNarrativePack);
}
function mergeWorld(current, effect = {}) {
  const base = { ...emptyWorld(), ...current };
  const next = { ...base };
  for (const key of Object.keys(emptyWorld())) next[key] = unique([...(base[key] || []), ...(effect[key] || [])]);
  return next;
}
function added(next, previous, key) { return (next[key] || []).filter((item) => !(previous[key] || []).includes(item)); }

function TrainingInstrument({ nodeId }) {
  if (nodeId === 'bs-03b-audit') return <div className="bs-instrument audit"><header><small>离场前检查</small><strong>80 张照片</strong></header><div className="bs-readout"><span><b>重叠</b><i>有缺口</i></span><span><b>模糊</b><i>正常</i></span><span><b>曝光</b><i>后段变暗</i></span><span><b>视角</b><i>转角不足</i></span></div><p>意思很简单：现在补拍成本最低。带着这些缺口回去，后面可能直接导致相机求解失败。</p></div>;
  if (nodeId === 'bs-04-process') return <div className="bs-instrument solve"><header><small>相机求解</small><strong>61 / 80 张照片已定位</strong></header><div className="bs-track"><i/><i/><i className="broken"/><i/><i/></div><p>每个点代表一段相机轨迹。中间断开，说明两组照片没有被可靠地接成同一个空间。</p></div>;
  if (nodeId === 'bs-04a-represent') return <div className="bs-instrument representation"><div><small>点云</small><strong>直接看到点、密度和孔洞</strong><p>适合把“扫描过程”也留在画面里。</p></div><div><small>Gaussian</small><strong>移动视角时更连续</strong><p>适合浏览照片里的空间外观。</p></div></div>;
  if (nodeId === 'bs-04e-compose') return <div className="bs-instrument representation"><div><small>程序化</small><strong>Noise / Geometry Nodes</strong><p>不模拟真实物理，直接按规则形变。</p></div><div><small>物理 / 实时</small><strong>风、碰撞、观众位置</strong><p>让环境或观众真的参与运动。</p></div></div>;
  if (nodeId === 'bs-04b-reveal') return <div className="bs-instrument identity"><small>信息更新</small><strong>Inés 的工作身份比第一次自我介绍多一层。</strong><p>这不是“抓到卧底”。真正的问题是：数据许可、合作关系和私人信任现在要重新判断。</p></div>;
  return null;
}

function MemoryPanel({ knownFacts, contradictions, world, collapsed, onToggle }) {
  const learned = (world.researchIds || []).map((id) => researchById.get(id)).filter(Boolean);
  return <aside className={`bs-memory ${collapsed ? 'collapsed' : ''}`} aria-label="临时记忆与已知信息">
    <header><div><small>TEMP MEMORY</small><strong>已知信息</strong></div><button onClick={onToggle}>{collapsed ? '展开' : '收起'}</button></header>
    {!collapsed && <>
      <section><small>当前问题</small><p>{butterflyScholarIdentity.currentQuestion}</p></section>
      <section><small>已经确认</small>{knownFacts.slice(-4).map((fact) => <p key={fact.id}><b>{fact.state === 'verified' || fact.state === 'revealed' ? '✓' : '·'}</b>{fact.label}</p>)}</section>
      {contradictions.length > 0 && <section className="warning"><small>还没解释清楚</small>{contradictions.slice(-2).map((fact) => <p key={fact.id}>? {fact.label}</p>)}</section>}
      <section><small>研究过</small>{learned.length ? learned.slice(-4).map((card) => <p key={card.id}>+ {card.title}</p>) : <p className="muted">还没有。遇到不懂的词，可以先点“研究”。</p>}</section>
    </>}
  </aside>;
}

function ResearchSheet({ card, learned, onRemember, onClose }) {
  if (!card) return null;
  return <div className="bs-research-layer" role="dialog" aria-label={`研究：${card.title}`}>
    <section className="bs-research-card">
      <header><small>RESEARCH NOTE</small><button onClick={onClose}>关闭</button></header>
      <h2>{card.title}</h2><strong>{card.short}</strong><p>{card.plain}</p>
      <div><small>为什么跟作品有关</small><p>{card.why}</p></div>
      <button className="primary" onClick={() => onRemember(card)}>{learned ? '已记住 · 返回' : '记住这个方法'}</button>
    </section>
  </div>;
}

function Ending({ state, world, blueprintHref, chaptersHref, onReset }) {
  const [openPanel, setOpenPanel] = useState('');
  const outcome = useMemo(() => deriveButterflyOutcome(state, world), [state, world]);
  const carryover = [
    `节点 ${world.unlockNodeIds?.length || 0}`,
    `方法 ${world.methodIds?.length || 0}`,
    `研究 ${world.researchIds?.length || 0}`,
    `Evidence ${world.evidenceIds?.length || 0}`,
    `成就 ${world.achievementIds?.length || 0}`
  ];

  return <main className="bs-shell"><header className="bs-topbar"><div><small>SPECIAL 01</small><strong>哥斯达黎加的蝴蝶学者</strong></div><nav><a href={chaptersHref}>章节选择</a></nav></header><section className="bs-ending">
    <div className="bs-ending-head"><div className="bs-seal"><span>SPECIAL 01</span><strong>COMPLETE</strong></div><div><small>CHAPTER ARCHIVED</small><h1>终于做完了。</h1><p>{outcome.headline}</p></div></div>

    <section className="bs-public-result" aria-label="公开测试反馈">
      <header><small>PUBLIC TEST / 这次真的发生了什么</small><strong>{outcome.summary}</strong></header>
      <div className="bs-public-notes">{outcome.publicNotes.map((note) => <article key={note.speaker}><small>{note.speaker}</small><p>{note.text}</p></article>)}</div>
    </section>

    <section className="bs-archive-result" aria-label="本次章节归档">
      <header><small>THIS RUN / ARCHIVE</small><strong>不是评分，是这次路线留下的东西</strong></header>
      <div>{outcome.archiveLines.map((line) => <article key={line.label} data-state={line.state}><small>{line.label}</small><p>{line.value}</p><span>{line.state === 'open' ? '未解决' : line.state === 'learned' ? '已形成方法' : '已保留'}</span></article>)}</div>
    </section>

    {outcome.unresolved.length > 0 && <section className="bs-open-threads"><small>还没结束</small>{outcome.unresolved.map((item) => <p key={item}>→ {item}</p>)}</section>}

    <section className="bs-carryover"><small>带出 SPECIAL 01</small><div>{carryover.map((item) => <span key={item}>{item}</span>)}</div><p>这些不是本章专用分数。节点、方法、研究和 Evidence 会继续进入全局工作台与记录系统。</p></section>

    {openPanel === 'journal' && <div className="bs-project-log"><small>创作记录 / 私人归档</small><p>{outcome.journal}</p></div>}
    {openPanel === 'social' && <div className="bs-project-log public"><small>公开发布 / 草稿</small><p>{outcome.socialDraft}</p></div>}

    <div className="bs-ending-actions"><a className="primary" href={blueprintHref}>进入三步训练工作图</a><button onClick={() => setOpenPanel((value) => value === 'journal' ? '' : 'journal')}>{openPanel === 'journal' ? '收起创作记录' : '生成创作记录'}</button><button onClick={() => setOpenPanel((value) => value === 'social' ? '' : 'social')}>{openPanel === 'social' ? '收起公开草稿' : '生成公开发布草稿'}</button><a href={chaptersHref}>返回章节选择</a><button onClick={onReset}>重新游玩</button></div>
  </section></main>;
}

export default function V05ButterflyScholarRoute() {
  const [state, setState] = useState(initialNarrative);
  const [world, setWorld] = useState(() => ({ ...emptyWorld(), ...readJson(WORLD_KEY, emptyWorld()) }));
  const [activeResearch, setActiveResearch] = useState(null);
  const [memoryCollapsed, setMemoryCollapsed] = useState(false);
  const node = narrativeNodeById(butterflyScholarNarrativePack, state.currentNodeId);
  const scene = butterflyScholarNarrativePack.scenes.find((item) => item.id === node?.sceneId);
  const speaker = butterflyScholarNarrativePack.actors.find((item) => item.id === node?.speakerId);
  const knownFacts = useMemo(() => narrativeKnownFacts(state), [state]);
  const contradictions = useMemo(() => narrativeContradictions(state), [state]);
  const stageNode = useMemo(() => node ? ({ ...node, choices: node.choices.map((choice) => ({ ...choice, outcomeHint: butterflyChoiceOutcomeHints[choice.id] || choice.outcomeHint })) }) : node, [node]);
  const blueprintHref = v05Href('lab=blueprint&preset=butterfly');
  const chaptersHref = v05Href('mode=career');
  const researchCards = (butterflyResearchByNode[node?.id] || []).map((id) => researchById.get(id)).filter(Boolean);

  function persistWorld(next) { localStorage.setItem(WORLD_KEY, JSON.stringify(next)); setWorld(next); }
  function rememberResearch(card) {
    if ((world.researchIds || []).includes(card.id)) { setActiveResearch(null); return; }
    const effect = { researchIds: [card.id], unlockNodeIds: card.unlockNodeIds || [], methodIds: card.methodId ? [card.methodId] : [] };
    const next = mergeWorld(world, effect); persistWorld(next);
    emitGlobalFeedback({ kind: 'method', code: 'RESEARCHED', title: card.title, detail: card.short }); setActiveResearch(null);
  }
  function notifyWorldChanges(previous, next, choiceId) {
    const nodes = added(next, previous, 'unlockNodeIds'); const methods = added(next, previous, 'methodIds'); const evidence = added(next, previous, 'evidenceIds'); const achievements = added(next, previous, 'achievementIds');
    if (nodes.length) emitGlobalFeedback({ kind: 'node', title: nodes.length === 1 ? (nodeLabels.get(nodes[0]) || nodes[0]) : `解锁 ${nodes.length} 个节点`, detail: nodes.map((id) => nodeLabels.get(id) || id).join(' · ') });
    if (methods.length) emitGlobalFeedback({ kind: 'method', title: methodNames[methods[0]] || methods[0], detail: methods.length > 1 ? `同时获得 ${methods.length - 1} 个相关方法` : '方法已进入你的记录。' });
    if (evidence.length && !nodes.length && !methods.length) emitGlobalFeedback({ kind: 'evidence', title: '记录已保存', detail: `${evidence.length} 条 Evidence 写入当前章节。` });
    if (achievements.length) emitGlobalFeedback({ kind: 'achievement', code: 'TRIUMPH', title: achievementNames[achievements[0]] || achievements[0], detail: '这个结果已进入成就与章节档案。' });
    if (choiceId === 'bs-reveal-listen') emitGlobalFeedback({ kind: 'relationship', title: 'Inés / 关系继续', detail: '你先听完了完整信息。这个回应被她记住。' });
    if (choiceId === 'bs-reveal-distance') emitGlobalFeedback({ kind: 'relationship', title: 'Inés / 保持距离', detail: '合作继续，私人关系暂时停在这里。' });
  }
  function choose(choice) {
    const nextState = applyNarrativeChoice(butterflyScholarNarrativePack, state, choice.id); if (nextState === state) return;
    const nextWorld = mergeWorld(world, butterflyWorldEffectsByChoice[choice.id]); localStorage.setItem(STATE_KEY, JSON.stringify(nextState)); persistWorld(nextWorld); notifyWorldChanges(world, nextWorld, choice.id); setState(nextState); window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function reset() {
    const nextState = createNarrativeState(butterflyScholarNarrativePack); const nextWorld = emptyWorld(); localStorage.setItem(STATE_KEY, JSON.stringify(nextState)); localStorage.setItem(WORLD_KEY, JSON.stringify(nextWorld)); setState(nextState); setWorld(nextWorld); setActiveResearch(null);
  }

  if (!node) return <main className="bs-shell"><section className="bs-error"><h1>路线状态损坏</h1><button onClick={reset}>重置路线</button></section></main>;
  if (!node.choices.length) return <Ending state={state} world={world} blueprintHref={blueprintHref} chaptersHref={chaptersHref} onReset={reset}/>;

  const minorActions = researchCards.map((card) => ({ id: card.id, label: `${(world.researchIds || []).includes(card.id) ? '复习' : '研究'}：${card.title}`, onClick: () => setActiveResearch(card) }));

  return <main className="bs-shell"><header className="bs-topbar"><div><small>SPECIAL 01</small><strong>哥斯达黎加的蝴蝶学者</strong></div><nav><a href={blueprintHref}>工作图</a><a href={chaptersHref}>章节选择</a><button onClick={reset}>重置</button></nav></header><section className="bs-play"><div className="bs-main"><V05NarrativeStage contentKey={node.id} scene={scene} speaker={speaker} node={stageNode} meta={metaByNode[node.id]} showLoad={fullLoadNodes.has(node.id)} instrument={<TrainingInstrument nodeId={node.id}/>} minorActions={minorActions} onChoose={choose}/></div><MemoryPanel knownFacts={knownFacts} contradictions={contradictions} world={world} collapsed={memoryCollapsed} onToggle={() => setMemoryCollapsed((value) => !value)}/></section><ResearchSheet card={activeResearch} learned={activeResearch ? (world.researchIds || []).includes(activeResearch.id) : false} onRemember={rememberResearch} onClose={() => setActiveResearch(null)}/></main>;
}
