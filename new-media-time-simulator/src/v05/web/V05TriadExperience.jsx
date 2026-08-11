import { useEffect, useMemo, useState } from 'react';
import { knowledgeEntries } from '../knowledgeBase.ts';
import { archiveExpansion } from '../archiveExpansion.ts';
import { opportunitySeeds } from '../contentFrame.ts';
import { deriveProjectStage, weeklyPulses } from '../gameLoop.ts';
import {
  actionCards,
  contactById,
  contactSeeds,
  placeCards,
  satiricalEvents
} from '../legacyDeck.ts';
import {
  archiveCategories,
  capabilityFamilyGroups,
  openingQuestLine,
  peopleFamilyGroups,
  placeFamilyGroups,
  signalFamilyGroups,
  triumphGroups,
  workActionGroups
} from '../playStructure.ts';
import { activeQuestHint, openingQuestProgress } from '../questRuntime.ts';
import {
  CardTextFragments,
  ContactNetworkPanel,
  ExperienceTextStream,
  KnowledgeSourcesPanel,
  PlaceTextFragments
} from './TextEcologyPanels.jsx';
import './v05-experience.css';
import './v05-text-ecology.css';
import './v05-triad.css';

const SAVE_KEY = 'nmas-v05-world-hub-preview';
const SCHEMA = 'triad-field-workbench-records-20260811';

const replyLibrary = {
  'contact-lin': ['可以。别发完整提案，发我一个能跑的版本和你最不确定的地方。', '我知道一个小空间可能能测两晚，但你先把现在这个版本跑稳定。'],
  'contact-li-tech': ['把输出分辨率、刷新率、接口和备份方式发我。我先看这四个。', '下周有一段短测试档期，你要来的话先把信号链画出来。'],
  'contact-m': ['别只拍最终画面。失败、安装和改动的顺序更重要。', '可以记录，但先说清楚你要的是过程证据还是传播素材。'],
  'contact-qiao': ['先把内容、硬件、播控、网络和现场值守拆开，再谈总价。', '你这个 Scope 还会长，先写一份“不包含什么”。'],
  'contact-chen': ['发一页版本。第一屏让我知道它在哪里发生、观众看到什么、现在缺什么。', '有个空间可能撤展后空两天，条件一般，但适合测试。'],
  'contact-dai': ['尺寸和重量先发。你说“大概一个人能搬”没有用。', '结构、运输、安装我分开算，你先别把它们揉成一个数字。']
};

const placeFamilyInstances = {
  'personal-workspace': ['place-basic-studio'],
  'shared-lab': ['place-archive-reading'],
  'fabrication-supplier': ['place-fabrication'],
  'blackbox-club': ['place-blackbox'],
  'gallery-institution': ['place-project-space', 'place-institution'],
  'public-screen-online': ['place-fair'],
  'peer-place': ['place-peer-meet'],
  'institution-backstage': ['place-institution'],
  'client-market-residency': ['place-fair']
};

const contactFamily = {
  'contact-lin': 'peer-artist',
  'contact-m': 'documentation-media',
  'contact-li-tech': 'technical-signal-network',
  'contact-dai': 'fabrication-install',
  'contact-qiao': 'curator-producer',
  'contact-chen': 'institution-venue-education'
};

const opportunityFamily = {
  'opp-blackbox-two-hours': 'slot-residency-resource',
  'opp-open-call-small-space': 'open-call-commission',
  'opp-brand-demo': 'open-call-commission',
  'opp-hangzhou-week': 'slot-residency-resource',
  'opp-emergency-live': 'invitation',
  'opp-public-screen': 'open-call-commission',
  'opp-artist-run-show': 'invitation',
  'opp-workshop': 'invitation'
};

const contextVerbs = {
  desk: ['build', 'compose', 'run', 'diagnose', 'document', 'maintain-upgrade'],
  'place-basic-studio': ['build', 'compose', 'run', 'diagnose', 'document'],
  'place-archive-reading': ['compose', 'document'],
  'place-project-space': ['integrate', 'preview', 'package', 'document'],
  'place-peer-meet': ['document'],
  'place-blackbox': ['integrate', 'run', 'preview', 'diagnose', 'package', 'document'],
  'place-fabrication': ['build', 'integrate', 'diagnose', 'package'],
  'place-institution': ['integrate', 'preview', 'package', 'document'],
  'place-fair': ['package', 'document']
};

const actionEffects = {
  build: { cost: 2, label: '构建', delta: { stability: 1 }, evidence: 'build' },
  compose: { cost: 1, label: '编排', delta: { coherence: 1 }, evidence: 'composition' },
  integrate: { cost: 2, label: '整合', delta: { stability: 1, siteFit: 1 }, evidence: 'integration' },
  run: { cost: 2, label: '运行', delta: { stability: 1 }, evidence: 'run-log' },
  preview: { cost: 2, label: '场地预演', delta: { siteFit: 1 }, evidence: 'site-preview' },
  diagnose: { cost: 1, label: '诊断', delta: {}, evidence: 'diagnostic' },
  package: { cost: 1, label: '打包 / 交付', delta: { documentation: 1 }, evidence: 'package' },
  document: { cost: 1, label: '记录 / 文档', delta: { documentation: 1 }, evidence: 'document' },
  'maintain-upgrade': { cost: 1, label: '维护', delta: { stability: 1 }, evidence: 'maintenance' }
};

const archiveCollections = {
  people: ['创作关系', '制作关系', '机构关系'],
  places: ['制作环境', '展示环境', '社会环境'],
  projects: ['当前实践', '已完成项目', '失败与分支'],
  methods: ['构建与编排', '测试与诊断', '文档与交付'],
  media: ['实时影像', '空间媒介', '旧媒介与格式'],
  ecology: ['机构语言', '机会与市场', '同行与信息流']
};

