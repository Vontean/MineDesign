import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// runtime 内部的分层：只允许上层 import 下层（docs/runtime-modules.md）。
// allowed 记录尚存的反向依赖：每对目录之间被反向 import 的不同目标文件数，只能减少，不能增加。
// 按目标文件计数，所以把一个文件拆成几个不会被算作新增依赖。
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
      'comments → canvas': 5,
      '(root) → scripts': 1,
      'editor → canvas': 6,
      'editor → comments': 1,
      'editor → export': 4,
      'editor → collaboration': 1,
      'export → canvas': 2,
      'fast-edit → canvas': 1,
      'find → canvas': 2,
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
      'ui → host': 1,
      'ui → files': 4,
      'ui → platform': 1,
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
      if (to > from) { const key = `${fromDir} → ${toDir}`; (counts[key] ??= new Set()).add(target); }
    }
  }
  return Object.fromEntries(Object.entries(counts).map(([key, targets]) => [key, targets.size]));
}

for (const pkg of Object.keys(packages)) {
  test(`${pkg}：反向依赖不超过记录的数量`, () => {
    const counts = upwardImports(pkg);
    const { allowed } = packages[pkg];
    for (const [key, n] of Object.entries(counts)) assert.ok(n <= (allowed[key] ?? 0), `${key} 反向 import 了 ${n} 个文件，允许 ${allowed[key] ?? 0} 个`);
  });
}

// 注册表已删除：任何地方都不能再把 runtime 当作值读取（藏在类型断言后面的引用曾漏过迁移脚本）
import { createRequire } from 'node:module';
const { parser, traverse: traversePkg } = createRequire(import.meta.url)('@babel/standalone').packages;
const traverseAst = traversePkg.default ?? traversePkg;
for (const pkg of Object.keys(packages)) {
  test(`${pkg}：没有对已删除注册表的值引用`, () => {
    const src = path.join(root, 'packages', pkg, 'src');
    const found = [];
    for (const file of sources(src)) {
      const text = fs.readFileSync(path.join(src, file), 'utf8');
      if (!/\bruntime\b/.test(text)) continue;
      traverseAst(parser.parse(text, { sourceType: 'module', plugins: ['typescript', 'jsx'] }), {
        Identifier(p) {
          if (p.node.name !== 'runtime' || !p.isReferencedIdentifier() || p.scope.hasBinding('runtime')) return;
          if (p.findParent(q => q.isTSType?.() || q.isTSTypeQuery?.())) return;
          found.push(`${file}:${p.node.loc.start.line}`);
        },
      });
    }
    assert.deepEqual(found, []);
  });
}
