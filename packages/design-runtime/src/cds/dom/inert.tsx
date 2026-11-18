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
function getInertProps(input: boolean | undefined): {
  inert?: true | "";
} {
  return input
    ? {
        inert: DomInertResolvedValue ? true : "",
      }
    : {};
}
function createSheetMutableCell<Value = SheetFrame>(): MutableCell<Value> {
  let value: Value | null = null;
  return {
    get: () => value,
    set: (input) => {
      value = input;
    },
  };
}
function sheetFrameHeight(
  input: SheetFrame | null,
  options?: Pick<Window, "innerHeight">,
): number | undefined {
  if (input !== null)
    return input.detent === "tall" && options !== undefined
      ? Math.round(options.innerHeight * SheetsLayoutConstant)
      : input.height;
}
function sheetStackMaxHeight(
  input: readonly SheetFrame[],
): number | undefined {
  let value = input[0],
    value2 = input.at(-1);
  return value === undefined || value2 === undefined
    ? undefined
    : Math.max(value2.height, value.height);
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
