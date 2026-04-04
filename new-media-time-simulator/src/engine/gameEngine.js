import { archetypes } from '../data/archetypes.js';
import { skills } from '../data/skills.js';
import { regions, actions } from '../data/maps.js';
import { npcs } from '../data/npcs.js';
import { projects } from '../data/projects.js';
import { clamp, randomPick, sumWeights } from './utils.js';

const ARCHETYPE_SCORE_MAP = {
  'field-critic': ['critique', 'academia'],
  'spatial-engineer': ['spatial', 'architecture'],
  'code-nomad': ['code', 'systems'],
  'commercial-alchemist': ['commerce', 'production'],
  'architecture-medium': ['architecture', 'spatial'],
  'residency-smuggler': ['production', 'academia']
};

export const getRecommendedArchetype = (answers) => {
  const totals = sumWeights(answers);
  let winner = archetypes[0].id;
  let highScore = -Infinity;

  archetypes.forEach((archetype) => {
    const keys = ARCHETYPE_SCORE_MAP[archetype.id] || [];
    const score = keys.reduce((sum, key) => sum + (totals[key] || 0), 0);
    if (score > highScore) {
      highScore = score;
      winner = archetype.id;
    }
  });

  return winner;
};

export const getArchetypeById = (id) => archetypes.find((item) => item.id === id);
export const getRegionById = (id) => regions.find((item) => item.id === id);
export const getProjectById = (id) => projects.find((item) => item.id === id);
export const getSkillById = (id) => skills.find((item) => item.id === id);

export const createInitialState = () => ({
  stage: 'intro',
  answers: [],
  recommendedArchetypeId: null,
  selectedArchetypeId: null,
  equippedSkills: {
    methodology: null,
    tool: null,
    network: null,
    survival: null,
    special: null
  },
  unlockedSkills: [],
  currentRegionId: 'region_rongshore',
  currentSubmapId: 'sub_cowork',
  turn: 1,
  phase: 1,
  stats: {
    insight: 0,
    funds: 0,
    reputation: 0,
    stamina: 0,
    anxiety: 0,
    archive: 0,
    network: 0,
    tech: 0
  },
  inventory: {
    cacheShard: 0,
    budgetVoucher: 0,
    favor: 0,
    patchKit: 0,
    nodeChip: 0,
    recoveryTape: 0,
    salvageCore: 0,
    rumorPacket: 0,
    openCallStamp: 0,
    residencySeal: 0,
    manifestoCore: 0
  },
  activeProjects: [],
  log: ['欢迎来到《新媒体时间模拟器》。先测一下你到底是哪种艺术生态生物。'],
  encounter: null,
  ending: null
});

export const startGameWithArchetype = (state, archetypeId) => {
  const archetype = getArchetypeById(archetypeId);
  const unlockedSkills = [...new Set(archetype.starterSkills)];
  const equippedSkills = { ...state.equippedSkills };
  unlockedSkills.forEach((skillId) => {
    const skill = getSkillById(skillId);
    if (skill && !equippedSkills[skill.slot]) {
      equippedSkills[skill.slot] = skill.id;
    }
  });

  return {
    ...state,
    stage: 'play',
    selectedArchetypeId: archetypeId,
    stats: { ...archetype.startingStats },
    unlockedSkills,
    equippedSkills,
    log: [
      ...state.log,
      `你已载入干员外壳：${archetype.name}。${archetype.description}`
    ]
  };
};

export const getComputedStats = (state) => {
  const computed = { ...state.stats };
  Object.values(state.equippedSkills).forEach((skillId) => {
    const skill = getSkillById(skillId);
    if (!skill) return;
    Object.entries(skill.modifiers || {}).forEach(([key, value]) => {
      computed[key] = clamp((computed[key] || 0) + value, 0, key === 'funds' ? 999 : 99);
    });
  });
  return computed;
};

export const getAvailableRegions = (phase) => regions.filter((region) => region.unlockPhase <= phase);

export const getCurrentSubmap = (state) => {
  const region = getRegionById(state.currentRegionId);
  return region?.submaps.find((item) => item.id === state.currentSubmapId) || region?.submaps?.[0] || null;
};

const applyInventoryRewards = (inventory, rewardItems = {}) => {
  const next = { ...inventory };
  Object.entries(rewardItems).forEach(([key, amount]) => {
    next[key] = (next[key] || 0) + amount;
  });
  return next;
};

const maybeUnlockSkill = (state, action, region) => {
  const pool = skills.filter((skill) => {
    if (state.unlockedSkills.includes(skill.id)) return false;
    if (!skill.mapTags?.length) return Math.random() > 0.85;
    return skill.mapTags.some((tag) => region.tags.includes(tag) || action.encounterTags?.includes(tag));
  });
  if (!pool.length) return null;
  if (Math.random() > 0.35) return null;
  return randomPick(pool);
};

const maybeEncounterNpc = (region, action) => {
  const pool = npcs.filter((npc) => npc.locationTags.some((tag) => region.tags.includes(tag) || action.encounterTags?.includes(tag)));
  return Math.random() > 0.65 ? null : randomPick(pool);
};

const applyStatDelta = (stats, delta = {}) => {
  const next = { ...stats };
  Object.entries(delta).forEach(([key, amount]) => {
    const max = key === 'funds' ? 999 : 99;
    next[key] = clamp((next[key] || 0) + amount, 0, max);
  });
  return next;
};

