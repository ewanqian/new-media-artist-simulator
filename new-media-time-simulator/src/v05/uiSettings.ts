export type V05UiSettings = {
  scale: 'compact' | 'standard' | 'large';
  narrative: 'concise' | 'standard' | 'full';
  reducedMotion: boolean;
  autosave: boolean;
};

export const V05_UI_SETTINGS_KEY = 'nmas-v05-ui-settings';
export const defaultV05UiSettings: V05UiSettings = {
  scale: 'standard',
  narrative: 'standard',
  reducedMotion: false,
  autosave: true
};

export function loadV05UiSettings(): V05UiSettings {
  try {
    const raw = JSON.parse(localStorage.getItem(V05_UI_SETTINGS_KEY) || '{}');
    return { ...defaultV05UiSettings, ...(raw || {}) };
  } catch {
    return { ...defaultV05UiSettings };
  }
}

export function saveV05UiSettings(settings: V05UiSettings) {
  localStorage.setItem(V05_UI_SETTINGS_KEY, JSON.stringify(settings));
  applyV05UiSettings(settings);
}

export function applyV05UiSettings(settings: V05UiSettings) {
  document.documentElement.dataset.nmasScale = settings.scale;
  document.documentElement.dataset.nmasNarrative = settings.narrative;
  document.documentElement.dataset.nmasReducedMotion = settings.reducedMotion ? 'true' : 'false';
}
