import { designPageId } from "../../platform/file-content";
import { isCanvasPageMatch } from "../page-operations";
import { recallCanvasView } from "../viewport-memory";
import { type Dynamic } from "../../runtime-types";
import { artboardIsNotExpandedFill, defaultCanvasCamera } from "../design-canvas";

/** 在评论面板点击某条评论时运行（onRevealComment）：切换到评论所在页面并定位到对应画板或画布说明。 */
export function revealCommentTarget(deps: { readonly editing: Dynamic; readonly readOnly: Dynamic; readonly value105: Dynamic; readonly value273: Dynamic; readonly value291: Dynamic; readonly value297: Dynamic; readonly value298: Dynamic; readonly value345: Dynamic; readonly value346: Dynamic; readonly value348: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic; readonly value99: Dynamic }, source?: Dynamic): Dynamic {
                      let current4: Dynamic = deps.value73.current,
                        value653: Dynamic = null,
                        value654: Dynamic = null,
                        value655: Dynamic;
                      if (source.kind === "artboard") {
                        value655 = current4.artboards.find(
                          (input?: Dynamic): Dynamic =>
                            source.match(input.file),
                        );
                        value655 &&
                          ([value653, value654] = [
                            designPageId(
                              value655,
                              current4.pages,
                            ),
                            value655.file,
                          ]);
                      } else if (source.kind === "note") {
                        let value657: Dynamic = (
                          current4.annotations ?? []
                        ).find(
                          (input?: Dynamic): Dynamic =>
                            source.match(input.id),
                        );
                        value657 &&
                          (value653 = designPageId(
                            value657,
                            current4.pages,
                          ));
                      } else {
                        let items: Dynamic = [
                          current4.pages?.[0]?.id ?? "",
                          ...(current4.pages ?? []).map(
                            (input?: Dynamic): Dynamic => input.id,
                          ),
                        ];
                        value653 =
                          items.find(
                            (input?: Dynamic): Dynamic =>
                              isCanvasPageMatch(
                                source.match,
                                input,
                                items[0],
                              ),
                          ) ?? null;
                      }
                      if (value653 == null) return false;
                      if (
                        deps.value99 &&
                        value655 &&
                        source.kind === "artboard" &&
                        !source.boards
                      ) {
                        let value657: Dynamic = value653 !== deps.value80.current;
                        value657 &&
                          (deps.value298(value653, value655.file),
                          (deps.value291.current = false));
                        let value658: Dynamic = value657
                            ? (recallCanvasView(value653) ??
                              defaultCanvasCamera)
                            : deps.value105.get(),
                          state: Dynamic = {
                            file: value655.file,
                            fit: artboardIsNotExpandedFill(value655),
                          };
                        state.file !== deps.value346.current &&
                          deps.value348(
                            (input?: Dynamic): Dynamic => ({
                              ...state,
                              prev: input?.prev ?? value658,
                            }),
                          );
                        return true;
                      }
                      deps.value345.current && deps.value297.current();
                      let value656: Dynamic =
                        value654 != null && (deps.editing || deps.readOnly)
                          ? value654
                          : undefined;
                      value653 !== deps.value80.current
                        ? (deps.value298(value653, value656),
                          (deps.value291.current = false))
                        : value656 !== undefined && deps.value273(value656);
                      return true;
                    }
