import { useEffect, useMemo, useState } from 'react';
import { advanceTransition, applyAction, loadRunState, saveRunState, V051_RUN_SAVE_KEY } from '../runState.ts';
import { firstWeekScene, freshFirstWeekRun, sceneAsNarrativeNode } from '../firstWeekContent.ts';
import './v051-vertical-slice.css';

function makeFreshRun() {
  return freshFirstWeekRun(globalThis.crypto?.randomUUID?.() || `run-${Date.now()}`);
}

function WorkPreview({ state }) {
  const smallScreenState = {
    broken: '窗口缩小：黑',
    fragile: '小屏幕：黑',
    touch: '小屏幕：能用',
    desktop: '小屏幕：不支持',
    guided: '操作：有提示',
    video: '交付：只有录屏',
    'venue-wide': '现场：挤在左边',
    'venue-test': '现场：等人操作',
    'venue-idle': '现场：自己会动',
    minimal: '小屏幕：待试',
    responsive: '小屏幕：待试'
  }[state];

  return <section className="v051-preview" data-preview={state} aria-label="作品预览">
    <header><span>localhost:4173/untitled</span><i/><i/><i/></header>
    <div className="v051-preview-stage">
      <div className="v051-shape"><b/><b/><b/></div>
      {state === 'broken' && <p>37 errors</p>}
      {state === 'desktop' && <p>请用电脑打开</p>}
      {state === 'guided' && <p>拖动这些圆</p>}
      {state === 'video' && <p>00:10 / 00:10</p>}
      {state === 'venue-wide' && <p>现场照片：画面挤在左边</p>}
      {state === 'venue-test' && <p>动一下</p>}
      {state === 'touch' && <button type="button" aria-label="预览里的互动按钮">点一下</button>}
    </div>
    <footer><span>{state === 'broken' ? '画面：无' : '画面：有'}</span><span>{smallScreenState}</span></footer>
  </section>;
}

export default function V051VerticalSlice() {
  const [run, setRun] = useState(() => loadRunState(localStorage.getItem(V051_RUN_SAVE_KEY), makeFreshRun()));
  const scene = useMemo(() => firstWeekScene(run), [run]);

  useEffect(() => { saveRunState(localStorage, run); }, [run]);
  useEffect(() => { document.title = `${scene.title} · 新媒体艺术家模拟器`; }, [scene.title]);

  function choose(actionId) {
    setRun((current) => {
      const currentScene = firstWeekScene(current);
      return applyAction(current, sceneAsNarrativeNode(currentScene), actionId);
    });
  }

  function advance() {
    setRun((current) => advanceTransition(current, sceneAsNarrativeNode(firstWeekScene(current))));
  }

  function restart() {
    const next = makeFreshRun();
    saveRunState(localStorage, next);
    setRun(next);
  }

  return <main className="v051-shell">
    <header className="v051-topbar">
      <strong>新媒体艺术家模拟器</strong>
      <span>{scene.time}</span>
      <button onClick={restart}>重新开始</button>
    </header>

    <section className="v051-scene" aria-live="polite">
      <WorkPreview state={scene.preview}/>
      <article className="v051-copy">
        <h1>{scene.title}</h1>
        {scene.lines.map((line) => <p key={line}>{line}</p>)}

        {scene.choices.length > 0 && <div className="v051-actions" aria-label="现在能做的事">
          {scene.choices.map((choice) => <button key={choice.id} onClick={() => choose(choice.id)}>
            <strong>{choice.label}</strong>
            <span>{choice.note}</span>
          </button>)}
        </div>}

        {scene.advance && <button className="v051-continue" onClick={advance}>{scene.advance.label}</button>}

        {scene.moment === 'ending' && <>
          <section className="v051-night" aria-label="这两天发生的事">
            <h2>这两天</h2>
            <ol>{run.history.map((entry) => <li key={entry.id}>{entry.summary}</li>)}</ol>
          </section>
          <button className="v051-again" onClick={restart}>再熬一遍</button>
        </>}
      </article>
    </section>
  </main>;
}
