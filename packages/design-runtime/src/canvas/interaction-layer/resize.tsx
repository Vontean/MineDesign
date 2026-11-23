import { activeResizeGuides } from "../../editor/geometry/snapping";
import { annotationTransformSnapshot } from "../../geometry/selection-transform";
import { artboardTransformSnapshot } from "../../geometry/selection-transform";
import { bothTransformAxes } from "../interaction-geometry";
import { canvasTouchDragThresholdPixels } from "../interaction-geometry";
import { focusCanvasDocument } from "../focus";
import { resizeRect } from "../../editor/geometry/resize";
import { resizeRectKeepingAspect } from "../../editor/geometry/resize";
import { resizeRotatedRect } from "../../editor/geometry/rotation";
import { selectionScaleLimits } from "../../geometry/selection-transform";
import { selectionTransformMembers } from "../../geometry/selection-transform";
import { selectionUniformScaleTransform } from "../../geometry/selection-transform";
import { snapResize } from "../../editor/geometry/snapping";
import { transformAnnotationBounds } from "../../geometry/selection-transform";
import { transformArtboardBounds } from "../../geometry/selection-transform";
import { transformTouchedProperties } from "../../geometry/selection-transform";
import { type Dynamic } from "../../runtime-types";

/** 按下缩放或编组变换手柄时运行：捕获指针，移动超过 4px 后持续调用 live，松开时 commit，按 Esc、丢失捕获或手柄消失时 revert，最后清理监听。 */
export function trackHandleDragGesture(deps: { readonly trackPointerGesture: Dynamic; readonly activeGesturesRef: Dynamic; readonly trackGesture: Dynamic; readonly canEditCanvas: Dynamic; readonly canEditCanvasRef: Dynamic }, event?: Dynamic,
      handleName?: Dynamic,
      gestureCallbacks?: Dynamic): Dynamic {
      if (event.button !== 0 || !deps.canEditCanvas || deps.activeGesturesRef.current.has("resize"))
        return;
      event.preventDefault();
      event.stopPropagation();
      focusCanvasDocument();
      let pointerId: Dynamic = event.pointerId,
        ancestor: Dynamic = event.currentTarget.closest(
          '[data-mega-chrome="' + handleName + '"]',
        ),
        capturePointer: Dynamic = (captureTarget?: Dynamic): Dynamic => {
          try {
            captureTarget?.setPointerCapture(pointerId);
          } catch {}
        };
      capturePointer(event.currentTarget);
      deps.trackGesture("resize", true);
      deps.trackPointerGesture("resize");
      let [startX, startY]: Dynamic = [event.clientX, event.clientY],
        isHandleAlive: Dynamic = (): Dynamic =>
          !!ancestor?.isConnected && deps.canEditCanvasRef.current,
        hasMoved: Dynamic = false,
        handlePointerMove: Dynamic = (moveEvent?: Dynamic): Dynamic => {
          if (moveEvent.pointerId === pointerId) {
            if (!isHandleAlive()) return handlePointerCancel();
            (!hasMoved &&
              Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) <
                4) ||
              ((hasMoved = true), gestureCallbacks.live(moveEvent));
          }
        },
        handleLostCapture: Dynamic = (lostCaptureEvent?: Dynamic): Dynamic => {
          lostCaptureEvent.pointerId === pointerId && capturePointer(ancestor);
        },
        cleanup: Dynamic = (): Dynamic => {
          (window as Dynamic).removeEventListener("pointermove", handlePointerMove);
          (window as Dynamic).removeEventListener("pointerup", handlePointerUp);
          (window as Dynamic).removeEventListener(
            "pointercancel",
            handlePointerCancel,
          );
          (window as Dynamic).removeEventListener(
            "keydown",
            handleKeyDown,
            true,
          );
          (document as Dynamic).removeEventListener(
            "lostpointercapture",
            handleLostCapture,
            true,
          );
          deps.trackGesture("resize", false);
          gestureCallbacks.end?.();
        },
        handlePointerUp: Dynamic = (upEvent?: Dynamic): Dynamic => {
          upEvent.pointerId === pointerId &&
            (cleanup(),
            hasMoved &&
              (isHandleAlive() ? gestureCallbacks.commit(upEvent) : gestureCallbacks.revert()));
        },
        handlePointerCancel: Dynamic = (cancelEvent?: Dynamic): Dynamic => {
          (cancelEvent && cancelEvent.pointerId !== pointerId) ||
            (cleanup(), hasMoved && gestureCallbacks.revert());
        },
        handleKeyDown: Dynamic = (keyEvent?: Dynamic): Dynamic => {
          keyEvent.key === "Escape" &&
            (keyEvent.preventDefault(),
            keyEvent.stopImmediatePropagation(),
            handlePointerCancel());
        };
      (window as Dynamic).addEventListener("pointermove", handlePointerMove);
      (window as Dynamic).addEventListener("pointerup", handlePointerUp);
      (window as Dynamic).addEventListener("pointercancel", handlePointerCancel);
      (window as Dynamic).addEventListener("keydown", handleKeyDown, true);
      (document as Dynamic).addEventListener(
        "lostpointercapture",
        handleLostCapture,
        true,
      );
    }

