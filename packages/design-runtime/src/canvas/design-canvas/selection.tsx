import { CouldnTFlipRightNowTryAgainMessage } from "../../editor/geometry/flip-elements";
import { FlippingThisWayWouldnTChangeItMessage } from "../../editor/geometry/flip-elements";
import { GeometryFlipAnnotationsLabel_2 as flipNeedsObjectsMessage } from "../../editor/geometry/flip-annotations";
import { GeometryFlipAnnotationsLabel_3 as flipInProgressMessage } from "../../editor/geometry/flip-annotations";
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
export function routeFrameSelectionEvent(deps: { readonly focusedFileRef: Dynamic; readonly frameSelectionTokensRef: Dynamic; readonly pendingFrameSelectionRef: Dynamic; readonly selectionEpochRef: Dynamic; readonly selectionRef: Dynamic; readonly setSelection: Dynamic; readonly setShownFrameSelectionRef: Dynamic; readonly value24: Dynamic; readonly value25: Dynamic; readonly value27: Dynamic; readonly value29: Dynamic; readonly value30: Dynamic; readonly value31: Dynamic }, file?: Dynamic, selectionEvent?: Dynamic): Dynamic {
        if (file !== deps.focusedFileRef.current) return;
        file === deps.pendingFrameSelectionRef.current?.file &&
          selectionEvent.tids &&
          selectionEvent.tids.length > 0 &&
          (deps.pendingFrameSelectionRef.current = null);
        let isHostResponse: Dynamic =
          selectionEvent.re != null && selectionEvent.re.startsWith(HostValue);
        isHostResponse && selectionEvent.re != null && deps.value30.current.get(selectionEvent.re)?.();
        isHostResponse &&
          selectionEvent.re === deps.value31.current?.token &&
          (deps.value31.current = null);
        if (
          isHostResponse &&
          selectionEvent.re !== deps.frameSelectionTokensRef.current.get(file)
        )
          return;
        if (
          isSessionCancelMessage(selectionEvent.re, deps.value27.current)
        ) {
          deps.value27.current = null;
          return;
        }
        if (selectionEvent.artboard) {
          deps.value29.current(file, selectionEvent.additive === true);
          return;
        }
        let selectedEntry: Dynamic =
            selectionEvent.tids && selectionEvent.tids.length > 0
              ? {
                  name: selectionEvent.name ?? null,
                  tids: selectionEvent.tids,
                  rect: selectionEvent.rect ?? null,
                  count: selectionEvent.tids.length,
                  part: selectionEvent.part,
                }
              : null,
          isKeyboardNav: Dynamic =
            selectionEvent.re != null &&
            selectionEvent.re.startsWith(keyboardNavigationMode);
        if (
          !isKeyboardNav &&
          !isHostResponse &&
          !selectionEvent.additive &&
          selectedEntry == null &&
          deps.value25.current === file
        ) {
          deps.value25.current = null;
          return;
        }
        if (
          deps.value24.current?.noteSelection(
            file,
            selectedEntry?.tids ?? null,
            selectionEvent.re,
          ) === false
        )
          return;
        selectedEntry == null &&
          !isKeyboardNav &&
          !isHostResponse &&
          !selectionEvent.artboard &&
          deps.selectionEpochRef.current++;
        selectedEntry != null &&
          !isKeyboardNav &&
          !isHostResponse &&
          ((deps.value25.current = null), deps.selectionEpochRef.current++);
        let response: Dynamic = applyHostSelectionResponse(
          deps.selectionRef.current,
          file,
          {
            entry: selectedEntry,
            additive: selectionEvent.additive === true,
            re: selectionEvent.re,
          },
        );
        response.kind !== "confirm" &&
          ((deps.selectionRef.current = response.next),
          deps.setSelection(response.next),
          response.pushback === "clear" &&
            deps.setShownFrameSelectionRef.current(file, null));
      }

