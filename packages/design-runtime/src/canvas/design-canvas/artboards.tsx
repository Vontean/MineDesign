import { ModelModelStateLimit } from "../../editor/model/model-state";
import { minEmbeddedArtboardDimension as minArtboardSize } from "../../platform/file-content";
import { defaultArtboardWidth } from "../../platform/file-content";
import { defaultArtboardHeight } from "../../platform/file-content";
import { PlatformFileContentFilesValue } from "../../platform/file-content";
import { projectFileKey } from "../../platform/file-content";
import { PlatformFileContentHas } from "../../platform/file-content";
import { maxAnnotations } from "../../platform/file-content";
import { maxCanvasItemDimension as maxArtboardSize } from "../../platform/file-content";
import { PlatformFileContentSlice } from "../../platform/file-content";
import { annotationGeometry } from "../../platform/file-content";
import { annotationTextStyle } from "../../platform/file-content";
import { annotationTransformSnapshot } from "../../geometry/selection-transform";
import { annotationVisibleBounds } from "../../platform/file-content";
import { announce } from "../../editor/accessibility/announcer";
import { artboardAppearanceProperties } from "../../platform/file-content";
import { artboardResizeAnnouncement } from "../../editor/accessibility/announcements";
import { artboardTransformSnapshot } from "../../geometry/selection-transform";
import { artboardsDeletedAnnouncement } from "../../editor/accessibility/announcements";
import { blankDcDocument } from "../../platform/file-content";
import { boardSelectionKey } from "../working-state";
import { createPreviewHandle } from "../../preview/evaluation";
import { designAnalyticsEvents } from "../../platform/health-and-analytics";
import { duplicateArtboardTitle } from "../../platform/file-content";
import { emptyCanvasSelection } from "../../editor/selection/canvas-selection";
import { exportHeightTolerance } from "../../export/paper-and-scale";
import { fitContentResultMessage } from "../../editor/accessibility/announcements";
import { frameAnalyticsReporter } from "../../platform/health-and-analytics";
import { getKvClient } from "../../platform/file-content";
import { insertBlankArtboardMarkup } from "../paste-placement";
import { isFillPagedExport } from "../../export/paper-and-scale";
import { isLoadingArtboardHtml } from "../../platform/design-document-adapter";
import { isShapeAnnotation } from "../../platform/file-content";
import { measureExpandedContentHeight } from "../../export/capture-viewport";
import { measureFlowExportHeight } from "../../export/capture-viewport";
import { needsPagedExport } from "../../export/paper-and-scale";
import { neighboringCanvasPageId } from "../page-operations";
import { nextArtboardTitle } from "../../platform/file-content";
import { nudgeCanvasObjects } from "../working-state";
import { objectsDeletedAnnouncement } from "../../editor/accessibility/announcements";
import { pageDeletedAnnouncement } from "../../editor/accessibility/announcements";
import { remainingCanvasPageObjects } from "../page-operations";
import { repairCanvasLaunchAfterDeletion } from "../manifest-history";
import { replaceDesignArtboards } from "../../platform/file-content";
import { replaceDesignPageContents } from "../../platform/file-content";
import { resolveMeasuredExportHeight } from "../../export/paper-and-scale";
import { selectionFromBoards } from "../../editor/selection/canvas-selection";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { uniqueArtboardFile } from "../../platform/file-content";
import { exportAlreadyRunningMessage, staleDeleteFailureMessage } from "./messages";
import { emptyCanvasSelectionFiles } from "./shared";
import { nextArtboardPlacementPoint } from "../paste-placement";

/** 绘制画板或点击新增画板时运行（onDrawArtboard/onAdd）：生成空白 dc 文件与唯一标题，放到指定或下一个位置并选中，失败时提示。 */
export function addBlankArtboard(deps: { readonly savePageSelection: Dynamic; readonly doc: Dynamic; readonly showToast: Dynamic; readonly supportsLoadState: Dynamic; readonly clearDragToast: Dynamic; readonly focusArtboard: Dynamic; readonly placeActive: Dynamic; readonly setTool: Dynamic; readonly resetTool: Dynamic; readonly recordHistory: Dynamic; readonly manifest: Dynamic; readonly placementObstacles: Dynamic; readonly persistManifest: Dynamic }, placement?: Dynamic, markupToInsert?: Dynamic, insertOptions?: Dynamic): Dynamic {
        let files: Dynamic = deps.doc.content().files,
          newFile: Dynamic = uniqueArtboardFile(
            files,
            "Artboard",
            deps.supportsLoadState,
          );
        placement && (deps.placeActive.current = true);
        (async (): Promise<Dynamic> => {
          try {
            let newMarkup: Dynamic = markupToInsert
              ? insertBlankArtboardMarkup(
                  blankDcDocument(),
                  markupToInsert,
                )
              : blankDcDocument();
            await getKvClient().set(
              projectFileKey(newFile),
              newMarkup,
            );
            let otherArtboards: Dynamic = deps.placementObstacles.current.filter(
                (artboard?: Dynamic): Dynamic => artboard.file !== newFile,
              ),
              position: Dynamic =
                placement ?? nextArtboardPlacementPoint(otherArtboards),
              state: Dynamic = {
                file: newFile,
                x: Math.round(position.x),
                y: Math.round(position.y),
                w:
                  placement && placement.w > 0
                    ? placement.w
                    : defaultArtboardWidth,
                h:
                  placement && placement.h > 0
                    ? placement.h
                    : defaultArtboardHeight,
                title:
                  insertOptions?.title ?? nextArtboardTitle(otherArtboards),
                ...deps.savePageSelection(),
              };
            deps.recordHistory.current(
              {
                kind: "add",
                entries: [
                  {
                    file: newFile,
                    src: newMarkup,
                    spec: state,
                  },
                ],
              },
              new Set([newFile]),
              insertOptions?.siblings,
            );
            deps.persistManifest({
              artboards: [
                ...deps.manifest.current.artboards.filter(
                  (artboard?: Dynamic): Dynamic => artboard.file !== newFile,
                ),
                state,
              ],
            });
            insertOptions?.auto !== true &&
              frameAnalyticsReporter(
                designAnalyticsEvents.artboardInserted,
              );
            deps.focusArtboard(newFile);
            deps.setTool("select");
            deps.resetTool((previousCount?: Dynamic): Dynamic => previousCount + 1);
            insertOptions?.doneSay && deps.clearDragToast(insertOptions.doneSay);
          } catch (error: Dynamic) {
            deps.showToast(
              uiMessage("canvas.designCanvas.couldnTAddAnArtboard") + String(error),
              "error",
            );
          }
        })();
        return newFile;
      }

