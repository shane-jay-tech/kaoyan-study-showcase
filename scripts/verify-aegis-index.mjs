#!/usr/bin/env node
// verify-aegis-index.mjs（d914-79）：docs/aegis/ 下除 INDEX.md 自身以外的所有文件
// 都必须被 INDEX.md 表格收录。只读比对，不写任何文件。
import fs from 'node:fs';
import path from 'node:path';

const root = 'docs/aegis';
const idx = fs.readFileSync(path.join(root, 'INDEX.md'), 'utf8');
const listed = new Set();
for (const m of idx.matchAll(/docs\/aegis\/([^\s|]+)/g)) {
  listed.add(m[1].replace(/\//g, path.sep));
}

const actual = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else actual.push(path.relative(root, p));
  }
})(root);

const missing = actual.filter((f) => !listed.has(f) && f !== 'INDEX.md');
for (const f of missing) {
  process.stdout.write(`missing: ${f}\n`);
}

if (missing.length > 0) {
  process.stdout.write(`FAIL - missing ${missing.length}\n`);
  process.exit(1);
}
process.stdout.write(`PASS ${listed.size}/${actual.length}\n`);
