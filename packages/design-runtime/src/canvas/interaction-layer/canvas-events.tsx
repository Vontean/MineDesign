import { OutlineDcOutlineHandler } from "../../editor/outline/dc-outline";
import { canvasContextMenuTargetFromElement } from "../hit-testing";
import { constrainLineAngle } from "../../editor/svg/drawing";
import { focusCanvasDocument } from "../focus";
import { freehandDrawingAnnotation } from "../interaction-geometry";
import { freehandSimplifyTolerance } from "../interaction-geometry";
import { isPrimaryModifierEvent } from "../interaction-geometry";
import { maximumArtboardSize } from "../interaction-geometry";
import { minimumArtboardSize } from "../interaction-geometry";
import { supportsClickPlacement } from "../../editor/tools";
import { type Dynamic } from "../../runtime-types";

/** 在画布上右键或长按时运行：识别点击目标（画板、对象或空白处），阻止系统菜单并在指针或键盘位置打开画布右键菜单。 */
export function openCanvasContextMenu(deps: { readonly isContextMenuPointerEvent: Dynamic; readonly isEventInsideTarget: Dynamic; readonly onCanvasMenu: Dynamic; readonly handleCanvasMenu: Dynamic; readonly deferredContextClick: Dynamic; readonly scrimRightClickRef: Dynamic; readonly isCanvasInertRef: Dynamic; readonly activeGesturesRef: Dynamic; readonly fullscreenFileRef: Dynamic }, event?: Dynamic): Dynamic {
          if (
            deps.onCanvasMenu == null ||
            deps.fullscreenFileRef.current != null ||
            deps.isCanvasInertRef.current ||
            OutlineDcOutlineHandler(event.target)
          )
            return;
          if (deps.deferredContextClick.contextmenu()) return void event.preventDefault();
          let menuTarget: Dynamic =
              deps.isEventInsideTarget(event) && deps.activeGesturesRef.current.size === 0
                ? canvasContextMenuTargetFromElement(
                    event.target,
                  )
                : null,
            lastPress: Dynamic = deps.scrimRightClickRef.current;
          deps.scrimRightClickRef.current = null;
          if (menuTarget === null) return;
          let isStillPress: Dynamic =
            lastPress !== null &&
            Math.hypot(
              event.clientX - lastPress.x,
              event.clientY - lastPress.y,
            ) <= 3;
          if (lastPress !== null && !isStillPress)
            return void event.preventDefault();
          if (
            (event.button >= 0 &&
              !isStillPress &&
              deps.isContextMenuPointerEvent({
                pointerType: "mouse",
                button: 2,
                target: event.target,
              })) ||
            (event.button < 0 && event.defaultPrevented)
          )
            return;
          event.preventDefault();
          let isTouchOrPen: Dynamic =
              "pointerType" in event.nativeEvent &&
              ["touch", "pen"].includes(
                String(event.nativeEvent.pointerType),
              ),
            keyboardAnchorRect: Dynamic =
              event.button < 0 && !isTouchOrPen && event.target instanceof Element
                ? event.target.getBoundingClientRect()
                : null;
          deps.handleCanvasMenu(
            menuTarget,
            keyboardAnchorRect
              ? {
                  x: keyboardAnchorRect.left,
                  y: keyboardAnchorRect.bottom,
                  keyboard: true,
                }
              : {
                  x: event.clientX,
                  y: event.clientY,
                },
          );
        }

/** 在画布空白处按下指针时运行：按当前工具添加批注、拖出新画板、放置形状、绘制线条或箭头、自由绘制，或在选择工具下开始框选或清空选中。 */
type CanvasBackgroundPressDependencies = {
  readonly shouldPanFromTarget: Dynamic;
  readonly isPanPointerEvent: Dynamic;
  readonly shouldStartMarquee: Dynamic;
  readonly clientToCanvasPoint: Dynamic;
  readonly beginMarquee: Dynamic;
  readonly isEventInsideTarget: Dynamic;
  readonly trackPointerGesture: Dynamic;
  readonly camera: Dynamic;
  readonly manifest: Dynamic;
  readonly onAddAnnotation: Dynamic;
  readonly onAddPen: Dynamic;
  readonly onAddShape: Dynamic;
  readonly onClearSelection: Dynamic;
  readonly onDrawArtboard: Dynamic;
  readonly onPlaceBlocked: Dynamic;
  readonly onPlaceTool: Dynamic;
  readonly deferredContextClick: Dynamic;
  readonly isCanvasInertRef: Dynamic;
  readonly activeGesturesRef: Dynamic;
  readonly trackGesture: Dynamic;
  readonly enteredFileRef: Dynamic;
  readonly canEditCanvasRef: Dynamic;
  readonly blockedFiles: Dynamic;
  readonly fullscreenFileRef: Dynamic;
  readonly setPointerGhost: Dynamic;
  readonly backgroundPressRef: Dynamic;
  readonly setShapeDraft: Dynamic;
  readonly setFrameDraft: Dynamic;
  readonly armedToolRef: Dynamic;
  readonly spaceHeldRef: Dynamic;
};

