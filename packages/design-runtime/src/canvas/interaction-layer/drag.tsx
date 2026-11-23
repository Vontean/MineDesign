import { canvasSnapReferenceObjects, preserveUnroundedDragPosition, snapCanvasDrag } from "../../geometry/canvas-snapping";
import { canvasDragThresholdPixels, canvasTouchDragThresholdPixels } from "../interaction-geometry";
import { focusCanvasDocument } from "../focus";
import { boardSelectionItems, hasBoardSelection } from "../../editor/selection/canvas-selection";
import { rectangleSnapGuides } from "../../editor/geometry/snapping";
import { rotatedAnnotationBounds } from "../../platform/file-content";
import { type Dynamic } from "../../runtime-types";
import { unionRects } from "../../editor/geometry/resize";

/** 宿主正在拖入文件时（streamDragFile 存在）运行的 effect：监听全局指针事件，把鼠标在画布上的坐标以 move、up、cancel、stale 回报给宿主拖放。 */
export function subscribeHostDragPointer(deps: { readonly clientToCanvasPoint: Dynamic; readonly streamDragFile: Dynamic; readonly canvasRootRef: Dynamic; readonly onHostDragRef: Dynamic }): Dynamic {
    if (deps.streamDragFile == null) return;
    let toCanvasPoint: Dynamic = (event?: Dynamic): Dynamic => {
        let canvasRect: Dynamic = deps.canvasRootRef.current?.getBoundingClientRect();
        return canvasRect
          ? deps.clientToCanvasPoint(event.clientX, event.clientY, canvasRect)
          : null;
      },
      reportCancel: Dynamic = (): Dynamic =>
        deps.onHostDragRef.current?.("cancel", 0, 0, false),
      handlePointerDown: Dynamic = (downEvent?: Dynamic): Dynamic => {
        downEvent.pointerType === "mouse" &&
          deps.onHostDragRef.current?.("stale", 0, 0, false);
      },
      handlePointerMove: Dynamic = (moveEvent?: Dynamic): Dynamic => {
        if (moveEvent.pointerType !== "mouse") return;
        if (!(moveEvent.buttons & 1)) {
          reportCancel();
          return;
        }
        let canvasPoint: Dynamic = toCanvasPoint(moveEvent);
        canvasPoint &&
          deps.onHostDragRef.current?.(
            "move",
            canvasPoint.x,
            canvasPoint.y,
            moveEvent.altKey,
            moveEvent.ctrlKey,
          );
      },
      handlePointerUp: Dynamic = (upEvent?: Dynamic): Dynamic => {
        if (upEvent.pointerType !== "mouse" || upEvent.button !== 0) return;
        let point: Dynamic = toCanvasPoint(upEvent),
          isInsideCanvas: Dynamic =
            !!deps.canvasRootRef.current &&
            upEvent.target instanceof Node &&
            deps.canvasRootRef.current.contains(upEvent.target);
        point && isInsideCanvas
          ? deps.onHostDragRef.current?.(
              "up",
              point.x,
              point.y,
              upEvent.altKey,
              upEvent.ctrlKey,
            )
          : reportCancel();
      };
    (window as Dynamic).addEventListener("pointerdown", handlePointerDown, true);
    (window as Dynamic).addEventListener("pointermove", handlePointerMove, true);
    (window as Dynamic).addEventListener("pointerup", handlePointerUp, true);
    (window as Dynamic).addEventListener("pointercancel", reportCancel, true);
    (window as Dynamic).addEventListener("blur", reportCancel);
    return (): Dynamic => {
      (window as Dynamic).removeEventListener(
        "pointerdown",
        handlePointerDown,
        true,
      );
      (window as Dynamic).removeEventListener(
        "pointermove",
        handlePointerMove,
        true,
      );
      (window as Dynamic).removeEventListener("pointerup", handlePointerUp, true);
      (window as Dynamic).removeEventListener(
        "pointercancel",
        reportCancel,
        true,
      );
      (window as Dynamic).removeEventListener("blur", reportCancel);
    };
  }

