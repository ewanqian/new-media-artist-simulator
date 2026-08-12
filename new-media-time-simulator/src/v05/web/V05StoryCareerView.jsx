import { useMemo, useState } from 'react';
import { CAREER_SAVE_KEY, careerNpcArcs, careerStageById, resourcePackById } from '../careerContent.ts';
import { careerStageOneScene } from '../careerStageOne.ts';
import { applyCareerStoryCommand } from '../careerStoryRuntime.ts';
import { applyCareerStageTwoCommand, careerStageTwoProgress, careerStageTwoScene } from '../careerStageTwo.ts';
import { applyCareerStageThreeCommand, careerStageThreeProgress, careerStageThreeScene } from '../careerStageThree.ts';
import { applyCareerStageFourCommand, careerStageFourProgress, careerStageFourScene } from '../careerStageFour.ts';
import { applyCareerStageFiveCommand, careerStageFiveProgress, careerStageFiveScene } from '../careerStageFive.ts';
import { openingQuestProgress } from '../questRuntime.ts';
import './v05-story-career.css';

const kindLabel = { build: 'BUILD', route: 'ROUTE', commitment: 'COMMIT', time: 'TIME' };
const unique = (values = []) => [...new Set(values.filter(Boolean))];

function loadSave() {
  try { return JSON.parse(localStorage.getItem(CAREER_SAVE_KEY) || 'null'); }
  catch { return null; }
}

function consequenceLabel(value = '') {
  const cleaned = String(value)
    .replace(/注意力\s*-\d+\s*·?\s*/g, '')
    .replace(/注意力\s*0\s*·?\s*/g, '')
    .trim();
  return cleaned || '这个选择会留下后果';
}

function progressFor(stageId, save) {
  if (stageId === 'stage-5') return careerStageFiveProgress(save || {});
  if (stageId === 'stage-4') return careerStageFourProgress(save || {});
  if (stageId === 'stage-3') return careerStageThreeProgress(save || {});
  if (stageId === 'stage-2') return careerStageTwoProgress(save || {});
  return openingQuestProgress(save || {});
}

function sceneFor(stageId, save) {
  if (stageId === 'stage-5') return careerStageFiveScene(save || {});
  if (stageId === 'stage-4') return careerStageFourScene(save || {});
  if (stageId === 'stage-3') return careerStageThreeScene(save || {});
  if (stageId === 'stage-2') return careerStageTwoScene(save || {});
  return careerStageOneScene(save || {}, 'story');
}

function runChoice(runtimeSave, choiceId) {
  if (choiceId.startsWith('story:stage5:')) return applyCareerStageFiveCommand(runtimeSave, choiceId);
  if (choiceId.startsWith('story:stage4:')) return applyCareerStageFourCommand(runtimeSave, choiceId);
  if (choiceId.startsWith('story:stage3:')) return applyCareerStageThreeCommand(runtimeSave, choiceId);
  if (choiceId.startsWith('story:stage2:')) return applyCareerStageTwoCommand(runtimeSave, choiceId);
  return applyCareerStoryCommand(runtimeSave, choiceId);
}

