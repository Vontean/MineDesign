// runtime 依赖地图：从共享注册表导出"谁提供、谁读取"。只读源码，不修改 runtime。
// 用法：node scripts/runtime-deps.mjs [design-runtime|design-system-runtime] [--out <dir>]
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { parser, traverse: traversePkg } = require('@babel/standalone').packages;
const traverse = traversePkg.default ?? traversePkg;

const SOURCE = /\.(ts|tsx)$/;
const SKIP = /(\.test\.|\.d\.ts$|\/generated\/)/;

/** 惰性初始化：`runtime.initializeOnce(() => {...})` 的回调体等同于模块顶层代码（打包器的延迟模块初始化）。 */
function isLazyInit(fn) {
  const call = fn.parentPath;
  if (!call?.isCallExpression() || call.node.arguments[0] !== fn.node) return false;
  let callee = call.node.callee;
  if (callee.type === 'SequenceExpression') callee = callee.expressions[callee.expressions.length - 1];
  return callee.type === 'MemberExpression' && callee.property.name === 'initializeOnce';
}

/** 读取阶段：install 在安装函数体内直接执行；init 在初始化函数或惰性初始化回调内直接执行；call 在更深的函数内。 */
function phaseOf(path_, installFn, initFn) {
  const chain = [];
  for (let fn = path_.getFunctionParent(); fn && fn.node !== installFn; fn = fn.getFunctionParent()) chain.push(fn);
  if (chain.length === 0) return 'install';
  const top = chain[chain.length - 1].node === initFn;
  if (chain.length === 1 && (top || isLazyInit(chain[0]))) return 'init';
  if (chain.length === 2 && top && isLazyInit(chain[0])) return 'init';
  return 'call';
}

function analyzeFile(file, source) {
  const result = { file, installs: [], imports: [], provides: [], reads: [], writes: [], opaque: 0 };
  const ast = parser.parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
  traverse(ast, {
    ImportDeclaration(p) {
      if (p.node.importKind !== 'type' && p.node.source.value.startsWith('.')) result.imports.push(p.node.source.value);
    },
    Function(p) {
      // 安装函数：导出的顶层函数，名为 installXxx 或首个参数的类型含注册表
      const node = p.node;
      const exported = p.parentPath.isExportNamedDeclaration() || p.parentPath.isExportDefaultDeclaration();
      const param = node.params[0];
      if (!exported || node.type !== 'FunctionDeclaration' || param?.type !== 'Identifier' || node.id?.name === 'bindRuntimeValue') return;
      const typed = param.typeAnnotation ? source.slice(param.typeAnnotation.start, param.typeAnnotation.end).includes('RuntimeBindings') : false;
      if (!typed && !/^install[A-Z]/.test(node.id?.name ?? '')) return;
      p.skip();
      result.installs.push(node.id.name);
      const registry = p.scope.getBinding(param.name);
      const ret = node.body.body.find(s => s.type === 'ReturnStatement');
      const initFn = ret?.argument && /Function/.test(ret.argument.type) ? ret.argument : null;
      const isRegistry = id => id.isIdentifier({ name: param.name }) && id.scope.getBinding(param.name) === registry;
      // 表达式中立即执行的注册表读取（不进入嵌套函数）
      const immediateReads = exprPath => {
        const names = new Set();
        const visit = { Function(q) { q.skip(); }, MemberExpression(q) { const n = memberName(q); if (n) names.add(n); } };
        if (exprPath.isMemberExpression()) { const n = memberName(exprPath); if (n) names.add(n); }
        exprPath.traverse(visit);
        return [...names].sort();
      };
      const memberName = q => {
        if (!isRegistry(q.get('object'))) return null;
        const prop = q.node.property;
        if (!q.node.computed && prop.type === 'Identifier') return prop.name;
        if (q.node.computed && prop.type === 'StringLiteral') return prop.value;
        return null;
      };
      const describeLocal = local => {
        const binding = p.scope.getBinding(local) ?? p.get('body').scope.getBinding(local);
        if (!binding) return { kind: 'unknown' };
        if (binding.path.isFunctionDeclaration()) return { kind: 'function' };
        if (binding.path.isClassDeclaration()) return { kind: 'class' };
        let kind = 'value', mutable = false;
        const deps = new Set();
        const assignments = [...binding.constantViolations];
        if (binding.path.isVariableDeclarator() && binding.path.node.init) assignments.push(binding.path);
        for (const a of assignments) {
          // 注册表 setter 里的赋值不算运行时写入；跨文件写入另由 writes 统计
          if (a.findParent(x => x.isCallExpression() && x.get('callee').isIdentifier({ name: 'bindRuntimeValue' }))) continue;
          const rhs = a.isAssignmentExpression() ? a.get('right') : a.isVariableDeclarator() ? a.get('init') : null;
          if (!rhs || phaseOf(a, node, initFn) === 'call') { mutable = true; continue; }
          if (rhs.isFunction()) kind = 'function-value';
          for (const dep of immediateReads(rhs)) deps.add(dep);
        }
        return { kind, mutable, deps: [...deps].sort() };
      };
      p.traverse({
        CallExpression(q) {
          if (!q.get('callee').isIdentifier({ name: 'bindRuntimeValue' })) return;
          const [reg, name, getter, setter] = q.get('arguments');
          if (!reg || !isRegistry(reg) || !name?.isStringLiteral()) return;
          const body = getter?.node?.body;
          const local = body?.type === 'Identifier' ? body.name : null;
          result.provides.push({ name: name.node.value, via: 'bind', setter: !!setter, ...(local ? describeLocal(local) : { kind: 'complex' }) });
        },
        MemberExpression(q) {
          const name = memberName(q);
          if (!name) return;
          const phase = phaseOf(q, node, initFn);
          const assigned = q.parentPath.isAssignmentExpression() && q.parentKey === 'left';
          if (assigned) {
            const rhs = q.parentPath.get('right');
            result.writes.push({ name, phase, kind: rhs.isFunction() ? 'function-value' : 'value', deps: phase === 'call' ? [] : immediateReads(rhs) });
          } else result.reads.push({ name, phase });
        },
        JSXMemberExpression(q) {
          const obj = q.get('object');
          if (!obj.isJSXIdentifier({ name: param.name }) || q.parentPath.isJSXClosingElement()) return;
          result.reads.push({ name: q.node.property.name, phase: phaseOf(q, node, initFn) });
        },
        Identifier(q) {
          if (q.node === param || !isRegistry(q) || q.parentPath.isMemberExpression({ object: q.node })) return;
          if (q.parentPath.isCallExpression() && q.parentPath.get('callee').isIdentifier({ name: 'bindRuntimeValue' })) return;
          if (q.parentPath.isCallExpression() && /^install[A-Z]/.test(q.parentPath.node.callee.name ?? '')) return;
          result.opaque++;
        },
      });
    },
  });
  return result;
}

