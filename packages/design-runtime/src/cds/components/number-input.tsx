import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
import type { TabMenuItem, TabsListMenuProps } from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { initializeHooksLayoutEffect, useIsomorphicLayoutEffect } from "../hooks/layout-effect";
import { initializeMenuComponents, MenuMenuAssignValue } from "../menu/menu";
import { initializeFlipIndicatorContext, TabsMenuLabelValue, TabsMenuTriggerValue, useFlipIndicatorContext } from "../switch/context";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactTabsListMenu: typeof React;
var jsxTabsListMenu: typeof import("react/jsx-runtime");
var RoleTabValue: string;
var TabsListMenuLabel: string;
var initializeTabsListMenu: () => void;
function collectAccessibleTabText(root: Element, excludeSelector: string): string {
  let text = "",
    collect = (node: Node): void => {
      if (node.nodeType === Node.TEXT_NODE) text += node.nodeValue ?? "";
      else if (node.nodeType === Node.ELEMENT_NODE) {
        if (
          node !== root &&
          ((node as Element).matches(excludeSelector) ||
            getComputedStyle(node as Element).display === "none")
        )
          return;
        text += " ";
        node.childNodes.forEach(collect);
        text += " ";
      }
    };
  collect(root);
  return text.replace(/\s+/g, " ").trim();
}
function accessibleTabText(element: Element): string {
  let labelText = collectAccessibleTabText(element, TabsListMenuLabel);
  return labelText !== ""
    ? labelText
    : (element.getAttribute("aria-label") ?? "").trim();
}
function screenReaderTabText(element: Element): string {
  let text = "";
  element.querySelectorAll<HTMLElement>(".sr-only").forEach((srElement) => {
    srElement.closest("[data-cds-disabled-reason]") === null &&
      (text += ` ${collectAccessibleTabText(srElement, '[aria-hidden="true"], [hidden]')}`);
  });
  return text.trim();
}
function registeredTabsInDomOrder<Value>(
  tabs: ReadonlyMap<Value, HTMLElement>,
): TabMenuItem<Value>[] {
  return [...tabs.entries()]
    .filter(([, tab]) => tab.isConnected)
    .sort(([, firstTab], [, secondTab]) =>
      firstTab.compareDocumentPosition(secondTab) &
      Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : 1,
    )
    .map(([tabValue, tabElement]) => tabMenuItem(tabValue, tabElement));
}
function readTabMenuItems<Value>(
  listElement: Element | null,
  tabs: ReadonlyMap<Value, HTMLElement>,
): TabMenuItem<Value>[] {
  if (listElement === null) return [];
  let entries: Map<HTMLElement, Value> = new Map();
  tabs.forEach((tabElement, tabValue) => entries.set(tabElement, tabValue));
  let items: TabMenuItem<Value>[] = [];
  listElement.querySelectorAll<HTMLElement>(RoleTabValue).forEach((tabElement) => {
    entries.has(tabElement) &&
      items.push(tabMenuItem(entries.get(tabElement)!, tabElement));
  });
  return items;
}
function tabMenuItem<Value>(
  itemValue: Value,
  element: Element,
): TabMenuItem<Value> {
  let reasonText = element
    .querySelector("[data-cds-disabled-reason]")
    ?.textContent?.trim();
  return {
    value: itemValue,
    text: accessibleTabText(element),
    srText: screenReaderTabText(element),
    disabled:
      element.getAttribute("aria-disabled") === "true" ||
      element.hasAttribute("data-disabled"),
    reason: reasonText === undefined || reasonText === "" ? undefined : reasonText,
  };
}
function sameTabMenuItems<Value>(
  items: readonly TabMenuItem<Value>[],
  otherItems: readonly TabMenuItem<Value>[],
): boolean {
  return (
    items.length === otherItems.length &&
    items.every(
      (item, index) =>
        Object.is(item.value, otherItems[index]!.value) &&
        item.text === otherItems[index]!.text &&
        item.srText === otherItems[index]!.srText &&
        item.disabled === otherItems[index]!.disabled &&
        item.reason === otherItems[index]!.reason,
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
  let flipContext = useFlipIndicatorContext(),
    triggerRef = (0, reactTabsListMenu.useRef)<HTMLButtonElement | null>(null),
    labelId = (0, reactTabsListMenu.useId)(),
    selectedLabelId = (0, reactTabsListMenu.useId)(),
    [menuItems, setMenuItems] = (0, reactTabsListMenu.useState)(() =>
      registeredTabsInDomOrder(flipContext?.tabs() ?? new Map()),
    ),
    refreshItems = (0, reactTabsListMenu.useCallback)(() => {
      let latestItems = readTabMenuItems(
        listRef.current,
        flipContext?.tabs() ?? new Map(),
      );
      setMenuItems((previousItems) => (sameTabMenuItems(previousItems, latestItems) ? previousItems : latestItems));
    }, [listRef, flipContext]);
  useIsomorphicLayoutEffect(() => {
    refreshItems();
    let listNode = listRef.current;
    if (listNode === null || typeof MutationObserver === "undefined") return;
    let observer = new MutationObserver(refreshItems);
    observer.observe(listNode, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["aria-disabled", "data-disabled", "aria-label"],
    });
    return () => observer.disconnect();
  }, [refreshItems, listRef]);
  (0, reactTabsListMenu.useEffect)(refreshItems, [refreshItems]);
  useIsomorphicLayoutEffect(() => {
    let listNode = listRef.current,
      activeElement = listNode?.ownerDocument.activeElement ?? null;
    listNode !== null &&
      activeElement !== null &&
      listNode.contains(activeElement) &&
      triggerRef.current?.focus();
    return () => {
      let triggerNode = triggerRef.current,
        activeElementAtCleanup = triggerNode?.ownerDocument.activeElement ?? null,
        controlsId = triggerNode?.getAttribute("aria-controls") ?? null,
        controlledElement =
          controlsId === null
            ? null
            : (triggerNode as HTMLButtonElement).ownerDocument.getElementById(
                controlsId,
              );
      triggerHadFocusRef.current =
        triggerNode !== null &&
        activeElementAtCleanup !== null &&
        (activeElementAtCleanup === triggerNode ||
          (controlledElement !== null && controlledElement.contains(activeElementAtCleanup)));
    };
  }, [listRef, triggerHadFocusRef]);
  let selectedItem = menuItems.find(
      (item) => flipContext !== null && Object.is(item.value, flipContext.value),
    ),
    labelledBy = [
      ariaLabelledby ?? (ariaLabel !== undefined ? labelId : undefined),
      selectedItem !== undefined ? selectedLabelId : undefined,
    ]
      .filter(Boolean)
      .join(" ");
  return (
    <MenuMenuAssignValue.Root sheetTitle={ariaLabel}>
      <MenuMenuAssignValue.TriggerButton
        ref={triggerRef}
        variant={"secondary"}
        size={size}
        aria-labelledby={labelledBy === "" ? undefined : labelledBy}
        data-cds-part={TabsMenuTriggerValue}
        className={"max-w-full min-w-0"}
      >
        {ariaLabel !== undefined && ariaLabelledby === undefined ? (<span id={labelId} className={"sr-only"}>
            {ariaLabel}
          </span>) : (null)}
        {selectedItem !== undefined ? (<span
            id={selectedLabelId}
            data-cds-part={TabsMenuLabelValue}
            className={"max-w-40 min-w-0 truncate"}
          >
            {selectedItem.text}
          </span>) : (ariaLabel !== undefined ? (<span
            aria-hidden={true}
            data-cds-part={TabsMenuLabelValue}
            className={"max-w-40 min-w-0 truncate"}
          >
            {ariaLabel}
          </span>) : (null))}
      </MenuMenuAssignValue.TriggerButton>
      <MenuMenuAssignValue.Popup>
        <MenuMenuAssignValue.Group
          aria-label={ariaLabelledby === undefined ? (ariaLabel) : (undefined)}
          aria-labelledby={ariaLabelledby}
        >
          {menuItems.map((item, index) =>
            (() => {
              const _Component = MenuMenuAssignValue.Item;
              const _props = {
                checkedRole: "radio",
                checked: item === selectedItem,
                disabled: item.disabled,
                disabledReason: item.reason,
                onClick: () => flipContext?.activate(item.value),
                children: [
                  item.text,
                  item.srText !== "" ? (
                    <span className={"sr-only"}> {item.srText}</span>
                  ) : null,
                ],
              } as const;
              const _key = `${String(item.value)}:${index}`;
              return <_Component key={_key} {..._props} />;
            })(),
          )}
        </MenuMenuAssignValue.Group>
      </MenuMenuAssignValue.Popup>
    </MenuMenuAssignValue.Root>
  );
}
export {
  accessibleTabText,
  collectAccessibleTabText,
  initializeTabsListMenu,
  jsxTabsListMenu,
  reactTabsListMenu,
  readTabMenuItems,
  registeredTabsInDomOrder,
  RoleTabValue,
  sameTabMenuItems,
  screenReaderTabText,
  tabMenuItem,
  TabsListMenu,
  TabsListMenuLabel,
};
export function installCdsComponentsNumberInput(): () => void {
  return () => {
    initializeTabsListMenu = initializeOnce(() => {
      "use client";

      initializeHooksLayoutEffect();
      initializeMenuComponents();
      initializeFlipIndicatorContext();
      reactTabsListMenu = toModuleNamespace(
        load_react(),
      );
      jsxTabsListMenu = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      RoleTabValue = '[role="tab"]';
      TabsListMenuLabel =
        '[aria-hidden="true"], [hidden], [data-cds-disabled-reason], [role="img"], svg, .sr-only';
      (TabsListMenu as React.FC<TabsListMenuProps>).displayName =
        "Tabs.ListMenu";
    });
  };
}
