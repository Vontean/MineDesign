import { expect, it, vi } from 'vitest';

vi.mock('../collaboration/selection-paths', () => ({ encodeArtboardSelectionPath: () => null }));
vi.mock('../editor/insert/element-kinds', () => ({ classifyElementStyleKind: (tag: string) => (tag === 'div' ? 'box' : 'other') }));
import {
  commentAnchorShortLabel,
  commentArtboardAreaDetail,
  commentArtboardAreaShortLabel,
  commentElementDetail,
  commentObjectAreaDetail,
  commentObjectPointDetail,
  commentSurfaceAriaLabel,
  defaultArtboardCommentPoint,
  describeCommentElement,
  shortenCommentLabelText,
  truncateCommentLabelBytes,
  clampCommentAreaToViewport,
} from './labels';

it('文字压缩空白、引号换弯引号，过长时截断加省略号', () => {
  expect(shortenCommentLabelText('  a \n b "c" ')).toBe('a b ’c’');
  expect(shortenCommentLabelText('abcdefghij', 5)).toBe('abcd…');
  expect(shortenCommentLabelText(null)).toBe('');
});

it('按 UTF-8 字节截断，不会拆开多字节字符', () => {
  expect(truncateCommentLabelBytes('abc', 10)).toBe('abc');
  const cut = truncateCommentLabelBytes('中文标题很长', 10);
  expect(new TextEncoder().encode(cut).length).toBeLessThanOrEqual(10);
  expect(cut.endsWith('…')).toBe(true);
});

it('锚点的简短标题：画板用标题或去掉扩展名的文件名，元素附上类别和文字', () => {
  const board = { file: 'home.dc.html' };
  expect(commentAnchorShortLabel({ kind: 'artboard', board })).toBe('home');
  expect(commentAnchorShortLabel({ kind: 'el', board: { file: 'x', title: ' 首页 ' }, el: { kind: 'box', text: 'Hi' } })).toBe('首页 › shape "Hi"');
  expect(commentAnchorShortLabel({ kind: 'canvas' })).toBe('Canvas');
  expect(commentAnchorShortLabel({ kind: 'note', note: { text: '第一行\n第二行' } })).toBe('Note "第一行"');
});

it('画布评论的朗读文案带当前页面名', () => {
  const pages = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
  expect(commentSurfaceAriaLabel({ kind: 'canvas', pages, pageKey: 2 })).toBe('Comment on the canvas, page B');
  expect(commentSurfaceAriaLabel({ kind: 'canvas', pages: [pages[0]] })).toBe('Comment on the canvas');
});

it('区域覆盖多块画板：只有一块时带位置与元素数，多块时列出名称', () => {
  const els = [{ path: 3, kind: 'box', text: 'Buy' }];
  expect(commentArtboardAreaShortLabel([{ board: { file: 'a.dc.html' }, cov: 0.4, part: 'top half', els }])).toBe('a (top half) \xB7 1 element');
  expect(commentArtboardAreaShortLabel([{ board: { file: 'a.dc.html' }, cov: 1 }, { board: { file: 'b.dc.html' }, cov: 0.3, part: 'left side' }])).toBe(
    'Artboards: a, b (left side)',
  );
  expect(commentArtboardAreaDetail([{ board: { file: 'a.dc.html' }, cov: 0.4, part: 'top half', els }])).toBe(
    'Area over a.dc.html (top half): #3 shape "Buy"',
  );
});

it('对象评论的描述不超过 512 字节，文字过长时先缩短', () => {
  const object = { kind: 'rect', text: 'x'.repeat(2000) };
  const detail = commentObjectPointDetail(object, { fx: 0.5, fy: 0.25 });
  expect(new TextEncoder().encode(detail).length).toBeLessThanOrEqual(512);
  expect(commentObjectAreaDetail({ kind: 'oval' }, { x0: 0, y0: 0, x1: 1, y1: 1 })).toBe('area over oval (whole)');
  expect(commentElementDetail({ path: 7, kind: 'box', text: 'Hi' })).toBe('#7 shape');
  expect(commentElementDetail({ path: 7, kind: 'box', text: 'Hi' }, 40)).toBe('#7 shape "Hi"');
});

it('元素类别优先取视图里的，否则按标签名推断', () => {
  const model = { viewEntries: () => [{ kind: 'text', words: () => 'hello' }] };
  expect(describeCommentElement(model, { tid: 1 })).toEqual({ kind: 'text', text: 'hello' });
  expect(describeCommentElement(null, { tag: 'div', text: 'x' })).toEqual({ kind: 'box', text: 'x' });
});

it('默认评论点在画板右上角内缩；视口内的区域至少 8 像素', () => {
  expect(defaultArtboardCommentPoint({ w: 400, h: 400 }, 1)).toEqual({ fx: 1 - 16 / 400, fy: 16 / 400 });
  expect(defaultArtboardCommentPoint({ w: 40, h: 40 })).toEqual({ fx: 0.75, fy: 0.25 });
  expect(clampCommentAreaToViewport({ x: -10, y: 95, w: 2, h: 50 }, 100, 100)).toEqual({ x: 0, y: 92, w: 8, h: 8 });
});
