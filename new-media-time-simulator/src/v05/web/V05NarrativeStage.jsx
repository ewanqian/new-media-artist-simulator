import { useEffect, useMemo, useState } from 'react';
import './v05-narrative-stage.css';

const DEFAULT_META = { kicker: 'EPISODE', time: '', objective: '', pacing: [], holdChoices: false };

export default function V05NarrativeStage(props) {
  return <NarrativeStageInner key={props.contentKey} {...props} />;
}

function NarrativeStageInner({
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
    if (phase !== 'dialogue' || visibleCount >= paragraphs.length) return;
    const pacing = Array.isArray(meta.pacing) ? meta.pacing : [];
    const pace = pacing[visibleCount];
    if (pace === 'hold') return;
    const fallback = visibleCount === 0 ? 220 : 680;
    const delay = Number(pace ?? fallback);
    const timer = window.setTimeout(() => setVisibleCount((value) => Math.min(value + 1, paragraphs.length)), Math.max(100, delay));
    return () => window.clearTimeout(timer);
  }, [phase, visibleCount, paragraphs.length, meta.pacing]);

  const done = visibleCount >= paragraphs.length;
  const locationLine = useMemo(() => [meta.time, scene?.location].filter(Boolean).join(' · '), [meta.time, scene?.location]);

  function revealNext() {
    if (phase === 'loading') {
      setPhase('dialogue');
      return;
    }
    if (!done) setVisibleCount((value) => Math.min(value + 1, paragraphs.length));
  }

  if (phase === 'loading') {
    return (
      <section className="narrative-load" role="dialog" aria-label={`${scene?.title || '场景'}开始`}>
        <div className="narrative-load-inner">
          <small>{meta.kicker || 'EPISODE'}</small>
          <span>{locationLine}</span>
          <h1>{scene?.title || meta.objective || '进入场景'}</h1>
          {meta.objective && <p>{meta.objective}</p>}
          <button onClick={() => setPhase('dialogue')}>进入场景</button>
        </div>
      </section>
    );
  }

  return (
    <section className="narrative-stage">
      <div className="narrative-stage-meta">
        <small>{meta.kicker || 'EPISODE'}</small>
        <span>{locationLine}</span>
        {meta.objective && <b>{meta.objective}</b>}
      </div>

      <div className="narrative-dialogue" onClick={revealNext}>
        {speaker ? <header><strong>{speaker.name}</strong><span>{speaker.publicRole}</span></header> : <header><strong>SYSTEM</strong><span>RECORD</span></header>}
        <div className="narrative-lines">
          {paragraphs.slice(0, visibleCount).map((paragraph, index) => <p key={`${contentKey}-${index}`}>{paragraph}</p>)}
          {!done && <button className="narrative-next-line" onClick={(event) => { event.stopPropagation(); revealNext(); }}>继续</button>}
        </div>
      </div>

      {done && instrument && <div className="narrative-instrument" onClick={(event) => event.stopPropagation()}>{instrument}</div>}

      {done && minorActions.length > 0 && <div className="narrative-minor-actions" onClick={(event) => event.stopPropagation()}>
        <small>研究 / 小操作</small>
        <div>{minorActions.map((action) => <button key={action.id} onClick={action.onClick}>{action.label}</button>)}</div>
      </div>}

      {choicesVisible && node.choices.length > 0 && <div className="narrative-decisions" onClick={(event) => event.stopPropagation()}>
        <small className="narrative-decision-label">决定</small>
        {node.choices.map((choice, index) => (
          <button key={choice.id} onClick={() => onChoose(choice)}>
            <small>{String(index + 1).padStart(2, '0')}</small>
            <span><strong>{choice.label}</strong>{choice.subtext && <em>{choice.subtext}</em>}</span>
          </button>
        ))}
      </div>}

      {done && !choicesVisible && node.choices.length > 0 && <button className="narrative-continue" onClick={() => setChoicesVisible(true)}>做决定</button>}
    </section>
  );
}
