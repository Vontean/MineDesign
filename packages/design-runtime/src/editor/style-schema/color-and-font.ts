/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { StyleSchemaNodeTypesAZaZAZaZPattern, StyleSchemaNodeTypesSansSerifMonoValues, StyleSchemaNodeTypesSubscribers } from "./node-types";
import { hslStyleColorPattern, isStyleObject, labStyleColorPattern, oklchStyleColorPattern, rgbStyleColorPattern, StyleSchemaValidationPattern, StyleSchemaValidationSubscribers, validateSimpleStyleString, validateStyleEnum } from "./validation";
import { StyleSchemaValuesHandler } from "./values";

var StyleSchemaColorAndFontTest: Dynamic;
var StyleSchemaColorAndFontCall: Dynamic;
var StyleSchemaValuesHandlerValue: Dynamic;
var shadowBlurRange: Dynamic;
var shadowSpreadRange: Dynamic;
function validateStyleColor(colorInput?: Dynamic): Dynamic {
  let value: Dynamic = validateSimpleStyleString(colorInput);
  if (value === undefined) return;
  let normalizedColor: Dynamic = value.toLowerCase();
  if (
    !(
      StyleSchemaValidationSubscribers.has(normalizedColor) ||
      StyleSchemaValidationPattern.test(normalizedColor) ||
      rgbStyleColorPattern.test(normalizedColor) ||
      hslStyleColorPattern.test(normalizedColor) ||
      oklchStyleColorPattern.test(normalizedColor) ||
      labStyleColorPattern.test(normalizedColor)
    )
  )
    return;
  let cssApi: Dynamic = (globalThis as Dynamic).CSS;
  if (
    !(
      cssApi !== undefined &&
      typeof cssApi.supports == "function" &&
      !cssApi.supports("color", normalizedColor)
    )
  )
    return normalizedColor;
}
function validateFontFamily(fontInput?: Dynamic): Dynamic {
  let value: Dynamic = validateStyleEnum(
    StyleSchemaNodeTypesSansSerifMonoValues,
    fontInput,
  );
  if (value !== undefined) return value;
  if (!isStyleObject(fontInput)) return;
  let { family: fontFamily, webSafe: webSafeFamily }: Dynamic = fontInput,
    fallbackFamily: Dynamic = validateStyleEnum(
      StyleSchemaNodeTypesSansSerifMonoValues,
      fontInput.fallback,
    );
  if (!(!StyleSchemaColorAndFontTest(fontFamily) || fallbackFamily === undefined))
    return webSafeFamily === undefined
      ? {
          family: fontFamily,
          fallback: fallbackFamily,
        }
      : StyleSchemaColorAndFontTest(webSafeFamily)
        ? {
            family: fontFamily,
            fallback: fallbackFamily,
            webSafe: webSafeFamily,
          }
        : undefined;
}
export {
  StyleSchemaColorAndFontCall,
  StyleSchemaColorAndFontTest,
  StyleSchemaValuesHandlerValue,
  shadowBlurRange,
  shadowSpreadRange,
  validateFontFamily,
  validateStyleColor,
};
export function installEditorStyleSchemaColorAndFont(): () => void {
  return () => {
    StyleSchemaColorAndFontTest = (familyValue?: Dynamic): Dynamic =>
      typeof familyValue == "string" &&
      StyleSchemaNodeTypesAZaZAZaZPattern.test(familyValue) &&
      !StyleSchemaNodeTypesSubscribers.has(familyValue.toLowerCase());
    StyleSchemaColorAndFontCall = (
      objectValue?: Dynamic,
      propertyName?: Dynamic,
    ): Dynamic => Object.prototype.hasOwnProperty.call(objectValue, propertyName);
    StyleSchemaValuesHandlerValue = StyleSchemaValuesHandler(
      -64,
      64,
    );
    shadowBlurRange = StyleSchemaValuesHandler(
      0,
      64,
    );
    shadowSpreadRange = StyleSchemaValuesHandler(
      -32,
      32,
    );
  };
}
