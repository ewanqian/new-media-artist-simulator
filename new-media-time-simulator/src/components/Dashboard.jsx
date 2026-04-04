import { slotLabels, skills } from '../data/skills.js';
import { projects } from '../data/projects.js';
import { actions } from '../data/maps.js';
import { archetypes } from '../data/archetypes.js';
import { formatInventory } from '../engine/utils.js';

export default function Dashboard({
  state,
  computedStats,
  currentRegion,
  currentSubmap,
  availableRegions,
  onMove,
  onAction,
  onEquip,
  onStartProject,
  onReset,
  onExport,
  onImport
}) {
  const archetype = archetypes.find((item) => item.id === state.selectedArchetypeId);
  const unlockedSkillObjects = state.unlockedSkills
    .map((skillId) => skills.find((skill) => skill.id === skillId))
    .filter(Boolean);

  const inventoryList = formatInventory(state.inventory);

  return (
    <div className="dashboard-grid">
      <section className="panel panel--wide">
        <div className="section-title-row">
          <div>
            <div className="eyebrow">干员状态</div>
            <h2>{archetype?.name}</h2>
          </div>
          <div className="phase-box">
            <strong>阶段 {state.phase}</strong>
            <span>第 {state.turn} 周</span>
          </div>
        </div>
        <p>{archetype?.description}</p>
        <div className="stat-grid">
          {Object.entries(computedStats).map(([key, value]) => (
            <div className="stat-item" key={key}>
              <span>{key}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        {state.ending && (
          <div className="ending-box">
            <div className="eyebrow">本轮归档结果</div>
            <h3>{state.ending.title}</h3>
            <p>{state.ending.description}</p>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="section-title-row">
          <h2>全球地图</h2>
          <span className="hint">地图嵌套地图，阶段越高解锁越多。</span>
        </div>
        <div className="region-list">
          {availableRegions.map((region) => (
            <div className={`region-card ${state.currentRegionId === region.id ? 'is-active' : ''}`} key={region.id}>
              <button className="region-button" onClick={() => onMove(region.id, region.submaps[0].id)}>
                <strong>{region.name}</strong>
                <span>{region.description}</span>
              </button>
              {state.currentRegionId === region.id && (
                <div className="submap-list">
                  {region.submaps.map((submap) => (
                    <button
                      key={submap.id}
                      className={`submap-button ${state.currentSubmapId === submap.id ? 'is-active' : ''}`}
                      onClick={() => onMove(region.id, submap.id)}
                    >
                      {submap.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="panel panel--wide">
        <div className="section-title-row">
          <div>
            <h2>{currentRegion?.name} / {currentSubmap?.name}</h2>
            <p className="small-text">{currentSubmap?.description}</p>
          </div>
          <span className="hint">当前场域会影响技能掉落与 NPC 结构。</span>
        </div>
        <div className="action-grid">
          {(currentSubmap?.actions || []).map((actionId) => {
            const action = actions[actionId];
            return (
              <article className="action-card" key={actionId}>
                <h3>{action.name}</h3>
                <p>{action.description}</p>
                <div className="small-text">类型：{action.kind}</div>
                <button className="primary-button" disabled={Boolean(state.ending)} onClick={() => onAction(actionId)}>
                  执行行动
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="section-title-row">
          <h2>技能插槽</h2>
          <span className="hint">受 Agent Skills 逻辑启发的可组合节点。</span>
        </div>
        <div className="slot-list">
          {Object.entries(slotLabels).map(([slot, label]) => {
            const equipped = skills.find((skill) => skill.id === state.equippedSkills[slot]);
            const options = unlockedSkillObjects.filter((skill) => skill.slot === slot);
            return (
              <div className="slot-card" key={slot}>
                <strong>{label}</strong>
                <p className="small-text">当前：{equipped?.name || '未装配'}</p>
                <div className="mini-button-row">
                  {options.map((skill) => (
                    <button key={skill.id} className="mini-button" onClick={() => onEquip(skill.id)}>
                      {skill.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="section-title-row">
          <h2>研发挂载</h2>
          <span className="hint">像种菜一样挂项目，回合推进后收成。</span>
        </div>
        <div className="project-list">
          {projects.map((project) => (
            <div className="project-card" key={project.id}>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <div className="small-text">耗时：{project.duration} 回合</div>
              <button className="secondary-button" disabled={Boolean(state.ending)} onClick={() => onStartProject(project.id)}>
                挂载研发
              </button>
            </div>
          ))}
        </div>
        <div className="queue-box">
          <strong>当前队列</strong>
          {state.activeProjects.length ? (
            <ul>
              {state.activeProjects.map((project) => {
                const template = projects.find((item) => item.id === project.templateId);
                return <li key={`${project.templateId}-${project.remaining}`}>{template?.name} · 剩余 {project.remaining} 回合</li>;
              })}
            </ul>
          ) : (
            <p className="small-text">暂无研发。先挂一个，不然你的系统理论只会停留在嘴上。</p>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="section-title-row">
          <h2>库存 / 缓存</h2>
          <span className="hint">奖励品会参与后续叙事与扩展系统。</span>
        </div>
        {inventoryList.length ? (
          <div className="tag-row">
            {inventoryList.map((item) => <span className="tag" key={item}>{item}</span>)}
          </div>
        ) : (
          <p className="small-text">还没有打捞到任何有效资源。</p>
        )}
        <div className="button-row button-row--dense">
          <button className="mini-button" onClick={onExport}>导出存档</button>
          <label className="mini-button file-button">
            导入存档
            <input type="file" accept="application/json" onChange={onImport} hidden />
          </label>
          <button className="mini-button danger-button" onClick={onReset}>重置本轮</button>
        </div>
      </section>

      <section className="panel panel--wide">
        <div className="section-title-row">
          <h2>现场记录</h2>
          <span className="hint">保留旧版文本气质，但让它服务于系统推进。</span>
        </div>
        <div className="log-box">
          {[...state.log].slice(-12).reverse().map((entry, index) => (
            <div className="log-entry" key={`${entry}-${index}`}>{entry}</div>
          ))}
        </div>
      </section>
    </div>
  );
}
