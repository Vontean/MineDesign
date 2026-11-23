import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { encodeCamelCaseAttributes } from "../editor/html/tag-normalization";
import { commitFastEditArtboardChanges, prepareFastEditArtboardChanges, resolveCommentPinPosition } from "./application";
import { checkFastEditNewArtboardLimit, createFastEditFileIds, diffArtboardProperties, FAST_EDIT_OPERATION_LIMITS, findAdjacentArtboardSpaces, findAvailableArtboardPosition, MAX_FAST_EDIT_FILES, parseFastEditArtboardOperation, parseFastEditArtboardSection, safeArtboardTitle, sanitizeArtboardTitle, serializeFastEditArtboard } from "./artboard-operations";
import { describeFreeCanvasSpots, findFreeSpotAfterRow, groupArtboardsIntoRows } from "./canvas-spaces";
import { findNearestProbeRectangle } from "./dom-probes";
import { createDraftEmitter } from "./draft-channel";
import { draftDocumentPreviewStore, draftHtmlPreviewStore } from "./draft-previews";
import { containsOnlyTemplateInterpolation, countEmptySvgDrawings, isEmptyStructuralTemplate, parseTargetTemplate, pickTargetAppearanceContext, pickTargetSiblingContext, readTemplateLoopHtml, resolveClickedElementTarget, resolveFastEditClickTarget, STRUCTURAL_LEAF_ELEMENT_TAGS } from "./element-targets";
import { appendHistoryUserTurn, applyForgetStatements, beginHistoryTurn, countHistoryCharacters, describeAutomaticallyDroppedTurns, extractForgetStatements, resetHistoryNotes, trimHistoryTurns } from "./history";
import { collectJournalChanges, finishFastEditJournalTurn, recordFastEditReadResult, summarizeArtboardText } from "./journal";
import { hasPageStylesheet, preserveHelmetMarkup, readPageStylesFromSection, readPageStylesFromSheet, serializePageStyleAttributes, serializePageStyleDeclarations, stripHelmetMarkup, updatePageStyleSheet, validatePageFontFamilies, validatePageStyles } from "./page-style";
import { buildFastEditPrompt, MAX_DATA_URI_SCAN_CHARS, MAX_INLINE_DATA_URI_CHARS, MAX_PROMPT_ARTBOARD_NEIGHBORS, MAX_PROMPT_LIST_ITEMS, TRUNCATED_DATA_URI_PATTERN, truncateLargeDataUris } from "./prompt-context";
import { artboardRectangle, describeFastEditRefusal, distanceBetweenArtboards, FAST_EDIT_ALLOW_EMPTY_SELECTION, FAST_EDIT_CAPABILITY_DENIED_CODES, FAST_EDIT_CAPABILITY_UNAVAILABLE_MESSAGE, FAST_EDIT_COLLECT_READS, FAST_EDIT_CONTROL_CALL_PATTERN, FAST_EDIT_ERROR_MESSAGES, FAST_EDIT_HTML_INSERTION_PATTERN, FAST_EDIT_INITIAL_DELAY_MS, FAST_EDIT_MARKUP_REPAIR_INSTRUCTIONS, FAST_EDIT_MUTATION_CALL_PATTERN, FAST_EDIT_NOOP_CODES, FAST_EDIT_REPAIR_MESSAGES, FAST_EDIT_ROUNDTRIP_TIMEOUT_MS, FAST_EDIT_SANDBOX_START_TIMEOUT_MS, FAST_EDIT_TIMEOUT_SENTINEL, MAX_FAST_EDIT_BOX_CHARS, MAX_FAST_EDIT_CALLS, MAX_FAST_EDIT_FED_CHARS, MAX_FAST_EDIT_FRAME_OUTPUT_CHARS, MAX_FAST_EDIT_INPUT_LOG_CHARS, MAX_FAST_EDIT_READ_ROUNDS, MAX_FAST_EDIT_REPAIR_ATTEMPTS, MAX_FAST_EDIT_SECTION_CHARS, normalizeFastEditThrownError, OPEN_ARTBOARD_PLACEHOLDER_ID, readTemplateInputDefaults, rehydrateFastEditHtml, removeHelmetHandleIds, resolveTemplateHandleIds, SANDBOX_NOT_READY_MESSAGE_PATTERN, verifySandboxTemplateRoundTrip, waitForFastEditAbort, withFastEditTimeout } from "./session";
import { adoptHandleIds, collectOwnedElementIds, isIncompleteInsertionStatement, mapFastEditCssChanges, nextHandleSequence, rewriteContainerAppendStatements } from "./statement-parser";
import { buildStaticFastEditPreview, unwrapFastEditSection } from "./static-preview";
import { validateArtboardTemplateReplacement, validateFastEditTemplate } from "./template-validation";
import { createFastEditWriteScheduler } from "./write-scheduler";