const triumphDefinitions = [
  { id: 'first-prototype', group: 'challenges', title: '先让它运行', note: '完成第一个具体原型。', reward: '解锁：原型 / 运行相关档案' },
  { id: 'someone-saw-it', group: 'challenges', title: '有人真的看过', note: '向一个相关的人发送当前版本并收到回复。', reward: '解锁：反馈作为证据' },
  { id: 'not-render', group: 'challenges', title: '不是效果图', note: '在真实展示环境里完成一次测试。', reward: '解锁：场地适配记录' },
  { id: 'live-basics', group: 'sets', title: '现场基础', note: '输出能力 ≥ 2、留下文档、完成一次现场测试。', reward: '解锁：现场方法组' },
  { id: 'recoverable', group: 'sets', title: '可恢复', note: '暴露一个问题并完成诊断。', reward: '解锁：诊断 / 备份方法组' },
  { id: 'field-creature', group: 'titles', title: '现场生物', note: '完成第一条主线后获得。', reward: '称号' }
];

function freshSave() {
  return {
    schema: SCHEMA,
    screen: 'title',
    week: 1,
    attention: 6,
    attentionMax: 6,
    cash: 3200,
    primaryLayer: 'workbench',
    fieldTab: 'places',
    workbenchTab: 'actions',
    recordsTab: 'quests',
    currentPlaceId: null,
    completedCardIds: [],
    visitedPlaceIds: [],
    discoveredContactIds: [],
    contactThreads: {},
    pendingReplies: [],
    receivedFeedbackCount: 0,
    evidenceIds: [],
    contextActionIds: [],
    revealedIssueIds: [],
    resolvedIssueIds: [],
    methodIds: [],
    readKnowledgeEntryIds: [],
    primaryProject: null,
    projectMetrics: { coherence: 1, stability: 1, siteFit: 0, documentation: 0 },
    workbench: { compute: 1, output: 1, capture: 1, storage: 1 },
    scopeAdapted: false,
    publicOutputCount: 0,
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
    primaryLayer: ['field', 'workbench', 'records'].includes(raw.primaryLayer) ? raw.primaryLayer : 'workbench',
    completedCardIds: Array.isArray(raw.completedCardIds) ? raw.completedCardIds : [],
    visitedPlaceIds: Array.isArray(raw.visitedPlaceIds) ? raw.visitedPlaceIds : [],
    discoveredContactIds: Array.isArray(raw.discoveredContactIds) ? raw.discoveredContactIds : [],
    pendingReplies: Array.isArray(raw.pendingReplies) ? raw.pendingReplies : [],
    evidenceIds: Array.isArray(raw.evidenceIds) ? raw.evidenceIds : [],
    contextActionIds: Array.isArray(raw.contextActionIds) ? raw.contextActionIds : [],
    revealedIssueIds: Array.isArray(raw.revealedIssueIds) ? raw.revealedIssueIds : [],
    resolvedIssueIds: Array.isArray(raw.resolvedIssueIds) ? raw.resolvedIssueIds : [],
    methodIds: Array.isArray(raw.methodIds) ? raw.methodIds : [],
    readKnowledgeEntryIds: Array.isArray(raw.readKnowledgeEntryIds) ? raw.readKnowledgeEntryIds : [],
    actionLog: Array.isArray(raw.actionLog) ? raw.actionLog : [],
    contactThreads: raw.contactThreads && typeof raw.contactThreads === 'object' ? raw.contactThreads : {},
    workbench: { ...fresh.workbench, ...(raw.workbench || {}) },
    projectMetrics: { ...fresh.projectMetrics, ...(raw.projectMetrics || {}) }
  };
}

function clamp(value) { return Math.max(0, Math.min(4, value)); }

function discoverContacts(current, ids = []) {
  const discovered = [...current.discoveredContactIds];
  const threads = { ...current.contactThreads };
  for (const id of ids) {
    if (!discovered.includes(id)) discovered.push(id);
    if (!threads[id]) threads[id] = contactById(id)?.openingMessages || [];
  }
  return { ...current, discoveredContactIds: discovered, contactThreads: threads };
}

function currentContextLabel(save) {
  return placeCards.find((place) => place.id === save.currentPlaceId)?.title || '自己的工作位';
}

function placeIsPresentation(placeId) {
  return ['place-blackbox', 'place-project-space', 'place-institution', 'place-fair'].includes(placeId);
}

function archiveCategoryFor(entry) {
  const hay = `${entry.category} ${entry.title} ${entry.summary} ${(entry.tags || []).join(' ')}`;
  if (/人物|艺术家|同行|策划|制作人/.test(hay)) return 'people';
  if (/空间|工作室|实验室|黑盒|美术馆|展厅|场地/.test(hay)) return 'places';
  if (/项目|提案|申请|作品/.test(hay)) return 'projects';
  if (/媒介|影像|声音|扫描|实时|格式|VCD|录像/.test(hay)) return 'media';
  if (/机构|生态|市场|征集|行业|网络|传播/.test(hay)) return 'ecology';
  return 'methods';
}

function triumphDone(id, save, quest) {
  if (id === 'first-prototype') return save.completedCardIds.length > 0;
  if (id === 'someone-saw-it') return save.receivedFeedbackCount > 0;
  if (id === 'not-render') return save.projectMetrics.siteFit > 0;
  if (id === 'live-basics') return save.workbench.output >= 2 && save.projectMetrics.documentation > 0 && save.projectMetrics.siteFit > 0;
  if (id === 'recoverable') return save.resolvedIssueIds.length > 0;
  if (id === 'field-creature') return quest.complete;
  return false;
}

