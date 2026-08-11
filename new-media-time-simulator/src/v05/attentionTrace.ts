export type AttentionDomain = 'making' | 'site' | 'network' | 'archive' | 'survival';

export type AttentionTrace = Record<AttentionDomain, {
  weight: number;
  lastWeek: number;
}>;

export type AttentionProfile = {
  dominant: AttentionDomain[];
  neglected: AttentionDomain[];
  spread: number;
};

const domainOrder: AttentionDomain[] = ['making', 'site', 'network', 'archive', 'survival'];

const opportunityDomains: Record<string, AttentionDomain[]> = {
  'opp-blackbox-two-hours': ['site', 'making'],
  'opp-open-call-small-space': ['archive', 'network'],
  'opp-brand-demo': ['survival', 'making', 'network'],
  'opp-hangzhou-week': ['network', 'archive'],
  'opp-emergency-live': ['survival', 'making'],
  'opp-public-screen': ['site', 'making'],
  'opp-artist-run-show': ['site', 'network'],
  'opp-workshop': ['archive', 'network']
};

export function createAttentionTrace(): AttentionTrace {
  return {
    making: { weight: 0, lastWeek: 0 },
    site: { weight: 0, lastWeek: 0 },
    network: { weight: 0, lastWeek: 0 },
    archive: { weight: 0, lastWeek: 0 },
    survival: { weight: 0, lastWeek: 0 }
  };
}

export function normalizeAttentionTrace(raw: unknown): AttentionTrace {
  const fresh = createAttentionTrace();
  if (!raw || typeof raw !== 'object') return fresh;
  const value = raw as Partial<AttentionTrace>;
  for (const domain of domainOrder) {
    const candidate = value[domain];
    if (!candidate || typeof candidate !== 'object') continue;
    fresh[domain] = {
      weight: Math.max(0, Number(candidate.weight || 0)),
      lastWeek: Math.max(0, Number(candidate.lastWeek || 0))
    };
  }
  return fresh;
}

export function recordAttention(
  trace: AttentionTrace,
  domain: AttentionDomain,
  week: number,
  amount = 1
): AttentionTrace {
  return {
    ...trace,
    [domain]: {
      weight: trace[domain].weight + Math.max(0, amount),
      lastWeek: Math.max(trace[domain].lastWeek, week)
    }
  };
}

export function decayAttention(trace: AttentionTrace, week: number, decayPerWeek = 0.12): AttentionTrace {
  const next = createAttentionTrace();
  for (const domain of domainOrder) {
    const age = Math.max(0, week - trace[domain].lastWeek);
    const factor = Math.max(0.35, 1 - age * decayPerWeek);
    next[domain] = {
      weight: Number((trace[domain].weight * factor).toFixed(3)),
      lastWeek: trace[domain].lastWeek
    };
  }
  return next;
}

export function describeAttention(trace: AttentionTrace): AttentionProfile {
  const ranked = domainOrder
    .map((domain) => ({ domain, weight: trace[domain].weight }))
    .sort((a, b) => b.weight - a.weight || domainOrder.indexOf(a.domain) - domainOrder.indexOf(b.domain));
  const max = ranked[0]?.weight || 0;
  const min = ranked[ranked.length - 1]?.weight || 0;
  const total = ranked.reduce((sum, item) => sum + item.weight, 0);
  const dominant = max === 0 ? [] : ranked.filter((item) => item.weight >= max * 0.72).map((item) => item.domain);
  const neglected = total === 0 ? [] : ranked.filter((item) => item.weight <= Math.max(0.5, max * 0.28)).map((item) => item.domain);
  return {
    dominant,
    neglected,
    spread: Number((max - min).toFixed(3))
  };
}

export function opportunityDomainsFor(opportunityId: string): AttentionDomain[] {
  return [...(opportunityDomains[opportunityId] || [])];
}

export function opportunityAttentionScore(opportunityId: string, trace: AttentionTrace): number {
  const domains = opportunityDomainsFor(opportunityId);
  if (!domains.length) return 0;
  const focused = domains.reduce((sum, domain) => sum + trace[domain].weight, 0) / domains.length;
  const profile = describeAttention(trace);
  const neglectedBonus = domains.some((domain) => profile.neglected.includes(domain)) ? 0.35 : 0;
  return Number((focused + neglectedBonus).toFixed(3));
}

export function rankOpportunityIds(ids: string[], trace: AttentionTrace): string[] {
  return ids
    .map((id, index) => ({ id, index, score: opportunityAttentionScore(id, trace) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((item) => item.id);
}

export function attentionDomainLabel(domain: AttentionDomain): string {
  const labels: Record<AttentionDomain, string> = {
    making: '制作',
    site: '场地',
    network: '联络',
    archive: '档案',
    survival: '生存'
  };
  return labels[domain];
}
