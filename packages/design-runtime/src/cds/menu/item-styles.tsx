import type {
  ForwardComponent,
  MenuChange,
  MenuPopupElementProps,
  PopupAnimationInput,
  PopupAnimationState,
  PopupFocus,
  PopupPlacement,
} from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { initializeDomRefComposition, useMergedRefs } from "../dom/ref-composition";
import { initializeHooksLayoutEffect, useIsomorphicLayoutEffect } from "../hooks/layout-effect";
import { initializeHooksStableCallback_2, useStableCallback } from "../hooks/stable-callback";
import { PointerEventsNoneValue, reactSheetsMenuPopup, SheetsMenuPopupLimit } from "../sheets/menu-popup";
import { initializeSheetsPopupStack, SheetPopupContext } from "../sheets/popup-stack";
import { initializeSheetsScrollArea_5, initializeSheetsScrollArea_6, initializeSheetsScrollArea_8, registerOpenerReturn, useMenuInnerOverlay, useOpenerReturn } from "../sheets/scroll-area";
import { initializeNpm__base_ui_react_jj, initializeNpm_class_variance_authority_Zhe, load_react, load_react_jsx_runtime, npm_cva_Kj, npm_Menu_La } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var menuItemVariants: (options?: {
  variant?: "default" | "danger";
}) => string;
var MenuItemStylesClassNames: string;
var initializeMenuItemStyles: () => void;
var reactMenuItemStyles: typeof React;
var ParentMenuContext: React.Context<
  React.RefObject<HTMLElement | null> | undefined
>;
var MenuItemStylesProviderValue: React.Provider<
  React.RefObject<HTMLElement | null> | undefined
