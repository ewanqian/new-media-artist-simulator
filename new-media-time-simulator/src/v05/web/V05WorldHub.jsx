import { useEffect, useMemo, useState } from 'react';
import {
  computeTiers,
  practices,
  sampleOpportunities,
  skills,
  worldNodes
} from '../model.ts';
import './v05.css';

const SAVE_KEY = 'nmas-v05-world-hub-preview';

const facilityCopy = {
  'shared-studio': ['共享工位 B-201', '制作 / 同行', '旧电源、共享桌面和一台不知道是谁留下的投影机。'],
  'river-diner': ['江边大排档', '关系 / 文本', '真理论和假豪言在这里拥有相同的桌号。'],
  'loading-dock': ['后门装卸区', '设备 / 运输', '二手设备、临时借用和不应该出现在这里的航空箱。'],
  'pitch-room': ['提案会议室', '商业 / 沟通', '每一页演示稿都在努力让预算看起来合理。'],
  'black-box': ['黑盒测试场', 'Stage Forge', '灯光、投影、声音、控制信号和人的耐心一起被测试。'],
  'production-yard': ['制作后场', '制作 / 团队', '供应商、线材、时间表和临时增加的需求在这里相遇。'],
  'lecture-hall': ['理论讲堂', '研究 / 语言', '观点很多，真正能改变项目的也许只有一句。'],
  gallery: ['学院展厅', '展览 / 机构', '安静的白盒里，施工、文字和位置都不会真正安静。'],
  'open-call-office': ['征集办公室', '机会 / 申请', '所有申请看起来都只有最后三天。'],
  'compute-rack': ['算力机架', 'Compute', '风扇和缓存组成一种非常具体的创作环境。'],
  'preview-node': ['预演代理站', 'Test', '提前失败，通常比现场失败便宜。'],
  'recovery-bay': ['数据抢救间', 'Archive', '损坏文件并不总是消失，只是换了一种存在方式。'],
  hangar: ['旧机库展场', '大型空间', '你终于拥有了尺度，也终于开始按米烧钱。'],
  'media-desk': ['媒体接待区', '传播 / 叙事', '一句话说得太完整，也可能是另一种误读。'],
  'production-office': ['制作办公室', '机构 / 制作', '真正决定作品能不能发生的文件通常不在展厅里。'],
  'residency-lab': ['驻留实验室', '研究 / 制作', '陌生城市把你熟悉的方法重新变得可疑。'],
  'border-cafe': ['边界咖啡馆', '关系 / 偶遇', '合作、误会、翻译和短暂联盟在这里发生。'],
  'project-room': ['项目房间', '独立制作', '一间临时属于你的房间，时间也临时属于你。']
};

const iconPaths = {
  eye: '<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.6"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M15 10h6v5h-6a2.5 2.5 0 0 1 0-5Z"/>',
  map: '<path d="m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2Z"/><path d="M9 4v14M15 6v14"/>',
  archive: '<path d="M4 8h16v12H4zM3 4h18v4H3z"/><path d="M9 12h6"/>',
  arrow: '<path d="M5 12h13M14 8l4 4-4 4"/>',
  back: '<path d="M19 12H6M10 8l-4 4 4 4"/>',
  grid: '<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/>',
  tool: '<path d="M14 6a4 4 0 0 0-5 5L4 16l4 4 5-5a4 4 0 0 0 5-5l-3 3-3-3Z"/>',
  play: '<path d="m8 5 11 7-11 7Z"/>',
  book: '<path d="M4 5h7a3 3 0 0 1 3 3v11H7a3 3 0 0 0-3 1Z"/><path d="M20 5h-3a3 3 0 0 0-3 3v11h3a3 3 0 0 1 3 1Z"/>'
};

function Icon({ name, size = 16 }) {
  return (
    <svg className="v05-icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: iconPaths[name] || iconPaths.grid }} />
  );
}

function freshSave() {
  return {
    screen: 'title',
    practiceId: null,
    week: 1,
    attention: 6,
    attentionMax: 6,
    cash: 3200,
    worldLevel: 1,
    currentNodeId: 'hub-cafe',
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
      id: 'menu-01',
      title: 'MENU 01 — BOOT / 第一个可运行版本',
      goals: [
        { id: 'g1', label: '在工作台查看当前项目', done: false },
        { id: 'g2', label: '进入任意一个真实地点', done: false },
        { id: 'g3', label: '完成一次 Stage Forge 测试', done: false }
      ]
    },
    learnedSkillIds: [],
    archive: [
      { type: 'system', title: 'SAVE CREATED', text: '你的职业史会从这里开始累积。' }
    ],
    news: [
      'WEEK 01 · 榕树湾工作区仍然有空位。',
      'FIELD · 深港黑盒测试场本周开放一次短时测试。',
      'SYSTEM · 2026.08 WORLD PACK loaded.'
    ]
  };
}