/** applyCanvasSelection 的实现：写入 selectionRef 与选择状态，并按 0/150/600ms 多次把元素选择重新推送到未聚焦的画板预览中显示。 */
export function commitCanvasSelection(deps: { readonly focusedFileRef: Dynamic; readonly frameSelectionTokensRef: Dynamic; readonly selectionRef: Dynamic; readonly setSelection: Dynamic; readonly setShownFrameSelection: Dynamic; readonly value177: Dynamic; readonly value19: Dynamic }, nextSelection?: Dynamic, commitOptions?: Dynamic): Dynamic {
        let previousSelection: Dynamic = deps.selectionRef.current;
        deps.selectionRef.current = nextSelection;
        deps.setSelection(nextSelection);
        let focusedFile: Dynamic = deps.focusedFileRef.current;
        for (let repushFile of (commitOptions?.repush ?? []) as Dynamic) {
          if (repushFile === focusedFile) continue;
          let repushTids: Dynamic = nextSelection.elements.get(repushFile)?.tids;
          if (repushTids == null) continue;
          let isStillPending: Dynamic = (): Dynamic => {
            let currentTids: Dynamic =
              deps.selectionRef.current.elements.get(repushFile)?.tids;
            return (
              deps.focusedFileRef.current !== repushFile && currentTids === repushTids
            );
          };
          for (let delayMs of [0, 150, 600] as Dynamic)
            (window as Dynamic).setTimeout((): Dynamic => {
              isStillPending() &&
                deps.value177.current
                  .get(repushFile)
                  ?.setShownSelection(repushTids, deps.value19(repushFile));
            }, delayMs);
        }
        if (focusedFile == null) return;
        let previousTids: Dynamic = previousSelection.elements.get(focusedFile)?.tids,
          nextTids: Dynamic = nextSelection.elements.get(focusedFile)?.tids,
          isSameTids: Dynamic =
            previousTids === nextTids ||
            (previousTids != null &&
              nextTids != null &&
              previousTids.length === nextTids.length &&
              previousTids.every(
                (tid?: Dynamic, index?: Dynamic): Dynamic =>
                  tid === nextTids[index],
              )),
          isRepush: Dynamic =
            commitOptions?.repush != null && [...commitOptions.repush].includes(focusedFile);
        if (!isSameTids || (isRepush && nextTids != null)) {
          let frameToken: Dynamic = deps.setShownFrameSelection(
            focusedFile,
            nextTids ?? null,
          );
          if (isRepush && nextTids != null && frameToken != null) {
            let isStillPending: Dynamic = (): Dynamic => {
              let currentTids: Dynamic =
                deps.selectionRef.current.elements.get(focusedFile)?.tids;
              return (
                deps.focusedFileRef.current === focusedFile &&
                deps.frameSelectionTokensRef.current.get(focusedFile) === frameToken &&
                currentTids != null &&
                currentTids.length === nextTids.length &&
                currentTids.every(
                  (tid?: Dynamic, index?: Dynamic): Dynamic =>
                    tid === nextTids[index],
                )
              );
            };
            for (let delayMs of [150, 600] as Dynamic)
              (window as Dynamic).setTimeout((): Dynamic => {
                isStillPending() &&
                  deps.setShownFrameSelection(focusedFile, nextTids, frameToken);
              }, delayMs);
          }
        }
      }

/** 聚焦某个画板后运行：等待预览就绪，再以 60ms 轮询把已保存的元素选择反复推送到该画板 iframe，直到对方确认显示或超时。 */
export function focusArtboardAndReplaySelection(deps: { readonly abandonSelectionGesture: Dynamic; readonly focusedFileRef: Dynamic; readonly frameSelectionSequencesRef: Dynamic; readonly pendingFrameSelectionRef: Dynamic; readonly selectionEpochRef: Dynamic; readonly selectionRef: Dynamic; readonly setShownFrameSelection: Dynamic; readonly value177: Dynamic; readonly value274: Dynamic; readonly value30: Dynamic }, file?: Dynamic): Dynamic {
        let selectionEpoch: Dynamic = deps.abandonSelectionGesture(),
          pendingSelection: Dynamic =
            deps.focusedFileRef.current !== file
              ? {
                  file: file,
                }
              : null;
        pendingSelection && (deps.pendingFrameSelectionRef.current = pendingSelection);
        let clearPending: Dynamic = (): Dynamic => {
          pendingSelection &&
            deps.pendingFrameSelectionRef.current === pendingSelection &&
            (deps.pendingFrameSelectionRef.current = null);
        };
        return deps.value274
          .current(file)
          .then(
            (): Dynamic =>
              new Promise((resolve?: Dynamic): Dynamic => {
                let entry: Dynamic =
                    deps.frameSelectionSequencesRef.current.get(file),
                  tokens: Dynamic = [],
                  pushCount: Dynamic = 0,
                  pollCount: Dynamic = 0,
                  lastPushAt: Dynamic = 0,
                  isConfirmed: Dynamic = false,
                  finish: Dynamic = (): Dynamic => {
                    for (let token of tokens as Dynamic)
                      deps.value30.current.delete(token);
                    clearPending();
                    resolve(
                      isConfirmed ||
                        (deps.focusedFileRef.current === file &&
                          deps.selectionRef.current.elements.has(file)),
                    );
                  },
                  poll: Dynamic = (): Dynamic => {
                    if (
                      isConfirmed ||
                      deps.selectionEpochRef.current !== selectionEpoch ||
                      deps.frameSelectionSequencesRef.current.get(file) !== entry
                    )
                      return finish();
                    let selectedEntry: Dynamic =
                        deps.selectionRef.current.elements.get(file),
                      isOtherFocused: Dynamic =
                        deps.focusedFileRef.current != null &&
                        deps.focusedFileRef.current !== file;
                    if (!selectedEntry || isOtherFocused || pushCount >= 25 || pollCount++ >= 400)
                      return finish();
                    let frameEntry: Dynamic = deps.value177.current.get(file);
                    if (
                      Date.now() - lastPushAt >= 300 &&
                      deps.focusedFileRef.current === file &&
                      frameEntry?.isReady()
                    ) {
                      deps.setShownFrameSelection(file, null);
                      let token: Dynamic = deps.setShownFrameSelection(
                        file,
                        selectedEntry.tids,
                      );
                      token &&
                        (pushCount++,
                        (lastPushAt = Date.now()),
                        tokens.push(token),
                        deps.value30.current.set(token, (): Dynamic => {
                          isConfirmed = true;
                          finish();
                        }));
                    }
                    (window as Dynamic).setTimeout(poll, 60);
                  };
                (window as Dynamic).setTimeout(poll, 60);
              }),
          )
          .catch((): Dynamic => (clearPending(), false));
      }

