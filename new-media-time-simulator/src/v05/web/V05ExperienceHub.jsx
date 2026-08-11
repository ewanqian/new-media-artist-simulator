import { useEffect, useMemo, useState } from 'react';
import { knowledgeEntries } from '../knowledgeBase.ts';
import { archiveExpansion } from '../archiveExpansion.ts';
import { openingEpisode, openingEpisodeProgress } from '../episodeSystem.ts';
import { facilityById, spatialRegions } from '../locationGraph.ts';
import {
  actionCards,
  contactById,
  contactSeeds,
  placeCards,
  satiricalEvents
} from '../legacyDeck.ts';
import {
  CardTextFragments,
  ContactNetworkPanel,
  ExperienceTextStream,
  KnowledgeSourcesPanel,
  PlaceTextFragments
} from './TextEcologyPanels.jsx';
import './v05-experience.css';
import './v05-text-ecology.css';
import './v05-game-hub.css';

const SAVE_KEY = 'nmas-v05-world-hub-preview';
const SCHEMA = 'hub-episode-20260811';

const replyLibrary = {
  'contact-lin': [
    '可以。别发完整提案，发我一个能跑的版本和你自己最不确定的地方。',
    '这周有个很小的空间可能空两晚。我不确定他们有没有预算，但适合测试。'
  ],
  'contact-li-tech': [
    '把输出分辨率、刷新率、接口和备份方式发我。我先看这四个。',
    '下周二晚上可能有两小时空档。你如果只是测试，不需要把整套设备都搬来。'
  ],
  'contact-m': [
    '你现在缺的不是精修照片，是过程结构。先把“搭起来—失败—改掉—再跑”的顺序留住。',
    '可以。小型现场我按半天算，但你先告诉我最需要记录的是结果还是过程。'
  ],
  'contact-qiao': [
    '先把内容制作、硬件、播控、网络、现场值守拆开。每一项都写“包含 / 不包含”。',
    '供应商别只问总价。结构、运输、安装、撤场分别问，不然后面没人知道差价从哪来。'
  ],
  'contact-chen': [
    '可以先发一页。别发作品集首页，直接发你这次想测试什么。',
    '下个月有个撤展后的空档，只有两天。没有制作费，但能用现有投影。'
  ],
  'contact-dai': [
    '能拆，但你先把最大单件尺寸给我。结构图不用漂亮，尺寸必须是真的。',
    '加工和运输我分开估。你如果现场还有二次安装，那个也要单算。'
  ]
};

const regionPlaceMap = {
  'region-putuo-sucreek': ['place-basic-studio', 'place-project-space', 'place-peer-meet'],
  'region-westbund': ['place-blackbox', 'place-institution'],
  'region-huangpu-riverside': ['place-institution', 'place-fair'],
  'region-yangpu': ['place-archive-reading', 'place-peer-meet'],
  'region-songjiang': ['place-fabrication'],
  'region-pudong-zhangjiang': [],
  'region-hongqiao': [],
  'region-hangzhou': [],
  'region-shenzhen': []
};

function freshSave() {
  return {
    schema: SCHEMA,
    screen: 'title',
    week: 1,
    attention: 6,
    attentionMax: 6,
    cash: 3200,
    completedCardIds: [],
    visitedPlaceIds: [],
    discoveredContactIds: [],
    contactThreads: {},
    pendingReplies: [],
    readKnowledgeEntryIds: [],
    primaryProject: null,
    projectMetrics: { coherence: 1, stability: 1, siteFit: 0, documentation: 0 },
    workbench: { compute: 1, output: 1, capture: 0, storage: 1 },
    seenEventIds: [],
    activeEventId: null,
    actionLog: []
  };
}

function normalizeSave(raw) {
  const fresh = freshSave();
  if (!raw || typeof raw !== 'object') return fresh;
  return {
    ...fresh,
    ...raw,
    schema: SCHEMA,
    screen: 'title',
    completedCardIds: Array.isArray(raw.completedCardIds) ? raw.completedCardIds : [],
    visitedPlaceIds: Array.isArray(raw.visitedPlaceIds) ? raw.visitedPlaceIds : [],
    discoveredContactIds: Array.isArray(raw.discoveredContactIds) ? raw.discoveredContactIds : [],
    pendingReplies: Array.isArray(raw.pendingReplies) ? raw.pendingReplies : [],
    readKnowledgeEntryIds: Array.isArray(raw.readKnowledgeEntryIds) ? raw.readKnowledgeEntryIds : [],
    actionLog: Array.isArray(raw.actionLog) ? raw.actionLog : [],
    contactThreads: raw.contactThreads && typeof raw.contactThreads === 'object' ? raw.contactThreads : {},
    workbench: { ...fresh.workbench, ...(raw.workbench || {}) },
    projectMetrics: { ...fresh.projectMetrics, ...(raw.projectMetrics || {}) }
  };
}

