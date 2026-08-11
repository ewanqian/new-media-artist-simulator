import { useEffect, useMemo, useState } from 'react';
import './v05-narrative-stage.css';

const DEFAULT_META = { kicker: 'EPISODE', time: '', objective: '' };

export default function V05NarrativeStage({ contentKey, scene, speaker, node, meta = DEFAULT_META, onChoose, showLoad = false, instrument = null }) {
  const paragraphs = node?.text || [];
  const [phase, setPhase] = useState(showLoad ? 'loading' : 'dialogue');
  const [visibleCount, setVisibleCount] = useState(0);
  const [choicesVisible, setChoicesVisible] = useState(false);

  useEffect(() => {
    setPhase(showLoad ? 'loading' : 'dialogue');
    setVisibleCount(0);
    setChoicesVisible(false);
    if (!showLoad) return;
    const loadTimer = window.setTimeout(() => setPhase('dialogue'), 950);
    return () => window.clearTimeout(loadTimer);
  }, [contentKey, showLoad]);

  useEffect(() => {
    if (phase !== 'dialogue') return;
    if (visibleCount < paragraphs.length) {
      const timer = window.setTimeout(() => setVisibleCount((value) => value + 1), visibleCount === 0 ? 170 : 560);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setChoicesVisible(true), instrument ? 620 : 320);
    return () => window.clearTimeout(timer);
  }, [phase, visibleCount, paragraphs.length, instrument]);

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
          <h1>{scene?.title || '载入中'}</h1>
          {meta.objective && <p>{meta.objective}</p>}
          <i>点击跳过</i>
        </div>
      </section>
    );
  }

  return (
    <section className="narrative-stage" onClick={revealNow}>
      <div className="narrative-stage-meta">
        <small>{meta.kicker || 'EPISODE'}</small>
        <span>{scene?.title || 'SCENE'}</span>
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