/** 键盘选择导航入口：按 kind 处理全选、方向键微移（含长按节流）、重排层级、进入子级/返回父级/切换兄弟元素，并播报结果。 */
export function navigateSelectionByKind(deps: { readonly abandonSelectionGesture: Dynamic; readonly applyCanvasSelection: Dynamic; readonly callback: Dynamic; readonly count3: Dynamic; readonly focusedFileRef: Dynamic; readonly frameSelectionTokensRef: Dynamic; readonly selectionEpochRef: Dynamic; readonly selectionRef: Dynamic; readonly value155: Dynamic; readonly value177: Dynamic; readonly value19: Dynamic; readonly value218: Dynamic; readonly value31: Dynamic; readonly value34: Dynamic; readonly value432: Dynamic; readonly value44: Dynamic; readonly value440: Dynamic; readonly value48: Dynamic; readonly value49: Dynamic; readonly value50: Dynamic; readonly value53: Dynamic; readonly value54: Dynamic; readonly value73: Dynamic; readonly value87: Dynamic }, source?: Dynamic): Dynamic {
        let canNavigate: Dynamic = (): Dynamic =>
          canNavigateSelection({
            gesturing: deps.value218.current,
            setMoveCommits: deps.value155.current,
          });
        if (!canNavigate()) return;
        let currentSelection: Dynamic = deps.selectionRef.current,
          isSameStructure: Dynamic = (selection?: Dynamic): Dynamic =>
            sameSelectionStructure(currentSelection, selection);
        if (source.kind === "all") {
          let navScope: Dynamic = selectionNavigationScope(
            currentSelection,
            false,
          );
          if (navScope === "panel") return;
          if (navScope === "canvas") {
            deps.abandonSelectionGesture();
            let manifest: Dynamic = deps.value87.current;
            deps.applyCanvasSelection(
              selectionFromBoards({
                files: new Set(
                  manifest.artboards.map(
                    (artboard?: Dynamic): Dynamic => artboard.file,
                  ),
                ),
                notes: new Set(
                  (manifest.annotations ?? []).map(
                    (annotation?: Dynamic): Dynamic => annotation.id,
                  ),
                ),
              }),
            );
            return;
          }
        }
        if (source.kind === "nudge") {
          let { dx: dx, dy: dy }: Dynamic = source,
            startedAt: Dynamic = Date.now(),
            runNudge: Dynamic = async (): Promise<Dynamic> => {
              if (
                !canNavigate() ||
                (source.repeat &&
                  Date.now() - startedAt > deps.count3 &&
                  deps.value48.current > 1)
              )
                return;
              let latestSelection: Dynamic = deps.selectionRef.current;
              if (!isSameStructure(latestSelection)) return;
              deps.value50.current++;
              let selectionEpoch: Dynamic = deps.abandonSelectionGesture();
              Date.now() - deps.value53.current.at >
                ModelModelStateLimit &&
                (deps.value53.current = {
                  at: 0,
                  seq: new Map(),
                  dead: new Set(),
                });
              let nudgeState: Dynamic = deps.value53.current;
              nudgeState.at = Date.now();
              let nudgeTargets: Dynamic = deps.callback(latestSelection).filter(
                  ([file]: Dynamic): Dynamic => !nudgeState.dead.has(file),
                ),
                targetFiles: Dynamic = new Set(
                  nudgeTargets.map(([file]: Dynamic): Dynamic => file),
                ),
                boardSelection: Dynamic = canvasBoardSelection(
                  latestSelection,
                ),
                didNudgeBoards: Dynamic =
                  boardSelectionCount(boardSelection) > 0 &&
                  true &&
                  deps.value44.current(boardSelection, dx, dy, nudgeState.seq);
              if (nudgeTargets.length === 0) {
                didNudgeBoards &&
                  announce(
                    moveDirectionAnnouncement(
                      dx,
                      dy,
                    ),
                  );
                return;
              }
              let historyGroup: Dynamic = deps.value432.current?.group(targetFiles),
                focusedFile: Dynamic = deps.focusedFileRef.current,
                settledFiles: Dynamic = new Set(),
                nudgeResults: Dynamic = await Promise.all(
                  nudgeTargets.map(
                    ([file, tids]: Dynamic): Dynamic =>
                      (
                        deps.value177.current.get(file)?.nudgeSelection(
                          tids,
                          dx,
                          dy,
                          file === focusedFile
                            ? (): Dynamic => {
                                settledFiles.add(file);
                                deps.value54(file);
                              }
                            : undefined,
                        ) ?? Promise.resolve(null)
                      )
                        .then(
                          (result?: Dynamic): Dynamic => (
                            result?.did === "timeout" &&
                              nudgeState.dead.add(file),
                            result
                          ),
                        )
                        .catch((): Dynamic => null)
                        .finally((): Dynamic => historyGroup?.settled(file)),
                  ),
                ).finally((): Dynamic => historyGroup?.end());
              for (let targetFile of targetFiles as Dynamic)
                nudgeState.seq.set(
                  targetFile,
                  deps.value440.current.get(targetFile) ?? 0,
                );
              nudgeState.at = Date.now();
              let reorderedTids: Dynamic = new Map(),
                changedFiles: Dynamic = new Set(settledFiles),
                nudgedCount: Dynamic = 0,
                reorderedCount: Dynamic = 0;
              nudgeResults.forEach(
                (result?: Dynamic, index?: Dynamic): Dynamic => {
                  let changedFile: Dynamic = nudgeTargets[index][0];
                  result?.did === "reordered"
                    ? (reorderedTids.set(changedFile, result.tids),
                      changedFiles.add(changedFile),
                      reorderedCount++)
                    : result?.did === "nudged" &&
                      (changedFiles.add(changedFile), nudgedCount++);
                },
              );
              nudgedCount > 0 || didNudgeBoards
                ? announce(
                    moveDirectionAnnouncement(
                      dx,
                      dy,
                    ),
                  )
                : reorderedCount > 0 &&
                  announce(
                    reorderAnnouncement(
                      dx < 0 || dy < 0 ? -1 : 1,
                      false,
                    ),
                  );
              if (
                changedFiles.size === 0 ||
                deps.selectionEpochRef.current !== selectionEpoch
              )
                return;
              let updatedSelection: Dynamic = deps.selectionRef.current;
              deps.applyCanvasSelection(
                reorderedTids.size > 0
                  ? selectionAfterElementEdits(
                      updatedSelection,
                      "next",
                      new Map(),
                      reorderedTids,
                      deps.value19,
                    )
                  : updatedSelection,
                {
                  repush: changedFiles,
                },
              );
              let frameToken: Dynamic =
                focusedFile != null &&
                focusedFile === deps.focusedFileRef.current &&
                settledFiles.has(focusedFile)
                  ? deps.frameSelectionTokensRef.current.get(focusedFile)
                  : undefined;
              frameToken != null &&
                (deps.value31.current = {
                  token: frameToken,
                  at: Date.now(),
                });
            };
          deps.value48.current++;
          deps.value49(runNudge, (): Dynamic => {
            deps.value48.current--;
          });
          return;
        }
        let walkKind: Dynamic =
          source.kind === "enter"
            ? "children"
            : source.kind === "parent"
              ? "parents"
              : source.kind === "all"
                ? "siblings"
                : source.kind;
        deps.value49(async (): Promise<Dynamic> => {
          if (!canNavigate()) return;
          let latestSelection: Dynamic = deps.selectionRef.current;
          if (!isSameStructure(latestSelection)) return;
          deps.value50.current++;
          let selectionEpoch: Dynamic = deps.abandonSelectionGesture(),
            elementEntries: Dynamic = deps.callback(latestSelection),
            childOutlines: Dynamic = (
              walkKind === "children" ? [...latestSelection.artboards] : []
            ).map(async (file?: Dynamic): Promise<Dynamic> => {
              if (
                deps.value73.current.artboards.find(
                  (artboard?: Dynamic): Dynamic => artboard.file === file,
                )?.frameless
              )
                return null;
              let outline: Dynamic = await deps.value177.current
                .get(file)
                ?.ensureOutline();
              return outline
                ? [
                    file,
                    outline
                      .filter(
                        (node?: Dynamic): Dynamic =>
                          !SelectionActionsHelmetScHelmetPattern.test(
                            node.tag,
                          ),
                      )
                      .map((node?: Dynamic): Dynamic => node.tid),
                  ]
                : null;
            }),
            walked: Dynamic = elementEntries.map(
              async ([file, tids]: Dynamic): Promise<Dynamic> => {
                let walkedTids: Dynamic = await deps.value177.current
                  .get(file)
                  ?.walkTids(tids, walkKind);
                return walkedTids == null
                  ? null
                  : [
                      file,
                      walkKind === "parents" && walkedTids.length === 0
                        ? "artboard"
                        : walkedTids,
                    ];
              },
            ),
            [outlineEntries, walkEntries]: Dynamic = await Promise.all([
              Promise.all(childOutlines),
              Promise.all(walked),
            ]);
          if (deps.selectionEpochRef.current !== selectionEpoch) return;
          let nextSelection: Dynamic = selectionAfterElementEdits(
            latestSelection,
            walkKind,
            new Map(
              outlineEntries.filter((entry?: Dynamic): Dynamic => entry != null),
            ),
            new Map(
              walkEntries.filter((entry?: Dynamic): Dynamic => entry != null),
            ),
            deps.value19,
          );
          if (nextSelection === latestSelection) return;
          deps.applyCanvasSelection(nextSelection);
          let focusedFile: Dynamic = deps.focusedFileRef.current;
          if (
            walkKind === "children" &&
            !(focusedFile != null && nextSelection.elements.has(focusedFile))
          ) {
            let expandedArtboard: Dynamic = deps.value73.current.artboards.find(
              (artboard?: Dynamic): Dynamic =>
                nextSelection.elements.has(artboard.file) &&
                latestSelection.artboards.has(artboard.file),
            );
            expandedArtboard && (deps.value50.current++, deps.value34(expandedArtboard.file));
          }
        });
      }