/** 按住画板标题栏或便签开始拖动时运行：捕获指针，收集要一起移动的画板与便签（按 Alt 时准备复制），计算吸附参照，并在 Ctrl/Esc 等按键下切换或取消拖动。 */
export function beginBoardDrag(deps: { readonly trackPointerGesture: Dynamic; readonly endBoardDrag: Dynamic; readonly manifest: Dynamic; readonly onDuplicateObjects: Dynamic; readonly trackGesture: Dynamic; readonly annotationBoxRef: Dynamic; readonly endBoardDragRef: Dynamic; readonly updateBoardDragRef: Dynamic; readonly dragSessionRef: Dynamic }, pointerEvent?: Dynamic,
      dragTarget?: Dynamic,
      fallbackBox?: Dynamic,
      selection?: Dynamic,
      onClick?: Dynamic,
      shouldFocus: Dynamic = false): Dynamic {
      if (pointerEvent.button !== 0) return;
      let previousDrag: Dynamic = deps.dragSessionRef.current;
      previousDrag && deps.endBoardDrag(previousDrag.pointerId);
      let isReusingPrevious: Dynamic = previousDrag && previousDrag.live && !previousDrag.alt,
        previousBoardByFile: Dynamic = new Map(
          isReusingPrevious
            ? previousDrag.set.map(
                (board?: Dynamic): Dynamic => [board.file, board],
              )
            : [],
        ),
        previousNoteById: Dynamic = new Map(
          isReusingPrevious
            ? previousDrag.notes.map(
                (note?: Dynamic): Dynamic => [note.id, note],
              )
            : [],
        );
      pointerEvent.currentTarget.setPointerCapture(pointerEvent.pointerId);
      deps.trackGesture("frame-drag", true);
      deps.trackPointerGesture("frame-drag");
      let dragBoards: Dynamic = deps.manifest.artboards
          .filter(
            (board?: Dynamic): Dynamic =>
              hasBoardSelection(selection, {
                file: board.file,
              }) ||
              ("file" in dragTarget && dragTarget.file === board.file),
          )
          .map(
            (board?: Dynamic): Dynamic =>
              previousBoardByFile.get(board.file) ?? {
                file: board.file,
                x: board.x,
                y: board.y,
                w: board.w,
                h: board.h,
              },
          ),
        dragNotes: Dynamic = (deps.manifest.annotations ?? [])
          .filter(
            (note?: Dynamic): Dynamic =>
              hasBoardSelection(selection, {
                note: note.id,
              }) ||
              ("note" in dragTarget && dragTarget.note === note.id),
          )
          .map(
            (note?: Dynamic): Dynamic => previousNoteById.get(note.id) ?? note,
          ),
        originBox: Dynamic =
          ("file" in dragTarget
            ? previousBoardByFile.get(dragTarget.file)
            : previousNoteById.get(dragTarget.note)) ?? fallbackBox,
        isDuplicating: Dynamic = pointerEvent.altKey && deps.onDuplicateObjects != null,
        dragBounds: Dynamic = unionRects([
          ...dragBoards,
          ...dragNotes.map(
            (note?: Dynamic): Dynamic =>
              rotatedAnnotationBounds(
                note,
                deps.annotationBoxRef.current(note),
              ),
          ),
        ]),
        allBoards: Dynamic = deps.manifest.artboards.map(
          (board?: Dynamic): Dynamic => previousBoardByFile.get(board.file) ?? board,
        ),
        allNoteBounds: Dynamic = (deps.manifest.annotations ?? []).map(
          (note?: Dynamic): Dynamic => {
            let displayedNote: Dynamic = previousNoteById.get(note.id) ?? note;
            return {
              id: displayedNote.id,
              ...rotatedAnnotationBounds(
                displayedNote,
                deps.annotationBoxRef.current(displayedNote),
              ),
            };
          },
        ),
        movingSet: Dynamic = {
          files: new Set(
            dragBoards.map((board?: Dynamic): Dynamic => board.file),
          ),
          notes: new Set(
            dragNotes.map((note?: Dynamic): Dynamic => note.id),
          ),
        },
        moveSnapObjects: Dynamic = canvasSnapReferenceObjects(
          allBoards,
          allNoteBounds,
          movingSet,
          false,
        ),
        copySnapObjects: Dynamic = canvasSnapReferenceObjects(
          allBoards,
          allNoteBounds,
          movingSet,
          true,
        ),
        pointerId: Dynamic = pointerEvent.pointerId;
      focusCanvasDocument();
      let isEscapeHeld: Dynamic = false,
        handleKey: Dynamic = (keyEvent?: Dynamic): Dynamic => {
          let activeDrag: Dynamic = deps.dragSessionRef.current;
          keyEvent.key === "Escape" && keyEvent.type === "keyup" && (isEscapeHeld = false);
          if (keyEvent.key === "Escape" && keyEvent.type === "keydown" && isEscapeHeld) {
            keyEvent.preventDefault();
            keyEvent.stopImmediatePropagation();
            return;
          }
          if (
            !(!activeDrag || activeDrag.pointerId !== pointerId || !activeDrag.live)
          ) {
            if (keyEvent.key === "Escape" && keyEvent.type === "keydown") {
              keyEvent.preventDefault();
              keyEvent.stopImmediatePropagation();
              isEscapeHeld = true;
              deps.endBoardDragRef.current(pointerId);
              return;
            }
            keyEvent.key === "Alt" &&
              !keyEvent.repeat &&
              activeDrag.last &&
              deps.updateBoardDragRef.current(
                {
                  ...activeDrag.last,
                  pointerId: pointerId,
                  altKey: keyEvent.type === "keydown",
                },
                false,
              );
            keyEvent.key === "Control" &&
              !keyEvent.repeat &&
              activeDrag.last &&
              activeDrag.hoverKey &&
              deps.updateBoardDragRef.current(
                {
                  ...activeDrag.last,
                  pointerId: pointerId,
                  altKey: activeDrag.alt,
                  ctrlKey: keyEvent.type === "keydown",
                },
                false,
              );
          }
        },
        cancelDrag: Dynamic = (): Dynamic => deps.endBoardDragRef.current(pointerId);
      (window as Dynamic).addEventListener("keydown", handleKey, true);
      (window as Dynamic).addEventListener("keyup", handleKey, true);
      (window as Dynamic).addEventListener("blur", cancelDrag);
      deps.dragSessionRef.current = {
        ref: dragTarget,
        set: dragBoards,
        notes: dragNotes,
        pointerId: pointerId,
        startX: pointerEvent.clientX,
        startY: pointerEvent.clientY,
        origX: originBox.x,
        origY: originBox.y,
        alt: isDuplicating,
        last: null,
        unlisten: (): Dynamic => {
          (window as Dynamic).removeEventListener("blur", cancelDrag);
          if (!isEscapeHeld) {
            (window as Dynamic).removeEventListener(
              "keydown",
              handleKey,
              true,
            );
            (window as Dynamic).removeEventListener(
              "keyup",
              handleKey,
              true,
            );
            return;
          }
          let releaseKeyListeners: Dynamic = (keyupEvent?: Dynamic): Dynamic => {
            keyupEvent.key !== "Escape" ||
              keyupEvent.type !== "keyup" ||
              ((window as Dynamic).removeEventListener(
                "keydown",
                handleKey,
                true,
              ),
              (window as Dynamic).removeEventListener(
                "keyup",
                handleKey,
                true,
              ),
              (window as Dynamic).removeEventListener(
                "keyup",
                releaseKeyListeners,
                true,
              ));
          };
          (window as Dynamic).addEventListener("keyup", releaseKeyListeners, true);
        },
        click: onClick,
        focus: shouldFocus && !pointerEvent.altKey,
        live: false,
        snap: dragBounds
          ? {
              box: dragBounds,
              moveLines: rectangleSnapGuides(moveSnapObjects),
              copyLines: rectangleSnapGuides(copySnapObjects),
              moveStill: moveSnapObjects,
              copyStill: copySnapObjects,
            }
          : null,
      };
    }

