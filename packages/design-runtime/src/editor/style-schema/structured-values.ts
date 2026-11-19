/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { StyleSchemaColorAndFontCall, validateFontFamily, validateStyleColor } from "./color-and-font";
import { validateStyleGradient } from "./gradient";
import { StyleSchemaNodeTypesLinearEaseEaseInValues } from "./node-types";
import { validateStyleShadows } from "./shadow";
import { getPropertyValidationClass, isStyleObject, validateOptionalStyleNumber, validateStyleEnum, validateStyleNumber } from "./validation";
import { StyleSchemaValuesHandler, StyleSchemaValuesHandler_2, StyleSchemaValuesHandler_3, StyleSchemaValuesItems, StyleSchemaValuesItems_2 as transformFieldSpecs, StyleSchemaValuesTransformOpacityColorValues } from "./values";

var pixelLengthRange: Dynamic;
var percentLengthRange: Dynamic;
var transitionDurationRange: Dynamic;
var transitionDelayRange: Dynamic;
var StyleSchemaValuesHandlerValue_12: Dynamic;
var StyleSchemaValuesHandlerValue_13: Dynamic;
var StyleSchemaValuesHandlerValue_14: Dynamic;
var StyleSchemaValuesHandlerValue_15: Dynamic;
function validateStyleFields(fieldDefinitions?: Dynamic, styleObject?: Dynamic): Dynamic {
  if (!isStyleObject(styleObject)) return;
  let value: Dynamic = Object.create(null),
    index: Dynamic = 0;
  for (let fieldDefinition of fieldDefinitions as Dynamic) {
    if (!StyleSchemaColorAndFontCall(styleObject, fieldDefinition.field))
      continue;
    let fieldValue: Dynamic = validateStyleNumber(
      fieldDefinition.cls,
      styleObject[fieldDefinition.field],
    );
    if (fieldValue === undefined) return;
    value[fieldDefinition.field] = fieldValue;
    index += 1;
  }
  return index > 0 ? value : undefined;
}
function validateStyleLength(lengthValue?: Dynamic): Dynamic {
  if (!isStyleObject(lengthValue)) return;
  let value: Dynamic = StyleSchemaColorAndFontCall(lengthValue, "px"),
    hasPercent: Dynamic = StyleSchemaColorAndFontCall(lengthValue, "pct");
  if (value === hasPercent) return;
  if (value) {
    let pixelValue: Dynamic = validateStyleNumber(
      pixelLengthRange,
      lengthValue.px,
    );
    return pixelValue === undefined
      ? undefined
      : {
          px: pixelValue,
        };
  }
  let percentValue: Dynamic = validateStyleNumber(
    percentLengthRange,
    lengthValue.pct,
  );
  return percentValue === undefined
    ? undefined
    : {
        pct: percentValue,
      };
}
function validateStyleTransition(transition?: Dynamic): Dynamic {
  if (!isStyleObject(transition)) return;
  let value: Dynamic,
    properties: Dynamic = transition.properties;
  if (properties === undefined || properties === "all")
    value = [...StyleSchemaValuesTransformOpacityColorValues];
  else {
    let propertyNames: Dynamic = Array.isArray(properties)
      ? properties
      : [properties];
    if (
      propertyNames.length === 0 ||
      propertyNames.length >
        StyleSchemaValuesTransformOpacityColorValues.length
    )
      return;
    let items: Dynamic = [];
    for (let propertyName of propertyNames as Dynamic) {
      let validatedProperty: Dynamic = validateStyleEnum(
        StyleSchemaValuesTransformOpacityColorValues,
        propertyName,
      );
      if (validatedProperty === undefined) return;
      items.includes(validatedProperty) || items.push(validatedProperty);
    }
    value = items;
  }
  let duration: Dynamic = validateOptionalStyleNumber(
      transitionDurationRange,
      transition.duration,
      200,
    ),
    delay: Dynamic = validateOptionalStyleNumber(
      transitionDelayRange,
      transition.delay,
      0,
    ),
    easing: Dynamic =
      transition.easing === undefined
        ? "ease"
        : validateStyleEnum(
            StyleSchemaNodeTypesLinearEaseEaseInValues,
            transition.easing,
          );
  if (!(duration === undefined || delay === undefined || easing === undefined))
    return {
      properties: value,
      duration: duration,
      delay: delay,
      easing: easing,
    };
}
function validateStyleValue(
  propertyName?: Dynamic,
  propertyValue?: Dynamic,
  nodeType?: Dynamic,
): Dynamic {
  let value: Dynamic = getPropertyValidationClass(
    propertyName,
    nodeType,
  );
  switch (value.kind) {
    case "len":
    case "num":
    case "int":
      return validateStyleNumber(value, propertyValue);
    case "enum":
      return validateStyleEnum(value.values, propertyValue);
    case "color":
      return validateStyleColor(propertyValue);
    case "fontFamily":
      return validateFontFamily(propertyValue);
    case "shadow":
      return validateStyleShadows(
        propertyValue,
        value.spread,
        value.blur,
      );
    case "gradient":
      return validateStyleGradient(
        propertyValue,
        value.repeat === true,
      );
    case "filter":
      return validateStyleFields(StyleSchemaValuesItems, propertyValue);
    case "transform":
      return validateStyleFields(transformFieldSpecs, propertyValue);
    case "size":
      return validateStyleLength(propertyValue);
    case "transition":
      return validateStyleTransition(propertyValue);
    case "animation":
      return;
  }
}
export {
  transitionDurationRange as StyleSchemaValuesHandlerValue_10,
  transitionDelayRange as StyleSchemaValuesHandlerValue_11,
  StyleSchemaValuesHandlerValue_12,
  StyleSchemaValuesHandlerValue_13,
  StyleSchemaValuesHandlerValue_14,
  StyleSchemaValuesHandlerValue_15,
  pixelLengthRange as StyleSchemaValuesHandlerValue_8,
  percentLengthRange as StyleSchemaValuesHandlerValue_9,
  validateStyleFields,
  validateStyleLength,
  validateStyleTransition,
  validateStyleValue,
};
export function installEditorStyleSchemaStructuredValues(): () => void {
  return () => {
    pixelLengthRange = StyleSchemaValuesHandler(
      0,
      4096,
    );
    percentLengthRange = StyleSchemaValuesHandler_2(
      1,
      100,
    );
    transitionDurationRange = StyleSchemaValuesHandler_2(
      0,
      5e3,
    );
    transitionDelayRange = StyleSchemaValuesHandler_2(
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