export default function V05TriadExperience() {
  const [save, setSave] = useState(freshSave);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [selectedArchiveCategory, setSelectedArchiveCategory] = useState('methods');
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState('legacy-basic-studio');
  const [archiveQuery, setArchiveQuery] = useState('');
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

  const quest = useMemo(() => openingQuestProgress(save), [save]);
  const allKnowledge = useMemo(() => [...knowledgeEntries, ...archiveExpansion], []);
  const selectedKnowledge = allKnowledge.find((item) => item.id === selectedKnowledgeId) || allKnowledge[0];
  const filteredKnowledge = useMemo(() => {
    const q = archiveQuery.trim().toLowerCase();
    return allKnowledge.filter((entry) => archiveCategoryFor(entry) === selectedArchiveCategory)
      .filter((entry) => !q || `${entry.title} ${entry.summary} ${(entry.tags || []).join(' ')}`.toLowerCase().includes(q));
  }, [allKnowledge, selectedArchiveCategory, archiveQuery]);
  const activeEvent = satiricalEvents.find((item) => item.id === save.activeEventId);

  function flash(title, text) {
    setNotice({ title, text });
    window.setTimeout(() => setNotice(null), 2600);
  }

  function startNew() {
    const next = { ...freshSave(), screen: 'play' };
    localStorage.setItem(SAVE_KEY, JSON.stringify(next));
    setSave(next);
    flash('主线开始', '先让一个东西真正运行。其他系统已经存在，但不会替你决定怎么做。');
  }

  function continueGame() {
    setSave((current) => ({ ...current, screen: 'play' }));
  }

  function performStarterCard(card) {
    if (!card || save.attention < card.cost) return;
    setSave((current) => {
      const seed = !current.primaryProject && card.projectSeed ? card.projectSeed : current.primaryProject;
      const effect = card.effect || {};
      let next = {
        ...current,
        attention: current.attention - card.cost,
        completedCardIds: current.completedCardIds.includes(card.id) ? current.completedCardIds : [...current.completedCardIds, card.id],
        primaryProject: seed ? { ...seed, originCardId: card.id } : current.primaryProject,
        projectMetrics: {
          coherence: clamp(current.projectMetrics.coherence + Number(effect.coherence || 0)),
          stability: clamp(current.projectMetrics.stability + Number(effect.stability || 0)),
          siteFit: clamp(current.projectMetrics.siteFit + Number(effect.siteFit || 0)),
          documentation: clamp(current.projectMetrics.documentation + Number(effect.documentation || 0))
        },
        actionLog: [...current.actionLog, { week: current.week, type: '工作', title: card.title, text: card.plain }]
      };
      if (card.discovers?.length) next = discoverContacts(next, card.discovers);
      return next;
    });
    setSelectedCardId(null);
  }

  function enterPlace(place) {
    if (!place) return;
    setSave((current) => {
      const first = !current.visitedPlaceIds.includes(place.id);
      let next = {
        ...current,
        currentPlaceId: place.id,
        visitedPlaceIds: first ? [...current.visitedPlaceIds, place.id] : current.visitedPlaceIds,
        actionLog: [...current.actionLog, { week: current.week, type: '场域', title: `进入：${place.title}`, text: place.summary }]
      };
      if (place.discovers?.length) next = discoverContacts(next, place.discovers);
      return next;
    });
    setSelectedPlaceId(null);
    setSave((current) => ({ ...current, primaryLayer: 'workbench', workbenchTab: 'actions' }));
    flash('环境已改变', `${place.title} 会改变现在可用的工作动作。`);
  }

  function leaveToDesk() {
    setSave((current) => ({ ...current, currentPlaceId: null, primaryLayer: 'workbench', workbenchTab: 'actions' }));
  }

  function performContextAction(verbId) {
    const spec = actionEffects[verbId];
    if (!spec || save.attention < spec.cost || !save.primaryProject) return;
    const placeId = save.currentPlaceId;
    setSave((current) => {
      const evidenceId = `${spec.evidence}:${current.week}:${current.contextActionIds.length + 1}`;
      const delta = spec.delta || {};
      let revealed = [...current.revealedIssueIds];
      let resolved = [...current.resolvedIssueIds];
      let methods = [...current.methodIds];
      let publicOutputCount = current.publicOutputCount || 0;
      const issuesOpen = revealed.filter((id) => !resolved.includes(id));

      if (['run', 'integrate', 'preview'].includes(verbId) && placeId && !revealed.includes('issue-context-friction')) {
        revealed.push('issue-context-friction');
      }
      if (verbId === 'diagnose' && issuesOpen.length) {
        resolved.push(issuesOpen[0]);
        if (!methods.includes('method-diagnose-from-evidence')) methods.push('method-diagnose-from-evidence');
      }
      const canPublic = placeIsPresentation(placeId) && (current.workbench.output >= 2 || current.scopeAdapted);
      if (canPublic && ['run', 'integrate', 'package'].includes(verbId)) publicOutputCount += 1;

      return {
        ...current,
        attention: current.attention - spec.cost,
        contextActionIds: [...current.contextActionIds, `${placeId || 'desk'}:${verbId}:${current.week}`],
        evidenceIds: [...current.evidenceIds, evidenceId],
        revealedIssueIds: revealed,
        resolvedIssueIds: resolved,
        methodIds: methods,
        publicOutputCount,
        projectMetrics: {
          coherence: clamp(current.projectMetrics.coherence + Number(delta.coherence || 0)),
          stability: clamp(current.projectMetrics.stability + Number(delta.stability || 0)),
          siteFit: clamp(current.projectMetrics.siteFit + Number(delta.siteFit || 0)),
          documentation: clamp(current.projectMetrics.documentation + Number(delta.documentation || 0))
        },
        actionLog: [...current.actionLog, { week: current.week, type: '工作', title: `${currentContextLabel(current)} / ${spec.label}`, text: `在当前环境执行 ${spec.label}，留下 ${spec.evidence} 证据。` }]
      };
    });
  }

  function adaptScope() {
    if (!save.primaryProject || save.attention < 1) return;
    setSave((current) => ({
      ...current,
      attention: current.attention - 1,
      scopeAdapted: true,
      projectMetrics: { ...current.projectMetrics, coherence: clamp(current.projectMetrics.coherence + 1) },
      actionLog: [...current.actionLog, { week: current.week, type: '项目', title: '收缩现场范围', text: '把第一次公开收缩到当前能力可以可靠完成的版本。' }]
    }));
  }

  function sendContact(contact, ask, askIndex) {
    if (save.attention < 1) return;
    const replies = replyLibrary[contact.id] || ['收到，我看一下。'];
    setSave((current) => {
      const thread = current.contactThreads[contact.id] || contact.openingMessages || [];
      return {
        ...current,
        attention: current.attention - 1,
        contactThreads: { ...current.contactThreads, [contact.id]: [...thread, { from: 'you', text: ask }] },
        pendingReplies: [...current.pendingReplies, { contactId: contact.id, dueWeek: current.week + 1, text: replies[askIndex % replies.length] }],
        actionLog: [...current.actionLog, { week: current.week, type: '人物', title: contact.name, text: ask }]
      };
    });
  }

  function upgrade(track) {
    if (save.cash < 800 || save.workbench[track] >= 4) return;
    setSave((current) => ({
      ...current,
      cash: current.cash - 800,
      workbench: { ...current.workbench, [track]: Math.min(4, current.workbench[track] + 1) },
      actionLog: [...current.actionLog, { week: current.week, type: '能力', title: `升级 ${track}`, text: '能力阈值变化，新的环境动作可能变得可执行。' }]
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
      const evidence = [...current.evidenceIds];
      for (const item of due) {
        const seed = contactById(item.contactId);
        threads[item.contactId] = [...(threads[item.contactId] || seed?.openingMessages || []), { from: 'them', text: item.text }];
        evidence.push(`feedback:${item.contactId}:${nextWeek}`);
      }
      return {
        ...current,
        week: nextWeek,
        attention: current.attentionMax,
        cash: current.cash - 450,
        pendingReplies: waiting,
        contactThreads: threads,
        receivedFeedbackCount: current.receivedFeedbackCount + due.length,
        evidenceIds: evidence,
        actionLog: [...current.actionLog, { week: nextWeek, type: '时间', title: `第 ${nextWeek} 周`, text: due.length ? `${due.length} 条回复回来。固定支出 -450。` : '没有重要回复。固定支出 -450。' }]
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
      seenEventIds: current.seenEventIds.includes(event.id) ? current.seenEventIds : [...current.seenEventIds, event.id]
    }));
  }

  if (save.screen === 'title') return <TitleScreen hasSave={Boolean(localStorage.getItem(SAVE_KEY))} onStart={startNew} onContinue={continueGame} />;

  return (
    <div className="vx-shell tri-shell">
      <header className="vx-topbar tri-topbar">
        <button className="vx-brand" onClick={() => setSave((current) => ({ ...current, primaryLayer: 'workbench' }))}>新媒体艺术家模拟器</button>
        <button className="tri-current-quest" onClick={() => setSave((current) => ({ ...current, primaryLayer: 'records', recordsTab: 'quests' }))}>
          <small>主线 · {quest.completed}/{quest.total}</small>
          <strong>{quest.active.title}</strong>
          <span>{activeQuestHint(save)}</span>
        </button>
        <div className="vx-stats"><span>第 {save.week} 周</span><span>注意力 {save.attention}/{save.attentionMax}</span><span>¥{save.cash}</span></div>
        <div className="vx-top-actions"><button onClick={() => setLogOpen(true)}>日志</button><button className="vx-primary-small" onClick={endWeek}>结束本周</button></div>
      </header>

      <main className="vx-content tri-content">
        {save.primaryLayer === 'field' && (
          <FieldLayer
            save={save}
            onTab={(tab) => setSave((current) => ({ ...current, fieldTab: tab }))}
            onOpenPlace={setSelectedPlaceId}
            onLeave={leaveToDesk}
            selectedContactId={selectedContactId}
            onSelectContact={setSelectedContactId}
            onSend={sendContact}
          />
        )}
        {save.primaryLayer === 'workbench' && (
          <WorkbenchLayer
            save={save}
            quest={quest}
            onTab={(tab) => setSave((current) => ({ ...current, workbenchTab: tab }))}
            onOpenCard={setSelectedCardId}
            onAction={performContextAction}
            onUpgrade={upgrade}
            onAdaptScope={adaptScope}
            onGoField={() => setSave((current) => ({ ...current, primaryLayer: 'field', fieldTab: 'places' }))}
          />
        )}
        {save.primaryLayer === 'records' && (
          <RecordsLayer
            save={save}
            quest={quest}
            onTab={(tab) => setSave((current) => ({ ...current, recordsTab: tab }))}
            allKnowledge={allKnowledge}
            entries={filteredKnowledge}
            selectedCategory={selectedArchiveCategory}
            setSelectedCategory={setSelectedArchiveCategory}
            query={archiveQuery}
            setQuery={setArchiveQuery}
            selectedKnowledge={selectedKnowledge}
            onOpenKnowledge={openKnowledge}
          />
        )}
      </main>

      <nav className="tri-primary-nav" aria-label="主要系统">
        {[
          ['field', 'FIELD', '场域', '环境'],
          ['workbench', 'WORKBENCH', '工作台', '身体'],
          ['records', 'RECORDS', '记录', '意识']
        ].map(([id, code, label, note]) => (
          <button key={id} className={save.primaryLayer === id ? 'active' : ''} onClick={() => setSave((current) => ({ ...current, primaryLayer: id }))}>
            <small>{code}</small><strong>{label}</strong><span>{note}</span>
          </button>
        ))}
      </nav>

      {selectedCardId && <CardSheet card={actionCards.find((item) => item.id === selectedCardId)} week={save.week} disabled={save.attention < (actionCards.find((item) => item.id === selectedCardId)?.cost || 0)} onClose={() => setSelectedCardId(null)} onDo={performStarterCard} />}
      {selectedPlaceId && <PlaceSheet place={placeCards.find((item) => item.id === selectedPlaceId)} week={save.week} current={save.currentPlaceId === selectedPlaceId} onClose={() => setSelectedPlaceId(null)} onEnter={enterPlace} />}
      {activeEvent && <EventSheet event={activeEvent} onChoose={resolveEvent} />}
      {logOpen && <LogSheet entries={save.actionLog} onClose={() => setLogOpen(false)} />}
      {notice && <div className="vx-unlock"><small>SYSTEM</small><strong>{notice.title}</strong><span>{notice.text}</span></div>}
    </div>
  );
}

function TitleScreen({ hasSave, onStart, onContinue }) {
  return <main className="vx-title"><div className="vx-title-glow"/><section className="vx-title-card"><small>NEW MEDIA ARTIST SIMULATOR</small><h1>新媒体艺术家模拟器</h1><p>环境改变可做的事，行动留下证据，记录改变下一次判断。</p><div className="vx-title-actions"><button className="vx-primary" onClick={onStart}>开始新的实践</button>{hasSave && <button onClick={onContinue}>继续</button>}</div></section><div className="vx-title-note">v0.5 · FIELD / WORKBENCH / RECORDS</div></main>;
}

function LayerHead({ code, title, question, tabs, active, onTab }) {
  return <><header className="tri-layer-head"><div><small>{code}</small><h1>{title}</h1><p>{question}</p></div></header><nav className="tri-subnav" aria-label={`${title}子系统`}>{tabs.map((tab) => <button key={tab.id} className={active === tab.id ? 'active' : ''} onClick={() => onTab(tab.id)}><small>{tab.code}</small><strong>{tab.label}</strong><span>{tab.note}</span></button>)}</nav></>;
}

function FieldLayer({ save, onTab, onOpenPlace, onLeave, selectedContactId, onSelectContact, onSend }) {
  const tabs = [
    { id: 'places', code: 'PLACE', label: '空间', note: '条件与情境' },
    { id: 'people', code: 'PEOPLE', label: '人物', note: '关系与协作' },
    { id: 'signals', code: 'SIGNAL', label: '信号', note: '机会与压力' }
  ];
  return <section className="vx-page"><LayerHead code="FIELD / ENVIRONMENT" title="场域" question="现在身处什么条件里？环境决定接下来哪些行为有意义。" tabs={tabs} active={save.fieldTab} onTab={onTab}/>{save.fieldTab === 'places' && <PlacesPanel save={save} onOpen={onOpenPlace} onLeave={onLeave}/>} {save.fieldTab === 'people' && <PeoplePanel save={save} selectedContactId={selectedContactId} onSelect={onSelectContact} onSend={onSend}/>} {save.fieldTab === 'signals' && <SignalsPanel save={save}/>}</section>;
}

function PlacesPanel({ save, onOpen, onLeave }) {
  return <div className="tri-panel-stack"><section className="tri-current-context"><small>CURRENT ENVIRONMENT</small><strong>{currentContextLabel(save)}</strong><p>{save.currentPlaceId ? '你已经进入这个环境。工作台会根据这里的条件改变。' : '默认环境：自己的工作位。适合构建、运行、诊断和整理。'}</p>{save.currentPlaceId && <button onClick={onLeave}>回到自己的工作位</button>}</section><div className="tri-three-groups">{Object.entries(placeFamilyGroups).map(([groupId, group]) => <section key={groupId} className="tri-family-group"><header><small>{groupId.toUpperCase()}</small><h2>{group.label}</h2></header><div className="tri-family-cells">{group.families.map((family) => { const instances = (placeFamilyInstances[family.id] || []).map((id) => placeCards.find((place) => place.id === id)).filter(Boolean); return <article key={family.id}><small>{family.id}</small><strong>{family.label}</strong><div className="tri-instance-list">{instances.length ? instances.map((place) => <button key={place.id} className={save.currentPlaceId === place.id ? 'active' : ''} onClick={() => onOpen(place.id)}><span>{place.title}</span><i>{save.visitedPlaceIds.includes(place.id) ? '已知' : '未进入'}</i></button>) : <span className="tri-undiscovered">???? / 未发现实例</span>}</div></article>; })}</div></section>)}</div></div>;
}

function PeoplePanel({ save, selectedContactId, onSelect, onSend }) {
  const discovered = save.discoveredContactIds.map(contactById).filter(Boolean);
  const selected = discovered.find((item) => item.id === selectedContactId) || discovered[0];
  return <div className="tri-people-layout"><div className="tri-three-groups">{Object.entries(peopleFamilyGroups).map(([groupId, group]) => <section key={groupId} className="tri-family-group"><header><small>{groupId.toUpperCase()}</small><h2>{group.label}</h2></header><div className="tri-family-cells">{group.families.map((family) => { const people = discovered.filter((contact) => contactFamily[contact.id] === family.id); return <article key={family.id}><small>{family.id}</small><strong>{family.label}</strong>{people.length ? people.map((contact) => <button className="tri-person-chip" key={contact.id} onClick={() => onSelect(contact.id)}>{contact.name}<span>{contact.role}</span></button>) : <span className="tri-undiscovered">未建立关系</span>}</article>; })}</div></section>)}</div><aside className="tri-person-detail">{selected ? <><small>KNOWN PERSON</small><h2>{selected.name}</h2><p>{selected.background}</p><div className="vx-how-met">认识方式 · {selected.howMet}</div><div className="vx-chat">{(save.contactThreads[selected.id] || selected.openingMessages).slice(-5).map((message, index) => <div key={index} className={`vx-message ${message.from}`}><small>{message.from === 'you' ? '你' : message.from === 'them' ? selected.name : '记录'}</small><p>{message.text}</p></div>)}</div><div className="tri-contact-actions">{selected.asks.slice(0, 3).map((ask, index) => <button key={ask} disabled={save.attention < 1} onClick={() => onSend(selected, ask, index)}>{ask}<span>-1</span></button>)}</div><ContactNetworkPanel contact={selected} week={save.week}/></> : <><small>PEOPLE</small><h2>关系网络还很空</h2><p>人物不会预装进通讯录。进入环境、做项目、接触信号以后才会建立关系。</p></>}</aside></div>;
}

function SignalsPanel({ save }) {
  const pulse = weeklyPulses[(save.week - 1) % weeklyPulses.length];
  return <div className="tri-three-groups">{Object.entries(signalFamilyGroups).map(([groupId, group]) => <section key={groupId} className="tri-family-group"><header><small>{groupId.toUpperCase()}</small><h2>{group.label}</h2></header><div className="tri-family-cells">{group.families.map((family) => { const opportunities = opportunitySeeds.filter((item) => opportunityFamily[item.id] === family.id).slice(0, 2); let content = opportunities.map((item) => <div key={item.id} className="tri-signal-item"><strong>{item.title}</strong><span>{item.source}</span><p>{item.risk}</p></div>); if (groupId === 'pressure') content = [<div key={family.id} className="tri-signal-item"><strong>{family.id === 'cash-rent' ? `现金 ¥${save.cash}` : pulse.label}</strong><span>{family.id === 'deadline' ? '本周节奏' : family.label}</span><p>{pulse.pressure}</p></div>]; if (groupId === 'incident') content = [<div key={family.id} className="tri-signal-item"><strong>{save.revealedIssueIds.length ? '有问题还没完全消失' : '暂无明确事件'}</strong><span>{family.label}</span><p>{save.revealedIssueIds.length ? `${save.revealedIssueIds.length - save.resolvedIssueIds.length} 个未解决问题仍会影响判断。` : '进入真实环境、运行项目以后才会暴露。'}</p></div>]; return <article key={family.id}><small>{family.id}</small><strong>{family.label}</strong>{content.length ? content : <span className="tri-undiscovered">暂无信号</span>}</article>; })}</div></section>)}</div>;
}

function WorkbenchLayer({ save, quest, onTab, onOpenCard, onAction, onUpgrade, onAdaptScope, onGoField }) {
  const tabs = [
    { id: 'projects', code: 'PROJECT', label: '项目', note: '实践对象' },
    { id: 'capabilities', code: 'CAPABILITY', label: '能力', note: '可执行阈值' },
    { id: 'actions', code: 'ACTION', label: '工作', note: '当前可做' }
  ];
  return <section className="vx-page"><LayerHead code="WORKBENCH / BODY" title="工作台" question={`当前环境：${currentContextLabel(save)}。能力与环境一起决定你实际能做什么。`} tabs={tabs} active={save.workbenchTab} onTab={onTab}/>{save.workbenchTab === 'projects' && <ProjectsPanel save={save} quest={quest} onAdaptScope={onAdaptScope}/>} {save.workbenchTab === 'capabilities' && <CapabilitiesPanel save={save} onUpgrade={onUpgrade}/>} {save.workbenchTab === 'actions' && <ActionsPanel save={save} onOpenCard={onOpenCard} onAction={onAction} onGoField={onGoField}/>}</section>;
}

function ProjectsPanel({ save, quest, onAdaptScope }) {
  const stage = deriveProjectStage(save.projectMetrics);
  if (!save.primaryProject) return <section className="tri-empty"><small>ACTIVE / 0</small><h2>还没有项目</h2><p>先在自己的工作位完成一个起步动作。项目从行为里形成，不从“新建项目”按钮里形成。</p></section>;
  return <div className="tri-project-layout"><section className="tri-project-main"><small>ACTIVE PROJECT / {stage.label}</small><h2>{save.primaryProject.name}</h2><p>{save.primaryProject.question}</p><div className="tri-project-metrics">{[['问题','coherence'],['运行','stability'],['场地','siteFit'],['文档','documentation']].map(([label,key]) => <div key={key}><span>{label}</span><strong>{save.projectMetrics[key]}/4</strong></div>)}</div><div className="vx-methods">{save.primaryProject.methods?.map((method) => <span key={method}>{method}</span>)}</div><button className="tri-scope-button" disabled={save.scopeAdapted || save.attention < 1} onClick={onAdaptScope}>{save.scopeAdapted ? '已收缩第一次公开范围' : '收缩到当前能力可可靠完成的版本 · -1'}</button></section><aside className="tri-project-side"><div><small>COMMITMENT</small><strong>{save.currentPlaceId ? currentContextLabel(save) : '没有外部场域承诺'}</strong></div><div><small>UNRESOLVED</small><strong>{Math.max(0, save.revealedIssueIds.length - save.resolvedIssueIds.length)} 个问题</strong></div><div><small>MAIN QUEST</small><strong>{quest.active.title}</strong></div><div><small>SIDE PROJECTS</small><strong>0 / 2</strong><span>框架保留，暂不制造假项目。</span></div></aside></div>;
}

function capabilityLevel(familyId, save) {
  if (familyId === 'image-video-capture') return save.workbench.capture;
  if (familyId === 'scan-spatial-capture' || familyId === 'sensor-live-input') return Math.max(0, save.workbench.capture - 1);
  if (familyId === 'realtime-graphics') return save.workbench.compute;
  if (familyId === 'reconstruction-generation') return Math.max(0, save.workbench.compute - 1);
  if (familyId === 'automation-integration') return Math.max(0, save.workbench.compute - 2);
  if (familyId === 'single-display') return save.workbench.output;
  if (familyId === 'multi-output-mapping') return Math.max(0, save.workbench.output - 1);
  if (familyId === 'spatial-special-display') return Math.max(0, save.workbench.output - 2);
  return 0;
}

function CapabilitiesPanel({ save, onUpgrade }) {
  return <div className="tri-three-groups">{Object.entries(capabilityFamilyGroups).map(([groupId, group]) => <section key={groupId} className="tri-family-group"><header><small>{groupId.toUpperCase()}</small><h2>{group.label}</h2>{['input','compute','output'].includes(groupId) && <button disabled={save.cash < 800 || save.workbench[groupId === 'input' ? 'capture' : groupId] >= 4} onClick={() => onUpgrade(groupId === 'input' ? 'capture' : groupId)}>升级路径 · ¥800</button>}</header><div className="tri-family-cells">{group.families.map((family) => { const level = capabilityLevel(family.id, save); return <article key={family.id}><small>{family.id}</small><strong>{family.label}</strong><div className="tri-level-row">{[1,2,3,4].map((n) => <i key={n} className={level >= n ? 'on' : ''}/>)}</div><span>{level ? `能力 ${level}` : '尚未建立'}</span></article>; })}</div></section>)}</div>;
}

function ActionsPanel({ save, onOpenCard, onAction, onGoField }) {
  const available = new Set(contextVerbs[save.currentPlaceId || 'desk'] || []);
  const starterCards = actionCards.filter((card) => card.category === 'studio' && card.unlockAt === 0);
  if (!save.primaryProject) return <><section className="tri-current-context"><small>CURRENT ENVIRONMENT</small><strong>自己的工作位</strong><p>先选择一个真正的起步动作。卡片只在这里承担“具体行为”的角色。</p></section><div className="vx-card-grid">{starterCards.map((card) => <button className="vx-card" key={card.id} onClick={() => onOpenCard(card.id)}><div className="vx-card-meta"><span>{card.tags[0]}</span><b>-{card.cost}</b></div><h2>{card.title}</h2><p>{card.summary}</p><div className="vx-card-foot"><span>{card.tags.slice(1).join(' · ')}</span><em>执行</em></div></button>)}</div></>;
  return <><section className="tri-current-context"><small>CURRENT ENVIRONMENT</small><strong>{currentContextLabel(save)}</strong><p>{save.currentPlaceId ? '下面九个动词不是固定技能栏；只有当前环境有意义的动作才可执行。' : '自己的工作位适合做原型、运行、诊断和文档。进入其他场域会改变可用动作。'}</p><button onClick={onGoField}>改变环境 →</button></section><div className="tri-three-groups">{Object.entries(workActionGroups).map(([groupId, group]) => <section key={groupId} className="tri-family-group"><header><small>{groupId.toUpperCase()}</small><h2>{group.label}</h2></header><div className="tri-action-grid">{group.verbs.map((verb) => { const spec = actionEffects[verb.id]; const enabled = available.has(verb.id) && save.attention >= spec.cost; return <button key={verb.id} disabled={!enabled} onClick={() => onAction(verb.id)}><small>{verb.id}</small><strong>{verb.label}</strong><span>{available.has(verb.id) ? `-${spec.cost} 注意力` : '当前环境无意义'}</span></button>; })}</div></section>)}</div>{save.completedCardIds.length > 0 && <ExperienceTextStream save={save} title="当前环境留下的信号" limit={2}/>}</>;
}

function RecordsLayer({ save, quest, onTab, allKnowledge, entries, selectedCategory, setSelectedCategory, query, setQuery, selectedKnowledge, onOpenKnowledge }) {
  const tabs = [
    { id: 'quests', code: 'QUEST', label: '任务', note: '追什么' },
    { id: 'archive', code: 'ARCHIVE', label: '档案', note: '理解什么' },
    { id: 'triumphs', code: 'TRIUMPH', label: '成就', note: '还能怎么做' }
  ];
  return <section className="vx-page"><LayerHead code="RECORDS / MIND" title="记录" question="经验在这里变成任务、知识和挑战，然后改变下一次你能看见什么。" tabs={tabs} active={save.recordsTab} onTab={onTab}/>{save.recordsTab === 'quests' && <QuestsPanel save={save} quest={quest}/>} {save.recordsTab === 'archive' && <ArchivePanel save={save} allKnowledge={allKnowledge} entries={entries} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} query={query} setQuery={setQuery} selectedKnowledge={selectedKnowledge} onOpen={onOpenKnowledge}/>} {save.recordsTab === 'triumphs' && <TriumphsPanel save={save} quest={quest}/>}</section>;
}

