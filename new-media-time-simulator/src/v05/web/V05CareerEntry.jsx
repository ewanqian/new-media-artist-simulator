import { useMemo, useState } from 'react';
import {
  CAREER_PROFILE_KEY,
  CAREER_SAVE_KEY,
  careerAssessmentQuestions,
  careerPresets,
  careerResourcePacks,
  profileFromPreset,
  resourcePackById
} from '../careerContent.ts';
import { buildAssessmentCareerProfile } from '../careerProfileRuntime.ts';
import V05SettingsPanel from './V05SettingsPanel.jsx';
import './v05-career-entry.css';

const workModes = [
  { id: 'story', code: 'STORY', title: '纯叙事', note: '不要求进入节点画布。关键制作点直接从 2–3 个方案里选择。' },
  { id: 'hybrid', code: 'HYBRID', title: '混合', note: '默认。平时走剧情与场域，关键制作时可打开工作图自己改。' },
  { id: 'blueprint', code: 'BLUEPRINT', title: '工作图优先', note: '项目关键节点默认使用可视化工作图，但仍然共享同一套剧情和后果。' }
];

function v05Href(mode) {
  const params = new URLSearchParams(window.location.search);
  const rootPreview = params.get('core') === 'v05' && !window.location.pathname.includes('/v05/');
  if (rootPreview) return `./?core=v05&mode=${mode}`;
  return mode === 'home' ? './' : `./?mode=${mode}`;
}

function seedCareerSave(profile) {
  const pack = resourcePackById(profile.resourcePackId);
  return {
    schema: 'triad-field-workbench-records-20260811',
    screen: 'play',
    week: 1,
    attention: 6,
    attentionMax: 6,
    cash: pack.cash,
    primaryLayer: 'workbench',
    fieldTab: 'places',
    workbenchTab: 'actions',
    recordsTab: 'quests',
    currentPlaceId: null,
    completedCardIds: [],
    visitedPlaceIds: [],
    discoveredContactIds: profile.knownNpcIds,
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
    workbench: pack.workbench,
    scopeAdapted: false,
    publicOutputCount: 0,
    seenEventIds: [],
    activeEventId: null,
    actionLog: [{ week: 1, type: '生涯', title: '档案建立', text: profile.firstProjectPrompt }],
    careerStageId: 'stage-1',
    careerEpisodeId: 'ep-01-runnable',
    careerProfileId: profile.id
  };
}

