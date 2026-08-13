export type AttentionItem = {
  id: string;
  text: string;
  moment: 'default-start' | 'active-problem' | 'after-action' | 'optional-help';
  introduces?: string[];
  playerProblem?: string;
};

export type ControlIssue = { id: string; kind: 'attention' | 'redundancy'; message: string };

const blockedAtStart = [
  'Asset', 'Evidence', 'Knowledge', 'Work Graph', 'Blueprint', 'Node', 'Archive',
  'Costa Rica', 'Inés', 'Rojas', 'Gaussian', '点云', '相机求解', 'Geometry Nodes'
];

/** Default play may introduce only the immediate problem, action, or consequence. */
export function lintAttention(items: AttentionItem[]): ControlIssue[] {
  const issues: ControlIssue[] = [];
  for (const item of items) {
    if (item.moment === 'default-start') {
      for (const term of blockedAtStart) if (item.text.includes(term)) {
        issues.push({ id: item.id, kind: 'attention', message: 'Premature concept in default play: ' + term });
      }
      if (item.introduces?.length && !item.playerProblem) {
        issues.push({ id: item.id, kind: 'attention', message: 'A new concept has no current player problem.' });
      }
    }
  }
  return issues;
}

/** A visible element must alter an action, a consequence, or understanding of the current problem. */
export function lintRedundancy(items: Array<{ id: string; affects: string[] }>): ControlIssue[] {
  return items.filter((item) => item.affects.length === 0)
    .map((item) => ({ id: item.id, kind: 'redundancy', message: 'Visible element changes nothing.' }));
}

export type ChangeRecord = {
  id: string;
  playerProblem: string;
  changedFiles: string[];
  stateEffect: string;
  automatedCheck: string;
  humanReview: 'pending' | 'passed' | 'failed';
  rollbackCommit: string;
};
