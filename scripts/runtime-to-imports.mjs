// 把 runtime 的注册表依赖改为真实 import（规格：docs/specs/runtime-modularization.md）。
// 对每个要迁移的文件：
//   1. 把安装函数里的声明提到模块作用域并导出；
//   2. 把对已迁移文件的注册表读取改成具名 import；
//   3. 安装函数保留绑定与初始化函数，未迁移的读取方继续经注册表工作。
// 用法：node scripts/runtime-to-imports.mjs <包名> <目录或文件>... [--write] [--out <dir>]
//       node scripts/runtime-to-imports.mjs <包名> --contract [--write] [--out <dir>]   全部迁移后删除注册表绑定
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { parser, traverse: traversePkg } = require('@babel/standalone').packages;
const traverse = traversePkg.default ?? traversePkg;

const MIGRATED = '/** @runtime-imports 声明已在模块作用域；安装函数只保留注册表绑定与初始化。 */';
const IDENT = /^[A-Za-z_$][\w$]*$/;
const parse = source => parser.parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] });

/** 找到安装函数及其顶层语句。 */
function findInstall(ast, source) {
  for (const stmt of ast.program.body) {
    const fn = stmt.type === 'ExportNamedDeclaration' ? stmt.declaration : null;
    if (fn?.type !== 'FunctionDeclaration' || fn.id.name === 'bindRuntimeValue') continue;
    const param = fn.params[0];
    if (param?.type !== 'Identifier') continue;
    const typed = param.typeAnnotation && source.slice(param.typeAnnotation.start, param.typeAnnotation.end).includes('RuntimeBindings');
    if (typed || /^install[A-Z]/.test(fn.id.name)) return { stmt, fn, param };
  }
  return null;
}

/** 顶层的 `runtime.NAME = 表达式`：直接写入注册表的提供方式。 */
function registryAssignment(expr, reg) {
  if (expr?.type !== 'AssignmentExpression' || expr.operator !== '=') return null;
  const left = expr.left;
  if (left.type !== 'MemberExpression' || left.computed || left.object.type !== 'Identifier' || left.object.name !== reg) return null;
  return { name: left.property.name, right: expr.right };
}

/** 读取一个文件提供的注册表名称：{名称: 本地变量名}。已迁移的文件同样可读。 */
export function providedNames(source) {
  const ast = parse(source);
  const install = findInstall(ast, source);
  const names = {};
  if (!install) return { names, migrated: false, installName: null };
  for (const stmt of install.fn.body.body) {
    const call = stmt.type === 'ExpressionStatement' ? stmt.expression : null;
    const assigned = registryAssignment(call, install.param.name);
    if (assigned) { names[assigned.name] = assigned.name; continue; }
    if (call?.type !== 'CallExpression' || call.callee.name !== 'bindRuntimeValue') continue;
    const [, name, getter] = call.arguments;
    if (name?.type !== 'StringLiteral' || !getter?.body) continue;
    // 取值是表达式（例如随界面语言变化的文案）时，导出一个访问函数 get_名称
    names[name.value] = getter.body.type === 'Identifier' ? getter.body.name : `get_${name.value}()`;
  }
  return { names, migrated: source.includes(MIGRATED), installName: install.fn.id.name };
}

/**
 * 迁移一个文件。
 * providers: {注册表名称: {file, local}}，只包含已迁移或本批迁移的文件提供的名称。
 * 返回 {code, report}；文件没有安装函数或已迁移时 code 为 null。
 */
