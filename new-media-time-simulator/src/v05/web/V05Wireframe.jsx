import { useEffect, useMemo, useState } from 'react';
import { computeTiers, practices, skills } from '../model.ts';
import {
  facilityById,
  globalSystems,
  legacyResearchSpaceTemplates,
  relevantSpecialistServices,
  spatialRegions
} from '../locationGraph.ts';
import { contactSeeds, opportunitySeeds, starterProjectsByPractice } from '../contentFrame.ts';
import { knowledgeById, knowledgeCategories, knowledgeEntries } from '../knowledgeBase.ts';
import {
  applyProjectAction,
  cashPressure,
  deriveProjectStage,
  opportunityReadiness,
  projectActions,
  projectStages,
  weeklyPulseFor
} from '../gameLoop.ts';
import './v05-wireframe.css';

const SAVE_KEY = 'nmas-v05-world-hub-preview';

const VENUE_PRESETS = [
  { id: 'flat', name: '平面屏', spec: '16:9 / 单输出', diagram: '[          SCREEN          ]', note: '先检查构图、字幕安全区和单路播放。' },
  { id: 'wide', name: '超宽屏', spec: '32:9 / 双输出', diagram: '[        LEFT | RIGHT        ]', note: '检查跨屏构图、拼接和双路同步。' },
  { id: 'ring', name: '环形屏', spec: '360° / 多输出', diagram: '(   SCREEN  ·  SCREEN  ·   )', note: '检查循环、接缝和观众方向变化。' },
  { id: 'dome', name: '球幕', spec: 'DOME / FISHEYE', diagram: '        ______\n     .-´      `-.\n    /   DOME     \\\n    `------------´', note: '检查鱼眼构图、地平线和中心畸变。' }
];

const LEGACY_REGION_MAP = {
  'region-rongshore': 'region-putuo-sucreek',
  'region-academy': 'region-yangpu',
  'region-biennale': 'region-westbund',
  'region-residency': 'region-hangzhou',
  'region-shenzhen': 'region-pudong-zhangjiang'
};

function defaultProject() {
  return {
    name: '起始项目',
    question: '先选择一个实践方向。',
    methods: [],
    stability: 1,
    coherence: 1,
    siteFit: 0,
    documentation: 0,
    history: ['项目尚未建立。']
  };
}

function makeFreshSave() {
  return {
    screen: 'title',
    practiceId: null,
    week: 1,
    attention: 6,
    attentionMax: 6,
    cash: 3200,
    worldLevel: 1,
    currentRegionId: 'region-putuo-sucreek',
    learnedSkillIds: [],
    primaryProject: defaultProject(),
    menuBook: {
      id: 'task-01',
      title: '本周焦点',
      goals: [
        { id: 'g1', label: '把项目推进到「原型」', done: false },
        { id: 'g2', label: '去一个真实地点', done: false },
        { id: 'g3', label: '完成一次真实场地测试', done: false }
      ]
    },
    readKnowledgeEntryIds: [],
    reviewedOpportunityIds: [],
    contactTouches: {},
    actionLog: [
      { type: '系统', title: '新一轮开始', text: '第 1 周。地点、项目和联络网络已经建立。' }
    ]
  };
}

function normalizeSave(raw) {
  const fresh = makeFreshSave();
  if (!raw || typeof raw !== 'object') return fresh;
  const rawRegion = raw.currentRegionId || raw.currentNodeId;
  const mappedRegion = LEGACY_REGION_MAP[rawRegion] || rawRegion;
  const regionExists = spatialRegions.some((region) => region.id === mappedRegion);
  const migratedLog = Array.isArray(raw.actionLog)
    ? raw.actionLog
    : Array.isArray(raw.archive)
      ? raw.archive
      : fresh.actionLog;
  return {
    ...fresh,
    ...raw,
    screen: 'title',
    currentRegionId: regionExists ? mappedRegion : fresh.currentRegionId,
    menuBook: fresh.menuBook,
    primaryProject: { ...fresh.primaryProject, ...(raw.primaryProject || {}) },
    readKnowledgeEntryIds: Array.isArray(raw.readKnowledgeEntryIds) ? raw.readKnowledgeEntryIds : [],
    reviewedOpportunityIds: Array.isArray(raw.reviewedOpportunityIds) ? raw.reviewedOpportunityIds : [],
    contactTouches: raw.contactTouches && typeof raw.contactTouches === 'object' ? raw.contactTouches : {},
    actionLog: migratedLog
  };
}

