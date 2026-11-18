/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { asElement, initializeHooksStableCallback } from "../hooks/stable-callback";
import { initializeMenuConfiguration, MenuTriggerContext } from "../menu/configuration";
import { initializeSheetsPresentation } from "./presentation";
import { initializeClassNames } from "../theme/class-names";
import { initializeCdsRoot, useCdsRootElement } from "../theme/root";
import { initializeNpm_clsx_xh, load_react, load_react_jsx_runtime } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var jsxSheetsScrollArea: Dynamic;
var SheetsScrollAreaClassNames: Dynamic;
var SheetsScrollAreaClassNames_2: Dynamic;
var SheetsScrollAreaClassNames_3: Dynamic;
var SheetsScrollAreaClassNames_4: Dynamic;
var SheetsScrollAreaLabel: Dynamic;
var initializeSheetsScrollArea: Dynamic;
var reactSheetsScrollArea: Dynamic;
var SheetsScrollAreaElementCache: Dynamic;
var initializeSheetsScrollArea_2: Dynamic;
var editableElementSelector: Dynamic;
var initializeSheetsScrollArea_3: Dynamic;
var initializeSheetsScrollArea_4: Dynamic;
var SheetsScrollAreaElementCache_2: Dynamic;
var SheetsScrollAreaLimit: Dynamic;
var initializeSheetsScrollArea_5: Dynamic;
var reactSheetsScrollArea_2: Dynamic;
var initializeSheetsScrollArea_6: Dynamic;
var overlayAttribute: Dynamic;
var openOverlaySelector: Dynamic;
var initializeOverlayAttributes: Dynamic;
var reactSheetsScrollArea_3: Dynamic;
var InnerOverlaysContext: Dynamic;
var SheetsScrollAreaConstant: Dynamic;
var initializeSheetsScrollArea_7: Dynamic;
var reactSheetsScrollArea_4: Dynamic;
var SheetsScrollAreaSAConfig: Dynamic;
var initializeSheetsScrollArea_8: Dynamic;
var SheetsScrollAreaRegistry: Dynamic;
var SheetsScrollAreaRegistry_2: Dynamic;
var SheetsScrollAreaRegistry_3: Dynamic;
var SheetsScrollAreaRegistry_4: Dynamic;
function isKeyboardContextMenu(event?: Dynamic): Dynamic {
  if (event === undefined || event.type !== "contextmenu") return false;
  let { button: value, pointerType: pointerType }: Dynamic = event;
  return value === -1 && pointerType !== "touch" && pointerType !== "pen";
}
function recordKeyboardContextMenu(
  trigger?: Dynamic,
  isOpen?: Dynamic,
  eventDetails?: Dynamic,
): Dynamic {
  eventDetails.isCanceled ||
    (isOpen && isKeyboardContextMenu(eventDetails.event)
      ? SheetsScrollAreaElementCache.set(trigger, true)
      : SheetsScrollAreaElementCache.delete(trigger));
}
function useKeyboardContextMenuFocus(popupRef?: Dynamic): Dynamic {
  let value: Dynamic = (0, reactSheetsScrollArea.useContext)(
    MenuTriggerContext,
  );
  (0, reactSheetsScrollArea.useEffect)((): Dynamic => {
    if (value === null || !SheetsScrollAreaElementCache.has(value)) return;
    let index: Dynamic = 0,
      count: Dynamic = 3,
      callback: Dynamic = (): Dynamic => {
        let current: Dynamic = popupRef.current,
          activeElement: Dynamic = current?.ownerDocument.activeElement ?? null;
        if (
          current !== null &&
          activeElement !== null &&
          !current.contains(activeElement) &&
          count > 0
        ) {
          count -= 1;
          index = requestAnimationFrame(callback);
          return;
        }
        SheetsScrollAreaElementCache.delete(value);
        current !== null &&
          activeElement === current &&
          current
            .querySelector('[role^="menuitem"]:not([data-disabled])')
            ?.focus({
              preventScroll: true,
            });
      };
    index = requestAnimationFrame(callback);
    return (): Dynamic => {
      cancelAnimationFrame(index);
    };
  }, [value, popupRef]);
}
function normalizeFocusRelatedTarget(element?: Dynamic): Dynamic {
  let callback: Dynamic = (event?: Dynamic): Dynamic => {
    let relatedTarget: Dynamic = event.relatedTarget;
    relatedTarget != null &&
      asElement(relatedTarget) === null &&
      Object.defineProperty(event, "relatedTarget", {
        value: null,
        configurable: true,
      });
  };
  element.addEventListener("focusout", callback, true);
  try {
    element.blur();
  } finally {
    element.removeEventListener("focusout", callback, true);
  }
}
function registerOpenerReturn(popupElement?: Dynamic, resolveOpener?: Dynamic): Dynamic {
  SheetsScrollAreaElementCache_2.set(popupElement, resolveOpener);
}
function openerReturnChain(startElement?: Dynamic): Dynamic {
  let items: Dynamic = [],
    value: Dynamic = startElement;
  for (; value !== null && items.length < SheetsScrollAreaLimit; ) {
    let entry: Dynamic = SheetsScrollAreaElementCache_2.get(value);
    if (entry === undefined) {
      value = value.parentElement;
      continue;
    }
    let opener: Dynamic = entry();
    if (opener === null || opener === value || items.includes(opener)) break;
    items.push(opener);
    value = opener;
  }
  return items;
}
function useInitialFocusGuard(
  isOpen?: Dynamic,
  openerRef?: Dynamic,
  rootRef?: Dynamic,
  onCapture?: Dynamic,
  openerChainRef?: Dynamic,
): Dynamic {
  let rootElement: Dynamic = useCdsRootElement(),
    hasCapturedRef: Dynamic = (0, reactSheetsScrollArea_2.useRef)(false);
  (0, reactSheetsScrollArea_2.useInsertionEffect)((): Dynamic => {
    if (!isOpen) {
      hasCapturedRef.current = false;
      return;
    }
    if (hasCapturedRef.current) return;
    hasCapturedRef.current = true;
    openerRef.current = null;
    rootRef.current = rootElement ?? null;
    let doc: Dynamic = rootElement?.ownerDocument ?? document,
      activeElement: Dynamic = doc.activeElement,
      previousFocus: Dynamic =
        activeElement && activeElement !== doc.body ? activeElement : null;
    openerRef.current = previousFocus;
    openerChainRef && (openerChainRef.current = openerReturnChain(previousFocus));
    onCapture?.();
  }, [isOpen, rootElement, openerRef, rootRef, onCapture, openerChainRef]);
}
function useOpenerReturn(props?: Dynamic): Dynamic {
  let value: Dynamic = props?.skipRestoreOnOutsideFocus ?? false,
    registerOpenerEnabled: Dynamic = props?.registerOpenerReturn ?? true,
    triggerRef: Dynamic = props?.triggerRef,
    openerRef: Dynamic = (0, reactSheetsScrollArea_2.useRef)(null),
    popupRef: Dynamic = (0, reactSheetsScrollArea_2.useRef)(null),
    rootRef: Dynamic = (0, reactSheetsScrollArea_2.useRef)(null);
  useInitialFocusGuard(props?.open ?? true, openerRef, rootRef);
  let registerOpenerEnabledRef: Dynamic = (0, reactSheetsScrollArea_2.useRef)(registerOpenerEnabled);
  (0, reactSheetsScrollArea_2.useLayoutEffect)((): Dynamic => {
    registerOpenerEnabledRef.current = registerOpenerEnabled;
  }, [registerOpenerEnabled]);
  (0, reactSheetsScrollArea_2.useLayoutEffect)((): Dynamic => {
    popupRef.current &&
      registerOpenerReturn(
        popupRef.current,
        (): Dynamic =>
          registerOpenerEnabledRef.current
            ? (connectedRefElement(triggerRef) ?? openerRef.current)
            : null,
      );
  }, [triggerRef]);
  let finalFocus: Dynamic = (0,
  reactSheetsScrollArea_2.useCallback)((): Dynamic => {
    if (value) {
      let current: Dynamic = popupRef.current,
        doc: Dynamic = rootRef.current?.ownerDocument ?? document,
        activeElement: Dynamic = doc.activeElement;
      if (
        activeElement &&
        activeElement !== doc.body &&
        !current?.contains(activeElement)
      )
        return false;
    }
    return connectedRefElement(triggerRef) !== null
      ? null
      : restoreElementFocus(openerRef.current, popupRef.current);
  }, [value, triggerRef]);
  return (0, reactSheetsScrollArea_2.useMemo)(
    (): Dynamic => ({
      finalFocus: finalFocus,
      popupRef: popupRef,
    }),
    [finalFocus],
  );
}
function connectedRefElement(ref?: Dynamic): Dynamic {
  let value: Dynamic = ref?.current ?? null;
  return value?.isConnected ? value : null;
}
function useFinalFocus(
  isOpen?: Dynamic,
  shouldRestoreFocus: Dynamic = true,
  fallbackFocusRef?: Dynamic,
): Dynamic {
  let value: Dynamic = useCdsRootElement(),
    fallbackElementRef: Dynamic = (0, reactSheetsScrollArea_2.useRef)(null),
    pendingRestoreRef: Dynamic = (0, reactSheetsScrollArea_2.useRef)(false),
    markRestorePending: Dynamic = (0,
    reactSheetsScrollArea_2.useCallback)((): Dynamic => {
      fallbackElementRef.current = null;
      pendingRestoreRef.current = true;
    }, []),
    openerRef: Dynamic = (0, reactSheetsScrollArea_2.useRef)(null),
    openerChainRef: Dynamic = (0, reactSheetsScrollArea_2.useRef)([]),
    popupRef: Dynamic = (0, reactSheetsScrollArea_2.useRef)(null),
    rootRef: Dynamic = (0, reactSheetsScrollArea_2.useRef)(null);
  useInitialFocusGuard(isOpen, openerRef, rootRef, markRestorePending, openerChainRef);
  (0, reactSheetsScrollArea_2.useLayoutEffect)((): Dynamic => {
    if (!pendingRestoreRef.current || ((pendingRestoreRef.current = false), !shouldRestoreFocus && !fallbackFocusRef))
      return;
    let doc: Dynamic = value?.ownerDocument ?? document;
    if (!openerRef.current) {
      let fallbackElement: Dynamic = fallbackFocusRef?.current ?? null;
      fallbackElementRef.current =
        fallbackElement !== null &&
        fallbackElement.isConnected &&
        !popupRef.current?.contains(fallbackElement)
          ? fallbackElement
          : null;
    }
    if (!shouldRestoreFocus) return;
    let activeElement: Dynamic = asElement(doc.activeElement),
      focusedElement: Dynamic = activeElement && activeElement !== doc.body ? activeElement : null;
    !focusedElement ||
      popupRef.current?.contains(focusedElement) ||
      normalizeFocusRelatedTarget(focusedElement);
  }, [isOpen, shouldRestoreFocus, fallbackFocusRef, value]);
  let skipIfFocusElsewhere: Dynamic = !shouldRestoreFocus,
    finalFocus: Dynamic = (0,
    reactSheetsScrollArea_2.useCallback)((): Dynamic => {
      if (skipIfFocusElsewhere) {
        let current: Dynamic = popupRef.current,
          doc: Dynamic = rootRef.current?.ownerDocument ?? document,
          activeElement: Dynamic = doc.activeElement;
        if (
          activeElement &&
          activeElement !== doc.body &&
          !current?.contains(activeElement)
        )
          return false;
      }
      if (openerRef.current) {
        if (!openerRef.current.isConnected) {
          let connectedOpener: Dynamic = openerChainRef.current.find(
            (element?: Dynamic): Dynamic => element.isConnected,
          );
          if (connectedOpener) return restoreElementFocus(connectedOpener, popupRef.current);
        }
        return restoreElementFocus(openerRef.current, popupRef.current);
      }
      if (fallbackElementRef.current) {
        let current: Dynamic = popupRef.current,
          activeElement: Dynamic = (rootRef.current?.ownerDocument ?? document)
            .activeElement;
        return (activeElement &&
          isFocusableElement(activeElement) &&
          !current?.contains(activeElement)) ||
          !fallbackElementRef.current.isConnected
          ? false
          : null;
      }
      return false;
    }, [skipIfFocusElsewhere]);
  return (0, reactSheetsScrollArea_2.useMemo)(
    (): Dynamic => ({
      finalFocus: finalFocus,
      popupRef: popupRef,
    }),
    [finalFocus, popupRef],
  );
}
function restoreElementFocus(element?: Dynamic, popupElement?: Dynamic): Dynamic {
  if (!element?.isConnected) return false;
  let activeElement: Dynamic = element.ownerDocument.activeElement;
  if (
    activeElement &&
    isFocusableElement(activeElement) &&
    !popupElement?.contains(activeElement)
  )
    return false;
  let value: Dynamic = element;
  return value.tabIndex < 0
    ? (value.focus({
        preventScroll: true,
      }),
      false)
    : value;
}
function isFocusableElement(element?: Dynamic): Dynamic {
  return element.matches(editableElementSelector);
}
function createInnerOverlayStack(): Dynamic {
  let items: Dynamic = [];
  return {
    register: (overlay?: Dynamic): Dynamic => (
      items.push(overlay),
      (): Dynamic => {
        let value: Dynamic = items.lastIndexOf(overlay);
        value !== -1 && items.splice(value, 1);
      }
    ),
    topmostOpen: (): Dynamic => {
      for (let value: Dynamic = items.length - 1; value >= 0; value -= 1) {
        let candidate: Dynamic = items[value];
        if (candidate?.isOpen()) return candidate;
      }
    },
  };
}
function useInnerOverlayRegistration(overlay?: Dynamic): Dynamic {
  let value: Dynamic = (0, reactSheetsScrollArea_3.useContext)(
      InnerOverlaysContext,
    ),
    overlayRef: Dynamic = (0, reactSheetsScrollArea_3.useRef)(overlay);
  (0, reactSheetsScrollArea_3.useEffect)((): Dynamic => {
    overlayRef.current = overlay;
  }, [overlay]);
  (0, reactSheetsScrollArea_3.useEffect)((): Dynamic => {
    if (value !== null)
      return value.register({
        isOpen: (): Dynamic => overlayRef.current.isOpen(),
        close: (): Dynamic => overlayRef.current.close(),
      });
  }, [value]);
}
function closeInnerOverlayOnEscape(
  stack?: Dynamic,
  shouldSkip?: Dynamic,
  details?: Dynamic,
): Dynamic {
  let value: Dynamic = details;
  if (shouldSkip || value.reason !== "escape-key") return false;
  let topmost: Dynamic = stack.topmostOpen();
  if (topmost === undefined) return false;
  value.cancel?.();
  let event: Dynamic = value.event;
  event?.currentTarget?.nodeType === SheetsScrollAreaConstant
    ? (event?.currentTarget?.defaultView ?? globalThis).setTimeout(
        (): Dynamic => {
          topmost.isOpen() && topmost.close();
        },
        0,
      )
    : (event?.preventDefault(), topmost.close());
  return true;
}
function useMenuInnerOverlay(): Dynamic {
  let value: Dynamic = (0, reactSheetsScrollArea_4.useRef)(null),
    menuTrigger: Dynamic = (0, reactSheetsScrollArea_4.useContext)(
      MenuTriggerContext,
    );
  useInnerOverlayRegistration({
    isOpen: (): Dynamic =>
      menuTrigger !== null && value.current?.hasAttribute("data-open") === true,
    close: (): Dynamic => menuTrigger?.current?.close?.(),
  });
  return {
    elementRef: value,
    overlayAttrs: SheetsScrollAreaSAConfig,
  };
}
export {
  closeInnerOverlayOnEscape,
  connectedRefElement,
  createInnerOverlayStack,
  initializeOverlayAttributes,
  initializeSheetsScrollArea,
  initializeSheetsScrollArea_2,
  initializeSheetsScrollArea_3,
  initializeSheetsScrollArea_4,
  initializeSheetsScrollArea_5,
  initializeSheetsScrollArea_6,
  initializeSheetsScrollArea_7,
  initializeSheetsScrollArea_8,
  InnerOverlaysContext,
  isFocusableElement,
  isKeyboardContextMenu,
  jsxSheetsScrollArea,
  normalizeFocusRelatedTarget,
  openerReturnChain,
  openOverlaySelector,
  overlayAttribute,
  reactSheetsScrollArea,
  reactSheetsScrollArea_2,
  reactSheetsScrollArea_3,
  reactSheetsScrollArea_4,
  recordKeyboardContextMenu,
  registerOpenerReturn,
  restoreElementFocus,
  SheetsScrollAreaClassNames,
  SheetsScrollAreaClassNames_2,
  SheetsScrollAreaClassNames_3,
  SheetsScrollAreaClassNames_4,
  SheetsScrollAreaConstant,
  SheetsScrollAreaElementCache,
  SheetsScrollAreaElementCache_2,
  SheetsScrollAreaLabel,
  editableElementSelector as SheetsScrollAreaLabel_2,
  SheetsScrollAreaLimit,
  SheetsScrollAreaRegistry,
  SheetsScrollAreaRegistry_2,
  SheetsScrollAreaRegistry_3,
  SheetsScrollAreaRegistry_4,
  SheetsScrollAreaSAConfig,
  useFinalFocus,
  useInitialFocusGuard,
  useInnerOverlayRegistration,
  useKeyboardContextMenuFocus,
  useMenuInnerOverlay,
  useOpenerReturn,
};
export function installCdsSheetsScrollArea(): () => void {
  return () => {
    initializeSheetsScrollArea = initializeOnce((): Dynamic => {
      initializeClassNames();
      initializeSheetsPresentation();
      initializeNpm_clsx_xh();
      jsxSheetsScrollArea = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      SheetsScrollAreaClassNames =
        "min-h-0 overflow-y-auto scroll-fade-y rounded-[inherit] border-b-[length:var(--cds-ring-inner)] border-transparent p-1";
      SheetsScrollAreaClassNames_2 =
        "min-h-0 flex-1 overflow-y-auto scroll-fade-y border-b-[length:var(--cds-ring-inner)] border-transparent p-1";
      SheetsScrollAreaClassNames_3 = "shrink-0 px-1 pt-1";
      SheetsScrollAreaClassNames_4 = "-mt-1 shrink-0 px-1 pb-1";
      SheetsScrollAreaLabel =
        "max(var(--cds-h-control), var(--cds-leading-body))";
    });
    initializeSheetsScrollArea_2 = initializeOnce((): Dynamic => {
      "use client";

      initializeMenuConfiguration();
      reactSheetsScrollArea = toModuleNamespace(
        load_react(),
      );
      SheetsScrollAreaElementCache = new WeakMap();
    });
    initializeSheetsScrollArea_3 = initializeOnce((): Dynamic => {
      editableElementSelector =
        "input:not([type='hidden']):not([disabled]),[contenteditable]:not([contenteditable='false']),textarea:not([disabled])";
    });
    initializeSheetsScrollArea_4 = initializeOnce((): Dynamic => {
      initializeHooksStableCallback();
    });
    initializeSheetsScrollArea_5 = initializeOnce((): Dynamic => {
      SheetsScrollAreaElementCache_2 = new WeakMap();
      SheetsScrollAreaLimit = 8;
    });
    initializeSheetsScrollArea_6 = initializeOnce((): Dynamic => {
      initializeCdsRoot();
      initializeHooksStableCallback();
      initializeSheetsScrollArea_3();
      initializeSheetsScrollArea_4();
      initializeSheetsScrollArea_5();
      reactSheetsScrollArea_2 = toModuleNamespace(
        load_react(),
      );
    });
    initializeOverlayAttributes = initializeOnce((): Dynamic => {
      overlayAttribute = "data-cds-overlay";
      openOverlaySelector = `[${overlayAttribute}][data-open]`;
    });
    initializeSheetsScrollArea_7 = initializeOnce((): Dynamic => {
      "use client";

      reactSheetsScrollArea_3 = toModuleNamespace(
        load_react(),
      );
      InnerOverlaysContext = (0, reactSheetsScrollArea_3.createContext)(null);
      SheetsScrollAreaConstant = 9;
    });
    initializeSheetsScrollArea_8 = initializeOnce((): Dynamic => {
      "use client";

      initializeOverlayAttributes();
      initializeMenuConfiguration();
      initializeSheetsScrollArea_7();
      reactSheetsScrollArea_4 = toModuleNamespace(
        load_react(),
      );
      SheetsScrollAreaSAConfig = {
        [overlayAttribute]: "",
      };
    });
    SheetsScrollAreaRegistry = {};
    SheetsScrollAreaRegistry_2 = {};
    SheetsScrollAreaRegistry_3 = {};
    SheetsScrollAreaRegistry_4 = {};
  };
}
