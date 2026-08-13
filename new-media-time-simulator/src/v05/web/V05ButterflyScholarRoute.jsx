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
  butterflyWorldEffectsByChoice,
  deriveButterflyWorldEffect,
  resolveButterflyNodeText
} from '../butterflyScholarPack.ts';
import { butterflyChoiceOutcomeHints, deriveButterflyOutcome } from '../butterflyScholarOutcome.ts';
import {
  costaRicaChoiceProgressNotice,
  deriveCostaRicaAssets,
  deriveCostaRicaMementos,
  deriveCostaRicaRouteStages,
  emphasizeChoiceHint
} from '../costaRicaRouteState.ts';
import { buildCostaRicaCarryover, persistSpecialCarryover } from '../specialCarryover.ts';
import { applyAction, createRunState, loadRunState, saveRunState, V051_RUN_SAVE_KEY } from '../runState.ts';
import V05NarrativeStage from './V05NarrativeStage.jsx';
import { emitGlobalFeedback } from './V05GlobalFeedback.jsx';
import './v05-butterfly-scholar.css';
import './v05-costarica-state.css';

const STATE_KEY = 'nmas-special-costarica-narrative-v1';
const WORLD_KEY = 'nmas-special-costarica-world-v1';
const LEGACY_STATE_KEY = 'nmas-special-butterfly-narrative-v2';
const LEGACY_WORLD_KEY = 'nmas-special-butterfly-world-v2';
const nodeLabels = new Map(editorNodeDefinitions.map((item) => [item.id, item.label]));
const researchById = new Map(butterflyResearchCards.map((item) => [item.id, item]));

const emptyWorld = () => ({ unlockNodeIds: [], evidenceIds: [], methodIds: [], researchIds: [], threadIds: [], archiveEntryIds: [], achievementIds: [], qualitySignals: [], projectTags: [] });
const unique = (values) => [...new Set(values.filter(Boolean))];
const fullLoadNodes = new Set(['bs-01-invite', 'bs-03-field', 'bs-05-public']);

const metaByNode = {
  'bs-01-invite': { kicker: 'SPECIAL 01 / COSTA RICA INVITATION', time: 'DAY -03 · 22:10', objective: '先确认：这是不是一份你愿意真的出发去做的驻地任务', pacing: ['short', 'long', 'hold'], holdChoices: true },
  'bs-02-arrival': { kicker: 'COSTA RICA / ARRIVAL', time: 'DAY 01 · 14:20', objective: '把人、现场权限和数据边界说清楚', pacing: ['short', 'beat', 'hold'], holdChoices: true },
  'bs-03-field': { kicker: 'FIELD / CAPTURE', time: 'DAY 02 · 09:40', objective: '先观察，再决定什么东西该怎么采', pacing: ['short', 'long', 'hold'], holdChoices: true },
  'bs-03b-audit': { kicker: 'FIELD / CHECK', time: 'DAY 02 · 16:50', objective: '离场前检查 CR-PHOTOSET-01，决定要不要补拍', pacing: ['short', 'hold'], holdChoices: true },
  'bs-04-process': { kicker: 'WORKBENCH / CAMERA SOLVE', time: 'DAY 02 · 22:35', objective: '让现场数据真正进入工作室状态', pacing: ['short', 'hold'], holdChoices: true },
  'bs-04x-failure': { kicker: 'WORKBENCH / FAILED BUILD', time: 'DAY 02 · 23:20', objective: 'FAIL_01 已生成：决定修、留，还是继续转化', pacing: ['short', 'hold'], holdChoices: true },
  'bs-04a-represent': { kicker: 'WORKBENCH / FIRST VERSION', time: 'DAY 03 · 00:10', objective: '决定要不要把这次失败直接给观众看', pacing: ['short', 'hold'], holdChoices: true },
  'bs-04e-compose': { kicker: 'WORKBENCH / MAKE THE WORK', time: 'DAY 03 · 01:20', objective: '重建只是 Asset：现在决定它怎么进入作品', pacing: ['short', 'hold'], holdChoices: true },
  'bs-04f-authorship': { kicker: 'NETWORK / PEER FEEDBACK', time: 'DAY 03 · 01:55', objective: '这次选择会进入作者性、来源与公开记录', pacing: ['short', 'long', 'hold'], holdChoices: true },
  'bs-04b-reveal': { kicker: 'INSTITUTION / ROLE CONFLICT', time: 'DAY 03 · 02:30', objective: '处理协作者同时也是评估者的角色冲突', pacing: ['short', 'long', 'hold'], holdChoices: true },
  'bs-05-public': { kicker: 'PUBLIC TEST / ARCHIVE', time: 'DAY 06 · 19:00', objective: '把方法、失败、人物、Assets 与机构边界留下来', pacing: ['short', 'beat', 'hold'], holdChoices: true }
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
  'ach-clean-solve': '补拍真的有用',
  'ach-keep-the-failure': '失败也算 Evidence',
  'ach-butterfly-as-system': '蝴蝶不是贴图',
  'ach-observation-to-system': '观察变成规则',
  'ach-butterfly-without-icon': '没有蝴蝶图标的蝴蝶作品',
  'ach-credit-without-panic': '把来源说清楚',
  'ach-special-butterfly-complete': '哥斯达黎加 / COMPLETE'
};