/** 复制快捷键选中画板或画布说明时运行：计算偏移后的位置，交给 onDuplicateObjects 生成副本。 */
export function duplicateSelectedBoards(deps: { readonly duplicateObjects: Dynamic; readonly revealBounds: Dynamic; readonly pageContents: Dynamic; readonly placementObstacles: Dynamic }, selection?: Dynamic, duplicateOptions?: Dynamic): Dynamic {
        let selectedArtboards: Dynamic = deps.pageContents.current.artboards.filter(
            (artboard?: Dynamic): Dynamic => selection.files.has(artboard.file),
          ),
          selectedNotes: Dynamic = (deps.pageContents.current.annotations ?? []).filter(
            (note?: Dynamic): Dynamic => selection.notes.has(note.id),
          ),
          selectedObjects: Dynamic = [
            ...selectedArtboards,
            ...selectedNotes.map(annotationVisibleBounds),
          ];
        if (selectedObjects.length === 0) return false;
        let [minX, minY]: Dynamic = [
            Math.min(...selectedObjects.map((box?: Dynamic): Dynamic => box.x)),
            Math.min(...selectedObjects.map((box?: Dynamic): Dynamic => box.y)),
          ],
          targetOrigin: Dynamic =
            selectedArtboards.length > 0
              ? nextArtboardPlacementPoint(deps.placementObstacles.current)
              : {
                  x: minX + 24,
                  y: minY + 24,
                },
          [offsetX, offsetY]: Dynamic = [
            targetOrigin.x - minX,
            targetOrigin.y - minY,
          ];
        deps.revealBounds.current({
          x: targetOrigin.x,
          y: targetOrigin.y,
          w:
            Math.max(
              ...selectedObjects.map(
                (box?: Dynamic): Dynamic => box.x + box.w,
              ),
            ) - minX,
          h:
            Math.max(
              ...selectedObjects.map(
                (box?: Dynamic): Dynamic => box.y + box.h,
              ),
            ) - minY,
        });
        return deps.duplicateObjects.current(
          selectedArtboards.map(
            (artboard?: Dynamic): Dynamic => ({
              file: artboard.file,
              x: artboard.x + offsetX,
              y: artboard.y + offsetY,
            }),
          ),
          selectedNotes.map(
            (note?: Dynamic): Dynamic => ({
              id: note.id,
              x: note.x + offsetX,
              y: note.y + offsetY,
            }),
          ),
          duplicateOptions,
        );
      }

/** 复制画板时运行：为每个画板写入新的 dc 文件与唯一标题，放到指定位置并选中，记录分析事件，失败时提示。 */
export function duplicateArtboardFiles(deps: { readonly createNotes: Dynamic; readonly doc: Dynamic; readonly setSelection: Dynamic; readonly showToast: Dynamic; readonly supportsLoadState: Dynamic; readonly finishBoundOperation: Dynamic; readonly boundSelections: Dynamic; readonly artboardEntries: Dynamic; readonly recordHistory: Dynamic; readonly manifest: Dynamic; readonly pageContents: Dynamic; readonly persistManifest: Dynamic }, artboardCopies?: Dynamic,
        notesToCopy: Dynamic = [],
        sessionKey?: Dynamic,
        keepSelectionForSession: Dynamic = false): Dynamic {
        let selectionSessionKey: Dynamic =
          keepSelectionForSession && sessionKey !== undefined ? sessionKey : undefined;
        (async (): Promise<Dynamic> => {
          try {
            let sourceEntries: Dynamic = artboardCopies.flatMap(
              (copyRequest?: Dynamic): Dynamic => {
                let sourceArtboard: Dynamic = deps.manifest.current.artboards.find(
                  (artboard?: Dynamic): Dynamic => artboard.file === copyRequest.file,
                );
                return sourceArtboard
                  ? [
                      {
                        a: sourceArtboard,
                        x: copyRequest.x,
                        y: copyRequest.y,
                        title: copyRequest.title,
                      },
                    ]
                  : [];
              },
            );
            if (sourceEntries.length === 0) return;
            if (
              Object.keys(deps.doc.content().files).length + sourceEntries.length >
              PlatformFileContentFilesValue
            ) {
              deps.showToast(
                uiMessage("canvas.designCanvas.couldnTDuplicateTheCanvas") +
                  String(PlatformFileContentFilesValue) +
                  "-file limit; delete something first",
                "error",
              );
              return;
            }
            await Promise.all(
              sourceEntries.map(
                (sourceEntry?: Dynamic): Dynamic =>
                  deps.artboardEntries.current.get(sourceEntry.a.file)?.flushPending(),
              ),
            );
            let state: Dynamic = {
                ...deps.doc.content().files,
              },
              newEntries: Dynamic = [];
            for (let {
              a: originalArtboard,
              x: copyX,
              y: copyY,
              title: requestedTitle,
            } of sourceEntries as Dynamic) {
              let artboardSource: Dynamic =
                (await getKvClient().get(
                  projectFileKey(originalArtboard.file),
                )) ?? state[originalArtboard.file];
              if (
                typeof artboardSource != "string" ||
                isLoadingArtboardHtml(artboardSource)
              ) {
                let artboardLabel: Dynamic =
                  sourceEntries.length === 1 ? uiMessage("canvas.designCanvas.theArtboard") : uiMessage("canvas.designCanvas.anArtboard");
                deps.showToast(
                  typeof artboardSource == "string"
                    ? uiMessage("canvas.designCanvas.couldnTDuplicate") +
                        artboardLabel +
                        " is still loading"
                    : uiMessage("canvas.designCanvas.couldnTDuplicate") +
                        artboardLabel +
                        " has no source",
                  "error",
                );
                return;
              }
              let baseName: Dynamic = originalArtboard.file.replace(
                  /\.dc\.html$/,
                  "",
                ),
                newFile: Dynamic = uniqueArtboardFile(
                  state,
                  baseName,
                  deps.supportsLoadState,
                );
              state[newFile] = artboardSource;
              let newSpec: Dynamic = {
                file: newFile,
                x: Math.round(copyX),
                y: Math.round(copyY),
                w: originalArtboard.w,
                h: originalArtboard.h,
                title:
                  PlatformFileContentSlice(requestedTitle) ??
                  duplicateArtboardTitle(
                    originalArtboard.title ?? baseName,
                    [
                      ...deps.pageContents.current.artboards,
                      ...newEntries.map(
                        (newEntry?: Dynamic): Dynamic => newEntry.spec,
                      ),
                    ],
                  ),
                ...artboardAppearanceProperties(originalArtboard),
                ...(originalArtboard.page
                  ? {
                      page: originalArtboard.page,
                    }
                  : {}),
              };
              newEntries.push({
                file: newFile,
                src: artboardSource,
                spec: newSpec,
              });
            }
            let values: Dynamic = new Set();
            try {
              for (let entry of newEntries as Dynamic) {
                await getKvClient().set(
                  projectFileKey(entry.file),
                  entry.src,
                );
                values.add(entry.file);
              }
            } catch (error: Dynamic) {
              for (let writtenFile of values as Dynamic)
                await getKvClient()
                  .delete(projectFileKey(writtenFile))
                  .catch((): Dynamic => false);
              throw error;
            }
            let canCopyNotes: Dynamic =
                (deps.manifest.current.annotations ?? []).length + notesToCopy.length <=
                maxAnnotations,
              newNotes: Dynamic = canCopyNotes ? deps.createNotes(notesToCopy) : [];
            !canCopyNotes &&
              notesToCopy.length > 0 &&
              deps.showToast(
                uiMessage("canvas.designCanvas.theArtboardsWereCopiedThe") +
                  String(maxAnnotations) +
                  ").",
                "error",
              );
            deps.persistManifest({
              artboards: [
                ...deps.manifest.current.artboards.filter(
                  (artboard?: Dynamic): Dynamic => !values.has(artboard.file),
                ),
                ...newEntries.map((newEntry?: Dynamic): Dynamic => newEntry.spec),
              ],
              ...(newNotes.length > 0
                ? {
                    annotations: [
                      ...(deps.manifest.current.annotations ?? []),
                      ...newNotes,
                    ],
                  }
                : {}),
            });
            deps.recordHistory(
              {
                kind: "add",
                entries: newEntries,
                ...(newNotes.length > 0
                  ? {
                      anns: [...newNotes],
                    }
                  : {}),
              },
              values,
              undefined,
              sessionKey,
            );
            selectionSessionKey !== undefined
              ? deps.boundSelections.current.set(selectionSessionKey, {
                  files: values,
                  notes: new Set(
                    newNotes.map((note?: Dynamic): Dynamic => note.id),
                  ),
                })
              : deps.setSelection(
                  selectionFromBoards({
                    files: values,
                    notes: new Set(
                      newNotes.map((note?: Dynamic): Dynamic => note.id),
                    ),
                  }),
                );
            values.size > 0 &&
              frameAnalyticsReporter(
                designAnalyticsEvents.artboardInserted,
              );
          } catch (error: Dynamic) {
            deps.showToast(uiMessage("canvas.designCanvas.couldnTDuplicate2") + String(error), "error");
          } finally {
            selectionSessionKey !== undefined &&
              !deps.boundSelections.current.has(selectionSessionKey) &&
              deps.boundSelections.current.set(selectionSessionKey, {
                files: new Set(),
                notes: new Set(),
              });
            sessionKey !== undefined && deps.finishBoundOperation.current.get(sessionKey)?.();
          }
        })();
      }

