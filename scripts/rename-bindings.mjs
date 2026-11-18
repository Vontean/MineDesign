// 按作用域安全地给局部绑定改名，只改标识符本身，不改任何行为。
// 用法：
//   node scripts/rename-bindings.mjs list <文件> [--from <行> --to <行>] [--generic] [--all]
//     列出待改名的绑定：键（名字@行:列）、种类、所在函数、声明行与几处用法，输出 TSV。
//     默认只列机器名；--generic 另外列出 input、options 这类还原时套上的参数名；--all 列出全部局部绑定。
//   node scripts/rename-bindings.mjs apply <改名表.json> [--write]
//   node scripts/rename-bindings.mjs unwrap <文件...> [--write]   去掉 `(0, f)(…)` 写法
//     改名表：{"<文件>": {"<名字@行>" 或 "<名字@行:列>": "新名字"}}。
// 不改导出名与导入名：改名后自动写成 `新名 as 旧名` 或 `旧名 as 新名`，模块对外接口不变。
// 用 scripts/check-equivalence.mjs 校验改名前后编译结果在 α 等价意义下相同。
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { NUMBERED, DERIVED } from './readability.mjs';

const require = createRequire(import.meta.url);
const { parser, traverse: traversePkg } = require('@babel/standalone').packages;
const traverse = traversePkg.default ?? traversePkg;

const RESERVED = new Set(('break case catch class const continue debugger default delete do else enum export extends false finally for function if import in instanceof new null return super switch this throw true try typeof var void while with yield let static implements interface package private protected public await async of get set arguments eval undefined NaN Infinity any unknown never object string number boolean symbol bigint type namespace declare readonly abstract').split(' '));
const IDENT = /^[A-Za-z_$][\w$]*$/;
const parse = source => parser.parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'], errorRecovery: false });
const GENERIC = /^(?:input|options|context|value|extra|argument|detail|callback|fillStyle|innerHTML|shaft)$/;
// 机器名：带编号的通用名、模块名拼出的编号名，以及以数字结尾的名字（x1、y2 这类坐标除外）
const isMachine = name => new RegExp(`^(?:${NUMBERED.source})$`).test(name) || new RegExp(`^(?:${DERIVED.source})$`).test(name) || /^_extraArguments\d+$/.test(name) || (/[A-Za-z]{3,}\d+$/.test(name) && !/(?:8|16|32|64|128|256|512)$/.test(name));
// 还原时套上的通用参数名：多数与实际用途不符，--generic 时一起列出
const isGeneric = (name, binding) => GENERIC.test(name) && binding.kind === 'param';

/** 收集文件里的全部绑定（不含模块顶层被导出的名字由调用方决定是否允许）。 */
function bindingsOf(ast) {
  const all = [];
  traverse(ast, {
    Scopable(p) {
      for (const [name, binding] of Object.entries(p.scope.bindings)) {
        if (all.some(b => b.binding === binding)) continue;
        all.push({ name, binding, scope: p.scope });
      }
    },
  });
  return all;
}

/** 以 `export function/const/class` 直接导出的绑定：改名会改变模块接口，属于跨文件改名，这里不处理。 */
const isExportedDeclaration = binding => {
  const p = binding.path;
  return p.parentPath?.isExportNamedDeclaration() || p.parentPath?.isExportDefaultDeclaration() || (p.isVariableDeclarator() && p.parentPath?.parentPath?.isExportNamedDeclaration());
};

const keyOf = (name, id) => `${name}@${id.loc.start.line}:${id.loc.start.column}`;

/** 绑定的全部出现位置：声明、引用、赋值目标。 */
function occurrences(binding, name) {
  const ids = new Set([binding.identifier]);
  for (const r of binding.referencePaths) ids.add(r.node);
  for (const v of binding.constantViolations) {
    if (v.isAssignmentExpression() || v.isForXStatement()) {
      const target = v.isAssignmentExpression() ? v.get('left') : v.get('left');
      for (const id of Object.values(target.getBindingIdentifiers?.() ?? {})) if (id.name === name) ids.add(id);
    } else if (v.isUpdateExpression()) ids.add(v.node.argument);
    else if (v.isIdentifier()) ids.add(v.node);
    else for (const id of Object.values(v.getBindingIdentifiers?.() ?? {})) if (id.name === name) ids.add(id);
  }
  return [...ids].filter(n => n && (n.type === 'Identifier' || n.type === 'JSXIdentifier') && n.name === name);
}

/**
 * 一个作用域及其子作用域里会被名字解析看到的全部绑定与全局引用。
 * 属性键、成员访问的属性名、JSX 属性名不是绑定，不算冲突。
 */
