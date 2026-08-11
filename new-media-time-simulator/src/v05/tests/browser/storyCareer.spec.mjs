import { test, expect } from '@playwright/test';

async function clear(page) {
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('nmas-v05-') || key.startsWith('nmas-career-intro-seen:')) localStorage.removeItem(key);
    }
  });
}

test('pure story career can finish origin and field stages without opening workbench or node editor', async ({ page }) => {
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
  await expect(page.getByText('现场：世界会反击', { exact: true })).toBeVisible();
  await scene.getByRole('button', { name: /进入第二阶段：现场/ }).click();

  await expect(scene.getByRole('heading', { name: '两小时只够验证一个问题。你测什么？' })).toBeVisible();
  await expect(page.getByText(/CAREER 2\/5/)).toBeVisible();
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
  await expect(page.getByText('网络：别人开始因为一件事找你', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: '工作图' })).toHaveCount(0);

  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('nmas-v05-world-hub-preview') || '{}'));
  expect(state.careerStageId).toBe('stage-2');
  expect(state.week).toBe(5);
  expect(state.receivedFeedbackCount).toBe(1);
  expect(state.publicOutputCount).toBe(1);
  expect(state.evidenceIds).toContain('career:stage-1:complete');
  expect(state.evidenceIds).toContain('career:stage-2:complete');
  expect(state.seenEventIds).toContain('evt-two-hour-gap');
  expect(state.seenEventIds).toContain('evt-scope-plus-one');
  expect(state.seenEventIds).toContain('evt-final-final-v7');
  expect(state.methodIds).toContain('method-evidence-led-recovery');
});
