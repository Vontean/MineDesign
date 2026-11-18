import type { KeyboardInset } from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { asElement, initializeHooksStableCallback, initializeHooksStableCallback_2, useStableCallback } from "../hooks/stable-callback";
import { initializeCdsRoot, useCdsWindow } from "../theme/root";
import { load_react } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactSheetsKeyboardViewport: typeof React;
var textInputSelector: string;
var SheetsKeyboardViewportConstant: number;
var SheetsKeyboardViewportLimit: number;
var initializeSheetsKeyboardViewport: () => void;
function isTextInputElement(element: Element | null | undefined): boolean {
  return element == null
    ? false
    : element.matches(
          'input:not([type=button],[type=checkbox],[type=radio],[type=range],[type=submit],[type=reset],[type=color],[type=file],[type=image],[type=hidden],[readonly]), textarea:not([readonly]), [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]',
        )
      ? true
      : (asElement(element) as HTMLElement | null)
          ?.isContentEditable === true;
}
function measureKeyboardInset(targetWindow: Window): KeyboardInset | null {
  let visualViewport = targetWindow.visualViewport;
  if (
    visualViewport == null ||
    Math.abs((visualViewport.scale ?? 1) - 1) > SheetsKeyboardViewportLimit
  )
    return null;
  let clientHeight = targetWindow.document.documentElement.clientHeight;
  return {
    inset: Math.max(
      0,
      Math.round(
        clientHeight - (visualViewport.offsetTop + visualViewport.height),
      ),
    ),
    visible: Math.round(visualViewport.height),
    offset: Math.max(0, Math.round(visualViewport.offsetTop)),
  };
}
function useKeyboardViewport(
  isActive: boolean,
  onInsetChange: (inset: KeyboardInset | null) => void,
  {
    unpan: shouldUnpan = false,
  }: {
    unpan?: boolean;
  } = {},
): void {
  let cdsWindow = useCdsWindow(),
    notifyInsetChange = useStableCallback(onInsetChange);
  (0, reactSheetsKeyboardViewport.useEffect)(() => {
    if (!isActive || cdsWindow === undefined) return;
    let visualViewport = cdsWindow.visualViewport;
    if (visualViewport == null) return;
    let lastInset: KeyboardInset | null = null,
      hasUnpanned = false,
      animationFrameId = 0,
      measureInset = () => {
        animationFrameId = 0;
        let measuredInset = measureKeyboardInset(cdsWindow),
          clientHeight = cdsWindow.document.documentElement.clientHeight,
          isKeyboardVisible =
            measuredInset !== null &&
            measuredInset.visible < clientHeight - SheetsKeyboardViewportConstant,
          currentInset = isKeyboardVisible ? measuredInset : null;
        (currentInset?.inset !== lastInset?.inset ||
          currentInset?.visible !== lastInset?.visible ||
          currentInset?.offset !== lastInset?.offset) &&
          ((lastInset = currentInset), notifyInsetChange(currentInset));
        shouldUnpan &&
          isKeyboardVisible &&
          !hasUnpanned &&
          visualViewport.offsetTop > 0 &&
          ((hasUnpanned = true),
          cdsWindow.document.documentElement.scrollIntoView({
            block: "start",
            inline: "start",
            behavior: "instant",
          }),
          cdsWindow.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant",
          }));
        isKeyboardVisible || (hasUnpanned = false);
      },
      scheduleMeasure = () => {
        animationFrameId === 0 && (animationFrameId = cdsWindow.requestAnimationFrame(measureInset));
      };
    measureInset();
    visualViewport.addEventListener("resize", scheduleMeasure);
    visualViewport.addEventListener("scroll", scheduleMeasure);
    return () => {
      visualViewport.removeEventListener("resize", scheduleMeasure);
      visualViewport.removeEventListener("scroll", scheduleMeasure);
      animationFrameId !== 0 && cdsWindow.cancelAnimationFrame(animationFrameId);
      notifyInsetChange(null);
    };
  }, [isActive, cdsWindow, notifyInsetChange, shouldUnpan]);
}
export {
  initializeSheetsKeyboardViewport,
  isTextInputElement,
  measureKeyboardInset,
  reactSheetsKeyboardViewport,
  SheetsKeyboardViewportConstant,
  SheetsKeyboardViewportLimit,
  textInputSelector,
  useKeyboardViewport,
};
export function installCdsSheetsKeyboardViewport(): () => void {
  return () => {
    initializeSheetsKeyboardViewport = initializeOnce(() => {
      "use client";

      initializeCdsRoot();
      initializeHooksStableCallback();
      initializeHooksStableCallback_2();
      reactSheetsKeyboardViewport = toModuleNamespace(
        load_react(),
      );
      textInputSelector =
        'input:not([type=button],[type=checkbox],[type=radio],[type=range],[type=submit],[type=reset],[type=color],[type=file],[type=image],[type=hidden],[readonly]), textarea:not([readonly]), [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]';
      SheetsKeyboardViewportConstant = 120;
      SheetsKeyboardViewportLimit = 0.01;
    });
  };
}