function visibleUnder(scope) {
  const bindings = new Set();
  const globals = new Set();
  const visitScope = s => { for (const b of Object.values(s.bindings)) bindings.add(b); };
  visitScope(scope);
  const walker = {
    Scopable(p) { visitScope(p.scope); },
    Identifier(p) {
      if (!p.isReferencedIdentifier()) return;
      if (!p.scope.getBinding(p.node.name)) globals.add(p.node.name);
    },
    JSXIdentifier(p) {
      if (p.parentPath.isJSXAttribute() || (p.parentPath.isJSXMemberExpression() && p.parentKey === 'property')) return;
      if (!p.scope.getBinding(p.node.name) && /^[A-Z]/.test(p.node.name)) globals.add(p.node.name);
    },
  };
  if (scope.path.isProgram()) traverse(scope.path.node, walker, scope);
  else scope.path.traverse(walker);
  // 外层绑定也不能被遮住
  for (let s = scope.parent; s; s = s.parent) visitScope(s);
  return { bindings, globals };
}

const lineText = (lines, line) => (lines[line - 1] ?? '').trim().replace(/\t/g, ' ').slice(0, 160);

function ownerName(p) {
  const fn = p.getFunctionParent();
  if (!fn) return '(模块)';
  const node = fn.node;
  if (node.id?.name) return `${node.id.name}:${node.loc.start.line}`;
  const parent = fn.parentPath;
  if (parent?.isVariableDeclarator() && parent.node.id.type === 'Identifier') return `${parent.node.id.name}:${node.loc.start.line}`;
  return `(匿名):${node.loc.start.line}`;
}

export function listBindings(source, { from = 0, to = Infinity, all = false, generic = false } = {}) {
  const ast = parse(source);
  const lines = source.split('\n');
  const rows = [];
  for (const { name, binding } of bindingsOf(ast)) {
    const id = binding.identifier;
    if (!id?.loc || id.loc.start.line < from || id.loc.start.line > to) continue;
    if (isExportedDeclaration(binding)) continue;
    if (!all && !isMachine(name) && !(generic && isGeneric(name, binding))) continue;
    const uses = [...new Set(binding.referencePaths.map(r => r.node.loc.start.line))].slice(0, 3);
    rows.push({
      key: keyOf(name, id),
      kind: binding.kind,
      owner: ownerName(binding.path),
      refs: binding.referencePaths.length,
      decl: lineText(lines, id.loc.start.line),
      uses: uses.map(l => `${l}: ${lineText(lines, l)}`),
    });
  }
  return rows.sort((a, b) => Number(a.key.split('@')[1].split(':')[0]) - Number(b.key.split('@')[1].split(':')[0]));
}

/** 应用一个文件的改名表。同一张表里的改名一起判断冲突：被改走的旧名字可以被别的绑定使用。返回 {code, renamed, problems}。 */
export function applyRenames(source, renames) {
  const ast = parse(source);
  const problems = [];
  const entries = bindingsOf(ast);
  const plan = new Map(); // binding → {name, newName, key}
  for (const [rawKey, newName] of Object.entries(renames)) {
    const [name, pos] = rawKey.split('@');
    const [line, col] = (pos ?? '').split(':').map(Number);
    const matches = entries.filter(e => e.name === name && e.binding.identifier?.loc?.start.line === line && (col === undefined || Number.isNaN(col) || e.binding.identifier.loc.start.column === col));
    if (matches.length !== 1) { problems.push(`${rawKey}：${matches.length ? '有多个同名绑定，请加列号' : '找不到这个绑定'}`); continue; }
    if (!IDENT.test(newName) || RESERVED.has(newName)) { problems.push(`${rawKey}：新名字不合法：${newName}`); continue; }
    if (isExportedDeclaration(matches[0].binding)) { problems.push(`${rawKey}：直接导出的声明不能在这里改名（会改变模块接口）`); continue; }
    if (newName !== name) plan.set(matches[0].binding, { name, newName, key: rawKey });
  }
  // 在 JSX 里当作标签使用的绑定，新名字不能以小写字母开头，否则会被当成原生元素
  for (const [binding, item] of [...plan]) {
    if (/^[a-z]/.test(item.newName) && binding.referencePaths.some(r => r.node.type === 'JSXIdentifier')) {
      problems.push(`${item.key}：它在 JSX 里当作组件标签使用，新名字要以大写字母开头`);
      plan.delete(binding);
    }
  }
  const effective = b => plan.get(b)?.newName ?? Object.entries(b.scope.bindings).find(([, x]) => x === b)?.[0];
  const rejected = new Set();
  for (const [binding, item] of plan) {
    const { bindings, globals } = visibleUnder(binding.scope);
    let clash = globals.has(item.newName) ? `全局名 ${item.newName}` : null;
    if (!clash) for (const other of bindings) if (other !== binding && !rejected.has(other) && effective(other) === item.newName) { clash = `已有绑定 ${item.newName}`; break; }
    if (clash) { problems.push(`${item.key}：新名字与${clash}冲突`); rejected.add(binding); }
  }
  for (const b of rejected) plan.delete(b);
  const edits = [];
  for (const [binding, { name, newName }] of plan) {
    for (const id of occurrences(binding, name)) {
      // 标识符节点的范围包含类型标注，只替换名字本身
      const end = id.start + name.length;
      const info = findParentInfo(ast, id);
      const text = info?.type === 'shorthand-property' ? `${name}: ${newName}` : info?.type === 'export-shorthand' ? `${newName} as ${name}` : info?.type === 'import-shorthand' ? `${name} as ${newName}` : newName;
      edits.push({ start: id.start, end, text });
    }
  }
  const unique = new Map();
  for (const e of edits) if (!unique.has(e.start)) unique.set(e.start, e);
  const sorted = [...unique.values()].sort((a, b) => a.start - b.start);
  let code = '', at = 0;
  for (const e of sorted) {
    if (e.start < at) { problems.push(`位置 ${e.start} 有重叠的改动`); continue; }
    code += source.slice(at, e.start) + e.text;
    at = e.end;
  }
  code += source.slice(at);
  try { parse(code); } catch (error) { problems.push(`改名后无法解析：${error.message}`); }
  return { code, renamed: plan.size, problems };
}

