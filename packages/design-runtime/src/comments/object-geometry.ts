/** 评论锚到对象上时的几何：对象内的相对位置（0–1）、旋转与翻转、对象与评论区域的覆盖判断。 */
import { annotationRotation } from '../platform/file-content';
import {
  clampCommentFraction,
  nearestCommentAreaCorner,
  type CommentArea,
  type CommentPoint,
  type CommentRect,
} from './area-geometry';

/** 对象内的相对位置，fx、fy 通常在 0–1。 */
export interface ObjectCommentFractions {
  fx: number;
  fy: number;
}

/** 评论所在的对象；line、arrow 用两个端点，其他对象用包围盒加旋转与翻转。 */
export interface CommentObject {
  kind?: string;
  x: number;
  y: number;
  x2: number;
  y2: number;
  flipX?: unknown;
  flipY?: unknown;
  rotate?: unknown;
}

/** 对象内的归一化区域；corner 记录拖动的角（0 左上、1 右上、2 左下、3 右下）。 */
export interface ObjectCommentArea extends CommentArea {
  corner?: number | null;
}

export interface ObjectCommentAreaRect extends CommentRect {
  deg: number;
}

/** 参与覆盖判断的对象：包围盒、是否实心（挡住下层）、是否遮挡、点是否落在其形状内。 */
export interface CoverableObject<Object = unknown> {
  object: Object;
  bounds: CommentRect;
  solid?: boolean;
  hides?: boolean;
  on(point: CommentPoint): boolean;
}

export const clampObjectCommentFraction = clampCommentFraction;

/** 评论区域至少要占到对象面积的这个比例，才算覆盖。 */
export const commentObjectCoverageThreshold = 0.5;

/** 绕 origin 旋转 degrees 度；角度为 0 或空时原样返回 point。 */
export const rotateObjectCommentPoint = (point: CommentPoint, origin: CommentPoint, degrees: number): CommentPoint => {
  if (!degrees) return point;
  const radians = (degrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  return {
    x: origin.x + dx * cos - dy * sin,
    y: origin.y + dx * sin + dy * cos,
  };
};

/** 画布坐标换算成对象内的相对位置（先抵消旋转，再处理翻转）。 */
export const objectCommentFractions = (
  object: CommentObject,
  box: CommentRect,
  point: CommentPoint,
): ObjectCommentFractions => {
  const unrotated = rotateObjectCommentPoint(
    point,
    { x: box.x + box.w / 2, y: box.y + box.h / 2 },
    -annotationRotation(object),
  );
  const fx = (unrotated.x - box.x) / box.w;
  const fy = (unrotated.y - box.y) / box.h;
  return {
    fx: object.flipX === true ? 1 - fx : fx,
    fy: object.flipY === true ? 1 - fy : fy,
  };
};

/** 两个矩形的重叠面积。 */
export const commentRectOverlapArea = (a: CommentRect, b: CommentRect): number =>
  Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) *
  Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));

/** 画布坐标换算成评论锚点；线条按投影到线段上的位置，其他对象按包围盒比例。 */
export function normalizeObjectCommentPoint(
  object: CommentObject,
  box: CommentRect,
  point: CommentPoint,
): ObjectCommentFractions {
  if (object.kind === 'line' || object.kind === 'arrow') {
    const dx = object.x2 - object.x;
    const dy = object.y2 - object.y;
    const lengthSquared = dx * dx + dy * dy;
    return {
      fx:
        lengthSquared > 0
          ? clampObjectCommentFraction(((point.x - object.x) * dx + (point.y - object.y) * dy) / lengthSquared)
          : 0.5,
      fy: 0.5,
    };
  }
  const fractions = objectCommentFractions(object, box, point);
  return {
    fx: box.w > 0 ? clampObjectCommentFraction(fractions.fx) : 0.5,
    fy: box.h > 0 ? clampObjectCommentFraction(fractions.fy) : 0.5,
  };
}

/** 评论锚点换算回画布坐标。 */
export function objectCommentPoint(
  object: CommentObject,
  box: CommentRect,
  fractions: ObjectCommentFractions,
): CommentPoint {
  if (object.kind === 'line' || object.kind === 'arrow') {
    return {
      x: object.x + fractions.fx * (object.x2 - object.x),
      y: object.y + fractions.fx * (object.y2 - object.y),
    };
  }
  const fx = object.flipX === true ? 1 - fractions.fx : fractions.fx;
  const fy = object.flipY === true ? 1 - fractions.fy : fractions.fy;
  return rotateObjectCommentPoint(
    { x: box.x + fx * box.w, y: box.y + fy * box.h },
    { x: box.x + box.w / 2, y: box.y + box.h / 2 },
    annotationRotation(object),
  );
}

/** 点是否落在对象内；椭圆按椭圆判断，其他按包围盒。 */
export function pointWithinCommentObject(object: CommentObject, box: CommentRect, point: CommentPoint): boolean {
  const { fx, fy } = objectCommentFractions(object, box, point);
  return object.kind === 'oval'
    ? (2 * fx - 1) ** 2 + (2 * fy - 1) ** 2 <= 1
    : fx >= 0 && fx <= 1 && fy >= 0 && fy <= 1;
}

/**
 * 评论区域覆盖到的对象（由上到下）。被上层完全遮挡的对象不算；
 * 实心对象盖住区域时，它下面的对象也不算。limit 为真时只保留遮挡型对象。
 */
