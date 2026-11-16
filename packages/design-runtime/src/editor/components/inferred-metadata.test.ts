import { expect, it } from 'vitest';
import {
  canEditBoundComponentProps,
  inferredPropsMetadata,
  inferredTypeToPropMetadata,
  templatePropReferences,
} from './inferred-metadata';

it('推断为 enum 的属性按数字或布尔转换选项，并带上默认值', () => {
  expect(inferredTypeToPropMetadata({ kind: 'enum', options: ['1', '2'], numeric: true, default: 1 })).toEqual({
    editor: 'enum',
    options: [1, 2],
    default: 1,
  });
  expect(inferredTypeToPropMetadata({ kind: 'enum', options: ['true', 'a'], withBool: true })).toEqual({
    editor: 'enum',
    options: [true, 'a'],
  });
});

it('boolean、number 和其他类型分别对应 boolean、float、text 编辑器', () => {
  expect(inferredTypeToPropMetadata({ kind: 'boolean' })).toEqual({ editor: 'boolean' });
  expect(inferredTypeToPropMetadata({ kind: 'number' })).toEqual({ editor: 'float' });
  expect(inferredTypeToPropMetadata({ kind: 'string', typeName: 'Label' })).toEqual({ editor: 'text', tsType: 'Label' });
});

it('按属性名汇总元数据', () => {
  expect(inferredPropsMetadata([{ name: 'on', kind: 'boolean' }, { name: 'n', kind: 'number' }])).toEqual({
    on: { editor: 'boolean' },
    n: { editor: 'float' },
  });
});

it('模板里的属性引用：夹有复杂表达式时整体不算，wholeOnly 要求整段就是一个引用', () => {
  expect(templatePropReferences('{{ a }} and {{b}}')).toEqual(['a', 'b']);
  expect(templatePropReferences('{{ a }} {{ a + 1 }}')).toEqual([]);
  expect(templatePropReferences('{{ a }}', true)).toEqual(['a']);
  expect(templatePropReferences('x {{ a }}', true)).toEqual([]);
});

it('只有名称匹配、属性都可编辑的 dc-import 才允许在面板里改绑定的属性', () => {
  const doc = (tag: string, attrs: Record<string, string>) => ({ tagName: () => tag, attributes: () => attrs });
  const editable = new Set(['title']);
  expect(canEditBoundComponentProps(doc('dc-import', { name: 'Card' }), {}, 'Card', ['title'], editable)).toBe(true);
  expect(canEditBoundComponentProps(doc('dc-import', { name: 'Card' }), {}, 'Card', ['size'], editable)).toBe(false);
  expect(canEditBoundComponentProps(doc('div', { name: 'Card' }), {}, 'Card', ['title'], editable)).toBe(false);
});
