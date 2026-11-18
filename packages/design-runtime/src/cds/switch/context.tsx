import type { FlipGeometry, FlipIndicatorState } from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { initializePlatformReducedMotion } from "../platform/reduced-motion";
import { prefersReducedMotion } from "../sheets/popup-stack";
import { load_react } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var HeldValue: string;
var SwitchContextConstant: number;
var SwitchContextElementCache: WeakMap<HTMLElement, Animation>;
var initializeSwitchContext: () => void;
var reactSwitchContext: typeof React;
var FlipIndicatorContext: React.Context<FlipIndicatorState | null>;
var CdsStashedAttribute: string;
var TabsMenuTriggerValue: string;
var TabsMenuLabelValue: string;
var initializeSwitchContext_2: () => void;
function animateFlipIndicator(
  indicator: HTMLElement,
  container: Element,
  targetGeometry: FlipGeometry | null,
  {
    correction: isCorrection = false,
  }: {
    correction?: boolean;
  } = {},
): void {
  if (targetGeometry === null || targetGeometry.width <= 0) {
    cancelElementAnimations(indicator);
    indicator.style.visibility = "";
    indicator.style.willChange = "";
    delete indicator.dataset.flipAt;
    return;
  }
  let flipKey = `${targetGeometry.left},${targetGeometry.width}`,
    flipAt = indicator.dataset.flipAt;
  if (flipAt === flipKey) return;
  let bounds = indicator.getBoundingClientRect(),
    left = container.getBoundingClientRect().left,
    computedStyle = getComputedStyle(indicator),
    durationMs = cssTimeMilliseconds(computedStyle, "--cds-dur-base"),
    easing = computedStyle.getPropertyValue("--cds-ease-snap").trim() || "linear",
    hasAlpha = backgroundHasAlpha(computedStyle),
    isCorrectionOnly = isCorrection && !hasRunningAnimations(indicator);
  cancelElementAnimations(indicator);
  indicator.dataset.flipAt = flipKey;
  indicator.style.width = `${targetGeometry.width}px`;
  indicator.style.transform = `translateX(${targetGeometry.left}px)`;
  indicator.style.visibility = "inherit";
  hasAlpha || (indicator.style.willChange = "");
  if (
    !(
      flipAt === undefined ||
      !supportsElementAnimations(indicator) ||
      prefersReducedMotion()
    ) &&
    !isCorrectionOnly
  )
    try {
      indicator.animate(
        {
          transform: [
            `translateX(${bounds.left - left}px) scaleX(${bounds.width / targetGeometry.width})`,
            `translateX(${targetGeometry.left}px) scaleX(1)`,
          ],
        },
        {
          duration: durationMs,
          easing: easing,
        },
      );
      durationMs > 0 && setTransformWillChange(indicator, hasAlpha);
    } catch {}
}
function cssTimeMilliseconds(
  style: CSSStyleDeclaration,
  propertyName: string,
): number {
  let value = style.getPropertyValue(propertyName).trim(),
    unitMultiplier = value.endsWith("ms") ? 1 : value.endsWith("s") ? 1e3 : 0;
  return Math.max(0, parseFloat(value) * unitMultiplier) || 0;
}
function supportsElementAnimations(element: Element): boolean {
  return (
    typeof element.animate == "function" &&
    typeof element.getAnimations == "function"
  );
}
function backgroundHasAlpha(style: CSSStyleDeclaration): boolean {
  return /^rgba\(|\//.test(style.backgroundColor);
}
function setTransformWillChange(element: HTMLElement, hasAlpha: boolean): void {
  element.style.willChange = hasAlpha ? "transform" : "";
}
function hasRunningAnimations(element: Element): boolean {
  return (
    supportsElementAnimations(element) &&
    element.getAnimations().some((animation) => animation.playState === "running")
  );
}
function cancelElementAnimations(element: Element): void {
  if (supportsElementAnimations(element))
    for (let value of element.getAnimations()) value.cancel();
}
function hasFlipAnimation(indicator: HTMLElement): boolean {
  return indicator.dataset.flipAt !== undefined;
}
function seekFlipAnimation(
  indicator: HTMLElement,
  progress: number,
  readGeometries: () => readonly FlipGeometry[],
): void {
  if (
    !Number.isFinite(progress) ||
    !hasFlipAnimation(indicator) ||
    !supportsElementAnimations(indicator)
  )
    return;
  let entry = SwitchContextElementCache.get(indicator);
  if (entry?.playState !== "paused") {
    let value = readGeometries();
    if (value.length < 2 || value.some((geometry) => geometry.width <= 0)) return;
    let targetWidth = parseFloat(indicator.style.width),
      hasAlpha = backgroundHasAlpha(getComputedStyle(indicator));
    entry = indicator.animate(
      value.map((geometry) => ({
        transform: `translateX(${geometry.left}px) scaleX(${geometry.width / targetWidth})`,
      })),
      {
        duration: (value.length - 1) * SwitchContextConstant,
        fill: "both",
      },
    );
    entry.pause();
    setTransformWillChange(indicator, hasAlpha);
    SwitchContextElementCache.set(indicator, entry);
    indicator.dataset.flipAt = HeldValue;
  }
  entry.currentTime = progress * SwitchContextConstant;
}
function isFlipIndicatorEntering(indicator: HTMLElement): boolean {
  return indicator.dataset.flipAt === HeldValue;
}
function useFlipIndicatorContext(): FlipIndicatorState | null {
  return (0, reactSwitchContext.useContext)(FlipIndicatorContext);
}
function preventRepeatedEnter(
  event: Pick<React.KeyboardEvent, "repeat" | "key" | "preventDefault">,
): void {
  event.repeat && event.key === "Enter" && event.preventDefault();
}
export {
  animateFlipIndicator,
  backgroundHasAlpha,
  cancelElementAnimations,
  CdsStashedAttribute,
  cssTimeMilliseconds,
  FlipIndicatorContext,
  hasFlipAnimation,
  hasRunningAnimations,
  HeldValue,
  initializeSwitchContext,
  initializeSwitchContext_2,
  isFlipIndicatorEntering,
  preventRepeatedEnter,
  reactSwitchContext,
  seekFlipAnimation,
  setTransformWillChange,
  supportsElementAnimations,
  SwitchContextConstant,
  SwitchContextElementCache,
  TabsMenuLabelValue,
  TabsMenuTriggerValue,
  useFlipIndicatorContext,
};
export function installCdsSwitchContext(): () => void {
  return () => {
    initializeSwitchContext = initializeOnce(() => {
      initializePlatformReducedMotion();
      HeldValue = "held";
      SwitchContextConstant = 1e3;
      SwitchContextElementCache = new WeakMap();
    });
    initializeSwitchContext_2 = initializeOnce(() => {
      "use client";

      reactSwitchContext = toModuleNamespace(
        load_react(),
      );
      FlipIndicatorContext = (0,
      reactSwitchContext.createContext)<FlipIndicatorState | null>(null);
      CdsStashedAttribute = "data-cds-stashed";
      TabsMenuTriggerValue = "tabs-menu-trigger";
      TabsMenuLabelValue = "tabs-menu-label";
    });
  };
}
