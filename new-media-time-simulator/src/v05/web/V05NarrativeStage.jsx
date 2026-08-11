import { useEffect, useMemo, useState } from 'react';
import './v05-narrative-stage.css';

const DEFAULT_META = { kicker: 'EPISODE', time: '', objective: '', pacing: [] };

export default function V05NarrativeStage({
  contentKey,
  scene,
  speaker,
  node,
  meta = DEFAULT_META,
  onChoose,
  showLoad = false,
  instrument = null,
  minorActions = []
}) {
  const paragraphs = node?.text || [];
  const [phase, setPhase] = useState(showLoad ? 'loading' : 'dialogue');
  const [visibleCount, setVisibleCount] = useState(0);
  const [choicesVisible, setChoicesVisible] = useState(false);

  useEffect(() => {
    setPhase(showLoad ? 'loading' : 'dialogue');
    setVisibleCount(0);
    setChoicesVisible(false);
    if (!showLoad) return;
    const loadTimer = window.setTimeout(() => setPhase('dialogue'), 1250);
    return () => window.clearTimeout(loadTimer);
  }, [contentKey, showLoad]);

  useEffect(() => {
    if (phase !== 'dialogue') return;
    if (visibleCount < paragraphs.length) {
      const pacing = Array.isArray(meta.pacing) ? meta.pacing : [];
      const fallback = visibleCount === 0 ? 180 : 540;
      const delay = Number(pacing[visibleCount] ?? fallback);
      const timer = window.setTimeout(() => setVisibleCount((value) => value + 1), Math.max(80, delay));
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setChoicesVisible(true), instrument || minorActions.length ? 520 : 260);
    return () => window.clearTimeout(timer);
  }, [phase, visibleCount, paragraphs.length, instrument, minorActions.length, meta.pacing]);

  const done = visibleCount >= paragraphs.length;
  const locationLine = useMemo(() => [meta.time, scene?.location].filter(Boolean).join(' · '), [meta.time, scene?.location]);

  function revealNow() {
    if (phase === 'loading') return setPhase('dialogue');
    if (!done) return setVisibleCount(paragraphs.length);
    setChoicesVisible(true);
  }

  if (phase === 'loading') {
    return (
      <section className="narrative-load" role="presentation" onClick={() => setPhase('dialogue')}>
        <div className="narrative-load-inner">
          <small>{meta.kicker || 'EPISODE'}</small>
          <span>{locationLine}</span>
          <h1>{scene?.title || meta.objective || '进入场景'}</h1>
          {meta.objective && <p>{meta.objective}</p>}
          <i>点击继续</i>
        </div>
      </section>
    );
  }

  return (
    <section className="narrative-stage" onClick={revealNow}>
      <div className="narrative-stage-meta">
        <small>{meta.kicker || 'EPISODE'}</small>
        <span>{locationLine}</span>
        {meta.objective && <b>{meta.objective}</b>}
      </div>

      <div className="narrative-dialogue">
        {speaker ? <header><strong>{speaker.name}</strong><span>{speaker.publicRole}</span></header> : <header><strong>SYSTEM</strong><span>RECORD</span></header>}
        <div className="narrative-lines">
          {paragraphs.slice(0, visibleCount).map((paragraph, index) => <p key={`${contentKey}-${index}`}>{paragraph}</p>)}
          {!done && <span className="narrative-cursor" aria-hidden="true" />}
        </div>
      </div>

      {done && instrument && <div className="narrative-instrument" onClick={(event) => event.stopPropagation()}>{instrument}</div>}

      {done && minorActions.length > 0 && <div className="narrative-minor-actions" onClick={(event) => event.stopPropagation()}>
        <small>可以先做</small>
        <div>{minorActions.map((action) => <button key={action.id} onClick={action.onClick}>{action.label}</button>)}</div>
      </div>}

      {choicesVisible && node.choices.length > 0 && <div className="narrative-decisions" onClick={(event) => event.stopPropagation()}>
        {node.choices.map((choice, index) => (
          <button key={choice.id} onClick={() => onChoose(choice)}>
            <small>{String(index + 1).padStart(2, '0')}</small>
            <span><strong>{choice.label}</strong>{choice.subtext && <em>{choice.subtext}</em>}</span>
          </button>
        ))}
      </div>}

      {done && !choicesVisible && <button className="narrative-continue" onClick={(event) => { event.stopPropagation(); setChoicesVisible(true); }}>继续</button>}
    </section>
  );
}
