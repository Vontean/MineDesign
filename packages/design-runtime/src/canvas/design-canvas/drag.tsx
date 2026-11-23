import { travelCommitTimeoutMs as dragDropLockKind } from "../working-state";
import { minFramelessArtboardDimension as minArtboardSize } from "../../platform/file-content";
import { maxCanvasCoordinate as maxArtboardOffset } from "../../platform/file-content";
import { PlatformFileContentFilesValue } from "../../platform/file-content";
import { projectFileKey } from "../../platform/file-content";
import { maxCanvasItemDimension as maxArtboardSize } from "../../platform/file-content";
import { buildDcDocument } from "../../editor/clipboard/html-placement";
import { canFreezeSinglePaste } from "../../editor/insert/drop-targets";
import { emptyCanvasSelection } from "../../editor/selection/canvas-selection";
import { filterSelectedAnnotations } from "../../editor/selection/canvas-selection";
import { filterSelectedArtboards } from "../../editor/selection/canvas-selection";
import { getKvClient } from "../../platform/file-content";
import { keyboardShortcutLabel } from "../../editor/keyboard/shortcuts";
import { pastedElementGeometry } from "../../editor/insert/drop-targets";
import { pastedRootElementCount } from "../../editor/insert/drop-targets";
import { positionPastedHtml } from "../../editor/clipboard/html-placement";
import { randomSessionToken } from "../working-state";
import { replaceSelectedElements } from "../../editor/selection/canvas-selection";
import { selectionFromArtboards } from "../../editor/selection/canvas-selection";
import { selectionFromBoards } from "../../editor/selection/canvas-selection";
import { selectionFromElements } from "../../editor/selection/canvas-selection";
import { setCanvasElementSelection } from "../../editor/selection/canvas-selection";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { uniqueArtboardFile } from "../../platform/file-content";
import { uniqueElementArtboardTitle } from "../../platform/file-content";
import { emptyCanvasSelectionFiles } from "./shared";

