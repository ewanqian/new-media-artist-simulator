import { useEffect, useMemo, useState } from 'react';
import { computeTiers, practices, skills, worldNodes } from '../model.ts';
import './v05-wireframe.css';

const SAVE_KEY = 'nmas-v05-world-hub-preview';

const NODE_LABELS = {
  'hub-cafe': ['咖啡馆', 'CAFÉ'],
  'hub-workbench': ['工作台', 'WORKBENCH'],
  'hub-stage-forge': ['场地预演', 'VENUE TEST'],
  'hub-exchange': ['设备交换', 'EXCHANGE'],
  'hub-archive': ['档案', 'ARCHIVE']
};

const FACILITY_NAMES = {
  'shared-studio': '共享工位 B-201',
  'river-diner': '江边大排档',
  'loading-dock': '后门装卸区',
  'pitch-room': '提案会议室',
  'black-box': '黑盒测试场',
  'production-yard': '制作后场',
  'lecture-hall': '理论讲堂',
  gallery: '学院展厅',
  'open-call-office': '征集办公室',
  'compute-rack': '算力机架',
  'preview-node': '预演代理站',
  'recovery-bay': '数据抢救间',
  hangar: '旧机库展场',
  'media-desk': '媒体接待区',
  'production-office': '制作办公室',
  'residency-lab': '驻留实验室',
  'border-cafe': '边界咖啡馆',
  'project-room': '项目房间'
};

const VENUE_PRESETS = [
  { id: 'flat', name: '平面屏', spec: '16:9 / 单输出', diagram: '[          SCREEN          ]', note: '基础构图、字幕安全区、单路播放。' },
  { id: 'wide', name: '超宽屏', spec: '32:9 / 双输出', diagram: '[        LEFT | RIGHT        ]', note: '跨屏构图、拼接、双路同步。' },
  { id: 'ring', name: '环形屏', spec: '360° / 多输出', diagram: '(   SCREEN  ·  SCREEN  ·   )', note: '循环内容、接缝、观众方向变化。' },
  { id: 'dome', name: '球幕', spec: 'DOME / FISHEYE', diagram: '        ______\n     .-´      `-.\n    /   DOME     \\n    `------------´', note: '鱼眼构图、地平线、中心畸变。' }
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
    currentNodeId: 'hub-cafe',
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
        { id: 'g1', label: '查看工作台', done: false },
        { id: 'g2', label: '进入一个地点', done: false },
        { id: 'g3', label: '完成一次场地预演', done: false }
      ]
    },
    archive: [{ type: '系统', title: '存档建立', text: '第 1 周。' }]
  };
}

function normalizeSave(raw) {
  const fresh = makeFreshSave();
  if (!raw || typeof raw !== 'object') return fresh;
  return {
    ...fresh,
    ...raw,
    screen: 'title',
    menuBook: fresh.menuBook,
    primaryProject: { ...fresh.primaryProject, ...(raw.primaryProject || {}) },
    archive: Array.isArray(raw.archive) ? raw.archive : fresh.archive
  };
}

function displayNode(node) {
  const override = NODE_LABELS[node.id];
  if (override) return { name: override[0], shortName: override[1] };
  return { name: node.name, shortName: node.shortName };
}

