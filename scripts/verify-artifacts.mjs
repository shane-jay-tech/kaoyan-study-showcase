#!/usr/bin/env node
/**
 * Verify generated release artifacts before delivery:
 *   PDF  — exists, page count in range, selectable text, links contain the
 *          public URL, size sanity; renders pages to PNG evidence.
 *   ZIP  — archive integrity, required layout entries, SHA-256 manifest
 *          matches recomputed hashes, extracted package starts with the
 *          Node launcher and serves the app plus the PDF.
 *   Site — dist/downloads contains the same artifacts (post-final-build
 *          readiness for the public download links).
 *
 * Every check reports PASS / FAIL / SKIP honestly; any FAIL exits 1.
 */
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const HELPER = join(PROJECT_ROOT, 'scripts', 'release-helper.py');
const DIST_DIR = join(PROJECT_ROOT, 'dist');
const DOWNLOADS_PUBLIC = join(PROJECT_ROOT, 'public', 'downloads');
const PDF_FILE_NAME = '考研智学系统-产品案例.pdf';
const ZIP_FILE_NAME = '考研智学系统-交互演示包.zip';
const PUBLIC_HOST = 'shane-jay-tech.github.io';
const SMOKE_PORT = 4182;

let failed = false;

function check(name, ok, detail) {
  const status = ok ? 'PASS' : 'FAIL';
  if (!ok) failed = true;
  console.log(`[${status}] ${name} — ${detail}`);
}

function runPython(args) {
  const candidates = process.platform === 'win32' ? ['python', 'python3'] : ['python3', 'python'];
  for (const executable of candidates) {
    const result = spawnSync(executable, args, { cwd: PROJECT_ROOT, encoding: 'utf8' });
    if (result.error) continue;
    if (result.status !== 0) {
      const stub = (result.stderr || result.stdout || '').includes('Python was not found');
      if (stub) continue; // Microsoft Store alias stub — try the next candidate.
      return { ok: false, stdout: result.stdout || '', stderr: result.stderr || '', error: `exit ${result.status}` };
    }
    return { ok: true, stdout: result.stdout || '', stderr: result.stderr || '' };
  }
  return { ok: false, stdout: '', stderr: '', error: 'python not found on PATH' };
}

function sha256File(filePath) {
  const hash = createHash('sha256');
  hash.update(readFileSync(filePath));
  return hash.digest('hex');
}

function walkFiles(root) {
  const files = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const full = join(root, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(full));
    else files.push(full);
  }
  return files;
}