export function migrateFile(file, source, providers) {
  const report = { file, hoisted: 0, imports: 0, replaced: 0, kept: 0, problems: [] };
  if (source.includes(MIGRATED)) return { code: null, report };
  const ast = parse(source);
  const install = findInstall(ast, source);
  if (!install) return { code: null, report };
  const { stmt: exportStmt, fn, param } = install;
  const reg = param.name;

  // 文件里出现过的全部标识符名，用来避免导入名与任何作用域的局部名冲突
  const used = new Set();
  const edits = []; // {start, end, text}
  const imports = new Map(); // 来源文件 → Map(导出名 → 本地别名)
  const moduleNames = new Set();
  let installPath;
  traverse(ast, {
    Program(p) {
      for (const name of Object.keys(p.scope.bindings)) moduleNames.add(name);
      for (const name of Object.keys(p.scope.globals)) used.add(name); // 导入名不能遮住全局对象
    },
    Scopable(p) { for (const name of Object.keys(p.scope.bindings)) used.add(name); },
    FunctionDeclaration(p) { if (p.node === fn) installPath = p; },
  });
  const installScope = installPath.scope;
  const registryBinding = installScope.getBinding(reg);
  const ownLocals = new Set(Object.keys(installScope.bindings).filter(n => n !== reg));

  // 提升后会与模块作用域已有的名称重复
  const renamed = {};
  for (const name of ownLocals) {
    if (!moduleNames.has(name)) continue;
    const binding = installScope.getBinding(name);
    let next = `${name}_local`;
    while (used.has(next)) next += '_';
    used.add(next);
    renamed[name] = next;
    const spots = [binding.identifier, ...binding.referencePaths.map(r => r.node), ...binding.constantViolations.map(v => v.node.left).filter(n => n?.type === 'Identifier' && n.name === name)];
    for (const node of new Set(spots)) edits.push({ start: node.start, end: node.end, text: next });
    for (const ref of binding.referencePaths) if (ref.parentPath.isObjectProperty({ shorthand: true })) report.problems.push(`改名遇到简写属性：${name}`);
  }

  const own = {}; // 本文件提供的名称 → 本地变量
  for (const [name, p] of Object.entries(providers)) if (p.file === file) own[name] = renamed[p.local] ?? p.local;
  const localOf = provider => renamed[provider.local] ?? provider.local;

  const relative = to => {
    let rel = path.posix.relative(path.posix.dirname(file), to).replace(/\.(tsx?|mjs)$/, '');
    return rel.startsWith('.') ? rel : `./${rel}`;
  };
  const importAs = (name, from, capital) => {
    const map = imports.get(from) ?? imports.set(from, new Map()).get(from);
    const key = `${name}|${capital ? 'C' : ''}`;
    if (map.has(key)) return map.get(key).alias;
    let alias = name;
    if (capital && !/^[A-Z]/.test(alias)) alias = `R_${alias}`;
    for (let n = 1; used.has(alias); n++) alias = `${name}_r${n === 1 ? '' : n}`;
    if (capital && !/^[A-Z]/.test(alias)) { alias = `R_${alias}`; for (let n = 2; used.has(alias); n++) alias = `R_${name}_${n}`; }
    used.add(alias);
    map.set(key, { name, alias });
    return alias;
  };
  /** 本地变量在这个位置是否仍指向安装函数作用域里的那个声明。 */
  const resolvesToOwn = (p, local) => p.scope.getBinding(local) === installScope.getBinding(local);

  const isRegistry = p => p.isIdentifier({ name: reg }) && p.scope.getBinding(reg) === registryBinding;
  const immediate = new Set(); // 在安装函数顶层直接读取注册表的语句
  installPath.traverse({
    MemberExpression(p) {
      if (!isRegistry(p.get('object'))) return;
      if (p.getFunctionParent().node === fn) immediate.add(p.getStatementParent().node);
      const prop = p.node.property;
      const name = !p.node.computed && prop.type === 'Identifier' ? prop.name : p.node.computed && prop.type === 'StringLiteral' ? prop.value : null;
      if (!name) { report.problems.push(`无法识别的注册表访问：第 ${p.node.loc.start.line} 行`); return; }
      const parent = p.parentPath;
      const written = (parent.isAssignmentExpression() && parent.node.left === p.node) || (parent.isUpdateExpression()) || (parent.isUnaryExpression({ operator: 'delete' }));
      const provider = providers[name];
      if (written || !provider) { report.kept++; return; }
      let text;
      if (provider.file === file) {
        if (!resolvesToOwn(p, provider.local)) { report.kept++; return; }
        text = localOf(provider);
      } else text = importAs(provider.exportName ?? name, provider.file, false);
      if (provider.accessor) text += '()';
      // `({ a: runtime.a })` 之外的简写不会出现；直接替换成员表达式
      edits.push({ start: p.node.start, end: p.node.end, text });
      report.replaced++;
    },
    JSXMemberExpression(p) {
      const obj = p.get('object');
      if (!obj.isJSXIdentifier({ name: reg })) return;
      const name = p.node.property.name;
      const provider = providers[name];
      if (!provider || provider.accessor) { report.kept++; return; }
      // 替换后若是单个小写标识符，会被当成原生标签，所以用大写别名
      const bare = !p.parentPath.isJSXMemberExpression();
      let text;
      if (provider.file === file) {
        if (p.scope.getBinding(provider.local) !== installScope.getBinding(provider.local) || (bare && !/^[A-Z]/.test(provider.local))) { report.kept++; return; }
        text = localOf(provider);
      } else text = importAs(provider.exportName ?? name, provider.file, bare);
      edits.push({ start: p.node.start, end: p.node.end, text });
      report.replaced++;
    },
  });

  // 多行模板字符串内部的行不能去缩进
  const protectedLines = new Set();
  traverse(ast, { TemplateLiteral(p) { for (let l = p.node.loc.start.line + 1; l <= p.node.loc.end.line; l++) protectedLines.add(l); } });
  edits.sort((a, b) => a.start - b.start);
  const render = (start, end) => {
    let out = '', at = start;
    for (const e of edits) { if (e.start < start || e.end > end) continue; out += source.slice(at, e.start) + e.text; at = e.end; }
    return out + source.slice(at, end);
  };
  const lineOf = offset => source.slice(0, offset).split('\n').length;
  const dedent = (text, firstLine) => text.split('\n').map((line, i) => (i > 0 && protectedLines.has(firstLine + i)) ? line : line.replace(/^ {2}/, '')).join('\n');

  const declarations = [], installBody = [];
  const body = fn.body.body;
  for (let i = 0; i < body.length; i++) {
    const s = body[i];
    // 语句前的注释随语句移动
    const start = s.leadingComments?.length ? s.leadingComments[0].start : s.start;
    const text = render(start, s.end);
    const assigned = s.type === 'ExpressionStatement' ? registryAssignment(s.expression, reg) : null;
    if (s.type === 'FunctionDeclaration' || s.type === 'ClassDeclaration' || s.type === 'TSDeclareFunction') { declarations.push(dedent(text, lineOf(start))); report.hoisted++; }
    else if (s.type === 'VariableDeclaration') {
      // 初始值在模块求值时执行，那时其他模块可能还没有初始化，所以不能读取注册表
      if (s.declarations.some(d => d.init) && immediate.has(s)) report.problems.push(`顶层变量的初始值读取了注册表：第 ${s.loc.start.line} 行`);
      declarations.push(dedent(text, lineOf(start))); report.hoisted++;
    } else if (assigned && providers[assigned.name]?.file === file) {
      // `runtime.NAME = 表达式` 改为模块级常量，安装函数里只留登记
      const { name, right } = assigned;
      if (source.slice(right.start, right.end).includes(`${reg}.`) && right.type !== 'ArrowFunctionExpression') report.problems.push(`赋值式提供读取了注册表：第 ${s.loc.start.line} 行`);
      if (right.type === 'Identifier' && moduleNames.has(right.name)) { own[name] = right.name; installBody.push(`  ${text}`); }
      else if (moduleNames.has(name) || ownLocals.has(name) || !IDENT.test(name)) { report.problems.push(`赋值式提供的名称不能直接导出：${name}`); installBody.push(`  ${text}`); delete own[name]; }
      else { declarations.push(`const ${name} = ${render(right.start, right.end)};`); installBody.push(`  ${reg}.${name} = ${name};`); report.hoisted++; }
    } else {
      const call = s.type === 'ExpressionStatement' && s.expression.type === 'CallExpression' && s.expression.callee.name === 'bindRuntimeValue';
      if (call) {
        const [, bound, getter] = s.expression.arguments;
        const accessor = bound?.type === 'StringLiteral' && providers[bound.value]?.accessor && providers[bound.value].file === file;
        if (accessor) {
          if (getter.body.type === 'BlockStatement') report.problems.push(`取值函数带语句块：${bound.value}`);
          else declarations.push(`function get_${bound.value}() {\n  return ${render(getter.body.start, getter.body.end)};\n}`);
        }
      }
      if (!call && s.type !== 'ReturnStatement') report.problems.push(`安装函数里的其他语句：第 ${s.loc.start.line} 行`);
      installBody.push(`  ${text}`);
    }
  }

  // 导出：注册表名称 → 本地变量
  const exportList = [];
  for (const [name, local] of Object.entries(own).sort((a, b) => a[0].localeCompare(b[0]))) {
    if (!IDENT.test(name)) { report.problems.push(`名称不是合法标识符：${name}`); continue; }
    const exportName = providers[name]?.exportName ?? name;
    exportList.push(local === exportName ? exportName : `${local} as ${exportName}`);
  }

  const importLines = [...imports].sort((a, b) => a[0].localeCompare(b[0])).map(([from, map]) => {
    const specs = [...map.values()].sort((a, b) => a.name.localeCompare(b.name)).map(({ name, alias }) => (alias === name ? name : `${name} as ${alias}`));
    report.imports += specs.length;
    return `import { ${specs.join(', ')} } from "${relative(from)}";`;
  });

  const header = source.slice(0, exportStmt.start);
  const signature = source.slice(exportStmt.start, fn.body.start);
  const paramText = source.slice(param.start, param.end);
  const registryType = param.typeAnnotation ? source.slice(param.typeAnnotation.start, param.typeAnnotation.end) : '';
  const code = [
    header.trimEnd(),
    ...importLines,
    '',
    MIGRATED,
    `var ${reg}${registryType};`,
    ...declarations,
    ...(exportList.length ? [`export {\n${exportList.map(e => `  ${e},`).join('\n')}\n};`] : []),
    `${signature.replace(paramText, `registry${registryType}`)}{`,
    `  ${reg} = registry;`,
    ...installBody,
    '}',
    source.slice(exportStmt.end).trim(),
  ].filter(part => part !== null).join('\n').replace(/\n+$/, '') + '\n';
  return { code, report };
}

