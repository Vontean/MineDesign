import { canvasSnapReferenceObjects } from "../../geometry/canvas-snapping";
import { focusCanvasDocument } from "../focus";
import { hasBoardSelection } from "../../editor/selection/canvas-selection";
import { rectangleSnapGuides } from "../../editor/geometry/snapping";
import { rotatedAnnotationBounds } from "../../platform/file-content";
import { type Dynamic } from "../../runtime-types";
import { unionRects } from "../../editor/geometry/resize";

/** 宿主正在拖入文件时（streamDragFile 存在）运行的 effect：监听全局指针事件，把鼠标在画布上的坐标以 move、up、cancel、stale 回报给宿主拖放。 */
export function subscribeHostDragPointer(deps: { readonly callback16: Dynamic; readonly streamDragFile: Dynamic; readonly value9: Dynamic; readonly value94: Dynamic }): Dynamic {
    if (deps.streamDragFile == null) return;
    let toCanvasPoint: Dynamic = (event?: Dynamic): Dynamic => {
        let canvasRect: Dynamic = deps.value9.current?.getBoundingClientRect();
        return canvasRect
          ? deps.callback16(event.clientX, event.clientY, canvasRect)
          : null;
      },
      reportCancel: Dynamic = (): Dynamic =>
        deps.value94.current?.("cancel", 0, 0, false),
      handlePointerDown: Dynamic = (downEvent?: Dynamic): Dynamic => {
        downEvent.pointerType === "mouse" &&
          deps.value94.current?.("stale", 0, 0, false);
      },
      handlePointerMove: Dynamic = (moveEvent?: Dynamic): Dynamic => {
        if (moveEvent.pointerType !== "mouse") return;
        if (!(moveEvent.buttons & 1)) {
          reportCancel();
          return;
        }
        let canvasPoint: Dynamic = toCanvasPoint(moveEvent);
        canvasPoint &&
          deps.value94.current?.(
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
            !!deps.value9.current &&
            upEvent.target instanceof Node &&
            deps.value9.current.contains(upEvent.target);
        point && isInsideCanvas
          ? deps.value94.current?.(
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
export function beginBoardDrag(deps: { readonly callback30: Dynamic; readonly callback47: Dynamic; readonly manifest: Dynamic; readonly onDuplicateObjects: Dynamic; readonly value134: Dynamic; readonly value216: Dynamic; readonly value218: Dynamic; readonly value219: Dynamic; readonly value67: Dynamic }, pointerEvent?: Dynamic,
      dragTarget?: Dynamic,
      fallbackBox?: Dynamic,
      selection?: Dynamic,
      onClick?: Dynamic,
      shouldFocus: Dynamic = false): Dynamic {
      if (pointerEvent.button !== 0) return;
      let previousDrag: Dynamic = deps.value67.current;
      previousDrag && deps.callback47(previousDrag.pointerId);
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
      deps.value134("frame-drag", true);
      deps.callback30("frame-drag");
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
                deps.value216.current(note),
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
                deps.value216.current(displayedNote),
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
          let activeDrag: Dynamic = deps.value67.current;
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
              deps.value218.current(pointerId);
              return;
            }
            keyEvent.key === "Alt" &&
              !keyEvent.repeat &&
              activeDrag.last &&
              deps.value219.current(
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
              deps.value219.current(
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
        cancelDrag: Dynamic = (): Dynamic => deps.value218.current(pointerId);
      (window as Dynamic).addEventListener("keydown", handleKey, true);
      (window as Dynamic).addEventListener("keyup", handleKey, true);
      (window as Dynamic).addEventListener("blur", cancelDrag);
      deps.value67.current = {
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
export function beginHandedOffBoardDrag(deps: { readonly value146: Dynamic; readonly value218: Dynamic; readonly value67: Dynamic }, moveCallback?: Dynamic,
      pointerId?: Dynamic,
      dragTarget?: Dynamic,
      selection?: Dynamic,
      startX?: Dynamic,
      startY?: Dynamic): Dynamic {
      let previousDrag: Dynamic = deps.value67.current;
      previousDrag && deps.value218.current(previousDrag.pointerId);
      let manifest: Dynamic = deps.value146.current,
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
      deps.value67.current = {
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