export default function V05CareerEntry() {
  const [entryType, setEntryType] = useState('preset');
  const [presetId, setPresetId] = useState(careerPresets[0].id);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [workMode, setWorkMode] = useState('hybrid');
  const [phase, setPhase] = useState('origin');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const existingProfile = useMemo(() => {
    try { return JSON.parse(localStorage.getItem(CAREER_PROFILE_KEY) || 'null'); } catch { return null; }
  }, []);

  const draftProfile = useMemo(() => {
    if (entryType === 'assessment' && answers.length === careerAssessmentQuestions.length) return buildAssessmentCareerProfile(answers, workMode);
    return profileFromPreset(presetId, workMode);
  }, [entryType, answers, presetId, workMode]);
  const pack = resourcePackById(draftProfile.resourcePackId);

  function chooseAnswer(optionId) {
    const next = [...answers];
    next[questionIndex] = optionId;
    setAnswers(next);
    if (questionIndex < careerAssessmentQuestions.length - 1) setQuestionIndex(questionIndex + 1);
    else setPhase('workmode');
  }

  function startPreset(id) {
    setEntryType('preset');
    setPresetId(id);
    setPhase('workmode');
  }

  function startAssessment() {
    setEntryType('assessment');
    setAnswers([]);
    setQuestionIndex(0);
    setPhase('assessment');
  }

  function enterCareer() {
    const profile = entryType === 'assessment' ? buildAssessmentCareerProfile(answers, workMode) : profileFromPreset(presetId, workMode);
    localStorage.setItem(CAREER_PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem(CAREER_SAVE_KEY, JSON.stringify(seedCareerSave(profile)));
    window.location.href = v05Href('story');
  }

  if (phase === 'assessment') {
    const question = careerAssessmentQuestions[questionIndex];
    return <main className="vc-shell"><section className="vc-panel vc-question"><header><button className="vc-back" onClick={() => setPhase('origin')}>← 返回</button><small>ROLE MODEL / {questionIndex + 1} OF {careerAssessmentQuestions.length}</small><h1>{question.title}</h1><p>这些答案只决定起始资源、早期人物和事件权重，不会锁职业。</p></header><div className="vc-options">{question.options.map((option) => <button key={option.id} onClick={() => chooseAnswer(option.id)}><strong>{option.label}</strong><span>{option.signals.join(' · ')}</span></button>)}</div></section></main>;
  }

  if (phase === 'workmode') {
    return <main className="vc-shell"><section className="vc-panel"><header className="vc-head"><div><button className="vc-back" onClick={() => setPhase(entryType === 'assessment' ? 'assessment' : 'origin')}>← 返回</button><small>PLAY STYLE</small><h1>你想怎么完成制作环节？</h1><p>三种方式共享同一套世界状态、主线、人物和后果。以后可以在设置里改。</p></div></header><div className="vc-workmodes">{workModes.map((mode) => <button className={workMode === mode.id ? 'active' : ''} key={mode.id} onClick={() => setWorkMode(mode.id)}><small>{mode.code}</small><strong>{mode.title}</strong><span>{mode.note}</span></button>)}</div><div className="vc-actions"><button onClick={() => setPhase('confirm')} className="primary">继续：查看起步档案</button></div></section></main>;
  }

  if (phase === 'confirm') {
    return <main className="vc-shell"><section className="vc-panel"><header className="vc-head"><div><button className="vc-back" onClick={() => setPhase('workmode')}>← 返回</button><small>CAREER DOSSIER</small><h1>{draftProfile.title}</h1><p>{draftProfile.description}</p></div></header><div className="vc-dossier"><article><small>STARTING SIGNALS</small><strong>{draftProfile.signalTags.join(' / ')}</strong><p>这是当前入口，不是固定身份。</p></article><article><small>RESOURCE PACK</small><strong>{pack.title}</strong><p>{pack.description}</p><div className="vc-tags">{pack.assets.map((item) => <span key={item}>{item}</span>)}</div></article><article><small>KNOWN PEOPLE</small><strong>{draftProfile.knownNpcIds.length ? draftProfile.knownNpcIds.join(' · ') : '没有预装关系'}</strong><p>关系只记录真实认识方式和共同经历。</p></article><article><small>FIRST PROMPT</small><strong>{draftProfile.firstProjectPrompt}</strong><p>第一阶段仍然从“让一个东西真实存在”开始。</p></article><article><small>WORK MODE</small><strong>{workModes.find((item) => item.id === workMode)?.title}</strong><p>节点编辑器不会成为强制门槛。</p></article></div><div className="vc-actions"><button className="primary" onClick={enterCareer}>进入第一周</button><button onClick={() => setPhase('origin')}>重新选择起点</button></div></section></main>;
  }

  return (
    <main className="vc-shell">
      <section className="vc-panel">
        <header className="vc-head">
          <div><small>NEW MEDIA ARTIST SIMULATOR / CAREER</small><h1>建立你的起步档案</h1><p>不是选职业。先决定你从什么资源、关系和习惯开始，然后让这份档案在五个阶段里被不断改写。</p></div>
          <div className="vc-head-actions"><a href={v05Href('home')}>返回首页</a><button onClick={() => setSettingsOpen(true)}>设置</button></div>
        </header>
        {existingProfile && <section className="vc-existing"><div><small>LOCAL CAREER FOUND</small><strong>{existingProfile.title}</strong><span>{existingProfile.workMode || 'hybrid'} · {existingProfile.signalTags?.join(' / ')}</span></div><a className="primary-link" href={v05Href('story')}>继续当前生涯</a></section>}
        <div className="vc-section-head"><small>QUICK START</small><h2>预置起点</h2><p>它们描述的是“你现在处于什么状态”，不是永久职业。</p></div>
        <div className="vc-presets">{careerPresets.map((preset) => { const presetPack = careerResourcePacks.find((item) => item.id === preset.resourcePackId); return <button key={preset.id} onClick={() => startPreset(preset.id)}><small>{preset.signalTags.join(' / ')}</small><strong>{preset.title}</strong><p>{preset.summary}</p><span>{presetPack?.title}</span></button>; })}</div>
        <div className="vc-assessment-call"><div><small>ROLE MODEL</small><strong>或者，用 5 题建模自己的起点</strong><p>问你手上有什么、别人因为什么找你、你怕什么失败、想先进哪个环境、希望第一个版本怎么证明自己。</p></div><button onClick={startAssessment}>开始 5 题建模 →</button></div>
      </section>
      <V05SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)}/>
    </main>
  );
}
