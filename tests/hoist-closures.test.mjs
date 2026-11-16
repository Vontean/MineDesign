import assert from 'node:assert/strict';
import test from 'node:test';
import { hoistClosures } from '../scripts/hoist-closures.mjs';

const source = `import { useCallback } from "react";
export function Big(props: Dynamic): Dynamic {
  const first = props.a;
  const onSave = useCallback(async (event: Dynamic, extra = first) => {
    const local = event.target;
    await later.current(local, extra, limit);
    return <Row value={first} />;
  }, [first]);
  const compute = (value: number) => value * first;
  const usesThis = function (this: Dynamic) {
    const base = this.value;
    const more = base + first;
    return more;
  };
  const later = useRef(null);
  const limit = 3;
  return onSave;
}
function Row() {}
`;

test('大的内部函数提到模块作用域，依赖显式列出，原位置留下转发函数', () => {
  const { code, hoisted, skipped } = hoistClosures(source, { minLines: 4, names: { 4: { name: 'saveDocument', doc: '保存当前作品。' } } });
  assert.deepEqual(hoisted.map(h => [h.name, h.deps]), [['saveDocument', ['first', 'later', 'limit']]]);
  // 转发函数传入按需取值的对象，所以可以引用在它之后声明的变量
  assert.ok(code.includes('const onSave = useCallback((...args: Dynamic[]): Dynamic => (saveDocument as Dynamic)({ get first() { return first; }, get later() { return later; }, get limit() { return limit; } }, ...args), [first]);'));
  // 函数内每次引用都改为读取依赖对象，包括参数默认值与 JSX
  assert.ok(code.includes('/** 保存当前作品。 */\nasync function saveDocument(deps: { readonly first: Dynamic; readonly later: Dynamic; readonly limit: Dynamic }, event: Dynamic, extra = deps.first) {'));
  assert.ok(code.includes('await deps.later.current(local, extra, deps.limit);'));
  assert.ok(code.includes('return <Row value={deps.first} />;'));
  // 小函数不动；使用 this 的函数不提取
  assert.match(code, /const compute = \(value: number\) => value \* first;/);
  assert.deepEqual(skipped.map(s => s.reason), ['使用了 this']);
});

test('不满足行数的文件保持原样', () => {
  const { code, hoisted } = hoistClosures(source, { minLines: 50 });
  assert.equal(hoisted.length, 0);
  assert.equal(code, source);
});
