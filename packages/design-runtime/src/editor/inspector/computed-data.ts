/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { parseHsvaColor } from "../color/picker-primitives";

var InspectorComputedDataPattern: Dynamic;
var D13D16Value: Dynamic;
var rgbComputedValuePattern: Dynamic;
var opaqueRgbComputedValuePattern: Dynamic;
var InspectorComputedDataRectCircleEllipseSet: Dynamic;
var InspectorComputedDataPathLinePolylineSet: Dynamic;
var InspectorComputedDataItems: Dynamic;
function normalizePixelValue(pixelValue?: Dynamic): Dynamic {
  return typeof pixelValue != "string"
    ? null
    : /^\d{1,4}(\.\d{1,6})?px$/.test(pixelValue)
      ? pixelValue
      : null;
}
function normalizeRgbValue(rgbValue?: Dynamic): Dynamic {
  return typeof rgbValue != "string"
    ? null
    : rgbComputedValuePattern.test(rgbValue)
      ? rgbValue
      : null;
}
function normalizeFontWeight(fontWeightValue?: Dynamic): Dynamic {
  return typeof fontWeightValue == "string" &&
    /^(1000|[1-9]\d{0,2}(\.\d{1,3})?)$/.test(fontWeightValue)
    ? fontWeightValue
    : null;
}
function normalizeContrastGround(rawData?: Dynamic): Dynamic {
  let dataObject: Dynamic = rawData != null && typeof rawData == "object" ? rawData : {};
  if (dataObject.instances !== 1) return null;
  let ground: Dynamic = dataObject.ground;
  if (ground == null || typeof ground != "object") return null;
  let { behind: behind, ink: ink }: Dynamic = ground;
  if (
    typeof behind != "string" ||
    !opaqueRgbComputedValuePattern.test(behind)
  )
    return null;
  let normalizedInk: Dynamic = normalizeRgbValue(ink);
  return normalizedInk === null
    ? null
    : {
        behind: behind,
        ink: normalizedInk,
      };
}
function normalizeInspectorComputedData(
  kind?: Dynamic,
  rawData?: Dynamic,
  flags: Dynamic = {},
): Dynamic {
  let dataObject: Dynamic =
      rawData != null && typeof rawData == "object" ? rawData : {},
    computed: Dynamic =
      dataObject.computed != null && typeof dataObject.computed == "object"
        ? dataObject.computed
        : {},
    tagName: Dynamic = typeof dataObject.tag == "string" ? dataObject.tag : "",
    computedRgb: Dynamic = (propName?: Dynamic): Dynamic =>
      normalizeRgbValue(computed[propName]),
    visibleColor: Dynamic = (color?: Dynamic): Dynamic =>
      color != null && parseHsvaColor(color).a > 0
        ? color
        : null,
    isSvgShape: Dynamic =
      InspectorComputedDataRectCircleEllipseSet.has(tagName) ||
      InspectorComputedDataPathLinePolylineSet.has(tagName) ||
      tagName === "svg",
    matchingString: Dynamic = (text?: Dynamic, pattern?: Dynamic): Dynamic =>
      typeof text == "string" && pattern.test(text) ? text : null,
    boxStyles: Dynamic = {};
  if (kind !== "line" && !isSvgShape) {
    let setBoxStyle: Dynamic = (
        propName?: Dynamic,
        propValue?: Dynamic,
      ): Dynamic => {
        propValue != null && propValue !== "0px" && (boxStyles[propName] = propValue);
      },
      sideBorders: Dynamic = ["Top", "Right", "Bottom", "Left"].map(
        (side?: Dynamic): Dynamic => ({
          S: side,
          w: normalizePixelValue(computed["border" + side + "Width"]),
          st: matchingString(
            computed["border" + side + "Style"],
            /^(solid|dashed|dotted)$/,
          ),
        }),
      ),
      visibleBorder: Dynamic = sideBorders.find(
        (sideBorder?: Dynamic): Dynamic =>
          sideBorder.st !== null && sideBorder.w !== null && sideBorder.w !== "0px",
      );
    if (visibleBorder) {
      setBoxStyle("border-style", visibleBorder.st);
      setBoxStyle("border-width", visibleBorder.w);
      setBoxStyle("border-color", computedRgb("border" + visibleBorder.S + "Color"));
      for (let sideBorder of sideBorders as Dynamic)
        sideBorder.w != null &&
          (boxStyles["border-" + sideBorder.S.toLowerCase() + "-width"] =
            sideBorder.st === null ? "0px" : sideBorder.w);
    }
    let cornerRadii: Dynamic = [
      normalizePixelValue(computed.borderTopLeftRadius),
      normalizePixelValue(computed.borderTopRightRadius),
      normalizePixelValue(computed.borderBottomRightRadius),
      normalizePixelValue(computed.borderBottomLeftRadius),
    ];
    cornerRadii.every((radius?: Dynamic): Dynamic => radius === cornerRadii[0])
      ? setBoxStyle("border-radius", cornerRadii[0])
      : [
          "border-top-left-radius",
          "border-top-right-radius",
          "border-bottom-right-radius",
          "border-bottom-left-radius",
        ].forEach((propName?: Dynamic, index?: Dynamic): Dynamic => {
          cornerRadii[index] != null && (boxStyles[propName] = cornerRadii[index]);
        });
    setBoxStyle("padding-top", normalizePixelValue(computed.paddingTop));
    setBoxStyle("padding-right", normalizePixelValue(computed.paddingRight));
    setBoxStyle("padding-bottom", normalizePixelValue(computed.paddingBottom));
    setBoxStyle("padding-left", normalizePixelValue(computed.paddingLeft));
  }
  return {
    box: boxStyles,
    fontWeight:
      kind === "text" ? normalizeFontWeight(computed.fontWeight) : null,
    fontFamily:
      kind === "text"
        ? matchingString(computed.fontFamily, InspectorComputedDataPattern)
        : null,
    fontStyle:
      kind === "text"
        ? matchingString(computed.fontStyle, /^(normal|italic|oblique)$/)
        : null,
    textAlign:
      kind === "text"
        ? matchingString(
            computed.textAlign,
            /^(start|end|left|right|center|justify)$/,
          )
        : null,
    textDecoration:
      kind === "text"
        ? matchingString(
            computed.textDecorationLine,
            /^(none|underline|line-through|overline)( (underline|line-through|overline))*$/,
          )
        : null,
    fontSize: kind === "text" ? normalizePixelValue(computed.fontSize) : null,
    lineHeight:
      kind === "text"
        ? normalizeLineHeightRatio(
            normalizePixelValue(computed.lineHeight),
            normalizePixelValue(computed.fontSize),
          )
        : null,
    letterSpacing:
      kind === "text"
        ? computed.letterSpacing === "normal"
          ? "0px"
          : matchingString(computed.letterSpacing, /^-?\d{1,4}(\.\d{1,6})?px$/)
        : null,
    color: kind === "text" ? computedRgb("color") : null,
    textClip:
      kind === "text" &&
      (computed.backgroundClip === "text" ||
        computed.webkitBackgroundClip === "text"),
    ground:
      kind === "text" && flags.ground === true
        ? normalizeContrastGround(rawData)
        : null,
    background:
      kind === "line"
        ? null
        : (visibleColor(computedRgb("backgroundColor")) ??
          (InspectorComputedDataRectCircleEllipseSet.has(tagName)
            ? computedRgb("fill")
            : null)),
    stroke:
      kind === "text"
        ? null
        : computedRgb(isSvgShape ? "stroke" : "borderTopColor"),
  };
}
function normalizeLineHeightRatio(
  lineHeightPx?: Dynamic,
  fontSizePx?: Dynamic,
): Dynamic {
  let lineHeight: Dynamic = lineHeightPx !== null ? parseFloat(lineHeightPx) : NaN,
    fontSize: Dynamic = fontSizePx !== null ? parseFloat(fontSizePx) : NaN;
  return lineHeight > 0 && fontSize > 0
    ? String(Math.round((lineHeight / fontSize) * 100) / 100)
    : null;
}
export {
  D13D16Value,
  InspectorComputedDataItems,
  InspectorComputedDataPathLinePolylineSet,
  InspectorComputedDataPattern,
  InspectorComputedDataRectCircleEllipseSet,
  normalizeContrastGround,
  normalizeFontWeight,
  normalizeInspectorComputedData,
  normalizeLineHeightRatio,
  normalizePixelValue,
  normalizeRgbValue,
  opaqueRgbComputedValuePattern,
  rgbComputedValuePattern,
};
export function installEditorInspectorComputedData(): () => void {
  return () => {
    InspectorComputedDataPattern = /^[\p{L}\p{N}_\s"',.-]{1,200}$/u;
    D13D16Value = "\\d{1,3}(?:\\.\\d{1,6})?";
    rgbComputedValuePattern = new RegExp(
      "^rgba?\\(" +
        D13D16Value +
        ", " +
        D13D16Value +
        ", " +
        D13D16Value +
        "(?:, " +
        D13D16Value +
        ")?\\)$",
    );
    opaqueRgbComputedValuePattern = new RegExp(
      "^rgb\\(" +
        D13D16Value +
        ", " +
        D13D16Value +
        ", " +
        D13D16Value +
        "\\)$",
    );
    InspectorComputedDataRectCircleEllipseSet = new Set([
      "rect",
      "circle",
      "ellipse",
      "polygon",
    ]);
    InspectorComputedDataPathLinePolylineSet = new Set([
      "path",
      "line",
      "polyline",
    ]);
    InspectorComputedDataItems = [
      "borderTopStyle",
      "borderRightStyle",
      "borderBottomStyle",
      "borderLeftStyle",
      "borderTopWidth",
      "borderRightWidth",
      "borderBottomWidth",
      "borderLeftWidth",
      "borderRightColor",
      "borderBottomColor",
      "borderLeftColor",
      "borderTopLeftRadius",
      "borderTopRightRadius",
      "borderBottomRightRadius",
      "borderBottomLeftRadius",
      "paddingTop",
      "paddingRight",
      "paddingBottom",
      "paddingLeft",
      "fontWeight",
      "fontFamily",
      "fontStyle",
      "textAlign",
      "textDecorationLine",
      "fontSize",
      "lineHeight",
      "letterSpacing",
      "color",
      "backgroundColor",
      "backgroundClip",
      "webkitBackgroundClip",
      "fill",
      "stroke",
      "borderTopColor",
    ];
  };
}
