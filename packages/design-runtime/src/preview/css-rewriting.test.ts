import { expect, it } from 'vitest';
import {
  escapeNoscriptInCss,
  hasRootRelativeCssReference,
  inlineStylesheetImports,
  isStandaloneStylesheet,
  leadingStylesheetAtRuleEnd,
  moveCssImportsFirst,
  stripStylesheetComments,
} from './css-rewriting';

it('注释换成一个空格，字符串和不带引号的 url() 里的 /* 保留', () => {
  expect(stripStylesheetComments('a{/* x */b:c}')).toBe('a{ b:c}');
  expect(stripStylesheetComments('a{content:"/* x */"}')).toBe('a{content:"/* x */"}');
  expect(stripStylesheetComments('a{background:url(http://h/*.png)}')).toBe('a{background:url(http://h/*.png)}');
});

it('@import 挪到最前面，其余内容顺序不变', () => {
  expect(moveCssImportsFirst('a{}@import "x.css";b{}')).toBe('@import "x.css";\na{}b{}');
  expect(moveCssImportsFirst('a{}')).toBe('a{}');
});

it('开头的 @charset / @import / @layer 之后才是正文', () => {
  const css = '@charset "utf-8"; @layer a;\nbody{}';
  expect(css.slice(leadingStylesheetAtRuleEnd(css)).trimStart()).toBe('body{}');
});

it('本地样式表的 @import 递归内联，重复引用只内联一次', () => {
  const files = {
    'main.css': '@import "a.css";\n@import "a.css";\nmain{}',
    'a.css': 'a{}',
  };
  expect(inlineStylesheetImports('main.css', files, new Set())).toBe('a{}\n\n\n\nmain{}');
});

it('找不到的、带媒体条件的 @import 原样保留；排在正文之后的被丢弃', () => {
  const files = { 'main.css': '@import "a.css" print;\n@import "gone.css";\nmain{}@import "late.css";', 'a.css': 'a{}' };
  expect(inlineStylesheetImports('main.css', files, new Set())).toBe('@import "a.css" print;\n@import "gone.css";\nmain{}');
});

it('样式表有 @import 或引用了被改动的文件时不算独立', () => {
  const files = { 'a.css': 'a{background:url(x.png)}', 'x.png': 'AAA', 'b.css': '@import "a.css";' };
  expect(isStandaloneStylesheet('a.css', files, files)).toBe(false);
  expect(isStandaloneStylesheet('b.css', files, files)).toBe(false);
  expect(isStandaloneStylesheet('a.css', { 'a.css': 'a{color:red}' }, {})).toBe(true);
});

it('识别站点根路径引用，并转义 noscript 前的 <', () => {
  expect(hasRootRelativeCssReference('a{background:url(/x.png)}')).toBe(true);
  expect(hasRootRelativeCssReference('a{background:url(//cdn/x.png)}')).toBe(false);
  expect(escapeNoscriptInCss('</noscript>')).toBe('\\3c /noscript>');
});
