import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
import type {
  ClickToFocusOptions,
  CollisionPadding,
  FocusableElement,
  ForwardComponent,
  InitialPopupFocus,
  MenuChange,
  MenuPopupProps,
  PassiveGateProps,
  PassiveOpenCell,
  PassiveOpenGateState,
  PassiveOpenLevel,
  PassivePopupProps,
  PopupFocus,
  PopupInputKind,
} from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { CollisionPaddingProvider, initializeComponentsIcon_3, popupSurfaceClassName } from "../components/icon";
import { initializeDomRefComposition, useMergedRefs } from "../dom/ref-composition";
import { asElement, initializeHooksStableCallback, initializeHooksStableCallback_2, useOptionalStableCallback } from "../hooks/stable-callback";
import { PopupScrollArea } from "./configuration";
import { FocusOutValue, MenuPassiveOpenGateArrowDownArrowUpHomeSet, MenuPassiveOpenGateDefaultText, MenuPassiveOpenGateHandler, MenuPassiveOpenGateHandler_2, MenuPassiveOpenGateRegistry, MenuPassiveOpenGateSubscribers, MenuPassiveOpenGateTabIndexConfig, PassiveOpenCellContext, PassiveOpenDisabledContext, reactDomMenuPassiveOpenGate, reactMenuPassiveOpenGate, TriggerHoverValue } from "./passive-open-gate";
import { initializeOverlaysLayers, LayerBaseContext, useDefaultLayer } from "../overlays/layers";
import { initializePlatformRootFontSize_2, PopupSurface } from "../platform/root-font-size";
import { initializeSheetsKeyboardViewport, isTextInputElement } from "../sheets/keyboard-viewport";
import { initializeSheetsPopupStack, ResetSheetContext } from "../sheets/popup-stack";
import { initializeSheetsScrollArea, initializeSheetsScrollArea_2, initializeSheetsScrollArea_3, initializeSheetsScrollArea_6, initializeSheetsScrollArea_8, normalizeFocusRelatedTarget, SheetsScrollAreaLabel_2 as scrollAreaSelector, useKeyboardContextMenuFocus, useMenuInnerOverlay, useOpenerReturn } from "../sheets/scroll-area";
import { cn, initializeClassNames } from "../theme/class-names";
import { initializeThemeSurfaces, surfaceBackgroundTokens } from "../theme/surfaces";
import { initializeNpm__base_ui_react_jhe, load_react, load_react_jsx_runtime, npm_ContextMenu_Ex } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactMenuPopup: typeof React;
var jsxMenuPopup: typeof import("react/jsx-runtime");
var MenuPopupCss: string;
var ContextMenuPopupFrame: ForwardComponent<HTMLDivElement, MenuPopupProps>;
var initializeMenuPopup: () => void;
var reactMenuPopup_2: typeof React;
var MenuPopupCss_2: string;
var initializeMenuPopup_2: () => void;
var MenuPopupLabel: string;
var SelectValue: string;
var DraggableTrueValue: string;
var initializeMenuPopup_3: () => void;
function scrollbarWidth(
  outerSize: number,
  innerSize: number,
  borderSize?: number,
): number {
  return outerSize - innerSize - (borderSize || 0);
}
function isScrollbarPointerEvent(
  offsetX: number,
  offsetY: number,
  element: HTMLElement,
): boolean {
  let value = getComputedStyle(element);
  if (value.display === "inline") return false;
  let verticalScrollbarWidth = scrollbarWidth(
      element.offsetWidth,
      element.clientWidth,
      parseFloat(value.borderLeftWidth) + parseFloat(value.borderRightWidth),
    ),
    horizontalScrollbarHeight = scrollbarWidth(
      element.offsetHeight,
      element.clientHeight,
      parseFloat(value.borderTopWidth) + parseFloat(value.borderBottomWidth),
    ),
    isOnVerticalScrollbar =
      verticalScrollbarWidth >= 1 &&
      (value.direction === "rtl"
        ? offsetX < verticalScrollbarWidth
        : offsetX >= element.clientWidth),
    isOnHorizontalScrollbar = horizontalScrollbarHeight >= 1 && offsetY >= element.clientHeight;
  return isOnVerticalScrollbar || isOnHorizontalScrollbar;
}
function useClickToFocus(
  onFocusRequest: (() => void) | undefined,
  clickToFocusOptions: ClickToFocusOptions = {},
): {
  clickToFocusProps: {
    onMouseDown: React.MouseEventHandler<HTMLElement>;
  };
} {
  let {
      disabled: isDisabled = false,
      readOnly: isReadOnly = false,
      shouldIgnoreTarget: value,
    } = clickToFocusOptions,
    requestFocus = useOptionalStableCallback(onFocusRequest),
    shouldIgnoreTargetCallback = useOptionalStableCallback(value);
  return {
    clickToFocusProps: {
      onMouseDown: (0, reactMenuPopup_2.useCallback)(
        (event: React.MouseEvent<HTMLElement>) => {
          if (event.button !== 0 || isReadOnly || isDisabled) return;
          let target = event.target as HTMLElement,
            currentTarget = event.currentTarget;
          if (!currentTarget.contains(target)) return;
          if (target !== currentTarget) {
            if (shouldIgnoreTargetCallback?.(target)) return;
            let ancestor = target.closest(MenuPopupCss_2);
            if (
              ancestor &&
              ancestor !== currentTarget &&
              currentTarget.contains(ancestor)
            )
              return;
          }
          let { offsetX: nativeEvent, offsetY: offsetYInTarget } =
            event.nativeEvent;
          isScrollbarPointerEvent(
            nativeEvent,
            offsetYInTarget,
            target as HTMLElement,
          ) || (event.preventDefault(), requestFocus?.());
        },
        [isDisabled, isReadOnly, requestFocus, shouldIgnoreTargetCallback],
      ),
    },
  };
}
function isInteractivePressTarget(
  event: React.MouseEvent<HTMLElement>,
  {
    draggable: isDraggable = false,
  }: {
    draggable?: boolean;
  } = {},
): boolean {
  let value = asElement(event.target);
  return value === null
    ? false
    : isTextInputElement(value) ||
        value.matches(MenuPopupLabel) ||
        closestMatchesWithin(value, SelectValue, event.currentTarget) ||
        (isDraggable &&
          closestMatchesWithin(
            value,
            DraggableTrueValue,
            event.currentTarget,
          )) ||
        isScrollbarPointerEvent(
          event.nativeEvent.offsetX,
          event.nativeEvent.offsetY,
          value as HTMLElement,
        );
}
function closestMatchesWithin(
  element: Element,
  selector: string,
  container: Element,
): boolean {
  let ancestor = element.closest(selector);
  return ancestor !== null && container.contains(ancestor);
}
function usePassiveOpenGate(
  onOpenChange: MenuChange | undefined,
  isOpen: boolean | undefined,
  isHoverEnabled: boolean = true,
): PassiveOpenGateState {
  let [value] = (0, reactMenuPassiveOpenGate.useState)(
    createPassiveOpenGate,
  );
  value.renderedWith(isOpen, onOpenChange, isHoverEnabled);
  return value;
}
function createPassiveOpenGate(): PassiveOpenGateState {
  let value: MenuChange | undefined,
    flag = true,
    text: "off" | "declared" | "hover" = "off",
    popupElement: HTMLElement | null = null,
    pendingRestoreTarget: FocusableElement | null = null,
    shouldCaptureOpenerOnMount = false,
    finalFocusProp: PopupFocus | null | undefined,
    initialFocusProp: InitialPopupFocus | undefined,
    declinesInitialFocusState = false,
    openerElement: Element | null = null,
    triggerElement: HTMLElement | null = null,
    openInput: {
      type: PopupInputKind;
      byHover: boolean;
    } | null = null,
    wasOpen: boolean | undefined,
    hasOpenChangeFired = false,
    isGateOpen = false,
    values: Set<() => void> = new Set(),
    callback: (
      level: "off" | "declared" | "hover",
      notify: boolean,
    ) => void = (nextLevel, shouldNotify) => {
      nextLevel !== text &&
        ((text = nextLevel),
        shouldNotify &&
          values.forEach((notifyListener) => {
            notifyListener();
          }));
    },
    resetOpenState = () => {
      declinesInitialFocusState = false;
      openerElement = null;
      triggerElement = null;
      openInput = null;
      shouldCaptureOpenerOnMount = false;
    };
  return {
    cell: {
      getLevel: () => text,
      subscribe(listener) {
        values.add(listener);
        return () => {
          values.delete(listener);
        };
      },
      engage() {
        text === "declared" && (declinesInitialFocusState = false);
        callback("off", true);
      },
      registerPopup(element) {
        popupElement = element;
        if (element !== null)
          shouldCaptureOpenerOnMount &&
            ((shouldCaptureOpenerOnMount = false),
            (openerElement = activeDocumentElement(element.ownerDocument)));
        else if (!isGateOpen && (callback("off", false), pendingRestoreTarget !== null)) {
          let restoreTarget = pendingRestoreTarget;
          pendingRestoreTarget = null;
          focusPopupAfterMicrotask(
            restoreTarget.ownerDocument,
            null,
            restoreTarget,
            false,
          );
        }
      },
      declareFocusProps(initialFocus, finalFocus) {
        finalFocusProp = finalFocus;
        let isInitialFocusChanged = initialFocus !== initialFocusProp;
        initialFocusProp = initialFocus;
        if (!isInitialFocusChanged || !isGateOpen || popupElement !== null || openInput === null) return;
        let declinesFocusForInput = declinesInitialFocus(initialFocus, openInput.type);
        if (declinesFocusForInput === (text === "declared")) return;
        let focusLevel: PassiveOpenLevel = declinesFocusForInput
          ? "declared"
          : openInput.byHover
            ? "hover"
            : "off";
        declinesInitialFocusState = focusLevel !== "off";
        callback(focusLevel, false);
      },
      getPopup: () => popupElement,
      getTrigger: () => triggerElement,
    },
    renderedWith(isOpen, onOpenChange, isHoverEnabled) {
      value = onOpenChange;
      flag = isHoverEnabled;
      wasOpen !== true && isOpen === true && !hasOpenChangeFired
        ? ((isGateOpen = true),
          (pendingRestoreTarget = null),
          popupElement !== null
            ? (openerElement = activeDocumentElement(popupElement.ownerDocument))
            : ((openerElement = null), (shouldCaptureOpenerOnMount = true)),
          (triggerElement = null),
          (openInput = {
            type: "",
            byHover: false,
          }),
          (declinesInitialFocusState = declinesInitialFocus(initialFocusProp, "")),
          callback(declinesInitialFocusState ? "declared" : "off", false))
        : wasOpen === true &&
          isOpen === false &&
          ((isGateOpen = false),
          (hasOpenChangeFired = false),
          (pendingRestoreTarget =
            text === "declared" && declinesInitialFocusState
              ? resolveInitialFocusTarget(finalFocusProp, openerElement)
              : null),
          resetOpenState(),
          text === "hover" && callback("off", false));
      wasOpen = isOpen;
    },
    onOpenChange(isOpen, changeDetails) {
      value?.(isOpen, changeDetails);
      if (changeDetails.isCanceled === true) return;
      shouldCaptureOpenerOnMount = false;
      let isHoverOpen = flag && changeDetails.reason === TriggerHoverValue,
        ownerDocument =
          changeDetails.trigger?.ownerDocument ??
          popupElement?.ownerDocument ??
          defaultOwnerDocument();
      if (!isOpen) {
        isGateOpen = false;
        hasOpenChangeFired = false;
        if (declinesInitialFocusState && ownerDocument !== undefined) {
          let focusReturnTarget = resolveInitialFocusTarget(
            finalFocusProp,
            changeDetails.reason === FocusOutValue && triggerElement !== null
              ? triggerElement
              : openerElement,
          );
          focusReturnTarget !== null &&
            focusPopupAfterMicrotask(ownerDocument, popupElement, focusReturnTarget, !isHoverOpen);
        }
        resetOpenState();
        text === "hover" && callback("off", true);
        return;
      }
      isGateOpen = true;
      hasOpenChangeFired = true;
      pendingRestoreTarget = null;
      let isOpenerInsidePopup =
          ownerDocument !== undefined &&
          isInsidePopup(ownerDocument.activeElement, popupElement),
        inputKind = passiveOpenInputKind(changeDetails.event),
        nextFocusLevel: PassiveOpenLevel = isOpenerInsidePopup
          ? "off"
          : declinesInitialFocus(initialFocusProp, inputKind)
            ? "declared"
            : isHoverOpen
              ? "hover"
              : "off";
      (isHoverOpen && isOpenerInsidePopup) ||
        ((openerElement = activeDocumentElement(ownerDocument)),
        (triggerElement = asElement(
          changeDetails.trigger ?? null,
        ) as HTMLElement | null),
        (openInput = isOpenerInsidePopup
          ? null
          : {
              type: inputKind,
              byHover: isHoverOpen,
            }),
        (declinesInitialFocusState = nextFocusLevel !== "off"));
      callback(nextFocusLevel, true);
    },
  };
}
function passiveOpenInputKind(event?: Event): PopupInputKind {
  if (event === undefined) return "";
  if ("key" in event) return "keyboard";
  let { type: value } = event;
  return value === "click" && (event as MouseEvent).detail === 0
    ? "keyboard"
    : value === "click" ||
        value === "contextmenu" ||
        value.startsWith("mouse") ||
        value.startsWith("pointer") ||
        value.startsWith("touch")
      ? "mouse"
      : "";
}
function declinesInitialFocus(
  initialFocus: InitialPopupFocus | undefined,
  inputKind: PopupInputKind,
): boolean {
  if (initialFocus === undefined || initialFocus === true) return false;
  if (initialFocus === false) return true;
  let value = initialFocus(inputKind);
  return value === false || value === undefined;
}
function defaultOwnerDocument(): Document | undefined {
  return typeof document === "undefined" ? undefined : document;
}
function resolveInitialFocusTarget(
  focusProp: PopupFocus | null | undefined,
  fallbackElement: Element | null,
): FocusableElement | null {
  return (
    focusProp === false
      ? null
      : focusProp === undefined ||
          focusProp === true ||
          focusProp === null ||
          typeof focusProp == "function"
        ? fallbackElement
        : (focusProp.current ?? fallbackElement)
  ) as FocusableElement | null;
}
function activeDocumentElement(ownerDocument?: Document): Element | null {
  let value = asElement(ownerDocument?.activeElement ?? null);
  return value === null || value === ownerDocument?.body ? null : value;
}
function isInsidePopup(node: Node | null, popupElement: Element | null): boolean {
  return node !== null && popupElement !== null && popupElement.contains(node);
}
function focusPopupAfterMicrotask(
  ownerDocument: Document,
  popupElement: Element | null,
  focusTarget: FocusableElement,
  shouldNormalizeRelatedTarget: boolean,
): void {
  queueMicrotask(() => {
    let activeElement = ownerDocument.activeElement,
      isActiveInsidePopup = isInsidePopup(activeElement, popupElement);
    if (
      (activeElement === null || activeElement === ownerDocument.body || isActiveInsidePopup) &&
      focusTarget.isConnected &&
      focusTarget !== activeElement
    ) {
      let relatedTarget =
        shouldNormalizeRelatedTarget && isActiveInsidePopup ? asElement(activeElement) : null;
      relatedTarget !== null && normalizeFocusRelatedTarget(relatedTarget);
      focusTarget.focus({
        preventScroll: true,
      });
    }
  });
}
function usePassiveOpenCell(isNested: boolean): {
  cell: PassiveOpenCell | null;
  root: PassiveOpenCell | null;
} {
  let value = (0, reactMenuPassiveOpenGate.useContext)(
    PassiveOpenCellContext,
  );
  return isNested
    ? {
        cell: value,
        root: value,
      }
    : {
        cell: value,
        root: null,
      };
}
function usePassiveOpenHandlers(): Pick<PassivePopupProps, "tabIndex"> {
  return (0, reactMenuPassiveOpenGate.useContext)(
    PassiveOpenDisabledContext,
  )
    ? MenuPassiveOpenGateTabIndexConfig
    : MenuPassiveOpenGateRegistry;
}
function PassiveOpenGate({
  cell: cell,
  nested: nested,
  children: children,
}: PassiveGateProps): React.ReactElement {
  useUiLocale();
  let value = (0, reactMenuPassiveOpenGate.useSyncExternalStore)(
      cell === null ? MenuPassiveOpenGateHandler : cell.subscribe,
      cell === null ? MenuPassiveOpenGateDefaultText : cell.getLevel,
      MenuPassiveOpenGateDefaultText,
    ),
    effectiveLevel = cell === null || (nested && value === "hover") ? "off" : value;
  return (
    <PassiveOpenDisabledContext.Provider
      value={effectiveLevel === "declared"}
    >
      {effectiveLevel === "declared" && !nested && cell !== null ? (<PassiveOpenTypingWatcher cell={cell} />) : (null)}
      {children(
        cell === null || effectiveLevel === "off"
          ? MenuPassiveOpenGateHandler_2
          : effectiveLevel === "hover"
            ? (popupProps) => ({
                ...popupProps,
                tabIndex: undefined,
                onFocus(focusEvent) {
                  popupProps.onFocus?.(focusEvent);
                  cell.engage();
                },
              })
            : (popupProps) => ({
                ...popupProps,
                tabIndex: undefined,
                finalFocus: false,
                onMouseDown(event) {
                  popupProps.onMouseDown?.(event);
                  isInteractivePressTarget(event) || event.preventDefault();
                },
                onKeyDown(event) {
                  popupProps.onKeyDown?.(event);
                  !event.nativeEvent.isComposing &&
                    MenuPassiveOpenGateArrowDownArrowUpHomeSet.has(
                      event.key,
                    ) &&
                    cell.engage();
                },
              }),
      )}
    </PassiveOpenDisabledContext.Provider>
  );
}
function PassiveOpenTypingWatcher({
  cell: cell,
}: {
  cell: PassiveOpenCell;
}): null {
  (0, reactMenuPassiveOpenGate.useEffect)(() => {
    let value = cell.getTrigger();
    if (value === null) return;
    let callback = (event: KeyboardEvent): void => {
      if (
        event.isComposing ||
        event.key === "Tab" ||
        MenuPassiveOpenGateSubscribers.has(event.key) ||
        ((0, reactDomMenuPassiveOpenGate.flushSync)(() => {
          cell.engage();
        }),
        (event.key !== "ArrowDown" && event.key !== "ArrowUp") ||
          value.ownerDocument.activeElement !== value)
      )
        return;
      let popupElement = cell.getPopup(),
        menuItems =
          popupElement === null
            ? []
            : Array.from(
                popupElement.querySelectorAll<HTMLElement>(
                  '[role^="menuitem"]:not([data-disabled])',
                ),
              ),
        targetItem =
          event.key === "ArrowDown" ? menuItems[0] : menuItems[menuItems.length - 1],
        targetElement = asElement(targetItem ?? null);
      targetElement !== null &&
        targetElement.hasAttribute("data-highlighted") &&
        (event.preventDefault(),
        event.stopImmediatePropagation(),
        (targetElement as HTMLElement).focus({
          preventScroll: true,
        }));
    };
    value.addEventListener("keydown", callback);
    return () => {
      value.removeEventListener("keydown", callback);
    };
  }, [cell]);
  return null;
}
export {
  activeDocumentElement,
  closestMatchesWithin,
  ContextMenuPopupFrame,
  createPassiveOpenGate,
  declinesInitialFocus,
  defaultOwnerDocument,
  DraggableTrueValue,
  focusPopupAfterMicrotask,
  initializeMenuPopup,
  initializeMenuPopup_2,
  initializeMenuPopup_3,
  isInsidePopup,
  isInteractivePressTarget,
  isScrollbarPointerEvent,
  jsxMenuPopup,
  MenuPopupCss,
  MenuPopupCss_2,
  MenuPopupLabel,
  PassiveOpenGate,
  passiveOpenInputKind,
  PassiveOpenTypingWatcher,
  reactMenuPopup,
  reactMenuPopup_2,
  resolveInitialFocusTarget,
  scrollbarWidth,
  SelectValue,
  useClickToFocus,
  usePassiveOpenCell,
  usePassiveOpenGate,
  usePassiveOpenHandlers,
};
export function installCdsMenuPopup(): () => void {
  return () => {
    initializeMenuPopup = initializeOnce(() => {
      "use client";

      initializeClassNames();
      initializeOverlaysLayers();
      initializeDomRefComposition();
      initializePlatformRootFontSize_2();
      initializeComponentsIcon_3();
      initializeThemeSurfaces();
      initializeSheetsPopupStack();
      initializeSheetsScrollArea_2();
      initializeSheetsScrollArea_6();
      initializeSheetsScrollArea_8();
      initializeSheetsScrollArea();
      reactMenuPopup = toModuleNamespace(
        load_react(),
      );
      jsxMenuPopup = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializeNpm__base_ui_react_jhe();
      MenuPopupCss = `cds-reset draggable-none group/menu-popup relative flex flex-col min-w-[128px] max-w-[320px] max-h-[var(--available-height)] ${popupSurfaceClassName("popover")} text-body font-normal text-primary outline-none focus-visible:outline-hidden`;
      ContextMenuPopupFrame = (0, reactMenuPopup.forwardRef)<
        HTMLDivElement,
        MenuPopupProps
      >(
        (
          {
            anchor: anchor,
            side: side,
            align: align,
            sideOffset: sideOffset,
            collisionPadding: collisionPadding,
            finalFocus: finalFocus,
            className: className,
            children: children,
            "data-cds": dataCds,
            ...props
          }: MenuPopupProps,
          forwardedRef: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let { finalFocus: value, popupRef: popupRef } = useOpenerReturn({
            registerOpenerReturn: finalFocus == null,
          });
          useKeyboardContextMenuFocus(popupRef);
          let layer = useDefaultLayer("contextmenu"),
            { elementRef: innerOverlayRef, overlayAttrs: overlayAttrs } = useMenuInnerOverlay(),
            mergedRef = useMergedRefs(forwardedRef, popupRef, innerOverlayRef);
          return (
            <ResetSheetContext>
              <PopupSurface
                {...layer.portalProps}
                surface={surfaceBackgroundTokens.popover}
                companionModalCatcher={true}
                closeOnActivityHide={true}
              >
                <CollisionPaddingProvider
                  override={collisionPadding}
                  provideInherit={true}
                >
                  {(resolvedCollisionPadding: CollisionPadding) => (
                    <LayerBaseContext.Provider value={layer.base}>
                      <npm_ContextMenu_Ex.Positioner
                        style={layer.style}
                        anchor={anchor}
                        side={side}
                        align={align}
                        sideOffset={sideOffset}
                        collisionPadding={resolvedCollisionPadding}
                      >
                        <npm_ContextMenu_Ex.Popup
                          data-cds={dataCds}
                          {...overlayAttrs}
                          ref={mergedRef}
                          finalFocus={finalFocus ?? value}
                          {...props}
                          className={cn(MenuPopupCss, className)}
                        >
                          <PopupScrollArea>
                            {children}
                          </PopupScrollArea>
                        </npm_ContextMenu_Ex.Popup>
                      </npm_ContextMenu_Ex.Positioner>
                    </LayerBaseContext.Provider>
                  )}
                </CollisionPaddingProvider>
              </PopupSurface>
            </ResetSheetContext>
          );
        },
      );
      ContextMenuPopupFrame.displayName = "ContextMenuPopupFrame";
    });
    initializeMenuPopup_2 = initializeOnce(() => {
      "use client";

      initializeSheetsScrollArea_3();
      initializeHooksStableCallback_2();
      reactMenuPopup_2 = toModuleNamespace(
        load_react(),
      );
      MenuPopupCss_2 = `button,a[href],label,[role="button"],select,[tabindex]:not([tabindex="-1"]),${scrollAreaSelector}`;
    });
    initializeMenuPopup_3 = initializeOnce(() => {
      initializeHooksStableCallback();
      initializeMenuPopup_2();
      initializeSheetsKeyboardViewport();
      MenuPopupLabel =
        'input[type="range"], select, input[readonly], textarea[readonly]';
      SelectValue = "select";
      DraggableTrueValue = '[draggable="true"]';
    });
  };
}