/** 强连通分量（迭代 Tarjan），只返回多于一个节点的分量。 */
function cycles(nodes, edges) {
  let index = 0;
  const idx = new Map(), low = new Map(), onStack = new Set(), stack = [], out = [];
  for (const root of nodes) {
    if (idx.has(root)) continue;
    const work = [[root, 0]];
    while (work.length) {
      const frame = work[work.length - 1];
      const [v] = frame;
      if (frame[1] === 0) { idx.set(v, index); low.set(v, index); index++; stack.push(v); onStack.add(v); }
      const next = [...(edges.get(v) ?? [])];
      if (frame[1] < next.length) {
        const w = next[frame[1]++];
        if (!idx.has(w)) work.push([w, 0]);
        else if (onStack.has(w)) low.set(v, Math.min(low.get(v), idx.get(w)));
      } else {
        work.pop();
        if (work.length) { const u = work[work.length - 1][0]; low.set(u, Math.min(low.get(u), low.get(v))); }
        if (low.get(v) === idx.get(v)) {
          const scc = [];
          for (;;) { const w = stack.pop(); onStack.delete(w); scc.push(w); if (w === v) break; }
          if (scc.length > 1) out.push(scc.sort());
        }
      }
    }
  }
  return out.sort((a, b) => b.length - a.length || a[0].localeCompare(b[0]));
}

const domainOf = file => {
  const parts = file.split('/');
  if (parts.length === 1) return '(root)';
  return parts[0] === 'editor' && parts.length > 2 ? `editor/${parts[1]}` : parts[0];
};

