#!/usr/bin/env node
/**
 * Minimal static file server for the offline demo package and local
 * artifact generation. Node core modules only (http, fs, path, url).
 *
 * Usage:
 *   node serve.mjs [--dir <path>] [--port <port>]
 *
 * Default directory resolution (relative to this script):
 *   1. ./app          — offline demo package layout
 *   2. ./dist         — project production build layout
 *
 * Serves index.html for extensionless paths so hash-based routes always
 * work from a single static root. Binds to 127.0.0.1 only.
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.wasm': 'application/wasm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function parseArgs(argv) {
  const args = { dir: null, port: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--dir' && argv[i + 1]) {
      args.dir = argv[i + 1];
      i += 1;
    } else if (argv[i] === '--port' && argv[i + 1]) {
      args.port = Number(argv[i + 1]);
      i += 1;
    }
  }
  return args;
}

function resolveRoot(cliDir) {
  const scriptDir = fileURLToPath(new URL('.', import.meta.url));
  if (cliDir) return resolve(cliDir);
  const packageApp = resolve(scriptDir, 'app');
  if (existsSync(packageApp)) return packageApp;
  return resolve(scriptDir, 'dist');
}

function main() {
  const { dir, port: portArg } = parseArgs(process.argv.slice(2));
  const root = resolveRoot(dir);
  const port = portArg ?? (Number(process.env.PORT) || 4173);
  const host = '127.0.0.1';

  if (!existsSync(join(root, 'index.html'))) {
    console.error(`[serve] index.html not found under ${root}. Build the app first or pass --dir.`);
    process.exit(1);
  }

  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://${host}:${port}`);
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Bad request');
      return;
    }

    const requested = normalize(pathname).replace(/^([/\\])+/, '');
    let filePath = resolve(root, requested);
    if (filePath !== root && !filePath.startsWith(root + sep)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return;
    }

    let candidate = filePath;
    if (!existsSync(candidate) || statSync(candidate).isDirectory()) {
      // SPA fallback: extensionless paths and directories serve index.html.
      if (!extname(pathname)) candidate = join(root, 'index.html');
      else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
        return;
      }
    }

    const type = MIME[extname(candidate).toLowerCase()] ?? 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': 'no-store',
    });
    createReadStream(candidate).pipe(res);
  });

  server.on('error', error => {
    if (error.code === 'EADDRINUSE') {
      console.error(`[serve] port ${port} is already in use. Stop the other process or pass --port <other>.`);
      process.exit(1);
    }
    console.error(`[serve] failed to start: ${error.message}`);
    process.exit(1);
  });

  server.listen(port, host, () => {
    console.log(`[serve] serving ${root} at http://${host}:${port}`);
  });
}

main();
