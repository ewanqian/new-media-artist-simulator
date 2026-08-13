import { useEffect, useMemo, useState } from 'react';
import { applyAction, createRunState, loadRunState, saveRunState, V051_RUN_SAVE_KEY } from '../runState.ts';
import './v051-vertical-slice.css';

const nodes = { brief: { id: 'brief', type: 'decision', text: '周二晚上，陈乔发来一个小委托：七天后在一个临时展厅做一件会响应观众移动的影像。预算 ¥8,000。你需要决定第一版怎么做。', actions: [
  { id: 'fast-version', label: '先做一个可靠的版本', nextNodeId: 'result-fast', result: { summary: '你用更小的范围换来一个可以稳定运行的原型。', delta: { resources: { cash: -600, energy: -1, reputation: 1 }, addFlags: ['scope-small'], addWork: { id: 'work-first', workingTitle: '未完成系统', projectId: 'project-first', status: 'in-progress', originEventId: 'brief', decisionIds: ['fast-version'] } } } },
  { id: 'experimental-version', label: '坚持实验：先测试陌生输入', nextNodeId: 'result-experimental', result: { summary: '你保住了实验问题，但第一版还不稳定。', delta: { resources: { cash: -300, energy: -2 }, addFlags: ['scope-experimental'], addWork: { id: 'work-first', workingTitle: '未完成系统', projectId: 'project-first', status: 'draft', originEventId: 'brief', decisionIds: ['experimental-version'] } } } },
  { id: 'ask-collaborator', label: '找一位合作伙伴', nextNodeId: 'result-collaborator', result: { summary: '你获得了技术支持，也欠下了一次协作承诺。', delta: { resources: { cash: -900, energy: -1, reputation: 2 }, addFlags: ['asked-collaborator'], addWork: { id: 'work-first', workingTitle: '未完成系统', projectId: 'project-first', status: 'in-progress', originEventId: 'brief', decisionIds: ['ask-collaborator'] } } } }
] } };
const resultText = { 'result-fast': '测试通过。投影比你想象得暗，但交互逻辑能被观众理解。陈乔回复：可以继续，把现场尺寸写进下一版。', 'result-experimental': '测试没有完全成功。陌生输入让画面出现了意外的断裂，但也让作品第一次有了自己的问题。陈乔回复：先给我看一个能解释的版本。', 'result-collaborator': '测试通过。合作伙伴补上了信号链，你们也约定下一次由你来解决展厅的安装细节。陈乔回复：这版可以继续。' };
function freshRun() { return createRunState({ runId: crypto.randomUUID?.() || 'run-first', identity: { id: 'new-media-artist', label: '刚开始独立工作的艺术家' }, chapterId: 'first-commission', currentNodeId: 'brief', objective: '在七天内完成第一件可展示的作品' }); }

export default function V051VerticalSlice() {
  const [run, setRun] = useState(() => loadRunState(localStorage.getItem(V051_RUN_SAVE_KEY), freshRun()));
  useEffect(() => saveRunState(localStorage, run), [run]);
  const isBrief = run.currentNodeId === 'brief';
  const result = useMemo(() => resultText[run.currentNodeId], [run.currentNodeId]);
  function choose(actionId) { setRun((current) => applyAction(current, nodes.brief, actionId)); }
  function restart() { const next = freshRun(); saveRunState(localStorage, next); setRun(next); }
  const work = run.works[0];
  return <main className="v051-shell"><header><a href="./">← 返回桌面</a><small>WEEK 01 · FIRST COMMISSION</small><button onClick={restart}>重新开始</button></header><section className="v051-layout"><article><p className="v051-kicker">现在要做什么</p><h1>{isBrief ? '一个真实委托来了。' : '第一版已经有了结果。'}</h1><p className="v051-objective">{run.objective}</p>{isBrief ? <><p>{nodes.brief.text}</p><div className="v051-actions">{nodes.brief.actions.map((action) => <button key={action.id} onClick={() => choose(action.id)}><strong>{action.label}</strong><span>{action.result.summary}</span></button>)}</div></> : <><p>{result}</p><section className="v051-result"><small>RESULT</small><strong>{run.history[0]?.summary}</strong><p>下一步：根据这次测试继续制作；作品与这次决定已经写入生涯记录。</p></section></>}</article><aside><section><small>你是谁</small><strong>{run.identity.label}</strong></section><section><small>资源</small><p>现金 ¥{run.resources.cash}</p><p>精力 {run.resources.energy}</p><p>信誉 {run.resources.reputation}</p></section><section><small>第一件作品</small><strong>{work?.workingTitle || '尚未开始'}</strong><p>{work ? work.status + ' · 由这次委托与决定形成' : '做出决定后，它会成为生涯的一部分。'}</p></section><section><small>History</small>{run.history.length ? run.history.map((item) => <p key={item.id}>{item.summary}</p>) : <p>还没有行动记录。</p>}</section></aside></section></main>;
}