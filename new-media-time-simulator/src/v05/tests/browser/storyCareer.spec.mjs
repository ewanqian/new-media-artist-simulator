import { test, expect } from '@playwright/test';

async function clear(page) {
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('nmas-v05-') || key.startsWith('nmas-career-intro-seen:')) localStorage.removeItem(key);
    }
  });
}

test('pure story career can finish stage one without opening workbench or node editor', async ({ page }) => {
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
  await expect(page.getByRole('link', { name: '工作图' })).toHaveCount(0);

  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('nmas-v05-world-hub-preview') || '{}'));
  expect(state.week).toBe(2);
  expect(state.receivedFeedbackCount).toBe(1);
  expect(state.publicOutputCount).toBe(1);
  expect(state.evidenceIds).toContain('career:stage-1:complete');
  expect(state.methodIds).toContain('method-diagnose-from-evidence');
});
