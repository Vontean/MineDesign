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
export function openCanvasContextMenu(deps: { readonly callback12: Dynamic; readonly callback20: Dynamic; readonly onCanvasMenu: Dynamic; readonly value107: Dynamic; readonly value108: Dynamic; readonly value109: Dynamic; readonly value128: Dynamic; readonly value130: Dynamic; readonly value55: Dynamic }, event?: Dynamic): Dynamic {
          if (
            deps.onCanvasMenu == null ||
            deps.value55.current != null ||
            deps.value128.current ||
            OutlineDcOutlineHandler(event.target)
          )
            return;
          if (deps.value108.contextmenu()) return void event.preventDefault();
          let menuTarget: Dynamic =
              deps.callback20(event) && deps.value130.current.size === 0
                ? canvasContextMenuTargetFromElement(
                    event.target,
                  )
                : null,
            lastPress: Dynamic = deps.value109.current;
          deps.value109.current = null;
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
              deps.callback12({
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
          deps.value107(
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
export function pressCanvasBackground(deps: { readonly callback10: Dynamic; readonly callback13: Dynamic; readonly callback14: Dynamic; readonly callback16: Dynamic; readonly callback19: Dynamic; readonly callback20: Dynamic; readonly callback30: Dynamic; readonly camera: Dynamic; readonly manifest: Dynamic; readonly onAddAnnotation: Dynamic; readonly onAddPen: Dynamic; readonly onAddShape: Dynamic; readonly onClearSelection: Dynamic; readonly onDrawArtboard: Dynamic; readonly onPlaceBlocked: Dynamic; readonly onPlaceTool: Dynamic; readonly value108: Dynamic; readonly value128: Dynamic; readonly value130: Dynamic; readonly value134: Dynamic; readonly value183: Dynamic; readonly value19: Dynamic; readonly value213: Dynamic; readonly value55: Dynamic; readonly value78: Dynamic; readonly value79: Dynamic; readonly value81: Dynamic; readonly value83: Dynamic; readonly value85: Dynamic; readonly value96: Dynamic }, event?: Dynamic): Dynamic {
          deps.value108.clear();
          if (!!deps.callback20(event) && !deps.value130.current.has("marquee")) {
            if (
              !deps.value96.current &&
              deps.value85.current === "note" &&
              event.button === 0 &&
              deps.value55.current == null &&
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
              !deps.value96.current &&
              deps.value85.current === "frame" &&
              event.button === 0 &&
              deps.value55.current == null &&
              (!(event.target instanceof Element) ||
                event.target.closest("[data-mega-chrome]") == null)
            ) {
              event.preventDefault();
              event.stopPropagation();
              focusCanvasDocument();
              let canvasRect: Dynamic =
                  event.currentTarget.getBoundingClientRect(),
                startPoint: Dynamic = deps.callback16(
                  event.clientX,
                  event.clientY,
                  canvasRect,
                );
              deps.value134("frame-tool", true);
              deps.callback30("frame-tool");
              let getDragRect: Dynamic = (moveEvent?: Dynamic): Dynamic => {
                  let endPoint: Dynamic = deps.callback16(
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
                  deps.value78(getDragRect(moveEvent)),
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
                  deps.value78(null);
                  deps.value134("frame-tool", false);
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
                  deps.value78(null);
                  deps.value134("frame-tool", false);
                };
              (window as Dynamic).addEventListener("pointermove", previewDragRect);
              (window as Dynamic).addEventListener("pointerup", finishDrag);
              (window as Dynamic).addEventListener(
                "pointercancel",
                cancelDrag,
              );
              return;
            }
            if (
              !deps.value96.current &&
              deps.value19.current &&
              supportsClickPlacement(deps.value85.current) &&
              event.button === 0 &&
              event.isPrimary &&
              !deps.value79.current &&
              deps.value55.current == null &&
              (!(event.target instanceof Element) ||
                event.target.closest("[data-mega-chrome]") == null)
            ) {
              event.preventDefault();
              event.stopPropagation();
              focusCanvasDocument();
              let activeTool: Dynamic = deps.value85.current,
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
                  deps.value183.current !== artboardFile,
                outsideFile: Dynamic = isFramelessOther ? null : artboardFile,
                targetBoard: Dynamic = isFramelessOther ? null : hitBoard;
              if (
                targetBoard
                  ? deps.value213.has(targetBoard.file)
                  : outsideFile != null || !deps.onAddShape
              ) {
                deps.onPlaceBlocked?.(activeTool, targetBoard ? "blocked" : "outside");
                return;
              }
              let canvasRect: Dynamic =
                  event.currentTarget.getBoundingClientRect(),
                startPoint: Dynamic = deps.callback16(
                  event.clientX,
                  event.clientY,
                  canvasRect,
                ),
                pointerId: Dynamic = event.pointerId,
                getScale: Dynamic = (): Dynamic => deps.camera.get().scale,
                isLineTool: Dynamic = activeTool === "arrow" || activeTool === "line",
                computePlacementRect: Dynamic = (pointerEvent?: Dynamic): Dynamic => {
                  let endPoint: Dynamic = deps.callback16(
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
              deps.value79.current = true;
              deps.value134("place-tool", true);
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
                    deps.value81({
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
                  deps.value79.current = false;
                  deps.value81(null);
                  deps.value134("place-tool", false);
                },
                handlePointerUp: Dynamic = (upEvent?: Dynamic): Dynamic => {
                  if (
                    upEvent.pointerId !== pointerId ||
                    (endPlacement(), !deps.value19.current)
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
              return;
            }
            if (
              !deps.value96.current &&
              deps.value19.current &&
              deps.value85.current === "draw" &&
              deps.onAddPen &&
              event.button === 0 &&
              event.isPrimary &&
              !deps.value79.current &&
              deps.value55.current == null &&
              event.target instanceof Element &&
              event.target.closest("[data-mega-chrome]") == null &&
              event.target.closest("[data-mega-artboard]") == null
            ) {
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
              deps.value79.current = true;
              deps.value134("place-tool", true);
              let updatePreview: Dynamic = (): Dynamic => {
                  let canvasPoints: Dynamic = points.map(
                    ([clientX, clientY]: Dynamic): Dynamic =>
                      deps.callback16(clientX, clientY, canvasRect),
                  );
                  deps.value83(
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
                  deps.value79.current = false;
                  deps.value83(null);
                  deps.value134("place-tool", false);
                },
                handlePointerUp: Dynamic = (upEvent?: Dynamic): Dynamic => {
                  upEvent.pointerId === pointerId &&
                    (endDrawing(),
                    !(!deps.value19.current || points.length < 2) &&
                      deps.onAddPen(
                        freehandDrawingAnnotation(
                          points.map(
                            ([clientX, clientY]: Dynamic): Dynamic =>
                              deps.callback16(clientX, clientY, canvasRect),
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
              return;
            }
            if (
              !deps.value96.current &&
              deps.value55.current == null &&
              deps.callback14(event.nativeEvent)
            ) {
              deps.callback19(event, {
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
              deps.value55.current == null &&
              (deps.callback13(event.nativeEvent) ||
                (event.button === 0 && deps.callback10(event.nativeEvent)))
            ) {
              deps.value134("pan", true);
              event.pointerType === "mouse" &&
                event.currentTarget.setAttribute("data-mega-grabbing", "");
              let menuTarget: Dynamic =
                event.button === 2 && !deps.value128.current
                  ? canvasContextMenuTargetFromElement(
                      event.target,
                    )
                  : null;
              menuTarget !== null && deps.value108.down(event, menuTarget);
              deps.callback30(
                "pan",
                event.button === 1 ? 4 : event.button === 2 ? 2 : 1,
              );
            }
          }
        }
