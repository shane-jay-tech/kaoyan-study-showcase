import { expect, test, type Page } from '@playwright/test';

const ROUTES = ['today', 'plan', 'practice', 'review', 'insights', 'case-study'] as const;
const LOCAL_ORIGIN = 'http://127.0.0.1:4174';

function attachRuntimeDiagnostics(page: Page) {
  const externalRequests: string[] = [];
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on('request', request => {
    const url = new URL(request.url());
    if (url.origin !== LOCAL_ORIGIN) externalRequests.push(request.url());
  });
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', error => pageErrors.push(error.message));

  return { externalRequests, consoleErrors, pageErrors };
}

async function expectNoHorizontalOverflow(page: Page) {
  await expect.poll(() => page.evaluate(() => (
    document.documentElement.scrollWidth <= window.innerWidth + 1
  ))).toBe(true);
}

test.describe('public showcase browser contract', () => {
  test('renders every public route in desktop and mobile layouts', async ({ page }) => {
    const diagnostics = attachRuntimeDiagnostics(page);

    for (const route of ROUTES) {
      await page.goto(`#/${route}`, { waitUntil: 'networkidle' });
      await expect(page.locator(`[data-route="${route}"]`)).toBeVisible();
      await expect(page.locator('main')).not.toBeEmpty();
      await expectNoHorizontalOverflow(page);
    }

    expect(diagnostics.externalRequests).toEqual([]);
    expect(diagnostics.consoleErrors).toEqual([]);
    expect(diagnostics.pageErrors).toEqual([]);
  });

  test('keeps the complete demo loop deterministic and resettable', async ({ page }) => {
    const diagnostics = attachRuntimeDiagnostics(page);
    await page.goto('#/today', { waitUntil: 'networkidle' });

    const completionMetric = page.locator('.metric-tile').filter({ hasText: '完成任务' });
    await expect(completionMetric).toContainText('1/6');
    await page.getByRole('button', { name: /完成任务：/ }).first().click();
    await expect(completionMetric).toContainText('2/6');

    await page.getByRole('button', { name: '计划' }).first().click();
    await expect(page).toHaveURL(/#\/plan$/);
    const readingTask = page.locator('.plan-task').filter({ hasText: '研究摘要精读' });
    await readingTask.getByRole('button', { name: '延后' }).click();
    await page.getByRole('button', { name: /时间冲突/ }).click();
    await expect(readingTask).toContainText('延后原因：时间冲突');

    await page.getByRole('button', { name: '练习' }).first().click();
    await expect(page).toHaveURL(/#\/practice$/);
    const wrongAnswers = [0, 0, 1];
    for (const answerIndex of wrongAnswers) {
      await page.getByTestId(`practice-option-${answerIndex}`).locator('..').click();
      await page.getByTestId('practice-submit').click();
      await expect(page.locator('.practice-feedback')).toContainText(/回答正确|再看一遍/);
      await page.getByTestId('practice-next').click();
    }
    await expect(page.getByTestId('practice-result')).toContainText('0 / 3');
    await page.getByTestId('practice-add-review').click();
    await page.getByTestId('practice-view-review').click();
    await expect(page).toHaveURL(/#\/review$/);

    const reviewCard = page.getByTestId('review-item-review-01');
    await reviewCard.getByTestId('review-pass-review-01').click();
    await expect(reviewCard).toContainText('观察中');
    await reviewCard.getByTestId('review-pass-review-01').click();
    await expect(reviewCard).toContainText('已关闭');
    await expect(reviewCard).not.toContainText('复测通过');

    const retryCard = page.getByTestId('review-item-review-02');
    await retryCard.getByTestId('review-fail-review-02').click();
    await expect(retryCard).toContainText('待复测');

    await page.getByRole('button', { name: '重置演示数据' }).first().click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await page.getByRole('button', { name: '确认重置' }).click();
    await expect(page).toHaveURL(/#\/today$/);
    await expect(page.locator('.metric-tile').filter({ hasText: '完成任务' })).toContainText('1/6');
    await expectNoHorizontalOverflow(page);

    expect(diagnostics.externalRequests).toEqual([]);
    expect(diagnostics.consoleErrors).toEqual([]);
    expect(diagnostics.pageErrors).toEqual([]);
  });
});
