import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type * as Migration from "../contracts/migration";
import type * as Model from "../contracts";
import { blobFilesOwedToFileStorage, buildFilesIndex, createEmptyFilesIndex, filesLeftOutOfMigration, isTextMimeType, publishableFileMimeType, publishableProjectFiles, relativeProjectFilePath, validDerivedProjectFiles } from "../editor/files-index";
import { serializeIndexDocument } from "../editor/index-file-store";
import { bytesToFileDataUri, decodeHeldFileDataUri } from "./data-uri";
import { isDownloadOnlyPublishInput } from "./design-system-port";
import { foldLegacyStoreChangesIntoFiles } from "./migration-fold";
import { buildDesignSystemManifest, parsedDesignSystem, stringifyManifestWithinBudget } from "../model/derive-system";
import { DESIGN_SYSTEM_PATHS, isTextFilePath } from "../model/file-policy";
import { ARTIFACT_FILE_CAPACITY } from "../model/file-table";
import { storageCatalogFromManifest } from "../model/storage";
import { composeStoredSystemFiles, hydrateStoredSystemText } from "../model/store-compose";
import { ASSETS_COLLECTION, blobIdFromReference, COMPONENTS_COLLECTION, documentPathForFile, FILES_COLLECTION, FONTS_COLLECTION, META_DOCUMENT_ID, PREVIEWS_COLLECTION, RAW_TOKENS_DOCUMENT_PATH, SOURCE_DOCUMENT_ID, SYSTEM_COLLECTION, SYSTEM_SOURCE_DOCUMENT_PATH, SYSTEM_TOKENS_DOCUMENT_PATH, SYSTEM_UPGRADED_DOCUMENT_PATH, TOKENS_DOCUMENT_ID, UPGRADED_DOCUMENT_ID } from "../model/stored-file-codec";