/** 删除命令触发时运行：在各画板中移除选中的元素并记录历史；只读、失败或重复行无法删除时提示原因。 */
export function deleteSelectedElements(deps: { readonly abandonSelectionGesture: Dynamic; readonly applyCanvasSelection: Dynamic; readonly selectionRef: Dynamic; readonly value144: Dynamic; readonly value155: Dynamic; readonly value177: Dynamic; readonly value218: Dynamic; readonly value22: Dynamic; readonly value432: Dynamic; readonly value448: Dynamic; readonly value459: Dynamic }, successMessage?: Dynamic, deleteOptions: Dynamic = {}): Dynamic {
        if (
          !sessionAllowsMutation({
            gesturing: deps.value218.current,
            setMoveCommits: deps.value155.current,
          })
        )
          return false;
        let selection: Dynamic = deps.selectionRef.current,
          elementEdits: Dynamic = [...selection.elements].map(
            ([file, entry]: Dynamic): Dynamic => [
              file,
              {
                tids: [...entry.tids],
              },
            ],
          );
        deps.abandonSelectionGesture();
        let boardSelection: Dynamic = deleteOptions.elementsOnly
            ? emptyBoardSelection
            : canvasBoardSelection(selection),
          historyToken: Dynamic =
            boardSelectionCount(boardSelection) > 0 &&
            elementEdits.length > 0
              ? randomSessionToken()
              : undefined,
          boardsPending: Dynamic =
            historyToken !== undefined ? deps.value144(historyToken) : null,
          didDeleteBoards: Dynamic =
            boardSelectionCount(boardSelection) > 0
              ? deps.value459.current(boardSelection, historyToken)
              : false,
          historyGroup: Dynamic = deps.value432.current?.group(
            elementEdits.map(([file]: Dynamic): Dynamic => file),
            {
              bound: historyToken,
            },
          ),
          entries: Dynamic = new Map(deps.value22.current);
        (didDeleteBoards && boardsPending ? boardsPending : Promise.resolve())
          .then(
            (): Dynamic =>
              Promise.all(
                elementEdits.map(
                  ([file, entry]: Dynamic): Dynamic =>
                    (deps.value22.current.get(file) === entries.get(file)
                      ? deps.value177.current
                          .get(file)
                          ?.removeSelection(entry.tids)
                      : Promise.resolve("skipped")
                    )
                      ?.catch((): Dynamic => "failed")
                      .finally((): Dynamic => historyGroup?.settled(file)),
                ),
              ),
          )
          .finally((): Dynamic => historyGroup?.end())
          .then((results?: Dynamic): Dynamic => {
            if (results.length === 0) return;
            let hasSuccess: Dynamic = results.some(
              (result?: Dynamic): Dynamic =>
                result !== "failed" && result !== "skipped" && !!result,
            );
            if (
              results.some((result?: Dynamic): Dynamic => result === "failed")
            ) {
              deps.value448.current(
                hasSuccess
                  ? successMessage + " \u2014 one artboard's delete failed"
                  : uiMessage("canvas.designCanvas.nothingDeletedAnArtboardCould"),
              );
              return;
            }
            let skippedCount: Dynamic = results.filter(
              (result?: Dynamic): Dynamic => result === "skipped",
            ).length;
            if (skippedCount > 0) {
              deps.value448.current(
                selectionActionFailureMessage(
                  "delete",
                  skippedCount,
                  hasSuccess,
                ),
              );
              return;
            }
            results.every((result?: Dynamic): Dynamic => !result)
              ? deps.value448.current(
                  uiMessage("canvas.designCanvas.nothingDeletedRepeatedRowsAre"),
                )
              : announce(
                  results.every(Boolean)
                    ? successMessage
                    : successMessage + " \u2014 repeated rows stayed",
                );
          });
        deps.applyCanvasSelection(
          deleteOptions.elementsOnly
            ? selectionFromBoards(
                canvasBoardSelection(selection),
              )
            : emptyCanvasSelection,
        );
        return true;
      }

