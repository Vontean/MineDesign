import { beforeAll, expect, it } from 'vitest';
import { installModuleHelpers } from '../../module-helpers';
import { installEditorAttributeValidation } from '../attribute-validation';
import { installEditorComponentsImports, parseComponentImport, reservedImportAttributePattern, sharedComponentImport } from './imports';

beforeAll(() => {
  installModuleHelpers()();
  installEditorAttributeValidation()();
  installEditorComponentsImports()();
});

it('dc-import 引用同级画板，目录部分作为 scope（去掉 . 与 ..）', () => {
  expect(parseComponentImport('dc-import', { name: 'Card' })).toEqual({ kind: 'canvas', ref: 'Card', name: 'Card' });
  expect(parseComponentImport('dc-import', { name: 'ui/./../Card' })).toEqual({
    kind: 'canvas',
    ref: 'ui/./../Card',
    name: 'Card',
    scope: 'ui',
  });
});

it('x-import 按 from 与 component-from-global-scope 区分模块和设计系统组件', () => {
  expect(parseComponentImport('x-import', { from: './lib', component: 'Button' })).toEqual({ kind: 'module', ref: 'Button', name: 'Button' });
  expect(parseComponentImport('x-import', { 'component-from-global-scope': 'ds.Button' })).toEqual({
    kind: 'system',
    ref: 'ds.Button',
    name: 'Button',
    scope: 'ds',
  });
});

it('其他标签、deck-stage、image-slot、含模板表达式或没有名字的引用都不算组件', () => {
  expect(parseComponentImport('div', { name: 'Card' })).toBeNull();
  expect(parseComponentImport('x-import', { from: 'deck-stage', component: 'Stage' })).toBeNull();
  expect(parseComponentImport('dc-import', { name: 'Image-Slot' })).toBeNull();
  expect(parseComponentImport('dc-import', { name: '{{x}}' })).toBeNull();
  expect(parseComponentImport('dc-import', {})).toBeNull();
});

it('一组引用指向同一组件时给出共享引用，否则 shared 为 null，含空值整体为 null', () => {
  const a = { kind: 'canvas' as const, ref: 'A', name: 'A' };
  const b = { kind: 'canvas' as const, ref: 'B', name: 'B' };
  expect(sharedComponentImport([a, { ...a }])).toEqual({ shared: a });
  expect(sharedComponentImport([a, b])).toEqual({ shared: null });
  expect(sharedComponentImport([a, null])).toBeNull();
  expect(sharedComponentImport([])).toBeNull();
});

it('保留属性不会被当作组件 prop', () => {
  expect(reservedImportAttributePattern.test('hint-size')).toBe(true);
  expect(reservedImportAttributePattern.test('item')).toBe(false);
});
