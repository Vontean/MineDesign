// 可读化进度：统计还原代码留下的机器名与被擦除的类型。
// 用法：node scripts/readability.mjs [包名...] [--files] [--json]
//   --files 按文件列出（机器名最多的在前），--json 输出完整结果。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** 带编号的通用名（value12、callback3），以及还原时由模块名拼出的编号名（PlatformFileContentConstant_17）。 */
export const NUMBERED = /\b(?:value|callback|items|input|options|context|extra|argument|detail|entry|flag|count|current|text|index|state|list|result|name|item|node|element|event|target|key|data|values|entries)\d+\b/g;
export const DERIVED = /\b[A-Z][A-Za-z]+(?:Constant|Pattern|Value|Values|Config|Items|Set|Alias|Resolved|ResolvedValue|Limit|Slice|Replace|Test|Reduce|Subscribers|CurrentState|Label|Message)_\d+\b/g;
const EXTRA_ARGS = /\b_extraArguments\d+\b/g;
const DYNAMIC = /\bDynamic\b/g;

const count = (text, pattern) => (text.match(pattern) ?? []).length;

/** 单个文件的指标。可读：每 100 行机器名少于 1 处，且 Dynamic 少于 2 处。 */
export function measure(text) {
  const lines = text.split('\n').length;
  const machine = count(text, NUMBERED) + count(text, DERIVED) + count(text, EXTRA_ARGS);
  const dynamic = count(text, DYNAMIC);
  return { lines, machine, dynamic, readable: machine <= lines / 100 && dynamic <= lines / 50 };
}

function collect(dir, base = dir, out = []) {
  for (const name of fs.readdirSync(dir).sort()) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) { if (name !== 'generated' && !name.startsWith('.')) collect(full, base, out); }
    else if (/\.tsx?$/.test(name) && !/\.test\.|\.d\.ts$/.test(name)) out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out;
}

export function report(pkg) {
  const src = path.join(ROOT, 'packages', pkg, 'src');
  const files = collect(src).map(file => ({ file, ...measure(fs.readFileSync(path.join(src, file), 'utf8')) }));
  const sum = key => files.reduce((n, f) => n + f[key], 0);
  const readable = files.filter(f => f.readable);
  return {
    pkg,
    files: files.length,
    lines: sum('lines'),
    machine: sum('machine'),
    dynamic: sum('dynamic'),
    readableFiles: readable.length,
    readableLines: readable.reduce((n, f) => n + f.lines, 0),
    list: files.sort((a, b) => b.machine - a.machine || b.dynamic - a.dynamic),
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const pkgs = args.filter(a => !a.startsWith('--'));
  const results = (pkgs.length ? pkgs : ['design-runtime', 'design-system-runtime']).map(report);
  if (args.includes('--json')) console.log(JSON.stringify(results, null, 1));
  else for (const r of results) {
    const pct = (100 * r.readableLines / r.lines).toFixed(1);
    console.log(`${r.pkg}：可读 ${r.readableLines}/${r.lines} 行（${pct}%），${r.readableFiles}/${r.files} 个文件；机器名 ${r.machine} 处，Dynamic ${r.dynamic} 处`);
    if (args.includes('--files')) for (const f of r.list.filter(f => !f.readable)) console.log(`  ${f.machine}\t${f.dynamic}\t${f.lines}\t${f.file}`);
  }
}
