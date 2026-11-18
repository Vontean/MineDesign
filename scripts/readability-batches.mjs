// 按目录把待改名的绑定分成批次，供可读化分工使用。
// 用法：node scripts/readability-batches.mjs [--size 600] [--skip <正则>]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listBindings } from './rename-bindings.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const size = Number(flag('--size') ?? 600);
const skip = flag('--skip') ? new RegExp(flag('--skip')) : null;
const files = [];
const walk = d => { for (const n of fs.readdirSync(d).sort()) { const f = path.join(d, n); if (fs.statSync(f).isDirectory()) { if (n !== 'generated' && !n.startsWith('.')) walk(f); } else if (/\.tsx?$/.test(n) && !/\.test\.|\.d\.ts$/.test(n)) files.push(path.relative(ROOT, f)); } };
for (const pkg of ['design-runtime', 'design-system-runtime']) walk(path.join(ROOT, 'packages', pkg, 'src'));
const counted = files.filter(f => !skip?.test(f)).map(f => ({ file: f, bindings: listBindings(fs.readFileSync(path.join(ROOT, f), 'utf8')).length })).filter(f => f.bindings);
// 按路径顺序装箱，相邻目录尽量在同一批；超过上限的单个文件独占一批
const batches = [];
let current = null;
for (const f of counted) {
  const dir = path.dirname(f.file);
  if (!current || current.bindings + f.bindings > size) batches.push(current = { dir, files: [], bindings: 0 });
  current.files.push(f);
  current.bindings += f.bindings;
}
const total = counted.reduce((n, f) => n + f.bindings, 0);
console.log(JSON.stringify({ total, batches: batches.map((b, i) => ({ id: `b${String(i + 1).padStart(3, '0')}`, dir: b.dir, bindings: b.bindings, files: b.files.map(f => f.file) })) }, null, 1));
