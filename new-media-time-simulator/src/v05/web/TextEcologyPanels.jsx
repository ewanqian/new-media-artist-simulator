import { contactSeeds } from '../legacyDeck.ts';
import { deriveProjectStage } from '../gameLoop.ts';
import {
  contextualFragments,
  fragmentsForKnowledge,
  relationshipEdgesFor,
  sourceLayerLabels,
  textKindLabel
} from '../textEcology.ts';
import {
  experienceStream,
  fragmentsForActionCard,
  fragmentsForPlaceCard
} from '../textEcologyExperience.ts';

function Fragment({ fragment, compact = false }) {
  return (
    <article className={`vx-fragment ${compact ? 'compact' : ''}`} data-layer={fragment.layer}>
      <header>
        <small>{sourceLayerLabels[fragment.layer]} · {textKindLabel(fragment.kind)}</small>
        <strong>{fragment.source}</strong>
      </header>
      <p>{fragment.text}</p>
      {!compact && fragment.tags?.length > 0 && (
        <div className="vx-fragment-tags">{fragment.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</div>
      )}
    </article>
  );
}

export function ExperienceTextStream({ save, title = '今天的信息流', limit = 4 }) {
  const stage = deriveProjectStage(save.projectMetrics);
  const fragments = experienceStream(save.week, save.completedCardIds, save.visitedPlaceIds, stage.id, limit);
  return (
    <section className="vx-ecology-block" aria-label="现场文本">
      <div className="vx-section-title vx-ecology-title"><h2>{title}</h2><span>亲历 / 公开 / 二手 / 传闻</span></div>
      <div className="vx-fragment-grid">{fragments.map((fragment) => <Fragment key={fragment.id} fragment={fragment} />)}</div>
    </section>
  );
}

export function CardTextFragments({ cardId, week }) {
  const fragments = fragmentsForActionCard(cardId, week, 2);
  if (!fragments.length) return null;
  return (
    <section className="vx-ecology-inline">
      <small>相关碎片</small>
      <div className="vx-fragment-stack">{fragments.map((fragment) => <Fragment key={fragment.id} fragment={fragment} compact />)}</div>
    </section>
  );
}

export function PlaceTextFragments({ placeId, week }) {
  const fragments = fragmentsForPlaceCard(placeId, week, 3);
  if (!fragments.length) return null;
  return (
    <section className="vx-ecology-inline">
      <small>这个地方的文本不会完全一致</small>
      <div className="vx-fragment-stack">{fragments.map((fragment) => <Fragment key={fragment.id} fragment={fragment} />)}</div>
    </section>
  );
}

export function ContactNetworkPanel({ contact, week }) {
  const edges = relationshipEdgesFor(contact.id);
  const direct = contextualFragments({ week, contactId: contact.id, limit: 1 });
  return (
    <section className="vx-contact-network">
      <div className="vx-section-title"><h2>这张关系网里</h2><span>不是好感度</span></div>
      {direct.map((fragment) => <Fragment key={fragment.id} fragment={fragment} compact />)}
      <div className="vx-network-grid">
        {edges.length ? edges.map((edge) => {
          const otherId = edge.fromContactId === contact.id ? edge.toContactId : edge.fromContactId;
          const other = contactSeeds.find((item) => item.id === otherId);
          return (
            <article key={edge.id}>
              <small>{edge.label}</small>
              <strong>↔ {other?.name || otherId}</strong>
              <p>{edge.note}</p>
            </article>
          );
        }) : <p>你还不知道他和谁有更具体的工作关系。</p>}
      </div>
    </section>
  );
}

export function KnowledgeSourcesPanel({ knowledgeId, week }) {
  const fragments = fragmentsForKnowledge(knowledgeId, week, 4);
  if (!fragments.length) return null;
  return (
    <section className="vx-knowledge-sources">
      <div className="vx-section-title"><h2>来源材料</h2><span>词条是整理后的版本</span></div>
      <div className="vx-fragment-stack">{fragments.map((fragment) => <Fragment key={fragment.id} fragment={fragment} compact />)}</div>
    </section>
  );
}