export function pressCanvasBackground(deps: CanvasBackgroundPressDependencies, event?: Dynamic): Dynamic {
          deps.deferredContextClick.clear();
          if (!!deps.isEventInsideTarget(event) && !deps.activeGesturesRef.current.has("marquee")) {
            if (
              !deps.spaceHeldRef.current &&
              deps.armedToolRef.current === "note" &&
              event.button === 0 &&
              deps.fullscreenFileRef.current == null &&
              (!(event.target instanceof Element) ||
                event.target.closest("[data-mega-chrome]") == null)
            ) {
              event.preventDefault();
              event.stopPropagation();
              focusCanvasDocument();
              let canvasRect: Dynamic =
                event.currentTarget.getBoundingClientRect();
              deps.onAddAnnotation?.(
                deps.camera.get().x +
                  (event.clientX - canvasRect.left) / deps.camera.get().scale,
                deps.camera.get().y +
                  (event.clientY - canvasRect.top) / deps.camera.get().scale,
              );
              return;
            }
            if (
              !deps.spaceHeldRef.current &&
              deps.armedToolRef.current === "frame" &&
              event.button === 0 &&
              deps.fullscreenFileRef.current == null &&
              (!(event.target instanceof Element) ||
                event.target.closest("[data-mega-chrome]") == null)
            ) {
              beginArtboardDrawing(deps, event);
              return;
            }
            if (
              !deps.spaceHeldRef.current &&
              deps.canEditCanvasRef.current &&
              supportsClickPlacement(deps.armedToolRef.current) &&
              event.button === 0 &&
              event.isPrimary &&
              !deps.backgroundPressRef.current &&
              deps.fullscreenFileRef.current == null &&
              (!(event.target instanceof Element) ||
                event.target.closest("[data-mega-chrome]") == null)
            ) {
              beginShapePlacement(deps, event);
              return;
            }
            if (
              !deps.spaceHeldRef.current &&
              deps.canEditCanvasRef.current &&
              deps.armedToolRef.current === "draw" &&
              deps.onAddPen &&
              event.button === 0 &&
              event.isPrimary &&
              !deps.backgroundPressRef.current &&
              deps.fullscreenFileRef.current == null &&
              event.target instanceof Element &&
              event.target.closest("[data-mega-chrome]") == null &&
              event.target.closest("[data-mega-artboard]") == null
            ) {
              beginFreehandDrawing(deps, event);
              return;
            }
            if (
              !deps.spaceHeldRef.current &&
              deps.fullscreenFileRef.current == null &&
              deps.shouldStartMarquee(event.nativeEvent)
            ) {
              deps.beginMarquee(event, {
                origin: {
                  kind: "canvas",
                },
                mode: isPrimaryModifierEvent(event)
                  ? "deep"
                  : "plain",
                toggle: event.shiftKey,
                capture: event.currentTarget,
                onStillRelease: event.shiftKey ? undefined : deps.onClearSelection,
              });
              return;
            }
            (event.target === event.currentTarget ||
              (event.target instanceof Element &&
                event.target.getAttribute("data-mega-chrome") ===
                  "set-box-pad")) &&
              event.button === 0 &&
              !event.shiftKey &&
              deps.onClearSelection();
            if (
              deps.fullscreenFileRef.current == null &&
              (deps.isPanPointerEvent(event.nativeEvent) ||
                (event.button === 0 && deps.shouldPanFromTarget(event.nativeEvent)))
            ) {
              deps.trackGesture("pan", true);
              event.pointerType === "mouse" &&
                event.currentTarget.setAttribute("data-mega-grabbing", "");
              let menuTarget: Dynamic =
                event.button === 2 && !deps.isCanvasInertRef.current
                  ? canvasContextMenuTargetFromElement(
                      event.target,
                    )
                  : null;
              menuTarget !== null && deps.deferredContextClick.down(event, menuTarget);
              deps.trackPointerGesture(
                "pan",
                event.button === 1 ? 4 : event.button === 2 ? 2 : 1,
              );
            }
          }
        }

