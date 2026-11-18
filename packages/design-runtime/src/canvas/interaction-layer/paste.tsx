import { clampPointToRect } from "../paste-placement";
import { insertionPointerMatchesContent } from "../paste-placement";
import { type Dynamic } from "../../runtime-types";
import { visibleArtboardCenter } from "../paste-placement";

/** 粘贴或放置内容需要落点时运行：根据最近一次指针位置找到其下的画板，排除界面装饰和无效区域，返回夹在画板范围内的画布坐标，指针在画布空白处时返回不带画板的坐标。 */
export function resolvePointerInsertionPoint(deps: { readonly callback11: Dynamic; readonly callback16: Dynamic; readonly value146: Dynamic; readonly value148: Dynamic; readonly value182: Dynamic; readonly value183: Dynamic; readonly value55: Dynamic; readonly value56: Dynamic; readonly value9: Dynamic; readonly value96: Dynamic }, pointerEvent?: Dynamic): Dynamic {
        let current: Dynamic = deps.value148.current,
          canvasElement: Dynamic = deps.value9.current;
        if (
          !current ||
          current.inFrame ||
          !canvasElement ||
          deps.value55.current != null ||
          deps.value96.current ||
          deps.callback11()
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
          artboardFile !== deps.value183.current &&
          deps.value146.current.artboards.some(
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
              deps.value182.current,
              deps.value56.current,
            ))
        )
          return null;
        let canvasPoint: Dynamic = deps.callback16(
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
        let artboard: Dynamic = deps.value146.current.artboards.find(
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
export function placePastedImagesOnCanvas(deps: { readonly camera: Dynamic; readonly onImageDrop: Dynamic; readonly value146: Dynamic; readonly value177: Dynamic; readonly value55: Dynamic; readonly value57: Dynamic; readonly value9: Dynamic }, targetFile?: Dynamic, imagePayload?: Dynamic, pasteContext?: Dynamic): Dynamic {
        if (!deps.onImageDrop) return false;
        let pointerInsertion: Dynamic = navigator.userActivation?.isActive
          ? deps.value177()
          : null;
        if (pointerInsertion) {
          let current: Dynamic = deps.value57.current,
            singleSelectedBoard: Dynamic =
              pointerInsertion.file == null &&
              current.notes.size === 0 &&
              current.files.size === 1
                ? deps.value146.current.artboards.find(
                    (board?: Dynamic): Dynamic =>
                      current.files.has(board.file) && !board.frameless,
                  )
                : undefined;
          if (singleSelectedBoard) {
            let canvasRect: Dynamic = deps.value9.current?.getBoundingClientRect(),
              boardCenter: Dynamic = visibleArtboardCenter(
                singleSelectedBoard,
                deps.value55.current == null && canvasRect
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
        let targetBoard: Dynamic = deps.value146.current.artboards.find(
          (board?: Dynamic): Dynamic => board.file === targetFile,
        );
        if (!targetBoard) return false;
        let canvasRectForTarget: Dynamic = deps.value9.current?.getBoundingClientRect(),
          targetCenter: Dynamic = visibleArtboardCenter(
            targetBoard,
            deps.value55.current == null && canvasRectForTarget
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