function collect(dir, base = dir, out = []) {
  for (const name of fs.readdirSync(dir).sort()) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) { if (!name.startsWith('.') && name !== 'generated') collect(full, base, out); }
    else if (/\.tsx?$/.test(name) && !/\.test\.|\.d\.ts$/.test(name)) out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out;
}

/** 迁移一批文件。targets 是相对包 src 的目录或文件。 */
export function migrate(srcDir, targets, { write = false, out = null } = {}) {
  const files = collect(srcDir);
  const inTargets = f => targets.some(t => t === '.' || f === t || f.startsWith(t.endsWith('/') ? t : `${t}/`));
  const sources = Object.fromEntries(files.map(f => [f, fs.readFileSync(path.join(srcDir, f), 'utf8')]));
  const providers = {}, duplicated = new Set();
  for (const f of files) {
    const { names, migrated, installName } = providedNames(sources[f]);
    if (!migrated && !inTargets(f)) continue;
    for (const [name, local] of Object.entries(names)) {
      if (providers[name] && providers[name].file !== f) duplicated.add(name);
      // 与安装函数同名的绑定换一个导出名，避免重复导出
      const accessor = local.endsWith('()');
      providers[name] = accessor
        ? { file: f, local: local.slice(0, -2), exportName: local.slice(0, -2), accessor: true }
        : { file: f, local, exportName: name === installName ? `${name}_binding` : name };
    }
  }
  for (const name of duplicated) delete providers[name]; // 多个提供方的名称留给人工处理
  const reports = [];
  for (const f of files.filter(inTargets)) {
    const { code, report } = migrateFile(f, sources[f], providers);
    if (code === null) continue;
    reports.push(report);
    try { parse(code); } catch (error) { report.problems.push(`输出无法解析：${error.message}`); continue; }
    const dest = write ? path.join(srcDir, f) : out ? path.join(out, f) : null;
    if (dest) { fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, code); }
  }
  return { reports, duplicated: [...duplicated].sort() };
}

