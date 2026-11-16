// 把巨型函数里的大段内部函数提到模块作用域，并显式列出它依赖的外层变量。
// 原位置留下一个转发函数，传入按需取值的依赖对象；提出去的函数每次用到外层变量时才读取，时机与原闭包相同。
// 用法：node scripts/hoist-closures.mjs <文件> [--min-lines 60] [--max-deps 40] [--names <json>] [--write]
//   --names 是 {"<起始行>": {"name": "函数名", "doc": "一句说明"}}，没有给名字的函数用 <主函数名>Part<行号>。
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { parser, traverse: traversePkg } = require('@babel/standalone').packages;
const traverse = traversePkg.default ?? traversePkg;

/**
 * 分析并改写源码。返回 {code, hoisted: [{line, lines, name, deps}], skipped: [{line, reason}]}。
 */
export function hoistClosures(source, { minLines = 60, maxDeps = 40, names = {} } = {}) {
  const ast = parser.parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
  // 主函数：文件里最大的函数声明
  let main;
  traverse(ast, {
    FunctionDeclaration(p) {
      if (!main || p.node.end - p.node.start > main.node.end - main.node.start) main = p;
      p.skip();
    },
  });
  const outer = main.scope;
  const moduleNames = new Set(Object.keys(main.parentPath.scope.bindings));
  const hoisted = [], skipped = [], edits = [], blocks = [];

  main.traverse({
    Function(p) {
      const lines = p.node.loc.end.line - p.node.loc.start.line + 1;
      if (lines < minLines) return;
      // 只处理直接位于主函数下的函数；它内部的函数随它一起移动
      p.skip();
      const line = p.node.loc.start.line;
      const skip = reason => { skipped.push({ line, lines, reason }); };
      if (p.node.generator) return skip('生成器函数');
      const deps = new Set();
      const uses = []; // 函数内每一处对外层变量的引用
      let blocked = null;
      // this 与 arguments 属于最近的非箭头函数；只有它严格位于本函数内部时才不受提取影响
      const ownedInside = q => {
        const owner = q.findParent(x => x.isFunction() && !x.isArrowFunctionExpression());
        return !!owner && owner.node !== p.node && !!owner.findParent(y => y.node === p.node);
      };
      p.traverse({
        ThisExpression(q) { if (!ownedInside(q)) blocked ??= '使用了 this'; },
        Identifier(q) {
          if (q.node.name === 'arguments' && q.isReferencedIdentifier() && !q.scope.getBinding('arguments')) {
            if (!ownedInside(q)) blocked ??= '使用了 arguments';
            return;
          }
          const written = (q.parentPath.isAssignmentExpression() && q.parentKey === 'left') || q.parentPath.isUpdateExpression();
          if (!q.isReferencedIdentifier() && !written) return;
          const binding = q.scope.getBinding(q.node.name);
          if (!binding) return;
          // 绑定在本函数内部的不算
          for (let s = binding.scope; s; s = s.parent) if (s === p.scope) return;
          if (binding.scope !== outer) return;
          if (written) blocked ??= `给外层变量赋值：${q.node.name}`;
          deps.add(q.node.name);
          const shorthand = q.parentPath.isObjectProperty({ shorthand: true }) && q.parentKey === 'value';
          uses.push({ start: q.node.start, end: q.node.start + q.node.name.length, name: q.node.name, shorthand });
        },
        JSXIdentifier(q) {
          if (q.parentPath.isJSXAttribute() || (q.parentPath.isJSXMemberExpression() && q.parentKey === 'property')) return;
          const binding = q.scope.getBinding(q.node.name);
          if (!binding || binding.scope !== outer) return;
          for (let s = binding.scope; s; s = s.parent) if (s === p.scope) return;
          deps.add(q.node.name);
          uses.push({ start: q.node.start, end: q.node.end, name: q.node.name, shorthand: false });
        },
      });
      if (!p.isArrowFunctionExpression() && p.node.id) blocked ??= '具名函数表达式';
      if (blocked) return skip(blocked);
      if (deps.size > maxDeps) return skip(`依赖 ${deps.size} 个外层变量`);

      let name = names[line]?.name ?? `${main.node.id.name}Part${line}`;
      name = name.replace(/^[A-Z]/, c => c.toLowerCase());
      while (moduleNames.has(name) || outer.hasOwnBinding(name)) name += '_';
      moduleNames.add(name);
      const depList = [...deps].sort();
      // 依赖对象的参数名不能与函数内任何名称冲突
      const taken = new Set();
      p.traverse({ Scopable(q) { for (const n of Object.keys(q.scope.bindings)) taken.add(n); }, Identifier(q) { taken.add(q.node.name); } });
      let depsName = 'deps';
      while (taken.has(depsName) || deps.has(depsName)) depsName += '_';
      // 函数内对外层变量的每次引用改为读取依赖对象的属性，读取时机与原闭包完全相同
      const render = (start, end) => {
        let out = '', at = start;
        for (const u of uses.filter(u => u.start >= start && u.end <= end).sort((x, y) => x.start - y.start)) {
          out += source.slice(at, u.start) + (u.shorthand ? `${u.name}: ${depsName}.${u.name}` : `${depsName}.${u.name}`);
          at = u.end;
        }
        return out + source.slice(at, end);
      };
      const params = p.node.params.length ? render(p.node.params[0].start, p.node.params[p.node.params.length - 1].end) : '';
      const returnType = p.node.returnType ? source.slice(p.node.returnType.start, p.node.returnType.end) : '';
      const bodyText = render(p.node.body.start, p.node.body.end);
      const body = p.node.body.type === 'BlockStatement' ? bodyText : `{\n  return ${bodyText};\n}`;
      const doc = names[line]?.doc ? `/** ${names[line].doc} */\n` : '';
      const depsType = depList.length ? `{ ${depList.map(d => `readonly ${d}: Dynamic`).join('; ')} }` : 'Record<string, never>';
      blocks.push(`${doc}${p.node.async ? 'async ' : ''}function ${name}(${depsName}: ${depsType}${params ? `, ${params}` : ''})${returnType} ${body}`);
      // 转发函数传入一个按需取值的对象：外层变量只在被用到的那一刻读取
      const getters = depList.map(d => `get ${d}() { return ${d}; }`).join(', ');
      edits.push({ start: p.node.start, end: p.node.end, text: `(...args: Dynamic[]): Dynamic => (${name} as Dynamic)({ ${getters} }, ...args)` });
      hoisted.push({ line, lines, name, deps: depList });
    },
  });

  // 提出去的函数放在主函数之后
  edits.push({ start: main.node.end, end: main.node.end, text: blocks.length ? `\n\n${blocks.join('\n\n')}\n` : '' });
  edits.sort((a, b) => a.start - b.start);
  let code = '', at = 0;
  for (const e of edits) { code += source.slice(at, e.start) + e.text; at = e.end; }
  code += source.slice(at);
  parser.parse(code, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
  return { code, hoisted, skipped, main: main.node.id.name };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const flag = name => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : undefined; };
  const minLines = Number(flag('--min-lines') ?? 60), maxDeps = Number(flag('--max-deps') ?? 40);
  const namesFile = flag('--names');
  const write = args.includes('--write');
  const file = args.find(a => !a.startsWith('--'));
  const source = fs.readFileSync(file, 'utf8');
  const { code, hoisted, skipped, main } = hoistClosures(source, { minLines, maxDeps, names: namesFile ? JSON.parse(fs.readFileSync(namesFile, 'utf8')) : {} });
  const moved = hoisted.reduce((n, h) => n + h.lines, 0);
  console.log(`${main}：提出 ${hoisted.length} 个函数，共 ${moved} 行；跳过 ${skipped.length} 个`);
  for (const s of skipped) console.log(`跳过 第 ${s.line} 行（${s.lines} 行）：${s.reason}`);
  if (args.includes('--list')) for (const h of hoisted) console.log(`${h.line}\t${h.lines}\t${h.deps.length}\t${h.name}`);
  if (write) fs.writeFileSync(file, code);
  else console.log('未写入文件；加 --write 写回');
}
