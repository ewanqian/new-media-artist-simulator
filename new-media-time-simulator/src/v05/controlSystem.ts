export type AttentionMoment = 'default-start' | 'active-problem' | 'after-action' | 'optional-help';
export type Concept = { id: string; label: string; introducedBy: string; solvesProblem: string; enablesActions: string[] };
export type AttentionItem = { id: string; text: string; moment: AttentionMoment; currentProblemId?: string; concepts?: string[]; affects: string[] };
export type ControlIssue = { id: string; kind: 'attention' | 'redundancy'; message: string };

/** A concept is allowed only when its provenance, relevance, and action value are explicit. */
export function lintAttention(items: AttentionItem[], concepts: Concept[], reachedEvents: string[]): ControlIssue[] {
  const issues: ControlIssue[] = [];
  const byId = new Map(concepts.map((concept) => [concept.id, concept]));
  for (const item of items) for (const conceptId of item.concepts || []) {
    const concept = byId.get(conceptId);
    if (!concept) { issues.push({ id: item.id, kind: 'attention', message: 'Visible concept has no provenance record: ' + conceptId }); continue; }
    if (!reachedEvents.includes(concept.introducedBy)) issues.push({ id: item.id, kind: 'attention', message: 'Concept appears before its introduction: ' + conceptId });
    if (item.currentProblemId !== concept.solvesProblem) issues.push({ id: item.id, kind: 'attention', message: 'Concept does not solve the current player problem: ' + conceptId });
    if (concept.enablesActions.length === 0) issues.push({ id: item.id, kind: 'attention', message: 'Concept enables no action: ' + conceptId });
  }
  return issues;
}
export function lintRedundancy(items: AttentionItem[]): ControlIssue[] {
  return items.filter((item) => item.affects.length === 0).map((item) => ({ id: item.id, kind: 'redundancy', message: 'Visible element changes nothing.' }));
}
export type ChangeRecord = { id: string; playerProblem: string; changedFiles: string[]; stateEffect: string; automatedCheck: string; humanReview: 'pending' | 'passed' | 'failed'; rollbackCommit: string };