/** 其他手势通过 canvas.start 接管为画板拖动时运行：结束旧的拖动，按当前选择收集画板与便签，记录起点与原位置，建立拖动状态。 */
export function beginHandedOffBoardDrag(deps: { readonly manifestRef: Dynamic; readonly endBoardDragRef: Dynamic; readonly dragSessionRef: Dynamic }, moveCallback?: Dynamic,
      pointerId?: Dynamic,
      dragTarget?: Dynamic,
      selection?: Dynamic,
      startX?: Dynamic,
      startY?: Dynamic): Dynamic {
      let previousDrag: Dynamic = deps.dragSessionRef.current;
      previousDrag && deps.endBoardDragRef.current(previousDrag.pointerId);
      let manifest: Dynamic = deps.manifestRef.current,
        boards: Dynamic = manifest.artboards
          .filter(
            (board?: Dynamic): Dynamic =>
              hasBoardSelection(selection, {
                file: board.file,
              }),
          )
          .map(
            (board?: Dynamic): Dynamic => ({
              file: board.file,
              x: board.x,
              y: board.y,
              w: board.w,
              h: board.h,
            }),
          ),
        notes: Dynamic = (manifest.annotations ?? []).filter(
          (note?: Dynamic): Dynamic =>
            hasBoardSelection(selection, {
              note: note.id,
            }),
        ),
        originBox: Dynamic = ("file" in dragTarget
          ? boards.find(
              (board?: Dynamic): Dynamic => board.file === dragTarget.file,
            )
          : notes.find(
              (note?: Dynamic): Dynamic => note.id === dragTarget.note,
            )) ??
          boards[0] ??
          notes[0] ?? {
            x: 0,
            y: 0,
          };
      deps.dragSessionRef.current = {
        ref: dragTarget,
        set: boards,
        notes: notes,
        pointerId: pointerId,
        startX: startX,
        startY: startY,
        origX: originBox.x,
        origY: originBox.y,
        alt: false,
        last: null,
        unlisten: (): Dynamic => {},
        click: null,
        focus: false,
        live: true,
        setMove: moveCallback,
        snap: null,
      };
    }