var selectedFastEditFile: Dynamic;
var summarizeFastEditAppliedChanges: Dynamic;
var serializePromptArtboardWithPageStyle: Dynamic;
var stripReplyCodeFences: Dynamic;
var stripReplyInlineBackticks: Dynamic;
var JS_IDENTIFIER_PATTERN: Dynamic;
var FAST_EDIT_REPLY_PREFIX_PATTERN: Dynamic;
var BARE_FAST_EDIT_SELECTOR_PATTERN: Dynamic;
function resolveFastEditFileTarget(
  request?: Dynamic,
  files?: Dynamic,
): Dynamic {
  if (request.target !== undefined)
    return request.target === "" || files.includes(request.target)
      ? {
          file: request.target,
          by: "selected",
        }
      : null;
  let value: Dynamic = selectedFastEditFile(request.host(), files);
  if (value !== undefined)
    return {
      file: value,
      by: "selected",
    };
  if (files.length === 0) return null;
  let visibleFileCandidates: Dynamic = request.inView(files);
  return visibleFileCandidates.length > 0
    ? visibleFileCandidates.includes(request.session.lastTouched)
      ? {
          file: request.session.lastTouched,
          by: "last",
        }
      : {
          file: visibleFileCandidates[0],
          by: "none",
        }
    : request.session.lastTouched !== "" &&
        files.includes(request.session.lastTouched)
      ? {
          file: request.session.lastTouched,
          by: "last",
        }
      : {
          file: files[0],
          by: "none",
        };
}
async function updateFastEditHistoryFromCanvas(
  editContext?: Dynamic,
): Promise<Dynamic> {
  let turn: Dynamic = editContext.session.turn,
    host: Dynamic = editContext.host(),
    handles: Dynamic = host.handlesRef.current ?? new Map(),
    boards: Dynamic = host.canvas.boards(),
    files: Dynamic = boards
      .map((board?: Dynamic): Dynamic => board.file)
      .slice(0, MAX_FAST_EDIT_FILES),
    idOf: Dynamic = createFastEditFileIds(files).idOf,
    values: Dynamic = new Set(),
    pageFonts: Dynamic = new Set(
      files.flatMap((file?: Dynamic): Dynamic => {
        try {
          return handles.get(file)?.pageFonts() ?? [];
        } catch {
          return [];
        }
      }),
    );
  for (let value of (turn === null
    ? []
    : [turn, ...(turn.also ?? [])]) as Dynamic) {
    let boardEntry: Dynamic = boards.find(
        (board?: Dynamic): Dynamic => board.file === value.file,
      ),
      entry: Dynamic = idOf.get(value.file);
    if (value.how !== undefined) {
      values.add(
        (boardEntry !== undefined) == (value.how === "new") ? "stands" : "gone",
      );
      continue;
    }
    if (value.after === value.before) continue;
    let templateHtml: Dynamic =
        boardEntry === undefined || entry === undefined
          ? null
          : await withFastEditTimeout(
              handles
                .get(value.file)
                ?.askTemplate()
                .catch((): Dynamic => null) ?? Promise.resolve(null),
              2500,
            ),
      serializedBoard: Dynamic =
        typeof templateHtml == "string" &&
        templateHtml.length <= MAX_FAST_EDIT_SECTION_CHARS
          ? serializePromptArtboardWithPageStyle(
              entry,
              boardEntry,
              templateHtml,
              pageFonts,
            )
          : undefined;
    values.add(
      serializedBoard !== undefined && serializedBoard === value.after
        ? "stands"
        : serializedBoard !== undefined && serializedBoard === value.before
          ? "gone"
          : "neither",
    );
  }
  return values.size === 1 ? [...values][0] : "neither";
}
async function captureFastEditCanvasState(
  editContext?: Dynamic,
): Promise<Dynamic> {
  let host: Dynamic = editContext.host(),
    handles: Dynamic = host.handlesRef.current ?? new Map(),
    boards: Dynamic = host.canvas.boards(),
    session: Dynamic = editContext.session,
    ids: Dynamic = createFastEditFileIds(
      boards
        .map((file?: Dynamic): Dynamic => file.file)
        .slice(0, MAX_FAST_EDIT_FILES),
    ),
    filesWithHandles: Dynamic = [...ids.idOf.keys()].filter(
      (file?: Dynamic): Dynamic => handles.has(file),
    ),
    pageFontFamilies: Dynamic = null,
    skippedCount: Dynamic = 0,
    recordUncapturedFile: Dynamic = (file?: Dynamic, status?: Dynamic): Dynamic => {
      session.unrecorded.has(file) || (skippedCount += 1);
      session.unrecorded.set(file, status);
    };
  session.first ??= new Set(
    boards.map((board?: Dynamic): Dynamic => board.file),
  );
  for (let board of boards as Dynamic)
    !handles.has(board.file) &&
      !session.seen.has(board.file) &&
      recordUncapturedFile(board.file, "late");
  for (let filePath of filesWithHandles as Dynamic) {
    if (
      session.seen.has(filePath) ||
      session.unrecorded.get(filePath) === "unfit"
    )
      continue;
    let entry: Dynamic = handles.get(filePath);
    if (session.busy !== null) {
      skippedCount += 1;
      continue;
    }
    if (!entry.isReady()) {
      recordUncapturedFile(filePath, "late");
      continue;
    }
    let serializedTemplate: Dynamic = await withFastEditTimeout(
      entry.askTemplate().catch((): Dynamic => null),
      2500,
    );
    if (!session.seen.has(filePath)) {
      if (session.busy !== null) {
        skippedCount += 1;
        continue;
      }
      if (typeof serializedTemplate != "string" || serializedTemplate.length > 2e5) {
        recordUncapturedFile(filePath, typeof serializedTemplate == "string" ? "unfit" : "late");
        continue;
      }
      pageFontFamilies ??= new Set(
        filesWithHandles.flatMap((file?: Dynamic): Dynamic => {
          try {
            return handles.get(file)?.pageFonts() ?? [];
          } catch {
            return [];
          }
        }),
      );
      session.unrecorded.delete(filePath);
      session.seen.set(
        filePath,
        serializePromptArtboardWithPageStyle(
          ids.idOf.get(filePath),
          boards.find((file?: Dynamic): Dynamic => file.file === filePath),
          serializedTemplate,
          pageFontFamilies,
        ),
      );
      session.first.has(filePath) && session.opened.add(filePath);
      await new Promise((file?: Dynamic): Dynamic => setTimeout(file, 0));
    }
  }
  return skippedCount;
}
function extractFastEditReplyStatements(
  reply?: Dynamic,
  partialLine: Dynamic = "",
): Dynamic {
  let statements: Dynamic = "",
    lastLine: Dynamic = "",
    depth: Dynamic = 0,
    accepting: Dynamic = true,
    inCode: Dynamic = false;
  for (let value of reply.split(/(?<=\n)/) as Dynamic) {
    if (value.trim() === "") {
      statements += value;
      continue;
    }
    if (
      lastLine === "" &&
      depth === 0 &&
      accepting &&
      !FAST_EDIT_REPLY_PREFIX_PATTERN.test(value + ";")
    ) {
      inCode = value.trim() === ".";
      continue;
    }
    statements +=
      (inCode && BARE_FAST_EDIT_SELECTOR_PATTERN.test(value) ? "." : "") +
      value;
    inCode = false;
    for (let index: Dynamic = 0; index < value.length; index++) {
      let replyLine: Dynamic = value[index],
        nextCharacter: Dynamic = replyLine + (value[index + 1] ?? "");
      if (lastLine === "*")
        nextCharacter === "*/" && ((lastLine = ""), (index += 1));
      else if (lastLine !== "")
        replyLine === "\\"
          ? (index += 1)
          : replyLine === lastLine && (lastLine = "");
      else {
        if (nextCharacter === "//") break;
        nextCharacter === "/*"
          ? ((lastLine = "*"), (index += 1))
          : replyLine === "`" || replyLine === '"' || replyLine === "'"
            ? (lastLine = replyLine)
            : "([{".includes(replyLine)
              ? (depth += 1)
              : ")]}".includes(replyLine) && (depth = Math.max(0, depth - 1));
      }
    }
    (lastLine === '"' || lastLine === "'") && (lastLine = "");
    accepting = lastLine === "" && depth === 0 && /[);}]\s*$/.test(value);
  }
  return (
    statements +
    (lastLine !== "" ||
    depth > 0 ||
    !accepting ||
    FAST_EDIT_REPLY_PREFIX_PATTERN.test(partialLine)
      ? (inCode && BARE_FAST_EDIT_SELECTOR_PATTERN.test(partialLine)
          ? "."
          : "") + partialLine
      : "")
  );
}
function parseFastEditReplyChunk(
  reply?: Dynamic,
  complete?: Dynamic,
): Dynamic {
  let endOffset: Dynamic = complete
      ? reply.length
      : reply.lastIndexOf(`
`) + 1,
    partialLine: Dynamic = reply.slice(endOffset);
  return extractFastEditReplyStatements(
    stripReplyInlineBackticks(
      stripReplyCodeFences(reply.slice(0, endOffset)),
    ),
    /^\s*`/.test(partialLine) ? "" : partialLine,
  );
}
async function applyFastEditRequest(
  editContext?: Dynamic,
  request?: Dynamic,
): Promise<Dynamic> {
  let result: Dynamic = {
      calls: 0,
      skipped: 0,
      reads: false,
      conflicts: 0,
      refusedAdd: false,
      fixes: [],
      refused: null,
      partly: false,
      applied: false,
      changed: new Set(),
      added: new Set(),
      removed: new Set(),
      named: null,
    },
    finish: Dynamic = (
      outcome?: Dynamic,
      errorCode: Dynamic = "",
      errorMessage: Dynamic = "",
    ): Dynamic => ({
      outcome: outcome,
      code: errorCode,
      message: errorMessage,
      calls: result.calls,
      made: summarizeFastEditAppliedChanges(result),
    });
  if (editContext.host().readOnly)
    return finish(
      "failed",
      "read_only",
      FAST_EDIT_ERROR_MESSAGES.read_only,
    );
  let previousBusyFile: Dynamic = editContext.session.busy;
  if (previousBusyFile !== null && editContext.held !== true)
    return finish("failed", "busy", FAST_EDIT_ERROR_MESSAGES.busy);
  let target: Dynamic = resolveFastEditFileTarget(
    editContext,
    editContext
      .host()
      .canvas.boards()
      .map((board?: Dynamic): Dynamic => board.file),
  );
  if (target === null)
    return finish(
      "failed",
      "no_artboards",
      FAST_EDIT_ERROR_MESSAGES.no_artboards,
    );
  let draftEmitters: Dynamic = new Map();
  editContext.session.busy = target.file;
  result.named = editContext.session.named;
  editContext.session.named = null;
  try {
    if (editContext.sandbox.available !== undefined) {
      let waitResult: Dynamic = await Promise.race([
        editContext.sandbox.available,
        waitForFastEditAbort(request.signal),
      ]);
      if (waitResult === "stopped") return finish("stopped", "cancelled");
      if (!waitResult)
        return finish(
          "failed",
          "not_loaded",
          FAST_EDIT_ERROR_MESSAGES.not_loaded,
        );
    }
    let value: Dynamic = target;
    for (;;) {
      let roundResult: Dynamic = await runFastEditSamplingRound(
        editContext,
        request,
        value,
        result,
        draftEmitters,
      );
      "done" in roundResult &&
        editContext.comment === undefined &&
        finishFastEditJournalTurn(
          editContext.session,
          result.applied
            ? roundResult.done.unsaved !== undefined
              ? "unconfirmed"
              : "done"
            : roundResult.done.outcome === "stopped"
              ? null
              : "nothing",
        );
      if ("done" in roundResult)
        return {
          ...roundResult.done,
          file: value.file,
        };
      value = roundResult.again;
    }
  } finally {
    for (let value of draftEmitters.values() as Dynamic) value.end();
    draftHtmlPreviewStore.clear();
    draftDocumentPreviewStore.clear();
    editContext.session.othersChanged.clear();
    editContext.session.busy = previousBusyFile;
  }
}
async function runFastEditSamplingRound(
  editContext?: Dynamic,
  request?: Dynamic,
  target?: Dynamic,
  result?: Dynamic,
  draftEmitters?: Dynamic,
): Promise<Dynamic> {
  let sleep: Dynamic =
      editContext.sleep ??
      ((delayMs?: Dynamic): Dynamic =>
        new Promise(
          (resolveDelay?: Dynamic): Dynamic => setTimeout(resolveDelay, delayMs),
        )),
    targetFile: Dynamic = target.file,
    firstCall: Dynamic = result.calls === 0,
    finish: Dynamic = (
      outcome?: Dynamic,
      errorCode: Dynamic = "",
      errorMessage: Dynamic = "",
    ): Dynamic => ({
      done: {
        outcome: outcome,
        code: errorCode,
        message: errorMessage,
        calls: result.calls,
        skipped: result.skipped,
        made: summarizeFastEditAppliedChanges(result),
      },
    }),
    fail: Dynamic = (failureCode?: Dynamic, failureDetail?: Dynamic): Dynamic => {
      throw {
        code: failureCode,
        message:
          FAST_EDIT_ERROR_MESSAGES[failureCode] ??
          FAST_EDIT_ERROR_MESSAGES.upstream_error,
        ...(failureDetail !== undefined
          ? {
              why: failureDetail,
            }
          : {}),
      };
    },
    host: Dynamic = editContext.host(),
    canvas: Dynamic = host.canvas,
    handles: Dynamic = host.handlesRef.current ?? new Map(),
    sandbox: Dynamic,
    timeout: Dynamic,
    writeScheduler: Dynamic = createFastEditWriteScheduler({
      now: (): Dynamic => performance.now(),
      schedule: (scheduledCallback?: Dynamic, delayMs?: Dynamic): Dynamic => {
        let timerId: Dynamic = setTimeout(scheduledCallback, delayMs);
        return (): Dynamic => {
          clearTimeout(timerId);
        };
      },
    }),
    onAbort: Dynamic = (): Dynamic => {},
    unsubscribe: Dynamic = (): Dynamic => {},
    disposed: Dynamic = false,
    cleanup: Dynamic = (): Dynamic => {
      disposed = true;
      unsubscribe();
      request.signal.removeEventListener("abort", onAbort);
      sandbox?.destroy();
      timeout !== undefined && clearTimeout(timeout);
      writeScheduler.clear();
      draftHtmlPreviewStore.clear();
      draftDocumentPreviewStore.clear();
    },
    gateReason: Dynamic = "",
    refuseGate: Dynamic = (gateReasonInput?: Dynamic): Dynamic => {
      throw (
        (gateReason = gateReasonInput),
        {
          code: "gate",
        }
      );
    },
    flag: Dynamic = false,
    sandboxFailed: Dynamic = false,
    value: Dynamic = null,
    index: Dynamic = 0,
    partialMark: Dynamic = null,
    wholeReply: Dynamic = true,
    text: Dynamic = "",
    cancelled: Dynamic = false,
    attemptIndex: Dynamic = 0,
    templates: Dynamic = new Map(),
    pendingHtml: Dynamic = [],
    errors: Dynamic = [],
    allowedFiles: Dynamic = new Set([targetFile]),
    originalTemplatesByPath: Dynamic = new Map(),
    fileIds: Dynamic = createFastEditFileIds([]),
    replyText: Dynamic = "",
    lastError: Dynamic = null,
    items: Dynamic = [],
    lastVisibleIndex: Dynamic = -1,
    callback: Dynamic = (identity?: Dynamic): Dynamic => identity;
  try {
    host.readOnly && fail("read_only");
    let isCanvasTarget: Dynamic = targetFile === "",
      entry: Dynamic = handles.get(targetFile);
    if (entry === undefined && !isCanvasTarget) return fail("gone");
    (firstCall || target.retargeted === true) &&
      editContext.holds(targetFile) &&
      fail("busy_other");
    let waitForReady: Dynamic = (): Dynamic =>
      entry !== undefined &&
      editContext.comment?.pin === undefined &&
      entry.previewFrameRef.current !== null &&
      !entry.isReady();
    for (
      let readyAttempts: Dynamic = 0;
      readyAttempts < 50 && waitForReady() && !request.signal.aborted;
      readyAttempts++
    )
      await sleep(120);
    waitForReady() && fail("not_ready");
    let boards: Dynamic = canvas.boards(),
      targetRectangle: Dynamic =
        editContext.comment?.pin === undefined
          ? undefined
          : {
              x: Math.round(editContext.comment.pin.x),
              y: Math.round(editContext.comment.pin.y),
              w: 0,
              h: 0,
            },
      selectedRectangle: Dynamic =
        editContext.comment?.pin === undefined
          ? undefined
          : boards.some(
                (board?: Dynamic): Dynamic => board.file === targetFile,
              )
            ? resolveCommentPinPosition(
                editContext.comment.pin,
                boards,
                targetFile,
              )
            : isCanvasTarget
              ? {
                  x: targetRectangle.x,
                  y: targetRectangle.y,
                  atPin: true,
                }
              : undefined,
      isSameRectangle: Dynamic = (width?: Dynamic, height?: Dynamic): Dynamic => {
        let commentTarget: Dynamic = (editContext.comment?.between ?? [])
            .flatMap(
              (candidateA?: Dynamic): Dynamic =>
                boards.find(
                  (candidateB?: Dynamic): Dynamic => candidateB.file === candidateA.file,
                ) ?? [],
            )
            .find(
              (rectangle?: Dynamic): Dynamic =>
                rectangle.w === width && rectangle.h === height,
            ),
          nearestRectangle: Dynamic =
            selectedRectangle === undefined || commentTarget === undefined
              ? null
              : findFreeSpotAfterRow(
                  groupArtboardsIntoRows(
                    boards.map(
                      (boardEntry?: Dynamic): Dynamic => ({
                        id: boardEntry.file,
                        ...artboardRectangle(boardEntry),
                      }),
                    ),
                  ).find(
                    (candidateBoards?: Dynamic): Dynamic =>
                      candidateBoards.some(
                        (board?: Dynamic): Dynamic =>
                          board.id === commentTarget.file,
                      ),
                  ),
                  boards.map(artboardRectangle),
                );
        return nearestRectangle !== null
          ? {
              x: Math.round(nearestRectangle.x),
              y: Math.round(nearestRectangle.y),
            }
          : selectedRectangle === undefined
            ? undefined
            : {
                x: selectedRectangle.x,
                y: selectedRectangle.y,
              };
      };
    !isCanvasTarget &&
      !boards.some((board?: Dynamic): Dynamic => board.file === targetFile) &&
      fail("gone");
    let orderedFiles: Dynamic = boards.map(
        (board?: Dynamic): Dynamic => board.file,
      ),
      candidateFiles: Dynamic =
        orderedFiles.length <= MAX_FAST_EDIT_FILES
          ? orderedFiles
          : [
              ...orderedFiles
                .filter((file?: Dynamic): Dynamic => file !== targetFile)
                .slice(0, MAX_FAST_EDIT_FILES - 1),
              targetFile,
            ].sort(
              (fileA?: Dynamic, fileB?: Dynamic): Dynamic =>
                orderedFiles.indexOf(fileA) - orderedFiles.indexOf(fileB),
            );
    fileIds = createFastEditFileIds(candidateFiles);
    originalTemplatesByPath = new Map();
    let entries: Dynamic = new Map(
        boards.map((board?: Dynamic): Dynamic => [board.file, board]),
      ),
      getBoardEntry: Dynamic = (file?: Dynamic): Dynamic =>
        distanceBetweenArtboards(
          entries.get(file),
          entries.get(targetFile) ?? targetRectangle ?? entries.get(file),
        ),
      promptChars: Dynamic = 0;
    for (let pendingFile of candidateFiles
      .filter((file?: Dynamic): Dynamic => handles.has(file))
      .sort(
        (fileA?: Dynamic, fileB?: Dynamic): Dynamic =>
          getBoardEntry(fileA) - getBoardEntry(fileB),
      ) as Dynamic) {
      if (promptChars > MAX_FAST_EDIT_BOX_CHARS) break;
      handles.get(pendingFile).hasPendingEdits() &&
        (await withFastEditTimeout(
          handles
            .get(pendingFile)
            .flushPending()
            .catch((): Dynamic => {}),
          FAST_EDIT_SANDBOX_START_TIMEOUT_MS,
        ));
      let template: Dynamic = await withFastEditTimeout(
        handles
          .get(pendingFile)
          .askTemplate()
          .catch((): Dynamic => null),
        2500,
      );
      if (
        typeof template == "string" &&
        template.length <= MAX_FAST_EDIT_SECTION_CHARS
      ) {
        originalTemplatesByPath.set(pendingFile, template);
        promptChars += template.length;
      } else if (typeof template == "string" && pendingFile === targetFile)
        return fail("prompt_too_large");
    }
    originalTemplatesByPath = new Map(
      candidateFiles.flatMap(
        (file?: Dynamic): Dynamic =>
          originalTemplatesByPath.has(file) ? [[file, originalTemplatesByPath.get(file)]] : [],
      ),
    );
    let targetTemplate: Dynamic = isCanvasTarget ? "" : originalTemplatesByPath.get(targetFile);
    if (targetTemplate === undefined) return fail("not_ready");
    let fileCandidates: Dynamic = [...originalTemplatesByPath.keys()],
      values: Dynamic = new Set(
        candidateFiles.flatMap((file?: Dynamic): Dynamic => {
          try {
            return handles.get(file)?.pageFonts() ?? [];
          } catch {
            return [];
          }
        }),
      ),
      pageStylesByFile: Dynamic = new Map(
        fileCandidates.map(
          (file?: Dynamic): Dynamic => [
            file,
            readPageStylesFromSheet(
              originalTemplatesByPath.get(file),
              values,
            ),
          ],
        ),
      ),
      getPromptTemplate: Dynamic = (file?: Dynamic): Dynamic =>
        serializeFastEditArtboard(
          fileIds.idOf.get(file),
          entries.get(file),
          hasPageStylesheet(originalTemplatesByPath.get(file))
            ? serializePageStyleAttributes(
                pageStylesByFile.get(file) ?? {},
              )
            : "",
        ) +
        encodeCamelCaseAttributes(
          stripHelmetMarkup(originalTemplatesByPath.get(file)),
        ) +
        "</section>",
      templateSizes: Dynamic = new Map(
        fileCandidates.map(
          (file?: Dynamic): Dynamic => [file, getPromptTemplate(file).length],
        ),
      );
    if ((templateSizes.get(targetFile) ?? 0) > MAX_FAST_EDIT_SECTION_CHARS)
      return fail("prompt_too_large");
    let totalTemplateChars: Dynamic = templateSizes.get(targetFile) ?? 0;
    for (let candidateFile of fileCandidates
      .filter((file?: Dynamic): Dynamic => file !== targetFile)
      .sort(
        (fileA?: Dynamic, fileB?: Dynamic): Dynamic =>
          getBoardEntry(fileA) - getBoardEntry(fileB),
      ) as Dynamic) {
      let templateSize: Dynamic = templateSizes.get(candidateFile);
      templateSize <= MAX_FAST_EDIT_SECTION_CHARS &&
      totalTemplateChars + templateSize <= MAX_FAST_EDIT_BOX_CHARS
        ? (totalTemplateChars += templateSize)
        : originalTemplatesByPath.delete(candidateFile);
    }
    let availableFiles: Dynamic = [...originalTemplatesByPath.keys()],
      ownedElementIds: Dynamic = collectOwnedElementIds([
        ...originalTemplatesByPath.values(),
      ]),
      targetFileId: Dynamic =
        editContext.comment === undefined
          ? target.by === "selected"
            ? undefined
            : [editContext.session.lastTouched, ...editContext.inView(availableFiles)].find(
                (file?: Dynamic): Dynamic =>
                  file !== targetFile && originalTemplatesByPath.has(file),
              )
          : editContext.second !== undefined &&
              editContext.second !== targetFile &&
              originalTemplatesByPath.has(editContext.second)
            ? editContext.second
            : undefined;
    collectJournalChanges(
      editContext.session,
      availableFiles.map(
        (file?: Dynamic): Dynamic => ({
          file: file,
          now: getPromptTemplate(file),
          other: editContext.session.othersChanged.has(file),
        }),
      ),
      (file?: Dynamic): Dynamic =>
        editContext.host().fileText(file) !== undefined,
    );
    let noOpCount: Dynamic = 0,
      failureCount: Dynamic = 0,
      successCount: Dynamic = 0,
      readCount: Dynamic = 0,
      neighborFiles: Dynamic = [],
      didRefuse: Dynamic = false,
      refusalReason: Dynamic = null,
      resolveWait: Dynamic,
      resolvePreview: Dynamic,
      promise: Dynamic = new Promise((resolveValue?: Dynamic): Dynamic => {
        resolveWait = resolveValue;
      }),
      templateEntries: Dynamic = new Map(),
      pendingEntries: Dynamic = new Map(),
      frameChars: Dynamic = 0,
      pendingChars: Dynamic = 0,
      rememberTemplate: Dynamic = (
        templateCache?: Dynamic,
        file?: Dynamic,
        templateHtml?: Dynamic,
      ): Dynamic => {
        frameChars += templateHtml.length - (templateCache.get(file)?.length ?? 0);
        templateCache.set(file, templateHtml);
        frameChars > MAX_FAST_EDIT_FRAME_OUTPUT_CHARS &&
          gateReason === "" &&
          ((gateReason = "too_big"),
          resolvePreview?.(),
          feedSamplingInput((signal?: Dynamic): Dynamic => signal.stop()),
          resolveWait?.());
      },
      changedFiles: Dynamic = new Set(),
      createdIds: Dynamic = new Set(),
      fileEmitters: Dynamic = new Map(),
      fileWrites: Dynamic = new Map(),
      templateRequests: Dynamic = new Map(),
      getDraftEmitter: Dynamic = (file?: Dynamic): Dynamic => {
        let draftEmitter: Dynamic = draftEmitters.get(file);
        draftEmitter === undefined &&
          ((draftEmitter = createDraftEmitter(file)),
          draftEmitters.set(file, draftEmitter));
        return draftEmitter;
      };
    isCanvasTarget || getDraftEmitter(targetFile).frame("");
    let readTemplate: Dynamic = (templateKey?: Dynamic): Dynamic => {
        if (disposed || request.signal.aborted || cancelled || value !== null)
          return 0;
        let templateSource: Dynamic = templateEntries.get(templateKey);
        if (templateSource === undefined) return 0;
        let rehydratedHtml: Dynamic = rehydrateFastEditHtml(
            "",
            templateSource,
            ownedElementIds,
          ),
          parsedSection: Dynamic = parseFastEditArtboardSection(
            templateSource,
          ),
          validatedTemplate: Dynamic =
            rehydratedHtml === null || parsedSection === null
              ? null
              : validateFastEditTemplate("", rehydratedHtml);
        if (parsedSection === null || validatedTemplate === null || !validatedTemplate.ok) {
          draftDocumentPreviewStore.drop(templateKey);
          return templateSource.length;
        }
        let width: Dynamic = parsedSection.w ?? 480,
          height: Dynamic = parsedSection.h ?? 560,
          cachedEntry: Dynamic = fileEmitters.get(templateKey);
        if (
          cachedEntry === undefined ||
          cachedEntry.w !== width ||
          cachedEntry.h !== height
        ) {
          let canvasBoards: Dynamic = canvas.boards(),
            targetBoard: Dynamic = canvasBoards.find(
              (board?: Dynamic): Dynamic => board.file === targetFile,
            );
          if (targetBoard === undefined && !isCanvasTarget) return templateSource.length;
          let existingTargetRect: Dynamic =
              targetBoard !== undefined
                ? artboardRectangle(targetBoard)
                : targetRectangle,
            neighborBoards: Dynamic = [
              ...canvasBoards.map(
                (board?: Dynamic): Dynamic =>
                  board.file === targetFile
                    ? existingTargetRect
                    : artboardRectangle(board),
              ),
              ...[...fileEmitters]
                .filter(([boardEntry]: Dynamic): Dynamic => boardEntry !== templateKey)
                .map(([, board]: Dynamic): Dynamic => board),
            ],
            availablePosition: Dynamic =
              parsedSection.x !== undefined &&
              parsedSection.y !== undefined &&
              Math.min(
                ...neighborBoards.map(
                  (file?: Dynamic): Dynamic =>
                    distanceBetweenArtboards(
                      {
                        x: parsedSection.x,
                        y: parsedSection.y,
                        w: width,
                        h: height,
                      },
                      file,
                    ),
                ),
              ) > 480,
            newPosition: Dynamic = findAvailableArtboardPosition(
              {
                ...(selectedRectangle !== undefined
                  ? isSameRectangle(width, height)
                  : parsedSection.x !== undefined &&
                      parsedSection.y !== undefined &&
                      !availablePosition
                    ? {
                        x: parsedSection.x,
                        y: parsedSection.y,
                      }
                    : {}),
                w: width,
                h: height,
              },
              neighborBoards,
              existingTargetRect,
            );
          cachedEntry = {
            x: newPosition.x,
            y: newPosition.y,
            w: width,
            h: height,
          };
          let isNewFile: Dynamic = !fileEmitters.has(templateKey);
          fileEmitters.set(templateKey, cachedEntry);
          if (isNewFile && !editContext.pointerDown())
            try {
              canvas.revealRect(cachedEntry);
            } catch {}
        }
        try {
          draftDocumentPreviewStore.set(templateKey, {
            ...cachedEntry,
            doc: buildStaticFastEditPreview(
              validatedTemplate.template,
              {},
            ),
            title: sanitizeArtboardTitle(
              parsedSection.title ?? "",
              40,
            ),
          });
        } catch {}
        return templateSource.length;
      },
      scheduleRead: Dynamic = (file?: Dynamic): Dynamic => {
        !didRefuse &&
          !disposed &&
          writeScheduler.ask("n:" + file, (): Dynamic => readTemplate(file));
      },
      filePreviews: Dynamic = new Map(),
      scheduleFileRead: Dynamic = (file?: Dynamic): Dynamic => {
        if (
          disposed ||
          request.signal.aborted ||
          gateReason !== "" ||
          cancelled ||
          value !== null
        )
          return 0;
        let template: Dynamic = templates.get(file),
          originalTemplate: Dynamic = originalTemplatesByPath.get(file);
        if (template === undefined || originalTemplate === undefined) return 0;
        let previewEntry: Dynamic = filePreviews.get(file);
        if (previewEntry === undefined) {
          if (!templateRequests.has(file)) {
            let templateDefaults: Dynamic = readTemplateInputDefaults(
                editContext.host().fileText(file) ?? "",
              ),
              renderDefaultsPromise: Dynamic = (
                handles.get(file)?.renderDefaults() ?? Promise.resolve({})
              ).catch((): Dynamic => ({})),
              previewPromise: Dynamic = Promise.race([
                renderDefaultsPromise,
                new Promise(
                  (resolvePreviewTimeout?: Dynamic): Dynamic => setTimeout(resolvePreviewTimeout, 400, {}),
                ),
              ]).then(
                (previewInput?: Dynamic): Dynamic => ({
                  ...templateDefaults,
                  ...previewInput,
                }),
              );
            templateRequests.set(file, previewPromise);
            previewPromise.then((previewDefaults?: Dynamic): Dynamic => {
              filePreviews.set(file, previewDefaults);
              queueFileRead(file);
            });
          }
          return 0;
        }
        let templateBoardSize: Dynamic = template.length + originalTemplate.length,
          rehydratedTemplate: Dynamic = rehydrateFastEditHtml(
            originalTemplate,
            template,
            ownedElementIds,
          ),
          validatedPreview: Dynamic =
            rehydratedTemplate === null
              ? null
              : validateFastEditTemplate(
                  originalTemplate,
                  preserveHelmetMarkup(originalTemplate, rehydratedTemplate),
                );
        if (validatedPreview === null || !validatedPreview.ok) {
          draftHtmlPreviewStore.set(file, null);
          return templateBoardSize;
        }
        let writtenTemplate: Dynamic = fileWrites.get(file);
        if (writtenTemplate === undefined) {
          let validatedWrittenTemplate: Dynamic = validateFastEditTemplate(
            originalTemplate,
            originalTemplate,
          );
          writtenTemplate = validatedWrittenTemplate.ok ? validatedWrittenTemplate.template : "";
          fileWrites.set(file, writtenTemplate);
        }
        if (validatedPreview.template === writtenTemplate) {
          draftHtmlPreviewStore.set(file, null);
          return templateBoardSize;
        }
        let plainPreviewText: Dynamic = stripHelmetMarkup(
          validatedPreview.template,
        );
        if (
          plainPreviewText.replace(/<[^>]*>/g, "").trim() === "" &&
          !/<(?:img|svg|hr|table|button|input)\b/i.test(plainPreviewText) &&
          stripHelmetMarkup(writtenTemplate)
            .replace(/<[^>]*>/g, "")
            .trim() !== ""
        )
          return templateBoardSize;
        try {
          draftHtmlPreviewStore.set(
            file,
            buildStaticFastEditPreview(validatedPreview.template, previewEntry),
          );
        } catch {
          return templateBoardSize;
        }
        getDraftEmitter(file).frame(validatedPreview.template);
        return templateBoardSize;
      },
      queueFileRead: Dynamic = (fileKey?: Dynamic): Dynamic => {
        !didRefuse &&
          !disposed &&
          writeScheduler.ask("f:" + fileKey, (): Dynamic => scheduleFileRead(fileKey));
      },
      feedSamplingInput: Dynamic = (streamChunk?: Dynamic): Dynamic => {
        try {
          sandbox !== undefined && streamChunk(sandbox);
        } catch {
          sandboxFailed = true;
          resolvePreview?.();
        }
      },
      emitOutputChunk: Dynamic = (outputChunk?: Dynamic): Dynamic =>
        feedSamplingInput((streamWriter?: Dynamic): Dynamic => streamWriter.feed(outputChunk));
    try {
      sandbox = editContext.sandbox.create({
        files: candidateFiles.map(
          (fileKey?: Dynamic): Dynamic => ({
            id: fileIds.idOf.get(fileKey),
            path: fileKey,
            title: safeArtboardTitle(entries.get(fileKey).title),
            html: originalTemplatesByPath.has(fileKey)
              ? getPromptTemplate(fileKey)
              : serializeFastEditArtboard(
                  fileIds.idOf.get(fileKey),
                  entries.get(fileKey),
                  "",
                ) + "</section>",
          }),
        ),
        get title() { return sanitizeArtboardTitle(host.canvasTitle, 300) || (uiMessage("canvas.request.canvas")); },
        ...(isCanvasTarget
          ? {}
          : {
              current: fileIds.idOf.get(targetFile),
            }),
        onHtml: (operationResult?: Dynamic): Dynamic => {
          if (operationResult.final === true) {
            didRefuse && resolveWait?.();
            return;
          }
          let changedFileKey: Dynamic =
            operationResult.id === null ? undefined : fileIds.pathOf.get(operationResult.id);
          if (!(frameChars > MAX_FAST_EDIT_FRAME_OUTPUT_CHARS)) {
            if (
              changedFileKey !== undefined &&
              !originalTemplatesByPath.has(changedFileKey) &&
              operationResult.html.length > MAX_FAST_EDIT_INPUT_LOG_CHARS
            ) {
              changedFiles.add(changedFileKey);
              return;
            }
            changedFileKey !== undefined
              ? (rememberTemplate(templates, changedFileKey, operationResult.html),
                queueFileRead(changedFileKey))
              : operationResult.id !== null && templateEntries.has(operationResult.id)
                ? (rememberTemplate(templateEntries, operationResult.id, operationResult.html),
                  scheduleRead(operationResult.id))
                : operationResult.id !== null &&
                  pendingEntries.has(operationResult.id) &&
                  rememberTemplate(pendingEntries, operationResult.id, operationResult.html);
          }
        },
        onOp: (operationInput?: Dynamic): Dynamic => {
          let parsedOperation: Dynamic = operationInput;
          if (
            parsedOperation !== null &&
            typeof parsedOperation == "object" &&
            parsedOperation.op === "askClaude"
          ) {
            value === null &&
              ((value =
                typeof parsedOperation.prompt == "string"
                  ? sanitizeArtboardTitle(parsedOperation.prompt, 1e3)
                  : ""),
              editContext.onStatement?.(),
              draftHtmlPreviewStore.clear(),
              draftDocumentPreviewStore.clear(),
              resolvePreview?.(),
              feedSamplingInput((streamWriter?: Dynamic): Dynamic => streamWriter.stop()),
              resolveWait?.());
            return;
          }
          if (value !== null) return;
          readCount += 1;
          let operation: Dynamic = parseFastEditArtboardOperation(
              operationInput,
              fileIds.pathOf,
            ),
            operationFileId: Dynamic =
              operation !== null &&
              (operation.op === "add" || operation.op === "duplicate");
          operation !== null &&
            (operationFileId
              ? pendingChars <= FAST_EDIT_OPERATION_LIMITS.news
              : pendingHtml.length - pendingChars < MAX_FAST_EDIT_FILES) &&
            (pendingHtml.push(operation),
            operationFileId && (pendingChars += 1),
            operation.op === "duplicate" &&
              operation.newId !== undefined &&
              rememberTemplate(pendingEntries, operation.newId, operation.html ?? ""));
          if (
            operation !== null &&
            operation.op === "add" &&
            operation.id !== undefined &&
            !fileIds.pathOf.has(operation.id) &&
            templateEntries.size -
              (templateEntries.has(OPEN_ARTBOARD_PLACEHOLDER_ID) ? 1 : 0) <
              FAST_EDIT_OPERATION_LIMITS.news
          ) {
            let existingEmitter: Dynamic = fileEmitters.get(
              OPEN_ARTBOARD_PLACEHOLDER_ID,
            );
            templateEntries.delete(OPEN_ARTBOARD_PLACEHOLDER_ID);
            fileEmitters.delete(OPEN_ARTBOARD_PLACEHOLDER_ID);
            draftDocumentPreviewStore.drop(
              OPEN_ARTBOARD_PLACEHOLDER_ID,
            );
            existingEmitter !== undefined && fileEmitters.set(operation.id, existingEmitter);
            rememberTemplate(templateEntries, operation.id, operation.html);
            scheduleRead(operation.id);
          }
          let removeInput: Dynamic = operationInput;
          removeInput !== null &&
            typeof removeInput == "object" &&
            removeInput.op === "remove" &&
            typeof removeInput.id == "string" &&
            templateEntries.has(removeInput.id) &&
            (templateEntries.delete(removeInput.id),
            createdIds.add(removeInput.id),
            draftDocumentPreviewStore.drop(removeInput.id));
        },
        onDone: (completionResult?: Dynamic): Dynamic => {
          attemptIndex += 1;
          items.push(completionResult.stmt ?? "");
          completionResult.changed.length > 0
            ? (noOpCount += 1)
            : lastError === null &&
              readCount === 0 &&
              completionResult.failed !== true &&
              completionResult.stmt !== undefined &&
              !FAST_EDIT_CONTROL_CALL_PATTERN.test(completionResult.stmt) &&
              (((editContext.noMatch?.inserts ??
                FAST_EDIT_COLLECT_READS) &&
                FAST_EDIT_HTML_INSERTION_PATTERN.test(completionResult.stmt) &&
                completionResult.stmt.includes("<")) ||
                ((editContext.noMatch?.writes ??
                  FAST_EDIT_ALLOW_EMPTY_SELECTION) &&
                  FAST_EDIT_MUTATION_CALL_PATTERN.test(
                    completionResult.stmt,
                  ))) &&
              ((lastError = completionResult.stmt), (lastVisibleIndex = items.length - 1));
          readCount = 0;
          value === null && editContext.onStatement?.();
        },
        onPreview: (event?: Dynamic): Dynamic => {
          if (
            request.signal.aborted ||
            cancelled ||
            typeof event.html != "string" ||
            event.html.length > 2e5
          )
            return;
          if (
            event.method === "create" &&
            event.target === null &&
            /^<section\b/i.test(event.html)
          ) {
            templateEntries.set(OPEN_ARTBOARD_PLACEHOLDER_ID, event.html);
            scheduleRead(OPEN_ARTBOARD_PLACEHOLDER_ID);
            return;
          }
          if (
            event.method !== "html" ||
            event.target === null ||
            typeof event.target.file != "string" ||
            event.target.id !== event.target.file
          )
            return;
          let eventFileKey: Dynamic = fileIds.pathOf.get(event.target.file),
            eventHtml: Dynamic =
              eventFileKey === undefined ? undefined : originalTemplatesByPath.get(eventFileKey);
          if (
            eventFileKey === undefined ||
            eventHtml === undefined ||
            didRefuse ||
            disposed
          )
            return;
          let html: Dynamic = event.html;
          writeScheduler.ask("f:" + eventFileKey, (): Dynamic => {
            if (disposed || request.signal.aborted || cancelled || value !== null)
              return 0;
            let validatedEventHtml: Dynamic = validateFastEditTemplate(
              eventHtml,
              preserveHelmetMarkup(eventHtml, html),
            );
            if (validatedEventHtml.ok)
              try {
                draftHtmlPreviewStore.set(
                  eventFileKey,
                  buildStaticFastEditPreview(
                    validatedEventHtml.template,
                    readTemplateInputDefaults(
                      editContext.host().fileText(eventFileKey) ?? "",
                    ),
                  ),
                );
              } catch {}
            return html.length + eventHtml.length;
          });
        },
        onError: (errorResult?: Dynamic): Dynamic => {
          let refusalCode: Dynamic = errorResult.refused;
          refusalReason === null &&
            (refusalCode === "exists" ||
              refusalCode === "removed" ||
              refusalCode === "own" ||
              refusalCode === "not_plain") &&
            (refusalReason = {
              code: refusalCode,
              id:
                typeof errorResult.id == "string" &&
                /^[A-Za-z][A-Za-z0-9_-]{0,23}$/.test(errorResult.id)
                  ? errorResult.id
                  : "",
            });
          failureCount += 1;
          errorResult.fatal === true &&
            ((sandboxFailed = true), (text = String(errorResult.message)), resolvePreview?.());
        },
        onLog: (logEntry?: Dynamic): Dynamic => {
          typeof logEntry.n == "number" &&
            neighborFiles.length < MAX_PROMPT_ARTBOARD_NEIGHBORS &&
            neighborFiles.push(
              typeof logEntry.message == "string" ? logEntry.message : "",
            );
        },
        onTouch: (): Dynamic => {
          successCount += 1;
        },
      });
    } catch {
      sandbox = undefined;
    }
    let samplingPromise: Dynamic = isCanvasTarget
        ? Promise.resolve("held")
        : verifySandboxTemplateRoundTrip(
            editContext.sandbox,
            stripHelmetMarkup(targetTemplate),
          ),
      samplingResult: Dynamic =
        sandbox === undefined
          ? {
              ok: false,
            }
          : await withFastEditTimeout(
              Promise.resolve(sandbox.ready).catch(
                (): Dynamic => ({
                  ok: false,
                }),
              ),
              2500,
            ),
      handleLateSampling: Dynamic = (): Dynamic =>
        fail(
          editContext.starts !== undefined &&
            ++editContext.starts.lateInARow >=
              MAX_FAST_EDIT_REPAIR_ATTEMPTS
            ? "start_stuck"
            : "slow_start",
        );
    if (
      sandbox !== undefined &&
      (samplingResult === FAST_EDIT_TIMEOUT_SENTINEL ||
        (samplingResult.ok === false &&
          SANDBOX_NOT_READY_MESSAGE_PATTERN.test(text)))
    )
      return handleLateSampling();
    if (
      sandbox === undefined ||
      samplingResult === FAST_EDIT_TIMEOUT_SENTINEL ||
      samplingResult.ok === false
    )
      return fail("no_box");
    let samplingStatus: Dynamic = await samplingPromise;
    if (samplingStatus === "late") return handleLateSampling();
    editContext.starts !== undefined && (editContext.starts.lateInARow = 0);
    (samplingStatus === "reshaped" ||
      !validateFastEditTemplate(targetTemplate, targetTemplate).ok) &&
      fail("box_cannot_hold");
    request.signal.aborted && fail("cancelled");
    let sampleTargetFileId: Dynamic = fileIds.idOf.get(targetFile) ?? "",
      targetEntryId: Dynamic = fileIds.idOf.get(
        isCanvasTarget ? (availableFiles[0] ?? candidateFiles[0] ?? "") : targetFile,
      ),
      targetSnapshot: Dynamic =
        targetEntryId === undefined
          ? {
              html: "",
              prefix: "k",
            }
          : await withFastEditTimeout(
              sandbox.view(targetEntryId).catch((): Dynamic => null),
              2e3,
            ),
      targetReadResult: Dynamic =
        isCanvasTarget &&
        targetSnapshot !== FAST_EDIT_TIMEOUT_SENTINEL &&
        targetSnapshot !== null
          ? {
              ...targetSnapshot,
              html: "",
            }
          : targetSnapshot;
    if (
      targetReadResult === FAST_EDIT_TIMEOUT_SENTINEL ||
      targetReadResult === null ||
      typeof targetReadResult.html != "string" ||
      !/^[a-z]{1,8}$/.test(targetReadResult.prefix)
    )
      return fail("no_box");
    let inlineReadResult: Dynamic =
        targetFileId === undefined
          ? null
          : await withFastEditTimeout(
              sandbox
                .view(fileIds.idOf.get(targetFileId))
                .catch((): Dynamic => null),
              2e3,
            ),
      inlineHtmlResult: Dynamic =
        inlineReadResult !== FAST_EDIT_TIMEOUT_SENTINEL &&
        inlineReadResult !== null &&
        typeof inlineReadResult.html == "string"
          ? {
              id: fileIds.idOf.get(targetFileId),
              html: truncateLargeDataUris(
                removeHelmetHandleIds(
                  inlineReadResult.html,
                  targetReadResult.prefix,
                ),
              ),
            }
          : undefined,
      targetHtmlSnapshot: Dynamic =
        inlineHtmlResult !== undefined &&
        inlineHtmlResult.html.length <= MAX_INLINE_DATA_URI_CHARS &&
        editContext.contextOnly !== true
          ? targetFileId
          : undefined,
      inlineDataCosts: Dynamic = new Map(
        availableFiles.map((availableFile?: Dynamic): Dynamic => {
          let promptHtml: Dynamic = truncateLargeDataUris(
            getPromptTemplate(availableFile),
          );
          return [
            availableFile,
            promptHtml.length + 12 * (promptHtml.match(/<[a-z]/gi)?.length ?? 0),
          ];
        }),
      ),
      inlineCostFor: Dynamic = (fileKey?: Dynamic): Dynamic =>
        inlineDataCosts.get(fileKey),
      remainingInlineBudget: Dynamic =
        MAX_DATA_URI_SCAN_CHARS -
        Math.min(
          inlineDataCosts.get(targetFile) ?? 0,
          editContext.comment !== undefined
            ? 24e3
            : MAX_DATA_URI_SCAN_CHARS,
        ) -
        (inlineHtmlResult === undefined
          ? 0
          : Math.min(inlineHtmlResult.html.length, MAX_INLINE_DATA_URI_CHARS)),
      candidateFileKeys: Dynamic = (
        editContext.comment !== undefined && editContext.comment.pin === undefined
          ? []
          : [
              ...new Set([
                editContext.session.lastTouched,
                ...editContext.inView(availableFiles),
                ...availableFiles,
              ]),
            ]
      ).filter(
        (fileKey?: Dynamic): Dynamic =>
          inlineDataCosts.has(fileKey) &&
          fileKey !== targetFile &&
          fileKey !== targetFileId &&
          inlineCostFor(fileKey) <= remainingInlineBudget &&
          (remainingInlineBudget -= inlineCostFor(fileKey)) >= 0,
      ),
      orderedCandidateFiles: Dynamic = (
        await Promise.all(
          candidateFileKeys.map(
            (fileKey?: Dynamic): Dynamic =>
              withFastEditTimeout(
                sandbox
                  .view(fileIds.idOf.get(fileKey))
                  .catch((): Dynamic => null),
                2e3,
              ),
          ),
        )
      ).flatMap(
        (readResult?: Dynamic, candidateIndex?: Dynamic): Dynamic =>
          readResult !== FAST_EDIT_TIMEOUT_SENTINEL &&
          readResult !== null &&
          typeof readResult.html == "string"
            ? [
                {
                  id: fileIds.idOf.get(candidateFileKeys[candidateIndex]),
                  html: removeHelmetHandleIds(
                    readResult.html,
                    targetReadResult.prefix,
                  ),
                },
              ]
            : [],
      ),
      fileSnapshots: Dynamic = new Map([
        ...(isCanvasTarget ? [] : [[targetFile, targetReadResult.html]]),
        ...(inlineReadResult !== FAST_EDIT_TIMEOUT_SENTINEL &&
        inlineReadResult !== null &&
        typeof inlineReadResult.html == "string"
          ? [[targetFileId, inlineReadResult.html]]
          : []),
        ...orderedCandidateFiles.map(
          (snapshot?: Dynamic): Dynamic => [
            fileIds.pathOf.get(snapshot.id) ?? "",
            snapshot.html,
          ],
        ),
      ]),
      pendingHtmlByFile: Dynamic = new Map(),
      describeTemplateShape: Dynamic = (templateHtml?: Dynamic): Dynamic => {
        let shapeNodes: Dynamic = Array.from(
          parseTargetTemplate(templateHtml).querySelectorAll("*"),
        );
        return {
          ids: shapeNodes.map(
            (element?: Dynamic): Dynamic => element.getAttribute("id") ?? "",
          ),
          shape: shapeNodes
            .map(
              (node?: Dynamic): Dynamic =>
                node.localName + String(node.children.length),
            )
            .join(" "),
        };
      },
      templateShapeCache: Dynamic = new Map(),
      getTemplateShape: Dynamic = (fileKey?: Dynamic): Dynamic => {
        let cachedShape: Dynamic = templateShapeCache.get(fileKey);
        if (cachedShape === undefined) {
          let fileSnapshot: Dynamic = fileSnapshots.get(fileKey),
            namedState: Dynamic = result.named.states.get(fileKey),
            templateShape: Dynamic =
              fileSnapshot === undefined ||
              namedState === undefined ||
              namedState.text !== getPromptTemplate(fileKey)
                ? null
                : describeTemplateShape(fileSnapshot);
          templateShapeCache.set(
            fileKey,
            (cachedShape =
              templateShape === null || templateShape.shape !== namedState.shape
                ? null
                : templateShape.ids),
          );
        }
        return cachedShape;
      },
      renameHints: Dynamic = (result.named?.at ?? []).flatMap(
        (renameHint?: Dynamic): Dynamic => {
          let knownNames: Dynamic = getTemplateShape(renameHint.file);
          if (knownNames === null) return [];
          let currentName: Dynamic =
            renameHint.at < 0 ? null : (knownNames[renameHint.at] ?? "");
          return currentName === renameHint.was
            ? []
            : [
                {
                  was: renameHint.was,
                  now: currentName,
                  on: fileIds.idOf.get(renameHint.file) ?? "",
                },
              ];
        },
      ),
      targetBoardEntry: Dynamic = entries.get(targetFile),
      targetReadValue: Dynamic =
        editContext.comment?.path === undefined || editContext.drawnAt === undefined
          ? null
          : await withFastEditTimeout(
              editContext
                .drawnAt(
                  targetFile,
                  editContext.comment.path,
                  editContext.comment.tid ?? null,
                )
                .catch((): Dynamic => null),
              2e3,
            ),
      targetPageState: Dynamic =
        targetReadValue === FAST_EDIT_TIMEOUT_SENTINEL ? null : targetReadValue;
    targetPageState?.imported === true && fail("in_import");
    if (
      editContext.comment?.fp === true &&
      editContext.comment.path !== undefined &&
      targetPageState !== null &&
      !targetPageState.atPath
    ) {
      let emptyListState: Dynamic =
        editContext.rectsOf === undefined
          ? null
          : await withFastEditTimeout(
              editContext
                .rectsOf(targetFile, [
                  {
                    path: editContext.comment.path,
                    tid: null,
                  },
                ])
                .catch((): Dynamic => null),
              2e3,
            );
      (Array.isArray(emptyListState) &&
        emptyListState.length === 1 &&
        emptyListState[0] === null) ||
        fail("not_named");
    }
    let targetPageEntry: Dynamic =
      editContext.comment?.path === undefined
        ? null
        : resolveClickedElementTarget(
            editContext.comment.path,
            targetPageState,
            targetTemplate,
            targetReadResult.html,
            targetReadResult.prefix,
          );
    editContext.comment?.path !== undefined &&
      targetPageEntry === null &&
      targetPageState?.hollow !== true &&
      fail("not_named");
    let blankTarget: Dynamic =
        targetPageEntry === null ||
        targetPageEntry.hollow ||
        targetPageState === null ||
        (!targetPageState.atPath && targetPageState.all === "") ||
        editContext.comment?.click.x === undefined ||
        editContext.comment.click.y === undefined ||
        STRUCTURAL_LEAF_ELEMENT_TAGS.has(targetPageEntry.tag)
          ? null
          : findNearestProbeRectangle(
              targetPageState.words,
              editContext.comment.click.x,
              editContext.comment.click.y,
            ),
      targetIsListed: Dynamic = targetPageEntry !== null && targetPageEntry.inList,
      targetHandles: Dynamic =
        editContext.comment !== undefined || target.by !== "selected"
          ? []
          : (host.selectedElements?.find(
              (fileEntry?: Dynamic): Dynamic => fileEntry.file === targetFile,
            )?.tids ?? []),
      resolvedHandleIds: Dynamic = resolveTemplateHandleIds(
        [...new Set(targetHandles)],
        targetTemplate,
        targetReadResult.html,
        targetReadResult.prefix,
      ).flatMap((handleId?: Dynamic): Dynamic => handleId ?? []),
      visibleHandles: Dynamic = resolvedHandleIds.slice(0, MAX_PROMPT_LIST_ITEMS),
      canvasLayout: Dynamic =
        targetPageEntry === null ||
        targetPageEntry.hollow ||
        editContext.layoutOf === undefined ||
        targetPageState?.atPath === false
          ? null
          : await withFastEditTimeout(
              editContext
                .layoutOf(targetFile, editContext.comment.path)
                .catch((): Dynamic => null),
              2e3,
            );
    result.applied ||
      (editContext.session.turn = {
        file: targetFile,
        before: isCanvasTarget ? "" : getPromptTemplate(targetFile),
      });
    let fileLabelFor: Dynamic = (fileKey?: Dynamic): Dynamic =>
        fileIds.idOf.get(fileKey) ?? fileKey.replace(/\.dc\.html$/, ""),
      lastReadResult: Dynamic = recordFastEditReadResult(
        editContext.session.journal,
        {
          file: targetFile,
          html: targetReadResult.html,
          prefix: targetReadResult.prefix,
        },
        fileLabelFor,
      ),
      lastTouchedSnapshot: Dynamic =
        targetFileId === editContext.session.lastTouched
          ? inlineHtmlResult
          : orderedCandidateFiles.find(
              (historyEntry?: Dynamic): Dynamic =>
                historyEntry.id === fileIds.idOf.get(editContext.session.lastTouched),
            ),
      activeHandle: Dynamic =
        lastTouchedSnapshot !== undefined
          ? recordFastEditReadResult(
              editContext.session.journal,
              {
                file: editContext.session.lastTouched,
                html: lastTouchedSnapshot.html,
                prefix: targetReadResult.prefix,
              },
              fileLabelFor,
            ).last
          : lastReadResult.last,
      state: Dynamic = {
        lastMade:
          editContext.session.lastTouched !== "" &&
          fileIds.idOf.has(editContext.session.lastTouched)
            ? fileIds.idOf.get(editContext.session.lastTouched)
            : null,
        ...(activeHandle !== null &&
        activeHandle.file === editContext.session.lastTouched &&
        activeHandle.handle !== ""
          ? {
              lastElement: activeHandle.handle,
            }
          : {}),
      },
      history: Dynamic = editContext.session.history,
      historyTurnId: Dynamic = beginHistoryTurn(history),
      trimHistory: Dynamic = (historyText?: Dynamic): Dynamic => {
        history.turns.push({
          role: "user",
          id: historyTurnId,
          content: "",
        });
        let trimmedTurns: Dynamic = trimHistoryTurns(
          history.turns,
          historyText,
        );
        history.turns.pop();
        return trimmedTurns;
      },
      droppedTurns: Dynamic = trimHistory(history.chars),
      samplingState: Dynamic = {
        history: history.turns,
        turn: historyTurnId,
        historyChars: history.chars,
        renamed: renameHints,
        rules: editContext.rules.split("{{PREFIX}}").join(targetReadResult.prefix),
        ...(editContext.addRules !== undefined &&
        (editContext.comment === undefined || editContext.comment.pin !== undefined)
          ? {
              extraRules: editContext.addRules
                .split("{{PREFIX}}")
                .join(targetReadResult.prefix),
            }
          : {}),
        ...(editContext.contextOnly === true
          ? {
              contextOnly: true,
            }
          : {}),
        shown: {
          id: sampleTargetFileId,
          html: removeHelmetHandleIds(
            targetReadResult.html,
            targetReadResult.prefix,
          ),
          w: targetBoardEntry?.w ?? 0,
          h: targetBoardEntry?.h ?? 0,
        },
        click:
          editContext.comment === undefined
            ? {}
            : targetPageEntry !== null && !targetPageEntry.hollow
              ? {
                  ...editContext.comment.click,
                  element: {
                    id: targetPageEntry.id,
                    tag: targetPageEntry.tag,
                    text: targetPageEntry.text,
                    ...(targetIsListed
                      ? {
                          inList: true,
                        }
                      : {}),
                    ...((
                      targetPageEntry.own === ""
                        ? containsOnlyTemplateInterpolation(
                            targetPageEntry.text,
                          )
                        : targetPageEntry.own.includes("{{")
                    )
                      ? {
                          fromSetting: true,
                        }
                      : {}),
                    ...(targetPageEntry.drawing !== null
                      ? {
                          drawing: targetPageEntry.drawing,
                        }
                      : {}),
                    ...(targetPageState !== null && targetPageState.all !== ""
                      ? {
                          drawnAs: targetPageState.all,
                        }
                      : {}),
                    ...(targetPageState !== null
                      ? {
                          look:
                            targetPageState.words.length > 0
                              ? targetPageState.look
                              : pickTargetAppearanceContext(
                                  targetPageState.look,
                                ),
                        }
                      : {}),
                  },
                  parent: targetPageEntry.parent,
                  ...(canvasLayout !== null &&
                  canvasLayout !== FAST_EDIT_TIMEOUT_SENTINEL
                    ? {
                        layout: canvasLayout,
                      }
                    : {}),
                  ...(blankTarget !== null
                    ? {
                        blank: blankTarget,
                        ...pickTargetSiblingContext(
                          await resolveFastEditClickTarget(
                            editContext,
                            targetFile,
                            editContext.comment.click,
                            targetReadResult.html,
                            targetReadResult.prefix,
                          ),
                        ),
                      }
                    : {}),
                }
              : editContext.comment.click.ground === true ||
                  editContext.comment.path !== undefined
                ? {
                    ...editContext.comment.click,
                    ground: true,
                    ...(targetIsListed
                      ? {
                          ...pickTargetSiblingContext(
                            await resolveFastEditClickTarget(
                              editContext,
                              targetFile,
                              editContext.comment.click,
                              targetReadResult.html,
                              targetReadResult.prefix,
                            ),
                          ),
                          inside: targetPageEntry.id,
                          insideList: true,
                        }
                      : await resolveFastEditClickTarget(
                          editContext,
                          targetFile,
                          editContext.comment.click,
                          targetReadResult.html,
                          targetReadResult.prefix,
                        )),
                  }
                : {
                    ...editContext.comment.click,
                    ...(editContext.comment.between !== undefined
                      ? {
                          between: editContext.comment.between.map(
                            (referenceHandle?: Dynamic): Dynamic => ({
                              id: fileIds.idOf.get(referenceHandle.file) ?? "",
                              px: referenceHandle.px,
                              side: referenceHandle.side,
                            }),
                          ),
                        }
                      : {}),
                    ...(selectedRectangle !== undefined
                      ? {
                          newAt: selectedRectangle,
                        }
                      : {}),
                  },
        comment: request.words,
        maxBytes: editContext.maxBytes,
        journal: lastReadResult.text,
        writing: availableFiles
          .filter(
            (fileKey?: Dynamic): Dynamic =>
              fileKey !== targetFile && editContext.holds(fileKey),
          )
          .map((fileKey?: Dynamic): Dynamic => fileIds.idOf.get(fileKey)),
        design: ((distanceMap?: Dynamic): Dynamic =>
          candidateFiles.map((fileKey?: Dynamic): Dynamic => {
            let boardEntry: Dynamic = entries.get(fileKey),
              boardText: Dynamic = originalTemplatesByPath.has(fileKey)
                ? summarizeArtboardText(getPromptTemplate(fileKey))
                : "";
            return {
              id: fileIds.idOf.get(fileKey),
              w: boardEntry.w,
              h: boardEntry.h,
              words: boardText,
              ...(originalTemplatesByPath.has(fileKey)
                ? boardText === "" &&
                  isEmptyStructuralTemplate(getPromptTemplate(fileKey))
                  ? {
                      empty: true,
                    }
                  : {}
                : {
                    tooLarge: true,
                  }),
              x: boardEntry.x,
              y: boardEntry.y,
              title: safeArtboardTitle(boardEntry.title),
              far: distanceMap.get(fileKey),
            };
          }))(
          new Map(
            [...candidateFiles]
              .sort(
                (leftFile?: Dynamic, rightFile?: Dynamic): Dynamic =>
                  Number(originalTemplatesByPath.has(rightFile)) -
                    Number(originalTemplatesByPath.has(leftFile)) ||
                  getBoardEntry(leftFile) - getBoardEntry(rightFile),
              )
              .map(
                (fileKey?: Dynamic, fileIndex?: Dynamic): Dynamic => [
                  fileKey,
                  fileIndex,
                ],
              ),
          ),
        ),
        inView: editContext
          .inView(availableFiles)
          .slice(0, 12)
          .map((fileKey?: Dynamic): Dynamic => fileIds.idOf.get(fileKey)),
        ...(target.report !== undefined
          ? {
              note: target.report.split("{{PREFIX}}").join(targetReadResult.prefix),
              ...(target.line !== undefined
                ? {
                    noteLine: target.line,
                  }
                : {}),
            }
          : {}),
        ...(inlineHtmlResult !== undefined
          ? {
              second: inlineHtmlResult,
            }
          : {}),
        ...(orderedCandidateFiles.length > 0
          ? {
              more: orderedCandidateFiles,
            }
          : {}),
        ...(target.logs !== undefined
          ? {
              logs: target.logs,
            }
          : {}),
        ...(editContext.comment !== undefined
          ? state
          : {
              typed: {
                by: target.by,
                pictures: request.images.length,
                ...state,
                elements: visibleHandles.map(
                  (handle?: Dynamic): Dynamic => ({
                    id: handle.id,
                    tag: handle.tag,
                    text: handle.text,
                    drawing: handle.drawing,
                    ...(handle.inList
                      ? {
                          inList: true,
                        }
                      : {}),
                  }),
                ),
                moreElements: resolvedHandleIds.length - visibleHandles.length,
                othersChanged: [...editContext.session.othersChanged]
                  .map(
                    (fileKey?: Dynamic): Dynamic =>
                      fileIds.idOf.get(fileKey) ?? "",
                  )
                  .filter((fileId?: Dynamic): Dynamic => fileId !== "")
                  .slice(0, 6),
                places:
                  target.by !== "selected"
                    ? describeFreeCanvasSpots(
                        candidateFiles.map(
                          (fileKey?: Dynamic): Dynamic => ({
                            id: fileIds.idOf.get(fileKey),
                            ...artboardRectangle(
                              entries.get(fileKey),
                            ),
                          }),
                        ),
                        boards.map(artboardRectangle),
                        editContext
                          .inView(availableFiles)
                          .slice(0, 12)
                          .map(
                            (fileKey?: Dynamic): Dynamic =>
                              fileIds.idOf.get(fileKey),
                          ),
                      )
                    : findAdjacentArtboardSpaces(
                        boards
                          .filter(
                            (candidate?: Dynamic): Dynamic =>
                              candidate.file !== targetFile,
                          )
                          .map(artboardRectangle),
                        artboardRectangle(targetBoardEntry),
                      ).line,
              },
            }),
      },
      runSampling: Dynamic = (): Dynamic =>
        buildFastEditPrompt({
          ...samplingState,
          told: [
            ...history.told,
            ...(droppedTurns.length > 0
              ? [describeAutomaticallyDroppedTurns(droppedTurns)]
              : []),
          ],
        }),
      samplingOutcome: Dynamic = runSampling();
    for (
      !samplingOutcome.ok &&
      history.told.length > 0 &&
      (resetHistoryNotes(history), (samplingOutcome = runSampling()));
      !samplingOutcome.ok;

    ) {
      let trimmedHistory: Dynamic = trimHistory(
        countHistoryCharacters(history.turns) - 1,
      );
      if (trimmedHistory.length === 0) break;
      droppedTurns.push(...trimmedHistory);
      samplingOutcome = runSampling();
    }
    droppedTurns.length > 0 &&
      (history.told.push(
        describeAutomaticallyDroppedTurns(droppedTurns),
      ),
      history.trace.blind.push(droppedTurns));
    samplingOutcome.ok ||
      (resetHistoryNotes(history), fail("prompt_too_large"));
    appendHistoryUserTurn(history, historyTurnId, samplingOutcome.kept);
    editContext.session.turn !== null && (editContext.session.turn.open = true);
    request.signal.aborted && fail("cancelled");
    if (
      firstCall &&
      target.retargeted !== true &&
      editContext.target === undefined
    ) {
      let selectedFileKeys: Dynamic = canvas
          .boards()
          .map((selection?: Dynamic): Dynamic => selection.file),
        selectedFile: Dynamic = selectedFastEditFile(editContext.host(), selectedFileKeys);
      if (
        selectedFile !== undefined &&
        selectedFile !== targetFile &&
        handles.has(selectedFile)
      ) {
        cleanup();
        for (let emitter of draftEmitters.values() as Dynamic) emitter.end();
        draftEmitters.clear();
        editContext.session.busy = selectedFile;
        return {
          again: {
            file: selectedFile,
            by: "selected",
            retargeted: true,
          },
        };
      }
    }
    result.calls >= (editContext.maxCalls ?? MAX_FAST_EDIT_CALLS) &&
      fail("call_cap");
    result.calls += 1;
    let streamOffset: Dynamic = -1,
      outputOffset: Dynamic = 0,
      forgetCount: Dynamic = 0,
      handleSequence: Dynamic = nextHandleSequence(
        samplingOutcome.files,
        targetReadResult.prefix,
      ),
      parseReplyChunk: Dynamic = (
        chunkInput?: Dynamic,
        includeFence?: Dynamic,
        parseContext?: Dynamic,
      ): Dynamic =>
        editContext.feedAsWritten === true
          ? chunkInput
          : adoptHandleIds(
              isIncompleteInsertionStatement(
                rewriteContainerAppendStatements(
                  chunkInput,
                  includeFence,
                  parseContext,
                ),
                includeFence,
              ),
              targetReadResult.prefix,
              handleSequence,
              includeFence,
              ownedElementIds,
            );
    callback = (chunkText?: Dynamic): Dynamic => {
      let rest: Dynamic = extractForgetStatements(
          history.said,
          true,
        ).rest,
        splitLines: Dynamic = (textValue?: Dynamic): Dynamic =>
          textValue.split(/[\n\0]/),
        replyLines: Dynamic = splitLines(parseReplyChunk(rest, true, "\0")),
        forgetLines: Dynamic = splitLines(
          editContext.feedAsWritten === true
            ? rest
            : rewriteContainerAppendStatements(rest, true, "\0"),
        ),
        startIndex: Dynamic = -1,
        lineIndex: Dynamic = 0;
      for (let line of items.slice(0, lastVisibleIndex + 1) as Dynamic) {
        let trimmedLine: Dynamic = line
          .split(
            `
`,
            1,
          )[0]
          .trim();
        startIndex = replyLines.findIndex(
          (lineText?: Dynamic, lineNumber?: Dynamic): Dynamic =>
            lineNumber >= lineIndex && lineText.trim() === trimmedLine,
        );
        startIndex >= 0 &&
          (lineIndex =
            startIndex +
            line.split(`
`).length);
      }
      return startIndex < 0
        ? chunkText
        : forgetLines.slice(startIndex, lineIndex).join(`
`);
    };
    let parseStreamText: Dynamic = (
      streamText?: Dynamic,
      saidText?: Dynamic,
    ): Dynamic => {
      let parsedChunk: Dynamic = parseFastEditReplyChunk(
          streamText.slice(Math.max(0, streamOffset)),
          saidText,
        ),
        forgetStatements: Dynamic = extractForgetStatements(
          parsedChunk,
          saidText,
        );
      applyForgetStatements(history, forgetStatements.calls, forgetCount);
      forgetCount = forgetStatements.calls.length;
      Object.assign(history, {
        said: saidText
          ? parsedChunk
          : parsedChunk.slice(
              0,
              parsedChunk.lastIndexOf(`
`) + 1,
            ),
        replied: true,
      });
      return parseReplyChunk(forgetStatements.rest, saidText);
    };
    sandboxFailed && fail("sandbox_failed");
    let engineCall: Dynamic = editContext.engine.call({
      turns: samplingOutcome.turns,
      tier: request.tier,
      images: request.images,
      onText: (textChunk?: Dynamic): Dynamic => {
        if (request.signal.aborted || gateReason !== "" || value !== null)
          return;
        if (sandboxFailed) {
          resolvePreview?.();
          return;
        }
        if (streamOffset < 0) {
          let fenceMatch: Dynamic = /^\s*```[a-z]*[ \t]*\n/i.exec(textChunk);
          if (/^\s*`/.test(textChunk) && fenceMatch === null) return;
          streamOffset =
            fenceMatch !== null
              ? fenceMatch[0].length
              : textChunk.length - textChunk.trimStart().length;
        }
        request.report("writing", {
          chars: textChunk.length,
        });
        if (textChunk.length > MAX_FAST_EDIT_FED_CHARS) {
          flag = true;
          resolvePreview?.();
          return;
        }
        let parsedText: Dynamic = parseStreamText(textChunk, false);
        replyText = parsedText.slice(
          0,
          parsedText.lastIndexOf(`
`) + 1,
        );
        parsedText.length > outputOffset &&
          (emitOutputChunk(parsedText.slice(outputOffset)), (outputOffset = parsedText.length));
        if (sandboxFailed) {
          resolvePreview?.();
          return;
        }
        timeout !== undefined && clearTimeout(timeout);
        timeout = setTimeout((): Dynamic => {
          timeout = undefined;
          !didRefuse &&
            parsedText.endsWith(`
`) &&
            feedSamplingInput((streamWriter?: Dynamic): Dynamic => streamWriter.flush());
        }, 250);
      },
    });
    resolvePreview = (): Dynamic => engineCall.cancel();
    (sandboxFailed || flag || value !== null) && resolvePreview();
    onAbort = (): Dynamic => {
      engineCall.cancel();
      sandbox?.stop();
    };
    request.signal.addEventListener("abort", onAbort, {
      once: true,
    });
    let engineResult: Dynamic = await engineCall.promise;
    request.signal.aborted && fail("cancelled");
    value !== null && fail("ask_claude");
    streamOffset < 0 && (streamOffset = 0);
    let finalReplyText: Dynamic = parseStreamText(engineResult.text, true),
      countReplyLines: Dynamic = (lineText?: Dynamic): Dynamic =>
        lineText
          .split(
            `
`,
          )
          .filter((line?: Dynamic): Dynamic => line.trim() !== "").length;
    result.skipped +=
      countReplyLines(
        stripReplyInlineBackticks(
          stripReplyCodeFences(engineResult.text.slice(streamOffset)),
        ),
      ) - countReplyLines(finalReplyText);
    replyText = finalReplyText;
    finalReplyText.length > outputOffset &&
      (emitOutputChunk(finalReplyText.slice(outputOffset)), (outputOffset = finalReplyText.length));
    feedSamplingInput((streamWriter?: Dynamic): Dynamic => streamWriter.flush());
    didRefuse = true;
    feedSamplingInput((streamWriter?: Dynamic): Dynamic => streamWriter.end());
    let sandboxSucceeded: Dynamic = sandboxFailed
      ? false
      : (await Promise.race([
          withFastEditTimeout(promise, 5e3),
          waitForFastEditAbort(request.signal),
        ])) !== FAST_EDIT_TIMEOUT_SENTINEL;
    request.signal.aborted && fail("cancelled");
    value !== null && fail("ask_claude");
    engineResult.truncated === true && fail("cut_short");
    (sandboxFailed || !sandboxSucceeded) && fail("sandbox_failed");
    let refusal: Dynamic = refusalReason;
    if (refusal !== null) {
      result.refusedAdd && fail("refused_add");
      result.refusedAdd = true;
      let refusalMessage: Dynamic =
          refusal.id === ""
            ? "The id you gave the new screen"
            : "#" + refusal.id,
        refusalReport: Dynamic =
          (refusal.code === "exists"
            ? refusalMessage +
              " is already a screen in this document. To change it, write to it; to add a screen, pick a new id."
            : refusal.code === "removed"
              ? refusalMessage +
                " was removed earlier in the same reply, and an id is not free again within one reply. To move or change a screen, write to it; to replace it, give the new one another id."
              : refusal.code === "own"
                ? refusalMessage +
                  " is one of the page\u2019s own names, as is every id made of {{PREFIX}} and digits. Give the new screen a word for an id, like pricing-2."
                : refusalMessage +
                  " cannot be an id (a letter, then letters, digits, - and _; 24 at most). Pick another id for the new screen.") +
          " Nothing of your last reply was applied: write the whole reply again.";
      cleanup();
      request.report("thinking");
      return {
        again: {
          file: targetFile,
          by: target.by,
          report: refusalReport,
        },
      };
    }
    if (neighborFiles.length > 0 && !result.reads) {
      result.reads = true;
      cleanup();
      request.report("thinking");
      let metadataPattern: Dynamic = new RegExp(
        ' id="' + targetReadResult.prefix + '\\d{1,6}"',
        "g",
      );
      return {
        again: {
          file: targetFile,
          by: target.by,
          logs: neighborFiles.map(
            (textValue?: Dynamic): Dynamic => textValue.replace(metadataPattern, ""),
          ),
          ...(target.report !== undefined
            ? {
                report: target.report,
              }
            : {}),
        },
      };
    }
    frameChars > MAX_FAST_EDIT_FRAME_OUTPUT_CHARS &&
      refuseGate("too_big");
    changedFiles.size > 0 && refuseGate("box_cannot_hold");
    let operationState: Dynamic = {
      asked: targetFile,
      templates: new Map(),
      places: new Map(),
      renames: new Map(),
      adds: [],
      duplicates: [],
      deletes: [],
      pages: new Map(),
    };
    ([...templates].some(
      ([fileKey, htmlValue]: Dynamic): Dynamic =>
        TRUNCATED_DATA_URI_PATTERN.test(htmlValue) &&
        !TRUNCATED_DATA_URI_PATTERN.test(
          originalTemplatesByPath.get(fileKey) ?? "",
        ),
    ) ||
      [
        ...templateEntries.values(),
        ...pendingEntries.values(),
        ...pendingHtml.map(
          (sectionResult?: Dynamic): Dynamic =>
            "html" in sectionResult ? (sectionResult.html ?? "") : "",
        ),
      ].some(
        (dataUri?: Dynamic): Dynamic =>
          TRUNCATED_DATA_URI_PATTERN.test(dataUri),
      )) &&
      refuseGate("data_cut");
    let appliedOperations: Dynamic = [],
      validatedTemplates: Dynamic = new Map();
    for (let [fileKey, templateHtml] of templates as Dynamic) {
      let originalTemplate: Dynamic = originalTemplatesByPath.get(fileKey),
        fileEntry: Dynamic = entries.get(fileKey);
      if (fileEntry === undefined) continue;
      if (originalTemplate === undefined) {
        let parsedSection: Dynamic = parseFastEditArtboardSection(
          templateHtml,
        );
        if (parsedSection === null) return refuseGate("shape");
        (unwrapFastEditSection(templateHtml) ?? "").trim() !== "" &&
          refuseGate("box_cannot_hold");
        let propertyDiffs: Dynamic = diffArtboardProperties(
          fileEntry,
          parsedSection,
        );
        Object.keys(propertyDiffs.place).length > 0 &&
          operationState.places.set(fileKey, propertyDiffs.place);
        propertyDiffs.title !== undefined &&
          operationState.renames.set(fileKey, propertyDiffs.title);
        continue;
      }
      let rehydratedHtml: Dynamic = rehydrateFastEditHtml(
          originalTemplate,
          templateHtml,
          ownedElementIds,
        ),
        parsedTemplate: Dynamic = parseFastEditArtboardSection(
          templateHtml,
          new Set(["background", "color", "font"]),
        );
      if (parsedTemplate === null) return refuseGate("shape");
      let pageStyleChanges: Dynamic = {};
      for (let styleKey of ["background", "color", "font"] as Dynamic) {
        let requestedStyle: Dynamic = parsedTemplate.page?.[styleKey],
          currentStyle: Dynamic = pageStylesByFile.get(fileKey)?.[styleKey];
        requestedStyle !== undefined &&
          requestedStyle.trim() !== (currentStyle ?? "") &&
          (pageStyleChanges[styleKey] = requestedStyle.trim());
      }
      let styleKeys: Dynamic = ["background", "color", "font"],
        normalizePageStyles: Dynamic = (styles?: Dynamic): Dynamic => ({
          ...(styles.font !== undefined && styles.font !== ""
            ? {
                font: styles.font,
              }
            : {}),
          ...validatePageStyles(styles, values),
        }),
        changedStyleKeys: Dynamic = styleKeys.filter(
          (styleKey?: Dynamic): Dynamic => pageStyleChanges[styleKey] !== undefined,
        ),
        requestedStyles: Dynamic =
          editContext.target === undefined ||
          (fileKey === editContext.target && editContext.contextOnly !== true) ||
          fileKey === targetHtmlSnapshot
            ? normalizePageStyles(readPageStylesFromSection(templateHtml))
            : {};
      for (let styleKey of styleKeys as Dynamic)
        pageStyleChanges[styleKey] === undefined &&
          requestedStyles[styleKey] !== undefined &&
          requestedStyles[styleKey] !== (pageStylesByFile.get(fileKey)?.[styleKey] ?? "") &&
          (pageStyleChanges[styleKey] = requestedStyles[styleKey]);
      let validatedStyles: Dynamic = validatePageStyles(pageStyleChanges, values),
        removedStyleKeys: Dynamic = styleKeys.filter(
          (styleKey?: Dynamic): Dynamic =>
            validatedStyles[styleKey] === undefined &&
            normalizePageStyles(pageStyleChanges)[styleKey] !== undefined,
        ),
        styleDeclarations: Dynamic = Object.fromEntries(
          styleKeys
            .filter(
              (styleKey?: Dynamic): Dynamic =>
                pageStyleChanges[styleKey] !== undefined && !removedStyleKeys.includes(styleKey),
            )
            .map((styleKey?: Dynamic): Dynamic => [styleKey, pageStyleChanges[styleKey]]),
        ),
        styleValidation: Dynamic =
          Object.keys(pageStyleChanges).length === 0
            ? {
                ok: false,
                why: "value",
              }
            : updatePageStyleSheet(
                preserveHelmetMarkup(originalTemplate, rehydratedHtml ?? ""),
                styleDeclarations,
                values,
              ),
        readTemplateResult: Dynamic =
          rehydratedHtml === null ||
          !(styleValidation.ok || styleValidation.why === "no_sheet") ||
          Object.keys(normalizePageStyles(pageStyleChanges)).length === 0
            ? {
                text: rehydratedHtml,
                own: [],
              }
            : mapFastEditCssChanges(
                stripHelmetMarkup(originalTemplate),
                rehydratedHtml,
                normalizePageStyles(pageStyleChanges),
                [...(styleValidation.ok ? [] : styleKeys), ...removedStyleKeys],
                {
                  w: parsedTemplate.w ?? fileEntry.w,
                  h: parsedTemplate.h ?? fileEntry.h,
                },
              ),
        normalizedTemplate: Dynamic =
          readTemplateResult.text === null
            ? {
                ok: false,
                code: "not_template",
              }
            : validateFastEditTemplate(
                originalTemplate,
                preserveHelmetMarkup(originalTemplate, readTemplateResult.text),
              ),
        templateChanged: Dynamic = normalizedTemplate.ok && readTemplateResult.text !== rehydratedHtml,
        validatedTemplateResult: Dynamic =
          normalizedTemplate.ok || readTemplateResult.text === rehydratedHtml
            ? normalizedTemplate
            : validateFastEditTemplate(
                originalTemplate,
                preserveHelmetMarkup(originalTemplate, rehydratedHtml),
              ),
        existingTemplateResult: Dynamic = validateFastEditTemplate(
          originalTemplate,
          originalTemplate,
        );
      validatedTemplateResult.ok
        ? (validatedTemplates.set(fileKey, validatedTemplateResult.template),
          existingTemplateResult.ok &&
            validatedTemplateResult.template !== existingTemplateResult.template &&
            operationState.templates.set(fileKey, validatedTemplateResult.template))
        : (appliedOperations.push({
            id: fileIds.idOf.get(fileKey) ?? "",
            code: validatedTemplateResult.code,
          }),
          existingTemplateResult.ok && validatedTemplates.set(fileKey, existingTemplateResult.template));
      let remainingStyleKeys: Dynamic = removedStyleKeys.filter(
          (styleKey?: Dynamic): Dynamic =>
            changedStyleKeys.includes(styleKey) &&
            !(validatedTemplateResult.ok && (readTemplateResult.own.includes(styleKey) || templateChanged)),
        ),
        pageState: Dynamic = {
          ...(styleValidation.ok
            ? styleDeclarations
            : templateChanged
              ? {}
              : Object.fromEntries(
                  changedStyleKeys
                    .filter(
                      (styleKey?: Dynamic): Dynamic => !removedStyleKeys.includes(styleKey),
                    )
                    .map(
                      (styleKey?: Dynamic): Dynamic => [styleKey, pageStyleChanges[styleKey]],
                    ),
                )),
          ...Object.fromEntries(
            remainingStyleKeys.map((styleKey?: Dynamic): Dynamic => [styleKey, pageStyleChanges[styleKey]]),
          ),
        };
      Object.keys(pageState).length > 0 && operationState.pages.set(fileKey, pageState);
      let operationDiff: Dynamic = diffArtboardProperties(
        fileEntry,
        parsedTemplate,
      );
      Object.keys(operationDiff.place).length > 0 &&
        operationState.places.set(fileKey, operationDiff.place);
      operationDiff.title !== undefined &&
        operationState.renames.set(fileKey, operationDiff.title);
      parsedTemplate.del === true &&
        !operationState.deletes.includes(fileKey) &&
        operationState.deletes.push(fileKey);
    }
    for (let pendingOperation of pendingHtml as Dynamic)
      if (pendingOperation.op === "remove") {
        let removedFileKey: Dynamic = fileIds.pathOf.get(pendingOperation.id);
        operationState.deletes.includes(removedFileKey) || operationState.deletes.push(removedFileKey);
      } else if (pendingOperation.op === "duplicate") {
        let duplicatedFileKey: Dynamic = fileIds.pathOf.get(pendingOperation.id),
          duplicatedEntry: Dynamic = entries.get(duplicatedFileKey),
          duplicateSection: Dynamic =
            (pendingOperation.newId !== undefined && pendingEntries.get(pendingOperation.newId)) ||
            pendingOperation.html,
          duplicateProperties: Dynamic =
            duplicateSection === undefined
              ? null
              : parseFastEditArtboardSection(duplicateSection);
        operationState.duplicates.push({
          file: duplicatedFileKey,
          ...(pendingOperation.newId !== undefined
            ? {
                id: pendingOperation.newId,
              }
            : {}),
          ...(duplicateProperties?.title !== undefined && duplicateProperties.title !== duplicatedEntry?.title
            ? {
                title: duplicateProperties.title,
              }
            : {}),
          ...(duplicateProperties?.x !== undefined &&
          duplicateProperties.y !== undefined &&
          (duplicateProperties.x !== duplicatedEntry?.x || duplicateProperties.y !== duplicatedEntry?.y)
            ? {
                x: duplicateProperties.x,
                y: duplicateProperties.y,
              }
            : {}),
        });
      } else if (pendingOperation.op === "add") {
        if (
          pendingOperation.id !== undefined &&
          (createdIds.has(pendingOperation.id) ||
            pendingOperation.id === OPEN_ARTBOARD_PLACEHOLDER_ID)
        )
          continue;
        let normalizedBody: Dynamic =
            pendingOperation.id !== undefined
              ? (templateEntries.get(pendingOperation.id) ?? pendingOperation.html)
              : pendingOperation.html,
          rehydratedBody: Dynamic = rehydrateFastEditHtml(
            "",
            normalizedBody,
            ownedElementIds,
          ),
          parsedBody: Dynamic = parseFastEditArtboardSection(
            normalizedBody,
          );
        if (parsedBody === null) return refuseGate("shape");
        let validatedBody: Dynamic =
          rehydratedBody === null
            ? {
                ok: false,
                code: "not_template",
              }
            : validateFastEditTemplate("", rehydratedBody);
        if (!validatedBody.ok)
          appliedOperations.push({
            id: "",
            code: validatedBody.code,
          });
        else {
          let validatedPageStyles: Dynamic = validatePageStyles(
              {
                ...readPageStylesFromSection(normalizedBody),
                ...parsedBody.page,
              },
              values,
            ),
            pageStyleRule: Dynamic = serializePageStyleDeclarations({
              ...validatedPageStyles,
              ...(validatedPageStyles.font !== undefined
                ? {
                    families: validatePageFontFamilies(
                      validatedPageStyles.font,
                      values,
                    ),
                  }
                : {}),
            });
          operationState.adds.push({
            body: validatedBody.template,
            title: parsedBody.title ?? "",
            w: parsedBody.w ?? 480,
            h: parsedBody.h ?? 560,
            ...(parsedBody.x !== undefined && parsedBody.y !== undefined
              ? {
                  x: parsedBody.x,
                  y: parsedBody.y,
                }
              : {}),
            ...(pendingOperation.id !== undefined
              ? {
                  id: pendingOperation.id,
                }
              : {}),
            ...(pageStyleRule !== ""
              ? {
                  pageRule: pageStyleRule,
                }
              : {}),
          });
        }
      }
    let writtenFileKeys: Dynamic = new Set([
      ...operationState.templates.keys(),
      ...operationState.places.keys(),
      ...operationState.renames.keys(),
      ...operationState.pages.keys(),
      ...appliedOperations
        .map((operation?: Dynamic): Dynamic => fileIds.pathOf.get(operation.id) ?? "")
        .filter((fileKey?: Dynamic): Dynamic => fileKey !== ""),
    ]);
    operationState.deletes = operationState.deletes.filter(
      (fileKey?: Dynamic): Dynamic => !writtenFileKeys.has(fileKey),
    );
    let newArtboardLimitError: Dynamic = checkFastEditNewArtboardLimit(operationState);
    newArtboardLimitError !== null && refuseGate(newArtboardLimitError);
    if (selectedRectangle !== undefined && operationState.adds.length > 0) {
      let firstAddedBoard: Dynamic = operationState.adds[0],
        sameRectangle: Dynamic = isSameRectangle(firstAddedBoard.w, firstAddedBoard.h),
        xOffset: Dynamic = sameRectangle.x - (firstAddedBoard.x ?? sameRectangle.x),
        yOffset: Dynamic = sameRectangle.y - (firstAddedBoard.y ?? sameRectangle.y);
      for (let addedBoard of operationState.adds as Dynamic)
        addedBoard === firstAddedBoard
          ? Object.assign(addedBoard, sameRectangle)
          : addedBoard.x !== undefined &&
            addedBoard.y !== undefined &&
            Object.assign(addedBoard, {
              x: addedBoard.x + xOffset,
              y: addedBoard.y + yOffset,
            });
    }
    let preparedChanges: Dynamic = prepareFastEditArtboardChanges(
      operationState,
      canvas.boards(),
      targetFile,
      entries,
      selectedRectangle !== undefined,
      targetRectangle,
    );
    for (let [fileKey, pageStyles] of operationState.pages as Dynamic) {
      let updatedTemplate: Dynamic = updatePageStyleSheet(
        operationState.templates.get(fileKey) ?? validatedTemplates.get(fileKey) ?? "",
        pageStyles,
        values,
      );
      updatedTemplate.ok
        ? operationState.templates.set(fileKey, updatedTemplate.template)
        : appliedOperations.push({
            id: fileIds.idOf.get(fileKey) ?? "",
            code: "page_style",
          });
    }
    editContext.allOrNothing === true &&
      appliedOperations.length > 0 &&
      refuseGate(appliedOperations[0].code);
    editContext.target !== undefined &&
      [...operationState.templates.keys(), ...operationState.pages.keys()].some(
        (fileKey?: Dynamic): Dynamic =>
          (fileKey !== editContext.target || editContext.contextOnly === true) &&
          fileKey !== targetHtmlSnapshot,
      ) &&
      refuseGate("beyond_target");
    editContext.allOrNothing === true && failureCount > 0 && refuseGate("thrown");
    let hasRefusal: Dynamic =
      operationState.templates.size +
        operationState.places.size +
        operationState.renames.size +
        operationState.adds.length +
        operationState.duplicates.length +
        operationState.deletes.length ===
      0;
    lastError !== null &&
      (editContext.allOrNothing === true || hasRefusal) &&
      refuseGate("line_no_match");
    hasRefusal && appliedOperations.length > 0 && refuseGate(appliedOperations[0].code);
    hasRefusal &&
      neighborFiles.length > 0 &&
      target.logs !== undefined &&
      fail("read_twice");
    if (hasRefusal)
      throw {
        code:
          engineResult.text.trim() !== "" &&
          pendingHtml.length === 0 &&
          templates.size === 0 &&
          attemptIndex === 0
            ? "words_only"
            : attemptIndex > 0 && noOpCount === 0
              ? successCount > 0
                ? "already_so"
                : "no_match"
              : attemptIndex === 0
                ? "not_run"
                : "no_change",
      };
    for (let [fileKey, templateHtml] of operationState.templates as Dynamic) {
      let replacementValidation: Dynamic = validateArtboardTemplateReplacement(
        editContext.host().fileText(fileKey) ?? "",
        templateHtml,
      );
      if (!replacementValidation.ok) return refuseGate(replacementValidation.code);
      fileKey !== targetFile &&
        (await verifySandboxTemplateRoundTrip(
          editContext.sandbox,
          stripHelmetMarkup(originalTemplatesByPath.get(fileKey)),
        )) !== "held" &&
        refuseGate("box_cannot_hold");
      countEmptySvgDrawings(templateHtml) >
        countEmptySvgDrawings(
          originalTemplatesByPath.get(fileKey) ?? "",
        ) && refuseGate("empty_drawing");
    }
    operationState.adds.some(
      (operation?: Dynamic): Dynamic =>
        countEmptySvgDrawings(operation.body) > 0,
    ) && refuseGate("empty_drawing");
    let roundResults: Dynamic = await Promise.all(
      [
        ...[...operationState.templates.values()].map(stripHelmetMarkup),
        ...operationState.adds.map(
          (operation?: Dynamic): Dynamic =>
            stripHelmetMarkup(operation.body),
        ),
      ].map(
        (operation?: Dynamic): Dynamic =>
          verifySandboxTemplateRoundTrip(editContext.sandbox, operation),
      ),
    );
    roundResults.includes("reshaped") && refuseGate("reshaped");
    roundResults.includes("late") && fail("sandbox_failed");
    request.signal.aborted && fail("cancelled");
    editContext.host().readOnly && fail("read_only");
    unsubscribe = await canvas.hold();
    let sandboxResults: Dynamic = await Promise.all(
      [...operationState.templates.keys()].map(
        async (fileKey?: Dynamic): Promise<Dynamic> => [
          fileKey,
          await handles
            .get(fileKey)
            ?.askTemplate()
            .catch((): Dynamic => null),
        ],
      ),
    );
    request.signal.aborted && fail("cancelled");
    let committedFileKeys: Dynamic = sandboxResults
      .filter(
        ([fileKey, boardEntry]: Dynamic): Dynamic =>
          boardEntry !== originalTemplatesByPath.get(fileKey) || editContext.holds(fileKey),
      )
      .map(([fileKey]: Dynamic): Dynamic => fileKey);
    if (committedFileKeys.length > 0) {
      errors.push(
        ...committedFileKeys.map(
          (fileKey?: Dynamic): Dynamic => fileIds.idOf.get(fileKey) ?? "",
        ),
      );
      for (let fileKey of operationState.templates.keys() as Dynamic)
        allowedFiles.add(fileKey);
      throw {
        code: "conflict",
      };
    }
    let operationFailed: Dynamic = !result.applied,
      viewPromises: Dynamic = [];
    for (let fileKey of operationState.templates.keys() as Dynamic)
      operationFailed &&
        fileSnapshots.has(fileKey) &&
        feedSamplingInput((sandboxView?: Dynamic): Dynamic => {
          viewPromises.push(
            sandboxView.view(fileIds.idOf.get(fileKey)).then(
              (viewResult?: Dynamic): Dynamic => {
                viewResult !== null &&
                  typeof viewResult.html == "string" &&
                  pendingHtmlByFile.set(fileKey, viewResult.html);
              },
              (): Dynamic => {},
            ),
          );
        });
    let commitPromise: Dynamic = withFastEditTimeout(
      Promise.all(viewPromises),
      editContext.viewAfterMs ?? FAST_EDIT_INITIAL_DELAY_MS,
    );
    cancelled = true;
    let seenEvents: Dynamic = new Set(),
      receivedEvent: Dynamic = false,
      stopEventListener: Dynamic = (): Dynamic => {},
      initialFileTexts: Dynamic = new Map(
        [...operationState.templates.keys()].map(
          (fileKey?: Dynamic): Dynamic => [
            fileKey,
            editContext.host().fileText(fileKey),
          ],
        ),
      ),
      seenFileEvents: Dynamic = new Set(),
      unsubscribeEvents: Dynamic = editContext.onDocEvent?.((event?: Dynamic): Dynamic => {
        if (event.type === "event") return;
        let eventPaths: Dynamic = event.paths.map(
          (path?: Dynamic): Dynamic => path.replace(/^project\//, ""),
        );
        if (event.type === "started") {
          for (let path of eventPaths as Dynamic)
            (path === "canvas.json" ||
              editContext.host().fileText(path) !== initialFileTexts.get(path)) &&
              seenFileEvents.add(String(event.n) + " " + path);
          return;
        }
        if (event.type === "landed")
          for (let path of eventPaths as Dynamic)
            seenFileEvents.has(String(event.n) + " " + path) &&
              seenEvents.add(path);
        else if (event.code === "conflict") receivedEvent = true;
        else return;
        stopEventListener();
      }),
      initialDepth: Dynamic = canvas.depth(),
      commitResult: Dynamic = await commitFastEditArtboardChanges(
        operationState,
        canvas,
        handles,
        entries,
        preparedChanges,
        request.signal,
        originalTemplatesByPath,
      );
    unsubscribe();
    for (let staleFileKey of commitResult.stale as Dynamic)
      appliedOperations.push({
        id: fileIds.idOf.get(staleFileKey) ?? "",
        code: "changed",
      });
    if (commitResult.nothingLanded && commitResult.stale.length > 0) {
      unsubscribeEvents?.();
      errors.push(
        ...commitResult.stale.map(
          (fileKey?: Dynamic): Dynamic => fileIds.idOf.get(fileKey) ?? "",
        ),
      );
      for (let fileKey of operationState.templates.keys() as Dynamic)
        allowedFiles.add(fileKey);
      throw (
        (cancelled = false),
        {
          code: "conflict",
        }
      );
    }
    commitResult.nothingLanded && (unsubscribeEvents?.(), fail("not_saved"));
    result.applied = true;
    let savePromise: Dynamic = withFastEditTimeout(
      Promise.all(
        commitResult.landed.map(
          (fileKey?: Dynamic): Dynamic =>
            handles
              .get(fileKey)
              ?.flushPending()
              .catch((): Dynamic => {}),
        ),
      ),
      FAST_EDIT_SANDBOX_START_TIMEOUT_MS,
    ).then((): Dynamic => {
      try {
        editContext.host().saveNow();
      } catch {}
    });
    index = commitResult.records;
    let targetDepth: Dynamic = initialDepth + commitResult.pushes;
    for (
      let depthStep: Dynamic = 0;
      depthStep < 40 && canvas.depth() < targetDepth;
      depthStep++
    )
      await sleep(40);
    partialMark = canvas.depth() === targetDepth ? canvas.mark() : null;
    wholeReply =
      commitResult.stale.length === 0 &&
      commitResult.landed.length === operationState.templates.size &&
      commitResult.added.length === operationState.adds.length &&
      commitResult.copied.length === operationState.duplicates.length &&
      commitResult.removed.length === operationState.deletes.length &&
      !request.signal.aborted;
    for (let fileKey of [
      ...commitResult.landed,
      ...commitResult.moved,
      ...commitResult.renamed,
    ] as Dynamic)
      result.changed.add(fileKey);
    for (let fileKey of [...commitResult.added, ...commitResult.copied] as Dynamic)
      result.added.add(fileKey);
    for (let fileKey of commitResult.removed as Dynamic)
      result.removed.add(fileKey);
    setTimeout((): Dynamic => draftHtmlPreviewStore.clear(), 350);
    if (editContext.session.turn !== null) {
      let turn: Dynamic = editContext.session.turn,
        turnFiles: Dynamic = (turn.also ??= []),
        canvasBoards: Dynamic = canvas.boards(),
        idOf: Dynamic = createFastEditFileIds(
          canvasBoards
            .map((board?: Dynamic): Dynamic => board.file)
            .slice(0, MAX_FAST_EDIT_FILES),
        ).idOf,
        readBoard: Dynamic = async (fileKey?: Dynamic): Promise<Dynamic> => {
          let boardReadResult: Dynamic = await withFastEditTimeout(
              handles
                .get(fileKey)
                ?.askTemplate()
                .catch((): Dynamic => null) ?? Promise.resolve(null),
              2500,
            ),
            board: Dynamic = canvasBoards.find(
              (candidateBoard?: Dynamic): Dynamic => candidateBoard.file === fileKey,
            ),
            boardId: Dynamic = idOf.get(fileKey);
          return typeof boardReadResult == "string" &&
            board !== undefined &&
            boardId !== undefined
            ? serializePromptArtboardWithPageStyle(
                boardId,
                board,
                boardReadResult,
                values,
              )
            : undefined;
        };
      for (let fileKey of new Set([
        ...(isCanvasTarget ? [] : [targetFile]),
        ...commitResult.landed,
        ...commitResult.moved,
        ...commitResult.renamed,
      ]) as Dynamic) {
        let turnState: Dynamic =
          fileKey === turn.file
            ? turn
            : turnFiles.find(
                (turnFile?: Dynamic): Dynamic => turnFile.file === fileKey,
              );
        turnState === undefined &&
          turnFiles.push(
            (turnState = {
              file: fileKey,
              before: originalTemplatesByPath.has(fileKey) ? getPromptTemplate(fileKey) : "",
            }),
          );
        let seenBoard: Dynamic = await readBoard(fileKey);
        seenBoard !== undefined &&
          ((turnState.after = seenBoard),
          delete turnState.ids,
          editContext.comment === undefined &&
            editContext.session.seen.set(fileKey, seenBoard));
      }
      for (let fileKey of [...commitResult.added, ...commitResult.copied] as Dynamic) {
        let addedBoard: Dynamic = await readBoard(fileKey);
        turnFiles.push({
          file: fileKey,
          how: "new",
          ...(addedBoard !== undefined
            ? {
                after: addedBoard,
              }
            : {}),
        });
      }
      for (let fileKey of commitResult.removed as Dynamic)
        turnFiles.push({
          file: fileKey,
          how: "removed",
        });
    }
    editContext.session.lastTouched =
      commitResult.added[commitResult.added.length - 1] ??
      commitResult.copied[commitResult.copied.length - 1] ??
      [...operationState.templates.keys()][0] ??
      [...operationState.places.keys()][0] ??
      [...operationState.renames.keys()][0] ??
      targetFile;
    let revealedFile: Dynamic =
      commitResult.added[0] ?? commitResult.copied[0] ?? commitResult.moved[0];
    if (revealedFile !== undefined && !editContext.pointerDown())
      try {
        canvas.reveal(revealedFile);
      } catch {}
    if (
      (appliedOperations.length > 0 || failureCount > 0 || lastError !== null) &&
      editContext.allOrNothing !== true &&
      !result.partly &&
      !request.signal.aborted &&
      canvas
        .boards()
        .some((operation?: Dynamic): Dynamic => operation.file === targetFile)
    ) {
      result.partly = true;
      let failureMessages: Dynamic = [
          ...new Set(
            [
              ...commitResult.landed,
              ...operationState.places.keys(),
              ...operationState.renames.keys(),
            ]
              .map(
                (fileKey?: Dynamic): Dynamic => fileIds.idOf.get(fileKey) ?? "",
              )
              .concat(
                commitResult.added.map(
                  (fileKey?: Dynamic): Dynamic =>
                    fileKey.replace(/\.dc\.html$/, ""),
                ),
              ),
          ),
        ]
          .filter((message?: Dynamic): Dynamic => message !== "")
          .slice(0, 12),
        failureReport: Dynamic =
          "PART of your last reply is in" +
          (failureMessages.length > 0
            ? ": " +
              failureMessages
                .map((fileKey?: Dynamic): Dynamic => "#" + fileKey)
                .join(", ")
            : "") +
          ". NOT in: " +
          [
            ...appliedOperations
              .slice(0, 4)
              .map(
                (failedOperation?: Dynamic): Dynamic =>
                  (failedOperation.id !== "" ? "#" + failedOperation.id : "a new artboard") +
                  " (" +
                  failedOperation.code +
                  "): " +
                  (FAST_EDIT_REPAIR_MESSAGES[failedOperation.code] ??
                    FAST_EDIT_MARKUP_REPAIR_INSTRUCTIONS),
              ),
            ...(failureCount > 0
              ? [
                  String(failureCount) +
                    (failureCount === 1 ? " line" : " lines") +
                    " threw: " +
                    FAST_EDIT_REPAIR_MESSAGES.thrown,
                ]
              : []),
            ...(lastError !== null
              ? [FAST_EDIT_REPAIR_MESSAGES.line_no_match]
              : []),
          ].join(" ") +
          " The canvas below is as it is NOW: do only what is still missing, another way; do not repeat what is in.";
      cleanup();
      request.report("thinking");
      return {
        again: {
          file: targetFile,
          by: target.by,
          report: failureReport,
          ...(lastError !== null
            ? {
                line: callback(lastError),
              }
            : {}),
        },
      };
    }
    let failureCode: Dynamic = "";
    if (unsubscribeEvents !== undefined) {
      let landedFiles: Dynamic = commitResult.landed.filter(
        (fileKey?: Dynamic): Dynamic => !operationState.deletes.includes(fileKey),
      );
      editContext.comment !== undefined && landedFiles.push(...commitResult.added);
      commitResult.canvasOps > 0 && landedFiles.push("canvas.json");
      let getSaveError: Dynamic = (): Dynamic =>
        receivedEvent
          ? "save_clash"
          : landedFiles.every((fileKey?: Dynamic): Dynamic => seenEvents.has(fileKey))
            ? ""
            : null;
      await Promise.race([
        savePromise,
        new Promise((resolveSave?: Dynamic): Dynamic => {
          stopEventListener = resolveSave;
        }),
      ]);
      failureCode =
        getSaveError() ??
        (await new Promise((resolveResult?: Dynamic): Dynamic => {
          stopEventListener = (): Dynamic => {
            let saveError: Dynamic = getSaveError();
            saveError !== null && resolveResult(saveError);
          };
          sleep(FAST_EDIT_ROUNDTRIP_TIMEOUT_MS).then(
            (): Dynamic => resolveResult("save_unknown"),
          );
        }));
      unsubscribeEvents();
    }
    await commitPromise;
    let extractIds: Dynamic = (html?: Dynamic): Dynamic =>
        Array.from(
          html.matchAll(/\sid="([^"]*)"/g),
          (match?: Dynamic): Dynamic => match[1],
        ),
      generatedIdPattern: Dynamic = new RegExp("^" + targetReadResult.prefix + "\\d{1,6}$"),
      existingHtmlIds: Dynamic = new Set([...fileSnapshots.values()].flatMap(extractIds)),
      pendingHtmlIds: Dynamic = new Set(
        history.said.match(
          new RegExp("\\b" + targetReadResult.prefix + "\\d{1,6}\\b", "g"),
        ) ?? [],
      );
    for (let [fileKey, html] of [...pendingHtmlByFile] as Dynamic) {
      let htmlIds: Dynamic = new Set(extractIds(html));
      [...htmlIds].some(
        (id?: Dynamic): Dynamic =>
          !existingHtmlIds.has(id) && (!generatedIdPattern.test(id) || pendingHtmlIds.has(id)),
      ) &&
        extractIds(fileSnapshots.get(fileKey) ?? "").some(
          (id?: Dynamic): Dynamic => !htmlIds.has(id),
        ) &&
        pendingHtmlByFile.delete(fileKey);
    }
    let actedFiles: Dynamic = [
      ...(targetPageEntry !== null ? [targetPageEntry.id] : []),
      ...visibleHandles.map((handle?: Dynamic): Dynamic => handle.id),
      ...Array.from(
        history.said.matchAll(
          new RegExp("#(" + targetReadResult.prefix + "\\d{1,6})(?![\\w-])", "g"),
        ),
        (pair?: Dynamic): Dynamic => pair[1],
      ),
    ];
    for (let turnFile of (editContext.session.turn === null
      ? []
      : [
          editContext.session.turn,
          ...(editContext.session.turn.also ?? []),
        ]) as Dynamic) {
      let beforeHtml: Dynamic = fileSnapshots.get(turnFile.file),
        afterHtml: Dynamic = pendingHtmlByFile.get(turnFile.file);
      beforeHtml !== undefined &&
        afterHtml !== undefined &&
        turnFile.after !== undefined &&
        (turnFile.ids = {
          before: beforeHtml,
          after: afterHtml,
          prefix: targetReadResult.prefix,
          acted: actedFiles,
        });
    }
    cleanup();
    let finishResult: Dynamic =
      failureCode !== ""
        ? finish("failed", failureCode, FAST_EDIT_ERROR_MESSAGES[failureCode])
        : appliedOperations.length > 0 || failureCount > 0 || lastError !== null
          ? finish(
              "saved",
              "partly_kept",
              FAST_EDIT_ERROR_MESSAGES.partly_kept,
            )
          : finish("saved");
    "done" in finishResult &&
      ((finishResult.done.changed = [...result.changed, ...result.added].map(
        (fileKey?: Dynamic): Dynamic =>
          fileIds.idOf.get(fileKey) ?? fileKey.replace(/\.dc\.html$/, ""),
      )),
      (finishResult.done.steps = index),
      (finishResult.done.mark = partialMark),
      (finishResult.done.whole = wholeReply && finishResult.done.code === ""),
      (failureCode === "save_clash" || failureCode === "save_unknown") &&
        (finishResult.done.unsaved = failureCode),
      finishResult.done.outcome === "saved" &&
        [
          ...(targetIsListed ? [targetPageEntry] : []),
          ...visibleHandles.filter((handle?: Dynamic): Dynamic => handle.inList),
        ].some(
          (handle?: Dynamic): Dynamic =>
            readTemplateLoopHtml(targetTemplate, handle.list) !==
            readTemplateLoopHtml(
              operationState.templates.get(targetFile) ?? targetTemplate,
              handle.list,
            ),
        ) &&
        (finishResult.done.inList = true));
    if (
      "done" in finishResult &&
      finishResult.done.whole === true &&
      operationFailed &&
      !request.signal.aborted
    ) {
      let handleLocations: Dynamic = new Map(),
        handleFiles: Dynamic = new Map(),
        handleStates: Dynamic = new Map(),
        hasHandleState: Dynamic =
          operationState.adds.length === 0 &&
          operationState.duplicates.length === 0 &&
          [...operationState.templates.keys()].every(
            (fileKey?: Dynamic): Dynamic => fileSnapshots.has(fileKey),
          );
      for (let [fileKey, snapshotHtml] of fileSnapshots as Dynamic) {
        let seenState: Dynamic = [
            editContext.session.turn,
            ...(editContext.session.turn?.also ?? []),
          ].find((turn?: Dynamic): Dynamic => turn?.file === fileKey),
          pendingFileHtml: Dynamic = pendingHtmlByFile.get(fileKey),
          hasTemplateUpdate: Dynamic = operationState.templates.has(fileKey),
          templateShape: Dynamic = describeTemplateShape(hasTemplateUpdate ? (pendingFileHtml ?? "") : snapshotHtml);
        if (
          hasTemplateUpdate &&
          (pendingFileHtml === undefined ||
            seenState?.after === undefined ||
            templateShape.shape !== describeTemplateShape(seenState.after).shape)
        ) {
          hasHandleState = false;
          continue;
        }
        templateShape.ids.forEach(
          (handleId?: Dynamic, handleIndex?: Dynamic): Dynamic =>
            handleLocations.set(handleId, {
              file: fileKey,
              at: handleIndex,
            }),
        );
        if (hasTemplateUpdate)
          for (let handleId of describeTemplateShape(snapshotHtml).ids as Dynamic)
            handleFiles.set(handleId, fileKey);
        handleStates.set(fileKey, {
          text: hasTemplateUpdate ? seenState.after : getPromptTemplate(fileKey),
          shape: templateShape.shape,
        });
      }
      editContext.session.named = {
        at: [...new Set(actedFiles)].flatMap((handleId?: Dynamic): Dynamic => {
          let handleLocation: Dynamic =
            handleLocations.get(handleId) ??
            (hasHandleState && handleFiles.has(handleId)
              ? {
                  file: handleFiles.get(handleId),
                  at: -1,
                }
              : undefined);
          return handleLocation === undefined
            ? []
            : [
                {
                  was: handleId,
                  ...handleLocation,
                },
              ];
        }),
        states: handleStates,
      };
    }
    return finishResult;
  } catch (thrownError: Dynamic) {
    cleanup();
    let normalizedError: Dynamic = normalizeFastEditThrownError(thrownError),
      aborted: Dynamic = request.signal.aborted;
    if (value !== null && !aborted)
      return {
        done: {
          outcome: "failed",
          code: "ask_claude",
          message: FAST_EDIT_ERROR_MESSAGES.ask_claude,
          calls: result.calls,
          made: summarizeFastEditAppliedChanges(result),
          forClaude: value,
        },
      };
    if (normalizedError.code === "conflict" && !aborted) {
      result.conflicts += 1;
      if (result.conflicts > 1)
        return finish(
          result.applied ? "saved" : "failed",
          "conflict_again",
          FAST_EDIT_ERROR_MESSAGES.conflict_again,
        );
      request.report("thinking");
      let pollDelay: Dynamic = 250 + Math.floor(Math.random() * 900),
        errorCode: Dynamic = "",
        pollElapsed: Dynamic = 0,
        stablePolls: Dynamic = 0;
      for (
        ;
        pollElapsed < 6e3 &&
        (pollElapsed < pollDelay ||
          stablePolls < 900 ||
          [...allowedFiles].some(
            (fileKey?: Dynamic): Dynamic => editContext.holds(fileKey),
          )) &&
        !request.signal.aborted;

      ) {
        await sleep(100);
        pollElapsed += 100;
        stablePolls += 100;
        let latestError: Dynamic = (
          await Promise.all(
            [...allowedFiles].map(
              (fileKey?: Dynamic): Dynamic =>
                handles
                  .get(fileKey)
                  ?.askTemplate()
                  .catch((): Dynamic => null) ?? null,
            ),
          )
        ).join("\0");
        latestError !== errorCode && ((errorCode = latestError), (stablePolls = 0));
      }
      if (request.signal.aborted) return finish("stopped", "cancelled");
      let uniqueErrors: Dynamic = [...new Set(errors)].filter(
          (error?: Dynamic): Dynamic => error !== "",
        ),
        errorMessage: Dynamic =
          "While you were writing, " +
          (uniqueErrors.length > 0
            ? "artboard " +
              uniqueErrors
                .map((error?: Dynamic): Dynamic => '"' + error + '"')
                .join(", ")
            : "an artboard") +
          " was changed by someone else. Nothing of your reply was taken. The canvas below is as it is NOW: answer the request again for it, changing only what is still needed.";
      return {
        again: {
          file: targetFile,
          by: target.by,
          report: errorMessage,
        },
      };
    }
    let hasGateReason: Dynamic = gateReason !== "" && !aborted;
    if (
      hasGateReason ||
      (FAST_EDIT_NOOP_CODES.has(normalizedError.code) && !aborted)
    ) {
      if (result.applied)
        return finish(
          "saved",
          "partly_kept",
          FAST_EDIT_ERROR_MESSAGES.partly_kept,
        );
      let finalGateReason: Dynamic = hasGateReason
          ? gateReason.startsWith("cap_") ||
            gateReason === "thrown" ||
            gateReason === "line_no_match" ||
            gateReason === "empty_drawing" ||
            gateReason === "beyond_target"
            ? gateReason
            : "gate_" + gateReason
          : normalizedError.code === "no_match" || normalizedError.code === "already_so"
            ? normalizedError.code
            : "no_change",
        nothing: Dynamic = FAST_EDIT_ERROR_MESSAGES.nothing,
        refusalText: Dynamic = replyText
          .split(
            `
`,
          )
          .map(
            (line?: Dynamic): Dynamic => line.replace(/\s+/g, " ").trim(),
          )
          .filter((line?: Dynamic): Dynamic => line !== ""),
        refused: Dynamic = result.refused;
      result.refused = refusalText;
      if (
        editContext.comment !== undefined &&
        refused !== null &&
        refused.length > 0 &&
        refusalText.length > 0 &&
        refused
          .slice(0, refusalText.length)
          .every(
            (line?: Dynamic, lineIndex?: Dynamic): Dynamic =>
              line === refusalText[lineIndex],
          )
      )
        return finish("failed", finalGateReason, nothing);
      if (
        result.fixes.length < MAX_FAST_EDIT_READ_ROUNDS &&
        !(
          (finalGateReason === "no_change" || finalGateReason === "beyond_target") &&
          result.fixes.includes(finalGateReason)
        )
      ) {
        result.fixes.push(finalGateReason);
        request.report("thinking");
        let finalReport: Dynamic =
          finalGateReason === "already_so"
            ? FAST_EDIT_REPAIR_MESSAGES.already_so
            : describeFastEditRefusal(
                finalGateReason,
                hasGateReason ? gateReason : finalGateReason,
              );
        return {
          again: {
            file: targetFile,
            by: target.by,
            report: finalReport,
            ...(gateReason === "line_no_match" && lastError !== null
              ? {
                  line: callback(lastError),
                }
              : {}),
          },
        };
      }
      return finish("failed", finalGateReason, nothing);
    }
    if (!flag && (aborted || (normalizedError.code === "cancelled" && !sandboxFailed)))
      return finish("stopped", "cancelled");
    let finalStatus: Dynamic = flag
      ? "too_long"
      : sandboxFailed && normalizedError.code === "cancelled"
        ? "sandbox_failed"
        : normalizedError.code;
    if (finalStatus === "call_cap" && result.applied)
      return finish(
        "saved",
        "call_cap",
        FAST_EDIT_ERROR_MESSAGES.call_cap,
      );
    let finalMessage: Dynamic =
      FAST_EDIT_ERROR_MESSAGES[
        !firstCall &&
        (finalStatus === "no_box" ||
          finalStatus === "slow_start" ||
          finalStatus === "start_stuck")
          ? "sandbox_failed"
          : finalStatus
      ] ??
      (FAST_EDIT_CAPABILITY_DENIED_CODES.has(finalStatus)
        ? FAST_EDIT_CAPABILITY_UNAVAILABLE_MESSAGE
        : FAST_EDIT_ERROR_MESSAGES.upstream_error);
    return finish(
      "failed",
      finalStatus,
      result.applied
        ? finalMessage.replace("Nothing changed.", "Changes already made are kept.")
        : finalMessage,
    );
  }
}
export {
  applyFastEditRequest,
  BARE_FAST_EDIT_SELECTOR_PATTERN,
  captureFastEditCanvasState,
  extractFastEditReplyStatements,
  FAST_EDIT_REPLY_PREFIX_PATTERN,
  JS_IDENTIFIER_PATTERN,
  parseFastEditReplyChunk,
  resolveFastEditFileTarget,
  runFastEditSamplingRound,
  selectedFastEditFile,
  serializePromptArtboardWithPageStyle,
  stripReplyCodeFences,
  stripReplyInlineBackticks,
  summarizeFastEditAppliedChanges,
  updateFastEditHistoryFromCanvas,
};
export function installFastEditRequest(): () => void {
  return () => {
    selectedFastEditFile = (selectionInput?: Dynamic, selectedFiles?: Dynamic): Dynamic =>
      [
        ...(selectionInput.selectedElements ?? []).map(
          (selectedFile?: Dynamic): Dynamic => selectedFile.file,
        ),
        ...selectionInput.selected,
      ].find((fileKey?: Dynamic): Dynamic => selectedFiles.includes(fileKey));
    summarizeFastEditAppliedChanges = (summary?: Dynamic): Dynamic => ({
      changed: [...summary.changed].filter(
        (fileKey?: Dynamic): Dynamic =>
          !summary.added.has(fileKey) && !summary.removed.has(fileKey),
      ).length,
      added: [...summary.added].filter(
        (fileKey?: Dynamic): Dynamic => !summary.removed.has(fileKey),
      ).length,
      removed: [...summary.removed].filter(
        (fileKey?: Dynamic): Dynamic => !summary.added.has(fileKey),
      ).length,
    });
    serializePromptArtboardWithPageStyle = (
      html?: Dynamic,
      fallbackHtml?: Dynamic,
      documentContext?: Dynamic,
      styleValue?: Dynamic,
    ): Dynamic =>
      serializeFastEditArtboard(
        html,
        fallbackHtml,
        hasPageStylesheet(documentContext)
          ? serializePageStyleAttributes(
              readPageStylesFromSheet(documentContext, styleValue),
            )
          : "",
      ) +
      encodeCamelCaseAttributes(
        stripHelmetMarkup(documentContext),
      ) +
      "</section>";
    stripReplyCodeFences = (text?: Dynamic): Dynamic =>
      text.replace(/^[ \t]*```[a-z]*[ \t]*(?:\n|$)/gim, "");
    stripReplyInlineBackticks = (text?: Dynamic): Dynamic =>
      text.replace(
        /^`((?:\$\(|\.|askClaude\(|read\(|log\().*)`[ \t]*$/gm,
        "$1",
      );
    JS_IDENTIFIER_PATTERN = "[A-Za-z_$][\\w$]*";
    FAST_EDIT_REPLY_PREFIX_PATTERN = new RegExp(
      "^\\s*(?:" +
        [
          "[$(\\[{)\\]}'\"`;]",
          "\\.[A-Za-z_$]",
          "//",
          "/\\*",
          "![$(!\\w]",
          "(?:\\+\\+|--)[$(\\w]",
          JS_IDENTIFIER_PATTERN +
            "\\s*(?:\\??\\.[A-Za-z_$]|[(\\[]|[-+*/%&|^]?=|\\+\\+|--)",
          "(?:var|let|const)\\s+" + JS_IDENTIFIER_PATTERN + "\\s*[=,;]",
          "(?:var|let|const)\\s*[\\[{]",
          "return[\\s;]",
          "function(?:\\s*\\*\\s*|\\s+)" + JS_IDENTIFIER_PATTERN + "\\s*\\(",
          "new\\s+" +
            JS_IDENTIFIER_PATTERN +
            "(?:\\." +
            JS_IDENTIFIER_PATTERN +
            ")*\\s*\\(",
          "(?:do|try|else|finally)\\s*\\{",
          "else\\s+if\\s*\\(",
          "throw\\s+(?:new\\s|[$('\"`])",
          "(?:typeof|void|delete|await)\\s+(?:[$(\\['\"`]|" +
            JS_IDENTIFIER_PATTERN +
            "\\s*[.(\\[])",
          "async\\s+function[\\s(*]",
          "class\\s+" + JS_IDENTIFIER_PATTERN + "\\s*(?:\\{|extends\\s)",
        ].join("|") +
        ")",
    );
    BARE_FAST_EDIT_SELECTOR_PATTERN =
      /^[ \t]*(?!(?:askClaude|read|log|forget|jQuery|if|for|while|switch|catch|with|function|return|typeof|void|delete|await|new|throw|super|import)\()[A-Za-z_][\w$]*\(/;
  };
}