function v05Href(query = '') {
  const params = new URLSearchParams(window.location.search);
  const rootPreview = params.get('core') === 'v05' && !window.location.pathname.includes('/v05/') && !window.location.pathname.includes('/v051/');
  if (!query) return rootPreview ? './?core=v05' : './';
  return rootPreview ? `./?core=v05&${query}` : `./?${query}`;
}

function readJson(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}
function initialNarrative() {
  const stored = readJson(STATE_KEY, null) || readJson(LEGACY_STATE_KEY, null);
  return stored?.packId === butterflyScholarNarrativePack.id ? stored : createNarrativeState(butterflyScholarNarrativePack);
}
function initialWorld() {
  return { ...emptyWorld(), ...(readJson(WORLD_KEY, null) || readJson(LEGACY_WORLD_KEY, emptyWorld())) };
}
function mergeWorld(current, effect = {}) {
  const base = { ...emptyWorld(), ...current };
  const next = { ...base };
  for (const key of Object.keys(emptyWorld())) next[key] = unique([...(base[key] || []), ...(effect[key] || [])]);
  return next;
}
function added(next, previous, key) { return (next[key] || []).filter((item) => !(previous[key] || []).includes(item)); }

function projectSnapshot(state) {
  const flags = new Set(state.flags || []);
  const capture = flags.has('capture-relation-route') ? '运动 + 空间分开采集' : flags.has('capture-ethical-trace') ? '非侵入痕迹 / 寄主关系' : flags.has('capture-space-route') ? '样地空间优先' : '未决定';
  const data = flags.has('field-recapture') ? '缺口已在现场补拍' : flags.has('capture-gap-debt') ? '已知缺口带回工作室' : '尚未离场检查';
  const solve = flags.has('failure-used-as-form') ? '脆弱重建 / 断裂作为形式' : flags.has('solve-repaired') ? '失败版保留 / 可用版已修' : flags.has('forced-reconstruct-bad-solve') ? '错误重建已生成' : flags.has('diagnosed-camera-solve') ? '相机关系已检查' : '尚未处理';
  const representation = flags.has('representation-pointcloud') ? '点云' : flags.has('representation-gaussian') ? 'Gaussian' : '未选择';
  const motion = flags.has('motion-interactive-butterfly') ? '互动行为' : flags.has('motion-physics') ? '物理规则' : flags.has('motion-procedural') ? '程序化形变' : '未进入动画';
  const publicState = flags.has('authorship-unresolved') ? '“为什么是蝴蝶”仍待反馈' : flags.has('authorship-system-shift') ? '蝴蝶从图像退为行为规则' : flags.has('authorship-attributed') ? '来源与差异已写清' : '未处理作者性';
  return [['采集', capture], ['数据', data], ['重建', solve], ['作品', `${representation} / ${motion}`], ['公开', publicState]];
}