function QuestsPanel({ save, quest }) {
  return <div className="tri-quest-layout"><section className="tri-quest-line"><header><small>MAIN QUEST LINE</small><h2>{openingQuestLine.title}</h2><p>{openingQuestLine.summary}</p><i style={{ width: `${quest.ratio * 100}%` }}/></header>{quest.quests.map((item, index) => <article key={item.id} className={`${item.done ? 'done' : ''} ${item.active ? 'active' : ''}`}><div className="tri-quest-index">{String(index + 1).padStart(2,'0')}</div><div><small>{item.done ? 'COMPLETED' : item.active ? 'ACTIVE' : 'LOCKED BY CONTEXT'}</small><h3>{item.title}</h3><ul>{item.objectives.map((objective) => <li key={objective.id} className={objective.done ? 'done' : ''}><span>{objective.done ? '✓' : '○'}</span>{objective.text}</li>)}</ul></div></article>)}</section><aside className="tri-quest-dialogue"><small>CURRENT THREAD</small><h2>{quest.complete ? '主线完成' : quest.active.title}</h2><p>{activeQuestHint(save)}</p><blockquote>{quest.completed === 0 ? '“先别想完整作品。让一个输入真的改变一次输出。”' : quest.completed === 1 ? '“桌面上的版本已经回答不了空间问题了。”' : quest.completed === 2 ? '“现在让一个真正相关的人看，不要先发给所有人。”' : quest.completed === 3 ? '“问题已经出现了。现在别绕过去，查清它为什么会坏。”' : '“第一次公开不需要最大版本，需要一个能可靠发生的版本。”'}</blockquote><dl><dt>当前环境</dt><dd>{currentContextLabel(save)}</dd><dt>证据</dt><dd>{save.evidenceIds.length}</dd><dt>未解决</dt><dd>{Math.max(0, save.revealedIssueIds.length - save.resolvedIssueIds.length)}</dd></dl></aside></div>;
}