async function waitForServer(port, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`);
      if (response.ok) return;
    } catch {
      // not up yet
    }
    await new Promise(resolveWait => setTimeout(resolveWait, 250));
  }
  throw new Error(`server on port ${port} did not become ready`);
}

async function verifyPdf(pdfPath) {
  if (!existsSync(pdfPath)) {
    check('PDF exists', false, `missing ${pdfPath}`);
    return;
  }
  check('PDF exists', true, pdfPath);

  const info = runPython([HELPER, 'pdf-info', pdfPath]);
  if (!info.ok) {
    check('PDF info (PyMuPDF)', false, info.error);
    return;
  }
  const parsed = JSON.parse(info.stdout);
  check('PDF page count (target ~6, range 4-9)', parsed.pages >= 4 && parsed.pages <= 9, `${parsed.pages} pages`);
  check('PDF selectable text', parsed.textChars > 500, `${parsed.textChars} chars extracted`);
  const urlLinked = parsed.links.some(link => link.includes(PUBLIC_HOST));
  check('PDF contains public URL link', urlLinked, `${parsed.links.length} link(s) found`);
  check('PDF size sanity', parsed.sizeBytes > 50000, `${parsed.sizeBytes} bytes`);

  const renderOut = mkdtempSync(join(tmpdir(), 'kaoyan-pdf-pages-'));
  const render = runPython([HELPER, 'pdf-render', pdfPath, renderOut]);
  if (render.ok) {
    const pages = walkFiles(renderOut).sort();
    console.log(`[INFO] PDF page renders (evidence): ${pages.map(p => relative(PROJECT_ROOT, p)).join(', ')}`);
  } else {
    check('PDF render evidence', false, render.error);
  }
}

async function verifyZip(zipPath) {
  if (!existsSync(zipPath)) {
    check('ZIP exists', false, `missing ${zipPath}`);
    return;
  }
  check('ZIP exists', true, zipPath);

  const integrity = runPython([HELPER, 'zip-test', zipPath]);
  check('ZIP archive integrity', integrity.ok, integrity.ok ? 'testzip OK' : integrity.stderr || integrity.error);

  const listing = runPython([HELPER, 'zip-list', zipPath]);
  if (!listing.ok) {
    check('ZIP listing', false, listing.error);
    return;
  }
  const entries = listing.stdout.trim().split('\n').map(line => JSON.parse(line));
  const names = new Set(entries.map(entry => entry.name));
  const required = [
    'app/index.html',
    'serve.mjs',
    'start-windows.bat',
    '使用说明.md',
    '考研智学系统-产品案例.pdf',
    'SHA256SUMS.txt',
  ];
  const missing = required.filter(name => !names.has(name));
  check('ZIP required layout entries', missing.length === 0, missing.length === 0 ? required.join(', ') : `missing: ${missing.join(', ')}`);
  const jsAssets = [...names].filter(name => name.startsWith('app/assets/') && name.endsWith('.js'));
  check('ZIP offline app bundle', jsAssets.length >= 1, `${jsAssets.length} JS asset(s)`);
  const shotCount = [...names].filter(name => name.startsWith('screenshots/') && name.endsWith('.png')).length;
  check('ZIP screenshots', shotCount >= 1, `${shotCount} screenshot(s)`);

  // Manifest hash comparison + extracted-package smoke.
  const temp = mkdtempSync(join(tmpdir(), 'kaoyan-verify-'));
  const extracted = join(temp, 'pkg');
  try {
    const extract = runPython([HELPER, 'zip-extract', zipPath, extracted]);
    if (!extract.ok) {
      check('ZIP extract', false, extract.error);
      return;
    }
    check('ZIP extract', true, extracted);

    const manifestPath = join(extracted, 'SHA256SUMS.txt');
    if (!existsSync(manifestPath)) {
      check('SHA-256 manifest present', false, 'SHA256SUMS.txt missing inside ZIP');
      return;
    }
    const manifestLines = readFileSync(manifestPath, 'utf8').trim().split('\n').filter(Boolean);
    let manifestOk = manifestLines.length > 0;
    const mismatches = [];
    for (const line of manifestLines) {
      const [expected, ...rest] = line.split('  ');
      const relName = rest.join('  ');
      const actual = sha256File(join(extracted, relName));
      if (actual !== expected) mismatches.push(relName);
    }
    if (mismatches.length > 0) manifestOk = false;
    check('SHA-256 manifest matches', manifestOk, manifestOk ? `${manifestLines.length} entries verified` : `mismatch: ${mismatches.join(', ')}`);

    // Start the extracted package with its own launcher entry point.
    const server = spawn(process.execPath, ['serve.mjs', '--port', String(SMOKE_PORT)], { cwd: extracted, stdio: 'ignore' });
    try {
      await waitForServer(SMOKE_PORT);
      const rootResponse = await fetch(`http://127.0.0.1:${SMOKE_PORT}/`);
      const rootHtml = await rootResponse.text();
      check('Extracted package serves app root', rootResponse.ok && rootHtml.includes('<div id="root">'), `HTTP ${rootResponse.status}`);
      const pdfUrl = `http://127.0.0.1:${SMOKE_PORT}/downloads/${encodeURIComponent(PDF_FILE_NAME)}`;
      const pdfResponse = await fetch(pdfUrl);
      check('Extracted package serves PDF', pdfResponse.ok, `HTTP ${pdfResponse.status}`);
      const zipEntryState = [...names].filter(name => name.includes('交互演示包')).length;
      check('Offline package does not contain itself', zipEntryState === 0, 'no self-copy in the package');
    } finally {
      server.kill();
      await new Promise(resolveExit => server.once('exit', resolveExit));
    }
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

async function verifySiteCopy() {
  const distDownloads = join(DIST_DIR, 'downloads');
  if (!existsSync(distDownloads)) {
    check('Site dist/downloads present', false, 'run "npm run build" after packaging so public/downloads lands in dist');
    return;
  }
  const pdfInDist = existsSync(join(distDownloads, PDF_FILE_NAME));
  const zipInDist = existsSync(join(distDownloads, ZIP_FILE_NAME));
  const manifestInDist = existsSync(join(distDownloads, 'release-manifest.json'));
  check('Site dist/downloads contains PDF', pdfInDist, pdfInDist ? PDF_FILE_NAME : 'missing');
  check('Site dist/downloads contains ZIP', zipInDist, zipInDist ? ZIP_FILE_NAME : 'missing');
  check('Site dist/downloads contains release manifest', manifestInDist, manifestInDist ? 'release-manifest.json' : 'missing');

  const manifestPath = join(DOWNLOADS_PUBLIC, 'release-manifest.json');
  if (!existsSync(manifestPath)) {
    check('Site release manifest readable', false, 'release-manifest.json missing in public/downloads');
    return;
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const pdfPath = join(DOWNLOADS_PUBLIC, PDF_FILE_NAME);
  const zipPath = join(DOWNLOADS_PUBLIC, ZIP_FILE_NAME);
  const pdfOk = manifest.pdf.sha256 === sha256File(pdfPath);
  const zipOk = manifest.zip.sha256 === sha256File(zipPath);
  check('Site manifest PDF hash matches', pdfOk, pdfOk ? manifest.pdf.sha256 : 'mismatch');
  check('Site manifest ZIP hash matches', zipOk, zipOk ? manifest.zip.sha256 : 'mismatch');
  console.log(`[INFO] buildId: ${manifest.buildId} · generatedAt: ${manifest.generatedAt}`);
}

async function main() {
  console.log('=== Artifact verification ===\n');
  await verifyPdf(join(DOWNLOADS_PUBLIC, PDF_FILE_NAME));
  await verifyZip(join(DOWNLOADS_PUBLIC, ZIP_FILE_NAME));
  await verifySiteCopy();

  console.log(`\n=== Result: ${failed ? 'FAILED' : 'ALL CHECKS PASSED'} ===`);
  if (failed) process.exitCode = 1;
}

main().catch(error => {
  console.error(`[verify-artifacts] ERROR: ${error.message}`);
  process.exitCode = 1;
});