export default function V05Wireframe() {
  const [save, setSave] = useState(makeFreshSave);
  const [surface, setSurface] = useState('world');
  const [actionLogOpen, setActionLogOpen] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState('putuo-studio-floor');
  const [selectedContactId, setSelectedContactId] = useState(contactSeeds[0].id);
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState('shanghai-media-ecology');
  const [knowledgeCategory, setKnowledgeCategory] = useState('全部');

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
      if (key === 'l') {
        event.preventDefault();
        setActionLogOpen((value) => !value);
        return;
      }
      if (actionLogOpen && event.key === 'Escape') {
        setActionLogOpen(false);
        return;
      }
      if (key === 'm') setSurface('world');
      if (key === 'p') setSurface('projects');
      if (key === 'w') setSurface('workbench');
      if (key === 'c') setSurface('contacts');
      if (key === 'k') setSurface('archive');
      if (event.key === 'Escape') setSurface('world');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [actionLogOpen, save.screen]);

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
    const starter = starterProjectsByPractice[id];
    const fresh = makeFreshSave();
    fresh.screen = 'play';
    fresh.practiceId = id;
    fresh.learnedSkillIds = selected?.starterSkills || [];
    fresh.primaryProject = {
      ...fresh.primaryProject,
      name: starter?.name || '项目 01',
      question: starter?.question || '先做出第一个可运行版本。',
      methods: starter?.methods || [],
      history: starter ? [starter.note] : ['项目建立。']
    };
    fresh.actionLog.push({ type: '起始方向', title: selected?.name || id, text: `${fresh.primaryProject.name} 已建立。` });
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
    setSurface(id);
  }

  function openRegion(region) {
    if (region.unlockAt > save.worldLevel) return;
    setSave((current) => ({ ...current, currentRegionId: region.id }));
    setSelectedFacilityId(region.facilityIds[0]);
    setSurface('location');
    finishGoal('g2');
  }

  function spendAttention(cost, entry) {
    if (save.attention < cost) return false;
    setSave((current) => ({
      ...current,
      attention: current.attention - cost,
      actionLog: entry ? [...current.actionLog, entry] : current.actionLog
    }));
    return true;
  }

  function doProjectAction(actionId) {
    const action = projectActions.find((item) => item.id === actionId);
    if (!action || save.attention < action.cost) return;
    setSave((current) => {
      const beforeStage = deriveProjectStage(current.primaryProject);
      const nextMetrics = applyProjectAction(current.primaryProject, actionId);
      const afterStage = deriveProjectStage(nextMetrics);
      const stageChanged = beforeStage.id !== afterStage.id;
      const stageIndex = projectStages.findIndex((item) => item.id === afterStage.id);
      return {
        ...current,
        attention: current.attention - action.cost,
        worldLevel: Math.max(current.worldLevel, Math.min(4, stageIndex)),
        primaryProject: {
          ...current.primaryProject,
          ...nextMetrics,
          history: [
            ...current.primaryProject.history,
            `第 ${current.week} 周 / ${action.label}：${action.description}${stageChanged ? ` → 进入「${afterStage.label}」` : ''}`
          ]
        },
        menuBook: afterStage.id !== 'clue'
          ? { ...current.menuBook, goals: current.menuBook.goals.map((goal) => goal.id === 'g1' ? { ...goal, done: true } : goal) }
          : current.menuBook,
        actionLog: [
          ...current.actionLog,
          { type: '项目', title: action.label, text: stageChanged ? `${action.description} 项目进入「${afterStage.label}」。` : action.description }
        ]
      };
    });
  }

  function completeVenueTest(preset) {
    setSave((current) => {
      const beforeStage = deriveProjectStage(current.primaryProject);
      const nextMetrics = applyProjectAction(current.primaryProject, 'site-test');
      const afterStage = deriveProjectStage(nextMetrics);
      const stageChanged = beforeStage.id !== afterStage.id;
      const stageIndex = projectStages.findIndex((item) => item.id === afterStage.id);
      return {
        ...current,
        worldLevel: Math.max(current.worldLevel, Math.min(4, stageIndex)),
        primaryProject: {
          ...current.primaryProject,
          ...nextMetrics,
          history: [...current.primaryProject.history, `第 ${current.week} 周 / 场地测试：${preset.name} ${preset.spec}${stageChanged ? ` → 进入「${afterStage.label}」` : ''}`]
        },
        menuBook: { ...current.menuBook, goals: current.menuBook.goals.map((goal) => goal.id === 'g3' ? { ...goal, done: true } : goal) },
        actionLog: [...current.actionLog, { type: '场地', title: `${preset.name}测试完成`, text: `场地适配 +1。${stageChanged ? `项目进入「${afterStage.label}」。` : ''}` }]
      };
    });
  }

  function reviewOpportunity(id) {
    if (save.attention < 1) return;
    const opportunity = opportunitySeeds.find((item) => item.id === id);
    if (!opportunity) return;
    const readiness = opportunityReadiness(id, save.primaryProject, save.week, save.cash);
    setSave((current) => ({
      ...current,
      attention: current.attention - 1,
      reviewedOpportunityIds: current.reviewedOpportunityIds.includes(id)
        ? current.reviewedOpportunityIds
        : [...current.reviewedOpportunityIds, id],
      actionLog: [...current.actionLog, { type: '机会判断', title: opportunity.title, text: `${readiness.ready ? '现在可以进入。' : '现在不适合进入。'} ${readiness.reason}` }]
    }));
  }

  function contactAction(contact, action) {
    if (save.attention < 1) return;
    setSave((current) => ({
      ...current,
      attention: current.attention - 1,
      contactTouches: { ...current.contactTouches, [contact.id]: (current.contactTouches[contact.id] || 0) + 1 },
      actionLog: [...current.actionLog, { type: '联络', title: `${contact.name} / ${action}`, text: `发出一条明确的联络：${action}` }]
    }));
  }

  function openKnowledge(id) {
    setSelectedKnowledgeId(id);
    setSave((current) => current.readKnowledgeEntryIds.includes(id) ? current : ({
      ...current,
      readKnowledgeEntryIds: [...current.readKnowledgeEntryIds, id]
    }));
  }

  function endWeek() {
    setSave((current) => {
      const nextWeek = current.week + 1;
      const nextPulse = weeklyPulseFor(nextWeek);
      return {
        ...current,
        week: nextWeek,
        attention: current.attentionMax,
        cash: current.cash - 450,
        actionLog: [
          ...current.actionLog,
          { type: '时间', title: `第 ${current.week} 周结束`, text: `固定支出 -450。下一周：${nextPulse.label}。` }
        ]
      };
    });
  }

  if (save.screen === 'title') {
    return <TitleScreen hasSave={Boolean(save.practiceId)} onContinue={continueGame} onNew={startNew} />;
  }

  if (save.screen === 'direction') {
    return <DirectionSelect onSelect={chooseDirection} onBack={() => setSave((current) => ({ ...current, screen: 'title' }))} />;
  }

  const currentStage = deriveProjectStage(save.primaryProject);
  const pulse = weeklyPulseFor(save.week);

  return (
    <div className="wf-shell">
      <header className="wf-header">
        <button className="wf-title-button" onClick={() => setSurface('world')}>新媒体艺术家模拟器</button>
        <div className="wf-header-state">
          <span>第 {save.week} 周</span>
          <span>注意力 {save.attention}/{save.attentionMax}</span>
          <span>¥{save.cash} · {cashPressure(save.cash)}</span>
          <span>{currentStage.label}</span>
        </div>
        <button className="wf-end-week" onClick={endWeek}>结束本周</button>
      </header>

      <div className="wf-app-grid">
        <GlobalNav active={surface} onOpen={openSystem} />
        <main className="wf-main">
          {surface === 'world' && <WorldMap save={save} currentRegion={currentRegion} pulse={pulse} onOpen={openRegion} />}
          {surface === 'projects' && <Projects save={save} stage={currentStage} pulse={pulse} onAction={doProjectAction} onReview={reviewOpportunity} onGoWorld={() => setSurface('world')} />}
          {surface === 'workbench' && <Workbench save={save} practice={practice} learnedSkills={learnedSkills} setSave={setSave} />}
          {surface === 'contacts' && <Contacts save={save} selectedId={selectedContactId} setSelectedId={setSelectedContactId} onAction={contactAction} />}
          {surface === 'archive' && (
            <ArchiveLibrary
              save={save}
              category={knowledgeCategory}
              setCategory={setKnowledgeCategory}
              selectedId={selectedKnowledgeId}
              onOpen={openKnowledge}
            />
          )}
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
              onComplete={completeVenueTest}
            />
          )}
        </main>
      </div>

      <footer className="wf-footer">
        <span>M 地点　P 项目　W 工作台　C 联络　K 档案库</span>
        <button onClick={() => setActionLogOpen(true)}>行动记录 [L] · {save.actionLog.length}</button>
        <span>{currentRegion.scope} / {currentRegion.name}</span>
      </footer>
      {actionLogOpen && <ActionLog entries={save.actionLog} onClose={() => setActionLogOpen(false)} />}
    </div>
  );
}