function clampMetric(value) {
  return Math.max(0, Math.min(4, value));
}

function metricWord(value, type) {
  const words = {
    coherence: ['模糊', '有线索', '初步清楚', '清楚', '非常明确'],
    stability: ['没跑过', '能启动', '能测试', '基本可靠', '可长期运行'],
    siteFit: ['没进场地', '见过真实尺度', '做过一次测试', '适应多种场地', '场地策略成熟'],
    documentation: ['几乎没有', '有零碎材料', '能交给别人看', '可复现', '可归档']
  };
  return words[type]?.[clampMetric(value)] || String(value);
}

export default function V05ExperienceHub() {
  const [save, setSave] = useState(freshSave);
  const [surface, setSurface] = useState('home');
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [selectedRegionId, setSelectedRegionId] = useState('region-putuo-sucreek');
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [archiveQuery, setArchiveQuery] = useState('');
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState('legacy-basic-studio');
  const [logOpen, setLogOpen] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) setSave(normalizeSave(JSON.parse(raw)));
    } catch {}
  }, []);

  useEffect(() => {
    if (save.screen === 'play') localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  }, [save]);

  const allKnowledge = useMemo(() => [...knowledgeEntries, ...archiveExpansion], []);
  const filteredKnowledge = useMemo(() => {
    const q = archiveQuery.trim().toLowerCase();
    if (!q) return allKnowledge;
    return allKnowledge.filter((item) => `${item.title} ${item.summary} ${item.tags.join(' ')}`.toLowerCase().includes(q));
  }, [allKnowledge, archiveQuery]);
  const selectedKnowledge = useMemo(
    () => allKnowledge.find((item) => item.id === selectedKnowledgeId) || allKnowledge[0],
    [allKnowledge, selectedKnowledgeId]
  );
  const discoveredContacts = useMemo(
    () => save.discoveredContactIds.map(contactById).filter(Boolean),
    [save.discoveredContactIds]
  );
  const episode = useMemo(() => openingEpisodeProgress(save), [save]);
  const phase = episode.completed;

  function flash(title, text) {
    setNotice({ title, text });
    window.setTimeout(() => setNotice(null), 2600);
  }

  function startNew() {
    const next = { ...freshSave(), screen: 'play' };
    localStorage.setItem(SAVE_KEY, JSON.stringify(next));
    setSave(next);
    setSurface('home');
    flash('EP.01 已载入', '工作室、地图、项目、联络、工作台和档案都在这里。当前只需要完成第一节。');
  }

  function continueGame() {
    setSave((current) => ({ ...current, screen: 'play' }));
    setSurface('home');
  }

  function discover(current, ids = []) {
    const nextIds = [...current.discoveredContactIds];
    const threads = { ...current.contactThreads };
    for (const id of ids) {
      if (!nextIds.includes(id)) nextIds.push(id);
      if (!threads[id]) threads[id] = contactById(id)?.openingMessages || [];
    }
    return { ...current, discoveredContactIds: nextIds, contactThreads: threads };
  }

  function maybeTriggerEvent(current, count) {
    if (count < 3 || count % 3 !== 0) return current;
    const currentEpisode = openingEpisodeProgress(current);
    const event = satiricalEvents.find((item) => item.unlockAt <= currentEpisode.completed && !current.seenEventIds.includes(item.id));
    return event ? { ...current, activeEventId: event.id } : current;
  }

  function performCard(card) {
    if (!card || save.attention < card.cost) return;
    setSave((current) => {
      const effect = card.effect || {};
      const seed = !current.primaryProject && card.projectSeed ? card.projectSeed : null;
      let next = {
        ...current,
        attention: current.attention - card.cost,
        cash: current.cash + Number(effect.cash || 0),
        completedCardIds: current.completedCardIds.includes(card.id) ? current.completedCardIds : [...current.completedCardIds, card.id],
        primaryProject: seed ? { ...seed, originCardId: card.id } : current.primaryProject,
        projectMetrics: {
          coherence: clampMetric(current.projectMetrics.coherence + Number(effect.coherence || 0)),
          stability: clampMetric(current.projectMetrics.stability + Number(effect.stability || 0)),
          siteFit: clampMetric(current.projectMetrics.siteFit + Number(effect.siteFit || 0)),
          documentation: clampMetric(current.projectMetrics.documentation + Number(effect.documentation || 0))
        },
        actionLog: [...current.actionLog, { week: current.week, type: '行动', title: card.title, text: card.plain }]
      };
      if (card.discovers?.length) next = discover(next, card.discovers);
      return maybeTriggerEvent(next, next.completedCardIds.length + next.visitedPlaceIds.length);
    });
    setSelectedCardId(null);
  }

  function visitPlace(place) {
    if (!place || save.attention < place.cost) return;
    setSave((current) => {
      const firstVisit = !current.visitedPlaceIds.includes(place.id);
      let project = current.primaryProject;
      if (!project) {
        const source = actionCards.find((item) => current.completedCardIds.includes(item.id) && item.projectSeed)?.projectSeed;
        project = source ? { ...source } : {
          name: '第一个项目',
          question: '把已经做过的行动变成一个能被测试的项目。',
          methods: ['观察', '原型', '记录']
        };
      }
      let next = {
        ...current,
        attention: current.attention - place.cost,
        primaryProject: project,
        visitedPlaceIds: firstVisit ? [...current.visitedPlaceIds, place.id] : current.visitedPlaceIds,
        projectMetrics: {
          ...current.projectMetrics,
          siteFit: clampMetric(current.projectMetrics.siteFit + (firstVisit && (place.kind === '现场' || place.kind === '展示') ? 1 : 0))
        },
        actionLog: [...current.actionLog, { week: current.week, type: '地点', title: place.title, text: place.summary }]
      };
      if (place.discovers?.length) next = discover(next, place.discovers);
      return maybeTriggerEvent(next, next.completedCardIds.length + next.visitedPlaceIds.length);
    });
    setSelectedPlaceId(null);
  }

  function sendContact(contact, ask, askIndex) {
    if (save.attention < 1) return;
    const replies = replyLibrary[contact.id] || ['收到，我看一下。'];
    const reply = replies[askIndex % replies.length];
    setSave((current) => {
      const thread = current.contactThreads[contact.id] || contact.openingMessages;
      return {
        ...current,
        attention: current.attention - 1,
        contactThreads: { ...current.contactThreads, [contact.id]: [...thread, { from: 'you', text: ask }] },
        pendingReplies: [...current.pendingReplies, { contactId: contact.id, dueWeek: current.week + 1, text: reply }],
        actionLog: [...current.actionLog, { week: current.week, type: '联络', title: contact.name, text: ask }]
      };
    });
  }

  function upgradeCapability(key) {
    if (episode.completed < 4 || save.cash < 800 || save.workbench[key] >= 4) return;
    setSave((current) => ({
      ...current,
      cash: current.cash - 800,
      workbench: { ...current.workbench, [key]: Math.min(4, current.workbench[key] + 1) },
      actionLog: [...current.actionLog, { week: current.week, type: '工作台', title: '能力升级', text: `${key} +1 / ¥800` }]
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
      const due = current.pendingReplies.filter((item) => item.dueWeek <= nextWeek);
      const waiting = current.pendingReplies.filter((item) => item.dueWeek > nextWeek);
      const threads = { ...current.contactThreads };
      for (const item of due) {
        const seed = contactById(item.contactId);
        threads[item.contactId] = [...(threads[item.contactId] || seed?.openingMessages || []), { from: 'them', text: item.text }];
      }
      return {
        ...current,
        week: nextWeek,
        attention: current.attentionMax,
        cash: current.cash - 450,
        pendingReplies: waiting,
        contactThreads: threads,
        actionLog: [...current.actionLog, { week: nextWeek, type: '时间', title: `第 ${nextWeek} 周`, text: due.length ? `${due.length} 条回复到了。固定支出 -450。` : '没有重要回复。固定支出 -450。' }]
      };
    });
  }

  function resolveEvent(choice) {
    const event = satiricalEvents.find((item) => item.id === save.activeEventId);
    if (!event) return;
    setSave((current) => ({
      ...current,
      cash: current.cash + Number(choice.cash || 0),
      attention: Math.max(0, Math.min(current.attentionMax, current.attention + Number(choice.attention || 0))),
      activeEventId: null,
      seenEventIds: current.seenEventIds.includes(event.id) ? current.seenEventIds : [...current.seenEventIds, event.id],
      actionLog: [...current.actionLog, { week: current.week, type: '事件', title: event.title, text: `${choice.label}：${choice.result}` }]
    }));
  }

  if (save.screen === 'title') {
    return <TitleScreen hasSave={Boolean(localStorage.getItem(SAVE_KEY))} onStart={startNew} onContinue={continueGame} />;
  }

  const activeEvent = satiricalEvents.find((item) => item.id === save.activeEventId);
  const navItems = [
    ['home', '首页'], ['episode', 'EPISODE'], ['map', '地图'], ['studio', '工作室'],
    ['project', '项目'], ['contacts', '联络'], ['workbench', '工作台'], ['archive', '档案']
  ];

  return (
    <div className="vx-shell gh-shell">
      <header className="vx-topbar gh-topbar">
        <button className="vx-brand" onClick={() => setSurface('home')}>新媒体艺术家模拟器</button>
        <div className="vx-stats">
          <span>第 {save.week} 周</span>
          <span>注意力 {save.attention}/{save.attentionMax}</span>
          <span>¥{save.cash}</span>
          <span>{openingEpisode.code} · {episode.completed}/{episode.total}</span>
        </div>
        <div className="vx-top-actions"><button onClick={() => setLogOpen(true)}>记录</button><button className="vx-primary-small" onClick={endWeek}>结束本周</button></div>
      </header>

      <main className="vx-content gh-content">
        {surface === 'home' && <HomeHub save={save} episode={episode} onOpen={setSurface} onOpenRegion={(id) => { setSelectedRegionId(id); setSurface('map'); }} />}
        {surface === 'episode' && <EpisodePage save={save} episode={episode} onOpen={setSurface} />}
        {surface === 'map' && <MapPage save={save} episode={episode} selectedRegionId={selectedRegionId} setSelectedRegionId={setSelectedRegionId} onOpenPlace={setSelectedPlaceId} />}
        {surface === 'studio' && <StudioPage save={save} phase={phase} onOpenCard={setSelectedCardId} />}
        {surface === 'project' && <ProjectPage save={save} phase={phase} onOpenCard={setSelectedCardId} onGoStudio={() => setSurface('studio')} />}
        {surface === 'contacts' && <ContactsPage save={save} contacts={discoveredContacts} selectedId={selectedContactId || discoveredContacts[0]?.id} onSelect={setSelectedContactId} onSend={sendContact} onGoMap={() => setSurface('map')} />}
        {surface === 'workbench' && <WorkbenchPage save={save} episode={episode} onUpgrade={upgradeCapability} />}
        {surface === 'archive' && <ArchivePage save={save} entries={filteredKnowledge} selected={selectedKnowledge} query={archiveQuery} setQuery={setArchiveQuery} onOpen={openKnowledge} />}
      </main>

      <nav className="vx-ornament gh-nav" aria-label="主要系统">
        {navItems.map(([id, label]) => <button key={id} className={surface === id ? 'active' : ''} onClick={() => setSurface(id)}>{label}</button>)}
      </nav>

      {selectedCardId && <CardSheet card={actionCards.find((item) => item.id === selectedCardId)} week={save.week} disabled={save.attention < (actionCards.find((item) => item.id === selectedCardId)?.cost || 0)} onClose={() => setSelectedCardId(null)} onDo={performCard} />}
      {selectedPlaceId && <PlaceSheet place={placeCards.find((item) => item.id === selectedPlaceId)} week={save.week} disabled={save.attention < (placeCards.find((item) => item.id === selectedPlaceId)?.cost || 0)} onClose={() => setSelectedPlaceId(null)} onVisit={visitPlace} />}
      {activeEvent && <EventSheet event={activeEvent} onChoose={resolveEvent} />}
      {logOpen && <LogSheet entries={save.actionLog} onClose={() => setLogOpen(false)} />}
      {notice && <div className="vx-unlock"><small>SYSTEM</small><strong>{notice.title}</strong><span>{notice.text}</span></div>}
    </div>
  );
}