// 标识符所在的特殊语法位置：对象简写、导出简写、导入简写
let parentIndex = null, parentIndexAst = null;
function findParentInfo(ast, id) {
  if (parentIndexAst !== ast) {
    parentIndex = new Map();
    parentIndexAst = ast;
    traverse(ast, {
      ObjectProperty(p) {
        if (p.node.shorthand && p.node.key.type === 'Identifier') {
          let value = p.node.value;
          if (value.type === 'AssignmentPattern') value = value.left;
          if (value.type === 'Identifier') parentIndex.set(value.start, { type: 'shorthand-property' });
        }
      },
      ExportSpecifier(p) {
        const { local, exported } = p.node;
        if (exported.type === 'Identifier' && local.start === exported.start) parentIndex.set(local.start, { type: 'export-shorthand' });
      },
      ImportSpecifier(p) {
        const { local, imported } = p.node;
        if (imported.type === 'Identifier' && local.start === imported.start) parentIndex.set(local.start, { type: 'import-shorthand' });
      },
    });
  }
  return parentIndex.get(id.start);
}

/** 去掉打包器留下的 `(0, f)(…)`：f 是标识符时与 `f(…)` 完全相同。成员形式 `(0, a.f)(…)` 会改变 this，不处理。 */
export function unwrapCalls(source) {
  const ast = parse(source);
  const edits = [];
  traverse(ast, {
    'CallExpression|OptionalCallExpression'(p) {
      const callee = p.node.callee;
      if (callee.type !== 'SequenceExpression' || callee.expressions.length !== 2) return;
      const [zero, fn] = callee.expressions;
      if (zero.type !== 'NumericLiteral' || zero.value !== 0 || fn.type !== 'Identifier') return;
      const open = source.lastIndexOf('(', zero.start), close = source.indexOf(')', fn.end);
      if (open < 0 || close < 0 || source.slice(open + 1, zero.start).trim() !== '' || source.slice(fn.end, close).trim() !== '') return;
      edits.push({ start: open, end: close + 1, text: fn.name });
    },
  });
  edits.sort((a, b) => a.start - b.start);
  let code = '', at = 0;
  for (const e of edits) { if (e.start < at) continue; code += source.slice(at, e.start) + e.text; at = e.end; }
  code += source.slice(at);
  parse(code);
  return { code, count: edits.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [command, target, ...rest] = process.argv.slice(2);
  if (command === 'unwrap') {
    let total = 0;
    for (const file of [target, ...rest].filter(f => !f.startsWith('--'))) {
      const { code, count } = unwrapCalls(fs.readFileSync(file, 'utf8'));
      if (count && process.argv.includes('--write')) fs.writeFileSync(file, code);
      total += count;
    }
    console.log(`去掉 ${total} 处 (0, f)(…)${process.argv.includes('--write') ? '' : '（未写入；加 --write 写回）'}`);
    process.exit(0);
  }
  const flag = name => { const i = rest.indexOf(name); return i >= 0 ? rest[i + 1] : undefined; };
  if (command === 'list') {
    const rows = listBindings(fs.readFileSync(target, 'utf8'), { from: Number(flag('--from') ?? 0), to: Number(flag('--to') ?? Infinity), all: rest.includes('--all'), generic: rest.includes('--generic') });
    console.log('键\t种类\t所在函数\t引用数\t声明\t用法');
    for (const r of rows) console.log([r.key, r.kind, r.owner, r.refs, r.decl, r.uses.join(' | ')].join('\t'));
    console.error(`共 ${rows.length} 个绑定`);
  } else if (command === 'apply') {
    const table = JSON.parse(fs.readFileSync(target, 'utf8'));
    let total = 0, failed = 0;
    for (const [file, renames] of Object.entries(table)) {
      const { code, renamed, problems } = applyRenames(fs.readFileSync(file, 'utf8'), renames);
      for (const p of problems) console.log(`${file}：${p}`);
      failed += problems.length;
      total += renamed;
      if (rest.includes('--write') && !problems.some(p => p.startsWith('改名后无法解析') || p.startsWith('位置'))) fs.writeFileSync(file, code);
    }
    console.log(`改名 ${total} 个，问题 ${failed} 个${rest.includes('--write') ? '' : '（未写入；加 --write 写回）'}`);
    process.exitCode = failed ? 1 : 0;
  } else {
    console.log('用法：rename-bindings.mjs list <文件> | apply <改名表.json> [--write]');
    process.exitCode = 2;
  }
}
