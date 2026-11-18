/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { annotationPathViewBox, getAnnotationStrokeWidth } from "./annotation-shape-style";
import { parsePenPath } from "../editor/geometry/pen";
import { rotatedRectCorner, rotatePoint } from "../editor/geometry/rotation";
import { boardSelectionCount, boardSelectionItems, hasBoardSelection, toggleBoardSelection } from "../editor/selection/canvas-selection";
import { annotationRotation, rotatedAnnotationBounds } from "../platform/file-content";

var canvasContextMenuTargetFromElement: Dynamic;
var artboardOverlayIdPrefixes: Dynamic;
var inclusiveRectIntersects: Dynamic;
var expandHitTestRect: Dynamic;
var penHitTestPointsCache: Dynamic;
function selectionPointerDownDecision(
  selection?: Dynamic,
  target?: Dynamic,
  additive?: Dynamic,
): Dynamic {
  return hasBoardSelection(selection, target) &&
    (additive || boardSelectionCount(selection) > 1)
    ? {
        selectNow: false,
        carry: selection,
        click: additive ? "toggle" : "collapse",
      }
    : {
        selectNow: true,
        carry: additive
          ? toggleBoardSelection(selection, target)
          : boardSelectionItems(target),
        click: null,
      };
}
function canvasFacePointerAction(pointerHit?: Dynamic): Dynamic {
  return pointerHit.faceOverlay && pointerHit.pointerType === "touch"
    ? "leave"
    : pointerHit.editing &&
        (pointerHit.tool == null ||
          pointerHit.tool === "select" ||
          pointerHit.tool === "vector") &&
        !pointerHit.fullscreen
      ? "pick"
      : "artboard";
}
function shouldBeginCanvasMarquee(pointerHit?: Dynamic): Dynamic {
  return (
    pointerHit.bare &&
    pointerHit.pointerType === "mouse" &&
    pointerHit.button === 0 &&
    ((pointerHit.tool ?? "select") === "select" || pointerHit.tool === "vector")
  );
}
function isCanvasContextMenuPointer(pointerHit?: Dynamic): Dynamic {
  return pointerHit.button !== 2 || pointerHit.pointerType === "touch"
    ? false
    : pointerHit.chrome == null ||
        pointerHit.chrome === "set-box-pad" ||
        pointerHit.chrome === "focus-overlay" ||
        pointerHit.chrome === "face-overlay" ||
        pointerHit.chrome === "set-overlay" ||
        pointerHit.chrome === "comments";
}
function canvasContextMenuTarget(hitTarget?: Dynamic): Dynamic {
  return hitTarget.blanket === true
    ? null
    : hitTarget.object != null
      ? {
          kind: "object",
          id: hitTarget.object,
        }
      : hitTarget.chrome == null || hitTarget.chrome === "set-box-pad"
        ? hitTarget.file != null
          ? {
              kind: "artboard",
              file: hitTarget.file,
            }
          : {
              kind: "canvas",
            }
        : hitTarget.file != null &&
            [
              "title",
              "focus-overlay",
              "face-overlay",
              "set-overlay",
            ].includes(hitTarget.chrome)
          ? {
              kind: "artboard",
              file: hitTarget.file,
            }
          : null;
}
function shouldPassFileDropThroughOverlay(pointerHit?: Dynamic): Dynamic {
  return (
    pointerHit.filesDrag &&
    (pointerHit.chrome === "face-overlay" || pointerHit.chrome === "set-overlay")
  );
}
function applyElementRectStyle(element?: Dynamic, rect?: Dynamic): Dynamic {
  !element ||
    !rect ||
    ((element.style.left = String(rect.x) + "px"),
    (element.style.top = String(rect.y) + "px"),
    (element.style.width = String(rect.w) + "px"),
    (element.style.height = String(rect.h) + "px"));
}
function objectsWithinCanvasMarquee(
  manifest?: Dynamic,
  rect?: Dynamic,
  selection?: Dynamic,
): Dynamic {
  let hitFiles: Dynamic = new Set(selection.files);
  for (let artboard of manifest.artboards as Dynamic)
    inclusiveRectIntersects(rect, artboard) && hitFiles.add(artboard.file);
  let hitNotes: Dynamic = new Set(selection.notes);
  for (let annotation of manifest.annotations as Dynamic) {
    let isHit: Dynamic,
      rotation: Dynamic = annotationRotation(annotation);
    if (
      annotation.kind === "line" ||
      annotation.kind === "arrow" ||
      annotation.kind === "pen"
    ) {
      let expandedRect: Dynamic = expandHitTestRect(
        rect,
        getAnnotationStrokeWidth(annotation) / 2,
      );
      isHit =
        annotation.kind === "pen"
          ? inclusiveRectIntersects(
              expandedRect,
              rotatedAnnotationBounds(
                annotation,
                manifest.annBox(annotation),
              ),
            ) && penIntersectsMarquee(annotation, expandedRect)
          : lineIntersectsMarquee(annotation, expandedRect);
    } else
      isHit = rotation
        ? rotatedRectCorner(manifest.annBox(annotation), rotation, rect)
        : inclusiveRectIntersects(rect, manifest.annBox(annotation));
    isHit && hitNotes.add(annotation.id);
  }
  return {
    files: hitFiles,
    notes: hitNotes,
  };
}
function penIntersectsMarquee(annotation?: Dynamic, rect?: Dynamic): Dynamic {
  let entry: Dynamic = penHitTestPointsCache.get(annotation);
  if (!entry) {
    let [pathViewBox, rotationAngle]: Dynamic = [
        annotationPathViewBox(annotation.d),
        annotationRotation(annotation),
      ],
      rotationCenter: Dynamic = {
        x: annotation.x + annotation.w / 2,
        y: annotation.y + annotation.h / 2,
      };
    entry = parsePenPath(annotation.d).map(
      (penPoint?: Dynamic): Dynamic => {
        let scaledPoint: Dynamic = {
          x: annotation.x + (penPoint.x * annotation.w) / pathViewBox.w,
          y: annotation.y + (penPoint.y * annotation.h) / pathViewBox.h,
        };
        return {
          move: penPoint.move,
          ...(rotationAngle
            ? rotatePoint(scaledPoint, rotationCenter, rotationAngle)
            : scaledPoint),
        };
      },
    );
    penHitTestPointsCache.set(annotation, entry);
  }
  let previousPoint: Dynamic = null;
  for (let point of entry as Dynamic) {
    let segmentStart: Dynamic = point.move || !previousPoint ? point : previousPoint;
    if (
      lineIntersectsMarquee(
        {
          x: segmentStart.x,
          y: segmentStart.y,
          x2: point.x,
          y2: point.y,
        },
        rect,
      )
    )
      return true;
    previousPoint = point;
  }
  return false;
}
function lineIntersectsMarquee(line?: Dynamic, rect?: Dynamic): Dynamic {
  let deltaX: Dynamic = line.x2 - line.x,
    deltaY: Dynamic = line.y2 - line.y,
    tEnter: Dynamic = 0,
    tExit: Dynamic = 1;
  for (let [edgeDirection, edgeDistance] of [
    [-deltaX, line.x - rect.x],
    [deltaX, rect.x + rect.w - line.x],
    [-deltaY, line.y - rect.y],
    [deltaY, rect.y + rect.h - line.y],
  ] as Dynamic) {
    if (edgeDirection === 0) {
      if (edgeDistance < 0) return false;
      continue;
    }
    edgeDirection < 0
      ? (tEnter = Math.max(tEnter, edgeDistance / edgeDirection))
      : (tExit = Math.min(tExit, edgeDistance / edgeDirection));
    if (tEnter > tExit) return false;
  }
  return true;
}
export {
  applyElementRectStyle,
  artboardOverlayIdPrefixes,
  canvasContextMenuTarget,
  canvasContextMenuTargetFromElement,
  canvasFacePointerAction,
  expandHitTestRect,
  inclusiveRectIntersects,
  isCanvasContextMenuPointer,
  lineIntersectsMarquee,
  objectsWithinCanvasMarquee,
  penHitTestPointsCache,
  penIntersectsMarquee,
  selectionPointerDownDecision,
  shouldBeginCanvasMarquee,
  shouldPassFileDropThroughOverlay,
};
export function installCanvasHitTesting(): () => void {
  return () => {
    canvasContextMenuTargetFromElement = (element?: Dynamic): Dynamic => {
      let readAttribute: Dynamic = (attributeName?: Dynamic): Dynamic =>
        element instanceof Element
          ? element.closest("[" + attributeName + "]")?.getAttribute(attributeName)
          : null;
      return canvasContextMenuTarget({
        object: readAttribute("data-mega-annotation"),
        chrome: readAttribute("data-mega-chrome"),
        file: readAttribute("data-mega-artboard"),
        blanket: readAttribute("data-mega-pan-blanket") != null,
      });
    };
    artboardOverlayIdPrefixes = {
      "face-overlay": "mega-artboard-face-",
      "set-overlay": "mega-artboard-set-",
      "focus-overlay": "mega-artboard-overlay-",
    };
    inclusiveRectIntersects = (rectA?: Dynamic, rectB?: Dynamic): Dynamic =>
      rectA.x <= rectB.x + rectB.w &&
      rectB.x <= rectA.x + rectA.w &&
      rectA.y <= rectB.y + rectB.h &&
      rectB.y <= rectA.y + rectA.h;
    expandHitTestRect = (rect?: Dynamic, margin?: Dynamic): Dynamic => ({
      x: rect.x - margin,
      y: rect.y - margin,
      w: rect.w + 2 * margin,
      h: rect.h + 2 * margin,
    });
    penHitTestPointsCache = new WeakMap();
  };
}
