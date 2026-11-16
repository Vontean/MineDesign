import { CouldnTFlipRightNowTryAgainMessage } from "../../editor/geometry/flip-elements";
import { FlippingThisWayWouldnTChangeItMessage } from "../../editor/geometry/flip-elements";
import { GeometryFlipAnnotationsLabel_2 } from "../../editor/geometry/flip-annotations";
import { GeometryFlipAnnotationsLabel_3 } from "../../editor/geometry/flip-annotations";
import { GeometryFlipAnnotationsWytKytYtConfig } from "../../editor/geometry/flip-annotations";
import { HostValue } from "../../editor/selection/canvas-selection";
import { ModelModelStateLimit } from "../../editor/model/model-state";
import { PartOfTheSelectionCouldnTBeMessage } from "../../editor/geometry/flip-annotations";
import { SelectionActionsHelmetScHelmetPattern } from "../../editor/selection/actions";
import { announce } from "../../editor/accessibility/announcer";
import { applyHostSelectionResponse } from "../../editor/selection/canvas-selection";
import { boardSelectionCount } from "../../editor/selection/canvas-selection";
import { boardSelectionItems } from "../../editor/selection/canvas-selection";
import { canNavigateSelection } from "../working-state";
import { canvasBoardSelection } from "../../editor/selection/canvas-selection";
import { emptyBoardSelection } from "../../editor/selection/canvas-selection";
import { emptyCanvasSelection } from "../../editor/selection/canvas-selection";
import { flipDirectionAnnouncement } from "../../editor/accessibility/announcements";
import { isSessionCancelMessage } from "../working-state";
import { keyboardNavigationMode } from "../keyboard-navigation";
import { moveDirectionAnnouncement } from "../../editor/accessibility/announcements";
import { partialFlipMessage } from "../../editor/geometry/flip-elements";
import { randomSessionToken } from "../working-state";
import { reorderAnnouncement } from "../../editor/accessibility/announcements";
import { sameSelectionStructure } from "../working-state";
import { selectionActionFailureMessage } from "../../editor/selection/actions";
import { selectionAfterElementEdits } from "../working-state";
import { selectionFromArtboards } from "../../editor/selection/canvas-selection";
import { selectionFromBoards } from "../../editor/selection/canvas-selection";
import { selectionNavigationScope } from "../working-state";
import { sessionAllowsMutation } from "../working-state";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { artboardRevealSettleTimeoutMs, emptyCanvasSelectionFiles } from "../design-canvas";

/** 画板预览 iframe 上报选择变化时运行（handleFrameSelection 的实现）：过滤过期令牌与取消消息，画板级点击转为画板选择，否则把元素选择合并进画布选择。 */
export function routeFrameSelectionEvent(deps: { readonly focusedFileRef: Dynamic; readonly frameSelectionTokensRef: Dynamic; readonly pendingFrameSelectionRef: Dynamic; readonly selectionEpochRef: Dynamic; readonly selectionRef: Dynamic; readonly setSelection: Dynamic; readonly setShownFrameSelectionRef: Dynamic; readonly value24: Dynamic; readonly value25: Dynamic; readonly value27: Dynamic; readonly value29: Dynamic; readonly value30: Dynamic; readonly value31: Dynamic }, input?: Dynamic, options?: Dynamic): Dynamic {
        if (input !== deps.focusedFileRef.current) return;
        input === deps.pendingFrameSelectionRef.current?.file &&
          options.tids &&
          options.tids.length > 0 &&
          (deps.pendingFrameSelectionRef.current = null);
        let value653: Dynamic =
          options.re != null && options.re.startsWith(HostValue);
        value653 && options.re != null && deps.value30.current.get(options.re)?.();
        value653 &&
          options.re === deps.value31.current?.token &&
          (deps.value31.current = null);
        if (
          value653 &&
          options.re !== deps.frameSelectionTokensRef.current.get(input)
        )
          return;
        if (
          (0, isSessionCancelMessage)(options.re, deps.value27.current)
        ) {
          deps.value27.current = null;
          return;
        }
        if (options.artboard) {
          deps.value29.current(input, options.additive === true);
          return;
        }
        let value654: Dynamic =
            options.tids && options.tids.length > 0
              ? {
                  name: options.name ?? null,
                  tids: options.tids,
                  rect: options.rect ?? null,
                  count: options.tids.length,
                  part: options.part,
                }
              : null,
          value655: Dynamic =
            options.re != null &&
            options.re.startsWith(keyboardNavigationMode);
        if (
          !value655 &&
          !value653 &&
          !options.additive &&
          value654 == null &&
          deps.value25.current === input
        ) {
          deps.value25.current = null;
          return;
        }
        if (
          deps.value24.current?.noteSelection(
            input,
            value654?.tids ?? null,
            options.re,
          ) === false
        )
          return;
        value654 == null &&
          !value655 &&
          !value653 &&
          !options.artboard &&
          deps.selectionEpochRef.current++;
        value654 != null &&
          !value655 &&
          !value653 &&
          ((deps.value25.current = null), deps.selectionEpochRef.current++);
        let value656: Dynamic = (0, applyHostSelectionResponse)(
          deps.selectionRef.current,
          input,
          {
            entry: value654,
            additive: options.additive === true,
            re: options.re,
          },
        );
        value656.kind !== "confirm" &&
          ((deps.selectionRef.current = value656.next),
          deps.setSelection(value656.next),
          value656.pushback === "clear" &&
            deps.setShownFrameSelectionRef.current(input, null));
      }

