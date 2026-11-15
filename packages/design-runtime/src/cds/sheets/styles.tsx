import type { LabelResolver, LabelValues } from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { createSheetMutableCell } from "../dom/inert";
import { initializeHooksLayoutEffect, useIsomorphicLayoutEffect } from "../hooks/layout-effect";
import { initializePlatformReducedMotion, initializePlatformReducedMotion_2, PlatformReducedMotionLabel } from "../platform/reduced-motion";
import { calculateSheetDetents, calculateSheetPosition, initializeSheetsGesturePhysics, settleSheetGesture, sheetPositionToRawHeight } from "./gesture-physics";
import { initializeSheetsLayout, SheetsLayoutConstant, SheetsLayoutCss } from "./layout";
import { initializeSheetsPopupStack, prefersReducedMotion, SheetPopupContext } from "./popup-stack";
import { load_react } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactSheetsStyles: Dynamic;
var initializeSheetsStyles: Dynamic;
var reactSheetsStyles_2: typeof React;
var LabelsProviderContext: React.Context<LabelResolver | undefined>;
var initializeSheetsStyles_2: Dynamic;
function clearSheetTransition(input?: Dynamic): Dynamic {
  input.style.transition = "";
  input.style.translate = "";
}
function useSheetState_2(): Dynamic {
  let value: Dynamic = (0, reactSheetsStyles.useContext)(
      SheetPopupContext,
    ),
    [value2]: Dynamic = (0, reactSheetsStyles.useState)((): Dynamic => ({})),
    [value3]: Dynamic = (0, reactSheetsStyles.useState)(
      createSheetMutableCell,
    ),
    value4: Dynamic = value?.drag ?? value3,
    callback: Dynamic = (element?: Dynamic): Dynamic =>
      value === null
        ? []
        : Array.from(
            element.ownerDocument.querySelectorAll(
              `[data-presentation="sheet"][data-sheet-tree="${CSS.escape(value.treeId)}"]:not([data-ending-style])`,
            ),
          ),
    callback2: Dynamic = (input?: Dynamic, options?: Dynamic): Dynamic => {
      let {
        height: value7,
        slide: value8,
        shown: value9,
      }: Dynamic = (0, calculateSheetPosition)(
        input,
        input.raw - options,
      );
      for (let { el: value11 } of input.sheets as Dynamic) {
        value11.style.height = `${value7}px`;
        value11.style.translate = value8 > 0 ? `0 ${value8}px` : "";
      }
      let value10: Dynamic = value9 < 1 ? value9.toFixed(3) : "";
      for (let value11 of input.scrims as Dynamic)
        value11.style.opacity !== value10 &&
          (value11.style.opacity = value10);
    },
    callback3: Dynamic = (event?: Dynamic): Dynamic => {
      if (
        value === null ||
        !value.open ||
        event.button !== 0 ||
        value4.get() !== null ||
        value.keyboard !== null ||
        (event.target instanceof Element &&
          event.target.closest(
            'button, a, input, textarea, [role="menuitem"], [role="option"], [data-cds-sheet-control]',
          ) !== null) ||
        event.currentTarget.closest("[data-cds-sheet-covered]") !== null
      )
        return;
      let ancestor: Dynamic = event.currentTarget.closest(
        '[data-presentation="sheet"]',
      );
      if (ancestor === null) return;
      let bounds: Dynamic = ancestor.getBoundingClientRect(),
        height: Dynamic = bounds.height,
        value7: Dynamic =
          ancestor.parentElement?.getBoundingClientRect().bottom,
        value8: Dynamic = Math.max(
          0,
          bounds.bottom - (value7 ?? bounds.bottom),
        ),
        value9: Dynamic =
          ancestor.ownerDocument.defaultView?.innerHeight ?? height;
      event.currentTarget.setPointerCapture(event.pointerId);
      let value10: Dynamic = callback(ancestor).map(
          (input?: Dynamic): Dynamic => {
            let height2: Dynamic = input.style.height;
            input.style.transition = "none";
            input.style.height = `${height}px`;
            return {
              el: input,
              height: height2,
            };
          },
        ),
        value11: Dynamic = value.canGrow || value.detent === "tall",
        value12: Dynamic = (0, calculateSheetDetents)(
          Math.min(value.height ?? height, height),
          value9,
          SheetsLayoutConstant,
          value11,
        ),
        value13: Dynamic =
          (0, prefersReducedMotion)() || !value11
            ? {
                ...value12,
                room: 0,
              }
            : value12,
        value14: Dynamic = Array.from(
          ancestor.ownerDocument.querySelectorAll(
            `[data-presentation="sheet"][data-sheet-scrim="${CSS.escape(value.treeId)}"]`,
          ),
        );
      for (let value15 of value14 as Dynamic)
        value15.style.transition = "none";
      let state: Dynamic = {
        owner: value2,
        pointerId: event.pointerId,
        startY: event.clientY,
        lastY: event.clientY,
        lastT: event.timeStamp,
        velocity: 0,
        detent: value.detent,
        raw: (0, sheetPositionToRawHeight)(value13, height, value8),
        caughtSlide: value8,
        ...value13,
        sheets: value10,
        doc: ancestor.ownerDocument,
        scrims: value14,
      };
      value4.set(state);
      callback2(state, 0);
    },
    callback4: Dynamic = (input?: Dynamic): Dynamic => {
      let entry: Dynamic = value4.get();
      if (
        entry === null ||
        entry.owner !== value2 ||
        input.pointerId !== entry.pointerId
      )
        return;
      let value7: Dynamic = input.timeStamp - entry.lastT;
      value7 > 0 && (entry.velocity = (input.clientY - entry.lastY) / value7);
      entry.lastY = input.clientY;
      entry.lastT = input.timeStamp;
      callback2(entry, input.clientY - entry.startY);
    },
    callback5: Dynamic = (input?: Dynamic, options?: Dynamic): Dynamic => {
      for (let { el: value7, height: value8 } of input.sheets as Dynamic) {
        value7.style.transition = "";
        options
          ? (value7.style.translate = `0 ${PlatformReducedMotionLabel}`)
          : ((value7.style.height = value8), (value7.style.translate = ""));
      }
      for (let value7 of input.scrims as Dynamic) {
        value7.style.transition = "";
        value7.style.opacity = "";
      }
    },
    value5: Dynamic = value?.open ?? false;
  (0, useIsomorphicLayoutEffect)((): Dynamic => {
    let entry: Dynamic = value4.get();
    !value5 &&
      entry !== null &&
      entry.owner === value2 &&
      (value4.set(null), callback5(entry, false));
  }, [value5, value4, value2]);
  let value6: Dynamic = (0, reactSheetsStyles.useRef)({
    open: false,
    height: undefined,
    detent: "default",
  });
  (0, useIsomorphicLayoutEffect)((): Dynamic => {
    value6.current = {
      open: value?.open ?? false,
      height: value?.height,
      detent: value?.detent ?? "default",
    };
  }, [value]);
  (0, reactSheetsStyles.useEffect)(
    (): Dynamic => (): Dynamic => {
      let entry: Dynamic = value4.get();
      entry !== null &&
        entry.owner === value2 &&
        (value4.set(null), callback5(entry, false));
    },
    [value4, value2],
  );
  let callback6: Dynamic = (input?: Dynamic, options?: Dynamic): Dynamic => {
    let entry: Dynamic = value4.get();
    if (
      entry === null ||
      entry.owner !== value2 ||
      value === null ||
      input.pointerId !== entry.pointerId
    )
      return;
    value4.set(null);
    input.currentTarget.hasPointerCapture(input.pointerId) &&
      input.currentTarget.releasePointerCapture(input.pointerId);
    let value7: Dynamic = entry.lastY - entry.startY,
      value8: Dynamic =
        input.timeStamp - entry.lastT > 100 ? 0 : entry.velocity,
      { dismiss: value9, detent: value10 }: Dynamic = (0,
      settleSheetGesture)(entry, {
        detent: entry.detent,
        rawAtGrab: entry.raw,
        rawAtRelease: entry.raw - value7,
        caughtSlide: entry.caughtSlide,
        velocity: value8,
        commit: options,
      });
    callback5(entry, value9);
    if (value9) {
      value.dismiss();
      let { doc: value11 }: Dynamic = entry;
      value11.defaultView?.requestAnimationFrame((): Dynamic => {
        let current: Dynamic = value6.current;
        if (!current.open) return;
        let value12: Dynamic =
          current.detent === "tall"
            ? SheetsLayoutCss
            : current.height !== undefined
              ? `${current.height}px`
              : "";
        for (let value13 of value11.querySelectorAll(
          `[data-sheet-tree="${CSS.escape(value.treeId)}"][data-presentation="sheet"]`,
        ) as Dynamic) {
          clearSheetTransition(value13);
          value13.style.height = value12;
        }
      });
    } else value10 !== entry.detent && value.setDetent(value10);
  };
  return {
    onPointerDown: callback3,
    onPointerMove: callback4,
    onPointerUp: (input?: Dynamic): Dynamic => callback6(input, true),
    onPointerCancel: (input?: Dynamic): Dynamic => callback6(input, false),
    onLostPointerCapture: (input?: Dynamic): Dynamic =>
      callback6(input, false),
  };
}
function interpolateLabel(input: string, options?: LabelValues): string {
  return options
    ? input.replace(/\{(\w+)\}/g, (input2, options2) =>
        options2 in options ? String(options[options2]) : input2,
      )
    : input;
}
function resolveLabel(
  input: LabelResolver | undefined,
  options: string,
  context: string,
  value?: LabelValues,
): string {
  return input?.(options, context, value) || interpolateLabel(context, value);
}
function useLabel(
  input: string,
  options: string,
  context?: LabelValues,
): string {
  return resolveLabel(
    (0, reactSheetsStyles_2.useContext)(LabelsProviderContext),
    input,
    options,
    context,
  );
}
export {
  clearSheetTransition,
  initializeSheetsStyles,
  initializeSheetsStyles_2,
  interpolateLabel,
  LabelsProviderContext,
  reactSheetsStyles,
  reactSheetsStyles_2,
  resolveLabel,
  useLabel,
  useSheetState_2,
};
export function installCdsSheetsStyles(): () => void {
  return () => {
    initializeSheetsStyles = (0, initializeOnce)((): Dynamic => {
      "use client";

      (0, initializeHooksLayoutEffect)();
      (0, initializePlatformReducedMotion)();
      (0, initializeSheetsGesturePhysics)();
      (0, initializeSheetsLayout)();
      (0, initializeSheetsPopupStack)();
      (0, initializePlatformReducedMotion_2)();
      reactSheetsStyles = (0, toModuleNamespace)(
        (0, load_react)(),
      );
    });
    initializeSheetsStyles_2 = (0, initializeOnce)((): Dynamic => {
      reactSheetsStyles_2 = (0, toModuleNamespace)(
        (0, load_react)(),
      );
      LabelsProviderContext = (0, reactSheetsStyles_2.createContext)<
        LabelResolver | undefined
      >(undefined);
    });
  };
}