function TitleScreen({ hasSave, onStart, onContinue }) {
  return <main className="vx-title"><div className="vx-title-glow" /><section className="vx-title-card"><small>NEW MEDIA ARTIST SIMULATOR</small><h1>新媒体艺术家模拟器</h1><p>一个完整的实践系统，从第一张 EP 开始。</p><div className="vx-title-actions"><button className="vx-primary" onClick={onStart}>开始新的实践</button>{hasSave && <button onClick={onContinue}>继续</button>}</div></section><div className="vx-title-note">v0.5 · HUB / EPISODE FRAMEWORK</div></main>;
}

function HomeHub({ save, episode, onOpen, onOpenRegion }) {
  const active = episode.active;
  const modules = [
    { id: 'studio', code: 'STUDIO', title: '工作室', value: `${actionCards.filter((item) => item.unlockAt <= episode.completed).length} 个行动`, note: '制作、研究、生存。' },
    { id: 'map', code: 'WORLD', title: '地图 / 空间', value: `${save.visitedPlaceIds.length} 个已去地点`, note: '地点不是卡片目录，而是世界关系。' },
    { id: 'project', code: 'PROJECT', title: '项目', value: save.primaryProject?.name || '尚未形成', note: '问题、方法、稳定、场地、文档。' },
    { id: 'contacts', code: 'NETWORK', title: '联络', value: `${save.discoveredContactIds.length} 人`, note: '遇见、消息、协作与回流。' },
    { id: 'workbench', code: 'BUILD', title: '工作台', value: `C${save.workbench.compute} / O${save.workbench.output} / S${save.workbench.storage}`, note: '像 GT 改装一样，只升级项目真正需要的能力。' },
    { id: 'archive', code: 'KNOWLEDGE', title: '档案 / 学习', value: `${save.readKnowledgeEntryIds.length} 已读`, note: '方法、旧空间、术语和后来填入的文本库。' }
  ];
  return <section className="vx-page gh-home"><div className="gh-home-head"><div><small>HOME / PRACTICE OS</small><h1>当前实践</h1><p>系统都在这里。当前只需要推进一节。</p></div><button className="gh-episode-focus" onClick={() => onOpen('episode')}><small>{openingEpisode.code} · {episode.completed}/{episode.total}</small><strong>{active?.index}. {active?.title}</strong><span>{active?.objective}</span><i style={{ width: `${episode.ratio * 100}%` }} /></button></div><div className="gh-dashboard"><section className="gh-map-preview"><header><small>WORLD</small><strong>空间网络</strong><button onClick={() => onOpen('map')}>打开地图 →</button></header><MiniMap episode={episode} onOpenRegion={onOpenRegion} /></section><section className="gh-module-grid">{modules.map((module) => <button key={module.id} className="gh-module" onClick={() => onOpen(module.id)}><small>{module.code}</small><h2>{module.title}</h2><strong>{module.value}</strong><p>{module.note}</p><span>进入 →</span></button>)}</section></div>{save.completedCardIds.length > 0 && <ExperienceTextStream save={save} title="当前世界信号" limit={3} />}</section>;
}

