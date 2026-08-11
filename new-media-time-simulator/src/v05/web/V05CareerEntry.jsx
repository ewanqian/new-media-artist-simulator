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
  { id: 'hybrid', code: 'HYBRID', title: '混合', note: '默认。剧情推进到制作节点时，可以打开工作图自己改。' },
  { id: 'blueprint', code: 'BLUEPRINT', title: '工作图优先', note: '项目关键节点默认使用工作图，但仍然共享同一套剧情和后果。' }
];

function v05Href(mode) {
  const params = new URLSearchParams(window.location.search);
  const rootPreview = params.get('core') === 'v05' && !window.location.pathname.includes('/v05/');
  if (rootPreview) return mode === 'home' ? './?core=v05' : `./?core=v05&mode=${mode}`;
  return mode === 'home' ? './' : `./?mode=${mode}`;
}

function seedCareerSave(profile) {
  const pack = resourcePackById(profile.resourcePackId);
  return {
    schema: 'triad-field-workbench-records-20260811', screen: 'play', week: 1,
    attention: 6, attentionMax: 6, cash: pack.cash, primaryLayer: 'workbench', fieldTab: 'places', workbenchTab: 'actions', recordsTab: 'quests',
    currentPlaceId: null, completedCardIds: [], visitedPlaceIds: [], discoveredContactIds: profile.knownNpcIds, contactThreads: {}, pendingReplies: [], receivedFeedbackCount: 0,
    evidenceIds: [], contextActionIds: [], revealedIssueIds: [], resolvedIssueIds: [], methodIds: [], readKnowledgeEntryIds: [], primaryProject: null,
    projectMetrics: { coherence: 1, stability: 1, siteFit: 0, documentation: 0 }, workbench: pack.workbench, scopeAdapted: false, publicOutputCount: 0,
    seenEventIds: [], activeEventId: null, actionLog: [{ week: 1, type: '生涯', title: '档案建立', text: profile.firstProjectPrompt }],
    careerStageId: 'stage-1', careerEpisodeId: 'ep-01-runnable', careerProfileId: profile.id
  };
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
      <header className="vc-head"><div><small>PLAY / CHAPTER SELECT</small><h1>选择游玩内容</h1><p>主线生涯保存长期状态；特殊章节是独立训练与故事，目前不会自动修改主线存档。</p></div><div className="vc-head-actions"><a href={v05Href('home')}>首页</a><button onClick={() => setSettingsOpen(true)}>设置</button></div></header>
      <section className="vc-chapter-main">
        <div><small>MAIN CAREER</small><h2>新媒体艺术家生涯</h2><p>从第一个能运行的版本开始，经过现场、网络、方法沉淀与长期实践。当前主线从 Episode 01 开始。</p><div className="vc-tags"><span>EPISODE 01</span><span>第一个能被别人看见的版本</span></div></div>
        <div className="vc-chapter-actions">{existing.profile && existing.save ? <><a className="primary-link" href={v05Href('story')}>继续生涯 · 第 {existing.save.week || 1} 周</a><button onClick={() => setPhase('origin')}>新建生涯</button></> : <button className="primary" onClick={() => setPhase('origin')}>开始生涯</button>}</div>
      </section>
      <div className="vc-section-head"><small>SPECIAL CHAPTERS</small><h2>特殊章节</h2><p>用独立章节学习一组新方法、节点或叙事机制；可以重复游玩，不影响当前主线进度。</p></div>
      <div className="vc-chapters">
        <a href={v05Href('butterfly')} className="vc-chapter-card featured"><small>SPECIAL 01 · TRAINING / NARRATIVE</small><strong>哥斯达黎加的蝴蝶学者</strong><p>从真实蝴蝶与寄主植物观察开始，练习摄影测量、相机求解、点云 / Gaussian 与 Blender 动画，并处理来源、署名和研究数据的公开边界。</p><span>进入章节 →</span></a>
        <article className="vc-chapter-card muted"><small>SPECIAL 02</small><strong>待加入</strong><p>后续章节继续复用同一套叙事演出、知识获取、节点训练、成就与档案系统。</p></article>
      </div>
      <V05SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)}/>
    </section></main>;
  }

  if (phase === 'assessment') {
    const question = careerAssessmentQuestions[questionIndex];
    return <main className="vc-shell"><section className="vc-panel vc-question"><header><button className="vc-back" onClick={() => setPhase('origin')}>← 返回</button><small>ROLE MODEL / {questionIndex + 1} OF {careerAssessmentQuestions.length}</small><h1>{question.title}</h1><p>答案只决定起始资源、早期人物和事件权重，不锁职业。</p></header><div className="vc-options">{question.options.map((option) => <button key={option.id} onClick={() => chooseAnswer(option.id)}><strong>{option.label}</strong><span>{option.signals.join(' · ')}</span></button>)}</div></section></main>;
  }

  if (phase === 'workmode') {
    return <main className="vc-shell"><section className="vc-panel"><header className="vc-head"><div><button className="vc-back" onClick={() => setPhase(entryType === 'assessment' ? 'assessment' : 'origin')}>← 返回</button><small>PLAY STYLE</small><h1>制作环节怎么操作？</h1><p>三种方式共享同一份世界状态，之后可以在设置里改。</p></div></header><div className="vc-workmodes">{workModes.map((mode) => <button className={workMode === mode.id ? 'active' : ''} key={mode.id} onClick={() => setWorkMode(mode.id)}><small>{mode.code}</small><strong>{mode.title}</strong><span>{mode.note}</span></button>)}</div><div className="vc-actions"><button onClick={() => setPhase('confirm')} className="primary">查看起步档案</button></div></section></main>;
  }

  if (phase === 'confirm') {
    return <main className="vc-shell"><section className="vc-panel"><header className="vc-head"><div><button className="vc-back" onClick={() => setPhase('workmode')}>← 返回</button><small>CAREER DOSSIER</small><h1>{draftProfile.title}</h1><p>{draftProfile.description}</p></div></header><div className="vc-dossier"><article><small>STARTING SIGNALS</small><strong>{draftProfile.signalTags.join(' / ')}</strong></article><article><small>RESOURCE PACK</small><strong>{pack.title}</strong><p>{pack.description}</p><div className="vc-tags">{pack.assets.map((item) => <span key={item}>{item}</span>)}</div></article><article><small>KNOWN PEOPLE</small><strong>{draftProfile.knownNpcIds.length ? draftProfile.knownNpcIds.join(' · ') : '没有预装关系'}</strong></article><article><small>FIRST PROMPT</small><strong>{draftProfile.firstProjectPrompt}</strong></article><article><small>WORK MODE</small><strong>{workModes.find((item) => item.id === workMode)?.title}</strong></article></div><div className="vc-actions"><button className="primary" onClick={enterCareer}>进入第一周</button><button onClick={() => setPhase('origin')}>重新选择起点</button></div></section></main>;
  }

  return (
    <main className="vc-shell"><section className="vc-panel">
      <header className="vc-head"><div><button className="vc-back" onClick={() => setPhase('chapters')}>← 章节选择</button><small>NEW CAREER</small><h1>建立起步档案</h1><p>先决定从什么资源、关系和习惯开始。</p></div><div className="vc-head-actions"><button onClick={() => setSettingsOpen(true)}>设置</button></div></header>
      <div className="vc-section-head"><small>QUICK START</small><h2>预置起点</h2><p>描述你现在的处境，不是永久职业。</p></div>
      <div className="vc-presets">{careerPresets.map((preset) => { const presetPack = careerResourcePacks.find((item) => item.id === preset.resourcePackId); return <button key={preset.id} onClick={() => startPreset(preset.id)}><small>{preset.signalTags.join(' / ')}</small><strong>{preset.title}</strong><p>{preset.summary}</p><span>{presetPack?.title}</span></button>; })}</div>
      <div className="vc-assessment-call"><div><small>ROLE MODEL</small><strong>或者，用 5 题建模自己的起点</strong><p>问手上有什么、别人为什么找你、最怕什么失败、想先进入什么环境。</p></div><button onClick={startAssessment}>开始 5 题建模 →</button></div>
      <V05SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)}/>
    </section></main>
  );
}
