/** Restored application module; prepare first, initialize in original order. */
import type * as Migration from "../contracts/migration";
import type * as Model from "../contracts";
import type * as Files from "../contracts/files-core";
import type * as Storage from "../contracts/model-storage";
import { serializeIndexDocument, sha256 } from "../editor/index-file-store";
import { canonicalFilePathWithinPrefix, damagedTextFiles, DEFAULT_FILE_VERSION_CAPS, fileContentBytes, fileContentContainsRuntimeMarkers, filePublishEncodedBytes, filePublishRawBytes, isPrivateProjectFile, listWritableFiles, MAX_FILE_PUBLISH_ENCODED_BYTES, MIGRATION_MANIFEST_PATH, normalizeFilePublishInput, PROJECT_FILE_PREFIX, readJsonFileState, removeUnpublishableMigrationFiles, validateFilePath } from "./paths";
import { activeConvertingMarker, CONVERTED_FROM_MARKER_KEY, convertedFromMarker, CONVERTING_MARKER_KEY, MIGRATION_LOCK_TTL_MS, MOVED_TO_MARKER_KEY, movedToMarker, readConvertingMarker, readFileMigrationMarker, readMovedToMarker } from "../model/migration-markers";

var isPublishableFilePath: (path: string) => boolean;
var MIGRATION_LEASE_TTL_MS: number;
var MIGRATION_LEASE_RENEWAL_MS: number;
var MIGRATION_BATCH_MAX_FILES: number;
var MIGRATION_BATCH_MAX_BYTES: number;
var MIGRATION_PUBLISH_SPACING_MS: number;
var MIGRATION_MAX_STORE_RECHECKS: number;
var MIGRATION_RETRY_INITIAL_MS: number;
var MIGRATION_RETRY_MAX_MS: number;
var MIGRATION_PUBLISH_RETRY_WINDOW_MS: number;
var MIGRATION_UPSTREAM_RETRY_WINDOW_MS: number;
var LEGACY_DATABASE_LIST_LIMIT: number;
var MIGRATION_SENTINEL_PATH: string;
var MigrationConfigError: new (message: string) => Error;
var PUBLIC_STORE_READ_LEVELS: string[];
var storePathParts: (path: string) => string[];
var storePathHasPrefix: (parts: string[], prefix: string[]) => boolean;
var allowlistedStorePath: (
  entry: Model.FilesMigrationAllowlistEntry,
) => string;
var MIGRATION_INTERNAL_META_FIELDS: string[];
var MigrationLimitError: new (code: string) => Error & { code: string };
var storeDocumentDigestView: (
  document: Model.FilesMigrationStoreDocument,
  adapter?: Pick<Migration.MigrationAdapter, "digestView">,
) => Record<string, unknown>;
var migrationErrorCode: (error: unknown) => string;
function storeReadAccessLevel(path: string, rules: Migration.DatabaseRule[]) {
  let parts = storePathParts(path);
  if (parts[0] === "data" && parts[1] === "users") {
    return "private";
  }
  let level = "view",
    longestMatch = -1;
  for (let value of rules) {
    let pathParts = storePathParts(value.path);
    if (pathParts[pathParts.length - 1] === "{self}") {
      if (
        storePathHasPrefix(parts, pathParts.slice(0, -1)) &&
        parts.length >= pathParts.length
      ) {
        return "private";
      }
      continue;
    }
    if (
      !storePathHasPrefix(parts, pathParts) ||
      value.read === undefined ||
      pathParts.length < longestMatch
    ) {
      continue;
    }
    level = value.read;
    longestMatch = pathParts.length;
  }
  if (PUBLIC_STORE_READ_LEVELS.includes(level)) {
    return level;
  } else {
    return "private";
  }
}
function validateMigrationAllowlist(
  adapter: Pick<Migration.MigrationAdapter<object>, "allowlist" | "dbRules">,
): void {
  for (let value of adapter.allowlist) {
    let storePath = allowlistedStorePath(value);
    if (
      [
        ...value.collection.split("/"),
        ...(value.docId === undefined ? [] : [value.docId]),
      ].some(
        (segment) =>
          !/^[A-Za-z0-9_.~:@+-]+$/.test(segment) ||
          segment === "." ||
          segment === "..",
      )
    ) {
      throw new MigrationConfigError(
        "not a store path: " + JSON.stringify(storePath),
      );
    }
    let pathParts = storePathParts(storePath),
      items = [storeReadAccessLevel(storePath, adapter.dbRules)];
    for (let rule of adapter.dbRules) {
      let ruleParts = storePathParts(rule.path);
      if (
        ruleParts.length > pathParts.length &&
        storePathHasPrefix(ruleParts, pathParts)
      ) {
        items.push(
          ruleParts[ruleParts.length - 1] === "{self}"
            ? "private"
            : storeReadAccessLevel(rule.path, adapter.dbRules),
        );
      }
    }
    let specificAccess = items.find((access): boolean => access !== "view");
    if (specificAccess !== undefined) {
      throw new MigrationConfigError(
        "store kind " +
          JSON.stringify(storePath) +
          " is readable only at " +
          specificAccess +
          ": it must not be in the allowlist",
      );
    }
  }
}
async function hashStoreDocument(
  document: Record<string, unknown>,
  secretFields: string[] = [],
): Promise<string> {
  let filtered: Record<string, unknown> = {};
  for (let [value, fieldValue] of Object.entries(document)) {
    if (
      !MIGRATION_INTERNAL_META_FIELDS.includes(value) &&
      !secretFields.includes(value)
    ) {
      filtered[value] = fieldValue;
    }
  }
  return sha256(serializeIndexDocument(filtered));
}
async function readAllowlistedStoreDocuments(
  store: Model.FilesMigrationStore,
  allowlist: Model.FilesMigrationAllowlistEntry[],
): Promise<Migration.StoreSnapshot> {
  let documents: Migration.StoreSnapshot = new Map();
  for (let value of allowlist) {
    if (value.docId !== undefined) {
      let document = await store.get(allowlistedStorePath(value));
      if (document !== null && document.path === allowlistedStorePath(value)) {
        documents.set(document.path, document);
      }
      continue;
    }
    let collectionDocs = await store.list(value.collection);
    if (collectionDocs.length >= LEGACY_DATABASE_LIST_LIMIT) {
      throw new MigrationLimitError("collection_too_large");
    }
    for (let document of collectionDocs) {
      if (
        document.path.startsWith(value.collection + "/") &&
        !document.path.slice(value.collection.length + 1).includes("/")
      ) {
        documents.set(document.path, document);
      }
    }
  }
  return documents;
}
function hashCanonicalIndex(indexValue: unknown) {
  return sha256(
    serializeIndexDocument(indexValue === undefined ? null : indexValue),
  );
}
async function hashStoreFields(
  document: Record<string, unknown>,
  secretFields: string[] = [],
): Promise<Record<string, string>> {
  let fields: Record<string, string> = {};
  for (let [value, fieldValue] of Object.entries(document)) {
    if (
      !MIGRATION_INTERNAL_META_FIELDS.includes(value) &&
      !secretFields.includes(value)
    ) {
      fields[value] = await hashCanonicalIndex(fieldValue);
    }
  }
  return fields;
}
async function hashStoreSnapshot(
  snapshot: Migration.StoreSnapshot,
  adapter: Pick<
    Migration.MigrationAdapter<object>,
    "secretFields" | "digestView"
  > = {},
): Promise<Map<string, string>> {
  let digests = new Map<string, string>();
  for (let [value, document] of snapshot) {
    digests.set(
      value,
      await hashStoreDocument(
        storeDocumentDigestView(document, adapter),
        adapter.secretFields,
      ),
    );
  }
  return digests;
}
function parseMigrationSentinel(text: string | null) {
  if (text === null) {
    return null;
  }
  try {
    let value: unknown = JSON.parse(text),
      callback = (candidateValue: unknown): candidateValue is Record<string, unknown> =>
        typeof candidateValue === "object" && candidateValue !== null && !Array.isArray(candidateValue);
    if (
      value !== null &&
      ((value as { v?: unknown }).v === 1 ||
        (value as { v?: unknown }).v === 2) &&
      callback((value as { documents?: unknown }).documents) &&
      callback((value as { files?: unknown }).files)
    ) {
      return value as Model.FilesMigrationSentinel;
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
function migrationSentinelMatchesArtifact(
  sentinel: Model.FilesMigrationSentinel,
  artifactId?: string,
) {
  return (
    sentinel.artifact === undefined ||
    artifactId === undefined ||
    sentinel.artifact === artifactId
  );
}
function splitMigrationPublishBatches(entries: Model.FilePublishEntries) {
  let batches: Model.FilePublishEntries[] = [],
    batch: Model.FilePublishEntries = {},
    count = 0,
    bytes = 0;
  for (let [value, fileContent] of Object.entries(entries)) {
    let encodedBytes = filePublishEncodedBytes(fileContent);
    if (
      count > 0 &&
      (count + 1 > MIGRATION_BATCH_MAX_FILES ||
        bytes + encodedBytes > MIGRATION_BATCH_MAX_BYTES)
    ) {
      batches.push(batch);
      batch = {};
      count = 0;
      bytes = 0;
    }
    batch[value] = fileContent;
    count += 1;
    bytes += encodedBytes;
  }
  if (count > 0) {
    batches.push(batch);
  }
  return batches;
}
function createMigrationPublisher(
  files: Migration.MigrationFilesPort,
  timers: Model.FilesTimers,
  stillOwnsLease: () => boolean | Promise<boolean> = (): boolean => true,
) {
  let lastAttemptAt = -1 / 0,
    calls = 0,
    wait = (delayMs: number) =>
      new Promise<void>((resolve) => void timers.setTimeout(resolve, delayMs));
  return {
    calls: () => calls,
    async publish(
      publishEntries: Model.FilePublishEntries,
      preconditions?: Model.FilePublishPreconditions,
    ): Promise<Model.FilePublishResult> {
      let value = timers.now(),
        retryDelay: number = MIGRATION_RETRY_INITIAL_MS,
        failure: Model.FilePublishFailure | undefined;
      for (;;) {
        let nextDelay: number =
          MIGRATION_PUBLISH_SPACING_MS - (timers.now() - lastAttemptAt);
        if (nextDelay > 0) {
          await wait(nextDelay);
        }
        if (!(await stillOwnsLease())) {
          return (
            failure ?? {
              ok: false,
              code: "conflict",
            }
          );
        }
        lastAttemptAt = timers.now();
        calls += 1;
        let publishResult: Model.FilePublishResult;
        try {
          publishResult = await files.publish(publishEntries, preconditions);
        } catch {
          publishResult = {
            ok: false,
            code: "upstream_error",
          };
        }
        if (publishResult.ok) {
          return publishResult;
        }
        failure = publishResult;
        if (
          !(
            publishResult.code === "rate_limited" ||
            publishResult.code === "conflict" ||
            publishResult.code === "upstream_error"
          )
        ) {
          return publishResult;
        }
        if (
          timers.now() - value >=
          (publishResult.code === "upstream_error"
            ? MIGRATION_UPSTREAM_RETRY_WINDOW_MS
            : MIGRATION_PUBLISH_RETRY_WINDOW_MS)
        ) {
          await stillOwnsLease();
          return publishResult;
        }
        let retryAfterMs =
          publishResult.code === "rate_limited" &&
          publishResult.retryAfterMs !== undefined &&
          Number.isFinite(publishResult.retryAfterMs) &&
          publishResult.retryAfterMs >= 0
            ? publishResult.retryAfterMs
            : undefined;
        await wait(
          Math.min(retryAfterMs ?? retryDelay, MIGRATION_PUBLISH_RETRY_WINDOW_MS),
        );
        retryDelay = Math.min(MIGRATION_RETRY_MAX_MS, retryDelay * 2);
      }
    },
  };
}
function migrationVersionSize(
  listing: Pick<Model.FileListingRow, "path" | "size">[],
  tree: Pick<Migration.MigrationTree<object>, "files">,
  indexPath: string,
  indexContent: Model.FilePublishInput,
) {
  let treePaths = new Set([
      ...tree.files.keys(),
      MIGRATION_SENTINEL_PATH,
      indexPath,
    ]),
    bytes = filePublishRawBytes(indexContent);
  for (let value of listing) {
    if (!treePaths.has(value.path) && Number.isFinite(value.size)) {
      bytes += value.size;
    }
  }
  let oversized: string[] = [];
  for (let [value, fileContent] of tree.files) {
    if (
      ((bytes += filePublishRawBytes(fileContent)),
      filePublishEncodedBytes(fileContent) >
        MAX_FILE_PUBLISH_ENCODED_BYTES)
    ) {
      oversized.push(value);
    }
  }
  bytes += 2048 * (tree.files.size + 1);
  return {
    files: new Set([...listing.map((fileEntry) => fileEntry.path), ...treePaths])
      .size,
    bytes: bytes,
    oversized: oversized,
  };
}
function validateMigrationTreePaths(
  paths: Iterable<string>,
  type: Files.FileArtifactType,
): void {
  for (let value of paths) {
    if (
      canonicalFilePathWithinPrefix(
        PROJECT_FILE_PREFIX,
        value,
      ) !== value
    ) {
      throw new MigrationConfigError(
        "not canonical: " + JSON.stringify(value),
      );
    }
    if (isPrivateProjectFile(type, value)) {
      throw new MigrationConfigError(
        "the page's own file in a codec's tree: " + JSON.stringify(value),
      );
    }
  }
}
async function hashMigrationFileInput(
  path: string,
  fileContent: Model.FilePublishInput,
): Promise<string> {
  let normalized = normalizeFilePublishInput(path, fileContent);
  if (normalized === null || typeof normalized === "string") {
    throw new MigrationConfigError(
      typeof normalized === "string" ? normalized : path + ": no content",
    );
  }
  return sha256(
    await fileContentBytes(normalized.content),
  );
}
async function finishMigrationTombstone(
  migrationOptions: Pick<
    Migration.MigrationOptions<object>,
    "files" | "store" | "timers" | "artifactId"
  > & { indexPath: string; metaPath: string },
): Promise<boolean | undefined> {
  try {
    if (!migrationOptions.files.canWrite) {
      return false;
    }
    let value = await readJsonFileState(
        migrationOptions.files,
        migrationOptions.indexPath,
        migrationOptions.timers,
      ),
      sentinelData =
        value.state === "read"
          ? readFileMigrationMarker(value.value)
          : null;
    if (sentinelData === null) {
      return false;
    }
    let sentinel: Model.FilesMigrationSentinel | null = null;
    try {
      sentinel = parseMigrationSentinel(
        (await migrationOptions.files.readText(MIGRATION_SENTINEL_PATH)).text,
      );
    } catch {
      sentinel = null;
    }
    if (
      sentinel === null ||
      sentinel.documents[migrationOptions.metaPath] === undefined ||
      !migrationSentinelMatchesArtifact(sentinel, migrationOptions.artifactId)
    ) {
      return false;
    }
    let metaDocument = await migrationOptions.store.get(migrationOptions.metaPath);
    if (
      metaDocument === null ||
      readMovedToMarker(metaDocument.data) !== null
    ) {
      return false;
    }
    let state = {
      ...(sentinel.dropping !== undefined
        ? {
            dropping: sentinel.dropping.at,
          }
        : {}),
      ...(sentinel.dropped !== undefined
        ? {
            dropped: sentinel.dropped.at,
          }
        : {}),
    };
    await migrationOptions.store.update(migrationOptions.metaPath, {
      [MOVED_TO_MARKER_KEY]: {
        ...movedToMarker({
          path: migrationOptions.indexPath,
          ver: migrationOptions.files.version().version,
          at: sentinelData.marker.at,
        }),
        ...state,
      },
      [CONVERTING_MARKER_KEY]: null,
    });
    return true;
  } catch {
    return false;
  }
}
async function migrateStoreToFiles<Index extends object = Model.FilesIndex>(
  migrationOptions: Migration.MigrationOptions<Index>,
): Promise<Migration.MigrationOutcome> {
  let {
      adapter: adapter,
      files: files,
      store: store,
      timers: timers,
    } = migrationOptions,
    startedAt = timers.now(),
    stage = "preflight",
    setStage = (stageName: string): void => {
      stage = stageName;
      try {
        migrationOptions.onStage?.(stageName);
      } catch {}
    },
    aborted = (code: string): Migration.MigrationOutcome => ({
      result: "aborted",
      stage: stage,
      code: code,
      ms: timers.now() - startedAt,
    }),
    renewalTimer: ReturnType<Model.FilesTimers["setTimeout"]> | undefined,
    leaseLost: boolean = false,
    acquiredLease: boolean = false,
    supportsLease: boolean = true,
    fenceWritten: boolean = false,
    lastLeaseRefreshAt = timers.now(),
    finishing: boolean = false,
    isoNow = () => new Date(timers.now()).toISOString(),
    leaseExpired = (): boolean =>
      timers.now() - lastLeaseRefreshAt >=
      (supportsLease
        ? MIGRATION_LEASE_TTL_MS
        : MIGRATION_LOCK_TTL_MS),
    checkLeaseExpired = (): boolean => {
      if (leaseExpired()) {
        leaseLost = true;
      }
      return leaseLost;
    },
    checkMigrationOwnership = async (): Promise<string | null> => {
      if (checkLeaseExpired()) {
        return "lease_lost";
      }
      let value = await store.get(adapter.metaPath);
      if (
        value !== null &&
        readMovedToMarker(value.data) !== null
      ) {
        return "already_moved";
      }
      let ownershipMarker =
        value === null
          ? null
          : activeConvertingMarker(value.data, timers.now());
      if (ownershipMarker !== null && ownershipMarker.holder !== migrationOptions.holder) {
        return "lease_lost";
      }
      let state = await readJsonFileState(
        files,
        adapter.indexPath,
        timers,
      );
      if (checkLeaseExpired()) {
        return "lease_lost";
      }
      if (state.state === "unreadable") {
        return "index_unreadable";
      }
      let marker =
        state.state === "read"
          ? readFileMigrationMarker(state.value)
          : null;
      remoteConversionMarker =
        marker?.kind === "converted" ? marker.marker : undefined;
      if (marker !== null) {
        return "already_files";
      } else {
        return null;
      }
    },
    remoteConversionMarker: Storage.DatabaseRecord | undefined,
    renewalInFlight: Promise<void> | undefined,
    versionCaps = migrationOptions.versionCaps ?? DEFAULT_FILE_VERSION_CAPS,
    exceedsVersionCaps = (
      listing: Model.FileListing,
      migrationTree: Migration.MigrationTree<Index>,
    ) => {
      let value = migrationVersionSize(
        listing,
        migrationTree,
        adapter.indexPath,
        adapter.codec.serializeIndex(migrationTree.index),
      );
      return (
        value.files > versionCaps.files ||
        value.bytes > versionCaps.bytes ||
        value.oversized.length > 0
      );
    };
  try {
    validateMigrationAllowlist(adapter);
    if (!files.canWrite) {
      return {
        result: "skipped",
        reason: files.narrowed === true ? "narrowed_listing" : "not_writer",
      };
    }
    let value = await readJsonFileState(
      files,
      adapter.indexPath,
      timers,
    );
    if (
      files.narrowed === true ||
      (value.state === "unreadable" && value.narrowed === true)
    ) {
      return {
        result: "skipped",
        reason: "narrowed_listing",
      };
    }
    if (value.state === "unreadable") {
      return aborted("index_unreadable");
    }
    if (
      value.state === "read" &&
      readFileMigrationMarker(value.value) !== null
    ) {
      return {
        result: "skipped",
        reason: "already_files",
        ...((await finishMigrationTombstone({
          indexPath: adapter.indexPath,
          metaPath: adapter.metaPath,
          files: files,
          store: store,
          timers: timers,
          ...(migrationOptions.artifactId !== undefined
            ? {
                artifactId: migrationOptions.artifactId,
              }
            : {}),
        }))
          ? {
              tombstoned: true,
            }
          : {}),
      };
    }
    let metaRecord = await store.get(adapter.metaPath);
    if (metaRecord === null) {
      return {
        result: "skipped",
        reason: "empty_store",
      };
    }
    if (readMovedToMarker(metaRecord.data) !== null) {
      return {
        result: "skipped",
        reason: "already_moved",
      };
    }
    let activeMarker = activeConvertingMarker(
      metaRecord.data,
      timers.now(),
    );
    if (activeMarker !== null && activeMarker.holder !== migrationOptions.holder) {
      return {
        result: "busy",
      };
    }
    if (migrationOptions.force !== true) {
      if ((await migrationOptions.sharedExternally?.()) === true) {
        return {
          result: "skipped",
          reason: "shared_externally",
        };
      }
      if ((await migrationOptions.embedsArtifacts?.()) === true) {
        return {
          result: "skipped",
          reason: "embeds_artifacts",
        };
      }
    }
    let convertedTree = await adapter.codec.toTree(
        await readAllowlistedStoreDocuments(store, adapter.allowlist),
        {
          preflight: true,
        },
      ),
      damagedPaths = damagedTextFiles(convertedTree);
    if (damagedPaths.length > 0) {
      return {
        result: "skipped",
        reason: "unsendable_content",
        leftOut: damagedPaths,
      };
    }
    let currentListing = await listWritableFiles(files).catch(
      (): void => {
        return;
      },
    );
    removeUnpublishableMigrationFiles(
      convertedTree.files,
      adapter.type,
    );
    if (currentListing !== undefined && exceedsVersionCaps(currentListing, convertedTree)) {
      return {
        result: "skipped",
        reason: "too_large",
      };
    }
    setStage("lease");
    let leaseTimestamp = timers.now(),
      migrationLease = await store.acquire(adapter.lockPath, {
        holder: migrationOptions.holder,
        ttlMs: MIGRATION_LEASE_TTL_MS,
      });
    lastLeaseRefreshAt = leaseTimestamp;
    if (migrationLease === "unsupported") {
      supportsLease = false;
    } else {
      if (!migrationLease.acquired) {
        return {
          result: "busy",
          ...(migrationLease.expiresAt !== undefined
            ? {
                until: migrationLease.expiresAt,
              }
            : {}),
        };
      }
      acquiredLease = true;
    }
    let ownershipStatus = await checkMigrationOwnership();
    if (ownershipStatus === "already_files" || ownershipStatus === "already_moved") {
      return {
        result: "skipped",
        reason: ownershipStatus,
      };
    }
    if (ownershipStatus === "index_unreadable") {
      return aborted(ownershipStatus);
    }
    if (ownershipStatus !== null) {
      return {
        result: "busy",
      };
    }
    let callback = () =>
        store.update(adapter.metaPath, {
          [CONVERTING_MARKER_KEY]: {
            by: migrationOptions.by,
            at: isoNow(),
            holder: migrationOptions.holder,
          },
        }),
      refreshLease = (): void => {
        renewalTimer = timers.setTimeout((): void => {
          renewalInFlight = (async (): Promise<void> => {
            if (finishing) {
              return;
            }
            let ownershipResult = await checkMigrationOwnership();
            if (ownershipResult !== null && ownershipResult !== "index_unreadable") {
              leaseLost = true;
              return;
            }
            let now = timers.now(),
              leaseResult = supportsLease
                ? await store.acquire(adapter.lockPath, {
                    holder: migrationOptions.holder,
                    ttlMs: MIGRATION_LEASE_TTL_MS,
                  })
                : "unsupported";
            if (leaseResult !== "unsupported" && !leaseResult.acquired) {
              leaseLost = true;
              return;
            }
            if (checkLeaseExpired()) {
              return;
            }
            if (fenceWritten && !finishing) {
              await callback();
            }
            lastLeaseRefreshAt = now;
          })()
            .catch((): void => {
              return;
            })
            .then((): void => {
              renewalInFlight = undefined;
              if (renewalTimer !== undefined && !leaseLost && !finishing) {
                refreshLease();
              }
            });
        }, MIGRATION_LEASE_RENEWAL_MS);
      };
    refreshLease();
    setStage("fence");
    await callback();
    fenceWritten = true;
    if (!supportsLease) {
      let metaDocument = await store.get(adapter.metaPath);
      if (
        metaDocument !== null &&
        readConvertingMarker(metaDocument.data)?.holder !==
          migrationOptions.holder
      ) {
        fenceWritten = false;
        return {
          result: "busy",
        };
      }
    }
    setStage("snapshot");
    let writableListing = await listWritableFiles(files),
      entries = new Map(writableListing.map((fileEntry) => [fileEntry.path, fileEntry.sha256])),
      values = new Set(
        writableListing
          .filter((fileEntry): boolean => fileEntry.provisional === true)
          .map((fileEntry) => fileEntry.path),
      ),
      legacyDocuments = await readAllowlistedStoreDocuments(store, adapter.allowlist),
      legacyDigests = await hashStoreSnapshot(legacyDocuments, adapter),
      migrationTree = await adapter.codec.toTree(legacyDocuments);
    if (damagedTextFiles(migrationTree).length > 0) {
      return {
        result: "skipped",
        reason: "unsendable_content",
        leftOut: damagedTextFiles(migrationTree),
      };
    }
    let unpublishablePaths = removeUnpublishableMigrationFiles(
      migrationTree.files,
      adapter.type,
    );
    validateMigrationTreePaths(migrationTree.files.keys(), adapter.type);
    if (exceedsVersionCaps(writableListing, migrationTree)) {
      return {
        result: "skipped",
        reason: "too_large",
      };
    }
    setStage("publish");
    let abortReason: string | null = null,
      publisher = createMigrationPublisher(
        files,
        timers,
        async (): Promise<boolean> => {
          abortReason = await checkMigrationOwnership();
          return abortReason === null;
        },
      ),
      publishedShas = new Map<string, string>(),
      flag: boolean = true,
      handlePublishFailure = (
        failure: Model.FilePublishFailure,
      ): Migration.MigrationOutcome => {
        if (abortReason === "already_files" || abortReason === "already_moved") {
          return {
            result: "skipped",
            reason: abortReason,
          };
        }
        if (abortReason === "index_unreadable") {
          return aborted(abortReason);
        }
        if (abortReason === "lease_lost" || leaseLost) {
          return aborted("lease_lost");
        }
        if (
          flag &&
          (failure.code === "capability_disabled" ||
            failure.code === "not_declared")
        ) {
          return {
            result: "skipped",
            reason: "files_unavailable",
          };
        } else {
          return aborted(failure.code);
        }
      },
      pathsToInput = (paths: string[]) => ({
        ifMatch: Object.fromEntries(
          paths
            .filter((path): boolean => !values.has(path))
            .map((path) => [
              path,
              publishedShas.get(path) ?? entries.get(path) ?? null,
            ]),
        ),
      }),
      publishChanges = async (): Promise<Model.FilePublishFailure | undefined> => {
        let publishState: Model.FilePublishEntries = {},
          newShas = new Map();
        for (let [filePath, fileContent] of migrationTree.files) {
          let fileSha = await hashMigrationFileInput(filePath, fileContent);
          newShas.set(filePath, fileSha);
          if ((publishedShas.get(filePath) ?? entries.get(filePath)) !== fileSha) {
            publishState[filePath] = fileContent;
          }
        }
        for (let filePath of publishedShas.keys()) {
          if (!migrationTree.files.has(filePath)) {
            publishState[filePath] = null;
          }
        }
        for (let batch of splitMigrationPublishBatches(publishState)) {
          let batchResult = await publisher.publish(
            batch,
            pathsToInput(Object.keys(batch)),
          );
          if (!batchResult.ok) {
            return batchResult;
          }
          flag = false;
          for (let [filePath, fileContent] of Object.entries(batch)) {
            if (fileContent === null) {
              publishedShas.delete(filePath);
              values.delete(filePath);
              continue;
            }
            let expectedSha =
              batchResult.shas?.[filePath] !== undefined &&
              batchResult.computed?.includes(filePath) !== true;
            publishedShas.set(
              filePath,
              expectedSha ? batchResult.shas![filePath] : newShas.get(filePath)!,
            );
            if (
              !expectedSha &&
              fileContentContainsRuntimeMarkers(fileContent)
            ) {
              values.add(filePath);
            } else {
              values.delete(filePath);
            }
          }
        }
        return;
      },
      migrationFailure = await publishChanges();
    if (migrationFailure !== undefined) {
      return handlePublishFailure(migrationFailure);
    }
    setStage("recheck");
    let index = 0;
    for (;;) {
      let storeDocuments = await readAllowlistedStoreDocuments(
          store,
          adapter.allowlist,
        ),
        storeDigests = await hashStoreSnapshot(storeDocuments, adapter);
      if (
        storeDigests.size === legacyDigests.size &&
        [...storeDigests].every(
          ([filePath, fileSha]): boolean => legacyDigests.get(filePath) === fileSha,
        )
      ) {
        break;
      }
      index += 1;
      if (index > MIGRATION_MAX_STORE_RECHECKS) {
        return aborted("store_kept_changing");
      }
      legacyDocuments = storeDocuments;
      legacyDigests = storeDigests;
      migrationTree = await adapter.codec.toTree(legacyDocuments);
      if (damagedTextFiles(migrationTree).length > 0) {
        return aborted("unsendable_content");
      }
      unpublishablePaths = removeUnpublishableMigrationFiles(
        migrationTree.files,
        adapter.type,
      );
      validateMigrationTreePaths(migrationTree.files.keys(), adapter.type);
      if (exceedsVersionCaps(writableListing, migrationTree)) {
        return aborted("too_large");
      }
      let publishFailure = await publishChanges();
      if (publishFailure !== undefined) {
        return handlePublishFailure(publishFailure);
      }
    }
    setStage("sentinel");
    let timestamp = isoNow(),
      state: Model.FilesMigrationSentinel & {
        fields: Record<string, Record<string, string>>;
      } = {
        v: 1,
        vouching: 1,
        type: adapter.type,
        at: timestamp,
        ...(migrationOptions.artifactId !== undefined
          ? {
              artifact: migrationOptions.artifactId,
            }
          : {}),
        documents: Object.fromEntries(legacyDigests),
        fields: {},
        files: {},
      };
    for (let [fieldName, document] of legacyDocuments) {
      state.fields[fieldName] = await hashStoreFields(
        storeDocumentDigestView(document, adapter),
        adapter.secretFields,
      );
    }
    for (let filePath of migrationTree.files.keys()) {
      let sourcePaths = migrationTree.sources.get(filePath) ?? [];
      state.files[filePath] = {
        sha256: publishedShas.get(filePath) ?? entries.get(filePath) ?? "",
        from: sourcePaths,
        of: Object.fromEntries(
          sourcePaths
            .filter((fieldName) => legacyDigests.has(fieldName))
            .map((fieldName) => [fieldName, legacyDigests.get(fieldName)!]),
        ),
      };
    }
    if ((migrationTree.indexSources ?? []).length > 0) {
      state.indexSources = Object.fromEntries(
        migrationTree
          .indexSources!.filter((path) => legacyDigests.has(path))
          .map((path) => [path, legacyDigests.get(path)!]),
      );
    }
    let keptFiles = (await adapter.kept?.()) ?? {};
    if (Object.keys(keptFiles).length > 0) {
      state.kept = keptFiles;
    }
    let migrationIndex = {
        ...migrationTree.index,
        [CONVERTED_FROM_MARKER_KEY]: convertedFromMarker(
          {
            at: timestamp,
            by: migrationOptions.by,
            ...(adapter.home !== undefined
              ? {
                  home: adapter.home,
                }
              : {}),
          },
        ),
      },
      publishResult = await publisher.publish(
        {
          [MIGRATION_SENTINEL_PATH]: serializeIndexDocument(
            state,
          ),
          [adapter.indexPath]: adapter.codec.serializeIndex(migrationIndex),
        },
        pathsToInput([MIGRATION_SENTINEL_PATH, adapter.indexPath]),
      ),
      matchesMarker = (marker: Storage.DatabaseRecord | undefined) =>
        marker !== undefined &&
        marker.at === timestamp &&
        marker.by === migrationOptions.by;
    if (
      !publishResult.ok &&
      abortReason === "already_files" &&
      matchesMarker(remoteConversionMarker)
    ) {
      publishResult = {
        ok: true,
        version: files.version().version,
      };
    }
    if (!publishResult.ok) {
      let metaState = await readJsonFileState(
          files,
          adapter.indexPath,
          timers,
        ),
        conversionMarker =
          metaState.state === "read"
            ? readFileMigrationMarker(metaState.value)
            : null;
      if (conversionMarker?.kind === "converted" && matchesMarker(conversionMarker.marker)) {
        publishResult = {
          ok: true,
          version: files.version().version,
        };
      }
    }
    if (!publishResult.ok) {
      return handlePublishFailure(publishResult);
    }
    setStage("tombstone");
    finishing = true;
    await renewalInFlight;
    let conversionState = {
        [MOVED_TO_MARKER_KEY]: movedToMarker({
          path: adapter.indexPath,
          ver: publishResult.version,
          at: timestamp,
        }),
        [CONVERTING_MARKER_KEY]: null,
      },
      updated = false;
    for (let attempt: number = 0; attempt < 3 && !updated; attempt++) {
      if (attempt > 0) {
        await new Promise<void>(
          (resolve) => void timers.setTimeout(resolve, 500 * attempt),
        );
      }
      updated = await store.update(adapter.metaPath, conversionState).then(
        (): boolean => true,
        (): boolean => false,
      );
    }
    fenceWritten = false;
    return {
      result: "converted",
      version: publishResult.version,
      files: migrationTree.files.size,
      calls: publisher.calls(),
      rechecks: index,
      ms: timers.now() - startedAt,
      ...(updated
        ? {}
        : {
            tombstoned: false,
          }),
      ...(unpublishablePaths.length > 0
        ? {
            leftOut: unpublishablePaths,
          }
        : {}),
    };
  } catch (value) {
    return aborted(
      value instanceof MigrationConfigError
        ? "bad_config"
        : value instanceof MigrationLimitError
          ? value.code
          : migrationErrorCode(value),
    );
  } finally {
    finishing = true;
    if (renewalTimer !== undefined) {
      timers.clearTimeout(renewalTimer);
      renewalTimer = undefined;
    }
    await renewalInFlight;
    if (fenceWritten) {
      let value = await store.get(adapter.metaPath).catch((): null => null);
      if (
        value !== null &&
        readConvertingMarker(value.data)?.holder ===
          migrationOptions.holder
      ) {
        await store
          .update(adapter.metaPath, {
            [CONVERTING_MARKER_KEY]: null,
          })
          .catch((): void => {
            return;
          });
      }
    }
    if (acquiredLease && !checkLeaseExpired()) {
      await store
        .acquire(adapter.lockPath, {
          holder: migrationOptions.holder,
          ttlMs: 1000,
        })
        .catch((): void => {
          return;
        });
    }
  }
}
export {
  allowlistedStorePath,
  createMigrationPublisher,
  finishMigrationTombstone,
  hashCanonicalIndex,
  hashMigrationFileInput,
  hashStoreDocument,
  hashStoreFields,
  hashStoreSnapshot,
  isPublishableFilePath,
  LEGACY_DATABASE_LIST_LIMIT,
  migrateStoreToFiles,
  MIGRATION_BATCH_MAX_BYTES,
  MIGRATION_BATCH_MAX_FILES,
  MIGRATION_INTERNAL_META_FIELDS,
  MIGRATION_LEASE_RENEWAL_MS,
  MIGRATION_LEASE_TTL_MS,
  MIGRATION_MAX_STORE_RECHECKS,
  MIGRATION_PUBLISH_RETRY_WINDOW_MS,
  MIGRATION_PUBLISH_SPACING_MS,
  MIGRATION_RETRY_INITIAL_MS,
  MIGRATION_RETRY_MAX_MS,
  MIGRATION_SENTINEL_PATH,
  MIGRATION_UPSTREAM_RETRY_WINDOW_MS,
  MigrationConfigError,
  migrationErrorCode,
  MigrationLimitError,
  migrationSentinelMatchesArtifact,
  migrationVersionSize,
  parseMigrationSentinel,
  PUBLIC_STORE_READ_LEVELS,
  readAllowlistedStoreDocuments,
  splitMigrationPublishBatches,
  storeDocumentDigestView,
  storePathHasPrefix,
  storePathParts,
  storeReadAccessLevel,
  validateMigrationAllowlist,
  validateMigrationTreePaths,
};
export function installFilesMigrationEngine(): () => void {
  return () => {
    isPublishableFilePath = (path): boolean =>
      validateFilePath(path) === undefined;
    MIGRATION_LEASE_TTL_MS = 120000;
    MIGRATION_LEASE_RENEWAL_MS = 45000;
    MIGRATION_BATCH_MAX_FILES = 200;
    MIGRATION_BATCH_MAX_BYTES = 15728640;
    MIGRATION_PUBLISH_SPACING_MS = 3000;
    MIGRATION_MAX_STORE_RECHECKS = 3;
    MIGRATION_RETRY_INITIAL_MS = 2000;
    MIGRATION_RETRY_MAX_MS = 30000;
    MIGRATION_PUBLISH_RETRY_WINDOW_MS = 300000;
    MIGRATION_UPSTREAM_RETRY_WINDOW_MS = 30000;
    LEGACY_DATABASE_LIST_LIMIT = 1000;
    MIGRATION_SENTINEL_PATH = MIGRATION_MANIFEST_PATH;
    MigrationConfigError = class MigrationConfigError extends Error {};
    PUBLIC_STORE_READ_LEVELS = ["view", "interact", "admin", "owner"];
    storePathParts = (path) =>
      path.split("/").filter((segment): boolean => segment !== "");
    storePathHasPrefix = (items, prefixParts) =>
      prefixParts.length <= items.length &&
      prefixParts.every((segment, index): boolean => segment === items[index]);
    allowlistedStorePath = (storePath) =>
      storePath.docId === undefined
        ? storePath.collection
        : storePath.collection + "/" + storePath.docId;
    MIGRATION_INTERNAL_META_FIELDS = [
      CONVERTING_MARKER_KEY,
      MOVED_TO_MARKER_KEY,
    ];
    MigrationLimitError = class MigrationLimitError extends Error {
      code: string;
      constructor(message: string) {
        super(message);
        this.code = message;
      }
    };
    storeDocumentDigestView = (document, digestOptions = {}) =>
      digestOptions.digestView !== undefined ? digestOptions.digestView(document) : document.data;
    migrationErrorCode = (error) => {
      let value = (error as { code?: unknown } | null | undefined)?.code;
      if (typeof value === "string" && /^[a-z][a-z0-9_]{0,31}$/.test(value)) {
        return value;
      } else {
        return "internal";
      }
    };
  };
}
