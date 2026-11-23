/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { load_react_jsx_runtime } from "../dependencies";
import { fitPenCurve, flattenCubicPath, penPathBounds } from "../editor/geometry/pen";
import { isDesktopMac as isMetaPrimaryKey } from "../editor/inspector/color-pick";
import { toModuleNamespace } from "../module-helpers";
import { minEmbeddedArtboardDimension as minArtboardEdge, minShapeDimension as minPenPathExtent, maxCanvasItemDimension as maxArtboardEdge, maxPenPathChars as maxPenPathCoordinates, sanitizePenPath } from "../platform/file-content";

var jsx_Nn: Dynamic;
var freehandSimplifyTolerance: Dynamic;
var bothTransformAxes: Dynamic;
var isPrimaryModifierEvent: Dynamic;
var minimumArtboardSize: Dynamic;
var maximumArtboardSize: Dynamic;
var canvasDragActivationDelayMs: Dynamic;
var canvasTouchDragActivationDelayMs: Dynamic;
var canvasLongPressDelayMs: Dynamic;
var canvasDragThresholdPixels: Dynamic;
var canvasTouchDragThresholdPixels: Dynamic;
function freehandDrawingAnnotation(
  points?: Dynamic,
  initialTolerance?: Dynamic,
  closed: Dynamic = true,
): Dynamic {
  let [originX, originY]: Dynamic = [1 / 0, 1 / 0];
  for (let point of points as Dynamic)
    [originX, originY] = [
      Math.min(originX, Math.floor(point.x)),
      Math.min(originY, Math.floor(point.y)),
    ];
  let localPoints: Dynamic = points.map(
      (point?: Dynamic): Dynamic => [point.x - originX, point.y - originY],
    ),
    maxCoordinate: Dynamic = 1;
  for (let [localX, localY] of localPoints as Dynamic)
    maxCoordinate = Math.max(maxCoordinate, localX, localY);
  let scale: Dynamic = Math.min(
      1,
      maxArtboardEdge / maxCoordinate,
    ),
    toAnnotation: Dynamic = (bounds?: Dynamic): Dynamic => ({
      x: Math.round((originX + bounds.x) * 10) / 10,
      y: Math.round((originY + bounds.y) * 10) / 10,
      w: Math.max(minPenPathExtent, bounds.w),
      h: Math.max(minPenPathExtent, bounds.h),
      d: bounds.d,
    });
  for (
    let tolerance: Dynamic = initialTolerance;
    tolerance > 0 && Number.isFinite(tolerance) && tolerance <= 16 * initialTolerance;
    tolerance *= 2
  ) {
    let curve: Dynamic = fitPenCurve(
      localPoints.map(
        ([scaledX, scaledY]: Dynamic): Dynamic => [
          scaledX * scale,
          scaledY * scale,
        ],
      ),
      tolerance * scale,
    );
    if (
      !curve ||
      curve.length <= 4 ||
      (!closed && curve.length * 2 > maxPenPathCoordinates)
    )
      break;
    let flattenedPath: Dynamic = flattenCubicPath(curve);
    if (flattenedPath.length * 2 > maxPenPathCoordinates) continue;
    let pathBounds: Dynamic = penPathBounds(flattenedPath, 1);
    if (!closed) {
      if (pathBounds.d.length > maxPenPathCoordinates) break;
      return toAnnotation(pathBounds);
    }
    let overscale: Dynamic =
      Math.max(pathBounds.w, pathBounds.h) /
      (maxArtboardEdge - 0.5);
    overscale > 1 &&
      (pathBounds = penPathBounds(
        flattenedPath.map((coordinate?: Dynamic): Dynamic => coordinate / overscale),
        1,
      ));
    if (sanitizePenPath(pathBounds.d) !== null)
      return toAnnotation(pathBounds);
  }
  let sampleStep: Dynamic = Math.max(1, Math.ceil(points.length / 1500)),
    sampledPoints: Dynamic = localPoints.filter(
      (point?: Dynamic, index?: Dynamic): Dynamic =>
        index % sampleStep === 0 || index === localPoints.length - 1,
    ),
    [width, height, pathData]: Dynamic = [
      minPenPathExtent,
      minPenPathExtent,
      "",
    ];
  sampledPoints.forEach(([pointX, pointY]: Dynamic, index?: Dynamic): Dynamic => {
    let [roundedX, roundedY]: Dynamic = [
      Math.round(pointX * scale),
      Math.round(pointY * scale),
    ];
    [width, height] = [Math.max(width, roundedX), Math.max(height, roundedY)];
    pathData +=
      (index === 0 ? "M" : " L") + String(roundedX) + " " + String(roundedY);
  });
  return {
    x: originX,
    y: originY,
    w: width,
    h: height,
    d: pathData,
  };
}
function placementGhostAnnotation(placement?: Dynamic): Dynamic {
  return placement.tool === "arrow" || placement.tool === "line"
    ? {
        id: "place-ghost",
        kind: placement.tool,
        x: placement.dirX === 1 ? placement.x : placement.x + placement.w,
        y: placement.dirY === 1 ? placement.y : placement.y + placement.h,
        x2: placement.dirX === 1 ? placement.x + placement.w : placement.x,
        y2: placement.dirY === 1 ? placement.y + placement.h : placement.y,
      }
    : {
        id: "place-ghost",
        kind: placement.tool === "oval" ? "oval" : "rect",
        x: placement.x,
        y: placement.y,
        w: Math.max(placement.w, 1),
        h: Math.max(placement.h, 1),
      };
}
function isCanvasReservedShortcut(event?: Dynamic): Dynamic {
  return event.key === "Shift" ||
    event.key === "Control" ||
    event.key === "Alt" ||
    event.key === "Meta" ||
    event.key === "CapsLock" ||
    /^F\d{1,2}$/.test(event.key) ||
    event.key === " "
    ? true
    : (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        ["z", "y", "=", "+", "-", "0", "\\"].includes(
          event.key.toLowerCase(),
        );
}
export {
  bothTransformAxes,
  canvasDragActivationDelayMs,
  canvasDragThresholdPixels,
  canvasLongPressDelayMs,
  canvasTouchDragActivationDelayMs,
  canvasTouchDragThresholdPixels,
  freehandDrawingAnnotation,
  freehandSimplifyTolerance,
  isCanvasReservedShortcut,
  isPrimaryModifierEvent,
  jsx_Nn,
  maximumArtboardSize,
  minimumArtboardSize,
  placementGhostAnnotation,
};
export function installCanvasInteractionGeometry(): () => void {
  return () => {
    jsx_Nn = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    freehandSimplifyTolerance = 1.25;
    bothTransformAxes = {
      x: true,
      y: true,
    };
    isPrimaryModifierEvent = (event?: Dynamic): Dynamic =>
      isMetaPrimaryKey ? event.metaKey : event.ctrlKey;
    minimumArtboardSize = {
      w: minArtboardEdge,
      h: minArtboardEdge,
    };
    maximumArtboardSize = {
      w: maxArtboardEdge,
      h: maxArtboardEdge,
    };
    canvasDragActivationDelayMs = 200;
    canvasTouchDragActivationDelayMs = 600;
    canvasLongPressDelayMs = 2e3;
    canvasDragThresholdPixels = 4;
    canvasTouchDragThresholdPixels = 8;
  };
}
