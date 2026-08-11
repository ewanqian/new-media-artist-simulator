import { useMemo, useState } from 'react';
import {
  applyNarrativeChoice,
  createNarrativeState,
  narrativeKnownFacts,
  narrativeNodeById
} from '../narrativeEngine.ts';
import { editorNodeDefinitions } from '../blueprintEditorCatalog.ts';
import {
  butterflyScholarIdentity,
  butterflyScholarNarrativePack,
  butterflyWorldEffectsByChoice
} from '../butterflyScholarPack.ts';
import {
  butterflyKnowledgeById,
  knowledgeForNarrativeNode
} from '../butterflyScholarKnowledge.ts';
import V05NarrativeStage from './V05NarrativeStage.jsx';
import { emitGlobalFeedback } from './V05GlobalFeedback.jsx';
import './v05-butterfly-scholar.css';

const STATE_KEY = 'nmas-special-butterfly-narrative-v1';
const WORLD_KEY = 'nmas-special-butterfly-world-v1';
const nodeLabels = new Map(editorNodeDefinitions.map((item) => [item.id, item.label]));

const emptyWorld = () => ({ unlockNodeIds: [], evidenceIds: [], methodIds: [], knowledgeIds: [], threadIds: [], archiveEntryIds: [], projectTags: [] });
const unique = (values) => [...new Set((values || []).filter(Boolean))];
const normalizeWorld = (value = {}) => Object.fromEntries(Object.keys(emptyWorld()).map((key) => [key, unique(value[key] || [])]));
const fullLoadNodes = new Set(['bs-01-invite', 'bs-02-arrival', 'bs-03-field', 'bs-04-process', 'bs-05-public', 'bs-06-after']);

const metaByNode = {
  'bs-01-invite': { kicker: 'SPECIAL 01 / BRIEF', time: 'DAY -03 · 22:10', objective: '读清楚合作要你做什么', pacing: [140, 900] },
  'bs-01b-self': { kicker: 'SPECIAL 01 / PROFILE', time: 'DAY -02 · 00:20', objective: '确定这次带什么方法出发', pacing: [180, 760] },
  'bs-02-arrival': { kicker: 'SPECIAL 01 / ARRIVAL', time: 'DAY 01 · 14:20', objective: '认识合作对象，先把现场规则弄清楚', pacing: [160, 800] },
  'bs-03-field': { kicker: 'FIELD / OBSERVE', time: 'DAY 02 · 09:40', objective: '决定蝴蝶和空间分别怎么采', pacing: [160, 680] },
  'bs-03c-reference': { kicker: 'ECOLOGY / REFERENCE', time: 'DAY 02 · 13:15', objective: '处理蝴蝶题材的借鉴与来源问题', pacing: [170, 920] },
  'bs-03b-audit': { kicker: 'FIELD / CHECK', time: 'DAY 02 · 16:50', objective: '离场前确认数据有没有明显缺口', pacing: [150, 650] },
  'bs-04-process': { kicker: 'WORKBENCH / SOLVE', time: 'DAY 02 · 22:35', objective: '先判断照片有没有形成可信的相机位置', pacing: [180, 820] },
  'bs-04a-represent': { kicker: 'WORKBENCH / OUTPUT', time: 'DAY 03 · 00:10', objective: '根据下一步用途选点云或 Gaussian', pacing: [160, 650] },
  'bs-04e-blender': { kicker: 'WORKBENCH / BLENDER', time: 'DAY 03 · 00:55', objective: '让动画规则和作品内容发生关系', pacing: [160, 680] },
  'bs-04c-browser': { kicker: 'WORKBENCH / WEB', time: 'DAY 03 · 00:55', objective: '只做必要的浏览器清理和预览', pacing: [150, 650] },
  'bs-04d-gap': { kicker: 'WORKBENCH / CLEAN', time: 'DAY 03 · 01:40', objective: '决定这个扫描缺口要不要留', pacing: [160, 760] },
  'bs-04b-reveal': { kicker: 'PROJECT / RIGHTS', time: 'DAY 03 · 02:20', objective: '确认署名、数据和公开边界', pacing: [180, 900] },
  'bs-05-public': { kicker: 'FIELD TEST / PUBLIC', time: 'DAY 06 · 19:00', objective: '做一个真正能公开的版本', pacing: [180, 780] },
  'bs-06-after': { kicker: 'RECORDS / AFTER', time: 'DAY 09 · 23:40', objective: '总结这次到底学会了什么', pacing: [180, 1000] }
};