function ArchivePanel({ save, allKnowledge, entries, selectedCategory, setSelectedCategory, query, setQuery, selectedKnowledge, onOpen }) {
  return <div className="tri-archive-shell"><div className="tri-archive-categories">{archiveCategories.map((category) => { const count = allKnowledge.filter((entry) => archiveCategoryFor(entry) === category.id).length; return <button key={category.id} className={selectedCategory === category.id ? 'active' : ''} onClick={() => setSelectedCategory(category.id)}><small>{category.code}</small><strong>{category.label}</strong><span>{count} 条 / {archiveCollections[category.id].length} 组</span></button>; })}</div><div className="tri-archive-tree"><aside><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索当前分类"/><div className="tri-collection-list">{archiveCollections[selectedCategory].map((name, index) => <div key={name}><small>COLLECTION {String(index + 1).padStart(2,'0')}</small><strong>{name}</strong></div>)}</div><div className="vx-entry-list">{entries.map((entry) => <button key={entry.id} className={selectedKnowledge?.id === entry.id ? 'active' : ''} onClick={() => onOpen(entry.id)}><small>{save.readKnowledgeEntryIds.includes(entry.id) ? '已读' : '未读'} · {entry.category}</small><strong>{entry.title}</strong><span>{entry.summary}</span></button>)}</div></aside><article className="vx-reader">{selectedKnowledge ? <><small>{selectedKnowledge.category}</small><h2>{selectedKnowledge.title}</h2><p className="vx-lead">{selectedKnowledge.summary}</p>{selectedKnowledge.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}<div className="vx-tag-row">{selectedKnowledge.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><KnowledgeSourcesPanel knowledgeId={selectedKnowledge.id} week={save.week}/></> : <p>选择一个词条。</p>}</article></div></div>;
}

