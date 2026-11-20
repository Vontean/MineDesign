import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type * as C from "../contracts/controls";
import { clsx, loadJsxNamespace, loadReactDomNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { sheetBackdropClasses, sheetFrameContext, useAndroidCloseWatcher } from "./foundation";
import { initializeClassNames, initializeIcons, PortalRoot, useDefaultOverlayLayer } from "./interactions";
import { usePortalContainer, useRootWindow } from "./overlays";

var reactiZ: typeof React;
var jsxZu: typeof import("react/jsx-runtime");
var reactDOMForUiTextInputOverlay: typeof import("react-dom");
var SHEET_PENDING_ATTRIBUTE: string;
var concealedPopupStyle: React.CSSProperties;
var preventPendingSheetFocus: (event: Pick<Event, "preventDefault">) => void;
var COMPOSITION_TIME_SENTINEL: number;
var lastCompositionEndTime: number;
var suppressedCompositionEvents: WeakSet<Event>;
var compositionLineBreakInputTypes: Set<string>;
var compositionSuppressionResetEvents: string[];
function useRefocusAfterPendingSheet(isPending: boolean) {
  let ref = reactiZ.useRef<HTMLElement>(null),
    wasPendingRef = reactiZ.useRef(isPending);
  reactiZ.useEffect(() => {
    if (wasPendingRef.current && !isPending) {
      ref.current?.focus({
        preventScroll: true,
      });
    }
    wasPendingRef.current = isPending;
  }, [isPending]);
  return reactiZ.useCallback((element: HTMLElement | null) => {
    ref.current = element;
  }, []);
}
function PendingSheetBackdrop({ kind: kind }: { kind: C.OverlayKind }) {
  useUiLocale();
  let value = reactiZ.useContext<
      import("../contracts/overlays").SheetFrameContext | null
    >(sheetFrameContext),
    portalContainer: Element | ShadowRoot | null | undefined = usePortalContainer(),
    overlayLayer: {
      portalProps: React.HTMLAttributes<HTMLElement>;
      style: C.DesignStyle;
    } = useDefaultOverlayLayer(kind);
  useAndroidCloseWatcher(value?.open ?? false, value?.dismiss);
  let [isVisible, setIsVisible] = reactiZ.useState(false),
    ref = reactiZ.useRef(false),
    rootWindow: Window | undefined = useRootWindow();
  reactiZ.useEffect(() => {
    if (rootWindow === undefined) {
      return;
    }
    let showFrame = rootWindow.requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => {
      rootWindow.cancelAnimationFrame(showFrame);
    };
  }, [rootWindow]);
  let backdropContainer =
    portalContainer ?? (typeof document === "undefined" ? null : document.body);
  if (backdropContainer === null || value === null || !value.open) {
    return null;
  }
  return reactDOMForUiTextInputOverlay.createPortal(
    <PortalRoot {...overlayLayer.portalProps}>
      <div
        role={"presentation"}
        {...{
          [SHEET_PENDING_ATTRIBUTE]: "",
        }}
        className={clsx(
          sheetBackdropClasses,
          !isVisible && "opacity-0",
        )}
        style={overlayLayer.style}
        onPointerDown={(pointerEvent: React.PointerEvent<HTMLDivElement>) => {
          ref.current = true;
          preventPendingSheetFocus(pointerEvent);
        }}
        onPointerCancel={() => {
          ref.current = false;
        }}
        onMouseDown={preventPendingSheetFocus}
        onClick={() => {
          if (!ref.current) {
            return;
          }
          ref.current = false;
          value.dismiss();
        }}
      />
    </PortalRoot>,
    backdropContainer,
  );
}
function isAppleBrowser() {
  if (typeof window === "undefined") {
    return false;
  }
  return /Apple Computer/.test(window.navigator.vendor);
}
function recordCompositionEnd(timestamp: number): void {
  lastCompositionEndTime = timestamp;
}
function resetCompositionSuppression(
  event: C.CompositionKeyboardEvent,
): void {
  if (
    event.key !== "Enter" ||
    event.shiftKey ||
    event.altKey ||
    event.keyCode === 229 ||
    event.isComposing === true ||
    event.nativeEvent?.isComposing === true
  ) {
    lastCompositionEndTime = COMPOSITION_TIME_SENTINEL;
  }
}
function shouldSuppressCompositionEnter(
  keyEvent: C.CompositionEnterEvent,
): boolean {
  if (keyEvent.isComposing || keyEvent.keyCode === 229) {
    lastCompositionEndTime = COMPOSITION_TIME_SENTINEL;
    return true;
  }
  if (suppressedCompositionEvents.has(keyEvent)) {
    return true;
  }
  if (
    isAppleBrowser() &&
    Math.abs(keyEvent.timeStamp - lastCompositionEndTime) < 500
  ) {
    lastCompositionEndTime = COMPOSITION_TIME_SENTINEL;
    if (keyEvent.metaKey || keyEvent.ctrlKey) {
      return false;
    }
    suppressedCompositionEvents.add(keyEvent);
    return true;
  }
  return false;
}
function suppressFollowupCompositionLineBreak(
  compositionEvent: Event,
  target: EventTarget,
  onSuppressedLineBreak: () => void,
) {
  if (!suppressedCompositionEvents.has(compositionEvent)) {
    return;
  }
  let value = compositionEvent,
    callback = (event: Event) => {
      if (event === value) {
        return;
      }
      for (let eventName of compositionSuppressionResetEvents) {
        target.removeEventListener(eventName, callback, {
          capture: true,
        });
      }
      if (
        event.type === "beforeinput" &&
        "inputType" in event &&
        typeof event.inputType === "string" &&
        compositionLineBreakInputTypes.has(event.inputType)
      ) {
        event.preventDefault();
        onSuppressedLineBreak();
      }
    };
  for (let eventName of compositionSuppressionResetEvents) {
    target.addEventListener(eventName, callback, {
      capture: true,
    });
  }
}
export {
  COMPOSITION_TIME_SENTINEL,
  compositionLineBreakInputTypes,
  compositionSuppressionResetEvents,
  concealedPopupStyle,
  isAppleBrowser,
  jsxZu,
  lastCompositionEndTime,
  PendingSheetBackdrop,
  preventPendingSheetFocus,
  reactDOMForUiTextInputOverlay,
  reactiZ,
  recordCompositionEnd,
  resetCompositionSuppression,
  SHEET_PENDING_ATTRIBUTE,
  shouldSuppressCompositionEnter,
  suppressedCompositionEvents,
  suppressFollowupCompositionLineBreak,
  useRefocusAfterPendingSheet,
};
export function installUiTextInputOverlay(): () => void {
  return () => {
    reactiZ = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxZu = toModuleNamespace(loadJsxNamespace(), 1);
    reactDOMForUiTextInputOverlay = toModuleNamespace(
      loadReactDomNamespace(),
      1,
    );
    SHEET_PENDING_ATTRIBUTE = "data-cds-sheet-pending";
    concealedPopupStyle = {
      visibility: "hidden",
      opacity: 0,
    };
    preventPendingSheetFocus = (event: Pick<Event, "preventDefault">) => {
      event.preventDefault();
    };
    COMPOSITION_TIME_SENTINEL = -1e8;
    lastCompositionEndTime = COMPOSITION_TIME_SENTINEL;
    suppressedCompositionEvents = new WeakSet();
    compositionLineBreakInputTypes = new Set([
      "insertParagraph",
      "insertLineBreak",
    ]);
    compositionSuppressionResetEvents = [
      "beforeinput",
      "keydown",
      "keyup",
      "compositionstart",
      "focusout",
    ];
    initializeClassNames();
    initializeIcons();
  };
}
