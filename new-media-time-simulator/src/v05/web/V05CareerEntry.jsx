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
import { learningEpisodes } from '../learningEpisodeCatalog.ts';
import { buildAssessmentCareerProfile } from '../careerProfileRuntime.ts';
import { mergeStoredSpecialCarryoversIntoCareer } from '../specialCarryover.ts';
import V05SettingsPanel from './V05SettingsPanel.jsx';
import './v05-career-entry.css';

const workModes = [
  { id: 'story', code: 'STORY', title: '纯叙事', note: '不要求进入节点画布。关键制作点直接从 2–3 个方案里选择。' },
  { id: 'hybrid', code: 'HYBRID', title: '混合', note: '默认。剧情推进到制作节点时，可以打开工作图自己改。' },
  { id: 'blueprint', code: 'BLUEPRINT', title: '工作图优先', note: '项目关键节点默认使用工作图，但仍然共享同一套剧情和后果。' }
];

const learningPreview = learningEpisodes.filter((item) => item.status === 'planned').slice(0, 3);

function v05Href(mode) {
  const params = new URLSearchParams(window.location.search);
  const rootPreview = params.get('core') === 'v05' && !window.location.pathname.includes('/v05/');
  if (rootPreview) return mode === 'home' ? './?core=v05' : `./?core=v05&mode=${mode}`;
  return mode === 'home' ? './' : `./?mode=${mode}`;
}

function seedCareerSave(profile) {
  const pack = resourcePackById(profile.resourcePackId);
  const save = {
    schema: 'triad-field-workbench-records-20260811', screen: 'play', week: 1,
    attention: 6, attentionMax: 6, cash: pack.cash, primaryLayer: 'workbench', fieldTab: 'places', workbenchTab: 'actions', recordsTab: 'quests',
    currentPlaceId: null, completedCardIds: [], visitedPlaceIds: [], discoveredContactIds: profile.knownNpcIds, contactThreads: {}, pendingReplies: [], receivedFeedbackCount: 0,
    evidenceIds: [], contextActionIds: [], revealedIssueIds: [], resolvedIssueIds: [], methodIds: [], readKnowledgeEntryIds: [], primaryProject: null,
    projectMetrics: { coherence: 1, stability: 1, siteFit: 0, documentation: 0 }, workbench: pack.workbench, scopeAdapted: false, publicOutputCount: 0,
    seenEventIds: [], activeEventId: null, actionLog: [{ week: 1, type: '生涯', title: '档案建立', text: profile.firstProjectPrompt }],
    careerStageId: 'stage-1', careerEpisodeId: 'ep-01-runnable', careerProfileId: profile.id
  };
  return mergeStoredSpecialCarryoversIntoCareer(save);
}

