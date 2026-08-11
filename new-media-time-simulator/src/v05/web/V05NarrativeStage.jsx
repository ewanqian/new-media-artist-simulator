import { useEffect, useMemo, useState } from 'react';
import './v05-narrative-stage.css';

const DEFAULT_META = { kicker: 'EPISODE', time: '', objective: '' };

export default function V05NarrativeStage({ sceneKey, scene, speaker, node, meta = DEFAULT_META, onChoose }) {
  const paragraphs = node?.text || [];
  const [phase, setPhase] = useState('loading');
  const [visibleCount, setVisibleCount] = useState(0);
  const [choicesVisible, setChoicesVisible] = useState(false);

  useEffect(() => {
    setPhase('loading');
    setVisibleCount(0);
    setChoicesVisible(false);
    const loadTimer = window.setTimeout(() => setPhase('dialogue'), 900);
    return () => window.clearTimeout(loadTimer);
  }, [sceneKey]);

  useEffect(() => {
    if (phase !== 'dialogue') return;
    if (visibleCount < paragraphs.length) {
      const timer = window.setTimeout(() => setVisibleCount((value) => value + 1), visibleCount === 0 ? 180 : 620);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setChoicesVisible(true), 360);
    return () => window.clearTimeout(timer);
  }, [phase, visibleCount, paragraphs.length]);

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
        <span>{locationLine}</span>
        {meta.objective && <b>{meta.objective}</b>}
      </div>

      <div className="narrative-dialogue">
        {speaker ? <header><strong>{speaker.name}</strong><span>{speaker.publicRole}</span></header> : <header><strong>SYSTEM</strong><span>RECORD</span></header>}
        <div className="narrative-lines">
          {paragraphs.slice(0, visibleCount).map((paragraph, index) => <p key={`${sceneKey}-${index}`}>{paragraph}</p>)}
          {!done && <span className="narrative-cursor" aria-hidden="true" />}
        </div>
      </div>

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
