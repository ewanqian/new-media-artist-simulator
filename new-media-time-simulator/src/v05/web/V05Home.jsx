import { useMemo, useState } from 'react';
import { CAREER_PROFILE_KEY, CAREER_SAVE_KEY } from '../careerContent.ts';
import V05SettingsPanel from './V05SettingsPanel.jsx';
import './v05-home.css';

function v05Href(query = '') {
  const params = new URLSearchParams(window.location.search);
  const rootPreview = params.get('core') === 'v05' && !window.location.pathname.includes('/v05/') && !window.location.pathname.includes('/v051/');
  if (!query) return rootPreview ? './?core=v05' : './';
  return rootPreview ? `./?core=v05&${query}` : `./?${query}`;
}

export default function V05Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const career = useMemo(() => {
    try {
      const profile = JSON.parse(localStorage.getItem(CAREER_PROFILE_KEY) || 'null');
      const save = JSON.parse(localStorage.getItem(CAREER_SAVE_KEY) || 'null');
      return { profile, save };
    } catch { return { profile: null, save: null }; }
  }, []);

  return (
    <main className="vh-shell">
      <section className="vh-card">
        <header className="vh-head">
          <div><small>NEW MEDIA ARTIST SIMULATOR</small><h1>新媒体艺术家模拟器</h1><p>进入生涯与章节，或者直接打开工作图。</p></div>
          <button className="vh-settings" onClick={() => setSettingsOpen(true)}>设置</button>
        </header>

        <div className="vh-modes two">
          <a className="primary" href={v05Href('mode=core')}>
            <small>PLAY</small>
            <strong>开始第一件作品</strong>
            <span>{career.profile ? `继续：${career.profile.title} · 第 ${career.save?.week || 1} 周` : '七天后的首次委托：做一个选择、看到结果、留下第一件作品。'}</span>
            <em>开始生涯 →</em>
          </a>
          <div className="vh-free-card">
            <small>FREE CREATE</small><strong>自由创作</strong><span>从空白开始搭节点，或者继续最近一次工作图。</span>
            <div><a href={v05Href('lab=blueprint&mode=free&blank=1')}>新建空白</a><a href={v05Href('lab=blueprint')}>打开最近工作图</a></div>
          </div>
        </div>

        <nav className="vh-tools" aria-label="系统工具">
          <a href={v05Href('mode=content')}><small>CONTENT</small><strong>内容管理</strong><span>生涯档案 · 蓝图库 · 导入导出</span></a>
          <button onClick={() => setSettingsOpen(true)}><small>SETTINGS</small><strong>设置</strong><span>界面尺寸 · 叙事密度 · 动态 · 自动保存</span></button>
        </nav>
        <footer><span>v0.6 · content production</span><span>READ / DECIDE · Blueprint as playable language</span></footer>
      </section>
      <V05SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)}/>
    </main>
  );
}