function MiniMap({ episode, onOpenRegion }) {
  return <div className="gh-mini-map"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{spatialRegions.flatMap((region) => region.adjacentIds.map((id) => { const target = spatialRegions.find((item) => item.id === id); if (!target || region.id > target.id) return null; return <line key={`${region.id}-${id}`} x1={region.x} y1={region.y} x2={target.x} y2={target.y} />; }))}</svg>{spatialRegions.map((region) => { const locked = region.unlockAt > Math.max(1, episode.completed); return <button key={region.id} className={locked ? 'locked' : ''} style={{ left: `${region.x}%`, top: `${region.y}%` }} onClick={() => !locked && onOpenRegion(region.id)} title={region.name}><span>{region.name}</span></button>; })}</div>;
}

function EpisodePage({ save, episode, onOpen }) {
  const routeFor = { 'ep01-01': 'studio', 'ep01-02': 'map', 'ep01-03': 'project', 'ep01-04': 'contacts', 'ep01-05': 'workbench' };
  return <section className="vx-page"><PageHead eyebrow="EPISODE / 01" title={openingEpisode.title} text={openingEpisode.note} /><div className="gh-episode-layout"><div className="gh-episode-track">{episode.chapters.map((chapter) => <article key={chapter.id} className={`${chapter.done ? 'done' : ''} ${episode.active?.id === chapter.id ? 'active' : ''}`}><div className="gh-track-index">{String(chapter.index).padStart(2, '0')}</div><div><small>{chapter.subtitle}</small><h2>{chapter.title}</h2><p>{chapter.objective}</p><div className="gh-opens">OPEN · {chapter.opens.join(' / ')}</div></div><div className="gh-track-state">{chapter.done ? '完成' : episode.active?.id === chapter.id ? '当前' : '后续'}</div></article>)}</div><aside className="gh-episode-side"><small>NOW PLAYING</small><h2>{episode.complete ? 'EP.01 完成' : `${episode.active?.index}. ${episode.active?.title}`}</h2><p>{episode.complete ? '第一段完整实践已经形成。下一张 EP 可以开始进入更复杂的项目、机构与空间。' : episode.active?.objective}</p>{!episode.complete && <button className="vx-primary" onClick={() => onOpen(routeFor[episode.active?.id] || 'home')}>去做这一节</button>}<dl><dt>工作室行动</dt><dd>{save.completedCardIds.length}</dd><dt>去过地点</dt><dd>{save.visitedPlaceIds.length}</dd><dt>认识的人</dt><dd>{save.discoveredContactIds.length}</dd><dt>已读档案</dt><dd>{save.readKnowledgeEntryIds.length}</dd></dl></aside></div></section>;
}