const methodNames = {
  'method-field-metadata': '现场观察记录',
  'method-spatial-capture-route': '空间采集路线',
  'method-record-absence': '记录缺席',
  'method-source-attribution': '来源与引用',
  'method-check-before-leave': '离场前检查',
  'method-diagnose-before-reconstruct': '先求相机位置',
  'method-procedural-motion': '程序化动画',
  'method-browser-splat-cleanup': '浏览器 Splat 清理',
  'method-local-export-pipeline': '本地处理 / 网页预览',
  'method-preserve-gap': '保留扫描缺口',
  'method-reconstruct-before-interpret': '先做稳定版本',
  'method-selective-preservation': '选择性公开'
};

const outcomeByChoice = {
  'bs-go': ['合作已建立', '你先拿资料清单，不会盲带一堆设备。'],
  'bs-go-with-question': ['数据边界提前确认', '公开范围不再等到最后一天才问。'],
  'bs-preflight-camera': ['设备方案确定', '相机是主采集工具。'],
  'bs-preflight-depth': ['设备方案确定', '照片负责重点对象，深度设备负责快速取空间尺度。'],
  'bs-arrival-protocol': ['现场规则已记录', '先知道哪里能走、什么不能碰。'],
  'bs-arrival-work': ['Inés 记住了你的方法', '你用旧作品解释了这次不是自然纪录片。'],
  'bs-capture-plant': ['采集对象锁定', '蝴蝶做观察，寄主植物做主要 3D 对象。'],
  'bs-capture-path': ['采集对象锁定', '蝴蝶做观察点，路径和环境进入空间采集。'],
  'bs-capture-absence': ['缺席也被记录', '没有看到蝴蝶不是空白数据。'],
  'bs-source-note': ['来源说明已加入项目', '继续使用蝴蝶题材，但记录具体参考。'],
  'bs-avoid-symbol': ['视觉策略改变', '不把蝴蝶轮廓本身当主视觉。'],
  'bs-explicit-remix': ['引用关系已明确', '如果真的借了具体作品结构，就直接写出来。'],
  'bs-audit-recapture': ['技术债减少', '你在离场前补了覆盖缺口。'],
  'bs-audit-leave': ['技术债 +1', '你带着已知的覆盖缺口回工作室。'],
  'bs-align-diagnose': ['相机求解先被检查', '后面的点云 / Gaussian 有了可信基础。'],
  'bs-align-force-dense': ['坏重建已记录', '更多点没有修复错误的相机位置。'],
  'bs-align-switch-gaussian': ['表示方式没有救场', 'Gaussian 同样继承了错误的相机关系。'],
  'bs-represent-pointcloud': ['制作路线：点云 → Blender', '解锁程序化动画节点。'],
  'bs-represent-gaussian': ['制作路线：Gaussian → 网页', '解锁 Splat 清理与网页预览。'],
  'bs-blender-wind': ['动画规则：风', 'Noise 不再只是随机抖动。'],
  'bs-blender-memory': ['动画规则：时间', '越旧的记录越不稳定。'],
  'bs-browser-supersplat': ['网页预览已清理', '只裁剪、删浮点、定视角。'],
  'bs-browser-local': ['保持本地', '网页只用于预览，没有上传完整场景。'],
  'bs-preserve-gaps': ['缺口被保留', '先承认它是失败，再让它成为作品材料。'],
  'bs-repair-gaps': ['稳定版本优先', '不是每个错误都必须变成艺术。'],
  'bs-reveal-accept': ['公开边界确定', '作品可发布，原始研究资料不打包外传。'],
  'bs-reveal-talk': ['公开边界 + 关系更新', '署名、资料和私人记录都逐条确认。'],
  'bs-public-derived': ['公开版本完成', '只发布作品与必要来源说明。'],
  'bs-public-sample': ['公开版本完成', '额外开放一份低精度示例数据。'],
  'bs-after-archive': ['项目已归档', 'Blueprint、失败版本、来源说明和人物记录已保存。'],
  'bs-after-post': ['公开创作记录已保存', '你把“学会什么、哪里失败”也写进档案。']
};