/** onDuplicateObjects 的实现（Alt 拖动或复制快捷键）：在给定位置复制画板与画布说明，并更新选择。 */
export function duplicateBoardsAndNotes(deps: { readonly createNotes: Dynamic; readonly setSelection: Dynamic; readonly finishBoundOperation: Dynamic; readonly boundSelections: Dynamic; readonly showDragToast: Dynamic; readonly duplicateAnnotation: Dynamic; readonly duplicateArtboardFiles: Dynamic; readonly recordHistory: Dynamic; readonly clearFramePick: Dynamic; readonly manifest: Dynamic; readonly persistManifest: Dynamic }, artboardMoves?: Dynamic,
        noteMoves?: Dynamic,
        sessionKey?: Dynamic,
        keepSelectionForSession: Dynamic = false): Dynamic {
        if (artboardMoves.length === 0 && noteMoves.length === 1) {
          let singleNote: Dynamic = noteMoves[0];
          return deps.duplicateAnnotation(
            singleNote.id,
            singleNote.x,
            singleNote.y,
            sessionKey,
            keepSelectionForSession,
          );
        }
        let selectionSessionKey: Dynamic =
            keepSelectionForSession && sessionKey !== undefined ? sessionKey : undefined,
          annotations: Dynamic = deps.manifest.current.annotations ?? [],
          noteCopies: Dynamic = noteMoves.flatMap((noteMove?: Dynamic): Dynamic => {
            let sourceNote: Dynamic = annotations.find(
              (annotation?: Dynamic): Dynamic => annotation.id === noteMove.id,
            );
            return sourceNote
              ? [
                  {
                    src: sourceNote,
                    x: noteMove.x,
                    y: noteMove.y,
                  },
                ]
              : [];
          }),
          finishWithoutCopy: Dynamic = (): Dynamic => (
            selectionSessionKey !== undefined &&
              deps.boundSelections.current.set(selectionSessionKey, {
                files: new Set(),
                notes: new Set(),
              }),
            sessionKey !== undefined && deps.finishBoundOperation.current.get(sessionKey)?.(),
            false
          );
        if (
          noteCopies.length > 0 &&
          annotations.length + noteCopies.length >
            maxAnnotations
        ) {
          deps.showDragToast(
            uiMessage("canvas.designCanvas.couldnTCopyThisCanvas") +
              String(maxAnnotations) +
              ").",
          );
          return finishWithoutCopy();
        }
        let artboardsToCopy: Dynamic = artboardMoves.filter(
          (artboardMove?: Dynamic): Dynamic =>
            deps.manifest.current.artboards.some(
              (artboard?: Dynamic): Dynamic => artboard.file === artboardMove.file,
            ),
        );
        if (artboardsToCopy.length > 0) {
          deps.duplicateArtboardFiles(artboardsToCopy, noteCopies, sessionKey, keepSelectionForSession);
          return true;
        }
        let newNotes: Dynamic = deps.createNotes(noteCopies);
        return newNotes.length === 0
          ? finishWithoutCopy()
          : (deps.recordHistory.current(
              {
                kind: "add",
                entries: [],
                anns: newNotes,
              },
              new Set(),
              undefined,
              sessionKey,
            ),
            deps.persistManifest({
              ...deps.manifest.current,
              annotations: [...annotations, ...newNotes],
            }),
            selectionSessionKey !== undefined
              ? deps.boundSelections.current.set(selectionSessionKey, {
                  files: new Set(),
                  notes: new Set(
                    newNotes.map((note?: Dynamic): Dynamic => note.id),
                  ),
                })
              : (deps.clearFramePick(),
                deps.setSelection(
                  selectionFromBoards({
                    files: emptyCanvasSelectionFiles,
                    notes: new Set(
                      newNotes.map((note?: Dynamic): Dynamic => note.id),
                    ),
                  }),
                )),
            true);
      }

/** 在画板属性中输入宽高时运行：按上下限钳制尺寸，写回清单并播报调整结果。 */
export function resizeArtboardFromInput(deps: { readonly record: Dynamic; readonly setPreview: Dynamic; readonly saved: Dynamic; readonly current: Dynamic; readonly persist: Dynamic }, file?: Dynamic, newSize?: Dynamic, shouldRecordHistory?: Dynamic): Dynamic {
        let artboard: Dynamic = deps.current.current.artboards.find(
          (item?: Dynamic): Dynamic => item.file === file,
        );
        if (
          !artboard ||
          !Number.isFinite(newSize.w ?? 0) ||
          !Number.isFinite(newSize.h ?? 0)
        )
          return;
        let clampSize: Dynamic = (
            requested?: Dynamic,
            fallback?: Dynamic,
          ): Dynamic =>
            requested === undefined
              ? fallback
              : Math.min(
                  maxArtboardSize,
                  Math.max(
                    minArtboardSize,
                    Math.round(requested),
                  ),
                ),
          newWidth: Dynamic = clampSize(newSize.w, artboard.w),
          newHeight: Dynamic = clampSize(newSize.h, artboard.h),
          resizedArtboards: Dynamic = deps.current.current.artboards.map(
            (item?: Dynamic): Dynamic =>
              item.file === file
                ? {
                    ...item,
                    w: newWidth,
                    h: newHeight,
                  }
                : item,
          );
        if (!shouldRecordHistory) {
          deps.setPreview(
            replaceDesignArtboards(deps.current.current, resizedArtboards),
          );
          return;
        }
        let startArtboard: Dynamic =
          (deps.saved.current ?? deps.current.current).artboards.find(
            (item?: Dynamic): Dynamic => item.file === file,
          ) ?? artboard;
        if (
          Math.round(startArtboard.w) === newWidth &&
          Math.round(startArtboard.h) === newHeight
        ) {
          (artboard.w !== newWidth || artboard.h !== newHeight) &&
            deps.setPreview(
              replaceDesignArtboards(deps.current.current, resizedArtboards),
            );
          return;
        }
        deps.record.current(
          {
            kind: "resize",
            file: file,
            from: {
              x: artboard.x,
              y: artboard.y,
              w: startArtboard.w,
              h: startArtboard.h,
            },
            to: {
              x: artboard.x,
              y: artboard.y,
              w: newWidth,
              h: newHeight,
            },
          },
          new Set(),
        );
        deps.persist({
          artboards: resizedArtboards,
        });
        let announcement: Dynamic = artboardResizeAnnouncement(
          startArtboard,
          {
            w: newWidth,
            h: newHeight,
          },
        );
        announcement != null && announce(announcement);
      }

