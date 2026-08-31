#!/usr/bin/env node
/**
 * Generate the product case study PDF and representative screenshots.
 *
 * Pipeline (all local, no network):
 *   1. Requires an existing production build (dist/) — fails closed otherwise.
 *   2. Serves dist/ on 127.0.0.1:4180 and captures three screenshots of the
 *      built app with Playwright/Chromium (desktop dashboard, mobile
 *      practice feedback state, review queue).
 *   3. Builds a six-page A4 print template from the shared case-study
 *      content (src/data/case-study-content.json) plus those screenshots,
 *      and renders it to PDF via Chromium's print pipeline (selectable
 *      text, embedded local images, page numbers, visible public URL).
 *   4. Writes:
 *        public/downloads/考研智学系统-产品案例.pdf
 *        public/screenshots/{desktop-dashboard,mobile-practice,review-flow}.png
 *        dist/screenshots/*.png and dist/downloads/*.pdf (same-run copies)
 *        src/data/release-artifacts.json (pdf + screenshots availability)
 *
 * Fails closed: missing build, missing browser, or any render error exits
 * non-zero with a clear message; no private assets are ever substituted.
 */
import { spawn } from 'node:child_process';
import { copyFileSync, cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import caseStudyContent from '../src/data/case-study-content.json' with { type: 'json' };

const PROJECT_ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DIST_DIR = join(PROJECT_ROOT, 'dist');
const PUBLIC_DIR = join(PROJECT_ROOT, 'public');
const SCREENSHOTS_PUBLIC = join(PUBLIC_DIR, 'screenshots');
const DOWNLOADS_PUBLIC = join(PUBLIC_DIR, 'downloads');
const SCREENSHOTS_DIST = join(DIST_DIR, 'screenshots');
const DOWNLOADS_DIST = join(DIST_DIR, 'downloads');
const ARTIFACTS_JSON = join(PROJECT_ROOT, 'src', 'data', 'release-artifacts.json');
const SERVE_SCRIPT = join(PROJECT_ROOT, 'scripts', 'serve.mjs');
const PDF_FILE_NAME = '考研智学系统-产品案例.pdf';
const DIST_PORT = 4180;
const TEMPLATE_PORT = 4181;
// The production bundle uses base "/kaoyan-study-showcase/", so the preview
// server must expose dist under that subpath for assets to resolve.
const SITE_BASE_PATH = '/kaoyan-study-showcase';
const SITE_ORIGIN = `http://127.0.0.1:${DIST_PORT}${SITE_BASE_PATH}`;

function fail(message) {
  console.error(`[generate-case-study] ERROR: ${message}`);
  process.exit(1);
}

async function waitForServer(port, path = '/', timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}${path}`);
      if (response.ok) return;
    } catch {
      // not up yet
    }
    await new Promise(resolveWait => setTimeout(resolveWait, 300));
  }
  fail(`preview server on port ${port} did not become ready`);
}

function startServer(port, dir) {
  const child = spawn(process.execPath, [SERVE_SCRIPT, '--dir', dir, '--port', String(port)], {
    cwd: PROJECT_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', chunk => process.stdout.write(`[serve:${port}] ${chunk}`));
  child.stderr.on('data', chunk => process.stderr.write(`[serve:${port}] ${chunk}`));
  child.on('exit', code => {
    if (code && code !== 0) process.exitCode = 1;
  });
  return child;
}

function updateArtifactsJson(patch) {
  const current = JSON.parse(readFileSync(ARTIFACTS_JSON, 'utf8'));
  const next = { ...current, ...patch };
  writeFileSync(ARTIFACTS_JSON, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
}

async function captureScreenshots(browser) {
  const shots = [];

  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktop.newPage();
  await desktopPage.goto(`${SITE_ORIGIN}/#/today`, { waitUntil: 'networkidle' });
  await desktopPage.locator('.metric-strip').waitFor({ state: 'visible' });
  const desktopShot = join(SCREENSHOTS_PUBLIC, 'desktop-dashboard.png');
  await desktopPage.screenshot({ path: desktopShot, fullPage: true });
  await desktop.close();
  shots.push(desktopShot);
  console.log('[generate-case-study] captured desktop-dashboard.png');

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(`${SITE_ORIGIN}/#/practice`, { waitUntil: 'networkidle' });
  // Native label activation toggles the radio; the marker span inside the
  // label would otherwise intercept a direct click on the input.
  await mobilePage.locator('label.practice-option').nth(1).click();
  await mobilePage.getByTestId('practice-submit').click();
  await mobilePage.locator('.practice-feedback').waitFor({ state: 'visible' });
  const mobileShot = join(SCREENSHOTS_PUBLIC, 'mobile-practice.png');
  await mobilePage.screenshot({ path: mobileShot, fullPage: true });
  await mobile.close();
  shots.push(mobileShot);
  console.log('[generate-case-study] captured mobile-practice.png');

  const review = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const reviewPage = await review.newPage();
  await reviewPage.goto(`${SITE_ORIGIN}/#/review`, { waitUntil: 'networkidle' });
  await reviewPage.waitForTimeout(400);
  const reviewShot = join(SCREENSHOTS_PUBLIC, 'review-flow.png');
  await reviewPage.screenshot({ path: reviewShot, fullPage: true });
  await review.close();
  shots.push(reviewShot);
  console.log('[generate-case-study] captured review-flow.png');

  return shots;
}

