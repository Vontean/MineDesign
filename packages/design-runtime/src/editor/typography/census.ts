import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { parseStyleDeclarations } from "../css/declarations";
import { svgShapeTags } from "../inspector/style-metadata";
import { findSvgShaft } from "../svg/arrow-properties";

var TypographyCensusBorderBorderWidthBorderStyleValues: Dynamic;
var TypographyCensusSubscribers: Dynamic;
var TypographyCensusPattern: Dynamic;
var TypographyCensusItems: Dynamic;
var TypographyCensusH1H2H3Config: Dynamic;
var TEXT_ROLE_DISPLAY_ORDER: Dynamic;
var TypographyCensusHeadingPattern: Dynamic;
var CSS_VARIABLE_REFERENCE_PATTERN: Dynamic;
var HEX_COLOR_PATTERN: Dynamic;
var TypographyCensusRgbaPattern: Dynamic;
function hasAuthoredAppearance(styleText?: Dynamic): Dynamic {
  return parseStyleDeclarations(styleText).some(
    (declaration?: Dynamic): Dynamic =>
      TypographyCensusSubscribers.has(declaration.prop),
  );
}
function inspectSvgLine(svgElement?: Dynamic): Dynamic {
  if (!svgElement || svgElement.tagName.toLowerCase() !== "svg") return null;
  let value: Dynamic = null;
  for (let child of Array.from(svgElement.children) as Dynamic)
    if (child.tagName.toLowerCase() === "path") {
      if (value) return null;
      value = child;
    }
  if (!value) return null;
  let pathMatch: Dynamic = TypographyCensusPattern.exec(
    value.getAttribute("d") ?? "",
  );
  if (!pathMatch) return null;
  let startX: Dynamic = +pathMatch[1],
    startY: Dynamic = +pathMatch[2],
    endX: Dynamic = +pathMatch[3],
    endY: Dynamic = +pathMatch[4];
  if (![startX, startY, endX, endY].every(Number.isFinite)) return null;
  let isHorizontal: Dynamic = Math.abs(startY - endY) < 0.01,
    isVertical: Dynamic = Math.abs(startX - endX) < 0.01;
  return isHorizontal && !isVertical ? "height" : isVertical && !isHorizontal ? "width" : null;
}
function selectedSvgElements(model?: Dynamic, elementIds?: Dynamic): Dynamic {
  let values: Dynamic = new Set(elementIds),
    callback: Dynamic = (element?: Dynamic): Dynamic => {
      let value: Dynamic = parseInt(
        element.getAttribute("data-dc-tpl") ?? "-1",
        10,
      );
      return value >= 0 && values.has(value);
    };
  return [
    ...new Set(
      elementIds.map((elementId?: Dynamic): Dynamic => {
        let value: Dynamic = model.element(elementId);
        if (!value || !svgShapeTags.has(value.tagName.toLowerCase()))
          return elementId;
        let ancestor: Dynamic = value.closest("svg");
        if (!ancestor || !findSvgShaft(ancestor, callback))
          return elementId;
        let index: Dynamic = parseInt(
          ancestor.getAttribute("data-dc-tpl") ?? "-1",
          10,
        );
        return index >= 0 ? index : elementId;
      }),
    ),
  ];
}
function collectFontFamilies(html?: Dynamic): Dynamic {
  let values: Dynamic = new Set(),
    callback: Dynamic = (familyText?: Dynamic): Dynamic => {
      let value: Dynamic = familyText.split(",")[0].trim().replace(/['"]/g, "");
      value && !value.includes("{{") && values.add(value);
    };
  for (let value of html.matchAll(
    /<style\b[^>]*>([\s\S]*?)<\/style>/gi,
  ) as Dynamic)
    for (let familyMatch of value[1].matchAll(
      /font-family\s*:\s*([^;}]+)/gi,
    ) as Dynamic)
      callback(familyMatch[1]);
  for (let value of html.matchAll(/\bstyle="([^"]*)"/gi) as Dynamic)
    for (let familyMatch of value[1]
      .replace(/&quot;/g, "'")
      .matchAll(/font-family\s*:\s*([^;]+)/gi) as Dynamic)
      callback(familyMatch[1]);
  return [...values];
}
function collectGoogleFontFamilies(html?: Dynamic): Dynamic {
  let values: Dynamic = new Set();
  for (let value of html.matchAll(
    /fonts\.googleapis\.com\/css2\?([^"')\s<>]*)/g,
  ) as Dynamic)
    for (let familyMatch of value[1]
      .replace(/&amp;/g, "&")
      .replace(/%20|%2B/gi, "+")
      .matchAll(/(?:^|&)family=([^&:%]+)/g) as Dynamic)
      values.add(familyMatch[1].replace(/\+/g, " ").slice(0, 60));
  return [...values].slice(0, 40);
}
function collectFontSizes(html?: Dynamic): Dynamic {
  let values: Dynamic = new Set(),
    value: Dynamic = /font-size\s*:\s*([^;">}]+)/gi,
    fontSizeMatch: Dynamic;
  for (; (fontSizeMatch = value.exec(html)); ) {
    let fontSize: Dynamic = fontSizeMatch[1].trim();
    /^\d+(?:\.\d+)?(?:px|pt|em|rem|%)$/.test(fontSize) && values.add(fontSize);
  }
  return [...values];
}
function collectFontSizeFamilyUsage(html?: Dynamic): Dynamic {
  let entries: Dynamic = new Map(),
    callback: Dynamic = (fontSize?: Dynamic, family?: Dynamic): Dynamic => {
      if (!family || !/^\d+(?:\.\d+)?(?:px|pt)$/.test(fontSize)) return;
      let familyCounts: Dynamic = entries.get(fontSize) ?? new Map();
      familyCounts.set(family, (familyCounts.get(family) ?? 0) + 1);
      entries.set(fontSize, familyCounts);
    },
    classEntries: Dynamic = new Map(),
    value: Dynamic,
    tagPattern: Dynamic = /<([a-z][a-z0-9-]*)\b([^<>]*)>/gi;
  for (; (value = tagPattern.exec(html)); ) {
    let tagName: Dynamic = value[1].toLowerCase(),
      attributes: Dynamic = value[2],
      classNames: Dynamic = /\bclass="([^"]*)"/.exec(attributes)?.[1] ?? "";
    for (let className of classNames.split(/\s+/).filter(Boolean) as Dynamic) {
      let usageCounts: Dynamic = classEntries.get(className) ?? new Map();
      usageCounts.set(tagName, (usageCounts.get(tagName) ?? 0) + 1);
      classEntries.set(className, usageCounts);
    }
    let inlineFontSize: Dynamic = /font-size\s*:\s*([^;"]+)/i
      .exec(/\bstyle="([^"]*)"/.exec(attributes)?.[1] ?? "")?.[1]
      ?.trim();
    inlineFontSize &&
      callback(
        inlineFontSize,
        inferTypographyRole(tagName, classNames, /\brole="button"/.test(attributes)),
      );
  }
  let styleBlocks: Dynamic = [
      ...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi),
    ].map((declaration?: Dynamic): Dynamic => declaration[1]).join(`
`),
    rulePattern: Dynamic = /([^{}]+)\{([^{}]*)\}/g;
  for (; (value = rulePattern.exec(styleBlocks)); ) {
    let fontSizeRule: Dynamic = /(?:^|[\s;])font-size\s*:\s*([^;]+)/i
      .exec(value[2])?.[1]
      ?.trim();
    if (fontSizeRule)
      for (let selector of value[1].split(",") as Dynamic) {
        let selectorText: Dynamic =
            selector
              .trim()
              .split(/[\s>+~]+/)
              .pop() ?? "",
          classNames: Dynamic = [...selectorText.matchAll(/\.([\w-]+)/g)].map(
            (match?: Dynamic): Dynamic => match[1],
          ),
          elementName: Dynamic =
            /^[a-z][a-z0-9-]*/i.exec(selectorText)?.[0]?.toLowerCase() ?? "";
        !elementName &&
          classNames.length > 0 &&
          (elementName =
            [...(classEntries.get(classNames[0]) ?? new Map())].sort(
              (left?: Dynamic, right?: Dynamic): Dynamic =>
                right[1] - left[1],
            )[0]?.[0] ?? "");
        /^(b|strong)$/.test(elementName) &&
          classNames.length === 0 &&
          (classNames = [...selector.matchAll(/\.([\w-]+)/g)].map(
            (match?: Dynamic): Dynamic => match[1],
          ));
        callback(
          fontSizeRule,
          inferTypographyRole(elementName, classNames.join(" "), false),
        );
      }
  }
  return entries;
}
function collectTypographyRoles(html?: Dynamic): Dynamic {
  let state: Dynamic = {
      serif: "serif",
      "ui-serif": "serif",
      "sans-serif": "sans-serif",
      "ui-sans-serif": "sans-serif",
      "system-ui": "sans-serif",
      "-apple-system": "sans-serif",
      blinkmacsystemfont: "sans-serif",
      "ui-rounded": "sans-serif",
      monospace: "monospace",
      "ui-monospace": "monospace",
    },
    callback: Dynamic = (styleText?: Dynamic): Dynamic => {
      let normalizedStyle: Dynamic = (styleText ?? "")
        .split(",")
        .map(
          (fontName?: Dynamic): Dynamic =>
            fontName.trim().replace(/^["']|["']$/g, ""),
        )
        .filter(Boolean);
      return (
        normalizedStyle.find(
          (fontName?: Dynamic): Dynamic =>
            !(fontName.toLowerCase() in state) &&
            !/^(cursive|fantasy|emoji|math|fangsong|inherit|initial|unset)$/i.test(
              fontName,
            ),
        ) ??
        normalizedStyle
          .map((fontName?: Dynamic): Dynamic => state[fontName.toLowerCase()])
          .find((role?: Dynamic): Dynamic => role !== undefined) ??
        null
      );
    },
    extractFontSize: Dynamic = (
      styleText?: Dynamic,
      isInline: Dynamic = false,
    ): Dynamic =>
      callback(
        (isInline
          ? /(?:^|[\s;])font-family\s*:\s*([^;}]+)/i
          : /(?:^|[\s;"])font-family\s*:\s*([^;"]+)/i
        )
          .exec(styleText)?.[1]
          ?.trim(),
      ),
    extractFontSizeRule: Dynamic = (styleText?: Dynamic): Dynamic =>
      /(?:^|[\s;"])font-size\s*:\s*([^;"]+)/i.exec(styleText)?.[1]?.trim(),
    entries: Dynamic = new Map(),
    recordUsage: Dynamic = (fontSize?: Dynamic, familyName?: Dynamic): Dynamic => {
      if (!fontSize || !familyName || !/^\d+(?:\.\d+)?(?:px|pt)$/.test(fontSize))
        return;
      let familyUsage: Dynamic = entries.get(fontSize) ?? new Map();
      familyUsage.set(familyName, (familyUsage.get(familyName) ?? 0) + 1);
      entries.set(fontSize, familyUsage);
    },
    value: Dynamic = null,
    rule: Dynamic,
    styleBlocks: Dynamic = [
      ...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi),
    ].map((declaration?: Dynamic): Dynamic => declaration[1]).join(`
`),
    rulePattern: Dynamic = /([^{}]+)\{([^{}]*)\}/g;
  for (; (rule = rulePattern.exec(styleBlocks)); ) {
    /(^|,)\s*(body|html|:root)\s*(,|$)/i.test(rule[1].trim()) &&
      (value = extractFontSize(rule[2], true) ?? value);
    recordUsage(extractFontSizeRule(rule[2]), extractFontSize(rule[2], true));
  }
  let inlineStylePattern: Dynamic = /<[a-z][a-z0-9-]*\b[^<>]*\bstyle="([^"]*)"[^<>]*>/gi;
  for (; (rule = inlineStylePattern.exec(html)); ) {
    let inlineStyle: Dynamic = rule[1].replace(/&quot;/g, "'");
    recordUsage(extractFontSizeRule(inlineStyle), extractFontSize(inlineStyle));
  }
  let roleEntries: Dynamic = new Map(),
    fontSizePattern: Dynamic = /font-size\s*:\s*(\d+(?:\.\d+)?(?:px|pt))/gi;
  for (; (rule = fontSizePattern.exec(html)); )
    if (!roleEntries.has(rule[1])) {
      let roleUsage: Dynamic =
        [...(entries.get(rule[1]) ?? [])].sort(
          (left?: Dynamic, right?: Dynamic): Dynamic =>
            right[1] - left[1],
        )[0]?.[0] ?? value;
      roleUsage && roleEntries.set(rule[1], roleUsage);
    }
  return roleEntries;
}
function inferTypographyRole(
  roleInput?: Dynamic,
  roleOptions?: Dynamic,
  elementContext?: Dynamic,
): Dynamic {
  if (elementContext) return "Button";
  if (/^h[1-6]$/.test(roleInput)) return TypographyCensusH1H2H3Config[roleInput];
  for (let [value, roleName] of TypographyCensusItems as Dynamic)
    if (value.test(roleOptions)) return roleName;
  return TypographyCensusH1H2H3Config[roleInput] ?? null;
}
function summarizeFontSizeUsage(items?: Dynamic, fontSizeUsage?: Dynamic): Dynamic {
  let callback: Dynamic = (fontSize?: Dynamic): Dynamic =>
      [...(fontSizeUsage.get(fontSize)?.values() ?? [])].reduce(
        (total?: Dynamic, usageCount?: Dynamic): Dynamic => total + usageCount,
        0,
      ),
    entries: Dynamic = new Map();
  for (let measuredFontSize of items as Dynamic)
    entries.set(
      measuredFontSize,
      [...(fontSizeUsage.get(measuredFontSize) ?? [])]
        .sort(
          (leftEntry?: Dynamic, rightEntry?: Dynamic): Dynamic =>
            rightEntry[1] - leftEntry[1] ||
            TEXT_ROLE_DISPLAY_ORDER.indexOf(leftEntry[0]) -
              TEXT_ROLE_DISPLAY_ORDER.indexOf(rightEntry[0]),
        )
        .map(([fontSize]: Dynamic): Dynamic => fontSize),
    );
  let value: Dynamic =
    items
      .filter((fontSize?: Dynamic): Dynamic => entries.get(fontSize)[0] === "Body")
      .sort(
        (leftSize?: Dynamic, rightSize?: Dynamic): Dynamic =>
          callback(rightSize) - callback(leftSize) || leftSize - rightSize,
      )[0] ??
    [...items].sort(
      (leftSize?: Dynamic, rightSize?: Dynamic): Dynamic => leftSize - rightSize,
    )[Math.floor(items.length / 2)] ??
    16;
  for (let fontSize of items as Dynamic)
    entries
      .get(fontSize)
      .push(
        fontSize > value ? "Heading" : fontSize === value ? "Body" : "Caption",
      );
  let roleByFontSize: Dynamic = new Map(),
    headingFontSizes: Dynamic = [],
    values: Dynamic = new Set(items);
  for (let fontSize of items as Dynamic)
    TypographyCensusHeadingPattern.test(entries.get(fontSize)[0]) &&
      (headingFontSizes.push(fontSize), values.delete(fontSize));
  for (let roleLabel of TEXT_ROLE_DISPLAY_ORDER.filter(
    (roleName?: Dynamic): Dynamic => !TypographyCensusHeadingPattern.test(roleName),
  ) as Dynamic) {
    let candidateSizes: Dynamic = [...values]
      .filter(
        (fontSize?: Dynamic): Dynamic => entries.get(fontSize).includes(roleLabel),
      )
      .sort(
        (leftSize?: Dynamic, rightSize?: Dynamic): Dynamic =>
          entries.get(leftSize).indexOf(roleLabel) -
            entries.get(rightSize).indexOf(roleLabel) ||
          callback(rightSize) - callback(leftSize) ||
          rightSize - leftSize,
      );
    candidateSizes[0] !== undefined &&
      (roleByFontSize.set(candidateSizes[0], roleLabel), values.delete(candidateSizes[0]));
  }
  for (let fontSize of values as Dynamic) fontSize > value && headingFontSizes.push(fontSize);
  headingFontSizes
    .sort((leftSize?: Dynamic, rightSize?: Dynamic): Dynamic => rightSize - leftSize)
    .forEach(
      (fontSize?: Dynamic, headingIndex?: Dynamic): Dynamic =>
        roleByFontSize.set(fontSize, uiMessage("inspector.census.heading") + String(headingIndex + 1)),
    );
  return roleByFontSize;
}
function collectColorTokens(html?: Dynamic, knownTokens?: Dynamic): Dynamic {
  let entries: Dynamic = new Map(),
    value: Dynamic = /(--[\w-]+)\s*:\s*([^;"'>}]+)/g,
    colorMatch: Dynamic;
  for (; (colorMatch = value.exec(html)); )
    entries.set(colorMatch[1], colorMatch[2].trim());
  let tokenCounts: Dynamic = new Map(),
    callback: Dynamic = (token?: Dynamic): Dynamic => {
      tokenCounts.set(token, (tokenCounts.get(token) ?? 0) + 1);
    },
    colorPattern: Dynamic =
      /(?:^|[\s;"'{])(?:color|background-color|border-color|fill|stroke)\s*:\s*([^;"'>}]+)/gi;
  for (; (colorMatch = colorPattern.exec(html)); ) {
    let colorValue: Dynamic = colorMatch[1].trim().replace(/\s*!important$/i, ""),
      tokenName: Dynamic = CSS_VARIABLE_REFERENCE_PATTERN.exec(colorValue)?.[1];
    for (
      let index: Dynamic = 0;
      tokenName !== undefined &&
      knownTokens?.has(tokenName) !== true &&
      entries.has(tokenName) &&
      index < 8;
      index++
    ) {
      colorValue = entries.get(tokenName);
      tokenName = CSS_VARIABLE_REFERENCE_PATTERN.exec(colorValue)?.[1];
    }
    if (tokenName !== undefined) {
      let resolvedValue: Dynamic = resolveColorToken(entries, tokenName);
      knownTokens?.has(tokenName) === true &&
        callback(
          "var(" + tokenName + (resolvedValue !== null ? ", " + resolvedValue : "") + ")",
        );
      continue;
    }
    if (
      !colorValue ||
      colorValue.includes("{{") ||
      /^(none|inherit|currentcolor|transparent|initial|unset)$/i.test(colorValue)
    )
      continue;
    let normalizedColor: Dynamic = normalizeHexColor(colorValue);
    normalizedColor && callback(normalizedColor);
  }
  return tokenCounts;
}
function resolveColorToken(entries?: Dynamic, tokenName?: Dynamic): Dynamic {
  let entry: Dynamic = entries.get(tokenName);
  for (let index: Dynamic = 0; entry !== undefined && index < 8; index++) {
    let value: Dynamic = CSS_VARIABLE_REFERENCE_PATTERN.exec(entry)?.[1];
    if (value === undefined) return normalizeHexColor(entry);
    entry = entries.get(value);
  }
  return null;
}
function normalizeHexColor(color?: Dynamic): Dynamic {
  let value: Dynamic,
    green: Dynamic,
    blue: Dynamic,
    count: Dynamic = 1,
    hexMatch: Dynamic = HEX_COLOR_PATTERN.exec(color.trim());
  if (hexMatch) {
    let hexValue: Dynamic = hexMatch[1];
    hexValue.length <= 4 &&
      (hexValue = [...hexValue]
        .map((channel?: Dynamic): Dynamic => channel + channel)
        .join(""));
    value = parseInt(hexValue.slice(0, 2), 16);
    green = parseInt(hexValue.slice(2, 4), 16);
    blue = parseInt(hexValue.slice(4, 6), 16);
    hexValue.length === 8 && (count = parseInt(hexValue.slice(6, 8), 16) / 255);
  } else {
    let rgbaMatch: Dynamic = TypographyCensusRgbaPattern.exec(color.trim());
    if (
      !rgbaMatch ||
      ((value = +rgbaMatch[1]),
      (green = +rgbaMatch[2]),
      (blue = +rgbaMatch[3]),
      rgbaMatch[4] !== undefined &&
        (count = rgbaMatch[4].endsWith("%")
          ? parseFloat(rgbaMatch[4]) / 100
          : parseFloat(rgbaMatch[4])),
      [value, green, blue].some(
        (channel?: Dynamic): Dynamic => channel > 255,
      ) || !(count >= 0 && count <= 1))
    )
      return null;
  }
  if (count < 0.2) return null;
  let alpha: Dynamic =
    "#" +
    [value, green, blue]
      .map(
        (channel?: Dynamic): Dynamic => channel.toString(16).padStart(2, "0"),
      )
      .join("");
  return count >= 0.999
    ? alpha
    : "rgba(" +
        value +
        ", " +
        green +
        ", " +
        blue +
        ", " +
        String(Math.round(count * 100) / 100) +
        ")";
}
export {
  collectColorTokens,
  collectFontFamilies,
  collectFontSizeFamilyUsage,
  collectFontSizes,
  collectGoogleFontFamilies,
  collectTypographyRoles,
  hasAuthoredAppearance,
  inferTypographyRole,
  inspectSvgLine,
  normalizeHexColor,
  resolveColorToken,
  selectedSvgElements,
  summarizeFontSizeUsage,
  TypographyCensusBorderBorderWidthBorderStyleValues,
  TypographyCensusH1H2H3Config,
  TypographyCensusHeadingPattern,
  TypographyCensusItems,
  TEXT_ROLE_DISPLAY_ORDER as TypographyCensusItems_2,
  TypographyCensusPattern,
  CSS_VARIABLE_REFERENCE_PATTERN as TypographyCensusPattern_2,
  HEX_COLOR_PATTERN as TypographyCensusPattern_3,
  TypographyCensusRgbaPattern,
  TypographyCensusSubscribers,
};
export function installEditorTypographyCensus(): () => void {
  return () => {
    TypographyCensusBorderBorderWidthBorderStyleValues = [
      "border",
      "border-width",
      "border-style",
      "border-color",
      "border-top",
      "border-right",
      "border-bottom",
      "border-left",
      "border-top-width",
      "border-right-width",
      "border-bottom-width",
      "border-left-width",
      "border-top-style",
      "border-right-style",
      "border-bottom-style",
      "border-left-style",
      "border-top-color",
      "border-right-color",
      "border-bottom-color",
      "border-left-color",
    ];
    TypographyCensusSubscribers = new Set(
      TypographyCensusBorderBorderWidthBorderStyleValues,
    );
    TypographyCensusPattern =
      /^\s*M\s*([\d.eE+-]+)[\s,]+([\d.eE+-]+)\s*L\s*([\d.eE+-]+)[\s,]+([\d.eE+-]+)\s*$/;
    TypographyCensusItems = [
      [/eyebrow|kicker|overline/i, "Eyebrow"],
      [/subhead|\blead\b|\bdek\b|intro|standfirst/i, "Lead"],
      [/display|hero-?title/i, "Display"],
      [/caption|footnote|\bmeta\b|footer|fine-?print|muted|byline/i, "Caption"],
      [/quote/i, "Quote"],
      [/\bcode\b|mono/i, "Code"],
      [/\bstat|metric|kpi|figure|numeral/i, "Stat"],
      [/wordmark|logo|brand/i, "Wordmark"],
      [/\bbtn\b|button|cta/i, "Button"],
      [/\bnav|menu|link/i, "Link"],
      [/label|tag\b|badge|chip|pill/i, "Label"],
    ];
    TypographyCensusH1H2H3Config = {
      get h1() { return uiMessage("inspector.census.heading1"); },
      get h2() { return uiMessage("inspector.census.heading2"); },
      get h3() { return uiMessage("inspector.census.heading3"); },
      get h4() { return uiMessage("inspector.census.heading4"); },
      get h5() { return uiMessage("inspector.census.heading5"); },
      get h6() { return uiMessage("inspector.census.heading6"); },
      get p() { return uiMessage("inspector.census.body"); },
      get li() { return uiMessage("inspector.census.body"); },
      get td() { return uiMessage("inspector.census.body"); },
      get th() { return uiMessage("inspector.census.body"); },
      get dd() { return uiMessage("inspector.census.body"); },
      get dt() { return uiMessage("inspector.census.body"); },
      get div() { return uiMessage("inspector.census.body"); },
      button: "Button",
      get a() { return uiMessage("inspector.census.link"); },
      blockquote: "Quote",
      q: "Quote",
      get code() { return uiMessage("inspector.census.code"); },
      get pre() { return uiMessage("inspector.census.code"); },
      get kbd() { return uiMessage("inspector.census.code"); },
      get small() { return uiMessage("inspector.census.caption"); },
      get figcaption() { return uiMessage("inspector.census.caption"); },
      get caption() { return uiMessage("inspector.census.caption"); },
      get label() { return uiMessage("inspector.census.label"); },
      get span() { return uiMessage("inspector.census.caption"); },
      b: "Strong",
      strong: "Strong",
      get em() { return uiMessage("inspector.census.body"); },
      get i() { return uiMessage("inspector.census.body"); },
    };
    TEXT_ROLE_DISPLAY_ORDER = [
      "Display",
      "Heading 1",
      "Heading 2",
      "Heading 3",
      uiMessage("inspector.census.heading4"),
      uiMessage("inspector.census.heading5"),
      uiMessage("inspector.census.heading6"),
      "Lead",
      "Eyebrow",
      "Body",
      "Button",
      "Link",
      "Stat",
      "Wordmark",
      "Quote",
      "Code",
      "Label",
      "Caption",
      "Strong",
    ];
    TypographyCensusHeadingPattern = /^Heading( [1-6])?$/;
    CSS_VARIABLE_REFERENCE_PATTERN = /^var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)$/;
    HEX_COLOR_PATTERN = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
    TypographyCensusRgbaPattern =
      /^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})(?:[\s,/]+([\d.]+%?))?\s*\)$/i;
  };
}
