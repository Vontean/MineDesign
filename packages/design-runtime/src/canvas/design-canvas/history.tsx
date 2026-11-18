import { CanvasWorkingStateHandler_3 } from "../working-state";
import { CanvasWorkingStateHas } from "../working-state";
import { NothingChangedThatStepNoLongerMessage } from "../../editor/accessibility/announcements";
import { PlatformFileContentHandler_4 } from "../../platform/file-content";
import { PlatformFileContentLimit_3 as pageLimit } from "../../platform/file-content";
import { PlatformFileContentLimit_5 as annotationLimit } from "../../platform/file-content";
import { announce } from "../../editor/accessibility/announcer";
import { applyCanvasManifestHistory } from "../manifest-history";
import { assignImplicitFirstCanvasPage } from "../page-operations";
import { canvasHistoryAnnouncementMode } from "../manifest-history";
import { clipboardActionFailureMessage } from "../../editor/accessibility/announcements";
import { compatibleRestoredCanvasLaunch } from "../manifest-history";
import { createPageId } from "../../platform/file-content";
import { createSessionHistory } from "../working-state";
import { designPageId } from "../../platform/file-content";
import { errorMessage } from "../../platform/rate-limiter";
import { getKvClient } from "../../platform/file-content";
import { isShapeAnnotation } from "../../platform/file-content";
import { moveAnnotation } from "../../platform/file-content";
import { neighboringCanvasPageId } from "../page-operations";
import { pageUndoFailureMessage } from "../../editor/accessibility/announcements";
import { pendingUndoAnnouncement } from "../../editor/accessibility/announcements";
import { recordSessionLoadStart } from "../working-state";
import { remainingCanvasPageObjects } from "../page-operations";
import { repairCanvasLaunchAfterDeletion } from "../manifest-history";
import { restoreCanvasPageSpec } from "../page-operations";
import { retargetCanvasPageHistory } from "../page-operations";
import { summarizeChangedArtboards } from "../../editor/accessibility/announcements";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { undoTargetAnnouncement } from "../../editor/accessibility/announcements";
import { updateTextEditHistoryCounts } from "../working-state";
import { emptyCanvasSelectionFiles } from "../design-canvas";

/** 画布操作完成后运行：把操作推入撤销栈（最多 50 条），记录各画板的会话历史深度并清空重做。 */
export function recordCanvasHistoryStep(deps: { readonly value140: Dynamic; readonly value141: Dynamic; readonly value4: Dynamic; readonly value405: Dynamic; readonly value408: Dynamic; readonly value410: Dynamic; readonly value412: Dynamic; readonly value440: Dynamic; readonly value67: Dynamic }, source?: Dynamic,
        excludedFiles?: Dynamic,
        extraFiles?: Dynamic,
        boundKey?: Dynamic): Dynamic {
        let mergeIntoBound: Dynamic =
          boundKey !== undefined &&
          (source.kind === "add" || source.kind === "ann-add")
            ? deps.value141.current.get(boundKey)
            : undefined;
        if (mergeIntoBound) {
          mergeIntoBound(source);
          deps.value140.current.get(boundKey)?.();
          deps.value140.current.delete(boundKey);
          return;
        }
        deps.value412();
        deps.value4.current !== null &&
          updateTextEditHistoryCounts(
            deps.value4.current,
            "clear-redo",
          );
        let sessionDepths: Dynamic = deps.value67.artboards
          .filter((artboard?: Dynamic): Dynamic => !excludedFiles.has(artboard.file))
          .map(
            (artboard?: Dynamic): Dynamic => [
              artboard.file,
              deps.value440.current.get(artboard.file) ?? 0,
            ],
          );
        if (source.kind === "add")
          for (let file of new Set([
            ...source.entries.map((addedEntry?: Dynamic): Dynamic => addedEntry.file),
            ...(extraFiles ?? []),
          ]) as Dynamic)
            sessionDepths.push([file, deps.value440.current.get(file) ?? 0]);
        deps.value405.current.length >= 50 && (deps.value410.current += 1);
        deps.value405.current = [
          ...deps.value405.current,
          {
            op: source,
            at: Date.now(),
            depths: sessionDepths,
            ...(boundKey !== undefined
              ? {
                  bound: boundKey,
                }
              : {}),
            ...(deps.value4.current !== null &&
            CanvasWorkingStateHandler_3(source.kind)
              ? {
                  duringTextEdit: deps.value4.current,
                }
              : {}),
          },
        ].slice(-50);
        deps.value408((revision?: Dynamic): Dynamic => revision + 1);
        boundKey !== undefined &&
          (deps.value140.current.get(boundKey)?.(),
          deps.value140.current.delete(boundKey));
      }