/** 分析一组源码。sources: {相对路径: 源码}；roots: 视为入口的文件。 */
export function analyzeSources(sources, { roots = [] } = {}) {
  const files = Object.keys(sources).sort().map(file => analyzeFile(file, sources[file]));
  const byName = new Map();
  const entry = name => byName.get(name) ?? byName.set(name, { name, providers: [], readers: {} }).get(name);
  for (const f of files) {
    for (const p of f.provides) entry(p.name).providers.push({ file: f.file, ...p });
    for (const w of f.writes) entry(w.name).providers.push({ file: f.file, via: 'assign', kind: w.kind, phase: w.phase, deps: w.deps });
  }
  for (const f of files) for (const r of f.reads) {
    const readers = entry(r.name).readers;
    (readers[f.file] ??= { install: 0, init: 0, call: 0 })[r.phase]++;
  }
  const bindings = [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
  const provider = b => b.providers.find(p => p.via === 'bind') ?? b.providers[0];

  // 文件图：A → B 表示 A 读取了 B 提供的名称。early 边只含安装与初始化阶段的读取，以及派生值的依赖。
  const all = new Map(), early = new Map();
  const add = (map, a, b) => { if (a !== b) (map.get(a) ?? map.set(a, new Set()).get(a)).add(b); };
  for (const b of bindings) {
    const p = provider(b);
    if (!p) continue;
    for (const [file, counts] of Object.entries(b.readers)) {
      add(all, file, p.file);
      if (counts.install || counts.init) add(early, file, p.file);
    }
    for (const prov of b.providers) for (const dep of prov.deps ?? []) {
      const target = byName.get(dep) && provider(byName.get(dep));
      if (target) { add(all, prov.file, target.file); add(early, prov.file, target.file); }
    }
  }
  const names = files.map(f => f.file);
  const installFiles = files.filter(f => f.installs.length).map(f => f.file);

  // 可达性：从入口沿"读取"方向遍历
  const reached = new Set(roots.filter(r => names.includes(r)));
  for (const queue = [...reached]; queue.length;) for (const next of all.get(queue.pop()) ?? []) if (!reached.has(next)) { reached.add(next); queue.push(next); }
  const unreachable = roots.length ? installFiles.filter(f => !reached.has(f)).sort() : [];

  // 目录聚类：每个文件与各领域之间的边数；最强关联不在自己目录的文件列为不一致
  const misfits = [];
  const domainEdges = new Map();
  for (const file of installFiles) {
    const weight = new Map();
    const bump = other => { const d = domainOf(other); weight.set(d, (weight.get(d) ?? 0) + 1); };
    for (const to of all.get(file) ?? []) { bump(to); const k = `${domainOf(file)} → ${domainOf(to)}`; domainEdges.set(k, (domainEdges.get(k) ?? 0) + 1); }
    for (const [from, tos] of all) if (tos.has(file)) bump(from);
    const own = domainOf(file);
    const best = [...weight].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
    if (best && best[0] !== own && best[1] > 2 * (weight.get(own) ?? 0) && best[1] >= 4) misfits.push({ file, own, strongest: best[0], edges: best[1], ownEdges: weight.get(own) ?? 0 });
  }

  // 每个领域的迁移难度：函数可直接导出；纯值可提到模块作用域；派生值与可变值依赖初始化顺序或运行时写入
  const difficulty = new Map();
  const unread = [], unprovided = [], multi = [], sensitive = [];
  for (const b of bindings) {
    const p = provider(b);
    const readerCount = Object.keys(b.readers).length;
    if (!p) { unprovided.push(b.name); continue; }
    if (b.providers.length > 1) multi.push({ name: b.name, files: [...new Set(b.providers.map(x => x.file))].sort() });
    if (!readerCount) unread.push({ name: b.name, file: p.file });
    const d = difficulty.get(domainOf(p.file)) ?? difficulty.set(domainOf(p.file), { functions: 0, pure: 0, derived: 0, mutable: 0, other: 0 }).get(domainOf(p.file));
    const cls = p.kind === 'function' || p.kind === 'class' ? 'functions' : p.mutable ? 'mutable' : (p.deps?.length ? 'derived' : p.kind === 'value' || p.kind === 'function-value' ? 'pure' : 'other');
    d[cls]++;
    if (cls === 'derived' || cls === 'mutable') sensitive.push({ name: b.name, file: p.file, class: cls, deps: p.deps ?? [] });
  }

  return {
    summary: {
      files: files.length, installFiles: installFiles.length, bindings: bindings.length,
      reads: files.reduce((n, f) => n + f.reads.length, 0),
      earlyReads: files.reduce((n, f) => n + f.reads.filter(r => r.phase !== 'call').length, 0),
      opaqueRegistryUses: files.reduce((n, f) => n + f.opaque, 0),
      unreadBindings: unread.length, unprovidedNames: unprovided.length, sensitiveBindings: sensitive.length,
    },
    bindings, unread, unprovided, multi, sensitive, unreachable, misfits,
    cycles: { all: cycles(names, all), early: cycles(names, early) },
    edges: Object.fromEntries([...all].sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => [k, [...v].sort()])),
    earlyEdges: Object.fromEntries([...early].sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => [k, [...v].sort()])),
    domainEdges: Object.fromEntries([...domainEdges].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))),
    difficulty: Object.fromEntries([...difficulty].sort((a, b) => a[0].localeCompare(b[0]))),
  };
}

