/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { StyleSchemaColorAndFontCall } from "./color-and-font";
import { radialGradientFunction } from "./gradient";
import { validateStyleValue } from "./structured-values";
import { propertyAppliesToNode } from "./validation";
import { StyleSchemaValuesItems, StyleSchemaValuesItems_3 as StyleProperties, StyleSchemaValuesSansSerifMonoConfig } from "./values";

var pixelsCss: Dynamic;
var StyleSchemaCssTransformOpacityColorConfig: Dynamic;
var StyleSchemaCssPositionTopRightValues: Dynamic;
var StyleSchemaCssSupportsValue: Dynamic;
function serializeStyleShadows(shadows?: Dynamic, includeInset?: Dynamic): Dynamic {
  return shadows
    .map(
      (shadow?: Dynamic): Dynamic =>
        includeInset
          ? `${shadow.inset === true ? "inset " : ""}${pixelsCss(shadow.x)} ${pixelsCss(shadow.y)} ${pixelsCss(shadow.blur)} ${pixelsCss(shadow.spread ?? 0)} ${shadow.color}`
          : `${pixelsCss(shadow.x)} ${pixelsCss(shadow.y)} ${pixelsCss(shadow.blur)} ${shadow.color}`,
    )
    .join(", ");
}
function serializeStyleGradient(gradient?: Dynamic): Dynamic {
  if (gradient.repeat !== undefined && gradient.radial !== true) {
    let callback: Dynamic = (percentage?: Dynamic): Dynamic =>
        `${Math.round((percentage / 100) * gradient.repeat * 100) / 100}px`,
      serializedStops: Dynamic = gradient.stops
        .map(
          (stop?: Dynamic): Dynamic =>
            `${stop.color} ${callback(stop.pos)}`,
        )
        .join(", ");
    return `repeating-linear-gradient(${gradient.angle}deg, ${serializedStops})`;
  }
  let value: Dynamic = gradient.stops
    .map((stop?: Dynamic): Dynamic => `${stop.color} ${stop.pos}%`)
    .join(", ");
  return gradient.radial === true
    ? `${radialGradientFunction(gradient)}${value})`
    : `linear-gradient(${gradient.angle}deg, ${value})`;
}
function serializeStyleFilter(filter?: Dynamic): Dynamic {
  let items: Dynamic = [];
  for (let value of StyleSchemaValuesItems as Dynamic) {
    let filterValue: Dynamic = filter[value.field];
    filterValue !== undefined && items.push(`${value.fn}(${filterValue}${value.unit})`);
  }
  return items.length > 0 ? items.join(" ") : "none";
}
function serializeStyleTransform(transform?: Dynamic): Dynamic {
  let items: Dynamic = [];
  (transform.translateX !== undefined || transform.translateY !== undefined) &&
    items.push(
      `translate(${pixelsCss(transform.translateX ?? 0)}, ${pixelsCss(transform.translateY ?? 0)})`,
    );
  transform.rotate !== undefined && items.push(`rotate(${transform.rotate}deg)`);
  transform.scale !== undefined && items.push(`scale(${transform.scale})`);
  (transform.skewX !== undefined || transform.skewY !== undefined) &&
    items.push(`skew(${transform.skewX ?? 0}deg, ${transform.skewY ?? 0}deg)`);
  return items.length > 0 ? items.join(" ") : "none";
}
function serializeStyleLength(length?: Dynamic): Dynamic {
  return "px" in length ? pixelsCss(length.px) : `${length.pct}%`;
}
function serializeStyleTransition(transition?: Dynamic): Dynamic {
  return transition.properties
    .map(
      (property?: Dynamic): Dynamic =>
        `${StyleSchemaCssTransformOpacityColorConfig[property]} ${transition.duration}ms ${transition.easing} ${transition.delay}ms`,
    )
    .join(", ");
}
function serializeStyleValue(
  styleObject?: Dynamic,
  propertyName?: Dynamic,
  propertyValue?: Dynamic,
): Dynamic {
  switch (propertyName) {
    case "fontSize":
    case "letterSpacing":
    case "marginTop":
    case "marginRight":
    case "marginBottom":
    case "marginLeft":
    case "paddingTop":
    case "paddingRight":
    case "paddingBottom":
    case "paddingLeft":
    case "borderWidth":
    case "borderRadius":
    case "top":
    case "right":
    case "bottom":
    case "left":
      styleObject[propertyName] = pixelsCss(propertyValue);
      return;
    case "fontWeight":
    case "lineHeight":
    case "opacity":
    case "zIndex":
      styleObject[propertyName] = propertyValue;
      return;
    case "fontFamily": {
      let value: Dynamic = propertyValue;
      styleObject.fontFamily =
        typeof value == "string"
          ? StyleSchemaValuesSansSerifMonoConfig[value]
          : '"' +
            value.family +
            '", ' +
            (value.webSafe !== undefined ? '"' + value.webSafe + '", ' : "") +
            StyleSchemaValuesSansSerifMonoConfig[value.fallback];
      return;
    }
    case "backgroundGradient":
      styleObject.backgroundImage = serializeStyleGradient(propertyValue);
      return;
    case "boxShadow":
      styleObject.boxShadow = serializeStyleShadows(propertyValue, true);
      return;
    case "textShadow":
      styleObject.textShadow = serializeStyleShadows(propertyValue, false);
      return;
    case "filter":
      styleObject.filter = serializeStyleFilter(propertyValue);
      return;
    case "backdropFilter": {
      let value: Dynamic = serializeStyleFilter(propertyValue);
      styleObject.backdropFilter = value;
      styleObject.WebkitBackdropFilter = value;
      return;
    }
    case "textStrokeWidth":
      styleObject.WebkitTextStrokeWidth = pixelsCss(propertyValue);
      styleObject.paintOrder = "stroke";
      return;
    case "textStrokeColor":
      styleObject.WebkitTextStrokeColor = propertyValue;
      return;
    case "borderSides": {
      let value: Dynamic = styleObject.borderWidth ?? "medium",
        classNames: Dynamic = " " + propertyValue + " ";
      styleObject.borderWidth = ["top", "right", "bottom", "left"]
        .map(
          (className?: Dynamic): Dynamic =>
            classNames.includes(" " + className + " ") ? value : "0",
        )
        .join(" ");
      return;
    }
    case "borderTopWidth":
    case "borderRightWidth":
    case "borderBottomWidth":
    case "borderLeftWidth": {
      let value: Dynamic = (
          styleObject.borderWidth === undefined
            ? ["0"]
            : String(styleObject.borderWidth).split(" ")
        ).map(
          (size?: Dynamic): Dynamic => (size === "medium" ? "0" : size),
        ),
        borderValues: Dynamic =
          value.length === 4
            ? value
            : [value[0], value[0], value[0], value[0]];
      borderValues[
        (
          {
            borderTopWidth: 0,
            borderRightWidth: 1,
            borderBottomWidth: 2,
            borderLeftWidth: 3,
          } as Dynamic
        )[propertyName]
      ] = pixelsCss(propertyValue);
      styleObject.borderWidth = borderValues.join(" ");
      return;
    }
    case "borderTopLeftRadius":
    case "borderTopRightRadius":
    case "borderBottomRightRadius":
    case "borderBottomLeftRadius": {
      let value: Dynamic =
          styleObject.borderRadius === undefined
            ? ["0"]
            : String(styleObject.borderRadius).split(" "),
        radiusValues: Dynamic =
          value.length === 4
            ? value
            : [value[0], value[0], value[0], value[0]];
      radiusValues[
        (
          {
            borderTopLeftRadius: 0,
            borderTopRightRadius: 1,
            borderBottomRightRadius: 2,
            borderBottomLeftRadius: 3,
          } as Dynamic
        )[propertyName]
      ] = pixelsCss(propertyValue);
      styleObject.borderRadius = radiusValues.join(" ");
      return;
    }
    case "transform":
      styleObject.transform = serializeStyleTransform(propertyValue);
      return;
    case "width":
    case "height":
    case "minWidth":
    case "minHeight":
    case "maxWidth":
    case "maxHeight":
      styleObject[propertyName] = serializeStyleLength(propertyValue);
      return;
    case "transition":
      styleObject.transition = serializeStyleTransition(propertyValue);
      return;
    case "animation":
      return;
    default:
      styleObject[propertyName] = propertyValue;
      return;
  }
}
function supportsPaintContainment(): Dynamic {
  let cssApi: Dynamic = (globalThis as Dynamic).CSS;
  return cssApi === undefined || typeof cssApi.supports != "function"
    ? true
    : ((StyleSchemaCssSupportsValue ??= cssApi.supports("contain", "paint")),
      StyleSchemaCssSupportsValue);
}
function styleObjectToCss(styleObject?: Dynamic, nodeType?: Dynamic): Dynamic {
  let state: Dynamic = {},
    value: Dynamic = styleObject;
  for (let propertyName of StyleProperties as Dynamic) {
    if (
      propertyName === "animation" ||
      !StyleSchemaColorAndFontCall(value, propertyName) ||
      !propertyAppliesToNode(propertyName, nodeType) ||
      (StyleSchemaCssPositionTopRightValues.includes(propertyName) &&
        !supportsPaintContainment())
    )
      continue;
    let propertyValue: Dynamic = validateStyleValue(
      propertyName,
      value[propertyName],
      nodeType,
    );
    propertyValue !== undefined && serializeStyleValue(state, propertyName, propertyValue);
  }
  return state;
}
export {
  pixelsCss,
  serializeStyleFilter,
  serializeStyleGradient,
  serializeStyleLength,
  serializeStyleShadows,
  serializeStyleTransform,
  serializeStyleTransition,
  serializeStyleValue,
  styleObjectToCss,
  StyleSchemaCssPositionTopRightValues,
  StyleSchemaCssSupportsValue,
  StyleSchemaCssTransformOpacityColorConfig,
  supportsPaintContainment,
};
export function installEditorStyleSchemaCss(): () => void {
  return () => {
    pixelsCss = (pixels?: Dynamic): Dynamic => `${pixels}px`;
    StyleSchemaCssTransformOpacityColorConfig = {
      transform: "transform",
      opacity: "opacity",
      color: "color",
      backgroundColor: "background-color",
      filter: "filter",
      boxShadow: "box-shadow",
    };
    StyleSchemaCssPositionTopRightValues = [
      "position",
      "top",
      "right",
      "bottom",
      "left",
      "zIndex",
      "float",
    ];
  };
}