/** 撤销或重做某个画布步骤时运行：按步骤类型恢复 Tweaks、清单变化、页面增删或画板文件增删。 */
export async function applyCanvasHistoryStep(deps: { readonly doc: Dynamic; readonly value177: Dynamic; readonly value298: Dynamic; readonly value70: Dynamic; readonly value80: Dynamic; readonly value98: Dynamic }, source?: Dynamic, direction?: Dynamic): Promise<Dynamic> {
        let manifest: Dynamic = deps.value70.current,
          commitManifest: Dynamic = (
            nextManifest?: Dynamic,
            baseManifest: Dynamic = manifest,
          ): Dynamic => deps.value98(nextManifest, baseManifest);
        if (source.kind === "tweak") {
          let entry: Dynamic = deps.value177.current.get(source.file);
          if (!entry) return false;
          entry.setTweaks(direction === "undo" ? source.from : source.to);
          return;
        }
        if (source.kind !== "add" && source.kind !== "delete") {
          let changedManifest: Dynamic = applyCanvasManifestHistory(
            manifest,
            source,
            direction,
          );
          if (changedManifest === "nothing" || changedManifest === "full") return changedManifest;
          if (source.kind === "page-add" && direction === "undo") {
            let repairedLaunch: Dynamic = repairCanvasLaunchAfterDeletion(
              manifest,
              emptyCanvasSelectionFiles,
              source.page.id,
            );
            repairedLaunch !== undefined && (source.launch = repairedLaunch);
          }
          if (source.kind === "page-add" && direction === "redo") {
            let restoredLaunch: Dynamic = compatibleRestoredCanvasLaunch(
              source.launch,
              manifest.launch,
            );
            commitManifest(
              restoredLaunch !== undefined
                ? {
                    ...changedManifest,
                    launch: restoredLaunch,
                  }
                : changedManifest,
            );
            delete source.launch;
            return;
          }
          commitManifest(changedManifest);
          return;
        }
        let isRestoring: Dynamic =
            source.kind === "delete"
              ? direction === "undo"
              : direction === "redo",
          applyArtboardMoves: Dynamic = (artboards?: Dynamic): Dynamic => {
            if (source.kind !== "add" || !source.moves) return artboards;
            let entries: Dynamic = new Map(
              source.moves.map(
                (move?: Dynamic): Dynamic => [
                  move.file,
                  isRestoring ? move.to : move.from,
                ],
              ),
            );
            return artboards.map((artboard?: Dynamic): Dynamic => {
              let entry: Dynamic = entries.get(artboard.file);
              return entry
                ? {
                    ...artboard,
                    x: entry.x,
                    y: entry.y,
                  }
                : artboard;
            });
          },
          applyAnnotationMoves: Dynamic = (annotations?: Dynamic): Dynamic => {
            if (source.kind !== "add" || !source.annMoves) return annotations;
            let entries: Dynamic = new Map(
              source.annMoves.map(
                (move?: Dynamic): Dynamic => [
                  move.id,
                  isRestoring ? move.to : move.from,
                ],
              ),
            );
            return annotations.map((annotation?: Dynamic): Dynamic => {
              let entry: Dynamic = entries.get(annotation.id);
              return entry
                ? moveAnnotation(annotation, entry.x, entry.y)
                : annotation;
            });
          },
          hasMoves: Dynamic =
            source.kind === "add" &&
            ((source.moves?.length ?? 0) > 0 ||
              (source.annMoves?.length ?? 0) > 0);
        if (
          !isRestoring &&
          source.kind === "delete" &&
          source.page !== undefined
        ) {
          let page: Dynamic = source.page;
          if (
            !(manifest.pages ?? []).some(
              (pageSpec?: Dynamic): Dynamic => pageSpec.id !== page.spec.id,
            )
          )
            throw new Error("it is the only page left.");
          let remainingObjects: Dynamic = remainingCanvasPageObjects(
            manifest,
            page.spec.id,
            new Set(
              source.entries.map((deletedEntry?: Dynamic): Dynamic => deletedEntry.file),
            ),
            new Set(
              (source.anns ?? []).map(
                (annotation?: Dynamic): Dynamic => annotation.spec.id,
              ),
            ),
          );
          for (let remainingArtboard of remainingObjects.artboards as Dynamic) {
            await deps.value177.current.get(remainingArtboard.file)?.flushPending();
            let fileContent: Dynamic =
              (await getKvClient().get(
                PlatformFileContentHandler_4(remainingArtboard.file),
              )) ??
              deps.doc.content().files[remainingArtboard.file] ??
              "";
            source.entries.push({
              file: remainingArtboard.file,
              src: fileContent,
              spec: remainingArtboard,
              index: manifest.artboards.findIndex(
                (loadedArtboard?: Dynamic): Dynamic => loadedArtboard.file === remainingArtboard.file,
              ),
            });
          }
          remainingObjects.notes.length > 0 &&
            (source.anns = [
              ...(source.anns ?? []),
              ...(manifest.annotations ?? []).flatMap(
                (annotation?: Dynamic, annotationIndex?: Dynamic): Dynamic =>
                  remainingObjects.notes.includes(annotation.id)
                    ? [
                        {
                          spec: annotation,
                          index: annotationIndex,
                        },
                      ]
                    : [],
              ),
            ]);
        }
        if (!isRestoring) {
          let values: Dynamic = new Set(
            source.entries.map((deletedEntry?: Dynamic): Dynamic => deletedEntry.file),
          );
          manifest.cover !== undefined &&
            values.has(manifest.cover) &&
            (source.cover = manifest.cover);
          let launchAfterDeletion: Dynamic = repairCanvasLaunchAfterDeletion(
            manifest,
            values,
            source.kind === "delete" ? source.page?.spec.id : undefined,
          );
          launchAfterDeletion !== undefined && (source.launch = launchAfterDeletion);
        }
        let items: Dynamic = [...(manifest.annotations ?? [])],
          annotationEntries: Dynamic =
            source.kind === "delete"
              ? (source.anns ?? [])
              : (source.anns ?? []).map(
                  (annotation?: Dynamic, annotationOffset?: Dynamic): Dynamic => ({
                    spec: annotation,
                    index: items.length + annotationOffset,
                  }),
                ),
          missingAnnotationCount: Dynamic = isRestoring
            ? annotationEntries.filter(
                (annotationEntry?: Dynamic): Dynamic =>
                  !items.some(
                    (existingAnnotation?: Dynamic): Dynamic =>
                      existingAnnotation.id === annotationEntry.spec.id,
                  ),
              ).length
            : 0;
        if (
          missingAnnotationCount > 0 &&
          items.length + missingAnnotationCount > annotationLimit
        )
          return "full";
        if (
          isRestoring &&
          source.kind === "delete" &&
          source.page !== undefined
        ) {
          let page: Dynamic = source.page,
            pageStillListed: Dynamic = (manifest.pages ?? []).some(
              (pageItem?: Dynamic): Dynamic => pageItem.id === page.spec.id,
            );
          if (!(pageStillListed && page.relisted === true)) {
            if (
              (manifest.pages ?? []).length >=
              pageLimit
            )
              throw new Error(
                "this canvas is at its page limit (" +
                  String(pageLimit) +
                  ").",
              );
            pageStillListed &&
              retargetCanvasPageHistory(
                source,
                createPageId(manifest.pages ?? [], true),
              );
          }
        }
        let deletedPage: Dynamic =
          source.kind === "delete" ? source.page : undefined;
        if (isRestoring) {
          let isFirstPage: Dynamic =
            deletedPage !== undefined && deletedPage.index === 0;
          isFirstPage &&
            items.splice(
              0,
              items.length,
              ...assignImplicitFirstCanvasPage(
                items,
                manifest.pages,
              ),
            );
          let restoredArtboards: Dynamic = isFirstPage
            ? assignImplicitFirstCanvasPage(
                manifest.artboards,
                manifest.pages,
              )
            : [...manifest.artboards];
          if (source.kind === "delete")
            for (let artboardEntry of [...source.entries].sort(
              (leftEntry?: Dynamic, rightEntry?: Dynamic): Dynamic =>
                leftEntry.index - rightEntry.index,
            ) as Dynamic)
              restoredArtboards.some(
                (artboard?: Dynamic): Dynamic => artboard.file === artboardEntry.file,
              ) ||
                restoredArtboards.splice(
                  Math.min(artboardEntry.index, restoredArtboards.length),
                  0,
                  artboardEntry.spec,
                );
          else
            restoredArtboards.push(
              ...source.entries.map((addedEntry?: Dynamic): Dynamic => addedEntry.spec),
            );
          for (let noteEntry of [...annotationEntries].sort(
            (leftNote?: Dynamic, rightNote?: Dynamic): Dynamic =>
              leftNote.index - rightNote.index,
          ) as Dynamic)
            items.some(
              (annotation?: Dynamic): Dynamic => annotation.id === noteEntry.spec.id,
            ) ||
              items.splice(
                Math.min(noteEntry.index, items.length),
                0,
                noteEntry.spec,
              );
          let mergedLaunch: Dynamic = compatibleRestoredCanvasLaunch(
            source.launch,
            manifest.launch,
          );
          commitManifest({
            ...manifest,
            artboards: applyArtboardMoves(restoredArtboards),
            ...(annotationEntries.length > 0 || hasMoves || isFirstPage
              ? {
                  annotations: applyAnnotationMoves(items),
                }
              : {}),
            ...(source.cover !== undefined &&
            (source.kind === "delete" || manifest.cover === undefined)
              ? {
                  cover: source.cover,
                }
              : {}),
            ...(deletedPage !== undefined
              ? {
                  pages: restoreCanvasPageSpec(
                    manifest.pages,
                    deletedPage,
                  ),
                }
              : {}),
            ...(mergedLaunch !== undefined
              ? {
                  launch: mergedLaunch,
                }
              : {}),
          });
          deletedPage !== undefined && (deletedPage.relisted = true);
          if (source.kind === "add")
            for (let fileEntry of (source.files ?? []) as Dynamic)
              (deps.doc.content().files[fileEntry.path] ?? fileEntry.src) ===
                fileEntry.src &&
                (await getKvClient().set(
                  PlatformFileContentHandler_4(fileEntry.path),
                  fileEntry.src,
                ));
          for (let artboardEntry of source.entries as Dynamic)
            await getKvClient().set(
              PlatformFileContentHandler_4(artboardEntry.file),
              artboardEntry.src,
            );
          deletedPage !== undefined && deps.value298(deletedPage.spec.id);
          delete source.cover;
          delete source.launch;
        } else {
          for (let artboardEntry of source.entries as Dynamic) {
            await deps.value177.current.get(artboardEntry.file)?.flushPending();
            await getKvClient().delete(
              PlatformFileContentHandler_4(artboardEntry.file),
            );
          }
          if (source.kind === "add")
            for (let fileEntry of (source.files ?? []) as Dynamic)
              deps.doc.content().files[fileEntry.path] === fileEntry.src &&
                (await getKvClient().delete(
                  PlatformFileContentHandler_4(fileEntry.path),
                ));
          let latestManifest: Dynamic = deps.value70.current,
            remainingPages: Dynamic =
              deletedPage !== undefined
                ? (latestManifest.pages ?? []).filter(
                    (pageItem?: Dynamic): Dynamic =>
                      pageItem.id !== deletedPage.spec.id,
                  )
                : [],
            nextPageId: Dynamic =
              deletedPage !== undefined &&
              remainingPages.length > 0 &&
              deps.value80.current === deletedPage.spec.id
                ? (neighboringCanvasPageId(
                    latestManifest.pages ?? [],
                    deletedPage.spec.id,
                  ) ?? remainingPages[0].id)
                : undefined;
          commitManifest(
            {
              ...latestManifest,
              artboards: applyArtboardMoves(
                latestManifest.artboards.filter(
                  (artboard?: Dynamic): Dynamic =>
                    !source.entries.some(
                      (removedEntry?: Dynamic): Dynamic =>
                        removedEntry.file === artboard.file,
                    ),
                ),
              ),
              ...(annotationEntries.length > 0 || hasMoves
                ? {
                    annotations: applyAnnotationMoves(
                      (latestManifest.annotations ?? []).filter(
                        (annotation?: Dynamic): Dynamic =>
                          !annotationEntries.some(
                            (removedNote?: Dynamic): Dynamic =>
                              removedNote.spec.id === annotation.id,
                          ),
                      ),
                    ),
                  }
                : {}),
              ...(remainingPages.length > 0
                ? {
                    pages: remainingPages,
                  }
                : {}),
            },
            latestManifest,
          );
          deletedPage !== undefined &&
            (deletedPage.relisted = remainingPages.length === 0);
          nextPageId !== undefined && deps.value298(nextPageId);
        }
      }

