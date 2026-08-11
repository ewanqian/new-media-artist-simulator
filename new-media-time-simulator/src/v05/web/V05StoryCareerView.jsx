import { useMemo, useState } from 'react';
import { CAREER_SAVE_KEY, careerNpcArcs, careerStageById, resourcePackById } from '../careerContent.ts';
import { careerStageOneScene } from '../careerStageOne.ts';
import { applyCareerStoryCommand } from '../careerStoryRuntime.ts';
import { applyCareerStageTwoCommand, careerStageTwoProgress, careerStageTwoScene } from '../careerStageTwo.ts';
import { applyCareerStageThreeCommand, careerStageThreeProgress, careerStageThreeScene } from '../careerStageThree.ts';
import { openingQuestProgress } from '../questRuntime.ts';
import './v05-story-career.css';

const kindLabel = { build: 'BUILD', route: 'ROUTE', commitment: 'COMMIT', time: 'TIME' };

function loadSave() {
  try { return JSON.parse(localStorage.getItem(CAREER_SAVE_KEY) || 'null'); }
  catch { return null; }
}

function choiceDisabled(choice, save) {
  const attention = Number(choice.cost.match(/注意力\s*-\s*(\d+)/)?.[1] || 0);
  const explicitCash = Number(choice.cost.match(/(?:成本\s*)?¥\s*(\d+)/)?.[1] || 0);
  return Number(save?.attention || 0) < attention || Number(save?.cash || 0) < explicitCash;
}

function progressFor(stageId, save) {
  if (stageId === 'stage-3') return careerStageThreeProgress(save || {});
  if (stageId === 'stage-2') return careerStageTwoProgress(save || {});
  return openingQuestProgress(save || {});
}

function sceneFor(stageId, save) {
  if (stageId === 'stage-3') return careerStageThreeScene(save || {});
  if (stageId === 'stage-2') return careerStageTwoScene(save || {});
  return careerStageOneScene(save || {}, 'story');
}

