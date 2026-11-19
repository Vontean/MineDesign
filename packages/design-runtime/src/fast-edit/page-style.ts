import type {
  PageStyles,
  PageStyleInput,
  PageDeclarations,
  PageStyleResult,
  MarkupRange,
  HelmetMarkup,
  PageStylesheet,
  MarkupMatch,
} from "../contracts/fast-edit";
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var MAX_PAGE_COLOR_CHARS: number;
var CSS_COLOR_KEYWORDS: Set<string>;
var CSS_HEX_COLOR_PATTERN: RegExp;
var CSS_COLOR_NUMBER_PATTERN: string;
var CSS_FUNCTIONAL_COLOR_PATTERN: RegExp;
var PAGE_STYLE_START_MARKER: string;
var PAGE_STYLE_END_MARKER: string;
var GENERIC_FONT_FAMILIES: Set<string>;
var FONT_FAMILY_PATTERN: RegExp;
var PAGE_FONT_LIST_PATTERN: RegExp;
var PAGE_BODY_STYLE_PATTERN: RegExp;
var findMarkupBlock: (
  html: string,
  opening: RegExp,
  closing: RegExp,
) => MarkupMatch | null;
var findHelmetBlock: (html: string) => MarkupMatch | null;
var findStyleBlock: (html: string) => MarkupMatch | null;
var findPageStylesheet: (html: string) => PageStylesheet | null;
var hasPageStylesheet: (html: string) => boolean;
var SECTION_ATTRIBUTE_PATTERN: RegExp;
var serializePageStyleAttributes: Dynamic;
function findPairedMarkupTags(
  html: string,
  openingPattern: RegExp,
  closingPattern: RegExp,
): MarkupRange | null {
  let opening = openingPattern.exec(html);
  if (opening === null) return null;
  closingPattern.lastIndex = opening.index + opening[0].length;
  let closing = closingPattern.exec(html);
  return closing === null
    ? null
    : {
        at: opening.index,
        innerAt: opening.index + opening[0].length,
        innerEnd: closing.index,
        end: closing.index + closing[0].length,
      };
}
function splitHelmetMarkup(html: string): HelmetMarkup | null {
  let helmetRange = findPairedMarkupTags(
    html,
    /<helmet\b[^>]*>/i,
    /<\/helmet\s*>/gi,
  );
  return helmetRange === null
    ? null
    : {
        a: html.slice(0, helmetRange.at),
        h: html.slice(helmetRange.at, helmetRange.end),
        b: html.slice(helmetRange.end),
      };
}
function stripHelmetMarkup(html: string): string {
  let helmet = splitHelmetMarkup(html);
  return helmet === null ? html : helmet.a + helmet.b;
}
function preserveHelmetMarkup(before: string, after: string): string {
  let helmet = splitHelmetMarkup(before);
  return helmet === null
    ? after
    : after === helmet.a + helmet.b
      ? before
      : helmet.a !== "" && after.startsWith(helmet.a)
        ? helmet.a + helmet.h + after.slice(helmet.a.length)
        : helmet.a + helmet.h + after;
}
function validatePageColor(colorValue: unknown): string | null {
  if (typeof colorValue != "string") return null;
  let color = colorValue.trim();
  return color === "" || color.length > MAX_PAGE_COLOR_CHARS
    ? null
    : CSS_HEX_COLOR_PATTERN.test(color)
      ? color
      : CSS_COLOR_KEYWORDS.has(color.toLowerCase())
        ? color.toLowerCase()
        : CSS_FUNCTIONAL_COLOR_PATTERN.test(color)
          ? color
          : null;
}
function validatePageFontFamilies(
  fontValue: unknown,
  knownFamilies: Iterable<string>,
): string | null {
  if (typeof fontValue != "string" || fontValue.length > 160) return null;
  let families = fontValue
    .split(",")
    .map((family) =>
      family
        .trim()
        .replace(
          /^"([^"]*)"$|^'([^']*)'$/,
          (match, doubleQuoted, singleQuoted) => doubleQuoted ?? singleQuoted ?? "",
        ),
    );
  if (families.length === 0 || families.length > 3) return null;
  let values = new Set(
      [...knownFamilies].map((family) => family.toLowerCase()),
    ),
    items: string[] = [];
  for (let familyName of families) {
    if (
      !FONT_FAMILY_PATTERN.test(familyName) ||
      familyName.trim() !== familyName ||
      /\s{2,}/.test(familyName)
    )
      return null;
    if (GENERIC_FONT_FAMILIES.has(familyName.toLowerCase()))
      items.push(familyName.toLowerCase());
    else if (values.has(familyName.toLowerCase())) items.push('"' + familyName + '"');
    else return null;
  }
  return items.join(",");
}
function serializePageStyleDeclarations(styles: PageDeclarations): string {
  let declarations = [
    styles.background !== undefined ? "background:" + styles.background : "",
    styles.color !== undefined ? "color:" + styles.color : "",
    styles.families !== undefined ? "font-family:" + styles.families : "",
  ].filter((declaration) => declaration !== "");
  return declarations.length === 0
    ? ""
    : PAGE_STYLE_START_MARKER +
        "body{" +
        declarations.join(";") +
        "}" +
        PAGE_STYLE_END_MARKER;
}
function updatePageStyleSheet(
  html: string,
  styles: PageStyleInput,
  families: Iterable<string>,
): PageStyleResult {
  let sheet = findPageStylesheet(html);
  if (sheet === null)
    return {
      ok: false,
      why: "no_sheet",
    };
  let { hm: helmetMatch, sm: styleMatch } = sheet,
    styleOffset =
      helmetMatch.index +
      helmetMatch[0].indexOf(helmetMatch[1]) +
      styleMatch.index +
      styleMatch[0].indexOf(">") +
      1,
    value = styleMatch[1];
  if (html.slice(styleOffset, styleOffset + value.length) !== value)
    return {
      ok: false,
      why: "no_sheet",
    };
  let startMarkerCount = value.split(PAGE_STYLE_START_MARKER).length - 1,
    endMarkerCount = value.split(PAGE_STYLE_END_MARKER).length - 1;
  if (
    startMarkerCount !== endMarkerCount ||
    startMarkerCount > 1 ||
    /ask:page/.test(
      value
        .split(PAGE_STYLE_START_MARKER)
        .join("")
        .split(PAGE_STYLE_END_MARKER)
        .join(""),
    )
  )
    return {
      ok: false,
      why: "sentinels",
    };
  let styleValue = value,
    text = "",
    state: PageDeclarations = {};
  if (startMarkerCount === 1) {
    let startMarkerIndex = value.indexOf(PAGE_STYLE_START_MARKER),
      endMarkerIndex = value.indexOf(PAGE_STYLE_END_MARKER);
    if (endMarkerIndex < startMarkerIndex)
      return {
        ok: false,
        why: "sentinels",
      };
    let bodyStyleMatch = PAGE_BODY_STYLE_PATTERN.exec(
      value.slice(startMarkerIndex + PAGE_STYLE_START_MARKER.length, endMarkerIndex),
    );
    if (bodyStyleMatch === null)
      return {
        ok: false,
        why: "sentinels",
      };
    for (let declaration of bodyStyleMatch[1]!.split(";")) {
      let colonIndex = declaration.indexOf(":"),
        property = declaration.slice(0, colonIndex),
        propertyValue = declaration.slice(colonIndex + 1);
      property === "background"
        ? (state.background = propertyValue)
        : property === "color"
          ? (state.color = propertyValue)
          : (state.families = propertyValue);
    }
    styleValue = value.slice(0, startMarkerIndex);
    text = value.slice(endMarkerIndex + PAGE_STYLE_END_MARKER.length);
  }
  let validatedStyles: PageDeclarations = {
    ...state,
  };
  if (styles.background !== undefined)
    if (styles.background === "") delete validatedStyles.background;
    else {
      let background = validatePageColor(styles.background);
      if (background === null)
        return {
          ok: false,
          why: "value",
        };
      validatedStyles.background = background;
    }
  if (styles.color !== undefined)
    if (styles.color === "") delete validatedStyles.color;
    else {
      let color = validatePageColor(styles.color);
      if (color === null)
        return {
          ok: false,
          why: "value",
        };
      validatedStyles.color = color;
    }
  if (styles.font !== undefined)
    if (styles.font === "") delete validatedStyles.families;
    else {
      let fontFamilies = validatePageFontFamilies(styles.font, families);
      if (fontFamilies === null)
        return {
          ok: false,
          why: "value",
        };
      validatedStyles.families = fontFamilies;
    }
  if (
    (validatedStyles.background !== undefined &&
      validatePageColor(validatedStyles.background) === null) ||
    (validatedStyles.color !== undefined &&
      validatePageColor(validatedStyles.color) === null) ||
    (validatedStyles.families !== undefined &&
      !PAGE_FONT_LIST_PATTERN.test(validatedStyles.families))
  )
    return {
      ok: false,
      why: "sentinels",
    };
  let serializedStyles = serializePageStyleDeclarations(validatedStyles),
    updatedMarkup = startMarkerCount === 1 ? styleValue + text + serializedStyles : value + serializedStyles,
    originalMarkup =
      html.slice(0, styleOffset) +
      updatedMarkup +
      html.slice(styleOffset + value.length),
    callback: (css: string) => string = (markup) => {
      let startMarkerIndex = markup.indexOf(PAGE_STYLE_START_MARKER),
        endMarkerIndex = markup.indexOf(PAGE_STYLE_END_MARKER);
      return startMarkerIndex < 0
        ? markup
        : markup.slice(0, startMarkerIndex) +
            markup.slice(endMarkerIndex + PAGE_STYLE_END_MARKER.length);
    };
  return html.slice(0, styleOffset) !== originalMarkup.slice(0, styleOffset) ||
    html.slice(styleOffset + value.length) !==
      originalMarkup.slice(styleOffset + updatedMarkup.length) ||
    callback(updatedMarkup) !== callback(value)
    ? {
        ok: false,
        why: "outside",
      }
    : updatedMarkup.split(PAGE_STYLE_START_MARKER).length - 1 !==
          (serializedStyles === "" ? 0 : 1) ||
        updatedMarkup.split(PAGE_STYLE_END_MARKER).length - 1 !==
          (serializedStyles === "" ? 0 : 1)
      ? {
          ok: false,
          why: "outside",
        }
      : {
          ok: true,
          template: originalMarkup,
        };
}
function readPageStylesFromSheet(
  html: string,
  families: Iterable<string>,
): PageStyles {
  let helmetMatch = findHelmetBlock(html),
    styleMatch = helmetMatch === null ? null : findStyleBlock(helmetMatch[1]);
  if (styleMatch === null) return {};
  let styles: PageStyles = {};
  for (let value of styleMatch[1]
    .slice(0, styleMatch[1].lastIndexOf("}") + 1)
    .matchAll(/body\s*\{([^}]*)\}/gi))
    for (let declaration of value[1]!.split(";")) {
      let colonIndex = declaration.indexOf(":");
      if (colonIndex <= 0) continue;
      let property = declaration.slice(0, colonIndex).trim().toLowerCase(),
        propertyValue = declaration.slice(colonIndex + 1).trim();
      if (property === "background" || property === "background-color") {
        let background = validatePageColor(propertyValue);
        background !== null
          ? (styles.background = background)
          : delete styles.background;
      } else if (property === "color") {
        let color = validatePageColor(propertyValue);
        color !== null ? (styles.color = color) : delete styles.color;
      } else if (property === "font-family") {
        let fontFamilies = validatePageFontFamilies(propertyValue, families);
        fontFamilies !== null
          ? (styles.font = fontFamilies.replace(/"/g, ""))
          : delete styles.font;
      }
    }
  return styles;
}
function readPageStylesFromSection(html: string): PageStyles {
  let styles: PageStyles = {},
    sectionMatch = /^<section\b/i.exec(html);
  if (sectionMatch === null) return styles;
  SECTION_ATTRIBUTE_PATTERN.lastIndex = sectionMatch[0].length;
  for (
    let value = SECTION_ATTRIBUTE_PATTERN.exec(html);
    value !== null;
    value = SECTION_ATTRIBUTE_PATTERN.exec(html)
  )
    if (value[1]!.toLowerCase() === "style") {
      for (let declaration of (value[2] ?? value[3] ?? value[4] ?? "")
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&apos;/g, "'")
        .replace(/&amp;/g, "&")
        .split(";")) {
        let colonIndex = declaration.indexOf(":"),
          property =
            colonIndex <= 0 ? "" : declaration.slice(0, colonIndex).trim().toLowerCase(),
          propertyValue = declaration.slice(colonIndex + 1).trim();
        property === "background" || property === "background-color"
          ? (styles.background = propertyValue)
          : property === "color"
            ? (styles.color = propertyValue)
            : property === "font-family" && (styles.font = propertyValue);
      }
      break;
    }
  return styles;
}
function validatePageStyles(
  styles: PageStyleInput,
  families: Iterable<string>,
): PageStyles {
  let background = validatePageColor(styles.background),
    color = validatePageColor(styles.color),
    font = validatePageFontFamilies(styles.font, families);
  return {
    ...(background !== null
      ? {
          background: background,
        }
      : {}),
    ...(color !== null
      ? {
          color: color,
        }
      : {}),
    ...(font !== null
      ? {
          font: font.replace(/"/g, ""),
        }
      : {}),
  };
}
export {
  CSS_COLOR_KEYWORDS,
  CSS_COLOR_NUMBER_PATTERN,
  CSS_FUNCTIONAL_COLOR_PATTERN,
  CSS_HEX_COLOR_PATTERN,
  findHelmetBlock,
  findMarkupBlock,
  findPageStylesheet,
  findPairedMarkupTags,
  findStyleBlock,
  FONT_FAMILY_PATTERN,
  GENERIC_FONT_FAMILIES,
  hasPageStylesheet,
  MAX_PAGE_COLOR_CHARS,
  PAGE_BODY_STYLE_PATTERN,
  PAGE_FONT_LIST_PATTERN,
  PAGE_STYLE_END_MARKER,
  PAGE_STYLE_START_MARKER,
  preserveHelmetMarkup,
  readPageStylesFromSection,
  readPageStylesFromSheet,
  SECTION_ATTRIBUTE_PATTERN,
  serializePageStyleAttributes,
  serializePageStyleDeclarations,
  splitHelmetMarkup,
  stripHelmetMarkup,
  updatePageStyleSheet,
  validatePageColor,
  validatePageFontFamilies,
  validatePageStyles,
};
export function installFastEditPageStyle(): () => void {
  return () => {
    MAX_PAGE_COLOR_CHARS = 64;
    CSS_COLOR_KEYWORDS = new Set(
      "transparent black silver gray grey white maroon red purple fuchsia green lime olive yellow navy blue teal aqua orange aliceblue antiquewhite aquamarine azure beige bisque blanchedalmond blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen gainsboro ghostwhite gold goldenrod greenyellow honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow limegreen linen magenta mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite oldlace olivedrab orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna skyblue slateblue slategray slategrey snow springgreen steelblue tan thistle tomato turquoise violet wheat whitesmoke yellowgreen rebeccapurple".split(
        " ",
      ),
    );
    CSS_HEX_COLOR_PATTERN =
      /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
    CSS_COLOR_NUMBER_PATTERN = "-?(?:\\d{1,4}(?:\\.\\d{1,4})?|\\.\\d{1,4})%?";
    CSS_FUNCTIONAL_COLOR_PATTERN = new RegExp(
      "^(?:rgb|rgba|hsl|hsla)\\(\\s*" +
        CSS_COLOR_NUMBER_PATTERN +
        "(?:deg)?(?:\\s*,\\s*|\\s+)" +
        CSS_COLOR_NUMBER_PATTERN +
        "(?:\\s*,\\s*|\\s+)" +
        CSS_COLOR_NUMBER_PATTERN +
        "(?:\\s*,\\s*" +
        CSS_COLOR_NUMBER_PATTERN +
        ")?\\s*\\)$",
      "i",
    );
    PAGE_STYLE_START_MARKER = "/*ask:page*/";
    PAGE_STYLE_END_MARKER = "/*ask:page-end*/";
    GENERIC_FONT_FAMILIES = new Set([
      "serif",
      "sans-serif",
      "monospace",
      "cursive",
      "fantasy",
    ]);
    FONT_FAMILY_PATTERN = /^[A-Za-z0-9 \-]{1,40}$/;
    PAGE_FONT_LIST_PATTERN =
      /^(?:"[A-Za-z0-9 \-]{1,40}"|[a-z-]{1,12})(?:,(?:"[A-Za-z0-9 \-]{1,40}"|[a-z-]{1,12})){0,2}$/;
    PAGE_BODY_STYLE_PATTERN =
      /^body\{((?:background:[^;{}]+|color:[^;{}]+|font-family:[^;{}]+)(?:;(?:background:[^;{}]+|color:[^;{}]+|font-family:[^;{}]+))*)\}$/;
    findMarkupBlock = (
      html: string,
      opening: RegExp,
      closing: RegExp,
    ): MarkupMatch | null => {
      let value = findPairedMarkupTags(html, opening, closing);
      return value === null
        ? null
        : {
            index: value.at,
            0: html.slice(value.at, value.end),
            1: html.slice(value.innerAt, value.innerEnd),
          };
    };
    findHelmetBlock = (html: string): MarkupMatch | null =>
      findMarkupBlock(html, /<helmet\b[^>]*>/i, /<\/helmet>/gi);
    findStyleBlock = (html: string): MarkupMatch | null =>
      findMarkupBlock(html, /<style\b[^>]*>/i, /<\/style>/gi);
    findPageStylesheet = (html: string): PageStylesheet | null => {
      let value = findHelmetBlock(html),
        styleMatch = value === null ? null : findStyleBlock(value[1]);
      return value === null || styleMatch === null
        ? null
        : {
            hm: value,
            sm: styleMatch,
          };
    };
    hasPageStylesheet = (html: string): boolean =>
      findPageStylesheet(html) !== null;
    SECTION_ATTRIBUTE_PATTERN =
      /\s+([^\s=>"'\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>"']+)))?/y;
    serializePageStyleAttributes = (styles?: Dynamic): Dynamic =>
      ' data-page-background="' +
      (styles.background ?? "") +
      '" data-page-color="' +
      (styles.color ?? "") +
      '" data-page-font="' +
      (styles.font ?? "") +
      '"';
  };
}