function TriumphsPanel({ save, quest }) {
  return <div className="tri-three-groups">{triumphGroups.map((group) => <section key={group.id} className="tri-family-group"><header><small>{group.id.toUpperCase()}</small><h2>{group.label}</h2></header><div className="tri-triumph-list">{triumphDefinitions.filter((item) => item.group === group.id).map((item) => { const done = triumphDone(item.id, save, quest); return <article key={item.id} className={done ? 'done' : ''}><small>{done ? 'UNLOCKED' : 'LOCKED'}</small><strong>{item.title}</strong><p>{item.note}</p><span>{item.reward}</span></article>; })}</div></section>)}</div>;
}

function CardSheet({ card, week, disabled, onClose, onDo }) {
  if (!card) return null;
  return <div className="vx-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><article className="vx-sheet"><button className="vx-close" onClick={onClose}>×</button><div className="vx-sheet-meta"><span>{card.tags.join(' · ')}</span><b>-{card.cost} 注意力</b></div><h1>{card.title}</h1><p className="vx-sheet-lead">{card.summary}</p><section><small>说明</small><p>{card.detail}</p></section><section><small>大白话</small><p>{card.plain}</p></section>{card.satire && <section className="vx-satire"><small>旁注</small><p>{card.satire}</p></section>}<CardTextFragments cardId={card.id} week={week}/><button className="vx-primary vx-sheet-action" disabled={disabled} onClick={() => onDo(card)}>执行</button></article></div>;
}

