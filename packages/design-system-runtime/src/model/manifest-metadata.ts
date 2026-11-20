/** Restored application module; prepare first, initialize in original order. */
import type * as Core from "../contracts/model-core";
import type * as Model from "../contracts";
import type { AssetGroupMetadata, ParseReport } from "../contracts";
import { COMPONENT_NAME_PATTERN, isValidDesignSystemPath, MAX_DESIGN_SYSTEM_FILES, RESERVED_PROTOTYPE_NAMES, WINDOW_NAMESPACE_PATTERN } from "./file-policy";
import { normalizeDesignSystemPath, parseManifest } from "./file-table";
import { LIBRARY_NAME_PATTERN, LIBRARY_VERSION_PATTERN, PACKAGED_LIBRARY_PATH_PATTERN } from "./libraries";
import { MAX_TOKEN_LABEL_LENGTH } from "./tokens";

var isManifestMetadataObject: (
  input: unknown,
) => input is Record<string, unknown>;
var MAX_MANIFEST_LIBRARIES: number;
var MAX_BUNDLE_HEADER_COMPONENTS: number;
var MAX_MANIFEST_ASSET_GROUPS: number;
var MAX_ASSET_GROUP_NAME_LENGTH: number;
var ASSET_TILE_SIZES: string[];
var DEFAULT_ASSET_TILE_SIZE: Model.AssetTileSize;
var SECTION_TITLE_KEY_PATTERN: RegExp;
var isDesignSystemContentObject: (
  input: unknown,
) => input is Record<string, unknown>;
function parseManifestLibraries(
  rawLibraries: unknown,
  sourceLabel: string,
  report: ParseReport,
) {
  let libraries: Model.DeclaredLibrary[] = [];
  if (!Array.isArray(rawLibraries)) {
    return libraries;
  }
  let seenNames = new Set<string>();
  for (let value of rawLibraries as unknown[]) {
    if (libraries.length >= MAX_MANIFEST_LIBRARIES) {
      break;
    }
    let text = "",
      version = "",
      global: string | undefined,
      file: string | undefined;
    if (typeof value === "string") {
      let atIndex = value.lastIndexOf("@");
      text = (atIndex > 0 ? value.slice(0, atIndex) : value)
        .trim()
        .toLowerCase();
      version = atIndex > 0 ? value.slice(atIndex + 1).trim() : "";
    } else if (isManifestMetadataObject(value)) {
      text =
        typeof value.name === "string" ? value.name.trim().toLowerCase() : "";
      version =
        typeof value.version === "string"
          ? value.version.trim()
          : typeof value.version === "number"
            ? String(value.version)
            : "";
      if (typeof value.global === "string") {
        if (WINDOW_NAMESPACE_PATTERN.test(value.global.trim())) {
          global = value.global.trim();
        } else {
          report.warnings.push(
            sourceLabel +
              " library " +
              JSON.stringify(text) +
              ': "global" is not a JS identifier — ignored',
          );
        }
      }
      if (typeof value.file === "string") {
        let normalizedFile = isValidDesignSystemPath(value.file.trim())
          ? normalizeDesignSystemPath(value.file.trim())
          : "";
        if (
          PACKAGED_LIBRARY_PATH_PATTERN.test(normalizedFile) &&
          isValidDesignSystemPath(normalizedFile)
        ) {
          file = normalizedFile;
        } else {
          report.warnings.push(
            sourceLabel +
              " library " +
              JSON.stringify(text) +
              ': "file" must be one .js under components/lib/ — ignored',
          );
        }
      }
    }
    version = version.replace(/^[\^~=v]/, "");
    if (
      !LIBRARY_NAME_PATTERN.test(text) ||
      !LIBRARY_VERSION_PATTERN.test(version)
    ) {
      report.dropped.push(
        sourceLabel +
          " library " +
          JSON.stringify(text + "@" + version) +
          ": bad name or version",
      );
      continue;
    }
    if (seenNames.has(text)) {
      report.warnings.push(
        sourceLabel + " library " + text + ": listed twice — first wins",
      );
      continue;
    }
    seenNames.add(text);
    libraries.push({
      name: text,
      version: version,
      ...(global !== undefined
        ? {
            global: global,
          }
        : {}),
      ...(file !== undefined
        ? {
            file: file,
          }
        : {}),
    });
  }
  return libraries;
}
function parseManifestBundleMetadata(
  manifestInput: unknown,
  report: ParseReport = { dropped: [], warnings: [] },
) {
  let manifest = parseManifest(manifestInput, report),
    namespace =
      typeof manifest.namespace === "string"
        ? manifest.namespace.trim()
        : null;
  if (
    namespace !== null &&
    !WINDOW_NAMESPACE_PATTERN.test(namespace)
  ) {
    report.warnings.push(
      "manifest.json namespace " +
        JSON.stringify(namespace.slice(0, 40)) +
        ": not a JS identifier — ignored",
    );
    namespace = null;
  }
  let libraries = Array.isArray(manifest.libraries)
    ? parseManifestLibraries(manifest.libraries, "manifest.json", report)
    : [];
  return {
    namespace: namespace,
    libraries: libraries.length > 0 ? libraries : null,
  };
}
function isAssetTileSize(size: unknown): size is Model.AssetTileSize {
  return typeof size === "string" && ASSET_TILE_SIZES.includes(size);
}
function isAssetOrderKey(key: unknown): key is string {
  if (typeof key !== "string" || key === "" || key.length > 400) {
    return false;
  }
  let path: string = "assets/g/" + key;
  return (
    isValidDesignSystemPath(path) &&
    normalizeDesignSystemPath(path) === path
  );
}
function ownPropertyOrUndefined<Value>(
  object: Record<string, Value>,
  key: string,
) {
  if (Object.hasOwn(object, key)) {
    return object[key];
  } else {
    return undefined;
  }
}
function isAssetGroupName(name: unknown): name is string {
  return (
    typeof name === "string" &&
    name.length > 0 &&
    name.length <= MAX_ASSET_GROUP_NAME_LENGTH &&
    !/[/\\\u0000-\u001f\u007f]/.test(name) &&
    name !== "." &&
    name !== ".." &&
    !RESERVED_PROTOTYPE_NAMES.has(name) &&
    name.trim() === name
  );
}
function parseAssetGroupMetadata(
  manifestInput: unknown,
  report: ParseReport = {
    dropped: [],
    warnings: [],
  },
): AssetGroupMetadata {
  let manifest = parseManifest(manifestInput, report),
    groups: string[] = [],
    tiles: Record<string, Model.AssetTileSize> = {},
    orders: Record<string, string[]> = {};
  if (
    Object.hasOwn(manifest, "assetGroups") &&
    !Array.isArray(manifest.assetGroups)
  ) {
    report.dropped.push(
      "manifest.json assetGroups: not an array — group order ignored",
    );
  }
  if (Array.isArray(manifest.assetGroups)) {
    for (let value of manifest.assetGroups as unknown[]) {
      if (!isManifestMetadataObject(value)) {
        continue;
      }
      if (
        groups.length < MAX_MANIFEST_ASSET_GROUPS &&
        isAssetGroupName(value.name) &&
        !groups.includes(value.name)
      ) {
        groups.push(value.name);
      }
      if (
        isAssetGroupName(value.name) &&
        isAssetTileSize(value.tile) &&
        value.tile !== DEFAULT_ASSET_TILE_SIZE &&
        !Object.hasOwn(tiles, value.name)
      ) {
        tiles[value.name] = value.tile;
      }
      if (
        isAssetGroupName(value.name) &&
        Array.isArray(value.order) &&
        !Object.hasOwn(orders, value.name)
      ) {
        let order = [...new Set(value.order.filter(isAssetOrderKey))].slice(
          0,
          MAX_DESIGN_SYSTEM_FILES,
        );
        if (order.length > 0) {
          orders[value.name] = order;
        }
      }
    }
  }
  return {
    groups: groups,
    tiles: tiles,
    orders: orders,
  };
}
function serializeAssetGroupMetadata(metadata: AssetGroupMetadata) {
  let names = [...metadata.groups];
  for (let value of [
    ...Object.keys(metadata.tiles),
    ...Object.keys(metadata.orders),
  ]) {
    if (!names.includes(value)) {
      names.push(value);
    }
  }
  return names.map((name) => {
    let value = ownPropertyOrUndefined(metadata.tiles, name),
      order = ownPropertyOrUndefined(metadata.orders, name);
    return {
      name: name,
      ...(value !== undefined && value !== DEFAULT_ASSET_TILE_SIZE
        ? {
            tile: value,
          }
        : {}),
      ...(order !== undefined && order.length > 0
        ? {
            order: order,
          }
        : {}),
    };
  });
}
function parseBundleHeader(script: string) {
  let prefix = script.slice(0, 262144),
    headerOffset = prefix.indexOf("@ds-bundle:");
  if (headerOffset < 0) {
    return null;
  }
  let commentStart = prefix.lastIndexOf("/*", headerOffset),
    commentEnd = prefix.indexOf("*/", headerOffset);
  if (commentStart < 0 || commentEnd < 0) {
    return null;
  }
  if (prefix.slice(0, commentStart).trim() !== "") {
    return null;
  }
  let json = prefix.slice(headerOffset + 11, commentEnd).trim(),
    header: unknown;
  try {
    header = JSON.parse(json);
  } catch {
    return null;
  }
  if (!isManifestMetadataObject(header)) {
    return null;
  }
  let components: string[] = [];
  if (Array.isArray(header.components)) {
    for (let value of header.components as unknown[]) {
      let componentName =
        typeof value === "string"
          ? value
          : isManifestMetadataObject(value) && typeof value.name === "string"
            ? value.name
            : "";
      if (
        COMPONENT_NAME_PATTERN.test(componentName) &&
        !components.includes(componentName) &&
        components.length < MAX_BUNDLE_HEADER_COMPONENTS
      ) {
        components.push(componentName);
      }
    }
  }
  let inlinedExternals: string[] = [];
  if (Array.isArray(header.inlinedExternals)) {
    for (let value of header.inlinedExternals as unknown[]) {
      if (
        typeof value === "string" &&
        value.length <= 60 &&
        inlinedExternals.length < 40
      ) {
        inlinedExternals.push(value);
      }
    }
  }
  return {
    format: typeof header.format === "number" ? header.format : null,
    namespace:
      typeof header.namespace === "string" &&
      WINDOW_NAMESPACE_PATTERN.test(header.namespace)
        ? header.namespace
        : null,
    components: components,
    inlinedExternals: inlinedExternals,
  };
}
function normalizeSectionTitleModelManifestMetadata(title: string) {
  return title
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TOKEN_LABEL_LENGTH);
}
function sectionTitlesFromManifest(
  manifestInput: string | Core.ManifestObject,
) {
  let manifest: Core.ManifestObject = {};
  if (typeof manifestInput === "string") {
    try {
      let value: unknown = JSON.parse(
        manifestInput === "" ? "{}" : manifestInput,
      );
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        manifest = value as Core.ManifestObject;
      }
    } catch {
      return {};
    }
  } else {
    manifest = manifestInput;
  }
  let sections = manifest.sections;
  if (
    typeof sections !== "object" ||
    sections === null ||
    Array.isArray(sections)
  ) {
    return {};
  }
  let titles: Record<string, string> = {};
  for (let value of Object.keys(sections).sort()) {
    let titleValue = (sections as Record<string, unknown>)[value];
    if (
      !SECTION_TITLE_KEY_PATTERN.test(value) ||
      typeof titleValue !== "string"
    ) {
      continue;
    }
    let title = normalizeSectionTitleModelManifestMetadata(titleValue);
    if (title !== "") {
      titles[value] = title;
    }
  }
  return Object.freeze(titles);
}
function serializeSectionTitles(titles: Readonly<Record<string, string>>) {
  let keys = Object.keys(titles).sort();
  if (keys.length === 0) {
    return;
  }
  let result: Record<string, string> = {};
  for (let value of keys) {
    result[value] = titles[value];
  }
  return result;
}
export {
  ASSET_TILE_SIZES,
  DEFAULT_ASSET_TILE_SIZE,
  isAssetGroupName,
  isAssetOrderKey,
  isAssetTileSize,
  isDesignSystemContentObject,
  isManifestMetadataObject,
  MAX_ASSET_GROUP_NAME_LENGTH,
  MAX_BUNDLE_HEADER_COMPONENTS,
  MAX_MANIFEST_ASSET_GROUPS,
  MAX_MANIFEST_LIBRARIES,
  normalizeSectionTitleModelManifestMetadata,
  ownPropertyOrUndefined,
  parseAssetGroupMetadata,
  parseBundleHeader,
  parseManifestBundleMetadata,
  parseManifestLibraries,
  SECTION_TITLE_KEY_PATTERN,
  sectionTitlesFromManifest,
  serializeAssetGroupMetadata,
  serializeSectionTitles,
};
export function installModelManifestMetadata(): () => void {
  return () => {
    isManifestMetadataObject = (
      candidate: unknown,
    ): candidate is Record<string, unknown> =>
      typeof candidate === "object" && candidate !== null && !Array.isArray(candidate);
    MAX_MANIFEST_LIBRARIES = 12;
    MAX_BUNDLE_HEADER_COMPONENTS = 300;
    MAX_MANIFEST_ASSET_GROUPS = 60;
    MAX_ASSET_GROUP_NAME_LENGTH = 80;
    ASSET_TILE_SIZES = ["xs", "s", "m", "l", "xl"];
    DEFAULT_ASSET_TILE_SIZE = "m";
    SECTION_TITLE_KEY_PATTERN = /^\S[^\x00-\x1f]{0,80}$/;
    isDesignSystemContentObject = (
      candidate: unknown,
    ): candidate is Record<string, unknown> =>
      typeof candidate === "object" && candidate !== null && !Array.isArray(candidate);
  };
}
