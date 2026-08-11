export type LayoutNode = { id: string; x: number; y: number; definitionId?: string; groupId?: string | null; [key: string]: any };
export type LayoutEdge = { from: string; to: string; [key: string]: any };
export type BlueprintGroup = { id: string; title: string; compact?: boolean; nodeIds: string[] };

const NODE_W = 178;
const NODE_H = 118;
const GAP_X = 88;
const GAP_Y = 58;
const MARGIN_X = 90;
const MARGIN_Y = 80;

export function nodeBounds(nodes: LayoutNode[]) {
  if (!nodes.length) return { x: 0, y: 0, width: 1, height: 1, cx: 0, cy: 0 };
  const minX = Math.min(...nodes.map((node) => Number(node.x || 0)));
  const minY = Math.min(...nodes.map((node) => Number(node.y || 0)));
  const maxX = Math.max(...nodes.map((node) => Number(node.x || 0) + NODE_W));
  const maxY = Math.max(...nodes.map((node) => Number(node.y || 0) + NODE_H));
  return { x: minX, y: minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY), cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}

function topoRanks(nodes: LayoutNode[], edges: LayoutEdge[]) {
  const ids = new Set(nodes.map((node) => node.id));
  const incoming = new Map(nodes.map((node) => [node.id, 0]));
  const outgoing = new Map(nodes.map((node) => [node.id, [] as string[]]));
  for (const edge of edges) {
    if (!ids.has(edge.from) || !ids.has(edge.to) || edge.from === edge.to) continue;
    incoming.set(edge.to, Number(incoming.get(edge.to) || 0) + 1);
    outgoing.get(edge.from)?.push(edge.to);
  }
  const queue = nodes.filter((node) => incoming.get(node.id) === 0).map((node) => node.id);
  const rank = new Map(nodes.map((node) => [node.id, 0]));
  const visited = new Set<string>();
  while (queue.length) {
    const id = queue.shift()!;
    visited.add(id);
    for (const child of outgoing.get(id) || []) {
      rank.set(child, Math.max(Number(rank.get(child) || 0), Number(rank.get(id) || 0) + 1));
      incoming.set(child, Number(incoming.get(child) || 0) - 1);
      if (incoming.get(child) === 0) queue.push(child);
    }
  }
  if (visited.size !== nodes.length) {
    const fallback = Math.max(0, ...rank.values());
    for (const node of nodes) if (!visited.has(node.id)) rank.set(node.id, fallback + 1);
  }
  return rank;
}

export function autoLayoutNodes(nodes: LayoutNode[], edges: LayoutEdge[]) {
  if (!nodes.length) return [];
  const rank = topoRanks(nodes, edges);
  const columns = new Map<number, LayoutNode[]>();
  for (const node of nodes) {
    const value = Number(rank.get(node.id) || 0);
    if (!columns.has(value)) columns.set(value, []);
    columns.get(value)!.push(node);
  }
  for (const column of columns.values()) {
    column.sort((a, b) => String(a.groupId || a.definitionId || a.id).localeCompare(String(b.groupId || b.definitionId || b.id)));
  }
  const positioned = new Map<string, LayoutNode>();
  for (const [columnIndex, column] of [...columns.entries()].sort((a, b) => a[0] - b[0])) {
    column.forEach((node, rowIndex) => {
      positioned.set(node.id, {
        ...node,
        x: MARGIN_X + columnIndex * (NODE_W + GAP_X),
        y: MARGIN_Y + rowIndex * (NODE_H + GAP_Y)
      });
    });
  }
  return nodes.map((node) => positioned.get(node.id) || node);
}

export function connectedNodeIds(nodes: LayoutNode[], edges: LayoutEdge[], selectedNodeId: string) {
  if (!nodes.some((node) => node.id === selectedNodeId)) return [];
  const ids = new Set<string>([selectedNodeId]);
  for (const edge of edges) {
    if (edge.from === selectedNodeId) ids.add(edge.to);
    if (edge.to === selectedNodeId) ids.add(edge.from);
  }
  return [...ids].filter((id) => nodes.some((node) => node.id === id));
}

export function createConnectedGroup(blueprint: any, selectedNodeId: string, groupId: string, title: string) {
  const nodeIds = connectedNodeIds(blueprint.nodes || [], blueprint.edges || [], selectedNodeId);
  if (nodeIds.length < 2) return blueprint;
  const existingGroups: BlueprintGroup[] = Array.isArray(blueprint.groups) ? blueprint.groups : [];
  const groups = existingGroups
    .map((group) => ({ ...group, nodeIds: group.nodeIds.filter((id) => !nodeIds.includes(id)) }))
    .filter((group) => group.nodeIds.length > 1);
  groups.push({ id: groupId, title, compact: false, nodeIds });
  return {
    ...blueprint,
    groups,
    nodes: blueprint.nodes.map((node: LayoutNode) => nodeIds.includes(node.id) ? { ...node, groupId } : node)
  };
}

export function ungroupNodes(blueprint: any, groupId: string) {
  return {
    ...blueprint,
    groups: (blueprint.groups || []).filter((group: BlueprintGroup) => group.id !== groupId),
    nodes: (blueprint.nodes || []).map((node: LayoutNode) => node.groupId === groupId ? { ...node, groupId: null } : node)
  };
}