function PlaceSheet({ place, week, current, onClose, onEnter }) {
  if (!place) return null;
  return <div className="vx-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><article className="vx-sheet"><button className="vx-close" onClick={onClose}>×</button><div className="vx-sheet-meta"><span>{place.kind}</span><b>{current ? '当前环境' : 'FIELD'}</b></div><h1>{place.title}</h1><p className="vx-sheet-lead">{place.summary}</p><section><small>条件</small><ul className="vx-transparent">{place.transparent.map((line) => <li key={line}>{line}</li>)}</ul></section><section><small>这个环境可能改变</small><p>{place.actions.join(' · ')}</p></section><PlaceTextFragments placeId={place.id} week={week}/><button className="vx-primary vx-sheet-action" onClick={() => onEnter(place)}>{current ? '重新进入当前环境' : '进入环境'}</button></article></div>;
}

function EventSheet({ event, onChoose }) {
  return <div className="vx-backdrop vx-event-backdrop"><article className="vx-sheet vx-event-sheet"><small>INCIDENT</small><h1>{event.title}</h1><section><small>正式话语</small><p>{event.formal}</p></section><section><small>大白话</small><p>{event.plain}</p></section><section className="vx-satire"><small>黑色幽默</small><p>{event.satire}</p></section><div className="vx-event-choices">{event.choices.map((choice) => <button key={choice.label} onClick={() => onChoose(choice)}><strong>{choice.label}</strong><span>{choice.result}</span></button>)}</div></article></div>;
}

function LogSheet({ entries, onClose }) {
  return <div className="vx-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><aside className="vx-log"><header><div><small>ACTIVITY</small><h2>行动日志</h2></div><button onClick={onClose}>关闭</button></header><div>{entries.slice().reverse().map((entry, index) => <article key={`${entry.title}-${index}`}><small>第 {entry.week} 周 · {entry.type}</small><strong>{entry.title}</strong><p>{entry.text}</p></article>)}</div></aside></div>;
}
