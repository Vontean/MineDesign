import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { useButtonAnimation } from "../button/context";
import { Icon } from "./icon";
import { AspectSquareValue, ComponentsSelectionRingClassNames, ComponentsSelectionRingClassNames_2, ComponentsSelectionRingClassNames_3, ComponentsSelectionRingClassNames_4, ComponentsSelectionRingClassNames_5, ComponentsSelectionRingClassNames_6, ComponentsSelectionRingConstant, ComponentsSelectionRingConstant_2 as ComponentsSelectionRingUnscaledStillFrames, ComponentsSelectionRingLabel, ComponentsSelectionRingLabel_2 as thumbShadowClasses, ComponentsSelectionRingLimit, HFullValue, reactComponentsSelectionRing, selectionRingClasses } from "./selection-ring";
import { getConnectedOwnerWindow, getOwnerWindow } from "../dom/owner-window";
import { withSelectionPrevention } from "../dom/selection-prevention";
import { isInsideField } from "../field/context";
import { initializeHooksLayoutEffect, useIsomorphicLayoutEffect } from "../hooks/layout-effect";
import { animateFlipIndicator, hasFlipAnimation, isFlipIndicatorEntering, seekFlipAnimation } from "../switch/context";
import { cn, initializeClassNames } from "../theme/class-names";
import { getSizeAttribute } from "../theme/root";
import { DisabledReasonTooltip, Tooltip, TooltipGroup, useTooltipGroup } from "../tooltip/tooltip";
import { getResizeObserver } from "../tooltip/trigger";
import { initializeNpm_clsx_xh, load_react, load_react_jsx_runtime, npm_clsx_Ea, npm_LabelableProvider_NR, npm_Radio_iP, npm_RadioGroup_uF as R_npm_RadioGroup_uF } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactComponentsSelectionPoints: Dynamic;
var jsxComponentsSelectionPoints: Dynamic;
var ComponentsSelectionPointsLimit: Dynamic;
var ComponentsSelectionPointsConstant: Dynamic;
var ComponentsSelectionPointsShiftStep: Dynamic;
var ComponentsSelectionPointsInlineStartInlineEndTopConfig: Dynamic;
var ComponentsSelectionPointsComponent: Dynamic;
var initializeComponentsSelectionPoints: Dynamic;
function SegmentedControl({
  segments: segments,
  value: selectedValue,
  onChange: onChange,
  variant = "contained",
  size: size,
  fullWidth = false,
  disabled: isDisabled,
  tooltipSide: tooltipSide,
  tooltipClassName: tooltipClassName,
  "aria-label": ariaLabel,
  "aria-required": ariaRequired,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedby,
  thumbPosition: thumbPosition,
  className: className,
}: Dynamic): Dynamic {
  useUiLocale();
  let rootRef: Dynamic = (0, reactComponentsSelectionRing.useRef)(
    null,
  );
  useButtonAnimation(rootRef, "SegmentedControl");
  let indicatorRef: Dynamic = (0, reactComponentsSelectionRing.useRef)(
      null,
    ),
    isInField: Dynamic = isInsideField(),
    flipStateRef: Dynamic = (0, reactComponentsSelectionRing.useRef)({
      live: false,
      poll: null,
    }),
    syncIndicator: Dynamic = (0, reactComponentsSelectionRing.useCallback)(
      function syncIndicatorFrame(isCorrection: Dynamic = false): Dynamic {
        let rootNode: Dynamic = rootRef.current,
          indicatorNode: Dynamic = indicatorRef.current;
        if (!rootNode || !indicatorNode) return;
        let element: Dynamic = rootNode.querySelector("[data-checked]"),
          rootMeasure: Dynamic = element ? scaledContainerWidth(rootNode) : null;
        if (
          !isCorrection ||
          !(rootMeasure?.scaled || isFlipIndicatorEntering(indicatorNode))
        ) {
          let checkedBounds: Dynamic = element
            ? relativeIndicatorBounds(element, rootNode)
            : null;
          animateFlipIndicator(indicatorNode, rootNode, checkedBounds, {
            correction: isCorrection,
          });
        }
        if (!flipStateRef.current.live) return;
        let poll: Dynamic = flipStateRef.current.poll;
        poll?.cancel();
        flipStateRef.current.poll = null;
        if (!rootMeasure || (!isCorrection && !poll && !rootMeasure.scaled)) return;
        let {
          width: lastWidth,
          still: stillFrames,
          frames: frameCount,
        }: Dynamic = poll ?? {
          width: rootMeasure.width,
          still: 0,
          frames: 0,
        };
        if (
          isCorrection &&
          ((stillFrames = lastWidth === rootMeasure.width ? stillFrames + 1 : 0),
          (lastWidth = rootMeasure.width),
          (frameCount += 1),
          stillFrames >=
            (rootMeasure.scaled
              ? ComponentsSelectionRingConstant
              : ComponentsSelectionRingUnscaledStillFrames) ||
            frameCount >= ComponentsSelectionRingLimit)
        )
          return;
        let cancelFrame: Dynamic = requestElementAnimationFrame(
          rootNode,
          (): Dynamic => syncIndicatorFrame(true),
        );
        cancelFrame &&
          (flipStateRef.current.poll = {
            cancel: cancelFrame,
            width: lastWidth,
            still: stillFrames,
            frames: frameCount,
          });
      },
      [],
    ),
    segmentValuesKey: Dynamic = segments
      .map((segment?: Dynamic): Dynamic => segment.value)
      .join("\0");
  (0, reactComponentsSelectionRing.useLayoutEffect)((): Dynamic => {
    let rootNode: Dynamic = rootRef.current,
      indicatorNode: Dynamic = indicatorRef.current,
      ResizeObserverClass: Dynamic = getResizeObserver(rootNode),
      canObserve: Dynamic = rootNode !== null && ResizeObserverClass !== undefined,
      flipState: Dynamic = flipStateRef.current;
    flipState.live = true;
    (!canObserve ||
      (indicatorNode !== null && hasFlipAnimation(indicatorNode))) &&
      syncIndicator();
    let resizeObserver: Dynamic = null;
    canObserve &&
      ((resizeObserver = new ResizeObserverClass((): Dynamic => syncIndicator())),
      resizeObserver.observe(rootNode));
    return (): Dynamic => {
      resizeObserver?.disconnect();
      flipState.live = false;
      flipState.poll?.cancel();
    };
  }, [selectedValue, variant, fullWidth, segmentValuesKey, syncIndicator]);
  (0, reactComponentsSelectionRing.useLayoutEffect)((): Dynamic => {
    if (!thumbPosition) return;
    let handleThumbChange: Dynamic = (thumbProgress?: Dynamic): Dynamic => {
      let rootNode: Dynamic = rootRef.current,
        indicatorNode: Dynamic = indicatorRef.current;
      if (!(!rootNode || !indicatorNode)) {
        if (thumbProgress === null) {
          isFlipIndicatorEntering(indicatorNode) && syncIndicator();
          return;
        }
        seekFlipAnimation(
          indicatorNode,
          thumbProgress,
          (): Dynamic =>
            Array.from(
              rootNode.querySelectorAll('[role="radio"]'),
              (radioElement?: Dynamic): Dynamic =>
                relativeIndicatorBounds(radioElement, rootNode),
            ),
        );
      }
    };
    handleThumbChange(thumbPosition.get());
    let unsubscribe: Dynamic = thumbPosition.on("change", handleThumbChange);
    return (): Dynamic => {
      unsubscribe();
      handleThumbChange(null);
    };
  }, [thumbPosition, syncIndicator]);
  let handleValueChange: Dynamic = (0, reactComponentsSelectionRing.useCallback)(
      (nextValue?: Dynamic): Dynamic => {
        onChange(nextValue);
      },
      [onChange],
    ),
    isContained: Dynamic = variant === "contained",
    hasTooltipGroup: Dynamic = useTooltipGroup(),
    radioGroup: Dynamic = (
      <R_npm_RadioGroup_uF
        ref={rootRef}
        data-cds={"SegmentedControl"}
        aria-label={ariaLabel}
        aria-required={ariaRequired}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedby}
        value={selectedValue}
        onValueChange={handleValueChange}
        disabled={isDisabled}
        {...getSizeAttribute(size)}
        className={cn(
          "relative inline-flex",
          fullWidth ? "w-full" : "w-fit",
          "shrink-0 items-stretch h-control font-sans",
          isContained
            ? "rounded bg-[var(--cds-segmented-control-track)] p-px"
            : "gap-[1px]",
          className,
        )}
      >
        <div
          aria-hidden={true}
          className={`pointer-events-none absolute inset-0 overflow-clip ${isContained ? "rounded" : ""}`}
        >
          <div
            ref={indicatorRef}
            className={`${ComponentsSelectionRingClassNames_5} ${isContained ? thumbShadowClasses : ComponentsSelectionRingClassNames_6}`}
          />
        </div>
        {segments.map((segment?: Dynamic): Dynamic => {
          let isIconOnly: Dynamic = segment.icon && segment.label === undefined,
            tooltipContent: Dynamic = isIconOnly
              ? (segment.tooltip ?? String(segment.value))
              : segment.tooltip,
            ariaLabelText: Dynamic =
              typeof segment.tooltip == "string"
                ? segment.tooltip
                : String(segment.value),
            iconNode: Dynamic = segment.icon ? (
              <Icon name={segment.icon} size={"auto"} />
            ) : null,
            radioItem: Dynamic = (
              <npm_Radio_iP.Root
                value={segment.value}
                disabled={segment.disabled}
                aria-label={isIconOnly ? (ariaLabelText) : (undefined)}
                onMouseDown={withSelectionPrevention(undefined)}
                className={`${selectionRingClasses} ${isContained ? ComponentsSelectionRingClassNames_3 : ComponentsSelectionRingClassNames_4} ${isIconOnly ? AspectSquareValue : ComponentsSelectionRingClassNames}${fullWidth ? " flex-1" : ""}`}
              >
                {iconNode && segment.indicator ? (<span className={"grid"}>
                    <span
                      className={
                        "col-start-1 row-start-1 [--seg-dot-r:calc(0.1875rem*var(--cds-rem-scale,1))] [--seg-dot-x:calc(100%_-_var(--seg-dot-r)_+_1px)] [&:dir(rtl)]:[--seg-dot-x:calc(var(--seg-dot-r)_-_1px)] not-forced-colors:has-[~[data-cds-part=indicator]>*]:[mask-image:radial-gradient(circle_at_var(--seg-dot-x)_calc(var(--seg-dot-r)_-_1px),transparent_calc(var(--seg-dot-r)_+_2px),black_calc(var(--seg-dot-r)_+_2.5px))]"
                      }
                    >
                      {iconNode}
                    </span>
                    <span
                      aria-hidden={true}
                      data-cds-part={"indicator"}
                      className={
                        "relative col-start-1 row-start-1 -me-px -mt-px self-start justify-self-end has-[>[data-cds=Pulse]]:[--cds-page-bg:transparent]"
                      }
                    >
                      {segment.indicator}
                    </span>
                  </span>) : (iconNode)}
                {segment.label}
              </npm_Radio_iP.Root>
            ),
            segmentNode: Dynamic =
              segment.disabled && segment.disabledReason ? (
                <DisabledReasonTooltip
                  reason={segment.disabledReason}
                  side={tooltipSide}
                  hoverable={false}
                  wrapperClassName={
                    fullWidth
                      ? `${HFullValue} ${isIconOnly ? ComponentsSelectionRingClassNames_2 : ComponentsSelectionRingLabel}`
                      : HFullValue
                  }
                >
                  {radioItem}
                </DisabledReasonTooltip>
              ) : tooltipContent !== undefined ? (
                <Tooltip
                  content={tooltipContent}
                  detail={segment.tooltipDetail}
                  shortcut={segment.shortcut}
                  side={tooltipSide}
                  hoverable={segment.tooltipHoverable ?? false}
                  className={tooltipClassName}
                >
                  {radioItem}
                </Tooltip>
              ) : (
                radioItem
              );
          return isInField
            ? (() => {
                const _Component = npm_LabelableProvider_NR;
                const _props = {
                  children: segmentNode,
                } as const;
                const _key = segment.value;
                return <_Component key={_key} {..._props} />;
              })()
            : (() => {
                const _FragmentComponent =
                  reactComponentsSelectionRing.Fragment;
                const _fragmentProps = {
                  children: segmentNode,
                } as const;
                const _fragmentKey = segment.value;
                return <_FragmentComponent key={_fragmentKey} {..._fragmentProps} />;
              })();
        })}
      </R_npm_RadioGroup_uF>
    );
  return hasTooltipGroup ? (
    radioGroup
  ) : (
    <TooltipGroup>{radioGroup}</TooltipGroup>
  );
}
function relativeIndicatorBounds(
  indicator?: Dynamic,
  container?: Dynamic,
): Dynamic {
  let containerBounds: Dynamic = container.getBoundingClientRect(),
    borderBoxWidth: Dynamic = elementBorderBoxWidth(container),
    scale: Dynamic =
      Math.abs(containerBounds.width - borderBoxWidth) < 0.01 ? 1 : containerBounds.width / borderBoxWidth;
  if (!(scale > 0) || !Number.isFinite(scale))
    return {
      left: indicator.offsetLeft,
      width: indicator.offsetWidth,
    };
  let indicatorBounds: Dynamic = indicator.getBoundingClientRect(),
    pixelRatio: Dynamic =
      getOwnerWindow(container)?.devicePixelRatio || 1,
    snapToPixel: Dynamic = (coordinate?: Dynamic): Dynamic =>
      Math.round(coordinate * pixelRatio) / pixelRatio;
  return {
    left: (snapToPixel(indicatorBounds.left) - snapToPixel(containerBounds.left)) / scale,
    width: (snapToPixel(indicatorBounds.right) - snapToPixel(indicatorBounds.left)) / scale,
  };
}
function scaledContainerWidth(container?: Dynamic): Dynamic {
  let width: Dynamic = container.getBoundingClientRect().width;
  return {
    width: width,
    scaled:
      container.offsetWidth > 0 &&
      Math.abs(width - elementBorderBoxWidth(container)) >= 0.01,
  };
}
function requestElementAnimationFrame(
  element?: Dynamic,
  frameCallback?: Dynamic,
): Dynamic {
  let ownerWindow: Dynamic = getConnectedOwnerWindow(element);
  if (!ownerWindow || typeof ownerWindow.requestAnimationFrame != "function") return null;
  let frameId: Dynamic = ownerWindow.requestAnimationFrame(frameCallback);
  return (): Dynamic => {
    try {
      ownerWindow.cancelAnimationFrame(frameId);
    } catch {}
  };
}
function elementBorderBoxWidth(element?: Dynamic): Dynamic {
  let style: Dynamic = (
      getOwnerWindow(element) ?? window
    ).getComputedStyle(element),
    contentWidth: Dynamic = parseFloat(style.width);
  return style.boxSizing === "border-box"
    ? contentWidth
    : contentWidth +
        parseFloat(style.paddingLeft) +
        parseFloat(style.paddingRight) +
        parseFloat(style.borderLeftWidth) +
        parseFloat(style.borderRightWidth);
}
export {
  ComponentsSelectionPointsComponent,
  ComponentsSelectionPointsConstant,
  ComponentsSelectionPointsShiftStep as ComponentsSelectionPointsConstant_2,
  ComponentsSelectionPointsInlineStartInlineEndTopConfig,
  ComponentsSelectionPointsLimit,
  elementBorderBoxWidth,
  initializeComponentsSelectionPoints,
  jsxComponentsSelectionPoints,
  reactComponentsSelectionPoints,
  relativeIndicatorBounds,
  requestElementAnimationFrame,
  scaledContainerWidth,
  SegmentedControl,
};
export function installCdsComponentsSelectionPoints(): () => void {
  return () => {
    initializeComponentsSelectionPoints = initializeOnce(
      (): Dynamic => {
        "use client";

        initializeHooksLayoutEffect();
        initializeClassNames();
        reactComponentsSelectionPoints = toModuleNamespace(
          load_react(),
        );
        initializeNpm_clsx_xh();
        jsxComponentsSelectionPoints = toModuleNamespace(
          load_react_jsx_runtime(),
        );
        ComponentsSelectionPointsLimit = 3;
        ComponentsSelectionPointsConstant = 8;
        ComponentsSelectionPointsShiftStep = 32;
        ComponentsSelectionPointsInlineStartInlineEndTopConfig = {
          "inline-start":
            "inset-y-0 start-[calc(-6px_-_(var(--cds-ring-outer,0px)_-_var(--cds-ring-inner,0px))_/_2)]",
          "inline-end":
            "inset-y-0 end-[calc(-6px_-_(var(--cds-ring-outer,0px)_-_var(--cds-ring-inner,0px))_/_2)]",
          top: "inset-x-0 top-[calc(-6px_-_(var(--cds-ring-outer,0px)_-_var(--cds-ring-inner,0px))_/_2)]",
          bottom:
            "inset-x-0 bottom-[calc(-6px_-_(var(--cds-ring-outer,0px)_-_var(--cds-ring-inner,0px))_/_2)]",
        };
        ComponentsSelectionPointsComponent = (0,
        reactComponentsSelectionPoints.forwardRef)(function (
          {
            orientation = "vertical",
            side: side,
            onResize: onResize,
            onResizeStart: onResizeStart,
            onResizeEnd: onResizeEnd,
            onMouseDown: onMouseDown,
            onKeyDown: onKeyDown,
            className: className,
            ...props
          }: Dynamic,
          forwardedRef?: Dynamic,
        ): Dynamic {
          let isHorizontalDrag: Dynamic =
              side === undefined
                ? orientation === "vertical"
                : side === "inline-start" || side === "inline-end",
            [isDragging, setIsDragging]: Dynamic = (0,
            reactComponentsSelectionPoints.useState)(false),
            onResizeRef: Dynamic = (0, reactComponentsSelectionPoints.useRef)(
              onResize,
            ),
            onResizeStartRef: Dynamic = (0, reactComponentsSelectionPoints.useRef)(
              onResizeStart,
            ),
            onResizeEndRef: Dynamic = (0, reactComponentsSelectionPoints.useRef)(
              onResizeEnd,
            );
          useIsomorphicLayoutEffect((): Dynamic => {
            onResizeRef.current = onResize;
            onResizeStartRef.current = onResizeStart;
            onResizeEndRef.current = onResizeEnd;
          }, [onResize, onResizeStart, onResizeEnd]);
          let dragStartRef: Dynamic = (0, reactComponentsSelectionPoints.useRef)(0),
            hasMovedRef: Dynamic = (0, reactComponentsSelectionPoints.useRef)(false),
            isReleasedRef: Dynamic = (0, reactComponentsSelectionPoints.useRef)(true),
            endDrag: Dynamic = (0,
            reactComponentsSelectionPoints.useCallback)((): Dynamic => {
              isReleasedRef.current ||
                ((isReleasedRef.current = true),
                setIsDragging(false),
                onResizeEndRef.current?.(hasMovedRef.current));
            }, []);
          (0, reactComponentsSelectionPoints.useEffect)((): Dynamic => {
            if (!isDragging) return;
            let handleMouseMove: Dynamic = (moveEvent?: Dynamic): Dynamic => {
                let dragDelta: Dynamic =
                  (isHorizontalDrag ? moveEvent.clientX : moveEvent.clientY) - dragStartRef.current;
                Math.abs(dragDelta) > ComponentsSelectionPointsLimit &&
                  (hasMovedRef.current = true);
                onResizeRef.current(dragDelta);
              },
              style: Dynamic = (document as Dynamic).body.style;
            style.cursor = isHorizontalDrag ? "col-resize" : "row-resize";
            style.userSelect = "none";
            (document as Dynamic).addEventListener("mousemove", handleMouseMove);
            (document as Dynamic).addEventListener("mouseup", endDrag);
            return (): Dynamic => {
              (document as Dynamic).removeEventListener("mousemove", handleMouseMove);
              (document as Dynamic).removeEventListener("mouseup", endDrag);
              style.cursor = "";
              style.userSelect = "";
            };
          }, [isDragging, isHorizontalDrag, endDrag]);
          (0, reactComponentsSelectionPoints.useEffect)(
            (): Dynamic => endDrag,
            [endDrag],
          );
          let handleMouseDown: Dynamic = (event?: Dynamic): Dynamic => {
              event.button === 0 &&
                (event.preventDefault(),
                (dragStartRef.current = isHorizontalDrag ? event.clientX : event.clientY),
                (hasMovedRef.current = false),
                (isReleasedRef.current = false),
                setIsDragging(true),
                onResizeStartRef.current?.());
              onMouseDown?.(event);
            },
            handleKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
              if (
                event.metaKey ||
                event.ctrlKey ||
                event.altKey ||
                !isReleasedRef.current
              )
                return;
              if (
                (event.key === "Enter" || event.key === " ") &&
                !event.shiftKey
              ) {
                event.preventDefault();
                if (event.repeat) return;
                onResizeStartRef.current?.();
                onResizeEndRef.current?.(false);
                return;
              }
              let keyStep: Dynamic = event.shiftKey
                  ? ComponentsSelectionPointsShiftStep
                  : ComponentsSelectionPointsConstant,
                [decreaseKey, increaseKey]: Dynamic = isHorizontalDrag
                  ? ["ArrowLeft", "ArrowRight"]
                  : ["ArrowUp", "ArrowDown"],
                keyDelta: Dynamic =
                  event.key === decreaseKey
                    ? -keyStep
                    : event.key === increaseKey
                      ? keyStep
                      : 0;
              keyDelta !== 0 &&
                (event.preventDefault(),
                onResizeStartRef.current?.(),
                onResizeRef.current(keyDelta),
                onResizeEndRef.current?.(true));
            };
          return (
            <div
              {...props}
              ref={forwardedRef}
              data-cds={"ResizeHandle"}
              role={"separator"}
              aria-orientation={isHorizontalDrag ? "vertical" : "horizontal"}
              tabIndex={0}
              data-dragging={isDragging ? "" : undefined}
              onMouseDown={handleMouseDown}
              onKeyDown={(keyEvent?: Dynamic): Dynamic => {
                handleKeyDown(keyEvent);
                onKeyDown?.(keyEvent);
              }}
              className={cn(
                "cds-reset group/resize outline-none focus-visible:outline-hidden",
                isHorizontalDrag ? "w-3 cursor-col-resize" : "h-3 cursor-row-resize",
                side === undefined
                  ? ["relative", isHorizontalDrag ? "h-full" : "w-full"]
                  : [
                      "absolute",
                      ComponentsSelectionPointsInlineStartInlineEndTopConfig[
                        side
                      ],
                    ],
                className,
              )}
            >
              <div
                aria-hidden={true}
                className={npm_clsx_Ea(
                  "absolute rounded-full transition-shadow duration-fast group-focus-visible/resize:shadow-focus",
                  isHorizontalDrag
                    ? "inset-y-0 left-1/2 w-3 -translate-x-1/2 cursor-col-resize"
                    : "inset-x-0 top-1/2 h-3 -translate-y-1/2 cursor-row-resize",
                )}
              />
              <div
                aria-hidden={true}
                data-cds-part={"resize-pill"}
                className={npm_clsx_Ea(
                  "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current transition-[opacity,color,background-color]",
                  isHorizontalDrag
                    ? "h-full max-h-12 w-[3px] group-focus-visible/resize:max-h-none"
                    : "h-[3px] w-full max-w-12 group-focus-visible/resize:max-w-none",
                  isDragging
                    ? "text-secondary opacity-100 duration-snap"
                    : "text-muted opacity-[var(--cds-resize-pill-force,0)] delay-200 duration-base group-hover/resize:opacity-100",
                  "group-focus-visible/resize:bg-fill-accent group-focus-visible/resize:opacity-100 group-focus-visible/resize:delay-0",
                )}
              />
            </div>
          );
        });
      },
    );
  };
}
