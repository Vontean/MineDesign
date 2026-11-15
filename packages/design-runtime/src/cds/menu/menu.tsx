import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
import type {
  CollisionPadding,
  ContextMenuState,
  ControlSize,
  Density,
  ForwardComponent,
  ImeKeyEvent,
  MenuItemProps,
  MenuItems,
  MenuItemsContent,
  MenuPendingProps,
  MenuPopupFocusEvent,
  MenuPopupKeyboardEvent,
  MenuPopupProps,
  MenuProps,
  MenuRootProps,
  MenuSearchProps,
  MenuSubmenuProps,
  MenuSubmenuTriggerProps,
  MenuTextState,
  MenuTriggerButtonProps,
  OverlayActions,
  OverlayKind,
  PassiveOpenCell,
  PassivePopupTransform,
  SearchKeyEvent,
} from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { Button, initializeButtonButton, useButtonGroupOptions } from "../button/button";
import { CheckboxVisual, initializeComponentsCheckbox } from "../components/checkbox";
import { CollisionPaddingProvider, ComponentsIconContext, Icon, IconRenderer, initializeComponentsIcon_2, initializeComponentsIcon_3 } from "../components/icon";
import { initializeComponentsShortcut, parseSingleShortcut, Shortcut, useAppleKeyboard } from "../components/shortcut";
import { ComponentsSkeletonAssignValue, initializeComponentsSkeleton, SkeletonGroup } from "../components/skeleton";
import { initializeComponentsTextInput, TextInput } from "../components/text-input";
import { ActivityBoundary, initializeDomRefComposition, initializeDomRefComposition_2, initializeDomRefComposition_3, isHtmlElement, useEventRef, useMergedRefs } from "../dom/ref-composition";
import { initializeHooksLayoutEffect, useIsomorphicLayoutEffect } from "../hooks/layout-effect";
import { coarsePointerMediaQuery, initializeHooksMediaQuery, useWindowMediaQuery } from "../hooks/media-query";
import { asElement, initializeHooksStableCallback, initializeHooksStableCallback_2, useOptionalStableCallback, useStableCallback } from "../hooks/stable-callback";
import { initializeLinkRouter, omitRouterOptions, pickRouterOptions, useLinkProps } from "../links";
import { CdsFocusesNothingAttribute, initializeMenuConfiguration, MenuConfigurationContext, MenuConfigurationContext_2, MenuConfigurationLabelOpenConfig, MenuItemContext, MenuRootContext, MenuSheetLabelsContext, MenuSurfaceContext, MenuTriggerContext, PopupScrollArea, useMutableMenuRef, warnNestedMenuInitialFocus, warnNestedMenuLayerOffset } from "./configuration";
import { initializeMenuItemStyles, initializeMenuItemStyles_2, initializeMenuItemStyles_3, MenuItemStylesClassNames, MenuItemStylesProviderValue, menuItemVariants, MenuPopupElement, useMenuPopupFocus, useMenuTriggerRef, usePopupEntryAnimation } from "./item-styles";
import { initializeMenuPassiveOpenGate, PassiveOpenCellContext } from "./passive-open-gate";
import { ContextMenuPopupFrame, initializeMenuPopup, initializeMenuPopup_2, isScrollbarPointerEvent, MenuPopupCss, PassiveOpenGate, usePassiveOpenCell, usePassiveOpenGate, usePassiveOpenHandlers } from "./popup";
import { initializeOverlaysBackdrop, OverlayBackdrop, OverlaysBackdropVisibilityOpacityConfig, useRestoreFocusOnClose } from "../overlays/backdrop";
import { initializeOverlaysImperativeHandle, useOverlayImperativeHandle } from "../overlays/imperative-handle";
import { initializeOverlaysLayers, LayerBaseContext, useLayer } from "../overlays/layers";
import { initializePlatformRootFontSize_2, PopupSurface } from "../platform/root-font-size";
import { initializeSheetsMenuPopup } from "../sheets/menu-popup";
import { initializeSheetsPopupStack, isInsideSheetPopup, SheetPopupContext, SheetPopupProvider, useAvailableSheetParts, useIsSheet, useOverlayOpenState, useSheetInteractionMode, useSheetPopup, useSheetState } from "../sheets/popup-stack";
import { initializeSheetsPresentation, useOpenSnapshot } from "../sheets/presentation";
import { initializeSheetsScrollArea, initializeSheetsScrollArea_2, recordKeyboardContextMenu } from "../sheets/scroll-area";
import { cn, initializeClassNames } from "../theme/class-names";
import { getControlSizeRank, initializeCdsRoot, useCdsWindow, useDensity, useOverlayRoot } from "../theme/root";
import { initializeThemeSurfaces, surfaceBackgroundTokens, virtualTriggerAnchor } from "../theme/surfaces";
import { DisabledReasonDescription, hasDisabledReason, initializeTooltipDisabledReason } from "../tooltip/disabled-reason";
import { DisabledReasonTooltip, initializeTooltipTooltip, Tooltip, TooltipImplProvider } from "../tooltip/tooltip";
import { initializeNpm__base_ui_react_BXe, initializeNpm__base_ui_react_jhe, initializeNpm__base_ui_react_jj, initializeNpm_clsx_xh, load_react, load_react_jsx_runtime, npm_clsx_Ea, npm_ContextMenu_Ex, npm_Menu_La, npm_Menubar_yye as R_npm_Menubar_yye } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var noImeTimestamp: number;
var MenuMenuAlias: number;
var MenuMenuObservedElements: WeakSet<Event>;
var MenuMenuInsertParagraphInsertLineBreakSet: Set<string>;
var MenuMenuBeforeinputKeydownKeyupValues: string[];
var initializeMenuMenu: () => void;
var jsxMenuMenu: typeof import("react/jsx-runtime");
var initializeMenuMenu_2: () => void;
var initializeMenuMenu_3: () => void;
var reactMenuMenu: typeof React;
var initializeMenuMenu_4: () => void;
var reactMenuMenu_2: typeof React;
var jsxMenuMenu_2: typeof import("react/jsx-runtime");
var MenuMenuPattern: RegExp;
var MenuPopup: ForwardComponent<HTMLDivElement, MenuPopupProps>;
var MenuSheetCapablePopup: ForwardComponent<HTMLDivElement, MenuPopupProps>;
var MenuItem: ForwardComponent<HTMLDivElement, MenuItemProps>;
var MenuSubmenuTrigger: ForwardComponent<
  HTMLDivElement,
  MenuSubmenuTriggerProps
>;
var MenuMenuClassNames: string;
var MenuTriggerButton: ForwardComponent<
  HTMLButtonElement,
  MenuTriggerButtonProps
>;
var MenuMenuConstant: number;
var MenuMenuWidthHeightConfig: {
  width: number;
  height: number;
};
var DataHighlightedTabindex0Value: string;
var MenuBar: ForwardComponent<
  HTMLDivElement,
  import("@base-ui/react/menubar").Menubar.Props
