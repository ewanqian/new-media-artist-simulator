import { useEffect, useMemo, useState } from 'react';
import { computeTiers, practices, skills } from '../model.ts';
import {
  facilityById,
  globalSystems,
  legacyResearchSpaceTemplates,
  relevantSpecialistServices,
  spatialFacilities,
  spatialRegions
} from '../locationGraph.ts';
import './v05-wireframe.css';

const SAVE_KEY = 'nmas-v05-world-hub-preview';

const VENUE_PRESETS = [
  { id: 'flat', name: '平面屏', spec: '16:9 / 单输出', diagram: '[          SCREEN          ]', note: '基础构图、字幕安全区、单路播放。' },
  { id: 'wide', name: '超宽屏', spec: '32:9 / 双输出', diagram: '[        LEFT | RIGHT        ]', note: '跨屏构图、拼接、双路同步。' },
  { id: 'ring', name: '环形屏', spec: '360° / 多输出', diagram: '(   SCREEN  ·  SCREEN  ·   )', note: '循环内容、接缝、观众方向变化。' },
  { id: 'dome', name: '球幕', spec: 'DOME / FISHEYE', diagram: '        ______\n     .-´      `-.\n    /   DOME     \\\n    `------------´', note: '鱼眼构图、地平线、中心畸变。' }
];

function makeFreshSave() {
  return {
    screen: 'title',
    practiceId: null,
    week: 1,
    attention: 6,
    attentionMax: 6,
    cash: 3200,
    worldLevel: 1,
    currentRegionId: 'region-rongshore',
    learnedSkillIds: [],
    primaryProject: {
      name: '未命名信号装置',
      question: '怎样让一个数字系统被人感到，而不是只被人看到？',
      methods: ['realtime', 'sound', 'web'],
      stability: 1,
      coherence: 1,
      siteFit: 1,
      documentation: 0,
      history: ['从一段没有整理完的现场录音开始。']
    },
    menuBook: {
      id: 'task-01',
      title: '任务 01 / 第一个可运行版本',
      goals: [
        { id: 'g1', label: '查看当前项目', done: false },
        { id: 'g2', label: '进入一个地点', done: false },
        { id: 'g3', label: '在实际场地完成一次预演', done: false }
      ]
    },
    relations: [
      { id: 'peer', label: '同行', state: '熟悉', note: '会交换信息，但还没有共同项目。' },
      { id: 'venue-contact', label: '场地联系人', state: '弱连接', note: '愿意提供空档，技术条件需要提前确认。' },
      { id: 'producer', label: '制作方', state: '未建立', note: '只有项目进入制作阶段后才会形成稳定关系。' }
    ],
    archive: [{ type: '系统', title: '存档建立', text: '第 1 周。' }]
  };
}

function normalizeSave(raw) {
  const fresh = makeFreshSave();
  if (!raw || typeof raw !== 'object') return fresh;
  const legacyRegion = typeof raw.currentNodeId === 'string' && raw.currentNodeId.startsWith('region-')
    ? raw.currentNodeId
    : fresh.currentRegionId;
  return {
    ...fresh,
    ...raw,
    screen: 'title',
    currentRegionId: raw.currentRegionId || legacyRegion,
    menuBook: fresh.menuBook,
    primaryProject: { ...fresh.primaryProject, ...(raw.primaryProject || {}) },
    relations: Array.isArray(raw.relations) ? raw.relations : fresh.relations,
    archive: Array.isArray(raw.archive) ? raw.archive : fresh.archive
  };
}