export default function V05Wireframe() {
  const [save, setSave] = useState(makeFreshSave);
  const [surface, setSurface] = useState('map');
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) setSave(normalizeSave(JSON.parse(raw)));
    } catch {}
  }, []);

  useEffect(() => {
    if (save.practiceId) localStorage.setItem(SAVE_KEY, JSON.stringify({ ...save, screen: 'map' }));
  }, [save]);

  useEffect(() => {
    const onKey = (event) => {
      const key = event.key.toLowerCase();
      if (key === 'a') {
        event.preventDefault();
        setArchiveOpen((value) => !value);
      }
      if (key === 'm' && save.screen === 'map') setSurface('map');
      if (event.key === 'Escape') {
        if (archiveOpen) setArchiveOpen(false);
        else setSurface('map');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [archiveOpen, save.screen]);

  const practice = useMemo(() => practices.find((item) => item.id === save.practiceId), [save.practiceId]);
  const learnedSkills = useMemo(() => skills.filter((item) => save.learnedSkillIds.includes(item.id)), [save.learnedSkillIds]);
  const currentNode = worldNodes.find((item) => item.id === save.currentNodeId) || worldNodes[0];

  function startNew() {
    localStorage.removeItem(SAVE_KEY);
    setSave({ ...makeFreshSave(), screen: 'direction' });
    setSurface('map');
  }

  function continueGame() {
    if (!save.practiceId) setSave((current) => ({ ...current, screen: 'direction' }));
    else setSave((current) => ({ ...current, screen: 'map' }));
  }

  function chooseDirection(id) {
    const selected = practices.find((item) => item.id === id);
    const fresh = makeFreshSave();
    fresh.screen = 'map';
    fresh.practiceId = id;
    fresh.learnedSkillIds = selected?.starterSkills || [];
    fresh.archive.push({ type: '起始方向', title: selected?.name || id, text: '作为初始能力与语言入口，不锁定后续发展。' });
    setSave(fresh);
    setSurface('map');
  }

  function finishGoal(id) {
    setSave((current) => ({
      ...current,
      menuBook: { ...current.menuBook, goals: current.menuBook.goals.map((goal) => goal.id === id ? { ...goal, done: true } : goal) }
    }));
  }

  function openNode(node) {
    if (node.unlockAt > save.worldLevel) return;
    setSave((current) => ({ ...current, currentNodeId: node.id }));
    setSelectedFacility(0);
    if (node.id === 'hub-cafe') setSurface('cafe');
    else if (node.id === 'hub-workbench') { setSurface('workbench'); finishGoal('g1'); }
    else if (node.id === 'hub-stage-forge') setSurface('venue');
    else if (node.id === 'hub-exchange') setSurface('exchange');
    else if (node.id === 'hub-archive') setArchiveOpen(true);
    else { setSurface('location'); finishGoal('g2'); }
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
        <button className="wf-title-button" onClick={() => setSurface('map')}>新媒体艺术家模拟器</button>
        <div className="wf-header-state"><span>第 {save.week} 周</span><span>注意力 {save.attention}/{save.attentionMax}</span><span>¥{save.cash}</span></div>
        <div className="wf-header-actions"><button onClick={() => setSurface('map')}>地图</button><button onClick={() => setArchiveOpen(true)}>档案 [A]</button></div>
      </header>

      <main className="wf-main">
        {surface === 'map' && <WorldMap save={save} onOpen={openNode} />}
        {surface === 'cafe' && <Cafe save={save} onBack={() => setSurface('map')} onSpend={spendAttention} />}
        {surface === 'workbench' && <Workbench save={save} practice={practice} learnedSkills={learnedSkills} onBack={() => setSurface('map')} setSave={setSave} />}
        {surface === 'venue' && <VenueTest save={save} onBack={() => setSurface('map')} onSpend={spendAttention} onComplete={() => finishGoal('g3')} />}
        {surface === 'exchange' && <Exchange save={save} onBack={() => setSurface('map')} />}
        {surface === 'location' && <Location node={currentNode} selected={selectedFacility} setSelected={setSelectedFacility} onBack={() => setSurface('map')} onSpend={spendAttention} />}
      </main>

      <footer className="wf-footer"><span>M 地图　A 档案　Esc 返回</span><button onClick={endWeek}>结束本周</button></footer>
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

function WorldMap({ save, onOpen }) {
  return (
    <section className="wf-world-layout">
      <div className="wf-map-column">
        <div className="wf-section-head"><h2>世界地图</h2><span>位置与场所关系 / 低保真</span></div>
        <div className="wf-map-scroll">
          <div className="wf-map">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {worldNodes.flatMap((node) => node.adjacentIds.map((id) => {
                const target = worldNodes.find((item) => item.id === id);
                if (!target || node.id > target.id) return null;
                return <line key={`${node.id}-${id}`} x1={node.x} y1={node.y} x2={target.x} y2={target.y} />;
              }))}
            </svg>
            {worldNodes.map((node) => {
              const label = displayNode(node);
              const locked = node.unlockAt > save.worldLevel;
              return (
                <button key={node.id} className={`wf-node ${locked ? 'locked' : ''} ${node.id === save.currentNodeId ? 'current' : ''}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} onClick={() => onOpen(node)}>
                  <strong>{label.name}</strong><small>{label.shortName}</small>{locked && <i>锁定</i>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <aside className="wf-side">
        <TaskBook save={save} />
        <div className="wf-panel"><h3>当前项目</h3><strong>{save.primaryProject.name}</strong><p>{save.primaryProject.question}</p><div>{save.primaryProject.methods.join(' / ')}</div></div>
      </aside>
    </section>
  );
}

function TaskBook({ save }) {
  return (
    <div className="wf-panel"><h3>{save.menuBook.title}</h3>{save.menuBook.goals.map((goal) => <div key={goal.id} className="wf-task">[{goal.done ? 'x' : ' '}] {goal.label}</div>)}</div>
  );
}

function Frame({ title, onBack, children, side }) {
  return (
    <section className="wf-page"><div className="wf-page-head"><button onClick={onBack}>← 世界地图</button><h1>{title}</h1></div><div className={`wf-page-grid ${side ? 'has-side' : ''}`}><div>{children}</div>{side && <aside>{side}</aside>}</div></section>
  );
}

function Cafe({ save, onBack, onSpend }) {
  return (
    <Frame title="咖啡馆" onBack={onBack} side={<TaskBook save={save} />}>
      <article className="wf-text-event">
        <small>消息 / 周四 14:20</small>
        <h2>“黑盒测试场周四晚上空两个小时。你要不要把那个系统带来跑一下？”</h2>
        <p>场地提供主投影和基础声音。制作费 ¥1800。三天后要给技术单。</p>
        <div className="wf-decisions">
          <button onClick={() => onSpend(1, { type: '判断', title: '查看机会', text: '先判断它能不能推进当前项目。' })}><b>1</b><span>先判断值不值得去</span><small>注意力 -1</small></button>
          <button onClick={() => onSpend(2, { type: '沟通', title: '确认测试', text: '先确认输出、声音和撤场条件。' })}><b>2</b><span>确认测试，先问清技术条件</span><small>注意力 -2</small></button>
          <button onClick={() => onSpend(0, { type: '选择', title: '暂不接', text: '把这周留给当前项目。' })}><b>3</b><span>不接</span><small>注意力 0</small></button>
        </div>
      </article>
    </Frame>
  );
}

function Workbench({ save, practice, learnedSkills, onBack, setSave }) {
  const project = save.primaryProject;
  const tier = computeTiers[1];
  return (
    <Frame title="工作台" onBack={onBack}>
      <div className="wf-workbench">
        <section className="wf-panel"><h3>项目</h3><label>名称</label><strong>{project.name}</strong><label>问题</label><p>{project.question}</p><label>方法</label><p>{project.methods.join(' / ')}</p></section>
        <section className="wf-panel"><h3>制作状态</h3><table><tbody><tr><td>一致性</td><td>{project.coherence}/4</td></tr><tr><td>稳定性</td><td>{project.stability}/4</td></tr><tr><td>场地适配</td><td>{project.siteFit}/4</td></tr><tr><td>文档</td><td>{project.documentation}/4</td></tr></tbody></table></section>
        <section className="wf-panel"><h3>当前设备能力</h3><strong>x86 Desktop / {tier.label}</strong><p>{tier.enables.join(' / ')}</p><button onClick={() => save.cash >= 900 && setSave((current) => ({ ...current, cash: current.cash - 900, primaryProject: { ...current.primaryProject, stability: Math.min(4, current.primaryProject.stability + 1) }, archive: [...current.archive, { type: '工作台', title: '输出链优化', text: '稳定性 +1。' }] }))}>优化输出链 / ¥900</button></section>
        <section className="wf-panel"><h3>已掌握能力</h3><strong>{practice?.name.replace('实践', '')}</strong>{learnedSkills.map((skill) => <div key={skill.id} className="wf-skill"><span>{skill.family}</span>{skill.name}</div>)}</section>
      </div>
    </Frame>
  );
}

function VenueTest({ save, onBack, onSpend, onComplete }) {
  function run(preset) {
    if (!onSpend(2, { type: '预演', title: `${preset.name}测试`, text: `${preset.spec} / ${save.primaryProject.name}` })) return;
    onComplete();
  }
  return (
    <Frame title="场地预演" onBack={onBack}>
      <div className="wf-panel wf-venue-intro"><strong>{save.primaryProject.name}</strong><span>选择一个空间/屏幕规格，检查 mapping 与输出关系。</span></div>
      <div className="wf-venue-grid">{VENUE_PRESETS.map((preset) => <button key={preset.id} onClick={() => run(preset)}><small>{preset.spec}</small><strong>{preset.name}</strong><pre>{preset.diagram}</pre><p>{preset.note}</p><span>运行测试 / 注意力 -2</span></button>)}</div>
    </Frame>
  );
}

function Exchange({ onBack }) {
  return (
    <Frame title="设备交换" onBack={onBack}>
      <div className="wf-panel"><p>这里先不做商店玩法。只保留能力分界。</p><table><tbody><tr><td>G50</td><td>基础实时图形</td></tr><tr><td>G60</td><td>标准制作</td></tr><tr><td>G70</td><td>复杂实时图形 / 多输出</td></tr><tr><td>G80</td><td>大型空间 / 高分辨率预演</td></tr></tbody></table></div>
    </Frame>
  );
}

function Location({ node, selected, setSelected, onBack, onSpend }) {
  const list = node.facilities || [];
  return (
    <Frame title={node.name} onBack={onBack}>
      <div className="wf-location-layout"><nav>{list.map((id, index) => <button key={id} className={index === selected ? 'active' : ''} onClick={() => setSelected(index)}>{FACILITY_NAMES[id] || id}</button>)}</nav><section className="wf-panel"><h3>{FACILITY_NAMES[list[selected]] || list[selected]}</h3><p>{node.description}</p><button onClick={() => onSpend(1, { type: '地点', title: FACILITY_NAMES[list[selected]] || list[selected], text: `${node.name} / 第一次记录。` })}>在这里行动 / 注意力 -1</button></section></div>
    </Frame>
  );
}

function Archive({ save, practice, onClose }) {
  return (
    <div className="wf-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="wf-archive"><header><div><small>ARCHIVE</small><h2>档案</h2></div><button onClick={onClose}>关闭 [A]</button></header><div className="wf-archive-meta">第 {save.week} 周 / {practice?.name.replace('实践', '') || '未选择'} / {save.primaryProject.name}</div><div className="wf-archive-list">{save.archive.slice().reverse().map((entry, index) => <article key={`${entry.title}-${index}`}><small>{entry.type}</small><strong>{entry.title}</strong><p>{entry.text}</p></article>)}</div></aside>
    </div>
  );
}
