import { CouldnTFlipRightNowTryAgainMessage } from "../../editor/geometry/flip-elements";
import { FlippingThisWayWouldnTChangeItMessage } from "../../editor/geometry/flip-elements";
import { artboardFlipRefusalMessage as flipNeedsObjectsMessage } from "../../editor/geometry/flip-annotations";
import { flipStillInProgressMessage as flipInProgressMessage } from "../../editor/geometry/flip-annotations";
import { GeometryFlipAnnotationsWytKytYtConfig } from "../../editor/geometry/flip-annotations";
import { ModelModelStateLimit } from "../../editor/model/model-state";
import { PartOfTheSelectionCouldnTBeMessage } from "../../editor/geometry/flip-annotations";
import { SelectionActionsHelmetScHelmetPattern } from "../../editor/selection/actions";
import { announce } from "../../editor/accessibility/announcer";
import { boardSelectionCount } from "../../editor/selection/canvas-selection";
import { boardSelectionItems } from "../../editor/selection/canvas-selection";
import { canNavigateSelection } from "../working-state";
import { canvasBoardSelection } from "../../editor/selection/canvas-selection";
import { emptyBoardSelection } from "../../editor/selection/canvas-selection";
import { emptyCanvasSelection } from "../../editor/selection/canvas-selection";
import { flipDirectionAnnouncement } from "../../editor/accessibility/announcements";
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
import { artboardRevealSettleTimeoutMs, emptyCanvasSelectionFiles } from "./shared";
import { reactChromeTheme as React } from "../../editor/chrome/theme";
import { filterSelectedAnnotations, filterSelectedArtboards } from "../../editor/selection/canvas-selection";
import type { CanvasManifest } from "../manifest-history";
import { canvasSelectionKey, pageAnnouncement, selectionAnnouncement } from "../../editor/accessibility/announcements";
import { isShapeAnnotation } from "../../platform/file-content";

type Ref<T> = { current: T };

/** 朗读切页和选区变化，并复用手势本身已发出的播报。 */
export function useCanvasSelectionAnnouncements(options: {
  selectionKey: string;
  selection: Ref<Dynamic>;
  layerTrees: Ref<Dynamic>;
  manifest: Ref<CanvasManifest>;
  activePage: string;
  firstPage: string;
  pageTitle: string;
  pageMenuOpenedByKeyboard: boolean;
  pageMenuTrigger: Ref<HTMLElement | null>;
  gestureAnnounced: Ref<boolean>;
  selectionGesture: Ref<{ saidSelection(selection: Dynamic): boolean } | null>;
}) {
  const describeSelection = React.useCallback(() => selectionAnnouncement(
    options.selection.current,
    options.layerTrees.current,
    (file: string) => options.manifest.current.artboards.find((artboard) => artboard.file === file)?.title ??
      file.replace(/\.dc\.html$/, ""),
    (id: string) => {
      const annotation = options.manifest.current.annotations?.find((note) => note.id === id);
      if (!annotation || !isShapeAnnotation(annotation)) return "note";
      if (annotation.kind !== "image") return "shape";
      return annotation.video !== undefined ? "video" : "picture";
    },
  ), []);
  const previous: Ref<{ selectionKey: string; page: string; firstPage: string } | null> = React.useRef(null);
  const { selectionKey, activePage, firstPage, gestureAnnounced } = options;
  React.useEffect(() => {
    const before = previous.current;
    previous.current = { selectionKey, page: activePage, firstPage };
    const announced = gestureAnnounced.current;
    gestureAnnounced.current = false;
    if (!before) return;

    const samePage = before.page === activePage ||
      (before.page === "" && activePage === firstPage) ||
      (activePage === "" && before.page === before.firstPage);
    if (!samePage) {
      announce(() => {
        const menuFocused = options.pageMenuOpenedByKeyboard && document.activeElement === options.pageMenuTrigger.current;
        const latestKey = canvasSelectionKey(options.selection.current);
        const messages = [
          menuFocused ? null : pageAnnouncement(options.pageTitle),
          latestKey !== before.selectionKey && latestKey !== "none" ? describeSelection() : null,
        ].filter((message) => message != null);
        return messages.length > 0 ? messages.join(", ") : null;
      }, { ifIdle: true });
      return;
    }
    if (before.selectionKey === selectionKey) return;
    if (announced) {
      announce(() => null, { ifIdle: true });
    } else if (!options.selectionGesture.current?.saidSelection(options.selection.current)) {
      announce(describeSelection, { ifIdle: true });
    }
  }, [selectionKey, activePage, firstPage]);
  React.useEffect(() => {
    gestureAnnounced.current = false;
  });
  return describeSelection;
}