const resolveProjects = (state) => {
  let stats = { ...state.stats };
  let inventory = { ...state.inventory };
  const log = [];

  const activeProjects = state.activeProjects
    .map((project) => ({ ...project, remaining: project.remaining - 1 }))
    .filter((project) => {
      if (project.remaining > 0) return true;
      const template = getProjectById(project.templateId);
      if (template) {
        stats = applyStatDelta(stats, template.rewards);
        inventory = applyInventoryRewards(inventory, template.rewards.items);
        log.push(`研发完成：${template.name}。你从中回收了新的资源。`);
      }
      return false;
    });

  return { activeProjects, stats, inventory, log };
};

export const performAction = (state, actionId) => {
  const action = actions[actionId];
  const region = getRegionById(state.currentRegionId);
  if (!action || !region) return state;

  let nextStats = applyStatDelta(state.stats, action.effects);
  let nextInventory = applyInventoryRewards(state.inventory, action.rewards?.items);
  const nextUnlockedSkills = [...state.unlockedSkills];
  const nextLog = [...state.log, `第 ${state.turn} 周行动：${action.name} —— ${action.description}`];

  const archetype = getArchetypeById(state.selectedArchetypeId);
  if (archetype?.id === 'spatial-engineer' && region.tags.includes('space')) {
    nextStats = applyStatDelta(nextStats, { insight: 1 });
    nextLog.push('被动触发：空间叙事工程师在空间地图额外获得 1 洞察。');
  }
  if (archetype?.id === 'commercial-alchemist' && action.kind === 'commercial') {
    nextStats = applyStatDelta(nextStats, { funds: 1 });
    nextLog.push('被动触发：商业影像炼金师从现实里再挤出 1 资金。');
  }

  const unlocked = maybeUnlockSkill(state, action, region);
  if (unlocked) {
    nextUnlockedSkills.push(unlocked.id);
    nextLog.push(`你打捞到了新技能节点：${unlocked.name}。`);
  }

  const npc = maybeEncounterNpc(region, action);
  if (npc) {
    nextStats = applyStatDelta(nextStats, npc.effects);
    nextLog.push(`${npc.name}：${randomPick(npc.lines)}`);
  }

  const progressed = resolveProjects({ ...state, stats: nextStats, inventory: nextInventory });
  nextStats = progressed.stats;
  nextInventory = progressed.inventory;
  nextLog.push(...progressed.log);

  const nextTurn = state.turn + 1;
  const nextPhase = Math.min(4, Math.floor((nextTurn - 1) / 5) + 1);

  const ending = nextTurn > 20 ? buildEnding({ ...state, stats: nextStats }) : null;
  if (nextTurn > 20) nextLog.push(`阶段结算：${ending.title}`);

  return {
    ...state,
    turn: nextTurn,
    phase: nextPhase,
    stats: nextStats,
    inventory: nextInventory,
    unlockedSkills: nextUnlockedSkills,
    activeProjects: progressed.activeProjects,
    encounter: npc,
    log: nextLog,
    ending
  };
};

export const equipSkill = (state, skillId) => {
  const skill = getSkillById(skillId);
  if (!skill || !state.unlockedSkills.includes(skillId)) return state;
  return {
    ...state,
    equippedSkills: {
      ...state.equippedSkills,
      [skill.slot]: skillId
    },
    log: [...state.log, `已装配技能：${skill.name} → ${skill.slot}`]
  };
};

export const moveToRegion = (state, regionId, submapId) => ({
  ...state,
  currentRegionId: regionId,
  currentSubmapId: submapId,
  log: [...state.log, `已移动到：${getRegionById(regionId)?.name} / ${submapId}`]
});

export const startProject = (state, projectId) => {
  const template = getProjectById(projectId);
  if (!template) return state;
  if (state.activeProjects.length >= 2) {
    return {
      ...state,
      log: [...state.log, '研发队列已满。先等一个项目长出来。']
    };
  }

  const canAfford = Object.entries(template.costs).every(([key, value]) => (state.stats[key] || 0) >= value);
  if (!canAfford) {
    return {
      ...state,
      log: [...state.log, `资源不足，无法启动：${template.name}`]
    };
  }

  const nextStats = { ...state.stats };
  Object.entries(template.costs).forEach(([key, value]) => {
    nextStats[key] = clamp((nextStats[key] || 0) - value, 0, key === 'funds' ? 999 : 99);
  });

  return {
    ...state,
    stats: nextStats,
    activeProjects: [...state.activeProjects, { templateId: projectId, remaining: template.duration }],
    log: [...state.log, `已挂载研发：${template.name}（${template.duration} 回合）`]
  };
};

export const buildEnding = (state) => {
  const { reputation, funds, insight, archive, tech, anxiety } = state.stats;
  if (anxiety >= 18) {
    return {
      title: '结局：高压存活体',
      description: '你把自己训练成了一套能持续交付的系统，但也意识到接下来必须重写生活结构。'
    };
  }
  if (reputation >= 18 && insight >= 16) {
    return {
      title: '结局：自建引擎者',
      description: '你不再只是接项目的人，而是在逐渐形成自己的方法论、生态与语言。'
    };
  }
  if (funds >= 18 && tech >= 16) {
    return {
      title: '结局：工作流资本家',
      description: '你把项目、工具和预算缝成了一个能持续运转的小系统。危险在于，它也可能反过来吞掉你的时间。'
    };
  }
  if (archive >= 18) {
    return {
      title: '结局：档案炼金术士',
      description: '你从旧材料里建立出新秩序，开始让失败具备可继承性。'
    };
  }
  return {
    title: '结局：仍在漂流，但已成型',
    description: '你还没有彻底稳定下来，但你已经拥有一套不会轻易消失的骨架。'
  };
};
