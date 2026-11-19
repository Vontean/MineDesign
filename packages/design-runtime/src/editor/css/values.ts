/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { isUnsafeCssProperty, normalizeCssProperty, parseStyleDeclarations, serializeStyleDeclarations } from "./declarations";

var CssValuesSubscribers: Dynamic;
var CssValuesWhiteBlackRedConfig: Dynamic;
function setStyleProperty(
  styleText?: Dynamic,
  propertyName?: Dynamic,
  newValue?: Dynamic,
): Dynamic {
  if (isUnsafeCssProperty(propertyName)) return styleText ?? "";
  let declarations: Dynamic = parseStyleDeclarations(styleText),
    normalizedProperty: Dynamic = normalizeCssProperty(propertyName);
  if (newValue == null || newValue === "")
    return serializeStyleDeclarations(
      declarations.filter((declaration?: Dynamic): Dynamic => declaration.prop !== normalizedProperty),
    );
  let flag: Dynamic = false,
    updatedDeclarations: Dynamic = [];
  for (let declaration of declarations as Dynamic)
    declaration.prop !== normalizedProperty
      ? updatedDeclarations.push(declaration)
      : flag ||
        (updatedDeclarations.push({
          prop: normalizedProperty,
          value: newValue,
        }),
        (flag = true));
  flag ||
    updatedDeclarations.push({
      prop: normalizedProperty,
      value: newValue,
    });
  return serializeStyleDeclarations(updatedDeclarations);
}
function classifyStyleValue(styleValue?: Dynamic): Dynamic {
  let trimmedValue: Dynamic = (styleValue ?? "").trim();
  return trimmedValue
    ? trimmedValue.includes("{{")
      ? {
          kind: "template",
          raw: trimmedValue,
        }
      : /(^|[\s(])var\(/.test(trimmedValue)
        ? {
            kind: "var",
            raw: trimmedValue,
          }
        : {
            kind: "literal",
            raw: trimmedValue,
          }
    : {
        kind: "unset",
        raw: "",
      };
}
function getCssVariableNames(cssText?: Dynamic): Dynamic {
  let variableNames: Dynamic = [],
    variablePattern: Dynamic = /var\(\s*(--[\w-]+)/g,
    match: Dynamic;
  for (; (match = variablePattern.exec(cssText ?? "")); )
    variableNames.includes(match[1]) || variableNames.push(match[1]);
  return variableNames;
}
function replaceCssVariables(source?: Dynamic, variableValues?: Dynamic): Dynamic {
  let text: Dynamic = "",
    index: Dynamic = 0;
  for (; index < source.length; ) {
    let varStart: Dynamic = source.indexOf("var(", index);
    if (varStart === -1) {
      text += source.slice(index);
      break;
    }
    text += source.slice(index, varStart);
    let depth: Dynamic = 0,
      closeIndex: Dynamic = -1,
      commaIndex: Dynamic = -1;
    for (let position: Dynamic = varStart + 3; position < source.length; position++) {
      let character: Dynamic = source[position];
      if (character === "(") depth++;
      else if (character === ")") {
        depth--;
        if (depth === 0) {
          closeIndex = position;
          break;
        }
      } else
        character === "," && depth === 1 && commaIndex === -1 && (commaIndex = position);
    }
    if (closeIndex === -1) return null;
    let variableName: Dynamic = source
        .slice(varStart + 4, commaIndex === -1 ? closeIndex : commaIndex)
        .trim(),
      fallback: Dynamic =
        commaIndex === -1 ? "" : source.slice(commaIndex + 1, closeIndex).trim(),
      resolvedValue: Dynamic = (variableValues[variableName] ?? "").trim();
    if (resolvedValue) text += resolvedValue;
    else if (fallback) {
      let resolvedFallback: Dynamic = fallback.includes("var(")
        ? replaceCssVariables(fallback, variableValues)
        : fallback;
      if (resolvedFallback == null) return null;
      text += resolvedFallback;
    } else return null;
    index = closeIndex + 1;
  }
  return text;
}
function parseCssNumber(cssText?: Dynamic): Dynamic {
  let trimmedText: Dynamic = (cssText ?? "").trim(),
    match: Dynamic = /^(-?\d*\.?\d+)([a-z%]*)$/i.exec(trimmedText);
  if (!match) return null;
  let number: Dynamic = parseFloat(match[1]);
  return Number.isNaN(number)
    ? null
    : {
        value: number,
        unit: match[2] ?? "",
      };
}
function getFineUnitStep(unit?: Dynamic, defaultStep?: Dynamic): Dynamic {
  return /^(em|rem|ch|ex|lh|cap|ic|s|turn)$/i.test(unit) ? 0.01 : defaultStep;
}
function stepCssNumber(
  current?: Dynamic,
  direction?: Dynamic,
  keyEvent?: Dynamic,
  stepOptions: Dynamic = {},
): Dynamic {
  let baseStep: Dynamic = stepOptions.step ?? 1,
    fineStep: Dynamic = Math.min(
      getFineUnitStep(stepOptions.unit ?? "", undefined) ?? 0.1,
      baseStep,
    ),
    stepSize: Dynamic = keyEvent.altKey
      ? fineStep
      : baseStep * (keyEvent.shiftKey ? 10 : 1),
    nextValue: Dynamic = Math.round((current + direction * stepSize) * 100) / 100;
  stepOptions.min != null && (nextValue = Math.max(stepOptions.min, nextValue));
  stepOptions.max != null && (nextValue = Math.min(stepOptions.max, nextValue));
  return nextValue;
}
function formatCssNumber(amount?: Dynamic, unit?: Dynamic): Dynamic {
  return `${Math.round(amount * 100) / 100}${unit}`;
}
function normalizeCssUnit(unit?: Dynamic): Dynamic {
  return unit && CssValuesSubscribers.has(unit.toLowerCase())
    ? unit.toLowerCase()
    : "";
}
function roundCssNumber(amount?: Dynamic, unit?: Dynamic): Dynamic {
  return (unit === "px" || unit === "") && Math.abs(amount) > 20
    ? Math.round(amount)
    : Math.round(amount * 100) / 100;
}
function describeColorValue(colorValue?: Dynamic): Dynamic {
  let trimmedColor: Dynamic = colorValue.trim(),
    namedColor: Dynamic = CssValuesWhiteBlackRedConfig[trimmedColor.toLowerCase()];
  if (namedColor) return namedColor;
  let variableMatch: Dynamic = /^var\(\s*--([\w-]+)\s*\)$/i.exec(trimmedColor);
  if (variableMatch) return variableMatch[1];
  let hexMatch: Dynamic = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(
    trimmedColor,
  );
  if (hexMatch) {
    let hexDigits: Dynamic = hexMatch[1];
    return (
      "#" +
      (hexDigits.length <= 4
        ? [...hexDigits]
            .map((digit?: Dynamic): Dynamic => digit + digit)
            .join("")
        : hexDigits)
    ).toUpperCase();
  }
  let rgbMatch: Dynamic =
    /^rgba?\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/i.exec(
      trimmedColor,
    );
  if (!rgbMatch) return colorValue;
  let channels: Dynamic = [rgbMatch[1], rgbMatch[2], rgbMatch[3]].map(
    (channelText?: Dynamic): Dynamic => parseInt(channelText, 10),
  );
  if (channels.some((channel?: Dynamic): Dynamic => channel > 255)) return colorValue;
  let hexColor: Dynamic = `#${channels.map((channel?: Dynamic): Dynamic => channel.toString(16).padStart(2, "0")).join("")}`;
  if (rgbMatch[4] != null) {
    let alpha: Dynamic = rgbMatch[4].endsWith("%")
      ? parseFloat(rgbMatch[4]) / 100
      : parseFloat(rgbMatch[4]);
    if (!Number.isFinite(alpha) || alpha < 0 || alpha > 1) return colorValue;
    alpha < 1 &&
      (hexColor += Math.round(alpha * 255)
        .toString(16)
        .padStart(2, "0"));
  }
  return hexColor.toUpperCase();
}
function splitColorAlpha(colorValue?: Dynamic): Dynamic {
  let hexAlphaMatch: Dynamic = /^#([0-9a-f]{6})([0-9a-f]{2})$/i.exec(colorValue.trim());
  if (!hexAlphaMatch)
    return {
      main: colorValue,
    };
  let alpha: Dynamic = parseInt(hexAlphaMatch[2], 16) / 255,
    mainColor: Dynamic = ("#" + hexAlphaMatch[1]).toUpperCase();
  return alpha >= 1
    ? {
        main: mainColor,
      }
    : {
        main: mainColor,
        alphaPct: Math.round(alpha * 100) + "%",
      };
}
function normalizeFontFamilyList(fontFamilies?: Dynamic): Dynamic {
  return fontFamilies
    .split(",")
    .map(
      (fontFamily?: Dynamic): Dynamic =>
        fontFamily.trim().replace(/^['"]|['"]$/g, ""),
    )
    .filter(Boolean)
    .join(", ");
}
export {
  classifyStyleValue,
  CssValuesSubscribers,
  CssValuesWhiteBlackRedConfig,
  describeColorValue,
  formatCssNumber,
  getCssVariableNames,
  getFineUnitStep,
  normalizeCssUnit,
  normalizeFontFamilyList,
  parseCssNumber,
  replaceCssVariables,
  roundCssNumber,
  setStyleProperty,
  splitColorAlpha,
  stepCssNumber,
};
export function installEditorCssValues(): () => void {
  return () => {
    CssValuesSubscribers = new Set([
      "px",
      "%",
      "em",
      "rem",
      "ch",
      "ex",
      "cap",
      "ic",
      "lh",
      "rlh",
      "vh",
      "vw",
      "vi",
      "vb",
      "vmin",
      "vmax",
      "svh",
      "svw",
      "svi",
      "svb",
      "svmin",
      "svmax",
      "lvh",
      "lvw",
      "lvi",
      "lvb",
      "lvmin",
      "lvmax",
      "dvh",
      "dvw",
      "dvi",
      "dvb",
      "dvmin",
      "dvmax",
      "cqw",
      "cqh",
      "cqi",
      "cqb",
      "cqmin",
      "cqmax",
      "cm",
      "mm",
      "in",
      "pt",
      "pc",
      "q",
      "deg",
      "rad",
      "grad",
      "turn",
      "s",
      "ms",
      "fr",
    ]);
    CssValuesWhiteBlackRedConfig = {
      white: "#FFFFFF",
      black: "#000000",
      red: "#FF0000",
      green: "#008000",
      blue: "#0000FF",
      yellow: "#FFFF00",
      orange: "#FFA500",
      purple: "#800080",
      gray: "#808080",
      grey: "#808080",
    };
  };
}
