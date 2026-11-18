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
    value2 = useCdsWindow(),
    value3 = (0, reactSheetsPresentation.useSyncExternalStore)(
      HooksMediaQueryHandler,
      () =>
        value2 !== undefined &&
        (getMediaQueryStore(
          value2,
          "(pointer: coarse)",
        )?.getSnapshot() ??
          false),
      HooksMediaQueryHandler_2,
    );
  return value === "sheet" || value3;
}
function sheetNeedsScrolling(input: Element): boolean {
  if (sheetContainsTextInput(input)) return true;
  for (let value of Array.from(
    input.querySelectorAll<HTMLElement>(`[${sheetScrollAttribute}]`),
  ))
    if (value.scrollHeight > value.clientHeight + 1) return true;
  return false;
}
function sheetContainsTextInput(element: Element): boolean {
  return element.querySelector(textInputSelector) !== null;
}
function shouldUseSheet(
  input: OverlayPresentation,
  options: boolean,
  context: boolean,
): boolean {
  return options ? false : input !== "auto" ? input === "sheet" : context;
}
function useFrozenSheetMode(
  input: boolean,
  options: boolean,
  context: boolean,
): boolean {
  let [value, value2] = (0, reactSheetsPresentation.useState)(input),
    [value3, value4] = (0, reactSheetsPresentation.useState)(options);
  return options !== value3 && (value4(options), options)
    ? (value2(input), input)
    : context
      ? value
      : input;
}
function useSheetPendingUnmount(input: boolean): {
  showing: boolean;
  onOpenChangeComplete: (open: boolean) => void;
} {
  let [value, value2] = (0, reactSheetsPresentation.useState)(input);
  input && !value && value2(true);
  let value3 = (0, reactSheetsPresentation.useCallback)(
    (input2: boolean): void => {
      input2 || value2(false);
    },
    [],
  );
  (0, reactSheetsPresentation.useEffect)(() => {
    if (input || !value) return;
    let value4 = setTimeout(() => {
      value2(false);
    }, SheetsPresentationDelayMs);
    return () => {
      clearTimeout(value4);
    };
  }, [input, value]);
  return {
    showing: input || value,
    onOpenChangeComplete: value3,
  };
}
function useOpenSnapshot<Value>(
  input: boolean,
  options: () => Value,
  context: Value,
): Value {
  let [value, value2] = (0, reactSheetsPresentation.useState)(() => ({
      wasOpen: input,
      value: input ? options() : context,
    })),
    value3 = (0, reactSheetsPresentation.useRef)(options);
  useIsomorphicLayoutEffect(() => {
    value3.current = options;
  });
  useIsomorphicLayoutEffect(() => {
    if (!input) return;
    let value4 = value3.current();
    value2((input2) =>
      input2.wasOpen && Object.is(input2.value, value4)
        ? input2
        : {
            wasOpen: true,
            value: value4,
          },
    );
  }, [input]);
  if (input !== value.wasOpen) {
    let value4 = input ? options() : value.value;
    value2({
      wasOpen: input,
      value: value4,
    });
    return value4;
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
