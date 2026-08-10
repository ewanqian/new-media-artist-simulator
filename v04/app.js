const $ = (s) => document.querySelector(s);
const icon = (name) => `<svg class="icon"><use href="#i-${name}"/></svg>`;

const state = {
  week: 1,
  dayLabel: '周一 · 09:20',
  attention: 6,
  attentionMax: 6,
  cash: 3200,
  relation: 0,
  signal: 0,
  project: {
    name: '未命名信号装置',
    state: '草图',
    progress: 8,
    medium: '声音 / 网页 / 现场',
    question: '它究竟是在展示信号，还是让人进入信号？',
    debt: [],
    tags: ['signal']
  },
  flags: new Set(),
  archive: [],
  threads: [
    { text: '你有一份没有整理完的现场录音。', tone: '' },
    { text: '月底房租还没解决。', tone: 'hot' }
  ],
  sceneIndex: 0,
  lastSceneId: null,
  history: []
};

const scenes = [
  {
    id: 'raw-signal', type: '项目', source: 'PROJECT NOTE / 01',
    title: '硬盘里还有 47 分钟没有听完的录音。',
    body: '凌晨的电流声、地铁广播和一次演出撤场后的空场。你原本只是想整理素材，但其中一段失真的提示音一直没有被删掉。',
    choices: [
      { label: '把它做成一个能运行的最小原型', hint: '先不解释概念，只让信号可以被触发。', cost: 2, cash: -180, result: '你用一晚做出一个粗糙页面。它只有三个按钮，却第一次像一个作品，而不是资料夹。', progress: 22, flags: ['prototype'], delta: ['项目 +22', '资金 -180'] },
      { label: '发给一个技术朋友，问“这个能不能做？”', hint: '把不确定性变成一次具体沟通。', cost: 1, result: '对方没有评价作品，只回了两句：可以做；但现场声音路由会很麻烦。问题突然变得清楚。', relation: 1, flags: ['tech-contact'], thread: { text: '技术朋友：可以帮你看声音路由，但别拖到布展前一天。', tone: 'good' }, delta: ['关系 +1', '获得技术线索'] },
      { label: '先归档，不制作', hint: '不花注意力，但它会在之后重新回来。', cost: 0, result: '你把片段命名为 SIGNAL_047.wav，没有继续。它没有消失，只是被系统记住。', flags: ['archived-signal'], archive: 'SIGNAL_047.wav / 未处理现场录音', delta: ['进入档案'] }
    ]
  },
  {
    id: 'open-call', type: '邮件', source: 'INBOX / OPEN CALL',
    title: '一个小型媒体艺术空间发来公开征集。截止还有 5 天。',
    body: '主题写得很宽：“介面之后”。申请表需要 300 字项目说明、3 张图和一个预算。你现在只有一个能跑的雏形，或者一堆尚未整理的素材。',
    choices: [
      { label: '用现在的项目直接投', hint: '不为了征集重写作品。', cost: 2, result: '你提交了一个很短的版本：作品不是关于“信号”，而是关于人如何不断确认自己仍在系统里。', flags: ['applied'], signal: 1, progress: 8, delta: ['项目 +8', '可见度 +1'] },
      { label: '为了征集重新包装概念', hint: '文本更完整，但会占掉本周大部分注意力。', cost: 3, result: '申请材料看起来完整了很多，但你发现自己写了太多“界面、感知、边界”。作品本身反而没有前进。', flags: ['overwritten'], progress: 2, delta: ['文本完成', '项目 +2'] },
      { label: '不投，继续把原型做扎实', hint: '放弃一次机会，换取项目内部进展。', cost: 2, result: '你关掉申请页，把触发逻辑重新做了一遍。没有人知道，但作品第一次能连续运行十分钟。', flags: ['stable-prototype'], progress: 18, delta: ['稳定性 +18'] }
    ]
  },
  {
    id: 'groupchat', type: '群聊', source: 'CHAT / 23:48',
    title: '“下周有个活动，缺一个视觉，你来不来？”',
    body: '朋友没有发完整 brief，只说场地有一块横屏，预算不高。它和你的项目没有直接关系，但现场可能给你一晚测试系统。',
    choices: [
      { label: '接，但要求把自己的系统带去试', hint: '把工作机会变成作品测试。', cost: 2, cash: 1200, result: '你没有单独做一套 VJ 素材，而是把项目接进了现场。它并不成熟，但真实观众第一次碰到了它。', relation: 1, progress: 12, flags: ['field-test'], thread: { text: '现场测试留下了新的故障日志和观众反应。', tone: 'good' }, delta: ['资金 +1200', '项目 +12', '关系 +1'] },
      { label: '按普通视觉工作接单', hint: '赚到钱，不动当前项目。', cost: 2, cash: 1600, result: '工作顺利结束。你赚到了一笔现金，但这一周没有再打开自己的项目。', flags: ['commercial-week'], delta: ['资金 +1600'] },
      { label: '拒绝，留出完整的一晚', hint: '没有收入，也没有社交收益。', cost: 0, result: '你拒绝了。那天晚上并没有突然高产，但你终于把项目从“做给别人看”拉回到“自己到底想测试什么”。', flags: ['protected-time'], progress: 6, delta: ['项目 +6'] }
    ]
  },
  {
    id: 'failure', type: '系统', source: 'RUNTIME ERROR / 02:13',
    title: '原型在连续运行 18 分钟后崩了。',
    body: '不是戏剧性的事故：一个监听器不断重复注册，浏览器内存慢慢涨满。你突然意识到，所谓“长期展示”首先是维护问题。',
    choices: [
      { label: '修复它，并写一份故障记录', hint: '把维护变成项目的一部分。', cost: 2, result: '你修掉了问题，同时保留了崩溃前的日志。故障不再只是失败，它开始成为作品的时间结构。', progress: 14, flags: ['failure-log'], archive: 'RUNTIME_18MIN.log / 第一次长期运行故障', delta: ['稳定性 +14', '故障进入档案'] },
      { label: '绕过问题，先保证能演示', hint: '速度快，但留下技术债。', cost: 1, result: '你加了自动刷新。它能继续演示，但你知道这个问题以后还会回来。', progress: 7, debt: '自动刷新掩盖内存泄漏', flags: ['tech-debt'], delta: ['项目 +7', '技术债 +1'] },
      { label: '停止开发，改写成一次现场行为', hint: '不修软件，改变作品的运行方式。', cost: 2, result: '你决定让系统每次崩溃都由现场的人重新启动。维护动作变成了可见事件。项目从工具变成了现场规则。', progress: 16, flags: ['performative-reboot'], delta: ['项目方向改变', '项目 +16'] }
    ]
  },
  {
    id: 'rejection', type: '邮件', source: 'INBOX / RESULT',
    when: s => s.flags.has('applied') || s.flags.has('overwritten'),
    title: '征集结果：未入选。',
    body: '邮件只有四行，没有反馈。你花在申请上的文本、图和预算表还留在桌面上。它们现在既不是作品，也不是废物。',
    choices: [
      { label: '把申请材料改成项目页面', hint: '让一次失败留下可公开的结构。', cost: 1, result: '你删掉策展语言，只留下运行方式、现场需求和三个失败记录。它意外地比申请文本更像作品说明。', signal: 1, flags: ['project-page'], archive: 'PROJECT_PAGE_v1 / 从落选材料重组', delta: ['可见度 +1', '申请材料被复用'] },
      { label: '发给同行，请他只指出看不懂的地方', hint: '不问“好不好”，只测试文本。', cost: 1, result: '对方圈出三句话：“这三句都可以放在任何媒体艺术项目里。”你把它们全删了。', relation: 1, flags: ['text-pruned'], delta: ['关系 +1', '文本去空话'] },
      { label: '归档这次申请，不继续处理', hint: '允许一次失败真的结束。', cost: 0, result: '你把材料放进 2026_OPEN_CALL_FAILED。系统不会因此惩罚你。', archive: '2026_OPEN_CALL_FAILED / 完整申请包', delta: ['进入档案'] }
    ]
  },
  {
    id: 'old-material-return', type: '档案', source: 'ARCHIVE CALLBACK',
    when: s => s.flags.has('archived-signal'),
    title: '三周前归档的 SIGNAL_047.wav 被重新命中。',
    body: '你在整理现场测试时发现，它和现在系统里的一个错误提示频率几乎一样。旧素材第一次不是“灵感”，而是一个可以重新接回来的节点。',
    choices: [
      { label: '把旧录音接进当前系统', hint: '让档案改变现在，而不是只做储存。', cost: 1, result: '旧录音成为系统启动后的第一段声音。项目获得了一个你最初没有设计的时间回路。', progress: 13, flags: ['archive-reused'], delta: ['项目 +13', '档案复用'] },
      { label: '只建立关联，不马上使用', hint: '记录“它们有关”，保留未来可能性。', cost: 0, result: '你没有强行把素材塞进去，只在项目档案中建立了一条关系：SIGNAL_047 ↔ ERROR_TONE。', flags: ['archive-linked'], thread: { text: '档案节点：SIGNAL_047 ↔ ERROR_TONE', tone: '' }, delta: ['建立节点关系'] },
      { label: '保持原样', hint: '不是所有旧东西都必须被重新利用。', cost: 0, result: '你听完一次，关掉文件。它仍然只是档案。', delta: ['无变化'] }
    ]
  },
  {
    id: 'visitor', type: '现场', source: 'STUDIO VISIT / 17:30',
    title: '一个第一次见你作品的人问：“我现在应该做什么？”',
    body: '他站在页面前等了十秒，没有点击。你原本以为极简界面会让人自由，实际却可能只是没有入口。',
    choices: [
      { label: '增加一个明确但不解释的动作提示', hint: '给入口，不给说明书。', cost: 1, result: '首页只多了一句话：“保持按住，直到声音发生变化。”作品立刻有了行为节奏。', progress: 10, flags: ['affordance'], delta: ['交互清晰 +10'] },
      { label: '什么也不加，观察更多人', hint: '先收集行为，不急着修。', cost: 1, result: '接下来五个人里有三个人也停住。你获得了比个人直觉更可靠的证据。', flags: ['observed-friction'], archive: 'OBSERVATION_05 / 首次交互停滞', delta: ['获得观察记录'] },
      { label: '现场告诉他怎么玩', hint: '解决眼前问题，但系统本身不变。', cost: 0, result: '他玩了起来。你也确认了一件事：作品现在依赖作者本人作为说明书。', debt: '交互依赖作者现场解释', flags: ['author-as-manual'], delta: ['交互债 +1'] }
    ]
  },
  {
    id: 'maintenance', type: '项目', source: 'WEEKLY CHECK',
    title: '现在没有新机会。只有项目本身还在这里。',
    body: '没有征集、没有邀约、没有紧急消息。你第一次必须决定：在没有外部刺激的时候，这个东西为什么值得继续。',
    choices: [
      { label: '做一次完整运行测试', hint: '不加功能，只观察它如何持续。', cost: 2, result: '你让它从头跑到尾，记录了七个小问题。没有任何一个足以发朋友圈，但项目变得更可信。', progress: 12, flags: ['maintenance'], delta: ['项目 +12'] },
      { label: '写下项目现在真正的问题', hint: '只允许一句话。', cost: 1, result: '你写：它不是缺功能，它缺一个让观众愿意停留超过一分钟的理由。之后的判断突然简单了。', flags: ['core-question'], thread: { text: '核心问题：怎样让人愿意在系统里多停留一分钟？', tone: 'hot' }, delta: ['获得核心问题'] },
      { label: '暂停项目一周', hint: '把注意力留给生活和工作。', cost: 0, cash: 400, result: '你接了一个小工作，没有推进项目。暂停没有触发惩罚，但时间继续过去。', flags: ['pause'], delta: ['资金 +400'] }
    ]
  }
];

