import { CanvasWorkingStateConstant_8 as dragDropLockKind } from "../working-state";
import { PlatformFileContentConstant_17 as minArtboardSize } from "../../platform/file-content";
import { PlatformFileContentConstant_18 as maxArtboardOffset } from "../../platform/file-content";
import { PlatformFileContentFilesValue } from "../../platform/file-content";
import { PlatformFileContentHandler_4 } from "../../platform/file-content";
import { PlatformFileContentLimit_6 as maxArtboardSize } from "../../platform/file-content";
import { PreviewBuildDocumentResolvedValue_3 as ghostSrcdoc } from "../../preview/build-document";
import { buildDcDocument } from "../../editor/clipboard/html-placement";
import { buildPreviewDocument } from "../../preview/build-document";
import { canFreezeSinglePaste } from "../../editor/insert/drop-targets";
import { collectProjectDependencyFiles } from "../../preview/dependency-graph";
import { createLinkedFileScript } from "../../preview/module-cache";
import { emptyCanvasSelection } from "../../editor/selection/canvas-selection";
import { filterSelectedAnnotations } from "../../editor/selection/canvas-selection";
import { filterSelectedArtboards } from "../../editor/selection/canvas-selection";
import { getKvClient } from "../../platform/file-content";
import { keyboardShortcutLabel } from "../../editor/keyboard/shortcuts";
import { mergeDesignSystemFileOverlay } from "../../design-system/file-overlay";
import { normalizeProjectBlobPaths } from "../../preview/blob-paths";
import { pastedElementGeometry } from "../../editor/insert/drop-targets";
import { pastedRootElementCount } from "../../editor/insert/drop-targets";
import { positionPastedHtml } from "../../editor/clipboard/html-placement";
import { randomSessionToken } from "../working-state";
import { replaceSelectedElements } from "../../editor/selection/canvas-selection";
import { runtimeModuleBlobs } from "../../preview/module-cache";
import { runtimeModuleUrls } from "../../preview/module-cache";
import { selectionFromArtboards } from "../../editor/selection/canvas-selection";
import { selectionFromBoards } from "../../editor/selection/canvas-selection";
import { selectionFromElements } from "../../editor/selection/canvas-selection";
import { setCanvasElementSelection } from "../../editor/selection/canvas-selection";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { uniqueArtboardFile } from "../../platform/file-content";
import { uniqueElementArtboardTitle } from "../../platform/file-content";
import { dragGhostFilename, emptyCanvasSelectionFiles } from "../design-canvas";