>;
var MenuMenuAssignValue: typeof Menu & {
  Root: typeof MenuRoot;
  Bar: typeof MenuBar;
  Trigger: typeof import("@base-ui/react/menu").Menu.Trigger;
  TriggerButton: typeof MenuTriggerButton;
  Popup: typeof MenuPopup;
  Item: typeof MenuItem;
  Separator: typeof MenuSeparator;
  Group: typeof import("@base-ui/react/menu").Menu.Group;
  GroupLabel: typeof MenuGroupLabel;
  Header: typeof MenuHeader;
  Submenu: typeof MenuSubmenu;
  SubmenuTrigger: typeof MenuSubmenuTrigger;
  SearchablePopup: typeof MenuSearchablePopup;
  PendingList: typeof MenuPendingList;
};
var initializeMenuMenu_5: () => void;
function isAppleWebKit(): boolean {
  return typeof window === "undefined"
    ? false
    : /Apple Computer/.test(window.navigator.vendor as string);
}
function rememberImeEnter(input: number): void {
  MenuMenuAlias = input;
}
function resetImeEnterTimestamp(event: ImeKeyEvent): void {
  (event.key !== "Enter" ||
    event.shiftKey ||
    event.altKey ||
    event.keyCode === 229 ||
    event.isComposing === true ||
    event.nativeEvent?.isComposing === true) &&
    (MenuMenuAlias = noImeTimestamp);
}
function shouldIgnoreImeEvent(input: KeyboardEvent): boolean {
  return input.isComposing || input.keyCode === 229
    ? ((MenuMenuAlias = noImeTimestamp), true)
    : MenuMenuObservedElements.has(input)
      ? true
      : isAppleWebKit() && Math.abs(input.timeStamp - MenuMenuAlias) < 500
        ? ((MenuMenuAlias = noImeTimestamp),
          input.metaKey || input.ctrlKey
            ? false
            : (MenuMenuObservedElements.add(input), true))
        : false;
}
function consumeImeFollowupEvents(
  input: KeyboardEvent,
  options: HTMLElement,
  context: () => void,
): void {
  if (!MenuMenuObservedElements.has(input)) return;
  let value = input,
    callback = (event: Event): void => {
      if (event !== value) {
        for (let value2 of MenuMenuBeforeinputKeydownKeyupValues)
          options.removeEventListener(value2, callback, {
            capture: true,
          });
        event.type === "beforeinput" &&
          "inputType" in event &&
          typeof event.inputType == "string" &&
          MenuMenuInsertParagraphInsertLineBreakSet.has(event.inputType) &&
          (event.preventDefault(), context());
      }
    };
  for (let value2 of MenuMenuBeforeinputKeydownKeyupValues)
    options.addEventListener(value2, callback, {
      capture: true,
    });
}
function MenuContextProviders(
  input: React.ReactNode,
  options: PassiveOpenCell | null,
  context: React.RefObject<OverlayActions | null>,
  value: boolean = false,
): React.ReactElement {
  useUiLocale();
  let value2 = (
    <PassiveOpenCellContext.Provider value={options}>
      <MenuTriggerContext.Provider value={context}>
        <MenuSurfaceContext.Provider value={null}>
          <MenuRootContext.Provider value={null}>
            <MenuItemContext.Provider
              value={MenuConfigurationLabelOpenConfig}
            >
              <MenuConfigurationContext.Provider value={value}>
                {value ? (input) : (<TooltipImplProvider>
                    {input}
                  </TooltipImplProvider>)}
              </MenuConfigurationContext.Provider>
            </MenuItemContext.Provider>
          </MenuRootContext.Provider>
        </MenuSurfaceContext.Provider>
      </MenuTriggerContext.Provider>
    </PassiveOpenCellContext.Provider>
  );
  return value ? (
    <MenuItemStylesProviderValue value={undefined}>
      {value2}
    </MenuItemStylesProviderValue>
  ) : (
    value2
  );
}
function isNestedSheetTarget(
  input: EventTarget | null | undefined,
  options?: string,
): boolean {
  let value = (0, asElement)(input)?.closest("[data-nested]") ?? null;
  if (value === null) return false;
  if (options === undefined) return true;
  let value2 = (0, asElement)(value.closest("[data-sheet-tree]"));
  return (
    value2 !== null && value2.getAttribute("data-sheet-tree") === options
  );
}
function isFocusOutEvent(input: Event | undefined): input is FocusEvent {
  return (
    input !== undefined &&
    "relatedTarget" in input &&
    input.type === "focusout"
  );
}
function shouldKeepNestedMenuOpen(
  input: boolean,
  options: import("@base-ui/react/menu").Menu.Root.ChangeEventDetails,
  context?: string,
): boolean {
  if (input) return false;
  let { reason: value, event: value2 } = options;
  if (value === "outside-press")
    return isNestedSheetTarget(value2?.target, context);
  if (value === "focus-out" && isFocusOutEvent(value2)) {
    let value3 = (0, asElement)(value2.relatedTarget),
      value4 =
        value2.relatedTarget === null ||
        (value3 !== null &&
          (value3 === value3.ownerDocument.body || !value3.isConnected));
    return (
      isNestedSheetTarget(value2.relatedTarget, context) ||
      (value4 && isNestedSheetTarget(value2.target, context))
    );
  }
  return false;
}
function cancelNestedMenuClose(
  input: boolean,
  options: import("@base-ui/react/menu").Menu.Root.ChangeEventDetails,
  context?: string,
): boolean {
  return shouldKeepNestedMenuOpen(input, options, context)
    ? (options.cancel(), true)
    : false;
}
function extractReactText(input: React.ReactNode): string | undefined {
  if (typeof input == "string") return input;
  if (typeof input == "number") return String(input);
  if (input == null || typeof input == "boolean") return "";
  if (!Array.isArray(input)) return;
  let text = "";
  for (let value of input as readonly React.ReactNode[]) {
    let value2 = extractReactText(value);
    if (value2 === undefined) return;
    text += value2;
  }
  return text;
}
function normalizeMenuText(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}
function useMenuItemText(
  input: React.ReactNode,
  options?: string,
): MenuTextState {
  let value = (0, reactMenuMenu.useRef)<HTMLSpanElement | null>(null),
    value2 = (0, reactMenuMenu.useRef)<HTMLElement | null>(null),
    [value3, value4] = (0, reactMenuMenu.useState)<string | undefined>(),
    value5 =
      (options === undefined &&
        normalizeMenuText(extractReactText(input) ?? "")) ||
      undefined,
    value6 = options === undefined && value5 === undefined;
  (0, useIsomorphicLayoutEffect)(() => {
    if (!value6) return;
    let value7 = normalizeMenuText(value.current?.textContent ?? ""),
      value8 = (value2.current?.textContent ?? "").startsWith(value7),
      value9 =
        value7 === "" || (value8 && value3 !== value7) ? undefined : value7;
    value9 !== value3 && value4(value9);
  });
  return {
    label: options ?? value5 ?? (value6 ? value3 : undefined),
    labelSpanRef: value,
    rowRef: value2,
  };
}
function menuShortcutClassName(
  input: string | readonly string[] | undefined,
): string {
  return MenuMenuPattern.test(input as string) ? "tabular-nums" : "";
}
function MenuShortcut({
  keys: keys,
}: {
  keys: string | readonly string[];
}): React.ReactElement {
  useUiLocale();
  return (
    <Shortcut
      keys={keys}
      variant={"text"}
      aria-hidden={true}
      className={(0, cn)(
        "pointer-coarse:hidden text-footnote",
        menuShortcutClassName(keys),
      )}
    />
  );
}
function MenuPopupContent(
  input: MenuPopupProps,
  options: React.ForwardedRef<HTMLDivElement>,
  context: boolean,
  value: boolean,
): React.ReactElement {
  useUiLocale();
  let {
      side: value2,
      align: value17 = "start",
      sideOffset: value3,
      collisionPadding: value4,
      collisionAvoidance: value5,
      anchor: value6,
      container: value7,
      className: value8,
      children: value9,
      header: value10,
      footer: value11,
      maxVisibleItems: value12,
      layerOffset: value13,
      stableWhileOpen: value18 = false,
      "data-cds": value19 = "Menu",
      style: value14,
      initialFocus: value15,
      ...value16
    } = input,
    value20 = (0, useOverlayRoot)(),
    value21 = (0, reactMenuMenu_2.useContext)(MenuRootContext),
    value22 =
      (0, reactMenuMenu_2.useContext)(MenuConfigurationContext) &&
      value21 === null,
    value23 = (0, reactMenuMenu_2.useContext)(ComponentsIconContext),
    value24 = value4 ?? value23?.collisionPadding,
    value25 = (0, reactMenuMenu_2.useMemo)(
      () =>
        value6 !== undefined || !value21
          ? value6
          : (0, virtualTriggerAnchor)(value21),
      [value6, value21],
    ),
    value26 =
      value3 ??
      (value22 ? undefined : value21 && value6 === undefined ? 2 : 6),
    value27 = (0, usePopupEntryAnimation)({
      enabled: value18 && !value22,
      side: value2,
      align: value17,
    }),
    value28 = (0, useMenuPopupFocus)(
      value21?.triggerRef,
      value16.finalFocus,
    ),
    value29 = value22
      ? value16.finalFocus === undefined || value16.finalFocus === null
      : value6 != null &&
        value21 === null &&
        value16.finalFocus === undefined,
    value30 = (0, usePassiveOpenCell)(value21 === null);
  value30.root?.declareFocusProps(value15, value16.finalFocus);
  context &&
    value21 !== null &&
    value15 !== undefined &&
    (0, warnNestedMenuInitialFocus)();
  let value31 = (0, useRestoreFocusOnClose)(value),
    value32 = (0, useEventRef)((input2) => {
      value27.popupRef(input2);
      value28(input2);
      value31(input2);
      value30.root?.registerPopup(input2);
    }, options);
  context &&
    value21 !== null &&
    value13 !== undefined &&
    (0, warnNestedMenuLayerOffset)();
  let value33 = (0, useLayer)(
    value22 ? "contextmenu" : "menu",
    value21 === null ? value13 : undefined,
  );
  return (
    <npm_Menu_La.Portal container={value7 ?? value20}>
      <PopupSurface
        {...value33.portalProps}
        style={
          value
            ? {
                ...value33.portalProps.style,
                ...OverlaysBackdropVisibilityOpacityConfig,
              }
            : value33.portalProps.style
        }
        surface={surfaceBackgroundTokens.popover}
        companionModalCatcher={true}
        closeOnActivityHide={true}
      >
        <CollisionPaddingProvider
          override={value24}
          container={value7 ?? value20}
          provideInherit={true}
        >
          {(input2: CollisionPadding) => (
            <LayerBaseContext.Provider value={value33.base}>
              <npm_Menu_La.Positioner
                ref={value27.positionerRef}
                className={value27.held?.positionerClassName}
                style={
                  value27.held !== null
                    ? {
                        ...value33.style,
                        ...value27.held.positionerStyle,
                      }
                    : value33.style
                }
                side={value27.side}
                align={value27.align}
                sideOffset={value26}
                collisionPadding={input2}
                collisionAvoidance={value5}
                anchor={value25}
              >
                <PassiveOpenGate
                  cell={value30.cell}
                  nested={value21 !== null}
                >
                  {(input3: PassivePopupTransform) => (
                    <MenuPopupElement
                      anchoredWithoutFinalFocus={value29}
                      cursorAnchored={value22}
                      data-cds={value19}
                      ref={value32}
                      {...input3(value16)}
                      style={
                        value27.held !== null
                          ? typeof value14 == "function"
                            ? (
                                input4: import("@base-ui/react/menu").Menu.Popup.State,
                              ) => ({
                                ...value14(input4),
                                pointerEvents: "auto",
                              })
                            : {
                                ...value14,
                                pointerEvents: "auto",
                              }
                          : value14
                      }
                      className={(0, cn)(
                        MenuPopupCss,
                        value8,
                      )}
                    >
                      <PopupScrollArea
                        header={value10}
                        footer={value11}
                        maxVisibleItems={value12}
                      >
                        {value9}
                      </PopupScrollArea>
                    </MenuPopupElement>
                  )}
                </PassiveOpenGate>
              </npm_Menu_La.Positioner>
            </LayerBaseContext.Provider>
          )}
        </CollisionPaddingProvider>
      </PopupSurface>
    </npm_Menu_La.Portal>
  );
}
function MenuSubmenu({
  actionsRef: actionsRef,
  ...props
}: MenuSubmenuProps): React.ReactElement {
  useUiLocale();
  let [value, value2] = (0, reactMenuMenu_2.useState)(
      props.open ?? props.defaultOpen ?? false,
    ),
    value3 = (0, reactMenuMenu_2.useRef)(value),
    value4 = (0, useOptionalStableCallback)(props.onOpenChange),
    { sheet: value5 } = (0, useSheetState)(),
    value6 = (0, reactMenuMenu_2.useContext)(SheetPopupContext),
    value7 = value6?.treeId,
    value8: React.RefObject<React.ReactNode> = (0, reactMenuMenu_2.useRef)(
      null,
    ),
    value9 = (0, reactMenuMenu_2.useCallback)(
      (input: React.ReactNode): void => {
        value8.current = input;
      },
      [],
    ),
    [value10, value11] = (0, reactMenuMenu_2.useState)<React.ReactNode>(null),
    value12 = (0, reactMenuMenu_2.useCallback)(
      (
        input: boolean,
        options: import("@base-ui/react/menu").Menu.Root.ChangeEventDetails,
      ): void => {
        if (!(value5 && cancelNestedMenuClose(input, options, value7))) {
          if (
            value5 &&
            !input &&
            value6?.refusesAmbientClose(options) === true
          ) {
            options.cancel();
            return;
          }
          value4?.(input, options);
          options.isCanceled ||
            ((value3.current = input),
            value2(input),
            input && value11(value8.current));
        }
      },
      [value4, value5, value6, value7],
    ),
    value13 = (0, reactMenuMenu_2.useRef)<HTMLElement | null>(null),
    value14 = (0, reactMenuMenu_2.useCallback)(
      (input: HTMLElement | null): void => {
        value13.current = input;
      },
      [],
    ),
    value15 = (0, reactMenuMenu_2.useRef)<OverlayActions | null>(null);
  (0, useOverlayImperativeHandle)(value15, actionsRef);
  let value16 = (0, reactMenuMenu_2.useCallback)(() => {
      (value15.current as Required<OverlayActions> | null)?.close();
    }, []),
    value17 = (0, reactMenuMenu_2.useContext)(MenuSurfaceContext),
    value18 = (0, reactMenuMenu_2.useContext)(MenuTriggerContext),
    value19 = value17 ?? value18,
    value20 = (0, reactMenuMenu_2.useMemo)(
      () => ({
        triggerRef: value13,
        setTriggerNode: value14,
        openRef: value3,
        close: value16,
        stashLabel: value9,
      }),
      [value14, value16, value9],
    ),
    value21 = props.open ?? value;
  (0, useIsomorphicLayoutEffect)(() => {
    value3.current = value21;
    if (value21) {
      let current = value8.current;
      value11((input) => (input === current ? input : current));
    }
  }, [value21]);
  let value22 = (0, reactMenuMenu_2.useMemo)(
    () => ({
      label: value10,
      open: value21,
    }),
    [value10, value21],
  );
  return (
    <MenuRootContext.Provider value={value20}>
      <MenuItemContext.Provider value={value22}>
        <MenuSurfaceContext.Provider value={value19}>
          <MenuTriggerContext.Provider value={value15}>
            <npm_Menu_La.SubmenuRoot
              {...props}
              actionsRef={value15}
              onOpenChange={value12}
            />
          </MenuTriggerContext.Provider>
        </MenuSurfaceContext.Provider>
      </MenuItemContext.Provider>
    </MenuRootContext.Provider>
  );
}
function MenuSeparator(): React.ReactElement {
  useUiLocale();
  return (
    <npm_Menu_La.Separator
      className={"compact:mx-2 comfortable:mx-2.5 my-1 h-px bg-border"}
    />
  );
}
function MenuHeader({
  children: children,
  className: className,
}: React.PropsWithChildren<{
  className?: string;
}>): React.ReactElement {
  useUiLocale();
  let value = (0, useIsSheet)(),
    value2 =
      (0, reactMenuMenu_2.useContext)(MenuRootContext) !== null,
    { label: value3 } = (0, reactMenuMenu_2.useContext)(
      MenuItemContext,
    ),
    value4 =
      value &&
      value2 &&
      typeof children == "string" &&
      typeof value3 == "string" &&
      children.trim() === value3.trim();
  return (
    <div
      role={"presentation"}
      className={(0, cn)(
        MenuMenuClassNames,
        value4 && "first:hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}
function MenuGroupLabel({
  children: children,
  className: className,
}: React.PropsWithChildren<{
  className?: string;
}>): React.ReactElement {
  useUiLocale();
  return (
    <npm_Menu_La.GroupLabel
      className={(0, cn)(MenuMenuClassNames, className)}
    >
      {children}
    </npm_Menu_La.GroupLabel>
  );
}
function isMenuItemsArray(input: MenuItemsContent): input is MenuItems {
  return Array.isArray(input);
}
function renderMenuItems(input: MenuItemsContent): React.ReactNode {
  return isMenuItemsArray(input)
    ? input.map((event, options) =>
        event === "separator" ? (
          <MenuSeparator key={options} />
        ) : event.label === undefined ||
          event.label === null ||
          event.label === "" ||
          event.label === false ? null : event.items ? (
          <reactMenuMenu_2.Fragment key={options}>
            {event.separatorBefore && (<MenuSeparator />)}
            <MenuSubmenu disabled={event.disabled}>
              <MenuSubmenuTrigger icon={event.icon} hint={event.hint}>
                {event.label}
              </MenuSubmenuTrigger>
              <MenuPopup>{renderMenuItems(event.items)}</MenuPopup>
            </MenuSubmenu>
          </reactMenuMenu_2.Fragment>
        ) : (
          <reactMenuMenu_2.Fragment key={options}>
            {event.separatorBefore && (<MenuSeparator />)}
            <MenuItem
              icon={event.icon}
              shortcut={event.shortcut}
              variant={event.variant}
              disabled={event.disabled}
              checked={event.checked}
              checkedRole={event.checkedRole}
              indicator={event.indicator}
              indeterminate={event.indeterminate}
              hint={event.hint}
              description={event.description}
              disabledReason={event.disabledReason}
              keepOpen={event.keepOpen}
              leading={event.leading}
              trailing={event.trailing}
              href={event.href}
              routerOptions={event.routerOptions}
              target={event.target}
              onClick={event.onSelect}
            >
              {event.label}
            </MenuItem>
          </reactMenuMenu_2.Fragment>
        ),
      )
    : input;
}
function menuCaretSize(input: Density, options?: ControlSize): "sm" | "xs" {
  return (0, getControlSizeRank)(input, options) >= 4 ? "sm" : "xs";
}
function MenuCaret({
  size: size,
}: {
  size?: ControlSize;
}): React.ReactElement {
  useUiLocale();
  let value = (0, useDensity)(),
    value2 = (0, useButtonGroupOptions)();
  return (
    <Icon
      name={"CaretDown"}
      size={menuCaretSize(value, size ?? value2?.size)}
      data-cds-part={"menu-caret"}
      className={"shrink-0 opacity-60"}
    />
  );
}
function ContextMenuContent({
  side: side,
  align: align,
  sideOffset: sideOffset,
  collisionPadding: collisionPadding,
  finalFocus: finalFocus,
  dataCds: dataCds,
  items: items,
}: Pick<
  MenuPopupProps,
  "side" | "align" | "sideOffset" | "collisionPadding" | "finalFocus"
> & {
  dataCds?: string;
  items: MenuItemsContent;
}): React.ReactElement {
  useUiLocale();
  return (
    <ContextMenuPopupFrame
      side={side}
      align={align}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      finalFocus={finalFocus}
      data-cds={dataCds ?? "Menu"}
    >
      {renderMenuItems(items)}
    </ContextMenuPopupFrame>
  );
}
function Menu(input: MenuProps): React.ReactElement {
  useUiLocale();
  let value = (0, useSheetInteractionMode)(),
    value2 = (0, reactMenuMenu_2.useContext)(
      MenuConfigurationContext_2,
    ),
    value3: React.RefObject<OverlayActions | null> = (0,
    useMutableMenuRef)(),
    onOpenChange = input.onOpenChange,
    { onOpenChange: value4, triggerRef: value5 } = (0,
    useMenuTriggerRef)((input2, options) => {
      onOpenChange?.(input2, options);
      (0, recordKeyboardContextMenu)(value3, input2, options);
    }, value2),
    value6 = (0, useOverlayRoot)();
  return value
    ? (() => {
        const _Component = useContextMenuRoot;
        return <_Component {...input} />;
      })()
    : ContextMenu(input, value6, {
        triggerRef: value5,
        onOpenChange: value4,
        actionsRef: value3,
        contextMenuOnOpenChange: value4,
        inMenuBar: value2,
      });
}
function useContextMenuRoot(input: MenuProps): React.ReactElement {
  let {
      open: value,
      sheetTitle: value2,
      backLabel: value3,
      closeLabel: value4,
    } = input,
    value5 = (0, reactMenuMenu_2.useMemo)(
      () => ({
        sheetTitle: value2,
        backLabel: value3,
        closeLabel: value4,
      }),
      [value2, value3, value4],
    ),
    value6 = (0, useOverlayRoot)(),
    value7 = (0, reactMenuMenu_2.useContext)(
      MenuConfigurationContext_2,
    ),
    { onOpenChange: value8, triggerRef: value9 } = (0,
    useMenuTriggerRef)(input.onOpenChange, value7),
    value10 = (0, useOverlayOpenState)({
      open: value,
      onOpenChange: value8,
    }),
    open = value10.open,
    value11 = (0, useSheetPopup)({
      open: open,
      onOpenChange: value10.onOpenChange,
      closable: !(value !== undefined && input.onOpenChange === undefined),
      refuseClose: menuCloseTargetsNestedPopup,
    }),
    value12 = ContextMenu(input, value6, {
      triggerRef: value9,
      onOpenChange: value11.onOpenChange,
      onOpenChangeComplete: value11.onOpenChangeComplete,
      actionsRef: value11.actionsRef,
      sheetCapable: true,
      inMenuBar: value7,
    });
  return (
    <SheetPopupProvider value={value11}>
      <MenuSheetLabelsContext.Provider value={value5}>
        {value12}
      </MenuSheetLabelsContext.Provider>
    </SheetPopupProvider>
  );
}
function ContextMenu(
  input: MenuProps,
  options: HTMLElement | undefined,
  context: ContextMenuState,
): React.ReactElement {
  useUiLocale();
  let {
    items: value,
    side: value2,
    align: value3,
    sideOffset: value4,
    collisionPadding: value5,
    finalFocus: value6,
    open: value7,
    disabled: value8,
    className: value9,
    style: value10,
    "data-cds": value11,
  } = input;
  if (input.trigger === "context-menu")
    return value8 ? (
      <div data-disabled={""} className={value9}>
        {input.children}
      </div>
    ) : context.sheetCapable ? (
      <ActivityBoundary actionsRef={context.actionsRef}>
        <npm_ContextMenu_Ex.Root
          open={value7}
          onOpenChange={context.onOpenChange}
          onOpenChangeComplete={context.onOpenChangeComplete}
          actionsRef={context.actionsRef}
        >
          {MenuContextProviders(
            <jsxMenuMenu_2.Fragment>
              <npm_ContextMenu_Ex.Trigger className={value9}>
                {input.children}
              </npm_ContextMenu_Ex.Trigger>
              <MenuPopup
                side={value2}
                align={value3}
                sideOffset={value4}
                collisionPadding={value5}
                finalFocus={value6}
                data-cds={value11 ?? "Menu"}
              >
                {renderMenuItems(value)}
              </MenuPopup>
            </jsxMenuMenu_2.Fragment>,
            null,
            context.actionsRef,
            true,
          )}
        </npm_ContextMenu_Ex.Root>
      </ActivityBoundary>
    ) : (
      <ActivityBoundary actionsRef={context.actionsRef}>
        <npm_ContextMenu_Ex.Root
          open={value7}
          onOpenChange={context.contextMenuOnOpenChange}
          actionsRef={context.actionsRef}
        >
          <npm_ContextMenu_Ex.Trigger className={value9}>
            {input.children}
          </npm_ContextMenu_Ex.Trigger>
          <npm_ContextMenu_Ex.Portal container={options}>
            <MenuTriggerContext.Provider value={context.actionsRef}>
              <ContextMenuContent
                side={value2}
                align={value3}
                sideOffset={value4}
                collisionPadding={value5}
                finalFocus={value6}
                dataCds={value11}
                items={value}
              />
            </MenuTriggerContext.Provider>
          </npm_ContextMenu_Ex.Portal>
        </npm_ContextMenu_Ex.Root>
      </ActivityBoundary>
    );
  let value12: React.ReactNode;
  if (input.renderTrigger !== undefined)
    value12 = (
      <npm_Menu_La.Trigger
        disabled={value8}
        className={value9}
        style={value10}
        render={input.renderTrigger}
      />
    );
  else if (input.iconOnly) {
    let value13 =
        input.tooltip === false
          ? undefined
          : typeof input.tooltip == "string"
            ? input.tooltip
            : input["aria-label"],
      value14 = (
        <npm_Menu_La.Trigger
          disabled={value8}
          render={
            <Button
              variant={input.variant}
              size={input.size}
              iconOnly={true}
              icon={input.icon || "DotsVertical"}
              aria-label={input["aria-label"]}
              pressed={input.pressed}
              tooltip={false}
              className={value9}
              style={value10}
            />
          }
        />
      ),
      value15 = value13 ? (
        <Tooltip content={value13}>{value14}</Tooltip>
      ) : (
        value14
      );
    value12 =
      input.disabledReason !== undefined ? (
        <DisabledReasonTooltip
          side={input.disabledReasonSide}
          reason={value8 ? input.disabledReason : undefined}
        >
          {value15}
        </DisabledReasonTooltip>
      ) : (
        value15
      );
  } else
    value12 = (
      <npm_Menu_La.Trigger
        disabled={value8}
        render={
          <Button
            variant={input.variant}
            size={input.size}
            icon={input.icon}
            iconPosition={input.iconPosition}
            aria-label={input["aria-label"]}
            className={value9}
            style={value10}
          >
            {input.label}
            <MenuCaret size={input.size} />
          </Button>
        }
      />
    );
  return (
    <MenuItemStylesProviderValue value={context.triggerRef}>
      <ActivityBoundary actionsRef={context.actionsRef}>
        <npm_Menu_La.Root
          open={value7}
          onOpenChange={context.onOpenChange}
          onOpenChangeComplete={context.onOpenChangeComplete}
          actionsRef={context.actionsRef}
          modal={context.inMenuBar ? undefined : true}
        >
          {MenuContextProviders(
            <jsxMenuMenu_2.Fragment>
              {value12}
              <MenuPopup
                side={value2}
                align={value3}
                sideOffset={value4}
                collisionPadding={value5}
                finalFocus={value6}
                data-cds={value11}
              >
                {renderMenuItems(value)}
              </MenuPopup>
            </jsxMenuMenu_2.Fragment>,
            null,
            context.actionsRef,
          )}
        </npm_Menu_La.Root>
      </ActivityBoundary>
    </MenuItemStylesProviderValue>
  );
}
function menuCloseTargetsNestedPopup(
  input: import("@base-ui/react/menu").Menu.Root.ChangeEventDetails,
  options?: string,
): boolean {
  return shouldKeepNestedMenuOpen(false, input, options);
}
function MenuRoot(input: MenuRootProps): React.ReactElement {
  useUiLocale();
  let {
      children: value,
      sheetTitle: value2,
      backLabel: value3,
      closeLabel: value4,
      ...value5
    } = input,
    value6 = (0, useSheetInteractionMode)(),
    value7 = (0, reactMenuMenu_2.useContext)(
      MenuConfigurationContext_2,
    ),
    { onOpenChange: value8, triggerRef: value9 } = (0,
    useMenuTriggerRef)(value5.onOpenChange, value7),
    value10 = (0, usePassiveOpenGate)(value8, value5.open, !value7),
    value11: React.RefObject<OverlayActions | null> = (0,
    useMutableMenuRef)();
  (0, useOverlayImperativeHandle)(value11, value5.actionsRef);
  return value6 ? (
    <ActivityBoundary actionsRef={value11}>
      <MenuRoot_2 {...input} actionsRef={value11} />
    </ActivityBoundary>
  ) : (
    <MenuItemStylesProviderValue value={value9}>
      <ActivityBoundary actionsRef={value11}>
        <npm_Menu_La.Root
          {...value5}
          modal={value7 ? undefined : value5.modal}
          actionsRef={value11}
          onOpenChange={value10.onOpenChange}
        >
          {typeof value == "function" ? ((input2: never) =>
                MenuContextProviders(value(input2), value10.cell, value11)) : (MenuContextProviders(value, value10.cell, value11))}
        </npm_Menu_La.Root>
      </ActivityBoundary>
    </MenuItemStylesProviderValue>
  );
}
function MenuRoot_2(input: MenuRootProps): React.ReactElement {
  useUiLocale();
  let {
      children: value,
      sheetTitle: value2,
      backLabel: value3,
      closeLabel: value4,
      ...value5
    } = input,
    value6 = (0, reactMenuMenu_2.useMemo)(
      () => ({
        sheetTitle: value2,
        backLabel: value3,
        closeLabel: value4,
      }),
      [value2, value3, value4],
    ),
    value7 = (0, reactMenuMenu_2.useContext)(
      MenuConfigurationContext_2,
    ),
    { onOpenChange: value8, triggerRef: value9 } = (0,
    useMenuTriggerRef)(input.onOpenChange, value7),
    value10 = (0, usePassiveOpenGate)(value8, input.open, !value7),
    value11 = (0, useOverlayOpenState)({
      ...input,
      onOpenChange: value10.onOpenChange,
    }),
    value12 = (0, useOpenSnapshot)(
      value11.open,
      () => value10.cell.getLevel() === "declared",
      false,
    ),
    value13 = (0, useSheetPopup)({
      open: value11.open,
      actionsRef: input.actionsRef,
      onOpenChange: value11.onOpenChange,
      onOpenChangeComplete: input.onOpenChangeComplete,
      structurallyAnchored: value12,
      closable: !(
        input.open !== undefined && input.onOpenChange === undefined
      ),
      refuseClose: menuCloseTargetsNestedPopup,
    });
  return (
    <MenuItemStylesProviderValue value={value9}>
      <SheetPopupProvider value={value13}>
        <MenuSheetLabelsContext.Provider value={value6}>
          <npm_Menu_La.Root
            {...value5}
            modal={value7 ? undefined : (value13.modal ?? value5.modal)}
            actionsRef={value13.actionsRef}
            onOpenChange={value13.onOpenChange}
            onOpenChangeComplete={value13.onOpenChangeComplete}
          >
            {typeof value == "function" ? ((input2: never) =>
                  MenuContextProviders(
                    value(input2),
                    value10.cell,
                    value13.actionsRef,
                  )) : (MenuContextProviders(value, value10.cell, value13.actionsRef))}
          </npm_Menu_La.Root>
        </MenuSheetLabelsContext.Provider>
      </SheetPopupProvider>
    </MenuItemStylesProviderValue>
  );
}
function ResetOnUnmount({ reset: reset }: { reset: () => void }): null {
  (0, reactMenuMenu_2.useEffect)(() => () => reset(), [reset]);
  return null;
}
function isSearchMenuTypingKey(input: SearchKeyEvent): boolean {
  let value = input.getModifierState("AltGraph");
  return (
    ((input.key.length === 1 && input.key !== " ") ||
      input.key === "Backspace" ||
      (input.key === "Delete" && !input.shiftKey)) &&
    (!input.ctrlKey || value) &&
    !input.metaKey &&
    (!input.altKey || value) &&
    input.keyCode !== 229
  );
}
function MenuSearchTypingWatcher({
  inputRef: inputRef,
  applyKey: applyKey,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  applyKey: (key: string) => void;
}): null {
  let value = (0, reactMenuMenu_2.useContext)(
    MenuRootContext,
  )?.triggerRef;
  (0, reactMenuMenu_2.useEffect)(() => {
    let value2 = value?.current;
    if (!value2) return;
    let callback = (event: KeyboardEvent): void => {
      event.isComposing ||
        !isSearchMenuTypingKey(event) ||
        (event.preventDefault(),
        event.stopPropagation(),
        inputRef.current?.focus({
          preventScroll: true,
        }),
        applyKey(event.key));
    };
    value2.addEventListener("keydown", callback, true);
    return () => value2.removeEventListener("keydown", callback, true);
  }, [value, inputRef, applyKey]);
  return null;
}
function MenuSearchTriggerWatcher({
  inputRef: inputRef,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
}): null {
  let value = (0, reactMenuMenu_2.useContext)(MenuRootContext);
  (0, reactMenuMenu_2.useEffect)(() => {
    let value2 = value?.triggerRef.current;
    if (!value || !value2) return;
    let { openRef: value3 } = value,
      callback = (input: FocusEvent): void => {
        let current = inputRef.current,
          value4 = (0, asElement)(input.relatedTarget);
        current &&
          value4 &&
          value3.current &&
          current.closest('[role="menu"]')?.contains(value4) &&
          current.focus({
            preventScroll: true,
          });
      };
    value2.addEventListener("focus", callback);
    return () => value2.removeEventListener("focus", callback);
  }, [value, inputRef]);
  (0, reactMenuMenu_2.useEffect)(() => {
    let callback = (): void => {
      let current = inputRef.current;
      if (!current) return;
      let ancestor = current.closest('[role="menu"]'),
        activeElement = current.ownerDocument.activeElement;
      (ancestor?.contains(activeElement) && activeElement !== ancestor) ||
        current.focus({
          preventScroll: true,
        });
    };
    callback();
    let index = 0,
      index2 = 0,
      callback2 = () => {
        callback();
        index += 1;
        index < 2 && (index2 = requestAnimationFrame(callback2));
      };
    index2 = requestAnimationFrame(callback2);
    return () => cancelAnimationFrame(index2);
  }, [inputRef]);
  return null;
}
function MenuSearchablePopup({
  children: children,
  searchLabel: searchLabel,
  query: query,
  onQueryChange: onQueryChange,
  resetQueryOnClose = true,
  onSubmitQuery: onSubmitQuery,
  beforeSearch: beforeSearch,
  onKeyDown: onKeyDown,
  onFocus: onFocus,
  stableWhileOpen = true,
  ...props
}: MenuSearchProps): React.ReactElement {
  useUiLocale();
  let [value, value2] = (0, reactMenuMenu_2.useState)(""),
    value3 = query ?? value,
    value4: (input: string) => void = (0, useStableCallback)(
      (input) => {
        value2(input);
        onQueryChange?.(input);
      },
    ),
    value5 = (0, useStableCallback)(() => {
      value3 !== "" && value4("");
    }),
    value6 = (0, reactMenuMenu_2.useRef)(false);
  (0, reactMenuMenu_2.useEffect)(() => {}, [query, onQueryChange]);
  let value7 = (0, useIsSheet)(),
    value8 = (0, useWindowMediaQuery)(
      (0, useCdsWindow)(),
      coarsePointerMediaQuery,
    ),
    value9 = !value7 && !value8,
    value10 = (0, reactMenuMenu_2.useContext)(MenuSurfaceContext),
    value11 = (0, reactMenuMenu_2.useContext)(MenuTriggerContext),
    value12 = value10 ?? value11,
    value13 = (0, reactMenuMenu_2.useRef)<HTMLDivElement | null>(null),
    value14 = (0, reactMenuMenu_2.useRef)<HTMLInputElement | null>(null),
    value15 = (0, reactMenuMenu_2.useCallback)((input: string): void => {
      let current = value14.current;
      if (!current) return;
      let { value: value16 } = current,
        value17 = current.selectionStart ?? value16.length,
        value18 = current.selectionEnd ?? value16.length,
        value19 = input === "Backspace" || input === "Delete",
        value20 = value19 ? "" : input;
      if (value19 && value17 === value18)
        if (input === "Backspace") {
          let value23 = (value16.codePointAt(value17 - 2) ?? 0) > 65535;
          value17 = Math.max(0, value17 - (value23 ? 2 : 1));
        } else {
          let value23 = (value16.codePointAt(value18) ?? 0) > 65535;
          value18 = Math.min(value16.length, value18 + (value23 ? 2 : 1));
        }
      let value21 =
          value16.slice(0, value17) + value20 + value16.slice(value18),
        value22 = current.ownerDocument.defaultView ?? window;
      Object.getOwnPropertyDescriptor(
        value22.HTMLInputElement.prototype,
        "value",
      )?.set?.call(current, value21);
      current.setSelectionRange(
        value17 + value20.length,
        value17 + value20.length,
      );
      current.dispatchEvent(
        new Event("input", {
          bubbles: true,
        }),
      );
    }, []),
    callback = () => {
      let current = value13.current,
        value16 =
          current?.querySelector<HTMLElement>('[tabindex="0"]') ??
          current?.querySelector<HTMLElement>(
            'input, button, [role="radio"]',
          );
      return value16 ? ((value16 as HTMLElement).focus(), true) : false;
    };
  return (
    <MenuPopup
      {...props}
      stableWhileOpen={stableWhileOpen}
      onKeyDown={(event: MenuPopupKeyboardEvent) => {
        let current = value14.current;
        if (
          !current ||
          (event.target as Element).closest?.(
            "input, textarea, [contenteditable]",
          ) ||
          event.nativeEvent.isComposing ||
          !isSearchMenuTypingKey(event)
        ) {
          onKeyDown?.(event);
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        event.preventBaseUIHandler();
        current.focus({
          preventScroll: true,
        });
        value15(event.key);
      }}
      onFocus={(event: MenuPopupFocusEvent) => {
        onFocus?.(event);
        let currentTarget = event.currentTarget;
        value9 &&
          event.target === currentTarget &&
          currentTarget.ownerDocument.activeElement === currentTarget &&
          value14.current?.focus({
            preventScroll: true,
          });
      }}
      onMouseDown={(event: React.MouseEvent<HTMLElement>) => {
        let target = event.target as HTMLElement;
        ((0, isHtmlElement)(target) &&
          target.localName === "input") ||
          target === event.currentTarget ||
          (target.classList.contains("overflow-y-auto") &&
            (0, isScrollbarPointerEvent)(
              event.nativeEvent.offsetX,
              event.nativeEvent.offsetY,
              target,
            )) ||
          event.preventDefault();
      }}
      header={
        <jsxMenuMenu_2.Fragment>
          {beforeSearch !== undefined && (<div
              ref={value13}
              role={"presentation"}
              className={"px-sm pt-sm"}
              onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                event.key !== "Escape" &&
                  (event.stopPropagation(),
                  event.key === "Tab" &&
                    (event.preventDefault(), value14.current?.focus()));
              }}
            >
              {beforeSearch}
            </div>)}
          <TextInput
            ref={value14}
            value={value3}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              value4(event.target.value)
            }
            onCompositionEnd={(
              event: React.CompositionEvent<HTMLInputElement>,
            ) => rememberImeEnter(event.nativeEvent.timeStamp)}
            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
              resetImeEnterTimestamp(event);
              if (event.nativeEvent.isComposing || event.keyCode === 229) {
                event.stopPropagation();
                return;
              }
              if (event.key === "Enter") {
                let value16 = value3.trim();
                if (
                  onSubmitQuery !== undefined &&
                  value16 !== "" &&
                  !event.repeat &&
                  !event.shiftKey &&
                  !event.altKey
                ) {
                  let callback2 = () => {
                    onSubmitQuery(value16);
                    value12?.current?.close?.();
                  };
                  shouldIgnoreImeEvent(event.nativeEvent)
                    ? consumeImeFollowupEvents(
                        event.nativeEvent,
                        event.currentTarget,
                        callback2,
                      )
                    : (event.preventDefault(), callback2());
                }
                event.stopPropagation();
                return;
              }
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                let value16 = event.currentTarget
                    .closest('[role="menu"]')
                    ?.querySelectorAll<HTMLElement>(
                      '[role^="menuitem"]:not([aria-disabled="true"])',
                    ),
                  value17 =
                    event.key === "ArrowDown"
                      ? value16?.[0]
                      : value16?.[value16.length - 1];
                value17 !== undefined &&
                  (event.preventDefault(),
                  event.stopPropagation(),
                  (value17 as HTMLElement).focus());
                return;
              }
              if (event.key === "Tab" && !event.shiftKey && callback()) {
                event.preventDefault();
                event.stopPropagation();
                return;
              }
              event.key === "Escape" ||
                event.key === "Tab" ||
                event.stopPropagation();
            }}
            placeholder={searchLabel}
            aria-label={searchLabel}
            autoComplete={"off"}
            data-1p-ignore={true}
            autoFocus={value9}
            tabIndex={value9 ? undefined : -1}
            className={
              "!border-transparent !bg-transparent !shadow-none compact:!pl-2 comfortable:!pl-2.5"
            }
          />
          <npm_Menu_La.Separator
            className={"-mx-1 my-1 h-px bg-border"}
          />
        </jsxMenuMenu_2.Fragment>
      }
    >
      {resetQueryOnClose && (<ResetOnUnmount reset={value5} />)}
      {value9 && (<MenuSearchTriggerWatcher inputRef={value14} />)}
      <MenuSearchTypingWatcher inputRef={value14} applyKey={value15} />
      {children(value3.trim().toLowerCase(), value3.trim())}
    </MenuPopup>
  );
}
function useSearchMenuFocus(
  input: React.RefObject<HTMLElement | null>,
  options: boolean,
): void {
  let value = (0, reactMenuMenu_2.useRef)(options);
  (0, useIsomorphicLayoutEffect)(() => {
    let value2 = input.current?.closest('[role="menu"]');
    if (!options || value.current || !value2?.hasAttribute("data-open"))
      return;
    let activeElement = value2.ownerDocument.activeElement;
    (activeElement === null || activeElement === value2.ownerDocument.body) &&
      (value2 as HTMLElement).focus({
        preventScroll: true,
      });
  }, [input, options]);
  (0, reactMenuMenu_2.useEffect)(() => {
    let value2 = value.current && !options;
    value.current = options;
    let current = input.current;
    if (!value2 || !current) return;
    let value3 = requestAnimationFrame(() => {
      let element = current.querySelector<HTMLElement>(
          DataHighlightedTabindex0Value,
        ),
        ancestor = current.closest('[role="menu"]');
      element &&
        ancestor &&
        current.ownerDocument.activeElement === ancestor &&
        (element as HTMLElement).focus({
          preventScroll: true,
        });
    });
    return () => cancelAnimationFrame(value3);
  }, [input, options]);
}
function MenuPendingList({
  pending = false,
  loading = false,
  placeholderRows = 3,
  icon = false,
  children: children,
}: MenuPendingProps): React.ReactElement {
  useUiLocale();
  let value = (0, reactMenuMenu_2.useRef)<HTMLDivElement | null>(null),
    value2 = (0, reactMenuMenu_2.useRef)(MenuMenuWidthHeightConfig);
  (0, reactMenuMenu_2.useEffect)(() => {
    let current = value.current;
    if (!current || typeof ResizeObserver === "undefined") return;
    let observer = new ResizeObserver(() => {
      value2.current = {
        width: current.offsetWidth,
        height: current.offsetHeight,
      };
    });
    observer.observe(current);
    return () => observer.disconnect();
  }, []);
  let value3 = pending || loading,
    [value4, value5] = (0, reactMenuMenu_2.useState)(
      MenuMenuWidthHeightConfig,
    );
  (0, useIsomorphicLayoutEffect)(() => {
    let current = value.current;
    if (!value3 || !current) {
      value5(MenuMenuWidthHeightConfig);
      return;
    }
    value5(
      loading && value2.current.height > 0
        ? value2.current
        : {
            width: current.offsetWidth,
            height: current.offsetHeight,
          },
    );
  }, [value3, loading]);
  let value6 = value3 && value4.height > 0;
  useSearchMenuFocus(value, loading);
  return (
    <div
      ref={value}
      aria-busy={value3 || undefined}
      style={
        value6
          ? {
              minWidth: value4.width,
              height: value4.height,
            }
          : undefined
      }
      className={value6 ? "overflow-hidden" : undefined}
    >
      {loading ? (<SkeletonGroup>
          <ComponentsSkeletonAssignValue.Rows
            icon={icon}
            rows={
              value6
                ? Math.ceil(value4.height / MenuMenuConstant)
                : placeholderRows
            }
          />
        </SkeletonGroup>) : (children)}
    </div>
  );
}
export {
  cancelNestedMenuClose,
  consumeImeFollowupEvents,
  ContextMenu,
  ContextMenuContent,
  DataHighlightedTabindex0Value,
  extractReactText,
  initializeMenuMenu,
  initializeMenuMenu_2,
  initializeMenuMenu_3,
  initializeMenuMenu_4,
  initializeMenuMenu_5,
  isAppleWebKit,
  isFocusOutEvent,
  isMenuItemsArray,
  isNestedSheetTarget,
  isSearchMenuTypingKey,
  jsxMenuMenu,
  jsxMenuMenu_2,
  Menu,
  MenuBar,
  MenuCaret,
  menuCaretSize,
  menuCloseTargetsNestedPopup,
  MenuContextProviders,
  MenuGroupLabel,
  MenuHeader,
  MenuItem,
  MenuMenuAlias,
  MenuMenuAssignValue,
  MenuMenuBeforeinputKeydownKeyupValues,
  MenuMenuClassNames,
  MenuMenuConstant,
  MenuMenuInsertParagraphInsertLineBreakSet,
  MenuMenuObservedElements,
  MenuMenuPattern,
  MenuMenuWidthHeightConfig,
  MenuPendingList,
  MenuPopup,
  MenuPopupContent,
  MenuRoot,
  MenuRoot_2,
  MenuSearchablePopup,
  MenuSearchTriggerWatcher,
  MenuSearchTypingWatcher,
  MenuSeparator,
  MenuSheetCapablePopup,
  MenuShortcut,
  menuShortcutClassName,
  MenuSubmenu,
  MenuSubmenuTrigger,
  MenuTriggerButton,
  noImeTimestamp,
  normalizeMenuText,
  reactMenuMenu,
  reactMenuMenu_2,
  rememberImeEnter,
  renderMenuItems,
  resetImeEnterTimestamp,
  ResetOnUnmount,
  shouldIgnoreImeEvent,
  shouldKeepNestedMenuOpen,
  useContextMenuRoot,
  useMenuItemText,
  useSearchMenuFocus,
};
export function installCdsMenuMenu(): () => void {
  return () => {
    initializeMenuMenu = (0, initializeOnce)(() => {
      noImeTimestamp = -1e8;
      MenuMenuAlias = noImeTimestamp;
      MenuMenuObservedElements = new WeakSet();
      MenuMenuInsertParagraphInsertLineBreakSet = new Set([
        "insertParagraph",
        "insertLineBreak",
      ]);
      MenuMenuBeforeinputKeydownKeyupValues = [
        "beforeinput",
        "keydown",
        "keyup",
        "compositionstart",
        "focusout",
      ];
    });
    initializeMenuMenu_2 = (0, initializeOnce)(() => {
      "use client";

      (0, initializeTooltipTooltip)();
      (0, initializeMenuConfiguration)();
      (0, initializeMenuPassiveOpenGate)();
      (0, initializeMenuItemStyles_2)();
      jsxMenuMenu = (0, toModuleNamespace)(
        (0, load_react_jsx_runtime)(),
      );
    });
    initializeMenuMenu_3 = (0, initializeOnce)(() => {
      (0, initializeHooksStableCallback)();
    });
    initializeMenuMenu_4 = (0, initializeOnce)(() => {
      "use client";

      (0, initializeHooksLayoutEffect)();
      reactMenuMenu = (0, toModuleNamespace)((0, load_react)());
    });
    initializeMenuMenu_5 = (0, initializeOnce)(() => {
      "use client";

      (0, initializeHooksMediaQuery)();
      (0, initializeHooksLayoutEffect)();
      (0, initializeClassNames)();
      (0, initializeLinkRouter)();
      (0, initializeCdsRoot)();
      (0, initializeHooksStableCallback)();
      (0, initializeOverlaysLayers)();
      (0, initializeHooksStableCallback_2)();
      (0, initializeMenuPopup_2)();
      (0, initializeDomRefComposition_2)();
      (0, initializeDomRefComposition_3)();
      (0, initializeDomRefComposition)();
      (0, initializePlatformRootFontSize_2)();
      (0, initializeComponentsIcon_2)();
      (0, initializeComponentsIcon_3)();
      (0, initializeComponentsShortcut)();
      (0, initializeTooltipDisabledReason)();
      (0, initializeTooltipTooltip)();
      (0, initializeButtonButton)();
      (0, initializeComponentsSkeleton)();
      (0, initializeThemeSurfaces)();
      (0, initializeOverlaysImperativeHandle)();
      (0, initializeSheetsPresentation)();
      (0, initializeSheetsPopupStack)();
      (0, initializeOverlaysBackdrop)();
      initializeMenuMenu();
      (0, initializeComponentsCheckbox)();
      (0, initializeComponentsTextInput)();
      (0, initializeMenuConfiguration)();
      (0, initializeSheetsScrollArea_2)();
      (0, initializeSheetsScrollArea)();
      (0, initializeMenuPopup)();
      (0, initializeMenuPassiveOpenGate)();
      (0, initializeMenuItemStyles)();
      (0, initializeMenuItemStyles_2)();
      initializeMenuMenu_2();
      (0, initializeMenuItemStyles_3)();
      initializeMenuMenu_3();
      (0, initializeSheetsMenuPopup)();
      initializeMenuMenu_4();
      reactMenuMenu_2 = (0, toModuleNamespace)(
        (0, load_react)(),
      );
      (0, initializeNpm_clsx_xh)();
      jsxMenuMenu_2 = (0, toModuleNamespace)(
        (0, load_react_jsx_runtime)(),
      );
      (0, initializeNpm__base_ui_react_jhe)();
      (0, initializeNpm__base_ui_react_jj)();
      (0, initializeNpm__base_ui_react_BXe)();
      MenuMenuPattern = /^\d+$/;
      MenuPopup = (0, reactMenuMenu_2.forwardRef)<
        HTMLDivElement,
        MenuPopupProps
      >(
        (
          {
            align = "start",
            stableWhileOpen = false,
            "data-cds": dataCds = "Menu",
            ...props
          }: MenuPopupProps,
          options: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let state = {
              align: align,
              stableWhileOpen: stableWhileOpen,
              "data-cds": dataCds,
              ...props,
            },
            value = (0, isInsideSheetPopup)(),
            value2 = MenuPopupContent(state, options, !value, false);
          return value ? (
            <MenuSheetCapablePopup {...state} ref={options} />
          ) : (
            value2
          );
        },
      );
      MenuPopup.displayName = "Menu.Popup";
      MenuSheetCapablePopup = (0, reactMenuMenu_2.forwardRef)<
        HTMLDivElement,
        MenuPopupProps
      >(
        (
          input: MenuPopupProps,
          options: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let value = (0, useAvailableSheetParts)(),
            { pending: value2 } = (0, useSheetState)(),
            value3 = (0, reactMenuMenu_2.useContext)(MenuRootContext),
            value4: OverlayKind =
              (0, reactMenuMenu_2.useContext)(
                MenuConfigurationContext,
              ) && value3 === null
                ? "contextmenu"
                : "menu",
            value5 = MenuPopupContent(
              input,
              options,
              value === null,
              value === null && value2,
            );
          return value !== null ? (
            <value.MenuSheetPopup {...input} ref={options} />
          ) : (
            <jsxMenuMenu_2.Fragment>
              {value5}
              {value2 && value3 === null ? (<OverlayBackdrop kind={value4} />) : (null)}
            </jsxMenuMenu_2.Fragment>
          );
        },
      );
      MenuSheetCapablePopup.displayName = "MenuSheetCapablePopup";
      MenuItem = (0, reactMenuMenu_2.forwardRef)<HTMLDivElement, MenuItemProps>(
        (
          {
            variant: variant,
            icon: icon,
            shortcut: shortcut,
            checked: checked,
            checkedRole: checkedRole,
            checkPosition: checkPosition,
            indicator = "check",
            indeterminate: indeterminate,
            hint: hint,
            description: description,
            disabledReason: disabledReason,
            href: href,
            routerOptions: routerOptions,
            target: target,
            rel: rel,
            download: download,
            keepOpen: keepOpen,
            focusesNothing: focusesNothing,
            leading: leading,
            trailing: trailing,
            className: className,
            children: children,
            ...props
          }: MenuItemProps,
          options: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let value = indicator === "checkbox",
            value2 = value
              ? href !== undefined
                ? undefined
                : (checked ?? false)
              : checked,
            value3 = value ? "checkbox" : (checkedRole ?? "checkbox"),
            value4 = checkPosition ?? (value ? "leading" : "trailing"),
            value5 = (0, useAppleKeyboard)(),
            value6 = (0, reactMenuMenu_2.useId)(),
            {
              label: value7,
              labelSpanRef: value8,
              rowRef: value9,
            } = useMenuItemText(children, props.label),
            value10 = (0, useMergedRefs)(options, value9),
            value11 =
              props.disabled === true &&
              (0, hasDisabledReason)(disabledReason),
            state = {
              "aria-keyshortcuts": shortcut
                ? (0, parseSingleShortcut)(shortcut, value5)
                : undefined,
              "data-cds-icon-row":
                icon !== undefined &&
                !(value2 !== undefined && value4 === "leading")
                  ? ""
                  : undefined,
              [CdsFocusesNothingAttribute]: focusesNothing
                ? ""
                : undefined,
              ...props,
              label: value7,
              "aria-describedby":
                [value11 ? value6 : undefined, props["aria-describedby"]]
                  .filter(Boolean)
                  .join(" ") || undefined,
            },
            value12 = (0, usePassiveOpenHandlers)(),
            callback = (input: React.ReactElement): React.ReactElement =>
              disabledReason === undefined ? (
                input
              ) : (
                <Tooltip
                  content={value11 ? disabledReason : undefined}
                  side={"right"}
                  multiline={true}
                  closeOnClick={false}
                >
                  <div role={"none"}>
                    {input}
                    <DisabledReasonDescription
                      id={value6}
                      reason={value11 ? disabledReason : undefined}
                    />
                  </div>
                </Tooltip>
              ),
            value13 = (0, useLinkProps)({
              href: href,
              routerOptions: routerOptions,
              target: target,
              rel: rel,
              download: download,
              ...(0, pickRouterOptions)(props),
            }),
            value14 = (0, cn)(
              (0, menuItemVariants)({
                variant: variant,
              }),
              description ? `${MenuItemStylesClassNames} ` : "",
              className,
            ),
            value15 = value2 !== undefined && (
              <span
                className={(0, npm_clsx_Ea)(
                  "flex size-icon shrink-0 items-center justify-center",
                  value4 === "trailing" && !hint && !shortcut && "-mr-1",
                  !!(value4 === "trailing" && shortcut && !hint) &&
                    "pointer-coarse:-mr-1",
                  value &&
                    value4 === "leading" &&
                    "-ml-1 group-has-[[data-cds-icon-row]]/menu-popup:ml-0",
                )}
                style={
                  value
                    ? undefined
                    : {
                        color: "var(--cds-fill-accent)",
                      }
                }
              >
                {value ? (<span data-size={"xs"} className={"flex shrink-0"}>
                    <CheckboxVisual
                      checked={value2}
                      indeterminate={indeterminate}
                    />
                  </span>) : (value2 && (<Icon name={"Check"} size={"auto"} bold={true} />))}
              </span>
            ),
            value16 = (
              <jsxMenuMenu_2.Fragment>
                {leading}
                {value4 === "leading" && (value15)}
                {icon !== undefined && (<IconRenderer icon={icon} />)}
                {description ? (<span className={"flex min-w-0 flex-1 flex-col"}>
                    <span ref={value8} className={"truncate"}>
                      {children}
                    </span>
                    <span
                      className={
                        "truncate py-[0.125em] -my-[0.125em] text-footnote text-muted group-data-[highlighted]/menu-danger:text-on-danger"
                      }
                    >
                      {description}
                    </span>
                  </span>) : (<span ref={value8} className={"min-w-0 flex-1 truncate"}>
                    {children}
                  </span>)}
                {!!(
                  trailing ||
                  (value2 !== undefined && value4 === "trailing") ||
                  hint ||
                  shortcut
                ) && (<span
                    className={(0, npm_clsx_Ea)(
                      "ml-md flex shrink-0 items-center gap-xs",
                      !!(
                        shortcut &&
                        !trailing &&
                        !(value2 !== undefined && value4 === "trailing") &&
                        !hint
                      ) && "pointer-coarse:hidden",
                    )}
                  >
                    {trailing}
                    {value4 === "trailing" && (value15)}
                    {hint && (<span
                        className={`max-w-[160px] shrink-0 truncate py-[0.125em] -my-[0.125em] text-footnote text-muted group-data-[highlighted]/menu-danger:text-on-danger ${menuShortcutClassName(hint)}`}
                      >
                        {hint}
                      </span>)}
                    {shortcut && (<MenuShortcut keys={shortcut} />)}
                  </span>)}
              </jsxMenuMenu_2.Fragment>
            );
          if (href !== undefined) {
            let value17 = (0, omitRouterOptions)(state);
            return callback(
              <npm_Menu_La.Item
                ref={value10}
                {...value17}
                {...value12}
                closeOnClick={keepOpen ? false : undefined}
                className={value14}
                render={<a {...value13} />}
              >
                {value16}
              </npm_Menu_La.Item>,
            );
          }
          return callback(
            value2 !== undefined ? (
              value3 === "radio" ? (
                <npm_Menu_La.Item
                  ref={value10}
                  {...state}
                  {...value12}
                  role={"menuitemradio"}
                  aria-checked={value2}
                  closeOnClick={keepOpen ? false : undefined}
                  className={value14}
                >
                  {value16}
                </npm_Menu_La.Item>
              ) : (
                <npm_Menu_La.CheckboxItem
                  ref={value10}
                  {...state}
                  {...(value && indeterminate
                    ? {
                        "aria-checked": "mixed",
                      }
                    : {})}
                  {...value12}
                  checked={value2}
                  closeOnClick={value ? false : !keepOpen}
                  className={value14}
                >
                  {value16}
                </npm_Menu_La.CheckboxItem>
              )
            ) : (
              <npm_Menu_La.Item
                ref={value10}
                {...state}
                {...value12}
                closeOnClick={keepOpen ? false : undefined}
                className={value14}
              >
                {value16}
              </npm_Menu_La.Item>
            ),
          );
        },
      );
      MenuItem.displayName = "Menu.Item";
      MenuSubmenuTrigger = (0, reactMenuMenu_2.forwardRef)<
        HTMLDivElement,
        MenuSubmenuTriggerProps
      >(
        (
          {
            icon: icon,
            leading: leading,
            hint: hint,
            trailing: trailing,
            className: className,
            children: children,
            openOnHover: openOnHover,
            ...props
          }: MenuSubmenuTriggerProps,
          options: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let value = (0, reactMenuMenu_2.useContext)(MenuRootContext),
            value2 = (0, useIsSheet)(),
            value3 = (0, usePassiveOpenHandlers)(),
            {
              label: value4,
              labelSpanRef: value5,
              rowRef: value6,
            } = useMenuItemText(children, props.label),
            value7 = (0, useMergedRefs)(
              value?.setTriggerNode,
              options,
              value6,
            ),
            value8 = value?.stashLabel;
          (0, useIsomorphicLayoutEffect)(() => {
            value2 && value8?.(children);
          }, [value2, value8, children]);
          return (
            <npm_Menu_La.SubmenuTrigger
              ref={value7}
              data-cds-icon-row={icon !== undefined ? "" : undefined}
              {...props}
              label={value4}
              {...value3}
              openOnHover={value2 ? false : openOnHover}
              className={(0, cn)(
                (0, menuItemVariants)({
                  variant: "default",
                }),
                "justify-between data-[popup-open]:bg-fill-ghost-hover",
                className,
              )}
            >
              {leading}
              {icon !== undefined && (<IconRenderer icon={icon} />)}
              <span ref={value5} className={"min-w-0 flex-1 truncate"}>
                {children}
              </span>
              {trailing || hint ? (<span className={"ml-md flex shrink-0 items-center gap-xs"}>
                  {trailing}
                  {hint && (<span
                      className={`max-w-[160px] shrink-0 truncate py-[0.125em] -my-[0.125em] text-footnote text-muted ${menuShortcutClassName(hint)}`}
                    >
                      {hint}
                    </span>)}
                  <Icon
                    name={"CaretRight"}
                    size={"sm"}
                    className={"-mr-1 shrink-0 text-muted"}
                  />
                </span>) : (<Icon
                  name={"CaretRight"}
                  size={"sm"}
                  className={"-mr-1 shrink-0 text-muted"}
                />)}
            </npm_Menu_La.SubmenuTrigger>
          );
        },
      );
      MenuSubmenuTrigger.displayName = "Menu.SubmenuTrigger";
      (MenuSubmenu as React.FC<MenuSubmenuProps>).displayName = "Menu.Submenu";
      (MenuSeparator as React.FC<{}>).displayName = "Menu.Separator";
      MenuMenuClassNames =
        "compact:px-2 comfortable:px-2.5 py-1 text-footnote font-medium text-muted";
      (
        MenuHeader as React.FC<
          React.PropsWithChildren<{
            className?: string;
          }>
        >
      ).displayName = "Menu.Header";
      (
        MenuGroupLabel as React.FC<
          React.PropsWithChildren<{
            className?: string;
          }>
        >
      ).displayName = "Menu.GroupLabel";
      (Menu as React.FC<MenuProps>).displayName = "Menu";
      (MenuRoot as React.FC<MenuRootProps>).displayName = "Menu.Root";
      MenuTriggerButton = (0, reactMenuMenu_2.forwardRef)<
        HTMLButtonElement,
        MenuTriggerButtonProps
      >(function (
        { children: children, id: id, ...props }: MenuTriggerButtonProps,
        options: React.ForwardedRef<HTMLButtonElement>,
      ): React.ReactElement {
        return (
          <npm_Menu_La.Trigger
            id={id}
            disabled={props.disabled || props.busy}
            render={
              <Button ref={options} {...props}>
                {children}
                <MenuCaret size={props.size} />
              </Button>
            }
          />
        );
      });
      MenuTriggerButton.displayName = "Menu.TriggerButton";
      (MenuSearchablePopup as React.FC<MenuSearchProps>).displayName =
        "Menu.SearchablePopup";
      MenuMenuConstant = 20;
      MenuMenuWidthHeightConfig = {
        width: 0,
        height: 0,
      };
      DataHighlightedTabindex0Value = '[data-highlighted][tabindex="0"]';
      (MenuPendingList as React.FC<MenuPendingProps>).displayName =
        "Menu.PendingList";
      MenuBar = (0, reactMenuMenu_2.forwardRef)<
        HTMLDivElement,
        import("@base-ui/react/menubar").Menubar.Props
      >(function (
        {
          className: className,
          ...props
        }: import("@base-ui/react/menubar").Menubar.Props,
        options: React.ForwardedRef<HTMLDivElement>,
      ): React.ReactElement {
        return (
          <MenuConfigurationContext_2.Provider value={true}>
            <R_npm_Menubar_yye
              ref={options}
              data-cds={"MenuBar"}
              {...props}
              className={(0, cn)("flex items-center gap-xs", className)}
            />
          </MenuConfigurationContext_2.Provider>
        );
      });
      MenuBar.displayName = "Menu.Bar";
      MenuMenuAssignValue = Object.assign(Menu, {
        Root: MenuRoot,
        Bar: MenuBar,
        Trigger: npm_Menu_La.Trigger,
        TriggerButton: MenuTriggerButton,
        Popup: MenuPopup,
        Item: MenuItem,
        Separator: MenuSeparator,
        Group: npm_Menu_La.Group,
        GroupLabel: MenuGroupLabel,
        Header: MenuHeader,
        Submenu: MenuSubmenu,
        SubmenuTrigger: MenuSubmenuTrigger,
        SearchablePopup: MenuSearchablePopup,
        PendingList: MenuPendingList,
      });
    });
  };
}
