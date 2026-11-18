import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { load_react_jsx_runtime } from "../dependencies";
import { joinClassNames } from "../editor/chrome/overlay-state";
import { B6b0a7Value, defaultAnnotationStrokeColor } from "../editor/media/video-playback";
import { NotesLinkEditingGrayRedOrangeConfig, NotesLinkEditingGrayRedOrangeConfig_2 as shapeFillColors } from "../editor/notes/link-editing";
import { toModuleNamespace } from "../module-helpers";

var jsxCanvasAnnotationShapeStyle: Dynamic;
var annotationStrokeWidth: Dynamic;
var CanvasAnnotationShapeStyleLineArrowPenConfig: Dynamic;
var getAnnotationStrokeWidth: Dynamic;
var CanvasAnnotationShapeStyleReplace: Dynamic;
var CanvasAnnotationShapeStyleBorderTopLeftRadiusBorderTopRightRadiusBorderBottomRightRadiusValues: Dynamic;
var CanvasAnnotationShapeStyleBorderTopWidthBorderRightWidthBorderBottomWidthValues: Dynamic;
var annotationColor: Dynamic;
var CanvasAnnotationShapeStyleConstant: Dynamic;
var defaultArrowStrokeWidth: Dynamic;
var svgOverflowPadding: Dynamic;
var CanvasAnnotationShapeStyleMatches: Dynamic;
function annotationEffectsCss(css?: Dynamic): Dynamic {
  let effects: Dynamic = {};
  for (let effectProperty of [
    "opacity",
    "box-shadow",
    "filter",
    "backdrop-filter",
  ] as Dynamic)
    css?.[effectProperty] !== undefined &&
      (effects[
        effectProperty.replace(
          /-([a-z])/g,
          (match?: Dynamic, letter?: Dynamic): Dynamic =>
            letter.toUpperCase(),
        )
      ] = css[effectProperty]);
  return effects;
}
function annotationCssStyle(css: Dynamic = {}): Dynamic {
  let style: Dynamic = {};
  for (let [cssName, cssValue] of Object.entries(css) as Dynamic)
    cssValue !== undefined &&
      (style[CanvasAnnotationShapeStyleReplace(cssName)] = cssValue);
  let hasBorderWidth: Dynamic = [
    "border-width",
    "border-top-width",
    "border-right-width",
    "border-bottom-width",
    "border-left-width",
  ].some((borderProperty?: Dynamic): Dynamic => css[borderProperty] !== undefined);
  style.borderStyle ??= hasBorderWidth ? "solid" : "none";
  return style;
}
function annotationFillDefaults(
  css: Dynamic = {},
  background?: Dynamic,
  useDefaultRadius?: Dynamic,
): Dynamic {
  let fillStyle: Dynamic = {};
  css["background-color"] === undefined && (fillStyle.background = background);
  if (
    useDefaultRadius ||
    CanvasAnnotationShapeStyleBorderTopLeftRadiusBorderTopRightRadiusBorderBottomRightRadiusValues.every(
      (radiusProperty?: Dynamic): Dynamic => css[radiusProperty] === undefined,
    )
  )
    fillStyle.borderRadius = 8;
  else if (css["border-radius"] === undefined)
    for (let radiusProperty of CanvasAnnotationShapeStyleBorderTopLeftRadiusBorderTopRightRadiusBorderBottomRightRadiusValues as Dynamic)
      css[radiusProperty] === undefined &&
        (fillStyle[CanvasAnnotationShapeStyleReplace(radiusProperty)] = 8);
  return fillStyle;
}
function annotationFillSignature(
  css: Dynamic = {},
  isOval?: Dynamic,
): Dynamic {
  let joinIfDefined: Dynamic = (firstPart?: Dynamic, otherParts?: Dynamic): Dynamic =>
    firstPart !== undefined &&
    otherParts.some((part?: Dynamic): Dynamic => part !== undefined)
      ? [firstPart, ...otherParts].join(" ")
      : "";
  return [
    joinIfDefined(css.background, [css["background-color"]]),
    joinIfDefined(
      isOval ? "50%" : css["border-radius"],
      CanvasAnnotationShapeStyleBorderTopLeftRadiusBorderTopRightRadiusBorderBottomRightRadiusValues.map(
        (radiusProperty?: Dynamic): Dynamic => css[radiusProperty],
      ),
    ),
    joinIfDefined(
      css["border-width"],
      CanvasAnnotationShapeStyleBorderTopWidthBorderRightWidthBorderBottomWidthValues.map(
        (widthProperty?: Dynamic): Dynamic => css[widthProperty],
      ),
    ),
  ].join("/");
}
function AnnotationShapeBody({
  on: on,
  id: id,
  css: css,
  mirror: mirror,
  children: children,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <div
      data-testid={on ? "mega-shape-body-" + id : undefined}
      className={joinClassNames(
        "pointer-events-none absolute inset-0 box-border",
        on && "overflow-hidden",
      )}
      style={
        on
          ? {
              ...annotationCssStyle(css),
              ...mirror,
            }
          : mirror
      }
    >
      {children}
    </div>
  );
}
function annotationPathViewBox(pathData?: Dynamic): Dynamic {
  let numbers: Dynamic = pathData.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [],
    [maxX, maxY]: Dynamic = [1, 1];
  for (let index: Dynamic = 0; index + 1 < numbers.length; index += 2)
    [maxX, maxY] = [
      Math.max(maxX, numbers[index]),
      Math.max(maxY, numbers[index + 1]),
    ];
  return {
    w: maxX,
    h: maxY,
  };
}
export {
  annotationColor,
  annotationCssStyle,
  annotationEffectsCss,
  annotationFillDefaults,
  annotationFillSignature,
  annotationPathViewBox,
  AnnotationShapeBody,
  annotationStrokeWidth,
  CanvasAnnotationShapeStyleBorderTopLeftRadiusBorderTopRightRadiusBorderBottomRightRadiusValues,
  CanvasAnnotationShapeStyleBorderTopWidthBorderRightWidthBorderBottomWidthValues,
  CanvasAnnotationShapeStyleConstant,
  defaultArrowStrokeWidth as CanvasAnnotationShapeStyleConstant_2,
  svgOverflowPadding as CanvasAnnotationShapeStyleConstant_3,
  CanvasAnnotationShapeStyleLineArrowPenConfig,
  CanvasAnnotationShapeStyleMatches,
  CanvasAnnotationShapeStyleReplace,
  getAnnotationStrokeWidth,
  jsxCanvasAnnotationShapeStyle,
};
export function installCanvasAnnotationShapeStyle(): () => void {
  return () => {
    jsxCanvasAnnotationShapeStyle = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    annotationStrokeWidth = (css?: Dynamic, defaultWidth?: Dynamic): Dynamic => {
      let strokeWidth: Dynamic = parseFloat(css?.["stroke-width"] ?? "");
      return Number.isFinite(strokeWidth) && strokeWidth >= 0 ? strokeWidth : defaultWidth;
    };
    CanvasAnnotationShapeStyleLineArrowPenConfig = {
      line: 4,
      arrow: 4,
      pen: 2,
    };
    getAnnotationStrokeWidth = (source?: Dynamic): Dynamic =>
      annotationStrokeWidth(
        source.css,
        CanvasAnnotationShapeStyleLineArrowPenConfig[source.kind],
      );
    CanvasAnnotationShapeStyleReplace = (cssName?: Dynamic): Dynamic =>
      cssName.replace(
        /-([a-z])/g,
        (match?: Dynamic, letter?: Dynamic): Dynamic => letter.toUpperCase(),
      );
    CanvasAnnotationShapeStyleBorderTopLeftRadiusBorderTopRightRadiusBorderBottomRightRadiusValues =
      [
        "border-top-left-radius",
        "border-top-right-radius",
        "border-bottom-right-radius",
        "border-bottom-left-radius",
      ];
    CanvasAnnotationShapeStyleBorderTopWidthBorderRightWidthBorderBottomWidthValues =
      [
        "border-top-width",
        "border-right-width",
        "border-bottom-width",
        "border-left-width",
      ];
    annotationColor = (shapeKind?: Dynamic, colorName?: Dynamic): Dynamic =>
      shapeKind === "rect" || shapeKind === "oval"
        ? colorName === "default"
          ? B6b0a7Value
          : shapeFillColors[colorName]
        : colorName === "default"
          ? defaultAnnotationStrokeColor
          : NotesLinkEditingGrayRedOrangeConfig[colorName];
    CanvasAnnotationShapeStyleConstant = 2;
    defaultArrowStrokeWidth = 4;
    svgOverflowPadding = 16;
    CanvasAnnotationShapeStyleMatches = (): Dynamic =>
      typeof matchMedia == "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;
  };
}
