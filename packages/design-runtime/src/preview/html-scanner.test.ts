import { beforeAll, expect, it } from 'vitest';
import { installPreviewComponentImports } from './component-imports';
import {
  findHtmlTags,
  getHtmlAttribute,
  maskHtmlRawContent,
  parseHtmlAttributes,
  scanHtmlTagEnd,
  scanHtmlTags,
} from './html-scanner';

beforeAll(() => installPreviewComponentImports()());

it('标签名统一小写，结束标签、声明的名称为空', () => {
  const html = '<!doctype html><DIV id=a></div>';
  expect(scanHtmlTags(html).map((t) => t.name)).toEqual(['', 'div', '']);
  expect(findHtmlTags(html, 'div')).toEqual([[15, 25]]);
});

it('属性值里的 > 不会提前结束标签', () => {
  const tag = '<a title="x>y" href=z>';
  expect(scanHtmlTagEnd(tag, 2)).toBe(tag.length - 1);
  expect(scanHtmlTagEnd('<a title="x', 2)).toBe(-1);
});

it('属性名转小写，值解码实体；重复属性默认后者覆盖，可改为先到先得', () => {
  const tag = '<a HREF="x&amp;y" b=1 b=2 c>';
  expect(parseHtmlAttributes(tag, [])).toEqual({ href: 'x&y', b: '2', c: '' });
  expect(parseHtmlAttributes(tag, ['c'], true)).toEqual({ href: 'x&y', b: '1' });
  expect(getHtmlAttribute(tag, 'href')).toBe('x&y');
  expect(getHtmlAttribute(tag, 'nope')).toBeNull();
});

it('script 内容和注释里的假标签不会被当成标签', () => {
  const html = '<script>if (a<b) "<div>"</script><!-- <p> --><span>';
  expect(scanHtmlTags(html).map((t) => t.name)).toEqual(['script', '', 'span']);
});

it('遮罩把注释和原始文本换成等长空格，bodies 为 keep 时保留正文', () => {
  const html = 'a<!--c--><style>b{}</style>z';
  expect(maskHtmlRawContent(html)).toBe('a' + ' '.repeat(8) + '<style>' + '   ' + '</style>z');
  expect(maskHtmlRawContent(html, { bodies: 'keep' })).toBe('a' + ' '.repeat(8) + '<style>b{}</style>z');
});

it('svg 里的 script 不算原始文本，跳出 svg 的 HTML 标签后才恢复', () => {
  const ranges: [number, number][] = [];
  scanHtmlTags('<svg><script>a</script></svg>', ranges);
  expect(ranges).toEqual([]);
  scanHtmlTags('<svg><div><script>a</script>', ranges);
  expect(ranges).toEqual([[18, 19]]);
});
