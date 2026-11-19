/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { resetUndoHistory, trimUndoHistory } from "../undo/history";

var ModelModelStateConstant: Dynamic;
var ModelModelStateLimit: Dynamic;
var DcModelKey: Dynamic;
var ModelModelStateDataDcDraggingDataDcDragParentDataDcDragFollowerValues: Dynamic;
var ModelModelStateSubscribers: Dynamic;
function serializeAsyncFileTask(
  pendingTasks?: Dynamic,
  taskKey?: Dynamic,
  task?: Dynamic,
): Dynamic {
  let taskResult: Dynamic = (pendingTasks.get(taskKey) ?? Promise.resolve()).then(
      task,
      task,
    ),
    settledTail: Dynamic = taskResult.then(
      (): Dynamic => {},
      (): Dynamic => {},
    );
  pendingTasks.set(taskKey, settledTail);
  settledTail.finally((): Dynamic => {
    pendingTasks.get(taskKey) === settledTail && pendingTasks.delete(taskKey);
  });
  return taskResult;
}
function recordModelUndo(
  docState?: Dynamic,
  previousTemplate?: Dynamic,
  undoLimit: Dynamic = ModelModelStateConstant,
): Dynamic {
  return docState.model.serialize() === previousTemplate
    ? false
    : (docState.undo.push(previousTemplate),
      trimUndoHistory(docState, docState.undo.length - undoLimit),
      (docState.redo = []),
      true);
}
function resetModelBaselines(documents?: Dynamic): Dynamic {
  documents.each((fileKey?: Dynamic, doc?: Dynamic): Dynamic => {
    !doc.dirty &&
    doc.pendingScript === undefined &&
    doc.pendingProps === undefined
      ? ((doc.originalTemplate = doc.model.serialize()),
        (doc.carriedEditCount = 0))
      : (doc.carriedEditCount =
          (doc.carriedEditCount ?? 0) +
          doc.undo.filter(
            (entry?: Dynamic): Dynamic => typeof entry == "string",
          ).length);
    resetUndoHistory(doc);
  });
}
function stripDragAttributes(template?: Dynamic): Dynamic {
  return template.replace(
    / data-dc-drag(?:ging|-parent|-follower|-block)="\d+"/g,
    "",
  );
}
function getPreDragBaseline(doc?: Dynamic): Dynamic {
  return doc.previewBaseline !== undefined &&
    / data-dc-dragging="\d+"/.test(doc.model.serialize())
    ? doc.previewBaseline
    : undefined;
}
function serializeStableModel(doc?: Dynamic): Dynamic {
  return stripDragAttributes(
    getPreDragBaseline(doc) ?? doc.model.serialize(),
  );
}
function hasUnsavedModelChanges(documents?: Dynamic): Dynamic {
  let hasChanges: Dynamic = false;
  documents.each((fileKey?: Dynamic, doc?: Dynamic): Dynamic => {
    serializeStableModel(doc) !==
      stripDragAttributes(doc.originalTemplate) && (hasChanges = true);
    doc.pendingScript !== undefined &&
      doc.pendingScript !== doc.pendingScriptBase &&
      (hasChanges = true);
    doc.pendingProps !== undefined &&
      Object.keys(doc.pendingProps).length > 0 &&
      (hasChanges = true);
  });
  return hasChanges;
}
function rebuildModelTemplate(model?: Dynamic, rebuildInput?: Dynamic): Dynamic {
  return model.rebuild(rebuildInput).serialize();
}
function adoptModelVersion(doc?: Dynamic, version?: Dynamic): Dynamic {
  (doc.adoptedVersion === undefined || version > doc.adoptedVersion) &&
    (doc.adoptedVersion = version);
}
function warnUnreadableDcDocument(
  fileName?: Dynamic,
  template?: Dynamic,
  reason?: Dynamic,
): Dynamic {
  let warningKey: Dynamic =
    fileName +
    `
` +
    reason;
  ModelModelStateSubscribers.has(warningKey) ||
    !/<x-dc[\s/>]/i.test(template) ||
    (ModelModelStateSubscribers.add(warningKey),
    console.warn(
      "[dc-model] " +
        fileName +
        ": the editor cannot read where the <x-dc> markup ends, so " +
        reason +
        ". If this file is an artboard, most likely its '</x-dc>' line is missing or misspelt: put '</x-dc>' on its own line after the markup, before the <script data-dc-script> block.",
    ));
}
export {
  adoptModelVersion,
  DcModelKey,
  getPreDragBaseline,
  hasUnsavedModelChanges,
  ModelModelStateConstant,
  ModelModelStateDataDcDraggingDataDcDragParentDataDcDragFollowerValues,
  ModelModelStateLimit,
  ModelModelStateSubscribers,
  rebuildModelTemplate,
  recordModelUndo,
  resetModelBaselines,
  serializeAsyncFileTask,
  serializeStableModel,
  stripDragAttributes,
  warnUnreadableDcDocument,
};
export function installEditorModelModelState(): () => void {
  return () => {
    ModelModelStateConstant = 100;
    ModelModelStateLimit = 1200;
    DcModelKey = "dc-model";
    ModelModelStateDataDcDraggingDataDcDragParentDataDcDragFollowerValues = [
      "data-dc-dragging",
      "data-dc-drag-parent",
      "data-dc-drag-follower",
      "data-dc-drag-block",
    ];
    ModelModelStateSubscribers = new Set();
  };
}