/** 复制（Duplicate）命令触发时运行：在各画板内就地复制选中的元素并更新选择，失败或不可复制时提示原因。 */
export function duplicateSelectedElements(deps: { readonly abandonSelectionGesture: Dynamic; readonly selectionRef: Dynamic; readonly value138: Dynamic; readonly value144: Dynamic; readonly value155: Dynamic; readonly value177: Dynamic; readonly value218: Dynamic; readonly value22: Dynamic; readonly value31: Dynamic; readonly value323: Dynamic; readonly value432: Dynamic; readonly value448: Dynamic; readonly value48: Dynamic }, duplicateOptions: Dynamic = {}): Dynamic {
        if (
          !sessionAllowsMutation({
            gesturing: deps.value218.current,
            setMoveCommits: deps.value155.current,
          }) ||
          deps.value48.current > 0
        )
          return false;
        deps.value31.current = null;
        deps.abandonSelectionGesture();
        let elementEdits: Dynamic = deps.value138(),
          boardSelection: Dynamic = duplicateOptions.elementsOnly
            ? emptyBoardSelection
            : canvasBoardSelection(deps.selectionRef.current),
          historyToken: Dynamic =
            boardSelectionCount(boardSelection) > 0 &&
            elementEdits.length > 0
              ? randomSessionToken()
              : undefined,
          boardsPending: Dynamic =
            historyToken !== undefined ? deps.value144(historyToken) : null,
          didDuplicateBoards: Dynamic =
            boardSelectionCount(boardSelection) > 0
              ? deps.value323.current(boardSelection, historyToken)
              : false,
          historyGroup: Dynamic = deps.value432.current?.group(
            elementEdits.map(([file]: Dynamic): Dynamic => file),
            {
              bound: historyToken,
            },
          ),
          entries: Dynamic = new Map(deps.value22.current);
        (didDuplicateBoards && boardsPending ? boardsPending : Promise.resolve())
          .then(
            (): Dynamic =>
              Promise.all(
                elementEdits.map(
                  ([file, entry]: Dynamic): Dynamic =>
                    (deps.value22.current.get(file) === entries.get(file)
                      ? deps.value177.current
                          .get(file)
                          ?.duplicateSelection(entry.tids)
                      : Promise.resolve("skipped")
                    )
                      ?.catch((): Dynamic => "failed")
                      .finally((): Dynamic => historyGroup?.settled(file)),
                ),
              ),
          )
          .finally((): Dynamic => historyGroup?.end())
          .then((results?: Dynamic): Dynamic => {
            let hasSuccess: Dynamic = results.some(
              (result?: Dynamic): Dynamic =>
                result !== "failed" && result !== "skipped" && !!result,
            );
            if (
              results.some((result?: Dynamic): Dynamic => result === "failed")
            ) {
              deps.value448.current(
                hasSuccess
                  ? uiMessage("canvas.designCanvas.duplicatedOneArtboardSDuplicate")
                  : uiMessage("canvas.designCanvas.nothingDuplicatedAnArtboardCould"),
              );
              return;
            }
            let skippedCount: Dynamic = results.filter(
              (result?: Dynamic): Dynamic => result === "skipped",
            ).length;
            if (skippedCount > 0) {
              deps.value448.current(
                selectionActionFailureMessage(
                  "duplicate",
                  skippedCount,
                  hasSuccess,
                ),
              );
              return;
            }
            results.length > 0 &&
              results.every((result?: Dynamic): Dynamic => !result) &&
              deps.value448.current(
                uiMessage("canvas.designCanvas.nothingDuplicatedRepeatedRowsAre"),
              );
          });
        return true;
      }