/** 方向键微移选中的画板或画布说明时运行：更新位置，并把连续微移合并为同一条移动历史。 */
export function nudgeBoardsWithHistory(deps: {
  history: {
    undoTip(): Dynamic;
    localDepth(file: string): number;
    reachable(direction: "undo"): Dynamic;
    invalidateRedo(): void;
    record(step: Dynamic, excluded: Set<string>): void;
  };
  readonly manifest: Dynamic; readonly persistManifest: Dynamic }, selection?: Dynamic,
        nudgeDelta?: Dynamic,
        nudgeContext?: Dynamic,
        depthOverrides?: Dynamic): Dynamic {
        let nudgeResult: Dynamic = nudgeCanvasObjects(
          deps.manifest.current,
          selection,
          nudgeDelta,
          nudgeContext,
        );
        if (!nudgeResult) return false;
        let nudgeKey: Dynamic = boardSelectionKey(selection),
          lastHistoryEntry: Dynamic = deps.history.undoTip(),
          isDepthUnchanged: Dynamic = (): Dynamic =>
            lastHistoryEntry != null &&
            lastHistoryEntry.depths.every(([objectKey, initialDepth]: Dynamic): Dynamic => {
              let currentDepth: Dynamic = deps.history.localDepth(objectKey);
              return depthOverrides.has(objectKey)
                ? currentDepth === depthOverrides.get(objectKey)
                : currentDepth === (initialDepth ?? 0);
            });
        if (
          lastHistoryEntry?.op.kind === "move" &&
          lastHistoryEntry.nudgeKey === nudgeKey &&
          !lastHistoryEntry.sealed &&
          Date.now() - lastHistoryEntry.at < ModelModelStateLimit &&
          (deps.history.reachable("undo") === lastHistoryEntry || isDepthUnchanged()) &&
          nudgeResult.moves.every(
            (move?: Dynamic): Dynamic =>
              lastHistoryEntry.op.kind === "move" &&
              lastHistoryEntry.op.moves.some(
                (historyMove?: Dynamic): Dynamic => historyMove.file === move.file,
              ),
          ) &&
          nudgeResult.anns.every(
            (note?: Dynamic): Dynamic =>
              lastHistoryEntry.op.kind === "move" &&
              (lastHistoryEntry.op.anns ?? []).some(
                (historyNote?: Dynamic): Dynamic => historyNote.id === note.id,
              ),
          )
        ) {
          let moveTargets: Dynamic = new Map(
              nudgeResult.moves.map(
                (move?: Dynamic): Dynamic => [move.file, move.to],
              ),
            ),
            noteTargets: Dynamic = new Map(
              nudgeResult.anns.map(
                (note?: Dynamic): Dynamic => [note.id, note.to],
              ),
            );
          lastHistoryEntry.op = {
            ...lastHistoryEntry.op,
            moves: lastHistoryEntry.op.moves.map(
              (historyMove?: Dynamic): Dynamic => ({
                ...historyMove,
                to: moveTargets.get(historyMove.file) ?? historyMove.to,
              }),
            ),
            ...(lastHistoryEntry.op.anns
              ? {
                  anns: lastHistoryEntry.op.anns.map(
                    (historyNote?: Dynamic): Dynamic => ({
                      ...historyNote,
                      to: noteTargets.get(historyNote.id) ?? historyNote.to,
                    }),
                  ),
                }
              : {}),
          };
          lastHistoryEntry.at = Date.now();
          deps.history.invalidateRedo();
        } else {
          deps.history.record(
            {
              kind: "move",
              moves: nudgeResult.moves,
              ...(nudgeResult.anns.length > 0
                ? {
                    anns: nudgeResult.anns,
                  }
                : {}),
            },
            new Set(),
          );
          let newHistoryEntry: Dynamic =
            deps.history.undoTip();
          newHistoryEntry && (newHistoryEntry.nudgeKey = nudgeKey);
        }
        deps.persistManifest(nudgeResult.manifest);
        return true;
      }

