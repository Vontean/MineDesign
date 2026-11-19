/** Restored application module; prepare first, initialize in original order. */
import type * as Core from "../contracts/model-core";
import type * as Model from "../contracts";
import type { UploadAssetInput } from "../contracts/application";
import { buildDesignSystemManifest, isWallAssetKind, orderAssetTiles, parsedDesignSystem, serializeDesignSystemManifest, stringifyManifestWithinBudget, UNGROUPED_ASSETS_NAME } from "./derive-system";
import { deleteDesignSystemFiles, protectedFilePathPredicate, renameDesignSystemFile, sanitizeUploadFileName, setDesignSystemFile, unusedFileName } from "./file-commands";
import { assetKindForPath, DESIGN_SYSTEM_PATHS, isValidDesignSystemPath, parseStoragePointer, pathBasename, pathDirname, storagePointerForFile } from "./file-policy";
import { DESIGN_SYSTEM_MANIFEST_VERSION, normalizeDesignSystemPath, parseManifest } from "./file-table";
import { parseLastChange, serializeLastChange } from "./last-change";
import { isAssetGroupName, normalizeSectionTitleModelManifestMetadata, ownPropertyOrUndefined, parseAssetGroupMetadata, sectionTitlesFromManifest, serializeAssetGroupMetadata, serializeSectionTitles } from "./manifest-metadata";
import { dropMissingBlobDigests, serializeStorageCatalog, storageCatalogFromManifest } from "./storage";
import { normalizeTokenName, pruneUnusedFontFamilies, updateTokens } from "./token-commands";
import { conflictingTokenNames, MAX_COLOR_TOKENS, MAX_TOKEN_LABEL_LENGTH, MAX_TOKENS_PER_FAMILY, MAX_TYPOGRAPHY_GROUPS, MAX_TYPOGRAPHY_STYLES, normalizeBoxShadow, normalizeColorOrAlias, normalizeScalarTokenValue, TOKEN_NAME_PATTERN } from "./tokens";

