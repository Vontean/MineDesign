/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { boundedDesignSystemText, createDesignSystemModel, designSystemName, DesignSystemTypeDeclarationsRgbaHslaPattern, groupColorTokens, normalizeColorTokenName, normalizeCssColor } from "./type-declarations";
import { parseTypographyStyles } from "./typography-parsing";

function parseColorDesignSystem(
  designSystemSource?: Dynamic,
  metadata: Dynamic = {},
  statsOut?: Dynamic,
): Dynamic {
  let colorSection: Dynamic = designSystemSource?.color;
  if (
    typeof colorSection != "object" ||
    colorSection === null ||
    !Array.isArray(colorSection.tokens)
  )
    return;
  let themes: Dynamic = Array.isArray(colorSection.themes)
      ? colorSection.themes.map((theme?: Dynamic): Dynamic => theme)
      : [],
    themeIds: Dynamic = themes
      .map(
        (theme?: Dynamic): Dynamic =>
          typeof theme?.id == "string" ? theme.id.toLowerCase() : undefined,
      )
      .filter((themeId?: Dynamic): Dynamic => themeId !== undefined),
    themeIndexById: Dynamic = new Map();
  themeIds.forEach((themeId?: Dynamic, themeIndex?: Dynamic): Dynamic => {
    themeIndexById.has(themeId) || themeIndexById.set(themeId, themeIndex);
  });
  let rawTokenValues: Dynamic = new Map();
  for (let tokenEntry of colorSection.tokens as Dynamic) {
    let tokenRecord: Dynamic = tokenEntry,
      tokenName: Dynamic = normalizeColorTokenName(tokenRecord?.name);
    if (tokenName === undefined || rawTokenValues.has(tokenName)) continue;
    let rawValue: Dynamic = tokenRecord?.value,
      defaultValue: Dynamic = typeof rawValue == "string" ? rawValue : undefined;
    if (
      typeof rawValue == "object" &&
      rawValue !== null &&
      !Array.isArray(rawValue)
    ) {
      let themeValuesById: Dynamic = new Map(
          Object.entries(rawValue).map(
            ([themeKey, themeColor]: Dynamic): Dynamic => [
              themeKey.toLowerCase(),
              themeColor,
            ],
          ),
        ),
        bestThemeIndex: Dynamic = 1 / 0;
      for (let [themeId, themeColor] of themeValuesById as Dynamic) {
        if (typeof themeColor != "string") continue;
        let entry: Dynamic = themeIndexById.get(themeId);
        (entry !== undefined
          ? entry < bestThemeIndex
          : bestThemeIndex === 1 / 0 && defaultValue === undefined) &&
          ((defaultValue = themeColor), entry !== undefined && (bestThemeIndex = entry));
      }
    }
    rawTokenValues.set(tokenName, typeof defaultValue == "string" ? defaultValue.trim() : "");
  }
  let resolveColor: Dynamic = (colorText?: Dynamic, depth?: Dynamic): Dynamic => {
      let referencedName: Dynamic = /^\{(.+)\}$/.exec(colorText)?.[1];
      if (referencedName === undefined) return normalizeCssColor(colorText);
      let entry: Dynamic = rawTokenValues.get(
        normalizeColorTokenName(referencedName) ?? "",
      );
      return entry !== undefined && depth < 16
        ? resolveColor(entry, depth + 1)
        : undefined;
    },
    resolvedColors: Dynamic = new Map(),
    state: Dynamic = {
      total: rawTokenValues.size,
      unresolved: 0,
      truncated: 0,
    };
  for (let [tokenName, rawColor] of rawTokenValues as Dynamic) {
    let resolvedColor: Dynamic = resolveColor(rawColor, 0);
    resolvedColor === undefined
      ? state.unresolved++
      : resolvedColors.size >= 600
        ? state.truncated++
        : resolvedColors.set(tokenName, resolvedColor);
  }
  statsOut !== undefined && Object.assign(statsOut, state);
  let colorNames: Dynamic = [...rawTokenValues]
      .filter(
        ([tokenName, rawColor]: Dynamic): Dynamic =>
          resolvedColors.has(tokenName) ||
          DesignSystemTypeDeclarationsRgbaHslaPattern.test(rawColor),
      )
      .map(([tokenName]: Dynamic): Dynamic => tokenName),
    colorGroups: Dynamic = groupColorTokens(colorNames).flatMap(
      (group?: Dynamic): Dynamic =>
        group.names.flatMap(
          (tokenName?: Dynamic): Dynamic =>
            resolvedColors.has(tokenName)
              ? [
                  {
                    name: tokenName,
                    value: resolvedColors.get(tokenName),
                    group: group.label,
                  },
                ]
              : [],
        ),
    ),
    defaultTheme: Dynamic = themes.find(
      (theme?: Dynamic): Dynamic => typeof theme?.id == "string",
    );
  return createDesignSystemModel(
    boundedDesignSystemText(metadata.title, 80) ??
      designSystemName(designSystemSource),
    metadata.url,
    typeof defaultTheme?.name == "string" ? defaultTheme.name : defaultTheme?.id,
    colorGroups,
  );
}
function parseCompleteDesignSystem(
  designSystemSource?: Dynamic,
  metadata: Dynamic = {},
  statsOut?: Dynamic,
): Dynamic {
  let colorSystem: Dynamic = parseColorDesignSystem(designSystemSource, metadata, statsOut),
    typographyStyles: Dynamic = parseTypographyStyles(designSystemSource);
  return typographyStyles.length === 0
    ? colorSystem
    : colorSystem !== undefined
      ? {
          ...colorSystem,
          type: typographyStyles,
        }
      : createDesignSystemModel(
          boundedDesignSystemText(metadata.title, 80) ??
            designSystemName(designSystemSource),
          metadata.url,
          undefined,
          [],
          typographyStyles,
        );
}
export {
  parseColorDesignSystem,
  parseCompleteDesignSystem,
};
export function installDesignSystemTokenParsing(): () => void {
  return () => {};
}