/** 选中多个画板或便签并整体缩放或旋转时运行：记录变换前的快照，手势中把计算出的新几何写入画布清单并显示变换框，结束时提交或还原。 */
export function runSelectionTransformGesture(deps: { readonly trackHandleDragGestureBound: Dynamic; readonly onManifestChange: Dynamic; readonly manifestRef: Dynamic; readonly selectedArtboardSpecs: Dynamic; readonly selectedNoteEntries: Dynamic; readonly setGroupTransformPreview: Dynamic; readonly setGroupSnapTransforms: Dynamic; readonly selectionBox: Dynamic; readonly selectionRotation: Dynamic; readonly setSnapGuides: Dynamic }, pointerEvent?: Dynamic,
      gestureLabel?: Dynamic,
      touchedKeys?: Dynamic,
      computeTransform?: Dynamic,
      isRotated: Dynamic = false): Dynamic {
      let boardEntries: Dynamic = new Map(
          deps.selectedArtboardSpecs.map((boardEntry?: Dynamic): Dynamic => [boardEntry.file, boardEntry]),
        ),
        noteEntries: Dynamic = new Map(
          deps.selectedNoteEntries.map(
            (noteEntry?: Dynamic): Dynamic => [noteEntry.spec.id, noteEntry],
          ),
        ),
        pickTouchedProps: Dynamic = (snapshot?: Dynamic): Dynamic =>
          Object.fromEntries(
            Object.entries(snapshot).filter(
              ([key]: Dynamic): Dynamic => touchedKeys.has(key),
            ),
          ),
        startBox: Dynamic = deps.selectionBox,
        applyTransform: Dynamic = (
          transform?: Dynamic,
          shouldCommit?: Dynamic,
        ): Dynamic => {
          deps.setGroupTransformPreview(
            transform && !shouldCommit
              ? {
                  box: transform.box,
                  deg: transform.deg,
                  turning: gestureLabel === "Rotate",
                }
              : null,
          );
          let manifest: Dynamic = deps.manifestRef.current,
            nextManifest: Dynamic = {
              ...manifest,
              artboards: manifest.artboards.map(
                (board?: Dynamic): Dynamic => {
                  let transformEntry: Dynamic = boardEntries.get(board.file);
                  return transformEntry
                    ? {
                        ...board,
                        ...(transform
                          ? transform.board(transformEntry)
                          : pickTouchedProps(
                              artboardTransformSnapshot(transformEntry),
                            )),
                      }
                    : board;
                },
              ),
              ...(noteEntries.size > 0
                ? {
                    annotations: (manifest.annotations ?? []).map(
                      (annotation?: Dynamic): Dynamic => {
                        let transformEntry: Dynamic = noteEntries.get(annotation.id);
                        return transformEntry
                          ? {
                              ...annotation,
                              ...(transform
                                ? transform.ann(transformEntry)
                                : pickTouchedProps(
                                    annotationTransformSnapshot(
                                      transformEntry.spec,
                                    ),
                                  )),
                            }
                          : annotation;
                      },
                    ),
                  }
                : {}),
            };
          shouldCommit &&
            transform &&
            (transform.deg !== 0 || isRotated) &&
            deps.setGroupSnapTransforms(
              (previousTransforms?: Dynamic): Dynamic =>
                [
                  {
                    box: transform.box,
                    deg: transform.deg,
                    members: selectionTransformMembers(
                      nextManifest.artboards.filter(
                        (board?: Dynamic): Dynamic =>
                          boardEntries.has(board.file),
                      ),
                      (nextManifest.annotations ?? []).filter(
                        (annotation?: Dynamic): Dynamic =>
                          noteEntries.has(annotation.id),
                      ),
                    ),
                  },
                  ...previousTransforms,
                ].slice(0, 8),
            );
          deps.onManifestChange(
            nextManifest,
            shouldCommit,
            shouldCommit
              ? {
                  transformed: {
                    label: gestureLabel,
                    keys: touchedKeys,
                    boards: boardEntries,
                    notes: new Map(
                      deps.selectedNoteEntries.map(
                        (noteEntry?: Dynamic): Dynamic => [
                          noteEntry.spec.id,
                          noteEntry.spec,
                        ],
                      ),
                    ),
                  },
                }
              : undefined,
          );
        },
        currentTransform: Dynamic = null;
      deps.trackHandleDragGestureBound(pointerEvent, "group-resize", {
        live: (moveEvent?: Dynamic): Dynamic => {
          currentTransform = computeTransform(moveEvent);
          applyTransform(currentTransform, false);
          currentTransform ||
            deps.setGroupTransformPreview({
              box: startBox,
              deg: deps.selectionRotation,
              turning: gestureLabel === "Rotate",
            });
        },
        commit: (): Dynamic => {
          currentTransform ? applyTransform(currentTransform, true) : applyTransform(null, false);
        },
        revert: (): Dynamic => applyTransform(null, false),
        end: (): Dynamic => {
          deps.setGroupTransformPreview(null);
          deps.setSnapGuides(null);
        },
      });
    }