function mutableManifest(
  content: Model.DesignSystemContent,
): Core.ManifestObject & { manifestVersion: number } {
  return {
    ...parseManifest(
      content.files[DESIGN_SYSTEM_PATHS.manifest] ?? "",
    ),
    manifestVersion: DESIGN_SYSTEM_MANIFEST_VERSION,
  };
}
function updateAssetGroupMetadata(
  content: Model.DesignSystemContent,
  mutate: (metadata: Model.AssetGroupMetadata) => boolean,
) {
  let manifest = mutableManifest(content),
    metadata = structuredClone(
      parseAssetGroupMetadata(manifest),
    );
  if (!mutate(metadata)) {
    return content;
  }
  let assetKeysByGroup = new Map<string, Set<string>>();
  for (let value of Object.keys(content.files)) {
    let assetPathParts = parseAssetGroupPath(value);
    if (assetPathParts === null) {
      continue;
    }
    let groupAssetKeys = assetKeysByGroup.get(assetPathParts.group) ?? new Set();
    groupAssetKeys.add(assetPathParts.key);
    assetKeysByGroup.set(assetPathParts.group, groupAssetKeys);
  }
  metadata.groups = metadata.groups.filter((groupName) =>
    assetKeysByGroup.has(groupName),
  );
  for (let value of Object.keys(metadata.tiles)) {
    if (!assetKeysByGroup.has(value)) {
      delete metadata.tiles[value];
    }
  }
  for (let value of Object.keys(metadata.orders)) {
    let groupOrder = (
      ownPropertyOrUndefined(metadata.orders, value) ?? []
    ).filter(
      (assetKey): boolean => assetKeysByGroup.get(value)?.has(assetKey) === true,
    );
    if (groupOrder.length === 0) {
      delete metadata.orders[value];
    } else {
      metadata.orders[value] = groupOrder;
    }
  }
  let serialized = serializeAssetGroupMetadata(metadata);
  if (
    serialized.length === 0 &&
    Object.keys(manifest).every(
      (metadataKey) => metadataKey === "assetGroups" || metadataKey === "manifestVersion",
    )
  ) {
    return deleteDesignSystemFiles(content, [
      DESIGN_SYSTEM_PATHS.manifest,
    ]);
  }
  manifest.assetGroups = serialized;
  return setDesignSystemFile(
    content,
    DESIGN_SYSTEM_PATHS.manifest,
    stringifyManifestWithinBudget(manifest),
  );
}
function assetGroupDirectory(group: string) {
  if (group === UNGROUPED_ASSETS_NAME) {
    return DESIGN_SYSTEM_PATHS.assetsDir.slice(0, -1);
  } else {
    return DESIGN_SYSTEM_PATHS.assetsDir + group;
  }
}
function assetGroupFilePaths(files: Model.FileTable, group: string) {
  return Object.keys(files).filter(
    (assetPath): boolean => parseAssetGroupPath(assetPath)?.group === group,
  );
}
function parseAssetGroupPath(path: string) {
  if (!path.startsWith(DESIGN_SYSTEM_PATHS.assetsDir)) {
    return null;
  }
  let segments = path
    .slice(DESIGN_SYSTEM_PATHS.assetsDir.length)
    .split("/");
  if (segments.length > 1) {
    return {
      group: segments[0],
      key: segments.slice(1).join("/"),
    };
  } else {
    return {
      group: UNGROUPED_ASSETS_NAME,
      key: segments[0],
    };
  }
}
function addAssetFile(
  content: Model.DesignSystemContent,
  asset: UploadAssetInput,
) {
  let group =
    asset.group.trim() === ""
      ? UNGROUPED_ASSETS_NAME
      : asset.group.trim();
  if (
    group !== UNGROUPED_ASSETS_NAME &&
    !isAssetGroupName(group)
  ) {
    return content;
  }
  let subpathSegments = (asset.subpath ?? "")
      .split("/")
      .map((segment) => segment.trim())
      .filter((segment) => segment !== "" && segment !== "." && segment !== "..")
      .map(sanitizeUploadFileName),
    directory = [assetGroupDirectory(group), ...subpathSegments].join("/"),
    filename = unusedFileName(
      content.files,
      directory,
      sanitizeUploadFileName(asset.fileName),
    ),
    path: string = directory + "/" + filename;
  if (
    normalizeDesignSystemPath(path) !== path ||
    !isValidDesignSystemPath(path)
  ) {
    return content;
  }
  let next = setDesignSystemFile(content, path, asset.value);
  if (next === content) {
    return content;
  }
  if (
    asset.record !== undefined &&
    parseStoragePointer(asset.value) !== null
  ) {
    next = setFileStorageRecord(next, path, asset.record);
  }
  return next;
}
function renameAssetFilePath(
  content: Model.DesignSystemContent,
  oldPath: string,
  newPath: string,
) {
  if (!oldPath.startsWith(DESIGN_SYSTEM_PATHS.assetsDir)) {
    return content;
  }
  return renameDesignSystemFile(content, oldPath, newPath);
}
function renameAssetFile(
  content: Model.DesignSystemContent,
  path: string,
  newName: string,
) {
  let filename = sanitizeUploadFileName(newName),
    newPath: string =
      (pathDirname(path) === ""
        ? ""
        : pathDirname(path) + "/") + filename,
    renamed = renameAssetFilePath(content, path, newPath);
  if (renamed === content) {
    return content;
  }
  let oldGroup = parseAssetGroupPath(path),
    newGroup = parseAssetGroupPath(newPath);
  if (oldGroup === null || newGroup === null) {
    return renamed;
  }
  return updateAssetGroupMetadata(renamed, (metadata): boolean => {
    let value = ownPropertyOrUndefined(
        metadata.orders,
        oldGroup.group,
      ),
      oldGroupIndex = value?.indexOf(oldGroup.key) ?? -1;
    if (value === undefined || oldGroupIndex < 0) {
      return false;
    }
    value[oldGroupIndex] = newGroup.key;
    return true;
  });
}
function normalizeAssetGroupName(name: string) {
  let normalized =
    name.trim() === "" ? UNGROUPED_ASSETS_NAME : name.trim();
  if (
    normalized === UNGROUPED_ASSETS_NAME ||
    isAssetGroupName(normalized)
  ) {
    return normalized;
  } else {
    return null;
  }
}
function moveAssetsToGroup(
  content: Model.DesignSystemContent,
  paths: string[],
  targetGroup: string,
  beforePath?: string | null,
) {
  let group = normalizeAssetGroupName(targetGroup);
  if (group === null) {
    return content;
  }
  let directory = assetGroupDirectory(group),
    working = content,
    movedPaths: string[] = [];
  for (let value of paths) {
    let assetPathParts = parseAssetGroupPath(value);
    if (
      assetPathParts === null ||
      !Object.hasOwn(working.files, value) ||
      movedPaths.includes(value)
    ) {
      continue;
    }
    if (assetPathParts.group === group) {
      movedPaths.push(value);
      continue;
    }
    let targetPath: string =
        directory +
        "/" +
        unusedFileName(
          working.files,
          directory,
          pathBasename(value),
        ),
      renamedPath = renameAssetFilePath(working, value, targetPath);
    if (renamedPath === working) {
      continue;
    }
    working = renamedPath;
    movedPaths.push(targetPath);
  }
  if (movedPaths.length === 0) {
    return content;
  }
  if (
    beforePath === undefined ||
    (beforePath !== null &&
      (movedPaths.includes(beforePath) ||
        parseAssetGroupPath(beforePath)?.group !== group))
  ) {
    return working;
  }
  let movedKeys = movedPaths.map((assetPath) => parseAssetGroupPath(assetPath)!.key),
    beforeKey =
      beforePath === null ? null : parseAssetGroupPath(beforePath)!.key;
  return updateAssetGroupMetadata(working, (metadata): boolean => {
    let value = Object.keys(working.files).flatMap((filePath) => {
        let pathParts = parseAssetGroupPath(filePath),
          assetKind = assetKindForPath(filePath);
        if (pathParts !== null && pathParts.group === group && assetKind !== "font") {
          return [
            {
              key: pathParts.key,
              wall: isWallAssetKind(assetKind),
            },
          ];
        } else {
          return [];
        }
      }),
      entries = new Map(value.map((asset) => [asset.key, asset.wall])),
      orderedKeys = orderAssetTiles(
        value,
        (
          ownPropertyOrUndefined(metadata.orders, group) ?? []
        ).filter((key) => entries.has(key)),
      ).map((asset) => asset.key),
      remainingKeys = orderedKeys.filter(
        (key): boolean => !movedKeys.includes(key),
      ),
      insertIndex = beforeKey === null ? -1 : remainingKeys.indexOf(beforeKey);
    remainingKeys.splice(
      insertIndex < 0 ? remainingKeys.length : insertIndex,
      0,
      ...movedKeys.filter((key) => entries.has(key)),
    );
    let items = [
      ...remainingKeys.filter((key): boolean => entries.get(key) === true),
      ...remainingKeys.filter((key): boolean => entries.get(key) !== true),
    ];
    if (
      items.length === orderedKeys.length &&
      items.every((key, index): boolean => key === orderedKeys[index])
    ) {
      return false;
    }
    metadata.orders[group] = items;
    return true;
  });
}
function renameAssetGroup(
  content: Model.DesignSystemContent,
  oldName: string,
  newName: string,
) {
  let oldGroup = normalizeAssetGroupName(oldName),
    newGroup = newName.replace(/\s+/g, " ").trim();
  if (
    oldGroup === null ||
    !isAssetGroupName(newGroup) ||
    newGroup === UNGROUPED_ASSETS_NAME ||
    newGroup === oldGroup
  ) {
    return content;
  }
  let oldPrefix: string = assetGroupDirectory(oldGroup) + "/";
  if (
    Object.keys(content.files).some(
      (path) =>
        path.startsWith(oldPrefix) &&
        protectedFilePathPredicate(path),
    )
  ) {
    return content;
  }
  let newPrefix: string = assetGroupDirectory(newGroup) + "/",
    paths = assetGroupFilePaths(content.files, oldGroup);
  if (
    paths.length === 0 ||
    Object.keys(content.files).some((path) => path.startsWith(newPrefix))
  ) {
    return content;
  }
  let working = content;
  for (let value of paths) {
    let renamedPath = renameDesignSystemFile(
      working,
      value,
      newPrefix +
        value.slice(
          oldGroup === UNGROUPED_ASSETS_NAME
            ? DESIGN_SYSTEM_PATHS.assetsDir.length
            : oldPrefix.length,
        ),
    );
    if (renamedPath === working) {
      return content;
    }
    working = renamedPath;
  }
  working = updateAssetGroupMetadata(working, (metadata): boolean => {
    metadata.groups = metadata.groups.map((groupName) =>
      groupName === oldGroup ? newGroup : groupName,
    );
    let value = ownPropertyOrUndefined(metadata.tiles, oldGroup),
      groupOrders = ownPropertyOrUndefined(metadata.orders, oldGroup);
    delete metadata.tiles[oldGroup];
    delete metadata.orders[oldGroup];
    if (value !== undefined) {
      metadata.tiles[newGroup] = value;
    }
    if (groupOrders !== undefined) {
      metadata.orders[newGroup] = groupOrders;
    }
    return true;
  });
  return setSectionTitle(working, "assets:" + oldGroup, "");
}
function deleteAssetFile(content: Model.DesignSystemContent, path: string) {
  return deleteAssetFiles(content, [path]);
}
function deleteAssetFiles(
  content: Model.DesignSystemContent,
  paths: string[],
) {
  return deleteDesignSystemFiles(
    content,
    paths.filter((path): boolean => parseAssetGroupPath(path) !== null),
  );
}
function setFileStorageRecord(
  content: Model.DesignSystemContent,
  path: string,
  record: Model.StorageRecord,
) {
  let value = content.files[path];
  if (value === undefined) {
    return content;
  }
  let pointer = storagePointerForFile(path, value);
  if (
    pointer === null ||
    pointer.store !== record.store ||
    (pointer.store === "blob" && record.id !== pointer.id)
  ) {
    return content;
  }
  let manifest = mutableManifest(content),
    catalog = storageCatalogFromManifest(manifest);
  catalog.files[path] = record;
  manifest.storage = serializeStorageCatalog(catalog);
  return setDesignSystemFile(
    content,
    DESIGN_SYSTEM_PATHS.manifest,
    stringifyManifestWithinBudget(manifest),
  );
}
function updateStorageCatalog(
  content: Model.DesignSystemContent,
  mutate: (catalog: Model.StorageCatalog) => Model.StorageCatalog | null,
) {
  let manifest = mutableManifest(content),
    catalog = mutate(storageCatalogFromManifest(manifest));
  if (catalog === null) {
    return content;
  }
  let serialized = serializeStorageCatalog(catalog);
  if (serialized === undefined) {
    delete manifest.storage;
  } else {
    manifest.storage = serialized;
  }
  return setDesignSystemFile(
    content,
    DESIGN_SYSTEM_PATHS.manifest,
    stringifyManifestWithinBudget(manifest),
  );
}
function replaceInlineFileWithPointer(
  content: Model.DesignSystemContent,
  path: string,
  expectedValue: string,
  pointer: string,
  record: Model.StorageRecord,
) {
  if (
    content.files[path] !== expectedValue ||
    parseStoragePointer(pointer) === null
  ) {
    return content;
  }
  let next = setDesignSystemFile(content, path, pointer);
  if (next === content) {
    return content;
  } else {
    return setFileStorageRecord(next, path, record);
  }
}
function removeMissingStorageDigests(
  content: Model.DesignSystemContent,
  missingIds: ReadonlySet<string>,
) {
  if (missingIds.size === 0) {
    return content;
  }
  return updateStorageCatalog(content, (catalog) => {
    let value: Model.StorageCatalog = dropMissingBlobDigests(catalog, missingIds);
    if (value === catalog) {
      return null;
    } else {
      return value;
    }
  });
}
function setLastChange(
  content: Model.DesignSystemContent,
  change: Core.LastChangeDraft,
) {
  let normalized = parseLastChange({
    ...(change.extra ?? {}),
    by: change.by,
    ...(change.via !== undefined
      ? {
          via: change.via,
        }
      : {}),
    at: change.at,
    ...(change.note !== undefined
      ? {
          note: change.note,
        }
      : {}),
  }).value;
  if (normalized === null) {
    return content;
  }
  let manifest = mutableManifest(content);
  manifest.lastChange = serializeLastChange(normalized);
  return setDesignSystemFile(
    content,
    DESIGN_SYSTEM_PATHS.manifest,
    stringifyManifestWithinBudget(manifest),
  );
}
function refreshManifest(content: Model.DesignSystemContent, title: string) {
  let manifestText = serializeDesignSystemManifest(
    buildDesignSystemManifest(
      parsedDesignSystem(content),
      title,
    ),
  );
  if (content.files[DESIGN_SYSTEM_PATHS.manifest] === manifestText) {
    return content;
  }
  return setDesignSystemFile(
    content,
    DESIGN_SYSTEM_PATHS.manifest,
    manifestText,
  );
}
function finalizeContentChange(
  previous: Model.DesignSystemContent,
  next: Model.DesignSystemContent,
  title: string,
) {
  if (next === previous) {
    return previous;
  }
  return refreshManifest(next, title);
}
function setSectionTitle(
  content: Model.DesignSystemContent,
  key: string,
  title: string,
) {
  let normalized = normalizeSectionTitleModelManifestMetadata(
      title,
    ),
    manifest = mutableManifest(content),
    sections = {
      ...sectionTitlesFromManifest(manifest),
    };
  if ((sections[key] ?? "") === normalized) {
    return content;
  }
  if (normalized === "") {
    delete sections[key];
  } else {
    sections[key] = normalized;
  }
  let serialized = serializeSectionTitles(sections);
  if (serialized === undefined) {
    delete manifest.sections;
  } else {
    manifest.sections = serialized;
  }
  return setDesignSystemFile(
    content,
    DESIGN_SYSTEM_PATHS.manifest,
    stringifyManifestWithinBudget(manifest),
  );
}
function unusedTokenName(
  tokens: Model.NormalizedTokens,
  family: Core.TokenKind,
  preferredName: string,
) {
  let taken = new Set(conflictingTokenNames(tokens, family)),
    base = normalizeTokenName(preferredName) || "token";
  if (!taken.has(base)) {
    return base;
  }
  let numericSuffix = /^(.*-)(\d{1,4})$/.exec(base);
  if (numericSuffix !== null) {
    let length = numericSuffix[2].length;
    for (
      let value = parseInt(numericSuffix[2], 10) + 1;
      value < 1e4;
      value++
    ) {
      let candidateName = numericSuffix[1] + String(value).padStart(length, "0");
      if (!taken.has(candidateName)) {
        return candidateName;
      }
    }
  }
  for (let count: number = 2; count < 1e4; count++) {
    if (!taken.has(base + "-" + String(count))) {
      return base + "-" + String(count);
    }
  }
  return base + "-" + String(Date.now());
}
function addColorToken(
  content: Model.DesignSystemContent,
  name: string,
  colorValue: unknown,
  afterName?: string,
) {
  let normalized = normalizeColorOrAlias(colorValue);
  if (!TOKEN_NAME_PATTERN.test(name) || normalized === undefined) {
    return content;
  }
  return updateTokens(content, (colorCatalog): boolean => {
    if (
      conflictingTokenNames(colorCatalog, "color").includes(name) ||
      colorCatalog.color.tokens.length >= MAX_COLOR_TOKENS
    ) {
      return false;
    }
    if (colorCatalog.color.themes.length === 0) {
      colorCatalog.color.themes.push({
        id: "light",
        name: "Light",
      });
    }
    let state = {
        name: name,
        value: {
          [colorCatalog.color.themes[0]?.id ?? "light"]: normalized,
        },
        usage: "",
      },
      insertIndex =
        afterName !== undefined
          ? colorCatalog.color.tokens.findIndex(
              (token): boolean => token.name === afterName,
            )
          : -1;
    if (insertIndex >= 0) {
      colorCatalog.color.tokens.splice(insertIndex + 1, 0, state);
    } else {
      colorCatalog.color.tokens.push(state);
    }
    return true;
  });
}
function addScalarToken(
  content: Model.DesignSystemContent,
  family: Core.ScalarKind,
  name: string,
  scalarValue: unknown,
  afterName?: string,
  extraFamily?: string,
) {
  let normalized = normalizeScalarTokenValue(family, scalarValue);
  if (!TOKEN_NAME_PATTERN.test(name) || normalized === undefined) {
    return content;
  }
  return updateTokens(content, (tokenCatalog): boolean => {
    let tokens =
      family === "extra"
        ? tokenCatalog.extra.find((token): boolean => token.key === extraFamily)
            ?.tokens
        : tokenCatalog[family].tokens;
    if (
      tokens === undefined ||
      conflictingTokenNames(tokenCatalog, family).includes(name) ||
      tokens.length >= MAX_TOKENS_PER_FAMILY
    ) {
      return false;
    }
    let state = {
        name: name,
        value: normalized,
        usage: "",
      },
      insertIndex =
        afterName !== undefined
          ? tokens.findIndex((token): boolean => token.name === afterName)
          : -1;
    if (insertIndex >= 0) {
      tokens.splice(insertIndex + 1, 0, state);
    } else {
      tokens.push(state);
    }
    return true;
  });
}
function addShadowToken(
  content: Model.DesignSystemContent,
  name: string,
  shadowValue: unknown,
) {
  let normalized = normalizeBoxShadow(shadowValue);
  if (!TOKEN_NAME_PATTERN.test(name) || normalized === undefined) {
    return content;
  }
  return updateTokens(content, (shadowCatalog): boolean => {
    if (
      conflictingTokenNames(shadowCatalog, "shadow").includes(name) ||
      shadowCatalog.shadow.tokens.length >= MAX_TOKENS_PER_FAMILY
    ) {
      return false;
    }
    if (shadowCatalog.color.themes.length === 0) {
      shadowCatalog.color.themes.push({
        id: "light",
        name: "Light",
      });
    }
    let state = {
      name: name,
      value: {
        [shadowCatalog.color.themes[0]?.id ?? "light"]: normalized,
      },
      usage: "",
    };
    shadowCatalog.shadow.tokens.push(state);
    return true;
  });
}
function addTypographyStyle(
  content: Model.DesignSystemContent,
  name: string,
  afterName?: string,
  groupName?: string,
) {
  if (!TOKEN_NAME_PATTERN.test(name)) {
    return content;
  }
  return updateTokens(content, (typeCatalog): boolean => {
    let value = typeCatalog.type.groups.flatMap((style) => style.styles);
    if (
      value.some((style): boolean => style.name === name) ||
      value.length >= MAX_TYPOGRAPHY_STYLES
    ) {
      return false;
    }
    let targetGroup =
        groupName !== undefined
          ? typeCatalog.type.groups.find(
              (group): boolean => group.name === groupName,
            )
          : typeCatalog.type.groups[0],
      styleInsertIndex = -1,
      existingStyle: Model.TypographyStyle | undefined;
    if (afterName !== undefined) {
      for (let group of typeCatalog.type.groups) {
        let styleIndex = group.styles.findIndex(
          (style): boolean => style.name === afterName,
        );
        if (styleIndex >= 0) {
          targetGroup = group;
          styleInsertIndex = styleIndex;
          existingStyle = group.styles[styleIndex];
          break;
        }
      }
    }
    if (targetGroup === undefined) {
      targetGroup = {
        name: "Styles",
        family: Object.keys(typeCatalog.type.families)[0] ?? "",
        note: "",
        styles: [],
      };
      typeCatalog.type.groups.push(targetGroup);
    }
    let newStyle: Model.TypographyStyle =
      existingStyle !== undefined
        ? {
            ...existingStyle,
            name: name,
            sample: "",
            usage: "",
          }
        : {
            name: name,
            fontSize: "16px",
            lineHeight: "1.5",
            fontWeight: "400",
            letterSpacing: "0",
            fontStyle: "normal",
            opticalSize: null,
            family: "",
            sample: "",
            usage: "",
          };
    if (styleInsertIndex >= 0) {
      targetGroup.styles.splice(styleInsertIndex + 1, 0, newStyle);
    } else {
      targetGroup.styles.push(newStyle);
    }
    return true;
  });
}
function addTypographyGroup(
  content: Model.DesignSystemContent,
  preferredName: string,
) {
  return updateTokens(content, (typeCatalog): boolean => {
    if (typeCatalog.type.groups.length >= MAX_TYPOGRAPHY_GROUPS) {
      return false;
    }
    let values = new Set(typeCatalog.type.groups.map((group) => group.name)),
      value = preferredName;
    for (let count: number = 2; values.has(value); count++) {
      value = preferredName + " " + String(count);
    }
    typeCatalog.type.groups.push({
      name: value,
      family: Object.keys(typeCatalog.type.families)[0] ?? "",
      note: "",
      styles: [],
    });
    return true;
  });
}
function renameTypographyGroup(
  content: Model.DesignSystemContent,
  oldName: string,
  newName: string,
) {
  let normalized = newName
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TOKEN_LABEL_LENGTH);
  if (normalized === "" || normalized === oldName) {
    return content;
  }
  return updateTokens(content, (typeCatalog): boolean => {
    if (
      typeCatalog.type.groups.some((group): boolean => group.name === normalized)
    ) {
      return false;
    }
    let value = typeCatalog.type.groups.find(
      (group): boolean => group.name === oldName,
    );
    if (value === undefined) {
      return false;
    }
    value.name = normalized;
    return true;
  });
}
function deleteTypographyGroup(
  content: Model.DesignSystemContent,
  name: string,
) {
  return updateTokens(content, (typeCatalog): boolean => {
    let length = typeCatalog.type.groups.length;
    typeCatalog.type.groups = typeCatalog.type.groups.filter(
      (group): boolean => group.name !== name,
    );
    if (typeCatalog.type.groups.length === length) {
      return false;
    }
    pruneUnusedFontFamilies(typeCatalog);
    return true;
  });
}
export {
  addAssetFile,
  addColorToken,
  addScalarToken,
  addShadowToken,
  addTypographyGroup,
  addTypographyStyle,
  assetGroupDirectory,
  assetGroupFilePaths,
  deleteAssetFile,
  deleteAssetFiles,
  deleteTypographyGroup,
  finalizeContentChange,
  moveAssetsToGroup,
  mutableManifest,
  normalizeAssetGroupName,
  parseAssetGroupPath,
  refreshManifest,
  removeMissingStorageDigests,
  renameAssetFile,
  renameAssetFilePath,
  renameAssetGroup,
  renameTypographyGroup,
  replaceInlineFileWithPointer,
  setFileStorageRecord,
  setLastChange,
  setSectionTitle,
  unusedTokenName,
  updateAssetGroupMetadata,
  updateStorageCatalog,
};
export function installModelAssetCommands(): () => void {
  return () => {};
}
