import { test, expect } from '@playwright/test';

async function openWithDiagnostics(page, path) {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  const response = await page.goto(path, { waitUntil: 'networkidle' });
  return {
    status: response?.status(),
    pageErrors,
    body: (await page.locator('body').innerText()).slice(0, 900)
  };
}

test('v0.5 has a real title screen, practice selection and world map', async ({ page }) => {
  await page.goto('/?core=v05');
  await page.evaluate(() => localStorage.removeItem('nmas-v05-world-hub-preview'));
  await page.reload({ waitUntil: 'networkidle' });

  await expect(page.getByText('NEW MEDIA', { exact: false }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'START PRACTICE' })).toBeVisible();
  await page.getByRole('button', { name: 'START PRACTICE' }).click();

  await expect(page.getByText('你从哪里开始工作？')).toBeVisible();
  await page.getByRole('button', { name: /现场 \/ 演出实践/ }).click();

  await expect(page.getByText('WORLD MAP / PRACTICE ECOLOGY')).toBeVisible();
  await expect(page.getByText('CAFÉ', { exact: true })).toBeVisible();
  await expect(page.getByText('WORKBENCH', { exact: true })).toBeVisible();
  await expect(page.getByText('STAGE FORGE', { exact: true })).toBeVisible();

  const noHorizontalPageOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(noHorizontalPageOverflow).toBe(true);
});

test('archive hotkey is global and café keeps actions below central text', async ({ page }) => {
  const diagnostics = await openWithDiagnostics(page, '/?core=v05');
  expect(diagnostics.status).toBe(200);
  expect(diagnostics.pageErrors).toEqual([]);

  if (await page.getByRole('button', { name: 'START PRACTICE' }).isVisible().catch(() => false)) {
    await page.getByRole('button', { name: 'START PRACTICE' }).click();
    await page.getByRole('button', { name: /系统 \/ 生成实践/ }).click();
  } else if (await page.getByRole('button', { name: 'CONTINUE PRACTICE' }).isVisible().catch(() => false)) {
    await page.getByRole('button', { name: 'CONTINUE PRACTICE' }).click();
  }

  await page.keyboard.press('a');
  await expect(page.getByText('这不是背包，是你已经发生过的事。')).toBeVisible();
  await page.keyboard.press('a');
  await expect(page.getByText('这不是背包，是你已经发生过的事。')).toBeHidden();

  await page.getByText('CAFÉ', { exact: true }).click();
  await expect(page.getByText('交叉口咖啡馆', { exact: true })).toBeVisible();
  await expect(page.getByText(/黑盒测试场周四晚上空两个小时/)).toBeVisible();
  await expect(page.getByRole('button', { name: /先判断它是不是值得去/ })).toBeVisible();

  const narrativeAndActionsFit = await page.evaluate(() => {
    const narrative = document.querySelector('.v05-narrative');
    const actions = document.querySelector('.v05-dialogue-actions');
    if (!narrative || !actions) return false;
    const n = narrative.getBoundingClientRect();
    const a = actions.getBoundingClientRect();
    return a.top >= n.top && a.bottom <= document.documentElement.scrollHeight + 1;
  });
  expect(narrativeAndActionsFit).toBe(true);
});

test('world hub persists practice and can enter workbench without whole-page overflow', async ({ page }) => {
  await page.goto('/?core=v05');
  await page.evaluate(() => localStorage.removeItem('nmas-v05-world-hub-preview'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'START PRACTICE' }).click();
  await page.getByRole('button', { name: /空间 \/ 装置实践/ }).click();
  await page.getByText('WORKBENCH', { exact: true }).click();
  await expect(page.getByText('工作台', { exact: true })).toBeVisible();
  await expect(page.getByText('PRIMARY PROJECT')).toBeVisible();
  await expect(page.getByText('PRACTICE BUILD')).toBeVisible();

  const noHorizontalPageOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(noHorizontalPageOverflow).toBe(true);

  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByRole('button', { name: 'CONTINUE PRACTICE' })).toBeVisible();
});
