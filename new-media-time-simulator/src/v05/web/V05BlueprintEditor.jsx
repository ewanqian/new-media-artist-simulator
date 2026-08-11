import { useEffect, useMemo, useRef, useState } from 'react';
import {
  blueprintPresets,
  createStressBlueprint,
  createStarterCreativeProfile,
  decodeBlueprintShareCode,
  encodeBlueprintShareCode,
  validateBlueprint
} from '../blueprintSystem.ts';
import {
  buildProductionPreset,
  defaultParamsForNode,
  editorGroups,
  editorNodeById,
  editorNodeDefinitions
} from '../blueprintEditorCatalog.ts';
import './v05-blueprint-editor.css';

const AUTOSAVE_KEY = 'nmas-blueprint-editor-autosave-v2';
const LIBRARY_KEY = 'nmas-blueprint-library-v2';
const WORLD_W = 1500;
const WORLD_H = 900;
const NODE_W = 178;
const profile = createStarterCreativeProfile();

const edgeClass = {
  signal: 'signal',
  physical: 'physical',
  concept: 'concept',
  dependency: 'dependency'
};

function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function clone(value) {
  return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function blankBlueprint() {
  return {
    schema: 'nmas-blueprint-v1',
    id: newId('bp'),
    title: '未命名蓝图',
    revision: 1,
    nodes: [],
    edges: [],
    notes: []
  };
}

function loadLibrary() {
  try {
    const value = JSON.parse(localStorage.getItem(LIBRARY_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}

function loadInitialBlueprint(forceBlank = false) {
  if (!forceBlank) {
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
  }
  return forceBlank ? blankBlueprint() : clone(buildProductionPreset());
}

function compatibleEdgeKind(fromPort, toPort, chosenKind) {
  if (chosenKind) return chosenKind;
  const type = fromPort?.type || toPort?.type;
  if (type === 'concept') return 'concept';
  if (type === 'space') return 'physical';
  if (type === 'resource' || type === 'power') return 'dependency';
  return 'signal';
}

function stateLabel(state) {
  return ['无', '阻塞', '脆弱', '可运行'][state] || '无';
}

function saveDownload(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function NodeLibrary({ query, setQuery, onAdd }) {
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return editorGroups.map((group) => ({
      group,
      items: editorNodeDefinitions.filter((item) => item.group === group)
        .filter((item) => !q || `${item.label} ${item.summary} ${item.tags.join(' ')}`.toLowerCase().includes(q))
    })).filter((item) => item.items.length);
  }, [query]);

  return (
    <aside className="be-library" aria-label="节点库">
      <header><small>NODE LIBRARY</small><h2>节点库</h2></header>
      <input aria-label="搜索节点" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索 LED、设计师、雷达、Note…" />
      <div className="be-library-scroll">
        {groups.map(({ group, items }) => (
          <section key={group}>
            <h3>{group}<span>{items.length}</span></h3>
            {items.map((item) => (
              <button key={item.id} onClick={() => onAdd(item.id)} title={item.summary}>
                <span><b>{item.label}</b><small>{item.summary}</small></span><em>＋</em>
              </button>
            ))}
          </section>
        ))}
      </div>
    </aside>
  );
}

function NodeCard({ node, selected, connectFrom, onSelect, onStartDrag, onPortClick, zoom }) {
  const definition = editorNodeById.get(node.definitionId);
  const inputs = definition?.ports.filter((port) => port.direction === 'in') || [];
  const outputs = definition?.ports.filter((port) => port.direction === 'out') || [];
  return (
    <article
      className={`be-node ${selected ? 'selected' : ''} ${connectFrom?.nodeId === node.id ? 'connecting' : ''}`}
      data-node-id={node.id}
      style={{ left: node.x * zoom, top: node.y * zoom, transform: `scale(${zoom})` }}
      onPointerDown={(event) => onStartDrag(event, node)}
      onClick={(event) => { event.stopPropagation(); onSelect(node.id); }}
    >
      <header>
        <small>{definition?.group || '未知'}</small>
        <strong>{definition?.label || node.definitionId}</strong>
      </header>
      <div className="be-node-ports inputs">
        {inputs.map((port) => (
          <button key={port.id} aria-label={`${definition?.label || node.definitionId} 输入 ${port.label}`} title={`${port.label} / ${port.type}`} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onPortClick(node.id, port); }}>
            <i/><span>{port.label}</span>
          </button>
        ))}
      </div>
      <div className="be-node-ports outputs">
        {outputs.map((port) => (
          <button key={port.id} aria-label={`${definition?.label || node.definitionId} 输出 ${port.label}`} title={`${port.label} / ${port.type}`} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onPortClick(node.id, port); }}>
            <span>{port.label}</span><i/>
          </button>
        ))}
      </div>
      <footer>{definition?.summary || '未找到节点定义'}</footer>
    </article>
  );
}