/** 拖出画板并在释放时提交；取消只清除预览。 */
function beginArtboardDrawing(deps: Pick<CanvasBackgroundPressDependencies, "clientToCanvasPoint" | "trackGesture" | "trackPointerGesture" | "setPointerGhost" | "onDrawArtboard">, event: Dynamic): void {
event.preventDefault();
event.stopPropagation();
focusCanvasDocument();
let canvasRect: Dynamic =
    event.currentTarget.getBoundingClientRect(),
  startPoint: Dynamic = deps.clientToCanvasPoint(
    event.clientX,
    event.clientY,
    canvasRect,
  );
deps.trackGesture("frame-tool", true);
deps.trackPointerGesture("frame-tool");
let getDragRect: Dynamic = (moveEvent?: Dynamic): Dynamic => {
    let endPoint: Dynamic = deps.clientToCanvasPoint(
      moveEvent.clientX,
      moveEvent.clientY,
      canvasRect,
    );
    return {
      x: Math.min(startPoint.x, endPoint.x),
      y: Math.min(startPoint.y, endPoint.y),
      w: Math.abs(endPoint.x - startPoint.x),
      h: Math.abs(endPoint.y - startPoint.y),
    };
  },
  previewDragRect: Dynamic = (moveEvent?: Dynamic): Dynamic =>
    deps.setPointerGhost(getDragRect(moveEvent)),
  finishDrag: Dynamic = (upEvent?: Dynamic): Dynamic => {
    (window as Dynamic).removeEventListener(
      "pointermove",
      previewDragRect,
    );
    (window as Dynamic).removeEventListener(
      "pointerup",
      finishDrag,
    );
    (window as Dynamic).removeEventListener(
      "pointercancel",
      cancelDrag,
    );
    deps.setPointerGhost(null);
    deps.trackGesture("frame-tool", false);
    let dragRect: Dynamic = getDragRect(upEvent);
    dragRect.w < 8 && dragRect.h < 8
      ? deps.onDrawArtboard?.({
          x: dragRect.x,
          y: dragRect.y,
          w: 0,
          h: 0,
        })
      : deps.onDrawArtboard?.({
          x: Math.round(dragRect.x),
          y: Math.round(dragRect.y),
          w: Math.round(
            Math.min(
              maximumArtboardSize.w,
              Math.max(
                dragRect.w,
                minimumArtboardSize.w,
              ),
            ),
          ),
          h: Math.round(
            Math.min(
              maximumArtboardSize.h,
              Math.max(
                dragRect.h,
                minimumArtboardSize.h,
              ),
            ),
          ),
        });
  },
  cancelDrag: Dynamic = (): Dynamic => {
    (window as Dynamic).removeEventListener(
      "pointermove",
      previewDragRect,
    );
    (window as Dynamic).removeEventListener(
      "pointerup",
      finishDrag,
    );
    (window as Dynamic).removeEventListener(
      "pointercancel",
      cancelDrag,
    );
    deps.setPointerGhost(null);
    deps.trackGesture("frame-tool", false);
  };
(window as Dynamic).addEventListener("pointermove", previewDragRect);
(window as Dynamic).addEventListener("pointerup", finishDrag);
(window as Dynamic).addEventListener(
  "pointercancel",
  cancelDrag,
);
}