/** 作品清单变化时，清除已经不存在的画板与批注选区。 */
export function useReconcileCanvasSelection({
  manifest, selectedFile, fallbackFile, setSelectedFile, setSelection,
}: {
  manifest: CanvasManifest;
  selectedFile: string | null;
  fallbackFile(): string | null;
  setSelectedFile(file: string | null): void;
  setSelection(update: (previous: Dynamic) => Dynamic): void;
}) {
  React.useEffect(() => {
    const liveFiles = new Set(manifest.artboards.map(({ file }) => file));
    if (selectedFile !== null && !liveFiles.has(selectedFile)) setSelectedFile(fallbackFile());
    const liveNotes = new Set((manifest.annotations ?? []).map(({ id }) => id));
    setSelection((previous) => filterSelectedAnnotations(
      filterSelectedArtboards(previous, (file: string) => liveFiles.has(file)),
      (id: string) => liveNotes.has(id),
    ));
  }, [manifest, selectedFile]);
}

/** 键盘选择导航入口：按 kind 处理全选、方向键微移（含长按节流）、重排层级、进入子级/返回父级/切换兄弟元素，并播报结果。 */
interface NavigateSelectionContext {
  readonly selection: {
    readonly abandonGesture: Dynamic;
    readonly apply: Dynamic;
    readonly snapshotFromState: Dynamic;
    readonly focusedFile: Dynamic;
    readonly epoch: Dynamic;
    readonly current: Dynamic;
    readonly epochAtLastNavigation: Dynamic;
    readonly anchorState: Dynamic;
    readonly clearShown: Dynamic;
  };
  readonly session: {
    readonly pendingCommands: Dynamic;
    readonly hostGesturing: Dynamic;
    readonly pendingOperations: Dynamic;
    readonly enqueueCompletion: Dynamic;
  };
  readonly artboards: {
    readonly entries: Dynamic;
    readonly componentName: Dynamic;
    readonly focusAndReplay: Dynamic;
    readonly markFrameCommandPending: Dynamic;
    readonly nudgeWithHistory: Dynamic;
  };
  readonly history: {
    readonly inlineHistory: Dynamic;
    readonly localDepth: Dynamic;
    readonly limit: Dynamic;
  };
  readonly document: {
    readonly manifest: Dynamic;
    readonly pageContents: Dynamic;
  };
}