>;
var initializeMenuItemStyles_2: () => void;
var reactMenuItemStyles_2: typeof React;
var jsxMenuItemStyles: typeof import("react/jsx-runtime");
var MenuPopupElement: ForwardComponent<HTMLDivElement, MenuPopupElementProps>;
var initializeMenuItemStyles_3: () => void;
function wasTriggerOpenCanceled(
  details: import("@base-ui/react/menu").Menu.Root.ChangeEventDetails,
): boolean {
  if (details.reason !== "cancel-open") return false;
  let trigger = details.trigger ?? null,
    eventTarget = details.event?.target ?? null;
  if (trigger === null || eventTarget === null || !("nodeType" in eventTarget))
    return false;
  let targetNode = eventTarget as Node;
  if (trigger.contains(targetNode)) return true;
  let attribute = trigger.getAttribute("aria-controls");
  return (
    (attribute
      ? trigger.ownerDocument.getElementById(attribute)
      : null
    )?.contains(targetNode) ?? false
  );
}
function useMenuTriggerRef(
  onOpenChangeProp: MenuChange | undefined,
  suppressTriggerCancel: boolean = false,
): {
  triggerRef: React.RefObject<HTMLElement | null>;
  onOpenChange: MenuChange;
} {
  let triggerRef = (0, reactMenuItemStyles.useRef)<HTMLElement | null>(null);
  return {
    triggerRef: triggerRef,
    onOpenChange: useStableCallback(
      (
        isOpen: boolean,
        details: import("@base-ui/react/menu").Menu.Root.ChangeEventDetails,
      ) => {
        if (!isOpen && suppressTriggerCancel && wasTriggerOpenCanceled(details)) {
          details.cancel?.();
          return;
        }
        triggerRef.current =
          (
            details as {
              trigger?: HTMLElement;
            }
          ).trigger ?? null;
        onOpenChangeProp?.(isOpen, details);
      },
    ),
  };
}
function useParentMenu(): React.RefObject<HTMLElement | null> | undefined {
  return (0, reactMenuItemStyles.useContext)(ParentMenuContext);
}
function useMenuPopupFocus(
  triggerRef: React.RefObject<HTMLElement | null> | undefined,
  popupFocus: PopupFocus | null | undefined,
): React.RefCallback<HTMLElement> {
  let parentMenuRef = (0, reactMenuItemStyles.useContext)(ParentMenuContext),
    popupFocusRef = (0, reactMenuItemStyles.useRef)(popupFocus);
  useIsomorphicLayoutEffect(() => {
    popupFocusRef.current = popupFocus;
  }, [popupFocus]);
  let getFocusTarget = (0, reactMenuItemStyles.useCallback)(() => {
    let defaultTarget =
        triggerRef !== undefined ? triggerRef.current : (parentMenuRef?.current ?? null),
      current = popupFocusRef.current;
    return current === false || typeof current == "function"
      ? null
      : current === undefined || current === true || current === null
        ? defaultTarget
        : (current.current ?? defaultTarget);
  }, [triggerRef, parentMenuRef]);
  return (0, reactMenuItemStyles.useCallback)(
    (popup: HTMLElement | null) => {
      popup !== null && registerOpenerReturn(popup, getFocusTarget);
    },
    [getFocusTarget],
  );
}
function popupPlacementAttributes(element: Element): PopupPlacement {
  return {
    side: element.getAttribute("data-side") || undefined,
    align: element.getAttribute("data-align") || undefined,
  };
}
function samePopupPlacement(
  previous: PopupPlacement | null,
  next: PopupPlacement,
): boolean {
  return (
    previous !== null &&
    previous.side === next.side &&
    previous.align === next.align
  );
}
function popupUsesReverseEntry(placement: PopupPlacement | null): boolean {
  return (
    placement?.side === "top" ||
    (placement?.side !== undefined &&
      placement.side !== "bottom" &&
      placement.align === "end")
  );
}
function usePopupEntryAnimation({
  enabled: enabled,
  side: side,
  align: align,
}: PopupAnimationInput): PopupAnimationState {
  let [settledPlacement, setSettledPlacement] = (0,
    reactSheetsMenuPopup.useState)<PopupPlacement | null>(null),
    [currentPlacement, setCurrentPlacement] = (0,
    reactSheetsMenuPopup.useState)<PopupPlacement | null>(null),
    [naturalHeight, setNaturalHeight] = (0, reactSheetsMenuPopup.useState)<
      number | undefined
    >(),
    popupElementRef = (0, reactSheetsMenuPopup.useRef)<HTMLElement | null>(
      null,
    ),
    isReverseEntryRef = (0, reactSheetsMenuPopup.useRef)(false),
    disconnectPlacementRef = (0, reactSheetsMenuPopup.useRef)<(() => void) | null>(
      null,
    ),
    setPositioner = (0, reactSheetsMenuPopup.useCallback)(
      (element: HTMLElement | null): void => {
        disconnectPlacementRef.current?.();
        disconnectPlacementRef.current = null;
        if (!element) {
          setSettledPlacement(null);
          setCurrentPlacement(null);
          isReverseEntryRef.current = false;
          return;
        }
        let view = element.ownerDocument.defaultView ?? window,
          hasAnimationFrame = typeof view.requestAnimationFrame == "function",
          frameId = 0,
          frameCount = 0,
          settlePlacement = () => {
            frameCount += 1;
            if (frameCount < SheetsMenuPopupLimit) {
              frameId = view.requestAnimationFrame(settlePlacement);
              return;
            }
            frameId = 0;
            let placement = popupPlacementAttributes(element);
            setSettledPlacement((previous) =>
              samePopupPlacement(previous, placement) ? previous : placement,
            );
          },
          syncPlacement = () => {
            let placement = popupPlacementAttributes(element);
            setCurrentPlacement((previous) =>
              samePopupPlacement(previous, placement) ? previous : placement,
            );
            isReverseEntryRef.current = popupUsesReverseEntry(placement);
            if (!isReverseEntryRef.current) {
              let measuredHeight = popupElementRef.current?.getBoundingClientRect().height;
              setNaturalHeight(
                measuredHeight !== undefined && measuredHeight > 0 ? measuredHeight : undefined,
              );
            }
            frameCount = 0;
            hasAnimationFrame &&
              frameId === 0 &&
              (frameId = view.requestAnimationFrame(settlePlacement));
          };
        syncPlacement();
        let observer = new MutationObserver(syncPlacement);
        observer.observe(element, {
          attributes: true,
          attributeFilter: ["data-side", "data-align"],
        });
        disconnectPlacementRef.current = () => {
          observer.disconnect();
          frameId !== 0 && view.cancelAnimationFrame(frameId);
        };
      },
      [],
    ),
    resizeObserverRef = (0, reactSheetsMenuPopup.useRef)<ResizeObserver | null>(
      null,
    ),
    setPopup = (0, reactSheetsMenuPopup.useCallback)(
      (popup: HTMLElement | null): void => {
        resizeObserverRef.current?.disconnect();
        resizeObserverRef.current = null;
        popupElementRef.current = popup;
        if (!popup) {
          setNaturalHeight(undefined);
          return;
        }
        if (!enabled) return;
        let measureHeight = () => {
          let height = popup.getBoundingClientRect().height;
          height > 0 &&
            setNaturalHeight((previousHeight) =>
              isReverseEntryRef.current && previousHeight !== undefined && height <= previousHeight
                ? previousHeight
                : height,
            );
        };
        measureHeight();
        if (typeof ResizeObserver !== "undefined") {
          let observer = new ResizeObserver(measureHeight);
          observer.observe(popup);
          resizeObserverRef.current = observer;
        }
      },
      [enabled],
    ),
    heldStyle: PopupAnimationState["held"] =
      enabled && popupUsesReverseEntry(currentPlacement) && naturalHeight !== undefined
        ? {
            positionerStyle: {
              minHeight: `min(${Math.floor(naturalHeight)}px, var(--available-height))`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            },
            positionerClassName: PointerEventsNoneValue,
          }
        : null;
  return {
    positionerRef: enabled ? setPositioner : undefined,
    popupRef: setPopup,
    side: enabled ? (settledPlacement?.side ?? side) : side,
    align: enabled ? (settledPlacement?.align ?? align) : align,
    held: heldStyle,
  };
}
export {
  initializeMenuItemStyles,
  initializeMenuItemStyles_2,
  initializeMenuItemStyles_3,
  jsxMenuItemStyles,
  MenuItemStylesClassNames,
  MenuItemStylesProviderValue,
  menuItemVariants,
  MenuPopupElement,
  ParentMenuContext,
  popupPlacementAttributes,
  popupUsesReverseEntry,
  reactMenuItemStyles,
  reactMenuItemStyles_2,
  samePopupPlacement,
  useMenuPopupFocus,
  useMenuTriggerRef,
  useParentMenu,
  usePopupEntryAnimation,
  wasTriggerOpenCanceled,
};
export function installCdsMenuItemStyles(): () => void {
  return () => {
    initializeMenuItemStyles = initializeOnce(() => {
      initializeNpm_class_variance_authority_Zhe();
      menuItemVariants = npm_cva_Kj(
        "cds-reset flex w-full items-center gap-xs compact:px-2 comfortable:px-2.5 py-[calc((var(--cds-h-control)-var(--cds-leading-body))/2)] rounded text-body font-normal [--cds-shortcut-cap-ink:var(--cds-text-muted)] select-none outline-none focus-visible:outline-hidden data-[disabled]:opacity-disabled data-[disabled]:pointer-events-none",
        {
          variants: {
            variant: {
              default: "text-primary data-[highlighted]:bg-fill-ghost-hover",
              danger:
                "group/menu-danger text-danger data-[highlighted]:bg-fill-danger data-[highlighted]:text-on-danger data-[highlighted]:[--cds-shortcut-cap-ink:currentColor]",
            },
          },
          defaultVariants: {
            variant: "default",
          },
        },
      );
      MenuItemStylesClassNames =
        "pb-[calc((var(--cds-h-control)-var(--cds-font-size-body)-var(--cds-leading-footnote)+var(--cds-font-size-footnote))/2)]";
    });
    initializeMenuItemStyles_2 = initializeOnce(() => {
      "use client";

      initializeHooksLayoutEffect();
      initializeHooksStableCallback_2();
      initializeSheetsScrollArea_5();
      reactMenuItemStyles = toModuleNamespace(
        load_react(),
      );
      ParentMenuContext = (0, reactMenuItemStyles.createContext)<
        React.RefObject<HTMLElement | null> | undefined
      >(undefined);
      MenuItemStylesProviderValue = ParentMenuContext.Provider;
    });
    initializeMenuItemStyles_3 = initializeOnce(() => {
      "use client";

      initializeDomRefComposition();
      initializeSheetsPopupStack();
      initializeSheetsScrollArea_6();
      initializeSheetsScrollArea_8();
      initializeMenuItemStyles_2();
      reactMenuItemStyles_2 = toModuleNamespace(
        load_react(),
      );
      jsxMenuItemStyles = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializeNpm__base_ui_react_jj();
      MenuPopupElement = (0, reactMenuItemStyles_2.forwardRef)<
        HTMLDivElement,
        MenuPopupElementProps
      >(
        (
          {
            anchoredWithoutFinalFocus: anchoredWithoutFinalFocus,
            cursorAnchored = false,
            finalFocus: finalFocus,
            ...props
          }: MenuPopupElementProps,
          forwardedRef: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let isOpen =
              (0, reactMenuItemStyles_2.useContext)(SheetPopupContext)
                ?.open ?? true,
            { elementRef: overlayElementRef, overlayAttrs: overlayAttrs } = useMenuInnerOverlay(),
            openerReturn = useOpenerReturn({
              open: isOpen,
              skipRestoreOnOutsideFocus: !cursorAnchored,
              registerOpenerReturn: anchoredWithoutFinalFocus,
              triggerRef: useParentMenu(),
            }),
            mergedRef = useMergedRefs(
              forwardedRef,
              overlayElementRef,
              anchoredWithoutFinalFocus ? openerReturn.popupRef : undefined,
            );
          return (
            <npm_Menu_La.Popup
              {...overlayAttrs}
              ref={mergedRef}
              finalFocus={
                (finalFocus === undefined ||
                  (cursorAnchored && finalFocus === null)) &&
                anchoredWithoutFinalFocus
                  ? openerReturn.finalFocus
                  : finalFocus
              }
              {...props}
            />
          );
        },
      );
      MenuPopupElement.displayName = "MenuPopupElement";
    });
  };
}
