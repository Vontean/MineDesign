import { commentAnchorShortLabel } from "../../comments/labels";
import { commentArtboardElementDetail } from "../../comments/labels";
import { commentPointWithinVisibleContent } from "../chrome";
import { createPreviewHandle } from "../../preview/evaluation";
import { describeCommentElement } from "../../comments/labels";
import { pickerCommentFor } from "../../editor/picker/bridge";
import { serializeDesignCommentAnchor } from "../../comments/anchor-codec";
import { type Dynamic } from "../../runtime-types";

/** 在选中元素的快捷操作中点击评论时运行：向画板查询该元素的评论锚点与描述，换算到屏幕位置后打开评论输入框。 */
export function composeSelectedElementComment(deps: { readonly clientToCanvasPoint: Dynamic; readonly camera: Dynamic; readonly elementSelection: Dynamic; readonly manifest: Dynamic; readonly artboardHandlesRef: Dynamic; readonly focusedContentRect: Dynamic; readonly commentsController: Dynamic; readonly canvasRootRef: Dynamic }, triggerElement?: Dynamic): Dynamic {
            let selection: Dynamic = deps.elementSelection,
              file: Dynamic = selection.file,
              artboardEntry: Dynamic = deps.artboardHandlesRef.current.get(file),
              previewHandle: Dynamic = artboardEntry
                ? createPreviewHandle(artboardEntry.previewFrameRef.current)
                : null,
              current: Dynamic = deps.canvasRootRef.current;
            if (!previewHandle || !current) return;
            triggerElement.focus({
              preventScroll: true,
            });
            let bounds: Dynamic = triggerElement.getBoundingClientRect(),
              anchorPoint: Dynamic = deps.clientToCanvasPoint(
                bounds.left + bounds.width / 2,
                bounds.bottom,
                current.getBoundingClientRect(),
              );
            pickerCommentFor(
              previewHandle,
              selection.tids[0],
              selection.name ?? null,
            ).then((pickedElement?: Dynamic): Dynamic => {
              let artboard: Dynamic = deps.manifest.artboards.find(
                (board?: Dynamic): Dynamic => board.file === file,
              );
              if (!pickedElement || !artboard) return;
              let targetBoard: Dynamic =
                  deps.focusedContentRect?.file === file ? deps.focusedContentRect : artboard,
                elementRect: Dynamic =
                  pickedElement.path == null
                    ? {
                        x: 0,
                        y: 0,
                        w: targetBoard.w,
                        h: targetBoard.h,
                      }
                    : pickedElement.rect,
                { px: pointX, py: pointY }: Dynamic = commentPointWithinVisibleContent(
                  anchorPoint,
                  targetBoard,
                  elementRect,
                ),
                fractionX: Dynamic =
                  (pointX - elementRect.x) / (elementRect.w || 1),
                fractionY: Dynamic =
                  (pointY - elementRect.y) / (elementRect.h || 1),
                serializedAnchor: Dynamic = serializeDesignCommentAnchor(
                  pickedElement.path != null
                    ? {
                        kind: "el",
                        file: file,
                        path: pickedElement.path,
                        tid: pickedElement.tid,
                        fp: pickedElement.fp,
                        fx: fractionX,
                        fy: fractionY,
                      }
                    : pickedElement.page
                      ? {
                          kind: "artboard",
                          file: file,
                          px: pointX - pickedElement.page.x,
                          py: pointY - pickedElement.page.y,
                        }
                      : {
                          kind: "artboard",
                          file: file,
                          fx: fractionX,
                          fy: fractionY,
                        },
                );
              if (!serializedAnchor) return;
              let elementDescription: Dynamic =
                  pickedElement.path == null
                    ? null
                    : describeCommentElement(artboardEntry, pickedElement),
                anchorLabel: Dynamic = commentAnchorShortLabel(
                  elementDescription == null
                    ? {
                        kind: "artboard",
                        board: artboard,
                      }
                    : {
                        kind: "el",
                        board: artboard,
                        el: elementDescription,
                      },
                ),
                viewEntry: Dynamic =
                  pickedElement.path != null && pickedElement.tid != null
                    ? artboardEntry?.viewEntries([pickedElement.tid])[0]
                    : undefined,
                elementDetail: Dynamic = commentArtboardElementDetail(
                  artboard,
                  viewEntry && elementDescription
                    ? {
                        path: viewEntry.path,
                        kind: elementDescription.kind ?? viewEntry.kind,
                        text: elementDescription.text ?? viewEntry.words(),
                      }
                    : null,
                ),
                canvasBounds: Dynamic = current.getBoundingClientRect(),
                cameraState: Dynamic = deps.camera.get();
              deps.commentsController
                .compose(
                  serializedAnchor,
                  {
                    x:
                      canvasBounds.left +
                      (targetBoard.x + pointX - cameraState.x) * cameraState.scale +
                      (window as Dynamic).scrollX,
                    y:
                      canvasBounds.top +
                      (targetBoard.y + pointY - cameraState.y) * cameraState.scale +
                      (window as Dynamic).scrollY,
                  },
                  {
                    label: anchorLabel,
                    detail: elementDetail,
                  },
                )
                .catch((): Dynamic => {});
            });
          }
