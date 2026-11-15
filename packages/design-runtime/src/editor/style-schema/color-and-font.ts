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
var StyleSchemaValuesHandlerValue_2: Dynamic;
var StyleSchemaValuesHandlerValue_3: Dynamic;
function validateStyleColor(input?: Dynamic): Dynamic {
  let value: Dynamic = (0, validateSimpleStyleString)(input);
  if (value === undefined) return;
  let value2: Dynamic = value.toLowerCase();
  if (
    !(
      StyleSchemaValidationSubscribers.has(value2) ||
      StyleSchemaValidationPattern.test(value2) ||
      rgbStyleColorPattern.test(value2) ||
      hslStyleColorPattern.test(value2) ||
      oklchStyleColorPattern.test(value2) ||
      labStyleColorPattern.test(value2)
    )
  )
    return;
  let CSS2: Dynamic = (globalThis as Dynamic).CSS;
  if (
    !(
      CSS2 !== undefined &&
      typeof CSS2.supports == "function" &&
      !CSS2.supports("color", value2)
    )
  )
    return value2;
}
function validateFontFamily(input?: Dynamic): Dynamic {
  let value: Dynamic = (0, validateStyleEnum)(
    StyleSchemaNodeTypesSansSerifMonoValues,
    input,
  );
  if (value !== undefined) return value;
  if (!(0, isStyleObject)(input)) return;
  let { family: value2, webSafe: value3 }: Dynamic = input,
    value4: Dynamic = (0, validateStyleEnum)(
      StyleSchemaNodeTypesSansSerifMonoValues,
      input.fallback,
    );
  if (!(!StyleSchemaColorAndFontTest(value2) || value4 === undefined))
    return value3 === undefined
      ? {
          family: value2,
          fallback: value4,
        }
      : StyleSchemaColorAndFontTest(value3)
        ? {
            family: value2,
            fallback: value4,
            webSafe: value3,
          }
        : undefined;
}
export {
  StyleSchemaColorAndFontCall,
  StyleSchemaColorAndFontTest,
  StyleSchemaValuesHandlerValue,
  StyleSchemaValuesHandlerValue_2,
  StyleSchemaValuesHandlerValue_3,
  validateFontFamily,
  validateStyleColor,
};
export function installEditorStyleSchemaColorAndFont(): () => void {
  return () => {
    StyleSchemaColorAndFontTest = (input?: Dynamic): Dynamic =>
      typeof input == "string" &&
      StyleSchemaNodeTypesAZaZAZaZPattern.test(input) &&
      !StyleSchemaNodeTypesSubscribers.has(input.toLowerCase());
    StyleSchemaColorAndFontCall = (
      input?: Dynamic,
      options?: Dynamic,
    ): Dynamic => Object.prototype.hasOwnProperty.call(input, options);
    StyleSchemaValuesHandlerValue = (0, StyleSchemaValuesHandler)(
      -64,
      64,
    );
    StyleSchemaValuesHandlerValue_2 = (0, StyleSchemaValuesHandler)(
      0,
      64,
    );
    StyleSchemaValuesHandlerValue_3 = (0, StyleSchemaValuesHandler)(
      -32,
      32,
    );
  };
}
