import {
  careerAssessmentQuestions,
  careerResourcePacks,
  type CareerProfile,
  type CareerWorkMode
} from './careerContent.ts';

function unique(values: string[]) { return [...new Set(values.filter(Boolean))]; }

function topSignals(values: string[], limit = 3) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([id]) => id);
}

function promptFor(signals: string[]) {
  if (signals.includes('spatial')) return '先做一个会改变观看距离、身体路线或空间判断的最小版本。';
  if (signals.includes('research')) return '先让一个具体问题通过材料、媒介或行为被别人实际看见。';
  if (signals.includes('production')) return '从一个真实限制开始，把它转成一套你自己愿意继续追的规则。';
  return '先做一个能运行的最小系统，再让别人真正看到它。';
}

export function buildAssessmentCareerProfile(answerIdsByQuestion: string[], workMode: CareerWorkMode, now = new Date()): CareerProfile {
  const selected = careerAssessmentQuestions.map((question, index) => question.options.find((option) => option.id === answerIdsByQuestion[index])).filter(Boolean);
  const signals = topSignals(selected.flatMap((option) => option?.signals || []));
  const biasCounts = new Map<string, number>();
  for (const option of selected) if (option?.resourceBias) biasCounts.set(option.resourceBias, (biasCounts.get(option.resourceBias) || 0) + 1);
  const packId = [...biasCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
    || (signals.includes('production') ? 'pack-client' : signals.includes('research') ? 'pack-archive' : signals.includes('spatial') ? 'pack-shared' : 'pack-desk');
  const pack = careerResourcePacks.find((item) => item.id === packId) || careerResourcePacks[0];
  const knownNpcIds = unique([...pack.knownNpcIds, ...selected.map((item) => item?.knownNpcId || '')]);
  return {
    schema: 'nmas-career-profile-v1',
    id: `career-assessment-${now.getTime().toString(36)}`,
    title: signals.length ? `${signals.slice(0, 2).join(' × ')} 起步档案` : '未定型起步档案',
    description: '这不是职业分类，只记录你当前更熟悉的入口。后续任何方法、媒介和关系都可以改变这份描述。',
    signalTags: signals,
    resourcePackId: pack.id,
    knownNpcIds,
    firstProjectPrompt: promptFor(signals),
    workMode,
    createdAt: now.toISOString(),
    source: 'assessment'
  };
}
