import { useEffect, useMemo, useState } from 'react';
import {
  CAREER_PROFILE_KEY,
  CAREER_SAVE_KEY,
  careerEpisodes,
  careerNpcArcs,
  careerStageById
} from '../careerContent.ts';
import V05TriadExperience from './V05TriadExperience.jsx';
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

export default function V05CareerExperienceShell() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const [career, setCareer] = useState(readCareer);

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

  useEffect(() => {
    if (!career.profile || !career.save?.careerProfileId || career.save?.screen !== 'play') return undefined;
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      const title = document.querySelector('.vx-title');
      if (!title) {
        if (attempts > 80) window.clearInterval(timer);
        return;
      }
      const button = [...title.querySelectorAll('button')].find((item) => item.textContent?.trim() === '继续');
      if (button) {
        button.click();
        window.clearInterval(timer);
      }
    }, 50);
    return () => window.clearInterval(timer);
  }, [career.profile?.id]);

  const stage = careerStageById(career.save?.careerStageId);
  const episode = useMemo(() => currentCareerEpisode(career.save), [career.save]);
  const showBlueprint = career.profile?.workMode !== 'story';
  const episodePeople = (episode?.primaryNpcIds || []).map((id) => careerNpcArcs.find((npc) => npc.id === id)).filter(Boolean);

  return (
    <div className="vcareer-wrap">
      <V05TriadExperience />
      <aside className="vcareer-rail" aria-label="生涯工具">
        <button className="vcareer-stage" onClick={() => setBriefOpen((value) => !value)}>
          <small>CAREER {stage.index}/5</small><strong>{stage.title}</strong><span>{stage.subtitle}</span>
        </button>
        {showBlueprint && <a href={v05Href('lab=blueprint')} title="打开当前工作图">工作图</a>}
        <button onClick={() => setSettingsOpen(true)}>设置</button>
        <a href={v05Href()}>首页</a>
      </aside>

      {briefOpen && episode && <section className="vcareer-brief" aria-label="当前任务线简报">
        <header><div><small>{stage.code} / CURRENT LINE</small><h2>{episode.title}</h2></div><button aria-label="关闭任务线简报" onClick={() => setBriefOpen(false)}>×</button></header>
        <p className="vcareer-hook">{episode.hook}</p>
        {episodePeople.length > 0 && <div className="vcareer-people">{episodePeople.map((npc) => <span key={npc.id}><b>{npc.name}</b>{npc.role}</span>)}</div>}
        <div className="vcareer-goals"><small>现在值得追的事</small>{episode.goals.map((goal, index) => <div key={goal}><i>{String(index + 1).padStart(2, '0')}</i><span>{goal}</span></div>)}</div>
        {episode.blueprintMoment && career.profile?.workMode !== 'story' && <aside><small>工作图入口</small><p>{episode.blueprintMoment}</p><a href={v05Href('lab=blueprint')}>打开工作图 →</a></aside>}
      </section>}
      <V05SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)}/>
    </div>
  );
}
