#!/usr/bin/env node
/**
 * Package the offline demo ZIP (考研智学系统-交互演示包.zip).
 *
 * Contents (all from the new project only):
 *   app/                    offline production build (relative base, no server rewrites)
 *   serve.mjs               Node core-modules static server
 *   start-windows.bat       Windows launcher
 *   使用说明.md              cross-platform start instructions
 *   考研智学系统-产品案例.pdf  product case study (copy)
 *   screenshots/            representative screenshots of the built app
 *   SHA256SUMS.txt          SHA-256 integrity manifest (every entry)
 *
 * The offline app build sets VITE_OFFLINE_PACKAGE=1, which disables the
 * ZIP download entry inside the offline package (the package cannot
 * contain a copy of itself) while keeping the PDF download available.
 *
 * Outputs:
 *   public/downloads/考研智学系统-交互演示包.zip
 *   public/downloads/release-manifest.json  (build id + artifact hashes)
 *   src/data/release-artifacts.json         (zip availability + size)
 *
 * Fails closed: missing dist build or missing PDF stops packaging.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DIST_DIR = join(PROJECT_ROOT, 'dist');
const PUBLIC_DIR = join(PROJECT_ROOT, 'public');
const DOWNLOADS_PUBLIC = join(PUBLIC_DIR, 'downloads');
const SCREENSHOTS_PUBLIC = join(PUBLIC_DIR, 'screenshots');
const ARTIFACTS_JSON = join(PROJECT_ROOT, 'src', 'data', 'release-artifacts.json');
const VITE_BIN = join(PROJECT_ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
const HELPER = join(PROJECT_ROOT, 'scripts', 'release-helper.py');
const PDF_FILE_NAME = '考研智学系统-产品案例.pdf';
const ZIP_FILE_NAME = '考研智学系统-交互演示包.zip';

const README_ZIP = `# 考研智学系统 · 交互演示包

这是一个完全离线的公开演示包：运行它不需要网络、后端、数据库或 AI 服务。
包内全部数据为虚构合成内容，不包含任何真实学校、专业、成绩、学习历史、
联系方式、凭据或私有系统数据。

## 内容清单

- \`app/\` — 离线构建的交互演示（React 静态站点，hash 路由）
- \`serve.mjs\` — 基于 Node 核心模块的本地静态服务器
- \`start-windows.bat\` — Windows 一键启动脚本
- \`考研智学系统-产品案例.pdf\` — 产品案例（可选中文本、含公开地址）
- \`screenshots/\` — 代表性界面截图（由本包构建产物生成）
- \`SHA256SUMS.txt\` — 全部文件的 SHA-256 完整性清单

## 启动

### Windows

双击 \`start-windows.bat\`，浏览器会自动打开 http://127.0.0.1:4173 。

### macOS / Linux

在终端进入本目录后运行：

\`\`\`bash
node serve.mjs
\`\`\`

然后用浏览器打开 http://127.0.0.1:4173 。

需要 Node.js 20 或更高版本（https://nodejs.org）。

## 停止

在启动窗口按 Ctrl+C 停止服务器。

## 完整性校验

Windows PowerShell：

\`\`\`powershell
Get-Content SHA256SUMS.txt | ForEach-Object {
  $hash, $file = $_ -split '  ', 2
  $actual = (Get-FileHash $file -Algorithm SHA256).Hash.ToLower()
  if ($hash -eq $actual) { "OK   $file" } else { "FAIL $file" }
}
\`\`\`

macOS / Linux：

\`\`\`bash
sha256sum -c SHA256SUMS.txt
\`\`\`

## 隐私与边界

- 演示数据仅存于浏览器内存，刷新即重置；不写入任何持久化存储。
- 页面运行时零网络请求：无 API、无分析、无远程字体/图片、无认证流程。
- 练习反馈为本地预生成的确定性示例，不连接任何模型。
- 若页面显示「下载 ZIP」不可用，属预期：离线包内不包含自身的副本，
  本文件夹即演示包；PDF 下载始终可用。
`;

function fail(message) {
  console.error(`[package-demo] ERROR: ${message}`);
  process.exit(1);
}

function runPython(args) {
  // Windows: prefer the real `python`; POSIX/CI: `python3` first.
  const candidates = process.platform === 'win32' ? ['python', 'python3'] : ['python3', 'python'];
  for (const executable of candidates) {
    const result = spawnSync(executable, args, { cwd: PROJECT_ROOT, encoding: 'utf8' });
    if (result.error) continue;
    if (result.status !== 0) {
      const stub = (result.stderr || result.stdout || '').includes('Python was not found');
      if (stub) continue; // Microsoft Store alias stub — try the next candidate.
      process.stderr.write(result.stderr || '');
      fail(`python helper failed: ${executable} ${args.join(' ')} (exit ${result.status})`);
    }
    return result.stdout;
  }
  fail('Python 3 was not found on PATH (tried python and python3). Needed for ZIP packaging.');
}

function runViteOfflineBuild(outDir) {
  if (!existsSync(VITE_BIN)) fail(`vite binary not found at ${VITE_BIN}. Run npm install first.`);
  const result = spawnSync(
    process.execPath,
    [VITE_BIN, 'build', '--base', './', '--outDir', outDir, '--emptyOutDir', 'true'],
    {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      env: { ...process.env, VITE_OFFLINE_PACKAGE: '1' },
    },
  );
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  if (result.status !== 0) fail('offline vite build failed (see output above)');
  if (!existsSync(join(outDir, 'index.html'))) fail('offline build produced no index.html');
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

function writeManifest(pkgRoot) {
  const lines = [];
  for (const file of walkFiles(pkgRoot).sort()) {
    const rel = relative(pkgRoot, file).split(sep).join('/');
    if (rel === 'SHA256SUMS.txt') continue;
    lines.push(`${sha256File(file)}  ${rel}`);
  }
  const manifestPath = join(pkgRoot, 'SHA256SUMS.txt');
  writeFileSync(manifestPath, `${lines.join('\n')}\n`, 'utf8');
  console.log(`[package-demo] wrote SHA256SUMS.txt with ${lines.length} entries`);
}

function nowStamp() {
  const now = new Date();
  const pad = value => String(value).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function main() {
  if (!existsSync(join(DIST_DIR, 'index.html'))) {
    fail('dist/index.html not found. Run "npm run build" first (fails closed).');
  }
  const pdfPath = join(DOWNLOADS_PUBLIC, PDF_FILE_NAME);
  if (!existsSync(pdfPath)) {
    fail(`PDF not found at ${pdfPath}. Run "npm run generate:case-study" first (fails closed).`);
  }
  if (!existsSync(SCREENSHOTS_PUBLIC)) {
    fail('public/screenshots missing. Run "npm run generate:case-study" first (fails closed).');
  }
  mkdirSync(DOWNLOADS_PUBLIC, { recursive: true });

  const tempRoot = join(tmpdir(), `kaoyan-package-${Date.now()}`);
  const appDir = join(tempRoot, 'app');
  const pkgRoot = join(tempRoot, 'pkg');
  try {
    // 1. Offline production build (relative base + offline flag).
    runViteOfflineBuild(appDir);
    // Vite copies the project's public directory, including the current release
    // downloads. Keep the PDF available to the offline case page, but remove
    // self-referential release files from the package app.
    rmSync(join(appDir, 'downloads', ZIP_FILE_NAME), { force: true });
    rmSync(join(appDir, 'downloads', 'release-manifest.json'), { force: true });

    // 2. Stage the package root.
    mkdirSync(join(pkgRoot, 'screenshots'), { recursive: true });
    copyFileSync(join(PROJECT_ROOT, 'scripts', 'serve.mjs'), join(pkgRoot, 'serve.mjs'));
    copyFileSync(join(PROJECT_ROOT, 'scripts', 'start-windows.bat'), join(pkgRoot, 'start-windows.bat'));
    writeFileSync(join(pkgRoot, '使用说明.md'), README_ZIP, 'utf8');
    copyFileSync(pdfPath, join(pkgRoot, PDF_FILE_NAME));
    for (const name of readdirSync(SCREENSHOTS_PUBLIC)) {
      copyFileSync(join(SCREENSHOTS_PUBLIC, name), join(pkgRoot, 'screenshots', name));
    }
    cpSync(appDir, join(pkgRoot, 'app'), { recursive: true });

    // 3. Integrity manifest over the whole package.
    writeManifest(pkgRoot);

    // 4. Create the ZIP.
    const zipPath = join(DOWNLOADS_PUBLIC, ZIP_FILE_NAME);
    rmSync(zipPath, { force: true });
    runPython([HELPER, 'zip-create', pkgRoot, zipPath]);

    const zipSize = statSync(zipPath).size;
    const zipHash = sha256File(zipPath);
    const pdfSize = statSync(pdfPath).size;
    const pdfHash = sha256File(pdfPath);

    // 5. Site-level release manifest.
    const manifest = {
      buildId: `local-${nowStamp()}`,
      generatedAt: new Date().toISOString(),
      site: { base: '/kaoyan-study-showcase/' },
      pdf: { fileName: PDF_FILE_NAME, sizeBytes: pdfSize, sha256: pdfHash },
      zip: { fileName: ZIP_FILE_NAME, sizeBytes: zipSize, sha256: zipHash },
    };
    writeFileSync(join(DOWNLOADS_PUBLIC, 'release-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

    // 6. Runtime artifact availability.
    const artifacts = JSON.parse(readFileSync(ARTIFACTS_JSON, 'utf8'));
    artifacts.zip = { fileName: ZIP_FILE_NAME, available: true, sizeBytes: zipSize };
    writeFileSync(ARTIFACTS_JSON, `${JSON.stringify(artifacts, null, 2)}\n`, 'utf8');

    console.log(`[package-demo] OK: ${zipPath} (${zipSize} bytes, sha256 ${zipHash})`);
    console.log(`[package-demo] release-manifest.json and release-artifacts.json updated`);
  } catch (error) {
    fail(error.message || String(error));
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

main();