/** 拖动选中范围的缩放手柄时运行：根据指针位移和缩放上下限计算新的选区框（支持吸附、Shift 等比、旋转后的矩形），再交给整体变换手势应用到画板与便签。 */
export function beginSelectionGroupResize(deps: { readonly buildSnapReferenceLines: Dynamic; readonly runSelectionTransform: Dynamic; readonly camera: Dynamic; readonly selectedArtboards: Dynamic; readonly selectedNotes: Dynamic; readonly selectedArtboardSpecs: Dynamic; readonly selectedNoteEntries: Dynamic; readonly selectionBox: Dynamic; readonly selectionRotation: Dynamic; readonly isRotatedSelection: Dynamic; readonly setSnapGuides: Dynamic }, handleAxes?: Dynamic, pointerEvent?: Dynamic): Dynamic {
      if (!deps.selectionBox) return;
      let [startBox, rotationDeg]: Dynamic = [deps.selectionBox, deps.selectionRotation],
        { min: sizeMin, max: sizeMax }: Dynamic = selectionScaleLimits(startBox, deps.selectedArtboardSpecs, deps.selectedNoteEntries),
        activeAxes: Dynamic = {
          x: handleAxes.x !== null,
          y: handleAxes.y !== null,
        },
        canKeepAspect: Dynamic = activeAxes.x && activeAxes.y && startBox.w > 0 && startBox.h > 0,
        [startClientX, startClientY]: Dynamic = [pointerEvent.clientX, pointerEvent.clientY],
        touchedKeys: Dynamic = transformTouchedProperties(
          rotationDeg
            ? {
                x: true,
                y: true,
              }
            : activeAxes,
        ),
        snapTargets: Dynamic = rotationDeg
          ? []
          : deps.buildSnapReferenceLines({
              files: deps.selectedArtboards,
              notes: deps.selectedNotes,
            });
      deps.runSelectionTransform(
        pointerEvent,
        "Resize",
        touchedKeys,
        (moveEvent?: Dynamic): Dynamic => {
          let scale: Dynamic = deps.camera.get().scale,
            pointerDelta: Dynamic = {
              dx: (moveEvent.clientX - startClientX) / scale,
              dy: (moveEvent.clientY - startClientY) / scale,
            },
            snapped: Dynamic =
              rotationDeg || moveEvent.metaKey || moveEvent.ctrlKey
                ? {
                    ...pointerDelta,
                    guides: [],
                  }
                : snapResize(
                    startBox,
                    handleAxes,
                    pointerDelta.dx,
                    pointerDelta.dy,
                    snapTargets,
                    canvasTouchDragThresholdPixels / scale,
                  ),
            [deltaX, deltaY]: Dynamic = [snapped.dx, snapped.dy];
          if (rotationDeg) {
            let rotatedBox: Dynamic = resizeRotatedRect(
              startBox,
              rotationDeg,
              handleAxes,
              deltaX,
              deltaY,
              sizeMin,
              sizeMax,
              true,
            );
            if (rotatedBox.w === startBox.w && rotatedBox.h === startBox.h) return null;
            let uniformScale: Dynamic = selectionUniformScaleTransform(
              {
                x: startBox.x + startBox.w / 2,
                y: startBox.y + startBox.h / 2,
              },
              {
                x: rotatedBox.x + rotatedBox.w / 2,
                y: rotatedBox.y + rotatedBox.h / 2,
              },
              rotatedBox.w / startBox.w,
            );
            return {
              box: rotatedBox,
              deg: rotationDeg,
              keys: touchedKeys,
              board: (board?: Dynamic): Dynamic =>
                transformArtboardBounds(
                  board,
                  uniformScale.from,
                  uniformScale.to,
                  bothTransformAxes,
                ),
              ann: (annotation?: Dynamic): Dynamic =>
                transformAnnotationBounds(
                  annotation.spec,
                  uniformScale.from,
                  uniformScale.to,
                  bothTransformAxes,
                ),
            };
          }
          let resizedBox: Dynamic =
              canKeepAspect && (deps.isRotatedSelection || moveEvent.shiftKey)
                ? resizeRectKeepingAspect(
                    startBox,
                    handleAxes,
                    deltaX,
                    deltaY,
                    sizeMin,
                    sizeMax,
                  )
                : resizeRect(
                    startBox,
                    handleAxes,
                    deltaX,
                    deltaY,
                    sizeMin,
                    sizeMax,
                  ),
            activeGuides: Dynamic = activeResizeGuides(
              resizedBox,
              handleAxes,
              snapped.guides,
            );
          deps.setSnapGuides(activeGuides.length > 0 ? activeGuides : null);
          return resizedBox.x === startBox.x &&
            resizedBox.y === startBox.y &&
            resizedBox.w === startBox.w &&
            resizedBox.h === startBox.h
            ? null
            : {
                box: resizedBox,
                deg: 0,
                keys: touchedKeys,
                board: (board?: Dynamic): Dynamic =>
                  transformArtboardBounds(
                    board,
                    startBox,
                    resizedBox,
                    activeAxes,
                  ),
                ann: (annotation?: Dynamic): Dynamic =>
                  transformAnnotationBounds(
                    annotation.spec,
                    startBox,
                    resizedBox,
                    activeAxes,
                  ),
              };
        },
        rotationDeg !== 0,
      );
    }
