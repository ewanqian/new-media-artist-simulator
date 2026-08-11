import { useEffect } from 'react';
import { editorNodeById } from '../blueprintEditorCatalog.ts';
import {
  buildButterflyScholarTrainingPreset,
  BUTTERFLY_TRAINING_ALLOWED_NODES,
  BUTTERFLY_TRAINING_BLUEPRINT_ID
} from '../butterflyScholarTrainingPreset.ts';
import V05BlueprintEditorV2 from './V05BlueprintEditorV2.jsx';
import V05ButterflyTrainingHUD from './V05ButterflyTrainingHUD.jsx';

const AUTOSAVE_KEY = 'nmas-blueprint-editor-autosave-v2';

function loadRequestedPreset() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('preset') !== 'butterfly') return;
  try {
    const current = JSON.parse(localStorage.getItem(AUTOSAVE_KEY) || 'null');
    if (current?.id === BUTTERFLY_TRAINING_BLUEPRINT_ID) return;
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(buildButterflyScholarTrainingPreset()));
  } catch {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(buildButterflyScholarTrainingPreset()));
  }
}

function careerHref() {
  const params = new URLSearchParams(window.location.search);
  const rootPreview = params.get('core') === 'v05' && !window.location.pathname.includes('/v05/');
  return rootPreview ? './?core=v05&mode=career' : './?mode=career';
}

export default function V05BlueprintEditor() {
  const trainingMode = new URLSearchParams(window.location.search).get('preset') === 'butterfly';
  loadRequestedPreset();

  useEffect(() => {
    let nodePointerActive = false;
    let releaseTimer = null;
    const mobileTabs = () => document.querySelector('.be-mobile-tabs');
    const allowedLabels = trainingMode ? new Set(BUTTERFLY_TRAINING_ALLOWED_NODES.map((id) => editorNodeById.get(id)?.label).filter(Boolean)) : null;

    const refreshEditorChrome = () => {
      const input = document.getElementById('be-import-code');
      if (input) {
        input.setAttribute('aria-label', '导入代码');
        const label = input.closest('label');
        const caption = label?.querySelector('span');
        if (caption && caption.textContent !== '导入代码') caption.textContent = '导入代码';
      }
      if (trainingMode && allowedLabels) {
        document.querySelectorAll('.be-library button,.be-palette button').forEach((button) => {
          const label = button.querySelector('b,strong')?.textContent?.trim();
          if (!label) return;
          button.style.display = allowedLabels.has(label) ? '' : 'none';
        });
        const returnLink = [...document.querySelectorAll('.be-topbar nav a')].find((link) => link.textContent?.trim() === '返回');
        if (returnLink) returnLink.setAttribute('href', careerHref());
      }
    };

    const onPointerDownCapture = (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target?.closest('.be-node')) return;
      nodePointerActive = true;
      if (releaseTimer) window.clearTimeout(releaseTimer);
      mobileTabs()?.style.setProperty('pointer-events', 'none', 'important');
    };
    const onClickCapture = (event) => {
      if (!nodePointerActive) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('.be-node')) return;
      if (target?.closest('.be-viewport')) event.stopPropagation();
    };
    const releaseNodePointer = () => {
      if (releaseTimer) window.clearTimeout(releaseTimer);
      releaseTimer = window.setTimeout(() => {
        nodePointerActive = false;
        mobileTabs()?.style.removeProperty('pointer-events');
      }, 0);
    };

    const observer = new MutationObserver(refreshEditorChrome);
    observer.observe(document.body, { childList: true, subtree: true });
    refreshEditorChrome();
    document.addEventListener('pointerdown', onPointerDownCapture, true);
    document.addEventListener('click', onClickCapture, true);
    window.addEventListener('pointerup', releaseNodePointer, true);
    window.addEventListener('pointercancel', releaseNodePointer, true);
    return () => {
      observer.disconnect();
      if (releaseTimer) window.clearTimeout(releaseTimer);
      mobileTabs()?.style.removeProperty('pointer-events');
      document.removeEventListener('pointerdown', onPointerDownCapture, true);
      document.removeEventListener('click', onClickCapture, true);
      window.removeEventListener('pointerup', releaseNodePointer, true);
      window.removeEventListener('pointercancel', releaseNodePointer, true);
    };
  }, [trainingMode]);

  return <>{trainingMode && <V05ButterflyTrainingHUD />}<V05BlueprintEditorV2 /></>;
}
