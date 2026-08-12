import { useEffect, useMemo, useRef, useState } from 'react';
import {
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
import { autoLayoutNodes, createConnectedGroup, nodeBounds, ungroupNodes } from '../blueprintEditorLayout.ts';
import './v05-blueprint-editor.css';
import './v05-blueprint-editor-v2.css';

const AUTOSAVE_KEY = 'nmas-blueprint-editor-autosave-v2';
const LIBRARY_KEY = 'nmas-blueprint-library-v2';
const WORLD_W = 2400;
const WORLD_H = 1600;
const NODE_W = 178;
const NODE_H = 118;
const MIN_ZOOM = .35;
const MAX_ZOOM = 1.8;
const EDGE_KIND_LABELS = { signal: '数据线', physical: '步骤线', dependency: '条件线', concept: '引用线' };
const profile = createStarterCreativeProfile();
const newId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
const clone = (value) => typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
const normalize = (value) => ({ ...value, nodes: Array.isArray(value?.nodes) ? value.nodes : [], edges: Array.isArray(value?.edges) ? value.edges : [], notes: Array.isArray(value?.notes) ? value.notes : [], groups: Array.isArray(value?.groups) ? value.groups : [] });

function blankBlueprint() {
  return normalize({ schema: 'nmas-blueprint-v1', id: newId('bp'), title: '未命名蓝图', revision: 1, nodes: [], edges: [], notes: [] });
}

function loadLibrary() {
  try { const value = JSON.parse(localStorage.getItem(LIBRARY_KEY) || '[]'); return Array.isArray(value) ? value.map(normalize) : []; }
  catch { return []; }
}

function loadInitial(forceBlank) {
  if (!forceBlank) {
    try { const raw = localStorage.getItem(AUTOSAVE_KEY); if (raw) return normalize(JSON.parse(raw)); }
    catch {}
  }
  return forceBlank ? blankBlueprint() : normalize(clone(buildProductionPreset()));
}

function saveDownload(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

function edgeKind(fromPort, toPort, chosen) {
  if (chosen && chosen !== 'auto') return chosen;
  const type = fromPort?.type || toPort?.type;
  if (type === 'concept') return 'concept';
  if (type === 'space') return 'physical';
  if (type === 'resource' || type === 'power') return 'dependency';
  return 'signal';
}

function NodeLibrary({ query, setQuery, onAdd }) {
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return editorGroups.map((group) => ({ group, items: editorNodeDefinitions.filter((item) => item.group === group).filter((item) => !q || `${item.label} ${item.summary} ${item.tags.join(' ')}`.toLowerCase().includes(q)) })).filter((item) => item.items.length);
  }, [query]);
  return <aside className="be-library" aria-label="节点库"><header><small>NODE LIBRARY</small><h2>节点库</h2></header><input aria-label="搜索节点" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索 LED、设计师、雷达、Note…"/><div className="be-library-scroll">{groups.map(({ group, items }) => <section key={group}><h3>{group}<span>{items.length}</span></h3>{items.map((item) => <button key={item.id} onClick={() => onAdd(item.id)}><span><b>{item.label}</b><small>{item.summary}</small></span><em>＋</em></button>)}</section>)}</div></aside>;
}

function NodeCard({ node, selected, connectFrom, onSelect, onDragStart, onPort, detail }) {
  const def = editorNodeById.get(node.definitionId);
  const inputs = def?.ports.filter((port) => port.direction === 'in') || [];
  const outputs = def?.ports.filter((port) => port.direction === 'out') || [];
  return <article className={`be-node be-node-v2 detail-${detail} ${selected ? 'selected' : ''} ${connectFrom?.nodeId === node.id ? 'connecting' : ''}`} data-node-id={node.id} style={{ left: node.x, top: node.y }} onPointerDown={(e) => { e.stopPropagation(); onDragStart(e, node); }} onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}>
    <header>{detail > 0 && <small>{def?.group || '未知'}</small>}<strong>{def?.label || node.definitionId}</strong></header>
    <div className="be-node-port-zone"><div className="be-node-ports inputs">{inputs.map((port) => <button key={port.id} aria-label={`${def?.label || node.definitionId} 输入 ${port.label}`} title={`${port.label} / ${port.type}`} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onPort(node.id, port); }}><i/>{detail > 0 && <span>{port.label}</span>}</button>)}</div><div className="be-node-ports outputs">{outputs.map((port) => <button key={port.id} aria-label={`${def?.label || node.definitionId} 输出 ${port.label}`} title={`${port.label} / ${port.type}`} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onPort(node.id, port); }}>{detail > 0 && <span>{port.label}</span>}<i/></button>)}</div></div>
    {detail > 1 && <footer>{def?.summary || '未找到节点定义'}</footer>}
  </article>;
}

