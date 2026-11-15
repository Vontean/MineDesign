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
  input: import("@base-ui/react/menu").Menu.Root.ChangeEventDetails,
): boolean {
  if (input.reason !== "cancel-open") return false;
  let value = input.trigger ?? null,
    value2 = input.event?.target ?? null;
  if (value === null || value2 === null || !("nodeType" in value2))
    return false;
  let value3 = value2 as Node;
  if (value.contains(value3)) return true;
  let attribute = value.getAttribute("aria-controls");
  return (
    (attribute
      ? value.ownerDocument.getElementById(attribute)
      : null
    )?.contains(value3) ?? false
  );
}
function useMenuTriggerRef(
  input: MenuChange | undefined,
  options: boolean = false,
): {
  triggerRef: React.RefObject<HTMLElement | null>;
  onOpenChange: MenuChange;
} {
  let value = (0, reactMenuItemStyles.useRef)<HTMLElement | null>(null);
  return {
    triggerRef: value,
    onOpenChange: (0, useStableCallback)(
      (
        input2: boolean,
        options2: import("@base-ui/react/menu").Menu.Root.ChangeEventDetails,
      ) => {
        if (!input2 && options && wasTriggerOpenCanceled(options2)) {
          options2.cancel?.();
          return;
        }
        value.current =
          (
            options2 as {
              trigger?: HTMLElement;
            }
          ).trigger ?? null;
        input?.(input2, options2);
      },
    ),
  };
}
function useParentMenu(): React.RefObject<HTMLElement | null> | undefined {
  return (0, reactMenuItemStyles.useContext)(ParentMenuContext);
}
function useMenuPopupFocus(
  input: React.RefObject<HTMLElement | null> | undefined,
  options: PopupFocus | null | undefined,
): React.RefCallback<HTMLElement> {
  let value = (0, reactMenuItemStyles.useContext)(ParentMenuContext),
    value2 = (0, reactMenuItemStyles.useRef)(options);
  (0, useIsomorphicLayoutEffect)(() => {
    value2.current = options;
  }, [options]);
  let value3 = (0, reactMenuItemStyles.useCallback)(() => {
    let value4 =
        input !== undefined ? input.current : (value?.current ?? null),
      current = value2.current;
    return current === false || typeof current == "function"
      ? null
      : current === undefined || current === true || current === null
        ? value4
        : (current.current ?? value4);
  }, [input, value]);
  return (0, reactMenuItemStyles.useCallback)(
    (input2: HTMLElement | null) => {
      input2 !== null && (0, registerOpenerReturn)(input2, value3);
    },
    [value3],
  );
}
function popupPlacementAttributes(element: Element): PopupPlacement {
  return {
    side: element.getAttribute("data-side") || undefined,
    align: element.getAttribute("data-align") || undefined,
  };
}
function samePopupPlacement(
  input: PopupPlacement | null,
  options: PopupPlacement,
): boolean {
  return (
    input !== null &&
    input.side === options.side &&
    input.align === options.align
  );
}
function popupUsesReverseEntry(input: PopupPlacement | null): boolean {
  return (
    input?.side === "top" ||
    (input?.side !== undefined &&
      input.side !== "bottom" &&
      input.align === "end")
  );
}
function usePopupEntryAnimation({
  enabled: enabled,
  side: side,
  align: align,
}: PopupAnimationInput): PopupAnimationState {
  let [value, value2] = (0,
    reactSheetsMenuPopup.useState)<PopupPlacement | null>(null),
    [value3, value4] = (0,
    reactSheetsMenuPopup.useState)<PopupPlacement | null>(null),
    [value5, value6] = (0, reactSheetsMenuPopup.useState)<
      number | undefined
    >(),
    value7 = (0, reactSheetsMenuPopup.useRef)<HTMLElement | null>(
      null,
    ),
    value8 = (0, reactSheetsMenuPopup.useRef)(false),
    value9 = (0, reactSheetsMenuPopup.useRef)<(() => void) | null>(
      null,
    ),
    value10 = (0, reactSheetsMenuPopup.useCallback)(
      (element: HTMLElement | null): void => {
        value9.current?.();
        value9.current = null;
        if (!element) {
          value2(null);
          value4(null);
          value8.current = false;
          return;
        }
        let value14 = element.ownerDocument.defaultView ?? window,
          value15 = typeof value14.requestAnimationFrame == "function",
          index = 0,
          index2 = 0,
          callback = () => {
            index2 += 1;
            if (index2 < SheetsMenuPopupLimit) {
              index = value14.requestAnimationFrame(callback);
              return;
            }
            index = 0;
            let value16 = popupPlacementAttributes(element);
            value2((input) =>
              samePopupPlacement(input, value16) ? input : value16,
            );
          },
          callback2 = () => {
            let value16 = popupPlacementAttributes(element);
            value4((input) =>
              samePopupPlacement(input, value16) ? input : value16,
            );
            value8.current = popupUsesReverseEntry(value16);
            if (!value8.current) {
              let value17 = value7.current?.getBoundingClientRect().height;
              value6(
                value17 !== undefined && value17 > 0 ? value17 : undefined,
              );
            }
            index2 = 0;
            value15 &&
              index === 0 &&
              (index = value14.requestAnimationFrame(callback));
          };
        callback2();
        let observer = new MutationObserver(callback2);
        observer.observe(element, {
          attributes: true,
          attributeFilter: ["data-side", "data-align"],
        });
        value9.current = () => {
          observer.disconnect();
          index !== 0 && value14.cancelAnimationFrame(index);
        };
      },
      [],
    ),
    value11 = (0, reactSheetsMenuPopup.useRef)<ResizeObserver | null>(
      null,
    ),
    value12 = (0, reactSheetsMenuPopup.useCallback)(
      (input: HTMLElement | null): void => {
        value11.current?.disconnect();
        value11.current = null;
        value7.current = input;
        if (!input) {
          value6(undefined);
          return;
        }
        if (!enabled) return;
        let callback = () => {
          let height = input.getBoundingClientRect().height;
          height > 0 &&
            value6((input2) =>
              value8.current && input2 !== undefined && height <= input2
                ? input2
                : height,
            );
        };
        callback();
        if (typeof ResizeObserver !== "undefined") {
          let observer = new ResizeObserver(callback);
          observer.observe(input);
          value11.current = observer;
        }
      },
      [enabled],
    ),
    value13: PopupAnimationState["held"] =
      enabled && popupUsesReverseEntry(value3) && value5 !== undefined
        ? {
            positionerStyle: {
              minHeight: `min(${Math.floor(value5)}px, var(--available-height))`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            },
            positionerClassName: PointerEventsNoneValue,
          }
        : null;
  return {
    positionerRef: enabled ? value10 : undefined,
    popupRef: value12,
    side: enabled ? (value?.side ?? side) : side,
    align: enabled ? (value?.align ?? align) : align,
    held: value13,
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
    initializeMenuItemStyles = (0, initializeOnce)(() => {
      (0, initializeNpm_class_variance_authority_Zhe)();
      menuItemVariants = (0, npm_cva_Kj)(
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
    initializeMenuItemStyles_2 = (0, initializeOnce)(() => {
      "use client";

      (0, initializeHooksLayoutEffect)();
      (0, initializeHooksStableCallback_2)();
      (0, initializeSheetsScrollArea_5)();
      reactMenuItemStyles = (0, toModuleNamespace)(
        (0, load_react)(),
      );
      ParentMenuContext = (0, reactMenuItemStyles.createContext)<
        React.RefObject<HTMLElement | null> | undefined
      >(undefined);
      MenuItemStylesProviderValue = ParentMenuContext.Provider;
    });
    initializeMenuItemStyles_3 = (0, initializeOnce)(() => {
      "use client";

      (0, initializeDomRefComposition)();
      (0, initializeSheetsPopupStack)();
      (0, initializeSheetsScrollArea_6)();
      (0, initializeSheetsScrollArea_8)();
      initializeMenuItemStyles_2();
      reactMenuItemStyles_2 = (0, toModuleNamespace)(
        (0, load_react)(),
      );
      jsxMenuItemStyles = (0, toModuleNamespace)(
        (0, load_react_jsx_runtime)(),
      );
      (0, initializeNpm__base_ui_react_jj)();
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
          options: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let value =
              (0, reactMenuItemStyles_2.useContext)(SheetPopupContext)
                ?.open ?? true,
            { elementRef: value2, overlayAttrs: value3 } = (0,
            useMenuInnerOverlay)(),
            value4 = (0, useOpenerReturn)({
              open: value,
              skipRestoreOnOutsideFocus: !cursorAnchored,
              registerOpenerReturn: anchoredWithoutFinalFocus,
              triggerRef: useParentMenu(),
            }),
            value5 = (0, useMergedRefs)(
              options,
              value2,
              anchoredWithoutFinalFocus ? value4.popupRef : undefined,
            );
          return (
            <npm_Menu_La.Popup
              {...value3}
              ref={value5}
              finalFocus={
                (finalFocus === undefined ||
                  (cursorAnchored && finalFocus === null)) &&
                anchoredWithoutFinalFocus
                  ? value4.finalFocus
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