function TitleScreen({ hasSave, onContinue, onNew }) {
  return (
    <main className="wf-title-screen">
      <div className="wf-title-box">
        <small>NEW MEDIA ARTIST SIMULATOR</small>
        <h1>新媒体艺术家模拟器</h1>
        <p>地点、项目、联络、制作现实和长期档案共同推进。</p>
        <div className="wf-menu">
          <button onClick={onContinue}>{hasSave ? '继续' : '开始'}</button>
          <button onClick={onNew}>新游戏</button>
          <button disabled>设置</button>
        </div>
      </div>
      <div className="wf-version">v0.5 / SYSTEM WIREFRAME</div>
    </main>
  );
}

function DirectionSelect({ onSelect, onBack }) {
  return (
    <main className="wf-direction-screen">
      <div className="wf-page-head"><button onClick={onBack}>← 主菜单</button><h1>从哪里开始</h1><p>只决定第一个项目和起始能力，不锁职业。</p></div>
      <div className="wf-direction-list">
        {practices.map((item, index) => {
          const starter = starterProjectsByPractice[item.id];
          return (
            <button key={item.id} onClick={() => onSelect(item.id)}>
              <span>{String(index + 1).padStart(2, '0')} / {item.shortName}</span>
              <strong>{item.name.replace('实践', '')}</strong>
              <p>{starter?.question || item.description}</p>
              <small>{item.vocabulary.slice(0, 4).join(' / ')}</small>
            </button>
          );
        })}
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

function WorldMap({ save, currentRegion, pulse, onOpen }) {
  const adjacent = currentRegion.adjacentIds
    .map((id) => spatialRegions.find((region) => region.id === id)?.name)
    .filter(Boolean);
  const incoming = opportunitySeeds.slice(0, 4);
  return (
    <section className="wf-world-layout">
      <div className="wf-map-column">
        <div className="wf-section-head"><h2>地点</h2><span>上海为主层 / 外部线路逐步出现</span></div>
        <div className="wf-map-scroll">
          <div className="wf-map">
            <div className="wf-map-label label-shanghai">上海</div>
            <div className="wf-map-label label-outside">外部线路</div>
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
                  <small>{region.scope}</small><strong>{region.name}</strong><em>{region.shortName}</em>{locked && <i>未建立路线</i>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <aside className="wf-side">
        <section className="wf-panel">
          <small>THIS WEEK</small><h3>{pulse.label}</h3><p>{pulse.pressure}</p><p>{pulse.worldSignal}</p>
        </section>
        <TaskBook save={save} />
        <section className="wf-panel wf-inbox">
          <h3>传入</h3>
          {incoming.map((item) => <article key={item.id}><small>{item.deadline}</small><strong>{item.title}</strong><p>{item.source}</p></article>)}
        </section>
        <section className="wf-panel">
          <h3>当前位置</h3>
          <small>{currentRegion.scope} / {currentRegion.shortName}</small>
          <strong>{currentRegion.name}</strong>
          <p>{currentRegion.description}</p>
          <label>可继续前往</label><p>{adjacent.join(' / ') || '—'}</p>
        </section>
      </aside>
    </section>
  );
}

function TaskBook({ save }) {
  return (
    <section className="wf-panel"><h3>{save.menuBook.title}</h3>{save.menuBook.goals.map((goal) => <div key={goal.id} className="wf-task">[{goal.done ? 'x' : ' '}] {goal.label}</div>)}</section>
  );
}

function Projects({ save, stage, pulse, onAction, onReview, onGoWorld }) {
  const project = save.primaryProject;
  return (
    <section className="wf-page">
      <div className="wf-page-head"><h1>项目</h1><p>项目不是经验条。它必须逐渐变得更清楚、更稳定、更能进入空间，也更容易被别人重新搭起来。</p></div>
      <div className="wf-project-top">
        <section className="wf-panel wf-current-project">
          <small>ACTIVE / {stage.label}</small><h2>{project.name}</h2><p className="wf-project-question">{project.question}</p>
          <div className="wf-metric-row">
            <Metric label="一致性" value={project.coherence} />
            <Metric label="稳定性" value={project.stability} />
            <Metric label="场地适配" value={project.siteFit} />
            <Metric label="文档" value={project.documentation} />
          </div>
          <label>阶段</label><p>{stage.description}</p>
          <label>这个阶段会打开</label><p>{stage.unlocks.join(' / ')}</p>
          <label>当前方法</label><p>{project.methods.join(' / ')}</p>
        </section>
        <div>
          <section className="wf-panel"><small>WEEK {save.week}</small><h3>{pulse.label}</h3><p>{pulse.pressure}</p></section>
          <TaskBook save={save} />
        </div>
      </div>

      <div className="wf-section-head wf-project-board-head"><h2>下一步怎么做</h2><span>每个动作只解决一种问题</span></div>
      <div className="wf-opportunity-grid">
        {projectActions.map((action) => (
          <article key={action.id} className="wf-opportunity">
            <header><small>项目动作</small><strong>{action.label}</strong><span>-{action.cost} 注意力</span></header>
            <p>{action.description}</p>
            {action.id === 'site-test'
              ? <button onClick={onGoWorld}>去地点找真实场地 →</button>
              : <button disabled={save.attention < action.cost} onClick={() => onAction(action.id)}>{action.label} / -{action.cost}</button>}
          </article>
        ))}
      </div>

      <div className="wf-section-head wf-project-board-head"><h2>机会板</h2><span>价值和风险由项目状态重新解释</span></div>
      <div className="wf-opportunity-grid">
        {opportunitySeeds.map((item) => {
          const readiness = opportunityReadiness(item.id, project, save.week, save.cash);
          const reviewed = save.reviewedOpportunityIds.includes(item.id);
          return (
            <article key={item.id} className="wf-opportunity">
              <header><small>{readiness.ready ? '现在可进入' : '条件不足'}</small><strong>{item.title}</strong><span>{item.deadline}</span></header>
              <p>{item.source} · {item.place}</p>
              <dl><dt>可能有用</dt><dd>{item.value}</dd><dt>真正风险</dt><dd>{item.risk}</dd></dl>
              <p><strong>{reviewed ? '判断结果' : '当前判断'}</strong>：{readiness.reason}</p>
              <button disabled={save.attention < 1} onClick={() => onReview(item.id)}>{reviewed ? '重新判断' : '花 1 注意力判断'}</button>
            </article>
          );
        })}
      </div>
      <section className="wf-panel wf-project-history"><h3>项目脉络</h3>{project.history.map((entry, index) => <p key={`${entry}-${index}`}>{String(index + 1).padStart(2, '0')} / {entry}</p>)}</section>
    </section>
  );
}

function Metric({ label, value }) {
  return <div><small>{label}</small><strong>{value}/4</strong></div>;
}

function Workbench({ save, practice, learnedSkills, setSave }) {
  const tier = computeTiers[1];
  const services = relevantSpecialistServices(save.practiceId);
  function optimize() {
    if (save.cash < 900) return;
    setSave((current) => ({
      ...current,
      cash: current.cash - 900,
      primaryProject: { ...current.primaryProject, stability: Math.min(4, current.primaryProject.stability + 1) },
      actionLog: [...current.actionLog, { type: '工作台', title: '输出链整理', text: '花费 ¥900；稳定性 +1。' }]
    }));
  }
  return (
    <section className="wf-page">
      <div className="wf-page-head"><h1>工作台</h1><p>管理自己拥有的制作能力。专业服务按项目需要出现，不占据地图。</p></div>
      <div className="wf-workbench">
        <section className="wf-panel">
          <small>LOCAL</small><h3>制作设备</h3>
          <strong>x86 Desktop / {tier.label}</strong><p>{tier.enables.join(' / ')}</p>
          <button onClick={optimize}>整理输出链 / ¥900</button>
        </section>
        <section className="wf-panel">
          <small>PRACTICE</small><h3>已掌握能力</h3>
          <strong>{practice?.name.replace('实践', '')}</strong>
          {learnedSkills.map((skill) => <div key={skill.id} className="wf-skill"><span>{skill.family}</span>{skill.name}</div>)}
        </section>
        <section className="wf-panel wf-services">
          <small>ON DEMAND</small><h3>按需服务</h3>
          {services.length ? services.map((service) => (
            <article key={service.id}><strong>{service.name}</strong><p>{service.description}</p><small>{service.functions.join(' / ')}</small></article>
          )) : <p>当前项目没有需要外部调用的技术服务。</p>}
        </section>
        <section className="wf-panel wf-toolbox">
          <small>CHECKLIST</small><h3>制作检查</h3>
          <div>[{save.primaryProject.documentation >= 1 ? 'x' : ' '}] 技术单 / 项目说明</div>
          <div>[{save.primaryProject.siteFit >= 1 ? 'x' : ' '}] 场地尺寸 / 观看距离</div>
          <div>[{save.primaryProject.stability >= 2 ? 'x' : ' '}] 连续运行测试</div>
          <div>[{save.primaryProject.stability >= 3 ? 'x' : ' '}] 备份方案</div>
          <div>[{save.primaryProject.documentation >= 2 ? 'x' : ' '}] 现场记录</div>
          <div>[{deriveProjectStage(save.primaryProject).id === 'archive' ? 'x' : ' '}] 可恢复档案</div>
        </section>
      </div>
    </section>
  );
}

function Contacts({ save, selectedId, setSelectedId, onAction }) {
  const selected = contactSeeds.find((item) => item.id === selectedId) || contactSeeds[0];
  const region = spatialRegions.find((item) => item.id === selected.regionId);
  return (
    <section className="wf-page">
      <div className="wf-page-head"><h1>联络</h1><p>谁知道什么、你们之间还有什么没解决、下一次为什么要联系。</p></div>
      <div className="wf-contact-layout">
        <nav className="wf-contact-list">
          {contactSeeds.map((contact) => (
            <button key={contact.id} className={contact.id === selected.id ? 'active' : ''} onClick={() => setSelectedId(contact.id)}>
              <small>{contact.state}</small><strong>{contact.name}</strong><span>{contact.role}</span>
            </button>
          ))}
        </nav>
        <section className="wf-panel wf-contact-detail">
          <small>{selected.state} · {region?.name || '未知地点'}</small>
          <h2>{selected.name}</h2><strong>{selected.role}</strong>
          <label>最近一句</label><blockquote>{selected.lastMessage}</blockquote>
          <label>没结束的事</label><p>{selected.openThread}</p>
          <label>本轮联络</label><p>{save.contactTouches[selected.id] || 0} 次</p>
          <label>现在可以联系他做什么</label>
          <div className="wf-contact-actions">
            {selected.canAsk.map((action) => <button key={action} disabled={save.attention < 1} onClick={() => onAction(selected, action)}>{action} / -1</button>)}
          </div>
          <div className="wf-tag-row">{selected.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        </section>
        <aside className="wf-panel">
          <h3>网络说明</h3>
          <p>同一个人可以同时是同行、供应商、朋友、项目入口或风险来源。</p>
          <p>联络次数不会直接变成“好感度”。真正有用的是尚未解决的事和下一次能交换什么。</p>
        </aside>
      </div>
    </section>
  );
}

function ArchiveLibrary({ save, category, setCategory, selectedId, onOpen }) {
  const filtered = category === '全部' ? knowledgeEntries : knowledgeEntries.filter((entry) => entry.category === category);
  const selected = knowledgeById.get(selectedId) || knowledgeEntries[0];
  const related = selected.relatedIds.map((id) => knowledgeById.get(id)).filter(Boolean);
  return (
    <section className="wf-page wf-archive-page">
      <div className="wf-page-head"><h1>档案库</h1><p>词条、方法、行业说明和世界背景。行动记录是另一套东西。</p></div>
      <div className="wf-knowledge-layout">
        <nav className="wf-knowledge-categories">
          <strong>分类</strong>
          {knowledgeCategories.map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}
          <div className="wf-knowledge-progress"><small>已阅读</small><strong>{save.readKnowledgeEntryIds.length}/{knowledgeEntries.length}</strong></div>
          <div className="wf-knowledge-progress"><small>旧研究空间模板</small><strong>{legacyResearchSpaceTemplates.length}</strong></div>
        </nav>
        <div className="wf-knowledge-list">
          {filtered.map((entry) => {
            const read = save.readKnowledgeEntryIds.includes(entry.id);
            return <button key={entry.id} className={entry.id === selected.id ? 'active' : ''} onClick={() => onOpen(entry.id)}><small>{entry.category} · {read ? '已读' : '未读'}</small><strong>{entry.title}</strong></button>;
          })}
        </div>
        <article className="wf-knowledge-reader">
          <header><small>{selected.category} / ENTRY</small><h2>{selected.title}</h2><p>{selected.summary}</p></header>
          {selected.body.map((paragraph, index) => <p key={`${selected.id}-${index}`}>{paragraph}</p>)}
          <div className="wf-tag-row">{selected.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          <section className="wf-related"><h3>相关词条</h3>{related.map((entry) => <button key={entry.id} onClick={() => onOpen(entry.id)}>→ {entry.title}</button>)}</section>
        </article>
      </div>
    </section>
  );
}

function Location({ region, selectedFacilityId, setSelectedFacilityId, onBack, onSpend, onVenue }) {
  const facilities = region.facilityIds.map((id) => facilityById.get(id)).filter(Boolean);
  const selected = facilityById.get(selectedFacilityId) || facilities[0];
  return (
    <section className="wf-page">
      <div className="wf-page-head"><button onClick={onBack}>← 地点</button><small>{region.scope} / {region.shortName}</small><h1>{region.name}</h1><p>{region.description}</p></div>
      <div className="wf-location-layout">
        <div className="wf-local-map">
          <div className="wf-section-head"><h2>区域内部</h2><span>地点之间也有位置关系</span></div>
          <div className="wf-local-map-board">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {facilities.flatMap((facility) => facility.adjacentIds.map((id) => {
                const target = facilityById.get(id);
                if (!target || facility.id > target.id) return null;
                return <line key={`${facility.id}-${id}`} x1={facility.x} y1={facility.y} x2={target.x} y2={target.y} />;
              }))}
            </svg>
            {facilities.map((facility) => (
              <button key={facility.id} className={`wf-local-node ${facility.id === selected?.id ? 'active' : ''}`} style={{ left: `${facility.x}%`, top: `${facility.y}%` }} onClick={() => setSelectedFacilityId(facility.id)}>
                <small>{facility.kind}</small><strong>{facility.name}</strong>
              </button>
            ))}
          </div>
        </div>
        <div className="wf-location-main">
          <section className="wf-panel wf-facility-detail">
            <small>{selected?.kind}</small><h2>{selected?.name}</h2><p>{selected?.description}</p>
            <label>这里会出现</label><p>{selected?.functions.join(' / ')}</p>
            <div className="wf-location-actions">
              <button onClick={() => onSpend(1, { type: '地点', title: selected?.name || '地点', text: `${region.name} / 做了一次现场行动。` })}>在这里行动 / -1</button>
            </div>
          </section>
          <ContextEvent facility={selected} onSpend={onSpend} onVenue={onVenue} />
        </div>
      </div>
    </section>
  );
}

function ContextEvent({ facility, onSpend, onVenue }) {
  if (!facility) return null;
  if (facility.functions.includes('open-call')) {
    return (
      <article className="wf-text-event">
        <small>公开信息 / 截止 5 天</small><h2>一份征集只写了主题、三张图和“提供一定制作支持”。</h2>
        <p>真正要查的是：制作费、安装期、技术支持、版权和最后到底要交什么。</p>
        <div className="wf-decisions">
          <button onClick={() => onSpend(1, { type: '判断', title: '拆征集条件', text: '先查支持条件和责任边界。' })}><b>1</b><span>先把支持条件查清</span><small>-1</small></button>
          <button onClick={() => onSpend(2, { type: '申请', title: '做申请版本', text: '把当前项目压成一页可以提交的版本。' })}><b>2</b><span>直接整理申请版本</span><small>-2</small></button>
        </div>
      </article>
    );
  }
  if (facility.functions.includes('client') || facility.functions.includes('scope')) {
    return (
      <article className="wf-text-event">
        <small>会议进行到 47 分钟</small><h2>“视觉这块没问题。顺便服务器、播控和现场网络也一起包了吧？”</h2>
        <p>报价没有变，责任范围正在变。</p>
        <div className="wf-decisions">
          <button onClick={() => onSpend(1, { type: 'Scope', title: '把新增内容列出来', text: '要求新增责任进入范围与报价。' })}><b>1</b><span>把新增内容列成 Scope</span><small>-1</small></button>
          <button onClick={() => onSpend(0, { type: 'Scope', title: '先不答应', text: '不在会议里口头吞下新的责任。' })}><b>2</b><span>先不口头答应</span><small>0</small></button>
        </div>
      </article>
    );
  }
  if (facility.functions.includes('logistics') || facility.functions.includes('transport')) {
    return (
      <article className="wf-text-event">
        <small>物流 / 当天 17:40</small><h2>箱子能装下设备，但进不了货梯。</h2>
        <p>效果图里没有货梯，报价里也没有第二次搬运。</p>
        <div className="wf-decisions">
          <button onClick={() => onSpend(1, { type: '后勤', title: '重做运输路径', text: '重新确认尺寸、重量和进场路线。' })}><b>1</b><span>重新确认运输路径</span><small>-1</small></button>
          <button onClick={() => onSpend(2, { type: '后勤', title: '改结构', text: '把设备拆成可以分批进入的模块。' })}><b>2</b><span>把结构改成可拆模块</span><small>-2</small></button>
        </div>
      </article>
    );
  }
  if (facility.functions.includes('venue-preview')) {
    return (
      <article className="wf-text-event">
        <small>场地空档 / 2 小时</small><h2>这里今天没有正式活动，可以把项目接上真实输出跑一次。</h2>
        <p>没人要求把它做漂亮。两小时只用来发现桌面上看不见的问题。</p>
        <div className="wf-decisions"><button onClick={onVenue}><b>1</b><span>进入场地预演</span><small>→</small></button></div>
      </article>
    );
  }
  if (facility.functions.includes('conversation') || facility.functions.includes('network')) {
    return (
      <article className="wf-text-event">
        <small>消息 / 14:20</small><h2>有人提到一个项目，但他说不清预算，也不知道是谁最终决定。</h2>
        <p>这不是“接 / 不接”的二选一。先判断消息离真正的项目有多远。</p>
        <div className="wf-decisions">
          <button onClick={() => onSpend(1, { type: '联络', title: '追问信息源', text: '先确认是谁组织、什么时候、有什么支持。' })}><b>1</b><span>问清是谁在组织</span><small>-1</small></button>
          <button onClick={() => onSpend(0, { type: '判断', title: '记下线索', text: '不立即投入，只保留这条消息。' })}><b>2</b><span>先记着，不投入</span><small>0</small></button>
        </div>
      </article>
    );
  }
  return <article className="wf-empty-event"><small>当前没有强事件</small><p>地点仍然可以用于工作、观察或触发后续条件。</p></article>;
}

function VenueTest({ save, facilityId, onBack, onSpend, onComplete }) {
  const facility = facilityById.get(facilityId);
  function run(preset) {
    if (!onSpend(2, { type: '预演', title: `${facility?.name || '场地'} / ${preset.name}`, text: `测试 ${preset.spec}。` })) return;
    onComplete(preset);
  }
  return (
    <section className="wf-page">
      <div className="wf-page-head"><button onClick={onBack}>← {facility?.name || '地点'}</button><small>场地 / 输出关系</small><h1>场地预演</h1><p>{save.primaryProject.name} · 先把空间问题暴露出来。</p></div>
      <div className="wf-venue-grid">{VENUE_PRESETS.map((preset) => <button key={preset.id} onClick={() => run(preset)}><small>{preset.spec}</small><strong>{preset.name}</strong><pre>{preset.diagram}</pre><p>{preset.note}</p><span>运行测试 / 注意力 -2</span></button>)}</div>
    </section>
  );
}

function ActionLog({ entries, onClose }) {
  return (
    <div className="wf-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="wf-log-drawer">
        <header><div><small>ACTIVITY LOG</small><h2>行动记录</h2></div><button onClick={onClose}>关闭 [L]</button></header>
        <p className="wf-log-note">这里只记录“你做过什么”。词条、说明和可阅读内容在档案库。</p>
        <div className="wf-log-list">{entries.slice().reverse().map((entry, index) => <article key={`${entry.title}-${index}`}><small>{entry.type}</small><strong>{entry.title}</strong><p>{entry.text}</p></article>)}</div>
      </aside>
    </div>
  );
}
