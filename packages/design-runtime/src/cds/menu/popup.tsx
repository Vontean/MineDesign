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
import { initializeSheetsScrollArea, initializeSheetsScrollArea_2, initializeSheetsScrollArea_3, initializeSheetsScrollArea_6, initializeSheetsScrollArea_8, normalizeFocusRelatedTarget, SheetsScrollAreaLabel_2, useKeyboardContextMenuFocus, useMenuInnerOverlay, useOpenerReturn } from "../sheets/scroll-area";
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
  input: number,
  options: number,
  context?: number,
): number {
  return input - options - (context || 0);
}
function isScrollbarPointerEvent(
  input: number,
  options: number,
  context: HTMLElement,
): boolean {
  let value = getComputedStyle(context);
  if (value.display === "inline") return false;
  let value2 = scrollbarWidth(
      context.offsetWidth,
      context.clientWidth,
      parseFloat(value.borderLeftWidth) + parseFloat(value.borderRightWidth),
    ),
    value3 = scrollbarWidth(
      context.offsetHeight,
      context.clientHeight,
      parseFloat(value.borderTopWidth) + parseFloat(value.borderBottomWidth),
    ),
    value4 =
      value2 >= 1 &&
      (value.direction === "rtl"
        ? input < value2
        : input >= context.clientWidth),
    value5 = value3 >= 1 && options >= context.clientHeight;
  return value4 || value5;
}
function useClickToFocus(
  input: (() => void) | undefined,
  options: ClickToFocusOptions = {},
): {
  clickToFocusProps: {
    onMouseDown: React.MouseEventHandler<HTMLElement>;
  };
} {
  let {
      disabled: value2 = false,
      readOnly: value3 = false,
      shouldIgnoreTarget: value,
    } = options,
    value4 = useOptionalStableCallback(input),
    value5 = useOptionalStableCallback(value);
  return {
    clickToFocusProps: {
      onMouseDown: (0, reactMenuPopup_2.useCallback)(
        (event: React.MouseEvent<HTMLElement>) => {
          if (event.button !== 0 || value3 || value2) return;
          let target = event.target as HTMLElement,
            currentTarget = event.currentTarget;
          if (!currentTarget.contains(target)) return;
          if (target !== currentTarget) {
            if (value5?.(target)) return;
            let ancestor = target.closest(MenuPopupCss_2);
            if (
              ancestor &&
              ancestor !== currentTarget &&
              currentTarget.contains(ancestor)
            )
              return;
          }
          let { offsetX: nativeEvent, offsetY: nativeEvent2 } =
            event.nativeEvent;
          isScrollbarPointerEvent(
            nativeEvent,
            nativeEvent2,
            target as HTMLElement,
          ) || (event.preventDefault(), value4?.());
        },
        [value2, value3, value4, value5],
      ),
    },
  };
}
function isInteractivePressTarget(
  event: React.MouseEvent<HTMLElement>,
  {
    draggable: options = false,
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
        (options &&
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
  input: Element,
  options: string,
  context: Element,
): boolean {
  let ancestor = input.closest(options);
  return ancestor !== null && context.contains(ancestor);
}
function usePassiveOpenGate(
  input: MenuChange | undefined,
  options: boolean | undefined,
  context: boolean = true,
): PassiveOpenGateState {
  let [value] = (0, reactMenuPassiveOpenGate.useState)(
    createPassiveOpenGate,
  );
  value.renderedWith(options, input, context);
  return value;
}
function createPassiveOpenGate(): PassiveOpenGateState {
  let value: MenuChange | undefined,
    flag = true,
    text: "off" | "declared" | "hover" = "off",
    value2: HTMLElement | null = null,
    value3: FocusableElement | null = null,
    flag2 = false,
    value4: PopupFocus | null | undefined,
    value5: InitialPopupFocus | undefined,
    flag3 = false,
    value6: Element | null = null,
    value7: HTMLElement | null = null,
    value8: {
      type: PopupInputKind;
      byHover: boolean;
    } | null = null,
    value9: boolean | undefined,
    flag4 = false,
    flag5 = false,
    values: Set<() => void> = new Set(),
    callback: (
      level: "off" | "declared" | "hover",
      notify: boolean,
    ) => void = (input, options) => {
      input !== text &&
        ((text = input),
        options &&
          values.forEach((input2) => {
            input2();
          }));
    },
    callback2 = () => {
      flag3 = false;
      value6 = null;
      value7 = null;
      value8 = null;
      flag2 = false;
    };
  return {
    cell: {
      getLevel: () => text,
      subscribe(input) {
        values.add(input);
        return () => {
          values.delete(input);
        };
      },
      engage() {
        text === "declared" && (flag3 = false);
        callback("off", true);
      },
      registerPopup(element) {
        value2 = element;
        if (element !== null)
          flag2 &&
            ((flag2 = false),
            (value6 = activeDocumentElement(element.ownerDocument)));
        else if (!flag5 && (callback("off", false), value3 !== null)) {
          let value10 = value3;
          value3 = null;
          focusPopupAfterMicrotask(
            value10.ownerDocument,
            null,
            value10,
            false,
          );
        }
      },
      declareFocusProps(input, options) {
        value4 = options;
        let value10 = input !== value5;
        value5 = input;
        if (!value10 || !flag5 || value2 !== null || value8 === null) return;
        let value11 = declinesInitialFocus(input, value8.type);
        if (value11 === (text === "declared")) return;
        let value12: PassiveOpenLevel = value11
          ? "declared"
          : value8.byHover
            ? "hover"
            : "off";
        flag3 = value12 !== "off";
        callback(value12, false);
      },
      getPopup: () => value2,
      getTrigger: () => value7,
    },
    renderedWith(input, options, context) {
      value = options;
      flag = context;
      value9 !== true && input === true && !flag4
        ? ((flag5 = true),
          (value3 = null),
          value2 !== null
            ? (value6 = activeDocumentElement(value2.ownerDocument))
            : ((value6 = null), (flag2 = true)),
          (value7 = null),
          (value8 = {
            type: "",
            byHover: false,
          }),
          (flag3 = declinesInitialFocus(value5, "")),
          callback(flag3 ? "declared" : "off", false))
        : value9 === true &&
          input === false &&
          ((flag5 = false),
          (flag4 = false),
          (value3 =
            text === "declared" && flag3
              ? resolveInitialFocusTarget(value4, value6)
              : null),
          callback2(),
          text === "hover" && callback("off", false));
      value9 = input;
    },
    onOpenChange(input, options) {
      value?.(input, options);
      if (options.isCanceled === true) return;
      flag2 = false;
      let value10 = flag && options.reason === TriggerHoverValue,
        value11 =
          options.trigger?.ownerDocument ??
          value2?.ownerDocument ??
          defaultOwnerDocument();
      if (!input) {
        flag5 = false;
        flag4 = false;
        if (flag3 && value11 !== undefined) {
          let value15 = resolveInitialFocusTarget(
            value4,
            options.reason === FocusOutValue && value7 !== null
              ? value7
              : value6,
          );
          value15 !== null &&
            focusPopupAfterMicrotask(value11, value2, value15, !value10);
        }
        callback2();
        text === "hover" && callback("off", true);
        return;
      }
      flag5 = true;
      flag4 = true;
      value3 = null;
      let value12 =
          value11 !== undefined &&
          isInsidePopup(value11.activeElement, value2),
        value13 = passiveOpenInputKind(options.event),
        value14: PassiveOpenLevel = value12
          ? "off"
          : declinesInitialFocus(value5, value13)
            ? "declared"
            : value10
              ? "hover"
              : "off";
      (value10 && value12) ||
        ((value6 = activeDocumentElement(value11)),
        (value7 = asElement(
          options.trigger ?? null,
        ) as HTMLElement | null),
        (value8 = value12
          ? null
          : {
              type: value13,
              byHover: value10,
            }),
        (flag3 = value14 !== "off"));
      callback(value14, true);
    },
  };
}
function passiveOpenInputKind(input?: Event): PopupInputKind {
  if (input === undefined) return "";
  if ("key" in input) return "keyboard";
  let { type: value } = input;
  return value === "click" && (input as MouseEvent).detail === 0
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
  input: InitialPopupFocus | undefined,
  options: PopupInputKind,
): boolean {
  if (input === undefined || input === true) return false;
  if (input === false) return true;
  let value = input(options);
  return value === false || value === undefined;
}
function defaultOwnerDocument(): Document | undefined {
  return typeof document === "undefined" ? undefined : document;
}
function resolveInitialFocusTarget(
  input: PopupFocus | null | undefined,
  options: Element | null,
): FocusableElement | null {
  return (
    input === false
      ? null
      : input === undefined ||
          input === true ||
          input === null ||
          typeof input == "function"
        ? options
        : (input.current ?? options)
  ) as FocusableElement | null;
}
function activeDocumentElement(input?: Document): Element | null {
  let value = asElement(input?.activeElement ?? null);
  return value === null || value === input?.body ? null : value;
}
function isInsidePopup(input: Node | null, options: Element | null): boolean {
  return input !== null && options !== null && options.contains(input);
}
function focusPopupAfterMicrotask(
  input: Document,
  options: Element | null,
  context: FocusableElement,
  value: boolean,
): void {
  queueMicrotask(() => {
    let activeElement = input.activeElement,
      value2 = isInsidePopup(activeElement, options);
    if (
      (activeElement === null || activeElement === input.body || value2) &&
      context.isConnected &&
      context !== activeElement
    ) {
      let value3 =
        value && value2 ? asElement(activeElement) : null;
      value3 !== null && normalizeFocusRelatedTarget(value3);
      context.focus({
        preventScroll: true,
      });
    }
  });
}
function usePassiveOpenCell(input: boolean): {
  cell: PassiveOpenCell | null;
  root: PassiveOpenCell | null;
} {
  let value = (0, reactMenuPassiveOpenGate.useContext)(
    PassiveOpenCellContext,
  );
  return input
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
    value2 = cell === null || (nested && value === "hover") ? "off" : value;
  return (
    <PassiveOpenDisabledContext.Provider
      value={value2 === "declared"}
    >
      {value2 === "declared" && !nested && cell !== null ? (<PassiveOpenTypingWatcher cell={cell} />) : (null)}
      {children(
        cell === null || value2 === "off"
          ? MenuPassiveOpenGateHandler_2
          : value2 === "hover"
            ? (input) => ({
                ...input,
                tabIndex: undefined,
                onFocus(input2) {
                  input.onFocus?.(input2);
                  cell.engage();
                },
              })
            : (input) => ({
                ...input,
                tabIndex: undefined,
                finalFocus: false,
                onMouseDown(event) {
                  input.onMouseDown?.(event);
                  isInteractivePressTarget(event) || event.preventDefault();
                },
                onKeyDown(event) {
                  input.onKeyDown?.(event);
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
      let value2 = cell.getPopup(),
        value3 =
          value2 === null
            ? []
            : Array.from(
                value2.querySelectorAll<HTMLElement>(
                  '[role^="menuitem"]:not([data-disabled])',
                ),
              ),
        value4 =
          event.key === "ArrowDown" ? value3[0] : value3[value3.length - 1],
        value5 = asElement(value4 ?? null);
      value5 !== null &&
        value5.hasAttribute("data-highlighted") &&
        (event.preventDefault(),
        event.stopImmediatePropagation(),
        (value5 as HTMLElement).focus({
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
          options: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let { finalFocus: value, popupRef: value2 } = useOpenerReturn({
            registerOpenerReturn: finalFocus == null,
          });
          useKeyboardContextMenuFocus(value2);
          let value3 = useDefaultLayer("contextmenu"),
            { elementRef: value4, overlayAttrs: value5 } = useMenuInnerOverlay(),
            value6 = useMergedRefs(options, value2, value4);
          return (
            <ResetSheetContext>
              <PopupSurface
                {...value3.portalProps}
                surface={surfaceBackgroundTokens.popover}
                companionModalCatcher={true}
                closeOnActivityHide={true}
              >
                <CollisionPaddingProvider
                  override={collisionPadding}
                  provideInherit={true}
                >
                  {(input: CollisionPadding) => (
                    <LayerBaseContext.Provider value={value3.base}>
                      <npm_ContextMenu_Ex.Positioner
                        style={value3.style}
                        anchor={anchor}
                        side={side}
                        align={align}
                        sideOffset={sideOffset}
                        collisionPadding={input}
                      >
                        <npm_ContextMenu_Ex.Popup
                          data-cds={dataCds}
                          {...value5}
                          ref={value6}
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
      MenuPopupCss_2 = `button,a[href],label,[role="button"],select,[tabindex]:not([tabindex="-1"]),${SheetsScrollAreaLabel_2}`;
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
