import { useEffect, useMemo, useState } from 'react';
import { knowledgeEntries } from '../knowledgeBase.ts';
import { archiveExpansion } from '../archiveExpansion.ts';
import {
  actionCards,
  contactById,
  contactSeeds,
  placeCards,
  placeKinds,
  satiricalEvents,
  unlockSteps
} from '../legacyDeck.ts';
import './v05-experience.css';

const SAVE_KEY = 'nmas-v05-world-hub-preview';
const SCHEMA = 'card-first-20260811';

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

function freshSave() {
  return {
    schema: SCHEMA,
    screen: 'title',
    week: 1,
    attention: 6,
    attentionMax: 6,
    cash: 3200,
    guideStep: 0,
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
  if (raw.schema === SCHEMA) return { ...fresh, ...raw, screen: 'title' };
  return {
    ...fresh,
    week: Number(raw.week || 1),
    attention: Number(raw.attention || 6),
    attentionMax: Number(raw.attentionMax || 6),
    cash: Number(raw.cash || 3200),
    screen: 'title'
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

export default function V05Experience() {
  const [save, setSave] = useState(freshSave);
  const [surface, setSurface] = useState('studio');
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [placeKind, setPlaceKind] = useState('全部');
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [archiveQuery, setArchiveQuery] = useState('');
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState('legacy-basic-studio');
  const [logOpen, setLogOpen] = useState(false);
  const [unlockNotice, setUnlockNotice] = useState(null);

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
  const selectedKnowledge = useMemo(
    () => allKnowledge.find((item) => item.id === selectedKnowledgeId) || allKnowledge[0],
    [allKnowledge, selectedKnowledgeId]
  );
  const filteredKnowledge = useMemo(() => {
    const q = archiveQuery.trim().toLowerCase();
    if (!q) return allKnowledge;
    return allKnowledge.filter((item) => `${item.title} ${item.summary} ${item.tags.join(' ')}`.toLowerCase().includes(q));
  }, [allKnowledge, archiveQuery]);

  const visiblePlaces = useMemo(() => {
    return placeCards.filter((item) => item.unlockAt <= save.guideStep && (placeKind === '全部' || item.kind === placeKind));
  }, [save.guideStep, placeKind]);

  const discoveredContacts = useMemo(
    () => save.discoveredContactIds.map(contactById).filter(Boolean),
    [save.discoveredContactIds]
  );

  const currentGuide = unlockSteps[Math.min(save.guideStep, unlockSteps.length - 1)];

  function announce(step) {
    setUnlockNotice(unlockSteps[step]);
    window.setTimeout(() => setUnlockNotice(null), 2800);
  }

  function startNew() {
    const next = { ...freshSave(), screen: 'play' };
    localStorage.setItem(SAVE_KEY, JSON.stringify(next));
    setSave(next);
    setSurface('studio');
    setUnlockNotice({ title: '你有一间工作室', note: '一台能用的电脑，¥3200，一周 6 点注意力。先做一件事。' });
    window.setTimeout(() => setUnlockNotice(null), 3600);
  }

  function continueGame() {
    setSave((current) => ({ ...current, screen: 'play' }));
    setSurface(save.guideStep === 0 ? 'studio' : 'studio');
  }

  function discover(ids = []) {
    return (current) => {
      const nextIds = [...current.discoveredContactIds];
      for (const id of ids) if (!nextIds.includes(id)) nextIds.push(id);
      const threads = { ...current.contactThreads };
      for (const id of ids) {
        if (!threads[id]) threads[id] = contactById(id)?.openingMessages || [];
      }
      return { ...current, discoveredContactIds: nextIds, contactThreads: threads };
    };
  }

  function maybeTriggerEvent(current, nextStep, nextActionCount) {
    if (nextActionCount < 3 || nextActionCount % 3 !== 0) return current;
    const event = satiricalEvents.find((item) => item.unlockAt <= nextStep && !current.seenEventIds.includes(item.id));
    return event ? { ...current, activeEventId: event.id } : current;
  }

  function performCard(card) {
    if (save.attention < card.cost) return;
    setSave((current) => {
      let nextStep = current.guideStep;
      if (nextStep === 0) nextStep = 1;
      const effect = card.effect || {};
      const seed = !current.primaryProject && card.projectSeed ? card.projectSeed : null;
      let next = {
        ...current,
        attention: current.attention - card.cost,
        cash: current.cash + Number(effect.cash || 0),
        guideStep: nextStep,
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
      if (card.discovers?.length) next = discover(card.discovers)(next);
      next = maybeTriggerEvent(next, nextStep, next.completedCardIds.length + next.visitedPlaceIds.length);
      return next;
    });
    setSelectedCardId(null);
    if (save.guideStep === 0) announce(1);
  }

  function visitPlace(place) {
    if (save.attention < place.cost) return;
    setSave((current) => {
      const already = current.visitedPlaceIds.includes(place.id);
      let nextStep = current.guideStep;
      if (nextStep === 1) nextStep = 2;
      let project = current.primaryProject;
      if (!project) {
        const source = actionCards.find((item) => current.completedCardIds.includes(item.id) && item.projectSeed)?.projectSeed;
        project = source ? { ...source } : {
          name: '第一个项目',
          question: '把最近做过的几次行动变成一个能被测试的项目。',
          methods: ['观察', '原型', '记录']
        };
      }
      let next = {
        ...current,
        attention: current.attention - place.cost,
        guideStep: nextStep,
        primaryProject: project,
        visitedPlaceIds: already ? current.visitedPlaceIds : [...current.visitedPlaceIds, place.id],
        projectMetrics: { ...current.projectMetrics, siteFit: clampMetric(current.projectMetrics.siteFit + (place.kind === '现场' || place.kind === '展示' ? 1 : 0)) },
        actionLog: [...current.actionLog, { week: current.week, type: '探索', title: place.title, text: place.summary }]
      };
      if (place.discovers?.length) next = discover(place.discovers)(next);
      next = maybeTriggerEvent(next, nextStep, next.completedCardIds.length + next.visitedPlaceIds.length);
      return next;
    });
    setSelectedPlaceId(null);
    if (save.guideStep === 1) {
      announce(2);
      setSurface('project');
    }
  }

  function performProjectCard(card) {
    performCard(card);
    if (save.guideStep === 2) {
      setSave((current) => ({ ...current, guideStep: 3 }));
      announce(3);
    }
  }

  function sendContact(contact, ask, askIndex) {
    if (save.attention < 1) return;
    const reply = replyLibrary[contact.id]?.[askIndex % (replyLibrary[contact.id]?.length || 1)] || '收到，我看一下。';
    setSave((current) => {
      const thread = current.contactThreads[contact.id] || contact.openingMessages;
      return {
        ...current,
        attention: current.attention - 1,
        guideStep: Math.max(current.guideStep, 4),
        contactThreads: {
          ...current.contactThreads,
          [contact.id]: [...thread, { from: 'you', text: ask }]
        },
        pendingReplies: [...current.pendingReplies, { contactId: contact.id, dueWeek: current.week + 1, text: reply }],
        actionLog: [...current.actionLog, { week: current.week, type: '联络', title: contact.name, text: ask }]
      };
    });
    if (save.guideStep === 3) announce(4);
  }

  function upgradeCapability(key) {
    if (save.cash < 800) return;
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

  const navItems = [
    { id: 'studio', label: '工作室', show: true },
    { id: 'explore', label: '探索', show: save.guideStep >= 1 },
    { id: 'project', label: '项目', show: save.guideStep >= 2 },
    { id: 'contacts', label: '联络', show: save.guideStep >= 3 && discoveredContacts.length > 0 },
    { id: 'workbench', label: '工作台', show: save.guideStep >= 4 },
    { id: 'archive', label: '档案', show: true }
  ].filter((item) => item.show);

  const activeEvent = satiricalEvents.find((item) => item.id === save.activeEventId);

  return (
    <div className="vx-shell">
      <header className="vx-topbar">
        <button className="vx-brand" onClick={() => setSurface('studio')}>新媒体艺术家模拟器</button>
        <div className="vx-stats">
          <span>第 {save.week} 周</span>
          <span>注意力 {save.attention}/{save.attentionMax}</span>
          <span>¥{save.cash}</span>
        </div>
        <div className="vx-top-actions">
          <button onClick={() => setLogOpen(true)}>记录</button>
          <button className="vx-primary-small" onClick={endWeek}>结束本周</button>
        </div>
      </header>

      <main className="vx-content">
        <GuideStrip guide={currentGuide} />
        {surface === 'studio' && <Studio save={save} onOpenCard={setSelectedCardId} />}
        {surface === 'explore' && (
          <Explore
            save={save}
            kind={placeKind}
            setKind={setPlaceKind}
            places={visiblePlaces}
            onOpen={setSelectedPlaceId}
          />
        )}
        {surface === 'project' && <Project save={save} onOpenCard={setSelectedCardId} />}
        {surface === 'contacts' && (
          <Contacts
            save={save}
            contacts={discoveredContacts}
            selectedId={selectedContactId || discoveredContacts[0]?.id}
            onSelect={setSelectedContactId}
            onSend={sendContact}
          />
        )}
        {surface === 'workbench' && <Workbench save={save} onUpgrade={upgradeCapability} />}
        {surface === 'archive' && (
          <Archive
            save={save}
            entries={filteredKnowledge}
            selected={selectedKnowledge}
            query={archiveQuery}
            setQuery={setArchiveQuery}
            onOpen={openKnowledge}
          />
        )}
      </main>

      <nav className="vx-ornament" aria-label="主要系统">
        {navItems.map((item) => (
          <button key={item.id} className={surface === item.id ? 'active' : ''} onClick={() => setSurface(item.id)}>{item.label}</button>
        ))}
      </nav>

      {selectedCardId && (
        <CardSheet
          card={actionCards.find((item) => item.id === selectedCardId)}
          disabled={save.attention < (actionCards.find((item) => item.id === selectedCardId)?.cost || 0)}
          onClose={() => setSelectedCardId(null)}
          onDo={(card) => card.category === 'project' ? performProjectCard(card) : performCard(card)}
        />
      )}
      {selectedPlaceId && (
        <PlaceSheet
          place={placeCards.find((item) => item.id === selectedPlaceId)}
          disabled={save.attention < (placeCards.find((item) => item.id === selectedPlaceId)?.cost || 0)}
          onClose={() => setSelectedPlaceId(null)}
          onVisit={visitPlace}
        />
      )}
      {activeEvent && <EventSheet event={activeEvent} onChoose={resolveEvent} />}
      {logOpen && <LogSheet entries={save.actionLog} onClose={() => setLogOpen(false)} />}
      {unlockNotice && <UnlockToast notice={unlockNotice} />}
    </div>
  );
}

function TitleScreen({ hasSave, onStart, onContinue }) {
  return (
    <main className="vx-title">
      <div className="vx-title-glow" />
      <section className="vx-title-card">
        <small>NEW MEDIA ARTIST SIMULATOR</small>
        <h1>新媒体艺术家模拟器</h1>
        <p>从一个工作室开始。做东西、去现场、认识人、留下档案。系统会慢慢打开。</p>
        <div className="vx-title-actions">
          <button className="vx-primary" onClick={onStart}>开始新的实践</button>
          {hasSave && <button onClick={onContinue}>继续</button>}
        </div>
      </section>
      <div className="vx-title-note">v0.5 · CARD-FIRST PROTOTYPE</div>
    </main>
  );
}

function GuideStrip({ guide }) {
  return (
    <section className="vx-guide">
      <span>现在</span>
      <div><strong>{guide.title}</strong><p>{guide.note}</p></div>
    </section>
  );
}

function PageHead({ eyebrow, title, text }) {
  return <header className="vx-page-head"><small>{eyebrow}</small><h1>{title}</h1>{text && <p>{text}</p>}</header>;
}

function Studio({ save, onOpenCard }) {
  const studioCards = actionCards.filter((item) => item.category === 'studio' && item.unlockAt <= save.guideStep);
  const incomeCards = actionCards.filter((item) => item.category === 'income' && item.unlockAt <= save.guideStep);
  return (
    <section className="vx-page">
      <PageHead eyebrow="STUDIO" title="今天在工作室做什么" text="先做具体行动。系统、方法和路线会从行动里长出来。" />
      <CardGrid cards={studioCards} save={save} onOpen={onOpenCard} />
      {incomeCards.length > 0 && <><div className="vx-section-title"><h2>生存</h2><span>不是副职业，是现金流</span></div><CardGrid cards={incomeCards} save={save} onOpen={onOpenCard} /></>}
    </section>
  );
}

function CardGrid({ cards, save, onOpen }) {
  return (
    <div className="vx-card-grid">
      {cards.map((card) => (
        <button className="vx-card" key={card.id} onClick={() => onOpen(card.id)}>
          <div className="vx-card-meta"><span>{card.tags[0]}</span><b>-{card.cost} 注意力</b></div>
          <h2>{card.title}</h2>
          <p>{card.summary}</p>
          <div className="vx-card-foot"><span>{card.tags.slice(1).join(' · ')}</span><em>{save.completedCardIds.includes(card.id) ? '做过' : '打开'}</em></div>
        </button>
      ))}
    </div>
  );
}

function Explore({ save, kind, setKind, places, onOpen }) {
  return (
    <section className="vx-page">
      <PageHead eyebrow="EXPLORE" title="去哪里" text="先按空间类型理解行业。城市路线等你认识足够多地点以后再出现。" />
      <div className="vx-filter-row">{placeKinds.map((item) => <button key={item} className={kind === item ? 'active' : ''} onClick={() => setKind(item)}>{item}</button>)}</div>
      <div className="vx-place-grid">
        {places.map((place) => (
          <button className="vx-place-card" key={place.id} onClick={() => onOpen(place.id)}>
            <div className="vx-card-meta"><span>{place.kind}</span><b>-{place.cost}</b></div>
            <h2>{place.title}</h2><p>{place.summary}</p>
            <ul>{place.transparent.slice(0, 3).map((line) => <li key={line}>{line}</li>)}</ul>
            <div className="vx-card-foot"><span>{place.tags.join(' · ')}</span><em>{save.visitedPlaceIds.includes(place.id) ? '去过' : '了解'}</em></div>
          </button>
        ))}
      </div>
    </section>
  );
}

function Project({ save, onOpenCard }) {
  const projectCards = actionCards.filter((item) => item.category === 'project' && item.unlockAt <= save.guideStep);
  return (
    <section className="vx-page">
      <PageHead eyebrow="PROJECT" title={save.primaryProject?.name || '第一个项目'} text={save.primaryProject?.question || '项目会从你已经做过的行动里出现。'} />
      <section className="vx-project-summary">
        <div><span>问题</span><strong>{metricWord(save.projectMetrics.coherence, 'coherence')}</strong></div>
        <div><span>运行</span><strong>{metricWord(save.projectMetrics.stability, 'stability')}</strong></div>
        <div><span>场地</span><strong>{metricWord(save.projectMetrics.siteFit, 'siteFit')}</strong></div>
        <div><span>文档</span><strong>{metricWord(save.projectMetrics.documentation, 'documentation')}</strong></div>
      </section>
      <div className="vx-methods">{save.primaryProject?.methods?.map((method) => <span key={method}>{method}</span>)}</div>
      <div className="vx-section-title"><h2>下一步</h2><span>一次只解决一个问题</span></div>
      <CardGrid cards={projectCards} save={save} onOpen={onOpenCard} />
    </section>
  );
}

function Contacts({ save, contacts, selectedId, onSelect, onSend }) {
  const selected = contacts.find((item) => item.id === selectedId) || contacts[0];
  if (!selected) return <section className="vx-page"><PageHead eyebrow="CONTACTS" title="联络" text="还没有真正认识的人。先去做事。" /></section>;
  const thread = save.contactThreads[selected.id] || selected.openingMessages;
  return (
    <section className="vx-page">
      <PageHead eyebrow="CONTACTS" title="联络" text="这里不是人脉表。只有你真的遇见过的人和实际发生的对话。" />
      <div className="vx-contact-layout">
        <nav className="vx-contact-list">{contacts.map((contact) => <button key={contact.id} className={contact.id === selected.id ? 'active' : ''} onClick={() => onSelect(contact.id)}><strong>{contact.name}</strong><span>{contact.role}</span></button>)}</nav>
        <article className="vx-contact-main">
          <header><small>{selected.role}</small><h2>{selected.name}</h2><p>{selected.background}</p><div className="vx-how-met">认识方式 · {selected.howMet}</div></header>
          <div className="vx-chat">{thread.map((message, index) => <div key={`${message.text}-${index}`} className={`vx-message ${message.from}`}><small>{message.from === 'you' ? '你' : message.from === 'them' ? selected.name : '记录'}</small><p>{message.text}</p></div>)}</div>
          <div className="vx-ask-row">{selected.asks.map((ask, index) => <button key={ask} disabled={save.attention < 1} onClick={() => onSend(selected, ask, index)}>{ask}<span>-1</span></button>)}</div>
        </article>
      </div>
    </section>
  );
}

function Workbench({ save, onUpgrade }) {
  const items = [
    { key: 'compute', name: '电脑 / Compute', note: '实时图形、编码、重建和生成系统。' },
    { key: 'output', name: '输出 / Output', note: '屏幕、投影、信号与预演能力。' },
    { key: 'capture', name: '采集 / Capture', note: '摄影、扫描、传感和输入。' },
    { key: 'storage', name: '存储 / Storage', note: '素材、版本、备份和归档。' }
  ];
  return (
    <section className="vx-page">
      <PageHead eyebrow="WORKBENCH" title="工作台" text="现在项目已经有具体需求，所以工具才出现。没有必要从开局就研究设备树。" />
      <div className="vx-workbench-grid">{items.map((item) => <article key={item.key} className="vx-capability"><small>LEVEL {save.workbench[item.key]}</small><h2>{item.name}</h2><p>{item.note}</p><div className="vx-levels">{[1,2,3,4].map((level) => <i key={level} className={save.workbench[item.key] >= level ? 'on' : ''} />)}</div><button disabled={save.cash < 800 || save.workbench[item.key] >= 4} onClick={() => onUpgrade(item.key)}>升级 · ¥800</button></article>)}</div>
    </section>
  );
}

function Archive({ save, entries, selected, query, setQuery, onOpen }) {
  return (
    <section className="vx-page vx-archive">
      <PageHead eyebrow="ARCHIVE" title="档案" text="百科、方法、空间、项目类型与行业说明。行动记录在另一处。" />
      <div className="vx-archive-layout">
        <aside className="vx-archive-index">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索词条" />
          <div className="vx-archive-count">已读 {save.readKnowledgeEntryIds.length} / {knowledgeEntries.length + archiveExpansion.length}</div>
          <div className="vx-entry-list">{entries.map((entry) => <button key={entry.id} className={entry.id === selected.id ? 'active' : ''} onClick={() => onOpen(entry.id)}><small>{entry.category} · {save.readKnowledgeEntryIds.includes(entry.id) ? '已读' : '未读'}</small><strong>{entry.title}</strong><span>{entry.summary}</span></button>)}</div>
        </aside>
        <article className="vx-reader"><small>{selected.category}</small><h2>{selected.title}</h2><p className="vx-lead">{selected.summary}</p>{selected.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}<div className="vx-tag-row">{selected.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></article>
      </div>
    </section>
  );
}

function CardSheet({ card, disabled, onClose, onDo }) {
  if (!card) return null;
  return (
    <div className="vx-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <article className="vx-sheet">
        <button className="vx-close" onClick={onClose}>×</button>
        <div className="vx-sheet-meta"><span>{card.tags.join(' · ')}</span><b>-{card.cost} 注意力</b></div>
        <h1>{card.title}</h1><p className="vx-sheet-lead">{card.summary}</p>
        <section><small>说明</small><p>{card.detail}</p></section>
        <section><small>大白话</small><p>{card.plain}</p></section>
        {card.satire && <section className="vx-satire"><small>旁注</small><p>{card.satire}</p></section>}
        <button className="vx-primary vx-sheet-action" disabled={disabled} onClick={() => onDo(card)}>执行这张卡</button>
      </article>
    </div>
  );
}

function PlaceSheet({ place, disabled, onClose, onVisit }) {
  if (!place) return null;
  return (
    <div className="vx-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <article className="vx-sheet">
        <button className="vx-close" onClick={onClose}>×</button><div className="vx-sheet-meta"><span>{place.kind}</span><b>-{place.cost} 注意力</b></div>
        <h1>{place.title}</h1><p className="vx-sheet-lead">{place.summary}</p><section><small>这里是什么</small><p>{place.detail}</p></section>
        <section><small>信息透明</small><ul className="vx-transparent">{place.transparent.map((line) => <li key={line}>{line}</li>)}</ul></section>
        <section><small>可以做</small><p>{place.actions.join(' · ')}</p></section>
        <button className="vx-primary vx-sheet-action" disabled={disabled} onClick={() => onVisit(place)}>去一次</button>
      </article>
    </div>
  );
}

function EventSheet({ event, onChoose }) {
  return (
    <div className="vx-backdrop vx-event-backdrop"><article className="vx-sheet vx-event-sheet"><small>特殊事件</small><h1>{event.title}</h1><section><small>正式话语</small><p>{event.formal}</p></section><section><small>大白话</small><p>{event.plain}</p></section><section className="vx-satire"><small>黑色幽默</small><p>{event.satire}</p></section><div className="vx-event-choices">{event.choices.map((choice) => <button key={choice.label} onClick={() => onChoose(choice)}><strong>{choice.label}</strong><span>{choice.result}</span></button>)}</div></article></div>
  );
}

function LogSheet({ entries, onClose }) {
  return <div className="vx-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><aside className="vx-log"><header><div><small>ACTIVITY</small><h2>行动记录</h2></div><button onClick={onClose}>关闭</button></header><div>{entries.slice().reverse().map((entry, index) => <article key={`${entry.title}-${index}`}><small>第 {entry.week} 周 · {entry.type}</small><strong>{entry.title}</strong><p>{entry.text}</p></article>)}</div></aside></div>;
}

function UnlockToast({ notice }) {
  return <div className="vx-unlock"><small>系统打开</small><strong>{notice.title}</strong><span>{notice.note}</span></div>;
}