function GraphCanvas({ blueprint, setBlueprint, selectedNodeId, setSelectedNodeId, selectedEdgeId, setSelectedEdgeId, edgeKind, connectFrom, setConnectFrom, zoom, setZoom, onOpenPalette }) {
  const worldRef = useRef(null);
  const dragRef = useRef(null);
  const nodeMap = useMemo(() => new Map(blueprint.nodes.map((node) => [node.id, node])), [blueprint.nodes]);

  function startDrag(event, node) {
    if (event.button !== undefined && event.button !== 0) return;
    const world = worldRef.current?.getBoundingClientRect();
    if (!world) return;
    const pointerX = (event.clientX - world.left) / zoom;
    const pointerY = (event.clientY - world.top) / zoom;
    dragRef.current = { pointerId: event.pointerId, nodeId: node.id, dx: pointerX - node.x, dy: pointerY - node.y };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
  }

  function moveDrag(event) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const world = worldRef.current?.getBoundingClientRect();
    if (!world) return;
    const x = Math.max(8, Math.min(WORLD_W - NODE_W - 8, (event.clientX - world.left) / zoom - drag.dx));
    const y = Math.max(8, Math.min(WORLD_H - 110, (event.clientY - world.top) / zoom - drag.dy));
    setBlueprint((current) => ({
      ...current,
      nodes: current.nodes.map((item) => item.id === drag.nodeId ? { ...item, x: Math.round(x), y: Math.round(y) } : item)
    }));
  }

  function stopDrag(event) {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  }

  function portClick(nodeId, port) {
    if (!connectFrom) {
      if (port.direction !== 'out') return;
      setConnectFrom({ nodeId, port });
      setSelectedNodeId(nodeId);
      return;
    }
    if (port.direction === 'out') {
      setConnectFrom({ nodeId, port });
      return;
    }
    if (connectFrom.nodeId === nodeId) return;
    const kind = compatibleEdgeKind(connectFrom.port, port, edgeKind === 'auto' ? null : edgeKind);
    setBlueprint((current) => ({
      ...current,
      edges: [...current.edges, {
        id: newId('edge'),
        from: connectFrom.nodeId,
        to: nodeId,
        fromPort: connectFrom.port.id,
        toPort: port.id,
        kind
      }]
    }));
    setConnectFrom(null);
  }

  return (
    <section className="be-canvas-panel" aria-label="节点编辑画布">
      <header className="be-canvas-tools">
        <div>
          <button onClick={onOpenPalette}>＋ 节点 <kbd>Shift A</kbd></button>
          <button className={connectFrom ? 'active' : ''} onClick={() => setConnectFrom(null)}>{connectFrom ? '取消连线' : '连线：点输出 → 点输入'}</button>
        </div>
        <div>
          <button onClick={() => setZoom((value) => Math.max(0.55, +(value - 0.1).toFixed(2)))}>−</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((value) => Math.min(1.35, +(value + 0.1).toFixed(2)))}>＋</button>
        </div>
      </header>
      <div className="be-viewport" onPointerMove={moveDrag} onPointerUp={stopDrag} onPointerCancel={stopDrag}>
        <div
          ref={worldRef}
          className="be-world"
          style={{ width: WORLD_W * zoom, height: WORLD_H * zoom }}
          onClick={() => { setSelectedNodeId(null); setSelectedEdgeId(null); }}
        >
          <svg className="be-wires" viewBox={`0 0 ${WORLD_W} ${WORLD_H}`} preserveAspectRatio="none">
            {blueprint.edges.map((edge) => {
              const from = nodeMap.get(edge.from);
              const to = nodeMap.get(edge.to);
              if (!from || !to) return null;
              const x1 = from.x + NODE_W;
              const y1 = from.y + 45;
              const x2 = to.x;
              const y2 = to.y + 45;
              const bend = Math.max(70, Math.abs(x2 - x1) * 0.45);
              const d = `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`;
              return (
                <g key={edge.id} className={selectedEdgeId === edge.id ? 'selected' : ''} onClick={(event) => { event.stopPropagation(); setSelectedEdgeId(edge.id); setSelectedNodeId(null); }}>
                  <path d={d} className={`wire ${edgeClass[edge.kind] || 'signal'}`} />
                  <path d={d} className="wire-hit" />
                </g>
              );
            })}
          </svg>
          {blueprint.nodes.map((node) => (
            <NodeCard
              key={node.id}
              node={node}
              zoom={zoom}
              selected={selectedNodeId === node.id}
              connectFrom={connectFrom}
              onSelect={setSelectedNodeId}
              onStartDrag={startDrag}
              onPortClick={portClick}
            />
          ))}
          {!blueprint.nodes.length && <button className="be-empty" onClick={(event) => { event.stopPropagation(); onOpenPalette(); }}>空白画布<br/><strong>Shift+A 或 Space 新建节点</strong></button>}
        </div>
      </div>
    </section>
  );
}

