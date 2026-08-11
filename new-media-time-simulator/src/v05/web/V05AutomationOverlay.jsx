import { useEffect, useMemo, useRef, useState } from 'react';
import './v05-automation.css';

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

function visibleButtons(selector = 'button') {
  return [...document.querySelectorAll(selector)].filter((node) => {
    const style = window.getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0 && !node.disabled;
  });
}

function clickText(selector, text) {
  const button = visibleButtons(selector).find((node) => node.textContent?.replace(/\s+/g, ' ').includes(text));
  if (!button) throw new Error(`找不到可执行项：${text}`);
  button.click();
  return button;
}

const flows = [
  {
    id: 'peer-critique',
    title: '让同行看一下当前版本',
    note: '自动进入人物上下文，把当前版本发给林，然后回到 Records 留下等待状态。',
    requires: (save) => !save?.primaryProject ? '还没有当前项目' : !(save?.discoveredContactIds || []).includes('contact-lin') ? '还没有认识同行林' : Number(save?.attention || 0) < 1 ? '注意力不足' : null,
    steps: [
      { id: 'field', label: '切换到 FIELD / 场域', virtual: '00:10', run: () => clickText('.tri-primary-nav button', '场域') },
      { id: 'people', label: '进入 PEOPLE / 人物', virtual: '00:10', run: () => clickText('.tri-subnav button', '人物') },
      { id: 'lin', label: '聚焦同行艺术家：林', virtual: '00:20', run: () => clickText('.tri-person-chip', '林') },
      { id: 'send', label: '发送：看一个当前版本', virtual: '00:30', run: () => clickText('.tri-contact-actions button', '看一个当前版本') },
      { id: 'collect', label: '收集当前项目 / 人物 / 历史 Note', virtual: '03:00', wait: 850 },
      { id: 'records', label: '切换到 RECORDS / 记录', virtual: '00:10', run: () => clickText('.tri-primary-nav button', '记录') },
      { id: 'archive', label: '打开 ARCHIVE / 档案', virtual: '00:10', run: () => clickText('.tri-subnav button', '档案') }
    ]
  },
  {
    id: 'field-test',
    title: '准备一次黑盒现场测试',
    note: '自动进入黑盒，把工作台切到现场相关动作并执行一次场地预演；不会自动花钱或替你做公开承诺。',
    requires: (save) => !save?.primaryProject ? '还没有当前项目' : Number(save?.attention || 0) < 2 ? '至少需要 2 注意力' : null,
    steps: [
      { id: 'field', label: '切换到 FIELD / 场域', virtual: '00:10', run: () => clickText('.tri-primary-nav button', '场域') },
      { id: 'place', label: '进入 PLACE / 空间', virtual: '00:10', run: () => clickText('.tri-subnav button', '空间') },
      { id: 'blackbox', label: '选择：黑盒 / 演出空间', virtual: '00:20', run: () => clickText('.tri-instance-list button', '黑盒 / 演出空间') },
      { id: 'enter', label: '进入环境', virtual: '00:15', run: () => clickText('.vx-sheet-action', '进入环境') },
      { id: 'work', label: '确认 WORKBENCH / 工作', virtual: '00:15', run: () => clickText('.tri-subnav button', '工作') },
      { id: 'preview', label: '执行：场地预演', virtual: '04:00', run: () => clickText('.tri-action-grid button', '场地预演') },
      { id: 'records', label: '把结果送回 RECORDS', virtual: '00:15', run: () => clickText('.tri-primary-nav button', '记录') },
      { id: 'archive', label: '打开档案，检查新 Evidence', virtual: '00:15', run: () => clickText('.tri-subnav button', '档案') }
    ]
  },
  {
    id: 'archive-sweep',
    title: '自动巡检本周记录',
    note: '快速扫过六类 Archive 入口，模拟一次“挂机整理”；只阅读和导航，不消耗现金与注意力。',
    requires: () => null,
    steps: [
      { id: 'records', label: '切换到 RECORDS / 记录', virtual: '00:10', run: () => clickText('.tri-primary-nav button', '记录') },
      { id: 'archive', label: '进入 ARCHIVE / 档案', virtual: '00:10', run: () => clickText('.tri-subnav button', '档案') },
      { id: 'people', label: '巡检：人物', virtual: '00:30', run: () => clickText('.tri-archive-categories button', '人物') },
      { id: 'places', label: '巡检：场域', virtual: '00:30', run: () => clickText('.tri-archive-categories button', '场域') },
      { id: 'projects', label: '巡检：项目', virtual: '00:30', run: () => clickText('.tri-archive-categories button', '项目') },
      { id: 'methods', label: '巡检：方法', virtual: '00:30', run: () => clickText('.tri-archive-categories button', '方法') },
      { id: 'media', label: '巡检：媒介', virtual: '00:30', run: () => clickText('.tri-archive-categories button', '媒介') },
      { id: 'ecology', label: '巡检：生态', virtual: '00:30', run: () => clickText('.tri-archive-categories button', '生态') }
    ]
  }
];