/** 删除选中的画板、画布说明或整个页面时运行：移除文件与清单条目，修复启动画板、切换到相邻页面，并播报与记录分析。 */
export function deleteBoardsAndNotes(deps: { readonly doc: Dynamic; readonly setSelection: Dynamic; readonly showToast: Dynamic; readonly finishBoundOperation: Dynamic; readonly artboardEntries: Dynamic; readonly resolvePageArtboard: Dynamic; readonly recordHistory: Dynamic; readonly manifest: Dynamic; readonly activePage: Dynamic; readonly persistManifest: Dynamic }, fileSet?: Dynamic,
        noteIds: Dynamic = emptyCanvasSelectionFiles,
        sessionKey?: Dynamic,
        pageToDelete?: Dynamic): Dynamic {
        let artboards: Dynamic = deps.manifest.current.artboards,
          artboardsToDelete: Dynamic = artboards.filter(
            (artboard?: Dynamic): Dynamic => fileSet.has(artboard.file),
          );
        return artboardsToDelete.length === 0 && pageToDelete === undefined
          ? false
          : ((async (): Promise<Dynamic> => {
              try {
                let deletedEntries: Dynamic = [],
                  captureArtboard: Dynamic = async (
                    artboard?: Dynamic,
                    allArtboards?: Dynamic,
                  ): Promise<Dynamic> => {
                    await deps.artboardEntries.current.get(artboard.file)?.flushPending();
                    let artboardSource: Dynamic =
                      (await getKvClient().get(
                        projectFileKey(
                          artboard.file,
                        ),
                      )) ??
                      deps.doc.content().files[artboard.file] ??
                      "";
                    deletedEntries.push({
                      file: artboard.file,
                      src: artboardSource,
                      spec: artboard,
                      index: allArtboards.findIndex(
                        (item?: Dynamic): Dynamic =>
                          item.file === artboard.file,
                      ),
                    });
                  };
                for (let artboard of artboardsToDelete as Dynamic)
                  await captureArtboard(artboard, artboards);
                let pageRemainder: Dynamic =
                  pageToDelete !== undefined
                    ? remainingCanvasPageObjects(
                        deps.manifest.current,
                        pageToDelete.spec.id,
                        new Set(
                          deletedEntries.map(
                            (capturedEntry?: Dynamic): Dynamic => capturedEntry.file,
                          ),
                        ),
                        noteIds,
                      )
                    : undefined;
                for (let artboard of (pageRemainder?.artboards ?? []) as Dynamic)
                  await captureArtboard(artboard, deps.manifest.current.artboards);
                let values: Dynamic = new Set(
                    deletedEntries.map((capturedEntry?: Dynamic): Dynamic => capturedEntry.file),
                  ),
                  deletedNoteIds: Dynamic =
                    pageRemainder !== undefined && pageRemainder.notes.length > 0
                      ? new Set([...noteIds, ...pageRemainder.notes])
                      : noteIds,
                  manifest: Dynamic = deps.manifest.current;
                if (
                  pageToDelete !== undefined &&
                  !(manifest.pages ?? []).some(
                    (page?: Dynamic): Dynamic =>
                      page.id !== pageToDelete.spec.id,
                  )
                ) {
                  deps.showToast(staleDeleteFailureMessage(pageToDelete.spec.name));
                  return;
                }
                let deletedNotes: Dynamic = (manifest.annotations ?? []).flatMap(
                    (annotation?: Dynamic, index?: Dynamic): Dynamic =>
                      deletedNoteIds.has(annotation.id)
                        ? [
                            {
                              spec: annotation,
                              index: index,
                            },
                          ]
                        : [],
                  ),
                  deletedCover: Dynamic =
                    manifest.cover !== undefined && values.has(manifest.cover)
                      ? manifest.cover
                      : undefined,
                  launchRepair: Dynamic = repairCanvasLaunchAfterDeletion(
                    manifest,
                    values,
                    pageToDelete?.spec.id,
                  );
                deps.recordHistory(
                  {
                    kind: "delete",
                    entries: deletedEntries,
                    ...(deletedNotes.length > 0
                      ? {
                          anns: deletedNotes,
                        }
                      : {}),
                    ...(deletedCover !== undefined
                      ? {
                          cover: deletedCover,
                        }
                      : {}),
                    ...(launchRepair !== undefined
                      ? {
                          launch: launchRepair,
                        }
                      : {}),
                    ...(pageToDelete !== undefined
                      ? {
                          page: pageToDelete,
                        }
                      : {}),
                  },
                  new Set(
                    deletedEntries.map((capturedEntry?: Dynamic): Dynamic => capturedEntry.file),
                  ),
                  undefined,
                  sessionKey,
                );
                for (let entry of deletedEntries as Dynamic)
                  await getKvClient().delete(
                    projectFileKey(entry.file),
                  );
                let pages: Dynamic = deps.manifest.current.pages ?? [],
                  remainingPages: Dynamic =
                    pageToDelete !== undefined
                      ? pages.filter(
                          (page?: Dynamic): Dynamic =>
                            page.id !== pageToDelete.spec.id,
                        )
                      : [];
                deps.persistManifest({
                  artboards: deps.manifest.current.artboards.filter(
                    (artboard?: Dynamic): Dynamic => !values.has(artboard.file),
                  ),
                  ...(deletedNotes.length > 0
                    ? {
                        annotations: (
                          deps.manifest.current.annotations ?? []
                        ).filter(
                          (note?: Dynamic): Dynamic =>
                            !deletedNoteIds.has(note.id),
                        ),
                      }
                    : {}),
                  ...(remainingPages.length > 0
                    ? {
                        pages: remainingPages,
                      }
                    : {}),
                });
                pageToDelete !== undefined &&
                  remainingPages.length === 0 &&
                  (pageToDelete.relisted = true);
                let isActivePage: Dynamic =
                  pageToDelete !== undefined &&
                  deps.activePage.current === pageToDelete.spec.id;
                pageToDelete !== undefined &&
                  isActivePage &&
                  remainingPages.length > 0 &&
                  deps.resolvePageArtboard(
                    neighboringCanvasPageId(
                      pages,
                      pageToDelete.spec.id,
                    ) ?? remainingPages[0].id,
                  );
                (pageToDelete === undefined || isActivePage) &&
                  deps.setSelection(emptyCanvasSelection);
                announce(
                  pageToDelete !== undefined
                    ? pageDeletedAnnouncement(
                        pageToDelete.spec.name,
                        deletedEntries.length,
                        deletedNotes.length,
                      )
                    : deletedNotes.length > 0
                      ? objectsDeletedAnnouncement(
                          artboardsToDelete.length + deletedNotes.length,
                        )
                      : artboardsDeletedAnnouncement(
                          artboardsToDelete.map(
                            (artboard?: Dynamic): Dynamic =>
                              artboard.title ??
                              artboard.file.replace(/\.dc\.html$/, ""),
                          ),
                        ),
                );
                deletedEntries.length > 0 &&
                  frameAnalyticsReporter(
                    designAnalyticsEvents.artboardDeleted,
                  );
              } catch (error: Dynamic) {
                deps.showToast(
                  uiMessage("canvas.designCanvas.couldnTDeleteThe") +
                    (pageToDelete !== undefined ? "page" : "artboard") +
                    ": " +
                    String(error),
                  "error",
                );
              } finally {
                sessionKey !== undefined && deps.finishBoundOperation.current.get(sessionKey)?.();
              }
            })(),
            true);
      }

/** 执行适应内容高度时运行：测量画板展开后的内容高度并调整画板尺寸，播报变高、变矮或已匹配等结果。 */
interface FitArtboardContentContext {
  readonly artboards: {
    readonly getTitle: Dynamic;
    readonly editable: Dynamic;
    readonly entries: Dynamic;
    readonly updateSettings: Dynamic;
    readonly manifest: Dynamic;
    readonly pageContents: Dynamic;
  };
  readonly capture: {
    readonly waitForFrame: Dynamic;
  };
  readonly execution: {
    readonly setBusy: Dynamic;
    readonly isBusy: Dynamic;
    readonly withPreviewClosed: Dynamic;
  };
  readonly feedback: {
    readonly hideToast: Dynamic;
    readonly showToast: Dynamic;
  };
}

