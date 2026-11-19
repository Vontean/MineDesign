/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var PlatformCssSanitizationExpressionImagePattern: Dynamic;
function sanitizeCssDisplayValue(
  cssValue?: Dynamic,
  propertyName?: Dynamic,
): Dynamic {
  if (typeof cssValue != "string") return "transparent";
  let trimmedValue: Dynamic = cssValue.trim();
  return trimmedValue.length === 0 ||
    trimmedValue.length > 512 ||
    PlatformCssSanitizationExpressionImagePattern.test(trimmedValue) ||
    (typeof CSS !== "undefined" &&
      typeof CSS.supports == "function" &&
      !CSS.supports(propertyName, trimmedValue))
    ? "transparent"
    : trimmedValue;
}
function sanitizeCssColor(cssColor?: Dynamic): Dynamic {
  return sanitizeCssDisplayValue(cssColor, "color");
}
function sanitizeCssBackground(cssBackground?: Dynamic): Dynamic {
  return sanitizeCssDisplayValue(cssBackground, "background");
}
export {
  PlatformCssSanitizationExpressionImagePattern,
  sanitizeCssBackground,
  sanitizeCssColor,
  sanitizeCssDisplayValue,
};
export function installPlatformCssSanitization(): () => void {
  return () => {
    PlatformCssSanitizationExpressionImagePattern =
      /[;{}\\@<>]|\/\*|url\s*\(|expression\s*\(|image(-set)?\s*\(|element\s*\(|cross-fade\s*\(|paint\s*\(|[\r\n]/i;
  };
}