/**
 * 收缩：对已迁移的文件删除注册表绑定。
 * setters: {名称: {file, local}}，是被其他位置写入的名称；提供方生成 set_名称，写入方改为调用它。
 * 返回 {code, problems}。仍有无法处理的注册表访问时保留注册表变量，并列入 problems。
 */
export function contractFile(file, source, providers, setters) {
  const problems = [];
  if (!source.includes(MIGRATED)) return { code: null, problems };
  const ast = parse(source);
  const install = findInstall(ast, source);
  const reg = source.slice(source.indexOf(MIGRATED)).match(/\nvar ([\w$]+)/)?.[1];
  if (!install || !reg) return { code: null, problems };
  const { fn, param } = install;
  const edits = [];
  const imports = new Map();
  const used = new Set();
  let remaining = 0;
  const relative = to => {
    const rel = path.posix.relative(path.posix.dirname(file), to).replace(/\.(tsx?|mjs)$/, '');
    return rel.startsWith('.') ? rel : `./${rel}`;
  };
  // 安装函数里的登记语句整句删除
  const registrations = new Set();
  for (const s of fn.body.body) {
    const e = s.type === 'ExpressionStatement' ? s.expression : null;
    const bind = e?.type === 'CallExpression' && e.callee.name === 'bindRuntimeValue';
    const assign = registryAssignment(e, reg);
    const adopt = e?.type === 'AssignmentExpression' && e.left.type === 'Identifier' && e.left.name === reg;
    if (bind || adopt || (assign && assign.right.type === 'Identifier')) registrations.add(s);
  }
  traverse(ast, {
    Scopable(p) { for (const name of Object.keys(p.scope.bindings)) used.add(name); },
    Program(p) { for (const name of Object.keys(p.scope.globals)) used.add(name); },
  });
  traverse(ast, {
    MemberExpression(p) {
      const obj = p.get('object');
      if (!obj.isIdentifier({ name: reg }) || p.scope.getBinding(reg)?.scope.block.type !== 'Program') return;
      if (p.findParent(q => registrations.has(q.node))) return;
      const name = p.node.computed ? null : p.node.property.name;
      const parent = p.parentPath;
      const setter = name && setters[name];
      if (setter && parent.isAssignmentExpression({ operator: '=' }) && parent.node.left === p.node) {
        if (setter.file === file) {
          const local = setter.local;
          if (p.scope.getBinding(local)?.scope.block.type !== 'Program') { remaining++; problems.push(`写入位置的本地名被遮住：${name}`); return; }
          edits.push({ start: p.node.start, end: p.node.end, text: local });
        } else {
          let alias = `set_${name}`;
          while (used.has(alias)) alias += '_';
          const map = imports.get(setter.file) ?? imports.set(setter.file, new Map()).get(setter.file);
          if (map.has(name)) alias = map.get(name); else { map.set(name, alias); used.add(alias); }
          edits.push({ start: parent.node.start, end: parent.node.right.start, text: `${alias}(` });
          edits.push({ start: parent.node.end, end: parent.node.end, text: ')' });
        }
        return;
      }
      remaining++;
      problems.push(`仍经注册表的访问：${name ?? '(计算属性)'}，第 ${p.node.loc.start.line} 行`);
    },
    JSXMemberExpression(p) {
      if (!p.get('object').isJSXIdentifier({ name: reg })) return;
      remaining++;
      problems.push(`仍经注册表的 JSX 访问：${p.node.property.name}，第 ${p.node.loc.start.line} 行`);
    },
  });
  const lineStart = offset => source.lastIndexOf('\n', offset - 1) + 1;
  const lineEnd = offset => { const i = source.indexOf('\n', offset); return i < 0 ? source.length : i + 1; };
  for (const s of registrations) {
    const adopt = s.expression.type === 'AssignmentExpression' && s.expression.left.type === 'Identifier';
    if (adopt && remaining) continue; // 还有访问时保留 `runtime = registry`
    edits.push({ start: lineStart(s.start), end: lineEnd(s.end), text: '' });
  }
  if (!remaining) {
    // 注册表变量与安装函数的参数一并删除
    const decl = ast.program.body.find(s => s.type === 'VariableDeclaration' && s.declarations.length === 1 && s.declarations[0].id.name === reg);
    if (decl) edits.push({ start: lineStart(decl.start), end: lineEnd(decl.end), text: '' });
    const open = source.lastIndexOf('(', param.start), close = source.indexOf(')', param.end);
    edits.push({ start: open + 1, end: close, text: '' });
  }
  // 本文件提供的、被别处写入的名称：生成写入函数
  const ownSetters = Object.entries(setters).filter(([, v]) => v.file === file && v.external).sort((a, b) => a[0].localeCompare(b[0]));
  const setterCode = ownSetters.map(([name, v]) => `export function set_${name}(value: any): any {\n  ${v.local} = value;\n  return value;\n}`).join('\n');
  if (setterCode) edits.push({ start: install.stmt.start, end: install.stmt.start, text: `${setterCode}\n` });
  const importLines = [...imports].sort((a, b) => a[0].localeCompare(b[0])).map(([from, map]) =>
    `import { ${[...map].sort().map(([name, alias]) => (alias === `set_${name}` ? alias : `set_${name} as ${alias}`)).join(', ')} } from "${relative(from)}";`);
  if (importLines.length) { const at = source.indexOf(MIGRATED); edits.push({ start: at, end: at, text: `${importLines.join('\n')}\n` }); }

  edits.sort((a, b) => a.start - b.start || a.end - b.end);
  let code = '', at = 0;
  for (const e of edits) { if (e.start < at) continue; code += source.slice(at, e.start) + e.text; at = e.end; }
  code += source.slice(at);
  // 不再使用的注册表导入
  for (const name of ['bindRuntimeValue', 'RuntimeBindings']) {
    if (remaining && name === 'RuntimeBindings') continue;
    const uses = code.match(new RegExp(`\\b${name}\\b`, 'g'))?.length ?? 0;
    if (uses === 1) code = code.replace(new RegExp(`\\n?\\s*(type )?${name},?`), '');
  }
  code = code.replace(/import \{\s*\} from "[^"]+";\n/g, '').replace(/import type \{\s*\} from "[^"]+";\n/g, '');
  if (!remaining) code = code.replace(`${MIGRATED}\n`, '');
  return { code, problems };
}

