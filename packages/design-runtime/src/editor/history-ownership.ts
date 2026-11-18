/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { parseDcHtmlDocument, replaceDcTemplate } from "./html/dc-document";

var editorOwnsUndoProbe: Dynamic;
var undoGestureObserver: Dynamic;
function setEditorOwnsUndoProbe(probe?: Dynamic): Dynamic {
  editorOwnsUndoProbe = probe;
}
function editorOwnsUndo(): Dynamic {
  try {
    return editorOwnsUndoProbe();
  } catch {
    return false;
  }
}
function compareDesignSourceScripts(
  currentSource?: Dynamic,
  previousSource?: Dynamic,
): Dynamic {
  if (previousSource === undefined || currentSource === undefined)
    return {
      ok: false,
      why: "no earlier source to compare with",
    };
  let value: Dynamic = parseDcHtmlDocument(currentSource),
    value2: Dynamic = parseDcHtmlDocument(previousSource);
  return !value || !value2
    ? {
        ok: false,
        why: "not a parseable .dc.html",
      }
    : value.js !== value2.js
      ? {
          ok: false,
          why: "the logic script changed",
        }
      : replaceDcTemplate(
            currentSource,
            value,
            value2.template,
          ) !== previousSource
        ? {
            ok: false,
            why: "something outside the template changed (props, head)",
          }
        : {
            ok: true,
            template: value2.template,
          };
}
function setUndoGestureObserver(observer?: Dynamic): Dynamic {
  undoGestureObserver = observer;
}
function notifyUndoGesture(phase?: Dynamic, scope?: Dynamic): Dynamic {
  try {
    undoGestureObserver?.(phase, scope);
  } catch {}
}
export {
  compareDesignSourceScripts,
  editorOwnsUndo,
  editorOwnsUndoProbe,
  notifyUndoGesture,
  setEditorOwnsUndoProbe,
  setUndoGestureObserver,
  undoGestureObserver,
};
export function installEditorHistoryOwnership(): () => void {
  return () => {
    editorOwnsUndoProbe = (): Dynamic => false;
  };
}
