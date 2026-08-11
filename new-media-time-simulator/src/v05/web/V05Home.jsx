import { useMemo, useState } from 'react';
import { CAREER_PROFILE_KEY, CAREER_SAVE_KEY } from '../careerContent.ts';
import V05SettingsPanel from './V05SettingsPanel.jsx';
import './v05-home.css';

function v05Href(query = '') {
  const params = new URLSearchParams(window.location.search);
  const rootPreview = params.get('core') === 'v05' && !window.location.pathname.includes('/v05/');
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
          <div><small>NEW MEDIA ARTIST SIMULATOR</small><h1>新媒体艺术家模拟器</h1><p>进入一段艺术实践，或者直接打开工作图。项目、人物、现场和档案都使用同一套状态。</p></div>
          <button className="vh-settings" onClick={() => setSettingsOpen(true)}>设置</button>
        </header>

        <div className="vh-modes two">
          <a className="primary" href={career.save ? v05Href('mode=story') : v05Href('mode=career')}>
            <small>CAREER</small>
            <strong>生涯模式</strong>
            <span>{career.profile ? `继续：${career.profile.title} · 第 ${career.save?.week || 1} 周` : '建立起步档案，在阅读、决策与工作图之间推进五阶段生涯。'}</span>
            <em>{career.save ? '继续当前生涯 →' : '进入生涯 →'}</em>
          </a>
          <div className="vh-free-card">
            <small>FREE CREATE</small><strong>自由创作</strong><span>从空白开始搭节点，或者继续最近一次工作图。</span>
            <div><a href={v05Href('lab=blueprint&mode=free&blank=1')}>新建空白</a><a href={v05Href('lab=blueprint')}>打开最近工作图</a></div>
          </div>
        </div>

        <section className="vh-special" aria-label="特殊路线">
          <div>
            <small>SPECIAL ROUTE · NARRATIVE PACK 01</small>
            <strong>哥斯达黎加的蝴蝶学者</strong>
            <p>你本人是一位以蝴蝶、寄主植物与空间扫描为材料的艺术家。一次研究站邀请把采集、重建、人物关系、身份隐情和作品公开连成同一条路线。</p>
            <div className="vh-special-tags"><span>摄影测量</span><span>Metashape</span><span>COLMAP</span><span>Gaussian</span><span>人物记忆</span><span>叙事反转</span></div>
          </div>
          <a href={v05Href('mode=butterfly')}>进入特殊路线 →</a>
        </section>

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
