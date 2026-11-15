/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var OutlineValue: Dynamic;
function getInspectorMode(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  return input === "tweaks"
    ? "tweaks"
    : input === "code"
      ? "code"
      : options !== "wide" && context === "outline"
        ? "outline"
        : "pro";
}
function inspectorModeState(input?: Dynamic): Dynamic {
  switch (input) {
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
function isOutlineKeyboardFocus(input?: Dynamic, options?: Dynamic): Dynamic {
  return options ||
    input?.closest(
      `[data-testid="dc-outline"], [data-menu-owner="${OutlineValue}"]`,
    ) == null
    ? false
    : input.matches(":focus-visible") &&
        !input.matches("input, textarea, [contenteditable]");
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
