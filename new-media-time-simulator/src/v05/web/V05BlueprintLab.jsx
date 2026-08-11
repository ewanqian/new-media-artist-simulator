import { useMemo, useState } from 'react';
import {
  blueprintNodeById,
  blueprintPresets,
  createStarterCreativeProfile,
  createStressBlueprint,
  decodeBlueprintShareCode,
  encodeBlueprintShareCode,
  remixBlueprint,
  validateBlueprint
} from '../blueprintSystem.ts';
import { memorableMoments, questBooks } from '../questBookSystem.ts';
import './v05-blueprint-lab.css';

const profile = createStarterCreativeProfile();
const samples = [...blueprintPresets, createStressBlueprint(28)];

const edgeClass = {
  signal: 'bp-edge-signal',
  physical: 'bp-edge-physical',
  concept: 'bp-edge-concept',
  dependency: 'bp-edge-dependency'
};

function stateText(state) {
  return ['NONE', 'BLOCKED', 'FRAGILE', 'READY'][state] || 'NONE';
}

function downloadText(filename, text, type = 'application/json') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function Graph({ blueprint }) {
  const nodes = new Map(blueprint.nodes.map((node) => [node.id, node]));
  return (
    <div className="bp-canvas" aria-label="Blueprint graph">
      <svg className="bp-wires" viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true">
        {blueprint.edges.map((edge) => {
          const from = nodes.get(edge.from);
          const to = nodes.get(edge.to);
          if (!from || !to) return null;
          return <line key={edge.id} x1={from.x + 62} y1={from.y + 26} x2={to.x + 62} y2={to.y + 26} className={edgeClass[edge.kind]} />;
        })}
      </svg>
      {blueprint.nodes.map((node) => {
        const definition = blueprintNodeById.get(node.definitionId);
        return (
          <article className={`bp-node bp-node-${definition?.category || 'unknown'}`} key={node.id} style={{ left: `${node.x / 10}%`, top: `${node.y / 5.6}%` }}>
            <small>{definition?.category || 'unknown'}</small>
            <strong>{definition?.label || node.definitionId}</strong>
            <span>{definition?.family || 'missing definition'}</span>
          </article>
        );
      })}
    </div>
  );
}

function DiagnosticCard({ label, diagnostic }) {
  return (
    <article className="bp-diagnostic">
      <header><small>{label}</small><strong>{stateText(diagnostic.state)}</strong></header>
      <div className="bp-state-bars" aria-label={`${label} ${diagnostic.state} of 3`}>
        {[1, 2, 3].map((level) => <i key={level} className={diagnostic.state >= level ? 'on' : ''} />)}
      </div>
      {diagnostic.reasons.slice(0, 3).map((reason) => <p key={reason}>{reason}</p>)}
    </article>
  );
}

function PressureChart({ validation }) {
  const rows = [
    ['节点', Math.min(100, validation.complexity.nodeCount * 4)],
    ['连线', Math.min(100, validation.complexity.edgeCount * 5)],
    ['熟练度阻塞', Math.min(100, validation.masteryBlocks.length * 16)],
    ['资源缺口', Math.min(100, validation.missingResources.length * 22)],
    ['悬空连接', Math.min(100, validation.danglingEdges.length * 30)]
  ];
  return (
    <section className="bp-easter-card">
      <header><small>EASTER EGG / PRESSURE</small><h3>制作压力剖面</h3></header>
      <div className="bp-bar-chart">
        {rows.map(([label, value]) => <div key={label}><span>{label}</span><b><i style={{ width: `${value}%` }} /></b><em>{value}</em></div>)}
      </div>
    </section>
  );
}