export default function V05CareerEntry() {
  const [entryType, setEntryType] = useState('preset');
  const [presetId, setPresetId] = useState(careerPresets[0].id);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [workMode, setWorkMode] = useState('hybrid');
  const [phase, setPhase] = useState('chapters');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const existing = useMemo(() => {
    try {
      return {
        profile: JSON.parse(localStorage.getItem(CAREER_PROFILE_KEY) || 'null'),
        save: JSON.parse(localStorage.getItem(CAREER_SAVE_KEY) || 'null')
      };
    } catch { return { profile: null, save: null }; }
  }, []);

  const draftProfile = useMemo(() => {
    if (entryType === 'assessment' && answers.length === careerAssessmentQuestions.length) return buildAssessmentCareerProfile(answers, workMode);
    return profileFromPreset(presetId, workMode);
  }, [entryType, answers, presetId, workMode]);
  const pack = resourcePackById(draftProfile.resourcePackId);

  function chooseAnswer(optionId) {
    const next = [...answers]; next[questionIndex] = optionId; setAnswers(next);
    if (questionIndex < careerAssessmentQuestions.length - 1) setQuestionIndex(questionIndex + 1); else setPhase('workmode');
  }
  function startPreset(id) { setEntryType('preset'); setPresetId(id); setPhase('workmode'); }
  function startAssessment() { setEntryType('assessment'); setAnswers([]); setQuestionIndex(0); setPhase('assessment'); }
  function enterCareer() {
    const profile = entryType === 'assessment' ? buildAssessmentCareerProfile(answers, workMode) : profileFromPreset(presetId, workMode);
    localStorage.setItem(CAREER_PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem(CAREER_SAVE_KEY, JSON.stringify(seedCareerSave(profile)));
    window.location.href = v05Href('story');
  }

  if (phase === 'chapters') {
    return <main className="vc-shell"><section className="vc-panel vc-chapter-select">
      <header className="vc-head"><div><small>PLAY / CHAPTER SELECT</small><h1>选择游玩内容</h1><p>章节不是独立小游戏。学到的知识、方法、节点、Assets 和记忆会回到同一份生涯里，之后继续使用。</p></div><div className="vc-head-actions"><a href={v05Href('home')}>首页</a><button onClick={() => setSettingsOpen(true)}>设置</button></div></header>

      {!existing.profile && <section className="vc-chapter-main vc-onboarding-main">
        <div><small>START HERE · EP00</small><h2>建立你的工作台</h2><p>第一次玩从这里开始。选一种观察方式，生成第一个 Asset，接通最小的 INPUT → PROCESS → OUTPUT 工作图，再留下第一份创作记录。</p><div className="vc-tags"><span>约 10 分钟</span><span>照片 / 扫描 / 声音三选一</span><span>3 节点 · 2 条线</span></div></div>
        <div className="vc-chapter-actions"><a className="primary-link" href={v05Href('ep00')}>开始 EP00 →</a><button onClick={() => setPhase('origin')}>跳过引导 · 高级开局</button></div>
      </section>}

      <section className="vc-chapter-main">
        <div><small>MAIN CAREER</small><h2>新媒体艺术家生涯</h2><p>不是升级等级，而是不断积累可以再次调用的方法、关系、资料和失败经验。主线从第一个真正能被别人看到的版本开始。</p><div className="vc-tags"><span>EPISODE 01</span><span>FIELD → WORKBENCH → RECORDS</span></div></div>
        <div className="vc-chapter-actions">{existing.profile && existing.save ? <><a className="primary-link" href={v05Href('story')}>继续生涯 · 第 {existing.save.week || 1} 周</a><a href={v05Href('ep00')}>重玩 EP00</a></> : <button onClick={() => setPhase('origin')}>直接建立高级档案</button>}</div>
      </section>

      <div className="vc-section-head"><small>EXPERIENTIAL CHAPTERS</small><h2>体验式学习章节</h2><p>不是看一场“大师传记”。玩家被放进一个真实媒介问题里，亲手重做一次关键决策；史料与人物谱系进入 Knowledge / Archive。</p></div>
      <div className="vc-chapters">
        <a href={v05Href('costarica')} className="vc-chapter-card featured"><small>SPECIAL 01 · RESIDENCY</small><strong>哥斯达黎加</strong><p>驻地、野外采集、摄影测量、Camera Solve、点云 / Gaussian、数据伦理与作者性，最后全部回到长期生涯。</p><div className="vc-tags"><span>扫描 / 重建</span><span>知识 → 节点 → Assets</span><span>可重复游玩</span></div><span>进入章节 →</span></a>
        {learningPreview.map((episode) => <article className="vc-chapter-card muted" key={episode.id}><small>{episode.code} · {episode.format.toUpperCase()}</small><strong>{episode.title}</strong><p>{episode.subtitle}</p><div className="vc-tags">{episode.layers.map((layer) => <span key={layer}>{layer}</span>)}</div><span>开发中</span></article>)}
      </div>
      <V05SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)}/>
    </section></main>;
  }

  if (phase === 'assessment') {
    const question = careerAssessmentQuestions[questionIndex];
    return <main className="vc-shell"><section className="vc-panel vc-question"><header><button className="vc-back" onClick={() => setPhase('origin')}>← 返回</button><small>ADVANCED START / {questionIndex + 1} OF {careerAssessmentQuestions.length}</small><h1>{question.title}</h1><p>这是跳过 EP00 的高级起点设置。答案只决定起始资源、早期人物和事件权重，不锁职业。</p></header><div className="vc-options">{question.options.map((option) => <button key={option.id} onClick={() => chooseAnswer(option.id)}><strong>{option.label}</strong><span>{option.signals.join(' · ')}</span></button>)}</div></section></main>;
  }

  if (phase === 'workmode') {
    return <main className="vc-shell"><section className="vc-panel"><header className="vc-head"><div><button className="vc-back" onClick={() => setPhase(entryType === 'assessment' ? 'assessment' : 'origin')}>← 返回</button><small>ADVANCED START / PLAY STYLE</small><h1>制作环节怎么操作？</h1><p>三种方式共享同一份世界状态，之后可以在设置里改。</p></div></header><div className="vc-workmodes">{workModes.map((mode) => <button className={workMode === mode.id ? 'active' : ''} key={mode.id} onClick={() => setWorkMode(mode.id)}><small>{mode.code}</small><strong>{mode.title}</strong><span>{mode.note}</span></button>)}</div><div className="vc-actions"><button onClick={() => setPhase('confirm')} className="primary">查看起步档案</button></div></section></main>;
  }

  if (phase === 'confirm') {
    return <main className="vc-shell"><section className="vc-panel"><header className="vc-head"><div><button className="vc-back" onClick={() => setPhase('workmode')}>← 返回</button><small>CAREER DOSSIER</small><h1>{draftProfile.title}</h1><p>{draftProfile.description}</p></div></header><div className="vc-dossier"><article><small>STARTING SIGNALS</small><strong>{draftProfile.signalTags.join(' / ')}</strong></article><article><small>RESOURCE PACK</small><strong>{pack.title}</strong><p>{pack.description}</p><div className="vc-tags">{pack.assets.map((item) => <span key={item}>{item}</span>)}</div></article><article><small>KNOWN PEOPLE</small><strong>{draftProfile.knownNpcIds.length ? draftProfile.knownNpcIds.join(' · ') : '没有预装关系'}</strong></article><article><small>FIRST PROMPT</small><strong>{draftProfile.firstProjectPrompt}</strong></article><article><small>WORK MODE</small><strong>{workModes.find((item) => item.id === workMode)?.title}</strong></article></div><div className="vc-actions"><button className="primary" onClick={enterCareer}>进入第一周</button><button onClick={() => setPhase('origin')}>重新选择起点</button></div></section></main>;
  }

  return (
    <main className="vc-shell"><section className="vc-panel">
      <header className="vc-head"><div><button className="vc-back" onClick={() => setPhase('chapters')}>← 章节选择</button><small>ADVANCED START</small><h1>跳过 EP00，建立起步档案</h1><p>适合已经理解 Assets / Knowledge / Work Graph 的玩家。这里描述当前处境，不创建永久职业。</p></div><div className="vc-head-actions"><button onClick={() => setSettingsOpen(true)}>设置</button></div></header>
      <div className="vc-section-head"><small>QUICK START</small><h2>预置起点</h2><p>直接从一种现实处境进入主线。</p></div>
      <div className="vc-presets">{careerPresets.map((preset) => { const presetPack = careerResourcePacks.find((item) => item.id === preset.resourcePackId); return <button key={preset.id} onClick={() => startPreset(preset.id)}><small>{preset.signalTags.join(' / ')}</small><strong>{preset.title}</strong><p>{preset.summary}</p><span>{presetPack?.title}</span></button>; })}</div>
      <div className="vc-assessment-call"><div><small>ADVANCED START</small><strong>或者，用 5 题描述自己的当前起点</strong><p>问手上有什么、别人为什么找你、最怕什么失败、想先进入什么环境。</p></div><button onClick={startAssessment}>开始 5 题建模 →</button></div>
      <V05SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)}/>
    </section></main>
  );
}