function v05Href(query = '') {
  const params = new URLSearchParams(window.location.search);
  const rootPreview = params.get('core') === 'v05' && !window.location.pathname.includes('/v05/');
  if (!query) return rootPreview ? './?core=v05' : './';
  return rootPreview ? `./?core=v05&${query}` : `./?${query}`;
}
function readJson(key, fallback) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } }
function initialNarrative() { return readJson(STATE_KEY, createNarrativeState(butterflyScholarNarrativePack)); }
function mergeWorld(current, effect = {}) {
  const base = normalizeWorld(current);
  const next = { ...base };
  for (const key of Object.keys(emptyWorld())) next[key] = unique([...(base[key] || []), ...(effect[key] || [])]);
  return next;
}
function added(next, previous, key) { return (next[key] || []).filter((item) => !(previous[key] || []).includes(item)); }

function TrainingInstrument({ nodeId, state }) {
  if (nodeId === 'bs-03b-audit') return <div className="bs-instrument audit"><header><small>FIELD CHECK</small><strong>80 PHOTOS</strong></header><div className="bs-readout"><span><b>叶背</b><i>漏拍</i></span><span><b>模糊</b><i>OK</i></span><span><b>曝光</b><i>变化</i></span><span><b>转角</b><i>单一视角</i></span></div><p>现在补拍最便宜。回到工作室以后再发现，只能接受缺口或重新来一趟。</p></div>;
  if (nodeId === 'bs-04-process') return <div className="bs-instrument solve"><header><small>CAMERA SOLVE</small><strong>61 / 80 注册成功</strong></header><div className="bs-track"><i/><i/><i className="broken"/><i/><i/></div><p>这条线表示相机位置。中间断开，说明两组照片没有被可靠地连成同一个空间。</p></div>;
  if (nodeId === 'bs-04a-represent') return <div className="bs-instrument representation"><div><small>POINT CLOUD</small><strong>一堆空间采样点</strong><p>适合继续进 Blender / TD / UE 做程序化处理。</p></div><div><small>GAUSSIAN</small><strong>连续的空间外观</strong><p>适合快速自由视角预览和网页展示。</p></div></div>;
  if (nodeId === 'bs-04e-blender') return <div className="bs-instrument browser"><header><small>BLENDER</small><strong>POINTS → NOISE → MOTION</strong></header><p>Noise 只是工具。真正的选择是：这个运动到底对应风、时间、观察次数，还是别的规则。</p></div>;
  if (nodeId === 'bs-04c-browser') return <div className="bs-instrument browser"><header><small>WEB PREVIEW</small><strong>CROP · FLOATERS · CAMERA</strong></header><p>浏览器先处理最直接的事：裁剪、删浮点、检查视角。复杂动画不必硬塞在这里。</p></div>;
  if (nodeId === 'bs-03c-reference') return <div className="bs-instrument representation"><div><small>题材</small><strong>蝴蝶</strong><p>谁都可以继续研究。</p></div><div><small>具体表达</small><strong>形式 / 方法 / 结构</strong><p>真正需要比较和注明来源的是这一层。</p></div></div>;
  if (nodeId === 'bs-04b-reveal') return <div className="bs-instrument identity"><small>PUBLICATION CHECK</small><strong>作品版本可公开 · 原始定位/研究表不直接上传 · 合作者需要署名</strong></div>;
  if (nodeId === 'bs-06-after') return <div className="bs-instrument identity"><small>YOU LEARNED</small><strong>观察 → 采集 → 检查 → 相机求解 → 表示 / 动画 → 来源 → 公开</strong></div>;
  return null;
}

