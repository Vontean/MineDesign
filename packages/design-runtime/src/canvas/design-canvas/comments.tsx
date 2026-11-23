import { designPageId } from "../../platform/file-content";
import { isCanvasPageMatch } from "../page-operations";
import { recallCanvasView } from "../viewport-memory";
import { type Dynamic } from "../../runtime-types";
import { artboardIsNotExpandedFill, defaultCanvasCamera } from "./playback";

/** 在评论面板点击某条评论时运行（onRevealComment）：切换到评论所在页面并定位到对应画板或画布说明。 */
interface RevealCommentContext {
  readonly view: {
    readonly editing: Dynamic;
    readonly readOnly: Dynamic;
    readonly camera: Dynamic;
    readonly needsPageFit: Dynamic;
    readonly restoreCamera: Dynamic;
    readonly fullscreenActive: Dynamic;
    readonly fullscreenFile: Dynamic;
    readonly setFullscreenView: Dynamic;
    readonly phoneCanvas: Dynamic;
  };
  readonly navigation: {
    readonly focusArtboard: Dynamic;
    readonly resolvePageArtboard: Dynamic;
  };
  readonly document: {
    readonly manifest: Dynamic;
    readonly activePage: Dynamic;
  };
}

export function revealCommentTarget(deps: RevealCommentContext, source?: Dynamic): Dynamic {
                      let canvasState: Dynamic = deps.document.manifest.current,
                        targetPageId: Dynamic = null,
                        targetFile: Dynamic = null,
                        targetArtboard: Dynamic;
                      if (source.kind === "artboard") {
                        targetArtboard = canvasState.artboards.find(
                          (artboard?: Dynamic): Dynamic =>
                            source.match(artboard.file),
                        );
                        targetArtboard &&
                          ([targetPageId, targetFile] = [
                            designPageId(
                              targetArtboard,
                              canvasState.pages,
                            ),
                            targetArtboard.file,
                          ]);
                      } else if (source.kind === "note") {
                        let targetNote: Dynamic = (
                          canvasState.annotations ?? []
                        ).find(
                          (note?: Dynamic): Dynamic =>
                            source.match(note.id),
                        );
                        targetNote &&
                          (targetPageId = designPageId(
                            targetNote,
                            canvasState.pages,
                          ));
                      } else {
                        let items: Dynamic = [
                          canvasState.pages?.[0]?.id ?? "",
                          ...(canvasState.pages ?? []).map(
                            (page?: Dynamic): Dynamic => page.id,
                          ),
                        ];
                        targetPageId =
                          items.find(
                            (pageId?: Dynamic): Dynamic =>
                              isCanvasPageMatch(
                                source.match,
                                pageId,
                                items[0],
                              ),
                          ) ?? null;
                      }
                      if (targetPageId == null) return false;
                      if (
                        deps.view.phoneCanvas &&
                        targetArtboard &&
                        source.kind === "artboard" &&
                        !source.boards
                      ) {
                        let isPageChange: Dynamic = targetPageId !== deps.document.activePage.current;
                        isPageChange &&
                          (deps.navigation.resolvePageArtboard(targetPageId, targetArtboard.file),
                          (deps.view.needsPageFit.current = false));
                        let previousCamera: Dynamic = isPageChange
                            ? (recallCanvasView(targetPageId) ??
                              defaultCanvasCamera)
                            : deps.view.camera.get(),
                          state: Dynamic = {
                            file: targetArtboard.file,
                            fit: artboardIsNotExpandedFill(targetArtboard),
                          };
                        state.file !== deps.view.fullscreenFile.current &&
                          deps.view.setFullscreenView(
                            (previousFocus?: Dynamic): Dynamic => ({
                              ...state,
                              prev: previousFocus?.prev ?? previousCamera,
                            }),
                          );
                        return true;
                      }
                      deps.view.fullscreenActive.current && deps.view.restoreCamera.current();
                      let fileToFocus: Dynamic =
                        targetFile != null && (deps.view.editing || deps.view.readOnly)
                          ? targetFile
                          : undefined;
                      targetPageId !== deps.document.activePage.current
                        ? (deps.navigation.resolvePageArtboard(targetPageId, fileToFocus),
                          (deps.view.needsPageFit.current = false))
                        : fileToFocus !== undefined && deps.navigation.focusArtboard(fileToFocus);
                      return true;
                    }
