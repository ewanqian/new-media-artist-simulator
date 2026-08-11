import { useEffect, useState } from 'react';
import { CAREER_PROFILE_KEY } from '../careerContent.ts';
import { applyV05UiSettings, loadV05UiSettings, saveV05UiSettings } from '../uiSettings.ts';
import './v05-system-tools.css';

function loadCareerMode() {
  try { return JSON.parse(localStorage.getItem(CAREER_PROFILE_KEY) || 'null')?.workMode || 'hybrid'; }
  catch { return 'hybrid'; }
}

export default function V05SettingsPanel({ open, onClose }) {
  const [settings, setSettings] = useState(loadV05UiSettings);
  const [careerMode, setCareerMode] = useState(loadCareerMode);

  useEffect(() => {
    applyV05UiSettings(settings);
  }, []);

  function update(patch) {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveV05UiSettings(next);
  }

  function updateCareerMode(mode) {
    setCareerMode(mode);
    try {
      const profile = JSON.parse(localStorage.getItem(CAREER_PROFILE_KEY) || 'null');
      if (profile) localStorage.setItem(CAREER_PROFILE_KEY, JSON.stringify({ ...profile, workMode: mode }));
    } catch {}
  }

  if (!open) return null;
  return (
    <div className="vs-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="vs-dialog" role="dialog" aria-modal="true" aria-label="游戏设置">
        <header><div><small>SYSTEM</small><h2>设置</h2></div><button aria-label="关闭设置" onClick={onClose}>×</button></header>
        <div className="vs-setting-group">
          <label><span><strong>生涯制作方式</strong><small>只改变制作环节怎么操作，不改变剧情、人物和后果。</small></span>
            <select aria-label="生涯制作方式" value={careerMode} onChange={(event) => updateCareerMode(event.target.value)}>
              <option value="story">纯叙事</option><option value="hybrid">混合</option><option value="blueprint">工作图优先</option>
            </select>
          </label>
          <label><span><strong>界面尺寸</strong><small>只改变信息密度，不改变规则。</small></span>
            <select aria-label="界面尺寸" value={settings.scale} onChange={(event) => update({ scale: event.target.value })}>
              <option value="compact">紧凑</option><option value="standard">标准</option><option value="large">放大</option>
            </select>
          </label>
          <label><span><strong>叙事密度</strong><small>作为后续 Episode 文本展开程度的偏好。</small></span>
            <select aria-label="叙事密度" value={settings.narrative} onChange={(event) => update({ narrative: event.target.value })}>
              <option value="concise">简洁</option><option value="standard">标准</option><option value="full">完整</option>
            </select>
          </label>
          <label className="vs-check"><span><strong>减少动态</strong><small>关闭不必要的过渡与提示动画。</small></span><input aria-label="减少动态" type="checkbox" checked={settings.reducedMotion} onChange={(event) => update({ reducedMotion: event.target.checked })}/></label>
        </div>
        <footer><span>界面设置即时生效；生涯制作方式会在重新进入生涯时刷新入口。</span><button className="primary" onClick={onClose}>完成</button></footer>
      </section>
    </div>
  );
}