export default function V05StoryCareerView({ profile }) {
  const [save, setSave] = useState(loadSave);
  const [notice, setNotice] = useState(null);
  const stageId = save?.careerStageId || 'stage-1';
  const stage = careerStageById(stageId);
  const progress = useMemo(() => progressFor(stageId, save), [save, stageId]);
  const scene = useMemo(() => sceneFor(stageId, save), [save, stageId]);
  const pack = resourcePackById(profile?.resourcePackId);
  const knownPeople = (save?.discoveredContactIds || []).map((id) => careerNpcArcs.find((npc) => npc.id === id)).filter(Boolean);
  const openIssues = (save?.revealedIssueIds || []).filter((id) => !(save?.resolvedIssueIds || []).includes(id));
  const nextStage = stageId === 'stage-1'
    ? { title: '现场：世界会反击', text: 'Stage 2：两小时黑盒、六小时搭建窗口、凌晨后的故障恢复。' }
    : stageId === 'stage-2'
      ? { title: '网络：别人开始因为一件事找你', text: 'Stage 3：第一个小委托、Open Call、一页版本、传播误读和机构回流。' }
      : { title: '方法：你不再每次从零开始', text: 'Stage 4 会把失败项目、旧 Blueprint、方法与教学真正变成可复用生产方式。' };

  function choose(choice) {
    const result = choice.id.startsWith('story:stage3:')
      ? applyCareerStageThreeCommand(save || {}, choice.id)
      : choice.id.startsWith('story:stage2:')
        ? applyCareerStageTwoCommand(save || {}, choice.id)
        : applyCareerStoryCommand(save || {}, choice.id);
    if (result.save === save) {
      setNotice(result.notice);
      return;
    }
    const next = { ...result.save, screen: 'play' };
    localStorage.setItem(CAREER_SAVE_KEY, JSON.stringify(next));
    setSave(next);
    setNotice(result.notice);
    window.setTimeout(() => setNotice(null), 2600);
  }

  if (!save) return <main className="vstory-shell"><section className="vstory-missing"><h1>没有找到生涯存档</h1><a href="./?mode=career">建立起步档案</a></section></main>;

  const stageTransition = stageId === 'stage-2' && progress.complete
    ? { id: 'story:stage3:enter', title: '进入第三阶段：网络', detail: '现场档案开始被别人转述。第一个小委托会因为你已经做过的具体事情找上门。', cost: '时间推进 · NETWORK', kind: 'route' }
    : null;

  return (
    <main className="vstory-shell">
      <header className="vstory-top">
        <div><small>CAREER {stage.index}/5 · {stage.code}</small><strong>{profile?.title || '起步档案'}</strong><span>{stage.subtitle}</span></div>
        <div className="vstory-stats"><span>第 {save.week} 周</span><span>注意力 {save.attention}/{save.attentionMax}</span><span>¥{save.cash}</span></div>
      </header>

      <div className="vstory-layout">
        <section className="vstory-main">
          <nav className="vstory-questline" aria-label={`第 ${stage.index} 阶段任务线`} style={{ '--quest-count': progress.quests.length }}>
            {progress.quests.map((quest, index) => <div key={quest.id} className={`${quest.done ? 'done' : ''} ${quest.active ? 'active' : ''}`}><i>{quest.done ? '✓' : String(index + 1).padStart(2, '0')}</i><span>{quest.title}</span></div>)}
          </nav>

          <article className="vstory-scene" aria-label="当前剧情场景">
            <header><small>{scene.kicker}</small><h1>{scene.title}</h1></header>
            <div className="vstory-copy">{scene.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
            {scene.note && <aside className="vstory-note"><small>当前版本说明</small><p>{scene.note}</p></aside>}
            {scene.choices.length > 0 && <div className="vstory-choices">{scene.choices.map((choice) => <button key={choice.id} onClick={() => choose(choice)} disabled={choiceDisabled(choice, save)}><small>{kindLabel[choice.kind]}</small><strong>{choice.title}</strong><p>{choice.detail}</p><span>{choice.cost}</span></button>)}</div>}
            {stageTransition && <div className="vstory-transition"><button onClick={() => choose(stageTransition)}><small>ROUTE</small><strong>{stageTransition.title}</strong><p>{stageTransition.detail}</p><span>{stageTransition.cost}</span></button></div>}
            {scene.optionalWorkbench && <p className="vstory-optional">{scene.optionalWorkbench}</p>}
          </article>
        </section>

        <aside className="vstory-context">
          <section><small>CURRENT PROJECT</small><strong>{save.primaryProject?.name || '还没有项目'}</strong><p>{save.primaryProject?.question || profile?.firstProjectPrompt}</p>{save.primaryProject?.methods?.length > 0 && <div className="vstory-tags">{save.primaryProject.methods.map((method) => <span key={method}>{method}</span>)}</div>}</section>
          <section><small>RESOURCES</small><strong>{pack.title}</strong><div className="vstory-tags">{pack.assets.slice(0, 5).map((asset) => <span key={asset}>{asset}</span>)}</div></section>
          <section><small>PEOPLE</small><strong>{knownPeople.length ? `${knownPeople.length} 个已进入生涯的人` : '还没有真正认识的人'}</strong>{knownPeople.map((npc) => <p key={npc.id}><b>{npc.name}</b> · {npc.role}</p>)}{Number(save.pendingReplies?.length || 0) > 0 && <em>{save.pendingReplies.length} 条回复还在未来。</em>}</section>
          <section><small>EVIDENCE / THREADS</small><strong>{save.evidenceIds?.length || 0} 条证据</strong><p>未解决问题：{openIssues.length}</p><p>方法：{save.methodIds?.length || 0}</p><p>特殊事件：{save.seenEventIds?.length || 0}</p></section>
          {Array.isArray(save.careerKnownFor) && save.careerKnownFor.length > 0 && <section className="vstory-knownfor"><small>KNOWN FOR</small><strong>别人现在因为什么找你</strong>{save.careerKnownFor.map((item) => <p key={item}>{item}</p>)}</section>}
          {progress.complete && <section className="vstory-next"><small>NEXT</small><strong>{nextStage.title}</strong><p>{nextStage.text}</p></section>}
        </aside>
      </div>

      {notice && <div className="vstory-toast"><small>SYSTEM</small><strong>{notice.title}</strong><span>{notice.text}</span></div>}
    </main>
  );
}