/** 跨画板拖动携带 pieces（元素被拖出到空白画布）时运行：把拖出的元素生成为新画板或画布图形，处理复制/移动、只读与中断，返回写入与被拒结果。 */
export async function commitPieceDragOntoCanvas(deps: { readonly target: { readonly getArtboardTitle: Dynamic; readonly artboardEntries: Dynamic; readonly componentName: Dynamic }; readonly session: { readonly dragSessions: Dynamic; readonly editing: Dynamic; readonly waitForBoundOperation: Dynamic }; readonly history: { readonly boundRecordMergers: Dynamic; readonly boundSelections: Dynamic; readonly boundMoveRecords: Dynamic; readonly recordManifestHistory: Dynamic; readonly inlineHistory: Dynamic }; readonly document: { readonly savePageSelection: Dynamic; readonly doc: Dynamic; readonly supportsLoadState: Dynamic; readonly manifest: Dynamic; readonly persistManifest: Dynamic; readonly markArtboardDropped: Dynamic }; readonly selection: { readonly abandonGesture: Dynamic; readonly focusedFile: Dynamic; readonly current: Dynamic; readonly setSelection: Dynamic; readonly setShownFrameSelection: Dynamic; readonly clearFramePick: Dynamic }; readonly feedback: { readonly clearToast: Dynamic; readonly showToast: Dynamic } }, pieceDrag?: Dynamic): Promise<Dynamic> {
      let { token: dragToken, travel: travel }: Dynamic = pieceDrag,
        selectionAtStart: Dynamic = deps.selection.current.current,
        pieces: Dynamic = travel?.pieces ?? [],
        items: Dynamic = [...pieceDrag.unanswered],
        cancelHomeMoves: Dynamic = (): Dynamic => {
          for (let file of pieceDrag.plans.keys() as Dynamic) {
            let entry: Dynamic = deps.target.artboardEntries.current.get(file);
            entry?.moveCancel(dragToken);
            entry?.moveSettle();
          }
        },
        refuseAll: Dynamic = (): Dynamic => (
          cancelHomeMoves(),
          {
            written: [],
            refused: items,
            selection: selectionAtStart,
          }
        ),
        refuseWithMessage: Dynamic = async (message?: Dynamic): Promise<Dynamic> => {
          let pendingFlush: Dynamic =
              pieceDrag.copy && pieceDrag.canvasMoved
                ? deps.session.waitForBoundOperation(dragToken)
                : Promise.resolve(),
            canvasResult: Dynamic = pieceDrag.canvas();
          for (let traveller of (travel?.travellers ?? []) as Dynamic)
            travel?.endHome(traveller.file, false);
          await pendingFlush;
          deps.feedback.showToast.current(
            canvasResult === false
              ? uiMessage("canvas.designCanvas.nothing") +
                  (pieceDrag.copy ? "copied" : "moved") +
                  " \u2014 the drag was interrupted; try it again."
              : message,
          );
          pieceDrag.copy &&
            pieceDrag.canvasMoved &&
            (deps.history.boundSelections.current.has(dragToken)
              ? Promise.resolve()
              : deps.session.waitForBoundOperation(dragToken)
            ).then((): Dynamic => {
              let entry: Dynamic = deps.history.boundSelections.current.get(dragToken);
              deps.history.boundSelections.current.delete(dragToken);
              entry &&
                (entry.files.size > 0 || entry.notes.size > 0) &&
                deps.selection.setSelection(
                  selectionFromBoards({
                    files: entry.files,
                    notes: entry.notes,
                  }),
                );
            });
          return refuseAll();
        };
      if (!travel || pieces.length === 0)
        return refuseWithMessage(
          uiMessage("canvas.designCanvas.nothing") + (pieceDrag.copy ? "copied" : "moved") + ".",
        );
      cancelHomeMoves();
      let files: Dynamic = deps.document.doc.content().files;
      if (
        Object.keys(files).length + pieces.length >
        PlatformFileContentFilesValue
      )
        return refuseWithMessage(
          (pieceDrag.canvasMoved
            ? uiMessage("canvas.designCanvas.theRest") + (pieceDrag.copy ? "copied" : "moved") + "; "
            : "") +
            uiMessage("canvas.designCanvas.couldnTMakeNewArtboards") +
            String(PlatformFileContentFilesValue) +
            "-file limit; delete something first",
        );
      let state: Dynamic = {
          moves: [],
          annMoves: [],
        },
        addedBatches: Dynamic = [],
        resolveAdded: Dynamic = (): Dynamic => {},
        promise: Dynamic = new Promise((resolve?: Dynamic): Dynamic => {
          resolveAdded = resolve;
        });
      deps.history.boundMoveRecords.current.set(dragToken, (nextMoveRecord?: Dynamic): Dynamic => {
        state = nextMoveRecord;
      });
      deps.history.boundRecordMergers.current.set(dragToken, (source?: Dynamic): Dynamic => {
        source.kind === "add"
          ? addedBatches.push({
              entries: source.entries,
              anns: source.anns ?? [],
            })
          : source.kind === "ann-add" &&
            addedBatches.push({
              entries: [],
              anns: [source.spec],
            });
        resolveAdded();
      });
      let canvasMoveFlush: Dynamic = pieceDrag.canvasMoved
          ? deps.session.waitForBoundOperation(dragToken)
          : Promise.resolve(),
        canvasMoveResult: Dynamic;
      try {
        canvasMoveResult = pieceDrag.canvas();
      } finally {
        deps.history.boundMoveRecords.current.delete(dragToken);
      }
      travel.copy &&
        pieceDrag.canvasMoved &&
        (await Promise.race([
          promise,
          canvasMoveFlush,
          new Promise((resolve?: Dynamic): Dynamic => setTimeout(resolve, 2e3)),
        ]));
      deps.history.boundRecordMergers.current.delete(dragToken);
      deps.history.boundSelections.current.delete(dragToken);
      let addedRecords: Dynamic = {
        entries: addedBatches.flatMap(
          (batch?: Dynamic): Dynamic => batch.entries,
        ),
        anns: addedBatches.flatMap((batch?: Dynamic): Dynamic => batch.anns),
      };
      if (pieceDrag.canvasMoved && canvasMoveResult === false) {
        for (let traveller of travel.travellers as Dynamic)
          travel.endHome(traveller.file, false);
        deps.feedback.showToast.current(
          uiMessage("canvas.designCanvas.nothing") +
            (travel.copy ? "copied" : "moved") +
            " \u2014 the drag was interrupted; try it again.",
        );
        return refuseAll();
      }
      let recordHistory: Dynamic = (): Dynamic => {
        (state.moves.length > 0 || state.annMoves.length > 0) &&
          deps.history.recordManifestHistory.current(
            {
              kind: "move",
              moves: state.moves,
              ...(state.annMoves.length > 0
                ? {
                    anns: state.annMoves,
                  }
                : {}),
            },
            new Set(),
            undefined,
            dragToken,
          );
        (addedRecords.entries.length > 0 || addedRecords.anns.length > 0) &&
          deps.history.recordManifestHistory.current(
            {
              kind: "add",
              entries: addedRecords.entries,
              ...(addedRecords.anns.length > 0
                ? {
                    anns: addedRecords.anns,
                  }
                : {}),
            },
            new Set(
              addedRecords.entries.map((addedEntry?: Dynamic): Dynamic => addedEntry.file),
            ),
            undefined,
            dragToken,
          );
      };
      if (
        Object.keys(deps.document.doc.content().files).length + pieces.length >
        PlatformFileContentFilesValue
      ) {
        recordHistory();
        for (let traveller of travel.travellers as Dynamic)
          travel.endHome(traveller.file, false);
        deps.feedback.showToast.current(
          (pieceDrag.canvasMoved
            ? uiMessage("canvas.designCanvas.theRest") + (travel.copy ? "copied" : "moved") + "; "
            : "") +
            uiMessage("canvas.designCanvas.couldnTMakeNewArtboards") +
            String(PlatformFileContentFilesValue) +
            "-file limit; delete something first",
        );
        return refuseAll();
      }
      let newPieces: Dynamic = [],
        entries: Dynamic = new Map(),
        draftDocument: Dynamic = {
          files: {
            ...deps.document.doc.content().files,
            ...Object.fromEntries(
              addedRecords.entries.map(
                (addedEntry?: Dynamic): Dynamic => [addedEntry.file, addedEntry.src],
              ),
            ),
          },
          artboards: [
            ...deps.document.manifest.current.artboards,
            ...addedRecords.entries.map((addedEntry?: Dynamic): Dynamic => addedEntry.spec),
          ],
        };
      try {
        for (let piece of pieces as Dynamic) {
          let entry: Dynamic = deps.target.artboardEntries.current.get(piece.file);
          if (!entry || (await entry.travellerHtml(piece.tid)) === null)
            continue;
          let serialized: Dynamic = entry.serializeSelection([piece.tid], {
            lift: {
              ew: piece.box.w,
              ox: 0,
              oy: 0,
            },
          });
          if (!serialized) continue;
          await entry.flushPending();
          let homeSource: Dynamic =
              (await getKvClient().get(
                projectFileKey(piece.file),
              )) ??
              files[piece.file] ??
              "",
            newFile: Dynamic = uniqueArtboardFile(
              draftDocument.files,
              "Piece",
              deps.document.supportsLoadState,
            ),
            newDocument: Dynamic = buildDcDocument(
              serialized,
              typeof homeSource == "string" ? homeSource : "",
            ),
            description: Dynamic = entry.describeTids([piece.tid])[0],
            title: Dynamic = description
              ? description.tag.charAt(0).toUpperCase() + description.tag.slice(1)
              : "Piece",
            newSpec: Dynamic = {
              file: newFile,
              x: Math.max(
                -maxArtboardOffset,
                Math.min(
                  maxArtboardOffset,
                  Math.round(piece.box.x),
                ),
              ),
              y: Math.max(
                -maxArtboardOffset,
                Math.min(
                  maxArtboardOffset,
                  Math.round(piece.box.y),
                ),
              ),
              w: Math.min(
                maxArtboardSize,
                Math.max(
                  minArtboardSize,
                  piece.box.w,
                ),
              ),
              h: Math.min(
                maxArtboardSize,
                Math.max(
                  minArtboardSize,
                  piece.box.h,
                ),
              ),
              title: uniqueElementArtboardTitle(
                title,
                draftDocument.artboards,
              ),
              frameless: true,
              ...deps.document.savePageSelection(),
            };
          draftDocument.files[newFile] = newDocument;
          draftDocument.artboards.push(newSpec);
          newPieces.push({
            file: newFile,
            src: newDocument,
            spec: newSpec,
            home: piece.file,
            tid: piece.tid,
          });
          entries.set(piece.file, [
            ...(entries.get(piece.file) ?? []),
            piece.tid,
          ]);
        }
      } catch (error: Dynamic) {
        recordHistory();
        for (let traveller of travel.travellers as Dynamic)
          travel.endHome(traveller.file, false);
        console.error("set pieces:", error);
        deps.feedback.showToast.current(
          pieceDrag.canvasMoved
            ? uiMessage("canvas.designCanvas.theRest") +
                (travel.copy ? "copied" : "moved") +
                "; the elements could not be lifted and stayed."
            : uiMessage("canvas.designCanvas.nothing") +
                (travel.copy ? "copied" : "moved") +
                " \u2014 the elements could not be lifted.",
        );
        return refuseAll();
      }
      if (newPieces.length === 0) {
        recordHistory();
        for (let traveller of travel.travellers as Dynamic)
          travel.endHome(traveller.file, false);
        deps.feedback.showToast.current(
          (pieceDrag.canvasMoved
            ? uiMessage("canvas.designCanvas.theRest") +
              (travel.copy ? "copied" : "moved") +
              "; the elements stayed \u2014 "
            : uiMessage("canvas.designCanvas.nothing") +
              (travel.copy ? "copied" : "moved") +
              " \u2014 ") +
            "repeated, nested or locked elements stay with their artboard.",
        );
        return refuseAll();
      }
      if (!deps.session.editing.current) {
        recordHistory();
        for (let traveller of travel.travellers as Dynamic)
          travel.endHome(traveller.file, false);
        deps.feedback.showToast.current(
          (pieceDrag.canvasMoved
            ? uiMessage("canvas.designCanvas.theRest") +
              (travel.copy ? "copied" : "moved") +
              "; the elements stayed \u2014 "
            : uiMessage("canvas.designCanvas.nothing") +
              (travel.copy ? "copied" : "moved") +
              " \u2014 ") + uiMessage("canvas.designCanvas.theCanvasIsReadOnly"),
        );
        return refuseAll();
      }
      let addedEntries: Dynamic = [
        ...newPieces.map(
          ({ file: file, src: src, spec: spec }: Dynamic): Dynamic => ({
            file: file,
            src: src,
            spec: spec,
          }),
        ),
        ...addedRecords.entries,
      ];
      deps.history.recordManifestHistory.current(
        {
          kind: "add",
          entries: addedEntries,
          ...(addedRecords.anns.length > 0
            ? {
                anns: addedRecords.anns,
              }
            : {}),
          ...(state.moves.length > 0
            ? {
                moves: state.moves,
              }
            : {}),
          ...(state.annMoves.length > 0
            ? {
                annMoves: state.annMoves,
              }
            : {}),
        },
        new Set(addedEntries.map((addedEntry?: Dynamic): Dynamic => addedEntry.file)),
        undefined,
        dragToken,
      );
      try {
        for (let createdPiece of newPieces as Dynamic) {
          await getKvClient().set(
            projectFileKey(createdPiece.file),
            createdPiece.src,
          );
          deps.document.markArtboardDropped(createdPiece.file);
        }
      } catch (error: Dynamic) {
        for (let traveller of travel.travellers as Dynamic)
          travel.endHome(traveller.file, false);
        console.error("set pieces:", error);
        deps.feedback.showToast.current(
          uiMessage("canvas.designCanvas.couldnTFinishTheDrop") +
            keyboardShortcutLabel("Z") +
            " takes back what was made.",
        );
        return refuseAll();
      }
      deps.document.persistManifest({
        artboards: [
          ...deps.document.manifest.current.artboards.filter(
            (artboard?: Dynamic): Dynamic =>
              !newPieces.some(
                (createdPiece?: Dynamic): Dynamic => createdPiece.file === artboard.file,
              ),
          ),
          ...newPieces.map((createdPiece?: Dynamic): Dynamic => createdPiece.spec),
        ],
      });
      let sourceFiles: Dynamic = [...entries.keys()];
      cancelHomeMoves();
      let historyGroup: Dynamic = travel.copy
          ? undefined
          : deps.history.inlineHistory.current?.group(sourceFiles, {
              bound: dragToken,
              atomic: true,
            }),
        refusedFiles: Dynamic = [...items],
        writtenFiles: Dynamic = [],
        keptTidsByFile: Dynamic = new Map();
      await Promise.all(
        sourceFiles.map(async (file?: Dynamic): Promise<Dynamic> => {
          if (travel.copy) {
            travel.endHome(file, false);
            return;
          }
          let entry: Dynamic = deps.target.artboardEntries.current.get(file),
            movedTids: Dynamic = entries.get(file) ?? [],
            remainingTids: Dynamic = (
              selectionAtStart.elements.get(file)?.tids ?? []
            ).filter(
              (tid?: Dynamic): Dynamic => !movedTids.includes(tid),
            ),
            removeResult: Dynamic = entry
              ? await entry
                  .removeTravelled(movedTids, remainingTids)
                  .catch((): Dynamic => "failed")
              : "failed";
          historyGroup?.settled(file);
          typeof removeResult == "string"
            ? refusedFiles.push(file)
            : (writtenFiles.push(file), keptTidsByFile.set(file, removeResult.kept));
          travel.endHome(file, typeof removeResult != "string");
        }),
      );
      historyGroup?.end();
      for (let traveller of travel.travellers as Dynamic)
        sourceFiles.includes(traveller.file) ||
          travel.endHome(traveller.file, false);
      for (let writtenFile of writtenFiles as Dynamic)
        deps.session.dragSessions.current.set(writtenFile, Date.now());
      let bothPlacesFiles: Dynamic = sourceFiles.filter(
          (file?: Dynamic): Dynamic => refusedFiles.includes(file),
        ),
        staysByFile: Dynamic = new Map();
      for (let piece of pieces as Dynamic)
        newPieces.some(
          (createdPiece?: Dynamic): Dynamic =>
            createdPiece.home === piece.file && createdPiece.tid === piece.tid,
        ) ||
          staysByFile.set(piece.file, [
            ...(staysByFile.get(piece.file) ?? []),
            piece.tid,
          ]);
      let joinNames: Dynamic = (names?: Dynamic): Dynamic =>
        names.length === 1
          ? names[0]
          : names.slice(0, -1).join(", ") +
            " and " +
            names[names.length - 1];
      if (bothPlacesFiles.length > 0) {
        let artboardNames: Dynamic = bothPlacesFiles.map(deps.target.getArtboardTitle);
        deps.feedback.showToast.current(
          uiMessage("canvas.designCanvas.movedOntoTheCanvasBut") +
            joinNames(artboardNames) +
            " kept what was dragged, so it is now in both places. Check " +
            (artboardNames.length === 1 ? uiMessage("canvas.designCanvas.thatArtboard") : uiMessage("canvas.designCanvas.thoseArtboards")) +
            ".",
        );
      } else
        staysByFile.size > 0
          ? deps.feedback.clearToast(
              (travel.copy ? "Copied" : "Moved") +
                " " +
                String(newPieces.length) +
                (newPieces.length === 1 ? " element" : " elements") +
                " onto the canvas. The rest stayed in " +
                joinNames([...staysByFile.keys()].map(deps.target.getArtboardTitle)) +
                " \u2014 repeated, nested or locked elements stay with their artboard.",
            )
          : deps.feedback.clearToast(
              (travel.copy ? "Copied" : "Moved") +
                (newPieces.length === 1
                  ? ""
                  : " " + String(newPieces.length) + " elements") +
                " onto the canvas",
            );
      deps.selection.abandonGesture();
      let nextElements: Dynamic = new Map();
      if (!travel.copy) {
        for (let [file, elements] of selectionAtStart.elements as Dynamic)
          sourceFiles.includes(file) || nextElements.set(file, elements);
        for (let file of sourceFiles as Dynamic) {
          let entry: Dynamic = selectionAtStart.elements.get(file);
          if (!entry) continue;
          let keptTids: Dynamic = writtenFiles.includes(file)
            ? (keptTidsByFile.get(file) ?? [])
            : null;
          keptTids === null
            ? nextElements.set(file, entry)
            : keptTids.length > 0 &&
              nextElements.set(file, {
                ...entry,
                tids: keptTids,
                rect: null,
                count: keptTids.length,
              });
        }
      }
      let focusedFile: Dynamic = deps.selection.focusedFile.current;
      (focusedFile == null ||
        nextElements.get(focusedFile) !== selectionAtStart.elements.get(focusedFile)) &&
        deps.selection.clearFramePick();
      let nextSelection: Dynamic = replaceSelectedElements(
        selectionFromArtboards(
          new Set(newPieces.map((createdPiece?: Dynamic): Dynamic => createdPiece.file)),
        ),
        nextElements,
        null,
      );
      deps.selection.setSelection(nextSelection);
      for (let file of [
        ...new Set([
          ...sourceFiles,
          ...items,
          ...travel.travellers.map(
            (traveller?: Dynamic): Dynamic => traveller.file,
          ),
        ]),
      ] as Dynamic)
        deps.target.artboardEntries.current.get(file)?.moveSettle();
      (window as Dynamic).setTimeout((): Dynamic => {
        for (let file of new Set([
          ...writtenFiles,
          ...nextElements.keys(),
        ]) as Dynamic) {
          let tids: Dynamic = nextElements.get(file)?.tids ?? null;
          file === deps.selection.focusedFile.current
            ? deps.selection.setShownFrameSelection(file, tids)
            : deps.target.artboardEntries.current
                .get(file)
                ?.setShownSelection(
                  tids,
                  tids ? deps.target.componentName(file) : null,
                );
        }
      }, 80);
      let unmovedFiles: Dynamic = items.filter(
        (file?: Dynamic): Dynamic =>
          !sourceFiles.includes(file) && selectionAtStart.elements.has(file),
      );
      unmovedFiles.length > 0 &&
        bothPlacesFiles.length === 0 &&
        staysByFile.size === 0 &&
        deps.feedback.showToast.current(
          uiMessage("canvas.designCanvas.nothingMovedInside") +
            joinNames(unmovedFiles.map(deps.target.getArtboardTitle)) +
            "; the rest " +
            (travel.copy ? "copied" : "moved") +
            ".",
        );
      return {
        written: writtenFiles,
        refused: refusedFiles,
        selection: nextSelection,
      };
    }

