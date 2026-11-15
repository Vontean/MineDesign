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
  input?: Dynamic,
  options?: Dynamic,
): Dynamic {
  for (
    let value: Dynamic = input;
    value !== null && value !== options;
    value = value.parentElement
  ) {
    let { overflowX: value2 }: Dynamic = getComputedStyle(value);
    if (value2 === "auto" || value2 === "scroll") return true;
  }
  return false;
}
function tabListCanShrink(input?: Dynamic, options?: Dynamic): Dynamic {
  if (getComputedStyle(input).display === "contents") return true;
  for (let value of Array.from(input.children) as Dynamic) {
    if (
      value === options ||
      value.contains(options) ||
      !(0, isHtmlElement)(value) ||
      value.getAttribute("data-cds-part") === "tabs-menu-trigger"
    )
      continue;
    let value2: Dynamic = getComputedStyle(value);
    if (
      value2.display !== "none" &&
      value2.position !== "absolute" &&
      value2.position !== "fixed"
    )
      return true;
  }
  return false;
}
function useResponsiveTabList(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
  value?: Dynamic,
): Dynamic {
  let [value2, value3]: Dynamic = (0, reactTabsTabs.useState)(false),
    value4: Dynamic = (0, reactTabsTabs.useRef)(new Map()),
    value5: Dynamic = (0, reactTabsTabs.useRef)(0),
    value6: Dynamic = (0, reactTabsTabs.useRef)(NaN),
    value7: Dynamic = (0, reactTabsTabs.useRef)(context),
    value8: Dynamic = (0, reactTabsTabs.useRef)(value);
  (0, useIsomorphicLayoutEffect)((): Dynamic => {
    let current: Dynamic = input.current,
      value9: Dynamic = current?.closest('[data-cds="Tabs"]') ?? null,
      value10: Dynamic = value9?.parentElement ?? null;
    if (current === null || value9 === null || value10 === null) return;
    let value11: Dynamic = (0, getResizeObserver)(value10);
    if (value11 === undefined) return;
    let value12: Dynamic =
      value7.current !== context || value8.current !== value;
    value7.current = context;
    value8.current = value;
    let value13: Dynamic,
      callback: Dynamic = (
        input2?: Dynamic,
        options2?: Dynamic,
        context2?: Dynamic,
      ): Dynamic => {
        let value17: Dynamic = Date.now(),
          current2: Dynamic = value4.current;
        value17 - value5.current > TabsTabsLimit && current2.clear();
        let value18: Dynamic = Math.round(options2),
          value19: Dynamic = current2.get(value18) ?? 0;
        if (!input2 && !context2 && value19 >= 2) {
          value6.current !== value18 &&
            ((value6.current = value18),
            clearTimeout(value13),
            (value13 = setTimeout((): Dynamic => callback3(false), 550)));
          return;
        }
        value18 !== value6.current && (value6.current = NaN);
        input2 || current2.set(value18, value19 + 1);
        value5.current = value17;
        value3(input2);
      },
      callback2: Dynamic = (): Dynamic =>
        value9.getAttribute("data-orientation") === "vertical" ||
        tabListCanShrink(value9, current) ||
        hasHorizontalScrollAncestor(current, value9) ||
        !(0, isSingleRowFlex)(value10),
      callback3: Dynamic = (input2?: Dynamic): Dynamic => {
        if (callback2()) {
          value2 && value3(false);
          return;
        }
        let value17: Dynamic = (0, elementInnerWidth)(value10);
        if (value17 <= 0) return;
        let value18: Dynamic = (0, flexContentBounds)(current);
        if (value18 <= 0) return;
        let value19: Dynamic = getComputedStyle(current),
          value20: Dynamic = getComputedStyle(value9),
          value21: Dynamic =
            value18 +
            (Number.parseFloat(value19.marginLeft) || 0) +
            (Number.parseFloat(value19.marginRight) || 0) +
            (Number.parseFloat(value20.paddingLeft) || 0) +
            (Number.parseFloat(value20.paddingRight) || 0) +
            (Number.parseFloat(value20.borderLeftWidth) || 0) +
            (Number.parseFloat(value20.borderRightWidth) || 0),
          value22: Dynamic = (0, flexRowWidth)(
            value10,
            value9,
            value21,
          );
        if (value2) {
          !context &&
            value17 >= value22 + (value ? 0 : 64) &&
            callback(false, value17, input2);
          return;
        }
        value17 + 0.5 < value22 &&
          ((): Dynamic => {
            options === undefined && undefined;
            return callback(true, value17, input2);
          })();
      };
    callback3(value12);
    let value14: Dynamic = new value11((): Dynamic => callback3(false));
    value14.observe(value10);
    value14.observe(current);
    let value15: Dynamic =
      typeof MutationObserver === "undefined"
        ? null
        : new MutationObserver((): Dynamic => callback3(true));
    value15?.observe(current, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    let value16: Dynamic =
      typeof MutationObserver === "undefined"
        ? null
        : new MutationObserver((): Dynamic => callback3(false));
    value16?.observe(value10, {
      childList: true,
    });
    return (): Dynamic => {
      clearTimeout(value13);
      value14.disconnect();
      value15?.disconnect();
      value16?.disconnect();
    };
  }, [value2, value, context, options, input]);
  return value2;
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
    initializeTabsTabs = (0, initializeOnce)((): Dynamic => {
      "use client";

      (0, initializeHooksLayoutEffect)();
      (0, initializeClassNames)();
      (0, initializeCdsRoot)();
      (0, initializeDomSelectionPrevention)();
      (0, initializeDomRefComposition_2)();
      (0, initializeDomRefComposition)();
      (0, initializeTooltipTrigger_2)();
      (0, initializeTooltipDisabledReason)();
      (0, initializeTooltipTooltip)();
      (0, initializeButtonContext)();
      (0, initializeDomInert)();
      (0, initializeButtonGroup_3)();
      (0, initializeSwitchContext_2)();
      (0, initializeTabsListMenu)();
      reactTabsTabs = (0, toModuleNamespace)((0, load_react)());
      jsxTabsTabs = (0, toModuleNamespace)(
        (0, load_react_jsx_runtime)(),
      );
      (0, initializeNpm__base_ui_react_oQe)();
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
          options?: Dynamic,
        ): Dynamic => {
          let value: Dynamic = (0, reactTabsTabs.useRef)(null),
            value2: Dynamic = (0, useMergedRefs)(options, value),
            value3: Dynamic = (0, useButtonGroup)(),
            value4: Dynamic = useResponsiveTabList(
              value,
              props["aria-label"] ?? props["aria-labelledby"],
              value3.compact,
              value3.exactFit === true,
            ),
            value5: Dynamic = (0, useFlipIndicatorContext)()
              ?.setCollapsed;
          (0, useIsomorphicLayoutEffect)(
            (): Dynamic => (value5?.(value4), (): Dynamic => value5?.(false)),
            [value4, value5],
          );
          let value6: Dynamic = (0, reactTabsTabs.useRef)(false);
          (0, useIsomorphicLayoutEffect)((): Dynamic => {
            !value4 &&
              value6.current &&
              ((value6.current = false),
              value.current
                ?.querySelector('[role="tab"][aria-selected="true"]')
                ?.focus());
          }, [value4]);
          return (
            <jsxTabsTabs.Fragment>
              <npm_Tabs_C1.List
                ref={value2}
                activateOnFocus={activateOnFocus}
                {...props}
                {...(0, getSizeAttribute)(size)}
                {...(0, getInertProps)(value4)}
                {...(value4
                  ? {
                      [CdsStashedAttribute]: "",
                    }
                  : null)}
                className={(0, cn)(
                  TabsTabsClassNames,
                  DataOrientationHorizontalRoleTabFirstChildBefValue,
                  DataOrientationHorizontalRoleTabLastChildBefoValue,
                  flush ? MlPadMdValue : "",
                  className,
                  value4 && TabsTabsClassNames_2,
                )}
              />
              {value4 ? (<TabsListMenu
                  size={size}
                  aria-label={props["aria-label"]}
                  aria-labelledby={props["aria-labelledby"]}
                  listRef={value}
                  triggerHadFocusRef={value6}
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
          options?: Dynamic,
        ): Dynamic => {
          let value: Dynamic = (0, reactTabsTabs.useId)(),
            value2: Dynamic =
              !!props.disabled &&
              (0, hasDisabledReason)(disabledReason),
            value3: Dynamic = (0, useFlipIndicatorContext)()
              ?.registerTab,
            { value: value4 }: Dynamic = props,
            value5: Dynamic = (0, reactTabsTabs.useRef)(null),
            value6: Dynamic = (0, reactTabsTabs.useCallback)(
              (input?: Dynamic): Dynamic => {
                value3?.(value4, input, value5.current);
                value5.current = input;
              },
              [value3, value4],
            ),
            value7: Dynamic = (0, useMergedRefs)(options, value6),
            value8: Dynamic = (
              <npm_Tabs_C1.Tab
                ref={value7}
                {...props}
                aria-describedby={
                  value2
                    ? [ariaDescribedby, value].filter(Boolean).join(" ")
                    : ariaDescribedby
                }
                className={(0, cn)(
                  tabsListClasses,
                  value2 ? DataDisabledPointerEventsAutoValue : undefined,
                  className,
                )}
                onMouseDown={(0, withSelectionPrevention)(
                  props.onMouseDown,
                )}
              >
                {children}
                {disabledReason !== undefined && (<DisabledReasonDescription
                    id={value}
                    reason={value2 ? disabledReason : undefined}
                  />)}
              </npm_Tabs_C1.Tab>
            );
          return disabledReason === undefined ? (
            value8
          ) : (
            <Tooltip
              content={value2 ? disabledReason : undefined}
              side={disabledReasonSide}
              multiline={true}
              hoverable={false}
              closeOnClick={false}
              openOnHandedBackFocus={true}
            >
              {value8}
            </Tooltip>
          );
        },
      );
      TabsTab.displayName = "Tabs.Tab";
      TabsPanel = (0, reactTabsTabs.forwardRef)(
        (
          { className: className, ...props }: Dynamic,
          options?: Dynamic,
        ): Dynamic => (
          <npm_Tabs_C1.Panel
            ref={options}
            {...props}
            className={(0, cn)(
              "cds-reset outline-none focus-visible:outline-hidden",
              className,
            )}
          />
        ),
      );
      TabsPanel.displayName = "Tabs.Panel";
      TabsRoot = (0, reactTabsTabs.forwardRef)(
        (input?: Dynamic, options?: Dynamic): Dynamic => {
          let {
              value: value,
              defaultValue: value2,
              onValueChange: value3,
            }: Dynamic = input,
            [value4, value5]: Dynamic = (0, reactTabsTabs.useState)(
              value2 === undefined ? 0 : value2,
            ),
            value6: Dynamic = value === undefined ? value4 : value,
            value7: Dynamic = (0, reactTabsTabs.useCallback)(
              (input2?: Dynamic, options2?: Dynamic): Dynamic => {
                value3?.(input2, options2);
                options2.isCanceled || value5(input2);
              },
              [value3],
            ),
            value8: Dynamic = (0, reactTabsTabs.useRef)(new Map()),
            value9: Dynamic = (0, reactTabsTabs.useCallback)(
              (
                input2?: Dynamic,
                options2?: Dynamic,
                context?: Dynamic,
              ): Dynamic => {
                if (options2 === null) {
                  value8.current.get(input2) === context &&
                    value8.current.delete(input2);
                  return;
                }
                value8.current.set(input2, options2);
              },
              [],
            ),
            value10: Dynamic = (0, reactTabsTabs.useCallback)(
              (): Dynamic => value8.current,
              [],
            ),
            value11: Dynamic = (0, reactTabsTabs.useCallback)(
              (input2?: Dynamic): Dynamic => {
                value8.current.get(input2)?.click();
              },
              [],
            ),
            [value12, value13]: Dynamic = (0, reactTabsTabs.useState)(false),
            value14: Dynamic = (0, reactTabsTabs.useMemo)(
              (): Dynamic => ({
                value: value6,
                registerTab: value9,
                tabs: value10,
                activate: value11,
                setCollapsed: value13,
              }),
              [value6, value9, value10, value11],
            ),
            className: Dynamic = input.className;
          return (
            <FlipIndicatorContext.Provider value={value14}>
              <npm_Tabs_C1.Root
                ref={options}
                data-cds={"Tabs"}
                data-collapsed={value12 ? "" : undefined}
                {...input}
                className={
                  typeof className == "function"
                    ? (input2?: Dynamic): Dynamic =>
                        (0, cn)(
                          value12 && "min-w-0 max-w-full",
                          className(input2),
                        )
                    : (0, cn)(
                        value12 && "min-w-0 max-w-full",
                        className,
                      )
                }
                onValueChange={value7}
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
