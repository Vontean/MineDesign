/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { StyleSchemaValuesHandlerValue, shadowBlurRange, shadowSpreadRange, validateStyleColor } from "./color-and-font";
import { isStyleObject, validateOptionalStyleNumber } from "./validation";
import { StyleSchemaValuesItems, transformFieldSpecs, StyleSchemaValuesLimit } from "./values";

var StyleSchemaShadowXYBlurConfig: Dynamic;
var styleFieldBoundsValue: Dynamic;
var transformFieldBounds: Dynamic;
function numericStyleBounds(bounds?: Dynamic): Dynamic {
  return {
    min: bounds.lo,
    max: bounds.hi,
  };
}
function styleFieldBounds(fields?: Dynamic): Dynamic {
  let state: Dynamic = {};
  for (let value of fields as Dynamic)
    state[value.field] = numericStyleBounds(value.cls);
  return state;
}
function shadowFieldBounds(shadow?: Dynamic): Dynamic {
  return shadow?.kind === "shadow" && shadow.blur !== undefined
    ? {
        ...StyleSchemaShadowXYBlurConfig,
        blur: numericStyleBounds(shadow.blur),
      }
    : StyleSchemaShadowXYBlurConfig;
}
function validateStyleShadows(
  shadows?: Dynamic,
  includeSpread?: Dynamic,
  blurBounds?: Dynamic,
): Dynamic {
  let value: Dynamic = Array.isArray(shadows) ? shadows : [shadows];
  if (value.length === 0 || value.length > StyleSchemaValuesLimit)
    return;
  let items: Dynamic = [];
  for (let shadowValue of value as Dynamic) {
    let validatedShadow: Dynamic = validateStyleShadow(shadowValue, includeSpread, blurBounds);
    if (validatedShadow === undefined) return;
    items.push(validatedShadow);
  }
  return items;
}
function validateStyleShadow(
  shadow?: Dynamic,
  includeSpread?: Dynamic,
  blurBounds: Dynamic = shadowBlurRange,
): Dynamic {
  if (!isStyleObject(shadow)) return;
  let value: Dynamic = validateOptionalStyleNumber(
      StyleSchemaValuesHandlerValue,
      shadow.x,
      0,
    ),
    offsetX: Dynamic = validateOptionalStyleNumber(
      StyleSchemaValuesHandlerValue,
      shadow.y,
      0,
    ),
    offsetY: Dynamic = validateOptionalStyleNumber(
      blurBounds,
      shadow.blur,
      0,
    ),
    color: Dynamic = validateStyleColor(shadow.color);
  if (
    value === undefined ||
    offsetX === undefined ||
    offsetY === undefined ||
    color === undefined
  )
    return;
  if (!includeSpread)
    return {
      x: value,
      y: offsetX,
      blur: offsetY,
      color: color,
    };
  let spread: Dynamic = validateOptionalStyleNumber(
    shadowSpreadRange,
    shadow.spread,
    0,
  );
  if (spread !== undefined)
    return shadow.inset === true
      ? {
          x: value,
          y: offsetX,
          blur: offsetY,
          spread: spread,
          inset: true,
          color: color,
        }
      : {
          x: value,
          y: offsetX,
          blur: offsetY,
          spread: spread,
          color: color,
        };
}
export {
  numericStyleBounds,
  shadowFieldBounds,
  styleFieldBounds,
  styleFieldBoundsValue,
  transformFieldBounds,
  StyleSchemaShadowXYBlurConfig,
  validateStyleShadow,
  validateStyleShadows,
};
export function installEditorStyleSchemaShadow(): () => void {
  return () => {
    StyleSchemaShadowXYBlurConfig = {
      x: numericStyleBounds(StyleSchemaValuesHandlerValue),
      y: numericStyleBounds(StyleSchemaValuesHandlerValue),
      blur: numericStyleBounds(shadowBlurRange),
      spread: numericStyleBounds(shadowSpreadRange),
    };
    styleFieldBoundsValue = styleFieldBounds(StyleSchemaValuesItems);
    transformFieldBounds = styleFieldBounds(
      transformFieldSpecs,
    );
  };
}