function EvolutionChart({ blueprint }) {
  const counts = blueprint.nodes.reduce((acc, node) => {
    const category = blueprintNodeById.get(node.definitionId)?.category || 'unknown';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  const ordered = ['material', 'media', 'process', 'behavior', 'interface', 'spatial', 'lineage', 'constraint'];
  const max = Math.max(1, ...ordered.map((key) => counts[key] || 0));
  return (
    <section className="bp-easter-card">
      <header><small>EASTER EGG / GENOME</small><h3>创作基因分布</h3></header>
      <div className="bp-column-chart">
        {ordered.map((key) => <div key={key}><b><i style={{ height: `${((counts[key] || 0) / max) * 100}%` }} /></b><span>{key}</span><em>{counts[key] || 0}</em></div>)}
      </div>
    </section>
  );
}

function GenealogyChart({ blueprint }) {
  return (
    <section className="bp-easter-card bp-genealogy">
      <header><small>EASTER EGG / GENEALOGY</small><h3>谱系不是撤销历史</h3></header>
      <div className="bp-gene-tree">
        <div><strong>Prototype</strong><small>最初回路</small></div>
        <span>→</span>
        <div><strong>{blueprint.title}</strong><small>当前版本</small></div>
        <span>↘</span>
        <div><strong>Remix</strong><small>环境突变</small></div>
      </div>
    </section>
  );
}

export default function V05BlueprintLab() {
  const [selectedId, setSelectedId] = useState(samples[0].id);
  const [customTitle, setCustomTitle] = useState(samples[0].title);
  const [importCode, setImportCode] = useState('');
  const [imported, setImported] = useState(null);
  const base = imported || samples.find((item) => item.id === selectedId) || samples[0];
  const blueprint = useMemo(() => ({ ...base, title: customTitle || base.title }), [base, customTitle]);
  const validation = useMemo(() => validateBlueprint(blueprint, profile), [blueprint]);
  const shareCode = useMemo(() => encodeBlueprintShareCode(blueprint), [blueprint]);

  function selectBlueprint(id) {
    const next = samples.find((item) => item.id === id) || samples[0];
    setImported(null);
    setSelectedId(id);
    setCustomTitle(next.title);
  }

  function importBlueprint() {
    try {
      const parsed = decodeBlueprintShareCode(importCode.trim());
      setImported(parsed);
      setCustomTitle(parsed.title);
    } catch {
      window.alert('图纸码无法读取。');
    }
  }

  function makeRemix() {
    const next = remixBlueprint(blueprint, `${blueprint.id}-remix`, `${blueprint.title} / Remix`);
    setImported(next);
    setCustomTitle(next.title);
  }

  return (
    <main className="bp-lab">
      <header className="bp-lab-header">
        <div><small>WORKBENCH / HIDDEN BLUEPRINT LAB</small><h1>创作基因实验台</h1><p>不是第四个一级系统。这里只验证未来 Workbench → Project 里的节点图是否能扛住真实复杂度。</p></div>
        <a href="./">返回模拟器</a>
      </header>

      <section className="bp-toolbar">
        <label>预置图纸<select value={selectedId} onChange={(event) => selectBlueprint(event.target.value)}>{samples.map((item) => <option key={item.id} value={item.id}>{item.title} · {item.nodes.length} 节点</option>)}</select></label>
        <label>作品名<input value={customTitle} onChange={(event) => setCustomTitle(event.target.value)} /></label>
        <button onClick={makeRemix}>另存 Remix</button>
        <button onClick={() => downloadText(`${blueprint.title}.nmas.json`, JSON.stringify(blueprint, null, 2))}>导出图纸</button>
      </section>

      <section className="bp-main-grid">
        <article className="bp-graph-panel">
          <header><div><small>{blueprint.id}</small><h2>{blueprint.title}</h2></div><div><span>{blueprint.nodes.length} NODES</span><span>{blueprint.edges.length} LINKS</span><span>{validation.complexity.tier.toUpperCase()}</span></div></header>
          <Graph blueprint={blueprint} />
          <footer className="bp-edge-legend"><span>— signal</span><span>— physical</span><span>·· concept</span><span>— dependency</span></footer>
        </article>

        <aside className="bp-inspector">
          <h2>可执行性，不是艺术总分</h2>
          <DiagnosticCard label="RUN" diagnostic={validation.diagnostics.run} />
          <DiagnosticCard label="BUILD" diagnostic={validation.diagnostics.build} />
          <DiagnosticCard label="READ" diagnostic={validation.diagnostics.read} />
          <section className="bp-missing"><h3>当前缺口</h3><p>未解锁节点 {validation.lockedNodeIds.length}</p><p>熟练度阻塞 {validation.masteryBlocks.length}</p><p>资源缺口 {validation.missingResources.length}</p><p>悬空连接 {validation.danglingEdges.length}</p></section>
        </aside>
      </section>

      <section className="bp-share-panel">
        <header><small>SHARE / COMFY-LIKE WORKFLOW</small><h2>图纸码</h2></header>
        <textarea readOnly value={shareCode} aria-label="Blueprint share code" />
        <div><button onClick={() => navigator.clipboard?.writeText(shareCode)}>复制图纸码</button><input placeholder="粘贴 NMAS-BP1-..." value={importCode} onChange={(event) => setImportCode(event.target.value)} /><button onClick={importBlueprint}>读取</button></div>
      </section>

      <section className="bp-easter-grid">
        <PressureChart validation={validation} />
        <EvolutionChart blueprint={blueprint} />
        <GenealogyChart blueprint={blueprint} />
      </section>

      <section className="bp-books">
        <header><small>QUEST BOOKS</small><h2>前期任务书骨架</h2><p>教程之外，任务书都使用同一套可重复生命周期：遇见 → 获得 → 组装 → 测试 → 部署 → 归档。</p></header>
        <div>{questBooks.map((book) => <article key={book.id}><small>{book.kind.toUpperCase()}</small><h3>{book.title}</h3><p>{book.subtitle}</p><ol>{book.stages.map((item) => <li key={item.id}><strong>{item.title}</strong><span>{item.objectives[0].text}</span></li>)}</ol></article>)}</div>
      </section>

      <section className="bp-moments">
        <header><small>MEMORABLE MOMENTS</small><h2>前期要刻意制造的记忆点</h2></header>
        <div>{memorableMoments.map((moment, index) => <article key={moment.id}><span>{String(index + 1).padStart(2, '0')}</span><strong>{moment.title}</strong><small>{moment.system}</small></article>)}</div>
      </section>
    </main>
  );
}
