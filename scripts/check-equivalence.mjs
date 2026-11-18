// 校验可读化改动不改变行为：比较改动前后的编译结果在 α 等价意义下是否相同。
// 两边都用 esbuild 去掉类型，再把全部局部绑定按出现顺序统一改名、去掉 `(0, f)(…)` 的写法差异后逐字比较。
// 因此改局部名字、补类型、写注释、调整格式都会通过；改了导出名、属性名、字符串或任何逻辑都会被发现。
// 用法：node scripts/check-equivalence.mjs [--base <git 引用>] [文件...]
//   不给文件时检查 packages/*/src 下相对 base（默认 HEAD）改过的全部 .ts/.tsx。
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { transformSync } = require('esbuild');
const { parser, traverse: traversePkg, generator: generatorPkg } = require('@babel/standalone').packages;
const traverse = traversePkg.default ?? traversePkg;
const generate = generatorPkg.default ?? generatorPkg;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** 把一段 TypeScript 变成规范形式的 JavaScript 文本。 */
export function canonical(source, file = 'x.tsx') {
  const js = transformSync(source, { loader: file.endsWith('.tsx') ? 'tsx' : 'ts', jsx: 'preserve', target: 'esnext', format: 'esm', legalComments: 'none', charset: 'ascii' }).code;
  const ast = parser.parse(js, { sourceType: 'module', plugins: ['jsx'] });
  let counter = 0;
  const seen = new Set();
  traverse(ast, {
    Scopable(p) {
      const own = Object.entries(p.scope.bindings).filter(([, b]) => !seen.has(b)).sort((a, b) => (a[1].identifier?.start ?? 0) - (b[1].identifier?.start ?? 0));
      for (const [name, binding] of own) {
        seen.add(binding);
        const next = `$${++counter}`;
        const ids = new Set([binding.identifier, ...binding.referencePaths.map(r => r.node)]);
        for (const v of binding.constantViolations) for (const id of Object.values(v.getBindingIdentifiers?.() ?? {})) ids.add(id);
        for (const v of binding.constantViolations) if (v.isUpdateExpression() && v.node.argument.type === 'Identifier') ids.add(v.node.argument);
        for (const id of ids) if (id && id.name === name) id.name = next;
      }
    },
    CallExpression: { exit(p) { unwrap(p.node); } },
    OptionalCallExpression: { exit(p) { unwrap(p.node); } },
    StringLiteral(p) { delete p.node.extra; },
    NumericLiteral(p) { delete p.node.extra; },
  });
  return generate(ast, { comments: false, compact: false, retainLines: false, jsescOption: { minimal: false } }).code;
}

/** `(0, f)(…)` 与 `f(…)` 在 f 是标识符时完全相同（this 都是 undefined）。 */
function unwrap(node) {
  const c = node.callee;
  if (c?.type === 'SequenceExpression' && c.expressions.length === 2 && c.expressions[0].type === 'NumericLiteral' && c.expressions[1].type === 'Identifier') node.callee = c.expressions[1];
}

function firstDifference(a, b) {
  const la = a.split('\n'), lb = b.split('\n');
  for (let i = 0; i < Math.max(la.length, lb.length); i++) if (la[i] !== lb[i]) return { line: i + 1, before: la.slice(Math.max(0, i - 2), i + 3).join('\n'), after: lb.slice(Math.max(0, i - 2), i + 3).join('\n') };
  return null;
}

export function checkFile(file, base = 'HEAD') {
  const rel = path.relative(ROOT, path.resolve(file)).split(path.sep).join('/');
  let before;
  try { before = execFileSync('git', ['show', `${base}:${rel}`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20 }); }
  catch { return { file: rel, status: 'new' }; }
  const after = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  if (before === after) return { file: rel, status: 'same' };
  try {
    const a = canonical(before, rel), b = canonical(after, rel);
    return a === b ? { file: rel, status: 'equivalent' } : { file: rel, status: 'different', diff: firstDifference(a, b) };
  } catch (error) {
    return { file: rel, status: 'error', error: error.message.split('\n')[0] };
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const bi = args.indexOf('--base');
  const base = bi >= 0 ? args.splice(bi, 2)[1] : 'HEAD';
  let files = args;
  if (!files.length) {
    files = execFileSync('git', ['diff', '--name-only', base, '--', 'packages'], { cwd: ROOT, encoding: 'utf8' }).split('\n')
      .filter(f => /\/src\/.*\.tsx?$/.test(f) && !/\.test\.tsx?$|\.d\.ts$/.test(f) && fs.existsSync(path.join(ROOT, f)));
  }
  const results = files.map(f => checkFile(f, base));
  const bad = results.filter(r => r.status === 'different' || r.status === 'error');
  for (const r of results) if (r.status !== 'same') console.log(`${r.status === 'equivalent' ? '✓' : r.status === 'new' ? '·' : '✗'} ${r.file}${r.status === 'new' ? '（新文件，未比较）' : ''}${r.error ? `：${r.error}` : ''}`);
  for (const r of bad.filter(r => r.diff)) console.log(`\n${r.file} 第 ${r.diff.line} 行（规范化后）\n--- 改动前\n${r.diff.before}\n+++ 改动后\n${r.diff.after}`);
  console.log(`\n${results.filter(r => r.status === 'equivalent').length} 个等价，${bad.length} 个不等价，${results.filter(r => r.status === 'new').length} 个新文件`);
  process.exitCode = bad.length ? 1 : 0;
}
