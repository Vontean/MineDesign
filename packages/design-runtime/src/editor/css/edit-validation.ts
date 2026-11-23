/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { UndoElementsTest } from "../undo/elements";

var CssEditValidationPattern: Dynamic;
var nonNegativePxPattern: Dynamic;
var CssEditValidationRegistry: Dynamic;
var CssEditValidationCenterCoverPattern: Dynamic;
var CssEditValidationHttpsPattern: Dynamic;
var CssEditValidationAZaZAZaZPattern: Dynamic;
var CssEditValidationColorBackgroundColorFillConfig: Dynamic;
var CssEditValidationSubscribers: Dynamic;
var CssEditValidationBackgroundBackgroundColorSet: Dynamic;
var unsafeBackgroundPattern: Dynamic;
var CssEditValidationDataImagePattern: Dynamic;
var CssEditValidationAttrExpressionPattern: Dynamic;
var CssEditValidationFontSizeFontFamilyFontWeightValues: Dynamic;
function isSafeBackgroundImage(property?: Dynamic, value?: Dynamic): Dynamic {
  if (property !== "background" && property !== "background-image") return false;
  let urlMatch: Dynamic = CssEditValidationCenterCoverPattern.exec(value);
  return urlMatch === null ||
    (property === "background-image" && urlMatch[2] !== undefined)
    ? false
    : UndoElementsTest(urlMatch[1]) ||
        CssEditValidationAZaZAZaZPattern.test(urlMatch[1]) ||
        CssEditValidationHttpsPattern.test(urlMatch[1]);
}
function hasBalancedStyleFunction(text?: Dynamic): Dynamic {
  let openIndex: Dynamic = text.indexOf("("),
    depth: Dynamic = 0;
  for (let position: Dynamic = openIndex; position < text.length; position++)
    if (text[position] === "(") depth++;
    else if (text[position] === ")" && --depth === 0)
      return position === text.length - 1;
  return false;
}
function routeStyleEditsByElementKind(
  edits?: Dynamic,
  elements?: Dynamic,
  matchKindStrictly?: Dynamic,
): Dynamic {
  let entries: Dynamic = new Map();
  for (let { tid: tid, kind: kind } of elements as Dynamic) {
    let allowedEdits: Dynamic = edits.filter(([prop]: Dynamic): Dynamic => {
      let allowedKinds: Dynamic =
        CssEditValidationColorBackgroundColorFillConfig[prop];
      return matchKindStrictly
        ? allowedKinds === undefined || allowedKinds.has(kind)
        : !(
            kind === "line" &&
            (prop === "fill" || prop === "background-color")
          );
    });
    allowedEdits.length > 0 && entries.set(tid, allowedEdits);
  }
  return entries;
}
function isBalancedBackgroundValue(value?: Dynamic): Dynamic {
  let closers: Dynamic = [],
    quoteChar: Dynamic = null;
  for (let char of value as Dynamic)
    if (quoteChar) char === quoteChar && (quoteChar = null);
    else if (char === '"' || char === "'") quoteChar = char;
    else {
      if (char === ";" || char === "{" || char === "}") return false;
      if (char === "(" || char === "[")
        closers.push(char === "(" ? ")" : "]");
      else if ((char === ")" || char === "]") && closers.pop() !== char)
        return false;
    }
  return closers.length === 0 && quoteChar === null;
}
function isSafeBackgroundStyle(property?: Dynamic, value?: Dynamic): Dynamic {
  let trimmed: Dynamic = value.trim(),
    maxLength: Dynamic = CssEditValidationDataImagePattern.test(trimmed)
      ? 15e5
      : 2048;
  return !CssEditValidationBackgroundBackgroundColorSet.has(property) ||
    trimmed.length === 0 ||
    trimmed.length > maxLength ||
    unsafeBackgroundPattern.test(trimmed) ||
    !isBalancedBackgroundValue(trimmed) ||
    (typeof CSS !== "undefined" &&
      typeof CSS.supports == "function" &&
      !CSS.supports(property, trimmed))
    ? null
    : trimmed;
}
function normalizeStyleEdits(edits?: Dynamic): Dynamic {
  let normalized: Dynamic = [];
  for (let [prop, rawValue] of edits as Dynamic) {
    if (!CssEditValidationSubscribers.has(prop)) continue;
    if (rawValue === null) {
      normalized.push([prop, null]);
      continue;
    }
    if (typeof rawValue != "string") continue;
    let trimmed: Dynamic = rawValue.trim();
    if (isSafeBackgroundImage(prop, trimmed)) {
      normalized.push([prop, trimmed]);
      continue;
    }
    if (
      trimmed.length === 0 ||
      trimmed.length > 512 ||
      CssEditValidationAttrExpressionPattern.test(trimmed) ||
      !isBalancedBackgroundValue(trimmed)
    )
      continue;
    let validator: Dynamic = CssEditValidationRegistry[prop];
    (validator && !validator.test(trimmed)) ||
      ((prop === "background" || prop === "background-image") &&
        trimmed.toLowerCase() !== "none" &&
        !hasBalancedStyleFunction(trimmed)) ||
      (typeof CSS !== "undefined" &&
        typeof CSS.supports == "function" &&
        !CSS.supports(prop, trimmed)) ||
      normalized.push([prop, trimmed]);
  }
  return normalized;
}
function normalizeTextStyleSnapshot(snapshot?: Dynamic): Dynamic {
  if (snapshot === null || typeof snapshot != "object") return [];
  let styles: Dynamic = snapshot,
    edits: Dynamic = [];
  for (let prop of CssEditValidationFontSizeFontFamilyFontWeightValues as Dynamic) {
    let propValue: Dynamic = styles[prop];
    if (typeof propValue == "string") {
      if (prop === "line-height" && propValue.trim() !== "normal") {
        let lineHeightRatio: Dynamic =
          parseFloat(propValue) / parseFloat(String(styles["font-size"]));
        /px$/.test(propValue.trim()) &&
          lineHeightRatio > 0 &&
          lineHeightRatio < 100 &&
          edits.push([prop, String(Math.round(lineHeightRatio * 1e3) / 1e3)]);
        continue;
      }
      edits.push([prop, propValue]);
    }
  }
  return normalizeStyleEdits(edits);
}
function frozenInheritedStyleEdits(
  edits?: Dynamic,
  elementStyles?: Dynamic,
  referenceStyles?: Dynamic,
  readInheritedValue?: Dynamic,
): Dynamic {
  let safeReferenceStyles: Dynamic =
      referenceStyles !== null && typeof referenceStyles == "object" ? referenceStyles : {},
    items: Dynamic = [];
  for (let [prop, editValue] of edits as Dynamic) {
    let currentValue: Dynamic = elementStyles[prop],
      referenceValue: Dynamic = safeReferenceStyles[prop];
    typeof currentValue != "string" ||
      typeof referenceValue != "string" ||
      (equivalentCssValues(currentValue, referenceValue) &&
        equivalentCssValues(readInheritedValue(prop), editValue) &&
        items.push(prop));
  }
  return items;
}
function equivalentCssValues(first?: Dynamic, second?: Dynamic): Dynamic {
  let normalize: Dynamic = (cssValue?: Dynamic): Dynamic =>
    cssValue.toLowerCase().replace(/['"]/g, "").replace(/\s+/g, " ").trim();
  return normalize(first) === normalize(second);
}
export {
  CssEditValidationAttrExpressionPattern,
  CssEditValidationAZaZAZaZPattern,
  CssEditValidationBackgroundBackgroundColorSet,
  CssEditValidationCenterCoverPattern,
  CssEditValidationColorBackgroundColorFillConfig,
  CssEditValidationDataImagePattern,
  CssEditValidationFontSizeFontFamilyFontWeightValues,
  CssEditValidationHttpsPattern,
  CssEditValidationPattern,
  nonNegativePxPattern,
  unsafeBackgroundPattern,
  CssEditValidationRegistry,
  CssEditValidationSubscribers,
  equivalentCssValues,
  frozenInheritedStyleEdits,
  hasBalancedStyleFunction,
  isBalancedBackgroundValue,
  isSafeBackgroundImage,
  isSafeBackgroundStyle,
  normalizeStyleEdits,
  normalizeTextStyleSnapshot,
  routeStyleEditsByElementKind,
};
export function installEditorCssEditValidation(): () => void {
  return () => {
    CssEditValidationPattern = /^-?\d{1,4}(\.\d{1,6})?px$/;
    nonNegativePxPattern = /^\d{1,4}(\.\d{1,6})?px$/;
    CssEditValidationRegistry = {
      color: null,
      "background-color": null,
      fill: null,
      stroke: null,
      "border-color": null,
      "font-family": null,
      "font-size": nonNegativePxPattern,
      "font-weight": /^([1-9]\d{0,2}|1000|normal|bold)$/,
      "font-style": /^(normal|italic)$/,
      "text-decoration-line":
        /^(none|(underline|line-through|overline)( (underline|line-through|overline)){0,2})$/,
      "text-align": /^(start|center|end|justify|left|right)$/,
      "line-height": /^(normal|\d{1,2}(\.\d{1,3})?)$/,
      "letter-spacing": /^(normal|-?\d{1,3}(\.\d{1,6})?px)$/,
      "text-transform": /^(none|uppercase|lowercase|capitalize)$/,
      "white-space": /^(normal|nowrap|pre|pre-wrap|pre-line|break-spaces)$/,
      "list-style-type":
        /^(none|disc|circle|square|decimal|decimal-leading-zero|lower-alpha|upper-alpha|lower-latin|upper-latin|lower-roman|upper-roman|lower-greek)$/,
      "border-style": /^(none|solid|dashed|dotted)$/,
      "border-width": nonNegativePxPattern,
      "border-top-width": nonNegativePxPattern,
      "border-right-width": nonNegativePxPattern,
      "border-bottom-width": nonNegativePxPattern,
      "border-left-width": nonNegativePxPattern,
      "border-radius": /^\d{1,4}(\.\d{1,6})?(px|%)$/,
      "border-top-left-radius": nonNegativePxPattern,
      "border-top-right-radius": nonNegativePxPattern,
      "border-bottom-right-radius": nonNegativePxPattern,
      "border-bottom-left-radius": nonNegativePxPattern,
      "padding-top": nonNegativePxPattern,
      "padding-right": nonNegativePxPattern,
      "padding-bottom": nonNegativePxPattern,
      "padding-left": nonNegativePxPattern,
      "margin-top": CssEditValidationPattern,
      "margin-right": CssEditValidationPattern,
      "margin-bottom": CssEditValidationPattern,
      "margin-left": CssEditValidationPattern,
      "stroke-width": nonNegativePxPattern,
      "stroke-dasharray": /^(none|\d{1,3}( \d{1,3}){0,3})$/,
      "object-fit": /^(fill|contain|cover|none|scale-down)$/,
      "object-position": /^\d{1,3}(\.\d{1,4})?% \d{1,3}(\.\d{1,4})?%$/,
      "object-view-box":
        /^inset\(\d{1,2}(\.\d{1,4})?%( \d{1,2}(\.\d{1,4})?%){3}\)$/,
      background:
        /^(none|(repeating-)?(linear|radial)-gradient\([^;{}<>"'\\]{1,480}\))$/i,
      "background-image":
        /^(repeating-)?(linear|radial)-gradient\([^;{}<>"'\\]{1,480}\)$/i,
      "background-size":
        /^(cover|contain|auto|\d{1,4}(\.\d{1,3})?(px|%)( \d{1,4}(\.\d{1,3})?(px|%))?)$/,
      "background-position": /^center$/,
      "background-repeat": /^no-repeat$/,
      "background-clip": /^text$/,
      "-webkit-background-clip": /^text$/,
      "-webkit-text-fill-color": /^(transparent|currentcolor)$/i,
    };
    CssEditValidationCenterCoverPattern =
      /^url\("([^"\\\r\n]+)"\)( center \/ (cover|contain|auto|\d{1,4}(?:\.\d{1,3})?(?:px|%)(?: \d{1,4}(?:\.\d{1,3})?(?:px|%))?) no-repeat)?$/;
    CssEditValidationHttpsPattern =
      /^https?:\/\/[^\s"'()\\<>;{}\x00-\x1f\x7f]{1,290}$/i;
    CssEditValidationAZaZAZaZPattern =
      /^\.\/(?:[A-Za-z0-9_-][A-Za-z0-9_.%@+~-]{0,99}\/){0,8}[A-Za-z0-9_-][A-Za-z0-9_.%@+~-]{0,199}$/;
    CssEditValidationColorBackgroundColorFillConfig = {
      color: new Set(["text"]),
      "background-color": new Set(["box"]),
      fill: new Set(["shape"]),
      stroke: new Set(["line"]),
      "border-color": new Set(["line"]),
    };
    CssEditValidationSubscribers = new Set(
      Object.keys(CssEditValidationRegistry),
    );
    CssEditValidationBackgroundBackgroundColorSet = new Set([
      "background",
      "background-color",
    ]);
    unsafeBackgroundPattern = /[<>\\]|\/\*|\*\/|[\r\n\f]|url\(\s*[^"'\s)]/i;
    CssEditValidationDataImagePattern =
      /^url\("data:image\/[\w.+-]+;base64,[A-Za-z0-9+/=\s]*"\)[^"']{0,200}$/;
    CssEditValidationAttrExpressionPattern =
      /[;{}\\@<>]|\/\*|url\s*\(|src\s*\(|attr\s*\(|expression\s*\(|image(-set)?\s*\(|element\s*\(|cross-fade\s*\(|paint\s*\(|[\r\n]/i;
    CssEditValidationFontSizeFontFamilyFontWeightValues = [
      "font-size",
      "font-family",
      "font-weight",
      "font-style",
      "line-height",
      "letter-spacing",
      "color",
      "text-align",
      "text-transform",
      "white-space",
      "list-style-type",
    ];
  };
}
