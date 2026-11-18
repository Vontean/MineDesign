import { designPageId } from "../../platform/file-content";
import { isCanvasPageMatch } from "../page-operations";
import { recallCanvasView } from "../viewport-memory";
import { type Dynamic } from "../../runtime-types";
import { artboardIsNotExpandedFill, defaultCanvasCamera } from "../design-canvas";

/** 在评论面板点击某条评论时运行（onRevealComment）：切换到评论所在页面并定位到对应画板或画布说明。 */
export function revealCommentTarget(deps: { readonly editing: Dynamic; readonly readOnly: Dynamic; readonly value105: Dynamic; readonly value273: Dynamic; readonly value291: Dynamic; readonly value297: Dynamic; readonly value298: Dynamic; readonly value345: Dynamic; readonly value346: Dynamic; readonly value348: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic; readonly value99: Dynamic }, source?: Dynamic): Dynamic {
                      let canvasState: Dynamic = deps.value73.current,
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
                        deps.value99 &&
                        targetArtboard &&
                        source.kind === "artboard" &&
                        !source.boards
                      ) {
                        let isPageChange: Dynamic = targetPageId !== deps.value80.current;
                        isPageChange &&
                          (deps.value298(targetPageId, targetArtboard.file),
                          (deps.value291.current = false));
                        let previousCamera: Dynamic = isPageChange
                            ? (recallCanvasView(targetPageId) ??
                              defaultCanvasCamera)
                            : deps.value105.get(),
                          state: Dynamic = {
                            file: targetArtboard.file,
                            fit: artboardIsNotExpandedFill(targetArtboard),
                          };
                        state.file !== deps.value346.current &&
                          deps.value348(
                            (previousFocus?: Dynamic): Dynamic => ({
                              ...state,
                              prev: previousFocus?.prev ?? previousCamera,
                            }),
                          );
                        return true;
                      }
                      deps.value345.current && deps.value297.current();
                      let fileToFocus: Dynamic =
                        targetFile != null && (deps.editing || deps.readOnly)
                          ? targetFile
                          : undefined;
                      targetPageId !== deps.value80.current
                        ? (deps.value298(targetPageId, fileToFocus),
                          (deps.value291.current = false))
                        : fileToFocus !== undefined && deps.value273(fileToFocus);
                      return true;
                    }