/** 执行撤销或重做时运行：取出可达的历史步骤并应用，处理页面删除恢复，失败时把步骤放回并提示，成功时播报具体操作。 */
export function applyUndoRedoStep(deps: { readonly showToast: Dynamic; readonly value188: Dynamic; readonly value218: Dynamic; readonly value405: Dynamic; readonly value406: Dynamic; readonly value408: Dynamic; readonly value409: Dynamic; readonly value414: Dynamic; readonly value415: Dynamic; readonly value427: Dynamic; readonly value428: Dynamic; readonly value440: Dynamic; readonly value73: Dynamic }, direction?: Dynamic, trigger: Dynamic = false): Dynamic {
        if (deps.value427.current) return true;
        let step: Dynamic = deps.value415(direction);
        if (!step) return false;
        if (
          step.op.kind === "delete" &&
          step.op.page !== undefined &&
          deps.value218.current
        )
          return true;
        deps.value427.current = step;
        let manifestAtStart: Dynamic = deps.value409.current,
          sourceStack: Dynamic = direction === "undo" ? deps.value405 : deps.value406,
          stepIndex: Dynamic = sourceStack.current.lastIndexOf(step);
        stepIndex >= 0 && sourceStack.current.splice(stepIndex, 1);
        let putBackAndNotify: Dynamic = (
            message?: Dynamic,
            toastKind?: Dynamic,
          ): Dynamic => {
            deps.value427.current = null;
            sourceStack.current.push(step);
            deps.value408((revision?: Dynamic): Dynamic => revision + 1);
            deps.showToast(message, toastKind);
          },
          pageFailureMessage: Dynamic = (): Dynamic => {
            let deletedPage: Dynamic =
              step.op.kind === "delete" ? step.op.page : undefined;
            return deletedPage === undefined
              ? undefined
              : pageUndoFailureMessage(
                  direction,
                  deletedPage.relisted === true &&
                    (deps.value73.current.pages ?? []).some(
                      (pageItem?: Dynamic): Dynamic =>
                        pageItem.id === deletedPage.spec.id,
                    ),
                );
          };
        deps.value414(step.op, direction)
          .then((outcome?: Dynamic): Dynamic => {
            if (outcome === "full") {
              putBackAndNotify(
                clipboardActionFailureMessage(
                  direction,
                  annotationLimit,
                  step.op.kind === "ann-add" ||
                    step.op.kind === "ann-delete"
                    ? step.op.spec
                    : undefined,
                  pageFailureMessage(),
                  trigger,
                ),
                "warning",
              );
              return;
            }
            if (outcome === "nothing") {
              deps.value427.current = null;
              deps.value408((revision?: Dynamic): Dynamic => revision + 1);
              let announcementMode: Dynamic = canvasHistoryAnnouncementMode(
                  direction,
                  step.bound !== undefined,
                  trigger,
                ),
                announceNothingChanged: Dynamic = (): Dynamic =>
                  announce(
                    NothingChangedThatStepNoLongerMessage,
                  );
              announcementMode === "partner"
                ? deps.value428(step.bound, direction, announceNothingChanged)
                : announcementMode === "say" && announceNothingChanged();
              return;
            }
            let sealedStep: Dynamic =
              step.op.kind === "delete" && direction === "undo"
                ? {
                    ...step,
                    depths: [
                      ...step.depths.filter(
                        ([file]: Dynamic): Dynamic =>
                          step.op.kind !== "delete" ||
                          !step.op.entries.some(
                            (deletedEntry?: Dynamic): Dynamic =>
                              deletedEntry.file === file,
                          ),
                      ),
                      ...step.op.entries.map(
                        (restoredEntry?: Dynamic): Dynamic => [
                          restoredEntry.file,
                          deps.value440.current.get(restoredEntry.file) ?? 0,
                        ],
                      ),
                    ],
                  }
                : step;
            (direction === "redo" || deps.value409.current === manifestAtStart) &&
              (direction === "undo" ? deps.value406 : deps.value405).current.push({
                ...sealedStep,
                sealed: true,
              });
            deps.value408((revision?: Dynamic): Dynamic => revision + 1);
            let state: Dynamic = {
                rename: "Artboard rename",
                resize: "Artboard resize",
                print: "Print mode change",
                paper: "Paper change",
                guides: "Layout guide change",
                radius: "Corner radius change",
                cover: "Thumbnail change",
                order: "Artboard order change",
                "ann-add": "New note",
                "ann-delete": "Note delete",
                "ann-move": "Note move",
                "ann-resize": "Note resize",
                "ann-text": "Note edit",
                "ann-style": "Note style",
                "ann-box": "Shape move/resize",
                "ann-path": "Edit path",
                "ann-color": "Shape color",
                "ann-css": "Style",
                "ann-heads": "Arrowhead change",
                "ann-src": "Picture replace",
                "ann-crop": "Crop",
                "page-add": "Page change",
                "page-rename": "Page change",
                tweak: "Tweak",
              },
              countLabels: Dynamic = {
                move: [uiMessage("canvas.designCanvas.artboardMove"), uiMessage("canvas.designCanvas.artboardMoves")],
                add: [uiMessage("canvas.designCanvas.newArtboard"), uiMessage("canvas.designCanvas.newArtboards")],
                delete: [uiMessage("canvas.designCanvas.artboardDelete"), uiMessage("canvas.designCanvas.artboardDeletes")],
              },
              withNotesLabels: Dynamic = {
                move: "Move",
                add: "Duplicate",
                delete: "Delete",
              },
              op2: Dynamic = step.op,
              affectedCount: Dynamic =
                op2.kind === "move"
                  ? op2.moves.length
                  : op2.kind === "add" || op2.kind === "delete"
                    ? op2.entries.length
                    : 0,
              actionLabel: Dynamic =
                op2.kind === "delete" && op2.page !== undefined
                  ? uiMessage("canvas.designCanvas.pageDelete")
                  : op2.kind === "move" ||
                      op2.kind === "add" ||
                      op2.kind === "delete"
                    ? (op2.anns?.length ?? 0) > 0
                      ? (op2.kind === "add" && op2.label) || withNotesLabels[op2.kind]
                      : affectedCount === 1
                        ? countLabels[op2.kind][0]
                        : String(affectedCount) + " " + countLabels[op2.kind][1]
                    : (op2.kind === "ann-add" || op2.kind === "ann-delete") &&
                        isShapeAnnotation(op2.spec)
                      ? op2.spec.kind === "image"
                        ? op2.spec.video !== undefined
                          ? op2.kind === "ann-add"
                            ? uiMessage("canvas.designCanvas.newVideo")
                            : uiMessage("canvas.designCanvas.videoDelete")
                          : op2.kind === "ann-add"
                            ? uiMessage("canvas.designCanvas.newPicture")
                            : uiMessage("canvas.designCanvas.pictureDelete")
                        : op2.kind === "ann-add"
                          ? uiMessage("canvas.designCanvas.newShape")
                          : uiMessage("canvas.designCanvas.shapeDelete")
                      : op2.kind === "transform"
                        ? op2.label
                        : op2.kind === "ann-box" &&
                            "w" in op2.from &&
                            "w" in op2.to &&
                            op2.from.x === op2.to.x &&
                            op2.from.y === op2.to.y &&
                            op2.from.w === op2.to.w &&
                            op2.from.h === op2.to.h
                          ? "Rotate"
                          : op2.kind === "ann-src" &&
                              (op2.from.video !== undefined ||
                                op2.to.video !== undefined)
                            ? uiMessage("canvas.designCanvas.videoReplace")
                            : op2.kind === "ann-box" &&
                                (deps.value73.current.annotations ?? []).some(
                                  (source?: Dynamic): Dynamic =>
                                    source.id === op2.id &&
                                    source.kind === "image",
                                )
                              ? (deps.value73.current.annotations ?? []).some(
                                  (source?: Dynamic): Dynamic =>
                                    source.id === op2.id &&
                                    source.kind === "image" &&
                                    source.video !== undefined,
                                )
                                ? uiMessage("canvas.designCanvas.videoMoveResize")
                                : uiMessage("canvas.designCanvas.pictureMoveResize")
                              : state[op2.kind];
            deps.value188(
              outcome === false
                ? uiMessage("canvas.designCanvas.thatArtboardIsnTOpen")
                : actionLabel + (direction === "undo" ? " undone." : " redone."),
            );
            deps.value427.current = null;
            step.bound !== undefined &&
              outcome !== false &&
              deps.value409.current === manifestAtStart &&
              deps.value428(step.bound, direction);
          })
          .catch((error?: Dynamic): Dynamic => {
            let pageFailure: Dynamic = pageFailureMessage();
            putBackAndNotify(
              pageFailure !== undefined
                ? pageFailure + errorMessage(error)
                : uiMessage("canvas.designCanvas.couldnTUndoTheArtboard") + String(error),
              "error",
            );
          });
        return true;
      }

