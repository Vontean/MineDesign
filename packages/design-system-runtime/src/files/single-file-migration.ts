import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type * as Migration from "../contracts/migration";
import type * as Model from "../contracts";
import { blobFilesOwedToFileStorage, FILES_INDEX_PROJECT_PATH, filesLeftOutOfMigration, isProjectContentPath } from "../editor/files-index";
import { DESIGN_SYSTEM_MIGRATION_LOCK_PATH, designSystemFilesMigrationTree, designSystemMigrationDbRules, DesignSystemMigrationError, materializeMigrationBlobFiles, serializeMigrationIndex } from "./migration-codec";
import { migrateStoreToFiles, MIGRATION_SENTINEL_PATH, migrationVersionSize, parseMigrationSentinel } from "./migration-engine";
import { fileListingIsNarrowed, listWritableFiles, MAX_FILE_PUBLISH_ENCODED_BYTES } from "./paths";
import { parseDesignSystemContent } from "../model/derive-system";
import { DESIGN_SYSTEM_ENVELOPE_PATH, parseDesignSystemEnvelope } from "../model/file-policy";
import { ARTIFACT_FILE_CAPACITY } from "../model/file-table";
import { CONVERTING_MARKER_KEY } from "../model/migration-markers";
import { storageCatalogFromManifest } from "../model/storage";
import { META_DOCUMENT_ID, SYSTEM_COLLECTION, SYSTEM_META_DOCUMENT_PATH } from "../model/stored-file-codec";

