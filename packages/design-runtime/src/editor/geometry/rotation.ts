import type {
  Point,
  Rectangle,
  ResizeHandle,
  Size,
} from "../../contracts/geometry";
/** Restored application module; prepare first, initialize in original order. */
import { resizeRect, resizeRectKeepingAspect } from "./resize";

function snapRotation(angle: number, snap15Degrees?: boolean): number {
  let snapped = snap15Degrees
      ? Math.round(angle / 15) * 15
      : Math.round(angle),
    rightAngle = Math.round(angle / 90) * 90;
  !snap15Degrees &&
    Math.abs(angle - rightAngle) <= 3 &&
    (snapped = rightAngle);
  snapped = ((snapped % 360) + 360) % 360;
  return snapped > 180 ? snapped - 360 : snapped;
}
function angleBetweenPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  return (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
}
function rotatePoint(point: Point, center: Point, degrees: number): Point {
  let radians = (degrees * Math.PI) / 180,
    [cosAngle, sinAngle, offsetX, offsetY] = [
      Math.cos(radians),
      Math.sin(radians),
      point.x - center.x,
      point.y - center.y,
    ];
  return {
    x: center.x + offsetX * cosAngle - offsetY * sinAngle,
    y: center.y + offsetX * sinAngle + offsetY * cosAngle,
  };
}
function rotatedRectCorner(
  rect: Rectangle,
  degrees: number,
  area: Rectangle,
): boolean {
  let radians = (degrees * Math.PI) / 180,
    [cosAngle, sinAngle, centerX, centerY] = [
      Math.cos(radians),
      Math.sin(radians),
      rect.x + rect.w / 2,
      rect.y + rect.h / 2,
    ],
    rectCorners = [
      [-rect.w / 2, -rect.h / 2],
      [rect.w / 2, -rect.h / 2],
      [rect.w / 2, rect.h / 2],
      [-rect.w / 2, rect.h / 2],
    ].map(([cornerX, cornerY]) => ({
      x: centerX + cornerX! * cosAngle - cornerY! * sinAngle,
      y: centerY + cornerX! * sinAngle + cornerY! * cosAngle,
    })),
    areaCorners = [
      {
        x: area.x,
        y: area.y,
      },
      {
        x: area.x + area.w,
        y: area.y,
      },
      {
        x: area.x + area.w,
        y: area.y + area.h,
      },
      {
        x: area.x,
        y: area.y + area.h,
      },
    ];
  for (let axis of [
    {
      x: 1,
      y: 0,
    },
    {
      x: 0,
      y: 1,
    },
    {
      x: cosAngle,
      y: sinAngle,
    },
    {
      x: -sinAngle,
      y: cosAngle,
    },
  ]) {
    let projectRange: (points: readonly Point[]) => [number, number] = (
        points,
      ) => {
        let [minProjection, maxProjection] = [1 / 0, -1 / 0];
        for (let point of points) {
          let projection = point.x * axis.x + point.y * axis.y;
          [minProjection, maxProjection] = [
            Math.min(minProjection, projection),
            Math.max(maxProjection, projection),
          ];
        }
        return [minProjection, maxProjection];
      },
      [rectMin, rectMax] = projectRange(rectCorners),
      [areaMin, areaMax] = projectRange(areaCorners);
    if (rectMax < areaMin || areaMax < rectMin) return false;
  }
  return true;
}
function resizeRotatedRect(
  rect: Rectangle,
  degrees: number,
  handle: ResizeHandle,
  dx: number,
  dy: number,
  min: Size,
  max: Size,
  keepAspect: boolean = false,
): Rectangle {
  let radians = (degrees * Math.PI) / 180,
    [cosAngle, sinAngle] = [Math.cos(radians), Math.sin(radians)],
    [localDx, localDy] = [dx * cosAngle + dy * sinAngle, -dx * sinAngle + dy * cosAngle],
    resized = keepAspect
      ? resizeRectKeepingAspect(
          rect,
          handle,
          localDx,
          localDy,
          min,
          max,
        )
      : resizeRect(rect, handle, localDx, localDy, min, max);
  if (!degrees) return resized;
  let [signX, signY] = [
      handle.x === "left" ? 1 : handle.x === "right" ? -1 : 0,
      handle.y === "top" ? 1 : handle.y === "bottom" ? -1 : 0,
    ],
    [oldOffsetX, oldOffsetY] = [(signX * rect.w) / 2, (signY * rect.h) / 2],
    [newOffsetX, newOffsetY] = [(signX * resized.w) / 2, (signY * resized.h) / 2],
    [centerX, centerY] = [rect.x + rect.w / 2, rect.y + rect.h / 2],
    [newCenterX, newCenterY] = [
      centerX + (oldOffsetX - newOffsetX) * cosAngle - (oldOffsetY - newOffsetY) * sinAngle,
      centerY + (oldOffsetX - newOffsetX) * sinAngle + (oldOffsetY - newOffsetY) * cosAngle,
    ];
  return {
    x: newCenterX - resized.w / 2,
    y: newCenterY - resized.h / 2,
    w: resized.w,
    h: resized.h,
  };
}
export {
  angleBetweenPoints,
  resizeRotatedRect,
  rotatedRectCorner,
  rotatePoint,
  snapRotation,
};
export function installEditorGeometryRotation(): () => void {
  return () => {};
}
