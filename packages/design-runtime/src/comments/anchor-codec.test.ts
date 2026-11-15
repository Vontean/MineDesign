import { expect, it } from 'vitest';
import {
  decodeAnchorArea,
  encodeAnchorArea,
  encodeAnchorFraction,
  encodeSignedAnchorCoordinate,
  isValidAnchorElementPath,
  parseDesignCommentAnchor,
  serializeDesignCommentAnchor,
  stableAnchorHash,
} from './anchor-codec';

it('比例编码为 4 位数字，非有限数按 0.5，越界截到 0–1', () => {
  expect([0, 0.5, 1, 2, -1, NaN].map(encodeAnchorFraction)).toEqual(['0000', '5000', '9999', '9999', '0000', '5000']);
  expect(encodeSignedAnchorCoordinate(-12)).toBe('n0000012');
  expect(encodeSignedAnchorCoordinate(Infinity)).toBe('p0000000');
});

it('区域编码为百分比格子（右下边界取前一格，解码时补回）；可带角序号', () => {
  const encoded = encodeAnchorArea({ x0: 0.1, y0: 0.2, x1: 0.5, y1: 0.9, corner: 2 });
  expect(encoded).toBe('10204989' + '2');
  expect(decodeAnchorArea(encoded)).toEqual({ x0: 0.1, y0: 0.2, x1: 0.5, y1: 0.9, corner: 2 });
  expect(decodeAnchorArea('50500000')).toBeNull();
});

it('元素路径要求每段都是简单选择器，只有第一段可以是 #id', () => {
  expect(isValidAnchorElementPath('#root > div:nth-of-type(2)')).toBe(true);
  expect(isValidAnchorElementPath('div:nth-of-type(1) > #root')).toBe(false);
  expect(isValidAnchorElementPath('dct:nth-of-type(1)')).toBe(false);
});

it('元素锚点序列化后能解析回哈希与位置', () => {
  const text = serializeDesignCommentAnchor({ kind: 'el', path: 'div:nth-of-type(1) > p:nth-of-type(2)', tid: 3, file: 'a.html', fx: 0.25, fy: 1 });
  expect(text).toBe(`div:nth-of-type(1) > p:nth-of-type(2) > dct:nth-of-type(4) > dce${stableAnchorHash('a.html')}25009999:nth-of-type(1)`);
  expect(parseDesignCommentAnchor(text)).toEqual({
    kind: 'el',
    fileHash: stableAnchorHash('a.html'),
    path: 'div:nth-of-type(1) > p:nth-of-type(2)',
    tid: 3,
    fx: 2500 / 9999,
    fy: 1,
  });
});

it('画布、备注、区域锚点各自往返', () => {
  const canvas = serializeDesignCommentAnchor({ kind: 'canvas', page: 'p1', x: -5, y: 40 });
  expect(parseDesignCommentAnchor(canvas)).toEqual({ kind: 'canvas', pageHash: stableAnchorHash('p1'), x: -5, y: 40 });
  const note = serializeDesignCommentAnchor({ kind: 'note', id: 'n1' });
  expect(parseDesignCommentAnchor(note)).toEqual({ kind: 'note', idHash: stableAnchorHash('n1') });
  const area = serializeDesignCommentAnchor({ kind: 'area', file: 'a.html', box: { x0: 0, y0: 0, x1: 0.5, y1: 0.5 } });
  expect(parseDesignCommentAnchor(area)).toMatchObject({ kind: 'area', path: null, tid: null, box: { x0: 0, y0: 0, x1: 0.5, y1: 0.5 } });
});

it('多画板锚点：画板数 1–7，覆盖比例按 9 档，解析时要求画板片段升序', () => {
  const boards = [{ file: 'b', cov: 1 }, { file: 'a', cov: 0.5 }];
  const text = serializeDesignCommentAnchor({ kind: 'boards', page: 'p', boards, box: { x0: 0, y0: 0, x1: 1, y1: 1 } });
  expect(parseDesignCommentAnchor(text)).toMatchObject({ kind: 'boards', pageHash: stableAnchorHash('p') });
  expect(serializeDesignCommentAnchor({ kind: 'boards', page: 'p', boards: [], box: { x0: 0, y0: 0, x1: 1, y1: 1 } })).toBeNull();
});

it('格式不对的字符串解析为 null', () => {
  expect(parseDesignCommentAnchor('')).toBeNull();
  expect(parseDesignCommentAnchor(null)).toBeNull();
  expect(parseDesignCommentAnchor('div:nth-of-type(1)')).toBeNull();
  expect(serializeDesignCommentAnchor({ kind: 'el', path: 'bad path', file: 'a', fx: 0, fy: 0 })).toBeNull();
});