function RouteProgress({ state }) {
  const stages = deriveCostaRicaRouteStages(state);
  return <section className="cr-route-progress" aria-label="哥斯达黎加任务进度">{stages.map((stage) => <article key={stage.id} data-state={stage.state}><small>{stage.state === 'done' ? 'DONE' : stage.state === 'current' ? 'CURRENT' : 'NEXT'}</small><strong>{stage.label}</strong><span>{stage.detail}</span></article>)}</section>;
}

function TrainingInstrument({ nodeId, flags = [] }) {
  const has = new Set(flags);
  if (nodeId === 'bs-03b-audit') return <div className="bs-instrument audit"><header><small>CR-PHOTOSET-01 / 离场前检查</small><strong>80 张照片</strong></header><div className="bs-readout"><span><b>重叠</b><i>有缺口</i></span><span><b>模糊</b><i>正常</i></span><span><b>曝光</b><i>后段变暗</i></span><span><b>视角</b><i>转角不足</i></span></div><p>现在补拍只要十分钟。这个数据包后面会继续进入 Camera Solve、重建和你的长期 Assets。</p></div>;
  if (nodeId === 'bs-04-process') {
    const repairedByField = has.has('field-recapture');
    return <div className="bs-instrument solve"><header><small>CR-SOLVE-01 / 相机求解</small><strong>{repairedByField ? '76 / 80 张照片已定位' : '61 / 80 张照片已定位'}</strong></header><div className={`bs-track ${repairedByField ? 'healthy' : ''}`}><i/><i/><i className={repairedByField ? '' : 'broken'}/><i/><i/></div><p>{repairedByField ? '白天补拍的转角已经接上。还有少量未注册照片，但不在关键区域。' : '白天留下的缺口现在变成了断开的相机轨迹。它不是抽象扣分，而是空间关系真的没算出来。'}</p></div>;
  }
  if (nodeId === 'bs-04x-failure') return <div className="bs-instrument failure"><header><small>FAILED BUILD / ASSET 已保存</small><strong>叶片双层 · 转角断裂 · 错位相机</strong></header><div className="bs-readout"><span><b>版本</b><i>FAIL_01</i></span><span><b>原因</b><i>覆盖不足</i></span><span><b>可修</b><i>是</i></span><span><b>可留作 Evidence</b><i>是</i></span></div><p>失败不会被系统自动清空。以后它既能用于诊断，也可能成为别的作品、教学或复盘材料。</p></div>;
  if (nodeId === 'bs-04a-represent') return <div className="bs-instrument representation"><div><small>版本 A</small><strong>把断裂留在画面里</strong><p>观众会看见这次采集没拍全的地方。</p></div><div><small>版本 B</small><strong>先让画面好走进去</strong><p>把失败留在作品记录里，不让它抢走第一次观看。</p></div></div>;
  if (nodeId === 'bs-04e-compose') return <div className="bs-instrument representation"><div><small>让它自己慢慢变</small><strong>画面会按一套规则持续变化</strong><p>适合把现场变成不安静的记忆。</p></div><div><small>让观众靠近才发生</small><strong>人的位置会改变画面</strong><p>适合把“观察”变成一件真的发生的事。</p></div></div>;
  if (nodeId === 'bs-04b-reveal') return <div className="bs-instrument identity"><small>角色冲突</small><strong>Inés 同时负责现场协作和长期合作评估。</strong><p>这是会影响合作、数据和后续机会的认真选择，不是对白口味选择。</p></div>;
  return null;
}