export default function V05WorldHub() {
  const [save, setSave] = useState(() => freshSave());
  const [surface, setSurface] = useState('map');
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(0);
  const [toast, setToast] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.practiceId) setSave({ ...freshSave(), ...parsed, screen: 'title' });
      }
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
        setArchiveOpen((current) => !current);
      }
      if (event.key === 'Escape') {
        if (archiveOpen) setArchiveOpen(false);
        else if (surface !== 'map') setSurface('map');
      }
      if (key === 'm' && save.screen === 'map') setSurface('map');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [archiveOpen, save.screen, surface]);

  const practice = useMemo(() => practices.find((item) => item.id === save.practiceId), [save.practiceId]);
  const learnedSkills = useMemo(() => skills.filter((skill) => save.learnedSkillIds.includes(skill.id)), [save.learnedSkillIds]);
  const currentNode = worldNodes.find((node) => node.id === save.currentNodeId) || worldNodes[0];

  const persistGoal = (goalId) => {
    setSave((current) => ({
      ...current,
      menuBook: {
        ...current.menuBook,
        goals: current.menuBook.goals.map((goal) => goal.id === goalId ? { ...goal, done: true } : goal)
      }
    }));
  };

  const selectPractice = (practiceId) => {
    const selected = practices.find((item) => item.id === practiceId);
    const next = freshSave();
    next.screen = 'map';
    next.practiceId = practiceId;
    next.learnedSkillIds = selected.starterSkills;
    next.archive.push({ type: 'practice', title: selected.name, text: `起始实践：${selected.description}` });
    setSave(next);
    setSurface('map');
  };

  const continueGame = () => {
    if (!save.practiceId) {
      setSave((current) => ({ ...current, screen: 'practice' }));
      return;
    }
    setSave((current) => ({ ...current, screen: 'map' }));
    setSurface('map');
  };

  const newGame = () => {
    localStorage.removeItem(SAVE_KEY);
    setSave({ ...freshSave(), screen: 'practice' });
    setSurface('map');
  };

  const openNode = (node) => {
    if (node.unlockAt > save.worldLevel) {
      setToast(`需要完成更多 Menu Book 才能进入 ${node.name}`);
      window.setTimeout(() => setToast(''), 1600);
      return;
    }
    setSave((current) => ({ ...current, currentNodeId: node.id }));
    setSelectedFacility(0);
    if (node.kind === 'cafe') setSurface('cafe');
    else if (node.kind === 'workbench') { setSurface('workbench'); persistGoal('g1'); }
    else if (node.kind === 'stage-forge') setSurface('stage');
    else if (node.kind === 'exchange') setSurface('exchange');
    else if (node.kind === 'archive') setArchiveOpen(true);
    else { setSurface('location'); persistGoal('g2'); }
  };

  const spendAttention = (amount, archiveEntry) => {
    if (save.attention < amount) {
      setToast('本周注意力不够。可以自由浏览，但不能继续执行这个行动。');
      window.setTimeout(() => setToast(''), 1800);
      return false;
    }
    setSave((current) => ({
      ...current,
      attention: current.attention - amount,
      archive: archiveEntry ? [...current.archive, archiveEntry] : current.archive
    }));
    return true;
  };

  const endWeek = () => {
    setSave((current) => ({
      ...current,
      week: current.week + 1,
      attention: current.attentionMax,
      cash: current.cash - 450,
      archive: [...current.archive, { type: 'time', title: `WEEK ${current.week} CLOSED`, text: '工作室与生活支出 -450。注意力恢复。' }]
    }));
    setToast('进入下一周 · Attention restored');
    window.setTimeout(() => setToast(''), 1600);
  };

  if (save.screen === 'title') {
    return <TitleScreen hasSave={Boolean(save.practiceId)} onContinue={continueGame} onNew={newGame} />;
  }

  if (save.screen === 'practice') {
    return <PracticeSelect onSelect={selectPractice} onBack={() => setSave((current) => ({ ...current, screen: 'title' }))} />;
  }

  return (
    <div className="v05-shell">
      <div className="v05-ambient" aria-hidden="true"><i/><i/><i/></div>
      <Header save={save} practice={practice} onArchive={() => setArchiveOpen(true)} onMap={() => setSurface('map')} />
      <div className="v05-news-ribbon"><span>WORLD FEED</span><div>{save.news.join('  ·  ')}</div></div>

      <main className="v05-main">
        {surface === 'map' && <WorldMap save={save} onOpen={openNode} />}
        {surface === 'cafe' && <Cafe save={save} practice={practice} onBack={() => setSurface('map')} onSpend={spendAttention} />}
        {surface === 'workbench' && <Workbench save={save} practice={practice} skills={learnedSkills} onBack={() => setSurface('map')} setSave={setSave} />}
        {surface === 'stage' && <StageForge save={save} onBack={() => setSurface('map')} onSpend={spendAttention} onComplete={() => persistGoal('g3')} />}
        {surface === 'exchange' && <Exchange save={save} onBack={() => setSurface('map')} setSave={setSave} />}
        {surface === 'location' && <LocationSurface node={currentNode} save={save} selected={selectedFacility} setSelected={setSelectedFacility} onBack={() => setSurface('map')} onSpend={spendAttention} />}
      </main>

      <footer className="v05-footer">
        <div className="v05-key-hints"><span>M 世界地图</span><span>A 实践档案</span><span>Esc 返回</span></div>
        <button className="v05-week-button" onClick={endWeek}>结束本周 <Icon name="arrow" /></button>
      </footer>

      {archiveOpen && <ArchiveDrawer save={save} practice={practice} onClose={() => setArchiveOpen(false)} />}
      {toast && <div className="v05-toast">{toast}</div>}
    </div>
  );
}

