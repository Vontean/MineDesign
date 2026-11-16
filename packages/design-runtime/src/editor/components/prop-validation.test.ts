import { expect, it } from 'vitest';
import {
  chargePropObjectBudget,
  equalPropValues,
  isBoundedArrayIndex,
  normalizePropMetadata,
  normalizePropValues,
  omitUnchangedProps,
  parsePropsMetadata,
  truncatePropText,
} from './prop-validation';

it('截断文本按码点计，不会切开一个字符', () => {
  expect(truncatePropText('abcdef', 3)).toBe('abc');
  expect(truncatePropText('😀😀😀', 4)).toBe('😀😀');
});

it('data-props 元数据：数字字段转成数字，step 必须为正，字符串字段保留，对象字段丢弃', () => {
  const normalized = normalizePropMetadata(
    { editor: 'range', min: '0', max: 10, step: 0, unit: 'px', extra: { a: 1 }, default: 5 },
    new WeakSet(),
  );
  expect(normalized).toEqual({ editor: 'range', min: 0, max: 10, unit: 'px', default: 5 });
});

it('enum 选项最多取 64 项，每项整理成值或 { value, label }', () => {
  const options = Array.from({ length: 80 }, (_, i) => ({ value: i, label: `n${i}`, junk: 1 }));
  const { options: result } = normalizePropMetadata({ options }, new WeakSet()) as { options: unknown[] };
  expect(result).toHaveLength(64);
  expect(result[0]).toEqual({ value: 0, label: 'n0' });
});

it('整份元数据只接受普通对象，原型上的键与重复引用被忽略', () => {
  const shared = { editor: 'text' };
  expect(parsePropsMetadata('x')).toEqual({});
  expect(parsePropsMetadata({ a: shared, b: shared, toString: { editor: 'text' } })).toEqual({ a: { editor: 'text' } });
});

it('属性值：字符串被截断，循环引用与超出预算的值被丢弃', () => {
  const cyclic: Record<string, unknown> = {};
  cyclic.self = cyclic;
  const values = normalizePropValues({ title: 'x'.repeat(20000), ok: { a: [1, 2] }, cyclic, huge: 'y'.repeat(100).split('').map(() => 'z'.repeat(400)) });
  expect((values.title as string).length).toBe(16 * 1024);
  expect(values.ok).toEqual({ a: [1, 2] });
  expect('cyclic' in values).toBe(false);
  expect('huge' in values).toBe(false);
});

it('预算检查拒绝带额外自有属性的数组，数组下标只认规范写法', () => {
  const array = [1] as unknown[] & { extra?: number };
  array.extra = 1;
  expect(chargePropObjectBudget(array, { left: 1000 }, new WeakSet())).toBe(false);
  expect(isBoundedArrayIndex('2', 3)).toBe(true);
  expect(isBoundedArrayIndex('02', 3)).toBe(false);
});

it('与默认值相同的属性被去掉，没有变化时返回原对象', () => {
  const props = { a: { x: 1 }, b: 2 };
  expect(omitUnchangedProps(props, { a: { x: 1 } })).toEqual({ b: 2 });
  expect(omitUnchangedProps(props, { b: 3 })).toBe(props);
  expect(equalPropValues({ x: 1 }, { x: 1 })).toBe(true);
});