var FILES_MIGRATION_CAPABILITIES_JSON: string;
var DESIGN_SYSTEM_MIGRATION_LOCK_PATH: string;
var MAX_DESIGN_SYSTEM_INDEX_CHARS: number;
var MIGRATION_GREW_TOO_LARGE_MESSAGE: string;
var MIGRATION_TOO_LARGE_MESSAGE: string;
var DESIGN_SYSTEM_STORE_ALLOWLIST: Model.FilesMigrationAllowlistEntry[];
var DesignSystemMigrationError: new (
  code: string,
) => Error & { code: string };
var storeDocumentDataMap: (
  snapshot: Migration.StoreSnapshot,
) => Map<string, Record<string, unknown>>;
var finalizeMigrationFiles: (
  files: Record<string, string>,
  title: string,
) => Model.FileTable;
var lastUnpublishableMigrationPaths: string[];
var migrationFileSourceDocuments: (
  path: string,
  snapshot: Migration.StoreSnapshot,
) => string[];
function designSystemMigrationNextAction(
  outcome: Migration.MigrationOutcome,
): Migration.MigrationNextAction {
  if (outcome.result === "converted") {
    return {
      next: "reload",
      why: "converted",
    };
  }
  if (outcome.result === "busy") {
    return {
      next: "wait",
      why: "busy",
    };
  }
  if (outcome.result === "skipped" && outcome.reason === "narrowed_listing") {
    return {
      next: "stay",
      why: outcome.reason,
      again: true,
    };
  }
  if (outcome.result === "skipped") {
    if (
      outcome.reason === "already_files" ||
      outcome.reason === "already_moved"
    ) {
      return {
        next: "reload",
        why: outcome.reason,
      };
    } else {
      return {
        next: "stay",
        why: outcome.reason,
        ...(outcome.reason === "too_large"
          ? {
              notice: MIGRATION_TOO_LARGE_MESSAGE,
            }
          : {}),
      };
    }
  }
  return {
    next: "stay",
    get why() { return ((outcome.stage) + (": ")) + (outcome.code); },
    ...(outcome.code === "collection_too_large"
      ? {
          notice: MIGRATION_TOO_LARGE_MESSAGE,
        }
      : outcome.code === "too_large"
        ? {
            notice: MIGRATION_GREW_TOO_LARGE_MESSAGE,
          }
        : {}),
  };
}
function designSystemMigrationDbRules() {
  return (
    (
      JSON.parse(FILES_MIGRATION_CAPABILITIES_JSON) as {
        db?: { rules?: Migration.DatabaseRule[] };
      }
    ).db?.rules ?? []
  );
}
function migrationPublishInput(path: string, content: string) {
  let relative = (0, relativeProjectFilePath)(path),
    mime = (0, publishableFileMimeType)(relative, content);
  if (mime === null) {
    throw new DesignSystemMigrationError("unpublishable_file");
  }
  if ((0, isTextFilePath)(relative!)) {
    return {
      content: content,
      contentType: mime,
    };
  }
  let decoded = (0, decodeHeldFileDataUri)(content);
  if (decoded === null) {
    throw new DesignSystemMigrationError("invalid_content");
  }
  if ((0, isTextMimeType)(mime)) {
    return {
      content: new TextDecoder("utf-8", {
        ignoreBOM: true,
      }).decode(decoded.bytes),
      contentType: mime,
    };
  }
  return {
    content: new Blob([decoded.bytes], {
      type: mime,
    }),
    contentType: mime,
  };
}
async function legacyStoreSnapshotToFiles(
  snapshot: Migration.StoreSnapshot,
  fetchBlob: Migration.FetchMigrationBlob,
): Promise<Migration.LegacyMigrationSystem> {
  let state = (0, composeStoredSystemFiles)(
      storeDocumentDataMap(snapshot),
    ),
    remoteText = new Map<string, string>();
  for (let [value, value2] of state.remoteText) {
    remoteText.set(
      value,
      new TextDecoder().decode(
        await readMigrationBlob(
          fetchBlob,
          (0, blobIdFromReference)(value2.dataRef),
          typeof value2.dataBytes === "number" ? value2.dataBytes : undefined,
        ),
      ),
    );
  }
  return {
    title: state.title,
    files: await materializeMigrationBlobFiles(
      {
        ...(0, hydrateStoredSystemText)(state, remoteText),
      },
      state.title,
      fetchBlob,
    ),
    source: state.source,
    upgraded: state.upgraded,
  };
}
async function readMigrationBlob(
  fetchBlob: Migration.FetchMigrationBlob,
  blobId: string | null,
  expectedBytes?: number,
): Promise<Uint8Array<ArrayBuffer>> {
  let blob = blobId === null ? null : await fetchBlob(blobId);
  if (
    blob === null ||
    blob.bytes.length === 0 ||
    (expectedBytes !== undefined &&
      expectedBytes > 0 &&
      blob.bytes.length !== expectedBytes)
  ) {
    throw new DesignSystemMigrationError("blob_unreadable");
  }
  return blob.bytes;
}
async function materializeMigrationBlobFiles(
  files: Record<string, string>,
  title: string,
  fetchBlob: Migration.FetchMigrationBlob,
): Promise<Model.FileTable> {
  let manifest = (0, storageCatalogFromManifest)(
    files[DESIGN_SYSTEM_PATHS.manifest] ?? "",
  );
  for (let { path: value, id: value2 } of (0,
  blobFilesOwedToFileStorage)(files)) {
    let value3 = await readMigrationBlob(
      fetchBlob,
      value2,
      manifest.files[value]?.bytes,
    );
    files[value] = (0, isTextFilePath)(value)
      ? new TextDecoder().decode(value3)
      : (0, bytesToFileDataUri)(
          value3,
          (0, publishableFileMimeType)(value) ??
            "application/octet-stream",
        );
  }
  return finalizeMigrationFiles(files, title);
}
function designSystemFilesMigrationTree(
  system: Migration.LegacyMigrationSystem,
  sourcesFor: (path: string) => string[],
) {
  lastUnpublishableMigrationPaths = (0, filesLeftOutOfMigration)(
    system.files,
  ).map((input) => input.path);
  if (lastUnpublishableMigrationPaths.length > 0) {
    throw new DesignSystemMigrationError("unpublishable_file");
  }
  let files = new Map<string, Model.FilePublishInput>(),
    sources = new Map<string, string[]>();
  for (let [value, value2] of (0, publishableProjectFiles)(
    system.files,
  )) {
    files.set(value, migrationPublishInput(value, value2));
    sources.set(
      value,
      sourcesFor((0, relativeProjectFilePath)(value)!),
    );
  }
  for (let [value, value2] of (0, validDerivedProjectFiles)(
    system.files,
  )) {
    files.set(value, {
      content: value2,
      contentType:
        (0, publishableFileMimeType)(
          (0, relativeProjectFilePath)(value),
        ) ?? "text/plain",
    });
  }
  let index = (0, buildFilesIndex)(system.title, system.files, {
    ...(0, createEmptyFilesIndex)(),
    ...(system.source !== null
      ? {
          source: {
            ...system.source,
          },
        }
      : {}),
    ...(system.upgraded !== null
      ? {
          upgraded: {
            ...system.upgraded,
          },
        }
      : {}),
  });
  return {
    files: files,
    index: index,
    sources: sources,
  };
}
function takeUnpublishableMigrationPaths() {
  let paths = lastUnpublishableMigrationPaths;
  lastUnpublishableMigrationPaths = [];
  return paths;
}
function trackMigrationDownloadFailures(files: Model.BrowserFilesPort) {
  let refusedDownloads: string[] = [],
    instrumented: Model.BrowserFilesPort = Object.create(files);
  instrumented.publish = async (
    input: Model.FilePublishEntries,
    options?: Model.FilePublishPreconditions,
  ): Promise<Model.FilePublishResult> => {
    let value = await files.publish(input, options);
    if (!value.ok && value.code === "invalid_content") {
      refusedDownloads = Object.entries(input)
        .filter(([, input2]) =>
          (0, isDownloadOnlyPublishInput)(input2),
        )
        .map(
          ([input2]) =>
            (0, relativeProjectFilePath)(input2) ?? input2,
        );
    }
    return value;
  };
  return {
    files: instrumented,
    downloadsRefused: () => refusedDownloads,
  };
}
function serializeMigrationIndex(index: unknown) {
  let text = (0, serializeIndexDocument)(index);
  if (text.length > MAX_DESIGN_SYSTEM_INDEX_CHARS) {
    throw new DesignSystemMigrationError("index_too_large");
  }
  return text;
}
function migrationIndexSourceDocuments(
  index: Pick<Model.FilesIndex, "source" | "upgraded">,
  snapshot: Migration.StoreSnapshot,
) {
  return [
    ...(index.source !== undefined
      ? [SYSTEM_SOURCE_DOCUMENT_PATH]
      : []),
    ...(index.upgraded !== undefined
      ? [SYSTEM_UPGRADED_DOCUMENT_PATH]
      : []),
  ].filter((input) => snapshot.has(input));
}
function createDesignSystemMigrationCodec(
  fetchBlob: Migration.FetchMigrationBlob,
): Migration.MigrationCodec {
  return {
    async toTree(
      input: Migration.StoreSnapshot,
    ): Promise<Migration.MigrationTree> {
      let value = designSystemFilesMigrationTree(
        await legacyStoreSnapshotToFiles(input, fetchBlob),
        (input2) => migrationFileSourceDocuments(input2, input),
      );
      return {
        ...value,
        indexSources: migrationIndexSourceDocuments(value.index, input),
      };
    },
    serializeIndex: serializeMigrationIndex,
    fold: (input) =>
      (0, foldLegacyStoreChangesIntoFiles)(input, fetchBlob),
  };
}
export {
  createDesignSystemMigrationCodec,
  DESIGN_SYSTEM_MIGRATION_LOCK_PATH,
  DESIGN_SYSTEM_STORE_ALLOWLIST,
  designSystemFilesMigrationTree,
  designSystemMigrationDbRules,
  DesignSystemMigrationError,
  designSystemMigrationNextAction,
  FILES_MIGRATION_CAPABILITIES_JSON,
  finalizeMigrationFiles,
  lastUnpublishableMigrationPaths,
  legacyStoreSnapshotToFiles,
  materializeMigrationBlobFiles,
  MAX_DESIGN_SYSTEM_INDEX_CHARS,
  MIGRATION_GREW_TOO_LARGE_MESSAGE,
  MIGRATION_TOO_LARGE_MESSAGE,
  migrationFileSourceDocuments,
  migrationIndexSourceDocuments,
  migrationPublishInput,
  readMigrationBlob,
  serializeMigrationIndex,
  storeDocumentDataMap,
  takeUnpublishableMigrationPaths,
  trackMigrationDownloadFailures,
};
export function installFilesMigrationCodec(): () => void {
  return () => {
    FILES_MIGRATION_CAPABILITIES_JSON =
      '{"artifact":{},"downloads":{},"user":{"scopes":["profile"]},"assets":{},"comments":{"composer_only":true,"customAnchors":true},"room":{},"db":{"rules":[{"path":"","write":"admin"}]}}';
    DESIGN_SYSTEM_MIGRATION_LOCK_PATH =
      SYSTEM_COLLECTION + "/convert-lock";
    MAX_DESIGN_SYSTEM_INDEX_CHARS = 2000000;
    MIGRATION_GREW_TOO_LARGE_MESSAGE =
      uiMessage("design-system.migrationCodec.thisDesignSystemWasBeing") +
      String(ARTIFACT_FILE_CAPACITY.files) +
      " files or " +
      String(ARTIFACT_FILE_CAPACITY.bytes / 1048576) +
      " MB), so it stays as it is. Nothing is needed from you.";
    MIGRATION_TOO_LARGE_MESSAGE =
      uiMessage("design-system.migrationCodec.thisDesignSystemWasGoing") +
      String(ARTIFACT_FILE_CAPACITY.files) +
      " files or " +
      String(ARTIFACT_FILE_CAPACITY.bytes / 1048576) +
      " MB), so it stays as it is. Nothing was changed, and nothing is needed from you.";
    DESIGN_SYSTEM_STORE_ALLOWLIST = [
      {
        collection: SYSTEM_COLLECTION,
        docId: META_DOCUMENT_ID,
      },
      {
        collection: SYSTEM_COLLECTION,
        docId: TOKENS_DOCUMENT_ID,
      },
      {
        collection: SYSTEM_COLLECTION,
        docId: SOURCE_DOCUMENT_ID,
      },
      {
        collection: SYSTEM_COLLECTION,
        docId: UPGRADED_DOCUMENT_ID,
      },
      {
        collection: FONTS_COLLECTION,
      },
      {
        collection: FILES_COLLECTION,
      },
      {
        collection: ASSETS_COLLECTION,
      },
      {
        collection: COMPONENTS_COLLECTION,
      },
      {
        collection: PREVIEWS_COLLECTION,
      },
    ];
    DesignSystemMigrationError = class DesignSystemMigrationError extends (
      Error
    ) {
      code: string;
      constructor(input: string) {
        super(input);
        this.code = input;
      }
    };
    storeDocumentDataMap = (snapshot) =>
      new Map([...snapshot].map(([input, input2]) => [input, input2.data]));
    finalizeMigrationFiles = (input, options) => {
      input[DESIGN_SYSTEM_PATHS.manifest] = (0,
      stringifyManifestWithinBudget)(
        (0, buildDesignSystemManifest)(
          (0, parsedDesignSystem)({
            v: 2,
            files: {
              ...input,
            },
          }),
          options,
        ),
      );
      return Object.freeze(
        Object.fromEntries(
          Object.keys(input)
            .sort()
            .map((input2) => [input2, input[input2]]),
        ),
      );
    };
    lastUnpublishableMigrationPaths = [];
    migrationFileSourceDocuments = (input, options) => {
      let value =
        input === DESIGN_SYSTEM_PATHS.tokens &&
        !options.has(SYSTEM_TOKENS_DOCUMENT_PATH)
          ? RAW_TOKENS_DOCUMENT_PATH
          : (0, documentPathForFile)(input);
      if (options.has(value)) {
        return [value];
      } else {
        return [];
      }
    };
  };
}
