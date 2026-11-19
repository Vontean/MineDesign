/** Restored application module; prepare first, initialize in original order. */
import type * as Migration from "../contracts/migration";
import type * as Model from "../contracts";
import { serializeIndexDocument, sha256 } from "../editor/index-file-store";
import { finishMigrationTombstone, hashStoreFields, hashStoreSnapshot, MIGRATION_LEASE_TTL_MS, MIGRATION_SENTINEL_PATH, migrationSentinelMatchesArtifact, parseMigrationSentinel, readAllowlistedStoreDocuments, splitMigrationPublishBatches, storeDocumentDigestView, validateMigrationAllowlist, validateMigrationTreePaths } from "./migration-engine";
import { fileContentBytes, listWritableFiles, normalizeFilePublishInput, readJsonFileState, removeUnpublishableMigrationFiles } from "./paths";
import { CONVERTED_FROM_MARKER_KEY, CREATED_ON_FILES_MARKER_KEY, readFileMigrationMarker, readMovedToMarker } from "../model/migration-markers";
import { artifactHealth } from "../telemetry/health";

var STORE_FOLD_DEBOUNCE_MS: number;
var STORE_FOLD_PUBLISH_SPACING_MS: number;
var STORE_FOLD_RETRY_DELAY_MS: number;
var STORE_FOLD_MAX_RETRIES: number;
function createStoreToFilesFoldController<
  Index extends object = Migration.MigrationWireIndex,
