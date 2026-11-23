import { createBoardClashes } from "./board-clash";
import { createDesignStashOffer } from "./design-stash-offer";
import { uiMessage } from '@minedesign/contracts/ui-messages';
import type { DataRecord } from "../contracts/storage";
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { refreshDesignSystemFileOverlay } from "../design-system/file-overlay";
import { setDesignSystems } from "../design-system/store";
import { describeMergeField } from "../editor/model/three-way-merge";
import { artboardStorePath } from "../editor/session/artboard-state";
import { retryAccessFailure } from "./access-retry";
import { classifyBootstrapFailure, getBootstrapRetryDelay, getRestartDelay, readBootFiles } from "./boot-reader";
import { normalizeDocumentTitle, normalizeNewDocumentTitle } from "./database-document-store";
import { buildDesignDocumentFromIndex, buildSelectedBoardsDocument, createEmptyDesignIndex, FILES_INDEX_MERGE_POLICY, INDEX_DESIGN_SYSTEM_TOKENS_KEY, INDEX_LEFT_OUT_KEY, INDEX_SOURCE_KEY, mergeDesignPages, normalizeDesignIndex, orderedDesignMapKeys, parseIndexDeletionSets, updateDesignIndexFromDocument } from "./design-index";
import { updateDesignSourceFile } from "./design-source";
import { recordEdit } from "./edit-count";
import { canvasMetadataFile, getMimeTypeForPath, hashFileMap, isArtboardFile, isDesignSystemFile, isNarrowedFileContext, isSafeProjectPath, isSupportedProjectAsset, parseCanvasMetadata, PlatformFileContentFilesValue as MAX_LISTED_PROJECT_FILES, defaultDocumentFileBytes as MAX_DESIGN_FILE_BYTES, PlatformFileContentWebpAvifPattern as BINARY_IMAGE_PATTERN } from "./file-content";
import { PlatformFilesHotReloadItems as FILE_READ_RETRY_DELAYS_MS } from "./files-hot-reload";
import { createFilesPublisher } from "./files-publisher";
import { cloneIndexValue, replaceIndexObjectProperties } from "./index-merge";
import { createIndexFileState, stringifyCanonicalIndex } from "./index-state";
import { fromProjectContentPath, isReservedProjectPath, projectMetadataPaths, projectPathPrefix, toProjectContentPath } from "./project-paths";
import { applyCrashStashEdits, describeStuckSave, describeUnsendableEdits } from "./save-notices";
import { CreatedOnFilesValue, getStorageMigrationMarker, migrationTimestampMarker } from "./storage-migration";
import { CANVAS_READ_ERROR_REASON } from "./write-access";

