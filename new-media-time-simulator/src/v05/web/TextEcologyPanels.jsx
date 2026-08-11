import { contactSeeds } from '../contentFrame.ts';
import { deriveProjectStage } from '../gameLoop.ts';
import {
  contextualFragments,
  fragmentsForKnowledge,
  relationshipEdgesFor,
  sourceLayerLabels,
  textKindLabel
} from '../textEcology.ts';

function Fragment({ fragment, compact = false }) {
  return (
    <article className={`wf-fragment ${compact ? 'compact' : ''}`} data-layer={fragment.layer}>
      <header>
        <small>{sourceLayerLabels[fragment.layer]} · {textKindLabel(fragment.kind)}</small>
        <strong>{fragment.source}</strong>
      </header>
      <p>{fragment.text}</p>
      {!compact && fragment.tags?.length > 0 && (
        <div className="wf-fragment-tags">{fragment.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</div>
      )}
    </article>
  );
}

export function WorldTextPanel({ save, region }) {
  const stage = deriveProjectStage(save.primaryProject);
  const fragments = contextualFragments({
    week: save.week,
    regionId: region.id,
    projectStageId: stage.id,
    limit: 3
  });
  return (
    <section className="wf-panel wf-text-ecology" aria-label="现场文本">
      <small>TEXT ECOLOGY</small>
      <h3>现场文本</h3>
      <p className="wf-ecology-note">公开信息、亲历、二手消息和传闻不会自动合成一个“正确答案”。</p>
      <div className="wf-fragment-stack">{fragments.map((fragment) => <Fragment key={fragment.id} fragment={fragment} compact />)}</div>
    </section>
  );
}

export function LocationTextPanel({ week, region, facility, project }) {
  if (!facility) return null;
  const stage = deriveProjectStage(project);
  const fragments = contextualFragments({
    week,
    regionId: region.id,
    facilityId: facility.id,
    projectStageId: stage.id,
    limit: 2
  });
  if (!fragments.length) return null;
  return (
    <section className="wf-panel wf-text-ecology" aria-label="此地文本">
      <small>AT THIS PLACE</small>
      <h3>此地正在留下什么</h3>
      <div className="wf-fragment-stack">{fragments.map((fragment) => <Fragment key={fragment.id} fragment={fragment} />)}</div>
    </section>
  );
}

export function ContactNetworkPanel({ contact, week }) {
  const edges = relationshipEdgesFor(contact.id);
  const fragments = contextualFragments({ week, contactId: contact.id, regionId: contact.regionId, limit: 1 });
  return (
    <aside className="wf-panel wf-contact-network">
      <small>NETWORK</small>
      <h3>他不只连接你</h3>
      {fragments.map((fragment) => <Fragment key={fragment.id} fragment={fragment} compact />)}
      <div className="wf-network-edges">
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
        }) : <p>当前还没有进入其他人的关系线。</p>}
      </div>
    </aside>
  );
}

export function KnowledgeSourcesPanel({ knowledgeId, week }) {
  const fragments = fragmentsForKnowledge(knowledgeId, week, 4);
  if (!fragments.length) return null;
  return (
    <section className="wf-related wf-knowledge-sources">
      <h3>来源材料</h3>
      <p className="wf-ecology-note">词条是整理后的知识；这些是游戏世界里让它被你理解的碎片。</p>
      <div className="wf-fragment-stack">{fragments.map((fragment) => <Fragment key={fragment.id} fragment={fragment} compact />)}</div>
    </section>
  );
}
