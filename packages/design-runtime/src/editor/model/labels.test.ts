import { afterEach, expect, it } from 'vitest';
import { installEditorModelLabels, labelToElementKind } from './labels.ts';
import { setUiLocale } from '@minedesign/contracts/ui-locale';
import { uiNodeLabel, uiCssLabel } from '@minedesign/contracts/ui-value';

afterEach(() => setUiLocale('en'));
it('切换语言只改变视图标签，不改变模型种类推断与作者命名', () => {
  installEditorModelLabels()();
  setUiLocale('zh-Hans');
  expect(labelToElementKind('Conditional group')).toBe('frame');
  expect(labelToElementKind('Row', 'row')).toBe('row');
  expect(uiNodeLabel({kind:'Row',label:'Row'})).toBe('横向布局');
  expect(uiNodeLabel({kind:'Row',label:'Row',userLabel:'Row'})).toBe('Row');
  expect(uiNodeLabel({kind:'Component',label:'Row',component:{name:'Row'}})).toBe('Row');
  expect(uiCssLabel('flex','Flex')).toBe('弹性布局');
  setUiLocale('en');
  expect(uiNodeLabel({kind:'Row',label:'Row'})).toBe('Row');
  expect(uiCssLabel('flex','Flex')).toBe('Flex');
});

it('已初始化的属性规范在语言切换后重新取标签，属性值保持不变', async () => {
  const { installEditorInspectorPropertySchema, getPropertySpecification } = await import('../inspector/property-schema.ts');
  installEditorInspectorPropertySchema()();
  const gap = getPropertySpecification('gap');
  const minHeight = getPropertySpecification('min-height');
  expect(gap.label).toBe('Gap');
  setUiLocale('zh-Hans');
  expect(gap.label).toBe('间隔');
  expect(minHeight.label).toBe('最小高度');
  expect(gap.prop).toBe('gap');
  expect(gap.defaultValue).toBe('0px');
});