var hasUnstashedUnsendableEdits: Dynamic;
var filesDocumentTimers: Dynamic;
var DESIGN_FILE_MIME_TYPES: Dynamic;
var canSaveDesignFile: Dynamic;
var describeUnsupportedDesignFile: Dynamic;
var isMissingRequiredDesignFile: Dynamic;
var describeReservedDesignFilename: Dynamic;
var describeMissingDesignFile: Dynamic;
var describeUnsavableDesignFile: Dynamic;
var DESIGN_INDEX_FILE_PATH: Dynamic;
var DESIGN_RESTART_MAX_ATTEMPTS: Dynamic;
var DESIGN_RESTART_DELAY_MS: Dynamic;
var DESIGN_BOOT_MAX_ATTEMPTS: Dynamic;
var DESIGN_BOOT_MAX_WAIT_MS: Dynamic;
var bytesToBase64: Dynamic;
var base64ToBytes: Dynamic;
var FILE_READ_MAX_RETRIES: Dynamic;
var FILE_READ_TIMEOUT_MS: Dynamic;
var FILES_ERROR_DATABASE_ALIASES: Dynamic;
function getDesignFileContentType(path?: Dynamic): Dynamic {
  let extension: Dynamic = path
    .slice(path.lastIndexOf(".") + 1)
    .toLowerCase();
  return (
    getMimeTypeForPath(path) ??
    (Object.hasOwn(DESIGN_FILE_MIME_TYPES, extension)
      ? DESIGN_FILE_MIME_TYPES[extension]
      : null)
  );
}
function validateListedDesignFile(file?: Dynamic): Dynamic {
  let relativePath: Dynamic = fromProjectContentPath(
    file.path,
    "design",
  );
  return relativePath === undefined ||
    relativePath === canvasMetadataFile ||
    !isSafeProjectPath(relativePath) ||
    (!isArtboardFile(relativePath) &&
      !isSupportedProjectAsset(relativePath)) ||
    file.size > MAX_DESIGN_FILE_BYTES
    ? null
    : relativePath;
}
function encodeDesignPortFile(path?: Dynamic, text?: Dynamic): Dynamic {
  let contentType: Dynamic = getDesignFileContentType(path) ?? "text/plain";
  if (!BINARY_IMAGE_PATTERN.test(path))
    return {
      content: text,
      contentType: contentType,
    };
  try {
    return {
      content: new Blob([base64ToBytes(text)], {
        type: contentType,
      }),
      contentType: contentType,
    };
  } catch {
    return {
      content: text,
      contentType: "text/plain",
    };
  }
}
function countPortContentBytes(files?: Dynamic): Dynamic {
  let bytes: Dynamic = 0;
  for (let file of Object.values(files) as Dynamic) {
    let content: Dynamic =
      file !== null && typeof file == "object" && !(file instanceof Blob)
        ? file.content
        : file;
    typeof content == "string"
      ? (bytes += content.length)
      : content != null &&
        typeof content.size == "number" &&
        (bytes += content.size);
  }
  return bytes;
}
function describeIndexMergeConflict(
  conflict?: Dynamic,
  details?: Dynamic,
): Dynamic {
  let properties: Dynamic = [
      ...new Set(details.map(describeMergeField)),
    ],
    valueSummary: Dynamic =
      details.length === 1 && details[0].kind !== "text"
        ? ": yours " +
          (details[0].to ?? "removed") +
          ", theirs " +
          (details[0].theirs ?? "removed")
        : "",
    propertySummary: Dynamic =
      properties.slice(0, 3).join(", ") +
      (properties.length > 3
        ? " and " + String(properties.length - 3) + " more"
        : "");
  return (
    "You and someone else changed the same thing on \u201C" +
    conflict.replace(/\.dc\.html$/, "") +
    "\u201D at the same moment (" +
    propertySummary +
    valueSummary +
    "). Yours was kept."
  );
}
function describeSamePropertyConflict(
  conflict?: Dynamic,
  details?: Dynamic,
): Dynamic {
  let properties: Dynamic = [
      ...new Set(details.map(describeMergeField)),
    ],
    propertySummary: Dynamic =
      properties.slice(0, 3).join(", ") +
      (properties.length > 3
        ? " and " + String(properties.length - 3) + " more"
        : "");
  return (
    "Someone else changed the same thing you just changed on \u201C" +
    conflict.replace(/\.dc\.html$/, "") +
    "\u201D (" +
    propertySummary +
    "). Theirs replaced yours."
  );
}
function createFilesDesignDocument(documentOptions?: Dynamic): Dynamic {
  let timers: Dynamic = documentOptions.timers ?? filesDocumentTimers,
    canWrite: Dynamic = (documentOptions.canWrite ?? true) && documentOptions.port.canWrite,
    hasPartialListing: Dynamic = false,
    notice: Dynamic = (message?: Dynamic): Dynamic => documentOptions.onNotice?.(message),
    defaultTitle: Dynamic =
      normalizeDocumentTitle(documentOptions.defaultTitle) ?? "Design",
    state: Dynamic = {
      title: defaultTitle,
      content: {
        files: {},
      },
      comments: [],
    },
    loadState: Dynamic = "loading",
    disposed: Dynamic = false,
    lastSaveAt: Dynamic,
    lastSaveError: Dynamic,
    syncState: Dynamic = {
      dirty: 0,
      inFlight: false,
    },
    liveHashes: Dynamic = new Map(),
    publishedHashes: Dynamic = new Map(),
    loadedFiles: Dynamic = {},
    missingBoards: Dynamic = new Set(),
    savedFiles: Dynamic = {},
    ownChangedHashes: Dynamic = new Map(),
    undoHistory: Dynamic = [],
    fileDirtyVersions: Dynamic = new Map(),
    keptNoteIds: Dynamic = new Set(),
    keptPageIds: Dynamic = new Set(),
    knownArtboardFiles: Dynamic = new Set(),
    clashes: Dynamic = createBoardClashes({
      documentOptions: documentOptions,
      timers: timers,
      liveHashes: liveHashes,
      publishedHashes: publishedHashes,
      fileDirtyVersions: fileDirtyVersions,
      knownArtboardFiles: knownArtboardFiles,
      undoHistory: undoHistory,
      get disposed() { return disposed; },
      get state() { return state; },
      get loadedFiles() { return loadedFiles; },
      get savedFiles() { return savedFiles; },
      get publisher() { return publisher; },
      get indexState() { return indexState; },
      get bootMaxAttempts() { return DESIGN_BOOT_MAX_ATTEMPTS; },
      get bootMaxWaitMs() { return DESIGN_BOOT_MAX_WAIT_MS; },
      get restartDelayMs() { return DESIGN_RESTART_DELAY_MS; },
      notice: notice,
      portVersion: (): Dynamic => trackedPort.version(),
      readFiles: (paths): Promise<Dynamic> => readFiles(paths),
      adoptRemoteFiles: (files): Dynamic => adoptRemoteFiles(files),
      replaceDocument: (nextDocument): Dynamic => replaceDocument(nextDocument),
      scheduleLocalSave: (): Dynamic => scheduleLocalSave(),
      handleRemoteUpdate: (update): Dynamic => handleRemoteUpdate(update),
      shouldHoldRemoteFile: (relativePath): Dynamic => shouldHoldRemoteFile(relativePath),
      hasUnsavedFileEdits: (relativePath): Dynamic => hasUnsavedFileEdits(relativePath),
      describeIndexMergeConflict: describeIndexMergeConflict,
      describeSamePropertyConflict: describeSamePropertyConflict,
    }),
    rememberArtboards: Dynamic = (files?: Dynamic): Dynamic => {
      for (let filePath of Object.keys(files) as Dynamic)
        isArtboardFile(filePath) &&
          knownArtboardFiles.add(filePath);
    },
    removedNoteIds: Dynamic = new Set(),
    removedPageIds: Dynamic = new Set(),
    contentListeners: Dynamic = new Set(),
    saveListeners: Dynamic = new Set(),
    loadListeners: Dynamic = new Set(),
    notifyContent: Dynamic = (isRemote?: Dynamic): Dynamic => {
      for (let listener of [...contentListeners] as Dynamic)
        listener(
          isRemote
            ? {
                remote: true,
              }
            : undefined,
        );
    },
    notifySave: Dynamic = (): Dynamic => {
      let saveState: Dynamic = getSaveState();
      for (let listener of [...saveListeners] as Dynamic) listener(saveState);
    },
    trackedPort: Dynamic = Object.create(documentOptions.port, {
      publish: {
        value: async (
          filesToPublish?: Dynamic,
          publishOptions?: Dynamic,
        ): Promise<Dynamic> => {
          let debugSaveId: Dynamic = documentOptions.debug?.saveStart(
              Object.keys(filesToPublish),
              countPortContentBytes(filesToPublish),
            ),
            publishResult: Dynamic,
            version: Dynamic = documentOptions.port.version().version;
          try {
            publishResult = await documentOptions.port.publish(filesToPublish, publishOptions);
          } catch (error: Dynamic) {
            throw (
              debugSaveId !== undefined &&
                documentOptions.debug?.saveEnd(debugSaveId, {
                  ok: false,
                  code: "threw",
                  raw:
                    error instanceof Error
                      ? error.message
                      : String(error),
                }),
              error
            );
          }
          let isOwnVersion: Dynamic =
            publishResult.ok &&
            publishResult.unchanged !== true &&
            publishResult.version !== version &&
            documentOptions.port.version().version === publishResult.version &&
            (publishResult.changed === undefined
              ? publishResult.preconditionsChecked !== true
              : publishResult.changed.length === 0);
          debugSaveId !== undefined &&
            documentOptions.debug?.saveEnd(
              debugSaveId,
              publishResult.ok
                ? {
                    ok: true,
                    version: publishResult.version,
                    ...(isOwnVersion
                      ? {
                          own: isOwnVersion,
                        }
                      : {}),
                  }
                : {
                    ok: false,
                    code: publishResult.code,
                    raw: publishResult,
                  },
            );
          if (publishResult.ok) {
            let computedShas: Dynamic =
              publishResult.shas === undefined
                ? await hashFileMap(filesToPublish)
                : {};
            for (let [absolutePath, file] of Object.entries(filesToPublish) as Dynamic) {
              if (file === null) {
                liveHashes.delete(absolutePath);
                publishedHashes.set(absolutePath, null);
                let removedPath: Dynamic = fromProjectContentPath(
                  absolutePath,
                  "design",
                );
                removedPath !== undefined && clashes.forgetOverwrittenEdit(removedPath);
                continue;
              }
              let sha: Dynamic =
                publishResult.shas?.[absolutePath] ?? computedShas[absolutePath];
              if (sha === undefined) continue;
              liveHashes.set(absolutePath, sha);
              publishedHashes.set(absolutePath, sha);
              let fileText: Dynamic =
                  file !== null &&
                  typeof file == "object" &&
                  !(file instanceof Blob)
                    ? file.content
                    : file,
                relativePath: Dynamic = fromProjectContentPath(
                  absolutePath,
                  "design",
                );
              typeof fileText == "string" &&
                relativePath !== undefined &&
                (isArtboardFile(relativePath) &&
                  savedFiles[relativePath] !== undefined &&
                  savedFiles[relativePath] !== fileText &&
                  documentOptions.sameBoardRule !== "last" &&
                  clashes.rememberOverwrittenEdit({
                    file: relativePath,
                    base: savedFiles[relativePath],
                    mine: fileText,
                    at: timers.now(),
                  }),
                (savedFiles[relativePath] = fileText));
            }
            for (let [absolutePath, file] of Object.entries(filesToPublish) as Dynamic)
              ownChangedHashes.set(
                absolutePath,
                file === null ? null : (liveHashes.get(absolutePath) ?? null),
              );
            lastSaveAt = timers.now();
            lastSaveError = undefined;
          }
          return publishResult;
        },
      },
    }),
    indexState: Dynamic = createIndexFileState({
      path: DESIGN_INDEX_FILE_PATH,
      port: trackedPort,
      schema: FILES_INDEX_MERGE_POLICY,
      empty: (): Dynamic => createEmptyDesignIndex(),
    }),
    serializeIndex: Dynamic = indexState.serialize.bind(indexState);
  indexState.serialize = (): Dynamic => (
    indexState.baseSha() === null &&
      getStorageMigrationMarker(indexState.get()) === null &&
      (indexState.get()[CreatedOnFilesValue] = migrationTimestampMarker({
        at: new Date().toISOString(),
      })),
    serializeIndex()
  );
  let mergeIndex: Dynamic = indexState.mergeFrom.bind(indexState),
    pagesOverlap: Dynamic = false;
  indexState.mergeFrom = (remoteIndex?: Dynamic): Dynamic => {
    let baseIndex: Dynamic = indexState.base(),
      localIndex: Dynamic = indexState.get();
    trackMergedDeletions(baseIndex, localIndex, remoteIndex);
    let pageMerge: Dynamic = mergeDesignPages(
      readIndexPages(baseIndex.pages),
      readIndexPages(localIndex.pages),
      readIndexPages(remoteIndex.pages),
    );
    pagesOverlap = pageMerge.overlap;
    let mergedIndex: Dynamic = mergeIndex(remoteIndex);
    Array.isArray(mergedIndex.pages)
      ? mergedIndex.pages.splice(0, mergedIndex.pages.length, ...pageMerge.pages)
      : (mergedIndex.pages = pageMerge.pages);
    return mergedIndex;
  };
  let readIndexPages: Dynamic = (pages?: Dynamic): Dynamic =>
      Array.isArray(pages)
        ? pages.filter(
            (page?: Dynamic): Dynamic =>
              typeof page == "object" &&
              page !== null &&
              typeof page.id == "string",
          )
        : [],
    readIndexKeys: Dynamic = (table?: Dynamic): Dynamic =>
      typeof table == "object" && table !== null && !Array.isArray(table)
        ? Object.keys(table)
        : [];
  function trackMergedDeletions(
    baseIndex?: Dynamic,
    localIndex?: Dynamic,
    remoteIndex?: Dynamic,
  ): Dynamic {
    let remoteBoardPaths: Dynamic = new Set(readIndexKeys(remoteIndex.boards)),
      remoteNoteIds: Dynamic = new Set(readIndexKeys(remoteIndex.notes)),
      remotePageIds: Dynamic = new Set(
        readIndexPages(remoteIndex.pages).map((page?: Dynamic): Dynamic => page.id),
      ),
      baseBoardPaths: Dynamic = new Set(readIndexKeys(baseIndex.boards)),
      baseNoteIds: Dynamic = new Set(readIndexKeys(baseIndex.notes)),
      basePageIds: Dynamic = new Set(
        readIndexPages(baseIndex.pages).map((page?: Dynamic): Dynamic => page.id),
      );
    for (let boardPath of baseBoardPaths as Dynamic)
      !remoteBoardPaths.has(boardPath) &&
        !fileDirtyVersions.has(boardPath) &&
        fileDirtyVersions.set(
          boardPath,
          cloneIndexValue(
            localIndex.boards?.[boardPath] ?? baseIndex.boards[boardPath],
          ),
        );
    for (let noteId of baseNoteIds as Dynamic)
      remoteNoteIds.has(noteId) ||
        (keptNoteIds.add(noteId), removedNoteIds.delete(noteId));
    for (let pageId of basePageIds as Dynamic)
      remotePageIds.has(pageId) ||
        (keptPageIds.add(pageId), removedPageIds.delete(pageId));
    for (let boardPath of remoteBoardPaths as Dynamic)
      baseBoardPaths.has(boardPath) || fileDirtyVersions.delete(boardPath);
    for (let noteId of remoteNoteIds as Dynamic)
      baseNoteIds.has(noteId) || keptNoteIds.delete(noteId);
    for (let pageId of remotePageIds as Dynamic)
      basePageIds.has(pageId) || keptPageIds.delete(pageId);
  }
  let notifyIndexMerge: Dynamic = (conflictKeys?: Dynamic): Dynamic => {
      if (documentOptions.sameBoardRule === "last") return;
      let visibleConflicts: Dynamic = conflictKeys.filter(
        (key?: Dynamic): Dynamic =>
          (key !== "pages" || pagesOverlap) &&
          !key.startsWith(CreatedOnFilesValue + "/"),
      );
      visibleConflicts.length > 0 &&
        notice(
          "Someone else changed " +
            describeIndexConflictTarget(visibleConflicts) +
            " at the same moment; their change was kept.",
        );
    },
    publisher: Dynamic = createFilesPublisher({
      port: trackedPort,
      index: indexState,
      timers: timers,
      ...(documentOptions.saveStash !== undefined
        ? {
            stash: documentOptions.saveStash,
          }
        : {}),
      ...(documentOptions.paced !== undefined
        ? {
            paced: documentOptions.paced,
          }
        : {}),
      onConflict: (conflict?: Dynamic): Dynamic => {
        clashes.handleBoardClash(conflict.path, conflict.theirsSha, "save-refused");
      },
      onIndexMerged: notifyIndexMerge,
      onState(nextSyncState: Dynamic): Dynamic {
        syncState = nextSyncState;
        nextSyncState.lastError !== undefined &&
          (lastSaveError = {
            code: "refused",
            message: nextSyncState.lastError,
          });
        nextSyncState.stuck === undefined && (reportedStuckSave = false);
        let isIdle: Dynamic =
          nextSyncState.dirty === 0 && !nextSyncState.inFlight && nextSyncState.stuck === undefined;
        if (isIdle)
          for (let filePath of reportedUnsendablePaths as Dynamic)
            (nextSyncState.unsendable ?? []).some(
              (edit?: Dynamic): Dynamic => edit.path === filePath,
            ) || reportedUnsendablePaths.delete(filePath);
        ((nextSyncState.stuck !== undefined && !reportedStuckSave) ||
          (hasNewUnsendableEdits(nextSyncState) && (isIdle || nextSyncState.stuck !== undefined))) &&
          scheduleSaveStatusUpdate();
        notifySave();
      },
    }),
    reportedStuckSave: Dynamic = false,
    reportedUnsendablePaths: Dynamic = new Set(),
    hasNewUnsendableEdits: Dynamic = (saveState?: Dynamic): Dynamic =>
      (saveState.unsendable ?? []).some(
        (edit?: Dynamic): Dynamic => !reportedUnsendablePaths.has(edit.path),
      ),
    describeLeftOutEdits: Dynamic = (restSaved?: Dynamic): Dynamic =>
      describeUnsendableEdits(syncState.unsendable ?? [], {
        restSaved: restSaved,
        stashed: syncState.unsendableStashed === true,
      }),
    describeSaveFailure: Dynamic = (stuckSave?: Dynamic): Dynamic =>
      describeStuckSave(stuckSave, timers.now()) +
      (syncState.unsendable !== undefined ? " " + describeLeftOutEdits(false) : ""),
    saveStatusTimer: Dynamic;
  function scheduleSaveStatusUpdate(): Dynamic {
    saveStatusTimer === undefined &&
      (saveStatusTimer = timers.setTimeout((): Dynamic => {
        saveStatusTimer = undefined;
        let latestSyncState: Dynamic = syncState;
        if (
          !(
            disposed ||
            (latestSyncState.stuck === undefined &&
              (latestSyncState.dirty > 0 || latestSyncState.inFlight))
          )
        ) {
          if (latestSyncState.stuck !== undefined && !reportedStuckSave)
            notice(describeSaveFailure(latestSyncState.stuck));
          else if (hasNewUnsendableEdits(latestSyncState))
            notice(describeLeftOutEdits(latestSyncState.stuck === undefined));
          else return;
          latestSyncState.stuck !== undefined && (reportedStuckSave = true);
          for (let edit of (latestSyncState.unsendable ?? []) as Dynamic)
            reportedUnsendablePaths.add(edit.path);
        }
      }, 1e3));
  }
  function describeIndexConflictTarget(conflictKeys?: Dynamic): Dynamic {
    let firstKey: Dynamic = conflictKeys[0] ?? "",
      boardMatch: Dynamic = /^boards\/(.+)\/[^/]+$/.exec(firstKey);
    return boardMatch
      ? "\u201C" + boardMatch[1].replace(/\.dc\.html$/, "") + "\u201D"
      : "the canvas layout";
  }
  function getSaveState(): Dynamic {
    return loadState === "loading"
      ? {
          status: "loading",
        }
      : canWrite
        ? syncState.stuck !== undefined
          ? {
              status: "error",
              message: describeSaveFailure(syncState.stuck),
            }
          : syncState.lastError !== undefined && syncState.dirty > 0
            ? {
                status: "error",
                get message() { return uiMessage("canvas.filesDesignDocument.changesAreWaitingToSave"); },
              }
            : syncState.inFlight ||
                syncState.dirty > 0 ||
                localSaveTimer !== undefined
              ? {
                  status: "saving",
                }
              : syncState.unsendable !== undefined
                ? {
                    status: "error",
                    message: describeLeftOutEdits(true),
                    leftOut: syncState.unsendable.map(
                      (edit?: Dynamic): Dynamic => ({
                        id: edit.path,
                        cause: edit.cause,
                      }),
                    ),
                  }
                : {
                    status: "ready",
                  }
        : {
            status: "readonly",
            message:
              hasPartialListing && (documentOptions.canWrite ?? true)
                ? CANVAS_READ_ERROR_REASON
                : (documentOptions.readOnlyReason ??
                  "You can view this canvas but not edit it."),
            atBoot: true,
          };
  }
  function readWithRetry(read?: Dynamic): Dynamic {
    return retryAccessFailure(
      read,
      timers,
      undefined,
      FILE_READ_RETRY_DELAYS_MS,
    );
  }
  async function readFile(relativePath?: Dynamic): Promise<Dynamic> {
    let absolutePath: Dynamic = toProjectContentPath(relativePath);
    if (BINARY_IMAGE_PATTERN.test(relativePath)) {
      let binaryFile: Dynamic = await readWithRetry(
        (): Dynamic => trackedPort.readBytes(absolutePath),
      );
      return bytesToBase64(binaryFile.bytes);
    }
    return (await readWithRetry((): Dynamic => trackedPort.readText(absolutePath)))
      .text;
  }
  async function readFiles(pathsToRead?: Dynamic): Promise<Dynamic> {
    let files: Dynamic = {},
      nextIndex: Dynamic = 0,
      readNextBatch: Dynamic = async (): Promise<Dynamic> => {
        for (; nextIndex < pathsToRead.length; ) {
          let filePath: Dynamic = pathsToRead[nextIndex++];
          try {
            files[filePath] = await readFile(filePath);
          } catch (error: Dynamic) {
            console.warn(
              "design (files): could not read " +
                toProjectContentPath(filePath) +
                " \u2014 " +
                (error instanceof Error
                  ? error.message
                  : String(error)),
            );
          }
        }
      };
    await Promise.all(
      Array.from(
        {
          length: Math.min(DESIGN_RESTART_MAX_ATTEMPTS, pathsToRead.length),
        },
        readNextBatch,
      ),
    );
    return files;
  }
  function composeFromFiles(files?: Dynamic): Dynamic {
    let normalizedIndex: Dynamic = normalizeDesignIndex(
      indexState.get(),
    );
    setDesignSystems(
      refreshDesignSystemFileOverlay(
        normalizedIndex,
        files,
        normalizedIndex[INDEX_DESIGN_SYSTEM_TOKENS_KEY],
      ),
    );
    updateDesignSourceFile(normalizedIndex[INDEX_SOURCE_KEY]);
    missingBoards.clear();
    for (let boardPath of Object.keys(normalizedIndex.boards) as Dynamic)
      files[boardPath] === undefined && missingBoards.add(boardPath);
    rememberArtboards(files);
    let { [canvasMetadataFile]: _previousCanvasMetadata, ...contentFiles }: Dynamic =
        files,
      indexWithLocalBoards: Dynamic = normalizedIndex;
    for (let [boardPath, localBoard] of fileDirtyVersions as Dynamic)
      contentFiles[boardPath] === undefined ||
        boardPath in normalizedIndex.boards ||
        localBoard === undefined ||
        (indexWithLocalBoards === normalizedIndex &&
          (indexWithLocalBoards = {
            ...normalizedIndex,
            boards: {
              ...normalizedIndex.boards,
            },
            order: [...normalizedIndex.order],
          }),
        (indexWithLocalBoards.boards[boardPath] = localBoard),
        indexWithLocalBoards.order.push(boardPath));
    lastComposedCanvasMetadata = buildDesignDocumentFromIndex(indexWithLocalBoards, contentFiles);
    return {
      files: {
        ...contentFiles,
        [canvasMetadataFile]: lastComposedCanvasMetadata,
      },
    };
  }
  let lastComposedCanvasMetadata: Dynamic,
    loadRetryCount: Dynamic = 0,
    loadRetryTimer: Dynamic,
    lastLoadFailure: Dynamic,
    firstLoadFailureAt: Dynamic,
    loadRetryAt: Dynamic = 0;
  function scheduleLoadRetry(delayMs?: Dynamic): Dynamic {
    if (!disposed) {
      if (loadRetryTimer !== undefined) {
        if (timers.now() + delayMs >= loadRetryAt) return;
        timers.clearTimeout(loadRetryTimer);
      }
      loadRetryAt = timers.now() + delayMs;
      documentOptions.debug?.event("load-retry", {
        inMs: delayMs,
        attempt: loadRetryCount,
        error: lastSaveError?.message,
      });
      loadRetryTimer = timers.setTimeout((): Dynamic => {
        loadRetryTimer = undefined;
        retryFailedLoad();
      }, delayMs);
    }
  }
  const stashOffer = createDesignStashOffer({
    latestFileSha: (path) => latestFileSha(path),
    canRestore: () => canWrite && loadState === "live" && !disposed,
    show: (offer) => documentOptions.onStashOffer?.(offer),
    restore: (stash) => applyStashedContent(stash),
    discard: () => {
      documentOptions.saveStash?.clearOffered();
      notifyContent(false);
    },
  });
  async function loadFiles(isManualRetry: Dynamic = false): Promise<Dynamic> {
    let loadStartedAt: Dynamic = timers.now();
    try {
      let bootFiles: Dynamic = await readBootFiles({
        port: trackedPort,
        indexPath: DESIGN_INDEX_FILE_PATH,
        timers: timers,
        wants: (file?: Dynamic): Dynamic => {
          let relativePath: Dynamic = validateListedDesignFile(file);
          return (
            relativePath !== null &&
            !BINARY_IMAGE_PATTERN.test(relativePath)
          );
        },
        mayWrite: documentOptions.canWrite ?? true,
        onEvent: (event?: Dynamic): Dynamic =>
          documentOptions.debug?.event(event.type, event),
      }).catch(async (bootError?: Dynamic): Promise<Dynamic> => {
        if (classifyBootstrapFailure(bootError) !== "no_index")
          throw bootError;
        let listing: Dynamic = await trackedPort.list(),
          isPartialListing: Dynamic =
            bootError.narrowed ??
            isNarrowedFileContext(listing, trackedPort);
        if (isPartialListing && (documentOptions.canWrite ?? true))
          throw Object.assign(
            new Error(
              "this canvas\u2019s file list is still partial, so whether it has an index cannot be told yet",
            ),
            {
              cause: bootError,
              narrowed: true,
            },
          );
        let textFiles: Dynamic = new Map();
        await Promise.all(
          listing
            .filter((file?: Dynamic): Dynamic => {
              let relativePath: Dynamic = validateListedDesignFile(file);
              return (
                relativePath !== null &&
                !BINARY_IMAGE_PATTERN.test(relativePath)
              );
            })
            .slice(0, MAX_LISTED_PROJECT_FILES - 1)
            .map(async (file?: Dynamic): Promise<Dynamic> => {
              try {
                textFiles.set(
                  file.path,
                  await readWithRetry(
                    (): Dynamic => trackedPort.readText(file.path),
                  ),
                );
              } catch {}
            }),
        );
        for (let file of listing as Dynamic) {
          let relativePath: Dynamic = validateListedDesignFile(file);
          relativePath === null ||
            !isArtboardFile(relativePath) ||
            isDesignSystemFile(relativePath) ||
            textFiles.has(file.path) ||
            relativePath in indexState.get().boards ||
            ((indexState.get().boards[relativePath] = {
              x: 0,
              y: 0,
              w: 1280,
              h: 720,
            }),
            indexState.get().order.push(relativePath));
        }
        return {
          listing: listing,
          index: undefined,
          files: textFiles,
          narrowed: isPartialListing,
        };
      });
      hasPartialListing = bootFiles.narrowed === true;
      canWrite =
        (documentOptions.canWrite ?? true) &&
        documentOptions.port.canWrite &&
        !hasPartialListing;
      for (let file of bootFiles.listing as Dynamic)
        publishedHashes.set(file.path, file.sha256);
      bootFiles.index !== undefined &&
        (indexState.loadText !== undefined
          ? indexState.loadText(bootFiles.index.text, bootFiles.index.sha256)
          : await indexState.load(),
        liveHashes.set(DESIGN_INDEX_FILE_PATH, bootFiles.index.sha256));
      let supportedFiles: Dynamic = bootFiles.listing
          .map(
            (file?: Dynamic): Dynamic => [
              file,
              validateListedDesignFile(file),
            ],
          )
          .filter((entry?: Dynamic): Dynamic => entry[1] !== null)
          .slice(0, MAX_LISTED_PROJECT_FILES - 1),
        files: Dynamic = {};
      for (let [file, relativePath] of supportedFiles as Dynamic) {
        let entry: Dynamic = bootFiles.files.get(file.path);
        entry !== undefined &&
          ((files[relativePath] = entry.text),
          liveHashes.set(file.path, entry.sha256));
      }
      let binaryEntries: Dynamic = supportedFiles.filter(
          ([, relativePath]: Dynamic): Dynamic =>
            BINARY_IMAGE_PATTERN.test(relativePath),
        ),
        binaryFiles: Dynamic = await readFiles(
          binaryEntries.map(([, relativePath]: Dynamic): Dynamic => relativePath),
        );
      for (let [file, relativePath] of binaryEntries as Dynamic)
        binaryFiles[relativePath] !== undefined &&
          ((files[relativePath] = binaryFiles[relativePath]),
          liveHashes.set(file.path, file.sha256));
      if (disposed) return;
      let content: Dynamic = composeFromFiles(files);
      rememberManifestDeletions(
        parseCanvasMetadata(
          content.files[canvasMetadataFile],
          content.files,
        ),
      );
      let omittedFiles: Dynamic = indexState.get()[INDEX_LEFT_OUT_KEY],
        artboardReferencesFile: Dynamic = (filePath?: Dynamic): Dynamic =>
          Object.entries(content.files).some(
            ([boardPath, boardHtml]: Dynamic): Dynamic =>
              isArtboardFile(boardPath) &&
              boardHtml.includes(filePath.slice(filePath.lastIndexOf("/") + 1)),
          );
      if (canWrite && Array.isArray(omittedFiles))
        for (let filePath of omittedFiles.slice(0, 3) as Dynamic)
          typeof filePath == "string" &&
            !reportedUnsupportedPaths.has(filePath) &&
            artboardReferencesFile(filePath) &&
            (reportedUnsupportedPaths.add(filePath),
            documentOptions.onNotice?.(describeUnsavableDesignFile(filePath)));
      loadedFiles = {
        ...content.files,
      };
      savedFiles = {
        ...files,
      };
      let title: Dynamic =
        normalizeDocumentTitle(indexState.get().title.trim()) ??
        state.title;
      state = {
        ...state,
        title: title,
        content: content,
      };
      loadState = "live";
      loadRetryCount = 0;
      firstLoadFailureAt = undefined;
      lastLoadFailure = undefined;
      if (documentOptions.saveStash !== undefined && canWrite) {
        let listedPaths: Dynamic = new Set(
          bootFiles.listing.map((file?: Dynamic): Dynamic => file.path),
        );
        stashOffer.current = await applyCrashStashEdits(
          documentOptions.saveStash,
          (filePath?: Dynamic): Dynamic =>
            filePath === DESIGN_INDEX_FILE_PATH
              ? indexState.serialize()
              : (bootFiles.files.get(filePath)?.text ??
                (listedPaths.has(filePath) ? undefined : null)),
        );
        let stashedIndex: Dynamic = stashOffer.current?.edits.find(
            (edit?: Dynamic): Dynamic =>
              edit.path === DESIGN_INDEX_FILE_PATH,
          ),
          indexAlreadyMatches: Dynamic = false;
        try {
          indexAlreadyMatches =
            stashedIndex !== undefined &&
            stashedIndex.text ===
              serializeDocumentIndex(
                parseCurrentManifest(content.files, true),
                title,
              );
        } catch {}
        if (stashOffer.current !== undefined && stashedIndex !== undefined && indexAlreadyMatches) {
          let remainingEdits: Dynamic = stashOffer.current.edits.filter(
            (edit?: Dynamic): Dynamic => edit !== stashedIndex,
          );
          remainingEdits.length === 0
            ? ((stashOffer.current = undefined), await documentOptions.saveStash.clearOffered())
            : (stashOffer.current = {
                ...stashOffer.current,
                edits: remainingEdits,
              });
        }
      }
    } catch (error: Dynamic) {
      classifyBootstrapFailure(error) === "access_revoked" &&
        documentOptions.saveStash?.clearArtifact();
      firstLoadFailureAt ??= timers.now();
      let delayMs: Dynamic = getBootstrapRetryDelay(
        error,
        loadRetryCount,
      );
      console.error(
        "design (files): this canvas\u2019s files could not be loaded" +
          (delayMs === undefined ? "" : " (it will be tried again)"),
        error,
      );
      loadState = "failed";
      lastLoadFailure = {
        error: error,
        at: loadStartedAt,
      };
      lastSaveError = {
        code: "timeout",
        message:
          error instanceof Error
            ? error.message
            : String(error?.message ?? error),
      };
      delayMs !== undefined && (isManualRetry || loadRetryCount++, scheduleLoadRetry(delayMs));
    }
    for (let listener of [...loadListeners] as Dynamic) listener();
    notifyContent(true);
    notifySave();
    stashOffer.current !== undefined && loadState === "live" && stashOffer.offer();
  }
  let localSaveTimer: Dynamic;
  function scheduleLocalSave(): Dynamic {
    localSaveTimer !== undefined ||
      !canWrite ||
      loadState !== "live" ||
      ((localSaveTimer = timers.setTimeout((): Dynamic => {
        localSaveTimer = undefined;
        publishLocalChanges();
      }, 0)),
      notifySave());
  }
  let hasNewerPublishedHash: Dynamic = (filePath?: Dynamic): Dynamic =>
    publishedHashes.has(filePath) &&
    (publishedHashes.get(filePath) ?? undefined) !== liveHashes.get(filePath) &&
    liveHashes.has(filePath);
  function parseCurrentManifest(
    files?: Dynamic,
    forComparison: Dynamic = false,
  ): Dynamic {
    let metadataText: Dynamic = files[canvasMetadataFile],
      parsedManifest: Dynamic = parseCanvasMetadata(metadataText, files),
      deletions: Dynamic = parseIndexDeletionSets(metadataText),
      currentIndex: Dynamic = indexState.get();
    if (metadataText !== lastComposedCanvasMetadata && !forComparison) {
      for (let noteId of deletions.notes as Dynamic)
        keptNoteIds.has(noteId) || removedNoteIds.add(noteId);
      for (let pageId of deletions.pages as Dynamic)
        keptPageIds.has(pageId) || removedPageIds.add(pageId);
    }
    let keepBoards: Dynamic = new Set(missingBoards),
      keepNotes: Dynamic = new Set(),
      keepPages: Dynamic = new Set(),
      foundUnrecordedDeletions: Dynamic = false;
    for (let boardPath of Object.keys(currentIndex.boards) as Dynamic)
      !deletions.boards.has(boardPath) &&
        !locallyDeletedBoards.has(boardPath) &&
        (keepBoards.add(boardPath),
        !missingBoards.has(boardPath) &&
          !isDesignSystemFile(boardPath) &&
          (foundUnrecordedDeletions = true));
    for (let noteId of Object.keys(currentIndex.notes) as Dynamic)
      !deletions.notes.has(noteId) &&
        !removedNoteIds.has(noteId) &&
        (keepNotes.add(noteId), (foundUnrecordedDeletions = true));
    for (let page of readIndexPages(currentIndex.pages) as Dynamic)
      !deletions.pages.has(page.id) &&
        !removedPageIds.has(page.id) &&
        (keepPages.add(page.id), (foundUnrecordedDeletions = true));
    let deletionSignature: Dynamic = [...keepBoards]
      .filter(
        (boardPath?: Dynamic): Dynamic =>
          !missingBoards.has(boardPath) &&
          !isDesignSystemFile(boardPath),
      )
      .concat([...keepNotes], [...keepPages])
      .sort().join(`
`);
    forComparison ||
      (foundUnrecordedDeletions && deletionSignature !== previousDeletionSignature && scheduleFileSave(), (previousDeletionSignature = deletionSignature));
    let excludedFromWriteback: Dynamic = [],
      artboards: Dynamic = parsedManifest.artboards.filter(
        (artboard?: Dynamic): Dynamic =>
          fileDirtyVersions.has(artboard.file)
            ? (deletions.boards.has(artboard.file) &&
                !clashes.hasClash(artboard.file) &&
                !clashes.isHeld(artboard.file) &&
                !clashes.isResolving(artboard.file) &&
                !shouldHoldRemoteFile(artboard.file) &&
                excludedFromWriteback.push(artboard.file),
              false)
            : !(keepBoards.has(artboard.file) && !deletions.boards.has(artboard.file)),
      ),
      annotations: Dynamic = parsedManifest.annotations?.filter(
        (annotation?: Dynamic): Dynamic =>
          keptNoteIds.has(annotation.id)
            ? (deletions.notes.has(annotation.id) &&
                excludedFromWriteback.push("note " + annotation.id),
              false)
            : true,
      ),
      pages: Dynamic = parsedManifest.pages?.filter(
        (page?: Dynamic): Dynamic =>
          keptPageIds.has(page.id)
            ? (deletions.pages.has(page.id) &&
                excludedFromWriteback.push("page " + page.id),
              false)
            : true,
      );
    excludedFromWriteback.length > 0 &&
      !forComparison &&
      (documentOptions.debug?.event("delete-wins", {
        notWrittenBack: excludedFromWriteback,
      }),
      scheduleFileSave());
    let {
      annotations: _originalAnnotations,
      pages: _originalPages,
      ...restOfManifest
    }: Dynamic = parsedManifest;
    return {
      manifest: {
        ...restOfManifest,
        artboards: artboards,
        ...(annotations !== undefined && annotations.length > 0
          ? {
              annotations: annotations,
            }
          : {}),
        ...(pages !== undefined && pages.length > 0
          ? {
              pages: pages,
            }
          : {}),
      },
      keepBoards: keepBoards,
      keepNotes: keepNotes,
      keepPages: keepPages,
    };
  }
  function serializeDocumentIndex(
    parsed?: Dynamic,
    title?: Dynamic,
  ): Dynamic {
    let indexCopy: Dynamic = cloneIndexValue(indexState.get());
    updateDesignIndexFromDocument(
      indexCopy,
      parsed.manifest,
      title,
      parsed.keepBoards,
      parsed.keepNotes,
      parsed.keepPages,
    );
    return stringifyCanonicalIndex(indexCopy);
  }
  let locallyDeletedBoards: Dynamic = new Set();
  function rememberManifestDeletions(manifest?: Dynamic): Dynamic {
    for (let annotation of (manifest.annotations ?? []) as Dynamic)
      keptNoteIds.has(annotation.id) || removedNoteIds.add(annotation.id);
    for (let page of (manifest.pages ?? []) as Dynamic)
      keptPageIds.has(page.id) || removedPageIds.add(page.id);
  }
  let previousDeletionSignature: Dynamic = "",
    reportedUnsupportedPaths: Dynamic = new Set(),
    reportedReservedPaths: Dynamic = new Set(),
    fileSaveTimer: Dynamic;
  function scheduleFileSave(): Dynamic {
    fileSaveTimer !== undefined ||
      disposed ||
      (fileSaveTimer = timers.setTimeout((): Dynamic => {
        fileSaveTimer = undefined;
        !(disposed || loadState !== "live") &&
          (localSaveTimer !== undefined &&
            (timers.clearTimeout(localSaveTimer),
            (localSaveTimer = undefined),
            publishLocalChanges()),
          adoptRemoteFiles({
            ...state.content.files,
          }));
      }, 0));
  }
  function publishLocalChanges(): Dynamic {
    if (disposed || !canWrite) return;
    let files: Dynamic = state.content.files,
      queuedEdits: Dynamic = false;
    for (let [relativePath, fileContent] of Object.entries(files) as Dynamic) {
      if (
        relativePath === canvasMetadataFile ||
        loadedFiles[relativePath] === fileContent
      )
        continue;
      if (isMissingRequiredDesignFile(relativePath)) {
        loadedFiles[relativePath] = fileContent;
        reportedReservedPaths.has(relativePath) ||
          (reportedReservedPaths.add(relativePath),
          documentOptions.onNotice?.(describeReservedDesignFilename(relativePath)));
        continue;
      }
      let absolutePath: Dynamic = toProjectContentPath(relativePath);
      if (!clashes.isResolving(relativePath)) {
        if (fileDirtyVersions.has(relativePath) && !clashes.hasClash(relativePath)) {
          if (shouldHoldRemoteFile(relativePath)) {
            clashes.hold(relativePath);
            continue;
          }
          clashes.handleBoardClash(absolutePath, null, "remote-while-editing");
          continue;
        }
        if (clashes.hasClash(relativePath)) {
          clashes.remindStalePrompt(relativePath);
          continue;
        }
        if (hasNewerPublishedHash(absolutePath)) {
          if (shouldHoldRemoteFile(relativePath)) {
            clashes.hold(relativePath);
            continue;
          }
          clashes.handleBoardClash(
            absolutePath,
            publishedHashes.get(absolutePath) ?? null,
            "remote-while-editing",
          );
          continue;
        }
        loadedFiles[relativePath] = fileContent;
        missingBoards.delete(relativePath);
        if (!canSaveDesignFile(relativePath)) {
          reportedUnsupportedPaths.has(relativePath) ||
            (reportedUnsupportedPaths.add(relativePath),
            documentOptions.onNotice?.(describeUnsupportedDesignFile(relativePath)));
          continue;
        }
        publisher.markDirty(
          absolutePath,
          (): Dynamic =>
            encodeDesignPortFile(
              relativePath,
              state.content.files[relativePath] ?? fileContent,
            ),
          liveHashes.get(absolutePath) ?? null,
        );
        queuedEdits = true;
      }
    }
    for (let relativePath of Object.keys(loadedFiles) as Dynamic) {
      if (relativePath === canvasMetadataFile || relativePath in files)
        continue;
      delete loadedFiles[relativePath];
      let absolutePath: Dynamic = toProjectContentPath(relativePath);
      !canSaveDesignFile(relativePath) ||
        isMissingRequiredDesignFile(relativePath) ||
        (publisher.markDirty(
          absolutePath,
          (): Dynamic => null,
          liveHashes.get(absolutePath) ?? null,
        ),
        isArtboardFile(relativePath) && locallyDeletedBoards.add(relativePath),
        (queuedEdits = true));
    }
    for (let boardPath of [...locallyDeletedBoards] as Dynamic)
      boardPath in files && locallyDeletedBoards.delete(boardPath);
    let parsed: Dynamic = parseCurrentManifest(files),
      {
        manifest: manifest,
        keepBoards: keepBoards,
        keepNotes: keepNotes,
        keepPages: keepPages,
      }: Dynamic = parsed,
      currentIndexText: Dynamic = indexState.serialize(),
      wouldChangeIndex: Dynamic = (title?: Dynamic): Dynamic =>
        serializeDocumentIndex(parsed, title) !== currentIndexText;
    !(
      indexState.baseSha() === null &&
      state.title === defaultTitle &&
      !wouldChangeIndex(indexState.get().title)
    ) &&
      wouldChangeIndex(state.title) &&
      (indexState.update(
        (index?: Dynamic): Dynamic =>
          updateDesignIndexFromDocument(
            index,
            manifest,
            state.title,
            keepBoards,
            keepNotes,
            keepPages,
          ),
      ),
      (queuedEdits = true));
    let updatedIndex: Dynamic = indexState.get();
    for (let noteId of [...removedNoteIds] as Dynamic)
      noteId in updatedIndex.notes || removedNoteIds.delete(noteId);
    for (let pageId of [...removedPageIds] as Dynamic)
      readIndexPages(updatedIndex.pages).some(
        (page?: Dynamic): Dynamic => page.id === pageId,
      ) || removedPageIds.delete(pageId);
    for (let boardPath of [...locallyDeletedBoards] as Dynamic)
      boardPath in updatedIndex.boards || locallyDeletedBoards.delete(boardPath);
    loadedFiles[canvasMetadataFile] =
      files[canvasMetadataFile] ??
      loadedFiles[canvasMetadataFile] ??
      "";
    queuedEdits && publisher.commit();
    notifySave();
  }
  function replaceDocument(nextDocument?: Dynamic): Dynamic {
    state = nextDocument;
    rememberArtboards(nextDocument.content.files);
    notifyContent(false);
    scheduleLocalSave();
  }
  let shouldHoldRemoteFile: Dynamic = (relativePath?: Dynamic): Dynamic =>
      documentOptions.holdRemote?.(relativePath) === true,
    hasUnsavedFileEdits: Dynamic = (relativePath?: Dynamic): Dynamic =>
      state.content.files[relativePath] !== loadedFiles[relativePath];
  function adoptRemoteFiles(files?: Dynamic): Dynamic {
    for (let absolutePath of [...publisher.unsendable().keys()] as Dynamic) {
      let relativePath: Dynamic = fromProjectContentPath(
        absolutePath,
        "design",
      );
      relativePath !== undefined &&
        (files[relativePath] === undefined ||
          files[relativePath] === savedFiles[relativePath]) &&
        publisher.withdraw(absolutePath);
    }
    let content: Dynamic = composeFromFiles(files);
    loadedFiles = {
      ...loadedFiles,
      [canvasMetadataFile]: content.files[canvasMetadataFile],
    };
    let title: Dynamic =
      normalizeDocumentTitle(indexState.get().title.trim()) ??
      state.title;
    state = {
      ...state,
      title: title,
      content: content,
    };
    notifyContent(true);
  }
  async function handleRemoteUpdate(update?: Dynamic): Promise<Dynamic> {
    if (loadState === "failed") {
      let retryDelayMs: Dynamic =
        lastLoadFailure === undefined
          ? 0
          : getRestartDelay(
              lastLoadFailure.error,
              update,
              DESIGN_INDEX_FILE_PATH,
              timers.now() - lastLoadFailure.at,
            );
      retryDelayMs === 0
        ? retryFailedLoad()
        : retryDelayMs !== undefined && scheduleLoadRetry(retryDelayMs);
    }
    loadState === "loading" &&
      (await (retryLoadPromise ?? initialLoadPromise).catch((): Dynamic => {}));
    if (disposed || loadState !== "live") return;
    let applyStartedAt: Dynamic = timers.now(),
      flushLocalSave: Dynamic = (): Dynamic => {
        localSaveTimer !== undefined &&
          (timers.clearTimeout(localSaveTimer),
          (localSaveTimer = undefined),
          publishLocalChanges());
      };
    flushLocalSave();
    let retainedDeletedArtboards: Dynamic = new Set(),
      changes: Dynamic = update.changed.filter(
        (change?: Dynamic): Dynamic =>
          change.sha256 === null
            ? liveHashes.has(change.path) ||
              (publishedHashes.get(change.path) ?? null) !== null
            : liveHashes.get(change.path) !== change.sha256,
      ),
      possibleStaleChanges: Dynamic = changes.filter(
        (change?: Dynamic): Dynamic =>
          change.path !== DESIGN_INDEX_FILE_PATH &&
          ownChangedHashes.has(change.path) &&
          ownChangedHashes.get(change.path) ===
            (liveHashes.get(change.path) ?? null) &&
          change.sha256 !== ownChangedHashes.get(change.path),
      );
    if (possibleStaleChanges.length > 0) {
      let liveSha: Dynamic = documentOptions.port.liveSha,
        wroteSinceAdopt: Dynamic = documentOptions.port.wroteSinceAdopt,
        safeWriteCheck: Dynamic =
          typeof wroteSinceAdopt != "function"
            ? undefined
            : {
                call: (_receiver?: Dynamic, filePath?: Dynamic): Dynamic => {
                  try {
                    return (
                      wroteSinceAdopt.call(documentOptions.port, filePath) === true
                    );
                  } catch {
                    return false;
                  }
                },
              },
        readShaAfterOwnWrite: Dynamic = (filePath?: Dynamic): Dynamic =>
          safeWriteCheck !== undefined && safeWriteCheck.call(documentOptions.port, filePath) === true
            ? liveSha?.call(documentOptions.port, filePath)
            : undefined,
        listedShas: Dynamic;
      safeWriteCheck !== undefined &&
        possibleStaleChanges.some(
          (change?: Dynamic): Dynamic =>
            safeWriteCheck.call(documentOptions.port, change.path) === true &&
            liveSha?.call(documentOptions.port, change.path) === undefined,
        ) &&
        (listedShas = await trackedPort.list().then(
          (listing?: Dynamic): Dynamic =>
            new Map(
              listing.map(
                (file?: Dynamic): Dynamic => [file.path, file.sha256],
              ),
            ),
          (): Dynamic => {},
        ));
      if (disposed) return;
      let latestShas: Dynamic = {
        get: (filePath?: Dynamic): Dynamic => {
          if (
            safeWriteCheck === undefined ||
            safeWriteCheck.call(documentOptions.port, filePath) !== true
          )
            return;
          let currentSha: Dynamic = readShaAfterOwnWrite(filePath);
          return currentSha !== undefined
            ? currentSha
            : listedShas === undefined
              ? undefined
              : (listedShas.get(filePath) ?? null);
        },
      };
      {
        let staleChanges: Dynamic = possibleStaleChanges.filter(
          (change?: Dynamic): Dynamic =>
            latestShas.get(change.path) !== undefined &&
            (latestShas.get(change.path) ?? null) ===
              ownChangedHashes.get(change.path),
        );
        changes = changes.filter(
          (change?: Dynamic): Dynamic => !staleChanges.includes(change),
        );
        for (let change of staleChanges as Dynamic) {
          let relativePath: Dynamic = fromProjectContentPath(
            change.path,
            "design",
          );
          change.sha256 === null &&
            relativePath !== undefined &&
            isArtboardFile(relativePath) &&
            retainedDeletedArtboards.add(relativePath);
        }
      }
    }
    for (let change of changes as Dynamic)
      publishedHashes.set(change.path, change.sha256);
    let removedPaths: Dynamic = new Set(),
      pathsToRead: Dynamic = [],
      clashingPaths: Dynamic = [];
    for (let change of changes as Dynamic) {
      if (change.path === DESIGN_INDEX_FILE_PATH) continue;
      let relativePath: Dynamic = fromProjectContentPath(
        change.path,
        "design",
      );
      if (relativePath !== undefined) {
        if (change.sha256 === null) {
          isArtboardFile(relativePath) &&
            !fileDirtyVersions.has(relativePath) &&
            fileDirtyVersions.set(
              relativePath,
              cloneIndexValue(indexState.get().boards[relativePath]),
            );
          if (relativePath in state.content.files) {
            if (clashes.noteRemoteVersion(relativePath, null)) continue;
            if (shouldHoldRemoteFile(relativePath)) {
              clashes.hold(relativePath);
              continue;
            }
            if (isArtboardFile(relativePath) && clashes.hasLocalBoardChanges(relativePath)) {
              clashingPaths.push(relativePath);
              continue;
            }
          }
          removedPaths.add(relativePath);
          liveHashes.delete(change.path);
          clashes.dropHold(relativePath);
          continue;
        }
        fileDirtyVersions.delete(relativePath);
        if (
          validateListedDesignFile({
            path: change.path,
            size: 0,
          }) !== null &&
          liveHashes.get(change.path) !== change.sha256
        ) {
          if (clashes.noteRemoteVersion(relativePath, change.sha256)) continue;
          if (shouldHoldRemoteFile(relativePath)) {
            clashes.hold(relativePath);
            continue;
          }
          if (clashes.hasLocalBoardChanges(relativePath)) {
            clashingPaths.push(relativePath);
            continue;
          }
          pathsToRead.push(relativePath);
        }
      }
    }
    let readFilesByPath: Dynamic = await readFiles(pathsToRead),
      indexChange: Dynamic = changes.find(
        (change?: Dynamic): Dynamic => change.path === DESIGN_INDEX_FILE_PATH,
      ),
      indexMerged: Dynamic = false;
    if (
      indexChange !== undefined &&
      indexChange.sha256 !== null &&
      liveHashes.get(DESIGN_INDEX_FILE_PATH) !== indexChange.sha256
    )
      try {
        flushLocalSave();
        notifyIndexMerge(await indexState.reloadAndMerge());
        liveHashes.set(DESIGN_INDEX_FILE_PATH, indexChange.sha256);
        indexMerged = true;
      } catch (error: Dynamic) {
        console.warn(
          "design (files): canvas.json changed but could not be read \u2014 " +
            (error instanceof Error ? error.message : String(error)),
        );
      }
    let newBoardPaths: Dynamic = indexMerged
        ? Object.keys(indexState.get().boards)
            .filter(
              (relativePath?: Dynamic): Dynamic =>
                !(relativePath in state.content.files) &&
                !pathsToRead.includes(relativePath) &&
                !removedPaths.has(relativePath) &&
                (publishedHashes.get(
                  toProjectContentPath(relativePath),
                ) ?? null) !== null &&
                validateListedDesignFile({
                  path: toProjectContentPath(relativePath),
                  size: 0,
                }) !== null,
            )
            .slice(
              0,
              Math.max(
                0,
                MAX_LISTED_PROJECT_FILES -
                  1 -
                  Object.keys(state.content.files).length,
              ),
            )
        : [],
      newBoards: Dynamic = await readFiles(newBoardPaths);
    if (disposed) return;
    flushLocalSave();
    let nextFiles: Dynamic = {
        ...state.content.files,
      },
      shouldRecompose: Dynamic = indexMerged;
    for (let boardPath of newBoardPaths as Dynamic)
      newBoards[boardPath] === undefined ||
        boardPath in nextFiles ||
        ((nextFiles[boardPath] = newBoards[boardPath]),
        (loadedFiles[boardPath] = newBoards[boardPath]),
        (savedFiles[boardPath] = newBoards[boardPath]),
        liveHashes.set(
          toProjectContentPath(boardPath),
          publishedHashes.get(toProjectContentPath(boardPath)),
        ));
    let recoveredEdits: Dynamic = [];
    for (let relativePath of removedPaths as Dynamic)
      relativePath in nextFiles &&
        (delete nextFiles[relativePath],
        delete loadedFiles[relativePath],
        delete savedFiles[relativePath],
        clashes.forgetOverwrittenEdit(relativePath),
        (shouldRecompose = true));
    for (let relativePath of pathsToRead as Dynamic) {
      if (readFilesByPath[relativePath] === undefined) continue;
      if (
        hasUnsavedFileEdits(relativePath) ||
        (nextFiles[relativePath] !== undefined &&
          savedFiles[relativePath] !== undefined &&
          nextFiles[relativePath] !== savedFiles[relativePath] &&
          nextFiles[relativePath] !== readFilesByPath[relativePath])
      ) {
        clashingPaths.push(relativePath);
        continue;
      }
      let recoveredEdit: Dynamic = clashes.reapplyOverwrittenEdit(
        relativePath,
        readFilesByPath[relativePath],
      );
      recoveredEdit !== undefined && recoveredEdits.push(recoveredEdit);
      nextFiles[relativePath] = readFilesByPath[relativePath];
      loadedFiles[relativePath] = readFilesByPath[relativePath];
      savedFiles[relativePath] = readFilesByPath[relativePath];
      liveHashes.set(
        toProjectContentPath(relativePath),
        publishedHashes.get(toProjectContentPath(relativePath)) ??
          liveHashes.get(toProjectContentPath(relativePath)),
      );
      shouldRecompose = true;
    }
    shouldRecompose && adoptRemoteFiles(nextFiles);
    for (let boardPath of retainedDeletedArtboards as Dynamic) {
      fileDirtyVersions.delete(boardPath);
      delete loadedFiles[canvasMetadataFile];
    }
    for (let edit of recoveredEdits as Dynamic)
      clashes.offerOverwrittenEditNotice(edit);
    for (let relativePath of clashingPaths as Dynamic)
      await clashes.handleBoardClash(
        toProjectContentPath(relativePath),
        publishedHashes.get(toProjectContentPath(relativePath)) ??
          null,
        "remote-while-editing",
      );
    documentOptions.debug?.event("apply", {
      to: update.to.version,
      rows: update.changed.map((change?: Dynamic): Dynamic => change.path),
      alreadyTrue: update.changed.length - changes.length,
      boardsReread: pathsToRead.filter(
        (relativePath?: Dynamic): Dynamic => readFilesByPath[relativePath] !== undefined,
      ),
      removed: [...removedPaths],
      held: clashes.heldPaths(),
      folded: clashingPaths,
      indexMerged: indexChange !== undefined,
      recomposed: shouldRecompose,
      ms: timers.now() - applyStartedAt,
    });
  }
  let latestFileSha: Dynamic = (absolutePath?: Dynamic): Dynamic =>
      absolutePath === DESIGN_INDEX_FILE_PATH
        ? (liveHashes.get(DESIGN_INDEX_FILE_PATH) ?? null)
        : publishedHashes.has(absolutePath)
          ? (publishedHashes.get(absolutePath) ?? null)
          : (liveHashes.get(absolutePath) ?? null);
  function applyStashedContent(stash?: Dynamic): Dynamic {
    let restoredFiles: Dynamic = {
        ...state.content.files,
      },
      boardClashOffers: Dynamic = [],
      skippedPaths: Dynamic = [],
      conflictingBoardEdits: Dynamic = [],
      duplicateBoardEdits: Dynamic = [];
    for (let edit of stash.edits as Dynamic) {
      let relativePath: Dynamic =
        edit.path === DESIGN_INDEX_FILE_PATH
          ? undefined
          : fromProjectContentPath(edit.path, "design");
      if (relativePath === undefined) continue;
      let remoteSha: Dynamic = latestFileSha(edit.path);
      if (edit.text === null) {
        edit.base !== null && edit.base === remoteSha && relativePath in restoredFiles
          ? delete restoredFiles[relativePath]
          : remoteSha !== null && skippedPaths.push(relativePath);
        continue;
      }
      if (edit.base === remoteSha) {
        restoredFiles[relativePath] = edit.text;
        continue;
      }
      if (
        isArtboardFile(relativePath) &&
        remoteSha !== null &&
        documentOptions.sameBoardRule === "first"
      ) {
        conflictingBoardEdits.push({
          p: relativePath,
          text: edit.text,
        });
        continue;
      }
      if (
        documentOptions.sameBoardRule === "last" &&
        isArtboardFile(relativePath) &&
        edit.base === null &&
        remoteSha !== null
      ) {
        duplicateBoardEdits.push({
          p: relativePath,
          text: edit.text,
        });
        continue;
      }
      if (documentOptions.sameBoardRule === "last") {
        restoredFiles[relativePath] = edit.text;
        remoteSha === null
          ? (liveHashes.delete(edit.path),
            fileDirtyVersions.delete(relativePath))
          : liveHashes.set(edit.path, remoteSha);
        delete loadedFiles[relativePath];
        continue;
      }
      if (isArtboardFile(relativePath) && remoteSha !== null) {
        boardClashOffers.push({
          p: relativePath,
          treePath: edit.path,
          theirsSha: remoteSha,
          theirs: state.content.files[relativePath],
        });
        restoredFiles[relativePath] = edit.text;
        continue;
      }
      skippedPaths.push(relativePath);
    }
    let stashedIndexEdit: Dynamic = stash.edits.find(
      (edit?: Dynamic): Dynamic => edit.path === DESIGN_INDEX_FILE_PATH,
    );
    if (stashedIndexEdit !== undefined && stashedIndexEdit.text !== null) {
      let parsedIndex: Dynamic;
      try {
        parsedIndex = normalizeDesignIndex(JSON.parse(stashedIndexEdit.text));
      } catch {
        parsedIndex = undefined;
      }
      if (
        parsedIndex !== undefined &&
        stashedIndexEdit.base !== null &&
        stashedIndexEdit.base === (liveHashes.get(DESIGN_INDEX_FILE_PATH) ?? null)
      ) {
        let restoredIndex: Dynamic = parsedIndex;
        indexState.update(
          (index?: Dynamic): Dynamic =>
            replaceIndexObjectProperties(
              index,
              cloneIndexValue(restoredIndex) as DataRecord,
            ),
        );
        publisher.commit();
      } else skippedPaths.push("the canvas layout");
    }
    adoptRemoteFiles(restoredFiles);
    for (let offer of boardClashOffers as Dynamic)
      clashes.offerBoardClashNotice(
        offer.p,
        offer.treePath,
        offer.theirsSha,
        offer.theirs,
        "this is your unsaved edit from before the page reloaded, and the board has changed since",
      );
    for (let edit of duplicateBoardEdits as Dynamic)
      notice(
        "Someone else made \u201C" +
          edit.p.replace(/\.dc\.html$/, "") +
          "\u201D meanwhile; yours is \u201C" +
          clashes.createMyCopy(edit.p, edit.text, true).replace(
            /\.dc\.html$/,
            "",
          ) +
          "\u201D.",
      );
    for (let edit of conflictingBoardEdits as Dynamic)
      notice(
        edit.p.replace(/\.dc\.html$/, "") +
          " changed remotely; your unsaved edit is in \u201C" +
          clashes.createMyCopy(edit.p, edit.text).replace(/\.dc\.html$/, "") +
          "\u201D",
      );
    skippedPaths.length > 0 &&
      notice(
        "Some of your unsaved edits from before the page reloaded were not put back, because they changed since: " +
          skippedPaths
            .map(
              (relativePath?: Dynamic): Dynamic =>
                relativePath.replace(/\.dc\.html$/, ""),
            )
            .join(", ") +
          ".",
      );
    documentOptions.debug?.event("stash-restored", {
      files: stash.edits.length,
      asked: boardClashOffers.map((offer?: Dynamic): Dynamic => offer.p),
      notBack: skippedPaths,
    });
    scheduleLocalSave();
    publisher.stashRestored();
  }
  function releaseHeldFocusedFiles(focusedPath?: Dynamic): Dynamic {
    for (let relativePath of clashes.heldPaths() as Dynamic)
      (artboardStorePath(relativePath) !== focusedPath &&
        relativePath !== focusedPath) ||
        shouldHoldRemoteFile(relativePath) ||
        clashes.releaseHeldFile(relativePath);
  }
  let retryLoadPromise: Dynamic;
  function retryFailedLoad(isManualRetry: Dynamic = false): Dynamic {
    if (!(loadState !== "failed" || disposed)) {
      loadRetryTimer !== undefined &&
        (timers.clearTimeout(loadRetryTimer), (loadRetryTimer = undefined));
      loadState = "loading";
      for (let listener of [...loadListeners] as Dynamic) listener();
      notifySave();
      retryLoadPromise = loadFiles(isManualRetry);
    }
  }
  let hasLocalEditsToCollect: Dynamic = (): Dynamic =>
    localSaveTimer !== undefined || Object.keys(state.content.files).some(hasUnsavedFileEdits);
  function flushBeforeExit(): Dynamic {
    let hasLocalEdits: Dynamic = hasLocalEditsToCollect();
    localSaveTimer !== undefined &&
      (timers.clearTimeout(localSaveTimer), (localSaveTimer = undefined));
    hasLocalEdits && loadState === "live" && publishLocalChanges();
    publisher.flushNow();
  }
  let onVisibilityChange: Dynamic = (): Dynamic => {
      typeof document !== "undefined" &&
        (document as Dynamic).visibilityState !== "visible" &&
        flushBeforeExit();
    },
    onPageHide: Dynamic = (): Dynamic => flushBeforeExit(),
    hasPendingSave: Dynamic = (): Dynamic =>
      syncState.dirty > 0 ||
      syncState.inFlight ||
      localSaveTimer !== undefined ||
      syncState.unsendable !== undefined,
    onBeforeUnload: Dynamic = (event?: Dynamic): Dynamic => {
      hasPendingSave() &&
        (flushBeforeExit(), event.preventDefault(), (event.returnValue = ""));
    },
    canListenToVisibility: Dynamic =
      typeof document !== "undefined" &&
      typeof (document as Dynamic).addEventListener == "function";
  typeof addEventListener == "function" &&
    (canListenToVisibility &&
      (document as Dynamic).addEventListener("visibilitychange", onVisibilityChange),
    addEventListener("pagehide", onPageHide),
    canWrite && addEventListener("beforeunload", onBeforeUnload));
  let initialLoadPromise: Dynamic = loadFiles();
  return {
    saveMode: (): Dynamic => "auto",
    state: (): Dynamic => state,
    content: (): Dynamic => state.content,
    title: (): Dynamic => state.title,
    comments: (): Dynamic => state.comments,
    dirty: hasPendingSave,
    readOnly: (): Dynamic => !canWrite,
    saveState: getSaveState,
    commentSync: (): Dynamic => ({
      status: "idle",
      pending: 0,
    }),
    pendingCommentIds: (): Dynamic => new Set(),
    retryCommentPublish(): Dynamic {},
    setContent(content: Dynamic): Dynamic {
      content !== state.content &&
        (replaceDocument({
          ...state,
          content: content,
        }),
        recordEdit());
    },
    updateContent(update: Dynamic, updateOptions: Dynamic): Dynamic {
      let content: Dynamic = update(state.content);
      content !== state.content &&
        (replaceDocument({
          ...state,
          content: content,
        }),
        updateOptions?.auto !== true && recordEdit());
    },
    setTitle(newTitle: Dynamic): Dynamic {
      let title: Dynamic = normalizeNewDocumentTitle(newTitle);
      title.length === 0 ||
        title === state.title ||
        (replaceDocument({
          ...state,
          title: title,
        }),
        recordEdit());
    },
    addComment: (): Dynamic => {},
    removeComment(): Dynamic {},
    documentBytes: (): Dynamic =>
      Object.values(state.content.files).reduce(
        (total?: Dynamic, content?: Dynamic): Dynamic => total + content.length,
        0,
      ),
    async save(): Promise<Dynamic> {
      if (loadState === "failed") return retryFailedLoad(true);
      flushBeforeExit();
    },
    stashOffer: (): Dynamic =>
      stashOffer.current === undefined
        ? undefined
        : {
            at: stashOffer.current.at,
          },
    restoreStash(): Dynamic {
      stashOffer.restore();
    },
    discardStash: stashOffer.discard,
    restoreCount: stashOffer.restoreCount,
    subscribe(listener: Dynamic): Dynamic {
      contentListeners.add(listener);
      return (): Dynamic => {
        contentListeners.delete(listener);
      };
    },
    subscribeSave(listener: Dynamic): Dynamic {
      saveListeners.add(listener);
      return (): Dynamic => {
        saveListeners.delete(listener);
      };
    },
    debugState(): Dynamic {
      let liveSha: Dynamic = documentOptions.port.liveSha,
        conflictedFiles: Dynamic = publisher.conflicted?.() ?? new Map(),
        fileDetails: Dynamic = [...liveHashes.keys()]
          .sort()
          .map((absolutePath?: Dynamic): Dynamic => {
            let relativePath: Dynamic =
                absolutePath === DESIGN_INDEX_FILE_PATH
                  ? canvasMetadataFile
                  : absolutePath.startsWith(projectPathPrefix)
                    ? absolutePath.slice(projectPathPrefix.length)
                    : absolutePath,
              fileText: Dynamic = state.content.files[relativePath],
              remoteSha: Dynamic = liveSha?.call(documentOptions.port, absolutePath),
              statuses: Dynamic = [];
            relativePath !== canvasMetadataFile &&
              hasUnsavedFileEdits(relativePath) &&
              statuses.push("dirty");
            syncState.inFlight &&
              statuses.includes("dirty") &&
              statuses.push("in-flight");
            conflictedFiles.has(absolutePath) && statuses.push("conflicted");
            clashes.isHeld(relativePath) && statuses.push("held");
            clashes.hasClash(relativePath) &&
              !statuses.includes("conflicted") &&
              statuses.push("conflicted");
            remoteSha !== undefined &&
              remoteSha !== liveHashes.get(absolutePath) &&
              statuses.push("behind");
            return {
              path: absolutePath,
              sha: liveHashes.get(absolutePath) ?? null,
              ...(remoteSha !== undefined
                ? {
                    liveSha: remoteSha,
                  }
                : {}),
              ...(typeof fileText == "string"
                ? {
                    size: fileText.length,
                  }
                : {}),
              state: statuses.join(" "),
            };
          }),
        dirtyPaths: Dynamic = Object.keys(state.content.files)
          .filter(
            (relativePath?: Dynamic): Dynamic =>
              relativePath !== canvasMetadataFile && hasUnsavedFileEdits(relativePath),
          )
          .map(
            (relativePath?: Dynamic): Dynamic =>
              toProjectContentPath(relativePath),
          );
      return {
        files: fileDetails,
        queue: {
          dirty:
            localSaveTimer !== undefined && dirtyPaths.length === 0
              ? ["(a flush is scheduled)"]
              : dirtyPaths,
          inFlight: syncState.inFlight,
          ...(syncState.lastError !== undefined
            ? {
                lastError:
                  syncState.lastError +
                  (syncState.backoffUntil !== undefined
                    ? " \xB7 retrying in " +
                      String(
                        Math.max(
                          0,
                          Math.round(
                            (syncState.backoffUntil - timers.now()) / 1e3,
                          ),
                        ),
                      ) +
                      " s"
                    : ""),
              }
            : {}),
          conflicted: [...conflictedFiles.keys()],
          note: "a refused save is re-read and resent with backoff for about 10 s, then reported stuck (and stashed) and retried slowly",
        },
      };
    },
    reconciles: (): Dynamic => undoHistory,
    editorSaw: rememberManifestDeletions,
    retrySave: (): Dynamic => publisher.retryNow(),
    maxFileBytes: MAX_DESIGN_FILE_BYTES,
    loadState: (): Dynamic => loadState,
    shown: (): Dynamic => loadState === "live",
    cachedSettled: (): Dynamic => false,
    subscribeLoad(listener: Dynamic): Dynamic {
      loadListeners.add(listener);
      return (): Dynamic => {
        loadListeners.delete(listener);
      };
    },
    healthSource(): Dynamic {
      let getHealthLoadState: Dynamic = (): Dynamic =>
          loadState === "failed" &&
          loadRetryTimer !== undefined &&
          loadRetryCount < FILE_READ_MAX_RETRIES &&
          lastLoadFailure !== undefined &&
          timers.now() - (firstLoadFailureAt ?? lastLoadFailure.at) < FILE_READ_TIMEOUT_MS
            ? "loading"
            : loadState,
        isRetryableSaveError: Dynamic = (): Dynamic =>
          loadState === "live" &&
          canWrite &&
          syncState.stuck === undefined &&
          syncState.unsendable === undefined &&
          syncState.lastError !== undefined,
        saveStateForHealth: Dynamic = (saveState?: Dynamic): Dynamic =>
          saveState.status === "error" && isRetryableSaveError()
            ? {
                status: "saving",
              }
            : saveState;
      return {
        loadState: getHealthLoadState,
        cachedSettled: (): Dynamic => false,
        subscribeLoad: (listener?: Dynamic): Dynamic => (
          loadListeners.add(listener),
          (): Dynamic => {
            loadListeners.delete(listener);
          }
        ),
        saveState: (): Dynamic => saveStateForHealth(getSaveState()),
        subscribeSave: (listener?: Dynamic): Dynamic => {
          let notifyHealthListener: Dynamic = (saveState?: Dynamic): Dynamic =>
            listener(saveStateForHealth(saveState));
          saveListeners.add(notifyHealthListener);
          return (): Dynamic => {
            saveListeners.delete(notifyHealthListener);
          };
        },
        syncDetail: (): Dynamic => {
          let errorCode: Dynamic = syncState.stuck?.code ?? syncState.lastError;
          return errorCode !== undefined
            ? {
                lastError: {
                  code:
                    FILES_ERROR_DATABASE_ALIASES[String(errorCode)] ??
                    String(errorCode),
                },
              }
            : {};
        },
        dirty: (): Dynamic => hasPendingSave(),
      };
    },
    flushNow: flushBeforeExit,
    retryLoad: retryFailedLoad,
    storeUntouched: (): Dynamic => false,
    releaseHold: releaseHeldFocusedFiles,
    theirsOnItsWay: (relativePath?: Dynamic): Dynamic =>
      clashes.isHeld(relativePath) ||
      hasNewerPublishedHash(toProjectContentPath(relativePath)),
    syncDetail: (): Dynamic => ({
      pending: syncState.dirty + (localSaveTimer !== undefined ? 1 : 0),
      inflight: syncState.inFlight ? DESIGN_INDEX_FILE_PATH : null,
      flights: syncState.inFlight ? 1 : 0,
      ...(lastSaveAt !== undefined
        ? {
            lastSyncedAt: lastSaveAt,
          }
        : {}),
      ...(lastSaveError !== undefined
        ? {
            lastError: lastSaveError,
          }
        : {}),
    }),
    dispose(): Dynamic {
      disposed = true;
      clashes.dispose();
      fileSaveTimer !== undefined &&
        (timers.clearTimeout(fileSaveTimer), (fileSaveTimer = undefined));
      loadRetryTimer !== undefined &&
        (timers.clearTimeout(loadRetryTimer), (loadRetryTimer = undefined));
      localSaveTimer !== undefined && timers.clearTimeout(localSaveTimer);
      typeof removeEventListener == "function" &&
        (canListenToVisibility &&
          (document as Dynamic).removeEventListener(
            "visibilitychange",
            onVisibilityChange,
          ),
        removeEventListener("pagehide", onPageHide),
        removeEventListener("beforeunload", onBeforeUnload));
      publisher.dispose();
    },
    ready: initialLoadPromise,
    applyRemote: handleRemoteUpdate,
    heldShas: (): Dynamic => liveHashes,
    async settle(): Promise<Dynamic> {
      flushBeforeExit();
      await publisher.settle();
    },
    queue: publisher,
    index: (): Dynamic => indexState.get(),
    indexSaved: (): Dynamic => indexState.baseSha() !== null,
    listedBoards(): Dynamic {
      let normalizedIndex: Dynamic = normalizeDesignIndex(
          indexState.get(),
        ),
        files: Dynamic = state.content.files,
        designBoards: Dynamic = Object.fromEntries(
          Object.entries(normalizedIndex.boards).filter(
            ([relativePath]: Dynamic): Dynamic =>
              isArtboardFile(relativePath) &&
              !isDesignSystemFile(relativePath),
          ),
        ),
        listedPaths: Dynamic = new Set(Object.keys(designBoards));
      if (hasPartialListing)
        return {
          listed: listedPaths,
          awaited: [],
        };
      let remainingSlots: Dynamic =
          MAX_LISTED_PROJECT_FILES -
          1 -
          Object.keys(files).length,
        awaitedPaths: Dynamic = [];
      for (let relativePath of orderedDesignMapKeys(
        normalizedIndex.order,
        designBoards,
      ) as Dynamic) {
        if (awaitedPaths.length >= remainingSlots) break;
        !(relativePath in files) &&
          (publishedHashes.get(toProjectContentPath(relativePath)) ??
            null) === null &&
          !knownArtboardFiles.has(relativePath) &&
          !fileDirtyVersions.has(relativePath) &&
          validateListedDesignFile({
            path: toProjectContentPath(relativePath),
            size: 0,
          }) !== null &&
          awaitedPaths.push(relativePath);
      }
      return {
        listed: listedPaths,
        awaited: buildSelectedBoardsDocument(normalizedIndex, awaitedPaths),
      };
    },
  };
}
export {
  base64ToBytes,
  bytesToBase64,
  canSaveDesignFile,
  countPortContentBytes,
  createFilesDesignDocument,
  describeIndexMergeConflict,
  describeMissingDesignFile,
  describeReservedDesignFilename,
  describeSamePropertyConflict,
  describeUnsavableDesignFile,
  describeUnsupportedDesignFile,
  DESIGN_BOOT_MAX_ATTEMPTS,
  DESIGN_BOOT_MAX_WAIT_MS,
  DESIGN_FILE_MIME_TYPES,
  DESIGN_INDEX_FILE_PATH,
  DESIGN_RESTART_DELAY_MS,
  DESIGN_RESTART_MAX_ATTEMPTS,
  encodeDesignPortFile,
  FILE_READ_MAX_RETRIES,
  FILE_READ_TIMEOUT_MS,
  FILES_ERROR_DATABASE_ALIASES,
  filesDocumentTimers,
  getDesignFileContentType,
  hasUnstashedUnsendableEdits,
  isMissingRequiredDesignFile,
  validateListedDesignFile,
};
export function installPlatformFilesDesignDocument(): () => void {
  return () => {
    hasUnstashedUnsendableEdits = (saveState?: Dynamic): Dynamic =>
      saveState.unsendable !== undefined && saveState.unsendableStashed !== true;
    filesDocumentTimers = {
      setTimeout: (run?: Dynamic, delayMs?: Dynamic): Dynamic =>
        setTimeout(run, delayMs),
      clearTimeout: (timer?: Dynamic): Dynamic => clearTimeout(timer),
      now: (): Dynamic => Date.now(),
    };
    DESIGN_FILE_MIME_TYPES = {
      jsx: "text/javascript",
      cjs: "text/javascript",
      tsx: "text/plain",
      ts: "text/plain",
    };
    canSaveDesignFile = (filePath?: Dynamic): Dynamic =>
      getDesignFileContentType(filePath) !== null;
    describeUnsupportedDesignFile = (filePath?: Dynamic): Dynamic =>
      "\u201C" +
      filePath +
      "\u201D can\u2019t be saved with this canvas. Add it as a PNG, JPEG, WebP or SVG instead.";
    isMissingRequiredDesignFile = (filePath?: Dynamic): Dynamic =>
      isReservedProjectPath(
        "design",
        projectPathPrefix + filePath,
      );
    describeReservedDesignFilename = (filePath?: Dynamic): Dynamic =>
      "\u201C" +
      filePath +
      "\u201D won\u2019t be saved under that name. Give the file another name.";
    describeMissingDesignFile = (filePath?: Dynamic): Dynamic =>
      "\u201C" +
      filePath +
      "\u201D is missing from this canvas. Add it again under another name.";
    describeUnsavableDesignFile = (filePath?: Dynamic): Dynamic =>
      isMissingRequiredDesignFile(filePath)
        ? describeMissingDesignFile(filePath)
        : describeUnsupportedDesignFile(filePath);
    DESIGN_INDEX_FILE_PATH = projectMetadataPaths.design;
    DESIGN_RESTART_MAX_ATTEMPTS = 6;
    DESIGN_RESTART_DELAY_MS = 5e3;
    DESIGN_BOOT_MAX_ATTEMPTS = 6;
    DESIGN_BOOT_MAX_WAIT_MS = 15e3;
    bytesToBase64 = (items?: Dynamic): Dynamic => {
      let text: Dynamic = "";
      for (let index: Dynamic = 0; index < items.length; index += 32768)
        text += String.fromCharCode(...items.subarray(index, index + 32768));
      return btoa(text);
    };
    base64ToBytes = (base64?: Dynamic): Dynamic =>
      Uint8Array.from(
        atob(base64),
        (character?: Dynamic): Dynamic => character.charCodeAt(0),
      );
    FILE_READ_MAX_RETRIES = 3;
    FILE_READ_TIMEOUT_MS = 3e4;
    FILES_ERROR_DATABASE_ALIASES = {
      too_large: "refused",
      invalid_content: "invalid_argument",
      read_only_path: "invalid_argument",
      not_declared: "invalid_argument",
      upstream_error: "unavailable",
      rate_limited: "resource_exhausted",
      not_writer: "not_granted",
      capability_disabled: "capability_disabled",
    };
  };
}
