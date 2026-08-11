import { test, expect } from '@playwright/test';

async function clear(page) {
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('nmas-v05-') || key.startsWith('nmas-career-intro-seen:')) localStorage.removeItem(key);
    }
  });
}

test('pure story career can finish origin field network and method stages without opening workbench or node editor', async ({ page }) => {
  await page.goto('/?core=v05&mode=career', { waitUntil: 'networkidle' });
  await clear(page);
  await page.reload({ waitUntil: 'networkidle' });

  await page.getByRole('button', { name: /从自己的桌面开始/ }).click();
  await page.getByRole('button', { name: /纯叙事/ }).click();
  await page.getByRole('button', { name: /继续：查看起步档案/ }).click();
  await page.getByRole('button', { name: '进入第一周' }).click();
  await page.waitForURL(/mode=story/);
  await page.getByRole('button', { name: '开始第一周' }).click();

  const scene = page.getByLabel('当前剧情场景');
  await expect(scene.getByRole('heading', { name: '今晚只做一个可以被证明存在的东西。' })).toBeVisible();
  await scene.getByRole('button', { name: /做一个最小反馈系统/ }).click();
  await expect(scene.getByRole('heading', { name: '把它带到一个会改变判断的地方。' })).toBeVisible();
  await scene.getByRole('button', { name: /去基础工作室/ }).click();
  await expect(scene.getByRole('heading', { name: '给一个真正相关的人看，不要给所有人发。' })).toBeVisible();
  await scene.getByRole('button', { name: /发给林/ }).click();
  await expect(scene.getByRole('heading', { name: '你已经把版本发出去了。现在不能用刷新聊天窗口推进项目。' })).toBeVisible();
  await scene.getByRole('button', { name: /结束本周/ }).click();
  await expect(scene.getByRole('heading', { name: '问题已经出现。现在决定“修好”到底是什么意思。' })).toBeVisible();
  await scene.getByRole('button', { name: /沿信号链逐段排查/ }).click();
  await expect(scene.getByRole('heading', { name: '第一次公开不需要成为代表作，但必须是真实的。' })).toBeVisible();
  await scene.getByRole('button', { name: /两小时黑盒：主动收缩成可靠版本/ }).click();

  await expect(scene.getByRole('heading', { name: '第一份生涯档案已经成立。' })).toBeVisible();
  await scene.getByRole('button', { name: /进入第二阶段：现场/ }).click();
  await expect(page.getByText(/CAREER 2\/5/)).toBeVisible();
  await expect(scene.getByRole('heading', { name: '两小时只够验证一个问题。你测什么？' })).toBeVisible();
  await scene.getByRole('button', { name: /验证：系统坏掉以后能不能恢复/ }).click();
  await expect(scene.getByRole('heading', { name: '时间短的时候，“带齐所有东西”也可能是一种失误。' })).toBeVisible();
  await scene.getByRole('button', { name: /只带能验证目标的最小套件/ }).click();
  await expect(scene.getByRole('heading', { name: '灯亮了。现在别把两小时变成一次小型演出。' })).toBeVisible();
  await scene.getByRole('button', { name: /建立基线，然后故意让一条链路失败/ }).click();
  await expect(scene.getByRole('heading', { name: '六小时搭建窗口里，最先堵住的往往不是技术。' })).toBeVisible();
  await scene.getByRole('button', { name: /按接口拆责任/ }).click();
  await expect(scene.getByRole('heading', { name: '“顺便再加一个”' })).toBeVisible();
  await scene.getByRole('button', { name: /写清楚：这次交付不包含它/ }).click();
  await expect(scene.getByRole('heading', { name: '开场前最后四十分钟，你还要不要记录？' })).toBeVisible();
  await scene.getByRole('button', { name: /同时留下：安装 \/ 尺寸 \/ 信号三份最小记录/ }).click();
  await expect(scene.getByRole('heading', { name: 'final_final_v7_REAL' })).toBeVisible();
  await scene.getByRole('button', { name: /回滚到最后一个已知可运行版/ }).click();
  await expect(scene.getByRole('heading', { name: '现在没有“完美修复”，只有你愿意留下哪种后果。' })).toBeVisible();
  await scene.getByRole('button', { name: /沿这两周留下的 Evidence 逐段恢复/ }).click();
  await expect(scene.getByRole('heading', { name: '把“现场经验”变成以后真的会改变选择的东西。' })).toBeVisible();
  await scene.getByRole('button', { name: /完整保留：测试目标 \+ 安装 \+ 故障 \+ 恢复/ }).click();

  await expect(scene.getByRole('heading', { name: '现在你知道“现场经验”不是去过多少场地。' })).toBeVisible();
  await scene.getByRole('button', { name: /进入第三阶段：网络/ }).click();
  await expect(page.getByText(/CAREER 3\/5/)).toBeVisible();
  await expect(scene.getByRole('heading', { name: '第一个小委托来了。先别把“有人找你”误认为“事情已经说清楚”。' })).toBeVisible();
  await scene.getByRole('button', { name: /把需求拆成：内容 \/ 输出 \/ 现场 \/ 记录 \/ 不包含/ }).click();
  await expect(scene.getByRole('heading', { name: '现在决定你真正承诺哪一部分。' })).toBeVisible();
  await scene.getByRole('button', { name: /只交可测试的视觉包与技术说明/ }).click();
  await expect(scene.getByRole('heading', { name: /同一句“顺便再加一个”又回来了，但这次你认识它/ })).toBeVisible();
  await scene.getByRole('button', { name: /直接复用旧的 Scope 边界方法/ }).click();
  await expect(scene.getByRole('heading', { name: '陈发来一份 Open Call。第一页只能先证明一件事。' })).toBeVisible();
  await scene.getByRole('button', { name: /先放真实现场/ }).click();
  await expect(scene.getByRole('heading', { name: '一页版本不是把十页缩成小字。你必须真的删东西。' })).toBeVisible();
  await scene.getByRole('button', { name: /删掉泛泛开场，只留五个具体块/ }).click();
  await expect(scene.getByRole('heading', { name: '现在这页已经能发。提交不是默认正确答案。' })).toBeVisible();
  await scene.getByRole('button', { name: /先问陈：这个空间真正不能改的条件是什么/ }).click();
  await expect(scene.getByRole('heading', { name: '帖子把事情解释歪了' })).toBeVisible();
  await scene.getByRole('button', { name: /只发原始现场证据和项目一页版本/ }).click();
  await expect(scene.getByRole('heading', { name: '愿意邀请，但不完全放心' })).toBeVisible();
  await scene.getByRole('button', { name: /先让对方把限制写清楚/ }).click();

  await expect(scene.getByRole('heading', { name: '你没有得到一个“声望等级”，但世界已经开始用几句话记住你。' })).toBeVisible();
  await expect(page.getByText('别人现在因为什么找你', { exact: true })).toBeVisible();
  await scene.getByRole('button', { name: /进入第四阶段：方法/ }).click();
  await expect(page.getByText(/CAREER 4\/5/)).toBeVisible();

  await expect(scene.getByRole('heading', { name: '失败项目可以拆' })).toBeVisible();
  await scene.getByRole('button', { name: /拆黑盒里的故障与恢复/ }).click();
  await expect(scene.getByRole('heading', { name: /从「黑盒故障与恢复历史」里，你到底要留下什么/ })).toBeVisible();
  await scene.getByRole('button', { name: /提取一条方法/ }).click();

  await expect(scene.getByRole('heading', { name: 'Remix 自己之前，先承认哪些东西已经是你的旧项目。' })).toBeVisible();
  await scene.getByRole('button', { name: /Parent：现场恢复链/ }).click();
  await expect(scene.getByRole('heading', { name: /Parent 是「现场恢复链」。现在只允许改一个核心变量/ })).toBeVisible();
  await scene.getByRole('button', { name: /把原来的“故障条件”反过来当成触发规则/ }).click();
  await expect(scene.getByRole('heading', { name: '新分支不能只存在在“想法上”。把它放进一个不同条件里。' })).toBeVisible();
  await scene.getByRole('button', { name: /用旧 Evidence 回放 parent，再对照 branch/ }).click();

  await expect(scene.getByRole('heading', { name: '第一次教方法时，你会发现自己其实省略了很多步骤。' })).toBeVisible();
  await scene.getByRole('button', { name: /教“先留基线，再练一次恢复”/ }).click();
  await expect(scene.getByRole('heading', { name: '对方照着你的步骤做，还是失败了。问题出在你没写出来的那一层。' })).toBeVisible();
  await scene.getByRole('button', { name: /把环境前提写进方法/ }).click();

  await expect(scene.getByRole('heading', { name: '你第一次拥有的不是“更高等级”，而是一套能被复用、修改、教给别人的方法。' })).toBeVisible();
  await expect(page.getByText('从现场回来以后', { exact: true })).toBeVisible();
  await expect(page.getByText('基础设施：你开始维护一套自己的世界', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: '工作图' })).toHaveCount(0);

  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('nmas-v05-world-hub-preview') || '{}'));
  expect(state.careerStageId).toBe('stage-4');
  expect(state.evidenceIds).toContain('career:stage-1:complete');
  expect(state.evidenceIds).toContain('career:stage-2:complete');
  expect(state.evidenceIds).toContain('career:stage-3:complete');
  expect(state.evidenceIds).toContain('career:stage-4:complete');
  expect(state.seenEventIds).toContain('evt-project-salvage');
  expect(state.careerRemixBranches.length).toBeGreaterThanOrEqual(1);
  expect(state.careerMethodSet.title).toBe('从现场回来以后');
  expect(state.methodIds).toContain('method-document-prerequisites');
  expect(state.fame).toBeUndefined();
  expect(state.reputation).toBeUndefined();
  expect(state.level).toBeUndefined();
  expect(state.skillPoints).toBeUndefined();
});
