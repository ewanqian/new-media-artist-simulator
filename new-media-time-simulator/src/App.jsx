import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import Assessment from './components/Assessment.jsx';
import ArchetypePicker from './components/ArchetypePicker.jsx';
import Dashboard from './components/Dashboard.jsx';
import './v05/onboardingPolicy.ts';
import './v05/web/v05-mobile-fix.css';
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
const V05Experience = lazy(() => import('./v05/web/V05TriadExperience.jsx'));
const V05BlueprintEditor = lazy(() => import('./v05/web/V05BlueprintEditor.jsx'));
const V05Home = lazy(() => import('./v05/web/V05Home.jsx'));
const STORAGE_KEY = 'new-media-time-simulator-save';

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const corePreview = params.get('core');
  const pathPreview = window.location.pathname.includes('/v05/') ? 'v05' : window.location.pathname.includes('/v03/') ? 'v03' : null;
  const preview = corePreview || pathPreview;
  const lab = params.get('lab');
  const mode = params.get('mode');

  if (preview === 'v05' && lab === 'blueprint') {
    return (
      <Suspense fallback={<main className="app-shell"><section className="panel">正在载入节点编辑器…</section></main>}>
        <V05BlueprintEditor />
      </Suspense>
    );
  }
  if (preview === 'v05' && (mode === 'story' || (corePreview === 'v05' && !mode && !lab))) {
    return (
      <Suspense fallback={<main className="app-shell"><section className="panel">正在载入新媒体艺术家模拟器…</section></main>}>
        <V05Experience />
      </Suspense>
    );
  }
  if (preview === 'v05') {
    return (
      <Suspense fallback={<main className="app-shell"><section className="panel">正在载入…</section></main>}>
        <V05Home />
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

  const handleStartProject = (projectId) => {
    setState((current) => startProject(current, projectId));
  };

  const handleMove = (regionId) => {
    setState((current) => moveToRegion(current, regionId));
  };

  const handlePerformAction = (actionId) => {
    setState((current) => performAction(current, actionId));
  };

  const handleEquipSkill = (slot, skillId) => {
    setState((current) => equipSkill(current, slot, skillId));
  };

  if (state.stage === 'assessment') {
    return (
      <Assessment
        answers={state.answers}
        onAnswer={handleAnswer}
        onFinish={handleFinishAssessment}
        getRecommendation={getRecommendedArchetype}
      />
    );
  }

  if (state.stage === 'pick') {
    return <ArchetypePicker recommendedId={state.recommendedArchetypeId} onSelect={handleSelectArchetype} />;
  }

  return (
    <Dashboard
      state={state}
      computedStats={computedStats}
      currentRegion={currentRegion}
      currentSubmap={currentSubmap}
      availableRegions={availableRegions}
      onStartProject={handleStartProject}
      onMove={handleMove}
      onPerformAction={handlePerformAction}
      onEquipSkill={handleEquipSkill}
    />
  );
}