/** 放置形状并处理释放、指针取消和 Escape。 */
function beginShapePlacement(deps: Pick<CanvasBackgroundPressDependencies, "armedToolRef" | "manifest" | "enteredFileRef" | "blockedFiles" | "onAddShape" | "onPlaceBlocked" | "clientToCanvasPoint" | "camera" | "backgroundPressRef" | "trackGesture" | "setShapeDraft" | "canEditCanvasRef" | "onPlaceTool">, event: Dynamic): void {
event.preventDefault();
event.stopPropagation();
focusCanvasDocument();
let activeTool: Dynamic = deps.armedToolRef.current,
  artboardFile: Dynamic =
    (event.target instanceof Element
      ? event.target.closest("[data-mega-artboard]")
      : null
    )?.getAttribute("data-mega-artboard") ?? null,
  hitBoard: Dynamic =
    artboardFile != null
      ? deps.manifest.artboards.find(
          (board?: Dynamic): Dynamic => board.file === artboardFile,
        )
      : null,
  isFramelessOther: Dynamic =
    hitBoard?.frameless === true &&
    deps.enteredFileRef.current !== artboardFile,
  outsideFile: Dynamic = isFramelessOther ? null : artboardFile,
  targetBoard: Dynamic = isFramelessOther ? null : hitBoard;
if (
  targetBoard
    ? deps.blockedFiles.has(targetBoard.file)
    : outsideFile != null || !deps.onAddShape
) {
  deps.onPlaceBlocked?.(activeTool, targetBoard ? "blocked" : "outside");
  return;
}
let canvasRect: Dynamic =
    event.currentTarget.getBoundingClientRect(),
  startPoint: Dynamic = deps.clientToCanvasPoint(
    event.clientX,
    event.clientY,
    canvasRect,
  ),
  pointerId: Dynamic = event.pointerId,
  getScale: Dynamic = (): Dynamic => deps.camera.get().scale,
  isLineTool: Dynamic = activeTool === "arrow" || activeTool === "line",
  computePlacementRect: Dynamic = (pointerEvent?: Dynamic): Dynamic => {
    let endPoint: Dynamic = deps.clientToCanvasPoint(
        pointerEvent.clientX,
        pointerEvent.clientY,
        canvasRect,
      ),
      constrainedPoint: Dynamic =
        pointerEvent.shiftKey && isLineTool
          ? constrainLineAngle(startPoint, endPoint)
          : endPoint,
      width: Dynamic = Math.abs(constrainedPoint.x - startPoint.x),
      height: Dynamic = Math.abs(constrainedPoint.y - startPoint.y);
    pointerEvent.shiftKey &&
      !isLineTool &&
      (width = height = Math.max(width, height));
    return {
      x:
        constrainedPoint.x < startPoint.x
          ? startPoint.x - width
          : startPoint.x,
      y:
        constrainedPoint.y < startPoint.y
          ? startPoint.y - height
          : startPoint.y,
      w: width,
      h: height,
      dirX: constrainedPoint.x >= startPoint.x ? 1 : -1,
      dirY: constrainedPoint.y >= startPoint.y ? 1 : -1,
    };
  };
deps.backgroundPressRef.current = true;
deps.trackGesture("place-tool", true);
let snapTinyToPoint: Dynamic = (rect?: Dynamic): Dynamic => {
    let [widthPx, heightPx]: Dynamic = [
      rect.w * getScale(),
      rect.h * getScale(),
    ];
    return (
      isLineTool
        ? widthPx > 4 || heightPx > 4
        : widthPx > 4 && heightPx > 4
    )
      ? rect
      : {
          ...rect,
          x: startPoint.x,
          y: startPoint.y,
          w: 0,
          h: 0,
        };
  },
  lastRect: Dynamic = null,
  handlePointerMove: Dynamic = (moveEvent?: Dynamic): Dynamic => {
    if (moveEvent.pointerId !== pointerId) return;
    let rect: Dynamic = computePlacementRect(moveEvent),
      screenDistanceSq: Dynamic =
        (rect.w * rect.w + rect.h * rect.h) *
        getScale() *
        getScale();
    (!lastRect && screenDistanceSq <= 16) ||
      ((lastRect = rect),
      deps.setShapeDraft({
        tool: activeTool,
        ...rect,
        onCanvas: !targetBoard,
      }));
  },
  endPlacement: Dynamic = (): Dynamic => {
    (window as Dynamic).removeEventListener(
      "pointermove",
      handlePointerMove,
    );
    (window as Dynamic).removeEventListener(
      "pointerup",
      handlePointerUp,
    );
    (window as Dynamic).removeEventListener(
      "pointercancel",
      handlePointerCancel,
    );
    (window as Dynamic).removeEventListener(
      "keydown",
      handleKeyDown,
      true,
    );
    deps.backgroundPressRef.current = false;
    deps.setShapeDraft(null);
    deps.trackGesture("place-tool", false);
  },
  handlePointerUp: Dynamic = (upEvent?: Dynamic): Dynamic => {
    if (
      upEvent.pointerId !== pointerId ||
      (endPlacement(), !deps.canEditCanvasRef.current)
    )
      return;
    let finalRect: Dynamic = lastRect ?? computePlacementRect(upEvent),
      placedRect: Dynamic = lastRect
        ? snapTinyToPoint(finalRect)
        : {
            ...finalRect,
            x: startPoint.x,
            y: startPoint.y,
            w: 0,
            h: 0,
          },
      direction: Dynamic = {
        x: finalRect.dirX,
        y: finalRect.dirY,
      },
      relativeRect: Dynamic = {
        x: Math.round(placedRect.x - (targetBoard?.x ?? 0)),
        y: Math.round(placedRect.y - (targetBoard?.y ?? 0)),
        w: Math.round(placedRect.w),
        h: Math.round(placedRect.h),
      };
    targetBoard
      ? deps.onPlaceTool?.(activeTool, targetBoard.file, relativeRect, direction)
      : deps.onAddShape?.(activeTool, relativeRect, direction);
  },
  handlePointerCancel: Dynamic = (cancelEvent?: Dynamic): Dynamic => {
    cancelEvent.pointerId === pointerId && endPlacement();
  },
  handleKeyDown: Dynamic = (keyEvent?: Dynamic): Dynamic => {
    keyEvent.key === "Escape" &&
      (keyEvent.preventDefault(),
      keyEvent.stopPropagation(),
      endPlacement());
  };
(window as Dynamic).addEventListener("pointermove", handlePointerMove);
(window as Dynamic).addEventListener("pointerup", handlePointerUp);
(window as Dynamic).addEventListener(
  "pointercancel",
  handlePointerCancel,
);
(window as Dynamic).addEventListener(
  "keydown",
  handleKeyDown,
  true,
);
}