function MemoryPanel({ knownFacts, contradictions, world, state, collapsed, onToggle }) {
  const learned = (world.researchIds || []).map((id) => researchById.get(id)).filter(Boolean);
  const assets = deriveCostaRicaAssets(state, world);
  const mementos = deriveCostaRicaMementos(state, world);
  return <aside className={`bs-memory ${collapsed ? 'collapsed' : ''}`} aria-label="临时记忆与已知信息">
    <header><div><small>RECORDS / LIVE</small><strong>当前记录</strong></div><button onClick={onToggle}>{collapsed ? '展开' : '收起'}</button></header>
    {!collapsed && <>
      <section><small>当前问题</small><p>{butterflyScholarIdentity.currentQuestion}</p></section>
      <section className="bs-current-build"><small>CURRENT BUILD / 当前版本</small>{projectSnapshot(state).map(([label, value]) => <p key={label}><b>{label}</b><span>{value}</span></p>)}</section>
      <section className="cr-assets"><small>ASSETS / 可继续使用</small>{assets.length ? assets.slice(-4).map((asset) => <p key={asset.id}><b>{asset.title}</b><span>{asset.kind}</span></p>) : <p className="muted">还没有形成可携带资料。</p>}</section>
      <section className="cr-mementos"><small>COLLECTION / 纪念与碎片</small>{mementos.length ? mementos.slice(-3).map((item) => <p key={item.id}><b>{item.title}</b><span>{item.kind}</span></p>) : <p className="muted">出发以后，这里会留下行程与人物碎片。</p>}</section>
      <section><small>已经确认</small>{knownFacts.slice(-4).map((fact) => <p key={fact.id}><b>{fact.state === 'verified' || fact.state === 'revealed' ? '✓' : '·'}</b>{fact.label}</p>)}</section>
      {contradictions.length > 0 && <section className="warning"><small>还没解释清楚</small>{contradictions.slice(-2).map((fact) => <p key={fact.id}>? {fact.label}</p>)}</section>}
      <section><small>知识 / 已研究</small>{learned.length ? learned.slice(-4).map((card) => <p key={card.id}>+ {card.title}</p>) : <p className="muted">遇到不懂的词，可以先研究；知识会继续解锁节点与方法。</p>}</section>
    </>}
  </aside>;
}

function ResearchSheet({ card, learned, onRemember, onClose }) {
  if (!card) return null;
  const unlocks = (card.unlockNodeIds || []).map((id) => nodeLabels.get(id) || id);
  return <div className="bs-research-layer" role="dialog" aria-label={`研究：${card.title}`}>
    <section className="bs-research-card">
      <header><small>KNOWLEDGE / RESEARCH</small><button onClick={onClose}>关闭</button></header>
      <h2>{card.title}</h2><strong>{card.short}</strong><p>{card.plain}</p>
      <div><small>为什么跟作品有关</small><p>{card.why}</p></div>
      {(unlocks.length > 0 || card.methodId) && <div className="bs-research-unlocks"><small>理解以后可进入工作台</small>{unlocks.map((item) => <span key={item}>节点 · {item}</span>)}{card.methodId && <span>方法 · 可复用</span>}</div>}
      <button className="primary" onClick={() => onRemember(card)}>{learned ? '已掌握 · 返回' : '理解并写入知识库'}</button>
    </section>
  </div>;
}

function CollectionShelf({ state, world }) {
  const assets = deriveCostaRicaAssets(state, world);
  const mementos = deriveCostaRicaMementos(state, world);
  return <>
    <section className="cr-collection" aria-label="哥斯达黎加 Assets"><header><div><small>ASSET LIBRARY</small><strong>这次真正生产出来的资料</strong></div><strong>{assets.length} ASSETS</strong></header><div className="cr-collection-grid">{assets.map((asset) => <article key={asset.id}><small className="cr-asset-id">{asset.id}</small><strong>{asset.title.split(' / ')[1] || asset.title}</strong><p>{asset.detail}</p><em>以后可用：{asset.use}</em></article>)}</div></section>
    <section className="cr-collection" aria-label="哥斯达黎加纪念库"><header><div><small>TRIUMPH / MEMENTOS</small><strong>成就也可以是一件小东西</strong></div><strong>{mementos.length} PIECES</strong></header><div className="cr-collection-grid">{mementos.map((item) => <article key={item.id}><small>{item.kind}</small><strong>{item.title}</strong><p>{item.detail}</p></article>)}</div></section>
  </>;
}