/** applyCanvasSelection 的实现：写入 selectionRef 与选择状态，并按 0/150/600ms 多次把元素选择重新推送到未聚焦的画板预览中显示。 */
export function commitCanvasSelection(deps: { readonly focusedFileRef: Dynamic; readonly frameSelectionTokensRef: Dynamic; readonly selectionRef: Dynamic; readonly setSelection: Dynamic; readonly setShownFrameSelection: Dynamic; readonly value177: Dynamic; readonly value19: Dynamic }, input?: Dynamic, options?: Dynamic): Dynamic {
        let current4: Dynamic = deps.selectionRef.current;
        deps.selectionRef.current = input;
        deps.setSelection(input);
        let current5: Dynamic = deps.focusedFileRef.current;
        for (let value657 of (options?.repush ?? []) as Dynamic) {
          if (value657 === current5) continue;
          let value658: Dynamic = input.elements.get(value657)?.tids;
          if (value658 == null) continue;
          let callback15: Dynamic = (): Dynamic => {
            let value659: Dynamic =
              deps.selectionRef.current.elements.get(value657)?.tids;
            return (
              deps.focusedFileRef.current !== value657 && value659 === value658
            );
          };
          for (let value659 of [0, 150, 600] as Dynamic)
            (window as Dynamic).setTimeout((): Dynamic => {
              callback15() &&
                deps.value177.current
                  .get(value657)
                  ?.setShownSelection(value658, deps.value19(value657));
            }, value659);
        }
        if (current5 == null) return;
        let value653: Dynamic = current4.elements.get(current5)?.tids,
          value654: Dynamic = input.elements.get(current5)?.tids,
          value655: Dynamic =
            value653 === value654 ||
            (value653 != null &&
              value654 != null &&
              value653.length === value654.length &&
              value653.every(
                (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                  input2 === value654[options2],
              )),
          value656: Dynamic =
            options?.repush != null && [...options.repush].includes(current5);
        if (!value655 || (value656 && value654 != null)) {
          let value657: Dynamic = deps.setShownFrameSelection(
            current5,
            value654 ?? null,
          );
          if (value656 && value654 != null && value657 != null) {
            let callback15: Dynamic = (): Dynamic => {
              let value658: Dynamic =
                deps.selectionRef.current.elements.get(current5)?.tids;
              return (
                deps.focusedFileRef.current === current5 &&
                deps.frameSelectionTokensRef.current.get(current5) === value657 &&
                value658 != null &&
                value658.length === value654.length &&
                value658.every(
                  (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                    input2 === value654[options2],
                )
              );
            };
            for (let value658 of [150, 600] as Dynamic)
              (window as Dynamic).setTimeout((): Dynamic => {
                callback15() &&
                  deps.setShownFrameSelection(current5, value654, value657);
              }, value658);
          }
        }
      }

/** 聚焦某个画板后运行：等待预览就绪，再以 60ms 轮询把已保存的元素选择反复推送到该画板 iframe，直到对方确认显示或超时。 */
export function focusArtboardAndReplaySelection(deps: { readonly abandonSelectionGesture: Dynamic; readonly focusedFileRef: Dynamic; readonly frameSelectionSequencesRef: Dynamic; readonly pendingFrameSelectionRef: Dynamic; readonly selectionEpochRef: Dynamic; readonly selectionRef: Dynamic; readonly setShownFrameSelection: Dynamic; readonly value177: Dynamic; readonly value274: Dynamic; readonly value30: Dynamic }, input?: Dynamic): Dynamic {
        let value653: Dynamic = deps.abandonSelectionGesture(),
          value654: Dynamic =
            deps.focusedFileRef.current !== input
              ? {
                  file: input,
                }
              : null;
        value654 && (deps.pendingFrameSelectionRef.current = value654);
        let callback15: Dynamic = (): Dynamic => {
          value654 &&
            deps.pendingFrameSelectionRef.current === value654 &&
            (deps.pendingFrameSelectionRef.current = null);
        };
        return deps.value274
          .current(input)
          .then(
            (): Dynamic =>
              new Promise((input2?: Dynamic): Dynamic => {
                let entry: Dynamic =
                    deps.frameSelectionSequencesRef.current.get(input),
                  items: Dynamic = [],
                  index: Dynamic = 0,
                  index2: Dynamic = 0,
                  index3: Dynamic = 0,
                  flag2: Dynamic = false,
                  callback16: Dynamic = (): Dynamic => {
                    for (let value655 of items as Dynamic)
                      deps.value30.current.delete(value655);
                    callback15();
                    input2(
                      flag2 ||
                        (deps.focusedFileRef.current === input &&
                          deps.selectionRef.current.elements.has(input)),
                    );
                  },
                  callback17: Dynamic = (): Dynamic => {
                    if (
                      flag2 ||
                      deps.selectionEpochRef.current !== value653 ||
                      deps.frameSelectionSequencesRef.current.get(input) !== entry
                    )
                      return callback16();
                    let entry2: Dynamic =
                        deps.selectionRef.current.elements.get(input),
                      value655: Dynamic =
                        deps.focusedFileRef.current != null &&
                        deps.focusedFileRef.current !== input;
                    if (!entry2 || value655 || index >= 25 || index2++ >= 400)
                      return callback16();
                    let entry3: Dynamic = deps.value177.current.get(input);
                    if (
                      Date.now() - index3 >= 300 &&
                      deps.focusedFileRef.current === input &&
                      entry3?.isReady()
                    ) {
                      deps.setShownFrameSelection(input, null);
                      let value656: Dynamic = deps.setShownFrameSelection(
                        input,
                        entry2.tids,
                      );
                      value656 &&
                        (index++,
                        (index3 = Date.now()),
                        items.push(value656),
                        deps.value30.current.set(value656, (): Dynamic => {
                          flag2 = true;
                          callback16();
                        }));
                    }
                    (window as Dynamic).setTimeout(callback17, 60);
                  };
                (window as Dynamic).setTimeout(callback17, 60);
              }),
          )
          .catch((): Dynamic => (callback15(), false));
      }

/** 键盘选择导航入口：按 kind 处理全选、方向键微移（含长按节流）、重排层级、进入子级/返回父级/切换兄弟元素，并播报结果。 */
export function navigateSelectionByKind(deps: { readonly abandonSelectionGesture: Dynamic; readonly applyCanvasSelection: Dynamic; readonly callback: Dynamic; readonly count3: Dynamic; readonly focusedFileRef: Dynamic; readonly frameSelectionTokensRef: Dynamic; readonly selectionEpochRef: Dynamic; readonly selectionRef: Dynamic; readonly value155: Dynamic; readonly value177: Dynamic; readonly value19: Dynamic; readonly value218: Dynamic; readonly value31: Dynamic; readonly value34: Dynamic; readonly value432: Dynamic; readonly value44: Dynamic; readonly value440: Dynamic; readonly value48: Dynamic; readonly value49: Dynamic; readonly value50: Dynamic; readonly value53: Dynamic; readonly value54: Dynamic; readonly value73: Dynamic; readonly value87: Dynamic }, source?: Dynamic): Dynamic {
        let callback15: Dynamic = (): Dynamic =>
          (0, canNavigateSelection)({
            gesturing: deps.value218.current,
            setMoveCommits: deps.value155.current,
          });
        if (!callback15()) return;
        let current4: Dynamic = deps.selectionRef.current,
          callback16: Dynamic = (input?: Dynamic): Dynamic =>
            (0, sameSelectionStructure)(current4, input);
        if (source.kind === "all") {
          let value654: Dynamic = (0, selectionNavigationScope)(
            current4,
            false,
          );
          if (value654 === "panel") return;
          if (value654 === "canvas") {
            deps.abandonSelectionGesture();
            let current5: Dynamic = deps.value87.current;
            deps.applyCanvasSelection(
              (0, selectionFromBoards)({
                files: new Set(
                  current5.artboards.map(
                    (input?: Dynamic): Dynamic => input.file,
                  ),
                ),
                notes: new Set(
                  (current5.annotations ?? []).map(
                    (input?: Dynamic): Dynamic => input.id,
                  ),
                ),
              }),
            );
            return;
          }
        }
        if (source.kind === "nudge") {
          let { dx: value654, dy: value655 }: Dynamic = source,
            value656: Dynamic = Date.now(),
            callback17: Dynamic = async (): Promise<Dynamic> => {
              if (
                !callback15() ||
                (source.repeat &&
                  Date.now() - value656 > deps.count3 &&
                  deps.value48.current > 1)
              )
                return;
              let current5: Dynamic = deps.selectionRef.current;
              if (!callback16(current5)) return;
              deps.value50.current++;
              let value657: Dynamic = deps.abandonSelectionGesture();
              Date.now() - deps.value53.current.at >
                ModelModelStateLimit &&
                (deps.value53.current = {
                  at: 0,
                  seq: new Map(),
                  dead: new Set(),
                });
              let current6: Dynamic = deps.value53.current;
              current6.at = Date.now();
              let value658: Dynamic = deps.callback(current5).filter(
                  ([input]: Dynamic): Dynamic => !current6.dead.has(input),
                ),
                values: Dynamic = new Set(
                  value658.map(([input]: Dynamic): Dynamic => input),
                ),
                value659: Dynamic = (0, canvasBoardSelection)(
                  current5,
                ),
                value660: Dynamic =
                  (0, boardSelectionCount)(value659) > 0 &&
                  true &&
                  deps.value44.current(value659, value654, value655, current6.seq);
              if (value658.length === 0) {
                value660 &&
                  (0, announce)(
                    (0, moveDirectionAnnouncement)(
                      value654,
                      value655,
                    ),
                  );
                return;
              }
              let value661: Dynamic = deps.value432.current?.group(values),
                current7: Dynamic = deps.focusedFileRef.current,
                values2: Dynamic = new Set(),
                value662: Dynamic = await Promise.all(
                  value658.map(
                    ([input, input2]: Dynamic): Dynamic =>
                      (
                        deps.value177.current.get(input)?.nudgeSelection(
                          input2,
                          value654,
                          value655,
                          input === current7
                            ? (): Dynamic => {
                                values2.add(input);
                                deps.value54(input);
                              }
                            : undefined,
                        ) ?? Promise.resolve(null)
                      )
                        .then(
                          (input3?: Dynamic): Dynamic => (
                            input3?.did === "timeout" &&
                              current6.dead.add(input),
                            input3
                          ),
                        )
                        .catch((): Dynamic => null)
                        .finally((): Dynamic => value661?.settled(input)),
                  ),
                ).finally((): Dynamic => value661?.end());
              for (let value664 of values as Dynamic)
                current6.seq.set(
                  value664,
                  deps.value440.current.get(value664) ?? 0,
                );
              current6.at = Date.now();
              let entries: Dynamic = new Map(),
                values3: Dynamic = new Set(values2),
                index: Dynamic = 0,
                index2: Dynamic = 0;
              value662.forEach(
                (input?: Dynamic, options?: Dynamic): Dynamic => {
                  let value664: Dynamic = value658[options][0];
                  input?.did === "reordered"
                    ? (entries.set(value664, input.tids),
                      values3.add(value664),
                      index2++)
                    : input?.did === "nudged" &&
                      (values3.add(value664), index++);
                },
              );
              index > 0 || value660
                ? (0, announce)(
                    (0, moveDirectionAnnouncement)(
                      value654,
                      value655,
                    ),
                  )
                : index2 > 0 &&
                  (0, announce)(
                    (0, reorderAnnouncement)(
                      value654 < 0 || value655 < 0 ? -1 : 1,
                      false,
                    ),
                  );
              if (
                values3.size === 0 ||
                deps.selectionEpochRef.current !== value657
              )
                return;
              let current8: Dynamic = deps.selectionRef.current;
              deps.applyCanvasSelection(
                entries.size > 0
                  ? (0, selectionAfterElementEdits)(
                      current8,
                      "next",
                      new Map(),
                      entries,
                      deps.value19,
                    )
                  : current8,
                {
                  repush: values3,
                },
              );
              let value663: Dynamic =
                current7 != null &&
                current7 === deps.focusedFileRef.current &&
                values2.has(current7)
                  ? deps.frameSelectionTokensRef.current.get(current7)
                  : undefined;
              value663 != null &&
                (deps.value31.current = {
                  token: value663,
                  at: Date.now(),
                });
            };
          deps.value48.current++;
          deps.value49(callback17, (): Dynamic => {
            deps.value48.current--;
          });
          return;
        }
        let value653: Dynamic =
          source.kind === "enter"
            ? "children"
            : source.kind === "parent"
              ? "parents"
              : source.kind === "all"
                ? "siblings"
                : source.kind;
        deps.value49(async (): Promise<Dynamic> => {
          if (!callback15()) return;
          let current5: Dynamic = deps.selectionRef.current;
          if (!callback16(current5)) return;
          deps.value50.current++;
          let value654: Dynamic = deps.abandonSelectionGesture(),
            value655: Dynamic = deps.callback(current5),
            value656: Dynamic = (
              value653 === "children" ? [...current5.artboards] : []
            ).map(async (input?: Dynamic): Promise<Dynamic> => {
              if (
                deps.value73.current.artboards.find(
                  (input2?: Dynamic): Dynamic => input2.file === input,
                )?.frameless
              )
                return null;
              let value661: Dynamic = await deps.value177.current
                .get(input)
                ?.ensureOutline();
              return value661
                ? [
                    input,
                    value661
                      .filter(
                        (input2?: Dynamic): Dynamic =>
                          !SelectionActionsHelmetScHelmetPattern.test(
                            input2.tag,
                          ),
                      )
                      .map((input2?: Dynamic): Dynamic => input2.tid),
                  ]
                : null;
            }),
            value657: Dynamic = value655.map(
              async ([input, input2]: Dynamic): Promise<Dynamic> => {
                let value661: Dynamic = await deps.value177.current
                  .get(input)
                  ?.walkTids(input2, value653);
                return value661 == null
                  ? null
                  : [
                      input,
                      value653 === "parents" && value661.length === 0
                        ? "artboard"
                        : value661,
                    ];
              },
            ),
            [value658, value659]: Dynamic = await Promise.all([
              Promise.all(value656),
              Promise.all(value657),
            ]);
          if (deps.selectionEpochRef.current !== value654) return;
          let value660: Dynamic = (0, selectionAfterElementEdits)(
            current5,
            value653,
            new Map(
              value658.filter((input?: Dynamic): Dynamic => input != null),
            ),
            new Map(
              value659.filter((input?: Dynamic): Dynamic => input != null),
            ),
            deps.value19,
          );
          if (value660 === current5) return;
          deps.applyCanvasSelection(value660);
          let current6: Dynamic = deps.focusedFileRef.current;
          if (
            value653 === "children" &&
            !(current6 != null && value660.elements.has(current6))
          ) {
            let value661: Dynamic = deps.value73.current.artboards.find(
              (input?: Dynamic): Dynamic =>
                value660.elements.has(input.file) &&
                current5.artboards.has(input.file),
            );
            value661 && (deps.value50.current++, deps.value34(value661.file));
          }
        });
      }

/** 删除命令触发时运行：在各画板中移除选中的元素并记录历史；只读、失败或重复行无法删除时提示原因。 */
export function deleteSelectedElements(deps: { readonly abandonSelectionGesture: Dynamic; readonly applyCanvasSelection: Dynamic; readonly selectionRef: Dynamic; readonly value144: Dynamic; readonly value155: Dynamic; readonly value177: Dynamic; readonly value218: Dynamic; readonly value22: Dynamic; readonly value432: Dynamic; readonly value448: Dynamic; readonly value459: Dynamic }, input?: Dynamic, options: Dynamic = {}): Dynamic {
        if (
          !(0, sessionAllowsMutation)({
            gesturing: deps.value218.current,
            setMoveCommits: deps.value155.current,
          })
        )
          return false;
        let current4: Dynamic = deps.selectionRef.current,
          value653: Dynamic = [...current4.elements].map(
            ([input2, input3]: Dynamic): Dynamic => [
              input2,
              {
                tids: [...input3.tids],
              },
            ],
          );
        deps.abandonSelectionGesture();
        let value654: Dynamic = options.elementsOnly
            ? emptyBoardSelection
            : (0, canvasBoardSelection)(current4),
          value655: Dynamic =
            (0, boardSelectionCount)(value654) > 0 &&
            value653.length > 0
              ? (0, randomSessionToken)()
              : undefined,
          value656: Dynamic =
            value655 !== undefined ? deps.value144(value655) : null,
          value657: Dynamic =
            (0, boardSelectionCount)(value654) > 0
              ? deps.value459.current(value654, value655)
              : false,
          value658: Dynamic = deps.value432.current?.group(
            value653.map(([input2]: Dynamic): Dynamic => input2),
            {
              bound: value655,
            },
          ),
          entries: Dynamic = new Map(deps.value22.current);
        (value657 && value656 ? value656 : Promise.resolve())
          .then(
            (): Dynamic =>
              Promise.all(
                value653.map(
                  ([input2, input3]: Dynamic): Dynamic =>
                    (deps.value22.current.get(input2) === entries.get(input2)
                      ? deps.value177.current
                          .get(input2)
                          ?.removeSelection(input3.tids)
                      : Promise.resolve("skipped")
                    )
                      ?.catch((): Dynamic => "failed")
                      .finally((): Dynamic => value658?.settled(input2)),
                ),
              ),
          )
          .finally((): Dynamic => value658?.end())
          .then((items?: Dynamic): Dynamic => {
            if (items.length === 0) return;
            let value659: Dynamic = items.some(
              (input2?: Dynamic): Dynamic =>
                input2 !== "failed" && input2 !== "skipped" && !!input2,
            );
            if (
              items.some((input2?: Dynamic): Dynamic => input2 === "failed")
            ) {
              deps.value448.current(
                value659
                  ? input + " \u2014 one artboard's delete failed"
                  : uiMessage("canvas.designCanvas.nothingDeletedAnArtboardCould"),
              );
              return;
            }
            let length: Dynamic = items.filter(
              (input2?: Dynamic): Dynamic => input2 === "skipped",
            ).length;
            if (length > 0) {
              deps.value448.current(
                (0, selectionActionFailureMessage)(
                  "delete",
                  length,
                  value659,
                ),
              );
              return;
            }
            items.every((input2?: Dynamic): Dynamic => !input2)
              ? deps.value448.current(
                  uiMessage("canvas.designCanvas.nothingDeletedRepeatedRowsAre"),
                )
              : (0, announce)(
                  items.every(Boolean)
                    ? input
                    : input + " \u2014 repeated rows stayed",
                );
          });
        deps.applyCanvasSelection(
          options.elementsOnly
            ? (0, selectionFromBoards)(
                (0, canvasBoardSelection)(current4),
              )
            : emptyCanvasSelection,
        );
        return true;
      }

/** 复制（Duplicate）命令触发时运行：在各画板内就地复制选中的元素并更新选择，失败或不可复制时提示原因。 */
export function duplicateSelectedElements(deps: { readonly abandonSelectionGesture: Dynamic; readonly selectionRef: Dynamic; readonly value138: Dynamic; readonly value144: Dynamic; readonly value155: Dynamic; readonly value177: Dynamic; readonly value218: Dynamic; readonly value22: Dynamic; readonly value31: Dynamic; readonly value323: Dynamic; readonly value432: Dynamic; readonly value448: Dynamic; readonly value48: Dynamic }, input: Dynamic = {}): Dynamic {
        if (
          !(0, sessionAllowsMutation)({
            gesturing: deps.value218.current,
            setMoveCommits: deps.value155.current,
          }) ||
          deps.value48.current > 0
        )
          return false;
        deps.value31.current = null;
        deps.abandonSelectionGesture();
        let value653: Dynamic = deps.value138(),
          value654: Dynamic = input.elementsOnly
            ? emptyBoardSelection
            : (0, canvasBoardSelection)(deps.selectionRef.current),
          value655: Dynamic =
            (0, boardSelectionCount)(value654) > 0 &&
            value653.length > 0
              ? (0, randomSessionToken)()
              : undefined,
          value656: Dynamic =
            value655 !== undefined ? deps.value144(value655) : null,
          value657: Dynamic =
            (0, boardSelectionCount)(value654) > 0
              ? deps.value323.current(value654, value655)
              : false,
          value658: Dynamic = deps.value432.current?.group(
            value653.map(([input2]: Dynamic): Dynamic => input2),
            {
              bound: value655,
            },
          ),
          entries: Dynamic = new Map(deps.value22.current);
        (value657 && value656 ? value656 : Promise.resolve())
          .then(
            (): Dynamic =>
              Promise.all(
                value653.map(
                  ([input2, input3]: Dynamic): Dynamic =>
                    (deps.value22.current.get(input2) === entries.get(input2)
                      ? deps.value177.current
                          .get(input2)
                          ?.duplicateSelection(input3.tids)
                      : Promise.resolve("skipped")
                    )
                      ?.catch((): Dynamic => "failed")
                      .finally((): Dynamic => value658?.settled(input2)),
                ),
              ),
          )
          .finally((): Dynamic => value658?.end())
          .then((items?: Dynamic): Dynamic => {
            let value659: Dynamic = items.some(
              (input2?: Dynamic): Dynamic =>
                input2 !== "failed" && input2 !== "skipped" && !!input2,
            );
            if (
              items.some((input2?: Dynamic): Dynamic => input2 === "failed")
            ) {
              deps.value448.current(
                value659
                  ? uiMessage("canvas.designCanvas.duplicatedOneArtboardSDuplicate")
                  : uiMessage("canvas.designCanvas.nothingDuplicatedAnArtboardCould"),
              );
              return;
            }
            let length: Dynamic = items.filter(
              (input2?: Dynamic): Dynamic => input2 === "skipped",
            ).length;
            if (length > 0) {
              deps.value448.current(
                (0, selectionActionFailureMessage)(
                  "duplicate",
                  length,
                  value659,
                ),
              );
              return;
            }
            items.length > 0 &&
              items.every((input2?: Dynamic): Dynamic => !input2) &&
              deps.value448.current(
                uiMessage("canvas.designCanvas.nothingDuplicatedRepeatedRowsAre"),
              );
          });
        return true;
      }

/** 水平或垂直翻转命令触发时运行：翻转画板内选中的元素，并把选中的画布图形交给标注翻转逻辑；部分失败时提示与播报。 */
export function flipSelectedObjects(deps: { readonly applyCanvasSelection: Dynamic; readonly selectionRef: Dynamic; readonly value144: Dynamic; readonly value149: Dynamic; readonly value150: Dynamic; readonly value155: Dynamic; readonly value177: Dynamic; readonly value19: Dynamic; readonly value218: Dynamic; readonly value224: Dynamic; readonly value432: Dynamic; readonly value448: Dynamic; readonly value45: Dynamic; readonly value46: Dynamic }, input?: Dynamic, options: Dynamic = {}): Dynamic {
        if (deps.value149.current) {
          deps.value448.current(GeometryFlipAnnotationsLabel_3 + ".");
          return true;
        }
        if (
          !deps.value224.current ||
          !(0, sessionAllowsMutation)({
            gesturing: deps.value218.current,
            setMoveCommits: deps.value155.current,
          }) ||
          deps.value150() !== undefined
        )
          return false;
        let current4: Dynamic = deps.selectionRef.current,
          value653: Dynamic = [...current4.elements]
            .filter(
              ([input2, input3]: Dynamic): Dynamic =>
                input3.name === deps.value19(input2),
            )
            .map(
              ([input2, input3]: Dynamic): Dynamic => [
                input2,
                {
                  tids: [...input3.tids],
                },
              ],
            ),
          value654: Dynamic = options.elementsOnly
            ? emptyCanvasSelectionFiles
            : current4.notes;
        if (value653.length === 0 && value654.size === 0) {
          current4.artboards.size > 0 &&
            deps.value448.current(GeometryFlipAnnotationsLabel_2);
          return false;
        }
        if (value653.length === 0) return deps.value46.current(value654, input);
        deps.value155.current++;
        deps.value149.current = true;
        let flag2: Dynamic = true,
          callback15: Dynamic = (): Dynamic => {
            flag2 &&
              ((flag2 = false),
              (deps.value149.current = false),
              deps.value155.current--);
          },
          value655: Dynamic = (window as Dynamic).setTimeout(
            callback15,
            artboardRevealSettleTimeoutMs,
          );
        (async (): Promise<Dynamic> => {
          let value656: Dynamic = await Promise.all(
              value653.map(
                ([input2, input3]: Dynamic): Dynamic =>
                  (
                    deps.value177.current.get(input2)?.flipRead(input3.tids) ??
                    Promise.resolve(null)
                  ).catch((): Dynamic => null),
              ),
            ),
            current5: Dynamic = deps.selectionRef.current;
          if (
            !deps.value224.current ||
            deps.value150() !== undefined ||
            value653.some(
              ([input2, input3]: Dynamic): Dynamic =>
                current5.elements.get(input2)?.tids.join() !==
                input3.tids.join(),
            ) ||
            [...value654].some(
              (input2?: Dynamic): Dynamic => !current5.notes.has(input2),
            )
          )
            return;
          if (
            !flag2 ||
            value656.some((input2?: Dynamic): Dynamic => input2 === null)
          )
            return void deps.value448.current(
              CouldnTFlipRightNowTryAgainMessage,
            );
          let value657: Dynamic =
              value654.size > 0
                ? (0, randomSessionToken)()
                : undefined,
            value658: Dynamic =
              value657 !== undefined ? deps.value144(value657) : null,
            value659: Dynamic =
              value654.size > 0
                ? deps.value45.current(value654, input, value657)
                : null,
            value660: Dynamic = deps.value432.current?.group(
              value653.map(([input2]: Dynamic): Dynamic => input2),
              {
                bound: value657,
              },
            );
          value659?.flipped && value658 && (await value658);
          let value661: Dynamic = await Promise.all(
              value653.map(
                ([input2]: Dynamic, options2?: Dynamic): Dynamic =>
                  (
                    deps.value177.current
                      .get(input2)
                      ?.flipSelection(value656[options2], input) ??
                    Promise.resolve(null)
                  )
                    .catch((): Dynamic => null)
                    .finally((): Dynamic => value660?.settled(input2)),
              ),
            ).finally((): Dynamic => value660?.end()),
            value662: Dynamic = value661.some(
              (input2?: Dynamic): Dynamic => (input2?.flipped ?? 0) > 0,
            ),
            value663: Dynamic = value662 || value659?.flipped === true,
            value664: Dynamic = value661.some(
              (input2?: Dynamic): Dynamic =>
                input2 === null ||
                (input2.flipped === 0 &&
                  (input2.refused === undefined ||
                    input2.refused ===
                      CouldnTFlipRightNowTryAgainMessage)),
            ),
            value665: Dynamic = [
              ...value661.map((input2?: Dynamic): Dynamic => input2?.refused),
              value659?.refused,
            ].filter((input2?: Dynamic): Dynamic => input2 !== undefined),
            value666: Dynamic =
              value665.find(
                (input2?: Dynamic): Dynamic =>
                  input2 !== FlippingThisWayWouldnTChangeItMessage,
              ) ?? (value663 ? undefined : value665[0]),
            value667: Dynamic = value664
              ? value663
                ? PartOfTheSelectionCouldnTBeMessage
                : CouldnTFlipRightNowTryAgainMessage
              : value666 !== undefined
                ? (0, partialFlipMessage)(
                    value666,
                    value663,
                    GeometryFlipAnnotationsWytKytYtConfig,
                  )
                : undefined;
          value662 &&
            deps.applyCanvasSelection(deps.selectionRef.current, {
              repush: new Set(
                value653.map(([input2]: Dynamic): Dynamic => input2),
              ),
            });
          !(!value664 && options.then?.(value667, value663) === true) &&
            (value667 !== undefined && deps.value448.current(value667),
            value663 &&
              (0, announce)(
                (0, flipDirectionAnnouncement)(input),
              ));
        })().finally((): Dynamic => {
          (window as Dynamic).clearTimeout(value655);
          callback15();
        });
        return true;
      }

/** 从大纲或外部请求选中某画板内的元素时运行：先聚焦画板，再推送元素选择，并报告已落定、被替代或放弃。 */
export function selectElementInArtboard(deps: { readonly abandonSelectionGesture: Dynamic; readonly focusedFileRef: Dynamic; readonly selectionEpochRef: Dynamic; readonly selectionRef: Dynamic; readonly setSelection: Dynamic; readonly value124: Dynamic; readonly value177: Dynamic; readonly value19: Dynamic; readonly value23: Dynamic; readonly value25: Dynamic; readonly value273: Dynamic; readonly value62: Dynamic; readonly value73: Dynamic }, input?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value653?: Dynamic,
        extra?: Dynamic): Dynamic {
        let value654: Dynamic = deps.value19(input),
          value655: Dynamic =
            value653 != null
              ? ++deps.selectionEpochRef.current
              : deps.abandonSelectionGesture(),
          callback15: Dynamic = (): Dynamic => {
            deps.selectionEpochRef.current === value655 &&
              deps.selectionEpochRef.current++;
          };
        deps.value124(
          deps.value73.current.artboards.some(
            (input2?: Dynamic): Dynamic =>
              input2.file === input && input2.frameless,
          )
            ? input
            : null,
        );
        deps.value62();
        deps.value23.current = true;
        deps.setSelection(emptyCanvasSelection);
        deps.value273(input).then((): Dynamic => {
          let index: Dynamic = 0,
            index2: Dynamic = 0,
            index3: Dynamic = 0,
            callback16: Dynamic = (): Dynamic => {
              if (deps.selectionEpochRef.current !== value655)
                return extra?.("superseded");
              if (
                deps.selectionRef.current.elements
                  .get(input)
                  ?.tids.includes(options)
              )
                return extra?.("landed");
              if (index >= 25 || index2++ >= 400) return extra?.("gave-up");
              let entry: Dynamic = deps.value177.current.get(input);
              if (context && Date.now() - index3 < 300) {
                (window as Dynamic).setTimeout(callback16, 60);
                return;
              }
              deps.focusedFileRef.current === input &&
                entry?.isReady() &&
                (value653 == null && (deps.value25.current = input),
                !entry.setShownSelection(null, null, value653) &&
                  value653 == null &&
                  (deps.value25.current = null),
                entry.setShownSelection([options], value654, value653) &&
                  (index++, (index3 = Date.now()), context?.()));
              (window as Dynamic).setTimeout(callback16, 60);
            };
          (window as Dynamic).setTimeout(callback16, 60);
        });
        return callback15;
      }

/** 画板列表或选择变化时计算（useMemo）：生成大纲面板的画板行、选中状态、封面、右键操作与重命名回调。 */
export function buildOutlineArtboardRows(deps: { readonly abandonSelectionGesture: Dynamic; readonly setSelection: Dynamic; readonly value168: Dynamic; readonly value169: Dynamic; readonly value170: Dynamic; readonly value224: Dynamic; readonly value273: Dynamic; readonly value314: Dynamic; readonly value397: Dynamic; readonly value40: Dynamic; readonly value543: Dynamic; readonly value544: Dynamic; readonly value545: Dynamic; readonly value546: Dynamic; readonly value547: Dynamic; readonly value549: Dynamic; readonly value551: Dynamic; readonly value552: Dynamic; readonly value559: Dynamic; readonly value578: Dynamic; readonly value581: Dynamic; readonly value587: Dynamic; readonly value588: Dynamic; readonly value592: Dynamic; readonly value593: Dynamic; readonly value596: Dynamic; readonly value600: Dynamic; readonly value601: Dynamic; readonly value62: Dynamic; readonly value86: Dynamic }): Dynamic {
  return {
        rows: deps.value86.artboards.map(
          (input?: Dynamic): Dynamic => ({
            file: input.file,
            label: input.title ?? input.file.replace(/\.dc\.html$/, ""),
          }),
        ),
        selected: deps.value168,
        cover: deps.value601,
        contextActions: deps.value592,
        renaming: deps.value587,
        onRename: (input?: Dynamic, options?: Dynamic): Dynamic => {
          deps.value588(null);
          options != null && deps.value224.current && deps.value397(input, options);
        },
        selectedIn: deps.value170,
        open: deps.value543,
        trees: deps.value547,
        expanded: deps.value545,
        scroll: deps.value551,
        cursor: deps.value552,
        revealed: deps.value600,
        objects: deps.value596,
        selectedObjects: deps.value169,
        onSelectObject: (input?: Dynamic, options?: Dynamic): Dynamic => {
          deps.value224.current &&
            deps.value314(
              (0, boardSelectionItems)({
                note: input,
              }),
              options ? "toggle" : "replace",
            );
        },
        objectContextActions: deps.value593,
        onToggleOpen: (input?: Dynamic, options?: Dynamic): Dynamic =>
          deps.value544((input2?: Dynamic): Dynamic => {
            if (input2.has(input) === options) return input2;
            let values: Dynamic = new Set(input2);
            options ? values.add(input) : values.delete(input);
            return values;
          }),
        onExpandedChange: (input?: Dynamic, options?: Dynamic): Dynamic =>
          deps.value546(
            (input2?: Dynamic): Dynamic => ({
              ...input2,
              [input]: options,
            }),
          ),
        onSelectIn: (input?: Dynamic, options?: Dynamic): Dynamic => {
          deps.value559(input);
          deps.value581(input, options);
        },
        onFocus: (input?: Dynamic): Dynamic => {
          deps.abandonSelectionGesture();
          deps.value544(
            (input2?: Dynamic): Dynamic =>
              input2.has(input) ? input2 : new Set([...input2, input]),
          );
          deps.value62();
          deps.setSelection((0, selectionFromArtboards)(new Set([input])));
          deps.value273(input);
          deps.value559(input);
          deps.value549.current[input] === null && deps.value40(input);
        },
        onToggleSelected: (input?: Dynamic): Dynamic => deps.value578(input, true),
      };
}
