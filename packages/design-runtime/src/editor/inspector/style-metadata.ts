/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { InspectorPropertySchemaCursorPointerEventsObjectFitValues, InspectorPropertySchemaItems_2 } from "./property-schema";

var cssPropertyToComputedKey: Dynamic;
var InspectorStyleMetadataItems: Dynamic;
var InspectorStyleMetadataDataDcTplStyleSet: Dynamic;
var InspectorStyleMetadataInputTextareaButtonSet: Dynamic;
var svgShapeTags: Dynamic;
var InspectorStyleMetadataStrokeStrokeWidthFillValues: Dynamic;
var InspectorStyleMetadataTextTspanTextpathSet: Dynamic;
var InspectorStyleMetadataLineHeightTextAlignSet: Dynamic;
var InspectorStyleMetadataSubscribers: Dynamic;
var InspectorStyleMetadataSubscribers_2: Dynamic;
var InspectorStyleMetadataBackgroundColorPattern: Dynamic;
var InspectorStyleMetadataLabel: Dynamic;
function formatPropertyKey(input?: Dynamic, options?: Dynamic): Dynamic {
  return options(input) != null ? input : `@${input}`;
}
function hasVisiblePaint(input?: Dynamic): Dynamic {
  let value: Dynamic = (input ?? "").trim().toLowerCase();
  return (
    value !== "" &&
    value !== "none" &&
    value !== "hidden" &&
    !isTransparentColor(value) &&
    !/^0+(?:\.0+)?[a-z%]*$/.test(value)
  );
}
function isTransparentColor(input?: Dynamic): Dynamic {
  return (
    input === "transparent" ||
    /^(?:rgb|hsl)a?\([^,)]+,[^,)]+,[^,)]+,\s*(?:0+(?:\.0+)?|\.0+)%?\s*\)$/.test(
      input,
    ) ||
    /^(?:rgb|hsl)a?\([^/)]+\/\s*(?:0+(?:\.0+)?|\.0+)%?\s*\)$/.test(input) ||
    /^#(?:[0-9a-f]{3}0|[0-9a-f]{6}00)$/.test(input)
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
  InspectorStyleMetadataSubscribers_2,
  InspectorStyleMetadataTextTspanTextpathSet,
  isTransparentColor,
  svgShapeTags,
};
export function installEditorInspectorStyleMetadata(): () => void {
  return () => {
    cssPropertyToComputedKey = (input?: Dynamic): Dynamic =>
      input.replace(
        /-([a-z])/g,
        (input2?: Dynamic, options?: Dynamic): Dynamic => options.toUpperCase(),
      );
    InspectorStyleMetadataItems = [
      ...new Set([
        ...InspectorPropertySchemaItems_2.map(
          (input?: Dynamic): Dynamic => cssPropertyToComputedKey(input.prop),
        ),
        ...InspectorPropertySchemaCursorPointerEventsObjectFitValues.map(
          (input?: Dynamic): Dynamic => cssPropertyToComputedKey(input),
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
    InspectorStyleMetadataSubscribers_2 = new Set([
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
