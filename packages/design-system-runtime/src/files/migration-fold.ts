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
  context: Migration.FoldContext,
  fetchBlob: Migration.FetchMigrationBlob,
): Promise<Migration.FoldTree> {
  let files = new Map<string, Model.FilePublishInput>(),
    sources = new Map<string, string[]>(),
    index = cloneMergeValue(context.index);
  index.assetGroups ??= {};
  index.blobs ??= {};
  index.groups ??= [];
  index.sections ??= {};
  index.docs = {
    ...(index.docs ?? {}),
    sections: [...(index.docs?.sections ?? [])],
  };
  let sentinelRead = await context.readFileState(
    MIGRATION_SENTINEL_PATH,
  );
  if (sentinelRead.state === "unreadable") {
    return {
      files: files,
      index: index,
      sources: sources,
      unfolded: context.changed.map((input) => input.path),
    };
  }
  let sentinel =
      sentinelRead.state === "text"
        ? parseMigrationSentinel(sentinelRead.text)
        : null,
    kept: Migration.FoldSummary["kept"] = [],
    unfolded: string[] = [];
  for (let value of context.changed) {
    if (value.path === SYSTEM_META_DOCUMENT_PATH) {
      await foldLegacyMetaFields(
        index,
        value.data,
        context.recorded.get(SYSTEM_META_DOCUMENT_PATH),
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
      let value5 = projectFilePath(
          DESIGN_SYSTEM_PATHS.tokens,
        ),
        value6 = await context.readFileState(value5);
      if (value6.state === "unreadable") {
        unfolded.push(value.path);
        continue;
      }
      if (
        value6.state === "absent" &&
        sentinel?.files[value5] !== undefined
      ) {
        kept.push({
          path: DESIGN_SYSTEM_PATHS.tokens,
          why: "gone",
        });
        continue;
      }
      let value7 = value6.state === "text" ? value6.text : null,
        value8 =
          value7 === null
            ? null
            : await foldLegacyTokenChanges(
                value7,
                value.data,
                context.recorded.get(SYSTEM_TOKENS_DOCUMENT_PATH),
                sentinel?.files[value5]?.sha256,
              );
      if (value8 !== null) {
        if (value8.clashed) {
          kept.push({
            path: DESIGN_SYSTEM_PATHS.tokens,
            why: "changed",
          });
        }
        if (value8.text !== value7) {
          files.set(
            value5,
            migrationPublishInput(value5, value8.text),
          );
          sources.set(value5, [value.path]);
        }
        if (value8.clashed) {
          let value9 = otherVersionProjectPath(value5);
          files.set(
            value9,
            migrationPublishInput(
              value9,
              JSON.stringify(value.data, null, 2) +
                `
`,
            ),
          );
          sources.set(value9, [value.path]);
        }
        continue;
      }
    }
    let value2 = await legacyStoreSnapshotToFiles(
      new Map([[value.path, value]]),
      fetchBlob,
    );
    for (let value5 of filesLeftOutOfMigration(value2.files)) {
      kept.push({
        path: value5.path,
        why: "cannot",
      });
    }
    for (let [value5, value6] of publishableProjectFiles(
      value2.files,
    )) {
      let value7 = relativeProjectFilePath(value5)!,
        value8 = await storeFoldFileComparison(
          context,
          value5,
          value7,
          sentinel?.files[value5]?.sha256,
        );
      if (value8 === "unreadable") {
        unfolded.push(value.path);
        continue;
      }
      if (value8 !== "same") {
        kept.push({
          path: value7,
          why: value8,
        });
        if (
          value8 === "gone" ||
          !(
            isAdditionalMarkdownPath(value7) ||
            value7 === DESIGN_SYSTEM_PATHS.readme ||
            value7.endsWith(".json")
          )
        ) {
          continue;
        }
        let value9 = otherVersionProjectPath(value5);
        files.set(value9, migrationPublishInput(value9, value6));
        sources.set(value9, [value.path]);
        addFoldedDocumentToIndex(
          index,
          relativeProjectFilePath(value9)!,
        );
        continue;
      }
      files.set(value5, migrationPublishInput(value5, value6));
      sources.set(value5, [value.path]);
      removeFoldedBlobReference(index, value7);
      addFoldedDocumentToIndex(index, value7);
    }
    let value3 = buildFilesIndex("", value2.files),
      value4: boolean =
        (await hashCanonicalIndex(value.data.dataRef)) !==
        context.recorded.get(value.path)?.dataRef;
    for (let [value5, value6] of Object.entries(value3.assetGroups)) {
      for (let [value7, value8] of Object.entries(value6.files)) {
        let value9 = Object.hasOwn(index.assetGroups, value5)
          ? index.assetGroups[value5].files[value7]
          : undefined;
        if (
          value9 !== undefined &&
          (!value4 || value9.blob === value8.blob)
        ) {
          continue;
        }
        if (
          value9 === undefined &&
          context.recorded.has(value.path) &&
          !value4
        ) {
          continue;
        }
        let value10 = ensureFoldedAssetGroup(index, value5, value6.name);
        if (!index.groups.includes(value5)) {
          index.groups.push(value5);
        }
        if (value9 === undefined) {
          value10.files[value7] = value8;
          continue;
        }
        let value11 = otherVersionFileName(value8.name);
        value10.files[encodeFileIndexKey_r(value11)] = {
          ...value8,
          name: value11,
        };
        kept.push({
          path:
            DESIGN_SYSTEM_PATHS.assetsDir +
            value6.name +
            "/" +
            value8.name,
          why: "changed",
        });
      }
    }
    for (let [value5, value6] of Object.entries(value3.blobs)) {
      if (!Object.hasOwn(index.blobs, value5)) {
        index.blobs[value5] = value6;
      }
    }
  }
  lastStoreFoldSummary = {
    kept: kept,
    came:
      [...files.keys()].some(
        (input): boolean => !input.includes(OTHER_VERSION_COPY_SUFFIX),
      ) ||
      serializeIndexDocument(index) !==
        serializeIndexDocument(context.index),
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
    isNamedToken = (input: unknown): input is Migration.NamedLegacyToken =>
      typeof input === "object" &&
      input !== null &&
      typeof (input as { name?: unknown }).name === "string";
  for (let [value, value2] of Object.entries(storeTokens)) {
    if (
      (await hashCanonicalIndex(value2)) ===
      recordedFields?.[value]
    ) {
      continue;
    }
    let value3 = (fileTokens as Record<string, unknown>)[value];
    if (
      value3 === undefined ||
      (recordedFields !== undefined &&
        (await hashCanonicalIndex(value3)) ===
          recordedFields[value])
    ) {
      (fileTokens as Record<string, unknown>)[value] = value2;
      continue;
    }
    if (
      serializeIndexDocument(value3) ===
      serializeIndexDocument(value2)
    ) {
      continue;
    }
    let value4 = (value3 as { tokens?: unknown } | null | undefined)?.tokens,
      value5 = (value2 as { tokens?: unknown } | null | undefined)?.tokens;
    if (
      !Array.isArray(value4) ||
      !Array.isArray(value5) ||
      !value4.every(isNamedToken) ||
      !value5.every(isNamedToken)
    ) {
      clashed = true;
      continue;
    }
    for (let [value6, value7] of Object.entries(
      value2 as Record<string, unknown>,
    )) {
      if (value6 === "tokens") {
        continue;
      }
      let value8 = (value3 as Record<string, unknown>)[value6];
      if (value8 === undefined) {
        (value3 as Record<string, unknown>)[value6] = value7;
      } else if (
        serializeIndexDocument(value8) !==
        serializeIndexDocument(value7)
      ) {
        clashed = true;
      }
    }
    let entries = new Map(value4.map((input) => [input.name, input]));
    for (let value6 of value5) {
      let entry = entries.get(value6.name);
      if (entry === undefined) {
        value4.push(value6);
      } else if (
        serializeIndexDocument(entry) !==
        serializeIndexDocument(value6)
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
  context: Migration.FoldContext,
  projectPath: string,
  relative: string,
  recordedSha?: string,
): Promise<string> {
  let current = await context.readFileState(projectPath);
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
  let fieldChanged = async (input: string): Promise<boolean> =>
    Object.hasOwn(meta, input) &&
    (await hashCanonicalIndex(meta[input])) !==
      recordedFields?.[input];
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
    for (let [value, value2] of Object.entries(parsed.sections ?? {})) {
      if (
        typeof value2 === "string" &&
        !["__proto__", "constructor", "prototype"].includes(
          encodeFileIndexKey_r(value),
        ) &&
        !Object.hasOwn(index.sections, encodeFileIndexKey_r(value))
      ) {
        index.sections[encodeFileIndexKey_r(value)] = value2;
      }
    }
  }
  if (await fieldChanged("assetGroups")) {
    for (let value of parsed.assetGroups ?? []) {
      let value2 = (0,
      (runtime as { encodeFileIndexKey(input: unknown): string })
        .encodeFileIndexKey)((value as { name?: unknown }).name);
      if (
        !isAssetGroupName((value as { name?: unknown }).name) ||
        Object.hasOwn(index.assetGroups, value2)
      ) {
        continue;
      }
      index.assetGroups[value2] = {
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
      if (!index.groups.includes(value2)) {
        index.groups.push(value2);
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
    ...index.docs.sections.filter((input): boolean => input !== projectPath),
    projectPath,
  ].sort();
}
async function preflightLegacyStoreMigration(
  options: Pick<Migration.DesignSystemMigrationOptions, "files" | "store">,
): Promise<Migration.MigrationPreflight> {
  try {
    let value = await listWritableFiles(options.files),
      value2 = await readAllowlistedStoreDocuments(
        options.store,
        DESIGN_SYSTEM_STORE_ALLOWLIST,
      ),
      value3 = composeStoredSystemFiles(
        storeDocumentDataMap(value2),
      ),
      value4 = filesLeftOutOfMigration(value3.files);
    if (value4.length > 0) {
      return {
        unpublishable: value4,
      };
    }
    let items = [
      ...publishableProjectFiles(value3.files).keys(),
      ...blobFilesOwedToFileStorage(value3.files).map((input) =>
        projectFilePath(input.path),
      ),
      ...[...value3.remoteText.keys()].map(projectFilePath),
      ...validDerivedProjectFiles(value3.files).keys(),
    ];
    if (
      new Set([
        ...value.map((input) => input.path),
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
      value5 = value
        .filter((input): boolean => !values.has(input.path))
        .reduce((input, options2) => input + options2.size, 0);
    for (let value6 of value2.values()) {
      value5 +=
        typeof value6.data.data === "string"
          ? value6.data.data.length
          : typeof value6.data.dataBytes === "number" &&
              !value6.path.startsWith(ASSETS_COLLECTION + "/")
            ? value6.data.dataBytes
            : 0;
    }
    if (value5 > ARTIFACT_FILE_CAPACITY.bytes) {
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
  options: Migration.DesignSystemMigrationOptions,
): Promise<Migration.MigrationOutcome> {
  return migrateStoreToFiles({
    adapter: createDesignSystemMigrationAdapter(options.fetchBlob),
    versionCaps: ARTIFACT_FILE_CAPACITY,
    files: options.files,
    store: options.store,
    holder: options.holder,
    by: options.by,
    timers: options.timers,
    ...(options.artifactId !== undefined
      ? {
          artifactId: options.artifactId,
        }
      : {}),
    sharedExternally: async (): Promise<null> => null,
    embedsArtifacts: async (): Promise<null> => null,
    ...(options.onStage !== undefined
      ? {
          onStage: options.onStage,
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
    indexHolds: (dataset, options): boolean =>
      options === SYSTEM_SOURCE_DOCUMENT_PATH
        ? dataset.source !== undefined
        : options === SYSTEM_UPGRADED_DOCUMENT_PATH
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
    assetGroupPathParts = (input) => {
      if (!input.startsWith(DESIGN_SYSTEM_PATHS.assetsDir)) {
        return null;
      }
      let value = input.slice(DESIGN_SYSTEM_PATHS.assetsDir.length),
        value2 = value.indexOf("/");
      if (value2 <= 0) {
        return null;
      } else {
        return {
          key: encodeFileIndexKey_r(value.slice(0, value2)),
          rel: value.slice(value2 + 1),
        };
      }
    };
  };
}
