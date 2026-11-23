/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { StyleSchemaColorAndFontCall, validateFontFamily, validateStyleColor } from "./color-and-font";
import { validateStyleGradient } from "./gradient";
import { StyleSchemaNodeTypesLinearEaseEaseInValues } from "./node-types";
import { validateStyleShadows } from "./shadow";
import { getPropertyValidationClass, isStyleObject, validateOptionalStyleNumber, validateStyleEnum, validateStyleNumber } from "./validation";
import { StyleSchemaValuesHandler, numberRangeSpec, integerRangeSpec, StyleSchemaValuesItems, transformFieldSpecs, StyleSchemaValuesTransformOpacityColorValues } from "./values";

var pixelLengthRange: Dynamic;
var percentLengthRange: Dynamic;
var transitionDurationRange: Dynamic;
var transitionDelayRange: Dynamic;
var range200To10000: Dynamic;
var range0To5000: Dynamic;
var integerRange1To1000: Dynamic;
var range0To100: Dynamic;
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
  transitionDurationRange,
  transitionDelayRange,
  range200To10000,
  range0To5000,
  integerRange1To1000,
  range0To100,
  pixelLengthRange,
  percentLengthRange,
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
    percentLengthRange = numberRangeSpec(
      1,
      100,
    );
    transitionDurationRange = numberRangeSpec(
      0,
      5e3,
    );
    transitionDelayRange = numberRangeSpec(
      0,
      5e3,
    );
    range200To10000 = numberRangeSpec(
      200,
      1e4,
    );
    range0To5000 = numberRangeSpec(
      0,
      5e3,
    );
    integerRange1To1000 = integerRangeSpec(
      1,
      1e3,
      1,
    );
    range0To100 = numberRangeSpec(
      0,
      100,
    );
  };
}
