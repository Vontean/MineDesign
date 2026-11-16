import { expect, it } from 'vitest';
import {
  applyComponentPropDefaults,
  maxTextPropLength,
  normalizeComponentPropEdit,
  parseComponentPropsMetadata,
} from './props';

it('与默认值相同的属性在整理时被省略，keepConverged 时保留', () => {
  const metadata = JSON.stringify({ title: { default: 'Hi' } });
  const resolve = (name: string) => (name === 'title' ? 'Hi' : 'x');
  expect(parseComponentPropsMetadata({ title: 'Hi', size: 'x' }, metadata, resolve)).toEqual({
    changed: true,
    next: { size: 'x' },
  });
  expect(
    parseComponentPropsMetadata({ title: 'Hi' }, metadata, resolve, { keepConverged: true }),
  ).toEqual({ changed: false, next: { title: 'Hi' } });
});

it('解析结果不是字符串的属性原样保留；元数据不是对象时当作没有默认值', () => {
  const result = parseComponentPropsMetadata({ n: 3 }, '[1]', () => 3);
  expect(result).toEqual({ changed: false, next: { n: 3 } });
  expect(parseComponentPropsMetadata({}, undefined, () => 'a')).toEqual({ changed: false, next: undefined });
});

it('写入默认值只作用于已声明的属性', () => {
  expect(applyComponentPropDefaults({ a: { editor: 'text' } }, { a: 'x', b: 'y' })).toEqual({
    a: { editor: 'text', default: 'x' },
  });
});

it('文本属性的编辑：原文一致时提交，无变化与过长分别识别', () => {
  const metadata = { title: { editor: 'text', default: 'Hi' } };
  const edit = { prop: 'title', value: 'Hi' };
  expect(normalizeComponentPropEdit(edit, 'Hello', metadata, {})).toEqual({ kind: 'commit', prop: 'title', text: 'Hello' });
  expect(normalizeComponentPropEdit(edit, 'Hi', metadata, {})).toEqual({ kind: 'noop' });
  expect(normalizeComponentPropEdit(edit, 'x'.repeat(maxTextPropLength + 1), metadata, {})).toEqual({ kind: 'toolong' });
});

it('文本属性的编辑：原文已变或不是文本属性时拒绝，格式不对时丢弃', () => {
  const metadata = { title: { editor: 'text', default: 'Hi' }, size: { editor: 'enum' } };
  expect(normalizeComponentPropEdit({ prop: 'title', value: 'Hi' }, 'a', metadata, { title: 'Other' })).toEqual({ kind: 'refuse' });
  expect(normalizeComponentPropEdit({ prop: 'size', value: 'm' }, 'a', metadata, { size: 'm' })).toEqual({ kind: 'refuse' });
  expect(normalizeComponentPropEdit(null, 'a', metadata, {})).toEqual({ kind: 'drop' });
  expect(normalizeComponentPropEdit({ prop: 'title', value: 1 }, 'a', metadata, {})).toEqual({ kind: 'drop' });
});
