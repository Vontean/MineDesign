// 把一个文件里的顶层函数按分组移到子目录的独立文件中，并补齐两边的 import。
// 用法：node scripts/split-functions.mjs <文件> --groups <json> [--write]
//   --groups 是 {"<函数名>": "<分组>"}；每个分组生成 <文件名去扩展名>/<分组>.tsx。
// 被移走的函数若用到原文件的顶层变量，会从原文件导入（循环导入；这些函数只在调用时读取，所以安全）。
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { parser, traverse: traversePkg } = require('@babel/standalone').packages;
const traverse = traversePkg.default ?? traversePkg;

/** 返回 {main: 新的原文件内容, files: {相对子路径: 内容}, moved: 数量, problems: [], kept: [留在原文件的函数]}。 */
export function splitFunctions(source, fileName, groups) {
  const ast = parser.parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
  const base = fileName.replace(/\.tsx?$/, '');
  const problems = [];
  let program;
  traverse(ast, { Program(p) { program = p; p.stop(); } });
  const bindings = program.scope.bindings;
  const exported = new Set();
  for (const s of ast.program.body) {
    if (s.type !== 'ExportNamedDeclaration') continue;
    for (const spec of s.specifiers ?? []) if (spec.local.name === spec.exported.name) exported.add(spec.local.name);
    if (s.declaration?.id) exported.add(s.declaration.id.name);
    for (const d of s.declaration?.declarations ?? []) exported.add(d.id.name);
  }
  const importText = (binding, local) => {
    const spec = binding.path.node, from = binding.path.parent.source.value;
    // 子目录比原文件深一层，相对路径多加一级
    const target = from.startsWith('.') ? path.posix.normalize(`../${from}`).replace(/^(?!\.)/, './') : from;
    if (spec.type === 'ImportDefaultSpecifier') return `import ${local} from "${target}";`;
    if (spec.type === 'ImportNamespaceSpecifier') return `import * as ${local} from "${target}";`;
    const imported = spec.imported.name ?? spec.imported.value;
    const type = spec.importKind === 'type' || binding.path.parent.importKind === 'type' ? 'type ' : '';
    return `import { ${type}${imported === local ? local : `${imported} as ${local}`} } from "${target}";`;
  };

  const byGroup = new Map();
  const removed = [], kept = [];
  program.get('body').forEach(statement => {
    const fn = statement.isFunctionDeclaration() ? statement : null;
    const group = fn && groups[fn.node.id.name];
    if (!group) return;
    const imports = new Set(), locals = new Set();
    // 给原文件顶层变量赋值的函数不能移走：导入的绑定是只读的
    let writesLocal = null;
    fn.traverse({
      Identifier(q) {
        const written = (q.parentPath.isAssignmentExpression() && q.parentKey === 'left') || q.parentPath.isUpdateExpression();
        if (written && bindings[q.node.name] && q.scope.getBinding(q.node.name) === bindings[q.node.name]) writesLocal ??= q.node.name;
      },
    });
    if (writesLocal) { kept.push(`${fn.node.id.name}（给 ${writesLocal} 赋值）`); return; }
    const note = name => {
      const binding = bindings[name];
      if (!binding || name === fn.node.id.name) return;
      if (binding.path.parentPath?.isImportDeclaration()) imports.add(importText(binding, name));
      else if (groups[name]) problems.push(`${fn.node.id.name} 引用了另一个被移动的函数 ${name}`);
      else { locals.add(name); if (!exported.has(name)) problems.push(`原文件没有导出 ${name}（${fn.node.id.name} 需要）`); }
    };
    fn.traverse({
      Identifier(q) {
        // 值引用与类型引用都要补 import
        const typeRef = q.parentPath.isTSTypeReference() || q.parentPath.isTSQualifiedName() || q.parentPath.isTSTypeQuery();
        if (!q.isReferencedIdentifier() && !typeRef) return;
        if (q.scope.getBinding(q.node.name) === bindings[q.node.name]) note(q.node.name);
      },
      JSXIdentifier(q) {
        if (q.parentPath.isJSXAttribute() || (q.parentPath.isJSXMemberExpression() && q.parentKey === 'property')) return;
        if (q.scope.getBinding(q.node.name) === bindings[q.node.name]) note(q.node.name);
      },
    });
    const start = fn.node.leadingComments?.length ? fn.node.leadingComments[0].start : fn.node.start;
    const entry = byGroup.get(group) ?? byGroup.set(group, { imports: new Set(), locals: new Set(), blocks: [], names: [] }).get(group);
    for (const i of imports) entry.imports.add(i);
    for (const l of locals) entry.locals.add(l);
    entry.blocks.push(`export ${source.slice(start, fn.node.end)}`.replace(/^export (\/\*\*[\s\S]*?\*\/\n)/, '$1export '));
    entry.names.push(fn.node.id.name);
    removed.push({ start, end: fn.node.end });
  });

  const stem = path.posix.basename(base);
  const files = {};
  const mainImports = [];
  for (const [group, entry] of [...byGroup].sort((a, b) => a[0].localeCompare(b[0]))) {
    const lines = [...entry.imports].sort();
    if (entry.locals.size) lines.push(`import { ${[...entry.locals].sort().join(', ')} } from "../${stem}";`);
    files[`${stem}/${group}.tsx`] = `${lines.join('\n')}\n\n${entry.blocks.join('\n\n')}\n`;
    mainImports.push(`import { ${entry.names.sort().join(', ')} } from "./${stem}/${group}";`);
  }
  // 从原文件删除被移走的函数，并在最后一条 import 之后加入新的 import
  removed.sort((a, b) => b.start - a.start);
  let main = source;
  for (const r of removed) main = main.slice(0, r.start).replace(/\n+$/, '\n') + main.slice(r.end).replace(/^\n+/, '\n');
  const lastImport = [...ast.program.body].reverse().find(s => s.type === 'ImportDeclaration');
  main = `${main.slice(0, lastImport.end)}\n${mainImports.join('\n')}${main.slice(lastImport.end)}`;
  for (const code of [main, ...Object.values(files)]) parser.parse(code, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
  return { main, files, moved: removed.length, problems, kept };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const flag = name => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : undefined; };
  const groups = JSON.parse(fs.readFileSync(flag('--groups'), 'utf8'));
  const write = args.includes('--write');
  const file = args.find(a => !a.startsWith('--'));
  const { main, files, moved, problems, kept } = splitFunctions(fs.readFileSync(file, 'utf8'), file, groups);
  console.log(`移动 ${moved} 个函数到 ${Object.keys(files).length} 个文件`);
  for (const [name, code] of Object.entries(files)) console.log(`  ${name}：${code.split('\n').length} 行`);
  for (const k of kept) console.log(`留在原文件：${k}`);
  for (const p of problems) console.log(`需要处理：${p}`);
  if (write && !problems.length) {
    fs.writeFileSync(file, main);
    for (const [name, code] of Object.entries(files)) {
      const dest = path.join(path.dirname(file), name);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, code);
    }
  } else console.log(write ? '有未处理的问题，未写入' : '未写入文件；加 --write 写回');
}
