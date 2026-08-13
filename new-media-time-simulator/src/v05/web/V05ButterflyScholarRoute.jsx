import { useMemo, useState } from 'react';
import { applyNarrativeChoice, createNarrativeState, narrativeNodeById } from '../narrativeEngine.ts';
import {
  butterflyScholarIdentity,
  butterflyScholarNarrativePack,
  butterflyWorldEffectsByChoice,
  deriveButterflyWorldEffect,
  resolveButterflyNodeText
} from '../butterflyScholarPack.ts';
import { deriveButterflyOutcome } from '../butterflyScholarOutcome.ts';
import { deriveCostaRicaAssets, deriveCostaRicaMementos } from '../costaRicaRouteState.ts';
import { buildCostaRicaCarryover, persistSpecialCarryover } from '../specialCarryover.ts';
import { applyAction, createRunState, loadRunState, saveRunState } from '../runState.ts';
import V05NarrativeStage from './V05NarrativeStage.jsx';
import './v05-butterfly-scholar.css';
import './v05-costarica-focused.css';

const STATE_KEY = 'nmas-special-costarica-narrative-v1';
const WORLD_KEY = 'nmas-special-costarica-world-v1';
const LEGACY_STATE_KEY = 'nmas-special-butterfly-narrative-v2';
const LEGACY_WORLD_KEY = 'nmas-special-butterfly-world-v2';
export const COSTA_RICA_RUN_SAVE_KEY = 'nmas-v05.1-run:costa-rica';

const emptyWorld = () => ({ unlockNodeIds: [], evidenceIds: [], methodIds: [], researchIds: [], threadIds: [], archiveEntryIds: [], achievementIds: [], qualitySignals: [], projectTags: [] });
const unique = (values) => [...new Set(values.filter(Boolean))];

const metaByNode = {
  'bs-01-invite': { kicker: '合作邀请', time: '出发前三天 · 晚上 10:10', objective: '明天中午前，决定去不去', pacing: ['short', 'beat', 'hold'], holdChoices: true },
  'bs-02-arrival': { kicker: '第一天', time: '下午 2:20', objective: '先弄清能拍什么、什么不能公开', pacing: ['short', 'beat', 'hold'], holdChoices: true },
  'bs-03-field': { kicker: '第二天', time: '上午 9:40', objective: '蝴蝶飞走了。决定今天留下什么', pacing: ['short', 'beat', 'hold'], holdChoices: true },
  'bs-03b-audit': { kicker: '准备离场', time: '下午 4:50', objective: '十分钟补拍，还是把缺口带回去', pacing: ['short', 'hold'], holdChoices: true },
  'bs-04-process': { kicker: '回到研究站', time: '晚上 10:35', objective: '照片对不上。先查，还是先看坏版本', pacing: ['short', 'hold'], holdChoices: true },
  'bs-04x-failure': { kicker: '坏版本出来了', time: '晚上 11:20', objective: '它能修，也能留下', pacing: ['short', 'hold'], holdChoices: true },
  'bs-04a-represent': { kicker: '第一版', time: '凌晨 12:10', objective: '让观众先看见断裂，还是先进入空间', pacing: ['short', 'hold'], holdChoices: true },
  'bs-04e-compose': { kicker: '开始做作品', time: '凌晨 1:20', objective: '决定画面为什么会动', pacing: ['short', 'hold'], holdChoices: true },
  'bs-04d-feedback': { kicker: '第一版能动了', time: '凌晨 1:46', objective: '给谁看，或者先不发', pacing: ['short', 'hold'], holdChoices: true },
  'bs-04f-authorship': { kicker: '收到反应', time: '凌晨 1:55', objective: '改、说明，或者把问题留到现场', pacing: ['short', 'beat', 'hold'], holdChoices: true },
  'bs-04b-reveal': { kicker: '公开前', time: '第三天 · 凌晨 2:30', objective: '帮你的人，也在给你打分', pacing: ['short', 'beat', 'hold'], holdChoices: true },
  'bs-05-public': { kicker: '第一次开放', time: '第六天 · 晚上 7:00', objective: '让作品自己活十分钟', pacing: ['short', 'beat', 'hold'], holdChoices: true }
};

