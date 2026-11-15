import type * as React from "react";
import type * as Token from "../contracts/token-editors";
import type * as Model from "../contracts";
import type * as Color from "../contracts/color-controls";
/** Restored application module; prepare first, initialize in original order. */

var EDITABLE_CSS_LENGTH_PATTERN: RegExp;
var MAX_EDITABLE_CSS_LENGTH: number;
function parseEditableCssLength(value: string): Token.EditableLength | null {
  let value2 = EDITABLE_CSS_LENGTH_PATTERN.exec(value.trim());
  if (value2 === null) {
    return null;
  }
  let value3: number = Number(value2[1]);
  if (!Number.isFinite(value3)) {
    return null;
  }
  return {
    n: value3,
    unit: value2[2] ?? (value.trim() === "0" ? "px" : ""),
  };
}
function cssLengthInputStep(unit: string): number {
  if (unit === "px" || unit === "%") {
    return 1;
  } else {
    return 0.05;
  }
}
function cssLengthInputBounds(
  unit: string,
  minimum: number,
  maximum: number,
): [number, number] {
  switch (unit) {
    case "rem":
    case "em":
      return [minimum / 16, maximum / 16];
    case "%":
      return [(minimum * 100) / 16, (maximum * 100) / 16];
    default:
      return [minimum, maximum];
  }
}
export {
  cssLengthInputBounds,
  cssLengthInputStep,
  EDITABLE_CSS_LENGTH_PATTERN,
  MAX_EDITABLE_CSS_LENGTH,
  parseEditableCssLength,
};
export function installEditorCssLengthInput(): () => void {
  return () => {
    EDITABLE_CSS_LENGTH_PATTERN = /^(-?\d+(?:\.\d+)?)(px|rem|em|%)?$/;
    MAX_EDITABLE_CSS_LENGTH = 9999;
  };
}