function KnowledgeDrawer({ open, onClose, knownFacts, learnedIds, activeEntry }) {
  if (!open && !activeEntry) return null;
  const learned = learnedIds.map((id) => butterflyKnowledgeById.get(id)).filter(Boolean);
  return <div className="bs-memory-layer" onClick={(event) => event.target === event.currentTarget && onClose()}><aside className="bs-memory" aria-label="已知信息">
    <header><div><small>WORKING MEMORY</small><strong>{activeEntry ? activeEntry.title : '本章已知信息'}</strong></div><button onClick={onClose}>×</button></header>
    {activeEntry ? <article className="bs-knowledge-detail"><p className="lead">{activeEntry.short}</p>{activeEntry.body.map((line) => <p key={line}>{line}</p>)}</article> : <>
      <section><small>FACTS</small>{knownFacts.length ? knownFacts.map((fact) => <p key={fact.id}>{fact.label}</p>) : <p>还没有需要长期记住的信息。</p>}</section>
      <section><small>LEARNED</small>{learned.length ? learned.map((entry) => <p key={entry.id}><b>{entry.title}</b><span>{entry.short}</span></p>) : <p>遇到不懂的概念时，可以先点“研究一下”。</p>}</section>
    </>}
  </aside></div>;
}

export default function V05ButterflyScholarRoute() {
  const [state, setState] = useState(initialNarrative);
  const [world, setWorld] = useState(() => normalizeWorld(readJson(WORLD_KEY, emptyWorld())));
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [activeKnowledge, setActiveKnowledge] = useState(null);
  const node = narrativeNodeById(butterflyScholarNarrativePack, state.currentNodeId);
  const scene = butterflyScholarNarrativePack.scenes.find((item) => item.id === node?.sceneId);
  const speaker = butterflyScholarNarrativePack.actors.find((item) => item.id === node?.speakerId);
  const knownFacts = useMemo(() => narrativeKnownFacts(state), [state]);
  const blueprintHref = v05Href('lab=blueprint&preset=butterfly');
  const chaptersHref = v05Href('mode=career');
  const studyEntries = node ? knowledgeForNarrativeNode(node.id) : [];

  function persist(nextState, nextWorld) {
    localStorage.setItem(STATE_KEY, JSON.stringify(nextState));
    localStorage.setItem(WORLD_KEY, JSON.stringify(nextWorld));
    setState(nextState); setWorld(nextWorld);
  }

  function notifyWorldChanges(previous, next) {
    const nodes = added(next, previous, 'unlockNodeIds');
    const methods = added(next, previous, 'methodIds');
    const knowledge = added(next, previous, 'knowledgeIds');
    const evidence = added(next, previous, 'evidenceIds');
    if (knowledge.length) emitGlobalFeedback({ kind: 'knowledge', title: butterflyKnowledgeById.get(knowledge[0])?.title || '新知识', detail: knowledge.length > 1 ? `同时记录 ${knowledge.length - 1} 条相关知识。` : '已加入本章临时记忆。' });
    if (nodes.length) emitGlobalFeedback({ kind: 'node', title: nodes.length === 1 ? (nodeLabels.get(nodes[0]) || nodes[0]) : `解锁 ${nodes.length} 个节点`, detail: nodes.map((id) => nodeLabels.get(id) || id).join(' · ') });
    if (methods.length) emitGlobalFeedback({ kind: 'method', title: methodNames[methods[0]] || methods[0], detail: methods.length > 1 ? `同时获得 ${methods.length - 1} 个相关方法。` : '方法已进入记录。' });
    if (evidence.length && !nodes.length && !methods.length && !knowledge.length) emitGlobalFeedback({ kind: 'evidence', title: '记录已保存', detail: `${evidence.length} 条 Evidence 写入当前章节。` });
  }

  function choose(choice) {
    const nextState = applyNarrativeChoice(butterflyScholarNarrativePack, state, choice.id);
    if (nextState === state) return;
    const nextWorld = mergeWorld(world, butterflyWorldEffectsByChoice[choice.id]);
    notifyWorldChanges(world, nextWorld);
    const outcome = outcomeByChoice[choice.id];
    if (outcome) emitGlobalFeedback({ kind: 'decision', title: outcome[0], detail: outcome[1] });
    if (choice.id === 'bs-reveal-talk') emitGlobalFeedback({ kind: 'relationship', title: 'Inés / 关系继续', detail: '这次对话进入人物记忆；以后重新游玩可以走不同关系状态。' });
    if (choice.id === 'bs-after-archive' || choice.id === 'bs-after-post') emitGlobalFeedback({ kind: 'achievement', code: 'SPECIAL CHAPTER COMPLETE', title: '哥斯达黎加的蝴蝶学者', detail: '完成一次从真实观察到数字作品、再到来源与公开边界的完整练习。' });
    persist(nextState, nextWorld);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function study(entry) {
    const base = normalizeWorld(world);
    const nextWorld = mergeWorld(base, { knowledgeIds: [entry.id], unlockNodeIds: entry.unlockNodeIds || [], methodIds: entry.methodIds || [] });
    notifyWorldChanges(base, nextWorld);
    localStorage.setItem(WORLD_KEY, JSON.stringify(nextWorld));
    setWorld(nextWorld);
    setActiveKnowledge(entry);
  }

  function reset() {
    const nextState = createNarrativeState(butterflyScholarNarrativePack); const nextWorld = emptyWorld();
    localStorage.setItem(STATE_KEY, JSON.stringify(nextState)); localStorage.setItem(WORLD_KEY, JSON.stringify(nextWorld));
    setState(nextState); setWorld(nextWorld); setMemoryOpen(false); setActiveKnowledge(null);
  }

  if (!node) return <main className="bs-shell"><section className="bs-error"><h1>路线状态损坏</h1><button onClick={reset}>重置路线</button></section></main>;

  if (!node.choices.length) return <main className="bs-shell"><header className="bs-topbar"><div><small>SPECIAL 01</small><strong>哥斯达黎加的蝴蝶学者</strong></div><nav><button onClick={() => setMemoryOpen(true)}>已知信息 {knownFacts.length + world.knowledgeIds.length}</button><a href={chaptersHref}>章节选择</a></nav></header><section className="bs-ending"><div className="bs-stamp">SPECIAL 01<br/>COMPLETE</div><small>CHAPTER COMPLETE</small><h1>这个项目终于做完了。</h1><p>你已经把一次真实蝴蝶观察、植物与空间采集、相机求解、点云 / Gaussian / Blender 路线、来源说明和公开边界，变成了一套以后还能继续用的方法。</p><div><a className="primary" href={blueprintHref}>去做 3 步训练工作图</a><a href={chaptersHref}>返回章节选择</a><button onClick={reset}>重新游玩</button></div></section><KnowledgeDrawer open={memoryOpen} onClose={() => { setMemoryOpen(false); setActiveKnowledge(null); }} knownFacts={knownFacts} learnedIds={world.knowledgeIds} activeEntry={activeKnowledge}/></main>;

  const minorActions = [
    ...studyEntries.map((entry) => ({ id: `study-${entry.id}`, label: world.knowledgeIds.includes(entry.id) ? `已学习：${entry.title}` : `研究：${entry.title}`, onClick: () => study(entry) })),
    ...(['bs-03b-audit', 'bs-04-process', 'bs-04a-represent'].includes(node.id) ? [{ id: 'open-training', label: '打开 3 步训练工作图', onClick: () => { window.location.href = blueprintHref; } }] : []),
    { id: 'open-memory', label: `已知信息 ${knownFacts.length + world.knowledgeIds.length}`, onClick: () => setMemoryOpen(true) }
  ];

  return <main className="bs-shell">
    <header className="bs-topbar"><div><small>SPECIAL 01</small><strong>哥斯达黎加的蝴蝶学者</strong></div><nav><button onClick={() => setMemoryOpen(true)}>已知信息</button><a href={chaptersHref}>章节选择</a><button onClick={reset}>重置</button></nav></header>
    <section className="bs-play">
      <V05NarrativeStage contentKey={node.id} scene={scene} speaker={speaker} node={node} meta={metaByNode[node.id]} showLoad={fullLoadNodes.has(node.id)} instrument={<TrainingInstrument nodeId={node.id} state={state}/>} minorActions={minorActions} onChoose={choose}/>
      <footer className="bs-statusbar"><span><small>METHODS</small><b>{world.methodIds.length}</b></span><span><small>NODES</small><b>{world.unlockNodeIds.length}</b></span><span><small>KNOWLEDGE</small><b>{world.knowledgeIds.length}</b></span><span><small>RECORDS</small><b>{world.evidenceIds.length + world.archiveEntryIds.length}</b></span></footer>
    </section>
    <KnowledgeDrawer open={memoryOpen} onClose={() => { setMemoryOpen(false); setActiveKnowledge(null); }} knownFacts={knownFacts} learnedIds={world.knowledgeIds} activeEntry={activeKnowledge}/>
  </main>;
}