function TitleScreen({ hasSave, onContinue, onNew }) {
  return (
    <div className="v05-title-screen">
      <div className="v05-title-grid" aria-hidden="true" />
      <div className="v05-title-mark">NMAS / 05</div>
      <div className="v05-title-center">
        <div className="v05-title-kicker">A PLAYABLE ART ECOSYSTEM</div>
        <h1>NEW MEDIA<br/>ARTIST SIMULATOR</h1>
        <p>新媒体艺术家模拟器</p>
        <div className="v05-title-actions">
          <button className="v05-primary" onClick={onContinue}>{hasSave ? 'CONTINUE PRACTICE' : 'START PRACTICE'}</button>
          <button onClick={onNew}>NEW PROFILE</button>
        </div>
      </div>
      <div className="v05-title-bottom"><span>WORLD BUILD 2026.08</span><span>v0.5 FRAMEWORK TEST</span><span>Web / Mobile</span></div>
    </div>
  );
}

function PracticeSelect({ onSelect, onBack }) {
  return (
    <div className="v05-practice-select">
      <button className="v05-back top-left" onClick={onBack}><Icon name="back"/> TITLE</button>
      <header>
        <span>PROFILE / STARTING PRACTICE</span>
        <h2>你从哪里开始工作？</h2>
        <p>这不是职业锁定。它只决定第一批技能、语言和工作条件；之后可以自由混合。</p>
      </header>
      <div className="v05-practice-grid">
        {practices.map((item, index) => (
          <button key={item.id} className="v05-practice-card" onClick={() => onSelect(item.id)}>
            <span className="v05-card-index">0{index + 1}</span>
            <strong>{item.name}</strong>
            <p>{item.description}</p>
            <div className="v05-vocab">{item.vocabulary.slice(0, 4).map((word) => <span key={word}>{word}</span>)}</div>
            <small>{item.startingKit}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function Header({ save, practice, onArchive, onMap }) {
  return (
    <header className="v05-header">
      <button className="v05-brand" onClick={onMap}><span>NMAS</span><strong>WORLD</strong></button>
      <div className="v05-profile-line"><span>{practice?.shortName || 'PRACTICE'}</span><strong>WEEK {String(save.week).padStart(2, '0')}</strong></div>
      <div className="v05-resource-line">
        <div><Icon name="eye"/><span>ATTENTION</span><strong>{save.attention}/{save.attentionMax}</strong></div>
        <div><Icon name="wallet"/><span>CASH</span><strong>¥{save.cash}</strong></div>
        <button onClick={onArchive} aria-label="打开实践档案"><Icon name="archive"/><span>ARCHIVE</span></button>
      </div>
    </header>
  );
}

function WorldMap({ save, onOpen }) {
  return (
    <section className="v05-world-screen">
      <div className="v05-map-copy">
        <span>WORLD MAP / PRACTICE ECOLOGY</span>
        <h2>你现在生活在这些关系之间。</h2>
        <p>浏览地图不消耗注意力。真正行动才会。</p>
      </div>
      <div className="v05-map-stage">
        <svg className="v05-map-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {worldNodes.flatMap((node) => node.adjacentIds.map((adjacentId) => {
            const target = worldNodes.find((item) => item.id === adjacentId);
            if (!target || node.id > target.id) return null;
            return <line key={`${node.id}-${target.id}`} x1={node.x} y1={node.y} x2={target.x} y2={target.y} />;
          }))}
        </svg>
        {worldNodes.map((node) => {
          const locked = node.unlockAt > save.worldLevel;
          const current = node.id === save.currentNodeId;
          return (
            <button key={node.id}
              className={`v05-map-node kind-${node.kind} ${locked ? 'is-locked' : ''} ${current ? 'is-current' : ''}`}
              style={{ left: `${node.x}%`, top: `${node.y}%`, '--node-depth': node.depth }}
              onClick={() => onOpen(node)}>
              <i>{locked ? '·' : node.icon}</i>
              <span>{node.shortName}</span>
              {!locked && node.unlockAt === save.worldLevel && node.id !== 'hub-cafe' && <b>NEW</b>}
            </button>
          );
        })}
        <div className="v05-map-focus-ring" aria-hidden="true" />
      </div>
      <MenuBookMini save={save} />
    </section>
  );
}

function MenuBookMini({ save }) {
  const complete = save.menuBook.goals.filter((goal) => goal.done).length;
  return (
    <aside className="v05-menu-mini">
      <div className="v05-mini-label"><Icon name="book"/> CURRENT MENU</div>
      <strong>{save.menuBook.title}</strong>
      <div className="v05-menu-goals">
        {save.menuBook.goals.map((goal) => <span key={goal.id} className={goal.done ? 'done' : ''}>{goal.done ? '✓' : '○'} {goal.label}</span>)}
      </div>
      <small>{complete}/{save.menuBook.goals.length} COMPLETE</small>
    </aside>
  );
}

function SurfaceFrame({ eyebrow, title, subtitle, onBack, children, aside }) {
  return (
    <section className="v05-surface">
      <div className="v05-surface-top">
        <button className="v05-back" onClick={onBack}><Icon name="back"/> WORLD MAP</button>
        <span>{eyebrow}</span>
      </div>
      <div className="v05-surface-heading"><h2>{title}</h2><p>{subtitle}</p></div>
      <div className={`v05-surface-content ${aside ? 'with-aside' : ''}`}>
        <div>{children}</div>
        {aside && <aside>{aside}</aside>}
      </div>
    </section>
  );
}

function Cafe({ save, practice, onBack, onSpend }) {
  const opportunity = sampleOpportunities[0];
  const skillSet = new Set(save.learnedSkillIds);
  const reveal = Object.entries(opportunity.skillReveals).find(([skillId]) => skillSet.has(skillId));
  return (
    <SurfaceFrame eyebrow="CAFÉ / NOTEBOOK" title="交叉口咖啡馆" subtitle="主任务、消息、对话和机会在这里被组织成可阅读的生活。" onBack={onBack}
      aside={<MenuBookMini save={save} />}>
      <article className="v05-narrative">
        <div className="v05-narrative-meta"><span>MESSAGE / 14:20</span><span>FIELD INVITATION</span></div>
        <h3>“黑盒测试场周四晚上空两个小时。你要不要把那个系统带来跑一下？”</h3>
        <p>没有正式展览，也没有漂亮的策展主题。场地提供主投影和基础声音，制作费 ¥1800。三天后要给技术单。</p>
        {reveal && <div className="v05-insight"><span>{skills.find((s) => s.id === reveal[0])?.name}</span>{reveal[1]}</div>}
        <div className="v05-dialogue-actions">
          <button onClick={() => onSpend(1, { type: 'read', title: '读一次机会', text: '你没有立即答应，而是先判断它能不能真正推进当前项目。' })}><b>READ</b><span>先判断它是不是值得去</span><small>1 Attention</small></button>
          <button onClick={() => onSpend(2, { type: 'talk', title: '确认黑盒测试', text: '你答应测试，但先把输出、声音和撤场条件问清楚。' })}><b>TALK</b><span>确认测试，并提前问清技术条件</span><small>2 Attention</small></button>
          <button onClick={() => onSpend(0, { type: 'decline', title: '暂不接', text: '你没有因为“有机会”就自动接受。' })}><b>PASS</b><span>这周不接，把注意力留给当前项目</span><small>0 Attention</small></button>
        </div>
      </article>
      <div className="v05-cafe-bottom"><span>你的起始语言：</span>{practice?.vocabulary.map((word) => <i key={word}>{word}</i>)}</div>
    </SurfaceFrame>
  );
}

function Workbench({ save, practice, skills: learnedSkills, onBack, setSave }) {
  const project = save.primaryProject;
  const tier = computeTiers[1];
  const upgrade = () => {
    if (save.cash < 900) return;
    setSave((current) => ({
      ...current,
      cash: current.cash - 900,
      primaryProject: { ...current.primaryProject, stability: Math.min(4, current.primaryProject.stability + 1) },
      archive: [...current.archive, { type: 'workbench', title: 'Output Chain upgraded', text: '没有追求更高参数，而是让项目的输出链更稳定。' }]
    }));
  };
  return (
    <SurfaceFrame eyebrow="WORKBENCH / PROJECT BUILD" title="工作台" subtitle="这里不管理背包。这里只回答：你正在做什么，以及现在的制作条件够不够。" onBack={onBack}>
      <div className="v05-workbench-grid">
        <article className="v05-project-machine">
          <div className="v05-machine-top"><span>PRIMARY PROJECT</span><b>BUILD 0{project.stability + project.coherence}</b></div>
          <h3>{project.name}</h3>
          <p>{project.question}</p>
          <div className="v05-project-meters">
            <Metric label="Coherence" value={project.coherence}/><Metric label="Stability" value={project.stability}/><Metric label="Site Fit" value={project.siteFit}/><Metric label="Documentation" value={project.documentation}/>
          </div>
          <div className="v05-method-row">{project.methods.map((method) => <span key={method}>{method}</span>)}</div>
        </article>
        <article className="v05-rig-card">
          <span>STUDIO RIG</span><h3>x86 Desktop / {tier.label}</h3><p>{tier.description}</p>
          <div className="v05-enable-list">{tier.enables.map((item) => <span key={item}>✓ {item}</span>)}</div>
          <button onClick={upgrade}>优化输出链 <small>¥900 · Stability +1</small></button>
        </article>
        <article className="v05-practice-card-static">
          <span>PRACTICE BUILD</span><h3>{practice?.name}</h3><p>{practice?.description}</p>
          <div className="v05-skill-list">{learnedSkills.map((skill) => <span key={skill.id}><b>{skill.family.toUpperCase()}</b>{skill.name}</span>)}</div>
        </article>
      </div>
    </SurfaceFrame>
  );
}

function Metric({ label, value }) {
  return <div><span>{label}</span><i>{[1,2,3,4].map((n) => <b key={n} className={n <= value ? 'on' : ''} />)}</i></div>;
}

function StageForge({ save, onBack, onSpend, onComplete }) {
  const run = (scene) => {
    if (!onSpend(2, { type: 'stage', title: `${scene} test`, text: '项目第一次被放进一个具体空间条件里测试。' })) return;
    onComplete();
  };
  return (
    <SurfaceFrame eyebrow="STAGE FORGE / SCENE SIMULATOR" title="场景铸造" subtitle="项目不是在面板里升级，而是在真实场景条件里暴露问题。" onBack={onBack}>
      <div className="v05-stage-hero">
        <div className="v05-stage-visual"><div className="v05-screen-a"/><div className="v05-screen-b"/><div className="v05-floor-grid"/><span>PREVIS / SIGNAL ONLINE</span></div>
        <div className="v05-stage-readout"><span>PROJECT</span><strong>{save.primaryProject.name}</strong><dl><div><dt>OUTPUT</dt><dd>01</dd></div><div><dt>STABILITY</dt><dd>{save.primaryProject.stability}/4</dd></div><div><dt>ATTENTION</dt><dd>2</dd></div></dl></div>
      </div>
      <div className="v05-scene-cards">
        <button onClick={() => run('BLACK BOX')}><span>01 / AVAILABLE</span><strong>BLACK BOX</strong><p>单主投影、基础声音、短时观众测试。</p></button>
        <button className="locked"><span>02 / MENU 04</span><strong>LIVE STAGE</strong><p>多输出、灯光、实时节奏和演出容错。</p></button>
        <button className="locked"><span>03 / MENU 05</span><strong>GALLERY</strong><p>长期运行、安装、文档和空间关系。</p></button>
      </div>
    </SurfaceFrame>
  );
}

function Exchange({ save, onBack, setSave }) {
  const items = [
    { id: 'g70', name: 'Compute Module G70', price: 2400, text: '达到复杂实时图形和多输出的稳定工作线。' },
    { id: 'portable-output', name: 'Portable Multi-output', price: 850, text: '让移动工作站可以更可靠地进入演出现场。' },
    { id: 'used-router', name: 'Used Network Node', price: 260, text: '有使用痕迹，但比现场临时找路由器可靠。' }
  ];
  const buy = (item) => {
    if (save.cash < item.price) return;
    setSave((current) => ({ ...current, cash: current.cash - item.price, archive: [...current.archive, { type: 'equipment', title: item.name, text: `在设备交换所购入，¥${item.price}。` }] }));
  };
  return (
    <SurfaceFrame eyebrow="EXCHANGE / CAPABILITY" title="设备交换所" subtitle="不模拟品牌收藏。只出售能够改变作品能力边界的设备。" onBack={onBack}>
      <div className="v05-exchange-list">{items.map((item) => <article key={item.id}><span>{item.id.toUpperCase()}</span><h3>{item.name}</h3><p>{item.text}</p><button onClick={() => buy(item)}>¥{item.price}</button></article>)}</div>
    </SurfaceFrame>
  );
}

function LocationSurface({ node, save, selected, setSelected, onBack, onSpend }) {
  const facilities = node.facilities.map((id) => ({ id, copy: facilityCopy[id] || [id, 'FIELD', node.description] }));
  const opportunity = sampleOpportunities.find((item) => item.locationId === node.id);
  return (
    <SurfaceFrame eyebrow={`LOCATION / ${node.shortName}`} title={node.name} subtitle={node.description} onBack={onBack}>
      <div className="v05-location-rail">
        {facilities.map((facility, index) => (
          <button key={facility.id} className={selected === index ? 'selected' : ''} onClick={() => setSelected(index)}>
            <span>{String(index + 1).padStart(2, '0')} / {facility.copy[1]}</span><strong>{facility.copy[0]}</strong><p>{facility.copy[2]}</p>
          </button>
        ))}
      </div>
      <div className="v05-location-detail">
        <div><span>CURRENT POSITION</span><h3>{facilities[selected]?.copy[0]}</h3><p>{facilities[selected]?.copy[2]}</p></div>
        <div className="v05-field-actions">
          <button onClick={() => onSpend(1, { type: 'field', title: `READ / ${node.name}`, text: '你先观察了这里真正的工作条件。' })}><b>READ</b><span>观察这个场所怎么运作</span><small>1 Attention</small></button>
          <button onClick={() => onSpend(2, { type: 'field', title: `MAKE / ${node.name}`, text: '你把当前项目推进了一小步，并留下了具体场域记录。' })}><b>MAKE</b><span>在这里推进当前项目</span><small>2 Attention</small></button>
        </div>
      </div>
      {opportunity && <OpportunityStrip opportunity={opportunity} save={save} />}
    </SurfaceFrame>
  );
}

function OpportunityStrip({ opportunity, save }) {
  const revealed = Object.entries(opportunity.skillReveals).filter(([skillId]) => save.learnedSkillIds.includes(skillId));
  return (
    <section className="v05-opportunity-strip"><div><span>OPPORTUNITY DETECTED</span><strong>{opportunity.title}</strong><p>{opportunity.publicFacts.join(' · ')}</p></div>{revealed.length > 0 && <div className="v05-reveals">{revealed.slice(0,2).map(([id,text]) => <span key={id}><b>{skills.find((skill) => skill.id === id)?.name}</b>{text}</span>)}</div>}</section>
  );
}

function ArchiveDrawer({ save, practice, onClose }) {
  return (
    <div className="v05-archive-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside className="v05-archive-drawer">
        <header><div><span>PRACTICE ARCHIVE</span><h2>这不是背包，是你已经发生过的事。</h2></div><button onClick={onClose}>×</button></header>
        <div className="v05-archive-profile"><span>PROFILE</span><strong>{practice?.name}</strong><p>WEEK {save.week} · {save.primaryProject.name}</p></div>
        <div className="v05-archive-entries">{save.archive.slice().reverse().map((entry, index) => <article key={`${entry.title}-${index}`}><span>{entry.type}</span><strong>{entry.title}</strong><p>{entry.text}</p></article>)}</div>
        <footer>A / Esc 关闭档案</footer>
      </aside>
    </div>
  );
}