var OLDER_SINGLE_FILE_COPY_MESSAGE: string;
var SINGLE_FILE_MIGRATION_BACKUP_PATH: string;
var SINGLE_FILE_REPLACEMENT_CHARACTER: string;
var SINGLE_FILE_SYNTHETIC_META_FIELD: string;
var SINGLE_FILE_MIGRATION_PUBLISH_SPACING_MS: number;
function parseSingleFileDesignSystem(text: string) {
  let parsed = parseDesignSystemEnvelope(text);
  if (typeof parsed === "string") {
    return null;
  }
  return {
    title:
      typeof parsed.envelope.title === "string" ? parsed.envelope.title : "",
    files: {
      ...parseDesignSystemContent(
        parsed.envelope.content,
        undefined,
        {
          unbounded: true,
        },
      ).files,
    },
  };
}
function createSingleFileMigrationStore(
  store: Model.FilesMigrationStore,
  readSingleFile: Migration.ReadSingleFile,
): Model.FilesMigrationStore {
  let fence: unknown,
    syntheticMeta =
      async (): Promise<Model.FilesMigrationStoreDocument | null> => {
        let [value, metaData] = await Promise.all([
          readSingleFile().catch(() => {
            throw Object.assign(Error("upstream_error"), {
              code: "upstream_error",
            });
          }),
          store.get(SYSTEM_META_DOCUMENT_PATH),
        ]);
        if (value === null) {
          return null;
        } else {
          return {
            path: SYSTEM_META_DOCUMENT_PATH,
            data: {
              ...(metaData?.data ?? {}),
              ...(fence !== undefined && fence !== null
                ? {
                    [CONVERTING_MARKER_KEY]: fence,
                  }
                : {}),
              [SINGLE_FILE_SYNTHETIC_META_FIELD]: {
                sha256: value.sha256,
                text: value.text,
              },
            },
          };
        }
      };
  return {
    list: async (
      collectionPath: string,
    ): Promise<Model.FilesMigrationStoreDocument[]> => {
      let value =
        collectionPath === SYSTEM_COLLECTION ? await syntheticMeta() : null;
      if (value === null) {
        return [];
      } else {
        return [value];
      }
    },
    get: (documentId) =>
      documentId === SYSTEM_META_DOCUMENT_PATH
        ? syntheticMeta()
        : store.get(documentId),
    async update(
      documentId: string,
      fields: Record<string, unknown>,
    ): Promise<void> {
      if (documentId !== SYSTEM_META_DOCUMENT_PATH) {
        return store.update(documentId, fields);
      }
      let { [CONVERTING_MARKER_KEY]: value, ...remainingFields } = fields;
      if (Object.hasOwn(fields, CONVERTING_MARKER_KEY)) {
        fence = value;
      }
      if (Object.keys(remainingFields).length === 0) {
        return;
      }
      try {
        await store.update(documentId, remainingFields);
      } catch (error) {
        if (store.set === undefined || (await store.get(documentId)) !== null) {
          throw error;
        }
        await store.set!(documentId, remainingFields);
      }
    },
    ...(store.set !== undefined
      ? {
          set: (documentId, fields) => store.set!(documentId, fields),
        }
      : {}),
    acquire: (documentId, leaseOptions) => store.acquire(documentId, leaseOptions),
  };
}
function createSingleFileMigrationAdapter(
  fetchBlob: Migration.FetchMigrationBlob,
): Migration.SingleFileMigrationAdapter {
  let builtFromSha: string | undefined,
    builtPaths = new Set<string>(),
    codec: Migration.MigrationCodec = {
      async toTree(
        snapshot: Migration.StoreSnapshot,
        migrationOptions?: { preflight?: boolean },
      ): Promise<Migration.MigrationTree> {
        let value = snapshot.get(SYSTEM_META_DOCUMENT_PATH)?.data[
            SINGLE_FILE_SYNTHETIC_META_FIELD
          ] as { text?: unknown; sha256?: unknown } | undefined,
          metaData =
            typeof value?.text === "string"
              ? parseSingleFileDesignSystem(value.text)
              : null;
        if (metaData === null || typeof value?.sha256 !== "string") {
          throw new DesignSystemMigrationError("invalid_content");
        }
        let migrationTree = designSystemFilesMigrationTree(
          {
            title: metaData.title,
            files: await materializeMigrationBlobFiles(
              metaData.files,
              metaData.title,
              fetchBlob,
            ),
            source: null,
            upgraded: null,
          },
          () => [SYSTEM_META_DOCUMENT_PATH],
        );
        if (migrationOptions?.preflight !== true) {
          builtFromSha = value.sha256;
          builtPaths = new Set(migrationTree.files.keys());
        }
        return migrationTree;
      },
      serializeIndex: serializeMigrationIndex,
      fold: (snapshot) => ({
        files: new Map(),
        index: snapshot.index,
        sources: new Map(),
      }),
    };
  return {
    adapter: {
      type: "design_system",
      indexPath: FILES_INDEX_PROJECT_PATH,
      metaPath: SYSTEM_META_DOCUMENT_PATH,
      lockPath: DESIGN_SYSTEM_MIGRATION_LOCK_PATH,
      allowlist: [
        {
          collection: SYSTEM_COLLECTION,
          docId: META_DOCUMENT_ID,
        },
      ],
      dbRules: designSystemMigrationDbRules(),
      codec: codec,
      home: "file",
      kept: () =>
        builtFromSha !== undefined
          ? {
              [SINGLE_FILE_MIGRATION_BACKUP_PATH]: {
                sha256: builtFromSha,
              },
            }
          : {},
      digestView: (document) => ({
        [SINGLE_FILE_SYNTHETIC_META_FIELD]:
          (
            document.data[SINGLE_FILE_SYNTHETIC_META_FIELD] as
              | { sha256?: unknown }
              | undefined
          )?.sha256 ?? null,
      }),
    },
    builtFrom: () => builtFromSha,
    builtPaths: () => builtPaths,
  };
}
function createSingleFileMigrationFiles(
  files: Migration.MigrationFilesPort,
  adapter: Migration.SingleFileMigrationAdapter,
  readSingleFile: Migration.ReadSingleFile,
  timers?: Model.FilesTimers,
): Migration.MigrationFilesPort {
  let needsCleanup: boolean = true,
    backedUpSha: string | undefined,
    wait = () =>
      timers === undefined
        ? Promise.resolve()
        : new Promise<void>(
            (entry) =>
              void timers.setTimeout(
                entry,
                SINGLE_FILE_MIGRATION_PUBLISH_SPACING_MS,
              ),
          );
  return {
    async list(): Promise<Model.FileListing> {
      let value = (await listWritableFiles(files)).filter(
        (entry): boolean => !isProjectContentPath(entry.path),
      );
      if (
        value.some(
          (entry): boolean =>
            entry.path === SINGLE_FILE_MIGRATION_BACKUP_PATH,
        )
      ) {
        return value;
      }
      let singleFile = await readSingleFile().catch((): null => null);
      if (singleFile === null) {
        return value;
      } else {
        return [
          ...value,
          {
            path: SINGLE_FILE_MIGRATION_BACKUP_PATH,
            sha256: "",
            size: new TextEncoder().encode(singleFile.text).length,
            contentType: "application/json",
          },
        ];
      }
    },
    readText: (path) => files.readText(path),
    version: () => files.version(),
    get canWrite() {
      return files.canWrite;
    },
    get narrowed() {
      return files.narrowed;
    },
    get mayWrite() {
      return files.mayWrite;
    },
    async publish(
      publishFiles: Model.FilePublishEntries,
    ): Promise<Model.FilePublishResult> {
      if (needsCleanup) {
        let listing: Model.FileListing;
        try {
          listing = await listWritableFiles(files);
        } catch {
          return {
            ok: false,
            code: "upstream_error",
          };
        }
        let writablePaths = listing
          .map((path) => path.path)
          .filter(
            (path) =>
              isProjectContentPath(path) &&
              !adapter.builtPaths().has(path) &&
              !Object.hasOwn(publishFiles, path),
          );
        for (let index = 0; index < writablePaths.length; index += 200) {
          let publishResult = await files.publish(
            Object.fromEntries(
              writablePaths
                .slice(index, index + 200)
                .map((path) => [path, null]),
            ),
          );
          if (!publishResult.ok) {
            return publishResult;
          }
          await wait();
        }
        needsCleanup = false;
      }
      let value = Object.hasOwn(publishFiles, FILES_INDEX_PROJECT_PATH);
      if (value) {
        let singleFile = await readSingleFile().catch((): null => null);
        if (singleFile === null) {
          return {
            ok: false,
            code: "upstream_error",
          };
        }
        if (singleFile.sha256 !== adapter.builtFrom()) {
          return {
            ok: false,
            code: "conflict",
          };
        }
        if (backedUpSha !== singleFile.sha256) {
          let backupResult = await files.publish({
            [SINGLE_FILE_MIGRATION_BACKUP_PATH]: {
              content: singleFile.text,
              contentType: "application/json",
            },
          });
          if (!backupResult.ok) {
            return backupResult;
          }
          backedUpSha = singleFile.sha256;
          await wait();
        }
      }
      return files.publish(
        value
          ? {
              ...publishFiles,
              [DESIGN_SYSTEM_ENVELOPE_PATH]: null,
            }
          : publishFiles,
      );
    },
  };
}
async function classifySingleFileMigrationSentinel(
  files: Migration.MigrationFilesPort,
  listing: Model.FileListing,
): Promise<string | undefined> {
  if (
    !listing.some(
      (entry): boolean => entry.path === MIGRATION_SENTINEL_PATH,
    )
  ) {
    return "none";
  }
  try {
    if (
      parseMigrationSentinel(
        (await files.readText(MIGRATION_SENTINEL_PATH)).text,
      )?.type === "design_system"
    ) {
      return "ours";
    } else {
      return "none";
    }
  } catch {
    return "unread";
  }
}
async function preflightSingleFileMigration(migrationOptions: {
  files: Migration.MigrationFilesPort;
  text: string;
}): Promise<
  | Migration.MigrationPreflight
  | "not_single_file"
  | "not_now"
  | "moved_before"
