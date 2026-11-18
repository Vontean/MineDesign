/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { validateStyleColor } from "./color-and-font";
import { isStyleObject, validateOptionalStyleNumber, validateStyleNumber } from "./validation";
import { StyleSchemaValuesClosestSideClosestCornerFarthestSideValues, StyleSchemaValuesHandler, StyleSchemaValuesHandler_2 } from "./values";

var StyleSchemaValuesHandlerValue_4: Dynamic;
var StyleSchemaValuesHandlerValue_5: Dynamic;
var StyleSchemaValuesHandlerValue_6: Dynamic;
var StyleSchemaValuesHandlerValue_7: Dynamic;
var StyleSchemaGradientLimit: Dynamic;
var StyleSchemaGradientLimit_2: Dynamic;
function validateStyleGradient(
  input?: Dynamic,
  options: Dynamic = false,
): Dynamic {
  if (!isStyleObject(input)) return;
  let value: Dynamic = validateOptionalStyleNumber(
    StyleSchemaValuesHandlerValue_4,
    input.angle,
    180,
  );
  if (value === undefined) return;
  let stops: Dynamic = input.stops;
  if (
    !Array.isArray(stops) ||
    stops.length < StyleSchemaGradientLimit ||
    stops.length > StyleSchemaGradientLimit_2
  )
    return;
  let length: Dynamic = stops.length,
    items: Dynamic = [];
  for (let index: Dynamic = 0; index < length; index += 1) {
    let value7: Dynamic = stops[index];
    if (!isStyleObject(value7)) return;
    let value8: Dynamic = validateStyleColor(value7.color),
      value9: Dynamic = validateOptionalStyleNumber(
        StyleSchemaValuesHandlerValue_5,
        value7.pos,
        (index / (length - 1)) * 100,
      );
    if (value8 === undefined || value9 === undefined) return;
    items.push({
      color: value8,
      pos: value9,
    });
  }
  items.sort(
    (input2?: Dynamic, options2?: Dynamic): Dynamic =>
      input2.pos - options2.pos,
  );
  let value2: Dynamic = options && input.repeat !== undefined,
    value3: Dynamic = value2
      ? validateStyleNumber(
          StyleSchemaValuesHandlerValue_7,
          input.repeat,
        )
      : undefined;
  if (value2 && value3 === undefined) return;
  let value4: Dynamic = items[length - 1];
  value3 !== undefined &&
    input.radial !== true &&
    value4.pos < 100 &&
    (length < StyleSchemaGradientLimit_2
      ? items.push({
          color: value4.color,
          pos: 100,
        })
      : (items[length - 1] = {
          color: value4.color,
          pos: 100,
        }));
  let value5: Dynamic;
  if (isStyleObject(input.at)) {
    let value7: Dynamic = validateStyleNumber(
        StyleSchemaValuesHandlerValue_6,
        input.at.x,
      ),
      value8: Dynamic = validateStyleNumber(
        StyleSchemaValuesHandlerValue_6,
        input.at.y,
      );
    value7 !== undefined &&
      value8 !== undefined &&
      (value7 !== 50 || value8 !== 50) &&
      (value5 = {
        x: value7,
        y: value8,
      });
  }
  let value6: Dynamic =
    StyleSchemaValuesClosestSideClosestCornerFarthestSideValues.includes(
      input.extent,
    )
      ? input.extent
      : undefined;
  return {
    angle: value,
    ...(input.radial === true
      ? {
          radial: true,
        }
      : {}),
    ...(input.shape === "ellipse"
      ? {
          shape: "ellipse",
        }
      : {}),
    ...(value6 !== undefined
      ? {
          extent: value6,
        }
      : {}),
    ...(value5 !== undefined
      ? {
          at: value5,
        }
      : {}),
    ...(value3 !== undefined
      ? {
          repeat: value3,
        }
      : {}),
    stops: items,
  };
}
function radialGradientPrefix(input?: Dynamic): Dynamic {
  let value: Dynamic =
      StyleSchemaValuesClosestSideClosestCornerFarthestSideValues.find(
        (input2?: Dynamic): Dynamic => input2 === input.extent,
      ),
    at: Dynamic = input.at,
    value2: Dynamic =
      isStyleObject(at) &&
      typeof at.x == "number" &&
      typeof at.y == "number" &&
      Number.isFinite(at.x) &&
      Number.isFinite(at.y)
        ? `at ${at.x}% ${at.y}%`
        : undefined;
  return [input.shape === "ellipse" ? "ellipse" : "circle", value, value2]
    .filter((input2?: Dynamic): Dynamic => input2 !== undefined)
    .join(" ");
}
function radialGradientFunction(input?: Dynamic): Dynamic {
  let value: Dynamic = radialGradientPrefix(input);
  return value === "ellipse"
    ? "radial-gradient("
    : "radial-gradient(" + value + ", ";
}
export {
  radialGradientFunction,
  radialGradientPrefix,
  StyleSchemaGradientLimit,
  StyleSchemaGradientLimit_2,
  StyleSchemaValuesHandlerValue_4,
  StyleSchemaValuesHandlerValue_5,
  StyleSchemaValuesHandlerValue_6,
  StyleSchemaValuesHandlerValue_7,
  validateStyleGradient,
};
export function installEditorStyleSchemaGradient(): () => void {
  return () => {
    StyleSchemaValuesHandlerValue_4 = StyleSchemaValuesHandler_2(
      0,
      360,
    );
    StyleSchemaValuesHandlerValue_5 = StyleSchemaValuesHandler_2(
      0,
      100,
    );
    StyleSchemaValuesHandlerValue_6 = StyleSchemaValuesHandler_2(
      -100,
      200,
    );
    StyleSchemaValuesHandlerValue_7 = StyleSchemaValuesHandler(
      2,
      2048,
    );
    StyleSchemaGradientLimit = 2;
    StyleSchemaGradientLimit_2 = 8;
  };
}