function MapPage({ save, episode, selectedRegionId, setSelectedRegionId, onOpenPlace }) {
  const selected = spatialRegions.find((region) => region.id === selectedRegionId) || spatialRegions[0];
  const placeIds = regionPlaceMap[selected.id] || [];
  const linkedPlaces = placeIds.map((id) => placeCards.find((place) => place.id === id)).filter(Boolean).filter((place) => place.unlockAt <= Math.max(1, episode.completed));
  const facilities = selected.facilityIds.map((id) => facilityById.get(id)).filter(Boolean);
  return <section className="vx-page"><PageHead eyebrow="WORLD / SPACE" title="地图" text="世界入口从一开始就存在；路线和地点内容随 EP 推进逐渐建立。" /><div className="gh-map-layout"><div className="gh-world-map"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{spatialRegions.flatMap((region) => region.adjacentIds.map((id) => { const target = spatialRegions.find((item) => item.id === id); if (!target || region.id > target.id) return null; return <line key={`${region.id}-${id}`} x1={region.x} y1={region.y} x2={target.x} y2={target.y} />; }))}</svg>{spatialRegions.map((region) => { const locked = region.unlockAt > Math.max(1, episode.completed); return <button key={region.id} className={`${locked ? 'locked' : ''} ${selected.id === region.id ? 'active' : ''}`} style={{ left: `${region.x}%`, top: `${region.y}%` }} onClick={() => !locked && setSelectedRegionId(region.id)}><small>{region.scope}</small><strong>{region.name}</strong>{locked && <span>未建立路线</span>}</button>; })}</div><aside className="gh-region-panel"><small>{selected.scope} / {selected.shortName}</small><h2>{selected.name}</h2><p>{selected.description}</p><div className="gh-facilities"><label>空间节点</label>{facilities.map((facility) => <span key={facility.id}>{facility.name}</span>)}</div><div className="gh-linked-places"><label>当前可进入</label>{linkedPlaces.length ? linkedPlaces.map((place) => <button key={place.id} onClick={() => onOpenPlace(place.id)}><strong>{place.title}</strong><span>{save.visitedPlaceIds.includes(place.id) ? '去过' : `-${place.cost} 注意力`}</span></button>) : <p>框架已建立，具体地点文本与行动后续填入。</p>}</div></aside></div></section>;
}

