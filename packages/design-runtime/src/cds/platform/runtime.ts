import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { initializeOnce } from "../../module-helpers";

var PlatformRuntimeClaudeNestPattern: RegExp;
var initializePlatformRuntime: () => void;
function detectRuntimePlatform(): "web" | "desktop" {
  return typeof navigator === "undefined"
    ? "web"
    : PlatformRuntimeClaudeNestPattern.test(navigator.userAgent)
      ? "desktop"
      : "web";
}
export {
  detectRuntimePlatform,
  initializePlatformRuntime,
  PlatformRuntimeClaudeNestPattern,
};
export function installCdsPlatformRuntime(): () => void {
  return () => {
    initializePlatformRuntime = initializeOnce(() => {
      // MineDesign: the desktop app is told apart by Electron alone.
      PlatformRuntimeClaudeNestPattern = /\bElectron\//i;
    });
  };
}
