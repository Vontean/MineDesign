import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// runtime 内部的分层：只允许上层 import 下层（docs/runtime-modules.md）。
// allowed 记录迁移完成时尚存的反向依赖数量，只能减少，不能增加。
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packages = {
  'design-runtime': {
    layers: [
      ['(root)'],
      ['cds'],
      ['platform', 'design-system', 'preview', 'geometry', 'assets', 'contracts', 'bootstrap', 'runtime', 'worker', 'scripts', 'thumbnail'],
      ['editor'],
      ['comments', 'export', 'find', 'properties', 'collaboration', 'fast-edit'],
      ['canvas'],
      ['application'],
    ],
    entry: ['app-runtime.ts'],
    allowed: {
      'assets → canvas': 1,
      'assets → editor': 1,
      'canvas → application': 1,
      'collaboration → canvas': 1,
      'comments → canvas': 6,
      '(root) → scripts': 1,
      'editor → canvas': 22,
      'editor → comments': 2,
      'editor → export': 6,
      'editor → collaboration': 1,
      'export → canvas': 2,
      'fast-edit → canvas': 1,
      'find → canvas': 3,
      'geometry → editor': 4,
      'platform → export': 1,
      'platform → editor': 5,
      'platform → canvas': 2,
      'preview → export': 2,
      'preview → canvas': 1,
      'preview → editor': 2,
      'properties → canvas': 2,
    },
  },
  'design-system-runtime': {
    layers: [
      ['(root)'],
      ['ui'],
      ['model', 'documents', 'host', 'platform', 'media', 'telemetry', 'contracts', 'reconstruction'],
      ['editor'],
      ['files'],
    ],
    entry: ['runtime.ts'],
    allowed: {
      '(root) → documents': 1,
      '(root) → files': 3,
      '(root) → model': 2,
      '(root) → platform': 1,
      '(root) → ui': 1,
      'ui → host': 2,
      'ui → files': 4,
      'ui → platform': 6,
    },
  },
};

function sources(dir, base = dir, out = []) {
  for (const name of fs.readdirSync(dir).sort()) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) { if (name !== 'generated' && !name.startsWith('.')) sources(full, base, out); }
    else if (/\.tsx?$/.test(name) && !/\.test\.|\.d\.ts$/.test(name)) out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out;
}

export function upwardImports(pkg) {
  const { layers, entry } = packages[pkg];
  const src = path.join(root, 'packages', pkg, 'src');
  const level = file => { const d = file.includes('/') ? file.split('/')[0] : '(root)'; return [layers.findIndex(l => l.includes(d)), d]; };
  const counts = {};
  for (const file of sources(src)) {
    if (entry.includes(file)) continue; // 组合根可以 import 任何层
    const [from, fromDir] = level(file);
    assert.notEqual(from, -1, `${pkg}/${file} 所在目录没有归入任何层`);
    const text = fs.readFileSync(path.join(src, file), 'utf8');
    for (const m of text.matchAll(/^import (?!type )[^;]*? from "(\.[^"]+)";/gms)) {
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), m[1]));
      const [to, toDir] = level(target);
      if (to > from) { const key = `${fromDir} → ${toDir}`; counts[key] = (counts[key] ?? 0) + 1; }
    }
  }
  return counts;
}

for (const pkg of Object.keys(packages)) {
  test(`${pkg}：反向依赖不超过记录的数量`, () => {
    const counts = upwardImports(pkg);
    const { allowed } = packages[pkg];
    for (const [key, n] of Object.entries(counts)) assert.ok(n <= (allowed[key] ?? 0), `${key} 的反向 import 有 ${n} 处，允许 ${allowed[key] ?? 0} 处`);
  });
}
