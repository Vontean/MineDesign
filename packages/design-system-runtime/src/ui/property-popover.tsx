import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type {
  ReactNamespace,
  JsxNamespace,
  PropertyPopupProps,
  PropertyPopupChangeDetails,
  PopoverPlacement,
} from "../contracts/composition";
import { loadJsxNamespace, loadReactDomNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { MENU_POPOVER_OPEN_SELECTORS } from "../platform/frame-chrome";
import { PopoverComponents } from "./popover";
import { anyMenuOrPopoverOpen, choosePopoverSide, pendingPopupFocusReturn, popupFocusReturnTimer, TEXT_EDITABLE_SELECTOR, ToolbarTooltipSideContext } from "./property-focus";
import { joinClassNames } from "./property-icons";

var reactPropertyPopup: ReactNamespace;
var reactForUiPropertyPopover: ReactNamespace;
var reactDOMForUiPropertyPopover: typeof import("react-dom");
var jsxForUiPropertyPopover: JsxNamespace;
var CanvasEditorJsx: JsxNamespace;
var EMPTY_EDITOR_TOOL_OPTIONS: symbol[];
var preservePopupSelection: React.MouseEventHandler<HTMLElement>;
function blurActivePopupEditor() {
  let activeElement = document.activeElement as HTMLElement | null;
  if (!activeElement?.closest("[data-mc-popover], [data-mc-menu]")) {
    return;
  }
  if (
    activeElement.tagName === "INPUT" ||
    activeElement.tagName === "TEXTAREA" ||
    activeElement.isContentEditable
  ) {
    activeElement.blur();
  }
}
function PopupScrim({ onClose: onClose }: { onClose(): void }) {
  useUiLocale();
  let ref = reactForUiPropertyPopover.useRef(onClose);
  ref.current = onClose;
  let scrimRef = reactForUiPropertyPopover.useRef<HTMLDivElement | null>(null),
    pointerDownRef = reactForUiPropertyPopover.useRef(false),
    [value, setIsDragging] = reactForUiPropertyPopover.useState(false),
    isDraggingRef = reactForUiPropertyPopover.useRef(false);
  reactForUiPropertyPopover.useEffect(() => {
    let callback = () => {
        isDraggingRef.current = true;
        if (scrimRef.current) {
          scrimRef.current.style.pointerEvents = "none";
        }
        setIsDragging(true);
      },
      restoreScrim = () => {
        isDraggingRef.current = false;
        if (scrimRef.current) {
          scrimRef.current.style.pointerEvents = "";
        }
        setIsDragging(false);
      };
    document.addEventListener("dragstart", callback, true);
    document.addEventListener("dragend", restoreScrim, true);
    document.addEventListener("drop", restoreScrim, true);
    let current = scrimRef.current,
      dismissAndForwardWheel = (event: WheelEvent) => {
        event.preventDefault();
        if (!current) {
          return;
        }
        current.style.pointerEvents = "none";
        blurActivePopupEditor();
        ref.current();
        let elementUnderScrim = document.elementFromPoint?.(
          event.clientX,
          event.clientY,
        );
        if (elementUnderScrim && elementUnderScrim !== current) {
          elementUnderScrim.dispatchEvent(new WheelEvent("wheel", event));
        }
      },
      dismissOnGesture = (event: Event) => {
        event.preventDefault();
        if (current) {
          current.style.pointerEvents = "none";
        }
        blurActivePopupEditor();
        ref.current();
      };
    current?.addEventListener("wheel", dismissAndForwardWheel, {
      passive: false,
    });
    current?.addEventListener("gesturestart", dismissOnGesture, {
      passive: false,
    });
    current?.addEventListener("gesturechange", dismissOnGesture, {
      passive: false,
    });
    return () => {
      document.removeEventListener("dragstart", callback, true);
      document.removeEventListener("dragend", restoreScrim, true);
      document.removeEventListener("drop", restoreScrim, true);
      current?.removeEventListener("wheel", dismissAndForwardWheel);
      current?.removeEventListener("gesturestart", dismissOnGesture);
      current?.removeEventListener("gesturechange", dismissOnGesture);
    };
  }, []);
  return reactDOMForUiPropertyPopover.createPortal(
    <div
      ref={scrimRef}
      data-mc-scrim={""}
      aria-hidden={"true"}
      className={"fixed inset-0 z-scrim"}
      style={{
        pointerEvents: value ? "none" : undefined,
      }}
      onPointerDown={(event: React.PointerEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        blurActivePopupEditor();
        if (event.button === 0) {
          pointerDownRef.current = true;
        } else {
          event.currentTarget.style.pointerEvents = "none";
          onClose();
        }
      }}
      onPointerCancel={() => {
        if (!pointerDownRef.current) {
          return;
        }
        pointerDownRef.current = false;
        onClose();
      }}
      onClick={(mouseEvent: React.MouseEvent<HTMLDivElement>) => {
        mouseEvent.stopPropagation();
        if (!pointerDownRef.current) {
          return;
        }
        pointerDownRef.current = false;
        onClose();
      }}
      onContextMenu={(event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        event.stopPropagation();
        blurActivePopupEditor();
        onClose();
      }}
      onDragEnter={() => {
        if (isDraggingRef.current) {
          return;
        }
        blurActivePopupEditor();
        onClose();
      }}
    />,
    document.body,
  );
}
function suppressRepeatedEnterClicks(isEnterInitiallyDown: boolean) {
  let value = isEnterInitiallyDown,
    flag = false,
    teardownRequested = false,
    callback = () => {
      window.removeEventListener("keydown", trackEnterKey, true);
      window.removeEventListener("keyup", trackEnterKey, true);
      window.removeEventListener("click", blockRepeatedClick, true);
      window.removeEventListener("blur", resetOnBlur);
    },
    trackEnterKey = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key !== "Enter") {
        return;
      }
      value = keyEvent.type === "keydown";
      flag = value && keyEvent.repeat;
      if (teardownRequested && !flag) {
        callback();
      }
    },
    resetOnBlur = () => {
      value = flag = false;
      if (teardownRequested) {
        callback();
      }
    },
    blockRepeatedClick = (event: MouseEvent) => {
      if (!flag || event.detail !== 0) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
    };
  window.addEventListener("keydown", trackEnterKey, true);
  window.addEventListener("keyup", trackEnterKey, true);
  window.addEventListener("click", blockRepeatedClick, true);
  window.addEventListener("blur", resetOnBlur);
  return () => {
    teardownRequested = true;
    if (!value) {
      callback();
    }
  };
}
function usePopupOpenFocus(isActive: boolean) {
  reactPropertyPopup.useEffect(
    () => (isActive ? suppressRepeatedEnterClicks(false) : undefined),
    [isActive],
  );
}
function suppressEnterClicksUntilRelease() {
  suppressRepeatedEnterClicks(true)();
}
function PropertyPopup({
  open: open,
  onClose: onClose,
  trigger: trigger,
  onOpen: onOpen,
  children: children,
  align = "right",
  side: side,
  planHeight: planHeight,
  positionAnchor: positionAnchor,
  popupAttrs: popupAttrs,
  editsAreUndoSteps = false,
  padding = "default",
  className: className,
  "aria-label": ariaLabel,
  focusOnOpen = false,
  initialFocus: initialFocus,
  keepFocus = false,
}: PropertyPopupProps) {
  useUiLocale();
  let ref = reactPropertyPopup.useRef<HTMLDivElement | null>(null);
  usePopupOpenFocus(open && focusOnOpen);
  let anchorMarkerRef = reactPropertyPopup.useRef<HTMLSpanElement | null>(null),
    value = reactPropertyPopup.useContext(
      ToolbarTooltipSideContext as React.Context<
        "top" | "bottom" | undefined
      >,
    ),
    inheritedSide = side === undefined ? value : undefined,
    preferredSide = side ?? inheritedSide ?? "bottom",
    isVerticalPlacement = preferredSide === "bottom" || preferredSide === "top",
    [placement, setPlacement] = reactPropertyPopup.useState<PopoverPlacement>({
      side: isVerticalPlacement ? (preferredSide as "top" | "bottom") : "bottom",
      maxHeight: undefined,
    });
  reactPropertyPopup.useLayoutEffect(() => {
    if (!open) {
      return;
    }
    setPlacement(
      isVerticalPlacement && planHeight !== undefined
        ? choosePopoverSide(
            positionAnchor?.() ?? anchorMarkerRef.current?.parentElement,
            planHeight,
            preferredSide as "top" | "bottom",
            inheritedSide !== undefined ? popupFocusReturnTimer : undefined,
          )
        : {
            side: isVerticalPlacement ? (preferredSide as "top" | "bottom") : "bottom",
            maxHeight: undefined,
          },
    );
  }, [open]);
  let useMeasuredHeight = isVerticalPlacement && planHeight !== undefined,
    resolvedSide = isVerticalPlacement ? placement.side : preferredSide,
    closeCallbackRef = reactPropertyPopup.useRef(onClose);
  closeCallbackRef.current = onClose;
  let openCallbackRef = reactPropertyPopup.useRef(onOpen);
  openCallbackRef.current = onOpen;
  let didRequestCloseRef = reactPropertyPopup.useRef(false);
  reactPropertyPopup.useEffect(() => {
    if (!open) {
      return;
    }
    didRequestCloseRef.current = false;
    let stackToken = Symbol("popover");
    EMPTY_EDITOR_TOOL_OPTIONS.push(stackToken);
    let callback = () =>
        EMPTY_EDITOR_TOOL_OPTIONS[EMPTY_EDITOR_TOOL_OPTIONS.length - 1] ===
        stackToken,
      dismissOnOutsidePointer = (event: PointerEvent) => {
        if (!callback()) {
          return;
        }
        let target = event.target as HTMLElement | null;
        if (
          target instanceof Element &&
          target.hasAttribute("data-mc-scrim")
        ) {
          return;
        }
        if (anyMenuOrPopoverOpen()) {
          return;
        }
        if (
          target instanceof Element &&
          target.closest(MENU_POPOVER_OPEN_SELECTORS) !== null
        ) {
          return;
        }
        let isInAnchor = anchorMarkerRef.current?.parentElement?.contains(target) ?? false,
          isInPopup = ref.current?.contains(target) ?? false;
        if (!isInAnchor && !isInPopup) {
          closeCallbackRef.current();
        }
      },
      dismissOnStripPointer = (event: PointerEvent) => {
        let target = event.target as HTMLElement | null;
        if (!(target instanceof Element)) {
          return;
        }
        if (target.closest("[data-mc-strip]") === null) {
          return;
        }
        dismissOnOutsidePointer(event);
      },
      dismissOnEscape = (event: KeyboardEvent) => {
        if (event.defaultPrevented || !callback()) {
          return;
        }
        if (anyMenuOrPopoverOpen()) {
          return;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          closeCallbackRef.current();
        }
      },
      captureEscapeOutsideEditors = (event: KeyboardEvent) => {
        if (
          event.key !== "Escape" ||
          event.defaultPrevented ||
          event.isComposing ||
          !callback()
        ) {
          return;
        }
        if (anyMenuOrPopoverOpen()) {
          return;
        }
        let target = event.target as HTMLElement | null;
        if (
          target &&
          (ref.current?.contains(target) ||
            target.closest("[data-mc-popover]") !== null) &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable)
        ) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        closeCallbackRef.current();
      };
    document.addEventListener("pointerdown", dismissOnOutsidePointer);
    document.addEventListener("pointerdown", dismissOnStripPointer, {
      capture: true,
    });
    window.addEventListener("keydown", dismissOnEscape);
    window.addEventListener("keydown", captureEscapeOutsideEditors, {
      capture: true,
    });
    return () => {
      let stackIndex = EMPTY_EDITOR_TOOL_OPTIONS.indexOf(stackToken);
      if (stackIndex >= 0) {
        EMPTY_EDITOR_TOOL_OPTIONS.splice(stackIndex, 1);
      }
      document.removeEventListener("pointerdown", dismissOnOutsidePointer);
      document.removeEventListener("pointerdown", dismissOnStripPointer, {
        capture: true,
      });
      window.removeEventListener("keydown", dismissOnEscape);
      window.removeEventListener("keydown", captureEscapeOutsideEditors, {
        capture: true,
      });
    };
  }, [open]);
  return (
    <CanvasEditorJsx.Fragment>
      {[<span ref={anchorMarkerRef} className={"hidden"} aria-hidden={"true"} />, open ? <PopupScrim onClose={() => closeCallbackRef.current()} /> : null, <PopoverComponents.Root
          open={open}
          onOpenChange={(
            nextOpen: boolean,
            changeDetails: PropertyPopupChangeDetails,
          ) => {
            if (nextOpen) {
              openCallbackRef.current?.();
              return;
            }
            if (changeDetails.reason === "escape-key") {
              if (!changeDetails.event!.defaultPrevented) {
                changeDetails.event!.preventDefault();
                if (!didRequestCloseRef.current) {
                  closeCallbackRef.current();
                }
                didRequestCloseRef.current = true;
              }
              changeDetails.cancel();
              return;
            }
            if (
              changeDetails.reason === "trigger-press" ||
              changeDetails.reason === "imperative-action" ||
              changeDetails.reason === "close-press" ||
              (changeDetails.reason === "focus-out" &&
                isBaseUiFocusGuardEvent(changeDetails))
            ) {
              if (!didRequestCloseRef.current) {
                closeCallbackRef.current();
              }
              didRequestCloseRef.current = true;
              return;
            }
            changeDetails.cancel();
          }}
        >
          {[trigger !== undefined ? (
              <PopoverComponents.Trigger render={trigger} />
            ) : null, <PopoverComponents.Popup
              ref={ref}
              aria-label={ariaLabel}
              anchor={() =>
                positionAnchor?.() ?? anchorMarkerRef.current?.parentElement ?? null
              }
              side={resolvedSide}
              align={!isVerticalPlacement || align === "left" ? "start" : "end"}
              sideOffset={preferredSide === "right" ? 12 : preferredSide === "left" ? 8 : 4}
              style={
                useMeasuredHeight && placement.maxHeight !== undefined
                  ? {
                      maxHeight: `min(${placement.maxHeight}px, var(--available-height))`,
                    }
                  : undefined
              }
              padding={"none"}
              initialFocus={(focusOnOpen ? initialFocus : false) as import("../contracts/overlays").BaseUIPopupFocus}
              finalFocus={
                focusOnOpen
                  ? trigger !== undefined
                    ? true
                    : undefined
                  : false
              }
              onKeyDown={
                focusOnOpen && trigger === undefined
                  ? (event: React.KeyboardEvent<HTMLElement>) => {
                      if (event.key !== "Tab") {
                        return;
                      }
                      let current = ref.current;
                      if (
                        !current ||
                        !current.contains(
                          document.activeElement as HTMLElement | null,
                        )
                      ) {
                        return;
                      }
                      let focusableElements = collectFocusableDescendants(current);
                      if (focusableElements.length === 0) {
                        return;
                      }
                      let firstFocusable = focusableElements[0],
                        lastFocusable = focusableElements[focusableElements.length - 1];
                      if (
                        event.shiftKey &&
                        (document.activeElement as HTMLElement | null) ===
                          firstFocusable
                      ) {
                        event.preventDefault();
                        lastFocusable?.focus();
                      } else if (
                        !event.shiftKey &&
                        (document.activeElement as HTMLElement | null) ===
                          lastFocusable
                      ) {
                        event.preventDefault();
                        firstFocusable?.focus();
                      }
                    }
                  : undefined
              }
              data-mc-popover={""}
              {...(editsAreUndoSteps ? pendingPopupFocusReturn : {})}
            >
              <div
                {...popupAttrs}
                className={joinClassNames(
                  "min-w-48",
                  padding === "none" ? undefined : "p-1",
                  className,
                )}
                onMouseDown={keepFocus ? preservePopupSelection : undefined}
              >
                <ToolbarTooltipSideContext.Provider value={undefined}>
                  {children}
                </ToolbarTooltipSideContext.Provider>
              </div>
            </PopoverComponents.Popup>]}
        </PopoverComponents.Root>]}
    </CanvasEditorJsx.Fragment>
  );
}
function collectFocusableDescendants(container: Element) {
  return Array.from<HTMLElement>(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(
    (element: HTMLElement) =>
      element.tabIndex >= 0 && element.closest('[aria-hidden="true"]') === null,
  );
}
function isBaseUiFocusGuardEvent(details: {
  trigger?: Element;
  event?: {
    target: EventTarget | null;
  };
}) {
  let value = details.trigger ?? details.event?.target;
  return (
    value instanceof Element && value.hasAttribute("data-base-ui-focus-guard")
  );
}
export {
  blurActivePopupEditor,
  CanvasEditorJsx,
  collectFocusableDescendants,
  EMPTY_EDITOR_TOOL_OPTIONS,
  isBaseUiFocusGuardEvent,
  jsxForUiPropertyPopover,
  PopupScrim,
  preservePopupSelection,
  PropertyPopup,
  reactDOMForUiPropertyPopover,
  reactForUiPropertyPopover,
  reactPropertyPopup as reactForUiPropertyPopover2,
  suppressEnterClicksUntilRelease,
  suppressRepeatedEnterClicks,
  usePopupOpenFocus,
};
export function installUiPropertyPopover(): () => void {
  return () => {
    reactPropertyPopup = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    reactForUiPropertyPopover = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    reactDOMForUiPropertyPopover = toModuleNamespace(
      loadReactDomNamespace(),
      1,
    );
    jsxForUiPropertyPopover = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    CanvasEditorJsx = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    EMPTY_EDITOR_TOOL_OPTIONS = [];
    preservePopupSelection = (event: React.MouseEvent<HTMLElement>) => {
      if (
        !(event.target instanceof Element) ||
        event.target.closest(TEXT_EDITABLE_SELECTOR) === null
      ) {
        event.preventDefault();
      }
    };
  };
}