export function objectsCoveredByCommentArea<Object>(
  area: CommentRect,
  objects: readonly CoverableObject<Object>[],
  limit?: unknown,
): Object[] {
  const areaSize = area.w * area.h;
  if (!(areaSize > 0)) return [];
  const centerOf = (rect: CommentRect): CommentPoint => ({ x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 });
  const hiddenByUpper = (rect: CommentRect, index: number): boolean =>
    objects.some(
      (upper, upperIndex) =>
        upperIndex > index &&
        upper.hides &&
        upper.on(centerOf(rect)) &&
        upper.on(centerOf(area)) &&
        commentRectOverlapArea(rect, upper.bounds) >= 0.85 * rect.w * rect.h,
    );
  const visible = objects
    .map((object, index) => ({
      o: object,
      i: index,
      ov: commentRectOverlapArea(area, object.bounds),
      own: object.bounds.w * object.bounds.h,
    }))
    .filter(({ o, i }) => !hiddenByUpper(o.bounds, i))
    .reverse();
  const covering = visible.filter(({ o, ov }) => o.solid && o.on(centerOf(area)) && ov >= 0.85 * areaSize);
  const floor = covering.find(({ o }) => o.hides)?.i ?? -1;
  const touched = visible.filter(
    ({ o, i, ov, own }) =>
      i >= floor && own > 0 && ov >= 0.7 * own && ov >= commentObjectCoverageThreshold * areaSize && (o.hides || !limit),
  );
  return [...new Set([...touched, ...covering].map((entry) => entry.o.object))];
}

/**
 * 画布区域换算成对象内的归一化区域；线条、无面积的包围盒或结果为空时返回 null。
 * cornerIndex 是拖动的角在四个角（左上、右上、左下、右下）中的序号，给出时结果带 corner。
 */
export function normalizeObjectCommentArea(
  object: CommentObject,
  box: CommentRect,
  area: CommentRect,
  cornerIndex?: number | null,
): ObjectCommentArea | null {
  if (!(box.w > 0 && box.h > 0) || object.kind === 'line' || object.kind === 'arrow') return null;
  const corners = [area.y, area.y + area.h].flatMap((y) =>
    [area.x, area.x + area.w].map((x) => objectCommentFractions(object, box, { x, y })),
  );
  const xs = corners.map((corner) => corner.fx);
  const ys = corners.map((corner) => corner.fy);
  const normalized: ObjectCommentArea = {
    x0: clampObjectCommentFraction(Math.min(...xs)),
    y0: clampObjectCommentFraction(Math.min(...ys)),
    x1: clampObjectCommentFraction(Math.max(...xs)),
    y1: clampObjectCommentFraction(Math.max(...ys)),
  };
  if (!(normalized.x1 > normalized.x0 && normalized.y1 > normalized.y0)) return null;
  if (cornerIndex == null) return normalized;
  return {
    ...normalized,
    corner: nearestCommentAreaCorner(
      {
        x: normalized.x0,
        y: normalized.y0,
        w: normalized.x1 - normalized.x0,
        h: normalized.y1 - normalized.y0,
      },
      { x: corners[cornerIndex].fx, y: corners[cornerIndex].fy },
    ),
  };
}

/** 对象内的归一化区域换算成画布上的矩形（带旋转角度 deg）。 */
export function objectCommentAreaRect(
  object: CommentObject,
  box: CommentRect,
  area: ObjectCommentArea,
): ObjectCommentAreaRect {
  const center = objectCommentPoint(object, box, { fx: (area.x0 + area.x1) / 2, fy: (area.y0 + area.y1) / 2 });
  const width = (area.x1 - area.x0) * box.w;
  const height = (area.y1 - area.y0) * box.h;
  return {
    x: center.x - width / 2,
    y: center.y - height / 2,
    w: width,
    h: height,
    deg: annotationRotation(object),
  };
}

/** 区域拖动手柄在画布上的位置；没有 corner 时取中心。 */
export function objectCommentAreaHandlePoint(
  object: CommentObject,
  box: CommentRect,
  area: ObjectCommentArea,
): CommentPoint {
  const corner = area.corner;
  return objectCommentPoint(
    object,
    box,
    corner == null
      ? { fx: (area.x0 + area.x1) / 2, fy: (area.y0 + area.y1) / 2 }
      : { fx: corner & 1 ? area.x1 : area.x0, fy: corner & 2 ? area.y1 : area.y0 },
  );
}

/** 按起止两点的位移平移区域；位移取到百分位，并限制在对象内。 */
export function moveObjectCommentArea(
  object: CommentObject,
  box: CommentRect,
  area: ObjectCommentArea,
  startPoint: CommentPoint,
  endPoint: CommentPoint,
): ObjectCommentArea {
  if (!(box.w > 0 && box.h > 0)) return area;
  const start = objectCommentFractions(object, box, startPoint);
  const end = objectCommentFractions(object, box, endPoint);
  const clampShift = (delta: number, low: number, high: number): number =>
    Math.min(1 - high, Math.max(-low, Math.round(delta * 100) / 100));
  const shiftX = clampShift(end.fx - start.fx, area.x0, area.x1);
  const shiftY = clampShift(end.fy - start.fy, area.y0, area.y1);
  return {
    ...area,
    x0: area.x0 + shiftX,
    y0: area.y0 + shiftY,
    x1: area.x1 + shiftX,
    y1: area.y1 + shiftY,
  };
}
