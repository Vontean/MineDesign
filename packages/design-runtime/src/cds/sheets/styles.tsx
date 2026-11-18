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
function clearSheetTransition(sheetElement?: Dynamic): Dynamic {
  sheetElement.style.transition = "";
  sheetElement.style.translate = "";
}
function useSheetState_2(): Dynamic {
  let value: Dynamic = (0, reactSheetsStyles.useContext)(
      SheetPopupContext,
    ),
    [ownerToken]: Dynamic = (0, reactSheetsStyles.useState)((): Dynamic => ({})),
    [fallbackDragCell]: Dynamic = (0, reactSheetsStyles.useState)(
      createSheetMutableCell,
    ),
    dragCell: Dynamic = value?.drag ?? fallbackDragCell,
    callback: Dynamic = (element?: Dynamic): Dynamic =>
      value === null
        ? []
        : Array.from(
            element.ownerDocument.querySelectorAll(
              `[data-presentation="sheet"][data-sheet-tree="${CSS.escape(value.treeId)}"]:not([data-ending-style])`,
            ),
          ),
    applyDragFrame: Dynamic = (dragState?: Dynamic, dragDelta?: Dynamic): Dynamic => {
      let {
        height: sheetHeight,
        slide: slideOffset,
        shown: shownRatio,
      }: Dynamic = calculateSheetPosition(
        dragState,
        dragState.raw - dragDelta,
      );
      for (let { el: sheetElement } of dragState.sheets as Dynamic) {
        sheetElement.style.height = `${sheetHeight}px`;
        sheetElement.style.translate = slideOffset > 0 ? `0 ${slideOffset}px` : "";
      }
      let scrimOpacity: Dynamic = shownRatio < 1 ? shownRatio.toFixed(3) : "";
      for (let scrim of dragState.scrims as Dynamic)
        scrim.style.opacity !== scrimOpacity &&
          (scrim.style.opacity = scrimOpacity);
    },
    handlePointerDown: Dynamic = (event?: Dynamic): Dynamic => {
      if (
        value === null ||
        !value.open ||
        event.button !== 0 ||
        dragCell.get() !== null ||
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
        parentBottom: Dynamic =
          ancestor.parentElement?.getBoundingClientRect().bottom,
        bottomInset: Dynamic = Math.max(
          0,
          bounds.bottom - (parentBottom ?? bounds.bottom),
        ),
        viewportHeight: Dynamic =
          ancestor.ownerDocument.defaultView?.innerHeight ?? height;
      event.currentTarget.setPointerCapture(event.pointerId);
      let sheetSnapshots: Dynamic = callback(ancestor).map(
          (sheetElement?: Dynamic): Dynamic => {
            let originalHeight: Dynamic = sheetElement.style.height;
            sheetElement.style.transition = "none";
            sheetElement.style.height = `${height}px`;
            return {
              el: sheetElement,
              height: originalHeight,
            };
          },
        ),
        canGrow: Dynamic = value.canGrow || value.detent === "tall",
        detents: Dynamic = calculateSheetDetents(
          Math.min(value.height ?? height, height),
          viewportHeight,
          SheetsLayoutConstant,
          canGrow,
        ),
        effectiveDetents: Dynamic =
          prefersReducedMotion() || !canGrow
            ? {
                ...detents,
                room: 0,
              }
            : detents,
        scrims: Dynamic = Array.from(
          ancestor.ownerDocument.querySelectorAll(
            `[data-presentation="sheet"][data-sheet-scrim="${CSS.escape(value.treeId)}"]`,
          ),
        );
      for (let scrim of scrims as Dynamic)
        scrim.style.transition = "none";
      let state: Dynamic = {
        owner: ownerToken,
        pointerId: event.pointerId,
        startY: event.clientY,
        lastY: event.clientY,
        lastT: event.timeStamp,
        velocity: 0,
        detent: value.detent,
        raw: sheetPositionToRawHeight(effectiveDetents, height, bottomInset),
        caughtSlide: bottomInset,
        ...effectiveDetents,
        sheets: sheetSnapshots,
        doc: ancestor.ownerDocument,
        scrims: scrims,
      };
      dragCell.set(state);
      applyDragFrame(state, 0);
    },
    handlePointerMove: Dynamic = (event?: Dynamic): Dynamic => {
      let entry: Dynamic = dragCell.get();
      if (
        entry === null ||
        entry.owner !== ownerToken ||
        event.pointerId !== entry.pointerId
      )
        return;
      let elapsed: Dynamic = event.timeStamp - entry.lastT;
      elapsed > 0 && (entry.velocity = (event.clientY - entry.lastY) / elapsed);
      entry.lastY = event.clientY;
      entry.lastT = event.timeStamp;
      applyDragFrame(entry, event.clientY - entry.startY);
    },
    restoreDragStyles: Dynamic = (dragState?: Dynamic, isDismissing?: Dynamic): Dynamic => {
      for (let { el: sheetElement, height: originalHeight } of dragState.sheets as Dynamic) {
        sheetElement.style.transition = "";
        isDismissing
          ? (sheetElement.style.translate = `0 ${PlatformReducedMotionLabel}`)
          : ((sheetElement.style.height = originalHeight), (sheetElement.style.translate = ""));
      }
      for (let scrim of dragState.scrims as Dynamic) {
        scrim.style.transition = "";
        scrim.style.opacity = "";
      }
    },
    isOpen: Dynamic = value?.open ?? false;
  useIsomorphicLayoutEffect((): Dynamic => {
    let entry: Dynamic = dragCell.get();
    !isOpen &&
      entry !== null &&
      entry.owner === ownerToken &&
      (dragCell.set(null), restoreDragStyles(entry, false));
  }, [isOpen, dragCell, ownerToken]);
  let latestStateRef: Dynamic = (0, reactSheetsStyles.useRef)({
    open: false,
    height: undefined,
    detent: "default",
  });
  useIsomorphicLayoutEffect((): Dynamic => {
    latestStateRef.current = {
      open: value?.open ?? false,
      height: value?.height,
      detent: value?.detent ?? "default",
    };
  }, [value]);
  (0, reactSheetsStyles.useEffect)(
    (): Dynamic => (): Dynamic => {
      let entry: Dynamic = dragCell.get();
      entry !== null &&
        entry.owner === ownerToken &&
        (dragCell.set(null), restoreDragStyles(entry, false));
    },
    [dragCell, ownerToken],
  );
  let finishDrag: Dynamic = (event?: Dynamic, shouldCommit?: Dynamic): Dynamic => {
    let entry: Dynamic = dragCell.get();
    if (
      entry === null ||
      entry.owner !== ownerToken ||
      value === null ||
      event.pointerId !== entry.pointerId
    )
      return;
    dragCell.set(null);
    event.currentTarget.hasPointerCapture(event.pointerId) &&
      event.currentTarget.releasePointerCapture(event.pointerId);
    let totalDrag: Dynamic = entry.lastY - entry.startY,
      releaseVelocity: Dynamic =
        event.timeStamp - entry.lastT > 100 ? 0 : entry.velocity,
      { dismiss: dismissed, detent: nextDetent }: Dynamic = settleSheetGesture(entry, {
        detent: entry.detent,
        rawAtGrab: entry.raw,
        rawAtRelease: entry.raw - totalDrag,
        caughtSlide: entry.caughtSlide,
        velocity: releaseVelocity,
        commit: shouldCommit,
      });
    restoreDragStyles(entry, dismissed);
    if (dismissed) {
      value.dismiss();
      let { doc: doc }: Dynamic = entry;
      doc.defaultView?.requestAnimationFrame((): Dynamic => {
        let current: Dynamic = latestStateRef.current;
        if (!current.open) return;
        let restoredHeight: Dynamic =
          current.detent === "tall"
            ? SheetsLayoutCss
            : current.height !== undefined
              ? `${current.height}px`
              : "";
        for (let sheetElement of doc.querySelectorAll(
          `[data-sheet-tree="${CSS.escape(value.treeId)}"][data-presentation="sheet"]`,
        ) as Dynamic) {
          clearSheetTransition(sheetElement);
          sheetElement.style.height = restoredHeight;
        }
      });
    } else nextDetent !== entry.detent && value.setDetent(nextDetent);
  };
  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: (event?: Dynamic): Dynamic => finishDrag(event, true),
    onPointerCancel: (event?: Dynamic): Dynamic => finishDrag(event, false),
    onLostPointerCapture: (event?: Dynamic): Dynamic =>
      finishDrag(event, false),
  };
}
function interpolateLabel(template: string, values?: LabelValues): string {
  return values
    ? template.replace(/\{(\w+)\}/g, (match, key) =>
        key in values ? String(values[key]) : match,
      )
    : template;
}
function resolveLabel(
  resolver: LabelResolver | undefined,
  key: string,
  fallback: string,
  values?: LabelValues,
): string {
  return resolver?.(key, fallback, values) || interpolateLabel(fallback, values);
}
function useLabel(
  key: string,
  fallback: string,
  values?: LabelValues,
): string {
  return resolveLabel(
    (0, reactSheetsStyles_2.useContext)(LabelsProviderContext),
    key,
    fallback,
    values,
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
    initializeSheetsStyles = initializeOnce((): Dynamic => {
      "use client";

      initializeHooksLayoutEffect();
      initializePlatformReducedMotion();
      initializeSheetsGesturePhysics();
      initializeSheetsLayout();
      initializeSheetsPopupStack();
      initializePlatformReducedMotion_2();
      reactSheetsStyles = toModuleNamespace(
        load_react(),
      );
    });
    initializeSheetsStyles_2 = initializeOnce((): Dynamic => {
      reactSheetsStyles_2 = toModuleNamespace(
        load_react(),
      );
      LabelsProviderContext = (0, reactSheetsStyles_2.createContext)<
        LabelResolver | undefined
      >(undefined);
    });
  };
}