function StudioPage({ save, phase, onOpenCard }) {
  const studioCards = actionCards.filter((item) => item.category === 'studio' && item.unlockAt <= phase);
  const incomeCards = actionCards.filter((item) => item.category === 'income' && item.unlockAt <= phase);
  return <section className="vx-page"><PageHead eyebrow="STUDIO" title="工作室" text="卡片只是行动。工作室本身是长期系统。" /><CardGrid cards={studioCards} save={save} onOpen={onOpenCard} />{incomeCards.length > 0 && <><div className="vx-section-title"><h2>现金流</h2><span>项目之外也要活下去</span></div><CardGrid cards={incomeCards} save={save} onOpen={onOpenCard} /></>}{save.completedCardIds.length > 0 && <ExperienceTextStream save={save} title="工作室之外" limit={2} />}</section>;
}

function ProjectPage({ save, phase, onOpenCard, onGoStudio }) {
  const projectCards = actionCards.filter((item) => item.category === 'project' && item.unlockAt <= phase);
  if (!save.primaryProject) return <section className="vx-page"><PageHead eyebrow="PROJECT" title="项目" text="系统入口已经存在，但你还没有让任何东西真正形成项目。" /><EmptyModule code="PROJECT / NOT FORMED" title="先做出一个东西" text="完成一次工作室行动，项目会从实际行为里长出来。" action="去工作室" onAction={onGoStudio} /></section>;
  return <section className="vx-page"><PageHead eyebrow="PROJECT" title={save.primaryProject.name} text={save.primaryProject.question} /><section className="vx-project-summary"><MetricBox label="问题" value={metricWord(save.projectMetrics.coherence, 'coherence')} /><MetricBox label="运行" value={metricWord(save.projectMetrics.stability, 'stability')} /><MetricBox label="场地" value={metricWord(save.projectMetrics.siteFit, 'siteFit')} /><MetricBox label="文档" value={metricWord(save.projectMetrics.documentation, 'documentation')} /></section><div className="vx-methods">{save.primaryProject.methods?.map((method) => <span key={method}>{method}</span>)}</div><div className="vx-section-title"><h2>下一步</h2><span>一次解决一个问题</span></div><CardGrid cards={projectCards} save={save} onOpen={onOpenCard} /><ExperienceTextStream save={save} title="项目周围的声音" limit={3} /></section>;
}

