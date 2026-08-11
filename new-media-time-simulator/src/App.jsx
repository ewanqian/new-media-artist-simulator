import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import Assessment from './components/Assessment.jsx';
import ArchetypePicker from './components/ArchetypePicker.jsx';
import Dashboard from './components/Dashboard.jsx';
import {
  createInitialState,
  equipSkill,
  getAvailableRegions,
  getComputedStats,
  getCurrentSubmap,
  getRecommendedArchetype,
  getRegionById,
  moveToRegion,
  performAction,
  startGameWithArchetype,
  startProject
} from './engine/gameEngine.js';

const V03CorePreview = lazy(() => import('./v03/web/V03CorePreview.jsx'));
const V05Experience = lazy(() => import('./v05/web/V05Experience.jsx'));
const STORAGE_KEY = 'new-media-time-simulator-save';

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const pathPreview = window.location.pathname.includes('/v05/') ? 'v05' : window.location.pathname.includes('/v03/') ? 'v03' : null;
  const preview = params.get('core') || pathPreview;
  if (preview === 'v05') {
    return (
      <Suspense fallback={<main className="app-shell"><section className="panel">正在载入新媒体艺术家模拟器…</section></main>}>
        <V05Experience />
      </Suspense>
    );
  }
  if (preview === 'v03') {
    return (
      <Suspense fallback={<main className="app-shell"><section className="panel">正在载入 v0.3 Core Engine…</section></main>}>
        <V03CorePreview />
      </Suspense>
    );
  }
  return <LegacySimulator />;
}

function LegacySimulator() {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : createInitialState();
    } catch (error) {
      return createInitialState();
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const computedStats = useMemo(() => getComputedStats(state), [state]);
  const currentRegion = getRegionById(state.currentRegionId);
  const currentSubmap = getCurrentSubmap(state);
  const availableRegions = getAvailableRegions(state.phase);

  const handleAnswer = (index, option) => {
    setState((current) => {
      const answers = [...current.answers];
      answers[index] = option;
      return { ...current, answers };
    });
  };

  const handleFinishAssessment = (recommendedArchetypeId) => {
    setState((current) => ({
      ...current,
      recommendedArchetypeId,
      stage: 'pick',
      log: [...current.log, `测评完成。系统建议你尝试：${recommendedArchetypeId}`]
    }));
  };

  const handleSelectArchetype = (archetypeId) => {
    setState((current) => startGameWithArchetype(current, archetypeId));
  };

  const handleReset = () => {
    const fresh = createInitialState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    setState(fresh);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'new-media-artist-simulator-save.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      setState(parsed);
    } catch (error) {
      alert('导入失败：存档文件格式不对。');
    }
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">React / Vite / GitHub Pages</div>
          <strong>新媒体艺术家模拟器</strong>
        </div>
        <p>艺术生态、生存策略与技能演化实验</p>
      </header>

      {state.stage === 'intro' && (
        <Assessment
          answers={state.answers}
          onAnswer={handleAnswer}
          onFinish={handleFinishAssessment}
          recommendedArchetypeId={state.recommendedArchetypeId}
          onChooseRecommendation={handleSelectArchetype}
        />
      )}

      {state.stage === 'pick' && (
        <>
          <Assessment
            answers={state.answers}
            onAnswer={handleAnswer}
            onFinish={handleFinishAssessment}
            recommendedArchetypeId={state.recommendedArchetypeId}
            onChooseRecommendation={handleSelectArchetype}
          />
          <ArchetypePicker
            recommendedArchetypeId={state.recommendedArchetypeId}
            onSelect={handleSelectArchetype}
          />
        </>
      )}

      {state.stage === 'play' && (
        <Dashboard
          state={state}
          computedStats={computedStats}
          currentRegion={currentRegion}
          currentSubmap={currentSubmap}
          availableRegions={availableRegions}
          onMove={(regionId, submapId) => setState((current) => moveToRegion(current, regionId, submapId))}
          onAction={(actionId) => setState((current) => performAction(current, actionId))}
          onEquip={(skillId) => setState((current) => equipSkill(current, skillId))}
          onStartProject={(projectId) => setState((current) => startProject(current, projectId))}
          onReset={handleReset}
          onExport={handleExport}
          onImport={handleImport}
        />
      )}
    </main>
  );
}