> {
  try {
    let value = parseSingleFileDesignSystem(migrationOptions.text);
    if (value === null) {
      return "not_single_file";
    }
    let listing: Model.FileListing;
    try {
      listing = await listWritableFiles(migrationOptions.files);
    } catch {
      return "not_now";
    }
    if (fileListingIsNarrowed(listing, migrationOptions.files)) {
      return "not_now";
    }
    let sentinelKind = await classifySingleFileMigrationSentinel(
      migrationOptions.files,
      listing,
    );
    if (sentinelKind !== "none") {
      if (sentinelKind === "ours") {
        return "moved_before";
      } else {
        return "not_now";
      }
    }
    if (
      new TextEncoder().encode(migrationOptions.text).length >
      MAX_FILE_PUBLISH_ENCODED_BYTES
    ) {
      return "too_large";
    }
    if (migrationOptions.text.includes(SINGLE_FILE_REPLACEMENT_CHARACTER)) {
      return {
        unpublishable: [
          {
            path: DESIGN_SYSTEM_ENVELOPE_PATH,
            reason:
              uiMessage("design-system.singleFileMigration.itHoldsACharacterThat") +
              SINGLE_FILE_REPLACEMENT_CHARACTER +
              "); find it and type it again",
          },
        ],
      };
    }
    let unpublishable = filesLeftOutOfMigration(value.files);
    if (unpublishable.length > 0) {
      return {
        unpublishable: unpublishable,
      };
    }
    let migrationTree = designSystemFilesMigrationTree(
        {
          title: value.title,
          files: Object.freeze({
            ...value.files,
          }),
          source: null,
          upgraded: null,
        },
        () => [],
      ),
      blobPaths = blobFilesOwedToFileStorage(value.files),
      storageCatalog = storageCatalogFromManifest(
        value.files["manifest.json"] ?? "",
      ),
      items = [
        ...listing.filter(
          (entry) =>
            !isProjectContentPath(entry.path) &&
            entry.path !== SINGLE_FILE_MIGRATION_BACKUP_PATH,
        ),
        {
          path: SINGLE_FILE_MIGRATION_BACKUP_PATH,
          size: new TextEncoder().encode(migrationOptions.text).length,
        },
      ],
      sizeSummary = migrationVersionSize(
        items,
        migrationTree,
        FILES_INDEX_PROJECT_PATH,
        serializeMigrationIndex(migrationTree.index),
      );
    if (
      sizeSummary.oversized.length > 0 ||
      sizeSummary.files + blobPaths.length > ARTIFACT_FILE_CAPACITY.files
    ) {
      return "too_large";
    }
    if (
      sizeSummary.bytes +
        blobPaths.reduce(
          (total, entry) =>
            total + (storageCatalog.files[entry.path]?.bytes ?? 0),
          0,
        ) >
      ARTIFACT_FILE_CAPACITY.bytes
    ) {
      return "too_large";
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
async function migrateSingleFileDesignSystem(
  migrationOptions: Migration.DesignSystemMigrationOptions,
): Promise<Migration.MigrationOutcome> {
  let readSingleFile = async (): Promise<Model.FileTextRead> => {
      let value = await migrationOptions.files.readText(
        DESIGN_SYSTEM_ENVELOPE_PATH,
      );
      return {
        text: value.text,
        sha256: value.sha256,
      };
    },
    listing: Model.FileListing;
  try {
    listing = await listWritableFiles(migrationOptions.files);
  } catch (value) {
    if (
      (value as { narrowed?: unknown } | null | undefined)?.narrowed === true
    ) {
      return {
        result: "skipped",
        reason: "narrowed_listing",
      };
    } else {
      return {
        result: "aborted",
        stage: "preflight",
        code: "upstream_error",
        ms: 0,
      };
    }
  }
  if (fileListingIsNarrowed(listing, migrationOptions.files)) {
    return {
      result: "skipped",
      reason: "narrowed_listing",
    };
  }
  let sentinelKind = await classifySingleFileMigrationSentinel(
    migrationOptions.files,
    listing,
  );
  if (sentinelKind === "unread") {
    return {
      result: "aborted",
      stage: "preflight",
      code: "upstream_error",
      ms: 0,
    };
  }
  if (sentinelKind === "ours") {
    return {
      result: "skipped",
      reason: "already_moved",
    };
  }
  let singleFile = await readSingleFile().catch((): null => null);
  if (singleFile === null) {
    return {
      result: "aborted",
      stage: "preflight",
      code: "upstream_error",
      ms: 0,
    };
  }
  if (
    new TextEncoder().encode(singleFile.text).length >
    MAX_FILE_PUBLISH_ENCODED_BYTES
  ) {
    return {
      result: "skipped",
      reason: "too_large",
    };
  }
  let adapter = createSingleFileMigrationAdapter(migrationOptions.fetchBlob);
  return migrateStoreToFiles({
    adapter: adapter.adapter,
    versionCaps: ARTIFACT_FILE_CAPACITY,
    files: createSingleFileMigrationFiles(
      migrationOptions.files,
      adapter,
      readSingleFile,
      migrationOptions.timers,
    ),
    store: createSingleFileMigrationStore(migrationOptions.store, readSingleFile),
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
function get_OLDER_SINGLE_FILE_COPY_MESSAGE() {
  return uiMessage("design-system.singleFileMigration.anOlderCopyOfThis");
}
export {
  classifySingleFileMigrationSentinel,
  createSingleFileMigrationAdapter,
  createSingleFileMigrationFiles,
  createSingleFileMigrationStore,
  migrateSingleFileDesignSystem,
  get_OLDER_SINGLE_FILE_COPY_MESSAGE,
  parseSingleFileDesignSystem,
  preflightSingleFileMigration,
  SINGLE_FILE_MIGRATION_BACKUP_PATH,
  SINGLE_FILE_MIGRATION_PUBLISH_SPACING_MS,
  SINGLE_FILE_REPLACEMENT_CHARACTER,
  SINGLE_FILE_SYNTHETIC_META_FIELD,
};
export function installFilesSingleFileMigration(): () => void {
  return () => {
    OLDER_SINGLE_FILE_COPY_MESSAGE =
      // MineDesign: user-facing copy calls the agent "the agent", not Claude.
      "An older copy of this design system was saved over the current one, and that older copy is what you see. Before editing, ask the agent to compare the two and keep the one you want.";
    SINGLE_FILE_MIGRATION_BACKUP_PATH =
      "project/design-system.before-files.json";
    SINGLE_FILE_REPLACEMENT_CHARACTER = String.fromCharCode(65533);
    SINGLE_FILE_SYNTHETIC_META_FIELD = "singleFile";
    SINGLE_FILE_MIGRATION_PUBLISH_SPACING_MS = 3000;
  };
}
