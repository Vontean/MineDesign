/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { StyleSchemaValuesHandlerValue, StyleSchemaValuesHandlerValue_2, StyleSchemaValuesHandlerValue_3, validateStyleColor } from "./color-and-font";
import { isStyleObject, validateOptionalStyleNumber } from "./validation";
import { StyleSchemaValuesItems, StyleSchemaValuesItems_2, StyleSchemaValuesLimit } from "./values";

var StyleSchemaShadowXYBlurConfig: Dynamic;
var styleFieldBoundsValue: Dynamic;
var styleFieldBoundsValue_2: Dynamic;
function numericStyleBounds(input?: Dynamic): Dynamic {
  return {
    min: input.lo,
    max: input.hi,
  };
}
function styleFieldBounds(input?: Dynamic): Dynamic {
  let state: Dynamic = {};
  for (let value of input as Dynamic)
    state[value.field] = numericStyleBounds(value.cls);
  return state;
}
function shadowFieldBounds(input?: Dynamic): Dynamic {
  return input?.kind === "shadow" && input.blur !== undefined
    ? {
        ...StyleSchemaShadowXYBlurConfig,
        blur: numericStyleBounds(input.blur),
      }
    : StyleSchemaShadowXYBlurConfig;
}
function validateStyleShadows(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  let value: Dynamic = Array.isArray(input) ? input : [input];
  if (value.length === 0 || value.length > StyleSchemaValuesLimit)
    return;
  let items: Dynamic = [];
  for (let value2 of value as Dynamic) {
    let value3: Dynamic = validateStyleShadow(value2, options, context);
    if (value3 === undefined) return;
    items.push(value3);
  }
  return items;
}
function validateStyleShadow(
  input?: Dynamic,
  options?: Dynamic,
  context: Dynamic = StyleSchemaValuesHandlerValue_2,
): Dynamic {
  if (!isStyleObject(input)) return;
  let value: Dynamic = validateOptionalStyleNumber(
      StyleSchemaValuesHandlerValue,
      input.x,
      0,
    ),
    value2: Dynamic = validateOptionalStyleNumber(
      StyleSchemaValuesHandlerValue,
      input.y,
      0,
    ),
    value3: Dynamic = validateOptionalStyleNumber(
      context,
      input.blur,
      0,
    ),
    value4: Dynamic = validateStyleColor(input.color);
  if (
    value === undefined ||
    value2 === undefined ||
    value3 === undefined ||
    value4 === undefined
  )
    return;
  if (!options)
    return {
      x: value,
      y: value2,
      blur: value3,
      color: value4,
    };
  let value5: Dynamic = validateOptionalStyleNumber(
    StyleSchemaValuesHandlerValue_3,
    input.spread,
    0,
  );
  if (value5 !== undefined)
    return input.inset === true
      ? {
          x: value,
          y: value2,
          blur: value3,
          spread: value5,
          inset: true,
          color: value4,
        }
      : {
          x: value,
          y: value2,
          blur: value3,
          spread: value5,
          color: value4,
        };
}
export {
  numericStyleBounds,
  shadowFieldBounds,
  styleFieldBounds,
  styleFieldBoundsValue,
  styleFieldBoundsValue_2,
  StyleSchemaShadowXYBlurConfig,
  validateStyleShadow,
  validateStyleShadows,
};
export function installEditorStyleSchemaShadow(): () => void {
  return () => {
    StyleSchemaShadowXYBlurConfig = {
      x: numericStyleBounds(StyleSchemaValuesHandlerValue),
      y: numericStyleBounds(StyleSchemaValuesHandlerValue),
      blur: numericStyleBounds(StyleSchemaValuesHandlerValue_2),
      spread: numericStyleBounds(StyleSchemaValuesHandlerValue_3),
    };
    styleFieldBoundsValue = styleFieldBounds(StyleSchemaValuesItems);
    styleFieldBoundsValue_2 = styleFieldBounds(
      StyleSchemaValuesItems_2,
    );
  };
}