/** 水平或垂直翻转命令触发时运行：翻转画板内选中的元素，并把选中的画布图形交给标注翻转逻辑；部分失败时提示与播报。 */
export function flipSelectedObjects(deps: { readonly applyCanvasSelection: Dynamic; readonly selectionRef: Dynamic; readonly value144: Dynamic; readonly value149: Dynamic; readonly value150: Dynamic; readonly value155: Dynamic; readonly value177: Dynamic; readonly value19: Dynamic; readonly value218: Dynamic; readonly value224: Dynamic; readonly value432: Dynamic; readonly value448: Dynamic; readonly value45: Dynamic; readonly value46: Dynamic }, axis?: Dynamic, flipOptions: Dynamic = {}): Dynamic {
        if (deps.value149.current) {
          deps.value448.current(flipInProgressMessage + ".");
          return true;
        }
        if (
          !deps.value224.current ||
          !sessionAllowsMutation({
            gesturing: deps.value218.current,
            setMoveCommits: deps.value155.current,
          }) ||
          deps.value150() !== undefined
        )
          return false;
        let selection: Dynamic = deps.selectionRef.current,
          elementEdits: Dynamic = [...selection.elements]
            .filter(
              ([file, entry]: Dynamic): Dynamic =>
                entry.name === deps.value19(file),
            )
            .map(
              ([file, entry]: Dynamic): Dynamic => [
                file,
                {
                  tids: [...entry.tids],
                },
              ],
            ),
          noteIds: Dynamic = flipOptions.elementsOnly
            ? emptyCanvasSelectionFiles
            : selection.notes;
        if (elementEdits.length === 0 && noteIds.size === 0) {
          selection.artboards.size > 0 &&
            deps.value448.current(flipNeedsObjectsMessage);
          return false;
        }
        if (elementEdits.length === 0) return deps.value46.current(noteIds, axis);
        deps.value155.current++;
        deps.value149.current = true;
        let isPending: Dynamic = true,
          finishPending: Dynamic = (): Dynamic => {
            isPending &&
              ((isPending = false),
              (deps.value149.current = false),
              deps.value155.current--);
          },
          timeoutId: Dynamic = (window as Dynamic).setTimeout(
            finishPending,
            artboardRevealSettleTimeoutMs,
          );
        (async (): Promise<Dynamic> => {
          let flipReads: Dynamic = await Promise.all(
              elementEdits.map(
                ([file, entry]: Dynamic): Dynamic =>
                  (
                    deps.value177.current.get(file)?.flipRead(entry.tids) ??
                    Promise.resolve(null)
                  ).catch((): Dynamic => null),
              ),
            ),
            latestSelection: Dynamic = deps.selectionRef.current;
          if (
            !deps.value224.current ||
            deps.value150() !== undefined ||
            elementEdits.some(
              ([file, entry]: Dynamic): Dynamic =>
                latestSelection.elements.get(file)?.tids.join() !==
                entry.tids.join(),
            ) ||
            [...noteIds].some(
              (note?: Dynamic): Dynamic => !latestSelection.notes.has(note),
            )
          )
            return;
          if (
            !isPending ||
            flipReads.some((read?: Dynamic): Dynamic => read === null)
          )
            return void deps.value448.current(
              CouldnTFlipRightNowTryAgainMessage,
            );
          let historyToken: Dynamic =
              noteIds.size > 0
                ? randomSessionToken()
                : undefined,
            notesPending: Dynamic =
              historyToken !== undefined ? deps.value144(historyToken) : null,
            noteFlip: Dynamic =
              noteIds.size > 0
                ? deps.value45.current(noteIds, axis, historyToken)
                : null,
            historyGroup: Dynamic = deps.value432.current?.group(
              elementEdits.map(([file]: Dynamic): Dynamic => file),
              {
                bound: historyToken,
              },
            );
          noteFlip?.flipped && notesPending && (await notesPending);
          let flipResults: Dynamic = await Promise.all(
              elementEdits.map(
                ([file]: Dynamic, index?: Dynamic): Dynamic =>
                  (
                    deps.value177.current
                      .get(file)
                      ?.flipSelection(flipReads[index], axis) ??
                    Promise.resolve(null)
                  )
                    .catch((): Dynamic => null)
                    .finally((): Dynamic => historyGroup?.settled(file)),
              ),
            ).finally((): Dynamic => historyGroup?.end()),
            didFlipElements: Dynamic = flipResults.some(
              (result?: Dynamic): Dynamic => (result?.flipped ?? 0) > 0,
            ),
            didFlip: Dynamic = didFlipElements || noteFlip?.flipped === true,
            hasFailure: Dynamic = flipResults.some(
              (result?: Dynamic): Dynamic =>
                result === null ||
                (result.flipped === 0 &&
                  (result.refused === undefined ||
                    result.refused ===
                      CouldnTFlipRightNowTryAgainMessage)),
            ),
            refusals: Dynamic = [
              ...flipResults.map((result?: Dynamic): Dynamic => result?.refused),
              noteFlip?.refused,
            ].filter((refusal?: Dynamic): Dynamic => refusal !== undefined),
            mainRefusal: Dynamic =
              refusals.find(
                (refusal?: Dynamic): Dynamic =>
                  refusal !== FlippingThisWayWouldnTChangeItMessage,
              ) ?? (didFlip ? undefined : refusals[0]),
            message: Dynamic = hasFailure
              ? didFlip
                ? PartOfTheSelectionCouldnTBeMessage
                : CouldnTFlipRightNowTryAgainMessage
              : mainRefusal !== undefined
                ? partialFlipMessage(
                    mainRefusal,
                    didFlip,
                    GeometryFlipAnnotationsWytKytYtConfig,
                  )
                : undefined;
          didFlipElements &&
            deps.applyCanvasSelection(deps.selectionRef.current, {
              repush: new Set(
                elementEdits.map(([file]: Dynamic): Dynamic => file),
              ),
            });
          !(!hasFailure && flipOptions.then?.(message, didFlip) === true) &&
            (message !== undefined && deps.value448.current(message),
            didFlip &&
              announce(
                flipDirectionAnnouncement(axis),
              ));
        })().finally((): Dynamic => {
          (window as Dynamic).clearTimeout(timeoutId);
          finishPending();
        });
        return true;
      }

