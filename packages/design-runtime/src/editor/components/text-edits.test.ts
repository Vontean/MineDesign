import { beforeAll, expect, it } from 'vitest';
import { installModuleHelpers } from '../../module-helpers';
import { installEditorAttributeValidation } from '../attribute-validation';
import { installEditorComponentsImports } from './imports';
import {
  collectTemplateTextValues,
  componentTextOptions,
  normalizeComponentTextEdit,
  normalizeTextWhitespace,
  normalizeTextWords,
} from './text-edits';

beforeAll(() => {
  installModuleHelpers()();
  installEditorAttributeValidation()();
  installEditorComponentsImports()();
});

const alert = (attrs: Record<string, string>, ownText = '', deepText: string[] = []) => ({
  tag: 'x-import',
  attrs: { 'component-from-global-scope': 'Pine.Alert', ...attrs },
  text: null,
  ownText,
  deepText,
});

it('空白折叠：normalizeTextWhitespace 连不换行空格一起去掉，normalizeTextWords 只去首尾各一个空格', () => {
  expect(normalizeTextWhitespace('  a \n\n b ')).toBe('a b');
  expect(normalizeTextWords('\u00a0a \n b ')).toBe('\u00a0a b');
});

it('组件实例上的普通文字属性可编辑，key 用 @属性名', () => {
  expect(componentTextOptions(alert({ title: '登录成功', tone: 'success' }), new Set())).toEqual([
    { words: '登录成功', key: '@title' },
    { words: 'success', key: '@tone' },
  ]);
});

it('同一段文字出现两次、含拼接模板、画板导入的实例都不提供编辑', () => {
  expect(componentTextOptions(alert({ title: 'Hi', label: 'Hi' }), new Set())).toEqual([]);
  expect(componentTextOptions(alert({ title: 'a {{x}} b' }), new Set())).toEqual([]);
  expect(componentTextOptions({ tag: 'dc-import', attrs: { name: 'Card', title: 'Hi' }, text: null, ownText: '', deepText: [] }, new Set())).toEqual([]);
});

it('文字字面量表达式 {{ "x" }} 与事件处理属性不会被当作可编辑文字', () => {
  expect(componentTextOptions(alert({ title: '{{ "Hello" }}' }), new Set())).toEqual([]);
  expect(componentTextOptions(alert({ onClick: 'go()' }), new Set())).toEqual([]);
});

it('出现动态文字时，不足两个字符、纯数字或已被模板占用的文字不可编辑', () => {
  const options = componentTextOptions(alert({ 'dc-props': 'x', title: 'o', size: '12', label: 'Hello', note: 'Taken' }), new Set(['Taken']));
  expect(options).toEqual([{ words: 'Hello', key: '@label' }]);
});

it('收集脚本字面量与属性默认值里的文字', () => {
  const texts = collectTemplateTextValues([{ value: ' hi  there ' }, { value: 3 }], {
    values: { a: ['x'] },
    propsMeta: { b: { default: 'dflt' }, c: null },
  });
  expect([...texts]).toEqual(['hi there', '3', 'x', 'dflt']);
});

it('面板里的文字编辑：只允许改 options 里存在的文字，空白会被整理', () => {
  const options = [{ words: 'Hello', key: '@title' }];
  const edit = { key: '@title', words: 'Hello' };
  expect(normalizeComponentTextEdit(edit, '  World \n', options)).toEqual({ kind: 'commit', key: '@title', text: 'World' });
  expect(normalizeComponentTextEdit(edit, ' Hello ', options)).toEqual({ kind: 'noop' });
  expect(normalizeComponentTextEdit({ key: '@x', words: 'Hello' }, 'a', options)).toEqual({ kind: 'refuse' });
  expect(normalizeComponentTextEdit(edit, 'x'.repeat(2001), options)).toEqual({ kind: 'toolong' });
  expect(normalizeComponentTextEdit(null, 'a', options)).toEqual({ kind: 'drop' });
});
