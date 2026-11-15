import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { load_react_jsx_runtime } from "../dependencies";
import { joinClassNames } from "../editor/chrome/overlay-state";
import { B6b0a7Value, defaultAnnotationStrokeColor } from "../editor/media/video-playback";
import { NotesLinkEditingGrayRedOrangeConfig, NotesLinkEditingGrayRedOrangeConfig_2 } from "../editor/notes/link-editing";
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
var CanvasAnnotationShapeStyleConstant_2: Dynamic;
var CanvasAnnotationShapeStyleConstant_3: Dynamic;
var CanvasAnnotationShapeStyleMatches: Dynamic;
function annotationEffectsCss(input?: Dynamic): Dynamic {
  let state: Dynamic = {};
  for (let value of [
    "opacity",
    "box-shadow",
    "filter",
    "backdrop-filter",
  ] as Dynamic)
    input?.[value] !== undefined &&
      (state[
        value.replace(
          /-([a-z])/g,
          (input2?: Dynamic, options?: Dynamic): Dynamic =>
            options.toUpperCase(),
        )
      ] = input[value]);
  return state;
}
function annotationCssStyle(input: Dynamic = {}): Dynamic {
  let state: Dynamic = {};
  for (let [value2, value3] of Object.entries(input) as Dynamic)
    value3 !== undefined &&
      (state[CanvasAnnotationShapeStyleReplace(value2)] = value3);
  let value: Dynamic = [
    "border-width",
    "border-top-width",
    "border-right-width",
    "border-bottom-width",
    "border-left-width",
  ].some((input2?: Dynamic): Dynamic => input[input2] !== undefined);
  state.borderStyle ??= value ? "solid" : "none";
  return state;
}
function annotationFillDefaults(
  input: Dynamic = {},
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  let state: Dynamic = {};
  input["background-color"] === undefined && (state.background = options);
  if (
    context ||
    CanvasAnnotationShapeStyleBorderTopLeftRadiusBorderTopRightRadiusBorderBottomRightRadiusValues.every(
      (input2?: Dynamic): Dynamic => input[input2] === undefined,
    )
  )
    state.borderRadius = 8;
  else if (input["border-radius"] === undefined)
    for (let value of CanvasAnnotationShapeStyleBorderTopLeftRadiusBorderTopRightRadiusBorderBottomRightRadiusValues as Dynamic)
      input[value] === undefined &&
        (state[CanvasAnnotationShapeStyleReplace(value)] = 8);
  return state;
}
function annotationFillSignature(
  input: Dynamic = {},
  options?: Dynamic,
): Dynamic {
  let callback: Dynamic = (input2?: Dynamic, options2?: Dynamic): Dynamic =>
    input2 !== undefined &&
    options2.some((input3?: Dynamic): Dynamic => input3 !== undefined)
      ? [input2, ...options2].join(" ")
      : "";
  return [
    callback(input.background, [input["background-color"]]),
    callback(
      options ? "50%" : input["border-radius"],
      CanvasAnnotationShapeStyleBorderTopLeftRadiusBorderTopRightRadiusBorderBottomRightRadiusValues.map(
        (input2?: Dynamic): Dynamic => input[input2],
      ),
    ),
    callback(
      input["border-width"],
      CanvasAnnotationShapeStyleBorderTopWidthBorderRightWidthBorderBottomWidthValues.map(
        (input2?: Dynamic): Dynamic => input[input2],
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
      className={(0, joinClassNames)(
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
function annotationPathViewBox(input?: Dynamic): Dynamic {
  let value: Dynamic = input.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [],
    [items, items2]: Dynamic = [1, 1];
  for (let index: Dynamic = 0; index + 1 < value.length; index += 2)
    [items, items2] = [
      Math.max(items, value[index]),
      Math.max(items2, value[index + 1]),
    ];
  return {
    w: items,
    h: items2,
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
  CanvasAnnotationShapeStyleConstant_2,
  CanvasAnnotationShapeStyleConstant_3,
  CanvasAnnotationShapeStyleLineArrowPenConfig,
  CanvasAnnotationShapeStyleMatches,
  CanvasAnnotationShapeStyleReplace,
  getAnnotationStrokeWidth,
  jsxCanvasAnnotationShapeStyle,
};
export function installCanvasAnnotationShapeStyle(): () => void {
  return () => {
    jsxCanvasAnnotationShapeStyle = (0, toModuleNamespace)(
      (0, load_react_jsx_runtime)(),
      1,
    );
    annotationStrokeWidth = (input?: Dynamic, options?: Dynamic): Dynamic => {
      let value: Dynamic = parseFloat(input?.["stroke-width"] ?? "");
      return Number.isFinite(value) && value >= 0 ? value : options;
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
    CanvasAnnotationShapeStyleReplace = (input?: Dynamic): Dynamic =>
      input.replace(
        /-([a-z])/g,
        (input2?: Dynamic, options?: Dynamic): Dynamic => options.toUpperCase(),
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
    annotationColor = (input?: Dynamic, options?: Dynamic): Dynamic =>
      input === "rect" || input === "oval"
        ? options === "default"
          ? B6b0a7Value
          : NotesLinkEditingGrayRedOrangeConfig_2[options]
        : options === "default"
          ? defaultAnnotationStrokeColor
          : NotesLinkEditingGrayRedOrangeConfig[options];
    CanvasAnnotationShapeStyleConstant = 2;
    CanvasAnnotationShapeStyleConstant_2 = 4;
    CanvasAnnotationShapeStyleConstant_3 = 16;
    CanvasAnnotationShapeStyleMatches = (): Dynamic =>
      typeof matchMedia == "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;
  };
}