/** 元素拖动松手后的提交：把元素移动或复制到目标画板（landTravellers/moveElements），失败时回滚并合并历史，返回写入与被拒结果；含 pieces 时转交 commitPieceDragOntoCanvas。 */
export async function commitElementMoveAcrossArtboards(deps: { readonly target: { readonly getArtboardTitle: Dynamic; readonly artboardEntries: Dynamic; readonly componentName: Dynamic }; readonly session: { readonly commitPieceDrag: Dynamic; readonly dragSessions: Dynamic; readonly waitForBoundOperation: Dynamic }; readonly history: { readonly boundSelections: Dynamic; readonly inlineHistory: Dynamic }; readonly selection: { readonly apply: Dynamic; readonly focusedFile: Dynamic; readonly current: Dynamic; readonly setShownFrameSelection: Dynamic; readonly ignoreClearFromFile: Dynamic }; readonly feedback: { readonly showToast: Dynamic } }, elementDrag?: Dynamic): Promise<Dynamic> {
      let {
        token: dragToken,
        plans: plans,
        unanswered: unansweredFiles,
        travel: travel,
      }: Dynamic = elementDrag;
      if (travel?.pieces) return deps.session.commitPieceDrag(elementDrag);
      elementDrag.canvas();
      let items: Dynamic = [...plans.keys()],
        selectionAtStart: Dynamic = deps.selection.current.current,
        focusedFile: Dynamic = deps.selection.focusedFile.current,
        refusedFiles: Dynamic = [...unansweredFiles],
        entries: Dynamic = new Map(selectionAtStart.elements),
        writtenFiles: Dynamic = [],
        primary: Dynamic = selectionAtStart.primary,
        revertedFiles: Dynamic = [];
      if (travel) {
        let target: Dynamic = travel.target,
          canvasSourceFiles: Dynamic = travel.travellers
            .filter((traveller?: Dynamic): Dynamic => !traveller.external)
            .map((traveller?: Dynamic): Dynamic => traveller.file),
          otherFiles: Dynamic = items.filter(
            (file?: Dynamic): Dynamic =>
              file !== target && !canvasSourceFiles.includes(file),
          ),
          landingItems: Dynamic = [],
          leftoverTidsByFile: Dynamic = new Map();
        for (let traveller of travel.travellers as Dynamic) {
          let entry: Dynamic = deps.target.artboardEntries.current.get(traveller.file),
            leftoverTids: Dynamic = [];
          for (let member of traveller.members as Dynamic) {
            let landing: Dynamic = travel.plan.landing.find(
                (candidate?: Dynamic): Dynamic => candidate.tid === member.index,
              ),
              memberHtml: Dynamic = landing
                ? (member.html ??
                  (entry
                    ? await entry
                        .travellerHtml(member.tid)
                        .catch((): Dynamic => null)
                    : null))
                : null;
            landing && memberHtml
              ? landingItems.push({
                  file: traveller.file,
                  tid: member.tid,
                  html: memberHtml,
                  landing: landing,
                })
              : leftoverTids.push(member.tid);
          }
          leftoverTidsByFile.set(traveller.file, leftoverTids);
        }
        let isCopy: Dynamic = travel.copy === true,
          involvedFiles: Dynamic = isCopy
            ? [target, ...otherFiles]
            : [...new Set([target, ...canvasSourceFiles, ...otherFiles])],
          historyGroup: Dynamic = deps.history.inlineHistory.current?.group(
            involvedFiles,
            isCopy
              ? {
                  bound: dragToken,
                }
              : {
                  bound: dragToken,
                  atomic: true,
                  holder: target,
                  waiting: canvasSourceFiles.filter(
                    (file?: Dynamic): Dynamic => file !== target,
                  ),
                },
          );
        try {
          focusedFile != null &&
            involvedFiles.includes(focusedFile) &&
            (deps.selection.ignoreClearFromFile.current = focusedFile);
          let entry: Dynamic = deps.target.artboardEntries.current.get(target),
            targetOwnTids: Dynamic =
              isCopy && canvasSourceFiles.includes(target)
                ? []
                : (selectionAtStart.elements.get(target)?.tids ?? []),
            landResult: Dynamic = await (
              entry?.landTravellers(
                landingItems.map(
                  ({ html: html, landing: landing }: Dynamic): Dynamic => ({
                    key: landing.tid,
                    html: html,
                    landing: landing,
                  }),
                ),
                plans.get(target) ?? [],
                targetOwnTids,
              ) ?? Promise.resolve("failed")
            ).catch((): Dynamic => "failed");
          historyGroup?.settled(target);
          let landedTidsByFile: Dynamic = new Map(),
            targetNewTids: Dynamic = [],
            landedFiles: Dynamic = [],
            revertLandings: Dynamic = async (): Promise<Dynamic> => {
              for (let landedFile of [...landedFiles].reverse() as Dynamic) {
                let frameEntry: Dynamic = deps.target.artboardEntries.current.get(landedFile),
                  discardHistory: Dynamic = frameEntry
                    ? (historyGroup?.discard(landedFile) ?? null)
                    : null;
                if (!frameEntry || !discardHistory) return false;
                if (
                  !(await frameEntry
                    .applyHistory(deps.target.componentName(landedFile), "undo")
                    .catch((): Dynamic => false))
                ) {
                  discardHistory();
                  return false;
                }
                frameEntry.dropRedo();
                landedFiles.pop();
                revertedFiles.push(landedFile);
                writtenFiles = writtenFiles.filter(
                  (writtenFile?: Dynamic): Dynamic => writtenFile !== landedFile,
                );
                let previousEntry: Dynamic = selectionAtStart.elements.get(landedFile);
                previousEntry
                  ? entries.set(landedFile, previousEntry)
                  : entries.delete(landedFile);
              }
              return true;
            };
          if (landResult === "failed") {
            refusedFiles.push(target);
            target === focusedFile &&
              deps.selection.ignoreClearFromFile.current === focusedFile &&
              (deps.selection.ignoreClearFromFile.current = null);
            for (let traveller of travel.travellers as Dynamic)
              leftoverTidsByFile.set(
                traveller.file,
                traveller.members.map(
                  (member?: Dynamic): Dynamic => member.tid,
                ),
              );
          } else {
            for (let landingItem of landingItems as Dynamic) {
              let landedTids: Dynamic = landResult.landed.get(landingItem.landing.tid);
              if (!landedTids || landedTids.length === 0) {
                leftoverTidsByFile.get(landingItem.file)?.push(landingItem.tid);
                continue;
              }
              let fileLandedTids: Dynamic = landedTidsByFile.get(landingItem.file) ?? [];
              fileLandedTids.push(landingItem.tid);
              landedTidsByFile.set(landingItem.file, fileLandedTids);
              targetNewTids.push(...landedTids);
            }
            let stayers: Dynamic = landResult.stayers;
            stayers && typeof stayers == "object"
              ? targetNewTids.push(...stayers.newTids)
              : (stayers === "refused" && refusedFiles.push(target),
                targetNewTids.push(...(landResult.stayersOwn ?? targetOwnTids)));
            (targetNewTids.length > 0 || landedTidsByFile.size > 0) && writtenFiles.push(target);
            if (landedTidsByFile.size > 0) {
              let targetIndex: Dynamic = refusedFiles.indexOf(target);
              targetIndex >= 0 && refusedFiles.splice(targetIndex, 1);
            }
            landedTidsByFile.size > 0 && landedFiles.push(target);
          }
          let moveResults: Dynamic = await Promise.all(
            otherFiles.map(
              (file?: Dynamic): Dynamic =>
                (
                  deps.target.artboardEntries.current
                    .get(file)
                    ?.moveElements(plans.get(file) ?? []) ??
                  Promise.resolve("failed")
                )
                  .catch((): Dynamic => "failed")
                  .finally((): Dynamic => historyGroup?.settled(file)),
            ),
          );
          otherFiles.forEach((file?: Dynamic, fileIndex?: Dynamic): Dynamic => {
            let moveResult: Dynamic = moveResults[fileIndex],
              previousEntry: Dynamic = selectionAtStart.elements.get(file);
            if (typeof moveResult == "string" || !previousEntry) {
              (moveResult === "refused" || moveResult === "failed") &&
                refusedFiles.push(file);
              file === focusedFile &&
                deps.selection.ignoreClearFromFile.current === focusedFile &&
                (deps.selection.ignoreClearFromFile.current = null);
              return;
            }
            entries.set(file, {
              ...previousEntry,
              tids: moveResult.newTids,
              rect: null,
              count: moveResult.newTids.length,
            });
            writtenFiles.push(file);
          });
          let fileLabel: Dynamic = deps.target.getArtboardTitle,
            joinNames: Dynamic = (names?: Dynamic): Dynamic =>
              names.length <= 1
                ? (names[0] ?? "")
                : names.slice(0, -1).join(", ") +
                  " and " +
                  names[names.length - 1],
            partialFiles: Dynamic = [],
            noLandingFiles: Dynamic = [],
            revertState: Dynamic = null;
          for (let traveller of travel.travellers as Dynamic) {
            if (traveller.external) continue;
            if (isCopy) {
              travel.endHome(traveller.file, false);
              traveller.file !== target &&
                (landedTidsByFile.get(traveller.file)?.length ?? 0) > 0 &&
                entries.delete(traveller.file);
              continue;
            }
            let frameEntry: Dynamic = deps.target.artboardEntries.current.get(traveller.file),
              landedTids: Dynamic = landedTidsByFile.get(traveller.file) ?? [],
              remainingTids: Dynamic = (
                selectionAtStart.elements.get(traveller.file)?.tids ?? []
              ).filter(
                (tid?: Dynamic): Dynamic => !landedTids.includes(tid),
              ),
              keptTids: Dynamic = remainingTids,
              didRemove: Dynamic = false;
            if (revertState != null) {
              keptTids = selectionAtStart.elements.get(traveller.file)?.tids ?? [];
              revertState.how === "partial" &&
                landedTids.length > 0 &&
                partialFiles.push(traveller.file);
            } else if (landedTids.length > 0) {
              historyGroup?.admit(traveller.file);
              let removeResult: Dynamic = frameEntry
                ? await frameEntry
                    .removeTravelled(landedTids, remainingTids)
                    .catch((): Dynamic => "failed")
                : "failed";
              typeof removeResult == "string"
                ? (historyGroup?.settled(traveller.file),
                  (keptTids =
                    selectionAtStart.elements.get(traveller.file)?.tids ?? []),
                  (revertState = {
                    at: traveller.file,
                    how: (await revertLandings()) ? "reverted" : "partial",
                  }),
                  revertState.how === "partial" &&
                    partialFiles.push(...revertedFiles, traveller.file))
                : ((keptTids = removeResult.kept),
                  (didRemove = true),
                  writtenFiles.push(traveller.file),
                  landedFiles.push(traveller.file));
            } else noLandingFiles.push(traveller.file);
            traveller.file === focusedFile &&
              !didRemove &&
              deps.selection.ignoreClearFromFile.current === focusedFile &&
              (deps.selection.ignoreClearFromFile.current = null);
            historyGroup?.settled(traveller.file);
            travel.endHome(traveller.file, didRemove);
            let previousEntry: Dynamic = selectionAtStart.elements.get(traveller.file);
            keptTids.length === 0
              ? entries.delete(traveller.file)
              : previousEntry &&
                entries.set(traveller.file, {
                  ...previousEntry,
                  tids: keptTids,
                  rect: null,
                  count: keptTids.length,
                });
          }
          let partlyStayedFiles: Dynamic = canvasSourceFiles.filter(
              (file?: Dynamic): Dynamic =>
                !noLandingFiles.includes(file) &&
                (leftoverTidsByFile.get(file)?.length ?? 0) > 0,
            ),
            verb: Dynamic = isCopy ? "copy" : "move";
          revertState?.how === "reverted"
            ? deps.feedback.showToast.current(
                uiMessage("canvas.designCanvas.couldnT") +
                  verb +
                  " to " +
                  fileLabel(target) +
                  ". " +
                  fileLabel(revertState.at) +
                  " kept what was dragged, so the copies in " +
                  fileLabel(target) +
                  " were removed.",
              )
            : partialFiles.length > 0
              ? deps.feedback.showToast.current(
                  uiMessage("canvas.designCanvas.theMoveLandedIn") +
                    fileLabel(target) +
                    " but could not leave " +
                    joinNames(partialFiles.map(fileLabel)) +
                    (partialFiles.length > 1
                      ? ". Check those artboards."
                      : ". Check both artboards."),
                )
              : noLandingFiles.length > 0 && landResult !== "failed"
                ? deps.feedback.showToast.current(
                    uiMessage("canvas.designCanvas.nowhereToLandIn") +
                      fileLabel(target) +
                      " for " +
                      joinNames(noLandingFiles.map(fileLabel)) +
                      "'s selection; " +
                      (isCopy ? uiMessage("canvas.designCanvas.nothingOfItWasCopied") : uiMessage("canvas.designCanvas.itStayed")),
                  )
                : partlyStayedFiles.length > 0 &&
                  deps.feedback.showToast.current(
                    uiMessage("canvas.designCanvas.partOf") +
                      joinNames(partlyStayedFiles.map(fileLabel)) +
                      "'s selection could not land in " +
                      fileLabel(target) +
                      (isCopy
                        ? "; that part was not copied."
                        : "; that part stayed where it was."),
                  );
          partialFiles = [];
          if (targetNewTids.length > 0 && revertState?.how !== "reverted") {
            let targetEntry: Dynamic = selectionAtStart.elements.get(target);
            entries.set(
              target,
              targetEntry
                ? {
                    ...targetEntry,
                    tids: targetNewTids,
                    rect: null,
                    count: targetNewTids.length,
                  }
                : {
                    name: deps.target.componentName(target),
                    tids: targetNewTids,
                    rect: null,
                    count: targetNewTids.length,
                  },
            );
            primary = target;
          }
          if (revertState?.how !== "reverted")
            for (let file of [target, ...canvasSourceFiles] as Dynamic)
              deps.session.dragSessions.current.set(file, Date.now());
        } finally {
          historyGroup?.end();
        }
      } else {
        let historyGroup: Dynamic =
          items.length > 0
            ? deps.history.inlineHistory.current?.group(items, {
                bound: dragToken,
              })
            : undefined;
        focusedFile != null &&
          items.includes(focusedFile) &&
          (deps.selection.ignoreClearFromFile.current = focusedFile);
        let moveResults: Dynamic = await Promise.all(
          items.map(
            (file?: Dynamic): Dynamic =>
              (
                deps.target.artboardEntries.current
                  .get(file)
                  ?.moveElements(plans.get(file) ?? []) ??
                Promise.resolve("failed")
              )
                .catch((): Dynamic => "failed")
                .finally((): Dynamic => historyGroup?.settled(file)),
          ),
        );
        historyGroup?.end();
        items.forEach((file?: Dynamic, fileIndex?: Dynamic): Dynamic => {
          let moveResult: Dynamic = moveResults[fileIndex],
            entry: Dynamic = selectionAtStart.elements.get(file);
          if (typeof moveResult == "string" || !entry) {
            (moveResult === "refused" || moveResult === "failed") &&
              refusedFiles.push(file);
            file === focusedFile &&
              deps.selection.ignoreClearFromFile.current === focusedFile &&
              (deps.selection.ignoreClearFromFile.current = null);
            return;
          }
          entries.set(file, {
            ...entry,
            tids: moveResult.newTids,
            rect: null,
            count: moveResult.newTids.length,
          });
        });
        writtenFiles = items.filter(
          (file?: Dynamic, fileIndex?: Dynamic): Dynamic =>
            typeof moveResults[fileIndex] != "string",
        );
      }
      elementDrag.canvasDropped &&
        deps.feedback.showToast.current(
          uiMessage("canvas.designCanvas.theArtboardsAndNotesIn") +
            (elementDrag.copy ? "copy" : "move") +
            " \u2014 the drag was interrupted; try it again.",
        );
      let baseSelection: Dynamic = selectionAtStart;
      if (elementDrag.copy && elementDrag.canvasMoved && !elementDrag.canvasDropped) {
        deps.history.boundSelections.current.has(dragToken) || (await deps.session.waitForBoundOperation(dragToken));
        let entry: Dynamic = deps.history.boundSelections.current.get(dragToken);
        deps.history.boundSelections.current.delete(dragToken);
        baseSelection = entry
          ? selectionFromBoards({
              files: entry.files,
              notes: entry.notes,
            })
          : selectionFromBoards({
              files: emptyCanvasSelectionFiles,
              notes: emptyCanvasSelectionFiles,
            });
      } else
        elementDrag.copy &&
          (baseSelection = selectionFromBoards({
            files: emptyCanvasSelectionFiles,
            notes: emptyCanvasSelectionFiles,
          }));
      let nextSelection: Dynamic = replaceSelectedElements(
        baseSelection,
        entries,
        primary,
      );
      deps.selection.apply(nextSelection);
      let finalSelection: Dynamic = nextSelection,
        touchedFiles: Dynamic = [
          ...new Set([
            ...items,
            ...(travel
              ? [
                  travel.target,
                  ...travel.travellers.map(
                    (traveller?: Dynamic): Dynamic => traveller.file,
                  ),
                ]
              : []),
          ]),
        ];
      for (let file of touchedFiles as Dynamic)
        !writtenFiles.includes(file) &&
          !revertedFiles.includes(file) &&
          deps.target.artboardEntries.current.get(file)?.moveSettle();
      for (let file of unansweredFiles as Dynamic)
        deps.target.artboardEntries.current.get(file)?.moveSettle();
      (window as Dynamic).setTimeout((): Dynamic => {
        for (let file of [
          ...new Set([...writtenFiles, ...revertedFiles]),
        ] as Dynamic) {
          let tids: Dynamic =
            deps.selection.current.current.elements.get(file)?.tids ?? null;
          file === deps.selection.focusedFile.current
            ? deps.selection.setShownFrameSelection(file, tids)
            : deps.target.artboardEntries.current
                .get(file)
                ?.setShownSelection(
                  tids,
                  tids ? deps.target.componentName(file) : null,
                );
          deps.target.artboardEntries.current.get(file)?.moveSettle();
        }
      }, 80);
      if (refusedFiles.length > 0) {
        let refusedLabels: Dynamic = refusedFiles.map(deps.target.getArtboardTitle),
          refusedText: Dynamic =
            refusedLabels.length === 1
              ? refusedLabels[0]
              : refusedLabels.slice(0, -1).join(", ") +
                " and " +
                refusedLabels[refusedLabels.length - 1],
          nothingMoved: Dynamic = writtenFiles.length === 0;
        deps.feedback.showToast.current(
          nothingMoved && !elementDrag.canvasMoved
            ? uiMessage("canvas.designCanvas.nothingMoved")
            : nothingMoved
              ? uiMessage("canvas.designCanvas.theRestMovedNothingMoved") + refusedText + "."
              : uiMessage("canvas.designCanvas.nothingMovedInside") + refusedText + "; the rest moved.",
        );
      }
      return {
        written: writtenFiles,
        refused: refusedFiles,
        selection: finalSelection,
      };
    }

