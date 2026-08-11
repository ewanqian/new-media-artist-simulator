import { useMemo, useState } from 'react';
import { CAREER_PROFILE_KEY, CAREER_SAVE_KEY } from '../careerContent.ts';
import V05SettingsPanel from './V05SettingsPanel.jsx';
import './v05-home.css';

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
          <div><small>NEW MEDIA ARTIST SIMULATOR</small><h1>新媒体艺术家模拟器</h1><p>从一个正在形成的实践开始。生涯模式负责人物、项目、场域和长期后果；自由创作用同一套节点语言直接搭自己的工作图。</p></div>
          <button className="vh-settings" onClick={() => setSettingsOpen(true)}>设置</button>
        </header>

        <div className="vh-modes two">
          <a className="primary" href={career.save ? './?mode=story' : './?mode=career'}>
            <small>CAREER</small>
            <strong>生涯模式</strong>
            <span>{career.profile ? `继续：${career.profile.title} · 第 ${career.save?.week || 1} 周` : '角色建模 → 起始资源 → 五阶段生涯。节点工作台可选，不强制。'}</span>
            <em>{career.save ? '继续当前生涯 →' : '建立起步档案 →'}</em>
          </a>
          <div className="vh-free-card">
            <small>FREE CREATE</small><strong>自由创作</strong><span>自由模式和节点编辑器合并到这里：新建空白工作图，或者继续最近一次编辑。</span>
            <div><a href="./?lab=blueprint&mode=free&blank=1">新建空白</a><a href="./?lab=blueprint">打开最近工作图</a></div>
          </div>
        </div>

        <nav className="vh-tools" aria-label="系统工具">
          <a href="./?mode=content"><small>CONTENT</small><strong>内容管理</strong><span>生涯档案 · 蓝图库 · 导入导出</span></a>
          <button onClick={() => setSettingsOpen(true)}><small>SETTINGS</small><strong>设置</strong><span>界面尺寸 · 叙事密度 · 动态 · 自动保存</span></button>
        </nav>
        <footer><span>v0.6 · content production</span><span>FIELD / WORKBENCH / RECORDS · Blueprint as optional language</span></footer>
      </section>
      <V05SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)}/>
    </main>
  );
}
