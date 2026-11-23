import { clampPointToRect } from "../paste-placement";
import { insertionPointerMatchesContent } from "../paste-placement";
import { type Dynamic } from "../../runtime-types";
import { visibleArtboardCenter } from "../paste-placement";

/** 粘贴或放置内容需要落点时运行：根据最近一次指针位置找到其下的画板，排除界面装饰和无效区域，返回夹在画板范围内的画布坐标，指针在画布空白处时返回不带画板的坐标。 */
export function resolvePointerInsertionPoint(deps: { readonly isHandToolActive: Dynamic; readonly clientToCanvasPoint: Dynamic; readonly manifestRef: Dynamic; readonly lastPointerRef: Dynamic; readonly focusedFileRef: Dynamic; readonly enteredFileRef: Dynamic; readonly fullscreenFileRef: Dynamic; readonly playingFileRef: Dynamic; readonly canvasRootRef: Dynamic; readonly spaceHeldRef: Dynamic }, pointerEvent?: Dynamic): Dynamic {
        let current: Dynamic = deps.lastPointerRef.current,
          canvasElement: Dynamic = deps.canvasRootRef.current;
        if (
          !current ||
          current.inFrame ||
          !canvasElement ||
          deps.fullscreenFileRef.current != null ||
          deps.spaceHeldRef.current ||
          deps.isHandToolActive()
        )
          return null;
        let elementUnderPointer: Dynamic = (document as Dynamic).elementFromPoint(
          current.x,
          current.y,
        );
        if (!(elementUnderPointer instanceof Element) || !canvasElement.contains(elementUnderPointer))
          return null;
        let ancestor: Dynamic = elementUnderPointer.closest("[data-mega-artboard]"),
          artboardFile: Dynamic = ancestor?.dataset.megaArtboard ?? null;
        artboardFile != null &&
          artboardFile !== deps.enteredFileRef.current &&
          deps.manifestRef.current.artboards.some(
            (board?: Dynamic): Dynamic =>
              board.file === artboardFile && board.frameless,
          ) &&
          (artboardFile = null);
        let isOverAnnotation: Dynamic =
          ancestor == null &&
          elementUnderPointer.closest(
            '[data-mega-chrome="annotation"], [data-mega-chrome="picture-pending"]',
          ) != null;
        if (
          (ancestor == null &&
            !isOverAnnotation &&
            elementUnderPointer.closest("[data-mega-chrome]") != null &&
            elementUnderPointer.getAttribute("data-mega-chrome") !== "set-box-pad") ||
          (artboardFile != null &&
            insertionPointerMatchesContent(
              pointerEvent,
              artboardFile,
              deps.focusedFileRef.current,
              deps.playingFileRef.current,
            ))
        )
          return null;
        let canvasPoint: Dynamic = deps.clientToCanvasPoint(
          current.x,
          current.y,
          canvasElement.getBoundingClientRect(),
        );
        if (artboardFile == null)
          return isOverAnnotation
            ? {
                x: canvasPoint.x,
                y: canvasPoint.y,
                file: null,
                overAnnotation: isOverAnnotation,
              }
            : {
                x: canvasPoint.x,
                y: canvasPoint.y,
                file: null,
              };
        let artboard: Dynamic = deps.manifestRef.current.artboards.find(
          (board?: Dynamic): Dynamic => board.file === artboardFile,
        );
        return artboard
          ? {
              ...clampPointToRect(canvasPoint, artboard),
              file: artboardFile,
            }
          : null;
      }

/** 粘贴图片时运行：优先放在当前指针落点，只选中一块画板时放到该画板可见区域中心，否则放到目标画板中心，并交给图片放置回调。 */
export function placePastedImagesOnCanvas(deps: { readonly camera: Dynamic; readonly onImageDrop: Dynamic; readonly manifestRef: Dynamic; readonly getPastePoint: Dynamic; readonly fullscreenFileRef: Dynamic; readonly selectionRef: Dynamic; readonly canvasRootRef: Dynamic }, targetFile?: Dynamic, imagePayload?: Dynamic, pasteContext?: Dynamic): Dynamic {
        if (!deps.onImageDrop) return false;
        let pointerInsertion: Dynamic = navigator.userActivation?.isActive
          ? deps.getPastePoint()
          : null;
        if (pointerInsertion) {
          let current: Dynamic = deps.selectionRef.current,
            singleSelectedBoard: Dynamic =
              pointerInsertion.file == null &&
              current.notes.size === 0 &&
              current.files.size === 1
                ? deps.manifestRef.current.artboards.find(
                    (board?: Dynamic): Dynamic =>
                      current.files.has(board.file) && !board.frameless,
                  )
                : undefined;
          if (singleSelectedBoard) {
            let canvasRect: Dynamic = deps.canvasRootRef.current?.getBoundingClientRect(),
              boardCenter: Dynamic = visibleArtboardCenter(
                singleSelectedBoard,
                deps.fullscreenFileRef.current == null && canvasRect
                  ? {
                      ...deps.camera.get(),
                      width: canvasRect.width,
                      height: canvasRect.height,
                    }
                  : null,
              );
            deps.onImageDrop(
              imagePayload,
              boardCenter.x,
              boardCenter.y,
              "pasted",
              singleSelectedBoard.file,
            );
          } else
            deps.onImageDrop(
              imagePayload,
              pointerInsertion.x,
              pointerInsertion.y,
              "pasted",
              pointerInsertion.file ?? undefined,
            );
          return true;
        }
        if (pasteContext.selection) return false;
        let targetBoard: Dynamic = deps.manifestRef.current.artboards.find(
          (board?: Dynamic): Dynamic => board.file === targetFile,
        );
        if (!targetBoard) return false;
        let canvasRectForTarget: Dynamic = deps.canvasRootRef.current?.getBoundingClientRect(),
          targetCenter: Dynamic = visibleArtboardCenter(
            targetBoard,
            deps.fullscreenFileRef.current == null && canvasRectForTarget
              ? {
                  ...deps.camera.get(),
                  width: canvasRectForTarget.width,
                  height: canvasRectForTarget.height,
                }
              : null,
          );
        deps.onImageDrop(
          imagePayload,
          targetCenter.x,
          targetCenter.y,
          "pasted",
          targetBoard.file,
        );
        return true;
      }