/** 画布对象在某画板上松手时运行（onDropObjectInto）：把说明、图片或无框画板内容作为元素插入目标画板，处理超时、只读与失败提示。 */
export function dropCanvasObjectIntoArtboard(deps: { readonly target: { readonly getArtboardTitle: Dynamic; readonly artboardEntries: Dynamic; readonly componentName: Dynamic; readonly playingFile: Dynamic; readonly fullscreenActive: Dynamic; readonly recordDropTarget: Dynamic; readonly pageContents: Dynamic }; readonly session: { readonly dropInProgress: Dynamic; readonly hoverSession: Dynamic; readonly closeHoverTarget: Dynamic; readonly pendingSelectionCommands: Dynamic; readonly waitForBoundOperation: Dynamic }; readonly history: { readonly waitForDropHistory: Dynamic; readonly inlineHistory: Dynamic }; readonly document: { readonly annotationToHtml: Dynamic; readonly dropCanvasObject: Dynamic; readonly deleteCanvasObjects: Dynamic; readonly manifest: Dynamic }; readonly selection: { readonly focusedFile: Dynamic; readonly current: Dynamic; readonly setSelection: Dynamic; readonly setShownFrameSelection: Dynamic }; readonly feedback: { readonly showToast: Dynamic; readonly showDragToast: Dynamic; readonly clearDragToast: Dynamic } }, objectDrop?: Dynamic): Dynamic {
        let {
          target: targetFile,
          point: dropPoint,
          at: objectBox,
          ctrl: isKeepMode,
        }: Dynamic = objectDrop;
        if (deps.target.fullscreenActive.current || targetFile === deps.target.playingFile.current) return false;
        let targetArtboard: Dynamic = deps.target.pageContents.current.artboards.find(
            (candidate?: Dynamic): Dynamic => candidate.file === targetFile,
          ),
          entry: Dynamic = deps.target.artboardEntries.current.get(targetFile);
        if (
          !targetArtboard ||
          targetArtboard.frameless ||
          !entry ||
          deps.session.dropInProgress.current ||
          deps.session.pendingSelectionCommands.current > 0
        )
          return false;
        let loadMarkup: Dynamic, movedSelection: Dynamic, objectKind: Dynamic;
        if ("note" in objectDrop.object) {
          let note: Dynamic = (deps.document.manifest.current.annotations ?? []).find(
            (annotation?: Dynamic): Dynamic => annotation.id === objectDrop.object.note,
          );
          if (!note) return false;
          let noteMarkup: Dynamic = deps.document.annotationToHtml(note);
          if (!noteMarkup) return false;
          loadMarkup = async (): Promise<Dynamic> => noteMarkup;
          movedSelection = {
            files: new Set(),
            notes: new Set([note.id]),
          };
          objectKind = note.kind === "image" ? "image" : "note";
        } else {
          let file: Dynamic = objectDrop.object.file,
            pieceEntry: Dynamic = deps.target.artboardEntries.current.get(file);
          if (
            !pieceEntry ||
            !deps.document.manifest.current.artboards.find(
              (candidate?: Dynamic): Dynamic => candidate.file === file,
            )?.frameless
          )
            return false;
          loadMarkup = (): Dynamic => pieceEntry.pieceContent();
          movedSelection = {
            files: new Set([file]),
            notes: new Set(),
          };
          objectKind = "piece";
        }
        let hoverSession: Dynamic =
            deps.session.hoverSession.current?.gestureKey === objectDrop.key
              ? deps.session.hoverSession.current
              : null,
          isHoverTarget: Dynamic =
            !!hoverSession?.target && hoverSession.target.file === targetFile;
        hoverSession && !isHoverTarget && deps.session.closeHoverTarget();
        deps.session.hoverSession.current = null;
        deps.session.dropInProgress.current = true;
        (async (): Promise<Dynamic> => {
          try {
            let objectHtml: Dynamic =
                (hoverSession?.html ?? null) || (await loadMarkup()),
              rootCount: Dynamic = objectHtml
                ? pastedRootElementCount(objectHtml)
                : 0;
            if (!objectHtml || rootCount !== 1) {
              isHoverTarget &&
                hoverSession?.target &&
                hoverSession.target.opened.then(
                  (): Dynamic => entry.moveHost(hoverSession.token, "close"),
                );
              deps.feedback.showDragToast(
                objectHtml
                  ? uiMessage("canvas.designCanvas.nothingMovedThisPieceHolds") +
                      String(rootCount) +
                      " elements; a piece with one element can join an artboard."
                  : uiMessage("canvas.designCanvas.nothingMovedThis") +
                      objectKind +
                      " has nothing that can go into an artboard.",
              );
              return;
            }
            let localX: Dynamic = dropPoint.x - targetArtboard.x,
              localY: Dynamic = dropPoint.y - targetArtboard.y,
              state: Dynamic = {
                ew: objectBox.w,
                eh: objectBox.h,
                ox: 0,
                oy: 0,
                gx: dropPoint.x - objectBox.x,
                gy: dropPoint.y - objectBox.y,
              },
              dragToken: Dynamic =
                isHoverTarget && hoverSession
                  ? hoverSession.token
                  : randomSessionToken(),
              didLand: Dynamic = false,
              didCommitViaPlan: Dynamic = false,
              planSelection: Dynamic = null,
              geometry: Dynamic = pastedElementGeometry(
                objectHtml,
                state,
              );
            if (
              geometry &&
              canFreezeSinglePaste(
                false,
                [0],
                objectHtml,
                false,
              ) &&
              canFreezeSinglePaste(
                false,
                [0],
                objectHtml,
                await entry.isFreeCanvas(objectHtml),
              )
            ) {
              let deadline: Dynamic = Date.now() + 1500,
                timedOutMarker: Dynamic = Symbol(uiMessage("canvas.designCanvas.timedOut")),
                withDeadline: Dynamic = (task?: Dynamic): Dynamic => {
                  let index: Dynamic = 0,
                    promise: Dynamic = new Promise(
                      (resolve?: Dynamic): Dynamic => {
                        index = (window as Dynamic).setTimeout(
                          (): Dynamic => resolve(timedOutMarker),
                          Math.max(0, deadline - Date.now()),
                        );
                      },
                    );
                  return Promise.race([
                    task.catch((): Dynamic => timedOutMarker),
                    promise,
                  ]).finally(
                    (): Dynamic => (window as Dynamic).clearTimeout(index),
                  );
                };
              try {
                let openResult: Dynamic = await withDeadline(
                    isHoverTarget && hoverSession?.target
                      ? hoverSession.target.opened
                      : (
                          hoverSession?.closing.get(targetFile) ?? Promise.resolve()
                        ).then(
                          (): Dynamic => entry.moveHost(dragToken, "open"),
                        ),
                  ),
                  dropPlan: Dynamic =
                    openResult === true
                      ? await withDeadline(
                          entry.dropPlanAt(
                            dragToken,
                            {
                              x: localX,
                              y: localY,
                            },
                            [geometry],
                            isKeepMode ? "keep" : "flow",
                          ),
                        )
                      : openResult;
                if (dropPlan === timedOutMarker) {
                  deps.feedback.showDragToast(
                    uiMessage("canvas.designCanvas.nothingMoved2") +
                      deps.target.getArtboardTitle(targetFile) +
                      " did not answer; try the drag again.",
                  );
                  return;
                }
                let landingItem: Dynamic = dropPlan
                  ? (dropPlan.landing.find(
                      (item?: Dynamic): Dynamic => item.tid === 0,
                    ) ?? null)
                  : null;
                if (dropPlan && landingItem) {
                  didCommitViaPlan = true;
                  let commitResult: Dynamic = await deps.document.dropCanvasObject({
                    token: dragToken,
                    plans: new Map(),
                    unanswered: [],
                    canvasMoved: false,
                    copy: false,
                    canvas: (): Dynamic => {},
                    travel: {
                      target: targetFile,
                      pureTarget: true,
                      plan: dropPlan,
                      travellers: [
                        {
                          file: "<canvas>",
                          external: true,
                          members: [
                            {
                              tid: 0,
                              index: 0,
                              html: objectHtml,
                            },
                          ],
                        },
                      ],
                      endHome: (): Dynamic => {},
                    },
                  });
                  didLand = commitResult.written.includes(targetFile);
                  didLand &&
                    ((planSelection = commitResult.selection),
                    entry.dropPlanClear(dragToken, true));
                }
              } finally {
                let closeMoveHost: Dynamic = (): Dynamic => {
                  entry.dropPlanClear(dragToken);
                  entry.moveHost(dragToken, "close");
                };
                didLand
                  ? (window as Dynamic).setTimeout(closeMoveHost, 150)
                  : closeMoveHost();
              }
            }
            if (!didLand && didCommitViaPlan) return;
            let insertedTids: Dynamic = null;
            if (!didLand) {
              let historyGroup: Dynamic = deps.history.inlineHistory.current?.group([targetFile], {
                bound: dragToken,
              });
              try {
                let newTids: Dynamic = await entry.insertHtml(
                  positionPastedHtml(objectHtml, {
                    ew: state.ew,
                    ox: localX - state.gx,
                    oy: localY - state.gy,
                  }),
                  "root-end",
                );
                didLand = newTids.length > 0;
                didLand &&
                  ((insertedTids = newTids),
                  entry.setShownSelection(newTids, deps.target.componentName(targetFile)));
              } finally {
                historyGroup?.settled(targetFile);
                historyGroup?.end();
                if (isHoverTarget && hoverSession?.target) {
                  let target: Dynamic = hoverSession.target;
                  entry.dropPlanClear(hoverSession.token);
                  target.opened
                    .then(
                      (): Dynamic => entry.moveHost(hoverSession.token, "close"),
                    )
                    .catch((): Dynamic => false);
                }
              }
            }
            if (!didLand) {
              deps.feedback.showDragToast(uiMessage("canvas.designCanvas.couldNotMoveNothingChanged"));
              return;
            }
            deps.target.recordDropTarget(targetFile);
            let selectionAfter: Dynamic = insertedTids
                ? selectionFromElements(targetFile, {
                    name: deps.target.componentName(targetFile),
                    tids: insertedTids,
                    rect: null,
                    count: insertedTids.length,
                  })
                : (planSelection ?? deps.selection.current.current),
              filteredSelection: Dynamic = filterSelectedAnnotations(
                filterSelectedArtboards(
                  selectionAfter,
                  (file?: Dynamic): Dynamic => !movedSelection.files.has(file),
                ),
                (noteId?: Dynamic): Dynamic => !movedSelection.notes.has(noteId),
              ),
              flushPromise: Dynamic =
                movedSelection.files.size > 0 ? deps.session.waitForBoundOperation(dragToken) : null;
            if (!deps.document.deleteCanvasObjects.current(movedSelection, dragToken)) {
              await deps.history.waitForDropHistory(targetFile, dragToken, objectKind);
              deps.feedback.showDragToast(
                uiMessage("canvas.designCanvas.nothingMovedThe") +
                  objectKind +
                  " could not leave the canvas.",
              );
              return;
            }
            deps.feedback.clearDragToast(uiMessage("canvas.designCanvas.movedInto") + deps.target.getArtboardTitle(targetFile));
            if (flushPromise) {
              deps.session.pendingSelectionCommands.current++;
              try {
                await flushPromise;
              } finally {
                deps.session.pendingSelectionCommands.current--;
              }
            }
            deps.selection.setSelection(filteredSelection);
            (window as Dynamic).setTimeout((): Dynamic => {
              deps.selection.setSelection(filteredSelection);
              let shownTids: Dynamic =
                filteredSelection.elements.get(targetFile)?.tids ?? null;
              targetFile === deps.selection.focusedFile.current
                ? deps.selection.setShownFrameSelection(targetFile, shownTids)
                : entry.setShownSelection(
                    shownTids,
                    shownTids ? deps.target.componentName(targetFile) : null,
                  );
            }, 160);
          } catch (error: Dynamic) {
            deps.feedback.showToast(
              uiMessage("canvas.designCanvas.couldnTFinishTheDrop2") + String(error),
              "error",
            );
            if (isHoverTarget && hoverSession?.target) {
              let target: Dynamic = hoverSession.target;
              entry.dropPlanClear(hoverSession.token);
              target.opened
                .then((): Dynamic => entry.moveHost(hoverSession.token, "close"))
                .catch((): Dynamic => false);
            }
          } finally {
            deps.session.dropInProgress.current = false;
          }
        })();
        return true;
      }

