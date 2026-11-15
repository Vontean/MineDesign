import { beforeAll, expect, it } from 'vitest';
import { installPlatformFileContent } from '../platform/file-content';
import {
  moveObjectCommentArea,
  normalizeObjectCommentArea,
  normalizeObjectCommentPoint,
  objectCommentAreaHandlePoint,
  objectCommentAreaRect,
  objectCommentFractions,
  objectCommentPoint,
  objectsCoveredByCommentArea,
  pointWithinCommentObject,
  rotateObjectCommentPoint,
} from './object-geometry';

// annotationRotation 在平台模块初始化时赋值
beforeAll(() => {
  installPlatformFileContent()();
});

const box = { x: 100, y: 100, w: 200, h: 100 };
const rect = { kind: 'rect', x: 100, y: 100, x2: 0, y2: 0 };

it('绕中心旋转 90 度；角度为 0 时原样返回', () => {
  const p = rotateObjectCommentPoint({ x: 10, y: 0 }, { x: 0, y: 0 }, 90);
  expect(p.x).toBeCloseTo(0);
  expect(p.y).toBeCloseTo(10);
  const same = { x: 1, y: 2 };
  expect(rotateObjectCommentPoint(same, { x: 0, y: 0 }, 0)).toBe(same);
});

it('锚点与画布坐标互相换算，翻转时镜像', () => {
  expect(normalizeObjectCommentPoint(rect, box, { x: 200, y: 150 })).toEqual({ fx: 0.5, fy: 0.5 });
  expect(normalizeObjectCommentPoint(rect, box, { x: 900, y: -50 })).toEqual({ fx: 1, fy: 0 });
  expect(objectCommentPoint(rect, box, { fx: 0.25, fy: 0.5 })).toEqual({ x: 150, y: 150 });
  expect(objectCommentFractions({ ...rect, flipX: true }, box, { x: 150, y: 150 })).toEqual({ fx: 0.75, fy: 0.5 });
});

it('线条的锚点是投影到线段上的位置', () => {
  const line = { kind: 'line', x: 0, y: 0, x2: 100, y2: 0 };
  expect(normalizeObjectCommentPoint(line, box, { x: 25, y: 40 })).toEqual({ fx: 0.25, fy: 0.5 });
  expect(objectCommentPoint(line, box, { fx: 0.5, fy: 0.5 })).toEqual({ x: 50, y: 0 });
  expect(normalizeObjectCommentPoint({ ...line, x2: 0 }, box, { x: 5, y: 5 })).toEqual({ fx: 0.5, fy: 0.5 });
});

it('椭圆只认椭圆内部，矩形认整个包围盒', () => {
  const corner = { x: 105, y: 105 };
  expect(pointWithinCommentObject({ ...rect, kind: 'oval' }, box, corner)).toBe(false);
  expect(pointWithinCommentObject(rect, box, corner)).toBe(true);
});

it('画布区域归一化到对象内；线条返回 null；给出角序号时带 corner', () => {
  const area = { x: 100, y: 100, w: 100, h: 50 };
  expect(normalizeObjectCommentArea(rect, box, area)).toEqual({ x0: 0, y0: 0, x1: 0.5, y1: 0.5 });
  expect(normalizeObjectCommentArea(rect, box, area, 3)).toEqual({ x0: 0, y0: 0, x1: 0.5, y1: 0.5, corner: 3 });
  expect(normalizeObjectCommentArea({ ...rect, kind: 'arrow' }, box, area)).toBeNull();
});

it('区域换算回画布矩形与手柄位置', () => {
  const area = { x0: 0, y0: 0, x1: 0.5, y1: 0.5, corner: 3 };
  expect(objectCommentAreaRect(rect, box, area)).toEqual({ x: 100, y: 100, w: 100, h: 50, deg: 0 });
  expect(objectCommentAreaHandlePoint(rect, box, area)).toEqual({ x: 200, y: 150 });
});

it('平移区域时位移取到百分位，并停在对象边缘', () => {
  const area = { x0: 0.2, y0: 0.2, x1: 0.6, y1: 0.6 };
  const moved = moveObjectCommentArea(rect, box, area, { x: 100, y: 100 }, { x: 120, y: 100 });
  expect(moved.x0).toBeCloseTo(0.3);
  expect(moved.x1).toBeCloseTo(0.7);
  expect(moved.y0).toBe(0.2);
  const far = moveObjectCommentArea(rect, box, area, { x: 100, y: 100 }, { x: 900, y: 100 });
  expect(far.x1).toBeCloseTo(1);
});

it('评论区域覆盖的对象：被上层遮挡的不算，遮挡型对象之下的不算', () => {
  const make = (object: string, bounds: { x: number; y: number; w: number; h: number }, hides = false) => ({
    object,
    bounds,
    solid: true,
    hides,
    on: () => true,
  });
  const area = { x: 10, y: 10, w: 80, h: 80 };
  const below = make('below', { x: 0, y: 0, w: 100, h: 100 });
  const above = make('above', { x: 0, y: 0, w: 100, h: 100 }, true);
  expect(objectsCoveredByCommentArea(area, [below, above])).toEqual(['above']);
  expect(objectsCoveredByCommentArea({ x: 0, y: 0, w: 0, h: 10 }, [below])).toEqual([]);
});
