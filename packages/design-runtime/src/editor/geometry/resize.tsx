import type {
  Point,
  Size,
  Rectangle,
  ResizeHandle,
  ResizeMember,
  SizeLimits,
} from "../../contracts/geometry";
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { load_react } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";

var reactGeometryResize: Dynamic;
function resizeRect(
  rect: Rectangle,
  handle: ResizeHandle,
  dx: number,
  dy: number,
  min: Size,
  max: Size,
): Rectangle {
  let { x: newX, y: newY, w: newWidth, h: newHeight } = rect;
  handle.x !== null &&
    ((newWidth = Math.max(
      min.w,
      Math.min(rect.w + (handle.x === "right" ? dx : -dx), max.w),
    )),
    handle.x === "left" && (newX = rect.x + (rect.w - newWidth)));
  handle.y !== null &&
    ((newHeight = Math.max(
      min.h,
      Math.min(rect.h + (handle.y === "bottom" ? dy : -dy), max.h),
    )),
    handle.y === "top" && (newY = rect.y + (rect.h - newHeight)));
  return {
    x: newX,
    y: newY,
    w: newWidth,
    h: newHeight,
  };
}
function resizeRectKeepingAspect(
  rect: Rectangle,
  handle: ResizeHandle,
  dx: number,
  dy: number,
  min: Size,
  max: Size,
): Rectangle {
  let freeResized = resizeRect(
      rect,
      handle,
      dx,
      dy,
      {
        w: 0,
        h: 0,
      },
      {
        w: 1 / 0,
        h: 1 / 0,
      },
    ),
    [scaleX, scaleY] = [freeResized.w / rect.w, freeResized.h / rect.h],
    scale = Math.abs(scaleX - 1) >= Math.abs(scaleY - 1) ? scaleX : scaleY;
  scale = Math.min(scale, max.w / rect.w, max.h / rect.h);
  scale = Math.max(scale, min.w / rect.w, min.h / rect.h);
  let [scaledWidth, scaledHeight] = [rect.w * scale, rect.h * scale];
  return {
    x: handle.x === "left" ? rect.x + rect.w - scaledWidth : rect.x,
    y: handle.y === "top" ? rect.y + rect.h - scaledHeight : rect.y,
    w: scaledWidth,
    h: scaledHeight,
  };
}
function canStartCanvasDrag(event?: Dynamic): Dynamic {
  if (event.button !== 0) return false;
  let target: Dynamic = event.target,
    blockingControl: Dynamic =
      target && typeof target.closest == "function"
        ? target.closest("button, a, input, select, textarea")
        : null;
  if (blockingControl !== null && !blockingControl.hasAttribute("data-drag-surface"))
    return false;
  event.preventDefault();
  let activeElement: Dynamic = (document as Dynamic).activeElement;
  activeElement &&
    activeElement !== (document as Dynamic).body &&
    activeElement.blur?.();
  return true;
}
function unionRects(rects: readonly Rectangle[]): Rectangle | null {
  if (rects.length === 0) return null;
  let [minX, minY, maxX, maxY] = [1 / 0, 1 / 0, -1 / 0, -1 / 0];
  for (let rect of rects)
    [minX, minY, maxX, maxY] = [
      Math.min(minX, rect.x),
      Math.min(minY, rect.y),
      Math.max(maxX, rect.x + rect.w),
      Math.max(maxY, rect.y + rect.h),
    ];
  return {
    x: minX,
    y: minY,
    w: maxX - minX,
    h: maxY - minY,
  };
}
function transformPointBetweenRects(
  point: Point,
  from: Rectangle,
  to: Rectangle,
): Point {
  let [scaleX, scaleY] = [
    from.w > 0 ? to.w / from.w : 1,
    from.h > 0 ? to.h / from.h : 1,
  ];
  return {
    x: to.x + (point.x - from.x) * scaleX,
    y: to.y + (point.y - from.y) * scaleY,
  };
}
function transformRectBetweenRects(
  rect: Rectangle,
  from: Rectangle,
  to: Rectangle,
): Rectangle {
  let [scaleX, scaleY] = [
    from.w > 0 ? to.w / from.w : 1,
    from.h > 0 ? to.h / from.h : 1,
  ];
  return {
    x: to.x + (rect.x - from.x) * scaleX,
    y: to.y + (rect.y - from.y) * scaleY,
    w: rect.w * scaleX,
    h: rect.h * scaleY,
  };
}
function selectionResizeLimits(
  size: Size,
  members: readonly ResizeMember[],
): SizeLimits {
  let [minScaleW, minScaleH, maxScaleW, maxScaleH] = [0, 0, 1 / 0, 1 / 0];
  for (let member of members) {
    member.w > 0 &&
      member.min?.w !== undefined &&
      member.w >= member.min.w &&
      (minScaleW = Math.max(minScaleW, member.min.w / member.w));
    member.h > 0 &&
      member.min?.h !== undefined &&
      member.h >= member.min.h &&
      (minScaleH = Math.max(minScaleH, member.min.h / member.h));
    member.w > 0 &&
      member.max?.w !== undefined &&
      member.w <= member.max.w &&
      (maxScaleW = Math.min(maxScaleW, member.max.w / member.w));
    member.h > 0 &&
      member.max?.h !== undefined &&
      member.h <= member.max.h &&
      (maxScaleH = Math.min(maxScaleH, member.max.h / member.h));
  }
  let scaleLimit: (dimension: number, scale: number) => number = (
    dimension,
    scale,
  ) => (scale === 1 / 0 ? 1 / 0 : dimension * scale);
  return {
    min: {
      w: size.w * minScaleW,
      h: size.h * minScaleH,
    },
    max: {
      w: scaleLimit(size.w, maxScaleW),
      h: scaleLimit(size.h, maxScaleH),
    },
  };
}
export {
  canStartCanvasDrag,
  reactGeometryResize,
  resizeRect,
  resizeRectKeepingAspect,
  selectionResizeLimits,
  transformPointBetweenRects,
  transformRectBetweenRects,
  unionRects,
};
export function installEditorGeometryResize(): () => void {
  return () => {
    reactGeometryResize = toModuleNamespace(
      load_react(),
      1,
    );
  };
}