/** 从聚焦画板拖出的元素松手时运行：落在空白处则新建画板，落在另一画板则移动或复制进去，失败时回滚并提示。 */
export function dropElementDragAtCanvasPoint(deps: { readonly target: { readonly getArtboardTitle: Dynamic; readonly activeArtboard: Dynamic; readonly artboardEntries: Dynamic; readonly componentName: Dynamic; readonly playingFile: Dynamic; readonly fullscreenActive: Dynamic; readonly recordDropTarget: Dynamic; readonly pageContents: Dynamic }; readonly session: { readonly dropInProgress: Dynamic; readonly hoverSession: Dynamic; readonly pendingSelectionCommands: Dynamic; readonly runSelectionCommand: Dynamic }; readonly history: { readonly recordManifestHistory: Dynamic; readonly inlineHistory: Dynamic }; readonly document: { readonly savePageSelection: Dynamic; readonly doc: Dynamic; readonly supportsLoadState: Dynamic; readonly manifest: Dynamic; readonly persistManifest: Dynamic; readonly markArtboardDropped: Dynamic; readonly dropCanvasObject: Dynamic }; readonly selection: { readonly abandonGesture: Dynamic; readonly setSelection: Dynamic; readonly clearFramePick: Dynamic }; readonly feedback: { readonly showToast: Dynamic; readonly showDragToast: Dynamic; readonly clearDragToast: Dynamic } }, elementDrag?: Dynamic,
        dropX?: Dynamic,
        dropY?: Dynamic,
        isCopy?: Dynamic): Dynamic {
        let hoverSession: Dynamic =
          deps.session.hoverSession.current?.gestureKey === elementDrag.key
            ? deps.session.hoverSession.current
            : null;
        deps.session.hoverSession.current = null;
        let closeHoverTarget: Dynamic = (keepFile?: Dynamic): Dynamic => {
          let hoverTarget: Dynamic = hoverSession?.target;
          if (!hoverSession || !hoverTarget || hoverTarget.file === keepFile) return;
          let targetEntry: Dynamic = deps.target.artboardEntries.current.get(hoverTarget.file);
          targetEntry?.dropPlanClear(hoverSession.token);
          hoverSession.closing.set(
            hoverTarget.file,
            hoverTarget.opened
              .then((): Dynamic => targetEntry?.moveHost(hoverSession.token, "close"))
              .catch((): Dynamic => false),
          );
          hoverSession.target = null;
        };
        if (deps.target.fullscreenActive.current) {
          closeHoverTarget();
          deps.feedback.showDragToast(
            uiMessage("canvas.designCanvas.nothingMovedOnlyThisArtboard"),
          );
          return;
        }
        let targetArtboard: Dynamic = [...deps.target.pageContents.current.artboards]
          .reverse()
          .find(
            (candidate?: Dynamic): Dynamic =>
              !(candidate.frameless && candidate.file !== deps.target.activeArtboard.current) &&
              dropX >= candidate.x &&
              dropX <= candidate.x + candidate.w &&
              dropY >= candidate.y &&
              dropY <= candidate.y + candidate.h,
          );
        closeHoverTarget(targetArtboard?.file);
        if (targetArtboard != null && targetArtboard.file === deps.target.playingFile.current) {
          closeHoverTarget();
          deps.feedback.showDragToast(
            uiMessage("canvas.designCanvas.nothingMovedThatArtboardIs"),
          );
          return;
        }
        if (!targetArtboard) {
          let sourceEntry: Dynamic = deps.target.artboardEntries.current.get(elementDrag.file);
          if (!sourceEntry || deps.session.dropInProgress.current || deps.session.pendingSelectionCommands.current > 0) return;
          deps.session.dropInProgress.current = true;
          let releaseLock: Dynamic;
          (async (): Promise<Dynamic> => {
            try {
              let liftBox: Dynamic = elementDrag.box ?? {
                  w: 320,
                  h: 200,
                  ew: 320,
                  eh: 200,
                  ox: 0,
                  oy: 0,
                  gx: 160,
                  gy: 100,
                },
                markup: Dynamic = sourceEntry.serializeSelection(elementDrag.tids, {
                  lift: liftBox,
                });
              if (!markup) {
                deps.feedback.showDragToast(
                  uiMessage("canvas.designCanvas.nothingMovedRepeatedOrRoot"),
                );
                return;
              }
              let files: Dynamic = deps.document.doc.content().files;
              if (
                Object.keys(files).length >=
                PlatformFileContentFilesValue
              ) {
                deps.feedback.showToast(
                  uiMessage("canvas.designCanvas.couldnTMakeANew") +
                    String(PlatformFileContentFilesValue) +
                    "-file limit; delete something first",
                  "error",
                );
                return;
              }
              await sourceEntry.flushPending();
              let homeSource: Dynamic =
                  (await getKvClient().get(
                    projectFileKey(elementDrag.file),
                  )) ??
                  files[elementDrag.file] ??
                  "",
                newFile: Dynamic = uniqueArtboardFile(
                  files,
                  "Piece",
                  deps.document.supportsLoadState,
                ),
                newDocument: Dynamic = buildDcDocument(
                  markup,
                  typeof homeSource == "string" ? homeSource : "",
                );
              await getKvClient().set(
                projectFileKey(newFile),
                newDocument,
              );
              deps.document.markArtboardDropped(newFile);
              let state: Dynamic = {
                  file: newFile,
                  x: Math.round(dropX - liftBox.gx),
                  y: Math.round(dropY - liftBox.gy),
                  w: Math.min(
                    maxArtboardSize,
                    Math.max(
                      minArtboardSize,
                      liftBox.w,
                    ),
                  ),
                  h: Math.min(
                    maxArtboardSize,
                    Math.max(
                      minArtboardSize,
                      liftBox.h,
                    ),
                  ),
                  title: uniqueElementArtboardTitle(
                    elementDrag.label,
                    deps.document.manifest.current.artboards,
                  ),
                  frameless: true,
                  ...deps.document.savePageSelection(),
                },
                historyToken: Dynamic = isCopy
                  ? undefined
                  : randomSessionToken();
              isCopy ||
                (releaseLock = deps.session.runSelectionCommand(dragDropLockKind));
              deps.history.recordManifestHistory.current(
                {
                  kind: "add",
                  entries: [
                    {
                      file: newFile,
                      src: newDocument,
                      spec: state,
                    },
                  ],
                },
                new Set([newFile]),
                undefined,
                historyToken,
              );
              deps.document.persistManifest({
                artboards: [
                  ...deps.document.manifest.current.artboards.filter(
                    (candidate?: Dynamic): Dynamic => candidate.file !== newFile,
                  ),
                  state,
                ],
              });
              if (!isCopy) {
                let historyGroup: Dynamic = deps.history.inlineHistory.current?.group(
                    [elementDrag.file],
                    {
                      bound: historyToken,
                      atomic: true,
                    },
                  ),
                  didRemove: Dynamic = false;
                try {
                  didRemove = await sourceEntry.removeSelection(elementDrag.tids);
                } finally {
                  historyGroup?.end();
                }
                if (!didRemove) {
                  deps.feedback.showDragToast(
                    uiMessage("canvas.designCanvas.copiedOntoTheCanvasThe"),
                  );
                  return;
                }
              }
              deps.feedback.clearDragToast((isCopy ? "Copied" : "Moved") + " onto the canvas");
              deps.selection.abandonGesture();
              deps.selection.clearFramePick();
              deps.selection.setSelection(
                selectionFromArtboards(new Set([newFile])),
              );
            } catch (error: Dynamic) {
              deps.feedback.showToast(
                uiMessage("canvas.designCanvas.couldnTFinishTheDrop2") + String(error),
                "error",
              );
            } finally {
              releaseLock?.();
              deps.session.dropInProgress.current = false;
            }
          })();
          return;
        }
        if (targetArtboard.file === elementDrag.file) {
          deps.feedback.showDragToast(
            uiMessage("canvas.designCanvas.releasedOverTheSameArtboard"),
          );
          return;
        }
        let entry: Dynamic = deps.target.artboardEntries.current.get(elementDrag.file),
          targetFrameEntry: Dynamic = deps.target.artboardEntries.current.get(targetArtboard.file);
        if (!entry || !targetFrameEntry || deps.session.dropInProgress.current || deps.session.pendingSelectionCommands.current > 0) {
          closeHoverTarget();
          return;
        }
        deps.session.dropInProgress.current = true;
        (async (): Promise<Dynamic> => {
          let isHoverTarget: Dynamic = hoverSession?.target?.file === targetArtboard.file,
            historyGroup: Dynamic,
            releaseLock: Dynamic;
          try {
            let markup: Dynamic = entry.serializeSelection(elementDrag.tids, {
              bakeProps: true,
              vals: await entry.renderDefaults(),
            });
            if (!markup) {
              deps.feedback.showDragToast(
                uiMessage("canvas.designCanvas.nothingMovedRepeatedOrRoot"),
              );
              return;
            }
            let box: Dynamic = elementDrag.box,
              localX: Dynamic = dropX - targetArtboard.x,
              localY: Dynamic = dropY - targetArtboard.y,
              geometry: Dynamic = box
                ? pastedElementGeometry(markup, box)
                : null,
              useAbsolutePosition: Dynamic = false;
            if (
              geometry &&
              canFreezeSinglePaste(
                isCopy,
                elementDrag.tids,
                markup,
                false,
              ) &&
              canFreezeSinglePaste(
                isCopy,
                elementDrag.tids,
                markup,
                await targetFrameEntry.isFreeCanvas(markup),
              )
            ) {
              let dragSessionToken: Dynamic =
                isHoverTarget && hoverSession
                  ? hoverSession.token
                  : randomSessionToken();
              isHoverTarget = false;
              let deadline: Dynamic = Date.now() + 1500,
                timedOutMarker: Dynamic = Symbol(uiMessage("canvas.designCanvas.timedOut")),
                withDeadline: Dynamic = (task?: Dynamic): Dynamic => {
                  let index: Dynamic = 0,
                    promise: Dynamic = new Promise(
                      (resolve?: Dynamic): Dynamic => {
                        index = (window as Dynamic).setTimeout(
                          (): Dynamic => resolve(timedOutMarker),
                          Math.max(0, deadline - Date.now()),
                        );
                      },
                    );
                  return Promise.race([
                    task.catch((): Dynamic => timedOutMarker),
                    promise,
                  ]).finally(
                    (): Dynamic => (window as Dynamic).clearTimeout(index),
                  );
                },
                didCommit: Dynamic = false;
              try {
                let openResult: Dynamic = await withDeadline(
                    (
                      hoverSession?.closing.get(targetArtboard.file) ??
                      Promise.resolve()
                    ).then((): Dynamic => targetFrameEntry.moveHost(dragSessionToken, "open")),
                  ),
                  dropPlan: Dynamic =
                    openResult === true
                      ? await withDeadline(
                          targetFrameEntry.dropPlanAt(
                            dragSessionToken,
                            {
                              x: localX,
                              y: localY,
                            },
                            [geometry],
                            elementDrag.ctrl ? "keep" : "flow",
                          ),
                        )
                      : openResult;
                if (dropPlan === timedOutMarker) {
                  deps.feedback.showDragToast(
                    uiMessage("canvas.designCanvas.nothingMoved2") +
                      deps.target.getArtboardTitle(targetArtboard.file) +
                      " did not answer; try the drag again.",
                  );
                  return;
                }
                let landingItem: Dynamic = dropPlan
                  ? (dropPlan.landing.find(
                      (item?: Dynamic): Dynamic => item.tid === 0,
                    ) ?? null)
                  : null;
                useAbsolutePosition = !landingItem;
                if (dropPlan && landingItem) {
                  let commitResult: Dynamic = await deps.document.dropCanvasObject({
                    token: dragSessionToken,
                    plans: new Map(),
                    unanswered: [],
                    canvasMoved: false,
                    copy: false,
                    canvas: (): Dynamic => {},
                    travel: {
                      target: targetArtboard.file,
                      pureTarget: true,
                      plan: dropPlan,
                      travellers: [
                        {
                          file: elementDrag.file,
                          members: [
                            {
                              tid: elementDrag.tids[0],
                              index: 0,
                            },
                          ],
                        },
                      ],
                      endHome: (): Dynamic => {},
                    },
                  });
                  deps.target.recordDropTarget(targetArtboard.file);
                  didCommit = commitResult.written.includes(targetArtboard.file);
                  didCommit && targetFrameEntry.dropPlanClear(dragSessionToken, true);
                  didCommit &&
                    commitResult.written.includes(elementDrag.file) &&
                    deps.feedback.clearDragToast(uiMessage("canvas.designCanvas.movedTo") + deps.target.getArtboardTitle(targetArtboard.file));
                  return;
                }
              } finally {
                let closeMoveHost: Dynamic = (): Dynamic => {
                  targetFrameEntry.dropPlanClear(dragSessionToken);
                  targetFrameEntry.moveHost(dragSessionToken, "close");
                };
                didCommit
                  ? (window as Dynamic).setTimeout(closeMoveHost, 150)
                  : closeMoveHost();
              }
            }
            let pasteOffset: Dynamic = box
              ? {
                  ew: box.ew,
                  ox: localX - box.gx + box.ox,
                  oy: localY - box.gy + box.oy,
                }
              : {
                  ox: localX,
                  oy: localY,
                };
            isCopy ||
              ((historyGroup = deps.history.inlineHistory.current?.group(
                [targetArtboard.file, elementDrag.file],
                {
                  atomic: true,
                  holder: targetArtboard.file,
                  waiting: [elementDrag.file],
                },
              )),
              (releaseLock = deps.session.runSelectionCommand(dragDropLockKind)));
            let insertedTids: Dynamic = useAbsolutePosition
              ? await targetFrameEntry.insertHtml(
                  positionPastedHtml(markup, pasteOffset),
                  "root-end",
                )
              : await targetFrameEntry.insertHtml(markup, "root-end", pasteOffset);
            deps.target.recordDropTarget(targetArtboard.file);
            if (insertedTids.length === 0) {
              deps.feedback.showDragToast(uiMessage("canvas.designCanvas.couldNotMoveNothingChanged"));
              return;
            }
            if (isCopy)
              deps.feedback.clearDragToast(
                uiMessage("canvas.designCanvas.copiedTo") + targetArtboard.file.replace(/\.dc\.html$/, ""),
              );
            else {
              historyGroup?.admit(elementDrag.file);
              if (!(await entry.removeSelection(elementDrag.tids))) {
                historyGroup?.end();
                let discardHistory: Dynamic =
                    historyGroup?.discard(targetArtboard.file) ?? null,
                  didUndo: Dynamic = discardHistory
                    ? await targetFrameEntry
                        .applyHistory(deps.target.componentName(targetArtboard.file), "undo")
                        .catch((): Dynamic => false)
                    : false;
                discardHistory && !didUndo && discardHistory();
                didUndo && targetFrameEntry.dropRedo();
                deps.feedback.showDragToast(
                  didUndo
                    ? uiMessage("canvas.designCanvas.couldNotMoveReverted")
                    : uiMessage("canvas.designCanvas.moveFailedHalfwayCheckBoth"),
                );
                return;
              }
              deps.feedback.clearDragToast(uiMessage("canvas.designCanvas.movedTo") + deps.target.getArtboardTitle(targetArtboard.file));
            }
            deps.selection.abandonGesture();
            deps.selection.setSelection(
              setCanvasElementSelection(
                emptyCanvasSelection,
                targetArtboard.file,
                {
                  name: deps.target.componentName(targetArtboard.file),
                  tids: insertedTids,
                  rect: null,
                  count: insertedTids.length,
                },
                false,
              ),
            );
            targetFrameEntry.setShownSelection(insertedTids, deps.target.componentName(targetArtboard.file));
          } finally {
            historyGroup?.end();
            releaseLock?.();
            if (isHoverTarget && hoverSession) {
              targetFrameEntry.dropPlanClear(hoverSession.token);
              let target: Dynamic = hoverSession.target;
              hoverSession.closing.set(
                targetArtboard.file,
                (target?.opened ?? Promise.resolve(true))
                  .then(
                    (): Dynamic => targetFrameEntry.moveHost(hoverSession.token, "close"),
                  )
                  .catch((): Dynamic => false),
              );
            }
            deps.session.dropInProgress.current = false;
          }
        })();
      }