/** 跨画板拖动携带 pieces（元素被拖出到空白画布）时运行：把拖出的元素生成为新画板或画布图形，处理复制/移动、只读与中断，返回写入与被拒结果。 */
export async function commitPieceDragOntoCanvas(deps: { readonly abandonSelectionGesture: Dynamic; readonly callback2: Dynamic; readonly callback3: Dynamic; readonly doc: Dynamic; readonly focusedFileRef: Dynamic; readonly selectionRef: Dynamic; readonly setSelection: Dynamic; readonly setShownFrameSelection: Dynamic; readonly supportsLoadState: Dynamic; readonly value127: Dynamic; readonly value141: Dynamic; readonly value142: Dynamic; readonly value143: Dynamic; readonly value144: Dynamic; readonly value153: Dynamic; readonly value177: Dynamic; readonly value189: Dynamic; readonly value19: Dynamic; readonly value224: Dynamic; readonly value396: Dynamic; readonly value432: Dynamic; readonly value448: Dynamic; readonly value62: Dynamic; readonly value73: Dynamic; readonly value98: Dynamic }, pieceDrag?: Dynamic): Promise<Dynamic> {
      let { token: dragToken, travel: travel }: Dynamic = pieceDrag,
        selectionAtStart: Dynamic = deps.selectionRef.current,
        pieces: Dynamic = travel?.pieces ?? [],
        items: Dynamic = [...pieceDrag.unanswered],
        cancelHomeMoves: Dynamic = (): Dynamic => {
          for (let file of pieceDrag.plans.keys() as Dynamic) {
            let entry: Dynamic = deps.value177.current.get(file);
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
                ? deps.value144(dragToken)
                : Promise.resolve(),
            canvasResult: Dynamic = pieceDrag.canvas();
          for (let traveller of (travel?.travellers ?? []) as Dynamic)
            travel?.endHome(traveller.file, false);
          await pendingFlush;
          deps.value448.current(
            canvasResult === false
              ? uiMessage("canvas.designCanvas.nothing") +
                  (pieceDrag.copy ? "copied" : "moved") +
                  " \u2014 the drag was interrupted; try it again."
              : message,
          );
          pieceDrag.copy &&
            pieceDrag.canvasMoved &&
            (deps.value142.current.has(dragToken)
              ? Promise.resolve()
              : deps.value144(dragToken)
            ).then((): Dynamic => {
              let entry: Dynamic = deps.value142.current.get(dragToken);
              deps.value142.current.delete(dragToken);
              entry &&
                (entry.files.size > 0 || entry.notes.size > 0) &&
                deps.setSelection(
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
      let files: Dynamic = deps.doc.content().files;
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
      deps.value143.current.set(dragToken, (nextMoveRecord?: Dynamic): Dynamic => {
        state = nextMoveRecord;
      });
      deps.value141.current.set(dragToken, (source?: Dynamic): Dynamic => {
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
          ? deps.value144(dragToken)
          : Promise.resolve(),
        canvasMoveResult: Dynamic;
      try {
        canvasMoveResult = pieceDrag.canvas();
      } finally {
        deps.value143.current.delete(dragToken);
      }
      travel.copy &&
        pieceDrag.canvasMoved &&
        (await Promise.race([
          promise,
          canvasMoveFlush,
          new Promise((resolve?: Dynamic): Dynamic => setTimeout(resolve, 2e3)),
        ]));
      deps.value141.current.delete(dragToken);
      deps.value142.current.delete(dragToken);
      let addedRecords: Dynamic = {
        entries: addedBatches.flatMap(
          (batch?: Dynamic): Dynamic => batch.entries,
        ),
        anns: addedBatches.flatMap((batch?: Dynamic): Dynamic => batch.anns),
      };
      if (pieceDrag.canvasMoved && canvasMoveResult === false) {
        for (let traveller of travel.travellers as Dynamic)
          travel.endHome(traveller.file, false);
        deps.value448.current(
          uiMessage("canvas.designCanvas.nothing") +
            (travel.copy ? "copied" : "moved") +
            " \u2014 the drag was interrupted; try it again.",
        );
        return refuseAll();
      }
      let recordHistory: Dynamic = (): Dynamic => {
        (state.moves.length > 0 || state.annMoves.length > 0) &&
          deps.value396.current(
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
          deps.value396.current(
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
        Object.keys(deps.doc.content().files).length + pieces.length >
        PlatformFileContentFilesValue
      ) {
        recordHistory();
        for (let traveller of travel.travellers as Dynamic)
          travel.endHome(traveller.file, false);
        deps.value448.current(
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
            ...deps.doc.content().files,
            ...Object.fromEntries(
              addedRecords.entries.map(
                (addedEntry?: Dynamic): Dynamic => [addedEntry.file, addedEntry.src],
              ),
            ),
          },
          artboards: [
            ...deps.value73.current.artboards,
            ...addedRecords.entries.map((addedEntry?: Dynamic): Dynamic => addedEntry.spec),
          ],
        };
      try {
        for (let piece of pieces as Dynamic) {
          let entry: Dynamic = deps.value177.current.get(piece.file);
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
                PlatformFileContentHandler_4(piece.file),
              )) ??
              files[piece.file] ??
              "",
            newFile: Dynamic = uniqueArtboardFile(
              draftDocument.files,
              "Piece",
              deps.supportsLoadState,
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
              ...deps.callback3(),
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
        deps.value448.current(
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
        deps.value448.current(
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
      if (!deps.value224.current) {
        recordHistory();
        for (let traveller of travel.travellers as Dynamic)
          travel.endHome(traveller.file, false);
        deps.value448.current(
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
      deps.value396.current(
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
            PlatformFileContentHandler_4(createdPiece.file),
            createdPiece.src,
          );
          deps.value127.current.set(createdPiece.file, Date.now());
        }
      } catch (error: Dynamic) {
        for (let traveller of travel.travellers as Dynamic)
          travel.endHome(traveller.file, false);
        console.error("set pieces:", error);
        deps.value448.current(
          uiMessage("canvas.designCanvas.couldnTFinishTheDrop") +
            keyboardShortcutLabel("Z") +
            " takes back what was made.",
        );
        return refuseAll();
      }
      deps.value98({
        artboards: [
          ...deps.value73.current.artboards.filter(
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
          : deps.value432.current?.group(sourceFiles, {
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
          let entry: Dynamic = deps.value177.current.get(file),
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
        deps.value153.current.set(writtenFile, Date.now());
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
        let artboardNames: Dynamic = bothPlacesFiles.map(deps.callback2);
        deps.value448.current(
          uiMessage("canvas.designCanvas.movedOntoTheCanvasBut") +
            joinNames(artboardNames) +
            " kept what was dragged, so it is now in both places. Check " +
            (artboardNames.length === 1 ? uiMessage("canvas.designCanvas.thatArtboard") : uiMessage("canvas.designCanvas.thoseArtboards")) +
            ".",
        );
      } else
        staysByFile.size > 0
          ? deps.value189(
              (travel.copy ? "Copied" : "Moved") +
                " " +
                String(newPieces.length) +
                (newPieces.length === 1 ? " element" : " elements") +
                " onto the canvas. The rest stayed in " +
                joinNames([...staysByFile.keys()].map(deps.callback2)) +
                " \u2014 repeated, nested or locked elements stay with their artboard.",
            )
          : deps.value189(
              (travel.copy ? "Copied" : "Moved") +
                (newPieces.length === 1
                  ? ""
                  : " " + String(newPieces.length) + " elements") +
                " onto the canvas",
            );
      deps.abandonSelectionGesture();
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
      let focusedFile: Dynamic = deps.focusedFileRef.current;
      (focusedFile == null ||
        nextElements.get(focusedFile) !== selectionAtStart.elements.get(focusedFile)) &&
        deps.value62();
      let nextSelection: Dynamic = replaceSelectedElements(
        selectionFromArtboards(
          new Set(newPieces.map((createdPiece?: Dynamic): Dynamic => createdPiece.file)),
        ),
        nextElements,
        null,
      );
      deps.setSelection(nextSelection);
      for (let file of [
        ...new Set([
          ...sourceFiles,
          ...items,
          ...travel.travellers.map(
            (traveller?: Dynamic): Dynamic => traveller.file,
          ),
        ]),
      ] as Dynamic)
        deps.value177.current.get(file)?.moveSettle();
      (window as Dynamic).setTimeout((): Dynamic => {
        for (let file of new Set([
          ...writtenFiles,
          ...nextElements.keys(),
        ]) as Dynamic) {
          let tids: Dynamic = nextElements.get(file)?.tids ?? null;
          file === deps.focusedFileRef.current
            ? deps.setShownFrameSelection(file, tids)
            : deps.value177.current
                .get(file)
                ?.setShownSelection(
                  tids,
                  tids ? deps.value19(file) : null,
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
        deps.value448.current(
          uiMessage("canvas.designCanvas.nothingMovedInside") +
            joinNames(unmovedFiles.map(deps.callback2)) +
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
export async function commitElementMoveAcrossArtboards(deps: { readonly applyCanvasSelection: Dynamic; readonly callback2: Dynamic; readonly callback4: Dynamic; readonly focusedFileRef: Dynamic; readonly selectionRef: Dynamic; readonly setShownFrameSelection: Dynamic; readonly value142: Dynamic; readonly value144: Dynamic; readonly value153: Dynamic; readonly value177: Dynamic; readonly value19: Dynamic; readonly value25: Dynamic; readonly value432: Dynamic; readonly value448: Dynamic }, elementDrag?: Dynamic): Promise<Dynamic> {
      let {
        token: dragToken,
        plans: plans,
        unanswered: unansweredFiles,
        travel: travel,
      }: Dynamic = elementDrag;
      if (travel?.pieces) return deps.callback4(elementDrag);
      elementDrag.canvas();
      let items: Dynamic = [...plans.keys()],
        selectionAtStart: Dynamic = deps.selectionRef.current,
        focusedFile: Dynamic = deps.focusedFileRef.current,
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
          let entry: Dynamic = deps.value177.current.get(traveller.file),
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
          historyGroup: Dynamic = deps.value432.current?.group(
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
            (deps.value25.current = focusedFile);
          let entry: Dynamic = deps.value177.current.get(target),
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
                let frameEntry: Dynamic = deps.value177.current.get(landedFile),
                  discardHistory: Dynamic = frameEntry
                    ? (historyGroup?.discard(landedFile) ?? null)
                    : null;
                if (!frameEntry || !discardHistory) return false;
                if (
                  !(await frameEntry
                    .applyHistory(deps.value19(landedFile), "undo")
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
              deps.value25.current === focusedFile &&
              (deps.value25.current = null);
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
                  deps.value177.current
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
                deps.value25.current === focusedFile &&
                (deps.value25.current = null);
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
          let fileLabel: Dynamic = deps.callback2,
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
            let frameEntry: Dynamic = deps.value177.current.get(traveller.file),
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
              deps.value25.current === focusedFile &&
              (deps.value25.current = null);
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
            ? deps.value448.current(
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
              ? deps.value448.current(
                  uiMessage("canvas.designCanvas.theMoveLandedIn") +
                    fileLabel(target) +
                    " but could not leave " +
                    joinNames(partialFiles.map(fileLabel)) +
                    (partialFiles.length > 1
                      ? ". Check those artboards."
                      : ". Check both artboards."),
                )
              : noLandingFiles.length > 0 && landResult !== "failed"
                ? deps.value448.current(
                    uiMessage("canvas.designCanvas.nowhereToLandIn") +
                      fileLabel(target) +
                      " for " +
                      joinNames(noLandingFiles.map(fileLabel)) +
                      "'s selection; " +
                      (isCopy ? uiMessage("canvas.designCanvas.nothingOfItWasCopied") : uiMessage("canvas.designCanvas.itStayed")),
                  )
                : partlyStayedFiles.length > 0 &&
                  deps.value448.current(
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
                    name: deps.value19(target),
                    tids: targetNewTids,
                    rect: null,
                    count: targetNewTids.length,
                  },
            );
            primary = target;
          }
          if (revertState?.how !== "reverted")
            for (let file of [target, ...canvasSourceFiles] as Dynamic)
              deps.value153.current.set(file, Date.now());
        } finally {
          historyGroup?.end();
        }
      } else {
        let historyGroup: Dynamic =
          items.length > 0
            ? deps.value432.current?.group(items, {
                bound: dragToken,
              })
            : undefined;
        focusedFile != null &&
          items.includes(focusedFile) &&
          (deps.value25.current = focusedFile);
        let moveResults: Dynamic = await Promise.all(
          items.map(
            (file?: Dynamic): Dynamic =>
              (
                deps.value177.current
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
              deps.value25.current === focusedFile &&
              (deps.value25.current = null);
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
        deps.value448.current(
          uiMessage("canvas.designCanvas.theArtboardsAndNotesIn") +
            (elementDrag.copy ? "copy" : "move") +
            " \u2014 the drag was interrupted; try it again.",
        );
      let baseSelection: Dynamic = selectionAtStart;
      if (elementDrag.copy && elementDrag.canvasMoved && !elementDrag.canvasDropped) {
        deps.value142.current.has(dragToken) || (await deps.value144(dragToken));
        let entry: Dynamic = deps.value142.current.get(dragToken);
        deps.value142.current.delete(dragToken);
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
      deps.applyCanvasSelection(nextSelection);
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
          deps.value177.current.get(file)?.moveSettle();
      for (let file of unansweredFiles as Dynamic)
        deps.value177.current.get(file)?.moveSettle();
      (window as Dynamic).setTimeout((): Dynamic => {
        for (let file of [
          ...new Set([...writtenFiles, ...revertedFiles]),
        ] as Dynamic) {
          let tids: Dynamic =
            deps.selectionRef.current.elements.get(file)?.tids ?? null;
          file === deps.focusedFileRef.current
            ? deps.setShownFrameSelection(file, tids)
            : deps.value177.current
                .get(file)
                ?.setShownSelection(
                  tids,
                  tids ? deps.value19(file) : null,
                );
          deps.value177.current.get(file)?.moveSettle();
        }
      }, 80);
      if (refusedFiles.length > 0) {
        let refusedLabels: Dynamic = refusedFiles.map(deps.callback2),
          refusedText: Dynamic =
            refusedLabels.length === 1
              ? refusedLabels[0]
              : refusedLabels.slice(0, -1).join(", ") +
                " and " +
                refusedLabels[refusedLabels.length - 1],
          nothingMoved: Dynamic = writtenFiles.length === 0;
        deps.value448.current(
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

/** 开始拖出元素时运行：把选中元素序列化成独立的 dc 文档并构建预览 srcdoc，作为拖动中跟随指针的幽灵预览。 */
export function buildDragGhostPreview(deps: { readonly assets: Dynamic; readonly doc: Dynamic; readonly value177: Dynamic; readonly value195: Dynamic; readonly value196: Dynamic }, dragStart?: Dynamic): Dynamic {
        if (!dragStart.box || deps.value196.current?.key === dragStart.key) return;
        deps.value196.current = {
          key: dragStart.key,
          ghost: null,
        };
        let entry: Dynamic = deps.value177.current.get(dragStart.file),
          box: Dynamic = dragStart.box;
        if (entry)
          try {
            entry
              .renderDefaults()
              .then((renderDefaults?: Dynamic): Dynamic => {
                if (deps.value196.current?.key !== dragStart.key) return;
                let ghostMarkup: Dynamic = entry.serializeSelection(dragStart.tids, {
                  bakeProps: true,
                  lift: box,
                  vals: renderDefaults,
                });
                if (!ghostMarkup || ghostMarkup.length > 2e5) return;
                let files: Dynamic = deps.doc.content().files,
                  state: Dynamic = {
                    ...mergeDesignSystemFileOverlay(files),
                    [dragGhostFilename]: buildDcDocument(
                      ghostMarkup,
                      files[dragStart.file] ?? "",
                      {
                        logic: false,
                      },
                    ),
                  },
                  projectFiles: Dynamic = normalizeProjectBlobPaths(
                    collectProjectDependencyFiles(
                      state,
                      dragGhostFilename,
                    ),
                  ),
                  { doc: previewDoc, parts: previewParts }: Dynamic = buildPreviewDocument(
                    projectFiles,
                    dragGhostFilename,
                    deps.assets,
                    new Set(),
                    {
                      frameless: true,
                      fileUrlFor: createLinkedFileScript,
                    },
                  ),
                  ghost: Dynamic =
                    Object.keys(previewParts).length > 0
                      ? {
                          srcdoc: ghostSrcdoc,
                          boot: {
                            doc: previewDoc,
                            parts: runtimeModuleBlobs(previewParts),
                            urls: runtimeModuleUrls(previewParts),
                          },
                        }
                      : {
                          srcdoc: previewDoc,
                          boot: null,
                        };
                deps.value196.current.ghost = ghost;
                deps.value195(
                  (dragState?: Dynamic): Dynamic =>
                    dragState && {
                      ...dragState,
                      ghost: ghost,
                    },
                );
              })
              .catch((): Dynamic => {});
          } catch {}
      }

/** 画布对象悬停在目标画板上时运行：在目标画板中计算落点计划（dropPlanAt）并显示插入预览，请求进行中时只保留最新坐标排队。 */
export function requestDropPlanPreview(deps: { readonly value177: Dynamic; readonly value203: Dynamic; readonly value206: Dynamic; readonly value87: Dynamic }, event?: Dynamic,
        target?: Dynamic,
        pointX?: Dynamic,
        pointY?: Dynamic,
        placementMode?: Dynamic): Dynamic {
        if (event.inFlight) {
          event.pending = {
            cx: pointX,
            cy: pointY,
            mode: placementMode,
          };
          return;
        }
        let html: Dynamic = event.html,
          member: Dynamic = event.member;
        if (!html || !member) return;
        let entry: Dynamic = deps.value177.current.get(target.file),
          artboard: Dynamic = deps.value87.current.artboards.find(
            (candidate?: Dynamic): Dynamic => candidate.file === target.file,
          );
        if (!entry || !artboard) return;
        let isLaidOutPromise: Dynamic = event.laidOut.get(target.file);
        isLaidOutPromise ||
          ((isLaidOutPromise = entry.isFreeCanvas(html).then(
            (isFree?: Dynamic): Dynamic => !isFree,
            (): Dynamic => false,
          )),
          event.laidOut.set(target.file, isLaidOutPromise));
        event.inFlight = Promise.all([target.opened, isLaidOutPromise])
          .then(
            ([isOpened, isLaidOut]: Dynamic): Dynamic =>
              isOpened && isLaidOut
                ? entry.dropPlanAt(
                    event.token,
                    {
                      x: pointX - artboard.x,
                      y: pointY - artboard.y,
                    },
                    [member],
                    placementMode,
                  )
                : null,
          )
          .then(
            (plan?: Dynamic): Dynamic => {
              event.target === target &&
                (!plan ||
                  !plan.landing.some(
                    (landingItem?: Dynamic): Dynamic => landingItem.tid === 0,
                  )) &&
                entry.dropPlanClear(event.token);
            },
            (): Dynamic => {},
          )
          .finally((): Dynamic => {
            event.inFlight = null;
            let pending: Dynamic = event.pending;
            event.pending = null;
            pending &&
              event.target &&
              deps.value203.current === event &&
              deps.value206(
                event,
                event.target,
                pending.cx,
                pending.cy,
                pending.mode,
              );
          });
      }

/** 把画布对象（说明、图形或无框画板）拖过其他画板时运行：建立拖动会话、打开目标画板的移动宿主，并刷新落点预览。 */
export function trackObjectHoverOverArtboard(deps: { readonly value177: Dynamic; readonly value202: Dynamic; readonly value203: Dynamic; readonly value204: Dynamic; readonly value206: Dynamic; readonly value211: Dynamic; readonly value271: Dynamic; readonly value345: Dynamic }, event?: Dynamic): Dynamic {
        let session: Dynamic = deps.value203.current;
        session &&
          session.gestureKey !== event.key &&
          (deps.value204(), (session = null));
        let isOtherGestureActive: Dynamic = deps.value202.current || deps.value345.current;
        if (!session) {
          if (!event.target || isOtherGestureActive) return;
          let state: Dynamic = {
              ew: event.at.w,
              eh: event.at.h,
              ox: 0,
              oy: 0,
              gx: event.point.x - event.at.x,
              gy: event.point.y - event.at.y,
            },
            newSession: Dynamic = {
              gestureKey: event.key,
              token: randomSessionToken(),
              html: null,
              member: null,
              laidOut: new Map(),
              target: null,
              closing: new Map(),
              inFlight: null,
              pending: null,
            };
          deps.value203.current = newSession;
          session = newSession;
          deps.value211(event.object)
            .then((objectHtml?: Dynamic): Dynamic => {
              deps.value203.current === newSession &&
                ((newSession.html = objectHtml),
                (newSession.member = objectHtml
                  ? pastedElementGeometry(objectHtml, state)
                  : null));
            })
            .catch((): Dynamic => {});
        }
        let hoverTarget: Dynamic =
          event.target &&
          !isOtherGestureActive &&
          event.target !== deps.value271.current &&
          event.target !== ("file" in event.object ? event.object.file : null)
            ? event.target
            : null;
        session.target && session.target.file !== hoverTarget && deps.value204();
        if (!!hoverTarget) {
          if (!session.target) {
            let entry: Dynamic = deps.value177.current.get(hoverTarget),
              sessionAtOpen: Dynamic = session;
            session.target = {
              file: hoverTarget,
              opened: (session.closing.get(hoverTarget) ?? Promise.resolve())
                .then(
                  (): Dynamic =>
                    entry?.moveHost(sessionAtOpen.token, "open") ?? false,
                )
                .catch((): Dynamic => false),
            };
          }
          deps.value206(
            session,
            session.target,
            event.point.x,
            event.point.y,
            event.ctrl ? "keep" : "flow",
          );
        }
      }

/** 画布对象在某画板上松手时运行（onDropObjectInto）：把说明、图片或无框画板内容作为元素插入目标画板，处理超时、只读与失败提示。 */
export function dropCanvasObjectIntoArtboard(deps: { readonly callback2: Dynamic; readonly callback7: Dynamic; readonly focusedFileRef: Dynamic; readonly selectionRef: Dynamic; readonly setSelection: Dynamic; readonly setShownFrameSelection: Dynamic; readonly showToast: Dynamic; readonly value144: Dynamic; readonly value155: Dynamic; readonly value157: Dynamic; readonly value177: Dynamic; readonly value188: Dynamic; readonly value189: Dynamic; readonly value19: Dynamic; readonly value202: Dynamic; readonly value203: Dynamic; readonly value204: Dynamic; readonly value213: Dynamic; readonly value271: Dynamic; readonly value276: Dynamic; readonly value345: Dynamic; readonly value432: Dynamic; readonly value459: Dynamic; readonly value73: Dynamic; readonly value87: Dynamic }, objectDrop?: Dynamic): Dynamic {
        let {
          target: targetFile,
          point: dropPoint,
          at: objectBox,
          ctrl: isKeepMode,
        }: Dynamic = objectDrop;
        if (deps.value345.current || targetFile === deps.value271.current) return false;
        let targetArtboard: Dynamic = deps.value87.current.artboards.find(
            (candidate?: Dynamic): Dynamic => candidate.file === targetFile,
          ),
          entry: Dynamic = deps.value177.current.get(targetFile);
        if (
          !targetArtboard ||
          targetArtboard.frameless ||
          !entry ||
          deps.value202.current ||
          deps.value155.current > 0
        )
          return false;
        let loadMarkup: Dynamic, movedSelection: Dynamic, objectKind: Dynamic;
        if ("note" in objectDrop.object) {
          let note: Dynamic = (deps.value73.current.annotations ?? []).find(
            (annotation?: Dynamic): Dynamic => annotation.id === objectDrop.object.note,
          );
          if (!note) return false;
          let noteMarkup: Dynamic = deps.callback7(note);
          if (!noteMarkup) return false;
          loadMarkup = async (): Promise<Dynamic> => noteMarkup;
          movedSelection = {
            files: new Set(),
            notes: new Set([note.id]),
          };
          objectKind = note.kind === "image" ? "image" : "note";
        } else {
          let file: Dynamic = objectDrop.object.file,
            pieceEntry: Dynamic = deps.value177.current.get(file);
          if (
            !pieceEntry ||
            !deps.value73.current.artboards.find(
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
            deps.value203.current?.gestureKey === objectDrop.key
              ? deps.value203.current
              : null,
          isHoverTarget: Dynamic =
            !!hoverSession?.target && hoverSession.target.file === targetFile;
        hoverSession && !isHoverTarget && deps.value204();
        deps.value203.current = null;
        deps.value202.current = true;
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
              deps.value188(
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
                  deps.value188(
                    uiMessage("canvas.designCanvas.nothingMoved2") +
                      deps.callback2(targetFile) +
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
                  let commitResult: Dynamic = await deps.value157({
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
              let historyGroup: Dynamic = deps.value432.current?.group([targetFile], {
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
                  entry.setShownSelection(newTids, deps.value19(targetFile)));
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
              deps.value188(uiMessage("canvas.designCanvas.couldNotMoveNothingChanged"));
              return;
            }
            deps.value276.current = {
              file: targetFile,
              at: Date.now(),
            };
            let selectionAfter: Dynamic = insertedTids
                ? selectionFromElements(targetFile, {
                    name: deps.value19(targetFile),
                    tids: insertedTids,
                    rect: null,
                    count: insertedTids.length,
                  })
                : (planSelection ?? deps.selectionRef.current),
              filteredSelection: Dynamic = filterSelectedAnnotations(
                filterSelectedArtboards(
                  selectionAfter,
                  (file?: Dynamic): Dynamic => !movedSelection.files.has(file),
                ),
                (noteId?: Dynamic): Dynamic => !movedSelection.notes.has(noteId),
              ),
              flushPromise: Dynamic =
                movedSelection.files.size > 0 ? deps.value144(dragToken) : null;
            if (!deps.value459.current(movedSelection, dragToken)) {
              await deps.value213(targetFile, dragToken, objectKind);
              deps.value188(
                uiMessage("canvas.designCanvas.nothingMovedThe") +
                  objectKind +
                  " could not leave the canvas.",
              );
              return;
            }
            deps.value189(uiMessage("canvas.designCanvas.movedInto") + deps.callback2(targetFile));
            if (flushPromise) {
              deps.value155.current++;
              try {
                await flushPromise;
              } finally {
                deps.value155.current--;
              }
            }
            deps.setSelection(filteredSelection);
            (window as Dynamic).setTimeout((): Dynamic => {
              deps.setSelection(filteredSelection);
              let shownTids: Dynamic =
                filteredSelection.elements.get(targetFile)?.tids ?? null;
              targetFile === deps.focusedFileRef.current
                ? deps.setShownFrameSelection(targetFile, shownTids)
                : entry.setShownSelection(
                    shownTids,
                    shownTids ? deps.value19(targetFile) : null,
                  );
            }, 160);
          } catch (error: Dynamic) {
            deps.showToast(
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
            deps.value202.current = false;
          }
        })();
        return true;
      }

/** 从聚焦画板拖出的元素松手时运行：落在空白处则新建画板，落在另一画板则移动或复制进去，失败时回滚并提示。 */
export function dropElementDragAtCanvasPoint(deps: { readonly abandonSelectionGesture: Dynamic; readonly callback2: Dynamic; readonly callback3: Dynamic; readonly doc: Dynamic; readonly setSelection: Dynamic; readonly showToast: Dynamic; readonly supportsLoadState: Dynamic; readonly value125: Dynamic; readonly value127: Dynamic; readonly value155: Dynamic; readonly value156: Dynamic; readonly value157: Dynamic; readonly value177: Dynamic; readonly value188: Dynamic; readonly value189: Dynamic; readonly value19: Dynamic; readonly value202: Dynamic; readonly value203: Dynamic; readonly value271: Dynamic; readonly value276: Dynamic; readonly value345: Dynamic; readonly value396: Dynamic; readonly value432: Dynamic; readonly value62: Dynamic; readonly value73: Dynamic; readonly value87: Dynamic; readonly value98: Dynamic }, elementDrag?: Dynamic,
        dropX?: Dynamic,
        dropY?: Dynamic,
        isCopy?: Dynamic): Dynamic {
        let hoverSession: Dynamic =
          deps.value203.current?.gestureKey === elementDrag.key
            ? deps.value203.current
            : null;
        deps.value203.current = null;
        let closeHoverTarget: Dynamic = (keepFile?: Dynamic): Dynamic => {
          let hoverTarget: Dynamic = hoverSession?.target;
          if (!hoverSession || !hoverTarget || hoverTarget.file === keepFile) return;
          let targetEntry: Dynamic = deps.value177.current.get(hoverTarget.file);
          targetEntry?.dropPlanClear(hoverSession.token);
          hoverSession.closing.set(
            hoverTarget.file,
            hoverTarget.opened
              .then((): Dynamic => targetEntry?.moveHost(hoverSession.token, "close"))
              .catch((): Dynamic => false),
          );
          hoverSession.target = null;
        };
        if (deps.value345.current) {
          closeHoverTarget();
          deps.value188(
            uiMessage("canvas.designCanvas.nothingMovedOnlyThisArtboard"),
          );
          return;
        }
        let targetArtboard: Dynamic = [...deps.value87.current.artboards]
          .reverse()
          .find(
            (candidate?: Dynamic): Dynamic =>
              !(candidate.frameless && candidate.file !== deps.value125.current) &&
              dropX >= candidate.x &&
              dropX <= candidate.x + candidate.w &&
              dropY >= candidate.y &&
              dropY <= candidate.y + candidate.h,
          );
        closeHoverTarget(targetArtboard?.file);
        if (targetArtboard != null && targetArtboard.file === deps.value271.current) {
          closeHoverTarget();
          deps.value188(
            uiMessage("canvas.designCanvas.nothingMovedThatArtboardIs"),
          );
          return;
        }
        if (!targetArtboard) {
          let sourceEntry: Dynamic = deps.value177.current.get(elementDrag.file);
          if (!sourceEntry || deps.value202.current || deps.value155.current > 0) return;
          deps.value202.current = true;
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
                deps.value188(
                  uiMessage("canvas.designCanvas.nothingMovedRepeatedOrRoot"),
                );
                return;
              }
              let files: Dynamic = deps.doc.content().files;
              if (
                Object.keys(files).length >=
                PlatformFileContentFilesValue
              ) {
                deps.showToast(
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
                    PlatformFileContentHandler_4(elementDrag.file),
                  )) ??
                  files[elementDrag.file] ??
                  "",
                newFile: Dynamic = uniqueArtboardFile(
                  files,
                  "Piece",
                  deps.supportsLoadState,
                ),
                newDocument: Dynamic = buildDcDocument(
                  markup,
                  typeof homeSource == "string" ? homeSource : "",
                );
              await getKvClient().set(
                PlatformFileContentHandler_4(newFile),
                newDocument,
              );
              deps.value127.current.set(newFile, Date.now());
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
                    deps.value73.current.artboards,
                  ),
                  frameless: true,
                  ...deps.callback3(),
                },
                historyToken: Dynamic = isCopy
                  ? undefined
                  : randomSessionToken();
              isCopy ||
                (releaseLock = deps.value156(dragDropLockKind));
              deps.value396.current(
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
              deps.value98({
                artboards: [
                  ...deps.value73.current.artboards.filter(
                    (candidate?: Dynamic): Dynamic => candidate.file !== newFile,
                  ),
                  state,
                ],
              });
              if (!isCopy) {
                let historyGroup: Dynamic = deps.value432.current?.group(
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
                  deps.value188(
                    uiMessage("canvas.designCanvas.copiedOntoTheCanvasThe"),
                  );
                  return;
                }
              }
              deps.value189((isCopy ? "Copied" : "Moved") + " onto the canvas");
              deps.abandonSelectionGesture();
              deps.value62();
              deps.setSelection(
                selectionFromArtboards(new Set([newFile])),
              );
            } catch (error: Dynamic) {
              deps.showToast(
                uiMessage("canvas.designCanvas.couldnTFinishTheDrop2") + String(error),
                "error",
              );
            } finally {
              releaseLock?.();
              deps.value202.current = false;
            }
          })();
          return;
        }
        if (targetArtboard.file === elementDrag.file) {
          deps.value188(
            uiMessage("canvas.designCanvas.releasedOverTheSameArtboard"),
          );
          return;
        }
        let entry: Dynamic = deps.value177.current.get(elementDrag.file),
          targetFrameEntry: Dynamic = deps.value177.current.get(targetArtboard.file);
        if (!entry || !targetFrameEntry || deps.value202.current || deps.value155.current > 0) {
          closeHoverTarget();
          return;
        }
        deps.value202.current = true;
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
              deps.value188(
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
                  deps.value188(
                    uiMessage("canvas.designCanvas.nothingMoved2") +
                      deps.callback2(targetArtboard.file) +
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
                  let commitResult: Dynamic = await deps.value157({
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
                  deps.value276.current = {
                    file: targetArtboard.file,
                    at: Date.now(),
                  };
                  didCommit = commitResult.written.includes(targetArtboard.file);
                  didCommit && targetFrameEntry.dropPlanClear(dragSessionToken, true);
                  didCommit &&
                    commitResult.written.includes(elementDrag.file) &&
                    deps.value189(uiMessage("canvas.designCanvas.movedTo") + deps.callback2(targetArtboard.file));
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
              ((historyGroup = deps.value432.current?.group(
                [targetArtboard.file, elementDrag.file],
                {
                  atomic: true,
                  holder: targetArtboard.file,
                  waiting: [elementDrag.file],
                },
              )),
              (releaseLock = deps.value156(dragDropLockKind)));
            let insertedTids: Dynamic = useAbsolutePosition
              ? await targetFrameEntry.insertHtml(
                  positionPastedHtml(markup, pasteOffset),
                  "root-end",
                )
              : await targetFrameEntry.insertHtml(markup, "root-end", pasteOffset);
            deps.value276.current = {
              file: targetArtboard.file,
              at: Date.now(),
            };
            if (insertedTids.length === 0) {
              deps.value188(uiMessage("canvas.designCanvas.couldNotMoveNothingChanged"));
              return;
            }
            if (isCopy)
              deps.value189(
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
                        .applyHistory(deps.value19(targetArtboard.file), "undo")
                        .catch((): Dynamic => false)
                    : false;
                discardHistory && !didUndo && discardHistory();
                didUndo && targetFrameEntry.dropRedo();
                deps.value188(
                  didUndo
                    ? uiMessage("canvas.designCanvas.couldNotMoveReverted")
                    : uiMessage("canvas.designCanvas.moveFailedHalfwayCheckBoth"),
                );
                return;
              }
              deps.value189(uiMessage("canvas.designCanvas.movedTo") + deps.callback2(targetArtboard.file));
            }
            deps.abandonSelectionGesture();
            deps.setSelection(
              setCanvasElementSelection(
                emptyCanvasSelection,
                targetArtboard.file,
                {
                  name: deps.value19(targetArtboard.file),
                  tids: insertedTids,
                  rect: null,
                  count: insertedTids.length,
                },
                false,
              ),
            );
            targetFrameEntry.setShownSelection(insertedTids, deps.value19(targetArtboard.file));
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
            deps.value202.current = false;
          }
        })();
      }

/** 画板 iframe 上报元素拖动事件（arm/move/exit/finish/cancel）时运行：维护拖出会话状态，松手时调用 dropElementDragAtCanvasPoint。 */
export function handleFrameElementDragEvent(deps: { readonly focusedFileRef: Dynamic; readonly value177: Dynamic; readonly value188: Dynamic; readonly value193: Dynamic; readonly value195: Dynamic; readonly value197: Dynamic; readonly value198: Dynamic; readonly value200: Dynamic; readonly value201: Dynamic; readonly value205: Dynamic; readonly value207: Dynamic; readonly value208: Dynamic; readonly value209: Dynamic; readonly value210: Dynamic; readonly value215: Dynamic; readonly value216: Dynamic; readonly value217: Dynamic; readonly value218: Dynamic; readonly value67: Dynamic }, file?: Dynamic, dragEvent?: Dynamic): Dynamic {
        let activeDrag: Dynamic = deps.value193.current;
        if (dragEvent.type === "arm") {
          if (
            file !== deps.focusedFileRef.current ||
            deps.value218.current ||
            (activeDrag &&
              activeDrag.file === file &&
              activeDrag.key !== dragEvent.key &&
              deps.value208(),
            deps.value209(),
            !dragEvent.tids)
          )
            return;
          let pickedSelection: Dynamic = deps.value217(file, dragEvent.tids);
          if (!pickedSelection) return;
          deps.value216.current = {
            key: dragEvent.key,
            file: file,
            tids: pickedSelection.tids,
            alt: dragEvent.alt,
            box: dragEvent.box,
            label: pickedSelection.label,
          };
          deps.value198(deps.value216.current);
          deps.value205(deps.value216.current);
          deps.value200(file);
          deps.value201.current && clearTimeout(deps.value201.current);
          deps.value201.current = setTimeout(deps.value209, 6e4);
          return;
        }
        if (dragEvent.type === "disarm") {
          let armedDrag: Dynamic = deps.value216.current;
          armedDrag &&
            armedDrag.file === file &&
            armedDrag.key === dragEvent.key &&
            deps.value209();
          activeDrag && activeDrag.file === file && activeDrag.key === dragEvent.key
            ? (activeDrag.pendingDrop &&
                deps.value188(
                  uiMessage("canvas.designCanvas.nothingMovedTheArtboardEnded"),
                ),
              deps.value208())
            : !activeDrag && !deps.value216.current && deps.value200(null);
          return;
        }
        if (dragEvent.type === "exit") {
          if (file !== deps.focusedFileRef.current) return;
          if (activeDrag) {
            if (activeDrag.file === file) {
              if (activeDrag.key !== dragEvent.key) return;
              activeDrag.echoed = true;
              let pendingDrop: Dynamic = activeDrag.pendingDrop;
              if (!pendingDrop) {
                deps.value198(activeDrag);
                return;
              }
              deps.value208(true);
              deps.value177.current.get(file)?.hostDrag("finish", activeDrag.key);
              deps.value215(
                activeDrag,
                pendingDrop.cx,
                pendingDrop.cy,
                pendingDrop.alt,
              );
              return;
            }
            deps.value208();
          }
          if (deps.value218.current) return;
          let pickedSelection: Dynamic = deps.value217(file, dragEvent.tids);
          if (!pickedSelection) return;
          deps.value193.current = {
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
          deps.value198(deps.value193.current);
          deps.value200(file);
          deps.value201.current && clearTimeout(deps.value201.current);
          deps.value201.current = setTimeout(deps.value210, 3e4);
          return;
        }
        if (
          !activeDrag ||
          activeDrag.key !== dragEvent.key ||
          activeDrag.file !== file
        )
          return;
        if (dragEvent.type === "cancel") {
          deps.value208();
          return;
        }
        let artboard: Dynamic = deps.value67.artboards.find(
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
          deps.value201.current && clearTimeout(deps.value201.current);
          deps.value201.current = setTimeout(deps.value210, 3e4);
          activeDrag.latched ||
            deps.value195(deps.value197(activeDrag, canvasX, canvasY, dragEvent.alt));
          activeDrag.ctrl = dragEvent.ctrl;
          deps.value207(activeDrag, canvasX, canvasY, dragEvent.alt);
          return;
        }
        let hasMoved: Dynamic = activeDrag.moves.length > 0;
        deps.value208(hasMoved);
        hasMoved &&
          ((activeDrag.ctrl = dragEvent.ctrl),
          deps.value215(activeDrag, canvasX, canvasY, dragEvent.alt));
      }

/** 外壳侧指针接管元素拖动后运行（onHostDrag：stale/move/exit/cancel/finish）：更新拖出会话与幽灵位置，松手时提交落点。 */
export function handleHostElementDragEvent(deps: { readonly focusedFileRef: Dynamic; readonly value177: Dynamic; readonly value188: Dynamic; readonly value193: Dynamic; readonly value195: Dynamic; readonly value197: Dynamic; readonly value201: Dynamic; readonly value207: Dynamic; readonly value208: Dynamic; readonly value209: Dynamic; readonly value210: Dynamic; readonly value215: Dynamic; readonly value216: Dynamic }, eventType?: Dynamic,
        pointX?: Dynamic,
        pointY?: Dynamic,
        isAlt?: Dynamic,
        isCtrl: Dynamic = false): Dynamic {
        let activeDrag: Dynamic = deps.value193.current,
          armedDrag: Dynamic = deps.value216.current,
          dragSession: Dynamic = activeDrag ?? armedDrag,
          frameEntry: Dynamic = dragSession
            ? deps.value177.current.get(dragSession.file)
            : undefined;
        if (!activeDrag?.pendingDrop) {
          if (eventType === "stale") {
            deps.value210();
            return;
          }
          if (eventType === "move") {
            if (!activeDrag) {
              if (!armedDrag || armedDrag.file !== deps.focusedFileRef.current)
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
              deps.value193.current = activeDrag;
              frameEntry?.hostDrag("exit", armedDrag.key, isAlt);
            }
            activeDrag.moves.push(Date.now());
            activeDrag.moves.length > 240 && activeDrag.moves.shift();
            deps.value201.current && clearTimeout(deps.value201.current);
            deps.value201.current = setTimeout(deps.value210, 3e4);
            deps.value195(deps.value197(activeDrag, pointX, pointY, isAlt));
            activeDrag.ctrl = isCtrl;
            deps.value207(activeDrag, pointX, pointY, isAlt);
            return;
          }
          deps.value209();
          if (!activeDrag) {
            armedDrag && frameEntry?.hostDrag("cancel", armedDrag.key);
            return;
          }
          activeDrag.ctrl = isCtrl;
          if (eventType === "cancel" || activeDrag.moves.length === 0) {
            deps.value208();
            frameEntry?.hostDrag("cancel", activeDrag.key);
            return;
          }
          if (!activeDrag.echoed) {
            activeDrag.pendingDrop = {
              cx: pointX,
              cy: pointY,
              alt: isAlt,
            };
            deps.value195(null);
            deps.value201.current && clearTimeout(deps.value201.current);
            deps.value201.current = setTimeout((): Dynamic => {
              deps.value193.current?.pendingDrop &&
                deps.value188(
                  uiMessage("canvas.designCanvas.nothingMovedTheArtboardDid"),
                );
              deps.value210();
            }, 1500);
            return;
          }
          deps.value208(true);
          frameEntry?.hostDrag("finish", activeDrag.key);
          deps.value215(activeDrag, pointX, pointY, isAlt);
        }
      }
