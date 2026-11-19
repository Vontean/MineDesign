import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { fontFamilyStack } from "./font-faces";
import { groupColorPaletteTokens } from "../model/component-inference";
import { UNGROUPED_ASSETS_NAME } from "../model/derive-system";
import { DESIGN_SYSTEM_PATHS } from "../model/file-policy";
import { colorAliasTarget, colorValueForThemeModelTokens, resolveColorTokenValue, shadowValueForTheme } from "../model/tokens";

var optionalNonemptyText: (text: string | undefined) => string | undefined;
var ASSETS_SECTION_LABEL: string;
var assetGroupDisplayName: (group: string) => string;
var extraTokenFamilySectionId: (key: string) => string;
var STARTER_SECTION_IDS: string[];
function tokenGroupRenamePairs(
  names: string[],
  namespace: string,
  previousGroup: string,
  nextGroup: string,
): [string, string][] {
  let items: [string, string][] = [];
  for (let value of names) {
    let prefix =
        namespace !== "" &&
        value.startsWith(namespace) &&
        value.length > namespace.length
          ? namespace
          : "",
      suffix = value.slice(prefix.length);
    if (previousGroup === "") {
      items.push([value, prefix + nextGroup + "-" + suffix]);
      continue;
    }
    if (suffix !== previousGroup && !suffix.startsWith(previousGroup + "-")) {
      continue;
    }
    items.push([
      value,
      prefix + nextGroup + suffix.slice(previousGroup.length),
    ]);
  }
  return items;
}
function colorGroupsForEditor(
  tokens: Model.NormalizedTokens,
): Application.EditorColorGroup[] {
  return groupColorPaletteTokens(tokens).map(
    (group: {
      name: string;
      tokens: Model.ColorToken[];
      numeric?: boolean;
    }) => ({
      name: group.name,
      tokens: group.tokens.map((token: Model.ColorToken) => {
        let value: Application.EditorColorToken["alias"];
        for (let theme of tokens.color.themes) {
          let aliasTarget = colorAliasTarget(
            colorValueForThemeModelTokens(
              token,
              theme.id,
              tokens,
            ),
          );
          if (aliasTarget !== undefined) {
            (value ??= {})[theme.id] = {
              to: aliasTarget,
              css: resolveColorTokenValue(
                token,
                theme.id,
                tokens,
              ),
            };
          }
        }
        return {
          name: token.name,
          value: token.value,
          alias: value,
          usage: optionalNonemptyText(token.usage),
        };
      }),
      ...(group.numeric
        ? {
            numeric: true,
          }
        : {}),
    }),
  );
}
function typeGroupsForEditor(
  groups: Model.TypographyGroup[],
): Application.EditorTypeGroup[] {
  return groups.map((group) => ({
    name: group.name,
    family: group.family,
    note: optionalNonemptyText(group.note),
    styles: group.styles.map((style) => ({
      name: style.name,
      fontSize: style.fontSize,
      lineHeight: style.lineHeight,
      fontWeight: style.fontWeight,
      letterSpacing: style.letterSpacing,
      fontStyle: style.fontStyle,
      opticalSize: style.opticalSize ?? undefined,
      familyKey: style.family !== "" ? style.family : undefined,
      sample: optionalNonemptyText(style.sample),
      usage: optionalNonemptyText(style.usage),
    })),
  }));
}
function fontFamiliesForEditor(
  families: Record<string, string>,
  fonts: Model.ParsedFont[],
): Record<string, string> {
  let state: Record<string, string> = {};
  for (let [value, fontFamily] of Object.entries(families)) {
    let firstFamily = firstCssFontFamily(fontFamily),
      fontFiles = fonts
        .filter(
          (font) =>
            !font.missing &&
            font.src !== "" &&
            firstFamily !== null &&
            font.family.toLowerCase() === firstFamily.toLowerCase(),
        )
        .map((fontPath) => fontPath.path);
    state[value] =
      firstFamily === null
        ? fontFamily
        : fontFamilyStack(firstFamily, fontFiles) + ", " + fontFamily;
  }
  return state;
}
function firstCssFontFamily(fontFamily: string): string | null {
  let match = /^\s*(?:"([^"]{1,80})"|'([^']{1,80})'|([^,'"]{1,80}))/.exec(
    fontFamily,
  );
  if (match === null) {
    return null;
  }
  let family = (match[1] ?? match[2] ?? match[3] ?? "").trim();
  if (family === "") {
    return null;
  } else {
    return family;
  }
}
function fontFilesForEditor(
  fonts: Model.ParsedFont[],
  assetFonts: Model.ParsedFont[] = [],
): Application.EditorFont[] {
  let callback = (
    font: Model.ParsedFont,
    isAssetFont: boolean,
  ): Application.EditorFont => ({
    path: font.path,
    family: font.family,
    weight: font.weight,
    style: font.style,
    format: font.format,
    missing: font.missing,
    stray: !font.referenced,
    ...(isAssetFont
      ? {
          asset: true,
        }
      : {}),
  });
  return [
    ...fonts.map((font) => callback(font, false)),
    ...assetFonts.map((font) => callback(font, true)),
  ];
}
function tokenScaleForEditor(
  scale: Model.TokenFamily,
): Application.EditorScale {
  return {
    note: optionalNonemptyText(scale.note),
    tokens: scale.tokens.map((token) => ({
      name: token.name,
      value: token.value,
      usage: optionalNonemptyText(token.usage),
    })),
  };
}
function humanizeTokenFamily(key: string): string {
  let label = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .trim()
    .toLowerCase();
  if (label === "") {
    return key;
  } else {
    return label.charAt(0).toUpperCase() + label.slice(1);
  }
}
function extraTokenFamiliesForEditor(
  tokens: Model.NormalizedTokens,
): Application.EditorExtraScale[] {
  return tokens.extra
    .filter((group): boolean => group.tokens.length > 0)
    .map((family) => ({
      key: family.key,
      id: "family:" + family.key,
      title: humanizeTokenFamily(family.key),
      scale: tokenScaleForEditor(family),
    }));
}
function documentSectionsForEditor(
  docs: Model.ParsedDesignSystem["docs"],
): Application.ApplicationView["docs"] {
  return docs.map((document) => ({
    path: document.path,
    id: "doc:" + document.path,
    title: document.title,
    markdown: document.markdown,
  }));
}
function shadowScaleForEditor(
  tokens: Model.NormalizedTokens,
): Application.ApplicationView["shadows"] {
  return {
    note: optionalNonemptyText(tokens.shadow.note),
    tokens: tokens.shadow.tokens.map((token) => ({
      name: token.name,
      value: Object.fromEntries(
        tokens.color.themes.map((theme) => [
          theme.id,
          shadowValueForTheme(token, theme.id, tokens),
        ]),
      ),
      usage: optionalNonemptyText(token.usage),
    })),
  };
}
function componentsForEditor(
  components: Model.ParsedComponent[],
): Application.EditorComponent[] {
  return components.map((component) => ({
    name: component.name,
    previewHtml: component.previewHtml ?? undefined,
    previewHeight: component.previewHeight,
    ...(component.previewWidth !== null
      ? {
          previewWidth: component.previewWidth,
        }
      : {}),
    guidelines: component.guidelinesMd ?? undefined,
    ...(component.guidelinesPath !== null
      ? {
          guidelinesPath: component.guidelinesPath,
        }
      : {}),
    ...(component.dts !== null
      ? {
          types: component.dts,
        }
      : {}),
    ...(component.group !== ""
      ? {
          group: component.group,
        }
      : {}),
    ...(component.subtitle !== ""
      ? {
          subtitle: component.subtitle,
        }
      : {}),
    ...(component.floor
      ? {
          floor: true,
        }
      : {}),
  }));
}
function assetForEditor(asset: Model.ParsedAsset): Application.EditorAsset {
  return {
    path: asset.path,
    group: asset.group,
    subpath: asset.subpath,
    name: asset.name,
    mime: asset.mime,
    ext: asset.ext,
    kind: asset.kind,
    store: asset.store,
    bytes: asset.bytes,
  };
}
function assetGroupsForEditor(
  groups: Model.ParsedAssetGroup[],
): Application.EditorAssetGroup[] {
  return groups
    .map((assetGroup) => ({
      name: assetGroup.name,
      slug: assetGroup.slug,
      folder:
        assetGroup.name === UNGROUPED_ASSETS_NAME
          ? "assets/"
          : "assets/" + assetGroup.name + "/",
      tile: assetGroup.tile,
      assets: assetGroup.assets
        .filter((source): boolean => source.kind !== "font")
        .map((asset) => assetForEditor(asset)),
    }))
    .filter((group): boolean => group.assets.length > 0);
}
function hasOnlyManifestFile(files: Model.FileTable): boolean {
  for (let value in files) {
    if (value !== DESIGN_SYSTEM_PATHS.manifest) {
      return false;
    }
  }
  return true;
}
function emptyDesignSystemSections(
  view: Application.ApplicationView,
  storage: { storedBytes: number },
): Set<string> {
  let values = new Set<string>();
  if (view.colorGroups.every((group): boolean => group.tokens.length === 0)) {
    values.add("colors");
  }
  if (view.typeGroups.length === 0 && view.fonts.length === 0) {
    values.add("type");
  }
  if (view.spacing.tokens.length === 0) {
    values.add("spacing");
  }
  if (view.corners.tokens.length === 0) {
    values.add("corners");
  }
  if (view.shadows.tokens.length === 0) {
    values.add("shadows");
  }
  if (view.components.length === 0) {
    values.add("components");
  }
  if (view.assetGroups.length === 0 && storage.storedBytes === 0) {
    values.add("assets");
  }
  return values;
}
function starterSectionState(
  emptySections: ReadonlySet<string>,
  editable: boolean,
  assetsEmpty: boolean,
  hasStarter: boolean = false,
): { hint: boolean; starter: Set<string> } {
  if (!editable) {
    return {
      hint: false,
      starter: new Set(),
    };
  }
  let starterSections = new Set(
    STARTER_SECTION_IDS.filter((sectionId) => emptySections.has(sectionId)),
  );
  return {
    hint:
      !hasStarter &&
      STARTER_SECTION_IDS.every((sectionId) =>
        sectionId === "assets" ? assetsEmpty : emptySections.has(sectionId),
      ),
    starter: starterSections,
  };
}
function designSystemEditorView(
  model: Model.ParsedDesignSystem,
): Application.ApplicationView {
  return {
    colorGroups: colorGroupsForEditor(model.tokens),
    typeGroups: typeGroupsForEditor(model.tokens.type.groups),
    families: fontFamiliesForEditor(model.tokens.type.families, model.fonts),
    familyNames: Object.fromEntries(
      Object.entries(model.tokens.type.families).flatMap(
        ([fontKey, fontFamily]) => {
          let value = firstCssFontFamily(fontFamily);
          if (value === null) {
            return [];
          } else {
            return [[fontKey, value]];
          }
        },
      ),
    ),
    fonts: fontFilesForEditor(model.fonts, model.assetFonts),
    spacing: tokenScaleForEditor(model.tokens.spacing),
    corners: tokenScaleForEditor(model.tokens.radius),
    shadows: shadowScaleForEditor(model.tokens),
    extras: extraTokenFamiliesForEditor(model.tokens),
    components: componentsForEditor(model.components),
    assetGroups: assetGroupsForEditor(model.assetGroups),
    readme: model.readme,
    docs: documentSectionsForEditor(model.docs),
  };
}
export {
  assetForEditor,
  assetGroupDisplayName,
  assetGroupsForEditor,
  ASSETS_SECTION_LABEL,
  colorGroupsForEditor,
  componentsForEditor,
  designSystemEditorView,
  documentSectionsForEditor,
  emptyDesignSystemSections,
  extraTokenFamiliesForEditor,
  extraTokenFamilySectionId,
  firstCssFontFamily,
  fontFamiliesForEditor,
  fontFilesForEditor,
  hasOnlyManifestFile,
  humanizeTokenFamily,
  optionalNonemptyText,
  shadowScaleForEditor,
  STARTER_SECTION_IDS,
  starterSectionState,
  tokenGroupRenamePairs,
  tokenScaleForEditor,
  typeGroupsForEditor,
};
export function installEditorViewModel(): () => void {
  return () => {
    optionalNonemptyText = (text: string | undefined) =>
      text === "" ? undefined : text;
    ASSETS_SECTION_LABEL = "Assets";
    assetGroupDisplayName = (group: string) =>
      group === UNGROUPED_ASSETS_NAME ? ASSETS_SECTION_LABEL : group;
    extraTokenFamilySectionId = (key: string): string => "family-" + key;
    STARTER_SECTION_IDS = [
      "colors",
      "type",
      "spacing",
      "corners",
      "shadows",
      "components",
      "assets",
    ];
  };
}