/** 画板 iframe 上报元素拖动事件（arm/move/exit/finish/cancel）时运行：维护拖出会话状态，松手时调用 dropElementDragAtCanvasPoint。 */
export function handleFrameElementDragEvent(deps: { readonly target: { readonly focusedFile: Dynamic; readonly artboardEntries: Dynamic }; readonly session: { readonly frameDrag: Dynamic; readonly setStreamDragFile: Dynamic; readonly dragTimer: Dynamic; readonly startHoverSession: Dynamic; readonly updateHoverTarget: Dynamic; readonly clearFrameDrag: Dynamic; readonly finishDragSession: Dynamic; readonly cancelFrameDrag: Dynamic; readonly handleElementDrag: Dynamic; readonly draggedArtboard: Dynamic; readonly hostGesturing: Dynamic }; readonly preview: { readonly setDragPreview: Dynamic; readonly describeDragPreview: Dynamic; readonly prepareDragGhost: Dynamic }; readonly selection: { readonly describeSelection: Dynamic }; readonly document: { readonly manifest: Dynamic }; readonly feedback: { readonly showDragToast: Dynamic } }, file?: Dynamic, dragEvent?: Dynamic): Dynamic {
        let activeDrag: Dynamic = deps.session.frameDrag.current;
        if (dragEvent.type === "arm") {
          if (
            file !== deps.target.focusedFile.current ||
            deps.session.hostGesturing.current ||
            (activeDrag &&
              activeDrag.file === file &&
              activeDrag.key !== dragEvent.key &&
              deps.session.clearFrameDrag(),
            deps.session.finishDragSession(),
            !dragEvent.tids)
          )
            return;
          let pickedSelection: Dynamic = deps.selection.describeSelection(file, dragEvent.tids);
          if (!pickedSelection) return;
          deps.session.draggedArtboard.current = {
            key: dragEvent.key,
            file: file,
            tids: pickedSelection.tids,
            alt: dragEvent.alt,
            box: dragEvent.box,
            label: pickedSelection.label,
          };
          deps.preview.prepareDragGhost(deps.session.draggedArtboard.current);
          deps.session.startHoverSession(deps.session.draggedArtboard.current);
          deps.session.setStreamDragFile(file);
          deps.session.dragTimer.current && clearTimeout(deps.session.dragTimer.current);
          deps.session.dragTimer.current = setTimeout(deps.session.finishDragSession, 6e4);
          return;
        }
        if (dragEvent.type === "disarm") {
          let armedDrag: Dynamic = deps.session.draggedArtboard.current;
          armedDrag &&
            armedDrag.file === file &&
            armedDrag.key === dragEvent.key &&
            deps.session.finishDragSession();
          activeDrag && activeDrag.file === file && activeDrag.key === dragEvent.key
            ? (activeDrag.pendingDrop &&
                deps.feedback.showDragToast(
                  uiMessage("canvas.designCanvas.nothingMovedTheArtboardEnded"),
                ),
              deps.session.clearFrameDrag())
            : !activeDrag && !deps.session.draggedArtboard.current && deps.session.setStreamDragFile(null);
          return;
        }
        if (dragEvent.type === "exit") {
          if (file !== deps.target.focusedFile.current) return;
          if (activeDrag) {
            if (activeDrag.file === file) {
              if (activeDrag.key !== dragEvent.key) return;
              activeDrag.echoed = true;
              let pendingDrop: Dynamic = activeDrag.pendingDrop;
              if (!pendingDrop) {
                deps.preview.prepareDragGhost(activeDrag);
                return;
              }
              deps.session.clearFrameDrag(true);
              deps.target.artboardEntries.current.get(file)?.hostDrag("finish", activeDrag.key);
              deps.session.handleElementDrag(
                activeDrag,
                pendingDrop.cx,
                pendingDrop.cy,
                pendingDrop.alt,
              );
              return;
            }
            deps.session.clearFrameDrag();
          }
          if (deps.session.hostGesturing.current) return;
          let pickedSelection: Dynamic = deps.selection.describeSelection(file, dragEvent.tids);
          if (!pickedSelection) return;
          deps.session.frameDrag.current = {
            key: dragEvent.key,
            file: file,
            tids: pickedSelection.tids,
            alt: dragEvent.alt,
            ctrl: false,
            box: dragEvent.box,
            label: pickedSelection.label,
            moves: [],
            latched: false,
            startedAt: Date.now(),
            echoed: true,
            pendingDrop: null,
          };
          deps.preview.prepareDragGhost(deps.session.frameDrag.current);
          deps.session.setStreamDragFile(file);
          deps.session.dragTimer.current && clearTimeout(deps.session.dragTimer.current);
          deps.session.dragTimer.current = setTimeout(deps.session.cancelFrameDrag, 3e4);
          return;
        }
        if (
          !activeDrag ||
          activeDrag.key !== dragEvent.key ||
          activeDrag.file !== file
        )
          return;
        if (dragEvent.type === "cancel") {
          deps.session.clearFrameDrag();
          return;
        }
        let artboard: Dynamic = deps.document.manifest.artboards.find(
          (candidate?: Dynamic): Dynamic => candidate.file === file,
        );
        if (!artboard) return;
        let canvasX: Dynamic = artboard.x + dragEvent.x,
          canvasY: Dynamic = artboard.y + dragEvent.y;
        if (activeDrag.pendingDrop) return;
        if (dragEvent.type === "move") {
          let now: Dynamic = Date.now();
          for (
            activeDrag.moves.push(now);
            activeDrag.moves.length > 0 &&
            (activeDrag.moves[0] < now - 1e3 ||
              activeDrag.moves.length > 240);

          )
            activeDrag.moves.shift();
          activeDrag.moves.length > 120 && (activeDrag.latched = true);
          deps.session.dragTimer.current && clearTimeout(deps.session.dragTimer.current);
          deps.session.dragTimer.current = setTimeout(deps.session.cancelFrameDrag, 3e4);
          activeDrag.latched ||
            deps.preview.setDragPreview(deps.preview.describeDragPreview(activeDrag, canvasX, canvasY, dragEvent.alt));
          activeDrag.ctrl = dragEvent.ctrl;
          deps.session.updateHoverTarget(activeDrag, canvasX, canvasY, dragEvent.alt);
          return;
        }
        let hasMoved: Dynamic = activeDrag.moves.length > 0;
        deps.session.clearFrameDrag(hasMoved);
        hasMoved &&
          ((activeDrag.ctrl = dragEvent.ctrl),
          deps.session.handleElementDrag(activeDrag, canvasX, canvasY, dragEvent.alt));
      }