function ParamInput({ param, value, onChange }) {
  if (param.kind === 'range') {
    return (
      <label className="be-param">
        <span>{param.label}<b>{value ?? param.defaultValue}{param.unit || ''}</b></span>
        <input type="range" min={param.min} max={param.max} step={param.step || 1} value={Number(value ?? param.defaultValue)} onChange={(event) => onChange(Number(event.target.value))} />
      </label>
    );
  }
  if (param.kind === 'toggle') return <label className="be-param"><span>{param.label}</span><input type="checkbox" checked={Boolean(value ?? param.defaultValue)} onChange={(event) => onChange(event.target.checked)} /></label>;
  return <label className="be-param"><span>{param.label}</span><input value={String(value ?? param.defaultValue ?? '')} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Inspector({ blueprint, setBlueprint, selectedNodeId, selectedEdgeId, validation, onDeleteSelection }) {
  const node = blueprint.nodes.find((item) => item.id === selectedNodeId);
  const edge = blueprint.edges.find((item) => item.id === selectedEdgeId);
  const definition = node ? editorNodeById.get(node.definitionId) : null;

  function setParam(id, value) {
    setBlueprint((current) => ({
      ...current,
      nodes: current.nodes.map((item) => item.id === selectedNodeId ? { ...item, params: { ...(item.params || {}), [id]: value } } : item)
    }));
  }

  if (node && definition) {
    return (
      <aside className="be-inspector" aria-label="节点检查器">
        <header><small>{definition.group}</small><h2>{definition.label}</h2><p>{definition.summary}</p></header>
        {definition.params.map((param) => <ParamInput key={param.id} param={param} value={node.params?.[param.id]} onChange={(value) => setParam(param.id, value)} />)}
        <label className="be-note"><span>节点 Note</span><textarea value={String(node.params?._note || '')} onChange={(event) => setParam('_note', event.target.value)} placeholder="为什么这样接？现场发现了什么？还有什么没解决？" /></label>
        <section className="be-port-list"><h3>输入 / 输出</h3>{definition.ports.map((port) => <div key={port.id}><b>{port.direction === 'in' ? 'IN' : 'OUT'}</b><span>{port.label}</span><small>{port.type}</small></div>)}</section>
        <button className="danger" onClick={onDeleteSelection}>删除节点</button>
      </aside>
    );
  }

  if (edge) {
    return (
      <aside className="be-inspector" aria-label="连线检查器">
        <header><small>LINK</small><h2>连接</h2><p>{edge.from} → {edge.to}</p></header>
        <div className="be-edge-types">{['signal', 'physical', 'concept', 'dependency'].map((kind) => <button key={kind} className={edge.kind === kind ? 'active' : ''} onClick={() => setBlueprint((current) => ({ ...current, edges: current.edges.map((item) => item.id === edge.id ? { ...item, kind } : item) }))}>{kind}</button>)}</div>
        <button className="danger" onClick={onDeleteSelection}>删除连线</button>
      </aside>
    );
  }

  return (
    <aside className="be-inspector" aria-label="蓝图检查器">
      <header><small>BLUEPRINT</small><h2>项目检查</h2><p>这里检查能不能跑、能不能做、能不能读，不给作品打总分。</p></header>
      {['run', 'build', 'read'].map((key) => <section className="be-diagnostic" key={key}><div><b>{key.toUpperCase()}</b><span>{stateLabel(validation.diagnostics[key].state)}</span></div>{validation.diagnostics[key].reasons.slice(0, 2).map((reason) => <p key={reason}>{reason}</p>)}</section>)}
      <section className="be-summary"><div><b>{blueprint.nodes.length}</b><span>节点</span></div><div><b>{blueprint.edges.length}</b><span>连接</span></div><div><b>{validation.missingResources.length}</b><span>资源缺口</span></div></section>
      <p className="be-hint">选择节点后可修改规格、周期、成本和 Note。选择连线可改变连接类型。</p>
    </aside>
  );
}

function AddPalette({ open, onClose, onAdd }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);
  if (!open) return null;
  const q = query.trim().toLowerCase();
  const items = editorNodeDefinitions.filter((item) => !q || `${item.label} ${item.summary} ${item.tags.join(' ')}`.toLowerCase().includes(q)).slice(0, 30);
  return (
    <div className="be-overlay" onMouseDown={onClose}>
      <section className="be-palette" onMouseDown={(event) => event.stopPropagation()}>
        <header><strong>新建节点</strong><kbd>Shift A / Space</kbd></header>
        <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="输入：LED、投影、设计师、预算、雷达…" />
        <div>{items.map((item) => <button key={item.id} onClick={() => { onAdd(item.id); onClose(); }}><small>{item.group}</small><b>{item.label}</b><span>{item.summary}</span></button>)}</div>
      </section>
    </div>
  );
}

