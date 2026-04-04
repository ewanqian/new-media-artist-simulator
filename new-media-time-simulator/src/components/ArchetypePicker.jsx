import { archetypes } from '../data/archetypes.js';

export default function ArchetypePicker({ recommendedArchetypeId, onSelect }) {
  return (
    <section className="panel">
      <div className="section-title-row">
        <h2>干员外壳</h2>
        <span className="hint">可无视推荐，直接选你想玩的流派。</span>
      </div>
      <div className="card-grid">
        {archetypes.map((archetype) => (
          <article className={`card ${recommendedArchetypeId === archetype.id ? 'card--recommended' : ''}`} key={archetype.id}>
            <div className="card-header">
              <h3>{archetype.name}</h3>
              {recommendedArchetypeId === archetype.id && <span className="pill">推荐</span>}
            </div>
            <p className="shell-label">{archetype.shell}</p>
            <p>{archetype.description}</p>
            <div className="tag-row">
              {archetype.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
            </div>
            <p className="small-text">被动：{archetype.passive}</p>
            <button className="secondary-button" onClick={() => onSelect(archetype.id)}>选择这个干员</button>
          </article>
        ))}
      </div>
    </section>
  );
}