/** 外壳侧指针接管元素拖动后运行（onHostDrag：stale/move/exit/cancel/finish）：更新拖出会话与幽灵位置，松手时提交落点。 */
export function handleHostElementDragEvent(deps: { readonly target: { readonly focusedFile: Dynamic; readonly artboardEntries: Dynamic }; readonly session: { readonly frameDrag: Dynamic; readonly dragTimer: Dynamic; readonly updateHoverTarget: Dynamic; readonly clearFrameDrag: Dynamic; readonly finishDragSession: Dynamic; readonly cancelFrameDrag: Dynamic; readonly handleElementDrag: Dynamic; readonly draggedArtboard: Dynamic }; readonly preview: { readonly setDragPreview: Dynamic; readonly describeDragPreview: Dynamic }; readonly feedback: { readonly showDragToast: Dynamic } }, eventType?: Dynamic,
        pointX?: Dynamic,
        pointY?: Dynamic,
        isAlt?: Dynamic,
        isCtrl: Dynamic = false): Dynamic {
        let activeDrag: Dynamic = deps.session.frameDrag.current,
          armedDrag: Dynamic = deps.session.draggedArtboard.current,
          dragSession: Dynamic = activeDrag ?? armedDrag,
          frameEntry: Dynamic = dragSession
            ? deps.target.artboardEntries.current.get(dragSession.file)
            : undefined;
        if (!activeDrag?.pendingDrop) {
          if (eventType === "stale") {
            deps.session.cancelFrameDrag();
            return;
          }
          if (eventType === "move") {
            if (!activeDrag) {
              if (!armedDrag || armedDrag.file !== deps.target.focusedFile.current)
                return;
              activeDrag = {
                ...armedDrag,
                alt: isAlt,
                ctrl: isCtrl,
                moves: [],
                latched: false,
                startedAt: Date.now(),
                echoed: false,
                pendingDrop: null,
              };
              deps.session.frameDrag.current = activeDrag;
              frameEntry?.hostDrag("exit", armedDrag.key, isAlt);
            }
            activeDrag.moves.push(Date.now());
            activeDrag.moves.length > 240 && activeDrag.moves.shift();
            deps.session.dragTimer.current && clearTimeout(deps.session.dragTimer.current);
            deps.session.dragTimer.current = setTimeout(deps.session.cancelFrameDrag, 3e4);
            deps.preview.setDragPreview(deps.preview.describeDragPreview(activeDrag, pointX, pointY, isAlt));
            activeDrag.ctrl = isCtrl;
            deps.session.updateHoverTarget(activeDrag, pointX, pointY, isAlt);
            return;
          }
          deps.session.finishDragSession();
          if (!activeDrag) {
            armedDrag && frameEntry?.hostDrag("cancel", armedDrag.key);
            return;
          }
          activeDrag.ctrl = isCtrl;
          if (eventType === "cancel" || activeDrag.moves.length === 0) {
            deps.session.clearFrameDrag();
            frameEntry?.hostDrag("cancel", activeDrag.key);
            return;
          }
          if (!activeDrag.echoed) {
            activeDrag.pendingDrop = {
              cx: pointX,
              cy: pointY,
              alt: isAlt,
            };
            deps.preview.setDragPreview(null);
            deps.session.dragTimer.current && clearTimeout(deps.session.dragTimer.current);
            deps.session.dragTimer.current = setTimeout((): Dynamic => {
              deps.session.frameDrag.current?.pendingDrop &&
                deps.feedback.showDragToast(
                  uiMessage("canvas.designCanvas.nothingMovedTheArtboardDid"),
                );
              deps.session.cancelFrameDrag();
            }, 1500);
            return;
          }
          deps.session.clearFrameDrag(true);
          frameEntry?.hostDrag("finish", activeDrag.key);
          deps.session.handleElementDrag(activeDrag, pointX, pointY, isAlt);
        }
      }