export function navigateSelectionByKind(deps: NavigateSelectionContext, source?: Dynamic): Dynamic {
        let canNavigate: Dynamic = (): Dynamic =>
          canNavigateSelection({
            gesturing: deps.session.hostGesturing.current,
            setMoveCommits: deps.session.pendingCommands.current,
          });
        if (!canNavigate()) return;
        let currentSelection: Dynamic = deps.selection.current.current,
          isSameStructure: Dynamic = (selection?: Dynamic): Dynamic =>
            sameSelectionStructure(currentSelection, selection);
        if (source.kind === "all") {
          let navScope: Dynamic = selectionNavigationScope(
            currentSelection,
            false,
          );
          if (navScope === "panel") return;
          if (navScope === "canvas") {
            deps.selection.abandonGesture();
            let manifest: Dynamic = deps.document.pageContents.current;
            deps.selection.apply(
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
                  Date.now() - startedAt > deps.history.limit &&
                  deps.session.pendingOperations.current > 1)
              )
                return;
              let latestSelection: Dynamic = deps.selection.current.current;
              if (!isSameStructure(latestSelection)) return;
              deps.selection.epochAtLastNavigation.current++;
              let selectionEpoch: Dynamic = deps.selection.abandonGesture();
              Date.now() - deps.selection.anchorState.current.at >
                ModelModelStateLimit &&
                (deps.selection.anchorState.current = {
                  at: 0,
                  seq: new Map(),
                  dead: new Set(),
                });
              let nudgeState: Dynamic = deps.selection.anchorState.current;
              nudgeState.at = Date.now();
              let nudgeTargets: Dynamic = deps.selection.snapshotFromState(latestSelection).filter(
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
                  deps.artboards.nudgeWithHistory.current(boardSelection, dx, dy, nudgeState.seq);
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
              let historyGroup: Dynamic = deps.history.inlineHistory.current?.group(targetFiles),
                focusedFile: Dynamic = deps.selection.focusedFile.current,
                settledFiles: Dynamic = new Set(),
                nudgeResults: Dynamic = await Promise.all(
                  nudgeTargets.map(
                    ([file, tids]: Dynamic): Dynamic =>
                      (
                        deps.artboards.entries.current.get(file)?.nudgeSelection(
                          tids,
                          dx,
                          dy,
                          file === focusedFile
                            ? (): Dynamic => {
                                settledFiles.add(file);
                                deps.selection.clearShown(file);
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
                  deps.history.localDepth(targetFile),
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
                deps.selection.epoch.current !== selectionEpoch
              )
                return;
              let updatedSelection: Dynamic = deps.selection.current.current;
              deps.selection.apply(
                reorderedTids.size > 0
                  ? selectionAfterElementEdits(
                      updatedSelection,
                      "next",
                      new Map(),
                      reorderedTids,
                      deps.artboards.componentName,
                    )
                  : updatedSelection,
                {
                  repush: changedFiles,
                },
              );
              if (focusedFile != null && focusedFile === deps.selection.focusedFile.current && settledFiles.has(focusedFile)) {
                deps.artboards.markFrameCommandPending(focusedFile);
              }
            };
          deps.session.pendingOperations.current++;
          deps.session.enqueueCompletion(runNudge, (): Dynamic => {
            deps.session.pendingOperations.current--;
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
        deps.session.enqueueCompletion(async (): Promise<Dynamic> => {
          if (!canNavigate()) return;
          let latestSelection: Dynamic = deps.selection.current.current;
          if (!isSameStructure(latestSelection)) return;
          deps.selection.epochAtLastNavigation.current++;
          let selectionEpoch: Dynamic = deps.selection.abandonGesture(),
            elementEntries: Dynamic = deps.selection.snapshotFromState(latestSelection),
            childOutlines: Dynamic = (
              walkKind === "children" ? [...latestSelection.artboards] : []
            ).map(async (file?: Dynamic): Promise<Dynamic> => {
              if (
                deps.document.manifest.current.artboards.find(
                  (artboard?: Dynamic): Dynamic => artboard.file === file,
                )?.frameless
              )
                return null;
              let outline: Dynamic = await deps.artboards.entries.current
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
                let walkedTids: Dynamic = await deps.artboards.entries.current
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
          if (deps.selection.epoch.current !== selectionEpoch) return;
          let nextSelection: Dynamic = selectionAfterElementEdits(
            latestSelection,
            walkKind,
            new Map(
              outlineEntries.filter((entry?: Dynamic): Dynamic => entry != null),
            ),
            new Map(
              walkEntries.filter((entry?: Dynamic): Dynamic => entry != null),
            ),
            deps.artboards.componentName,
          );
          if (nextSelection === latestSelection) return;
          deps.selection.apply(nextSelection);
          let focusedFile: Dynamic = deps.selection.focusedFile.current;
          if (
            walkKind === "children" &&
            !(focusedFile != null && nextSelection.elements.has(focusedFile))
          ) {
            let expandedArtboard: Dynamic = deps.document.manifest.current.artboards.find(
              (artboard?: Dynamic): Dynamic =>
                nextSelection.elements.has(artboard.file) &&
                latestSelection.artboards.has(artboard.file),
            );
            expandedArtboard && (deps.selection.epochAtLastNavigation.current++, deps.artboards.focusAndReplay(expandedArtboard.file));
          }
        });
      }

/** 删除命令触发时运行：在各画板中移除选中的元素并记录历史；只读、失败或重复行无法删除时提示原因。 */
interface DeleteSelectionContext {
  readonly selection: {
    readonly abandonGesture: Dynamic;
    readonly apply: Dynamic;
    readonly current: Dynamic;
    readonly counts: Dynamic;
  };
  readonly session: {
    readonly waitForBoundOperation: Dynamic;
    readonly pendingCommands: Dynamic;
    readonly hostGesturing: Dynamic;
  };
  readonly artboards: {
    readonly entries: Dynamic;
    readonly deleteObjects: Dynamic;
  };
  readonly history: {
    readonly inlineHistory: Dynamic;
  };
  readonly feedback: {
    readonly showToast: Dynamic;
  };
}

export function deleteSelectedElements(deps: DeleteSelectionContext, successMessage?: Dynamic, deleteOptions: Dynamic = {}): Dynamic {
        if (
          !sessionAllowsMutation({
            gesturing: deps.session.hostGesturing.current,
            setMoveCommits: deps.session.pendingCommands.current,
          })
        )
          return false;
        let selection: Dynamic = deps.selection.current.current,
          elementEdits: Dynamic = [...selection.elements].map(
            ([file, entry]: Dynamic): Dynamic => [
              file,
              {
                tids: [...entry.tids],
              },
            ],
          );
        deps.selection.abandonGesture();
        let boardSelection: Dynamic = deleteOptions.elementsOnly
            ? emptyBoardSelection
            : canvasBoardSelection(selection),
          historyToken: Dynamic =
            boardSelectionCount(boardSelection) > 0 &&
            elementEdits.length > 0
              ? randomSessionToken()
              : undefined,
          boardsPending: Dynamic =
            historyToken !== undefined ? deps.session.waitForBoundOperation(historyToken) : null,
          didDeleteBoards: Dynamic =
            boardSelectionCount(boardSelection) > 0
              ? deps.artboards.deleteObjects.current(boardSelection, historyToken)
              : false,
          historyGroup: Dynamic = deps.history.inlineHistory.current?.group(
            elementEdits.map(([file]: Dynamic): Dynamic => file),
            {
              bound: historyToken,
            },
          ),
          entries: Dynamic = new Map(deps.selection.counts.current);
        (didDeleteBoards && boardsPending ? boardsPending : Promise.resolve())
          .then(
            (): Dynamic =>
              Promise.all(
                elementEdits.map(
                  ([file, entry]: Dynamic): Dynamic =>
                    (deps.selection.counts.current.get(file) === entries.get(file)
                      ? deps.artboards.entries.current
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
              deps.feedback.showToast.current(
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
              deps.feedback.showToast.current(
                selectionActionFailureMessage(
                  "delete",
                  skippedCount,
                  hasSuccess,
                ),
              );
              return;
            }
            results.every((result?: Dynamic): Dynamic => !result)
              ? deps.feedback.showToast.current(
                  uiMessage("canvas.designCanvas.nothingDeletedRepeatedRowsAre"),
                )
              : announce(
                  results.every(Boolean)
                    ? successMessage
                    : successMessage + " \u2014 repeated rows stayed",
                );
          });
        deps.selection.apply(
          deleteOptions.elementsOnly
            ? selectionFromBoards(
                canvasBoardSelection(selection),
              )
            : emptyCanvasSelection,
        );
        return true;
      }

/** 复制（Duplicate）命令触发时运行：在各画板内就地复制选中的元素并更新选择，失败或不可复制时提示原因。 */
interface DuplicateSelectionContext {
  readonly selection: {
    readonly abandonGesture: Dynamic;
    readonly current: Dynamic;
    readonly snapshotElements: Dynamic;
    readonly counts: Dynamic;
    readonly clearFrameCommand: Dynamic;
  };
  readonly session: {
    readonly waitForBoundOperation: Dynamic;
    readonly pendingCommands: Dynamic;
    readonly hostGesturing: Dynamic;
    readonly pendingOperations: Dynamic;
  };
  readonly artboards: {
    readonly entries: Dynamic;
    readonly duplicateBoards: Dynamic;
  };
  readonly history: {
    readonly inlineHistory: Dynamic;
  };
  readonly feedback: {
    readonly showToast: Dynamic;
  };
}

export function duplicateSelectedElements(deps: DuplicateSelectionContext, duplicateOptions: Dynamic = {}): Dynamic {
        if (
          !sessionAllowsMutation({
            gesturing: deps.session.hostGesturing.current,
            setMoveCommits: deps.session.pendingCommands.current,
          }) ||
          deps.session.pendingOperations.current > 0
        )
          return false;
        deps.selection.clearFrameCommand();
        deps.selection.abandonGesture();
        let elementEdits: Dynamic = deps.selection.snapshotElements(),
          boardSelection: Dynamic = duplicateOptions.elementsOnly
            ? emptyBoardSelection
            : canvasBoardSelection(deps.selection.current.current),
          historyToken: Dynamic =
            boardSelectionCount(boardSelection) > 0 &&
            elementEdits.length > 0
              ? randomSessionToken()
              : undefined,
          boardsPending: Dynamic =
            historyToken !== undefined ? deps.session.waitForBoundOperation(historyToken) : null,
          didDuplicateBoards: Dynamic =
            boardSelectionCount(boardSelection) > 0
              ? deps.artboards.duplicateBoards.current(boardSelection, historyToken)
              : false,
          historyGroup: Dynamic = deps.history.inlineHistory.current?.group(
            elementEdits.map(([file]: Dynamic): Dynamic => file),
            {
              bound: historyToken,
            },
          ),
          entries: Dynamic = new Map(deps.selection.counts.current);
        (didDuplicateBoards && boardsPending ? boardsPending : Promise.resolve())
          .then(
            (): Dynamic =>
              Promise.all(
                elementEdits.map(
                  ([file, entry]: Dynamic): Dynamic =>
                    (deps.selection.counts.current.get(file) === entries.get(file)
                      ? deps.artboards.entries.current
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
              deps.feedback.showToast.current(
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
              deps.feedback.showToast.current(
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
              deps.feedback.showToast.current(
                uiMessage("canvas.designCanvas.nothingDuplicatedRepeatedRowsAre"),
              );
          });
        return true;
      }

/** 水平或垂直翻转命令触发时运行：翻转画板内选中的元素，并把选中的画布图形交给标注翻转逻辑；部分失败时提示与播报。 */
interface FlipSelectionContext {
  readonly selection: {
    readonly apply: Dynamic;
    readonly current: Dynamic;
  };
  readonly session: {
    readonly waitForBoundOperation: Dynamic;
    readonly flipInProgress: Dynamic;
    readonly runFlip: Dynamic;
    readonly pendingCommands: Dynamic;
    readonly hostGesturing: Dynamic;
    readonly editing: Dynamic;
  };
  readonly artboards: {
    readonly entries: Dynamic;
    readonly componentName: Dynamic;
  };
  readonly history: {
    readonly flipAnnotationsWithHistory: Dynamic;
    readonly flipSelectedAnnotations: Dynamic;
    readonly inlineHistory: Dynamic;
  };
  readonly feedback: {
    readonly showToast: Dynamic;
  };
}

export function flipSelectedObjects(deps: FlipSelectionContext, axis?: Dynamic, flipOptions: Dynamic = {}): Dynamic {
        if (deps.session.flipInProgress.current) {
          deps.feedback.showToast.current(flipInProgressMessage + ".");
          return true;
        }
        if (
          !deps.session.editing.current ||
          !sessionAllowsMutation({
            gesturing: deps.session.hostGesturing.current,
            setMoveCommits: deps.session.pendingCommands.current,
          }) ||
          deps.session.runFlip() !== undefined
        )
          return false;
        let selection: Dynamic = deps.selection.current.current,
          elementEdits: Dynamic = [...selection.elements]
            .filter(
              ([file, entry]: Dynamic): Dynamic =>
                entry.name === deps.artboards.componentName(file),
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
            deps.feedback.showToast.current(flipNeedsObjectsMessage);
          return false;
        }
        if (elementEdits.length === 0) return deps.history.flipSelectedAnnotations.current(noteIds, axis);
        deps.session.pendingCommands.current++;
        deps.session.flipInProgress.current = true;
        let isPending: Dynamic = true,
          finishPending: Dynamic = (): Dynamic => {
            isPending &&
              ((isPending = false),
              (deps.session.flipInProgress.current = false),
              deps.session.pendingCommands.current--);
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
                    deps.artboards.entries.current.get(file)?.flipRead(entry.tids) ??
                    Promise.resolve(null)
                  ).catch((): Dynamic => null),
              ),
            ),
            latestSelection: Dynamic = deps.selection.current.current;
          if (
            !deps.session.editing.current ||
            deps.session.runFlip() !== undefined ||
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
            return void deps.feedback.showToast.current(
              CouldnTFlipRightNowTryAgainMessage,
            );
          let historyToken: Dynamic =
              noteIds.size > 0
                ? randomSessionToken()
                : undefined,
            notesPending: Dynamic =
              historyToken !== undefined ? deps.session.waitForBoundOperation(historyToken) : null,
            noteFlip: Dynamic =
              noteIds.size > 0
                ? deps.history.flipAnnotationsWithHistory.current(noteIds, axis, historyToken)
                : null,
            historyGroup: Dynamic = deps.history.inlineHistory.current?.group(
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
                    deps.artboards.entries.current
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
            deps.selection.apply(deps.selection.current.current, {
              repush: new Set(
                elementEdits.map(([file]: Dynamic): Dynamic => file),
              ),
            });
          !(!hasFailure && flipOptions.then?.(message, didFlip) === true) &&
            (message !== undefined && deps.feedback.showToast.current(message),
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
interface SelectElementContext {
  readonly selection: {
    readonly abandonGesture: Dynamic;
    readonly epoch: Dynamic;
    readonly current: Dynamic;
    readonly setSelection: Dynamic;
    readonly gestureActive: Dynamic;
    readonly ignoreFrameClear: Dynamic;
    readonly clearFramePick: Dynamic;
  };
  readonly artboards: {
    readonly focusedFile: Dynamic;
    readonly setActiveFile: Dynamic;
    readonly entries: Dynamic;
    readonly componentName: Dynamic;
    readonly focus: Dynamic;
  };
  readonly document: {
    readonly manifest: Dynamic;
  };
}

export function selectElementInArtboard(deps: SelectElementContext, file?: Dynamic,
        tid?: Dynamic,
        onPushed?: Dynamic,
        gestureToken?: Dynamic,
        onSettled?: Dynamic): Dynamic {
        let documentId: Dynamic = deps.artboards.componentName(file),
          selectionEpoch: Dynamic =
            gestureToken != null
              ? ++deps.selection.epoch.current
              : deps.selection.abandonGesture(),
          release: Dynamic = (): Dynamic => {
            deps.selection.epoch.current === selectionEpoch &&
              deps.selection.epoch.current++;
          };
        deps.artboards.setActiveFile(
          deps.document.manifest.current.artboards.some(
            (artboard?: Dynamic): Dynamic =>
              artboard.file === file && artboard.frameless,
          )
            ? file
            : null,
        );
        deps.selection.clearFramePick();
        deps.selection.gestureActive.current = true;
        deps.selection.setSelection(emptyCanvasSelection);
        deps.artboards.focus(file).then((): Dynamic => {
          let pushCount: Dynamic = 0,
            pollCount: Dynamic = 0,
            lastPushAt: Dynamic = 0,
            poll: Dynamic = (): Dynamic => {
              if (deps.selection.epoch.current !== selectionEpoch)
                return onSettled?.("superseded");
              if (
                deps.selection.current.current.elements
                  .get(file)
                  ?.tids.includes(tid)
              )
                return onSettled?.("landed");
              if (pushCount >= 25 || pollCount++ >= 400) return onSettled?.("gave-up");
              let entry: Dynamic = deps.artboards.entries.current.get(file);
              if (onPushed && Date.now() - lastPushAt < 300) {
                (window as Dynamic).setTimeout(poll, 60);
                return;
              }
              deps.artboards.focusedFile.current === file &&
                entry?.isReady() &&
                (gestureToken == null && (deps.selection.ignoreFrameClear.current = file),
                !entry.setShownSelection(null, null, gestureToken) &&
                  gestureToken == null &&
                  (deps.selection.ignoreFrameClear.current = null),
                entry.setShownSelection([tid], documentId, gestureToken) &&
                  (pushCount++, (lastPushAt = Date.now()), onPushed?.()));
              (window as Dynamic).setTimeout(poll, 60);
            };
          (window as Dynamic).setTimeout(poll, 60);
        });
        return release;
      }

/** 画板列表或选择变化时计算（useMemo）：生成大纲面板的画板行、选中状态、封面、右键操作与重命名回调。 */
interface OutlineRowsContext {
  readonly selection: {
    readonly abandonGesture: Dynamic;
    readonly setSelection: Dynamic;
    readonly files: Dynamic;
    readonly notes: Dynamic;
    readonly tidsByFile: Dynamic;
    readonly setBoards: Dynamic;
    readonly selectFrameBoard: Dynamic;
    readonly selectElement: Dynamic;
    readonly clearFramePick: Dynamic;
  };
  readonly artboards: {
    readonly editing: Dynamic;
    readonly focus: Dynamic;
    readonly rename: Dynamic;
    readonly showUnreadable: Dynamic;
    readonly reveal: Dynamic;
    readonly cover: Dynamic;
    readonly pageContents: Dynamic;
  };
  readonly layers: {
    readonly openFiles: Dynamic;
    readonly setOpenFiles: Dynamic;
    readonly expanded: Dynamic;
    readonly setExpanded: Dynamic;
    readonly trees: Dynamic;
    readonly treesRef: Dynamic;
    readonly sidebarScroll: Dynamic;
    readonly keyboardCursor: Dynamic;
    readonly rowFocus: Dynamic;
  };
  readonly rename: {
    readonly request: Dynamic;
    readonly setRequest: Dynamic;
  };
  readonly menus: {
    readonly artboard: Dynamic;
    readonly annotation: Dynamic;
    readonly annotationRows: Dynamic;
  };
}

export function buildOutlineArtboardRows(deps: OutlineRowsContext): Dynamic {
  return {
        rows: deps.artboards.pageContents.artboards.map(
          (artboard?: Dynamic): Dynamic => ({
            file: artboard.file,
            label: artboard.title ?? artboard.file.replace(/\.dc\.html$/, ""),
          }),
        ),
        selected: deps.selection.files,
        cover: deps.artboards.cover,
        contextActions: deps.menus.artboard,
        renaming: deps.rename.request,
        onRename: (file?: Dynamic, newName?: Dynamic): Dynamic => {
          deps.rename.setRequest(null);
          newName != null && deps.artboards.editing.current && deps.artboards.rename(file, newName);
        },
        selectedIn: deps.selection.tidsByFile,
        open: deps.layers.openFiles,
        trees: deps.layers.trees,
        expanded: deps.layers.expanded,
        scroll: deps.layers.sidebarScroll,
        cursor: deps.layers.keyboardCursor,
        revealed: deps.layers.rowFocus,
        objects: deps.menus.annotationRows,
        selectedObjects: deps.selection.notes,
        onSelectObject: (noteId?: Dynamic, isToggle?: Dynamic): Dynamic => {
          deps.artboards.editing.current &&
            deps.selection.setBoards(
              boardSelectionItems({
                note: noteId,
              }),
              isToggle ? "toggle" : "replace",
            );
        },
        objectContextActions: deps.menus.annotation,
        onToggleOpen: (file?: Dynamic, isOpen?: Dynamic): Dynamic =>
          deps.layers.setOpenFiles((openSet?: Dynamic): Dynamic => {
            if (openSet.has(file) === isOpen) return openSet;
            let nextOpen: Dynamic = new Set(openSet);
            isOpen ? nextOpen.add(file) : nextOpen.delete(file);
            return nextOpen;
          }),
        onExpandedChange: (file?: Dynamic, isExpanded?: Dynamic): Dynamic =>
          deps.layers.setExpanded(
            (expandedMap?: Dynamic): Dynamic => ({
              ...expandedMap,
              [file]: isExpanded,
            }),
          ),
        onSelectIn: (file?: Dynamic, extend?: Dynamic): Dynamic => {
          deps.artboards.reveal(file);
          deps.selection.selectElement(file, extend);
        },
        onFocus: (file?: Dynamic): Dynamic => {
          deps.selection.abandonGesture();
          deps.layers.setOpenFiles(
            (openSet?: Dynamic): Dynamic =>
              openSet.has(file) ? openSet : new Set([...openSet, file]),
          );
          deps.selection.clearFramePick();
          deps.selection.setSelection(selectionFromArtboards(new Set([file])));
          deps.artboards.focus(file);
          deps.artboards.reveal(file);
          deps.layers.treesRef.current[file] === null && deps.artboards.showUnreadable(file);
        },
        onToggleSelected: (file?: Dynamic): Dynamic => deps.selection.selectFrameBoard(file, true),
      };
}

/**
 * 选区状态的唯一持有者：当前选区、手势、锚点、焦点与代际计数。
 * selectionRef 在布局阶段同步，供事件回调读取最新选区。
 */
export function useCanvasSelectionState() {
  const [selection, setSelection]: Dynamic = React.useState(emptyCanvasSelection);
  const selectionRef: Ref<Dynamic> = React.useRef(emptyCanvasSelection);
  const selectionCountsRef: Ref<Map<Dynamic, number>> = React.useRef(new Map());
  const selectionGestureActiveRef: Ref<boolean> = React.useRef(false);
  const selectionGestureRef: Ref<Dynamic> = React.useRef(null);
  const frameSelectionRef: Ref<Dynamic> = React.useRef(null);
  const selectionEpochRef: Ref<number> = React.useRef(0);
  const selectionAnchorRef: Ref<Dynamic> = React.useRef(null);
  const selectionFocusRef: Ref<Dynamic> = React.useRef(null);
  const selectionGestureEpochRef: Ref<number> = React.useRef(0);
  // 放弃进行中的选区手势：清锚点与焦点，并让旧手势的异步回调失效。
  const abandonSelectionGesture = React.useCallback(() => {
    selectionGestureRef.current?.abandon();
    selectionAnchorRef.current = null;
    selectionFocusRef.current = null;
    selectionGestureEpochRef.current++;
    return ++selectionEpochRef.current;
  }, []);
  const isSelectionEpochCurrent = React.useCallback(
    (epoch?: number) => selectionEpochRef.current === epoch,
    [],
  );
  React.useLayoutEffect(() => {
    selectionRef.current = selection;
  }, [selection]);
  return {
    selection,
    setSelection,
    selectionRef,
    selectionCountsRef,
    selectionGestureActiveRef,
    selectionGestureRef,
    frameSelectionRef,
    selectionEpochRef,
    selectionAnchorRef,
    selectionFocusRef,
    selectionGestureEpochRef,
    abandonSelectionGesture,
    isSelectionEpochCurrent,
  };
}