function sceneEligible(scene){ return !scene.when || scene.when(state); }
function nextScene(){
  const available = scenes.filter(sceneEligible);
  if (!available.length) return scenes[0];
  let scene = available[state.sceneIndex % available.length];
  if (scene.id === state.lastSceneId && available.length > 1) scene = available[(state.sceneIndex + 1) % available.length];
  state.sceneIndex++;
  state.lastSceneId = scene.id;
  return scene;
}

function renderStatus(){
  const pips = Array.from({length:state.attentionMax},(_,i)=>`<i class="${i<state.attention?'on':''}"></i>`).join('');
  $('#statusStrip').innerHTML = `
    <div class="status-chip">${icon('clock')} 第 ${state.week} 周</div>
    <div class="status-chip">${icon('eye')} 注意力 <span class="attention-pips">${pips}</span> ${state.attention}/${state.attentionMax}</div>
    <div class="status-chip">${icon('money')} ¥${state.cash}</div>`;
  $('#chapterLabel').textContent = `第 ${state.week} 周 · ${state.dayLabel}`;
}

function renderProject(){
  const p = state.project;
  const debt = p.debt.length ? p.debt[p.debt.length-1] : '无显性技术债';
  $('#projectCard').innerHTML = `
    <div class="project-name">${p.name}</div>
    <div class="project-state">${p.state} · ${Math.min(p.progress,100)}%</div>
    <div class="progress"><i style="width:${Math.min(p.progress,100)}%"></i></div>
    <div class="project-line"><label>媒介</label><span>${p.medium}</span></div>
    <div class="project-line"><label>问题</label><span>${p.question}</span></div>
    <div class="project-line"><label>负担</label><span>${debt}</span></div>`;
}

