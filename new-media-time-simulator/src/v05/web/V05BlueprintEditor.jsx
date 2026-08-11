import { useEffect } from 'react';
import { buildButterflyScholarPreset } from '../blueprintEditorCatalog.ts';
import V05BlueprintEditorV2 from './V05BlueprintEditorV2.jsx';

const AUTOSAVE_KEY = 'nmas-blueprint-editor-autosave-v2';

function loadRequestedPreset() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('preset') !== 'butterfly') return;
  try {
    const current = JSON.parse(localStorage.getItem(AUTOSAVE_KEY) || 'null');
    if (current?.id === 'bp-butterfly-scholar-field-capture') return;
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(buildButterflyScholarPreset()));
  } catch {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(buildButterflyScholarPreset()));
  }
}

export default function V05BlueprintEditor() {
  loadRequestedPreset();

  useEffect(() => {
    let nodePointerActive = false;
    let releaseTimer = null;

    const mobileTabs = () => document.querySelector('.be-mobile-tabs');

    const relabelShareImport = () => {
      const input = document.getElementById('be-import-code');
      if (!input) return;
      input.setAttribute('aria-label', '导入代码');
      const label = input.closest('label');
      const caption = label?.querySelector('span');
      if (caption && caption.textContent !== '导入代码') caption.textContent = '导入代码';
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
      if (target?.closest('.be-viewport')) {
        event.stopPropagation();
      }
    };

    const releaseNodePointer = () => {
      if (releaseTimer) window.clearTimeout(releaseTimer);
      releaseTimer = window.setTimeout(() => {
        nodePointerActive = false;
        mobileTabs()?.style.removeProperty('pointer-events');
      }, 0);
    };

    const observer = new MutationObserver(relabelShareImport);
    observer.observe(document.body, { childList: true, subtree: true });
    relabelShareImport();

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
  }, []);

  return <V05BlueprintEditorV2 />;
}
