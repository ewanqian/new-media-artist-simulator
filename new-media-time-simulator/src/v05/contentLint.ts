import type { NarrativeNode } from './runState.ts';

export type ContentLintIssue = { nodeId: string; message: string };

export function lintContent(nodes: NarrativeNode[]): ContentLintIssue[] {
  const issues: ContentLintIssue[] = [];
  for (const node of nodes) {
    if (node.text.length > 280) issues.push({ nodeId: node.id, message: 'Visible node text exceeds the 280-character budget.' });
    if (node.type === 'decision') {
      if (node.actions.length < 2 || node.actions.length > 3) issues.push({ nodeId: node.id, message: 'A decision must expose 2–3 actions.' });
      for (const action of node.actions) {
        const delta = action.result.delta;
        if (!delta.addWork && !delta.addFlags?.length && !Object.keys(delta.resources || {}).length) {
          issues.push({ nodeId: node.id, message: `Action ${action.id} has no structured consequence.` });
        }
      }
    }
  }
  return issues;
}
