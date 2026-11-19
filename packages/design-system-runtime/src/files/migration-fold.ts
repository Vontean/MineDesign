/** Restored application module; prepare first, initialize in original order. */
import type * as Migration from "../contracts/migration";
import type * as Model from "../contracts";
import { blobFilesOwedToFileStorage, buildFilesIndex, encodeFileIndexKey as encodeFileIndexKey_r, FILES_INDEX_PROJECT_PATH, filesLeftOutOfMigration, projectFilePath, publishableProjectFiles, relativeProjectFilePath, validDerivedProjectFiles } from "../editor/files-index";
import { cloneMergeValue, serializeIndexDocument, sha256 } from "../editor/index-file-store";
import { createDesignSystemMigrationCodec, DESIGN_SYSTEM_MIGRATION_LOCK_PATH, DESIGN_SYSTEM_STORE_ALLOWLIST, designSystemMigrationDbRules, legacyStoreSnapshotToFiles, migrationPublishInput, storeDocumentDataMap } from "./migration-codec";
import { hashCanonicalIndex, migrateStoreToFiles, MIGRATION_SENTINEL_PATH, parseMigrationSentinel, readAllowlistedStoreDocuments } from "./migration-engine";
import { listWritableFiles } from "./paths";
import { stripGeneratedReadmeTail } from "../model/documentation";
import { DESIGN_SYSTEM_PATHS, isTextFilePath } from "../model/file-policy";
import { ARTIFACT_FILE_CAPACITY, isAdditionalMarkdownPath } from "../model/file-table";
import { isAssetGroupName, isAssetTileSize } from "../model/manifest-metadata";
import { composeStoredSystemFiles, parseStoredSystemMetadata } from "../model/store-compose";
import { ASSETS_COLLECTION, SYSTEM_META_DOCUMENT_PATH, SYSTEM_SOURCE_DOCUMENT_PATH, SYSTEM_TOKENS_DOCUMENT_PATH, SYSTEM_UPGRADED_DOCUMENT_PATH } from "../model/stored-file-codec";