function ProjectDrawer({ open, onClose, library, presets, onOpen, onBlank }) {
  if (!open) return null;
  return (
    <div className="be-overlay" onMouseDown={onClose}>
      <section className="be-project-drawer" onMouseDown={(event) => event.stopPropagation()}>
        <header><div><small>PROJECTS</small><h2>打开蓝图</h2></div><button onClick={onClose}>关闭</button></header>
        <button className="be-new-project" onClick={() => { onBlank(); onClose(); }}>＋ 空白蓝图</button>
        <h3>我的蓝图</h3>
        {library.length ? library.map((item) => <button key={item.id} onClick={() => { onOpen(item); onClose(); }}><b>{item.title}</b><span>{item.nodes.length} 节点 · rev {item.revision}</span></button>) : <p>还没有手动保存的蓝图。</p>}
        <h3>模板</h3>
        {presets.map((item) => <button key={item.id} onClick={() => { onOpen(item); onClose(); }}><b>{item.title}</b><span>{item.nodes.length} 节点</span></button>)}
      </section>
    </div>
  );
}

export default function V05BlueprintEditor() {
  const params = new URLSearchParams(window.location.search);
  const freeBlank = params.get('mode') === 'free' || params.get('blank') === '1';
  const [blueprint, setBlueprint] = useState(() => loadInitialBlueprint(freeBlank));
  const [library, setLibrary] = useState(loadLibrary);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [connectFrom, setConnectFrom] = useState(null);
  const [edgeKind, setEdgeKind] = useState('auto');
  const [query, setQuery] = useState('');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [saveAsOpen, setSaveAsOpen] = useState(false);
  const [saveAsName, setSaveAsName] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [mobileView, setMobileView] = useState('canvas');
  const [zoom, setZoom] = useState(0.9);
  const fileRef = useRef(null);

  const validation = useMemo(() => validateBlueprint(blueprint, profile), [blueprint]);
  const shareCode = useMemo(() => encodeBlueprintShareCode(blueprint), [blueprint]);
  const presetList = useMemo(() => [buildProductionPreset(), ...blueprintPresets, createStressBlueprint(28)], []);

  useEffect(() => {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(blueprint));
  }, [blueprint]);

  function addNode(definitionId) {
    const index = blueprint.nodes.length;
    const x = 80 + (index % 5) * 230;
    const y = 80 + (Math.floor(index / 5) % 5) * 150;
    const node = { id: newId('node'), definitionId, x, y, params: defaultParamsForNode(definitionId) };
    setBlueprint((current) => ({ ...current, nodes: [...current.nodes, node] }));
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
    setMobileView('canvas');
  }

  function deleteSelection() {
    if (selectedNodeId) {
      setBlueprint((current) => ({ ...current, nodes: current.nodes.filter((item) => item.id !== selectedNodeId), edges: current.edges.filter((edge) => edge.from !== selectedNodeId && edge.to !== selectedNodeId) }));
      setSelectedNodeId(null);
    } else if (selectedEdgeId) {
      setBlueprint((current) => ({ ...current, edges: current.edges.filter((item) => item.id !== selectedEdgeId) }));
      setSelectedEdgeId(null);
    }
  }

  function saveLibrary() {
    const next = [...library.filter((item) => item.id !== blueprint.id), clone({ ...blueprint, revision: Math.max(1, Number(blueprint.revision || 1)) })];
    setLibrary(next);
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(next));
  }

  function openSaveAs() {
    setSaveAsName(`${blueprint.title} / 副本`);
    setSaveAsOpen(true);
  }

  function confirmSaveAs() {
    const next = { ...clone(blueprint), id: newId('bp'), title: saveAsName.trim() || `${blueprint.title} / 副本`, revision: 1, parentBlueprintId: blueprint.id };
    setBlueprint(next);
    const nextLibrary = [...library, next];
    setLibrary(nextLibrary);
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(nextLibrary));
    setSaveAsOpen(false);
  }

  function openBlueprint(value) {
    setBlueprint(clone(value));
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setConnectFrom(null);
  }

  async function importFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (parsed.schema !== 'nmas-blueprint-v1' || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) throw new Error('bad');
      openBlueprint(parsed);
    } catch { window.alert('无法读取这个 .nmas.json 文件。'); }
    event.target.value = '';
  }

  function importShareCode() {
    try {
      openBlueprint(decodeBlueprintShareCode(importCode.trim()));
      setShareOpen(false);
    } catch { window.alert('图纸码无法读取。'); }
  }

  useEffect(() => {
    function keydown(event) {
      const tag = document.activeElement?.tagName;
      const editingText = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 's') {
        event.preventDefault(); openSaveAs(); return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault(); saveLibrary(); return;
      }
      if (editingText) return;
      if ((event.shiftKey && event.key.toLowerCase() === 'a') || event.code === 'Space') {
        event.preventDefault(); setPaletteOpen(true); return;
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault(); deleteSelection(); return;
      }
      if (event.key === 'Escape') {
        setConnectFrom(null); setPaletteOpen(false); setShareOpen(false); setSaveAsOpen(false);
      }
    }
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [blueprint, library, selectedNodeId, selectedEdgeId]);

  return (
    <main className="be-shell">
      <header className="be-topbar">
        <div className="be-top-left">
          <a className="be-home" href="./" aria-label="返回首页">←</a>
          <button className="be-project-button" onClick={() => setProjectsOpen(true)}>项目</button>
          <input aria-label="蓝图名称" className="be-title" value={blueprint.title} onChange={(event) => setBlueprint((current) => ({ ...current, title: event.target.value }))} />
          <span className="be-autosave">本地自动保存</span>
        </div>
        <div className="be-top-actions">
          <button onClick={saveLibrary}>保存 <kbd>⌘S</kbd></button>
          <button onClick={openSaveAs}>另存为</button>
          <button onClick={() => setShareOpen(true)}>分享</button>
          <button onClick={() => fileRef.current?.click()}>导入</button>
          <button onClick={() => saveDownload(`${blueprint.title || 'blueprint'}.nmas.json`, JSON.stringify(blueprint, null, 2))}>导出</button>
          <input ref={fileRef} className="be-file-input" type="file" accept=".json,.nmas.json,application/json" onChange={importFile} />
        </div>
      </header>

      <section className="be-modebar">
        <div><b>新媒体艺术家节点编辑器</b><span>创作图 / 制作图共用同一张 Blueprint</span></div>
        <label>新连线<select value={edgeKind} onChange={(event) => setEdgeKind(event.target.value)}><option value="auto">自动判断</option><option value="signal">信号</option><option value="physical">物理</option><option value="concept">概念</option><option value="dependency">依赖</option></select></label>
      </section>

      <section className={`be-workspace mobile-${mobileView}`}>
        <NodeLibrary query={query} setQuery={setQuery} onAdd={addNode} />
        <GraphCanvas
          blueprint={blueprint}
          setBlueprint={setBlueprint}
          selectedNodeId={selectedNodeId}
          setSelectedNodeId={setSelectedNodeId}
          selectedEdgeId={selectedEdgeId}
          setSelectedEdgeId={setSelectedEdgeId}
          edgeKind={edgeKind}
          connectFrom={connectFrom}
          setConnectFrom={setConnectFrom}
          zoom={zoom}
          setZoom={setZoom}
          onOpenPalette={() => setPaletteOpen(true)}
        />
        <Inspector blueprint={blueprint} setBlueprint={setBlueprint} selectedNodeId={selectedNodeId} selectedEdgeId={selectedEdgeId} validation={validation} onDeleteSelection={deleteSelection} />
      </section>

      <nav className="be-mobile-tabs" aria-label="手机编辑视图">
        <button className={mobileView === 'library' ? 'active' : ''} onClick={() => setMobileView('library')}>节点</button>
        <button className={mobileView === 'canvas' ? 'active' : ''} onClick={() => setMobileView('canvas')}>画布</button>
        <button className={mobileView === 'inspector' ? 'active' : ''} onClick={() => setMobileView('inspector')}>参数</button>
      </nav>

      <AddPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onAdd={addNode} />
      <ProjectDrawer open={projectsOpen} onClose={() => setProjectsOpen(false)} library={library} presets={presetList} onOpen={openBlueprint} onBlank={() => openBlueprint(blankBlueprint())} />

      {saveAsOpen && <div className="be-overlay" onMouseDown={() => setSaveAsOpen(false)}><section className="be-dialog" onMouseDown={(event) => event.stopPropagation()}><small>SAVE AS</small><h2>另存为新蓝图</h2><input autoFocus value={saveAsName} onChange={(event) => setSaveAsName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') confirmSaveAs(); }} /><p>会生成新的 Blueprint ID，并记录当前蓝图为父版本。</p><div><button onClick={() => setSaveAsOpen(false)}>取消</button><button className="primary" onClick={confirmSaveAs}>另存为</button></div></section></div>}

      {shareOpen && <div className="be-overlay" onMouseDown={() => setShareOpen(false)}><section className="be-dialog be-share" onMouseDown={(event) => event.stopPropagation()}><small>SHARE CODE</small><h2>图纸码</h2><textarea aria-label="图纸码" readOnly value={shareCode}/><div className="be-dialog-actions"><button onClick={() => navigator.clipboard?.writeText(shareCode)}>复制</button></div><h3>读取图纸码</h3><textarea value={importCode} onChange={(event) => setImportCode(event.target.value)} placeholder="粘贴 NMAS-BP1-…"/><div><button onClick={() => setShareOpen(false)}>关闭</button><button className="primary" onClick={importShareCode}>读取</button></div></section></div>}
    </main>
  );
}
