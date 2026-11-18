/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { load_react_jsx_runtime } from "../dependencies";
import { fitPenCurve, flattenCubicPath, penPathBounds } from "../editor/geometry/pen";
import { InspectorColorPickResolvedValue_2 } from "../editor/inspector/color-pick";
import { toModuleNamespace } from "../module-helpers";
import { PlatformFileContentConstant_16, PlatformFileContentConstant_19, PlatformFileContentLimit_6, PlatformFileContentLimit_7, PlatformFileContentTrim_2 } from "../platform/file-content";

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
  color?: Dynamic,
  closed: Dynamic = true,
): Dynamic {
  let [items, items2]: Dynamic = [1 / 0, 1 / 0];
  for (let value5 of points as Dynamic)
    [items, items2] = [
      Math.min(items, Math.floor(value5.x)),
      Math.min(items2, Math.floor(value5.y)),
    ];
  let value: Dynamic = points.map(
      (input?: Dynamic): Dynamic => [input.x - items, input.y - items2],
    ),
    count: Dynamic = 1;
  for (let [value5, value6] of value as Dynamic)
    count = Math.max(count, value5, value6);
  let value2: Dynamic = Math.min(
      1,
      PlatformFileContentLimit_6 / count,
    ),
    callback: Dynamic = (input?: Dynamic): Dynamic => ({
      x: Math.round((items + input.x) * 10) / 10,
      y: Math.round((items2 + input.y) * 10) / 10,
      w: Math.max(PlatformFileContentConstant_19, input.w),
      h: Math.max(PlatformFileContentConstant_19, input.h),
      d: input.d,
    });
  for (
    let value5: Dynamic = color;
    value5 > 0 && Number.isFinite(value5) && value5 <= 16 * color;
    value5 *= 2
  ) {
    let value6: Dynamic = fitPenCurve(
      value.map(
        ([input, input2]: Dynamic): Dynamic => [
          input * value2,
          input2 * value2,
        ],
      ),
      value5 * value2,
    );
    if (
      !value6 ||
      value6.length <= 4 ||
      (!closed && value6.length * 2 > PlatformFileContentLimit_7)
    )
      break;
    let value7: Dynamic = flattenCubicPath(value6);
    if (value7.length * 2 > PlatformFileContentLimit_7) continue;
    let value8: Dynamic = penPathBounds(value7, 1);
    if (!closed) {
      if (value8.d.length > PlatformFileContentLimit_7) break;
      return callback(value8);
    }
    let value9: Dynamic =
      Math.max(value8.w, value8.h) /
      (PlatformFileContentLimit_6 - 0.5);
    value9 > 1 &&
      (value8 = penPathBounds(
        value7.map((input?: Dynamic): Dynamic => input / value9),
        1,
      ));
    if (PlatformFileContentTrim_2(value8.d) !== null)
      return callback(value8);
  }
  let value3: Dynamic = Math.max(1, Math.ceil(points.length / 1500)),
    value4: Dynamic = value.filter(
      (input?: Dynamic, options?: Dynamic): Dynamic =>
        options % value3 === 0 || options === value.length - 1,
    ),
    [items3, items4, items5]: Dynamic = [
      PlatformFileContentConstant_19,
      PlatformFileContentConstant_19,
      "",
    ];
  value4.forEach(([input, input2]: Dynamic, options?: Dynamic): Dynamic => {
    let [items6, items7]: Dynamic = [
      Math.round(input * value2),
      Math.round(input2 * value2),
    ];
    [items3, items4] = [Math.max(items3, items6), Math.max(items4, items7)];
    items5 +=
      (options === 0 ? "M" : " L") + String(items6) + " " + String(items7);
  });
  return {
    x: items,
    y: items2,
    w: items3,
    h: items4,
    d: items5,
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
    isPrimaryModifierEvent = (input?: Dynamic): Dynamic =>
      InspectorColorPickResolvedValue_2 ? input.metaKey : input.ctrlKey;
    minimumArtboardSize = {
      w: PlatformFileContentConstant_16,
      h: PlatformFileContentConstant_16,
    };
    maximumArtboardSize = {
      w: PlatformFileContentLimit_6,
      h: PlatformFileContentLimit_6,
    };
    canvasDragActivationDelayMs = 200;
    canvasTouchDragActivationDelayMs = 600;
    canvasLongPressDelayMs = 2e3;
    canvasDragThresholdPixels = 4;
    canvasTouchDragThresholdPixels = 8;
  };
}
