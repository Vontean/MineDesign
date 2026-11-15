import assert from 'node:assert/strict';
import test from 'node:test';
import { migrateFile, providedNames } from '../scripts/runtime-to-imports.mjs';

const provider = `import { bindRuntimeValue, type Dynamic, type RuntimeBindings } from "../runtime-types";
export function installA(runtime: RuntimeBindings): () => void {
  var LIMIT: Dynamic;
  function helper(): Dynamic {
    return LIMIT;
  }
  function box(): Dynamic {}
  bindRuntimeValue(runtime, "box", () => box);
  bindRuntimeValue(runtime, "helper", () => helper);
  bindRuntimeValue(runtime, "LIMIT", () => LIMIT, (value) => {
    LIMIT = value;
  });
  return () => {
    LIMIT = 8;
  };
}
`;
const consumer = `import { bindRuntimeValue, type Dynamic, type RuntimeBindings } from "../runtime-types";
export function installB(runtime: RuntimeBindings): () => void {
  var total: Dynamic;
  function View({ helper }: Dynamic): Dynamic {
    const text = \`a
  b\`;
    runtime.counter = 1;
    return <runtime.box>{(0, runtime.helper)() + runtime.LIMIT + runtime.other + total}</runtime.box>;
  }
  bindRuntimeValue(runtime, "View", () => View);
  bindRuntimeValue(runtime, "total", () => total);
  return () => {
    total = runtime.total;
  };
}
`;
const providers = {
  helper: { file: 'lib/a.ts', local: 'helper' },
  LIMIT: { file: 'lib/a.ts', local: 'LIMIT' },
  box: { file: 'lib/a.ts', local: 'box' },
  View: { file: 'ui/b.tsx', local: 'View' },
  total: { file: 'ui/b.tsx', local: 'total' },
};

test('提供方：声明提到模块作用域并导出，安装函数保留绑定与初始化', () => {
  const { code } = migrateFile('lib/a.ts', provider, providers);
  assert.match(code, /^function helper\(\): Dynamic \{\n  return LIMIT;\n\}$/m);
  assert.match(code, /^var LIMIT: Dynamic;$/m);
  assert.match(code, /export \{\n  box,\n  helper,\n  LIMIT,\n\};/);
  assert.match(code, /export function installA\(registry: RuntimeBindings\): \(\) => void \{\n  runtime = registry;\n  bindRuntimeValue\(runtime, "box"/);
  assert.match(code, /return \(\) => \{\n    LIMIT = 8;\n  \};\n\}/);
  // 迁移后仍能读出提供的名称，且再次迁移不改动
  assert.deepEqual(providedNames(code).names, { box: 'box', helper: 'helper', LIMIT: 'LIMIT' });
  assert.equal(providedNames(code).migrated, true);
  assert.equal(migrateFile('lib/a.ts', code, providers).code, null);
});

test('读取方：已迁移的名称改为 import，其余继续经注册表', () => {
  const { code, report } = migrateFile('ui/b.tsx', consumer, providers);
  // 被参数遮住的名称使用别名；JSX 中的小写名称使用大写别名
  assert.match(code, /import \{ box as R_box, helper as helper_r, LIMIT \} from "\.\.\/lib\/a";/);
  assert.match(code, /return <R_box>\{\(0, helper_r\)\(\) \+ LIMIT \+ runtime\.other \+ total\}<\/R_box>;/);
  // 写入与没有提供方的名称保持原样；本文件的名称直接用本地变量
  assert.match(code, /runtime\.counter = 1;/);
  assert.match(code, /total = total;/);
  // 模板字符串内部的缩进不变
  assert.match(code, /const text = `a\n  b`;/);
  assert.deepEqual(report.problems, []);
  assert.equal(report.kept, 2);
});

test('赋值式提供改为模块级常量', () => {
  const source = `import * as lib from "lib";
export function installDeps(runtime: RuntimeBindings): void {
  runtime.load = () => lib;
  runtime.lib = lib;
}
`;
  const { code } = migrateFile('deps.ts', source, { load: { file: 'deps.ts', local: 'load' }, lib: { file: 'deps.ts', local: 'lib' } });
  assert.match(code, /^const load = \(\) => lib;$/m);
  assert.match(code, /export \{\n  lib,\n  load,\n\};/);
  assert.match(code, /runtime = registry;\n  runtime\.load = load;\n  runtime\.lib = lib;/);
});