export default function V05Wireframe() {
  const [save, setSave] = useState(makeFreshSave);
  const [surface, setSurface] = useState('world');
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState('shared-studio');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) setSave(normalizeSave(JSON.parse(raw)));
    } catch {}
  }, []);

  useEffect(() => {
    if (save.practiceId) localStorage.setItem(SAVE_KEY, JSON.stringify({ ...save, screen: 'play' }));
  }, [save]);

  useEffect(() => {
    const onKey = (event) => {
      if (save.screen !== 'play') return;
      const key = event.key.toLowerCase();
      if (key === 'a') {
        event.preventDefault();
        setArchiveOpen((value) => !value);
        return;
      }
      if (archiveOpen && event.key === 'Escape') {
        setArchiveOpen(false);
        return;
      }
      if (key === 'm') setSurface('world');
      if (key === 'p') { setSurface('projects'); finishGoal('g1'); }
      if (key === 'w') setSurface('workbench');
      if (key === 'r') setSurface('relations');
      if (event.key === 'Escape') setSurface('world');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [archiveOpen, save.screen]);

  const practice = useMemo(() => practices.find((item) => item.id === save.practiceId), [save.practiceId]);
  const learnedSkills = useMemo(() => skills.filter((item) => save.learnedSkillIds.includes(item.id)), [save.learnedSkillIds]);
  const currentRegion = useMemo(
    () => spatialRegions.find((item) => item.id === save.currentRegionId) || spatialRegions[0],
    [save.currentRegionId]
  );

  function startNew() {
    localStorage.removeItem(SAVE_KEY);
    setSave({ ...makeFreshSave(), screen: 'direction' });
    setSurface('world');
  }

  function continueGame() {
    if (!save.practiceId) setSave((current) => ({ ...current, screen: 'direction' }));
    else setSave((current) => ({ ...current, screen: 'play' }));
  }

  function chooseDirection(id) {
    const selected = practices.find((item) => item.id === id);
    const fresh = makeFreshSave();
    fresh.screen = 'play';
    fresh.practiceId = id;
    fresh.learnedSkillIds = selected?.starterSkills || [];
    fresh.archive.push({ type: '起始方向', title: selected?.name || id, text: '作为起始能力入口。' });
    setSave(fresh);
    setSurface('world');
  }

  function finishGoal(id) {
    setSave((current) => ({
      ...current,
      menuBook: {
        ...current.menuBook,
        goals: current.menuBook.goals.map((goal) => goal.id === id ? { ...goal, done: true } : goal)
      }
    }));
  }

  function openSystem(id) {
    if (id === 'archive') {
      setArchiveOpen(true);
      return;
    }
    if (id === 'projects') finishGoal('g1');
    setSurface(id);
  }

  function openRegion(region) {
    if (region.unlockAt > save.worldLevel) return;
    const firstFacility = region.facilityIds[0];
    setSave((current) => ({ ...current, currentRegionId: region.id }));
    setSelectedFacilityId(firstFacility);
    setSurface('location');
    finishGoal('g2');
  }

  function spendAttention(cost, entry) {
    if (save.attention < cost) return false;
    setSave((current) => ({
      ...current,
      attention: current.attention - cost,
      archive: entry ? [...current.archive, entry] : current.archive
    }));
    return true;
  }

  function endWeek() {
    setSave((current) => ({
      ...current,
      week: current.week + 1,
      attention: current.attentionMax,
      cash: current.cash - 450,
      archive: [...current.archive, { type: '时间', title: `第 ${current.week} 周结束`, text: '固定支出 -450。注意力恢复。' }]
    }));
  }

  if (save.screen === 'title') {
    return <TitleScreen hasSave={Boolean(save.practiceId)} onContinue={continueGame} onNew={startNew} />;
  }

  if (save.screen === 'direction') {
    return <DirectionSelect onSelect={chooseDirection} onBack={() => setSave((current) => ({ ...current, screen: 'title' }))} />;
  }

  return (
    <div className="wf-shell">
      <header className="wf-header">
        <button className="wf-title-button" onClick={() => setSurface('world')}>新媒体艺术家模拟器</button>
        <div className="wf-header-state"><span>第 {save.week} 周</span><span>注意力 {save.attention}/{save.attentionMax}</span><span>¥{save.cash}</span></div>
        <button className="wf-end-week" onClick={endWeek}>结束本周</button>
      </header>

      <div className="wf-app-grid">
        <GlobalNav active={surface} onOpen={openSystem} />
        <main className="wf-main">
          {surface === 'world' && <WorldMap save={save} currentRegion={currentRegion} onOpen={openRegion} />}
          {surface === 'projects' && <Projects save={save} onSpend={spendAttention} />}
          {surface === 'workbench' && <Workbench save={save} practice={practice} learnedSkills={learnedSkills} setSave={setSave} />}
          {surface === 'relations' && <Relations save={save} />}
          {surface === 'location' && (
            <Location
              region={currentRegion}
              selectedFacilityId={selectedFacilityId}
              setSelectedFacilityId={setSelectedFacilityId}
              onBack={() => setSurface('world')}
              onSpend={spendAttention}
              onVenue={() => setSurface('venue')}
            />
          )}
          {surface === 'venue' && (
            <VenueTest
              save={save}
              facilityId={selectedFacilityId}
              onBack={() => setSurface('location')}
              onSpend={spendAttention}
              onComplete={() => finishGoal('g3')}
            />
          )}
        </main>
      </div>

      <footer className="wf-footer"><span>M 世界　P 项目　W 工作台　R 关系　A 档案</span><span>{currentRegion.name}</span></footer>
      {archiveOpen && <Archive save={save} practice={practice} onClose={() => setArchiveOpen(false)} />}
    </div>
  );
}

function TitleScreen({ hasSave, onContinue, onNew }) {
  return (
    <main className="wf-title-screen">
      <div className="wf-title-box">
        <small>NEW MEDIA ARTIST SIMULATOR</small>
        <h1>新媒体艺术家模拟器</h1>
        <div className="wf-menu">
          <button onClick={onContinue}>{hasSave ? '继续' : '开始'}</button>
          <button onClick={onNew}>新游戏</button>
          <button disabled>设置</button>
        </div>
      </div>
      <div className="wf-version">v0.5 / WIREFRAME</div>
    </main>
  );
}

function DirectionSelect({ onSelect, onBack }) {
  return (
    <main className="wf-direction-screen">
      <div className="wf-page-head"><button onClick={onBack}>← 主菜单</button><h1>选择起始方向</h1><p>只决定起始能力。后续可以混合。</p></div>
      <div className="wf-direction-list">
        {practices.map((item, index) => (
          <button key={item.id} onClick={() => onSelect(item.id)}>
            <span>{String(index + 1).padStart(2, '0')}</span><strong>{item.name.replace('实践', '')}</strong><p>{item.description}</p><small>{item.vocabulary.slice(0, 4).join(' / ')}</small>
          </button>
        ))}
      </div>
    </main>
  );
}

function GlobalNav({ active, onOpen }) {
  return (
    <nav className="wf-global-nav" aria-label="主要系统">
      {globalSystems.map((item) => (
        <button key={item.id} className={active === item.id ? 'active' : ''} onClick={() => onOpen(item.id)}>
          <strong>{item.label}</strong><small>{item.shortcut}</small>
        </button>
      ))}
    </nav>
  );
}

function WorldMap({ save, currentRegion, onOpen }) {
  const adjacent = currentRegion.adjacentIds
    .map((id) => spatialRegions.find((region) => region.id === id)?.name)
    .filter(Boolean);
  return (
    <section className="wf-world-layout">
      <div className="wf-map-column">
        <div className="wf-section-head"><h2>世界</h2><span>区域关系</span></div>
        <div className="wf-map-scroll">
          <div className="wf-map">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {spatialRegions.flatMap((region) => region.adjacentIds.map((id) => {
                const target = spatialRegions.find((item) => item.id === id);
                if (!target || region.id > target.id) return null;
                return <line key={`${region.id}-${id}`} x1={region.x} y1={region.y} x2={target.x} y2={target.y} />;
              }))}
            </svg>
            {spatialRegions.map((region) => {
              const locked = region.unlockAt > save.worldLevel;
              return (
                <button
                  key={region.id}
                  className={`wf-node ${locked ? 'locked' : ''} ${region.id === save.currentRegionId ? 'current' : ''}`}
                  style={{ left: `${region.x}%`, top: `${region.y}%` }}
                  onClick={() => onOpen(region)}
                >
                  <strong>{region.name}</strong><small>{region.shortName}</small>{locked && <i>锁定</i>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <aside className="wf-side">
        <TaskBook save={save} />
        <div className="wf-panel">
          <h3>当前位置</h3>
          <strong>{currentRegion.name}</strong>
          <p>{currentRegion.description}</p>
          <label>相邻区域</label>
          <p>{adjacent.join(' / ') || '—'}</p>
          <label>内部地点</label>
          <p>{currentRegion.facilityIds.map((id) => facilityById.get(id)?.name).filter(Boolean).join(' / ')}</p>
        </div>
        <div className="wf-panel wf-inventory-count">
          <h3>地点结构</h3>
          <div><span>世界区域</span><strong>{spatialRegions.length}</strong></div>
          <div><span>区域内地点</span><strong>{spatialFacilities.length}</strong></div>
          <div><span>旧研究空间模板</span><strong>{legacyResearchSpaceTemplates.length}</strong></div>
        </div>
      </aside>
    </section>
  );
}

function TaskBook({ save }) {
  return (
    <div className="wf-panel"><h3>{save.menuBook.title}</h3>{save.menuBook.goals.map((goal) => <div key={goal.id} className="wf-task">[{goal.done ? 'x' : ' '}] {goal.label}</div>)}</div>
  );
}

function Projects({ save, onSpend }) {
  const project = save.primaryProject;
  return (
    <section className="wf-page">
      <div className="wf-page-head"><h1>项目</h1><p>项目状态与任务书。这里不是地图。</p></div>
      <div className="wf-project-layout">
        <section className="wf-panel">
          <h3>当前项目</h3>
          <strong>{project.name}</strong>
          <p>{project.question}</p>
          <label>方法</label><p>{project.methods.join(' / ')}</p>
          <table><tbody>
            <tr><td>一致性</td><td>{project.coherence}/4</td></tr>
            <tr><td>稳定性</td><td>{project.stability}/4</td></tr>
            <tr><td>场地适配</td><td>{project.siteFit}/4</td></tr>
            <tr><td>文档</td><td>{project.documentation}/4</td></tr>
          </tbody></table>
          <button onClick={() => onSpend(1, { type: '项目', title: '继续当前项目', text: '为当前项目投入一次注意力。' })}>继续制作 / 注意力 -1</button>
        </section>
        <TaskBook save={save} />
        <section className="wf-panel wf-project-history"><h3>项目记录</h3>{project.history.map((entry, index) => <p key={`${entry}-${index}`}>{String(index + 1).padStart(2, '0')} / {entry}</p>)}</section>
      </div>
    </section>
  );
}

function Workbench({ save, practice, learnedSkills, setSave }) {
  const tier = computeTiers[1];
  const services = relevantSpecialistServices(save.practiceId);
  return (
    <section className="wf-page">
      <div className="wf-page-head"><h1>工作台</h1><p>制作条件、能力和当前方向真正需要的专业服务。</p></div>
      <div className="wf-workbench">
        <section className="wf-panel">
          <h3>制作设备</h3>
          <strong>x86 Desktop / {tier.label}</strong>
          <p>{tier.enables.join(' / ')}</p>
          <button onClick={() => save.cash >= 900 && setSave((current) => ({
            ...current,
            cash: current.cash - 900,
            primaryProject: { ...current.primaryProject, stability: Math.min(4, current.primaryProject.stability + 1) },
            archive: [...current.archive, { type: '工作台', title: '输出链优化', text: '稳定性 +1。' }]
          }))}>优化输出链 / ¥900</button>
        </section>
        <section className="wf-panel">
          <h3>已掌握能力</h3>
          <strong>{practice?.name.replace('实践', '')}</strong>
          {learnedSkills.map((skill) => <div key={skill.id} className="wf-skill"><span>{skill.family}</span>{skill.name}</div>)}
        </section>
        <section className="wf-panel wf-services">
          <h3>专业服务</h3>
          {services.length ? services.map((service) => (
            <article key={service.id}><strong>{service.name}</strong><p>{service.description}</p><small>{service.functions.join(' / ')}</small></article>
          )) : <p>当前起始方向没有默认技术服务。需要时再由项目或事件解锁。</p>}
        </section>
      </div>
    </section>
  );
}

function Relations({ save }) {
  return (
    <section className="wf-page">
      <div className="wf-page-head"><h1>关系</h1><p>只记录发生过的关系状态，不显示爱心条。</p></div>
      <div className="wf-relation-list">
        {save.relations.map((relation) => (
          <article key={relation.id}><small>{relation.state}</small><strong>{relation.label}</strong><p>{relation.note}</p></article>
        ))}
      </div>
    </section>
  );
}

function Location({ region, selectedFacilityId, setSelectedFacilityId, onBack, onSpend, onVenue }) {
  const facilityIds = region.facilityIds;
  const selected = facilityById.get(selectedFacilityId) || facilityById.get(facilityIds[0]);
  const hasVenuePreview = selected?.functions.includes('venue-preview');
  return (
    <section className="wf-page">
      <div className="wf-page-head"><button onClick={onBack}>← 世界</button><small>世界 / {region.name}</small><h1>{region.name}</h1><p>{region.description}</p></div>
      <div className="wf-location-layout">
        <nav>
          {facilityIds.map((id) => {
            const facility = facilityById.get(id);
            return <button key={id} className={id === selected?.id ? 'active' : ''} onClick={() => setSelectedFacilityId(id)}><small>{facility?.kind}</small><strong>{facility?.name}</strong></button>;
          })}
        </nav>
        <div className="wf-location-main">
          <section className="wf-panel wf-facility-detail">
            <small>{selected?.kind}</small><h2>{selected?.name}</h2><p>{selected?.description}</p>
            <label>这里可以发生</label><p>{selected?.functions.join(' / ')}</p>
            <div className="wf-location-actions">
              <button onClick={() => onSpend(1, { type: '地点', title: selected?.name || '地点', text: `${region.name} / 第一次行动记录。` })}>在这里行动 / 注意力 -1</button>
              {hasVenuePreview && <button onClick={onVenue}>场地预演 →</button>}
            </div>
          </section>
          <ContextEvent facility={selected} onSpend={onSpend} />
        </div>
        <aside className="wf-panel wf-location-context">
          <h3>区域关系</h3>
          <label>区域</label><p>{region.name}</p>
          <label>相邻</label><p>{region.adjacentIds.map((id) => spatialRegions.find((item) => item.id === id)?.name).filter(Boolean).join(' / ')}</p>
          <label>地点标签</label><p>{region.tags.join(' / ')}</p>
        </aside>
      </div>
    </section>
  );
}

function ContextEvent({ facility, onSpend }) {
  if (!facility) return null;
  if (facility.id === 'river-diner' || facility.id === 'border-cafe') {
    return (
      <article className="wf-text-event">
        <small>消息 / 14:20</small>
        <h2>“有个场地空了两个小时。你那个项目要不要拿去跑一下？”</h2>
        <p>没有正式展览。场地只提供基础设备，三天后要给技术单。</p>
        <div className="wf-decisions">
          <button onClick={() => onSpend(1, { type: '判断', title: '查看机会', text: '先判断它能不能推进当前项目。' })}><b>1</b><span>先判断值不值得去</span><small>注意力 -1</small></button>
          <button onClick={() => onSpend(2, { type: '沟通', title: '确认测试', text: '先确认输出、声音和撤场条件。' })}><b>2</b><span>先问清技术条件</span><small>注意力 -2</small></button>
          <button onClick={() => onSpend(0, { type: '选择', title: '暂不接', text: '把这周留给当前项目。' })}><b>3</b><span>不接</span><small>注意力 0</small></button>
        </div>
      </article>
    );
  }
  if (facility.id === 'open-call-office') {
    return (
      <article className="wf-text-event">
        <small>公开征集 / 截止 5 天</small>
        <h2>一个小型媒体艺术空间正在征集新项目。</h2>
        <p>公开信息只有主题、三张参考图和一行制作支持。真正值得确认的是场地、制作预算和技术支持。</p>
        <div className="wf-decisions">
          <button onClick={() => onSpend(1, { type: '申请', title: '先读规则', text: '没有立即提交，先把支持条件查清楚。' })}><b>1</b><span>先查支持条件</span><small>注意力 -1</small></button>
          <button onClick={() => onSpend(2, { type: '申请', title: '准备申请', text: '开始整理当前项目的申请版本。' })}><b>2</b><span>准备申请</span><small>注意力 -2</small></button>
        </div>
      </article>
    );
  }
  return null;
}

function VenueTest({ save, facilityId, onBack, onSpend, onComplete }) {
  const facility = facilityById.get(facilityId);
  function run(preset) {
    if (!onSpend(2, { type: '预演', title: `${preset.name}测试`, text: `${facility?.name || '场地'} / ${preset.spec}` })) return;
    onComplete();
  }
  return (
    <section className="wf-page">
      <div className="wf-page-head"><button onClick={onBack}>← {facility?.name || '地点'}</button><small>场地 / 输出关系</small><h1>场地预演</h1><p>{facility?.name} / {save.primaryProject.name}</p></div>
      <div className="wf-venue-grid">{VENUE_PRESETS.map((preset) => <button key={preset.id} onClick={() => run(preset)}><small>{preset.spec}</small><strong>{preset.name}</strong><pre>{preset.diagram}</pre><p>{preset.note}</p><span>运行测试 / 注意力 -2</span></button>)}</div>
    </section>
  );
}

function Archive({ save, practice, onClose }) {
  return (
    <div className="wf-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="wf-archive">
        <header><div><small>ARCHIVE</small><h2>档案</h2></div><button onClick={onClose}>关闭 [A]</button></header>
        <div className="wf-archive-meta">第 {save.week} 周 / {practice?.name.replace('实践', '') || '未选择'} / {save.primaryProject.name}</div>
        <div className="wf-archive-list">{save.archive.slice().reverse().map((entry, index) => <article key={`${entry.title}-${index}`}><small>{entry.type}</small><strong>{entry.title}</strong><p>{entry.text}</p></article>)}</div>
      </aside>
    </div>
  );
}