function GroupFrame({ group, members, onCompact, onUngroup }) {
  if (!members.length) return null;
  const bounds = nodeBounds(members);
  return <section className={`be-group-frame ${group.compact ? 'compact' : ''}`} style={{ left: bounds.x - 22, top: bounds.y - 42, width: bounds.width + 44, height: bounds.height + 62 }}><header><span><b>{group.title}</b><small>{members.length} 节点</small></span><span><button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onCompact(group.id); }}>{group.compact ? '展开' : '简化'}</button><button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onUngroup(group.id); }}>解组</button></span></header></section>;
}

function GraphCanvas({ blueprint, setBlueprint, selectedNodeId, setSelectedNodeId, selectedEdgeId, setSelectedEdgeId, connectFrom, setConnectFrom, chosenEdgeKind, onPalette }) {
  const viewportRef = useRef(null);
  const drag = useRef(null);
  const pan = useRef(null);
  const pointers = useRef(new Map());
  const pinch = useRef(null);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [detail, setDetail] = useState(1);
  const [camera, setCamera] = useState({ x: 55, y: 50, zoom: .82 });
  const nodeMap = useMemo(() => new Map(blueprint.nodes.map((node) => [node.id, node])), [blueprint.nodes]);
  const groupMap = useMemo(() => new Map((blueprint.groups || []).map((group) => [group.id, group])), [blueprint.groups]);
  const clampZoom = (value) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));
  const localPoint = (clientX, clientY) => { const rect = viewportRef.current?.getBoundingClientRect(); return rect ? { x: clientX - rect.left, y: clientY - rect.top } : { x: 0, y: 0 }; };
  const worldPoint = (clientX, clientY, source = camera) => { const p = localPoint(clientX, clientY); return { x: (p.x - source.x) / source.zoom, y: (p.y - source.y) / source.zoom }; };

  function fit(nodes = blueprint.nodes) {
    const viewport = viewportRef.current;
    if (!viewport || !nodes.length) return;
    const rect = viewport.getBoundingClientRect();
    const bounds = nodeBounds(nodes);
    const zoom = clampZoom(Math.min((rect.width - 90) / Math.max(1, bounds.width), (rect.height - 90) / Math.max(1, bounds.height)));
    setCamera({ x: rect.width / 2 - bounds.cx * zoom, y: rect.height / 2 - bounds.cy * zoom, zoom });
  }

  function center() {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    const selected = nodeMap.get(selectedNodeId);
    const target = selected ? { cx: selected.x + NODE_W / 2, cy: selected.y + NODE_H / 2 } : nodeBounds(blueprint.nodes);
    setCamera((current) => ({ ...current, x: rect.width / 2 - target.cx * current.zoom, y: rect.height / 2 - target.cy * current.zoom }));
  }

  function zoomAt(clientX, clientY, nextZoom) {
    const zoom = clampZoom(nextZoom);
    setCamera((current) => { const local = localPoint(clientX, clientY); const wx = (local.x - current.x) / current.zoom; const wy = (local.y - current.y) / current.zoom; return { x: local.x - wx * zoom, y: local.y - wy * zoom, zoom }; });
  }

  function zoomCenter(delta) {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (rect) zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, camera.zoom + delta);
  }

  function startNodeDrag(event, node) {
    if (spaceHeld) return startPan(event);
    const p = worldPoint(event.clientX, event.clientY);
    drag.current = { pointerId: event.pointerId, nodeId: node.id, dx: p.x - node.x, dy: p.y - node.y };
    viewportRef.current?.setPointerCapture?.(event.pointerId);
    setSelectedNodeId(node.id); setSelectedEdgeId(null);
  }

  function startPan(event) {
    if (event.button !== undefined && event.button !== 0 && event.button !== 1) return;
    pan.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, cx: camera.x, cy: camera.y };
    drag.current = null;
    viewportRef.current?.setPointerCapture?.(event.pointerId);
  }

  function pointerDownCapture(event) {
    if (event.pointerType !== 'touch') return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      const pts = [...pointers.current.values()];
      const mx = (pts[0].x + pts[1].x) / 2, my = (pts[0].y + pts[1].y) / 2;
      const distance = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      const wp = worldPoint(mx, my);
      pinch.current = { distance, zoom: camera.zoom, wx: wp.x, wy: wp.y };
      drag.current = null; pan.current = null;
    }
  }

  function pointerMove(event) {
    if (event.pointerType === 'touch' && pointers.current.has(event.pointerId)) pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinch.current && pointers.current.size >= 2) {
      const pts = [...pointers.current.values()].slice(0, 2);
      const mx = (pts[0].x + pts[1].x) / 2, my = (pts[0].y + pts[1].y) / 2;
      const dist = Math.max(1, Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y));
      const z = clampZoom(pinch.current.zoom * dist / Math.max(1, pinch.current.distance));
      const lp = localPoint(mx, my);
      setCamera({ x: lp.x - pinch.current.wx * z, y: lp.y - pinch.current.wy * z, zoom: z });
      return;
    }
    if (drag.current?.pointerId === event.pointerId) {
      const p = worldPoint(event.clientX, event.clientY);
      const x = Math.max(8, Math.min(WORLD_W - NODE_W - 8, p.x - drag.current.dx));
      const y = Math.max(8, Math.min(WORLD_H - NODE_H - 8, p.y - drag.current.dy));
      setBlueprint((current) => ({ ...current, nodes: current.nodes.map((node) => node.id === drag.current.nodeId ? { ...node, x: Math.round(x), y: Math.round(y) } : node) }));
      return;
    }
    if (pan.current?.pointerId === event.pointerId) setCamera((current) => ({ ...current, x: pan.current.cx + event.clientX - pan.current.x, y: pan.current.cy + event.clientY - pan.current.y }));
  }

  function pointerUp(event) {
    if (event.pointerType === 'touch') pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (drag.current?.pointerId === event.pointerId) drag.current = null;
    if (pan.current?.pointerId === event.pointerId) pan.current = null;
    try { viewportRef.current?.releasePointerCapture?.(event.pointerId); } catch {}
  }

  function portClick(nodeId, port) {
    if (!connectFrom) { if (port.direction === 'out') { setConnectFrom({ nodeId, port }); setSelectedNodeId(nodeId); } return; }
    if (port.direction === 'out') return setConnectFrom({ nodeId, port });
    if (connectFrom.nodeId === nodeId) return;
    setBlueprint((current) => ({ ...current, edges: [...current.edges, { id: newId('edge'), from: connectFrom.nodeId, to: nodeId, fromPort: connectFrom.port.id, toPort: port.id, kind: edgeKind(connectFrom.port, port, chosenEdgeKind) }] }));
    setConnectFrom(null);
  }

  function autoArrange() {
    const nodes = autoLayoutNodes(blueprint.nodes, blueprint.edges);
    setBlueprint((current) => ({ ...current, nodes }));
    requestAnimationFrame(() => fit(nodes));
  }

  function groupSelected() {
    if (!selectedNodeId) return;
    const def = editorNodeById.get(nodeMap.get(selectedNodeId)?.definitionId);
    setBlueprint((current) => createConnectedGroup(current, selectedNodeId, newId('group'), `${def?.label || '节点'} / 连接组`));
  }

  useEffect(() => {
    const down = (event) => {
      const tag = document.activeElement?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (event.code === 'Space') { event.preventDefault(); setSpaceHeld(true); }
      if (event.key.toLowerCase() === 'f') { event.preventDefault(); fit(); }
      if (event.key.toLowerCase() === 'c') { event.preventDefault(); center(); }
    };
    const up = (event) => { if (event.code === 'Space') setSpaceHeld(false); };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [blueprint, selectedNodeId, camera]);

  useEffect(() => { const id = requestAnimationFrame(() => fit()); return () => cancelAnimationFrame(id); }, []);

  return <section className="be-canvas-panel" aria-label="节点编辑画布"><header className="be-canvas-tools be-canvas-tools-v2"><div><button onClick={onPalette}>＋ 节点 <kbd>Shift A</kbd></button><button className={connectFrom ? 'active' : ''} onClick={() => setConnectFrom(null)}>{connectFrom ? '取消连线' : '连线'}</button><button onClick={autoArrange}>自动排序</button><button onClick={groupSelected} disabled={!selectedNodeId}>连接成组</button></div><div className="be-camera-tools"><button onClick={() => fit()}>适配 <kbd>F</kbd></button><button onClick={center}>居中 <kbd>C</kbd></button><button onClick={() => zoomCenter(-.1)}>−</button><span>{Math.round(camera.zoom * 100)}%</span><button onClick={() => zoomCenter(.1)}>＋</button><button onClick={() => setCamera((current) => ({ ...current, zoom: 1 }))}>100%</button></div><label className="be-detail-slider"><span>节点细节</span><input aria-label="节点细节" type="range" min="0" max="2" step="1" value={detail} onChange={(e) => setDetail(Number(e.target.value))}/></label></header>
    <div ref={viewportRef} className={`be-viewport be-viewport-v2 ${spaceHeld ? 'space-pan' : ''}`} onPointerDownCapture={pointerDownCapture} onPointerDown={(e) => { if (!e.target.closest('.be-node,.be-group-frame header,.be-canvas-tools,.be-wire-control')) startPan(e); }} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onWheel={(e) => { e.preventDefault(); if (e.ctrlKey || e.metaKey) zoomAt(e.clientX, e.clientY, camera.zoom * (e.deltaY > 0 ? .92 : 1.08)); else setCamera((current) => ({ ...current, x: current.x - e.deltaX, y: current.y - e.deltaY })); }} onClick={(e) => { if (!e.target.closest('.be-node,.be-group-frame,.be-wire-control')) { setSelectedNodeId(null); setSelectedEdgeId(null); } }}>
      <div className="be-world be-world-v2" style={{ width: WORLD_W, height: WORLD_H, transform: `translate(${camera.x}px,${camera.y}px) scale(${camera.zoom})` }}>
        {(blueprint.groups || []).map((group) => <GroupFrame key={group.id} group={group} members={group.nodeIds.map((id) => nodeMap.get(id)).filter(Boolean)} onCompact={(id) => setBlueprint((current) => ({ ...current, groups: current.groups.map((g) => g.id === id ? { ...g, compact: !g.compact } : g) }))} onUngroup={(id) => setBlueprint((current) => ungroupNodes(current, id))}/>) }
        <svg className="be-wires" viewBox={`0 0 ${WORLD_W} ${WORLD_H}`} preserveAspectRatio="none">{blueprint.edges.map((edge) => { const from = nodeMap.get(edge.from), to = nodeMap.get(edge.to); if (!from || !to) return null; const x1 = from.x + NODE_W, y1 = from.y + 46, x2 = to.x, y2 = to.y + 46, bend = Math.max(70, Math.abs(x2 - x1) * .45), d = `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`; const kind = edge.kind || 'signal'; const selectEdge = (event) => { event.stopPropagation(); setSelectedEdgeId(edge.id); setSelectedNodeId(null); }; return <g key={edge.id} role="button" tabIndex="0" aria-label={`${EDGE_KIND_LABELS[kind] || '连接'} · ${edge.from} → ${edge.to}`} className={`be-wire-control ${selectedEdgeId === edge.id ? 'selected' : ''}`} onPointerDown={selectEdge} onClick={selectEdge} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectEdge(event); } }}><path d={d} className={`wire ${kind}`}/><path d={d} className="wire-hit"/></g>; })}</svg>
        {blueprint.nodes.map((node) => <NodeCard key={node.id} node={node} selected={selectedNodeId === node.id} connectFrom={connectFrom} onSelect={setSelectedNodeId} onDragStart={startNodeDrag} onPort={portClick} detail={node.groupId && groupMap.get(node.groupId)?.compact ? 0 : detail}/>) }
        {!blueprint.nodes.length && <button className="be-empty" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onPalette(); }}>空白画布<br/><strong>Shift+A 新建节点 · Space 拖动画布</strong></button>}
      </div>
      <div className="be-gesture-hint">拖空白处平移 · Space + 拖动 · 触屏单指平移 / 双指缩放 · Ctrl/⌘ 滚轮缩放</div>
    </div>
  </section>;
}

