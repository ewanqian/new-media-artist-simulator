export type EpisodeChapter = {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  objective: string;
  opens: string[];
};

export type EpisodeProgressState = {
  completedCardIds: string[];
  visitedPlaceIds: string[];
  discoveredContactIds: string[];
  contactThreads: Record<string, { from: string; text: string }[]>;
  readKnowledgeEntryIds: string[];
  workbench: { compute: number; output: number; capture: number; storage: number };
};

export const openingEpisode = {
  id: 'episode-01',
  code: 'EP.01',
  title: '第一个能被别人看见的版本',
  subtitle: 'STARTING PRACTICE',
  note: '从工作室里的一个动作开始，直到作品第一次进入真实现场。',
  chapters: [
    {
      id: 'ep01-01', index: 1, title: '开机', subtitle: 'BOOT',
      objective: '在工作室完成一个起步动作。',
      opens: ['探索', '初始方法']
    },
    {
      id: 'ep01-02', index: 2, title: '离开桌面', subtitle: 'LEAVE THE DESK',
      objective: '去一个实际空间，让项目遇到真实条件。',
      opens: ['项目', '地点关系']
    },
    {
      id: 'ep01-03', index: 3, title: '形成项目', subtitle: 'MAKE IT A PROJECT',
      objective: '完成一页项目版本，并至少读一个方法或档案词条。',
      opens: ['项目语言', '方法档案']
    },
    {
      id: 'ep01-04', index: 4, title: '建立协作', subtitle: 'MAKE CONTACT',
      objective: '真正联络一个已经认识的人。',
      opens: ['联络网络', '工作台']
    },
    {
      id: 'ep01-05', index: 5, title: '第一次现场', subtitle: 'FIRST REAL TEST',
      objective: '升级一次输出或电脑能力，并进入黑盒 / 现场空间。',
      opens: ['现场路线', 'EP.02']
    }
  ] as EpisodeChapter[]
};

function hasSentRealMessage(state: EpisodeProgressState): boolean {
  return Object.values(state.contactThreads || {}).some((thread) => thread.some((message) => message.from === 'you'));
}

export function chapterDone(chapterId: string, state: EpisodeProgressState): boolean {
  if (chapterId === 'ep01-01') return state.completedCardIds.length > 0;
  if (chapterId === 'ep01-02') return state.visitedPlaceIds.length > 0;
  if (chapterId === 'ep01-03') {
    return state.completedCardIds.includes('project-one-page') && state.readKnowledgeEntryIds.length > 0;
  }
  if (chapterId === 'ep01-04') return hasSentRealMessage(state);
  if (chapterId === 'ep01-05') {
    const upgraded = (state.workbench.compute || 1) > 1 || (state.workbench.output || 1) > 1;
    const wentLive = state.visitedPlaceIds.includes('place-blackbox');
    return upgraded && wentLive;
  }
  return false;
}

export function openingEpisodeProgress(state: EpisodeProgressState) {
  const chapters = openingEpisode.chapters.map((chapter) => ({ ...chapter, done: chapterDone(chapter.id, state) }));
  const completed = chapters.filter((chapter) => chapter.done).length;
  const active = chapters.find((chapter) => !chapter.done) || chapters.at(-1);
  return {
    chapters,
    completed,
    total: chapters.length,
    ratio: completed / chapters.length,
    active,
    complete: completed === chapters.length
  };
}