/** 拖动手势的递增序号，用于生成悬停键；安装清理时归零。 */
export let canvasDragSequence: Dynamic;
export function resetCanvasDragSequence(): void {
  canvasDragSequence = 0;
}

/** 拖动画板或便签时随指针移动与松开运行：超过阈值后计算吸附与参考线、更新位置并检测放入目标，松开时提交到画布清单（或复制、放入画板），未移动则按单击处理选中与聚焦。 */
export function updateBoardDrag(deps: { readonly clientToCanvasPoint: Dynamic; readonly manifestWithDragPositions: Dynamic; readonly getAnnotationBox: Dynamic; readonly applyDragPositions: Dynamic; readonly camera: Dynamic; readonly manifest: Dynamic; readonly onDropObjectInto: Dynamic; readonly onDuplicateObjects: Dynamic; readonly onFocus: Dynamic; readonly onManifestChange: Dynamic; readonly onObjectHover: Dynamic; readonly onSelectObjects: Dynamic; readonly trackGesture: Dynamic; readonly canEditCanvas: Dynamic; readonly dragSessionRef: Dynamic; readonly setSnapGuides: Dynamic; readonly setGapGuides: Dynamic; readonly setDragPreviewItems: Dynamic; readonly canvasRootRef: Dynamic }, dragEvent?: Dynamic,
      isRelease?: Dynamic): Dynamic {
      let current: Dynamic = deps.dragSessionRef.current;
      if (
        !current ||
        dragEvent.pointerId !== current.pointerId ||
        (current.setMove && dragEvent.fromSetMove !== true)
      )
        return;
      isRelease &&
        ((deps.dragSessionRef.current = null),
        current.unlisten(),
        deps.trackGesture("frame-drag", false));
      if (!current.live) {
        if (
          Math.hypot(
            dragEvent.clientX - current.startX,
            dragEvent.clientY - current.startY,
          ) <
          (dragEvent.pointerType === "touch"
            ? 10
            : canvasDragThresholdPixels)
        ) {
          isRelease &&
            (current.click &&
              deps.onSelectObjects(
                boardSelectionItems(current.ref),
                current.click === "toggle" ? "toggle" : "replace",
              ),
            current.focus &&
              "file" in current.ref &&
              deps.onFocus(current.ref.file));
          return;
        }
        if (!deps.canEditCanvas) return;
        current.live = true;
      }
      current.last = {
        clientX: dragEvent.clientX,
        clientY: dragEvent.clientY,
        metaKey: dragEvent.metaKey,
        ctrlKey: dragEvent.ctrlKey,
        pointerType: dragEvent.pointerType,
      };
      let isCopying: Dynamic = dragEvent.altKey && deps.onDuplicateObjects != null;
      isCopying !== current.alt &&
        (isCopying ? deps.applyDragPositions(current.set, current.notes) : deps.setDragPreviewItems(null),
        (current.alt = isCopying));
      let { scale: zoomScale }: Dynamic = deps.camera.get(),
        {
          dx: deltaX,
          dy: deltaY,
          guides: snapGuideLines,
          gaps: snapGaps,
        }: Dynamic = snapCanvasDrag(
          (dragEvent.clientX - current.startX) / zoomScale,
          (dragEvent.clientY - current.startY) / zoomScale,
          current.snap
            ? {
                box: current.snap.box,
                lines: isCopying
                  ? current.snap.copyLines
                  : current.snap.moveLines,
                boxes: isCopying
                  ? current.snap.copyStill
                  : current.snap.moveStill,
              }
            : null,
          canvasTouchDragThresholdPixels / zoomScale,
          dragEvent.metaKey || dragEvent.ctrlKey,
        );
      deps.setSnapGuides(isRelease || snapGuideLines.length === 0 ? null : snapGuideLines);
      deps.setGapGuides(isRelease || snapGaps.length === 0 ? null : snapGaps);
      let movedPosition: Dynamic = (item?: Dynamic): Dynamic => ({
          x: Math.round(item.x + deltaX),
          y: Math.round(item.y + deltaY),
        }),
        movedOrigin: Dynamic = movedPosition({
          x: current.origX,
          y: current.origY,
        }),
        hasMoved: Dynamic = !(
          movedOrigin.x === Math.round(current.origX) &&
          movedOrigin.y === Math.round(current.origY)
        );
      if (current.alt) {
        current.hoverKey &&
          deps.onObjectHover?.({
            key: current.hoverKey,
            target: null,
            point: {
              x: 0,
              y: 0,
            },
            object: current.set[0]
              ? {
                  file: current.set[0].file,
                }
              : {
                  note: current.notes[0].id,
                },
            at: {
              x: 0,
              y: 0,
              w: 0,
              h: 0,
            },
            ctrl: false,
          });
        if (!isRelease) {
          deps.setDragPreviewItems([
            ...current.set.map(
              (item?: Dynamic): Dynamic => ({
                ...movedPosition(item),
                w: item.w,
                h: item.h,
              }),
            ),
            ...current.notes.map((item?: Dynamic): Dynamic => {
              let noteBounds: Dynamic = rotatedAnnotationBounds(
                item,
                deps.getAnnotationBox(item),
              );
              return {
                ...noteBounds,
                ...movedPosition(noteBounds),
              };
            }),
          ]);
          return;
        }
        deps.setDragPreviewItems(null);
        hasMoved
          ? deps.onDuplicateObjects?.(
              current.set.map(
                (item?: Dynamic): Dynamic => ({
                  file: item.file,
                  ...movedPosition(item),
                }),
              ),
              current.notes.map(
                (item?: Dynamic): Dynamic => ({
                  id: item.id,
                  ...movedPosition(item),
                }),
              ),
              current.bound,
              current.setMove != null,
            )
          : current.setMove != null &&
            current.bound !== undefined &&
            deps.onDuplicateObjects?.([], [], current.bound, true);
        return;
      }
      if (isRelease && !hasMoved) {
        deps.applyDragPositions(current.set, current.notes);
        current.hoverKey &&
          deps.onObjectHover?.({
            key: current.hoverKey,
            target: null,
            point: {
              x: 0,
              y: 0,
            },
            object: current.set[0]
              ? {
                  file: current.set[0].file,
                }
              : {
                  note: current.notes[0].id,
                },
            at: {
              x: 0,
              y: 0,
              w: 0,
              h: 0,
            },
            ctrl: false,
          });
        return;
      }
      if (
        !current.alt &&
        !current.setMove &&
        (deps.onDropObjectInto || deps.onObjectHover) &&
        current.set.length + current.notes.length === 1
      ) {
        let dragObject: Dynamic = current.set[0]
            ? {
                file: current.set[0].file,
              }
            : {
                note: current.notes[0].id,
              },
          isFramelessOrNote: Dynamic =
            "note" in dragObject ||
            deps.manifest.artboards.find(
              (item?: Dynamic): Dynamic => item.file === dragObject.file,
            )?.frameless === true,
          surfaceRect: Dynamic = deps.canvasRootRef.current?.getBoundingClientRect(),
          pointerPoint: Dynamic =
            isFramelessOrNote && surfaceRect
              ? deps.clientToCanvasPoint(dragEvent.clientX, dragEvent.clientY, surfaceRect)
              : null;
        if (pointerPoint) {
          let containsPoint: Dynamic = (
            rect?: Dynamic,
            point?: Dynamic,
          ): Dynamic =>
            point.x >= rect.x &&
            point.x <= rect.x + rect.w &&
            point.y >= rect.y &&
            point.y <= rect.y + rect.h;
          current.left ??= new Set();
          for (let artboardItem of deps.manifest.artboards as Dynamic)
            !artboardItem.frameless &&
              !containsPoint(artboardItem, pointerPoint) &&
              current.left.add(artboardItem.file);
          let dropCandidate: Dynamic =
              [...deps.manifest.artboards]
                .reverse()
                .find(
                  (item?: Dynamic): Dynamic =>
                    !item.frameless &&
                    item.file !==
                      ("file" in dragObject ? dragObject.file : "") &&
                    containsPoint(item, pointerPoint),
                ) ?? null,
            dropTarget: Dynamic =
              dropCandidate && current.left.has(dropCandidate.file) ? dropCandidate : null,
            objectBox: Dynamic = current.set[0]
              ? {
                  ...movedPosition(current.set[0]),
                  w: current.set[0].w,
                  h: current.set[0].h,
                }
              : ((): Dynamic => {
                  let draggedNote: Dynamic = current.notes[0],
                    draggedNoteBox: Dynamic = deps.getAnnotationBox(draggedNote);
                  return {
                    ...movedPosition(draggedNoteBox),
                    w: draggedNoteBox.w,
                    h: draggedNoteBox.h,
                  };
                })();
          current.hoverKey ??= "obj-" + String(++canvasDragSequence);
          if (!isRelease)
            deps.onObjectHover?.({
              key: current.hoverKey,
              target: dropTarget?.file ?? null,
              point: pointerPoint,
              object: dragObject,
              at: objectBox,
              ctrl: dragEvent.ctrlKey,
            });
          else if (dropTarget && deps.onDropObjectInto) {
            deps.applyDragPositions(current.set, current.notes);
            if (
              deps.onDropObjectInto({
                key: current.hoverKey,
                target: dropTarget.file,
                point: pointerPoint,
                object: dragObject,
                at: objectBox,
                ctrl: dragEvent.ctrlKey,
              })
            )
              return;
            deps.onObjectHover?.({
              key: current.hoverKey,
              target: null,
              point: pointerPoint,
              object: dragObject,
              at: objectBox,
              ctrl: dragEvent.ctrlKey,
            });
          } else
            deps.onObjectHover?.({
              key: current.hoverKey,
              target: null,
              point: pointerPoint,
              object: dragObject,
              at: objectBox,
              ctrl: dragEvent.ctrlKey,
            });
        }
      }
      let artboardPositions: Dynamic = new Map(
          current.set.map(
            (item?: Dynamic): Dynamic => [
              item.file,
              preserveUnroundedDragPosition(
                item,
                movedPosition(item),
              ),
            ],
          ),
        ),
        notePositions: Dynamic = new Map(
          current.notes.map(
            (item?: Dynamic): Dynamic => [
              item.id,
              preserveUnroundedDragPosition(
                item,
                movedPosition(item),
              ),
            ],
          ),
        );
      deps.onManifestChange(
        deps.manifestWithDragPositions(artboardPositions, notePositions),
        isRelease,
        isRelease
          ? {
              moved: new Map(
                current.set.map(
                  (item?: Dynamic): Dynamic => [
                    item.file,
                    {
                      x: item.x,
                      y: item.y,
                    },
                  ],
                ),
              ),
              movedNotes: new Map(
                current.notes.map(
                  (item?: Dynamic): Dynamic => [item.id, item],
                ),
              ),
              ...(current.bound !== undefined
                ? {
                    bound: current.bound,
                  }
                : {}),
            }
          : undefined,
      );
    }
