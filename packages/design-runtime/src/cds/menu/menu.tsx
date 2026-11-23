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
import { CollisionPaddingProvider, ComponentsIconContext, Icon, IconRenderer, initializeIconSizeMetrics, initializeIconContext } from "../components/icon";
import { initializeComponentsShortcut, parseSingleShortcut, Shortcut, useAppleKeyboard } from "../components/shortcut";
import { ComponentsSkeletonAssignValue, initializeComponentsSkeleton, SkeletonGroup } from "../components/skeleton";
import { initializeComponentsTextInput, TextInput } from "../components/text-input";
import { ActivityBoundary, initializeDomRefComposition, initializeXmlNamespaceUris, initializeActivityVisibilityContext, isHtmlElement, useEventRef, useMergedRefs } from "../dom/ref-composition";
import { initializeHooksLayoutEffect, useIsomorphicLayoutEffect } from "../hooks/layout-effect";
import { coarsePointerMediaQuery, initializeHooksMediaQuery, useWindowMediaQuery } from "../hooks/media-query";
import { asElement, initializeHooksStableCallback, initializeStableCallbackReact, useOptionalStableCallback, useStableCallback } from "../hooks/stable-callback";
import { initializeLinkRouter, omitRouterOptions, pickRouterOptions, useLinkProps } from "../links";
import { CdsFocusesNothingAttribute, initializeMenuConfiguration, MenuConfigurationContext, insideMenuConfigurationContext, MenuConfigurationLabelOpenConfig, MenuItemContext, MenuRootContext, MenuSheetLabelsContext, MenuSurfaceContext, MenuTriggerContext, PopupScrollArea, useMutableMenuRef, warnNestedMenuInitialFocus, warnNestedMenuLayerOffset } from "./configuration";
import { initializeMenuItemStyles, initializeParentMenuContext, initializeMenuPopupElementComponent, MenuItemStylesClassNames, MenuItemStylesProviderValue, menuItemVariants, MenuPopupElement, useMenuPopupFocus, useMenuTriggerRef, usePopupEntryAnimation } from "./item-styles";
import { initializeMenuPassiveOpenGate, PassiveOpenCellContext } from "./passive-open-gate";
import { ContextMenuPopupFrame, initializeMenuPopup, initializeMenuPopupInteractiveSelector, isScrollbarPointerEvent, MenuPopupCss, PassiveOpenGate, usePassiveOpenCell, usePassiveOpenGate, usePassiveOpenHandlers } from "./popup";
import { initializeOverlaysBackdrop, OverlayBackdrop, OverlaysBackdropVisibilityOpacityConfig, useRestoreFocusOnClose } from "../overlays/backdrop";
import { initializeOverlaysImperativeHandle, useOverlayImperativeHandle } from "../overlays/imperative-handle";
import { initializeOverlaysLayers, LayerBaseContext, useLayer } from "../overlays/layers";
import { initializeRootFontSizeHooks, PopupSurface } from "../platform/root-font-size";
import { initializeSheetsMenuPopup } from "../sheets/menu-popup";
import { initializeSheetsPopupStack, isInsideSheetPopup, SheetPopupContext, SheetPopupProvider, useAvailableSheetParts, useIsSheet, useOverlayOpenState, useSheetInteractionMode, useSheetPopup, useSheetState } from "../sheets/popup-stack";
import { initializeSheetsPresentation, useOpenSnapshot } from "../sheets/presentation";
import { initializeSheetsScrollArea, initializeScrollAreaElementCache, recordKeyboardContextMenu } from "../sheets/scroll-area";
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
var initializeMenuJsxRuntime: () => void;
var initializeMenuStableCallback: () => void;
var reactMenuMenu: typeof React;
var initializeMenuReactNamespace: () => void;
var reactForMenuSubmenu: typeof React;
var jsxForContextMenu: typeof import("react/jsx-runtime");
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
var initializeMenuComponents: () => void;
function isAppleWebKit(): boolean {
  return typeof window === "undefined"
    ? false
    : /Apple Computer/.test(window.navigator.vendor as string);
}
function rememberImeEnter(timestamp: number): void {
  MenuMenuAlias = timestamp;
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
function shouldIgnoreImeEvent(event: KeyboardEvent): boolean {
  return event.isComposing || event.keyCode === 229
    ? ((MenuMenuAlias = noImeTimestamp), true)
    : MenuMenuObservedElements.has(event)
      ? true
      : isAppleWebKit() && Math.abs(event.timeStamp - MenuMenuAlias) < 500
        ? ((MenuMenuAlias = noImeTimestamp),
          event.metaKey || event.ctrlKey
            ? false
            : (MenuMenuObservedElements.add(event), true))
        : false;
}
function consumeImeFollowupEvents(
  keydownEvent: KeyboardEvent,
  element: HTMLElement,
  onLineBreak: () => void,
): void {
  if (!MenuMenuObservedElements.has(keydownEvent)) return;
  let sourceEvent = keydownEvent,
    handleImeFollowup = (event: Event): void => {
      if (event !== sourceEvent) {
        for (let eventType of MenuMenuBeforeinputKeydownKeyupValues)
          element.removeEventListener(eventType, handleImeFollowup, {
            capture: true,
          });
        event.type === "beforeinput" &&
          "inputType" in event &&
          typeof event.inputType == "string" &&
          MenuMenuInsertParagraphInsertLineBreakSet.has(event.inputType) &&
          (event.preventDefault(), onLineBreak());
      }
    };
  for (let eventType of MenuMenuBeforeinputKeydownKeyupValues)
    element.addEventListener(eventType, handleImeFollowup, {
      capture: true,
    });
}
function MenuContextProviders(
  children: React.ReactNode,
  passiveOpenCell: PassiveOpenCell | null,
  triggerActionsRef: React.RefObject<OverlayActions | null>,
  isContextMenu: boolean = false,
): React.ReactElement {
  useUiLocale();
  let providers = (
    <PassiveOpenCellContext.Provider value={passiveOpenCell}>
      <MenuTriggerContext.Provider value={triggerActionsRef}>
        <MenuSurfaceContext.Provider value={null}>
          <MenuRootContext.Provider value={null}>
            <MenuItemContext.Provider
              value={MenuConfigurationLabelOpenConfig}
            >
              <MenuConfigurationContext.Provider value={isContextMenu}>
                {isContextMenu ? (children) : (<TooltipImplProvider>
                    {children}
                  </TooltipImplProvider>)}
              </MenuConfigurationContext.Provider>
            </MenuItemContext.Provider>
          </MenuRootContext.Provider>
        </MenuSurfaceContext.Provider>
      </MenuTriggerContext.Provider>
    </PassiveOpenCellContext.Provider>
  );
  return isContextMenu ? (
    <MenuItemStylesProviderValue value={undefined}>
      {providers}
    </MenuItemStylesProviderValue>
  ) : (
    providers
  );
}
function isNestedSheetTarget(
  target: EventTarget | null | undefined,
  treeId?: string,
): boolean {
  let nestedElement = asElement(target)?.closest("[data-nested]") ?? null;
  if (nestedElement === null) return false;
  if (treeId === undefined) return true;
  let sheetElement = asElement(nestedElement.closest("[data-sheet-tree]"));
  return (
    sheetElement !== null && sheetElement.getAttribute("data-sheet-tree") === treeId
  );
}
function isFocusOutEvent(event: Event | undefined): input is FocusEvent {
  return (
    event !== undefined &&
    "relatedTarget" in event &&
    event.type === "focusout"
  );
}
function shouldKeepNestedMenuOpen(
  isOpen: boolean,
  changeDetails: import("@base-ui/react/menu").Menu.Root.ChangeEventDetails,
  treeId?: string,
): boolean {
  if (isOpen) return false;
  let { reason: reason, event: event } = changeDetails;
  if (reason === "outside-press")
    return isNestedSheetTarget(event?.target, treeId);
  if (reason === "focus-out" && isFocusOutEvent(event)) {
    let relatedElement = asElement(event.relatedTarget),
      isRelatedTargetDetached =
        event.relatedTarget === null ||
        (relatedElement !== null &&
          (relatedElement === relatedElement.ownerDocument.body || !relatedElement.isConnected));
    return (
      isNestedSheetTarget(event.relatedTarget, treeId) ||
      (isRelatedTargetDetached && isNestedSheetTarget(event.target, treeId))
    );
  }
  return false;
}
function cancelNestedMenuClose(
  isOpen: boolean,
  changeDetails: import("@base-ui/react/menu").Menu.Root.ChangeEventDetails,
  treeId?: string,
): boolean {
  return shouldKeepNestedMenuOpen(isOpen, changeDetails, treeId)
    ? (changeDetails.cancel(), true)
    : false;
}
function extractReactText(node: React.ReactNode): string | undefined {
  if (typeof node == "string") return node;
  if (typeof node == "number") return String(node);
  if (node == null || typeof node == "boolean") return "";
  if (!Array.isArray(node)) return;
  let text = "";
  for (let child of node as readonly React.ReactNode[]) {
    let childText = extractReactText(child);
    if (childText === undefined) return;
    text += childText;
  }
  return text;
}
function normalizeMenuText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
function useMenuItemText(
  children: React.ReactNode,
  explicitLabel?: string,
): MenuTextState {
  let labelSpanRef = (0, reactMenuMenu.useRef)<HTMLSpanElement | null>(null),
    rowRef = (0, reactMenuMenu.useRef)<HTMLElement | null>(null),
    [measuredLabel, setMeasuredLabel] = (0, reactMenuMenu.useState)<string | undefined>(),
    textLabel =
      (explicitLabel === undefined &&
        normalizeMenuText(extractReactText(children) ?? "")) ||
      undefined,
    needsMeasure = explicitLabel === undefined && textLabel === undefined;
  useIsomorphicLayoutEffect(() => {
    if (!needsMeasure) return;
    let spanText = normalizeMenuText(labelSpanRef.current?.textContent ?? ""),
      rowStartsWithSpan = (rowRef.current?.textContent ?? "").startsWith(spanText),
      nextLabel =
        spanText === "" || (rowStartsWithSpan && measuredLabel !== spanText) ? undefined : spanText;
    nextLabel !== measuredLabel && setMeasuredLabel(nextLabel);
  });
  return {
    label: explicitLabel ?? textLabel ?? (needsMeasure ? measuredLabel : undefined),
    labelSpanRef: labelSpanRef,
    rowRef: rowRef,
  };
}
function menuShortcutClassName(
  keys: string | readonly string[] | undefined,
): string {
  return MenuMenuPattern.test(keys as string) ? "tabular-nums" : "";
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
      className={cn(
        "pointer-coarse:hidden text-footnote",
        menuShortcutClassName(keys),
      )}
    />
  );
}
function MenuPopupContent(
  menuProps: MenuPopupProps,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
  shouldWarnNested: boolean,
  isConcealed: boolean,
): React.ReactElement {
  useUiLocale();
  let {
      side: side,
      align: align = "start",
      sideOffset: sideOffset,
      collisionPadding: collisionPadding,
      collisionAvoidance: collisionAvoidance,
      anchor: anchor,
      container: container,
      className: className,
      children: children,
      header: header,
      footer: footer,
      maxVisibleItems: maxVisibleItems,
      layerOffset: layerOffset,
      stableWhileOpen: stableWhileOpen = false,
      "data-cds": dataCds = "Menu",
      style: style,
      initialFocus: initialFocus,
      ...popupProps
    } = menuProps,
    overlayRoot = useOverlayRoot(),
    menuRoot = (0, reactForMenuSubmenu.useContext)(MenuRootContext),
    isContextMenu =
      (0, reactForMenuSubmenu.useContext)(MenuConfigurationContext) &&
      menuRoot === null,
    iconContext = (0, reactForMenuSubmenu.useContext)(ComponentsIconContext),
    effectiveCollisionPadding = collisionPadding ?? iconContext?.collisionPadding,
    effectiveAnchor = (0, reactForMenuSubmenu.useMemo)(
      () =>
        anchor !== undefined || !menuRoot
          ? anchor
          : virtualTriggerAnchor(menuRoot),
      [anchor, menuRoot],
    ),
    effectiveSideOffset =
      sideOffset ??
      (isContextMenu ? undefined : menuRoot && anchor === undefined ? 2 : 6),
    entryAnimation = usePopupEntryAnimation({
      enabled: stableWhileOpen && !isContextMenu,
      side: side,
      align: align,
    }),
    popupFocusRef = useMenuPopupFocus(
      menuRoot?.triggerRef,
      popupProps.finalFocus,
    ),
    isAnchoredWithoutFinalFocus = isContextMenu
      ? popupProps.finalFocus === undefined || popupProps.finalFocus === null
      : anchor != null &&
        menuRoot === null &&
        popupProps.finalFocus === undefined,
    passiveOpenCells = usePassiveOpenCell(menuRoot === null);
  passiveOpenCells.root?.declareFocusProps(initialFocus, popupProps.finalFocus);
  shouldWarnNested &&
    menuRoot !== null &&
    initialFocus !== undefined &&
    warnNestedMenuInitialFocus();
  let restoreFocusRef = useRestoreFocusOnClose(isConcealed),
    popupRef = useEventRef((popupElement) => {
      entryAnimation.popupRef(popupElement);
      popupFocusRef(popupElement);
      restoreFocusRef(popupElement);
      passiveOpenCells.root?.registerPopup(popupElement);
    }, forwardedRef);
  shouldWarnNested &&
    menuRoot !== null &&
    layerOffset !== undefined &&
    warnNestedMenuLayerOffset();
  let layer = useLayer(
    isContextMenu ? "contextmenu" : "menu",
    menuRoot === null ? layerOffset : undefined,
  );
  return (
    <npm_Menu_La.Portal container={container ?? overlayRoot}>
      <PopupSurface
        {...layer.portalProps}
        style={
          isConcealed
            ? {
                ...layer.portalProps.style,
                ...OverlaysBackdropVisibilityOpacityConfig,
              }
            : layer.portalProps.style
        }
        surface={surfaceBackgroundTokens.popover}
        companionModalCatcher={true}
        closeOnActivityHide={true}
      >
        <CollisionPaddingProvider
          override={effectiveCollisionPadding}
          container={container ?? overlayRoot}
          provideInherit={true}
        >
          {(resolvedCollisionPadding: CollisionPadding) => (
            <LayerBaseContext.Provider value={layer.base}>
              <npm_Menu_La.Positioner
                ref={entryAnimation.positionerRef}
                className={entryAnimation.held?.positionerClassName}
                style={
                  entryAnimation.held !== null
                    ? {
                        ...layer.style,
                        ...entryAnimation.held.positionerStyle,
                      }
                    : layer.style
                }
                side={entryAnimation.side}
                align={entryAnimation.align}
                sideOffset={effectiveSideOffset}
                collisionPadding={resolvedCollisionPadding}
                collisionAvoidance={collisionAvoidance}
                anchor={effectiveAnchor}
              >
                <PassiveOpenGate
                  cell={passiveOpenCells.cell}
                  nested={menuRoot !== null}
                >
                  {(applyPassiveProps: PassivePopupTransform) => (
                    <MenuPopupElement
                      anchoredWithoutFinalFocus={isAnchoredWithoutFinalFocus}
                      cursorAnchored={isContextMenu}
                      data-cds={dataCds}
                      ref={popupRef}
                      {...applyPassiveProps(popupProps)}
                      style={
                        entryAnimation.held !== null
                          ? typeof style == "function"
                            ? (
                                popupState: import("@base-ui/react/menu").Menu.Popup.State,
                              ) => ({
                                ...style(popupState),
                                pointerEvents: "auto",
                              })
                            : {
                                ...style,
                                pointerEvents: "auto",
                              }
                          : style
                      }
                      className={cn(
                        MenuPopupCss,
                        className,
                      )}
                    >
                      <PopupScrollArea
                        header={header}
                        footer={footer}
                        maxVisibleItems={maxVisibleItems}
                      >
                        {children}
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
  let [openState, setOpenState] = (0, reactForMenuSubmenu.useState)(
      props.open ?? props.defaultOpen ?? false,
    ),
    openRef = (0, reactForMenuSubmenu.useRef)(openState),
    onOpenChangeProp = useOptionalStableCallback(props.onOpenChange),
    { sheet: isSheet } = useSheetState(),
    sheetFrame = (0, reactForMenuSubmenu.useContext)(SheetPopupContext),
    treeId = sheetFrame?.treeId,
    stashedLabelRef: React.RefObject<React.ReactNode> = (0, reactForMenuSubmenu.useRef)(
      null,
    ),
    stashLabel = (0, reactForMenuSubmenu.useCallback)(
      (label: React.ReactNode): void => {
        stashedLabelRef.current = label;
      },
      [],
    ),
    [triggerLabel, setTriggerLabel] = (0, reactForMenuSubmenu.useState)<React.ReactNode>(null),
    handleOpenChange = (0, reactForMenuSubmenu.useCallback)(
      (
        isOpen: boolean,
        changeDetails: import("@base-ui/react/menu").Menu.Root.ChangeEventDetails,
      ): void => {
        if (!(isSheet && cancelNestedMenuClose(isOpen, changeDetails, treeId))) {
          if (
            isSheet &&
            !isOpen &&
            sheetFrame?.refusesAmbientClose(changeDetails) === true
          ) {
            changeDetails.cancel();
            return;
          }
          onOpenChangeProp?.(isOpen, changeDetails);
          changeDetails.isCanceled ||
            ((openRef.current = isOpen),
            setOpenState(isOpen),
            isOpen && setTriggerLabel(stashedLabelRef.current));
        }
      },
      [onOpenChangeProp, isSheet, sheetFrame, treeId],
    ),
    triggerRef = (0, reactForMenuSubmenu.useRef)<HTMLElement | null>(null),
    setTriggerNode = (0, reactForMenuSubmenu.useCallback)(
      (node: HTMLElement | null): void => {
        triggerRef.current = node;
      },
      [],
    ),
    overlayActionsRef = (0, reactForMenuSubmenu.useRef)<OverlayActions | null>(null);
  useOverlayImperativeHandle(overlayActionsRef, actionsRef);
  let closeSubmenu = (0, reactForMenuSubmenu.useCallback)(() => {
      (overlayActionsRef.current as Required<OverlayActions> | null)?.close();
    }, []),
    surfaceContext = (0, reactForMenuSubmenu.useContext)(MenuSurfaceContext),
    triggerContext = (0, reactForMenuSubmenu.useContext)(MenuTriggerContext),
    surface = surfaceContext ?? triggerContext,
    menuRootContext = (0, reactForMenuSubmenu.useMemo)(
      () => ({
        triggerRef: triggerRef,
        setTriggerNode: setTriggerNode,
        openRef: openRef,
        close: closeSubmenu,
        stashLabel: stashLabel,
      }),
      [setTriggerNode, closeSubmenu, stashLabel],
    ),
    effectiveOpen = props.open ?? openState;
  useIsomorphicLayoutEffect(() => {
    openRef.current = effectiveOpen;
    if (effectiveOpen) {
      let current = stashedLabelRef.current;
      setTriggerLabel((previousLabel) => (previousLabel === current ? previousLabel : current));
    }
  }, [effectiveOpen]);
  let menuItemContext = (0, reactForMenuSubmenu.useMemo)(
    () => ({
      label: triggerLabel,
      open: effectiveOpen,
    }),
    [triggerLabel, effectiveOpen],
  );
  return (
    <MenuRootContext.Provider value={menuRootContext}>
      <MenuItemContext.Provider value={menuItemContext}>
        <MenuSurfaceContext.Provider value={surface}>
          <MenuTriggerContext.Provider value={overlayActionsRef}>
            <npm_Menu_La.SubmenuRoot
              {...props}
              actionsRef={overlayActionsRef}
              onOpenChange={handleOpenChange}
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
  let isSheet = useIsSheet(),
    isNested =
      (0, reactForMenuSubmenu.useContext)(MenuRootContext) !== null,
    { label: parentLabel } = (0, reactForMenuSubmenu.useContext)(
      MenuItemContext,
    ),
    isRedundantTitle =
      isSheet &&
      isNested &&
      typeof children == "string" &&
      typeof parentLabel == "string" &&
      children.trim() === parentLabel.trim();
  return (
    <div
      role={"presentation"}
      className={cn(
        MenuMenuClassNames,
        isRedundantTitle && "first:hidden",
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
      className={cn(MenuMenuClassNames, className)}
    >
      {children}
    </npm_Menu_La.GroupLabel>
  );
}
function isMenuItemsArray(items: MenuItemsContent): input is MenuItems {
  return Array.isArray(items);
}
function renderMenuItems(items: MenuItemsContent): React.ReactNode {
  return isMenuItemsArray(items)
    ? items.map((event, index) =>
        event === "separator" ? (
          <MenuSeparator key={index} />
        ) : event.label === undefined ||
          event.label === null ||
          event.label === "" ||
          event.label === false ? null : event.items ? (
          <reactForMenuSubmenu.Fragment key={index}>
            {event.separatorBefore && (<MenuSeparator />)}
            <MenuSubmenu disabled={event.disabled}>
              <MenuSubmenuTrigger icon={event.icon} hint={event.hint}>
                {event.label}
              </MenuSubmenuTrigger>
              <MenuPopup>{renderMenuItems(event.items)}</MenuPopup>
            </MenuSubmenu>
          </reactForMenuSubmenu.Fragment>
        ) : (
          <reactForMenuSubmenu.Fragment key={index}>
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
          </reactForMenuSubmenu.Fragment>
        ),
      )
    : items;
}
function menuCaretSize(density: Density, size?: ControlSize): "sm" | "xs" {
  return getControlSizeRank(density, size) >= 4 ? "sm" : "xs";
}
function MenuCaret({
  size: size,
}: {
  size?: ControlSize;
}): React.ReactElement {
  useUiLocale();
  let density = useDensity(),
    groupOptions = useButtonGroupOptions();
  return (
    <Icon
      name={"CaretDown"}
      size={menuCaretSize(density, size ?? groupOptions?.size)}
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
function Menu(menuProps: MenuProps): React.ReactElement {
  useUiLocale();
  let isSheetMode = useSheetInteractionMode(),
    menuBarContext = (0, reactForMenuSubmenu.useContext)(
      insideMenuConfigurationContext,
    ),
    actionsRef: React.RefObject<OverlayActions | null> = useMutableMenuRef(),
    onOpenChange = menuProps.onOpenChange,
    { onOpenChange: handleOpenChange, triggerRef: triggerRef } = useMenuTriggerRef((isOpen, changeDetails) => {
      onOpenChange?.(isOpen, changeDetails);
      recordKeyboardContextMenu(actionsRef, isOpen, changeDetails);
    }, menuBarContext),
    overlayRoot = useOverlayRoot();
  return isSheetMode
    ? (() => {
        const _Component = useContextMenuRoot;
        return <_Component {...menuProps} />;
      })()
    : ContextMenu(menuProps, overlayRoot, {
        triggerRef: triggerRef,
        onOpenChange: handleOpenChange,
        actionsRef: actionsRef,
        contextMenuOnOpenChange: handleOpenChange,
        inMenuBar: menuBarContext,
      });
}
function useContextMenuRoot(menuProps: MenuProps): React.ReactElement {
  let {
      open: openProp,
      sheetTitle: sheetTitle,
      backLabel: backLabel,
      closeLabel: closeLabel,
    } = menuProps,
    sheetLabels = (0, reactForMenuSubmenu.useMemo)(
      () => ({
        sheetTitle: sheetTitle,
        backLabel: backLabel,
        closeLabel: closeLabel,
      }),
      [sheetTitle, backLabel, closeLabel],
    ),
    overlayRoot = useOverlayRoot(),
    menuBarContext = (0, reactForMenuSubmenu.useContext)(
      insideMenuConfigurationContext,
    ),
    { onOpenChange: handleOpenChange, triggerRef: triggerRef } = useMenuTriggerRef(menuProps.onOpenChange, menuBarContext),
    openState = useOverlayOpenState({
      open: openProp,
      onOpenChange: handleOpenChange,
    }),
    open = openState.open,
    sheetPopup = useSheetPopup({
      open: open,
      onOpenChange: openState.onOpenChange,
      closable: !(openProp !== undefined && menuProps.onOpenChange === undefined),
      refuseClose: menuCloseTargetsNestedPopup,
    }),
    menuElement = ContextMenu(menuProps, overlayRoot, {
      triggerRef: triggerRef,
      onOpenChange: sheetPopup.onOpenChange,
      onOpenChangeComplete: sheetPopup.onOpenChangeComplete,
      actionsRef: sheetPopup.actionsRef,
      sheetCapable: true,
      inMenuBar: menuBarContext,
    });
  return (
    <SheetPopupProvider value={sheetPopup}>
      <MenuSheetLabelsContext.Provider value={sheetLabels}>
        {menuElement}
      </MenuSheetLabelsContext.Provider>
    </SheetPopupProvider>
  );
}
function ContextMenu(
  menuProps: MenuProps,
  overlayRoot: HTMLElement | undefined,
  menuState: ContextMenuState,
): React.ReactElement {
  useUiLocale();
  let {
    items: items,
    side: side,
    align: align,
    sideOffset: sideOffset,
    collisionPadding: collisionPadding,
    finalFocus: finalFocus,
    open: open,
    disabled: disabled,
    className: className,
    style: style,
    "data-cds": dataCds,
  } = menuProps;
  if (menuProps.trigger === "context-menu")
    return disabled ? (
      <div data-disabled={""} className={className}>
        {menuProps.children}
      </div>
    ) : menuState.sheetCapable ? (
      <ActivityBoundary actionsRef={menuState.actionsRef}>
        <npm_ContextMenu_Ex.Root
          open={open}
          onOpenChange={menuState.onOpenChange}
          onOpenChangeComplete={menuState.onOpenChangeComplete}
          actionsRef={menuState.actionsRef}
        >
          {MenuContextProviders(
            <jsxForContextMenu.Fragment>
              <npm_ContextMenu_Ex.Trigger className={className}>
                {menuProps.children}
              </npm_ContextMenu_Ex.Trigger>
              <MenuPopup
                side={side}
                align={align}
                sideOffset={sideOffset}
                collisionPadding={collisionPadding}
                finalFocus={finalFocus}
                data-cds={dataCds ?? "Menu"}
              >
                {renderMenuItems(items)}
              </MenuPopup>
            </jsxForContextMenu.Fragment>,
            null,
            menuState.actionsRef,
            true,
          )}
        </npm_ContextMenu_Ex.Root>
      </ActivityBoundary>
    ) : (
      <ActivityBoundary actionsRef={menuState.actionsRef}>
        <npm_ContextMenu_Ex.Root
          open={open}
          onOpenChange={menuState.contextMenuOnOpenChange}
          actionsRef={menuState.actionsRef}
        >
          <npm_ContextMenu_Ex.Trigger className={className}>
            {menuProps.children}
          </npm_ContextMenu_Ex.Trigger>
          <npm_ContextMenu_Ex.Portal container={overlayRoot}>
            <MenuTriggerContext.Provider value={menuState.actionsRef}>
              <ContextMenuContent
                side={side}
                align={align}
                sideOffset={sideOffset}
                collisionPadding={collisionPadding}
                finalFocus={finalFocus}
                dataCds={dataCds}
                items={items}
              />
            </MenuTriggerContext.Provider>
          </npm_ContextMenu_Ex.Portal>
        </npm_ContextMenu_Ex.Root>
      </ActivityBoundary>
    );
  let triggerNode: React.ReactNode;
  if (menuProps.renderTrigger !== undefined)
    triggerNode = (
      <npm_Menu_La.Trigger
        disabled={disabled}
        className={className}
        style={style}
        render={menuProps.renderTrigger}
      />
    );
  else if (menuProps.iconOnly) {
    let tooltipText =
        menuProps.tooltip === false
          ? undefined
          : typeof menuProps.tooltip == "string"
            ? menuProps.tooltip
            : menuProps["aria-label"],
      triggerButton = (
        <npm_Menu_La.Trigger
          disabled={disabled}
          render={
            <Button
              variant={menuProps.variant}
              size={menuProps.size}
              iconOnly={true}
              icon={menuProps.icon || "DotsVertical"}
              aria-label={menuProps["aria-label"]}
              pressed={menuProps.pressed}
              tooltip={false}
              className={className}
              style={style}
            />
          }
        />
      ),
      tooltipWrapped = tooltipText ? (
        <Tooltip content={tooltipText}>{triggerButton}</Tooltip>
      ) : (
        triggerButton
      );
    triggerNode =
      menuProps.disabledReason !== undefined ? (
        <DisabledReasonTooltip
          side={menuProps.disabledReasonSide}
          reason={disabled ? menuProps.disabledReason : undefined}
        >
          {tooltipWrapped}
        </DisabledReasonTooltip>
      ) : (
        tooltipWrapped
      );
  } else
    triggerNode = (
      <npm_Menu_La.Trigger
        disabled={disabled}
        render={
          <Button
            variant={menuProps.variant}
            size={menuProps.size}
            icon={menuProps.icon}
            iconPosition={menuProps.iconPosition}
            aria-label={menuProps["aria-label"]}
            className={className}
            style={style}
          >
            {menuProps.label}
            <MenuCaret size={menuProps.size} />
          </Button>
        }
      />
    );
  return (
    <MenuItemStylesProviderValue value={menuState.triggerRef}>
      <ActivityBoundary actionsRef={menuState.actionsRef}>
        <npm_Menu_La.Root
          open={open}
          onOpenChange={menuState.onOpenChange}
          onOpenChangeComplete={menuState.onOpenChangeComplete}
          actionsRef={menuState.actionsRef}
          modal={menuState.inMenuBar ? undefined : true}
        >
          {MenuContextProviders(
            <jsxForContextMenu.Fragment>
              {triggerNode}
              <MenuPopup
                side={side}
                align={align}
                sideOffset={sideOffset}
                collisionPadding={collisionPadding}
                finalFocus={finalFocus}
                data-cds={dataCds}
              >
                {renderMenuItems(items)}
              </MenuPopup>
            </jsxForContextMenu.Fragment>,
            null,
            menuState.actionsRef,
          )}
        </npm_Menu_La.Root>
      </ActivityBoundary>
    </MenuItemStylesProviderValue>
  );
}
function menuCloseTargetsNestedPopup(
  changeDetails: import("@base-ui/react/menu").Menu.Root.ChangeEventDetails,
  treeId?: string,
): boolean {
  return shouldKeepNestedMenuOpen(false, changeDetails, treeId);
}
function MenuRoot(rootProps: MenuRootProps): React.ReactElement {
  useUiLocale();
  let {
      children: children,
      sheetTitle: sheetTitle,
      backLabel: backLabel,
      closeLabel: closeLabel,
      ...restProps
    } = rootProps,
    isSheetMode = useSheetInteractionMode(),
    menuBarContext = (0, reactForMenuSubmenu.useContext)(
      insideMenuConfigurationContext,
    ),
    { onOpenChange: handleOpenChange, triggerRef: triggerRef } = useMenuTriggerRef(restProps.onOpenChange, menuBarContext),
    passiveOpenGate = usePassiveOpenGate(handleOpenChange, restProps.open, !menuBarContext),
    actionsRef: React.RefObject<OverlayActions | null> = useMutableMenuRef();
  useOverlayImperativeHandle(actionsRef, restProps.actionsRef);
  return isSheetMode ? (
    <ActivityBoundary actionsRef={actionsRef}>
      <MenuRootWithSheetLabels {...rootProps} actionsRef={actionsRef} />
    </ActivityBoundary>
  ) : (
    <MenuItemStylesProviderValue value={triggerRef}>
      <ActivityBoundary actionsRef={actionsRef}>
        <npm_Menu_La.Root
          {...restProps}
          modal={menuBarContext ? undefined : restProps.modal}
          actionsRef={actionsRef}
          onOpenChange={passiveOpenGate.onOpenChange}
        >
          {typeof children == "function" ? ((renderState: never) =>
                MenuContextProviders(children(renderState), passiveOpenGate.cell, actionsRef)) : (MenuContextProviders(children, passiveOpenGate.cell, actionsRef))}
        </npm_Menu_La.Root>
      </ActivityBoundary>
    </MenuItemStylesProviderValue>
  );
}
function MenuRootWithSheetLabels(rootProps: MenuRootProps): React.ReactElement {
  useUiLocale();
  let {
      children: children,
      sheetTitle: sheetTitle,
      backLabel: backLabel,
      closeLabel: closeLabel,
      ...restProps
    } = rootProps,
    sheetLabels = (0, reactForMenuSubmenu.useMemo)(
      () => ({
        sheetTitle: sheetTitle,
        backLabel: backLabel,
        closeLabel: closeLabel,
      }),
      [sheetTitle, backLabel, closeLabel],
    ),
    menuBarContext = (0, reactForMenuSubmenu.useContext)(
      insideMenuConfigurationContext,
    ),
    { onOpenChange: handleOpenChange, triggerRef: triggerRef } = useMenuTriggerRef(rootProps.onOpenChange, menuBarContext),
    passiveOpenGate = usePassiveOpenGate(handleOpenChange, rootProps.open, !menuBarContext),
    openState = useOverlayOpenState({
      ...rootProps,
      onOpenChange: passiveOpenGate.onOpenChange,
    }),
    structurallyAnchored = useOpenSnapshot(
      openState.open,
      () => passiveOpenGate.cell.getLevel() === "declared",
      false,
    ),
    sheetPopup = useSheetPopup({
      open: openState.open,
      actionsRef: rootProps.actionsRef,
      onOpenChange: openState.onOpenChange,
      onOpenChangeComplete: rootProps.onOpenChangeComplete,
      structurallyAnchored: structurallyAnchored,
      closable: !(
        rootProps.open !== undefined && rootProps.onOpenChange === undefined
      ),
      refuseClose: menuCloseTargetsNestedPopup,
    });
  return (
    <MenuItemStylesProviderValue value={triggerRef}>
      <SheetPopupProvider value={sheetPopup}>
        <MenuSheetLabelsContext.Provider value={sheetLabels}>
          <npm_Menu_La.Root
            {...restProps}
            modal={menuBarContext ? undefined : (sheetPopup.modal ?? restProps.modal)}
            actionsRef={sheetPopup.actionsRef}
            onOpenChange={sheetPopup.onOpenChange}
            onOpenChangeComplete={sheetPopup.onOpenChangeComplete}
          >
            {typeof children == "function" ? ((renderState: never) =>
                  MenuContextProviders(
                    children(renderState),
                    passiveOpenGate.cell,
                    sheetPopup.actionsRef,
                  )) : (MenuContextProviders(children, passiveOpenGate.cell, sheetPopup.actionsRef))}
          </npm_Menu_La.Root>
        </MenuSheetLabelsContext.Provider>
      </SheetPopupProvider>
    </MenuItemStylesProviderValue>
  );
}
function ResetOnUnmount({ reset: reset }: { reset: () => void }): null {
  (0, reactForMenuSubmenu.useEffect)(() => () => reset(), [reset]);
  return null;
}
function isSearchMenuTypingKey(event: SearchKeyEvent): boolean {
  let isAltGraph = event.getModifierState("AltGraph");
  return (
    ((event.key.length === 1 && event.key !== " ") ||
      event.key === "Backspace" ||
      (event.key === "Delete" && !event.shiftKey)) &&
    (!event.ctrlKey || isAltGraph) &&
    !event.metaKey &&
    (!event.altKey || isAltGraph) &&
    event.keyCode !== 229
  );
}
function MenuSearchTypingWatcher({
  inputRef: inputRef,
  applyKey: applyKey,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  applyKey: (key: string) => void;
}): null {
  let triggerRef = (0, reactForMenuSubmenu.useContext)(
    MenuRootContext,
  )?.triggerRef;
  (0, reactForMenuSubmenu.useEffect)(() => {
    let triggerElement = triggerRef?.current;
    if (!triggerElement) return;
    let handleKeyDown = (event: KeyboardEvent): void => {
      event.isComposing ||
        !isSearchMenuTypingKey(event) ||
        (event.preventDefault(),
        event.stopPropagation(),
        inputRef.current?.focus({
          preventScroll: true,
        }),
        applyKey(event.key));
    };
    triggerElement.addEventListener("keydown", handleKeyDown, true);
    return () => triggerElement.removeEventListener("keydown", handleKeyDown, true);
  }, [triggerRef, inputRef, applyKey]);
  return null;
}
function MenuSearchTriggerWatcher({
  inputRef: inputRef,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
}): null {
  let menuRoot = (0, reactForMenuSubmenu.useContext)(MenuRootContext);
  (0, reactForMenuSubmenu.useEffect)(() => {
    let triggerElement = menuRoot?.triggerRef.current;
    if (!menuRoot || !triggerElement) return;
    let { openRef: openRef } = menuRoot,
      handleTriggerFocus = (event: FocusEvent): void => {
        let current = inputRef.current,
          relatedElement = asElement(event.relatedTarget);
        current &&
          relatedElement &&
          openRef.current &&
          current.closest('[role="menu"]')?.contains(relatedElement) &&
          current.focus({
            preventScroll: true,
          });
      };
    triggerElement.addEventListener("focus", handleTriggerFocus);
    return () => triggerElement.removeEventListener("focus", handleTriggerFocus);
  }, [menuRoot, inputRef]);
  (0, reactForMenuSubmenu.useEffect)(() => {
    let focusSearchInput = (): void => {
      let current = inputRef.current;
      if (!current) return;
      let ancestor = current.closest('[role="menu"]'),
        activeElement = current.ownerDocument.activeElement;
      (ancestor?.contains(activeElement) && activeElement !== ancestor) ||
        current.focus({
          preventScroll: true,
        });
    };
    focusSearchInput();
    let attemptCount = 0,
      animationFrameId = 0,
      retryFocus = () => {
        focusSearchInput();
        attemptCount += 1;
        attemptCount < 2 && (animationFrameId = requestAnimationFrame(retryFocus));
      };
    animationFrameId = requestAnimationFrame(retryFocus);
    return () => cancelAnimationFrame(animationFrameId);
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
  let [internalQuery, setInternalQuery] = (0, reactForMenuSubmenu.useState)(""),
    currentQuery = query ?? internalQuery,
    changeQuery: (input: string) => void = useStableCallback(
      (nextQuery) => {
        setInternalQuery(nextQuery);
        onQueryChange?.(nextQuery);
      },
    ),
    resetQuery = useStableCallback(() => {
      currentQuery !== "" && changeQuery("");
    }),
    hasMountedRef = (0, reactForMenuSubmenu.useRef)(false);
  (0, reactForMenuSubmenu.useEffect)(() => {}, [query, onQueryChange]);
  let isSheet = useIsSheet(),
    isCoarsePointer = useWindowMediaQuery(
      useCdsWindow(),
      coarsePointerMediaQuery,
    ),
    shouldAutoFocus = !isSheet && !isCoarsePointer,
    surfaceContext = (0, reactForMenuSubmenu.useContext)(MenuSurfaceContext),
    triggerContext = (0, reactForMenuSubmenu.useContext)(MenuTriggerContext),
    surface = surfaceContext ?? triggerContext,
    beforeSearchRef = (0, reactForMenuSubmenu.useRef)<HTMLDivElement | null>(null),
    searchInputRef = (0, reactForMenuSubmenu.useRef)<HTMLInputElement | null>(null),
    insertKey = (0, reactForMenuSubmenu.useCallback)((key: string): void => {
      let current = searchInputRef.current;
      if (!current) return;
      let { value: currentText } = current,
        selectionStart = current.selectionStart ?? currentText.length,
        selectionEnd = current.selectionEnd ?? currentText.length,
        isDeletion = key === "Backspace" || key === "Delete",
        insertedText = isDeletion ? "" : key;
      if (isDeletion && selectionStart === selectionEnd)
        if (key === "Backspace") {
          let isSurrogatePair = (currentText.codePointAt(selectionStart - 2) ?? 0) > 65535;
          selectionStart = Math.max(0, selectionStart - (isSurrogatePair ? 2 : 1));
        } else {
          let isSurrogatePair = (currentText.codePointAt(selectionEnd) ?? 0) > 65535;
          selectionEnd = Math.min(currentText.length, selectionEnd + (isSurrogatePair ? 2 : 1));
        }
      let nextText =
          currentText.slice(0, selectionStart) + insertedText + currentText.slice(selectionEnd),
        targetWindow = current.ownerDocument.defaultView ?? window;
      Object.getOwnPropertyDescriptor(
        targetWindow.HTMLInputElement.prototype,
        "value",
      )?.set?.call(current, nextText);
      current.setSelectionRange(
        selectionStart + insertedText.length,
        selectionStart + insertedText.length,
      );
      current.dispatchEvent(
        new Event("input", {
          bubbles: true,
        }),
      );
    }, []),
    focusBeforeSearchControl = () => {
      let current = beforeSearchRef.current,
        focusTarget =
          current?.querySelector<HTMLElement>('[tabindex="0"]') ??
          current?.querySelector<HTMLElement>(
            'input, button, [role="radio"]',
          );
      return focusTarget ? ((focusTarget as HTMLElement).focus(), true) : false;
    };
  return (
    <MenuPopup
      {...props}
      stableWhileOpen={stableWhileOpen}
      onKeyDown={(event: MenuPopupKeyboardEvent) => {
        let current = searchInputRef.current;
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
        insertKey(event.key);
      }}
      onFocus={(event: MenuPopupFocusEvent) => {
        onFocus?.(event);
        let currentTarget = event.currentTarget;
        shouldAutoFocus &&
          event.target === currentTarget &&
          currentTarget.ownerDocument.activeElement === currentTarget &&
          searchInputRef.current?.focus({
            preventScroll: true,
          });
      }}
      onMouseDown={(event: React.MouseEvent<HTMLElement>) => {
        let target = event.target as HTMLElement;
        (isHtmlElement(target) &&
          target.localName === "input") ||
          target === event.currentTarget ||
          (target.classList.contains("overflow-y-auto") &&
            isScrollbarPointerEvent(
              event.nativeEvent.offsetX,
              event.nativeEvent.offsetY,
              target,
            )) ||
          event.preventDefault();
      }}
      header={
        <jsxForContextMenu.Fragment>
          {beforeSearch !== undefined && (<div
              ref={beforeSearchRef}
              role={"presentation"}
              className={"px-sm pt-sm"}
              onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                event.key !== "Escape" &&
                  (event.stopPropagation(),
                  event.key === "Tab" &&
                    (event.preventDefault(), searchInputRef.current?.focus()));
              }}
            >
              {beforeSearch}
            </div>)}
          <TextInput
            ref={searchInputRef}
            value={currentQuery}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              changeQuery(event.target.value)
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
                let trimmedQuery = currentQuery.trim();
                if (
                  onSubmitQuery !== undefined &&
                  trimmedQuery !== "" &&
                  !event.repeat &&
                  !event.shiftKey &&
                  !event.altKey
                ) {
                  let submitQuery = () => {
                    onSubmitQuery(trimmedQuery);
                    surface?.current?.close?.();
                  };
                  shouldIgnoreImeEvent(event.nativeEvent)
                    ? consumeImeFollowupEvents(
                        event.nativeEvent,
                        event.currentTarget,
                        submitQuery,
                      )
                    : (event.preventDefault(), submitQuery());
                }
                event.stopPropagation();
                return;
              }
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                let menuItems = event.currentTarget
                    .closest('[role="menu"]')
                    ?.querySelectorAll<HTMLElement>(
                      '[role^="menuitem"]:not([aria-disabled="true"])',
                    ),
                  targetItem =
                    event.key === "ArrowDown"
                      ? menuItems?.[0]
                      : menuItems?.[menuItems.length - 1];
                targetItem !== undefined &&
                  (event.preventDefault(),
                  event.stopPropagation(),
                  (targetItem as HTMLElement).focus());
                return;
              }
              if (event.key === "Tab" && !event.shiftKey && focusBeforeSearchControl()) {
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
            autoFocus={shouldAutoFocus}
            tabIndex={shouldAutoFocus ? undefined : -1}
            className={
              "!border-transparent !bg-transparent !shadow-none compact:!pl-2 comfortable:!pl-2.5"
            }
          />
          <npm_Menu_La.Separator
            className={"-mx-1 my-1 h-px bg-border"}
          />
        </jsxForContextMenu.Fragment>
      }
    >
      {resetQueryOnClose && (<ResetOnUnmount reset={resetQuery} />)}
      {shouldAutoFocus && (<MenuSearchTriggerWatcher inputRef={searchInputRef} />)}
      <MenuSearchTypingWatcher inputRef={searchInputRef} applyKey={insertKey} />
      {children(currentQuery.trim().toLowerCase(), currentQuery.trim())}
    </MenuPopup>
  );
}
function useSearchMenuFocus(
  menuRef: React.RefObject<HTMLElement | null>,
  isLoading: boolean,
): void {
  let wasLoadingRef = (0, reactForMenuSubmenu.useRef)(isLoading);
  useIsomorphicLayoutEffect(() => {
    let menuElement = menuRef.current?.closest('[role="menu"]');
    if (!isLoading || wasLoadingRef.current || !menuElement?.hasAttribute("data-open"))
      return;
    let activeElement = menuElement.ownerDocument.activeElement;
    (activeElement === null || activeElement === menuElement.ownerDocument.body) &&
      (menuElement as HTMLElement).focus({
        preventScroll: true,
      });
  }, [menuRef, isLoading]);
  (0, reactForMenuSubmenu.useEffect)(() => {
    let didFinishLoading = wasLoadingRef.current && !isLoading;
    wasLoadingRef.current = isLoading;
    let current = menuRef.current;
    if (!didFinishLoading || !current) return;
    let animationFrameId = requestAnimationFrame(() => {
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
    return () => cancelAnimationFrame(animationFrameId);
  }, [menuRef, isLoading]);
}
function MenuPendingList({
  pending = false,
  loading = false,
  placeholderRows = 3,
  icon = false,
  children: children,
}: MenuPendingProps): React.ReactElement {
  useUiLocale();
  let containerRef = (0, reactForMenuSubmenu.useRef)<HTMLDivElement | null>(null),
    lastSizeRef = (0, reactForMenuSubmenu.useRef)(MenuMenuWidthHeightConfig);
  (0, reactForMenuSubmenu.useEffect)(() => {
    let current = containerRef.current;
    if (!current || typeof ResizeObserver === "undefined") return;
    let observer = new ResizeObserver(() => {
      lastSizeRef.current = {
        width: current.offsetWidth,
        height: current.offsetHeight,
      };
    });
    observer.observe(current);
    return () => observer.disconnect();
  }, []);
  let isPending = pending || loading,
    [frozenSize, setFrozenSize] = (0, reactForMenuSubmenu.useState)(
      MenuMenuWidthHeightConfig,
    );
  useIsomorphicLayoutEffect(() => {
    let current = containerRef.current;
    if (!isPending || !current) {
      setFrozenSize(MenuMenuWidthHeightConfig);
      return;
    }
    setFrozenSize(
      loading && lastSizeRef.current.height > 0
        ? lastSizeRef.current
        : {
            width: current.offsetWidth,
            height: current.offsetHeight,
          },
    );
  }, [isPending, loading]);
  let shouldFreezeSize = isPending && frozenSize.height > 0;
  useSearchMenuFocus(containerRef, loading);
  return (
    <div
      ref={containerRef}
      aria-busy={isPending || undefined}
      style={
        shouldFreezeSize
          ? {
              minWidth: frozenSize.width,
              height: frozenSize.height,
            }
          : undefined
      }
      className={shouldFreezeSize ? "overflow-hidden" : undefined}
    >
      {loading ? (<SkeletonGroup>
          <ComponentsSkeletonAssignValue.Rows
            icon={icon}
            rows={
              shouldFreezeSize
                ? Math.ceil(frozenSize.height / MenuMenuConstant)
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
  initializeMenuJsxRuntime,
  initializeMenuStableCallback,
  initializeMenuReactNamespace,
  initializeMenuComponents,
  isAppleWebKit,
  isFocusOutEvent,
  isMenuItemsArray,
  isNestedSheetTarget,
  isSearchMenuTypingKey,
  jsxMenuMenu,
  jsxForContextMenu,
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
  MenuRootWithSheetLabels,
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
  reactForMenuSubmenu,
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
    initializeMenuMenu = initializeOnce(() => {
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
    initializeMenuJsxRuntime = initializeOnce(() => {
      "use client";

      initializeTooltipTooltip();
      initializeMenuConfiguration();
      initializeMenuPassiveOpenGate();
      initializeParentMenuContext();
      jsxMenuMenu = toModuleNamespace(
        load_react_jsx_runtime(),
      );
    });
    initializeMenuStableCallback = initializeOnce(() => {
      initializeHooksStableCallback();
    });
    initializeMenuReactNamespace = initializeOnce(() => {
      "use client";

      initializeHooksLayoutEffect();
      reactMenuMenu = toModuleNamespace(load_react());
    });
    initializeMenuComponents = initializeOnce(() => {
      "use client";

      initializeHooksMediaQuery();
      initializeHooksLayoutEffect();
      initializeClassNames();
      initializeLinkRouter();
      initializeCdsRoot();
      initializeHooksStableCallback();
      initializeOverlaysLayers();
      initializeStableCallbackReact();
      initializeMenuPopupInteractiveSelector();
      initializeXmlNamespaceUris();
      initializeActivityVisibilityContext();
      initializeDomRefComposition();
      initializeRootFontSizeHooks();
      initializeIconSizeMetrics();
      initializeIconContext();
      initializeComponentsShortcut();
      initializeTooltipDisabledReason();
      initializeTooltipTooltip();
      initializeButtonButton();
      initializeComponentsSkeleton();
      initializeThemeSurfaces();
      initializeOverlaysImperativeHandle();
      initializeSheetsPresentation();
      initializeSheetsPopupStack();
      initializeOverlaysBackdrop();
      initializeMenuMenu();
      initializeComponentsCheckbox();
      initializeComponentsTextInput();
      initializeMenuConfiguration();
      initializeScrollAreaElementCache();
      initializeSheetsScrollArea();
      initializeMenuPopup();
      initializeMenuPassiveOpenGate();
      initializeMenuItemStyles();
      initializeParentMenuContext();
      initializeMenuJsxRuntime();
      initializeMenuPopupElementComponent();
      initializeMenuStableCallback();
      initializeSheetsMenuPopup();
      initializeMenuReactNamespace();
      reactForMenuSubmenu = toModuleNamespace(
        load_react(),
      );
      initializeNpm_clsx_xh();
      jsxForContextMenu = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializeNpm__base_ui_react_jhe();
      initializeNpm__base_ui_react_jj();
      initializeNpm__base_ui_react_BXe();
      MenuMenuPattern = /^\d+$/;
      MenuPopup = (0, reactForMenuSubmenu.forwardRef)<
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
          forwardedRef: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let state = {
              align: align,
              stableWhileOpen: stableWhileOpen,
              "data-cds": dataCds,
              ...props,
            },
            isInsideSheet = isInsideSheetPopup(),
            inlinePopup = MenuPopupContent(state, forwardedRef, !isInsideSheet, false);
          return isInsideSheet ? (
            <MenuSheetCapablePopup {...state} ref={forwardedRef} />
          ) : (
            inlinePopup
          );
        },
      );
      MenuPopup.displayName = "Menu.Popup";
      MenuSheetCapablePopup = (0, reactForMenuSubmenu.forwardRef)<
        HTMLDivElement,
        MenuPopupProps
      >(
        (
          menuProps: MenuPopupProps,
          forwardedRef: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let SheetParts = useAvailableSheetParts(),
            { pending: isSheetPending } = useSheetState(),
            menuRoot = (0, reactForMenuSubmenu.useContext)(MenuRootContext),
            overlayKind: OverlayKind =
              (0, reactForMenuSubmenu.useContext)(
                MenuConfigurationContext,
              ) && menuRoot === null
                ? "contextmenu"
                : "menu",
            inlinePopup = MenuPopupContent(
              menuProps,
              forwardedRef,
              SheetParts === null,
              SheetParts === null && isSheetPending,
            );
          return SheetParts !== null ? (
            <SheetParts.MenuSheetPopup {...menuProps} ref={forwardedRef} />
          ) : (
            <jsxForContextMenu.Fragment>
              {inlinePopup}
              {isSheetPending && menuRoot === null ? (<OverlayBackdrop kind={overlayKind} />) : (null)}
            </jsxForContextMenu.Fragment>
          );
        },
      );
      MenuSheetCapablePopup.displayName = "MenuSheetCapablePopup";
      MenuItem = (0, reactForMenuSubmenu.forwardRef)<HTMLDivElement, MenuItemProps>(
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
          forwardedRef: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let isCheckboxIndicator = indicator === "checkbox",
            checkedState = isCheckboxIndicator
              ? href !== undefined
                ? undefined
                : (checked ?? false)
              : checked,
            effectiveCheckedRole = isCheckboxIndicator ? "checkbox" : (checkedRole ?? "checkbox"),
            effectiveCheckPosition = checkPosition ?? (isCheckboxIndicator ? "leading" : "trailing"),
            isAppleKeyboard = useAppleKeyboard(),
            descriptionId = (0, reactForMenuSubmenu.useId)(),
            {
              label: label,
              labelSpanRef: labelSpanRef,
              rowRef: rowRef,
            } = useMenuItemText(children, props.label),
            mergedRef = useMergedRefs(forwardedRef, rowRef),
            isDisabledWithReason =
              props.disabled === true &&
              hasDisabledReason(disabledReason),
            state = {
              "aria-keyshortcuts": shortcut
                ? parseSingleShortcut(shortcut, isAppleKeyboard)
                : undefined,
              "data-cds-icon-row":
                icon !== undefined &&
                !(checkedState !== undefined && effectiveCheckPosition === "leading")
                  ? ""
                  : undefined,
              [CdsFocusesNothingAttribute]: focusesNothing
                ? ""
                : undefined,
              ...props,
              label: label,
              "aria-describedby":
                [isDisabledWithReason ? descriptionId : undefined, props["aria-describedby"]]
                  .filter(Boolean)
                  .join(" ") || undefined,
            },
            passiveOpenHandlers = usePassiveOpenHandlers(),
            wrapWithDisabledReason = (element: React.ReactElement): React.ReactElement =>
              disabledReason === undefined ? (
                element
              ) : (
                <Tooltip
                  content={isDisabledWithReason ? disabledReason : undefined}
                  side={"right"}
                  multiline={true}
                  closeOnClick={false}
                >
                  <div role={"none"}>
                    {element}
                    <DisabledReasonDescription
                      id={descriptionId}
                      reason={isDisabledWithReason ? disabledReason : undefined}
                    />
                  </div>
                </Tooltip>
              ),
            linkProps = useLinkProps({
              href: href,
              routerOptions: routerOptions,
              target: target,
              rel: rel,
              download: download,
              ...pickRouterOptions(props),
            }),
            itemClassName = cn(
              menuItemVariants({
                variant: variant,
              }),
              description ? `${MenuItemStylesClassNames} ` : "",
              className,
            ),
            checkIndicator = checkedState !== undefined && (
              <span
                className={npm_clsx_Ea(
                  "flex size-icon shrink-0 items-center justify-center",
                  effectiveCheckPosition === "trailing" && !hint && !shortcut && "-mr-1",
                  !!(effectiveCheckPosition === "trailing" && shortcut && !hint) &&
                    "pointer-coarse:-mr-1",
                  isCheckboxIndicator &&
                    effectiveCheckPosition === "leading" &&
                    "-ml-1 group-has-[[data-cds-icon-row]]/menu-popup:ml-0",
                )}
                style={
                  isCheckboxIndicator
                    ? undefined
                    : {
                        color: "var(--cds-fill-accent)",
                      }
                }
              >
                {isCheckboxIndicator ? (<span data-size={"xs"} className={"flex shrink-0"}>
                    <CheckboxVisual
                      checked={checkedState}
                      indeterminate={indeterminate}
                    />
                  </span>) : (checkedState && (<Icon name={"Check"} size={"auto"} bold={true} />))}
              </span>
            ),
            itemContent = (
              <jsxForContextMenu.Fragment>
                {leading}
                {effectiveCheckPosition === "leading" && (checkIndicator)}
                {icon !== undefined && (<IconRenderer icon={icon} />)}
                {description ? (<span className={"flex min-w-0 flex-1 flex-col"}>
                    <span ref={labelSpanRef} className={"truncate"}>
                      {children}
                    </span>
                    <span
                      className={
                        "truncate py-[0.125em] -my-[0.125em] text-footnote text-muted group-data-[highlighted]/menu-danger:text-on-danger"
                      }
                    >
                      {description}
                    </span>
                  </span>) : (<span ref={labelSpanRef} className={"min-w-0 flex-1 truncate"}>
                    {children}
                  </span>)}
                {!!(
                  trailing ||
                  (checkedState !== undefined && effectiveCheckPosition === "trailing") ||
                  hint ||
                  shortcut
                ) && (<span
                    className={npm_clsx_Ea(
                      "ml-md flex shrink-0 items-center gap-xs",
                      !!(
                        shortcut &&
                        !trailing &&
                        !(checkedState !== undefined && effectiveCheckPosition === "trailing") &&
                        !hint
                      ) && "pointer-coarse:hidden",
                    )}
                  >
                    {trailing}
                    {effectiveCheckPosition === "trailing" && (checkIndicator)}
                    {hint && (<span
                        className={`max-w-[160px] shrink-0 truncate py-[0.125em] -my-[0.125em] text-footnote text-muted group-data-[highlighted]/menu-danger:text-on-danger ${menuShortcutClassName(hint)}`}
                      >
                        {hint}
                      </span>)}
                    {shortcut && (<MenuShortcut keys={shortcut} />)}
                  </span>)}
              </jsxForContextMenu.Fragment>
            );
          if (href !== undefined) {
            let anchorItemProps = omitRouterOptions(state);
            return wrapWithDisabledReason(
              <npm_Menu_La.Item
                ref={mergedRef}
                {...anchorItemProps}
                {...passiveOpenHandlers}
                closeOnClick={keepOpen ? false : undefined}
                className={itemClassName}
                render={<a {...linkProps} />}
              >
                {itemContent}
              </npm_Menu_La.Item>,
            );
          }
          return wrapWithDisabledReason(
            checkedState !== undefined ? (
              effectiveCheckedRole === "radio" ? (
                <npm_Menu_La.Item
                  ref={mergedRef}
                  {...state}
                  {...passiveOpenHandlers}
                  role={"menuitemradio"}
                  aria-checked={checkedState}
                  closeOnClick={keepOpen ? false : undefined}
                  className={itemClassName}
                >
                  {itemContent}
                </npm_Menu_La.Item>
              ) : (
                <npm_Menu_La.CheckboxItem
                  ref={mergedRef}
                  {...state}
                  {...(isCheckboxIndicator && indeterminate
                    ? {
                        "aria-checked": "mixed",
                      }
                    : {})}
                  {...passiveOpenHandlers}
                  checked={checkedState}
                  closeOnClick={isCheckboxIndicator ? false : !keepOpen}
                  className={itemClassName}
                >
                  {itemContent}
                </npm_Menu_La.CheckboxItem>
              )
            ) : (
              <npm_Menu_La.Item
                ref={mergedRef}
                {...state}
                {...passiveOpenHandlers}
                closeOnClick={keepOpen ? false : undefined}
                className={itemClassName}
              >
                {itemContent}
              </npm_Menu_La.Item>
            ),
          );
        },
      );
      MenuItem.displayName = "Menu.Item";
      MenuSubmenuTrigger = (0, reactForMenuSubmenu.forwardRef)<
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
          forwardedRef: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let menuRoot = (0, reactForMenuSubmenu.useContext)(MenuRootContext),
            isSheet = useIsSheet(),
            passiveOpenHandlers = usePassiveOpenHandlers(),
            {
              label: label,
              labelSpanRef: labelSpanRef,
              rowRef: rowRef,
            } = useMenuItemText(children, props.label),
            mergedRef = useMergedRefs(
              menuRoot?.setTriggerNode,
              forwardedRef,
              rowRef,
            ),
            stashLabel = menuRoot?.stashLabel;
          useIsomorphicLayoutEffect(() => {
            isSheet && stashLabel?.(children);
          }, [isSheet, stashLabel, children]);
          return (
            <npm_Menu_La.SubmenuTrigger
              ref={mergedRef}
              data-cds-icon-row={icon !== undefined ? "" : undefined}
              {...props}
              label={label}
              {...passiveOpenHandlers}
              openOnHover={isSheet ? false : openOnHover}
              className={cn(
                menuItemVariants({
                  variant: "default",
                }),
                "justify-between data-[popup-open]:bg-fill-ghost-hover",
                className,
              )}
            >
              {leading}
              {icon !== undefined && (<IconRenderer icon={icon} />)}
              <span ref={labelSpanRef} className={"min-w-0 flex-1 truncate"}>
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
      MenuTriggerButton = (0, reactForMenuSubmenu.forwardRef)<
        HTMLButtonElement,
        MenuTriggerButtonProps
      >(function (
        { children: children, id: id, ...props }: MenuTriggerButtonProps,
        forwardedRef: React.ForwardedRef<HTMLButtonElement>,
      ): React.ReactElement {
        return (
          <npm_Menu_La.Trigger
            id={id}
            disabled={props.disabled || props.busy}
            render={
              <Button ref={forwardedRef} {...props}>
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
      MenuBar = (0, reactForMenuSubmenu.forwardRef)<
        HTMLDivElement,
        import("@base-ui/react/menubar").Menubar.Props
      >(function (
        {
          className: className,
          ...props
        }: import("@base-ui/react/menubar").Menubar.Props,
        forwardedRef: React.ForwardedRef<HTMLDivElement>,
      ): React.ReactElement {
        return (
          <insideMenuConfigurationContext.Provider value={true}>
            <R_npm_Menubar_yye
              ref={forwardedRef}
              data-cds={"MenuBar"}
              {...props}
              className={cn("flex items-center gap-xs", className)}
            />
          </insideMenuConfigurationContext.Provider>
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
