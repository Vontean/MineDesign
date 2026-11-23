import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { PopoverPopoverRootTriggerPopupConfig } from "../../cds/popover/popover";
import { load_react_jsx_runtime } from "../../dependencies";
import { blurPopoverTextInput, choosePopoverPlacement, ChromeFocusConstant, ChromeFocusContext, reactChromeFocus, reactDomChromeFocus } from "./focus";
import { ChromeMenuItemTarget, getFocusableElements, isBaseUiFocusGuard } from "./menu-item";
import { hasOpenCdsOverlay, joinClassNames, openCdsOverlaySelector, undoStepOverlayProps } from "./overlay-state";
import { reactForEditorPopover } from "./theme";
import { toModuleNamespace } from "../../module-helpers";

var jsxChromePopover: Dynamic;
var ChromePopoverItems: Dynamic;
function usePopoverDismissal({ onClose: onClose }: Dynamic): Dynamic {
  let latestOnCloseRef: Dynamic = (0, reactChromeFocus.useRef)(onClose);
  latestOnCloseRef.current = onClose;
  let scrimRef: Dynamic = (0, reactChromeFocus.useRef)(null),
    isPointerPressedRef: Dynamic = (0, reactChromeFocus.useRef)(false),
    [isDragging, setIsDragging]: Dynamic = (0, reactChromeFocus.useState)(false),
    isDraggingRef: Dynamic = (0, reactChromeFocus.useRef)(false);
  (0, reactChromeFocus.useEffect)((): Dynamic => {
    let handleDragStart: Dynamic = (): Dynamic => {
        isDraggingRef.current = true;
        scrimRef.current && (scrimRef.current.style.pointerEvents = "none");
        setIsDragging(true);
      },
      handleDragEnd: Dynamic = (): Dynamic => {
        isDraggingRef.current = false;
        scrimRef.current && (scrimRef.current.style.pointerEvents = "");
        setIsDragging(false);
      };
    (document as Dynamic).addEventListener("dragstart", handleDragStart, true);
    (document as Dynamic).addEventListener("dragend", handleDragEnd, true);
    (document as Dynamic).addEventListener("drop", handleDragEnd, true);
    let current: Dynamic = scrimRef.current,
      handleWheel: Dynamic = (event?: Dynamic): Dynamic => {
        event.preventDefault();
        if (!current) return;
        current.style.pointerEvents = "none";
        blurPopoverTextInput();
        latestOnCloseRef.current();
        let elementUnderPointer: Dynamic = (document as Dynamic).elementFromPoint?.(
          event.clientX,
          event.clientY,
        );
        elementUnderPointer &&
          elementUnderPointer !== current &&
          elementUnderPointer.dispatchEvent(new WheelEvent("wheel", event));
      },
      handleGesture: Dynamic = (event?: Dynamic): Dynamic => {
        event.preventDefault();
        current && (current.style.pointerEvents = "none");
        blurPopoverTextInput();
        latestOnCloseRef.current();
      };
    current?.addEventListener("wheel", handleWheel, {
      passive: false,
    });
    current?.addEventListener("gesturestart", handleGesture, {
      passive: false,
    });
    current?.addEventListener("gesturechange", handleGesture, {
      passive: false,
    });
    return (): Dynamic => {
      (document as Dynamic).removeEventListener("dragstart", handleDragStart, true);
      (document as Dynamic).removeEventListener("dragend", handleDragEnd, true);
      (document as Dynamic).removeEventListener("drop", handleDragEnd, true);
      current?.removeEventListener("wheel", handleWheel);
      current?.removeEventListener("gesturestart", handleGesture);
      current?.removeEventListener("gesturechange", handleGesture);
    };
  }, []);
  return (0, reactDomChromeFocus.createPortal)(
    <div
      ref={scrimRef}
      data-mc-scrim={""}
      aria-hidden={"true"}
      className={"fixed inset-0 z-scrim"}
      style={{
        pointerEvents: isDragging ? "none" : undefined,
      }}
      onPointerDown={(event?: Dynamic): Dynamic => {
        event.preventDefault();
        event.stopPropagation();
        blurPopoverTextInput();
        event.button === 0
          ? (isPointerPressedRef.current = true)
          : ((event.currentTarget.style.pointerEvents = "none"), onClose());
      }}
      onPointerCancel={(): Dynamic => {
        isPointerPressedRef.current && ((isPointerPressedRef.current = false), onClose());
      }}
      onClick={(event?: Dynamic): Dynamic => {
        event.stopPropagation();
        isPointerPressedRef.current && ((isPointerPressedRef.current = false), onClose());
      }}
      onContextMenu={(event?: Dynamic): Dynamic => {
        event.preventDefault();
        event.stopPropagation();
        blurPopoverTextInput();
        onClose();
      }}
      onDragEnter={(): Dynamic => {
        isDraggingRef.current || (blurPopoverTextInput(), onClose());
      }}
    />,
    (document as Dynamic).body,
  );
}
function suppressEscapeRelease(isEnterInitiallyDown?: Dynamic): Dynamic {
  let isEnterDown: Dynamic = isEnterInitiallyDown,
    isEnterRepeating: Dynamic = false,
    isReleaseRequested: Dynamic = false,
    removeListeners: Dynamic = (): Dynamic => {
      (window as Dynamic).removeEventListener("keydown", handleEnterKey, true);
      (window as Dynamic).removeEventListener("keyup", handleEnterKey, true);
      (window as Dynamic).removeEventListener("click", handleClick, true);
      (window as Dynamic).removeEventListener("blur", handleBlur);
    },
    handleEnterKey: Dynamic = (keyEvent?: Dynamic): Dynamic => {
      keyEvent.key === "Enter" &&
        ((isEnterDown = keyEvent.type === "keydown"),
        (isEnterRepeating = isEnterDown && keyEvent.repeat),
        isReleaseRequested && !isEnterRepeating && removeListeners());
    },
    handleBlur: Dynamic = (): Dynamic => {
      isEnterDown = isEnterRepeating = false;
      isReleaseRequested && removeListeners();
    },
    handleClick: Dynamic = (event?: Dynamic): Dynamic => {
      !isEnterRepeating ||
        event.detail !== 0 ||
        (event.preventDefault(), event.stopPropagation());
    };
  (window as Dynamic).addEventListener("keydown", handleEnterKey, true);
  (window as Dynamic).addEventListener("keyup", handleEnterKey, true);
  (window as Dynamic).addEventListener("click", handleClick, true);
  (window as Dynamic).addEventListener("blur", handleBlur);
  return (): Dynamic => {
    isReleaseRequested = true;
    isEnterDown || removeListeners();
  };
}
function useEscapeReleaseSuppression(isActive?: Dynamic): Dynamic {
  (0, reactForEditorPopover.useEffect)(
    (): Dynamic => (isActive ? suppressEscapeRelease(false) : undefined),
    [isActive],
  );
}
function clearEscapeReleaseSuppression(): Dynamic {
  suppressEscapeRelease(true)();
}
function EditorPopover({
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
}: Dynamic): Dynamic {
  useUiLocale();
  let popupRef: Dynamic = (0, reactForEditorPopover.useRef)(null);
  useEscapeReleaseSuppression(open && focusOnOpen);
  let anchorMarkerRef: Dynamic = (0, reactForEditorPopover.useRef)(null),
    focusContextSide: Dynamic = (0, reactForEditorPopover.useContext)(
      ChromeFocusContext,
    ),
    contextSide: Dynamic = side === undefined ? focusContextSide : undefined,
    resolvedSide: Dynamic = side ?? contextSide ?? "bottom",
    isVerticalSide: Dynamic = resolvedSide === "bottom" || resolvedSide === "top",
    [placement, setPlacement]: Dynamic = (0, reactForEditorPopover.useState)({
      side: isVerticalSide ? resolvedSide : "bottom",
      maxHeight: undefined,
    });
  (0, reactForEditorPopover.useLayoutEffect)((): Dynamic => {
    open &&
      setPlacement(
        isVerticalSide && planHeight !== undefined
          ? choosePopoverPlacement(
              positionAnchor?.() ?? anchorMarkerRef.current?.parentElement,
              planHeight,
              resolvedSide,
              contextSide !== undefined ? ChromeFocusConstant : undefined,
            )
          : {
              side: isVerticalSide ? resolvedSide : "bottom",
              maxHeight: undefined,
            },
      );
  }, [open]);
  let shouldLimitHeight: Dynamic = isVerticalSide && planHeight !== undefined,
    popupSide: Dynamic = isVerticalSide ? placement.side : resolvedSide,
    onCloseRef: Dynamic = (0, reactForEditorPopover.useRef)(onClose);
  onCloseRef.current = onClose;
  let onOpenRef: Dynamic = (0, reactForEditorPopover.useRef)(onOpen);
  onOpenRef.current = onOpen;
  let hasClosedRef: Dynamic = (0, reactForEditorPopover.useRef)(false);
  (0, reactForEditorPopover.useEffect)((): Dynamic => {
    if (!open) return;
    hasClosedRef.current = false;
    let popoverToken: Dynamic = Symbol("popover");
    ChromePopoverItems.push(popoverToken);
    let isTopmostPopover: Dynamic = (): Dynamic =>
        ChromePopoverItems[ChromePopoverItems.length - 1] === popoverToken,
      handlePointerDownOutside: Dynamic = (event?: Dynamic): Dynamic => {
        if (!isTopmostPopover()) return;
        let target: Dynamic = event.target;
        if (
          (target instanceof Element &&
            target.hasAttribute("data-mc-scrim")) ||
          hasOpenCdsOverlay() ||
          (target instanceof Element &&
            target.closest(openCdsOverlaySelector) !== null)
        )
          return;
        let isInsideAnchorParent: Dynamic =
            anchorMarkerRef.current?.parentElement?.contains(target) ?? false,
          isInsidePopup: Dynamic = popupRef.current?.contains(target) ?? false;
        !isInsideAnchorParent && !isInsidePopup && onCloseRef.current();
      },
      handleStripPointerDown: Dynamic = (event?: Dynamic): Dynamic => {
        let target: Dynamic = event.target;
        target instanceof Element &&
          target.closest("[data-mc-strip]") !== null &&
          handlePointerDownOutside(event);
      },
      handleWindowKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
        event.defaultPrevented ||
          !isTopmostPopover() ||
          hasOpenCdsOverlay() ||
          (event.key === "Escape" &&
            (event.preventDefault(), onCloseRef.current()));
      },
      handleEscapeCapture: Dynamic = (event?: Dynamic): Dynamic => {
        if (
          event.key !== "Escape" ||
          event.defaultPrevented ||
          event.isComposing ||
          !isTopmostPopover() ||
          hasOpenCdsOverlay()
        )
          return;
        let target: Dynamic = event.target;
        (target &&
          (popupRef.current?.contains(target) ||
            target.closest("[data-mc-popover]") !== null) &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable)) ||
          (event.preventDefault(),
          event.stopPropagation(),
          onCloseRef.current());
      };
    (document as Dynamic).addEventListener("pointerdown", handlePointerDownOutside);
    (document as Dynamic).addEventListener("pointerdown", handleStripPointerDown, {
      capture: true,
    });
    (window as Dynamic).addEventListener("keydown", handleWindowKeyDown);
    (window as Dynamic).addEventListener("keydown", handleEscapeCapture, {
      capture: true,
    });
    return (): Dynamic => {
      let tokenIndex: Dynamic = ChromePopoverItems.indexOf(popoverToken);
      tokenIndex >= 0 && ChromePopoverItems.splice(tokenIndex, 1);
      (document as Dynamic).removeEventListener("pointerdown", handlePointerDownOutside);
      (document as Dynamic).removeEventListener("pointerdown", handleStripPointerDown, {
        capture: true,
      });
      (window as Dynamic).removeEventListener("keydown", handleWindowKeyDown);
      (window as Dynamic).removeEventListener("keydown", handleEscapeCapture, {
        capture: true,
      });
    };
  }, [open]);
  return (
    <jsxChromePopover.Fragment>
      <span ref={anchorMarkerRef} className={"hidden"} aria-hidden={"true"} />
      {open ? ((() => {
            const _Component = usePopoverDismissal;
            return <_Component onClose={(): Dynamic => onCloseRef.current()} />;
          })()) : (null)}
      <PopoverPopoverRootTriggerPopupConfig.Root
        open={open}
        onOpenChange={(isOpening?: Dynamic, changeDetails?: Dynamic): Dynamic => {
          if (isOpening) {
            onOpenRef.current?.();
            return;
          }
          if (changeDetails.reason === "escape-key") {
            changeDetails.event.defaultPrevented ||
              (changeDetails.event.preventDefault(),
              hasClosedRef.current || onCloseRef.current(),
              (hasClosedRef.current = true));
            changeDetails.cancel();
            return;
          }
          if (
            changeDetails.reason === "trigger-press" ||
            changeDetails.reason === "imperative-action" ||
            changeDetails.reason === "close-press" ||
            (changeDetails.reason === "focus-out" &&
              isBaseUiFocusGuard(changeDetails))
          ) {
            hasClosedRef.current || onCloseRef.current();
            hasClosedRef.current = true;
            return;
          }
          changeDetails.cancel();
        }}
      >
        {trigger !== undefined ? (<PopoverPopoverRootTriggerPopupConfig.Trigger
            render={trigger}
          />) : (null)}
        <PopoverPopoverRootTriggerPopupConfig.Popup
          ref={popupRef}
          aria-label={ariaLabel}
          anchor={(): Dynamic =>
            positionAnchor?.() ?? anchorMarkerRef.current?.parentElement ?? null
          }
          side={popupSide}
          align={!isVerticalSide || align === "left" ? "start" : "end"}
          sideOffset={resolvedSide === "right" ? 12 : resolvedSide === "left" ? 8 : 4}
          style={
            shouldLimitHeight && placement.maxHeight !== undefined
              ? {
                  maxHeight: `min(${placement.maxHeight}px, var(--available-height))`,
                }
              : undefined
          }
          padding={"none"}
          initialFocus={focusOnOpen ? initialFocus : false}
          finalFocus={
            focusOnOpen ? (trigger !== undefined ? true : undefined) : false
          }
          onKeyDown={
            focusOnOpen && trigger === undefined
              ? (event?: Dynamic): Dynamic => {
                  if (event.key !== "Tab") return;
                  let current: Dynamic = popupRef.current;
                  if (
                    !current ||
                    !current.contains((document as Dynamic).activeElement)
                  )
                    return;
                  let focusableElements: Dynamic = getFocusableElements(
                    current,
                  );
                  if (focusableElements.length === 0) return;
                  let firstFocusable: Dynamic = focusableElements[0],
                    lastFocusable: Dynamic = focusableElements[focusableElements.length - 1];
                  event.shiftKey &&
                  (document as Dynamic).activeElement === firstFocusable
                    ? (event.preventDefault(), lastFocusable?.focus())
                    : !event.shiftKey &&
                      (document as Dynamic).activeElement === lastFocusable &&
                      (event.preventDefault(), firstFocusable?.focus());
                }
              : undefined
          }
          data-mc-popover={""}
          {...(editsAreUndoSteps ? undoStepOverlayProps : {})}
        >
          <div
            {...popupAttrs}
            className={joinClassNames(
              "min-w-48",
              padding === "none" ? undefined : "p-1",
              className,
            )}
            onMouseDown={keepFocus ? ChromeMenuItemTarget : undefined}
          >
            <ChromeFocusContext.Provider value={undefined}>
              {children}
            </ChromeFocusContext.Provider>
          </div>
        </PopoverPopoverRootTriggerPopupConfig.Popup>
      </PopoverPopoverRootTriggerPopupConfig.Root>
    </jsxChromePopover.Fragment>
  );
}
export {
  ChromePopoverItems,
  clearEscapeReleaseSuppression,
  EditorPopover,
  jsxChromePopover,
  suppressEscapeRelease,
  useEscapeReleaseSuppression,
  usePopoverDismissal,
};
export function installEditorChromePopover(): () => void {
  return () => {
    jsxChromePopover = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    ChromePopoverItems = [];
  };
}
