import assert from 'node:assert/strict';
import test from 'node:test';
import { applyRenames, listBindings } from '../scripts/rename-bindings.mjs';
import { canonical } from '../scripts/check-equivalence.mjs';
import { measure } from '../scripts/readability.mjs';

const source = `import { helper } from "./lib";
export function make(input: number) {
  let value2 = input * 2;
  const { width, value3 = 1 } = helper(value2);
  const out = { value2, width };
  value2 += value3;
  return (0, helper)(out, value2);
}
const value9 = 3;
export { value9 };
`;

test('列出机器名的绑定，带位置与所在函数', () => {
  const keys = listBindings(source).map(r => r.key);
  assert.deepEqual(keys, ['value2@3:6', 'value3@4:17', 'value9@9:6']);
});

test('改名覆盖声明、引用、赋值与简写属性，并保留导出名', () => {
  const { code, problems } = applyRenames(source, { 'value2@3': 'doubled', 'value3@4': 'extra', 'value9@9': 'limit' });
  assert.deepEqual(problems, []);
  assert.match(code, /let doubled = input \* 2;/);
  assert.match(code, /const \{ width, value3: extra = 1 \} = helper\(doubled\);/);
  assert.match(code, /const out = \{ value2: doubled, width \};/);
  assert.match(code, /doubled \+= extra;/);
  assert.match(code, /export \{ limit as value9 \};/);
  // 改名前后在 α 等价意义下相同
  assert.equal(canonical(code, 'a.ts'), canonical(source, 'a.ts'));
});

test('改名保留参数的类型标注与可选标记', () => {
  const { code } = applyRenames('export function f(value2?: number, input3: string = "") { return [value2, input3]; }\n', { 'value2@1': 'width', 'input3@1': 'label' });
  assert.match(code, /function f\(width\?: number, label: string = ""\)/);
});

test('属性名与 JSX 属性名不算冲突；同一张表里可以交换名字', () => {
  const src = 'export function f(value2: any) { const value3 = value2.files; return <A files={value3} />; }\n';
  assert.deepEqual(applyRenames(src, { 'value3@1': 'files' }).problems, []);
  const swap = applyRenames('function g() { const a1 = 1; { const b1 = 2; return a1 + b1; } }\n', { 'a1@1': 'b1', 'b1@1': 'a1' });
  assert.deepEqual(swap.problems, []);
  assert.equal(canonical(swap.code, 'a.ts'), canonical('function g() { const a1 = 1; { const b1 = 2; return a1 + b1; } }\n', 'a.ts'));
});

test('新名字与作用域内已有的名字冲突时拒绝', () => {
  const { problems } = applyRenames(source, { 'value2@3': 'width' });
  assert.equal(problems.length, 1);
  const twice = applyRenames(source, { 'value2@3': 'total', 'value3@4': 'total' });
  assert.equal(twice.problems.length, 1);
});

test('等价校验：类型与 (0, f)() 写法不影响结果，逻辑或属性名的变化会被发现', () => {
  assert.equal(canonical('const a: number = (0, f)(1);', 'a.ts'), canonical('const b = f(1);', 'a.ts'));
  assert.notEqual(canonical('const a = { x: 1 };', 'a.ts'), canonical('const a = { y: 1 };', 'a.ts'));
  assert.notEqual(canonical('export const a = 1;', 'a.ts'), canonical('export const b = 1;', 'a.ts'));
  assert.notEqual(canonical('f(a, b);', 'a.ts'), canonical('f(b, a);', 'a.ts'));
});

test('可读性指标', () => {
  assert.equal(measure('const value12 = 1;\n'.repeat(10)).readable, false);
  assert.equal(measure('const width = 1;\n'.repeat(10)).readable, true);
});

test('JSX 标签使用的绑定不能改成小写开头的名字', () => {
  const { problems } = applyRenames('export function f(value2: any) { const Comp1 = value2; return <Comp1 />; }\n', { 'Comp1@1': 'panel' });
  assert.equal(problems.length, 1);
});

test('改名同步更新类型谓词与 typeof 查询', () => {
  const src = 'export function isSize(value2: unknown): value2 is number { const value3 = 1; let value4: typeof value3 = value3; return typeof value2 == "number" && value4 > 0; }\n';
  const { code, problems } = applyRenames(src, { 'value2@1': 'candidate', 'value3@1': 'base', 'value4@1': 'copy' });
  assert.deepEqual(problems, []);
  assert.match(code, /\(candidate: unknown\): candidate is number/);
  assert.match(code, /let copy: typeof base = base;/);
});
