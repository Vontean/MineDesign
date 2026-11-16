// @vitest-environment happy-dom
import { beforeAll, expect, it, vi } from 'vitest';

// 解除关联依赖模板展开、样式解析与标签规则；这里只关心 detach 自己的判断，用简化的替身
vi.mock('../clipboard/template-flattening', () => ({
  ClipboardTemplateFlatteningTrueFalseNullSet: new Set(['true', 'false', 'null']),
  flattenTemplateValues: (html: string, resolve: (name: string) => unknown) =>
    html.replace(/\{\{\s*([^{}]*?)\s*\}\}/g, (all, name) => {
      const value = resolve(name);
      return value === undefined ? all : String(value);
    }),
  getLoopTemplateVariables: () => new Set<string>(),
}));
vi.mock('../css/declarations', () => ({
  parseStyleDeclarations: (style?: string) =>
    (style ?? '').split(';').map((s) => s.trim()).filter(Boolean).map((s) => {
      const index = s.indexOf(':');
      return { prop: s.slice(0, index).trim(), value: s.slice(index + 1).trim() };
    }),
  serializeStyleDeclarations: (declarations: { prop: string; value: string }[]) =>
    declarations.map((d) => `${d.prop}: ${d.value}`).join('; '),
  getStyleProperty: () => '',
}));
vi.mock('../html/authoring', () => ({ canContainHtmlTag: (tag: string) => tag !== 'p' }));

import {
  detachableComponentProps,
  detachComponentRefusal,
  detachImportedComponent,
  hasUnresolvedTemplateExpression,
  installEditorComponentsDetach,
  parseDetachablePropValue,
} from './detach';

beforeAll(() => installEditorComponentsDetach()());

function fakeModel(overrides: Record<string, unknown> = {}) {
  return {
    isUneditable: () => false,
    isLoopDriven: () => false,
    inlineStyleAttr: () => 'left: 10px; color: red',
    attributes: () => ({ name: 'Card', title: "{{ 'Hi' }}", 'item-count': '{{ 3 }}' }),
    childTids: (tid: number | null) => (tid === null ? [0] : []),
    element: () => document.createElement('dc-import'),
    parentTid: () => null,
    tagName: () => 'dc-import',
    helmetAssets: () => ({ assets: ['a.png'], atomics: {} }),
    rootText: () => '',
    subtreeHtml: () => '<b>{{ title }} x{{ itemCount }}</b>',
    ...overrides,
  };
}

it('属性值：字面量表达式取出字面量，含其他表达式的不能内联', () => {
  expect(parseDetachablePropValue("{{ 'Hi' }}")).toBe('Hi');
  expect(parseDetachablePropValue('{{ 3 }}')).toBe(3);
  expect(parseDetachablePropValue('{{ true }}')).toBe(true);
  expect(parseDetachablePropValue('plain')).toBe('plain');
  expect(parseDetachablePropValue('{{ a == b }}')).toBeUndefined();
  expect(parseDetachablePropValue('{{ a }} x')).toBeUndefined();
});

it('实例属性转成 prop：跳过保留属性与不能内联的值，kebab 名转 camel', () => {
  expect(detachableComponentProps({ name: 'Card', 'item-count': '{{ 3 }}', title: '{{ x }}', hint: 'ok' })).toEqual({
    itemCount: 3,
    hint: 'ok',
  });
});

it('可以解除关联的实例没有拒绝原因；管理自身、有内容的实例会给出原因', () => {
  expect(detachComponentRefusal(fakeModel(), 0)).toBeUndefined();
  expect(detachComponentRefusal(fakeModel({ isUneditable: () => true }), 0)).toEqual(expect.any(String));
  const withText = fakeModel({ element: () => Object.assign(document.createElement('dc-import'), { textContent: 'hi' }) });
  expect(detachComponentRefusal(withText, 0)).not.toBeUndefined();
});

it('模板里只剩字面量与 true/false/null 时视为已解析', () => {
  expect(hasUnresolvedTemplateExpression("{{ 'a' }} {{ 5 }} {{ null }} <!-- {{ z }} -->")).toBe(false);
  expect(hasUnresolvedTemplateExpression('{{ name }}')).toBe(true);
});

it('解除关联：用实例的 prop 展开组件内容，保留定位样式并带上素材', () => {
  const model = fakeModel();
  const result = detachImportedComponent(model, 0, { model, vals: {}, held: [] });
  expect(result).toEqual({
    html: '<div style="left: 10px" data-om-label="Card">\n<b>Hi x3</b>\n</div>',
    assets: ['a.png'],
    atomics: {},
  });
});

it('组件内容里有解析不了的表达式时拒绝解除', () => {
  const model = fakeModel({ subtreeHtml: () => '<b>{{ unknown }}</b>' });
  expect(detachImportedComponent(model, 0, { model, vals: {}, held: [] })).toEqual({ blocked: expect.any(String) });
});
