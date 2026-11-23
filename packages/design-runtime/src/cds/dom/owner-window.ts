import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { initializeOnce } from "../../module-helpers";

var initializeDomOwnerWindow: () => void;
var accentColorNames: string[];
var initializeAccentColorNames: () => void;
function getOwnerWindow(element?: Element | null): Window | undefined {
  return element?.ownerDocument.defaultView ?? globalThis.window;
}
function isDetachedElement(element?: Element): boolean {
  return (
    element !== undefined &&
    (!element.isConnected || element.ownerDocument.defaultView === null)
  );
}
function getConnectedOwnerWindow(element?: Element): Window | undefined {
  if (!isDetachedElement(element)) return getOwnerWindow(element);
}
export {
  accentColorNames,
  getConnectedOwnerWindow,
  getOwnerWindow,
  initializeDomOwnerWindow,
  initializeAccentColorNames,
  isDetachedElement,
};
export function installCdsDomOwnerWindow(): () => void {
  return () => {
    initializeDomOwnerWindow = initializeOnce(() => {});
    initializeAccentColorNames = initializeOnce(() => {
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
