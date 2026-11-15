import { expect, it } from 'vitest';
import {
  artboardsCoveredByCommentArea,
  commentAreaHandlePoint,
  commentAreaWithinArtboardContent,
  createCommentOperationToken,
  denormalizeCommentArea,
  describeCommentAreaLocation,
  intersectCommentRects,
  nearestCommentAreaCorner,
  normalizeCommentArea,
  unionCommentRects,
} from './area-geometry';

it('矩形相交返回重叠部分；只贴边或不相交返回 null', () => {
  expect(intersectCommentRects({ x: 0, y: 0, w: 100, h: 100 }, { x: 50, y: 60, w: 100, h: 100 })).toEqual({ x: 50, y: 60, w: 50, h: 40 });
  expect(intersectCommentRects({ x: 0, y: 0, w: 10, h: 10 }, { x: 10, y: 0, w: 10, h: 10 })).toBeNull();
});

it('区域归一化后能还原；超出盒子的部分被截到 0–1', () => {
  const box = { x: 100, y: 100, w: 200, h: 100 };
  expect(normalizeCommentArea({ x: 150, y: 120, w: 100, h: 50 }, box)).toEqual({ x0: 0.25, y0: 0.2, x1: 0.75, y1: 0.7 });
  expect(denormalizeCommentArea(box, { x0: 0.25, y0: 0.25, x1: 0.75, y1: 0.75 })).toEqual({ x: 150, y: 125, w: 100, h: 50 });
  expect(normalizeCommentArea({ x: 0, y: 0, w: 1000, h: 1000 }, box)).toEqual({ x0: 0, y0: 0, x1: 1, y1: 1 });
});

it('评论区域只覆盖画板很小一角时忽略该画板；超过 limit 时保留相交面积最大的', () => {
  const area = { x: 0, y: 0, w: 1000, h: 100 };
  const big = { board: 'big', frame: { x: 0, y: 0, w: 400, h: 100 } };
  const mid = { board: 'mid', frame: { x: 500, y: 0, w: 200, h: 100 } };
  const corner = { board: 'corner', frame: { x: 990, y: 90, w: 500, h: 500 } };
  expect(artboardsCoveredByCommentArea(area, [big, mid, corner]).map((item) => item.board)).toEqual(['big', 'mid']);
  expect(artboardsCoveredByCommentArea(area, [mid, big], 1).map((item) => item.board)).toEqual(['big']);
  expect(artboardsCoveredByCommentArea(area, [mid])[0]).toMatchObject({ cov: 1, b: { x0: 0, y0: 0, x1: 1, y1: 1 } });
});

it('相交部分换算到画板内容盒；内容盒无面积或区域落空时返回 null', () => {
  const covered = { frame: { x: 0, y: 0, w: 400, h: 400 }, inter: { x: 100, y: 100, w: 100, h: 100 } };
  expect(commentAreaWithinArtboardContent(covered, { x: 0, y: 0, w: 400, h: 400 })).toEqual({ x0: 0.25, y0: 0.25, x1: 0.5, y1: 0.5 });
  expect(commentAreaWithinArtboardContent(covered, { x: 0, y: 0, w: 0, h: 400 })).toBeNull();
  expect(commentAreaWithinArtboardContent(covered, { x: 300, y: 300, w: 50, h: 50 })).toBeNull();
});

it('求并集、最近的角与手柄位置', () => {
  expect(unionCommentRects([])).toBeNull();
  expect(unionCommentRects([{ x: 0, y: 0, w: 10, h: 10 }, { x: 20, y: 5, w: 10, h: 10 }])).toEqual({ x: 0, y: 0, w: 30, h: 15 });
  const box = { x: 0, y: 0, w: 100, h: 100 };
  expect([{ x: 10, y: 10 }, { x: 90, y: 10 }, { x: 10, y: 90 }, { x: 90, y: 90 }].map((p) => nearestCommentAreaCorner(box, p))).toEqual([0, 1, 2, 3]);
  expect(commentAreaHandlePoint(box, 3)).toEqual({ x: 100, y: 100 });
  expect(commentAreaHandlePoint(box, null)).toEqual({ x: 50, y: 50 });
});

it('用文字描述区域位置；覆盖大部分画板时不描述', () => {
  expect(describeCommentAreaLocation({ x0: 0, y0: 0, x1: 1, y1: 1 }, 0.9)).toBe('');
  expect(describeCommentAreaLocation({ x0: 0, y0: 0.4, x1: 0.1, y1: 0.6 }, 0.1)).toBe('left edge');
  expect(describeCommentAreaLocation({ x0: 0, y0: 0, x1: 1, y1: 0.4 }, 0.4)).toBe('top half');
  expect(describeCommentAreaLocation({ x0: 0.4, y0: 0.4, x1: 0.6, y1: 0.6 }, 0.04)).toBe('middle centre');
  expect(describeCommentAreaLocation({ x0: 0.1, y0: 0.1, x1: 0.9, y1: 0.9 }, 0.5)).toBe('part');
});

it('操作令牌：新开始或取消后，旧操作不再有效', () => {
  const token = createCommentOperationToken();
  const first = token.begin();
  expect(first.live).toBe(true);
  const second = token.begin();
  expect([first.live, second.live]).toEqual([false, true]);
  token.cancel();
  expect(second.live).toBe(false);
});
