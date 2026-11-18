import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeButtonContext, useButtonGroup } from "../button/context";
import { elementInnerWidth, flexContentBounds, flexRowWidth, initializeButtonGroup_3, isSingleRowFlex } from "../button/group";
import { initializeTabsListMenu, TabsListMenu } from "../components/number-input";
import { getInertProps, initializeDomInert } from "../dom/inert";
import { initializeDomRefComposition, initializeDomRefComposition_2, isHtmlElement, useMergedRefs } from "../dom/ref-composition";
import { initializeDomSelectionPrevention, withSelectionPrevention } from "../dom/selection-prevention";
import { initializeHooksLayoutEffect, useIsomorphicLayoutEffect } from "../hooks/layout-effect";
import { CdsStashedAttribute, FlipIndicatorContext, initializeSwitchContext_2, useFlipIndicatorContext } from "../switch/context";
import { cn, initializeClassNames } from "../theme/class-names";
import { getSizeAttribute, initializeCdsRoot } from "../theme/root";
import { DisabledReasonDescription, hasDisabledReason, initializeTooltipDisabledReason } from "../tooltip/disabled-reason";
import { initializeTooltipTooltip, Tooltip } from "../tooltip/tooltip";
import { getResizeObserver, initializeTooltipTrigger_2 } from "../tooltip/trigger";
import { initializeNpm__base_ui_react_oQe, load_react, load_react_jsx_runtime, npm_Tabs_C1 } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactTabsTabs: Dynamic;
var jsxTabsTabs: Dynamic;
var TabsTabsClassNames: Dynamic;
var DataOrientationHorizontalRoleTabFirstChildBefValue: Dynamic;
var DataOrientationHorizontalRoleTabLastChildBefoValue: Dynamic;
var MlPadMdValue: Dynamic;
var TabsTabsClassNames_2: Dynamic;
var TabsTabsLimit: Dynamic;
var TabsList: Dynamic;
var tabsListClasses: Dynamic;
var DataDisabledPointerEventsAutoValue: Dynamic;
var TabsTab: Dynamic;
var TabsPanel: Dynamic;
var TabsRoot: Dynamic;
var TabsTabsRootListTabConfig: Dynamic;
var initializeTabsTabs: Dynamic;
function hasHorizontalScrollAncestor(
  startElement?: Dynamic,
  boundary?: Dynamic,
): Dynamic {
  for (
    let value: Dynamic = startElement;
    value !== null && value !== boundary;
    value = value.parentElement
  ) {
    let { overflowX: overflowX }: Dynamic = getComputedStyle(value);
    if (overflowX === "auto" || overflowX === "scroll") return true;
  }
  return false;
}
function tabListCanShrink(tabsRoot?: Dynamic, tabListElement?: Dynamic): Dynamic {
  if (getComputedStyle(tabsRoot).display === "contents") return true;
  for (let value of Array.from(tabsRoot.children) as Dynamic) {
    if (
      value === tabListElement ||
      value.contains(tabListElement) ||
      !isHtmlElement(value) ||
      value.getAttribute("data-cds-part") === "tabs-menu-trigger"
    )
      continue;
    let childStyle: Dynamic = getComputedStyle(value);
    if (
      childStyle.display !== "none" &&
      childStyle.position !== "absolute" &&
      childStyle.position !== "fixed"
    )
      return true;
  }
  return false;
}
function useResponsiveTabList(
  listRef?: Dynamic,
  label?: Dynamic,
  isCompact?: Dynamic,
  isExactFit?: Dynamic,
): Dynamic {
  let [isCollapsed, setIsCollapsed]: Dynamic = (0, reactTabsTabs.useState)(false),
    widthCountsRef: Dynamic = (0, reactTabsTabs.useRef)(new Map()),
    lastMeasureTimeRef: Dynamic = (0, reactTabsTabs.useRef)(0),
    pendingWidthRef: Dynamic = (0, reactTabsTabs.useRef)(NaN),
    compactRef: Dynamic = (0, reactTabsTabs.useRef)(isCompact),
    exactFitRef: Dynamic = (0, reactTabsTabs.useRef)(isExactFit);
  useIsomorphicLayoutEffect((): Dynamic => {
    let current: Dynamic = listRef.current,
      tabsRootElement: Dynamic = current?.closest('[data-cds="Tabs"]') ?? null,
      tabsContainer: Dynamic = tabsRootElement?.parentElement ?? null;
    if (current === null || tabsRootElement === null || tabsContainer === null) return;
    let ResizeObserverClass: Dynamic = getResizeObserver(tabsContainer);
    if (ResizeObserverClass === undefined) return;
    let hasConfigChanged: Dynamic =
      compactRef.current !== isCompact || exactFitRef.current !== isExactFit;
    compactRef.current = isCompact;
    exactFitRef.current = isExactFit;
    let settleTimer: Dynamic,
      callback: Dynamic = (
        shouldCollapse?: Dynamic,
        availableWidth?: Dynamic,
        isForced?: Dynamic,
      ): Dynamic => {
        let now: Dynamic = Date.now(),
          widthCounts: Dynamic = widthCountsRef.current;
        now - lastMeasureTimeRef.current > TabsTabsLimit && widthCounts.clear();
        let roundedWidth: Dynamic = Math.round(availableWidth),
          widthCount: Dynamic = widthCounts.get(roundedWidth) ?? 0;
        if (!shouldCollapse && !isForced && widthCount >= 2) {
          pendingWidthRef.current !== roundedWidth &&
            ((pendingWidthRef.current = roundedWidth),
            clearTimeout(settleTimer),
            (settleTimer = setTimeout((): Dynamic => measureTabList(false), 550)));
          return;
        }
        roundedWidth !== pendingWidthRef.current && (pendingWidthRef.current = NaN);
        shouldCollapse || widthCounts.set(roundedWidth, widthCount + 1);
        lastMeasureTimeRef.current = now;
        setIsCollapsed(shouldCollapse);
      },
      shouldSkipCollapse: Dynamic = (): Dynamic =>
        tabsRootElement.getAttribute("data-orientation") === "vertical" ||
        tabListCanShrink(tabsRootElement, current) ||
        hasHorizontalScrollAncestor(current, tabsRootElement) ||
        !isSingleRowFlex(tabsContainer),
      measureTabList: Dynamic = (isForced?: Dynamic): Dynamic => {
        if (shouldSkipCollapse()) {
          isCollapsed && setIsCollapsed(false);
          return;
        }
        let containerWidth: Dynamic = elementInnerWidth(tabsContainer);
        if (containerWidth <= 0) return;
        let contentWidth: Dynamic = flexContentBounds(current);
        if (contentWidth <= 0) return;
        let listStyle: Dynamic = getComputedStyle(current),
          rootStyle: Dynamic = getComputedStyle(tabsRootElement),
          fullContentWidth: Dynamic =
            contentWidth +
            (Number.parseFloat(listStyle.marginLeft) || 0) +
            (Number.parseFloat(listStyle.marginRight) || 0) +
            (Number.parseFloat(rootStyle.paddingLeft) || 0) +
            (Number.parseFloat(rootStyle.paddingRight) || 0) +
            (Number.parseFloat(rootStyle.borderLeftWidth) || 0) +
            (Number.parseFloat(rootStyle.borderRightWidth) || 0),
          requiredRowWidth: Dynamic = flexRowWidth(
            tabsContainer,
            tabsRootElement,
            fullContentWidth,
          );
        if (isCollapsed) {
          !isCompact &&
            containerWidth >= requiredRowWidth + (isExactFit ? 0 : 64) &&
            callback(false, containerWidth, isForced);
          return;
        }
        containerWidth + 0.5 < requiredRowWidth &&
          ((): Dynamic => {
            label === undefined && undefined;
            return callback(true, containerWidth, isForced);
          })();
      };
    measureTabList(hasConfigChanged);
    let resizeObserver: Dynamic = new ResizeObserverClass((): Dynamic => measureTabList(false));
    resizeObserver.observe(tabsContainer);
    resizeObserver.observe(current);
    let contentObserver: Dynamic =
      typeof MutationObserver === "undefined"
        ? null
        : new MutationObserver((): Dynamic => measureTabList(true));
    contentObserver?.observe(current, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    let containerObserver: Dynamic =
      typeof MutationObserver === "undefined"
        ? null
        : new MutationObserver((): Dynamic => measureTabList(false));
    containerObserver?.observe(tabsContainer, {
      childList: true,
    });
    return (): Dynamic => {
      clearTimeout(settleTimer);
      resizeObserver.disconnect();
      contentObserver?.disconnect();
      containerObserver?.disconnect();
    };
  }, [isCollapsed, isExactFit, isCompact, label, listRef]);
  return isCollapsed;
}
export {
  DataDisabledPointerEventsAutoValue,
  DataOrientationHorizontalRoleTabFirstChildBefValue,
  DataOrientationHorizontalRoleTabLastChildBefoValue,
  hasHorizontalScrollAncestor,
  initializeTabsTabs,
  jsxTabsTabs,
  MlPadMdValue,
  reactTabsTabs,
  tabListCanShrink,
  TabsList,
  tabsListClasses,
  TabsPanel,
  TabsRoot,
  TabsTab,
  TabsTabsClassNames,
  TabsTabsClassNames_2,
  TabsTabsLimit,
  TabsTabsRootListTabConfig,
  useResponsiveTabList,
};
export function installCdsTabsTabs(): () => void {
  return () => {
    initializeTabsTabs = initializeOnce((): Dynamic => {
      "use client";

      initializeHooksLayoutEffect();
      initializeClassNames();
      initializeCdsRoot();
      initializeDomSelectionPrevention();
      initializeDomRefComposition_2();
      initializeDomRefComposition();
      initializeTooltipTrigger_2();
      initializeTooltipDisabledReason();
      initializeTooltipTooltip();
      initializeButtonContext();
      initializeDomInert();
      initializeButtonGroup_3();
      initializeSwitchContext_2();
      initializeTabsListMenu();
      reactTabsTabs = toModuleNamespace(load_react());
      jsxTabsTabs = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializeNpm__base_ui_react_oQe();
      TabsTabsClassNames = "flex items-center font-sans";
      DataOrientationHorizontalRoleTabFirstChildBefValue =
        "data-[orientation=horizontal]:[&>[role=tab]:first-child]:before:start-0";
      DataOrientationHorizontalRoleTabLastChildBefoValue =
        "data-[orientation=horizontal]:[&>[role=tab]:last-child]:before:end-0";
      MlPadMdValue = "-ml-pad-md";
      TabsTabsClassNames_2 =
        "invisible absolute size-0 min-h-0 min-w-0 max-w-none overflow-hidden";
      TabsTabsLimit = 500;
      TabsList = (0, reactTabsTabs.forwardRef)(
        (
          {
            className: className,
            flush: flush,
            size: size,
            activateOnFocus = true,
            ...props
          }: Dynamic,
          forwardedRef?: Dynamic,
        ): Dynamic => {
          let value: Dynamic = (0, reactTabsTabs.useRef)(null),
            mergedRef: Dynamic = useMergedRefs(forwardedRef, value),
            buttonGroup: Dynamic = useButtonGroup(),
            isCollapsed: Dynamic = useResponsiveTabList(
              value,
              props["aria-label"] ?? props["aria-labelledby"],
              buttonGroup.compact,
              buttonGroup.exactFit === true,
            ),
            setCollapsed: Dynamic = useFlipIndicatorContext()
              ?.setCollapsed;
          useIsomorphicLayoutEffect(
            (): Dynamic => (setCollapsed?.(isCollapsed), (): Dynamic => setCollapsed?.(false)),
            [isCollapsed, setCollapsed],
          );
          let triggerHadFocusRef: Dynamic = (0, reactTabsTabs.useRef)(false);
          useIsomorphicLayoutEffect((): Dynamic => {
            !isCollapsed &&
              triggerHadFocusRef.current &&
              ((triggerHadFocusRef.current = false),
              value.current
                ?.querySelector('[role="tab"][aria-selected="true"]')
                ?.focus());
          }, [isCollapsed]);
          return (
            <jsxTabsTabs.Fragment>
              <npm_Tabs_C1.List
                ref={mergedRef}
                activateOnFocus={activateOnFocus}
                {...props}
                {...getSizeAttribute(size)}
                {...getInertProps(isCollapsed)}
                {...(isCollapsed
                  ? {
                      [CdsStashedAttribute]: "",
                    }
                  : null)}
                className={cn(
                  TabsTabsClassNames,
                  DataOrientationHorizontalRoleTabFirstChildBefValue,
                  DataOrientationHorizontalRoleTabLastChildBefoValue,
                  flush ? MlPadMdValue : "",
                  className,
                  isCollapsed && TabsTabsClassNames_2,
                )}
              />
              {isCollapsed ? (<TabsListMenu
                  size={size}
                  aria-label={props["aria-label"]}
                  aria-labelledby={props["aria-labelledby"]}
                  listRef={value}
                  triggerHadFocusRef={triggerHadFocusRef}
                />) : (null)}
            </jsxTabsTabs.Fragment>
          );
        },
      );
      TabsList.displayName = "Tabs.List";
      tabsListClasses =
        "relative isolate inline-flex shrink-0 items-center justify-center gap-1.5 rounded-none h-control px-md cds-reset whitespace-nowrap select-none outline-none focus-visible:outline-hidden bg-transparent text-body font-medium text-muted before:absolute before:inset-y-0 before:inset-x-px before:rounded before:-z-[1] before:transition-shadow before:duration-fast [&:not([data-active]):not([data-disabled])]:hover:text-secondary [&:not([data-active]):not([data-disabled])]:hover:before:bg-fill-ghost-hover data-[active]:text-primary data-[active]:before:bg-fill-ghost-hover focus-visible:before:shadow-focus data-[disabled]:opacity-disabled data-[disabled]:pointer-events-none";
      DataDisabledPointerEventsAutoValue =
        "data-[disabled]:pointer-events-auto";
      TabsTab = (0, reactTabsTabs.forwardRef)(
        (
          {
            className: className,
            children: children,
            disabledReason: disabledReason,
            disabledReasonSide: disabledReasonSide,
            "aria-describedby": ariaDescribedby,
            ...props
          }: Dynamic,
          forwardedRef?: Dynamic,
        ): Dynamic => {
          let value: Dynamic = (0, reactTabsTabs.useId)(),
            isDisabledWithReason: Dynamic =
              !!props.disabled &&
              hasDisabledReason(disabledReason),
            registerTab: Dynamic = useFlipIndicatorContext()
              ?.registerTab,
            { value: tabValue }: Dynamic = props,
            tabElementRef: Dynamic = (0, reactTabsTabs.useRef)(null),
            setTabElement: Dynamic = (0, reactTabsTabs.useCallback)(
              (tabElement?: Dynamic): Dynamic => {
                registerTab?.(tabValue, tabElement, tabElementRef.current);
                tabElementRef.current = tabElement;
              },
              [registerTab, tabValue],
            ),
            mergedRef: Dynamic = useMergedRefs(forwardedRef, setTabElement),
            tabNode: Dynamic = (
              <npm_Tabs_C1.Tab
                ref={mergedRef}
                {...props}
                aria-describedby={
                  isDisabledWithReason
                    ? [ariaDescribedby, value].filter(Boolean).join(" ")
                    : ariaDescribedby
                }
                className={cn(
                  tabsListClasses,
                  isDisabledWithReason ? DataDisabledPointerEventsAutoValue : undefined,
                  className,
                )}
                onMouseDown={withSelectionPrevention(
                  props.onMouseDown,
                )}
              >
                {children}
                {disabledReason !== undefined && (<DisabledReasonDescription
                    id={value}
                    reason={isDisabledWithReason ? disabledReason : undefined}
                  />)}
              </npm_Tabs_C1.Tab>
            );
          return disabledReason === undefined ? (
            tabNode
          ) : (
            <Tooltip
              content={isDisabledWithReason ? disabledReason : undefined}
              side={disabledReasonSide}
              multiline={true}
              hoverable={false}
              closeOnClick={false}
              openOnHandedBackFocus={true}
            >
              {tabNode}
            </Tooltip>
          );
        },
      );
      TabsTab.displayName = "Tabs.Tab";
      TabsPanel = (0, reactTabsTabs.forwardRef)(
        (
          { className: className, ...props }: Dynamic,
          forwardedRef?: Dynamic,
        ): Dynamic => (
          <npm_Tabs_C1.Panel
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
      TabsRoot = (0, reactTabsTabs.forwardRef)(
        (props?: Dynamic, forwardedRef?: Dynamic): Dynamic => {
          let {
              value: value,
              defaultValue: defaultValue,
              onValueChange: onValueChange,
            }: Dynamic = props,
            [uncontrolledValue, setUncontrolledValue]: Dynamic = (0, reactTabsTabs.useState)(
              defaultValue === undefined ? 0 : defaultValue,
            ),
            currentValue: Dynamic = value === undefined ? uncontrolledValue : value,
            handleValueChange: Dynamic = (0, reactTabsTabs.useCallback)(
              (nextValue?: Dynamic, eventDetails?: Dynamic): Dynamic => {
                onValueChange?.(nextValue, eventDetails);
                eventDetails.isCanceled || setUncontrolledValue(nextValue);
              },
              [onValueChange],
            ),
            tabElementsRef: Dynamic = (0, reactTabsTabs.useRef)(new Map()),
            registerTab: Dynamic = (0, reactTabsTabs.useCallback)(
              (
                tabValue?: Dynamic,
                tabElement?: Dynamic,
                previousElement?: Dynamic,
              ): Dynamic => {
                if (tabElement === null) {
                  tabElementsRef.current.get(tabValue) === previousElement &&
                    tabElementsRef.current.delete(tabValue);
                  return;
                }
                tabElementsRef.current.set(tabValue, tabElement);
              },
              [],
            ),
            getTabs: Dynamic = (0, reactTabsTabs.useCallback)(
              (): Dynamic => tabElementsRef.current,
              [],
            ),
            activateTab: Dynamic = (0, reactTabsTabs.useCallback)(
              (tabValue?: Dynamic): Dynamic => {
                tabElementsRef.current.get(tabValue)?.click();
              },
              [],
            ),
            [isCollapsed, setIsCollapsed]: Dynamic = (0, reactTabsTabs.useState)(false),
            contextValue: Dynamic = (0, reactTabsTabs.useMemo)(
              (): Dynamic => ({
                value: currentValue,
                registerTab: registerTab,
                tabs: getTabs,
                activate: activateTab,
                setCollapsed: setIsCollapsed,
              }),
              [currentValue, registerTab, getTabs, activateTab],
            ),
            className: Dynamic = props.className;
          return (
            <FlipIndicatorContext.Provider value={contextValue}>
              <npm_Tabs_C1.Root
                ref={forwardedRef}
                data-cds={"Tabs"}
                data-collapsed={isCollapsed ? "" : undefined}
                {...props}
                className={
                  typeof className == "function"
                    ? (state?: Dynamic): Dynamic =>
                        cn(
                          isCollapsed && "min-w-0 max-w-full",
                          className(state),
                        )
                    : cn(
                        isCollapsed && "min-w-0 max-w-full",
                        className,
                      )
                }
                onValueChange={handleValueChange}
              />
            </FlipIndicatorContext.Provider>
          );
        },
      );
      TabsRoot.displayName = "Tabs.Root";
      TabsTabsRootListTabConfig = {
        Root: TabsRoot,
        List: TabsList,
        Tab: TabsTab,
        Panel: TabsPanel,
      };
    });
  };
}
