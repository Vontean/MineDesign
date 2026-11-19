import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { DcTplAttribute } from "../html/authoring";
import { arrowHeadMarkerHtml, createArrowHeadId, inspectSvgArrow, normalizeSvgPaint, OpenValue } from "./arrows";

var SvgLayoutStrokeStrokeWidthStrokeLinecapValues: Dynamic;
var SvgLayoutStrokeWidthStrokeDasharrayStrokeDashoffsetSet: Dynamic;
var SvgLayoutDX1Y1Set: Dynamic;
var SvgLayoutReplace: Dynamic;
var SvgLayoutAttributes: Dynamic;
var svgHasDefs: Dynamic;
var SvgLayoutStrokeStrokeWidthStrokeLinecapConfig: Dynamic;
function setCaseSensitiveModelAttribute(
  model?: Dynamic,
  elementId?: Dynamic,
  attributeName?: Dynamic,
  attributeValue?: Dynamic,
): Dynamic {
  let element: Dynamic = model.element(elementId);
  element?.removeAttribute(attributeName);
  element?.removeAttribute(attributeName.toLowerCase());
  model.setAttribute(elementId, attributeName, attributeValue);
}
function setModelElementRect(
  model?: Dynamic,
  elementId?: Dynamic,
  rect?: Dynamic,
): Dynamic {
  model.setStyleProperty(elementId, "left", `${rect.left}px`);
  model.setStyleProperty(elementId, "top", `${rect.top}px`);
  model.setStyleProperty(elementId, "width", `${rect.width}px`);
  model.setStyleProperty(elementId, "height", `${rect.height}px`);
  model.setAttribute(elementId, "width", String(rect.width));
  model.setAttribute(elementId, "height", String(rect.height));
  setCaseSensitiveModelAttribute(
    model,
    elementId,
    "viewBox",
    `0 0 ${rect.width} ${rect.height}`,
  );
}
function normalizeSvgElementSizing(
  svgElement?: Dynamic,
  elementId?: Dynamic,
): Dynamic {
  SvgLayoutAttributes(svgElement, elementId, "preserveAspectRatio") !== "none" &&
    setCaseSensitiveModelAttribute(
      svgElement,
      elementId,
      "preserveAspectRatio",
      "none",
    );
  !svgHasDefs(svgElement, elementId) &&
    svgElement.inlineStyleValue(elementId, "fill") !== "none" &&
    svgElement.setStyleProperty(elementId, "fill", "none");
  svgElement.inlineStyleValue(elementId, "overflow") === "" &&
    svgElement.setStyleProperty(elementId, "overflow", "visible");
}
function scaleSvgLengthList(lengthList?: Dynamic, scale?: Dynamic): Dynamic {
  return /^[\d.\s,px]+$/.test(lengthList)
    ? lengthList.replace(
        /\d*\.?\d+/g,
        (length?: Dynamic): Dynamic =>
          String(Math.round(parseFloat(length) * scale * 100) / 100),
      )
    : lengthList;
}
function copySvgStrokeProperties(
  model?: Dynamic,
  styleElementId?: Dynamic,
  sourceElementId?: Dynamic,
  scaleFactor: Dynamic = 1,
  extraStyles: Dynamic = {},
  originalStyles: Dynamic = {},
  isStrict: Dynamic = false,
): Dynamic {
  let hasDefs: Dynamic = svgHasDefs(model, sourceElementId),
    styleTarget: Dynamic = hasDefs ? styleElementId : sourceElementId,
    strokeScale: Dynamic =
      model.attribute(styleElementId, "vector-effect") === "non-scaling-stroke" ||
      extraStyles["vector-effect"] === "non-scaling-stroke"
        ? 1
        : scaleFactor,
    hasStroke: Dynamic =
      model.attribute(styleElementId, "class") == null &&
      model.attribute(styleElementId, "id") == null,
    shouldCopy: Dynamic = !hasDefs || hasStroke;
  if (strokeScale !== 1 && !hasDefs)
    for (let strokeProperty of SvgLayoutStrokeWidthStrokeDasharrayStrokeDashoffsetSet as Dynamic) {
      let inlineValue: Dynamic = model.inlineStyleValue(sourceElementId, strokeProperty);
      inlineValue &&
        model.setStyleProperty(
          sourceElementId,
          strokeProperty,
          scaleSvgLengthList(inlineValue, strokeScale),
        );
      let attributeValue: Dynamic = model.attribute(sourceElementId, strokeProperty);
      attributeValue != null &&
        model.setAttribute(
          sourceElementId,
          strokeProperty,
          scaleSvgLengthList(attributeValue, strokeScale),
        );
    }
  for (let strokeProperty of SvgLayoutStrokeStrokeWidthStrokeLinecapValues as Dynamic) {
    let inlineValue: Dynamic = model.inlineStyleValue(styleElementId, strokeProperty),
      attributeValue: Dynamic = model.attribute(styleElementId, strokeProperty),
      combinedValue: Dynamic = inlineValue || attributeValue || "",
      fallbackValue: Dynamic =
        SvgLayoutStrokeWidthStrokeDasharrayStrokeDashoffsetSet.has(strokeProperty) &&
        strokeScale !== 1,
      sourceValue: Dynamic = combinedValue,
      targetElement: Dynamic = styleTarget,
      detailValue: Dynamic =
        model.inlineStyleValue(sourceElementId, strokeProperty) ||
        model.attribute(sourceElementId, strokeProperty) ||
        "";
    if (
      SvgLayoutStrokeWidthStrokeDasharrayStrokeDashoffsetSet.has(strokeProperty) &&
      inlineValue &&
      !attributeValue &&
      !isStrict
    ) {
      fallbackValue &&
        model.setStyleProperty(
          styleElementId,
          strokeProperty,
          scaleSvgLengthList(inlineValue, strokeScale),
        );
      continue;
    }
    let matchesOriginal: Dynamic = extraStyles[strokeProperty] === originalStyles[strokeProperty],
      shouldPreserve: Dynamic = !hasDefs && (isStrict ? hasStroke : hasStroke && matchesOriginal);
    if (
      !combinedValue &&
      fallbackValue &&
      extraStyles[strokeProperty] &&
      (strokeProperty === "stroke-width" ||
        extraStyles[strokeProperty] !==
          SvgLayoutStrokeStrokeWidthStrokeLinecapConfig[strokeProperty])
    ) {
      if (shouldPreserve && detailValue && matchesOriginal) continue;
      sourceValue = extraStyles[strokeProperty];
      targetElement = shouldPreserve ? sourceElementId : styleElementId;
    } else
      !combinedValue && fallbackValue && hasDefs && detailValue
        ? ((sourceValue = detailValue), (targetElement = styleElementId))
        : !combinedValue &&
          isStrict &&
          shouldCopy &&
          extraStyles[strokeProperty] &&
          extraStyles[strokeProperty] !== originalStyles[strokeProperty] &&
          extraStyles[strokeProperty] !==
            SvgLayoutStrokeStrokeWidthStrokeLinecapConfig[strokeProperty] &&
          (sourceValue = extraStyles[strokeProperty]);
    if (
      !sourceValue ||
      /[;{}<>]/.test(sourceValue) ||
      (hasDefs && combinedValue && !fallbackValue)
    )
      continue;
    let finalValue: Dynamic = fallbackValue
      ? scaleSvgLengthList(sourceValue, strokeScale)
      : sourceValue;
    model.setStyleProperty(targetElement, strokeProperty, finalValue);
    targetElement !== styleElementId
      ? (inlineValue && model.setStyleProperty(styleElementId, strokeProperty, null),
        attributeValue != null && model.setAttribute(styleElementId, strokeProperty, null))
      : attributeValue != null &&
        !inlineValue &&
        model.setAttribute(styleElementId, strokeProperty, null);
  }
  let callback: Dynamic = (elementId?: Dynamic): Dynamic =>
    !!model.inlineStyleValue(elementId, "stroke-width") ||
    model.attribute(elementId, "stroke-width") != null;
  strokeScale !== 1 &&
    !extraStyles["stroke-width"] &&
    !callback(styleElementId) &&
    !callback(sourceElementId) &&
    model.setStyleProperty(
      styleTarget,
      "stroke-width",
      String(Math.round(strokeScale * 100) / 100),
    );
}
function setSvgLineEndpoints(
  model?: Dynamic,
  elementId?: Dynamic,
  x1?: Dynamic,
  y1?: Dynamic,
  x2?: Dynamic,
  y2?: Dynamic,
): Dynamic {
  let elementTag: Dynamic = model.tagName(elementId);
  elementTag === "line"
    ? (model.setAttribute(elementId, "x1", String(x1)),
      model.setAttribute(elementId, "y1", String(y1)),
      model.setAttribute(elementId, "x2", String(x2)),
      model.setAttribute(elementId, "y2", String(y2)))
    : elementTag === "polyline"
      ? model.setAttribute(
          elementId,
          "points",
          `${x1},${y1} ${x2},${y2}`,
        )
      : model.setAttribute(
          elementId,
          "d",
          `M ${x1} ${y1} L ${x2} ${y2}`,
        );
}
function resizeSvgArrow(
  model?: Dynamic,
  elementId?: Dynamic,
  pathData?: Dynamic,
  scaleFactor: Dynamic = 1,
  extraStyles: Dynamic = {},
  detailStyles: Dynamic = {},
  resizeOptions: Dynamic = {},
): Dynamic {
  let arrowElement: Dynamic = model.element(elementId),
    arrowGeometry: Dynamic = arrowElement ? inspectSvgArrow(arrowElement) : null;
  if (!arrowGeometry) return null;
  let shaftTid: Dynamic = parseInt(
      arrowGeometry.shaft.getAttribute(DcTplAttribute) ?? "-1",
      10,
    ),
    markerFill: Dynamic =
      [
        shaftTid >= 0
          ? model.inlineStyleValue(shaftTid, "stroke") ||
            model.attribute(shaftTid, "stroke")
          : "",
        model.inlineStyleValue(elementId, "stroke") ||
          model.attribute(elementId, "stroke"),
        extraStyles.stroke,
      ].find(
        (paint?: Dynamic): Dynamic =>
          normalizeSvgPaint(paint) != null,
      ) ?? "";
  normalizeSvgElementSizing(model, elementId);
  let isLegacyPath: Dynamic = arrowGeometry.tag === "path" && !arrowGeometry.legacy;
  shaftTid >= 0 &&
    copySvgStrokeProperties(
      model,
      shaftTid,
      elementId,
      scaleFactor,
      extraStyles,
      detailStyles,
      !isLegacyPath,
    );
  if (shaftTid >= 0 && isLegacyPath) {
    model.setAttribute(shaftTid, "d", pathData);
    return {
      restamped: false,
    };
  }
  let shaftAttributes: Dynamic = [...arrowGeometry.shaft.attributes]
      .filter(
        (attribute?: Dynamic): Dynamic =>
          attribute.name !== DcTplAttribute &&
          attribute.name !== "style" &&
          !SvgLayoutDX1Y1Set.has(attribute.name),
      )
      .map(
        (attribute?: Dynamic): Dynamic =>
          ` ${attribute.name}="${SvgLayoutReplace(attribute.value)}"`,
      )
      .join(""),
    inlineStyle: Dynamic = arrowGeometry.shaft.getAttribute("style") ?? "",
    serializedStyle: Dynamic =
      shaftTid >= 0
        ? model
            .childTids(shaftTid)
            .map(
              (child?: Dynamic): Dynamic => model.subtreeHtml(child) ?? "",
            )
            .join("")
        : "",
    subtreeMarkup: Dynamic = model
      .childTids(elementId)
      .filter((child?: Dynamic): Dynamic => child !== shaftTid)
      .map((child?: Dynamic): Dynamic => model.subtreeHtml(child) ?? "")
      .join(""),
    legacyEnds: Dynamic = arrowGeometry.legacy
      ? (resizeOptions.heads ?? {
          start: "none",
          end: OpenValue,
        })
      : {
          start: "none",
          end: "none",
        },
    headPositions: Dynamic = ["start", "end"]
      .filter((headPosition?: Dynamic): Dynamic => legacyEnds[headPosition] !== "none")
      .map(
        (headPosition?: Dynamic): Dynamic => ({
          end: headPosition,
          kind: legacyEnds[headPosition],
          id: createArrowHeadId(legacyEnds[headPosition]),
        }),
      );
  model.setInnerHtml(
    elementId,
    (headPositions.length > 0
      ? `<defs>${headPositions.map((source?: Dynamic): Dynamic => arrowHeadMarkerHtml(source.id, source.kind, source.end, markerFill)).join("")}</defs>`
      : "") +
      subtreeMarkup +
      `<path d="${pathData}"${headPositions.map((headMarker?: Dynamic): Dynamic => ` marker-${headMarker.end}="url(#${headMarker.id})"`).join("")}${shaftAttributes}${inlineStyle ? ` style="${SvgLayoutReplace(inlineStyle)}"` : ""}>${serializedStyle}</path>`,
  );
  resizeOptions.restamp !== false && model.restamp();
  return {
    restamped: resizeOptions.restamp !== false,
  };
}
export {
  copySvgStrokeProperties,
  normalizeSvgElementSizing,
  resizeSvgArrow,
  scaleSvgLengthList,
  setCaseSensitiveModelAttribute,
  setModelElementRect,
  setSvgLineEndpoints,
  svgHasDefs,
  SvgLayoutAttributes,
  SvgLayoutDX1Y1Set,
  SvgLayoutReplace,
  SvgLayoutStrokeStrokeWidthStrokeLinecapConfig,
  SvgLayoutStrokeStrokeWidthStrokeLinecapValues,
  SvgLayoutStrokeWidthStrokeDasharrayStrokeDashoffsetSet,
};
export function installEditorSvgLayout(): () => void {
  return () => {
    SvgLayoutStrokeStrokeWidthStrokeLinecapValues = [
      "stroke",
      "stroke-width",
      "stroke-linecap",
      "stroke-linejoin",
      "stroke-dasharray",
      "stroke-dashoffset",
      "stroke-opacity",
      "stroke-miterlimit",
    ];
    SvgLayoutStrokeWidthStrokeDasharrayStrokeDashoffsetSet = new Set([
      "stroke-width",
      "stroke-dasharray",
      "stroke-dashoffset",
    ]);
    SvgLayoutDX1Y1Set = new Set(["d", "x1", "y1", "x2", "y2", "points"]);
    SvgLayoutReplace = (replacementValue?: Dynamic): Dynamic =>
      replacementValue
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;");
    SvgLayoutAttributes = (
      model?: Dynamic,
      elementId?: Dynamic,
      attributeName?: Dynamic,
    ): Dynamic => model.attributes(elementId)[attributeName] ?? null;
    svgHasDefs = (model?: Dynamic, rootId?: Dynamic): Dynamic =>
      model
        .childTids(rootId)
        .some((childId?: Dynamic): Dynamic => model.tagName(childId) === "defs");
    SvgLayoutStrokeStrokeWidthStrokeLinecapConfig = {
      get stroke() { return uiMessage("inspector.layout.none"); },
      "stroke-width": "1px",
      "stroke-linecap": "butt",
      "stroke-linejoin": "miter",
      get "stroke-dasharray"() { return uiMessage("inspector.layout.none"); },
      "stroke-dashoffset": "0px",
      "stroke-opacity": "1",
      "stroke-miterlimit": "4",
    };
  };
}