>(foldOptions: Migration.StoreFoldOptions<Index>): Migration.StoreFoldController {
  let {
      adapter: adapter,
      files: files,
      store: store,
      timers: timers,
    } = foldOptions,
    inFlight: Promise<Migration.FoldOutcome> | undefined,
    checkOwed: boolean = false,
    lastPublishAt = -1 / 0,
    readFileText = async (path: string): Promise<string | null> => {
      try {
        return (await files.readText(path)).text;
      } catch {
        return null;
      }
    },
    readFileState = async (
      path: string,
    ): Promise<Migration.FileReadState> => {
      try {
        if (
          !(await listWritableFiles(files)).some(
            (entry): boolean => entry.path === path,
          )
        ) {
          return {
            state: "absent",
          };
        }
        return {
          state: "text",
          text: (await files.readText(path)).text,
        };
      } catch {
        return {
          state: "unreadable",
        };
      }
    };
  async function readFoldSnapshot(): Promise<
    | Migration.StoreFoldSnapshot<Index>
    | Extract<Migration.FoldOutcome, { result: "skipped" }>
  > {
    let value = await readJsonFileState(
      files,
      adapter.indexPath,
      timers,
    );
    if (value.state === "unreadable") {
      return {
        result: "skipped",
        reason: "index_unreadable",
      };
    }
    let migrationSentinel =
      value.state === "read"
        ? readFileMigrationMarker(value.value)
        : null;
    if (value.state !== "read" || migrationSentinel === null) {
      return {
        result: "skipped",
        reason: "not_on_files",
      };
    }
    if (migrationSentinel.kind === "converted" && migrationSentinel.marker.home === "file") {
      return {
        result: "skipped",
        reason: "no_store_home",
      };
    }
    let indexFile: Model.FileTextRead | null = null;
    try {
      indexFile = await files.readText(MIGRATION_SENTINEL_PATH);
    } catch {
      indexFile = null;
    }
    let sentinel = parseMigrationSentinel(indexFile?.text ?? null);
    if (
      indexFile === null ||
      sentinel === null ||
      !migrationSentinelMatchesArtifact(
        sentinel,
        foldOptions.artifactId,
      )
    ) {
      return {
        result: "skipped",
        reason: "no_record",
      };
    }
    let storeDocuments = await readAllowlistedStoreDocuments(
      store,
      adapter.allowlist,
    );
    if (!storeDocuments.has(adapter.metaPath)) {
      return {
        result: "skipped",
        reason: "store_absent",
      };
    }
    let documentDigests = await hashStoreSnapshot(storeDocuments, adapter),
      changedDocuments = [...storeDocuments.values()].filter(
        (document): boolean =>
          sentinel.documents[document.path] !== documentDigests.get(document.path),
      ),
      movedMarker = readMovedToMarker(
        storeDocuments.get(adapter.metaPath)!.data,
      ),
      documentPaths = Object.keys(sentinel.documents).filter(
        (path): boolean => !storeDocuments.has(path),
      ),
      droppedState = sentinel.dropped ?? sentinel.dropping,
      droppedPaths =
        droppedState?.documents !== undefined &&
        droppedState.stamp !== undefined &&
        droppedState.stamp === movedMarker?.took
          ? new Set([
              ...(sentinel.dropping?.documents ?? []),
              ...(sentinel.dropped?.documents ?? []),
            ])
          : undefined,
      removedPathsFallback =
        movedMarker?.dropping !== undefined ||
        movedMarker?.dropped !== undefined ||
        sentinel.dropping !== undefined ||
        sentinel.dropped !== undefined,
      removedPaths =
        droppedPaths !== undefined
          ? documentPaths.filter((path): boolean => !droppedPaths.has(path))
          : removedPathsFallback
            ? []
            : documentPaths;
    return {
      index: value.value as Index,
      markerKey:
        migrationSentinel.kind === "converted"
          ? CONVERTED_FROM_MARKER_KEY
          : CREATED_ON_FILES_MARKER_KEY,
      marker: migrationSentinel.marker,
      indexSha: value.sha256,
      record: sentinel,
      recordSha: indexFile.sha256,
      snapshot: storeDocuments,
      digests: documentDigests,
      changed: changedDocuments,
      removed: removedPaths,
    };
  }
  let lastUnfoldedCount = 0;
  async function foldChangedStore(): Promise<Migration.FoldOutcome> {
    let flag: boolean = false;
    lastUnfoldedCount = 0;
    try {
      validateMigrationAllowlist(adapter);
      if (!files.canWrite) {
        return {
          result: "skipped",
          reason: "not_writer",
        };
      }
      let value = await readFoldSnapshot();
      if ("result" in value) {
        return value;
      }
      if (value.changed.length === 0 && value.removed.length === 0) {
        return {
          result: "clean",
        };
      }
      let lockResult = await store.acquire(adapter.lockPath, {
        holder: foldOptions.holder,
        ttlMs: MIGRATION_LEASE_TTL_MS,
      });
      if (lockResult !== "unsupported" && !lockResult.acquired) {
        return {
          result: "busy",
          ...(lockResult.expiresAt !== undefined
            ? {
                until: lockResult.expiresAt,
              }
            : {}),
        };
      }
      flag = lockResult !== "unsupported";
      let snapshot = await readFoldSnapshot();
      if ("result" in snapshot) {
        return snapshot;
      }
      if (snapshot.changed.length === 0 && snapshot.removed.length === 0) {
        return {
          result: "clean",
        };
      }
      let entries = new Map(
          snapshot.changed
            .map((document): [string, Record<string, string> | undefined] => [
              document.path,
              snapshot.record.fields?.[document.path],
            ])
            .filter(
              (fieldEntry): fieldEntry is [string, Record<string, string>] =>
                fieldEntry[1] !== undefined,
            ),
        ),
        foldResult = await adapter.codec.fold({
          index: snapshot.index,
          changed: snapshot.changed,
          removed: snapshot.removed,
          recorded: entries,
          snapshot: snapshot.snapshot,
          readFile: readFileText,
          readFileState: readFileState,
        }),
        unpublishable = removeUnpublishableMigrationFiles(
          foldResult.files,
          adapter.type,
        );
      validateMigrationTreePaths(
        foldResult.files.keys(),
        adapter.type,
      );
      let values = new Set(foldResult.unfolded ?? []);
      if (
        foldResult.files.size === 0 &&
        values.size > 0 &&
        snapshot.changed.every((document) => values.has(document.path)) &&
        snapshot.removed.every((path) => values.has(path))
      ) {
        return {
          result: "failed",
          code: "file_unreadable",
        };
      }
      let state = {
        ...snapshot.record,
        at: new Date(timers.now()).toISOString(),
        documents: Object.fromEntries(snapshot.digests),
        fields: {
          ...(snapshot.record.fields ?? {}),
        },
        files: {
          ...snapshot.record.files,
        },
      };
      for (let document of snapshot.changed) {
        state.fields[document.path] = await hashStoreFields(
          storeDocumentDigestView(document, adapter),
          adapter.secretFields,
        );
      }
      for (let path of snapshot.removed) {
        delete state.fields[path];
      }
      for (let path of foldResult.unfolded ?? []) {
        let documentValue = snapshot.record.documents[path];
        if (documentValue === undefined) {
          delete state.documents[path];
        } else {
          state.documents[path] = documentValue;
        }
        let fieldValue = snapshot.record.fields?.[path];
        if (fieldValue === undefined) {
          delete state.fields[path];
        } else {
          state.fields[path] = fieldValue;
        }
      }
      if ((foldResult.indexSources ?? []).length > 0) {
        state.indexSources = {
          ...(snapshot.record.indexSources ?? {}),
          ...Object.fromEntries(
            foldResult
              .indexSources!.filter((path) => snapshot.digests.has(path))
              .map((path) => [path, snapshot.digests.get(path)!]),
          ),
        };
      }
      let indexPaths = [
        ...(foldResult.indexSourcesGone ?? []),
        ...snapshot.removed,
      ].filter((path): boolean => state.indexSources?.[path] !== undefined);
      if (indexPaths.length > 0) {
        state.indexSources = Object.fromEntries(
          Object.entries(state.indexSources!).filter(
            ([path]): boolean => !indexPaths.includes(path),
          ),
        );
      }
      lastUnfoldedCount = (foldResult.unfolded ?? []).length;
      let publishFilesState: Model.FilePublishEntries = {},
        removeFiles: Model.FilePublishEntries = {};
      for (let [filePath, fileContent] of foldResult.files) {
        if (fileContent === null) {
          removeFiles[filePath] = null;
          delete state.files[filePath];
          continue;
        }
        publishFilesState[filePath] = fileContent;
        let normalizedFile = normalizeFilePublishInput(
          filePath,
          fileContent,
        );
        if (normalizedFile === null || typeof normalizedFile === "string") {
          return {
            result: "failed",
            code: "invalid_content",
          };
        }
        let indexDelta =
          foldResult.sources.get(filePath) ?? state.files[filePath]?.from ?? [];
        state.files[filePath] = {
          sha256: await sha256(
            await fileContentBytes(normalizedFile.content),
          ),
          from: indexDelta,
          of: Object.fromEntries(
            indexDelta
              .filter(
                (path): boolean => state.documents[path] !== undefined,
              )
              .map((path) => [path, state.documents[path]]),
          ),
        };
      }
      let publishState = {
          ...removeFiles,
          [MIGRATION_SENTINEL_PATH]: serializeIndexDocument(state),
          [adapter.indexPath]: adapter.codec.serializeIndex({
            ...snapshot.index,
            ...foldResult.index,
            [snapshot.markerKey]: snapshot.marker,
          }),
        },
        writableFiles = await listWritableFiles(files),
        writableShas = new Map(writableFiles.map((fileEntry) => [fileEntry.path, fileEntry.sha256]));
      if (
        writableShas.get(adapter.indexPath) !== snapshot.indexSha ||
        writableShas.get(MIGRATION_SENTINEL_PATH) !== snapshot.recordSha
      ) {
        return {
          result: "failed",
          code: "conflict",
        };
      }
      let provisionalPaths = new Set(
          writableFiles
            .filter((entry): boolean => entry.provisional === true)
            .map((entry) => entry.path),
        ),
        callback = (publishEntries: Model.FilePublishEntries) => ({
          ifMatch: Object.fromEntries(
            Object.keys(publishEntries)
              .filter((path): boolean => !provisionalPaths.has(path))
              .map((path) => [
                path,
                path === adapter.indexPath
                  ? snapshot.indexSha
                  : path === MIGRATION_SENTINEL_PATH
                    ? snapshot.recordSha
                    : (writableShas.get(path) ?? null),
              ]),
          ),
        }),
        publishBatch =
          foldOptions.write ??
          ((
            publishFiles: Model.FilePublishEntries,
            preconditions?: Model.FilePublishPreconditions,
          ) => files.publish(publishFiles, preconditions)),
        fileVersion = files.version(),
        version = fileVersion.version,
        publishBatches = splitMigrationPublishBatches({
          ...publishFilesState,
          ...publishState,
        });
      for (let batch of publishBatches.length === 1
        ? publishBatches
        : [...splitMigrationPublishBatches(publishFilesState), publishState]) {
        lastPublishAt = timers.now();
        let publishResult = await publishBatch(batch, callback(batch));
        if (!publishResult.ok) {
          return {
            result: "failed",
            code: publishResult.code,
            ...(publishResult.retryAfterMs !== undefined &&
            Number.isFinite(publishResult.retryAfterMs) &&
            publishResult.retryAfterMs > 0
              ? {
                  retryAfterMs: Math.min(publishResult.retryAfterMs, 300000),
                }
              : {}),
          };
        }
        version = publishResult.version;
      }
      if (foldOptions.onFolded !== undefined) {
        let items: Model.ChangedFileRow[] = [];
        for (let [filePath, fileText] of Object.entries({
          ...publishFilesState,
          ...publishState,
        })) {
          items.push({
            path: filePath,
            sha256:
              fileText === null
                ? null
                : (state.files[filePath]?.sha256 ??
                  (await sha256(fileText as string))),
          });
        }
        try {
          foldOptions.onFolded({
            from: fileVersion,
            to: {
              version: version,
            },
            changed: items,
          });
        } catch {}
      }
      return {
        result: "folded",
        documents: snapshot.changed.length + snapshot.removed.length,
        files: foldResult.files.size,
        ...(unpublishable.length > 0
          ? {
              leftOut: unpublishable,
            }
          : {}),
      };
    } catch (value) {
      let errorCode = (value as { code?: unknown } | null | undefined)?.code;
      return {
        result: "failed",
        code:
          typeof errorCode === "string" && /^[a-z][a-z0-9_]{0,31}$/.test(errorCode)
            ? errorCode
            : "internal",
      };
    } finally {
      if (flag) {
        await store
          .acquire(adapter.lockPath, {
            holder: foldOptions.holder,
            ttlMs: 1000,
          })
          .catch((): void => {
            return;
          });
      }
    }
  }
  function check(): Promise<Migration.FoldOutcome> {
    inFlight ??= foldChangedStore().then((outcome) => {
      inFlight = undefined;
      try {
        foldOptions.onOutcome?.(outcome);
      } catch {}
      return outcome;
    });
    return inFlight;
  }
  return {
    check: check,
    watch() {
      let value: ReturnType<Model.FilesTimers["setTimeout"]> | undefined,
        flag: boolean = false,
        index = 0,
        hasPendingChanges: boolean = false,
        retryCount = 0,
        callback = (retryDelay: number, retryCallback: () => void): void => {
          if (value !== undefined) {
            timers.clearTimeout(value);
          }
          value = timers.setTimeout((): void => {
            value = undefined;
            retryCallback();
          }, retryDelay);
        },
        runRetry = (): void => {
          if (flag) {
            return;
          }
          let retryAfterMs =
            lastPublishAt + STORE_FOLD_PUBLISH_SPACING_MS - timers.now();
          if (retryAfterMs > 0) {
            callback(retryAfterMs, runRetry);
            return;
          }
          checkOwed = false;
          check().then((foldCheck): void => {
            if (flag || value !== undefined) {
              return;
            }
            if (foldCheck.result === "busy") {
              let retryDelay =
                foldCheck.until === undefined
                  ? NaN
                  : Date.parse(foldCheck.until) - timers.now();
              callback(
                Number.isFinite(retryDelay)
                  ? Math.min(
                      Math.max(retryDelay + 1000, STORE_FOLD_RETRY_DELAY_MS),
                      MIGRATION_LEASE_TTL_MS + 5000,
                    )
                  : STORE_FOLD_RETRY_DELAY_MS,
                runRetry,
              );
              return;
            }
            if (foldCheck.result === "failed") {
              hasPendingChanges = foldCheck.code === "conflict";
              if (index < STORE_FOLD_MAX_RETRIES) {
                index += 1;
                callback(
                  Math.max(
                    STORE_FOLD_RETRY_DELAY_MS,
                    foldCheck.retryAfterMs ?? 0,
                  ),
                  runRetry,
                );
              }
              return;
            }
            if (foldCheck.result === "folded") {
              index = 0;
            }
            hasPendingChanges = false;
            if (
              foldCheck.result === "folded" &&
              lastUnfoldedCount > 0 &&
              retryCount < STORE_FOLD_MAX_RETRIES
            ) {
              retryCount += 1;
              callback(STORE_FOLD_RETRY_DELAY_MS, runRetry);
              return;
            }
            if (lastUnfoldedCount === 0) {
              retryCount = 0;
            }
            if (foldCheck.result === "folded") {
              onRetryComplete();
            }
            if (checkOwed) {
              callback(STORE_FOLD_DEBOUNCE_MS, runRetry);
            }
          });
        },
        watchChanges = (paths?: string[]): void => {
          if (flag) {
            return;
          }
          if (paths !== undefined && !paths.some(isAllowedPath)) {
            return;
          }
          if (paths !== undefined) {
            index = 0;
          } else if (index >= STORE_FOLD_MAX_RETRIES) {
            return;
          }
          if (inFlight !== undefined) {
            checkOwed = true;
            return;
          }
          if (value === undefined) {
            callback(STORE_FOLD_DEBOUNCE_MS, runRetry);
          }
        },
        items = [
          ...new Set(adapter.allowlist.map((collection) => collection.collection)),
        ],
        isAllowedPath = (path: string) =>
          path !== adapter.lockPath &&
          adapter.allowlist.some((allowlistEntry) =>
            allowlistEntry.docId !== undefined
              ? path === allowlistEntry.collection + "/" + allowlistEntry.docId
              : path.startsWith(allowlistEntry.collection + "/") &&
                !path.slice(allowlistEntry.collection.length + 1).includes("/"),
          ),
        watchedPaths =
          store.watch === undefined
            ? []
            : items.map((path) => store.watch!(path, watchChanges)),
        unsubscribeRemote = files.onRemoteChange?.((): void => {
          if (hasPendingChanges && !flag && inFlight === undefined) {
            hasPendingChanges = false;
            index = 0;
            callback(STORE_FOLD_DEBOUNCE_MS, runRetry);
          }
        }),
        onRetryComplete = () =>
          finishMigrationTombstone({
            indexPath: adapter.indexPath,
            metaPath: adapter.metaPath,
            files: files,
            store: store,
            timers: timers,
            ...(foldOptions.artifactId !== undefined
              ? {
                  artifactId: foldOptions.artifactId,
                }
              : {}),
          });
      onRetryComplete().then(runRetry);
      return (): void => {
        flag = true;
        if (value !== undefined) {
          timers.clearTimeout(value);
        }
        for (let unsubscribe of watchedPaths) {
          unsubscribe();
        }
        unsubscribeRemote?.();
      };
    },
  };
}
function migrationTelemetryFailureKind(code: unknown): string {
  if (code === "rate_limited") {
    return "backpressure";
  }
  if (
    code === "conflict" ||
    code === "lease_lost" ||
    code === "store_kept_changing"
  ) {
    return "conflict";
  }
  if (code === "too_large" || code === "collection_too_large") {
    return "too_large";
  }
  if (code === "invalid_content" || code === "bad_config") {
    return "invalid_content";
  }
  if (
    code === "not_writer" ||
    code === "not_declared" ||
    code === "capability_disabled"
  ) {
    return "capability_denied";
  }
  if (code === "upstream_error") {
    return "transient";
  }
  return "internal";
}
function reportMigrationFailure<
  Outcome extends {
    result: string;
    code?: unknown;
  },
>(outcome: Outcome): void {
  try {
    if (outcome.result === "aborted" || outcome.result === "failed") {
      artifactHealth.report(
        "sync",
        "failure",
        migrationTelemetryFailureKind(outcome.code),
      );
    }
  } catch {}
}
export {
  createStoreToFilesFoldController,
  migrationTelemetryFailureKind,
  reportMigrationFailure,
  STORE_FOLD_DEBOUNCE_MS,
  STORE_FOLD_MAX_RETRIES,
  STORE_FOLD_PUBLISH_SPACING_MS,
  STORE_FOLD_RETRY_DELAY_MS,
};
export function installFilesStoreFoldController(): () => void {
  return () => {
    STORE_FOLD_DEBOUNCE_MS = 1000;
    STORE_FOLD_PUBLISH_SPACING_MS = 1e4;
    STORE_FOLD_RETRY_DELAY_MS = 5000;
    STORE_FOLD_MAX_RETRIES = 5;
  };
}
