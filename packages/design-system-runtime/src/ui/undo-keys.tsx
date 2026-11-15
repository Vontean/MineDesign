/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type {
  UndoKeyEvent,
  UndoCommand,
  UndoActions,
} from "../contracts/composition";
import { reactForPlatformFrameChrome } from "../platform/frame-chrome";
import { overlaysBlockUndo } from "./property-focus";

function undoRedoKeyCommand(event: UndoKeyEvent): UndoCommand | undefined {
  if (event.altKey) {
    return;
  }
  if (!(event.metaKey || event.ctrlKey)) {
    return;
  }
  let value = event.key.toLowerCase();
  if (value === "z") {
    if (event.shiftKey) {
      return "redo";
    } else {
      return "undo";
    }
  }
  if (value === "y" && event.ctrlKey && !event.metaKey && !event.shiftKey) {
    return "redo";
  }
  return;
}
function isUndoEditingTarget(target: EventTarget | null) {
  if (
    typeof HTMLElement === "undefined" ||
    !(target instanceof HTMLElement)
  ) {
    return false;
  }
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.isContentEditable
  );
}
function createUndoKeyHandler(history2: UndoActions) {
  return (event: KeyboardEvent) => {
    if (event.defaultPrevented) {
      return;
    }
    let value = undoRedoKeyCommand(event);
    if (!value) {
      return;
    }
    if (isUndoEditingTarget(event.target)) {
      return;
    }
    if (typeof document !== "undefined" && (0, overlaysBlockUndo)()) {
      return;
    }
    event.preventDefault();
    if (value === "redo") {
      history2.redo();
    } else {
      history2.undo();
    }
  };
}
function useUndoKeys(
  history2: UndoActions | null | undefined,
  enabled: boolean = true,
) {
  reactForPlatformFrameChrome.useEffect(() => {
    if (!history2 || !enabled) {
      return;
    }
    let value = createUndoKeyHandler(history2);
    window.addEventListener("keydown", value);
    return () => window.removeEventListener("keydown", value);
  }, [history2, enabled]);
}
export {
  createUndoKeyHandler,
  isUndoEditingTarget,
  undoRedoKeyCommand,
  useUndoKeys,
};
export function installUiUndoKeys(): () => void {
  return () => {};
}
