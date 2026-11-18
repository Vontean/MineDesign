import type { OverlayPresentation } from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { initializeHooksLayoutEffect, useIsomorphicLayoutEffect } from "../hooks/layout-effect";
import { getMediaQueryStore, HooksMediaQueryHandler, HooksMediaQueryHandler_2, initializeHooksMediaQuery, mobileSheetMediaQuery, useWindowMediaQuery } from "../hooks/media-query";
import { initializeSheetsKeyboardViewport, textInputSelector } from "./keyboard-viewport";
import { initializeCdsRoot, useCdsWindow } from "../theme/root";
import { load_react } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactSheetsPresentation: typeof React;
var OverlayPresentationContext: React.Context<OverlayPresentation>;
var drilledSheetAttribute: string;
var coveredSheetAttribute: string;
var CdsSheetPeelingAttribute: string;
var CdsSheetTreeClosingAttribute: string;
var sheetScrollAttribute: string;
var CdsSheetPressedAttribute: string;
var CdsSheetControlHeldAttribute: string;
var SheetsPresentationDelayMs: number;
var initializeSheetsPresentation: () => void;
function useMobileSheets(): boolean {
  return useWindowMediaQuery(
    useCdsWindow(),
    mobileSheetMediaQuery,
  );
}
function useOverlayPresentation(): OverlayPresentation {
  return (0, reactSheetsPresentation.useContext)(OverlayPresentationContext);
}
function useTouchOverlay(): boolean {
  "use no memo";

  let value = useOverlayPresentation(),
    cdsWindow = useCdsWindow(),
    isCoarsePointer = (0, reactSheetsPresentation.useSyncExternalStore)(
      HooksMediaQueryHandler,
      () =>
        cdsWindow !== undefined &&
        (getMediaQueryStore(
          cdsWindow,
          "(pointer: coarse)",
        )?.getSnapshot() ??
          false),
      HooksMediaQueryHandler_2,
    );
  return value === "sheet" || isCoarsePointer;
}
function sheetNeedsScrolling(sheetElement: Element): boolean {
  if (sheetContainsTextInput(sheetElement)) return true;
  for (let value of Array.from(
    sheetElement.querySelectorAll<HTMLElement>(`[${sheetScrollAttribute}]`),
  ))
    if (value.scrollHeight > value.clientHeight + 1) return true;
  return false;
}
function sheetContainsTextInput(element: Element): boolean {
  return element.querySelector(textInputSelector) !== null;
}
function shouldUseSheet(
  presentation: OverlayPresentation,
  isSheetDisabled: boolean,
  prefersMobileSheet: boolean,
): boolean {
  return isSheetDisabled ? false : presentation !== "auto" ? presentation === "sheet" : prefersMobileSheet;
}
function useFrozenSheetMode(
  wantsSheet: boolean,
  isOpen: boolean,
  isShowing: boolean,
): boolean {
  let [value, setFrozenSheetMode] = (0, reactSheetsPresentation.useState)(wantsSheet),
    [previousOpen, setPreviousOpen] = (0, reactSheetsPresentation.useState)(isOpen);
  return isOpen !== previousOpen && (setPreviousOpen(isOpen), isOpen)
    ? (setFrozenSheetMode(wantsSheet), wantsSheet)
    : isShowing
      ? value
      : wantsSheet;
}
function useSheetPendingUnmount(isOpen: boolean): {
  showing: boolean;
  onOpenChangeComplete: (open: boolean) => void;
} {
  let [value, setIsLingering] = (0, reactSheetsPresentation.useState)(isOpen);
  isOpen && !value && setIsLingering(true);
  let handleOpenChangeComplete = (0, reactSheetsPresentation.useCallback)(
    (nextOpen: boolean): void => {
      nextOpen || setIsLingering(false);
    },
    [],
  );
  (0, reactSheetsPresentation.useEffect)(() => {
    if (isOpen || !value) return;
    let unmountTimerId = setTimeout(() => {
      setIsLingering(false);
    }, SheetsPresentationDelayMs);
    return () => {
      clearTimeout(unmountTimerId);
    };
  }, [isOpen, value]);
  return {
    showing: isOpen || value,
    onOpenChangeComplete: handleOpenChangeComplete,
  };
}
function useOpenSnapshot<Value>(
  isOpen: boolean,
  readValue: () => Value,
  initialValue: Value,
): Value {
  let [value, setSnapshot] = (0, reactSheetsPresentation.useState)(() => ({
      wasOpen: isOpen,
      value: isOpen ? readValue() : initialValue,
    })),
    readValueRef = (0, reactSheetsPresentation.useRef)(readValue);
  useIsomorphicLayoutEffect(() => {
    readValueRef.current = readValue;
  });
  useIsomorphicLayoutEffect(() => {
    if (!isOpen) return;
    let latestValue = readValueRef.current();
    setSnapshot((previousSnapshot) =>
      previousSnapshot.wasOpen && Object.is(previousSnapshot.value, latestValue)
        ? previousSnapshot
        : {
            wasOpen: true,
            value: latestValue,
          },
    );
  }, [isOpen]);
  if (isOpen !== value.wasOpen) {
    let nextValue = isOpen ? readValue() : value.value;
    setSnapshot({
      wasOpen: isOpen,
      value: nextValue,
    });
    return nextValue;
  }
  return value.value;
}
export {
  CdsSheetControlHeldAttribute,
  CdsSheetPeelingAttribute,
  CdsSheetPressedAttribute,
  CdsSheetTreeClosingAttribute,
  coveredSheetAttribute,
  drilledSheetAttribute,
  initializeSheetsPresentation,
  OverlayPresentationContext,
  reactSheetsPresentation,
  sheetContainsTextInput,
  sheetNeedsScrolling,
  sheetScrollAttribute,
  SheetsPresentationDelayMs,
  shouldUseSheet,
  useFrozenSheetMode,
  useMobileSheets,
  useOpenSnapshot,
  useOverlayPresentation,
  useSheetPendingUnmount,
  useTouchOverlay,
};
export function installCdsSheetsPresentation(): () => void {
  return () => {
    initializeSheetsPresentation = initializeOnce(() => {
      "use client";

      initializeHooksMediaQuery();
      initializeHooksLayoutEffect();
      initializeCdsRoot();
      initializeSheetsKeyboardViewport();
      reactSheetsPresentation = toModuleNamespace(
        load_react(),
      );
      OverlayPresentationContext = (0,
      reactSheetsPresentation.createContext)<OverlayPresentation>("auto");
      drilledSheetAttribute = "data-cds-sheet-drilled";
      coveredSheetAttribute = "data-cds-sheet-covered";
      CdsSheetPeelingAttribute = "data-cds-sheet-peeling";
      CdsSheetTreeClosingAttribute = "data-cds-sheet-tree-closing";
      sheetScrollAttribute = "data-cds-sheet-scroll";
      CdsSheetPressedAttribute = "data-cds-sheet-pressed";
      CdsSheetControlHeldAttribute = "data-cds-sheet-control-held";
      SheetsPresentationDelayMs = 1e3;
    });
  };
}
