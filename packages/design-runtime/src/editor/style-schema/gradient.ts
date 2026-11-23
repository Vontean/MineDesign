/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { validateStyleColor } from "./color-and-font";
import { isStyleObject, validateOptionalStyleNumber, validateStyleNumber } from "./validation";
import { StyleSchemaValuesClosestSideClosestCornerFarthestSideValues, StyleSchemaValuesHandler, numberRangeSpec } from "./values";

var gradientAngleRange: Dynamic;
var gradientStopPositionRange: Dynamic;
var radialCenterRange: Dynamic;
var gradientRepeatRange: Dynamic;
var StyleSchemaGradientLimit: Dynamic;
var maxGradientStops: Dynamic;
function validateStyleGradient(
  gradient?: Dynamic,
  allowRepeat: Dynamic = false,
): Dynamic {
  if (!isStyleObject(gradient)) return;
  let value: Dynamic = validateOptionalStyleNumber(
    gradientAngleRange,
    gradient.angle,
    180,
  );
  if (value === undefined) return;
  let stops: Dynamic = gradient.stops;
  if (
    !Array.isArray(stops) ||
    stops.length < StyleSchemaGradientLimit ||
    stops.length > maxGradientStops
  )
    return;
  let length: Dynamic = stops.length,
    items: Dynamic = [];
  for (let index: Dynamic = 0; index < length; index += 1) {
    let stop: Dynamic = stops[index];
    if (!isStyleObject(stop)) return;
    let stopColor: Dynamic = validateStyleColor(stop.color),
      stopPosition: Dynamic = validateOptionalStyleNumber(
        gradientStopPositionRange,
        stop.pos,
        (index / (length - 1)) * 100,
      );
    if (stopColor === undefined || stopPosition === undefined) return;
    items.push({
      color: stopColor,
      pos: stopPosition,
    });
  }
  items.sort(
    (leftStop?: Dynamic, rightStop?: Dynamic): Dynamic =>
      leftStop.pos - rightStop.pos,
  );
  let hasRepeat: Dynamic = allowRepeat && gradient.repeat !== undefined,
    repeatValue: Dynamic = hasRepeat
      ? validateStyleNumber(
          gradientRepeatRange,
          gradient.repeat,
        )
      : undefined;
  if (hasRepeat && repeatValue === undefined) return;
  let lastStop: Dynamic = items[length - 1];
  repeatValue !== undefined &&
    gradient.radial !== true &&
    lastStop.pos < 100 &&
    (length < maxGradientStops
      ? items.push({
          color: lastStop.color,
          pos: 100,
        })
      : (items[length - 1] = {
          color: lastStop.color,
          pos: 100,
        }));
  let radialCenter: Dynamic;
  if (isStyleObject(gradient.at)) {
    let centerX: Dynamic = validateStyleNumber(
        radialCenterRange,
        gradient.at.x,
      ),
      centerY: Dynamic = validateStyleNumber(
        radialCenterRange,
        gradient.at.y,
      );
    centerX !== undefined &&
      centerY !== undefined &&
      (centerX !== 50 || centerY !== 50) &&
      (radialCenter = {
        x: centerX,
        y: centerY,
      });
  }
  let extent: Dynamic =
    StyleSchemaValuesClosestSideClosestCornerFarthestSideValues.includes(
      gradient.extent,
    )
      ? gradient.extent
      : undefined;
  return {
    angle: value,
    ...(gradient.radial === true
      ? {
          radial: true,
        }
      : {}),
    ...(gradient.shape === "ellipse"
      ? {
          shape: "ellipse",
        }
      : {}),
    ...(extent !== undefined
      ? {
          extent: extent,
        }
      : {}),
    ...(radialCenter !== undefined
      ? {
          at: radialCenter,
        }
      : {}),
    ...(repeatValue !== undefined
      ? {
          repeat: repeatValue,
        }
      : {}),
    stops: items,
  };
}
function radialGradientPrefix(gradient?: Dynamic): Dynamic {
  let value: Dynamic =
      StyleSchemaValuesClosestSideClosestCornerFarthestSideValues.find(
        (extentValue?: Dynamic): Dynamic => extentValue === gradient.extent,
      ),
    at: Dynamic = gradient.at,
    position: Dynamic =
      isStyleObject(at) &&
      typeof at.x == "number" &&
      typeof at.y == "number" &&
      Number.isFinite(at.x) &&
      Number.isFinite(at.y)
        ? `at ${at.x}% ${at.y}%`
        : undefined;
  return [gradient.shape === "ellipse" ? "ellipse" : "circle", value, position]
    .filter((filteredValue?: Dynamic): Dynamic => filteredValue !== undefined)
    .join(" ");
}
function radialGradientFunction(gradient?: Dynamic): Dynamic {
  let value: Dynamic = radialGradientPrefix(gradient);
  return value === "ellipse"
    ? "radial-gradient("
    : "radial-gradient(" + value + ", ";
}
export {
  radialGradientFunction,
  radialGradientPrefix,
  StyleSchemaGradientLimit,
  maxGradientStops,
  gradientAngleRange,
  gradientStopPositionRange,
  radialCenterRange,
  gradientRepeatRange,
  validateStyleGradient,
};
export function installEditorStyleSchemaGradient(): () => void {
  return () => {
    gradientAngleRange = numberRangeSpec(
      0,
      360,
    );
    gradientStopPositionRange = numberRangeSpec(
      0,
      100,
    );
    radialCenterRange = numberRangeSpec(
      -100,
      200,
    );
    gradientRepeatRange = StyleSchemaValuesHandler(
      2,
      2048,
    );
    StyleSchemaGradientLimit = 2;
    maxGradientStops = 8;
  };
}
