import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { initializeOnce } from "../../module-helpers";

var initializeDomOwnerWindow: () => void;
var accentColorNames: string[];
var initializeDomOwnerWindow_2: () => void;
function getOwnerWindow(element?: Element | null): Window | undefined {
  return element?.ownerDocument.defaultView ?? globalThis.window;
}
function isDetachedElement(element?: Element): boolean {
  return (
    element !== undefined &&
    (!element.isConnected || element.ownerDocument.defaultView === null)
  );
}
function getConnectedOwnerWindow(input?: Element): Window | undefined {
  if (!isDetachedElement(input)) return getOwnerWindow(input);
}
export {
  accentColorNames,
  getConnectedOwnerWindow,
  getOwnerWindow,
  initializeDomOwnerWindow,
  initializeDomOwnerWindow_2,
  isDetachedElement,
};
export function installCdsDomOwnerWindow(): () => void {
  return () => {
    initializeDomOwnerWindow = initializeOnce(() => {});
    initializeDomOwnerWindow_2 = initializeOnce(() => {
      accentColorNames = [
        "red",
        "orange",
        "yellow",
        "green",
        "aqua",
        "blue",
        "violet",
        "magenta",
      ];
    });
  };
}
