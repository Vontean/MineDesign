import type { MutableCell, SheetFrame } from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { SheetsLayoutConstant } from "../sheets/layout";
import { load_react } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactDomInert: typeof React;
var DomInertParseIntValue: number;
var DomInertResolvedValue: boolean;
var initializeDomInert: () => void;
function getInertProps(isInert: boolean | undefined): {
  inert?: true | "";
} {
  return isInert
    ? {
        inert: DomInertResolvedValue ? true : "",
      }
    : {};
}
function createSheetMutableCell<Value = SheetFrame>(): MutableCell<Value> {
  let currentValue: Value | null = null;
  return {
    get: () => currentValue,
    set: (nextValue) => {
      currentValue = nextValue;
    },
  };
}
function sheetFrameHeight(
  frame: SheetFrame | null,
  view?: Pick<Window, "innerHeight">,
): number | undefined {
  if (frame !== null)
    return frame.detent === "tall" && view !== undefined
      ? Math.round(view.innerHeight * SheetsLayoutConstant)
      : frame.height;
}
function sheetStackMaxHeight(
  frames: readonly SheetFrame[],
): number | undefined {
  let firstFrame = frames[0],
    lastFrame = frames.at(-1);
  return firstFrame === undefined || lastFrame === undefined
    ? undefined
    : Math.max(lastFrame.height, firstFrame.height);
}
export {
  createSheetMutableCell,
  DomInertParseIntValue,
  DomInertResolvedValue,
  getInertProps,
  initializeDomInert,
  reactDomInert,
  sheetFrameHeight,
  sheetStackMaxHeight,
};
export function installCdsDomInert(): () => void {
  return () => {
    initializeDomInert = initializeOnce(() => {
      reactDomInert = toModuleNamespace(load_react());
      DomInertParseIntValue = Number.parseInt(reactDomInert.version, 10);
      DomInertResolvedValue =
        !Number.isFinite(DomInertParseIntValue) ||
        DomInertParseIntValue === 0 ||
        DomInertParseIntValue >= 19;
    });
  };
}