function ParamInput({ param, value, onChange }) {
  if (param.kind === 'range') return <label className="be-param"><span>{param.label}<b>{value ?? param.defaultValue}{param.unit || ''}</b></span><input type="range" min={param.min} max={param.max} step={param.step || 1} value={Number(value ?? param.defaultValue)} onChange={(e) => onChange(Number(e.target.value))}/></label>;
  if (param.kind === 'toggle') return <label className="be-param"><span>{param.label}</span><input type="checkbox" checked={Boolean(value ?? param.defaultValue)} onChange={(e) => onChange(e.target.checked)}/></label>;
  if (param.kind === 'select') return <label className="be-param"><span>{param.label}</span><select value={String(value ?? param.defaultValue)} onChange={(e) => onChange(e.target.value)}>{(param.options || []).map((option) => <option key={option}>{option}</option>)}</select></label>;
  return <label className="be-param"><span>{param.label}</span><input value={String(value ?? param.defaultValue ?? '')} onChange={(e) => onChange(e.target.value)}/></label>;
}

function Inspector({ blueprint, setBlueprint, selectedNodeId, selectedEdgeId, validation, onDelete }) {
  const node = blueprint.nodes.find((item) => item.id === selectedNodeId);
  const edge = blueprint.edges.find((item) => item.id === selectedEdgeId);
  const def = node ? editorNodeById.get(node.definitionId) : null;
  if (node && def) return <aside className="be-inspector" aria-label="节点检查器"><header><small>{def.group}</small><h2>{def.label}</h2><p>{def.summary}</p></header>{node.groupId && <section className="be-node-group-status"><small>GROUP</small><b>{blueprint.groups.find((group) => group.id === node.groupId)?.title}</b></section>}{def.params.map((param) => <ParamInput key={param.id} param={param} value={node.params?.[param.id]} onChange={(value) => setBlueprint((current) => ({ ...current, nodes: current.nodes.map((item) => item.id === node.id ? { ...item, params: { ...(item.params || {}), [param.id]: value } } : item) }))}/>) }<label className="be-note"><span>节点 Note</span><textarea value={String(node.params?._note || '')} onChange={(e) => setBlueprint((current) => ({ ...current, nodes: current.nodes.map((item) => item.id === node.id ? { ...item, params: { ...(item.params || {}), _note: e.target.value } } : item) }))} placeholder="为什么这样接？现场发现了什么？还有什么没解决？"/></label><button className="danger" onClick={onDelete}>删除节点</button></aside>;
  if (edge) return <aside className="be-inspector" aria-label="连线检查器"><header><small>LINK</small><h2>连接</h2><p>{edge.from} → {edge.to}</p></header><div className="be-edge-types">{['signal','physical','concept','dependency'].map((kind) => <button key={kind} className={edge.kind === kind ? 'active' : ''} onClick={() => setBlueprint((current) => ({ ...current, edges: current.edges.map((item) => item.id === edge.id ? { ...item, kind } : item) }))}>{kind}</button>)}</div><p className="be-hint">信号类型直接点选，不再打开第二层复杂面板。</p><button className="danger" onClick={onDelete}>删除连线</button></aside>;
  return <aside className="be-inspector" aria-label="蓝图检查器"><header><small>BLUEPRINT</small><h2>项目检查</h2><p>只检查能不能跑、能不能做、能不能读，不给作品打总分。</p></header>{['run','build','read'].map((key) => <section className="be-diagnostic" key={key}><div><b>{key.toUpperCase()}</b><span>{validation.diagnostics?.[key]?.state ?? 0}/3</span></div>{(validation.diagnostics?.[key]?.messages || []).slice(0,3).map((message) => <p key={message}>{message}</p>)}</section>)}</aside>;
}

