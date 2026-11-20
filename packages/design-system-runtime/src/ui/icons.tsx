import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type * as C from "../contracts/controls";
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { Button } from "./buttons";
import { Collapsible } from "./disclosure";
import { getResizeObserverConstructor, initializeIconSupport } from "./foundation";
import { cn, Icon, initializeClassNames, initializeIcons, initializePointerDismissal, initializeTranslations, useTranslation } from "./interactions";
import { getDensitySizeIndex, initializeCdsLink, initializeCdsRoot, initializeHrefWhitespace, initializeLinkTargets, useDensity } from "./overlays";

var reactForUiIcons: typeof React;
var REACT_MEMO_SYMBOL: symbol;
var REACT_FORWARD_REF_SYMBOL: symbol;
var pictogramCardRadiusClass: string;
var leadingIconInsetClasses: Record<"glyph" | "text", string>;
var leadingIconOutsetClasses: Record<"glyph" | "text", string>;
var leadingGlyphOutsetClass: string;
var trailingIconOutsetClasses: Record<"glyph" | "text", string>;
var trailingGlyphOutsetClass: string;
var leadingIconSpacingClasses: Record<"glyph" | "text", string>;
var leadingGlyphSpacingClass: string;
var reactZQ: typeof React;
var jsxForUiIcons: typeof import("react/jsx-runtime");
var calloutSizeByDensity: Record<C.Density, C.ControlSize>;
var CALLOUT_PICTOGRAM_SIZE: number;
var calloutVariantClasses: Record<"neutral" | "warning" | "danger", string>;
var calloutTextClasses: Record<"neutral" | "warning" | "danger", string>;
var calloutDefaultIcons: Record<"neutral" | "warning" | "danger", string>;
var reactLinkElements: typeof React;
var jsxGP: typeof import("react/jsx-runtime");
function isPictogramElement(element: React.ReactNode): boolean {
  if (
    !reactForUiIcons.isValidElement(element) ||
    typeof element.type === "string"
  ) {
    return false;
  }
  return isPictogramComponent(element.type as C.PictogramComponent);
}
function isPictogramComponent(
  component: C.PictogramComponent | null | undefined,
): boolean {
  let value = component;
  for (
    let index = 0;
    index < 4 && value !== null && value !== undefined;
    index++
  ) {
    if (value.isCdsPictogram === true) {
      return true;
    }
    let wrappedComponent = value;
    if (wrappedComponent.$$typeof === REACT_MEMO_SYMBOL) {
      value = wrappedComponent.type;
    } else if (wrappedComponent.$$typeof === REACT_FORWARD_REF_SYMBOL) {
      value = wrappedComponent.render;
    } else {
      return false;
    }
  }
  return false;
}
function Callout({
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
}: C.CalloutProps) {
  useUiLocale();
  let value: string = useTranslation("dismiss", "Dismiss"),
    resolvedDismissLabel = dismissLabel ?? value,
    density: C.Density = useDensity(),
    state = {
      "data-step": getDensitySizeIndex(
        density,
        calloutSizeByDensity[density],
      ),
    },
    resolvedVariant = variant ?? "neutral",
    calibrationMode =
      composerCalibration === true
        ? "glyph"
        : composerCalibration === false
          ? undefined
          : composerCalibration,
    usesComposerCalibration = calibrationMode !== undefined,
    hasIcon = icon !== null && icon !== undefined && typeof icon !== "boolean",
    hasPictogram = isPictogramElement(icon),
    hasDetails =
      details !== null &&
      details !== undefined &&
      typeof details !== "boolean",
    calloutRole = role ?? (hasDetails ? "none" : "status"),
    [internalDetailsOpen, setInternalDetailsOpen] = reactZQ.useState(defaultDetailsOpen),
    [isActionWrapped, setIsActionWrapped] = reactZQ.useState(false),
    ref = reactZQ.useRef<HTMLDivElement>(null),
    contentRef = reactZQ.useRef<HTMLDivElement>(null),
    actionRef = reactZQ.useRef<HTMLElement>(null),
    lastWrappedWidthRef = reactZQ.useRef(0),
    hasAction =
      action !== null && action !== undefined && typeof action !== "boolean",
    shouldCenterAction = !hasDetails && (hasPictogram || (actionAlign === "center" && !usesComposerCalibration)),
    detectNextLineAction = shouldCenterAction,
    shouldMeasureAction = !hasDetails && hasAction,
    hasWrappedAction = shouldMeasureAction && isActionWrapped,
    useFullWidthAction = usesComposerCalibration && hasWrappedAction && !shouldCenterAction;
  reactZQ.useLayoutEffect(() => {
    if (!usesComposerCalibration || !shouldMeasureAction || detectNextLineAction) {
      lastWrappedWidthRef.current = 0;
    }
    if (!shouldMeasureAction) {
      return;
    }
    let current = ref.current,
      ResizeObserverClass: typeof ResizeObserver | undefined = getResizeObserverConstructor(current);
    if (current === null || ResizeObserverClass === undefined) {
      return;
    }
    let measureActionWrapping = () => {
      if (useFullWidthAction) {
        if (current.offsetWidth > lastWrappedWidthRef.current + CALLOUT_PICTOGRAM_SIZE) {
          setIsActionWrapped(false);
        }
        return;
      }
      let measuredContent = contentRef.current,
        measuredAction = actionRef.current;
      if (measuredContent === null || measuredAction === null) {
        return;
      }
      let lineHeight = Number.parseFloat(getComputedStyle(measuredContent).lineHeight);
      if (!Number.isFinite(lineHeight) || lineHeight <= 0) {
        return;
      }
      let top = measuredAction.getBoundingClientRect().top,
        bounds = measuredContent.getBoundingClientRect();
      if (detectNextLineAction && bounds.height === 0) {
        return;
      }
      let actionWraps = detectNextLineAction
        ? top >= bounds.bottom - 1
        : top - bounds.top > lineHeight / 2;
      if (actionWraps && usesComposerCalibration && !detectNextLineAction) {
        lastWrappedWidthRef.current = current.offsetWidth;
      }
      setIsActionWrapped(actionWraps);
    };
    measureActionWrapping();
    let resizeObserver = new ResizeObserverClass(measureActionWrapping);
    resizeObserver.observe(current);
    let contentElement = contentRef.current;
    if (detectNextLineAction && contentElement !== null) {
      resizeObserver.observe(contentElement);
    }
    return () => resizeObserver.disconnect();
  }, [shouldMeasureAction, usesComposerCalibration, useFullWidthAction, detectNextLineAction]);
  let resolvedDetailsOpen = detailsOpen ?? internalDetailsOpen,
    callback = (nextOpen: boolean) => {
      setInternalDetailsOpen(nextOpen);
      onDetailsOpenChange?.(nextOpen);
    },
    useInlineIcon = hasDetails || !hasPictogram,
    actionElement = action ? (
      <span
        ref={actionRef}
        {...state}
        className={cn(
          "flex shrink-0 items-center gap-xs",
          !hasWrappedAction && "h-[1lh]",
          useFullWidthAction && "basis-full",
          !hasWrappedAction && "-ms-[2px]",
          useFullWidthAction && calibrationMode && leadingIconOutsetClasses[calibrationMode],
          calibrationMode !== undefined &&
            !onDismiss &&
            leadingIconSpacingClasses[calibrationMode],
          !usesComposerCalibration && !onDismiss && "-me-[calc(var(--cds-pad-md)-2px)]",
        )}
      >
        {action}
      </span>
    ) : null;
  return (
    <div
      data-cds={"Banner"}
      data-icon-layout={useInlineIcon ? "first-line" : "centered"}
      data-cta-layout={useFullWidthAction ? "stacked" : hasWrappedAction ? "wrapped" : "inline"}
      data-action-align={shouldCenterAction ? "center" : "first-line"}
      data-composer-keyline={calibrationMode}
      data-testid={dataTestid}
      role={calloutRole === "none" ? undefined : calloutRole}
      ref={ref}
      className={cn(
        "flex",
        useInlineIcon ? "items-start" : "items-center",
        "gap-xs py-md font-sans text-body font-normal",
        usesComposerCalibration ? "px-md" : "px-lg",
        hasWrappedAction && !useFullWidthAction && "pb-lg",
        usesComposerCalibration ? pictogramCardRadiusClass : "rounded-card",
        calloutVariantClasses[resolvedVariant],
        className,
      )}
    >
      {[icon !== null && !useFullWidthAction && (
          <span
            className={cn(
              useInlineIcon ? "flex min-h-[1lh] shrink-0 items-center" : "shrink-0",
              calloutTextClasses[resolvedVariant],
              usesComposerCalibration && "ms-[4px] -me-[4px]",
            )}
          >
            {hasIcon ? (icon) : (<Icon
                name={calloutDefaultIcons[resolvedVariant]}
                size={"auto"}
              />)}
          </span>
        ), hasDetails ? (
          <div
            className={cn(
              "flex min-w-0 flex-1 flex-col",
              calibrationMode && leadingIconInsetClasses[calibrationMode],
            )}
          >
            <Collapsible.Root
              className={"contents"}
              open={resolvedDetailsOpen}
              onOpenChange={callback}
            >
              {[<div
                  className={
                    "flex min-w-0 flex-wrap items-start gap-y-sm gap-x-md"
                  }
                >
                  {[<Collapsible.Trigger
                      render={
                        <button
                          type={"button"}
                          className={
                            "cds-reset flex min-w-0 grow select-none items-center gap-x-[2px] border-0 text-start outline-none focus-visible:shadow-focus focus-visible:outline-hidden rounded transition-shadow duration-fast"
                          }
                        >
                          {[<div className={"min-w-0"}>{children}</div>, <Icon
                              name={"CaretDown"}
                              size={"sm"}
                              className={`shrink-0 text-secondary transition-transform ${resolvedDetailsOpen ? "rotate-0" : "-rotate-90 rtl:rotate-90"}`}
                            />]}
                        </button>
                      }
                    />, actionElement]}
                </div>, <Collapsible.Panel
                  className={"w-full text-secondary"}
                >
                  <div className={"pt-[var(--cds-gap-sm)]"}>{details}</div>
                </Collapsible.Panel>]}
            </Collapsible.Root>
          </div>
        ) : (
          <div
            className={cn(
              "flex min-w-0 flex-wrap",
              shouldCenterAction ? "items-center" : "items-start",
              "gap-y-sm gap-x-md flex-1",
              useFullWidthAction && "gap-y-xs",
              calibrationMode && leadingIconInsetClasses[calibrationMode],
            )}
          >
            {[<div
                ref={contentRef}
                className={
                  !shouldCenterAction
                    ? "max-w-full min-w-0 flex-auto"
                    : usesComposerCalibration && hasPictogram
                      ? "min-w-[min(40ch,100%)] flex-1"
                      : "min-w-[min(20ch,100%)] flex-1"
                }
              >
                {children}
              </div>, actionElement]}
          </div>
        ), onDismiss && (
          <span
            {...state}
            className={`${calibrationMode !== undefined ? trailingIconOutsetClasses[calibrationMode] : "-me-[calc(var(--cds-pad-md)-2px)]"} flex h-[1lh] shrink-0 items-center`}
          >
            <Button
              variant={"ghost"}
              iconOnly={true}
              icon={"X"}
              aria-label={resolvedDismissLabel}
              tooltip={false}
              onClick={onDismiss}
            />
          </span>
        )]}
    </div>
  );
}
export {
  Callout,
  CALLOUT_PICTOGRAM_SIZE,
  calloutDefaultIcons,
  calloutSizeByDensity,
  calloutTextClasses,
  calloutVariantClasses,
  isPictogramComponent,
  isPictogramElement,
  jsxForUiIcons,
  jsxGP,
  leadingGlyphOutsetClass,
  leadingGlyphSpacingClass,
  leadingIconInsetClasses,
  leadingIconOutsetClasses,
  leadingIconSpacingClasses,
  pictogramCardRadiusClass,
  REACT_FORWARD_REF_SYMBOL,
  REACT_MEMO_SYMBOL,
  reactForUiIcons,
  reactLinkElements,
  reactZQ,
  trailingGlyphOutsetClass,
  trailingIconOutsetClasses,
};
export function installUiIcons(): () => void {
  return () => {
    initializeClassNames();
    initializeTranslations();
    initializeCdsRoot();
    initializeIconSupport();
    initializeIcons();
    reactForUiIcons = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    REACT_MEMO_SYMBOL = Symbol.for("react.memo");
    REACT_FORWARD_REF_SYMBOL = Symbol.for("react.forward_ref");
    pictogramCardRadiusClass = "rounded-composer";
    leadingIconInsetClasses = {
      glyph: "ml-[6px] compact:ml-[6px] comfortable:ml-[4px]",
      text: "ml-[4px] compact:ml-[4px] comfortable:ml-[2px]",
    };
    leadingIconOutsetClasses = {
      glyph: "-ml-[6px] compact:-ml-[6px] comfortable:-ml-[4px]",
      text: "-ml-[4px] compact:-ml-[4px] comfortable:-ml-[2px]",
    };
    leadingGlyphOutsetClass = leadingIconInsetClasses.glyph;
    trailingIconOutsetClasses = {
      glyph: "-mr-[4px]",
      text: "-mr-[2px] compact:-mr-[2px] comfortable:-mr-[4px]",
    };
    trailingGlyphOutsetClass = trailingIconOutsetClasses.glyph;
    leadingIconSpacingClasses = {
      glyph:
        "me-[calc(8px-var(--cds-pad-md))] compact:me-[calc(8px-var(--cds-pad-md))] comfortable:me-[calc(4px-var(--cds-pad-md))]",
      text: "me-[calc(6px-var(--cds-pad-md))] compact:me-[calc(6px-var(--cds-pad-md))] comfortable:me-[calc(5px-var(--cds-pad-md))]",
    };
    leadingGlyphSpacingClass = leadingIconSpacingClasses.glyph;
    reactZQ = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxForUiIcons = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    calloutSizeByDensity = {
      comfortable: "sm",
      compact: "base",
    };
    CALLOUT_PICTOGRAM_SIZE = 64;
    calloutVariantClasses = {
      neutral:
        "bg-surface-1 text-primary shadow-card-ring [--cds-prose-code-color:var(--cds-text-danger)] [--cds-prose-marker-color:var(--cds-text-secondary)]",
      warning:
        "bg-warning text-warning shadow-ring-warning [--cds-prose-code-color:currentColor] [--cds-prose-marker-color:currentColor]",
      danger:
        "bg-danger text-danger shadow-ring-danger [--cds-prose-code-color:currentColor] [--cds-prose-marker-color:currentColor]",
    };
    calloutTextClasses = {
      neutral: "text-secondary",
      warning: "",
      danger: "",
    };
    calloutDefaultIcons = {
      neutral: "Info",
      warning: "Warning",
      danger: "Warning",
    };
    initializeClassNames();
    initializeHrefWhitespace();
    initializeLinkTargets();
    initializeCdsLink();
    initializePointerDismissal();
    initializeIcons();
    initializeCdsLink();
    reactLinkElements = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxGP = toModuleNamespace(loadJsxNamespace(), 1);
  };
}
