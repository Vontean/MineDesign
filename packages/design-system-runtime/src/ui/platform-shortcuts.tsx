/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type * as C from "../contracts/controls";
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var reactPlatformShortcuts: typeof React;
var jsxPlatformShortcuts: typeof import("react/jsx-runtime");
function isApplePlatform() {
  if (typeof navigator === "undefined") {
    return false;
  }
  return /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);
}
function formatCommandShortcut(key: string, { shift = false } = {}) {
  if (isApplePlatform()) {
    return (shift ? "⇧⌘" : "⌘") + key;
  }
  return "Ctrl+" + (shift ? "Shift+" : "") + key;
}
export {
  formatCommandShortcut,
  isApplePlatform,
  jsxPlatformShortcuts,
  reactPlatformShortcuts,
};
export function installUiPlatformShortcuts(): () => void {
  return () => {
    reactPlatformShortcuts = (0, toModuleNamespace)(
      (0, loadReactNamespace)(),
      1,
    );
    jsxPlatformShortcuts = (0, toModuleNamespace)(
      (0, loadJsxNamespace)(),
      1,
    );
  };
}
