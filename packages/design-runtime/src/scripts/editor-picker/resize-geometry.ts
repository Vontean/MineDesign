import type { Dynamic } from "../../runtime-types";

export const expandThinBounds: Dynamic = function (
  this: Dynamic,
  bounds?: Dynamic,
  minimumSize?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  const shouldExpandAxis: Dynamic = (
    primarySize?: Dynamic,
    orthogonalSize?: Dynamic,
    ..._unusedPredicateArgs: Dynamic[]
  ): Dynamic => primarySize < minimumSize && (orthogonalSize >= minimumSize || (primarySize === 0 && orthogonalSize > 0));
  return shouldExpandAxis(bounds.height, bounds.width)
    ? {
        left: bounds.left,
        top: bounds.top - (minimumSize - bounds.height) / 2,
        width: bounds.width,
        height: minimumSize,
      }
    : shouldExpandAxis(bounds.width, bounds.height)
      ? {
          left: bounds.left - (minimumSize - bounds.width) / 2,
          top: bounds.top,
          width: minimumSize,
          height: bounds.height,
        }
      : bounds;
};
export const getGroupResizeLimits: Dynamic = function (
  this: Dynamic,
  groupBounds?: Dynamic,
  members?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  let [minScaleX, minScaleY, maxScaleX, maxScaleY]: Dynamic = [0, 0, 1 / 0, 1 / 0];
  for (const member of members as Dynamic) {
    if (member.w > 0 && member.min?.w !== undefined && member.w >= member.min.w) {
      minScaleX = Math.max(minScaleX, member.min.w / member.w);
    }
    if (member.h > 0 && member.min?.h !== undefined && member.h >= member.min.h) {
      minScaleY = Math.max(minScaleY, member.min.h / member.h);
    }
    if (member.w > 0 && member.max?.w !== undefined && member.w <= member.max.w) {
      maxScaleX = Math.min(maxScaleX, member.max.w / member.w);
    }
    if (member.h > 0 && member.max?.h !== undefined && member.h <= member.max.h) {
      maxScaleY = Math.min(maxScaleY, member.max.h / member.h);
    }
  }
  const scaleLimit: Dynamic = (
    size?: Dynamic,
    scale?: Dynamic,
    ..._unusedScaleArgs: Dynamic[]
  ): Dynamic => (scale === 1 / 0 ? 1 / 0 : size * scale);
  return {
    min: {
      w: groupBounds.w * minScaleX,
      h: groupBounds.h * minScaleY,
    },
    max: {
      w: scaleLimit(groupBounds.w, maxScaleX),
      h: scaleLimit(groupBounds.h, maxScaleY),
    },
  };
};
export const scalePointBetweenBoxes: Dynamic = function (
  this: Dynamic,
  point?: Dynamic,
  originalBox?: Dynamic,
  nextBox?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  const [scaleX, scaleY]: Dynamic = [
    originalBox.w > 0 ? nextBox.w / originalBox.w : 1,
    originalBox.h > 0 ? nextBox.h / originalBox.h : 1,
  ];
  return {
    x: nextBox.x + (point.x - originalBox.x) * scaleX,
    y: nextBox.y + (point.y - originalBox.y) * scaleY,
  };
};
export const rotatePointAround: Dynamic = function (
  this: Dynamic,
  point?: Dynamic,
  center?: Dynamic,
  degrees?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  const radians: Dynamic = (degrees * Math.PI) / 180;
  const [cos, sin, deltaX, deltaY]: Dynamic = [
    Math.cos(radians),
    Math.sin(radians),
    point.x - center.x,
    point.y - center.y,
  ];
  return {
    x: center.x + deltaX * cos - deltaY * sin,
    y: center.y + deltaX * sin + deltaY * cos,
  };
};
export const snapRotationAngle: Dynamic = function (
  this: Dynamic,
  degrees?: Dynamic,
  snapIncrement?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  let snappedAngle: Dynamic = snapIncrement
    ? Math.round(degrees / 15) * 15
    : Math.round(degrees);
  const nearestRightAngle: Dynamic = Math.round(degrees / 90) * 90;
  if (!snapIncrement && Math.abs(degrees - nearestRightAngle) <= 3) {
    snappedAngle = nearestRightAngle;
  }
  snappedAngle = ((snappedAngle % 360) + 360) % 360;
  return snappedAngle > 180 ? snappedAngle - 360 : snappedAngle;
};
export const snapLineAngle: Dynamic = function (
  this: Dynamic,
  startPoint?: Dynamic,
  endPoint?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  const deltaX: Dynamic = endPoint.x - startPoint.x;
  const deltaY: Dynamic = endPoint.y - startPoint.y;
  const length: Dynamic = Math.hypot(deltaX, deltaY);
  const directionIndex: Dynamic =
    ((Math.round(Math.atan2(deltaY, deltaX) / (Math.PI / 4)) % 8) + 8) % 8;
  const diagonalComponent: Dynamic = Math.SQRT1_2;
  const directionX: Dynamic = [1, diagonalComponent, 0, -diagonalComponent, -1, -diagonalComponent, 0, diagonalComponent][directionIndex];
  const directionY: Dynamic = [0, diagonalComponent, 1, diagonalComponent, 0, -diagonalComponent, -1, -diagonalComponent][directionIndex];
  return {
    x: startPoint.x + length * directionX,
    y: startPoint.y + length * directionY,
  };
};

