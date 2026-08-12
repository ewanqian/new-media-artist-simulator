import { useEffect, useMemo, useState } from 'react';
import { CAREER_PROFILE_KEY, CAREER_SAVE_KEY } from '../careerContent.ts';
import {
  EP00_ARCHIVE_KEY,
  EP00_BLUEPRINT_COMPLETE_KEY,
  EP00_STATE_KEY,
  buildEp00Archive,
  buildEp00CareerProfile,
  buildEp00CareerSave,
  createEp00State,
  ep00CaptureById,
  ep00CaptureOptions,
  ep00IdentityOptions,
  ep00WorkbenchObjects
} from '../ep00Onboarding.ts';
import { emitGlobalFeedback } from './V05GlobalFeedback.jsx';
import './v05-ep00.css';

function readState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(EP00_STATE_KEY) || 'null');
    return parsed?.schema === 'nmas-ep00-v1' ? parsed : createEp00State();
  } catch {
    return createEp00State();
  }
}

function href(query = '') {
  const params = new URLSearchParams(window.location.search);
  const rootPreview = params.get('core') === 'v05' && !window.location.pathname.includes('/v05/');
  if (!query) return rootPreview ? './?core=v05' : './';
  return rootPreview ? `./?core=v05&${query}` : `./?${query}`;
}

