import type * as Host from "../contracts/platform-host";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var reactForPlatformFrameChrome: typeof React;
var reactForFrameChrome: typeof React;
var OPEN_OVERLAY_SELECTOR: string;
var MENU_POPOVER_OPEN_SELECTORS: string;
export {
  MENU_POPOVER_OPEN_SELECTORS,
  OPEN_OVERLAY_SELECTOR,
  reactForPlatformFrameChrome,
  reactForFrameChrome as reactForPlatformFrameChrome2,
};
export function installPlatformFrameChrome(): () => void {
  return () => {
    reactForPlatformFrameChrome = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    reactForFrameChrome = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    OPEN_OVERLAY_SELECTOR = [
      "[data-mc-popover]",
      "[data-mc-menu]",
      "[data-mc-scrim]",
      '[data-cds="Menu"]',
      '[data-cds="Popover"]',
      '[data-cds="Dialog"]',
      '[role="alertdialog"]:not([aria-modal="false"])',
      '[role="dialog"][aria-modal="true"]',
    ].join(", ");
    MENU_POPOVER_OPEN_SELECTORS = [
      '[data-cds="Menu"]',
      '[data-cds="ContextMenu"]',
      '[data-cds="DropdownButton"]',
      '[data-cds="SplitDropdownButton"]',
      '[data-cds="ModelSelector"]',
    ].join(", ");
  };
}
