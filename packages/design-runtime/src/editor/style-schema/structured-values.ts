/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { StyleSchemaColorAndFontCall, validateFontFamily, validateStyleColor } from "./color-and-font";
import { validateStyleGradient } from "./gradient";
import { StyleSchemaNodeTypesLinearEaseEaseInValues } from "./node-types";
import { validateStyleShadows } from "./shadow";
import { getPropertyValidationClass, isStyleObject, validateOptionalStyleNumber, validateStyleEnum, validateStyleNumber } from "./validation";
import { StyleSchemaValuesHandler, StyleSchemaValuesHandler_2, StyleSchemaValuesHandler_3, StyleSchemaValuesItems, StyleSchemaValuesItems_2, StyleSchemaValuesTransformOpacityColorValues } from "./values";

var StyleSchemaValuesHandlerValue_8: Dynamic;
var StyleSchemaValuesHandlerValue_9: Dynamic;
var StyleSchemaValuesHandlerValue_10: Dynamic;
var StyleSchemaValuesHandlerValue_11: Dynamic;
var StyleSchemaValuesHandlerValue_12: Dynamic;
var StyleSchemaValuesHandlerValue_13: Dynamic;
var StyleSchemaValuesHandlerValue_14: Dynamic;
var StyleSchemaValuesHandlerValue_15: Dynamic;
function validateStyleFields(input?: Dynamic, options?: Dynamic): Dynamic {
  if (!isStyleObject(options)) return;
  let value: Dynamic = Object.create(null),
    index: Dynamic = 0;
  for (let value2 of input as Dynamic) {
    if (!StyleSchemaColorAndFontCall(options, value2.field))
      continue;
    let value3: Dynamic = validateStyleNumber(
      value2.cls,
      options[value2.field],
    );
    if (value3 === undefined) return;
    value[value2.field] = value3;
    index += 1;
  }
  return index > 0 ? value : undefined;
}
function validateStyleLength(input?: Dynamic): Dynamic {
  if (!isStyleObject(input)) return;
  let value: Dynamic = StyleSchemaColorAndFontCall(input, "px"),
    value2: Dynamic = StyleSchemaColorAndFontCall(input, "pct");
  if (value === value2) return;
  if (value) {
    let value4: Dynamic = validateStyleNumber(
      StyleSchemaValuesHandlerValue_8,
      input.px,
    );
    return value4 === undefined
      ? undefined
      : {
          px: value4,
        };
  }
  let value3: Dynamic = validateStyleNumber(
    StyleSchemaValuesHandlerValue_9,
    input.pct,
  );
  return value3 === undefined
    ? undefined
    : {
        pct: value3,
      };
}
function validateStyleTransition(input?: Dynamic): Dynamic {
  if (!isStyleObject(input)) return;
  let value: Dynamic,
    properties: Dynamic = input.properties;
  if (properties === undefined || properties === "all")
    value = [...StyleSchemaValuesTransformOpacityColorValues];
  else {
    let value5: Dynamic = Array.isArray(properties)
      ? properties
      : [properties];
    if (
      value5.length === 0 ||
      value5.length >
        StyleSchemaValuesTransformOpacityColorValues.length
    )
      return;
    let items: Dynamic = [];
    for (let value6 of value5 as Dynamic) {
      let value7: Dynamic = validateStyleEnum(
        StyleSchemaValuesTransformOpacityColorValues,
        value6,
      );
      if (value7 === undefined) return;
      items.includes(value7) || items.push(value7);
    }
    value = items;
  }
  let value2: Dynamic = validateOptionalStyleNumber(
      StyleSchemaValuesHandlerValue_10,
      input.duration,
      200,
    ),
    value3: Dynamic = validateOptionalStyleNumber(
      StyleSchemaValuesHandlerValue_11,
      input.delay,
      0,
    ),
    value4: Dynamic =
      input.easing === undefined
        ? "ease"
        : validateStyleEnum(
            StyleSchemaNodeTypesLinearEaseEaseInValues,
            input.easing,
          );
  if (!(value2 === undefined || value3 === undefined || value4 === undefined))
    return {
      properties: value,
      duration: value2,
      delay: value3,
      easing: value4,
    };
}
function validateStyleValue(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  let value: Dynamic = getPropertyValidationClass(
    input,
    context,
  );
  switch (value.kind) {
    case "len":
    case "num":
    case "int":
      return validateStyleNumber(value, options);
    case "enum":
      return validateStyleEnum(value.values, options);
    case "color":
      return validateStyleColor(options);
    case "fontFamily":
      return validateFontFamily(options);
    case "shadow":
      return validateStyleShadows(
        options,
        value.spread,
        value.blur,
      );
    case "gradient":
      return validateStyleGradient(
        options,
        value.repeat === true,
      );
    case "filter":
      return validateStyleFields(StyleSchemaValuesItems, options);
    case "transform":
      return validateStyleFields(StyleSchemaValuesItems_2, options);
    case "size":
      return validateStyleLength(options);
    case "transition":
      return validateStyleTransition(options);
    case "animation":
      return;
  }
}
export {
  StyleSchemaValuesHandlerValue_10,
  StyleSchemaValuesHandlerValue_11,
  StyleSchemaValuesHandlerValue_12,
  StyleSchemaValuesHandlerValue_13,
  StyleSchemaValuesHandlerValue_14,
  StyleSchemaValuesHandlerValue_15,
  StyleSchemaValuesHandlerValue_8,
  StyleSchemaValuesHandlerValue_9,
  validateStyleFields,
  validateStyleLength,
  validateStyleTransition,
  validateStyleValue,
};
export function installEditorStyleSchemaStructuredValues(): () => void {
  return () => {
    StyleSchemaValuesHandlerValue_8 = StyleSchemaValuesHandler(
      0,
      4096,
    );
    StyleSchemaValuesHandlerValue_9 = StyleSchemaValuesHandler_2(
      1,
      100,
    );
    StyleSchemaValuesHandlerValue_10 = StyleSchemaValuesHandler_2(
      0,
      5e3,
    );
    StyleSchemaValuesHandlerValue_11 = StyleSchemaValuesHandler_2(
      0,
      5e3,
    );
    StyleSchemaValuesHandlerValue_12 = StyleSchemaValuesHandler_2(
      200,
      1e4,
    );
    StyleSchemaValuesHandlerValue_13 = StyleSchemaValuesHandler_2(
      0,
      5e3,
    );
    StyleSchemaValuesHandlerValue_14 = StyleSchemaValuesHandler_3(
      1,
      1e3,
      1,
    );
    StyleSchemaValuesHandlerValue_15 = StyleSchemaValuesHandler_2(
      0,
      100,
    );
  };
}
