import { useEffect, useMemo, useState } from 'react';
import Assessment from '../components/Assessment.jsx';
import ArchetypePicker from '../components/ArchetypePicker.jsx';
import Dashboard from '../components/Dashboard.jsx';
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
} from '../engine/gameEngine.js';

const STORAGE_KEY = 'new-media-time-simulator-save';

export default function LegacySimulator() {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : createInitialState();
    } catch {
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

  const handleSelectArchetype = (archetypeId) => setState((current) => startGameWithArchetype(current, archetypeId));
  const handleStartProject = (projectId) => setState((current) => startProject(current, projectId));
  const handleMove = (regionId) => setState((current) => moveToRegion(current, regionId));
  const handlePerformAction = (actionId) => setState((current) => performAction(current, actionId));
  const handleEquipSkill = (slot, skillId) => setState((current) => equipSkill(current, slot, skillId));

  if (state.stage === 'assessment') {
    return <Assessment answers={state.answers} onAnswer={handleAnswer} onFinish={handleFinishAssessment} getRecommendation={getRecommendedArchetype}/>;
  }
  if (state.stage === 'pick') return <ArchetypePicker recommendedId={state.recommendedArchetypeId} onSelect={handleSelectArchetype}/>;
  return <Dashboard
    state={state}
    computedStats={computedStats}
    currentRegion={currentRegion}
    currentSubmap={currentSubmap}
    availableRegions={availableRegions}
    onStartProject={handleStartProject}
    onMove={handleMove}
    onPerformAction={handlePerformAction}
    onEquipSkill={handleEquipSkill}
  />;
}
