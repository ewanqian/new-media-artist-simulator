import { useMemo, useState } from 'react';
import { CAREER_PROFILE_KEY, CAREER_SAVE_KEY, careerStageById } from '../careerContent.ts';
import V05TriadExperience from './V05TriadExperience.jsx';
import V05SettingsPanel from './V05SettingsPanel.jsx';
import './v05-career-shell.css';

export default function V05CareerExperienceShell() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const career = useMemo(() => {
    try {
      const profile = JSON.parse(localStorage.getItem(CAREER_PROFILE_KEY) || 'null');
      const save = JSON.parse(localStorage.getItem(CAREER_SAVE_KEY) || 'null');
      return { profile, save };
    } catch { return { profile: null, save: null }; }
  }, []);
  const stage = careerStageById(career.save?.careerStageId);
  const showBlueprint = career.profile?.workMode !== 'story';

  return (
    <div className="vcareer-wrap">
      <V05TriadExperience />
      <aside className="vcareer-rail" aria-label="生涯工具">
        <div className="vcareer-stage"><small>CAREER {stage.index}/5</small><strong>{stage.title}</strong><span>{stage.subtitle}</span></div>
        {showBlueprint && <a href="./?lab=blueprint" title="打开当前工作图">工作图</a>}
        <button onClick={() => setSettingsOpen(true)}>设置</button>
        <a href="./">首页</a>
      </aside>
      <V05SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)}/>
    </div>
  );
}
