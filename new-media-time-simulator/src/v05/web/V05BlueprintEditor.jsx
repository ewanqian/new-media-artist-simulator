import { useEffect } from 'react';
import { editorNodeById } from '../blueprintEditorCatalog.ts';
import {
  buildButterflyScholarTrainingPreset,
  BUTTERFLY_TRAINING_ALLOWED_NODES,
  BUTTERFLY_TRAINING_BLUEPRINT_ID
} from '../butterflyScholarTrainingPreset.ts';
import { EP00_STATE_KEY, ep00CaptureById } from '../ep00Onboarding.ts';
import { buildEp00TrainingPreset, EP00_ALLOWED_NODES_BY_CAPTURE, EP00_BLUEPRINT_ID } from '../ep00Nodes.ts';
import V05BlueprintEditorV2 from './V05BlueprintEditorV2.jsx';
import V05ButterflyTrainingHUD from './V05ButterflyTrainingHUD.jsx';
import V05Ep00TrainingHUD from './V05Ep00TrainingHUD.jsx';

const AUTOSAVE_KEY = 'nmas-blueprint-editor-autosave-v2';
const RELATION_LABELS = { signal: '数据线', physical: '步骤线', dependency: '条件线', concept: '引用线' };

function requestedPreset() {
  return new URLSearchParams(window.location.search).get('preset');
}

function trainingKind() {
  const preset = requestedPreset();
  if (preset === 'costarica' || preset === 'butterfly') return 'costarica';
  if (preset === 'ep00') return 'ep00';
  return null;
}

function readEp00Capture() {
  const query = new URLSearchParams(window.location.search).get('capture');
  if (query) return ep00CaptureById(query).id;
  try {
    const state = JSON.parse(localStorage.getItem(EP00_STATE_KEY) || 'null');
    return ep00CaptureById(state?.capture).id;
  } catch {
    return 'photo';
  }
}

function augmentFieldChecklist() {
  const field = editorNodeById.get('field-capture-session');
  if (!field) return;
  const existing = new Set((field.params || []).map((item) => item.id));
  const additions = [
    { id: 'subjectReady', label: '采集对象已确认', kind: 'toggle', defaultValue: false },
    { id: 'conditionsReady', label: '现场条件已记录', kind: 'toggle', defaultValue: false },
    { id: 'questionReady', label: '观察问题已写下', kind: 'toggle', defaultValue: false }
  ].filter((item) => !existing.has(item.id));
  if (additions.length) field.params = [...(field.params || []), ...additions];
}

function loadRequestedPreset(kind) {
  if (!kind) return;
  if (kind === 'costarica') {
    augmentFieldChecklist();
    try {
      const current = JSON.parse(localStorage.getItem(AUTOSAVE_KEY) || 'null');
      if (current?.id === BUTTERFLY_TRAINING_BLUEPRINT_ID && Number(current.revision || 0) >= 5) return;
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(buildButterflyScholarTrainingPreset()));
    } catch {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(buildButterflyScholarTrainingPreset()));
    }
    return;
  }

  const capture = readEp00Capture();
  try {
    const current = JSON.parse(localStorage.getItem(AUTOSAVE_KEY) || 'null');
    const captureMatches = current?.notes?.includes?.(`EP00_CAPTURE:${capture}`);
    if (current?.id === EP00_BLUEPRINT_ID && captureMatches) return;
    const preset = buildEp00TrainingPreset(capture);
    preset.notes = [...(preset.notes || []), `EP00_CAPTURE:${capture}`];
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(preset));
  } catch {
    const preset = buildEp00TrainingPreset(capture);
    preset.notes = [...(preset.notes || []), `EP00_CAPTURE:${capture}`];
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(preset));
  }
}

function destinationHref(kind) {
  const params = new URLSearchParams(window.location.search);
  const rootPreview = params.get('core') === 'v05' && !window.location.pathname.includes('/v05/');
  const mode = kind === 'ep00' ? 'ep00' : 'career';
  return rootPreview ? `./?core=v05&mode=${mode}` : `./?mode=${mode}`;
}

export default function V05BlueprintEditor() {
  const kind = trainingKind();
  const ep00Capture = kind === 'ep00' ? readEp00Capture() : null;
  loadRequestedPreset(kind);

  useEffect(() => {
    let nodePointerActive = false;
    let releaseTimer = null;
    const mobileTabs = () => document.querySelector('.be-mobile-tabs');
    const allowedNodeIds = kind === 'costarica'
      ? BUTTERFLY_TRAINING_ALLOWED_NODES
      : kind === 'ep00' && ep00Capture
        ? EP00_ALLOWED_NODES_BY_CAPTURE[ep00Capture]
        : null;
    const allowedLabels = allowedNodeIds ? new Set(allowedNodeIds.map((id) => editorNodeById.get(id)?.label).filter(Boolean)) : null;

    const refreshEditorChrome = () => {
      const input = document.getElementById('be-import-code');
      if (input) {
        input.setAttribute('aria-label', '导入代码');
        const label = input.closest('label');
        const caption = label?.querySelector('span');
        if (caption && caption.textContent !== '导入代码') caption.textContent = '导入代码';
      }

      document.querySelectorAll('.be-edge-types button').forEach((button) => {
        const raw = button.dataset.edgeKind || button.textContent?.trim();
        const translated = raw ? RELATION_LABELS[raw] : null;
        if (!raw || !translated) return;
        if (button.dataset.edgeKind !== raw) button.dataset.edgeKind = raw;
        if (button.textContent?.trim() !== translated) button.textContent = translated;
        const explanation = raw === 'signal' ? '数据或信号从一个节点进入另一个节点' : raw === 'physical' ? '制作顺序、工序或空间步骤关系' : raw === 'dependency' ? '没有这个条件，后面的节点就不能成立' : '概念、知识、来源或方法引用关系';
        if (button.getAttribute('title') !== explanation) button.setAttribute('title', explanation);
      });
      document.querySelectorAll('.be-inspector .be-hint').forEach((hint) => {
        if (!hint.closest('.be-inspector')?.querySelector('.be-edge-types')) return;
        const copy = kind === 'ep00'
          ? 'EP00 先只学数据线：材料从输入经过处理，到达输出。后面的章节才会逐渐加入步骤线、条件线和引用线。'
          : '连接不是一根万能线：数据线传资料，步骤线表达工序，条件线表达前提，引用线表达知识、来源或方法关系。';
        if (hint.textContent !== copy) hint.textContent = copy;
      });

      if (kind && allowedLabels) {
        document.querySelectorAll('.be-library button,.be-palette button').forEach((button) => {
          const label = button.querySelector('b,strong')?.textContent?.trim();
          if (!label) return;
          const display = allowedLabels.has(label) ? '' : 'none';
          if (button.style.display !== display) button.style.display = display;
        });
        const returnLink = [...document.querySelectorAll('.be-topbar nav a')].find((link) => link.textContent?.trim() === '返回');
        const destination = destinationHref(kind);
        if (returnLink && returnLink.getAttribute('href') !== destination) returnLink.setAttribute('href', destination);
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
      if (target?.closest('.be-node,.be-wires')) return;
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
  }, [kind, ep00Capture]);

  return <>{kind === 'costarica' && <V05ButterflyTrainingHUD />}{kind === 'ep00' && <V05Ep00TrainingHUD />}<V05BlueprintEditorV2 /></>;
}
