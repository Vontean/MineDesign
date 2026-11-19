/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

function isApplePlatform(): Dynamic {
  return typeof navigator === "undefined"
    ? false
    : /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);
}
function keyboardShortcutLabel(
  key?: Dynamic,
  { shift: withShift = false }: Dynamic = {},
): Dynamic {
  return isApplePlatform()
    ? (withShift ? "\u21E7\u2318" : "\u2318") + key
    : "Ctrl+" + (withShift ? "Shift+" : "") + key;
}
function isDuplicateShortcut(event?: Dynamic): Dynamic {
  return (
    (event.key === "d" || event.key === "D") &&
    !event.shiftKey &&
    !event.altKey &&
    (isApplePlatform() ? event.metaKey && !event.ctrlKey : event.ctrlKey)
  );
}
export {
  isApplePlatform,
  isDuplicateShortcut,
  keyboardShortcutLabel,
};
export function installEditorKeyboardShortcuts(): () => void {
  return () => {};
}