function ContactsPage({ save, contacts, selectedId, onSelect, onSend, onGoMap }) {
  const selected = contacts.find((item) => item.id === selectedId) || contacts[0];
  if (!selected) return <section className="vx-page"><PageHead eyebrow="NETWORK" title="联络" text="入口一直存在，但人不会预装进来。" /><EmptyModule code="NETWORK / EMPTY" title="还没有真正认识的人" text="去工作室、项目空间或现场；人会随着实际相遇进入网络。" action="去地图" onAction={onGoMap} /></section>;
  const thread = save.contactThreads[selected.id] || selected.openingMessages;
  return <section className="vx-page"><PageHead eyebrow="NETWORK" title="联络" text="不是通讯录，也不是好感度。" /><div className="vx-contact-layout"><nav className="vx-contact-list">{contacts.map((contact) => <button key={contact.id} className={contact.id === selected.id ? 'active' : ''} onClick={() => onSelect(contact.id)}><strong>{contact.name}</strong><span>{contact.role}</span></button>)}</nav><article className="vx-contact-main"><header><small>{selected.role}</small><h2>{selected.name}</h2><p>{selected.background}</p><div className="vx-how-met">认识方式 · {selected.howMet}</div></header><div className="vx-chat">{thread.map((message, index) => <div key={`${message.text}-${index}`} className={`vx-message ${message.from}`}><small>{message.from === 'you' ? '你' : message.from === 'them' ? selected.name : '记录'}</small><p>{message.text}</p></div>)}</div><div className="vx-ask-row">{selected.asks.map((ask, index) => <button key={ask} disabled={save.attention < 1} onClick={() => onSend(selected, ask, index)}>{ask}<span>-1</span></button>)}</div><ContactNetworkPanel contact={selected} week={save.week} /></article></div></section>;
}

function WorkbenchPage({ save, episode, onUpgrade }) {
  const items = [
    { key: 'compute', name: '电脑 / Compute', note: '实时图形、编码、重建和生成系统。' },
    { key: 'output', name: '输出 / Output', note: '屏幕、投影、信号与预演能力。' },
    { key: 'capture', name: '采集 / Capture', note: '摄影、扫描、传感和输入。' },
    { key: 'storage', name: '存储 / Storage', note: '素材、版本、备份和归档。' }
  ];
  const enabled = episode.completed >= 4;
  return <section className="vx-page"><PageHead eyebrow="WORKBENCH / BUILD" title="工作台" text="像 GT 的改装：入口一直在，但升级应该由项目需求推动。" />{!enabled && <div className="gh-lock-note"><strong>可查看，暂不可升级</strong><span>完成 EP.01 第 4 节「建立协作」后开放第一次升级。</span></div>}<div className="vx-workbench-grid">{items.map((item) => <article key={item.key} className="vx-capability"><small>LEVEL {save.workbench[item.key]}</small><h2>{item.name}</h2><p>{item.note}</p><div className="vx-levels">{[1,2,3,4].map((level) => <i key={level} className={save.workbench[item.key] >= level ? 'on' : ''} />)}</div><button disabled={!enabled || save.cash < 800 || save.workbench[item.key] >= 4} onClick={() => onUpgrade(item.key)}>升级 · ¥800</button></article>)}</div></section>;
}