export async function fitArtboardHeightToContent(deps: FitArtboardContentContext, files?: Dynamic, beforeFit?: Dynamic): Promise<Dynamic> {
        if (deps.execution.isBusy()) {
          deps.feedback.showToast(exportAlreadyRunningMessage);
          return;
        }
        beforeFit?.();
        if (!deps.artboards.editable.current) {
          deps.feedback.showToast(
            uiMessage("canvas.designCanvas.thisCanvasIsReadOnly"),
          );
          return;
        }
        deps.execution.setBusy(true);
        let singleArtboard: Dynamic =
            files.length === 1
              ? deps.artboards.manifest.current.artboards.find(
                  (artboard?: Dynamic): Dynamic => artboard.file === files[0],
                )
              : undefined,
          measuringToastId: Dynamic =
            files.length > 1
              ? deps.feedback.showToast(
                  uiMessage("canvas.designCanvas.measuring") + String(files.length) + " artboards\u2026",
                  "info",
                  {
                    pinned: true,
                  },
                )
              : singleArtboard && isFillPagedExport(singleArtboard)
                ? deps.feedback.showToast(
                    uiMessage("canvas.designCanvas.measuring2") + deps.artboards.getTitle(singleArtboard.file) + '"\u2026',
                    "info",
                    {
                      pinned: true,
                    },
                  )
                : undefined,
          outcomes: Dynamic = [],
          artboardLabels: Dynamic = [],
          becameReadOnly: Dynamic = false;
        try {
          await deps.execution.withPreviewClosed(
            files.map(
              (file?: Dynamic): Dynamic => ({
                file: file,
              }),
            ),
            async (): Promise<Dynamic> => {
              for (let file of files as Dynamic) {
                let startArtboard: Dynamic = deps.artboards.manifest.current.artboards.find(
                  (artboard?: Dynamic): Dynamic => artboard.file === file,
                );
                artboardLabels.push(deps.artboards.getTitle(file));
                if (!startArtboard || !needsPagedExport(startArtboard)) {
                  outcomes.push(startArtboard ? "keeps" : "gone");
                  continue;
                }
                let frameElement: Dynamic = await deps.capture.waitForFrame(file),
                  previewHandle: Dynamic = frameElement
                    ? createPreviewHandle(frameElement)
                    : null;
                if (!frameElement || !previewHandle) {
                  outcomes.push(
                    deps.artboards.pageContents.current.artboards.some(
                      (artboard?: Dynamic): Dynamic => artboard.file === file,
                    )
                      ? deps.artboards.entries.current.get(file)?.isBlocked()
                        ? "stopped"
                        : "unmeasured"
                      : "gone",
                  );
                  continue;
                }
                if (frameElement.getBoundingClientRect().width === 0) {
                  outcomes.push("hidden");
                  continue;
                }
                let expandedHeight: Dynamic = await measureExpandedContentHeight(previewHandle, {
                    w: startArtboard.w,
                    h: startArtboard.h,
                  }),
                  flowHeight: Dynamic =
                    typeof expandedHeight == "number" &&
                    expandedHeight <= startArtboard.h + exportHeightTolerance &&
                    isFillPagedExport(startArtboard)
                      ? await measureFlowExportHeight(previewHandle, {
                          w: startArtboard.w,
                          h: startArtboard.h,
                        })
                      : undefined;
                if (!deps.artboards.editable.current) {
                  becameReadOnly = true;
                  break;
                }
                let latestArtboard: Dynamic = deps.artboards.manifest.current.artboards.find(
                  (artboard?: Dynamic): Dynamic => artboard.file === file,
                );
                if (
                  !latestArtboard ||
                  !needsPagedExport(latestArtboard) ||
                  latestArtboard.w !== startArtboard.w
                ) {
                  outcomes.push(
                    latestArtboard
                      ? latestArtboard.w !== startArtboard.w
                        ? "unmeasured"
                        : "keeps"
                      : "gone",
                  );
                  continue;
                }
                if (expandedHeight === null || expandedHeight === "unsettled") {
                  outcomes.push(expandedHeight === null ? "unmeasured" : "unsettled");
                  continue;
                }
                if (
                  flowHeight === "unsettled" ||
                  flowHeight === "empty" ||
                  flowHeight === null
                ) {
                  outcomes.push(
                    flowHeight === "unsettled"
                      ? "unsized"
                      : flowHeight === "empty"
                        ? "empty"
                        : "unmeasured",
                  );
                  continue;
                }
                if (
                  flowHeight !== undefined &&
                  (latestArtboard.h !== startArtboard.h ||
                    !isFillPagedExport(latestArtboard))
                ) {
                  outcomes.push("changed");
                  continue;
                }
                let measuredHeight: Dynamic = resolveMeasuredExportHeight(
                  Math.max(latestArtboard.h, startArtboard.h),
                  expandedHeight,
                  flowHeight,
                );
                typeof measuredHeight == "number" &&
                  deps.artboards.updateSettings(
                    file,
                    {
                      h: measuredHeight,
                    },
                    true,
                  );
                outcomes.push(
                  typeof measuredHeight == "number"
                    ? measuredHeight < latestArtboard.h
                      ? "shrunk"
                      : "grown"
                    : measuredHeight === "fits" && flowHeight !== undefined
                      ? "matches"
                      : measuredHeight,
                );
              }
            },
          );
        } catch (error: Dynamic) {
          console.error("[fit-height]", error);
          outcomes.push("unmeasured");
        } finally {
          deps.execution.setBusy(false);
          measuringToastId !== undefined && deps.feedback.hideToast(measuringToastId);
        }
        if (becameReadOnly) {
          deps.feedback.showToast(
            uiMessage("canvas.designCanvas.thisCanvasIsReadOnly"),
          );
          return;
        }
        let resultMessage: Dynamic = fitContentResultMessage(
          outcomes,
          artboardLabels,
        );
        resultMessage !== null &&
          (outcomes.every(
            (outcome?: Dynamic): Dynamic =>
              outcome === "grown" || outcome === "shrunk",
          )
            ? announce(resultMessage)
            : deps.feedback.showToast(resultMessage));
      }