export default function V05StoryCareerView({ profile }) {
  const [save, setSave] = useState(loadSave);
  const [notice, setNotice] = useState(null);
  const stageId = save?.careerStageId || 'stage-1';
  const stage = careerStageById(stageId);
  const progress = useMemo(() => progressFor(stageId, save), [save, stageId]);
  const baseScene = useMemo(() => sceneFor(stageId, save), [save, stageId]);
  const pack = resourcePackById(profile?.resourcePackId);
  const knownPeople = (save?.discoveredContactIds || []).map((id) => careerNpcArcs.find((npc) => npc.id === id)).filter(Boolean);
  const openIssues = (save?.revealedIssueIds || []).filter((id) => !(save?.resolvedIssueIds || []).includes(id));
  const costaRica = (save?.specialCarryovers || []).find((item) => item.sourceId === 'special-01-costa-rica');
  const reusedCostaRicaCheck = (save?.evidenceIds || []).includes('special:costarica:preflight-reused');
  const canReuseCostaRicaCheck = Boolean(
    costaRica?.methodIds?.includes('method-check-before-leave')
    && baseScene?.id === 'stage2-two-hour-kit'
    && !reusedCostaRicaCheck
  );
  const scene = useMemo(() => {
    if (!canReuseCostaRicaCheck) return baseScene;
    return {
      ...baseScene,
      body: [...baseScene.body, '你在 Records 里翻到哥斯达黎加留下的“离场前检查”：当时少拍十分钟，晚上就会直接变成相机求解断裂。这套经验现在可以直接复用，不需要再学一次。'],
      choices: [...baseScene.choices, {
        id: 'story:special:costarica-field-check',
        title: '调用哥斯达黎加的“离场前检查”',
        detail: '不多带一堆设备。把 CR-PHOTOSET-01 当时用过的检查逻辑改成这次的进场清单：对象、条件、缺口、接口、离场前确认。',
        cost: '旧经验复用 · 文档 +1 · 新 Evidence',
        kind: 'build'
      }]
    };
  }, [baseScene, canReuseCostaRicaCheck]);
  const nextStage = stageId === 'stage-1'
    ? { title: '现场：世界会反击', text: 'Stage 2：两小时黑盒、六小时搭建窗口、凌晨后的故障恢复。' }
    : stageId === 'stage-2'
      ? { title: '网络：别人开始因为一件事找你', text: 'Stage 3：第一个小委托、Open Call、一页版本、传播误读和机构回流。' }
      : stageId === 'stage-3'
        ? { title: '方法：你不再每次从零开始', text: 'Stage 4：失败回收、Remix 自己、第一次把方法教给别人。' }
        : stageId === 'stage-4'
          ? { title: '基础设施：你开始维护一套自己的世界', text: 'Stage 5：28㎡ 临时基础设施、协作交接、Career Archive。' }
          : { title: 'Career Archive', text: '五阶段主线已经闭合；新的 Episode 可以继续接在同一条实践历史上。' };

  function choose(choice) {
    const original = save || {};
    if (choice.id === 'story:special:costarica-field-check') {
      const next = {
        ...original,
        evidenceIds: unique([...(original.evidenceIds || []), 'special:costarica:preflight-reused']),
        contextActionIds: unique([...(original.contextActionIds || []), 'action-reuse-costa-rica-field-check']),
        projectMetrics: {
          ...(original.projectMetrics || {}),
          documentation: Math.min(4, Number(original.projectMetrics?.documentation || 0) + 1)
        },
        actionLog: [...(original.actionLog || []), {
          week: original.week,
          type: '旧经验',
          title: '复用哥斯达黎加 / 离场前检查',
          text: '把一次驻地采集里形成的方法改写成当前黑盒测试的进场与离场检查清单。'
        }]
      };
      localStorage.setItem(CAREER_SAVE_KEY, JSON.stringify(next));
      setSave(next);
      setNotice({ title: '旧经验被调用', text: '这次没有重新“解锁技能”。你把已经学会的方法直接带进了另一个项目。' });
      window.setTimeout(() => setNotice(null), 2600);
      return;
    }

    const originalAttention = Number(original.attention || 0);
    const originalCash = Number(original.cash || 0);

    // Attention and cash remain consequences, not hard gates. Existing stage
    // runtimes still use resource checks internally, so decisions run against a
    // permissive projection and then write only the real deltas back.
    const runtimeSave = {
      ...original,
      attention: Math.max(Number(original.attentionMax || 6), 99),
      cash: Math.max(originalCash, 100000)
    };
    const result = runChoice(runtimeSave, choice.id);
    if (result.save === runtimeSave) {
      setNotice(result.notice);
      return;
    }

    const weekAdvanced = Number(result.save.week || 0) > Number(original.week || 0);
    const cashDelta = Number(result.save.cash || 0) - Number(runtimeSave.cash || 0);
    const attentionDelta = Number(result.save.attention || 0) - Number(runtimeSave.attention || 0);
    const next = {
      ...result.save,
      screen: 'play',
      cash: originalCash + cashDelta,
      attention: weekAdvanced
        ? Number(result.save.attention || original.attentionMax || 6)
        : Math.max(0, originalAttention + attentionDelta)
    };

    localStorage.setItem(CAREER_SAVE_KEY, JSON.stringify(next));
    setSave(next);
    setNotice(result.notice);
    window.setTimeout(() => setNotice(null), 2600);
  }

  if (!save) return <main className="vstory-shell"><section className="vstory-missing"><h1>没有找到生涯存档</h1><a href="./?mode=career">建立起步档案</a></section></main>;

  const stageTransition = stageId === 'stage-2' && progress.complete
    ? { id: 'story:stage3:enter', title: '进入第三阶段：网络', detail: '现场档案开始被别人转述。第一个小委托会因为你已经做过的具体事情找上门。', cost: '时间推进 · NETWORK', kind: 'route' }
    : stageId === 'stage-3' && progress.complete
      ? { id: 'story:stage4:enter', title: '进入第四阶段：方法', detail: '先别做新项目。回头拆前三阶段最像废料的失败、错误版本和未被选中的材料。', cost: '时间推进 · METHOD', kind: 'route' }
      : stageId === 'stage-4' && progress.complete
        ? { id: 'story:stage5:enter', title: '进入第五阶段：基础设施', detail: '方法已经能被复用和教给别人。现在看看空间、协作和持续维护是否也能离开你一个人的脑子。', cost: '时间推进 · INFRA', kind: 'route' }
        : null;

  return (
    <main className="vstory-shell">
      <header className="vstory-top">
        <div><small>CAREER {stage.index}/5 · {stage.code}</small><strong>{profile?.title || '起步档案'}</strong><span>{stage.subtitle}</span></div>
        <div className="vstory-stats"><span>第 {save.week} 周</span><span>¥{save.cash}</span></div>
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
            {scene.choices.length > 0 && <div className="vstory-choices">{scene.choices.map((choice) => <button key={choice.id} onClick={() => choose(choice)}><small>{kindLabel[choice.kind]}</small><strong>{choice.title}</strong><p>{choice.detail}</p><span>{consequenceLabel(choice.cost)}</span></button>)}</div>}
            {stageTransition && <div className="vstory-transition"><button onClick={() => choose(stageTransition)}><small>ROUTE</small><strong>{stageTransition.title}</strong><p>{stageTransition.detail}</p><span>{consequenceLabel(stageTransition.cost)}</span></button></div>}
            {scene.optionalWorkbench && <p className="vstory-optional">{scene.optionalWorkbench}</p>}
          </article>
        </section>

        <aside className="vstory-context">
          <section><small>CURRENT PROJECT</small><strong>{save.primaryProject?.name || '还没有项目'}</strong><p>{save.primaryProject?.question || profile?.firstProjectPrompt}</p>{save.primaryProject?.methods?.length > 0 && <div className="vstory-tags">{save.primaryProject.methods.map((method) => <span key={method}>{method}</span>)}</div>}</section>
          <section><small>RESOURCES</small><strong>{pack.title}</strong><div className="vstory-tags">{pack.assets.slice(0, 5).map((asset) => <span key={asset}>{asset}</span>)}</div></section>
          {costaRica && <section className="vstory-special-carryover" aria-label="哥斯达黎加携带记录"><small>SPECIAL CARRYOVER</small><strong>哥斯达黎加</strong><div className="vstory-tags">{(costaRica.assets || []).slice(0, 4).map((asset) => <span key={asset.id}>{asset.id}</span>)}</div><p>{costaRica.methodIds?.length || 0} 个方法 · {costaRica.knowledgeIds?.length || 0} 条知识 · {costaRica.mementos?.length || 0} 件纪念碎片</p>{reusedCostaRicaCheck && <em>“离场前检查”已经在当前生涯里被再次调用。</em>}</section>}
          <section><small>PEOPLE</small><strong>{knownPeople.length ? `${knownPeople.length} 个已进入生涯的人` : '还没有真正认识的人'}</strong>{knownPeople.map((npc) => <p key={npc.id}><b>{npc.name}</b> · {npc.role}</p>)}{Number(save.pendingReplies?.length || 0) > 0 && <em>{save.pendingReplies.length} 条回复还在未来。</em>}</section>
          <section><small>EVIDENCE / THREADS</small><strong>{save.evidenceIds?.length || 0} 条证据</strong><p>未解决问题：{openIssues.length}</p><p>方法：{save.methodIds?.length || 0}</p><p>特殊事件：{save.seenEventIds?.length || 0}</p></section>
          {Array.isArray(save.careerKnownFor) && save.careerKnownFor.length > 0 && <section className="vstory-knownfor"><small>KNOWN FOR</small><strong>别人现在因为什么找你</strong>{save.careerKnownFor.map((item) => <p key={item}>{item}</p>)}</section>}
          {save.careerMethodSet && <section className="vstory-methodset"><small>METHOD SET</small><strong>{save.careerMethodSet.title}</strong>{(save.careerMethodSet.methods || []).map((item) => <p key={item}>{item}</p>)}</section>}
          {save.careerInfrastructure && <section className="vstory-infra"><small>INFRASTRUCTURE</small><strong>{save.careerInfrastructure.purpose || '正在形成'}</strong><p>{save.careerInfrastructure.mode || '未定义模式'} · 维护成本 ¥{save.careerInfrastructure.monthlyCost || 0}</p><p>交接：{(save.careerInfrastructure.handoff || []).join(' / ') || '尚未建立'}</p></section>}
          {save.careerArchive && <section className="vstory-archive-result"><small>CAREER ARCHIVE</small><strong>{save.careerArchive.continuation}</strong><p>{save.careerArchive.evidenceCount} 条 Evidence · {save.careerArchive.categories.methods.length} 条方法 · {save.careerArchive.categories.people.length} 个人物关系</p></section>}
          {progress.complete && <section className="vstory-next"><small>NEXT</small><strong>{nextStage.title}</strong><p>{nextStage.text}</p></section>}
        </aside>
      </div>

      {notice && <div className="vstory-toast"><small>SYSTEM</small><strong>{notice.title}</strong><span>{notice.text}</span></div>}
    </main>
  );
}
