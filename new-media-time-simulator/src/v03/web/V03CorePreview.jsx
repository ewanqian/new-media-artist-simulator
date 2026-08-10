import { useMemo, useState } from 'react';
import { createGameStateV1 } from '../core/state.ts';
import { createContentRegistry } from '../core/contentPack.ts';
import { createCoreCommandHandlers } from '../core/commands.ts';
import { createTurnEngine } from '../core/turnEngine.ts';
import { memorableJourneyPack } from '../content/memorableJourney.ts';

const STORAGE_KEY = 'nmas-v03-journey-lab';
const FIXED_SEED = 'browser-journey-v03';

const registry = createContentRegistry([memorableJourneyPack]);
const events = memorableJourneyPack.events;

function createFreshSession() {
  return {
    eventIndex: 0,
    state: createGameStateV1({ seed: FIXED_SEED, saveId: 'browser-v03-preview' })
  };
}

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createFreshSession();
    const parsed = JSON.parse(raw);
    if (parsed?.state?.schemaVersion !== 1 || !Number.isInteger(parsed?.eventIndex)) return createFreshSession();
    return parsed;
  } catch {
    return createFreshSession();
  }
}

function createEngine() {
  return createTurnEngine({
    commandHandlers: createCoreCommandHandlers(registry),
    resolveAssetTemplate: (id) => registry.getAsset(id),
    createId: (prefix) => `${prefix}-${crypto.randomUUID?.() || Date.now()}`
  });
}

const engine = createEngine();

const lensLabels = {
  neutral: '中规中矩',
  hype: '无脑吹',
  satire: '黑色幽默'
};

function AssetRow({ instance, onEquip }) {
  const template = registry.getAsset(instance.templateId);
  if (!template) return null;
  return (
    <article className="v03-asset-row">
      <div>
        <strong>{template.name}</strong>
        <div className="small-text">{instance.tags.join(' · ')}</div>
      </div>
      <div className="mini-button-row">
        {(template.slots || []).map((slot) => (
          <button className="mini-button" key={slot} onClick={() => onEquip(slot, instance.instanceId)}>
            装到 {slot}
          </button>
        ))}
      </div>
    </article>
  );
}

