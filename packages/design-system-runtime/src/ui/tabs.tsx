import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
import type * as React from "react";
import type {
  ForwardComponent,
  ControlSize,
  TabMenuItem,
  TabsOverflowState,
  TabsListMenuProps,
  TabsListProps,
  TabsTabProps,
  TabsRootProps,
  TabsPanelProps,
} from "../contracts/overlays";
/** Restored application module; prepare first, initialize in original order. */
import { baseTabs, loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { DisabledReasonAnnouncement, hasDisabledReason, Tooltip } from "./avatars";
import { useCompactableControl, withRepeatedClickSelectionPrevention } from "./disclosure";
import { createSafeMutationObserver, createSafeResizeObserver, getInertProps, getResizeObserverConstructor, initializeIsomorphicLayoutEffect, initializeSafeObservers, useIsomorphicLayoutEffect } from "./foundation";
import { cn, isHtmlElement, isSvgElement, useMergedRefs } from "./interactions";
import { Menu } from "./menu";
import { findBarListenerWindows, getInnerElementWidth, getTabOverflowWidth, isUnwrappedHorizontalFlex } from "./number-input";
import { getControlSizeAttributes } from "./overlays";

var reactuP: typeof React;
var tabsOverflowContext: React.Context<TabsOverflowState | null>;
var TABS_STASHED_ATTRIBUTE: string;
var TABS_MENU_TRIGGER_ID: string;
var TABS_MENU_LABEL_ID: string;
var reactForUiTabs: typeof React;
var jsxForUiTabs: typeof import("react/jsx-runtime");
var TAB_SELECTOR: string;
var TAB_TEXT_EXCLUDED_SELECTOR: string;
var reactTabs: typeof React;
var jsxrZ: typeof import("react/jsx-runtime");
var tabsListBaseClasses: string;
var tabsFirstTabIndicatorClasses: string;
var tabsLastTabIndicatorClasses: string;
var tabsFlushClasses: string;
var stashedTabsClasses: string;
var TABS_OVERFLOW_RECHECK_MS: number;
var TabsList: ForwardComponent<HTMLDivElement, TabsListProps>;
var tabBaseClasses: string;
var disabledTabPointerClasses: string;
var TabsTab: ForwardComponent<HTMLButtonElement, TabsTabProps>;
var TabsPanel: ForwardComponent<HTMLDivElement, TabsPanelProps>;
var TabsRoot: ForwardComponent<HTMLDivElement, TabsRootProps>;
var Tabs: {
  Root: typeof TabsRoot;
  List: typeof TabsList;
  Tab: typeof TabsTab;
  Panel: typeof TabsPanel;
};
function applyTabFlexCorrection(
  element: HTMLElement,
  styleAttribute: string | null,
  originalCssText: string,
): void {
  if (styleAttribute === null) {
    element.removeAttribute("style");
    return;
  }
  let cssText = element.style.cssText;
  if (!findBarListenerWindows.has(element.ownerDocument)) {
    element.setAttribute("style", styleAttribute);
    if (!(cssText !== originalCssText && element.style.cssText === cssText)) {
      return;
    }
    findBarListenerWindows.add(element.ownerDocument);
  }
  element.style.cssText = originalCssText;
}
function parsePixelCssValue(cssValue: string): number {
  if (/^\d*\.?\d+px$/.test(cssValue)) {
    return Number.parseFloat(cssValue);
  } else {
    return 0;
  }
}
function measureTabStripContents(tabStrip: HTMLElement): number {
  let { POSITIVE_INFINITY: value, NEGATIVE_INFINITY: rightmostEdge } = Number;
  for (let child of Array.from(tabStrip.children)) {
    if (
      !isHtmlElement(child) &&
      !isSvgElement(child)
    ) {
      continue;
    }
    let position = getComputedStyle(child).position;
    if (position === "absolute" || position === "fixed") {
      continue;
    }
    let bounds = child.getBoundingClientRect();
    if (bounds.width <= 0 && bounds.height <= 0) {
      continue;
    }
    value = Math.min(value, bounds.left);
    rightmostEdge = Math.max(rightmostEdge, bounds.right);
  }
  if (rightmostEdge < value) {
    return 0;
  }
  let tabStripStyle = getComputedStyle(tabStrip);
  return (
    rightmostEdge -
    value +
    (Number.parseFloat(tabStripStyle.paddingLeft) || 0) +
    (Number.parseFloat(tabStripStyle.paddingRight) || 0)
  );
}
function useTabsOverflow(): TabsOverflowState | null {
  return reactuP.useContext(tabsOverflowContext);
}
function extractVisibleElementText(element: Element, excludedSelector: string): string {
  let text = "",
    callback = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.nodeValue ?? "";
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (
          node !== element &&
          ((node as Element).matches(excludedSelector) ||
            getComputedStyle(node as Element).display === "none")
        ) {
          return;
        }
        text += " ";
        node.childNodes.forEach(callback);
        text += " ";
      }
    };
  callback(element);
  return text.replace(/\s+/g, " ").trim();
}
function getTabLabelText(element: Element): string {
  let value = extractVisibleElementText(element, TAB_TEXT_EXCLUDED_SELECTOR);
  if (value !== "") {
    return value;
  } else {
    return (element.getAttribute("aria-label") ?? "").trim();
  }
}
function getTabScreenReaderText(tab: Element): string {
  let text = "";
  tab.querySelectorAll(".sr-only").forEach((screenReaderLabel: Element) => {
    if (screenReaderLabel.closest("[data-cds-disabled-reason]") === null) {
      text += ` ${extractVisibleElementText(screenReaderLabel, '[aria-hidden="true"], [hidden]')}`;
    }
  });
  return text.trim();
}
function sortConnectedTabsByDocumentOrder(
  tabsByValue: ReadonlyMap<unknown, HTMLElement>,
): TabMenuItem[] {
  return [...tabsByValue.entries()]
    .filter(([, tab]: [unknown, HTMLElement]) => tab.isConnected)
    .sort(
      (
        [, leftTab]: [unknown, HTMLElement],
        [, rightTab]: [unknown, HTMLElement],
      ) =>
        leftTab.compareDocumentPosition(rightTab) &
        Node.DOCUMENT_POSITION_FOLLOWING
          ? -1
          : 1,
    )
    .map(([tabValue, tab]: [unknown, HTMLElement]) =>
      createTabMenuItem(tabValue, tab),
    );
}
function collectTabValues(
  tabList: HTMLElement | null,
  tabsByValue: ReadonlyMap<unknown, HTMLElement>,
): TabMenuItem[] {
  if (tabList === null) {
    return [];
  }
  let entries = new Map<HTMLElement, unknown>();
  tabsByValue.forEach((tab: HTMLElement, tabValue: unknown) =>
    entries.set(tab, tabValue),
  );
  let items: TabMenuItem[] = [];
  tabList
    .querySelectorAll<HTMLElement>(TAB_SELECTOR)
    .forEach((tab: HTMLElement) => {
      if (entries.has(tab)) {
        items.push(createTabMenuItem(entries.get(tab), tab));
      }
    });
  return items;
}
function createTabMenuItem(tabValue: unknown, element: Element): TabMenuItem {
  let value = element
    .querySelector("[data-cds-disabled-reason]")
    ?.textContent?.trim();
  return {
    value: tabValue,
    text: getTabLabelText(element),
    srText: getTabScreenReaderText(element),
    disabled:
      element.getAttribute("aria-disabled") === "true" ||
      element.hasAttribute("data-disabled"),
    reason: value === undefined || value === "" ? undefined : value,
  };
}
function areTabMenuItemsEqual(
  items: readonly TabMenuItem[],
  nextItems: readonly TabMenuItem[],
): boolean {
  return (
    items.length === nextItems.length &&
    items.every(
      (item: TabMenuItem, index: number) =>
        Object.is(item.value, nextItems[index].value) &&
        item.text === nextItems[index].text &&
        item.srText === nextItems[index].srText &&
        item.disabled === nextItems[index].disabled &&
        item.reason === nextItems[index].reason,
    )
  );
}
function TabsListMenu({
  size: size,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  listRef: listRef,
  triggerHadFocusRef: triggerHadFocusRef,
}: TabsListMenuProps): React.ReactElement {
  useUiLocale();
  let value = useTabsOverflow(),
    ref = reactForUiTabs.useRef<HTMLButtonElement | null>(null),
    menuLabelId = reactForUiTabs.useId(),
    selectedTabLabelId = reactForUiTabs.useId(),
    [menuItems, setMenuItems] = reactForUiTabs.useState(() =>
      sortConnectedTabsByDocumentOrder(value?.tabs() ?? new Map()),
    ),
    callback = reactForUiTabs.useCallback(() => {
      let nextItems = collectTabValues(
        listRef.current,
        value?.tabs() ?? new Map(),
      );
      setMenuItems((previousItems: TabMenuItem[]) =>
        areTabMenuItemsEqual(previousItems, nextItems) ? previousItems : nextItems,
      );
    }, [listRef, value]);
  useIsomorphicLayoutEffect(() => {
    callback();
    let current = listRef.current;
    if (current === null || typeof MutationObserver === "undefined") {
      return;
    }
    let tabObserver = createSafeMutationObserver(
      MutationObserver,
      callback,
    );
    tabObserver.observe(current, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["aria-disabled", "data-disabled", "aria-label"],
    });
    return () => tabObserver.disconnect();
  }, [callback, listRef]);
  reactForUiTabs.useEffect(callback, [callback]);
  useIsomorphicLayoutEffect(() => {
    let current = listRef.current,
      focusedTabElement = current?.ownerDocument.activeElement ?? null;
    if (current !== null && focusedTabElement !== null && current.contains(focusedTabElement)) {
      ref.current?.focus();
    }
    return () => {
      let trigger = ref.current,
        activeElement = trigger?.ownerDocument.activeElement ?? null,
        controlsId = trigger?.getAttribute("aria-controls") ?? null,
        menuPopup =
          controlsId === null
            ? null
            : trigger!.ownerDocument.getElementById(controlsId);
      triggerHadFocusRef.current =
        trigger !== null &&
        activeElement !== null &&
        (activeElement === trigger ||
          (menuPopup !== null && menuPopup.contains(activeElement)));
    };
  }, [listRef, triggerHadFocusRef]);
  let selectedItem = menuItems.find(
      (item: TabMenuItem) =>
        value !== null && Object.is(item.value, value.value),
    ),
    labelledBy = [
      ariaLabelledby ?? (ariaLabel !== undefined ? menuLabelId : undefined),
      selectedItem !== undefined ? selectedTabLabelId : undefined,
    ]
      .filter(Boolean)
      .join(" ");
  return (
    <Menu.Root sheetTitle={ariaLabel}>
      {[<Menu.TriggerButton
          ref={ref}
          variant={"secondary"}
          size={size}
          aria-labelledby={labelledBy === "" ? undefined : labelledBy}
          data-cds-part={TABS_MENU_TRIGGER_ID}
          className={"max-w-full min-w-0"}
        >
          {[ariaLabel !== undefined && ariaLabelledby === undefined ? (
              <span id={menuLabelId} className={"sr-only"}>
                {ariaLabel}
              </span>
            ) : null, selectedItem !== undefined ? (
              <span
                id={selectedTabLabelId}
                data-cds-part={TABS_MENU_LABEL_ID}
                className={"max-w-40 min-w-0 truncate"}
              >
                {selectedItem.text}
              </span>
            ) : ariaLabel !== undefined ? (
              <span
                aria-hidden={true}
                data-cds-part={TABS_MENU_LABEL_ID}
                className={"max-w-40 min-w-0 truncate"}
              >
                {ariaLabel}
              </span>
            ) : null]}
        </Menu.TriggerButton>, <Menu.Popup>
          <Menu.Group
            aria-label={ariaLabelledby === undefined ? (ariaLabel) : (undefined)}
            aria-labelledby={ariaLabelledby}
          >
            {menuItems.map((item: TabMenuItem, index: number) =>
              (() => {
                const _Element = Menu.Item;
                const _elementProps = {
                  checkedRole: "radio" as const,
                  checked: item === selectedItem,
                  disabled: item.disabled,
                  disabledReason: item.reason,
                  onClick: () => value?.activate(item.value),
                  children: [
                    item.text,
                    item.srText !== "" ? (
                      <span className={"sr-only"}>{[" ", item.srText]}</span>
                    ) : null,
                  ],
                };
                const _elementKey = `${String(item.value)}:${index}`;
                return <_Element key={_elementKey} {..._elementProps} />;
              })(),
            )}
          </Menu.Group>
        </Menu.Popup>]}
    </Menu.Root>
  );
}
function debugTabListOverflow(diagnosticKey: string, diagnosticMessage: string): void {}
function resetAncestorHorizontalScroll(
  startElement: HTMLElement | null,
  tabRoot: Element,
): boolean {
  for (
    let value = startElement;
    value !== null && value !== tabRoot;
    value = value.parentElement
  ) {
    let { overflowX: overflowX } = getComputedStyle(value);
    if (overflowX === "auto" || overflowX === "scroll") {
      return true;
    }
  }
  return false;
}
function canTabsOverflowInline(tabRoot: Element, tabList: Element): boolean {
  if (getComputedStyle(tabRoot).display === "contents") {
    return true;
  }
  for (let value of Array.from(tabRoot.children)) {
    if (
      value === tabList ||
      value.contains(tabList) ||
      !isHtmlElement(value) ||
      value.getAttribute("data-cds-part") === "tabs-menu-trigger"
    ) {
      continue;
    }
    let childStyle = getComputedStyle(value);
    if (
      childStyle.display !== "none" &&
      childStyle.position !== "absolute" &&
      childStyle.position !== "fixed"
    ) {
      return true;
    }
  }
  return false;
}
function useTabsOverflowMenu(
  tabListRef: React.RefObject<HTMLElement | null>,
  accessibleLabel: string | undefined,
  compact: boolean,
  exactFit: boolean,
): boolean {
  let [isCollapsed, setIsCollapsed] = reactTabs.useState(false),
    ref = reactTabs.useRef(new Map<number, number>()),
    lastUpdateAtRef = reactTabs.useRef(0),
    delayedWidthRef = reactTabs.useRef(NaN),
    previousCompactRef = reactTabs.useRef(compact),
    previousExactFitRef = reactTabs.useRef(exactFit);
  useIsomorphicLayoutEffect(() => {
    let current = tabListRef.current,
      tabRoot = current?.closest<HTMLElement>('[data-cds="Tabs"]') ?? null,
      container = tabRoot?.parentElement ?? null;
    if (current === null || tabRoot === null || container === null) {
      return;
    }
    let ResizeObserverClass = getResizeObserverConstructor(container);
    if (ResizeObserverClass === undefined) {
      return;
    }
    let fitSettingsChanged = previousCompactRef.current !== compact || previousExactFitRef.current !== exactFit;
    previousCompactRef.current = compact;
    previousExactFitRef.current = exactFit;
    let recheckTimeout: ReturnType<typeof setTimeout> | undefined,
      callback = (nextCollapsed: boolean, availableWidth: number, forceRecheck: boolean) => {
        let now = Date.now(),
          collapseAttempts = ref.current;
        if (now - lastUpdateAtRef.current > TABS_OVERFLOW_RECHECK_MS) {
          collapseAttempts.clear();
        }
        let roundedWidth = Math.round(availableWidth),
          expansionAttempts = collapseAttempts.get(roundedWidth) ?? 0;
        if (!nextCollapsed && !forceRecheck && expansionAttempts >= 2) {
          if (delayedWidthRef.current !== roundedWidth) {
            delayedWidthRef.current = roundedWidth;
            clearTimeout(recheckTimeout);
            recheckTimeout = setTimeout(() => measureOverflow(false), 550);
          }
          return;
        }
        if (roundedWidth !== delayedWidthRef.current) {
          delayedWidthRef.current = NaN;
        }
        if (!nextCollapsed) {
          collapseAttempts.set(roundedWidth, expansionAttempts + 1);
        }
        lastUpdateAtRef.current = now;
        setIsCollapsed(nextCollapsed);
      },
      canStayInline = () =>
        tabRoot.getAttribute("data-orientation") === "vertical" ||
        canTabsOverflowInline(tabRoot, current) ||
        resetAncestorHorizontalScroll(current, tabRoot) ||
        !isUnwrappedHorizontalFlex(container),
      measureOverflow = (forceRecheck: boolean) => {
        if (canStayInline()) {
          if (isCollapsed) {
            setIsCollapsed(false);
          }
          return;
        }
        let availableWidth = getInnerElementWidth(container);
        if (availableWidth <= 0) {
          return;
        }
        let tabStripWidth = measureTabStripContents(current);
        if (tabStripWidth <= 0) {
          return;
        }
        let tabStripStyle = getComputedStyle(current),
          tabRootStyle = getComputedStyle(tabRoot),
          tabOuterWidth =
            tabStripWidth +
            (Number.parseFloat(tabStripStyle.marginLeft) || 0) +
            (Number.parseFloat(tabStripStyle.marginRight) || 0) +
            (Number.parseFloat(tabRootStyle.paddingLeft) || 0) +
            (Number.parseFloat(tabRootStyle.paddingRight) || 0) +
            (Number.parseFloat(tabRootStyle.borderLeftWidth) || 0) +
            (Number.parseFloat(tabRootStyle.borderRightWidth) || 0),
          requiredWidth = getTabOverflowWidth(container, tabRoot, tabOuterWidth);
        if (isCollapsed) {
          if (!compact && availableWidth >= requiredWidth + (exactFit ? 0 : 64)) {
            callback(false, availableWidth, forceRecheck);
          }
          return;
        }
        if (availableWidth + 0.5 < requiredWidth) {
          if (accessibleLabel === undefined) {
            debugTabListOverflow(
              "label",
              "cds: a Tabs.List collapsed into a dropdown but has no aria-label / aria-labelledby, so the dropdown's name is only the active tab. Give the list a label.",
            );
          }
          callback(true, availableWidth, forceRecheck);
        }
      };
    measureOverflow(fitSettingsChanged);
    let resizeObserver = createSafeResizeObserver(ResizeObserverClass, () =>
      measureOverflow(false),
    );
    resizeObserver.observe(container);
    resizeObserver.observe(current);
    let tabsObserver =
      typeof MutationObserver === "undefined"
        ? null
        : createSafeMutationObserver(MutationObserver, () =>
            measureOverflow(true),
          );
    tabsObserver?.observe(current, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    let containerObserver =
      typeof MutationObserver === "undefined"
        ? null
        : createSafeMutationObserver(MutationObserver, () =>
            measureOverflow(false),
          );
    containerObserver?.observe(container, {
      childList: true,
    });
    return () => {
      clearTimeout(recheckTimeout);
      resizeObserver.disconnect();
      tabsObserver?.disconnect();
      containerObserver?.disconnect();
    };
  }, [isCollapsed, exactFit, compact, accessibleLabel, tabListRef]);
  return isCollapsed;
}
export {
  applyTabFlexCorrection,
  areTabMenuItemsEqual,
  canTabsOverflowInline,
  collectTabValues,
  createTabMenuItem,
  debugTabListOverflow,
  disabledTabPointerClasses,
  extractVisibleElementText,
  getTabLabelText,
  getTabScreenReaderText,
  jsxForUiTabs,
  jsxrZ,
  measureTabStripContents,
  parsePixelCssValue,
  reactForUiTabs,
  reactTabs as reactForUiTabs2,
  reactuP,
  resetAncestorHorizontalScroll,
  sortConnectedTabsByDocumentOrder,
  stashedTabsClasses,
  TAB_SELECTOR,
  TAB_TEXT_EXCLUDED_SELECTOR,
  tabBaseClasses,
  Tabs,
  TABS_MENU_LABEL_ID,
  TABS_MENU_TRIGGER_ID,
  TABS_OVERFLOW_RECHECK_MS,
  TABS_STASHED_ATTRIBUTE,
  tabsFirstTabIndicatorClasses,
  tabsFlushClasses,
  tabsLastTabIndicatorClasses,
  TabsList,
  tabsListBaseClasses,
  TabsListMenu,
  tabsOverflowContext,
  TabsPanel,
  TabsRoot,
  TabsTab,
  useTabsOverflow,
  useTabsOverflowMenu,
};
export function installUiTabs(): () => void {
  return () => {
    reactuP = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    tabsOverflowContext = reactuP.createContext<TabsOverflowState | null>(null);
    TABS_STASHED_ATTRIBUTE = "data-cds-stashed";
    TABS_MENU_TRIGGER_ID = "tabs-menu-trigger";
    TABS_MENU_LABEL_ID = "tabs-menu-label";
    initializeSafeObservers();
    initializeIsomorphicLayoutEffect();
    reactForUiTabs = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxForUiTabs = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    TAB_SELECTOR = '[role="tab"]';
    TAB_TEXT_EXCLUDED_SELECTOR =
      '[aria-hidden="true"], [hidden], [data-cds-disabled-reason], [role="img"], svg, .sr-only';
    (
      TabsListMenu as typeof TabsListMenu & {
        displayName?: string;
      }
    ).displayName = "Tabs.ListMenu";
    reactTabs = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxrZ = toModuleNamespace(loadJsxNamespace(), 1);
    tabsListBaseClasses = "flex items-center font-sans";
    tabsFirstTabIndicatorClasses =
      "data-[orientation=horizontal]:[&>[role=tab]:first-child]:before:start-0 data-[orientation=horizontal]:[&>:first-child>[data-orientation][role=tab]:first-child]:before:start-0 data-[orientation=horizontal]:[&>:first-child>:first-child>[data-orientation][role=tab]:first-child]:before:start-0";
    tabsLastTabIndicatorClasses =
      "data-[orientation=horizontal]:[&>[role=tab]:last-child]:before:end-0 data-[orientation=horizontal]:[&>:last-child>[data-orientation][role=tab]:last-child]:before:end-0 data-[orientation=horizontal]:[&>:last-child>:last-child>[data-orientation][role=tab]:last-child]:before:end-0";
    tabsFlushClasses = "-ml-pad-md";
    stashedTabsClasses =
      "invisible absolute size-0 min-h-0 min-w-0 max-w-none overflow-hidden";
    TABS_OVERFLOW_RECHECK_MS = 500;
    TabsList = reactTabs.forwardRef(
      (
        {
          className: className,
          flush: flush,
          size: size,
          activateOnFocus = true,
          ...props
        }: TabsListProps,
        forwardedRef: React.ForwardedRef<HTMLDivElement>,
      ) => {
        let ref = reactTabs.useRef<HTMLElement | null>(null),
          value = useMergedRefs(forwardedRef, ref),
          fitPolicy = useCompactableControl(),
          showOverflowMenu = useTabsOverflowMenu(
            ref,
            props["aria-label"] ?? props["aria-labelledby"],
            fitPolicy.compact,
            fitPolicy.exactFit === true,
          ),
          setCollapsed = useTabsOverflow()?.setCollapsed;
        useIsomorphicLayoutEffect(() => {
          setCollapsed?.(showOverflowMenu);
          return () => setCollapsed?.(false);
        }, [showOverflowMenu, setCollapsed]);
        let menuTriggerHadFocusRef = reactTabs.useRef(false);
        useIsomorphicLayoutEffect(() => {
          if (!showOverflowMenu && menuTriggerHadFocusRef.current) {
            menuTriggerHadFocusRef.current = false;
            ref.current
              ?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
              ?.focus();
          }
        }, [showOverflowMenu]);
        return (
          <jsxrZ.Fragment>
            {[<baseTabs.List
                ref={value}
                activateOnFocus={activateOnFocus}
                {...props}
                {...getControlSizeAttributes(size)}
                {...(getInertProps(showOverflowMenu) as React.HTMLAttributes<HTMLDivElement>)}
                {...(showOverflowMenu
                  ? {
                      [TABS_STASHED_ATTRIBUTE]: "",
                    }
                  : null)}
                className={cn(
                  tabsListBaseClasses,
                  tabsFirstTabIndicatorClasses,
                  tabsLastTabIndicatorClasses,
                  flush ? tabsFlushClasses : "",
                  className,
                  showOverflowMenu && stashedTabsClasses,
                )}
              />, showOverflowMenu ? (
                <TabsListMenu
                  size={size}
                  aria-label={props["aria-label"]}
                  aria-labelledby={props["aria-labelledby"]}
                  listRef={ref}
                  triggerHadFocusRef={menuTriggerHadFocusRef}
                />
              ) : null]}
          </jsxrZ.Fragment>
        );
      },
    );
    TabsList.displayName = "Tabs.List";
    tabBaseClasses =
      "relative isolate inline-flex shrink-0 items-center justify-center gap-1.5 rounded-none h-control px-md cds-reset whitespace-nowrap select-none outline-none focus-visible:outline-hidden bg-transparent text-body font-medium text-muted before:absolute before:inset-y-0 before:inset-x-px before:rounded before:-z-[1] before:transition-shadow before:duration-fast [&:not([data-active]):not([data-disabled])]:hover:text-secondary [&:not([data-active]):not([data-disabled])]:hover:before:bg-fill-ghost-hover data-[active]:text-primary data-[active]:before:bg-fill-ghost-hover focus-visible:before:shadow-focus data-[disabled]:opacity-disabled data-[disabled]:pointer-events-none";
    disabledTabPointerClasses = "data-[disabled]:pointer-events-auto";
    TabsTab = reactTabs.forwardRef(
      (
        {
          className: className,
          children: children,
          disabledReason: disabledReason,
          disabledReasonSide: disabledReasonSide,
          "aria-describedby": ariaDescribedby,
          ...props
        }: TabsTabProps,
        forwardedRef: React.ForwardedRef<HTMLButtonElement>,
      ) => {
        let value = reactTabs.useId(),
          showDisabledReason =
            !!props.disabled && hasDisabledReason(disabledReason),
          registerTab = useTabsOverflow()?.registerTab,
          { value: tabValue } = props,
          ref = reactTabs.useRef<HTMLElement | null>(null),
          callback = reactTabs.useCallback(
            (tabElement: HTMLElement | null) => {
              registerTab?.(tabValue, tabElement, ref.current);
              ref.current = tabElement;
            },
            [registerTab, tabValue],
          ),
          mergedRef = useMergedRefs(forwardedRef, callback),
          tab = (
            <baseTabs.Tab
              ref={mergedRef}
              {...props}
              aria-describedby={
                showDisabledReason
                  ? [ariaDescribedby, value].filter(Boolean).join(" ")
                  : ariaDescribedby
              }
              className={cn(
                tabBaseClasses,
                showDisabledReason ? disabledTabPointerClasses : undefined,
                className,
              )}
              onMouseDown={withRepeatedClickSelectionPrevention(
                props.onMouseDown,
              )}
            >
              {[children, disabledReason !== undefined && (
                  <DisabledReasonAnnouncement
                    id={value}
                    reason={showDisabledReason ? disabledReason : undefined}
                  />
                )]}
            </baseTabs.Tab>
          );
        if (disabledReason === undefined) {
          return tab;
        }
        return (
          <Tooltip
            content={showDisabledReason ? disabledReason : undefined}
            side={disabledReasonSide}
            multiline={true}
            hoverable={false}
            closeOnClick={false}
            openOnHandedBackFocus={true}
          >
            {tab}
          </Tooltip>
        );
      },
    );
    TabsTab.displayName = "Tabs.Tab";
    TabsPanel = reactTabs.forwardRef(
      (
        { className: className, ...props }: TabsPanelProps,
        forwardedRef: React.ForwardedRef<HTMLDivElement>,
      ) => (
        <baseTabs.Panel
          ref={forwardedRef}
          {...props}
          className={cn(
            "cds-reset outline-none focus-visible:outline-hidden",
            className,
          )}
        />
      ),
    );
    TabsPanel.displayName = "Tabs.Panel";
    TabsRoot = reactTabs.forwardRef(
      (props: TabsRootProps, forwardedRef: React.ForwardedRef<HTMLDivElement>) => {
        let {
            value: value,
            defaultValue: defaultValue,
            onValueChange: onValueChange,
          } = props,
          [internalValue, setInternalValue] = reactTabs.useState<unknown>(
            defaultValue === undefined ? 0 : defaultValue,
          ),
          selectedValue = value === undefined ? internalValue : value,
          callback = reactTabs.useCallback(
            (
              nextValue: unknown,
              changeDetails: import("@base-ui/react/tabs").Tabs.Root.ChangeEventDetails,
            ) => {
              onValueChange?.(nextValue, changeDetails);
              if (!changeDetails.isCanceled) {
                setInternalValue(nextValue);
              }
            },
            [onValueChange],
          ),
          ref = reactTabs.useRef(new Map<unknown, HTMLElement>()),
          registerTab = reactTabs.useCallback(
            (
              tabValue: unknown,
              tabElement: HTMLElement | null,
              previousElement: HTMLElement | null,
            ) => {
              if (tabElement === null) {
                if (ref.current.get(tabValue) === previousElement) {
                  ref.current.delete(tabValue);
                }
                return;
              }
              ref.current.set(tabValue, tabElement);
            },
            [],
          ),
          getTabs = reactTabs.useCallback(() => ref.current, []),
          activateTab = reactTabs.useCallback((tabValue: unknown) => {
            ref.current.get(tabValue)?.click();
          }, []),
          [isCollapsed, setIsCollapsed] = reactTabs.useState(false),
          memo = reactTabs.useMemo(
            () => ({
              value: selectedValue,
              registerTab: registerTab,
              tabs: getTabs,
              activate: activateTab,
              setCollapsed: setIsCollapsed,
            }),
            [selectedValue, registerTab, getTabs, activateTab],
          ),
          className = props.className;
        return (
          <tabsOverflowContext.Provider value={memo}>
            <baseTabs.Root
              ref={forwardedRef}
              data-cds={"Tabs"}
              data-collapsed={isCollapsed ? "" : undefined}
              {...props}
              className={
                typeof className === "function"
                  ? (tabState: import("@base-ui/react/tabs").Tabs.Root.State) =>
                      cn(
                        isCollapsed && "min-w-0 max-w-full",
                        className(tabState),
                      )
                  : cn(isCollapsed && "min-w-0 max-w-full", className)
              }
              onValueChange={callback}
            />
          </tabsOverflowContext.Provider>
        );
      },
    );
    TabsRoot.displayName = "Tabs.Root";
    Tabs = {
      Root: TabsRoot,
      List: TabsList,
      Tab: TabsTab,
      Panel: TabsPanel,
    };
  };
}
