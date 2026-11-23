/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { InspectorPropertySchemaCursorPointerEventsObjectFitValues, propertySpecifications as propertySpecs } from "./property-schema";

var cssPropertyToComputedKey: Dynamic;
var InspectorStyleMetadataItems: Dynamic;
var InspectorStyleMetadataDataDcTplStyleSet: Dynamic;
var InspectorStyleMetadataInputTextareaButtonSet: Dynamic;
var svgShapeTags: Dynamic;
var InspectorStyleMetadataStrokeStrokeWidthFillValues: Dynamic;
var InspectorStyleMetadataTextTspanTextpathSet: Dynamic;
var InspectorStyleMetadataLineHeightTextAlignSet: Dynamic;
var InspectorStyleMetadataSubscribers: Dynamic;
var intrinsicContentTags: Dynamic;
var InspectorStyleMetadataBackgroundColorPattern: Dynamic;
var InspectorStyleMetadataLabel: Dynamic;
function formatPropertyKey(prop?: Dynamic, getAuthoredValue?: Dynamic): Dynamic {
  return getAuthoredValue(prop) != null ? prop : `@${prop}`;
}
function hasVisiblePaint(paint?: Dynamic): Dynamic {
  let normalizedPaint: Dynamic = (paint ?? "").trim().toLowerCase();
  return (
    normalizedPaint !== "" &&
    normalizedPaint !== "none" &&
    normalizedPaint !== "hidden" &&
    !isTransparentColor(normalizedPaint) &&
    !/^0+(?:\.0+)?[a-z%]*$/.test(normalizedPaint)
  );
}
function isTransparentColor(color?: Dynamic): Dynamic {
  return (
    color === "transparent" ||
    /^(?:rgb|hsl)a?\([^,)]+,[^,)]+,[^,)]+,\s*(?:0+(?:\.0+)?|\.0+)%?\s*\)$/.test(
      color,
    ) ||
    /^(?:rgb|hsl)a?\([^/)]+\/\s*(?:0+(?:\.0+)?|\.0+)%?\s*\)$/.test(color) ||
    /^#(?:[0-9a-f]{3}0|[0-9a-f]{6}00)$/.test(color)
  );
}
export {
  cssPropertyToComputedKey,
  formatPropertyKey,
  hasVisiblePaint,
  InspectorStyleMetadataBackgroundColorPattern,
  InspectorStyleMetadataDataDcTplStyleSet,
  InspectorStyleMetadataInputTextareaButtonSet,
  InspectorStyleMetadataItems,
  InspectorStyleMetadataLabel,
  InspectorStyleMetadataLineHeightTextAlignSet,
  InspectorStyleMetadataStrokeStrokeWidthFillValues,
  InspectorStyleMetadataSubscribers,
  intrinsicContentTags,
  InspectorStyleMetadataTextTspanTextpathSet,
  isTransparentColor,
  svgShapeTags,
};
export function installEditorInspectorStyleMetadata(): () => void {
  return () => {
    cssPropertyToComputedKey = (cssProperty?: Dynamic): Dynamic =>
      cssProperty.replace(
        /-([a-z])/g,
        (matchText?: Dynamic, letter?: Dynamic): Dynamic => letter.toUpperCase(),
      );
    InspectorStyleMetadataItems = [
      ...new Set([
        ...propertySpecs.map(
          (propertySpec?: Dynamic): Dynamic => cssPropertyToComputedKey(propertySpec.prop),
        ),
        ...InspectorPropertySchemaCursorPointerEventsObjectFitValues.map(
          (cssProperty?: Dynamic): Dynamic => cssPropertyToComputedKey(cssProperty),
        ),
        "backgroundColor",
        "backgroundClip",
        "webkitBackgroundClip",
        "backgroundImage",
        "backgroundSize",
        "textDecorationLine",
        "fill",
        "stroke",
        "strokeWidth",
        "strokeLinecap",
        "listStyleType",
        "borderTopWidth",
        "borderTopColor",
        "borderTopStyle",
      ]),
    ];
    InspectorStyleMetadataDataDcTplStyleSet = new Set(["data-dc-tpl", "style"]);
    InspectorStyleMetadataInputTextareaButtonSet = new Set([
      "input",
      "textarea",
      "button",
      "select",
    ]);
    svgShapeTags = new Set([
      "path",
      "line",
      "circle",
      "rect",
      "ellipse",
      "polygon",
      "polyline",
    ]);
    InspectorStyleMetadataStrokeStrokeWidthFillValues = [
      "stroke",
      "stroke-width",
      "fill",
      "stroke-linecap",
    ];
    InspectorStyleMetadataTextTspanTextpathSet = new Set([
      "text",
      "tspan",
      "textpath",
    ]);
    InspectorStyleMetadataLineHeightTextAlignSet = new Set([
      "line-height",
      "text-align",
    ]);
    InspectorStyleMetadataSubscribers = new Set(
      "p h1 h2 h3 h4 h5 h6 span li dt dd td th blockquote q cite label figcaption caption code pre em strong b i u s small mark sub sup".split(
        " ",
      ),
    );
    intrinsicContentTags = new Set([
      "img",
      "br",
      "hr",
      "wbr",
      "input",
      "textarea",
      "select",
      "video",
      "audio",
      "iframe",
      "canvas",
      "embed",
      "object",
      "svg",
      ...svgShapeTags,
      ...InspectorStyleMetadataTextTspanTextpathSet,
    ]);
    InspectorStyleMetadataBackgroundColorPattern =
      /^(?:background(?:-color|-image)?|border(?:-(?:top|right|bottom|left))?(?:-width)?)$/;
    InspectorStyleMetadataLabel =
      "A shadow would paint over gradient or image text \u2014 switch Text \u203A Color back to a plain colour first";
  };
}