export default function V05AutomationOverlay({ save }) {
  const [open, setOpen] = useState(false);
  const [flowId, setFlowId] = useState(null);
  const [stepIndex, setStepIndex] = useState(-1);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('你想让系统替你处理哪一段重复操作？');
  const cancelled = useRef(false);
  const paused = useRef(false);
  const flow = useMemo(() => flows.find((item) => item.id === flowId), [flowId]);
  const progress = flow ? Math.max(0, Math.min(100, Math.round(((stepIndex + (status === 'done' ? 1 : 0)) / flow.steps.length) * 100))) : 0;

  useEffect(() => () => { cancelled.current = true; }, []);

  async function runFlow(selected) {
    const requirement = selected.requires(save || {});
    if (requirement) { setMessage(`现在不能执行：${requirement}。`); return; }
    cancelled.current = false;
    paused.current = false;
    setFlowId(selected.id);
    setStatus('running');
    setMessage('AUTO RUN 已接管低风险导航与重复操作。');
    for (let index = 0; index < selected.steps.length; index += 1) {
      if (cancelled.current) return;
      while (paused.current && !cancelled.current) await wait(120);
      if (cancelled.current) return;
      setStepIndex(index);
      const step = selected.steps[index];
      setMessage(step.label);
      try {
        if (step.run) step.run();
        await wait(step.wait || 430);
      } catch (error) {
        setStatus('blocked');
        setMessage(`${error.message}。AUTO RUN 已暂停，交还给你处理。`);
        return;
      }
    }
    setStepIndex(selected.steps.length);
    setStatus('done');
    setMessage('这段自动流程完成。不可逆选择、现金支出和承诺仍然留给你。');
  }

  function togglePause() {
    if (status !== 'running' && status !== 'paused') return;
    paused.current = !paused.current;
    setStatus(paused.current ? 'paused' : 'running');
    setMessage(paused.current ? 'AUTO RUN 已暂停。你可以直接接管当前页面。' : '继续执行剩余步骤。');
  }

  function stop() {
    cancelled.current = true;
    paused.current = false;
    setStatus('idle');
    setFlowId(null);
    setStepIndex(-1);
    setMessage('流程已停止。当前页面和已经发生的操作会保留。');
  }

  function close() {
    if (status === 'running') {
      paused.current = true;
      setStatus('paused');
    }
    setOpen(false);
  }

  return <>
    <button className="vauto-launch" onClick={() => setOpen(true)} aria-label="打开自动化操作"><small>AUTO</small><strong>自动化</strong></button>
    {open && <div className="vauto-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close()}>
      <aside className="vauto-panel" role="dialog" aria-modal="true" aria-label="自动化操作">
        <header><div><small>AUTO RUN / LOW RISK</small><h2>自动化操作</h2></div><button onClick={close} aria-label="关闭自动化">×</button></header>
        <div className="vauto-chat">
          <div className="vauto-system"><small>SYSTEM</small><p>{message}</p></div>
          {!flow && <div className="vauto-options">{flows.map((item) => { const locked = item.requires(save || {}); return <button key={item.id} disabled={Boolean(locked)} onClick={() => runFlow(item)}><strong>{item.title}</strong><p>{item.note}</p><span>{locked ? `当前不可用 · ${locked}` : `${item.steps.length} 步 · 可随时接管`}</span></button>; })}</div>}
          {flow && <>
            <section className="vauto-current"><small>CURRENT FLOW</small><h3>{flow.title}</h3><p>{flow.note}</p></section>
            <div className="vauto-progress"><div><span>进度</span><b>{progress}%</b></div><i><em style={{ width: `${progress}%` }}/></i></div>
            <ol className="vauto-steps">{flow.steps.map((step, index) => <li key={step.id} className={index < stepIndex || status === 'done' ? 'done' : index === stepIndex ? 'active' : ''}><i>{index < stepIndex || status === 'done' ? '✓' : String(index + 1).padStart(2, '0')}</i><span><b>{step.label}</b><small>{step.virtual}</small></span></li>)}</ol>
          </>}
        </div>
        <footer>
          <span>自动化只替你处理导航、读取和已授权的低风险动作；遇到花钱、Scope、公开承诺等分支会停。</span>
          <div>{flow && <button onClick={togglePause}>{status === 'paused' ? '继续' : '暂停 / 接管'}</button>}{flow && <button onClick={stop}>停止</button>}{(status === 'done' || status === 'blocked') && <button className="primary" onClick={() => { setFlowId(null); setStepIndex(-1); setStatus('idle'); setMessage('还要自动处理哪一段？'); }}>再选一个</button>}</div>
        </footer>
      </aside>
    </div>}
  </>;
}
