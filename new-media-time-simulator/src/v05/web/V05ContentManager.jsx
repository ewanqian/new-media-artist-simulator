import { useMemo, useRef, useState } from 'react';
import { CAREER_PROFILE_KEY, CAREER_SAVE_KEY } from '../careerContent.ts';
import { V05_UI_SETTINGS_KEY } from '../uiSettings.ts';
import './v05-system-tools.css';

const BLUEPRINT_LIBRARY_KEY = 'nmas-blueprint-library-v2';
const BLUEPRINT_AUTOSAVE_KEY = 'nmas-blueprint-editor-autosave-v2';

function readJson(key, fallback = null) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; }
}

function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

export default function V05ContentManager() {
  const [, force] = useState(0);
  const inputRef = useRef(null);
  const profile = readJson(CAREER_PROFILE_KEY, null);
  const save = readJson(CAREER_SAVE_KEY, null);
  const blueprintLibrary = readJson(BLUEPRINT_LIBRARY_KEY, []);
  const blueprintAutosave = readJson(BLUEPRINT_AUTOSAVE_KEY, null);
  const settings = readJson(V05_UI_SETTINGS_KEY, null);
  const counts = useMemo(() => ({
    blueprints: Array.isArray(blueprintLibrary) ? blueprintLibrary.length : 0,
    nodes: Array.isArray(blueprintLibrary) ? blueprintLibrary.reduce((sum, item) => sum + Number(item?.nodes?.length || 0), 0) : 0,
    evidence: Number(save?.evidenceIds?.length || 0),
    archiveRead: Number(save?.readKnowledgeEntryIds?.length || 0)
  }), [blueprintLibrary, save]);

  function exportAll() {
    downloadJson(`nmas-local-content-${new Date().toISOString().slice(0, 10)}.json`, {
      schema: 'nmas-local-content-bundle-v1', exportedAt: new Date().toISOString(),
      careerProfile: profile, careerSave: save, blueprintLibrary, blueprintAutosave, uiSettings: settings
    });
  }

  async function importAll(file) {
    if (!file) return;
    const text = await file.text();
    const bundle = JSON.parse(text);
    if (bundle?.schema !== 'nmas-local-content-bundle-v1') throw new Error('不是可识别的新媒体艺术家模拟器内容包。');
    if (bundle.careerProfile) localStorage.setItem(CAREER_PROFILE_KEY, JSON.stringify(bundle.careerProfile));
    if (bundle.careerSave) localStorage.setItem(CAREER_SAVE_KEY, JSON.stringify(bundle.careerSave));
    if (Array.isArray(bundle.blueprintLibrary)) localStorage.setItem(BLUEPRINT_LIBRARY_KEY, JSON.stringify(bundle.blueprintLibrary));
    if (bundle.blueprintAutosave) localStorage.setItem(BLUEPRINT_AUTOSAVE_KEY, JSON.stringify(bundle.blueprintAutosave));
    if (bundle.uiSettings) localStorage.setItem(V05_UI_SETTINGS_KEY, JSON.stringify(bundle.uiSettings));
    force((value) => value + 1);
  }

  return (
    <main className="vtool-shell"><section className="vtool-panel">
      <header className="vtool-top"><div><small>LOCAL CONTENT</small><h1>内容管理</h1><p>这里管理的是浏览器本地的生涯档案、Blueprint 库和设置。游戏模式本身不会再为导入导出单开一个入口。</p></div><a href="./">返回首页</a></header>
      <div className="vtool-grid">
        <article className="vtool-card"><small>CAREER PROFILE</small><strong>{profile?.title || '还没有角色档案'}</strong><p>{profile ? `${profile.workMode || 'hybrid'} · ${(profile.signalTags || []).join(' / ')}` : '从生涯模式建立预置档案或完成 5 题角色建模。'}</p></article>
        <article className="vtool-card"><small>CAREER SAVE</small><strong>{save ? `第 ${save.week || 1} 周 · ${save.careerStageId || 'stage-1'}` : '没有生涯存档'}</strong><p>{save ? `${counts.evidence} 条 Evidence · 已读档案 ${counts.archiveRead}` : '进入第一周后会在这里出现。'}</p></article>
        <article className="vtool-card"><small>BLUEPRINT LIBRARY</small><strong>{counts.blueprints} 份蓝图 · {counts.nodes} 个已保存节点</strong><p>{blueprintAutosave ? `自动保存：${blueprintAutosave.title || '未命名蓝图'}` : '还没有自动保存的工作图。'}</p></article>
        <article className="vtool-card"><small>PORTABILITY</small><strong>一个本地内容包</strong><p>把角色、生涯、蓝图库、当前工作图和 UI 设置一起导出。导入不会运行任何远程脚本。</p></article>
      </div>
      <div className="vtool-actions"><button className="primary" onClick={exportAll}>导出全部本地内容</button><label>导入内容包<input ref={inputRef} type="file" accept="application/json,.json" onChange={(event) => importAll(event.target.files?.[0]).catch((error) => window.alert(error.message))}/></label><a href="./?lab=blueprint" style={{border:'1px solid #d6d6cf',borderRadius:8,padding:'9px 12px',fontSize:12,color:'#171717',textDecoration:'none'}}>打开最近工作图</a><a href="./?lab=blueprint&mode=free&blank=1" style={{border:'1px solid #d6d6cf',borderRadius:8,padding:'9px 12px',fontSize:12,color:'#171717',textDecoration:'none'}}>新建空白工作图</a></div>
    </section></main>
  );
}
