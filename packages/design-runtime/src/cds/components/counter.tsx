import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Button, initializeButtonButton } from "../button/button";
import { ComponentsCollapsibleRootTriggerPanelConfig, initializeComponentsCollapsible } from "./collapsible";
import { Icon, initializeIconSizeMetrics, isIconName } from "./icon";
import { initializeLinkRouter, pickRouterOptions, routerOptionKeys, useLinkProps } from "../links";
import { initializeLabelsProviderContext, useLabel } from "../sheets/styles";
import { cn, initializeClassNames } from "../theme/class-names";
import { getControlSizeRank, getSizeAttribute, initializeCdsRoot, useDensity } from "../theme/root";
import { getResizeObserver, initializeTooltipTriggerPlaceholder } from "../tooltip/trigger";
import { initializeNpm__base_ui_react_R9e, initializeNpm__base_ui_react_SY, load_react, load_react_jsx_runtime, npm_Button_Dye as R_npm_Button_Dye, npm_useRender_LL } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactComponentsCounter: Dynamic;
var ComponentsCounterForValue: Dynamic;
var ComponentsCounterForwardRefSymbol: Dynamic;
var initializeComponentsCounter: Dynamic;
var ComponentsCounterClassNames: Dynamic;
var initializeCounterRadiusClassName: Dynamic;
var reactForCounter: Dynamic;
var jsxComponentsCounter: Dynamic;
var ComponentsCounterNeutralAccentSuccessConfig: Dynamic;
var ComponentsCounterDotVariantClassNames: Dynamic;
var Counter: Dynamic;
var initializeCounter: Dynamic;
var ComponentsCounterGlyphTextConfig: Dynamic;
var ComponentsCounterActionStartMarginClassNames: Dynamic;
var ComponentsCounterGlyphValue: Dynamic;
var ComponentsCounterDismissMarginClassNames: Dynamic;
var ComponentsCounterDismissGlyphMarginClassName: Dynamic;
var ComponentsCounterActionEndMarginClassNames: Dynamic;
var ComponentsCounterActionEndGlyphMarginClassName: Dynamic;
var initializeCounterMarginClassNames: Dynamic;
var reactForAlert: Dynamic;
var jsxForCounter: Dynamic;
var ComponentsCounterComfortableCompactConfig: Dynamic;
var ComponentsCounterConstant: Dynamic;
var ComponentsCounterNeutralWarningDangerConfig: Dynamic;
var ComponentsCounterIconClassNames: Dynamic;
var ComponentsCounterIconNames: Dynamic;
var initializeAlert: Dynamic;
var reactForLinkElement: Dynamic;
var jsxForLinkElement: Dynamic;
var ComponentsCounterHrefRouterOptionsTargetValues: Dynamic;
var initializeLinkElement: Dynamic;
function isPictogramElement(element?: Dynamic): Dynamic {
  return !(0, reactComponentsCounter.isValidElement)(element) ||
    typeof element.type == "string"
    ? false
    : isCdsPictogram(element.type);
}
function isCdsPictogram(component?: Dynamic): Dynamic {
  let current: Dynamic = component;
  for (
    let index: Dynamic = 0;
    index < 4 && current !== null && current !== undefined;
    index++
  ) {
    if (current.isCdsPictogram === true) return true;
    let wrapper: Dynamic = current;
    if (wrapper.$$typeof === ComponentsCounterForValue) current = wrapper.type;
    else if (wrapper.$$typeof === ComponentsCounterForwardRefSymbol)
      current = wrapper.render;
    else return false;
  }
  return false;
}
function Alert({
  variant: variant,
  icon: icon,
  action: action,
  actionAlign = "first-line",
  details: details,
  defaultDetailsOpen = false,
  detailsOpen: detailsOpen,
  onDetailsOpenChange: onDetailsOpenChange,
  onDismiss: onDismiss,
  dismissLabel: dismissLabel,
  role: role,
  composerCalibration: composerCalibration,
  className: className,
  "data-testid": dataTestid,
  children: children,
}: Dynamic): Dynamic {
  useUiLocale();
  let defaultDismissLabel: Dynamic = useLabel("dismiss", "Dismiss"),
    resolvedDismissLabel: Dynamic = dismissLabel ?? defaultDismissLabel,
    density: Dynamic = useDensity(),
    state: Dynamic = {
      "data-step": getControlSizeRank(
        density,
        ComponentsCounterComfortableCompactConfig[density],
      ),
    },
    resolvedVariant: Dynamic = variant ?? "neutral",
    composerKeyline: Dynamic =
      composerCalibration === true
        ? "glyph"
        : composerCalibration === false
          ? undefined
          : composerCalibration,
    hasComposerKeyline: Dynamic = composerKeyline !== undefined,
    hasCustomIcon: Dynamic = icon != null && typeof icon != "boolean",
    isPictogramIcon: Dynamic = isPictogramElement(icon),
    hasDetails: Dynamic = details != null && typeof details != "boolean",
    resolvedRole: Dynamic = role ?? (hasDetails ? "none" : "status"),
    [uncontrolledDetailsOpen, setUncontrolledDetailsOpen]: Dynamic = (0, reactForAlert.useState)(
      defaultDetailsOpen,
    ),
    [isActionWrapped, setIsActionWrapped]: Dynamic = (0, reactForAlert.useState)(
      false,
    ),
    bannerRef: Dynamic = (0, reactForAlert.useRef)(null),
    contentRef: Dynamic = (0, reactForAlert.useRef)(null),
    actionRef: Dynamic = (0, reactForAlert.useRef)(null),
    stackedWidthRef: Dynamic = (0, reactForAlert.useRef)(0),
    hasAction: Dynamic = action != null && typeof action != "boolean",
    isActionCentered: Dynamic =
      !hasDetails && (isPictogramIcon || (actionAlign === "center" && !hasComposerKeyline)),
    canWrapAction: Dynamic = !hasDetails && !isActionCentered && hasAction,
    isWrappedLayout: Dynamic = canWrapAction && isActionWrapped,
    isStackedLayout: Dynamic = hasComposerKeyline && isWrappedLayout;
  (0, reactForAlert.useLayoutEffect)((): Dynamic => {
    (!hasComposerKeyline || !canWrapAction) && (stackedWidthRef.current = 0);
    if (!canWrapAction) return;
    let bannerNode: Dynamic = bannerRef.current,
      ResizeObserverClass: Dynamic = getResizeObserver(bannerNode);
    if (bannerNode === null || ResizeObserverClass === undefined) return;
    let measureLayout: Dynamic = (): Dynamic => {
      if (isStackedLayout) {
        bannerNode.offsetWidth > stackedWidthRef.current + ComponentsCounterConstant &&
          setIsActionWrapped(false);
        return;
      }
      let contentNode: Dynamic = contentRef.current,
        actionNode: Dynamic = actionRef.current;
      if (contentNode === null || actionNode === null) return;
      let lineHeight: Dynamic = Number.parseFloat(
        getComputedStyle(contentNode).lineHeight,
      );
      if (!Number.isFinite(lineHeight) || lineHeight <= 0) return;
      let isActionBelowFirstLine: Dynamic =
        actionNode.getBoundingClientRect().top -
          contentNode.getBoundingClientRect().top >
        lineHeight / 2;
      isActionBelowFirstLine && hasComposerKeyline && (stackedWidthRef.current = bannerNode.offsetWidth);
      setIsActionWrapped(isActionBelowFirstLine);
    };
    measureLayout();
    let observer: Dynamic = new ResizeObserverClass(measureLayout);
    observer.observe(bannerNode);
    return (): Dynamic => observer.disconnect();
  }, [canWrapAction, hasComposerKeyline, isStackedLayout]);
  let isDetailsOpen: Dynamic = detailsOpen ?? uncontrolledDetailsOpen,
    handleDetailsOpenChange: Dynamic = (nextOpen?: Dynamic): Dynamic => {
      setUncontrolledDetailsOpen(nextOpen);
      onDetailsOpenChange?.(nextOpen);
    },
    isIconOnFirstLine: Dynamic = hasDetails || !isPictogramIcon,
    actionSlot: Dynamic = action ? (
      <span
        ref={actionRef}
        {...state}
        className={cn(
          "flex shrink-0 items-center gap-xs",
          !isWrappedLayout && "h-[1lh]",
          isStackedLayout && "basis-full",
          !isWrappedLayout && "-ms-[2px]",
          isStackedLayout && composerKeyline && ComponentsCounterActionStartMarginClassNames[composerKeyline],
          composerKeyline !== undefined &&
            !onDismiss &&
            ComponentsCounterActionEndMarginClassNames[composerKeyline],
          !hasComposerKeyline && !onDismiss && "-me-[calc(var(--cds-pad-md)-2px)]",
        )}
      >
        {action}
      </span>
    ) : null;
  return (
    <div
      data-cds={"Banner"}
      data-icon-layout={isIconOnFirstLine ? "first-line" : "centered"}
      data-cta-layout={isStackedLayout ? "stacked" : isWrappedLayout ? "wrapped" : "inline"}
      data-action-align={isActionCentered ? "center" : "first-line"}
      data-composer-keyline={composerKeyline}
      data-testid={dataTestid}
      role={resolvedRole === "none" ? undefined : resolvedRole}
      ref={bannerRef}
      className={cn(
        "flex",
        isIconOnFirstLine ? "items-start" : "items-center",
        "gap-xs py-md font-sans text-body font-normal",
        hasComposerKeyline ? "px-md" : "px-lg",
        isWrappedLayout && !isStackedLayout && "pb-lg",
        hasComposerKeyline ? ComponentsCounterClassNames : "rounded-card",
        ComponentsCounterNeutralWarningDangerConfig[resolvedVariant],
        className,
      )}
    >
      {icon !== null && !isStackedLayout && (<span
          className={cn(
            isIconOnFirstLine ? "flex min-h-[1lh] shrink-0 items-center" : "shrink-0",
            ComponentsCounterIconClassNames[resolvedVariant],
            hasComposerKeyline && "ms-[4px] -me-[4px]",
          )}
        >
          {hasCustomIcon ? (icon) : (<Icon
              name={ComponentsCounterIconNames[resolvedVariant]}
              size={"auto"}
            />)}
        </span>)}
      {hasDetails ? (<div
          className={cn(
            "flex min-w-0 flex-1 flex-col",
            composerKeyline && ComponentsCounterGlyphTextConfig[composerKeyline],
          )}
        >
          <ComponentsCollapsibleRootTriggerPanelConfig.Root
            className={"contents"}
            open={isDetailsOpen}
            onOpenChange={handleDetailsOpenChange}
          >
            <div
              className={
                "flex min-w-0 flex-wrap items-start gap-y-sm gap-x-md"
              }
            >
              <ComponentsCollapsibleRootTriggerPanelConfig.Trigger
                render={
                  <button
                    type={"button"}
                    className={
                      "cds-reset flex min-w-0 grow select-none items-center gap-x-[2px] border-0 text-start outline-none focus-visible:shadow-focus focus-visible:outline-hidden rounded transition-shadow duration-fast"
                    }
                  >
                    <div className={"min-w-0"}>{children}</div>
                    <Icon
                      name={"CaretDown"}
                      size={"sm"}
                      className={`shrink-0 text-secondary transition-transform ${isDetailsOpen ? "rotate-0" : "-rotate-90"}`}
                    />
                  </button>
                }
              />
              {actionSlot}
            </div>
            <ComponentsCollapsibleRootTriggerPanelConfig.Panel
              className={"w-full text-secondary"}
            >
              <div className={"pt-[var(--cds-gap-sm)]"}>{details}</div>
            </ComponentsCollapsibleRootTriggerPanelConfig.Panel>
          </ComponentsCollapsibleRootTriggerPanelConfig.Root>
        </div>) : (<div
          className={cn(
            "flex min-w-0 flex-wrap",
            isActionCentered ? "items-center" : "items-start",
            "gap-y-sm gap-x-md flex-1",
            isStackedLayout && "gap-y-xs",
            composerKeyline && ComponentsCounterGlyphTextConfig[composerKeyline],
          )}
        >
          <div
            ref={contentRef}
            className={
              isActionCentered
                ? "min-w-[min(20ch,100%)] flex-1"
                : "max-w-full min-w-0 flex-auto"
            }
          >
            {children}
          </div>
          {actionSlot}
        </div>)}
      {onDismiss && (<span
          {...state}
          className={`${composerKeyline !== undefined ? ComponentsCounterDismissMarginClassNames[composerKeyline] : "-me-[calc(var(--cds-pad-md)-2px)]"} flex h-[1lh] shrink-0 items-center`}
        >
          <Button
            variant={"ghost"}
            iconOnly={true}
            icon={"X"}
            aria-label={resolvedDismissLabel}
            tooltip={false}
            onClick={onDismiss}
          />
        </span>)}
    </div>
  );
}
function omitProperties(source?: Dynamic, omittedKeys?: Dynamic): Dynamic {
  let sourceProps: Dynamic = source,
    state: Dynamic = {};
  for (let key of Object.keys(sourceProps) as Dynamic)
    omittedKeys.includes(key) || (state[key] = sourceProps[key]);
  return state;
}
function LinkElement({
  stamp: stamp,
  forwardedRef: forwardedRef,
  linkInput: linkInput,
  render: render,
  body: body,
  className: className,
  actionClassName: actionClassName,
  actionDisabled: actionDisabled,
  rest: rest,
}: Dynamic): Dynamic {
  useUiLocale();
  let isRenderElement: Dynamic = (0, reactForLinkElement.isValidElement)(render),
    routerLinkProps: Dynamic = useLinkProps({
      ...linkInput,
      ...pickRouterOptions(rest),
      href: isRenderElement ? undefined : linkInput.href,
    }),
    elementProps: Dynamic = omitProperties(rest, [
      ...ComponentsCounterHrefRouterOptionsTargetValues,
      "disabled",
    ]),
    renderedElement: Dynamic = npm_useRender_LL({
      enabled: isRenderElement,
      render: render,
      ref: forwardedRef,
      props: {
        ...elementProps,
        ...stamp,
        className: className,
        children: body,
      },
    });
  if (isRenderElement) return renderedElement;
  if (linkInput.href !== undefined) {
    let anchorProps: Dynamic = omitProperties(rest, [
      ...ComponentsCounterHrefRouterOptionsTargetValues,
      ...routerOptionKeys,
    ]);
    return (
      <a
        ref={forwardedRef}
        {...stamp}
        {...anchorProps}
        {...routerLinkProps}
        className={className}
      >
        {body}
      </a>
    );
  }
  let buttonProps: Dynamic = omitProperties(rest, ["href", "disabled"]);
  return (
    <R_npm_Button_Dye
      render={<span {...stamp} />}
      nativeButton={false}
      {...(actionDisabled !== undefined
        ? {
            disabled: actionDisabled,
          }
        : {})}
      ref={forwardedRef}
      {...buttonProps}
      className={actionClassName}
    >
      {body}
    </R_npm_Button_Dye>
  );
}
function TextLinkIcon(icon?: Dynamic): Dynamic {
  useUiLocale();
  return isIconName(icon) ? (
    <Icon
      name={icon}
      size={"sm"}
      className={"self-center"}
      style={{
        fontSize: "1lh",
      }}
    />
  ) : (
    <span className={"self-center"}>{icon}</span>
  );
}
export {
  Alert,
  ComponentsCounterClassNames,
  ComponentsCounterComfortableCompactConfig,
  ComponentsCounterConstant,
  ComponentsCounterForValue,
  ComponentsCounterGlyphTextConfig,
  ComponentsCounterGlyphValue,
  ComponentsCounterHrefRouterOptionsTargetValues,
  ComponentsCounterNeutralAccentSuccessConfig,
  ComponentsCounterNeutralWarningDangerConfig,
  Counter,
  initializeComponentsCounter,
  initializeCounterRadiusClassName,
  initializeCounter,
  initializeCounterMarginClassNames,
  initializeAlert,
  initializeLinkElement,
  isCdsPictogram,
  isPictogramElement,
  jsxComponentsCounter,
  jsxForCounter,
  jsxForLinkElement,
  LinkElement,
  omitProperties,
  reactComponentsCounter,
  reactForCounter,
  reactForAlert,
  reactForLinkElement,
  TextLinkIcon,
};
export function installCdsComponentsCounter(): () => void {
  return () => {
    initializeComponentsCounter = initializeOnce((): Dynamic => {
      reactComponentsCounter = toModuleNamespace(
        load_react(),
      );
      ComponentsCounterForValue = Symbol.for("react.memo");
      ComponentsCounterForwardRefSymbol = Symbol.for("react.forward_ref");
    });
    initializeCounterRadiusClassName = initializeOnce((): Dynamic => {
      ComponentsCounterClassNames = "rounded-composer";
    });
    initializeCounter = initializeOnce((): Dynamic => {
      "use client";

      initializeClassNames();
      initializeCdsRoot();
      reactForCounter = toModuleNamespace(
        load_react(),
      );
      jsxComponentsCounter = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      ComponentsCounterNeutralAccentSuccessConfig = {
        neutral: "bg-neutral text-secondary",
        accent: "bg-fill-accent text-on-accent",
        success: "bg-green-500 text-gray-0",
        warning: "bg-fill-warning text-yellow-750",
        danger: "bg-fill-danger text-on-danger",
      };
      ComponentsCounterDotVariantClassNames = {
        neutral: "bg-fill-control",
        accent: "bg-fill-accent",
        success: "bg-green-500",
        warning: "bg-fill-warning",
        danger: "bg-fill-danger",
      };
      Counter = (0, reactForCounter.forwardRef)(
        (
          {
            value: count,
            max = 99,
            showZero = false,
            dot: isDot = false,
            variant = "danger",
            size: size,
            className: className,
            ...props
          }: Dynamic,
          forwardedRef?: Dynamic,
        ): Dynamic => {
          if (isDot)
            return (
              <span
                ref={forwardedRef}
                data-cds={"Counter"}
                aria-hidden={"true"}
                {...props}
                className={cn(
                  "inline-block size-2 shrink-0 rounded-full align-middle",
                  ComponentsCounterDotVariantClassNames[variant],
                  className,
                )}
              />
            );
          if (!Number.isFinite(count)) return null;
          let clampedCount: Dynamic = Math.max(0, Math.floor(count));
          if (clampedCount === 0 && !showZero) return null;
          let label: Dynamic = clampedCount > max ? `${max}+` : `${clampedCount}`;
          return (
            <span
              ref={forwardedRef}
              data-cds={"Counter"}
              {...getSizeAttribute(size)}
              {...props}
              className={cn(
                "inline-flex shrink-0 items-center justify-center align-middle",
                "h-control-nested min-w-[var(--cds-h-control-nested)] rounded-full",
                label.length === 1
                  ? "px-0"
                  : "px-[calc(var(--cds-h-control-nested)*0.3)]",
                "font-sans text-caption font-medium proportional-nums",
                ComponentsCounterNeutralAccentSuccessConfig[variant],
                className,
              )}
            >
              {label}
            </span>
          );
        },
      );
      Counter.displayName = "Counter";
    });
    initializeCounterMarginClassNames = initializeOnce((): Dynamic => {
      ComponentsCounterGlyphTextConfig = {
        glyph: "ml-[6px] compact:ml-[6px] comfortable:ml-[4px]",
        text: "ml-[4px] compact:ml-[4px] comfortable:ml-[2px]",
      };
      ComponentsCounterActionStartMarginClassNames = {
        glyph: "-ml-[6px] compact:-ml-[6px] comfortable:-ml-[4px]",
        text: "-ml-[4px] compact:-ml-[4px] comfortable:-ml-[2px]",
      };
      ComponentsCounterGlyphValue = ComponentsCounterGlyphTextConfig.glyph;
      ComponentsCounterDismissMarginClassNames = {
        glyph: "-mr-[4px]",
        text: "-mr-[2px] compact:-mr-[2px] comfortable:-mr-[4px]",
      };
      ComponentsCounterDismissGlyphMarginClassName = ComponentsCounterDismissMarginClassNames.glyph;
      ComponentsCounterActionEndMarginClassNames = {
        glyph:
          "me-[calc(8px-var(--cds-pad-md))] compact:me-[calc(8px-var(--cds-pad-md))] comfortable:me-[calc(4px-var(--cds-pad-md))]",
        text: "me-[calc(6px-var(--cds-pad-md))] compact:me-[calc(6px-var(--cds-pad-md))] comfortable:me-[calc(5px-var(--cds-pad-md))]",
      };
      ComponentsCounterActionEndGlyphMarginClassName = ComponentsCounterActionEndMarginClassNames.glyph;
    });
    initializeAlert = initializeOnce((): Dynamic => {
      "use client";

      initializeClassNames();
      initializeLabelsProviderContext();
      initializeCdsRoot();
      initializeIconSizeMetrics();
      initializeTooltipTriggerPlaceholder();
      initializeComponentsCollapsible();
      initializeButtonButton();
      initializeComponentsCounter();
      initializeCounterRadiusClassName();
      initializeCounterMarginClassNames();
      reactForAlert = toModuleNamespace(
        load_react(),
      );
      jsxForCounter = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      ComponentsCounterComfortableCompactConfig = {
        comfortable: "sm",
        compact: "base",
      };
      ComponentsCounterConstant = 64;
      ComponentsCounterNeutralWarningDangerConfig = {
        neutral:
          "bg-surface-1 text-primary shadow-card-ring [--cds-prose-code-color:var(--cds-text-danger)] [--cds-prose-marker-color:var(--cds-text-secondary)]",
        warning:
          "bg-warning text-warning shadow-ring-warning [--cds-prose-code-color:currentColor] [--cds-prose-marker-color:currentColor]",
        danger:
          "bg-danger text-danger shadow-ring-danger [--cds-prose-code-color:currentColor] [--cds-prose-marker-color:currentColor]",
      };
      ComponentsCounterIconClassNames = {
        neutral: "text-secondary",
        warning: "",
        danger: "",
      };
      ComponentsCounterIconNames = {
        neutral: "Info",
        get warning() { return uiMessage("canvas.counter.warning"); },
        get danger() { return uiMessage("canvas.counter.warning"); },
      };
    });
    initializeLinkElement = initializeOnce((): Dynamic => {
      "use client";

      initializeLinkRouter();
      initializeNpm__base_ui_react_SY();
      reactForLinkElement = toModuleNamespace(
        load_react(),
      );
      jsxForLinkElement = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializeNpm__base_ui_react_R9e();
      ComponentsCounterHrefRouterOptionsTargetValues = [
        "href",
        "routerOptions",
        "target",
        "rel",
        "download",
      ];
    });
  };
}
