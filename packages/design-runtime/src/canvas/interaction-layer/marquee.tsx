import { SelectionActionsReplace } from "../../editor/selection/actions";
import { applyElementRectStyle } from "../hit-testing";
import { canvasDragThresholdPixels } from "../interaction-geometry";
import { emptyBoardSelection } from "../../editor/selection/canvas-selection";
import { inclusiveRectIntersects } from "../hit-testing";
import { objectsWithinCanvasMarquee } from "../hit-testing";
import { type Dynamic } from "../../runtime-types";

/** 在画布或画板内开始框选时运行：捕获指针，拖动中计算与框相交的画板、便签和画板内元素并实时更新选中，松手或按 Esc 时结束；移动不足阈值视为单击。 */
export function beginCanvasMarquee(deps: { readonly clientToCanvasPoint: Dynamic; readonly trackGesture: Dynamic; readonly manifestRef: Dynamic; readonly canEditCanvasRef: Dynamic; readonly artboardHandlesRef: Dynamic; readonly annotationBoxRef: Dynamic; readonly cameraRef: Dynamic; readonly selectionRef: Dynamic; readonly onSelectObjectsRef: Dynamic; readonly setIsMarqueeActive: Dynamic; readonly marqueeRectRef: Dynamic; readonly marqueeElementRef: Dynamic; readonly canvasRootRef: Dynamic; readonly marqueeStateRef: Dynamic; readonly onMarqueeBeginRef: Dynamic }, pointerEvent?: Dynamic,
      marqueeOptions?: Dynamic): Dynamic {
      let canvasElement: Dynamic = deps.canvasRootRef.current;
      if (!canvasElement) return;
      let {
          pointerId: pointerId,
          clientX: startClientX,
          clientY: startClientY,
        }: Dynamic = pointerEvent,
        startPoint: Dynamic = deps.clientToCanvasPoint(
          startClientX,
          startClientY,
          canvasElement.getBoundingClientRect(),
        ),
        treeSweeper: Dynamic =
          marqueeOptions.tree !== undefined
            ? marqueeOptions.tree
            : (deps.onMarqueeBeginRef.current?.(marqueeOptions.toggle) ?? null),
        initialSelection: Dynamic = deps.selectionRef.current,
        baseSelection: Dynamic = marqueeOptions.toggle
          ? initialSelection
          : emptyBoardSelection;
      try {
        marqueeOptions.capture.hasPointerCapture(pointerId) ||
          marqueeOptions.capture.setPointerCapture(pointerId);
      } catch {}
      deps.trackGesture("marquee", true);
      let lastSelectionKey: Dynamic = null,
        currentClientX: Dynamic = startClientX,
        currentClientY: Dynamic = startClientY,
        currentBox: Dynamic = null,
        releasedAt: Dynamic = 0,
        isCancelled: Dynamic = false,
        pickedTidsByFile: Dynamic = new Map(),
        pendingPickFiles: Dynamic = new Set(),
        queuedRectByFile: Dynamic = new Map(),
        lastRectKeyByFile: Dynamic = new Map(),
        failedPickFiles: Dynamic = new Set(),
        requestElementPick: Dynamic = (
          file?: Dynamic,
          localRect?: Dynamic,
        ): Dynamic => {
          let rectKey: Dynamic = [
            localRect.x0,
            localRect.y0,
            localRect.x1,
            localRect.y1,
          ]
            .map((coordinate?: Dynamic): Dynamic => Math.round(coordinate))
            .join(",");
          if (lastRectKeyByFile.get(file) === rectKey) return true;
          if (pendingPickFiles.has(file)) {
            queuedRectByFile.set(file, localRect);
            return true;
          }
          let artboardEntry: Dynamic = deps.artboardHandlesRef.current.get(file);
          return !artboardEntry || !artboardEntry.isReady()
            ? false
            : (pendingPickFiles.add(file),
              lastRectKeyByFile.set(file, rectKey),
              artboardEntry.pickIn(localRect, marqueeOptions.mode).then(
                (pickedTids?: Dynamic): Dynamic => {
                  pendingPickFiles.delete(file);
                  if (isCancelled || (releasedAt && Date.now() - releasedAt > 1500)) return;
                  pickedTids == null
                    ? failedPickFiles.add(file)
                    : pickedTidsByFile.set(file, pickedTids);
                  updateSelection();
                  let queuedRect: Dynamic = queuedRectByFile.get(file);
                  queuedRectByFile.delete(file);
                  queuedRect && requestElementPick(file, queuedRect);
                },
                (): Dynamic => {
                  pendingPickFiles.delete(file);
                  failedPickFiles.add(file);
                  !isCancelled &&
                    !(releasedAt && Date.now() - releasedAt > 1500) &&
                    updateSelection();
                },
              ),
              true);
        },
        computeMarqueeHits: Dynamic = (box?: Dynamic): Dynamic => {
          let manifest: Dynamic = deps.manifestRef.current,
            hitFiles: Dynamic = new Set(),
            hitElements: Dynamic = new Map(),
            candidateBoards: Dynamic =
              marqueeOptions.origin.kind === "canvas"
                ? manifest.artboards
                : manifest.artboards.filter(
                    (candidate?: Dynamic): Dynamic =>
                      candidate.file === marqueeOptions.origin.file,
                  );
          for (let board of candidateBoards as Dynamic) {
            if (!inclusiveRectIntersects(box, board)) {
              pickedTidsByFile.delete(board.file);
              queuedRectByFile.delete(board.file);
              lastRectKeyByFile.delete(board.file);
              continue;
            }
            let isFullyEnclosed: Dynamic =
              box.x <= board.x &&
              board.x + board.w <= box.x + box.w &&
              box.y <= board.y &&
              board.y + board.h <= box.y + box.h;
            if (
              marqueeOptions.origin.kind === "canvas" &&
              (board.frameless || (isFullyEnclosed && marqueeOptions.mode === "plain"))
            ) {
              hitFiles.add(board.file);
              pickedTidsByFile.delete(board.file);
              continue;
            }
            if (
              !(
                !failedPickFiles.has(board.file) &&
                requestElementPick(board.file, {
                  x0: Math.max(0, box.x - board.x),
                  y0: Math.max(0, box.y - board.y),
                  x1: Math.min(board.w, box.x + box.w - board.x),
                  y1: Math.min(board.h, box.y + box.h - board.y),
                })
              )
            ) {
              marqueeOptions.origin.kind === "canvas" && hitFiles.add(board.file);
              continue;
            }
            let pickedTids: Dynamic = pickedTidsByFile.get(board.file);
            pickedTids &&
              pickedTids.length > 0 &&
              hitElements.set(board.file, {
                name: SelectionActionsReplace(board.file),
                tids: pickedTids,
              });
          }
          let annotations: Dynamic =
              deps.canEditCanvasRef.current && marqueeOptions.origin.kind === "canvas"
                ? (manifest.annotations ?? [])
                : [],
            notes: Dynamic = objectsWithinCanvasMarquee(
              {
                artboards: [],
                annotations: annotations,
                annBox: deps.annotationBoxRef.current,
              },
              box,
              emptyBoardSelection,
            ).notes;
          return {
            files: hitFiles,
            notes: notes,
            elements: hitElements,
          };
        },
        updateSelection: Dynamic = (): Dynamic => {
          if (!currentBox) return;
          let hits: Dynamic = computeMarqueeHits(currentBox),
            selectionKey: Dynamic =
              [...hits.files].sort().join(`
`) +
              `

` +
              [...hits.notes].sort().join(`
`) +
              `

` +
              [...hits.elements]
                .map(
                  ([file, hit]: Dynamic): Dynamic =>
                    file +
                    "#" +
                    [...hit.tids]
                      .sort(
                        (tidA?: Dynamic, tidB?: Dynamic): Dynamic =>
                          tidA - tidB,
                      )
                      .join("."),
                )
                .sort().join(`
`);
          selectionKey !== lastSelectionKey &&
            ((lastSelectionKey = selectionKey),
            treeSweeper
              ? treeSweeper.sweep(hits)
              : deps.onSelectObjectsRef.current(
                  {
                    files: new Set([...baseSelection.files, ...hits.files]),
                    notes: new Set([...baseSelection.notes, ...hits.notes]),
                  },
                  "replace",
                ));
        },
        updateMarquee: Dynamic = (): Dynamic => {
          let currentPoint: Dynamic = deps.clientToCanvasPoint(
            currentClientX,
            currentClientY,
            canvasElement.getBoundingClientRect(),
          );
          currentBox = {
            x: Math.min(startPoint.x, currentPoint.x),
            y: Math.min(startPoint.y, currentPoint.y),
            w: Math.abs(currentPoint.x - startPoint.x),
            h: Math.abs(currentPoint.y - startPoint.y),
          };
          let cameraState: Dynamic = deps.cameraRef.current.get();
          deps.marqueeRectRef.current = {
            x: (currentBox.x - cameraState.x) * cameraState.scale,
            y: (currentBox.y - cameraState.y) * cameraState.scale,
            w: currentBox.w * cameraState.scale,
            h: currentBox.h * cameraState.scale,
          };
          applyElementRectStyle(
            deps.marqueeElementRef.current,
            deps.marqueeRectRef.current,
          );
          updateSelection();
        };
      deps.marqueeStateRef.current = (): Dynamic => {
        lastSelectionKey != null && updateMarquee();
      };
      let handlePointerMove: Dynamic = (moveEvent?: Dynamic): Dynamic => {
          if (moveEvent.pointerId === pointerId) {
            if (!(moveEvent.buttons & 1)) return endMarquee();
            if (lastSelectionKey == null) {
              if (
                Math.hypot(
                  moveEvent.clientX - startClientX,
                  moveEvent.clientY - startClientY,
                ) < canvasDragThresholdPixels
              )
                return;
              deps.setIsMarqueeActive(true);
            }
            currentClientX = moveEvent.clientX;
            currentClientY = moveEvent.clientY;
            updateMarquee();
          }
        },
        endMarquee: Dynamic = (): Dynamic => {
          releasedAt = Date.now();
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
          (window as Dynamic).removeEventListener("blur", handleBlur);
          (window as Dynamic).removeEventListener("contextmenu", endMarquee);
          deps.marqueeStateRef.current = null;
          deps.marqueeRectRef.current = null;
          deps.setIsMarqueeActive(false);
          deps.trackGesture("marquee", false);
        },
        handleBlur: Dynamic = (): Dynamic => {
          (document as Dynamic).hasFocus() || ((isCancelled = true), endMarquee());
        },
        handlePointerUp: Dynamic = (upEvent?: Dynamic): Dynamic => {
          if (upEvent.pointerId !== pointerId) return;
          let isStillClick: Dynamic = lastSelectionKey == null;
          endMarquee();
          isStillClick && marqueeOptions.onStillRelease?.();
        },
        handlePointerCancel: Dynamic = (cancelEvent?: Dynamic): Dynamic => {
          cancelEvent.pointerId === pointerId && ((isCancelled = true), endMarquee());
        },
        handleKeyDown: Dynamic = (keyEvent?: Dynamic): Dynamic => {
          keyEvent.key !== "Escape" ||
            lastSelectionKey == null ||
            (keyEvent.preventDefault(),
            keyEvent.stopPropagation(),
            (isCancelled = true),
            endMarquee(),
            treeSweeper
              ? treeSweeper.cancel()
              : deps.onSelectObjectsRef.current(initialSelection, "replace"));
        };
      (window as Dynamic).addEventListener("pointermove", handlePointerMove);
      (window as Dynamic).addEventListener("pointerup", handlePointerUp);
      (window as Dynamic).addEventListener("pointercancel", handlePointerCancel);
      (window as Dynamic).addEventListener("keydown", handleKeyDown, true);
      (window as Dynamic).addEventListener("blur", handleBlur);
      (window as Dynamic).addEventListener("contextmenu", endMarquee);
      marqueeOptions.from &&
        (deps.setIsMarqueeActive(true),
        (currentClientX = marqueeOptions.from.x),
        (currentClientY = marqueeOptions.from.y),
        updateMarquee());
    }