function Palette({ open, onClose, onAdd }) {
  const [query, setQuery] = useState('');
  if (!open) return null;
  const q = query.trim().toLowerCase();
  const items = editorNodeDefinitions.filter((item) => !q || `${item.label} ${item.summary} ${item.tags.join(' ')}`.toLowerCase().includes(q));
  return <div className="be-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="be-palette"><header><div><small>SHIFT + A</small><h2>新建节点</h2></div><button onClick={onClose}>×</button></header><input autoFocus placeholder="输入：LED、投影、雷达、设计师、Note…" value={query} onChange={(e) => setQuery(e.target.value)}/><div>{items.slice(0,30).map((item) => <button key={item.id} onClick={() => { onAdd(item.id); onClose(); }}><strong>{item.label}</strong><span>{item.group}</span><small>{item.summary}</small></button>)}</div></section></div>;
}

export default function V05BlueprintEditorV2() {
  const params = new URLSearchParams(window.location.search);
  const forceBlank = params.get('blank') === '1';
  const [blueprint, setBlueprint] = useState(() => loadInitial(forceBlank));
  const [library, setLibrary] = useState(loadLibrary);
  const [query, setQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [connectFrom, setConnectFrom] = useState(null);
  const [chosenEdgeKind] = useState('auto');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [saveAsOpen, setSaveAsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [saveAsName, setSaveAsName] = useState('');
  const [mobilePane, setMobilePane] = useState('canvas');
  const validation = useMemo(() => validateBlueprint(blueprint, profile), [blueprint]);

  useEffect(() => { localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(blueprint)); }, [blueprint]);
  useEffect(() => { localStorage.setItem(LIBRARY_KEY, JSON.stringify(library)); }, [library]);
  useEffect(() => {
    const down = (event) => {
      const tag = document.activeElement?.tagName;
      const editing = ['INPUT','TEXTAREA','SELECT'].includes(tag);
      if (!editing && event.shiftKey && event.key.toLowerCase() === 'a') { event.preventDefault(); setPaletteOpen(true); }
      if (!editing && (event.key === 'Delete' || event.key === 'Backspace') && (selectedNodeId || selectedEdgeId)) { event.preventDefault(); deleteSelection(); }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') { event.preventDefault(); saveCurrent(); }
    };
    window.addEventListener('keydown', down); return () => window.removeEventListener('keydown', down);
  }, [selectedNodeId, selectedEdgeId, blueprint, library]);

  function addNode(definitionId) {
    const index = blueprint.nodes.length;
    setBlueprint((current) => ({ ...current, nodes: [...current.nodes, { id: newId('node'), definitionId, x: 160 + (index % 5) * 210, y: 130 + Math.floor(index / 5) * 160, params: defaultParamsForNode(definitionId), groupId: null }] }));
  }

  function deleteSelection() {
    if (selectedNodeId) setBlueprint((current) => ({ ...current, nodes: current.nodes.filter((node) => node.id !== selectedNodeId), edges: current.edges.filter((edge) => edge.from !== selectedNodeId && edge.to !== selectedNodeId), groups: current.groups.map((group) => ({ ...group, nodeIds: group.nodeIds.filter((id) => id !== selectedNodeId) })).filter((group) => group.nodeIds.length > 1) }));
    if (selectedEdgeId) setBlueprint((current) => ({ ...current, edges: current.edges.filter((edge) => edge.id !== selectedEdgeId) }));
    setSelectedNodeId(null); setSelectedEdgeId(null);
  }

  function saveCurrent() {
    const item = clone(blueprint);
    setLibrary((current) => { const index = current.findIndex((entry) => entry.id === item.id); return index >= 0 ? current.map((entry, i) => i === index ? item : entry) : [...current, item]; });
  }

  function saveAs() {
    const title = saveAsName.trim() || `${blueprint.title} / Remix`;
    const next = { ...clone(blueprint), id: newId('bp'), title, revision: Number(blueprint.revision || 1) + 1, parentBlueprintId: blueprint.id };
    setBlueprint(next); setLibrary((current) => [...current, next]); setSaveAsOpen(false); setSaveAsName('');
  }

  function importCode(code) {
    try { const next = normalize(decodeBlueprintShareCode(code)); setBlueprint(next); setShareOpen(false); }
    catch { window.alert('图纸码无法读取。'); }
  }

  return <main className="be-shell be-shell-v2">
    <header className="be-topbar"><div><small>NEW MEDIA ARTIST SIMULATOR</small><strong>新媒体艺术家节点编辑器</strong></div><input aria-label="蓝图名称" value={blueprint.title} onChange={(e) => setBlueprint((current) => ({ ...current, title: e.target.value }))}/><nav><button onClick={() => setProjectOpen(true)}>项目</button><button onClick={saveCurrent}>保存</button><button onClick={() => { setSaveAsName(`${blueprint.title} / Remix`); setSaveAsOpen(true); }}>另存为</button><button onClick={() => saveDownload(`${(blueprint.title || 'blueprint').replace(/[\\/:*?"<>|]/g,'-')}.nmas.json`, JSON.stringify(blueprint, null, 2))}>导出</button><button onClick={() => setShareOpen(true)}>分享</button><a href="./?mode=home">返回</a></nav></header>
    <nav className="be-mobile-tabs" aria-label="手机编辑视图"><button className={mobilePane === 'library' ? 'active' : ''} onClick={() => setMobilePane('library')}>节点</button><button className={mobilePane === 'canvas' ? 'active' : ''} onClick={() => setMobilePane('canvas')}>画布</button><button className={mobilePane === 'inspector' ? 'active' : ''} onClick={() => setMobilePane('inspector')}>参数</button></nav>
    <section className={`be-workspace pane-${mobilePane}`}><NodeLibrary query={query} setQuery={setQuery} onAdd={addNode}/><GraphCanvas blueprint={blueprint} setBlueprint={setBlueprint} selectedNodeId={selectedNodeId} setSelectedNodeId={setSelectedNodeId} selectedEdgeId={selectedEdgeId} setSelectedEdgeId={setSelectedEdgeId} connectFrom={connectFrom} setConnectFrom={setConnectFrom} chosenEdgeKind={chosenEdgeKind} onPalette={() => setPaletteOpen(true)}/><Inspector blueprint={blueprint} setBlueprint={setBlueprint} selectedNodeId={selectedNodeId} selectedEdgeId={selectedEdgeId} validation={validation} onDelete={deleteSelection}/></section>
    <Palette open={paletteOpen} onClose={() => setPaletteOpen(false)} onAdd={addNode}/>
    {saveAsOpen && <div className="be-overlay"><section className="be-dialog"><header><h2>另存为新蓝图</h2><button onClick={() => setSaveAsOpen(false)}>×</button></header><input value={saveAsName} onChange={(e) => setSaveAsName(e.target.value)}/><footer><button onClick={() => setSaveAsOpen(false)}>取消</button><button className="primary" onClick={saveAs}>另存为</button></footer></section></div>}
    {shareOpen && <div className="be-overlay"><section className="be-dialog be-share"><header><h2>图纸码 / 分享</h2><button onClick={() => setShareOpen(false)}>×</button></header><label><span>图纸码</span><textarea aria-label="图纸码" readOnly value={encodeBlueprintShareCode(blueprint)}/></label><label><span>读取图纸码</span><textarea id="be-import-code" placeholder="粘贴 NMAS-BP1-…"/></label><footer><button onClick={() => importCode(document.getElementById('be-import-code')?.value || '')}>读取</button><button className="primary" onClick={() => navigator.clipboard?.writeText(encodeBlueprintShareCode(blueprint))}>复制</button></footer></section></div>}
    {projectOpen && <div className="be-overlay"><section className="be-project-drawer"><header><div><small>LOCAL LIBRARY</small><h2>本地蓝图库</h2></div><button onClick={() => setProjectOpen(false)}>×</button></header><div>{library.length ? library.map((item) => <button key={item.id} onClick={() => { setBlueprint(normalize(clone(item))); setProjectOpen(false); }}><strong>{item.title}</strong><span>{item.nodes.length} 节点 · r{item.revision || 1}</span></button>) : <p>还没有另存的蓝图。</p>}</div><footer><button onClick={() => { setBlueprint(blankBlueprint()); setProjectOpen(false); }}>新建空白</button></footer></section></div>}
  </main>;
}