/** 首次渲染时惰性创建一次：建立跨画板的会话历史（createSessionHistory）及其宿主，负责保护当前页、丢弃过期条目与播报撤销目标。 */
export function initSessionHistoryKeeper(deps: { readonly callback2: Dynamic; readonly value177: Dynamic; readonly value19: Dynamic; readonly value218: Dynamic; readonly value275: Dynamic; readonly value285: Dynamic; readonly value427: Dynamic; readonly value434: Dynamic; readonly value435: Dynamic; readonly value436: Dynamic; readonly value437: Dynamic; readonly value448: Dynamic; readonly value70: Dynamic; readonly value80: Dynamic }): Dynamic {
    let isInDocument: Dynamic = (file?: Dynamic): Dynamic =>
        deps.value70.current?.artboards.some(
          (artboard?: Dynamic): Dynamic => artboard.file === file,
        ) === true && deps.value435.current.content().files[file] !== undefined,
      pageOfFile: Dynamic = (file?: Dynamic): Dynamic => {
        let manifest: Dynamic = deps.value70.current,
          artboard: Dynamic = manifest?.artboards.find(
            (candidate?: Dynamic): Dynamic => candidate.file === file,
          );
        return manifest && artboard
          ? designPageId(artboard, manifest.pages)
          : undefined;
      },
      state: Dynamic = {
        changed: [],
        other: [],
      },
      noticeTimer: Dynamic,
      cancelPendingNotice: Dynamic = (): Dynamic => {
        clearTimeout(noticeTimer);
        noticeTimer = undefined;
        state.changed.length = 0;
        state.other.length = 0;
      },
      sessionHistory: Dynamic = createSessionHistory({
        inDocument: isInDocument,
        isProtected: (file?: Dynamic): Dynamic =>
          pageOfFile(file) === deps.value80.current ||
          deps.value434.current?.undoFile() === file ||
          deps.value434.current?.redoFile() === file,
        now: (): Dynamic => performance.now(),
        onDrop: (file?: Dynamic, dropReason?: Dynamic): Dynamic => {
          deps.value434.current?.forget(file);
          if (
            !CanvasWorkingStateHas(dropReason) ||
            ((dropReason === "changed" ? state.changed : state.other).push(
              deps.callback2(file),
            ),
            noticeTimer !== undefined)
          )
            return;
          let documentAtDrop: Dynamic = deps.value435.current;
          noticeTimer = setTimeout((): Dynamic => {
            noticeTimer = undefined;
            if (deps.value435.current !== documentAtDrop) return cancelPendingNotice();
            let { message: summaryMessage, description: summaryDescription }: Dynamic = summarizeChangedArtboards(
              state.changed.splice(0),
              state.other.splice(0),
            );
            deps.value437.current(
              summaryMessage,
              "warning",
              summaryDescription === undefined
                ? undefined
                : {
                    description: summaryDescription,
                  },
            );
          }, 50);
        },
      });
    return {
      keeper: sessionHistory,
      host: {
        inDocument: isInDocument,
        openPage: (): Dynamic => deps.value80.current,
        pageOfFile: pageOfFile,
        isFramed: (file?: Dynamic): Dynamic =>
          deps.value70.current?.artboards.some(
            (artboard?: Dynamic): Dynamic =>
              artboard.file === file && !artboard.frameless,
          ) === true,
        startLoad: (file?: Dynamic): Dynamic => {
          let entry: Dynamic = deps.value177.current.get(file);
          recordSessionLoadStart(
            sessionHistory,
            file,
            entry
              ? (): Dynamic => entry.ensureModel(deps.value19(file))
              : undefined,
          );
        },
        mayShowPage: (): Dynamic =>
          !deps.value218.current && deps.value427.current === null && !deps.value285.current,
        currentSrc: (file?: Dynamic): Dynamic =>
          deps.value435.current.content().files[file],
        afterExitGuard: deps.value275,
        switchPage: (pageId?: Dynamic, target?: Dynamic): Dynamic =>
          deps.value436.current(pageId, target),
        say: (source?: Dynamic): Dynamic => {
          source.kind === "loading"
            ? announce(
                pendingUndoAnnouncement(
                  source.dir,
                  deps.callback2(source.file),
                ),
              )
            : deps.value448.current?.(
                undoTargetAnnouncement(
                  source.dir,
                  deps.value70.current?.pages?.find(
                    (pageItem?: Dynamic): Dynamic => pageItem.id === source.page,
                  )?.name ?? uiMessage("canvas.designCanvas.page1"),
                ),
              );
        },
      },
      cancelSaid: cancelPendingNotice,
    };
  }