function ArchivePage({ save, entries, selected, query, setQuery, onOpen }) {
  return <section className="vx-page vx-archive"><PageHead eyebrow="ARCHIVE / LEARNING" title="档案 / 学习" text="旧空间文本以后全部可以继续填入；现在先把它当作长期知识层。" /><div className="vx-archive-layout"><aside className="vx-archive-index"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索词条" /><div className="vx-archive-count">已读 {save.readKnowledgeEntryIds.length} / {knowledgeEntries.length + archiveExpansion.length}</div><div className="vx-entry-list">{entries.map((entry) => <button key={entry.id} className={entry.id === selected.id ? 'active' : ''} onClick={() => onOpen(entry.id)}><small>{entry.category} · {save.readKnowledgeEntryIds.includes(entry.id) ? '已读' : '未读'}</small><strong>{entry.title}</strong><span>{entry.summary}</span></button>)}</div></aside><article className="vx-reader"><small>{selected.category}</small><h2>{selected.title}</h2><p className="vx-lead">{selected.summary}</p>{selected.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}<div className="vx-tag-row">{selected.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><KnowledgeSourcesPanel knowledgeId={selected.id} week={save.week} /></article></div></section>;
}

function PageHead({ eyebrow, title, text }) { return <header className="vx-page-head"><small>{eyebrow}</small><h1>{title}</h1>{text && <p>{text}</p>}</header>; }
function MetricBox({ label, value }) { return <div><span>{label}</span><strong>{value}</strong></div>; }
function EmptyModule({ code, title, text, action, onAction }) { return <section className="gh-empty"><small>{code}</small><h2>{title}</h2><p>{text}</p><button onClick={onAction}>{action} →</button></section>; }
function CardGrid({ cards, save, onOpen }) { return <div className="vx-card-grid">{cards.map((card) => <button className="vx-card" key={card.id} onClick={() => onOpen(card.id)}><div className="vx-card-meta"><span>{card.tags[0]}</span><b>-{card.cost} 注意力</b></div><h2>{card.title}</h2><p>{card.summary}</p><div className="vx-card-foot"><span>{card.tags.slice(1).join(' · ')}</span><em>{save.completedCardIds.includes(card.id) ? '做过' : '打开'}</em></div></button>)}</div>; }

function CardSheet({ card, week, disabled, onClose, onDo }) {
  if (!card) return null;
  return <div className="vx-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><article className="vx-sheet"><button className="vx-close" onClick={onClose}>×</button><div className="vx-sheet-meta"><span>{card.tags.join(' · ')}</span><b>-{card.cost} 注意力</b></div><h1>{card.title}</h1><p className="vx-sheet-lead">{card.summary}</p><section><small>说明</small><p>{card.detail}</p></section><section><small>大白话</small><p>{card.plain}</p></section>{card.satire && <section className="vx-satire"><small>旁注</small><p>{card.satire}</p></section>}<CardTextFragments cardId={card.id} week={week} /><button className="vx-primary vx-sheet-action" disabled={disabled} onClick={() => onDo(card)}>执行这张卡</button></article></div>;
}

function PlaceSheet({ place, week, disabled, onClose, onVisit }) {
  if (!place) return null;
  return <div className="vx-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><article className="vx-sheet"><button className="vx-close" onClick={onClose}>×</button><div className="vx-sheet-meta"><span>{place.kind}</span><b>-{place.cost} 注意力</b></div><h1>{place.title}</h1><p className="vx-sheet-lead">{place.summary}</p><section><small>这里是什么</small><p>{place.detail}</p></section><section><small>信息透明</small><ul className="vx-transparent">{place.transparent.map((line) => <li key={line}>{line}</li>)}</ul></section><section><small>可以做</small><p>{place.actions.join(' · ')}</p></section><PlaceTextFragments placeId={place.id} week={week} /><button className="vx-primary vx-sheet-action" disabled={disabled} onClick={() => onVisit(place)}>去一次</button></article></div>;
}

function EventSheet({ event, onChoose }) { return <div className="vx-backdrop vx-event-backdrop"><article className="vx-sheet vx-event-sheet"><small>特殊事件</small><h1>{event.title}</h1><section><small>正式话语</small><p>{event.formal}</p></section><section><small>大白话</small><p>{event.plain}</p></section><section className="vx-satire"><small>黑色幽默</small><p>{event.satire}</p></section><div className="vx-event-choices">{event.choices.map((choice) => <button key={choice.label} onClick={() => onChoose(choice)}><strong>{choice.label}</strong><span>{choice.result}</span></button>)}</div></article></div>; }
function LogSheet({ entries, onClose }) { return <div className="vx-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><aside className="vx-log"><header><div><small>ACTIVITY</small><h2>行动记录</h2></div><button onClick={onClose}>关闭</button></header><div>{entries.slice().reverse().map((entry, index) => <article key={`${entry.title}-${index}`}><small>第 {entry.week} 周 · {entry.type}</small><strong>{entry.title}</strong><p>{entry.text}</p></article>)}</div></aside></div>; }
