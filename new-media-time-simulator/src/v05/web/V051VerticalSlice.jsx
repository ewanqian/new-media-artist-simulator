import { useEffect, useMemo, useState } from 'react';
import { applyAction, createRunState, loadRunState, saveRunState, V051_RUN_SAVE_KEY } from '../runState.ts';
import './v051-vertical-slice.css';

const firstDecision = { id: 'broken-page', type: 'decision', text: '你花了三天做一个会跟着鼠标动的网页。刚才把窗口缩小以后，它只剩一块黑屏。不是艺术效果，是真的坏了。七天后你要给别人看它。今晚先做什么？', actions: [
  { id: 'make-it-run', label: '先让它能跑', nextNodeId: 'made-run', result: { summary: '你关掉了最花哨的效果。现在它没那么酷，但至少不会当场去世。', delta: { resources: { cash: -100, energy: -1, reputation: 1 }, addFlags: ['stable-first-version'], addWork: { id: 'work-first', workingTitle: '会动，但还不太好看的网页', projectId: 'project-first', status: 'in-progress', originEventId: 'broken-page', decisionIds: ['make-it-run'] } } } },
  { id: 'find-the-bug', label: '查清楚到底哪里坏了', nextNodeId: 'found-bug', result: { summary: '你找到问题：一段代码只在你自己的屏幕尺寸下成立。它很具体，也很不浪漫。', delta: { resources: { energy: -2 }, addFlags: ['understood-the-bug'], addWork: { id: 'work-first', workingTitle: '会动，但还不太好看的网页', projectId: 'project-first', status: 'draft', originEventId: 'broken-page', decisionIds: ['find-the-bug'] } } } },
  { id: 'keep-a-record', label: '录下这个失败，先留个版本', nextNodeId: 'recorded-failure', result: { summary: '你没有假装一切正常。你录下黑屏、报错和之前能跑的版本；以后它们能帮你解释这件作品怎么长出来。', delta: { resources: { energy: -1 }, addFlags: ['saved-failure'], addWork: { id: 'work-first', workingTitle: '会动，但还不太好看的网页', projectId: 'project-first', status: 'draft', originEventId: 'broken-page', decisionIds: ['keep-a-record'] } } } }
] };

const feedbackDecision = { id: 'share-first-version', type: 'decision', text: '现在你手上有一个版本。你不用莫名其妙发给任何人，但如果想知道它在别人那里会不会成立，可以主动把它交出去。', actions: [
  { id: 'send-to-friend', label: '发给一个朋友看', nextNodeId: 'friend-feedback', result: { summary: '朋友回：我知道它坏了，但我第一次真的想把鼠标移过去看看会发生什么。', delta: { resources: { reputation: 1 }, addFlags: ['friend-feedback'] } } },
  { id: 'post-a-clip', label: '发一段短视频到模拟社交媒体', nextNodeId: 'social-feedback', result: { summary: '有人说“这像我电脑卡死时的内心戏”，也有人问链接。你不确定这是夸奖，但至少有人停下来了。', delta: { resources: { reputation: 2 }, addFlags: ['social-feedback'] } } },
  { id: 'keep-working', label: '先不发，自己再改一晚', nextNodeId: 'private-feedback', result: { summary: '你决定暂时不接受反馈。这个选择没错，只是明天你还得自己判断它到底好不好。', delta: { resources: { energy: -1 }, addFlags: ['kept-private'] } } }
] };

const resultText = {
  'made-run': '第一步完成：它现在能在别人的电脑上打开。',
  'found-bug': '第一步完成：你知道它为什么坏了，下一步才能决定要不要修。',
  'recorded-failure': '第一步完成：你留下了失败的证据，而不是让它像从没发生过一样消失。',
  'friend-feedback': '你得到第一条来自真人的反馈。',
  'social-feedback': '你得到第一批陌生人的反馈。',
  'private-feedback': '你决定先把这件事留在自己的桌面上。'
};

function freshRun() { return createRunState({ runId: crypto.randomUUID?.() || 'run-first', identity: { id: 'artist', label: '一个刚开始做作品的人' }, chapterId: 'first-commission', currentNodeId: 'broken-page', objective: '把桌上这个坏掉的东西，变成一件能给别人看的作品' }); }

export default function V051VerticalSlice() {
  const [run, setRun] = useState(() => loadRunState(localStorage.getItem(V051_RUN_SAVE_KEY), freshRun()));
  useEffect(() => saveRunState(localStorage, run), [run]);
  const phase = run.currentNodeId === 'broken-page' ? 'problem' : run.history.length === 1 ? 'share' : 'complete';
  const work = run.works[0];
  const text = useMemo(() => resultText[run.currentNodeId], [run.currentNodeId]);
  function choose(node, actionId) { setRun((current) => applyAction(current, node, actionId)); }
  function restart() { const next = freshRun(); saveRunState(localStorage, next); setRun(next); }
  return <main className="v051-shell"><header><a href="./">← 返回桌面</a><small>第一周 · 你的桌面</small><button onClick={restart}>重新开始</button></header><section className="v051-layout"><article><p className="v051-kicker">{phase === 'problem' ? '发生了什么' : phase === 'share' ? '下一步可以做什么' : '这件作品已经开始有了自己的生活'}</p><h1>{phase === 'problem' ? '你的作品坏了。' : phase === 'share' ? '现在要不要让别人看？' : '你完成了第一轮。'}</h1><p className="v051-objective">{run.objective}</p>{phase === 'problem' && <><p>{firstDecision.text}</p><div className="v051-actions">{firstDecision.actions.map((action) => <button key={action.id} onClick={() => choose(firstDecision, action.id)}><strong>{action.label}</strong><span>{action.result.summary}</span></button>)}</div></>}{phase === 'share' && <><p>{text}</p><p>{feedbackDecision.text}</p><div className="v051-actions">{feedbackDecision.actions.map((action) => <button key={action.id} onClick={() => choose(feedbackDecision, action.id)}><strong>{action.label}</strong><span>{action.result.summary}</span></button>)}</div></>}{phase === 'complete' && <section className="v051-result"><small>你做了什么</small><strong>{text}</strong><p>这不是结局。下一次你可以根据反馈修改，也可以无视反馈继续做。重要的是：这件作品、你的选择和它留下的后果都已经被保存。</p></section>}</article><aside><section><small>你是谁</small><strong>{run.identity.label}</strong></section><section><small>你现在有多少余地</small><p>钱 ¥{run.resources.cash}：还能买材料或找人帮忙。</p><p>精力 {run.resources.energy}：今晚还能再折腾几次。</p><p>反馈 {run.resources.reputation}：别人愿不愿意停下来看看。</p></section><section><small>第一件作品</small><strong>{work?.workingTitle || '还在坏着'}</strong><p>{work ? '它不是成就图标；它会带着这次选择进入之后的项目。' : '先做一个决定，它才会开始存在。'}</p></section><section><small>你已经做过的事</small>{run.history.length ? run.history.map((item) => <p key={item.id}>{item.summary}</p>) : <p>还没有。黑屏正在等你。</p>}</section></aside></section></main>;
}
