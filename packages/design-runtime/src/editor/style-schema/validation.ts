/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { StyleSchemaNodeTypesStartsWith } from "./node-types";
import { StyleSchemaValuesItems_3 as supportedStyleProperties, StyleSchemaValuesRegistry, StyleSchemaValuesSubscribers_2 as effectProperties, StyleSchemaValuesSubscribers_3 as animatableProperties, StyleSchemaValuesSubscribers_4 as hoverProperties } from "./values";

var styleSchema: Dynamic;
var StyleSchemaValidationTableTableCellTableHeaderValues: Dynamic;
var StyleSchemaValidationLimit: Dynamic;
var StyleSchemaValidationExpressionImageSetPattern: Dynamic;
var StyleSchemaValidationPattern: Dynamic;
var StyleSchemaValidationSubscribers: Dynamic;
var D16D16D16Value: Dynamic;
var StyleSchemaValidationLabel: Dynamic;
var cssWhitespacePatternSource: Dynamic;
var rgbStyleColorPattern: Dynamic;
var hslStyleColorPattern: Dynamic;
var oklchStyleColorPattern: Dynamic;
var labStyleColorPattern: Dynamic;
function buildStyleSchema(): Dynamic {
  let value: Dynamic = Object.create(null);
  for (let propertyName of supportedStyleProperties as Dynamic) {
    let propertyConfig: Dynamic = StyleSchemaValuesRegistry[propertyName];
    value[propertyName] = {
      value: propertyConfig.v,
      slidesValue: propertyConfig.slides,
      shapeValue: propertyConfig.shape,
      applies: propertyConfig.on,
      routed: propertyConfig.routed ?? [],
      effect: effectProperties.has(propertyName),
      hover: hoverProperties.has(propertyName),
      animatable: animatableProperties.has(propertyName),
    };
  }
  return value;
}
function propertyAppliesToNode(propertyName?: Dynamic, nodeType?: Dynamic): Dynamic {
  return propertyName === "transform" &&
    StyleSchemaValidationTableTableCellTableHeaderValues.includes(nodeType)
    ? false
    : styleSchema[propertyName].applies.includes(nodeType);
}
function getPropertyValidationClass(
  propertyName?: Dynamic,
  nodeType?: Dynamic,
): Dynamic {
  let value: Dynamic = styleSchema[propertyName];
  return nodeType === "slides-shape" && value.shapeValue !== undefined
    ? value.shapeValue
    : nodeType !== undefined &&
        value.slidesValue !== undefined &&
        StyleSchemaNodeTypesStartsWith(nodeType)
      ? value.slidesValue
      : value.value;
}
function validateSimpleStyleString(text?: Dynamic): Dynamic {
  if (typeof text != "string") return;
  let value: Dynamic = text.trim();
  if (
    !(value.length === 0 || value.length > StyleSchemaValidationLimit) &&
    !StyleSchemaValidationExpressionImageSetPattern.test(value)
  )
    return value;
}
function isStyleObject(candidate?: Dynamic): Dynamic {
  return typeof candidate == "object" && candidate !== null && !Array.isArray(candidate);
}
function validateStyleNumber(source?: Dynamic, numberValue?: Dynamic): Dynamic {
  if (typeof numberValue != "number" || !Number.isFinite(numberValue)) return;
  if (source.kind === "int") {
    let roundedValue: Dynamic = Math.round(numberValue / source.step) * source.step;
    return Math.min(source.hi, Math.max(source.lo, roundedValue));
  }
  let value: Dynamic = Math.min(source.hi, Math.max(source.lo, numberValue));
  return source.kind === "len"
    ? Math.round(value * 10) / 10
    : Math.round(value * 1e4) / 1e4;
}
function validateOptionalStyleNumber(
  bounds?: Dynamic,
  numberValue?: Dynamic,
  fallback?: Dynamic,
): Dynamic {
  return numberValue === undefined
    ? fallback
    : validateStyleNumber(bounds, numberValue);
}
function validateStyleEnum(allowedValues?: Dynamic, enumValue?: Dynamic): Dynamic {
  if (typeof enumValue != "string") return;
  let value: Dynamic = enumValue.trim();
  if (!(value.length === 0 || value.length > StyleSchemaValidationLimit))
    return allowedValues.includes(value) ? value : undefined;
}
export {
  buildStyleSchema,
  D16D16D16Value,
  getPropertyValidationClass,
  hslStyleColorPattern,
  isStyleObject,
  labStyleColorPattern,
  oklchStyleColorPattern,
  propertyAppliesToNode,
  rgbStyleColorPattern,
  styleSchema,
  StyleSchemaValidationExpressionImageSetPattern,
  StyleSchemaValidationLabel,
  cssWhitespacePatternSource as StyleSchemaValidationLabel_2,
  StyleSchemaValidationLimit,
  StyleSchemaValidationPattern,
  StyleSchemaValidationSubscribers,
  StyleSchemaValidationTableTableCellTableHeaderValues,
  validateOptionalStyleNumber,
  validateSimpleStyleString,
  validateStyleEnum,
  validateStyleNumber,
};
export function installEditorStyleSchemaValidation(): () => void {
  return () => {
    styleSchema = buildStyleSchema();
    StyleSchemaValidationTableTableCellTableHeaderValues = [
      "table",
      "tableCell",
      "tableHeader",
    ];
    StyleSchemaValidationLimit = 64;
    StyleSchemaValidationExpressionImageSetPattern =
      /[;{}@<>"'\\\n\r\f\0]|\/\*|(?:url|expression|image-set|image|element|cross-fade|paint|var|env|attr|src|counters?)\s*\(/i;
    StyleSchemaValidationPattern =
      /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/;
    StyleSchemaValidationSubscribers = new Set([
      "transparent",
      "currentcolor",
      "aliceblue",
      "antiquewhite",
      "aqua",
      "aquamarine",
      "azure",
      "beige",
      "bisque",
      "black",
      "blanchedalmond",
      "blue",
      "blueviolet",
      "brown",
      "burlywood",
      "cadetblue",
      "chartreuse",
      "chocolate",
      "coral",
      "cornflowerblue",
      "cornsilk",
      "crimson",
      "cyan",
      "darkblue",
      "darkcyan",
      "darkgoldenrod",
      "darkgray",
      "darkgrey",
      "darkgreen",
      "darkkhaki",
      "darkmagenta",
      "darkolivegreen",
      "darkorange",
      "darkorchid",
      "darkred",
      "darksalmon",
      "darkseagreen",
      "darkslateblue",
      "darkslategray",
      "darkslategrey",
      "darkturquoise",
      "darkviolet",
      "deeppink",
      "deepskyblue",
      "dimgray",
      "dimgrey",
      "dodgerblue",
      "firebrick",
      "floralwhite",
      "forestgreen",
      "fuchsia",
      "gainsboro",
      "ghostwhite",
      "gold",
      "goldenrod",
      "gray",
      "grey",
      "green",
      "greenyellow",
      "honeydew",
      "hotpink",
      "indianred",
      "indigo",
      "ivory",
      "khaki",
      "lavender",
      "lavenderblush",
      "lawngreen",
      "lemonchiffon",
      "lightblue",
      "lightcoral",
      "lightcyan",
      "lightgoldenrodyellow",
      "lightgray",
      "lightgrey",
      "lightgreen",
      "lightpink",
      "lightsalmon",
      "lightseagreen",
      "lightskyblue",
      "lightslategray",
      "lightslategrey",
      "lightsteelblue",
      "lightyellow",
      "lime",
      "limegreen",
      "linen",
      "magenta",
      "maroon",
      "mediumaquamarine",
      "mediumblue",
      "mediumorchid",
      "mediumpurple",
      "mediumseagreen",
      "mediumslateblue",
      "mediumspringgreen",
      "mediumturquoise",
      "mediumvioletred",
      "midnightblue",
      "mintcream",
      "mistyrose",
      "moccasin",
      "navajowhite",
      "navy",
      "oldlace",
      "olive",
      "olivedrab",
      "orange",
      "orangered",
      "orchid",
      "palegoldenrod",
      "palegreen",
      "paleturquoise",
      "palevioletred",
      "papayawhip",
      "peachpuff",
      "peru",
      "pink",
      "plum",
      "powderblue",
      "purple",
      "rebeccapurple",
      "red",
      "rosybrown",
      "royalblue",
      "saddlebrown",
      "salmon",
      "sandybrown",
      "seagreen",
      "seashell",
      "sienna",
      "silver",
      "skyblue",
      "slateblue",
      "slategray",
      "slategrey",
      "snow",
      "springgreen",
      "steelblue",
      "tan",
      "teal",
      "thistle",
      "tomato",
      "turquoise",
      "violet",
      "wheat",
      "white",
      "whitesmoke",
      "yellow",
      "yellowgreen",
    ]);
    D16D16D16Value = "(?:\\d{1,6}(?:\\.\\d{1,6})?|\\.\\d{1,6})";
    StyleSchemaValidationLabel = "[ \\t\\n\\r\\f]*";
    cssWhitespacePatternSource = "[ \\t\\n\\r\\f]+";
    rgbStyleColorPattern = new RegExp(
      "^rgba?\\(" +
        StyleSchemaValidationLabel +
        D16D16D16Value +
        "%?" +
        StyleSchemaValidationLabel +
        "," +
        StyleSchemaValidationLabel +
        D16D16D16Value +
        "%?" +
        StyleSchemaValidationLabel +
        "," +
        StyleSchemaValidationLabel +
        D16D16D16Value +
        "%?" +
        StyleSchemaValidationLabel +
        "(?:," +
        StyleSchemaValidationLabel +
        D16D16D16Value +
        "%?" +
        StyleSchemaValidationLabel +
        ")?\\)$",
    );
    hslStyleColorPattern = new RegExp(
      "^rgba?\\(" +
        StyleSchemaValidationLabel +
        D16D16D16Value +
        "%?" +
        cssWhitespacePatternSource +
        D16D16D16Value +
        "%?" +
        cssWhitespacePatternSource +
        D16D16D16Value +
        "%?" +
        StyleSchemaValidationLabel +
        "(?:/" +
        StyleSchemaValidationLabel +
        D16D16D16Value +
        "%?" +
        StyleSchemaValidationLabel +
        ")?\\)$",
    );
    oklchStyleColorPattern = new RegExp(
      "^hsla?\\(" +
        StyleSchemaValidationLabel +
        "-?" +
        D16D16D16Value +
        "(?:deg)?" +
        StyleSchemaValidationLabel +
        "," +
        StyleSchemaValidationLabel +
        D16D16D16Value +
        "%" +
        StyleSchemaValidationLabel +
        "," +
        StyleSchemaValidationLabel +
        D16D16D16Value +
        "%" +
        StyleSchemaValidationLabel +
        "(?:," +
        StyleSchemaValidationLabel +
        D16D16D16Value +
        "%?" +
        StyleSchemaValidationLabel +
        ")?\\)$",
    );
    labStyleColorPattern = new RegExp(
      "^hsla?\\(" +
        StyleSchemaValidationLabel +
        "-?" +
        D16D16D16Value +
        "(?:deg)?" +
        cssWhitespacePatternSource +
        D16D16D16Value +
        "%" +
        cssWhitespacePatternSource +
        D16D16D16Value +
        "%" +
        StyleSchemaValidationLabel +
        "(?:/" +
        StyleSchemaValidationLabel +
        D16D16D16Value +
        "%?" +
        StyleSchemaValidationLabel +
        ")?\\)$",
    );
  };
}