export default function V05Ep00Route() {
  const [state, setState] = useState(readState);
  const capture = useMemo(() => state.capture ? ep00CaptureById(state.capture) : null, [state.capture]);
  const archive = useMemo(() => state.capture ? buildEp00Archive(state) : null, [state]);

  useEffect(() => {
    localStorage.setItem(EP00_STATE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (state.phase === 'blueprint' && localStorage.getItem(EP00_BLUEPRINT_COMPLETE_KEY) === '1') {
      setState((current) => ({ ...current, phase: 'archive' }));
    }
  }, [state.phase]);

  useEffect(() => {
    if (state.phase === 'archive' && archive) localStorage.setItem(EP00_ARCHIVE_KEY, JSON.stringify(archive));
  }, [state.phase, archive]);

  function reset() {
    localStorage.removeItem(EP00_STATE_KEY);
    localStorage.removeItem(EP00_BLUEPRINT_COMPLETE_KEY);
    localStorage.removeItem(EP00_ARCHIVE_KEY);
    setState(createEp00State());
  }

  function chooseIdentity(id) {
    setState((current) => ({ ...current, identity: id, phase: 'workbench' }));
  }

  function inspectObject(id) {
    setState((current) => ({ ...current, inspectedWorkbenchIds: [...new Set([...current.inspectedWorkbenchIds, id])] }));
  }

  function chooseCapture(id) {
    const next = ep00CaptureById(id);
    setState((current) => ({ ...current, capture: id, phase: 'asset' }));
    emitGlobalFeedback({ kind: 'evidence', code: next.code, title: '第一个 Asset 已生成', detail: next.asset });
  }

  function openBlueprint() {
    if (!capture) return;
    setState((current) => ({ ...current, phase: 'blueprint' }));
    window.location.href = href(`lab=blueprint&preset=ep00&capture=${capture.id}`);
  }

  function enterCareer() {
    const profile = buildEp00CareerProfile(state);
    const save = buildEp00CareerSave(profile, state);
    localStorage.setItem(CAREER_PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem(CAREER_SAVE_KEY, JSON.stringify(save));
    emitGlobalFeedback({ kind: 'stage', code: 'EP00 COMPLETE', title: '工作台建立', detail: '你已经有第一份 Asset、方法、知识和创作记录。接下来这些东西会在生涯里继续被使用。' });
    window.setTimeout(() => { window.location.href = href('mode=story'); }, 220);
  }

  const inspectedAll = state.inspectedWorkbenchIds.length >= ep00WorkbenchObjects.length;

  return <main className="ep00-shell">
    <section className="ep00-card">
      <header className="ep00-top"><div><small>EP00 / ONBOARDING</small><h1>建立你的工作台</h1></div><nav><a href={href('mode=career')}>章节</a><button onClick={reset}>重置 EP00</button></nav></header>

      {state.phase === 'intro' && <section className="ep00-scene">
        <small>00 / 你先注意什么</small>
        <h2>你还不需要决定自己是哪一种艺术家。</h2>
        <p>先选一个你最自然会注意的东西。它只是这次新手关的观察入口，不会把你锁成职业。</p>
        <div className="ep00-options three">{ep00IdentityOptions.map((item) => <button key={item.id} onClick={() => chooseIdentity(item.id)}><strong>{item.title}</strong><span>{item.note}</span></button>)}</div>
      </section>}

      {state.phase === 'workbench' && <section className="ep00-scene">
        <small>01 / 工作台</small>
        <h2>桌上只有三样真正重要的东西。</h2>
        <p>点开看一遍。以后学会的软件、采到的数据和做过的失败都不会只变成“经验值”，它们会回到这些地方。</p>
        <div className="ep00-workbench">{ep00WorkbenchObjects.map((item) => {
          const seen = state.inspectedWorkbenchIds.includes(item.id);
          return <button className={seen ? 'seen' : ''} key={item.id} onClick={() => inspectObject(item.id)}><small>{item.label}</small><strong>{item.title}</strong><span>{item.text}</span><em>{seen ? '✓ 已看过' : '查看'}</em></button>;
        })}</div>
        <footer><button className="primary" disabled={!inspectedAll} onClick={() => setState((current) => ({ ...current, phase: 'capture' }))}>{inspectedAll ? '出去记录一次 →' : `还剩 ${ep00WorkbenchObjects.length - state.inspectedWorkbenchIds.length} 个`}</button></footer>
      </section>}

      {state.phase === 'capture' && <section className="ep00-scene">
        <small>02 / 第一次记录</small>
        <h2>保存一个你今天经过的地方。</h2>
        <p>同一个地方可以被完全不同地记录。这里没有正确答案，差别只在于你最终得到什么 Asset，以及之后能怎样继续加工。</p>
        <div className="ep00-options three">{ep00CaptureOptions.map((item) => <button key={item.id} onClick={() => chooseCapture(item.id)}><small>{item.code}</small><strong>{item.title}</strong><span>{item.prompt}</span><em>{item.asset}</em></button>)}</div>
      </section>}

      {state.phase === 'asset' && capture && <section className="ep00-scene">
        <small>03 / ASSET CREATED</small>
        <h2>{capture.code}</h2>
        <div className="ep00-result-grid">
          <article><small>ASSET</small><strong>{capture.asset}</strong><p>这不是完成品。它只是你以后还能继续处理、复用和引用的一份材料。</p></article>
          <article><small>METHOD</small><strong>{capture.method}</strong><p>你第一次留下了一种可以重复使用的工作方法。</p></article>
          <article><small>KNOWLEDGE</small><strong>{capture.knowledge}</strong><p>知识不是百科条目。理解以后，它会决定哪些节点和行动对你可用。</p></article>
        </div>
        <aside className="ep00-memory"><small>MEMORY</small><p>{capture.memory}</p></aside>
        <footer><button className="primary" onClick={openBlueprint}>把它接成第一张工作图 →</button></footer>
      </section>}

      {state.phase === 'blueprint' && capture && <section className="ep00-scene">
        <small>04 / WORK GRAPH</small>
        <h2>你的第一次工作图还没接完。</h2>
        <p>这里只学一件事：素材进入一个处理过程，再变成别人真的能看到或听到的结果。完成两条线以后回来。</p>
        <footer><button className="primary" onClick={openBlueprint}>继续工作图 →</button></footer>
      </section>}

      {state.phase === 'archive' && capture && archive && <section className="ep00-scene ep00-complete">
        <small>05 / RECORD 001</small>
        <h2>第一次记录已经进入你的档案。</h2>
        <div className="ep00-record">
          <header><small>{archive.id}</small><strong>{archive.title}</strong></header>
          <dl><div><dt>Asset</dt><dd>{archive.asset.title}</dd></div><div><dt>Method</dt><dd>{archive.method.title}</dd></div><div><dt>Knowledge</dt><dd>{archive.knowledge.title}</dd></div><div><dt>Memory</dt><dd>{archive.memory}</dd></div></dl>
        </div>
        <p>接下来不需要“升级到 2 级”。你会通过项目、驻地、Workshop 和特殊章节继续获得新的知识、节点、Assets 和记忆，然后在别的项目里重新调用它们。</p>
        <footer><button className="primary" onClick={enterCareer}>带着这些东西进入生涯 →</button><a href={href('mode=career')}>先回章节选择</a></footer>
      </section>}
    </section>
  </main>;
}