/** 对整个包执行收缩。 */
export function contract(srcDir, { write = false, out = null } = {}) {
  const files = collect(srcDir);
  const sources = Object.fromEntries(files.map(f => [f, fs.readFileSync(path.join(srcDir, f), 'utf8')]));
  const providers = {};
  for (const f of files) {
    const { names, migrated } = providedNames(sources[f]);
    if (migrated) for (const [name, local] of Object.entries(names)) providers[name] = { file: f, local };
  }
  // 找出被写入的名称
  const setters = {};
  for (const f of files) {
    if (!sources[f].includes(MIGRATED)) continue;
    const reg = sources[f].slice(sources[f].indexOf(MIGRATED)).match(/\nvar ([\w$]+)/)?.[1];
    for (const m of sources[f].matchAll(new RegExp(`[^.\\w$]${reg}\\.([\\w$]+)\\s*=(?!=)\\s*(?!\\1;)`, 'g'))) {
      const p = providers[m[1]];
      if (!p) continue;
      setters[m[1]] ??= { ...p, external: false };
      if (p.file !== f) setters[m[1]].external = true;
    }
  }
  const reports = [];
  for (const f of files) {
    const { code, problems } = contractFile(f, sources[f], providers, setters);
    if (code === null) continue;
    try { parse(code); } catch (error) { problems.push(`输出无法解析：${error.message}`); reports.push({ file: f, problems }); continue; }
    reports.push({ file: f, problems });
    const dest = write ? path.join(srcDir, f) : out ? path.join(out, f) : null;
    if (dest) { fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, code); }
  }
  return { reports, setters: Object.keys(setters).sort() };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const flag = name => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : null; };
  const out = flag('--out');
  const write = args.includes('--write');
  const [pkg, ...targets] = args.filter(a => a !== '--write' && a !== '--contract');
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  if (args.includes('--contract')) {
    const { reports, setters } = contract(path.join(root, 'packages', pkg, 'src'), { write, out: out && path.resolve(out) });
    const clean = reports.filter(r => !r.problems.length).length;
    console.log(`文件 ${reports.length}，已无注册表访问 ${clean}，改为写入函数的名称 ${setters.length}`);
    for (const r of reports) for (const p of r.problems) console.log(`需要处理 ${r.file}：${p}`);
    process.exit(0);
  }
  const { reports, duplicated } = migrate(path.join(root, 'packages', pkg, 'src'), targets, { write, out: out && path.resolve(out) });
  const sum = key => reports.reduce((n, r) => n + r[key], 0);
  console.log(`文件 ${reports.length}，提升声明 ${sum('hoisted')}，改为 import 的读取 ${sum('replaced')}，仍经注册表的访问 ${sum('kept')}，新增导入 ${sum('imports')}`);
  if (duplicated.length) console.log(`多个提供方、未迁移的名称：${duplicated.join('、')}`);
  for (const r of reports) for (const p of r.problems) console.log(`需要处理 ${r.file}：${p}`);
  if (!write && !out) console.log('未写入文件；加 --write 写回源码，或用 --out 写到其他目录');
}
