/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var OutlineValue: Dynamic;
function getInspectorMode(
  requestedMode?: Dynamic,
  layout?: Dynamic,
  sheetTab?: Dynamic,
): Dynamic {
  return requestedMode === "tweaks"
    ? "tweaks"
    : requestedMode === "code"
      ? "code"
      : layout !== "wide" && sheetTab === "outline"
        ? "outline"
        : "pro";
}
function inspectorModeState(mode?: Dynamic): Dynamic {
  switch (mode) {
    case "tweaks":
      return {
        mode: "tweaks",
        sheetTab: null,
      };
    case "code":
      return {
        mode: "code",
        sheetTab: "edit",
      };
    case "outline":
      return {
        mode: "pro",
        sheetTab: "outline",
      };
    case "pro":
      return {
        mode: "pro",
        sheetTab: "edit",
      };
  }
}
function isOutlineKeyboardFocus(element?: Dynamic, isSuppressed?: Dynamic): Dynamic {
  return isSuppressed ||
    element?.closest(
      `[data-testid="dc-outline"], [data-menu-owner="${OutlineValue}"]`,
    ) == null
    ? false
    : element.matches(":focus-visible") &&
        !element.matches("input, textarea, [contenteditable]");
}
export {
  getInspectorMode,
  inspectorModeState,
  isOutlineKeyboardFocus,
  OutlineValue,
};
export function installEditorInspectorModes(): () => void {
  return () => {
    OutlineValue = "outline";
  };
}