/** 交互层（onManifestChange）拖动、缩放或旋转画板与画布图形时运行：预览期间只更新状态，提交时写回页面清单并记录移动、缩放、变换历史与播报。 */
export function commitInteractionLayerChange(deps: { readonly boundMoveRecords: Dynamic; readonly selectedNoteIds: Dynamic; readonly recordHistory: Dynamic; readonly manifestState: Dynamic; readonly setManifestState: Dynamic; readonly previousManifest: Dynamic; readonly serializeManifest: Dynamic; readonly manifest: Dynamic; readonly activePage: Dynamic; readonly persistManifest: Dynamic }, pageContents?: Dynamic,
                      isCommit?: Dynamic,
                      changeInfo?: Dynamic): Dynamic {
                      let updatedManifest: Dynamic = replaceDesignPageContents(
                          deps.manifest.current,
                          deps.activePage.current,
                          pageContents,
                        ),
                        nextManifest: Dynamic = isCommit
                          ? deps.serializeManifest(updatedManifest)
                          : updatedManifest;
                      if (!isCommit) {
                        deps.manifest.current = nextManifest;
                        deps.setManifestState(nextManifest);
                        return;
                      }
                      let {
                          moved: movedFrom,
                          resizedFrom: resizedFromBoard,
                          movedNotes: movedNotesFrom,
                          transformed: transformedFrom,
                        }: Dynamic = changeInfo ?? {},
                        hasMoved: Dynamic = (
                          before?: Dynamic,
                          after?: Dynamic,
                        ): Dynamic =>
                          Math.round(before.x) !== Math.round(after.x) ||
                          Math.round(before.y) !== Math.round(after.y),
                        boardMoves: Dynamic = nextManifest.artboards.flatMap(
                          (artboard?: Dynamic): Dynamic => {
                            let previous: Dynamic = movedFrom?.get(
                              artboard.file,
                            );
                            return previous && hasMoved(previous, artboard)
                              ? [
                                  {
                                    file: artboard.file,
                                    from: {
                                      x: previous.x,
                                      y: previous.y,
                                    },
                                    to: {
                                      x: artboard.x,
                                      y: artboard.y,
                                    },
                                  },
                                ]
                              : [];
                          },
                        ),
                        noteMoves: Dynamic = (
                          nextManifest.annotations ?? []
                        ).flatMap((note?: Dynamic): Dynamic => {
                          let previous: Dynamic = movedNotesFrom?.get(note.id);
                          return previous && hasMoved(previous, note)
                            ? [
                                {
                                  id: note.id,
                                  from: {
                                    x: previous.x,
                                    y: previous.y,
                                  },
                                  to: {
                                    x: note.x,
                                    y: note.y,
                                  },
                                },
                              ]
                            : [];
                        }),
                        noteMovesToRecord: Dynamic =
                          noteMoves.length > 1 ||
                          (noteMoves.length > 0 && boardMoves.length > 0) ||
                          (noteMoves.length > 0 &&
                            changeInfo?.bound !== undefined)
                            ? noteMoves
                            : [],
                        boundHandler: Dynamic =
                          changeInfo?.bound !== undefined
                            ? deps.boundMoveRecords.current.get(changeInfo.bound)
                            : undefined;
                      boundHandler
                        ? boundHandler({
                            moves: boardMoves,
                            annMoves: noteMovesToRecord,
                          })
                        : (boardMoves.length > 0 || noteMovesToRecord.length > 0) &&
                          deps.recordHistory(
                            {
                              kind: "move",
                              moves: boardMoves,
                              ...(noteMovesToRecord.length > 0
                                ? {
                                    anns: noteMovesToRecord,
                                  }
                                : {}),
                            },
                            new Set(),
                            undefined,
                            changeInfo?.bound,
                          );
                      let values: Dynamic = new Set(
                        noteMovesToRecord.map(
                          (noteMove?: Dynamic): Dynamic => noteMove.id,
                        ),
                      );
                      if (transformedFrom) {
                        let diffTransform: Dynamic = (
                            before?: Dynamic,
                            after?: Dynamic,
                          ): Dynamic => {
                            let changedKeys: Dynamic = Object.keys(
                              before,
                            ).filter(
                              (key?: Dynamic): Dynamic =>
                                transformedFrom.keys.has(key) &&
                                before[key] !== after[key],
                            );
                            return changedKeys.length === 0
                              ? null
                              : {
                                  from: Object.fromEntries(
                                    changedKeys.map(
                                      (key?: Dynamic): Dynamic => [
                                        key,
                                        before[key],
                                      ],
                                    ),
                                  ),
                                  to: Object.fromEntries(
                                    changedKeys.map(
                                      (key?: Dynamic): Dynamic => [
                                        key,
                                        after[key],
                                      ],
                                    ),
                                  ),
                                };
                          },
                          boardTransforms: Dynamic = nextManifest.artboards.flatMap(
                            (artboard?: Dynamic): Dynamic => {
                              let entry: Dynamic = transformedFrom.boards.get(
                                  artboard.file,
                                ),
                                diff: Dynamic =
                                  entry &&
                                  diffTransform(
                                    artboardTransformSnapshot(
                                      entry,
                                    ),
                                    artboardTransformSnapshot(
                                      artboard,
                                    ),
                                  );
                              return diff
                                ? [
                                    {
                                      file: artboard.file,
                                      ...diff,
                                    },
                                  ]
                                : [];
                            },
                          ),
                          noteTransforms: Dynamic = (
                            nextManifest.annotations ?? []
                          ).flatMap((note?: Dynamic): Dynamic => {
                            let entry: Dynamic = transformedFrom.notes.get(
                                note.id,
                              ),
                              diff: Dynamic =
                                entry &&
                                diffTransform(
                                  annotationTransformSnapshot(
                                    entry,
                                  ),
                                  annotationTransformSnapshot(
                                    note,
                                  ),
                                );
                            return diff
                              ? [
                                  {
                                    id: note.id,
                                    ...diff,
                                  },
                                ]
                              : [];
                          });
                        if (boardTransforms.length === 0 && noteTransforms.length === 0) {
                          deps.setManifestState(nextManifest);
                          return;
                        }
                        deps.recordHistory(
                          {
                            kind: "transform",
                            label: transformedFrom.label,
                            boards: boardTransforms,
                            anns: noteTransforms,
                          },
                          new Set(),
                        );
                        for (let noteId of transformedFrom.notes.keys() as Dynamic)
                          values.add(noteId);
                      }
                      let resizeStart: Dynamic = resizedFromBoard,
                        resizedBoard: Dynamic = resizeStart
                          ? nextManifest.artboards.find(
                              (artboard?: Dynamic): Dynamic =>
                                artboard.file === resizeStart.file &&
                                (Math.round(resizeStart.w) !==
                                  Math.round(artboard.w) ||
                                  Math.round(resizeStart.h) !==
                                    Math.round(artboard.h)),
                            )
                          : undefined;
                      resizeStart &&
                        resizedBoard &&
                        deps.recordHistory(
                          {
                            kind: "resize",
                            file: resizedBoard.file,
                            from: {
                              x: resizeStart.x,
                              y: resizeStart.y,
                              w: resizeStart.w,
                              h: resizeStart.h,
                            },
                            to: {
                              x: resizedBoard.x,
                              y: resizedBoard.y,
                              w: resizedBoard.w,
                              h: resizedBoard.h,
                            },
                          },
                          new Set(),
                        );
                      let previousNotes: Dynamic =
                          (deps.previousManifest.current ?? deps.manifestState).annotations ?? [],
                        currentNotes: Dynamic = nextManifest.annotations ?? [],
                        findChangedNote: Dynamic = (isChanged?: Dynamic): Dynamic => {
                          for (let currentNote of currentNotes as Dynamic) {
                            let previousNote: Dynamic = values.has(currentNote.id)
                              ? undefined
                              : previousNotes.find(
                                  (note?: Dynamic): Dynamic =>
                                    note.id === currentNote.id,
                                );
                            if (
                              previousNote &&
                              !isShapeAnnotation(previousNote) &&
                              !isShapeAnnotation(currentNote) &&
                              isChanged(previousNote, currentNote)
                            )
                              return [previousNote, currentNote];
                          }
                          return null;
                        },
                        findChangedShape: Dynamic = (isChanged?: Dynamic): Dynamic => {
                          for (let currentNote of currentNotes as Dynamic) {
                            let previousNote: Dynamic = values.has(currentNote.id)
                              ? undefined
                              : previousNotes.find(
                                  (note?: Dynamic): Dynamic =>
                                    note.id === currentNote.id,
                                );
                            if (
                              previousNote &&
                              isShapeAnnotation(previousNote) &&
                              isShapeAnnotation(currentNote) &&
                              isChanged(previousNote, currentNote)
                            )
                              return [previousNote, currentNote];
                          }
                          return null;
                        },
                        penGeometry: Dynamic = (
                          shape?: Dynamic,
                        ): Dynamic => ({
                          x: shape.x,
                          y: shape.y,
                          w: shape.w,
                          h: shape.h,
                          d: shape.d,
                        }),
                        changedPen: Dynamic = findChangedShape(
                          (beforeShape?: Dynamic, afterShape?: Dynamic): Dynamic =>
                            beforeShape.kind === "pen" &&
                            afterShape.kind === "pen" &&
                            beforeShape.d !== afterShape.d,
                        );
                      changedPen &&
                        changedPen[0].kind === "pen" &&
                        changedPen[1].kind === "pen" &&
                        deps.recordHistory(
                          {
                            kind: "ann-path",
                            id: changedPen[1].id,
                            from: penGeometry(changedPen[0]),
                            to: penGeometry(changedPen[1]),
                          },
                          new Set(),
                        );
                      let geometryKey: Dynamic = (shape?: Dynamic): Dynamic =>
                          JSON.stringify(
                            Object.values(
                              annotationGeometry(shape),
                            ).map(Math.round as Dynamic),
                          ),
                        changedBox: Dynamic = findChangedShape(
                          (before?: Dynamic, after?: Dynamic): Dynamic =>
                            geometryKey(before) !== geometryKey(after) &&
                            after.id !== changedPen?.[1].id,
                        ),
                        changedCrop: Dynamic = findChangedShape(
                          (beforeShape?: Dynamic, afterShape?: Dynamic): Dynamic =>
                            beforeShape.kind === "image" &&
                            afterShape.kind === "image" &&
                            JSON.stringify(beforeShape.crop ?? null) !==
                              JSON.stringify(afterShape.crop ?? null),
                        ),
                        isCropWithBoxChange: Dynamic =
                          changedCrop !== null &&
                          changedBox !== null &&
                          changedBox[1].id === changedCrop[1].id;
                      changedBox &&
                        !isCropWithBoxChange &&
                        deps.recordHistory(
                          {
                            kind: "ann-box",
                            id: changedBox[1].id,
                            from: annotationGeometry(
                              changedBox[0],
                            ),
                            to: annotationGeometry(changedBox[1]),
                          },
                          new Set(),
                        );
                      let cssKey: Dynamic = (shape?: Dynamic): Dynamic =>
                          JSON.stringify(shape.css ?? null),
                        changedColor: Dynamic = findChangedShape(
                          (before?: Dynamic, after?: Dynamic): Dynamic =>
                            (before.color ?? "default") !==
                            (after.color ?? "default"),
                        ),
                        changedCss: Dynamic = findChangedShape(
                          (before?: Dynamic, after?: Dynamic): Dynamic =>
                            cssKey(before) !== cssKey(after),
                        );
                      if (changedCrop) {
                        let [cropBefore, cropAfter]: Dynamic = changedCrop;
                        deps.recordHistory(
                          {
                            kind: "ann-crop",
                            id: cropAfter.id,
                            from: cropBefore.crop,
                            to: cropAfter.crop,
                            ...(cssKey(cropBefore) !== cssKey(cropAfter)
                              ? {
                                  cssFrom: cropBefore.css,
                                  cssTo: cropAfter.css,
                                }
                              : {}),
                            ...(isCropWithBoxChange
                              ? {
                                  geomFrom: annotationGeometry(
                                    cropBefore,
                                  ),
                                  geomTo: annotationGeometry(
                                    cropAfter,
                                  ),
                                }
                              : {}),
                          },
                          new Set(),
                        );
                      } else
                        changedColor
                          ? deps.recordHistory(
                              {
                                kind: "ann-color",
                                id: changedColor[1].id,
                                from: changedColor[0].color ?? "default",
                                to: changedColor[1].color ?? "default",
                                ...(changedCss
                                  ? {
                                      cssFrom: changedColor[0].css,
                                      cssTo: changedColor[1].css,
                                    }
                                  : {}),
                              },
                              new Set(),
                            )
                          : changedCss &&
                            deps.recordHistory(
                              {
                                kind: "ann-css",
                                id: changedCss[1].id,
                                from: changedCss[0].css,
                                to: changedCss[1].css,
                              },
                              new Set(),
                            );
                      let changedPosition: Dynamic = findChangedNote(
                          (before?: Dynamic, after?: Dynamic): Dynamic =>
                            Math.round(before.x) !== Math.round(after.x) ||
                            Math.round(before.y) !== Math.round(after.y),
                        ),
                        resizedNote: Dynamic =
                          PlatformFileContentHas(
                            previousNotes,
                            currentNotes,
                            new Set(
                              [...deps.selectedNoteIds].filter(
                                (id?: Dynamic): Dynamic =>
                                  !values.has(id),
                              ),
                            ),
                          ) ??
                          (changedPosition &&
                          Math.round(changedPosition[0].w) !==
                            Math.round(changedPosition[1].w)
                            ? changedPosition
                            : null);
                      if (resizedNote) {
                        let [resizeBefore, resizeAfter]: Dynamic = resizedNote,
                          pickResizeFields: Dynamic = (note?: Dynamic): Dynamic =>
                            Object.fromEntries(
                              ["x", "y", "w", "maxW", "maxH"]
                                .filter(
                                  (field?: Dynamic): Dynamic =>
                                    resizeBefore[field] !== resizeAfter[field],
                                )
                                .map(
                                  (field?: Dynamic): Dynamic => [
                                    field,
                                    note[field],
                                  ],
                                ),
                            );
                        deps.recordHistory(
                          {
                            kind: "transform",
                            get label() { return uiMessage("canvas.designCanvas.resize"); },
                            boards: [],
                            anns: [
                              {
                                id: resizeAfter.id,
                                from: pickResizeFields(resizeBefore),
                                to: pickResizeFields(resizeAfter),
                              },
                            ],
                          },
                          new Set(),
                        );
                      } else
                        changedPosition &&
                          deps.recordHistory(
                            {
                              kind: "ann-move",
                              id: changedPosition[1].id,
                              from: {
                                x: changedPosition[0].x,
                                y: changedPosition[0].y,
                              },
                              to: {
                                x: changedPosition[1].x,
                                y: changedPosition[1].y,
                              },
                            },
                            new Set(),
                          );
                      let changedWidth: Dynamic = findChangedNote(
                        (before?: Dynamic, after?: Dynamic): Dynamic =>
                          Math.round(before.w) !== Math.round(after.w),
                      );
                      changedWidth &&
                        !resizedNote &&
                        deps.recordHistory(
                          {
                            kind: "ann-resize",
                            id: changedWidth[1].id,
                            from: changedWidth[0].w,
                            to: changedWidth[1].w,
                          },
                          new Set(),
                        );
                      let changedText: Dynamic = findChangedNote(
                        (before?: Dynamic, after?: Dynamic): Dynamic =>
                          before.text !== after.text,
                      );
                      changedText &&
                        deps.recordHistory(
                          {
                            kind: "ann-text",
                            id: changedText[1].id,
                            from: changedText[0].text,
                            to: changedText[1].text,
                          },
                          new Set(),
                        );
                      let changedStyle: Dynamic = findChangedNote(
                        (before?: Dynamic, after?: Dynamic): Dynamic => {
                          let [beforeStyle, afterStyle]: Dynamic = [
                            annotationTextStyle(before),
                            annotationTextStyle(after),
                          ];
                          return Object.keys(beforeStyle).some(
                            (key?: Dynamic): Dynamic =>
                              beforeStyle[key] !== afterStyle[key],
                          );
                        },
                      );
                      changedStyle &&
                        deps.recordHistory(
                          {
                            kind: "ann-style",
                            id: changedStyle[1].id,
                            from: annotationTextStyle(
                              changedStyle[0],
                            ),
                            to: annotationTextStyle(changedStyle[1]),
                            ...(changedStyle[0].kind !== changedStyle[1].kind &&
                            (changedStyle[0].maxW !== changedStyle[1].maxW ||
                              changedStyle[0].maxH !== changedStyle[1].maxH)
                              ? {
                                  caps: {
                                    from: {
                                      maxW: changedStyle[0].maxW,
                                      maxH: changedStyle[0].maxH,
                                    },
                                    to: {
                                      maxW: changedStyle[1].maxW,
                                      maxH: changedStyle[1].maxH,
                                    },
                                  },
                                }
                              : {}),
                          },
                          new Set(),
                        );
                      let changedRotation: Dynamic = findChangedNote(
                        (before?: Dynamic, after?: Dynamic): Dynamic =>
                          (before.rotate ?? 0) !== (after.rotate ?? 0),
                      );
                      changedRotation &&
                        deps.recordHistory(
                          {
                            kind: "transform",
                            get label() { return uiMessage("canvas.designCanvas.rotate"); },
                            boards: [],
                            anns: [
                              {
                                id: changedRotation[1].id,
                                from: {
                                  rotate: changedRotation[0].rotate ?? 0,
                                },
                                to: {
                                  rotate: changedRotation[1].rotate ?? 0,
                                },
                              },
                            ],
                          },
                          new Set(),
                        );
                      deps.persistManifest(nextManifest);
                    }