function v05Href(query = '') {
  const params = new URLSearchParams(window.location.search);
  const atRoot = params.get('core') === 'v05' && !window.location.pathname.includes('/v05/');
  return atRoot ? `./?core=v05&${query}` : `./?${query}`;
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

function PlainInstrument({ nodeId, flags = [] }) {
  const has = new Set(flags);
  if (nodeId === 'bs-03b-audit') return <div className="bs-instrument audit"><header><small>离场前翻照片</small><strong>80 张</strong></header><div className="bs-readout"><span><b>叶片背面</b><i>没拍到</i></span><span><b>小径转角</b><i>只有一面</i></span><span><b>最后十几张</b><i>太暗</i></span><span><b>现在补拍</b><i>10 分钟</i></span></div></div>;
  if (nodeId === 'bs-04-process') {
    const fixed = has.has('field-recapture');
    return <div className="bs-instrument solve"><header><small>软件认出的照片</small><strong>{fixed ? '76 / 80' : '61 / 80'}</strong></header><div className={`bs-track ${fixed ? 'healthy' : ''}`}><i/><i/><i className={fixed ? '' : 'broken'}/><i/><i/></div><p>{fixed ? '白天补拍的转角接上了。' : '没补的那一段，现在真的断了。'}</p></div>;
  }
  if (nodeId === 'bs-04x-failure') return <div className="bs-instrument failure"><header><small>坏版本已保存</small><strong>叶片变成两层 · 转角断开 · 照片飘错位置</strong></header><p>它不漂亮。至少把白天漏拍的地方供出来了。</p></div>;
  return null;
}

function Ending({ state, world, onReset }) {
  const outcome = useMemo(() => deriveButterflyOutcome(state, world), [state, world]);
  const assets = deriveCostaRicaAssets(state, world).slice(-4);
  const mementos = deriveCostaRicaMementos(state, world).slice(-3);
  return <main className="bs-shell"><header className="bs-topbar"><div><strong>哥斯达黎加 · 一周驻地</strong></div><nav><a href={v05Href('mode=career')}>离开</a></nav></header><section className="bs-ending bs-ending-simple">
    <div className="bs-ending-head"><div><small>第六天 · 晚上</small><h1>{outcome.headline}</h1><p>第一次开放结束。投影关了，问题没有全部关掉。</p></div></div>
    <section className="bs-public-result"><header><small>现场的人怎么说</small></header><div className="bs-public-notes">{outcome.publicNotes.slice(0, 3).map((note) => <article key={note.speaker}><small>{note.speaker}</small><p>{note.text}</p></article>)}</div></section>
    <section className="bs-take-home"><small>你带回去的东西</small><div>{assets.map((asset) => <article key={asset.id}><strong>{asset.title.split(' / ')[1] || asset.title}</strong><p>{asset.detail}</p></article>)}</div></section>
    {mementos.length > 0 && <section className="bs-mementos"><small>口袋里的东西</small><p>{mementos.map((item) => item.title).join(' · ')}</p></section>}
    {outcome.unresolved.length > 0 && <section className="bs-open-threads"><small>还欠着</small>{outcome.unresolved.slice(0, 3).map((item) => <p key={item}>→ {item}</p>)}</section>}
    <div className="bs-ending-actions"><a className="primary" href={v05Href('mode=career')}>离开研究站</a><button onClick={onReset}>重新来一周</button></div>
  </section></main>;
}

export default function V05ButterflyScholarRoute() {
  const [state, setState] = useState(initialNarrative);
  const [world, setWorld] = useState(initialWorld);
  const node = narrativeNodeById(butterflyScholarNarrativePack, state.currentNodeId);
  const scene = butterflyScholarNarrativePack.scenes.find((item) => item.id === node?.sceneId);
  const speaker = butterflyScholarNarrativePack.actors.find((item) => item.id === node?.speakerId);
  const visibleSpeaker = speaker?.id === 'player-butterfly-scholar' ? { ...speaker, publicRole: '' } : speaker;
  const stageNode = useMemo(() => node ? { ...node, text: resolveButterflyNodeText(node.id, state.flags, node.text) } : node, [node, state.flags]);

  function recordRun(choice) {
    if (!node) return;
    const fallback = createRunState({ runId: 'costa-rica', identity: { id: 'artist', label: '你' }, chapterId: 'costa-rica', currentNodeId: node.id, objective: '一周内做出一个能让人进入的现场版本' });
    const prior = loadRunState(localStorage.getItem(COSTA_RICA_RUN_SAVE_KEY), fallback);
    const complete = choice.id === 'bs-archive-open';
    const hasWork = prior.works.some((work) => work.id === 'work-costa-rica');
    const delta = {
      addFlags: [choice.id],
      addEventIds: [node.id],
      ...(!hasWork ? { addWork: { id: 'work-costa-rica', workingTitle: '还没取名的现场作品', projectId: 'project-costa-rica', status: 'in-progress', originEventId: 'bs-01-invite', decisionIds: [], versions: [] } } : {}),
      updateWork: {
        workId: 'work-costa-rica',
        decisionId: choice.id,
        ...(complete ? { status: 'public', addVersion: { id: 'version-costa-public', label: '研究站第一次公开版本', state: 'shared', createdByActionId: choice.id } } : {})
      }
    };
    const actionNode = { id: node.id, type: 'decision', text: node.text.join(' '), actions: [{ id: choice.id, label: choice.label, nextNodeId: choice.nextNodeId, result: { summary: choice.label, delta } }] };
    saveRunState(localStorage, applyAction(prior, actionNode, choice.id), COSTA_RICA_RUN_SAVE_KEY);
  }

  function choose(choice) {
    const nextState = applyNarrativeChoice(butterflyScholarNarrativePack, state, choice.id);
    if (nextState === state) return;
    const nextWorld = mergeWorld(mergeWorld(world, butterflyWorldEffectsByChoice[choice.id] || {}), deriveButterflyWorldEffect(state.flags, choice.id));
    recordRun(choice);
    localStorage.setItem(STATE_KEY, JSON.stringify(nextState));
    localStorage.setItem(WORLD_KEY, JSON.stringify(nextWorld));
    if ((nextState.flags || []).includes('butterfly-route-complete')) persistSpecialCarryover(buildCostaRicaCarryover(nextState, nextWorld));
    setWorld(nextWorld);
    setState(nextState);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function reset() {
    const nextState = createNarrativeState(butterflyScholarNarrativePack);
    const nextWorld = emptyWorld();
    for (const key of [STATE_KEY, WORLD_KEY, LEGACY_STATE_KEY, LEGACY_WORLD_KEY, COSTA_RICA_RUN_SAVE_KEY]) localStorage.removeItem(key);
    localStorage.setItem(STATE_KEY, JSON.stringify(nextState));
    localStorage.setItem(WORLD_KEY, JSON.stringify(nextWorld));
    setState(nextState);
    setWorld(nextWorld);
  }

  if (!node || !stageNode) return <main className="bs-shell"><section className="bs-error"><h1>这一周的记录坏了。</h1><button onClick={reset}>重新开始</button></section></main>;
  if (!node.choices.length) return <Ending state={state} world={world} onReset={reset}/>;

  return <main className="bs-shell"><header className="bs-topbar"><div><strong>哥斯达黎加 · 一周驻地</strong></div><nav><a href={v05Href('mode=career')}>离开</a><button onClick={reset}>重来</button></nav></header><section className="bs-play bs-play-focused"><div className="bs-main"><V05NarrativeStage
    contentKey={node.id}
    scene={scene}
    speaker={visibleSpeaker}
    node={stageNode}
    meta={metaByNode[node.id]}
    instrument={<PlainInstrument nodeId={node.id} flags={state.flags}/>}
    showOutcomeHints={false}
    onChoose={choose}
  /></div></section></main>;
}