/** 从大纲或外部请求选中某画板内的元素时运行：先聚焦画板，再推送元素选择，并报告已落定、被替代或放弃。 */
export function selectElementInArtboard(deps: { readonly abandonSelectionGesture: Dynamic; readonly focusedFileRef: Dynamic; readonly selectionEpochRef: Dynamic; readonly selectionRef: Dynamic; readonly setSelection: Dynamic; readonly value124: Dynamic; readonly value177: Dynamic; readonly value19: Dynamic; readonly value23: Dynamic; readonly value25: Dynamic; readonly value273: Dynamic; readonly value62: Dynamic; readonly value73: Dynamic }, file?: Dynamic,
        tid?: Dynamic,
        onPushed?: Dynamic,
        gestureToken?: Dynamic,
        onSettled?: Dynamic): Dynamic {
        let documentId: Dynamic = deps.value19(file),
          selectionEpoch: Dynamic =
            gestureToken != null
              ? ++deps.selectionEpochRef.current
              : deps.abandonSelectionGesture(),
          release: Dynamic = (): Dynamic => {
            deps.selectionEpochRef.current === selectionEpoch &&
              deps.selectionEpochRef.current++;
          };
        deps.value124(
          deps.value73.current.artboards.some(
            (artboard?: Dynamic): Dynamic =>
              artboard.file === file && artboard.frameless,
          )
            ? file
            : null,
        );
        deps.value62();
        deps.value23.current = true;
        deps.setSelection(emptyCanvasSelection);
        deps.value273(file).then((): Dynamic => {
          let pushCount: Dynamic = 0,
            pollCount: Dynamic = 0,
            lastPushAt: Dynamic = 0,
            poll: Dynamic = (): Dynamic => {
              if (deps.selectionEpochRef.current !== selectionEpoch)
                return onSettled?.("superseded");
              if (
                deps.selectionRef.current.elements
                  .get(file)
                  ?.tids.includes(tid)
              )
                return onSettled?.("landed");
              if (pushCount >= 25 || pollCount++ >= 400) return onSettled?.("gave-up");
              let entry: Dynamic = deps.value177.current.get(file);
              if (onPushed && Date.now() - lastPushAt < 300) {
                (window as Dynamic).setTimeout(poll, 60);
                return;
              }
              deps.focusedFileRef.current === file &&
                entry?.isReady() &&
                (gestureToken == null && (deps.value25.current = file),
                !entry.setShownSelection(null, null, gestureToken) &&
                  gestureToken == null &&
                  (deps.value25.current = null),
                entry.setShownSelection([tid], documentId, gestureToken) &&
                  (pushCount++, (lastPushAt = Date.now()), onPushed?.()));
              (window as Dynamic).setTimeout(poll, 60);
            };
          (window as Dynamic).setTimeout(poll, 60);
        });
        return release;
      }

