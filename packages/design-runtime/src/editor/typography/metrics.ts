/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { parseStyleDeclarations } from "../css/declarations";
import { InspectorComputedDataPattern, normalizeInspectorComputedData } from "../inspector/computed-data";
import { displayFontFamily } from "./font-family";

var TypographyMetricsSansSerifMonoConfig: Dynamic;
var TypographyMetricsMin: Dynamic;
var TypographyMetricsHandler: Dynamic;
var roundToHundredths: Dynamic;
var TypographyMetricsFontSize: Dynamic;
var TypographyMetricsLineHeight: Dynamic;
var TypographyMetricsLetterSpacing: Dynamic;
function typographyStyleEdits(style?: Dynamic): Dynamic {
  let items: Dynamic = [
      ["font-size", String(TypographyMetricsFontSize(style)) + "px"],
      ["line-height", String(TypographyMetricsLineHeight(style))],
      ["font-weight", String(TypographyMetricsHandler(style.fontWeight))],
      [
        "letter-spacing",
        String(TypographyMetricsLetterSpacing(style)) + "px",
      ],
      ["font-style", style.italic ? "italic" : "normal"],
    ],
    value: Dynamic = normalizeTypographyFamily(style.family);
  value !== undefined && items.push(["font-family", value]);
  return items;
}
function normalizeTypographyFamily(fontValue?: Dynamic): Dynamic {
  if (fontValue === undefined) return;
  let callback: Dynamic = (familyList?: Dynamic): Dynamic => {
      let quote: Dynamic = null;
      for (let familyPart of familyList as Dynamic)
        quote =
          quote === null
            ? familyPart === '"' || familyPart === "'"
              ? familyPart
              : null
            : familyPart === quote
              ? null
              : quote;
      return quote === null;
    },
    isUsableFamily: Dynamic = (familyName?: Dynamic): Dynamic =>
      InspectorComputedDataPattern.test(familyName) &&
      callback(familyName) &&
      (typeof CSS === "undefined" ||
        typeof CSS.supports != "function" ||
        CSS.supports("font-family", familyName));
  if (isUsableFamily(fontValue.stack)) return fontValue.stack;
  let value: Dynamic =
    '"' +
    fontValue.name.replace(/"/g, "") +
    '", ' +
    TypographyMetricsSansSerifMonoConfig[fontValue.generic];
  return fontValue.name !== "" && isUsableFamily(value)
    ? value
    : TypographyMetricsSansSerifMonoConfig[fontValue.generic];
}
function matchedDesignSystemTextStyle(
  styles?: Dynamic,
  fallback?: Dynamic,
): Dynamic {
  let {
    size: value,
    weight: weight,
    italic: italic,
    leading: leading,
    tracking: tracking,
    face: face,
  }: Dynamic = fallback;
  if (
    value === undefined ||
    weight === undefined ||
    italic === undefined ||
    leading === undefined ||
    tracking === undefined
  )
    return;
  let callback: Dynamic = (
      candidate?: Dynamic,
      target?: Dynamic,
      referenceValue?: Dynamic,
      tolerance?: Dynamic,
    ): Dynamic =>
      roundToHundredths(referenceValue) === target
        ? 0
        : Math.abs(candidate - referenceValue) / tolerance,
    bestStyle: Dynamic,
    bestDistance: Dynamic = 1 / 0;
  for (let styleCandidate of styles as Dynamic) {
    let style: Dynamic = styleCandidate.style;
    if (
      TypographyMetricsHandler(style.fontWeight) !==
        TypographyMetricsHandler(weight) ||
      style.italic !== italic ||
      (style.family !== undefined &&
        displayFontFamily(
          normalizeTypographyFamily(style.family) ?? "",
        ).toLowerCase() !== face)
    )
      continue;
    let items: Dynamic = [
      callback(style.fontSize, TypographyMetricsFontSize(style), value, 0.05),
      callback(
        style.lineHeight,
        TypographyMetricsLineHeight(style),
        leading,
        0.02,
      ),
      callback(
        style.letterSpacing,
        TypographyMetricsLetterSpacing(style),
        tracking,
        0.05,
      ),
    ];
    if (items.some((distanceValue?: Dynamic): Dynamic => distanceValue > 1 + 1e-9))
      continue;
    let distance: Dynamic = items[0] + items[1] + items[2];
    distance < bestDistance && ((bestStyle = styleCandidate), (bestDistance = distance));
  }
  return bestStyle;
}
function readTypographyMetrics(readStyle?: Dynamic, fallbackMetrics?: Dynamic): Dynamic {
  let callback: Dynamic = (cssValue?: Dynamic): Dynamic => {
      let pixels: Dynamic =
        cssValue == null ? null : /^\s*(-?\d+(?:\.\d+)?)px\s*$/.exec(cssValue);
      return pixels ? parseFloat(pixels[1]) : undefined;
    },
    readUnitless: Dynamic = (cssValue?: Dynamic): Dynamic => {
      let unitless: Dynamic =
        cssValue == null ? null : /^\s*(\d+(?:\.\d+)?)\s*$/.exec(cssValue);
      return unitless ? parseFloat(unitless[1]) : undefined;
    },
    readWeight: Dynamic = (weightText?: Dynamic): Dynamic => {
      if (weightText == null) return;
      if (weightText === "bold") return 700;
      if (weightText === "normal") return 400;
      let numericWeight: Dynamic = Number.parseFloat(weightText);
      return Number.isFinite(numericWeight) ? numericWeight : undefined;
    },
    value: Dynamic = readStyle("font-style") ?? fallbackMetrics.fontStyle ?? "normal";
  return {
    size: callback(readStyle("font-size")) ?? callback(fallbackMetrics.fontSize),
    weight: readWeight(readStyle("font-weight") ?? fallbackMetrics.fontWeight),
    italic:
      value === "italic" ? true : value === "normal" ? false : undefined,
    leading: readUnitless(readStyle("line-height")) ?? readUnitless(fallbackMetrics.lineHeight),
    tracking:
      callback(readStyle("letter-spacing")) ?? callback(fallbackMetrics.letterSpacing),
    face: displayFontFamily(
      readStyle("font-family") ?? fallbackMetrics.fontFamily ?? "",
    ).toLowerCase(),
  };
}
function authoredTypographyMetrics(
  tagName?: Dynamic,
  styleText?: Dynamic,
  computedMetrics?: Dynamic,
): Dynamic {
  let entries: Dynamic = new Map(
      parseStyleDeclarations(styleText).map(
        (declaration?: Dynamic): Dynamic => [declaration.prop, declaration.value],
      ),
    ),
    value: Dynamic = normalizeInspectorComputedData("text", {
      tag: tagName,
      computed: computedMetrics,
    });
  return readTypographyMetrics(
    (property?: Dynamic): Dynamic => entries.get(property),
    value,
  );
}
function resolvedTypographyMetrics(
  declarations?: Dynamic,
  fallbackMetrics?: Dynamic,
): Dynamic {
  return readTypographyMetrics(
    (property?: Dynamic): Dynamic =>
      declarations.get(property) ??
      (property === "font-size"
        ? fallbackMetrics?.fontSize
        : property === "font-family"
          ? fallbackMetrics?.fontFamily
          : undefined) ??
      undefined,
    {
      fontSize: fallbackMetrics?.rendered?.fontSizePx,
      fontWeight: fallbackMetrics?.rendered?.fontWeight,
      fontStyle: fallbackMetrics?.rendered?.fontStyle,
      lineHeight: fallbackMetrics?.rendered?.lineHeight,
      letterSpacing: fallbackMetrics?.rendered?.letterSpacing,
      fontFamily: fallbackMetrics?.rendered?.fontFamily,
    },
  );
}
export {
  authoredTypographyMetrics,
  matchedDesignSystemTextStyle,
  normalizeTypographyFamily,
  readTypographyMetrics,
  resolvedTypographyMetrics,
  TypographyMetricsFontSize,
  TypographyMetricsHandler,
  roundToHundredths,
  TypographyMetricsLetterSpacing,
  TypographyMetricsLineHeight,
  TypographyMetricsMin,
  TypographyMetricsSansSerifMonoConfig,
  typographyStyleEdits,
};
export function installEditorTypographyMetrics(): () => void {
  return () => {
    TypographyMetricsSansSerifMonoConfig = {
      sans: "sans-serif",
      serif: "serif",
      mono: "monospace",
    };
    TypographyMetricsMin = (
      numberValue?: Dynamic,
      minimum?: Dynamic,
      maximum?: Dynamic,
    ): Dynamic => Math.min(maximum, Math.max(minimum, numberValue));
    TypographyMetricsHandler = (metrics?: Dynamic): Dynamic =>
      TypographyMetricsMin(Math.round(metrics / 100) * 100, 100, 900);
    roundToHundredths = (numberValue?: Dynamic): Dynamic =>
      Math.round(numberValue * 100) / 100;
    TypographyMetricsFontSize = (metrics?: Dynamic): Dynamic =>
      roundToHundredths(TypographyMetricsMin(metrics.fontSize, 1, 9999));
    TypographyMetricsLineHeight = (metrics?: Dynamic): Dynamic =>
      roundToHundredths(
        TypographyMetricsMin(metrics.lineHeight, 0.1, 99),
      );
    TypographyMetricsLetterSpacing = (metrics?: Dynamic): Dynamic =>
      roundToHundredths(
        TypographyMetricsMin(metrics.letterSpacing, -999, 999),
      );
  };
}
