/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { DesignSystemTypeDeclarationsAZaZAZaZPattern } from "./type-declarations";

var DesignSystemTypographyParsingLimit: Dynamic;
var maxTypographyGroups: Dynamic;
var maxFontFamilies: Dynamic;
var DesignSystemTypographyParsingConstant: Dynamic;
var DesignSystemTypographyParsingPattern: Dynamic;
var safeFontFamilyPattern: Dynamic;
var DesignSystemTypographyParsingHandler: Dynamic;
var typographyLengthToPixels: Dynamic;
var DesignSystemTypographyParsing300330400Config: Dynamic;
function isSafeFontFamily(fontFamily?: Dynamic): Dynamic {
  if (
    !safeFontFamilyPattern.test(fontFamily) ||
    fontFamily.includes("/*") ||
    fontFamily.includes("*/")
  )
    return false;
  let openQuote: Dynamic = null;
  for (let character of fontFamily as Dynamic)
    openQuote === null
      ? (openQuote = character === '"' || character === "'" ? character : null)
      : character === openQuote && (openQuote = null);
  return openQuote === null;
}
function parseTypographyLength(lengthInput?: Dynamic): Dynamic {
  if (typeof lengthInput == "number")
    return Number.isFinite(lengthInput) && Math.abs(lengthInput) < 1e4
      ? {
          n: DesignSystemTypographyParsingHandler(lengthInput),
          unit: "px",
        }
      : undefined;
  if (typeof lengthInput != "string") return;
  let lengthText: Dynamic = lengthInput.trim().toLowerCase();
  if (lengthText === "0")
    return {
      n: 0,
      unit: "px",
    };
  let lengthMatch: Dynamic = DesignSystemTypographyParsingPattern.exec(lengthText);
  return lengthMatch === null
    ? undefined
    : {
        n: Number(lengthMatch[1]),
        unit: lengthMatch[2],
      };
}
function parseTypographyFamily(familyStack?: Dynamic): Dynamic {
  let firstFamilyMatch: Dynamic =
      /^\s*(?:"([^"]{1,80})"|'([^']{1,80})'|([A-Za-z0-9 _-]{1,80}))/.exec(
        familyStack,
      ),
    lastFamilyName: Dynamic = (familyStack.split(",").pop() ?? "")
      .trim()
      .replace(/^["']|["']$/g, "")
      .toLowerCase(),
    genericFamily: Dynamic = /mono/.test(lastFamilyName)
      ? "mono"
      : /(^|ui-)serif$/.test(lastFamilyName)
        ? "serif"
        : "sans";
  return {
    name: (firstFamilyMatch?.[1] ?? firstFamilyMatch?.[2] ?? firstFamilyMatch?.[3] ?? "").trim(),
    stack: familyStack,
    generic: genericFamily,
  };
}
function parseTypographyStyles(designSystemSource?: Dynamic): Dynamic {
  let typeSection: Dynamic = designSystemSource?.type;
  if (typeof typeSection != "object" || typeSection === null) return [];
  let fontFamiliesByKey: Dynamic = new Map();
  if (
    typeof typeSection.families == "object" &&
    typeSection.families !== null &&
    !Array.isArray(typeSection.families)
  )
    for (let [familyKey, familyStackText] of Object.entries(typeSection.families) as Dynamic) {
      if (fontFamiliesByKey.size >= maxFontFamilies) break;
      let normalizedFamilyKey: Dynamic = familyKey.trim().toLowerCase();
      DesignSystemTypeDeclarationsAZaZAZaZPattern.test(normalizedFamilyKey) &&
        typeof familyStackText == "string" &&
        isSafeFontFamily(familyStackText.trim()) &&
        fontFamiliesByKey.set(normalizedFamilyKey, familyStackText.trim());
    }
  let normalizeFamilyKey: Dynamic = (familyKey?: Dynamic): Dynamic =>
      typeof familyKey == "string" && fontFamiliesByKey.has(familyKey.trim().toLowerCase())
        ? familyKey.trim().toLowerCase()
        : "",
    styles: Dynamic = [],
    seenStyleNames: Dynamic = new Set(),
    groupCount: Dynamic = 0;
  for (let rawGroup of (Array.isArray(typeSection.groups)
    ? typeSection.groups
    : []) as Dynamic) {
    if (groupCount >= maxTypographyGroups) break;
    if (typeof rawGroup != "object" || rawGroup === null || Array.isArray(rawGroup))
      continue;
    let group: Dynamic = rawGroup;
    groupCount++;
    let groupName: Dynamic =
        (typeof group.name == "string"
          ? [...group.name]
              .slice(0, DesignSystemTypographyParsingConstant)
              .join("")
          : "") || "Type",
      groupFamilyKey: Dynamic = normalizeFamilyKey(group.family);
    for (let rawStyle of (Array.isArray(group.styles)
      ? group.styles
      : []) as Dynamic) {
      if (seenStyleNames.size >= DesignSystemTypographyParsingLimit) break;
      if (
        typeof rawStyle != "object" ||
        rawStyle === null ||
        Array.isArray(rawStyle)
      )
        continue;
      let style: Dynamic = rawStyle,
        styleName: Dynamic =
          typeof style.name == "string"
            ? style.name.trim().replace(/^\./, "")
            : "",
        fontSizeLength: Dynamic = parseTypographyLength(style.fontSize);
      if (
        !DesignSystemTypeDeclarationsAZaZAZaZPattern.test(styleName) ||
        seenStyleNames.has(styleName) ||
        fontSizeLength === undefined
      )
        continue;
      seenStyleNames.add(styleName);
      let fontSizePx: Dynamic = DesignSystemTypographyParsingHandler(
        typographyLengthToPixels(fontSizeLength),
      );
      if (fontSizePx <= 0) continue;
      let rawLineHeight: Dynamic =
          typeof style.lineHeight == "string"
            ? style.lineHeight.trim()
            : style.lineHeight,
        lineHeightNumber: Dynamic =
          typeof rawLineHeight == "number"
            ? rawLineHeight
            : typeof rawLineHeight == "string" && /^\d(?:\.\d{1,6})?$/.test(rawLineHeight)
              ? Number(rawLineHeight)
              : undefined,
        lineHeightRatio: Dynamic = 1.4;
      if (lineHeightNumber !== undefined && lineHeightNumber > 0 && lineHeightNumber < 10)
        lineHeightRatio = DesignSystemTypographyParsingHandler(lineHeightNumber);
      else if (typeof rawLineHeight != "string" || lineHeightNumber === undefined) {
        let lineHeightLength: Dynamic = parseTypographyLength(rawLineHeight);
        lineHeightLength !== undefined &&
          (lineHeightRatio =
            lineHeightLength.n >= 0
              ? DesignSystemTypographyParsingHandler(
                  typographyLengthToPixels(lineHeightLength) / fontSizePx,
                )
              : 1.3);
      }
      let rawFontWeight: Dynamic = style.fontWeight,
        fontWeightValue: Dynamic =
          typeof rawFontWeight == "number" &&
          Number.isInteger(rawFontWeight) &&
          rawFontWeight >= 1 &&
          rawFontWeight <= 1e3
            ? rawFontWeight
            : typeof rawFontWeight == "string"
              ? rawFontWeight.trim() === "bold"
                ? 700
                : /^(?:[1-9]\d{0,2}|1000)(?:\s+(?:[1-9]\d{0,2}|1000))?$/.test(
                      rawFontWeight.trim(),
                    )
                  ? Number(rawFontWeight.trim().split(/\s+/)[0])
                  : 400
              : 400,
        letterSpacingLength: Dynamic = parseTypographyLength(style.letterSpacing),
        letterSpacingPx: Dynamic =
          letterSpacingLength === undefined
            ? 0
            : DesignSystemTypographyParsingHandler(
                letterSpacingLength.unit === "em"
                  ? letterSpacingLength.n * fontSizePx
                  : letterSpacingLength.unit === "%"
                    ? (letterSpacingLength.n / 100) * fontSizePx
                    : letterSpacingLength.unit === "rem"
                      ? letterSpacingLength.n * 16
                      : letterSpacingLength.n,
              ),
        styleFamilyKey: Dynamic = normalizeFamilyKey(style.family) || groupFamilyKey;
      styles.push({
        name: styleName,
        group: groupName,
        fontSize: fontSizePx,
        lineHeight: lineHeightRatio,
        fontWeight: fontWeightValue,
        letterSpacing: letterSpacingPx,
        italic: style.fontStyle === "italic",
        ...(styleFamilyKey !== ""
          ? {
              family: parseTypographyFamily(fontFamiliesByKey.get(styleFamilyKey)),
            }
          : {}),
      });
    }
  }
  return styles;
}
function typographyStyleSubtitle(style?: Dynamic): Dynamic {
  let formatNumber: Dynamic = (numericValue?: Dynamic): Dynamic =>
    String(Math.round(numericValue * 10) / 10);
  return (
    (style.family !== undefined && style.family.name !== ""
      ? style.family.name + " \xB7 "
      : "") +
    formatNumber(style.fontSize) +
    "/" +
    String(Math.round(style.fontSize * style.lineHeight)) +
    " \xB7 " +
    (DesignSystemTypographyParsing300330400Config[style.fontWeight] ??
      String(style.fontWeight)) +
    (style.italic ? " \xB7 italic" : "")
  );
}
export {
  DesignSystemTypographyParsing300330400Config,
  DesignSystemTypographyParsingConstant,
  DesignSystemTypographyParsingHandler,
  DesignSystemTypographyParsingLimit,
  maxTypographyGroups as DesignSystemTypographyParsingLimit_2,
  maxFontFamilies as DesignSystemTypographyParsingLimit_3,
  DesignSystemTypographyParsingPattern,
  safeFontFamilyPattern as DesignSystemTypographyParsingPattern_2,
  isSafeFontFamily,
  parseTypographyFamily,
  parseTypographyLength,
  parseTypographyStyles,
  typographyLengthToPixels,
  typographyStyleSubtitle,
};
export function installDesignSystemTypographyParsing(): () => void {
  return () => {
    DesignSystemTypographyParsingLimit = 80;
    maxTypographyGroups = 12;
    maxFontFamilies = 12;
    DesignSystemTypographyParsingConstant = 120;
    DesignSystemTypographyParsingPattern =
      /^(-?\d{1,4}(?:\.\d{1,6})?)(px|rem|em|%)$/;
    safeFontFamilyPattern = /^[^;{}<>()\\\r\n\f]{1,200}$/;
    DesignSystemTypographyParsingHandler = (numericValue?: Dynamic): Dynamic =>
      Math.round(numericValue * 1e3) / 1e3;
    typographyLengthToPixels = (length?: Dynamic): Dynamic =>
      length.unit === "rem" || length.unit === "em" ? length.n * 16 : length.n;
    DesignSystemTypographyParsing300330400Config = {
      300: "Light",
      330: "Book",
      400: "Regular",
      430: "Text",
      500: "Medium",
      600: "Semibold",
      700: "Bold",
      800: "Heavy",
    };
  };
}