/** 采集画笔轨迹并处理释放、指针取消和 Escape。 */
function beginFreehandDrawing(deps: Pick<CanvasBackgroundPressDependencies, "camera" | "backgroundPressRef" | "trackGesture" | "clientToCanvasPoint" | "setFrameDraft" | "canEditCanvasRef" | "onAddPen">, event: Dynamic): void {
event.preventDefault();
event.stopPropagation();
focusCanvasDocument();
let canvasRect: Dynamic =
    event.currentTarget.getBoundingClientRect(),
  pointerId: Dynamic = event.pointerId,
  points: Dynamic = [[event.clientX, event.clientY]],
  distanceThresholdSq: Dynamic = 4,
  getTolerance: Dynamic = (): Dynamic =>
    freehandSimplifyTolerance / deps.camera.get().scale;
deps.backgroundPressRef.current = true;
deps.trackGesture("place-tool", true);
let updatePreview: Dynamic = (): Dynamic => {
    let canvasPoints: Dynamic = points.map(
      ([clientX, clientY]: Dynamic): Dynamic =>
        deps.clientToCanvasPoint(clientX, clientY, canvasRect),
    );
    deps.setFrameDraft(
      freehandDrawingAnnotation(
        canvasPoints,
        getTolerance(),
        false,
      ),
    );
  },
  handlePointerMove: Dynamic = (moveEvent?: Dynamic): Dynamic => {
    if (moveEvent.pointerId !== pointerId) return;
    let [lastX, lastY]: Dynamic = points[points.length - 1];
    (moveEvent.clientX - lastX) ** 2 +
      (moveEvent.clientY - lastY) ** 2 <
      distanceThresholdSq ||
      (points.push([moveEvent.clientX, moveEvent.clientY]),
      points.length > 3e3 &&
        ((points = points.filter(
          (point?: Dynamic, index?: Dynamic): Dynamic =>
            index % 2 === 0,
        )),
        (distanceThresholdSq *= 4)),
      updatePreview());
  },
  endDrawing: Dynamic = (): Dynamic => {
    (window as Dynamic).removeEventListener(
      "pointermove",
      handlePointerMove,
    );
    (window as Dynamic).removeEventListener(
      "pointerup",
      handlePointerUp,
    );
    (window as Dynamic).removeEventListener(
      "pointercancel",
      handlePointerCancel,
    );
    (window as Dynamic).removeEventListener(
      "keydown",
      handleKeyDown,
      true,
    );
    deps.backgroundPressRef.current = false;
    deps.setFrameDraft(null);
    deps.trackGesture("place-tool", false);
  },
  handlePointerUp: Dynamic = (upEvent?: Dynamic): Dynamic => {
    upEvent.pointerId === pointerId &&
      (endDrawing(),
      !(!deps.canEditCanvasRef.current || points.length < 2) &&
        deps.onAddPen(
          freehandDrawingAnnotation(
            points.map(
              ([clientX, clientY]: Dynamic): Dynamic =>
                deps.clientToCanvasPoint(clientX, clientY, canvasRect),
            ),
            getTolerance(),
          ),
        ));
  },
  handlePointerCancel: Dynamic = (cancelEvent?: Dynamic): Dynamic => {
    cancelEvent.pointerId === pointerId && endDrawing();
  },
  handleKeyDown: Dynamic = (keyEvent?: Dynamic): Dynamic => {
    keyEvent.key === "Escape" &&
      (keyEvent.preventDefault(),
      keyEvent.stopPropagation(),
      endDrawing());
  };
(window as Dynamic).addEventListener("pointermove", handlePointerMove);
(window as Dynamic).addEventListener("pointerup", handlePointerUp);
(window as Dynamic).addEventListener(
  "pointercancel",
  handlePointerCancel,
);
(window as Dynamic).addEventListener(
  "keydown",
  handleKeyDown,
  true,
);
}
