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
  input: React.ReactNode,
  options: PassiveOpenCell | null,
  context: React.RefObject<OverlayActions | null>,
  value: boolean = false,
): React.ReactElement {
  useUiLocale();
  let value2 = (
    <passiveOpenStateContext.Provider value={options}>
      <menuRootIdentityContext.Provider value={context}>
        <menuIsOpenContext.Provider value={null}>
          <menuTriggerContext.Provider value={null}>
            <submenuStateContext.Provider
              value={defaultSubmenuState}
            >
              <contextMenuContext.Provider value={value}>
                {value ? (input) : (<TooltipImplementationProvider>
                    {input}
                  </TooltipImplementationProvider>)}
              </contextMenuContext.Provider>
            </submenuStateContext.Provider>
          </menuTriggerContext.Provider>
        </menuIsOpenContext.Provider>
      </menuRootIdentityContext.Provider>
    </passiveOpenStateContext.Provider>
  );
  if (value) {
    return (
      <MenuOpenerProvider value={undefined}>
        {value2}
      </MenuOpenerProvider>
    );
  } else {
    return value2;
  }
}
function isNestedMenuEvent(
  input: EventTarget | null | undefined,
  options?: string,
): boolean {
  let value = asElement(input)?.closest("[data-nested]") ?? null;
  if (value === null) {
    return false;
  }
  if (options === undefined) {
    return true;
  }
  let value2 = asElement(value.closest("[data-sheet-tree]"));
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
function shouldRefuseNestedMenuClose(
  input: boolean,
  options: import("@base-ui/react/menu").Menu.Root.ChangeEventDetails,
  context?: string,
): boolean {
  if (input) {
    return false;
  }
  let { reason: value, event: value2 } = options;
  if (value === "outside-press") {
    return isNestedMenuEvent(value2?.target, context);
  }
  if (value === "focus-out" && isFocusOutEvent(value2)) {
    let value3 = asElement(value2.relatedTarget),
      value4 =
        value2.relatedTarget === null ||
        (value3 !== null &&
          (value3 === value3.ownerDocument.body || !value3.isConnected));
    return (
      isNestedMenuEvent(value2.relatedTarget, context) ||
      (value4 && isNestedMenuEvent(value2.target, context))
    );
  }
  return false;
}
function cancelNestedMenuClose(
  input: boolean,
  options: import("@base-ui/react/menu").Menu.Root.ChangeEventDetails,
  context?: string,
): boolean {
  if (!shouldRefuseNestedMenuClose(input, options, context)) {
    return false;
  }
  options.cancel();
  return true;
}
function extractReactText(input: React.ReactNode): string | undefined {
  if (typeof input === "string") {
    return input;
  }
  if (typeof input === "number") {
    return String(input);
  }
  if (input === null || input === undefined || typeof input === "boolean") {
    return "";
  }
  if (!Array.isArray(input)) {
    return;
  }
  let text = "";
  for (let value of input as readonly React.ReactNode[]) {
    let value2 = extractReactText(value);
    if (value2 === undefined) {
      return;
    }
    text += value2;
  }
  return text;
}
function normalizeLabelText(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}
function useMenuItemLabel(
  input: React.ReactNode,
  options?: string,
): MenuTextState {
  let ref = reacttM.useRef<HTMLElement | null>(null),
    ref2 = reacttM.useRef<HTMLElement | null>(null),
    [value, value2] = reacttM.useState<string | undefined>(),
    value3 =
      options === undefined
        ? normalizeLabelText(extractReactText(input) ?? "") || undefined
        : undefined,
    value4 = options === undefined && value3 === undefined;
  useIsomorphicLayoutEffect(() => {
    if (!value4) {
      return;
    }
    let value5 = normalizeLabelText(ref.current?.textContent ?? ""),
      value6 = (ref2.current?.textContent ?? "").startsWith(value5),
      value7 =
        value5 === "" || (value6 && value !== value5) ? undefined : value5;
    if (value7 !== value) {
      value2(value7);
    }
  });
  return {
    label: options ?? value3 ?? (value4 ? value : undefined),
    labelSpanRef: ref,
    rowRef: ref2,
  };
}
function getShortcutNumeralClasses(input: string | undefined): string {
  if (numericShortcutPattern.test(input as string)) {
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
  input: MenuPopupProps,
  options: React.ForwardedRef<HTMLDivElement>,
  context: boolean,
  value: boolean,
): React.ReactElement {
  let {
      side: value2,
      align: value16 = "start",
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
      stableWhileOpen: value17 = false,
      "data-cds": value18 = "Menu",
      initialFocus: value14,
      ...value15
    } = input,
    value19 = usePortalContainer(),
    value20 = reactForUiMenu.useContext<MenuRootState | null>(
      menuTriggerContext,
    ),
    value21 =
      reactForUiMenu.useContext<boolean>(contextMenuContext) &&
      value20 === null,
    value22 = reactForUiMenu.useContext<{
      collisionPadding?: CollisionPadding;
    } | null>(collisionPaddingContext),
    value23 = value4 ?? value22?.collisionPadding,
    memo = reactForUiMenu.useMemo(
      () =>
        value6 !== undefined || !value20
          ? value6
          : createMenuVirtualAnchor(value20),
      [value6, value20],
    ),
    value24 =
      value3 ??
      (value21 ? undefined : value20 && value6 === undefined ? 2 : 6),
    value25 = useStablePopupPlacement({
      enabled: value17 && !value21,
      side: value2,
      align: value16,
    }),
    value26 = useMenuOwnerRef(
      value20?.triggerRef,
      value15.finalFocus,
    ),
    value27 = value21
      ? value15.finalFocus === undefined || value15.finalFocus === null
      : value6 !== undefined &&
        value6 !== null &&
        value20 === null &&
        value15.finalFocus === undefined,
    value28 = usePassiveOpenContext(value20 === null);
  value28.root?.declareFocusProps(value14, value15.finalFocus);
  if (context && value20 !== null && value14 !== undefined) {
    warnNestedMenuInitialFocus();
  }
  let value29 = useRefocusAfterPendingSheet(value),
    value30 = useStableMergedRef(
      (input2: HTMLElement | null) => {
        value25.popupRef(input2);
        value26(input2);
        value29(input2);
        value28.root?.registerPopup(input2);
      },
      options,
    );
  if (context && value20 !== null && value13 !== undefined) {
    warnNestedMenuLayerOffset();
  }
  let value31 = useOverlayLayer(
    value21 ? "contextmenu" : "menu",
    value20 === null ? value13 : undefined,
  );
  return (
    <baseMenu.Portal container={(value7 ?? value19) as import("../contracts/overlays").BaseUIPortalContainer}>
      <PortalRoot
        {...value31.portalProps}
        style={
          value
            ? {
                ...value31.portalProps.style,
                ...concealedPopupStyle,
              }
            : value31.portalProps.style
        }
        surface={elevationSurfaceNames.popover}
        companionModalCatcher={true}
        closeOnActivityHide={true}
      >
        <CollisionPaddingProvider
          override={value23}
          container={value7 ?? value19}
          provideInherit={true}
        >
          {(input2: CollisionPadding | undefined) => (
            <layerBaseContext.Provider value={value31.base}>
              <baseMenu.Positioner
                ref={value25.positionerRef}
                className={value25.held?.positionerClassName}
                style={
                  value25.held !== null
                    ? {
                        ...value31.style,
                        ...value25.held.positionerStyle,
                      }
                    : value31.style
                }
                side={value25.side}
                align={value25.align}
                sideOffset={value24}
                collisionPadding={input2}
                collisionAvoidance={value5}
                anchor={memo}
              >
                <PassiveOpenGate
                  cell={value28.cell}
                  nested={value20 !== null}
                >
                  {(input3: PassivePopupTransform) => (
                    <MenuPopupElement
                      anchoredWithoutFinalFocus={value27}
                      cursorAnchored={value21}
                      data-cds={value18}
                      ref={value30}
                      {...input3(value15)}
                      className={cn(
                        contextMenuPopupClasses,
                        value25.held?.popupClassName,
                        value8,
                      )}
                    >
                      <MenuScrollContent
                        header={value10}
                        footer={value11}
                        maxVisibleItems={value12}
                      >
                        {value9}
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
  let [value, value2] = reactForUiMenu.useState(
      props.open ?? props.defaultOpen ?? false,
    ),
    ref = reactForUiMenu.useRef(value),
    value3 = useOptionalEventCallback(props.onOpenChange),
    { sheet: value4 } = useSheetState(),
    value5 = reactForUiMenu.useContext<SheetFrameContext | null>(
      sheetFrameContext,
    ),
    value6 = value5?.treeId,
    ref2 = reactForUiMenu.useRef<React.ReactNode>(null),
    callback = reactForUiMenu.useCallback((input: React.ReactNode): void => {
      ref2.current = input;
    }, []),
    [value7, value8] = reactForUiMenu.useState<React.ReactNode>(null),
    callback2 = reactForUiMenu.useCallback(
      (
        input: boolean,
        options: import("@base-ui/react/menu").Menu.Root.ChangeEventDetails,
      ): void => {
        if (value4 && cancelNestedMenuClose(input, options, value6)) {
          return;
        }
        if (
          value4 &&
          !input &&
          value5?.refusesAmbientClose(options) === true
        ) {
          options.cancel();
          return;
        }
        value3?.(input, options);
        if (!options.isCanceled) {
          ref.current = input;
          value2(input);
          if (input) {
            value8(ref2.current);
          }
        }
      },
      [value3, value4, value5, value6],
    ),
    ref3 = reactForUiMenu.useRef<HTMLElement | null>(null),
    callback3 = reactForUiMenu.useCallback(
      (input: HTMLElement | null): void => {
        ref3.current = input;
      },
      [],
    ),
    ref4 = reactForUiMenu.useRef<PublicOverlayActions | null>(null);
  useForwardedOverlayActions(ref4, actionsRef);
  let callback4 = reactForUiMenu.useCallback(() => {
      ref4.current?.close();
    }, []),
    value9 =
      reactForUiMenu.useContext<React.RefObject<OverlayActions | null> | null>(
        menuIsOpenContext,
      ),
    value10 =
      reactForUiMenu.useContext<React.RefObject<OverlayActions | null> | null>(
        menuRootIdentityContext,
      ),
    value11 = value9 ?? value10,
    memo = reactForUiMenu.useMemo(
      () => ({
        triggerRef: ref3,
        setTriggerNode: callback3,
        openRef: ref,
        close: callback4,
        stashLabel: callback,
      }),
      [callback3, callback4, callback],
    ),
    value12 = props.open ?? value;
  useIsomorphicLayoutEffect(() => {
    ref.current = value12;
    if (value12) {
      let current = ref2.current;
      value8((input: React.ReactNode) =>
        input === current ? input : current,
      );
    }
  }, [value12]);
  let memo2 = reactForUiMenu.useMemo(
    () => ({
      label: value7,
      open: value12,
    }),
    [value7, value12],
  );
  return (
    <menuTriggerContext.Provider value={memo}>
      <submenuStateContext.Provider value={memo2}>
        <menuIsOpenContext.Provider value={value11}>
          <menuRootIdentityContext.Provider value={ref4}>
            <baseMenu.SubmenuRoot
              {...props}
              actionsRef={ref4}
              onOpenChange={callback2}
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
    value2 =
      reactForUiMenu.useContext<MenuRootState | null>(
        menuTriggerContext,
      ) !== null,
    { label: value3 } = reactForUiMenu.useContext<MenuItemState>(
      submenuStateContext,
    ),
    value4 =
      value &&
      value2 &&
      typeof children === "string" &&
      typeof value3 === "string" &&
      children.trim() === value3.trim();
  return (
    <div
      role={"presentation"}
      className={cn(
        menuGroupLabelClasses,
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
    <baseMenu.GroupLabel
      className={cn(menuGroupLabelClasses, className)}
    >
      {children}
    </baseMenu.GroupLabel>
  );
}
function isMenuItemList(input: MenuItemsContent): input is MenuItems {
  return Array.isArray(input);
}
function renderMenuItems(input: MenuItemsContent): React.ReactNode {
  if (!isMenuItemList(input)) {
    return input;
  }
  return input.map((event: MenuItems[number], options: number) => {
    if (event === "separator") {
      return (() => {
        const _Element = MenuSeparator;
        const _elementProps = {};
        const _elementKey = options;
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
        const _Element2 = reactForUiMenu.Fragment;
        const _elementProps2 = {
          children: [
            event.separatorBefore && <MenuSeparator />,
            <MenuSubmenu disabled={event.disabled}>
              {[<MenuSubmenuTrigger icon={event.icon} hint={event.hint}>
                  {event.label}
                </MenuSubmenuTrigger>, <MenuPopup>{renderMenuItems(event.items)}</MenuPopup>]}
            </MenuSubmenu>,
          ],
        };
        const _elementKey2 = options;
        return <_Element2 key={_elementKey2} {..._elementProps2} />;
      })();
    }
    return (() => {
      const _Element3 = reactForUiMenu.Fragment;
      const _elementProps3 = {
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
      const _elementKey3 = options;
      return <_Element3 key={_elementKey3} {..._elementProps3} />;
    })();
  });
}
function getMenuCaretSize(
  input: Density,
  options?: ControlSize,
): "sm" | "xs" {
  if (getDensitySizeIndex(input, options) >= 4) {
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
    value2 = useButtonGroup();
  return (
    <Icon
      name={"CaretDown"}
      size={getMenuCaretSize(value, size ?? value2?.size)}
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
function SimpleMenu(input: MenuProps): React.ReactElement {
  useUiLocale();
  let value = useSheetCapablePresentation(),
    value2 = reactForUiMenu.useContext<boolean>(menuBarContext),
    value3: React.RefObject<OverlayActions | null> = useStableObjectRef(),
    onOpenChange = input.onOpenChange,
    { onOpenChange: value4, triggerRef: value5 } = useTrackedMenuTrigger(
      (
        input2: boolean,
        options: import("@base-ui/react/menu").Menu.Root.ChangeEventDetails,
      ) => {
        onOpenChange?.(input2, options);
        recordKeyboardContextMenuOpen(value3, input2, options);
      },
      value2,
    ),
    value6 = usePortalContainer();
  if (value) {
    return <MenuRootProviders {...input} />;
  }
  return useDropdownMenu(input, value6, {
    triggerRef: value5,
    onOpenChange: value4,
    actionsRef: value3,
    contextMenuOnOpenChange: value4,
    inMenuBar: value2,
  });
}
function MenuRootProviders(input: MenuProps): React.ReactElement {
  useUiLocale();
  let {
      open: value,
      sheetTitle: value2,
      backLabel: value3,
      closeLabel: value4,
    } = input,
    memo = reactForUiMenu.useMemo(
      () => ({
        sheetTitle: value2,
        backLabel: value3,
        closeLabel: value4,
      }),
      [value2, value3, value4],
    ),
    value5 = usePortalContainer(),
    value6 = reactForUiMenu.useContext<boolean>(menuBarContext),
    { onOpenChange: value7, triggerRef: value8 } = useTrackedMenuTrigger(input.onOpenChange, value6),
    value9 = useControllableOpen({
      open: value,
      onOpenChange: value7,
    }),
    open = value9.open,
    value10 = useAdaptiveSheet({
      open: open,
      onOpenChange: value9.onOpenChange,
      closable: !(value !== undefined && input.onOpenChange === undefined),
      refuseClose: refuseInnerMenuClose,
    }),
    value11 = useDropdownMenu(input, value5, {
      triggerRef: value8,
      onOpenChange: value10.onOpenChange,
      onOpenChangeComplete: value10.onOpenChangeComplete,
      actionsRef: value10.actionsRef,
      sheetCapable: true,
      inMenuBar: value6,
    });
  return (
    <SheetContextProvider value={value10}>
      <menuSheetLabelsContext.Provider value={memo}>
        {value11}
      </menuSheetLabelsContext.Provider>
    </SheetContextProvider>
  );
}
function useDropdownMenu(
  input: MenuProps,
  options: Element | ShadowRoot | undefined,
  context: ContextMenuState,
): React.ReactElement {
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
  if (input.trigger === "context-menu") {
    if (value8) {
      return (
        <div data-disabled={""} className={value9}>
          {input.children}
        </div>
      );
    }
    if (context.sheetCapable) {
      return (
        <CloseOnActivityHideProvider actionsRef={context.actionsRef}>
          <baseContextMenu.Root
            open={value7}
            onOpenChange={context.onOpenChange as import("../contracts/overlays").ContextMenuChange}
            onOpenChangeComplete={context.onOpenChangeComplete}
            actionsRef={context.actionsRef}
          >
            {MenuContextProviders(
              <jsxForUiMenu.Fragment>
                {[<baseContextMenu.Trigger className={value9}>
                    {input.children}
                  </baseContextMenu.Trigger>, <MenuPopup
                    side={value2}
                    align={value3}
                    sideOffset={value4}
                    collisionPadding={value5}
                    finalFocus={value6}
                    data-cds={value11 ?? "Menu"}
                  >
                    {renderMenuItems(value)}
                  </MenuPopup>]}
              </jsxForUiMenu.Fragment>,
              null,
              context.actionsRef,
              true,
            )}
          </baseContextMenu.Root>
        </CloseOnActivityHideProvider>
      );
    }
    return (
      <CloseOnActivityHideProvider actionsRef={context.actionsRef}>
        <baseContextMenu.Root
          open={value7}
          onOpenChange={context.contextMenuOnOpenChange as import("../contracts/overlays").ContextMenuChange}
          actionsRef={context.actionsRef}
        >
          {[<baseContextMenu.Trigger className={value9}>
              {input.children}
            </baseContextMenu.Trigger>, <baseContextMenu.Portal container={(options) as import("../contracts/overlays").BaseUIPortalContainer}>
              <menuRootIdentityContext.Provider
                value={context.actionsRef}
              >
                <MenuPopupContent
                  side={value2}
                  align={value3}
                  sideOffset={value4}
                  collisionPadding={value5}
                  finalFocus={value6}
                  dataCds={value11}
                  items={value}
                />
              </menuRootIdentityContext.Provider>
            </baseContextMenu.Portal>]}
        </baseContextMenu.Root>
      </CloseOnActivityHideProvider>
    );
  }
  let value12: React.ReactNode;
  if (input.renderTrigger !== undefined) {
    value12 = (
      <baseMenu.Trigger
        disabled={value8}
        className={value9}
        style={value10}
        render={input.renderTrigger}
      />
    );
  } else if (input.iconOnly) {
    let value13 =
        input.tooltip === false
          ? undefined
          : typeof input.tooltip === "string"
            ? input.tooltip
            : input["aria-label"],
      value14 = (
        <baseMenu.Trigger
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
  } else {
    value12 = (
      <baseMenu.Trigger
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
            {[input.label, <MenuCaret size={input.size} />]}
          </Button>
        }
      />
    );
  }
  return (
    <MenuOpenerProvider value={context.triggerRef}>
      <CloseOnActivityHideProvider actionsRef={context.actionsRef}>
        <baseMenu.Root<void>
          open={value7}
          onOpenChange={context.onOpenChange as import("../contracts/overlays").ContextMenuChange}
          onOpenChangeComplete={context.onOpenChangeComplete}
          actionsRef={context.actionsRef}
          modal={context.inMenuBar ? undefined : true}
        >
          {MenuContextProviders(
            <jsxForUiMenu.Fragment>
              {[value12, <MenuPopup
                  side={value2}
                  align={value3}
                  sideOffset={value4}
                  collisionPadding={value5}
                  finalFocus={value6}
                  data-cds={value11}
                >
                  {renderMenuItems(value)}
                </MenuPopup>]}
            </jsxForUiMenu.Fragment>,
            null,
            context.actionsRef,
          )}
        </baseMenu.Root>
      </CloseOnActivityHideProvider>
    </MenuOpenerProvider>
  );
}
function refuseInnerMenuClose(
  input: import("@base-ui/react/menu").Menu.Root.ChangeEventDetails,
  options?: string,
): boolean {
  return shouldRefuseNestedMenuClose(false, input, options);
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
    value6 = useSheetCapablePresentation(),
    value7 = reactForUiMenu.useContext<boolean>(menuBarContext),
    { onOpenChange: value8, triggerRef: value9 } = useTrackedMenuTrigger(value5.onOpenChange, value7),
    value10 = usePassiveOpenState(value8, value5.open, !value7),
    value11: React.RefObject<OverlayActions | null> = useStableObjectRef();
  useForwardedOverlayActions(value11, value5.actionsRef);
  if (value6) {
    return (
      <CloseOnActivityHideProvider actionsRef={value11}>
        <ControlledMenuRoot {...input} actionsRef={value11} />
      </CloseOnActivityHideProvider>
    );
  }
  return (
    <MenuOpenerProvider value={value9}>
      <CloseOnActivityHideProvider actionsRef={value11}>
        <baseMenu.Root<void>
          {...value5}
          modal={value7 ? undefined : value5.modal}
          actionsRef={value11}
          onOpenChange={value10.onOpenChange}
        >
          {typeof value === "function" ? ((input2: {payload:void}) =>
                MenuContextProviders(value(input2), value10.cell, value11)) : (MenuContextProviders(value, value10.cell, value11))}
        </baseMenu.Root>
      </CloseOnActivityHideProvider>
    </MenuOpenerProvider>
  );
}
function ControlledMenuRoot(input: MenuRootProps): React.ReactElement {
  useUiLocale();
  let {
      children: value,
      sheetTitle: value2,
      backLabel: value3,
      closeLabel: value4,
      ...value5
    } = input,
    memo = reactForUiMenu.useMemo(
      () => ({
        sheetTitle: value2,
        backLabel: value3,
        closeLabel: value4,
      }),
      [value2, value3, value4],
    ),
    value6 = reactForUiMenu.useContext<boolean>(menuBarContext),
    { onOpenChange: value7, triggerRef: value8 } = useTrackedMenuTrigger(input.onOpenChange, value6),
    value9 = usePassiveOpenState(value7, input.open, !value6),
    value10 = useControllableOpen({
      ...input,
      onOpenChange: value9.onOpenChange,
    }),
    value11 = useValueCapturedOnOpen(
      value10.open,
      () => value9.cell.getLevel() === "declared",
      false,
    ),
    value12 = useAdaptiveSheet({
      open: value10.open,
      actionsRef: input.actionsRef,
      onOpenChange: value10.onOpenChange,
      onOpenChangeComplete: input.onOpenChangeComplete,
      structurallyAnchored: value11,
      closable: !(
        input.open !== undefined && input.onOpenChange === undefined
      ),
      refuseClose: refuseInnerMenuClose,
    });
  return (
    <MenuOpenerProvider value={value8}>
      <SheetContextProvider value={value12}>
        <menuSheetLabelsContext.Provider value={memo}>
          <baseMenu.Root<void>
            {...value5}
            modal={value6 ? undefined : (value12.modal ?? value5.modal)}
            actionsRef={value12.actionsRef}
            onOpenChange={value12.onOpenChange}
            onOpenChangeComplete={value12.onOpenChangeComplete}
          >
            {typeof value === "function" ? ((input2: {payload:void}) =>
                  MenuContextProviders(
                    value(input2),
                    value9.cell,
                    value12.actionsRef,
                  )) : (MenuContextProviders(value, value9.cell, value12.actionsRef))}
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
function isMenuSearchEditingKey(input: SearchKeyEvent): boolean {
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
    let value2 = value?.current;
    if (!value2) {
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
    value2.addEventListener("keydown", callback, true);
    return () => value2.removeEventListener("keydown", callback, true);
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
    let value2 = value?.triggerRef.current;
    if (!value || !value2) {
      return;
    }
    let { openRef: value3 } = value,
      callback = (input: FocusEvent): void => {
        let current = inputRef.current,
          value4 = asElement(input.relatedTarget);
        if (
          current &&
          value4 &&
          value3.current &&
          current.closest('[role="menu"]')?.contains(value4)
        ) {
          current.focus({
            preventScroll: true,
          });
        }
      };
    value2.addEventListener("focus", callback);
    return () => value2.removeEventListener("focus", callback);
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
      index2 = 0,
      callback2 = () => {
        callback();
        index += 1;
        if (index < 2) {
          index2 = requestAnimationFrame(callback2);
        }
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
  let [value, value2] = reactForUiMenu.useState(""),
    value3 = query ?? value,
    value4: (input: string) => void = useEventCallback(
      (input: string) => {
        value2(input);
        onQueryChange?.(input);
      },
    ),
    value5 = useEventCallback(() => {
      if (value3 !== "") {
        value4("");
      }
    }),
    ref = reactForUiMenu.useRef(false);
  reactForUiMenu.useEffect(() => {
    return;
  }, [query, onQueryChange]);
  let value6 = useIsSheet(),
    value7 = useMediaQuery__U(
      useRootWindow(),
      COARSE_POINTER_QUERY_rG,
    ),
    value8 = !value6 && !value7,
    value9 =
      reactForUiMenu.useContext<React.RefObject<OverlayActions | null> | null>(
        menuIsOpenContext,
      ),
    value10 =
      reactForUiMenu.useContext<React.RefObject<OverlayActions | null> | null>(
        menuRootIdentityContext,
      ),
    value11 = value9 ?? value10,
    ref2 = reactForUiMenu.useRef<HTMLDivElement | null>(null),
    ref3 = reactForUiMenu.useRef<HTMLInputElement | null>(null),
    ref4 = reactForUiMenu.useRef<(() => void) | null>(null);
  reactForUiMenu.useEffect(() => () => ref4.current?.(), []);
  let callback = reactForUiMenu.useCallback((input: string) => {
      let current = ref3.current;
      if (!current) {
        return;
      }
      let { value: value12 } = current,
        value13 = current.selectionStart ?? value12.length,
        value14 = current.selectionEnd ?? value12.length,
        value15 = input === "Backspace" || input === "Delete",
        value16 = value15 ? "" : input;
      if (value15 && value13 === value14) {
        if (input === "Backspace") {
          let value19 = (value12.codePointAt(value13 - 2) ?? 0) > 65535;
          value13 = Math.max(0, value13 - (value19 ? 2 : 1));
        } else {
          let value19 = (value12.codePointAt(value14) ?? 0) > 65535;
          value14 = Math.min(value12.length, value14 + (value19 ? 2 : 1));
        }
      }
      let value17 =
          value12.slice(0, value13) + value16 + value12.slice(value14),
        value18 = current.ownerDocument.defaultView ?? window;
      Object.getOwnPropertyDescriptor(
        value18.HTMLInputElement.prototype,
        "value",
      )?.set?.call(current, value17);
      current.setSelectionRange(
        value13 + value16.length,
        value13 + value16.length,
      );
      current.dispatchEvent(
        new Event("input", {
          bubbles: true,
        }),
      );
    }, []),
    callback2 = () => {
      let current = ref2.current,
        value12 =
          current?.querySelector<HTMLElement>('[tabindex="0"]') ??
          current?.querySelector<HTMLElement>(
            'input, button, [role="radio"]',
          );
      if (!value12) {
        return false;
      }
      value12.focus();
      return true;
    };
  return (
    <MenuPopup
      {...props}
      stableWhileOpen={stableWhileOpen}
      onKeyDown={(event: MenuPopupKeyboardEvent) => {
        let current = ref3.current;
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
          !value8 ||
          event.target !== currentTarget ||
          ownerDocument.activeElement !== currentTarget
        ) {
          return;
        }
        let value12 = asElement(event.relatedTarget);
        if (
          !(
            value12?.hasAttribute("data-popup-open") &&
            currentTarget.contains(value12)
          )
        ) {
          ref3.current?.focus({
            preventScroll: true,
          });
          return;
        }
        ref4.current?.();
        let callback3 = (event2: MouseEvent) => {
          let value13 = asElement(event2.target),
            value14 = value13?.closest('[role="menu"]'),
            bounds = currentTarget.getBoundingClientRect(),
            value15 =
              event2.clientX >= bounds.left &&
              event2.clientX < bounds.right &&
              event2.clientY >= bounds.top &&
              event2.clientY < bounds.bottom;
          if (!value14 && value15) {
            return;
          }
          ref4.current?.();
          if (
            !(
              value14 &&
              (value14 !== currentTarget ||
                value13?.closest('[role^="menuitem"]'))
            ) &&
            ownerDocument.activeElement === currentTarget
          ) {
            ref3.current?.focus({
              preventScroll: true,
            });
          }
        };
        ownerDocument.addEventListener("mousemove", callback3);
        ref4.current = () => {
          ownerDocument.removeEventListener("mousemove", callback3);
          ref4.current = null;
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
                ref={ref2}
                role={"presentation"}
                className={"px-sm pt-sm"}
                onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === "Escape") {
                    return;
                  }
                  event.stopPropagation();
                  if (event.key === "Tab") {
                    event.preventDefault();
                    ref3.current?.focus();
                  }
                }}
              >
                {beforeSearch}
              </div>
            ), <TextInput
              ref={ref3}
              value={value3}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                value4(event.target.value)
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
                  let value12 = value3.trim();
                  if (
                    onSubmitQuery !== undefined &&
                    value12 !== "" &&
                    !event.repeat &&
                    !event.shiftKey &&
                    !event.altKey
                  ) {
                    let callback3 = () => {
                      onSubmitQuery(value12);
                      value11?.current?.close?.();
                    };
                    if (
                      shouldSuppressCompositionEnter(
                        event.nativeEvent,
                      )
                    ) {
                      suppressFollowupCompositionLineBreak(
                        event.nativeEvent,
                        event.currentTarget,
                        callback3,
                      );
                    } else {
                      event.preventDefault();
                      callback3();
                    }
                  }
                  event.stopPropagation();
                  return;
                }
                if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                  let value12 = event.currentTarget
                      .closest('[role="menu"]')
                      ?.querySelectorAll<HTMLElement>(
                        '[role^="menuitem"]:not([aria-disabled="true"])',
                      ),
                    value13 =
                      event.key === "ArrowDown"
                        ? value12?.[0]
                        : value12?.[value12.length - 1];
                  if (value13 !== undefined) {
                    event.preventDefault();
                    event.stopPropagation();
                    value13.focus();
                  }
                  return;
                }
                if (event.key === "Tab" && !event.shiftKey && callback2()) {
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
              autoFocus={value8}
              tabIndex={value8 ? undefined : -1}
              className={
                "!border-transparent !bg-transparent !shadow-none compact:!pl-2 comfortable:!pl-2.5"
              }
            />, <baseMenu.Separator
              className={"-mx-1 my-1 h-px bg-border"}
            />]}
        </jsxForUiMenu.Fragment>
      }
    >
      {[resetQueryOnClose && <ResetQueryOnUnmount reset={value5} />, value8 && <MenuSearchTriggerFocusBridge inputRef={ref3} />, <MenuSearchTriggerKeyboardBridge
          inputRef={ref3}
          applyKey={callback}
        />, children(value3.trim().toLowerCase(), value3.trim())]}
    </MenuPopup>
  );
}
function useFocusMenuAfterPending(
  input: React.RefObject<HTMLElement | null>,
  options: boolean,
): void {
  let ref = reactForUiMenu.useRef(options);
  useIsomorphicLayoutEffect(() => {
    let value = input.current?.closest<HTMLElement>('[role="menu"]');
    if (!options || ref.current || !value?.hasAttribute("data-open")) {
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
  }, [input, options]);
  reactForUiMenu.useEffect(() => {
    let value = ref.current && !options;
    ref.current = options;
    let current = input.current;
    if (!value || !current) {
      return;
    }
    let value2 = requestAnimationFrame(() => {
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
    return () => cancelAnimationFrame(value2);
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
  let ref = reactForUiMenu.useRef<HTMLDivElement | null>(null),
    ref2 = reactForUiMenu.useRef(emptyMenuSize);
  reactForUiMenu.useEffect(() => {
    let current = ref.current;
    if (!current || typeof ResizeObserver === "undefined") {
      return;
    }
    let observer = new ResizeObserver(() => {
      ref2.current = {
        width: current.offsetWidth,
        height: current.offsetHeight,
      };
    });
    observer.observe(current);
    return () => observer.disconnect();
  }, []);
  let value = pending || loading,
    [value2, value3] = reactForUiMenu.useState(emptyMenuSize);
  useIsomorphicLayoutEffect(() => {
    let current = ref.current;
    if (!value || !current) {
      value3(emptyMenuSize);
      return;
    }
    value3(
      loading && ref2.current.height > 0
        ? ref2.current
        : {
            width: current.offsetWidth,
            height: current.offsetHeight,
          },
    );
  }, [value, loading]);
  let value4 = value && value2.height > 0;
  useFocusMenuAfterPending(ref, loading);
  return (
    <div
      ref={ref}
      aria-busy={value || undefined}
      style={
        value4
          ? {
              minWidth: value2.width,
              height: value2.height,
            }
          : undefined
      }
      className={value4 ? "overflow-hidden" : undefined}
    >
      {loading ? (<SkeletonGroup>
          <SkeletonPrimitive.Rows
            icon={icon}
            rows={
              value4
                ? Math.ceil(value2.height / MENU_PLACEHOLDER_MINIMUM_WIDTH)
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
        options: React.ForwardedRef<HTMLDivElement>,
      ): React.ReactElement => {
        let state = {
            align: align,
            stableWhileOpen: stableWhileOpen,
            "data-cds": dataCds,
            ...props,
          },
          value = useHasSheetFrame(),
          value2 = useMenuPopupElement(state, options, !value, false);
        if (value) {
          return <MenuSheetCapablePopup {...state} ref={options} />;
        }
        return value2;
      },
    );
    MenuPopup.displayName = "Menu.Popup";
    MenuSheetCapablePopup = reactForUiMenu.forwardRef(
      (
        input: MenuPopupProps,
        options: React.ForwardedRef<HTMLDivElement>,
      ): React.ReactElement => {
        let value = useSheetImplementation(),
          { pending: value2 } = useSheetState(),
          value3 = reactForUiMenu.useContext<MenuRootState | null>(
            menuTriggerContext,
          ),
          value4: import("../contracts/overlays").OverlayKind =
            reactForUiMenu.useContext<boolean>(contextMenuContext) &&
            value3 === null
              ? "contextmenu"
              : "menu",
          value5 = useMenuPopupElement(
            input,
            options,
            value === null,
            value === null && value2,
          );
        if (value !== null) {
          return <value.MenuSheetPopup {...input} ref={options} />;
        }
        return (
          <jsxForUiMenu.Fragment>
            {[value5, value2 && value3 === null ? (
                <PendingSheetBackdrop kind={value4} />
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
          value5 = useAppleKeyboard(),
          value6 = reactForUiMenu.useId(),
          {
            label: value7,
            labelSpanRef: value8,
            rowRef: value9,
          } = useMenuItemLabel(children, props.label),
          value10 = useMergedRefs(options, value9),
          value11 =
            props.disabled === true &&
            hasDisabledReason(disabledReason),
          state = {
            "aria-keyshortcuts": shortcut
              ? shortcutToAriaKeyShortcuts(shortcut, value5)
              : undefined,
            "data-cds-icon-row":
              icon !== undefined &&
              !(value2 !== undefined && value4 === "leading")
                ? ""
                : undefined,
            [FOCUSES_NOTHING_ATTRIBUTE]: focusesNothing
              ? ""
              : undefined,
            ...props,
            label: value7,
            "aria-describedby":
              [value11 ? value6 : undefined, props["aria-describedby"]]
                .filter(Boolean)
                .join(" ") || undefined,
          },
          value12 = useMenuPassiveFocusProps(),
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
                  {[input, <DisabledReasonAnnouncement
                      id={value6}
                      reason={value11 ? disabledReason : undefined}
                    />]}
                </div>
              </Tooltip>
            ),
          value13 = useCdsLink({
            href: href,
            routerOptions: routerOptions,
            target: target,
            rel: rel,
            download: download,
            ...pickLinkEventProps(props),
          }),
          value14 = cn(
            menuItemVariants({
              variant: variant,
            }),
            description ? `${menuItemDescriptionPaddingClass} ` : "",
            className,
          ),
          value15 = value2 !== undefined && (
            <span
              className={clsx(
                "flex size-icon shrink-0 items-center justify-center",
                value4 === "trailing" && !hint && !shortcut && "-mr-1",
                Boolean(value4 === "trailing" && shortcut && !hint) &&
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
            <jsxForUiMenu.Fragment>
              {[leading, value4 === "leading" && value15, icon !== undefined && <IconSlot icon={icon} />, description ? (
                  <span className={"flex min-w-0 flex-1 flex-col"}>
                    {[<span ref={value8} className={"truncate"}>
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
                  <span ref={value8} className={"min-w-0 flex-1 truncate"}>
                    {children}
                  </span>
                ), Boolean(
                  trailing ||
                    (value2 !== undefined && value4 === "trailing") ||
                    hint ||
                    shortcut,
                ) && (
                  <span
                    className={clsx(
                      "ml-md flex shrink-0 items-center gap-xs",
                      Boolean(
                        shortcut &&
                          !trailing &&
                          !(value2 !== undefined && value4 === "trailing") &&
                          !hint,
                      ) && "pointer-coarse:hidden",
                    )}
                  >
                    {[trailing, value4 === "trailing" && value15, hint && (
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
          let value17 = omitLinkEventProps(state);
          return callback(
            <baseMenu.Item
              ref={value10}
              {...value17}
              {...value12}
              closeOnClick={keepOpen ? false : undefined}
              className={value14}
              render={<a {...value13} />}
            >
              {value16}
            </baseMenu.Item>,
          );
        }
        if (value2 !== undefined) {
          if (value3 === "radio") {
            return callback(
              <baseMenu.Item
                ref={value10}
                {...state}
                {...value12}
                role={"menuitemradio"}
                aria-checked={value2}
                closeOnClick={keepOpen ? false : undefined}
                className={value14}
              >
                {value16}
              </baseMenu.Item>,
            );
          }
          return callback(
            <baseMenu.CheckboxItem
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
            </baseMenu.CheckboxItem>,
          );
        }
        return callback(
          <baseMenu.Item
            ref={value10}
            {...state}
            {...value12}
            closeOnClick={keepOpen ? false : undefined}
            className={value14}
          >
            {value16}
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
        options: React.ForwardedRef<HTMLDivElement>,
      ): React.ReactElement => {
        let value = reactForUiMenu.useContext<MenuRootState | null>(
            menuTriggerContext,
          ),
          value2 = useIsSheet(),
          value3 = useMenuPassiveFocusProps(),
          {
            label: value4,
            labelSpanRef: value5,
            rowRef: value6,
          } = useMenuItemLabel(children, props.label),
          value7 = useMergedRefs(
            value?.setTriggerNode,
            options,
            value6,
          ),
          value8 = value?.stashLabel;
        useIsomorphicLayoutEffect(() => {
          if (value2) {
            value8?.(children);
          }
        }, [value2, value8, children]);
        return (
          <baseMenu.SubmenuTrigger
            ref={value7}
            data-cds-icon-row={icon !== undefined ? "" : undefined}
            {...props}
            label={value4}
            {...value3}
            openOnHover={value2 ? false : openOnHover}
            className={cn(
              menuItemVariants({
                variant: "default",
              }),
              "justify-between data-[popup-open]:bg-fill-ghost-hover",
              className,
            )}
          >
            {[leading, icon !== undefined && <IconSlot icon={icon} />, <span ref={value5} className={"min-w-0 flex-1 truncate"}>
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
      options: React.ForwardedRef<HTMLButtonElement>,
    ): React.ReactElement {
      return (
        <baseMenu.Trigger
          id={id}
          disabled={props.disabled || props.busy}
          render={
            <Button
              ref={options}
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
      options: React.ForwardedRef<HTMLDivElement>,
    ): React.ReactElement {
      return (
        <menuBarContext.Provider value={true}>
          <R_baseMenubarRoot
            ref={options}
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
