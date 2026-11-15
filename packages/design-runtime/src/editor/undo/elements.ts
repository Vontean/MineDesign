/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { applyPendingUndoEntry } from "./history";
import { blobAssetPathPattern, isEmulatorBlobUrl } from "../../platform/image-upload";

var UndoElementsSrcWidthHeightSet: Dynamic;
var UndoElementsAZaZAZaZPattern: Dynamic;
var UndoElementsPattern: Dynamic;
var UndoElementsTest: Dynamic;
function applyElementUndo(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  let value: Dynamic = options === "undo" ? input.undo : input.redo,
    value2: Dynamic = options === "undo" ? input.redo : input.undo,
    value3: Dynamic = value.pop();
  if (value3 == null) return null;
  if (typeof value3 == "string") {
    value2.push(input.model.serialize());
    input.model = input.model.rebuild(value3);
    input.liveStampsStale = false;
    input.previewBaseline = undefined;
    return {
      kind: "template",
    };
  }
  let value4: Dynamic = (0, applyPendingUndoEntry)(
    input,
    value3,
    options,
    context,
  );
  return value4 == null
    ? (options === "undo" && (input.redo = []), null)
    : (value2.push(value4.twin), value4.result);
}
function modelHistoryCompatibility(
  input?: Dynamic,
  options?: Dynamic,
): Dynamic {
  return input === options
    ? "same"
    : options.sameSkeleton(input)
      ? "keep"
      : "clear";
}
function validatePastedAttributeEdits(input?: Dynamic): Dynamic {
  for (let [value, value2] of Object.entries(input) as Dynamic)
    if (
      !UndoElementsSrcWidthHeightSet.has(value) ||
      (value === "src" && value2 != null && !UndoElementsTest(value2)) ||
      ((value === "srcset" || value === "data-dc-drop") && value2 != null) ||
      (value !== "src" && value2 != null && !UndoElementsPattern.test(value2))
    )
      return false;
  return true;
}
export {
  applyElementUndo,
  modelHistoryCompatibility,
  UndoElementsAZaZAZaZPattern,
  UndoElementsPattern,
  UndoElementsSrcWidthHeightSet,
  UndoElementsTest,
  validatePastedAttributeEdits,
};
export function installEditorUndoElements(): () => void {
  return () => {
    UndoElementsSrcWidthHeightSet = new Set([
      "src",
      "width",
      "height",
      "srcset",
      "data-dc-drop",
    ]);
    UndoElementsAZaZAZaZPattern = /^\.\/[A-Za-z0-9_-][A-Za-z0-9_.-]{0,199}$/;
    UndoElementsPattern = /^\d{1,5}$/;
    UndoElementsTest = (input?: Dynamic): Dynamic =>
      UndoElementsAZaZAZaZPattern.test(input) ||
      blobAssetPathPattern.test(input) ||
      (0, isEmulatorBlobUrl)(input) ||
      false;
  };
}
