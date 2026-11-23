import type {
  BrowserWindow,
  TooltipDelay,
  TooltipImplementation,
} from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { load_react } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactTooltipTrigger: typeof React;
var TooltipTriggerContext: React.Context<boolean>;
var TooltipImplementationContext: React.Context<TooltipImplementation | null>;
var initializeTooltipTrigger: () => void;
var initializeTooltipTriggerPlaceholder: () => void;
var TooltipTriggerElementCache: WeakMap<Document, Range>;
var initializeTooltipTriggerElementCache: () => void;
var reactForUseTooltipDelay: typeof React;
var initializeTooltipDelayReact: () => void;
function useTooltipTrigger(): boolean {
  return (0, reactTooltipTrigger.useContext)(TooltipTriggerContext);
}
function getResizeObserver(
  element?: Element | null,
): typeof ResizeObserver | undefined {
  return (
    element?.ownerDocument.defaultView as BrowserWindow | null | undefined
  )?.ResizeObserver;
}
function measureContentRect(element: Element): boolean {
  let ownerDocument = element.ownerDocument,
    entry = TooltipTriggerElementCache.get(ownerDocument);
  entry === undefined &&
    ((entry = ownerDocument.createRange()),
    TooltipTriggerElementCache.set(ownerDocument, entry));
  entry.selectNodeContents(element);
  let value = entry.getBoundingClientRect?.();
  entry.setStart(ownerDocument, 0);
  entry.collapse(true);
  if (value === undefined || value.width === 0) return false;
  let bounds = element.getBoundingClientRect();
  return value.right - bounds.right > 0.1 || bounds.left - value.left > 0.1;
}
function useTooltipDelay(): TooltipDelay {
  let value: React.RefObject<number | undefined> = (0,
    reactForUseTooltipDelay.useRef)(undefined),
    cancelDelay = (0, reactForUseTooltipDelay.useCallback)(() => {
      window.clearTimeout(value.current);
      value.current = undefined;
    }, []),
    startDelay = (0, reactForUseTooltipDelay.useCallback)(
      (delayMs: number, onElapsed: () => void): void => {
        cancelDelay();
        value.current = window.setTimeout(onElapsed, delayMs);
      },
      [cancelDelay],
    );
  (0, reactForUseTooltipDelay.useEffect)(() => cancelDelay, [cancelDelay]);
  return (0, reactForUseTooltipDelay.useMemo)(
    () => ({
      start: startDelay,
      cancel: cancelDelay,
    }),
    [startDelay, cancelDelay],
  );
}
export {
  getResizeObserver,
  initializeTooltipTrigger,
  initializeTooltipTriggerPlaceholder,
  initializeTooltipTriggerElementCache,
  initializeTooltipDelayReact,
  measureContentRect,
  reactTooltipTrigger,
  reactForUseTooltipDelay,
  TooltipImplementationContext,
  TooltipTriggerContext,
  TooltipTriggerElementCache,
  useTooltipDelay,
  useTooltipTrigger,
};
export function installCdsTooltipTrigger(): () => void {
  return () => {
    initializeTooltipTrigger = initializeOnce(() => {
      "use client";

      reactTooltipTrigger = toModuleNamespace(
        load_react(),
      );
      TooltipTriggerContext = (0, reactTooltipTrigger.createContext)(false);
      TooltipImplementationContext = (0,
      reactTooltipTrigger.createContext)<TooltipImplementation | null>(null);
    });
    initializeTooltipTriggerPlaceholder = initializeOnce(() => {});
    initializeTooltipTriggerElementCache = initializeOnce(() => {
      "use client";

      load_react();
      TooltipTriggerElementCache = new WeakMap();
    });
    initializeTooltipDelayReact = initializeOnce(() => {
      reactForUseTooltipDelay = toModuleNamespace(
        load_react(),
      );
    });
  };
}
