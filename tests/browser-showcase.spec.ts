import { expect, test, type Page } from '@playwright/test';

const ROUTES = [
  'today', 'plan', 'study', 'study-professional', 'study-language', 'study-foundation',
  'practice', 'past-exams', 'exam', 'review', 'wrong-questions', 'expression',
  'analytics', 'diagnosis', 'system', 'content-review', 'case-study',
] as const;
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

async function expectRuntimeHealthy(page: Page, diagnostics: ReturnType<typeof attachRuntimeDiagnostics>) {
  await expect(page.locator('main')).not.toBeEmpty();
  await expectNoHorizontalOverflow(page);
  expect(diagnostics.externalRequests).toEqual([]);
  expect(diagnostics.consoleErrors).toEqual([]);
  expect(diagnostics.pageErrors).toEqual([]);
}

test.describe('public showcase browser contract', () => {
  test('renders every source-aligned route in desktop and mobile layouts', async ({ page }) => {
    const diagnostics = attachRuntimeDiagnostics(page);

    for (const route of ROUTES) {
      await page.goto(`#/` + route, { waitUntil: 'networkidle' });
      await expect(page.locator(`[data-route="${route}"]`)).toBeVisible();
      await expectRuntimeHealthy(page, diagnostics);
    }

    if (test.info().project.name === 'desktop') {
      await expect(page.locator('.app-sidebar')).toBeVisible();
      await expect(page.locator('.app-bottomnav')).toBeHidden();
    } else {
      await expect(page.locator('.app-sidebar')).toBeHidden();
      await expect(page.locator('.app-bottomnav')).toBeVisible();
    }
  });

  test('keeps planning, practice, review, and reset loop deterministic', async ({ page }) => {
    const diagnostics = attachRuntimeDiagnostics(page);
    await page.goto('#/today', { waitUntil: 'networkidle' });

    const completionMetric = page.locator('.mirror-kpi').filter({ hasText: '今日任务' });
    await expect(completionMetric).toContainText('1/6');
    await page.getByRole('button', { name: /完成任务：核心概念精读/ }).click();
    await expect(completionMetric).toContainText('2/6');

    if (test.info().project.name === 'desktop') {
      await page.locator('.app-sidebar').getByRole('button', { name: '计划' }).click();
    } else {
      await page.getByRole('button', { name: '打开导航菜单' }).click();
      await page.locator('.mobile-drawer').getByRole('button', { name: '计划' }).click();
    }
    await expect(page).toHaveURL(/#\/plan$/);
    const readingTask = page.locator('.mirror-plan-task').filter({ hasText: '材料结构拆解' });
    await readingTask.getByRole('button', { name: '延后' }).click();
    await readingTask.getByRole('button', { name: /时间冲突/ }).click();
    await expect(readingTask).toContainText('延后原因：时间冲突');

    await page.goto('#/practice', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: '开始练习' }).click();
    const wrongAnswers = [0, 0, 1];
    for (const answerIndex of wrongAnswers) {
      await page.locator('.mirror-answer').nth(answerIndex).click();
      await page.getByRole('button', { name: '提交答案' }).click();
      await expect(page.locator('.mirror-feedback')).toContainText(/回答正确|需要再看一遍/);
      await page.getByRole('button', { name: /下一题|查看本轮结果/ }).click();
    }
    await expect(page.locator('.mirror-result-panel')).toContainText('0 / 3');
    await page.getByRole('button', { name: '加入复习队列' }).click();
    await page.getByRole('button', { name: '查看复习队列' }).click();
    await expect(page).toHaveURL(/#\/review$/);

    const reviewCard = page.getByTestId('review-item-review-01');
    await reviewCard.getByTestId('review-pass-review-01').click();
    await expect(reviewCard).toContainText('观察中');
    await reviewCard.getByTestId('review-pass-review-01').click();
    await expect(page.getByTestId('review-item-review-01')).toContainText('已关闭');
    await expect(page.getByTestId('review-item-review-01')).not.toContainText('复测通过');

    const retryCard = page.getByTestId('review-item-review-02');
    await retryCard.getByTestId('review-fail-review-02').click();
    await expect(retryCard).toContainText('待复测');

    if (test.info().project.name === 'desktop') {
      await page.locator('.app-sidebar').getByRole('button', { name: '重置演示' }).click();
    } else {
      await page.locator('.app-topbar').getByRole('button', { name: '重置演示数据' }).click();
    }
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await page.getByRole('button', { name: '确认重置' }).click();
    await expect(page).toHaveURL(/#\/today$/);
    await expect(page.locator('.mirror-kpi').filter({ hasText: '今日任务' })).toContainText('1/6');
    await expectRuntimeHealthy(page, diagnostics);
  });

  test('covers study, wrong-question, expression, exam, diagnosis, and governance states', async ({ page }) => {
    const diagnostics = attachRuntimeDiagnostics(page);
    await page.goto('#/study-professional', { waitUntil: 'networkidle' });
    const point = page.locator('.mirror-point-row').filter({ hasText: '控制无关因素' });
    await expect(point).toContainText('需复习');
    await point.getByRole('button', { name: '标为已掌握' }).click();
    await expect(point).toContainText('已掌握');

    await page.goto('#/wrong-questions', { waitUntil: 'networkidle' });
    const wrong = page.locator('.mirror-wrong-item').filter({ hasText: '控制条件与结果解释' });
    await wrong.getByRole('button', { name: '记录已复测' }).click();
    await expect(wrong).toContainText('已处理');

    await page.goto('#/expression', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /如何判断一条学习结论/ }).click();
    const editor = page.getByLabel('主观表达重写');
    await editor.fill('主张要对应明确指标，依据要覆盖结论强度，限制要说明样本与设计边界。');
    await page.getByRole('button', { name: '保存并生成示例反馈' }).click();
    await expect(page.locator('.mirror-expression-detail')).toContainText('已重写 2 次');
    await page.getByRole('button', { name: '接受当前版本并结项' }).click();
    await expect(page.locator('.mirror-expression-detail')).toContainText('当前版本已结项');

    await page.goto('#/exam', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: '继续草稿' }).click();
    await expect(page.locator('.mirror-page-header')).toContainText('草稿已恢复');
    await page.getByRole('button', { name: '提交并交卷' }).click();
    await expect(page.locator('.mirror-page-header')).toContainText('交卷完成');
    await page.getByRole('button', { name: '进入补救队列' }).click();
    await expect(page).toHaveURL(/#\/wrong-questions$/);

    await page.goto('#/diagnosis', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /确认并生成建议|回到计划执行/ }).click();
    await expect(page).toHaveURL(/#\/plan$/);
    await page.goto('#/diagnosis', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /确认并生成建议|回到计划执行/ }).click();
    await expect(page).toHaveURL(/#\/plan$/);
    await page.goto('#/diagnosis', { waitUntil: 'networkidle' });
    await expect(page.locator('.mirror-page')).toContainText('第 3 / 3 步');
    await page.goto('#/content-review', { waitUntil: 'networkidle' });
    const frozenContent = page.locator('.mirror-content-item').filter({ hasText: '主张与证据范围' });
    await expect(frozenContent).toContainText('已冻结');
    const content = page.locator('.mirror-content-item').filter({ hasText: '稳定性与有效性' });
    await expect(content).toContainText('草稿');
    await content.getByRole('button', { name: '标为已通过' }).click();
    await expect(content).toContainText('已通过');

    await expectRuntimeHealthy(page, diagnostics);
  });

  test('opens the grouped mobile drawer and keeps touch targets usable', async ({ page }) => {
    test.skip(test.info().project.name !== 'mobile', 'mobile-specific navigation contract');
    const diagnostics = attachRuntimeDiagnostics(page);
    await page.goto('#/today', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: '打开导航菜单' }).click();
    const drawer = page.locator('.mobile-drawer');
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText('专业主线');
    await drawer.getByRole('button', { name: '错题本' }).click();
    await expect(page).toHaveURL(/#\/wrong-questions$/);
    await expectNoHorizontalOverflow(page);
    const smallButtons = await page.locator('button:visible').evaluateAll(buttons => buttons.filter(button => {
      const rect = button.getBoundingClientRect();
      return rect.width < 40 || rect.height < 40;
    }).map(button => button.textContent?.trim() || button.getAttribute('aria-label') || 'icon'));
    expect(smallButtons).toEqual([]);
    expect(diagnostics.externalRequests).toEqual([]);
    expect(diagnostics.consoleErrors).toEqual([]);
    expect(diagnostics.pageErrors).toEqual([]);
  });
});