function renderThreads(){
  $('#threadList').innerHTML = state.threads.slice(-5).map(t=>`<div class="thread ${t.tone||''}">${t.text}</div>`).join('') || '<div class="thread">目前没有持续影响。</div>';
}

function renderArchive(){
  $('#archiveCount').textContent = state.archive.length;
  $('#archiveList').innerHTML = state.archive.slice().reverse().map((a,i)=>`<div class="archive-item"><strong>${String(state.archive.length-i).padStart(2,'0')}</strong> · ${a}</div>`).join('') || '<div class="archive-item">还没有档案。</div>';
}

function addEntry({type,source,title,body,result=false,delta=[]}){
  const el = document.createElement('article');
  el.className = `entry ${result?'result':''} ${type==='系统'?'system':''}`;
  el.innerHTML = `<div class="entry-type">${type}</div><div class="entry-body"><div class="entry-source">${source}</div>${title?`<h2>${title}</h2>`:''}<p>${body}</p>${delta.length?`<div class="delta">${delta.map(d=>`<span class="${d.includes('+')?'plus':d.includes('-')?'minus':''}">${d}</span>`).join('')}</div>`:''}</div>`;
  $('#storyStream').appendChild(el);
  el.scrollIntoView({behavior:'smooth',block:'end'});
}

