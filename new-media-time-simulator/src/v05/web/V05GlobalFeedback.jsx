import { useEffect, useRef, useState } from 'react';
import './v05-global-feedback.css';

export const GLOBAL_FEEDBACK_EVENT = 'nmas:global-feedback';

export function emitGlobalFeedback(detail) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(GLOBAL_FEEDBACK_EVENT, { detail }));
}

const durationByKind = {
  node: 2600,
  method: 2400,
  knowledge: 2800,
  decision: 2400,
  evidence: 2100,
  relationship: 2300,
  stage: 3000,
  achievement: 4200
};

const labelByKind = {
  node: 'NODE UNLOCKED',
  method: 'METHOD LEARNED',
  knowledge: 'KNOWLEDGE ADDED',
  decision: 'STATE CHANGED',
  evidence: 'RECORD ADDED',
  relationship: 'RELATIONSHIP UPDATED',
  stage: 'CHAPTER COMPLETE',
  achievement: 'TRIUMPH'
};

export default function V05GlobalFeedback() {
  const [active, setActive] = useState(null);
  const queue = useRef([]);
  const timer = useRef(null);

  useEffect(() => {
    const advance = () => {
      if (active || !queue.current.length) return;
      setActive(queue.current.shift());
    };
    advance();
  }, [active]);

  useEffect(() => {
    const onFeedback = (event) => {
      const detail = event.detail || {};
      if (!detail.title) return;
      queue.current.push({ id: `${Date.now()}-${Math.random()}`, kind: detail.kind || 'evidence', title: detail.title, detail: detail.detail || '', code: detail.code || '' });
      setActive((current) => current || queue.current.shift());
    };
    window.addEventListener(GLOBAL_FEEDBACK_EVENT, onFeedback);
    return () => window.removeEventListener(GLOBAL_FEEDBACK_EVENT, onFeedback);
  }, []);

  useEffect(() => {
    if (!active) return;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setActive(null), durationByKind[active.kind] || 2400);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [active]);

  if (!active) return null;
  const major = active.kind === 'achievement' || active.kind === 'stage';
  return (
    <div className={`gf-layer ${major ? 'major' : 'minor'}`} aria-live="polite" onClick={() => setActive(null)}>
      <section className={`gf-card kind-${active.kind}`}>
        <small>{active.code || labelByKind[active.kind] || 'SYSTEM'}</small>
        <strong>{active.title}</strong>
        {active.detail && <p>{active.detail}</p>}
        {major && <span>点击继续</span>}
      </section>
    </div>
  );
}
