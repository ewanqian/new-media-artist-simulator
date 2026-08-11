import { useEffect, useMemo, useState } from 'react';
import {
  CAREER_PROFILE_KEY,
  CAREER_SAVE_KEY,
  careerEpisodes,
  careerNpcArcs,
  careerStageById,
  resourcePackById
} from '../careerContent.ts';
import V05StoryCareerView from './V05StoryCareerView.jsx';
import V05SettingsPanel from './V05SettingsPanel.jsx';
import './v05-career-shell.css';

function readCareer() {
  try {
    const profile = JSON.parse(localStorage.getItem(CAREER_PROFILE_KEY) || 'null');
    const save = JSON.parse(localStorage.getItem(CAREER_SAVE_KEY) || 'null');
    return { profile, save };
  } catch { return { profile: null, save: null }; }
}

function v05Href(query = '') {
  const params = new URLSearchParams(window.location.search);
  const rootPreview = params.get('core') === 'v05' && !window.location.pathname.includes('/v05/');
  if (rootPreview) return `./?core=v05${query ? `&${query}` : '&mode=home'}`;
  return query ? `./?${query}` : './';
}

function currentCareerEpisode(save) {
  if (!save) return careerEpisodes[0];
  if ((save.careerStageId || 'stage-1') === 'stage-1') {
    if (!save.primaryProject) return careerEpisodes.find((item) => item.id === 'ep-01-runnable');
    if (Number(save.receivedFeedbackCount || 0) < 1) return careerEpisodes.find((item) => item.id === 'ep-02-first-witness');
    return careerEpisodes.find((item) => item.id === 'ep-03-first-public');
  }
  return careerEpisodes.find((item) => item.id === save.careerEpisodeId)
    || careerEpisodes.find((item) => item.stageId === save.careerStageId)
    || careerEpisodes[0];
}

const firstMessages = {
  'contact-lin': '林：别发完整提案。今晚先给我一个能跑的版本，顺便告诉我你最不确定哪一块。',
  'contact-li-tech': '李技术：先画最简单的信号链。分辨率、刷新率、接口、备份，别等到现场再想。',
  'contact-m': 'M：开始前也留一张。最后画面最容易拍，真正会丢的是失败和改动顺序。',
  'contact-qiao': '乔：先别急着把它包装成服务。把你自己的东西做出一个能被别人看到的版本。',
  'contact-chen': '陈：以后要进空间，你得能用一页说清楚。但今晚先证明它真的存在。',
  'contact-dai': '戴：还没到做结构的时候。先把尺寸、输入输出和你实际有的东西写下来。'
};

export default function V05CareerExperienceShell() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const [career, setCareer] = useState(readCareer);
  const introKey = career.profile?.id ? `nmas-career-intro-seen:${career.profile.id}` : null;
  const [introOpen, setIntroOpen] = useState(() => {
    const initial = readCareer();
    return Boolean(initial.profile?.id && !localStorage.getItem(`nmas-career-intro-seen:${initial.profile.id}`));
  });

  useEffect(() => {
    let previous = JSON.stringify(career.save || null);
    const timer = window.setInterval(() => {
      const next = readCareer();
      const signature = JSON.stringify(next.save || null);
      if (signature !== previous) {
        previous = signature;
        setCareer(next);
      }
    }, 650);
    return () => window.clearInterval(timer);
  }, []);

  const stage = careerStageById(career.save?.careerStageId);
  const episode = useMemo(() => currentCareerEpisode(career.save), [career.save]);
  const showBlueprint = career.profile?.workMode !== 'story';
  const episodePeople = (episode?.primaryNpcIds || []).map((id) => careerNpcArcs.find((npc) => npc.id === id)).filter(Boolean);
  const pack = resourcePackById(career.profile?.resourcePackId);
  const firstNpcId = career.profile?.knownNpcIds?.[0];
  const firstMessage = firstMessages[firstNpcId] || '没有人催你。第一件事只需要回答：现在到底有什么东西能够真的运行？';

  function closeIntro() {
    if (introKey) localStorage.setItem(introKey, '1');
    setIntroOpen(false);
  }

  return (
    <div className="vcareer-wrap">
      <V05StoryCareerView profile={career.profile} />

      <aside className="vcareer-rail" aria-label="生涯工具">
        <button className="vcareer-stage" onClick={() => setBriefOpen((value) => !value)}>
          <small>CAREER {stage.index}/5</small><strong>{stage.title}</strong><span>{stage.subtitle}</span>
        </button>
        {showBlueprint && <a href={v05Href('lab=blueprint')} title="打开当前工作图">工作图</a>}
        <button onClick={() => setSettingsOpen(true)}>设置</button>
        <a href={v05Href()}>首页</a>
      </aside>

      {introOpen && career.profile && <section className="vcareer-intro" aria-label="第一周开场">
        <div className="vcareer-intro-card">
          <header><small>WEEK 01 · 23:48</small><h1>先让一个东西存在。</h1></header>
          <p>桌上只有这些东西：<b>{pack.assets.slice(0, 4).join('、')}</b>。手里的现金是 ¥{pack.cash}。这些条件会改变后果，但不会替你做决定。</p>
          <blockquote>{firstMessage}</blockquote>
          <div className="vcareer-first-prompt"><small>今晚的问题</small><strong>{career.profile.firstProjectPrompt}</strong><span>完整提案、职业定位和长期规划都可以晚一点。先做第一次决定。</span></div>
          <footer><button className="primary" onClick={closeIntro}>进入第一周</button>{showBlueprint && <a href={v05Href('lab=blueprint')}>打开工作图</a>}</footer>
        </div>
      </section>}

      {briefOpen && episode && <section className="vcareer-brief" aria-label="当前任务线简报">
        <header><div><small>{stage.code} / CURRENT LINE</small><h2>{episode.title}</h2></div><button aria-label="关闭任务线简报" onClick={() => setBriefOpen(false)}>×</button></header>
        <p className="vcareer-hook">{episode.hook}</p>
        {episodePeople.length > 0 && <div className="vcareer-people">{episodePeople.map((npc) => <span key={npc.id}><b>{npc.name}</b>{npc.role}</span>)}</div>}
        <div className="vcareer-goals"><small>现在真正需要决定的事</small>{episode.goals.map((goal, index) => <div key={goal}><i>{String(index + 1).padStart(2, '0')}</i><span>{goal}</span></div>)}</div>
        {episode.blueprintMoment && showBlueprint && <aside><small>工作图</small><p>{episode.blueprintMoment}</p><a href={v05Href('lab=blueprint')}>打开当前工作图 →</a></aside>}
      </section>}

      <V05SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)}/>
    </div>
  );
}