function Ending({ state, world, blueprintHref, chaptersHref, onReset }) {
  const [openPanel, setOpenPanel] = useState('');
  const outcome = useMemo(() => deriveButterflyOutcome(state, world), [state, world]);
  const assets = deriveCostaRicaAssets(state, world);
  const mementos = deriveCostaRicaMementos(state, world);
  const carryover = [`Assets ${assets.length}`, `节点 ${world.unlockNodeIds?.length || 0}`, `方法 ${world.methodIds?.length || 0}`, `知识 ${world.researchIds?.length || 0}`, `纪念品 ${mementos.length}`];
  return <main className="bs-shell"><header className="bs-topbar"><div><small>SPECIAL 01 · COSTA RICA</small><strong>哥斯达黎加</strong></div><nav><a href={chaptersHref}>章节选择</a></nav></header><RouteProgress state={state}/><section className="bs-ending">
    <div className="bs-ending-head"><div className="bs-seal"><span>SPECIAL 01</span><strong>ARCHIVED</strong></div><div><small>COSTA RICA / COMPLETE</small><h1>这趟结束了。</h1><p>{outcome.headline}</p></div></div>
    <section className="bs-public-result" aria-label="公开测试反馈"><header><small>PUBLIC TEST / 这次真的发生了什么</small><strong>{outcome.summary}</strong></header><div className="bs-public-notes">{outcome.publicNotes.map((note) => <article key={note.speaker}><small>{note.speaker}</small><p>{note.text}</p></article>)}</div></section>
    <section className="bs-archive-result" aria-label="本次章节归档"><header><small>THIS RUN / ARCHIVE</small><strong>不是评分，是这次路线留下的东西</strong></header><div>{outcome.archiveLines.map((line) => <article key={line.label} data-state={line.state}><small>{line.label}</small><p>{line.value}</p><span>{line.state === 'open' ? '未解决' : line.state === 'learned' ? '已形成方法' : '已保留'}</span></article>)}</div></section>
    <CollectionShelf state={state} world={world}/>
    {outcome.unresolved.length > 0 && <section className="bs-open-threads"><small>还没结束</small>{outcome.unresolved.map((item) => <p key={item}>→ {item}</p>)}</section>}
    <section className="bs-carryover"><small>带出哥斯达黎加</small><div>{carryover.map((item) => <span key={item}>{item}</span>)}</div><p>这些不是本章专用分数。知识解锁节点，节点处理 Assets；Assets、纪念品、失败和人物记录会继续进入长期生涯。</p></section>
    {openPanel === 'journal' && <div className="bs-project-log"><small>创作记录 / 私人归档</small><p>{outcome.journal}</p></div>}
    {openPanel === 'social' && <div className="bs-project-log public"><small>公开发布 / 草稿</small><p>{outcome.socialDraft}</p></div>}
    <div className="bs-ending-actions"><a className="primary" href={blueprintHref}>把 Assets 带进工作图</a><button onClick={() => setOpenPanel((value) => value === 'journal' ? '' : 'journal')}>{openPanel === 'journal' ? '收起创作记录' : '生成创作记录'}</button><button onClick={() => setOpenPanel((value) => value === 'social' ? '' : 'social')}>{openPanel === 'social' ? '收起公开草稿' : '生成公开发布草稿'}</button><a href={chaptersHref}>返回章节选择</a><button onClick={onReset}>重新游玩</button></div>
  </section></main>;
}

