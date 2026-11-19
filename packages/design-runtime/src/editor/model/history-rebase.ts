/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { mergeDcTemplates } from "./three-way-merge";
import { resetUndoHistory } from "../undo/history";

var ModelHistoryRebaseAlias: Dynamic;
var ModelHistoryRebaseAlias_2: Dynamic;
var ModelHistoryRebaseHandler: Dynamic;
var ModelHistoryRebaseHandler_2: Dynamic;
var ModelHistoryRebaseUndo: Dynamic;
var ModelHistoryRebaseCache: Dynamic;
var ModelHistoryRebaseLimit: Dynamic;
var ModelHistoryRebaseNow: Dynamic;
var ModelHistoryRebaseSet: Dynamic;
var ModelHistoryRebaseDelete: Dynamic;
var ModelHistoryRebaseNowValue: Dynamic;
var ModelHistoryRebaseHandler_3: Dynamic;
var ModelHistoryRebaseHandler_4: Dynamic;
function isRecentlyEditedFile(
  filePath?: Dynamic,
  now: Dynamic = ModelHistoryRebaseNow(),
): Dynamic {
  let entry: Dynamic = ModelHistoryRebaseCache.get(filePath);
  entry !== undefined &&
    now - entry > ModelHistoryRebaseLimit &&
    ModelHistoryRebaseCache.delete(filePath);
  return ModelHistoryRebaseCache.has(filePath);
}
function rebaseUndoEntries(
  entries?: Dynamic,
  oldBase?: Dynamic,
  newBase?: Dynamic,
): Dynamic {
  if (entries.length === 0 || oldBase === newBase)
    return {
      kept: [...entries],
      dropped: 0,
    };
  let rebasedEntries: Dynamic = [],
    stopReason: Dynamic;
  for (let index: Dynamic = entries.length - 1; index >= 0; index--) {
    let entry: Dynamic = entries[index];
    if (typeof entry != "string") {
      stopReason =
        "an inline " +
        entry.kind +
        " entry does not outlive a reset of the base";
      break;
    }
    let mergeResult: Dynamic = mergeDcTemplates(
      oldBase,
      entry,
      newBase,
    );
    if (!mergeResult.ok || mergeResult.merged === undefined) {
      stopReason = mergeResult.guard.baseTheirs
        ? (mergeResult.why ?? "not mergeable")
        : "the change altered the element tree";
      break;
    }
    rebasedEntries.unshift(mergeResult.merged);
  }
  return {
    kept: rebasedEntries,
    dropped: entries.length - rebasedEntries.length,
    ...(stopReason !== undefined
      ? {
          why: stopReason,
        }
      : {}),
  };
}
function rebaseModelHistory(
  history?: Dynamic,
  oldBase?: Dynamic,
  newBase?: Dynamic,
): Dynamic {
  if (!ModelHistoryRebaseAlias) {
    let droppedCount: Dynamic = history.undo.length + history.redo.length;
    resetUndoHistory(history);
    return {
      undo: 0,
      redo: 0,
      dropped: droppedCount,
    };
  }
  let undoResult: Dynamic = rebaseUndoEntries(history.undo, oldBase, newBase),
    redoResult: Dynamic = rebaseUndoEntries(history.redo, oldBase, newBase);
  history.undoFloor = (history.undoFloor ?? 0) + undoResult.dropped;
  history.undo = undoResult.kept;
  history.redo = redoResult.kept;
  let stopReason: Dynamic = undoResult.why ?? redoResult.why;
  return {
    undo: undoResult.kept.length,
    redo: redoResult.kept.length,
    dropped: undoResult.dropped + redoResult.dropped,
    ...(stopReason !== undefined
      ? {
          why: stopReason,
        }
      : {}),
  };
}
export {
  isRecentlyEditedFile,
  ModelHistoryRebaseAlias,
  ModelHistoryRebaseAlias_2,
  ModelHistoryRebaseCache,
  ModelHistoryRebaseDelete,
  ModelHistoryRebaseHandler,
  ModelHistoryRebaseHandler_2,
  ModelHistoryRebaseHandler_3,
  ModelHistoryRebaseHandler_4,
  ModelHistoryRebaseLimit,
  ModelHistoryRebaseNow,
  ModelHistoryRebaseNowValue,
  ModelHistoryRebaseSet,
  ModelHistoryRebaseUndo,
  rebaseModelHistory,
  rebaseUndoEntries,
};
export function installEditorModelHistoryRebase(): () => void {
  return () => {
    ModelHistoryRebaseAlias = false;
    ModelHistoryRebaseHandler = (
      isEnabled?: Dynamic,
      onRebase?: Dynamic,
    ): Dynamic => {
      ModelHistoryRebaseAlias = isEnabled;
      ModelHistoryRebaseAlias_2 = onRebase;
    };
    ModelHistoryRebaseHandler_2 = (): Dynamic => ModelHistoryRebaseAlias;
    ModelHistoryRebaseUndo = (docKey?: Dynamic, summary?: Dynamic): Dynamic => {
      if (summary.undo + summary.redo + summary.dropped !== 0)
        try {
          ModelHistoryRebaseAlias_2?.(docKey, summary);
        } catch {}
    };
    ModelHistoryRebaseCache = new Map();
    ModelHistoryRebaseLimit = 1e4;
    ModelHistoryRebaseNow = (): Dynamic =>
      typeof performance === "undefined" ? Date.now() : performance.now();
    ModelHistoryRebaseSet = (
      filePath?: Dynamic,
      timestamp: Dynamic = ModelHistoryRebaseNow(),
    ): Dynamic => {
      ModelHistoryRebaseCache.set(filePath, timestamp);
    };
    ModelHistoryRebaseDelete = (
      filePath?: Dynamic,
      now: Dynamic = ModelHistoryRebaseNow(),
    ): Dynamic =>
      isRecentlyEditedFile(filePath, now) &&
      ModelHistoryRebaseCache.delete(filePath);
    ModelHistoryRebaseNowValue = -1 / 0;
    ModelHistoryRebaseHandler_3 = (): Dynamic => {
      ModelHistoryRebaseNowValue = ModelHistoryRebaseNow();
    };
    ModelHistoryRebaseHandler_4 = (): Dynamic => ModelHistoryRebaseNowValue;
  };
}
