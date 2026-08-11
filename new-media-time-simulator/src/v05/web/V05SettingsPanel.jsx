import { useEffect, useState } from 'react';
import { applyV05UiSettings, loadV05UiSettings, saveV05UiSettings } from '../uiSettings.ts';
import './v05-system-tools.css';

export default function V05SettingsPanel({ open, onClose }) {
  const [settings, setSettings] = useState(loadV05UiSettings);

  useEffect(() => {
    applyV05UiSettings(settings);
  }, []);

  function update(patch) {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveV05UiSettings(next);
  }

  if (!open) return null;
  return (
    <div className="vs-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="vs-dialog" role="dialog" aria-modal="true" aria-label="游戏设置">
        <header><div><small>SYSTEM</small><h2>设置</h2></div><button aria-label="关闭设置" onClick={onClose}>×</button></header>
        <div className="vs-setting-group">
          <label><span><strong>界面尺寸</strong><small>只改变信息密度，不改变规则。</small></span>
            <select aria-label="界面尺寸" value={settings.scale} onChange={(event) => update({ scale: event.target.value })}>
              <option value="compact">紧凑</option><option value="standard">标准</option><option value="large">放大</option>
            </select>
          </label>
          <label><span><strong>叙事密度</strong><small>后续 Episode 文本会使用这一偏好。</small></span>
            <select aria-label="叙事密度" value={settings.narrative} onChange={(event) => update({ narrative: event.target.value })}>
              <option value="concise">简洁</option><option value="standard">标准</option><option value="full">完整</option>
            </select>
          </label>
          <label className="vs-check"><span><strong>减少动态</strong><small>关闭不必要的过渡与提示动画。</small></span><input aria-label="减少动态" type="checkbox" checked={settings.reducedMotion} onChange={(event) => update({ reducedMotion: event.target.checked })}/></label>
          <label className="vs-check"><span><strong>自动保存</strong><small>节点图和生涯继续使用浏览器本地存储。</small></span><input aria-label="自动保存" type="checkbox" checked={settings.autosave} onChange={(event) => update({ autosave: event.target.checked })}/></label>
        </div>
        <footer><span>设置已即时保存到本机。</span><button className="primary" onClick={onClose}>完成</button></footer>
      </section>
    </div>
  );
}