export default function V05ButterflyScholarRoute() {
  const [state, setState] = useState(initialNarrative);
  const [world, setWorld] = useState(initialWorld);
  const [activeResearch, setActiveResearch] = useState(null);
  const [memoryCollapsed, setMemoryCollapsed] = useState(false);
  const node = narrativeNodeById(butterflyScholarNarrativePack, state.currentNodeId);
  const scene = butterflyScholarNarrativePack.scenes.find((item) => item.id === node?.sceneId);
  const speaker = butterflyScholarNarrativePack.actors.find((item) => item.id === node?.speakerId);
  const knownFacts = useMemo(() => narrativeKnownFacts(state), [state]);
  const contradictions = useMemo(() => narrativeContradictions(state), [state]);
  const stageNode = useMemo(() => node ? ({ ...node, text: resolveButterflyNodeText(node.id, state.flags, node.text), choices: node.choices.map((choice) => { const hint = butterflyChoiceOutcomeHints[choice.id] || choice.outcomeHint || ''; return { ...choice, outcomeHint: emphasizeChoiceHint(choice.id, hint) }; }) }) : node, [node, state.flags]);
  const blueprintHref = v05Href('lab=blueprint&preset=costarica');
  const chaptersHref = v05Href('mode=career');
  const researchCards = (butterflyResearchByNode[node?.id] || []).map((id) => researchById.get(id)).filter(Boolean);

  // The established Costa Rica save remains canonical for this existing route.
  // v05.1 mirrors each decision into a versioned, deterministic audit trail,
  // without guessing at or overwriting any older save format.
  function recordV051Action(choice) {
    if (!node) return;
    const fallback = createRunState({ runId: 'costa-rica-butterfly', identity: { id: 'butterfly-scholar', label: butterflyScholarIdentity.title }, chapterId: 'costa-rica', currentNodeId: node.id, objective: '把现场观察转化为可继续使用的作品方法' });
    const prior = loadRunState(localStorage.getItem(V051_RUN_SAVE_KEY), fallback);
    const isFinal = choice.id === 'bs-archive-open';
    const actionNode = { id: node.id, type: 'decision', text: node.text.join(' '), actions: [{ id: choice.id, label: choice.label, nextNodeId: choice.nextNodeId, result: { summary: `已选择：${choice.label}`, delta: { resources: { energy: -1 }, addFlags: [choice.id], ...(isFinal ? { addWork: { id: 'work-costa-rica-butterfly', workingTitle: '哥斯达黎加 / 蝴蝶与现场关系', projectId: 'project-costa-rica', status: 'public', originEventId: node.id, decisionIds: [choice.id] } } : {}) } } }] };
    saveRunState(localStorage, applyAction(prior, actionNode, choice.id));
  }

  function persistWorld(next) { localStorage.setItem(WORLD_KEY, JSON.stringify(next)); setWorld(next); }
  function rememberResearch(card) {
    if ((world.researchIds || []).includes(card.id)) { setActiveResearch(null); return; }
    const effect = { researchIds: [card.id], unlockNodeIds: card.unlockNodeIds || [], methodIds: card.methodId ? [card.methodId] : [] };
    const next = mergeWorld(world, effect); persistWorld(next);
    emitGlobalFeedback({ kind: 'method', code: 'KNOWLEDGE → NODE', title: card.title, detail: card.unlockNodeIds?.length ? `知识已写入；工作台解锁：${card.unlockNodeIds.map((id) => nodeLabels.get(id) || id).join(' · ')}` : card.short });
    setActiveResearch(null);
  }
  function recordButterflyMoment() {
    if ((world.evidenceIds || []).includes('ev-butterfly-two-second')) return;
    const next = mergeWorld(world, { unlockNodeIds: ['butterfly-observation'], evidenceIds: ['ev-butterfly-two-second'], qualitySignals: ['behavior-noted-before-capture'] });
    persistWorld(next);
    emitGlobalFeedback({ kind: 'evidence', code: 'ASSET CREATED', title: 'CR-FIELD-1.8S / 观察记录', detail: '这条 1.8 秒记录以后可以进入行为系统、动画规则和项目档案。' });
  }
  function notifyWorldChanges(previous, next, choiceId) {
    const nodes = added(next, previous, 'unlockNodeIds'); const methods = added(next, previous, 'methodIds'); const evidence = added(next, previous, 'evidenceIds'); const achievements = added(next, previous, 'achievementIds');
    const progress = costaRicaChoiceProgressNotice[choiceId];
    if (progress) emitGlobalFeedback({ kind: progress.serious ? 'relationship' : 'evidence', code: progress.serious ? 'IMPORTANT CHOICE' : 'STATE UPDATE', title: progress.title, detail: progress.detail });
    if (nodes.length) emitGlobalFeedback({ kind: 'node', title: nodes.length === 1 ? (nodeLabels.get(nodes[0]) || nodes[0]) : `解锁 ${nodes.length} 个节点`, detail: nodes.map((id) => nodeLabels.get(id) || id).join(' · ') });
    if (methods.length) emitGlobalFeedback({ kind: 'method', title: methodNames[methods[0]] || methods[0], detail: methods.length > 1 ? `同时获得 ${methods.length - 1} 个相关方法` : '方法已进入你的记录。' });
    if (evidence.length && !nodes.length && !methods.length) emitGlobalFeedback({ kind: 'evidence', title: 'Asset / Evidence 已保存', detail: `${evidence.length} 条新资料写入当前章节。` });
    if (achievements.length) emitGlobalFeedback({ kind: 'achievement', code: 'TRIUMPH / MEMENTO', title: achievementNames[achievements[0]] || achievements[0], detail: '它既可以是成就，也可以成为一段可以回看的故事碎片。' });
  }
  function choose(choice) {
    const nextState = applyNarrativeChoice(butterflyScholarNarrativePack, state, choice.id); if (nextState === state) return;
    const baseEffect = butterflyWorldEffectsByChoice[choice.id] || {};
    const contextualEffect = deriveButterflyWorldEffect(state.flags, choice.id);
    const nextWorld = mergeWorld(mergeWorld(world, baseEffect), contextualEffect);
    recordV051Action(choice);
    localStorage.setItem(STATE_KEY, JSON.stringify(nextState));
    persistWorld(nextWorld);
    notifyWorldChanges(world, nextWorld, choice.id);
    if ((nextState.flags || []).includes('butterfly-route-complete')) {
      const carryover = buildCostaRicaCarryover(nextState, nextWorld);
      persistSpecialCarryover(carryover);
      emitGlobalFeedback({ kind: 'achievement', code: 'CARRYOVER', title: '哥斯达黎加 / 已进入长期生涯', detail: `${carryover.assetIds.length} 个 Assets · ${carryover.methodIds.length} 个方法 · ${carryover.mementoIds.length} 件纪念碎片现在可以被后续任务调用。` });
    }
    setState(nextState);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function reset() {
    const nextState = createNarrativeState(butterflyScholarNarrativePack); const nextWorld = emptyWorld();
    for (const key of [STATE_KEY, WORLD_KEY, LEGACY_STATE_KEY, LEGACY_WORLD_KEY, V051_RUN_SAVE_KEY]) localStorage.removeItem(key);
    localStorage.setItem(STATE_KEY, JSON.stringify(nextState)); localStorage.setItem(WORLD_KEY, JSON.stringify(nextWorld)); setState(nextState); setWorld(nextWorld); setActiveResearch(null);
  }

  if (!node || !stageNode) return <main className="bs-shell"><section className="bs-error"><h1>路线状态损坏</h1><button onClick={reset}>重置路线</button></section></main>;
  if (!node.choices.length) return <Ending state={state} world={world} blueprintHref={blueprintHref} chaptersHref={chaptersHref} onReset={reset}/>;

  const contextualActions = [];
  if (node.id === 'bs-03-field' && !(world.evidenceIds || []).includes('ev-butterfly-two-second')) contextualActions.push({ id: 'field-note-two-second', label: '小操作：记下这 1.8 秒', onClick: recordButterflyMoment });
  const minorActions = [...contextualActions, ...researchCards.map((card) => ({ id: card.id, label: `${(world.researchIds || []).includes(card.id) ? '复习' : '研究'}：${card.title}`, onClick: () => setActiveResearch(card) }))];

  return <main className="bs-shell"><header className="bs-topbar"><div><small>SPECIAL 01 · COSTA RICA</small><strong>哥斯达黎加</strong></div><nav><a href={blueprintHref}>工作图</a><a href={chaptersHref}>章节选择</a><button onClick={reset}>重置</button></nav></header><RouteProgress state={state}/><section className="bs-play"><div className="bs-main"><V05NarrativeStage contentKey={node.id} scene={scene} speaker={speaker} node={stageNode} meta={metaByNode[node.id]} showLoad={fullLoadNodes.has(node.id)} instrument={<TrainingInstrument nodeId={node.id} flags={state.flags}/>} minorActions={minorActions} onChoose={choose}/></div><MemoryPanel knownFacts={knownFacts} contradictions={contradictions} world={world} state={state} collapsed={memoryCollapsed} onToggle={() => setMemoryCollapsed((value) => !value)}/></section><ResearchSheet card={activeResearch} learned={activeResearch ? (world.researchIds || []).includes(activeResearch.id) : false} onRemember={rememberResearch} onClose={() => setActiveResearch(null)}/></main>;
}