interface ElementResize {
  x0: number;
  y0: number;
  w0: number;
  h0: number;
  grip: { rot: number; sx: number; sy: number };
  scl: number;
  m: Pick<DOMMatrixReadOnly, "a" | "b" | "c" | "d">;
  fx: number;
  fy: number;
  west: boolean;
  east: boolean;
  north: boolean;
  south: boolean;
  absX: boolean;
  absY: boolean;
  pinR: boolean;
  pinB: boolean;
  plain: boolean;
  startLeft: number;
  startRight: number;
  startTop: number;
  startBottom: number;
  boxDx: number;
  boxDy: number;
  lastW?: number | null;
  lastH?: number | null;
  lastLeft?: number | null;
  lastRight?: number | null;
  lastTop?: number | null;
  lastBottom?: number | null;
}

/** 更新提交所需的尺寸与定位，返回当前指针位置对应的预览样式。 */
export function updateElementResize(
  gesture: ElementResize,
  x: number,
  y: number,
  preserveRatio: boolean,
): Record<string, string> {
  const { grip, scl, w0, h0, west, east, north, south } = gesture;
  const dx = x - gesture.x0;
  const dy = y - gesture.y0;
  const cos = Math.cos(grip.rot);
  const sin = Math.sin(grip.rot);
  const localX = (dx * cos + dy * sin) / (scl * grip.sx);
  const localY = (dy * cos - dx * sin) / (scl * grip.sy);
  const horizontal = west || east;
  const vertical = north || south;
  let width = west ? w0 - localX : east ? w0 + localX : w0;
  let height = north ? h0 - localY : south ? h0 + localY : h0;
  if (preserveRatio && horizontal && vertical && w0 > 0 && h0 > 0) {
    const ratio = w0 / h0;
    if (width / w0 >= height / h0) height = width / ratio;
    else width = height * ratio;
  }
  if (horizontal) width = Math.max(8, width);
  if (vertical) height = Math.max(8, height);
  gesture.lastW = width;
  gesture.lastH = height;

  const { fx, fy, m, plain } = gesture;
  const widthChange = w0 - width;
  const heightChange = h0 - height;
  const originX = ((west ? 1 : 0) - fx) * widthChange;
  const originY = ((north ? 1 : 0) - fy) * heightChange;
  const left = fx * widthChange + m.a * originX + m.c * originY;
  const top = fy * heightChange + m.b * originX + m.d * originY;
  if (gesture.absX && (west || !plain)) gesture.lastLeft = gesture.startLeft + left;
  else if (gesture.pinR && (east || !plain)) gesture.lastRight = gesture.startRight + (widthChange - left);
  if (gesture.absY && (north || !plain)) gesture.lastTop = gesture.startTop + top;
  else if (gesture.pinB && (south || !plain)) gesture.lastBottom = gesture.startBottom + (heightChange - top);

  const styles: Record<string, string> = {};
  if (horizontal) styles.width = Math.round(width - gesture.boxDx) + "px";
  if (vertical) styles.height = Math.round(height - gesture.boxDy) + "px";
  if (gesture.lastLeft != null) styles.left = Math.round(gesture.lastLeft) + "px";
  if (gesture.lastTop != null) styles.top = Math.round(gesture.lastTop) + "px";
  if (gesture.lastRight != null) styles.right = Math.round(gesture.lastRight) + "px";
  if (gesture.lastBottom != null) styles.bottom = Math.round(gesture.lastBottom) + "px";
  return styles;
}