var lastStoreFoldSummary: Migration.FoldSummary;
var OTHER_VERSION_COPY_SUFFIX: string;
var assetGroupPathParts: (
  path: string,
) => { key: string; rel: string } | null;
async function foldLegacyStoreChangesIntoFiles(
  foldContext: Migration.FoldContext,
  fetchBlob: Migration.FetchMigrationBlob,
): Promise<Migration.FoldTree> {
  let files = new Map<string, Model.FilePublishInput>(),
    sources = new Map<string, string[]>(),
    index = cloneMergeValue(foldContext.index);
  index.assetGroups ??= {};
  index.blobs ??= {};
  index.groups ??= [];
  index.sections ??= {};
  index.docs = {
    ...(index.docs ?? {}),
    sections: [...(index.docs?.sections ?? [])],
  };
  let sentinelRead = await foldContext.readFileState(
    MIGRATION_SENTINEL_PATH,
  );
  if (sentinelRead.state === "unreadable") {
    return {
      files: files,
      index: index,
      sources: sources,
      unfolded: foldContext.changed.map((change) => change.path),
    };
  }
  let sentinel =
      sentinelRead.state === "text"
        ? parseMigrationSentinel(sentinelRead.text)
        : null,
    kept: Migration.FoldSummary["kept"] = [],
    unfolded: string[] = [];
  for (let value of foldContext.changed) {
    if (value.path === SYSTEM_META_DOCUMENT_PATH) {
      await foldLegacyMetaFields(
        index,
        value.data,
        foldContext.recorded.get(SYSTEM_META_DOCUMENT_PATH),
      );
      continue;
    }
    if (value.path === SYSTEM_SOURCE_DOCUMENT_PATH) {
      index.source = {
        ...value.data,
      };
      continue;
    }
    if (value.path === SYSTEM_UPGRADED_DOCUMENT_PATH) {
      index.upgraded = {
        ...value.data,
      };
      continue;
    }
    if (value.path === SYSTEM_TOKENS_DOCUMENT_PATH) {
      let projectPath = projectFilePath(
          DESIGN_SYSTEM_PATHS.tokens,
        ),
        fileState = await foldContext.readFileState(projectPath);
      if (fileState.state === "unreadable") {
        unfolded.push(value.path);
        continue;
      }
      if (
        fileState.state === "absent" &&
        sentinel?.files[projectPath] !== undefined
      ) {
        kept.push({
          path: DESIGN_SYSTEM_PATHS.tokens,
          why: "gone",
        });
        continue;
      }
      let currentText = fileState.state === "text" ? fileState.text : null,
        comparison =
          currentText === null
            ? null
            : await foldLegacyTokenChanges(
                currentText,
                value.data,
                foldContext.recorded.get(SYSTEM_TOKENS_DOCUMENT_PATH),
                sentinel?.files[projectPath]?.sha256,
              );
      if (comparison !== null) {
        if (comparison.clashed) {
          kept.push({
            path: DESIGN_SYSTEM_PATHS.tokens,
            why: "changed",
          });
        }
        if (comparison.text !== currentText) {
          files.set(
            projectPath,
            migrationPublishInput(projectPath, comparison.text),
          );
          sources.set(projectPath, [value.path]);
        }
        if (comparison.clashed) {
          let alternatePath = otherVersionProjectPath(projectPath);
          files.set(
            alternatePath,
            migrationPublishInput(
              alternatePath,
              JSON.stringify(value.data, null, 2) +
                `
`,
            ),
          );
          sources.set(alternatePath, [value.path]);
        }
        continue;
      }
    }
    let migratedFiles = await legacyStoreSnapshotToFiles(
      new Map([[value.path, value]]),
      fetchBlob,
    );
    for (let excludedFile of filesLeftOutOfMigration(migratedFiles.files)) {
      kept.push({
        path: excludedFile.path,
        why: "cannot",
      });
    }
    for (let [absolutePath, fileText] of publishableProjectFiles(
      migratedFiles.files,
    )) {
      let relativePath = relativeProjectFilePath(absolutePath)!,
        comparison = await storeFoldFileComparison(
          foldContext,
          absolutePath,
          relativePath,
          sentinel?.files[absolutePath]?.sha256,
        );
      if (comparison === "unreadable") {
        unfolded.push(value.path);
        continue;
      }
      if (comparison !== "same") {
        kept.push({
          path: relativePath,
          why: comparison,
        });
        if (
          comparison === "gone" ||
          !(
            isAdditionalMarkdownPath(relativePath) ||
            relativePath === DESIGN_SYSTEM_PATHS.readme ||
            relativePath.endsWith(".json")
          )
        ) {
          continue;
        }
        let alternatePath = otherVersionProjectPath(absolutePath);
        files.set(alternatePath, migrationPublishInput(alternatePath, fileText));
        sources.set(alternatePath, [value.path]);
        addFoldedDocumentToIndex(
          index,
          relativeProjectFilePath(alternatePath)!,
        );
        continue;
      }
      files.set(absolutePath, migrationPublishInput(absolutePath, fileText));
      sources.set(absolutePath, [value.path]);
      removeFoldedBlobReference(index, relativePath);
      addFoldedDocumentToIndex(index, relativePath);
    }
    let builtIndex = buildFilesIndex("", migratedFiles.files),
      hasConflict: boolean =
        (await hashCanonicalIndex(value.data.dataRef)) !==
        foldContext.recorded.get(value.path)?.dataRef;
    for (let [groupName, group] of Object.entries(builtIndex.assetGroups)) {
      for (let [assetName, asset] of Object.entries(group.files)) {
        let existingAsset = Object.hasOwn(index.assetGroups, groupName)
          ? index.assetGroups[groupName].files[assetName]
          : undefined;
        if (
          existingAsset !== undefined &&
          (!hasConflict || existingAsset.blob === asset.blob)
        ) {
          continue;
        }
        if (
          existingAsset === undefined &&
          foldContext.recorded.has(value.path) &&
          !hasConflict
        ) {
          continue;
        }
        let targetGroup = ensureFoldedAssetGroup(index, groupName, group.name);
        if (!index.groups.includes(groupName)) {
          index.groups.push(groupName);
        }
        if (existingAsset === undefined) {
          targetGroup.files[assetName] = asset;
          continue;
        }
        let alternateAssetName = otherVersionFileName(asset.name);
        targetGroup.files[encodeFileIndexKey_r(alternateAssetName)] = {
          ...asset,
          name: alternateAssetName,
        };
        kept.push({
          path:
            DESIGN_SYSTEM_PATHS.assetsDir +
            group.name +
            "/" +
            asset.name,
          why: "changed",
        });
      }
    }
    for (let [blobId, blob] of Object.entries(builtIndex.blobs)) {
      if (!Object.hasOwn(index.blobs, blobId)) {
        index.blobs[blobId] = blob;
      }
    }
  }
  lastStoreFoldSummary = {
    kept: kept,
    came:
      [...files.keys()].some(
        (path): boolean => !path.includes(OTHER_VERSION_COPY_SUFFIX),
      ) ||
      serializeIndexDocument(index) !==
        serializeIndexDocument(foldContext.index),
  };
  return {
    files: files,
    index: index,
    sources: sources,
    ...(unfolded.length > 0
      ? {
          unfolded: unfolded,
        }
      : {}),
  };
}
async function foldLegacyTokenChanges(
  fileText: string,
  storeTokens: Record<string, unknown>,
  recordedFields?: Record<string, string>,
  recordedSha?: string,
): Promise<{ text: string; clashed: boolean } | null> {
  let storeText: string =
    JSON.stringify(storeTokens, null, 2) +
    `
`;
  if (
    recordedFields === undefined &&
    recordedSha !== undefined &&
    (await sha256(new TextEncoder().encode(fileText))) ===
      recordedSha
  ) {
    return {
      text: storeText,
      clashed: false,
    };
  }
  let fileTokens: unknown;
  try {
    fileTokens = JSON.parse(fileText);
  } catch {
    return null;
  }
  if (
    typeof fileTokens !== "object" ||
    fileTokens === null ||
    Array.isArray(fileTokens)
  ) {
    return null;
  }
  let clashed: boolean = false,
    isNamedToken = (token: unknown): token is Migration.NamedLegacyToken =>
      typeof token === "object" &&
      token !== null &&
      typeof (token as { name?: unknown }).name === "string";
  for (let [value, tokenValue] of Object.entries(storeTokens)) {
    if (
      (await hashCanonicalIndex(tokenValue)) ===
      recordedFields?.[value]
    ) {
      continue;
    }
    let existingToken = (fileTokens as Record<string, unknown>)[value];
    if (
      existingToken === undefined ||
      (recordedFields !== undefined &&
        (await hashCanonicalIndex(existingToken)) ===
          recordedFields[value])
    ) {
      (fileTokens as Record<string, unknown>)[value] = tokenValue;
      continue;
    }
    if (
      serializeIndexDocument(existingToken) ===
      serializeIndexDocument(tokenValue)
    ) {
      continue;
    }
    let existingTokens = (existingToken as { tokens?: unknown } | null | undefined)?.tokens,
      incomingTokens = (tokenValue as { tokens?: unknown } | null | undefined)?.tokens;
    if (
      !Array.isArray(existingTokens) ||
      !Array.isArray(incomingTokens) ||
      !existingTokens.every(isNamedToken) ||
      !incomingTokens.every(isNamedToken)
    ) {
      clashed = true;
      continue;
    }
    for (let [fieldName, fieldValue] of Object.entries(
      tokenValue as Record<string, unknown>,
    )) {
      if (fieldName === "tokens") {
        continue;
      }
      let existingField = (existingToken as Record<string, unknown>)[fieldName];
      if (existingField === undefined) {
        (existingToken as Record<string, unknown>)[fieldName] = fieldValue;
      } else if (
        serializeIndexDocument(existingField) !==
        serializeIndexDocument(fieldValue)
      ) {
        clashed = true;
      }
    }
    let entries = new Map(existingTokens.map((token) => [token.name, token]));
    for (let token of incomingTokens) {
      let entry = entries.get(token.name);
      if (entry === undefined) {
        existingTokens.push(token);
      } else if (
        serializeIndexDocument(entry) !==
        serializeIndexDocument(token)
      ) {
        clashed = true;
      }
    }
  }
  return {
    text:
      JSON.stringify(fileTokens, null, 2) +
      `
`,
    clashed: clashed,
  };
}
function takeStoreFoldSummary() {
  let summary = lastStoreFoldSummary;
  lastStoreFoldSummary = {
    kept: [],
    came: false,
  };
  return summary;
}
function otherVersionProjectPath(path: string) {
  return otherVersionFileName(path);
}
function otherVersionFileName(path: string): string {
  let slash = path.lastIndexOf("/"),
    dot = path.indexOf(".", slash + 2);
  if (dot === -1) {
    return path + OTHER_VERSION_COPY_SUFFIX;
  } else {
    return path.slice(0, dot) + OTHER_VERSION_COPY_SUFFIX + path.slice(dot);
  }
}
async function storeFoldFileComparison(
  foldContext: Migration.FoldContext,
  projectPath: string,
  relative: string,
  recordedSha?: string,
): Promise<string> {
  let current = await foldContext.readFileState(projectPath);
  if (current.state === "unreadable") {
    return "unreadable";
  }
  if (current.state === "absent") {
    if (recordedSha === undefined) {
      return "same";
    } else {
      return "gone";
    }
  }
  if (recordedSha === undefined || !isTextFilePath(relative)) {
    return "changed";
  }
  let text =
    relative === DESIGN_SYSTEM_PATHS.readme
      ? stripGeneratedReadmeTail(current.text)
      : current.text;
  if (
    (await sha256(new TextEncoder().encode(text))) ===
    recordedSha
  ) {
    return "same";
  } else {
    return "changed";
  }
}
async function foldLegacyMetaFields(
  index: Migration.MigrationWireIndex,
  meta: Record<string, unknown>,
  recordedFields?: Record<string, string>,
): Promise<void> {
  let parsed = parseStoredSystemMetadata(meta);
  if (parsed === null) {
    return;
  }
  let fieldChanged = async (fieldName: string): Promise<boolean> =>
    Object.hasOwn(meta, fieldName) &&
    (await hashCanonicalIndex(meta[fieldName])) !==
      recordedFields?.[fieldName];
  if ((await fieldChanged("title")) && parsed.title !== "") {
    index.title = parsed.title;
  }
  if ((await fieldChanged("namespace")) && parsed.namespace !== undefined) {
    index.namespace = parsed.namespace;
  }
  if ((await fieldChanged("libraries")) && parsed.libraries !== undefined) {
    index.libraries = parsed.libraries;
  }
  if (await fieldChanged("sections")) {
    for (let [value, sectionValue] of Object.entries(parsed.sections ?? {})) {
      if (
        typeof sectionValue === "string" &&
        !["__proto__", "constructor", "prototype"].includes(
          encodeFileIndexKey_r(value),
        ) &&
        !Object.hasOwn(index.sections, encodeFileIndexKey_r(value))
      ) {
        index.sections[encodeFileIndexKey_r(value)] = sectionValue;
      }
    }
  }
  if (await fieldChanged("assetGroups")) {
    for (let value of parsed.assetGroups ?? []) {
      let groupKey = (encodeFileIndexKey_r as (input: unknown) => string)((value as { name?: unknown }).name);
      if (
        !isAssetGroupName((value as { name?: unknown }).name) ||
        Object.hasOwn(index.assetGroups, groupKey)
      ) {
        continue;
      }
      index.assetGroups[groupKey] = {
        name: (value as { name: string }).name,
        ...((value as { tile?: unknown }).tile !== undefined &&
        isAssetTileSize((value as { tile?: unknown }).tile)
          ? {
              tile: (value as { tile: Model.AssetTileSize }).tile,
            }
          : {}),
        order: [...((value as { order?: Iterable<unknown> }).order ?? [])],
        files: {},
      };
      if (!index.groups.includes(groupKey)) {
        index.groups.push(groupKey);
      }
    }
  }
}
function ensureFoldedAssetGroup(
  index: Migration.MigrationWireIndex,
  key: string,
  name: string,
) {
  if (!Object.hasOwn(index.assetGroups, key)) {
    index.assetGroups[key] = {
      name: name,
      order: [],
      files: {},
    };
  }
  return index.assetGroups[key];
}
function removeFoldedBlobReference(
  index: Migration.MigrationWireIndex,
  path: string,
): void {
  let group = assetGroupPathParts(path);
  if (group !== null && Object.hasOwn(index.assetGroups, group.key)) {
    delete index.assetGroups[group.key].files[
      encodeFileIndexKey_r(group.rel)
    ];
  }
  delete index.blobs[encodeFileIndexKey_r(path)];
}
function addFoldedDocumentToIndex(
  index: Migration.MigrationWireIndex,
  path: string,
): void {
  if (path === DESIGN_SYSTEM_PATHS.readme) {
    index.docs.readme = projectFilePath(path);
    return;
  }
  if (!isAdditionalMarkdownPath(path)) {
    return;
  }
  let projectPath = projectFilePath(path);
  index.docs.sections = [
    ...index.docs.sections.filter((sectionPath): boolean => sectionPath !== projectPath),
    projectPath,
  ].sort();
}
async function preflightLegacyStoreMigration(
  migrationOptions: Pick<Migration.DesignSystemMigrationOptions, "files" | "store">,
): Promise<Migration.MigrationPreflight> {
  try {
    let value = await listWritableFiles(migrationOptions.files),
      storeDocuments = await readAllowlistedStoreDocuments(
        migrationOptions.store,
        DESIGN_SYSTEM_STORE_ALLOWLIST,
      ),
      composedFiles = composeStoredSystemFiles(
        storeDocumentDataMap(storeDocuments),
      ),
      unpublishableFiles = filesLeftOutOfMigration(composedFiles.files);
    if (unpublishableFiles.length > 0) {
      return {
        unpublishable: unpublishableFiles,
      };
    }
    let items = [
      ...publishableProjectFiles(composedFiles.files).keys(),
      ...blobFilesOwedToFileStorage(composedFiles.files).map((blobEntry) =>
        projectFilePath(blobEntry.path),
      ),
      ...[...composedFiles.remoteText.keys()].map(projectFilePath),
      ...validDerivedProjectFiles(composedFiles.files).keys(),
    ];
    if (
      new Set([
        ...value.map((fileEntry) => fileEntry.path),
        ...items,
        MIGRATION_SENTINEL_PATH,
        FILES_INDEX_PROJECT_PATH,
      ]).size > ARTIFACT_FILE_CAPACITY.files
    ) {
      return "too_large";
    }
    let values = new Set([
        ...items,
        MIGRATION_SENTINEL_PATH,
        FILES_INDEX_PROJECT_PATH,
      ]),
      totalSize = value
        .filter((entry): boolean => !values.has(entry.path))
        .reduce((total, entry) => total + entry.size, 0);
    for (let document of storeDocuments.values()) {
      totalSize +=
        typeof document.data.data === "string"
          ? document.data.data.length
          : typeof document.data.dataBytes === "number" &&
              !document.path.startsWith(ASSETS_COLLECTION + "/")
            ? document.data.dataBytes
            : 0;
    }
    if (totalSize > ARTIFACT_FILE_CAPACITY.bytes) {
      return "too_large";
    } else {
      return null;
    }
  } catch (value) {
    if (
      (value as { code?: unknown } | null | undefined)?.code ===
      "collection_too_large"
    ) {
      return "too_large";
    } else {
      return null;
    }
  }
}
async function migrateDesignSystemStoreToFiles(
  migrationOptions: Migration.DesignSystemMigrationOptions,
): Promise<Migration.MigrationOutcome> {
  return migrateStoreToFiles({
    adapter: createDesignSystemMigrationAdapter(migrationOptions.fetchBlob),
    versionCaps: ARTIFACT_FILE_CAPACITY,
    files: migrationOptions.files,
    store: migrationOptions.store,
    holder: migrationOptions.holder,
    by: migrationOptions.by,
    timers: migrationOptions.timers,
    ...(migrationOptions.artifactId !== undefined
      ? {
          artifactId: migrationOptions.artifactId,
        }
      : {}),
    sharedExternally: async (): Promise<null> => null,
    embedsArtifacts: async (): Promise<null> => null,
    ...(migrationOptions.onStage !== undefined
      ? {
          onStage: migrationOptions.onStage,
        }
      : {}),
  });
}
function createDesignSystemMigrationAdapter(
  fetchBlob: Migration.FetchMigrationBlob,
  indexPath: string = FILES_INDEX_PROJECT_PATH,
): Migration.MigrationAdapter {
  return {
    type: "design_system",
    indexPath: indexPath,
    metaPath: SYSTEM_META_DOCUMENT_PATH,
    lockPath: DESIGN_SYSTEM_MIGRATION_LOCK_PATH,
    allowlist: DESIGN_SYSTEM_STORE_ALLOWLIST,
    dbRules: designSystemMigrationDbRules(),
    codec: createDesignSystemMigrationCodec(fetchBlob),
    indexHolds: (dataset, path): boolean =>
      path === SYSTEM_SOURCE_DOCUMENT_PATH
        ? dataset.source !== undefined
        : path === SYSTEM_UPGRADED_DOCUMENT_PATH
          ? dataset.upgraded !== undefined
          : false,
  };
}
export {
  addFoldedDocumentToIndex,
  assetGroupPathParts,
  createDesignSystemMigrationAdapter,
  ensureFoldedAssetGroup,
  foldLegacyMetaFields,
  foldLegacyStoreChangesIntoFiles,
  foldLegacyTokenChanges,
  lastStoreFoldSummary,
  migrateDesignSystemStoreToFiles,
  OTHER_VERSION_COPY_SUFFIX,
  otherVersionFileName,
  otherVersionProjectPath,
  preflightLegacyStoreMigration,
  removeFoldedBlobReference,
  storeFoldFileComparison,
  takeStoreFoldSummary,
};
export function installFilesMigrationFold(): () => void {
  return () => {
    lastStoreFoldSummary = {
      kept: [],
      came: false,
    };
    OTHER_VERSION_COPY_SUFFIX = " (other version)";
    assetGroupPathParts = (assetPath) => {
      if (!assetPath.startsWith(DESIGN_SYSTEM_PATHS.assetsDir)) {
        return null;
      }
      let value = assetPath.slice(DESIGN_SYSTEM_PATHS.assetsDir.length),
        separatorIndex = value.indexOf("/");
      if (separatorIndex <= 0) {
        return null;
      } else {
        return {
          key: encodeFileIndexKey_r(value.slice(0, separatorIndex)),
          rel: value.slice(separatorIndex + 1),
        };
      }
    };
  };
}
