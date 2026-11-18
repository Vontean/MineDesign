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
var initializeTooltipTrigger_2: () => void;
var reactTooltipTrigger_2: typeof React;
var TooltipTriggerElementCache: WeakMap<Document, Range>;
var initializeTooltipTrigger_3: () => void;
var reactTooltipTrigger_3: typeof React;
var initializeTooltipTrigger_4: () => void;
function useTooltipTrigger(): boolean {
  return (0, reactTooltipTrigger.useContext)(TooltipTriggerContext);
}
function getResizeObserver(
  input?: Element | null,
): typeof ResizeObserver | undefined {
  return (
    input?.ownerDocument.defaultView as BrowserWindow | null | undefined
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
    reactTooltipTrigger_3.useRef)(undefined),
    value2 = (0, reactTooltipTrigger_3.useCallback)(() => {
      window.clearTimeout(value.current);
      value.current = undefined;
    }, []),
    value3 = (0, reactTooltipTrigger_3.useCallback)(
      (input: number, options: () => void): void => {
        value2();
        value.current = window.setTimeout(options, input);
      },
      [value2],
    );
  (0, reactTooltipTrigger_3.useEffect)(() => value2, [value2]);
  return (0, reactTooltipTrigger_3.useMemo)(
    () => ({
      start: value3,
      cancel: value2,
    }),
    [value3, value2],
  );
}
export {
  getResizeObserver,
  initializeTooltipTrigger,
  initializeTooltipTrigger_2,
  initializeTooltipTrigger_3,
  initializeTooltipTrigger_4,
  measureContentRect,
  reactTooltipTrigger,
  reactTooltipTrigger_2,
  reactTooltipTrigger_3,
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
    initializeTooltipTrigger_2 = initializeOnce(() => {});
    initializeTooltipTrigger_3 = initializeOnce(() => {
      "use client";

      reactTooltipTrigger_2 = toModuleNamespace(
        load_react(),
      );
      TooltipTriggerElementCache = new WeakMap();
    });
    initializeTooltipTrigger_4 = initializeOnce(() => {
      reactTooltipTrigger_3 = toModuleNamespace(
        load_react(),
      );
    });
  };
}
