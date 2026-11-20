import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type * as C from "../contracts/controls";
import { baseLabelableProvider, baseRadio, baseRadioGroup as R_baseRadioGroup, clsx, loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { DisabledReasonTooltip, initializeShortcuts, initializeTooltip, shortcutToAriaKeyShortcuts, Tooltip, TooltipProvider, useAppleKeyboard, useHasTooltipProvider } from "./avatars";
import { useCompactableControlDebug, withRepeatedClickSelectionPrevention } from "./disclosure";
import { getResizeObserverConstructor, initializeErrorReporting, initializeIconSupport, initializeIsomorphicLayoutEffect, initializeReducedMotion, invokeAndReportError, isReducedMotion, useIsomorphicLayoutEffect } from "./foundation";
import { cn, Icon, initializeClassNames, initializeIcons, initializeMergedRefs } from "./interactions";
import { getConnectedElementWindow, getControlSizeAttributes, getElementWindow, initializeCdsRoot, initializeClickToFocus, initializeElementWindow } from "./overlays";
import { useHasFieldContext } from "./text-input";

var reactForUiSegmentedControl: typeof React;
var jsxX_: typeof import("react/jsx-runtime");
var RESIZE_DRAG_THRESHOLD_PX: number;
var RESIZE_KEYBOARD_STEP_PX: number;
var RESIZE_KEYBOARD_LARGE_STEP_PX: number;
var resizeHandleSideClasses: Record<
  NonNullable<C.ResizeHandleProps["side"]>,
  string
>;
var ResizeHandle: C.ForwardComponent<HTMLDivElement, C.ResizeHandleProps>;
var noopFlipCleanup: () => void;
var FLIP_HELD_MARKER: string;
var FLIP_PAUSE_DURATION_MS: number;
var pausedFlipAnimations: WeakMap<HTMLElement, Animation>;
var reactSegmentedControl: typeof React;
var jsxForUiSegmentedControl: typeof import("react/jsx-runtime");
var segmentedControlSegmentClasses: string;
var segmentedControlTextPaddingClasses: string;
var segmentedControlIconAspectClasses: string;
var segmentedControlVisualLayerClasses: string;
var segmentedControlFlexibleItemClasses: string;
var segmentedControlFullWidthItemClasses: string;
var segmentedControlTextClasses: string;
var ghostSegmentHoverClasses: string;
var segmentedControlThumbClasses: string;
var containedSegmentThumbClasses: string;
var ghostSegmentThumbClasses: string;
var SEGMENT_INDICATOR_SETTLE_MS: number;
var SEGMENT_INDICATOR_SETTLE_FRAMES: number;
var SEGMENT_TOOLTIP_DELAY_MS: number;
var segmentedControlResizeObservers: WeakMap<Window, C.SegmentObserverEntry>;
var DISAMBIGUATED_CURRENCY_CODES: Set<string>;
var CURRENCY_NUMBER_PART_TYPES: Set<Intl.NumberFormatPartTypes>;
function animateSegmentedControlThumb(
  thumb: HTMLElement,
  track: HTMLElement,
  nextBounds: C.SegmentBounds | null,
  {
    correction: correction = false,
  }: {
    correction?: boolean;
  } = {},
) {
  if (nextBounds === null || nextBounds.width <= 0) {
    let animationsToCancel = getElementAnimations(thumb);
    return () => {
      cancelAnimations(animationsToCancel);
      thumb.style.visibility = "";
      thumb.style.willChange = "";
      delete thumb.dataset.flipAt;
    };
  }
  let nextFlipMarker = `${nextBounds.left},${nextBounds.width}`,
    flipAt = thumb.dataset.flipAt;
  if (flipAt === nextFlipMarker) {
    return noopFlipCleanup;
  }
  let bounds = thumb.getBoundingClientRect(),
    left = track.getBoundingClientRect().left,
    thumbStyle = getComputedStyle(thumb),
    duration = readCssDuration(thumbStyle, "--cds-dur-base"),
    easing = thumbStyle.getPropertyValue("--cds-ease-snap").trim() || "linear",
    hasTranslucentBackground = usesAlphaBackground(thumbStyle),
    shouldSkipCorrectionAnimation = correction && !hasRunningAnimations(thumb),
    previousAnimations = getElementAnimations(thumb);
  return () => {
    cancelAnimations(previousAnimations);
    thumb.dataset.flipAt = nextFlipMarker;
    thumb.style.width = `${nextBounds.width}px`;
    thumb.style.transform = `translateX(${nextBounds.left}px)`;
    thumb.style.visibility = "inherit";
    if (!hasTranslucentBackground) {
      thumb.style.willChange = "";
    }
    if (
      flipAt === undefined ||
      !supportsElementAnimations(thumb) ||
      isReducedMotion()
    ) {
      return;
    }
    if (shouldSkipCorrectionAnimation) {
      return;
    }
    try {
      thumb.animate(
        {
          transform: [
            `translateX(${bounds.left - left}px) scaleX(${bounds.width / nextBounds.width})`,
            `translateX(${nextBounds.left}px) scaleX(1)`,
          ],
        },
        {
          duration: duration,
          easing: easing,
        },
      );
      if (duration > 0) {
        setTransformWillChange(thumb, hasTranslucentBackground);
      }
    } catch {}
  };
}
function readCssDuration(
  style: CSSStyleDeclaration,
  property: string,
): number {
  let value = style.getPropertyValue(property).trim(),
    millisecondsPerUnit = value.endsWith("ms") ? 1 : value.endsWith("s") ? 1000 : 0;
  return Math.max(0, parseFloat(value) * millisecondsPerUnit) || 0;
}
function supportsElementAnimations(element: Element): boolean {
  return (
    typeof element.animate === "function" &&
    typeof element.getAnimations === "function"
  );
}
function usesAlphaBackground(style: CSSStyleDeclaration): boolean {
  return /^rgba\(|\//.test(style.backgroundColor);
}
function setTransformWillChange(element: HTMLElement, enabled: boolean): void {
  element.style.willChange = enabled ? "transform" : "";
}
function hasRunningAnimations(element: Element): boolean {
  return (
    supportsElementAnimations(element) &&
    element
      .getAnimations()
      .some((animation: Animation) => animation.playState === "running")
  );
}
function getElementAnimations(element: Element): Animation[] {
  if (supportsElementAnimations(element)) {
    return element.getAnimations();
  } else {
    return [];
  }
}
function cancelAnimations(animations: readonly Animation[]): void {
  for (let value of animations) {
    value.cancel();
  }
}
function hasFlipAnimationMarker(thumb: HTMLElement): boolean {
  return thumb.dataset.flipAt !== undefined;
}
function pauseFlipAnimationAtProgress(
  thumb: HTMLElement,
  progress: number,
  measureSegments: () => C.SegmentBounds[],
) {
  if (
    !Number.isFinite(progress) ||
    !hasFlipAnimationMarker(thumb) ||
    !supportsElementAnimations(thumb)
  ) {
    return;
  }
  let entry = pausedFlipAnimations.get(thumb);
  if (entry?.playState !== "paused") {
    let value = measureSegments();
    if (
      value.length < 2 ||
      value.some((segmentBounds: C.SegmentBounds) => segmentBounds.width <= 0)
    ) {
      return;
    }
    let thumbWidth = parseFloat(thumb.style.width),
      hasTranslucentBackground = usesAlphaBackground(getComputedStyle(thumb));
    entry = thumb.animate(
      value.map((segmentBounds: C.SegmentBounds) => ({
        transform: `translateX(${segmentBounds.left}px) scaleX(${segmentBounds.width / thumbWidth})`,
      })),
      {
        duration: (value.length - 1) * FLIP_PAUSE_DURATION_MS,
        fill: "both",
      },
    );
    entry.pause();
    setTransformWillChange(thumb, hasTranslucentBackground);
    pausedFlipAnimations.set(thumb, entry);
    thumb.dataset.flipAt = FLIP_HELD_MARKER;
  }
  entry.currentTime = progress * FLIP_PAUSE_DURATION_MS;
}
function isImmediateFlipMarker(thumb: HTMLElement): boolean {
  return thumb.dataset.flipAt === FLIP_HELD_MARKER;
}
function observeSegmentedControlSize(
  element: HTMLElement,
  ResizeObserverClass: typeof ResizeObserver,
  measureSegmentedControl: C.SegmentMeasure,
) {
  let value: Window = getElementWindow(element) ?? window,
    entry = segmentedControlResizeObservers.get(value);
  if (entry?.Observer !== ResizeObserverClass) {
    let entries = new Map<Element, C.SegmentMeasure>();
    entry = {
      Observer: ResizeObserverClass,
      observer: new ResizeObserverClass((resizeEntries: ResizeObserverEntry[]) => {
        let items: (() => void)[] = [];
        for (let resizeEntry of resizeEntries) {
          let measure = entries.get(resizeEntry.target);
          if (measure) {
            invokeAndReportError(() => measure(false, items));
          }
        }
        for (let applyMeasurement of items) {
          invokeAndReportError(applyMeasurement);
        }
      }),
      measures: entries,
    };
    segmentedControlResizeObservers.set(value, entry);
  }
  let { observer: resizeObserver, measures: measureCallbacks } = entry;
  measureCallbacks.set(element, measureSegmentedControl);
  resizeObserver.observe(element);
  return () => {
    resizeObserver.unobserve(element);
    measureCallbacks.delete(element);
  };
}
function SegmentedControl({
  segments: segments,
  value: selectedValue,
  onChange: onChange,
  variant = "contained",
  size: size,
  fullWidth = false,
  disabled: disabled,
  tooltipSide: tooltipSide,
  tooltipClassName: tooltipClassName,
  "aria-label": ariaLabel,
  "aria-required": ariaRequired,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedby,
  thumbPosition: thumbPosition,
  className: className,
}: C.SegmentedControlProps) {
  useUiLocale();
  let ref = reactSegmentedControl.useRef<HTMLDivElement>(null);
  useCompactableControlDebug(ref, "SegmentedControl");
  let thumbRef = reactSegmentedControl.useRef<HTMLDivElement>(null),
    hasFieldContext: boolean = useHasFieldContext(),
    usesAppleKeyboard: boolean = useAppleKeyboard(),
    layoutStateRef = reactSegmentedControl.useRef<C.SegmentLayoutState>({
      live: false,
      poll: null,
    }),
    callback = reactSegmentedControl.useCallback(function measureThumb(
      correction = false,
      pendingUpdates?: (() => void)[],
    ) {
      let current = ref.current,
        thumb = thumbRef.current;
      if (!current || !thumb) {
        return;
      }
      let element = current.querySelector<HTMLElement>("[data-checked]"),
        trackWidth = element ? measureScaledElementWidth(current) : null,
        applyThumbLayout: (() => void) | null = null;
      if (!correction || !(trackWidth?.scaled || isImmediateFlipMarker(thumb))) {
        let selectedBounds = element
          ? getRelativeSegmentBounds(element, current)
          : null;
        applyThumbLayout = animateSegmentedControlThumb(thumb, current, selectedBounds, {
          correction: correction,
        });
      }
      let updateLayoutAndPoll = () => {
        applyThumbLayout?.();
        if (!layoutStateRef.current.live) {
          return;
        }
        let poll = layoutStateRef.current.poll;
        poll?.cancel();
        layoutStateRef.current.poll = null;
        if (!trackWidth || (!correction && !poll && !trackWidth.scaled)) {
          return;
        }
        let {
          width: previousWidth,
          still: stableFrames,
          frames: frames,
        } = poll ?? {
          width: trackWidth.width,
          still: 0,
          frames: 0,
        };
        if (correction) {
          stableFrames = previousWidth === trackWidth.width ? stableFrames + 1 : 0;
          previousWidth = trackWidth.width;
          frames += 1;
          if (
            stableFrames >=
              (trackWidth.scaled
                ? SEGMENT_INDICATOR_SETTLE_MS
                : SEGMENT_INDICATOR_SETTLE_FRAMES) ||
            frames >= SEGMENT_TOOLTIP_DELAY_MS
          ) {
            return;
          }
        }
        let cancelNextMeasurement = scheduleElementAnimationFrame(current, () =>
          measureThumb(true),
        );
        if (cancelNextMeasurement) {
          layoutStateRef.current.poll = {
            cancel: cancelNextMeasurement,
            width: previousWidth,
            still: stableFrames,
            frames: frames,
          };
        }
      };
      if (pendingUpdates) {
        pendingUpdates.push(updateLayoutAndPoll);
      } else {
        updateLayoutAndPoll();
      }
    }, []),
    segmentValuesKey = segments
      .map((segment: C.SegmentOption) => segment.value)
      .join("\x00");
  reactSegmentedControl.useLayoutEffect(() => {
    let current = ref.current,
      thumb = thumbRef.current,
      ResizeObserverClass: typeof ResizeObserver | undefined = getResizeObserverConstructor(current),
      canObserve = current !== null && ResizeObserverClass !== undefined,
      layoutState = layoutStateRef.current;
    layoutState.live = true;
    if (!canObserve || (thumb !== null && hasFlipAnimationMarker(thumb))) {
      callback();
    }
    let stopObservingSize = canObserve
      ? observeSegmentedControlSize(
          current as HTMLElement,
          ResizeObserverClass as typeof ResizeObserver,
          callback,
        )
      : null;
    return () => {
      stopObservingSize?.();
      layoutState.live = false;
      layoutState.poll?.cancel();
    };
  }, [selectedValue, variant, fullWidth, segmentValuesKey, callback]);
  reactSegmentedControl.useLayoutEffect(() => {
    if (!thumbPosition) {
      return;
    }
    let updateThumbProgress = (progress: number | null) => {
      let current = ref.current,
        thumb = thumbRef.current;
      if (!current || !thumb) {
        return;
      }
      if (progress === null) {
        if (isImmediateFlipMarker(thumb)) {
          callback();
        }
        return;
      }
      pauseFlipAnimationAtProgress(thumb, progress, () =>
        Array.from<HTMLElement, C.SegmentBounds>(
          current.querySelectorAll<HTMLElement>('[role="radio"]'),
          (segment: HTMLElement) => getRelativeSegmentBounds(segment, current),
        ),
      );
    };
    updateThumbProgress(thumbPosition.get());
    let unsubscribe = thumbPosition.on("change", updateThumbProgress);
    return () => {
      unsubscribe();
      updateThumbProgress(null);
    };
  }, [thumbPosition, callback]);
  let handleChange = reactSegmentedControl.useCallback(
      (nextValue: string) => {
        onChange(nextValue);
      },
      [onChange],
    ),
    isContained = variant === "contained",
    hasTooltipProvider: boolean = useHasTooltipProvider(),
    segmentGroup = (
      <R_baseRadioGroup
        ref={ref}
        data-cds={"SegmentedControl"}
        aria-label={ariaLabel}
        aria-required={ariaRequired}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedby}
        value={selectedValue}
        onValueChange={handleChange}
        disabled={disabled}
        {...getControlSizeAttributes(size)}
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
        {[<div
            aria-hidden={true}
            className={`pointer-events-none absolute inset-0 overflow-clip ${isContained ? "rounded" : ""}`}
          >
            <div
              ref={thumbRef}
              className={`${segmentedControlThumbClasses} ${isContained ? containedSegmentThumbClasses : ghostSegmentThumbClasses}`}
            />
          </div>, segments.map((segment: C.SegmentOption) => {
            let isIconOnly = segment.icon && segment.label === undefined,
              tooltip = isIconOnly
                ? (segment.tooltip ?? String(segment.value))
                : segment.tooltip,
              accessibleLabel =
                typeof segment.tooltip === "string"
                  ? segment.tooltip
                  : String(segment.value),
              segmentIcon = segment.icon ? (
                <Icon name={segment.icon} size={"auto"} />
              ) : null,
              segmentRadio = (
                <baseRadio.Root
                  value={segment.value}
                  disabled={segment.disabled}
                  aria-label={isIconOnly ? (accessibleLabel) : (undefined)}
                  aria-keyshortcuts={
                    segment.shortcut
                      ? shortcutToAriaKeyShortcuts(
                          segment.shortcut,
                          usesAppleKeyboard,
                        )
                      : undefined
                  }
                  onMouseDown={withRepeatedClickSelectionPrevention(undefined)}
                  className={`${segmentedControlSegmentClasses} ${isContained ? segmentedControlTextClasses : ghostSegmentHoverClasses} ${isIconOnly ? segmentedControlIconAspectClasses : segmentedControlTextPaddingClasses}${fullWidth ? " flex-1" : ""}`}
                >
                  {[segmentIcon && segment.indicator ? (
                      <span className={"grid"}>
                        {[<span
                            className={
                              "col-start-1 row-start-1 [--seg-dot-r:calc(0.1875rem*var(--cds-rem-scale,1))] [--seg-dot-x:calc(100%_-_var(--seg-dot-r)_+_1px)] [&:dir(rtl)]:[--seg-dot-x:calc(var(--seg-dot-r)_-_1px)] not-forced-colors:has-[~[data-cds-part=indicator]>*]:[mask-image:radial-gradient(circle_at_var(--seg-dot-x)_calc(var(--seg-dot-r)_-_1px),transparent_calc(var(--seg-dot-r)_+_2px),black_calc(var(--seg-dot-r)_+_2.5px))]"
                            }
                          >
                            {segmentIcon}
                          </span>, <span
                            aria-hidden={true}
                            data-cds-part={"indicator"}
                            className={
                              "relative col-start-1 row-start-1 -me-px -mt-px self-start justify-self-end has-[>[data-cds=Pulse]]:[--cds-page-bg:transparent]"
                            }
                          >
                            {segment.indicator}
                          </span>]}
                      </span>
                    ) : (
                      segmentIcon
                    ), segment.label]}
                </baseRadio.Root>
              ),
              segmentContent =
                segment.disabled && !!segment.disabledReason ? (
                  <DisabledReasonTooltip
                    reason={segment.disabledReason}
                    side={tooltipSide}
                    hoverable={false}
                    wrapperClassName={
                      fullWidth
                        ? `${segmentedControlVisualLayerClasses} ${isIconOnly ? segmentedControlFullWidthItemClasses : segmentedControlFlexibleItemClasses}`
                        : segmentedControlVisualLayerClasses
                    }
                  >
                    {segmentRadio}
                  </DisabledReasonTooltip>
                ) : tooltip !== undefined ? (
                  <Tooltip
                    content={tooltip}
                    detail={segment.tooltipDetail}
                    shortcut={segment.shortcut}
                    side={tooltipSide}
                    hoverable={segment.tooltipHoverable ?? false}
                    className={tooltipClassName}
                  >
                    {segmentRadio}
                  </Tooltip>
                ) : (
                  segmentRadio
                );
            if (hasFieldContext) {
              return (() => {
                const _Element = baseLabelableProvider;
                const _elementProps = {
                  children: segmentContent,
                };
                const _elementKey = segment.value;
                return <_Element key={_elementKey} {..._elementProps} />;
              })();
            } else {
              return (() => {
                const SegmentFragment = reactSegmentedControl.Fragment;
                const fragmentProps = {
                  children: segmentContent,
                };
                const segmentKey = segment.value;
                return <SegmentFragment key={segmentKey} {...fragmentProps} />;
              })();
            }
          })]}
      </R_baseRadioGroup>
    );
  if (hasTooltipProvider) {
    return segmentGroup;
  } else {
    return <TooltipProvider>{segmentGroup}</TooltipProvider>;
  }
}
function getRelativeSegmentBounds(segment: HTMLElement, track: HTMLElement) {
  let bounds = track.getBoundingClientRect(),
    value = getUnscaledBorderBoxWidth(track),
    trackScale = Math.abs(bounds.width - value) < 0.01 ? 1 : bounds.width / value;
  if (!(trackScale > 0) || !Number.isFinite(trackScale)) {
    return {
      left: segment.offsetLeft,
      width: segment.offsetWidth,
    };
  }
  let segmentBounds = segment.getBoundingClientRect(),
    devicePixelRatio: number =
      getElementWindow(track)?.devicePixelRatio || 1,
    callback = (position: number) => Math.round(position * devicePixelRatio) / devicePixelRatio;
  return {
    left: (callback(segmentBounds.left) - callback(bounds.left)) / trackScale,
    width: (callback(segmentBounds.right) - callback(segmentBounds.left)) / trackScale,
  };
}
function measureScaledElementWidth(element: HTMLElement): C.SegmentWidth {
  let width = element.getBoundingClientRect().width;
  return {
    width: width,
    scaled:
      element.offsetWidth > 0 &&
      Math.abs(width - getUnscaledBorderBoxWidth(element)) >= 0.01,
  };
}
function scheduleElementAnimationFrame(
  element: HTMLElement,
  onFrame: FrameRequestCallback,
) {
  let value: Window | undefined = getConnectedElementWindow(
    element,
  );
  if (!value || typeof value.requestAnimationFrame !== "function") {
    return null;
  }
  let animationFrame = value.requestAnimationFrame(onFrame);
  return () => {
    try {
      value.cancelAnimationFrame(animationFrame);
    } catch {}
  };
}
function getUnscaledBorderBoxWidth(element: HTMLElement): number {
  let style: CSSStyleDeclaration = (
      getElementWindow(element) ?? window
    ).getComputedStyle(element),
    value = parseFloat(style.width);
  if (style.boxSizing === "border-box") {
    return value;
  } else {
    return (
      value +
      parseFloat(style.paddingLeft) +
      parseFloat(style.paddingRight) +
      parseFloat(style.borderLeftWidth) +
      parseFloat(style.borderRightWidth)
    );
  }
}
function currencyDisplayParts(
  currency: string,
  locale?: Intl.LocalesArgument,
): C.CurrencyDisplayParts {
  let value = currency.toUpperCase();
  try {
    let numberParts = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: value,
        currencyDisplay: DISAMBIGUATED_CURRENCY_CODES.has(value)
          ? "code"
          : "symbol",
      }).formatToParts(1),
      currencyIndex = numberParts.findIndex(
        (part: Intl.NumberFormatPart) => part.type === "currency",
      ),
      currencyPart = numberParts[currencyIndex];
    if (currencyPart === undefined) {
      return {
        symbol: value,
        side: "start",
      };
    }
    let symbolSide: "start" | "end" = numberParts
      .slice(0, currencyIndex)
      .some((part: Intl.NumberFormatPart) =>
        CURRENCY_NUMBER_PART_TYPES.has(part.type),
      )
      ? "end"
      : "start";
    return {
      symbol: currencyPart.value,
      side: symbolSide,
    };
  } catch {
    return {
      symbol: value,
      side: "start",
    };
  }
}
export {
  animateSegmentedControlThumb,
  cancelAnimations,
  containedSegmentThumbClasses,
  CURRENCY_NUMBER_PART_TYPES,
  currencyDisplayParts,
  DISAMBIGUATED_CURRENCY_CODES,
  FLIP_HELD_MARKER,
  FLIP_PAUSE_DURATION_MS,
  getElementAnimations,
  getRelativeSegmentBounds,
  getUnscaledBorderBoxWidth,
  ghostSegmentHoverClasses,
  ghostSegmentThumbClasses,
  hasFlipAnimationMarker,
  hasRunningAnimations,
  isImmediateFlipMarker,
  jsxForUiSegmentedControl,
  jsxX_,
  measureScaledElementWidth,
  noopFlipCleanup,
  observeSegmentedControlSize,
  pausedFlipAnimations,
  pauseFlipAnimationAtProgress,
  reactForUiSegmentedControl,
  reactSegmentedControl,
  readCssDuration,
  RESIZE_DRAG_THRESHOLD_PX,
  RESIZE_KEYBOARD_LARGE_STEP_PX,
  RESIZE_KEYBOARD_STEP_PX,
  ResizeHandle,
  resizeHandleSideClasses,
  scheduleElementAnimationFrame,
  SEGMENT_INDICATOR_SETTLE_FRAMES,
  SEGMENT_INDICATOR_SETTLE_MS,
  SEGMENT_TOOLTIP_DELAY_MS,
  SegmentedControl,
  segmentedControlFlexibleItemClasses,
  segmentedControlFullWidthItemClasses,
  segmentedControlIconAspectClasses,
  segmentedControlResizeObservers,
  segmentedControlSegmentClasses,
  segmentedControlTextClasses,
  segmentedControlTextPaddingClasses,
  segmentedControlThumbClasses,
  segmentedControlVisualLayerClasses,
  setTransformWillChange,
  supportsElementAnimations,
  usesAlphaBackground,
};
export function installUiSegmentedControl(): () => void {
  return () => {
    initializeIsomorphicLayoutEffect();
    initializeClassNames();
    reactForUiSegmentedControl = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxX_ = toModuleNamespace(loadJsxNamespace(), 1);
    RESIZE_DRAG_THRESHOLD_PX = 3;
    RESIZE_KEYBOARD_STEP_PX = 8;
    RESIZE_KEYBOARD_LARGE_STEP_PX = 32;
    resizeHandleSideClasses = {
      "inline-start":
        "inset-y-0 start-[calc(-6px_-_(var(--cds-ring-outer,0px)_-_var(--cds-ring-inner,0px))_/_2)]",
      "inline-end":
        "inset-y-0 end-[calc(-6px_-_(var(--cds-ring-outer,0px)_-_var(--cds-ring-inner,0px))_/_2)]",
      top: "inset-x-0 top-[calc(-6px_-_(var(--cds-ring-outer,0px)_-_var(--cds-ring-inner,0px))_/_2)]",
      bottom:
        "inset-x-0 bottom-[calc(-6px_-_(var(--cds-ring-outer,0px)_-_var(--cds-ring-inner,0px))_/_2)]",
    };
    ResizeHandle = reactForUiSegmentedControl.forwardRef(function (
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
      }: C.ResizeHandleProps,
      forwardedRef: React.ForwardedRef<HTMLDivElement>,
    ) {
      let value =
          side === undefined
            ? orientation === "vertical"
            : side === "inline-start" || side === "inline-end",
        [isDragging, setIsDragging] = reactForUiSegmentedControl.useState(false),
        ref = reactForUiSegmentedControl.useRef<Document>(null),
        resizeCallbackRef = reactForUiSegmentedControl.useRef(onResize),
        resizeStartCallbackRef = reactForUiSegmentedControl.useRef(onResizeStart),
        resizeEndCallbackRef = reactForUiSegmentedControl.useRef(onResizeEnd);
      useIsomorphicLayoutEffect(() => {
        resizeCallbackRef.current = onResize;
        resizeStartCallbackRef.current = onResizeStart;
        resizeEndCallbackRef.current = onResizeEnd;
      }, [onResize, onResizeStart, onResizeEnd]);
      let dragStartCoordinateRef = reactForUiSegmentedControl.useRef(0),
        crossedDragThresholdRef = reactForUiSegmentedControl.useRef(false),
        dragFinishedRef = reactForUiSegmentedControl.useRef(true),
        callback = reactForUiSegmentedControl.useCallback(() => {
          if (dragFinishedRef.current) {
            return;
          }
          dragFinishedRef.current = true;
          setIsDragging(false);
          resizeEndCallbackRef.current?.(crossedDragThresholdRef.current);
        }, []);
      reactForUiSegmentedControl.useEffect(() => {
        let current = ref.current;
        if (!isDragging || current === null) {
          return;
        }
        let handleDragMove = (mouseEvent: MouseEvent) => {
            let dragDelta = (value ? mouseEvent.clientX : mouseEvent.clientY) - dragStartCoordinateRef.current;
            if (Math.abs(dragDelta) > RESIZE_DRAG_THRESHOLD_PX) {
              crossedDragThresholdRef.current = true;
            }
            resizeCallbackRef.current(dragDelta);
          },
          style = current.body.style;
        style.cursor = value ? "col-resize" : "row-resize";
        style.userSelect = "none";
        current.addEventListener("mousemove", handleDragMove);
        current.addEventListener("mouseup", callback);
        return () => {
          current.removeEventListener("mousemove", handleDragMove);
          current.removeEventListener("mouseup", callback);
          style.cursor = "";
          style.userSelect = "";
        };
      }, [isDragging, value, callback]);
      reactForUiSegmentedControl.useEffect(() => callback, [callback]);
      let handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
          if (event.button === 0) {
            event.preventDefault();
            dragStartCoordinateRef.current = value ? event.clientX : event.clientY;
            crossedDragThresholdRef.current = false;
            dragFinishedRef.current = false;
            ref.current = event.currentTarget.ownerDocument;
            setIsDragging(true);
            resizeStartCallbackRef.current?.();
          }
          onMouseDown?.(event);
        },
        handleResizeKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
          if (event.metaKey || event.ctrlKey || event.altKey || !dragFinishedRef.current) {
            return;
          }
          if ((event.key === "Enter" || event.key === " ") && !event.shiftKey) {
            event.preventDefault();
            if (event.repeat) {
              return;
            }
            resizeStartCallbackRef.current?.();
            resizeEndCallbackRef.current?.(false);
            return;
          }
          let stepSize = event.shiftKey
              ? RESIZE_KEYBOARD_LARGE_STEP_PX
              : RESIZE_KEYBOARD_STEP_PX,
            [decreaseKey, increaseKey] = value
              ? ["ArrowLeft", "ArrowRight"]
              : ["ArrowUp", "ArrowDown"],
            keyboardDelta =
              event.key === decreaseKey
                ? -stepSize
                : event.key === increaseKey
                  ? stepSize
                  : 0;
          if (keyboardDelta === 0) {
            return;
          }
          event.preventDefault();
          resizeStartCallbackRef.current?.();
          resizeCallbackRef.current(keyboardDelta);
          resizeEndCallbackRef.current?.(true);
        };
      return (
        <div
          {...props}
          ref={forwardedRef}
          data-cds={"ResizeHandle"}
          role={"separator"}
          aria-orientation={value ? "vertical" : "horizontal"}
          tabIndex={0}
          data-dragging={isDragging ? "" : undefined}
          onMouseDown={handleMouseDown}
          onKeyDown={(keyEvent: React.KeyboardEvent<HTMLDivElement>) => {
            handleResizeKeyDown(keyEvent);
            onKeyDown?.(keyEvent);
          }}
          className={cn(
            "cds-reset group/resize outline-none focus-visible:outline-hidden",
            value ? "w-3 cursor-col-resize" : "h-3 cursor-row-resize",
            side === undefined
              ? ["relative", value ? "h-full" : "w-full"]
              : ["absolute", resizeHandleSideClasses[side]],
            className,
          )}
        >
          {[<div
              aria-hidden={true}
              className={clsx(
                "absolute rounded-full transition-shadow duration-fast group-focus-visible/resize:shadow-focus",
                value
                  ? "inset-y-0 left-1/2 w-3 -translate-x-1/2 cursor-col-resize"
                  : "inset-x-0 top-1/2 h-3 -translate-y-1/2 cursor-row-resize",
              )}
            />, <div
              aria-hidden={true}
              data-cds-part={"resize-pill"}
              className={clsx(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current transition-[opacity,color,background-color]",
                value
                  ? "h-full max-h-12 w-[3px] group-focus-visible/resize:max-h-none"
                  : "h-[3px] w-full max-w-12 group-focus-visible/resize:max-w-none",
                isDragging
                  ? "text-secondary opacity-100 duration-snap"
                  : "text-muted opacity-[var(--cds-resize-pill-force,0)] delay-200 duration-base group-hover/resize:opacity-100",
                "group-focus-visible/resize:bg-fill-accent group-focus-visible/resize:opacity-100 group-focus-visible/resize:delay-0",
              )}
            />]}
        </div>
      );
    });
    initializeErrorReporting();
    initializeClassNames();
    initializeElementWindow();
    initializeCdsRoot();
    initializeIconSupport();
    initializeIcons();
    initializeShortcuts();
    initializeTooltip();
    initializeReducedMotion();
    noopFlipCleanup = () => {
      return;
    };
    FLIP_HELD_MARKER = "held";
    FLIP_PAUSE_DURATION_MS = 1000;
    pausedFlipAnimations = new WeakMap();
    reactSegmentedControl = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxForUiSegmentedControl = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    segmentedControlSegmentClasses =
      "cds-reset relative z-[1] inline-flex h-full items-center justify-center gap-1.5 select-none border-0 bg-transparent outline-none focus-visible:outline-hidden rounded-[calc(var(--cds-radius)-2px)] text-body font-normal [&:not([data-disabled])]:hover:text-primary data-[checked]:text-primary data-[disabled]:opacity-disabled transition-shadow duration-fast focus-visible:shadow-focus";
    segmentedControlTextPaddingClasses = "px-md";
    segmentedControlIconAspectClasses = "aspect-square";
    segmentedControlVisualLayerClasses =
      "h-full relative z-[1] rounded-[calc(var(--cds-radius)-2px)]";
    segmentedControlFlexibleItemClasses =
      "grow basis-[calc(var(--cds-pad-md)*2)]";
    segmentedControlFullWidthItemClasses = "flex-1";
    segmentedControlTextClasses = "text-secondary";
    ghostSegmentHoverClasses =
      "text-secondary [&:not([data-checked]):not([data-disabled])]:hover:bg-fill-ghost-hover";
    segmentedControlThumbClasses =
      "invisible absolute left-0 origin-left rounded-[calc(var(--cds-radius)-1px)] bg-[var(--cds-segmented-control-thumb)]";
    containedSegmentThumbClasses =
      "top-px bottom-px [box-shadow:inset_0_0_0_1px_var(--cds-border),0_1px_2px_0_rgb(0_0_0/0.05)]";
    ghostSegmentThumbClasses =
      "inset-y-0 [box-shadow:inset_0_0_0_1px_var(--cds-border)]";
    SEGMENT_INDICATOR_SETTLE_MS = 30;
    SEGMENT_INDICATOR_SETTLE_FRAMES = 2;
    SEGMENT_TOOLTIP_DELAY_MS = 600;
    segmentedControlResizeObservers = new WeakMap();
    initializeClassNames();
    initializeCdsRoot();
    initializeClickToFocus();
    initializeMergedRefs();
    DISAMBIGUATED_CURRENCY_CODES = new Set(["SGD", "AUD", "NZD"]);
    CURRENCY_NUMBER_PART_TYPES = new Set([
      "integer",
      "group",
      "decimal",
      "fraction",
      "minusSign",
      "plusSign",
      "nan",
      "infinity",
    ]);
  };
}
