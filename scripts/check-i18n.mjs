import fs from 'node:fs';
import path from 'node:path';
import babel from '@babel/standalone';

const { parse } = babel.packages.parser;
const traverse = babel.packages.traverse.default;
const readAst = file => parse(fs.readFileSync(file, 'utf8'), { sourceType: 'module', plugins: ['typescript', 'jsx'] });
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
const params = text => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
const messages = {}, failures = [];
for (const domain of ['canvas', 'inspector', 'design-system', 'feedback', 'errors']) {
  const dictionaries = {};
  for (const [locale, binding] of [['en', 'en'], ['zh-Hans', 'zh']]) {
    traverse(readAst(`packages/contracts/src/ui-text/${domain}.${locale}.ts`), {
      VariableDeclarator({ node }) {
        if (node.id.name !== binding) return;
        let object = node.init;
        while (object.expression) object = object.expression;
        dictionaries[locale] = Object.fromEntries(object.properties.map(prop => [prop.key.value ?? prop.key.name, prop.value.value]));
      },
    });
  }
  const en = dictionaries.en, zh = dictionaries['zh-Hans'];
  if (Object.keys(en).sort().join() !== Object.keys(zh).sort().join()) failures.push(`${domain}: locale keys differ`);
  for (const [key, value] of Object.entries(en)) {
    if (!value.trim() || !zh[key]?.trim()) failures.push(`${key}: empty translation`);
    if (params(value).join() !== params(zh[key] ?? '').join()) failures.push(`${key}: locale parameters differ`);
    if (key in messages) failures.push(`${key}: duplicate domain key`);
    messages[key] = value;
  }
}
const attrs = new Set(['aria-label', 'aria-description', 'title', 'label', 'placeholder', 'description', 'tooltip', 'disabledReason', 'emptyText', 'emptyMessage', 'data-tip', 'addLabel', 'confirmLabel', 'tip', 'why', 'disabledWhy']);
const props = new Set(['label', 'title', 'description', 'placeholder', 'emptyMessage', 'emptyText', 'helpText', 'hint', 'confirmLabel', 'tooltip', 'accessibleName', 'ariaLabel', 'actionLabel', 'retryLabel', 'cancelLabel', 'saveLabel', 'addLabel', 'removeLabel']);
const allowlist = JSON.parse(fs.readFileSync('scripts/i18n-allowlist.json', 'utf8'));
let calls = 0;
for (const file of ['packages/design-runtime/src', 'packages/design-system-runtime/src', 'packages/editor-host/src', 'src/frontend'].flatMap(walk).filter(file => /\.(tsx?|mjs)$/.test(file) && !file.includes('.test.') && !/\/(scripts|runtime|worker|contracts|generated)\//.test(file))) {
  const fail = (node, message) => failures.push(`${file}:${node.loc.start.line}: ${message}`);
  traverse(readAst(file), {
    CallExpression({ node }) {
      if (node.callee.name !== 'uiMessage' || node.arguments[0]?.type !== 'StringLiteral') return;
      calls++;
      const key = node.arguments[0].value;
      if (!(key in messages)) return fail(node, `unknown key ${key}`);
      const expected = [...new Set(params(messages[key]))].sort();
      const values = node.arguments[1];
      const actual = values?.type === 'ObjectExpression' ? values.properties.map(prop => prop.key?.name ?? prop.key?.value).sort() : [];
      if (expected.join() !== actual.join()) fail(node, `parameters for ${key}: expected [${expected}], received [${actual}]`);
    },
    StringLiteral(p) {
      const value = p.node.value;
      if (!/[A-Za-z\u3400-\u9fff]{2}/.test(value) || value.length > 450 || /^(https?:|data:|[.#])/.test(value)) return;
      if (p.parentPath.isObjectProperty() && p.key === 'key') return;
      let current = p;
      while (current.parentPath && !current.parentPath.isJSXExpressionContainer() && !current.parentPath.isJSXAttribute() && !current.parentPath.isObjectProperty()) {
        const parent = current.parentPath;
        if (parent.isCallExpression() || parent.isMemberExpression() || parent.isFunction() || parent.isBinaryExpression() && parent.node.operator !== '+' || parent.isConditionalExpression() && current.key === 'test' || parent.isLogicalExpression() && current.key === 'left') return;
        current = parent;
      }
      const object = p.findParent(q => q.isObjectProperty());
      if (object && !props.has(object.node.key.name ?? object.node.key.value) && !attrs.has(object.node.key.name ?? object.node.key.value)) return;
      const attribute = p.findParent(q => q.isJSXAttribute());
      const element = p.findParent(q => q.isJSXElement());
      const name = element?.node.openingElement.name;
      const visible = attribute ? attrs.has(attribute.node.name.name) : p.findParent(q => q.isJSXExpressionContainer()) ? !['Icon', 'Shortcut'].includes(name?.name ?? name?.property?.name) : p.parentPath.isObjectProperty() && props.has(p.parentPath.node.key.name ?? p.parentPath.node.key.value) && p.key === 'value';
      if (!visible || allowlist.some(entry => entry.file === file && entry.text === value)) return;
      fail(p.node, `hardcoded UI text ${JSON.stringify(value)}`);
    },
    JSXText({ node }) {
      if (/[A-Za-z\u3400-\u9fff]{2}/.test(node.value.trim())) fail(node, `hardcoded JSX text ${JSON.stringify(node.value.trim())}`);
    },
  });
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else console.log(`i18n: ${Object.keys(messages).length} bilingual messages, ${calls} literal call sites; UI text guard passed.`);