function buildPrintTemplate() {
  const screenshots = [
    { name: 'desktop-dashboard.png', alt: '桌面端「今日」视图' },
    { name: 'mobile-practice.png', alt: '移动端「练习」反馈态' },
    { name: 'review-flow.png', alt: '「复习」队列' },
  ];

  const sections = caseStudyContent.sections.map(section => {
    const paragraphs = (section.paragraphs || []).map(p => `<p>${escapeHtml(p)}</p>`).join('');
    const bullets = section.bullets
      ? `<ul>${section.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join('')}</ul>`
      : '';
    let table = '';
    if (section.table) {
      table = `<table>
        <thead><tr>${section.table.columns.map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr></thead>
        <tbody>${section.table.rows.map(row => `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>`;
    }
    const guardrails = section.id === 'ai-map' && section.guardrails
      ? `<ul class="guardrails">${section.guardrails.map(g => `<li>${escapeHtml(g)}</li>`).join('')}</ul>`
      : '';
    const breakClass = section.number === '03' || section.number === '07' ? ' page-break' : '';
    return `
      <section class="page-section${breakClass}">
        <h2><span class="section-no">${escapeHtml(section.number)}</span>${escapeHtml(section.title)}</h2>
        ${paragraphs}
        ${bullets}
        ${table}
        ${guardrails}
      </section>`;
  }).join('');

  const shotFigures = screenshots.map(shot => `
    <figure>
      <img src="${SITE_ORIGIN}/screenshots/${shot.name}" alt="${escapeHtml(shot.alt)}" />
      <figcaption>${escapeHtml(shot.alt)}（虚构数据）</figcaption>
    </figure>`).join('');

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 15mm 13mm 16mm 13mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', 'Microsoft YaHei', 'PingFang SC', 'Noto Sans SC', sans-serif;
    font-size: 11.5px; line-height: 1.7; color: #1b2733;
  }
  h1 { font-size: 18px; margin: 0 0 4px; }
  h2 { font-size: 14px; margin: 0 0 8px; page-break-after: avoid; }
  h2 .section-no {
    display: inline-block; color: #1d4ed8; font-weight: 700; margin-right: 6px;
  }
  p { margin: 0 0 8px; color: #41525f; }
  ul { margin: 4px 0 10px; padding-left: 18px; color: #41525f; }
  li { margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; margin: 8px 0 12px; page-break-inside: auto; }
  th, td { border: 1px solid #dbe2e8; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #eff4ff; font-weight: 600; }
  td:first-child { font-weight: 600; white-space: nowrap; }
  .page-section { page-break-inside: auto; margin-bottom: 14px; }
  .page-break { page-break-before: always; }
  .cover { page-break-after: always; }
  .cover .meta { color: #5b6b78; font-size: 10px; margin-top: 4px; }
  .cover .summary { margin-top: 10px; }
  .cover .url-box {
    margin-top: 14px; padding: 8px 10px; background: #f3f5f7;
    border: 1px solid #dbe2e8; border-radius: 6px; font-size: 10px; color: #1d4ed8;
  }
  .cover .url-box a, .foot-note a { color: #1d4ed8; text-decoration: none; }
  figure { margin: 0 0 10px; page-break-inside: avoid; }
  figure img {
    width: 100%; max-height: 118mm; object-fit: contain;
    border: 1px solid #dbe2e8; border-radius: 6px; background: #ffffff;
  }
  figcaption { font-size: 9px; color: #5b6b78; margin-top: 3px; }
  .page-section { page-break-inside: auto; margin-bottom: 14px; }
  .page-break { page-break-before: always; }
  .guardrails { padding-left: 18px; }
  .foot-note { font-size: 9px; color: #5b6b78; margin-top: 12px; border-top: 1px solid #dbe2e8; padding-top: 6px; }
</style>
</head>
<body>
  <section class="cover">
    <h1>${escapeHtml(caseStudyContent.hero.title)}</h1>
    <p class="meta">${escapeHtml(caseStudyContent.productName)} · 产品案例 · ${escapeHtml(caseStudyContent.publicLabel)}</p>
    <p class="summary">${escapeHtml(caseStudyContent.hero.summary)}</p>
    <div class="url-box">公开地址：<a href="${caseStudyContent.publicUrl}">${caseStudyContent.publicUrl}</a></div>
    ${shotFigures}
  </section>
  ${sections}
  <section class="page-section">
    <h2><span class="section-no">09</span>下载交付物</h2>
    <ul>${caseStudyContent.downloads.notes.map(note => `<li>${escapeHtml(note)}</li>`).join('')}</ul>
    <p class="foot-note">
      在线体验：<a href="${caseStudyContent.publicUrl}">${caseStudyContent.publicUrl}</a> ·
      本 PDF 与配套 ZIP 仅包含本公开项目内容：虚构数据、本站生成截图与通用技术描述。
      不包含任何私有系统数据、真实学校/专业/成绩、联系方式、凭据或绝对路径。
    </p>
  </section>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function main() {
  if (!existsSync(join(DIST_DIR, 'index.html'))) {
    fail(`dist/index.html not found. Run "npm run build" first (fails closed by design).`);
  }

  mkdirSync(SCREENSHOTS_PUBLIC, { recursive: true });
  mkdirSync(DOWNLOADS_PUBLIC, { recursive: true });
  mkdirSync(SCREENSHOTS_DIST, { recursive: true });
  mkdirSync(DOWNLOADS_DIST, { recursive: true });

  // Mount the production dist under /kaoyan-study-showcase/ so the base
  // path in the built bundle resolves; a root index.html copy satisfies
  // the generic server startup check and the SPA fallback.
  const previewRoot = join(tmpdir(), `kaoyan-preview-${Date.now()}`);
  mkdirSync(join(previewRoot, 'kaoyan-study-showcase'), { recursive: true });
  cpSync(DIST_DIR, join(previewRoot, 'kaoyan-study-showcase'), { recursive: true });
  copyFileSync(join(DIST_DIR, 'index.html'), join(previewRoot, 'index.html'));

  const distServer = startServer(DIST_PORT, previewRoot);
  await waitForServer(DIST_PORT, `${SITE_BASE_PATH}/`);

  let browser;
  const tempDir = join(tmpdir(), `kaoyan-case-study-${Date.now()}`);
  let templateServer = null;
  try {
    browser = await chromium.launch();

    const shots = await captureScreenshots(browser);
    // The preview root is a copy of dist taken before capture: copy the new
    // screenshots into BOTH dist and the mounted preview root so the PDF
    // template's <img> URLs resolve (broken images would silently shrink
    // the PDF).
    const previewShotsDir = join(previewRoot, 'kaoyan-study-showcase', 'screenshots');
    mkdirSync(previewShotsDir, { recursive: true });
    for (const shot of shots) {
      copyFileSync(shot, join(SCREENSHOTS_DIST, shot.split(/[\\/]/).pop()));
      copyFileSync(shot, join(previewShotsDir, shot.split(/[\\/]/).pop()));
    }

    // Build and serve the print template from a temp directory. serve.mjs
    // requires an index.html at the served root, so add a placeholder.
    mkdirSync(tempDir, { recursive: true });
    writeFileSync(join(tempDir, 'case-study.html'), buildPrintTemplate(), 'utf8');
    writeFileSync(join(tempDir, 'index.html'), '<!doctype html><html><head><meta charset="utf-8"><title>print template</title></head><body></body></html>', 'utf8');
    templateServer = startServer(TEMPLATE_PORT, tempDir);
    await waitForServer(TEMPLATE_PORT);

    const page = await browser.newPage({ viewport: { width: 1240, height: 1754 } });
    await page.goto(`http://127.0.0.1:${TEMPLATE_PORT}/case-study.html`, { waitUntil: 'networkidle' });
    const pdfPath = join(DOWNLOADS_PUBLIC, PDF_FILE_NAME);
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      margin: { top: '14mm', bottom: '16mm', left: '13mm', right: '13mm' },
      footerTemplate: `
        <div style="width:100%; padding:0 13mm; font-size:8px; color:#5b6b78;
                    font-family:'Segoe UI','Microsoft YaHei',sans-serif;
                    display:flex; justify-content:space-between; align-items:center;">
          <span>${caseStudyContent.publicUrl}</span>
          <span>第 <span class="pageNumber"></span> / <span class="totalPages"></span> 页</span>
        </div>`,
      headerTemplate: '<span></span>',
    });
    await page.close();

    const pdfSize = statSync(pdfPath).size;
    copyFileSync(pdfPath, join(DOWNLOADS_DIST, PDF_FILE_NAME));

    updateArtifactsJson({
      pdf: { fileName: PDF_FILE_NAME, available: true, sizeBytes: pdfSize },
      screenshots: { available: true },
    });

    console.log(`[generate-case-study] OK: ${pdfPath} (${pdfSize} bytes)`);
    console.log(`[generate-case-study] screenshots: ${shots.join(', ')}`);
    console.log(`[generate-case-study] release-artifacts.json updated (pdf + screenshots available)`);
  } catch (error) {
    fail(`${error.message || error}`);
  } finally {
    if (templateServer) templateServer.kill();
    distServer.kill();
    if (browser) await browser.close().catch(() => {});
    rmSync(tempDir, { recursive: true, force: true });
    rmSync(previewRoot, { recursive: true, force: true });
  }
}

main();
