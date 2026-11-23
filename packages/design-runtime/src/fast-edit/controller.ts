/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { parseDesignCommentAnchor, stableAnchorHash } from "../comments/anchor-codec";
import { finishFastEditJournalTurn } from "./journal";
import { reportFastEditOutcome } from "./outcome-metrics";
import { applyFastEditRequest, updateFastEditHistoryFromCanvas } from "./request";
import { FAST_EDIT_ERROR_MESSAGES, FAST_EDIT_SANDBOX_START_TIMEOUT_MS, withFastEditTimeout } from "./session";

var FAST_EDIT_COMPLETION_MESSAGES: Dynamic;
var COMMENT_FAST_EDIT_TIMEOUT_MS: Dynamic;
var COMMENT_FAST_EDIT_MAX_CALLS: Dynamic;
var MAX_COMMENT_FAST_EDIT_PROMPT_CHARS: Dynamic;
var FAST_EDIT_HANDOFF_CODES: Dynamic;
var FAST_EDIT_REFUSED_CODES: Dynamic;
var classifyFastEditHandoffOutcome: Dynamic;
var FAST_EDIT_HANDOFF_MESSAGES: Dynamic;
var KNOWN_FAST_EDIT_HANDOFF_CODES: Dynamic;
var FAST_EDIT_TEMPLATE_GATE_CODES: Dynamic;
var FAST_EDIT_GATE_ERROR_CODES: Dynamic;
var FAST_EDIT_CAP_ERROR_CODES: Dynamic;
var isKnownFastEditCode: Dynamic;
var describeFastEditHandoff: Dynamic;
var sleepFastEdit: Dynamic;
var MAX_FAST_EDIT_CLICK_CONTEXT_CHARS: Dynamic;
var COMMENT_NEAREST_ARTBOARD_DISTANCE: Dynamic;
function truncateUtf8Text(text?: Dynamic, maxBytes?: Dynamic): Dynamic {
  let encoder: Dynamic = new TextEncoder(),
    result: Dynamic = "",
    bytes: Dynamic = 0;
  for (let value of text as Dynamic) {
    bytes += encoder.encode(value).length;
    if (bytes > maxBytes) break;
    result += value;
  }
  return result.trim();
}
function commentPinnedFile(anchor?: Dynamic, files?: Dynamic): Dynamic {
  let parsedAnchor: Dynamic =
    anchor === null ? null : parseDesignCommentAnchor(anchor);
  return parsedAnchor === null || !("fileHash" in parsedAnchor)
    ? null
    : (files.find(
        (input?: Dynamic): Dynamic =>
          stableAnchorHash(input) === parsedAnchor.fileHash,
      ) ?? null);
}
function findNearbyCommentArtboards(
  boards?: Dynamic,
  x?: Dynamic,
  y?: Dynamic,
  accept?: Dynamic,
): Dynamic {
  let ranked: Dynamic = boards.map((input?: Dynamic): Dynamic => {
    let value: Dynamic = Math.max(input.x - x, x - (input.x + input.w), 0),
      verticalDistance: Dynamic = Math.max(input.y - y, y - (input.y + input.h), 0);
    return {
      file: input.file,
      far: Math.hypot(value, verticalDistance),
      px: Math.round(Math.max(value, verticalDistance)),
      side:
        value >= verticalDistance
          ? x < input.x
            ? "left"
            : "right"
          : y < input.y
            ? "above"
            : "below",
    };
  });
  return ranked.every(
    (input?: Dynamic): Dynamic => Number.isFinite(input.far) && input.far > 0,
  )
    ? ranked
        .filter(
          (input?: Dynamic): Dynamic =>
            input.far <= COMMENT_NEAREST_ARTBOARD_DISTANCE &&
            accept(input.file),
        )
        .sort(
          (input?: Dynamic, options?: Dynamic): Dynamic =>
            input.far - options.far,
        )
        .slice(0, 2)
        .map(
          ({ file: file, px: px2, side: side }: Dynamic): Dynamic => ({
            file: file,
            px: px2,
            side: side,
          }),
        )
    : null;
}
async function resolveCommentFastEditTarget(
  comment?: Dynamic,
  boards?: Dynamic,
  request?: Dynamic,
  context?: Dynamic,
): Promise<Dynamic> {
  let isValidRectangle: Dynamic = (input?: Dynamic): Dynamic =>
    input !== null &&
    [input.x, input.y, input.w, input.h].every(
      (coordinate?: Dynamic): Dynamic => Number.isFinite(coordinate),
    ) &&
    input.w > 0 &&
    input.h > 0;
  if (comment === null) return {};
  if (comment.kind === "artboard" && "px" in comment) {
    let value: Dynamic =
      (await context?.().catch((): Dynamic => null)) ?? null;
    return {
      ground: true,
      x: comment.px + (value?.x ?? 0),
      y: comment.py + (value?.y ?? 0),
      page: {
        x: comment.px,
        y: comment.py,
      },
    };
  }
  if (comment.kind === "artboard" && comment.fy === 0) return {};
  if (comment.kind === "artboard") {
    let value: Dynamic =
        (await context?.().catch((): Dynamic => null)) ?? null,
      x: Dynamic = comment.fx * boards.w,
      y: Dynamic = comment.fy * boards.h;
    return {
      ground: true,
      x: x,
      y: y,
      ...(isValidRectangle(value)
        ? {
            page: {
              x: x - value.x,
              y: y - value.y,
            },
          }
        : {}),
    };
  }
  if (comment.kind === "el") {
    let value: Dynamic = await request(
      comment.path,
      comment.tid,
      comment.fp,
    ).catch((): Dynamic => null);
    return isValidRectangle(value)
      ? {
          x: value.x + comment.fx * value.w,
          y: value.y + comment.fy * value.h,
        }
      : {};
  }
  if (comment.kind === "area") {
    let value: Dynamic =
      comment.path === null
        ? {
            x: 0,
            y: 0,
            w: boards.w,
            h: boards.h,
          }
        : await request(comment.path, comment.tid, comment.fp).catch(
            (): Dynamic => null,
          );
    return isValidRectangle(value)
      ? {
          area: {
            x: value.x + comment.box.x0 * value.w,
            y: value.y + comment.box.y0 * value.h,
            w: (comment.box.x1 - comment.box.x0) * value.w,
            h: (comment.box.y1 - comment.box.y0) * value.h,
          },
        }
      : {};
  }
  return {};
}
function createFastEditController(
  getContext?: Dynamic,
  options: Dynamic = {},
): Dynamic {
  let lastOutcome: Dynamic = null,
    activeRequest: Dynamic = null,
    undoAppliedChanges: Dynamic = async (
      recordCount?: Dynamic,
      expectedMark?: Dynamic,
    ): Promise<Dynamic> => {
      let currentExpectedMark: Dynamic = expectedMark;
      for (let recordIndex: Dynamic = 0; recordIndex < recordCount; recordIndex++) {
        let canvas: Dynamic = getContext()?.host().canvas;
        if (canvas === undefined || canvas.mark() !== currentExpectedMark) return "changed";
        canvas.undo();
        for (
          let changePoll: Dynamic = 0;
          changePoll < MAX_FAST_EDIT_CLICK_CONTEXT_CHARS &&
          canvas.mark() === currentExpectedMark;
          changePoll++
        )
          await sleepFastEdit(40);
        if (canvas.mark() === currentExpectedMark) return "changed";
        let stableSamples: Dynamic = 0;
        for (
          let settlePoll: Dynamic = 0, previousMark: Dynamic = canvas.mark();
          settlePoll < MAX_FAST_EDIT_CLICK_CONTEXT_CHARS && stableSamples < 3;
          settlePoll++
        ) {
          await sleepFastEdit(40);
          let currentMark: Dynamic = canvas.mark();
          currentMark === previousMark
            ? (stableSamples += 1)
            : ((previousMark = currentMark), (stableSamples = 0));
        }
        if (stableSamples < 3) return "changed";
        currentExpectedMark = canvas.mark();
      }
      return "undone";
    },
    tryUndo: Dynamic = (recordCount?: Dynamic, historyMark?: Dynamic): Dynamic =>
      undoAppliedChanges(recordCount, historyMark).catch((): Dynamic => "changed"),
    runCommentRequest: Dynamic = async (
      editContext?: Dynamic,
      comment?: Dynamic,
      requestControl?: Dynamic,
    ): Promise<Dynamic> => {
      let startedAt: Dynamic = performance.now(),
        firstStatementMs: Dynamic = null;
      activeRequest = null;
      let journalOutcome: Dynamic = "not_applied",
        skippedCount: Dynamic = 0,
        finishOutcome: Dynamic = (
          outcome?: Dynamic,
          code?: Dynamic,
          details?: Dynamic,
          reply?: Dynamic,
        ): Dynamic => (
          (lastOutcome = {
            outcome: outcome,
            code: code,
            forClaude: "",
            calls: 0,
            skipped: skippedCount,
            msFirst: firstStatementMs,
            ms: Math.round(performance.now() - startedAt),
            ...details,
          }),
          lastOutcome.calls === 0 &&
            editContext?.onNoCall?.({
              outcome: outcome,
              code: code,
              calls: 0,
              ms: lastOutcome.ms,
            }),
          editContext !== null &&
            finishFastEditJournalTurn(
              editContext.session,
              outcome === "done"
                ? "done"
                : outcome === "stopped"
                  ? null
                  : code === "ask_claude"
                    ? "handed"
                    : journalOutcome,
              stableAnchorHash(comment.anchor ?? ""),
            ),
          outcome === "done"
            ? {
                handled: true,
                ...(reply !== undefined
                  ? {
                      reply: reply,
                    }
                  : {}),
              }
            : reply !== undefined
              ? {
                  handled: false,
                  reply: reply,
                }
              : null
        );
      if (editContext === null) return finishOutcome("error", "no_fast_track");
      let anchor: Dynamic =
          comment.anchor === null
            ? null
            : parseDesignCommentAnchor(comment.anchor),
        visibleFiles: Dynamic =
          anchor?.kind === "canvas"
            ? editContext.inView(
                editContext
                  .host()
                  .canvas.boards()
                  .map((board?: Dynamic): Dynamic => board.file),
              )
            : [],
        nearbyBoards: Dynamic =
          anchor?.kind === "canvas" &&
          editContext
            .host()
            .canvas.pageIs(
              (pageId?: Dynamic): Dynamic =>
                stableAnchorHash(pageId) === anchor.pageHash,
            )
            ? findNearbyCommentArtboards(
                editContext.host().canvas.boards(),
                anchor.x,
                anchor.y,
                (file?: Dynamic): Dynamic => visibleFiles.includes(file),
              )
            : null,
        nearbyTargets: Dynamic = nearbyBoards ?? [],
        fallbackTargets: Dynamic =
          nearbyBoards !== null && nearbyBoards.length === 0 ? visibleFiles.slice(0, 2) : [],
        targetFile: Dynamic =
          commentPinnedFile(
            comment.anchor,
            editContext
              .host()
              .canvas.boards()
              .map((board?: Dynamic): Dynamic => board.file),
          ) ??
          nearbyTargets[0]?.file ??
          fallbackTargets[0] ??
          (nearbyBoards !== null ? "" : null);
      if (targetFile === null) return finishOutcome("handed_on", "no_target");
      let targetBoard: Dynamic = editContext
          .host()
          .canvas.boards()
          .find((board?: Dynamic): Dynamic => board.file === targetFile) ?? {
          w: 0,
          h: 0,
        },
        clickTarget: Dynamic = await resolveCommentFastEditTarget(
          anchor,
          targetBoard,
          async (
            path?: Dynamic,
            tid?: Dynamic,
            fingerprint?: Dynamic,
          ): Promise<Dynamic> =>
            (
              await editContext.rectsOf?.(targetFile, [
                {
                  path: path,
                  tid: tid,
                  ...(fingerprint !== undefined
                    ? {
                        fp: fingerprint,
                      }
                    : {}),
                },
              ])
            )?.[0] ?? null,
          async (): Promise<Dynamic> =>
            (
              await editContext.rectsOf?.(targetFile, [
                {
                  page: true,
                },
              ])
            )?.[0] ?? null,
        );
      editContext.session.turn = {
        file: targetFile,
      };
      let requestResult: Dynamic = await applyFastEditRequest(
        {
          ...editContext,
          held: true,
          allOrNothing: true,
          maxCalls: COMMENT_FAST_EDIT_MAX_CALLS,
          target: targetFile,
          ...((nearbyTargets[1]?.file ?? fallbackTargets[1]) !== undefined
            ? {
                second: nearbyTargets[1]?.file ?? fallbackTargets[1],
              }
            : {}),
          ...(fallbackTargets.length > 0
            ? {
                contextOnly: true,
              }
            : {}),
          comment: {
            click: clickTarget,
            ...(nearbyBoards !== null && anchor?.kind === "canvas"
              ? {
                  between: nearbyTargets,
                  pin: {
                    x: anchor.x,
                    y: anchor.y,
                  },
                }
              : {}),
            ...(anchor?.kind === "el"
              ? {
                  path: anchor.path,
                  tid: anchor.tid,
                  ...(anchor.fp !== undefined
                    ? {
                        fp: true,
                      }
                    : {}),
                }
              : {}),
          },
          onStatement: (): Dynamic => {
            firstStatementMs ??= Math.round(performance.now() - startedAt);
          },
        },
        {
          id: "ft" + Date.now().toString(36),
          words: comment.text,
          images: [],
          tier: options.tier?.() ?? "quick",
          signal: requestControl.signal,
          report: (): Dynamic => {},
        },
      );
      reportFastEditOutcome(requestResult);
      skippedCount = requestResult.skipped ?? 0;
      let historySteps: Dynamic = requestResult.steps ?? 0,
        historyMark: Dynamic = requestResult.mark ?? null;
      if (
        requestResult.outcome === "saved" &&
        requestResult.whole === true &&
        !requestControl.signal.aborted
      ) {
        let completion: Dynamic = finishOutcome(
          "done",
          requestResult.code,
          {
            calls: requestResult.calls,
            changed: requestResult.changed ?? [],
          },
          requestResult.made.removed > 0
            ? FAST_EDIT_COMPLETION_MESSAGES.removed(requestResult.made.removed)
            : requestResult.inList === true
              ? FAST_EDIT_COMPLETION_MESSAGES.in_list
              : undefined,
        );
        historyMark !== null &&
          (activeRequest = {
            records: historySteps,
            mark: historyMark,
          });
        return completion;
      }
      if (requestResult.unsaved === "save_clash" && !requestControl.signal.aborted) {
        journalOutcome = "unconfirmed";
        return finishOutcome(
          "refused",
          requestResult.unsaved,
          {
            calls: requestResult.calls,
            forClaude: describeFastEditHandoff(
              requestResult.unsaved,
              requestResult.unsaved,
            ),
          },
          FAST_EDIT_COMPLETION_MESSAGES.save_clash,
        );
      }
      if (historySteps > 0) {
        let undoResult: Dynamic =
            historyMark === null ? "changed" : await tryUndo(historySteps, historyMark),
          partialResultCode: Dynamic =
            undoResult === "undone" ? "part_taken_back" : "part_left";
        if (undoResult === "undone") {
          await withFastEditTimeout(
            (async (): Promise<Dynamic> =>
              Promise.all(
                [...(editContext.host().handlesRef.current?.values() ?? [])].map(
                  (handle?: Dynamic): Dynamic =>
                    (async (): Promise<Dynamic> => {
                      handle.hasPendingEdits() &&
                        (await handle.flushPending());
                    })().catch((): Dynamic => {}),
                ),
              ))().catch((): Dynamic => {}),
            FAST_EDIT_SANDBOX_START_TIMEOUT_MS,
          );
          try {
            editContext.host().saveNow();
          } catch {}
        } else
          journalOutcome = (
            {
              stands: "left",
              gone: "not_applied",
              neither: "left_changed",
            } as Dynamic
          )[
            await updateFastEditHistoryFromCanvas(editContext).catch(
              (): Dynamic => "neither",
            )
          ];
        return requestControl.signal.aborted
          ? finishOutcome("stopped", partialResultCode, {
              calls: requestResult.calls,
            })
          : finishOutcome("error", partialResultCode, {
              calls: requestResult.calls,
              forClaude: describeFastEditHandoff(
                undoResult === "undone" ? "taken_back" : "left",
                partialResultCode,
              ),
            });
      }
      if (requestResult.outcome === "stopped" || requestControl.signal.aborted)
        return finishOutcome(
          "stopped",
          requestControl.signal.reason === "too_slow" ? "too_slow" : "cancelled",
          {
            calls: requestResult.calls,
          },
        );
      let handoffOutcome: Dynamic = classifyFastEditHandoffOutcome(requestResult.code),
        handoffText: Dynamic =
          requestResult.code === "ask_claude"
            ? truncateUtf8Text(
                requestResult.forClaude ?? "",
                COMMENT_FAST_EDIT_TIMEOUT_MS,
              )
            : "";
      return finishOutcome(handoffOutcome, requestResult.code, {
        calls: requestResult.calls,
        forClaude:
          handoffText !== ""
            ? handoffText
            : describeFastEditHandoff(
                requestResult.code === "not_named" || requestResult.code === "in_import"
                  ? requestResult.code
                  : requestResult.calls === 0 &&
                      (requestResult.code === "slow_start" ||
                        requestResult.code === "start_stuck")
                    ? "not_started"
                    : handoffOutcome === "refused"
                      ? "refused"
                      : handoffOutcome === "handed_on"
                        ? "nothing"
                        : "failed",
                requestResult.code === "save_clash" ||
                  requestResult.code === "save_unknown"
                  ? ""
                  : requestResult.code,
              ),
      });
    };
  return {
    fastTrack: async (
      comment?: Dynamic,
      requestOptions?: Dynamic,
    ): Promise<Dynamic> => {
      let value: Dynamic = getContext(),
        session: Dynamic = value?.session;
      if (session !== undefined && session.busy !== null) {
        lastOutcome = {
          outcome: "error",
          code: "busy",
          forClaude: "",
          calls: 0,
          msFirst: null,
          ms: 0,
        };
        return null;
      }
      session !== undefined && (session.busy = "comment");
      let controller: Dynamic = new AbortController(),
        callback: Dynamic = (): Dynamic => controller.abort(),
        scheduleTimeout: Dynamic =
          options.timer ??
          ((delayMs?: Dynamic, onTimeout?: Dynamic): Dynamic => {
            let timer: Dynamic = setTimeout(onTimeout, delayMs);
            return (): Dynamic => clearTimeout(timer);
          }),
        cancelTimeout: Dynamic = scheduleTimeout(
          MAX_COMMENT_FAST_EDIT_PROMPT_CHARS,
          (): Dynamic => controller.abort("too_slow"),
        );
      requestOptions.signal.aborted
        ? callback()
        : requestOptions.signal.addEventListener("abort", callback, {
            once: true,
          });
      try {
        return await runCommentRequest(value, comment, {
          signal: controller.signal,
        });
      } finally {
        cancelTimeout();
        requestOptions.signal.removeEventListener("abort", callback);
        session !== undefined && (session.busy = null);
      }
    },
    side: {
      last: (): Dynamic => lastOutcome,
      undo: async (): Promise<Dynamic> => {
        let requestToUndo: Dynamic = activeRequest;
        activeRequest = null;
        return requestToUndo === null
          ? lastOutcome?.outcome === "done"
            ? "changed"
            : "nothing"
          : tryUndo(requestToUndo.records, requestToUndo.mark);
      },
    },
  };
}
export {
  classifyFastEditHandoffOutcome,
  COMMENT_FAST_EDIT_MAX_CALLS,
  COMMENT_FAST_EDIT_TIMEOUT_MS,
  COMMENT_NEAREST_ARTBOARD_DISTANCE,
  commentPinnedFile,
  createFastEditController,
  describeFastEditHandoff,
  FAST_EDIT_CAP_ERROR_CODES,
  FAST_EDIT_COMPLETION_MESSAGES,
  FAST_EDIT_GATE_ERROR_CODES,
  FAST_EDIT_HANDOFF_CODES,
  FAST_EDIT_HANDOFF_MESSAGES,
  FAST_EDIT_REFUSED_CODES,
  FAST_EDIT_TEMPLATE_GATE_CODES,
  findNearbyCommentArtboards,
  isKnownFastEditCode,
  KNOWN_FAST_EDIT_HANDOFF_CODES,
  MAX_COMMENT_FAST_EDIT_PROMPT_CHARS,
  MAX_FAST_EDIT_CLICK_CONTEXT_CHARS,
  resolveCommentFastEditTarget,
  sleepFastEdit,
  truncateUtf8Text,
};
export function installFastEditController(): () => void {
  return () => {
    FAST_EDIT_COMPLETION_MESSAGES = {
      in_list:
        "Done. This element is drawn once for every item of a list, so the change shows on all of them.",
      save_clash:
        // MineDesign: user-facing copy calls the agent "the agent", not Claude.
        "Somebody else saved this artboard at the same moment, so one of the two changes may not have been kept. The comment has gone on to the agent.",
      removed: (input?: Dynamic): Dynamic =>
        input === 1
          ? "1 artboard deleted. One undo brings it back."
          : `${input} artboards deleted. One undo brings them back.`,
    };
    COMMENT_FAST_EDIT_TIMEOUT_MS = 1e3;
    COMMENT_FAST_EDIT_MAX_CALLS = 3;
    MAX_COMMENT_FAST_EDIT_PROMPT_CHARS = 8e4;
    FAST_EDIT_HANDOFF_CODES = new Set([
      "ask_claude",
      "not_named",
      "in_import",
      "words_only",
      "no_match",
      "already_so",
      "no_change",
      "not_run",
      "empty_completion",
    ]);
    FAST_EDIT_REFUSED_CODES = new Set([
      "refused_add",
      "thrown",
      "empty_drawing",
      "beyond_target",
      "line_no_match",
    ]);
    classifyFastEditHandoffOutcome = (input?: Dynamic): Dynamic =>
      FAST_EDIT_HANDOFF_CODES.has(input)
        ? "handed_on"
        : FAST_EDIT_GATE_ERROR_CODES.has(input) ||
            FAST_EDIT_CAP_ERROR_CODES.has(input) ||
            FAST_EDIT_REFUSED_CODES.has(input)
          ? "refused"
          : "error";
    FAST_EDIT_HANDOFF_MESSAGES = {
      nothing: "This page looked at the request first and made no change.",
      refused:
        "This page tried the change first and its checks refused the result. Nothing was changed.",
      failed:
        "This page tried the change first and failed. Nothing was changed.",
      taken_back:
        "This page tried the change first and could not finish it. What it had changed was taken back.",
      left: "This page tried the change first and could not finish it. A part of the change is still on the artboard.",
      not_named:
        "This page could not tell which element of the template was clicked, so it changed nothing.",
      in_import:
        "The click is inside an imported component, which this page cannot change from this artboard.",
      not_started:
        "This page could not start its quick try in time. Nothing was changed.",
      save_clash:
        "This page made the change, but somebody else saved this artboard at the same moment, so the change may not have been kept, or theirs may not. Look at the artboard as it is now and finish the comment.",
      save_unknown:
        "This page made the change but could not confirm that it was saved. Look at the artboard as it is now and finish the comment.",
    };
    KNOWN_FAST_EDIT_HANDOFF_CODES = new Set([
      "not_named",
      "in_import",
      "words_only",
      "no_match",
      "already_so",
      "no_change",
      "not_run",
      "empty_completion",
      "beyond_target",
      "thrown",
      "line_no_match",
      "empty_drawing",
      "part_taken_back",
      "part_left",
      "save_clash",
      "save_unknown",
    ]);
    FAST_EDIT_TEMPLATE_GATE_CODES = {
      outside: true,
      too_big: true,
      box_cannot_hold: true,
      not_template: true,
      reparse: true,
    };
    FAST_EDIT_GATE_ERROR_CODES = new Set(
      [
        ...Object.keys(FAST_EDIT_TEMPLATE_GATE_CODES),
        "shape",
        "page_style",
        "reshaped",
        "changed",
        "data_cut",
      ].map((input?: Dynamic): Dynamic => "gate_" + input),
    );
    FAST_EDIT_CAP_ERROR_CODES = new Set(["cap_news"]);
    isKnownFastEditCode = (input?: Dynamic): Dynamic =>
      Object.hasOwn(FAST_EDIT_ERROR_MESSAGES, input) ||
      KNOWN_FAST_EDIT_HANDOFF_CODES.has(input) ||
      FAST_EDIT_GATE_ERROR_CODES.has(input) ||
      FAST_EDIT_CAP_ERROR_CODES.has(input);
    describeFastEditHandoff = (input?: Dynamic, options?: Dynamic): Dynamic =>
      FAST_EDIT_HANDOFF_MESSAGES[input] +
      (isKnownFastEditCode(options) ? " Code: " + options + "." : "");
    sleepFastEdit = (input?: Dynamic): Dynamic =>
      new Promise((resolve?: Dynamic): Dynamic => setTimeout(resolve, input));
    MAX_FAST_EDIT_CLICK_CONTEXT_CHARS = 50;
    COMMENT_NEAREST_ARTBOARD_DISTANCE = 400;
  };
}