/** 画板列表或选择变化时计算（useMemo）：生成大纲面板的画板行、选中状态、封面、右键操作与重命名回调。 */
export function buildOutlineArtboardRows(deps: { readonly abandonSelectionGesture: Dynamic; readonly setSelection: Dynamic; readonly value168: Dynamic; readonly value169: Dynamic; readonly value170: Dynamic; readonly value224: Dynamic; readonly value273: Dynamic; readonly value314: Dynamic; readonly value397: Dynamic; readonly value40: Dynamic; readonly value543: Dynamic; readonly value544: Dynamic; readonly value545: Dynamic; readonly value546: Dynamic; readonly value547: Dynamic; readonly value549: Dynamic; readonly value551: Dynamic; readonly value552: Dynamic; readonly value559: Dynamic; readonly value578: Dynamic; readonly value581: Dynamic; readonly value587: Dynamic; readonly value588: Dynamic; readonly value592: Dynamic; readonly value593: Dynamic; readonly value596: Dynamic; readonly value600: Dynamic; readonly value601: Dynamic; readonly value62: Dynamic; readonly value86: Dynamic }): Dynamic {
  return {
        rows: deps.value86.artboards.map(
          (artboard?: Dynamic): Dynamic => ({
            file: artboard.file,
            label: artboard.title ?? artboard.file.replace(/\.dc\.html$/, ""),
          }),
        ),
        selected: deps.value168,
        cover: deps.value601,
        contextActions: deps.value592,
        renaming: deps.value587,
        onRename: (file?: Dynamic, newName?: Dynamic): Dynamic => {
          deps.value588(null);
          newName != null && deps.value224.current && deps.value397(file, newName);
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
        onSelectObject: (noteId?: Dynamic, isToggle?: Dynamic): Dynamic => {
          deps.value224.current &&
            deps.value314(
              boardSelectionItems({
                note: noteId,
              }),
              isToggle ? "toggle" : "replace",
            );
        },
        objectContextActions: deps.value593,
        onToggleOpen: (file?: Dynamic, isOpen?: Dynamic): Dynamic =>
          deps.value544((openSet?: Dynamic): Dynamic => {
            if (openSet.has(file) === isOpen) return openSet;
            let nextOpen: Dynamic = new Set(openSet);
            isOpen ? nextOpen.add(file) : nextOpen.delete(file);
            return nextOpen;
          }),
        onExpandedChange: (file?: Dynamic, isExpanded?: Dynamic): Dynamic =>
          deps.value546(
            (expandedMap?: Dynamic): Dynamic => ({
              ...expandedMap,
              [file]: isExpanded,
            }),
          ),
        onSelectIn: (file?: Dynamic, extend?: Dynamic): Dynamic => {
          deps.value559(file);
          deps.value581(file, extend);
        },
        onFocus: (file?: Dynamic): Dynamic => {
          deps.abandonSelectionGesture();
          deps.value544(
            (openSet?: Dynamic): Dynamic =>
              openSet.has(file) ? openSet : new Set([...openSet, file]),
          );
          deps.value62();
          deps.setSelection(selectionFromArtboards(new Set([file])));
          deps.value273(file);
          deps.value559(file);
          deps.value549.current[file] === null && deps.value40(file);
        },
        onToggleSelected: (file?: Dynamic): Dynamic => deps.value578(file, true),
      };
}