export default function V03CorePreview() {
  const initial = useMemo(loadSession, []);
  const [state, setState] = useState(initial.state);
  const [eventIndex, setEventIndex] = useState(initial.eventIndex);
  const [notice, setNotice] = useState('这是 v0.3 Core Engine 的浏览器压力测试，不是正式 UI。');

  const currentEvent = events[eventIndex] || null;

  const persist = (nextState, nextIndex = eventIndex) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: nextState, eventIndex: nextIndex }));
  };

  const resolveChoice = (choiceId) => {
    if (!currentEvent) return;
    const output = engine.dispatch(state, {
      id: `browser-event-${eventIndex}-${state.revision}`,
      type: 'event.resolve',
      contentVersion: 'core.memorable-journey@0.3.0',
      payload: { eventId: currentEvent.id, choiceId }
    });
    if (!output.result.accepted) {
      setNotice(output.result.reason?.startsWith('choice-locked')
        ? '这个选项还没有出现：检查背包与配装，规则不会因为剧情需要而放行。'
        : `操作被引擎拒绝：${output.result.reason}`);
      return;
    }
    const nextIndex = Math.min(events.length, eventIndex + 1);
    setState(output.state);
    setEventIndex(nextIndex);
    setNotice(output.result.consumesTurn ? '事件已结算，并消耗 1 个工作单位。' : '事件已结算，但没有推进时间。');
    persist(output.state, nextIndex);
  };

  const equip = (slot, instanceId) => {
    const output = engine.dispatch(state, {
      id: `browser-equip-${state.revision}-${slot}-${instanceId}`,
      type: 'loadout.equip',
      payload: { slot, instanceId }
    });
    if (!output.result.accepted) {
      setNotice(`配装失败：${output.result.reason}`);
      return;
    }
    setState(output.state);
    setNotice(`已配装 ${slot}；配装不消耗工作单位。`);
    persist(output.state, eventIndex);
  };

  const reset = () => {
    const fresh = createFreshSession();
    localStorage.removeItem(STORAGE_KEY);
    setState(fresh.state);
    setEventIndex(0);
    setNotice('已重置 Journey Lab。');
  };

  const assets = state.inventory.assetInstanceIds.map((id) => state.assets.byId[id]).filter(Boolean);
  const faction = state.factions.byId['faction.academic-new-media'];
  const institution = state.institutions.byId['institution.temp-office-001'];

  return (
    <main className="app-shell v03-shell">
      <header className="topbar v03-topbar">
        <div>
          <div className="eyebrow">v0.3 Core Engine / Journey Lab</div>
          <strong>新媒体艺术家模拟器 · 十个记忆点压力测试</strong>
        </div>
        <div className="v03-turn-chip">Turn {state.turn} · Phase {state.phase} · Rev {state.revision}</div>
      </header>

      <div className="v03-notice">{notice}</div>

      <div className="v03-layout">
        <section className="panel v03-event-panel">
          {currentEvent ? (
            <>
              <div className="section-title-row">
                <div>
                  <div className="eyebrow">Moment {String(eventIndex + 1).padStart(2, '0')} / 10</div>
                  <h2>{currentEvent.title}</h2>
                </div>
                <span className="tag">{currentEvent.category}</span>
              </div>

              <div className="v03-lens-grid">
                {Object.entries(currentEvent.lenses).map(([lens, text]) => (
                  <article className={`v03-lens v03-lens--${lens}`} key={lens}>
                    <span>{lensLabels[lens]}</span>
                    <p>{text}</p>
                  </article>
                ))}
              </div>

              {(currentEvent.mediaTemplateIds || []).length > 0 && (
                <div className="v03-media-strip">
                  {currentEvent.mediaTemplateIds.map((id) => {
                    const media = registry.getMedia(id);
                    return (
                      <div className="v03-media-card" key={id}>
                        <div className="eyebrow">MEDIA ASSET / {media?.aspectRatio || 'AUTO'}</div>
                        <strong>{media?.alt || id}</strong>
                        <span>正式图片/视频后续只替换内容资产，不改事件规则。</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="v03-choice-list">
                {currentEvent.choices.map((choice) => (
                  <button className="primary-button v03-choice" key={choice.id} onClick={() => resolveChoice(choice.id)}>
                    <strong>{choice.label}</strong>
                    <span>{choice.consumesTurn ? '消耗 1 工作单位' : '不消耗时间'}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="v03-finish">
              <div className="eyebrow">RUN ARCHIVED</div>
              <h2>这一轮没有“胜利”</h2>
              <p>你留下了一组资产、矛盾声望、机构、事故记录与一个可以跨 Run 保存的标题。</p>
              <strong>{state.profile.metaTitles.at(-1) || '仍在生成身份'}</strong>
              <button className="secondary-button" onClick={reset}>重新跑一轮</button>
            </div>
          )}
        </section>

        <aside className="v03-side-stack">
          <section className="panel">
            <div className="section-title-row"><h3>配装</h3><span className="hint">不消耗时间</span></div>
            <div className="v03-loadout-grid">
              {Object.entries(state.loadout).map(([slot, instanceId]) => (
                <div className="v03-loadout-slot" key={slot}>
                  <span>{slot}</span>
                  <strong>{instanceId ? registry.getAsset(state.assets.byId[instanceId]?.templateId)?.name || instanceId : '—'}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="section-title-row"><h3>背包 / Assets</h3><span className="hint">{assets.length}</span></div>
            <div className="v03-asset-list">
              {assets.length ? assets.map((asset) => <AssetRow key={asset.instanceId} instance={asset} onEquip={equip} />) : <p className="small-text">还没有值得继承的东西。</p>}
            </div>
          </section>

          <section className="panel v03-mini-systems">
            <div>
              <span>阵营</span>
              <strong>{faction ? `Fame ${faction.fame} / Infamy ${faction.infamy}` : '未接触'}</strong>
            </div>
            <div>
              <span>机构</span>
              <strong>{institution?.name || '尚未拥有'}</strong>
            </div>
            <div>
              <span>媒体档案</span>
              <strong>{state.media.collectedIds.length} 件</strong>
            </div>
            <div>
              <span>项目</span>
              <strong>{Object.keys(state.projects.byId).length} 个</strong>
            </div>
          </section>

          <button className="mini-button danger-button v03-reset" onClick={reset}>重置测试存档</button>
        </aside>
      </div>
    </main>
  );
}