function report(pkg, r) {
  const lines = [];
  const table = (head, rows) => { lines.push(`| ${head.join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`, ...rows.map(row => `| ${row.join(' | ')} |`), ''); };
  lines.push(`# ${pkg} 依赖地图`, '', '由 `scripts/runtime-deps.mjs` 生成，可随时重新生成，不手工修改。', '', '## 概况', '');
  table(['指标', '数值'], Object.entries(r.summary));
  lines.push('## 各领域的绑定与迁移难度', '', '函数可直接导出；纯值可提到模块作用域；派生值在初始化时读取其他绑定；可变值在运行时被重新赋值。', '');
  table(['领域', '函数', '纯值', '派生值', '可变值', '其他'], Object.entries(r.difficulty).map(([d, c]) => [d, c.functions, c.pure, c.derived, c.mutable, c.other]));
  lines.push('## 循环依赖', '', `全部读取构成的循环：${r.cycles.all.length} 组，最大 ${r.cycles.all[0]?.length ?? 0} 个文件。`, `初始化阶段读取构成的循环：${r.cycles.early.length} 组。这些是改为 import 时真正受顺序约束的部分。`, '');
  for (const scc of r.cycles.early) lines.push(`- ${scc.length} 个文件：${scc.slice(0, 12).join('、')}${scc.length > 12 ? ' …' : ''}`);
  lines.push('', '## 领域之间的依赖（前 40）', '');
  table(['方向', '文件级边数'], Object.entries(r.domainEdges).filter(([k]) => { const [a, b] = k.split(' → '); return a !== b; }).slice(0, 40));
  lines.push('## 与所在目录不一致的文件', '', '最强关联的领域不是自己所在的目录。', '');
  table(['文件', '所在', '最强关联', '边数', '本目录边数'], r.misfits.map(m => [m.file, m.own, m.strongest, m.edges, m.ownEdges]));
  lines.push('## 不可达文件（候选）', '', '从入口沿读取方向无法到达。初始化函数可能有副作用，删除前需要逐个确认。', '');
  for (const f of r.unreachable) lines.push(`- ${f}`);
  lines.push('', '## 没有读取方的绑定', '', `共 ${r.unread.length} 个，按文件计数（前 40）：`, '');
  const perFile = new Map();
  for (const u of r.unread) perFile.set(u.file, (perFile.get(u.file) ?? 0) + 1);
  table(['文件', '数量'], [...perFile].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 40));
  lines.push('## 有多个提供方的名称', '');
  for (const m of r.multi) lines.push(`- ${m.name}：${m.files.join('、')}`);
  lines.push('', '## 被读取但没有提供方的名称', '', r.unprovided.join('、') || '无', '');
  return lines.join('\n');
}

function collect(dir, base = dir, out = {}) {
  for (const name of fs.readdirSync(dir).sort()) {
    const full = path.join(dir, name);
    const rel = path.relative(base, full);
    if (fs.statSync(full).isDirectory()) { if (!name.startsWith('.') && name !== 'generated') collect(full, base, out); }
    else if (SOURCE.test(name) && !SKIP.test(`/${rel}`)) out[rel] = fs.readFileSync(full, 'utf8');
  }
  return out;
}

const ROOTS = {
  'design-runtime': ['application/main.ts'],
  'design-system-runtime': ['bootstrap.tsx'],
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const pkg = args.find(a => !a.startsWith('--')) ?? 'design-runtime';
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const outFlag = args.indexOf('--out');
  const out = outFlag >= 0 ? path.resolve(args[outFlag + 1]) : path.join(root, 'output', 'runtime-deps', pkg);
  const result = analyzeSources(collect(path.join(root, 'packages', pkg, 'src')), { roots: ROOTS[pkg] ?? [] });
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'deps.json'), JSON.stringify(result, null, 1));
  fs.writeFileSync(path.join(out, 'report.md'), report(pkg, result));
  console.log(JSON.stringify(result.summary, null, 1));
  console.log(`写入 ${path.relative(root, out)}/report.md 与 deps.json`);
}
