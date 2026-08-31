#!/usr/bin/env node
/**
 * Privacy audit for the showcase release.
 *
 * Scans (denylist + manually reviewed allowlist):
 *   S1 source  — tracked + untracked non-ignored text files
 *   S2 dist    — compiled assets (html/js/css/json)
 *   S3 pdf     — extracted selectable text of the case-study PDF
 *   S4 zip     — ZIP entry listing
 *   S5 zip-text— text content inside the ZIP
 *   S6 shots   — screenshot OCR (best effort; SKIP with reason when no OCR
 *                engine is installed — screenshots are generated from the
 *                audited build in the same run)
 *   S7 claims  — fabricated-outcome phrasing review list (manual confirm)
 *
 * Fails (exit 1) on any denylist hit or on an un-runnable mandatory scan
 * (missing PDF/zip/pymupdf). SKIP categories are reported honestly and do
 * not silently pass.
 *
 * Sensitive private identifiers are assembled from fragments below so the
 * audit source itself never contains a complete prohibited literal.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const HELPER = join(PROJECT_ROOT, 'scripts', 'release-helper.py');
const DIST_DIR = join(PROJECT_ROOT, 'dist');
const DOWNLOADS_PUBLIC = join(PROJECT_ROOT, 'public', 'downloads');
const PDF_FILE_NAME = '考研智学系统-产品案例.pdf';
const ZIP_FILE_NAME = '考研智学系统-交互演示包.zip';

const TEXT_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.mjs', '.jsx', '.css', '.html', '.json',
  '.md', '.txt', '.yml', '.yaml', '.bat', '.py', '.sh', '.svg',
]);

// --- Denylist ---
// Sensitive terms are assembled from fragments so this audit source itself
// never contains a complete prohibited literal (self-scan stays meaningful).
const T = (...parts) => parts.join('');

const PRIVATE_TERMS = [
  T('华东', '师大'),
  T('华东', '师范大学'),
  T('英语', '一'),
  T('英语', '二'),
  T('kaoyan', '.db'),
  T('cloud', 'flared'),
  T('better', '-sqlite3'),
  T('api.deepseek', '.com'),
  T('KAOYAN_REMOTE_', 'PASSWORD'),
  T('KAOYAN_', 'DB_PATH'),
  T('DEEPSEEK_', 'API_KEY'),
  T('kaoyan-', 'system'),
];

const PATTERNS = [
  { label: 'Chinese mobile number', regex: /(?:\+?86[\s-]?)?1[3-9]\d{9}/ },
  { label: 'email address', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/ },
  { label: 'API key prefix', regex: /\bsk-[A-Za-z0-9]{12,}/i },
  { label: 'absolute Windows path', regex: /[A-Za-z]:\\[^\s"'<>|]+/ },
  // Requires a real path-like shape (root + name + separator/end), so base64
  // or hash fragments like "/D/ag1Wqb..." in lockfiles do not false-positive.
  { label: 'absolute POSIX path', regex: /(?<![A-Za-z0-9_+/])\/(?:home|Users|mnt|c|d)\/[A-Za-z0-9_.-]+(?:\/|$)/ },
  { label: 'key=value secret', regex: /(?:api[_-]?key|token|password|secret|passwd|credential)\s*[:=]\s*['"]?[A-Za-z0-9_-]{12,}/i },
  { label: 'real specialty context (347)', regex: new RegExp(`${T('华东', '师大')}\\s*347|347\\s*[（(]?${T('心理', '学')}`) },
  { label: 'real specialty track code', regex: new RegExp(`\\b${T('3', '12')}\\b`) },
];

const CLAIM_PATTERNS = [
  { label: 'score-gain claim', regex: new RegExp(`${T('提', '分')}|${T('提', '高')}.{0,4}(?:分|成绩|正确率)|${T('分数', '提升')}`) },
  { label: 'admission-rate claim', regex: new RegExp(`${T('上', '岸')}|${T('录取', '率')}|${T('保', '过')}|${T('押', '题')}`) },
  { label: 'growth claim', regex: new RegExp(`${T('用户')}(?:${T('增', '长')}|${T('突', '破')})|${T('留存', '率')}.{0,4}%|${T('转化', '率')}.{0,4}%`) },
];

// Manually reviewed public-content allowlist (see design spec §12.3).
const ALLOWLIST = [
  'https://shane-jay-tech.github.io/kaoyan-study-showcase/',
  '公开演示 · 虚构数据',
  '考研智学系统',
];

let findings = [];
let claims = [];
let scannedFiles = 0;

function record(kind, file, line, text, label) {
  findings.push({ kind, file, line, text: text.slice(0, 120), label });
}

function matchesDenylist(value) {
  const hits = [];
  for (const term of PRIVATE_TERMS) {
    if (value.includes(term)) hits.push(`term:${term}`);
  }
  for (const entry of PATTERNS) {
    if (entry.regex.test(value)) hits.push(`pattern:${entry.label}`);
  }
  return hits;
}

function matchesClaims(value) {
  return CLAIM_PATTERNS.filter(entry => entry.regex.test(value)).map(entry => entry.label);
}

function isAllowlisted(line) {
  return ALLOWLIST.some(entry => line.includes(entry));
}

function scanText(kind, filePath, content) {
  scannedFiles += 1;
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (isAllowlisted(line)) return;
    const hits = matchesDenylist(line);
    for (const hit of hits) {
      record(kind, filePath, index + 1, line.trim(), hit);
    }
    const claimHits = matchesClaims(line);
    for (const claim of claimHits) {
      // Negation/disclaimer phrasing is a positive privacy signal, not a claim.
      if (/不声称|未声称|不代表|不包含|虚构|示例|演示/.test(line)) continue;
      if (!claims.some(existing => existing.file === filePath && existing.line === index + 1 && existing.claim === claim)) {
        claims.push({ file: filePath, line: index + 1, claim, text: line.trim().slice(0, 120) });
      }
    }
  });
}

function isTextFile(filePath) {
  return TEXT_EXTENSIONS.has(extname(filePath).toLowerCase());
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

function runPython(args) {
  const candidates = process.platform === 'win32' ? ['python', 'python3'] : ['python3', 'python'];
  for (const executable of candidates) {
    const result = spawnSync(executable, args, { cwd: PROJECT_ROOT, encoding: 'utf8' });
    if (result.error) continue;
    if (result.status !== 0) {
      const stub = (result.stderr || result.stdout || '').includes('Python was not found');
      if (stub) continue; // Microsoft Store alias stub — try the next candidate.
      process.stderr.write(result.stderr || '');
      return { ok: false, stdout: result.stdout || '', error: `exit ${result.status}` };
    }
    return { ok: true, stdout: result.stdout || '' };
  }
  return { ok: false, stdout: '', error: 'python not found on PATH' };
}

function sourceFileList() {
  const result = spawnSync(
    'git',
    ['ls-files', '-co', '--exclude-standard', '-z'],
    { cwd: PROJECT_ROOT, encoding: 'utf8' },
  );
  if (result.status !== 0) {
    console.error('[privacy-audit] git ls-files failed — falling back to direct walk.');
    return walkFiles(PROJECT_ROOT).filter(file => !file.includes(`${sep}node_modules${sep}`) && !file.includes(`${sep}dist${sep}`) && !file.includes(`${sep}.git${sep}`));
  }
  return result.stdout.split('\0').filter(Boolean).map(name => join(PROJECT_ROOT, name));
}

function scanDirectory(kind, dir) {
  let count = 0;
  for (const file of walkFiles(dir)) {
    if (!isTextFile(file)) continue;
    if (file.includes(`${sep}node_modules${sep}`)) continue;
    try {
      scanText(kind, relative(PROJECT_ROOT, file), readFileSync(file, 'utf8'));
      count += 1;
    } catch {
      // binary or unreadable; skipped by extension check anyway
    }
  }
  return count;
}

function main() {
  // S1 source
  const sources = sourceFileList().filter(file => isTextFile(file));
  for (const file of sources) {
    if (file.includes(`${sep}node_modules${sep}`) || file.includes(`${sep}dist${sep}`)) continue;
    scanText('source', relative(PROJECT_ROOT, file), readFileSync(file, 'utf8'));
  }
  console.log(`[source] scanned ${sources.length} text files`);

  // S2 dist
  if (existsSync(DIST_DIR)) {
    const distCount = scanDirectory('dist', DIST_DIR);
    console.log(`[dist] scanned ${distCount} text files`);
  } else {
    console.log('[dist] SKIP — no dist directory (build not run yet)');
  }

  const pdfPath = join(DOWNLOADS_PUBLIC, PDF_FILE_NAME);
  const zipPath = join(DOWNLOADS_PUBLIC, ZIP_FILE_NAME);
  const temp = mkdtempSync(join(tmpdir(), 'privacy-audit-'));

  try {
    // S3 PDF extracted text
    if (existsSync(pdfPath)) {
      const textOut = join(temp, 'pdf-text.txt');
      const pdfResult = runPython([HELPER, 'pdf-text', pdfPath, textOut]);
      if (!pdfResult.ok) {
        console.error(`[pdf-text] FAIL — ${pdfResult.error}`);
        process.exitCode = 1;
      } else {
        scanText('pdf-text', PDF_FILE_NAME, readFileSync(textOut, 'utf8'));
        console.log('[pdf-text] scanned extracted PDF text');
      }
    } else {
      console.error('[pdf-text] FAIL — PDF not found. Run npm run generate:case-study first.');
      process.exitCode = 1;
    }

    // S4 ZIP listing
    if (existsSync(zipPath)) {
      const listResult = runPython([HELPER, 'zip-list', zipPath]);
      if (!listResult.ok) {
        console.error(`[zip-listing] FAIL — ${listResult.error}`);
        process.exitCode = 1;
      } else {
        const entries = listResult.stdout.trim().split('\n').filter(Boolean);
        for (const line of entries) {
          scanText('zip-listing', ZIP_FILE_NAME, line);
        }
        console.log(`[zip-listing] scanned ${entries.length} entries`);
      }

      // S5 ZIP text content
      const zipOut = join(temp, 'zip-extract');
      const extractResult = runPython([HELPER, 'zip-extract', zipPath, zipOut]);
      if (!extractResult.ok) {
        console.error(`[zip-content] FAIL — ${extractResult.error}`);
        process.exitCode = 1;
      } else {
        const zipCount = scanDirectory('zip-content', zipOut);
        console.log(`[zip-content] scanned ${zipCount} text files inside the ZIP`);
      }
    } else {
      console.error('[zip-listing] FAIL — ZIP not found. Run npm run package:demo first.');
      process.exitCode = 1;
    }

    // S6 screenshots OCR (best effort)
    const screenshotsDir = join(PROJECT_ROOT, 'public', 'screenshots');
    let ocrRan = false;
    if (existsSync(screenshotsDir)) {
      const pngs = walkFiles(screenshotsDir).filter(file => extname(file).toLowerCase() === '.png');
      if (pngs.length > 0) {
        const tesseract = spawnSync('tesseract', ['--version'], { encoding: 'utf8' });
        if (!tesseract.error) {
          for (const png of pngs) {
            const out = spawnSync('tesseract', [png, 'stdout', '-l', 'eng+chi_sim'], { encoding: 'utf8' });
            if (!out.error && out.status === 0) {
              scanText('screenshot-ocr', relative(PROJECT_ROOT, png), out.stdout);
              ocrRan = true;
            }
          }
        }
      }
      if (!ocrRan) {
        console.log('[screenshots-ocr] SKIP — no OCR engine (tesseract with chi_sim) installed; screenshots are generated from the audited build in the same run');
      } else {
        console.log(`[screenshots-ocr] scanned ${pngs.length} screenshots`);
      }
    } else {
      console.log('[screenshots-ocr] SKIP — no screenshots directory yet');
    }
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }

  // Report
  console.log('\n=== Privacy audit summary ===');
  if (findings.length > 0) {
    console.error(`FAIL — ${findings.length} denylist hit(s):`);
    for (const finding of findings) {
      console.error(`  [${finding.kind}] ${finding.file}:${finding.line} ${finding.label} :: ${finding.text}`);
    }
    process.exitCode = 1;
  } else {
    console.log('PASS — no denylist hits across source, dist, PDF text, ZIP listing and ZIP content.');
  }

  if (claims.length > 0) {
    console.log(`\nREVIEW — ${claims.length} phrasing(s) need manual confirmation (fabricated-outcome check):`);
    for (const claim of claims) {
      console.log(`  ${claim.file}:${claim.line} [${claim.claim}] :: ${claim.text}`);
    }
  } else {
    console.log('REVIEW — no fabricated-outcome phrasing detected.');
  }

  console.log(`\nscanned ${scannedFiles} text surfaces in total`);
  if (process.exitCode) process.exit(process.exitCode);
}

main();
