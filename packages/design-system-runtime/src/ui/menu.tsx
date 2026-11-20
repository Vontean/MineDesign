import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
import type { PublicOverlayActions } from "../contracts/overlays";
import type {
  MenuRootState,
  SheetFrameContext,
  MenuItemState,
} from "../contracts/overlays";
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
  PassiveOpenCell,
  PassivePopupTransform,
  SearchKeyEvent,
} from "../contracts/overlays";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { baseContextMenu, baseMenu, baseMenubarRoot as R_baseMenubarRoot, clsx, loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { DisabledReasonAnnouncement, DisabledReasonTooltip, hasDisabledReason, initializeTooltip, Shortcut, shortcutToAriaKeyShortcuts, Tooltip, TooltipImplementationProvider, useAppleKeyboard } from "./avatars";
import { Button, useButtonGroup } from "./buttons";
import { CheckboxVisual } from "./control-labels";
import { asElement, COARSE_POINTER_QUERY_rG, initializeElementAccess, initializeIsomorphicLayoutEffect, initializeOverlayActions, initializeVisualKeyboard, SheetContextProvider, sheetFrameContext, useAdaptiveSheet, useControllableOpen, useEventCallback, useForwardedOverlayActions, useHasSheetFrame, useIsomorphicLayoutEffect, useIsSheet, useMediaQuery__U, useOptionalEventCallback, useSheetCapablePresentation, useSheetImplementation, useSheetState, useValueCapturedOnOpen } from "./foundation";
import { CloseOnActivityHideProvider, cn, collisionPaddingContext, CollisionPaddingProvider, contextMenuContext, createMenuVirtualAnchor, defaultSubmenuState, elevationSurfaceNames, FOCUSES_NOTHING_ATTRIBUTE, Icon, IconSlot, initializeClassNames, initializeCloseOnActivityHide, initializeKeyboardContextMenuFocus, initializeLayers, initializeMenuContexts, initializeMenuScrollContent, initializeMergedRefs, initializePortalRoot, initializeSurfaces, isHtmlElement, layerBaseContext, menuBarContext, menuIsOpenContext, menuRootIdentityContext, MenuScrollContent, menuSheetLabelsContext, menuTriggerContext, PortalRoot, recordKeyboardContextMenuOpen, submenuStateContext, useMergedRefs, useOverlayLayer, useStableMergedRef, useStableObjectRef, warnNestedMenuInitialFocus, warnNestedMenuLayerOffset } from "./interactions";
import { contextMenuPopupClasses, ContextMenuPopupFrame, getDensitySizeIndex, initializeCdsRoot, initializeContextMenuPopup, initializeMenuItemVariants, initializeMenuOpener, initializeMenuPopupElement, initializeOverlaySelector, initializePassiveOpen, initializeStablePopupPlacement, isScrollbarPointerPosition, menuItemDescriptionPaddingClass, menuItemVariants, MenuOpenerProvider, MenuPopupElement, omitLinkEventProps, PassiveOpenGate, passiveOpenStateContext, pickLinkEventProps, useCdsLink, useDensity, useMenuOwnerRef, useMenuPassiveFocusProps, usePassiveOpenContext, usePassiveOpenState, usePortalContainer, useRootWindow, useStablePopupPlacement, useTrackedMenuTrigger } from "./overlays";
import { SkeletonGroup, SkeletonPrimitive } from "./skeleton";
import { concealedPopupStyle, PendingSheetBackdrop, recordCompositionEnd, resetCompositionSuppression, shouldSuppressCompositionEnter, suppressFollowupCompositionLineBreak, useRefocusAfterPendingSheet } from "./text-input-overlay";
import { TextInput } from "./text-input";

var jsxo_: typeof import("react/jsx-runtime");
var reacttM: typeof React;
var reactForUiMenu: typeof React;
var jsxForUiMenu: typeof import("react/jsx-runtime");
var numericShortcutPattern: RegExp;
var MenuPopup: ForwardComponent<HTMLDivElement, MenuPopupProps>;
var MenuSheetCapablePopup: ForwardComponent<HTMLDivElement, MenuPopupProps>;
var MenuItem: ForwardComponent<HTMLDivElement, MenuItemProps>;
var MenuSubmenuTrigger: ForwardComponent<
  HTMLDivElement,
  MenuSubmenuTriggerProps
>;
var menuGroupLabelClasses: string;
var MenuTriggerButton: ForwardComponent<
  HTMLButtonElement,
  MenuTriggerButtonProps
>;
var MENU_PLACEHOLDER_MINIMUM_WIDTH: number;
var emptyMenuSize: {
  width: number;
  height: number;
};
var HIGHLIGHTED_MENU_ITEM_SELECTOR: string;
var MenuBar: ForwardComponent<
  HTMLDivElement,
  import("@base-ui/react/menubar").Menubar.Props
>;
var Menu: typeof SimpleMenu & {
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
function MenuContextProviders(
  content: React.ReactNode,
  passiveOpenCell: PassiveOpenCell | null,
  rootIdentity: React.RefObject<OverlayActions | null>,
  isContextMenu: boolean = false,
): React.ReactElement {
  useUiLocale();
  let providers = (
    <passiveOpenStateContext.Provider value={passiveOpenCell}>
      <menuRootIdentityContext.Provider value={rootIdentity}>
        <menuIsOpenContext.Provider value={null}>
          <menuTriggerContext.Provider value={null}>
            <submenuStateContext.Provider
              value={defaultSubmenuState}
            >
              <contextMenuContext.Provider value={isContextMenu}>
                {isContextMenu ? (content) : (<TooltipImplementationProvider>
                    {content}
                  </TooltipImplementationProvider>)}
              </contextMenuContext.Provider>
            </submenuStateContext.Provider>
          </menuTriggerContext.Provider>
        </menuIsOpenContext.Provider>
      </menuRootIdentityContext.Provider>
    </passiveOpenStateContext.Provider>
  );
  if (isContextMenu) {
    return (
      <MenuOpenerProvider value={undefined}>
        {providers}
      </MenuOpenerProvider>
    );
  } else {
    return providers;
  }
}
function isNestedMenuEvent(
  target: EventTarget | null | undefined,
  sheetTreeId?: string,
): boolean {
  let value = asElement(target)?.closest("[data-nested]") ?? null;
  if (value === null) {
    return false;
  }
  if (sheetTreeId === undefined) {
    return true;
  }
  let sheetRoot = asElement(value.closest("[data-sheet-tree]"));
  return (
    sheetRoot !== null && sheetRoot.getAttribute("data-sheet-tree") === sheetTreeId
  );
}
function isFocusOutEvent(event: Event | undefined): event is FocusEvent {
  return (
    event !== undefined &&
    "relatedTarget" in event &&
    event.type === "focusout"
  );
}
function shouldRefuseNestedMenuClose(
  nextOpen: boolean,
  changeDetails: import("@base-ui/react/menu").Menu.Root.ChangeEventDetails,
  sheetTreeId?: string,
): boolean {
  if (nextOpen) {
    return false;
  }
  let { reason: value, event: changeEvent } = changeDetails;
  if (value === "outside-press") {
    return isNestedMenuEvent(changeEvent?.target, sheetTreeId);
  }
  if (value === "focus-out" && isFocusOutEvent(changeEvent)) {
    let relatedElement = asElement(changeEvent.relatedTarget),
      hasLostFocusTarget =
        changeEvent.relatedTarget === null ||
        (relatedElement !== null &&
          (relatedElement === relatedElement.ownerDocument.body || !relatedElement.isConnected));
    return (
      isNestedMenuEvent(changeEvent.relatedTarget, sheetTreeId) ||
      (hasLostFocusTarget && isNestedMenuEvent(changeEvent.target, sheetTreeId))
    );
  }
  return false;
}
function cancelNestedMenuClose(
  nextOpen: boolean,
  changeDetails: import("@base-ui/react/menu").Menu.Root.ChangeEventDetails,
  sheetTreeId?: string,
): boolean {
  if (!shouldRefuseNestedMenuClose(nextOpen, changeDetails, sheetTreeId)) {
    return false;
  }
  changeDetails.cancel();
  return true;
}
function extractReactText(node: React.ReactNode): string | undefined {
  if (typeof node === "string") {
    return node;
  }
  if (typeof node === "number") {
    return String(node);
  }
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }
  if (!Array.isArray(node)) {
    return;
  }
  let text = "";
  for (let value of node as readonly React.ReactNode[]) {
    let childText = extractReactText(value);
    if (childText === undefined) {
      return;
    }
    text += childText;
  }
  return text;
}
function normalizeLabelText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
function useMenuItemLabel(
  children: React.ReactNode,
  explicitLabel?: string,
): MenuTextState {
  let ref = reacttM.useRef<HTMLElement | null>(null),
    rowRef = reacttM.useRef<HTMLElement | null>(null),
    [value, setMeasuredLabel] = reacttM.useState<string | undefined>(),
    extractedLabel =
      explicitLabel === undefined
        ? normalizeLabelText(extractReactText(children) ?? "") || undefined
        : undefined,
    shouldMeasureLabel = explicitLabel === undefined && extractedLabel === undefined;
  useIsomorphicLayoutEffect(() => {
    if (!shouldMeasureLabel) {
      return;
    }
    let labelText = normalizeLabelText(ref.current?.textContent ?? ""),
      rowStartsWithLabel = (rowRef.current?.textContent ?? "").startsWith(labelText),
      nextLabel =
        labelText === "" || (rowStartsWithLabel && value !== labelText) ? undefined : labelText;
    if (nextLabel !== value) {
      setMeasuredLabel(nextLabel);
    }
  });
  return {
    label: explicitLabel ?? extractedLabel ?? (shouldMeasureLabel ? value : undefined),
    labelSpanRef: ref,
    rowRef: rowRef,
  };
}
function getShortcutNumeralClasses(shortcut: string | undefined): string {
  if (numericShortcutPattern.test(shortcut as string)) {
    return "tabular-nums";
  } else {
    return "";
  }
}
function MenuShortcut({ keys: keys }: { keys: string }): React.ReactElement {
  useUiLocale();
  return (
    <Shortcut
      keys={keys}
      variant={"text"}
      aria-hidden={true}
      className={cn(
        "pointer-coarse:hidden text-footnote",
        getShortcutNumeralClasses(keys),
      )}
    />
  );
}
function useMenuPopupElement(
  props: MenuPopupProps,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
  warnForNestedMenu: boolean,
  isConcealed: boolean,
): React.ReactElement {
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
      initialFocus: initialFocus,
      ...popupProps
    } = props,
    portalContainer = usePortalContainer(),
    triggerState = reactForUiMenu.useContext<MenuRootState | null>(
      menuTriggerContext,
    ),
    isCursorAnchored =
      reactForUiMenu.useContext<boolean>(contextMenuContext) &&
      triggerState === null,
    inheritedCollision = reactForUiMenu.useContext<{
      collisionPadding?: CollisionPadding;
    } | null>(collisionPaddingContext),
    requestedCollisionPadding = collisionPadding ?? inheritedCollision?.collisionPadding,
    memo = reactForUiMenu.useMemo(
      () =>
        anchor !== undefined || !triggerState
          ? anchor
          : createMenuVirtualAnchor(triggerState),
      [anchor, triggerState],
    ),
    resolvedSideOffset =
      sideOffset ??
      (isCursorAnchored ? undefined : triggerState && anchor === undefined ? 2 : 6),
    stablePlacement = useStablePopupPlacement({
      enabled: stableWhileOpen && !isCursorAnchored,
      side: side,
      align: align,
    }),
    ownerRef = useMenuOwnerRef(
      triggerState?.triggerRef,
      popupProps.finalFocus,
    ),
    anchoredWithoutFinalFocus = isCursorAnchored
      ? popupProps.finalFocus === undefined || popupProps.finalFocus === null
      : anchor !== undefined &&
        anchor !== null &&
        triggerState === null &&
        popupProps.finalFocus === undefined,
    passiveOpen = usePassiveOpenContext(triggerState === null);
  passiveOpen.root?.declareFocusProps(initialFocus, popupProps.finalFocus);
  if (warnForNestedMenu && triggerState !== null && initialFocus !== undefined) {
    warnNestedMenuInitialFocus();
  }
  let refocusAfterPendingSheet = useRefocusAfterPendingSheet(isConcealed),
    popupRef = useStableMergedRef(
      (popupElement: HTMLElement | null) => {
        stablePlacement.popupRef(popupElement);
        ownerRef(popupElement);
        refocusAfterPendingSheet(popupElement);
        passiveOpen.root?.registerPopup(popupElement);
      },
      forwardedRef,
    );
  if (warnForNestedMenu && triggerState !== null && layerOffset !== undefined) {
    warnNestedMenuLayerOffset();
  }
  let overlayLayer = useOverlayLayer(
    isCursorAnchored ? "contextmenu" : "menu",
    triggerState === null ? layerOffset : undefined,
  );
  return (
    <baseMenu.Portal container={(container ?? portalContainer) as import("../contracts/overlays").BaseUIPortalContainer}>
      <PortalRoot
        {...overlayLayer.portalProps}
        style={
          isConcealed
            ? {
                ...overlayLayer.portalProps.style,
                ...concealedPopupStyle,
              }
            : overlayLayer.portalProps.style
        }
        surface={elevationSurfaceNames.popover}
        companionModalCatcher={true}
        closeOnActivityHide={true}
      >
        <CollisionPaddingProvider
          override={requestedCollisionPadding}
          container={container ?? portalContainer}
          provideInherit={true}
        >
          {(resolvedCollisionPadding: CollisionPadding | undefined) => (
            <layerBaseContext.Provider value={overlayLayer.base}>
              <baseMenu.Positioner
                ref={stablePlacement.positionerRef}
                className={stablePlacement.held?.positionerClassName}
                style={
                  stablePlacement.held !== null
                    ? {
                        ...overlayLayer.style,
                        ...stablePlacement.held.positionerStyle,
                      }
                    : overlayLayer.style
                }
                side={stablePlacement.side}
                align={stablePlacement.align}
                sideOffset={resolvedSideOffset}
                collisionPadding={resolvedCollisionPadding}
                collisionAvoidance={collisionAvoidance}
                anchor={memo}
              >
                <PassiveOpenGate
                  cell={passiveOpen.cell}
                  nested={triggerState !== null}
                >
                  {(applyPassivePopupProps: PassivePopupTransform) => (
                    <MenuPopupElement
                      anchoredWithoutFinalFocus={anchoredWithoutFinalFocus}
                      cursorAnchored={isCursorAnchored}
                      data-cds={dataCds}
                      ref={popupRef}
                      {...applyPassivePopupProps(popupProps)}
                      className={cn(
                        contextMenuPopupClasses,
                        stablePlacement.held?.popupClassName,
                        className,
                      )}
                    >
                      <MenuScrollContent
                        header={header}
                        footer={footer}
                        maxVisibleItems={maxVisibleItems}
                      >
                        {children}
                      </MenuScrollContent>
                    </MenuPopupElement>
                  )}
                </PassiveOpenGate>
              </baseMenu.Positioner>
            </layerBaseContext.Provider>
          )}
        </CollisionPaddingProvider>
      </PortalRoot>
    </baseMenu.Portal>
  );
}
function MenuSubmenu({
  actionsRef: actionsRef,
  ...props
}: MenuSubmenuProps): React.ReactElement {
  useUiLocale();
  let [value, setInternalOpen] = reactForUiMenu.useState(
      props.open ?? props.defaultOpen ?? false,
    ),
    ref = reactForUiMenu.useRef(value),
    notifyOpenChange = useOptionalEventCallback(props.onOpenChange),
    { sheet: isSheet } = useSheetState(),
    sheetFrame = reactForUiMenu.useContext<SheetFrameContext | null>(
      sheetFrameContext,
    ),
    sheetTreeId = sheetFrame?.treeId,
    stashedLabelRef = reactForUiMenu.useRef<React.ReactNode>(null),
    callback = reactForUiMenu.useCallback((label: React.ReactNode): void => {
      stashedLabelRef.current = label;
    }, []),
    [openedLabel, setOpenedLabel] = reactForUiMenu.useState<React.ReactNode>(null),
    handleOpenChange = reactForUiMenu.useCallback(
      (
        nextOpen: boolean,
        changeDetails: import("@base-ui/react/menu").Menu.Root.ChangeEventDetails,
      ): void => {
        if (isSheet && cancelNestedMenuClose(nextOpen, changeDetails, sheetTreeId)) {
          return;
        }
        if (
          isSheet &&
          !nextOpen &&
          sheetFrame?.refusesAmbientClose(changeDetails) === true
        ) {
          changeDetails.cancel();
          return;
        }
        notifyOpenChange?.(nextOpen, changeDetails);
        if (!changeDetails.isCanceled) {
          ref.current = nextOpen;
          setInternalOpen(nextOpen);
          if (nextOpen) {
            setOpenedLabel(stashedLabelRef.current);
          }
        }
      },
      [notifyOpenChange, isSheet, sheetFrame, sheetTreeId],
    ),
    triggerRef = reactForUiMenu.useRef<HTMLElement | null>(null),
    setTriggerNode = reactForUiMenu.useCallback(
      (trigger: HTMLElement | null): void => {
        triggerRef.current = trigger;
      },
      [],
    ),
    submenuActionsRef = reactForUiMenu.useRef<PublicOverlayActions | null>(null);
  useForwardedOverlayActions(submenuActionsRef, actionsRef);
  let closeSubmenu = reactForUiMenu.useCallback(() => {
      submenuActionsRef.current?.close();
    }, []),
    parentOpenActions =
      reactForUiMenu.useContext<React.RefObject<OverlayActions | null> | null>(
        menuIsOpenContext,
      ),
    parentRootActions =
      reactForUiMenu.useContext<React.RefObject<OverlayActions | null> | null>(
        menuRootIdentityContext,
      ),
    owningMenuActions = parentOpenActions ?? parentRootActions,
    memo = reactForUiMenu.useMemo(
      () => ({
        triggerRef: triggerRef,
        setTriggerNode: setTriggerNode,
        openRef: ref,
        close: closeSubmenu,
        stashLabel: callback,
      }),
      [setTriggerNode, closeSubmenu, callback],
    ),
    resolvedOpen = props.open ?? value;
  useIsomorphicLayoutEffect(() => {
    ref.current = resolvedOpen;
    if (resolvedOpen) {
      let current = stashedLabelRef.current;
      setOpenedLabel((previousLabel: React.ReactNode) =>
        previousLabel === current ? previousLabel : current,
      );
    }
  }, [resolvedOpen]);
  let submenuState = reactForUiMenu.useMemo(
    () => ({
      label: openedLabel,
      open: resolvedOpen,
    }),
    [openedLabel, resolvedOpen],
  );
  return (
    <menuTriggerContext.Provider value={memo}>
      <submenuStateContext.Provider value={submenuState}>
        <menuIsOpenContext.Provider value={owningMenuActions}>
          <menuRootIdentityContext.Provider value={submenuActionsRef}>
            <baseMenu.SubmenuRoot
              {...props}
              actionsRef={submenuActionsRef}
              onOpenChange={handleOpenChange}
            />
          </menuRootIdentityContext.Provider>
        </menuIsOpenContext.Provider>
      </submenuStateContext.Provider>
    </menuTriggerContext.Provider>
  );
}
function MenuSeparator(): React.ReactElement {
  useUiLocale();
  return (
    <baseMenu.Separator
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
  let value = useIsSheet(),
    isNested =
      reactForUiMenu.useContext<MenuRootState | null>(
        menuTriggerContext,
      ) !== null,
    { label: submenuLabel } = reactForUiMenu.useContext<MenuItemState>(
      submenuStateContext,
    ),
    duplicatesTriggerLabel =
      value &&
      isNested &&
      typeof children === "string" &&
      typeof submenuLabel === "string" &&
      children.trim() === submenuLabel.trim();
  return (
    <div
      role={"presentation"}
      className={cn(
        menuGroupLabelClasses,
        duplicatesTriggerLabel && "first:hidden",
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
    <baseMenu.GroupLabel
      className={cn(menuGroupLabelClasses, className)}
    >
      {children}
    </baseMenu.GroupLabel>
  );
}
function isMenuItemList(content: MenuItemsContent): content is MenuItems {
  return Array.isArray(content);
}
function renderMenuItems(content: MenuItemsContent): React.ReactNode {
  if (!isMenuItemList(content)) {
    return content;
  }
  return content.map((event: MenuItems[number], itemIndex: number) => {
    if (event === "separator") {
      return (() => {
        const _Element = MenuSeparator;
        const _elementProps = {};
        const _elementKey = itemIndex;
        return <_Element key={_elementKey} {..._elementProps} />;
      })();
    }
    if (
      event.label === undefined ||
      event.label === null ||
      event.label === "" ||
      event.label === false
    ) {
      return null;
    }
    if (event.items) {
      return (() => {
        const GroupFragment = reactForUiMenu.Fragment;
        const groupFragmentProps = {
          children: [
            event.separatorBefore && <MenuSeparator />,
            <MenuSubmenu disabled={event.disabled}>
              {[<MenuSubmenuTrigger icon={event.icon} hint={event.hint}>
                  {event.label}
                </MenuSubmenuTrigger>, <MenuPopup>{renderMenuItems(event.items)}</MenuPopup>]}
            </MenuSubmenu>,
          ],
        };
        const groupKey = itemIndex;
        return <GroupFragment key={groupKey} {...groupFragmentProps} />;
      })();
    }
    return (() => {
      const ItemFragment = reactForUiMenu.Fragment;
      const itemFragmentProps = {
        children: [
          event.separatorBefore && <MenuSeparator />,
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
          </MenuItem>,
        ],
      };
      const itemKey = itemIndex;
      return <ItemFragment key={itemKey} {...itemFragmentProps} />;
    })();
  });
}
function getMenuCaretSize(
  density: Density,
  size?: ControlSize,
): "sm" | "xs" {
  if (getDensitySizeIndex(density, size) >= 4) {
    return "sm";
  } else {
    return "xs";
  }
}
function MenuCaret({
  size: size,
}: {
  size?: ControlSize;
}): React.ReactElement {
  useUiLocale();
  let value = useDensity(),
    buttonGroup = useButtonGroup();
  return (
    <Icon
      name={"CaretDown"}
      size={getMenuCaretSize(value, size ?? buttonGroup?.size)}
      data-cds-part={"menu-caret"}
      className={"shrink-0 opacity-60"}
    />
  );
}
function MenuPopupContent({
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
function SimpleMenu(props: MenuProps): React.ReactElement {
  useUiLocale();
  let value = useSheetCapablePresentation(),
    inMenuBar = reactForUiMenu.useContext<boolean>(menuBarContext),
    actionsRef: React.RefObject<OverlayActions | null> = useStableObjectRef(),
    onOpenChange = props.onOpenChange,
    { onOpenChange: handleOpenChange, triggerRef: triggerRef } = useTrackedMenuTrigger(
      (
        nextOpen: boolean,
        changeDetails: import("@base-ui/react/menu").Menu.Root.ChangeEventDetails,
      ) => {
        onOpenChange?.(nextOpen, changeDetails);
        recordKeyboardContextMenuOpen(actionsRef, nextOpen, changeDetails);
      },
      inMenuBar,
    ),
    portalContainer = usePortalContainer();
  if (value) {
    return <MenuRootProviders {...props} />;
  }
  return useDropdownMenu(props, portalContainer, {
    triggerRef: triggerRef,
    onOpenChange: handleOpenChange,
    actionsRef: actionsRef,
    contextMenuOnOpenChange: handleOpenChange,
    inMenuBar: inMenuBar,
  });
}
function MenuRootProviders(props: MenuProps): React.ReactElement {
  useUiLocale();
  let {
      open: value,
      sheetTitle: sheetTitle,
      backLabel: backLabel,
      closeLabel: closeLabel,
    } = props,
    memo = reactForUiMenu.useMemo(
      () => ({
        sheetTitle: sheetTitle,
        backLabel: backLabel,
        closeLabel: closeLabel,
      }),
      [sheetTitle, backLabel, closeLabel],
    ),
    portalContainer = usePortalContainer(),
    inMenuBar = reactForUiMenu.useContext<boolean>(menuBarContext),
    { onOpenChange: handleTrackedOpenChange, triggerRef: triggerRef } = useTrackedMenuTrigger(props.onOpenChange, inMenuBar),
    controlledOpen = useControllableOpen({
      open: value,
      onOpenChange: handleTrackedOpenChange,
    }),
    open = controlledOpen.open,
    sheetState = useAdaptiveSheet({
      open: open,
      onOpenChange: controlledOpen.onOpenChange,
      closable: !(value !== undefined && props.onOpenChange === undefined),
      refuseClose: refuseInnerMenuClose,
    }),
    dropdownMenu = useDropdownMenu(props, portalContainer, {
      triggerRef: triggerRef,
      onOpenChange: sheetState.onOpenChange,
      onOpenChangeComplete: sheetState.onOpenChangeComplete,
      actionsRef: sheetState.actionsRef,
      sheetCapable: true,
      inMenuBar: inMenuBar,
    });
  return (
    <SheetContextProvider value={sheetState}>
      <menuSheetLabelsContext.Provider value={memo}>
        {dropdownMenu}
      </menuSheetLabelsContext.Provider>
    </SheetContextProvider>
  );
}
function useDropdownMenu(
  props: MenuProps,
  portalContainer: Element | ShadowRoot | undefined,
  menuState: ContextMenuState,
): React.ReactElement {
  let {
    items: value,
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
  } = props;
  if (props.trigger === "context-menu") {
    if (disabled) {
      return (
        <div data-disabled={""} className={className}>
          {props.children}
        </div>
      );
    }
    if (menuState.sheetCapable) {
      return (
        <CloseOnActivityHideProvider actionsRef={menuState.actionsRef}>
          <baseContextMenu.Root
            open={open}
            onOpenChange={menuState.onOpenChange as import("../contracts/overlays").ContextMenuChange}
            onOpenChangeComplete={menuState.onOpenChangeComplete}
            actionsRef={menuState.actionsRef}
          >
            {MenuContextProviders(
              <jsxForUiMenu.Fragment>
                {[<baseContextMenu.Trigger className={className}>
                    {props.children}
                  </baseContextMenu.Trigger>, <MenuPopup
                    side={side}
                    align={align}
                    sideOffset={sideOffset}
                    collisionPadding={collisionPadding}
                    finalFocus={finalFocus}
                    data-cds={dataCds ?? "Menu"}
                  >
                    {renderMenuItems(value)}
                  </MenuPopup>]}
              </jsxForUiMenu.Fragment>,
              null,
              menuState.actionsRef,
              true,
            )}
          </baseContextMenu.Root>
        </CloseOnActivityHideProvider>
      );
    }
    return (
      <CloseOnActivityHideProvider actionsRef={menuState.actionsRef}>
        <baseContextMenu.Root
          open={open}
          onOpenChange={menuState.contextMenuOnOpenChange as import("../contracts/overlays").ContextMenuChange}
          actionsRef={menuState.actionsRef}
        >
          {[<baseContextMenu.Trigger className={className}>
              {props.children}
            </baseContextMenu.Trigger>, <baseContextMenu.Portal container={(portalContainer) as import("../contracts/overlays").BaseUIPortalContainer}>
              <menuRootIdentityContext.Provider
                value={menuState.actionsRef}
              >
                <MenuPopupContent
                  side={side}
                  align={align}
                  sideOffset={sideOffset}
                  collisionPadding={collisionPadding}
                  finalFocus={finalFocus}
                  dataCds={dataCds}
                  items={value}
                />
              </menuRootIdentityContext.Provider>
            </baseContextMenu.Portal>]}
        </baseContextMenu.Root>
      </CloseOnActivityHideProvider>
    );
  }
  let trigger: React.ReactNode;
  if (props.renderTrigger !== undefined) {
    trigger = (
      <baseMenu.Trigger
        disabled={disabled}
        className={className}
        style={style}
        render={props.renderTrigger}
      />
    );
  } else if (props.iconOnly) {
    let tooltipText =
        props.tooltip === false
          ? undefined
          : typeof props.tooltip === "string"
            ? props.tooltip
            : props["aria-label"],
      iconTrigger = (
        <baseMenu.Trigger
          disabled={disabled}
          render={
            <Button
              variant={props.variant}
              size={props.size}
              iconOnly={true}
              icon={props.icon || "DotsVertical"}
              aria-label={props["aria-label"]}
              pressed={props.pressed}
              tooltip={false}
              className={className}
              style={style}
            />
          }
        />
      ),
      triggerWithTooltip = tooltipText ? (
        <Tooltip content={tooltipText}>{iconTrigger}</Tooltip>
      ) : (
        iconTrigger
      );
    trigger =
      props.disabledReason !== undefined ? (
        <DisabledReasonTooltip
          side={props.disabledReasonSide}
          reason={disabled ? props.disabledReason : undefined}
        >
          {triggerWithTooltip}
        </DisabledReasonTooltip>
      ) : (
        triggerWithTooltip
      );
  } else {
    trigger = (
      <baseMenu.Trigger
        disabled={disabled}
        render={
          <Button
            variant={props.variant}
            size={props.size}
            icon={props.icon}
            iconPosition={props.iconPosition}
            aria-label={props["aria-label"]}
            className={className}
            style={style}
          >
            {[props.label, <MenuCaret size={props.size} />]}
          </Button>
        }
      />
    );
  }
  return (
    <MenuOpenerProvider value={menuState.triggerRef}>
      <CloseOnActivityHideProvider actionsRef={menuState.actionsRef}>
        <baseMenu.Root<void>
          open={open}
          onOpenChange={menuState.onOpenChange as import("../contracts/overlays").ContextMenuChange}
          onOpenChangeComplete={menuState.onOpenChangeComplete}
          actionsRef={menuState.actionsRef}
          modal={menuState.inMenuBar ? undefined : true}
        >
          {MenuContextProviders(
            <jsxForUiMenu.Fragment>
              {[trigger, <MenuPopup
                  side={side}
                  align={align}
                  sideOffset={sideOffset}
                  collisionPadding={collisionPadding}
                  finalFocus={finalFocus}
                  data-cds={dataCds}
                >
                  {renderMenuItems(value)}
                </MenuPopup>]}
            </jsxForUiMenu.Fragment>,
            null,
            menuState.actionsRef,
          )}
        </baseMenu.Root>
      </CloseOnActivityHideProvider>
    </MenuOpenerProvider>
  );
}
function refuseInnerMenuClose(
  changeDetails: import("@base-ui/react/menu").Menu.Root.ChangeEventDetails,
  sheetTreeId?: string,
): boolean {
  return shouldRefuseNestedMenuClose(false, changeDetails, sheetTreeId);
}
function MenuRoot(props: MenuRootProps): React.ReactElement {
  useUiLocale();
  let {
      children: value,
      sheetTitle: sheetTitle,
      backLabel: backLabel,
      closeLabel: closeLabel,
      ...rootProps
    } = props,
    canShowSheet = useSheetCapablePresentation(),
    inMenuBar = reactForUiMenu.useContext<boolean>(menuBarContext),
    { onOpenChange: handleTrackedOpenChange, triggerRef: triggerRef } = useTrackedMenuTrigger(rootProps.onOpenChange, inMenuBar),
    passiveOpen = usePassiveOpenState(handleTrackedOpenChange, rootProps.open, !inMenuBar),
    actionsRef: React.RefObject<OverlayActions | null> = useStableObjectRef();
  useForwardedOverlayActions(actionsRef, rootProps.actionsRef);
  if (canShowSheet) {
    return (
      <CloseOnActivityHideProvider actionsRef={actionsRef}>
        <ControlledMenuRoot {...props} actionsRef={actionsRef} />
      </CloseOnActivityHideProvider>
    );
  }
  return (
    <MenuOpenerProvider value={triggerRef}>
      <CloseOnActivityHideProvider actionsRef={actionsRef}>
        <baseMenu.Root<void>
          {...rootProps}
          modal={inMenuBar ? undefined : rootProps.modal}
          actionsRef={actionsRef}
          onOpenChange={passiveOpen.onOpenChange}
        >
          {typeof value === "function" ? ((renderProps: {payload:void}) =>
                MenuContextProviders(value(renderProps), passiveOpen.cell, actionsRef)) : (MenuContextProviders(value, passiveOpen.cell, actionsRef))}
        </baseMenu.Root>
      </CloseOnActivityHideProvider>
    </MenuOpenerProvider>
  );
}
function ControlledMenuRoot(props: MenuRootProps): React.ReactElement {
  useUiLocale();
  let {
      children: value,
      sheetTitle: sheetTitle,
      backLabel: backLabel,
      closeLabel: closeLabel,
      ...rootProps
    } = props,
    memo = reactForUiMenu.useMemo(
      () => ({
        sheetTitle: sheetTitle,
        backLabel: backLabel,
        closeLabel: closeLabel,
      }),
      [sheetTitle, backLabel, closeLabel],
    ),
    inMenuBar = reactForUiMenu.useContext<boolean>(menuBarContext),
    { onOpenChange: handleTrackedOpenChange, triggerRef: triggerRef } = useTrackedMenuTrigger(props.onOpenChange, inMenuBar),
    passiveOpen = usePassiveOpenState(handleTrackedOpenChange, props.open, !inMenuBar),
    controlledOpen = useControllableOpen({
      ...props,
      onOpenChange: passiveOpen.onOpenChange,
    }),
    structurallyAnchored = useValueCapturedOnOpen(
      controlledOpen.open,
      () => passiveOpen.cell.getLevel() === "declared",
      false,
    ),
    sheetState = useAdaptiveSheet({
      open: controlledOpen.open,
      actionsRef: props.actionsRef,
      onOpenChange: controlledOpen.onOpenChange,
      onOpenChangeComplete: props.onOpenChangeComplete,
      structurallyAnchored: structurallyAnchored,
      closable: !(
        props.open !== undefined && props.onOpenChange === undefined
      ),
      refuseClose: refuseInnerMenuClose,
    });
  return (
    <MenuOpenerProvider value={triggerRef}>
      <SheetContextProvider value={sheetState}>
        <menuSheetLabelsContext.Provider value={memo}>
          <baseMenu.Root<void>
            {...rootProps}
            modal={inMenuBar ? undefined : (sheetState.modal ?? rootProps.modal)}
            actionsRef={sheetState.actionsRef}
            onOpenChange={sheetState.onOpenChange}
            onOpenChangeComplete={sheetState.onOpenChangeComplete}
          >
            {typeof value === "function" ? ((renderProps: {payload:void}) =>
                  MenuContextProviders(
                    value(renderProps),
                    passiveOpen.cell,
                    sheetState.actionsRef,
                  )) : (MenuContextProviders(value, passiveOpen.cell, sheetState.actionsRef))}
          </baseMenu.Root>
        </menuSheetLabelsContext.Provider>
      </SheetContextProvider>
    </MenuOpenerProvider>
  );
}
function ResetQueryOnUnmount({ reset: reset }: { reset: () => void }): null {
  reactForUiMenu.useEffect(() => () => reset(), [reset]);
  return null;
}
function isMenuSearchEditingKey(keyEvent: SearchKeyEvent): boolean {
  let value = keyEvent.getModifierState("AltGraph");
  return (
    ((keyEvent.key.length === 1 && keyEvent.key !== " ") ||
      keyEvent.key === "Backspace" ||
      (keyEvent.key === "Delete" && !keyEvent.shiftKey)) &&
    (!keyEvent.ctrlKey || value) &&
    !keyEvent.metaKey &&
    (!keyEvent.altKey || value) &&
    keyEvent.keyCode !== 229
  );
}
function MenuSearchTriggerKeyboardBridge({
  inputRef: inputRef,
  applyKey: applyKey,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  applyKey: (key: string) => void;
}): null {
  let value = reactForUiMenu.useContext<MenuRootState | null>(
    menuTriggerContext,
  )?.triggerRef;
  reactForUiMenu.useEffect(() => {
    let triggerElement = value?.current;
    if (!triggerElement) {
      return;
    }
    let callback = (event: KeyboardEvent): void => {
      if (event.isComposing || !isMenuSearchEditingKey(event)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      inputRef.current?.focus({
        preventScroll: true,
      });
      applyKey(event.key);
    };
    triggerElement.addEventListener("keydown", callback, true);
    return () => triggerElement.removeEventListener("keydown", callback, true);
  }, [value, inputRef, applyKey]);
  return null;
}
function MenuSearchTriggerFocusBridge({
  inputRef: inputRef,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
}): null {
  let value = reactForUiMenu.useContext<MenuRootState | null>(
    menuTriggerContext,
  );
  reactForUiMenu.useEffect(() => {
    let triggerElement = value?.triggerRef.current;
    if (!value || !triggerElement) {
      return;
    }
    let { openRef: openRef } = value,
      callback = (focusEvent: FocusEvent): void => {
        let current = inputRef.current,
          relatedElement = asElement(focusEvent.relatedTarget);
        if (
          current &&
          relatedElement &&
          openRef.current &&
          current.closest('[role="menu"]')?.contains(relatedElement)
        ) {
          current.focus({
            preventScroll: true,
          });
        }
      };
    triggerElement.addEventListener("focus", callback);
    return () => triggerElement.removeEventListener("focus", callback);
  }, [value, inputRef]);
  reactForUiMenu.useEffect(() => {
    let callback = (): void => {
      let current = inputRef.current;
      if (!current) {
        return;
      }
      let ancestor = current.closest('[role="menu"]'),
        activeElement = current.ownerDocument.activeElement;
      if (ancestor?.contains(activeElement) && activeElement !== ancestor) {
        return;
      }
      current.focus({
        preventScroll: true,
      });
    };
    callback();
    let index = 0,
      retryFocusFrame = 0,
      retryFocus = () => {
        callback();
        index += 1;
        if (index < 2) {
          retryFocusFrame = requestAnimationFrame(retryFocus);
        }
      };
    retryFocusFrame = requestAnimationFrame(retryFocus);
    return () => cancelAnimationFrame(retryFocusFrame);
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
  let [value, setInternalQuery] = reactForUiMenu.useState(""),
    resolvedQuery = query ?? value,
    updateQuery: (input: string) => void = useEventCallback(
      (nextQuery: string) => {
        setInternalQuery(nextQuery);
        onQueryChange?.(nextQuery);
      },
    ),
    resetQuery = useEventCallback(() => {
      if (resolvedQuery !== "") {
        updateQuery("");
      }
    }),
    ref = reactForUiMenu.useRef(false);
  reactForUiMenu.useEffect(() => {
    return;
  }, [query, onQueryChange]);
  let isSheet = useIsSheet(),
    usesCoarsePointer = useMediaQuery__U(
      useRootWindow(),
      COARSE_POINTER_QUERY_rG,
    ),
    useDesktopSearch = !isSheet && !usesCoarsePointer,
    parentOpenActions =
      reactForUiMenu.useContext<React.RefObject<OverlayActions | null> | null>(
        menuIsOpenContext,
      ),
    menuRootActions =
      reactForUiMenu.useContext<React.RefObject<OverlayActions | null> | null>(
        menuRootIdentityContext,
      ),
    owningMenuActions = parentOpenActions ?? menuRootActions,
    accessoryRef = reactForUiMenu.useRef<HTMLDivElement | null>(null),
    searchInputRef = reactForUiMenu.useRef<HTMLInputElement | null>(null),
    removeMouseMoveListenerRef = reactForUiMenu.useRef<(() => void) | null>(null);
  reactForUiMenu.useEffect(() => () => removeMouseMoveListenerRef.current?.(), []);
  let callback = reactForUiMenu.useCallback((key: string) => {
      let current = searchInputRef.current;
      if (!current) {
        return;
      }
      let { value: previousText } = current,
        selectionStart = current.selectionStart ?? previousText.length,
        selectionEnd = current.selectionEnd ?? previousText.length,
        isDeletion = key === "Backspace" || key === "Delete",
        insertedText = isDeletion ? "" : key;
      if (isDeletion && selectionStart === selectionEnd) {
        if (key === "Backspace") {
          let hasLeadingSurrogatePair = (previousText.codePointAt(selectionStart - 2) ?? 0) > 65535;
          selectionStart = Math.max(0, selectionStart - (hasLeadingSurrogatePair ? 2 : 1));
        } else {
          let hasTrailingSurrogatePair = (previousText.codePointAt(selectionEnd) ?? 0) > 65535;
          selectionEnd = Math.min(previousText.length, selectionEnd + (hasTrailingSurrogatePair ? 2 : 1));
        }
      }
      let nextText =
          previousText.slice(0, selectionStart) + insertedText + previousText.slice(selectionEnd),
        ownerWindow = current.ownerDocument.defaultView ?? window;
      Object.getOwnPropertyDescriptor(
        ownerWindow.HTMLInputElement.prototype,
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
    focusAccessory = () => {
      let current = accessoryRef.current,
        focusableAccessory =
          current?.querySelector<HTMLElement>('[tabindex="0"]') ??
          current?.querySelector<HTMLElement>(
            'input, button, [role="radio"]',
          );
      if (!focusableAccessory) {
        return false;
      }
      focusableAccessory.focus();
      return true;
    };
  return (
    <MenuPopup
      {...props}
      stableWhileOpen={stableWhileOpen}
      onKeyDown={(event: MenuPopupKeyboardEvent) => {
        let current = searchInputRef.current;
        if (
          !current ||
          (event.target as HTMLElement).closest?.(
            "input, textarea, [contenteditable]",
          ) ||
          event.nativeEvent.isComposing ||
          !isMenuSearchEditingKey(event)
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
        callback(event.key);
      }}
      onFocus={(event: MenuPopupFocusEvent) => {
        onFocus?.(event);
        let currentTarget = event.currentTarget,
          ownerDocument = currentTarget.ownerDocument;
        if (
          !useDesktopSearch ||
          event.target !== currentTarget ||
          ownerDocument.activeElement !== currentTarget
        ) {
          return;
        }
        let relatedElement = asElement(event.relatedTarget);
        if (
          !(
            relatedElement?.hasAttribute("data-popup-open") &&
            currentTarget.contains(relatedElement)
          )
        ) {
          searchInputRef.current?.focus({
            preventScroll: true,
          });
          return;
        }
        removeMouseMoveListenerRef.current?.();
        let handleMouseMove = (mouseEvent: MouseEvent) => {
          let hoveredElement = asElement(mouseEvent.target),
            hoveredMenu = hoveredElement?.closest('[role="menu"]'),
            bounds = currentTarget.getBoundingClientRect(),
            isInsidePopup =
              mouseEvent.clientX >= bounds.left &&
              mouseEvent.clientX < bounds.right &&
              mouseEvent.clientY >= bounds.top &&
              mouseEvent.clientY < bounds.bottom;
          if (!hoveredMenu && isInsidePopup) {
            return;
          }
          removeMouseMoveListenerRef.current?.();
          if (
            !(
              hoveredMenu &&
              (hoveredMenu !== currentTarget ||
                hoveredElement?.closest('[role^="menuitem"]'))
            ) &&
            ownerDocument.activeElement === currentTarget
          ) {
            searchInputRef.current?.focus({
              preventScroll: true,
            });
          }
        };
        ownerDocument.addEventListener("mousemove", handleMouseMove);
        removeMouseMoveListenerRef.current = () => {
          ownerDocument.removeEventListener("mousemove", handleMouseMove);
          removeMouseMoveListenerRef.current = null;
        };
      }}
      onMouseDown={(event: React.MouseEvent<HTMLElement>) => {
        let target = event.target as HTMLElement;
        if (
          (isHtmlElement(target) &&
            target.localName === "input") ||
          target === event.currentTarget
        ) {
          return;
        }
        if (
          target.classList.contains("overflow-y-auto") &&
          isScrollbarPointerPosition(
            event.nativeEvent.offsetX,
            event.nativeEvent.offsetY,
            target,
          )
        ) {
          return;
        }
        event.preventDefault();
      }}
      header={
        <jsxForUiMenu.Fragment>
          {[beforeSearch !== undefined && (
              <div
                ref={accessoryRef}
                role={"presentation"}
                className={"px-sm pt-sm"}
                onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === "Escape") {
                    return;
                  }
                  event.stopPropagation();
                  if (event.key === "Tab") {
                    event.preventDefault();
                    searchInputRef.current?.focus();
                  }
                }}
              >
                {beforeSearch}
              </div>
            ), <TextInput
              ref={searchInputRef}
              value={resolvedQuery}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                updateQuery(event.target.value)
              }
              onCompositionEnd={(
                event: React.CompositionEvent<HTMLInputElement>,
              ) =>
                recordCompositionEnd(event.nativeEvent.timeStamp)
              }
              onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                resetCompositionSuppression(event);
                if (event.nativeEvent.isComposing || event.keyCode === 229) {
                  event.stopPropagation();
                  return;
                }
                if (event.key === "Enter") {
                  let submittedQuery = resolvedQuery.trim();
                  if (
                    onSubmitQuery !== undefined &&
                    submittedQuery !== "" &&
                    !event.repeat &&
                    !event.shiftKey &&
                    !event.altKey
                  ) {
                    let submitAndClose = () => {
                      onSubmitQuery(submittedQuery);
                      owningMenuActions?.current?.close?.();
                    };
                    if (
                      shouldSuppressCompositionEnter(
                        event.nativeEvent,
                      )
                    ) {
                      suppressFollowupCompositionLineBreak(
                        event.nativeEvent,
                        event.currentTarget,
                        submitAndClose,
                      );
                    } else {
                      event.preventDefault();
                      submitAndClose();
                    }
                  }
                  event.stopPropagation();
                  return;
                }
                if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                  let enabledItems = event.currentTarget
                      .closest('[role="menu"]')
                      ?.querySelectorAll<HTMLElement>(
                        '[role^="menuitem"]:not([aria-disabled="true"])',
                      ),
                    nextItem =
                      event.key === "ArrowDown"
                        ? enabledItems?.[0]
                        : enabledItems?.[enabledItems.length - 1];
                  if (nextItem !== undefined) {
                    event.preventDefault();
                    event.stopPropagation();
                    nextItem.focus();
                  }
                  return;
                }
                if (event.key === "Tab" && !event.shiftKey && focusAccessory()) {
                  event.preventDefault();
                  event.stopPropagation();
                  return;
                }
                if (event.key === "Escape" || event.key === "Tab") {
                  return;
                }
                event.stopPropagation();
              }}
              placeholder={searchLabel}
              aria-label={searchLabel}
              autoComplete={"off"}
              data-1p-ignore={true}
              autoFocus={useDesktopSearch}
              tabIndex={useDesktopSearch ? undefined : -1}
              className={
                "!border-transparent !bg-transparent !shadow-none compact:!pl-2 comfortable:!pl-2.5"
              }
            />, <baseMenu.Separator
              className={"-mx-1 my-1 h-px bg-border"}
            />]}
        </jsxForUiMenu.Fragment>
      }
    >
      {[resetQueryOnClose && <ResetQueryOnUnmount reset={resetQuery} />, useDesktopSearch && <MenuSearchTriggerFocusBridge inputRef={searchInputRef} />, <MenuSearchTriggerKeyboardBridge
          inputRef={searchInputRef}
          applyKey={callback}
        />, children(resolvedQuery.trim().toLowerCase(), resolvedQuery.trim())]}
    </MenuPopup>
  );
}
function useFocusMenuAfterPending(
  listRef: React.RefObject<HTMLElement | null>,
  isPending: boolean,
): void {
  let ref = reactForUiMenu.useRef(isPending);
  useIsomorphicLayoutEffect(() => {
    let value = listRef.current?.closest<HTMLElement>('[role="menu"]');
    if (!isPending || ref.current || !value?.hasAttribute("data-open")) {
      return;
    }
    let activeElement = value.ownerDocument.activeElement;
    if (
      activeElement === null ||
      activeElement === value.ownerDocument.body
    ) {
      value.focus({
        preventScroll: true,
      });
    }
  }, [listRef, isPending]);
  reactForUiMenu.useEffect(() => {
    let value = ref.current && !isPending;
    ref.current = isPending;
    let current = listRef.current;
    if (!value || !current) {
      return;
    }
    let focusFrame = requestAnimationFrame(() => {
      let element = current.querySelector<HTMLElement>(
          HIGHLIGHTED_MENU_ITEM_SELECTOR,
        ),
        ancestor = current.closest('[role="menu"]');
      if (
        element &&
        ancestor &&
        current.ownerDocument.activeElement === ancestor
      ) {
        element.focus({
          preventScroll: true,
        });
      }
    });
    return () => cancelAnimationFrame(focusFrame);
  }, [listRef, isPending]);
}
function MenuPendingList({
  pending = false,
  loading = false,
  placeholderRows = 3,
  icon = false,
  children: children,
}: MenuPendingProps): React.ReactElement {
  useUiLocale();
  let ref = reactForUiMenu.useRef<HTMLDivElement | null>(null),
    lastMeasuredSizeRef = reactForUiMenu.useRef(emptyMenuSize);
  reactForUiMenu.useEffect(() => {
    let current = ref.current;
    if (!current || typeof ResizeObserver === "undefined") {
      return;
    }
    let observer = new ResizeObserver(() => {
      lastMeasuredSizeRef.current = {
        width: current.offsetWidth,
        height: current.offsetHeight,
      };
    });
    observer.observe(current);
    return () => observer.disconnect();
  }, []);
  let value = pending || loading,
    [reservedSize, setReservedSize] = reactForUiMenu.useState(emptyMenuSize);
  useIsomorphicLayoutEffect(() => {
    let current = ref.current;
    if (!value || !current) {
      setReservedSize(emptyMenuSize);
      return;
    }
    setReservedSize(
      loading && lastMeasuredSizeRef.current.height > 0
        ? lastMeasuredSizeRef.current
        : {
            width: current.offsetWidth,
            height: current.offsetHeight,
          },
    );
  }, [value, loading]);
  let shouldReserveSize = value && reservedSize.height > 0;
  useFocusMenuAfterPending(ref, loading);
  return (
    <div
      ref={ref}
      aria-busy={value || undefined}
      style={
        shouldReserveSize
          ? {
              minWidth: reservedSize.width,
              height: reservedSize.height,
            }
          : undefined
      }
      className={shouldReserveSize ? "overflow-hidden" : undefined}
    >
      {loading ? (<SkeletonGroup>
          <SkeletonPrimitive.Rows
            icon={icon}
            rows={
              shouldReserveSize
                ? Math.ceil(reservedSize.height / MENU_PLACEHOLDER_MINIMUM_WIDTH)
                : placeholderRows
            }
          />
        </SkeletonGroup>) : (children)}
    </div>
  );
}
export {
  cancelNestedMenuClose,
  ControlledMenuRoot,
  emptyMenuSize,
  extractReactText,
  getMenuCaretSize,
  getShortcutNumeralClasses,
  HIGHLIGHTED_MENU_ITEM_SELECTOR,
  isFocusOutEvent,
  isMenuItemList,
  isMenuSearchEditingKey,
  isNestedMenuEvent,
  jsxForUiMenu,
  jsxo_,
  Menu,
  MENU_PLACEHOLDER_MINIMUM_WIDTH,
  MenuBar,
  MenuCaret,
  MenuContextProviders,
  MenuGroupLabel,
  menuGroupLabelClasses,
  MenuHeader,
  MenuItem,
  MenuPendingList,
  MenuPopup,
  MenuPopupContent,
  MenuRoot,
  MenuRootProviders,
  MenuSearchablePopup,
  MenuSearchTriggerFocusBridge,
  MenuSearchTriggerKeyboardBridge,
  MenuSeparator,
  MenuSheetCapablePopup,
  MenuShortcut,
  MenuSubmenu,
  MenuSubmenuTrigger,
  MenuTriggerButton,
  normalizeLabelText,
  numericShortcutPattern,
  reactForUiMenu,
  reacttM,
  refuseInnerMenuClose,
  renderMenuItems,
  ResetQueryOnUnmount,
  shouldRefuseNestedMenuClose,
  SimpleMenu,
  useDropdownMenu,
  useFocusMenuAfterPending,
  useMenuItemLabel,
  useMenuPopupElement,
};
export function installUiMenu(): () => void {
  return () => {
    initializeMenuContexts();
    initializeKeyboardContextMenuFocus();
    initializeMenuScrollContent();
    initializeContextMenuPopup();
    initializePassiveOpen();
    initializeMenuItemVariants();
    initializeMenuOpener();
    initializeTooltip();
    initializeMenuContexts();
    initializePassiveOpen();
    initializeMenuOpener();
    jsxo_ = toModuleNamespace(loadJsxNamespace(), 1);
    initializeMenuPopupElement();
    initializeElementAccess();
    initializeStablePopupPlacement();
    initializeIsomorphicLayoutEffect();
    reacttM = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    reactForUiMenu = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxForUiMenu = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    numericShortcutPattern = /^\d+$/;
    MenuPopup = reactForUiMenu.forwardRef(
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
          value = useHasSheetFrame(),
          popup = useMenuPopupElement(state, forwardedRef, !value, false);
        if (value) {
          return <MenuSheetCapablePopup {...state} ref={forwardedRef} />;
        }
        return popup;
      },
    );
    MenuPopup.displayName = "Menu.Popup";
    MenuSheetCapablePopup = reactForUiMenu.forwardRef(
      (
        props: MenuPopupProps,
        forwardedRef: React.ForwardedRef<HTMLDivElement>,
      ): React.ReactElement => {
        let value = useSheetImplementation(),
          { pending: isPending } = useSheetState(),
          triggerState = reactForUiMenu.useContext<MenuRootState | null>(
            menuTriggerContext,
          ),
          overlayKind: import("../contracts/overlays").OverlayKind =
            reactForUiMenu.useContext<boolean>(contextMenuContext) &&
            triggerState === null
              ? "contextmenu"
              : "menu",
          fallbackPopup = useMenuPopupElement(
            props,
            forwardedRef,
            value === null,
            value === null && isPending,
          );
        if (value !== null) {
          return <value.MenuSheetPopup {...props} ref={forwardedRef} />;
        }
        return (
          <jsxForUiMenu.Fragment>
            {[fallbackPopup, isPending && triggerState === null ? (
                <PendingSheetBackdrop kind={overlayKind} />
              ) : null]}
          </jsxForUiMenu.Fragment>
        );
      },
    );
    MenuSheetCapablePopup.displayName = "MenuSheetCapablePopup";
    MenuItem = reactForUiMenu.forwardRef(
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
        let value = indicator === "checkbox",
          resolvedChecked = value
            ? href !== undefined
              ? undefined
              : (checked ?? false)
            : checked,
          resolvedCheckedRole = value ? "checkbox" : (checkedRole ?? "checkbox"),
          resolvedCheckPosition = checkPosition ?? (value ? "leading" : "trailing"),
          usesAppleKeyboard = useAppleKeyboard(),
          announcementId = reactForUiMenu.useId(),
          {
            label: resolvedLabel,
            labelSpanRef: labelSpanRef,
            rowRef: rowRef,
          } = useMenuItemLabel(children, props.label),
          mergedRef = useMergedRefs(forwardedRef, rowRef),
          showDisabledReason =
            props.disabled === true &&
            hasDisabledReason(disabledReason),
          state = {
            "aria-keyshortcuts": shortcut
              ? shortcutToAriaKeyShortcuts(shortcut, usesAppleKeyboard)
              : undefined,
            "data-cds-icon-row":
              icon !== undefined &&
              !(resolvedChecked !== undefined && resolvedCheckPosition === "leading")
                ? ""
                : undefined,
            [FOCUSES_NOTHING_ATTRIBUTE]: focusesNothing
              ? ""
              : undefined,
            ...props,
            label: resolvedLabel,
            "aria-describedby":
              [showDisabledReason ? announcementId : undefined, props["aria-describedby"]]
                .filter(Boolean)
                .join(" ") || undefined,
          },
          passiveFocusProps = useMenuPassiveFocusProps(),
          callback = (itemElement: React.ReactElement): React.ReactElement =>
            disabledReason === undefined ? (
              itemElement
            ) : (
              <Tooltip
                content={showDisabledReason ? disabledReason : undefined}
                side={"right"}
                multiline={true}
                closeOnClick={false}
              >
                <div role={"none"}>
                  {[itemElement, <DisabledReasonAnnouncement
                      id={announcementId}
                      reason={showDisabledReason ? disabledReason : undefined}
                    />]}
                </div>
              </Tooltip>
            ),
          anchorAttributes = useCdsLink({
            href: href,
            routerOptions: routerOptions,
            target: target,
            rel: rel,
            download: download,
            ...pickLinkEventProps(props),
          }),
          itemClassName = cn(
            menuItemVariants({
              variant: variant,
            }),
            description ? `${menuItemDescriptionPaddingClass} ` : "",
            className,
          ),
          checkIndicator = resolvedChecked !== undefined && (
            <span
              className={clsx(
                "flex size-icon shrink-0 items-center justify-center",
                resolvedCheckPosition === "trailing" && !hint && !shortcut && "-mr-1",
                Boolean(resolvedCheckPosition === "trailing" && shortcut && !hint) &&
                  "pointer-coarse:-mr-1",
                value &&
                  resolvedCheckPosition === "leading" &&
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
                    checked={resolvedChecked}
                    indeterminate={indeterminate}
                  />
                </span>) : (resolvedChecked && (<Icon name={"Check"} size={"auto"} bold={true} />))}
            </span>
          ),
          itemContent = (
            <jsxForUiMenu.Fragment>
              {[leading, resolvedCheckPosition === "leading" && checkIndicator, icon !== undefined && <IconSlot icon={icon} />, description ? (
                  <span className={"flex min-w-0 flex-1 flex-col"}>
                    {[<span ref={labelSpanRef} className={"truncate"}>
                        {children}
                      </span>, <span
                        className={
                          "truncate py-[0.125em] -my-[0.125em] text-footnote text-muted group-data-[highlighted]/menu-danger:text-on-danger"
                        }
                      >
                        {description}
                      </span>]}
                  </span>
                ) : (
                  <span ref={labelSpanRef} className={"min-w-0 flex-1 truncate"}>
                    {children}
                  </span>
                ), Boolean(
                  trailing ||
                    (resolvedChecked !== undefined && resolvedCheckPosition === "trailing") ||
                    hint ||
                    shortcut,
                ) && (
                  <span
                    className={clsx(
                      "ml-md flex shrink-0 items-center gap-xs",
                      Boolean(
                        shortcut &&
                          !trailing &&
                          !(resolvedChecked !== undefined && resolvedCheckPosition === "trailing") &&
                          !hint,
                      ) && "pointer-coarse:hidden",
                    )}
                  >
                    {[trailing, resolvedCheckPosition === "trailing" && checkIndicator, hint && (
                        <span
                          className={`max-w-[160px] shrink-0 truncate py-[0.125em] -my-[0.125em] text-footnote text-muted group-data-[highlighted]/menu-danger:text-on-danger ${getShortcutNumeralClasses(hint)}`}
                        >
                          {hint}
                        </span>
                      ), shortcut && <MenuShortcut keys={shortcut} />]}
                  </span>
                )]}
            </jsxForUiMenu.Fragment>
          );
        if (href !== undefined) {
          let linkItemProps = omitLinkEventProps(state);
          return callback(
            <baseMenu.Item
              ref={mergedRef}
              {...linkItemProps}
              {...passiveFocusProps}
              closeOnClick={keepOpen ? false : undefined}
              className={itemClassName}
              render={<a {...anchorAttributes} />}
            >
              {itemContent}
            </baseMenu.Item>,
          );
        }
        if (resolvedChecked !== undefined) {
          if (resolvedCheckedRole === "radio") {
            return callback(
              <baseMenu.Item
                ref={mergedRef}
                {...state}
                {...passiveFocusProps}
                role={"menuitemradio"}
                aria-checked={resolvedChecked}
                closeOnClick={keepOpen ? false : undefined}
                className={itemClassName}
              >
                {itemContent}
              </baseMenu.Item>,
            );
          }
          return callback(
            <baseMenu.CheckboxItem
              ref={mergedRef}
              {...state}
              {...(value && indeterminate
                ? {
                    "aria-checked": "mixed",
                  }
                : {})}
              {...passiveFocusProps}
              checked={resolvedChecked}
              closeOnClick={value ? false : !keepOpen}
              className={itemClassName}
            >
              {itemContent}
            </baseMenu.CheckboxItem>,
          );
        }
        return callback(
          <baseMenu.Item
            ref={mergedRef}
            {...state}
            {...passiveFocusProps}
            closeOnClick={keepOpen ? false : undefined}
            className={itemClassName}
          >
            {itemContent}
          </baseMenu.Item>,
        );
      },
    );
    MenuItem.displayName = "Menu.Item";
    MenuSubmenuTrigger = reactForUiMenu.forwardRef(
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
        let value = reactForUiMenu.useContext<MenuRootState | null>(
            menuTriggerContext,
          ),
          isSheet = useIsSheet(),
          passiveFocusProps = useMenuPassiveFocusProps(),
          {
            label: resolvedLabel,
            labelSpanRef: labelSpanRef,
            rowRef: rowRef,
          } = useMenuItemLabel(children, props.label),
          mergedRef = useMergedRefs(
            value?.setTriggerNode,
            forwardedRef,
            rowRef,
          ),
          stashLabel = value?.stashLabel;
        useIsomorphicLayoutEffect(() => {
          if (isSheet) {
            stashLabel?.(children);
          }
        }, [isSheet, stashLabel, children]);
        return (
          <baseMenu.SubmenuTrigger
            ref={mergedRef}
            data-cds-icon-row={icon !== undefined ? "" : undefined}
            {...props}
            label={resolvedLabel}
            {...passiveFocusProps}
            openOnHover={isSheet ? false : openOnHover}
            className={cn(
              menuItemVariants({
                variant: "default",
              }),
              "justify-between data-[popup-open]:bg-fill-ghost-hover",
              className,
            )}
          >
            {[leading, icon !== undefined && <IconSlot icon={icon} />, <span ref={labelSpanRef} className={"min-w-0 flex-1 truncate"}>
                {children}
              </span>, trailing || hint ? (
                <span className={"ml-md flex shrink-0 items-center gap-xs"}>
                  {[trailing, hint && (
                      <span
                        className={`max-w-[160px] shrink-0 truncate py-[0.125em] -my-[0.125em] text-footnote text-muted ${getShortcutNumeralClasses(hint)}`}
                      >
                        {hint}
                      </span>
                    ), <Icon
                      name={"CaretRight"}
                      size={"sm"}
                      className={"-mr-1 shrink-0 text-muted"}
                    />]}
                </span>
              ) : (
                <Icon
                  name={"CaretRight"}
                  size={"sm"}
                  className={"-mr-1 shrink-0 text-muted"}
                />
              )]}
          </baseMenu.SubmenuTrigger>
        );
      },
    );
    MenuSubmenuTrigger.displayName = "Menu.SubmenuTrigger";
    (
      MenuSubmenu as typeof MenuSubmenu & {
        displayName?: string;
      }
    ).displayName = "Menu.Submenu";
    (
      MenuSeparator as typeof MenuSeparator & {
        displayName?: string;
      }
    ).displayName = "Menu.Separator";
    menuGroupLabelClasses =
      "compact:px-2 comfortable:px-2.5 py-1 text-footnote font-medium text-muted";
    (
      MenuHeader as typeof MenuHeader & {
        displayName?: string;
      }
    ).displayName = "Menu.Header";
    (
      MenuGroupLabel as typeof MenuGroupLabel & {
        displayName?: string;
      }
    ).displayName = "Menu.GroupLabel";
    (
      SimpleMenu as typeof SimpleMenu & {
        displayName?: string;
      }
    ).displayName = "Menu";
    (
      MenuRoot as typeof MenuRoot & {
        displayName?: string;
      }
    ).displayName = "Menu.Root";
    MenuTriggerButton = reactForUiMenu.forwardRef(function (
      { children: children, id: id, ...props }: MenuTriggerButtonProps,
      forwardedRef: React.ForwardedRef<HTMLButtonElement>,
    ): React.ReactElement {
      return (
        <baseMenu.Trigger
          id={id}
          disabled={props.disabled || props.busy}
          render={
            <Button
              ref={forwardedRef}
              {...props}
              {...(props.busy
                ? {
                    disabled: props.disabled,
                  }
                : undefined)}
            >
              {[children, <MenuCaret size={props.size} />]}
            </Button>
          }
        />
      );
    });
    MenuTriggerButton.displayName = "Menu.TriggerButton";
    (
      MenuSearchablePopup as typeof MenuSearchablePopup & {
        displayName?: string;
      }
    ).displayName = "Menu.SearchablePopup";
    MENU_PLACEHOLDER_MINIMUM_WIDTH = 20;
    emptyMenuSize = {
      width: 0,
      height: 0,
    };
    HIGHLIGHTED_MENU_ITEM_SELECTOR = '[data-highlighted][tabindex="0"]';
    (
      MenuPendingList as typeof MenuPendingList & {
        displayName?: string;
      }
    ).displayName = "Menu.PendingList";
    MenuBar = reactForUiMenu.forwardRef(function (
      {
        className: className,
        ...props
      }: import("@base-ui/react/menubar").Menubar.Props,
      forwardedRef: React.ForwardedRef<HTMLDivElement>,
    ): React.ReactElement {
      return (
        <menuBarContext.Provider value={true}>
          <R_baseMenubarRoot
            ref={forwardedRef}
            data-cds={"MenuBar"}
            {...props}
            className={cn("flex items-center gap-xs", className)}
          />
        </menuBarContext.Provider>
      );
    });
    MenuBar.displayName = "Menu.Bar";
    Menu = Object.assign(SimpleMenu, {
      Root: MenuRoot,
      Bar: MenuBar,
      Trigger: baseMenu.Trigger,
      TriggerButton: MenuTriggerButton,
      Popup: MenuPopup,
      Item: MenuItem,
      Separator: MenuSeparator,
      Group: baseMenu.Group,
      GroupLabel: MenuGroupLabel,
      Header: MenuHeader,
      Submenu: MenuSubmenu,
      SubmenuTrigger: MenuSubmenuTrigger,
      SearchablePopup: MenuSearchablePopup,
      PendingList: MenuPendingList,
    });
    initializeIsomorphicLayoutEffect();
    initializeClassNames();
    initializeCdsRoot();
    initializeElementAccess();
    initializeLayers();
    initializeOverlaySelector();
    initializeCloseOnActivityHide();
    initializeMergedRefs();
    initializePortalRoot();
    initializeSurfaces();
    initializeOverlayActions();
    initializeVisualKeyboard();
  };
}