function showScene(scene){
  addEntry(scene);
  $('#choiceDock').innerHTML = `<div class="choices">${scene.choices.map((c,i)=>{
    const disabled = c.cost > state.attention;
    return `<button class="choice" data-index="${i}" ${disabled?'disabled':''}><span class="choice-key">${i+1}</span><span class="choice-main"><strong>${c.label}</strong><span>${c.hint}</span></span><span class="choice-cost">${icon('eye')} ${c.cost}</span></button>`;
  }).join('')}</div>`;
  [...document.querySelectorAll('.choice')].forEach(btn=>btn.addEventListener('click',()=>choose(scene,scene.choices[Number(btn.dataset.index)])));
}

function choose(scene, choice){
  if (choice.cost > state.attention) return;
  state.attention -= choice.cost || 0;
  state.cash += choice.cash || 0;
  state.relation += choice.relation || 0;
  state.signal += choice.signal || 0;
  state.project.progress = Math.min(100,state.project.progress + (choice.progress||0));
  if (choice.debt) state.project.debt.push(choice.debt);
  (choice.flags||[]).forEach(f=>state.flags.add(f));
  if (choice.archive) state.archive.push(choice.archive);
  if (choice.thread) state.threads.push(choice.thread);
  state.history.push({week:state.week,scene:scene.id,choice:choice.label});
  addEntry({type:'结果',source:`ACTION / WEEK ${state.week}`,body:choice.result,result:true,delta:choice.delta||[]});
  renderAll();
  $('#choiceDock').innerHTML = '';
  window.setTimeout(()=>{
    if(state.attention===0){ addEntry({type:'系统',source:'ATTENTION',body:'本周注意力已经用完。你可以结束本周，让新的消息、旧项目和未解决的问题继续发酵。'}); }
    else showScene(nextScene());
  },180);
}

function endWeek(){
  state.week++;
  state.attention = state.attentionMax;
  state.cash -= 450;
  if(state.cash < 1000) state.threads.push({text:'现金压力开始影响你对机会的判断。',tone:'hot'});
  if(state.project.progress>=70) state.project.state='可展示原型';
  else if(state.project.progress>=35) state.project.state='制作中';
  state.dayLabel = ['周一 · 09:20','周二 · 14:10','周四 · 23:48','周六 · 17:30'][state.week%4];
  addEntry({type:'系统',source:'WEEK TURN',body:`进入第 ${state.week} 周。工作室与生活支出 -450。注意力恢复到 ${state.attentionMax}。没有清空任何历史。`,delta:['注意力恢复','资金 -450']});
  renderAll();
  $('#choiceDock').innerHTML='';
  showScene(nextScene());
}

function renderAll(){renderStatus();renderProject();renderThreads();renderArchive();}

$('#endWeekButton').addEventListener('click',endWeek);
$('#archiveToggle').addEventListener('click',()=>{const el=$('#archiveList');el.hidden=!el.hidden;});
$('#helpButton').addEventListener('click',()=>$('#helpDialog').showModal());
$('#helpClose').addEventListener('click',()=>$('#helpDialog').close());

document.addEventListener('keydown',(e)=>{
  if(e.target.closest('dialog')) return;
  if(['1','2','3'].includes(e.key)) document.querySelector(`.choice[data-index="${Number(e.key)-1}"]`)?.click();
  if(e.key==='Enter') endWeek();
  if(e.key.toLowerCase()==='a') $('#archiveToggle').click();
});

renderAll();
addEntry({type:'系统',source:'BOOT / V0.4',title:'你不再管理物品栏。你管理的是注意力。',body:'每一周只有 6 点注意力。项目、钱、关系和旧档案不会因为进入下一回合而清空。你做过的事会改变以后出现的文本。'});
showScene(nextScene());
